/**
 * 插屏广告统一管理器
 * 提供全局频率控制和实例管理
 *
 * ⚠️ 重要说明：
 * - 插屏广告实例不能跨页面共用（微信官方限制）
 * - 所有TabBar页面使用同一个广告位ID：adunit-1a29f1939a1c7864
 * - 提供全局60秒频率控制，避免广告展示过于频繁
 *
 * 📋 授权的8个广告位ID：
 * 1. adunit-4e68875624a88762 - 横幅3单图
 * 2. adunit-3b2e78fbdab16389 - 横幅2左文右图
 * 3. adunit-2f5afef0d27dc863 - 横幅1左图右文
 * 4. adunit-735d7d24032d4ca8 - 格子1-多格子
 * 5. adunit-d6c8a55bd3cb4fd1 - 横幅卡片3-上文下图拼接
 * 6. adunit-d7a3b71f5ce0afca - 横幅卡片2-上图下文叠加A（我的首页使用）
 * 7. adunit-3a1bf3800fa937a2 - 横幅卡片1-上图下文叠加B
 * 8. adunit-1a29f1939a1c7864 - **通用插屏广告**（5个TabBar页面统一使用）
 *
 * 使用方式（推荐）：
 *
 * ```javascript
 * // 在页面JS文件中引入
 * const adHelper = require('../../utils/ad-helper.js');
 *
 * // 1. 在onLoad中创建插屏广告实例
 * customOnLoad(options) {
 *   this.data.interstitialAd = adHelper.setupInterstitialAd(this, '页面名称');
 * }
 *
 * // 2. 在onShow中展示插屏广告（带频率控制）
 * customOnShow() {
 *   adHelper.showInterstitialAdSafely(
 *     this.data.interstitialAd,
 *     1000,  // 延迟1秒展示
 *     this,
 *     '页面名称'
 *   );
 * }
 *
 * // 3. 在onUnload中清理广告实例
 * customOnUnload() {
 *   adHelper.cleanupInterstitialAd(this, '页面名称');
 * }
 * ```
 *
 * 横幅广告使用（WXML）：
 *
 * ```xml
 * <!-- 在页面底部添加横幅广告 -->
 * <view class="ad-banner-container">
 *   <ad unit-id="adunit-d6c8a55bd3cb4fd1" ad-type="banner" ad-intervals="30"></ad>
 * </view>
 * ```
 *
 * 注意事项：
 * - ⚠️ 仅使用授权的8个广告位ID，禁止使用其他ID
 * - ⚠️ 插屏广告在所有TabBar页面使用同一个ID（adunit-1a29f1939a1c7864）
 * - ⚠️ 页面卸载时必须调用cleanupInterstitialAd销毁广告实例
 * - 全局60秒频率控制，确保用户体验
 */

// 通用插屏广告位ID（所有TabBar页面复用此ID）
var INTERSTITIAL_AD_UNIT_ID = 'adunit-1a29f1939a1c7864';

// 全局最小展示间隔（60秒）
var MIN_INTERVAL = 60 * 1000;

// 全局广告实例缓存（仅在页面间复用广告位ID，实例由各页面管理）
var adInstancesCache = {};

// 调试模式开关（设为false可关闭详细日志）
var DEBUG_MODE = false;

/**
 * 检查是否可以展示广告（全局频率控制）
 * @returns {boolean} 是否可以展示
 */
function canShowAd() {
  var now = Date.now();
  var lastShowTime = 0;

  try {
    lastShowTime = wx.getStorageSync('global_interstitial_ad_last_show') || 0;
  } catch (e) {
    console.error('[AdHelper] 读取全局广告时间戳失败:', e);
  }

  var canShow = (now - lastShowTime) >= MIN_INTERVAL;

  // 频率限制提示（仅在调试模式显示）
  if (!canShow && DEBUG_MODE) {
    console.log('[AdHelper] 广告展示间隔过短，距上次展示', Math.floor((now - lastShowTime) / 1000), '秒，需要等待', Math.floor((MIN_INTERVAL - (now - lastShowTime)) / 1000), '秒');
  }

  return canShow;
}

/**
 * 更新全局广告展示时间戳
 */
function updateLastShowTime() {
  var now = Date.now();
  try {
    wx.setStorageSync('global_interstitial_ad_last_show', now);
    if (DEBUG_MODE) {
      console.log('[AdHelper] 更新全局广告时间戳:', now);
    }
  } catch (e) {
    console.error('[AdHelper] 保存全局广告时间戳失败:', e);
  }
}

/**
 * 为页面创建并配置插屏广告实例
 * @param {object} pageContext - 页面上下文(this)
 * @param {string} pageName - 页面名称（用于日志）
 * @returns {object|null} 广告实例，如果不支持则返回null
 */
