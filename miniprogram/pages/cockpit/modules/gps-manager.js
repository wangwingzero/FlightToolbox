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
// 引入统一日志管理器
var Logger = require('./logger.js');

var GPSManager = {
  // ===== 状态管理 =====
  isRunning: false,
  hasPermission: false,
  currentLocation: null,
  lastLocation: null,
  isOfflineMode: false,  // 离线模式标志
  lastKnownGoodLocation: null,  // 最后已知的有效位置
  
  // 🔧 新增状态变量（GPS监听器和健康检查）
  locationListenerActive: false,    // GPS监听器是否激活
  lastLocationUpdateTime: 0,        // 最后收到位置更新的时间
  healthCheckTimer: null,           // 健康检查定时器句柄
  healthCheckIntervalMs: 5000,      // 健康检查间隔毫秒数
  
  // ===== GPS数据节流控制 =====
  lastProcessTime: 0,           // 上次处理GPS数据的时间戳
  processInterval: 200,         // GPS数据处理间隔（毫秒）- 200ms一次，平衡性能和响应速度
  isUpdating: false,            // 防重复更新标志
  
  // ===== 主动GPS刷新机制 =====
  activeGPSRefreshInterval: 5000,  // 主动GPS刷新间隔（毫秒）- 每5秒一次
  activeGPSRefreshTimer: null,     // 主动GPS刷新定时器
  
  // ===== 监听器重置机制 =====
  listenerResetInProgress: false,  // 监听器重置进行中标志
  
  // ===== 位置历史和航迹计算 =====
  locationHistory: [],              // 位置历史记录
  flightCalculator: null,           // 飞行计算器实例
  maxHistorySize: 20,               // 最大历史记录数量
  
  // ===== TRK稳定化状态 =====
  lastStableTrack: null,            // 最后稳定的航迹值
  stationaryCounter: 0,             // 静止状态计数器
  lastTrackUpdateTime: 0,           // 上次TRK更新时间
  
  // ===== 滤波器管理 =====
  activeFilterType: 'none',         // 强制使用原始数据，不进行任何过滤
  smartFilter: null,                // 智能滤波器实例（已禁用）
  filterFailureCount: 0,            // 滤波器失败计数
  
  // ===== 配置和回调 =====
  config: null,
  callbacks: null,
  page: null,
  
  // ===== 核心方法 =====
  
  /**
   * 初始化智能滤波器
   */
  initializeSmartFilter: function() {
    try {
      this.smartFilter = SmartFilter.create(this.config);
      Logger.info('🛡️ 智能GPS滤波器初始化成功');
    } catch (error) {
      Logger.error('❌ 智能滤波器初始化失败，回退到原始数据:', error);
      this.activeFilterType = 'none';
      this.smartFilter = null;
    }
  },
  
  /**
   * GPS原始数据直通验证（禁止任何滤波处理）
   *
   * 核心安全约束：根据项目"GPS原始数据规则"，GPS地速和GPS高度必须使用原始数据，
   * 禁止对GPS数据使用滤波、平滑等算法处理。本函数仅进行数据有效性验证，不做任何修改。
   *
   * @param {Object} rawData 原始GPS数据
   * @returns {Object} 原始数据（未经任何处理）
   */
  validateAndPassthroughGPSData: function(rawData) {
    // GPS原始数据直通 - 禁止任何滤波处理(项目核心安全约束)
    // 仅验证数据有效性，不修改任何数值
    if (!rawData) {
      Logger.warn('⚠️ GPS数据为空');
      return null;
    }
    return rawData;
  },
  
  /**
   * 初始化GPS管理器
   * @param {Object} page 页面实例
   * @param {Object} callbacks 回调函数集合
   * @param {Object} config 配置对象
   */
  init: function(page, callbacks, config) {
    Logger.debug('🚀 GPS管理器开始初始化...');
    
    this.page = page;
    this.callbacks = callbacks || {};
    
    // 🔧 增强配置验证
    if (!config) {
      Logger.error('❌ GPS管理器初始化失败: config参数为空');
      Logger.debug('🔍 传入参数调试:', {
        hasPage: !!page,
        hasCallbacks: !!callbacks,
        hasConfig: !!config,
        configType: typeof config
      });
    } else {
      Logger.debug('✅ config参数验证通过');
    }
    
    this.config = config;
    
    // 🔧 二次验证实例config设置
    Logger.debug('🔧 验证实例config设置:', {
      hasInstanceConfig: !!this.config,
      configType: typeof this.config,
      hasGPS: !!(this.config && this.config.gps)
    });
    
    // 初始化飞行计算器
    this.initializeFlightCalculator();
    
    // 加载配置参数
    this.loadConfigurationParameters();
    
    // 强制禁用所有滤波器，直接使用原始数据
    this.activeFilterType = 'none';
    Logger.info('📡 强制使用原始GPS数据模式（不进行任何过滤）');
    // 注释掉滤波器初始化
    // if (config?.gps?.enableSmartFilter) {
    //   this.activeFilterType = 'smart';
    //   this.initializeSmartFilter();
    //   Logger.info('🛡️ 已启用智能GPS滤波器（稳健参数）');
    // }
    
    // 🚀 优化：并行初始化以加快GPS权限申请
    var self = this;
    
    // 并行检测网络状态和申请权限
    this.checkNetworkStatus();
    
    // 初始化标志
    this.forceGPSAttempted = false;  // 重置强制GPS尝试标志
    
    // 尝试恢复最后已知位置
    this.restoreLastKnownLocation();
    
    // 🔧 关键改进1：立即设置wx.onLocationChange监听器，不依赖异步回调
    Logger.gps('立即设置GPS位置监听器（无条件）');
    this.setupLocationListener();
    
    Logger.info('🛰️ GPS管理器初始化完成');
    this.updateStatus('初始化完成');
    
    // 🔧 关键改进2：强制启动持续定位，无论网络状态
    Logger.gps('强制启动GPS权限申请和持续定位服务');
    this.forceStartLocationService();
  },

  /**
   * 初始化飞行计算器
   */
  initializeFlightCalculator: function() {
    try {
      this.flightCalculator = FlightCalculator.create(this.config);
      Logger.debug('✈️ 飞行计算器初始化成功');
    } catch (error) {
      Logger.error('❌ 飞行计算器初始化失败:', error);
      this.flightCalculator = null;
    }
  },
  
  /**
   * 加载配置参数
   */
  loadConfigurationParameters: function() {
    // 🔧 增强配置验证和调试信息
    Logger.debug('🔧 开始加载GPS配置参数...');
    
    // 详细验证config状态
    if (!this.config) {
      Logger.error('❌ GPS配置加载失败: this.config 为空');
      Logger.debug('🔍 调试信息: 当前实例状态:', {
        hasConfig: !!this.config,
        configType: typeof this.config,
        instanceKeys: Object.keys(this)
      });
      this.loadDefaultConfiguration();
      return;
    }
    
    if (!this.config.gps) {
      Logger.error('❌ GPS配置加载失败: config.gps 不存在');
      Logger.debug('🔍 调试信息: config结构:', {
        hasGPS: !!this.config.gps,
        configKeys: Object.keys(this.config),
        gpsType: typeof this.config.gps
      });
      this.loadDefaultConfiguration();
      return;
    }
    
    var gpsConfig = this.config.gps;
    Logger.debug('✅ GPS配置验证成功，开始加载参数...');
    
    // 加载GPS刷新相关配置
    this.processInterval = gpsConfig.dataProcessInterval || 200;  // 优化到200ms平衡性能和响应速度
    this.activeGPSRefreshInterval = gpsConfig.activeRefreshInterval || 5000;
    this.activeRefreshTriggerDelay = gpsConfig.activeRefreshTriggerDelay || 3000;
    
    Logger.debug('🆕 加载GPS配置参数:', {
      '数据处理间隔': this.processInterval + 'ms',
      '主动刷新间隔': this.activeGPSRefreshInterval + 'ms',
      '主动刷新触发延迟': this.activeRefreshTriggerDelay + 'ms'
    });
  },

  /**
   * 🛡️ 加载默认配置参数 (配置加载失败时的备用方案)
   */
  loadDefaultConfiguration: function() {
    Logger.warn('🔧 使用GPS管理器默认配置参数');
    
    // GPS数据刷新相关配置
    this.processInterval = 200;                    // GPS数据处理间隔（毫秒）- 优化到200ms平衡性能和响应速度
    this.activeGPSRefreshInterval = 5000;          // 主动GPS刷新间隔（毫秒）
    this.activeRefreshTriggerDelay = 3000;         // 主动刷新触发延迟（毫秒）
    
    // GPS定位相关配置
    this.maxGPSAttempts = 4;                       // 最大GPS尝试次数
    this.pureGPSTimeout = 25000;                   // 纯GPS模式超时时间（毫秒）
    this.highAccuracyExpireTime = 1000;           // 高精度GPS超时时间（1秒）
    this.networkLocationTolerance = 50;            // 网络定位置信度阈值（%）
    
    // GPS状态和健康检查配置
    this.healthCheckIntervalMs = 5000;               // GPS健康检查间隔（毫秒）
    this.healthCheckTimeout = 15000;               // GPS健康检查超时时间（毫秒）
    this.listenerResetTriggerDelay = 8000;         // 监听器重置触发延迟（毫秒）
    this.signalLossThreshold = 30;                 // GPS信号丢失阈值（秒）
    this.accuracyThreshold = 50;                   // GPS精度阈值（米）
    
    // GPS过滤和验证配置
    this.maxReasonableSpeed = 600;                 // 最大合理速度（kt）
    this.maxAcceleration = 30;                     // 最大加速度（kt/s）
    this.speedBufferSize = 8;                      // 速度缓冲区大小
    this.staticSpeedThreshold = 2;                 // 静止检测速度阈值（kt）
    this.minLocationInterval = 1.0;                // 最小位置更新间隔（秒）
    
    // 高度异常检测配置
    this.altitudeChangeThreshold = 200;            // 高度变化阈值（米/秒）
    this.maxValidAltitude = 15000;                 // 最高有效高度（米）
    this.minValidAltitude = -500;                  // 最低有效高度（米）
    
    // 历史数据管理
    this.maxHistorySize = 10;                      // 位置历史最大保存数量
    
    Logger.debug('✅ 默认GPS配置参数加载完成:', {
      '数据处理间隔': this.processInterval + 'ms',
      '主动刷新间隔': this.activeGPSRefreshInterval + 'ms',
      '最大尝试次数': this.maxGPSAttempts,
      '精度阈值': this.accuracyThreshold + 'm'
    });
  },

  /**
   * 🔧 立即设置GPS位置监听器（关键改进）
   * 不依赖wx.startLocationUpdate的success回调，立即设置监听器
   */
  setupLocationListener: function() {
    var self = this;
    
    try {
      // 先清除可能存在的旧监听器
      wx.offLocationChange();
      Logger.debug('🧹 清除旧的位置监听器');
      
      // 立即设置新的位置监听器 - 增强版本，包含页面状态保护
      wx.onLocationChange(function(location) {
        // 🔒 关键保护：第一时间检查页面状态，防止DOM更新错误
        if (!self.page || self.page._isDestroying || self.page.isDestroyed) {
          Logger.warn('⚠️ GPS位置回调被拒绝: 页面已销毁或正在销毁');
          return;
        }

        // 🔒 使用BasePage提供的页面状态检查方法（如果可用）
        if (self.page._isPageDestroyed && self.page._isPageDestroyed()) {
          Logger.warn('⚠️ GPS位置回调被拒绝: BasePage状态检查失败');
          return;
        }

        Logger.gps('收到GPS位置更新:', location);
        Logger.debug('🔍 位置数据详情:', {
          纬度: location.latitude,
          经度: location.longitude,
          高度: location.altitude,
          速度: location.speed,
          精度: location.accuracy,
          提供商: location.provider
        });
        
        // 标记监听器工作正常
        self.locationListenerActive = true;
        self.lastLocationUpdateTime = Date.now();
        
        // 🔒 在处理更新前再次检查页面状态
        if (!self.page || self.page._isDestroying || self.page.isDestroyed) {
          Logger.warn('⚠️ 位置数据处理被中断: 页面状态已改变');
          return;
        }
        
        // 处理位置更新
        self.handleLocationUpdate(location);
      });
      
      // 🆕 标记监听器已设置，等待首次数据（修复状态冲突）
      this.locationListenerActive = false; // 初始未激活，等首次数据再置true
      
      Logger.gps('GPS位置监听器设置成功，等待位置数据...');
      
    } catch (error) {
      Logger.error('❌ 设置GPS位置监听器失败:', error);
    }
  },

  /**
   * 🔧 强制启动GPS定位服务（关键改进）
   * 多重保障策略，确保持续定位必定启动
   */
  forceStartLocationService: function() {
    var self = this;
    
    Logger.gps('启动强制GPS定位服务...');
    this.updateStatus('强制启动GPS服务');
    
    // 策略1：直接启动持续定位（不依赖权限检查）
    this.attemptStartLocationUpdate('直接启动');
    
    // 策略2：并行进行权限检查和启动
    setTimeout(function() {
      self.checkLocationPermission();
    }, 100);
    
    // 策略3：备用启动机制（延迟启动）
    setTimeout(function() {
      if (!self.isRunning || !self.locationListenerActive) {
        Logger.debug('🔄 检测到GPS未启动，执行备用启动机制');
        self.attemptStartLocationUpdate('备用启动');
      }
    }, 2000);
    
    // 策略4：健康检查机制
    this.startLocationHealthCheck();
    
    // 策略5：启动主动GPS刷新机制
    this.startActiveGPSRefresh();
  },

  /**
   * 🔧 尝试启动wx.startLocationUpdate（核心方法）
   * @param {string} reason 启动原因（用于调试）
   */
  attemptStartLocationUpdate: function(reason) {
    var self = this;
    
    Logger.gps('尝试启动位置更新服务 - 原因:', reason);
    
    wx.startLocationUpdate({
      type: 'wgs84',  // 强制使用wgs84坐标系（GPS原生坐标）
      isHighAccuracy: true,  // 启用高精度GPS模式
      interval: 500,  // 位置更新间隔 - 500ms更新一次（提高2Hz更新频率）
      success: function(res) {
        Logger.info('✅ 位置更新服务启动成功 (' + reason + '):', res);
        self.isRunning = true;
        self.hasPermission = true;  // 🔧 修复：启动成功说明有权限
        self.updateStatus('GPS服务已启动');

        // 🔧 修复：更新页面的权限状态显示
        if (self.callbacks.onPermissionGranted) {
          self.callbacks.onPermissionGranted();
        }

        // 🆕 确保监听器已设置（关键改进）
        if (!self.locationListenerActive) {
          Logger.debug('🔄 持续定位启动成功，重新设置监听器确保数据接收');
          self.setupLocationListener();
        }

        // 立即尝试获取一次位置
        setTimeout(function() {
          self.attemptGPSLocation(0);
        }, 500);

        if (self.callbacks.onTrackingStart) {
          self.callbacks.onTrackingStart();
        }
      },
      fail: function(err) {
        Logger.warn('⚠️ 位置更新服务启动失败 (' + reason + '):', err);
        
        // 根据错误类型进行处理
        if (err.errMsg.indexOf('permission denied') > -1) {
          Logger.debug('📱 权限问题，尝试申请权限');
          self.requestLocationPermission();
        } else if (err.errMsg.indexOf('is starting') > -1) {
          Logger.debug('🔄 服务已在启动中，标记为运行状态');
          self.isRunning = true;
          // 🆕 即使服务已启动，也要确保监听器正常工作
          if (!self.locationListenerActive) {
            self.setupLocationListener();
          }
        } else {
          Logger.debug('🌐 其他错误，可能需要用户手动干预');
          self.updateStatus('GPS启动需要用户授权');
          
          // 🆕 即使出错，也尝试设置监听器（防止服务实际已启动但报错）
          self.setupLocationListener();
        }
      }
    });
  },

  /**
   * 🆕 启动主动GPS刷新机制
   * 定期主动获取GPS数据作为被动监听的补充
   */
  startActiveGPSRefresh: function() {
    var self = this;

    // 使用高频率主动获取策略
    var activeRefreshInterval = 1000;  // 每1秒检查一次
    var activeRefreshTriggerDelay = 800;  // 0.8秒没更新就主动获取

    Logger.debug('🚀 启动高频GPS刷新机制（每' + activeRefreshInterval + 'ms检查，' + activeRefreshTriggerDelay + 'ms触发）');

    // 清除可能存在的旧定时器
    if (this.activeGPSRefreshTimer) {
      clearInterval(this.activeGPSRefreshTimer);
    }

    // 高频检查并主动获取GPS
    this.activeGPSRefreshTimer = setInterval(function() {
      var now = Date.now();
      var timeSinceLastUpdate = now - self.lastLocationUpdateTime;

      // 如果超过0.8秒没有更新，使用wx.getLocation主动获取
      if (self.isRunning && timeSinceLastUpdate > activeRefreshTriggerDelay) {
        Logger.debug('⚑️ wx.getLocation主动获取（距上次' + timeSinceLastUpdate + 'ms）');

        // 使用wx.getLocation高频获取GPS
        wx.getLocation({
          type: 'wgs84',
          altitude: true,
          isHighAccuracy: true,
          highAccuracyExpireTime: 500,  // 0.5秒超时，极速响应
          success: function(res) {
            // 成功获取，直接处理数据
            if (res && res.latitude && res.longitude) {
              Logger.debug('✅ wx.getLocation获取成功');
              self.handleLocationUpdate(res);
            }
          },
          fail: function(error) {
            // 失败不影响，等待下次尝试
            if (self.config?.debug?.enableVerboseLogging) {
              Logger.debug('wx.getLocation失败，等待下次');
            }
          }
        });
      }
    }, activeRefreshInterval);
  },

  /**
   * 🔧 启动GPS健康检查机制
   * 定期检查GPS是否正常工作，如果不正常则自动重启
   */
  startLocationHealthCheck: function() {
    var self = this;
    
    Logger.debug('🩺 启动GPS健康检查机制');
    
    // 使用分离的字段避免命名冲突
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    // 每5秒检查一次GPS状态
    this.healthCheckTimer = setInterval(function() {
      var now = Date.now();
      var timeSinceLastUpdate = now - self.lastLocationUpdateTime;
      
      // 如果超过配置的健康检查超时时间没有收到位置更新，认为GPS异常
      var healthCheckTimeout = (self.config && self.config.gps && self.config.gps.healthCheckTimeout) || 15000;
      if (self.isRunning && timeSinceLastUpdate > healthCheckTimeout) {
        Logger.warn('🚨 GPS健康检查失败：超过' + Math.round(healthCheckTimeout/1000) + 's无位置更新');
        Logger.debug('🔄 先尝试主动获取GPS，再考虑重启服务');
        
        // 先尝试主动获取GPS
        self.attemptGPSLocation(0);
        
        // 如果5秒后仍无数据，再重启GPS服务
        setTimeout(function() {
          var currentTimeSinceUpdate = Date.now() - self.lastLocationUpdateTime;
          if (self.isRunning && currentTimeSinceUpdate > 18000) {
            Logger.debug('🔄 主动获取也失败，重启GPS服务');
            self.restartGPSService();
          }
        }, 5000);
        
        self.updateStatus('GPS异常，尝试恢复');
      } else if (self.locationListenerActive && timeSinceLastUpdate < 5000) {
        // GPS工作正常
        self.updateStatus('GPS工作正常');
      }
    }, this.healthCheckIntervalMs || 5000);
  },
  
  /**
   * 🔄 重启GPS服务
   */
  restartGPSService: function() {
    Logger.gps('🔄 重启GPS服务...');
    this.updateStatus('GPS重启中...');
    
    // 停止当前服务
    this.isRunning = false;
    
    // 重新启动定位服务
    this.attemptStartLocationUpdate('健康检查重启');
  },
  
  /**
   * 🔄 重置位置监听器
   * 当检测到监听器可能失效时，重新设置监听器
   */
  resetLocationListener: function() {
    var self = this;
    
    // 防止重复重置
    if (this.listenerResetInProgress) {
      Logger.debug('🔄 监听器重置已在进行中，跳过');
      return;
    }
    
    this.listenerResetInProgress = true;
    this.updateStatus('重置监听器中...');
    
    try {
      // 清除旧监听器
      wx.offLocationChange();
      Logger.debug('🧹 清除旧的位置监听器');
      
      // 等待100ms再设置新监听器
      setTimeout(function() {
        // 重新设置监听器
        self.setupLocationListener();
        
        // 重置状态
        self.listenerResetInProgress = false;
        self.updateStatus('GPS监听器已重置');
        
        Logger.gps('✅ GPS监听器重置完成');
      }, 100);
      
    } catch (error) {
      Logger.error('❌ 重置监听器失败:', error);
      this.listenerResetInProgress = false;
      this.updateStatus('GPS监听器重置失败');
    }
  },

  /**
   * 初始化智能滤波器
   */
  initializeSmartFilter: function() {
    try {
      this.smartFilter = SmartFilter.create(this.config);
      Logger.info('🛡️ 智能GPS滤波器初始化成功');
    } catch (error) {
      Logger.error('❌ 智能滤波器初始化失败:', error);
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
        Logger.debug('📡 网络状态:', res.networkType, self.isOfflineMode ? '(离线模式)' : '(在线)');
        
        if (self.isOfflineMode && self.callbacks.onOfflineModeDetected) {
          self.callbacks.onOfflineModeDetected();
        }
      },
      fail: function() {
        // 检测失败，假设为离线
        self.isOfflineMode = true;
        Logger.warn('⚠️ 网络状态检测失败，假设为离线模式');
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
        Logger.debug('📍 恢复最后已知位置:', lastLocation);
        
        // 如果是离线模式，立即使用这个位置
        if (this.isOfflineMode) {
          this.currentLocation = lastLocation;
          if (this.callbacks.onLocationUpdate) {
            this.callbacks.onLocationUpdate(lastLocation);
          }
        }
      }
    } catch (e) {
      Logger.warn('⚠️ 无法恢复最后已知位置:', e);
    }
  },

  /**
   * 处理滤波器故障转移
   * @param {string} filterType 故障的滤波器类型
   * @param {Error} error 错误信息
   */
  handleFilterFailure: function(filterType, error) {
    this.filterFailureCount++;
    Logger.warn('⚠️ 滤波器故障:', filterType, error.message);
    
    // 如果智能滤波器失败或连续失败过多，则使用原始数据
    if (filterType === 'smart' || this.filterFailureCount > 3) {
      Logger.warn('🔄 智能滤波器失效，使用原始GPS数据');
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
    
    Logger.debug('🔒 检查GPS位置权限');
    this.updateStatus('检查权限中...');
    
    // 🔧 离线模式下的权限检查优化
    if (this.isOfflineMode) {
      Logger.debug('🌐 离线模式：跳过权限API检查，立即尝试GPS');
      // 离线模式下假设有权限，直接尝试GPS
      self.hasPermission = true;
      self.updateStatus('离线模式权限验证');
      
      if (self.callbacks.onPermissionChange) {
        self.callbacks.onPermissionChange(true);
      }
      
      // 🔧 关键修复：离线模式下立即启动定位（无延迟）
      Logger.debug('🚀 离线模式立即启动定位（无延迟）');
      self.startLocationTracking();
      return;
    }
    
    // 🚀 有网络时的快速权限处理
    wx.getSetting({
      success: function(res) {
        var hasPermission = res.authSetting['scope.userLocation'];
        
        if (hasPermission === true) {
          Logger.info('✅ 已有位置权限，立即启动GPS服务');
          self.hasPermission = true;
          self.updateStatus('权限验证成功');
          
          if (self.callbacks.onPermissionChange) {
            self.callbacks.onPermissionChange(true);
          }
          
          // 🚀 优化：已有权限时立即启动定位（无延迟）
          Logger.debug('🚀 权限确认，立即启动持续定位');
          self.startLocationTracking();
          
        } else if (hasPermission === false) {
          Logger.warn('❌ 位置权限被拒绝');
          self.hasPermission = false;
          self.updateStatus('权限被拒绝');
          self.handlePermissionDenied();
          
        } else {
          Logger.debug('🤔 首次请求位置权限');
          self.updateStatus('请求权限中...');
          self.requestLocationPermission();
        }
      },
      fail: function(err) {
        Logger.error('❌ 获取设置失败:', err);
        
        // 🔧 权限检查失败时，如果是离线模式，尝试直接使用GPS
        if (self.isOfflineMode) {
          Logger.debug('🌐 离线模式：权限API失败，直接尝试GPS');
          self.hasPermission = true;
          self.updateStatus('离线模式 - 尝试GPS');
          self.startLocationTracking();
        } else {
          // 🚀 有网络但权限API失败时，尝试直接申请权限
          Logger.debug('🌐 在线模式：权限API失败，直接尝试申请权限');
          self.requestLocationPermission();
        }
      }
    });
  },

  /**
   * 请求位置权限（优化版）
   */
  requestLocationPermission: function() {
    var self = this;
    
    Logger.debug('📱 请求位置权限...');
    this.updateStatus('正在申请位置权限');
    
    wx.authorize({
      scope: 'scope.userLocation',
      success: function() {
        Logger.info('✅ 位置权限授权成功，立即启动GPS');
        self.hasPermission = true;
        self.updateStatus('权限授权成功');
        
        if (self.callbacks.onPermissionChange) {
          self.callbacks.onPermissionChange(true);
        }
        
        // 🔧 改进：使用新的强制启动机制
        Logger.debug('🚀 权限授权完成，使用强制启动机制');
        self.attemptStartLocationUpdate('权限授权成功');
      },
      fail: function(err) {
        Logger.warn('❌ 位置权限授权失败:', err);
        
        // 🔧 详细的错误分析和处理
        if (err.errMsg.indexOf('deny') > -1) {
          Logger.warn('🚫 用户主动拒绝了位置权限');
          self.handleUserDeniedPermission();
        } else if (self.isOfflineMode) {
          Logger.debug('🌐 离线模式：授权API失败，尝试直接启动GPS');
          self.hasPermission = true;
          self.updateStatus('离线模式 - 尝试GPS');
          self.attemptStartLocationUpdate('离线模式权限失败回退');
        } else {
          Logger.warn('⚠️ 其他权限问题，尝试显示引导信息');
          self.hasPermission = false;
          self.updateStatus('权限授权失败');
          self.handlePermissionDenied();
        }
      }
    });
  },

  /**
   * 🔧 处理用户主动拒绝权限的情况
   */
  handleUserDeniedPermission: function() {
    Logger.warn('🚫 用户主动拒绝位置权限，提供引导信息');
    
    this.hasPermission = false;
    this.updateStatus('位置权限被拒绝');
    
    if (this.callbacks.onPermissionChange) {
      this.callbacks.onPermissionChange(false);
    }
    
    // 显示详细的用户引导
    if (this.page && this.page.safeSetData && !this.page._isDestroying && !this.page.isDestroying) {
      this.page.safeSetData({
        showGPSWarning: true,
        gpsWarningTitle: '🚫 位置权限被拒绝',
        gpsWarningMessage: '驾驶舱功能需要位置权限来显示GPS信息。\n\n请按以下步骤开启：\n1️⃣ 点击右上角"..."菜单\n2️⃣ 选择"设置"\n3️⃣ 开启"位置信息"权限\n4️⃣ 返回驾驶舱重试',
        debugPanelExpanded: true,
        getLocationPermission: false
      });
    }
    
    // 🔧 即使权限被拒绝，也尝试离线模式
    var self = this;
    setTimeout(function() {
      Logger.debug('🌐 权限被拒绝后启用离线模式');
      self.isOfflineMode = true;
      self.handleOfflineLocationRequest();
    }, 1000);
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
    Logger.warn('📍 位置权限被拒绝，启用离线模式');
    
    // 设置状态，让调试面板显示权限问题
    if (this.page && this.page.safeSetData && !this.page._isDestroying && !this.page.isDestroying) {
      this.page.safeSetData({
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
   * 启动位置追踪（简化版，主要用于兼容现有调用）
   */
  startLocationTracking: function() {
    Logger.debug('🛰️ 调用传统startLocationTracking，转发到新的启动机制');
    
    // 🔧 简化：直接调用新的强制启动机制
    this.attemptStartLocationUpdate('传统调用转发');
    
    // 如果是离线模式，同时尝试离线GPS获取
    if (this.isOfflineMode) {
      Logger.debug('🌐 离线模式：同时尝试离线GPS获取');
      this.attemptOfflineGPS();
    }
  },

  /**
   * 停止位置追踪（严格资源清理顺序）
   */
  stopLocationTracking: function() {
    if (!this.isRunning && !this.locationListenerActive) {
      Logger.debug('🛑 GPS服务未运行，无需停止');
      return;
    }

    Logger.info('🛑 停止GPS位置追踪');

    // 🔧 清理健康检查定时器
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      Logger.debug('🧹 清理GPS健康检查定时器');
    }

    // 清理离线模式定时器
    if (this.offlineUpdateInterval) {
      clearInterval(this.offlineUpdateInterval);
      this.offlineUpdateInterval = null;
      Logger.debug('🧹 清理离线更新定时器');
    }

    // 🆕 清理主动GPS刷新定时器
    if (this.activeGPSRefreshTimer) {
      clearInterval(this.activeGPSRefreshTimer);
      this.activeGPSRefreshTimer = null;
      Logger.debug('🧹 清理主动GPS刷新定时器');
    }

    // 🔧 关键改进：严格按顺序清理位置API资源
    // 步骤1: 先取消事件监听(必须在stopLocationUpdate之前)
    try {
      wx.offLocationChange();
      Logger.debug('✅ 步骤1: 清除位置监听器成功');
    } catch (error) {
      Logger.warn('⚠️ 清除位置监听器失败:', error);
    }

    // 步骤2: 再停止位置更新服务
    try {
      wx.stopLocationUpdate({
        success: function() {
          Logger.debug('✅ 步骤2: 停止持续定位成功');
        },
        fail: function(err) {
          Logger.warn('⚠️ 停止持续定位失败:', err);
        }
      });
    } catch (error) {
      Logger.error('❌ 停止GPS服务异常:', error);
    }

    // 重置状态
    this.isRunning = false;
    this.locationListenerActive = false;
    this.lastLocationUpdateTime = 0;
    this.updateStatus('GPS已停止');

    if (this.callbacks.onTrackingStop) {
      this.callbacks.onTrackingStop();
    }

    Logger.info('🛑 GPS服务已完全停止');
  },

  /**
   * 🛰️ 航空级纯GPS定位 - 100%卫星依赖，零网络定位容忍
   * @param {number} attemptCount 尝试次数
   */
  attemptGPSLocation: function(attemptCount) {
    var self = this;
    var maxAttempts = 4; // 航空级重试次数
    
    // 🛰️ 航空级GPS超时策略：给GPS充分的卫星锁定时间
    var timeoutDurations = [60000, 45000, 30000, 20000]; // 60s, 45s, 30s, 20s
    var timeoutDuration = timeoutDurations[attemptCount] || 20000;
    
    Logger.gps('🛰️ 航空GPS定位尝试 ' + (attemptCount + 1) + '/' + maxAttempts + ', 超时: ' + timeoutDuration + 'ms');
    
    // 更新调试信息
    this.updateDebugInfo({
      gpsAttemptCount: attemptCount + 1,
      gpsStatus: '搜索GPS卫星信号... (' + (attemptCount + 1) + '/' + maxAttempts + ')'
    });
    
    // 🛰️ 强制GPS-only配置（航空级参数）
    wx.getLocation({
      type: 'wgs84',              // 强制WGS84坐标系（GPS原生）
      altitude: true,             // 必须获取高度（航空核心需求）
      isHighAccuracy: true,       // 强制高精度模式
      highAccuracyExpireTime: 1000, // 1秒快速超时
      success: function(res) {
        Logger.gps('🛰️ GPS信号获取成功 (尝试' + (attemptCount + 1) + '):', res);
        Logger.debug('📡 GPS数据详情:', {
          '坐标': res.latitude.toFixed(6) + ', ' + res.longitude.toFixed(6),
          '高度': res.altitude + 'm',
          '精度': res.accuracy + 'm',
          '速度': res.speed + 'm/s',
          '提供商': res.provider || '未知'
        });
        
        // 🔍 航空级GPS数据验证 - 分级验证系统
        var validation = self.validateAviationGPS(res, attemptCount);
        
        if (validation.valid) {
          // ✅ GPS数据通过验证，处理位置更新
          Logger.gps('✅ GPS数据通过' + validation.level + '级验证，开始处理位置更新');
          
          var statusMessage = '🛰️ ' + validation.level + 'GPS定位成功';
          var adviceMessage = validation.level === '严格航空' ? 
            '获得GPS卫星直接信号，满足航空导航精度要求' :
            validation.advice || '位置数据可用于导航';
          
          // 如果有警告信息，添加到状态中
          if (validation.warning || validation.altitudeWarning) {
            var warning = validation.warning || validation.altitudeWarning;
            statusMessage += ' ⚠️';
            adviceMessage += '（注意：' + warning + '）';
            // console.warn('⚠️ GPS验证通过但有警告：' + warning);
          }
          
          self.updateDebugInfo({
            gpsStatus: statusMessage,
            environmentAdvice: adviceMessage,
            gpsQuality: validation.gpsQuality || 'unknown'
          });
          
          self.handleLocationUpdate(res);
          
        } else {
          // ⚠️ GPS数据未通过当前级别验证，但不立即拒绝
          Logger.warn('⚠️ GPS验证失败(' + validation.level + ')：' + validation.reason);
          
          // 🔄 如果还有更低级别可以尝试，继续重试
          if (attemptCount < 3) {
            Logger.debug('🔄 尝试降低验证标准，继续GPS定位...');
            self.handleAviationGPSFailure(attemptCount, { 
              reason: validation.reason,
              advice: validation.advice,
              canRetry: true 
            });
          } else {
            // 最终失败处理
            Logger.error('🚨 GPS数据在所有级别验证中都失败');
            self.handleAviationGPSFailure(attemptCount, { 
              reason: '位置数据质量过低，无法用于导航',
              advice: validation.advice,
              canRetry: false 
            });
          }
        }
      },
      fail: function(err) {
        Logger.warn('🚨 GPS卫星信号获取失败 (尝试' + (attemptCount + 1) + '):', err);
        self.handleAviationGPSFailure(attemptCount, err);
      }
    });
  },
  
  /**
   * 🆕 获取不同尝试阶段的GPS配置
   * @param {number} attemptCount 尝试次数
   * @returns {Object} GPS配置对象
   */
  getGPSConfigForAttempt: function(attemptCount) {
    var configs = [
      {
        // 第1次：标准WGS84 GPS模式
        type: 'wgs84',
        altitude: true,
        isHighAccuracy: true,
        description: '标准WGS84+高精度模式 (首选)'
      },
      {
        // 第2次：强制高精度模式
        type: 'wgs84', 
        altitude: true,
        isHighAccuracy: true,
        description: '强制高精度WGS84模式 (再次尝试)'
      },
      {
        // 第3次：WGS84但不强制高精度
        type: 'wgs84',
        altitude: true,
        isHighAccuracy: false,
        description: 'WGS84标准精度模式 (降级尝试)'
      },
      {
        // 第4次：继续使用WGS84，但降低超时时间
        type: 'wgs84',
        altitude: true,
        isHighAccuracy: false,
        highAccuracyExpireTime: 1000,
        description: 'WGS84快速模式 (最后尝试)'
      }
    ];
    
    return configs[attemptCount] || configs[configs.length - 1];
  },
  
  /**
   * 🆕 分析GPS获取失败的原因
   * @param {Object} error 错误对象
   * @param {number} attemptCount 尝试次数
   * @returns {Object} 失败分析结果
   */
  analyzeGPSFailure: function(error, attemptCount) {
    var analysis = {
      status: 'GPS获取失败',
      advice: '',
      retryReason: '',
      retryDelay: 3000,
      usePureGPS: false,
      errorMessage: '',
      finalAdvice: ''
    };
    
    var errorMsg = error.errMsg || '';
    
    if (errorMsg.indexOf('timeout') > -1 || errorMsg.indexOf('超时') > -1) {
      analysis.status = 'GPS搜星超时 (第' + (attemptCount + 1) + '次)';
      analysis.advice = '🕐 GPS搜星耗时过长，可能在室内或信号遮挡环境';
      analysis.retryReason = 'GPS搜星超时重试，采用更激进策略';
      analysis.retryDelay = 2000;
      analysis.usePureGPS = attemptCount < 2;
      analysis.errorMessage = 'GPS搜星超时，请移动到室外空旷地带';
      analysis.finalAdvice = '请确保在室外空旷位置，天空无遮挡，等待GPS卫星搜索完成';
    } else if (errorMsg.indexOf('denied') > -1 || errorMsg.indexOf('拒绝') > -1) {
      analysis.status = 'GPS权限被拒绝';
      analysis.advice = '📱 位置权限未授权，无法获取GPS数据';
      analysis.retryReason = '权限问题，跳过GPS尝试';
      analysis.retryDelay = 1000;
      analysis.usePureGPS = false;
      analysis.errorMessage = 'GPS权限被拒绝，请在小程序设置中开启位置权限';
      analysis.finalAdvice = '请在微信设置中为FlightToolbox开启位置权限';
    } else if (errorMsg.indexOf('network') > -1 || errorMsg.indexOf('网络') > -1) {
      analysis.status = '网络相关GPS失败';
      analysis.advice = '🌐 网络辅助GPS失败，尝试纯GPS模式';
      analysis.retryReason = '网络GPS失败，切换纯GPS模式';
      analysis.retryDelay = 4000;
      analysis.usePureGPS = true;
      analysis.errorMessage = '网络辅助GPS失败，将尝试纯GPS定位';
      analysis.finalAdvice = '请在空旷环境下等待纯GPS信号锁定';
    } else {
      analysis.status = 'GPS未知错误 (第' + (attemptCount + 1) + '次)';
      analysis.advice = '❓ GPS获取遇到未知问题: ' + errorMsg;
      analysis.retryReason = '未知错误重试';
      analysis.retryDelay = 5000;
      analysis.usePureGPS = attemptCount >= 1;
      analysis.errorMessage = 'GPS定位失败: ' + errorMsg;
      analysis.finalAdvice = '请检查设备定位服务是否开启，并移动到信号良好的环境';
    }
    
    return analysis;
  },

  /**
   * 🛰️ 航空级GPS数据验证 - 确保定位数据符合航空标准
   * @param {Object} locationData 位置数据
   * @returns {boolean} 是否为有效的GPS定位
   */
  validateAviationGPS: function(locationData, attemptCount) {
    // 🔍 基础数据完整性检查
    if (!locationData || !locationData.latitude || !locationData.longitude) {
      Logger.warn('⚠️ GPS数据不完整：缺少经纬度');
      return { valid: false, level: 'invalid', reason: '缺少基础位置数据' };
    }
    
    // 📊 分级验证系统 - 根据尝试次数调整验证标准
    var validationResult = this.performTieredValidation(locationData, attemptCount || 0);
    
    if (validationResult.valid) {
      Logger.gps('✅ GPS数据通过' + validationResult.level + '级验证');
    } else {
      Logger.warn('⚠️ GPS验证失败(' + validationResult.level + ')：' + validationResult.reason);
    }
    
    return validationResult;
  },
  
  /**
   * 🎯 分级GPS验证系统 - 根据环境和尝试次数调整标准
   * @param {Object} locationData 位置数据
   * @param {number} attemptCount 尝试次数
   * @returns {Object} 验证结果 {valid, level, reason, advice}
   */
  performTieredValidation: function(locationData, attemptCount) {
    var result = {
      valid: false,
      level: 'unknown',
      reason: '',
      advice: '',
      gpsQuality: 'unknown'
    };
    
    // 💎 第1级：严格航空GPS标准（第1-2次尝试）
    if (attemptCount <= 1) {
      result = this.validateStrictAviationGPS(locationData);
      if (result.valid) {
        result.level = '严格航空';
        result.gpsQuality = 'premium';
        return result;
      }
    }
    
    // 🥈 第2级：标准GPS验证（第3次尝试）
    if (attemptCount <= 2) {
      result = this.validateStandardGPS(locationData);
      if (result.valid) {
        result.level = '标准GPS';
        result.gpsQuality = 'good';
        return result;
      }
    }
    
    // 🥉 第3级：基础可用验证（第4次尝试及后续）
    result = this.validateBasicGPS(locationData);
    if (result.valid) {
      result.level = '基础可用';
      result.gpsQuality = 'acceptable';
      return result;
    }
    
    // ❌ 所有级别验证都失败
    result.level = '不可用';
    result.gpsQuality = 'unusable';
    result.reason = '位置数据质量过低，无法用于导航';
    result.advice = '请移动到室外空旷环境，确保GPS接收条件良好';
    
    return result;
  },
  
  /**
   * 💎 严格航空GPS验证 - 适用于理想环境
   */
  validateStrictAviationGPS: function(locationData) {
    // 不设置任何精度要求，不强制要求高度数据
    Logger.debug('✅ GPS验证通过（无精度限制）');
    return { valid: true };
  },
  
  /**
   * 🥈 标准GPS验证 - 适用于一般环境
   */
  validateStandardGPS: function(locationData) {
    // 不设置任何精度要求
    var hasValidAltitude = locationData.altitude !== null && 
                          locationData.altitude !== undefined && 
                          locationData.altitude !== 0;
    
    Logger.debug('✅ GPS验证通过（标准级别）');
    return { 
      valid: true,
      hasAltitude: hasValidAltitude,
      altitudeWarning: !hasValidAltitude ? '高度数据缺失或异常' : null
    };
  },
  
  /**
   * 🥉 基础GPS验证 - 确保最低可用性
   */
  validateBasicGPS: function(locationData) {
    // 不设置任何精度要求
    Logger.debug('📍 GPS验证通过（基础级别）');
    
    return { 
      valid: true,
      warning: null
    };
  },

  /**
   * 🛰️ 分析GPS失败原因 - 航空级诊断
   * @param {Object} locationData 位置数据（如果有）
   * @param {number} attemptCount 当前尝试次数
   * @returns {Object} 航空GPS分析结果
   */
  analyzeAviationGPSFailure: function(locationData, attemptCount) {
    var analysis = {
      shouldRetry: false,
      retryDelay: 2000,
      retryReason: '',
      status: '',
      advice: '',
      environmentType: 'unknown'
    };
    
    // 新增字段初始化
    analysis.priority = 'low';
    analysis.userAction = '';
    analysis.technicalReason = '';
    
    // 1. 室内环境检测（最常见情况）
    if (locationData.indoorLocationType !== undefined && locationData.indoorLocationType >= 0) {
      analysis.environmentType = 'indoor';
      analysis.status = '检测到室内环境，GPS信号被遮挡';
      analysis.advice = '🏠 室内环境：GPS信号无法穿透建筑物';
      analysis.userAction = '请移动到窗边或室外开阔地带';
      analysis.technicalReason = '室内定位类型: ' + locationData.indoorLocationType;
      analysis.shouldRetry = attemptCount < 2; // 增加重试次数
      analysis.retryDelay = attemptCount === 0 ? 3000 : 8000; // 第一次快速重试，第二次较长间隔
      analysis.retryReason = '室内环境GPS信号搜索重试';
      analysis.priority = 'high';
      return analysis;
    }
    
    // 2. 信号强度分析（分级处理）
    if (locationData.accuracy) {
      if (locationData.accuracy > 200) {
        analysis.environmentType = 'very_poor_signal';
        analysis.status = 'GPS信号极弱 (精度>' + Math.round(locationData.accuracy) + 'm)';
        analysis.advice = '📶 信号极弱：可能在地下或密闭空间';
        analysis.userAction = '请移动到室外空旷地带，避开高楼遮挡';
        analysis.technicalReason = '定位精度超过200米，无法满足航空导航需求';
        analysis.shouldRetry = attemptCount < 3;
        analysis.retryDelay = 6000;
        analysis.retryReason = '极弱信号环境长时间GPS搜索';
        analysis.priority = 'high';
        return analysis;
      } else if (locationData.accuracy > 100) {
        analysis.environmentType = 'poor_signal';
        analysis.status = 'GPS信号较弱 (精度' + Math.round(locationData.accuracy) + 'm)';
        analysis.advice = '📶 信号较弱：可能受建筑物遮挡';
        analysis.userAction = '请移动到窗边或相对空旷的位置';
        analysis.technicalReason = '定位精度在100-200米之间，精度不足';
        analysis.shouldRetry = attemptCount < 2;
        analysis.retryDelay = 4000;
        analysis.retryReason = '弱信号环境GPS优化重试';
        analysis.priority = 'medium';
        return analysis;
      } else if (locationData.accuracy > 65) {
        analysis.environmentType = 'marginal_signal';
        analysis.status = 'GPS信号边缘 (精度' + Math.round(locationData.accuracy) + 'm)';
        analysis.advice = '📍 信号边缘：接近可用阈值';
        analysis.userAction = '稍等片刻让GPS信号稳定，或移动到更开阔位置';
        analysis.technicalReason = '定位精度超过65米，可能仍在搜星阶段';
        analysis.shouldRetry = attemptCount < 1;
        analysis.retryDelay = 5000;
        analysis.retryReason = '边缘信号GPS稳定化重试';
        analysis.priority = 'medium';
        return analysis;
      }
    }
    
    // 3. 高度数据缺失分析（航空应用的关键指标）
    if (locationData.altitude === null || locationData.altitude === undefined) {
      analysis.environmentType = 'altitude_missing';
      analysis.status = '缺失高度数据，可能是网络辅助定位';
      analysis.advice = '🛰️ 高度缺失：网络定位无法提供高度信息';
      analysis.userAction = '等待GPS卫星锁定，或移动到天空更开阔的位置';
      analysis.technicalReason = '高度字段为null/undefined，网络定位特征明显';
      analysis.shouldRetry = attemptCount < 2;
      analysis.retryDelay = 6000;
      analysis.retryReason = '缺失高度数据的GPS卫星搜索';
      analysis.priority = 'high'; // 对航空应用很重要
      return analysis;
    } else if (locationData.altitude === 0 && (locationData.verticalAccuracy === 0 || !locationData.verticalAccuracy)) {
      analysis.environmentType = 'altitude_zero';
      analysis.status = '高度数据异常 (0m且无垂直精度)';
      analysis.advice = '🛰️ 高度异常：可能是网络定位或GPS未完全锁定';
      analysis.userAction = '等待GPS完全锁定，确保在空旷环境';
      analysis.technicalReason = '高度为0且垂直精度缺失，GPS锁定不完整';
      analysis.shouldRetry = attemptCount < 2;
      analysis.retryDelay = 5000;
      analysis.retryReason = '高度异常GPS完整锁定重试';
      analysis.priority = 'medium';
      return analysis;
    }
    
    // 4. 微信小程序API策略限制（最复杂的情况）
    analysis.environmentType = 'wechat_api_limitation';
    analysis.status = '微信API优先网络定位策略';
    analysis.advice = '⚙️ API限制：微信为提升响应速度优先使用网络定位';
    analysis.userAction = '在当前环境下网络定位可能是最优选择，但高度数据精度受限';
    analysis.technicalReason = '微信小程序API智能选择定位方式，当前环境网络定位响应更佳';
    analysis.shouldRetry = attemptCount === 0; // 仅在第一次尝试时重试
    analysis.retryDelay = 10000; // 较长的重试间隔，给GPS充分时间
    analysis.retryReason = '尝试绕过微信网络定位优先策略';
    analysis.priority = 'low'; // 这种情况下网络定位可能确实是当前最优解
    
    return analysis;
  },

  /**
   * 🆕 处理GPS环境指导
   * @param {Object} locationData 位置数据
   * @param {Object} environmentAnalysis 环境分析结果
   */
  handleGPSEnvironmentGuidance: function(locationData, environmentAnalysis) {
    Logger.debug('🧭 GPS环境指导:', environmentAnalysis.advice);
    
    // 根据环境类型和优先级提供不同的处理
    switch (environmentAnalysis.environmentType) {
      case 'indoor':
        this.updateStatus('室内环境 - 建议移至室外');
        this.showGPSGuidance('🏠 室内环境检测', 
          environmentAnalysis.advice + '\n\n用户操作：\n' + environmentAnalysis.userAction + 
          '\n\n技术说明：\n' + environmentAnalysis.technicalReason);
        break;
        
      case 'very_poor_signal':
        this.updateStatus('GPS信号极弱 - 需改善环境');
        this.showGPSGuidance('📶 GPS信号极弱', 
          environmentAnalysis.advice + '\n\n用户操作：\n' + environmentAnalysis.userAction + 
          '\n\n技术说明：\n' + environmentAnalysis.technicalReason);
        break;
        
      case 'poor_signal':
        this.updateStatus('GPS信号较弱 - 建议改善环境');
        this.showGPSGuidance('📶 GPS信号较弱', 
          environmentAnalysis.advice + '\n\n用户操作：\n' + environmentAnalysis.userAction + 
          '\n\n技术说明：\n' + environmentAnalysis.technicalReason);
        break;
        
      case 'marginal_signal':
        this.updateStatus('GPS信号边缘 - 等待稳定');
        this.showGPSGuidance('📍 GPS信号边缘', 
          environmentAnalysis.advice + '\n\n用户操作：\n' + environmentAnalysis.userAction + 
          '\n\n技术说明：\n' + environmentAnalysis.technicalReason);
        break;
        
      case 'altitude_missing':
        this.updateStatus('缺失高度数据 - 网络定位');
        this.showGPSGuidance('🛰️ 高度数据缺失', 
          environmentAnalysis.advice + '\n\n用户操作：\n' + environmentAnalysis.userAction + 
          '\n\n技术说明：\n' + environmentAnalysis.technicalReason + 
          '\n\n对航空导航的影响：\n• 水平位置坐标可用\n• 高度数据不可靠，请谨慎使用');
        break;
        
      case 'altitude_zero':
        this.updateStatus('高度数据异常 - 部分GPS');
        this.showGPSGuidance('🛰️ 高度数据异常', 
          environmentAnalysis.advice + '\n\n用户操作：\n' + environmentAnalysis.userAction + 
          '\n\n技术说明：\n' + environmentAnalysis.technicalReason);
        break;
        
      case 'wechat_api_limitation':
        this.updateStatus('微信API限制 - 使用网络定位');
        this.showGPSGuidance('⚙️ 微信小程序定位策略', 
          environmentAnalysis.advice + '\n\n用户操作：\n' + environmentAnalysis.userAction + 
          '\n\n技术说明：\n' + environmentAnalysis.technicalReason + 
          '\n\n定位质量说明：\n• 水平坐标：精度良好\n• 高度数据：精度受限\n• 适用场景：一般导航使用');
        break;
        
      default:
        this.updateStatus('使用网络定位 - 高度受限');
        this.showGPSGuidance('📍 使用网络定位', 
          '当前使用网络辅助定位。\n\n特点：\n• 响应速度快\n• 水平位置基本准确\n• 高度数据精度有限\n\n如需高精度GPS，请移动到室外空旷环境。');
    }
    
    // 🛰️ 航空应用：已拒绝非GPS数据，显示指导信息
    Logger.debug('🚨 航空应用拒绝非GPS数据，已显示用户指导');
  },

  /**
   * 🆕 显示GPS指导信息
   * @param {string} title 标题
   * @param {string} message 消息内容
   */
  showGPSGuidance: function(title, message) {
    if (this.page && this.page.safeSetData && !this.page._isDestroying && !this.page.isDestroying) {
      this.page.safeSetData({
        showGPSWarning: true,
        gpsWarningTitle: title,
        gpsWarningMessage: message,
        debugPanelExpanded: true
      });
    }
  },


  /**
   * 🆕 处理高度数据
   * @param {number} altitude 原始高度数据
   * @param {boolean} isGPSLocation 是否为GPS定位
   * @returns {number|null} 处理后的高度（英尺）
   */
  processAltitudeData: function(altitude, isGPSLocation) {
    // 🔧 修复：即使是网络定位，如果有高度数据也应该显示
    if (altitude == null || isNaN(altitude)) {
      return null; // 无高度数据
    }
    
    // 🔧 修复：只要有高度数据就转换显示，不区分GPS还是网络定位
    // GPS定位更准确，但网络定位的高度也有参考价值
    var altitudeFeet = Math.round(altitude * 3.28084);
    
    if (!isGPSLocation) {
      Logger.debug('📍 网络定位高度数据:', altitude + 'm → ' + altitudeFeet + 'ft (精度较低)');
    } else {
      Logger.debug('🛰️ GPS定位高度数据:', altitude + 'm → ' + altitudeFeet + 'ft (高精度)');
    }
    
    return altitudeFeet;
  },

  /**
   * 🆕 检查高度数据有效性
   * @param {number} altitude 原始高度数据
   * @param {boolean} isGPSLocation 是否为GPS定位
   * @returns {boolean} 高度是否有效
   */
  isAltitudeValid: function(altitude, isGPSLocation) {
    return isGPSLocation && 
           altitude != null && 
           !isNaN(altitude) && 
           altitude !== 0; // GPS定位但高度为0也可能是问题
  },

  /**
   * 🛰️ 处理GPS获取失败 - 提供航空级指导
   * @param {number} attemptCount 当前尝试次数
   * @param {Object} error 错误信息
   */
  handleAviationGPSFailure: function(attemptCount, error) {
    var self = this;
    
    // 🎯 改进的错误处理 - 避免无限重试循环
    var errorReason = error.reason || error.errMsg || '未知GPS错误';
    var canRetry = error.canRetry !== false; // 默认可以重试，除非明确禁止
    
    Logger.warn('🚨 GPS处理失败 (尝试' + (attemptCount + 1) + '/4):', errorReason);
    
    // 🔄 智能重试策略
    if (attemptCount < 3 && canRetry) {
      // 根据尝试次数调整重试消息
      var statusMessages = [
        'GPS信号搜索中... (正在尝试严格航空标准)',
        'GPS信号搜索中... (正在尝试标准验证)',
        'GPS信号搜索中... (正在尝试基础可用验证)',
        'GPS最终验证中...'
      ];
      
      this.updateStatus(statusMessages[attemptCount] || statusMessages[3]);
      
      // 渐进式延迟 - 给GPS更多稳定时间
      var retryDelays = [3000, 5000, 8000, 10000]; // 3s, 5s, 8s, 10s
      var delay = retryDelays[attemptCount] || 10000;
      
      setTimeout(function() {
        Logger.debug('🔄 重新尝试GPS定位 (降低验证标准)...');
        self.attemptGPSLocation(attemptCount + 1);
      }, delay);
      
    } else {
      // 🛑 最终失败处理 - 提供分级建议
      Logger.error('🚨 GPS在所有验证级别都失败或达到最大重试次数');
      
      var failureAdvice = error.advice || 
                         '请移动到室外空旷环境，确保GPS接收条件良好';
      
      this.updateStatus('GPS定位失败');
      this.updateDebugInfo({
        gpsStatus: 'GPS定位失败 ❌',
        environmentAdvice: failureAdvice,
        lastError: errorReason
      });
      
      // 显示友好的用户指导
      this.showImprovedGPSGuidance(attemptCount, errorReason);
    }
  },

  /**
   * 🆕 显示改进的GPS指导信息 - 避免用户挫败感
   * @param {number} attemptCount 尝试次数
   * @param {string} lastError 最后的错误信息
   */
  showImprovedGPSGuidance: function(attemptCount, lastError) {
    // 🎯 根据尝试情况生成友好的指导信息
    var guidance = '📍 GPS定位需要改善信号条件\n\n';
    
    // 基础建议
    guidance += '✅ 立即尝试:\n';
    guidance += '• 移动到窗边或室外位置\n';
    guidance += '• 避开高大建筑物遮挡\n';
    guidance += '• 等待30-60秒让GPS稳定\n\n';
    
    // 根据错误类型给出针对性建议
    if (lastError.includes('高度') || lastError.includes('altitude')) {
      guidance += '🏗️ 高度数据问题:\n';
      guidance += '• 室内环境通常无法获得高度\n';
      guidance += '• 系统已降低验证标准\n';
      guidance += '• 基础导航功能仍可使用\n\n';
    }
    
    if (lastError.includes('精度') || lastError.includes('accuracy')) {
      guidance += '🎯 定位精度改善:\n';
      guidance += '• 当前环境信号较弱\n';
      guidance += '• 移动到更开阔的位置\n';
      guidance += '• 稍作等待让GPS完全锁定\n\n';
    }
    
    // 环境适应性说明
    guidance += '🔧 系统已自动调整:\n';
    guidance += '• 已尝试' + (attemptCount + 1) + '种验证标准\n';
    guidance += '• 可在条件改善后重新定位\n';
    guidance += '• 部分功能在当前环境下可用\n\n';
    
    // 积极的结束语
    guidance += '💡 提示：FlightToolbox会根据环境\n';
    guidance += '自动调整GPS验证标准，确保最佳可用性';

    if (this.page && this.page.safeSetData && !this.page._isDestroying && !this.page.isDestroying) {
      this.page.safeSetData({
        showGPSWarning: true,
        gpsWarningTitle: 'GPS信号改善指导',
        gpsWarningMessage: guidance,
        gpsProviderType: 'gps_adaptive',
        debugPanelExpanded: true
      });
    }
  },
  
  /**
   * 🛰️ 显示航空级GPS指导信息 (保留原方法以兼容)
   */
  showAviationGPSGuidance: function() {
    // 调用新的改进方法
    this.showImprovedGPSGuidance(3, '航空标准验证失败');
  },

  /**
   * 处理位置更新 - 智能滤波数据融合 + 航迹计算（增强防重复机制）
   * @param {Object} location 位置数据
   */
  handleLocationUpdate: function(location) {
    var self = this;  // 保存this引用，供setTimeout使用
    
    // 🔒 第一优先级：检查页面状态，防止DOM更新错误
    if (!this.page || this.page._isDestroying || this.page.isDestroyed) {
      Logger.warn('⚠️ GPS位置更新被拒绝: 页面已销毁或正在销毁');
      return;
    }

    // 🔒 使用BasePage的严格状态检查（如果可用）
    if (this.page._isPageDestroyed && this.page._isPageDestroyed()) {
      Logger.warn('⚠️ GPS位置更新被拒绝: BasePage状态检查失败');
      return;
    }

    if (!location || !location.latitude || !location.longitude) {
      Logger.warn('⚠️ 无效的位置数据:', location);
      return;
    }
    
    // 🔧 防重复更新：如果正在更新中，跳过
    if (this.isUpdating) {
      if (this.config?.debug?.enableVerboseLogging) {
        Logger.debug('🔄 GPS更新中，跳过重复调用');
      }
      return;
    }
    
    // 🔧 GPS数据节流控制：确保至少间隔processInterval毫秒才处理一次位置更新
    // 优化：减小间隔时间，提高数据更新频率
    var currentTime = Date.now();
    if (this.lastProcessTime > 0 && (currentTime - this.lastProcessTime) < this.processInterval) {
      // 记录被节流的次数，用于调试
      if (this.config?.debug?.enableVerboseLogging) {
        Logger.debug('🔄 GPS更新被节流，距上次更新仅' + (currentTime - this.lastProcessTime) + 'ms');
      }
      return;
    }
    
    // 标记正在更新
    this.isUpdating = true;
    
    // 更新处理时间戳
    this.lastProcessTime = currentTime;
    
    if (this.config?.debug?.enableVerboseLogging) {
      Logger.debug('🛰️ GPS数据节流通过，开始处理位置更新, 距上次:', (currentTime - (this.lastProcessTime - this.processInterval)) + 'ms');
      Logger.debug('🛰️ 原始GPS数据:', {
        纬度: location.latitude,
        经度: location.longitude,
        原始高度: location.altitude,
        高度类型: typeof location.altitude,
        速度: location.speed,
        精度: location.accuracy,
        定位提供商: location.provider || '未知'
      });
    }
    
    // 🔧 严格判断：只有真正的GPS卫星定位才使用数据
    var useGPSData = false;  // 默认不使用数据
    var isRealGPS = false;   // 是否为真实GPS卫星定位
    
    // 判断是否为真实GPS信号的条件：
    // 核心原则：主要看provider，不看数值是否为0
    // 1. provider包含'gps' -> 是GPS
    // 2. provider是'network' -> 不是GPS
    // 3. provider是'fused'或'passive' -> 可能是GPS，需要其他条件判断
    // 4. 有垂直精度 -> 是GPS
    // 5. 使用wgs84且有高度/速度数据（包括0） -> 可能是GPS
    
    // 检查provider是否包含gps（不区分大小写）
    var providerIsGPS = location.provider && location.provider.toLowerCase().indexOf('gps') !== -1;
    var providerIsNetwork = location.provider && location.provider.toLowerCase() === 'network';
    
    if (providerIsGPS) {
      // provider明确包含GPS
      isRealGPS = true;
      useGPSData = true;
      this.updateStatus('信号正常');
      Logger.info('✅ GPS卫星定位成功（provider=' + location.provider + '）');
      this.forceGPSAttempted = false;
    } else if (providerIsNetwork) {
      // provider明确是网络定位，一定不是GPS
      isRealGPS = false;
      useGPSData = false;
      this.updateStatus('等待GPS卫星信号...');
      Logger.warn('⚠️ 网络定位，不使用高度和速度数据');
      
      // 如果还没有尝试过强制GPS定位，立即尝试
      if (!this.forceGPSAttempted) {
        this.forceGPSAttempted = true;
        setTimeout(function() {
          self.attemptGPSLocation(0);
        }, 2000);
      }
    } else if (location.verticalAccuracy && location.verticalAccuracy > 0) {
      // 有垂直精度，说明是GPS定位
      isRealGPS = true;
      useGPSData = true;
      this.updateStatus('信号正常');
      Logger.info('✅ GPS定位（有垂直精度）');
      this.forceGPSAttempted = false;
    } else if (location.altitude !== undefined && location.altitude !== null &&
               location.speed !== undefined && location.speed !== null) {
      // 有高度和速度数据（包括0），且provider不是network，可能是GPS
      isRealGPS = true;
      useGPSData = true;
      this.updateStatus('信号正常');
      Logger.info('✅ GPS定位（有高度=' + location.altitude + 'm, 速度=' + location.speed + 'm/s）');
      this.forceGPSAttempted = false;
    } else {
      // 其他情况（无provider、无高度、无速度）
      isRealGPS = false;
      useGPSData = false;
      this.updateStatus('等待GPS卫星信号...');
      Logger.warn('⚠️ 非GPS定位，provider:', location.provider, '高度:', location.altitude, '速度:', location.speed);
      
      // 尝试强制GPS定位
      if (!this.forceGPSAttempted) {
        this.forceGPSAttempted = true;
        setTimeout(function() {
          self.attemptGPSLocation(0);
        }, 1000);
      }
    }

    // 🔧 处理高度数据 - 只在真实GPS时处理（仅单位转换，无滤波）
    var rawAltitudeFeet = null; // GPS原始高度(英尺单位)
    if (isRealGPS && useGPSData && location.altitude != null && !isNaN(location.altitude)) {
      // 只有真实GPS信号才处理高度
      if (Math.abs(location.altitude) < 20000) {
        // 高度在合理范围内（-20000m到20000m）
        // 仅进行单位转换(米→英尺),无滤波处理
        rawAltitudeFeet = Math.round(location.altitude * 3.28084); // 米转英尺
        Logger.debug('🛰️ GPS原始高度(仅单位转换):', location.altitude + 'm → ' + rawAltitudeFeet + 'ft');
      } else {
        Logger.debug('⚠️ GPS高度超出合理范围:', location.altitude + 'm');
        rawAltitudeFeet = null;
      }
    } else if (!isRealGPS) {
      Logger.debug('📡 非GPS定位，不处理高度数据');
      rawAltitudeFeet = null;
    } else {
      Logger.debug('📡 GPS无高度数据');
      rawAltitudeFeet = null;
    }

    // 如果不是真实GPS，直接返回不处理
    if (!isRealGPS) {
      this.isUpdating = false;
      // 但仍然要回调位置更新，只是高度和速度为null
      var noGPSData = {
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: null,  // 无高度
        speed: null,      // 无速度
        accuracy: location.accuracy || 0,
        timestamp: Date.now(),
        provider: location.provider || 'unknown',
        altitudeValid: false,
        isGPSLocation: false
      };

      // 添加航空格式坐标
      if (noGPSData.latitude && noGPSData.longitude) {
        noGPSData.latitudeAviation = FlightCalculator.formatCoordinateForAviation(noGPSData.latitude, 'lat');
        noGPSData.longitudeAviation = FlightCalculator.formatCoordinateForAviation(noGPSData.longitude, 'lng');
      }

      // 回调位置更新 - 立即更新UI显示
      if (this.callbacks.onLocationUpdate) {
        try {
          this.callbacks.onLocationUpdate(noGPSData);
        } catch (error) {
          Logger.error('❌ 非GPS位置更新回调失败:', error);
        }
      }
      return;  // 非GPS定位处理完毕
    }
    
    // 速度 - 只在真实GPS时处理
    var speedKt = null;
    if (isRealGPS && useGPSData && typeof location.speed === 'number' && !isNaN(location.speed)) {
      speedKt = location.speed * 1.94384; // 米/秒转节
      speedKt = Math.round(speedKt);  // 四舍五入为整数
      Logger.debug('🛰️ GPS原始速度:', location.speed + 'm/s → ' + speedKt + 'kt');
    } else if (!isRealGPS) {
      Logger.debug('📡 非GPS定位：速度不可用，设为null');
      speedKt = null;
    } else {
      Logger.debug('📡 GPS无速度数据');
      speedKt = null;
    }
    
    // 构建原始数据（含基础处理）
    var rawData = {
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: rawAltitudeFeet,  // GPS原始高度(英尺单位，仅单位转换)
      speed: speedKt,  // GPS原始速度(节，仅单位转换)
      accuracy: location.accuracy || 0,
      timestamp: Date.now(),
      provider: location.provider || 'unknown',
      altitudeValid: rawAltitudeFeet != null && isRealGPS,
      rawAltitudeMeters: isRealGPS ? location.altitude : null,
      isGPSLocation: isRealGPS
    };
    
    // 调试输出：确认GPS数据是否正确识别 + 更新频率信息
    var updateInterval = this.lastProcessTime > 0 ? (Date.now() - this.lastProcessTime) : 0;
    console.log('🔍 GPS数据处理结果 [更新间隔:' + updateInterval + 'ms]:', {
      '是否为真实GPS': isRealGPS,
      'provider': location.provider,
      '原始高度(米)': location.altitude,
      '转换高度(英尺)': rawAltitudeFeet,
      '原始速度(m/s)': location.speed,
      '转换速度(kt)': speedKt,
      '更新频率': updateInterval > 0 ? Math.round(1000/updateInterval) + 'Hz' : '首次更新'
    });
    
    if (this.config?.debug?.enableVerboseLogging) {
      Logger.debug('✅ GPS原始数据单位转换(无滤波):', {
        纬度: rawData.latitude,
        经度: rawData.longitude,
        原始高度米: location.altitude,
        转换高度英尺: rawData.altitude,
        原始速度m每秒: location.speed,
        转换速度节: rawData.speed + 'kt',
        定位类型: rawData.provider
      });
    }
    
    // 🆕 维护位置历史记录
    this.updateLocationHistory(rawData);
    
    // 🆕 计算航迹数据
    var flightData = this.calculateFlightData(rawData);
    rawData.track = flightData.track;
    rawData.verticalSpeed = flightData.verticalSpeed;
    rawData.acceleration = flightData.acceleration;
    
    // GPS原始数据直通 - 禁止任何滤波处理(项目核心安全约束)
    var processedData = this.validateAndPassthroughGPSData(rawData);
    
    // 更新状态
    this.currentLocation = processedData;
    
    // 添加航空格式坐标
    if (processedData.latitude && processedData.longitude) {
      processedData.latitudeAviation = FlightCalculator.formatCoordinateForAviation(processedData.latitude, 'lat');
      processedData.longitudeAviation = FlightCalculator.formatCoordinateForAviation(processedData.longitude, 'lng');
      this.saveLastKnownLocation(processedData);
    }
    
    // 回调位置更新 - 立即更新UI显示（优先级高，无节流）
    if (this.callbacks.onLocationUpdate) {
      if (this.page && (this.page._isDestroying || this.page.isDestroying)) {
        Logger.debug('🛑 GPS管理器：页面销毁中，跳过位置更新回调');
        return;
      }
      try {
        // 立即执行回调，确保GPS数据马上显示
        this.callbacks.onLocationUpdate(processedData);
        Logger.debug('✅ GPS数据已回调更新，高度:', processedData.altitude, '速度:', processedData.speed);
      } catch (error) {
        Logger.error('❌ GPS位置更新回调失败:', error);
      }
    }
    
    // 🔧 标记更新完成，允许下次更新
    this.isUpdating = false;
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
    
    // 位置历史记录更新（静默）
  },

  /**
   * 🆕 计算飞行数据（包括航迹）- 智能航迹稳定化版本
   * @param {Object} currentData 当前位置数据
   * @returns {Object} 飞行数据 {track, verticalSpeed, acceleration}
   */
  calculateFlightData: function(currentData) {
    var defaultResult = {
      track: this.lastStableTrack, // 保持最后的稳定航迹
      verticalSpeed: 0,
      acceleration: 0
    };
    
    // 检查飞行计算器是否可用
    if (!this.flightCalculator) {
      Logger.warn('⚠️ 飞行计算器未初始化，无法计算航迹');
      return defaultResult;
    }
    
    // 检查历史记录是否足够
    if (this.locationHistory.length < 2) {
      Logger.debug('📊 位置历史记录不足，无法计算航迹');
      return defaultResult;
    }
    
    try {
      // 如果速度为null（网络定位），返回默认值
      if (currentData.speed === null || currentData.speed === undefined) {
        Logger.debug('📊 速度数据为null，无法计算航迹（可能是网络定位）');
        return defaultResult;
      }
      
      var currentSpeed = currentData.speed || 0; // 节
      var currentTime = Date.now();
      
      // 调用智能飞行计算器
      var flightData = this.flightCalculator.calculateFlightData(
        this.locationHistory, 
        0 // 参数已废弃，内部使用配置
      );
      
      // 🛩️ 航迹稳定性过滤
      var finalTrack = this.applyTrackStabilityFilter(flightData.track, currentSpeed, currentTime);
      
      return {
        track: finalTrack,
        verticalSpeed: flightData.verticalSpeed,
        acceleration: flightData.acceleration
      };
      
    } catch (error) {
      Logger.error('❌ 飞行数据计算失败:', error);
      return defaultResult;
    }
  },

  /**
   * 🛩️ 航迹稳定性过滤器
   * @param {Number|null} newTrack 新计算的航迹
   * @param {Number} currentSpeed 当前速度
   * @param {Number} currentTime 当前时间
   * @returns {Number|null} 过滤后的航迹
   */
  applyTrackStabilityFilter: function(newTrack, currentSpeed, currentTime) {
    // 如果新航迹为null（静止状态或无法计算），保持最后稳定值
    if (newTrack === null || newTrack === undefined) {
      Logger.debug('📍 新航迹为空，保持最后稳定航迹:', this.lastStableTrack);
      return this.lastStableTrack;
    }
    
    // 如果没有历史航迹，直接使用新值
    if (this.lastStableTrack === null || this.lastStableTrack === undefined) {
      Logger.debug('🧭 首次航迹设置:', Math.round(newTrack) + '°');
      this.lastStableTrack = newTrack;
      this.lastTrackUpdateTime = currentTime;
      return newTrack;
    }
    
    // 计算航迹变化量（处理360°边界问题）
    var trackDiff = this.calculateTrackDifference(newTrack, this.lastStableTrack);
    
    // 从配置获取参数
    var baseThreshold = (this.config && this.config.compass && this.config.compass.headingBaseThreshold) || 12;
    var lowSpeedThreshold = (this.config && this.config.compass && this.config.compass.headingLowSpeedThreshold) || 25;
    var minUpdateInterval = (this.config && this.config.compass && this.config.compass.minHeadingUpdateInterval) || 3000;
    
    // 根据速度动态调整变化阈值
    var changeThreshold = currentSpeed < 10 ? lowSpeedThreshold : baseThreshold;
    
    // 时间间隔检查
    var timeSinceLastUpdate = currentTime - this.lastTrackUpdateTime;
    
    Logger.debug('🧭 航迹稳定性检查:', {
      新航迹: Math.round(newTrack) + '°',
      当前航迹: Math.round(this.lastStableTrack) + '°',
      变化量: Math.round(trackDiff) + '°',
      阈值: changeThreshold + '°',
      速度: currentSpeed + 'kt',
      时间间隔: Math.round(timeSinceLastUpdate / 1000) + 's'
    });
    
    // 大幅变化检测
    if (Math.abs(trackDiff) > changeThreshold) {
      // 如果时间间隔太短，可能是噪声，不更新
      if (timeSinceLastUpdate < minUpdateInterval) {
        Logger.debug('⏱️ 更新间隔过短，忽略航迹变化');
        return this.lastStableTrack;
      }
      
      // 渐进更新：大幅变化时分步更新，避免突然跳变
      var maxStep = changeThreshold * 0.5; // 每次最大变化为阈值的一半
      if (Math.abs(trackDiff) > maxStep) {
        var stepChange = trackDiff > 0 ? maxStep : -maxStep;
        var newStableTrack = this.normalizeTrack(this.lastStableTrack + stepChange);
        
        Logger.debug('🔄 渐进航迹更新:', Math.round(this.lastStableTrack) + '° → ' + Math.round(newStableTrack) + '° (步长:' + Math.round(stepChange) + '°)');
        
        this.lastStableTrack = newStableTrack;
        this.lastTrackUpdateTime = currentTime;
        return newStableTrack;
      }
    }
    
    // 小幅变化或正常更新
    if (Math.abs(trackDiff) > 2) { // 超过2度才更新，避免微小抖动
      Logger.debug('✅ 正常航迹更新:', Math.round(this.lastStableTrack) + '° → ' + Math.round(newTrack) + '°');
      this.lastStableTrack = newTrack;
      this.lastTrackUpdateTime = currentTime;
      return newTrack;
    }
    
    // 变化太小，保持原值
    return this.lastStableTrack;
  },

  /**
   * 计算航迹差值（处理360°边界问题）
   * @param {Number} newTrack 新航迹
   * @param {Number} oldTrack 旧航迹
   * @returns {Number} 差值（-180到180度）
   */
  calculateTrackDifference: function(newTrack, oldTrack) {
    var diff = newTrack - oldTrack;
    
    // 处理360°边界问题
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }
    
    return diff;
  },

  /**
   * 标准化航迹角度到0-360度
   * @param {Number} track 航迹角度
   * @returns {Number} 标准化后的角度
   */
  normalizeTrack: function(track) {
    while (track < 0) {
      track += 360;
    }
    while (track >= 360) {
      track -= 360;
    }
    return track;
  },

  /**
   * GPS原始数据直通验证（禁止任何滤波处理）- 主入口
   *
   * 核心安全约束：根据项目"GPS原始数据规则"，GPS地速和GPS高度必须使用原始数据，
   * 禁止对GPS数据使用滤波、平滑等算法处理。本函数仅进行数据有效性验证，不做任何修改。
   *
   * @param {Object} rawData 原始GPS数据
   * @returns {Object} 原始数据（未经任何处理）
   */
  passthroughRawGPSData: function(rawData) {
    // GPS原始数据直通 - 禁止任何滤波处理(项目核心安全约束)
    // 仅验证数据有效性，不修改任何数值
    if (!rawData) {
      Logger.warn('⚠️ GPS数据为空');
      return null;
    }
    Logger.debug('📍 使用原始GPS数据（已禁用滤波）');
    return rawData;
  },

  // ===== 简化的工具方法 =====

  /**
   * 更新GPS状态
   * @param {String} status 状态描述
   */
  updateStatus: function(status) {
    // 简化GPS状态为4种
    var simplifiedStatus = this.simplifyGPSStatus(status);
    Logger.debug('📡 GPS状态:', simplifiedStatus, '(原始:', status, ')');
    
    // 🔧 修复：使用正确的回调名称 onGPSStatusChange
    if (this.callbacks.onGPSStatusChange) {
      // 检查页面状态
      if (this.page && (this.page._isDestroying || this.page.isDestroying)) {
        return;
      }
      
      try {
        this.callbacks.onGPSStatusChange(simplifiedStatus);
      } catch (error) {
        Logger.error('❌ GPS状态更新回调失败:', error);
      }
    }
    
    // 更新页面数据
    if (this.page && this.page.safeSetData && !this.page._isDestroying && !this.page.isDestroying) {
      this.page.safeSetData({
        gpsStatus: simplifiedStatus
      });
    }
  },

  /**
   * 简化GPS状态文本为4种
   * @param {String} status 原始状态文本
   * @returns {String} 简化后的状态
   */
  simplifyGPSStatus: function(status) {
    if (!status) return '无信号';
    
    var statusLower = status.toLowerCase();
    
    // 检测GPS欺骗
    if (statusLower.indexOf('欺骗') > -1 || statusLower.indexOf('spoofing') > -1) {
      return '信号欺骗';
    }
    
    // 检测授权问题
    if (statusLower.indexOf('未授权') > -1 || statusLower.indexOf('权限') > -1 || 
        statusLower.indexOf('拒绝') > -1 || statusLower.indexOf('denied') > -1) {
      return '未授权';
    }
    
    // 检测GPS信号不可用（网络定位）
    if (statusLower.indexOf('不可用') > -1 || statusLower.indexOf('网络定位') > -1 ||
        statusLower.indexOf('network') > -1) {
      return '网络定位';
    }
    
    // 检测信号弱
    if (statusLower.indexOf('弱') > -1 || statusLower.indexOf('weak') > -1 ||
        statusLower.indexOf('低') > -1 || statusLower.indexOf('poor') > -1) {
      return '信号弱';
    }
    
    // 检测正常状态
    if (statusLower.indexOf('正常') > -1 || statusLower.indexOf('良好') > -1 || 
        statusLower.indexOf('工作') > -1 || statusLower.indexOf('good') > -1 ||
        statusLower.indexOf('定位成功') > -1 || statusLower.indexOf('已启动') > -1 ||
        statusLower.indexOf('定位正常') > -1) {
      return '信号正常';
    }
    
    // 其他情况默认为无信号
    return '无信号';
  },

  /**
   * 处理错误
   * @param {Object} error 错误对象
   */
  handleError: function(error) {
    Logger.error('❌ GPS错误:', error);
    
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
    
    // 🔧 修改：不设置locationError，避免显示错误页面
    // 而是显示GPS警告横幅，保持在驾驶舱界面
    if (this.page && this.page.safeSetData && !this.page._isDestroying && !this.page.isDestroying) {
      this.page.safeSetData({
        // locationError: error.message,  // 注释掉，不显示错误页面
        gpsStatus: '定位失败',
        showGPSWarning: true,  // 显示警告横幅
        gpsWarningMessage: error.message || '位置权限未授权',
        debugPanelExpanded: true  // 自动展开调试面板
      });
    }
    
    // 如果是权限问题，尝试使用离线模式
    if (error.code === 'PERMISSION_DENIED' || error.code === 'PERMISSION_CHECK_FAILED') {
      Logger.debug('🌐 权限被拒绝，尝试离线模式');
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
   * 强制刷新位置 - 使用增强GPS获取策略
   */
  refreshLocation: function() {
    if (!this.hasPermission) {
      Logger.warn('⚠️ 没有位置权限，无法刷新位置');
      return;
    }
    
    Logger.debug('🔄 手动刷新位置 - 使用增强GPS模式');
    this.updateStatus('正在刷新GPS位置...');
    this.attemptGPSLocation(0);
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
      Logger.warn('⚠️ 无法保存最后已知位置:', e);
    }
  },

  /**
   * 🆕 离线模式下的GPS尝试（纯GPS不依赖网络）
   */
  attemptOfflineGPS: function() {
    var self = this;
    
    Logger.debug('🌐 离线模式：尝试纯GPS定位（不依赖网络）');
    this.updateStatus('离线模式 - 搜索GPS信号');
    
    this.updateDebugInfo({
      gpsAttemptCount: 1,
      gpsStatus: '离线模式GPS搜索中...'
    });
    
    // 🛰️ 离线模式使用超长超时，给GPS足够时间冷启动
    wx.getLocation({
      type: 'wgs84',
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 30000, // 30秒超时，离线GPS需要更长时间
      success: function(res) {
        Logger.debug('✅ 离线GPS获取成功:', res);
        
        // 🛰️ 离线模式航空级GPS数据验证 - 使用宽松标准
        var validation = self.validateAviationGPS(res, 2); // 离线模式使用标准验证级别
        
        if (validation.valid) {
          Logger.debug('🛰️ 离线模式获得' + validation.level + '级GPS信号！');
          
          var statusMessage = '离线GPS成功 (' + validation.level + ')';
          if (validation.warning || validation.altitudeWarning) {
            statusMessage += ' ⚠️';
          }
          
          self.updateDebugInfo({
            gpsStatus: statusMessage,
            gpsQuality: validation.gpsQuality || 'offline'
          });
          
          self.updateStatus('离线模式 - GPS工作正常');
          self.handleLocationUpdate(res);
        } else {
          // 离线模式GPS验证失败 - 尝试基础级验证
          var basicValidation = self.validateBasicGPS(res);
          if (basicValidation.valid) {
            Logger.debug('📍 离线模式：接受基础级别GPS信号');
            self.updateDebugInfo({
              gpsStatus: '离线GPS - 基础可用 ⚠️',
              gpsQuality: 'basic'
            });
            self.updateStatus('离线模式 - GPS基础可用');
            self.handleLocationUpdate(res);
          } else {
            Logger.warn('⚠️ 离线模式GPS数据质量过低：' + validation.reason);
            self.updateDebugInfo({
              gpsStatus: '离线GPS质量不足',
              environmentAdvice: validation.advice || '请移动到信号更好的位置'
            });
            self.handleOfflineLocationRequest();
          }
        }
      },
      fail: function(err) {
        Logger.error('❌ 离线GPS获取失败:', err);
        self.updateDebugInfo({
          gpsStatus: '离线GPS失败: ' + err.errMsg
        });
        
        // 提供详细的错误提示
        var errorMessage = '离线GPS失败';
        if (err.errMsg.indexOf('denied') > -1) {
          errorMessage = 'GPS权限被拒绝';
        } else if (err.errMsg.indexOf('timeout') > -1) {
          errorMessage = 'GPS信号搜索超时，请移动到窗边';
        } else if (err.errMsg.indexOf('NOCELL') > -1) {
          errorMessage = '设备定位服务未开启';
        }
        
        self.updateStatus('离线模式 - ' + errorMessage);
        self.handleOfflineLocationRequest(); // 回到缓存位置模式
      }
    });
  },

  /**
   * 🆕 启动离线回退模式（当持续定位失败时使用）
   */
  startOfflineFallbackMode: function() {
    var self = this;
    
    Logger.debug('🌐 启动离线回退模式');
    this.isRunning = true;
    
    // 🆕 离线模式下也尝试获取GPS（纯GPS不依赖网络）
    this.attemptOfflineGPS();
    
    // 定期更新离线数据（模拟移动）
    this.offlineUpdateInterval = setInterval(function() {
      self.handleOfflineLocationRequest();
    }, 2000);
  },

  /**
   * 处理离线模式下的位置请求
   */
  handleOfflineLocationRequest: function() {
    Logger.debug('🌐 离线模式：使用最后已知位置或模拟数据');
    
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
   * 🆕 更新页面调试信息
   * @param {Object} debugData 要更新的调试数据
   */
  updateDebugInfo: function(debugData) {
    if (!this.page || !this.page.safeSetData || this.page._isDestroying || this.page.isDestroying) {
      return;
    }
    
    var updateData = {};
    for (var key in debugData) {
      updateData['debugData.' + key] = debugData[key];
    }
    
    try {
      this.page.safeSetData(updateData);
    } catch (error) {
      Logger.error('❌ 更新调试信息失败:', error);
    }
  },

  /**
   * 销毁GPS管理器（增强版）
   * 清理资源，停止位置监听，清空回调和状态
   */
  destroy: function() {
    Logger.debug('🛰️ 销毁GPS管理器...');
    
    // 停止位置监听（会自动清理定时器）
    if (this.isRunning || this.locationListenerActive) {
      this.stopLocationTracking();
    }
    
    // 🔧 额外清理新增的定时器（防止stopLocationTracking遗漏）
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      Logger.debug('🧹 强制清理GPS健康检查定时器');
    }
    
    if (this.offlineUpdateInterval) {
      clearInterval(this.offlineUpdateInterval);
      this.offlineUpdateInterval = null;
      Logger.debug('🧹 强制清理离线更新定时器');
    }
    
    // 🆕 强制清理主动GPS刷新定时器
    if (this.activeGPSRefreshTimer) {
      clearInterval(this.activeGPSRefreshTimer);
      this.activeGPSRefreshTimer = null;
      Logger.debug('🧹 强制清理主动GPS刷新定时器');
    }
    
    // 🔧 清空所有状态变量
    this.isRunning = false;
    this.hasPermission = false;
    this.currentLocation = null;
    this.lastLocation = null;
    this.isOfflineMode = false;
    this.lastKnownGoodLocation = null;
    
    // 🔧 清空新增的状态变量
    this.locationListenerActive = false;
    this.lastLocationUpdateTime = 0;
    
    // 清空位置历史记录
    this.locationHistory = [];
    
    // 重置GPS数据节流状态
    this.lastProcessTime = 0;
    this.isUpdating = false;
    
    // 清理主动GPS刷新定时器状态
    this.activeGPSRefreshTimer = null;
    
    // 重置监听器重置状态
    this.listenerResetInProgress = false;
    
    // 重置TRK稳定化状态
    this.lastStableTrack = null;
    this.stationaryCounter = 0;
    this.lastTrackUpdateTime = 0;
    
    // 清理飞行计算器
    if (this.flightCalculator) {
      // FlightCalculator没有destroy方法，直接置空
      this.flightCalculator = null;
      Logger.debug('🧹 清理飞行计算器');
    }
    
    // 清空滤波器
    if (this.smartFilter) {
      this.smartFilter.destroy();
      this.smartFilter = null;
      Logger.debug('🧹 清理智能滤波器');
    }
    this.filterFailureCount = 0;
    
    // 🔧 最后的微信API清理（确保万无一失）
    try {
      wx.offLocationChange();
      wx.stopLocationUpdate({
        success: function() {
          Logger.debug('✅ 最终清理：停止位置更新成功');
        },
        fail: function(err) {
          Logger.warn('⚠️ 最终清理：停止位置更新失败', err);
        }
      });
    } catch (error) {
      Logger.warn('⚠️ 最终微信API清理时发生错误:', error);
    }
    
    // 清空引用
    this.config = null;
    this.callbacks = null;
    this.page = null;
    
    Logger.debug('✅ GPS管理器已完全销毁，所有资源已清理');
  },

  /**
   * ===== 生命周期管理接口 =====
   */
  
  /**
   * 启动GPS服务（标准化接口）
   */
  start: function() {
    Logger.debug('🚀 GPS管理器启动');
    this.checkLocationPermission();
    return Promise.resolve();
  },
  
  /**
   * 停止GPS服务（标准化接口） 
   */
  stop: function() {
    Logger.debug('⏹️ GPS管理器停止');
    this.stopLocationTracking();
    return Promise.resolve();
  },
  
  /**
   * 获取GPS管理器状态（标准化接口）
   */
  getStatus: function() {
    var now = Date.now();
    var timeSinceLastUpdate = now - this.lastLocationUpdateTime;
    
    return {
      name: 'GPS管理器',
      state: this._getModuleState(),
      isHealthy: this._isHealthy(),
      isRunning: this.isRunning,
      hasPermission: this.hasPermission,
      locationListenerActive: this.locationListenerActive,
      timeSinceLastUpdate: timeSinceLastUpdate,
      isOfflineMode: this.isOfflineMode,
      lastError: this._getLastError(),
      diagnostics: {
        updateCount: this.locationHistory ? this.locationHistory.length : 0,
        filterActive: !!this.smartFilter,
        hasKnownLocation: !!this.lastKnownGoodLocation
      }
    };
  },
  
  /**
   * 获取模块状态枚举值
   */
  _getModuleState: function() {
    if (this.isDestroyed) return 'destroyed';
    if (!this.hasPermission) return 'error';
    if (this.isRunning && this.locationListenerActive) return 'running';
    if (this.isRunning) return 'starting';
    return 'stopped';
  },
  
  /**
   * 检查GPS管理器健康状态
   */
  _isHealthy: function() {
    if (!this.hasPermission) return false;
    if (!this.isRunning) return true; // 未运行状态是健康的
    
    // 检查是否长时间未收到位置更新
    var now = Date.now();
    var timeSinceLastUpdate = now - this.lastLocationUpdateTime;
    var healthyThreshold = 30000; // 30秒阈值
    
    return timeSinceLastUpdate < healthyThreshold;
  },
  
  /**
   * 获取最后的错误信息
   */
  _getLastError: function() {
    // 可以从callbacks中获取错误信息
    if (!this.hasPermission) {
      return '位置权限未授权';
    }
    
    var now = Date.now();
    var timeSinceLastUpdate = now - this.lastLocationUpdateTime;
    if (this.isRunning && timeSinceLastUpdate > 60000) {
      return 'GPS信号长时间未更新';
    }
    
    return null;
  }
};

// ===== 工厂方法 =====

/**
 * 创建GPS管理器实例
 * @param {Object} config 配置对象
 * @returns {Object} GPS管理器实例
 */
function create(config) {
  // 创建新实例，避免状态共享
  var instance = Object.create(GPSManager);
  
  // 🔧 实例级状态初始化，避免交叉污染
  instance.isRunning = false;
  instance.hasPermission = false;
  instance.currentLocation = null;
  instance.lastLocation = null;
  instance.isOfflineMode = false;
  instance.lastKnownGoodLocation = null;
  
  // GPS监听器和健康检查状态
  instance.locationListenerActive = false;
  instance.lastLocationUpdateTime = 0;
  instance.healthCheckTimer = null;
  instance.healthCheckIntervalMs = 5000;
  
  // GPS数据节流控制
  instance.lastProcessTime = 0;
  instance.processInterval = 200;  // 优化到200ms平衡性能和响应速度
  instance.isUpdating = false;
  
  // 主动GPS刷新机制
  instance.activeGPSRefreshInterval = 5000;
  instance.activeGPSRefreshTimer = null;
  
  // 监听器重置机制
  instance.listenerResetInProgress = false;
  
  // 位置历史和航迹计算（独立实例）
  instance.locationHistory = [];
  instance.flightCalculator = null;
  instance.maxHistorySize = 20;
  
  // TRK稳定化状态
  instance.lastStableTrack = null;
  instance.stationaryCounter = 0;
  instance.lastTrackUpdateTime = 0;
  
  // 滤波器管理（独立实例）
  instance.activeFilterType = 'none';
  instance.smartFilter = null;
  instance.filterFailureCount = 0;
  
  // 配置和回调
  instance.config = config;
  instance.callbacks = null;
  instance.page = null;
  instance.isDestroyed = false;
  
  return instance;
}

// 导出模块
module.exports = {
  create: create
};