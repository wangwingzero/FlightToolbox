/**
 * 广告管理器 - 离线友好的本地广告管理
 * 基于Context7最佳实践，专为离线用户设计
 */
class AdManager {
  constructor() {
    // 🎯 基于Context7最佳实践：7个广告位平均分配
    this.adUnits = [
      // 横幅卡片类（收入最高）- 用于重要页面
      { id: 'adunit-d6c8a55bd3cb4fd1', type: 'custom', context: 'search-results', priority: 'high', format: 'card-banner' },
      { id: 'adunit-d7a3b71f5ce0afca', type: 'custom', context: 'detail-page', priority: 'high', format: 'card-overlay-a' },
      { id: 'adunit-3a1bf3800fa937a2', type: 'custom', context: 'list-page', priority: 'high', format: 'card-overlay-b' },
      
      // 横幅类（中等收入）- 用于一般页面
      { id: 'adunit-4e68875624a88762', type: 'custom', context: 'tool', priority: 'medium', format: 'banner-single' },
      { id: 'adunit-3b2e78fbdab16389', type: 'custom', context: 'secondary-page', priority: 'medium', format: 'banner-left-text' },
      { id: 'adunit-2f5afef0d27dc863', type: 'custom', context: 'tertiary-page', priority: 'medium', format: 'banner-left-image' },
      
      // 格子类（体积小）- 用于补充位置
      { id: 'adunit-735d7d24032d4ca8', type: 'custom', context: 'grid', priority: 'low', format: 'grid-multi' }
    ];
    
    // 广告显示历史记录
    this.adHistory = this.getAdHistory();

    console.log('AdManager初始化完成，共配置', this.adUnits.length, '个广告位');
  }

  /**
   * 基于上下文选择最适合的广告单元
   * @param {string} context - 页面上下文：list, detail, tool, grid, card等
   * @returns {object|null} 广告单元配置或null
   */
  getBestAdUnit(context = 'default', pageType = 'primary') {
    if (!this.isNetworkAvailable()) return null;
  
    const userPrefs = this.getUserPreferences();
    if (userPrefs.reduceAds && !this.canShowAd()) return null;
  
    // 根据页面类型和上下文选择广告
    let candidates = this.selectCandidatesByContext(context, pageType);
    
    if (candidates.length === 0) {
      // 兜底：使用默认广告
      candidates = this.adUnits.filter(unit => unit.priority === 'medium');
    }
    
    // 平均分配算法：选择最少使用的广告单元
    return this.selectLeastUsedAd(candidates);
  }

  /**
   * 检查网络可用性
   * @returns {boolean} 网络是否可用
   */
  isNetworkAvailable() {
    try {
      const networkType = wx.getStorageSync('lastNetworkType') || 'unknown';
      return networkType !== 'none';
    } catch (e) {
      console.log('网络状态检查失败:', e);
      return false; // 保守处理，网络检查失败时不显示广告
    }
  }

  /**
   * 根据上下文选择候选广告
   * @param {string} context - 页面上下文
   * @returns {array} 广告单元配置
   */
  selectCandidatesByContext(context, pageType) {
    const contextMap = {
      // 万能查询页面相关
      'search-results': ['search-results', 'list-page'],
      'letter-groups': ['list-page', 'grid'],
      'letter-items': ['secondary-page', 'detail-page'],
      'detail-view': ['detail-page', 'tertiary-page'],
      'st-middle': ['secondary-page', 'list-page'],
      'definition-ij': ['secondary-page', 'detail-page'],
      'definition-bottom': ['detail-page', 'tool'],
      'airport-mn': ['secondary-page', 'list-page'],
      'airport-bottom': ['detail-page', 'grid'],
      'communication-middle': ['secondary-page', 'tertiary-page'],
      'communication-bottom': ['detail-page', 'tool'],
      'normative-bottom': ['tool', 'detail-page'],
      
      // 实用工具页面相关
      'tool': ['tool', 'banner-single'],
      'calculator': ['tool', 'detail-page'],
      'converter': ['tool', 'secondary-page'],
      'calculation': ['tool', 'detail-page'],
      'a350-b737-middle': ['secondary-page', 'tertiary-page'],
      'departure-arrival-middle': ['search-results', 'tool'],
      'sunrise-bottom': ['detail-page', 'tool'],
      'event-report': ['list-page', 'search-results'],
      'flight-time-share': ['tool', 'calculator'],
      'personal-checklist': ['list-page', 'management'],
      'qualification-manager': ['management', 'list-page'],
      'snowtam-decoder': ['detail-page', 'tool'],
      
      // 其他页面类型
      'list': ['list-page', 'search-results'],
      'grid': ['grid', 'list-page']
    };
    
    const relevantContexts = contextMap[context] || [context];
    
    return this.adUnits.filter(unit => 
      relevantContexts.includes(unit.context) ||
      relevantContexts.includes(unit.format)
    );
  }

