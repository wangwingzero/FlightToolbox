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
   * @returns {Object} 滤波器实例
   */
  create: function() {
    var filter = {
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
       * 基于航空常识检测异常数据
       * @param {Object} gpsData GPS数据
       * @returns {Object} 检测结果对象 {anomalies: [], hasInterference: false}
       */
      detectAnomalies: function(gpsData) {
        var anomalies = [];
        var hasInterference = false;
        
        if (!filter.lastValidData) return {anomalies: anomalies, hasInterference: hasInterference};
        
        // 🚨 简化的GPS干扰检测：只检查高度跳变超过3000英尺
        if (gpsData.altitude != null && filter.lastValidData.altitude != null) {
          var altitudeChange = Math.abs(gpsData.altitude - filter.lastValidData.altitude);
          
          if (altitudeChange > 3000) {
            anomalies.push('GPS干扰检测: 高度跳变 ' + altitudeChange.toFixed(0) + 'ft');
            hasInterference = true;
          }
        }
        
        return {anomalies: anomalies, hasInterference: hasInterference};
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
        
        // 航迹平滑（强平滑，参考航向逻辑）
        if (gpsData.track != null) {
          result.track = filter.smoothAngle(
            gpsData.track,
            filter.lastValidData.track,
            filter.smoothing.track
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