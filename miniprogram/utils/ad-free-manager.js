/**
 * 无广告状态管理器
 * 用于检查用户是否已获得1小时无广告奖励
 */

/**
 * 检查用户是否在无广告有效期内（1小时）
 * @returns {boolean} 如果在有效期内，返回true；否则返回false
 */
function isAdFreeActive() {
  try {
    var adFreeEndTime = wx.getStorageSync('adFreeEndTime');
    if (!adFreeEndTime) {
      return false;
    }

    var now = Date.now();
    var isActive = now < adFreeEndTime;

    // 如果已过期，自动清除状态
    if (!isActive) {
      clearAdFreeStatus();
    }

    return isActive;
  } catch (error) {
    console.error('❌ 检查无广告状态失败:', error);
    return false;
  }
}

/**
 * 设置1小时无广告状态
 * @returns {boolean} 成功返回true，失败返回false
 */
function setAdFreeForOneHour() {
  try {
    var now = Date.now();
    var endTime = now + 60 * 60 * 1000; // 当前时间 + 1小时

    wx.setStorageSync('adFreeEndTime', endTime);
    console.log('✅ 已设置1小时无广告状态，到期时间:', new Date(endTime).toLocaleString());
    return true;
  } catch (error) {
    console.error('❌ 设置无广告状态失败:', error);
    return false;
  }
}

/**
 * 清除无广告状态（用于测试或过期清理）
 */
function clearAdFreeStatus() {
  try {
    wx.removeStorageSync('adFreeEndTime');
    console.log('🧹 已清除无广告状态');
    return true;
  } catch (error) {
    console.error('❌ 清除无广告状态失败:', error);
    return false;
  }
}

/**
 * 获取无广告状态的剩余时间
 * @returns {string} 格式化的剩余时间字符串，如 "剩余52分钟无广告VIP尊贵体验"
 */
function getAdFreeTimeRemaining() {
  if (!isAdFreeActive()) {
    return '';
  }

  try {
    var now = Date.now();
    var adFreeEndTime = wx.getStorageSync('adFreeEndTime');

    if (!adFreeEndTime) {
      return '';
    }

    var remainingMs = adFreeEndTime - now;

    if (remainingMs <= 0) {
      return '';
    }

    // 计算剩余分钟数（向上取整）
    var minutes = Math.ceil(remainingMs / (60 * 1000));

    return '剩余' + minutes + '分钟无广告VIP尊贵体验';
  } catch (error) {
    console.error('❌ 获取剩余时间失败:', error);
    return '';
  }
}

// 兼容旧版本的方法名（保持向后兼容）
function isAdFreeToday() {
  return isAdFreeActive();
}

function setAdFreeToday() {
  return setAdFreeForOneHour();
}

module.exports = {
  // 新方法（推荐使用）
  isAdFreeActive: isAdFreeActive,
  setAdFreeForOneHour: setAdFreeForOneHour,
  clearAdFreeStatus: clearAdFreeStatus,
  getAdFreeTimeRemaining: getAdFreeTimeRemaining,
  
  // 兼容旧方法名
  isAdFreeToday: isAdFreeToday,
  setAdFreeToday: setAdFreeToday
};
