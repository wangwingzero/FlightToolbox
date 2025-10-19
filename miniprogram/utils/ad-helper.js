/**
 * 插屏广告统一管理器（升级版）
 *
 * 🚀 v2.0 升级说明：
 * - 引入智能广告展示策略（ad-strategy.js）
 * - 多维度控制：时间 + 操作次数 + 会话管理
 * - 场景感知：驾驶舱等关键页面不展示
 * - 用户分层：新用户保护期
 * - 基于行业最佳实践：Google建议每小时1次，每2-4次操作1次
 *
 * ⚠️ 重要说明：
 * - 插屏广告实例不能跨页面共用（微信官方限制）
 * - 所有TabBar页面使用同一个广告位ID：adunit-1a29f1939a1c7864
 * - 智能频率控制：
 *   ✓ 基础时间间隔：5分钟
 *   ✓ 操作次数阈值：至少4次页面切换
 *   ✓ 会话限制：每30分钟最多2次
 *   ✓ 每日上限：每天最多8次
 *   ✓ 新用户保护：首次使用15分钟或10次操作后才展示
 *   ✓ 驾驶舱页面不展示（关键功能保护）
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
 * // 2. 在onShow中展示插屏广告（智能频率控制）
 * customOnShow() {
 *   // 获取当前页面路径
 *   var pages = getCurrentPages();
 *   var currentPage = pages[pages.length - 1];
 *   var route = currentPage.route || '';
 *
 *   adHelper.showInterstitialAdWithStrategy(
 *     this.data.interstitialAd,
 *     route,  // 当前页面路径
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
 * - ✅ 智能策略自动管理频率，无需手动控制
 * - 📊 可使用getAdStatistics()查看广告展示统计
 */

// 引入智能广告展示策略
var adStrategy = require('./ad-strategy.js');

// 通用插屏广告位ID（所有TabBar页面复用此ID）
var INTERSTITIAL_AD_UNIT_ID = 'adunit-1a29f1939a1c7864';

// 全局广告实例缓存（仅在页面间复用广告位ID，实例由各页面管理）
var adInstancesCache = {};

// 调试模式开关（设为false可关闭详细日志）
var DEBUG_MODE = false;

