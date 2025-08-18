/**
 * Toast智能管理器模块
 * 
 * 提供智能化的Toast提示管理功能，包括：
 * - 频率控制：避免相同类型提示过于频繁
 * - 状态去重：相同状态不重复提示
 * - 优先级管理：重要提示优先显示
 * - 状态变化检测：只有真正状态变化才提示
 * - 恢复提示：状态恢复时的友好提示
 * 
 * 设计原则：
 * - 改善用户体验，减少干扰性提示
 * - 保持重要信息的及时性
 * - 统一管理所有Toast显示逻辑
 * - 支持调试和统计分析
 */

var Logger = require('./logger.js');

var ToastManager = {
  /**
   * 创建Toast管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 内部状态
      config: config.toast,
      lastToastTime: {},      // 每种类型的最后显示时间
      currentStatus: {},      // 当前状态，用于变化检测
      retryCount: {},         // 重试计数
      suppressedCount: {},    // 被抑制的toast计数
      totalToastCount: 0,     // 总toast显示计数
      
      /**
       * 智能显示Toast
       * @param {String} type Toast类型
       * @param {String} message 显示消息
       * @param {Object} options 选项 {force: Boolean, icon: String, duration: Number}
       * @returns {Boolean} 是否实际显示了toast
       */
      showSmartToast: function(type, message, options) {
        options = options || {};
        var typeConfig = manager.config.types[type];
        
        if (!manager.config.global.enableIntelligent) {
          // 如果智能管理被禁用，直接显示
          return manager.showToast(message, options);
        }
        
        if (!typeConfig) {
          if (config && config.debug && config.debug.enableVerboseLogging) {
            Logger.warn('未知的Toast类型:', type);
          }
          return manager.showToast(message, options);
        }
        
        var now = Date.now();
        var lastTime = manager.lastToastTime[type] || 0;
        var timeSinceLastToast = now - lastTime;
        
        // 强制显示（忽略所有限制）
        if (options.force) {
          manager.lastToastTime[type] = now;
          manager.totalToastCount++;
          return manager.showToast(message, options);
        }
        
        // 检查最小时间间隔
        if (typeConfig.minInterval > 0 && timeSinceLastToast < typeConfig.minInterval) {
          manager.suppressToast(type, 'time_interval');
          return false;
        }
        
        // 检查重试次数限制
        if (typeConfig.maxRetries && manager.retryCount[type] >= typeConfig.maxRetries) {
          manager.suppressToast(type, 'max_retries');
          return false;
        }
        
        // 检查重复内容抑制
        if (manager.config.global.suppressDuplicates) {
          var lastMessage = manager.currentStatus[type + '_message'];
          if (lastMessage === message && typeConfig.persistentState) {
            manager.suppressToast(type, 'duplicate_content');
            return false;
          }
        }
        
        // 记录状态并显示
        manager.lastToastTime[type] = now;
        manager.currentStatus[type + '_message'] = message;
        manager.retryCount[type] = (manager.retryCount[type] || 0) + 1;
        manager.totalToastCount++;
        
        // 调试模式输出
        if (manager.config.global.debugMode && config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('Toast显示:', {
            type: type,
            message: message,
            duration: options.duration || manager.config.global.defaultDuration,
            suppressDuration: typeConfig.minInterval
          });
        }
        
        return manager.showToast(message, options);
      },
      
      /**
       * 状态变化检测并显示Toast
       * @param {String} type Toast类型
       * @param {String} newStatus 新状态
       * @param {String} message 显示消息
       * @param {Object} options 选项
       * @returns {Boolean} 是否显示了toast
       */
      updateStatus: function(type, newStatus, message, options) {
        var typeConfig = manager.config.types[type];
        if (!typeConfig || !typeConfig.showOnChange) {
          // 如果不是基于状态变化的类型，直接使用智能显示
          return manager.showSmartToast(type, message, options);
        }
        
        var lastStatus = manager.currentStatus[type];
        var statusChanged = lastStatus !== newStatus;
        
        // 记录新状态
        manager.currentStatus[type] = newStatus;
        
        if (!statusChanged) {
          // 状态未变化，不显示toast
          manager.suppressToast(type, 'no_status_change');
          return false;
        }
        
        // 状态发生变化，显示toast
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('状态变化检测:', type, lastStatus, '->', newStatus);
        }
        
        // 重置重试计数（状态变化时重新开始计数）
        manager.retryCount[type] = 0;
        
        return manager.showSmartToast(type, message, options);
      },
      
      /**
       * 显示恢复状态提示
       * @param {String} recoveryType 恢复类型 (GPS_NORMAL, COMPASS_NORMAL等)
       * @param {Object} options 选项
       * @returns {Boolean} 是否显示了toast
       */
      showRecoveryToast: function(recoveryType, options) {
        var message = manager.config.recovery[recoveryType];
        if (!message) {
          if (config && config.debug && config.debug.enableVerboseLogging) {
            Logger.warn('未找到恢复提示消息:', recoveryType);
          }
          return false;
        }
        
        options = options || {};
        options.icon = 'success';
        options.force = true;  // 恢复提示强制显示
        
        return manager.showSmartToast(recoveryType, message, options);
      },
      
      /**
       * 实际显示Toast
       * @param {String} message 消息
       * @param {Object} options 选项
       * @returns {Boolean} 是否成功显示
       */
      showToast: function(message, options) {
        options = options || {};
        
        try {
          wx.showToast({
            title: message,
            icon: options.icon || 'none',
            duration: options.duration || manager.config.global.defaultDuration
          });
          return true;
        } catch (error) {
          if (config && config.debug && config.debug.enableVerboseLogging) {
            Logger.error('Toast显示失败:', error);
          }
          return false;
        }
      },
      
      /**
       * 抑制Toast（用于统计和调试）
       * @param {String} type Toast类型
       * @param {String} reason 抑制原因
       */
      suppressToast: function(type, reason) {
        if (!manager.suppressedCount[type]) {
          manager.suppressedCount[type] = {};
        }
        
        var reasonCount = manager.suppressedCount[type][reason] || 0;
        manager.suppressedCount[type][reason] = reasonCount + 1;
        
        if (manager.config.global.debugMode && config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('Toast被抑制:', {
            type: type,
            reason: reason,
            count: manager.suppressedCount[type][reason]
          });
        }
      },
      
      /**
       * 重置特定类型的状态
       * @param {String} type Toast类型
       */
      resetType: function(type) {
        delete manager.lastToastTime[type];
        delete manager.currentStatus[type];
        delete manager.retryCount[type];
        delete manager.suppressedCount[type];
        
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('Toast类型状态已重置:', type);
        }
      },
      
      /**
       * 清除所有状态
       */
      clearAll: function() {
        manager.lastToastTime = {};
        manager.currentStatus = {};
        manager.retryCount = {};
        manager.suppressedCount = {};
        manager.totalToastCount = 0;
        
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('所有Toast状态已清除');
        }
      },
      
      /**
       * 获取统计信息
       * @returns {Object} 统计数据
       */
      getStatistics: function() {
        return {
          totalToastCount: manager.totalToastCount,
          activeTypes: Object.keys(manager.lastToastTime).length,
          suppressedCount: manager.suppressedCount,
          retryCount: manager.retryCount,
          currentStatus: manager.currentStatus,
          lastActivity: Math.max.apply(Math, Object.values(manager.lastToastTime)) || 0
        };
      },
      
      /**
       * 检查特定类型是否可以显示
       * @param {String} type Toast类型
       * @returns {Object} 检查结果
       */
      canShow: function(type) {
        var typeConfig = manager.config.types[type];
        if (!typeConfig) {
          return { canShow: false, reason: 'unknown_type' };
        }
        
        var now = Date.now();
        var lastTime = manager.lastToastTime[type] || 0;
        var timeSinceLastToast = now - lastTime;
        
        // 检查时间间隔
        if (typeConfig.minInterval > 0 && timeSinceLastToast < typeConfig.minInterval) {
          return {
            canShow: false,
            reason: 'time_interval',
            remainingTime: typeConfig.minInterval - timeSinceLastToast
          };
        }
        
        // 检查重试次数
        if (typeConfig.maxRetries && manager.retryCount[type] >= typeConfig.maxRetries) {
          return {
            canShow: false,
            reason: 'max_retries',
            currentRetries: manager.retryCount[type]
          };
        }
        
        return { canShow: true };
      },
      
      /**
       * 批量状态更新（减少频繁调用）
       * @param {Array} updates 更新数组 [{type, status, message, options}]
       */
      batchUpdateStatus: function(updates) {
        var shownCount = 0;
        
        for (var i = 0; i < updates.length; i++) {
          var update = updates[i];
          if (manager.updateStatus(update.type, update.status, update.message, update.options)) {
            shownCount++;
            
            // 限制并发显示数量
            if (shownCount >= manager.config.global.maxConcurrent) {
              break;
            }
          }
        }
        
        return shownCount;
      },
      
      /**
       * 设置调试模式
       * @param {Boolean} enabled 是否启用
       */
      setDebugMode: function(enabled) {
        manager.config.global.debugMode = enabled;
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('Toast调试模式:', enabled ? '已启用' : '已禁用');
          
          if (enabled) {
            Logger.debug('当前Toast统计:', manager.getStatistics());
          }
        }
      },

      /**
       * ===== 生命周期管理接口 =====
       */
      
      /**
       * 初始化Toast管理器（标准化接口）
       */
      init: function(dependencies) {
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🔧 Toast管理器初始化');
        }
        // Toast管理器无需特殊初始化
        return Promise.resolve();
      },
      
      /**
       * 启动Toast管理器（标准化接口）
       */
      start: function() {
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🚀 Toast管理器启动');
        }
        // Toast管理器无需启动过程
        return Promise.resolve();
      },
      
      /**
       * 停止Toast管理器（标准化接口）
       */
      stop: function() {
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('⏹️ Toast管理器停止');
        }
        // 清除所有待显示的Toast
        manager.clearAll();
        return Promise.resolve();
      },
      
      /**
       * 销毁Toast管理器（标准化接口）
       */
      destroy: function() {
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🗑️ Toast管理器销毁');
        }
        manager.clearAll();
        manager.config = null;
        return Promise.resolve();
      },
      
      /**
       * 获取Toast管理器状态（标准化接口）
       */
      getStatus: function() {
        var statistics = manager.getStatistics();
        
        return {
          name: 'Toast管理器',
          state: 'running',
          isHealthy: true,
          isRunning: true,
          lastError: null,
          diagnostics: {
            totalToastCount: manager.totalToastCount,
            activeTypes: Object.keys(manager.currentStatus),
            suppressedToday: Object.keys(manager.suppressedCount).length,
            configuredTypes: Object.keys(manager.config.toast || {}).length
          },
          statistics: statistics
        };
      }
    };
    
    return manager;
  }
};

module.exports = ToastManager;