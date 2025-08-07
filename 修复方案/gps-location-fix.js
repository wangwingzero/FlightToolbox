/**
 * GPS定位策略优化方案
 * 解决：检测到网络定位，分析GPS环境
 * 优化航空应用的GPS准确性
 */

// 1. 增强的GPS获取策略（替换gps-manager.js中的相关方法）
attemptGPSLocation: function(attemptCount) {
  var self = this;
  var maxAttempts = 4; // 增加到4次尝试
  var isLastAttempt = attemptCount >= maxAttempts - 1;
  
  console.log('🛰️ GPS获取尝试 ' + (attemptCount + 1) + '/' + maxAttempts);
  
  // 🔧 关键优化：根据尝试次数调整策略
  var locationConfig = this.getOptimalLocationConfig(attemptCount, isLastAttempt);
  
  this.updateDebugInfo({
    gpsAttemptCount: attemptCount + 1,
    gpsStatus: locationConfig.statusText,
    gpsStrategy: locationConfig.strategy
  });
  
  wx.getLocation({
    type: locationConfig.type,
    altitude: true,
    isHighAccuracy: locationConfig.isHighAccuracy,
    highAccuracyExpireTime: locationConfig.timeout,
    success: function(res) {
      console.log('✅ GPS位置获取成功:', res);
      
      // 🔧 优化：更严格的GPS检测
      var locationQuality = self.assessLocationQuality(res);
      console.log('📊 定位质量评估:', locationQuality);
      
      if (locationQuality.isGPSBased && locationQuality.quality >= 3) {
        // 高质量GPS定位
        console.log('🎯 获得高质量GPS定位');
        self.updateDebugInfo({
          gpsStatus: '高质量GPS定位',
          locationQuality: locationQuality.quality + '/5'
        });
        self.handleLocationUpdate(res);
        
      } else if (locationQuality.quality >= 2 && isLastAttempt) {
        // 中等质量且是最后一次尝试
        console.log('⚠️ 中等质量定位，但已是最后尝试');
        self.updateDebugInfo({
          gpsStatus: '中等质量定位',
          locationQuality: locationQuality.quality + '/5'
        });
        self.handleLocationUpdate(res);
        self.showLocationQualityWarning(locationQuality);
        
      } else {
        // 质量不佳，继续重试
        if (attemptCount < maxAttempts - 1) {
          console.log('🔄 定位质量不佳，继续重试');
          self.updateDebugInfo({
            gpsStatus: '定位质量不佳，重试中...'
          });
          setTimeout(function() {
            self.attemptGPSLocation(attemptCount + 1);
          }, self.getRetryDelay(attemptCount));
        } else {
          // 最后尝试也失败
          console.warn('❌ 所有GPS尝试均未获得理想结果');
          self.handleLocationUpdate(res);
          self.showLocationQualityWarning(locationQuality);
        }
      }
    },
    fail: function(err) {
      console.warn('⚠️ GPS获取失败 (尝试' + (attemptCount + 1) + '):', err);
      
      if (attemptCount < maxAttempts - 1) {
        setTimeout(function() {
          self.attemptGPSLocation(attemptCount + 1);
        }, self.getRetryDelay(attemptCount));
      } else {
        self.handleGPSFailure(err);
      }
    }
  });
},

// 2. 获取最优定位配置
getOptimalLocationConfig: function(attemptCount, isLastAttempt) {
  var configs = [
    {
      // 第1次：激进GPS模式
      type: 'wgs84',
      isHighAccuracy: true,
      timeout: 15000,
      strategy: 'Pure GPS',
      statusText: '纯GPS模式搜索中...'
    },
    {
      // 第2次：高精度模式
      type: 'wgs84', 
      isHighAccuracy: true,
      timeout: 12000,
      strategy: 'High Accuracy GPS',
      statusText: '高精度GPS搜索...'
    },
    {
      // 第3次：兼容模式
      type: 'gcj02',
      isHighAccuracy: true,
      timeout: 10000,
      strategy: 'Compatible Mode',
      statusText: '兼容模式定位...'
    },
    {
      // 第4次：宽容模式
      type: 'gcj02',
      isHighAccuracy: false,
      timeout: 8000,
      strategy: 'Tolerant Mode',
      statusText: '宽容模式定位...'
    }
  ];
  
  return configs[attemptCount] || configs[configs.length - 1];
},

