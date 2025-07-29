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
    track: 0,
    lastValidTrack: 0,
    minSpeedForTrack: config.compass.minSpeedForTrack,
    
    // 权限状态
    hasLocationPermission: false,
    locationError: null,
    
    // GPS状态
    gpsStatus: '初始化中',
    isOffline: false,
    lastUpdateTime: 0,
    updateCount: 0,
    
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
    rightAirportLabel: '次近机场'
  },
  
  customOnLoad: function(options) {
    console.log('驾驶舱页面加载 - 模块化版本');
    this.initializeModules();
    this.startServices();
  },
  
  customOnShow: function() {
    if (this.gpsManager) {
      this.gpsManager.checkLocationPermission();
    }
    if (this.compassManager) {
      this.compassManager.start(this.getCurrentContext());
    }
  },
  
  customOnHide: function() {
    if (this.gpsManager) {
      this.gpsManager.stopLocationTracking();
    }
    if (this.compassManager) {
      this.compassManager.stop();
    }
    if (this.mapRenderer) {
      this.mapRenderer.stopRenderLoop();
    }
  },
  
  customOnUnload: function() {
    this.destroyModules();
  },
  
  /**
   * 初始化所有模块
   */
  initializeModules: function() {
    var self = this;
    
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
    
    // 3. 创建GPS管理器
    this.gpsManager = GPSManager.create(config);
    this.gpsManager.init(this, {
      onPermissionGranted: function() {
        self.setData({
          hasLocationPermission: true,
          locationError: null
        });
      },
      onPermissionError: function(error) {
        self.handleError(error, 'GPS权限');
      },
      onLocationUpdate: function(locationData) {
        self.handleLocationUpdate(locationData);
      },
      onLocationError: function(errorMsg) {
        self.setData({
          locationError: errorMsg
        });
      },
      onGPSStatusChange: function(status) {
        self.setData({
          gpsStatus: status
        });
      },
      onNetworkStatusChange: function(networkInfo) {
        self.setData({
          isOffline: networkInfo.isOffline,
          isOfflineMode: networkInfo.isOffline
        });
      },
      onInterferenceDetected: function(interferenceInfo) {
        self.setData({
          gpsInterference: true,
          lastInterferenceTime: interferenceInfo.time
        });
      },
      onInterferenceCleared: function() {
        self.setData({
          gpsInterference: false,
          lastInterferenceTime: null
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
        self.setData(contextUpdate);
      },
      getCurrentContext: function() {
        return self.getCurrentContext();
      }
    }, this.flightCalculator);
    
    // 4. 创建指南针管理器
    this.compassManager = CompassManager.create(config);
    this.compassManager.init(this, {
      onHeadingUpdate: function(headingData) {
        self.setData(headingData);
        self.updateMapRenderer();
      },
      onModeChange: function(modeInfo) {
        self.setData({
          headingMode: modeInfo.newMode
        });
      },
      onCompassReady: function() {
        console.log('指南针就绪');
      },
      onCompassError: function(error) {
        self.handleError(error, '指南针');
      },
      onMapHeadingUpdate: function(headingUpdate) {
        self.setData(headingUpdate);
        self.updateMapRenderer();
      },
      onMapHeadingLock: function(lockUpdate) {
        self.setData(lockUpdate);
      },
      onMapHeadingUnlock: function() {
        self.setData({
          mapHeadingLocked: false
        });
      },
      onContextUpdate: function(contextUpdate) {
        self.setData(contextUpdate);
      }
    });
    
    // 5. 创建地图渲染器
    this.mapRenderer = MapRenderer.create('navigationMap', config);
    this.mapRenderer.init(this, {
      onCanvasReady: function(canvasInfo) {
        console.log('Canvas就绪:', canvasInfo);
        self.updateMapRenderer();
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
    
    // 6. 创建手势处理器
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
    
    // 检查网络状态
    this.gpsManager.checkNetworkStatus();
  },
  
  /**
   * 处理位置更新
   * @param {Object} locationData 位置数据
   */
  handleLocationUpdate: function(locationData) {
    // 处理速度过滤
    if (locationData.speed !== undefined) {
      var context = this.getCurrentContext();
      var filterResult = this.flightCalculator.filterSpeed(
        locationData.speed, 
        2, // 默认时间差
        context
      );
      
      // 更新过滤后的状态
      this.setData({
        speed: Math.round(filterResult.filteredSpeed),
        speedBuffer: filterResult.newSpeedBuffer,
        anomalyCount: filterResult.newAnomalyCount,
        lastValidSpeed: filterResult.newLastValidSpeed
      });
      
      if (filterResult.showWarning) {
        wx.showToast({
          title: 'GPS信号异常',
          icon: 'none',
          duration: 2000
        });
      }
    } else {
      // 使用提供的速度
      this.setData({
        speed: locationData.speed || 0
      });
    }
    
    // 更新其他GPS数据
    this.setData({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      altitude: locationData.altitude,
      verticalSpeed: locationData.verticalSpeed || 0,
      lastUpdateTime: locationData.lastUpdateTime,
      updateCount: this.data.updateCount + 1,
      gpsStatus: locationData.gpsStatus,
      gpsInterference: locationData.gpsInterference,
      locationError: locationData.locationError
    });
    
    // 更新航迹
    if (locationData.track !== undefined) {
      this.setData({
        track: locationData.track,
        lastValidTrack: locationData.track
      });
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
    if (this.data.latitude && this.data.longitude) {
      var airports = this.airportManager.updateNearbyAirports(
        parseFloat(this.data.latitude),
        parseFloat(this.data.longitude),
        this.data.mapRange
      );
    }
  },
  
  /**
   * 更新追踪机场
   */
  updateTrackedAirport: function() {
    if (this.data.trackedAirport && this.data.latitude && this.data.longitude) {
      this.airportManager.updateTrackedAirport(
        this.data.trackedAirport.ICAOCode,
        parseFloat(this.data.latitude),
        parseFloat(this.data.longitude)
      );
    }
  },
  
  /**
   * 更新三机场显示
   */
  updateThreeAirportsDisplay: function() {
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
   * 更新地图渲染器数据
   */
  updateMapRenderer: function() {
    if (!this.mapRenderer) return;
    
    this.mapRenderer.updateData({
      latitude: parseFloat(this.data.latitude),
      longitude: parseFloat(this.data.longitude),
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
    });
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
   * 处理缩放操作
   * @param {Number} deltaDistance 距离变化
   */
  handleZoom: function(deltaDistance) {
    var zoomResult = this.gestureHandler.handleZoom(
      deltaDistance,
      this.data.mapZoomLevels,
      this.data.currentZoomIndex
    );
    
    if (zoomResult.changed) {
      this.setData({
        currentZoomIndex: zoomResult.newIndex,
        mapRange: zoomResult.newRange
      });
      
      // 重新计算附近机场
      this.updateNearbyAirports();
      
      // 更新地图渲染
      this.updateMapRenderer();
      
      console.log('地图缩放:', zoomResult.newRange + ' NM');
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
    if (this.data.latitude && this.data.longitude) {
      this.airportManager.searchAndTrackAirport(
        airportCode,
        parseFloat(this.data.latitude),
        parseFloat(this.data.longitude)
      );
    }
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
   * 打开设置页面
   */
  openSetting: function() {
    if (this.gpsManager) {
      this.gpsManager.openSetting();
    }
  },
  
  /**
   * 销毁所有模块
   */
  destroyModules: function() {
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
    
    console.log('所有模块已销毁');
  }
};

Page(BasePage.createPage(pageConfig));