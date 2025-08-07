/**
 * 驾驶舱页面 - 模块化版本
 * 
 * 采用模块化架构，将原始的2145行代码重构为6个专业模块：
 * - FlightCalculator: 飞行数据计算
 * - AirportManager: 机场搜索管理
 * - GPSManager: GPS位置追踪
 * - CompassManager: 指南针航向处理
 * - MapRenderer: Canvas地图渲染
 * - GestureHandler: 触摸手势处理
 * 
 * 主页面作为协调中心，管理模块间通信和状态同步
 */

var BasePage = require('../../utils/base-page.js');
var config = require('./modules/config.js');

// 引入生命周期管理器
var LifecycleManager = require('./modules/lifecycle-manager.js');

// 引入所有模块
var FlightCalculator = require('./modules/flight-calculator.js');
var AirportManager = require('./modules/airport-manager.js');
var GPSManager = require('./modules/gps-manager.js');
var CompassManager = require('./modules/compass-manager.js');
var GyroscopeManager = require('./modules/gyroscope-manager.js');
var AccelerometerManager = require('./modules/accelerometer-manager.js');
var MapRenderer = require('./modules/map-renderer.js');
var GestureHandler = require('./modules/gesture-handler.js');
var AttitudeIndicator = require('./modules/attitude-indicator.js');
// 移除卡尔曼滤波器，使用简化滤波器替代
var ToastManager = require('./modules/toast-manager.js');

