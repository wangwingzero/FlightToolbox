/**
 * 广告预加载器 - 基于官方wx.preloadAd接口
 * 专为离线用户优化，最小化资源消耗
 */
class AdPreloader {
  /**
   * 预加载核心广告位
   * 只预加载最重要的广告，避免资源浪费
   */
  static preloadCoreAds() {
    console.log('开始预加载核心广告位');

    // 检查基础库版本支持
    if (!this.isSupportPreload()) {
      console.log('当前版本不支持广告预加载');
      return false;
    }

    // 检查网络状态
    if (!this.isNetworkAvailable()) {
      console.log('网络不可用，跳过广告预加载');
      return false;
    }

    try {
      // 只预加载核心广告位，减少资源消耗
      const coreAds = [
        {
          unitId: 'adunit-4e68875624a88762', // 横幅3单图 - 主要广告位
          type: 'custom'
        },
        {
          unitId: 'adunit-3b2e78fbdab16389', // 横幅2左文右图 - 备用广告位
          type: 'custom'
        }
      ];

      console.log('预加载广告列表:', coreAds);

      // 调用官方预加载接口
      wx.preloadAd(coreAds);
      
      console.log('广告预加载请求已发送');
      
      // 记录预加载时间
      wx.setStorageSync('lastAdPreloadTime', Date.now());
      
      return true;
    } catch (error) {
      console.error('广告预加载失败:', error);
      return false;
    }
  }

  /**
   * 检查是否支持广告预加载
   * @returns {boolean} 是否支持预加载
   */
  static isSupportPreload() {
    try {
      // 🎯 基于Context7最佳实践：使用新的API替代已弃用的wx.getSystemInfoSync
      const appBaseInfo = wx.getAppBaseInfo();
      const version = appBaseInfo.SDKVersion;
      const isSupported = this.compareVersion(version, '2.14.1') >= 0;
      
      console.log('基础库版本检查:', {
        currentVersion: version,
        requiredVersion: '2.14.1',
        isSupported
      });
      
      return isSupported;
    } catch (error) {
      console.error('版本检查失败:', error);
      return false;
    }
  }

