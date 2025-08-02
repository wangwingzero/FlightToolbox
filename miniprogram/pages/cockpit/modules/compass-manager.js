/**
 * 指南针航向管理器模块 - 原始数据版
 * 
 * 设计原则：
 * - 1秒获取一次原始航向数据
 * - 不进行任何过滤或平滑处理
 * - 直接使用手机原始数据
 */

var ConsoleHelper = require('../../../utils/console-helper.js');

var CompassManager = {
  /**
   * 创建指南针管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 内部状态
      callbacks: null,
      pageRef: null,
      isRunning: false,
      compassSupported: null,
      retryCount: 0,
      maxRetries: 3,
      
      // 原始数据状态
      latestHeading: 0,
      updateTimer: null,
      
      // 🔧 新增：监听函数引用管理（按照官方最佳实践）
      compassChangeListener: null,
      
      /**
       * 初始化管理器
       * @param {Object} page 页面实例
       * @param {Object} callbacks 回调函数集合
       */
      init: function(page, callbacks) {
        manager.pageRef = page;
        manager.callbacks = callbacks || {};
        
        // 🔧 按照官方最佳实践：创建监听函数引用
        manager.compassChangeListener = function(res) {
          manager.handleCompassChange(res);
        };
        
        console.log('🧭 指南针管理器初始化完成（原始数据版，已创建监听函数引用）');
      },
      
      /**
       * 启动指南针 - 原始数据版
       * @param {Object} context 当前上下文
       */
      start: function(context) {
        ConsoleHelper.compass('🧭 启动指南针（原始数据版，1秒间隔）');
        
        // 防止重复启动
        if (manager.isRunning) {
          ConsoleHelper.compass('🧭 指南针已经在运行中，跳过启动');
          return;
        }
        
        // 确保完全停止后再启动
        manager.stopAndStart();
      },
      
      /**
       * 停止并重新启动指南针
       */
      stopAndStart: function() {
        ConsoleHelper.compass('🔧 开始完全清理指南针状态');
        
        // 1. 立即标记为停止状态，防止重复操作
        manager.isRunning = false;
        
        // 2. 停止定时器
        if (manager.updateTimer) {
          clearInterval(manager.updateTimer);
          manager.updateTimer = null;
          ConsoleHelper.compass('⏰ 已清理定时器');
        }
        
        // 3. 完全清理监听器（按照官方最佳实践：先精确清理，再全局清理）
        if (manager.compassChangeListener) {
          wx.offCompassChange(manager.compassChangeListener);
          ConsoleHelper.compass('📡 已精确清理指南针监听器');
        }
        wx.offCompassChange(); // 保险起见，再全局清理
        ConsoleHelper.compass('📡 已完全清理所有指南针监听器');
        
        // 4. 强制停止指南针（忽略结果，直接进行下一步）
        wx.stopCompass({
          success: function() {
            ConsoleHelper.compass('✅ 停止旧指南针成功');
          },
          fail: function(err) {
            ConsoleHelper.compass('⚠️ 停止旧指南针失败（正常，可能本来就没启动）: ' + (err.errMsg || ''));
          },
          complete: function() {
            // 不管成功失败，都继续下一步
            manager.proceedWithCleanStart();
          }
        });
        
        // 5. 备用清理：如果wx.stopCompass没有回调，延迟执行
        setTimeout(function() {
          if (!manager.isRunning) { // 如果还没有启动新的
            ConsoleHelper.compass('🔧 备用清理触发');
            manager.proceedWithCleanStart();
          }
        }, 300);
      },
      
      /**
       * 执行彻底清理后的启动
       */
      proceedWithCleanStart: function() {
        // 再次确保状态清理
        manager.latestHeading = 0;
        manager.isRunning = false;
        
        ConsoleHelper.compass('🔧 状态完全清理完成，准备重新启动');
        
        // 短暂延迟确保系统清理完成
        setTimeout(function() {
          manager.checkCompassSupport(function(supported) {
            if (supported) {
              manager.doStartCompass();
            } else {
              console.warn('⚠️ 设备不支持指南针');
            }
          });
        }, 100);
      },
      
      /**
       * 检查指南针支持
       * @param {Function} callback 回调函数
       */
      checkCompassSupport: function(callback) {
        if (manager.compassSupported !== null) {
          callback(manager.compassSupported);
          return;
        }
        
        // 简单的支持检查
        wx.getSystemInfo({
          success: function(res) {
            // 大部分现代手机都支持指南针
            manager.compassSupported = true;
            callback(true);
          },
          fail: function() {
            manager.compassSupported = false;
            callback(false);
          }
        });
      },
      
      /**
       * 启动指南针监听
       */
      startCompass: function() {
        // 防止重复启动
        if (manager.isRunning) {
          ConsoleHelper.compass('🧭 指南针已经在运行中，跳过启动');
          return;
        }
        
        // 🔧 强制重置状态，确保干净启动
        manager.isRunning = false;
        manager.retryCount = 0;
        manager.latestHeading = 0;
        
        // 先彻底清理，再启动新的指南针
        ConsoleHelper.compass('🔧 启动前预清理，确保状态干净');
        manager.cleanStopCompass();
      },
      
      /**
       * 执行指南针启动
       */
      doStartCompass: function() {
        // 最后的状态检查，防止重复启动
        if (manager.isRunning) {
          ConsoleHelper.compass('🧭 指南针已在运行，取消启动');
          return;
        }
        
        // 启动前再做一次强制清理，防止底层API状态残留
        wx.offCompassChange();
        wx.stopCompass({
          complete: function() {
            // 清理完成后启动
            ConsoleHelper.compass('🚀 开始启动全新指南针实例');
            
            wx.startCompass({
              success: function() {
                ConsoleHelper.success('✅ 指南针启动成功');
                
                // 只有成功后才标记为运行状态
                manager.isRunning = true;
                manager.retryCount = 0; // 重置重试计数器
                
                // 🔧 按照官方最佳实践：使用保存的监听函数引用
                wx.onCompassChange(manager.compassChangeListener);
                
                // 启动1秒定时器更新显示
                manager.startUpdateTimer();
                
                // 🔧 立即获取一次指南针数据以确保初始化
                setTimeout(function() {
                  if (manager.isRunning) {
                    console.log('🧭 指南针启动后状态检查:', {
                      isRunning: manager.isRunning,
                      latestHeading: manager.latestHeading,
                      hasListener: !!manager.compassChangeListener
                    });
                  }
                }, 100);
                
                if (manager.callbacks.onCompassStart) {
                  manager.callbacks.onCompassStart();
                }
              },
              fail: function(err) {
                var errorMsg = err.errMsg || '未知错误';
                ConsoleHelper.error('❌ 指南针启动失败: ' + errorMsg);
                
                // 检查是否是"已启用"错误
                if (errorMsg.includes('has enable')) {
                  // 检查重试次数
                  if (manager.retryCount >= manager.maxRetries) {
                    ConsoleHelper.error('❌ 指南针重试次数已达上限，停止重试');
                    manager.compassSupported = false;
                    manager.isRunning = false;
                    if (manager.callbacks.onCompassError) {
                      manager.callbacks.onCompassError(err);
                    }
                    return;
                  }
                  
                  manager.retryCount++;
                  ConsoleHelper.compass('🔧 检测到指南针已启用错误，尝试更彻底的清理 (重试' + manager.retryCount + '/' + manager.maxRetries + ')');
                  
                  // 🔧 强制清理后重试一次（按照官方最佳实践）
                  if (manager.compassChangeListener) {
                    wx.offCompassChange(manager.compassChangeListener);
                  }
                  wx.offCompassChange(); // 全局清理
                  setTimeout(function() {
                    wx.stopCompass({
                      complete: function() {
                        // 延迟更长时间后重试
                        setTimeout(function() {
                          if (!manager.isRunning && manager.retryCount <= manager.maxRetries) {
                            manager.doStartCompass();
                          }
                        }, 1000); // 增加延迟时间
                      }
                    });
                  }, 200); // 增加延迟时间
                  
                  return; // 不触发错误回调，因为会重试
                }
                
                // 其他错误正常处理
                manager.compassSupported = false;
                manager.isRunning = false;
                
                if (manager.callbacks.onCompassError) {
                  manager.callbacks.onCompassError(err);
                }
              }
            });
          }
        });
      },
      
      /**
       * 处理指南针数据变化 - 原始数据版
       * @param {Object} res 指南针数据
       */
      handleCompassChange: function(res) {
        // 🔧 按照官方最佳实践：严格检查运行状态，避免处理意外数据
        if (!manager.isRunning) {
          ConsoleHelper.compass('⚠️ 指南针未运行，忽略数据');
          return;
        }
        
        if (!res || res.direction === undefined) {
          ConsoleHelper.compass('⚠️ 无效的指南针数据');
          return;
        }
        
        // 直接存储原始航向数据，不做任何处理
        manager.latestHeading = res.direction;
        
        // 🔧 调试：强制输出指南针数据以排查问题
        console.log('🧭 指南针数据接收:', {
          direction: res.direction,
          accuracy: res.accuracy,
          timestamp: Date.now(),
          isRunning: manager.isRunning
        });
        
        // 可选：输出调试信息（包含精度信息）
        if (config.debug && config.debug.enableVerboseLogging) {
          console.log('🧭 收到原始航向数据:', res.direction + '°, 精度:', res.accuracy);
        }
      },
      
      /**
       * 启动1秒定时器更新显示
       */
      startUpdateTimer: function() {
        // 清除旧定时器
        if (manager.updateTimer) {
          clearInterval(manager.updateTimer);
        }
        
        console.log('⏰ 启动1秒定时器，使用原始航向数据');
        
        // 设置固定1秒间隔的定时器
        manager.updateTimer = setInterval(function() {
          manager.updateHeadingDisplay();
        }, 1000);
        
        // 立即执行一次更新
        manager.updateHeadingDisplay();
      },
      
      /**
       * 更新航向显示
       */
      updateHeadingDisplay: function() {
        if (!manager.isRunning) {
          console.log('⚠️ 指南针未运行，跳过航向更新');
          return;
        }
        
        var currentHeading = Math.round(manager.latestHeading);
        
        console.log('🧭 更新航向显示:', {
          currentHeading: currentHeading,
          latestHeading: manager.latestHeading,
          isRunning: manager.isRunning,
          timestamp: Date.now()
        });
        
        // 更新页面数据
        if (manager.pageRef && manager.pageRef.setData) {
          manager.pageRef.setData({
            heading: currentHeading
          });
        }
        
        // 回调航向更新
        if (manager.callbacks.onHeadingUpdate) {
          manager.callbacks.onHeadingUpdate({
            heading: currentHeading,
            lastStableHeading: currentHeading,
            accuracy: 0, // 原始数据模式不提供精度信息
            smoothedValue: manager.latestHeading,
            headingStability: 1 // 原始数据始终稳定
          });
        }
      },
      
      
      /**
       * 停止指南针
       */
      stop: function() {
        ConsoleHelper.compass('🛑 完全停止指南针');
        
        // 1. 立即标记为停止状态
        manager.isRunning = false;
        
        // 2. 停止定时器
        if (manager.updateTimer) {
          clearInterval(manager.updateTimer);
          manager.updateTimer = null;
          ConsoleHelper.compass('⏰ 已停止2秒定时器');
        }
        
        // 3. 清理监听器（按照官方最佳实践：先精确清理，再全局清理）
        if (manager.compassChangeListener) {
          wx.offCompassChange(manager.compassChangeListener);
          ConsoleHelper.compass('📡 已精确清理指南针监听器');
        }
        wx.offCompassChange(); // 保险起见，再全局清理
        ConsoleHelper.compass('📡 已完全清理所有指南针监听器');
        
        // 4. 强制停止指南针，忽略结果
        wx.stopCompass({
          success: function() {
            ConsoleHelper.compass('✅ 指南针停止成功');
          },
          fail: function(err) {
            ConsoleHelper.compass('⚠️ 指南针停止失败（正常，可能本来就没启动）: ' + (err.errMsg || ''));
          }
        });
        
        // 5. 清除所有状态
        manager.latestHeading = 0;
        manager.compassSupported = null; // 重置支持状态，下次启动时重新检测
        
        ConsoleHelper.compass('🔧 指南针状态完全清理');
        
        if (manager.callbacks.onCompassStop) {
          manager.callbacks.onCompassStop();
        }
      },
      
      /**
       * 切换航向/航迹模式
       * @param {string} currentMode 当前模式 ('heading' 或 'track')
       */
      toggleHeadingMode: function(currentMode) {
        var newMode = currentMode === 'heading' ? 'track' : 'heading';
        
        console.log('🧭 切换航向模式:', currentMode, '->', newMode);
        
        // 更新页面数据
        if (manager.pageRef && manager.pageRef.setData) {
          manager.pageRef.setData({
            headingMode: newMode
          });
        }
        
        // 回调模式切换
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
          compassSupported: manager.compassSupported
        };
      }
    };
    
    return manager;
  }
};

module.exports = CompassManager;