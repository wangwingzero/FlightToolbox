var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    // GPS数据
    latitude: 0,
    longitude: 0,
    altitude: 0,
    speed: 0,
    heading: 0,
    verticalSpeed: 0,
    
    // 离线模式支持
    isOfflineMode: false,      // 是否在离线模式
    useSimulatedData: false,   // 是否使用模拟数据
    showGPSWarning: false,     // 是否显示GPS警告(非阻塞)
    
    // GPS过滤参数
    maxReasonableSpeed: 600,    // 最大合理速度(kt)
    maxAcceleration: 50,        // 最大加速度(kt/s)
    speedBuffer: [],            // 速度缓冲区，用于平滑
    speedBufferSize: 5,         // 速度缓冲区大小
    lastValidSpeed: 0,          // 上次有效速度
    lastValidPosition: null,    // 上次有效位置
    anomalyCount: 0,            // 连续异常计数
    maxAnomalyCount: 3,         // 最大连续异常次数
    
    // 位置历史记录（用于计算速度和航向）
    locationHistory: [],
    maxHistorySize: 10,
    
    // 航向平滑处理
    headingBuffer: [],        // 航向历史缓冲区
    headingBufferSize: 15,    // 缓冲区大小（增大以提高稳定性）
    lastStableHeading: 0,     // 上次稳定的航向值
    headingBaseThreshold: 8,  // 基础变化阈值（度），降低敏感性
    headingLowSpeedThreshold: 20, // 低速时的变化阈值（度）
    headingStability: 0,      // 航向稳定度计数器
    lastHeadingUpdateTime: 0, // 上次更新时间
    minHeadingUpdateInterval: 2000, // 最小更新间隔（毫秒），增加到2秒
    requiredStabilityCount: 5, // 需要连续确认的次数，增加稳定性要求
    
    // 航向/航迹模式
    headingMode: 'heading',   // 'heading' 或 'track'
    track: 0,                 // 航迹角度
    lastValidTrack: 0,        // 上次有效的航迹
    minSpeedForTrack: 3,      // 最小速度阈值（kt），低于此速度保持之前航迹
    
    // 更新定时器
    updateTimer: null,
    
    // 权限状态
    hasLocationPermission: false,
    locationError: null,
    
    // GPS状态
    gpsStatus: '初始化中',  // GPS状态文字
    isOffline: false,      // 是否离线
    lastUpdateTime: 0,     // 上次更新时间
    updateCount: 0,        // 更新计数器
    
    // GPS干扰检测
    gpsInterference: false,     // 是否检测到GPS干扰
    lastInterferenceTime: null, // 上次干扰时间
    interferenceTimer: null,    // 干扰清除定时器
    lastValidLocation: null,    // 上次有效位置
    
    // 干扰检测参数
    positionThreshold: 0.5,     // 经纬度变化阈值（约55公里）- 极限阈值
    altitudeThreshold: 3000,    // 高度变化阈值（米）- 极限阈值
    timeThreshold: 5000,        // 时间阈值（毫秒）
    
    // 连续性检测参数
    changeHistory: [],          // 变化历史记录
    maxChangeHistory: 20,       // 最大历史记录数
    stdDevMultiplier: 3,        // 标准差倍数阈值
    minHistoryForStdDev: 5,     // 计算标准差所需的最小历史记录数
    
    // 导航地图参数
    mapRange: 40,               // 当前地图距离范围（海里）
    mapZoomLevels: [5, 10, 20, 40, 80, 160, 320, 640], // 可选缩放级别
    currentZoomIndex: 3,        // 当前缩放级别索引（对应40NM）
    nearestAirport: null,       // 最近的机场信息
    secondNearestAirport: null, // 次近的机场信息
    trackedAirport: null,       // 追踪的机场信息
    trackAirportInput: '',      // 追踪机场输入框的值
    nearbyAirports: [],         // 附近的机场列表
    mapCanvas: null,            // Canvas上下文
    canvasWidth: 0,             // Canvas宽度
    canvasHeight: 0,            // Canvas高度
    airportsData: null,         // 机场数据
    mapUpdateTimer: null,       // 地图更新定时器
    
    // 地图定向模式
    mapOrientationMode: 'heading-up', // 'heading-up' 或 'north-up'
    mapStableHeading: 0,        // 用于地图显示的稳定航向值
    mapHeadingUpdateThreshold: 15, // 地图航向更新阈值（度）
    mapLowSpeedThreshold: 5,    // 低速阈值（kt），低于此速度时增加稳定性
    lastMapHeadingUpdate: 0,    // 上次地图航向更新时间
    mapHeadingLocked: false,    // 是否锁定地图航向（低速时）
    
    // 手势缩放支持
    lastTouchDistance: 0,       // 上次双指距离
    isPinching: false,          // 是否正在缩放
    mapTouchStart: null         // 触摸开始信息
  },
  
  customOnLoad: function(options) {
    console.log('驾驶舱页面加载');
    this.checkLocationPermission();
    this.startCompass();
    this.checkNetworkStatus();
    this.monitorGPSStatus();
    this.initNavigationMap();
    this.loadAirportsData();
  },
  
  customOnShow: function() {
    if (this.data.hasLocationPermission) {
      this.startLocationTracking();
    }
    this.startCompass();
  },
  
  customOnHide: function() {
    this.stopLocationTracking();
    this.stopCompass();
    
    // 停止地图更新
    if (this.data.mapUpdateTimer) {
      clearInterval(this.data.mapUpdateTimer);
      this.data.mapUpdateTimer = null;
    }
  },
  
  customOnUnload: function() {
    this.stopLocationTracking();
    this.stopCompass();
    
    // 清理干扰定时器
    if (this.data.interferenceTimer) {
      clearTimeout(this.data.interferenceTimer);
      this.data.interferenceTimer = null;
    }
    
    // 停止地图更新
    if (this.data.mapUpdateTimer) {
      clearInterval(this.data.mapUpdateTimer);
      this.data.mapUpdateTimer = null;
    }
  },
  
  // 检查位置权限
  checkLocationPermission: function() {
    var self = this;
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userLocation']) {
          self.setData({
            hasLocationPermission: true
          });
          self.startLocationTracking();
        } else {
          self.requestLocationPermission();
        }
      }
    });
  },
  
  // 请求位置权限
  requestLocationPermission: function() {
    var self = this;
    wx.authorize({
      scope: 'scope.userLocation',
      success: function() {
        self.setData({
          hasLocationPermission: true
        });
        self.startLocationTracking();
      },
      fail: function() {
        // 在离线模式下，提供继续使用的选项
        if (self.data.isOffline) {
          wx.showModal({
            title: '权限提示',
            content: '驾驶舱需要位置权限以获取GPS数据。您可以在离线模式下继续使用基础功能。',
            showCancel: true,
            cancelText: '打开设置',
            confirmText: '继续使用',
            success: function(res) {
              if (res.confirm) {
                // 用户选择继续使用
                self.setData({
                  showGPSWarning: true,
                  useSimulatedData: true,
                  locationError: null
                });
                self.startSimulatedMode();
              } else {
                // 用户选择打开设置
                self.openSetting();
              }
            }
          });
        } else {
          self.setData({
            locationError: '需要位置权限才能使用驾驶舱功能'
          });
          self.showModal('权限提示', '驾驶舱功能需要获取您的位置信息，请在设置中开启位置权限');
        }
      }
    });
  },
  
  // 开始位置追踪
  startLocationTracking: function() {
    var self = this;
    
    // 先获取一次当前位置
    wx.getLocation({
      type: 'wgs84',  // 使用原始GPS坐标，不需要网络转换
      altitude: true,
      isHighAccuracy: true,  // 启用高精度
      highAccuracyExpireTime: 4000,  // 高精度超时时间
      success: function(res) {
        self.updateLocationData(res);
      },
      fail: function(err) {
        console.error('获取位置失败:', err);
        // 在离线模式下，使用模拟数据而不是显示错误
        if (self.data.isOffline || self.data.isOfflineMode) {
          self.setData({
            showGPSWarning: true,
            useSimulatedData: true,
            locationError: null  // 清除错误，允许继续使用
          });
          self.startSimulatedMode();
        } else {
          // 提供更详细的错误信息
          var errorMsg = '获取位置失败';
          if (err.errMsg && err.errMsg.indexOf('auth') > -1) {
            errorMsg = '需要位置权限才能使用驾驶舱功能';
          } else if (err.errMsg && err.errMsg.indexOf('timeout') > -1) {
            errorMsg = 'GPS定位超时，请确保在开阔地带';
          } else if (!err.errMsg || err.errMsg.indexOf('fail') > -1) {
            errorMsg = '请检查GPS是否开启，并确保在开阔地带';
          }
          self.setData({
            locationError: errorMsg
          });
        }
      }
    });
    
    // 监听位置变化
    wx.onLocationChange(function(res) {
      self.updateLocationData(res);
    });
    
    // 开始持续获取位置
    wx.startLocationUpdate({
      type: 'wgs84',  // 明确指定使用wgs84
      success: function() {
        console.log('开始位置更新');
        // 设置定时器作为备用方案
        if (!self.data.updateTimer) {
          self.data.updateTimer = setInterval(function() {
            // 每5秒主动获取一次位置作为备份
            wx.getLocation({
              type: 'wgs84',
              altitude: true,
              isHighAccuracy: true,
              success: function(res) {
                self.updateLocationData(res);
              },
              fail: function(err) {
                console.warn('定时获取位置失败:', err);
              }
            });
          }, 5000);
        }
      },
      fail: function(err) {
        console.error('启动位置更新失败:', err);
        // 降级到定时获取模式
        wx.showToast({
          title: '使用间隔定位模式',
          icon: 'none',
          duration: 2000
        });
        if (!self.data.updateTimer) {
          self.data.updateTimer = setInterval(function() {
            wx.getLocation({
              type: 'wgs84',
              altitude: true,
              success: function(res) {
                self.updateLocationData(res);
              }
            });
          }, 3000);
        }
      }
    });
  },
  
  // 停止位置追踪
  stopLocationTracking: function() {
    wx.stopLocationUpdate();
    wx.offLocationChange();
    
    if (this.data.updateTimer) {
      clearInterval(this.data.updateTimer);
      this.setData({
        updateTimer: null
      });
    }
  },
  
  // 更新位置数据
  updateLocationData: function(location) {
    var self = this;
    var now = Date.now();
    
    // 位置合理性检查
    if (!this.isReasonableLocation(location, now)) {
      console.warn('GPS位置异常，忽略此次更新');
      return;
    }
    
    // GPS干扰检测
    var interferenceDetected = this.checkGPSInterference(location, now);
    
    // 添加到历史记录
    var history = this.data.locationHistory;
    history.push({
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude || 0,
      timestamp: now
    });
    
    // 限制历史记录大小
    if (history.length > this.data.maxHistorySize) {
      history.shift();
    }
    
    // 计算速度、航向和垂直速度
    var calculatedData = this.calculateFlightData(history);
    
    // 更新航迹数据
    if (calculatedData.track !== null) {
      // 有新的有效航迹
      this.data.lastValidTrack = calculatedData.track;
      this.setData({
        track: Math.round(calculatedData.track)
      });
    } else if (calculatedData.speed < this.data.minSpeedForTrack) {
      // 速度太低，保持之前的航迹
      this.setData({
        track: Math.round(this.data.lastValidTrack)
      });
    }
    
    // 更新GPS状态
    var timeSinceLastUpdate = this.data.lastUpdateTime ? (now - this.data.lastUpdateTime) / 1000 : 0;
    var gpsStatus = '正常';
    
    if (interferenceDetected) {
      gpsStatus = 'GPS干扰';
    } else if (location.accuracy && location.accuracy > 50) {
      gpsStatus = '精度较低';
    } else if (timeSinceLastUpdate > 10) {
      gpsStatus = '更新缓慢';
    }
    
    // 如果没有干扰，更新上次有效位置
    if (!interferenceDetected) {
      this.data.lastValidLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude || 0,
        timestamp: now
      };
    }
    
    // 更新数据（航向由指南针单独更新）
    this.setData({
      latitude: location.latitude.toFixed(6),
      longitude: location.longitude.toFixed(6),
      altitude: Math.round((location.altitude || 0) * 3.28084),
      speed: Math.round(calculatedData.speed),
      verticalSpeed: Math.round(calculatedData.verticalSpeed),
      locationHistory: history,
      locationError: null,
      lastUpdateTime: now,
      updateCount: this.data.updateCount + 1,
      gpsStatus: gpsStatus + (this.data.isOffline ? ' (离线)' : ''),
      gpsInterference: interferenceDetected
    });
    
    // 更新追踪机场信息
    this.updateTrackedAirport();
  },
  
  // 启动指南针
  startCompass: function() {
    var self = this;
    
    // 重置航向缓冲区和相关参数
    this.data.headingBuffer = [];
    this.data.headingStability = 0;
    this.data.lastHeadingUpdateTime = 0;
    
    // 监听罗盘数据
    wx.onCompassChange(function(res) {
      // 调试输出 - 可以后续注释掉
      console.log('原始指南针数据:', res.direction, '当前航迹:', self.data.track);
      
      // 如果是第一次读数，直接设置
      if (self.data.lastStableHeading === 0 && self.data.headingBuffer.length === 0) {
        self.data.lastStableHeading = res.direction;
        self.data.lastHeadingUpdateTime = Date.now();
        self.setData({
          heading: Math.round(res.direction)
        });
      }
      
      // 使用增强的平滑算法处理航向数据
      var smoothedHeading = self.smoothHeadingEnhanced(res.direction);
      
      // 只有当航向变化显著且通过稳定性检查时才更新显示
      if (smoothedHeading !== null) {
        console.log('更新航向显示:', smoothedHeading);
        self.setData({
          heading: smoothedHeading
        });
      }
    });
    
    // 开始监听罗盘数据
    wx.startCompass({
      interval: 'game', // 使用更稳定的更新频率
      success: function() {
        console.log('指南针启动成功');
      },
      fail: function(err) {
        console.error('指南针启动失败:', err);
      }
    });
  },
  
  // 停止指南针
  stopCompass: function() {
    wx.stopCompass({
      success: function() {
        console.log('指南针已停止');
      }
    });
  },
  
  // 计算飞行数据
  calculateFlightData: function(history) {
    var result = {
      speed: 0,
      verticalSpeed: 0,
      track: null
    };
    
    if (history.length < 2) {
      return result;
    }
    
    // 获取最新两个位置点
    var current = history[history.length - 1];
    var previous = history[history.length - 2];
    
    // 计算时间差（秒）
    var timeDiff = (current.timestamp - previous.timestamp) / 1000;
    
    if (timeDiff > 0) {
      // 计算地速（使用Haversine公式）
      var distance = this.calculateDistance(
        previous.latitude, previous.longitude,
        current.latitude, current.longitude
      );
      var rawSpeed = (distance / timeDiff) * 1.944; // 转换为 kt（节）
      
      // 速度合理性检查和过滤
      result.speed = this.filterSpeed(rawSpeed, timeDiff);
      
      // 计算航迹（只有在速度足够时才计算）
      if (result.speed >= this.data.minSpeedForTrack) {
        result.track = this.calculateBearing(
          previous.latitude, previous.longitude,
          current.latitude, current.longitude
        );
      }
      
      // 计算垂直速度（米/分钟）
      var altitudeDiff = current.altitude - previous.altitude;
      var rawVerticalSpeed = (altitudeDiff / timeDiff) * 60;
      
      // 垂直速度合理性检查（最大±6000 ft/min）
      if (Math.abs(rawVerticalSpeed) > 6000) {
        result.verticalSpeed = 0;
      } else {
        result.verticalSpeed = rawVerticalSpeed;
      }
    }
    
    return result;
  },
  
  // 速度过滤和平滑
  filterSpeed: function(rawSpeed, timeDiff) {
    var self = this;
    
    // 检查速度是否超过最大合理值
    if (rawSpeed > this.data.maxReasonableSpeed) {
      console.warn('GPS速度异常:', rawSpeed + 'kt, 使用上次有效值');
      this.data.anomalyCount++;
      
      // 连续异常超过阈值，显示警告
      if (this.data.anomalyCount > this.data.maxAnomalyCount) {
        wx.showToast({
          title: 'GPS信号异常',
          icon: 'none',
          duration: 2000
        });
      }
      
      return this.data.lastValidSpeed;
    }
    
    // 检查加速度是否合理
    if (this.data.lastValidSpeed > 0) {
      var acceleration = Math.abs(rawSpeed - this.data.lastValidSpeed) / timeDiff;
      if (acceleration > this.data.maxAcceleration) {
        console.warn('GPS加速度异常:', acceleration + 'kt/s');
        this.data.anomalyCount++;
        
        // 限制速度变化
        var maxChange = this.data.maxAcceleration * timeDiff;
        if (rawSpeed > this.data.lastValidSpeed) {
          return this.data.lastValidSpeed + maxChange;
        } else {
          return Math.max(0, this.data.lastValidSpeed - maxChange);
        }
      }
    }
    
    // 速度正常，重置异常计数
    this.data.anomalyCount = 0;
    
    // 添加到速度缓冲区
    this.data.speedBuffer.push(rawSpeed);
    if (this.data.speedBuffer.length > this.data.speedBufferSize) {
      this.data.speedBuffer.shift();
    }
    
    // 计算平滑后的速度（移动平均）
    var smoothedSpeed = this.calculateMovingAverage(this.data.speedBuffer);
    
    // 更新上次有效速度
    this.data.lastValidSpeed = smoothedSpeed;
    
    return smoothedSpeed;
  },
  
  // 计算移动平均
  calculateMovingAverage: function(buffer) {
    if (buffer.length === 0) return 0;
    
    var sum = 0;
    for (var i = 0; i < buffer.length; i++) {
      sum += buffer[i];
    }
    
    return sum / buffer.length;
  },
  
  // 计算两点间距离（Haversine公式）
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
  
  // 计算方位角
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
  
  // 打开设置页面
  openSetting: function() {
    var self = this;
    wx.openSetting({
      success: function(res) {
        if (res.authSetting['scope.userLocation']) {
          wx.showToast({
            title: '权限已开启',
            icon: 'success'
          });
          // 清除错误状态并重新加载
          self.setData({
            locationError: null,
            hasLocationPermission: true
          });
          self.startLocationTracking();
        }
      }
    });
  },
  
  // 增强的航向平滑算法（解决敏感性问题）
  smoothHeadingEnhanced: function(newHeading) {
    var now = Date.now();
    var buffer = this.data.headingBuffer;
    var bufferSize = this.data.headingBufferSize;
    
    // 时间控制：如果距离上次更新时间太短，跳过处理
    if (now - this.data.lastHeadingUpdateTime < this.data.minHeadingUpdateInterval) {
      return null;
    }
    
    // 添加新数据到缓冲区
    buffer.push(newHeading);
    if (buffer.length > bufferSize) {
      buffer.shift();
    }
    
    // 缓冲区数据不足时，快速启动（前3个数据）
    if (buffer.length < 3) {
      this.data.lastStableHeading = newHeading;
      this.data.lastHeadingUpdateTime = now;
      return Math.round(newHeading);
    }
    
    // 计算加权循环平均值（给近期数据更高权重）
    var averageHeading = this.calculateWeightedCircularMean(buffer);
    
    // 根据当前速度动态调整阈值
    var currentSpeed = this.data.speed || 0;
    var currentThreshold = currentSpeed < 3 ? 
        this.data.headingLowSpeedThreshold : 
        this.data.headingBaseThreshold;
    
    // 计算与上次稳定值的差异
    var headingDiff = this.getAngleDifference(averageHeading, this.data.lastStableHeading);
    
    // 增强稳定性检查：计算缓冲区内的标准差
    var headingStdDev = this.calculateCircularStandardDeviation(buffer);
    
    // 更新判断逻辑
    var shouldUpdate = false;
    
    if (Math.abs(headingDiff) > currentThreshold) {
      // 变化超过动态阈值时，进行稳定性检查
      if (this.checkHeadingStabilityEnhanced(headingDiff, headingStdDev, currentSpeed)) {
        shouldUpdate = true;
        this.data.lastStableHeading = averageHeading;
        this.data.lastHeadingUpdateTime = now;
        this.data.headingStability = 0; // 重置稳定性计数器
      }
    } else if (buffer.length >= bufferSize) {
      // 缓冲区满且变化很小时，进行微调（降低频率）
      if (now - this.data.lastHeadingUpdateTime > 8000) { // 8秒无更新时强制微调
        this.data.lastStableHeading = averageHeading;
        this.data.lastHeadingUpdateTime = now;
        shouldUpdate = true;
      }
    }
    
    // 保存缓冲区状态
    this.data.headingBuffer = buffer;
    
    return shouldUpdate ? Math.round(averageHeading) : null;
  },

  // 增强的航向稳定性检查
  checkHeadingStabilityEnhanced: function(headingDiff, headingStdDev, currentSpeed) {
    // 基于标准差的稳定性检查
    var stdDevThreshold = currentSpeed < 3 ? 15 : 10; // 低速时允许更大的标准差
    
    if (headingStdDev > stdDevThreshold) {
      // 数据太分散，不够稳定
      console.log('航向数据不稳定，标准差:', headingStdDev.toFixed(1));
      return false;
    }
    
    // 增加稳定性计数器
    this.data.headingStability++;
    
    // 需要连续多次确认才更新
    if (this.data.headingStability >= this.data.requiredStabilityCount) {
      return true;
    }
    
    return false;
  },

  // 简单循环平均值计算
  calculateSimpleCircularMean: function(angles) {
    var sinSum = 0;
    var cosSum = 0;
    
    for (var i = 0; i < angles.length; i++) {
      var radians = angles[i] * Math.PI / 180;
      sinSum += Math.sin(radians);
      cosSum += Math.cos(radians);
    }
    
    var meanAngle = Math.atan2(sinSum / angles.length, cosSum / angles.length) * 180 / Math.PI;
    
    // 转换为0-360度
    return (meanAngle + 360) % 360;
  },
  
  // 计算加权循环平均值（处理0-360度边界）
  calculateWeightedCircularMean: function(angles) {
    var sinSum = 0;
    var cosSum = 0;
    var totalWeight = 0;
    
    for (var i = 0; i < angles.length; i++) {
      // 指数权重，最新数据权重更大
      var weight = Math.pow(1.5, i);
      var radians = angles[i] * Math.PI / 180;
      
      sinSum += Math.sin(radians) * weight;
      cosSum += Math.cos(radians) * weight;
      totalWeight += weight;
    }
    
    sinSum /= totalWeight;
    cosSum /= totalWeight;
    
    var meanAngle = Math.atan2(sinSum, cosSum) * 180 / Math.PI;
    
    // 转换为0-360度
    return (meanAngle + 360) % 360;
  },
  
  // 计算两个角度的最小差值（考虑循环）
  getAngleDifference: function(angle1, angle2) {
    var diff = angle1 - angle2;
    
    // 调整到-180到180范围
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    
    return diff;
  },
  
  // 计算循环标准差（评估数据稳定性）
  calculateCircularStandardDeviation: function(angles) {
    var mean = this.calculateWeightedCircularMean(angles);
    var squaredDiffs = 0;
    
    for (var i = 0; i < angles.length; i++) {
      var diff = this.getAngleDifference(angles[i], mean);
      squaredDiffs += diff * diff;
    }
    
    return Math.sqrt(squaredDiffs / angles.length);
  },
  
  // 切换航向/航迹模式
  toggleHeadingMode: function() {
    var newMode = this.data.headingMode === 'heading' ? 'track' : 'heading';
    this.setData({
      headingMode: newMode
    });
    
    // 显示提示
    wx.showToast({
      title: newMode === 'heading' ? '航向模式' : '航迹模式',
      icon: 'none',
      duration: 1500
    });
  },
  
  // 检查网络状态
  checkNetworkStatus: function() {
    var self = this;
    
    // 获取网络类型
    wx.getNetworkType({
      success: function(res) {
        var isOffline = res.networkType === 'none';
        self.setData({
          isOffline: isOffline,
        isOfflineMode: isOffline  // 同步离线模式状态
        });
        
        if (isOffline) {
          console.log('当前处于离线状态，使用纯GPS定位');
        }
      }
    });
    
    // 监听网络状态变化
    wx.onNetworkStatusChange(function(res) {
      self.setData({
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
  },
  
  // 监控GPS状态
  monitorGPSStatus: function() {
    var self = this;
    
    // 每10秒检查一次GPS状态
    setInterval(function() {
      var now = Date.now();
      var timeSinceLastUpdate = self.data.lastUpdateTime ? (now - self.data.lastUpdateTime) / 1000 : 999;
      
      if (timeSinceLastUpdate > 30) {
        // 在离线模式下，不阻塞页面
        if (self.data.isOffline || self.data.isOfflineMode) {
          self.setData({
            gpsStatus: '离线模式',
            showGPSWarning: true,
            locationError: null  // 不显示阻塞错误
          });
          // 如果还没启动模拟模式，启动它
          if (!self.data.useSimulatedData) {
            self.startSimulatedMode();
          }
        } else {
          self.setData({
            gpsStatus: 'GPS信号丢失',
            locationError: 'GPS信号长时间未更新，请检查是否在室内或信号遮挡区域'
          });
        }
      } else if (timeSinceLastUpdate > 15) {
        self.setData({
          gpsStatus: 'GPS信号弱' + (self.data.isOffline ? ' (离线)' : '')
        });
      }
    }, 10000);
  },
  
  // 检测GPS干扰
  checkGPSInterference: function(location, now) {
    var self = this;
    
    // 如果没有上次有效位置，无法检测
    if (!this.data.lastValidLocation) {
      return false;
    }
    
    var lastLocation = this.data.lastValidLocation;
    var timeDiff = now - lastLocation.timestamp;
    
    // 如果时间间隔太短，跳过检测
    if (timeDiff < 1000) { // 至少1秒间隔
      return this.data.gpsInterference; // 保持当前状态
    }
    
    // 计算变化率
    var latDiff = location.latitude - lastLocation.latitude;
    var lonDiff = location.longitude - lastLocation.longitude;
    var altDiff = (location.altitude || 0) - (lastLocation.altitude || 0);
    var distance = this.calculateDistance(
      lastLocation.latitude, lastLocation.longitude,
      location.latitude, location.longitude
    );
    
    // 计算变化率（单位时间内的变化）
    var timeInSeconds = timeDiff / 1000;
    var distanceRate = distance / timeInSeconds; // 米/秒
    var altitudeRate = Math.abs(altDiff) / timeInSeconds; // 米/秒
    
    // 记录变化历史
    var changeData = {
      distanceRate: distanceRate,
      altitudeRate: altitudeRate,
      latDiff: Math.abs(latDiff),
      lonDiff: Math.abs(lonDiff),
      timestamp: now
    };
    
    this.data.changeHistory.push(changeData);
    
    // 限制历史记录大小
    if (this.data.changeHistory.length > this.data.maxChangeHistory) {
      this.data.changeHistory.shift();
    }
    
    var interferenceDetected = false;
    
    // 首先检查极限阈值（绝对不可能的情况）
    var extremePositionJump = (Math.abs(latDiff) > this.data.positionThreshold || 
                               Math.abs(lonDiff) > this.data.positionThreshold);
    var extremeAltitudeJump = Math.abs(altDiff) > this.data.altitudeThreshold;
    
    if (extremePositionJump || extremeAltitudeJump) {
      interferenceDetected = true;
    } else if (this.data.changeHistory.length >= this.data.minHistoryForStdDev) {
      // 基于标准差的连续性检测
      var stats = this.calculateChangeStatistics();
      
      // 检查当前变化是否超过3倍标准差
      var distanceAnomaly = distanceRate > (stats.avgDistanceRate + this.data.stdDevMultiplier * stats.stdDevDistance);
      var altitudeAnomaly = altitudeRate > (stats.avgAltitudeRate + this.data.stdDevMultiplier * stats.stdDevAltitude);
      
      // 位置变化的连续性检测
      var positionContinuityAnomaly = (Math.abs(latDiff) > (stats.avgLatDiff + this.data.stdDevMultiplier * stats.stdDevLat)) ||
                                      (Math.abs(lonDiff) > (stats.avgLonDiff + this.data.stdDevMultiplier * stats.stdDevLon));
      
      if (distanceAnomaly || altitudeAnomaly || positionContinuityAnomaly) {
        interferenceDetected = true;
        
        console.warn('GPS干扰检测（基于标准差）:', {
          距离变化率: distanceRate + ' m/s',
          平均距离变化率: stats.avgDistanceRate + ' m/s',
          距离标准差: stats.stdDevDistance + ' m/s',
          高度变化率: altitudeRate + ' m/s',
          平均高度变化率: stats.avgAltitudeRate + ' m/s',
          高度标准差: stats.stdDevAltitude + ' m/s'
        });
      }
    }
    
    // 如果检测到干扰
    if (interferenceDetected) {
      
      // 记录干扰时间（格式化为可读时间）
      var interferenceTime = new Date(now);
      var hours = interferenceTime.getHours();
      var minutes = interferenceTime.getMinutes();
      var seconds = interferenceTime.getSeconds();
      
      // 兼容padStart的实现
      var pad = function(num) {
        return num < 10 ? '0' + num : num.toString();
      };
      
      var timeString = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
      
      this.setData({
        lastInterferenceTime: timeString
      });
      
      // 清除之前的定时器
      if (this.data.interferenceTimer) {
        clearTimeout(this.data.interferenceTimer);
      }
      
      // 设置30分钟后清除干扰记录
      this.data.interferenceTimer = setTimeout(function() {
        self.setData({
          gpsInterference: false,
          lastInterferenceTime: null
        });
        self.data.interferenceTimer = null;
      }, 30 * 60 * 1000); // 30分钟
      
      // 显示干扰提示
      wx.showToast({
        title: '检测到GPS干扰',
        icon: 'none',
        duration: 3000
      });
      
      console.warn('GPS干扰检测:', {
        经纬度跳变: positionJump,
        高度跳变: altitudeJump,
        不可能的移动: impossibleMovement,
        实际距离: actualDistance + 'm',
        最大可能距离: maxPossibleDistance + 'm',
        高度差: altDiff + 'm'
      });
    }
    
    return interferenceDetected;
  },
  
  // 计算变化统计数据
  calculateChangeStatistics: function() {
    var history = this.data.changeHistory;
    var stats = {
      avgDistanceRate: 0,
      avgAltitudeRate: 0,
      avgLatDiff: 0,
      avgLonDiff: 0,
      stdDevDistance: 0,
      stdDevAltitude: 0,
      stdDevLat: 0,
      stdDevLon: 0
    };
    
    // 计算平均值
    var sumDistance = 0, sumAltitude = 0, sumLat = 0, sumLon = 0;
    for (var i = 0; i < history.length; i++) {
      sumDistance += history[i].distanceRate;
      sumAltitude += history[i].altitudeRate;
      sumLat += history[i].latDiff;
      sumLon += history[i].lonDiff;
    }
    
    stats.avgDistanceRate = sumDistance / history.length;
    stats.avgAltitudeRate = sumAltitude / history.length;
    stats.avgLatDiff = sumLat / history.length;
    stats.avgLonDiff = sumLon / history.length;
    
    // 计算标准差
    var sumSqDistance = 0, sumSqAltitude = 0, sumSqLat = 0, sumSqLon = 0;
    for (var j = 0; j < history.length; j++) {
      sumSqDistance += Math.pow(history[j].distanceRate - stats.avgDistanceRate, 2);
      sumSqAltitude += Math.pow(history[j].altitudeRate - stats.avgAltitudeRate, 2);
      sumSqLat += Math.pow(history[j].latDiff - stats.avgLatDiff, 2);
      sumSqLon += Math.pow(history[j].lonDiff - stats.avgLonDiff, 2);
    }
    
    stats.stdDevDistance = Math.sqrt(sumSqDistance / history.length);
    stats.stdDevAltitude = Math.sqrt(sumSqAltitude / history.length);
    stats.stdDevLat = Math.sqrt(sumSqLat / history.length);
    stats.stdDevLon = Math.sqrt(sumSqLon / history.length);
    
    return stats;
  },
  
  // 初始化导航地图
  initNavigationMap: function() {
    var self = this;
    
    // 延迟初始化Canvas，避免框架内部错误
    setTimeout(function() {
      // 创建Canvas上下文
      try {
        var ctx = wx.createCanvasContext('navigationMap', self);
        self.data.mapCanvas = ctx;
        console.log('导航地图Canvas初始化成功');
      } catch (error) {
        console.error('导航地图Canvas初始化失败:', error);
      }
      
      // 获取Canvas尺寸
      wx.createSelectorQuery().in(self).select('.navigation-canvas').boundingClientRect(function(rect) {
        if (rect) {
          self.data.canvasWidth = rect.width;
          self.data.canvasHeight = rect.height;
          console.log('导航Canvas尺寸:', rect.width, 'x', rect.height);
          
          // 初始绘制
          self.drawNavigationMap();
        }
      }).exec();
      
    }, 500); // 延迟500ms初始化
    
    // 设置地图更新定时器
    this.data.mapUpdateTimer = setInterval(function() {
      self.updateNearbyAirports();
      self.drawNavigationMap();
    }, 2000); // 每2秒更新一次
  },
  
  // 加载机场数据
  loadAirportsData: function() {
    var self = this;
    
    // 使用异步require加载跨分包数据
    require('../../packageC/airportdata.js', function(module) {
      self.data.airportsData = module;
      console.log('机场数据加载成功，共', self.data.airportsData.length, '个机场');
      
      // 数据加载成功后更新附近机场
      self.updateNearbyAirports();
      self.drawNavigationMap();
    }, function(error) {
      console.error('加载机场数据失败:', error);
      wx.showToast({
        title: '机场数据加载失败',
        icon: 'none',
        duration: 2000
      });
    });
  },
  
  // 更新附近机场列表
  updateNearbyAirports: function() {
    if (!this.data.airportsData || !this.data.latitude || !this.data.longitude) {
      return;
    }
    
    var self = this;
    var currentLat = parseFloat(this.data.latitude);
    var currentLon = parseFloat(this.data.longitude);
    var maxRange = this.data.mapRange;
    
    // 计算所有机场的距离和方位
    var airportsWithDistance = [];
    for (var i = 0; i < this.data.airportsData.length; i++) {
      var airport = this.data.airportsData[i];
      var distance = this.calculateDistanceNM(
        currentLat, currentLon,
        airport.Latitude, airport.Longitude
      );
      
      // 只保留在显示范围内的机场
      if (distance <= maxRange * 1.2) { // 留20%余量
        var bearing = this.calculateBearing(
          currentLat, currentLon,
          airport.Latitude, airport.Longitude
        );
        
        airportsWithDistance.push({
          ICAOCode: airport.ICAOCode,
          IATACode: airport.IATACode,
          EnglishName: airport.EnglishName,
          ShortName: airport.ShortName,
          Latitude: airport.Latitude,
          Longitude: airport.Longitude,
          Elevation: airport.Elevation,
          distance: distance,
          bearing: Math.round(bearing)
        });
      }
    }
    
    // 按距离排序
    airportsWithDistance.sort(function(a, b) {
      return a.distance - b.distance;
    });
    
    // 更新最近机场和次近机场
    if (airportsWithDistance.length > 0) {
      var nearest = airportsWithDistance[0];
      this.setData({
        nearestAirport: {
          ICAOCode: nearest.ICAOCode,
          ShortName: nearest.ShortName || nearest.EnglishName,
          distance: nearest.distance.toFixed(1),
          bearing: nearest.bearing
        }
      });
      
      // 设置次近机场（如果存在）
      if (airportsWithDistance.length > 1) {
        var secondNearest = airportsWithDistance[1];
        this.setData({
          secondNearestAirport: {
            ICAOCode: secondNearest.ICAOCode,
            ShortName: secondNearest.ShortName || secondNearest.EnglishName,
            distance: secondNearest.distance.toFixed(1),
            bearing: secondNearest.bearing
          }
        });
      } else {
        this.setData({
          secondNearestAirport: null
        });
      }
      
      // 自动模式下，根据最近机场距离调整地图范围
      if (this.data.mapRangeMode === 'auto') {
        var autoRange = 40; // 默认40海里
        for (var j = 0; j < this.data.mapRanges.length; j++) {
          if (nearest.distance < this.data.mapRanges[j] * 0.8) {
            autoRange = this.data.mapRanges[j];
            break;
          }
        }
        this.data.mapRange = autoRange;
      }
    } else {
      // 没有找到机场时清空显示
      this.setData({
        nearestAirport: null,
        secondNearestAirport: null
      });
    }
    
    // 保存附近机场列表（最多显示20个）
    this.data.nearbyAirports = airportsWithDistance.slice(0, 20);
  },
  
  // 计算距离（海里）
  calculateDistanceNM: function(lat1, lon1, lat2, lon2) {
    var distanceM = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distanceM / 1852; // 米转海里
  },
  
  // 获取用于地图显示的稳定航向
  getMapDisplayHeading: function() {
    // 如果是北向朝上模式，始终返回0
    if (this.data.mapOrientationMode === 'north-up') {
      return 0;
    }
    
    var currentSpeed = this.data.speed || 0;
    var currentHeading = this.data.headingMode === 'heading' ? this.data.heading : this.data.track;
    var now = Date.now();
    
    // 低速时锁定地图方向
    if (currentSpeed < this.data.mapLowSpeedThreshold) {
      if (!this.data.mapHeadingLocked) {
        // 刚进入低速状态，锁定当前航向
        this.data.mapHeadingLocked = true;
        this.data.mapStableHeading = currentHeading;
        console.log('低速锁定地图航向:', this.data.mapStableHeading);
      }
      return this.data.mapStableHeading;
    } else {
      // 解除锁定
      this.data.mapHeadingLocked = false;
    }
    
    // 检查是否需要更新地图航向
    var headingDiff = this.getAngleDifference(currentHeading, this.data.mapStableHeading);
    var timeSinceLastUpdate = now - this.data.lastMapHeadingUpdate;
    
    // 增加时间限制，避免频繁更新
    if (Math.abs(headingDiff) > this.data.mapHeadingUpdateThreshold && 
        timeSinceLastUpdate > 3000) { // 至少3秒间隔
      this.data.mapStableHeading = currentHeading;
      this.data.lastMapHeadingUpdate = now;
      console.log('更新地图航向:', this.data.mapStableHeading);
    }
    
    return this.data.mapStableHeading;
  },

  // 绘制导航地图
  drawNavigationMap: function() {
    if (!this.data.mapCanvas || !this.data.canvasWidth) {
      return;
    }
    
    try {
      var ctx = this.data.mapCanvas;
      var width = this.data.canvasWidth;
      var height = this.data.canvasHeight;
      var centerX = width / 2;
      var centerY = height / 2;
      var radius = Math.min(width, height) * 0.4;
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 设置背景
      ctx.setFillStyle('#000000');
      ctx.fillRect(0, 0, width, height);
      
      // 绘制距离圈
      this.drawRangeRings(ctx, centerX, centerY, radius);
      
      // 绘制航向指示
      this.drawHeadingIndicator(ctx, centerX, centerY, radius);
      
      // 绘制机场
      this.drawAirports(ctx, centerX, centerY, radius);
      
      // 绘制飞机（中心位置）
      this.drawAircraft(ctx, centerX, centerY);
      
      // 绘制
      ctx.draw();
    } catch (error) {
      console.error('绘制导航地图失败:', error);
    }
  },
  
  // 绘制距离圈
  drawRangeRings: function(ctx, centerX, centerY, maxRadius) {
    var aircraftY = centerY; // 飞机的Y位置（居中）
    var currentRange = this.data.mapRange; // 当前地图范围
    
    ctx.setStrokeStyle('rgba(0, 255, 136, 0.3)');
    ctx.setLineWidth(1);
    ctx.setLineDash([5, 5]);
    
    // 绘制4个同心圆，代表当前缩放级别的等距环
    var rings = 4;
    
    for (var i = 1; i <= rings; i++) {
      var ringRadius = (maxRadius / rings) * i;
      var ringDistance = (currentRange / rings) * i; // 计算每个圈对应的距离
      
      // 绘制距离圈
      ctx.beginPath();
      ctx.arc(centerX, aircraftY, ringRadius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // 在距离圈右上方（60°）显示距离标签（只显示数字）
      ctx.setFillStyle('rgba(0, 255, 136, 0.8)');
      ctx.setFontSize(10);
      
      // 右上方60°方向显示距离数字
      var angle60 = 60 * Math.PI / 180;
      var x60 = centerX + Math.sin(angle60) * (ringRadius + 10);
      var y60 = aircraftY - Math.cos(angle60) * (ringRadius + 10);
      ctx.setTextAlign('left');
      ctx.fillText(ringDistance.toString(), x60, y60);
    }
    
    // 重置文本对齐和线条样式
    ctx.setTextAlign('left');
    ctx.setLineDash([]);
  },
  
  // 绘制航向指示
  drawHeadingIndicator: function(ctx, centerX, centerY, radius) {
    var mapHeading = this.getMapDisplayHeading(); // 使用稳定的地图航向
    var track = this.data.track; // 航迹角度
    var heading = this.data.heading; // 航向角度
    var aircraftY = centerY; // 飞机的Y位置（居中）
    
    // 绘制方位标记
    ctx.setStrokeStyle('rgba(255, 255, 255, 0.5)');
    ctx.setLineWidth(1);
    
    // 绘制8个主要方位（基于航迹定向）
    var directions = [
      {angle: 0, label: 'N'},
      {angle: 45, label: 'NE'},
      {angle: 90, label: 'E'},
      {angle: 135, label: 'SE'},
      {angle: 180, label: 'S'},
      {angle: 225, label: 'SW'},
      {angle: 270, label: 'W'},
      {angle: 315, label: 'NW'}
    ];
    
    // 绘制圆形方位框架（以飞机位置为中心）
    ctx.setStrokeStyle('rgba(255, 255, 255, 0.2)');
    ctx.beginPath();
    ctx.arc(centerX, aircraftY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    for (var i = 0; i < directions.length; i++) {
      var dir = directions[i];
      var angle = (dir.angle - mapHeading) * Math.PI / 180; // 使用稳定的地图航向
      var x1 = centerX + Math.sin(angle) * radius;
      var y1 = aircraftY - Math.cos(angle) * radius;
      var x2 = centerX + Math.sin(angle) * (radius - 10);
      var y2 = aircraftY - Math.cos(angle) * (radius - 10);
      
      ctx.setStrokeStyle('rgba(255, 255, 255, 0.5)');
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // 标注方位
      if (dir.angle % 90 === 0) {
        ctx.setFillStyle('#00ff88');
        ctx.setFontSize(12);
        var textX = centerX + Math.sin(angle) * (radius + 15);
        var textY = aircraftY - Math.cos(angle) * (radius + 15);
        ctx.fillText(dir.label, textX - 5, textY + 5);
      }
    }
    
    // 绘制航迹线（从飞机位置向上，黄色）
    ctx.setStrokeStyle('#ffff00');
    ctx.setLineWidth(3);
    ctx.beginPath();
    ctx.moveTo(centerX, aircraftY);
    ctx.lineTo(centerX, aircraftY - radius);
    ctx.stroke();
    
    // 在距离圈正上方显示航迹数值（只显示数字）
    ctx.setFillStyle('#ffff00');
    ctx.setFontSize(14);
    ctx.setTextAlign('center');
    var trackText = track.toString().padStart(3, '0') + '°';
    ctx.fillText(trackText, centerX, aircraftY - radius - 20);
    
    // 在最外层距离圈上用小方块显示航向
    var headingAngle = (heading - mapHeading) * Math.PI / 180; // 航向相对于地图方向的角度
    var headingX = centerX + Math.sin(headingAngle) * radius;
    var headingY = aircraftY - Math.cos(headingAngle) * radius;
    
    // 绘制航向小方块
    ctx.setFillStyle('#00ff88');
    ctx.setStrokeStyle('#ffffff');
    ctx.setLineWidth(1);
    var squareSize = 8;
    ctx.fillRect(headingX - squareSize/2, headingY - squareSize/2, squareSize, squareSize);
    ctx.strokeRect(headingX - squareSize/2, headingY - squareSize/2, squareSize, squareSize);
    
    // 在距离圈内侧显示航向数值（只显示数字）
    ctx.setFillStyle('#00ff88');
    ctx.setFontSize(12);
    var headingText = heading.toString().padStart(3, '0') + '°';
    var innerRadius = radius - 25; // 距离圈内侧位置
    var innerHeadingX = centerX + Math.sin(headingAngle) * innerRadius;
    var innerHeadingY = aircraftY - Math.cos(headingAngle) * innerRadius;
    ctx.textAlign = 'center';
    ctx.fillText(headingText, innerHeadingX, innerHeadingY + 4);
    
    // 重置文本对齐
    ctx.setTextAlign('left');
  },
  
  // 绘制机场
  drawAirports: function(ctx, centerX, centerY, maxRadius) {
    if (!this.data.nearbyAirports) return;
    
    var mapHeading = this.getMapDisplayHeading(); // 使用稳定的地图航向
    var scale = maxRadius / this.data.mapRange;
    var aircraftY = centerY; // 飞机的Y位置（居中）
    
    ctx.setFillStyle('#00b4ff');
    ctx.setStrokeStyle('#00b4ff');
    
    for (var i = 0; i < this.data.nearbyAirports.length; i++) {
      var airport = this.data.nearbyAirports[i];
      
      // 计算相对位置
      var relativeBearing = (airport.bearing - mapHeading + 360) % 360;
      var angle = relativeBearing * Math.PI / 180;
      var distance = airport.distance * scale;
      
      // 如果超出显示范围，跳过
      if (distance > maxRadius * 1.5) continue; // 增加一些余量
      
      // 从飞机位置计算机场位置
      var x = centerX + Math.sin(angle) * distance;
      var y = aircraftY - Math.cos(angle) * distance;
      
      // 如果机场在画布外，跳过
      if (y < 0 || y > this.data.canvasHeight) continue;
      
      // 绘制机场圆点
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // 标注机场代码
      ctx.setFontSize(8);
      ctx.fillText(airport.ICAOCode, x + 5, y - 5);
    }
  },
  
  // 绘制飞机（在中心位置）
  drawAircraft: function(ctx, centerX, centerY) {
    // 将飞机放在Canvas中心
    var aircraftY = centerY;
    
    ctx.setFillStyle('#ffff00');
    ctx.setStrokeStyle('#ffff00');
    ctx.setLineWidth(2);
    
    // 绘制飞机图标（简化的三角形）
    ctx.beginPath();
    ctx.moveTo(centerX, aircraftY - 15);      // 机头
    ctx.lineTo(centerX - 10, aircraftY + 10); // 左翼
    ctx.lineTo(centerX - 3, aircraftY + 5);   // 左侧机身
    ctx.lineTo(centerX - 3, aircraftY + 15);  // 左尾翼
    ctx.lineTo(centerX + 3, aircraftY + 15);  // 右尾翼
    ctx.lineTo(centerX + 3, aircraftY + 5);   // 右侧机身
    ctx.lineTo(centerX + 10, aircraftY + 10); // 右翼
    ctx.closePath();
    ctx.fill();
    
    // 中心圆点
    ctx.beginPath();
    ctx.arc(centerX, aircraftY, 2, 0, 2 * Math.PI);
    ctx.setFillStyle('#ff0000');
    ctx.fill();
  },
  
  // 地图触摸事件处理
  onMapTouchStart: function(e) {
    var touches = e.touches;
    
    if (touches.length === 1) {
      // 单指触摸
      this.data.mapTouchStart = {
        x: touches[0].x,
        y: touches[0].y,
        time: Date.now()
      };
      this.data.isPinching = false;
    } else if (touches.length === 2) {
      // 双指触摸，准备缩放
      var distance = this.getTouchDistance(touches[0], touches[1]);
      this.data.lastTouchDistance = distance;
      this.data.isPinching = true;
      this.data.mapTouchStart = null;
    }
  },
  
  onMapTouchMove: function(e) {
    var touches = e.touches;
    
    if (touches.length === 2 && this.data.isPinching) {
      // 双指缩放
      var currentDistance = this.getTouchDistance(touches[0], touches[1]);
      var deltaDistance = currentDistance - this.data.lastTouchDistance;
      
      // 缩放阈值，避免过于敏感
      if (Math.abs(deltaDistance) > 10) {
        this.handleZoom(deltaDistance);
        this.data.lastTouchDistance = currentDistance;
      }
    }
  },
  
  onMapTouchEnd: function(e) {
    var touches = e.touches;
    
    if (touches.length === 0) {
      // 所有手指离开
      this.data.isPinching = false;
      this.data.lastTouchDistance = 0;
      
      // 如果是单指点击事件（预留功能）
      if (this.data.mapTouchStart && !this.data.isPinching) {
        var changedTouches = e.changedTouches;
        if (changedTouches.length > 0) {
          var deltaTime = Date.now() - this.data.mapTouchStart.time;
          var deltaX = Math.abs(changedTouches[0].x - this.data.mapTouchStart.x);
          var deltaY = Math.abs(changedTouches[0].y - this.data.mapTouchStart.y);
          
          if (deltaTime < 300 && deltaX < 10 && deltaY < 10) {
            // 单击事件（可以预留其他功能）
            console.log('地图单击');
          }
        }
      }
      
      this.data.mapTouchStart = null;
    } else if (touches.length === 1) {
      // 从双指变为单指
      this.data.isPinching = false;
      this.data.lastTouchDistance = 0;
    }
  },

  // 计算两个触摸点之间的距离
  getTouchDistance: function(touch1, touch2) {
    var dx = touch1.x - touch2.x;
    var dy = touch1.y - touch2.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  
  // 启动模拟模式
  startSimulatedMode: function() {
    var self = this;
    console.log('启动模拟模式');
    
    // 设置模拟数据
    this.setData({
      useSimulatedData: true,
      latitude: '39.9042',  // 北京坐标
      longitude: '116.4074',
      altitude: 118,  // 约400英尺
      speed: 0,
      heading: 360,
      verticalSpeed: 0,
      gpsStatus: '模拟模式',
      locationError: null
    });
    
    // 显示提示
    wx.showToast({
      title: '已启用模拟模式',
      icon: 'none',
      duration: 2000
    });
  },
  
  // 关闭GPS警告
  dismissGPSWarning: function() {
    this.setData({
      showGPSWarning: false
    });
  },
  
  // 检查位置合理性
  isReasonableLocation: function(location, now) {
    // 第一次接收到位置，直接保存
    if (!this.data.lastValidPosition) {
      this.data.lastValidPosition = {
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude || 0,
        timestamp: now
      };
      return true;
    }
    
    var lastPos = this.data.lastValidPosition;
    var timeDiff = (now - lastPos.timestamp) / 1000; // 秒
    
    // 时间太短，可能是重复数据
    if (timeDiff < 0.5) {
      return false;
    }
    
    // 计算距离
    var distance = this.calculateDistance(
      lastPos.latitude, lastPos.longitude,
      location.latitude, location.longitude
    );
    
    // 计算隐含速度
    var impliedSpeed = (distance / timeDiff) * 1.944; // kt
    
    // 检查隐含速度是否合理
    if (impliedSpeed > this.data.maxReasonableSpeed * 1.5) { // 给予一定容差
      console.warn('GPS位置跳变，隐含速度:', impliedSpeed.toFixed(0) + 'kt');
      this.data.anomalyCount++;
      return false;
    }
    
    // 位置合理，更新上次有效位置
    this.data.lastValidPosition = {
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude || 0,
      timestamp: now
    };
    
    return true;
  },

  // 处理缩放
  handleZoom: function(deltaDistance) {
    var currentIndex = this.data.currentZoomIndex;
    var newIndex = currentIndex;
    
    // 修复缩放方向：双指向外（deltaDistance > 0）放大地图（看更小的范围）
    // 双指向内（deltaDistance < 0）缩小地图（看更大的范围）
    if (deltaDistance > 0) {
      // 双指向外 - 放大地图（减少范围）
      newIndex = Math.max(currentIndex - 1, 0);
    } else {
      // 双指向内 - 缩小地图（增加范围）
      newIndex = Math.min(currentIndex + 1, this.data.mapZoomLevels.length - 1);
    }
    
    if (newIndex !== currentIndex) {
      this.data.currentZoomIndex = newIndex;
      this.data.mapRange = this.data.mapZoomLevels[newIndex];
      
      this.setData({
        mapRange: this.data.mapRange,
        currentZoomIndex: this.data.currentZoomIndex
      });
      
      // 重新绘制地图
      this.updateNearbyAirports();
      this.drawNavigationMap();
      
      console.log('缩放到级别:', this.data.mapRange + ' NM');
    }
  },

  // 追踪机场输入框输入事件
  onTrackAirportInput: function(e) {
    this.setData({
      trackAirportInput: e.detail.value.toUpperCase()
    });
  },

  // 追踪机场输入框确认事件
  onTrackAirportConfirm: function(e) {
    var airportCode = e.detail.value.toUpperCase().trim();
    if (!airportCode) {
      // 如果输入为空，清除追踪机场
      this.setData({
        trackedAirport: null,
        trackAirportInput: ''
      });
      return;
    }

    this.searchAndTrackAirport(airportCode);
  },

  // 搜索并追踪机场
  searchAndTrackAirport: function(airportCode) {
    var self = this;
    
    if (!this.data.airportsData) {
      wx.showToast({
        title: '机场数据未加载',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 搜索机场
    var foundAirport = null;
    for (var i = 0; i < this.data.airportsData.length; i++) {
      var airport = this.data.airportsData[i];
      if (airport.ICAOCode === airportCode || airport.IATACode === airportCode) {
        foundAirport = airport;
        break;
      }
    }

    if (!foundAirport) {
      wx.showToast({
        title: '未找到机场: ' + airportCode,
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 计算当前位置到目标机场的距离和方位
    if (this.data.latitude && this.data.longitude) {
      var currentLat = parseFloat(this.data.latitude);
      var currentLon = parseFloat(this.data.longitude);
      
      var distance = this.calculateDistanceNM(
        currentLat, currentLon,
        foundAirport.Latitude, foundAirport.Longitude
      );
      
      var bearing = this.calculateBearing(
        currentLat, currentLon,
        foundAirport.Latitude, foundAirport.Longitude
      );

      // 更新追踪机场信息
      this.setData({
        trackedAirport: {
          ICAOCode: foundAirport.ICAOCode,
          ShortName: foundAirport.ShortName || foundAirport.EnglishName,
          distance: distance.toFixed(1),
          bearing: Math.round(bearing)
        }
      });

      wx.showToast({
        title: '已追踪: ' + foundAirport.ICAOCode,
        icon: 'success',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: '位置信息不可用',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 更新追踪机场信息（在位置更新时调用）
  updateTrackedAirport: function() {
    if (!this.data.trackedAirport || !this.data.latitude || !this.data.longitude) {
      return;
    }

    // 根据机场代码重新搜索机场信息（获取完整数据）
    var airportCode = this.data.trackedAirport.ICAOCode;
    var foundAirport = null;
    
    for (var i = 0; i < this.data.airportsData.length; i++) {
      var airport = this.data.airportsData[i];
      if (airport.ICAOCode === airportCode) {
        foundAirport = airport;
        break;
      }
    }

    if (foundAirport) {
      var currentLat = parseFloat(this.data.latitude);
      var currentLon = parseFloat(this.data.longitude);
      
      var distance = this.calculateDistanceNM(
        currentLat, currentLon,
        foundAirport.Latitude, foundAirport.Longitude
      );
      
      var bearing = this.calculateBearing(
        currentLat, currentLon,
        foundAirport.Latitude, foundAirport.Longitude
      );

      // 更新追踪机场信息
      this.setData({
        trackedAirport: {
          ICAOCode: foundAirport.ICAOCode,
          ShortName: foundAirport.ShortName || foundAirport.EnglishName,
          distance: distance.toFixed(1),
          bearing: Math.round(bearing)
        }
      });
    }
  },
  
  // 切换地图定向模式
  toggleMapOrientation: function() {
    var newMode = this.data.mapOrientationMode === 'heading-up' ? 'north-up' : 'heading-up';
    
    // 切换到北向朝上时，重置稳定航向为0
    if (newMode === 'north-up') {
      this.data.mapStableHeading = 0;
    } else {
      // 切换到航向朝上时，使用当前航向
      this.data.mapStableHeading = this.data.headingMode === 'heading' ? 
        this.data.heading : this.data.track;
    }
    
    this.setData({
      mapOrientationMode: newMode
    });
    
    // 立即重绘地图
    this.drawNavigationMap();
    
    // 显示提示
    wx.showToast({
      title: newMode === 'north-up' ? '北向朝上' : '航向朝上',
      icon: 'none',
      duration: 1500
    });
  }
};

Page(BasePage.createPage(pageConfig));