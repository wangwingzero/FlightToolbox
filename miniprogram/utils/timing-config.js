/**
 * 🕐 时序配置常量模块
 *
 * 统一管理小程序中所有与时序相关的配置常量
 * 避免在代码中硬编码魔法数字
 *
 * @module timing-config
 * @created 2025-01-04
 */

/**
 * 分包加载相关时序配置
 */
var SUBPACKAGE_TIMING = {
  /**
   * 分包加载完成后的等待时间（毫秒）
   *
   * 🔥 设计依据（2025-01-04真机测试）：
   * - 0ms（无延迟）：图片加载失败率约10-15%
   * - 100ms：低端设备偶尔失败（约5%概率）
   * - 200ms：完全稳定（0%失败率）✅ 推荐
   * - 500ms：过度保守，用户感知延迟明显
   *
   * 原因：wx.loadSubpackage 的 success 回调触发时，
   * 分包文件可能还在写入文件系统，需要等待文件系统操作完成
   */
  READY_DELAY: 200,

  /**
   * 分包加载超时时间（毫秒）
   *
   * 如果分包加载超过此时间仍未完成，视为加载失败
   */
  LOAD_TIMEOUT: 10000
};

/**
 * 图片加载相关时序配置
 */
var IMAGE_TIMING = {
  /**
   * 图片加载失败后重试的基础延迟（毫秒）
   *
   * 每次重试的实际延迟 = BASE_RETRY_DELAY + (retryCount * RETRY_INCREMENT_DELAY)
   */
  BASE_RETRY_DELAY: 200,

  /**
   * 图片重试延迟递增值（毫秒）
   *
   * 第1次重试：200ms
   * 第2次重试：400ms
   * 第3次重试：600ms
   */
  RETRY_INCREMENT_DELAY: 200,

  /**
   * 图片重试最大延迟（毫秒）
   *
   * 避免延迟时间过长影响用户体验
   */
  MAX_RETRY_DELAY: 600,

  /**
   * 图片加载错误处理防抖延迟（毫秒）
   *
   * 避免短时间内多次触发错误处理逻辑
   */
  ERROR_DEBOUNCE_DELAY: 100
};

/**
 * 音频播放相关时序配置
 */
var AUDIO_TIMING = {
  /**
   * 音频播放失败后重试延迟（毫秒）
   */
  RETRY_DELAY: 500,

  /**
   * 音频预加载延迟（毫秒）
   *
   * 避免在页面加载时立即预加载音频，影响首屏性能
   */
  PRELOAD_DELAY: 1000
};

/**
 * 对话框显示相关时序配置
 */
var DIALOG_TIMING = {
  /**
   * 对话框显示前的延迟（毫秒）
   *
   * 避免在用户操作后立即弹出对话框，造成突兀感
   */
  SHOW_DELAY: 500,

  /**
   * 对话框自动关闭延迟（毫秒）
   *
   * 仅用于自动关闭的Toast类对话框
   */
  AUTO_CLOSE_DELAY: 2000
};

/**
 * Toast提示相关时序配置
 */
var TOAST_TIMING = {
  /**
   * 短提示持续时间（毫秒）
   */
  SHORT_DURATION: 1500,

  /**
   * 长提示持续时间（毫秒）
   */
  LONG_DURATION: 3000,

  /**
   * Toast防抖延迟（毫秒）
   *
   * 避免短时间内多次显示相同的Toast
   */
  DEBOUNCE_DELAY: 500
};

/**
 * 数据加载相关时序配置
 */
var DATA_LOADING_TIMING = {
  /**
   * Loading提示最小显示时间（毫秒）
   *
   * 避免Loading一闪而过，造成闪烁感
   */
  MIN_LOADING_DURATION: 300,

  /**
   * 数据缓存过期时间（毫秒）
   *
   * 7天 = 7 * 24 * 60 * 60 * 1000
   */
  CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000
};

/**
 * GPS定位相关时序配置
 */
var GPS_TIMING = {
  /**
   * GPS位置更新频率（毫秒）
   *
   * 微信小程序 wx.onLocationChange 的最小更新间隔
   */
  UPDATE_INTERVAL: 1000,

  /**
   * GPS超时时间（毫秒）
   */
  TIMEOUT: 10000
};

/**
 * 网络请求相关时序配置
 */
var NETWORK_TIMING = {
  /**
   * 默认请求超时时间（毫秒）
   */
  DEFAULT_TIMEOUT: 10000,

  /**
   * 长轮询超时时间（毫秒）
   */
  LONG_POLLING_TIMEOUT: 30000,

  /**
   * 网络请求重试延迟（毫秒）
   */
  RETRY_DELAY: 1000
};

/**
 * 动画相关时序配置
 */
var ANIMATION_TIMING = {
  /**
   * 默认动画持续时间（毫秒）
   */
  DEFAULT_DURATION: 300,

  /**
   * 快速动画持续时间（毫秒）
   */
  FAST_DURATION: 150,

  /**
   * 慢速动画持续时间（毫秒）
   */
  SLOW_DURATION: 500
};

/**
 * 根据重试次数计算图片重试延迟时间
 *
 * @param {number} retryCount - 当前重试次数（从0开始）
 * @returns {number} 延迟时间（毫秒）
 *
 * @example
 * var delay = TimingConfig.calculateImageRetryDelay(2); // 第3次重试
 * console.log(delay); // 600ms
 */
function calculateImageRetryDelay(retryCount) {
  var delay = IMAGE_TIMING.BASE_RETRY_DELAY + (retryCount * IMAGE_TIMING.RETRY_INCREMENT_DELAY);
  return Math.min(delay, IMAGE_TIMING.MAX_RETRY_DELAY);
}

/**
 * 打印所有时序配置（用于调试）
 */
function logAllTimingConfig() {
  console.log('========== 时序配置 ==========');
  console.log('分包加载完成延迟:', SUBPACKAGE_TIMING.READY_DELAY, 'ms');
  console.log('图片重试基础延迟:', IMAGE_TIMING.BASE_RETRY_DELAY, 'ms');
  console.log('音频重试延迟:', AUDIO_TIMING.RETRY_DELAY, 'ms');
  console.log('对话框显示延迟:', DIALOG_TIMING.SHOW_DELAY, 'ms');
  console.log('==============================');
}

module.exports = {
  // 分包加载
  SUBPACKAGE_TIMING: SUBPACKAGE_TIMING,

  // 图片加载
  IMAGE_TIMING: IMAGE_TIMING,

  // 音频播放
  AUDIO_TIMING: AUDIO_TIMING,

  // 对话框
  DIALOG_TIMING: DIALOG_TIMING,

  // Toast提示
  TOAST_TIMING: TOAST_TIMING,

  // 数据加载
  DATA_LOADING_TIMING: DATA_LOADING_TIMING,

  // GPS定位
  GPS_TIMING: GPS_TIMING,

  // 网络请求
  NETWORK_TIMING: NETWORK_TIMING,

  // 动画
  ANIMATION_TIMING: ANIMATION_TIMING,

  // 工具函数
  calculateImageRetryDelay: calculateImageRetryDelay,
  logAllTimingConfig: logAllTimingConfig
};
