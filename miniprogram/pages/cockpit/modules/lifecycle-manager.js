/**
 * 驾驶舱生命周期管理器
 * 统一管理所有模块的启动、停止、错误处理和资源清理
 * 
 * 核心功能：
 * - 模块注册和依赖管理
 * - 分阶段启动和停止
 * - 错误隔离和自愈机制
 * - 健康检查和状态监控
 * - 资源清理验证
 */

var ConsoleHelper = require('../../../utils/console-helper.js');
var Logger = require('./logger.js');

/**
 * 模块状态枚举
 */
var ModuleState = {
  CREATED: 'created',
  INITIALIZING: 'initializing', 
  INITIALIZED: 'initialized',
  STARTING: 'starting',
  RUNNING: 'running',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  ERROR: 'error',
  DESTROYED: 'destroyed'
};

/**
 * 启动阶段定义
 */
var StartupPhases = {
  CORE: 1,        // 核心服务：Config、Toast、Calculator
  DATA: 2,        // 数据源：GPS、Airport
  SENSORS: 3,     // 传感器：Compass、Gyroscope、Accelerometer
  RENDERING: 4,   // 渲染服务：Map、Attitude
  INTERACTION: 5  // 交互服务：Gesture
};

/**
 * 生命周期管理器
 */
var LifecycleManager = {
  
  /**
   * 创建生命周期管理器实例
   */
  create: function(config) {
    var manager = {
      // 配置
      config: config,
      
      // 模块注册表
      modules: {},           // name -> module instance
      moduleConfigs: {},     // name -> {dependencies, phase, retryCount}
      startupOrder: [],      // 启动顺序数组
      
      // 状态跟踪
      currentPhase: 0,
      isStarting: false,
      isStopping: false,
      isDestroyed: false,
      
      // 错误和健康监控
      errors: [],
      healthChecks: {},
      retryAttempts: {},
      
      /**
       * 注册模块
       * @param {string} name 模块名称
       * @param {Object} module 模块实例
       * @param {Array} dependencies 依赖的模块名数组
       * @param {number} phase 启动阶段
       */
      registerModule: function(name, module, dependencies, phase) {
        if (manager.isDestroyed) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.warn('🔴 生命周期管理器已销毁，无法注册模块:', name);
          }
          return false;
        }
        
        dependencies = dependencies || [];
        phase = phase || StartupPhases.CORE;
        
        // 验证模块接口
        var requiredMethods = ['getStatus'];
        var optionalMethods = ['init', 'start', 'stop', 'destroy'];
        
        for (var i = 0; i < requiredMethods.length; i++) {
          if (typeof module[requiredMethods[i]] !== 'function') {
            Logger.error('🔴 模块接口验证失败:', name, '缺少方法:', requiredMethods[i]);
            return false;
          }
        }
        
        // 注册模块
        manager.modules[name] = module;
        manager.moduleConfigs[name] = {
          dependencies: dependencies,
          phase: phase,
          retryCount: 0,
          maxRetries: 3
        };
        manager.retryAttempts[name] = 0;
        
        // 更新启动顺序
        manager._updateStartupOrder();
        
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('✅ 模块注册成功:', name, 'Phase:', phase, 'Dependencies:', dependencies);
        }
        return true;
      },
      
      /**
       * 启动所有模块
       */
      startAll: function() {
        if (manager.isStarting || manager.isDestroyed) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.warn('🔴 生命周期管理器正在启动或已销毁');
          }
          return Promise.resolve();
        }
        
        manager.isStarting = true;
        manager.currentPhase = 0;
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🚀 开始启动所有模块，共', Object.keys(manager.modules).length, '个模块');
        }
        
        return manager._startByPhases()
          .then(function() {
            manager.isStarting = false;
            if (manager.config.debug.enableVerboseLogging) {
              Logger.debug('✅ 所有模块启动完成');
            }
            return manager._performHealthCheck();
          })
          .catch(function(error) {
            manager.isStarting = false;
            Logger.error('🔴 模块启动失败:', error);
            manager._recordError('STARTUP_FAILED', error);
            throw error;
          });
      },
      
      /**
       * 停止所有模块
       */
      stopAll: function() {
        if (manager.isStopping || manager.isDestroyed) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.warn('🔴 生命周期管理器正在停止或已销毁');
          }
          return Promise.resolve();
        }
        
        manager.isStopping = true;
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🛑 开始停止所有模块');
        }
        
        // 按相反顺序停止
        var reverseOrder = manager.startupOrder.slice().reverse();
        
        return manager._stopModules(reverseOrder)
          .then(function() {
            manager.isStopping = false;
            if (manager.config.debug.enableVerboseLogging) {
              Logger.debug('✅ 所有模块停止完成');
            }
          })
          .catch(function(error) {
            manager.isStopping = false;
            Logger.error('🔴 模块停止失败:', error);
            manager._recordError('STOP_FAILED', error);
            throw error;
          });
      },
      
      /**
       * 销毁所有模块
       */
      destroyAll: function() {
        if (manager.isDestroyed) {
          return Promise.resolve();
        }
        
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🗑️ 开始销毁所有模块');
        }
        manager.isDestroyed = true;
        
        // 先停止所有模块
        return manager.stopAll()
          .then(function() {
            // 按相反顺序销毁
            var reverseOrder = manager.startupOrder.slice().reverse();
            return manager._destroyModules(reverseOrder);
          })
          .then(function() {
            // 清理管理器状态
            manager.modules = {};
            manager.moduleConfigs = {};
            manager.startupOrder = [];
            manager.errors = [];
            manager.healthChecks = {};
            manager.retryAttempts = {};
            if (manager.config.debug.enableVerboseLogging) {
              Logger.debug('✅ 所有模块销毁完成');
            }
          })
          .catch(function(error) {
            Logger.error('🔴 模块销毁失败:', error);
            throw error;
          });
      },
      
      /**
       * 重启单个模块
       */
      restartModule: function(name) {
        if (!manager.modules[name] || manager.isDestroyed) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.warn('🔴 模块不存在或管理器已销毁:', name);
          }
          return Promise.resolve();
        }
        
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🔄 重启模块:', name);
        }
        
        return manager._stopModule(name)
          .then(function() {
            return manager._startModule(name);
          })
          .then(function() {
            if (manager.config.debug.enableVerboseLogging) {
              Logger.debug('✅ 模块重启成功:', name);
            }
            manager.retryAttempts[name] = 0; // 重置重试次数
          })
          .catch(function(error) {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.error('🔴 模块重启失败:', name, error);
            }
            manager._recordError('RESTART_FAILED', error, name);
            throw error;
          });
      },
      
      /**
       * 获取系统健康状态
       */
      getSystemHealth: function() {
        var health = {
          timestamp: new Date().getTime(),
          overallStatus: 'healthy',
          moduleCount: Object.keys(manager.modules).length,
          runningModules: 0,
          errorModules: 0,
          modules: {},
          errors: manager.errors.slice(-10), // 最近10个错误
          phases: {
            current: manager.currentPhase,
            total: Math.max.apply(Math, Object.keys(StartupPhases).map(function(k) { return StartupPhases[k]; }))
          }
        };
        
        // 检查每个模块状态
        for (var name in manager.modules) {
          try {
            var status = manager.modules[name].getStatus();
            health.modules[name] = {
              state: status.state || ModuleState.CREATED,
              isHealthy: status.isHealthy !== false,
              lastError: status.lastError || null,
              retryCount: manager.retryAttempts[name] || 0
            };
            
            if (health.modules[name].state === ModuleState.RUNNING) {
              health.runningModules++;
            }
            if (!health.modules[name].isHealthy || health.modules[name].state === ModuleState.ERROR) {
              health.errorModules++;
            }
          } catch (error) {
            health.modules[name] = {
              state: ModuleState.ERROR,
              isHealthy: false,
              lastError: error.message,
              retryCount: manager.retryAttempts[name] || 0
            };
            health.errorModules++;
          }
        }
        
        // 计算整体状态
        if (health.errorModules > 0) {
          health.overallStatus = health.errorModules > health.moduleCount / 2 ? 'critical' : 'warning';
        }
        
        return health;
      },
      
      /**
       * 获取模块状态
       */
      getModuleStatus: function(name) {
        if (!manager.modules[name]) {
          return null;
        }
        
        try {
          return manager.modules[name].getStatus();
        } catch (error) {
          return {
            state: ModuleState.ERROR,
            isHealthy: false,
            lastError: error.message
          };
        }
      },
      
      // === 私有方法 ===
      
      /**
       * 更新启动顺序
       */
      _updateStartupOrder: function() {
        var phases = {};
        
        // 按阶段分组
        for (var name in manager.moduleConfigs) {
          var phase = manager.moduleConfigs[name].phase;
          if (!phases[phase]) {
            phases[phase] = [];
          }
          phases[phase].push(name);
        }
        
        // 按阶段顺序构建启动数组
        manager.startupOrder = [];
        var sortedPhases = Object.keys(phases).sort(function(a, b) { return parseInt(a) - parseInt(b); });
        
        for (var i = 0; i < sortedPhases.length; i++) {
          var phase = sortedPhases[i];
          manager.startupOrder = manager.startupOrder.concat(phases[phase]);
        }
        
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🔧 更新启动顺序:', manager.startupOrder);
        }
      },
      
      /**
       * 分阶段启动模块
       */
      _startByPhases: function() {
        var phases = {};
        
        // 按阶段分组
        for (var i = 0; i < manager.startupOrder.length; i++) {
          var name = manager.startupOrder[i];
          var phase = manager.moduleConfigs[name].phase;
          if (!phases[phase]) {
            phases[phase] = [];
          }
          phases[phase].push(name);
        }
        
        // 按阶段顺序启动
        var sortedPhases = Object.keys(phases).sort(function(a, b) { return parseInt(a) - parseInt(b); });
        var promise = Promise.resolve();
        
        for (var i = 0; i < sortedPhases.length; i++) {
          (function(phase, moduleNames) {
            promise = promise.then(function() {
              manager.currentPhase = parseInt(phase);
              if (manager.config.debug.enableVerboseLogging) {
                Logger.debug('🚀 启动阶段', phase, ':', moduleNames);
              }
              
              // 并行启动该阶段的所有模块
              var promises = moduleNames.map(function(name) {
                return manager._startModuleWithRetry(name);
              });
              
              return Promise.all(promises);
            });
          })(sortedPhases[i], phases[sortedPhases[i]]);
        }
        
        return promise;
      },
      
      /**
       * 带重试的模块启动
       */
      _startModuleWithRetry: function(name) {
        return manager._startModule(name)
          .catch(function(error) {
            var config = manager.moduleConfigs[name];
            manager.retryAttempts[name] = (manager.retryAttempts[name] || 0) + 1;
            
            if (manager.retryAttempts[name] <= config.maxRetries) {
              if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
                Logger.warn('⚠️ 模块启动失败，重试第', manager.retryAttempts[name], '次:', name, error.message);
              }
              
              // 延迟重试
              return new Promise(function(resolve) {
                setTimeout(resolve, 1000 * manager.retryAttempts[name]);
              }).then(function() {
                return manager._startModuleWithRetry(name);
              });
            } else {
              if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
                Logger.error('🔴 模块启动最终失败:', name, error);
              }
              manager._recordError('MODULE_START_FAILED', error, name);
              
              // 尝试优雅降级
              return manager._handleModuleFailure(name, error);
            }
          });
      },
      
      /**
       * 启动单个模块
       */
      _startModule: function(name) {
        var module = manager.modules[name];
        if (!module) {
          return Promise.reject(new Error('模块不存在: ' + name));
        }
        
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('▶️ 启动模块:', name);
        }
        
        return new Promise(function(resolve, reject) {
          try {
            // 检查依赖
            var config = manager.moduleConfigs[name];
            for (var i = 0; i < config.dependencies.length; i++) {
              var depName = config.dependencies[i];
              var depStatus = manager.getModuleStatus(depName);
              if (!depStatus || depStatus.state !== ModuleState.RUNNING) {
                throw new Error('依赖模块未运行: ' + depName);
              }
            }
            
            // 初始化（如果需要）
            if (typeof module.init === 'function') {
              var dependencies = {};
              for (var i = 0; i < config.dependencies.length; i++) {
                dependencies[config.dependencies[i]] = manager.modules[config.dependencies[i]];
              }
              module.init(dependencies);
            }
            
            // 启动
            var startResult;
            if (typeof module.start === 'function') {
              startResult = module.start();
            }
            
            // 处理异步启动
            if (startResult && typeof startResult.then === 'function') {
              startResult.then(resolve).catch(reject);
            } else {
              resolve();
            }
            
          } catch (error) {
            reject(error);
          }
        });
      },
      
      /**
       * 停止模块列表
       */
      _stopModules: function(moduleNames) {
        var promises = moduleNames.map(function(name) {
          return manager._stopModule(name).catch(function(error) {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.error('🔴 停止模块失败:', name, error);
            }
            manager._recordError('MODULE_STOP_FAILED', error, name);
            // 继续停止其他模块
            return Promise.resolve();
          });
        });
        
        return Promise.all(promises);
      },
      
      /**
       * 停止单个模块
       */
      _stopModule: function(name) {
        var module = manager.modules[name];
        if (!module) {
          return Promise.resolve();
        }
        
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('⏹️ 停止模块:', name);
        }
        
        return new Promise(function(resolve) {
          try {
            if (typeof module.stop === 'function') {
              var stopResult = module.stop();
              if (stopResult && typeof stopResult.then === 'function') {
                stopResult.then(resolve).catch(resolve); // 停止失败也继续
              } else {
                resolve();
              }
            } else {
              resolve();
            }
          } catch (error) {
            Logger.error('🔴 停止模块异常:', name, error);
            resolve(); // 继续处理
          }
        });
      },
      
      /**
       * 销毁模块列表
       */
      _destroyModules: function(moduleNames) {
        var promises = moduleNames.map(function(name) {
          return manager._destroyModule(name).catch(function(error) {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.error('🔴 销毁模块失败:', name, error);
            }
            // 继续销毁其他模块
            return Promise.resolve();
          });
        });
        
        return Promise.all(promises);
      },
      
      /**
       * 销毁单个模块
       */
      _destroyModule: function(name) {
        var module = manager.modules[name];
        if (!module) {
          return Promise.resolve();
        }
        
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🗑️ 销毁模块:', name);
        }
        
        return new Promise(function(resolve) {
          try {
            if (typeof module.destroy === 'function') {
              module.destroy();
            }
            resolve();
          } catch (error) {
            Logger.error('🔴 销毁模块异常:', name, error);
            resolve(); // 继续处理
          }
        });
      },
      
      /**
       * 处理模块失败
       */
      _handleModuleFailure: function(name, error) {
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🛡️ 处理模块失败，尝试优雅降级:', name);
        }
        
        // 根据模块重要性决定是否影响整体启动
        var criticalModules = ['gps-manager', 'config'];
        
        if (criticalModules.indexOf(name) !== -1) {
          // 关键模块失败，抛出错误
          throw new Error('关键模块启动失败: ' + name);
        } else {
            // 非关键模块失败，记录错误但继续启动
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.debug('⚠️ 非关键模块失败，继续启动:', name);
            }
            return Promise.resolve();
          }
      },
      
      /**
       * 执行健康检查
       */
      _performHealthCheck: function() {
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🔍 执行系统健康检查');
        }
        var health = manager.getSystemHealth();
        
        if (health.overallStatus !== 'healthy') {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.warn('⚠️ 系统健康检查发现问题:', health.overallStatus, 
                        '错误模块数:', health.errorModules);
          }
        } else {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.debug('✅ 系统健康检查通过，运行模块数:', health.runningModules);
            }
          }
        
        return Promise.resolve(health);
      },
      
      /**
       * 记录错误
       */
      _recordError: function(type, error, moduleName) {
        var errorRecord = {
          timestamp: new Date().getTime(),
          type: type,
          message: error.message || String(error),
          moduleName: moduleName || 'SYSTEM',
          stack: error.stack
        };
        
        manager.errors.push(errorRecord);
        
        // 保持错误日志在合理范围内
        if (manager.errors.length > 50) {
          manager.errors = manager.errors.slice(-30);
        }
        
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          Logger.error('📝 记录错误:', errorRecord);
        }
        
        // 触发自愈机制
        manager._triggerSelfHealing(moduleName, errorRecord);
      },

      /**
       * 触发自愈机制
       */
      _triggerSelfHealing: function(moduleName, errorRecord) {
        if (!moduleName || moduleName === 'SYSTEM') return;
        
        var moduleConfig = manager.moduleConfigs[moduleName];
        if (!moduleConfig) return;
        
        var retryCount = manager.retryAttempts[moduleName] || 0;
        
        // 判断是否需要自愈
        if (retryCount < moduleConfig.maxRetries) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.debug('🔄 触发模块自愈机制:', moduleName, '重试次数:', retryCount + 1);
          }
          
          // 延迟重试，避免连续失败
          var retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // 指数退避，最大30秒
          
          setTimeout(function() {
            manager.restartModule(moduleName)
              .then(function() {
                if (manager.config.debug.enableVerboseLogging) {
                  Logger.debug('✅ 模块自愈成功:', moduleName);
                }
                manager._notifyModuleRecovery(moduleName);
              })
              .catch(function(error) {
                Logger.error('🔴 模块自愈失败:', moduleName, error);
                manager._handleSelfHealingFailure(moduleName, error);
              });
          }, retryDelay);
        } else {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.error('🔴 模块自愈失败:', moduleName, '达到最大重试次数');
            Logger.warn('⚠️ 模块', moduleName, '已达最大重试次数，启动降级策略');
          }
          manager._handleModuleDegradation(moduleName, errorRecord);
        }
      },

      /**
       * 通知模块恢复
       */
      _notifyModuleRecovery: function(moduleName) {
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('📢 模块恢复通知:', moduleName);
        }
        
        // 可以在这里添加用户通知逻辑
        if (typeof wx !== 'undefined' && wx.showToast) {
          wx.showToast({
            title: '模块已恢复: ' + moduleName,
            icon: 'success',
            duration: 2000
          });
        }
      },

      /**
       * 处理自愈失败
       */
      _handleSelfHealingFailure: function(moduleName, error) {
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          Logger.error('🚨 模块', moduleName, '自愈失败，标记为永久故障');
        }
        
        // 标记模块为永久故障状态
        if (manager.modules[moduleName]) {
          try {
            manager.modules[moduleName].status = 'failed';
            manager.modules[moduleName]._isPermanentlyFailed = true;
          } catch (e) {
            // 忽略标记失败的错误
          }
        }
        
        // 通知用户
        if (typeof wx !== 'undefined' && wx.showModal) {
          wx.showModal({
            title: '模块故障',
            content: '模块 ' + moduleName + ' 出现故障无法恢复，部分功能可能受影响。',
            showCancel: false,
            confirmText: '知道了'
          });
        }
      },

      /**
       * 处理模块降级
       */
      _handleModuleDegradation: function(moduleName, errorRecord) {
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('📉 启动模块降级策略:', moduleName);
        }
        
        // 根据模块重要性决定降级策略
        var criticalModules = ['gps-manager', 'toast-manager'];
        var isCritical = criticalModules.indexOf(moduleName) !== -1;
        
        if (isCritical) {
          // 关键模块降级：提供基础功能
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.warn('⚠️ 关键模块降级:', moduleName);
          }
          manager._provideFallbackService(moduleName);
        } else {
          // 非关键模块降级：禁用功能
          if (manager.config.debug.enableVerboseLogging) {
            Logger.debug('🔇 非关键模块降级:', moduleName, '- 功能已禁用');
          }
          manager._disableModuleFeatures(moduleName);
        }
      },

      /**
       * 提供降级服务
       */
      _provideFallbackService: function(moduleName) {
        Logger.debug('🛡️ 为关键模块提供降级服务:', moduleName);
        
        switch (moduleName) {
          case 'gps-manager':
            // GPS模块降级：使用缓存位置或模拟数据
            Logger.debug('🛰️ GPS模块降级：启用离线模式');
            break;
          case 'toast-manager':
            // Toast模块降级：使用系统提示
            Logger.debug('💬 Toast模块降级：使用系统提示');
            break;
          default:
            Logger.debug('🔧 通用降级服务:', moduleName);
        }
      },

      /**
       * 禁用模块功能
       */
      _disableModuleFeatures: function(moduleName) {
        Logger.debug('🚫 禁用模块功能:', moduleName);
        
        // 在这里可以添加具体的功能禁用逻辑
        // 比如隐藏UI元素、跳过某些操作等
      },

      /**
       * 健康监控和自动修复
       */
      startHealthMonitoring: function() {
        if (manager.isDestroyed || manager.healthMonitorTimer) {
          return;
        }
        
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🏥 启动健康监控系统');
        }
        
        var self = this;
        manager.healthMonitorTimer = setInterval(function() {
          self._performPeriodicHealthCheck();
        }, 30000); // 每30秒检查一次
        
        return Promise.resolve();
      },

      /**
       * 停止健康监控
       */
      stopHealthMonitoring: function() {
        if (manager.healthMonitorTimer) {
          clearInterval(manager.healthMonitorTimer);
          manager.healthMonitorTimer = null;
          if (manager.config.debug.enableVerboseLogging) {
            Logger.debug('🏥 健康监控系统已停止');
          }
        }
        
        return Promise.resolve();
      },

      /**
       * 执行周期性健康检查
       */
      _performPeriodicHealthCheck: function() {
        if (manager.isDestroyed) {
          return;
        }
        
        if (manager.config.debug.enableVerboseLogging) {
          Logger.debug('🔍 执行周期性健康检查...');
        }
        
        var health = manager.getSystemHealth();
        
        // 检查是否有模块长时间无响应
        for (var moduleName in health.modules) {
          var moduleHealth = health.modules[moduleName];
          
          if (!moduleHealth.isHealthy) {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.warn('⚠️ 检测到不健康模块:', moduleName);
            }
            
            // 尝试重启不健康的模块
            if (moduleHealth.retryCount < 3) {
              if (manager.config.debug.enableVerboseLogging) {
                Logger.debug('🔄 自动重启不健康模块:', moduleName);
              }
              manager.restartModule(moduleName)
                .catch(function(error) {
                  if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
                    Logger.error('🔴 自动重启失败:', moduleName, error);
                  }
                });
            }
          }
        }
        
        // 记录健康检查结果
        if (manager.config && manager.config.global && manager.config.global.debugMode) {
          Logger.debug('🏥 健康检查完成:', {
            '总体状态': health.overallStatus,
            '运行模块': health.runningModules + '/' + health.moduleCount,
            '错误数量': manager.errors.length
          });
        }
      }
    };
    
    return manager;
  },
  
  // 导出常量
  ModuleState: ModuleState,
  StartupPhases: StartupPhases
};

module.exports = LifecycleManager;