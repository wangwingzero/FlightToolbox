/**
 * GPS数据质量评估器 v1.0
 * 
 * 专门负责GPS数据质量分析和自适应处理
 * 
 * 核心功能：
 * - GPS数据质量实时评估
 * - 异常数据检测和过滤
 * - 自适应处理策略
 * - 数据一致性验证
 * - 性能优化的轻量级算法
 * 
 * 设计原则：
 * - 轻量级算法，最小化计算开销
 * - 实时处理，无延迟
 * - 自适应调整，根据数据质量动态优化
 * - 可配置阈值，支持不同精度要求
 */

var GPSQualityAssessor = {
  /**
   * 创建GPS质量评估器实例
   * @param {Object} config 配置参数
   * @returns {Object} 评估器实例
   */
  create: function(config) {
    var assessor = {
      // 质量历史记录
      qualityHistory: [],
      anomalyCounter: 0,
      consecutiveGoodCount: 0,
      
      // 统计数据
      stats: {
        totalUpdates: 0,
        goodUpdates: 0,
        anomalousUpdates: 0,
        avgAccuracy: 0,
        avgReliability: 0
      },
      
      /**
       * 评估GPS数据质量
       * @param {Object} location GPS位置数据
       * @param {Object} previousLocation 上一次位置数据（可选）
       * @returns {Object} 质量评估结果
       */
      assess: function(location, previousLocation) {
        var quality = {
          accuracy: location.accuracy || 999,
          reliability: 0,
          confidence: 1.0,
          isReasonable: true,
          hasAltitude: location.altitude !== undefined && location.altitude !== null,
          anomalies: [],
          recommendation: 'use' // use, filter, reject
        };
        
        // 1. 基础精度评估
        quality = assessor.assessAccuracy(quality, location);
        
        // 2. 数据合理性检查
        quality = assessor.checkReasonableness(quality, location, previousLocation);
        
        // 3. 一致性验证
        quality = assessor.validateConsistency(quality, location);
        
        // 4. 计算综合可靠性
        quality = assessor.calculateReliability(quality);
        
        // 5. 生成处理建议
        quality = assessor.generateRecommendation(quality);
        
        // 6. 更新统计信息
        assessor.updateStats(quality);
        
        // 7. 更新质量历史
        assessor.updateQualityHistory(quality);
        
        return quality;
      },
      
      /**
       * 评估GPS精度
       * @param {Object} quality 质量对象
       * @param {Object} location GPS数据
       * @returns {Object} 更新后的质量对象
       */
      assessAccuracy: function(quality, location) {
        var accuracy = quality.accuracy;
        
        // 基于精度分级
        if (accuracy <= 5) {
          quality.accuracyGrade = 'excellent';
          quality.accuracyScore = 1.0;
        } else if (accuracy <= 10) {
          quality.accuracyGrade = 'good';
          quality.accuracyScore = 0.9;
        } else if (accuracy <= 20) {
          quality.accuracyGrade = 'fair';
          quality.accuracyScore = 0.7;
        } else if (accuracy <= 50) {
          quality.accuracyGrade = 'poor';
          quality.accuracyScore = 0.5;
        } else {
          quality.accuracyGrade = 'very_poor';
          quality.accuracyScore = 0.2;
        }
        
        // 检查精度异常
        if (accuracy > config.gps.accuracyThreshold) {
          quality.anomalies.push({
            type: 'low_accuracy',
            severity: accuracy > config.gps.accuracyThreshold * 2 ? 'high' : 'medium',
            value: accuracy,
            threshold: config.gps.accuracyThreshold
          });
        }
        
        return quality;
      },
      
      /**
       * 检查数据合理性
       * @param {Object} quality 质量对象
       * @param {Object} location 当前GPS数据
       * @param {Object} previousLocation 上一次GPS数据
       * @returns {Object} 更新后的质量对象
       */
      checkReasonableness: function(quality, location, previousLocation) {
        // 1. 速度合理性检查
        if (location.speed !== undefined && location.speed !== null) {
          if (location.speed > config.gps.maxReasonableSpeed) {
            quality.anomalies.push({
              type: 'excessive_speed',
              severity: 'high',
              value: location.speed,
              threshold: config.gps.maxReasonableSpeed
            });
            quality.isReasonable = false;
          }
        }
        
        // 2. 高度合理性检查
        if (location.altitude !== undefined && location.altitude !== null) {
          if (location.altitude < config.gps.minValidAltitude || 
              location.altitude > config.gps.maxValidAltitude) {
            quality.anomalies.push({
              type: 'invalid_altitude',
              severity: 'medium',
              value: location.altitude,
              range: [config.gps.minValidAltitude, config.gps.maxValidAltitude]
            });
          }
        }
        
        // 3. 位置跳变检查
        if (previousLocation) {
          var distance = assessor.calculateDistance(
            previousLocation.latitude, previousLocation.longitude,
            location.latitude, location.longitude
          );
          
          var timeDiff = (Date.now() - (previousLocation.timestamp || Date.now())) / 1000;
          
          if (timeDiff > 0 && timeDiff < 60) { // 1分钟内的更新
            var maxPossibleDistance = config.gps.maxReasonableSpeed * 0.514 * timeDiff; // 转换为米
            
            if (distance > maxPossibleDistance * 1.5) { // 1.5倍容差
              quality.anomalies.push({
                type: 'position_jump',
                severity: 'high',
                distance: distance,
                maxPossible: maxPossibleDistance,
                timeDiff: timeDiff
              });
              quality.isReasonable = false;
            }
          }
        }
        
        return quality;
      },
      
      /**
       * 验证数据一致性
       * @param {Object} quality 质量对象
       * @param {Object} location GPS数据
       * @returns {Object} 更新后的质量对象
       */
      validateConsistency: function(quality, location) {
        if (assessor.qualityHistory.length < 3) {
          return quality; // 数据不足，跳过一致性检查
        }
        
        var recentQualities = assessor.qualityHistory.slice(-3);
        var accuracies = recentQualities.map(function(q) { return q.accuracy; });
        
        // 计算精度方差
        var avgAccuracy = accuracies.reduce(function(sum, acc) { return sum + acc; }, 0) / accuracies.length;
        var variance = accuracies.reduce(function(sum, acc) { 
          return sum + Math.pow(acc - avgAccuracy, 2); 
        }, 0) / accuracies.length;
        var stdDev = Math.sqrt(variance);
        
        // 检查精度一致性
        if (stdDev > avgAccuracy * 0.5) { // 标准差超过平均精度的50%
          quality.anomalies.push({
            type: 'accuracy_inconsistency',
            severity: 'medium',
            stdDev: stdDev,
            avgAccuracy: avgAccuracy
          });
        }
        
        // 检查异常频率
        var recentAnomalies = recentQualities.filter(function(q) { 
          return q.anomalies && q.anomalies.length > 0; 
        });
        
        if (recentAnomalies.length >= 2) { // 最近3次中有2次异常
          quality.anomalies.push({
            type: 'frequent_anomalies',
            severity: 'medium',
            frequency: recentAnomalies.length / recentQualities.length
          });
        }
        
        return quality;
      },
      
      /**
       * 计算综合可靠性
       * @param {Object} quality 质量对象
       * @returns {Object} 更新后的质量对象
       */
      calculateReliability: function(quality) {
        var reliability = quality.accuracyScore;
        
        // 基于异常数量调整可靠性
        if (quality.anomalies.length > 0) {
          var anomalyPenalty = 0;
          
          quality.anomalies.forEach(function(anomaly) {
            switch (anomaly.severity) {
              case 'high':
                anomalyPenalty += 0.4;
                break;
              case 'medium':
                anomalyPenalty += 0.2;
                break;
              case 'low':
                anomalyPenalty += 0.1;
                break;
            }
          });
          
          reliability = Math.max(0.1, reliability - anomalyPenalty);
        }
        
        // 基于历史表现调整
        if (assessor.stats.totalUpdates > 10) {
          var historicalReliability = assessor.stats.goodUpdates / assessor.stats.totalUpdates;
          reliability = reliability * 0.7 + historicalReliability * 0.3; // 加权平均
        }
        
        // 连续良好更新奖励
        if (assessor.consecutiveGoodCount > 5) {
          reliability = Math.min(1.0, reliability + 0.1);
        }
        
        quality.reliability = Math.max(0.1, Math.min(1.0, reliability));
        quality.confidence = quality.reliability;
        
        return quality;
      },
      
      /**
       * 生成处理建议
       * @param {Object} quality 质量对象
       * @returns {Object} 更新后的质量对象
       */
      generateRecommendation: function(quality) {
        if (quality.reliability >= 0.8 && quality.isReasonable) {
          quality.recommendation = 'use';
          quality.priority = 'high';
        } else if (quality.reliability >= 0.5 && quality.anomalies.length <= 1) {
          quality.recommendation = 'use_with_caution';
          quality.priority = 'medium';
        } else if (quality.reliability >= 0.3) {
          quality.recommendation = 'filter';
          quality.priority = 'low';
        } else {
          quality.recommendation = 'reject';
          quality.priority = 'very_low';
        }
        
        // 生成具体建议
        quality.suggestions = [];
        
        if (quality.accuracy > 20) {
          quality.suggestions.push('增加GPS更新频率以提高精度');
        }
        
        if (quality.anomalies.length > 2) {
          quality.suggestions.push('启用卡尔曼滤波以减少噪声');
        }
        
        if (!quality.hasAltitude) {
          quality.suggestions.push('尝试重新获取包含高度的GPS数据');
        }
        
        return quality;
      },
      
      /**
       * 更新统计信息
       * @param {Object} quality 质量评估结果
       */
      updateStats: function(quality) {
        assessor.stats.totalUpdates++;
        
        if (quality.reliability >= 0.7) {
          assessor.stats.goodUpdates++;
          assessor.consecutiveGoodCount++;
        } else {
          assessor.consecutiveGoodCount = 0;
        }
        
        if (quality.anomalies.length > 0) {
          assessor.stats.anomalousUpdates++;
          assessor.anomalyCounter++;
        } else {
          assessor.anomalyCounter = Math.max(0, assessor.anomalyCounter - 1);
        }
        
        // 计算平均值
        assessor.stats.avgAccuracy = (assessor.stats.avgAccuracy * (assessor.stats.totalUpdates - 1) + quality.accuracy) / assessor.stats.totalUpdates;
        assessor.stats.avgReliability = (assessor.stats.avgReliability * (assessor.stats.totalUpdates - 1) + quality.reliability) / assessor.stats.totalUpdates;
      },
      
      /**
       * 更新质量历史记录
       * @param {Object} quality 质量评估结果
       */
      updateQualityHistory: function(quality) {
        var historyItem = {
          accuracy: quality.accuracy,
          reliability: quality.reliability,
          anomalies: quality.anomalies,
          timestamp: Date.now()
        };
        
        assessor.qualityHistory.push(historyItem);
        
        // 限制历史记录大小
        if (assessor.qualityHistory.length > 20) {
          assessor.qualityHistory.shift();
        }
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
        var R = 6371000; // 地球半径（米）
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      },
      
      /**
       * 获取质量统计信息
       * @returns {Object} 统计信息
       */
      getStats: function() {
        return {
          totalUpdates: assessor.stats.totalUpdates,
          goodUpdates: assessor.stats.goodUpdates,
          anomalousUpdates: assessor.stats.anomalousUpdates,
          goodRate: assessor.stats.totalUpdates > 0 ? (assessor.stats.goodUpdates / assessor.stats.totalUpdates) : 0,
          avgAccuracy: assessor.stats.avgAccuracy,
          avgReliability: assessor.stats.avgReliability,
          consecutiveGoodCount: assessor.consecutiveGoodCount,
          anomalyCounter: assessor.anomalyCounter
        };
      },
      
      /**
       * 重置评估器状态
       */
      reset: function() {
        assessor.qualityHistory = [];
        assessor.anomalyCounter = 0;
        assessor.consecutiveGoodCount = 0;
        assessor.stats = {
          totalUpdates: 0,
          goodUpdates: 0,
          anomalousUpdates: 0,
          avgAccuracy: 0,
          avgReliability: 0
        };
        
        console.log('GPS质量评估器已重置');
      },
      
      /**
       * 获取最近的质量趋势
       * @param {Number} count 获取最近多少次记录
       * @returns {Object} 趋势分析
       */
      getQualityTrend: function(count) {
        count = count || 10;
        var recentHistory = assessor.qualityHistory.slice(-count);
        
        if (recentHistory.length < 2) {
          return { trend: 'insufficient_data' };
        }
        
        var accuracies = recentHistory.map(function(h) { return h.accuracy; });
        var reliabilities = recentHistory.map(function(h) { return h.reliability; });
        
        var avgAccuracy = accuracies.reduce(function(sum, acc) { return sum + acc; }, 0) / accuracies.length;
        var avgReliability = reliabilities.reduce(function(sum, rel) { return sum + rel; }, 0) / reliabilities.length;
        
        // 简单趋势分析
        var firstHalf = recentHistory.slice(0, Math.floor(recentHistory.length / 2));
        var secondHalf = recentHistory.slice(Math.floor(recentHistory.length / 2));
        
        var firstHalfAvgReliability = firstHalf.reduce(function(sum, h) { 
          return sum + h.reliability; 
        }, 0) / firstHalf.length;
        
        var secondHalfAvgReliability = secondHalf.reduce(function(sum, h) { 
          return sum + h.reliability; 
        }, 0) / secondHalf.length;
        
        var trend = 'stable';
        if (secondHalfAvgReliability > firstHalfAvgReliability + 0.1) {
          trend = 'improving';
        } else if (secondHalfAvgReliability < firstHalfAvgReliability - 0.1) {
          trend = 'degrading';
        }
        
        return {
          trend: trend,
          avgAccuracy: avgAccuracy,
          avgReliability: avgReliability,
          dataPoints: recentHistory.length,
          reliabilityChange: secondHalfAvgReliability - firstHalfAvgReliability
        };
      }
    };
    
    return assessor;
  }
};

module.exports = GPSQualityAssessor;