// 3. 定位质量评估
assessLocationQuality: function(locationData) {
  var quality = {
    isGPSBased: false,
    quality: 0, // 0-5分
    issues: [],
    recommendations: []
  };
  
  // 检查定位提供商
  if (locationData.provider === 'gps' || locationData.provider === 'satellite') {
    quality.isGPSBased = true;
    quality.quality += 2;
  } else if (locationData.provider === 'network') {
    quality.issues.push('使用网络定位');
    quality.recommendations.push('移动到空旷地带获得GPS信号');
  }
  
  // 检查精度
  if (locationData.accuracy) {
    if (locationData.accuracy <= 10) {
      quality.quality += 2; // 高精度
    } else if (locationData.accuracy <= 30) {
      quality.quality += 1; // 中等精度
    } else {
      quality.issues.push('精度较低(' + Math.round(locationData.accuracy) + 'm)');
      quality.recommendations.push('等待GPS信号稳定');
    }
  }
  
  // 检查高度数据
  if (locationData.altitude !== null && locationData.altitude !== undefined) {
    if (locationData.altitude !== 0) {
      quality.quality += 1; // 有有效高度数据
    } else {
      quality.issues.push('高度数据为0');
    }
  } else {
    quality.issues.push('缺少高度数据');
    quality.recommendations.push('GPS信号可能被遮挡');
  }
  
  // 限制最高分
  quality.quality = Math.min(5, quality.quality);
  
  return quality;
},

// 4. 重试延迟策略
getRetryDelay: function(attemptCount) {
  var delays = [2000, 3000, 4000, 5000]; // 渐进延迟
  return delays[attemptCount] || 5000;
},

// 5. 显示定位质量警告
showLocationQualityWarning: function(locationQuality) {
  if (locationQuality.quality < 3 && locationQuality.issues.length > 0) {
    var warningMessage = '定位质量：' + locationQuality.quality + '/5分\n\n';
    warningMessage += '问题：\n' + locationQuality.issues.map(issue => '• ' + issue).join('\n');
    
    if (locationQuality.recommendations.length > 0) {
      warningMessage += '\n\n建议：\n' + locationQuality.recommendations.map(rec => '• ' + rec).join('\n');
    }
    
    if (this.page && this.page.safeSetData) {
      this.page.safeSetData({
        showGPSWarning: true,
        gpsWarningTitle: '🛰️ GPS定位质量警告',
        gpsWarningMessage: warningMessage,
        debugPanelExpanded: true
      });
    }
  }
},

// 6. 处理GPS完全失败的情况
handleGPSFailure: function(error) {
  console.error('❌ GPS获取完全失败:', error);
  
  this.updateDebugInfo({
    gpsStatus: 'GPS获取失败'
  });
  
  // 根据错误类型提供具体建议
  var errorMessage = 'GPS定位失败';
  var suggestions = [];
  
  if (error.errMsg.includes('timeout')) {
    errorMessage = 'GPS信号搜索超时';
    suggestions = [
      '移动到窗边或室外',
      '等待几分钟让GPS冷启动',
      '检查设备定位服务是否开启'
    ];
  } else if (error.errMsg.includes('denied')) {
    errorMessage = 'GPS权限被拒绝';
    suggestions = [
      '在设置中开启位置权限',
      '重新启动应用',
      '检查系统定位服务'
    ];
  } else if (error.errMsg.includes('NOCELL')) {
    errorMessage = '设备定位服务未开启';
    suggestions = [
      '开启设备定位服务',
      '检查飞行模式设置',
      '重启设备定位功能'
    ];
  }
  
  var fullMessage = errorMessage;
  if (suggestions.length > 0) {
    fullMessage += '\n\n解决方法：\n' + suggestions.map(s => '• ' + s).join('\n');
  }
  
  this.updateStatus('GPS失败 - ' + errorMessage);
  this.handleError({
    code: 'GPS_COMPLETE_FAILURE',
    message: fullMessage,
    details: error
  });
}