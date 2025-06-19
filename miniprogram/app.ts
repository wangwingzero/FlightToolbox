// app.ts
const dataManager = require('./utils/data-manager.js')
const pointsManager = require('./utils/points-manager.js')
const adManager = require('./utils/ad-manager.js')

App<IAppOption>({
  globalData: {
    userInfo: null,
    theme: 'light',
    dataPreloadStarted: false,
    dataPreloadCompleted: false,
    // 积分系统全局状态
    pointsSystemInitialized: false
  },

  onLaunch() {
    console.log('App Launch')
    
    // 获取设备信息（使用新API替代弃用的getSystemInfoSync）
    try {
      const systemInfo = {
        ...wx.getWindowInfo(),
        ...wx.getDeviceInfo(),
        ...wx.getAppBaseInfo()
      }
      console.log('系统信息:', systemInfo)
    } catch (error) {
      console.warn('获取系统信息失败，使用兼容方案:', error)
      // 兜底方案：如果新API不可用，使用旧API
      const systemInfo = wx.getSystemInfoSync()
      console.log('系统信息（兼容模式）:', systemInfo)
    }
    
    // 获取启动场景
    const launchOptions = wx.getLaunchOptionsSync()
    console.log('启动场景:', launchOptions)
    
    // 初始化积分系统
    this.initPointsSystem()
    
    // 延迟预加载数据，避免影响启动性能
    setTimeout(() => {
      this.preloadQueryData()
    }, 2000) // 2秒后开始预加载

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

  onError(error: string) {
    console.error('App Error:', error)
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
      // 并行预加载所有数据，但不阻塞主流程
      const preloadPromises = [
        this.preloadWithTimeout(dataManager.loadAbbreviationsData(), 'abbreviations', 5000),
        this.preloadWithTimeout(dataManager.loadDefinitionsData(), 'definitions', 5000),
        this.preloadWithTimeout(dataManager.loadAirportData(), 'airports', 5000),
        this.preloadWithTimeout(dataManager.loadIcaoData(), 'icao', 5000)
      ]
      
      // 等待所有预加载完成（或超时）
      await Promise.allSettled(preloadPromises)
      
      this.globalData.dataPreloadCompleted = true
      console.log('✅ 万能查询数据预加载完成')
      
      // 通知页面数据已预加载完成
      wx.setStorageSync('queryDataPreloaded', true)
      
    } catch (error) {
      console.error('❌ 数据预加载失败:', error)
    }
  },

  // 带超时的预加载
  async preloadWithTimeout(promise: Promise<any>, dataType: string, timeout: number) {
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
  isDataPreloaded(): boolean {
    return this.globalData.dataPreloadCompleted || wx.getStorageSync('queryDataPreloaded')
  },

  // 获取预加载状态
  getPreloadStatus() {
    return {
      started: this.globalData.dataPreloadStarted,
      completed: this.globalData.dataPreloadCompleted,
      cacheStatus: dataManager.getCacheStatus(),
      pointsSystemReady: this.globalData.pointsSystemInitialized
    }
  },

  // 获取积分系统管理器（供页面使用）
  getPointsManager() {
    return pointsManager
  },

  // 获取广告管理器（供页面使用）
  getAdManager() {
    return adManager
  },

  // 检查功能访问权限（全局方法）
  checkFeatureAccess(feature: string) {
    return pointsManager.checkFeatureAccess(feature)
  },

  // 消费积分（全局方法）
  async consumePoints(feature: string, description?: string) {
    return await pointsManager.consumePoints(feature, description || '')
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