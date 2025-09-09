// app.ts
// FlightToolbox 微信小程序 v2.0.4
// 更新内容：增强机场搜索功能 - 支持中文机场名称输入
// 发布日期：2025-06-30

// 🔇 系统级错误过滤器 - 必须在所有代码之前运行
(function() {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // 检查是否为系统视图管理错误
    const message = args.join(' ');
    if (message && typeof message === 'string') {
      // 过滤掉系统内部的视图管理错误
      if (message.indexOf('removeImageView:fail') !== -1 ||
          message.indexOf('removeTextView:fail') !== -1 ||
          message.indexOf('appServiceSDKScriptError') !== -1 ||
          (message.indexOf('not found') !== -1 && message.indexOf('View:fail') !== -1)) {
        // 静默处理，不输出到控制台
        return;
      }
    }
    // 其他错误正常输出
    originalConsoleError.apply(console, args);
  };
})();

const subpackageLoader = require('./utils/subpackage-loader.js')
const subpackageDebugger = require('./utils/subpackage-debug.js')

const WarningHandler = require('./utils/warning-handler.js')
const ErrorHandler = require('./utils/error-handler.js')
const AdManager = require('./utils/ad-manager.js')
const AppConfig = require('./utils/app-config.js')

// 版本信息
const APP_VERSION = '1.1.9'
const BUILD_DATE = '2025-06-30'

