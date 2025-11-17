/**
 * 智能广告展示策略管理器
 * 针对TabBar切换和卡片点击优化的高频展示策略
 *
 * 📊 策略设计原则：
 * 1. 激励视频广告奖励：用户观看后**1小时内**所有广告（横幅+插屏）全部隐藏 🎁
 * 2. TabBar页面专属：严格限制只在5个TabBar页面展示，子页面不触发
 * 3. 超高频优化：1分钟最小间隔
 * 4. 全TabBar覆盖：包括驾驶舱在内的所有TabBar页面
 * 5. 无新手保护：立即展示广告
 * 6. 🆕 卡片点击触发：在TabBar页面点击卡片时也触发广告判断
 *
 * 🎯 核心算法：
 * - 🎁 激励视频奖励：最高优先级，获得奖励后**1小时内**直接跳过插屏广告
 * - 基础时间间隔：1分钟（极致收益优化）
 * - TabBar白名单：仅5个TabBar页面，子页面不触发
 * - 操作次数阈值：1次（每次TabBar切换或卡片点击都可能展示）
 * - 会话限制：每30分钟最多30次
 * - 每日上限：每天最多300次（超高收益优化）
 * - 新用户保护：关闭（立即展示）
 */

// ==================== 配置参数 ====================

var CONFIG = {
  // 基础时间间隔（1分钟 = 60秒）- 极致收益优化
  BASE_TIME_INTERVAL: 1 * 60 * 1000,

  // 最少操作次数（页面切换次数）- 每次TabBar切换都可能展示
  MIN_ACTION_COUNT: 1,

  // 会话时长定义（30分钟）
  SESSION_DURATION: 30 * 60 * 1000,

  // 每个会话最多展示次数 - 超高收益优化
  MAX_ADS_PER_SESSION: 30,

  // 每日最大展示次数 - 超高收益优化
  MAX_ADS_PER_DAY: 300,

  // 新用户保护期（0分钟 = 关闭新手保护）
  NEW_USER_PROTECTION_TIME: 0,

  // 新用户保护操作次数（0次 = 关闭新手保护）
  NEW_USER_PROTECTION_ACTIONS: 0,

  // 展示延迟（页面显示后延迟展示，避免意外点击）
  SHOW_DELAY: 1500,

  // TabBar页面白名单（严格限制：只有这5个页面展示广告，子页面不触发）
  TABBAR_PAGES_WHITELIST: [
    'pages/search/index',
    'pages/flight-calculator/index',
    'pages/cockpit/index',
    'pages/operations/index',
    'pages/home/index'
  ],

  // 黑名单页面（已废弃，使用白名单机制）
  BLACKLIST_PAGES: [],

  // 优先级页面（所有TabBar页面平等对待）
  PRIORITY_PAGES: [
    'pages/search/index',
    'pages/flight-calculator/index',
    'pages/cockpit/index',
    'pages/operations/index',
    'pages/home/index'
  ]
};

// ==================== 存储键名 ====================

var STORAGE_KEYS = {
  LAST_SHOW_TIME: 'ad_last_show_time',           // 最后展示时间
  ACTION_COUNT: 'ad_action_count',               // 操作计数
  SESSION_START_TIME: 'ad_session_start',        // 会话开始时间
  SESSION_AD_COUNT: 'ad_session_count',          // 会话内广告次数
  DAILY_AD_COUNT: 'ad_daily_count',              // 每日广告次数
  DAILY_COUNT_DATE: 'ad_daily_date',             // 每日计数日期
  FIRST_LAUNCH_TIME: 'app_first_launch_time',    // 首次启动时间
  LAST_PAGE_ROUTE: 'ad_last_page_route'          // 上一个页面路径
};

// 调试模式开关：仅在本文件内部控制广告策略的详细日志
var DEBUG_MODE = false;

// ==================== 工具函数 ====================

/**
 * 安全获取本地存储数据
 */
function getStorageData(key, defaultValue) {
  try {
    var value = wx.getStorageSync(key);
    return value !== undefined && value !== null && value !== '' ? value : defaultValue;
  } catch (e) {
    console.error('[AdStrategy] 读取存储失败:', key, e);
    return defaultValue;
  }
}

