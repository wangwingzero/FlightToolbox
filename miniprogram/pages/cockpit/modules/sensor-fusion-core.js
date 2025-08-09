/**
 * 智能传感器融合算法核心 - 简化版
 * 
 * 设计原则：
 * - 保持原有接口兼容性
 * - 专注指南针数据处理
 * - 移除无用的复杂逻辑
 * - 为未来扩展保留可能性
 */

var SensorFusionCore = {
  /**
   * 创建传感器融合核心实例
   * @param {Object} config 配置参数
   * @returns {Object} 融合器实例
   */
  create: function(config) {
    var fusionCore = {
      // 配置参数
      config: config,
      
      // 简化状态管理
      lastFusedHeading: null,
      
      /**
       * 🧠 核心融合算法 - 简化版（专注指南针数据）
       * @param {Object} sensorData 传感器数据包
       * @returns {Object} 融合后的航向数据
       */
      fuseHeadingData: function(sensorData) {
        var timestamp = Date.now();
        
        // 处理指南针数据
        if (sensorData.compass && sensorData.compass.heading !== undefined) {
          var heading = fusionCore.normalizeAngle(sensorData.compass.heading);
          var confidence = fusionCore.calculateCompassConfidence(sensorData.compass.accuracy);
          
          // 更新历史记录
          fusionCore.lastFusedHeading = heading;
          
          return {
            heading: heading,
            confidence: confidence,
            stability: 1.0, // 固定稳定性
            flightState: { motion: 'STABLE' },
            sensorWeights: { compass: 1.0, gyroscope: 0.0, prediction: 0.0 },
            debugInfo: {
              rawCompass: sensorData.compass.heading,
              processedHeading: heading,
              source: 'compass-only'
            }
          };
        }
        
        // 无可用数据时的降级处理
        return {
          heading: fusionCore.lastFusedHeading || 0,
          confidence: 0.1,
          stability: 0.0,
          flightState: { motion: 'UNKNOWN' },
          sensorWeights: { compass: 0.0, gyroscope: 0.0, prediction: 0.0 },
          debugInfo: {
            source: 'fallback',
            reason: 'no-compass-data'
          }
        };
      },
      
      /**
       * 🔧 角度归一化工具
       * @param {Number} angle 角度值
       * @returns {Number} 0-360度范围内的角度
       */
      normalizeAngle: function(angle) {
        if (typeof angle !== 'number' || isNaN(angle)) {
          return 0;
        }
        
        var result = angle % 360;
        if (result < 0) {
          result += 360;
        }
        return result;
      },
      
      /**
       * 🔧 计算指南针置信度
       * @param {Number|String} accuracy 精度值
       * @returns {Number} 置信度 (0-1)
       */
      calculateCompassConfidence: function(accuracy) {
        if (accuracy === undefined || accuracy === null) {
          return 0.8; // 默认置信度
        }
        
        // 数值类型精度处理
        if (typeof accuracy === 'number' && isFinite(accuracy)) {
          // 假设accuracy是方位误差(度)，0最好，≥45°很差
          return Math.max(0.1, 1.0 - Math.min(accuracy, 45) / 45);
        }
        
        // 字符串类型精度处理
        if (typeof accuracy === 'string') {
          var qualityMap = {
            'high': 0.9,
            'medium': 0.6,
            'low': 0.3,
            'unknown': 0.5
          };
          return qualityMap[accuracy.toLowerCase()] || 0.5;
        }
        
        return 0.5; // 默认值
      }
    };
    
    return fusionCore;
  }
};

module.exports = SensorFusionCore;