var pageConfig = {
  data: {
    // 目标机场导航
    targetAirport: null,
    hasTargetAirport: false,
    
    // GPS数据
    latitude: 0,     // 航空格式坐标显示
    longitude: 0,    // 航空格式坐标显示
    latitudeDecimal: 0,   // 十进制坐标用于计算
    longitudeDecimal: 0,  // 十进制坐标用于计算
    altitude: 0,
    speed: 0,
    heading: 0,
    verticalSpeed: 0,
    acceleration: 0,  // 加速度（节/秒）
    
    // 姿态仪数据
    pitch: 0,        // 俯仰角
    roll: 0,         // 滚转角
    
    // 🎯 校准功能状态
    calibrationStatus: 'normal',    // normal, calibrating, success, failed
    calibrationProgress: 0,         // 校准进度文字 (如: "8s", "成功")
    isCalibrating: false,
    showAttitudeIndicator: true,  // 控制姿态仪显示
    
    // 离线模式支持
    isOfflineMode: false,
    useSimulatedData: false,
    showGPSWarning: false,
    
    // GPS过滤参数（从配置文件加载）
    maxReasonableSpeed: config.gps.maxReasonableSpeed,
    maxAcceleration: config.gps.maxAcceleration,
    speedBuffer: [],
    speedBufferSize: config.gps.speedBufferSize,
    lastValidSpeed: 0,
    lastValidPosition: null,
    anomalyCount: 0,
    maxAnomalyCount: config.gps.maxAnomalyCount,
    
    // 位置历史记录
    locationHistory: [],
    maxHistorySize: config.gps.maxHistorySize,
    
    // 航向平滑处理（从配置文件加载）
    headingBuffer: [],
    headingBufferSize: config.compass.headingBufferSize,
    lastStableHeading: 0,
    headingBaseThreshold: config.compass.headingBaseThreshold,
    headingLowSpeedThreshold: config.compass.headingLowSpeedThreshold,
    headingStability: 0,
    lastHeadingUpdateTime: 0,
    minHeadingUpdateInterval: config.compass.minHeadingUpdateInterval,
    requiredStabilityCount: config.compass.requiredStabilityCount,
    
    // 航向/航迹模式
    headingMode: 'heading',
    track: null,  // 🔧 修复：初始值改为null，避免卡在0度
    lastValidTrack: null,  // 🔧 修复：初始值改为null
    minSpeedForTrack: config.compass.minSpeedForTrack,
    
    // 权限状态
    hasLocationPermission: false,
    locationError: null,
    
    // GPS状态
    gpsStatus: '初始化中',
    gpsStatusClass: 'status-bad', // GPS状态对应的CSS类
    isOffline: false,
    lastUpdateTime: 0,
    updateCount: 0,
    
    // 卡尔曼滤波状态 - 已禁用
    // kalmanEnabled: false,       // 是否启用卡尔曼滤波  
    // kalmanConverged: false,     // 滤波器是否收敛
    
    // GPS干扰检测
    gpsInterference: false,
    lastInterferenceTime: null,
    lastWarningTime: null,  // 🆕 记录上次弹出警告的时间戳
    interferenceTimer: null,
    
    // GPS高度异常检测参数
    altitudeHistory: [],
    maxAltitudeHistory: config.gps.maxAltitudeHistory,
    altitudeAnomalyCount: 0,
    maxAltitudeAnomaly: config.gps.maxAltitudeAnomaly,
    normalDataCount: 0,
    requiredNormalCount: config.gps.requiredNormalCount,
    lastValidAltitude: null,
    
    // 高度变化阈值
    altitudeChangeThreshold: config.gps.altitudeChangeThreshold,
    altitudeRateThreshold: config.gps.altitudeRateThreshold,
    minValidAltitude: config.gps.minValidAltitude,
    maxValidAltitude: config.gps.maxValidAltitude,
    altitudeStdDevMultiplier: config.gps.altitudeStdDevMultiplier,
    minDataForStats: config.gps.minDataForStats,
    
    // 导航地图参数
    mapRange: config.map.zoomLevels[config.map.defaultZoomIndex],
    mapZoomLevels: config.map.zoomLevels,
    currentZoomIndex: config.map.defaultZoomIndex,
    nearestAirport: null,
    secondNearestAirport: null,
    trackedAirport: null,
    trackAirportInput: '',
    nearbyAirports: [],
    
    // 地图定向模式
    mapOrientationMode: 'track-up', // 🔧 修复：默认使用航迹朝上模式，确保机场相对位置正确
    mapStableHeading: 0,
    mapHeadingUpdateThreshold: config.map.headingUpdateThreshold,
    mapLowSpeedThreshold: config.map.lowSpeedThreshold,
    lastMapHeadingUpdate: 0,
    mapHeadingLocked: false,
    
    // 三机场显示标签
    leftAirport: null,
    centerAirport: null,
    rightAirport: null,
    leftAirportLabel: '最近机场',
    rightAirportLabel: '次近机场',
    
    // 距离圈选择器
    showRangeSelector: false,
    rangeOptions: [
      { name: '5 NM - 终端区', value: 5 },
      { name: '10 NM - 进近区域', value: 10 },
      { name: '20 NM - 标准区域', value: 20 },
      { name: '40 NM - 扩展区域', value: 40 },
      { name: '80 NM - 远程监视', value: 80 },
      { name: '160 NM - 航路监视', value: 160 },
      { name: '320 NM - 长途航路', value: 320 },
      { name: '640 NM - 超远程监视', value: 640 }
    ],
    
    // GPS权限调试面板
    debugPanelExpanded: false,
    getLocationPermission: false,
    locationUpdateActive: false,
    
    // 坐标系显示
    showCoordinateSystem: config.gps.showCoordinateSystem,
    coordinateSystemDisplay: config.gps.coordinateSystem === 'wgs84' ? 'WGS84' : 'GCJ02',
    locationChangeListening: false,
    debugData: {
      rawAltitude: null,
      altitudeType: 'unknown',
      altitudeValid: false,
      accuracy: 0,
      updateInterval: 0,
      filterType: '无',
      
      // 🆕 新增调试字段
      providerType: 'unknown',           // 定位提供商类型
      isGPSLocation: false,              // 是否为GPS定位
      isHighAccuracy: false,             // 是否为高精度模式
      gpsAttemptCount: 0,                // GPS获取尝试次数
      gpsStatus: '',                     // GPS状态描述
      lastUpdateTime: '未更新'           // 最后更新时间
    },
    
    // 人工地平仪数据
    showAttitudeIndicator: true,       // 是否显示人工地平仪
    attitudeIndicatorEnabled: false,   // 人工地平仪是否启用
    attitudeIndicatorState: 'uninitialized', // 姿态仪状态
    pitch: 0,                          // 俯仰角（度）
    roll: 0,                           // 滚转角（度）
    
  },
  

  customOnLoad: function(options) {
    console.log('驾驶舱页面加载 - 模块化版本', options);
    
    // 🔧 处理目标机场参数
    if (options.targetAirport) {
      try {
        var targetAirport = JSON.parse(decodeURIComponent(options.targetAirport));
        console.log('✈️ 接收到目标机场:', targetAirport);
        
        // 设置目标机场数据
        this.safeSetData({
          targetAirport: targetAirport,
          hasTargetAirport: true
        });
        
        // 显示目标机场提示
        wx.showModal({
          title: '导航目标设置',
          content: `已设置导航目标：${targetAirport.name} (${targetAirport.icao})`,
          showCancel: false,
          confirmText: '开始导航'
        });
        
      } catch (error) {
        console.error('❌ 解析目标机场参数失败:', error);
      }
    }
    
    // 🔧 新增：加载时恢复本地存储的地图状态
    this.restoreMapStateFromStorage();
    
    // 🚀 使用新的生命周期管理器
    this.initializeLifecycleManager();
    
    // 保留旧的初始化方法作为备份（逐步迁移）
    // this.initializeModules();
    // this.startServices();
  },
  
  /**
   * 🔧 从本地存储恢复地图状态
   */
  restoreMapStateFromStorage: function() {
    try {
      var storedRange = wx.getStorageSync('cockpit_lastMapRange');
      var storedIndex = wx.getStorageSync('cockpit_lastZoomIndex');
      
      if (storedRange && storedRange > 0) {
        this.safeSetData({
          mapRange: storedRange,
          currentZoomIndex: storedIndex >= 0 ? storedIndex : config.map.defaultZoomIndex
        });
        console.log('🔧 从本地存储恢复地图状态:', {
          mapRange: storedRange + 'NM',
          zoomIndex: storedIndex
        });
      } else {
        // 使用默认值
        var defaultRange = config.map.zoomLevels[config.map.defaultZoomIndex];
        this.safeSetData({
          mapRange: defaultRange,
          currentZoomIndex: config.map.defaultZoomIndex
        });
        console.log('🔧 使用默认地图状态:', {
          mapRange: defaultRange + 'NM',
          zoomIndex: config.map.defaultZoomIndex
        });
      }
    } catch (e) {
      console.warn('🔧 无法恢复本地存储的地图状态，使用默认值');
      var defaultRange = config.map.zoomLevels[config.map.defaultZoomIndex];
      this.safeSetData({
        mapRange: defaultRange,
        currentZoomIndex: config.map.defaultZoomIndex
      });
    }
  },
  
  customOnShow: function() {
    console.log('📱 驾驶舱页面显示 - 启动服务');
    
    // 🔧 修复：页面显示时先清除可能的错误状态
    this.safeSetData({
      locationError: null
    });
    
    // 🔧 新增：恢复本地存储的地图状态
    try {
      var storedRange = wx.getStorageSync('cockpit_lastMapRange');
      var storedIndex = wx.getStorageSync('cockpit_lastZoomIndex');
      
      if (storedRange && storedRange > 0) {
        var needUpdate = false;
        var updateData = {};
        
        if (this.data.mapRange <= 0 || !this.data.mapRange) {
          updateData.mapRange = storedRange;
          needUpdate = true;
          console.log('🔧 恢复mapRange:', storedRange + 'NM');
        }
        
        if (storedIndex !== undefined && storedIndex >= 0) {
          updateData.currentZoomIndex = storedIndex;
          needUpdate = true;
        }
        
        if (needUpdate) {
          this.safeSetData(updateData);
        }
      }
    } catch (e) {
      console.warn('🔧 无法恢复本地存储的地图状态');
    }
    
    // 🔧 关键修复：重新启动地图渲染循环（权限申请后必须）
    if (this.mapRenderer && this.mapRenderer.isInitialized) {
      console.log('🔧 页面显示时重新启动地图渲染循环');
      // 确保地图渲染器有正确的mapRange
      if (this.data.mapRange > 0) {
        this.mapRenderer.currentData.mapRange = this.data.mapRange;
      }
      this.mapRenderer.startRenderLoop();
      // 立即渲染一次
      this.mapRenderer.forceRender();
    }
    
    // 重新检查GPS权限状态
    if (this.gpsManager) {
      this.gpsManager.checkLocationPermission();
    }
    
    // 启动指南针（如果还没启动且支持指南针）
    if (this.compassManager) {
      var compassStatus = this.compassManager.getStatus();
      if (!compassStatus.isRunning && compassStatus.compassSupported !== false) {
        var context = this.getCurrentContext();
        console.log('🧭 页面显示时启动指南针');
        this.compassManager.start(context);
      } else {
        console.log('🧭 指南针已运行或不支持，跳过启动');
      }
    }
  },
  
  customOnHide: function() {
    console.log('🌙 驾驶舱页面隐藏 - 暂停服务以节省资源');
    
    // 停止GPS追踪
    if (this.gpsManager) {
      this.gpsManager.stopLocationTracking();
    }
    
    // 停止指南针以节省电量和资源
    if (this.compassManager && this.compassManager.getStatus().isRunning) {
      this.compassManager.stop();
    }
    
    // 停止地图渲染
    if (this.mapRenderer) {
      this.mapRenderer.stopRenderLoop();
    }
  },
  
  customOnUnload: function() {
    console.log('🗑️ 驾驶舱页面卸载 - 销毁所有模块');
    
    // 立即标记页面为销毁状态，防止后续setData操作
    this._isDestroying = true;
    
    // 🔒 立即清理所有专用定时器，防止延迟回调
    if (this.locationUpdateTimer) {
      clearTimeout(this.locationUpdateTimer);
      this.locationUpdateTimer = null;
    }
    
    if (this.mapRenderUpdateTimer) {
      clearTimeout(this.mapRenderUpdateTimer);
      this.mapRenderUpdateTimer = null;
    }

    if (this.data.interferenceTimer) {
      clearTimeout(this.data.interferenceTimer);
    }
    
    // 先停止所有可能触发setData的操作
    if (this.mapRenderer) {
      this.mapRenderer.stopRenderLoop();
    }
    
    // 延迟一点再销毁模块，确保所有pending的操作完成 - 使用安全定时器
    var self = this;
    this.createSafeTimeout(function() {
      self.destroyModules();
    }, 100, '模块销毁延迟');
  },
  
  /**
   * 初始化所有模块
   */
  initializeModules: function() {
    var self = this;
    
    // 0. 创建Toast管理器（优先创建，供其他模块使用）
    this.toastManager = ToastManager.create(config);
    
    // 1. 创建飞行计算器（纯函数模块）
    this.flightCalculator = FlightCalculator.create(config);
    
    // 2. 创建机场管理器
    this.airportManager = AirportManager.create(config);
    this.airportManager.init(this, {
      onAirportsLoaded: function(airports) {
        console.log('机场数据加载完成:', airports.length);
        self.updateNearbyAirports();
      },
      onNearbyAirportsUpdate: function(airports) {
        self.safeSetData({
          nearbyAirports: airports
        });
        self.updateThreeAirportsDisplay();
        self.updateMapRenderer();
      },
      onTrackedAirportChange: function(airport) {
        self.safeSetData({
          trackedAirport: airport,
          trackAirportInput: airport ? airport.ICAOCode : ''
        });
        self.updateThreeAirportsDisplay();
        self.updateMapRenderer();
      },
      onLoadError: function(error) {
        self.handleError(error, '机场数据加载');
      }
    }, this.flightCalculator);
    
    // 3. 移除卡尔曼滤波器，使用简化滤波器替代
    console.log('✅ 使用简化滤波器，无需复杂的卡尔曼滤波器');
    
    // 4. 创建GPS管理器
    this.gpsManager = GPSManager.create(config);
    this.gpsManager.init(this, {
      onPermissionGranted: function() {
        console.log('🔧 GPS权限已授予，执行完整状态重置流程');
        
        // 🔧 增强修复：从多个来源获取有效的mapRange
        var validMapRange = self.data.mapRange;
        
        // 尝试从本地存储恢复
        if (!validMapRange || validMapRange <= 0) {
          try {
            var storedRange = wx.getStorageSync('cockpit_lastMapRange');
            if (storedRange && storedRange > 0) {
              validMapRange = storedRange;
              console.log('🔧 从本地存储恢复mapRange:', validMapRange + 'NM');
            }
          } catch (e) {
            console.warn('🔧 无法读取本地存储的mapRange');
          }
        }
        
        // 如果仍然无效，使用配置的默认值
        if (!validMapRange || validMapRange <= 0) {
          validMapRange = config.map.zoomLevels[config.map.defaultZoomIndex];
          console.log('🔧 使用配置默认值:', validMapRange + 'NM');
        }
        
        // 保存有效的mapRange到本地存储
        try {
          wx.setStorageSync('cockpit_lastMapRange', validMapRange);
        } catch (e) {
          console.warn('🔧 无法保存mapRange到本地存储');
        }
        
        // 🔧 增强修复：多步骤状态重置，确保完全同步
        self.safeSetData({
          hasLocationPermission: true,
          locationError: null,
          showGPSWarning: false,
          gpsStatus: '权限已授予',
          mapRange: validMapRange,
          currentZoomIndex: self.data.currentZoomIndex || config.map.defaultZoomIndex
        });
        
        // 🔧 增强修复：分阶段地图状态恢复，确保完全生效
        console.log('🔧 开始分阶段地图状态恢复流程');
        
        // 第一阶段：立即强制地图数据同步
        if (self.mapRenderer && self.mapRenderer.isInitialized) {
          self.mapRenderer.currentData.mapRange = validMapRange;
          console.log('🔧 第一阶段：强制同步地图渲染器mapRange:', validMapRange);
          // 立即强制渲染一次
          self.mapRenderer.forceRender();
        }
        
        // 第二阶段：延迟更新确保所有状态已同步
        setTimeout(function() {
          console.log('🔧 第二阶段：延迟强制地图更新');
          self.forceMapStateRecovery();
        }, 100);
        
        // 第三阶段：最终验证和恢复
        setTimeout(function() {
          console.log('🔧 第三阶段：最终验证地图状态');
          self.validateAndFixMapState();
        }, 500);
      },
      onForceMapUpdate: function() {
        // 🔧 修复：强制地图更新回调
        console.log('🔧 强制更新地图渲染（GPS权限授予后）');
        if (self.mapRenderer && self.mapRenderer.isInitialized) {
          // 🔧 修复：确保mapRange有有效值，防止距离圈消失
          var validMapRange = self.data.mapRange;
          if (!validMapRange || validMapRange === 0) {
            validMapRange = config.map.zoomLevels[config.map.defaultZoomIndex];
            console.log('🔧 mapRange无效，使用默认值:', validMapRange + 'NM');
            
            // 同时更新页面数据，避免下次仍然无效
            self.safeSetData({
              mapRange: validMapRange,
              currentZoomIndex: config.map.defaultZoomIndex
            });
          }
          
          // 强制重新设置地图数据
          var renderData = {
            latitude: parseFloat(self.data.latitudeDecimal) || 0,
            longitude: parseFloat(self.data.longitudeDecimal) || 0,
            altitude: self.data.altitude || 0,
            speed: self.data.speed || 0,
            heading: self.data.heading || 0,
            track: self.data.track || 0,
            headingMode: self.data.headingMode || 'heading',
            nearbyAirports: self.data.nearbyAirports || [],
            trackedAirport: self.data.trackedAirport || null,
            mapRange: validMapRange, // 🔧 修复：使用有效的mapRange值
            mapOrientationMode: self.data.mapOrientationMode || 'heading-up',
            mapStableHeading: self.data.mapStableHeading || 0
          };
          
          console.log('🔧 强制更新地图数据:', {
            mapRange: renderData.mapRange,
            dataMapRange: self.data.mapRange,
            hasRenderer: !!self.mapRenderer,
            isInitialized: self.mapRenderer.isInitialized
          });
          
          self.mapRenderer.updateData(renderData);
          self.mapRenderer.render(); // 强制重新渲染
        }
      },
      onPermissionError: function(error) {
        self.handleError(error, 'GPS权限');
      },
      onLocationUpdate: function(locationData) {
        // \u8282\u6d41\u4f4d\u7f6e\u66f4\u65b0\u4ee5\u51cf\u5c11DOM\u64cd\u4f5c\u9891\u7387
        self.throttleLocationUpdate(locationData);
      },
      onLocationError: function(errorMsg) {
        // 🔧 修复：只有在错误消息不为null时才设置错误状态
        if (errorMsg !== null) {
          console.log('🔧 GPS位置错误:', errorMsg);
          // ⚠️ 高优先级：位置错误是关键信息
          self.safeSetData({
            locationError: errorMsg
          }, null, {
            priority: 'high'
          });
        } else {
          // 🔧 修复：清除错误状态
          console.log('🔧 清除GPS位置错误状态');
          // ✅ 普通优先级：清除错误状态
          self.safeSetData({
            locationError: null
          }, null, {
            priority: 'normal'
          });
        }
      },
      onGPSStatusChange: function(status) {
        // 🚀 高优先级：GPS状态是关键飞行信息
        self.safeSetData({
          gpsStatus: status,
          gpsStatusClass: self.calculateGPSStatusClass(status)
        }, null, {
          priority: 'high',
          throttleKey: 'gps'
        });
      },
      onNetworkStatusChange: function(networkInfo) {
        // 🌐 普通优先级：网络状态信息
        self.safeSetData({
          isOffline: networkInfo.isOffline,
          isOfflineMode: networkInfo.isOffline
        }, null, {
          priority: 'normal',
          throttleKey: 'status'
        });
      },
      onInterferenceDetected: function(interferenceInfo) {
        var currentTime = Date.now();
        var lastWarningTime = self.data.lastWarningTime;
        var cooldownPeriod = 10 * 60 * 1000; // 10分钟冷却期
        
        // 🚨 检查是否在冷却期内
        var inCooldown = lastWarningTime && (currentTime - lastWarningTime) < cooldownPeriod;
        
        if (!inCooldown) {
          console.warn('🚨 GPS干扰警告 - 冷却期已过，弹出警告');
          
          // 弹出警告对话框
          wx.showModal({
            title: 'GPS干扰警告',
            content: interferenceInfo.message + '\n\n发生时间: ' + interferenceInfo.time + '\n\n请注意核对其他导航参考，系统将在10分钟后自动恢复。',
            showCancel: false,
            confirmText: '我知道了',
            confirmColor: '#ff6b00'
          });
          
          // 更新警告时间戳
          self.safeSetData({
            lastWarningTime: currentTime
          });
        } else {
          var remainingTime = Math.ceil((cooldownPeriod - (currentTime - lastWarningTime)) / 60000);
          console.log('🔄 GPS干扰检测 - 冷却期内，剩余' + remainingTime + '分钟，不弹出警告');
        }
        
        // 清除之前的恢复定时器
        if (self.data.interferenceTimer) {
          clearTimeout(self.data.interferenceTimer);
        }
        
        // 设置GPS干扰状态
        self.safeSetData({
          gpsInterference: true,
          lastInterferenceTime: interferenceInfo.time
        });
        
        // 设置10分钟后自动恢复的定时器
        var recoveryTimer = setTimeout(function() {
          console.log('⏰ GPS干扰自动恢复时间到达');
          self.safeSetData({
            gpsInterference: false,
            interferenceTimer: null,
            lastInterferenceTime: null,  // 🔧 自动恢复后清除干扰时间记录
            lastWarningTime: null        // 🔧 自动恢复后清除警告时间戳，允许新的警告
          });
          
          // 显示恢复提示
          wx.showToast({
            title: 'GPS干扰状态已自动恢复',
            icon: 'success',
            duration: 3000
          });
        }, 10 * 60 * 1000); // 10分钟
        
        // 保存定时器引用
        self.safeSetData({
          interferenceTimer: recoveryTimer
        });
      },
      onInterferenceCleared: function() {
        // 清除干扰状态和时间记录
        self.safeSetData({
          gpsInterference: false,
          lastInterferenceTime: null,  // 🔧 手动清除时也清除时间记录
          lastWarningTime: null        // 🔧 手动清除时也清除警告时间戳
        });
      },
      onSimulatedModeStart: function(simulatedData) {
        self.safeSetData(simulatedData);
      },
      onOfflineModeStart: function() {
        self.safeSetData({
          showGPSWarning: true,
          useSimulatedData: true,
          locationError: null
        });
      },
      onContextUpdate: function(contextUpdate) {
        // 添加页面状态检查
        if (self._isDestroying || self.isDestroying) {
          console.log('🛑 页面销毁中，忽略上下文更新');
          return;
        }
        self.safeSetData(contextUpdate);
      },
      getCurrentContext: function() {
        return self.getCurrentContext();
      }
    }, config); // GPS管理器需要配置对象
    
    // 5. 创建传感器管理器（按依赖顺序）
    // 5a. 创建陀螺仪管理器（独立传感器）
    this.gyroscopeManager = GyroscopeManager.create(config);
    this.gyroscopeManager.init(this, {
      onGyroscopeStart: function() {
        console.log('🌀 陀螺仪启动成功（传统模式）');
      },
      onGyroscopeUpdate: function(data) {
        // 陀螺仪数据由指南针管理器融合处理，这里不需要额外处理
      },
      onGyroscopeStop: function() {
        console.log('🌀 陀螺仪停止（传统模式）');
      },
      onGyroscopeError: function(err) {
        console.log('⚠️ 陀螺仪不可用（传统模式）:', err.errMsg);
      }
    });
    
    // 5b. 创建加速度计管理器（独立传感器）
    this.accelerometerManager = AccelerometerManager.create(config);
    this.accelerometerManager.init(this, {
      onAccelerometerStart: function() {
        console.log('⚡ 加速度计启动成功（传统模式）');
      },
      onAccelerometerUpdate: function(data) {
        // 加速度计数据由指南针管理器融合处理，这里不需要额外处理
      },
      onAccelerometerStop: function() {
        console.log('⚡ 加速度计停止（传统模式）');
      },
      onAccelerometerError: function(err) {
        console.log('⚠️ 加速度计不可用（传统模式）:', err.errMsg);
      }
    });
    
    // 5c. 创建指南针管理器（三传感器融合）
    this.compassManager = CompassManager.create(config);
    this.compassManager.init(this, {
      onHeadingUpdate: function(headingData) {
        console.log('🧭 航向数据更新:', {
          heading: headingData.heading,
          lastStableHeading: headingData.lastStableHeading,
          speed: self.data.speed
        });
        self.safeSetData(headingData);
        self.updateMapRenderer();
      },
      onModeChange: function(modeInfo) {
        self.safeSetData({
          headingMode: modeInfo.newMode
        });
      },
      onCompassReady: function() {
        console.log('✅ 指南针就绪 - 开始接收航向数据');
        
        // 🔧 添加指南针状态诊断
        var compassStatus = self.compassManager.getStatus();
        console.log('🧭 指南针状态:', compassStatus);
        
        // 清除任何GPS警告，因为指南针正常工作
        self.safeSetData({
          showGPSWarning: false
        });
      },
      onCompassError: function(errorInfo) {
        console.error('指南针错误详情:', errorInfo);
        
        // 不再使用通用的handleError，因为compass-manager已经处理了用户提示
        if (errorInfo.fallback) {
          // 设备不支持指南针，已自动切换到GPS模式
          console.log('指南针不可用，使用GPS航迹替代');
        } else if (errorInfo.canRetry) {
          console.log('指南针错误可重试，重试次数:', errorInfo.retryCount);
        }
      },
      onFallbackToGPS: function(fallbackInfo) {
        console.log('指南针降级到GPS模式:', fallbackInfo.reason);
        
        // 强制切换到航迹模式
        self.safeSetData({
          headingMode: 'track'
        });
        
        // 显示GPS模式提示
        self.safeSetData({
          showGPSWarning: true
        });
      },
      onMapHeadingUpdate: function(headingUpdate) {
        self.safeSetData(headingUpdate);
        self.updateMapRenderer();
      },
      onMapHeadingLock: function(lockUpdate) {
        self.safeSetData(lockUpdate);
      },
      onMapHeadingUnlock: function() {
        self.safeSetData({
          mapHeadingLocked: false
        });
      },
      onContextUpdate: function(contextUpdate) {
        // 添加页面状态检查  
        if (self._isDestroying || self.isDestroying) {
          console.log('🛑 页面销毁中，忽略指南针上下文更新');
          return;
        }
        self.safeSetData(contextUpdate);
      }
    }); // 指南针管理器无需滤波器
    
    // 5. 创建地图渲染器
    this.mapRenderer = MapRenderer.create('navigationMap', config);
    this.mapRenderer.init(this, {
      onCanvasReady: function(canvasInfo) {
        console.log('Canvas就绪:', canvasInfo);
        // 初始化完成后强制同步缩放数据
        console.log('初始化缩放数据同步检查:', {
          pageRange: self.data.mapRange,
          pageIndex: self.data.currentZoomIndex,
          configDefault: config.map.zoomLevels[config.map.defaultZoomIndex]
        });
        
        // 强制重置为默认缩放级别，防止异常数据
        var defaultRange = config.map.zoomLevels[config.map.defaultZoomIndex];
        self.safeSetData({
          mapRange: defaultRange,
          currentZoomIndex: config.map.defaultZoomIndex
        });
        
        self.updateMapRenderer();
      },
      onZoomChange: function(zoomInfo) {
        // 地图渲染器缩放变化回调，确保UI显示同步
        console.log('地图缩放同步:', zoomInfo);
      },
      onCanvasError: function(error) {
        self.handleError(error, '地图Canvas');
      },
      onRenderError: function(error) {
        console.error('地图渲染错误:', error);
      },
      onOrientationChange: function(orientationInfo) {
        self.safeSetData({
          mapOrientationMode: orientationInfo.newMode
        });
      }
    });
    
    // 6. 人工地平仪 - 现在由attitude-indicator.js独立控制
    if (this.data.showAttitudeIndicator) {
      AttitudeIndicator.autoInit();
    }
    
    // 7. 创建手势处理器
    this.gestureHandler = GestureHandler.create(config);
    this.gestureHandler.init('navigationMap', {
      onZoom: function(zoomData) {
        self.handleZoom(zoomData.deltaDistance);
      },
      onTap: function(tapData) {
        console.log('地图点击:', tapData);
      },
      onPinchStart: function(pinchData) {
        console.log('开始缩放:', pinchData);
      },
      onPinchEnd: function() {
        console.log('结束缩放');
      }
    });
  },
  
  /**
   * 启动服务
   */
  startServices: function() {
    // 加载机场数据
    this.airportManager.loadAirportsData();
    
    // 🔧 修复：主动启动GPS追踪
    console.log('🛰️ 启动GPS位置追踪服务');
    this.gpsManager.checkLocationPermission();
  },
  
  /**
   * 处理位置更新 - 修复高度处理逻辑和航迹更新
   * @param {Object} locationData 位置数据
   */
  handleLocationUpdate: function(locationData) {
    if (!locationData) return;
    
    // 修复：正确处理高度数据，区分无数据和0高度
    var altitudeValue = locationData.altitude;
    if (altitudeValue === null || altitudeValue === undefined) {
      altitudeValue = 0; // 显示时用0，但标记为无效
    }
    
    // 计算更新间隔
    var now = Date.now();
    var updateInterval = this.lastUpdateTime ? now - this.lastUpdateTime : 0;
    this.lastUpdateTime = now;
    
    // 更新位置历史记录
    this.data.locationHistory.push({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      altitude: altitudeValue,
      speed: locationData.speed || 0,
      timestamp: locationData.timestamp || now
    });
    
    // 限制历史记录大小
    if (this.data.locationHistory.length > this.data.maxHistorySize) {
      this.data.locationHistory.shift();
    }
    
    // 使用FlightCalculator计算飞行数据（包括加速度和垂直速度）
    var flightData = this.flightCalculator.calculateFlightData(
      this.data.locationHistory,
      this.data.minSpeedForTrack
    );
    
    // 🔧 航迹变化检测 - 用于强制更新地图
    var previousTrack = this.data.track;
    var trackChanged = false;
    var newTrack = null;
    
    // 🚀 高优先级：位置数据是关键飞行信息，但需要GPS节流
    this.safeSetData({
      latitude: locationData.latitudeAviation || locationData.latitude || 0,
      longitude: locationData.longitudeAviation || locationData.longitude || 0,
      // 保存原始十进制坐标用于机场计算
      latitudeDecimal: locationData.latitude || 0,
      longitudeDecimal: locationData.longitude || 0,
      altitude: Math.round(altitudeValue || 0),
      speed: Math.round(locationData.speed || 0),
      verticalSpeed: flightData.verticalSpeed || 0,
      acceleration: flightData.acceleration || 0,
      lastUpdateTime: locationData.timestamp || Date.now(),
      updateCount: (this.data.updateCount || 0) + 1,
      gpsStatus: '定位正常',
      gpsStatusClass: 'status-good',
      getLocationPermission: true,
      gpsInterference: false,
      locationError: null
    }, null, {
      priority: 'high',
      throttleKey: 'gps'
    });
    
    // 📊 低优先级：调试数据单独更新，使用严格节流
    this.safeSetData({
      'debugData.rawAltitude': locationData.rawAltitudeMeters || 0,
      'debugData.altitudeType': typeof locationData.rawAltitudeMeters,
      'debugData.altitudeValid': locationData.altitudeValid || false,
      'debugData.accuracy': locationData.accuracy || 0,
      'debugData.updateInterval': updateInterval || 0,
      'debugData.filterType': locationData.filterType || '无',
      'debugData.providerType': locationData.provider || 'unknown',
      'debugData.isGPSLocation': !!(locationData.provider && locationData.provider !== 'network'),
      'debugData.isHighAccuracy': true,
      'debugData.lastUpdateTime': new Date().toLocaleTimeString()
    }, null, {
      priority: 'low',
      throttleKey: 'debug'
    });
    
    // 🔧 修复：更新航迹（改进静止状态处理和变化检测）
    // 航迹数据检查（静默）
    
    if (locationData.track !== undefined && locationData.track !== null) {
      // 有有效的航迹数据，格式化为整数
      var trackInt = Math.round(locationData.track);
      newTrack = trackInt;
      
      // 检测航迹是否发生变化（大于1度）
      if (previousTrack !== null && previousTrack !== undefined) {
        var trackDiff = Math.abs(trackInt - previousTrack);
        if (trackDiff > 180) trackDiff = 360 - trackDiff; // 处理跨越0度的情况
        if (trackDiff > 1) {
          trackChanged = true;
          console.log('🔄 检测到航迹变化:', previousTrack + '° → ' + trackInt + '° (变化' + trackDiff + '°)');
        }
      }
      
      // 🚀 高优先级：航迹是关键飞行数据
      this.safeSetData({
        track: trackInt,
        lastValidTrack: trackInt
      }, null, {
        priority: 'high',
        throttleKey: 'gps'
      });
      // 更新航迹（静默）
    } else {
      // 🔧 新增：没有航迹数据时的处理
      // 1. 优先使用上次有效航迹
      if (this.data.lastValidTrack !== undefined && this.data.lastValidTrack !== null) {
        newTrack = this.data.lastValidTrack;
        
        // 🔧 修复：在静止状态也要检测航迹变化
        if (previousTrack !== null && previousTrack !== undefined) {
          var trackDiff = Math.abs(this.data.lastValidTrack - previousTrack);
          if (trackDiff > 180) trackDiff = 360 - trackDiff;
          if (trackDiff > 1) {
            trackChanged = true;
            console.log('🔄 静止状态检测到航迹变化:', previousTrack + '° → ' + this.data.lastValidTrack + '° (变化' + trackDiff + '°)');
          }
        }
        
        // 🚀 高优先级：保持航迹显示
        this.safeSetData({
          track: this.data.lastValidTrack
        }, null, {
          priority: 'high'
        });
        console.log('🔒 静止状态，保持上次航迹:', this.data.lastValidTrack + '°');
      } else {
        // 2. 如果有指南针航向，使用指南针航向
        if (this.data.heading && this.data.heading !== 0) {
          var headingInt = Math.round(this.data.heading);
          newTrack = headingInt;
          
          // 🔧 修复：使用指南针航向时也要检测变化
          if (previousTrack !== null && previousTrack !== undefined) {
            var trackDiff = Math.abs(headingInt - previousTrack);
            if (trackDiff > 180) trackDiff = 360 - trackDiff;
            if (trackDiff > 1) {
              trackChanged = true;
              console.log('🔄 指南针航向变化:', previousTrack + '° → ' + headingInt + '° (变化' + trackDiff + '°)');
            }
          }
          
          // 🚀 高优先级：航向数据
          this.safeSetData({
            track: headingInt,
            lastValidTrack: headingInt
          }, null, {
            priority: 'high',
            throttleKey: 'sensor'
          });
          console.log('🧭 使用指南针航向作为航迹:', headingInt + '°');
        } else {
          // 3. 完全没有方向信息时，保持当前值或使用默认北向
          if (this.data.track === 0 || this.data.track === undefined) {
            console.log('⭐ 无航向数据，保持当前航迹显示');
            // 不更新track，保持当前显示值
          }
        }
      }
    }
    
    // 更新附近机场
    this.updateNearbyAirports();
    
    // 更新追踪机场
    this.updateTrackedAirport();
    
    // 🔧 关键修复：航迹变化时强制更新地图渲染，确保机场相对位置正确
    if (trackChanged) {
      console.log('🗺️ 航迹变化，强制刷新地图渲染以更新机场相对位置');
      
      // 🔧 强制设置并同步track-up模式
      this.safeSetData({
        mapOrientationMode: 'track-up'
      });
      
      // 立即强制更新地图渲染器，不使用智能渲染优化
      if (this.mapRenderer && this.mapRenderer.isInitialized) {
        // 🔧 增强修复：多重强制刷新确保生效
        this.mapRenderer.renderThrottleEnabled = false; // 临时禁用渲染优化
        
        // 强制清除地图渲染器的稳定航向缓存
        this.mapRenderer.currentData.mapStableHeading = undefined;
        
        // 🔧 关键修复：强制设置地图渲染器为track-up模式
        this.mapRenderer.currentData.mapOrientationMode = 'track-up';
        
        // 立即更新数据并强制渲染
        this.updateMapRenderer();
        this.mapRenderer.forceRender(); // 强制立即渲染
        
        // 再次强制渲染确保生效
        setTimeout(function() {
          if (this.mapRenderer && this.mapRenderer.isInitialized) {
            this.mapRenderer.forceRender();
            console.log('✅ 二次强制渲染完成 - track-up模式');
          }
        }.bind(this), 50);
        
        // 恢复渲染优化
        setTimeout(function() {
          if (this.mapRenderer) {
            this.mapRenderer.renderThrottleEnabled = config.performance.renderOptimization ? 
              config.performance.renderOptimization.enableSmartRender : false;
            console.log('🔧 渲染优化已恢复');
          }
        }.bind(this), 200);
      }
    } else {
      // 正常更新地图渲染
      this.updateMapRenderer();
    }
  },
  
  /**
   * 更新附近机场
   */
  updateNearbyAirports: function() {
    if (!this.airportManager) {
      console.warn('⚠️ 机场管理器不可用，跳过附近机场更新');
      return;
    }
    
    if (this.data.latitudeDecimal && this.data.longitudeDecimal) {
      var airports = this.airportManager.updateNearbyAirports(
        parseFloat(this.data.latitudeDecimal),
        parseFloat(this.data.longitudeDecimal),
        this.data.mapRange
      );
    }
  },
  
  /**
   * 更新追踪机场
   */
  updateTrackedAirport: function() {
    if (!this.airportManager) {
      console.warn('⚠️ 机场管理器不可用，跳过追踪机场更新');
      return;
    }
    
    if (this.data.trackedAirport && this.data.latitudeDecimal && this.data.longitudeDecimal) {
      this.airportManager.updateTrackedAirport(
        this.data.trackedAirport.ICAOCode,
        parseFloat(this.data.latitudeDecimal),
        parseFloat(this.data.longitudeDecimal)
      );
    }
  },
  
  /**
   * 更新三机场显示
   */
  updateThreeAirportsDisplay: function() {
    if (!this.airportManager) {
      console.warn('⚠️ 机场管理器不可用，跳过三机场显示更新');
      return;
    }
    
    var result = this.airportManager.updateThreeAirportsDisplay(
      this.data.nearbyAirports,
      this.data.trackedAirport
    );
    
    this.safeSetData({
      leftAirport: result.leftAirport,
      centerAirport: result.centerAirport,
      rightAirport: result.rightAirport,
      leftAirportLabel: result.leftAirportLabel,
      rightAirportLabel: result.rightAirportLabel
    });
  },
  
  /**
   * 节流位置更新以减少DOM操作频率
   */
  throttleLocationUpdate: function(locationData) {
    // 检查页面状态
    if (this._isDestroying || this.isDestroying) {
      console.log('🛑 页面销毁中，忽略位置更新');
      return;
    }
    
    // 存储最新的位置数据
    this.pendingLocationData = locationData;
    
    // 如果已有pending的更新，跳过
    if (this.locationUpdateTimer) {
      return;
    }
    
    var self = this;
    this.locationUpdateTimer = this.createSafeTimeout(function() {
      self.locationUpdateTimer = null;
      
      // 再次检查页面状态
      if (!self._isDestroying && !self.isDestroying && self.pendingLocationData) {
        self.handleLocationUpdate(self.pendingLocationData);
        self.pendingLocationData = null;
      }
    }, 200, 'GPS位置更新节流'); // 200ms节流，减少高频更新
  },

  /**
   * 更新地图渲染器数据（增强DOM安全性检查和节流）
   */
  updateMapRenderer: function() {
    // 检查页面状态
    if (this._isDestroying || this.isDestroying) {
      console.log('🛑 页面销毁中，跳过地图渲染器更新');
      return;
    }
    
    if (!this.mapRenderer) return;
    
    var renderData = {
      latitude: parseFloat(this.data.latitudeDecimal),
      longitude: parseFloat(this.data.longitudeDecimal),
      altitude: this.data.altitude,
      speed: this.data.speed,
      heading: this.data.heading,
      track: this.data.track,
      headingMode: this.data.headingMode,
      nearbyAirports: this.data.nearbyAirports,
      trackedAirport: this.data.trackedAirport,
      mapRange: this.data.mapRange,
      mapOrientationMode: this.data.mapOrientationMode,
      mapStableHeading: this.data.mapStableHeading
    };
    
    // 每秒输出一次数据状态（避免过于频繁）
    if (!this.lastDebugTime || Date.now() - this.lastDebugTime > 1000) {
      console.log('📡 updateMapRenderer数据:', {
        headingMode: renderData.headingMode,
        heading: renderData.heading,
        track: renderData.track,
        speed: renderData.speed,
        mapRange: renderData.mapRange,
        nearbyAirportsCount: renderData.nearbyAirports ? renderData.nearbyAirports.length : 0
      });
      this.lastDebugTime = Date.now();
    }
    
    try {
      this.mapRenderer.updateData(renderData);
    } catch (error) {
      console.error('❌ 地图渲染器更新失败:', error);
    }
  },
  
  /**
   * 节流地图渲染器更新
   */
  throttleMapRendererUpdate: function() {
    if (this.mapRenderUpdateTimer) {
      return; // 已有pending的更新，跳过
    }
    
    var self = this;
    this.mapRenderUpdateTimer = setTimeout(function() {
      self.mapRenderUpdateTimer = null;
      
      // 再次检查页面状态
      if (!self._isDestroying && !self.isDestroying) {
        self.updateMapRenderer();
      }
    }, 100); // 100ms节流
  },
  
  /**
   * 计算GPS状态对应的CSS类
   * @param {String} gpsStatus GPS状态文本
   * @returns {String} CSS类名
   */
  calculateGPSStatusClass: function(gpsStatus) {
    if (!gpsStatus || typeof gpsStatus !== 'string') {
      return 'status-bad';
    }
    
    if (gpsStatus.indexOf('正常') > -1) {
      return 'status-good';
    } else if (gpsStatus.indexOf('弱') > -1 || gpsStatus.indexOf('缓慢') > -1) {
      return 'status-weak';
    } else {
      return 'status-bad';
    }
  },
  
  /**
   * 获取当前上下文（供模块使用）
   * @returns {Object} 当前页面状态上下文
   */
  getCurrentContext: function() {
    return {
      // GPS相关状态
      speedBuffer: this.data.speedBuffer,
      lastValidSpeed: this.data.lastValidSpeed,
      anomalyCount: this.data.anomalyCount,
      lastValidPosition: this.data.lastValidPosition,
      locationHistory: this.data.locationHistory,
      
      // 高度干扰检测状态
      altitudeHistory: this.data.altitudeHistory,
      altitudeAnomalyCount: this.data.altitudeAnomalyCount,
      normalDataCount: this.data.normalDataCount,
      lastValidAltitude: this.data.lastValidAltitude,
      
      // 指南针相关状态
      headingBuffer: this.data.headingBuffer,
      headingStability: this.data.headingStability,
      lastStableHeading: this.data.lastStableHeading,
      lastHeadingUpdateTime: this.data.lastHeadingUpdateTime,
      currentSpeed: this.data.speed,
      
      // 地图相关状态
      mapOrientationMode: this.data.mapOrientationMode,
      mapStableHeading: this.data.mapStableHeading,
      mapHeadingLocked: this.data.mapHeadingLocked,
      lastMapHeadingUpdate: this.data.lastMapHeadingUpdate,
      
      // 其他状态
      isOffline: this.data.isOffline,
      isOfflineMode: this.data.isOfflineMode,
      useSimulatedData: this.data.useSimulatedData,
      gpsInterference: this.data.gpsInterference,
      lastUpdateTime: this.data.lastUpdateTime,
      headingMode: this.data.headingMode,
      heading: this.data.heading,
      track: this.data.track
    };
  },
  
  /**
   * 处理缩放操作（强化版：完全同步缩放数据）
   * @param {Number} deltaDistance 距离变化
   */
  handleZoom: function(deltaDistance) {
    console.log('缩放操作开始，当前状态:', {
      currentIndex: this.data.currentZoomIndex,
      currentRange: this.data.mapRange,
      deltaDistance: deltaDistance
    });
    
    var zoomResult = this.gestureHandler.handleZoom(
      deltaDistance,
      this.data.mapZoomLevels,
      this.data.currentZoomIndex
    );
    
    if (zoomResult.changed) {
      console.log('缩放结果:', zoomResult);
      
      // 强制更新页面数据
      this.safeSetData({
        currentZoomIndex: zoomResult.newIndex,
        mapRange: zoomResult.newRange
      });
      
      // 保存缩放级别到本地存储
      try {
        wx.setStorageSync('cockpit_lastMapRange', zoomResult.newRange);
        wx.setStorageSync('cockpit_lastZoomIndex', zoomResult.newIndex);
      } catch (e) {
        console.warn('无法保存缩放级别到本地存储');
      }
      
      // 立即同步到地图渲染器
      if (this.mapRenderer) {
        this.mapRenderer.setZoomLevel(zoomResult.newRange, zoomResult.newIndex);
      }
      
      // 强制重新渲染以确保视觉效果更新
      this.updateMapRenderer();
      
      // 重新计算附近机场
      this.updateNearbyAirports();
      
      console.log('✅ 缩放完成:', {
        newRange: zoomResult.newRange + ' NM',
        newIndex: zoomResult.newIndex,
        pageRange: this.data.mapRange,
        pageIndex: this.data.currentZoomIndex
      });
    }
  },
  
  // ========== 用户交互事件处理 ==========
  
  /**
   * 切换航向/航迹模式
   */
  toggleHeadingMode: function() {
    if (this.compassManager) {
      this.compassManager.toggleHeadingMode(this.data.headingMode);
    }
  },
  
  /**
   * 切换地图定向模式
   */
  toggleMapOrientation: function() {
    if (this.mapRenderer) {
      this.mapRenderer.toggleOrientation();
    }
  },

  
  /**
   * 地图触摸事件处理
   */
  onMapTouchStart: function(e) {
    if (this.gestureHandler) {
      this.gestureHandler.onTouchStart(e);
    }
  },
  
  onMapTouchMove: function(e) {
    if (this.gestureHandler) {
      this.gestureHandler.onTouchMove(e);
    }
  },
  
  onMapTouchEnd: function(e) {
    if (this.gestureHandler) {
      this.gestureHandler.onTouchEnd(e);
    }
  },
  
  /**
   * 追踪机场输入处理
   */
  onTrackAirportInput: function(e) {
    this.safeSetData({
      trackAirportInput: e.detail.value.toUpperCase()
    });
  },
  
  onTrackAirportConfirm: function(e) {
    if (!this.airportManager) {
      console.warn('⚠️ 机场管理器不可用，无法处理机场追踪');
      return;
    }
    
    var airportCode = e.detail.value.toUpperCase().trim();
    if (!airportCode) {
      // 清除追踪机场
      this.airportManager.clearTrackedAirport();
      this.safeSetData({
        trackAirportInput: ''
      });
      return;
    }
    
    // 搜索并追踪机场
    if (this.data.latitudeDecimal && this.data.longitudeDecimal) {
      this.airportManager.searchAndTrackAirport(
        airportCode,
        parseFloat(this.data.latitudeDecimal),
        parseFloat(this.data.longitudeDecimal)
      );
    }
  },
  
  /**
   * 机场卡片点击事件处理
   */
  onAirportCardTap: function(e) {
    var airport = e.currentTarget.dataset.airport;
    var cardType = e.currentTarget.dataset.type;
    
    console.log('点击机场卡片:', cardType, airport);
    
    // 检查是否有有效的机场数据
    if (!airport || !airport.ICAOCode) {
      console.log('无效的机场数据，跳过追踪');
      return;
    }
    
    // 检查GPS位置是否可用
    if (!this.data.latitudeDecimal || !this.data.longitudeDecimal) {
      wx.showToast({
        title: '位置信息不可用',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 检查是否是当前追踪的机场
    var currentTracked = this.data.trackedAirport;
    if (currentTracked && currentTracked.ICAOCode === airport.ICAOCode) {
      // 如果点击的是当前追踪的机场，取消追踪
      this.clearTrackedAirport();
      return;
    }
    
    // 显示确认对话框
    var self = this;
    wx.showModal({
      title: '追踪机场',
      content: '是否要追踪机场 ' + airport.ICAOCode + ' (' + (airport.ShortName || airport.EnglishName || '未知名称') + ')？',
      confirmText: '追踪',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          // 用户确认追踪
          self.trackAirportFromCard(airport);
        }
      }
    });
  },
  
  /**
   * 从机场卡片追踪机场
   */
  trackAirportFromCard: function(airport) {
    if (!this.airportManager) {
      console.warn('⚠️ 机场管理器不可用，无法追踪机场');
      return;
    }
    
    // 直接设置追踪机场，无需搜索
    this.airportManager.setTrackedAirport(
      airport,
      parseFloat(this.data.latitudeDecimal),
      parseFloat(this.data.longitudeDecimal)
    );
    
    // 更新输入框显示
    this.safeSetData({
      trackAirportInput: airport.ICAOCode
    });
  },
  
  /**
   * 清除追踪机场
   */
  clearTrackedAirport: function() {
    if (this.airportManager) {
      this.airportManager.clearTrackedAirport();
    }
    
    this.safeSetData({
      trackAirportInput: ''
    });
    
    wx.showToast({
      title: '已取消追踪',
      icon: 'success',
      duration: 1500
    });
  },
  
  /**
   * 关闭GPS警告
   */
  dismissGPSWarning: function() {
    this.safeSetData({
      showGPSWarning: false
    });
  },
  
  /**
   * 启动模拟模式（用于权限被拒绝或离线情况）
   */
  startSimulatedMode: function() {
    if (this.gpsManager) {
      this.gpsManager.startSimulatedMode();
    }
  },
  
  /**
   * 打开设置页面 - 增强版
   */
  openSetting: function() {
    var self = this;
    
    // 直接打开设置页面
    wx.openSetting({
      success: function(res) {
        console.log('⚙️ 设置页面返回:', res.authSetting);
        
        // 检查用户是否开启了位置权限
        if (res.authSetting['scope.userLocation']) {
          console.log('✅ 用户已授权位置权限');
          
          // 更新状态
          self.safeSetData({
            showGPSWarning: false,
            locationError: null,
            getLocationPermission: true
          });
          
          // 重新初始化GPS
          if (self.gpsManager) {
            self.gpsManager.isOfflineMode = false;  // 退出离线模式
            self.gpsManager.checkLocationPermission();
          }
          
          wx.showToast({
            title: '权限已授权',
            icon: 'success'
          });
        } else {
          console.log('❌ 用户未授权位置权限');
          wx.showToast({
            title: '请开启位置权限',
            icon: 'none'
          });
        }
      }
    });
  },
  
  
  /**
   * 诊断航向显示问题
   */
  diagnoseHeadingIssue: function() {
    console.log('🔍 开始航向问题诊断...');
    
    // 检查指南针管理器状态
    if (this.compassManager) {
      var compassStatus = this.compassManager.getStatus();
      console.log('🧭 指南针管理器状态:', compassStatus);
      
      if (!compassStatus.isRunning && compassStatus.compassSupported !== false) {
        console.log('⚠️ 指南针未运行且支持，尝试启动...');
        var context = this.getCurrentContext();
        this.compassManager.start(context);
      } else if (compassStatus.compassSupported === false) {
        console.log('ℹ️ 设备不支持指南针，使用GPS航迹模式');
      } else {
        console.log('ℹ️ 指南针正在运行');
      }
    } else {
      console.log('❌ 指南针管理器不存在');
    }
    
    // 检查当前航向数据
    console.log('📊 当前航向数据:', {
      heading: this.data.heading,
      lastStableHeading: this.data.lastStableHeading,
      headingMode: this.data.headingMode,
      track: this.data.track,
      speed: this.data.speed
    });
    
    // 检查航向缓冲区
    console.log('📊 航向缓冲区:', this.data.headingBuffer);
    
    return {
      compassRunning: this.compassManager ? this.compassManager.getStatus().isRunning : false,
      currentHeading: this.data.heading,
      hasBuffer: this.data.headingBuffer && this.data.headingBuffer.length > 0
    };
  },
  
  /**
   * 🔧 Canvas状态诊断（用于调试GPS权限问题）
   */
  diagnoseCanvasState: function() {
    var self = this;
    console.log('🔧 开始Canvas状态诊断...');
    
    if (this.mapRenderer && this.mapRenderer.diagnoseCanvas) {
      var diagnosis = this.mapRenderer.diagnoseCanvas();
      
      // 如果发现问题，尝试自动修复
      if (diagnosis.issues.length > 0) {
        console.log('🔧 发现问题，尝试自动修复...');
        
        // 修复渲染定时器问题
        if (diagnosis.issues.some(function(issue) { return issue.includes('渲染定时器'); })) {
          console.log('🔧 重启渲染循环...');
          this.mapRenderer.startRenderLoop();
        }
        
        // 修复mapRange问题
        if (diagnosis.issues.some(function(issue) { return issue.includes('mapRange'); })) {
          console.log('🔧 重置mapRange...');
          var defaultRange = config.map.zoomLevels[config.map.defaultZoomIndex];
          this.safeSetData({ mapRange: defaultRange });
          this.mapRenderer.currentData.mapRange = defaultRange;
        }
        
        // 强制重新渲染
        console.log('🔧 强制重新渲染...');
        this.mapRenderer.forceRender();
        
        // 重新诊断
        setTimeout(function() {
          self.mapRenderer.diagnoseCanvas();
        }, 1000);
      }
      
      return diagnosis;
    } else {
      console.error('🚨 地图渲染器不可用，无法进行诊断');
      return null;
    }
  },

  /**
   * 🔧 增强修复：强制地图状态恢复
   */
  forceMapStateRecovery: function() {
    console.log('🔧 执行强制地图状态恢复');
    
    if (!this.mapRenderer || !this.mapRenderer.isInitialized) {
      console.warn('🔧 地图渲染器未初始化，跳过状态恢复');
      return;
    }
    
    // 确保mapRange有效
    var validMapRange = this.data.mapRange;
    if (!validMapRange || validMapRange <= 0) {
      validMapRange = config.map.zoomLevels[config.map.defaultZoomIndex];
      console.log('🔧 强制恢复时发现mapRange无效，重置为:', validMapRange + 'NM');
      
      this.safeSetData({
        mapRange: validMapRange,
        currentZoomIndex: config.map.defaultZoomIndex
      });
    }
    
    // 构建完整的渲染数据
    var renderData = {
      latitude: parseFloat(this.data.latitudeDecimal) || 0,
      longitude: parseFloat(this.data.longitudeDecimal) || 0,
      altitude: this.data.altitude || 0,
      speed: this.data.speed || 0,
      heading: this.data.heading || 0,
      track: this.data.track || 0,
      headingMode: this.data.headingMode || 'heading',
      nearbyAirports: this.data.nearbyAirports || [],
      trackedAirport: this.data.trackedAirport || null,
      mapRange: validMapRange,
      mapOrientationMode: this.data.mapOrientationMode || 'heading-up',
      mapStableHeading: this.data.mapStableHeading || 0
    };
    
    console.log('🔧 强制恢复地图数据:', {
      mapRange: renderData.mapRange,
      hasNearbyAirports: renderData.nearbyAirports.length,
      hasTrackedAirport: !!renderData.trackedAirport
    });
    
    // 强制更新地图渲染器
    this.mapRenderer.updateData(renderData);
    this.mapRenderer.forceRender();
  },
  
  /**
   * 🔧 增强修复：验证并修复地图状态
   */
  validateAndFixMapState: function() {
    console.log('🔧 执行地图状态验证和修复');
    
    var issues = [];
    var needsFix = false;
    
    // 检查mapRange
    if (!this.data.mapRange || this.data.mapRange <= 0) {
      issues.push('mapRange无效: ' + this.data.mapRange);
      needsFix = true;
    }
    
    // 检查地图渲染器状态
    if (this.mapRenderer) {
      var rendererStatus = this.mapRenderer.getStatus();
      if (!rendererStatus.isInitialized) {
        issues.push('地图渲染器未初始化');
        needsFix = true;
      }
      
      if (!rendererStatus.currentRange || rendererStatus.currentRange <= 0) {
        issues.push('地图渲染器currentRange无效: ' + rendererStatus.currentRange);
        needsFix = true;
      }
    } else {
      issues.push('地图渲染器不存在');
      needsFix = true;
    }
    
    if (issues.length > 0) {
      console.warn('🔧 检测到地图状态问题:', issues);
    }
    
    if (needsFix) {
      console.log('🔧 执行最终修复措施');
      
      // 重置所有关键参数
      var safeMapRange = config.map.zoomLevels[config.map.defaultZoomIndex];
      
      this.safeSetData({
        mapRange: safeMapRange,
        currentZoomIndex: config.map.defaultZoomIndex,
        mapOrientationMode: 'heading-up',
        mapStableHeading: 0
      });
      
      // 如果地图渲染器存在，强制重新初始化数据
      if (this.mapRenderer && this.mapRenderer.isInitialized) {
        this.mapRenderer.currentData.mapRange = safeMapRange;
        this.mapRenderer.currentZoomIndex = config.map.defaultZoomIndex;
        this.mapRenderer.forceRender();
        
        console.log('🔧 最终修复完成，地图状态已重置');
      }
      
      // 显示恢复提示
      wx.showToast({
        title: '地图状态已恢复',
        icon: 'success',
        duration: 2000
      });
    } else {
      console.log('✅ 地图状态验证通过，无需修复');
    }
  },

  /**
   * ===== 新的生命周期管理方法 =====
   */
  
  /**
   * 初始化生命周期管理器
   */
  initializeLifecycleManager: function() {
    var self = this;
    
    // 🚨 紧急降级：直接回退到传统模式，确保基础功能正常
    console.warn('🚨 紧急降级：生命周期管理器存在问题，回退到传统初始化模式');
    this.fallbackToLegacyMode();
    return;
    
    // 以下为原有代码，暂时注释
    /*
    try {
      // 创建生命周期管理器
      this.lifecycleManager = LifecycleManager.create(config);
      
      console.log('🚀 开始注册驾驶舱模块到生命周期管理器...');
      
      // 注册所有模块（按优先级和依赖关系）
      this.registerCockpitModules();
      
      // 启动所有模块
      this.lifecycleManager.startAll()
        .then(function() {
          console.log('✅ 驾驶舱所有模块启动完成');
          self.onAllModulesStarted();
        })
        .catch(function(error) {
          console.error('🔴 驾驶舱模块启动失败:', error);
          // 回退到传统模式
          self.fallbackToLegacyMode();
        });
    } catch (error) {
      console.error('🔴 生命周期管理器创建失败:', error);
      // 回退到传统模式
      this.fallbackToLegacyMode();
    }
    */
  },

  /**
   * 注册所有驾驶舱模块
   */
  registerCockpitModules: function() {
    console.log('📋 注册Phase 1: 核心服务模块');
    
    // 1. Toast管理器（无依赖，最高优先级）
    this.toastManager = ToastManager.create(config);
    this.lifecycleManager.registerModule('toast-manager', this.toastManager, [], LifecycleManager.StartupPhases.CORE);
    
    // 2. 飞行计算器（纯函数模块）
    this.flightCalculator = FlightCalculator.create(config);
    this.lifecycleManager.registerModule('flight-calculator', this.flightCalculator, [], LifecycleManager.StartupPhases.CORE);

    console.log('📋 注册Phase 2: 数据源模块');
    
    // 3. GPS管理器（依赖Toast）
    this.gpsManager = GPSManager.create(config);
    this.setupGPSCallbacks();
    this.lifecycleManager.registerModule('gps-manager', this.gpsManager, ['toast-manager'], LifecycleManager.StartupPhases.DATA);
    
    // 4. 机场管理器（依赖飞行计算器和Toast）
    this.airportManager = AirportManager.create(config);
    this.setupAirportCallbacks();
    this.lifecycleManager.registerModule('airport-manager', this.airportManager, ['flight-calculator', 'toast-manager'], LifecycleManager.StartupPhases.DATA);

    console.log('📋 注册Phase 3: 传感器模块');
    
    // 5. 指南针管理器（独立传感器，无需依赖GPS）
    this.compassManager = CompassManager.create(config);
    this.setupCompassCallbacks();
    this.lifecycleManager.registerModule('compass-manager', this.compassManager, [], LifecycleManager.StartupPhases.SENSORS);

    console.log('📋 注册Phase 4: 渲染服务模块');
    
    // 6. 地图渲染器（依赖GPS和Toast）
    this.mapRenderer = MapRenderer.create('navigationMap', config);
    this.setupMapCallbacks();
    this.lifecycleManager.registerModule('map-renderer', this.mapRenderer, ['gps-manager', 'toast-manager'], LifecycleManager.StartupPhases.RENDERING);

    console.log('📋 注册Phase 5: 交互服务模块');
    
    // 7. 手势处理器（依赖地图渲染器）
    this.gestureHandler = GestureHandler.create(config);
    this.setupGestureCallbacks();
    this.lifecycleManager.registerModule('gesture-handler', this.gestureHandler, ['map-renderer'], LifecycleManager.StartupPhases.INTERACTION);
    
    console.log('✅ 所有模块注册完成，共', Object.keys(this.lifecycleManager.modules).length, '个模块');
  },

  /**
   * 设置GPS管理器回调（精简版）
   */
  setupGPSCallbacks: function() {
    var self = this;
    this.gpsManager.init(this, {
      onPermissionGranted: function() {
        console.log('🔧 GPS权限已授予');
        self.handleGPSPermissionGranted();
      },
      onLocationUpdate: function(locationData) {
        self.throttleLocationUpdate(locationData);
      },
      onLocationError: function(errorMsg) {
        self.handleGPSLocationError(errorMsg);
      },
      onGPSStatusChange: function(status) {
        // 🚀 高优先级：GPS状态更新（重新初始化后）
        self.safeSetData({
          gpsStatus: status,
          gpsStatusClass: self.calculateGPSStatusClass(status)
        }, null, {
          priority: 'high',
          throttleKey: 'gps'
        });
      },
      onContextUpdate: function(contextUpdate) {
        if (self._isDestroying || self.isDestroying) {
          return;
        }
        self.safeSetData(contextUpdate);
      },
      getCurrentContext: function() {
        return self.getCurrentContext();
      }
    }, config);
  },

  /**
   * 设置机场管理器回调（精简版）
   */
  setupAirportCallbacks: function() {
    var self = this;
    this.airportManager.init(this, {
      onAirportsLoaded: function(airports) {
        console.log('机场数据加载完成:', airports.length);
        self.updateNearbyAirports();
      },
      onNearbyAirportsUpdate: function(airports) {
        self.safeSetData({
          nearbyAirports: airports
        });
        self.updateThreeAirportsDisplay();
        self.updateMapRenderer();
      },
      onLoadError: function(error) {
        self.handleError(error, '机场数据加载');
      }
    }, this.flightCalculator);
  },

  /**
   * 设置指南针管理器回调（精简版）
   */
  setupCompassCallbacks: function() {
    var self = this;
    this.compassManager.init(this, {
      onHeadingUpdate: function(headingData) {
        self.safeSetData(headingData);
        self.updateMapRenderer();
      },
      onCompassReady: function() {
        console.log('✅ 指南针就绪');
        self.safeSetData({ showGPSWarning: false });
      },
      onContextUpdate: function(contextUpdate) {
        if (self._isDestroying || self.isDestroying) {
          return;
        }
        self.safeSetData(contextUpdate);
      }
    });
  },

  /**
   * 设置地图渲染器回调（精简版）
   */
  setupMapCallbacks: function() {
    var self = this;
    this.mapRenderer.init(this, {
      onCanvasReady: function() {
        console.log('地图Canvas就绪');
      },
      onInitError: function(error) {
        self.handleError(error, '地图初始化');
      },
      onRenderError: function(error) {
        console.error('地图渲染错误:', error);
      }
    });
  },

  /**
   * 设置手势处理器回调（精简版）
   */
  setupGestureCallbacks: function() {
    var self = this;
    this.gestureHandler.init('navigationMap', {
      onZoom: function(zoomData) {
        self.handleZoom(zoomData.deltaDistance);
      },
      onTap: function(tapData) {
        console.log('地图点击:', tapData);
      }
    });
  },

  /**
   * 所有模块启动完成后的处理
   */
  onAllModulesStarted: function() {
    console.log('🎉 驾驶舱系统启动完成');
    
    // 显示系统健康状况
    this.logSystemHealth();
    
    // 启动健康监控系统
    if (this.lifecycleManager) {
      this.lifecycleManager.startHealthMonitoring()
        .then(function() {
          console.log('✅ 健康监控系统已启动');
        })
        .catch(function(error) {
          console.error('🔴 健康监控系统启动失败:', error);
        });
    }
    
    // 延迟启动指南针
    var self = this;
    setTimeout(function() {
      if (self.compassManager) {
        var context = self.getCurrentContext();
        self.compassManager.start(context);
      }
    }, 500);
  },

  /**
   * 回退到传统启动模式
   */
  fallbackToLegacyMode: function() {
    console.log('🔄 回退到传统模块管理模式');
    
    try {
      // 销毁生命周期管理器
      if (this.lifecycleManager) {
        this.lifecycleManager.destroyAll().catch(function(error) {
          console.warn('⚠️ 生命周期管理器销毁失败:', error);
        });
        this.lifecycleManager = null;
      }
      
      // 使用传统方式初始化
      this.initializeModules();
      this.startServices();
      
      // 🔧 修复：分阶段启动所有传感器（解决启动冲突）
      var self = this;
      console.log('🚀 开始分阶段启动传感器（传统模式）');
      
      // 第1阶段：启动陀螺仪（500ms延迟）
      setTimeout(function() {
        if (self.gyroscopeManager) {
          console.log('🌀 启动陀螺仪管理器（传统模式第1阶段）');
          var context = self.getCurrentContext();
          self.gyroscopeManager.start(context);
        }
      }, 500);
      
      // 第2阶段：启动加速度计（800ms延迟）
      setTimeout(function() {
        if (self.accelerometerManager) {
          console.log('⚡ 启动加速度计管理器（传统模式第2阶段）');
          var context = self.getCurrentContext();
          self.accelerometerManager.start(context);
        }
      }, 800);
      
      // 第3阶段：启动指南针（1200ms延迟，确保其他传感器先启动）
      setTimeout(function() {
        if (self.compassManager) {
          console.log('🧭 启动指南针管理器（传统模式第3阶段，三传感器融合）');
          var context = self.getCurrentContext();
          self.compassManager.start(context);
        }
      }, 1200);
      
    } catch (error) {
      console.error('🔴 传统模式初始化也失败:', error);
      this.handleError(error, '驾驶舱初始化');
    }
  },

  /**
   * 记录系统健康状况
   */
  logSystemHealth: function() {
    if (!this.lifecycleManager) return;
    
    var health = this.lifecycleManager.getSystemHealth();
    console.log('🏥 驾驶舱系统健康报告:', {
      '总体状态': health.overallStatus,
      '模块总数': health.moduleCount,
      '运行模块': health.runningModules,
      '错误模块': health.errorModules,
      '当前阶段': health.phases.current + '/' + health.phases.total
    });
    
    // 详细模块状态（调试模式下）
    if (config.global && config.global.debugMode) {
      console.group('📊 详细模块状态:');
      for (var moduleName in health.modules) {
        var moduleHealth = health.modules[moduleName];
        console.log(moduleName + ':', {
          '状态': moduleHealth.state,
          '健康': moduleHealth.isHealthy ? '✅' : '❌',
          '重试次数': moduleHealth.retryCount,
          '最后错误': moduleHealth.lastError || '无'
        });
      }
      console.groupEnd();
    }
    
    return health;
  },

  /**
   * 手动触发系统健康检查（调试用）
   */
  triggerHealthCheck: function() {
    if (!this.lifecycleManager) {
      console.warn('⚠️ 生命周期管理器不可用');
      return;
    }
    
    console.log('🔍 手动触发系统健康检查...');
    var health = this.logSystemHealth();
    
    // 显示健康检查结果给用户
    wx.showModal({
      title: '系统健康检查',
      content: '总体状态: ' + health.overallStatus + 
               '\n运行模块: ' + health.runningModules + '/' + health.moduleCount +
               '\n错误模块: ' + health.errorModules,
      showCancel: false,
      confirmText: '知道了'
    });
    
    return health;
  },

  /**
   * 手动重启指定模块（调试用）
   */
  restartModule: function(moduleName) {
    if (!this.lifecycleManager) {
      console.warn('⚠️ 生命周期管理器不可用');
      return Promise.reject(new Error('生命周期管理器不可用'));
    }
    
    if (!moduleName) {
      console.warn('⚠️ 请指定要重启的模块名');
      return Promise.reject(new Error('模块名不能为空'));
    }
    
    console.log('🔄 手动重启模块:', moduleName);
    
    return this.lifecycleManager.restartModule(moduleName)
      .then(function() {
        console.log('✅ 模块重启成功:', moduleName);
        wx.showToast({
          title: '模块 ' + moduleName + ' 重启成功',
          icon: 'success',
          duration: 2000
        });
      })
      .catch(function(error) {
        console.error('🔴 模块重启失败:', moduleName, error);
        wx.showToast({
          title: '模块重启失败: ' + error.message,
          icon: 'none',
          duration: 3000
        });
        throw error;
      });
  },

  /**
   * 获取模块错误历史（调试用）
   */
  getErrorHistory: function() {
    if (!this.lifecycleManager) {
      console.warn('⚠️ 生命周期管理器不可用');
      return [];
    }
    
    var health = this.lifecycleManager.getSystemHealth();
    var errors = health.errors || [];
    
    console.log('📝 系统错误历史 (最近10条):', errors.slice(-10));
    
    return errors;
  },

  /**
   * 处理GPS权限授予（精简版）
   */
  handleGPSPermissionGranted: function() {
    var validMapRange = this.data.mapRange || config.map.zoomLevels[config.map.defaultZoomIndex];
    
    this.safeSetData({
      hasLocationPermission: true,
      locationError: null,
      showGPSWarning: false,
      gpsStatus: '权限已授予',
      mapRange: validMapRange
    });
  },

  /**
   * 处理GPS位置错误（精简版）
   */
  handleGPSLocationError: function(errorMsg) {
    if (errorMsg !== null) {
      console.log('🔧 GPS位置错误:', errorMsg);
      // ⚠️ 高优先级：位置错误是关键信息
      this.safeSetData({ locationError: errorMsg }, null, {
        priority: 'high'
      });
    } else {
      console.log('🔧 清除GPS位置错误状态');
      // ✅ 普通优先级：清除错误状态
      this.safeSetData({ locationError: null }, null, {
        priority: 'normal'
      });
    }
  },

  /**
   * 销毀所有模块
   */
  destroyModules: function() {
    // 优先使用生命周期管理器销毁
    if (this.lifecycleManager) {
      console.log('🗑️ 使用生命周期管理器销毁所有模块');
      
      this._isDestroying = true;
      
      // 先停止健康监控
      this.lifecycleManager.stopHealthMonitoring()
        .then(function() {
          console.log('✅ 健康监控系统已停止');
        })
        .catch(function(error) {
          console.warn('⚠️ 停止健康监控失败:', error);
        });
      
      // 然后销毁所有模块
      this.lifecycleManager.destroyAll()
        .then(function() {
          console.log('✅ 生命周期管理器销毁完成');
        })
        .catch(function(error) {
          console.error('🔴 生命周期管理器销毁失败:', error);
        });
      
      this.lifecycleManager = null;
      return;
    }
    
    // 传统销毁方式（备用）
    console.log('🗑️ 使用传统方式销毁所有模块');
    
    // 设置销毁标志，防止异步setData调用
    this.isDestroyed = true;
    if (this.flightCalculator) {
      // 飞行计算器是纯函数模块，无需销毁
      this.flightCalculator = null;
    }
    
    if (this.airportManager) {
      this.airportManager.destroy();
      this.airportManager = null;
    }
    
    if (this.gpsManager) {
      this.gpsManager.destroy();
      this.gpsManager = null;
    }
    
    if (this.compassManager) {
      this.compassManager.destroy();
      this.compassManager = null;
    }
    
    if (this.mapRenderer) {
      this.mapRenderer.destroy();
      this.mapRenderer = null;
    }
    
    if (this.gestureHandler) {
      this.gestureHandler.destroy();
      this.gestureHandler = null;
    }
    
    // 姿态仪现在独立管理，无需手动清理
    
    // 卡尔曼滤波器已移除，使用简化滤波器
    
    if (this.toastManager) {
      this.toastManager.clearAll();
      this.toastManager = null;
    }
    
    console.log('所有模块已销毁');
  },
  
  /**
   * 清理所有定时器
   */
  clearAllTimers: function() {
    var timers = [
      'updateTimer', 
      'renderTimer', 
      'mapRenderUpdateTimer', 
      'locationUpdateTimer',
      'debugTimer'
    ];
    
    for (var i = 0; i < timers.length; i++) {
      var timerName = timers[i];
      if (this[timerName]) {
        clearTimeout(this[timerName]);
        this[timerName] = null;
        console.log('🧹 清理定时器:', timerName);
      }
    }
    
    // 清理pending数据
    if (this.pendingLocationData) {
      this.pendingLocationData = null;
      console.log('🧹 清理pending位置数据');
    }
  },

  // 🎯 ========== 姿态仪校准方法 ==========
  
  /**
   * 重置按钮点击处理 - 🎯 重构为快速归零功能
   */
  onCalibrationTap: function() {
    var self = this;
    
    // 检查姿态仪是否可用
    if (!this.attitudeIndicator) {
      wx.showToast({
        title: '姿态仪未初始化',
        icon: 'error',
        duration: 2000
      });
      return;
    }
    
    // 直接执行快速校准
    var result = self.attitudeIndicator.quickCalibrate();
    
    if (result.success) {
      // 重置成功，立即更新显示为0
      self.safeSetData({
        pitch: 0,
        roll: 0
      });
      
      wx.showToast({
        title: '重置成功',
        icon: 'success',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: '重置失败: ' + result.reason,
        icon: 'error',
        duration: 2000
      });
    }
  },
  
  /**
   * 重置按钮长按处理 - 显示高级选项
   */
  onCalibrationLongPress: function() {
    var self = this;
    
    // 检查姿态仪是否可用
    if (!this.attitudeIndicator) {
      wx.showToast({
        title: '姿态仪未初始化',
        icon: 'error',
        duration: 2000
      });
      return;
    }
    
    // 获取当前校准状态
    var calibrationStatus = this.attitudeIndicator.getCalibrationStatus();
    
    var actions = [
      { name: '快速重置', color: '#007AFF' },
      { name: '查看校准状态', color: '#34C759' },
      { name: '强制刷新渲染', color: '#FF9500' },  // 🎯 新增：强制刷新选项
      { name: '清除校准数据', color: '#FF3B30' }
    ];
    
    wx.showActionSheet({
      itemList: actions.map(function(item) { return item.name; }),
      success: function(res) {
        switch (res.tapIndex) {
          case 0: // 快速重置
            self.onCalibrationTap(); // 调用相同的快速重置功能
            break;
          case 1: // 查看状态
            self.showCalibrationStatus(calibrationStatus);
            break;
          case 2: // 🎯 强制刷新渲染
            self.forceRefreshAttitude();
            break;
          case 3: // 清除校准数据
            self.clearCalibrationData();
            break;
        }
      }
    });
  },
  
  /**
   * 🎯 强制刷新姿态仪渲染 - 解决卡住问题
   */
  forceRefreshAttitude: function() {
    var self = this;
    
    // 检查姿态仪是否可用
    if (!this.attitudeIndicator) {
      wx.showToast({
        title: '姿态仪未初始化',
        icon: 'error',
        duration: 2000
      });
      return;
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '强制刷新中...',
      mask: true
    });
    
    // 延迟100ms执行，让Loading显示出来
    setTimeout(function() {
      try {
        // 调用强制刷新函数
        var result = self.attitudeIndicator.forceRefresh();
        
        wx.hideLoading();
        
        // 显示结果
        wx.showToast({
          title: result.success ? '✅ 刷新成功' : '❌ 刷新失败',
          icon: result.success ? 'success' : 'error',
          duration: result.success ? 1500 : 2500
        });
        
        console.log('🔄 强制刷新姿态仪结果:', result);
        
        // 如果刷新失败，给出额外提示
        if (!result.success) {
          setTimeout(function() {
            wx.showModal({
              title: '刷新失败',
              content: '姿态仪刷新失败：' + (result.message || '未知错误') + '\n\n建议：\n1. 尝试重新进入页面\n2. 检查设备传感器权限\n3. 重启微信小程序',
              showCancel: false,
              confirmText: '知道了'
            });
          }, 2000);
        }
        
      } catch (error) {
        wx.hideLoading();
        
        console.error('❌ 强制刷新执行出错:', error);
        
        wx.showToast({
          title: '执行出错',
          icon: 'error',
          duration: 2000
        });
      }
    }, 100);
  },
  
  /**
   * 清除校准数据
   */
  clearCalibrationData: function() {
    var self = this;
    
    wx.showModal({
      title: '清除校准数据',
      content: '确定要清除所有校准数据吗？清除后PITCH和ROLL将回到未校准状态。',
      confirmText: '确定清除',
      confirmColor: '#FF3B30',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          if (self.attitudeIndicator && self.attitudeIndicator.resetCalibration()) {
            wx.showToast({
              title: '校准数据已清除',
              icon: 'success',
              duration: 1500
            });
          } else {
            wx.showToast({
              title: '清除失败',
              icon: 'error',
              duration: 1500
            });
          }
        }
      }
    });
  },
  
  
  
  /**
   * 显示校准状态信息
   */
  showCalibrationStatus: function(status) {
    var message = '校准状态信息:\n';
    
    if (status.isCalibrated) {
      message += '✅ 已校准\n';
      message += 'PITCH偏移: ' + status.pitchOffset.toFixed(2) + '°\n';
      message += 'ROLL偏移: ' + status.rollOffset.toFixed(2) + '°\n';
      
      if (status.calibrationTime) {
        var calibrationDate = new Date(status.calibrationTime);
        message += '校准时间: ' + calibrationDate.toLocaleString();
      }
    } else {
      message += '❌ 未校准\n';
      message += '建议进行校准以获得更准确的姿态数据';
    }
    
    wx.showModal({
      title: '姿态仪校准状态',
      content: message,
      showCancel: false,
      confirmText: '确定'
    });
  },


  // ========== GPS权限调试面板方法 ==========
  
  /**
   * 切换调试面板展开状态
   */
  toggleDebugPanel: function() {
    // 📊 低优先级：调试面板切换
    this.safeSetData({
      debugPanelExpanded: !this.data.debugPanelExpanded
    }, null, {
      priority: 'low'
    });
  },
  
  /**
   * 清除机场数据缓存
   */
  clearAirportCache: function() {
    var simpleAirportManager = require('../../utils/simple-airport-manager.js');
    
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除机场数据缓存吗？下次查看机场地图时会重新加载数据。',
      success: function(res) {
        if (res.confirm) {
          var success = simpleAirportManager.clearCache();
          wx.showToast({
            title: success ? '缓存已清除' : '清除失败',
            icon: success ? 'success' : 'error'
          });
        }
      }
    });
  },

  /**
   * 查看机场信息（整合选择位置和机场地图功能）
   */
  viewAirportInfo: function() {
    wx.navigateTo({
      url: '/pages/airport-map/index',
      success: function() {
        console.log('🗺️ 导航到机场信息页面');
      },
      fail: function(error) {
        console.error('❌ 导航失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 让用户选择一个位置
   */
  chooseUserLocation: function() {
    var self = this;
    
    wx.chooseLocation({
      success: function(res) {
        console.log('✅ 用户选择位置成功:', res);
        
        // 显示选择的位置信息
        wx.showToast({
          title: `已选择: ${res.name || res.address}`,
          icon: 'success',
          duration: 2000
        });
        
        // 存储选择的位置信息到页面数据中
        self.safeSetData({
          selectedLocation: {
            name: res.name || '未知位置',
            address: res.address || '',
            latitude: res.latitude,
            longitude: res.longitude,
            // 计算距离当前位置的距离（如果有当前位置数据）
            distance: self.data.latitude && self.data.longitude ? 
              self.calculateDistance(self.data.latitude, self.data.longitude, res.latitude, res.longitude) : null
          }
        });
        
        // 如果需要，可以触发其他相关功能
        self.handleLocationSelected(res);
      },
      fail: function(error) {
        console.error('❌ 用户选择位置失败:', error);
        
        if (error.errMsg === 'chooseLocation:fail cancel') {
          // 用户取消选择，不显示错误
          console.log('用户取消了位置选择');
        } else {
          // 其他错误，显示提示
          wx.showToast({
            title: '位置选择失败',
            icon: 'error'
          });
        }
      }
    });
  },
  
  /**
   * 处理位置选择完成后的逻辑
   */
  handleLocationSelected: function(locationData) {
    // 这里可以添加位置选择后的处理逻辑
    // 比如计算到选择位置的导航信息等
    console.log('处理选择的位置:', locationData);
  },
  
  /**
   * 计算两点间距离（海里）
   */
  calculateDistance: function(lat1, lon1, lat2, lon2) {
    var R = 6371; // 地球半径（公里）
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var distance = R * c; // 距离（公里）
    return Math.round(distance * 0.539957 * 10) / 10; // 转换为海里并保留1位小数
  },
  
  /**
   * 测试wx.getLocation API
   */
  testGetLocation: function() {
    var self = this;
    console.log('🧪 测试wx.getLocation API');
    
    wx.getLocation({
      type: config.gps.coordinateSystem,
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 5000,
      success: function(res) {
        console.log('✅ getLocation成功:', res);
        wx.showToast({
          title: 'getLocation测试成功',
          icon: 'success',
          duration: 2000
        });
        
        // 更新调试数据
        self.safeSetData({
          'debugData.rawAltitude': res.altitude,
          'debugData.altitudeType': typeof res.altitude,
          'debugData.accuracy': res.accuracy
        });
      },
      fail: function(err) {
        console.error('❌ getLocation失败:', err);
        wx.showToast({
          title: 'getLocation测试失败: ' + err.errMsg,
          icon: 'none',
          duration: 3000
        });
      }
    });
  },
  
  /**
   * 测试wx.chooseLocation API
   */
  testChooseLocation: function() {
    console.log('🧪 测试wx.chooseLocation API');
    
    wx.chooseLocation({
      latitude: this.data.latitude || 39.9042,
      longitude: this.data.longitude || 116.4074,
      success: function(res) {
        console.log('✅ chooseLocation成功:', res);
        wx.showToast({
          title: '位置选择成功: ' + res.name,
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(err) {
        console.error('❌ chooseLocation失败:', err);
        if (err.errMsg.indexOf('cancel') !== -1) {
          wx.showToast({
            title: '用户取消选择',
            icon: 'none',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: 'chooseLocation测试失败: ' + err.errMsg,
            icon: 'none',
            duration: 3000
          });
        }
      }
    });
  },
  
  /**
   * 切换持续定位状态
   */
  toggleLocationUpdate: function() {
    if (this.data.locationUpdateActive) {
      // 停止持续定位
      this.stopLocationUpdate();
    } else {
      // 启动持续定位
      this.startLocationUpdate();
    }
  },
  
  /**
   * 切换离线模式
   */
  toggleOfflineMode: function() {
    var self = this;
    var currentMode = this.data.isOfflineMode;
    
    if (currentMode) {
      // 退出离线模式
      console.log('📡 退出离线模式');
      
      this.safeSetData({
        isOfflineMode: false,
        showGPSWarning: false
      });
      
      if (this.gpsManager) {
        this.gpsManager.isOfflineMode = false;
        
        // 检查权限并重新启动GPS
        this.gpsManager.checkLocationPermission();
      }
      
      wx.showToast({
        title: '已退出离线模式',
        icon: 'success'
      });
    } else {
      // 进入离线模式
      console.log('🌐 进入离线模式');
      
      this.safeSetData({
        isOfflineMode: true,
        showGPSWarning: true,
        gpsWarningMessage: '离线模式 - 使用缓存或模拟数据'
      });
      
      if (this.gpsManager) {
        this.gpsManager.isOfflineMode = true;
        
        // 停止真实GPS
        this.gpsManager.stopLocationTracking();
        
        // 启动离线定位
        setTimeout(function() {
          self.gpsManager.startLocationTracking();
        }, 100);
      }
      
      wx.showToast({
        title: '已进入离线模式',
        icon: 'success'
      });
    }
  },
  
  /**
   * 启动持续定位
   */
  startLocationUpdate: function() {
    var self = this;
    console.log('🧪 测试启动持续定位');
    
    wx.startLocationUpdate({
      type: config.gps.coordinateSystem,
      success: function() {
        console.log('✅ startLocationUpdate成功');
        self.safeSetData({
          locationUpdateActive: true
        });
        
        // 开始监听位置变化
        wx.onLocationChange(function(res) {
          console.log('📍 onLocationChange:', res);
          self.safeSetData({
            locationChangeListening: true,
            'debugData.rawAltitude': res.altitude,
            'debugData.altitudeType': typeof res.altitude,
            'debugData.accuracy': res.accuracy
          });
        });
        
        wx.showToast({
          title: '持续定位已启动',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(err) {
        console.error('❌ startLocationUpdate失败:', err);
        wx.showToast({
          title: '启动持续定位失败: ' + err.errMsg,
          icon: 'none',
          duration: 3000
        });
      }
    });
  },
  
  /**
   * 停止持续定位
   */
  stopLocationUpdate: function() {
    var self = this;
    console.log('🧪 停止持续定位');
    
    wx.stopLocationUpdate({
      success: function() {
        console.log('✅ stopLocationUpdate成功');
        self.safeSetData({
          locationUpdateActive: false,
          locationChangeListening: false
        });
        
        wx.showToast({
          title: '持续定位已停止',
          icon: 'success',
          duration: 2000
        });
      }
    });
    
    // 取消监听
    wx.offLocationChange();
  },
  
  /**
   * 显示距离圈选择器
   */
  showRangeSelector: function() {
    console.log('📏 显示距离圈选择器');
    this.safeSetData({
      showRangeSelector: true
    });
  },
  
  /**
   * 关闭距离圈选择器
   */
  onRangeSelectorClose: function() {
    console.log('📏 关闭距离圈选择器');
    this.safeSetData({
      showRangeSelector: false
    });
  },
  
  /**
   * 选择距离圈级别
   */
  onRangeSelect: function(event) {
    var selectedRange = event.detail.value;
    console.log('📏 选择距离圈级别:', selectedRange, 'NM');
    
    // 查找对应的缩放索引
    var zoomIndex = -1;
    for (var i = 0; i < this.data.mapZoomLevels.length; i++) {
      if (this.data.mapZoomLevels[i] === selectedRange) {
        zoomIndex = i;
        break;
      }
    }
    
    if (zoomIndex === -1) {
      console.warn('⚠️ 未找到对应的缩放级别，使用最接近的值');
      // 找到最接近的值
      var minDiff = Math.abs(this.data.mapZoomLevels[0] - selectedRange);
      zoomIndex = 0;
      for (var j = 1; j < this.data.mapZoomLevels.length; j++) {
        var diff = Math.abs(this.data.mapZoomLevels[j] - selectedRange);
        if (diff < minDiff) {
          minDiff = diff;
          zoomIndex = j;
        }
      }
    }
    
    // 更新缩放级别
    this.safeSetData({
      currentZoomIndex: zoomIndex,
      mapRange: this.data.mapZoomLevels[zoomIndex],
      showRangeSelector: false
    });
    
    // 保存到本地存储
    try {
      wx.setStorageSync('cockpit_lastMapRange', this.data.mapZoomLevels[zoomIndex]);
      wx.setStorageSync('cockpit_lastZoomIndex', zoomIndex);
    } catch (e) {
      console.warn('⚠️ 无法保存缩放级别到本地存储');
    }
    
    // 更新地图渲染器
    if (this.mapRenderer) {
      console.log('📏 更新地图渲染器，新范围:', this.data.mapZoomLevels[zoomIndex], 'NM');
      this.updateMapRenderer();
    }
    
    wx.showToast({
      title: '距离圈: ' + this.data.mapZoomLevels[zoomIndex] + ' NM',
      icon: 'success',
      duration: 1500
    });
  },
};

Page(BasePage.createPage(pageConfig));