/**
 * 安全设置本地存储数据（带容量检查）
 */
function setStorageData(key, value) {
  try {
    // 检查存储容量（微信小程序限制10MB）
    try {
      var info = wx.getStorageInfoSync();
      if (info && info.currentSize && info.limitSize) {
        // 存储空间使用超过90%时发出警告
        if (info.currentSize >= info.limitSize * 0.9) {
          console.warn('[AdStrategy] 存储空间接近上限:', info.currentSize, '/', info.limitSize, 'KB');
        }
      }
    } catch (infoError) {
      // getStorageInfoSync失败不影响主流程
      console.error('[AdStrategy] 获取存储信息失败:', infoError);
    }

    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error('[AdStrategy] 保存存储失败:', key, e);
    return false;
  }
}

/**
 * 获取今天的日期字符串（YYYY-MM-DD）
 * 注意：使用本地时区，跨时区场景可能需要特殊处理
 */
function getTodayString() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  // 兼容ES5的补零方法
  var monthStr = month < 10 ? '0' + month : String(month);
  var dayStr = day < 10 ? '0' + day : String(day);

  return year + '-' + monthStr + '-' + dayStr;
}

/**
 * 检查是否为新用户（首次启动后的保护期内）
 */
function isNewUserProtected() {
  var firstLaunchTime = getStorageData(STORAGE_KEYS.FIRST_LAUNCH_TIME, 0);

  // 如果没有首次启动时间，记录当前时间
  if (!firstLaunchTime) {
    firstLaunchTime = Date.now();
    setStorageData(STORAGE_KEYS.FIRST_LAUNCH_TIME, firstLaunchTime);
  }

  var now = Date.now();
  var timeSinceFirstLaunch = now - firstLaunchTime;
  var actionCount = getStorageData(STORAGE_KEYS.ACTION_COUNT, 0);

  // 新用户保护：时间和操作次数双重判断
  var isProtected = timeSinceFirstLaunch < CONFIG.NEW_USER_PROTECTION_TIME ||
                    actionCount < CONFIG.NEW_USER_PROTECTION_ACTIONS;

  if (isProtected) {
    if (DEBUG_MODE) {
      console.log('[AdStrategy] 新用户保护期：已使用', Math.floor(timeSinceFirstLaunch / 1000 / 60), '分钟，操作', actionCount, '次');
    }
  }

  return isProtected;
}

/**
 * 检查并重置每日计数
 */
function checkAndResetDailyCount() {
  var today = getTodayString();
  var savedDate = getStorageData(STORAGE_KEYS.DAILY_COUNT_DATE, '');

  if (savedDate !== today) {
    // 新的一天，重置计数
    setStorageData(STORAGE_KEYS.DAILY_AD_COUNT, 0);
    setStorageData(STORAGE_KEYS.DAILY_COUNT_DATE, today);
    if (DEBUG_MODE) {
      console.log('[AdStrategy] 新的一天，重置每日广告计数');
    }
    return 0;
  }

  return getStorageData(STORAGE_KEYS.DAILY_AD_COUNT, 0);
}

/**
 * 检查并重置会话
 */
function checkAndResetSession() {
  var now = Date.now();
  var sessionStartTime = getStorageData(STORAGE_KEYS.SESSION_START_TIME, 0);

  // 如果没有会话或会话超时，创建新会话
  if (!sessionStartTime || (now - sessionStartTime) > CONFIG.SESSION_DURATION) {
    setStorageData(STORAGE_KEYS.SESSION_START_TIME, now);
    setStorageData(STORAGE_KEYS.SESSION_AD_COUNT, 0);
    if (DEBUG_MODE) {
      console.log('[AdStrategy] 新会话开始');
    }
    return 0;
  }

  return getStorageData(STORAGE_KEYS.SESSION_AD_COUNT, 0);
}

/**
 * 检查页面是否在TabBar白名单中（严格匹配）
 * 只有完全匹配TabBar页面路径才返回true，子页面返回false
 */
