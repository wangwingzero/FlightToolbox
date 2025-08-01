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

// 引入所有模块
var FlightCalculator = require('./modules/flight-calculator.js');
var AirportManager = require('./modules/airport-manager.js');
var GPSManager = require('./modules/gps-manager.js');
var CompassManager = require('./modules/compass-manager.js');
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
    mapOrientationMode: 'heading-up',
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
      filterType: '无'
    },
    
    // 人工地平仪数据
    showAttitudeIndicator: true,       // 是否显示人工地平仪
    attitudeIndicatorEnabled: false,   // 人工地平仪是否启用
    attitudeIndicatorState: 'uninitialized', // 姿态仪状态
    pitch: 0,                          // 俯仰角（度）
    roll: 0,                           // 滚转角（度）
    
  },
  
  /**
   * 安全的setData方法，防止页面销毁后的异步调用
   */
  safeSetData: function(data, callback) {
    if (!this.isDestroyed) {
      this.setData(data, callback);
    } else {
      console.warn('🚨 页面已销毁，跳过setData调用:', Object.keys(data));
    }
  },

  customOnLoad: function(options) {
    console.log('驾驶舱页面加载 - 模块化版本', options);
    
    // 🔧 处理目标机场参数
    if (options.targetAirport) {
      try {
        var targetAirport = JSON.parse(decodeURIComponent(options.targetAirport));
        console.log('✈️ 接收到目标机场:', targetAirport);
        
        // 设置目标机场数据
        this.setData({
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
    
    this.initializeModules();
    this.startServices();
    
    // 初始启动指南针（延迟启动给其他模块初始化时间）
    setTimeout(function() {
      if (this.compassManager) {
        var context = this.getCurrentContext();
        this.compassManager.start(context);
      }
    }.bind(this), 500);
  },
  
  /**
   * 🔧 从本地存储恢复地图状态
   */
  restoreMapStateFromStorage: function() {
    try {
      var storedRange = wx.getStorageSync('cockpit_lastMapRange');
      var storedIndex = wx.getStorageSync('cockpit_lastZoomIndex');
      
      if (storedRange && storedRange > 0) {
        this.setData({
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
        this.setData({
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
      this.setData({
        mapRange: defaultRange,
        currentZoomIndex: config.map.defaultZoomIndex
      });
    }
  },
  
  customOnShow: function() {
    console.log('📱 驾驶舱页面显示 - 启动服务');
    
    // 🔧 修复：页面显示时先清除可能的错误状态
    this.setData({
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
          this.setData(updateData);
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
    this.destroyModules();
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
        self.setData({
          nearbyAirports: airports
        });
        self.updateThreeAirportsDisplay();
        self.updateMapRenderer();
      },
      onTrackedAirportChange: function(airport) {
        self.setData({
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
        self.setData({
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
            self.setData({
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
        self.handleLocationUpdate(locationData);
      },
      onLocationError: function(errorMsg) {
        // 🔧 修复：只有在错误消息不为null时才设置错误状态
        if (errorMsg !== null) {
          console.log('🔧 GPS位置错误:', errorMsg);
          self.safeSetData({
            locationError: errorMsg
          });
        } else {
          // 🔧 修复：清除错误状态
          console.log('🔧 清除GPS位置错误状态');
          self.safeSetData({
            locationError: null
          });
        }
      },
      onGPSStatusChange: function(status) {
        self.safeSetData({
          gpsStatus: status,
          gpsStatusClass: self.calculateGPSStatusClass(status)
        });
      },
      onNetworkStatusChange: function(networkInfo) {
        self.safeSetData({
          isOffline: networkInfo.isOffline,
          isOfflineMode: networkInfo.isOffline
        });
      },
      onInterferenceDetected: function(interferenceInfo) {
        // 🚨 避免重复弹警告 - 只有当前未处于干扰状态时才弹出
        if (!self.data.gpsInterference) {
          console.warn('🚨 首次检测到GPS干扰，弹出警告');
          
          // 弹出警告对话框
          wx.showModal({
            title: 'GPS干扰警告',
            content: interferenceInfo.message + '\n\n发生时间: ' + interferenceInfo.time + '\n\n请注意核对其他导航参考，系统将在10分钟后自动恢复。',
            showCancel: false,
            confirmText: '我知道了',
            confirmColor: '#ff6b00'
          });
        } else {
          console.log('🔄 连续GPS干扰检测，不重复弹警告');
        }
        
        // 清除之前的恢复定时器
        if (self.data.interferenceTimer) {
          clearTimeout(self.data.interferenceTimer);
        }
        
        // 设置GPS干扰状态
        self.setData({
          gpsInterference: true,
          lastInterferenceTime: interferenceInfo.time
        });
        
        // 设置10分钟后自动恢复的定时器
        var recoveryTimer = setTimeout(function() {
          console.log('⏰ GPS干扰自动恢复时间到达');
          self.setData({
            gpsInterference: false,
            interferenceTimer: null,
            lastInterferenceTime: null  // 🔧 自动恢复后清除干扰时间记录
          });
          
          // 显示恢复提示
          wx.showToast({
            title: 'GPS干扰状态已自动恢复',
            icon: 'success',
            duration: 3000
          });
        }, 10 * 60 * 1000); // 10分钟
        
        // 保存定时器引用
        self.setData({
          interferenceTimer: recoveryTimer
        });
      },
      onInterferenceCleared: function() {
        // 清除干扰状态和时间记录
        self.setData({
          gpsInterference: false,
          lastInterferenceTime: null  // 🔧 手动清除时也清除时间记录
        });
      },
      onSimulatedModeStart: function(simulatedData) {
        self.setData(simulatedData);
      },
      onOfflineModeStart: function() {
        self.setData({
          showGPSWarning: true,
          useSimulatedData: true,
          locationError: null
        });
      },
      onContextUpdate: function(contextUpdate) {
        self.safeSetData(contextUpdate);
      },
      getCurrentContext: function() {
        return self.getCurrentContext();
      }
    }, config); // GPS管理器需要配置对象
    
    // 5. 创建指南针管理器
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
        self.setData({
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
        self.setData({
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
        self.setData({
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
        self.setData({
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
   * 处理位置更新 - 修复高度处理逻辑
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
    
    this.setData({
      latitude: locationData.latitudeAviation || locationData.latitude || 0,
      longitude: locationData.longitudeAviation || locationData.longitude || 0,
      // 保存原始十进制坐标用于机场计算
      latitudeDecimal: locationData.latitude || 0,
      longitudeDecimal: locationData.longitude || 0,
      altitude: Math.round(altitudeValue || 0), // 格式化为整数，去除小数部分
      speed: Math.round(locationData.speed || 0), // 只显示整数部分，去除小数部分
      // 只有当GPS数据包含有效航向时才更新，否则保持指南针管理器设置的值
      // heading: locationData.heading || 0, // 注释掉，让指南针管理器专门负责航向
      verticalSpeed: flightData.verticalSpeed || 0, // 使用计算得到的垂直速度
      acceleration: flightData.acceleration || 0, // 使用计算得到的加速度
      lastUpdateTime: locationData.timestamp || Date.now(),
      updateCount: this.data.updateCount + 1,
      gpsStatus: '定位正常',
      gpsStatusClass: 'status-good',
      getLocationPermission: true,
      
      // 更新调试数据
      'debugData.rawAltitude': locationData.altitude,
      'debugData.altitudeType': typeof locationData.altitude,
      'debugData.altitudeValid': locationData.altitudeValid || false,
      'debugData.accuracy': locationData.accuracy || 0,
      'debugData.updateInterval': updateInterval,
      'debugData.filterType': locationData.filterType || '无',
      gpsInterference: false,
      locationError: null
    });
    
    // 🔧 修复：更新航迹（改进静止状态处理）
    console.log('🔧 航迹数据检查:', {
      locationDataTrack: locationData.track,
      locationDataType: typeof locationData.track,
      speed: locationData.speed || 0,
      lastValidTrack: this.data.lastValidTrack
    });
    
    if (locationData.track !== undefined && locationData.track !== null) {
      // 有有效的航迹数据，格式化为整数
      var trackInt = Math.round(locationData.track);
      this.setData({
        track: trackInt,
        lastValidTrack: trackInt
      });
      console.log('✈️ 更新航迹:', trackInt + '°');
    } else {
      // 🔧 新增：没有航迹数据时的处理
      // 1. 优先使用上次有效航迹
      if (this.data.lastValidTrack !== undefined && this.data.lastValidTrack !== null) {
        this.setData({
          track: this.data.lastValidTrack
        });
        console.log('🔒 静止状态，保持上次航迹:', this.data.lastValidTrack + '°');
      } else {
        // 2. 如果有指南针航向，使用指南针航向
        if (this.data.heading && this.data.heading !== 0) {
          var headingInt = Math.round(this.data.heading);
          this.setData({
            track: headingInt,
            lastValidTrack: headingInt
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
    
    // 更新地图渲染
    this.updateMapRenderer();
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
    
    this.setData({
      leftAirport: result.leftAirport,
      centerAirport: result.centerAirport,
      rightAirport: result.rightAirport,
      leftAirportLabel: result.leftAirportLabel,
      rightAirportLabel: result.rightAirportLabel
    });
  },
  
  /**
   * 更新地图渲染器数据（调试版：确保数据传递）
   */
  updateMapRenderer: function() {
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
    
    this.mapRenderer.updateData(renderData);
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
      this.setData({
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
    this.setData({
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
      this.setData({
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
    this.setData({
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
    
    this.setData({
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
    this.setData({
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
          self.setData({
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
          this.setData({ mapRange: defaultRange });
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
      
      this.setData({
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
      
      this.setData({
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
   * 销毀所有模块
   */
  destroyModules: function() {
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

  // ========== GPS权限调试面板方法 ==========
  
  /**
   * 切换调试面板展开状态
   */
  toggleDebugPanel: function() {
    this.setData({
      debugPanelExpanded: !this.data.debugPanelExpanded
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
        self.setData({
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
        self.setData({
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
      
      this.setData({
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
      
      this.setData({
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
        self.setData({
          locationUpdateActive: true
        });
        
        // 开始监听位置变化
        wx.onLocationChange(function(res) {
          console.log('📍 onLocationChange:', res);
          self.setData({
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
        self.setData({
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
    this.setData({
      showRangeSelector: true
    });
  },
  
  /**
   * 关闭距离圈选择器
   */
  onRangeSelectorClose: function() {
    console.log('📏 关闭距离圈选择器');
    this.setData({
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
    this.setData({
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
  }
};

Page(BasePage.createPage(pageConfig));