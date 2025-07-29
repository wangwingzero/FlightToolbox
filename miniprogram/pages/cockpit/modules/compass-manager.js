/**
 * 指南针航向管理器模块
 * 
 * 提供指南针和航向处理功能，包括：
 * - 指南针启动停止管理
 * - 增强的航向平滑算法
 * - 航向稳定性检查
 * - 循环角度数学计算
 * - 航向/航迹模式切换
 * 
 * 设计原则：
 * - 复杂算法封装，保持数学精度
 * - 状态通过回调更新主页面
 * - 支持配置驱动的参数调整
 * - 正确处理角度的循环特性（0-360度）
 */

var ToastManager = require('./toast-manager.js');

var CompassManager = {
  /**
   * 创建指南针管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 内部状态
      callbacks: null,
      kalmanRef: null,     // kalman-filter实例引用
      toastManager: ToastManager.create(config), // Toast管理器
      isRunning: false,
      retryCount: 0,
      maxRetries: 3,
      compassSupported: null, // null=未知, true=支持, false=不支持
      
      /**
       * 初始化管理器
       * @param {Object} page 页面实例
       * @param {Object} callbacks 回调函数集合
       * @param {Object} kalmanFilter kalman-filter实例 (可选)
       */
      init: function(page, callbacks, kalmanFilter) {
        manager.pageRef = page;
        manager.callbacks = callbacks || {};
        manager.kalmanRef = kalmanFilter;
        
        // 如果启用卡尔曼滤波，设置相关回调
        if (manager.kalmanRef && config.kalman && config.kalman.enabled) {
          console.log('指南针管理器：启用卡尔曼滤波数据融合');
        }
      },
      
      /**
       * 检查设备指南针支持
       * @returns {Promise} 支持状态检查结果
       */
      checkCompassSupport: function() {
        return new Promise(function(resolve, reject) {
          wx.getSystemInfo({
            success: function(res) {
              console.log('设备信息:', res.platform, res.model);
              
              // 检查平台支持情况
              var isSupported = true;
              var reason = '';
              
              if (res.platform === 'windows' || res.platform === 'mac') {
                isSupported = false;
                reason = '桌面平台不支持指南针传感器';
              }
              
              manager.compassSupported = isSupported;
              
              if (isSupported) {
                resolve({ supported: true, platform: res.platform });
              } else {
                reject({ supported: false, reason: reason, platform: res.platform });
              }
            },
            fail: function(error) {
              reject({ supported: false, reason: '无法获取设备信息', error: error });
            }
          });
        });
      },
      
      /**
       * 启动指南针
       * @param {Object} context 上下文状态
       */
      start: function(context) {
        var self = manager;
        
        // 🔧 修复1：防止重复启动 - 先检查并停止已运行的指南针
        if (manager.isRunning) {
          console.log('⚠️ 指南针已在运行，先停止现有实例');
          self.stop();
          
          // 等待停止完成后再启动（增加延迟时间，确保完全停止）
          setTimeout(function() {
            self._doStart(context);
          }, 300); // 增加到300ms以确保完全停止
          return;
        }
        
        self._doStart(context);
      },
      
      /**
       * 内部启动方法（避免重复代码）
       * @param {Object} context 上下文状态
       */
      _doStart: function(context) {
        var self = manager;
        
        // 🔧 修复2：清理旧的事件监听器，防止累积
        wx.offCompassChange();
        
        // 重置航向缓冲区和相关参数
        var resetContext = {
          headingBuffer: [],
          headingStability: 0,
          lastHeadingUpdateTime: 0,
          lastStableHeading: context.lastStableHeading || 0
        };
        
        // 通知状态重置
        if (self.callbacks.onContextUpdate) {
          self.callbacks.onContextUpdate(resetContext);
        }
        
        // 🔧 修复3：增强状态管理 - 设置启动中状态
        manager.isRunning = 'starting'; // 使用字符串状态更精确
        
        // 监听罗盘数据 - 只绑定一次
        wx.onCompassChange(function(res) {
          // 只有在真正运行时才处理数据
          if (manager.isRunning === true) {
            console.log('原始指南针数据:', res.direction);
            self.handleCompassData(res.direction, context);
          }
        });
        
        // 首先检查设备支持
        self.checkCompassSupport().then(function(result) {
          console.log('设备支持指南针:', result.platform);
          
          // 🔧 修复4：添加启动前的最后检查
          if (manager.isRunning !== 'starting') {
            console.log('⚠️ 启动过程中状态已变更，取消启动');
            return;
          }
          
          // 开始监听罗盘数据
          wx.startCompass({
            interval: config.compass.compassInterval,
            success: function() {
              console.log('✅ 指南针启动成功');
              manager.isRunning = true; // 设置为真正运行状态
              
              // 如果之前有重试，显示恢复提示
              if (manager.retryCount > 0) {
                manager.toastManager.showRecoveryToast('COMPASS_NORMAL');
              }
              
              manager.retryCount = 0; // 重置重试次数
              
              if (self.callbacks.onCompassReady) {
                self.callbacks.onCompassReady();
              }
            },
            fail: function(err) {
              console.error('❌ 指南针启动失败:', err);
              manager.isRunning = false; // 重置状态
              self.handleCompassStartError(err);
            }
          });
          
        }).catch(function(error) {
          console.warn('设备不支持指南针:', error.reason);
          self.handleCompassUnsupported(error);
        });
      },
      
      /**
       * 处理指南针启动错误
       * @param {Object} error 错误对象
       */
      handleCompassStartError: function(error) {
        var self = manager;
        var errorMsg = error.errMsg || '';
        var errorCode = error.errCode || 0;
        
        console.log('指南针错误详情:', errorCode, errorMsg);
        
        // 🔧 重要修复：特殊处理重复启动错误
        if (errorMsg.indexOf('has enable') !== -1 || errorMsg.indexOf('should stop pre operation') !== -1) {
          console.log('🔧 检测到指南针重复启动错误，执行强制重置流程');
          
          // 强制停止现有指南针并重新启动
          manager.isRunning = false; // 重置状态
          
          // 强制清理和停止
          try {
            wx.offCompassChange();
            wx.stopCompass({
              success: function() {
                console.log('🔧 强制停止成功，准备重新启动');
                setTimeout(function() {
                  self._doRestart();
                }, 500); // 等待500ms确保完全停止
              },
              fail: function(stopErr) {
                console.warn('🔧 强制停止失败，但继续重启流程:', stopErr);
                setTimeout(function() {
                  self._doRestart();
                }, 500);
              }
            });
          } catch (e) {
            console.warn('🔧 强制清理时出错:', e);
            setTimeout(function() {
              self._doRestart();
            }, 500);
          }
          return; // 不执行后续的通用错误处理
        }
        
        var userMessage = '';
        var canRetry = false;
        
        // 根据错误码分析具体问题
        if (errorMsg.indexOf('permission denied') !== -1 || errorCode === 11001) {
          userMessage = '指南针权限被拒绝，请在系统设置中允许小程序访问传感器';
          canRetry = false;
        } else if (errorMsg.indexOf('not available') !== -1 || errorCode === 11002) {
          userMessage = '设备不支持指南针传感器，将使用GPS航迹替代';
          canRetry = false;
        } else if (errorMsg.indexOf('occupied') !== -1 || errorCode === 11003) {
          userMessage = '指南针被其他应用占用，请关闭其他导航应用后重试';
          canRetry = true;
        } else if (errorMsg.indexOf('system error') !== -1) {
          userMessage = '系统错误，请重启小程序或设备';
          canRetry = true;
        } else {
          userMessage = '指南针启动失败 (' + errorMsg + ')';
          canRetry = true;
        }
        
        // 尝试自动重试
        if (canRetry && manager.retryCount < manager.maxRetries) {
          manager.retryCount++;
          console.log('自动重试指南针启动，第' + manager.retryCount + '次');
          
          setTimeout(function() {
            self.retryStart();
          }, 2000); // 2秒后重试
          
          // 使用智能toast避免频繁重试提示
          manager.toastManager.showSmartToast('COMPASS_RETRY', '正在重试启动指南针...', {
            icon: 'loading',
            duration: 1500
          });
        } else {
          // 无法重试或重试次数用完
          if (self.callbacks.onCompassError) {
            self.callbacks.onCompassError({
              error: error,
              message: userMessage,
              canRetry: canRetry && manager.retryCount < manager.maxRetries,
              retryCount: manager.retryCount
            });
          }
          
          wx.showModal({
            title: '指南针启动失败',
            content: userMessage + (canRetry ? '\n\n您可以尝试手动重试。' : ''),
            showCancel: canRetry,
            cancelText: '重试',
            confirmText: '使用GPS替代',
            success: function(res) {
              if (res.cancel && canRetry) {
                // 用户选择重试
                manager.retryCount = 0;
                self.retryStart();
              } else {
                // 使用GPS航迹替代
                self.fallbackToGPS();
              }
            }
          });
        }
      },
      
      /**
       * 🔧 新增：强制重启指南针的内部方法
       */
      _doRestart: function() {
        var self = manager;
        console.log('🔧 执行指南针强制重启');
        
        // 获取当前页面的上下文
        var context = self.callbacks.getCurrentContext ? self.callbacks.getCurrentContext() : {};
        
        // 重置所有相关状态
        manager.isRunning = false;
        manager.retryCount = 0;
        
        // 清理所有状态
        wx.offCompassChange();
        
        // 延迟重新启动，确保系统状态完全清理
        setTimeout(function() {
          console.log('🔧 开始重新启动指南针');
          self._doStart(context);
        }, 200);
      },
      
      /**
       * 处理设备不支持指南针的情况
       * @param {Object} error 错误信息
       */
      handleCompassUnsupported: function(error) {
        var message = error.reason || '设备不支持指南针功能';
        
        console.log('设备不支持指南针:', message);
        
        wx.showModal({
          title: '指南针不可用',
          content: message + '\n\n将使用GPS航迹作为航向参考。',
          showCancel: false,
          confirmText: '知道了',
          success: function() {
            manager.fallbackToGPS();
          }
        });
        
        if (manager.callbacks.onCompassError) {
          manager.callbacks.onCompassError({
            error: error,
            message: message,
            fallback: true
          });
        }
      },
      
      /**
       * 重试启动指南针
       */
      retryStart: function() {
        console.log('🔄 重试启动指南针...');
        
        // 🔧 修复6：改进重试逻辑，确保状态一致
        if (manager.isRunning) {
          console.log('停止当前指南针以重试');
          manager.stop();
          
          // 等待停止完成后再重试（增加延迟时间）
          setTimeout(function() {
            manager._doRetryStart();
          }, 500); // 增加到500ms，确保完全停止
        } else {
          manager._doRetryStart();
        }
      },
      
      /**
       * 内部重试启动方法
       */
      _doRetryStart: function() {
        var context = {};
        
        // 尝试获取当前上下文
        if (manager.callbacks && manager.callbacks.getCurrentContext) {
          try {
            context = manager.callbacks.getCurrentContext() || {};
          } catch (e) {
            console.warn('获取上下文失败，使用默认值:', e);
          }
        }
        
        manager.start(context);
      },
      
      /**
       * 降级到GPS航迹模式
       */
      fallbackToGPS: function() {
        console.log('降级到GPS航迹模式');
        
        // 通知主页面切换到GPS航迹模式
        if (manager.callbacks.onFallbackToGPS) {
          manager.callbacks.onFallbackToGPS({
            reason: '指南针不可用',
            fallbackMode: 'gps-track'
          });
        }
        
        // 使用智能toast显示降级提示
        manager.toastManager.updateStatus('COMPASS_FALLBACK', 'gps_mode', '已切换到GPS航迹模式', {
          icon: 'success',
          duration: 2000
        });
      },
      
      /**
       * 停止指南针
       */
      stop: function() {
        // 🔧 修复5：增强停止方法 - 确保彻底清理
        if (!manager.isRunning || manager.isRunning === 'stopping') {
          console.log('指南针未运行或正在停止中，无需重复停止');
          return;
        }
        
        console.log('🛑 停止指南针...');
        
        // 立即设置状态，防止数据处理和重复调用
        manager.isRunning = 'stopping'; // 使用中间状态防止重复调用
        
        // 先清理事件监听器
        try {
          wx.offCompassChange();
        } catch (e) {
          console.warn('清理指南针监听器时出错:', e);
        }
        
        // 停止指南针API
        wx.stopCompass({
          success: function() {
            console.log('✅ 指南针已成功停止');
            manager.isRunning = false; // 设置为最终停止状态
            
            if (manager.callbacks.onCompassStopped) {
              manager.callbacks.onCompassStopped();
            }
          },
          fail: function(err) {
            console.warn('⚠️ 停止指南针时出现警告:', err);
            // 即使停止失败，也要确保状态正确
            manager.isRunning = false; // 强制设置为停止状态
            if (manager.callbacks.onCompassStopped) {
              manager.callbacks.onCompassStopped();
            }
          }
        });
        
        // 设置保险定时器，确保状态最终被设置为false
        setTimeout(function() {
          if (manager.isRunning === 'stopping') {
            console.log('⏰ 停止超时，强制设置状态为停止');
            manager.isRunning = false;
          }
        }, 1000); // 1秒超时保护
      },
      
      /**
       * 处理指南针数据 - 增强死区算法版
       * @param {Number} newHeading 新的航向值
       * @param {Object} context 当前上下文状态
       */
      handleCompassData: function(newHeading, context) {
        // 🔧 新增：静止状态完全锁定航向
        var currentSpeed = context.currentSpeed || 0;
        if (currentSpeed < config.compass.lowSpeedDefinition) {
          // 静止状态下，完全锁定航向显示
          if (context.lastStableHeading !== undefined && context.lastStableHeading !== null) {
            console.log('🚁 静止状态，锁定航向:', context.lastStableHeading + '°');
            return; // 直接返回，不更新任何航向
          }
        }
        
        // 卡尔曼滤波数据融合 (如果启用)
        var kalmanData = null;
        if (manager.kalmanRef && config.kalman && config.kalman.enabled) {
          // 计算置信度 (基于稳定性和设备状态)
          var confidence = manager.calculateCompassConfidence(newHeading, context);
          
          // 指南针测量更新
          manager.kalmanRef.updateCompass(newHeading, confidence);
          
          // 获取滤波后的状态
          kalmanData = manager.kalmanRef.getState();
          
          console.log('指南针卡尔曼滤波数据:', {
            raw: newHeading,
            confidence: confidence,
            filtered: kalmanData ? kalmanData.heading : null
          });
        }
        
        // 如果启用卡尔曼滤波，优先使用滤波后的航向
        var processedHeading = kalmanData ? kalmanData.heading : newHeading;
        
        // 如果是第一次读数，直接设置
        if (context.lastStableHeading === 0 && (!context.headingBuffer || context.headingBuffer.length === 0)) {
          var initialUpdate = {
            lastStableHeading: processedHeading,
            lastHeadingUpdateTime: Date.now(),
            heading: Math.round(processedHeading),
            kalmanEnabled: !!(kalmanData),
            headingBias: kalmanData ? kalmanData.headingBias : 0,
            headingLockTime: Date.now() // 🔧 记录锁定时间
          };
          
          if (manager.callbacks.onHeadingUpdate) {
            manager.callbacks.onHeadingUpdate(initialUpdate);
          }
          return;
        }
        
        // 🔧 使用死区算法处理航向数据
        var result = manager.processHeadingWithDeadzone(processedHeading, context);
        
        // 只有当死区算法允许更新时才更新显示
        if (result.shouldUpdate) {
          console.log('✅ 死区算法允许更新航向:', result.newHeading + '°');
          
          var update = {
            heading: result.newHeading,
            lastStableHeading: result.newHeading,
            lastHeadingUpdateTime: Date.now(),
            headingStability: 0, // 重置稳定性计数
            headingLockTime: Date.now(), // 🔧 更新锁定时间
            kalmanEnabled: !!(kalmanData),
            headingBias: kalmanData ? kalmanData.headingBias : 0
          };
          
          if (manager.callbacks.onHeadingUpdate) {
            manager.callbacks.onHeadingUpdate(update);
          }
        } else {
          console.log('🚫 死区算法阻止更新，变化不足:', Math.abs(result.angleDiff).toFixed(1) + '° < ' + result.threshold + '°');
        }
      },
      
      /**
       * 🔧 新增：死区算法处理航向数据
       * @param {Number} newHeading 新航向
       * @param {Object} context 上下文状态
       * @returns {Object} 处理结果
       */
      processHeadingWithDeadzone: function(newHeading, context) {
        var now = Date.now();
        var lastStableHeading = context.lastStableHeading || 0;
        var lastLockTime = context.headingLockTime || 0;
        
        // 🔧 死区参数配置
        var DEADZONE_ANGLE = 15;      // 15度死区
        var LOCK_TIME = 5000;         // 5秒锁定时间
        var BIG_CHANGE_THRESHOLD = 30; // 30度大变化阈值
        var BIG_CHANGE_CONFIRM_TIME = 3000; // 3秒确认时间
        
        var result = {
          shouldUpdate: false,
          newHeading: lastStableHeading,
          angleDiff: 0,
          threshold: DEADZONE_ANGLE
        };
        
        // 计算角度差异（处理循环）
        var angleDiff = manager.getAngleDifference(newHeading, lastStableHeading);
        result.angleDiff = angleDiff;
        
        // 🔧 检查时间锁定：5秒内不允许任何更新
        var timeSinceLock = now - lastLockTime;
        if (timeSinceLock < LOCK_TIME) {
          console.log('⏰ 航向时间锁定中，剩余:', ((LOCK_TIME - timeSinceLock) / 1000).toFixed(1) + 's');
          return result;
        }
        
        // 🔧 小变化死区：小于15度的变化完全忽略
        if (Math.abs(angleDiff) < DEADZONE_ANGLE) {
          return result; // 死区内，不更新
        }
        
        // 🔧 大变化确认：超过30度需要持续确认
        if (Math.abs(angleDiff) > BIG_CHANGE_THRESHOLD) {
          // 检查是否有确认状态
          if (!context.bigChangeStartTime) {
            // 开始大变化确认
            if (manager.callbacks.onContextUpdate) {
              manager.callbacks.onContextUpdate({
                bigChangeStartTime: now,
                bigChangeTargetHeading: newHeading
              });
            }
            console.log('🎯 开始大变化确认:', angleDiff.toFixed(1) + '°，需要持续' + (BIG_CHANGE_CONFIRM_TIME/1000) + 's');
            return result;
          } else {
            // 检查确认时间
            var confirmTime = now - context.bigChangeStartTime;
            var targetDiff = manager.getAngleDifference(newHeading, context.bigChangeTargetHeading);
            
            if (confirmTime >= BIG_CHANGE_CONFIRM_TIME && Math.abs(targetDiff) < 5) {
              // 确认时间足够且航向稳定，允许更新
              console.log('✅ 大变化确认成功:', angleDiff.toFixed(1) + '°');
              result.shouldUpdate = true;
              result.newHeading = Math.round(newHeading);
              result.threshold = BIG_CHANGE_THRESHOLD;
              
              // 清除确认状态
              if (manager.callbacks.onContextUpdate) {
                manager.callbacks.onContextUpdate({
                  bigChangeStartTime: null,
                  bigChangeTargetHeading: null
                });
              }
              
              return result;
            } else if (Math.abs(targetDiff) > 10) {
              // 目标变化太大，重新开始确认
              if (manager.callbacks.onContextUpdate) {
                manager.callbacks.onContextUpdate({
                  bigChangeStartTime: now,
                  bigChangeTargetHeading: newHeading
                });
              }
              console.log('🔄 目标变化，重新确认:', targetDiff.toFixed(1) + '°');
              return result;
            } else {
              console.log('⏳ 大变化确认中:', (confirmTime/1000).toFixed(1) + 's/' + (BIG_CHANGE_CONFIRM_TIME/1000) + 's');
              return result;
            }
          }
        }
        
        // 🔧 中等变化（15-30度）：立即更新
        console.log('📐 中等变化允许更新:', angleDiff.toFixed(1) + '°');
        result.shouldUpdate = true;
        result.newHeading = Math.round(newHeading);
        
        return result;
      },
      
      /**
       * 增强的航向平滑算法
       * @param {Number} newHeading 新航向
       * @param {Object} context 上下文状态
       * @returns {Object} 处理结果
       */
      smoothHeadingEnhanced: function(newHeading, context) {
        var now = Date.now();
        var buffer = context.headingBuffer ? context.headingBuffer.slice() : [];
        var bufferSize = config.compass.headingBufferSize;
        
        var result = {
          shouldUpdate: false,
          smoothedHeading: null,
          newHeadingBuffer: buffer,
          newLastStableHeading: context.lastStableHeading,
          newLastHeadingUpdateTime: context.lastHeadingUpdateTime || 0,
          newHeadingStability: context.headingStability || 0
        };
        
        // 时间控制：如果距离上次更新时间太短，跳过处理
        if (now - result.newLastHeadingUpdateTime < config.compass.minHeadingUpdateInterval) {
          return result;
        }
        
        // 添加新数据到缓冲区
        buffer.push(newHeading);
        if (buffer.length > bufferSize) {
          buffer.shift();
        }
        result.newHeadingBuffer = buffer;
        
        // 缓冲区数据不足时，快速启动（前3个数据）
        if (buffer.length < config.compass.fastStartupThreshold) {
          result.shouldUpdate = true;
          result.smoothedHeading = Math.round(newHeading);
          result.newLastStableHeading = newHeading;
          result.newLastHeadingUpdateTime = now;
          return result;
        }
        
        // 计算加权循环平均值
        var averageHeading = manager.calculateWeightedCircularMean(buffer);
        
        // 根据当前速度动态调整阈值
        var currentSpeed = context.currentSpeed || 0;
        var currentThreshold = currentSpeed < config.compass.lowSpeedDefinition ? 
            config.compass.headingLowSpeedThreshold : 
            config.compass.headingBaseThreshold;
        
        // 计算与上次稳定值的差异
        var headingDiff = manager.getAngleDifference(averageHeading, result.newLastStableHeading);
        
        // 增强稳定性检查：计算缓冲区内的标准差
        var headingStdDev = manager.calculateCircularStandardDeviation(buffer);
        
        // 更新判断逻辑
        if (Math.abs(headingDiff) > currentThreshold) {
          // 变化超过动态阈值时，进行稳定性检查
          if (manager.checkHeadingStabilityEnhanced(headingDiff, headingStdDev, currentSpeed, result.newHeadingStability)) {
            result.shouldUpdate = true;
            result.smoothedHeading = Math.round(averageHeading);
            result.newLastStableHeading = averageHeading;
            result.newLastHeadingUpdateTime = now;
            result.newHeadingStability = 0; // 重置稳定性计数器
          } else {
            result.newHeadingStability++; // 增加稳定性计数器
          }
        } else if (buffer.length >= bufferSize) {
          // 缓冲区满且变化很小时，进行微调（降低频率）
          if (now - result.newLastHeadingUpdateTime > config.compass.microAdjustInterval) { // 8秒无更新时强制微调
            result.shouldUpdate = true;
            result.smoothedHeading = Math.round(averageHeading);
            result.newLastStableHeading = averageHeading;
            result.newLastHeadingUpdateTime = now;
          }
        }
        
        return result;
      },
      
      /**
       * 增强的航向稳定性检查
       * @param {Number} headingDiff 航向差值
       * @param {Number} headingStdDev 标准差
       * @param {Number} currentSpeed 当前速度
       * @param {Number} headingStability 稳定性计数器
       * @returns {Boolean} 是否稳定
       */
      checkHeadingStabilityEnhanced: function(headingDiff, headingStdDev, currentSpeed, headingStability) {
        // 基于标准差的稳定性检查
        var stdDevThreshold = currentSpeed < config.compass.lowSpeedDefinition ? 
            config.compass.stdDevThreshold.lowSpeed : 
            config.compass.stdDevThreshold.normalSpeed;
        
        if (headingStdDev > stdDevThreshold) {
          // 数据太分散，不够稳定
          console.log('航向数据不稳定，标准差:', headingStdDev.toFixed(1));
          return false;
        }
        
        // 需要连续多次确认才更新
        var requiredStability = config.compass.requiredStabilityCount;
        if (headingStability >= requiredStability) {
          return true;
        }
        
        return false;
      },
      
      /**
       * 计算加权循环平均值（处理0-360度边界）
       * @param {Array} angles 角度数组
       * @returns {Number} 平均角度
       */
      calculateWeightedCircularMean: function(angles) {
        if (!angles || angles.length === 0) return 0;
        
        var sinSum = 0;
        var cosSum = 0;
        var totalWeight = 0;
        
        for (var i = 0; i < angles.length; i++) {
          // 指数权重，最新数据权重更大
          var weight = Math.pow(1.5, i);
          var radians = angles[i] * Math.PI / 180;
          
          sinSum += Math.sin(radians) * weight;
          cosSum += Math.cos(radians) * weight;
          totalWeight += weight;
        }
        
        sinSum /= totalWeight;
        cosSum /= totalWeight;
        
        var meanAngle = Math.atan2(sinSum, cosSum) * 180 / Math.PI;
        
        // 转换为0-360度
        return (meanAngle + 360) % 360;
      },
      
      /**
       * 计算循环标准差（评估数据稳定性）
       * @param {Array} angles 角度数组
       * @returns {Number} 标准差
       */
      calculateCircularStandardDeviation: function(angles) {
        if (!angles || angles.length === 0) return 0;
        
        var mean = manager.calculateWeightedCircularMean(angles);
        var squaredDiffs = 0;
        
        for (var i = 0; i < angles.length; i++) {
          var diff = manager.getAngleDifference(angles[i], mean);
          squaredDiffs += diff * diff;
        }
        
        return Math.sqrt(squaredDiffs / angles.length);
      },
      
      /**
       * 计算两个角度的最小差值（考虑循环）
       * @param {Number} angle1 角度1
       * @param {Number} angle2 角度2
       * @returns {Number} 最小差值（-180到180）
       */
      getAngleDifference: function(angle1, angle2) {
        var diff = angle1 - angle2;
        
        // 调整到-180到180范围
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        
        return diff;
      },
      
      /**
       * 简单循环平均值计算
       * @param {Array} angles 角度数组
       * @returns {Number} 平均角度
       */
      calculateSimpleCircularMean: function(angles) {
        if (!angles || angles.length === 0) return 0;
        
        var sinSum = 0;
        var cosSum = 0;
        
        for (var i = 0; i < angles.length; i++) {
          var radians = angles[i] * Math.PI / 180;
          sinSum += Math.sin(radians);
          cosSum += Math.cos(radians);
        }
        
        var meanAngle = Math.atan2(sinSum / angles.length, cosSum / angles.length) * 180 / Math.PI;
        
        // 转换为0-360度
        return (meanAngle + 360) % 360;
      },
      
      /**
       * 切换航向/航迹模式
       * @param {String} currentMode 当前模式
       * @returns {Object} {newMode: String, message: String}
       */
      toggleHeadingMode: function(currentMode) {
        var newMode = currentMode === 'heading' ? 'track' : 'heading';
        var message = newMode === 'heading' ? '航向模式' : '航迹模式';
        
        // 显示提示
        wx.showToast({
          title: message,
          icon: 'none',
          duration: 1500
        });
        
        // 通知状态变化
        if (manager.callbacks.onModeChange) {
          manager.callbacks.onModeChange({
            newMode: newMode,
            oldMode: currentMode,
            message: message
          });
        }
        
        return {
          newMode: newMode,
          message: message
        };
      },
      
      /**
       * 获取用于地图显示的稳定航向
       * @param {Object} context 上下文状态
       * @returns {Number} 地图显示航向
       */
      getMapDisplayHeading: function(context) {
        // 如果是北向朝上模式，始终返回0
        if (context.mapOrientationMode === 'north-up') {
          return 0;
        }
        
        var currentSpeed = context.currentSpeed || 0;
        var currentHeading = context.headingMode === 'heading' ? context.heading : context.track;
        var now = Date.now();
        
        // 低速时锁定地图方向
        if (currentSpeed < config.map.lowSpeedThreshold) {
          if (!context.mapHeadingLocked) {
            // 刚进入低速状态，锁定当前航向
            var lockUpdate = {
              mapHeadingLocked: true,
              mapStableHeading: currentHeading
            };
            
            if (manager.callbacks.onMapHeadingLock) {
              manager.callbacks.onMapHeadingLock(lockUpdate);
            }
            
            console.log('低速锁定地图航向:', currentHeading);
          }
          return context.mapStableHeading || currentHeading;
        } else {
          // 解除锁定
          if (context.mapHeadingLocked) {
            if (manager.callbacks.onMapHeadingUnlock) {
              manager.callbacks.onMapHeadingUnlock();
            }
          }
        }
        
        // 检查是否需要更新地图航向
        var headingDiff = manager.getAngleDifference(currentHeading, context.mapStableHeading || 0);
        var timeSinceLastUpdate = now - (context.lastMapHeadingUpdate || 0);
        
        // 增加时间限制，避免频繁更新
        if (Math.abs(headingDiff) > config.map.headingUpdateThreshold && 
            timeSinceLastUpdate > config.map.headingUpdateMinInterval) {
          
          var headingUpdate = {
            mapStableHeading: currentHeading,
            lastMapHeadingUpdate: now
          };
          
          if (manager.callbacks.onMapHeadingUpdate) {
            manager.callbacks.onMapHeadingUpdate(headingUpdate);
          }
          
          console.log('更新地图航向:', currentHeading);
          return currentHeading;
        }
        
        return context.mapStableHeading || currentHeading;
      },
      
      /**
       * 获取指南针状态
       * @returns {Object} 状态信息
       */
      getStatus: function() {
        return {
          isRunning: manager.isRunning,
          hasCallbacks: !!manager.callbacks
        };
      },
      
      /**
       * 计算指南针置信度
       * @param {Number} newHeading 新航向值
       * @param {Object} context 当前上下文状态
       * @returns {Number} 置信度 [0-1]
       */
      calculateCompassConfidence: function(newHeading, context) {
        var confidence = 1.0; // 基础置信度
        
        // 基于航向稳定性调整置信度
        var headingBuffer = context.headingBuffer || [];
        if (headingBuffer.length > 3) {
          // 计算缓冲区内的标准差
          var mean = headingBuffer.reduce(function(sum, h) { return sum + h; }, 0) / headingBuffer.length;
          var variance = headingBuffer.reduce(function(sum, h) { return sum + Math.pow(h - mean, 2); }, 0) / headingBuffer.length;
          var stdDev = Math.sqrt(variance);
          
          // 标准差越大，置信度越低
          if (stdDev > 15) {
            confidence *= 0.4; // 变化剧烈时置信度很低
          } else if (stdDev > 8) {
            confidence *= 0.7; // 变化较大时置信度较低
          } else if (stdDev > 3) {
            confidence *= 0.9; // 变化较小时置信度较高
          }
          // stdDev <= 3 保持满置信度
        }
        
        // 基于当前速度调整置信度（低速时指南针不太可靠）
        var currentSpeed = context.currentSpeed || 0;
        if (currentSpeed < config.compass.lowSpeedDefinition) {
          confidence *= 0.6; // 低速时降低置信度
        } else if (currentSpeed < config.compass.minSpeedForTrack) {
          confidence *= 0.8; // 极低速时进一步降低置信度
        }
        
        // 基于设备支持状态调整
        if (manager.compassSupported === false) {
          confidence *= 0.2; // 设备不支持时大幅降低置信度
        }
        
        // 基于重试次数调整（多次重试说明不稳定）
        if (manager.retryCount > 0) {
          confidence *= Math.max(0.3, 1.0 - (manager.retryCount * 0.2));
        }
        
        // 基于航向稳定性计数器调整
        var stability = context.headingStability || 0;
        if (stability < config.compass.requiredStabilityCount) {
          confidence *= (0.5 + 0.5 * stability / config.compass.requiredStabilityCount);
        }
        
        // 确保置信度在有效范围内
        confidence = Math.max(0.1, Math.min(1.0, confidence));
        
        return confidence;
      },
      
      /**
       * 销毁管理器
       */
      destroy: function() {
        console.log('🧹 销毁指南针管理器...');
        
        // 🔧 修复7：增强销毁方法 - 彻底清理所有资源
        if (manager.isRunning) {
          manager.stop();
        }
        
        // 强制清理事件监听器（防止遗漏）
        try {
          wx.offCompassChange();
        } catch (e) {
          console.warn('清理指南针监听器时出错:', e);
        }
        
        // 强制停止指南针（防止遗漏）
        try {
          wx.stopCompass({
            success: function() {
              console.log('销毁时强制停止指南针成功');
            },
            fail: function(err) {
              console.warn('销毁时强制停止指南针失败:', err);
            }
          });
        } catch (e) {
          console.warn('强制停止指南针时出错:', e);
        }
        
        // 清理toast管理器
        if (manager.toastManager) {
          manager.toastManager.clearAll();
          manager.toastManager = null;
        }
        
        // 重置所有状态
        manager.isRunning = false;
        manager.retryCount = 0;
        manager.compassSupported = null;
        manager.callbacks = null;
        manager.pageRef = null;
        manager.kalmanRef = null;
        
        console.log('✅ 指南针管理器已彻底销毁');
      }
    };
    
    return manager;
  }
};

module.exports = CompassManager;