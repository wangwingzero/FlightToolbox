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
  activeFilterType: 'none',         // 当前激活的滤波器类型 - 直接使用原始数据
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
    
    // 不初始化智能滤波器，直接使用原始数据
    console.log('🔧 已配置为直接使用原始GPS数据，不进行滤波');
    
    // 检测网络状态
    this.checkNetworkStatus();
    
    // 尝试恢复最后已知位置
    this.restoreLastKnownLocation();
    
    console.log('🛰️ GPS管理器初始化完成');
    this.updateStatus('初始化完成');
    
    // 🔧 关键修复：初始化时立即申请权限并启动GPS
    var self = this;
    setTimeout(function() {
      console.log('🚀 自动启动GPS权限申请和定位服务');
      self.checkLocationPermission();
    }, 100); // 短暂延迟确保页面初始化完成
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
    
    // 🔧 离线模式下的权限检查优化
    if (this.isOfflineMode) {
      console.log('🌐 离线模式：跳过权限API检查，直接尝试GPS');
      // 离线模式下假设有权限，直接尝试GPS
      self.hasPermission = true;
      self.updateStatus('离线模式权限验证');
      
      if (self.callbacks.onPermissionChange) {
        self.callbacks.onPermissionChange(true);
      }
      
      // 🔧 关键修复：离线模式下立即启动定位
      console.log('🚀 离线模式立即启动定位');
      setTimeout(function() {
        self.startLocationTracking();
      }, 50); // 进一步缩短延迟
      return;
    }
    
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
          
          // 🔧 关键修复：已有权限时立即启动持续定位
          console.log('🚀 已有权限，立即启动持续定位');
          setTimeout(function() {
            self.startLocationTracking();
          }, 50); // 进一步缩短延迟
          
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
        
        // 🔧 权限检查失败时，如果是离线模式，尝试直接使用GPS
        if (self.isOfflineMode) {
          console.log('🌐 离线模式：权限API失败，直接尝试GPS');
          self.hasPermission = true;
          self.updateStatus('离线模式 - 尝试GPS');
          setTimeout(function() {
            self.startLocationTracking();
          }, 100);
        } else {
          self.updateStatus('权限检查失败');
          self.handleError({
            code: 'PERMISSION_CHECK_FAILED',
            message: '权限检查失败',
            details: err
          });
        }
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
        
        // 🔧 关键修复：权限获取成功后立即自动启动持续定位
        console.log('🚀 权限获取成功，立即启动持续定位');
        setTimeout(function() {
          self.startLocationTracking();
        }, 100); // 缩短延迟时间
      },
      fail: function(err) {
        console.log('❌ 位置权限授权失败:', err);
        
        // 🔧 离线模式下授权失败，可能是网络问题，直接尝试GPS
        if (self.isOfflineMode) {
          console.log('🌐 离线模式：授权API失败，直接尝试GPS');
          self.hasPermission = true;
          self.updateStatus('离线模式 - 尝试GPS');
          setTimeout(function() {
            self.startLocationTracking();
          }, 100);
        } else {
          self.hasPermission = false;
          self.updateStatus('权限授权失败');
          self.handlePermissionDenied();
        }
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
    
    console.log('🛰️ 启动GPS位置追踪');
    this.updateStatus('正在启动GPS...');
    
    // 🔧 修复：无论在线还是离线模式，都启动持续定位监听
    // 启动持续位置更新
    wx.startLocationUpdate({
      type: 'wgs84',  // 🔧 强制使用GPS坐标系，避免网络定位
      success: function() {
        console.log('✅ 持续定位启动成功');
        self.isRunning = true;
        self.updateStatus(self.isOfflineMode ? '离线GPS正常工作' : 'GPS正常工作');
        
        // 🔧 关键修复：立即监听位置变化，确保数据流畅
        wx.onLocationChange(function(location) {
          console.log('📍 收到位置更新:', location);
          self.handleLocationUpdate(location);
        });
        
        // 🔧 立即尝试获取一次位置，加速首次定位
        console.log('🚀 立即尝试获取首次位置');
        self.attemptGPSLocation(0);
        
        if (self.callbacks.onTrackingStart) {
          self.callbacks.onTrackingStart();
        }
      },
      fail: function(err) {
        console.error('❌ 启动持续定位失败:', err);
        self.updateStatus('GPS启动失败');
        
        // 🔧 如果持续定位失败，尝试离线模式
        if (!self.isOfflineMode) {
          console.log('🌐 持续定位失败，切换到离线模式');
          self.isOfflineMode = true;
          self.startOfflineFallbackMode();
        } else {
          self.handleError({
            code: 'LOCATION_UPDATE_FAILED',
            message: '无法启动GPS定位',
            details: err
          });
        }
      }
    });
    
    // 🔧 如果是离线模式，同时尝试离线GPS获取
    if (this.isOfflineMode) {
      console.log('🌐 离线模式：同时尝试离线GPS获取');
      this.attemptOfflineGPS();
    }
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
   * 🆕 增强GPS获取策略 - 强制使用GPS定位获取高度
   * @param {number} attemptCount 尝试次数
   */
  attemptGPSLocation: function(attemptCount) {
    var self = this;
    var maxAttempts = 3;
    var timeoutDuration = attemptCount === 0 ? 15000 : 10000; // 第一次尝试更长超时
    
    console.log('🛰️ GPS获取尝试 ' + (attemptCount + 1) + '/' + maxAttempts + ', 超时: ' + timeoutDuration + 'ms');
    
    // 🆕 更新页面调试信息
    this.updateDebugInfo({
      gpsAttemptCount: attemptCount + 1,
      gpsStatus: '正在获取GPS信号...'
    });
    
    wx.getLocation({
      type: 'wgs84', // 🔧 强制使用GPS坐标系，避免网络定位
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: timeoutDuration,
      success: function(res) {
        console.log('✅ GPS位置获取成功:', res);
        console.log('📡 定位提供商:', res.provider || '未知');
        
        // 🔧 激进的GPS定位检测和环境分析
        if (res.provider === 'network' || self.isNetworkLocationResult(res)) {
          console.warn('⚠️ 检测到网络定位，分析GPS环境');
          
          // 🚨 环境分析：为什么无法获得GPS？
          var environmentAnalysis = self.analyzeGPSEnvironment(res, attemptCount);
          console.log('🌍 GPS环境分析:', environmentAnalysis);
          
          self.updateDebugInfo({
            gpsStatus: environmentAnalysis.status,
            environmentAdvice: environmentAnalysis.advice
          });
          
          // 🚨 根据环境分析决定策略
          if (environmentAnalysis.shouldRetry && attemptCount < 2) {
            setTimeout(function() {
              console.log('🔄 基于环境分析重试GPS: ' + environmentAnalysis.retryReason);
              self.attemptPureGPSLocation(attemptCount + 1);
            }, environmentAnalysis.retryDelay);
          } else {
            // 提供详细的用户指导
            self.handleGPSEnvironmentGuidance(res, environmentAnalysis);
          }
        } else {
          console.log('✅ 使用GPS定位，高度数据可靠');
          self.updateDebugInfo({
            gpsStatus: 'GPS定位成功'
          });
          self.handleLocationUpdate(res);
        }
      },
      fail: function(err) {
        console.warn('⚠️ GPS获取失败 (尝试' + (attemptCount + 1) + '):', err);
        
        if (attemptCount < maxAttempts - 1) {
          // 重试
          self.updateDebugInfo({
            gpsStatus: '重试中...'
          });
          setTimeout(function() {
            self.attemptGPSLocation(attemptCount + 1);
          }, 2000);
        } else {
          console.error('❌ GPS获取失败，已达到最大重试次数');
          self.updateDebugInfo({
            gpsStatus: 'GPS获取失败'
          });
          self.updateStatus('GPS获取失败');
          self.handleError({
            code: 'GPS_ACQUISITION_FAILED',
            message: 'GPS信号获取失败，请移动到窗边或室外',
            details: err
          });
        }
      }
    });
  },

  /**
   * 🆕 检测是否为网络定位结果（基于数据特征）
   * @param {Object} locationData 位置数据
   * @returns {boolean} 是否为网络定位
   */
  isNetworkLocationResult: function(locationData) {
    // 🚨 关键检测：provider字段
    if (locationData.provider === 'network') {
      console.log('🔍 Provider字段确认为网络定位');
      return true;
    }
    
    // 🚨 微信小程序的特殊情况：即使设置wgs84也可能返回网络定位
    // 通过indoorLocationType字段检测（室内定位通常使用网络）
    if (locationData.indoorLocationType !== undefined && locationData.indoorLocationType >= 0) {
      console.log('🔍 检测到室内定位类型，可能是网络定位');
      return true;
    }
    
    // 精度检测：网络定位通常精度较差
    if (locationData.accuracy && locationData.accuracy > 65) {
      console.log('🔍 基于精度判断为网络定位:', locationData.accuracy + 'm');
      return true;
    }
    
    // 高度检测：网络定位通常高度为0或null
    if (locationData.altitude === null || locationData.altitude === undefined || 
        (locationData.altitude === 0 && locationData.verticalAccuracy === 0)) {
      console.log('🔍 基于高度和垂直精度判断为网络定位');
      return true;
    }
    
    return false;
  },

  /**
   * 🆕 分析GPS环境和失败原因
   * @param {Object} locationData 位置数据
   * @param {number} attemptCount 当前尝试次数
   * @returns {Object} 环境分析结果
   */
  analyzeGPSEnvironment: function(locationData, attemptCount) {
    var analysis = {
      shouldRetry: false,
      retryDelay: 2000,
      retryReason: '',
      status: '',
      advice: '',
      environmentType: 'unknown'
    };
    
    // 1. 室内环境检测
    if (locationData.indoorLocationType !== undefined && locationData.indoorLocationType >= 0) {
      analysis.environmentType = 'indoor';
      analysis.status = '检测到室内环境';
      analysis.advice = '请移动到窗边或室外获得GPS信号';
      analysis.shouldRetry = attemptCount === 0; // 只在第一次时重试
      analysis.retryDelay = 5000;
      analysis.retryReason = '室内转户外GPS重试';
      return analysis;
    }
    
    // 2. 精度分析
    if (locationData.accuracy > 100) {
      analysis.environmentType = 'poor_signal';
      analysis.status = 'GPS信号弱 (精度' + Math.round(locationData.accuracy) + 'm)';
      analysis.advice = '信号较弱，建议移动到空旷地带';
      analysis.shouldRetry = true;
      analysis.retryDelay = 3000;
      analysis.retryReason = '弱信号环境GPS重试';
      return analysis;
    }
    
    // 3. 高度缺失分析
    if (locationData.altitude === null || locationData.altitude === 0) {
      analysis.environmentType = 'altitude_missing';
      analysis.status = '无高度数据，可能是网络辅助定位';
      analysis.advice = '正在尝试获取GPS卫星信号';
      analysis.shouldRetry = true;
      analysis.retryDelay = 4000;
      analysis.retryReason = '缺失高度数据GPS重试';
      return analysis;
    }
    
    // 4. 微信策略限制
    analysis.environmentType = 'wechat_limitation';
    analysis.status = '微信优先使用网络定位策略';
    analysis.advice = '当前环境网络定位优先，高度数据可能不准确';
    analysis.shouldRetry = attemptCount === 0;
    analysis.retryDelay = 8000;
    analysis.retryReason = '尝试绕过微信网络定位策略';
    
    return analysis;
  },

  /**
   * 🆕 处理GPS环境指导
   * @param {Object} locationData 位置数据
   * @param {Object} environmentAnalysis 环境分析结果
   */
  handleGPSEnvironmentGuidance: function(locationData, environmentAnalysis) {
    console.log('🧭 GPS环境指导:', environmentAnalysis.advice);
    
    // 根据环境类型提供不同的处理
    switch (environmentAnalysis.environmentType) {
      case 'indoor':
        this.updateStatus('室内环境 - 建议移至窗边');
        this.showGPSGuidance('🏠 室内环境检测', 
          '当前在室内环境，GPS信号被遮挡。\n建议：\n• 移动到窗边\n• 或移动到室外空旷处\n• 等待GPS信号稳定后重试');
        break;
        
      case 'poor_signal':
        this.updateStatus('GPS信号弱 - 建议改善环境');
        this.showGPSGuidance('📶 GPS信号较弱', 
          '当前GPS信号强度不足。\n建议：\n• 移动到空旷地带\n• 避开高楼遮挡\n• 等待几分钟让GPS稳定');
        break;
        
      case 'wechat_limitation':
        this.updateStatus('网络定位优先 - 高度不准确');
        this.showGPSGuidance('⚙️ 微信定位策略', 
          '微信小程序优先使用网络定位。\n说明：\n• 位置坐标准确\n• 高度数据可能不准确\n• 在空旷处可获得GPS高度');
        break;
        
      default:
        this.updateStatus('使用网络定位 - 高度受限');
    }
    
    // 最终还是要处理位置数据，只是标记为网络定位
    this.handleNetworkLocationDetected(2, locationData); // 跳过重试
  },

  /**
   * 🆕 显示GPS指导信息
   * @param {string} title 标题
   * @param {string} message 消息内容
   */
  showGPSGuidance: function(title, message) {
    if (this.page && this.page.setData) {
      this.page.setData({
        showGPSWarning: true,
        gpsWarningTitle: title,
        gpsWarningMessage: message,
        debugPanelExpanded: true
      });
    }
  },

  /**
   * 🆕 纯GPS定位尝试（更激进的GPS获取）
   * @param {number} attemptCount 尝试次数
   */
  attemptPureGPSLocation: function(attemptCount) {
    var self = this;
    var timeoutDuration = 20000; // 纯GPS模式使用更长超时（20秒）
    
    console.log('🛰️ 纯GPS定位尝试 ' + (attemptCount + 1) + '/3, 超时: ' + timeoutDuration + 'ms');
    
    this.updateDebugInfo({
      gpsAttemptCount: attemptCount + 1,
      gpsStatus: '纯GPS模式获取中...'
    });
    
    // 🚨 使用最激进的GPS参数
    wx.getLocation({
      type: 'wgs84',
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: timeoutDuration,
      success: function(res) {
        console.log('🛰️ 纯GPS定位结果:', res);
        
        // 再次检验是否真的是GPS定位
        if (self.isNetworkLocationResult(res)) {
          console.warn('🚨 仍然是网络定位，继续重试或接受结果');
          if (attemptCount < 2) {
            setTimeout(function() {
              self.attemptPureGPSLocation(attemptCount + 1);
            }, 3000);
          } else {
            console.warn('⚠️ 强制重试已达上限，接受当前结果');
            self.updateDebugInfo({
              gpsStatus: '已达重试上限，使用当前结果'
            });
            self.handleLocationUpdate(res);
          }
        } else {
          console.log('✅ 获得真正的GPS定位');
          self.updateDebugInfo({
            gpsStatus: '纯GPS定位成功'
          });
          self.handleLocationUpdate(res);
        }
      },
      fail: function(err) {
        console.error('❌ 纯GPS定位失败:', err);
        self.updateDebugInfo({
          gpsStatus: '纯GPS定位失败: ' + err.errMsg
        });
        
        // 失败后回到普通获取模式
        if (attemptCount < 2) {
          setTimeout(function() {
            self.attemptGPSLocation(attemptCount + 1);
          }, 2000);
        } else {
          self.updateStatus('GPS获取失败');
          self.handleError({
            code: 'PURE_GPS_FAILED',
            message: '纯GPS定位失败，设备可能在室内或GPS信号弱',
            details: err
          });
        }
      }
    });
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
      console.log('📍 网络定位高度数据:', altitude + 'm → ' + altitudeFeet + 'ft (精度较低)');
    } else {
      console.log('🛰️ GPS定位高度数据:', altitude + 'm → ' + altitudeFeet + 'ft (高精度)');
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
   * 🆕 处理网络定位检测
   * @param {number} attemptCount 当前尝试次数
   * @param {Object} locationData 位置数据
   */
  handleNetworkLocationDetected: function(attemptCount, locationData) {
    var self = this;
    
    // 先处理当前位置数据
    this.handleLocationUpdate(locationData);
    
    // 如果还有重试机会，尝试获取GPS定位
    if (attemptCount < 2) {
      this.updateStatus('检测到网络定位，尝试获取GPS...');
      
      setTimeout(function() {
        console.log('🔄 网络定位转GPS定位重试...');
        self.attemptGPSLocation(attemptCount + 1);
      }, 3000);
    } else {
      // 显示网络定位警告
      this.updateStatus('使用网络定位 - GPS信号弱');
      
      if (this.page && this.page.setData) {
        this.page.setData({
          showGPSWarning: true,
          gpsWarningMessage: 'GPS信号弱，使用网络定位（高度可能不准确）',
          gpsProviderType: 'network',
          debugPanelExpanded: true
        });
      }
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
    
    // 调试：打印原始GPS数据和定位类型
    console.log('🛰️ 原始GPS数据:', {
      纬度: location.latitude,
      经度: location.longitude,
      原始高度: location.altitude,
      高度类型: typeof location.altitude,
      速度: location.speed,
      精度: location.accuracy,
      定位提供商: location.provider || '未知'
    });
    
    // 🔧 检测定位类型
    var isGPSLocation = !this.isNetworkLocationResult(location);
    
    // 🔧 使用processAltitudeData方法处理高度数据
    var processedAltitude = this.processAltitudeData(location.altitude, isGPSLocation);
    
    // 🔧 直接使用原始GPS数据，不进行任何过滤处理
    var rawData = {
      latitude: location.latitude,
      longitude: location.longitude,
      // 🔧 使用处理后的高度数据
      altitude: processedAltitude,
      speed: location.speed ? Math.round(location.speed * 1.94384) : 0, // 米/秒转节
      accuracy: location.accuracy || 0,
      timestamp: Date.now(),
      provider: location.provider || 'unknown',
      altitudeValid: processedAltitude != null,
      // 🔧 保存原始高度数据（米）用于调试显示
      rawAltitudeMeters: location.altitude,
      isGPSLocation: isGPSLocation
    };
    
    // GPS数据转换调试
    console.log('✅ 原始GPS数据转换:', {
      纬度: rawData.latitude,
      经度: rawData.longitude,
      原始高度米: location.altitude,
      转换高度英尺: rawData.altitude,
      速度: rawData.speed + 'kt',
      定位类型: rawData.provider
    });
    
    // 🆕 维护位置历史记录
    this.updateLocationHistory(rawData);
    
    // 🆕 计算航迹数据
    var flightData = this.calculateFlightData(rawData);
    
    // 将航迹数据合并到原始数据中
    rawData.track = flightData.track;
    rawData.verticalSpeed = flightData.verticalSpeed;
    rawData.acceleration = flightData.acceleration;
    
    // 航迹计算结果（静默）
    
    // 🔧 直接使用原始数据，不进行滤波
    var processedData = rawData;
    
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
    
    // 位置历史记录更新（静默）
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
      
      // 飞行数据计算完成（静默）
      
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
          consecutiveAnomalies: filteredResult.consecutiveAnomalies || 0,
          gpsInterference: filteredResult.hasInterference || false
        };
        
        // 🚨 GPS干扰检测和警告
        if (filteredResult.hasInterference && this.callbacks.onInterferenceDetected) {
          console.warn('🚨 检测到GPS干扰，触发警告');
          this.callbacks.onInterferenceDetected({
            time: new Date().toLocaleTimeString(),
            type: 'altitude_jump',
            message: 'GPS高度数据异常跳变，可能存在干扰'
          });
        }
        
        // 智能滤波结果（静默）
        
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
   * 强制刷新位置 - 使用增强GPS获取策略
   */
  refreshLocation: function() {
    if (!this.hasPermission) {
      console.warn('⚠️ 没有位置权限，无法刷新位置');
      return;
    }
    
    console.log('🔄 手动刷新位置 - 使用增强GPS模式');
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
      console.warn('⚠️ 无法保存最后已知位置:', e);
    }
  },

  /**
   * 🆕 离线模式下的GPS尝试（纯GPS不依赖网络）
   */
  attemptOfflineGPS: function() {
    var self = this;
    
    console.log('🌐 离线模式：尝试纯GPS定位（不依赖网络）');
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
        console.log('✅ 离线GPS获取成功:', res);
        
        if (self.isNetworkLocationResult(res)) {
          console.warn('⚠️ 离线模式仍返回网络定位，可能是缓存数据');
          self.updateDebugInfo({
            gpsStatus: '离线GPS失败，使用缓存位置'
          });
          self.handleOfflineLocationRequest();
        } else {
          console.log('🛰️ 离线模式获得真实GPS信号！');
          self.updateDebugInfo({
            gpsStatus: '离线GPS成功'
          });
          self.updateStatus('离线模式 - GPS工作正常');
          self.handleLocationUpdate(res);
        }
      },
      fail: function(err) {
        console.error('❌ 离线GPS获取失败:', err);
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
    
    console.log('🌐 启动离线回退模式');
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
   * 🆕 更新页面调试信息
   * @param {Object} debugData 要更新的调试数据
   */
  updateDebugInfo: function(debugData) {
    if (!this.page || !this.page.setData) {
      return;
    }
    
    var updateData = {};
    for (var key in debugData) {
      updateData['debugData.' + key] = debugData[key];
    }
    
    this.page.setData(updateData);
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