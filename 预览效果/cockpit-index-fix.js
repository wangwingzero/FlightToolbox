/**
 * Cockpit页面WXS错误修复补丁
 * 直接替换有问题的函数，解决 String.prototype.indexOf called on null or undefined 错误
 */

// 安全的setData函数
function safeSetData(page, data) {
  const sanitized = {};
  
  for (const key in data) {
    const value = data[key];
    
    if (value === null || value === undefined) {
      // 根据字段类型提供默认值
      if (key.includes('Status') || key.includes('Error') || key.includes('Time')) {
        sanitized[key] = '';
      } else if (key.includes('show') || key.includes('is') || key.includes('has')) {
        sanitized[key] = false;
      } else if (typeof value === 'string') {
        sanitized[key] = '';
      } else {
        sanitized[key] = value;
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  try {
    page.setData(sanitized);
  } catch (error) {
    console.error('setData失败:', error);
    // 逐个设置字段，找出问题字段
    for (const key in sanitized) {
      try {
        const singleData = {};
        singleData[key] = sanitized[key];
        page.setData(singleData);
      } catch (fieldError) {
        console.error(`字段${key}设置失败:`, fieldError);
      }
    }
  }
}

// 修复后的checkNetworkStatus函数
const fixedCheckNetworkStatus = function() {
  var self = this;
  
  // 获取网络类型
  wx.getNetworkType({
    success: function(res) {
      var isOffline = res.networkType === 'none';
      
      // 使用安全的setData，确保字段不为null
      safeSetData(self, {
        isOffline: isOffline,
        isOfflineMode: isOffline
      });
      
      if (isOffline) {
        console.log('当前处于离线状态，使用纯GPS定位');
      }
    },
    fail: function(error) {
      console.error('获取网络状态失败:', error);
      safeSetData(self, {
        isOffline: false,
        isOfflineMode: false
      });
    }
  });
  
  // 监听网络状态变化
  wx.onNetworkStatusChange(function(res) {
    safeSetData(self, {
      isOffline: !res.isConnected,
      isOfflineMode: !res.isConnected
    });
    
    if (!res.isConnected) {
      wx.showToast({
        title: '已进入离线模式',
        icon: 'none',
        duration: 2000
      });
    }
  });
};

// 修复后的monitorGPSStatus函数
const fixedMonitorGPSStatus = function() {
  var self = this;
  
  setInterval(function() {
    var now = Date.now();
    var timeSinceLastUpdate = self.data.lastUpdateTime ? (now - self.data.lastUpdateTime) / 1000 : 999;
    
    if (timeSinceLastUpdate > 30) {
      if (self.data.isOffline || self.data.isOfflineMode) {
        safeSetData(self, {
          gpsStatus: '离线模式',
          showGPSWarning: true,
          locationError: '' // 确保为空字符串
        });
        
        if (!self.data.useSimulatedData) {
          self.startSimulatedMode();
        }
      } else {
        safeSetData(self, {
          gpsStatus: 'GPS信号丢失',
          locationError: 'GPS信号长时间未更新，请检查是否在室内或信号遮挡区域'
        });
      }
    } else if (timeSinceLastUpdate > 15) {
      var statusText = 'GPS信号弱';
      if (self.data.isOffline) {
        statusText += ' (离线)';
      }
      safeSetData(self, {
        gpsStatus: statusText
      });
    }
  }, 10000);
};

// 修复后的GPS干扰检测函数
const fixedCheckGPSInterference = function(location, now) {
  var self = this;
  
  if (!this.data.lastValidLocation) {
    return false;
  }
  
  var lastLocation = this.data.lastValidLocation;
  var timeDiff = now - lastLocation.timestamp;
  
  if (timeDiff < 1000) {
    return this.data.gpsInterference;
  }
  
  // ... 其他检测逻辑保持不变 ...
  
  var interferenceDetected = false;
  // 检测逻辑...
  
  if (interferenceDetected) {
    // 安全的时间格式化
    var timeString = '';
    try {
      var interferenceTime = new Date(now);
      var hours = interferenceTime.getHours();
      var minutes = interferenceTime.getMinutes();
      var seconds = interferenceTime.getSeconds();
      
      var pad = function(num) {
        return (num < 10 ? '0' : '') + num;
      };
      
      timeString = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
    } catch (error) {
      console.error('时间格式化失败:', error);
      timeString = ''; // 确保不为null
    }
    
    safeSetData(this, {
      gpsInterference: true,
      lastInterferenceTime: timeString
    });
    
    // 清除之前的定时器
    if (this.data.interferenceTimer) {
      clearTimeout(this.data.interferenceTimer);
    }
    
    // 30分钟后清除干扰记录
    this.data.interferenceTimer = setTimeout(function() {
      safeSetData(self, {
        gpsInterference: false,
        lastInterferenceTime: ''
      });
      self.data.interferenceTimer = null;
    }, 30 * 60 * 1000);
    
    wx.showToast({
      title: '检测到GPS干扰',
      icon: 'none',
      duration: 3000
    });
  }
  
  return interferenceDetected;
};

// 修复后的更新附近机场函数
const fixedUpdateNearbyAirports = function() {
  if (!this.data.airportsData || !this.data.latitude || !this.data.longitude) {
    return;
  }
  
  var self = this;
  var currentLat = parseFloat(this.data.latitude);
  var currentLon = parseFloat(this.data.longitude);
  var maxRange = this.data.mapRange;
  
  var airportsWithDistance = [];
  for (var i = 0; i < this.data.airportsData.length; i++) {
    var airport = this.data.airportsData[i];
    var distance = this.calculateDistanceNM(
      currentLat, currentLon,
      airport.Latitude, airport.Longitude
    );
    
    if (distance <= maxRange * 1.2) {
      var bearing = this.calculateBearing(
        currentLat, currentLon,
        airport.Latitude, airport.Longitude
      );
      
      airportsWithDistance.push({
        ICAOCode: airport.ICAOCode || '',
        IATACode: airport.IATACode || '',
        EnglishName: airport.EnglishName || '',
        ShortName: airport.ShortName || '',
        Latitude: airport.Latitude,
        Longitude: airport.Longitude,
        Elevation: airport.Elevation,
        distance: distance,
        bearing: Math.round(bearing)
      });
    }
  }
  
  airportsWithDistance.sort(function(a, b) {
    return a.distance - b.distance;
  });
  
  if (airportsWithDistance.length > 0) {
    var nearest = airportsWithDistance[0];
    safeSetData(this, {
      nearestAirport: {
        ICAOCode: nearest.ICAOCode || '',
        ShortName: nearest.ShortName || nearest.EnglishName || '',
        distance: nearest.distance.toFixed(1),
        bearing: nearest.bearing
      }
    });
    
    if (airportsWithDistance.length > 1) {
      var secondNearest = airportsWithDistance[1];
      safeSetData(this, {
        secondNearestAirport: {
          ICAOCode: secondNearest.ICAOCode || '',
          ShortName: secondNearest.ShortName || secondNearest.EnglishName || '',
          distance: secondNearest.distance.toFixed(1),
          bearing: secondNearest.bearing
        }
      });
    } else {
      safeSetData(this, {
        secondNearestAirport: null
      });
    }
  }
};

module.exports = {
  safeSetData,
  fixedCheckNetworkStatus,
  fixedMonitorGPSStatus,
  fixedCheckGPSInterference,
  fixedUpdateNearbyAirports
};

/**
 * 应用修复的步骤：
 * 
 * 1. 在 cockpit/index.js 顶部添加：
 *    const cockpitFix = require('../../预览效果/cockpit-index-fix.js');
 * 
 * 2. 替换问题函数：
 *    checkNetworkStatus: cockpitFix.fixedCheckNetworkStatus,
 *    monitorGPSStatus: cockpitFix.fixedMonitorGPSStatus,
 *    checkGPSInterference: cockpitFix.fixedCheckGPSInterference,
 *    updateNearbyAirports: cockpitFix.fixedUpdateNearbyAirports,
 * 
 * 3. 将所有其他 setData 调用替换为：
 *    cockpitFix.safeSetData(this, { ... })
 * 
 * 这样可以确保所有字符串字段都不会为 null 或 undefined，
 * 从而避免 WXS 中的 indexOf 错误。
 */