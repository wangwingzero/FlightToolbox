/**
 * 新手引导管理器 - 基于Context7最佳实践
 * 用于管理新用户首次使用引导，提升功能可发现性
 */

// 引导类型枚举
var GUIDE_TYPES = {
  TABBAR: 'tabbar_guide',           // TabBar使用引导
  FEATURE_DISCOVERY: 'feature_discovery' // 功能发现引导
};

// 引导状态键
var STORAGE_KEYS = {
  TABBAR_GUIDE_SHOWN: 'onboarding_tabbar_shown',
  GUIDE_VERSION: 'onboarding_version'
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

module.exports = {
  GUIDE_TYPES: GUIDE_TYPES,
  hasShownTabBarGuide: hasShownTabBarGuide,
  markTabBarGuideAsShown: markTabBarGuideAsShown,
  resetAllGuides: resetAllGuides,
  showTabBarTip: showTabBarTip,
  showTabBarGuideOverlay: showTabBarGuideOverlay,
  getTabBarTipContent: getTabBarTipContent
};
