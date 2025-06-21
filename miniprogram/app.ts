// app.ts
const dataManager = require('./utils/data-manager.js')
const pointsManager = require('./utils/points-manager.js')
const adManager = require('./utils/ad-manager.js')
const AdPreloader = require('./utils/ad-preloader.js')

// Define IAppOption interface locally
interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    theme: string,
    dataPreloadStarted: boolean,
    dataPreloadCompleted: boolean,
    pointsSystemInitialized: boolean
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
  initPointsSystem(): Promise<void>,
  preloadQueryData(): Promise<void>,
  preloadWithTimeout(promise: Promise<any>, dataType: string, timeout: number): Promise<any>,
  isDataPreloaded(): boolean,
  getPreloadStatus(): any,
  getPointsManager(): any,
  getAdManager(): any,
  checkFeatureAccess(feature: string): any,
  consumePoints(feature: string, description?: string): Promise<any>,
  initNetworkMonitoring(): void,
  preloadAds(): void,
  showDisclaimerDialog(): void
}

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
    
    // 获取设备信息（使用兼容的API）
    try {
      const systemInfo = wx.getSystemInfoSync()
      console.log('系统信息:', systemInfo)
    } catch (error) {
      console.warn('获取系统信息失败:', error)
    }
    
    // 获取启动场景
    const launchOptions = wx.getLaunchOptionsSync()
    console.log('启动场景:', launchOptions)
    
    // 初始化网络监听（广告系统需要）
    this.initNetworkMonitoring()
    
    // 初始化积分系统
    this.initPointsSystem()
    
    // 延迟预加载数据，避免影响启动性能
    setTimeout(() => {
      this.preloadQueryData()
    }, 2000) // 2秒后开始预加载

    // 延迟预加载广告，避免影响启动性能
    setTimeout(() => {
      this.preloadAds()
    }, 3000) // 3秒后开始预加载广告

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
      
      if (res.isConnected && res.networkType !== 'none') {
        console.log('网络恢复，开始预加载广告')
        // 网络恢复时预加载广告
        AdPreloader.smartPreload()
      } else {
        console.log('网络断开，停止广告相关操作')
      }
    })
  },

  // 预加载广告
  preloadAds() {
    console.log('🎯 开始预加载广告...')
    
    try {
      // 智能预加载（会检查网络状态、用户偏好等）
      const result = AdPreloader.smartPreload()
      
      if (result) {
        console.log('✅ 广告预加载启动成功')
      } else {
        console.log('⚠️ 广告预加载跳过（网络不可用或用户设置）')
      }
      
      // 记录预加载状态
      const status = AdPreloader.getPreloadStatus()
      console.log('广告预加载状态:', status)
      
    } catch (error) {
      console.error('❌ 广告预加载失败:', error)
    }
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