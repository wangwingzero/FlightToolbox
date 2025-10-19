/**
 * 统一日志管理器
 * 集中控制驾驶舱模块的调试输出，避免频繁刷新导致开发者工具卡顿
 */

var config = require('./config.js');

/**
 * 日志管理器
 */
var Logger = {
  /**
   * 调试日志 - 受enableVerboseLogging控制
   * @param {string} message - 日志消息
   * @param {any} data - 可选的数据对象
   */
  debug: function(message, data) {
    if (config.debug && config.debug.enableVerboseLogging) {
      if (data !== undefined) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  },

  /**
   * 信息日志 - 重要信息，但可控制
   * @param {string} message - 日志消息
   * @param {any} data - 可选的数据对象
   */
  info: function(message, data) {
    if (config.debug && config.debug.enableVerboseLogging) {
      if (data !== undefined) {
        console.info(message, data);
      } else {
        console.info(message);
      }
    }
  },

  /**
   * 警告日志 - 始终输出，但可以控制频率
   * @param {string} message - 日志消息
   * @param {any} data - 可选的数据对象
   */
  warn: function(message, data) {
    // 警告信息保留，但可以通过配置控制
    if (config.debug && (config.debug.enableVerboseLogging || config.debug.enableWarnings !== false)) {
      if (data !== undefined) {
        console.warn(message, data);
      } else {
        console.warn(message);
      }
    }
  },

  /**
   * 错误日志 - 始终输出，不受开关控制
   * @param {string} message - 日志消息
   * @param {any} data - 可选的数据对象
   */
  error: function(message, data) {
    // 错误信息始终输出
    if (data !== undefined) {
      console.error(message, data);
    } else {
      console.error(message);
    }
  },

  /**
   * 性能日志 - 受enablePerformanceLogging控制
   * @param {string} message - 日志消息
   * @param {any} data - 可选的数据对象
   */
  perf: function(message, data) {
    if (config.debug && config.debug.enablePerformanceLogging) {
      if (data !== undefined) {
        console.log('⚡ ' + message, data);
      } else {
        console.log('⚡ ' + message);
      }
    }
  },

  /**
   * GPS相关日志 - 受GPS调试开关控制
   * @param {string} message - 日志消息
   * @param {any} data - 可选的数据对象
   */
  gps: function(message, data) {
    if (config.debug && config.debug.enableVerboseLogging && config.gps && config.gps.enableDebugLogging !== false) {
      if (data !== undefined) {
        console.log('🛰️ ' + message, data);
      } else {
        console.log('🛰️ ' + message);
      }
    }
  },

  /**
   * 地图渲染相关日志 - 受地图调试开关控制
   * @param {string} message - 日志消息
   * @param {any} data - 可选的数据对象
   */
  map: function(message, data) {
    if (config.debug && config.debug.enableVerboseLogging && config.map && config.map.enableDebugLogging !== false) {
      if (data !== undefined) {
        console.log('🗺️ ' + message, data);
      } else {
        console.log('🗺️ ' + message);
      }
    }
  },

  /**
   * 限流日志 - 避免相同消息频繁输出
   * @param {string} key - 日志键值，用于去重
   * @param {string} message - 日志消息
   * @param {number} interval - 限流间隔(毫秒)，默认5秒
   */
  throttle: function(key, message, interval) {
    interval = interval || 5000;
    var now = Date.now();

    if (!this._throttleCache) {
      this._throttleCache = {};
      this._lastCleanupTime = now;
    }

    // 🔧 定期清理过期缓存（每小时清理一次，保留最近1小时的记录）
    if (now - (this._lastCleanupTime || 0) > 3600000) {
      var cutoffTime = now - 3600000;
      for (var k in this._throttleCache) {
        if (this._throttleCache[k] < cutoffTime) {
          delete this._throttleCache[k];
        }
      }
      this._lastCleanupTime = now;
      this.debug('🧹 Logger: 清理过期throttle缓存');
    }

    if (!this._throttleCache[key] || (now - this._throttleCache[key]) > interval) {
      this._throttleCache[key] = now;
      this.debug(message);
    }
  }
};

module.exports = Logger;