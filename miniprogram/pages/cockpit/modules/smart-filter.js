/**
 * 智能GPS滤波器 - 重构版
 * 
 * 设计原则：
 * 1. 防止数据过于敏感，避免频繁变化让人头晕
 * 2. 基于航空常识过滤极端异常数据
 * 
 * 核心功能：
 * - 基于物理限制的异常检测
 * - 针对不同数据类型的适度平滑
 * - 简单可靠的实现
 */

var SmartFilter = {
  /**
   * 创建智能滤波器实例
   * @param {Object} config 配置参数
   * @returns {Object} 滤波器实例
   */
  create: function(config) {
    var filter = {
      // 保存配置引用
      config: config,
      // 基于航空常识的物理限制
      limits: {
        maxAltitudeChangePerSecond: 150,    // 最大高度变化 150ft/s (约9000ft/min) - 🔧 放宽一些
        maxSpeedChangePerSecond: 30,        // 最大速度变化 30kt/s - 🔧 稍微放宽
        maxReasonableSpeed: 500,            // 最大合理速度 500kt
        maxPositionJumpPerSecond: 300       // 最大位置变化 300m/s - 🔧 稍微放宽
      },
      
      // 平滑系数 - 越小越平滑
      smoothing: {
        position: 0.6,    // 位置：轻微平滑，保持精度
        altitude: 0.4,    // 高度：中等平滑，避免小波动
        speed: 0.3,       // 速度：较强平滑，避免跳变
        track: 0.2        // 航迹：强平滑，避免频繁变化（参考航向逻辑）
      },
      
      // 状态数据
      isInitialized: false,
      lastValidData: null,
      consecutiveAnomalies: 0,
      maxConsecutiveAnomalies: 3,
      lastAnomalyLogTime: 0,  // 🔧 添加异常日志时间记录
      
      // 🆕 新GPS干扰检测状态
      speedHistory: [],                  // 地速历史记录（用于检测固定不变）
      speedCheckTimeWindow: 30000,       // 地速检测时间窗口：30秒（毫秒）
      altitudeJumpThreshold: 1000,       // 高度跳变阈值：1000英尺
      speedToleranceThreshold: 0.1,      // 地速变化容忍度（节）
      lastSpeedCheckLogTime: 0,          // 上次地速检测日志时间
      
      // 🆕 TRK稳定化状态
      consecutiveSmallChanges: 0,        // 连续小变化计数
      lastTrackUpdateTime: 0,            // 上次TRK更新时间
      trackStabilityThreshold: 12,       // TRK变化阈值（度）
      
      /**
       * 初始化滤波器
       * @param {Object} initialData 初始GPS数据
       */
      init: function(initialData) {
        console.log('🛡️ 初始化智能GPS滤波器');
        
        filter.lastValidData = {
          latitude: initialData.latitude || 0,
          longitude: initialData.longitude || 0,
          altitude: initialData.altitude || 0,
          speed: initialData.speed || 0,
          track: initialData.track || 0,
          timestamp: Date.now()
        };
        
        filter.isInitialized = true;
        filter.consecutiveAnomalies = 0;
        
        console.log('✅ 智能GPS滤波器初始化完成');
      },
      
      /**
       * 处理GPS数据更新
       * @param {Object} gpsData 原始GPS数据
       * @returns {Object} 滤波后的数据
       */
      update: function(gpsData) {
        if (!filter.isInitialized) {
          filter.init(gpsData);
          return filter.getState();
        }
        
        try {
          // 第一步：异常检测
          var detectionResult = filter.detectAnomalies(gpsData);
          var anomalies = detectionResult.anomalies;
          var hasInterference = detectionResult.hasInterference;
          
          if (anomalies.length > 0) {
            // 🔧 减少日志输出频率，避免控制台刷屏
            if (!filter.lastAnomalyLogTime || Date.now() - filter.lastAnomalyLogTime > 2000) {
              console.warn('🛡️ 检测到数据异常:', anomalies);
              filter.lastAnomalyLogTime = Date.now();
            }
            filter.consecutiveAnomalies++;
            
            // 连续异常太多，可能GPS信号有问题，重置状态
            if (filter.consecutiveAnomalies >= filter.maxConsecutiveAnomalies) {
              console.warn('🛡️ 连续异常过多，重置滤波器状态');
              filter.consecutiveAnomalies = 0;
              // 仍然更新时间戳，避免完全卡住
              filter.lastValidData.timestamp = Date.now();
            }
            
            // 返回状态时包含干扰信息
            var state = filter.getState();
            state.hasInterference = hasInterference;
            return state;
          }
          
          // 第二步：数据平滑处理
          var smoothedData = filter.applySmoothFiltering(gpsData);
          
          // 第三步：更新状态
          filter.lastValidData = smoothedData;
          filter.consecutiveAnomalies = 0; // 重置异常计数
          
          var state = filter.getState();
          state.hasInterference = false;
          return state;
          
        } catch (error) {
          console.error('🛡️ 智能滤波器处理失败:', error);
          return filter.getState();
        }
      },
      
      /**
       * 基于新条件检测GPS干扰
       * @param {Object} gpsData GPS数据
       * @returns {Object} 检测结果对象 {anomalies: [], hasInterference: false}
       */
      detectAnomalies: function(gpsData) {
        var anomalies = [];
        var hasInterference = false;
        
        if (!filter.lastValidData) return {anomalies: anomalies, hasInterference: hasInterference};
        
        var currentTime = Date.now();
        
        // 🚨 新GPS干扰检测：同时满足三个条件
        // 条件1：地速大于0
        var speedGreaterThanZero = gpsData.speed != null && gpsData.speed > 0;
        
        // 条件2：地速前30秒固定数值不变
        var speedFixed = filter.checkSpeedFixed(gpsData.speed, currentTime);
        
        // 条件3：高度跳变超过1000ft
        var altitudeJump = false;
        var altitudeChange = 0;
        if (gpsData.altitude != null && filter.lastValidData.altitude != null) {
          altitudeChange = Math.abs(gpsData.altitude - filter.lastValidData.altitude);
          altitudeJump = altitudeChange > filter.altitudeJumpThreshold;
        }
        
        // 🎯 同时满足三个条件时触发干扰检测
        if (speedGreaterThanZero && speedFixed && altitudeJump) {
          anomalies.push('GPS干扰检测: 地速固定(' + gpsData.speed.toFixed(1) + 'kt) + 高度跳变(' + 
                        altitudeChange.toFixed(0) + 'ft)');
          hasInterference = true;
          
          // 🔧 减少日志输出频率，避免控制台刷屏
          if (!filter.lastAnomalyLogTime || currentTime - filter.lastAnomalyLogTime > 5000) {
            console.warn('🚨 GPS干扰检测触发: 三条件同时满足');
            console.log('📋 检测详情:', {
              speed: gpsData.speed.toFixed(1) + 'kt (>0)',
              speedFixed: '30秒内固定不变',
              altitudeJump: altitudeChange.toFixed(0) + 'ft (>1000ft)',
              from: filter.lastValidData.altitude.toFixed(0) + 'ft',
              to: gpsData.altitude.toFixed(0) + 'ft'
            });
            filter.lastAnomalyLogTime = currentTime;
          }
        }
        
        return {anomalies: anomalies, hasInterference: hasInterference};
      },
      
      /**
       * 检测地速是否在前30秒内固定不变
       * @param {Number} currentSpeed 当前地速
       * @param {Number} currentTime 当前时间戳
       * @returns {Boolean} 是否地速固定不变
       */
      checkSpeedFixed: function(currentSpeed, currentTime) {
        if (currentSpeed == null) return false;
        
        // 记录当前地速数据
        filter.speedHistory.push({
          speed: currentSpeed,
          timestamp: currentTime
        });
        
        // 清理超出30秒时间窗口的历史记录
        filter.speedHistory = filter.speedHistory.filter(function(record) {
          return (currentTime - record.timestamp) <= filter.speedCheckTimeWindow;
        });
        
        // 需要至少有30秒的数据才能判断
        if (filter.speedHistory.length < 2) {
          return false;
        }
        
        // 检查最老和最新记录的时间跨度是否够30秒
        var oldestRecord = filter.speedHistory[0];
        var timeSpan = currentTime - oldestRecord.timestamp;
        if (timeSpan < filter.speedCheckTimeWindow) {
          return false; // 数据时间跨度不足30秒
        }
        
        // 计算地速变化范围
        var speeds = filter.speedHistory.map(function(record) { return record.speed; });
        var minSpeed = Math.min.apply(Math, speeds);
        var maxSpeed = Math.max.apply(Math, speeds);
        var speedVariation = maxSpeed - minSpeed;
        
        // 地速变化小于容忍度(0.1节)认为是固定不变
        var isFixed = speedVariation <= filter.speedToleranceThreshold;
        
        // 调试日志（减少频率）
        if (filter.config && filter.config.debug && filter.config.debug.enableVerboseLogging) {
          if (!filter.lastSpeedCheckLogTime || currentTime - filter.lastSpeedCheckLogTime > 10000) {
            console.log('🔍 地速固定检测:', {
              timeSpan: (timeSpan/1000).toFixed(1) + 's',
              speedRange: minSpeed.toFixed(1) + '-' + maxSpeed.toFixed(1) + 'kt',
              variation: speedVariation.toFixed(2) + 'kt',
              isFixed: isFixed,
              samples: filter.speedHistory.length
            });
            filter.lastSpeedCheckLogTime = currentTime;
          }
        }
        
        return isFixed;
      },
      
      /**
       * 应用平滑滤波
       * @param {Object} gpsData GPS数据
       * @returns {Object} 平滑后的数据
       */
      applySmoothFiltering: function(gpsData) {
        var result = {
          timestamp: Date.now()
        };
        
        // 位置平滑（轻微）
        result.latitude = filter.smoothValue(
          gpsData.latitude,
          filter.lastValidData.latitude,
          filter.smoothing.position
        );
        result.longitude = filter.smoothValue(
          gpsData.longitude,
          filter.lastValidData.longitude,
          filter.smoothing.position
        );
        
        // 高度平滑（中等）
        result.altitude = filter.smoothValue(
          gpsData.altitude,
          filter.lastValidData.altitude,
          filter.smoothing.altitude
        );
        
        // 速度平滑（较强）
        result.speed = filter.smoothValue(
          gpsData.speed || 0,
          filter.lastValidData.speed,
          filter.smoothing.speed
        );
        
        // 🆕 航迹平滑 - 增强稳定化逻辑
        if (gpsData.track != null) {
          result.track = filter.smoothTrackWithStabilization(
            gpsData.track,
            filter.lastValidData.track,
            result.speed || 0
          );
        } else {
          result.track = filter.lastValidData.track;
        }
        
        return result;
      },
      
      /**
       * 数值平滑
       * @param {Number} newValue 新值
       * @param {Number} oldValue 旧值
       * @param {Number} alpha 平滑系数
       * @returns {Number} 平滑后的值
       */
      smoothValue: function(newValue, oldValue, alpha) {
        if (newValue == null || oldValue == null) {
          return newValue != null ? newValue : oldValue;
        }
        return alpha * newValue + (1 - alpha) * oldValue;
      },
      
      /**
       * 角度平滑（处理360度循环）
       * @param {Number} newAngle 新角度
       * @param {Number} oldAngle 旧角度
       * @param {Number} alpha 平滑系数
       * @returns {Number} 平滑后的角度
       */
      smoothAngle: function(newAngle, oldAngle, alpha) {
        if (newAngle == null || oldAngle == null) {
          return newAngle != null ? newAngle : oldAngle;
        }
        
        // 处理角度循环性
        var diff = newAngle - oldAngle;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        
        var smoothedAngle = oldAngle + alpha * diff;
        
        // 标准化到[0, 360)
        while (smoothedAngle < 0) smoothedAngle += 360;
        while (smoothedAngle >= 360) smoothedAngle -= 360;
        
        return smoothedAngle;
      },
      
      /**
       * 🆕 航迹平滑增强版 - 包含稳定化逻辑
       * @param {Number} newTrack 新航迹角度
       * @param {Number} oldTrack 旧航迹角度
       * @param {Number} currentSpeed 当前速度（节）
       * @returns {Number} 稳定化后的航迹角度
       */
      smoothTrackWithStabilization: function(newTrack, oldTrack, currentSpeed) {
        if (newTrack == null || oldTrack == null) {
          return newTrack != null ? newTrack : oldTrack;
        }
        
        // 计算角度差异
        var diff = newTrack - oldTrack;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        var trackDiff = Math.abs(diff);
        
        var currentTime = Date.now();
        var timeSinceLastUpdate = currentTime - filter.lastTrackUpdateTime;
        
        // 🆕 多层TRK稳定化策略
        
        // 第1层：静止/低速状态检测
        var isLowSpeed = currentSpeed < 3; // 低于3节为低速
        var isStationary = currentSpeed < 1; // 低于1节为静止
        
        if (isStationary) {
          // 静止状态：强力稳定，变化需要很大才更新
          if (trackDiff < 25) {
            console.log('🔒 静止状态TRK强力稳定 (' + trackDiff.toFixed(1) + '° < 25°)');
            return oldTrack;
          }
        }
        
        // 第2层：低速状态频率控制
        if (isLowSpeed && timeSinceLastUpdate < 4000) { // 低速时4秒才能更新一次
          console.log('🐌 低速状态TRK更新频率控制');
          return oldTrack;
        }
        
        // 第3层：动态阈值检查
        var threshold = filter.trackStabilityThreshold;
        if (isLowSpeed) {
          threshold = 18; // 低速时提高阈值
        } else if (currentSpeed > 10) {
          threshold = 8;  // 高速时降低阈值，更灵敏
        }
        
        if (trackDiff < threshold) {
          filter.consecutiveSmallChanges++;
          
          // 连续小变化超过5次，强制稳定
          if (filter.consecutiveSmallChanges > 5) {
            console.log('🔒 连续小变化过多，TRK强制稳定');
            return oldTrack;
          }
          
          console.log('🔒 TRK变化不足 (' + trackDiff.toFixed(1) + '° < ' + threshold + '°)，保持稳定');
          return oldTrack;
        }
        
        // 第4层：正常平滑处理
        filter.consecutiveSmallChanges = 0; // 重置小变化计数
        filter.lastTrackUpdateTime = currentTime;
        
        // 根据速度调整平滑强度
        var alpha = isLowSpeed ? 0.15 : 0.25; // 低速时更平滑
        var smoothedAngle = oldTrack + alpha * diff;
        
        // 标准化到[0, 360)
        while (smoothedAngle < 0) smoothedAngle += 360;
        while (smoothedAngle >= 360) smoothedAngle -= 360;
        
        console.log('✅ 智能TRK更新:', Math.round(smoothedAngle) + '°, 变化:', trackDiff.toFixed(1) + '°, 速度:', currentSpeed.toFixed(1) + 'kt');
        
        return smoothedAngle;
      },
      
      /**
       * 计算两点间距离（米）
       * @param {Number} lat1 纬度1
       * @param {Number} lon1 经度1
       * @param {Number} lat2 纬度2
       * @param {Number} lon2 经度2
       * @returns {Number} 距离（米）
       */
      calculateDistance: function(lat1, lon1, lat2, lon2) {
        var R = 6371000; // 地球半径(米)
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      },
      
      /**
       * 获取当前滤波状态
       * @returns {Object} 当前状态
       */
      getState: function() {
        if (!filter.isInitialized || !filter.lastValidData) {
          return null;
        }
        
        return {
          latitude: filter.lastValidData.latitude,
          longitude: filter.lastValidData.longitude,
          altitude: filter.lastValidData.altitude,
          groundSpeed: filter.lastValidData.speed,
          track: filter.lastValidData.track,
          timestamp: filter.lastValidData.timestamp,
          filterType: 'smart',
          consecutiveAnomalies: filter.consecutiveAnomalies
        };
      },
      
      /**
       * 重置滤波器
       */
      reset: function() {
        console.log('🛡️ 重置智能GPS滤波器');
        filter.isInitialized = false;
        filter.lastValidData = null;
        filter.consecutiveAnomalies = 0;
        
        // 🆕 重置TRK稳定化状态
        filter.consecutiveSmallChanges = 0;
        filter.lastTrackUpdateTime = 0;
      },
      
      /**
       * 销毁滤波器
       */
      destroy: function() {
        console.log('🛡️ 销毁智能GPS滤波器');
        filter.reset();
      }
    };
    
    return filter;
  }
};

module.exports = SmartFilter;