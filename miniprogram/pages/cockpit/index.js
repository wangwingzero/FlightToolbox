/**
 * 驾驶舱页面 - 模块化版本（已优化）
 *
 * 核心功能模块（9个）：
 * - FlightCalculator: 飞行数据计算
 * - GPSManager: GPS位置追踪和高度/速度显示（原始数据，无滤波）
 * - CompassManager: 指南针航向处理（三传感器融合）
 * - AttitudeIndicator: 姿态仪表系统（俯仰角、滚转角）
 * - GyroscopeManager: 陀螺仪管理
 * - AccelerometerManager: 加速度计管理
 * - GPSSpoofingDetector: GPS欺骗检测（语音警告）
 * - AudioManager: 音频警告管理
 * - ToastManager: 智能提示管理
 *
 * 已移除ND导航功能（AirportManager, MapRenderer, GestureHandler）
 * 优化成果：净减少187行代码，性能提升，内存占用降低
 */

var BasePage = require('../../utils/base-page.js');
var config = require('./modules/config.js');
var Logger = require('./modules/logger.js');
var tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');
var adHelper = require('../../utils/ad-helper.js');
var simpleAirportManager = require('../../utils/simple-airport-manager.js');

// 引入生命周期管理器
var LifecycleManager = require('./modules/lifecycle-manager.js');

// 引入所有模块
var FlightCalculator = require('./modules/flight-calculator.js');
var GPSManager = require('./modules/gps-manager.js');
var CompassManager = require('./modules/compass-manager-simple.js');
var GyroscopeManager = require('./modules/gyroscope-manager.js');
var AccelerometerManager = require('./modules/accelerometer-manager.js');
var AttitudeIndicator = require('./modules/attitude-indicator.js');
// 移除卡尔曼滤波器，使用简化滤波器替代
var ToastManager = require('./modules/toast-manager.js');
// GPS欺骗检测和音频管理
var GPSSpoofingDetector = require('./modules/gps-spoofing-detector.js');
var AudioManager = require('./modules/audio-manager.js');
var systemInfoHelper = require('../../utils/system-info-helper.js');

