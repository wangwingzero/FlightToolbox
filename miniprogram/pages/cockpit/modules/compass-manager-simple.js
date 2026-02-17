/**
 * 简化版航向管理器 - 仅使用指南针原始数据
 * 
 * 设计原则：
 * - 直接使用指南针原始数据，无复杂滤波
 * - 1秒钟更新一次显示
 * - 移除三传感器融合
 * - 保持接口兼容性
 */

var ConsoleHelper = require('../../../utils/console-helper.js');
var Logger = require('./logger.js');

var CompassManager = {
  /**
   * 创建简化航向管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 配置和基础状态
      config: config,
      callbacks: null,
      pageRef: null,
      isRunning: false,
      
      // 当前航向值
      currentHeading: 0,
      lastRawHeading: 0,
      
      // 更新控制
      lastUpdateTime: 0,
      updateInterval: 1000, // 1秒更新间隔
      updateTimer: null,
      
      // 监听函数引用
      compassChangeListener: null,
      
      /**
       * 初始化航向管理器
       * @param {Object} page 页面实例
       * @param {Object} callbacks 回调函数集合
       */
      init: function(page, callbacks) {
        manager.pageRef = page;
        manager.callbacks = callbacks || {};
        
        // 创建指南针监听函数
        manager.compassChangeListener = function(res) {
          // 检查页面状态
          if (!manager.pageRef || manager.pageRef._isDestroying || manager.pageRef.isDestroyed) {
            return;
          }
          
          manager.handleCompassChange(res);
        };
        
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🧭 简化航向管理器初始化完成（原始数据版）');
        }
      },
      
      /**
       * 启动航向系统
       */
      start: function() {
        if (config && config.debug && config.debug.enableVerboseLogging) {
          ConsoleHelper.compass('🧭 启动简化航向系统');
        }
        
        if (manager.isRunning) {
          if (config && config.debug && config.debug.enableVerboseLogging) {
            ConsoleHelper.compass('🧭 航向系统已运行');
          }
          return;
        }
        
        // 启动指南针
        wx.startCompass({
          success: function() {
            if (config && config.debug && config.debug.enableVerboseLogging) {
              ConsoleHelper.success('✅ 指南针启动成功');
            }
            manager.isRunning = true;
            
            // 注册监听器
            wx.onCompassChange(manager.compassChangeListener);
            
            // 启动1秒定时更新
            manager.startFixedIntervalUpdate();
            
            if (manager.callbacks.onCompassStart) {
              manager.callbacks.onCompassStart();
            }
          },
          fail: function(err) {
            if (config && config.debug && config.debug.enableVerboseLogging) {
              ConsoleHelper.error('❌ 指南针启动失败: ' + (err.errMsg || ''));
            }
            if (manager.callbacks.onCompassError) {
              manager.callbacks.onCompassError(err);
            }
          }
        });
      },
      
      /**
       * 处理指南针数据变化
       * @param {Object} res 指南针数据
       */
      handleCompassChange: function(res) {
        if (!manager.isRunning || !res || res.direction === undefined) {
          return;
        }
        
        // 存储原始航向值，不做任何处理
        manager.lastRawHeading = res.direction;
      },
      
      /**
       * 启动固定间隔更新（1秒）
       */
      startFixedIntervalUpdate: function() {
        if (manager.updateTimer) {
          clearInterval(manager.updateTimer);
        }
        
        // 立即执行一次
        manager.performUpdate();
        
        // 设置1秒间隔定时器
        manager.updateTimer = setInterval(function() {
          if (manager.isRunning) {
            manager.performUpdate();
          }
        }, manager.updateInterval);
      },
      
      /**
       * 执行更新
       */
      performUpdate: function() {
        if (!manager.isRunning) {
          return;
        }
        
        // 使用最新的原始航向值
        var heading = Math.round(manager.lastRawHeading);
        
        // 确保在0-360范围内
        heading = (heading + 360) % 360;
        
        // 更新当前航向
        manager.currentHeading = heading;
        manager.lastUpdateTime = Date.now();
        
        // 更新页面显示
        if (manager.pageRef && manager.pageRef.safeSetData) {
          manager.pageRef.safeSetData({
            heading: heading
          });
        }
        
        // 触发回调
        if (manager.callbacks.onHeadingUpdate) {
          manager.callbacks.onHeadingUpdate({
            heading: heading,
            lastStableHeading: heading,
            accuracy: 0,
            smoothedValue: heading,
            headingStability: 1.0
          });
        }
      },
      
      /**
       * 停止航向系统
       */
      stop: function() {
        if (config && config.debug && config.debug.enableVerboseLogging) {
          ConsoleHelper.compass('🛑 停止航向系统');
        }
        
        manager.isRunning = false;
        
        // 清除定时器
        if (manager.updateTimer) {
          clearInterval(manager.updateTimer);
          manager.updateTimer = null;
        }
        
        // 停止指南针
        if (manager.compassChangeListener) {
          wx.offCompassChange(manager.compassChangeListener);
        }
        wx.stopCompass();
        
        // 清除状态
        manager.currentHeading = 0;
        manager.lastRawHeading = 0;
        
        if (manager.callbacks.onCompassStop) {
          manager.callbacks.onCompassStop();
        }
      },
      
      /**
       * 切换航向/航迹模式
       * @param {String} currentMode 当前模式
       */
      toggleHeadingMode: function(currentMode) {
        var newMode = currentMode === 'heading' ? 'track' : 'heading';
        
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🧭 切换航向模式:', currentMode, '->', newMode);
        }
        
        if (manager.pageRef && manager.pageRef.safeSetData) {
          manager.pageRef.safeSetData({
            headingMode: newMode
          });
        }
        
        if (manager.callbacks.onModeChange) {
          manager.callbacks.onModeChange({
            oldMode: currentMode,
            newMode: newMode
          });
        }
      },
      
      /**
       * 获取运行状态
       * @returns {Object} 状态信息
       */
      getStatus: function() {
        return {
          isRunning: manager.isRunning,
          currentHeading: manager.currentHeading,
          lastUpdateTime: manager.lastUpdateTime
        };
      }
    };
    
    return manager;
  }
};

module.exports = CompassManager;