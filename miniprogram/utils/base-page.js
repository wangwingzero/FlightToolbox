/**
 * 统一的页面基类 - 解决重复代码问题
 * 严格遵循ES5语法，确保小程序兼容性
 * 
 * 功能：
 * - 统一主题管理
 * - 统一错误处理
 * - 统一数据加载
 * - 统一生命周期管理
 */

var errorHandler = require('./error-handler.js');
var dataLoader = require('./data-loader.js');

/**
 * 页面基类混入对象
 */
var BasePage = {
  /**
   * 默认数据
   */
  data: {
    loading: false,
    error: null
  },

  /**
   * 页面加载时的统一处理
   */
  onLoad: function(options) {
    console.log('📄 BasePage onLoad');
    this.initializeErrorHandler();
    
    // 如果子页面有自定义onLoad，调用它
    if (this.customOnLoad && typeof this.customOnLoad === 'function') {
      this.customOnLoad.call(this, options);
    }
  },

  /**
   * 页面显示时的统一处理
   */
  onShow: function() {
    console.log('📄 BasePage onShow');
    
    // 如果子页面有自定义onShow，调用它
    if (this.customOnShow && typeof this.customOnShow === 'function') {
      this.customOnShow.call(this);
    }
  },

  /**
   * 页面隐藏时的统一处理
   */
  onHide: function() {
    console.log('📄 BasePage onHide');
    
    // 如果子页面有自定义onHide，调用它
    if (this.customOnHide && typeof this.customOnHide === 'function') {
      this.customOnHide.call(this);
    }
  },

  /**
   * 页面卸载时的统一处理
   */
  onUnload: function() {
    console.log('📄 BasePage onUnload - 开始页面销毁流程');
    
    // 立即标记页面正在销毁，防止后续的setData操作
    this._isDestroying = true;
    
    // 等待当前setData操作完成，然后标记页面已销毁
    var self = this;
    var maxWaitTime = 100; // 最多等待100ms
    var startTime = Date.now();
    
    var waitForSetData = function() {
      if (!self._setDataInProgress || (Date.now() - startTime) > maxWaitTime) {
        // setData完成或超时，完全标记为销毁
        self.isDestroyed = true;
        
        // 清空setData队列
        if (self._setDataQueue) {
          self._setDataQueue = [];
        }
        
        self.cleanup();
        
        // 如果子页面有自定义onUnload，调用它
        if (self.customOnUnload && typeof self.customOnUnload === 'function') {
          try {
            self.customOnUnload.call(self);
          } catch (error) {
            console.error('❌ 自定义onUnload执行失败:', error);
          }
        }
        
        console.log('📄 BasePage onUnload完成 - 页面销毁流程结束');
      } else {
        // 继续等待
        setTimeout(waitForSetData, 10);
      }
    };
    
    waitForSetData();
  },


  /**
   * 初始化错误处理器
   */
  initializeErrorHandler: function() {
    var self = this;
    
    // 绑定全局错误处理
    this.handleError = function(error, context, showToast) {
      return errorHandler.handleError(error, context, showToast);
    };
    
    // 绑定数据加载失败处理
    this.handleDataLoadError = function(error, options) {
      var context = (options && options.context) || '数据加载';
      var showToast = (options && options.showToast) !== false;
      
      console.error(context + '失败:', error);
      
      self.setData({ 
        loading: false,
        error: error.message || '操作失败'
      });
      
      if (showToast) {
        wx.showToast({
          title: context + '失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
      
      return { success: false, error: error };
    };
  },

  /**
   * 统一的数据加载方法
   */
  loadDataWithLoading: function(loadFunction, options) {
    var self = this;
    var config = options || {};
    var loadingKey = config.loadingKey || 'loading';
    var dataKey = config.dataKey || 'data';
    var context = config.context || '数据加载';
    
    // 设置loading状态
    var loadingData = {};
    loadingData[loadingKey] = true;
    self.setData(loadingData);
    
    // 清除之前的错误
    self.setData({ error: null });
    
    return new Promise(function(resolve, reject) {
      try {
        // 确保loadFunction返回Promise
        var result = loadFunction();
        
        if (result && typeof result.then === 'function') {
          // 处理Promise
          result.then(function(data) {
            var resultData = {};
            resultData[dataKey] = data;
            resultData[loadingKey] = false;
            self.setData(resultData);
            resolve(data);
          }).catch(function(error) {
            self.handleDataLoadError(error, { context: context });
            reject(error);
          });
        } else {
          // 处理同步结果
          var resultData = {};
          resultData[dataKey] = result;
          resultData[loadingKey] = false;
          self.setData(resultData);
          resolve(result);
        }
      } catch (error) {
        self.handleDataLoadError(error, { context: context });
        reject(error);
      }
    });
  },

  /**
   * 分包异步加载数据
   */
  loadSubpackageData: function(packageName, dataPath, options) {
    var self = this;
    var config = options || {};
    var loadingKey = config.loadingKey || 'loading';
    var dataKey = config.dataKey || 'data';
    var context = config.context || '分包数据加载';
    
    return this.loadDataWithLoading(function() {
      return new Promise(function(resolve, reject) {
        // 使用传统的require方式，确保兼容性
        var requireFunc = require;
        
        requireFunc(dataPath, function(module) {
          try {
            var data = module.data || module.default || module;
            if (data && (Array.isArray(data) || typeof data === 'object')) {
              resolve(data);
            } else {
              reject(new Error('数据格式错误'));
            }
          } catch (error) {
            console.error('处理' + packageName + '数据失败:', error);
            reject(error);
          }
        }, function(error) {
          console.error('加载' + packageName + '失败:', error);
          reject(error);
        });
      });
    }, {
      loadingKey: loadingKey,
      dataKey: dataKey,
      context: context
    });
  },

  /**
   * 预加载分包
   */
  preloadSubpackage: function(packageName) {
    var self = this;
    return new Promise(function(resolve, reject) {
      wx.loadSubpackage({
        name: packageName,
        success: function(res) {
          console.log('✅ 分包' + packageName + '预加载成功');
          resolve(res);
        },
        fail: function(error) {
          console.warn('⚠️ 分包' + packageName + '预加载失败:', error);
          // 预加载失败不影响主流程
          resolve({ success: false, error: error });
        }
      });
    });
  },

  /**
   * 批量预加载分包
   */
  preloadMultipleSubpackages: function(packageNames) {
    var self = this;
    var promises = [];
    
    for (var i = 0; i < packageNames.length; i++) {
      promises.push(this.preloadSubpackage(packageNames[i]));
    }
    
    return Promise.all(promises);
  },

  /**
   * 显示加载提示
   */
  showLoading: function(title) {
    wx.showLoading({
      title: title || '加载中...',
      mask: true
    });
  },

  /**
   * 隐藏加载提示
   */
  hideLoading: function() {
    wx.hideLoading();
  },

  /**
   * 显示成功提示
   */
  showSuccess: function(title, duration) {
    wx.showToast({
      title: title || '操作成功',
      icon: 'success',
      duration: duration || 1500
    });
  },

  /**
   * 显示错误提示
   */
  showError: function(title, duration) {
    wx.showToast({
      title: title || '操作失败',
      icon: 'none',
      duration: duration || 2000
    });
  },

  /**
   * 安全的setData方法 - 高性能版本，包含数据验证、智能节流和优先级队列
   * 增强版：更严格的页面状态检查和DOM错误预防
   */
  safeSetData: function(data, callback, options) {
    // 🔒 严格页面状态检查 - 防止DOM错误的第一道防线
    if (this._isPageDestroyed()) {
      // console.warn('⚠️ 页面已销毁或正在销毁，拒绝setData操作');
      this._executeCallbackSafely(callback);
      return;
    }

    // 数据验证：检查关键字段是否为null
    var sanitizedData = this.sanitizeDataForBinding(data);
    
    // 🔒 二次页面状态检查 - 在数据处理后再次验证
    if (this._isPageDestroyed()) {
      // console.warn('⚠️ 数据处理期间页面被销毁，取消setData操作');
      this._executeCallbackSafely(callback);
      return;
    }
    
    // 初始化性能统计
    if (!this._setDataStats) {
      this._setDataStats = {
        totalCalls: 0,
        queuedCalls: 0,
        throttledCalls: 0,
        maxQueueSize: 0,
        lastStatsReport: Date.now()
      };
    }
    this._setDataStats.totalCalls++;
    
    // 解析选项
    var config = options || {};
    var priority = config.priority || 'normal'; // 'high', 'normal', 'low'
    var throttleKey = config.throttleKey; // 用于节流的键
    
    // 智能节流：检查是否需要节流
    if (throttleKey && this._shouldThrottle(throttleKey)) {
      this._setDataStats.throttledCalls++;
      console.log('🚀 数据更新节流:', throttleKey);
      return;
    }
    
    // 高频更新处理：检查是否有正在进行的setData操作或需要排队
    if (this._setDataInProgress || this._shouldQueue(priority)) {
      // 将数据加入优先级队列
      this._queueSetData(sanitizedData, callback, priority);
      this._setDataStats.queuedCalls++;
      return;
    }
    
    this._executeSetData(sanitizedData, callback);
  },

  /**
   * 执行setData操作的核心方法
   */
  _executeSetData: function(data, callback) {
    var self = this;
    
    // 标记setData正在进行
    this._setDataInProgress = true;
    
    try {
      this.setData(data, function() {
        // setData完成，清除标记
        self._setDataInProgress = false;
        
        // 执行回调
        if (callback && typeof callback === 'function') {
          callback();
        }
        
        // 处理队列中的数据
        self._processSetDataQueue();
      });
    } catch (error) {
      // 发生错误，清除标记
      this._setDataInProgress = false;
      
      console.error('❌ setData执行失败:', error);
      console.error('失败的数据:', data);
      
      // 检查是否是DOM相关错误
      if (this._isDOMError(error)) {
        console.error('🚨 检测到DOM视图更新错误，页面可能已销毁');
        this._markPageDestroyed();
      } else {
        this.handleError(error, 'setData');
      }
      
      // 确保回调执行
      if (callback && typeof callback === 'function') {
        callback();
      }
      
      // 即使出错，也要处理队列防止阻塞
      this._processSetDataQueue();
    }
  },

  /**
   * 智能节流检查
   */
  _shouldThrottle: function(throttleKey) {
    if (!throttleKey) return false;
    
    if (!this._throttleCache) {
      this._throttleCache = {};
    }
    
    var now = Date.now();
    var lastUpdate = this._throttleCache[throttleKey];
    
    // 设置不同类型数据的节流间隔
    var throttleIntervals = {
      'gps': 500,        // GPS数据500ms节流
      'sensor': 300,     // 传感器300ms节流
      'debug': 1000,     // 调试信息1s节流
      'map': 200,        // 地图渲染200ms节流
      'status': 100      // 状态信息100ms节流
    };
    
    var interval = throttleIntervals[throttleKey] || 100;
    
    if (lastUpdate && (now - lastUpdate) < interval) {
      return true; // 需要节流
    }
    
    this._throttleCache[throttleKey] = now;
    return false;
  },
  
  /**
   * 检查是否需要排队
   */
  _shouldQueue: function(priority) {
    // 高优先级数据即使有进行中的操作也不排队，直接执行
    if (priority === 'high') {
      return false;
    }
    
    return this._setDataInProgress;
  },
  
  /**
   * 将setData操作加入优先级队列
   */
  _queueSetData: function(data, callback, priority) {
    if (!this._setDataQueue) {
      this._setDataQueue = [];
    }
    
    // 增大队列容量，根据优先级设置不同限制
    var maxQueueSize = 20; // 从5增加到20
    if (priority === 'low') {
      maxQueueSize = 10; // 低优先级数据限制更严格
    }
    
    // 队列长度限制，防止内存泄漏
    if (this._setDataQueue.length >= maxQueueSize) {
      // 优先丢弃低优先级的旧数据
      var removed = this._removeLowPriorityData() || this._setDataQueue.shift();
      if (removed) {
        console.warn('⚠️ setData队列已满，丢弃数据，优先级:', removed.priority || 'normal');
      }
    }
    
    var queueItem = { 
      data: data, 
      callback: callback, 
      priority: priority || 'normal',
      timestamp: Date.now()
    };
    
    // 根据优先级插入队列
    if (priority === 'high') {
      // 高优先级插入队列前部
      this._setDataQueue.unshift(queueItem);
    } else {
      // 普通和低优先级加入队列尾部
      this._setDataQueue.push(queueItem);
    }
    
    // 更新统计信息
    if (this._setDataStats) {
      this._setDataStats.maxQueueSize = Math.max(
        this._setDataStats.maxQueueSize,
        this._setDataQueue.length
      );
    }
  },
  
  /**
   * 移除低优先级数据
   */
  _removeLowPriorityData: function() {
    for (var i = this._setDataQueue.length - 1; i >= 0; i--) {
      if (this._setDataQueue[i].priority === 'low') {
        return this._setDataQueue.splice(i, 1)[0];
      }
    }
    
    // 如果没有低优先级数据，移除最旧的普通优先级数据
    for (var i = 0; i < this._setDataQueue.length; i++) {
      if (this._setDataQueue[i].priority !== 'high') {
        return this._setDataQueue.splice(i, 1)[0];
      }
    }
    
    return null;
  },

  /**
   * 智能处理setData队列
   */
  _processSetDataQueue: function() {
    if (!this._setDataQueue || this._setDataQueue.length === 0) {
      // 输出性能统计（每10秒一次）
      this._reportPerformanceStats();
      return;
    }
    
    // 智能批处理：根据队列大小和数据类型决定处理策略
    var batchSize = this._calculateOptimalBatchSize();
    var itemsToProcess = [];
    
    // 取出要处理的项目（优先处理高优先级）
    for (var i = 0; i < Math.min(batchSize, this._setDataQueue.length); i++) {
      itemsToProcess.push(this._setDataQueue.shift());
    }
    
    // 智能数据合并
    var mergeResult = this._intelligentDataMerge(itemsToProcess);
    
    // 如果页面正在销毁，不执行队列中的数据
    if (this._isDestroying || this.isDestroyed) {
      console.warn('⚠️ 页面销毁中，清空setData队列');
      // 执行所有回调确保不阻塞
      for (var i = 0; i < mergeResult.callbacks.length; i++) {
        try {
          var callback = mergeResult.callbacks[i];
          if (typeof callback === 'function') {  // 🔧 修复：双重检查函数类型
            callback();
          }
        } catch (e) {
          console.warn('⚠️ 队列回调执行失败:', e);
        }
      }
      return;
    }
    
    // 执行合并后的数据
    this._executeSetData(mergeResult.data, function() {
      // 执行所有回调
      for (var i = 0; i < mergeResult.callbacks.length; i++) {
        try {
          var callback = mergeResult.callbacks[i];
          if (typeof callback === 'function') {  // 🔧 修复：双重检查函数类型
            callback();
          }
        } catch (e) {
          console.warn('⚠️ 合并回调执行失败:', e);
        }
      }
    });
  },
  
  /**
   * 计算最优批处理大小
   */
  _calculateOptimalBatchSize: function() {
    var queueLength = this._setDataQueue.length;
    
    if (queueLength <= 3) return queueLength;
    if (queueLength <= 8) return 3;
    if (queueLength <= 15) return 5;
    return 8; // 最大批处理大小
  },
  
  /**
   * 智能数据合并
   */
  _intelligentDataMerge: function(items) {
    var mergedData = {};
    var callbacks = [];
    var hasHighPriority = false;
    
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      
      if (item.priority === 'high') {
        hasHighPriority = true;
      }
      
      // 智能合并数据
      for (var key in item.data) {
        if (item.data.hasOwnProperty(key)) {
          // 对于某些关键数据，保留最新值
          if (this._isKeyData(key)) {
            mergedData[key] = item.data[key];
          } else if (!(key in mergedData)) {
            mergedData[key] = item.data[key];
          }
        }
      }
      
      // 收集回调
      if (item.callback && typeof item.callback === 'function') {
        callbacks.push(item.callback);
      }
    }
    
    return {
      data: mergedData,
      callbacks: callbacks,
      hasHighPriority: hasHighPriority
    };
  },
  
  /**
   * 判断是否为关键数据（总是使用最新值）
   */
  _isKeyData: function(key) {
    var keyDataFields = [
      'latitude', 'longitude', 'track', 'speed', 'altitude',
      'heading', 'gpsStatus', 'locationError', 'showGPSWarning'
    ];
    
    for (var i = 0; i < keyDataFields.length; i++) {
      if (key.indexOf(keyDataFields[i]) !== -1) {
        return true;
      }
    }
    
    return false;
  },
  
  /**
   * 输出性能统计报告
   */
  _reportPerformanceStats: function() {
    if (!this._setDataStats) return;
    
    var now = Date.now();
    if (now - this._setDataStats.lastStatsReport < 10000) return; // 10秒报告一次
    
    if (this._setDataStats.totalCalls > 100) { // 只有调用次数较多时才报告
      console.log('📊 setData性能统计:', {
        '总调用次数': this._setDataStats.totalCalls,
        '排队次数': this._setDataStats.queuedCalls,
        '节流次数': this._setDataStats.throttledCalls,
        '最大队列长度': this._setDataStats.maxQueueSize,
        '排队率': Math.round(this._setDataStats.queuedCalls / this._setDataStats.totalCalls * 100) + '%'
      });
    }
    
    this._setDataStats.lastStatsReport = now;
  },

  /**
   * 检查是否是DOM相关错误
   */
  _isDOMError: function(error) {
    if (!error || !error.message) {
      return false;
    }
    
    var errorMsg = error.message.toLowerCase();
    return errorMsg.indexOf('updatetextview') !== -1 ||
           errorMsg.indexOf('updateimageview') !== -1 ||
           errorMsg.indexOf('inserttextview') !== -1 ||
           errorMsg.indexOf('viewid') !== -1 ||
           errorMsg.indexOf('frameworkerror') !== -1;
  },

  /**
   * 标记页面已销毁
   */
  _markPageDestroyed: function() {
    this.isDestroyed = true;
    this._isDestroying = true;
    
    // 清空setData队列
    if (this._setDataQueue) {
      this._setDataQueue = [];
    }
    
    console.log('🚨 页面已标记为销毁状态，停止所有setData操作');
  },

  /**
   * 数据绑定清理方法 - 处理可能导致FrameworkError的null值
   */
  sanitizeDataForBinding: function(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    var cleanData = {};
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var value = data[key];
        
        // 处理可能的null值，特别是在视图绑定中会导致问题的场景
        if (value === null) {
          // 根据key的类型给出合适的默认值
          // 特殊处理：GPS数据需要保留null以便界面显示"--"
          if (key === 'speed' || key === 'altitude' || 
              key === 'verticalSpeed' || key === 'acceleration' ||
              key === 'gpsSpeed' || key === 'gpsAltitude' ||
              key.indexOf('debugData.') === 0 ||  // 调试数据也保留null
              key === 'locationError') {  // 错误信息保留null
            // GPS相关字段保留null值
            cleanData[key] = null;
          } else if (key.indexOf('index') !== -1 || key.indexOf('Index') !== -1) {
            cleanData[key] = -1; // index类型用-1表示无效
            console.warn('⚠️ 数据清理：将null值 ' + key + ' 替换为:', cleanData[key]);
          } else if (typeof key === 'string' && (
            key.indexOf('id') !== -1 || key.indexOf('Id') !== -1 ||
            key.indexOf('viewId') !== -1
          )) {
            cleanData[key] = ''; // ID类型用空字符串
            console.warn('⚠️ 数据清理：将null值 ' + key + ' 替换为:', cleanData[key]);
          } else if (typeof key === 'string' && (
            key.indexOf('lat') !== -1 || key.indexOf('lng') !== -1
          )) {
            cleanData[key] = 0; // 坐标类型用0
            console.warn('⚠️ 数据清理：将null值 ' + key + ' 替换为:', cleanData[key]);
          } else {
            cleanData[key] = ''; // 其他情况用空字符串
            console.warn('⚠️ 数据清理：将null值 ' + key + ' 替换为:', cleanData[key]);
          }
        } else if (value === undefined) {
          // undefined也容易引起问题
          cleanData[key] = '';
          console.warn('⚠️ 数据清理：将undefined值 ' + key + ' 替换为空字符串');
        } else {
          cleanData[key] = value;
        }
      }
    }
    
    return cleanData;
  },

  /**
   * 🔒 严格页面状态检查 - DOM错误预防核心方法
   */
  _isPageDestroyed: function() {
    // 多重检查确保页面状态判断的准确性
    return (
      this._isDestroying ||          // 页面正在销毁
      this.isDestroyed ||            // 页面已销毁
      !this.data ||                  // 数据对象不存在（页面实例失效）
      typeof this.setData !== 'function'  // setData方法不存在（页面实例失效）
    );
  },

  /**
   * 🔒 安全执行回调 - 确保回调在页面销毁时也能正常执行
   */
  _executeCallbackSafely: function(callback) {
    if (callback && typeof callback === 'function') {
      try {
        callback();
      } catch (error) {
        console.warn('⚠️ 回调执行失败 (页面已销毁):', error);
      }
    }
  },

  /**
   * 🔒 创建安全异步回调包装器 - 用于保护传感器等异步回调
   * @param {Function} originalCallback 原始回调函数
   * @param {String} context 上下文描述
   */
  createSafeAsyncCallback: function(originalCallback, context) {
    var self = this;
    return function() {
      // 🔒 第一时间检查页面状态
      if (self._isPageDestroyed()) {
        console.warn('⚠️ 异步回调被拒绝 (' + (context || '未知') + '): 页面已销毁');
        return;
      }

      // 执行原始回调
      try {
        originalCallback.apply(this, arguments);
      } catch (error) {
        console.error('❌ 异步回调执行错误 (' + (context || '未知') + '):', error);
        
        // 检查是否是DOM相关错误
        if (self._isDOMError(error)) {
          console.error('🚨 检测到DOM错误，标记页面为销毁状态');
          self._markPageDestroyed();
        }
      }
    };
  },

  /**
   * 🔒 安全定时器创建 - 自动在页面销毁时清理
   * @param {Function} callback 定时器回调
   * @param {Number} delay 延迟时间
   * @param {String} context 上下文描述
   */
  createSafeTimeout: function(callback, delay, context) {
    var self = this;
    var timeoutId = setTimeout(function() {
      if (self._isPageDestroyed()) {
        console.warn('⚠️ 定时器回调被拒绝 (' + (context || '未知') + '): 页面已销毁');
        return;
      }

      try {
        callback();
      } catch (error) {
        console.error('❌ 定时器回调执行错误 (' + (context || '未知') + '):', error);
      }
    }, delay);

    // 记录定时器用于清理
    if (!this.timers) {
      this.timers = [];
    }
    this.timers.push(timeoutId);

    return timeoutId;
  },

  /**
   * 🔒 安全间隔定时器创建 - 自动在页面销毁时清理
   * @param {Function} callback 定时器回调
   * @param {Number} interval 间隔时间
   * @param {String} context 上下文描述
   */
  createSafeInterval: function(callback, interval, context) {
    var self = this;
    var intervalId = setInterval(function() {
      if (self._isPageDestroyed()) {
        console.warn('⚠️ 间隔定时器被停止 (' + (context || '未知') + '): 页面已销毁');
        clearInterval(intervalId);
        return;
      }

      try {
        callback();
      } catch (error) {
        console.error('❌ 间隔定时器回调执行错误 (' + (context || '未知') + '):', error);
      }
    }, interval);

    // 记录定时器用于清理
    if (!this.timers) {
      this.timers = [];
    }
    this.timers.push(intervalId);

    return intervalId;
  },

  /**
   * 清理资源 - 增强版
   */
  cleanup: function() {
    console.log('🧹 开始页面资源清理...');
    
    // 清理setData相关状态
    this._setDataInProgress = false;
    if (this._setDataQueue) {
      this._setDataQueue = [];
    }
    
    // 清理定时器
    if (this.timers && Array.isArray(this.timers)) {
      for (var i = 0; i < this.timers.length; i++) {
        clearTimeout(this.timers[i]);
        clearInterval(this.timers[i]);
      }
      this.timers = [];
      console.log('🧹 清理定时器:', this.timers.length);
    }
    
    // 清理搜索定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
    
    // 清理音频相关资源
    if (this.audioManager) {
      try {
        this.audioManager.stop();
        this.audioManager.destroy();
        this.audioManager = null;
      } catch (error) {
        console.warn('⚠️ 清理音频资源时出错:', error);
      }
    }
    
    // 🔒 强制清理所有传感器监听器
    try {
      wx.offLocationChange();
      wx.offCompassChange();
      wx.offAccelerometerChange();
      wx.offGyroscopeChange();
      console.log('🧹 清理所有传感器监听器');
    } catch (error) {
      console.warn('⚠️ 清理传感器监听器时出错:', error);
    }

    // 🔒 停止位置服务
    try {
      wx.stopLocationUpdate();
      console.log('🧹 停止位置更新服务');
    } catch (error) {
      console.warn('⚠️ 停止位置服务时出错:', error);
    }
    
    console.log('🧹 页面资源清理完成');
  }
};

/**
 * 创建混入页面的工厂函数
 */
function createPage(pageConfig) {
  // 合并基类和页面配置
  var mergedConfig = {};
  
  // 先复制基类的属性
  for (var key in BasePage) {
    if (BasePage.hasOwnProperty(key)) {
      mergedConfig[key] = BasePage[key];
    }
  }
  
  // 再复制页面配置的属性
  for (var key in pageConfig) {
    if (pageConfig.hasOwnProperty(key)) {
      // 特殊处理生命周期方法
      if (key === 'onLoad' || key === 'onShow' || key === 'onHide' || key === 'onUnload') {
        mergedConfig['custom' + key.charAt(0).toUpperCase() + key.slice(1)] = pageConfig[key];
      } else if (key === 'data') {
        // 合并data对象
        mergedConfig.data = Object.assign({}, BasePage.data, pageConfig.data);
      } else {
        mergedConfig[key] = pageConfig[key];
      }
    }
  }
  
  return mergedConfig;
}

module.exports = {
  BasePage: BasePage,
  createPage: createPage
};