/**
 * 简化GPS数据滤波器
 * 
 * 作为卡尔曼滤波器的轻量级替代方案，提供基础的数据平滑功能
 * 
 * 功能特性：
 * - 加权移动平均滤波
 * - 异常值检测和剔除
 * - 航向角平滑处理
 * - 零漂校正
 * - 低计算开销(<1ms)
 * 
 * 适用场景：
 * - 卡尔曼滤波器初始化失败时的降级方案
 * - 性能受限设备的轻量级解决方案
 * - 基础GPS数据噪声抑制
 */

var SimpleFilter = {
  /**
   * 创建简化滤波器实例
   * @param {Object} config 配置参数
   * @returns {Object} 滤波器实例
   */
  create: function(config) {
    var filter = {
      // 配置参数
      config: {
        alpha: 0.3,                    // 滤波系数 [0-1]，越小越平滑
        headingAlpha: 0.2,             // 航向滤波系数
        anomalyThreshold: 500,         // 异常值检测阈值(米) - 🔧 大幅提高到500米，避免高速飞行误判
        headingAnomalyThreshold: 60,   // 航向异常值阈值(度) - 🔧 放宽到60度
        minSpeedThreshold: 0.5,        // 最小速度阈值(m/s) - 降低到0.5m/s（约1.8km/h）
        historySize: 5                 // 历史数据缓存大小
      },
      
      // 状态数据
      isInitialized: false,
      lastValidData: null,
      history: [],
      
      // 统计信息
      updateCount: 0,
      anomalyCount: 0,
      
      /**
       * 初始化滤波器
       * @param {Object} initialData 初始GPS数据
       */
      init: function(initialData) {
        console.log('🔧 初始化简化GPS滤波器...');
        
        filter.lastValidData = {
          latitude: initialData.latitude || 39.9042,
          longitude: initialData.longitude || 116.4074,
          altitude: (initialData.altitude != null && !isNaN(initialData.altitude)) ? initialData.altitude : null,
          speed: 0,
          heading: initialData.heading || 0,
          track: initialData.track || initialData.heading || 0,
          timestamp: Date.now()
        };
        
        filter.history = [filter.lastValidData];
        filter.isInitialized = true;
        filter.updateCount = 0;
        filter.anomalyCount = 0;
        
        console.log('✅ 简化GPS滤波器初始化成功');
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
        
        var startTime = Date.now();
        
        try {
          // 🔧 修改异常处理：检测到异常时仍然更新部分数据，避免完全卡住
          var isDataValid = filter.isValidGPSData(gpsData);
          if (!isDataValid) {
            console.warn('⚠️ GPS数据异常，使用保守更新策略');
            filter.anomalyCount++;
            
            // 🔧 即使数据异常，也更新时间戳和部分安全数据，避免完全卡住
            if (filter.lastValidData) {
              filter.lastValidData.timestamp = Date.now();
              // 如果只是位置跳变，仍然更新速度等安全字段
              if (gpsData.speed !== undefined && gpsData.speed !== null) {
                filter.lastValidData.speed = gpsData.speed;
              }
            }
            return filter.getState();
          }
          
          // 计算滤波后的位置
          var filteredLat = filter.filterValue(
            gpsData.latitude, 
            filter.lastValidData.latitude, 
            filter.config.alpha
          );
          
          var filteredLon = filter.filterValue(
            gpsData.longitude, 
            filter.lastValidData.longitude, 
            filter.config.alpha
          );
          
          var filteredAlt = gpsData.altitude;
          // 🔧 简化高度处理：如果有高度数据就使用，避免过度滤波
          if (gpsData.altitude != null && !isNaN(gpsData.altitude) && 
              filter.lastValidData.altitude != null && !isNaN(filter.lastValidData.altitude)) {
            // 只有当新旧高度都有效时才进行滤波
            filteredAlt = filter.filterValue(
              gpsData.altitude, 
              filter.lastValidData.altitude, 
              0.8 // 使用更大的滤波系数，减少滤波影响
            );
          } else if (gpsData.altitude != null && !isNaN(gpsData.altitude)) {
            // 如果只有新高度有效，直接使用
            filteredAlt = gpsData.altitude;
          } else {
            // 如果新高度无效，保持旧高度
            filteredAlt = filter.lastValidData.altitude;
          }
          
          // 🔧 完全重写航迹计算逻辑
          var deltaTime = (Date.now() - filter.lastValidData.timestamp) / 1000;
          var speed = 0;
          var track = filter.lastValidData.track || 0;
          
          if (deltaTime > 0.1) { // 最小时间间隔
            var distance = filter.calculateDistance(
              filter.lastValidData.latitude,
              filter.lastValidData.longitude,
              filteredLat,
              filteredLon
            );
            speed = distance / deltaTime; // m/s
            
            // 🔧 关键修复：直接计算航迹，不依赖距离门槛
            if (distance > 0.1) { // 只需要有微小移动就计算航迹
              var newTrack = filter.calculateBearing(
                filter.lastValidData.latitude,
                filter.lastValidData.longitude,
                filteredLat,
                filteredLon
              );
              
              // 确保航迹值有效
              if (!isNaN(newTrack) && isFinite(newTrack)) {
                track = newTrack;
                console.log('🔧 计算新航迹:', Math.round(track) + '°, 距离:', distance.toFixed(1) + 'm, 速度:', (speed * 1.944).toFixed(0) + 'kt');
              } else {
                console.warn('🔧 航迹计算结果无效:', newTrack);
              }
            } else {
              console.log('🔧 距离变化太小，保持原航迹:', Math.round(track) + '°');
            }
          }
          
          // 速度平滑处理
          var filteredSpeed = filter.filterValue(
            speed,
            filter.lastValidData.speed,
            filter.config.alpha
          );
          
          // 零漂校正：低于阈值时设为0
          if (filteredSpeed < filter.config.minSpeedThreshold) {
            filteredSpeed = 0;
          }
          
          // 🔧 完全简化航迹平滑处理 - 直接使用计算结果
          var filteredTrack = track;
          
          // 航向处理
          var filteredHeading = gpsData.heading || filter.lastValidData.heading;
          if (gpsData.heading !== undefined && gpsData.heading !== null) {
            filteredHeading = filter.filterAngle(
              gpsData.heading,
              filter.lastValidData.heading,
              filter.config.headingAlpha
            );
          }
          
          // 更新状态
          var newData = {
            latitude: filteredLat,
            longitude: filteredLon,
            altitude: filteredAlt,
            speed: filteredSpeed,
            heading: filteredHeading,
            track: filteredTrack,
            timestamp: Date.now()
          };
          
          // 🔧 添加详细调试信息
          console.log('🔧 简化滤波器处理结果:', {
            '原始航迹': track,
            '滤波后航迹': filteredTrack,
            '原始速度': speed,
            '滤波后速度': filteredSpeed,
            '原始高度': gpsData.altitude,
            '滤波后高度': filteredAlt,
            '位置变化距离': deltaTime > 0.1 ? filter.calculateDistance(
              filter.lastValidData.latitude,
              filter.lastValidData.longitude,
              filteredLat,
              filteredLon
            ).toFixed(1) + 'm' : '时间间隔太短'
          });
          
          filter.lastValidData = newData;
          filter.updateHistory(newData);
          filter.updateCount++;
          
          var computeTime = Date.now() - startTime;
          console.log('🔧 简化滤波处理完成, 耗时:', computeTime + 'ms');
          
          return filter.getState();
          
        } catch (error) {
          console.error('❌ 简化滤波器处理失败:', error);
          return filter.getState();
        }
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
          groundSpeed: filter.lastValidData.speed * 1.944, // 转换为节
          heading: filter.lastValidData.heading,
          track: filter.lastValidData.track || filter.lastValidData.heading, // 使用真实航迹，降级到航向
          isConverged: filter.updateCount > 5, // 简单收敛判断
          updateCount: filter.updateCount,
          lastUpdateTime: filter.lastValidData.timestamp,
          // 简化滤波器特有字段
          filterType: 'simple',
          anomalyCount: filter.anomalyCount
        };
      },
      
      /**
       * 检查GPS数据有效性
       * @param {Object} gpsData GPS数据
       * @returns {Boolean} 是否有效
       */
      isValidGPSData: function(gpsData) {
        // 基础字段检查
        if (!gpsData || 
            typeof gpsData.latitude !== 'number' || 
            typeof gpsData.longitude !== 'number') {
          return false;
        }
        
        // 坐标范围检查
        if (gpsData.latitude < -90 || gpsData.latitude > 90 ||
            gpsData.longitude < -180 || gpsData.longitude > 180) {
          return false;
        }
        
        // 与上次数据的偏差检查
        if (filter.lastValidData) {
          var distance = filter.calculateDistance(
            filter.lastValidData.latitude,
            filter.lastValidData.longitude,
            gpsData.latitude,
            gpsData.longitude
          );
          
          // 🔧 智能异常检测：基于时间间隔动态调整距离阈值
          var timeInterval = (Date.now() - filter.lastValidData.timestamp) / 1000; // 秒
          var maxReasonableDistance = timeInterval * 100; // 假设最大合理速度100m/s (约200kt)
          var dynamicThreshold = Math.max(filter.config.anomalyThreshold, maxReasonableDistance);
          
          // 检查位置跳变是否过大
          if (distance > dynamicThreshold) {
            console.warn('🔧 位置跳变过大:', {
              距离: distance.toFixed(1) + 'm',
              时间间隔: timeInterval.toFixed(1) + 's',
              动态阈值: dynamicThreshold.toFixed(1) + 'm',
              固定阈值: filter.config.anomalyThreshold + 'm'
            });
            return false;
          }
          
          // 检查航向跳变是否过大
          if (gpsData.heading !== undefined && filter.lastValidData.heading !== undefined) {
            var headingDiff = Math.abs(gpsData.heading - filter.lastValidData.heading);
            if (headingDiff > 180) headingDiff = 360 - headingDiff;
            
            if (headingDiff > filter.config.headingAnomalyThreshold) {
              return false;
            }
          }
        }
        
        return true;
      },
      
      /**
       * 数值滤波（加权移动平均）
       * @param {Number} newValue 新值
       * @param {Number} oldValue 旧值
       * @param {Number} alpha 滤波系数
       * @returns {Number} 滤波后的值
       */
      filterValue: function(newValue, oldValue, alpha) {
        return alpha * newValue + (1 - alpha) * oldValue;
      },
      
      /**
       * 角度滤波（处理角度循环性）
       * @param {Number} newAngle 新角度
       * @param {Number} oldAngle 旧角度
       * @param {Number} alpha 滤波系数
       * @returns {Number} 滤波后的角度
       */
      filterAngle: function(newAngle, oldAngle, alpha) {
        // 处理角度循环性
        var diff = newAngle - oldAngle;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        
        var filteredAngle = oldAngle + alpha * diff;
        
        // 标准化到[0, 360)
        while (filteredAngle < 0) filteredAngle += 360;
        while (filteredAngle >= 360) filteredAngle -= 360;
        
        return filteredAngle;
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
       * 计算两点间方位角（度）
       * @param {Number} lat1 起点纬度
       * @param {Number} lon1 起点经度
       * @param {Number} lat2 终点纬度
       * @param {Number} lon2 终点经度
       * @returns {Number} 方位角（0-360度）
       */
      calculateBearing: function(lat1, lon1, lat2, lon2) {
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var lat1Rad = lat1 * Math.PI / 180;
        var lat2Rad = lat2 * Math.PI / 180;
        
        var y = Math.sin(dLon) * Math.cos(lat2Rad);
        var x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
                Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
        
        var bearing = Math.atan2(y, x) * 180 / Math.PI;
        
        // 标准化到0-360度
        return (bearing + 360) % 360;
      },
      
      /**
       * 更新历史数据
       * @param {Object} newData 新数据
       */
      updateHistory: function(newData) {
        filter.history.push(newData);
        
        // 限制历史数据大小
        if (filter.history.length > filter.config.historySize) {
          filter.history.shift();
        }
      },
      
      /**
       * 重置滤波器
       * @param {Object} newInitialData 新的初始数据
       */
      reset: function(newInitialData) {
        console.log('🔄 重置简化GPS滤波器...');
        filter.isInitialized = false;
        filter.history = [];
        filter.updateCount = 0;
        filter.anomalyCount = 0;
        
        if (newInitialData) {
          filter.init(newInitialData);
        }
      },
      
      /**
       * 获取统计信息
       * @returns {Object} 统计信息
       */
      getStats: function() {
        return {
          updateCount: filter.updateCount,
          anomalyCount: filter.anomalyCount,
          successRate: filter.updateCount > 0 ? 
            ((filter.updateCount - filter.anomalyCount) / filter.updateCount * 100).toFixed(1) + '%' : '0%',
          filterType: 'simple',
          historySize: filter.history.length
        };
      },
      
      /**
       * 销毁滤波器
       */
      destroy: function() {
        console.log('🧹 销毁简化GPS滤波器...');
        filter.isInitialized = false;
        filter.lastValidData = null;
        filter.history = [];
        console.log('✅ 简化GPS滤波器已销毁');
      }
    };
    
    return filter;
  }
};

module.exports = SimpleFilter;