function setupInterstitialAd(pageContext, pageName) {
  // 检查API是否支持
  if (!wx.createInterstitialAd) {
    console.warn('[AdHelper] 当前微信版本不支持插屏广告');
    return null;
  }

  var pageId = pageName || 'unknown';

  try {
    // 创建广告实例
    var interstitialAd = wx.createInterstitialAd({
      adUnitId: INTERSTITIAL_AD_UNIT_ID
    });

    // 监听广告加载成功
    interstitialAd.onLoad(function() {
      if (DEBUG_MODE) {
        console.log('[AdHelper]', pageId, '插屏广告加载成功');
      }
      if (pageContext && pageContext.setData) {
        pageContext.setData({ interstitialAdLoaded: true });
      }
    });

    // 监听广告加载失败
    interstitialAd.onError(function(err) {
      console.error('[AdHelper]', pageId, '插屏广告加载失败:', err);
      if (pageContext && pageContext.setData) {
        pageContext.setData({ interstitialAdLoaded: false });
      }
    });

    // 监听广告关闭
    interstitialAd.onClose(function() {
      if (DEBUG_MODE) {
        console.log('[AdHelper]', pageId, '插屏广告关闭');
      }
      updateLastShowTime();

      // 更新页面时间戳
      if (pageContext && pageContext.setData) {
        pageContext.setData({ lastInterstitialAdShowTime: Date.now() });
      }
    });

    if (DEBUG_MODE) {
      console.log('[AdHelper]', pageId, '插屏广告实例创建完成');
    }

    // 缓存实例引用（用于调试）
    adInstancesCache[pageId] = interstitialAd;

    return interstitialAd;

  } catch (error) {
    console.error('[AdHelper]', pageId, '创建插屏广告失败:', error);
    return null;
  }
}

/**
 * 安全展示插屏广告（带全局频率控制）
 * @param {object} adInstance - 广告实例
 * @param {number} delay - 延迟展示时间（毫秒），默认1000
 * @param {object} pageContext - 页面上下文（可选，用于createSafeTimeout）
 * @param {string} pageName - 页面名称（用于日志）
 */
function showInterstitialAdSafely(adInstance, delay, pageContext, pageName) {
  // 检查广告实例是否有效
  if (!adInstance) {
    if (DEBUG_MODE) {
      console.log('[AdHelper] 广告实例无效，跳过展示');
    }
    return;
  }

  // 全局频率控制
  if (!canShowAd()) {
    return;
  }

  var delayTime = delay || 1000;
  var pageId = pageName || 'unknown';

  // 如果页面提供了createSafeTimeout方法，优先使用（自动清理）
  if (pageContext && typeof pageContext.createSafeTimeout === 'function') {
    pageContext.createSafeTimeout(function() {
      if (!adInstance) {
        if (DEBUG_MODE) {
          console.log('[AdHelper]', pageId, '广告实例已销毁，取消展示');
        }
        return;
      }

      adInstance.show().then(function() {
        if (DEBUG_MODE) {
          console.log('[AdHelper]', pageId, '插屏广告展示成功');
        }
      }).catch(function(err) {
        console.error('[AdHelper]', pageId, '插屏广告展示失败:', err);
      });
    }, delayTime, '插屏广告延迟展示');
  } else {
    // 降级使用普通setTimeout
    setTimeout(function() {
      if (!adInstance) {
        if (DEBUG_MODE) {
          console.log('[AdHelper]', pageId, '广告实例已销毁，取消展示');
        }
        return;
      }

      adInstance.show().then(function() {
        if (DEBUG_MODE) {
          console.log('[AdHelper]', pageId, '插屏广告展示成功');
        }
      }).catch(function(err) {
        console.error('[AdHelper]', pageId, '插屏广告展示失败:', err);
      });
    }, delayTime);
  }
}

/**
 * 清理插屏广告实例
 * @param {object} pageContext - 页面上下文(this)
 * @param {string} pageName - 页面名称（用于日志）
 */
function cleanupInterstitialAd(pageContext, pageName) {
  var pageId = pageName || 'unknown';

  if (pageContext && pageContext.data && pageContext.data.interstitialAd) {
    var adInstance = pageContext.data.interstitialAd;

    if (adInstance && adInstance.destroy) {
      adInstance.destroy();
      if (DEBUG_MODE) {
        console.log('[AdHelper]', pageId, '插屏广告实例已销毁');
      }
    }

    // 清理实例引用
    if (pageContext.setData) {
      pageContext.setData({
        interstitialAd: null,
        interstitialAdLoaded: false
      });
    }

    // 从缓存中移除
    delete adInstancesCache[pageId];
  }
}

/**
 * 获取插屏广告位ID（用于调试）
 * @returns {string} 广告位ID
 */
function getInterstitialAdUnitId() {
  return INTERSTITIAL_AD_UNIT_ID;
}

/**
 * 获取当前缓存的广告实例数量（用于调试）
 * @returns {number} 缓存的实例数量
 */
function getCachedInstancesCount() {
  return Object.keys(adInstancesCache).length;
}

/**
 * 清理所有广告实例（谨慎使用，仅在应用退出时调用）
 */
function cleanupAllInstances() {
  var count = 0;
  for (var pageId in adInstancesCache) {
    var adInstance = adInstancesCache[pageId];
    if (adInstance && adInstance.destroy) {
      adInstance.destroy();
      count++;
    }
  }
  adInstancesCache = {};
  if (DEBUG_MODE) {
    console.log('[AdHelper] 已清理', count, '个广告实例');
  }
}

module.exports = {
  // 主要API
  setupInterstitialAd: setupInterstitialAd,
  showInterstitialAdSafely: showInterstitialAdSafely,
  cleanupInterstitialAd: cleanupInterstitialAd,

  // 频率控制
  canShowAd: canShowAd,
  updateLastShowTime: updateLastShowTime,

  // 工具方法
  getInterstitialAdUnitId: getInterstitialAdUnitId,
  getCachedInstancesCount: getCachedInstancesCount,
  cleanupAllInstances: cleanupAllInstances
};
