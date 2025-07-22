// app.ts
// FlightToolbox 微信小程序 v1.3.2
// 更新内容：增强机场搜索功能 - 支持中文机场名称输入
// 发布日期：2025-06-30

const pointsManager = require('./utils/points-manager.js')
const subpackageLoader = require('./utils/subpackage-loader.js')
const subpackageDebugger = require('./utils/subpackage-debug.js')

const WarningHandler = require('./utils/warning-handler.js')
const ErrorHandler = require('./utils/error-handler.js')
const DiagnosticTool = require('./utils/diagnostic-tool.js')

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
    // 积分系统全局状态
    pointsSystemInitialized: false,
    // 版本信息
    version: APP_VERSION,
    buildDate: BUILD_DATE,
    // 万能查询详情页面数据存储
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
    
    // 初始化积分系统
    this.initPointsSystem()
    
    
    // 延迟运行诊断，降低启动时的控制台噪音
    setTimeout(() => {
      // 仅在开发环境中运行完整诊断
      if (wx.getAccountInfoSync && wx.getAccountInfoSync().miniProgram.envVersion === 'develop') {
        console.log('🔍 开发环境：运行启动诊断...')
        var diagnosticTool = new DiagnosticTool()
        diagnosticTool.runDiagnostic()
        
        // 运行分包诊断
        console.log('🔍 开发环境：运行分包诊断...')
        subpackageDebugger.fullDiagnostic()
      }
      
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

  // 初始化积分系统
  async initPointsSystem() {
    try {
      console.log('🎯 初始化积分系统...')
      
      // 初始化用户积分（新用户奖励等）
      await pointsManager.initUser()
      
      // 记录系统已初始化
      this.globalData.pointsSystemInitialized = true
      
      console.log('✅ 积分系统初始化完成')
      console.log('当前积分:', pointsManager.getCurrentPoints())
      
    } catch (error) {
      console.error('❌ 积分系统初始化失败:', error)
    }
  },


  // 预加载万能查询数据
  async preloadQueryData() {
    if (this.globalData.dataPreloadStarted) {
      return
    }
    
    this.globalData.dataPreloadStarted = true
    console.log('🚀 开始预加载万能查询数据...')
    
    try {
      // 并行预加载所有数据，但不阻塞主流程 - 使用新的智能分包加载器
      const preloadPromises = [
        // 注释掉已删除的分包
        // this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageB', []), 'abbreviations', 15000),
        // this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageD', []), 'definitions', 15000),
        // this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageC', []), 'airports', 15000),
        // this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageA', []), 'icao', 20000),
        // this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageE', []), 'normatives', 15000)
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
      console.log('✅ 万能查询数据预加载完成')
      
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
      cacheStatus: subpackageLoader.getCacheStatus(),
      pointsSystemReady: this.globalData.pointsSystemInitialized
    }
  },

  // 获取积分系统管理器（供页面使用）
  getPointsManager() {
    return pointsManager
  },


  // 检查功能访问权限（全局方法）
  checkFeatureAccess(feature) {
    return pointsManager.checkFeatureAccess(feature)
  },

  // 消费积分（全局方法）
  async consumePoints(feature, description) {
    return await pointsManager.consumePoints(feature, description || '')
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