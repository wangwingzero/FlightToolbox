/**
 * 指南针航向管理器模块 - 极简版
 * 
 * 设计原则：
 * - 直接使用原始指南针数据
 * - 移除复杂的平滑和滤波逻辑
 * - 保持基本功能
 */

var ConsoleHelper = require('../../../utils/console-helper.js');

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
      pageRef: null,
      isRunning: false,
      compassSupported: null,
      
      // 平滑处理状态
      headingBuffer: [],
      lastStableHeading: 0,
      lastHeadingUpdateTime: 0,
      headingStability: 0,
      
      /**
       * 初始化管理器
       * @param {Object} page 页面实例
       * @param {Object} callbacks 回调函数集合
       */
      init: function(page, callbacks) {
        manager.pageRef = page;
        manager.callbacks = callbacks || {};
        console.log('🧭 指南针管理器初始化完成（极简版）');
      },
      
      /**
       * 启动指南针 - 极简版
       * @param {Object} context 当前上下文
       */
      start: function(context) {
        ConsoleHelper.compass('🧭 启动指南针（极简版）');
        
        // 防止重复启动
        if (manager.isRunning) {
          ConsoleHelper.compass('🧭 指南针已经在运行中，跳过启动');
          return;
        }
        
        // 确保完全停止后再启动
        manager.stopAndStart();
      },
      
      /**
       * 停止并重新启动指南针
       */
      stopAndStart: function() {
        // 先强制停止
        wx.stopCompass({
          success: function() {
            ConsoleHelper.compass('🧭 停止旧指南针成功');
          },
          fail: function(err) {
            ConsoleHelper.compass('⚠️ 停止旧指南针失败（可能本来就没启动）: ' + (err.errMsg || ''));
          },
          complete: function() {
            // 停止完成后，等待一小段时间再启动
            setTimeout(function() {
              manager.checkCompassSupport(function(supported) {
                if (supported) {
                  manager.doStartCompass();
                } else {
                  console.warn('⚠️ 设备不支持指南针');
                }
              });
            }, 200);
          }
        });
        
        // 同时清理状态
        wx.offCompassChange();
        manager.isRunning = false;
        manager.headingBuffer = [];
        manager.headingStability = 0;
      },
      
      /**
       * 检查指南针支持
       * @param {Function} callback 回调函数
       */
      checkCompassSupport: function(callback) {
        if (manager.compassSupported !== null) {
          callback(manager.compassSupported);
          return;
        }
        
        // 简单的支持检查
        wx.getSystemInfo({
          success: function(res) {
            // 大部分现代手机都支持指南针
            manager.compassSupported = true;
            callback(true);
          },
          fail: function() {
            manager.compassSupported = false;
            callback(false);
          }
        });
      },
      
      /**
       * 启动指南针监听
       */
      startCompass: function() {
        // 防止重复启动
        if (manager.isRunning) {
          ConsoleHelper.compass('🧭 指南针已经在运行中，跳过启动');
          return;
        }
        
        // 直接启动新的指南针
        manager.doStartCompass();
      },
      
      /**
       * 执行指南针启动
       */
      doStartCompass: function() {
        // 再次检查状态，防止重复启动
        if (manager.isRunning) {
          ConsoleHelper.compass('🧭 指南针已在运行，取消启动');
          return;
        }
        
        wx.startCompass({
          success: function() {
            ConsoleHelper.success('✅ 指南针启动成功');
            manager.isRunning = true;
            
            // 监听指南针数据
            wx.onCompassChange(function(res) {
              manager.handleCompassChange(res);
            });
            
            if (manager.callbacks.onCompassStart) {
              manager.callbacks.onCompassStart();
            }
          },
          fail: function(err) {
            ConsoleHelper.error('❌ 指南针启动失败: ' + (err.errMsg || '未知错误'));
            manager.compassSupported = false;
            manager.isRunning = false;
            
            if (manager.callbacks.onCompassError) {
              manager.callbacks.onCompassError(err);
            }
          }
        });
      },
      
      /**
       * 处理指南针数据变化 - 平滑版
       * @param {Object} res 指南针数据
       */
      handleCompassChange: function(res) {
        if (!res || res.direction === undefined) return;
        
        var rawHeading = res.direction;
        
        // 🔧 修复：添加航向偏移修正（解决90度偏差问题）
        // 某些设备或平台可能存在坐标系偏差，添加可配置的修正值
        var headingOffset = config.compass.headingOffset || 0;
        if (headingOffset !== 0) {
          rawHeading = (rawHeading + headingOffset + 360) % 360;
          console.log('🧭 航向修正:', res.direction + '° → ' + rawHeading + '° (偏移:' + headingOffset + '°)');
        }
        
        var currentTime = Date.now();
        
        // 添加到缓冲区
        manager.headingBuffer.push(rawHeading);
        
        // 限制缓冲区大小
        if (manager.headingBuffer.length > config.compass.headingBufferSize) {
          manager.headingBuffer.shift();
        }
        
        // 计算平滑后的航向
        var smoothedHeading = manager.calculateSmoothedHeading();
        
        // 检查是否需要更新显示
        var shouldUpdate = manager.shouldUpdateHeading(
          smoothedHeading, 
          currentTime
        );
        
        if (shouldUpdate) {
          var finalHeading = Math.round(smoothedHeading);
          
          // 更新稳定航向
          manager.lastStableHeading = finalHeading;
          manager.lastHeadingUpdateTime = currentTime;
          manager.headingStability++;
          
          // 更新页面数据
          if (manager.pageRef && manager.pageRef.setData) {
            manager.pageRef.setData({
              heading: finalHeading
            });
          }
          
          // 回调航向更新
          if (manager.callbacks.onHeadingUpdate) {
            manager.callbacks.onHeadingUpdate({
              heading: finalHeading,
              lastStableHeading: finalHeading,  // 🔧 添加缺失的字段
              accuracy: res.accuracy || 0,
              smoothedValue: smoothedHeading,
              headingStability: manager.headingStability  // 🔧 添加稳定性信息
            });
          }
        }
      },
      
      /**
       * 计算平滑后的航向
       * @returns {Number} 平滑后的航向值
       */
      calculateSmoothedHeading: function() {
        if (manager.headingBuffer.length === 0) {
          return manager.lastStableHeading;
        }
        
        if (manager.headingBuffer.length === 1) {
          return manager.headingBuffer[0];
        }
        
        // 使用圆形平均算法处理角度
        var x = 0, y = 0;
        for (var i = 0; i < manager.headingBuffer.length; i++) {
          var angle = manager.headingBuffer[i] * Math.PI / 180;
          x += Math.cos(angle);
          y += Math.sin(angle);
        }
        
        var avgAngle = Math.atan2(y, x) * 180 / Math.PI;
        
        // 标准化到0-360度
        while (avgAngle < 0) avgAngle += 360;
        while (avgAngle >= 360) avgAngle -= 360;
        
        return avgAngle;
      },
      
      /**
       * 判断是否应该更新航向显示
       * @param {Number} newHeading 新的航向值
       * @param {Number} currentTime 当前时间
       * @returns {Boolean} 是否应该更新
       */
      shouldUpdateHeading: function(newHeading, currentTime) {
        // 首次更新
        if (manager.lastHeadingUpdateTime === 0) {
          return true;
        }
        
        // 时间间隔检查
        var timeDiff = currentTime - manager.lastHeadingUpdateTime;
        if (timeDiff < config.compass.minHeadingUpdateInterval) {
          return false;
        }
        
        // 计算角度差异
        var headingDiff = Math.abs(newHeading - manager.lastStableHeading);
        if (headingDiff > 180) {
          headingDiff = 360 - headingDiff;
        }
        
        // 根据当前速度调整阈值
        var currentSpeed = 0;
        if (manager.pageRef && manager.pageRef.data) {
          currentSpeed = manager.pageRef.data.speed || 0;
        }
        
        var threshold = currentSpeed < 5 ? 
          config.compass.headingLowSpeedThreshold : 
          config.compass.headingBaseThreshold;
        
        // 检查变化是否足够大
        if (headingDiff >= threshold) {
          manager.headingStability = 0; // 重置稳定性计数
          return true;
        }
        
        // 强制定期更新（防止完全停止更新）
        if (timeDiff > config.compass.minHeadingUpdateInterval * 3) {
          return true;
        }
        
        return false;
      },
      
      /**
       * 停止指南针
       */
      stop: function() {
        ConsoleHelper.compass('🛑 停止指南针');
        
        // 强制停止指南针，忽略错误
        wx.stopCompass({
          success: function() {
            ConsoleHelper.compass('✅ 指南针停止成功');
          },
          fail: function(err) {
            ConsoleHelper.compass('⚠️ 指南针停止失败（可能本来就没启动）: ' + (err.errMsg || ''));
          }
        });
        wx.offCompassChange();
        
        manager.isRunning = false;
        
        // 清除缓冲区和状态
        manager.headingBuffer = [];
        manager.headingStability = 0;
        manager.lastHeadingUpdateTime = 0;
        
        if (manager.callbacks.onCompassStop) {
          manager.callbacks.onCompassStop();
        }
      },
      
      /**
       * 切换航向/航迹模式
       * @param {string} currentMode 当前模式 ('heading' 或 'track')
       */
      toggleHeadingMode: function(currentMode) {
        var newMode = currentMode === 'heading' ? 'track' : 'heading';
        
        console.log('🧭 切换航向模式:', currentMode, '->', newMode);
        
        // 更新页面数据
        if (manager.pageRef && manager.pageRef.setData) {
          manager.pageRef.setData({
            headingMode: newMode
          });
        }
        
        // 回调模式切换
        if (manager.callbacks.onModeChange) {
          manager.callbacks.onModeChange({
            oldMode: currentMode,
            newMode: newMode
          });
        }
      },
      
      /**
       * 获取运行状态
       * @returns {Object} 状态信息
       */
      getStatus: function() {
        return {
          isRunning: manager.isRunning,
          compassSupported: manager.compassSupported
        };
      }
    };
    
    return manager;
  }
};

module.exports = CompassManager;