// app.js
// FlightToolbox 微信小程序 v1.3.2 - ES5版本
// 更新内容：增强机场搜索功能 - 支持中文机场名称输入
// 发布日期：2025-06-30

var dataManager = require('./utils/data-manager.js');
var pointsManager = require('./utils/points-manager.js');
var AudioPackageLoader = require('./utils/audio-package-loader.js');

var WarningHandler = require('./utils/warning-handler.js');
var ErrorHandler = require('./utils/error-handler.js');

// 版本信息
var APP_VERSION = '1.1.9';
var BUILD_DATE = '2025-06-30';

App({
  globalData: {
    userInfo: null,
    theme: 'light', // 固定浅色模式
    dataPreloadStarted: false,
    dataPreloadCompleted: false,
    // 积分系统全局状态
    pointsSystemInitialized: false,
    // 音频分包加载器
    audioPackageLoader: null,
    // 版本信息
    version: APP_VERSION,
    buildDate: BUILD_DATE,
  },

  onLaunch: function() {
    console.log('🚀 FlightToolbox v' + APP_VERSION + ' 启动');
    console.log('📅 构建日期: ' + BUILD_DATE);
    console.log('✨ 新功能: 支持中文机场名称输入');
    
    // 🎯 基于Context7最佳实践：初始化警告处理器
    // 过滤开发环境中的无害警告，提升开发体验
    WarningHandler.init();
    WarningHandler.checkEnvironment();
    
    // 🎯 新增：初始化主题管理器
    this.initThemeManager();
    
    // 🎵 初始化音频分包加载器
    this.initAudioPackageLoader();
    
    // 延迟显示警告说明，避免与启动日志混淆
    setTimeout(function() {
      WarningHandler.showWarningExplanation();
    }, 1000);
    
    // 获取设备信息（兼容方式）
    try {
      console.log('设备信息: WeChat MiniProgram Environment');
    } catch (error) {
      console.warn('获取系统信息失败:', error);
    }
    
    // 获取启动场景
    var launchOptions = wx.getLaunchOptionsSync();
    console.log('启动场景:', launchOptions);
    
    // 初始化网络监听
    this.initNetworkMonitoring();
    
    // 初始化积分系统
    this.initPointsSystem();
    
    var self = this;
    
    // 延迟预加载数据，避免影响启动性能
    setTimeout(function() {
      self.preloadQueryData();
    }, 2000); // 2秒后开始预加载

    // 🚀 离线优先：积极预加载所有分包数据
    setTimeout(function() {
      ErrorHandler.aggressivePreloadAll();
    }, 5000); // 5秒后开始积极预加载

    // 📱 监听网络状态变化，有网络时补充缺失数据
    wx.onNetworkStatusChange(function(res) {
      if (res.isConnected) {
        console.log('📶 网络已连接，检查并补充缺失数据');
        setTimeout(function() {
          ErrorHandler.checkAndFillMissingPackages();
        }, 1000);
      }
    });

    // 检查是否是首次使用
    var hasShownDisclaimer = wx.getStorageSync('hasShownDisclaimer');
    
    if (!hasShownDisclaimer) {
      // 延迟一下确保页面加载完成
      setTimeout(function() {
        self.showDisclaimerDialog();
      }, 1000);
    }
  },

  onShow: function() {
    console.log('App Show');
  },

  onHide: function() {
    console.log('App Hide');
  },

  onError: function(error) {
    console.error('App Error:', error);
    // 使用错误处理工具记录错误
    ErrorHandler.logError('app_error', error);
  },

  // 初始化积分系统
  initPointsSystem: function() {
    var self = this;
    
    pointsManager.initUser().then(function() {
      console.log('🎯 初始化积分系统...');
      
      // 记录系统已初始化
      self.globalData.pointsSystemInitialized = true;
      
      console.log('✅ 积分系统初始化完成');
      console.log('当前积分:', pointsManager.getCurrentPoints());
      
    }).catch(function(error) {
      console.error('❌ 积分系统初始化失败:', error);
    });
  },


  // 获取积分系统管理器（供页面使用）
  getPointsManager: function() {
    return pointsManager;
  },

  // 检查功能访问权限（全局方法）
  checkFeatureAccess: function(feature) {
    return pointsManager.checkFeatureAccess(feature);
  },

  // 消费积分（全局方法）
  consumePoints: function(feature, description) {
    return pointsManager.consumePoints(feature, description || '');
  },

  // 🎯 新增：初始化主题管理器
  initThemeManager: function() {
    var self = this;
    
    try {
      console.log('💡 已设置为固定浅色模式');
      
      // 设置固定浅色主题
      this.globalData.theme = 'light';
      
      console.log('✅ 应用已配置为固定浅色模式');
    } catch (error) {
      console.warn('⚠️ 主题管理器初始化失败:', error);
    }
  },

  // 初始化网络监听
  initNetworkMonitoring: function() {
    console.log('🌐 初始化网络监听...');
    
    // 获取当前网络状态
    wx.getNetworkType({
      success: function(res) {
        console.log('当前网络类型:', res.networkType);
        wx.setStorageSync('lastNetworkType', res.networkType);
      },
      fail: function(err) {
        console.warn('获取网络状态失败:', err);
        wx.setStorageSync('lastNetworkType', 'unknown');
      }
    });
    
    // 监听网络状态变化
    wx.onNetworkStatusChange(function(res) {
      console.log('网络状态变化:', {
        isConnected: res.isConnected,
        networkType: res.networkType
      });
      
      wx.setStorageSync('lastNetworkType', res.networkType);
    });
  },

  // 🎵 初始化音频分包加载器
  // 预加载查询数据 - ES5版本
  preloadQueryData: function() {
    if (this.globalData.dataPreloadStarted) {
      return;
    }
    
    this.globalData.dataPreloadStarted = true;
    console.log('🚀 开始预加载万能查询数据...');
    
    try {
      // 注意：所有packageA-E分包已被删除，此函数现在主要用于保持兼容性
      console.log('ℹ️ 万能查询数据预加载已跳过（分包已删除）');
      this.globalData.dataPreloadCompleted = true;
    } catch (error) {
      console.error('❌ 数据预加载出错:', error);
    }
  },

  initAudioPackageLoader: function() {
    try {
      console.log('🎵 初始化音频分包加载器...');
      
      // 创建音频分包加载器实例
      this.globalData.audioPackageLoader = new AudioPackageLoader();
      
      console.log('✅ 音频分包加载器初始化完成');
    } catch (error) {
      console.error('❌ 音频分包加载器初始化失败:', error);
    }
  },

  // 新用户免责声明弹窗
  showDisclaimerDialog: function() {
    wx.showModal({
      title: '重要声明',
      content: '本小程序旨在帮助飞行员学习航空理论知识，包括性能计算、概念理解、规章条例等内容。\n\n但请注意：所有计算逻辑均基于作者个人理解编写，可能存在错误且未经官方验证。\n\n因此，本小程序所有数据仅供学习参考，严禁用于实际飞行操作！',
      showCancel: false,
      confirmText: '我已知晓',
      confirmColor: '#ff6b6b',
      success: function(res) {
        if (res.confirm) {
          // 标记已显示过免责声明
          wx.setStorageSync('hasShownDisclaimer', true);
        }
      }
    });
  }
});