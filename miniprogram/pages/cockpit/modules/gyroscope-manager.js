/**
 * 陀螺仪管理器模块 - 角速度检测
 * 
 * 设计原则：
 * - 检测旋转状态和角速度
 * - 为航向过滤提供转弯检测
 * - 提供角度变化预测
 */

var ConsoleHelper = require('../../../utils/console-helper.js');
var Logger = require('./logger.js');
var systemInfoHelper = require('../../../utils/system-info-helper.js');

var GyroscopeManager = {
  /**
   * 创建陀螺仪管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 内部状态
      callbacks: null,
      pageRef: null,
      isRunning: false,
      gyroscopeSupported: null,
      
      // 陀螺仪数据状态
      latestAngularVelocity: { x: 0, y: 0, z: 0 },
      angularHistory: [],
      maxHistorySize: 10,
      
      // 监听函数引用管理
      gyroscopeChangeListener: null,
      
      /**
       * 初始化管理器
       * @param {Object} page 页面实例
       * @param {Object} callbacks 回调函数集合
       */
      init: function(page, callbacks) {
        manager.pageRef = page;
        manager.callbacks = callbacks || {};
        
        // 创建监听函数引用 - 增强页面状态保护
        manager.gyroscopeChangeListener = function(res) {
          // 🔒 第一时间检查页面状态，防止DOM更新错误
            if (!manager.pageRef || manager.pageRef._isDestroying || manager.pageRef.isDestroyed) {
              if (config && config.debug && config.debug.enableVerboseLogging) {
                Logger.warn('⚠️ 陀螺仪回调被拒绝: 页面已销毁或正在销毁');
              }
              return;
            }

          // 🔒 使用BasePage的严格状态检查（如果可用）
            if (manager.pageRef._isPageDestroyed && manager.pageRef._isPageDestroyed()) {
              if (config && config.debug && config.debug.enableVerboseLogging) {
                Logger.warn('⚠️ 陀螺仪回调被拒绝: BasePage状态检查失败');
              }
              return;
            }

          manager.handleGyroscopeChange(res);
        };
        
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🌀 陀螺仪管理器初始化完成');
        }
      },
      
      /**
       * 启动陀螺仪
       * @param {Object} context 当前上下文
       */
      start: function(context) {
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🌀 启动陀螺仪');
        }
        
        // 防止重复启动
        if (manager.isRunning) {
          if (config && config.debug && config.debug.enableVerboseLogging) {
            Logger.debug('🌀 陀螺仪已经在运行中，跳过启动');
          }
          return;
        }
        
        manager.checkGyroscopeSupport(function(supported) {
          if (supported) {
            manager.doStartGyroscope();
          } else {
            if (config && config.debug && config.debug.enableVerboseLogging) {
              Logger.warn('⚠️ 设备不支持陀螺仪');
            }
            if (manager.callbacks.onGyroscopeError) {
              manager.callbacks.onGyroscopeError({ errMsg: '设备不支持陀螺仪' });
            }
          }
        });
      },
      
      /**
       * 检查陀螺仪支持
       * @param {Function} callback 回调函数
       */
      checkGyroscopeSupport: function(callback) {
        if (manager.gyroscopeSupported !== null) {
          callback(manager.gyroscopeSupported);
          return;
        }
        
        // 检查基础库版本和设备支持（聚合到 helper）
        try {
          var abi = (systemInfoHelper.getAppBaseInfo && systemInfoHelper.getAppBaseInfo()) || {};
          var SDKVersion = abi.SDKVersion || abi.hostVersion || '0.0.0';
          var compareVersion = function(v1, v2) {
            v1 = String(v1 || '0.0.0').split('.');
            v2 = String(v2 || '0.0.0').split('.');
            var len = Math.max(v1.length, v2.length);
            while (v1.length < len) v1.push('0');
            while (v2.length < len) v2.push('0');
            for (var i = 0; i < len; i++) {
              var num1 = parseInt(v1[i], 10);
              var num2 = parseInt(v2[i], 10);
              if (num1 > num2) return 1;
              if (num1 < num2) return -1;
            }
            return 0;
          };
          // 陀螺仪需要基础库2.3.0+
          var supported = compareVersion(SDKVersion, '2.3.0') >= 0 && (typeof wx.startGyroscope === 'function');
          manager.gyroscopeSupported = supported;
          callback(supported);
        } catch (e) {
          manager.gyroscopeSupported = false;
          callback(false);
        }
      },
      
      /**
       * 启动陀螺仪监听
       */
      doStartGyroscope: function() {
        if (manager.isRunning) {
          if (config && config.debug && config.debug.enableVerboseLogging) {
            Logger.debug('🌀 陀螺仪已在运行，取消启动');
          }
          return;
        }
        
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🔧 准备启动陀螺仪传感器...');
        }
        
        // 🔧 强制停止再启动策略：先停止所有可能运行的实例
        manager.forceStopGyroscopeBeforeStart(function() {
          // 等待100ms确保完全停止
          setTimeout(function() {
            manager.doStartGyroscopeInstance();
          }, 100);
        });
      },
      
      /**
       * 🛑 强制停止陀螺仪（启动前预处理）
       * @param {Function} callback 停止完成回调
       */
      forceStopGyroscopeBeforeStart: function(callback) {
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🛑 强制停止陀螺仪传感器（如果在运行）');
        }
        
        // 清理所有监听器
        if (manager.gyroscopeChangeListener) {
          wx.offGyroscopeChange(manager.gyroscopeChangeListener);
        }
        wx.offGyroscopeChange(); // 全局清理
        
        // 强制停止陀螺仪（即使可能没有运行）
        wx.stopGyroscope({
          success: function() {
            if (config && config.debug && config.debug.enableVerboseLogging) {
              Logger.debug('✅ 陀螺仪强制停止成功');
            }
            manager.isRunning = false;
            callback();
          },
          fail: function(err) {
            // 停止失败通常表示没有在运行，这是正常的
            if (config && config.debug && config.debug.enableVerboseLogging) {
              Logger.debug('ℹ️ 陀螺仪停止: ' + (err.errMsg || '可能未运行'));
            }
            manager.isRunning = false;
            callback();
          }
        });
      },
      
      /**
       * 🚀 实际启动陀螺仪传感器
       */
      doStartGyroscopeInstance: function() {
        if (config && config.debug && config.debug.enableVerboseLogging) {
            Logger.debug('🚀 开始启动陀螺仪实例');
          }
        
        wx.startGyroscope({
          interval: 'ui', // 60ms左右的更新频率
          success: function() {
            if (config && config.debug && config.debug.enableVerboseLogging) {
              Logger.debug('✅ 陀螺仪启动成功');
            }
            
            // 标记为运行状态
            manager.isRunning = true;
            
            // 注册监听器
            wx.onGyroscopeChange(manager.gyroscopeChangeListener);
            
            if (manager.callbacks.onGyroscopeStart) {
              manager.callbacks.onGyroscopeStart();
            }
          },
          fail: function(err) {
            var errorMsg = err.errMsg || '未知错误';
            if (config && config.debug && config.debug.enableVerboseLogging) {
              Logger.error('❌ 陀螺仪启动失败: ' + errorMsg);
            }
            
            // 🔄 如果仍然是"has enable"错误，尝试重试一次
            if (errorMsg.indexOf('has enable') !== -1) {
              if (config && config.debug && config.debug.enableVerboseLogging) {
                 Logger.debug('🔄 检测到陀螺仪启动冲突，尝试重启...');
               }
              setTimeout(function() {
                manager.retryStartGyroscope(1);
              }, 200);
            } else {
              manager.gyroscopeSupported = false;
              manager.isRunning = false;
              if (manager.callbacks.onGyroscopeError) {
                manager.callbacks.onGyroscopeError(err);
              }
            }
          }
        });
      },
      
      /**
       * 🔄 重试启动陀螺仪
       * @param {Number} retryCount 重试次数
       */
      retryStartGyroscope: function(retryCount) {
        if (retryCount > 2) {
          if (config && config.debug && config.debug.enableVerboseLogging) {
             Logger.error('❌ 陀螺仪重试失败，放弃启动');
           }
          manager.gyroscopeSupported = false;
          manager.isRunning = false;
          if (manager.callbacks.onGyroscopeError) {
            manager.callbacks.onGyroscopeError({ errMsg: '重试失败' });
          }
          return;
        }
        
        if (config && config.debug && config.debug.enableVerboseLogging) {
           Logger.debug('🔄 陀螺仪重试第' + retryCount + '次');
         }
        
        // 再次强制停止
        wx.stopGyroscope();
        wx.offGyroscopeChange();
        
        setTimeout(function() {
          wx.startGyroscope({
            interval: 'ui',
            success: function() {
              if (config && config.debug && config.debug.enableVerboseLogging) {
                 Logger.debug('✅ 陀螺仪重试启动成功');
               }
              manager.isRunning = true;
              wx.onGyroscopeChange(manager.gyroscopeChangeListener);
              if (manager.callbacks.onGyroscopeStart) {
                manager.callbacks.onGyroscopeStart();
              }
            },
            fail: function(err) {
              if (config && config.debug && config.debug.enableVerboseLogging) {
                 Logger.error('❌ 陀螺仪重试第' + retryCount + '次失败: ' + (err.errMsg || ''));
               }
              manager.retryStartGyroscope(retryCount + 1);
            }
          });
        }, 300 * retryCount); // 递增延迟时间
      },
      
      /**
       * 处理陀螺仪数据变化
       * @param {Object} res 陀螺仪数据 {x, y, z}
       */
      handleGyroscopeChange: function(res) {
        if (!manager.isRunning) {
          return;
        }
        
        if (!res || res.x === undefined || res.y === undefined || res.z === undefined) {
          if (config && config.debug && config.debug.enableVerboseLogging) {
            Logger.warn('⚠️ 无效的陀螺仪数据');
          }
          return;
        }
        
        // 存储最新数据
        manager.latestAngularVelocity = {
          x: res.x,
          y: res.y,
          z: res.z,
          timestamp: Date.now()
        };
        
        // 添加到历史记录
        manager.angularHistory.push(manager.latestAngularVelocity);
        if (manager.angularHistory.length > manager.maxHistorySize) {
          manager.angularHistory.shift();
        }
        
        // 分析运动状态
        var motionState = manager.analyzeMotionState();
        
        // 调试输出
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🌀 陀螺仪数据: x=' + res.x.toFixed(3) + ', y=' + res.y.toFixed(3) + ', z=' + res.z.toFixed(3) + ', state=' + motionState.state);
        }
        
        // 回调数据更新
        if (manager.callbacks.onGyroscopeUpdate) {
          manager.callbacks.onGyroscopeUpdate({
            angularVelocity: manager.latestAngularVelocity,
            motionState: motionState
          });
        }
      },
      
      /**
       * 分析运动状态
       * @returns {Object} 运动状态信息
       */
      analyzeMotionState: function() {
        var current = manager.latestAngularVelocity;
        
        // 计算总角速度大小
        var totalAngularSpeed = Math.sqrt(
          current.x * current.x + 
          current.y * current.y + 
          current.z * current.z
        );
        
        // Z轴角速度（航向变化）
        var headingTurnRate = Math.abs(current.z);
        
        // 运动状态判断
        var state = 'STABLE';
        if (totalAngularSpeed > 20) {
          state = 'RAPID_TURN';
        } else if (headingTurnRate > 10) {
          state = 'HEADING_TURN';
        } else if (totalAngularSpeed > 5) {
          state = 'GENTLE_TURN';
        }
        
        return {
          state: state,
          totalAngularSpeed: totalAngularSpeed,
          headingTurnRate: headingTurnRate,
          isStable: state === 'STABLE',
          isTurning: headingTurnRate > 3 // 3度/秒以上认为在转弯
        };
      },
      
      /**
       * 获取平均角速度（用于稳定性分析）
       * @param {Number} timeWindow 时间窗口（毫秒）
       * @returns {Object} 平均角速度
       */
      getAverageAngularVelocity: function(timeWindow) {
        timeWindow = timeWindow || 1000; // 默认1秒
        var currentTime = Date.now();
        
        var validData = manager.angularHistory.filter(function(data) {
          return (currentTime - data.timestamp) <= timeWindow;
        });
        
        if (validData.length === 0) {
          return { x: 0, y: 0, z: 0 };
        }
        
        var sum = validData.reduce(function(acc, data) {
          return {
            x: acc.x + data.x,
            y: acc.y + data.y,
            z: acc.z + data.z
          };
        }, { x: 0, y: 0, z: 0 });
        
        return {
          x: sum.x / validData.length,
          y: sum.y / validData.length,
          z: sum.z / validData.length
        };
      },
      
      /**
       * 停止陀螺仪
       */
      stop: function() {
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🛑 停止陀螺仪');
        }
        
        // 标记为停止状态
        manager.isRunning = false;
        
        // 清理监听器
        if (manager.gyroscopeChangeListener) {
          wx.offGyroscopeChange(manager.gyroscopeChangeListener);
        }
        wx.offGyroscopeChange(); // 全局清理
        
        // 停止陀螺仪
        wx.stopGyroscope({
          success: function() {
            if (config && config.debug && config.debug.enableVerboseLogging) {
              Logger.debug('✅ 陀螺仪停止成功');
            }
          },
          fail: function(err) {
            if (config && config.debug && config.debug.enableVerboseLogging) {
              Logger.warn('⚠️ 陀螺仪停止失败: ' + (err.errMsg || ''));
            }
          }
        });
        
        // 清除数据
        manager.latestAngularVelocity = { x: 0, y: 0, z: 0 };
        manager.angularHistory = [];
        manager.gyroscopeSupported = null;
        
        if (manager.callbacks.onGyroscopeStop) {
          manager.callbacks.onGyroscopeStop();
        }
      },
      
      /**
       * 获取运行状态
       * @returns {Object} 状态信息
       */
      getStatus: function() {
        return {
          isRunning: manager.isRunning,
          gyroscopeSupported: manager.gyroscopeSupported,
          latestData: manager.latestAngularVelocity
        };
      }
    };
    
    return manager;
  }
};

module.exports = GyroscopeManager;