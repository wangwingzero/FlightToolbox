/**
 * 🔧 环境检测工具模块
 *
 * 用于统一检测小程序运行环境（开发者工具 vs 真机）
 * 避免代码中重复出现相同的环境检测逻辑
 *
 * @module env-detector
 * @created 2025-01-04
 */
var systemInfoHelper = require('./system-info-helper.js');

/**
 * 检测是否为开发者工具环境
 *
 * 判断依据：
 * - 使用 wx.getSystemInfoSync().platform 判断
 * - 开发者工具的 platform 为 'devtools'
 * - 真机的 platform 为 'android' 或 'ios'（无论是调试模式还是运行模式）
 *
 * ⚠️ 重要修复（2025-01-04）：
 * 之前使用 `typeof wx.loadSubpackage !== 'function'` 检测，导致问题：
 * - 开发者工具：wx.loadSubpackage 不可用 ✅ 正确识别
 * - 真机调试模式：wx.loadSubpackage 不可用 ❌ 错误识别为开发者工具
 * - 真机运行模式：wx.loadSubpackage 可用 ✅ 正确识别
 *
 * 修复后的逻辑：
 * - 开发者工具：platform === 'devtools' ✅ 正确识别
 * - 真机调试模式：platform === 'android'/'ios' ✅ 正确识别为真机
 * - 真机运行模式：platform === 'android'/'ios' ✅ 正确识别为真机
 *
 * @returns {boolean} true-开发者工具环境，false-真机环境（包括调试模式和运行模式）
 *
 * @example
 * var EnvDetector = require('../../utils/env-detector.js');
 * if (EnvDetector.isDevTools()) {
 *   console.warn('开发者工具环境：部分功能可能不可用');
 *   return;
 * }
 */
function isDevTools() {
  try {
    var platform = ((systemInfoHelper.getDeviceInfo && systemInfoHelper.getDeviceInfo()) || {}).platform || 'unknown';

    // 🔥 关键修复：使用 platform 判断，而不是 wx.loadSubpackage 可用性
    // 开发者工具的 platform 为 'devtools'
    // 真机的 platform 为 'android' 或 'ios'（无论是调试模式还是运行模式）
    return platform === 'devtools';
  } catch (error) {
    // 🔥 改进（2025-01-13）：保守策略，无法确定环境时假设为真机
    // 原因：假设为真机更安全，避免真机功能被误禁用
    // - 如果误判为开发者工具 → 真机功能被禁用（用户体验差）
    // - 如果误判为真机 → 开发者工具可能报错（仅影响开发，不影响用户）
    console.error('❌ 获取系统信息失败，采用保守策略假设为真机:', error);
    return false;  // 假设为真机（更安全的降级策略）
  }
}

/**
 * 检测是否为真机环境
 *
 * @returns {boolean} true-真机环境（包括调试模式和运行模式），false-开发者工具环境
 *
 * @example
 * var EnvDetector = require('../../utils/env-detector.js');
 * if (EnvDetector.isRealDevice()) {
 *   console.log('真机环境：可以正常加载分包资源');
 * }
 */
function isRealDevice() {
  return !isDevTools();
}

/**
 * 获取当前运行环境的详细信息
 *
 * @returns {Object} 环境信息对象
 * @property {boolean} isDevTools - 是否为开发者工具
 * @property {boolean} isRealDevice - 是否为真机
 * @property {string} environmentType - 环境类型（'devtools' 或 'device'）
 * @property {Object} systemInfo - 系统信息（来自wx.getSystemInfoSync）
 *
 * @example
 * var EnvDetector = require('../../utils/env-detector.js');
 * var envInfo = EnvDetector.getEnvironmentInfo();
 * console.log('当前环境:', envInfo.environmentType);
 * console.log('设备平台:', envInfo.systemInfo.platform);
 */
function getEnvironmentInfo() {
  var devTools = isDevTools();
  var systemInfo = {};
  try {
    systemInfo = systemInfoHelper.getSystemInfo() || {};
  } catch (error) {
    console.error('❌ 获取系统信息失败:', error);
  }

  return {
    isDevTools: devTools,
    isRealDevice: !devTools,
    environmentType: devTools ? 'devtools' : 'device',
    systemInfo: systemInfo
  };
}

/**
 * 在控制台打印环境信息（用于调试）
 *
 * @example
 * var EnvDetector = require('../../utils/env-detector.js');
 * EnvDetector.logEnvironmentInfo();
 */
function logEnvironmentInfo() {
  var info = getEnvironmentInfo();

  console.log('========== 环境信息 ==========');
  console.log('环境类型:', info.environmentType);
  console.log('是否为开发者工具:', info.isDevTools);
  console.log('是否为真机:', info.isRealDevice);

  if (info.systemInfo && Object.keys(info.systemInfo).length > 0) {
    console.log('系统平台:', info.systemInfo.platform || 'unknown');
    console.log('系统版本:', info.systemInfo.system || 'unknown');
    console.log('微信版本:', info.systemInfo.version || 'unknown');
    console.log('设备品牌:', info.systemInfo.brand || 'unknown');
    console.log('设备型号:', info.systemInfo.model || 'unknown');
  }

  console.log('==============================');
}

/**
 * 执行环境特定的操作
 *
 * 根据当前环境自动执行不同的回调函数
 *
 * @param {Object} options - 配置对象
 * @param {Function} options.onDevTools - 开发者工具环境的回调
 * @param {Function} options.onDevice - 真机环境的回调
 *
 * @example
 * var EnvDetector = require('../../utils/env-detector.js');
 * EnvDetector.runByEnvironment({
 *   onDevTools: function() {
 *     console.warn('开发者工具环境：跳过分包加载');
 *   },
 *   onDevice: function() {
 *     console.log('真机环境：开始分包加载');
 *     wx.loadSubpackage({ name: 'packageA' });
 *   }
 * });
 */
function runByEnvironment(options) {
  options = options || {};

  if (isDevTools() && typeof options.onDevTools === 'function') {
    options.onDevTools();
  } else if (isRealDevice() && typeof options.onDevice === 'function') {
    options.onDevice();
  }
}

module.exports = {
  isDevTools: isDevTools,
  isRealDevice: isRealDevice,
  getEnvironmentInfo: getEnvironmentInfo,
  logEnvironmentInfo: logEnvironmentInfo,
  runByEnvironment: runByEnvironment
};
