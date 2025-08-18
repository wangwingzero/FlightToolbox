/**
 * 智能航向管理器模块 - 三传感器融合版
 * 
 * 设计原则：
 * - 多传感器数据融合（指南针+陀螺仪+加速度计）
 * - 飞行状态自适应过滤
 * - 智能异常检测和处理
 * - 保持原有接口兼容性
 */

var Logger = require('./logger.js');
var ConsoleHelper = require('../../../utils/console-helper.js');
var GyroscopeManager = require('./gyroscope-manager.js');
var AccelerometerManager = require('./accelerometer-manager.js');
var SensorFusionCore = require('./sensor-fusion-core.js');

var CompassManager = {
  /**
   * 创建智能航向管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 🔧 配置和基础状态
      config: config,
      callbacks: null,
      pageRef: null,
      isRunning: false,
      
      // 🧠 三传感器管理器实例
      compassSensor: null,
      gyroscopeManager: null,
      accelerometerManager: null,
      fusionCore: null,
      
      // 📊 传感器状态跟踪
      sensorStates: {
        compass: { supported: null, running: false, data: null },
        gyroscope: { supported: null, running: false, data: null },
        accelerometer: { supported: null, running: false, data: null }
      },
      
      // 🎯 融合结果和显示状态
      currentHeading: 0,
      headingConfidence: 0,
      headingStability: 0,
      flightState: null,
      lastUpdateTime: 0,
      
      // 🚀 兜底刷新控制（主要靠实时事件驱动）
      lastDisplayUpdate: 0,
      updateInterval: 400, // 400ms兜底刷新间隔，降低CPU占用
      updateTimer: null,
      lastDisplayHeading: null,
      
      // 🔧 智能更新阈值参数
      significantChangeThreshold: (config && config.significantChangeThreshold) || 2.0, // °
      minUpdateInterval: (config && config.minUpdateInterval) || 120, // ms
      headingOffset: (config && config.headingOffset) || 0, // °
      declination: (config && config.declination) || 0, // °
      useTrueNorth: (config && config.useTrueNorth) || false,
      
      // 🔧 监听函数引用管理
      compassChangeListener: null,
      
      /**
       * 初始化智能航向管理器
       * @param {Object} page 页面实例
       * @param {Object} callbacks 回调函数集合
       */
      init: function(page, callbacks) {
        manager.pageRef = page;
        manager.callbacks = callbacks || {};
        
        // 🧠 初始化传感器管理器
        manager.initSensorManagers();
        
        // 🔧 从本地存储恢复偏置
        try { 
          var off = wx.getStorageSync('headingOffset'); 
          if (typeof off === 'number') manager.headingOffset = off; 
        } catch(e) {}
        
        // 🔧 创建指南针监听函数引用（兼容原有模式） - 增强页面状态保护
        manager.compassChangeListener = function(res) {
          // 🔒 第一时间检查页面状态，防止DOM更新错误
          if (!manager.pageRef || manager.pageRef._isDestroying || manager.pageRef.isDestroyed) {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.warn('⚠️ 指南针回调被拒绝: 页面已销毁或正在销毁');
            }
            return;
          }

          // 🔒 使用BasePage的严格状态检查（如果可用）
          if (manager.pageRef._isPageDestroyed && manager.pageRef._isPageDestroyed()) {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.warn('⚠️ 指南针回调被拒绝: BasePage状态检查失败');
            }
            return;
          }

          manager.handleCompassChange(res);
        };
        
        if (config && config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🧭 智能航向管理器初始化完成（三传感器融合版）');
        }
      },
      
      /**
       * 🧠 初始化传感器管理器
       */
      initSensorManagers: function() {
        // 创建陀螺仪管理器
        manager.gyroscopeManager = GyroscopeManager.create(manager.config);
        manager.gyroscopeManager.init(manager.pageRef, {
          onGyroscopeStart: function() {
            manager.sensorStates.gyroscope.running = true;
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.debug('🌀 陀螺仪已启动');
            }
          },
          onGyroscopeUpdate: function(data) {
            manager.sensorStates.gyroscope.data = data;
            manager.onSensorDataUpdate();
          },
          onGyroscopeStop: function() {
            manager.sensorStates.gyroscope.running = false;
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.debug('🌀 陀螺仪已停止');
            }
          },
          onGyroscopeError: function(err) {
            manager.sensorStates.gyroscope.supported = false;
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.warn('⚠️ 陀螺仪不可用:', err.errMsg);
            }
          }
        });
        
        // 创建加速度计管理器
        manager.accelerometerManager = AccelerometerManager.create(manager.config);
        manager.accelerometerManager.init(manager.pageRef, {
          onAccelerometerStart: function() {
            manager.sensorStates.accelerometer.running = true;
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.debug('📐 加速度计已启动');
            }
          },
          onAccelerometerUpdate: function(data) {
            manager.sensorStates.accelerometer.data = data;
            manager.onSensorDataUpdate();
          },
          onAccelerometerStop: function() {
            manager.sensorStates.accelerometer.running = false;
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.debug('📐 加速度计已停止');
            }
          },
          onAccelerometerError: function(err) {
            manager.sensorStates.accelerometer.supported = false;
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.warn('⚠️ 加速度计不可用:', err.errMsg);
            }
          }
        });
        
        // 创建传感器融合核心
        manager.fusionCore = SensorFusionCore.create(manager.config);
        
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          Logger.debug('🧠 传感器管理器初始化完成');
        }
      },
      
      /**
       * 启动智能航向系统
       * @param {Object} context 当前上下文
       */
      start: function(context) {
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          ConsoleHelper.compass('🧭 启动智能航向系统（三传感器融合）');
        }
        
        // 防止重复启动
        if (manager.isRunning) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            ConsoleHelper.compass('🧭 智能航向系统已运行，跳过启动');
          }
          return;
        }
        
        // 启动所有传感器
        manager.startAllSensors();
      },
      
      /**
       * 🚀 启动所有传感器
       */
      startAllSensors: function() {
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          ConsoleHelper.compass('🚀 启动所有传感器...');
        }
        
        var sensorsToStart = [];
        var startedSensors = 0;
        var totalSensors = 3;
        
        // 启动完成检查函数
        var checkStartComplete = function() {
          startedSensors++;
          if (startedSensors >= totalSensors) {
            manager.onAllSensorsStarted();
          }
        };
        
        // 1. 启动指南针（基础传感器）
        manager.startCompassSensor(checkStartComplete);
        
        // 2. 启动陀螺仪
        manager.gyroscopeManager.start();
        setTimeout(checkStartComplete, 100); // 给陀螺仪一点启动时间
        
        // 3. 启动加速度计
        manager.accelerometerManager.start();
        setTimeout(checkStartComplete, 100); // 给加速度计一点启动时间
      },
      
      /**
       * 🧭 启动指南针传感器
       * @param {Function} callback 启动完成回调
       */
      startCompassSensor: function(callback) {
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          ConsoleHelper.compass('🔧 准备启动指南针传感器...');
        }
        
        // 🔧 强制停止再启动策略：先停止所有可能运行的实例
        manager.forceStopCompassBeforeStart(function() {
          // 等待100ms确保完全停止
          setTimeout(function() {
            manager.doStartCompassSensor(callback);
          }, 100);
        });
      },
      
      /**
       * 🛑 强制停止指南针（启动前预处理）
       * @param {Function} callback 停止完成回调
       */
      forceStopCompassBeforeStart: function(callback) {
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          ConsoleHelper.compass('🛑 强制停止指南针传感器（如果在运行）');
        }
        
        // 清理所有监听器
        if (manager.compassChangeListener) {
          wx.offCompassChange(manager.compassChangeListener);
        }
        wx.offCompassChange(); // 全局清理
        
        // 强制停止指南针（即使可能没有运行）
        wx.stopCompass({
          success: function() {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              ConsoleHelper.compass('✅ 指南针强制停止成功');
            }
            manager.sensorStates.compass.running = false;
            callback();
          },
          fail: function(err) {
            // 停止失败通常表示没有在运行，这是正常的
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              ConsoleHelper.compass('ℹ️ 指南针停止: ' + (err.errMsg || '可能未运行'));
            }
            manager.sensorStates.compass.running = false;
            callback();
          }
        });
      },
      
      /**
       * 🚀 实际启动指南针传感器
       * @param {Function} callback 启动完成回调
       */
      doStartCompassSensor: function(callback) {
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          ConsoleHelper.compass('🚀 开始启动指南针传感器实例');
        }
        
        wx.startCompass({
          success: function() {
            ConsoleHelper.success('✅ 指南针启动成功');
            manager.sensorStates.compass.running = true;
            manager.sensorStates.compass.supported = true;
            
            // 注册监听器
            wx.onCompassChange(manager.compassChangeListener);
            
            callback();
          },
          fail: function(err) {
            var errorMsg = err.errMsg || '未知错误';
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              ConsoleHelper.error('❌ 指南针启动失败: ' + errorMsg);
            }
            
            // 🔄 如果仍然是"has enable"错误，尝试重试一次
            if (errorMsg.indexOf('has enable') !== -1) {
              if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
                ConsoleHelper.compass('🔄 检测到启动冲突，尝试重启...');
              }
              setTimeout(function() {
                manager.retryStartCompass(callback, 1);
              }, 200);
            } else {
              manager.sensorStates.compass.supported = false;
              callback();
            }
          }
        });
      },
      
      /**
       * 🔄 重试启动指南针
       * @param {Function} callback 启动完成回调
       * @param {Number} retryCount 重试次数
       */
      retryStartCompass: function(callback, retryCount) {
        if (retryCount > 2) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            ConsoleHelper.error('❌ 指南针重试失败，放弃启动');
          }
          manager.sensorStates.compass.supported = false;
          callback();
          return;
        }
        
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          ConsoleHelper.compass('🔄 指南针重试第' + retryCount + '次');
        }
        
        // 再次强制停止
        wx.stopCompass();
        wx.offCompassChange();
        
        setTimeout(function() {
          wx.startCompass({
            success: function() {
              if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
                ConsoleHelper.success('✅ 指南针重试启动成功');
              }
              manager.sensorStates.compass.running = true;
              manager.sensorStates.compass.supported = true;
              wx.onCompassChange(manager.compassChangeListener);
              callback();
            },
            fail: function(err) {
              if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
                ConsoleHelper.error('❌ 指南针重试第' + retryCount + '次失败: ' + (err.errMsg || ''));
              }
              manager.retryStartCompass(callback, retryCount + 1);
            }
          });
        }, 300 * retryCount); // 递增延迟时间
      },
      
      /**
       * 🎯 所有传感器启动完成处理
       */
      onAllSensorsStarted: function() {
        manager.isRunning = true;
        
        // 检查可用传感器数量
        var availableSensors = [];
        if (manager.sensorStates.compass.supported) availableSensors.push('指南针');
        if (manager.sensorStates.gyroscope.supported !== false) availableSensors.push('陀螺仪');
        if (manager.sensorStates.accelerometer.supported !== false) availableSensors.push('加速度计');
        
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          Logger.debug('🎯 传感器启动完成，可用传感器:', availableSensors.join('、'));
        }
        
        // 🚀 启动兜底定时器（主要靠实时事件驱动）
        manager.startFixedIntervalUpdate();
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          Logger.debug('⏰ 启用400ms兜底刷新模式（主要靠事件驱动）');
        }
        
        // 通知启动成功
        if (manager.callbacks.onCompassStart) {
          manager.callbacks.onCompassStart();
        }
      },
      
      /**
       * 🕐 启动固定间隔更新
       */
      startFixedIntervalUpdate: function() {
        // 清除旧定时器
        if (manager.updateTimer) {
          clearInterval(manager.updateTimer);
        }
        
        // 启动1秒间隔定时器
        manager.updateTimer = setInterval(function() {
          if (manager.isRunning) {
            manager.performFixedIntervalUpdate();
          }
        }, manager.updateInterval);
      },
      
      /**
       * 📊 固定间隔更新处理
       */
      performFixedIntervalUpdate: function() {
        if (!manager.isRunning) {
          return;
        }
        
        // 收集传感器数据
        var sensorData = manager.collectSensorData();
        var result = null;
        
        // 1) 优先使用融合数据
        if (sensorData.gyroscope || sensorData.accelerometer) {
          result = manager.fusionCore.fuseHeadingData(sensorData);
        }
        
        // 2) 没有融合数据就回退到指南针
        if (!result && sensorData.compass) {
          var conf = manager.mapCompassAccuracy(sensorData.compass.accuracy);
          result = {
            heading: sensorData.compass.heading,
            confidence: conf,
            stability: 1.0,
            flightState: { motion: 'STABLE' },
            sensorWeights: { compass: 1.0, gyroscope: 0.0, prediction: 0.0 }
          };
        }
        
        if (!result) return;
        
        // 3) 统一施加磁差/零位修正 + 角度归一化
        result.heading = manager.applyDeclinationAndOffset(result.heading);
        
        // 4) 更新状态 + 显示
        manager.currentHeading = result.heading;
        manager.headingConfidence = result.confidence;
        manager.lastUpdateTime = Date.now();
        manager.lastDisplayUpdate = Date.now();
        manager.updateHeadingDisplay(result);
        
        // 调试信息
        if (manager.config.debug && manager.config.debug.enableVerboseLogging) {
          Logger.debug('⏰ 固定间隔更新:', result.heading.toFixed(1) + '°');
        }
      },
      
      /**
       * 🧭 处理指南针数据变化 - 实时触发融合
       * @param {Object} res 指南针数据
       */
      handleCompassChange: function(res) {
        // 🔒 第一优先级：检查页面状态，防止DOM更新错误
        if (!manager.pageRef || manager.pageRef._isDestroying || manager.pageRef.isDestroyed) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.warn('⚠️ 指南针数据处理被拒绝: 页面已销毁或正在销毁');
          }
          return;
        }

        // 🔒 使用BasePage的严格状态检查（如果可用）
        if (manager.pageRef._isPageDestroyed && manager.pageRef._isPageDestroyed()) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.warn('⚠️ 指南针数据处理被拒绝: BasePage状态检查失败');
          }
          return;
        }

        if (!manager.isRunning) {
          return;
        }
        
        if (!res || res.direction === undefined) {
          return;
        }
        
        // 存储指南针数据
        manager.sensorStates.compass.data = {
          heading: res.direction,
          accuracy: res.accuracy,
          timestamp: Date.now()
        };
        
        // 触发实时融合更新
        manager.onSensorDataUpdate();
      },
      
      /**
       * 📊 传感器数据更新处理 - 实时事件驱动融合
       */
      onSensorDataUpdate: function() {
        if (!manager.isRunning) return;
        manager.performRealtimeFusion();
      },
      
      /**
       * 🚀 执行实时融合更新 - 智能响应控制
       */
      performRealtimeFusion: function() {
        if (!manager.isRunning) {
          return;
        }
        
        var currentTime = Date.now();
        
        // 收集传感器数据
        var sensorData = manager.collectSensorData();
        
        // 如果没有任何可用数据，跳过此次更新
        if (!sensorData.compass && !sensorData.gyroscope && !sensorData.accelerometer) {
          return;
        }
        
        // 执行智能融合
        var fusionResult = manager.fusionCore.fuseHeadingData(sensorData);
        fusionResult.heading = manager.applyDeclinationAndOffset(fusionResult.heading);
        
        // 🧠 智能更新判断逻辑
        var decision = manager.shouldUpdateDisplay(fusionResult, currentTime);
        
        if (decision && decision.shouldUpdate) {
          // 更新当前状态
          manager.currentHeading = fusionResult.heading;
          manager.headingConfidence = fusionResult.confidence;
          manager.headingStability = fusionResult.stability;
          manager.flightState = fusionResult.flightState;
          manager.lastUpdateTime = currentTime;
          manager.lastDisplayUpdate = currentTime;
          manager.lastDisplayHeading = fusionResult.heading;
          
          // 更新页面显示
          manager.updateHeadingDisplay(fusionResult);
          
          // 调试信息
          if (manager.config?.debug?.enableVerboseLogging) {
            Logger.debug('⚡ 实时融合更新:', {
              heading: fusionResult.heading.toFixed(1) + '°',
              confidence: (fusionResult.confidence * 100).toFixed(0) + '%',
              state: fusionResult.flightState.motion,
              reason: decision.reason
            });
          }
        }
      },
      
      /**
       * 🧠 智能更新判断 - 决定是否需要更新显示
       * @param {Object} fusionResult 融合结果
       * @param {Number} currentTime 当前时间
       * @returns {Object|Boolean} 更新决策
       */
      shouldUpdateDisplay: function(fusionResult, currentTime) {
        // 首次更新必须执行
        if (manager.lastDisplayHeading === null) {
          return { shouldUpdate: true, reason: '首次更新' };
        }
        
        // 计算航向变化量（处理角度跨越）
        var headingChange = Math.abs(fusionResult.heading - manager.lastDisplayHeading);
        if (headingChange > 180) {
          headingChange = 360 - headingChange; // 处理0°/360°跨越
        }
        
        // 🚀 立即更新条件
        if (headingChange >= manager.significantChangeThreshold) {
          return { shouldUpdate: true, reason: '显著变化(' + headingChange.toFixed(1) + '°)' };
        }
        
        // 🌀 转弯状态更新策略
        if (fusionResult.flightState && fusionResult.flightState.motion !== 'STABLE') {
          // 转弯时：降低更新阈值，提高响应性
          if (headingChange >= 1.5) {
            return { shouldUpdate: true, reason: '转弯状态微调' };
          }
        }
        
        // ⏰ 时间间隔控制
        var timeSinceLastUpdate = currentTime - manager.lastDisplayUpdate;
        if (timeSinceLastUpdate < manager.minUpdateInterval) {
          return { shouldUpdate: false, reason: '更新过于频繁' };
        }
        
        // 📊 置信度变化检查
        var confidenceChange = Math.abs(fusionResult.confidence - manager.headingConfidence);
        if (confidenceChange > 0.2 && headingChange >= 1.0) {
          return { shouldUpdate: true, reason: '置信度显著变化' };
        }
        
        // 🔄 定期更新（防止长时间无更新）
        if (timeSinceLastUpdate > 2000) { // 2秒强制更新一次
          return { shouldUpdate: true, reason: '定期刷新' };
        }
        
        // 默认不更新
        return { shouldUpdate: false, reason: '变化不显著' };
      },
      
      /**
       * 🔧 工具函数：角度归一化
       * @param {Number} d 角度值
       * @returns {Number} 归一化后的角度 (0-360°)
       */
      normalizeDeg: function(d) { 
        d = (d % 360 + 360) % 360; 
        return d; 
      },

      /**
       * 🔧 工具函数：映射指南针精度到置信度
       * @param {Number|String} acc 精度值
       * @returns {Number} 置信度 (0-1)
       */
      mapCompassAccuracy: function(acc) {
        // 兼容数值或字符串
        if (typeof acc === 'number' && isFinite(acc)) {
          // 假设 acc≈方位误差(°)，0 最好，≥45°很差
          return 1 - Math.min(Math.max(acc, 0), 45) / 45;
        }
        if (typeof acc === 'string') {
          var m = { high: 0.9, medium: 0.6, low: 0.3, unknown: 0.5 };
          return m[acc] || 0.5;
        }
        return 0.5;
      },

      /**
       * 🔧 工具函数：应用磁差和零位修正
       * @param {Number} heading 原始航向
       * @returns {Number} 修正后的航向
       */
      applyDeclinationAndOffset: function(heading) {
        var h = heading;
        if (manager.useTrueNorth) {
          // 指南针一般是磁北，勾选真北则加上磁差
          h = h + manager.declination;
        }
        h = h + manager.headingOffset;
        return manager.normalizeDeg(h);
      },

      /**
       * 📊 收集传感器数据
       * @returns {Object} 传感器数据包
       */
      collectSensorData: function() {
        var data = {};
        
        // 收集指南针数据
        if (manager.sensorStates.compass.data) {
          data.compass = manager.sensorStates.compass.data;
        }
        
        // 收集陀螺仪数据
        if (manager.sensorStates.gyroscope.data) {
          data.gyroscope = manager.sensorStates.gyroscope.data;
        }
        
        // 收集加速度计数据
        if (manager.sensorStates.accelerometer.data) {
          data.accelerometer = manager.sensorStates.accelerometer.data;
        }
        
        return data;
      },
      
      /**
       * 📱 更新航向显示
       * @param {Object} fusionResult 融合结果
       */
      updateHeadingDisplay: function(fusionResult) {
        var displayHeading = manager.normalizeDeg(Math.round(fusionResult.heading));
        
        // 更新页面数据
        if (manager.pageRef && manager.pageRef.safeSetData) {
          manager.pageRef.safeSetData({
            heading: displayHeading
          });
        }
        
        // 回调航向更新（保持原有接口）
        if (manager.callbacks.onHeadingUpdate) {
          manager.callbacks.onHeadingUpdate({
            heading: displayHeading,
            lastStableHeading: displayHeading,
            accuracy: Math.round((1 - fusionResult.confidence) * 100), // 仍表示"误差百分比"
            smoothedValue: fusionResult.heading,
            headingStability: fusionResult.stability,
            
            // 🆕 新增的智能融合信息
            flightState: fusionResult.flightState,
            sensorWeights: fusionResult.sensorWeights,
            confidence: fusionResult.confidence
          });
        }
      },
      
      /**
       * 🛑 停止智能航向系统
       */
      stop: function() {
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          ConsoleHelper.compass('🛑 停止智能航向系统');
        }
        
        // 标记为停止状态
        manager.isRunning = false;
        
        // 🚀 清除固定间隔定时器
        if (manager.updateTimer) {
          clearInterval(manager.updateTimer);
          manager.updateTimer = null;
        }
        
        // 停止所有传感器
        manager.stopAllSensors();
        
        // 清除状态
        manager.currentHeading = 0;
        manager.headingConfidence = 0;
        manager.headingStability = 0;
        manager.flightState = null;
        manager.lastDisplayUpdate = 0;
        manager.lastDisplayHeading = null;
        
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          ConsoleHelper.compass('🔧 智能航向系统完全停止');
        }
        
        if (manager.callbacks.onCompassStop) {
          manager.callbacks.onCompassStop();
        }
      },
      
      /**
       * 🛑 停止所有传感器
       */
      stopAllSensors: function() {
        // 停止指南针
        if (manager.compassChangeListener) {
          wx.offCompassChange(manager.compassChangeListener);
        }
        wx.offCompassChange();
        wx.stopCompass();
        manager.sensorStates.compass.running = false;
        
        // 停止陀螺仪
        if (manager.gyroscopeManager) {
          manager.gyroscopeManager.stop();
        }
        
        // 停止加速度计
        if (manager.accelerometerManager) {
          manager.accelerometerManager.stop();
        }
        
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          Logger.debug('🛑 所有传感器已停止');
        }
      },
      
      /**
       * 🔄 切换航向/航迹模式（保持原有接口）
       * @param {String} currentMode 当前模式
       */
      toggleHeadingMode: function(currentMode) {
        var newMode = currentMode === 'heading' ? 'track' : 'heading';
        
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🧭 切换航向模式:', currentMode, '->', newMode);
        }
        
        // 更新页面数据
        if (manager.pageRef && manager.pageRef.safeSetData) {
          manager.pageRef.safeSetData({
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
       * 🔧 零位校准接口
       * @param {Number} referenceHeadingMag 参考磁航向(HDG)
       */
      calibrateZero: function(referenceHeadingMag) {
        // 用机载航向指标的"磁航向"(HDG) 作为参考
        var raw = manager.currentHeading ||
                  (manager.sensorStates.compass.data && manager.sensorStates.compass.data.heading) || 0;
        manager.headingOffset = manager.normalizeDeg(referenceHeadingMag - raw);
        try { wx.setStorageSync('headingOffset', manager.headingOffset); } catch (e) {}
        if (manager.callbacks.onCalibrated) manager.callbacks.onCalibrated(manager.headingOffset);
      },

      /**
       * 🔧 设置磁差接口
       * @param {Number} deg 磁差角度（东偏为正，西偏为负）
       */
      setDeclination: function(deg) {
        // 东偏为正，西偏为负；若需要显示真航向则启用 useTrueNorth
        manager.declination = deg || 0;
      },

      /**
       * 📊 获取运行状态
       * @returns {Object} 状态信息
       */
      getStatus: function() {
        return {
          isRunning: manager.isRunning,
          compassSupported: manager.sensorStates.compass.supported,
          
          // 🆕 新增的智能状态信息
          sensorStates: manager.sensorStates,
          currentHeading: manager.currentHeading,
          headingConfidence: manager.headingConfidence,
          headingStability: manager.headingStability,
          flightState: manager.flightState,
          lastUpdateTime: manager.lastUpdateTime,
          
          // 传感器可用性统计
          availableSensors: {
            compass: manager.sensorStates.compass.supported === true,
            gyroscope: manager.sensorStates.gyroscope.supported !== false,
            accelerometer: manager.sensorStates.accelerometer.supported !== false
          }
        };
      }
    };
    
    return manager;
  }
};

module.exports = CompassManager;