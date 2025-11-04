/**
 * 新手引导管理器 - 基于Context7最佳实践
 * 用于管理新用户首次使用引导，提升功能可发现性
 */

// 引导类型枚举
var GUIDE_TYPES = {
  TABBAR: 'tabbar_guide',           // TabBar使用引导
  FEATURE_DISCOVERY: 'feature_discovery', // 功能发现引导
  REWARDED_AD: 'rewarded_ad_guide',   // 激励广告引导
  LONG_USE_REMINDER: 'long_use_reminder' // 长时间使用提醒
};

// 引导状态键
var STORAGE_KEYS = {
  TABBAR_GUIDE_SHOWN: 'onboarding_tabbar_shown',
  REWARDED_AD_GUIDE_SHOWN: 'onboarding_rewarded_ad_shown',
  LONG_USE_REMINDER_SHOWN: 'onboarding_long_use_reminder_shown',
  GUIDE_VERSION: 'onboarding_version',
  // 使用时长追踪
  TOTAL_USE_TIME: 'app_total_use_time',           // 累计使用时长（秒）
  LAST_SESSION_START: 'app_last_session_start',   // 上次会话开始时间
  EVER_WATCHED_AD: 'app_ever_watched_ad'          // 是否曾经观看过激励广告
};

// 当前引导版本（如果更新引导内容，递增此版本号）
var CURRENT_VERSION = '1.0';

/**
 * 检查是否已显示TabBar引导
 */
function hasShownTabBarGuide() {
  try {
    var shown = wx.getStorageSync(STORAGE_KEYS.TABBAR_GUIDE_SHOWN);
    var version = wx.getStorageSync(STORAGE_KEYS.GUIDE_VERSION);

    // 如果版本不同，重新显示引导
    if (version !== CURRENT_VERSION) {
      return false;
    }

    return shown === true;
  } catch (error) {
    console.error('检查TabBar引导状态失败:', error);
    return false;
  }
}

/**
 * 标记TabBar引导已显示
 */
function markTabBarGuideAsShown() {
  try {
    wx.setStorageSync(STORAGE_KEYS.TABBAR_GUIDE_SHOWN, true);
    wx.setStorageSync(STORAGE_KEYS.GUIDE_VERSION, CURRENT_VERSION);
    console.log('✅ TabBar引导已标记为已显示');
  } catch (error) {
    console.error('保存TabBar引导状态失败:', error);
  }
}

/**
 * 重置所有引导状态（调试用）
 */
function resetAllGuides() {
  try {
    wx.removeStorageSync(STORAGE_KEYS.TABBAR_GUIDE_SHOWN);
    wx.removeStorageSync(STORAGE_KEYS.GUIDE_VERSION);
    console.log('🔄 所有引导状态已重置');
  } catch (error) {
    console.error('重置引导状态失败:', error);
  }
}

/**
 * 显示TabBar使用提示
 * @param {Object} options 配置选项
 * @param {Function} options.onClose 关闭回调
 */
function showTabBarTip(options) {
  options = options || {};

  // 检查是否已显示过
  if (hasShownTabBarGuide()) {
    console.log('TabBar引导已显示过，跳过');
    return false;
  }

  // 显示提示（返回true表示需要显示）
  return true;
}

/**
 * 显示TabBar引导蒙层（高级版）
 * @param {Object} options 配置选项
 */
function showTabBarGuideOverlay(options) {
  options = options || {};

  wx.showModal({
    title: '💡 功能导航提示',
    content: '欢迎使用FlightToolbox！\n\n点击底部的菜单栏可以快速切换不同功能：\n\n📱 我的首页 - 常用工具\n🔍 资料查询 - 航空资料\n✈️ 驾驶舱 - 飞行导航\n🛫 航班运行 - 运行工具\n🧮 计算工具 - 性能计算',
    showCancel: false,
    confirmText: '我知道了',
    confirmColor: '#1989fa',
    success: function(res) {
      if (res.confirm) {
        // 标记已显示
        markTabBarGuideAsShown();

        // 调用回调
        if (options.onClose && typeof options.onClose === 'function') {
          options.onClose();
        }
      }
    }
  });
}

/**
 * 获取TabBar提示内容
 */
function getTabBarTipContent() {
  return {
    icon: '💡',
    title: '小提示',
    message: '点击底部菜单可切换不同功能模块',
    type: 'info'
  };
}