// 🆕 失败降级机制
var FAILURE_DEGRADATION = {
  consecutiveFailures: 0,        // 连续失败次数
  maxConsecutiveFailures: 3,     // 最大连续失败次数
  pauseDuration: 30 * 60 * 1000, // 暂停时长：30分钟
  pauseUntil: 0,                 // 暂停截止时间
  lastFailureTime: 0             // 最后失败时间
};

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

      // 🆕 广告加载成功，重置失败计数器和暂停状态
      FAILURE_DEGRADATION.consecutiveFailures = 0;
      FAILURE_DEGRADATION.pauseUntil = 0;

      if (pageContext && pageContext.setData) {
        pageContext.setData({ interstitialAdLoaded: true });
      }
    });

    // 监听广告加载失败
    interstitialAd.onError(function(err) {
      console.error('[AdHelper]', pageId, '插屏广告加载失败:', err);

      // 🆕 失败降级：记录连续失败
      FAILURE_DEGRADATION.consecutiveFailures++;
      FAILURE_DEGRADATION.lastFailureTime = Date.now();

      // 达到失败阈值，暂停广告展示
      if (FAILURE_DEGRADATION.consecutiveFailures >= FAILURE_DEGRADATION.maxConsecutiveFailures) {
        FAILURE_DEGRADATION.pauseUntil = Date.now() + FAILURE_DEGRADATION.pauseDuration;
        console.warn('[AdHelper]', pageId, '连续失败' + FAILURE_DEGRADATION.maxConsecutiveFailures + '次，暂停广告30分钟');
      }

      if (pageContext && pageContext.setData) {
        pageContext.setData({ interstitialAdLoaded: false });
      }
    });

    // 监听广告关闭
    interstitialAd.onClose(function() {
      if (DEBUG_MODE) {
        console.log('[AdHelper]', pageId, '插屏广告关闭');
      }

      // 记录广告已展示（更新策略统计）
      adStrategy.recordAdShown();

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
 * 使用智能策略展示插屏广告（推荐使用）
 * @param {object} adInstance - 广告实例
 * @param {string} currentPageRoute - 当前页面路径（用于策略判断）
 * @param {object} pageContext - 页面上下文（可选，用于createSafeTimeout）
 * @param {string} pageName - 页面名称（用于日志）
 */
function showInterstitialAdWithStrategy(adInstance, currentPageRoute, pageContext, pageName) {
  // 检查广告实例是否有效
  if (!adInstance) {
    if (DEBUG_MODE) {
      console.log('[AdHelper] 广告实例无效，跳过展示');
    }
    return;
  }

  var pageId = pageName || 'unknown';

  // 🆕 失败降级：检查是否在暂停期内
  var now = Date.now();
  if (FAILURE_DEGRADATION.pauseUntil > now) {
    var remainingMinutes = Math.ceil((FAILURE_DEGRADATION.pauseUntil - now) / 60000);
    console.log('[AdHelper]', pageId, '广告暂停中，剩余', remainingMinutes, '分钟');
    return;
  }

  // 记录用户操作（页面切换）
  adStrategy.recordAction(currentPageRoute);

  // 使用智能策略判断是否展示广告
  var decision = adStrategy.shouldShowAd(currentPageRoute);

  if (!decision.canShow) {
    if (DEBUG_MODE) {
      console.log('[AdHelper]', pageId, '跳过广告展示:', decision.reason);
    }
    return;
  }

  // 满足展示条件，延迟展示广告
  var delayTime = adStrategy.CONFIG.SHOW_DELAY;

  console.log('[AdHelper]', pageId, '准备展示广告:', decision.reason, '优先级:', decision.priority);

  // 如果页面提供了createSafeTimeout方法，优先使用（自动清理）
  if (pageContext && typeof pageContext.createSafeTimeout === 'function') {
    pageContext.createSafeTimeout(function() {
      // 检查页面是否仍然存活（防止延迟期间页面已销毁）
      try {
        var pages = getCurrentPages();
        var isPageAlive = false;
        for (var i = 0; i < pages.length; i++) {
          if (pages[i] === pageContext) {
            isPageAlive = true;
            break;
          }
        }

        if (!isPageAlive) {
          if (DEBUG_MODE) {
            console.log('[AdHelper]', pageId, '页面已销毁，取消广告展示');
          }
          return;
        }
      } catch (e) {
        console.error('[AdHelper]', pageId, '检查页面状态失败:', e);
        return;  // 🆕 页面状态检查失败，安全退出
      }

      if (!adInstance) {
        if (DEBUG_MODE) {
          console.log('[AdHelper]', pageId, '广告实例已销毁，取消展示');
        }
        return;
      }

      adInstance.show().then(function() {
        console.log('[AdHelper]', pageId, '插屏广告展示成功');
        // 🆕 展示成功，重置失败计数和暂停状态
        FAILURE_DEGRADATION.consecutiveFailures = 0;
        FAILURE_DEGRADATION.pauseUntil = 0;
      }).catch(function(err) {
        console.error('[AdHelper]', pageId, '插屏广告展示失败:', err);
        // ⚠️ 这里不增加失败计数，因为onError已经处理
      });
    }, delayTime, '插屏广告延迟展示');
  } else {
    // 降级使用普通setTimeout
    setTimeout(function() {
      // 检查页面是否仍然存活（防止延迟期间页面已销毁）
      try {
        var pages = getCurrentPages();
        var isPageAlive = false;
        for (var i = 0; i < pages.length; i++) {
          if (pages[i] === pageContext) {
            isPageAlive = true;
            break;
          }
        }

        if (!isPageAlive) {
          if (DEBUG_MODE) {
            console.log('[AdHelper]', pageId, '页面已销毁，取消广告展示');
          }
          return;
        }
      } catch (e) {
        console.error('[AdHelper]', pageId, '检查页面状态失败:', e);
        return;  // 🆕 页面状态检查失败，安全退出
      }

      if (!adInstance) {
        if (DEBUG_MODE) {
          console.log('[AdHelper]', pageId, '广告实例已销毁，取消展示');
        }
        return;
      }

      adInstance.show().then(function() {
        console.log('[AdHelper]', pageId, '插屏广告展示成功');
        // 🆕 展示成功，重置失败计数和暂停状态
        FAILURE_DEGRADATION.consecutiveFailures = 0;
        FAILURE_DEGRADATION.pauseUntil = 0;
      }).catch(function(err) {
        console.error('[AdHelper]', pageId, '插屏广告展示失败:', err);
        // ⚠️ 这里不增加失败计数，因为onError已经处理
      });
    }, delayTime);
  }
}

/**
 * 安全展示插屏广告（简化版，兼容旧接口）
 * ⚠️ 推荐使用showInterstitialAdWithStrategy以获得完整的智能策略支持
 * @param {object} adInstance - 广告实例
 * @param {number} delay - 延迟展示时间（毫秒），默认1500
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

  var delayTime = delay || 1500;
  var pageId = pageName || 'unknown';

  // 获取当前页面路径
  var currentPageRoute = '';
  try {
    var pages = getCurrentPages();
    if (pages && pages.length > 0) {
      var currentPage = pages[pages.length - 1];
      currentPageRoute = currentPage.route || '';
    }
  } catch (e) {
    console.error('[AdHelper] 获取当前页面路径失败:', e);
  }

  // 使用智能策略（自动判断）
  showInterstitialAdWithStrategy(adInstance, currentPageRoute, pageContext, pageId);
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
 * 获取广告展示统计信息（用于调试和监控）
 * @returns {object} 统计信息对象
 */
function getAdStatistics() {
  return adStrategy.getAdStatistics();
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

/**
 * 重置所有广告数据（用于测试，仅开发环境使用）
 */
function resetAllAdData() {
  if (DEBUG_MODE) {
    console.warn('[AdHelper] 重置所有广告数据（仅用于测试）');
    adStrategy.resetAllData();
  } else {
    console.error('[AdHelper] 生产环境禁止重置广告数据');
  }
}

/**
 * 检查是否可以展示广告（兼容旧接口，已废弃）
 * @deprecated 请使用showInterstitialAdWithStrategy，内部会自动判断
 * @returns {boolean} 是否可以展示
 */
function canShowAd() {
  console.warn('[AdHelper] canShowAd已废弃，请使用showInterstitialAdWithStrategy');
  var pages = getCurrentPages();
  var currentPage = pages[pages.length - 1];
  var route = currentPage ? currentPage.route : '';
  var decision = adStrategy.shouldShowAd(route);
  return decision.canShow;
}

/**
 * 更新全局广告展示时间戳（兼容旧接口，已废弃）
 * @deprecated 广告关闭时会自动调用adStrategy.recordAdShown()
 */
function updateLastShowTime() {
  console.warn('[AdHelper] updateLastShowTime已废弃，系统会自动管理');
  adStrategy.recordAdShown();
}

module.exports = {
  // ==================== 推荐API（v2.0） ====================
  setupInterstitialAd: setupInterstitialAd,
  showInterstitialAdWithStrategy: showInterstitialAdWithStrategy,
  cleanupInterstitialAd: cleanupInterstitialAd,

  // 统计和调试
  getAdStatistics: getAdStatistics,
  getInterstitialAdUnitId: getInterstitialAdUnitId,
  getCachedInstancesCount: getCachedInstancesCount,
  resetAllAdData: resetAllAdData,
  cleanupAllInstances: cleanupAllInstances,

  // ==================== 兼容旧接口（已废弃） ====================
  showInterstitialAdSafely: showInterstitialAdSafely,  // 兼容，但推荐用showInterstitialAdWithStrategy
  canShowAd: canShowAd,                                 // 已废弃
  updateLastShowTime: updateLastShowTime,               // 已废弃

  // ==================== 策略管理器引用 ====================
  adStrategy: adStrategy  // 暴露策略管理器，用于高级自定义
};
