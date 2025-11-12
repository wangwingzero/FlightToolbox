/**
 * 广告管理器 - 空实现版本
 *
 * 注意：激励视频广告功能已移除
 * 本模块保留空实现以避免其他页面引用报错
 *
 * 当前使用的广告类型：
 * - 横幅广告（Banner Ad）
 * - 格子广告（Grid Ad）
 */

var AdManager = {
  // 配置
  config: {
    storageKeys: {
      clickCount: 'ad_card_click_count',
      nextThreshold: 'ad_next_threshold',
      totalAdsWatched: 'ad_total_watched',
      lastAdTime: 'ad_last_watch_time'
    }
  },

  // 初始化标记
  isInitialized: false,

  /**
   * 初始化广告管理器（空实现）
   */
  init: function(options) {
    this.isInitialized = true;
    console.log('[AdManager] 初始化完成（激励广告已禁用）');
  },

  /**
   * 检查是否应该显示广告（始终返回false）
   */
  checkShouldShowAd: function() {
    return false;
  },

  /**
   * 检查并重定向到激励作者卡片（空实现）
   */
  checkAndRedirect: function() {
    return false;
  },

  /**
   * 检查并显示广告（空实现）
   */
  checkAndShow: function(options) {
    console.log('[AdManager] 激励广告功能已禁用');
    return false;
  },

  /**
   * 获取统计信息（返回默认值）
   */
  getStatistics: function() {
    return {
      clickCount: 0,
      nextThreshold: 999999,
      totalAdsWatched: 0,
      lastAdTime: 0,
      clicksUntilNext: 999999,
      timestamp: Date.now()
    };
  },

  /**
   * 重置统计数据（空实现）
   */
  resetStatistics: function() {
    var keys = this.config.storageKeys;
    Object.keys(keys).forEach(function(key) {
      wx.removeStorageSync(keys[key]);
    });
    console.log('[AdManager] 统计数据已重置');
  },

  /**
   * 调试信息（空实现）
   */
  debugInfo: function() {
    console.log('=== AdManager 调试信息 ===');
    console.log('激励广告功能: 已禁用');
    console.log('当前使用广告: 横幅广告、格子广告');
    console.log('=== 调试信息结束 ===');
    return this.getStatistics();
  }
};

module.exports = AdManager;
