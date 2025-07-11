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
    isDarkMode: false,
    loading: false,
    error: null
  },

  /**
   * 页面加载时的统一处理
   */
  onLoad: function(options) {
    console.log('📄 BasePage onLoad');
    this.initializeTheme();
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
    this.checkThemeStatus();
    
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
    console.log('📄 BasePage onUnload');
    this.cleanup();
    
    // 如果子页面有自定义onUnload，调用它
    if (this.customOnUnload && typeof this.customOnUnload === 'function') {
      this.customOnUnload.call(this);
    }
  },

  /**
   * 初始化主题管理
   */
  initializeTheme: function() {
    try {
      var themeManager = require('./theme-manager.js');
      this.themeCleanup = themeManager.initPageTheme(this);
      console.log('🌙 主题管理器初始化成功');
    } catch (error) {
      console.warn('⚠️ 主题管理器初始化失败:', error);
    }
  },

  /**
   * 检查主题状态
   */
  checkThemeStatus: function() {
    try {
      var isDarkMode = wx.getStorageSync('isDarkMode') || false;
      this.setData({ isDarkMode: isDarkMode });
    } catch (error) {
      console.warn('⚠️ 获取主题状态失败:', error);
    }
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
   * 安全的setData方法
   */
  safeSetData: function(data, callback) {
    try {
      this.setData(data, callback);
    } catch (error) {
      console.error('setData失败:', error);
      this.handleError(error, 'setData');
    }
  },

  /**
   * 清理资源
   */
  cleanup: function() {
    // 清理主题监听器
    if (this.themeCleanup && typeof this.themeCleanup === 'function') {
      try {
        this.themeCleanup();
        console.log('🌙 主题监听器已清理');
      } catch (error) {
        console.warn('⚠️ 清理主题监听器时出错:', error);
      }
    }
    
    // 清理定时器
    if (this.timers && Array.isArray(this.timers)) {
      for (var i = 0; i < this.timers.length; i++) {
        clearTimeout(this.timers[i]);
      }
      this.timers = [];
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
      } catch (error) {
        console.warn('⚠️ 清理音频资源时出错:', error);
      }
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