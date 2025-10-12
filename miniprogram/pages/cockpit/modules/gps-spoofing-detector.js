/**
 * GPS欺骗检测模块
 * 
 * 功能特性：
 * - 统一检测模式：地速在50-100kt范围内持续60秒触发
 * - 状态机管理：NORMAL -> SPOOFING -> COOLDOWN
 * - 语音警告控制：最多播放3次，10分钟冷却期
 * - 数据缓冲：维护60秒滑动窗口
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
      
      // 检测开始时间
      detectionStartTime: null,
      
      // 首次欺骗检测时间
      firstSpoofingTime: null,
      
      // 最后正常时间
      lastNormalTime: null,
      
      // 冷却期开始时间
      cooldownStartTime: null,
      
      // 语音播放计数
      voicePlayCount: 0,
      
      // 上次语音播放时间
      lastVoicePlayTime: 0,
      
      // 数据缓冲区（30秒窗口）
      dataBuffer: [],
      
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
          wx.setStorageSync('gps_spoofing_config', {
            enabled: detector.config.enabled,
            mode: detector.config.mode,
            voiceAlertEnabled: detector.config.voice.audioPath ? detector.config.voiceAlertEnabled : false,
            ground: {
              userElevation: detector.config.ground.userElevation
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
       * 统一检测模式
       * @param {Object} gpsData GPS数据
       * @returns {Object} 检测结果
       */
      detectUnifiedMode: function(gpsData) {
        var speed = gpsData.speed || 0;
        
        // 检查60秒窗口内的数据
        var consistentData = detector.checkConsistentData(function(data) {
          var s = data.speed || 0;
          // 地速在50-100节之间
          return s >= 50 && s <= 100;
        }, 60000); // 60秒
        
        return {
          isSpoofing: consistentData,
          message: consistentData 
            ? 'GPS欺骗检测：地速' + Math.round(speed) + 'kt持续在50-100节范围内'
            : null,
          details: {
            speed: speed,
            minSpeed: 50,
            maxSpeed: 100,
            duration: 60
          }
        };
      },
      
      /**
       * 更新数据缓冲区
       * @param {Object} gpsData GPS数据
       */
      updateDataBuffer: function(gpsData) {
        var now = Date.now();
        
        // 添加新数据
        detector.dataBuffer.push({
          timestamp: now,
          altitude: gpsData.altitude,
          speed: gpsData.speed,
          latitude: gpsData.latitude,
          longitude: gpsData.longitude
        });
        
        // 清理超过60秒的旧数据
        var cutoffTime = now - 60000;
        detector.dataBuffer = detector.dataBuffer.filter(function(data) {
          return data.timestamp > cutoffTime;
        });
      },
      
      /**
       * 检查数据一致性（优化：每3秒窗口只要有一次符合条件即可）
       * @param {Function} condition 检测条件函数
       * @param {Number} duration 持续时间要求（毫秒）
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

        // 🆕 每3秒窗口检测逻辑
        var windowSize = 3000; // 3秒窗口
        var windowCount = Math.floor(duration / windowSize); // 60000ms / 3000ms = 20个窗口
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

        // 要求至少90%的窗口都有效（20个窗口中至少18个有效）
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
              detector.firstSpoofingTime = new Date().toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
              });
              if (detector.config.debug && detector.config.debug.enableVerboseLogging) {
            Logger.warn('🚨 GPS欺骗检测：NORMAL -> SPOOFING');
          }
            }
            break;
            
          case 'SPOOFING':
            if (!isSpoofing) {
              detector.state = 'COOLDOWN';
              detector.cooldownStartTime = now;
              detector.lastNormalTime = now;
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
        detector.detectionStartTime = null;
        detector.firstSpoofingTime = null;
        detector.lastNormalTime = null;
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
          firstSpoofingTime: detector.firstSpoofingTime,
          voiceEnabled: detector.config.voiceAlertEnabled,
          voicePlayCount: detector.voicePlayCount,
          bufferSize: detector.dataBuffer.length,
          detectionThreshold: '50-100节持续60秒'
        };
      }
    };
    
    return detector;
  }
};