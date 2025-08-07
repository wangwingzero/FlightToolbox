/**
 * 页面生命周期同步优化方案
 * 解决模块间的生命周期不同步问题
 */

// 1. 统一的生命周期管理器
var LifecycleManager = {
  /**
   * 创建生命周期管理器实例
   */
  create: function() {
    return {
      state: 'initializing', // initializing, running, pausing, destroying, destroyed
      modules: new Map(),
      stateChangeCallbacks: new Map(),
      
      /**
       * 注册模块
       */
      registerModule: function(name, module, priority) {
        this.modules.set(name, {
          module: module,
          priority: priority || 0,
          state: 'registered'
        });
        console.log('📋 注册模块:', name, '优先级:', priority);
      },
      
      /**
       * 状态转换
       */
      transitionTo: function(newState) {
        var oldState = this.state;
        console.log('🔄 生命周期状态转换:', oldState, '→', newState);
        
        this.state = newState;
        this.executeStateTransition(oldState, newState);
        
        // 触发状态变化回调
        if (this.stateChangeCallbacks.has(newState)) {
          this.stateChangeCallbacks.get(newState).forEach(callback => {
            try {
              callback(oldState, newState);
            } catch (error) {
              console.error('❌ 状态回调执行失败:', error);
            }
          });
        }
      },
      
      /**
       * 执行状态转换
       */
      executeStateTransition: function(fromState, toState) {
        var sortedModules = Array.from(this.modules.entries())
          .sort((a, b) => b[1].priority - a[1].priority); // 按优先级排序
        
        switch (toState) {
          case 'running':
            this.startAllModules(sortedModules);
            break;
          case 'pausing':
            this.pauseAllModules(sortedModules.reverse());
            break;
          case 'destroying':
            this.stopAllModules(sortedModules.reverse());
            break;
        }
      },
      
      /**
       * 启动所有模块
       */
      startAllModules: function(sortedModules) {
        var self = this;
        var startPromises = [];
        
        sortedModules.forEach(([name, moduleInfo]) => {
          var promise = new Promise((resolve, reject) => {
            try {
              if (moduleInfo.module.start) {
                moduleInfo.module.start();
              }
              moduleInfo.state = 'running';
              console.log('✅ 模块启动成功:', name);
              resolve();
            } catch (error) {
              console.error('❌ 模块启动失败:', name, error);
              reject(error);
            }
          });
          startPromises.push(promise);
        });
        
        Promise.allSettled(startPromises).then(results => {
          var failedModules = results.filter(r => r.status === 'rejected');
          if (failedModules.length > 0) {
            console.warn('⚠️ 部分模块启动失败:', failedModules.length);
          }
          console.log('🚀 模块启动序列完成');
        });
      },
      
      /**
       * 暂停所有模块
       */
      pauseAllModules: function(sortedModules) {
        sortedModules.forEach(([name, moduleInfo]) => {
          try {
            if (moduleInfo.module.pause) {
              moduleInfo.module.pause();
            }
            moduleInfo.state = 'paused';
            console.log('⏸️ 模块暂停成功:', name);
          } catch (error) {
            console.error('❌ 模块暂停失败:', name, error);
          }
        });
      },
      
      /**
       * 停止所有模块
       */
      stopAllModules: function(sortedModules) {
        var self = this;
        
        // 🔧 关键：同步停止，避免竞态条件
        sortedModules.forEach(([name, moduleInfo]) => {
          try {
            if (moduleInfo.module.stop) {
              moduleInfo.module.stop();
            }
            moduleInfo.state = 'stopped';
            console.log('🛑 模块停止成功:', name);
          } catch (error) {
            console.error('❌ 模块停止失败:', name, error);
          }
        });
        
        // 清理模块引用
        setTimeout(() => {
          this.modules.clear();
          this.state = 'destroyed';
          console.log('🗑️ 生命周期管理器销毁完成');
        }, 100);
      }
    };
  }
};

