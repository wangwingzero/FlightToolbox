/**
 * 统一数据加载管理器 - 解决重复代码问题
 * 严格遵循ES5语法，确保小程序兼容性
 * 支持分包异步化和离线优先策略
 */

var errorHandler = require('./error-handler.js');

/**
 * 数据加载器构造函数
 */
function DataLoader() {
  this.loadingStates = {};
  this.cache = {};
  this.retryAttempts = {};
  this.maxRetries = 3;
  this.retryDelay = 1000;
}

/**
 * 通用数据加载方法
 */
DataLoader.prototype.loadWithLoading = function(pageInstance, loadFunction, options) {
  var self = this;
  var config = options || {};
  var loadingKey = config.loadingKey || 'loading';
  var dataKey = config.dataKey || 'data';
  var context = config.context || '数据加载';
  var enableCache = config.enableCache !== false;
  var cacheKey = config.cacheKey;
  
  // 如果有缓存且启用缓存，直接返回
  if (enableCache && cacheKey && this.cache[cacheKey]) {
    var cachedData = {};
    cachedData[dataKey] = this.cache[cacheKey];
    cachedData[loadingKey] = false;
    pageInstance.setData(cachedData);
    return Promise.resolve(this.cache[cacheKey]);
  }
  
  // 防止重复加载
  var loadingStateKey = context + '_' + (cacheKey || 'default');
  if (this.loadingStates[loadingStateKey]) {
    console.log('⏳ ' + context + '正在进行中，跳过重复请求');
    return this.loadingStates[loadingStateKey];
  }
  
  // 设置loading状态
  var loadingData = {};
  loadingData[loadingKey] = true;
  pageInstance.setData(loadingData);
  
  // 清除之前的错误
  if (pageInstance.setData) {
    pageInstance.setData({ error: null });
  }
  
  // 创建加载Promise
  var loadingPromise = new Promise(function(resolve, reject) {
    try {
      var result = loadFunction();
      
      if (result && typeof result.then === 'function') {
        // 处理Promise
        result.then(function(data) {
          // 缓存数据
          if (enableCache && cacheKey) {
            self.cache[cacheKey] = data;
          }
          
          // 更新页面数据
          var resultData = {};
          resultData[dataKey] = data;
          resultData[loadingKey] = false;
          pageInstance.setData(resultData);
          
          // 清除loading状态
          delete self.loadingStates[loadingStateKey];
          
          console.log('✅ ' + context + '成功');
          resolve(data);
        }).catch(function(error) {
          self.handleLoadingError(pageInstance, error, context, loadingKey, loadingStateKey);
          reject(error);
        });
      } else {
        // 处理同步结果
        if (enableCache && cacheKey) {
          self.cache[cacheKey] = result;
        }
        
        var resultData = {};
        resultData[dataKey] = result;
        resultData[loadingKey] = false;
        pageInstance.setData(resultData);
        
        delete self.loadingStates[loadingStateKey];
        resolve(result);
      }
    } catch (error) {
      self.handleLoadingError(pageInstance, error, context, loadingKey, loadingStateKey);
      reject(error);
    }
  });
  
  // 记录loading状态
  this.loadingStates[loadingStateKey] = loadingPromise;
  
  return loadingPromise;
};

/**
 * 处理加载错误
 */
DataLoader.prototype.handleLoadingError = function(pageInstance, error, context, loadingKey, loadingStateKey) {
  console.error('❌ ' + context + '失败:', error);
  
  // 更新loading状态
  var errorData = {};
  errorData[loadingKey] = false;
  errorData.error = error.message || '加载失败';
  pageInstance.setData(errorData);
  
  // 清除loading状态
  delete this.loadingStates[loadingStateKey];
  
  // 显示错误提示
  wx.showToast({
    title: context + '失败，请重试',
    icon: 'none',
    duration: 2000
  });
};

/**
 * 分包异步加载数据
 */
