/**
 * GPS欺骗检测模块
 *
 * 功能特性：
 * - 简化检测模式：连续30次接收到有效GPS高度信号触发欺骗警告
 * - 状态机管理：NORMAL -> SPOOFING -> COOLDOWN
 * - 语音警告控制：首次检测播放一次，10分钟冷却期
 * - 简单计数器：记录连续有效GPS高度数据次数
 * - 监控开关：可通过界面按钮开启/关闭监控
 */

var Logger = require('./logger.js');

module.exports = {
  /**
   * 创建GPS欺骗检测器实例
   * @param {Object} config 配置对象（来自config.js）
   * @returns {Object} 检测器实例
   */
  create: function(config) {
    var detector = {
      // 配置引用
      config: config.gps.spoofingDetection,

      // 状态机
      state: 'NORMAL', // NORMAL | DETECTING | SPOOFING | COOLDOWN

      // 连续有效GPS计数器（简化检测逻辑）
      consecutiveGPSCount: 0,

      // 检测阈值：连续30次有效GPS高度信号
      detectionThreshold: 30,

      // 检测开始时间
      detectionStartTime: null,

      // 首次欺骗检测时间
      firstSpoofingTime: null,

      // 最后正常时间
      lastNormalTime: null,

      // 🆕 最后接收到有效GPS信号的时间（用于1分钟容忍机制）
      lastValidGPSTime: null,

      // 🆕 连续GPS信号丢失次数（用于防止频繁进出信号丢失状态）
      consecutiveSignalLossCount: 0,

      // 🆕 最大允许信号丢失次数（超过此值则重置状态）
      maxSignalLossCount: 10,

      // 冷却期开始时间
      cooldownStartTime: null,

      // 语音播放计数
      voicePlayCount: 0,

      // 上次语音播放时间
      lastVoicePlayTime: 0,

      // 数据缓冲区（保留用于调试）
      dataBuffer: [],

      lastSample: null,

      // 回调函数
      callbacks: {},
      
      /**
       * 初始化检测器
       * @param {Object} callbacks 回调函数集合
       */
      init: function(callbacks) {
        detector.callbacks = callbacks || {};
        detector.loadConfiguration();
      },
      
      /**
       * 从本地存储加载用户配置
       */
      loadConfiguration: function() {
        try {
          var savedConfig = wx.getStorageSync('gps_spoofing_config');
          if (savedConfig) {
            Object.assign(detector.config, savedConfig);

            if (savedConfig.ground && typeof savedConfig.ground === 'object') {
              var mergedGround = Object.assign({}, detector.config.ground || {}, savedConfig.ground);
              detector.config.ground = mergedGround;
            } else if (!detector.config.ground) {
              detector.config.ground = { userElevation: 0 };
            }

            if (!detector.config.mode) {
              detector.config.mode = 'standard';
            }

            if (typeof detector.config.voiceAlertEnabled !== 'boolean') {
              detector.config.voiceAlertEnabled = true;
            }
          } else if (!detector.config.ground) {
            detector.config.ground = { userElevation: 0 };
          }
        } catch (e) {
          Logger.error('加载GPS欺骗配置失败:', e);
        }
      },
      
      /**
       * 保存用户配置到本地存储
       */
      saveConfiguration: function() {
        try {
          var groundConfig = detector.config.ground;
          if (!groundConfig || typeof groundConfig !== 'object' || typeof groundConfig.userElevation !== 'number') {
            groundConfig = { userElevation: 0 };
            detector.config.ground = groundConfig;
          }

          var hasVoiceAsset = !!(detector.config.voice && detector.config.voice.audioPath);
          var voiceEnabled = hasVoiceAsset ? !!detector.config.voiceAlertEnabled : false;
          var mode = detector.config.mode || 'standard';

          wx.setStorageSync('gps_spoofing_config', {
            enabled: !!detector.config.enabled,
            mode: mode,
            voiceAlertEnabled: voiceEnabled,
            ground: {
              userElevation: groundConfig.userElevation
            }
          });
        } catch (e) {
          Logger.error('保存GPS欺骗配置失败:', e);
        }
      },
      
      /**
       * 处理GPS数据更新
       * @param {Object} gpsData GPS数据对象
       * @returns {Object} 检测结果
       */
      processGPSData: function(gpsData) {
        // 未启用检测，直接返回
        if (!detector.config.enabled) {
          return {
            isSpoofing: false,
            state: 'DISABLED',
            message: null
          };
        }
        
        // 添加时间戳
        gpsData.timestamp = Date.now();
        
        // 更新数据缓冲区
        detector.updateDataBuffer(gpsData);
        
        // 执行统一检测逻辑
        var result = detector.detectUnifiedMode(gpsData);
        
        // 更新状态机
        detector.updateStateMachine(result.isSpoofing);
        
        // 处理语音警告
        if (result.isSpoofing && detector.state === 'SPOOFING') {
          detector.handleVoiceAlert();
        }
        
        return {
          isSpoofing: detector.state === 'SPOOFING' || detector.state === 'SPOOFING_SILENT',
          state: detector.state,
          firstSpoofingTime: detector.firstSpoofingTime,
          message: result.message,
          details: result.details
        };
      },
      
      /**
       * 简化检测模式：连续30次接收到有效GPS高度信号
       * 原理：使用简单计数器，每次收到有效GPS高度+1，无效则检查容忍时间
       * 🆕 增强：添加1分钟GPS信号丢失容忍机制
       * @param {Object} gpsData GPS数据
       * @returns {Object} 检测结果
       */
      detectUnifiedMode: function(gpsData) {
        var altitude = gpsData.altitude;
        // 🔧 关键修复：检查isGPSLocation标志，区分真实GPS vs 网络定位
        var isRealGPS = gpsData.isGPSLocation === true;
        // 🔧 修复：移除50米高度限制，只要有有效的GPS高度数据即可
        var hasValidAltitude = altitude !== null &&
                               altitude !== undefined &&
                               !isNaN(altitude);

        var now = Date.now();

        // 🔧 关键修复：只要是真实GPS且有有效高度即累计计数
        if (isRealGPS && hasValidAltitude) {
          detector.consecutiveGPSCount += 1;
          detector.lastValidGPSTime = now;  // 🆕 记录最后一次有效GPS信号时间
          detector.consecutiveSignalLossCount = 0;  // 🆕 重置信号丢失计数
          if (detector.consecutiveGPSCount === 1) {
            detector.detectionStartTime = now;
          }
        } else {
          // 🆕 GPS信号无效时，检查1分钟容忍机制
          if (detector.lastValidGPSTime !== null) {
            var timeSinceLastValid = now - detector.lastValidGPSTime;

            // 如果距离最后一次有效GPS信号不超过1分钟（60000ms），保持当前计数
            if (timeSinceLastValid <= 60000) {
              detector.consecutiveSignalLossCount += 1;  // 🆕 累计信号丢失次数

              // 🆕 如果信号频繁丢失（超过10次），重置状态
              if (detector.consecutiveSignalLossCount > detector.maxSignalLossCount) {
                Logger.warn('🛡️ GPS信号频繁丢失(' + detector.consecutiveSignalLossCount + '次)，重置欺骗检测状态');
                detector.consecutiveGPSCount = 0;
                detector.detectionStartTime = null;
                detector.lastValidGPSTime = null;
                detector.consecutiveSignalLossCount = 0;
              } else {
                Logger.debug('🛡️ GPS信号暂时丢失(' + detector.consecutiveSignalLossCount + '/' + detector.maxSignalLossCount + '次)，距离上次有效信号:', Math.round(timeSinceLastValid / 1000), '秒，保持欺骗状态');
              }
            } else {
              // 超过1分钟没有有效GPS信号，重置状态
              Logger.warn('🛡️ GPS信号丢失超过1分钟，重置欺骗检测状态');
              detector.consecutiveGPSCount = 0;
              detector.detectionStartTime = null;
              detector.lastValidGPSTime = null;
              detector.consecutiveSignalLossCount = 0;
            }
          } else {
            // 从未接收到有效GPS信号，重置
            detector.consecutiveGPSCount = 0;
            detector.detectionStartTime = null;
          }
        }

        var isSpoofing = detector.consecutiveGPSCount >= detector.detectionThreshold;

        return {
          isSpoofing: isSpoofing,
          message: isSpoofing
            ? 'GPS欺骗检测：连续' + detector.consecutiveGPSCount + '次接收到有效GPS高度信号'
            : null,
          details: {
            altitude: altitude,
            isGPSLocation: isRealGPS,  // 🔧 新增：记录GPS类型
            consecutiveCount: detector.consecutiveGPSCount,
            threshold: detector.detectionThreshold,
            lastValidGPSTime: detector.lastValidGPSTime,  // 🆕 记录最后有效GPS时间
            timeSinceLastValid: detector.lastValidGPSTime ? (now - detector.lastValidGPSTime) : null,
            signalLossCount: detector.consecutiveSignalLossCount,  // 🆕 记录信号丢失次数
            maxSignalLossCount: detector.maxSignalLossCount,  // 🆕 记录最大允许丢失次数
            reason: isSpoofing ? '连续接收有效GPS高度数据达到阈值' : null
          }
        };
      },

      /**
       * 更新数据缓冲区（优化版：使用双指针法避免频繁创建数组）
       * @param {Object} gpsData GPS数据
       */
      updateDataBuffer: function(gpsData) {
        var now = Date.now();
        var cutoffTime = now - 60000;

        // 🔧 关键修复：只有真实GPS数据才加入缓冲区，排除网络定位
        var isRealGPS = gpsData.isGPSLocation === true;

        if (!isRealGPS) {
          Logger.debug('🛡️ GPS欺骗检测：跳过网络定位数据，不加入缓冲区');
          // 仍然执行过期数据清理
          var writeIndex = 0;
          for (var readIndex = 0; readIndex < detector.dataBuffer.length; readIndex++) {
            if (detector.dataBuffer[readIndex].timestamp > cutoffTime) {
              if (writeIndex !== readIndex) {
                detector.dataBuffer[writeIndex] = detector.dataBuffer[readIndex];
              }
              writeIndex++;
            }
          }
          detector.dataBuffer.length = writeIndex;
          return; // 网络定位数据直接返回，不加入缓冲区
        }

        // 添加新数据（只有真实GPS数据会执行到这里）
        detector.dataBuffer.push({
          timestamp: now,
          altitude: gpsData.altitude,
          speed: gpsData.speed,
          latitude: gpsData.latitude,
          longitude: gpsData.longitude,
          isGPSLocation: true  // 标记为GPS数据
        });

        // 使用双指针法原地删除过期数据(避免filter创建新数组，减少GC压力)
        var writeIndex = 0;
        for (var readIndex = 0; readIndex < detector.dataBuffer.length; readIndex++) {
          if (detector.dataBuffer[readIndex].timestamp > cutoffTime) {
            if (writeIndex !== readIndex) {
              detector.dataBuffer[writeIndex] = detector.dataBuffer[readIndex];
            }
            writeIndex++;
          }
        }
        detector.dataBuffer.length = writeIndex; // 截断数组
      },
      
      /**
       * 检查数据一致性（每3秒窗口只要有一次符合条件即可）
       * @param {Function} condition 检测条件函数
       * @param {Number} duration 持续时间要求（毫秒，通常为30000ms = 30秒）
       * @returns {Boolean} 是否满足条件
       */
      checkConsistentData: function(condition, duration) {
        var now = Date.now();
        var cutoffTime = now - duration;

        // 过滤出时间窗口内的数据
        var relevantData = detector.dataBuffer.filter(function(data) {
          return data.timestamp > cutoffTime;
        });

        // 需要至少有一定量的数据点
        if (relevantData.length < 10) {
          return false;
        }

        // 每3秒窗口检测逻辑
        var windowSize = 3000; // 3秒窗口
        var windowCount = Math.floor(duration / windowSize); // 30000ms / 3000ms = 10个窗口
        var validWindowCount = 0;

        // 遍历每个3秒窗口
        for (var i = 0; i < windowCount; i++) {
          var windowStart = cutoffTime + (i * windowSize);
          var windowEnd = windowStart + windowSize;

          // 获取当前窗口内的数据
          var windowData = relevantData.filter(function(data) {
            return data.timestamp >= windowStart && data.timestamp < windowEnd;
          });

          // 检查窗口内是否有至少一个数据点满足条件
          var hasMatchInWindow = windowData.some(condition);

          if (hasMatchInWindow) {
            validWindowCount++;
          }
        }

        // 要求至少90%的窗口都有效（10个窗口中至少9个有效）
        var requiredValidWindows = Math.floor(windowCount * 0.9);
        var allMatch = validWindowCount >= requiredValidWindows;

        // 记录检测开始时间
        if (allMatch && !detector.detectionStartTime) {
          detector.detectionStartTime = relevantData[0].timestamp;
        } else if (!allMatch) {
          detector.detectionStartTime = null;
        }

        return allMatch;
      },
      
      /**
       * 更新状态机
       * @param {Boolean} isSpoofing 是否检测到欺骗
       */
      updateStateMachine: function(isSpoofing) {
        var now = Date.now();
        var previousState = detector.state;

        switch (detector.state) {
          case 'NORMAL':
            if (isSpoofing) {
              detector.state = 'SPOOFING';
              // 使用兼容的时间格式（避免微信小程序时区显示问题）
              var firstDetectionTime = new Date();
              var hours = String(firstDetectionTime.getHours()).padStart(2, '0');
              var minutes = String(firstDetectionTime.getMinutes()).padStart(2, '0');
              var seconds = String(firstDetectionTime.getSeconds()).padStart(2, '0');
              detector.firstSpoofingTime = hours + ':' + minutes + ':' + seconds;

              if (detector.config.debug && detector.config.debug.enableVerboseLogging) {
            Logger.warn('🚨 GPS欺骗检测：NORMAL -> SPOOFING（连续' + detector.consecutiveGPSCount + '次）首次检测时间：' + detector.firstSpoofingTime);
          }
            }
            break;

          case 'SPOOFING':
            if (!isSpoofing) {
              detector.state = 'COOLDOWN';
              detector.cooldownStartTime = now;
              detector.lastNormalTime = now;
              detector.consecutiveGPSCount = 0; // 重置计数器
              if (detector.config.debug && detector.config.debug.enableVerboseLogging) {
            Logger.debug('✅ GPS欺骗解除：SPOOFING -> COOLDOWN');
          }
            }
            break;

          case 'COOLDOWN':
            if (isSpoofing) {
              // 冷却期内再次检测到欺骗，静默处理，不触发警告
              detector.state = 'SPOOFING_SILENT';
              if (detector.config.debug && detector.config.debug.enableVerboseLogging) {
            Logger.warn('🔇 冷却期内检测到欺骗（静默）：COOLDOWN -> SPOOFING_SILENT');
          }
            } else if (now - detector.cooldownStartTime > detector.config.voice.cooldownPeriod) {
              // 冷却期结束，恢复正常
              detector.state = 'NORMAL';
              detector.firstSpoofingTime = null;
              detector.voicePlayCount = 0; // 重置语音播放计数
              detector.consecutiveGPSCount = 0; // 重置计数器
              if (detector.config.debug && detector.config.debug.enableVerboseLogging) {
            Logger.debug('✅ 冷却期结束：COOLDOWN -> NORMAL');
          }
            }
            break;

          case 'SPOOFING_SILENT':
            // 静默欺骗状态（冷却期内的欺骗）
            if (!isSpoofing) {
              // 欺骗消失，回到冷却期
              detector.state = 'COOLDOWN';
              detector.consecutiveGPSCount = 0; // 重置计数器
              if (detector.config.debug && detector.config.debug.enableVerboseLogging) {
            Logger.debug('🔇 静默欺骗解除：SPOOFING_SILENT -> COOLDOWN');
          }
            } else if (now - detector.cooldownStartTime > detector.config.voice.cooldownPeriod) {
              // 冷却期结束但仍在欺骗，切换到正常欺骗状态（会触发警告）
              detector.state = 'SPOOFING';
              detector.voicePlayCount = 0; // 重置计数器以允许播放
              if (detector.config.debug && detector.config.debug.enableVerboseLogging) {
            Logger.debug('⏰ 冷却期结束，恢复警告：SPOOFING_SILENT -> SPOOFING');
          }
            }
            break;
        }

        // 状态变化时触发回调
        if (previousState !== detector.state && detector.callbacks.onStateChange) {
          detector.callbacks.onStateChange(detector.state, previousState);
        }
      },
      
      /**
       * 处理语音警告
       */
      handleVoiceAlert: function() {
        // 检查是否启用语音警告
        if (!detector.config.voiceAlertEnabled) {
          return;
        }
        
        // 只在首次检测到欺骗时播放一次
        if (detector.voicePlayCount > 0) {
          return;
        }
        
        // 触发语音播放回调
        if (detector.callbacks.onPlayVoiceAlert) {
          detector.callbacks.onPlayVoiceAlert(function() {
            // 播放成功回调
            detector.voicePlayCount = 1;
            detector.lastVoicePlayTime = Date.now();
            if (detector.config.debug && detector.config.debug.enableVerboseLogging) {
            Logger.debug('🔊 GPS欺骗语音警告已播放（仅播放一次）');
          }
          });
        }
      },
      
      /**
       * 设置配置项
       * @param {String} key 配置键
       * @param {Any} value 配置值
       */
      setConfig: function(key, value) {
        var keys = key.split('.');
        var target = detector.config;
        
        for (var i = 0; i < keys.length - 1; i++) {
          if (!target[keys[i]]) {
            target[keys[i]] = {};
          }
          target = target[keys[i]];
        }
        
        target[keys[keys.length - 1]] = value;
        detector.saveConfiguration();
      },
      
      /**
       * 获取配置项
       * @param {String} key 配置键
       * @returns {Any} 配置值
       */
      getConfig: function(key) {
        var keys = key.split('.');
        var target = detector.config;
        
        for (var i = 0; i < keys.length; i++) {
          if (!target[keys[i]]) {
            return undefined;
          }
          target = target[keys[i]];
        }
        
        return target;
      },
      
      /**
       * 重置检测器状态
       */
      reset: function() {
        detector.state = 'NORMAL';
        detector.consecutiveGPSCount = 0;
        detector.detectionStartTime = null;
        detector.firstSpoofingTime = null;
        detector.lastNormalTime = null;
        detector.lastValidGPSTime = null;  // 重置GPS信号时间戳
        detector.consecutiveSignalLossCount = 0;  // 🆕 重置信号丢失计数
        detector.cooldownStartTime = null;
        detector.voicePlayCount = 0;
        detector.lastVoicePlayTime = 0;
        detector.dataBuffer = [];
        if (detector.config.debug && detector.config.debug.enableVerboseLogging) {
          Logger.debug('🔄 GPS欺骗检测器已重置');
        }
      },
      
      /**
       * 获取检测器状态摘要
       * @returns {Object} 状态摘要
       */
      getStatus: function() {
        return {
          enabled: detector.config.enabled,
          state: detector.state,
          consecutiveCount: detector.consecutiveGPSCount,
          threshold: detector.detectionThreshold,
          firstSpoofingTime: detector.firstSpoofingTime,
          voiceEnabled: detector.config.voiceAlertEnabled,
          voicePlayCount: detector.voicePlayCount,
          detectionThreshold: '连续' + detector.detectionThreshold + '次有效GPS高度信号',
          // 🔧 修复：添加缓冲区状态字段供UI显示
          bufferSize: detector.dataBuffer ? detector.dataBuffer.length : 0,  // 缓冲区当前大小
          bufferTotalSize: detector.dataBuffer ? detector.dataBuffer.length : 0  // 缓冲区总大小
        };
      }
    };
    
    if (!detector.config) {
      detector.config = {};
    }

    if (!detector.config.ground || typeof detector.config.ground !== 'object' || typeof detector.config.ground.userElevation !== 'number') {
      detector.config.ground = { userElevation: 0 };
    }

    if (!detector.config.mode) {
      detector.config.mode = 'standard';
    }

    if (typeof detector.config.voiceAlertEnabled !== 'boolean') {
      detector.config.voiceAlertEnabled = true;
    }

    return detector;
  }
};