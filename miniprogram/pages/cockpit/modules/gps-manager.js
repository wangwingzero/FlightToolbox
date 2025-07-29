/**
 * GPS位置追踪管理器模块
 * 
 * 提供GPS位置追踪和管理功能，包括：
 * - 位置权限检查和请求
 * - GPS位置追踪启动停止
 * - 位置数据处理和验证
 * - GPS状态监控和干扰检测
 * - 网络状态检查和离线模式
 * - 模拟模式支持
 * 
 * 设计原则：
 * - 微信API调用封装，统一错误处理
 * - 状态通过回调同步主页面
 * - 支持离线和模拟模式
 * - 定时器资源正确管理
 */

var ToastManager = require('./toast-manager.js');

var GPSManager = {
  /**
   * 创建GPS管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 内部状态
      callbacks: null,
      calculatorRef: null, // flight-calculator实例引用
      kalmanRef: null,     // kalman-filter实例引用
      toastManager: ToastManager.create(config), // Toast管理器
      updateTimer: null,
      statusTimer: null,
      interferenceTimer: null,
      initTimeoutTimer: null, // 🔧 新增：初始化超时定时器
      isRunning: false,
      initStartTime: null, // 🔧 新增：初始化开始时间
      
      // 🔧 优化：时间间隔过滤状态
      lastLocationTime: 0,        // 上次位置更新时间
      lastProcessTime: 0,         // 上次处理时间
      currentUpdateInterval: config.gps.locationUpdateInterval, // 动态更新间隔
      consecutiveGoodUpdates: 0,  // 连续良好更新次数
      debounceTimer: null,        // 防抖定时器
      pendingUpdate: null,        // 待处理的更新数据
      
      /**
       * 初始化管理器
       * @param {Object} page 页面实例
       * @param {Object} callbacks 回调函数集合
       * @param {Object} calculator flight-calculator实例
       * @param {Object} kalmanFilter kalman-filter实例 (可选)
       */
      init: function(page, callbacks, calculator, kalmanFilter) {
        manager.pageRef = page;
        manager.callbacks = callbacks || {};
        manager.calculatorRef = calculator;
        manager.kalmanRef = kalmanFilter;
        
        // 如果启用卡尔曼滤波，设置相关回调
        if (manager.kalmanRef && config.kalman && config.kalman.enabled) {
          console.log('GPS管理器：启用卡尔曼滤波数据融合');
        }
      },
      
      /**
       * 🔧 优化：智能时间间隔过滤
       * @param {Object} locationData 位置数据
       * @returns {Boolean} 是否应该处理此次更新
       */
      shouldProcessLocationUpdate: function(locationData) {
        var self = manager;
        var now = Date.now();
        
        // 基础时间间隔检查
        var timeSinceLastUpdate = now - self.lastLocationTime;
        var minInterval = config.gps.minLocationInterval * 1000; // 转换为毫秒
        
        // 如果时间间隔太短，跳过处理
        if (timeSinceLastUpdate < minInterval) {
          console.log('⏰ GPS更新间隔过短，跳过处理:', timeSinceLastUpdate + 'ms');
          return false;
        }
        
        // 根据飞行状态动态调整最小间隔
        var dynamicMinInterval = self.calculateDynamicInterval(locationData);
        
        if (timeSinceLastUpdate < dynamicMinInterval) {
          console.log('⏰ 动态间隔检查未通过:', timeSinceLastUpdate + 'ms < ' + dynamicMinInterval + 'ms');
          return false;
        }
        
        // 位置变化检查（避免处理相同位置）
        if (self.callbacks.getCurrentContext) {
          var context = self.callbacks.getCurrentContext();
          var lastPosition = context.lastValidPosition;
          
          if (lastPosition && locationData.latitude && locationData.longitude) {
            var distance = self.calculateDistance(
              lastPosition.latitude, lastPosition.longitude,
              locationData.latitude, locationData.longitude
            );
            
            // 如果位置变化很小且速度很低，延长间隔
            if (distance < 5 && (locationData.speed || 0) < config.gps.staticSpeedThreshold) {
              if (timeSinceLastUpdate < dynamicMinInterval * 2) {
                console.log('🚁 静止状态，延长更新间隔:', distance + 'm移动');
                return false;
              }
            }
          }
        }
        
        return true;
      },
      
      /**
       * 🔧 优化：计算动态更新间隔
       * @param {Object} locationData 位置数据
       * @returns {Number} 动态间隔（毫秒）
       */
      calculateDynamicInterval: function(locationData) {
        var baseInterval = config.gps.minLocationInterval * 1000;
        var speed = locationData.speed || 0;
        var accuracy = locationData.accuracy || 999;
        
        // 根据速度调整间隔
        if (speed < config.gps.staticSpeedThreshold) {
          // 静止或低速状态：延长间隔
          return baseInterval * 3; // 3倍基础间隔
        } else if (speed > 100) {
          // 高速状态：缩短间隔
          return baseInterval * 0.5; // 0.5倍基础间隔
        }
        
        // 根据GPS精度调整间隔
        if (accuracy > config.gps.accuracyThreshold) {
          // GPS精度差：延长间隔
          return baseInterval * 2;
        } else if (accuracy < 10) {
          // GPS精度好：缩短间隔
          return baseInterval * 0.8;
        }
        
        return baseInterval;
      },
      
      /**
       * 🔧 优化：防抖处理GPS更新
       * @param {Object} locationData 位置数据
       */
      debounceLocationUpdate: function(locationData) {
        var self = manager;
        
        // 清除之前的防抖定时器
        if (self.debounceTimer) {
          clearTimeout(self.debounceTimer);
        }
        
        // 保存最新的更新数据
        self.pendingUpdate = locationData;
        
        // 设置防抖延迟
        var debounceDelay = self.calculateDebounceDelay(locationData);
        
        self.debounceTimer = setTimeout(function() {
          if (self.pendingUpdate) {
            console.log('📡 防抖延迟后处理GPS更新');
            self.processLocationUpdateImmediate(self.pendingUpdate);
            self.pendingUpdate = null;
          }
        }, debounceDelay);
      },
      
      /**
       * 🔧 优化：计算防抖延迟
       * @param {Object} locationData 位置数据
       * @returns {Number} 防抖延迟（毫秒）
       */
      calculateDebounceDelay: function(locationData) {
        var speed = locationData.speed || 0;
        var accuracy = locationData.accuracy || 999;
        
        // 高速或高精度时减少延迟
        if (speed > 50 || accuracy < 10) {
          return 100; // 100ms延迟
        } else if (speed < config.gps.staticSpeedThreshold) {
          return 500; // 静止时500ms延迟
        }
        
        return 200; // 默认200ms延迟
      },
      
      /**
       * 🔧 优化：立即处理位置更新（跳过所有过滤）
       * @param {Object} locationData 位置数据
       */
      processLocationUpdateImmediate: function(locationData) {
        var self = manager;
        var now = Date.now();
        
        // 更新时间记录
        self.lastLocationTime = now;
        self.lastProcessTime = now;
        
        // 统计连续良好更新
        if (locationData.accuracy && locationData.accuracy < config.gps.accuracyThreshold) {
          self.consecutiveGoodUpdates++;
        } else {
          self.consecutiveGoodUpdates = 0;
        }
        
        // 动态调整更新间隔
        self.adjustUpdateInterval();
        
        // 处理实际的位置更新
        self.handleLocationUpdate(locationData);
      },
      
      /**
       * 🔧 优化：动态调整GPS更新间隔
       */
      adjustUpdateInterval: function() {
        var self = manager;
        var oldInterval = self.currentUpdateInterval;
        
        // 根据连续良好更新次数调整间隔
        if (self.consecutiveGoodUpdates > 10) {
          // 连续良好更新，可以延长间隔节省电量
          self.currentUpdateInterval = Math.min(
            self.currentUpdateInterval * 1.1,
            config.gps.locationUpdateInterval * 2
          );
        } else if (self.consecutiveGoodUpdates < 3) {
          // 更新质量不佳，缩短间隔提高响应性
          self.currentUpdateInterval = Math.max(
            self.currentUpdateInterval * 0.9,
            config.gps.locationUpdateInterval * 0.5
          );
        }
        
        // 重新设置定时器（如果间隔变化超过500ms）
        if (Math.abs(self.currentUpdateInterval - oldInterval) > 500 && self.updateTimer) {
          clearInterval(self.updateTimer);
          self.restartUpdateTimer();
          
          console.log('📡 动态调整GPS更新间隔:', oldInterval + 'ms → ' + self.currentUpdateInterval + 'ms');
        }
      },
      
      /**
       * 🔧 优化：重启更新定时器
       */
      restartUpdateTimer: function() {
        var self = manager;
        
        if (self.updateTimer) {
          clearInterval(self.updateTimer);
        }
        
        self.updateTimer = setInterval(function() {
          // 每X秒主动获取一次位置作为备份
          wx.getLocation({
            type: 'gcj02',
            altitude: true,
            isHighAccuracy: true,
            success: function(res) {
              // 应用时间间隔过滤
              if (self.shouldProcessLocationUpdate(res)) {
                self.debounceLocationUpdate(res);
              }
            },
            fail: function(err) {
              console.warn('定时获取位置失败:', err);
              self.updateGPSStatus('GPS信号不稳定');
            }
          });
        }, self.currentUpdateInterval);
      },
      
      /**
       * 🔧 优化：计算两点间距离（米）
       * @param {Number} lat1 纬度1
       * @param {Number} lon1 经度1 
       * @param {Number} lat2 纬度2
       * @param {Number} lon2 经度2
       * @returns {Number} 距离（米）
       */
      calculateDistance: function(lat1, lon1, lat2, lon2) {
        var R = 6371000; // 地球半径（米）
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      },
      
      /**
       * 检查位置权限
       */
      checkLocationPermission: function() {
        var self = manager;
        
        console.log('🔒 检查GPS位置权限...');
        self.updateGPSStatus('检查权限中...');
        
        // 🔧 新增：启动初始化超时监控
        self.startInitTimeout();
        
        wx.getSetting({
          success: function(res) {
            var hasPermission = res.authSetting['scope.userLocation'];
            console.log('权限状态:', hasPermission);
            
            if (hasPermission) {
              console.log('✅ 已有位置权限，启动GPS追踪');
              self.updateGPSStatus('权限已获得');
              
              // 🔧 修复：权限已获得时强制清除错误状态
              if (self.callbacks.onLocationError) {
                self.callbacks.onLocationError(null); // 清除错误状态
              }
              
              if (self.callbacks.onPermissionGranted) {
                self.callbacks.onPermissionGranted();
              }
              self.startLocationTracking();
            } else if (hasPermission === false) {
              console.log('❌ 位置权限被拒绝');
              self.updateGPSStatus('权限被拒绝');
              self.handlePermissionDenied();
            } else {
              console.log('🤔 首次请求位置权限');
              self.updateGPSStatus('请求权限中...');
              self.requestLocationPermission();
            }
          },
          fail: function(err) {
            console.error('❌ 获取设置失败:', err);
            self.updateGPSStatus('权限检查失败');
            if (self.callbacks.onPermissionError) {
              self.callbacks.onPermissionError(err);
            }
          }
        });
      },
      
      /**
       * 请求位置权限
       */
      requestLocationPermission: function() {
        var self = manager;
        
        wx.authorize({
          scope: 'scope.userLocation',
          success: function() {
            console.log('✅ 位置权限授权成功');
            self.updateGPSStatus('权限授权成功');
            
            // 🔧 修复：权限授予后强制触发地图数据更新
            if (self.callbacks.onPermissionGranted) {
              self.callbacks.onPermissionGranted();
            }
            
            // 🔧 修复：延迟启动定位，确保权限状态完全更新
            setTimeout(function() {
              self.startLocationTracking();
              
              // 🔧 修复：强制触发一次地图渲染更新
              if (self.callbacks.onForceMapUpdate) {
                self.callbacks.onForceMapUpdate();
              }
            }, 100);
          },
          fail: function() {
            console.log('❌ 位置权限授权失败');
            self.updateGPSStatus('权限授权失败');
            // 处理权限拒绝情况
            self.handlePermissionDenied();
          }
        });
      },
      
      /**
       * 处理权限拒绝
       */
      handlePermissionDenied: function() {
        var self = manager;
        
        // 检查是否在离线模式
        self.checkNetworkStatus(function(isOffline) {
          if (isOffline) {
            wx.showModal({
              title: '权限提示',
              content: '驾驶舱需要位置权限以获取GPS数据。您可以在离线模式下继续使用基础功能。',
              showCancel: true,
              cancelText: '打开设置',
              confirmText: '继续使用',
              success: function(res) {
                if (res.confirm) {
                  // 用户选择继续使用
                  if (self.callbacks.onOfflineModeStart) {
                    self.callbacks.onOfflineModeStart();
                  }
                  self.startSimulatedMode();
                } else {
                  // 用户选择打开设置
                  self.openSetting();
                }
              }
            });
          } else {
            var errorMsg = '需要位置权限才能使用驾驶舱功能';
            if (self.callbacks.onLocationError) {
              self.callbacks.onLocationError(errorMsg);
            }
            
            wx.showModal({
              title: '权限提示',
              content: '驾驶舱功能需要获取您的位置信息，请在设置中开启位置权限',
              showCancel: false,
              confirmText: '打开设置',
              success: function() {
                self.openSetting();
              }
            });
          }
        });
      },
      
      /**
       * 开始位置追踪
       */
      startLocationTracking: function() {
        var self = manager;
        
        if (self.isRunning) {
          console.log('GPS追踪已在运行中');
          return;
        }
        
        // 🔧 修复：更新GPS状态为正在启动
        self.updateGPSStatus('正在启动GPS...');
        
        // 先获取一次当前位置
        wx.getLocation({
          type: 'gcj02',  // 🔧 强制使用GPS坐标系统，提高定位精度
          altitude: true, // 🔧 强制请求高度数据
          isHighAccuracy: true,  // 启用高精度
          highAccuracyExpireTime: config.gps.highAccuracyExpireTime,
          success: function(res) {
            console.log('✅ 初始位置获取成功:', res);
            console.log('🔍 详细GPS数据分析:', {
              latitude: res.latitude,
              longitude: res.longitude,
              altitude: res.altitude,
              altitudeType: typeof res.altitude,
              hasAltitude: res.altitude !== undefined && res.altitude !== null,
              accuracy: res.accuracy,
              speed: res.speed,
              heading: res.heading,
              provider: res.provider || 'unknown' // 🔧 显示定位提供方
            });
            
            // 🔧 检查定位方式并尝试获取更好的定位
            if (res.provider === 'network' || (!res.altitude && res.altitude !== 0)) {
              console.warn('⚠️ 检测到网络定位或缺少高度信息，尝试GPS卫星定位...');
              self.tryGPSSatelliteLocation(res);
            } else {
              self.updateGPSStatus('GPS定位成功');
              self.clearInitTimeout(); // 🔧 清除初始化超时
              self.handleLocationUpdate(res);
            }
          },
          fail: function(err) {
            console.error('❌ 获取位置失败:', err);
            self.updateGPSStatus('GPS定位失败');
            self.handleLocationError(err);
          }
        });
        
        // 监听位置变化 - 🔧 优化：应用时间间隔过滤
        wx.onLocationChange(function(res) {
          // 应用智能时间间隔过滤
          if (self.shouldProcessLocationUpdate(res)) {
            self.debounceLocationUpdate(res);
          } else {
            console.log('⏰ GPS更新被时间间隔过滤跳过');
          }
        });
        
        // 开始持续获取位置
        wx.startLocationUpdate({
          type: 'gcj02',  // 🔧 保持一致的GPS坐标系统
          success: function() {
            console.log('✅ 开始位置更新');
            self.isRunning = true;
            self.updateGPSStatus('GPS正常工作');
            self.clearInitTimeout(); // 🔧 清除初始化超时
            
            // 🔧 优化：使用新的动态定时器逻辑
            self.restartUpdateTimer();
            
            // 启动GPS状态监控
            self.startGPSStatusMonitor();
            
            if (self.callbacks.onTrackingStart) {
              self.callbacks.onTrackingStart();
            }
          },
          fail: function(err) {
            console.error('❌ 启动位置更新失败:', err);
            self.updateGPSStatus('启动失败，切换备用模式');
            self.handleLocationError(err);
            
            // 降级到定时获取模式
            self.startFallbackMode();
          }
        });
      },
      
      /**
       * 🔧 新增：GPS状态更新方法
       * @param {String} status GPS状态描述
       */
      updateGPSStatus: function(status) {
        console.log('📡 GPS状态更新:', status);
        
        if (manager.callbacks.onGPSStatusChange) {
          manager.callbacks.onGPSStatusChange(status);
        }
      },
      
      /**
       * 🔧 新增：启动GPS状态监控
       */
      startGPSStatusMonitor: function() {
        var self = manager;
        
        // 设置状态监控定时器
        if (self.statusTimer) {
          clearInterval(self.statusTimer);
        }
        
        self.statusTimer = setInterval(function() {
          if (self.isRunning) {
            var now = Date.now();
            var lastUpdateTime = manager.pageRef ? manager.pageRef.data.lastUpdateTime : 0;
            var timeSinceLastUpdate = now - lastUpdateTime;
            
            if (timeSinceLastUpdate > 10000) { // 10秒无更新
              self.updateGPSStatus('GPS信号丢失');
            } else if (timeSinceLastUpdate > 5000) { // 5秒无更新
              self.updateGPSStatus('GPS信号微弱');
            } else {
              self.updateGPSStatus('GPS正常工作');
            }
          }
        }, 3000); // 每3秒检查一次
      },
      
      /**
       * 🔧 新增：启动初始化超时监控
       */
      startInitTimeout: function() {
        var self = manager;
        
        // 记录初始化开始时间
        self.initStartTime = Date.now();
        
        // 清除旧的超时定时器
        if (self.initTimeoutTimer) {
          clearTimeout(self.initTimeoutTimer);
        }
        
        // 设置30秒超时
        self.initTimeoutTimer = setTimeout(function() {
          if (!self.isRunning) {
            console.warn('⏰ GPS初始化超时，尝试重新初始化');
            self.updateGPSStatus('初始化超时，重新尝试');
            
            // 显示超时提示并重试
            wx.showModal({
              title: 'GPS初始化超时',
              content: 'GPS初始化时间过长，是否重新尝试？',
              confirmText: '重试',
              cancelText: '使用模拟模式',
              success: function(res) {
                if (res.confirm) {
                  // 重新初始化
                  self.retryInitialization();
                } else {
                  // 启动模拟模式
                  self.startSimulatedMode();
                }
              }
            });
          }
        }, 30000); // 30秒超时
      },
      
      /**
       * 🔧 新增：尝试获取GPS卫星定位
       * @param {Object} fallbackLocation 降级位置数据
       */
      tryGPSSatelliteLocation: function(fallbackLocation) {
        var self = manager;
        
        console.log('🛰️ 尝试强制GPS卫星定位...');
        self.updateGPSStatus('尝试GPS卫星定位...');
        
        // 尝试多种GPS参数组合来获取卫星定位
        var gpsConfigs = [
          { type: 'wgs84', altitude: true, isHighAccuracy: true },
          { type: 'gcj02', altitude: true, isHighAccuracy: true },
          { type: 'wgs84', altitude: true, isHighAccuracy: false }
        ];
        
        var tryNextConfig = function(configIndex) {
          if (configIndex >= gpsConfigs.length) {
            console.warn('⚠️ 所有GPS配置尝试失败，使用降级定位数据');
            self.updateGPSStatus('使用网络定位');
            
            // 使用降级数据，但尝试估算高度
            var estimatedLocation = {
              latitude: fallbackLocation.latitude,
              longitude: fallbackLocation.longitude,
              altitude: self.estimateAltitudeFromCoordinates(fallbackLocation.latitude, fallbackLocation.longitude),
              accuracy: fallbackLocation.accuracy,
              speed: fallbackLocation.speed,
              heading: fallbackLocation.heading,
              provider: fallbackLocation.provider + '_estimated'
            };
            
            self.handleLocationUpdate(estimatedLocation);
            return;
          }
          
          var currentConfig = gpsConfigs[configIndex];
          console.log('🛰️ 尝试GPS配置', configIndex + 1, ':', currentConfig);
          
          wx.getLocation({
            type: currentConfig.type,
            altitude: currentConfig.altitude,
            isHighAccuracy: currentConfig.isHighAccuracy,
            highAccuracyExpireTime: 8000, // 8秒超时
            success: function(res) {
              console.log('✅ GPS配置', configIndex + 1, '成功:', {
                provider: res.provider || 'unknown',
                hasAltitude: res.altitude !== undefined && res.altitude !== null,
                altitude: res.altitude,
                accuracy: res.accuracy
              });
              
              // 检查是否获得了更好的定位
              if (res.provider !== 'network' || res.altitude || res.accuracy < fallbackLocation.accuracy) {
                console.log('🎯 获得更好的GPS定位，使用此结果');
                self.updateGPSStatus('GPS卫星定位成功');
                self.clearInitTimeout();
                self.handleLocationUpdate(res);
              } else {
                console.log('🔄 继续尝试下一个GPS配置...');
                tryNextConfig(configIndex + 1);
              }
            },
            fail: function(err) {
              console.warn('❌ GPS配置', configIndex + 1, '失败:', err);
              tryNextConfig(configIndex + 1);
            }
          });
        };
        
        tryNextConfig(0);
      },
      
      /**
       * 🔧 新增：根据坐标估算海拔高度
       * @param {Number} latitude 纬度
       * @param {Number} longitude 经度  
       * @returns {Number} 估算高度（米）
       */
      estimateAltitudeFromCoordinates: function(latitude, longitude) {
        // 中国主要城市的大概海拔高度（米）
        var cityAltitudes = [
          { lat: 39.9042, lng: 116.4074, alt: 43, name: '北京' },    // 北京
          { lat: 31.2304, lng: 121.4737, alt: 4, name: '上海' },     // 上海
          { lat: 23.1291, lng: 113.2644, alt: 21, name: '广州' },    // 广州
          { lat: 22.3193, lng: 114.1694, alt: 32, name: '深圳' },    // 深圳
          { lat: 29.5630, lng: 106.5516, alt: 259, name: '重庆' },   // 重庆
          { lat: 30.5728, lng: 104.0668, alt: 505, name: '成都' },   // 成都
          { lat: 30.2741, lng: 120.1551, alt: 19, name: '杭州' },    // 杭州
          { lat: 32.0603, lng: 118.7969, alt: 35, name: '南京' },    // 南京
          { lat: 39.0851, lng: 117.1995, alt: 3, name: '天津' },     // 天津
          { lat: 36.6512, lng: 117.1201, alt: 51, name: '济南' }     // 济南
        ];
        
        var minDistance = Infinity;
        var estimatedAlt = 50; // 默认50米
        
        // 找到最近的参考城市
        for (var i = 0; i < cityAltitudes.length; i++) {
          var city = cityAltitudes[i];
          var distance = Math.sqrt(
            Math.pow(latitude - city.lat, 2) + Math.pow(longitude - city.lng, 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            estimatedAlt = city.alt;
          }
        }
        
        console.log('🗺️ 根据坐标(' + latitude.toFixed(4) + ',' + longitude.toFixed(4) + ')估算海拔:', estimatedAlt + 'm');
        return estimatedAlt;
      },
      
      /**
       * 🔧 修复：清除初始化超时
       */
      clearInitTimeout: function() {
        if (manager.initTimeoutTimer) {
          clearTimeout(manager.initTimeoutTimer);
          manager.initTimeoutTimer = null;
        }
      },
      
      /**
       * 🔧 新增：重试初始化
       */
      retryInitialization: function() {
        var self = manager;
        
        console.log('🔄 重新初始化GPS系统...');
        self.updateGPSStatus('重新初始化中...');
        
        // 重置状态
        self.isRunning = false;
        self.clearInitTimeout();
        
        // 重新开始初始化流程
        setTimeout(function() {
          self.checkLocationPermission();
        }, 1000);
      },

      /**
       * 启动降级模式（定时获取）
       */
      startFallbackMode: function() {
        var self = manager;
        
        self.updateGPSStatus('使用间隔定位模式');
        
        wx.showToast({
          title: '使用间隔定位模式',
          icon: 'none',
          duration: 2000
        });
        
        if (!self.updateTimer) {
          self.updateTimer = setInterval(function() {
            wx.getLocation({
              type: 'gcj02',  // 🔧 保持一致的GPS坐标系统
              altitude: true, // 🔧 强制请求高度数据
              isHighAccuracy: true,
              success: function(res) {
                self.updateGPSStatus('间隔定位正常');
                self.handleLocationUpdate(res);
              },
              fail: function(err) {
                console.error('降级模式获取位置失败:', err);
                self.updateGPSStatus('定位失败');
              }
            });
          }, config.gps.locationFallbackInterval);
        }
        
        self.isRunning = true;
        self.startGPSStatusMonitor();
      },
      
      /**
       * 停止位置追踪
       */
      stopLocationTracking: function() {
        var self = manager;
        
        // 停止微信API
        wx.stopLocationUpdate();
        wx.offLocationChange();
        
        // 清理定时器
        if (self.updateTimer) {
          clearInterval(self.updateTimer);
          self.updateTimer = null;
        }
        
        if (self.statusTimer) {
          clearInterval(self.statusTimer);
          self.statusTimer = null;
        }
        
        if (self.interferenceTimer) {
          clearTimeout(self.interferenceTimer);
          self.interferenceTimer = null;
        }
        
        self.isRunning = false;
        
        if (self.callbacks.onTrackingStopped) {
          self.callbacks.onTrackingStopped();
        }
        
        console.log('GPS位置追踪已停止');
      },
      
      /**
       * 处理位置更新
       * @param {Object} location 位置数据
       */
      handleLocationUpdate: function(location) {
        var self = manager;
        var now = Date.now();
        
        console.log('📍 GPS位置更新开始:', {
          latitude: location.latitude,
          longitude: location.longitude,
          altitude: location.altitude,
          altitudeType: typeof location.altitude,
          speed: location.speed,
          accuracy: location.accuracy,
          timestamp: new Date(now).toLocaleTimeString()
        });
        console.log('🏔️ 原始GPS高度详情:', location.altitude, '米 (类型:', typeof location.altitude, ')');
        
        // 位置合理性检查
        if (self.callbacks.getCurrentContext) {
          var context = self.callbacks.getCurrentContext();
          var reasonableCheck = self.calculatorRef.isReasonableLocation(location, now, context);
          
          if (!reasonableCheck.isReasonable) {
            console.warn('GPS位置异常，忽略此次更新');
            return;
          }
          
          // 更新上次有效位置
          if (self.callbacks.onContextUpdate) {
            self.callbacks.onContextUpdate({
              lastValidPosition: reasonableCheck.newLastValidPosition
            });
          }
        }
        
        // GPS干扰检测
        var interferenceDetected = self.checkGPSInterference(location, now);
        
        // 卡尔曼滤波数据融合 (如果启用)
        var kalmanData = null;
        if (self.kalmanRef && config.kalman && config.kalman.enabled) {
          // 计算置信度 (基于精度和干扰状态)
          var confidence = self.calculateGPSConfidence(location, interferenceDetected);
          
          // 时间间隔计算
          var deltaTime = (now - self.kalmanRef.lastUpdateTime) / 1000; // 转换为秒
          if (deltaTime > 0.01) { // 最小时间间隔10ms
            // 执行预测步骤
            self.kalmanRef.predict(deltaTime);
            
            // GPS测量更新
            self.kalmanRef.updateGPS({
              latitude: location.latitude,
              longitude: location.longitude,
              speed: location.speed || 0,
              heading: location.heading || 0
            }, confidence);
            
            // 获取滤波后的状态
            kalmanData = self.kalmanRef.getState();
            
            console.log('卡尔曼滤波数据:', {
              confidence: confidence,
              filtered: kalmanData
            });
          }
        }
        
        // 计算飞行数据 (使用卡尔曼滤波数据或原始数据)
        var flightData = null;
        var dataSource = kalmanData || location;
        if (self.callbacks.getCurrentContext) {
          var context = self.callbacks.getCurrentContext();
          if (context.locationHistory) {
            // 添加到历史记录 (位置使用卡尔曼滤波数据，高度始终使用原始GPS数据)
            var history = context.locationHistory.slice(); // 复制数组
            history.push({
              latitude: dataSource.latitude || location.latitude,
              longitude: dataSource.longitude || location.longitude,
              altitude: location.altitude || 0, // 高度始终使用原始GPS数据，不使用卡尔曼滤波
              timestamp: now
            });
            
            // 限制历史记录大小
            if (history.length > config.gps.maxHistorySize) {
              history.shift();
            }
            
            // 计算飞行数据
            flightData = self.calculatorRef.calculateFlightData(history, config.compass.minSpeedForTrack);
            
            // 更新历史记录
            if (self.callbacks.onContextUpdate) {
              self.callbacks.onContextUpdate({
                locationHistory: history
              });
            }
          }
        }
        
        // 更新GPS状态
        var gpsStatus = self.calculateGPSStatus(location, now, interferenceDetected);
        
        // 准备位置更新数据 (位置使用卡尔曼滤波数据，高度始终使用原始GPS数据)
        var updateData = {
          latitude: (dataSource.latitude || location.latitude).toFixed(6),
          longitude: (dataSource.longitude || location.longitude).toFixed(6),
          altitude: self.processGPSAltitude(location.altitude, location), // 🔧 修复：传递完整的location对象
          accuracy: location.accuracy,
          lastUpdateTime: now,
          gpsStatus: gpsStatus,
          gpsInterference: interferenceDetected,
          locationError: null,
          // 卡尔曼滤波状态信息
          kalmanEnabled: !!(kalmanData),
          kalmanConverged: kalmanData ? self.kalmanRef.isConverged() : false
        };
        
        // 添加飞行数据
        if (flightData) {
          updateData.speed = Math.round(flightData.speed);
          updateData.verticalSpeed = Math.round(flightData.verticalSpeed);
          if (flightData.track !== null) {
            updateData.track = Math.round(flightData.track);
          }
        }
        
        // 通知位置更新
        if (self.callbacks.onLocationUpdate) {
          self.callbacks.onLocationUpdate(updateData);
        }
        
        console.log('📊 位置数据处理完成:', {
          纬度: updateData.latitude,
          经度: updateData.longitude,
          高度_英尺: updateData.altitude,
          速度_节: updateData.speed,
          垂直速度_英尺每分钟: updateData.verticalSpeed,
          GPS状态: updateData.gpsStatus
        });
        console.log('🏔️ 最终高度数据:', updateData.altitude, 'ft (转换自', location.altitude, 'm)');
      },
      
      
      /**
       * 🔧 增强：专门处理GPS高度数据
       * @param {Number|undefined|null} rawAltitude 原始GPS高度（米）
       * @param {Object} location 完整的位置数据对象
       * @returns {Number} 处理后的高度（英尺）
       */
      processGPSAltitude: function(rawAltitude, location) {
        // 调试输出原始高度数据
        console.log('🏔️ 原始GPS高度数据:', rawAltitude, '(类型:', typeof rawAltitude, ')');
        console.log('🏔️ 完整GPS数据:', {
          altitude: rawAltitude,
          accuracy: location ? location.accuracy : 'N/A',
          latitude: location ? location.latitude : 'N/A',
          longitude: location ? location.longitude : 'N/A'
        });
        
        // 如果高度数据完全缺失（undefined或null），尝试其他获取方式
        if (rawAltitude === undefined || rawAltitude === null) {
          console.warn('⚠️ GPS高度数据缺失，尝试其他获取方式');
          
          // 尝试从location对象的其他字段获取高度
          if (location) {
            if (location.altitude !== undefined && location.altitude !== null) {
              rawAltitude = location.altitude;
              console.log('🏔️ 从location.altitude获取高度:', rawAltitude);
            } else if (location.alt !== undefined && location.alt !== null) {
              rawAltitude = location.alt;
              console.log('🏔️ 从location.alt获取高度:', rawAltitude);
            } else if (location.elevation !== undefined && location.elevation !== null) {
              rawAltitude = location.elevation;
              console.log('🏔️ 从location.elevation获取高度:', rawAltitude);
            }
          }
          
          // 如果仍然无法获取，使用合理的默认值
          if (rawAltitude === undefined || rawAltitude === null) {
            // 使用海平面作为默认值，而不是0
            var defaultAltitude = 50; // 50米，约164英尺，一个合理的地面高度
            console.warn('⚠️ 无法获取GPS高度数据，使用默认海拔:', defaultAltitude + 'm');
            rawAltitude = defaultAltitude;
          }
        }
        
        // 将高度转换为数字
        var altitudeInMeters = parseFloat(rawAltitude);
        
        // 检查转换后的数字是否有效
        if (isNaN(altitudeInMeters)) {
          console.warn('⚠️ GPS高度数据无效:', rawAltitude, '使用默认值164ft');
          return 164; // 50米转换为英尺
        }
        
        // 高度合理性检查
        if (altitudeInMeters < -1000) { // 低于-1000米可能是数据错误
          console.warn('⚠️ GPS高度过低:', altitudeInMeters + 'm，使用海平面高度');
          altitudeInMeters = 0;
        } else if (altitudeInMeters > 15000) { // 高于15000米可能是数据错误
          console.warn('⚠️ GPS高度过高:', altitudeInMeters + 'm，使用最大允许高度');
          altitudeInMeters = 15000;
        }
        
        // 米转英尺的转换 (1米 = 3.28084英尺)
        var altitudeInFeet = Math.round(altitudeInMeters * 3.28084);
        
        console.log('🏔️ 高度转换完成:', altitudeInMeters + 'm → ' + altitudeInFeet + 'ft');
        
        return altitudeInFeet;
      },

      /**
       * 处理位置错误 - 增强错误处理版
       * @param {Object} err 错误对象
       */
      handleLocationError: function(err) {
        var self = manager;
        
        console.error('位置错误:', err);
        
        // 安全的错误消息处理
        var errorMsg = err && err.errMsg ? err.errMsg : '未知错误';
        
        // 检查是否在离线模式
        self.checkNetworkStatus(function(isOffline) {
          if (isOffline) {
            console.log('离线状态下的位置错误，启动模拟模式');
            if (self.callbacks.onOfflineModeStart) {
              self.callbacks.onOfflineModeStart();
            }
            self.startSimulatedMode();
          } else {
            // 🔧 更安全的错误信息处理
            var userMessage = 'GPS信号丢失';
            
            try {
              if (errorMsg && typeof errorMsg === 'string') {
                if (errorMsg.indexOf('auth') > -1) {
                  userMessage = '需要位置权限才能使用驾驶舱功能';
                } else if (errorMsg.indexOf('timeout') > -1) {
                  userMessage = 'GPS定位超时，请确保在开阔地带';
                } else if (errorMsg.indexOf('fail') > -1) {
                  userMessage = '请检查GPS是否开启，并确保在开阔地带';
                } else if (errorMsg.indexOf('deny') > -1) {
                  userMessage = '位置权限被拒绝';
                }
              }
            } catch (parseError) {
              console.warn('解析GPS错误信息失败:', parseError);
              userMessage = 'GPS信号异常，请检查设备设置';
            }
            
            // 安全地通知错误状态
            if (self.callbacks.onLocationError) {
              self.callbacks.onLocationError(userMessage);
            }
            
            // 尝试启动模拟模式作为备用方案
            setTimeout(function() {
              console.log('GPS错误后5秒启动模拟模式作为备用方案');
              self.startSimulatedMode();
            }, 5000);
          }
        });
      },
      
      /**
       * 计算GPS状态 - 增强安全版
       * @param {Object} location 位置数据
       * @param {Number} now 当前时间
       * @param {Boolean} interferenceDetected 是否检测到干扰
       * @returns {String} GPS状态描述
       */
      calculateGPSStatus: function(location, now, interferenceDetected) {
        var self = manager;
        var gpsStatus = '初始化中';
        
        try {
          // 确保基础状态
          if (!location) {
            return 'GPS信号丢失';
          }
          
          // 默认为正常状态
          gpsStatus = '正常';
          
          if (self.callbacks.getCurrentContext) {
            var context = self.callbacks.getCurrentContext();
            var timeSinceLastUpdate = context.lastUpdateTime ? (now - context.lastUpdateTime) / 1000 : 999;
            var isOffline = context.isOffline || false;
            
            // 🔧 优先级排序的状态检测
            if (interferenceDetected) {
              gpsStatus = 'GPS干扰';
            } else if (timeSinceLastUpdate > config.gps.signalLossThreshold) {
              gpsStatus = 'GPS信号丢失';
            } else if (location.accuracy && location.accuracy > config.gps.accuracyThreshold) {
              gpsStatus = '精度较低';
            } else if (timeSinceLastUpdate > 10) {
              gpsStatus = '更新缓慢';
            } else if (timeSinceLastUpdate > 5) {
              gpsStatus = '信号弱';
            }
            
            // 添加离线标识
            if (isOffline) {
              gpsStatus += ' (离线)';
            }
          }
        } catch (error) {
          console.error('计算GPS状态失败:', error);
          gpsStatus = 'GPS状态异常';
        }
        
        // 确保返回值始终是字符串
        return typeof gpsStatus === 'string' ? gpsStatus : 'GPS状态未知';
      },
      
      /**
       * 检测GPS干扰（基于高度异常）
       * @param {Object} location 位置数据
       * @param {Number} now 当前时间
       * @returns {Boolean} 是否检测到干扰
       */
      checkGPSInterference: function(location, now) {
        var self = manager;
        
        if (!self.callbacks.getCurrentContext) {
          return false;
        }
        
        var context = self.callbacks.getCurrentContext();
        var currentAltitude = location.altitude || 0;
        
        // 获取高度历史记录
        var altitudeHistory = context.altitudeHistory ? context.altitudeHistory.slice() : [];
        
        // 添加到高度历史记录
        altitudeHistory.push({
          altitude: currentAltitude,
          timestamp: now
        });
        
        // 限制历史记录大小
        if (altitudeHistory.length > config.gps.maxAltitudeHistory) {
          altitudeHistory.shift();
        }
        
        // 更新历史记录到上下文
        if (self.callbacks.onContextUpdate) {
          self.callbacks.onContextUpdate({
            altitudeHistory: altitudeHistory
          });
        }
        
        // 如果历史数据不足，无法进行有效检测
        if (altitudeHistory.length < 3) {
          return false;
        }
        
        var isAnomaly = false;
        var anomalyReason = '';
        
        // 1. 高度值合理性检测
        if (currentAltitude < config.gps.minValidAltitude) {
          isAnomaly = true;
          anomalyReason = '高度过低: ' + currentAltitude + 'm';
        } else if (currentAltitude > config.gps.maxValidAltitude) {
          isAnomaly = true;
          anomalyReason = '高度过高: ' + currentAltitude + 'm';
        }
        
        // 2. 高度突变检测
        if (!isAnomaly && altitudeHistory.length >= 2) {
          var lastData = altitudeHistory[altitudeHistory.length - 2];
          var timeDiff = (now - lastData.timestamp) / 1000; // 秒
          
          if (timeDiff > 0 && timeDiff < 60) { // 只在合理时间间隔内检测
            var altitudeChange = Math.abs(currentAltitude - lastData.altitude);
            var changeRate = altitudeChange / timeDiff; // 米/秒
            
            // 检查绝对变化率
            if (changeRate > config.gps.altitudeChangeThreshold) {
              isAnomaly = true;
              anomalyReason = '高度变化过快: ' + changeRate.toFixed(1) + 'm/s';
            }
          }
        }
        
        // 更新异常计数
        var currentAnomalyCount = context.altitudeAnomalyCount || 0;
        var normalDataCount = context.normalDataCount || 0;
        
        if (isAnomaly) {
          currentAnomalyCount++;
          normalDataCount = 0;
          console.warn('GPS高度异常:', anomalyReason, '连续异常次数:', currentAnomalyCount);
        } else {
          normalDataCount++;
          // 如果连续正常数据达到阈值，逐渐减少异常计数
          if (normalDataCount >= 3) {
            currentAnomalyCount = Math.max(0, currentAnomalyCount - 1);
          }
        }
        
        // 更新计数器
        if (self.callbacks.onContextUpdate) {
          self.callbacks.onContextUpdate({
            altitudeAnomalyCount: currentAnomalyCount,
            normalDataCount: normalDataCount
          });
        }
        
        // 判断是否触发GPS干扰
        var interferenceDetected = currentAnomalyCount >= config.gps.maxAltitudeAnomaly;
        
        // 处理干扰状态变化
        if (interferenceDetected && !context.gpsInterference) {
          self.handleInterferenceDetected(now);
        } else if (context.gpsInterference && normalDataCount >= config.gps.requiredNormalCount) {
          self.handleInterferenceCleared();
        }
        
        return interferenceDetected;
      },
      
      /**
       * 处理检测到GPS干扰
       * @param {Number} now 当前时间
       */
      handleInterferenceDetected: function(now) {
        var self = manager;
        
        // 记录干扰时间
        var interferenceTime = new Date(now);
        var timeString = self.formatTime(interferenceTime);
        
        if (self.callbacks.onInterferenceDetected) {
          self.callbacks.onInterferenceDetected({
            time: timeString,
            timestamp: now
          });
        }
        
        // 清除之前的定时器
        if (self.interferenceTimer) {
          clearTimeout(self.interferenceTimer);
        }
        
        // 设置自动恢复定时器（30分钟）
        self.interferenceTimer = setTimeout(function() {
          self.handleInterferenceCleared();
        }, config.gps.interferenceRecoveryTime);
        
        // 使用智能toast显示干扰提示
        manager.toastManager.showSmartToast('GPS_INTERFERENCE', '检测到GPS干扰', {
          icon: 'none',
          duration: 3000
        });
        
        console.warn('GPS干扰触发，时间:', timeString);
      },
      
      /**
       * 处理GPS干扰解除
       */
      handleInterferenceCleared: function() {
        var self = manager;
        
        if (self.callbacks.onInterferenceCleared) {
          self.callbacks.onInterferenceCleared();
        }
        
        // 清除定时器
        if (self.interferenceTimer) {
          clearTimeout(self.interferenceTimer);
          self.interferenceTimer = null;
        }
        
        // 重置计数器
        if (self.callbacks.onContextUpdate) {
          self.callbacks.onContextUpdate({
            altitudeAnomalyCount: 0,
            normalDataCount: 0,
            gpsInterference: false,
            lastInterferenceTime: null
          });
        }
        
        // 显示GPS恢复提示
        manager.toastManager.showRecoveryToast('GPS_NORMAL');
        
        console.log('GPS干扰已解除');
      },
      
      /**
       * 启动GPS状态监控
       */
      startGPSStatusMonitor: function() {
        var self = manager;
        
        // 清除现有定时器
        if (self.statusTimer) {
          clearInterval(self.statusTimer);
        }
        
        // 每10秒检查一次GPS状态
        self.statusTimer = setInterval(function() {
          if (!self.callbacks.getCurrentContext) {
            return;
          }
          
          var context = self.callbacks.getCurrentContext();
          var now = Date.now();
          var timeSinceLastUpdate = context.lastUpdateTime ? (now - context.lastUpdateTime) / 1000 : 999;
          
          if (timeSinceLastUpdate > config.gps.signalLossThreshold) {
            // 信号丢失处理
            if (context.isOffline || context.isOfflineMode) {
              // 离线模式，不阻塞页面
              if (self.callbacks.onGPSStatusChange) {
                self.callbacks.onGPSStatusChange('离线模式');
              }
              
              // 启动模拟模式
              if (!context.useSimulatedData) {
                self.startSimulatedMode();
              }
            } else {
              if (self.callbacks.onGPSStatusChange) {
                self.callbacks.onGPSStatusChange('GPS信号丢失');
              }
              
              if (self.callbacks.onLocationError) {
                self.callbacks.onLocationError('GPS信号长时间未更新，请检查是否在室内或信号遮挡区域');
              }
            }
          } else if (timeSinceLastUpdate > config.gps.weakSignalThreshold) {
            var status = 'GPS信号弱' + (context.isOffline ? ' (离线)' : '');
            if (self.callbacks.onGPSStatusChange) {
              self.callbacks.onGPSStatusChange(status);
            }
          }
        }, config.gps.statusCheckInterval);
      },
      
      /**
       * 检查网络状态
       * @param {Function} callback 回调函数，参数为是否离线
       */  
      checkNetworkStatus: function(callback) {
        var self = manager;
        
        // 获取网络类型
        wx.getNetworkType({
          success: function(res) {
            var isOffline = res.networkType === 'none';
            
            if (self.callbacks.onNetworkStatusChange) {
              self.callbacks.onNetworkStatusChange({
                isOffline: isOffline,
                networkType: res.networkType
              });
            }
            
            if (isOffline) {
              console.log('当前处于离线状态，使用纯GPS定位');
            }
            
            if (callback) {
              callback(isOffline);
            }
          },
          fail: function(err) {
            console.error('获取网络状态失败:', err);
            if (callback) {
              callback(false); // 默认不离线
            }
          }
        });
        
        // 监听网络状态变化
        wx.onNetworkStatusChange(function(res) {
          if (self.callbacks.onNetworkStatusChange) {
            self.callbacks.onNetworkStatusChange({
              isOffline: !res.isConnected,
              networkType: res.networkType
            });
          }
          
          // 使用智能Toast管理网络状态提示
          var networkStatus = res.isConnected ? 'online' : 'offline';
          var message = res.isConnected ? '网络已连接' : '已进入离线模式';
          
          manager.toastManager.updateStatus('NETWORK_STATUS', networkStatus, message);
        });
      },
      
      /**
       * 启动模拟模式
       */
      startSimulatedMode: function() {
        var self = manager;
        console.log('启动模拟模式');
        
        // 设置模拟数据
        var simulatedData = {
          useSimulatedData: true,
          latitude: config.offline.simulatedData.latitude.toString(),
          longitude: config.offline.simulatedData.longitude.toString(),
          altitude: self.processGPSAltitude(config.offline.simulatedData.altitude, {
            altitude: config.offline.simulatedData.altitude,
            accuracy: 10 // 模拟数据假设精度为10米
          }), // 🔧 修复：模拟数据也需要进行完整的高度处理
          speed: config.offline.simulatedData.speed,
          heading: config.offline.simulatedData.heading,
          verticalSpeed: config.offline.simulatedData.verticalSpeed,
          gpsStatus: '模拟模式',
          locationError: null,
          showGPSWarning: true
        };
        
        if (self.callbacks.onSimulatedModeStart) {
          self.callbacks.onSimulatedModeStart(simulatedData);
        }
        
        // 使用智能toast显示模拟模式提示
        manager.toastManager.updateStatus('GPS_OFFLINE', 'simulated', '已启用模拟模式', {
          icon: 'none',
          duration: 2000
        });
      },
      
      /**
       * 打开设置页面
       */
      openSetting: function() {
        var self = manager;
        
        wx.openSetting({
          success: function(res) {
            if (res.authSetting['scope.userLocation']) {
              // 使用智能toast显示权限恢复提示
              manager.toastManager.updateStatus('GPS_PERMISSION', 'granted', '权限已开启', {
                icon: 'success'
              });
              
              // 清除错误状态并重新加载
              if (self.callbacks.onPermissionGranted) {
                self.callbacks.onPermissionGranted();
              }
              
              self.startLocationTracking();
            }
          }
        });
      },
      
      /**
       * 格式化时间
       * @param {Date} date 日期对象
       * @returns {String} 格式化后的时间字符串
       */
      formatTime: function(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        
        var pad = function(num) {
          return num < 10 ? '0' + num : num.toString();
        };
        
        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
      },
      
      /**
       * 获取GPS状态
       * @returns {Object} 状态信息
       */
      getStatus: function() {
        return {
          isRunning: manager.isRunning,
          hasUpdateTimer: !!manager.updateTimer,
          hasStatusTimer: !!manager.statusTimer,
          hasInterferenceTimer: !!manager.interferenceTimer
        };
      },
      
      /**
       * 计算GPS置信度
       * @param {Object} location GPS位置数据
       * @param {Boolean} interferenceDetected 是否检测到干扰
       * @returns {Number} 置信度 [0-1]
       */
      calculateGPSConfidence: function(location, interferenceDetected) {
        var confidence = 1.0; // 基础置信度
        
        // 基于GPS精度调整置信度
        if (location.accuracy) {
          if (location.accuracy > 50) {
            confidence *= 0.5; // 精度较差
          } else if (location.accuracy > 20) {
            confidence *= 0.7; // 精度中等
          } else if (location.accuracy > 10) {
            confidence *= 0.9; // 精度较好
          }
          // accuracy <= 10m 保持满置信度
        }
        
        // 干扰检测调整
        if (interferenceDetected) {
          confidence *= 0.3; // 干扰时大幅降低置信度
        }
        
        // 基于速度合理性调整
        var speed = location.speed || 0;
        if (speed > config.gps.maxReasonableSpeed) {
          confidence *= 0.1; // 速度不合理时严重降低置信度
        } else if (speed > config.gps.maxReasonableSpeed * 0.8) {
          confidence *= 0.6; // 速度接近极限时降低置信度
        }
        
        // 基于高度合理性调整
        var altitude = location.altitude || 0;
        if (altitude < config.gps.minValidAltitude || altitude > config.gps.maxValidAltitude) {
          confidence *= 0.4; // 高度异常时降低置信度
        }
        
        // 确保置信度在有效范围内
        confidence = Math.max(0.1, Math.min(1.0, confidence));
        
        return confidence;
      },
      
      /**
       * 🔧 优化：停止位置追踪
       */
      stopLocationTracking: function() {
        var self = manager;
        
        console.log('🛑 停止GPS位置追踪...');
        
        // 停止微信定位服务
        wx.stopLocationUpdate({
          success: function() {
            console.log('✅ 位置更新已停止');
          },
          fail: function(err) {
            console.warn('⚠️ 停止位置更新失败:', err);
          }
        });
        
        // 移除位置变化监听
        wx.offLocationChange();
        
        // 清理所有定时器
        if (self.updateTimer) {
          clearInterval(self.updateTimer);
          self.updateTimer = null;
        }
        
        if (self.statusTimer) {
          clearInterval(self.statusTimer);
          self.statusTimer = null;
        }
        
        if (self.interferenceTimer) {
          clearTimeout(self.interferenceTimer);
          self.interferenceTimer = null;
        }
        
        // 🔧 优化：清理新的定时器
        if (self.debounceTimer) {
          clearTimeout(self.debounceTimer);
          self.debounceTimer = null;
        }
        
        // 重置状态
        self.isRunning = false;
        self.pendingUpdate = null;
        self.lastLocationTime = 0;
        self.lastProcessTime = 0;
        self.consecutiveGoodUpdates = 0;
        
        console.log('✅ GPS位置追踪已停止');
      },
      
      /**
       * 销毁管理器
       */
      destroy: function() {
        manager.stopLocationTracking();
        
        // 🔧 清理初始化超时定时器
        manager.clearInitTimeout();
        
        // 清理网络状态监听
        wx.offNetworkStatusChange();
        
        // 清理toast管理器
        if (manager.toastManager) {
          manager.toastManager.clearAll();
          manager.toastManager = null;
        }
        
        // 🔧 优化：重置新增的状态变量
        manager.currentUpdateInterval = config.gps.locationUpdateInterval;
        
        // 重置所有状态
        manager.callbacks = null;
        manager.pageRef = null;
        manager.calculatorRef = null;
        manager.kalmanRef = null;
        manager.initStartTime = null;
        
        console.log('GPS管理器已销毁');
      }
    };
    
    return manager;
  }
};

module.exports = GPSManager;