function isTabBarPage(pageRoute) {
  if (!pageRoute) return false;

  // 严格匹配：页面路径必须完全等于白名单中的某一项
  return CONFIG.TABBAR_PAGES_WHITELIST.some(function(tabbarPage) {
    return pageRoute === tabbarPage;
  });
}

/**
 * 检查页面是否在黑名单中（已废弃，保留兼容）
 */
function isPageBlacklisted(pageRoute) {
  if (!pageRoute) return false;

  return CONFIG.BLACKLIST_PAGES.some(function(blacklistPage) {
    return pageRoute.indexOf(blacklistPage) !== -1;
  });
}

/**
 * 检查页面是否为优先级页面
 */
function isPriorityPage(pageRoute) {
  if (!pageRoute) return false;

  return CONFIG.PRIORITY_PAGES.some(function(priorityPage) {
    return pageRoute.indexOf(priorityPage) !== -1;
  });
}

// ==================== 核心决策函数 ====================

/**
 * 记录用户操作（页面切换）
 * @param {string} pageRoute - 当前页面路径
 */
function recordAction(pageRoute) {
  var actionCount = getStorageData(STORAGE_KEYS.ACTION_COUNT, 0);
  actionCount++;
  setStorageData(STORAGE_KEYS.ACTION_COUNT, actionCount);
  setStorageData(STORAGE_KEYS.LAST_PAGE_ROUTE, pageRoute);
  if (DEBUG_MODE) {
    console.log('[AdStrategy] 记录操作，当前计数:', actionCount, '页面:', pageRoute);
  }
}

/**
 * 智能判断是否应该展示广告
 * @param {string} currentPageRoute - 当前页面路径
 * @returns {object} { canShow: boolean, reason: string, priority: number }
 */
function shouldShowAd(currentPageRoute) {
  var result = {
    canShow: false,
    reason: '',
    priority: 0
  };

  // 🎁 最高优先级检查：激励视频广告奖励（今日无广告）
  try {
    var adFreeManager = require('./ad-free-manager.js');
    if (adFreeManager.isAdFreeToday()) {
      result.reason = '用户已获得今日无广告奖励（激励视频广告）';
      if (DEBUG_MODE) {
        console.log('[AdStrategy] 🎁 用户今日无广告，跳过插屏广告展示');
      }
      return result;
    }
  } catch (e) {
    console.error('[AdStrategy] 检查无广告状态失败:', e);
    // 检查失败时继续执行，不影响正常广告展示
  }

  // ⚠️ 最高优先级检查：TabBar白名单验证（严格限制）
  if (!isTabBarPage(currentPageRoute)) {
    result.reason = '非TabBar页面，不展示广告（仅' + CONFIG.TABBAR_PAGES_WHITELIST.length + '个TabBar页面展示）';
    return result;
  }

  // 1. 检查当前页面是否在黑名单（已废弃，保留兼容）
  if (isPageBlacklisted(currentPageRoute)) {
    result.reason = '当前页面在黑名单中';
    return result;
  }

  // 2. 新用户保护
  if (isNewUserProtected()) {
    result.reason = '新用户保护期内';
    return result;
  }

  // 3. 检查每日上限
  var dailyCount = checkAndResetDailyCount();
  if (dailyCount >= CONFIG.MAX_ADS_PER_DAY) {
    result.reason = '已达每日上限（' + CONFIG.MAX_ADS_PER_DAY + '次）';
    return result;
  }

  // 4. 检查会话上限
  var sessionCount = checkAndResetSession();
  if (sessionCount >= CONFIG.MAX_ADS_PER_SESSION) {
    result.reason = '已达会话上限（每30分钟' + CONFIG.MAX_ADS_PER_SESSION + '次）';
    return result;
  }

  // 5. 检查时间间隔
  var now = Date.now();
  var lastShowTime = getStorageData(STORAGE_KEYS.LAST_SHOW_TIME, 0);
  var timeSinceLastShow = now - lastShowTime;

  if (timeSinceLastShow < CONFIG.BASE_TIME_INTERVAL) {
    var remainingSeconds = Math.ceil((CONFIG.BASE_TIME_INTERVAL - timeSinceLastShow) / 1000);
    result.reason = '时间间隔不足，还需等待 ' + remainingSeconds + ' 秒';
    return result;
  }

  // 6. 检查操作次数
  var actionCount = getStorageData(STORAGE_KEYS.ACTION_COUNT, 0);
  if (actionCount < CONFIG.MIN_ACTION_COUNT) {
    result.reason = '操作次数不足（当前' + actionCount + '次，需要' + CONFIG.MIN_ACTION_COUNT + '次）';
    return result;
  }

  // 7. 所有条件满足，可以展示
  result.canShow = true;
  result.reason = '满足展示条件（TabBar页面：' + currentPageRoute + '）';

  // 8. 计算优先级（所有TabBar页面优先级相同）
  result.priority = 10;
  if (DEBUG_MODE) {
    console.log('[AdStrategy] 广告展示决策:', result);
  }
  return result;
}

