/**
 * 智能传感器融合算法核心 - 三传感器航向融合
 * 
 * 设计理念：
 * - 多传感器数据质量评估和动态权重分配
 * - 飞行状态自适应的融合策略
 * - 角度专用处理（0°/360°边界）
 * - 预测性航向计算和异常检测
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
      
      // 融合历史数据
      fusionHistory: [],
      maxHistorySize: 20,
      
      // 传感器状态
      sensorStates: {
        compass: { quality: 1.0, reliability: 1.0, lastUpdate: 0 },
        gyroscope: { quality: 1.0, reliability: 1.0, lastUpdate: 0 },
        accelerometer: { quality: 1.0, reliability: 1.0, lastUpdate: 0 }
      },
      
      // 融合状态
      lastFusedHeading: null,
      headingBuffer: [],
      bufferSize: 10,
      
      /**
       * 🧠 核心融合算法 - 智能多传感器航向计算
       * @param {Object} sensorData 传感器数据包
       * @returns {Object} 融合后的航向数据
       */
      fuseHeadingData: function(sensorData) {
        var timestamp = Date.now();
        
        // 1. 数据预处理和质量评估
        var processedData = fusionCore.preprocessSensorData(sensorData, timestamp);
        
        // 2. 飞行状态分析
        var flightState = fusionCore.analyzeFlightState(processedData);
        
        // 3. 传感器可靠性评估
        var reliability = fusionCore.assessSensorReliability(processedData, flightState);
        
        // 4. 动态权重计算
        var weights = fusionCore.calculateDynamicWeights(reliability, flightState);
        
        // 5. 智能融合计算
        var fusedHeading = fusionCore.performIntelligentFusion(processedData, weights, flightState);
        
        // 6. 后处理和稳定性优化
        var finalHeading = fusionCore.postProcessHeading(fusedHeading, flightState);
        
        // 7. 更新历史记录
        fusionCore.updateFusionHistory(finalHeading, processedData, flightState, timestamp);
        
        return {
          heading: finalHeading.value,
          confidence: finalHeading.confidence,
          stability: finalHeading.stability,
          flightState: flightState,
          sensorWeights: weights,
          debugInfo: {
            rawCompass: processedData.compass.heading,
            processedHeading: fusedHeading.value,
            reliability: reliability,
            filterStrength: finalHeading.filterStrength
          }
        };
      },
      
      /**
       * 1️⃣ 数据预处理和质量评估
       * @param {Object} sensorData 原始传感器数据
       * @param {Number} timestamp 时间戳
       * @returns {Object} 预处理后的数据
       */
      preprocessSensorData: function(sensorData, timestamp) {
        var processed = {
          compass: { heading: 0, quality: 0, available: false },
          gyroscope: { angularVelocity: { x: 0, y: 0, z: 0 }, quality: 0, available: false },
          accelerometer: { attitude: {}, quality: 0, available: false },
          timestamp: timestamp
        };
        
        // 处理指南针数据
        if (sensorData.compass && sensorData.compass.heading !== undefined) {
          var heading = fusionCore.normalizeAngle(sensorData.compass.heading);
          processed.compass = {
            heading: heading,
            accuracy: sensorData.compass.accuracy || 0,
            quality: fusionCore.evaluateCompassQuality(heading, sensorData.compass.accuracy),
            available: true
          };
        }
        
        // 处理陀螺仪数据
        if (sensorData.gyroscope && sensorData.gyroscope.angularVelocity) {
          var gyro = sensorData.gyroscope.angularVelocity;
          processed.gyroscope = {
            angularVelocity: gyro,
            turnRate: Math.abs(gyro.z), // Z轴转弯速率
            quality: fusionCore.evaluateGyroscopeQuality(gyro),
            available: true
          };
        }
        
        // 处理加速度计数据
        if (sensorData.accelerometer && sensorData.accelerometer.attitudeState) {
          var attitude = sensorData.accelerometer.attitudeState;
          processed.accelerometer = {
            attitude: attitude,
            compassReliability: attitude.compassReliability || 1.0,
            quality: fusionCore.evaluateAccelerometerQuality(attitude),
            available: true
          };
        }
        
        return processed;
      },
      
      /**
       * 2️⃣ 飞行状态分析
       * @param {Object} processedData 预处理数据
       * @returns {Object} 飞行状态信息
       */
      analyzeFlightState: function(processedData) {
        var state = {
          motion: 'STABLE',
          attitude: 'LEVEL',
          maneuver: 'NONE',
          confidence: 1.0
        };
        
        // 基于陀螺仪分析运动状态
        if (processedData.gyroscope.available) {
          var turnRate = processedData.gyroscope.turnRate;
          if (turnRate > 15) {
            state.motion = 'RAPID_TURN';
            state.maneuver = 'AGGRESSIVE';
          } else if (turnRate > 8) {
            state.motion = 'MODERATE_TURN';
            state.maneuver = 'NORMAL';
          } else if (turnRate > 3) {
            state.motion = 'GENTLE_TURN';
            state.maneuver = 'GENTLE';
          }
        }
        
        // 基于加速度计分析姿态
        if (processedData.accelerometer.available) {
          var attitude = processedData.accelerometer.attitude;
          if (attitude.tiltAngle > 30) {
            state.attitude = 'STEEP_BANK';
          } else if (attitude.tiltAngle > 15) {
            state.attitude = 'MODERATE_BANK';
          } else if (attitude.tiltAngle > 5) {
            state.attitude = 'SLIGHT_BANK';
          }
          
          // 机动检测
          if (attitude.gravityDeviation > 4) {
            state.maneuver = 'HIGH_G';
          }
        }
        
        // 计算整体置信度
        state.confidence = fusionCore.calculateStateConfidence(state, processedData);
        
        return state;
      },
      
      /**
       * 3️⃣ 传感器可靠性评估
       * @param {Object} processedData 预处理数据
       * @param {Object} flightState 飞行状态
       * @returns {Object} 可靠性评估
       */
      assessSensorReliability: function(processedData, flightState) {
        var reliability = {
          compass: 1.0,
          gyroscope: 1.0,
          accelerometer: 1.0
        };
        
        // 指南针可靠性评估
        if (processedData.compass.available) {
          reliability.compass = processedData.compass.quality;
          
          // 姿态影响：倾斜时降低指南针可靠性
          if (processedData.accelerometer.available) {
            reliability.compass *= processedData.accelerometer.compassReliability;
          }
          
          // 机动影响：高机动时降低可靠性
          if (flightState.maneuver === 'AGGRESSIVE') {
            reliability.compass *= 0.6;
          } else if (flightState.maneuver === 'HIGH_G') {
            reliability.compass *= 0.4;
          }
        }
        
        // 陀螺仪可靠性评估（一般比较稳定）
        if (processedData.gyroscope.available) {
          reliability.gyroscope = processedData.gyroscope.quality;
        } else {
          reliability.gyroscope = 0;
        }
        
        // 加速度计可靠性评估
        if (processedData.accelerometer.available) {
          reliability.accelerometer = processedData.accelerometer.quality;
        } else {
          reliability.accelerometer = 0;
        }
        
        return reliability;
      },
      
      /**
       * 4️⃣ 动态权重计算
       * @param {Object} reliability 可靠性评估
       * @param {Object} flightState 飞行状态
       * @returns {Object} 传感器权重
       */
      calculateDynamicWeights: function(reliability, flightState) {
        var weights = {
          compass: 0.8,    // 默认指南针为主
          gyroscope: 0.2,  // 陀螺仪辅助
          prediction: 0.0  // 预测权重
        };
        
        // 根据飞行状态调整权重
        switch (flightState.motion) {
          case 'RAPID_TURN':
            weights.compass = 0.4;
            weights.gyroscope = 0.4;
            weights.prediction = 0.2; // 增加预测权重
            break;
            
          case 'MODERATE_TURN':
            weights.compass = 0.6;
            weights.gyroscope = 0.3;
            weights.prediction = 0.1;
            break;
            
          case 'GENTLE_TURN':
            weights.compass = 0.7;
            weights.gyroscope = 0.25;
            weights.prediction = 0.05;
            break;
            
          default: // STABLE
            weights.compass = 0.85;
            weights.gyroscope = 0.15;
            weights.prediction = 0.0;
        }
        
        // 根据可靠性调整权重
        var reliabilitySum = reliability.compass + reliability.gyroscope;
        if (reliabilitySum > 0) {
          var compassRatio = reliability.compass / reliabilitySum;
          var gyroRatio = reliability.gyroscope / reliabilitySum;
          
          // 重新分配权重，保留预测权重
          var nonPredictionWeight = 1 - weights.prediction;
          weights.compass = compassRatio * nonPredictionWeight;
          weights.gyroscope = gyroRatio * nonPredictionWeight;
        }
        
        // 确保权重归一化
        var totalWeight = weights.compass + weights.gyroscope + weights.prediction;
        if (totalWeight > 0) {
          weights.compass /= totalWeight;
          weights.gyroscope /= totalWeight;
          weights.prediction /= totalWeight;
        }
        
        return weights;
      },
      
      /**
       * 5️⃣ 智能融合计算
       * @param {Object} processedData 预处理数据
       * @param {Object} weights 传感器权重
       * @param {Object} flightState 飞行状态
       * @returns {Object} 融合后的航向
       */
      performIntelligentFusion: function(processedData, weights, flightState) {
        var fusedValue = 0;
        var confidence = 0;
        var contributors = [];
        
        // 指南针贡献
        if (processedData.compass.available && weights.compass > 0) {
          contributors.push({
            value: processedData.compass.heading,
            weight: weights.compass,
            source: 'compass'
          });
          confidence += weights.compass * processedData.compass.quality;
        }
        
        // 陀螺仪预测贡献
        if (processedData.gyroscope.available && weights.gyroscope > 0 && fusionCore.lastFusedHeading !== null) {
          var predictedHeading = fusionCore.predictHeadingFromGyroscope(
            fusionCore.lastFusedHeading,
            processedData.gyroscope.angularVelocity,
            processedData.timestamp
          );
          
          contributors.push({
            value: predictedHeading,
            weight: weights.gyroscope,
            source: 'gyroscope'
          });
          confidence += weights.gyroscope * processedData.gyroscope.quality;
        }
        
        // 历史预测贡献
        if (weights.prediction > 0 && fusionCore.fusionHistory.length > 0) {
          var predictedFromHistory = fusionCore.predictFromHistory();
          contributors.push({
            value: predictedFromHistory,
            weight: weights.prediction,
            source: 'prediction'
          });
          confidence += weights.prediction * 0.8; // 预测置信度稍低
        }
        
        // 加权融合计算（角度专用）
        if (contributors.length > 0) {
          fusedValue = fusionCore.weightedAngleAverage(contributors);
        } else {
          // 降级处理：如果没有可用数据，使用最后已知值
          fusedValue = fusionCore.lastFusedHeading || 0;
          confidence = 0.1;
        }
        
        return {
          value: fusedValue,
          confidence: Math.min(1.0, confidence),
          contributors: contributors
        };
      },
      
      /**
       * 6️⃣ 后处理和稳定性优化
       * @param {Object} fusedHeading 融合后的航向
       * @param {Object} flightState 飞行状态
       * @returns {Object} 最终航向数据
       */
      postProcessHeading: function(fusedHeading, flightState) {
        var finalValue = fusedHeading.value;
        var filterStrength = 0.3; // 默认过滤强度
        
        // 根据飞行状态调整过滤强度
        switch (flightState.motion) {
          case 'RAPID_TURN':
            filterStrength = 0.1; // 快速响应
            break;
          case 'MODERATE_TURN':
            filterStrength = 0.2;
            break;
          case 'GENTLE_TURN':
            filterStrength = 0.25;
            break;
          default: // STABLE
            filterStrength = 0.4; // 强过滤，提高稳定性
        }
        
        // 应用时间加权移动平均
        fusionCore.headingBuffer.push(finalValue);
        if (fusionCore.headingBuffer.length > fusionCore.bufferSize) {
          fusionCore.headingBuffer.shift();
        }
        
        if (fusionCore.headingBuffer.length > 1) {
          var smoothedValue = fusionCore.adaptiveAngleSmoothing(
            fusionCore.headingBuffer,
            filterStrength
          );
          finalValue = smoothedValue;
        }
        
        // 计算稳定性指标
        var stability = fusionCore.calculateHeadingStability();
        
        return {
          value: fusionCore.normalizeAngle(finalValue),
          confidence: fusedHeading.confidence,
          stability: stability,
          filterStrength: filterStrength
        };
      },
      
      /**
       * 🔧 工具函数：角度归一化
       * @param {Number} angle 角度值
       * @returns {Number} 0-360度范围内的角度
       */
      normalizeAngle: function(angle) {
        while (angle < 0) angle += 360;
        while (angle >= 360) angle -= 360;
        return angle;
      },
      
      /**
       * 🔧 工具函数：加权角度平均
       * @param {Array} contributors 贡献者数组 [{value, weight, source}]
       * @returns {Number} 加权平均角度
       */
      weightedAngleAverage: function(contributors) {
        var x = 0, y = 0;
        
        contributors.forEach(function(contributor) {
          var radians = contributor.value * Math.PI / 180;
          x += Math.cos(radians) * contributor.weight;
          y += Math.sin(radians) * contributor.weight;
        });
        
        var result = Math.atan2(y, x) * 180 / Math.PI;
        return fusionCore.normalizeAngle(result);
      },
      
      /**
       * 🔧 工具函数：自适应角度平滑
       * @param {Array} buffer 角度缓冲区
       * @param {Number} strength 平滑强度
       * @returns {Number} 平滑后的角度
       */
      adaptiveAngleSmoothing: function(buffer, strength) {
        if (buffer.length < 2) return buffer[buffer.length - 1];
        
        var weights = [];
        var totalWeight = 0;
        
        // 生成衰减权重（最新数据权重最高）
        for (var i = 0; i < buffer.length; i++) {
          var weight = Math.pow(1 - strength, buffer.length - 1 - i);
          weights.push(weight);
          totalWeight += weight;
        }
        
        // 归一化权重并计算加权平均
        var contributors = buffer.map(function(angle, index) {
          return {
            value: angle,
            weight: weights[index] / totalWeight,
            source: 'buffer'
          };
        });
        
        return fusionCore.weightedAngleAverage(contributors);
      },
      
      /**
       * 🔧 工具函数：从陀螺仪预测航向
       * @param {Number} lastHeading 上次航向
       * @param {Object} angularVelocity 角速度
       * @param {Number} timestamp 时间戳
       * @returns {Number} 预测航向
       */
      predictHeadingFromGyroscope: function(lastHeading, angularVelocity, timestamp) {
        if (!fusionCore.lastFusedHeading || !fusionCore.fusionHistory.length) {
          return lastHeading;
        }
        
        var lastTimestamp = fusionCore.fusionHistory[fusionCore.fusionHistory.length - 1].timestamp;
        var deltaTime = (timestamp - lastTimestamp) / 1000; // 秒
        
        // Z轴角速度转换为航向变化（度/秒）
        var headingChange = angularVelocity.z * deltaTime;
        
        return fusionCore.normalizeAngle(lastHeading + headingChange);
      },
      
      /**
       * 🔧 工具函数：从历史预测
       * @returns {Number} 预测航向
       */
      predictFromHistory: function() {
        if (fusionCore.fusionHistory.length < 3) {
          return fusionCore.lastFusedHeading || 0;
        }
        
        // 简单线性预测
        var recent = fusionCore.fusionHistory.slice(-3);
        var trends = [];
        
        for (var i = 1; i < recent.length; i++) {
          var angleDiff = recent[i].heading - recent[i-1].heading;
          // 处理角度跨越
          if (angleDiff > 180) angleDiff -= 360;
          if (angleDiff < -180) angleDiff += 360;
          trends.push(angleDiff);
        }
        
        var avgTrend = trends.reduce(function(sum, trend) {
          return sum + trend;
        }, 0) / trends.length;
        
        return fusionCore.normalizeAngle(fusionCore.lastFusedHeading + avgTrend);
      },
      
      /**
       * 🔧 质量评估函数
       */
      evaluateCompassQuality: function(heading, accuracy) {
        var quality = 1.0;
        if (accuracy && accuracy > 50) {
          quality = Math.max(0.1, 1.0 - (accuracy - 50) / 100);
        }
        return quality;
      },
      
      evaluateGyroscopeQuality: function(angularVelocity) {
        // 陀螺仪一般比较可靠，主要检查数据是否合理
        var totalRate = Math.sqrt(
          angularVelocity.x * angularVelocity.x +
          angularVelocity.y * angularVelocity.y +
          angularVelocity.z * angularVelocity.z
        );
        return totalRate < 360 ? 1.0 : 0.5; // 超过360度/秒可能异常
      },
      
      evaluateAccelerometerQuality: function(attitude) {
        return attitude.isStable ? 1.0 : 0.7;
      },
      
      /**
       * 计算航向稳定性
       * @returns {Number} 稳定性指标 (0-1)
       */
      calculateHeadingStability: function() {
        if (fusionCore.headingBuffer.length < 5) return 0.5;
        
        var variations = [];
        for (var i = 1; i < fusionCore.headingBuffer.length; i++) {
          var diff = Math.abs(fusionCore.headingBuffer[i] - fusionCore.headingBuffer[i-1]);
          if (diff > 180) diff = 360 - diff; // 处理角度跨越
          variations.push(diff);
        }
        
        var avgVariation = variations.reduce(function(sum, v) {
          return sum + v;
        }, 0) / variations.length;
        
        // 变化越小，稳定性越高
        return Math.max(0, 1.0 - avgVariation / 30);
      },
      
      /**
       * 计算状态置信度
       * @param {Object} state 状态
       * @param {Object} processedData 处理后的数据
       * @returns {Number} 置信度
       */
      calculateStateConfidence: function(state, processedData) {
        var confidence = 1.0;
        
        // 基于可用传感器数量
        var availableSensors = 0;
        if (processedData.compass.available) availableSensors++;
        if (processedData.gyroscope.available) availableSensors++;
        if (processedData.accelerometer.available) availableSensors++;
        
        confidence *= availableSensors / 3.0;
        
        return Math.max(0.1, confidence);
      },
      
      /**
       * 更新融合历史
       * @param {Object} finalHeading 最终航向
       * @param {Object} processedData 处理后的数据
       * @param {Object} flightState 飞行状态
       * @param {Number} timestamp 时间戳
       */
      updateFusionHistory: function(finalHeading, processedData, flightState, timestamp) {
        fusionCore.lastFusedHeading = finalHeading.value;
        
        fusionCore.fusionHistory.push({
          heading: finalHeading.value,
          confidence: finalHeading.confidence,
          stability: finalHeading.stability,
          flightState: flightState,
          timestamp: timestamp
        });
        
        if (fusionCore.fusionHistory.length > fusionCore.maxHistorySize) {
          fusionCore.fusionHistory.shift();
        }
      }
    };
    
    return fusionCore;
  }
};

module.exports = SensorFusionCore;