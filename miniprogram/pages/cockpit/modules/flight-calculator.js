/**
 * 飞行数据计算器模块 - 极简版
 * 
 * 设计原则：
 * - 直接使用原始数据，最少处理
 * - 移除复杂的滤波和计算逻辑
 * - 保持基本功能
 */

var FlightCalculator = {
  // 速度历史记录缓存
  speedHistory: [],
  maxSpeedHistory: 10,
  
  // 高度历史记录缓存
  altitudeHistory: [],
  maxAltitudeHistory: 10,
  
  /**
   * 将十进制度数转换为航空格式（度分）
   * @param {Number} decimal 十进制度数
   * @param {String} type 'lat' 纬度或 'lng' 经度
   * @returns {String} 航空格式坐标 (如 N4043.6, W07527.3)
   */
  formatCoordinateForAviation: function(decimal, type) {
    if (!decimal || isNaN(decimal)) {
      return type === 'lat' ? 'N0000.0' : 'E00000.0';
    }
    
    var isNegative = decimal < 0;
    var absDecimal = Math.abs(decimal);
    
    // 提取度和分
    var degrees = Math.floor(absDecimal);
    var minutes = (absDecimal - degrees) * 60;
    
    // 确定方向
    var direction;
    if (type === 'lat') {
      direction = isNegative ? 'S' : 'N';
    } else {
      direction = isNegative ? 'W' : 'E';
    }
    
    // 格式化输出
    if (type === 'lat') {
      // 纬度格式: N4043.6 (DDMM.M)
      return direction + degrees.toString().padStart(2, '0') + minutes.toFixed(1).padStart(4, '0');
    } else {
      // 经度格式: W07527.3 (DDDMM.M)  
      return direction + degrees.toString().padStart(3, '0') + minutes.toFixed(1).padStart(4, '0');
    }
  },

  /**
   * 创建飞行计算器实例
   * @param {Object} config 配置参数
   * @returns {Object} 计算器实例
   */
  create: function(config) {
    var calculator = {
      
      /**
       * 计算飞行数据 - 智能航迹计算版
       * @param {Array} history 位置历史记录数组
       * @param {Number} minSpeedForTrack 计算航迹的最小速度（已废弃，使用配置）
       * @returns {Object} {speed: Number, verticalSpeed: Number, track: Number|null, acceleration: Number}
       */
      calculateFlightData: function(history, minSpeedForTrack) {
        var result = {
          speed: 0,
          verticalSpeed: 0,
          track: null,
          acceleration: 0
        };
        
        if (!history || history.length < 2) {
          return result;
        }
        
        // 获取当前数据点
        var current = history[history.length - 1];
        if (!current) {
          return result;
        }
        
        // 使用GPS提供的速度值
        result.speed = current.speed || 0;
        
        // 计算加速度
        result.acceleration = calculator.calculateAcceleration(current.speed, current.timestamp);
        
        // 计算垂直速度
        result.verticalSpeed = calculator.calculateVerticalSpeed(current.altitude, current.timestamp);
        
        // 🛩️ 智能航迹计算 - 根据运动状态采用不同策略
        result.track = calculator.calculateIntelligentTrack(history, result.speed);
        
        return result;
      },
      
      /**
       * 计算加速度（地速变化率）
       * @param {Number} currentSpeed 当前速度（节）
       * @param {Number} timestamp 时间戳
       * @returns {Number} 加速度（节/秒）
       */
      calculateAcceleration: function(currentSpeed, timestamp) {
        // 添加到速度历史
        FlightCalculator.speedHistory.push({
          speed: currentSpeed || 0,
          timestamp: timestamp
        });
        
        // 限制历史记录大小
        if (FlightCalculator.speedHistory.length > FlightCalculator.maxSpeedHistory) {
          FlightCalculator.speedHistory.shift();
        }
        
        // 需要至少2个数据点
        if (FlightCalculator.speedHistory.length < 2) {
          return 0;
        }
        
        // 使用最近3个数据点进行平滑计算
        var pointsToUse = Math.min(3, FlightCalculator.speedHistory.length);
        var startIndex = FlightCalculator.speedHistory.length - pointsToUse;
        
        var totalAcceleration = 0;
        var validCount = 0;
        
        for (var i = startIndex + 1; i < FlightCalculator.speedHistory.length; i++) {
          var curr = FlightCalculator.speedHistory[i];
          var prev = FlightCalculator.speedHistory[i - 1];
          
          var timeDiff = (curr.timestamp - prev.timestamp) / 1000; // 秒
          if (timeDiff > 0 && timeDiff < 10) { // 忽略时间间隔过大的数据
            var accel = (curr.speed - prev.speed) / timeDiff;
            
            // 限制加速度范围（-5到5节/秒）
            if (Math.abs(accel) < 5) {
              totalAcceleration += accel;
              validCount++;
            }
          }
        }
        
        if (validCount === 0) {
          return 0;
        }
        
        // 返回平均加速度，保留到整数
        return Math.round(totalAcceleration / validCount);
      },
      
      /**
       * 计算垂直速度（升降率）
       * @param {Number} currentAltitude 当前高度（英尺）
       * @param {Number} timestamp 时间戳
       * @returns {Number} 垂直速度（英尺/分钟）
       */
      calculateVerticalSpeed: function(currentAltitude, timestamp) {
        // 如果高度无效，返回0
        if (currentAltitude == null || isNaN(currentAltitude)) {
          return 0;
        }
        
        // 添加到高度历史
        FlightCalculator.altitudeHistory.push({
          altitude: currentAltitude,
          timestamp: timestamp
        });
        
        // 限制历史记录大小
        if (FlightCalculator.altitudeHistory.length > FlightCalculator.maxAltitudeHistory) {
          FlightCalculator.altitudeHistory.shift();
        }
        
        // 需要至少2个数据点
        if (FlightCalculator.altitudeHistory.length < 2) {
          return 0;
        }
        
        // 使用最近5个数据点进行平滑计算
        var pointsToUse = Math.min(5, FlightCalculator.altitudeHistory.length);
        var startIndex = FlightCalculator.altitudeHistory.length - pointsToUse;
        
        // 计算平均垂直速度
        var totalVS = 0;
        var validCount = 0;
        
        // 使用首尾数据计算总体趋势
        var oldest = FlightCalculator.altitudeHistory[startIndex];
        var newest = FlightCalculator.altitudeHistory[FlightCalculator.altitudeHistory.length - 1];
        
        var totalTimeDiff = (newest.timestamp - oldest.timestamp) / 1000; // 秒
        if (totalTimeDiff > 0 && totalTimeDiff < 30) { // 忽略时间间隔过大的数据
          var altitudeDiff = newest.altitude - oldest.altitude;
          var vs = (altitudeDiff / totalTimeDiff) * 60; // 转换为英尺/分钟
          
          // 限制垂直速度范围（-6000到6000英尺/分钟）
          if (Math.abs(vs) < 6000) {
            totalVS = vs;
            validCount = 1;
          }
        }
        
        if (validCount === 0) {
          return 0;
        }
        
        // 返回垂直速度，保留到整数
        return Math.round(totalVS);
      },
      
      /**
       * 速度过滤 - 极简版，直接返回原始速度
       * @param {Number} newSpeed 新速度值
       * @param {Number} timeDiff 时间差（秒）
       * @param {Object} context 上下文数据
       * @returns {Object} 过滤结果
       */
      filterSpeed: function(newSpeed, timeDiff, context) {
        // 极简版：直接返回原始速度，不做任何过滤
        return {
          filteredSpeed: newSpeed || 0,
          newSpeedBuffer: [],
          newAnomalyCount: 0,
          newLastValidSpeed: newSpeed || 0,
          showWarning: false
        };
      },
      
      /**
       * 计算两点间距离 - 保留基本功能
       * @param {Number} lat1 纬度1
       * @param {Number} lon1 经度1
       * @param {Number} lat2 纬度2
       * @param {Number} lon2 经度2
       * @returns {Number} 距离（米）
       */
      calculateDistance: function(lat1, lon1, lat2, lon2) {
        var R = 6371000; // 地球半径，米
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      },
      
      /**
       * 计算两点间距离（海里）
       * @param {Number} lat1 纬度1
       * @param {Number} lon1 经度1
       * @param {Number} lat2 纬度2
       * @param {Number} lon2 经度2
       * @returns {Number} 距离（海里）
       */
      calculateDistanceNM: function(lat1, lon1, lat2, lon2) {
        var distanceInMeters = calculator.calculateDistance(lat1, lon1, lat2, lon2);
        return distanceInMeters / 1852; // 1海里 = 1852米
      },
      
      /**
       * 计算方位角（从点1到点2）
       * @param {Number} lat1 起点纬度
       * @param {Number} lon1 起点经度
       * @param {Number} lat2 终点纬度
       * @param {Number} lon2 终点经度
       * @returns {Number} 方位角（0-360度，0度为正北）
       */
      calculateBearing: function(lat1, lon1, lat2, lon2) {
        // 转换为弧度
        var lat1Rad = lat1 * Math.PI / 180;
        var lat2Rad = lat2 * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        
        // 计算方位角
        var y = Math.sin(dLon) * Math.cos(lat2Rad);
        var x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
                Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
        
        var bearing = Math.atan2(y, x) * 180 / Math.PI;
        
        // 标准化到0-360度
        return (bearing + 360) % 360;
      },
      
      /**
       * 位置合理性检查 - 极简版
       * @param {Object} location 位置数据
       * @param {Number} timestamp 时间戳
       * @param {Object} context 上下文
       * @returns {Object} 检查结果
       */
      isReasonableLocation: function(location, timestamp, context) {
        // 极简版：所有位置都认为是合理的
        return {
          isReasonable: true,
          reason: null,
          newLastValidPosition: location
        };
      },

      /**
       * 🛩️ 智能航迹计算 - 根据运动状态采用不同策略
       * @param {Array} history 位置历史记录数组
       * @param {Number} currentSpeed 当前速度（节）
       * @returns {Number|null} 航迹角度（0-360度）或null
       */
      calculateIntelligentTrack: function(history, currentSpeed) {
        if (!history || history.length < 2) {
          return null;
        }

        // 从配置中获取参数，如果config不存在则使用默认值
        var staticSpeedThreshold = (config && config.gps && config.gps.staticSpeedThreshold) || 2;
        var minSpeedForTrack = (config && config.compass && config.compass.minSpeedForTrack) || 5;
        
        // 运动状态检测
        var motionState = calculator.detectMotionState(history, currentSpeed, staticSpeedThreshold);
        
        console.log('🧭 航迹计算 - 运动状态:', motionState.state, '速度:', currentSpeed + 'kt');
        
        // 根据运动状态采用不同策略
        switch (motionState.state) {
          case 'STATIONARY':
            // 静止状态：不更新航迹，返回null让上层保持最后值
            console.log('📍 静止状态，保持航迹不变');
            return null;
            
          case 'LOW_SPEED':
            // 低速状态：使用长时间窗口和高距离阈值
            return calculator.calculateStableTrack(history, {
              minTimeSpan: 10, // 10秒时间窗口
              minDistance: 20, // 20米最小距离
              confidence: 'medium'
            });
            
          case 'NORMAL_SPEED':
            // 正常速度：使用中等时间窗口
            return calculator.calculateStableTrack(history, {
              minTimeSpan: 5, // 5秒时间窗口
              minDistance: 15, // 15米最小距离
              confidence: 'high'
            });
            
          case 'HIGH_SPEED':
            // 高速状态：使用短时间窗口，更敏感的响应
            return calculator.calculateStableTrack(history, {
              minTimeSpan: 2, // 2秒时间窗口
              minDistance: 10, // 10米最小距离
              confidence: 'high'
            });
            
          default:
            return null;
        }
      },

      /**
       * 检测运动状态
       * @param {Array} history 位置历史记录
       * @param {Number} currentSpeed 当前速度（节）
       * @param {Number} staticThreshold 静止阈值
       * @returns {Object} 运动状态信息
       */
      detectMotionState: function(history, currentSpeed, staticThreshold) {
        // 基于速度的初步判断
        if (currentSpeed < staticThreshold) {
          // 进一步检查是否真的静止（检查最近几个点的移动距离）
          var recentMovement = calculator.calculateRecentMovement(history, 3);
          if (recentMovement < 10) { // 最近3个点移动距离小于10米
            return { state: 'STATIONARY', movement: recentMovement };
          }
        }
        
        if (currentSpeed < 10) {
          return { state: 'LOW_SPEED', movement: currentSpeed };
        } else if (currentSpeed < 50) {
          return { state: 'NORMAL_SPEED', movement: currentSpeed };
        } else {
          return { state: 'HIGH_SPEED', movement: currentSpeed };
        }
      },

      /**
       * 计算最近N个点的总移动距离
       * @param {Array} history 位置历史记录
       * @param {Number} pointCount 要检查的点数
       * @returns {Number} 总移动距离（米）
       */
      calculateRecentMovement: function(history, pointCount) {
        if (!history || history.length < 2) {
          return 0;
        }
        
        var totalDistance = 0;
        var checkPoints = Math.min(pointCount, history.length);
        var startIndex = history.length - checkPoints;
        
        for (var i = startIndex + 1; i < history.length; i++) {
          var prev = history[i - 1];
          var curr = history[i];
          if (prev && curr && prev.latitude && prev.longitude && curr.latitude && curr.longitude) {
            totalDistance += calculator.calculateDistance(
              prev.latitude, prev.longitude,
              curr.latitude, curr.longitude
            );
          }
        }
        
        return totalDistance;
      },

      /**
       * 计算稳定航迹 - 使用动态时间窗口和距离阈值
       * @param {Array} history 位置历史记录
       * @param {Object} options 计算选项
       * @returns {Number|null} 航迹角度或null
       */
      calculateStableTrack: function(history, options) {
        var current = history[history.length - 1];
        var currentTime = current.timestamp;
        
        // 查找满足条件的起始点
        var startPoint = null;
        var totalDistance = 0;
        
        // 从后往前查找，直到找到满足时间和距离要求的点
        for (var i = history.length - 2; i >= 0; i--) {
          var point = history[i];
          var timeDiff = (currentTime - point.timestamp) / 1000; // 秒
          
          if (timeDiff >= options.minTimeSpan) {
            // 计算到当前点的总距离
            var distance = calculator.calculateDistance(
              point.latitude, point.longitude,
              current.latitude, current.longitude
            );
            
            if (distance >= options.minDistance) {
              startPoint = point;
              totalDistance = distance;
              break;
            }
          }
        }
        
        if (!startPoint) {
          console.log('🧭 未找到满足条件的起始点，无法计算航迹');
          return null;
        }
        
        // 计算航迹
        var track = calculator.calculateBearing(
          startPoint.latitude, startPoint.longitude,
          current.latitude, current.longitude
        );
        
        console.log('🧭 稳定航迹计算:', {
          timeSpan: Math.round((currentTime - startPoint.timestamp) / 1000) + '秒',
          distance: Math.round(totalDistance) + '米',
          track: Math.round(track) + '°'
        });
        
        return track;
      }
      
    };
    
    return calculator;
  }
};

module.exports = FlightCalculator;