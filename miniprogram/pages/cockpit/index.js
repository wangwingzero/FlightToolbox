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
// var KalmanFilter = require('./modules/kalman-filter.js'); // 已移除，因导致系统问题
var ToastManager = require('./modules/toast-manager.js');

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
    rightAirportLabel: '次近机场'
  },
  
  customOnLoad: function(options) {
    console.log('驾驶舱页面加载 - 模块化版本');
    this.initializeModules();
    this.startServices();
  },
  
  customOnShow: function() {
    console.log('📱 驾驶舱页面显示 - 启动服务');
    
    // 🔧 修复：页面显示时先清除可能的错误状态
    this.setData({
      locationError: null
    });
    
    // 重新检查GPS权限状态
    if (this.gpsManager) {
      this.gpsManager.checkLocationPermission();
    }
    
    // 启动指南针（如果还没启动）
    if (this.compassManager && !this.compassManager.getStatus().isRunning) {
      var context = this.getCurrentContext();
      console.log('🧭 页面显示时启动指南针');
      this.compassManager.start(context);
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
    
    // 3. 卡尔曼滤波器 - 已禁用 (因导致系统问题)
    this.kalmanFilter = null;
    /*
    if (config.kalman && config.kalman.enabled) {
      // 卡尔曼滤波器代码已移除
    }
    */
    
    // 4. 创建GPS管理器
    this.gpsManager = GPSManager.create(config);
    this.gpsManager.init(this, {
      onPermissionGranted: function() {
        console.log('🔧 GPS权限已授予，执行完整状态重置流程');
        
        // 🔧 增强修复：确保mapRange在权限授予时有有效值
        var validMapRange = self.data.mapRange;
        if (!validMapRange || validMapRange === 0 || validMapRange === null || validMapRange === undefined) {
          validMapRange = config.map.zoomLevels[config.map.defaultZoomIndex];
          console.log('🔧 权限授予时mapRange无效，重置为默认值:', validMapRange + 'NM');
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
            latitude: parseFloat(self.data.latitude) || 0,
            longitude: parseFloat(self.data.longitude) || 0,
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
          self.setData({
            locationError: errorMsg
          });
        } else {
          // 🔧 修复：清除错误状态
          console.log('🔧 清除GPS位置错误状态');
          self.setData({
            locationError: null
          });
        }
      },
      onGPSStatusChange: function(status) {
        self.setData({
          gpsStatus: status,
          gpsStatusClass: self.calculateGPSStatusClass(status)
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
    }, this.flightCalculator, null); // 移除卡尔曼滤波器参数
    
    // 5. 创建指南针管理器
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
        self.setData({
          showGPSWarning: true
        });
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
    }, null); // 移除卡尔曼滤波器参数
    
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
   * 🔧 修复9：添加页面初始化逻辑，确保指南针正确启动
   */
  customOnLoad: function(options) {
    console.log('🚀 驾驶舱页面加载，参数:', options);
    
    // 初始化所有模块
    this.initializeModules();
    
    // 启动服务
    this.startServices();
    
    // 初始启动指南针
    setTimeout(function() {
      if (this.compassManager) {
        var context = this.getCurrentContext();
        this.compassManager.start(context);
      }
    }.bind(this), 500); // 给其他模块一点初始化时间
  },

  /**
   * 启动服务
   */
  startServices: function() {
    // 加载机场数据
    this.airportManager.loadAirportsData();
    
    // 检查网络状态
    this.gpsManager.checkNetworkStatus();
    
    // 🔧 修复：主动启动GPS追踪
    console.log('🛰️ 启动GPS位置追踪服务');
    this.gpsManager.checkLocationPermission();
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
        // 使用智能toast避免频繁的GPS异常提示
        this.toastManager.showSmartToast('GPS_SPEED_ANOMALY', 'GPS信号异常', {
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
      gpsStatusClass: this.calculateGPSStatusClass(locationData.gpsStatus),
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
   * 更新地图渲染器数据（调试版：确保数据传递）
   */
  updateMapRenderer: function() {
    if (!this.mapRenderer) return;
    
    var renderData = {
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
   * 启动模拟模式（用于权限被拒绝或离线情况）
   */
  startSimulatedMode: function() {
    if (this.gpsManager) {
      this.gpsManager.startSimulatedMode();
    }
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
      latitude: parseFloat(this.data.latitude) || 0,
      longitude: parseFloat(this.data.longitude) || 0,
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
    
    // 卡尔曼滤波器 - 已禁用
    if (this.kalmanFilter) {
      // this.kalmanFilter.reset(); // 卡尔曼滤波器只需重置即可
      this.kalmanFilter = null;
    }
    
    if (this.toastManager) {
      this.toastManager.clearAll();
      this.toastManager = null;
    }
    
    console.log('所有模块已销毁');
  }
};

Page(BasePage.createPage(pageConfig));