/**
 * 记录广告已展示
 */
function recordAdShown() {
  var now = Date.now();

  // 更新最后展示时间
  setStorageData(STORAGE_KEYS.LAST_SHOW_TIME, now);

  // 重置操作计数
  setStorageData(STORAGE_KEYS.ACTION_COUNT, 0);

  // 增加会话计数
  var sessionCount = getStorageData(STORAGE_KEYS.SESSION_AD_COUNT, 0);
  setStorageData(STORAGE_KEYS.SESSION_AD_COUNT, sessionCount + 1);

  // 增加每日计数
  var dailyCount = getStorageData(STORAGE_KEYS.DAILY_AD_COUNT, 0);
  setStorageData(STORAGE_KEYS.DAILY_AD_COUNT, dailyCount + 1);
  if (DEBUG_MODE) {
    console.log('[AdStrategy] 广告已展示，会话计数:', sessionCount + 1, '每日计数:', dailyCount + 1);
  }
}

/**
 * 获取当前广告展示统计信息
 */
function getAdStatistics() {
  var dailyCount = checkAndResetDailyCount();
  var sessionCount = checkAndResetSession();
  var actionCount = getStorageData(STORAGE_KEYS.ACTION_COUNT, 0);
  var lastShowTime = getStorageData(STORAGE_KEYS.LAST_SHOW_TIME, 0);
  var firstLaunchTime = getStorageData(STORAGE_KEYS.FIRST_LAUNCH_TIME, 0);

  return {
    dailyCount: dailyCount,
    dailyLimit: CONFIG.MAX_ADS_PER_DAY,
    sessionCount: sessionCount,
    sessionLimit: CONFIG.MAX_ADS_PER_SESSION,
    actionCount: actionCount,
    actionRequired: CONFIG.MIN_ACTION_COUNT,
    lastShowTime: lastShowTime,
    timeSinceLastShow: lastShowTime ? Date.now() - lastShowTime : 0,
    requiredInterval: CONFIG.BASE_TIME_INTERVAL,
    isNewUser: isNewUserProtected(),
    appUsageTime: firstLaunchTime ? Date.now() - firstLaunchTime : 0
  };
}

/**
 * 重置所有广告数据（用于测试或调试）
 */
function resetAllData() {
  console.warn('[AdStrategy] 重置所有广告数据');

  // 使用for...in遍历，兼容ES5
  for (var key in STORAGE_KEYS) {
    if (STORAGE_KEYS.hasOwnProperty(key)) {
      try {
        wx.removeStorageSync(STORAGE_KEYS[key]);
      } catch (e) {
        console.error('[AdStrategy] 删除存储失败:', STORAGE_KEYS[key], e);
      }
    }
  }
}

// ==================== 导出接口 ====================

module.exports = {
  // 核心决策函数
  shouldShowAd: shouldShowAd,
  recordAction: recordAction,
  recordAdShown: recordAdShown,

  // 工具函数
  getAdStatistics: getAdStatistics,
  isTabBarPage: isTabBarPage,              // TabBar白名单检查
  isPageBlacklisted: isPageBlacklisted,    // 黑名单检查（已废弃）
  isPriorityPage: isPriorityPage,
  isNewUserProtected: isNewUserProtected,

  // 调试函数
  resetAllData: resetAllData,

  // 配置常量
  CONFIG: CONFIG,
  STORAGE_KEYS: STORAGE_KEYS
};