// Define IAppOption interface locally
App({
  globalData: {
    userInfo: null,
    theme: 'light', // 固定浅色模式
    dataPreloadStarted: false,
    dataPreloadCompleted: false,
    // 版本信息
    version: APP_VERSION,
    buildDate: BUILD_DATE,
    // 资料查询详情页面数据存储
    selectedAbbreviation: null,
    selectedDefinition: null,
    selectedAirport: null,
    selectedCommunication: null,
    selectedRegulation: null
  },

  onLaunch() {
    console.log('🚀 FlightToolbox v' + APP_VERSION + ' 启动')
    console.log('📅 构建日期: ' + BUILD_DATE)
    console.log('✨ 新功能: 支持中文机场名称输入')
    
    // 🎯 基于Context7最佳实践：初始化警告处理器
    // 过滤开发环境中的无害警告，提升开发体验
    WarningHandler.init()
    WarningHandler.checkEnvironment()
    
    // 🎯 统一初始化广告管理器 - 避免各页面重复初始化
    AdManager.init({
      debug: false, // 生产环境关闭调试
      adUnitIds: [
        AppConfig.ad.rewardVideoId,
        'adunit-190474fb7b19f51e',
        'adunit-316c5630d7a1f9ef'
      ]
    })
    
    // 🎯 新增：初始化主题管理器
    this.initThemeManager()
    
    // 延迟显示警告说明，避免与启动日志混淆
    setTimeout(() => {
      WarningHandler.showWarningExplanation()
    }, 1000)
    
    // 获取设备信息（兼容方式）
    try {
      console.log('设备信息: WeChat MiniProgram Environment')
    } catch (error) {
      console.warn('获取系统信息失败:', error)
    }
    
    // 获取启动场景
    const launchOptions = wx.getLaunchOptionsSync()
    console.log('启动场景:', launchOptions)
    
    // 初始化网络监听
    this.initNetworkMonitoring()
    
    
    
    // 延迟预加载数据，避免影响启动性能
    setTimeout(() => {
      // 运行分包诊断
      console.log('🔍 运行分包诊断...')
      subpackageDebugger.fullDiagnostic(function(diagnostic) {
        console.log('📋 分包诊断完成，结果:', diagnostic.summary)
      })
      
      this.preloadQueryData()
    }, 2000) // 2秒后开始预加载

    // 🚀 离线优先：积极预加载所有分包数据
    setTimeout(() => {
      ErrorHandler.aggressivePreloadAll()
    }, 5000) // 5秒后开始积极预加载

    // 📱 监听网络状态变化，有网络时补充缺失数据
    wx.onNetworkStatusChange((res) => {
      if (res.isConnected) {
        console.log('📶 网络已连接，检查并补充缺失数据')
        setTimeout(() => {
          ErrorHandler.checkAndFillMissingPackages()
        }, 1000)
      }
    })



    // 检查是否是首次使用
    const hasShownDisclaimer = wx.getStorageSync('hasShownDisclaimer');
    
    if (!hasShownDisclaimer) {
      // 延迟一下确保页面加载完成
      setTimeout(() => {
        this.showDisclaimerDialog();
      }, 1000);
    }
  },

  onShow() {
    console.log('App Show')
    
  },


  onHide() {
    console.log('App Hide')
  },

  onError(error) {
    console.error('App Error:', error)
    // 使用错误处理工具记录错误
    ErrorHandler.logError('app_error', error)
  },



  // 预加载资料查询数据
  async preloadQueryData() {
    if (this.globalData.dataPreloadStarted) {
      return
    }
    
    this.globalData.dataPreloadStarted = true
    console.log('🚀 开始预加载资料查询数据...')
    
    try {
      // 并行预加载所有数据，但不阻塞主流程 - 使用新的智能分包加载器
      const preloadPromises = [
        this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageB', []), 'abbreviations', 15000),
        this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageD', []), 'definitions', 15000),
        this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageC', []), 'airports', 15000),
        this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageA', []), 'icao', 20000),
        this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageCCAR', []), 'normatives', 15000)
      ]
      
      // 等待所有预加载完成（或超时）- ES5兼容方式
      const results = [];
      for (let i = 0; i < preloadPromises.length; i++) {
        try {
          const result = await preloadPromises[i];
          results.push({ status: 'fulfilled', value: result });
        } catch (error) {
          results.push({ status: 'rejected', reason: error });
        }
      }
      
      this.globalData.dataPreloadCompleted = true
      console.log('✅ 资料查询数据预加载完成')
      
      // 通知页面数据已预加载完成
      wx.setStorageSync('queryDataPreloaded', true)
      
    } catch (error) {
      console.error('❌ 数据预加载失败:', error)
    }
  },

  // 带超时的预加载
  async preloadWithTimeout(promise, dataType, timeout) {
    try {
      const result = await Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`${dataType} 预加载超时`)), timeout)
        )
      ])
      console.log(`✅ ${dataType} 数据预加载成功`)
      return result
    } catch (error) {
      console.warn(`⚠️ ${dataType} 数据预加载失败:`, error)
      return null
    }
  },

  // 检查数据是否已预加载
  isDataPreloaded() {
    return this.globalData.dataPreloadCompleted || wx.getStorageSync('queryDataPreloaded')
  },

  // 获取预加载状态
  getPreloadStatus() {
    return {
      started: this.globalData.dataPreloadStarted,
      completed: this.globalData.dataPreloadCompleted,
      cacheStatus: subpackageLoader.getCacheStatus()
    }
  },


  // 🎯 新增：初始化主题管理器
  initThemeManager() {
    try {
      console.log('💡 已设置为固定浅色模式')
      
      // 设置固定浅色主题
      this.globalData.theme = 'light'
      
      console.log('✅ 应用已配置为固定浅色模式')
    } catch (error) {
      console.warn('⚠️ 主题管理器初始化失败:', error)
    }
  },

  // 初始化网络监听
  initNetworkMonitoring() {
    console.log('🌐 初始化网络监听...')
    
    // 获取当前网络状态
    wx.getNetworkType({
      success: (res) => {
        console.log('当前网络类型:', res.networkType)
        wx.setStorageSync('lastNetworkType', res.networkType)
      },
      fail: (err) => {
        console.warn('获取网络状态失败:', err)
        wx.setStorageSync('lastNetworkType', 'unknown')
      }
    })
    
    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      console.log('网络状态变化:', {
        isConnected: res.isConnected,
        networkType: res.networkType
      })
      
      wx.setStorageSync('lastNetworkType', res.networkType)
    })
  },

  // 新用户免责声明弹窗
  showDisclaimerDialog() {
    wx.showModal({
      title: '重要声明',
      content: '本小程序旨在帮助飞行员学习航空理论知识，包括性能计算、概念理解、规章条例等内容。\n\n但请注意：所有计算逻辑均基于作者个人理解编写，可能存在错误且未经官方验证。\n\n因此，本小程序所有数据仅供学习参考，严禁用于实际飞行操作！',
      showCancel: false,
      confirmText: '我已知晓',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          // 标记已显示过免责声明
          wx.setStorageSync('hasShownDisclaimer', true);
        }
      }
    });
  }
})