// 2. 在驾驶舱页面中应用（index.js）
var pageConfig = {
  data: {
    // ... 现有数据
  },
  
  customOnLoad: function(options) {
    console.log('驾驶舱页面加载 - 生命周期管理版本', options);
    
    // 🔧 创建生命周期管理器
    this.lifecycleManager = LifecycleManager.create();
    
    // 🔧 注册状态变化监听
    this.lifecycleManager.stateChangeCallbacks.set('destroying', [
      () => { this._isDestroying = true; }
    ]);
    
    // 初始化模块（但不启动）
    this.initializeModules();
    
    // 注册所有模块到生命周期管理器
    this.registerModulesWithLifecycle();
    
    // 启动生命周期
    this.lifecycleManager.transitionTo('running');
  },
  
  customOnUnload: function() {
    console.log('🗑️ 驾驶舱页面卸载 - 生命周期管理版本');
    
    // 🔧 使用生命周期管理器统一销毁
    if (this.lifecycleManager) {
      this.lifecycleManager.transitionTo('destroying');
    }
  },
  
  onHide: function() {
    console.log('⏸️ 页面隐藏');
    if (this.lifecycleManager) {
      this.lifecycleManager.transitionTo('pausing');
    }
  },
  
  onShow: function() {
    console.log('▶️ 页面显示');
    if (this.lifecycleManager && this.lifecycleManager.state === 'pausing') {
      this.lifecycleManager.transitionTo('running');
    }
  },
  
  /**
   * 注册模块到生命周期管理器
   */
  registerModulesWithLifecycle: function() {
    // 按优先级注册模块（数字越大优先级越高）
    this.lifecycleManager.registerModule('toastManager', this.toastManager, 10);
    this.lifecycleManager.registerModule('flightCalculator', this.flightCalculator, 9);
    this.lifecycleManager.registerModule('airportManager', this.airportManager, 8);
    this.lifecycleManager.registerModule('gpsManager', this.gpsManager, 7);
    this.lifecycleManager.registerModule('compassManager', this.compassManager, 6);
    this.lifecycleManager.registerModule('attitudeIndicator', this.attitudeIndicator, 5);
    this.lifecycleManager.registerModule('mapRenderer', this.mapRenderer, 4);
    this.lifecycleManager.registerModule('gestureHandler', this.gestureHandler, 3);
  },
  
  // ... 其他方法保持不变
};

// 3. 为模块添加标准生命周期方法
// 以GPS管理器为例，在gps-manager.js中添加：
var GPSManagerWithLifecycle = {
  // ... 现有方法
  
  /**
   * 启动方法（生命周期接口）
   */
  start: function() {
    if (this.isRunning) {
      console.log('🔄 GPS管理器已运行，跳过启动');
      return;
    }
    
    console.log('🚀 启动GPS管理器');
    this.forceStartLocationService();
  },
  
  /**
   * 暂停方法（生命周期接口）
   */
  pause: function() {
    console.log('⏸️ 暂停GPS管理器');
    // 暂停时不完全停止，只是降低更新频率
    if (this.activeGPSRefreshTimer) {
      clearInterval(this.activeGPSRefreshTimer);
      this.activeGPSRefreshTimer = null;
    }
  },
  
  /**
   * 停止方法（生命周期接口）
   */
  stop: function() {
    console.log('🛑 停止GPS管理器');
    this.stopLocationTracking();
  }
};

// 4. 传感器管理器的生命周期接口
// 在compass-manager.js中添加：
var CompassManagerWithLifecycle = {
  // ... 现有方法
  
  start: function() {
    if (this.isRunning) {
      console.log('🔄 指南针管理器已运行');
      return;
    }
    
    console.log('🚀 启动指南针管理器');
    // 🔧 使用修复后的启动方法
    this.startAllSensorsSequentially();
  },
  
  pause: function() {
    console.log('⏸️ 暂停指南针管理器');
    // 传感器在后台继续运行，只停止显示更新
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  },
  
  stop: function() {
    console.log('🛑 停止指南针管理器');
    this.stopAllSensors();
  },
  
  /**
   * 🔧 修复：顺序启动传感器避免冲突
   */
  startAllSensorsSequentially: function() {
    var self = this;
    var startIndex = 0;
    var sensors = ['compass', 'gyroscope', 'accelerometer'];
    
    var startNext = function() {
      if (startIndex >= sensors.length) {
        self.onAllSensorsStarted();
        return;
      }
      
      var sensorType = sensors[startIndex];
      console.log('🔄 顺序启动传感器:', sensorType);
      
      switch (sensorType) {
        case 'compass':
          self.startCompassSensor(() => {
            startIndex++;
            setTimeout(startNext, 300); // 300ms延迟
          });
          break;
        case 'gyroscope':
          self.gyroscopeManager.start();
          startIndex++;
          setTimeout(startNext, 300);
          break;
        case 'accelerometer':
          self.accelerometerManager.start();
          startIndex++;
          setTimeout(startNext, 300);
          break;
      }
    };
    
    startNext();
  }
};