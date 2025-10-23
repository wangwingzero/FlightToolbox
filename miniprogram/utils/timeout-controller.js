/**
 * 超时控制工具
 * 
 * 为异步操作提供超时控制机制
 * 防止无限重试和长时间等待
 * 
 * @author FlightToolbox Team
 * @version 1.0.0
 */

const TimeoutController = {
  // 默认超时时间（毫秒）
  DEFAULT_TIMEOUT: 5000,
  
  // 最大重试次数
  MAX_RETRY_COUNT: 3,
  
  // 重试延迟基数（毫秒）
  RETRY_DELAY_BASE: 1000,
  
  /**
   * 为Promise添加超时控制
   */
  withTimeout(promise, timeout = this.DEFAULT_TIMEOUT) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`操作超时 (${timeout}ms)`)), timeout)
      )
    ]);
  },
  
  /**
   * 带重试机制的异步操作
   */
  async withRetry(asyncFn, maxRetryCount = this.MAX_RETRY_COUNT, retryDelayBase = this.RETRY_DELAY_BASE) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetryCount; attempt++) {
      try {
        console.log(`🔄 尝试执行操作 (第${attempt}次)`);
        
        const result = await this.withTimeout(asyncFn(), this.DEFAULT_TIMEOUT * attempt);
        
        if (attempt > 1) {
          console.log(`✅ 操作在第${attempt}次尝试后成功`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ 第${attempt}次尝试失败:`, error.message);
        
        // 如果是最后一次尝试，直接抛出错误
        if (attempt === maxRetryCount) {
          console.error('❌ 所有重试尝试均失败');
          throw new Error(`操作失败，已重试${maxRetryCount}次。最后错误: ${lastError.message}`);
        }
        
        // 计算重试延迟（指数退避）
        const delay = retryDelayBase * Math.pow(2, attempt - 1);
        console.log(`⏳ 等待${delay}ms后重试...`);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  },
  
  /**
   * 带超时的音频操作
   */
  async withAudioTimeout(audioOperation, timeout = 10000) {
    return this.withTimeout(audioOperation, timeout);
  },
  
  /**
   * 带重试的音频上下文创建
   */
  async createAudioContextWithRetry(createFn, maxRetryCount = this.MAX_RETRY_COUNT) {
    return this.withRetry(async () => {
      const audioContext = createFn();
      
      // 验证音频上下文是否有效
      if (!audioContext) {
        throw new Error('音频上下文创建失败');
      }
      
      return audioContext;
    }, maxRetryCount);
  },
  
  /**
   * 带超时的分包加载
   */
  async loadSubpackageWithTimeout(packageName, timeout = 15000) {
    return this.withTimeout(new Promise((resolve, reject) => {
      wx.loadSubpackage({
        name: packageName,
        success: resolve,
        fail: reject
      });
    }), timeout);
  },
  
  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * 防抖函数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * 节流函数
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  /**
   * 批量操作控制
   */
  async batchExecute(operations, concurrency = 3) {
    const results = [];
    const executing = [];
    
    for (const operation of operations) {
      const promise = operation().then(result => {
        executing.splice(executing.indexOf(promise), 1);
        return result;
      });
      
      results.push(promise);
      
      if (operations.length >= concurrency) {
        executing.push(promise);
        
        if (executing.length >= concurrency) {
          await Promise.race(executing);
        }
      }
    }
    
    return Promise.all(results);
  },
  
  /**
   * 创建带取消功能的Promise
   */
  createCancellablePromise(asyncFn) {
    let isCancelled = false;
    
    const promise = new Promise(async (resolve, reject) => {
      if (isCancelled) {
        reject(new Error('操作已取消'));
        return;
      }
      
      try {
        const result = await asyncFn();
        if (!isCancelled) {
          resolve(result);
        }
      } catch (error) {
        if (!isCancelled) {
          reject(error);
        }
      }
    });
    
    promise.cancel = () => {
      isCancelled = true;
    };
    
    return promise;
  }
};

module.exports = TimeoutController;