var pageConfig = {
  data: {
    // 插屏广告相关
    interstitialAd: null,
    interstitialAdLoaded: false,
    lastInterstitialAdShowTime: 0,

    // GPS数据
    latitude: 0,     // 航空格式坐标显示
    longitude: 0,    // 航空格式坐标显示
    latitudeDecimal: 0,   // 十进制坐标用于计算
    longitudeDecimal: 0,  // 十进制坐标用于计算
    altitude: null,  // 初始值为null，显示"--"
    speed: null,     // 初始值为null，显示"--"
    heading: 0,
    
    // 姿态仪数据
    pitch: 0,        // 俯仰角
    roll: 0,         // 滚转角

    // 🎯 姿态仪布局参数（响应式计算，避免Canvas初始化时跳变）
    attitudeCanvasSize: 340,       // Canvas尺寸（rpx）
    attitudeGridGap: 3,            // Grid间距（rpx）
    attitudeGridPadding: '25rpx 0rpx',  // Grid内边距

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
    gpsStatus: '无信号',
    gpsStatusClass: 'status-bad', // GPS状态对应的CSS类
    isOffline: false,
    lastUpdateTime: 0,
    updateCount: 0,
    
    // 卡尔曼滤波状态 - 已禁用
    // kalmanEnabled: false,       // 是否启用卡尔曼滤波  
    // kalmanConverged: false,     // 滤波器是否收敛
    
    // GPS干扰检测（保留原有）
    gpsInterference: false,
    lastInterferenceTime: null,
    lastWarningTime: null,  // 🆕 记录上次弹出警告的时间戳
    interferenceTimer: null,
    
    // GPS欺骗检测
    gpsSpoofing: false,                  // 是否检测到GPS欺骗
    spoofingDetectionEnabled: false,     // 欺骗检测是否启用（默认关闭）
    voiceAlertEnabled: true,             // 语音警告是否启用
    firstSpoofingTime: null,             // 首次检测到欺骗的时间
    
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
      lastUpdateTime: '未更新',          // 最后更新时间

      // 🛡️ GPS欺骗检测缓冲区状态
      spoofingBufferSize: 0,             // 当前缓冲区数据点数量
      spoofingBufferRequired: 10,        // 最小要求数据点数量
      spoofingDetectionState: 'NORMAL',   // 检测器状态
      spoofingBufferTotal: 0             // 🆕 缓冲区总长度（包括无效数据）
    },
    
    // 人工地平仪数据
    showAttitudeIndicator: true,       // 是否显示人工地平仪
    attitudeIndicatorEnabled: false,   // 人工地平仪是否启用
    attitudeIndicatorState: 'uninitialized', // 姿态仪状态
    pitch: 0,                          // 俯仰角（度）
    roll: 0,                           // 滚转角（度）
    
    // ActionSheet 相关数据初始化（避免类型不兼容警告）
    rangeOptions: [],                  // 距离圈选择选项
    showRangeSelector: false,          // 距离圈选择器显示状态
    
  },
  

  customOnLoad: function(options) {
    console.log('🎯🎯🎯 驾驶舱页面 customOnLoad 开始执行 🎯🎯🎯');
    Logger.debug('驾驶舱页面加载 - 模块化版本', options);

    // 🎯 优化：提前计算姿态仪布局参数，避免Canvas初始化时跳变
    var __wi = systemInfoHelper.getWindowInfo() || {};
    var screenWidth = __wi.screenWidth;
    var attitudeLayoutParams = this.calculateAttitudeLayout(screenWidth);

    this.safeSetData({
      attitudeCanvasSize: attitudeLayoutParams.canvasSize,
      attitudeGridGap: attitudeLayoutParams.gridGap,
      attitudeGridPadding: attitudeLayoutParams.gridPadding
    });

    Logger.debug('📐 提前计算姿态仪布局参数:', attitudeLayoutParams);

    // 🔧 处理目标机场参数已删除（ND功能移除）

    // 🔧 新增：加载时恢复本地存储的地图状态已删除（ND功能移除）

    // 🚀 直接调用传统初始化，跳过生命周期管理器
    console.log('🚨🚨🚨 直接初始化模块，跳过生命周期管理器 🚨🚨🚨');
    try {
      console.log('📍 开始调用 initializeModules...');
      this.initializeModules();
      console.log('✅ initializeModules 完成');

      console.log('📍 开始调用 startServices...');
      this.startServices();
      console.log('✅ startServices 完成');
    } catch (error) {
      console.error('❌ 初始化失败:', error);
      console.error('❌ 错误堆栈:', error.stack);
    }

    // 🎯 延迟初始化姿态仪，确保Canvas已经渲染完成
    var self = this;
    setTimeout(function() {
      console.log('📌 延迟初始化姿态仪，确保Canvas已准备好');
      if (self.data.showAttitudeIndicator) {
        try {
          self.initAttitudeIndicator();
          console.log('✅ 姿态仪延迟初始化成功');
        } catch (error) {
          console.error('❌ 姿态仪初始化失败:', error);
          console.error('错误堆栈:', error.stack);
        }
      }
    }, 1000); // 延迟1秒，给Canvas充足的时间渲染

    // 🎬 创建插屏广告实例
    this.createInterstitialAd();
  },

  /**
   * 🔧 从本地存储恢复地图状态（已删除 - ND功能移除）
   */

  customOnShow: function() {
    Logger.debug('📱 驾驶舱页面显示 - 启动服务');

    // 处理TabBar页面进入（标记访问+更新小红点）
    tabbarBadgeManager.handlePageEnter('pages/cockpit/index');

    // 🎬 显示插屏广告（频率控制）
    this.showInterstitialAdWithControl();

    // 🔧 修复：页面显示时先清除可能的错误状态和过期GPS数据
    this.safeSetData({
      locationError: null,
      // 清除过期的GPS数据，避免显示旧数据
      altitude: null,
      speed: null
    });

    // 🔧 地图状态恢复已删除（ND功能移除）

    // 重新检查GPS权限状态
    if (this.gpsManager) {
      this.gpsManager.checkLocationPermission();
    }

    // 启动指南针（如果还没启动且支持指南针）
    if (this.compassManager) {
      var compassStatus = this.compassManager.getStatus();
      if (!compassStatus.isRunning && compassStatus.compassSupported !== false) {
        var context = this.getCurrentContext();
        Logger.debug('🧭 页面显示时启动指南针');
        this.compassManager.start(context);
      } else {
        Logger.debug('🧭 指南针已运行或不支持，跳过启动');
      }
    }

    // 🎯 恢复姿态仪 - 页面显示时恢复姿态仪工作
    if (this.data.showAttitudeIndicator && this.attitudeIndicator) {
      var self = this;

      try {
        var attitudeStatus = this.attitudeIndicator.getStatus();
        Logger.debug('🎯 准备恢复姿态仪，当前状态:', attitudeStatus.state);

        // 🔧 关键修复：统一转换为小写进行比较，避免大小写问题
        var stateStr = String(attitudeStatus.state || '').toLowerCase();

        // 根据状态决定恢复策略
        if (stateStr === 'stopped') {
          // 正常暂停状态，调用resume恢复
          Logger.debug('📱 姿态仪处于暂停状态，调用resume恢复');
          this.attitudeIndicator.resume();

          // 🎯 增强：立即检查恢复是否成功
          setTimeout(function() {
            if (self.attitudeIndicator) {
              var newStatus = self.attitudeIndicator.getStatus();
              var newStateStr = String(newStatus.state || '').toLowerCase();
              Logger.debug('🔍 恢复后状态检查:', newStatus.state);

              // 如果还是stopped或error，强制刷新
              if (newStateStr === 'stopped' || newStateStr === 'error') {
                Logger.warn('⚠️ 姿态仪恢复失败（状态:', newStatus.state, '），尝试强制刷新');
                self.attitudeIndicator.forceRefresh();
              } else if (newStateStr === 'active' || newStateStr === 'simulated') {
                // 检查渲染是否正常
                if (!newStatus.performance || newStatus.performance.fps === 0) {
                  Logger.warn('⚠️ 姿态仪恢复但渲染停止，强制刷新');
                  self.attitudeIndicator.forceRefresh();
                } else {
                  Logger.debug('✅ 姿态仪恢复成功，FPS:', newStatus.performance.fps);
                }
              }
            }
          }, 800); // 给恢复过程更多时间

        } else if (stateStr === 'error' || stateStr === 'uninitialized') {
          // 错误状态或未初始化，尝试强制刷新
          Logger.warn('⚠️ 姿态仪处于异常状态（', attitudeStatus.state, '），强制刷新');
          this.attitudeIndicator.forceRefresh();

        } else if (stateStr === 'active' || stateStr === 'simulated') {
          // 🔧 关键修复：即使状态显示为active，也要强制恢复一次
          // 因为可能只是状态标记没更新，实际渲染已停止
          Logger.debug('📱 姿态仪显示为运行状态，但可能实际已停止，强制恢复');

          // 直接调用resume，它会处理各种情况
          this.attitudeIndicator.resume();

          // 延迟检查是否需要强制刷新
          setTimeout(function() {
            if (self.attitudeIndicator) {
              var checkStatus = self.attitudeIndicator.getStatus();
              // 检查FPS是否为0（渲染停止）
              if (!checkStatus.performance || checkStatus.performance.fps === 0) {
                Logger.warn('⚠️ 检测到渲染仍然停止（FPS=0），强制刷新');
                self.attitudeIndicator.forceRefresh();
              } else {
                Logger.debug('✅ 姿态仪恢复正常，FPS:', checkStatus.performance.fps);
              }
            }
          }, 500);
        } else {
          // 未知状态，直接强制刷新
          Logger.warn('⚠️ 姿态仪处于未知状态（', attitudeStatus.state, '），强制刷新');
          this.attitudeIndicator.forceRefresh();
        }

      } catch (error) {
        Logger.error('⚠️ 恢复姿态仪失败:', error);
        // 尝试强制刷新作为最后手段
        try {
          this.attitudeIndicator.forceRefresh();
        } catch (e) {
          Logger.error('⚠️ 强制刷新也失败:', e);
        }
      }
    }
  },
  
  customOnHide: function() {
    Logger.debug('🌙 驾驶舱页面隐藏 - 暂停服务以节省资源');

    // 停止GPS追踪
    if (this.gpsManager) {
      this.gpsManager.stopLocationTracking();
    }

    // 指南针管理器停止已删除（ND功能移除）

    // 地图渲染器停止已删除（ND功能移除）

    // 🎯 关键修复：强制暂停姿态仪，无论当前状态
    if (this.attitudeIndicator) {
      try {
        // 🎯 直接调用pause，不检查状态
        // 因为状态可能不准确，但我们需要确保资源被清理
        Logger.debug('🎯 强制暂停姿态仪');
        this.attitudeIndicator.pause();
        Logger.debug('⏸️ 姿态仪已暂停');
      } catch (error) {
        Logger.warn('⚠️ 暂停姿态仪失败，忽略:', error);
      }
    } else {
      Logger.debug('⚠️ 姿态仪不存在，跳过暂停');
    }
  },
  
  customOnUnload: function() {
    Logger.debug('🗑️ 驾驶舱页面卸载 - 销毁所有模块');

    // 🧹 清理插屏广告资源
    this.destroyInterstitialAd();

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

    // 地图渲染停止已删除（ND功能移除）

    // 停止姿态仪，确保传感器、模拟、渲染循环和看门狗全部清理
    if (this.attitudeIndicator) {
      try {
        this.attitudeIndicator.stop();
        Logger.debug('🛑 姿态仪已停止并清理资源');
      } catch (error) {
        Logger.warn('⚠️ 停止姿态仪失败，忽略:', error);
      }
    }
    
    // 延迟一点再销毁模块，确保所有pending的操作完成 - 使用安全定时器
    var self = this;
    this.createSafeTimeout(function() {
      self.destroyModules();
    }, 100, '模块销毁延迟');
  },

  /**
   * 🎯 计算姿态仪响应式布局参数（在页面加载时调用，避免Canvas初始化跳变）
   * @param {number} screenWidth 屏幕宽度（px）
   * @returns {object} 布局参数
   */
  calculateAttitudeLayout: function(screenWidth) {
    // 基础配置（与attitude-indicator.js中的配置保持一致）
    var baseConfig = {
      canvasSize: 340,          // Canvas尺寸（rpx）
      gridGap: 3,               // Grid间距（rpx）
      gridPadding: '25rpx 0rpx' // Grid内边距
    };

    // 响应式配置：屏幕宽度 ≤ 450px 时使用小尺寸
    if (screenWidth <= 450) {
      return {
        canvasSize: 270,
        gridGap: 2,
        gridPadding: '16rpx 0rpx'
      };
    }
    // 屏幕宽度 ≤ 600px 时使用中等尺寸
    else if (screenWidth <= 600) {
      return {
        canvasSize: 320,
        gridGap: 2,
        gridPadding: '20rpx 0rpx'
      };
    }
    // 默认使用基础尺寸
    else {
      return baseConfig;
    }
  },

  /**
   * 初始化所有模块
   */
  initializeModules: function() {
    var self = this;

    console.log('🚀🚀🚀 initializeModules 函数开始执行 🚀🚀🚀');
    Logger.debug('🚀 开始初始化所有模块...');

    console.log('📊 当前页面数据:', {
      hasData: !!this.data,
      showAttitudeIndicator: this.data ? this.data.showAttitudeIndicator : 'undefined'
    });

    Logger.debug('📊 页面数据状态:', {
      hasData: !!this.data,
      showAttitudeIndicator: this.data ? this.data.showAttitudeIndicator : 'undefined'
    });

    // 0. 创建Toast管理器（优先创建，供其他模块使用）
    this.toastManager = ToastManager.create(config);

    // 1. 创建飞行计算器（纯函数模块）
    this.flightCalculator = FlightCalculator.create(config);

    // 2. AirportManager已删除（ND功能移除）

    // 3. 移除卡尔曼滤波器，使用简化滤波器替代
    Logger.debug('✅ 使用简化滤波器，无需复杂的卡尔曼滤波器');

    // 3.5. 初始化GPS欺骗检测系统（必须在GPS管理器之前创建）
    this.initializeSpoofingDetection();

    // 4. 创建GPS管理器
    this.gpsManager = GPSManager.create(config);
    this.gpsManager.init(this, {
      onPermissionGranted: function() {
        Logger.debug('🔧 GPS权限已授予');

        // 🔧 GPS权限授予后的状态重置（ND相关已删除）
        self.safeSetData({
          hasLocationPermission: true,
          getLocationPermission: true,
          locationError: null,
          showGPSWarning: false,
          gpsStatus: '权限已授予'
        });
      },
      onForceMapUpdate: function() {
        // 🔧 强制地图更新已删除（ND功能移除）
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
          Logger.debug('🔧 GPS位置错误:', errorMsg);
          // ⚠️ 高优先级：位置错误是关键信息
          self.safeSetData({
            locationError: errorMsg
          }, null, {
            priority: 'high'
          });
        } else {
          // 🔧 修复：清除错误状态
          Logger.debug('🔧 清除GPS位置错误状态');
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
        var updateData = {
          gpsStatus: status,
          gpsStatusClass: self.calculateGPSStatusClass(status)
        };

        // 🔧 修复：当GPS状态为"无信号"时，立即清除高度和速度显示
        if (status === '无信号' || status === '未授权') {
          updateData.altitude = null;
          updateData.speed = null;
          Logger.debug('🔧 GPS无信号，清除高度和速度显示');
        }

        self.safeSetData(updateData, null, {
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
          Logger.warn('🚨 GPS干扰警告 - 冷却期已过，弹出警告');
          
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
          Logger.debug('🔄 GPS干扰检测 - 冷却期内，剩余' + remainingTime + '分钟，不弹出警告');
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
        var recoveryTimer = self.createSafeTimeout(function() {
          Logger.debug('⏰ GPS干扰自动恢复时间到达');
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
        }, 10 * 60 * 1000, 'GPS干扰自动恢复'); // 10分钟
        
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
          Logger.debug('🛑 页面销毁中，忽略上下文更新');
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
        Logger.debug('🌀 陀螺仪启动成功（传统模式）');
      },
      onGyroscopeUpdate: function(data) {
        // 陀螺仪数据由指南针管理器融合处理，这里不需要额外处理
      },
      onGyroscopeStop: function() {
        Logger.debug('🌀 陀螺仪停止（传统模式）');
      },
      onGyroscopeError: function(err) {
        Logger.debug('⚠️ 陀螺仪不可用（传统模式）:', err.errMsg);
      }
    });
    
    // 5b. 创建加速度计管理器（独立传感器）
    this.accelerometerManager = AccelerometerManager.create(config);
    this.accelerometerManager.init(this, {
      onAccelerometerStart: function() {
        Logger.debug('⚡ 加速度计启动成功（传统模式）');
      },
      onAccelerometerUpdate: function(data) {
        // 加速度计数据由指南针管理器融合处理，这里不需要额外处理
      },
      onAccelerometerStop: function() {
        Logger.debug('⚡ 加速度计停止（传统模式）');
      },
      onAccelerometerError: function(err) {
        Logger.debug('⚠️ 加速度计不可用（传统模式）:', err.errMsg);
      }
    });
    
    // 5c. 创建指南针管理器（三传感器融合）
    this.compassManager = CompassManager.create(config);
    this.compassManager.init(this, {
      onHeadingUpdate: function(headingData) {
        Logger.debug('🧭 航向数据更新:', {
          heading: headingData.heading,
          lastStableHeading: headingData.lastStableHeading,
          speed: self.data.speed
        });
        self.safeSetData(headingData);
        // 地图渲染更新已删除（ND功能移除）
      },
      onModeChange: function(modeInfo) {
        self.safeSetData({
          headingMode: modeInfo.newMode
        });
      },
      onCompassReady: function() {
        Logger.debug('✅ 指南针就绪 - 开始接收航向数据');

        // 🔧 添加指南针状态诊断
        var compassStatus = self.compassManager.getStatus();
        Logger.debug('🧭 指南针状态:', compassStatus);

        // 清除任何GPS警告，因为指南针正常工作
        self.safeSetData({
          showGPSWarning: false
        });
      },
      onCompassError: function(errorInfo) {
        Logger.error('指南针错误详情:', errorInfo);

        // 不再使用通用的handleError，因为compass-manager已经处理了用户提示
        if (errorInfo.fallback) {
          // 设备不支持指南针，已自动切换到GPS模式
          Logger.debug('指南针不可用，使用GPS航迹替代');
        } else if (errorInfo.canRetry) {
          Logger.debug('指南针错误可重试，重试次数:', errorInfo.retryCount);
        }
      },
      onFallbackToGPS: function(fallbackInfo) {
        Logger.debug('指南针降级到GPS模式:', fallbackInfo.reason);

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
        // 地图航向更新已删除（ND功能移除）
      },
      onMapHeadingLock: function(lockUpdate) {
        // 地图航向锁定已删除（ND功能移除）
      },
      onMapHeadingUnlock: function() {
        // 地图航向解锁已删除（ND功能移除）
      },
      onContextUpdate: function(contextUpdate) {
        // 添加页面状态检查  
        if (self._isDestroying || self.isDestroying) {
          Logger.debug('🛑 页面销毁中，忽略指南针上下文更新');
          return;
        }
        self.safeSetData(contextUpdate);
      }
    }); // 指南针管理器无需滤波器

    // 5. MapRenderer已删除（ND功能移除）

    // 6. 人工地平仪 - 不在这里初始化，等待onReady
    console.log('📍📍📍 准备初始化姿态仪部分 📍📍📍');
    Logger.debug('📍 准备检查姿态仪初始化条件...');

    console.log('🔍 检查条件:', {
      showAttitudeIndicator: this.data.showAttitudeIndicator,
      AttitudeIndicatorModule: !!AttitudeIndicator,
      createMethod: !!(AttitudeIndicator && AttitudeIndicator.create)
    });

    Logger.debug('🔍 检查姿态仪初始化条件:', {
      showAttitudeIndicator: this.data.showAttitudeIndicator,
      AttitudeIndicatorModule: !!AttitudeIndicator,
      createMethod: !!(AttitudeIndicator && AttitudeIndicator.create)
    });

    if (this.data.showAttitudeIndicator) {
      console.log('✅ showAttitudeIndicator 为 true，将在onReady中初始化');
      Logger.debug('✅ showAttitudeIndicator 为 true，将在onReady中初始化');
      // 不在这里初始化，等待onReady确保Canvas已经渲染
    } else {
      console.warn('⚠️ showAttitudeIndicator为false，跳过姿态仪初始化');
      Logger.warn('⚠️ showAttitudeIndicator为false，跳过姿态仪初始化');
    }

    console.log('📍 姿态仪初始化检查完成');
    Logger.debug('📍 姿态仪初始化检查完成');

    // 7. GestureHandler已删除（ND功能移除）
  },

  /**
   * 启动服务
   */
  startServices: function() {
    // 机场数据加载已删除（ND功能移除）

    // 🔧 修复：主动启动GPS追踪
    Logger.debug('🛰️ 启动GPS位置追踪服务');
    this.gpsManager.checkLocationPermission();
  },
  
  /**
   * 处理位置更新 - 修复高度处理逻辑和航迹更新
   * @param {Object} locationData 位置数据
   */
  handleLocationUpdate: function(locationData) {
    if (!locationData) return;
    
    // 只显示真实GPS数据，无GPS时显示--
    var altitudeValue = locationData.altitude;  // 如果是非GPS定位，这里应该是null
    var speedValue = locationData.speed;        // 如果是非GPS定位，这里应该是null
    
    // 调试输出：确认接收到的数据
    console.log('📱 驾驶舱接收到GPS数据:', {
      '高度值': altitudeValue,
      '速度值': speedValue,
      'provider': locationData.provider,
      '是否GPS定位': locationData.isGPSLocation
    });
    
    // 计算更新间隔
    var now = Date.now();
    var updateInterval = this.lastUpdateTime ? now - this.lastUpdateTime : 0;
    this.lastUpdateTime = now;
    
    // 🚀 简化逻辑：只要有经纬度数据就加入历史记录
    // 用户要求：只要有GPS数据就应该计算加速度和升降率
    if (locationData.latitude != null && locationData.longitude != null) {
      this.data.locationHistory.push({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        altitude: altitudeValue != null ? altitudeValue : 0,  // null转为0，确保能计算
        speed: speedValue != null ? speedValue : 0,           // null转为0，确保能计算
        timestamp: locationData.timestamp || now
      });

      // 限制历史记录大小
      if (this.data.locationHistory.length > this.data.maxHistorySize) {
        this.data.locationHistory.shift();
      }

      Logger.debug('📊 位置历史记录已更新，长度:', this.data.locationHistory.length,
        '高度:', altitudeValue, '速度:', speedValue);
    } else {
      Logger.warn('⏩ 无效位置数据，跳过');
    }

    // 🚀 使用GPS管理器已经计算好的航迹
    var flightData = {
      track: locationData.track != null ? locationData.track : null
    };

    // 🔧 如果GPS管理器没有提供航迹值，才使用驾驶舱自己的计算（备用方案）
    if (flightData.track == null) {
      Logger.debug('📊 GPS管理器未提供航迹数据，使用驾驶舱备用计算');
      var calculatedData = this.flightCalculator.calculateFlightData(
        this.data.locationHistory,
        this.data.minSpeedForTrack
      );

      if (flightData.track == null) flightData.track = calculatedData.track;
    }

    // 🔧 调试：打印飞行数据
    console.log('🔧 使用的飞行数据:', {
      track: flightData.track,
      source: (locationData.track != null ? 'GPS管理器' : '驾驶舱计算')
    });
    
    // 🛡️ GPS欺骗检测
    var spoofingStatus = { isSpoofing: false };
    if (this.spoofingDetector && this.data.spoofingDetectionEnabled) {
      // 🔧 关键修复：欺骗检测器需要米单位的原始高度，不是英尺!
      // locationData.rawAltitudeMeters 是GPS原始米高度
      // locationData.altitude 是转换后的英尺高度
      var altitudeMeters = null;

      // 优先使用原始米高度
      if (locationData.rawAltitudeMeters != null && !isNaN(locationData.rawAltitudeMeters)) {
        altitudeMeters = locationData.rawAltitudeMeters;
      } else if (altitudeValue != null && !isNaN(altitudeValue)) {
        // 如果没有原始米高度，将英尺转回米
        altitudeMeters = altitudeValue / 3.28084;
      }

      console.log('🛡️ GPS欺骗检测数据:', {
        'altitude米单位': altitudeMeters,
        'altitude英尺单位': altitudeValue,
        'rawAltitudeMeters': locationData.rawAltitudeMeters,
        'isGPSLocation': locationData.isGPSLocation,
        'provider': locationData.provider
      });

      spoofingStatus = this.spoofingDetector.processGPSData({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        altitude: altitudeMeters,  // 🔧 修复：传递米单位的高度
        speed: locationData.speed || 0,
        timestamp: now,
        isGPSLocation: locationData.isGPSLocation  // 🔧 关键修复：传递GPS类型标志
      });

      // 🛡️ 更新GPS欺骗检测缓冲区状态到调试面板
      var detectorStatus = this.spoofingDetector.getStatus();

      // 🔍 诊断：记录检测器状态
      console.log('🛡️ 检测器状态:', {
        'bufferSize': detectorStatus.bufferSize,
        'state': detectorStatus.state,
        'dataBuffer长度': this.spoofingDetector.dataBuffer ? this.spoofingDetector.dataBuffer.length : 'N/A',
        'bufferTotalSize': detectorStatus.bufferTotalSize
      });

      this.safeSetData({
        'debugData.spoofingBufferSize': detectorStatus.bufferSize,  // 有效数据点
        'debugData.spoofingBufferTotal': detectorStatus.bufferTotalSize || 0,  // 🆕 缓冲区总长度
        'debugData.spoofingDetectionState': detectorStatus.state
      }, null, {
        priority: 'low',
        throttleKey: 'debug'
      });
    }
    // 🔧 航迹变化检测 - 用于强制更新地图
    var previousTrack = this.data.track;
    var trackChanged = false;
    var newTrack = null;
    
    // 🚀 立即更新GPS高度和速度 - 使用setData确保无延迟
    this.setData({
      altitude: altitudeValue,  // 直接使用原始值，不进行任何过滤
      speed: speedValue         // 直接使用原始值，不进行任何过滤
    });

    // 其他数据使用safeSetData进行节流更新
    this.safeSetData({
      latitude: locationData.latitudeAviation || locationData.latitude || 0,
      longitude: locationData.longitudeAviation || locationData.longitude || 0,
      // 保存原始十进制坐标用于机场计算
      latitudeDecimal: locationData.latitude || 0,
      longitudeDecimal: locationData.longitude || 0,
      lastUpdateTime: locationData.timestamp || Date.now(),
      updateCount: (this.data.updateCount || 0) + 1,
      gpsStatus: '信号正常',
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

    if (flightData.track !== undefined && flightData.track !== null) {
      // 有有效的航迹数据，格式化为整数
      var trackInt = Math.round(flightData.track);
      newTrack = trackInt;
      
      // 检测航迹是否发生变化（大于1度）
      if (previousTrack !== null && previousTrack !== undefined) {
        var trackDiff = Math.abs(trackInt - previousTrack);
        if (trackDiff > 180) trackDiff = 360 - trackDiff; // 处理跨越0度的情况
        if (trackDiff > 1) {
          trackChanged = true;
          Logger.debug('🔄 检测到航迹变化:', previousTrack + '° → ' + trackInt + '° (变化' + trackDiff + '°)');
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
            Logger.debug('🔄 静止状态检测到航迹变化:', previousTrack + '° → ' + this.data.lastValidTrack + '° (变化' + trackDiff + '°)');
          }
        }
        
        // 🚀 高优先级：保持航迹显示
        this.safeSetData({
          track: this.data.lastValidTrack
        }, null, {
          priority: 'high'
        });
        Logger.debug('🔒 静止状态，保持上次航迹:', this.data.lastValidTrack + '°');
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
              Logger.debug('🔄 指南针航向变化:', previousTrack + '° → ' + headingInt + '° (变化' + trackDiff + '°)');
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
          Logger.debug('🧭 使用指南针航向作为航迹:', headingInt + '°');
        } else {
          // 3. 完全没有方向信息时，保持当前值或使用默认北向
          if (this.data.track === 0 || this.data.track === undefined) {
            Logger.debug('⭐ 无航向数据，保持当前航迹显示');
            // 不更新track，保持当前显示值
          }
        }
      }
    }

    // 机场和地图更新已删除（ND功能移除）
  },

  /**
   * 节流位置更新以减少DOM操作频率
   */
  throttleLocationUpdate: function(locationData) {
    // 检查页面状态
    if (this._isDestroying || this.isDestroying) {
      Logger.debug('🛑 页面销毁中，忽略位置更新');
      return;
    }

    // 立即更新GPS高度和速度显示 - 无延迟
    if (locationData) {
      // 立即更新关键GPS数据（高度、速度），确保实时同步
      this.setData({
        altitude: locationData.altitude,
        speed: locationData.speed
      });
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
    }, 50, 'GPS位置更新节流'); // 减少到50ms节流，提高响应速度
  },

  /**
   * updateMapRenderer已删除（ND功能移除）
   */

  /**
   * throttleMapRendererUpdate已删除（ND功能移除）
   */

  /**
   * 计算GPS状态对应的CSS类
   * @param {String} gpsStatus GPS状态文本
   * @returns {String} CSS类名
   */
  calculateGPSStatusClass: function(gpsStatus) {
    if (!gpsStatus || typeof gpsStatus !== 'string') {
      return 'status-bad';
    }
    
    // 根据4种状态返回对应的CSS类
    switch(gpsStatus) {
      case '信号正常':
        return 'status-good';
      case '信号欺骗':
        return 'status-interference';  // 使用干扰样式（红色）
      case '未授权':
        return 'status-bad';
      case '无信号':
      default:
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
   * handleZoom已删除（ND功能移除）
   */

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
   * toggleMapOrientation已删除（ND功能移除）
   */

  /**
   * onMapTouchStart/Move/End已删除（ND功能移除）
   */

  /**
   * onTrackAirportInput已删除（ND功能移除）
   */

  /**
   * onTrackAirportConfirm已删除（ND功能移除）
   */

  /**
   * onAirportCardTap已删除（ND功能移除）
   */

  /**
   * trackAirportFromCard已删除（ND功能移除）
   */

  /**
   * clearTrackedAirport已删除（ND功能移除）
   */

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
        Logger.debug('⚙️ 设置页面返回:', res.authSetting);
        
        // 检查用户是否开启了位置权限
        if (res.authSetting['scope.userLocation']) {
          Logger.debug('✅ 用户已授权位置权限');
          
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
          Logger.debug('❌ 用户未授权位置权限');
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
    Logger.debug('🔍 开始航向问题诊断...');
    
    // 检查指南针管理器状态
    if (this.compassManager) {
      var compassStatus = this.compassManager.getStatus();
      Logger.debug('🧭 指南针管理器状态:', compassStatus);
      
      if (!compassStatus.isRunning && compassStatus.compassSupported !== false) {
        Logger.debug('⚠️ 指南针未运行且支持，尝试启动...');
        var context = this.getCurrentContext();
        this.compassManager.start(context);
      } else if (compassStatus.compassSupported === false) {
        Logger.debug('ℹ️ 设备不支持指南针，使用GPS航迹模式');
      } else {
        Logger.debug('ℹ️ 指南针正在运行');
      }
    } else {
      Logger.debug('❌ 指南针管理器不存在');
    }
    
    // 检查当前航向数据
    Logger.debug('📊 当前航向数据:', {
      heading: this.data.heading,
      lastStableHeading: this.data.lastStableHeading,
      headingMode: this.data.headingMode,
      track: this.data.track,
      speed: this.data.speed
    });
    
    // 检查航向缓冲区
    Logger.debug('📊 航向缓冲区:', this.data.headingBuffer);
    
    return {
      compassRunning: this.compassManager ? this.compassManager.getStatus().isRunning : false,
      currentHeading: this.data.heading,
      hasBuffer: this.data.headingBuffer && this.data.headingBuffer.length > 0
    };
  },

  /**
   * diagnoseCanvasState已删除（ND功能移除）
   */

  /**
   * forceMapStateRecovery已删除（ND功能移除）
   */

  /**
   * validateAndFixMapState已删除（ND功能移除）
   */

  /**
   * ===== 新的生命周期管理方法 =====
   */
  
  /**
   * 初始化生命周期管理器
   */
  initializeLifecycleManager: function() {
    // 🚨 强制使用传统初始化模式
    Logger.debug('🚨 使用传统初始化模式');
    this.fallbackToLegacyMode();
  },

  /**
   * 回退到传统启动模式
   */
  fallbackToLegacyMode: function() {
    Logger.debug('🔄 回退到传统模块管理模式');

    // 先销毁生命周期管理器（如果存在）
    if (this.lifecycleManager) {
      Logger.debug('🔧 正在销毁生命周期管理器...');
      try {
        this.lifecycleManager.destroyAll().catch(function(error) {
          Logger.warn('⚠️ 生命周期管理器销毁失败:', error);
        });
      } catch (e) {
        Logger.warn('⚠️ 生命周期管理器销毁异常:', e);
      }
      this.lifecycleManager = null;
    }

    // 立即执行模块初始化 - 这是最重要的！
    try {
      Logger.debug('🔧 准备调用 initializeModules...');
      this.initializeModules();
      Logger.debug('🔧 initializeModules 调用完成');
      this.startServices();
      Logger.debug('🔧 startServices 调用完成');

    } catch (error) {
      Logger.error('🔴 传统模式初始化失败:', error);
      Logger.error('🔴 错误堆栈:', error.stack);

      // 即使出错也尝试初始化姿态仪
      if (this.data.showAttitudeIndicator) {
        Logger.debug('🚨 尝试单独初始化姿态仪...');
        try {
          this.initAttitudeIndicator();
          Logger.debug('✅ 姿态仪单独初始化成功');
        } catch (e) {
          Logger.error('❌ 姿态仪单独初始化也失败:', e);
        }
      }

      this.handleError(error, '姿态仪初始化');
    }

    // 🔧 修复：分阶段启动所有传感器（解决启动冲突）
    var self = this;
    Logger.debug('🚀 开始分阶段启动传感器（传统模式）');

    // 第1阶段：启动陀螺仪（500ms延迟）
    setTimeout(function() {
      if (self.gyroscopeManager) {
        Logger.debug('🌀 启动陀螺仪管理器（传统模式第1阶段）');
        var context = self.getCurrentContext();
        self.gyroscopeManager.start(context);
      }
    }, 500);

    // 第2阶段：启动加速度计（800ms延迟）
    setTimeout(function() {
      if (self.accelerometerManager) {
        Logger.debug('⚡ 启动加速度计管理器（传统模式第2阶段）');
        var context = self.getCurrentContext();
        self.accelerometerManager.start(context);
      }
    }, 800);

    // 第3阶段：启动指南针（1200ms延迟，确保其他传感器先启动）
    setTimeout(function() {
      if (self.compassManager) {
        Logger.debug('🧭 启动指南针管理器（传统模式第3阶段，三传感器融合）');
        var context = self.getCurrentContext();
        self.compassManager.start(context);
      }
    }, 1200);
  },

  /**
   * 记录系统健康状况
   */
  logSystemHealth: function() {
    if (!this.lifecycleManager) return;
    
    var health = this.lifecycleManager.getSystemHealth();
    Logger.debug('🏥 驾驶舱系统健康报告:', {
      '总体状态': health.overallStatus,
      '模块总数': health.moduleCount,
      '运行模块': health.runningModules,
      '错误模块': health.errorModules,
      '当前阶段': health.phases.current + '/' + health.phases.total
    });
    
    // 详细模块状态（调试模式下）
    if (config.global && config.global.debugMode) {
      Logger.debug('📊 详细模块状态:');
      for (var moduleName in health.modules) {
        var moduleHealth = health.modules[moduleName];
        Logger.debug(moduleName + ':', {
          '状态': moduleHealth.state,
          '健康': moduleHealth.isHealthy ? '✅' : '❌',
          '重试次数': moduleHealth.retryCount,
          '最后错误': moduleHealth.lastError || '无'
        });
      }
      // Logger.debug('详细模块状态结束');
    }
    
    return health;
  },

  /**
   * 手动触发系统健康检查（调试用）
   */
  triggerHealthCheck: function() {
    if (!this.lifecycleManager) {
      Logger.warn('⚠️ 生命周期管理器不可用');
      return;
    }
    
    Logger.debug('🔍 手动触发系统健康检查...');
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
      Logger.warn('⚠️ 生命周期管理器不可用');
      return Promise.reject(new Error('生命周期管理器不可用'));
    }
    
    if (!moduleName) {
      Logger.warn('⚠️ 请指定要重启的模块名');
      return Promise.reject(new Error('模块名不能为空'));
    }
    
    Logger.debug('🔄 手动重启模块:', moduleName);
    
    return this.lifecycleManager.restartModule(moduleName)
      .then(function() {
        Logger.debug('✅ 模块重启成功:', moduleName);
        wx.showToast({
          title: '模块 ' + moduleName + ' 重启成功',
          icon: 'success',
          duration: 2000
        });
      })
      .catch(function(error) {
        Logger.error('🔴 模块重启失败:', moduleName, error);
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
      Logger.warn('⚠️ 生命周期管理器不可用');
      return [];
    }
    
    var health = this.lifecycleManager.getSystemHealth();
    var errors = health.errors || [];
    
    Logger.debug('📝 系统错误历史 (最近10条):', errors.slice(-10));
    
    return errors;
  },

  /**
   * 处理GPS权限授予（精简版）
   */
  handleGPSPermissionGranted: function() {
    this.safeSetData({
      hasLocationPermission: true,
      locationError: null,
      showGPSWarning: false,
      gpsStatus: '权限已授予'
      // mapRange设置已删除（ND功能移除）
    });
  },

  /**
   * 处理GPS位置错误（精简版）
   */
  handleGPSLocationError: function(errorMsg) {
    if (errorMsg !== null) {
      Logger.debug('🔧 GPS位置错误:', errorMsg);
      // ⚠️ 高优先级：位置错误是关键信息
      this.safeSetData({ locationError: errorMsg }, null, {
        priority: 'high'
      });
    } else {
      Logger.debug('🔧 清除GPS位置错误状态');
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
      Logger.debug('🗑️ 使用生命周期管理器销毁所有模块');
      
      this._isDestroying = true;
      
      // 先停止健康监控
      this.lifecycleManager.stopHealthMonitoring()
        .then(function() {
          Logger.debug('✅ 健康监控系统已停止');
        })
        .catch(function(error) {
          Logger.warn('⚠️ 停止健康监控失败:', error);
        });
      
      // 然后销毁所有模块
      this.lifecycleManager.destroyAll()
        .then(function() {
          Logger.debug('✅ 生命周期管理器销毁完成');
        })
        .catch(function(error) {
          Logger.error('🔴 生命周期管理器销毁失败:', error);
        });
      
      this.lifecycleManager = null;
      return;
    }
    
    // 传统销毁方式（备用）
    Logger.debug('🗑️ 使用传统方式销毁所有模块');
    
    // 设置销毁标志，防止异步setData调用
    this.isDestroyed = true;
    if (this.flightCalculator) {
      // 飞行计算器是纯函数模块，无需销毁
      this.flightCalculator = null;
    }

    // AirportManager销毁已删除（ND功能移除）

    if (this.gpsManager) {
      this.gpsManager.destroy();
      this.gpsManager = null;
    }

    if (this.compassManager) {
      this.compassManager.destroy();
      this.compassManager = null;
    }

    // MapRenderer销毁已删除（ND功能移除）

    // GestureHandler销毁已删除（ND功能移除）

    // 姿态仪现在独立管理，无需手动清理
    
    // 卡尔曼滤波器已移除，使用简化滤波器
    
    if (this.toastManager) {
      this.toastManager.clearAll();
      this.toastManager = null;
    }
    
    Logger.debug('所有模块已销毁');
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
        Logger.debug('🧹 清理定时器:', timerName);
      }
    }
    
    // 清理pending数据
    if (this.pendingLocationData) {
      this.pendingLocationData = null;
      Logger.debug('🧹 清理pending位置数据');
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
   * 初始化姿态仪 - 立即初始化，不延迟
   */
  initAttitudeIndicator: function() {
    var self = this;

    try {
      console.log('🎯 开始初始化姿态仪');
      Logger.debug('🎯 开始初始化姿态仪');

      // 检查模块是否可用
      if (!AttitudeIndicator) {
        throw new Error('AttitudeIndicator模块未定义');
      }

      if (!AttitudeIndicator.create) {
        throw new Error('AttitudeIndicator.create方法不存在');
      }

      // 立即创建姿态仪实例
      self.attitudeIndicator = AttitudeIndicator.create('attitudeIndicator', undefined, {
        onStateChange: function(state) {
          console.log('✈️ 姿态仪状态变化:', state);
          Logger.debug('✈️ 姿态仪状态变化:', state);
        },
        onDataUpdate: function(data) {
          // 更新页面data，让WXML能显示实时的PITCH和ROLL数值
          if (self.safeSetData) {
            self.safeSetData({
              pitch: -data.pitch,  // 修正显示数值的符号
              roll: data.roll
            }, {
              priority: 'low',
              throttleKey: 'attitude-text',
              throttleMs: 33
            });
          }
        },
        onError: function(error) {
          console.error('❌ 姿态仪错误:', error);
          Logger.error('❌ 姿态仪错误:', error);
        },
        onLayoutUpdate: function(layoutParams) {
          // 应用布局参数（如果需要）
          Logger.debug('📐 姿态仪布局更新:', layoutParams);
        }
      });

      if (self.attitudeIndicator) {
        console.log('✅ 姿态仪实例创建成功');
        Logger.debug('✅ 姿态仪初始化完成');

        // 🚀 重要：延迟启动传感器，确保Canvas先初始化
        console.log('⏰ 延迟500ms启动传感器，等待Canvas初始化...');

        setTimeout(function() {
          console.log('🚀 开始启动姿态仪传感器...');

          // 🎯 注意：不需要再调用init，因为create方法内部已经调用了init
          // AttitudeIndicator.create内部会调用init('attitudeIndicator', config, callbacks)

          if (!self.attitudeIndicator) {
            console.error('❌ 姿态仪实例已被销毁');
            return;
          }

          // 启动真实传感器
          if (self.attitudeIndicator.startRealSensor) {
            console.log('📍 调用 startRealSensor 方法');
            self.attitudeIndicator.startRealSensor();
          } else if (self.attitudeIndicator.start) {
            console.log('📍 调用 start 方法');
            self.attitudeIndicator.start();
          }

          console.log('✅ 姿态仪传感器启动命令已发送');

          // 检查状态
          if (self.attitudeIndicator.getStatus) {
            var status = self.attitudeIndicator.getStatus();
            console.log('📊 姿态仪当前状态:', status);
          }
        }, 500); // 增加延迟时间到500ms，确保Canvas完全就绪

      } else {
        throw new Error('姿态仪实例创建失败');
      }
    } catch (error) {
      console.error('❌ 姿态仪初始化异常:', error);
      console.error('错误堆栈:', error.stack);
      Logger.error('❌ 姿态仪初始化异常:', error);
      Logger.error('错误堆栈:', error.stack);
    }
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
        
        Logger.debug('🔄 强制刷新姿态仪结果:', result);
        
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
        
        Logger.error('❌ 强制刷新执行出错:', error);
        
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
    var self = this;

    wx.showModal({
      title: '清除缓存',
      content: '确定要清除机场数据缓存和位置历史记录吗？',
      success: function(res) {
        if (res.confirm) {
          // 清除机场缓存
          var success = simpleAirportManager.clearCache();

          // 🔧 修复：同时清除位置历史记录，让GPS数据快速生效
          self.data.locationHistory = [];
          Logger.info('✅ 位置历史记录已清除');

          wx.showToast({
            title: success ? '缓存已清除' : '清除失败',
            icon: success ? 'success' : 'error'
          });
        }
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
        Logger.debug('✅ 用户选择位置成功:', res);
        
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
        Logger.error('❌ 用户选择位置失败:', error);
        
        if (error.errMsg === 'chooseLocation:fail cancel') {
          // 用户取消选择，不显示错误
          Logger.debug('用户取消了位置选择');
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
    Logger.debug('处理选择的位置:', locationData);
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
    Logger.debug('🧪 测试wx.getLocation API');
    
    wx.getLocation({
      type: config.gps.coordinateSystem,
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 5000,
      success: function(res) {
        Logger.debug('✅ getLocation成功:', res);
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
        Logger.error('❌ getLocation失败:', err);
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
    Logger.debug('🧪 测试wx.chooseLocation API');
    
    wx.chooseLocation({
      latitude: this.data.latitude || 39.9042,
      longitude: this.data.longitude || 116.4074,
      success: function(res) {
        Logger.debug('✅ chooseLocation成功:', res);
        wx.showToast({
          title: '位置选择成功: ' + res.name,
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(err) {
        Logger.error('❌ chooseLocation失败:', err);
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
      Logger.debug('📡 退出离线模式');
      
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
      Logger.debug('🌐 进入离线模式');
      
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
    Logger.debug('🧪 测试启动持续定位');
    
    wx.startLocationUpdate({
      type: config.gps.coordinateSystem,
      success: function() {
        Logger.debug('✅ startLocationUpdate成功');
        self.safeSetData({
          locationUpdateActive: true
        });
        
        // 开始监听位置变化
        wx.onLocationChange(function(res) {
          Logger.debug('📍 onLocationChange:', res);
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
        Logger.error('❌ startLocationUpdate失败:', err);
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
    Logger.debug('🧪 停止持续定位');
    
    wx.stopLocationUpdate({
      success: function() {
        Logger.debug('✅ stopLocationUpdate成功');
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
   * showRangeSelector已删除（ND功能移除）
   */

  /**
   * onRangeSelectorClose已删除（ND功能移除）
   */

  /**
   * onRangeSelect已删除（ND功能移除）
   */

  // ==================== GPS欺骗检测相关方法 ====================

  /**
   * 初始化GPS欺骗检测系统
   */
  initializeSpoofingDetection: function() {
    var self = this;
    
    Logger.debug('🛡️ 初始化GPS欺骗检测系统');
    
    // 创建GPS欺骗检测器
    this.spoofingDetector = GPSSpoofingDetector.create(config);
    this.spoofingDetector.init({
      onStateChange: function(newState, previousState) {
        Logger.debug('🛡️ GPS欺骗检测状态变化:', previousState, '->', newState);
        self.handleSpoofingStateChange(newState);
      },
      onPlayVoiceAlert: function(onComplete) {
        self.playGPSSpoofingAlert(onComplete);
      }
    });
    
    // 创建音频管理器
    this.audioManager = AudioManager.create();
    this.audioManager.init({
      onPlayError: function(errorMsg) {
        Logger.error('🔊 音频播放错误:', errorMsg);
        self.toastManager && self.toastManager.showSmartToast('audio', '音频播放失败', {icon: 'error'});
      }
    });
    
    // 加载用户配置
    this.loadSpoofingConfig();
    
    Logger.debug('✅ GPS欺骗检测系统初始化完成');
  },

  /**
   * 加载GPS欺骗检测配置
   */
  loadSpoofingConfig: function() {
    try {
      var savedConfig = wx.getStorageSync('gps_spoofing_config');
      if (savedConfig) {
        // 🔧 修复：GPS欺骗监控默认关闭，不从本地存储恢复enabled状态
        // 只恢复语音警告开关的设置
        this.safeSetData({
          spoofingDetectionEnabled: false,  // 强制默认关闭
          voiceAlertEnabled: savedConfig.voiceAlertEnabled !== false,
        });

        // 🔧 修复: 同步更新检测器配置,确保检测器内部状态与页面一致
        if (this.spoofingDetector) {
          this.spoofingDetector.setConfig('enabled', false);  // 强制默认关闭
          this.spoofingDetector.setConfig('voiceAlertEnabled', savedConfig.voiceAlertEnabled !== false);
          Logger.debug('🔧 GPS欺骗检测器配置已同步（默认关闭）:', {
            enabled: false,
            voiceAlertEnabled: savedConfig.voiceAlertEnabled !== false
          });
        }

        Logger.debug('✅ GPS欺骗配置已加载（监控默认关闭）:', savedConfig);
      }
    } catch (e) {
      Logger.error('加载GPS欺骗配置失败:', e);
    }
  },

  /**
   * 处理GPS欺骗状态变化
   * @param {String} newState 新状态
   */
  handleSpoofingStateChange: function(newState) {
    var self = this;
    
    switch (newState) {
      case 'SPOOFING':
        this.safeSetData({
          gpsSpoofing: true,
          gpsStatus: '信号欺骗',  // 更新GPS状态为信号欺骗
          gpsStatusClass: 'status-interference',
          firstSpoofingTime: this.spoofingDetector.getStatus().firstSpoofingTime
        });
        
        // 只在首次检测到时显示Toast提示
        if (this.toastManager) {
          this.toastManager.showSmartToast('gps_spoofing', '🚨 检测到GPS欺骗信号', {icon: 'error', duration: 5000});
        }
        break;
        
      case 'SPOOFING_SILENT':
        // 静默欺骗状态：更新显示但不触发Toast和语音
        this.safeSetData({
          gpsSpoofing: true,
          gpsStatus: '信号欺骗',
          gpsStatusClass: 'status-interference'
        });
        // 不显示Toast，不播放语音
        Logger.debug('🔇 GPS欺骗（静默模式）');
        break;
        
      case 'NORMAL':
        this.safeSetData({
          gpsSpoofing: false,
          firstSpoofingTime: null
        });
        
        // 从COOLDOWN恢复正常时不显示Toast
        // 只有从SPOOFING直接恢复才显示
        break;
        
      case 'COOLDOWN':
        // 冷却期：GPS恢复正常但仍在监控期
        this.safeSetData({
          gpsSpoofing: false,
          firstSpoofingTime: null
        });
        Logger.debug('⏱️ GPS欺骗冷却期（10分钟）');
        break;
    }
  },

  /**
   * 播放GPS欺骗语音警告
   * @param {Function} onComplete 播放完成回调
   */
  playGPSSpoofingAlert: function(onComplete) {
    if (!this.audioManager || !this.data.voiceAlertEnabled) {
      if (onComplete) onComplete(false);
      return;
    }
    
    var audioPath = config.gps.spoofingDetection.voice.audioPath;
    Logger.debug('🔊 播放GPS欺骗语音警告:', audioPath);
    
    this.audioManager.playGPSSpoofingAlert(audioPath, function(success) {
      if (success) {
        Logger.debug('🔊 GPS欺骗语音警告播放成功');
      } else {
        Logger.error('🔊 GPS欺骗语音警告播放失败');
      }
      
      if (onComplete) onComplete(success);
    });
  },



  /**
   * GPS欺骗检测开关切换
   * @param {Object} e 事件对象
   */
  onSpoofingDetectionToggle: function(e) {
    var enabled = e.detail.value;  // 注意：switch组件的值在 e.detail.value 中
    var self = this;

    Logger.debug('🔀 GPS欺骗监控开关切换:', enabled);

    // 如果是开启操作，显示确认弹窗
    if (enabled) {
      // 🎯 立即重置switch状态，等待用户确认
      this.safeSetData({
        spoofingDetectionEnabled: false
      });

      wx.showModal({
        title: 'GPS欺骗监控',
        content: '⚠️ 此功能仅适用于空中飞行状态\n\n在地面时请勿开启，以免误报。\n\n是否同时开启声音提醒？',
        confirmText: '开启声音',
        cancelText: '静音开启',
        success: function(res) {
          if (res.confirm || res.cancel) {
            // ✅ 用户确认后才真正开启
            var voiceEnabled = res.confirm; // confirm=开启声音，cancel=静音开启

            self.safeSetData({
              spoofingDetectionEnabled: true,
              voiceAlertEnabled: voiceEnabled
            });

            if (self.spoofingDetector) {
              self.spoofingDetector.setConfig('enabled', true);
              self.spoofingDetector.setConfig('voiceAlertEnabled', voiceEnabled);

              Logger.debug('🛡️ GPS欺骗监控已启用' + (voiceEnabled ? '（声音提醒已开启）' : '（静音模式）'));
              self.toastManager && self.toastManager.showSmartToast(
                'gps_spoofing',
                'GPS欺骗监控已启用' + (voiceEnabled ? '（声音提醒）' : '（静音模式）'),
                {icon: 'success'}
              );
            }

            // 保存配置
            self.saveSpoofingConfig();
          }
          // 如果用户点击空白取消，状态已经是false，无需再次设置
        }
      });
    } else {
      // 关闭操作，直接执行
      this.safeSetData({
        spoofingDetectionEnabled: false
      });

      if (this.spoofingDetector) {
        this.spoofingDetector.setConfig('enabled', false);

        Logger.debug('🛡️ GPS欺骗监控已关闭');
        this.toastManager && this.toastManager.showSmartToast('gps_spoofing', 'GPS欺骗监控已关闭', {icon: 'none'});

        // 重置状态
        this.safeSetData({
          gpsSpoofing: false,
          firstSpoofingTime: null
        });

        if (this.spoofingDetector) {
          this.spoofingDetector.reset();
        }
      }

      // 保存配置
      this.saveSpoofingConfig();
    }
  },

  /**
   * GPS欺骗模式切换按钮
   * @param {Object} e 事件对象
   */
  onModeToggle: function(e) {
    var mode = e.currentTarget.dataset.mode;
    
    this.safeSetData({
      spoofingMode: mode
    });
    
    if (this.spoofingDetector) {
      this.spoofingDetector.setConfig('mode', mode);
      Logger.debug('🛡️ GPS欺骗检测模式切换为:', mode);
    }
    
    // 如果切换到地面模式且当前标高为空，自动获取最近机场标高
    if (mode === 'ground' && (!this.data.currentElevation || this.data.currentElevation == 0)) {
      this.getNearestAirportElevation();
    }
  },


  /**
   * 语音警告开关切换
   * @param {Object} e 事件对象
   */
  onVoiceAlertToggle: function(e) {
    var enabled = e.detail;
    
    this.safeSetData({
      voiceAlertEnabled: enabled
    });
    
    if (this.spoofingDetector) {
      this.spoofingDetector.setConfig('voiceAlertEnabled', enabled);
      Logger.debug('🔊 GPS欺骗语音警告:', enabled ? '已启用' : '已禁用');
    }
  },

  /**
   * 标高输入变化
   * @param {Object} e 事件对象
   */
  onElevationChange: function(e) {
    var elevation = parseInt(e.detail.value) || 0;
    
    this.safeSetData({
      currentElevation: elevation
    });
    
    if (this.spoofingDetector) {
      this.spoofingDetector.setConfig('ground.userElevation', elevation);
      Logger.debug('✈️ 机场标高设置为:', elevation, 'ft');
    }
  },

  /**
   * 获取最近机场标高
   */
  getNearestAirportElevation: function() {
    var self = this;
    
    if (!this.data.latitudeDecimal || !this.data.longitudeDecimal) {
      this.toastManager && this.toastManager.showSmartToast('gps', 'GPS位置不可用', {icon: 'error'});
      return;
    }

    this.safeSetData({
      loadingNearestElevation: true
    });

    // 使用机场管理器获取最近机场（功能已禁用 - AirportManager已删除）
    // TODO: 如需重新启用此功能，需要创建独立的机场数据加载器（不依赖ND）
    this.safeSetData({
      loadingNearestElevation: false
    });
    this.toastManager && this.toastManager.showSmartToast('airport', '机场标高查询功能暂时禁用', {icon: 'none'});
    Logger.warn('⚠️ 机场标高查询功能需要AirportManager（已删除ND功能）');
  },

  /**
   * 保存GPS欺骗配置
   */
  saveSpoofingConfig: function() {
    var config = {
      enabled: this.data.spoofingDetectionEnabled,
      voiceAlertEnabled: this.data.voiceAlertEnabled
    };
    
    try {
      wx.setStorageSync('gps_spoofing_config', config);
      Logger.debug('✅ GPS欺骗配置已保存:', config);
    } catch (e) {
      Logger.error('保存GPS欺骗配置失败:', e);
    }
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation: function(e) {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
  },

  /**
   * 姿态仪初始按钮 - 清空所有校准值，使用原始传感器数据
   */
  onAttitudeInitialTap: function() {
    Logger.debug('🔄 姿态仪初始按钮被点击');
    
    if (this.attitudeIndicator && this.attitudeIndicator.resetCalibration) {
      // 清空所有校准偏移量
      this.attitudeIndicator.resetCalibration();
      
      // 清除本地存储的校准数据
      try {
        wx.removeStorageSync('attitude_calibration');
        Logger.debug('🗑️ 已清除本地校准数据');
      } catch (e) {
        Logger.error('清除校准数据失败:', e);
      }
      
      // 显示成功提示
      this.toastManager && this.toastManager.showSmartToast(
        'attitude', 
        '已恢复初始状态，使用原始传感器值', 
        {icon: 'success'}
      );
      
      Logger.debug('✅ 姿态仪已恢复初始状态，直接显示原始传感器数据');
    } else {
      Logger.warn('❌ 姿态仪模块未初始化');
      this.toastManager && this.toastManager.showSmartToast(
        'attitude', 
        '姿态仪未就绪', 
        {icon: 'error'}
      );
    }
  },
  
  /**
   * 姿态仪默认按钮 - 回到最初状态（保留用于兼容）
   */
  onAttitudeDefaultTap: function() {
    // 调用初始按钮的功能
    this.onAttitudeInitialTap();
  },

  /**
   * 姿态仪重置按钮 - 重置所有数据
   */
  onAttitudeResetTap: function() {
    Logger.debug('🔄 姿态仪重置按钮被点击');
    
    if (this.attitudeIndicator && this.attitudeIndicator.resetCalibration) {
      // 重置校准偏移量
      this.attitudeIndicator.resetCalibration();
      
      // 重置显示数据
      this.setData({
        pitch: 0,
        roll: 0,
        calibrationStatus: 'normal',
        calibrationProgress: 0
      });
      
      // 显示提示
      this.toastManager && this.toastManager.showSmartToast(
        'attitude', 
        '姿态仪已重置',
        {icon: 'success'}
      );
      
      Logger.debug('✅ 姿态仪已完全重置');
    } else {
      Logger.warn('❌ 姿态仪模块未初始化');
      this.toastManager && this.toastManager.showSmartToast(
        'attitude', 
        '姿态仪未就绪', 
        {icon: 'error'}
      );
    }
  },
  
  /**
   * 姿态仪校准按钮 - 将当前姿态作为新的零点基准
   */
  onAttitudeCalibrateTap: function() {
    Logger.debug('🎯 姿态仪校准按钮被点击');
    
    if (this.attitudeIndicator && this.attitudeIndicator.calibrateWithCurrent) {
      // 获取当前显示的pitch和roll值（仅用于日志）
      var currentPitch = this.data.pitch || 0;
      var currentRoll = this.data.roll || 0;
      
      Logger.debug('📐 校准前显示值 - Pitch:', currentPitch, '°, Roll:', currentRoll, '°');
      
      // 执行校准（内部会使用原始传感器值）
      var result = this.attitudeIndicator.calibrateWithCurrent(currentPitch, currentRoll);
      
      // 保存校准后的偏移值到本地存储
      try {
        var calibrationResult = this.attitudeIndicator.getCalibrationStatus();
        wx.setStorageSync('attitude_calibration', {
          pitchOffset: calibrationResult.pitchOffset,
          rollOffset: calibrationResult.rollOffset,
          calibrationTime: Date.now(),
          isValid: true  // 添加isValid标志
        });
        Logger.debug('💾 校准偏移值已保存 - Pitch:', calibrationResult.pitchOffset, 
                    '°, Roll:', calibrationResult.rollOffset, '°');
      } catch (e) {
        Logger.error('❌ 保存校准数据失败:', e);
      }
      
      // 立即更新显示为0/0
      this.setData({
        pitch: 0,
        roll: 0,
        calibrationStatus: 'success',
        calibrationProgress: '校准成功'
      });
      
      // 显示成功提示
      this.toastManager && this.toastManager.showSmartToast(
        'attitude', 
        '姿态仪校准成功',
        {icon: 'success'}
      );
      
      // 3秒后恢复正常状态显示
      var self = this;
      setTimeout(function() {
        self.setData({
          calibrationStatus: 'normal',
          calibrationProgress: 0
        });
      }, 3000);
      
      Logger.debug('✅ 姿态仪校准完成，新零点已设置');
    } else {
      Logger.warn('❌ 姿态仪模块未初始化');
      this.toastManager && this.toastManager.showSmartToast(
        'attitude', 
        '姿态仪未就绪', 
        {icon: 'error'}
      );
    }
  },

  // === 🎬 插屏广告相关方法 ===

  /**
   * 创建插屏广告实例（使用ad-helper统一管理）
   */
  createInterstitialAd: function() {
    this.data.interstitialAd = adHelper.setupInterstitialAd(this, '驾驶舱');
  },

  /**
   * 显示插屏广告（使用智能策略）
   * TabBar切换优化：2分钟间隔，每日最多20次，驾驶舱也展示
   */
  showInterstitialAdWithControl: function() {
    // 获取当前页面路径
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    var route = currentPage.route || '';

    // 使用智能策略展示广告
    adHelper.showInterstitialAdWithStrategy(
      this.data.interstitialAd,
      route,  // 当前页面路径
      this,   // 页面上下文
      '驾驶舱'
    );
  },

  /**
   * 销毁插屏广告实例（使用ad-helper统一管理）
   */
  destroyInterstitialAd: function() {
    adHelper.cleanupInterstitialAd(this, '驾驶舱');
  },

  // 转发功能
  onShareAppMessage: function() {
    return {
      title: '飞行工具箱 - 驾驶舱',
      desc: '专业GPS导航工具，支持机场导航、姿态仪表、实时位置追踪',
      path: '/pages/cockpit/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '飞行驾驶舱导航工具',
      path: '/pages/cockpit/index'
    };
  }

};

Page(BasePage.createPage(pageConfig));