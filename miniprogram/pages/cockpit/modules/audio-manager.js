/**
 * 音频播放管理器模块
 * 
 * 功能特性：
 * - GPS欺骗警告音频播放
 * - 播放状态管理
 * - 错误处理和重试机制
 * - 音频上下文管理
 */

var Logger = require('./logger.js');

module.exports = {
  /**
       * 创建音频管理器实例
       * @param {Object} config 配置对象
       * @returns {Object} 管理器实例
       */
      create: function(config) {
        var manager = {
          // 配置对象
          config: config || {},
          
          // 音频上下文
          audioContext: null,
          
          // 当前播放状态
          isPlaying: false,
          
          // 播放队列
          playQueue: [],
          
          // 回调函数
          callbacks: {},
      
      /**
       * 初始化音频管理器
       * @param {Object} callbacks 回调函数集合
       */
      init: function(callbacks) {
        manager.callbacks = callbacks || {};
        
        // 创建音频上下文
        try {
          manager.audioContext = wx.createInnerAudioContext();
          manager.setupAudioContext();
        } catch (e) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.error('创建音频上下文失败:', e);
          }
        }
      },
      
      /**
       * 设置音频上下文
       */
      setupAudioContext: function() {
        if (!manager.audioContext) return;
        
        // 设置音频属性
        manager.audioContext.autoplay = false;
        manager.audioContext.loop = false;
        manager.audioContext.volume = 1.0;
        
        // 播放成功事件
        manager.audioContext.onPlay(function() {
          manager.isPlaying = true;
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.debug('🔊 音频开始播放');
          }
        });
        
        // 播放结束事件
        manager.audioContext.onEnded(function() {
          manager.isPlaying = false;
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.debug('🔊 音频播放结束');
          }
          
          // 处理播放队列
          manager.processPlayQueue();
        });
        
        // 播放错误事件
        manager.audioContext.onError(function(res) {
          manager.isPlaying = false;
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.error('🔊 音频播放错误:', res.errMsg);
          }
          
          // 触发错误回调
          if (manager.callbacks.onPlayError) {
            manager.callbacks.onPlayError(res.errMsg);
          }
          
          // 继续处理队列
          manager.processPlayQueue();
        });
        
        // 音频可以播放事件
        manager.audioContext.onCanplay(function() {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.debug('🔊 音频已准备就绪');
          }
        });
      },
      
      /**
       * 播放GPS欺骗警告音频
       * @param {String} audioPath 音频文件路径
       * @param {Function} onComplete 播放完成回调
       */
      playGPSSpoofingAlert: function(audioPath, onComplete) {
        if (!manager.audioContext) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.error('音频上下文未初始化');
          }
          if (onComplete) onComplete(false);
          return;
        }
        
        // 添加到播放队列
        manager.playQueue.push({
          path: audioPath,
          callback: onComplete,
          timestamp: Date.now()
        });
        
        // 如果当前没有播放，立即开始
        if (!manager.isPlaying) {
          manager.processPlayQueue();
        }
      },
      
      /**
       * 处理播放队列
       */
      processPlayQueue: function() {
        if (manager.playQueue.length === 0) {
          return;
        }
        
        if (manager.isPlaying) {
          return;
        }
        
        // 取出队列中的第一个任务
        var task = manager.playQueue.shift();
        
        // 检查任务是否过期（超过10秒）
        if (Date.now() - task.timestamp > 10000) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.warn('🔊 音频播放任务已过期，跳过');
          }
          if (task.callback) task.callback(false);
          
          // 继续处理下一个
          manager.processPlayQueue();
          return;
        }
        
        // 执行播放
        manager.playAudio(task.path, task.callback);
      },
      
      /**
       * 播放音频文件
       * @param {String} audioPath 音频路径
       * @param {Function} onComplete 完成回调
       */
      playAudio: function(audioPath, onComplete) {
        if (!manager.audioContext) {
          if (onComplete) onComplete(false);
          return;
        }
        
        try {
          // 处理路径
          var fullPath = audioPath;
          
          // 如果是相对路径，转换为完整路径
          if (!audioPath.startsWith('/')) {
            // 相对于cockpit模块的路径
            fullPath = '/pages/cockpit/' + audioPath;
          }
          
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.debug('🔊 准备播放音频:', fullPath);
          }
          
          // 设置音频源
          manager.audioContext.src = fullPath;
          
          // 设置播放完成回调
          if (onComplete) {
            var endHandler = function() {
              manager.audioContext.offEnded(endHandler);
              onComplete(true);
            };
            
            var errorHandler = function() {
              manager.audioContext.offError(errorHandler);
              onComplete(false);
            };
            
            manager.audioContext.onEnded(endHandler);
            manager.audioContext.onError(errorHandler);
          }
          
          // 开始播放
          manager.audioContext.play();
          
        } catch (e) {
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.error('🔊 播放音频失败:', e);
          }
          if (onComplete) onComplete(false);
        }
      },
      
      /**
       * 停止当前播放
       */
      stopCurrentPlay: function() {
        if (manager.audioContext && manager.isPlaying) {
          try {
            manager.audioContext.stop();
            manager.isPlaying = false;
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.debug('🔊 音频播放已停止');
            }
          } catch (e) {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.error('停止音频播放失败:', e);
            }
          }
        }
      },
      
      /**
       * 暂停播放
       */
      pause: function() {
        if (manager.audioContext && manager.isPlaying) {
          try {
            manager.audioContext.pause();
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.debug('🔊 音频播放已暂停');
            }
          } catch (e) {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.error('暂停音频播放失败:', e);
            }
          }
        }
      },
      
      /**
       * 恢复播放
       */
      resume: function() {
        if (manager.audioContext && !manager.isPlaying) {
          try {
            manager.audioContext.play();
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.debug('🔊 音频播放已恢复');
            }
          } catch (e) {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.error('恢复音频播放失败:', e);
            }
          }
        }
      },
      
      /**
       * 设置音量
       * @param {Number} volume 音量值（0-1）
       */
      setVolume: function(volume) {
        if (manager.audioContext) {
          var vol = Math.max(0, Math.min(1, volume));
          manager.audioContext.volume = vol;
          if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
            Logger.debug('🔊 音量设置为:', vol);
          }
        }
      },
      
      /**
       * 清空播放队列
       */
      clearQueue: function() {
        manager.playQueue = [];
        if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
          Logger.debug('🔊 播放队列已清空');
        }
      },
      
      /**
       * 销毁音频管理器
       */
      destroy: function() {
        if (manager.audioContext) {
          try {
            manager.stopCurrentPlay();
            manager.audioContext.destroy();
            manager.audioContext = null;
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.debug('🔊 音频管理器已销毁');
            }
          } catch (e) {
            if (manager.config && manager.config.debug && manager.config.debug.enableVerboseLogging) {
              Logger.error('销毁音频管理器失败:', e);
            }
          }
        }
        
        manager.playQueue = [];
        manager.isPlaying = false;
      },
      
      /**
       * 获取管理器状态
       * @returns {Object} 状态信息
       */
      getStatus: function() {
        return {
          hasContext: !!manager.audioContext,
          isPlaying: manager.isPlaying,
          queueLength: manager.playQueue.length,
          volume: manager.audioContext ? manager.audioContext.volume : 0
        };
      }
    };
    
    return manager;
  }
};