DataLoader.prototype.loadSubpackageData = function(pageInstance, packageName, dataPath, options) {
  var self = this;
  var config = options || {};
  var loadingKey = config.loadingKey || 'loading';
  var dataKey = config.dataKey || 'data';
  var context = config.context || '分包数据加载';
  var fallbackData = config.fallbackData || [];
  
  return this.loadWithLoading(pageInstance, function() {
    return new Promise(function(resolve, reject) {
      console.log('📦 开始加载分包数据:', packageName);
      
      // 检查分包是否已预加载
      self.checkSubpackagePreloaded(packageName).then(function(isPreloaded) {
        if (isPreloaded) {
          console.log('✅ 分包' + packageName + '已预加载，直接加载数据');
          self.loadDataFromSubpackage(dataPath, resolve, reject, fallbackData);
        } else {
          console.log('📦 分包' + packageName + '未预加载，开始异步加载');
          self.loadSubpackageAsync(packageName, function() {
            self.loadDataFromSubpackage(dataPath, resolve, reject, fallbackData);
          }, function(error) {
            console.warn('⚠️ 分包' + packageName + '加载失败，使用兜底数据:', error);
            resolve(fallbackData);
          });
        }
      }).catch(function(error) {
        console.warn('⚠️ 检查分包状态失败，尝试直接加载:', error);
        self.loadDataFromSubpackage(dataPath, resolve, reject, fallbackData);
      });
    });
  }, {
    loadingKey: loadingKey,
    dataKey: dataKey,
    context: context,
    cacheKey: packageName + '_' + dataPath
  });
};

/**
 * 检查分包是否已预加载
 */
DataLoader.prototype.checkSubpackagePreloaded = function(packageName) {
  return new Promise(function(resolve, reject) {
    try {
      // 在开发环境中，直接假设分包已预加载以避免警告
      if (typeof __wxConfig !== 'undefined' && __wxConfig.debug) {
        console.log('🛠️ 开发环境检测，跳过分包预加载检查');
        resolve(true);
        return;
      }
      
      // 尝试require分包中的文件来检查是否已预加载
      var testPath = '../' + packageName + '/index.js';
      require(testPath);
      resolve(true);
    } catch (error) {
      resolve(false);
    }
  });
};

/**
 * 异步加载分包
 */
DataLoader.prototype.loadSubpackageAsync = function(packageName, successCallback, failCallback) {
  // 检查当前环境是否支持wx.loadSubpackage
  if (typeof wx.loadSubpackage !== 'function') {
    console.warn('⚠️ 当前环境不支持wx.loadSubpackage（开发者工具），直接尝试加载数据');
    successCallback();
    return;
  }
  
  wx.loadSubpackage({
    name: packageName,
    success: function(res) {
      console.log('✅ 分包' + packageName + '异步加载成功');
      successCallback(res);
    },
    fail: function(error) {
      console.error('❌ 分包' + packageName + '异步加载失败:', error);
      failCallback(error);
    }
  });
};

/**
 * 从分包加载数据
 */
DataLoader.prototype.loadDataFromSubpackage = function(dataPath, resolve, reject, fallbackData) {
  var requireFunc = require;
  
  requireFunc(dataPath, function(module) {
    try {
      // 改进的数据解析逻辑，处理多种数据结构
      var data = null;
      
      // 尝试多种可能的数据字段
      if (module.data && Array.isArray(module.data)) {
        data = module.data;
      } else if (module.normativeData && Array.isArray(module.normativeData)) {
        data = module.normativeData;
      } else if (module.default && Array.isArray(module.default)) {
        data = module.default;
      } else if (Array.isArray(module)) {
        data = module;
      } else {
        // 如果以上都不是数组，查找第一个数组字段
        for (var key in module) {
          if (module.hasOwnProperty(key) && Array.isArray(module[key])) {
            data = module[key];
            break;
          }
        }
      }
      
      if (data && Array.isArray(data)) {
        console.log('✅ 数据加载成功，数据量:', data.length);
        resolve(data);
      } else {
        console.warn('⚠️ 数据格式异常，使用兜底数据', module);
        resolve(fallbackData || []);
      }
    } catch (error) {
      console.error('❌ 处理数据失败:', error);
      reject(error);
    }
  }, function(error) {
    console.error('❌ 加载数据文件失败:', error);
    
    // 如果有兜底数据，使用兜底数据
    if (fallbackData) {
      console.log('🔄 使用兜底数据');
      resolve(fallbackData);
    } else {
      reject(error);
    }
  });
};

/**
 * 批量预加载分包
 */
