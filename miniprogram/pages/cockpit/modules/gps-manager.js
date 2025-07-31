/**
 * GPS管理器 - 智能滤波版
 * 
 * 设计原则：
 * - 充分利用小程序位置API的优势
 * - 集成智能滤波器，基于航空常识过滤异常数据
 * - 保持代码简洁和可维护性
 * - 专注核心GPS功能
 * - 防止数据过于敏感和极端异常数据
 */

// 引入智能滤波器
var SmartFilter = require('./smart-filter.js');
// 引入飞行计算器（用于坐标格式转换）
var FlightCalculator = require('./flight-calculator.js');

var GPSManager = {
  // ===== 状态管理 =====
  isRunning: false,
  hasPermission: false,
  currentLocation: null,
  lastLocation: null,
  isOfflineMode: false,  // 离线模式标志
  lastKnownGoodLocation: null,  // 最后已知的有效位置
  
  // ===== GPS数据节流控制 =====
  lastProcessTime: 0,           // 上次处理GPS数据的时间戳
  processInterval: 1000,        // GPS数据处理间隔（毫秒）- 1秒一次
  
  // ===== 位置历史和航迹计算 =====
  locationHistory: [],              // 位置历史记录
  flightCalculator: null,           // 飞行计算器实例
  maxHistorySize: 20,               // 最大历史记录数量
  
  // ===== 滤波器管理 =====
  activeFilterType: 'smart',        // 当前激活的滤波器类型
  smartFilter: null,                // 智能滤波器实例
  filterFailureCount: 0,            // 滤波器失败计数
  
  // ===== 配置和回调 =====
  config: null,
  callbacks: null,
  page: null,
  
  // ===== 核心方法 =====
  
  /**
   * 初始化GPS管理器
   * @param {Object} page 页面实例
   * @param {Object} callbacks 回调函数集合
   * @param {Object} config 配置对象
   */
  init: function(page, callbacks, config) {
    this.page = page;
    this.callbacks = callbacks || {};
    this.config = config;
    
    // 初始化飞行计算器
    this.initializeFlightCalculator();
    
    // 初始化智能滤波器
    this.initializeSmartFilter();
    
    // 检测网络状态
    this.checkNetworkStatus();
    
    // 尝试恢复最后已知位置
    this.restoreLastKnownLocation();
    
    console.log('🛰️ GPS管理器初始化完成');
    this.updateStatus('初始化完成');
  },

  /**
   * 初始化飞行计算器
   */
  initializeFlightCalculator: function() {
    try {
      this.flightCalculator = FlightCalculator.create(this.config);
      console.log('✈️ 飞行计算器初始化成功');
    } catch (error) {
      console.error('❌ 飞行计算器初始化失败:', error);
      this.flightCalculator = null;
    }
  },

  /**
   * 初始化智能滤波器
   */
  initializeSmartFilter: function() {
    try {
      this.smartFilter = SmartFilter.create();
      console.log('🛡️ 智能GPS滤波器初始化成功');
    } catch (error) {
      console.error('❌ 智能滤波器初始化失败:', error);
      this.handleFilterFailure('smart_init', error);
    }
  },

  /**
   * 检测网络状态
   */
  checkNetworkStatus: function() {
    var self = this;
    wx.getNetworkType({
      success: function(res) {
        self.isOfflineMode = (res.networkType === 'none');
        console.log('📡 网络状态:', res.networkType, self.isOfflineMode ? '(离线模式)' : '(在线)');
        
        if (self.isOfflineMode && self.callbacks.onOfflineModeDetected) {
          self.callbacks.onOfflineModeDetected();
        }
      },
      fail: function() {
        // 检测失败，假设为离线
        self.isOfflineMode = true;
        console.warn('⚠️ 网络状态检测失败，假设为离线模式');
      }
    });
  },

  /**
   * 恢复最后已知位置
   */
  restoreLastKnownLocation: function() {
    try {
      var lastLocation = wx.getStorageSync('cockpit_lastKnownLocation');
      if (lastLocation && lastLocation.latitude && lastLocation.longitude) {
        this.lastKnownGoodLocation = lastLocation;
        console.log('📍 恢复最后已知位置:', lastLocation);
        
        // 如果是离线模式，立即使用这个位置
        if (this.isOfflineMode) {
          this.currentLocation = lastLocation;
          if (this.callbacks.onLocationUpdate) {
            this.callbacks.onLocationUpdate(lastLocation);
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ 无法恢复最后已知位置:', e);
    }
  },

  /**
   * 处理滤波器故障转移
   * @param {string} filterType 故障的滤波器类型
   * @param {Error} error 错误信息
   */
  handleFilterFailure: function(filterType, error) {
    this.filterFailureCount++;
    console.warn('⚠️ 滤波器故障:', filterType, error.message);
    
    // 如果智能滤波器失败或连续失败过多，则使用原始数据
    if (filterType === 'smart' || this.filterFailureCount > 3) {
      console.warn('🔄 智能滤波器失效，使用原始GPS数据');
      this.activeFilterType = 'none';
      
      // 清理失效的滤波器
      if (this.smartFilter) {
        this.smartFilter.destroy();
        this.smartFilter = null;
      }
    }
  },

  /**
   * 检查位置权限
   */
  checkLocationPermission: function() {
    var self = this;
    
    console.log('🔒 检查GPS位置权限');
    this.updateStatus('检查权限中...');
    
    wx.getSetting({
      success: function(res) {
        var hasPermission = res.authSetting['scope.userLocation'];
        
        if (hasPermission === true) {
          console.log('✅ 已有位置权限');
          self.hasPermission = true;
          self.updateStatus('权限验证成功');
          
          if (self.callbacks.onPermissionChange) {
            self.callbacks.onPermissionChange(true);
          }
          
          // 直接启动GPS追踪
          setTimeout(function() {
            self.startLocationTracking();
          }, 100);
          
        } else if (hasPermission === false) {
          console.log('❌ 位置权限被拒绝');
          self.hasPermission = false;
          self.updateStatus('权限被拒绝');
          self.handlePermissionDenied();
          
        } else {
          console.log('🤔 首次请求位置权限');
          self.updateStatus('请求权限中...');
          self.requestLocationPermission();
        }
      },
      fail: function(err) {
        console.error('❌ 获取设置失败:', err);
        self.updateStatus('权限检查失败');
        self.handleError({
          code: 'PERMISSION_CHECK_FAILED',
          message: '权限检查失败',
          details: err
        });
      }
    });
  },

  /**
   * 请求位置权限
   */
  requestLocationPermission: function() {
    var self = this;
    
    wx.authorize({
      scope: 'scope.userLocation',
      success: function() {
        console.log('✅ 位置权限授权成功');
        self.hasPermission = true;
        self.updateStatus('权限授权成功');
        
        if (self.callbacks.onPermissionChange) {
          self.callbacks.onPermissionChange(true);
        }
        
        // 短暂延迟后启动GPS追踪
        setTimeout(function() {
          self.startLocationTracking();
        }, 200);
      },
      fail: function(err) {
        console.log('❌ 位置权限授权失败:', err);
        self.hasPermission = false;
        self.updateStatus('权限授权失败');
        self.handlePermissionDenied();
      }
    });
  },

  /**
   * 处理权限被拒绝的情况
   */
  handlePermissionDenied: function() {
    var self = this;
    
    if (this.callbacks.onPermissionChange) {
      this.callbacks.onPermissionChange(false);
    }
    
    // 🔧 修改：不显示模态对话框，通过调试面板引导用户
    console.log('📍 位置权限被拒绝，启用离线模式');
    
    // 设置状态，让调试面板显示权限问题
    if (this.page && this.page.setData) {
      this.page.setData({
        showGPSWarning: true,
        gpsWarningMessage: '位置权限未授权，已启用离线模式',
        debugPanelExpanded: true,  // 自动展开调试面板
        getLocationPermission: false
      });
    }
    
    // 直接启用离线模式
    this.isOfflineMode = true;
    this.handleError({
      code: 'PERMISSION_DENIED',
      message: '位置权限未授权',
      details: '已自动切换到离线模式'
    });
    
    // 启动离线位置服务
    setTimeout(function() {
      self.startLocationTracking();
    }, 500);
  },

  /**
   * 启动位置追踪
   */
  startLocationTracking: function() {
    var self = this;
    
    if (this.isRunning) {
      console.log('GPS追踪已在运行中');
      return;
    }
    
    // 防御性检查：确保配置对象存在
    if (!this.config || !this.config.gps) {
      console.error('❌ GPS配置对象不存在，无法启动位置追踪');
      this.updateStatus('配置错误');
      return;
    }
    
    // 检查是否离线模式
    if (this.isOfflineMode) {
      console.log('🌐 检测到离线模式，使用离线位置数据');
      this.isRunning = true;
      this.handleOfflineLocationRequest();
      
      // 定期更新离线数据（模拟移动）
      this.offlineUpdateInterval = setInterval(function() {
        self.handleOfflineLocationRequest();
      }, 2000);
      
      return;
    }
    
    console.log('🛰️ 启动GPS位置追踪');
    this.updateStatus('正在启动GPS...');
    
    // 先获取一次当前位置
    wx.getLocation({
      type: this.config.gps.coordinateSystem || 'gcj02',
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 5000,
      success: function(res) {
        console.log('✅ 初始位置获取成功:', res);
        self.handleLocationUpdate(res);
      },
      fail: function(err) {
        console.warn('⚠️ 初始位置获取失败:', err);
        // 不阻断流程，继续启动持续定位
      }
    });
    
    // 启动持续位置更新
    wx.startLocationUpdate({
      type: this.config.gps.coordinateSystem || 'gcj02',
      success: function() {
        console.log('✅ 持续定位启动成功');
        self.isRunning = true;
        self.updateStatus('GPS正常工作');
        
        // 监听位置变化
        wx.onLocationChange(function(location) {
          self.handleLocationUpdate(location);
        });
        
        if (self.callbacks.onTrackingStart) {
          self.callbacks.onTrackingStart();
        }
      },
      fail: function(err) {
        console.error('❌ 启动持续定位失败:', err);
        self.updateStatus('GPS启动失败');
        self.handleError({
          code: 'LOCATION_UPDATE_FAILED',
          message: '无法启动GPS定位',
          details: err
        });
      }
    });
  },

  /**
   * 停止位置追踪
   */
  stopLocationTracking: function() {
    if (!this.isRunning) {
      return;
    }
    
    console.log('🛑 停止GPS位置追踪');
    
    // 清理离线模式定时器
    if (this.offlineUpdateInterval) {
      clearInterval(this.offlineUpdateInterval);
      this.offlineUpdateInterval = null;
    }
    
    // 停止微信API
    wx.stopLocationUpdate({
      success: function() {
        console.log('✅ 停止持续定位成功');
      }
    });
    wx.offLocationChange();
    
    this.isRunning = false;
    this.updateStatus('GPS已停止');
    
    if (this.callbacks.onTrackingStop) {
      this.callbacks.onTrackingStop();
    }
  },

  /**
   * 处理位置更新 - 智能滤波数据融合 + 航迹计算（增加1秒节流控制）
   * @param {Object} location 位置数据
   */
  handleLocationUpdate: function(location) {
    if (!location || !location.latitude || !location.longitude) {
      console.warn('⚠️ 无效的位置数据:', location);
      return;
    }
    
    // 🔧 GPS数据节流控制：确保至少1秒间隔才处理一次位置更新
    var currentTime = Date.now();
    if (this.lastProcessTime > 0 && (currentTime - this.lastProcessTime) < this.processInterval) {
      // 距离上次处理不足1秒，跳过本次更新
      return;
    }
    
    // 更新处理时间戳
    this.lastProcessTime = currentTime;
    
    console.log('🛰️ GPS数据节流通过，开始处理位置更新, 间隔:', (currentTime - (this.lastProcessTime - this.processInterval)) + 'ms');
    
    // 调试：打印原始GPS数据
    console.log('🛰️ 原始GPS数据:', {
      纬度: location.latitude,
      经度: location.longitude,
      原始高度: location.altitude,
      高度类型: typeof location.altitude,
      速度: location.speed,
      精度: location.accuracy
    });
    
    // 基本的单位转换 - 修复高度判断逻辑
    var rawData = {
      latitude: location.latitude,
      longitude: location.longitude,
      // 修复：正确的null检查，区分无数据和0高度
      altitude: (location.altitude != null && !isNaN(location.altitude)) 
        ? Math.round(location.altitude * 3.28084) 
        : null, // 用null表示无高度数据
      speed: location.speed ? Math.round(location.speed * 1.94384) : 0, // 米/秒转节
      accuracy: location.accuracy || 0,
      timestamp: Date.now(),
      altitudeValid: (location.altitude != null && !isNaN(location.altitude))
    };
    
    // 🔧 添加转换后数据调试
    console.log('🔧 GPS数据转换后:', {
      纬度: rawData.latitude,
      经度: rawData.longitude,
      转换后高度: rawData.altitude,
      速度节: rawData.speed,
      高度有效: rawData.altitudeValid
    });
    
    // 🆕 维护位置历史记录
    this.updateLocationHistory(rawData);
    
    // 🆕 计算航迹数据
    var flightData = this.calculateFlightData(rawData);
    
    // 将航迹数据合并到原始数据中
    rawData.track = flightData.track;
    rawData.verticalSpeed = flightData.verticalSpeed;
    rawData.acceleration = flightData.acceleration;
    
    // 🔧 添加航迹计算结果调试
    console.log('🧭 航迹计算结果:', {
      '计算航迹': rawData.track !== null ? Math.round(rawData.track) + '°' : 'null',
      '垂直速度': flightData.verticalSpeed + 'ft/min',
      '加速度': flightData.acceleration + 'kt/s'
    });
    
    // 智能滤波数据融合
    var processedData = this.applyIntelligentFiltering(rawData);
    
    // 更新状态
    this.currentLocation = processedData;
    
    // 添加航空格式坐标
    if (processedData.latitude && processedData.longitude) {
      processedData.latitudeAviation = FlightCalculator.formatCoordinateForAviation(processedData.latitude, 'lat');
      processedData.longitudeAviation = FlightCalculator.formatCoordinateForAviation(processedData.longitude, 'lng');
      
      // 保存最后已知的有效位置
      this.saveLastKnownLocation(processedData);
    }
    
    // 回调位置更新
    if (this.callbacks.onLocationUpdate) {
      this.callbacks.onLocationUpdate(processedData);
    }
    
    // 减少日志输出
  },

  /**
   * 🆕 更新位置历史记录
   * @param {Object} locationData 位置数据
   */
  updateLocationHistory: function(locationData) {
    // 添加时间戳
    var historyPoint = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      altitude: locationData.altitude,
      speed: locationData.speed,
      timestamp: locationData.timestamp
    };
    
    this.locationHistory.push(historyPoint);
    
    // 限制历史记录大小
    if (this.locationHistory.length > this.maxHistorySize) {
      this.locationHistory.shift();
    }
    
    console.log('📈 位置历史记录更新，当前数量:', this.locationHistory.length);
  },

  /**
   * 🆕 计算飞行数据（包括航迹）
   * @param {Object} currentData 当前位置数据
   * @returns {Object} 飞行数据 {track, verticalSpeed, acceleration}
   */
  calculateFlightData: function(currentData) {
    var defaultResult = {
      track: null,
      verticalSpeed: 0,
      acceleration: 0
    };
    
    // 检查飞行计算器是否可用
    if (!this.flightCalculator) {
      console.warn('⚠️ 飞行计算器未初始化，无法计算航迹');
      return defaultResult;
    }
    
    // 检查历史记录是否足够
    if (this.locationHistory.length < 2) {
      console.log('📊 位置历史记录不足，无法计算航迹');
      return defaultResult;
    }
    
    try {
      // 🔧 删除航迹计算的最小速度阈值，让航迹计算更敏感
      var minSpeedForTrack = 0; // 删除0.2节阈值，直接计算航迹 
      
      // 调用飞行计算器
      var flightData = this.flightCalculator.calculateFlightData(
        this.locationHistory, 
        minSpeedForTrack
      );
      
      console.log('🧮 飞行数据计算完成:', {
        速度: flightData.speed + 'kt',
        航迹: flightData.track !== null ? Math.round(flightData.track) + '°' : 'null',
        垂直速度: flightData.verticalSpeed + 'ft/min',
        加速度: flightData.acceleration + 'kt/s'
      });
      
      return {
        track: flightData.track,
        verticalSpeed: flightData.verticalSpeed,
        acceleration: flightData.acceleration
      };
      
    } catch (error) {
      console.error('❌ 飞行数据计算失败:', error);
      return defaultResult;
    }
  },

  /**
   * 智能滤波数据融合
   * @param {Object} rawData 原始GPS数据
   * @returns {Object} 处理后的数据
   */
  applyIntelligentFiltering: function(rawData) {
    try {
      // 使用智能滤波器
      switch (this.activeFilterType) {
        case 'smart':
          return this.applySmartFiltering(rawData);
        case 'none':
        default:
          return rawData;
      }
    } catch (error) {
      console.error('❌ 滤波处理失败:', error);
      this.handleFilterFailure(this.activeFilterType, error);
      return rawData; // 返回原始数据作为兜底
    }
  },

  /**
   * 应用智能滤波
   * @param {Object} rawData 原始数据
   * @returns {Object} 滤波后的数据
   */
  applySmartFiltering: function(rawData) {
    if (!this.smartFilter) {
      console.warn('⚠️ 智能滤波器未初始化，使用原始数据');
      return rawData;
    }

    try {
      // 应用智能滤波
      var filteredResult = this.smartFilter.update({
        latitude: rawData.latitude,
        longitude: rawData.longitude,
        altitude: rawData.altitude,
        speed: rawData.speed,
        track: rawData.track || 0 // 🔧 修复：使用计算得到的航迹数据
      });

      if (filteredResult && filteredResult.filterType === 'smart') {
        var result = {
          latitude: filteredResult.latitude,
          longitude: filteredResult.longitude,
          altitude: filteredResult.altitude,
          speed: filteredResult.groundSpeed || rawData.speed,
          track: filteredResult.track || rawData.track, // 🔧 保持原始航迹或滤波后的航迹
          verticalSpeed: rawData.verticalSpeed || 0,    // 🆕 保持垂直速度
          acceleration: rawData.acceleration || 0,      // 🆕 保持加速度
          accuracy: rawData.accuracy,
          timestamp: rawData.timestamp,
          filterType: 'smart',
          consecutiveAnomalies: filteredResult.consecutiveAnomalies || 0
        };
        
        // 🛡️ 添加智能滤波结果调试
        console.log('🛡️ 智能滤波结果:', {
          '滤波后高度': result.altitude?.toFixed(0) + 'ft',
          '滤波后速度': result.speed?.toFixed(0) + 'kt',
          '滤波后航迹': result.track !== null && result.track !== undefined ? Math.round(result.track) + '°' : 'null',
          '垂直速度': result.verticalSpeed + 'ft/min',
          '连续异常次数': result.consecutiveAnomalies
        });
        
        return result;
      } else {
        console.warn('⚠️ 智能滤波器返回无效结果');
        return rawData;
      }
    } catch (error) {
      console.error('❌ 智能滤波处理失败:', error);
      this.handleFilterFailure('smart', error);
      return rawData;
    }
  },

  // ===== 简化的工具方法 =====

  /**
   * 更新GPS状态
   * @param {String} status 状态描述
   */
  updateStatus: function(status) {
    console.log('📡 GPS状态:', status);
    
    if (this.callbacks.onStatusUpdate) {
      this.callbacks.onStatusUpdate(status);
    }
    
    // 更新页面数据
    if (this.page && this.page.setData) {
      this.page.setData({
        gpsStatus: status
      });
    }
  },

  /**
   * 处理错误
   * @param {Object} error 错误对象
   */
  handleError: function(error) {
    console.error('❌ GPS错误:', error);
    
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
    
    // 🔧 修改：不设置locationError，避免显示错误页面
    // 而是显示GPS警告横幅，保持在驾驶舱界面
    if (this.page && this.page.setData) {
      this.page.setData({
        // locationError: error.message,  // 注释掉，不显示错误页面
        gpsStatus: '定位失败',
        showGPSWarning: true,  // 显示警告横幅
        gpsWarningMessage: error.message || '位置权限未授权',
        debugPanelExpanded: true  // 自动展开调试面板
      });
    }
    
    // 如果是权限问题，尝试使用离线模式
    if (error.code === 'PERMISSION_DENIED' || error.code === 'PERMISSION_CHECK_FAILED') {
      console.log('🌐 权限被拒绝，尝试离线模式');
      this.isOfflineMode = true;
      this.handleOfflineLocationRequest();
    }
  },

  // ===== 公共接口 =====

  /**
   * 获取当前位置
   * @returns {Object} 当前位置数据
   */
  getCurrentLocation: function() {
    return this.currentLocation;
  },

  /**
   * 获取运行状态
   * @returns {Boolean} 是否正在运行
   */
  getIsRunning: function() {
    return this.isRunning;
  },

  /**
   * 获取权限状态
   * @returns {Boolean} 是否有权限
   */
  getHasPermission: function() {
    return this.hasPermission;
  },

  /**
   * 强制刷新位置
   */
  refreshLocation: function() {
    var self = this;
    
    if (!this.hasPermission) {
      console.warn('⚠️ 没有位置权限，无法刷新位置');
      return;
    }
    
    wx.getLocation({
      type: this.config.gps.coordinateSystem || 'gcj02',
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 3000,
      success: function(res) {
        console.log('🔄 手动刷新位置成功');
        self.handleLocationUpdate(res);
      },
      fail: function(err) {
        console.error('❌ 手动刷新位置失败:', err);
        self.handleError({
          code: 'REFRESH_FAILED',
          message: '刷新位置失败',
          details: err
        });
      }
    });
  },

  /**
   * 保存最后已知的有效位置
   * @param {Object} location 位置数据
   */
  saveLastKnownLocation: function(location) {
    if (!location || !location.latitude || !location.longitude) {
      return;
    }
    
    try {
      this.lastKnownGoodLocation = location;
      wx.setStorageSync('cockpit_lastKnownLocation', {
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude,
        speed: location.speed,
        heading: location.heading,
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('⚠️ 无法保存最后已知位置:', e);
    }
  },

  /**
   * 处理离线模式下的位置请求
   */
  handleOfflineLocationRequest: function() {
    console.log('🌐 离线模式：使用最后已知位置或模拟数据');
    
    if (this.lastKnownGoodLocation) {
      // 使用最后已知位置
      var offlineLocation = Object.assign({}, this.lastKnownGoodLocation);
      offlineLocation.isOfflineData = true;
      offlineLocation.timestamp = Date.now();
      
      this.currentLocation = offlineLocation;
      if (this.callbacks.onLocationUpdate) {
        this.callbacks.onLocationUpdate(offlineLocation);
      }
      
      this.updateStatus('离线模式 - 使用缓存位置');
    } else {
      // 提供默认模拟位置（北京首都机场）
      var simulatedLocation = {
        latitude: 40.0801,
        longitude: 116.5846,
        altitude: 100,
        speed: 0,
        heading: 0,
        accuracy: 0,
        timestamp: Date.now(),
        isOfflineData: true,
        isSimulated: true
      };
      
      this.currentLocation = simulatedLocation;
      if (this.callbacks.onLocationUpdate) {
        this.callbacks.onLocationUpdate(simulatedLocation);
      }
      
      this.updateStatus('离线模式 - 模拟数据');
    }
  },

  /**
   * 销毁GPS管理器
   * 清理资源，停止位置监听，清空回调和状态
   */
  destroy: function() {
    console.log('🛰️ 销毁GPS管理器...');
    
    // 停止位置监听
    if (this.isRunning) {
      this.stopLocationTracking();
    }
    
    // 清空状态
    this.isRunning = false;
    this.hasPermission = false;
    this.currentLocation = null;
    this.lastLocation = null;
    
    // 🆕 清空位置历史记录
    this.locationHistory = [];
    
    // 🔧 重置GPS数据节流状态
    this.lastProcessTime = 0;
    
    // 🆕 清理飞行计算器
    if (this.flightCalculator) {
      // FlightCalculator没有destroy方法，直接置空
      this.flightCalculator = null;
    }
    
    // 清空滤波器
    if (this.smartFilter) {
      this.smartFilter.destroy();
      this.smartFilter = null;
    }
    this.filterFailureCount = 0;
    
    // 清空引用
    this.config = null;
    this.callbacks = null;
    this.page = null;
    
    console.log('🛰️ GPS管理器已销毁');
  }
};

// ===== 工厂方法 =====

/**
 * 创建GPS管理器实例
 * @param {Object} config 配置对象
 * @returns {Object} GPS管理器实例
 */
function create(config) {
  // 创建新实例
  var instance = Object.create(GPSManager);
  instance.config = config;
  return instance;
}

// 导出模块
module.exports = {
  create: create
};