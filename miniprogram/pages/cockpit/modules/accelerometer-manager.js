/**
 * 加速度计管理器模块 - 姿态和机动检测
 * 
 * 设计原则：
 * - 检测设备姿态和倾斜状态
 * - 识别机动动作（转弯、爬升、下降）
 * - 为航向过滤提供姿态修正
 */

var ConsoleHelper = require('../../../utils/console-helper.js');

var AccelerometerManager = {
  /**
   * 创建加速度计管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 内部状态
      callbacks: null,
      pageRef: null,
      isRunning: false,
      accelerometerSupported: null,
      
      // 加速度计数据状态
      latestAcceleration: { x: 0, y: 0, z: 0 },
      accelerationHistory: [],
      maxHistorySize: 15,
      
      // 重力基准和姿态分析
      gravityBaseline: 9.8, // 标准重力加速度
      calibrationData: null,
      
      // 监听函数引用管理
      accelerometerChangeListener: null,
      
      /**
       * 初始化管理器
       * @param {Object} page 页面实例
       * @param {Object} callbacks 回调函数集合
       */
      init: function(page, callbacks) {
        manager.pageRef = page;
        manager.callbacks = callbacks || {};
        
        // 创建监听函数引用
        manager.accelerometerChangeListener = function(res) {
          manager.handleAccelerometerChange(res);
        };
        
        console.log('📐 加速度计管理器初始化完成');
      },
      
      /**
       * 启动加速度计
       * @param {Object} context 当前上下文
       */
      start: function(context) {
        ConsoleHelper.compass('📐 启动加速度计');
        
        // 防止重复启动
        if (manager.isRunning) {
          ConsoleHelper.compass('📐 加速度计已经在运行中，跳过启动');
          return;
        }
        
        manager.checkAccelerometerSupport(function(supported) {
          if (supported) {
            manager.doStartAccelerometer();
          } else {
            console.warn('⚠️ 设备不支持加速度计');
            if (manager.callbacks.onAccelerometerError) {
              manager.callbacks.onAccelerometerError({ errMsg: '设备不支持加速度计' });
            }
          }
        });
      },
      
      /**
       * 检查加速度计支持
       * @param {Function} callback 回调函数
       */
      checkAccelerometerSupport: function(callback) {
        if (manager.accelerometerSupported !== null) {
          callback(manager.accelerometerSupported);
          return;
        }
        
        // 加速度计是微信小程序基础API，一般都支持
        wx.getSystemInfo({
          success: function(res) {
            manager.accelerometerSupported = true;
            callback(true);
          },
          fail: function() {
            manager.accelerometerSupported = false;
            callback(false);
          }
        });
      },
      
      /**
       * 启动加速度计监听
       */
      doStartAccelerometer: function() {
        if (manager.isRunning) {
          ConsoleHelper.compass('📐 加速度计已在运行，取消启动');
          return;
        }
        
        // 清理旧的监听器
        wx.offAccelerometerChange();
        
        ConsoleHelper.compass('🚀 开始启动加速度计实例');
        
        wx.startAccelerometer({
          interval: 'ui', // 60ms左右的更新频率，与陀螺仪保持一致
          success: function() {
            ConsoleHelper.success('✅ 加速度计启动成功');
            
            // 标记为运行状态
            manager.isRunning = true;
            
            // 注册监听器
            wx.onAccelerometerChange(manager.accelerometerChangeListener);
            
            if (manager.callbacks.onAccelerometerStart) {
              manager.callbacks.onAccelerometerStart();
            }
          },
          fail: function(err) {
            var errorMsg = err.errMsg || '未知错误';
            ConsoleHelper.error('❌ 加速度计启动失败: ' + errorMsg);
            
            manager.accelerometerSupported = false;
            manager.isRunning = false;
            
            if (manager.callbacks.onAccelerometerError) {
              manager.callbacks.onAccelerometerError(err);
            }
          }
        });
      },
      
      /**
       * 处理加速度计数据变化
       * @param {Object} res 加速度计数据 {x, y, z}
       */
      handleAccelerometerChange: function(res) {
        if (!manager.isRunning) {
          return;
        }
        
        if (!res || res.x === undefined || res.y === undefined || res.z === undefined) {
          ConsoleHelper.compass('⚠️ 无效的加速度计数据');
          return;
        }
        
        // 存储最新数据
        manager.latestAcceleration = {
          x: res.x,
          y: res.y,
          z: res.z,
          timestamp: Date.now()
        };
        
        // 添加到历史记录
        manager.accelerationHistory.push(manager.latestAcceleration);
        if (manager.accelerationHistory.length > manager.maxHistorySize) {
          manager.accelerationHistory.shift();
        }
        
        // 分析姿态状态
        var attitudeState = manager.analyzeAttitudeState();
        
        // 调试输出
        if (config.debug && config.debug.enableVerboseLogging) {
          console.log('📐 加速度计数据:', {
            x: res.x.toFixed(3),
            y: res.y.toFixed(3),
            z: res.z.toFixed(3),
            tilt: attitudeState.tiltAngle.toFixed(1) + '°',
            state: attitudeState.state
          });
        }
        
        // 回调数据更新
        if (manager.callbacks.onAccelerometerUpdate) {
          manager.callbacks.onAccelerometerUpdate({
            acceleration: manager.latestAcceleration,
            attitudeState: attitudeState
          });
        }
      },
      
      /**
       * 分析姿态状态
       * @returns {Object} 姿态状态信息
       */
      analyzeAttitudeState: function() {
        var current = manager.latestAcceleration;
        
        // 计算总加速度大小
        var totalAcceleration = Math.sqrt(
          current.x * current.x + 
          current.y * current.y + 
          current.z * current.z
        );
        
        // 计算设备倾斜角度（相对于重力方向）
        var tiltAngle = Math.acos(Math.abs(current.z) / totalAcceleration) * 180 / Math.PI;
        
        // 检测横向加速度（转弯时的离心力）
        var lateralAcceleration = Math.abs(current.x);
        
        // 检测纵向加速度（爬升/下降或减速/加速）
        var longitudinalAcceleration = Math.abs(current.y);
        
        // 重力异常检测（判断是否在正常重力环境）
        var gravityDeviation = Math.abs(totalAcceleration - manager.gravityBaseline);
        
        // 姿态状态判断
        var state = 'LEVEL'; // 水平状态
        var isStable = true;
        
        if (gravityDeviation > 3) {
          state = 'MANEUVER'; // 机动状态（加速度、减速等）
          isStable = false;
        } else if (tiltAngle > 25) {
          state = 'STEEP_BANK'; // 大坡度倾斜
          isStable = false;
        } else if (tiltAngle > 10) {
          state = 'BANKED'; // 倾斜状态（转弯）
          isStable = false;
        } else if (lateralAcceleration > 2) {
          state = 'TURNING'; // 转弯状态
          isStable = false;
        }
        
        return {
          state: state,
          isStable: isStable,
          tiltAngle: tiltAngle,
          totalAcceleration: totalAcceleration,
          lateralAcceleration: lateralAcceleration,
          longitudinalAcceleration: longitudinalAcceleration,
          gravityDeviation: gravityDeviation,
          
          // 指南针可靠性评估
          compassReliability: manager.calculateCompassReliability(tiltAngle, gravityDeviation)
        };
      },
      
      /**
       * 计算指南针可靠性
       * @param {Number} tiltAngle 倾斜角度
       * @param {Number} gravityDeviation 重力偏差
       * @returns {Number} 可靠性系数 (0-1)
       */
      calculateCompassReliability: function(tiltAngle, gravityDeviation) {
        var reliability = 1.0;
        
        // 倾斜角度影响：倾斜越大，指南针越不可靠
        if (tiltAngle > 45) {
          reliability *= 0.3;
        } else if (tiltAngle > 25) {
          reliability *= 0.6;
        } else if (tiltAngle > 10) {
          reliability *= 0.8;
        }
        
        // 重力偏差影响：机动时指南针可能受干扰
        if (gravityDeviation > 5) {
          reliability *= 0.4;
        } else if (gravityDeviation > 3) {
          reliability *= 0.7;
        }
        
        return Math.max(0.1, reliability); // 最低保持10%的可靠性
      },
      
      /**
       * 获取平滑的姿态数据
       * @param {Number} timeWindow 时间窗口（毫秒）
       * @returns {Object} 平滑后的姿态数据
       */
      getSmoothedAttitude: function(timeWindow) {
        timeWindow = timeWindow || 2000; // 默认2秒
        var currentTime = Date.now();
        
        var validData = manager.accelerationHistory.filter(function(data) {
          return (currentTime - data.timestamp) <= timeWindow;
        });
        
        if (validData.length === 0) {
          return manager.analyzeAttitudeState();
        }
        
        // 计算平均值
        var sum = validData.reduce(function(acc, data) {
          return {
            x: acc.x + data.x,
            y: acc.y + data.y,
            z: acc.z + data.z
          };
        }, { x: 0, y: 0, z: 0 });
        
        var avg = {
          x: sum.x / validData.length,
          y: sum.y / validData.length,
          z: sum.z / validData.length
        };
        
        // 基于平均值分析姿态
        var totalAcceleration = Math.sqrt(avg.x * avg.x + avg.y * avg.y + avg.z * avg.z);
        var tiltAngle = Math.acos(Math.abs(avg.z) / totalAcceleration) * 180 / Math.PI;
        var gravityDeviation = Math.abs(totalAcceleration - manager.gravityBaseline);
        
        return {
          isStable: tiltAngle < 10 && gravityDeviation < 2,
          tiltAngle: tiltAngle,
          totalAcceleration: totalAcceleration,
          gravityDeviation: gravityDeviation,
          compassReliability: manager.calculateCompassReliability(tiltAngle, gravityDeviation)
        };
      },
      
      /**
       * 校准重力基准
       */
      calibrateGravity: function() {
        if (manager.accelerationHistory.length < 5) {
          console.warn('⚠️ 数据不足，无法校准重力基准');
          return;
        }
        
        // 使用最近的稳定数据计算重力基准
        var recentData = manager.accelerationHistory.slice(-10);
        var totalAccelerations = recentData.map(function(data) {
          return Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        });
        
        var avgGravity = totalAccelerations.reduce(function(sum, g) {
          return sum + g;
        }, 0) / totalAccelerations.length;
        
        manager.gravityBaseline = avgGravity;
        console.log('📐 重力基准校准完成:', avgGravity.toFixed(3));
      },
      
      /**
       * 停止加速度计
       */
      stop: function() {
        ConsoleHelper.compass('🛑 停止加速度计');
        
        // 标记为停止状态
        manager.isRunning = false;
        
        // 清理监听器
        if (manager.accelerometerChangeListener) {
          wx.offAccelerometerChange(manager.accelerometerChangeListener);
        }
        wx.offAccelerometerChange(); // 全局清理
        
        // 停止加速度计
        wx.stopAccelerometer({
          success: function() {
            ConsoleHelper.compass('✅ 加速度计停止成功');
          },
          fail: function(err) {
            ConsoleHelper.compass('⚠️ 加速度计停止失败: ' + (err.errMsg || ''));
          }
        });
        
        // 清除数据
        manager.latestAcceleration = { x: 0, y: 0, z: 0 };
        manager.accelerationHistory = [];
        manager.accelerometerSupported = null;
        
        if (manager.callbacks.onAccelerometerStop) {
          manager.callbacks.onAccelerometerStop();
        }
      },
      
      /**
       * 获取运行状态
       * @returns {Object} 状态信息
       */
      getStatus: function() {
        return {
          isRunning: manager.isRunning,
          accelerometerSupported: manager.accelerometerSupported,
          latestData: manager.latestAcceleration,
          gravityBaseline: manager.gravityBaseline
        };
      }
    };
    
    return manager;
  }
};

module.exports = AccelerometerManager;