DataLoader.prototype.preloadSubpackages = function(packageNames, options) {
  var self = this;
  var config = options || {};
  var showProgress = config.showProgress !== false;
  var interval = config.interval || 500;
  
  return new Promise(function(resolve, reject) {
    var results = [];
    var completed = 0;
    var total = packageNames.length;
    
    if (showProgress) {
      wx.showLoading({
        title: '正在预加载数据包...',
        mask: true
      });
    }
    
    function loadNext(index) {
      if (index >= total) {
        if (showProgress) {
          wx.hideLoading();
        }
        resolve(results);
        return;
      }
      
      var packageName = packageNames[index];
      
      self.preloadSingleSubpackage(packageName).then(function(result) {
        results.push(result);
        completed++;
        
        if (showProgress) {
          wx.showLoading({
            title: '预加载进度: ' + completed + '/' + total,
            mask: true
          });
        }
        
        // 延迟加载下一个，避免并发冲突
        setTimeout(function() {
          loadNext(index + 1);
        }, interval);
      }).catch(function(error) {
        results.push({ packageName: packageName, success: false, error: error });
        completed++;
        
        // 继续加载下一个
        setTimeout(function() {
          loadNext(index + 1);
        }, interval);
      });
    }
    
    loadNext(0);
  });
};

/**
 * 预加载单个分包
 */
DataLoader.prototype.preloadSingleSubpackage = function(packageName) {
  var self = this;
  return new Promise(function(resolve, reject) {
    // 检查是否已经预加载过
    try {
      var testPath = '../' + packageName + '/index.js';
      require(testPath);
      console.log('✅ 分包' + packageName + '已预加载');
      resolve({ packageName: packageName, success: true, cached: true });
      return;
    } catch (error) {
      // 分包未加载，继续预加载流程
    }
    
    // 检查当前环境是否支持
    if (typeof wx.loadSubpackage !== 'function') {
      console.warn('⚠️ 当前环境不支持wx.loadSubpackage');
      resolve({ packageName: packageName, success: false, reason: 'not_supported' });
      return;
    }
    
    wx.loadSubpackage({
      name: packageName,
      success: function(res) {
        console.log('✅ 分包' + packageName + '预加载成功');
        resolve({ packageName: packageName, success: true, res: res });
      },
      fail: function(error) {
        console.warn('⚠️ 分包' + packageName + '预加载失败:', error);
        resolve({ packageName: packageName, success: false, error: error });
      }
    });
  });
};

/**
 * 清除缓存
 */
DataLoader.prototype.clearCache = function(cacheKey) {
  if (cacheKey) {
    delete this.cache[cacheKey];
    console.log('🧹 清除缓存:', cacheKey);
  } else {
    this.cache = {};
    console.log('🧹 清除所有缓存');
  }
};

/**
 * 获取缓存状态
 */
DataLoader.prototype.getCacheStatus = function() {
  var cacheKeys = Object.keys(this.cache);
  return {
    total: cacheKeys.length,
    keys: cacheKeys,
    size: JSON.stringify(this.cache).length
  };
};

/**
 * 带重试的数据加载
 */
DataLoader.prototype.loadWithRetry = function(pageInstance, loadFunction, options) {
  var self = this;
  var config = options || {};
  var maxRetries = config.maxRetries || this.maxRetries;
  var retryDelay = config.retryDelay || this.retryDelay;
  var context = config.context || '数据加载';
  
  function attemptLoad(attempt) {
    return self.loadWithLoading(pageInstance, loadFunction, config).catch(function(error) {
      if (attempt < maxRetries) {
        console.log('🔄 ' + context + '失败，' + retryDelay + 'ms后进行第' + (attempt + 1) + '次重试');
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            attemptLoad(attempt + 1).then(resolve).catch(reject);
          }, retryDelay * attempt); // 递增延迟
        });
      } else {
        console.error('❌ ' + context + '重试' + maxRetries + '次后仍然失败');
        throw error;
      }
    });
  }
  
  return attemptLoad(1);
};

// 创建全局实例
var dataLoader = new DataLoader();

// 导出方法
module.exports = {
  loadWithLoading: function(pageInstance, loadFunction, options) {
    return dataLoader.loadWithLoading(pageInstance, loadFunction, options);
  },
  loadSubpackageData: function(pageInstance, packageName, dataPath, options) {
    return dataLoader.loadSubpackageData(pageInstance, packageName, dataPath, options);
  },
  preloadSubpackages: function(packageNames, options) {
    return dataLoader.preloadSubpackages(packageNames, options);
  },
  preloadSingleSubpackage: function(packageName) {
    return dataLoader.preloadSingleSubpackage(packageName);
  },
  loadWithRetry: function(pageInstance, loadFunction, options) {
    return dataLoader.loadWithRetry(pageInstance, loadFunction, options);
  },
  clearCache: function(cacheKey) {
    return dataLoader.clearCache(cacheKey);
  },
  getCacheStatus: function() {
    return dataLoader.getCacheStatus();
  }
};