  /**
   * 选择最少使用的广告单元（平均分配）
   * @param {array} candidates - 候选广告单元
   * @returns {object|null} 选择的广告单元配置或null
   */
  selectLeastUsedAd(candidates) {
    if (candidates.length === 0) return null;
    
    // 获取每个广告单元的使用次数
    const usageCounts = candidates.map(unit => ({
      unit,
      count: this.adHistory[unit.id] || 0
    }));
    
    // 找到使用次数最少的广告单元
    const minCount = Math.min(...usageCounts.map(item => item.count));
    const leastUsedAds = usageCounts.filter(item => item.count === minCount);
    
    // 如果有多个最少使用的，随机选择一个
    const randomIndex = Math.floor(Math.random() * leastUsedAds.length);
    return leastUsedAds[randomIndex].unit;
  }

  /**
   * 获取广告显示历史
   * @returns {object} 广告历史记录
   */
  getAdHistory() {
    try {
      return wx.getStorageSync('adDisplayHistory') || {};
    } catch (e) {
      console.log('获取广告历史失败:', e);
      return {};
    }
  }

  /**
   * 记录广告显示时间
   * @param {string} unitId - 广告单元ID
   */
  recordAdShown(unitId) {
    try {
      const history = this.getAdHistory();
      history[unitId] = (history[unitId] || 0) + 1;
      wx.setStorageSync('adDisplayHistory', history);
      wx.setStorageSync('lastAdTime', Date.now());
    } catch (e) {
      console.log('记录广告显示失败:', e);
    }
  }

  /**
   * 获取用户偏好设置
   * @returns {object} 用户偏好配置
   */
  getUserPreferences() {
    try {
      const preferences = wx.getStorageSync('userAdPreferences') || {
        reduceAds: false,           // 是否减少广告显示
        allowPersonalized: true,    // 是否允许个性化广告
        lastUpdated: Date.now()     // 最后更新时间
      };
      
      // 检查减少广告功能是否过期
      if (preferences.reduceAds && preferences.reduceAdsExpireTime) {
        const currentTime = Date.now();
        if (currentTime >= preferences.reduceAdsExpireTime) {
          // 已过期，自动关闭减少广告功能
          console.log('🎯 减少广告功能已过期，自动关闭');
          preferences.reduceAds = false;
          preferences.reduceAdsExpireTime = 0;
          
          // 更新存储
          this.updateUserPreferences(preferences);
          
          // 清除过期时间存储
          wx.removeStorageSync('reduceAdsExpireTime');
        }
      }
      
      return preferences;
    } catch (e) {
      console.log('获取用户偏好失败:', e);
      return { 
        reduceAds: false, 
        allowPersonalized: true,
        lastUpdated: Date.now()
      };
    }
  }

  /**
   * 更新用户偏好设置
   * @param {object} preferences - 新的偏好设置
   */
  updateUserPreferences(preferences) {
    try {
      const updatedPreferences = {
        ...this.getUserPreferences(),
        ...preferences,
        lastUpdated: Date.now()
      };
      
      wx.setStorageSync('userAdPreferences', updatedPreferences);
      console.log('用户偏好已更新:', updatedPreferences);
      
      return true;
    } catch (e) {
      console.log('更新用户偏好失败:', e);
      return false;
    }
  }

  /**
   * 检查是否可以显示广告（减少广告模式下的时间间隔检查）
   * @returns {boolean} 是否可以显示广告
   */
  canShowAd() {
    try {
      const lastShown = wx.getStorageSync('lastAdTime') || 0;
      const now = Date.now();
      const interval = 10 * 60 * 1000; // 10分钟间隔
      
      const canShow = (now - lastShown) >= interval;
      console.log('广告显示间隔检查:', {
        lastShown: new Date(lastShown).toLocaleTimeString(),
        now: new Date(now).toLocaleTimeString(),
        intervalMinutes: interval / 60000,
        canShow
      });
      
      return canShow;
    } catch (e) {
      console.log('广告间隔检查失败:', e);
      return true; // 检查失败时允许显示
    }
  }

  /**
   * 获取广告状态信息（调试用）
   * @returns {object} 广告状态信息
   */
  getAdStats() {
    const history = this.getAdHistory();
    const stats = this.adUnits.map(unit => ({
      id: unit.id,
      context: unit.context,
      format: unit.format,
      priority: unit.priority,
      displayCount: history[unit.id] || 0
    }));
    
    return {
      totalDisplays: Object.values(history).reduce((sum, count) => sum + count, 0),
      adUnits: stats
    };
  }

  /**
   * 重置广告历史（用于测试）
   */
  resetAdHistory() {
    try {
      wx.removeStorageSync('adDisplayHistory');
      wx.removeStorageSync('lastAdTime');
    } catch (e) {
      console.log('重置广告历史失败:', e);
    }
  }
}

module.exports = AdManager; 