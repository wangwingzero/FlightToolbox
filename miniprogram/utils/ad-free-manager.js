/**
 * 无广告状态管理器
 * 用于检查用户是否已获得今日无广告奖励
 */

/**
 * 获取今天的日期字符串（YYYY-MM-DD格式）
 * ES5兼容实现
 */
function getTodayDateString() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();

  // ES5兼容的零填充
  var monthStr = (month < 10 ? '0' : '') + month;
  var dayStr = (day < 10 ? '0' : '') + day;

  return year + '-' + monthStr + '-' + dayStr;
}

/**
 * 检查用户是否已获得今日无广告奖励
 * @returns {boolean} 如果已获得今日无广告，返回true；否则返回false
 */
function isAdFreeToday() {
  try {
    var adFreeDate = wx.getStorageSync('ad_free_date');
    var today = getTodayDateString();
    return adFreeDate === today;
  } catch (error) {
    console.error('❌ 检查无广告状态失败:', error);
    return false;
  }
}

/**
 * 设置今日无广告状态
 */
function setAdFreeToday() {
  try {
    var today = getTodayDateString();
    wx.setStorageSync('ad_free_date', today);
    console.log('✅ 已设置今日无广告状态');
    return true;
  } catch (error) {
    console.error('❌ 设置无广告状态失败:', error);
    return false;
  }
}

/**
 * 清除无广告状态（用于测试）
 */
function clearAdFreeStatus() {
  try {
    wx.removeStorageSync('ad_free_date');
    console.log('🧹 已清除无广告状态');
    return true;
  } catch (error) {
    console.error('❌ 清除无广告状态失败:', error);
    return false;
  }
}

/**
 * 获取无广告状态的剩余时间（到今日24:00）
 * @returns {string} 格式化的剩余时间字符串，如 "5小时32分"
 */
function getAdFreeTimeRemaining() {
  if (!isAdFreeToday()) {
    return '';
  }

  var now = new Date();
  var midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  var remainingMs = midnight - now;
  var hours = Math.floor(remainingMs / (1000 * 60 * 60));
  var minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  return hours + '小时' + minutes + '分';
}

module.exports = {
  isAdFreeToday: isAdFreeToday,
  setAdFreeToday: setAdFreeToday,
  clearAdFreeStatus: clearAdFreeStatus,
  getAdFreeTimeRemaining: getAdFreeTimeRemaining
};