/**
 * 检查是否已显示激励广告引导
 */
function hasShownRewardedAdGuide() {
  try {
    var shown = wx.getStorageSync(STORAGE_KEYS.REWARDED_AD_GUIDE_SHOWN);
    var version = wx.getStorageSync(STORAGE_KEYS.GUIDE_VERSION);

    // 如果版本不同，重新显示引导
    if (version !== CURRENT_VERSION) {
      return false;
    }

    return shown === true;
  } catch (error) {
    console.error('检查激励广告引导状态失败:', error);
    return false;
  }
}

/**
 * 标记激励广告引导已显示
 */
function markRewardedAdGuideAsShown() {
  try {
    wx.setStorageSync(STORAGE_KEYS.REWARDED_AD_GUIDE_SHOWN, true);
    wx.setStorageSync(STORAGE_KEYS.GUIDE_VERSION, CURRENT_VERSION);
    console.log('✅ 激励广告引导已标记为已显示');
  } catch (error) {
    console.error('保存激励广告引导状态失败:', error);
  }
}

/**
 * 显示激励广告引导弹窗
 * @param {Object} options 配置选项
 * @param {Function} options.onClose 关闭回调
 */
function showRewardedAdGuide(options) {
  options = options || {};

  // 检查是否已显示过
  if (hasShownRewardedAdGuide()) {
    console.log('激励广告引导已显示过，跳过');
    return false;
  }

  wx.showModal({
    title: '💡 支持小程序发展',
    content: '观看30秒广告视频，即可获得1小时无广告体验！\n\n点击粉红色卡片区域的"观看视频"按钮即可开始。\n\n感谢您的支持！✨',
    showCancel: false,
    confirmText: '我知道了',
    confirmColor: '#ff6b6b',
    success: function(res) {
      if (res.confirm) {
        // 标记已显示
        markRewardedAdGuideAsShown();

        // 调用回调
        if (options.onClose && typeof options.onClose === 'function') {
          options.onClose();
        }
      }
    }
  });

  return true;
}

/**
 * === 使用时长追踪 ===
 */

/**
 * 记录会话开始时间
 */
function startSession() {
  try {
    var now = Date.now();
    var lastStart = wx.getStorageSync(STORAGE_KEYS.LAST_SESSION_START);

    // 如果有未关闭的会话，先累加时长（处理异常退出或切后台场景）
    if (lastStart && lastStart !== now) {
      var sessionDuration = Math.floor((now - lastStart) / 1000);

      // 防止异常时长（超过24小时视为无效，可能是时间回拨）
      if (sessionDuration > 0 && sessionDuration < 86400) {
        var totalTime = wx.getStorageSync(STORAGE_KEYS.TOTAL_USE_TIME) || 0;
        totalTime += sessionDuration;
        wx.setStorageSync(STORAGE_KEYS.TOTAL_USE_TIME, totalTime);
        console.log('✅ 补充上次未关闭会话时长:', sessionDuration + '秒, 累计:', totalTime + '秒');
      } else if (sessionDuration >= 86400) {
        console.warn('⚠️ 检测到异常会话时长（>24小时），已忽略');
      }
    }

    // 记录新会话开始时间
    wx.setStorageSync(STORAGE_KEYS.LAST_SESSION_START, now);
    console.log('✅ 会话开始时间已记录:', new Date(now).toLocaleTimeString());
  } catch (error) {
    console.error('记录会话开始时间失败:', error);
  }
}

/**
 * 记录会话结束时间，累加使用时长
 */
function endSession() {
  try {
    var startTime = wx.getStorageSync(STORAGE_KEYS.LAST_SESSION_START);
    if (!startTime) {
      return;
    }

    var now = Date.now();
    var sessionDuration = Math.floor((now - startTime) / 1000); // 转换为秒

    // 累加到总使用时长
    var totalTime = wx.getStorageSync(STORAGE_KEYS.TOTAL_USE_TIME) || 0;
    totalTime += sessionDuration;
    wx.setStorageSync(STORAGE_KEYS.TOTAL_USE_TIME, totalTime);

    console.log('✅ 本次会话时长:', sessionDuration + '秒, 累计时长:', totalTime + '秒');

    // 清除会话开始时间
    wx.removeStorageSync(STORAGE_KEYS.LAST_SESSION_START);
  } catch (error) {
    console.error('记录会话结束时间失败:', error);
  }
}

