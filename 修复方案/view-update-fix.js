/**
 * 视图更新错误修复方案
 * 解决：FrameworkError updateTextView:fail:got 'null' when get view by the given viewId
 */

// 1. 页面销毁状态管理（添加到index.js）
customOnUnload: function() {
  console.log('🗑️ 驾驶舱页面卸载 - 销毁所有模块');
  
  // 🔧 关键修复：立即标记页面为销毁状态
  this._isDestroying = true;
  this._unloadStartTime = Date.now();
  
  // 🔧 修复：立即停止所有定时器和异步操作
  this.stopAllTimersAndOperations();
  
  // 先停止所有可能触发setData的操作
  if (this.mapRenderer) {
    this.mapRenderer.stopRenderLoop();
  }
  
  // 🔧 修复：延迟销毁改为立即销毁，避免竞态条件
  this.destroyModules();
  
  // 🔧 新增：强制清理页面引用
  setTimeout(() => {
    this.clearPageReferences();
  }, 1000);
},

// 2. 停止所有定时器的方法
stopAllTimersAndOperations: function() {
  var self = this;
  
  console.log('⏹️ 停止所有定时器和异步操作');
  
  // GPS管理器的定时器
  if (this.gpsManager) {
    this.gpsManager.stopLocationTracking();
  }
  
  // 指南针管理器的定时器
  if (this.compassManager && this.compassManager.updateTimer) {
    clearInterval(this.compassManager.updateTimer);
    this.compassManager.updateTimer = null;
  }
  
  // 地图渲染器的动画帧
  if (this.mapRenderer) {
    this.mapRenderer.stopRenderLoop();
    this.mapRenderer.cancelAllAnimationFrames();
  }
  
  // 姿态仪表的定时器
  if (this.attitudeIndicator && this.attitudeIndicator.animationId) {
    cancelAnimationFrame(this.attitudeIndicator.animationId);
    this.attitudeIndicator.animationId = null;
  }
  
  // 清除所有页面级定时器
  for (var timer in this.timers) {
    clearTimeout(this.timers[timer]);
    clearInterval(this.timers[timer]);
  }
  this.timers = {};
},

// 3. 安全的setData包装器
safeSetData: function(data, callback) {
  // 🔧 关键修复：检查页面销毁状态
  if (this._isDestroying) {
    console.warn('⚠️ 页面已销毁，跳过setData操作:', Object.keys(data));
    callback && callback();
    return;
  }
  
  // 🔧 修复：检查页面实例是否有效
  if (!this || typeof this.setData !== 'function') {
    console.warn('⚠️ 页面实例无效，跳过setData操作');
    callback && callback();
    return;
  }
  
  // 🔧 修复：检查数据是否为空
  if (!data || Object.keys(data).length === 0) {
    console.warn('⚠️ setData数据为空，跳过操作');
    callback && callback();
    return;
  }
  
  try {
    // 🔧 修复：使用try-catch包装，避免框架级错误
    this.setData(data, function() {
      if (!this._isDestroying) {
        callback && callback();
      }
    }.bind(this));
  } catch (error) {
    console.error('❌ setData操作失败:', error);
    console.log('📊 尝试设置的数据:', data);
    callback && callback();
  }
},

// 4. 清理页面引用的方法
clearPageReferences: function() {
  console.log('🧹 清理页面引用');
  
  // 清理模块中的页面引用
  if (this.gpsManager && this.gpsManager.page) {
    this.gpsManager.page = null;
    this.gpsManager.callbacks = null;
  }
  
  if (this.compassManager && this.compassManager.pageRef) {
    this.compassManager.pageRef = null;
    this.compassManager.callbacks = null;
  }
  
  if (this.mapRenderer && this.mapRenderer.page) {
    this.mapRenderer.page = null;
  }
  
  if (this.airportManager && this.airportManager.page) {
    this.airportManager.page = null;
  }
  
  // 清理自身引用
  this.data = null;
},

// 5. 模块中使用安全setData（以GPS管理器为例）
// 在gps-manager.js中添加：
updateStatus: function(status) {
  console.log('📡 GPS状态:', status);
  
  if (this.callbacks.onStatusUpdate) {
    this.callbacks.onStatusUpdate(status);
  }
  
  // 🔧 修复：使用安全的setData方式
  if (this.page && this.page.safeSetData) {
    this.page.safeSetData({
      gpsStatus: status
    });
  } else if (this.page && this.page.setData && !this.page._isDestroying) {
    // 兜底方案
    try {
      this.page.setData({
        gpsStatus: status
      });
    } catch (error) {
      console.warn('⚠️ GPS状态更新失败:', error);
    }
  }
},

// 6. 高频更新的节流处理
handleLocationUpdate: function(location) {
  // 现有代码...
  
  // 🔧 修复：添加页面状态检查
  if (this.page && this.page._isDestroying) {
    console.log('⚠️ 页面已销毁，停止位置更新');
    return;
  }
  
  // 🔧 修复：使用防抖机制减少setData频率
  if (this.locationUpdateThrottle) {
    clearTimeout(this.locationUpdateThrottle);
  }
  
  this.locationUpdateThrottle = setTimeout(() => {
    if (!this.page || this.page._isDestroying) {
      return;
    }
    
    // 回调位置更新
    if (this.callbacks.onLocationUpdate) {
      this.callbacks.onLocationUpdate(processedData);
    }
  }, 100); // 100ms防抖
}