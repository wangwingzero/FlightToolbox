/**
 * 陀螺仪管理器模块 - 角速度检测
 * 
 * 设计原则：
 * - 检测旋转状态和角速度
 * - 为航向过滤提供转弯检测
 * - 提供角度变化预测
 */

var ConsoleHelper = require('../../../utils/console-helper.js');

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
        
        // 创建监听函数引用
        manager.gyroscopeChangeListener = function(res) {
          manager.handleGyroscopeChange(res);
        };
        
        console.log('🌀 陀螺仪管理器初始化完成');
      },
      
      /**
       * 启动陀螺仪
       * @param {Object} context 当前上下文
       */
      start: function(context) {
        ConsoleHelper.compass('🌀 启动陀螺仪');
        
        // 防止重复启动
        if (manager.isRunning) {
          ConsoleHelper.compass('🌀 陀螺仪已经在运行中，跳过启动');
          return;
        }
        
        manager.checkGyroscopeSupport(function(supported) {
          if (supported) {
            manager.doStartGyroscope();
          } else {
            console.warn('⚠️ 设备不支持陀螺仪');
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
        
        // 检查基础库版本和设备支持
        wx.getSystemInfo({
          success: function(res) {
            var SDKVersion = res.SDKVersion;
            var compareVersion = function(v1, v2) {
              v1 = v1.split('.');
              v2 = v2.split('.');
              var len = Math.max(v1.length, v2.length);
              while (v1.length < len) v1.push('0');
              while (v2.length < len) v2.push('0');
              for (var i = 0; i < len; i++) {
                var num1 = parseInt(v1[i]);
                var num2 = parseInt(v2[i]);
                if (num1 > num2) return 1;
                else if (num1 < num2) return -1;
              }
              return 0;
            };
            
            // 陀螺仪需要基础库2.3.0+
            var supported = compareVersion(SDKVersion, '2.3.0') >= 0;
            manager.gyroscopeSupported = supported;
            callback(supported);
          },
          fail: function() {
            manager.gyroscopeSupported = false;
            callback(false);
          }
        });
      },
      
      /**
       * 启动陀螺仪监听
       */
      doStartGyroscope: function() {
        if (manager.isRunning) {
          ConsoleHelper.compass('🌀 陀螺仪已在运行，取消启动');
          return;
        }
        
        // 清理旧的监听器
        wx.offGyroscopeChange();
        
        ConsoleHelper.compass('🚀 开始启动陀螺仪实例');
        
        wx.startGyroscope({
          interval: 'ui', // 60ms左右的更新频率
          success: function() {
            ConsoleHelper.success('✅ 陀螺仪启动成功');
            
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
            ConsoleHelper.error('❌ 陀螺仪启动失败: ' + errorMsg);
            
            manager.gyroscopeSupported = false;
            manager.isRunning = false;
            
            if (manager.callbacks.onGyroscopeError) {
              manager.callbacks.onGyroscopeError(err);
            }
          }
        });
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
          ConsoleHelper.compass('⚠️ 无效的陀螺仪数据');
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
        if (config.debug && config.debug.enableVerboseLogging) {
          console.log('🌀 陀螺仪数据:', {
            x: res.x.toFixed(3),
            y: res.y.toFixed(3), 
            z: res.z.toFixed(3),
            state: motionState.state
          });
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
        ConsoleHelper.compass('🛑 停止陀螺仪');
        
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
            ConsoleHelper.compass('✅ 陀螺仪停止成功');
          },
          fail: function(err) {
            ConsoleHelper.compass('⚠️ 陀螺仪停止失败: ' + (err.errMsg || ''));
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