/**
 * 获取累计使用时长（秒）
 */
function getTotalUseTime() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.TOTAL_USE_TIME) || 0;
  } catch (error) {
    console.error('获取累计使用时长失败:', error);
    return 0;
  }
}

/**
 * 标记用户已观看过激励广告
 */
function markAdWatched() {
  try {
    wx.setStorageSync(STORAGE_KEYS.EVER_WATCHED_AD, true);
    console.log('✅ 已标记用户观看过激励广告');
  } catch (error) {
    console.error('标记观看广告失败:', error);
  }
}

/**
 * 检查用户是否曾经观看过激励广告
 */
function hasEverWatchedAd() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.EVER_WATCHED_AD) === true;
  } catch (error) {
    console.error('检查观看广告状态失败:', error);
    return false;
  }
}

/**
 * === 长时间使用提醒 ===
 */

// 幽默温馨的提醒文案库（随机显示）
var REMINDER_TEXTS = [
  {
    title: '飞友，您已经是老用户啦！🎉',
    content: '用了这么久，是不是该请我喝杯奶茶？😄\n\n看30秒小视频，就能免1小时广告，\n比买奶茶划算多了，您说是不？\n\n江湖儿女，够意思就看一个吧！✨',
    confirmText: '够意思！'
  },
  {
    title: '嘿，老朋友！👋',
    content: '看到您一直在用，我真的超开心！\n\n能不能帮个小忙？看个30秒视频，\n让咱俩的缘分更长久一点？\n\n作为回报，送您1小时清爽体验！🎁',
    confirmText: '没问题！'
  },
  {
    title: '飞行员大佬，等您好久了！✈️',
    content: '您的使用时长已经解锁"老司机"成就！\n\n30秒视频换1小时无广告，\n这买卖稳赚不赔，您觉得咋样？\n\n江湖规矩懂的都懂，帮兄弟一把呗！🤝',
    confirmText: '兄弟义气！'
  },
  {
    title: '温馨提示：您有福利待领取！🎁',
    content: '用了这么久还没看过广告视频？\n\n不是我吹，看一次能免1小时其他广告，\n相当于买一送十的节奏！\n\n机会难得，要不要试试？✨',
    confirmText: '试试就试试'
  },
  {
    title: '老铁，咱俩认识这么久了！🤗',
    content: '说句掏心窝的话：\n小程序运营不易，广告收入是主要来源。\n\n但我知道广告烦人，所以准备了这个：\n看30秒视频→免1小时广告→两全其美！\n\n支持一下吧，拜托了！🙏',
    confirmText: '支持你！'
  },
  {
    title: '资深用户专属福利来啦！💎',
    content: '检测到您是我们的忠实用户！\n\n特别福利：观看一次30秒视频，\n即可享受1小时VIP级无广告体验！\n\n这可是老用户才有的特权哦～',
    confirmText: '领取福利'
  },
  {
    title: '飞友，有句话不知当讲不当讲...🤔',
    content: '您用得这么溜，肯定对这小程序有感情了吧？\n\n那能不能...看个小视频支持一下？\n30秒换1小时，咱这买卖不亏！\n\n拜托拜托，就当给朋友捧个场！🎭',
    confirmText: '给面子！'
  }
];

/**
 * 检查是否已显示长时间使用提醒
 * 策略：7天内只显示一次，7天后可重新提醒
 */
function hasShownLongUseReminder() {
  try {
    var lastShown = wx.getStorageSync(STORAGE_KEYS.LONG_USE_REMINDER_SHOWN);
    if (!lastShown) {
      return false;
    }

    // 如果是旧版本的 boolean 标记，清除并返回 false（允许重新提醒）
    if (typeof lastShown === 'boolean') {
      wx.removeStorageSync(STORAGE_KEYS.LONG_USE_REMINDER_SHOWN);
      console.log('🔄 检测到旧版提醒标记，已清除');
      return false;
    }

    // 计算距离上次提醒的天数
    var daysPassed = Math.floor((Date.now() - lastShown) / (1000 * 60 * 60 * 24));
    var isShown = daysPassed < 7;

    console.log('📅 距离上次提醒:', daysPassed + '天, 状态:', isShown ? '已显示' : '可重新显示');
    return isShown;
  } catch (error) {
    console.error('检查长时间使用提醒状态失败:', error);
    return false;
  }
}

