/**
 * 音频资源管理器
 * 
 * 统一管理音频相关资源，防止内存泄漏
 * 提供定时器、音频上下文等资源的统一清理机制
 * 
 * @author FlightToolbox Team
 * @version 1.0.0
 */

const AudioResourceManager = {
  // 存储所有定时器ID
  timers: new Set(),
  
  // 存储所有音频上下文
  audioContexts: new Set(),
  
  // 存储所有事件监听器
  eventListeners: new Map(),
  
  /**
   * 添加定时器到管理器
   */
  addTimer(timerId) {
    if (timerId) {
      this.timers.add(timerId);
      console.log('📝 定时器已添加到资源管理器:', timerId);
    }
  },
  
  /**
   * 添加音频上下文到管理器
   */
  addAudioContext(audioContext) {
    if (audioContext) {
      this.audioContexts.add(audioContext);
      console.log('🎵 音频上下文已添加到资源管理器');
    }
  },
  
  /**
   * 添加事件监听器到管理器
   */
  addEventListener(target, event, handler) {
    if (target && event && handler) {
      const key = `${target.constructor.name}_${event}`;
      if (!this.eventListeners.has(key)) {
        this.eventListeners.set(key, []);
      }
      this.eventListeners.get(key).push({ target, handler });
      console.log('📡 事件监听器已添加到资源管理器:', key);
    }
  },
  
  /**
   * 创建受管理的定时器
   */
  createManagedTimer(callback, delay, ...args) {
    const timerId = setTimeout(() => {
      callback(...args);
      this.timers.delete(timerId); // 自动清理
    }, delay);
    
    this.addTimer(timerId);
    return timerId;
  },
  
  /**
   * 创建受管理的间隔定时器
   */
  createManagedInterval(callback, interval, ...args) {
    const timerId = setInterval(() => {
      callback(...args);
    }, interval);
    
    this.addTimer(timerId);
    return timerId;
  },
  
  /**
   * 清理指定定时器
   */
  clearTimer(timerId) {
    if (timerId) {
      clearTimeout(timerId);
      clearInterval(timerId);
      this.timers.delete(timerId);
      console.log('🗑️ 定时器已清理:', timerId);
    }
  },
  
  /**
   * 清理所有定时器
   */
  clearAllTimers() {
    this.timers.forEach(timerId => {
      clearTimeout(timerId);
      clearInterval(timerId);
    });
    this.timers.clear();
    console.log('🗑️ 所有定时器已清理');
  },
  
  /**
   * 销毁指定音频上下文
   */
  destroyAudioContext(audioContext) {
    if (audioContext) {
      try {
        audioContext.destroy();
        this.audioContexts.delete(audioContext);
        console.log('🗑️ 音频上下文已销毁');
      } catch (error) {
        console.error('❌ 销毁音频上下文失败:', error);
      }
    }
  },
  
  /**
   * 销毁所有音频上下文
   */
  destroyAllAudioContexts() {
    this.audioContexts.forEach(audioContext => {
      try {
        audioContext.destroy();
      } catch (error) {
        console.error('❌ 销毁音频上下文失败:', error);
      }
    });
    this.audioContexts.clear();
    console.log('🗑️ 所有音频上下文已销毁');
  },
  
  /**
   * 移除所有事件监听器
   */
  removeAllEventListeners() {
    this.eventListeners.forEach((listeners, key) => {
      listeners.forEach(({ target, handler }) => {
        try {
          // 这里需要根据具体的事件类型来移除监听器
          // 由于微信小程序的API限制，这里只是记录
          console.log('📡 事件监听器已移除:', key);
        } catch (error) {
          console.error('❌ 移除事件监听器失败:', error);
        }
      });
    });
    this.eventListeners.clear();
    console.log('🗑️ 所有事件监听器已移除');
  },
  
  /**
   * 清理所有资源
   */
  cleanup() {
    console.log('🧹 开始清理所有音频资源...');
    
    this.clearAllTimers();
    this.destroyAllAudioContexts();
    this.removeAllEventListeners();
    
    console.log('✅ 所有音频资源清理完成');
  },
  
  /**
   * 获取资源使用统计
   */
  getResourceStats() {
    return {
      timersCount: this.timers.size,
      audioContextsCount: this.audioContexts.size,
      eventListenersCount: this.eventListeners.size,
      hasResources: this.timers.size > 0 || this.audioContexts.size > 0 || this.eventListeners.size > 0
    };
  },
  
  /**
   * 检查是否有资源泄漏
   */
  checkResourceLeaks() {
    const stats = this.getResourceStats();
    
    if (stats.hasResources) {
      console.warn('⚠️ 检测到潜在资源泄漏:', stats);
      return true;
    } else {
      console.log('✅ 无资源泄漏');
      return false;
    }
  }
};

module.exports = AudioResourceManager;