  /**
   * 版本号比较
   * @param {string} v1 - 版本1
   * @param {string} v2 - 版本2
   * @returns {number} 比较结果：1(v1>v2), 0(v1=v2), -1(v1<v2)
   */
  static compareVersion(v1, v2) {
    const arr1 = v1.split('.');
    const arr2 = v2.split('.');
    const length = Math.max(arr1.length, arr2.length);

    for (let i = 0; i < length; i++) {
      const num1 = parseInt(arr1[i] || 0);
      const num2 = parseInt(arr2[i] || 0);
      
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    
    return 0;
  }

  /**
   * 检查网络可用性
   * @returns {boolean} 网络是否可用
   */
  static isNetworkAvailable() {
    try {
      const networkType = wx.getStorageSync('lastNetworkType') || 'unknown';
      return networkType !== 'none';
    } catch (error) {
      console.error('网络状态检查失败:', error);
      return false;
    }
  }

  /**
   * 智能预加载 - 根据使用频率和时间间隔决定是否预加载
   */
  static smartPreload() {
    try {
      const lastPreloadTime = wx.getStorageSync('lastAdPreloadTime') || 0;
      const now = Date.now();
      const preloadInterval = 30 * 60 * 1000; // 30分钟间隔

      // 如果距离上次预加载不足30分钟，跳过
      if (now - lastPreloadTime < preloadInterval) {
        console.log('距离上次预加载时间过短，跳过本次预加载');
        return false;
      }

      // 检查用户偏好
      const userPrefs = wx.getStorageSync('userAdPreferences') || {};
      if (userPrefs.reduceAds) {
        console.log('用户设置减少广告，跳过预加载');
        return false;
      }

      // 执行预加载
      return this.preloadCoreAds();
    } catch (error) {
      console.error('智能预加载失败:', error);
      return false;
    }
  }

  /**
   * 预加载特定上下文的广告
   * @param {string} context - 页面上下文
   */
  static preloadForContext(context) {
    if (!this.isSupportPreload() || !this.isNetworkAvailable()) {
      return false;
    }

    // 根据上下文选择预加载的广告
    const contextAdMap = {
      'list': 'adunit-4e68875624a88762',      // 列表页面
      'detail': 'adunit-3b2e78fbdab16389',    // 详情页面
      'tool': 'adunit-2f5afef0d27dc863',      // 工具页面
      'grid': 'adunit-735d7d24032d4ca8',      // 网格页面
      'st-middle': 'adunit-d6c8a55bd3cb4fd1', // S和T字母间广告
      'definition-ij': 'adunit-d7a3b71f5ce0afca', // 定义页面I和J字母间广告
      'definition-bottom': 'adunit-3a1bf3800fa937a2', // 定义页面底部广告
      'airport-mn': 'adunit-2f5afef0d27dc863', // 机场页面M和N字母间广告
      'airport-bottom': 'adunit-735d7d24032d4ca8', // 机场页面底部广告
      'communication-middle': 'adunit-2f5afef0d27dc863', // 通信页面"其他术语"和"爆炸物威胁"间广告
      'communication-bottom': 'adunit-735d7d24032d4ca8', // 通信页面底部广告
      'normative-bottom': 'adunit-4e68875624a88762', // 规章页面底部广告
      'a350-b737-middle': 'adunit-3b2e78fbdab16389', // 双发复飞梯度页面A350和B737系列间广告
      'departure-arrival-middle': 'adunit-d6c8a55bd3cb4fd1', // 日出日落页面出发地和到达地间广告
      'sunrise-bottom': 'adunit-d7a3b71f5ce0afca', // 日出日落查询结果底部广告
      'event-report': 'adunit-3a1bf3800fa937a2', // 事件样例填报页面广告
      'flight-time-share': 'adunit-2f5afef0d27dc863', // 分飞行时间页面广告
      'personal-checklist': 'adunit-735d7d24032d4ca8', // 个人检查单页面广告
      'qualification-manager': 'adunit-d6c8a55bd3cb4fd1' // 资质管理页面广告
    };

    const unitId = contextAdMap[context];
    if (!unitId) {
      console.log('未找到对应上下文的广告位:', context);
      return false;
    }

    try {
      wx.preloadAd([{
        unitId: unitId,
        type: 'custom'
      }]);
      
      console.log(`已预加载 ${context} 上下文的广告:`, unitId);
      return true;
    } catch (error) {
      console.error(`预加载 ${context} 上下文广告失败:`, error);
      return false;
    }
  }

  /**
   * 获取预加载状态信息
   * @returns {object} 预加载状态
   */
  static getPreloadStatus() {
    const lastPreloadTime = wx.getStorageSync('lastAdPreloadTime') || 0;
    // 🎯 基于Context7最佳实践：使用新的API替代已弃用的wx.getSystemInfoSync
    const appBaseInfo = wx.getAppBaseInfo();
    const networkType = wx.getStorageSync('lastNetworkType') || 'unknown';

    return {
      isSupported: this.isSupportPreload(),
      lastPreloadTime: lastPreloadTime ? new Date(lastPreloadTime).toLocaleString() : '从未预加载',
      sdkVersion: appBaseInfo.SDKVersion,
      networkType: networkType,
      canPreload: this.isSupportPreload() && this.isNetworkAvailable()
    };
  }

  /**
   * 清除预加载缓存
   */
  static clearPreloadCache() {
    try {
      wx.removeStorageSync('lastAdPreloadTime');
      console.log('预加载缓存已清除');
      return true;
    } catch (error) {
      console.error('清除预加载缓存失败:', error);
      return false;
    }
  }
}

module.exports = AdPreloader; 