/**
 * 标记长时间使用提醒已显示
 * 记录时间戳，而非 boolean 标记
 */
function markLongUseReminderAsShown() {
  try {
    var now = Date.now();
    wx.setStorageSync(STORAGE_KEYS.LONG_USE_REMINDER_SHOWN, now);
    console.log('✅ 长时间使用提醒已标记为已显示（7天后可重新提醒）');
  } catch (error) {
    console.error('保存长时间使用提醒状态失败:', error);
  }
}

/**
 * 显示长时间使用提醒（随机文案）
 * @param {Object} options 配置选项
 * @param {Function} options.onConfirm 确认回调（点击"观看视频"）
 * @param {Function} options.onCancel 取消回调
 */
function showLongUseReminder(options) {
  options = options || {};

  // 检查条件：
  // 1. 累计使用时长 >= 5分钟（300秒）
  // 2. 从未观看过激励广告
  // 3. 本次提醒未显示过
  var totalTime = getTotalUseTime();
  var hasWatched = hasEverWatchedAd();
  var hasShown = hasShownLongUseReminder();

  console.log('📊 长时间使用提醒条件检查:');
  console.log('   - 累计使用时长:', totalTime + '秒 (需要>=300秒)');
  console.log('   - 曾经观看过广告:', hasWatched ? '是' : '否');
  console.log('   - 本次提醒已显示:', hasShown ? '是' : '否');

  // 条件1: 使用时长不足
  if (totalTime < 300) {
    console.log('⏱️ 使用时长不足5分钟，跳过提醒');
    return false;
  }

  // 条件2: 已经观看过广告
  if (hasWatched) {
    console.log('✅ 用户已观看过广告，跳过提醒');
    return false;
  }

  // 条件3: 本次提醒已显示
  if (hasShown) {
    console.log('📌 本次提醒已显示过，跳过');
    return false;
  }

  // 随机选择一条文案
  var randomIndex = Math.floor(Math.random() * REMINDER_TEXTS.length);
  var reminder = REMINDER_TEXTS[randomIndex];

  wx.showModal({
    title: reminder.title,
    content: reminder.content,
    showCancel: true,
    cancelText: '下次吧',
    confirmText: reminder.confirmText,
    cancelColor: '#999999',
    confirmColor: '#ff6b6b',
    success: function(res) {
      if (res.confirm) {
        // 标记已显示（用户点击确认）
        markLongUseReminderAsShown();

        // 调用确认回调
        if (options.onConfirm && typeof options.onConfirm === 'function') {
          options.onConfirm();
        }

        console.log('✅ 用户点击了确认，将跳转到观看视频');
      } else if (res.cancel) {
        // 用户点击取消，也标记已显示（避免反复骚扰）
        markLongUseReminderAsShown();

        // 调用取消回调
        if (options.onCancel && typeof options.onCancel === 'function') {
          options.onCancel();
        }

        console.log('👋 用户选择下次再说');
      }
    }
  });

  return true;
}

module.exports = {
  GUIDE_TYPES: GUIDE_TYPES,
  hasShownTabBarGuide: hasShownTabBarGuide,
  markTabBarGuideAsShown: markTabBarGuideAsShown,
  resetAllGuides: resetAllGuides,
  showTabBarTip: showTabBarTip,
  showTabBarGuideOverlay: showTabBarGuideOverlay,
  getTabBarTipContent: getTabBarTipContent,
  // 激励广告引导
  hasShownRewardedAdGuide: hasShownRewardedAdGuide,
  markRewardedAdGuideAsShown: markRewardedAdGuideAsShown,
  showRewardedAdGuide: showRewardedAdGuide,
  // 使用时长追踪
  startSession: startSession,
  endSession: endSession,
  getTotalUseTime: getTotalUseTime,
  markAdWatched: markAdWatched,
  hasEverWatchedAd: hasEverWatchedAd,
  // 长时间使用提醒
  showLongUseReminder: showLongUseReminder,
  hasShownLongUseReminder: hasShownLongUseReminder,
  markLongUseReminderAsShown: markLongUseReminderAsShown
};
