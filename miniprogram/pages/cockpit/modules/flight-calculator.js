/**
 * 飞行数据计算器模块
 * 
 * 提供所有飞行相关的数学计算功能，包括：
 * - 飞行数据计算（速度、垂直速度、航迹）
 * - 速度过滤和平滑处理
 * - 距离和方位角计算
 * - 移动平均算法
 * 
 * 设计原则：
 * - 纯函数优先，无副作用
 * - 状态通过参数传递，通过返回值更新
 * - 支持配置驱动
 * - ES5语法兼容
 */

var FlightCalculator = {
  /**
   * 创建飞行计算器实例
   * @param {Object} config 配置参数
   * @returns {Object} 计算器实例
   */
  create: function(config) {
    var calculator = {
      
      /**
       * 计算飞行数据（速度、垂直速度、航迹）- 增强静止检测版
       * @param {Array} history 位置历史记录数组
       * @param {Number} minSpeedForTrack 计算航迹的最小速度
       * @returns {Object} {speed: Number, verticalSpeed: Number, track: Number|null}
       */
      calculateFlightData: function(history, minSpeedForTrack) {
        var result = {
          speed: 0,
          verticalSpeed: 0,
          track: null
        };
        
        if (!history || history.length < 2) {
          return result;
        }
        
        // 获取最新两个位置点
        var current = history[history.length - 1];
        var previous = history[history.length - 2];
        
        // 计算时间差（秒）
        var timeDiff = (current.timestamp - previous.timestamp) / 1000;
        
        if (timeDiff > 0) {
          // 计算地速（使用Haversine公式）
          var distance = calculator.calculateDistance(
            previous.latitude, previous.longitude,
            current.latitude, current.longitude
          );
          var rawSpeed = (distance / timeDiff) * 1.944; // 转换为 kt（节）
          
          // 🔧 增强的静止检测和异常数据过滤
          var isLikelyStationary = false;
          
          // 1. 检查距离是否太小（可能是GPS噪声）
          if (distance < (config.gps.staticDistanceThreshold || 8)) { // 使用配置的静止距离阈值
            isLikelyStationary = true;
            console.log('🚁 检测到小距离移动 (' + distance.toFixed(1) + 'm)，可能静止');
          }
          
          // 2. 检查时间间隔是否太短（可能导致计算错误）
          if (timeDiff < 1) { // 1秒以内的更新间隔
            isLikelyStationary = true;
            console.log('🚁 检测到短时间间隔 (' + timeDiff.toFixed(2) + 's)，跳过速度计算');
          }
          
          // 3. 检查计算出的速度是否异常高
          if (rawSpeed > config.gps.maxReasonableSpeed) {
            console.warn('🚁 检测到异常高速度 (' + rawSpeed.toFixed(0) + 'kt)，可能是GPS跳变');
            isLikelyStationary = true;
          }
          
          // 4. 使用配置的静止速度阈值进行二次检查
          if (!isLikelyStationary && rawSpeed < (config.gps.staticSpeedThreshold || 2)) {
            console.log('🚁 速度低于静止阈值 (' + rawSpeed.toFixed(1) + 'kt < ' + (config.gps.staticSpeedThreshold || 2) + 'kt)');
            isLikelyStationary = true;
          }
          
          // 4. 使用历史数据进行多点平均（如果有足够数据）
          if (!isLikelyStationary && history.length >= 3) {
            var speeds = [];
            for (var i = 1; i < Math.min(history.length, 4); i++) { // 最多使用最近4个点
              var h1 = history[history.length - i - 1];
              var h2 = history[history.length - i];
              var dt = (h2.timestamp - h1.timestamp) / 1000;
              if (dt > 0 && dt < 10) { // 有效时间间隔
                var d = calculator.calculateDistance(h1.latitude, h1.longitude, h2.latitude, h2.longitude);
                var s = (d / dt) * 1.944;
                if (s <= config.gps.maxReasonableSpeed) { // 只使用合理的速度
                  speeds.push(s);
                }
              }
            }
            
            // 如果有多个有效速度数据，使用平均值
            if (speeds.length >= 2) {
              var avgSpeed = speeds.reduce(function(sum, s) { return sum + s; }, 0) / speeds.length;
              console.log('🚁 使用多点平均速度:', avgSpeed.toFixed(1) + 'kt (来自' + speeds.length + '个点)');
              rawSpeed = avgSpeed;
            }
          }
          
          // 应用静止检测结果
          if (isLikelyStationary) {
            result.speed = 0;
            console.log('🚁 静止状态检测：速度设为0kt');
          } else {
            result.speed = rawSpeed;
          }
          
          // 计算航迹（只有在速度足够时才计算）
          if (result.speed >= minSpeedForTrack) {
            result.track = calculator.calculateBearing(
              previous.latitude, previous.longitude,
              current.latitude, current.longitude
            );
          }
          
          // 计算垂直速度（英尺/分钟）
          var altitudeDiff = (current.altitude - previous.altitude) * 3.28084; // 米转英尺
          var rawVerticalSpeed = (altitudeDiff / timeDiff) * 60;
          
          // 垂直速度合理性检查（最大±6000 ft/min）
          if (Math.abs(rawVerticalSpeed) > config.gps.maxVerticalSpeed) {
            result.verticalSpeed = 0;
          } else {
            result.verticalSpeed = rawVerticalSpeed;
          }
        }
        
        return result;
      },
      
      /**
       * 速度过滤和平滑处理
       * @param {Number} rawSpeed 原始速度（节）
       * @param {Number} timeDiff 时间差（秒）
       * @param {Object} context 上下文状态
       * @returns {Object} {filteredSpeed: Number, newSpeedBuffer: Array, newAnomalyCount: Number, newLastValidSpeed: Number, showWarning: Boolean}
       */
      filterSpeed: function(rawSpeed, timeDiff, context) {
        var result = {
          filteredSpeed: 0,
          newSpeedBuffer: context.speedBuffer ? context.speedBuffer.slice() : [],
          newAnomalyCount: context.anomalyCount || 0,
          newLastValidSpeed: context.lastValidSpeed || 0,
          showWarning: false
        };
        
        // 检查速度是否超过最大合理值
        if (rawSpeed > config.gps.maxReasonableSpeed) {
          console.warn('GPS速度异常:', rawSpeed + 'kt, 使用上次有效值');
          result.newAnomalyCount++;
          
          // 连续异常超过阈值，显示警告
          if (result.newAnomalyCount > config.gps.maxAnomalyCount) {
            result.showWarning = true;
          }
          
          result.filteredSpeed = result.newLastValidSpeed;
          return result;
        }
        
        // 检查加速度是否合理
        if (result.newLastValidSpeed > 0) {
          var acceleration = Math.abs(rawSpeed - result.newLastValidSpeed) / timeDiff;
          if (acceleration > config.gps.maxAcceleration) {
            console.warn('GPS加速度异常:', acceleration + 'kt/s');
            result.newAnomalyCount++;
            
            // 限制速度变化
            var maxChange = config.gps.maxAcceleration * timeDiff;
            if (rawSpeed > result.newLastValidSpeed) {
              result.filteredSpeed = result.newLastValidSpeed + maxChange;
            } else {
              result.filteredSpeed = Math.max(0, result.newLastValidSpeed - maxChange);
            }
            
            // 更新缓冲区和有效速度
            result.newSpeedBuffer.push(result.filteredSpeed);
            if (result.newSpeedBuffer.length > config.gps.speedBufferSize) {
              result.newSpeedBuffer.shift();
            }
            result.newLastValidSpeed = result.filteredSpeed;
            
            return result;
          }
        }
        
        // 速度正常，重置异常计数
        result.newAnomalyCount = 0;
        
        // 添加到速度缓冲区
        result.newSpeedBuffer.push(rawSpeed);
        if (result.newSpeedBuffer.length > config.gps.speedBufferSize) {
          result.newSpeedBuffer.shift();
        }
        
        // 计算平滑后的速度（移动平均）
        var smoothedSpeed = calculator.calculateMovingAverage(result.newSpeedBuffer);
        
        // 更新结果
        result.filteredSpeed = smoothedSpeed;
        result.newLastValidSpeed = smoothedSpeed;
        
        return result;
      },
      
      /**
       * 计算移动平均值
       * @param {Array} buffer 数值缓冲区
       * @returns {Number} 平均值
       */
      calculateMovingAverage: function(buffer) {
        if (!buffer || buffer.length === 0) return 0;
        
        var sum = 0;
        for (var i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        
        return sum / buffer.length;
      },
      
      /**
       * 计算两点间距离（Haversine公式）
       * @param {Number} lat1 起始点纬度
       * @param {Number} lon1 起始点经度
       * @param {Number} lat2 目标点纬度
       * @param {Number} lon2 目标点经度
       * @returns {Number} 距离（米）
       */
      calculateDistance: function(lat1, lon1, lat2, lon2) {
        var R = 6371000; // 地球半径（米）
        var phi1 = lat1 * Math.PI / 180;
        var phi2 = lat2 * Math.PI / 180;
        var deltaPhi = (lat2 - lat1) * Math.PI / 180;
        var deltaLambda = (lon2 - lon1) * Math.PI / 180;
        
        var a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // 返回米
      },
      
      /**
       * 计算方位角
       * @param {Number} lat1 起始点纬度
       * @param {Number} lon1 起始点经度
       * @param {Number} lat2 目标点纬度
       * @param {Number} lon2 目标点经度
       * @returns {Number} 方位角（0-360度）
       */
      calculateBearing: function(lat1, lon1, lat2, lon2) {
        var phi1 = lat1 * Math.PI / 180;
        var phi2 = lat2 * Math.PI / 180;
        var deltaLambda = (lon2 - lon1) * Math.PI / 180;
        
        var y = Math.sin(deltaLambda) * Math.cos(phi2);
        var x = Math.cos(phi1) * Math.sin(phi2) -
                Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
        
        var bearing = Math.atan2(y, x) * 180 / Math.PI;
        
        // 转换为0-360度
        return (bearing + 360) % 360;
      },
      
      /**
       * 计算距离（海里）
       * @param {Number} lat1 起始点纬度
       * @param {Number} lon1 起始点经度
       * @param {Number} lat2 目标点纬度
       * @param {Number} lon2 目标点经度
       * @returns {Number} 距离（海里）
       */
      calculateDistanceNM: function(lat1, lon1, lat2, lon2) {
        var distanceM = calculator.calculateDistance(lat1, lon1, lat2, lon2);
        return distanceM / 1852; // 米转海里
      },
      
      /**
       * 检查位置合理性 - 增强静止检测版
       * @param {Object} location 新位置
       * @param {Number} timestamp 时间戳
       * @param {Object} context 上下文状态
       * @returns {Object} {isReasonable: Boolean, newLastValidPosition: Object|null}
       */
      isReasonableLocation: function(location, timestamp, context) {
        var result = {
          isReasonable: true,
          newLastValidPosition: context.lastValidPosition
        };
        
        // 第一次接收到位置，直接保存
        if (!context.lastValidPosition) {
          result.newLastValidPosition = {
            latitude: location.latitude,
            longitude: location.longitude,
            altitude: location.altitude || 0,
            timestamp: timestamp
          };
          return result;
        }
        
        var lastPos = context.lastValidPosition;
        var timeDiff = (timestamp - lastPos.timestamp) / 1000; // 秒
        
        // 时间太短，可能是重复数据
        if (timeDiff < config.gps.minLocationInterval) {
          result.isReasonable = false;
          console.log('🔍 时间间隔过短 (' + timeDiff.toFixed(2) + 's)，跳过位置更新');
          return result;
        }
        
        // 计算距离
        var distance = calculator.calculateDistance(
          lastPos.latitude, lastPos.longitude,
          location.latitude, location.longitude
        );
        
        // 计算隐含速度
        var impliedSpeed = (distance / timeDiff) * 1.944; // kt
        
        // 🔧 增强的位置跳变检测
        var maxAllowedSpeed = config.gps.maxReasonableSpeed * (config.gps.speedReasonableFactor || 1.5);
        
        // 1. 基本的异常高速检测
        if (impliedSpeed > maxAllowedSpeed) {
          console.warn('🔍 GPS位置跳变检测，隐含速度:', impliedSpeed.toFixed(0) + 'kt (>= ' + maxAllowedSpeed + 'kt)');
          result.isReasonable = false;
          return result;
        }
        
        // 2. 静止状态下的微小位移检测（可能是GPS噪声）
        if (distance < 3 && timeDiff > 2) { // 3米以内且时间超过2秒
          console.log('🔍 检测到静止状态微小位移 (' + distance.toFixed(1) + 'm)，保持上次位置');
          // 不更新位置，保持静止状态
          result.isReasonable = false;
          return result;
        }
        
        // 3. 检查是否有连续的异常跳变模式
        if (context.locationHistory && context.locationHistory.length >= 2) {
          var recent = context.locationHistory.slice(-2); // 最近2个位置
          var totalDistance = 0;
          var totalTime = 0;
          
          // 计算最近几个点的总距离和时间
          for (var i = 0; i < recent.length - 1; i++) {
            var d = calculator.calculateDistance(
              recent[i].latitude, recent[i].longitude,
              recent[i + 1].latitude, recent[i + 1].longitude
            );
            var t = (recent[i + 1].timestamp - recent[i].timestamp) / 1000;
            totalDistance += d;
            totalTime += t;
          }
          
          // 加上当前位置的距离和时间
          totalDistance += distance;
          totalTime += timeDiff;
          
          if (totalTime > 0) {
            var avgSpeed = (totalDistance / totalTime) * 1.944;
            // 如果平均速度异常但单次速度看起来合理，可能是GPS漂移
            if (avgSpeed > config.gps.maxReasonableSpeed && impliedSpeed < 50) {
              console.warn('🔍 检测到GPS持续漂移，平均速度:', avgSpeed.toFixed(0) + 'kt');
              result.isReasonable = false;
              return result;
            }
          }
        }
        
        // 4. 高度变化合理性检查（防止异常的高度跳变）
        if (location.altitude && lastPos.altitude) {
          var altitudeDiff = Math.abs(location.altitude - lastPos.altitude);
          var maxAltitudeChange = timeDiff * 50; // 假设最大爬升率50m/s
          
          if (altitudeDiff > maxAltitudeChange && altitudeDiff > 100) { // 超过100米的异常跳变
            console.warn('🔍 高度异常跳变:', altitudeDiff.toFixed(0) + 'm in ' + timeDiff.toFixed(1) + 's');
            result.isReasonable = false;
            return result;
          }
        }
        
        // 位置合理，更新上次有效位置
        result.newLastValidPosition = {
          latitude: location.latitude,
          longitude: location.longitude,
          altitude: location.altitude || 0,
          timestamp: timestamp
        };
        
        console.log('🔍 位置检查通过: 距离=' + distance.toFixed(1) + 'm, 隐含速度=' + impliedSpeed.toFixed(1) + 'kt');
        return result;
      }
    };
    
    return calculator;
  }
};

module.exports = FlightCalculator;