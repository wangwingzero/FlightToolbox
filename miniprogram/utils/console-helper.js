/**
 * 控制台输出辅助工具
 * 统一管理调试日志的输出，减少控制台信息过载
 */

var ConsoleHelper = {
  // 🎯 调试开关 - 设为false可大幅减少控制台输出
  settings: {
    enableVerboseLogging: false,    // 详细日志开关
    enablePerformanceLogging: false, // 性能统计日志
    enableFrequentUpdates: false,    // 频繁更新日志
    enableGPSDebug: false,          // GPS调试日志（减少输出）
    enableCompassDebug: false,      // 指南针调试日志（减少输出）
    minLogInterval: 10000          // 最小日志间隔（毫秒）- 增加间隔
  },

  // 内部状态
  lastLogTimes: {},

  /**
   * 条件性日志输出 - 详细日志
   * @param {String} message 日志消息
   * @param {String} category 日志分类
   */
  verbose: function(message, category) {
    if (this.settings.enableVerboseLogging) {
      console.log(message);
    }
  },

  /**
   * 条件性日志输出 - 性能日志
   * @param {String} message 日志消息
   */
  performance: function(message) {
    if (this.settings.enablePerformanceLogging) {
      console.log(message);
    }
  },

  /**
   * 条件性日志输出 - 频繁更新日志（带频率控制）
   * @param {String} message 日志消息
   * @param {String} key 唯一标识
   */
  frequent: function(message, key) {
    if (!this.settings.enableFrequentUpdates) {
      return;
    }
    
    var now = Date.now();
    if (!this.lastLogTimes[key] || now - this.lastLogTimes[key] > this.settings.minLogInterval) {
      console.log(message);
      this.lastLogTimes[key] = now;
    }
  },

  /**
   * GPS调试日志（重要，保留）
   * @param {String} message 日志消息
   */
  gps: function(message) {
    if (this.settings.enableGPSDebug) {
      console.log(message);
    }
  },

  /**
   * 指南针调试日志（重要，保留）
   * @param {String} message 日志消息
   */
  compass: function(message) {
    if (this.settings.enableCompassDebug) {
      console.log(message);
    }
  },

  /**
   * 系统错误过滤器 - 过滤微信系统内部错误
   * @param {String} message 错误消息
   * @return {Boolean} 是否应该输出
   */
  shouldLogSystemError: function(message) {
    if (!message || typeof message !== 'string') return true;
    
    // 🔇 过滤系统内部视图管理错误
    var systemErrorPatterns = [
      'removeImageView:fail',
      'removeTextView:fail',
      'not found',
      'appServiceSDKScriptError',
      'WAServiceMainContext'
    ];
    
    for (var i = 0; i < systemErrorPatterns.length; i++) {
      if (message.indexOf(systemErrorPatterns[i]) !== -1) {
        return false; // 不输出系统错误
      }
    }
    
    return true; // 允许输出
  },

  /**
   * 智能错误日志 - 自动过滤系统错误
   * @param {String} message 错误消息
   * @param {String} context 上下文
   */
  smartError: function(message, context) {
    if (this.shouldLogSystemError(message)) {
      if (context) {
        console.error(context + ':', message);
      } else {
        console.error(message);
      }
    } else {
      // 系统错误仅在详细模式下输出
      if (this.settings.enableVerboseLogging) {
        console.log('🔇 已过滤系统错误:', message);
      }
    }
  },

  /**
   * 错误日志（始终输出，但过滤系统错误）
   * @param {String} message 错误消息
   */
  error: function(message) {
    this.smartError(message);
  },

  /**
   * 警告日志（始终输出，但有频率控制）
   * @param {String} message 警告消息
   * @param {String} key 唯一标识
   */
  warn: function(message, key) {
    if (!key) {
      console.warn(message);
      return;
    }
    
    var now = Date.now();
    if (!this.lastLogTimes[key] || now - this.lastLogTimes[key] > this.settings.minLogInterval) {
      console.warn(message);
      this.lastLogTimes[key] = now;
    }
  },

  /**
   * 成功日志（重要信息，保留）
   * @param {String} message 成功消息
   */
  success: function(message) {
    console.log(message);
  },

  /**
   * 快速切换调试模式
   * @param {Boolean} enabled 是否启用详细日志
   */
  toggleDebugMode: function(enabled) {
    this.settings.enableVerboseLogging = enabled;
    this.settings.enablePerformanceLogging = enabled;
    this.settings.enableFrequentUpdates = enabled;
    console.log('🔧 调试模式', enabled ? '已启用' : '已关闭');
  }
};

module.exports = ConsoleHelper;