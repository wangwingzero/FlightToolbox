/**
 * 触摸手势处理器模块
 * 
 * 提供地图触摸交互功能，包括：
 * - 单指点击识别
 * - 双指缩放手势
 * - 触摸状态管理
 * - 缩放级别控制
 * 
 * 设计原则：
 * - 事件驱动，通过回调通知主页面
 * - 状态轻量，避免复杂状态管理
 * - 手势识别准确，避免误触
 * - 内存安全，正确清理事件监听器
 */

var GestureHandler = {
  /**
   * 创建手势处理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 处理器实例
   */
  create: function(config) {
    var handler = {
      // 内部状态
      lastTouchDistance: 0,
      isPinching: false,
      mapTouchStart: null,
      callbacks: null,
      
      /**
       * 初始化手势处理器
       * @param {String} elementId Canvas元素ID
       * @param {Object} callbacks 回调函数集合
       */
      init: function(elementId, callbacks) {
        handler.elementId = elementId;
        handler.callbacks = callbacks || {};
        handler.bindEvents();
      },
      
      /**
       * 绑定触摸事件
       */
      bindEvents: function() {
        // 由于小程序的事件绑定是在wxml中进行的，
        // 这里主要提供事件处理函数供主页面调用
        console.log('手势处理器已初始化，元素ID:', handler.elementId);
      },
      
      /**
       * 处理触摸开始事件
       * @param {Object} e 触摸事件对象
       */
      onTouchStart: function(e) {
        var touches = e.touches;
        
        if (touches.length === 1) {
          // 单指触摸
          handler.mapTouchStart = {
            x: touches[0].x,
            y: touches[0].y,
            time: Date.now()
          };
          handler.isPinching = false;
          
          console.log('单指触摸开始:', touches[0].x, touches[0].y);
          
        } else if (touches.length === 2) {
          // 双指触摸，准备缩放
          var distance = handler.getTouchDistance(touches[0], touches[1]);
          handler.lastTouchDistance = distance;
          handler.isPinching = true;
          handler.mapTouchStart = null;
          
          console.log('双指触摸开始，距离:', distance);
          
          // 通知开始缩放
          if (handler.callbacks.onPinchStart) {
            handler.callbacks.onPinchStart({
              distance: distance,
              centerX: (touches[0].x + touches[1].x) / 2,
              centerY: (touches[0].y + touches[1].y) / 2
            });
          }
        }
      },
      
      /**
       * 处理触摸移动事件
       * @param {Object} e 触摸事件对象
       */
      onTouchMove: function(e) {
        var touches = e.touches;
        
        if (touches.length === 2 && handler.isPinching) {
          // 双指缩放处理
          var currentDistance = handler.getTouchDistance(touches[0], touches[1]);
          var deltaDistance = currentDistance - handler.lastTouchDistance;
          
          // 缩放阈值，避免过于敏感
          if (Math.abs(deltaDistance) > config.map.pinchThreshold) {
            
            // 计算缩放方向和强度
            var zoomDirection = deltaDistance > 0 ? 'out' : 'in'; // out=放大视野, in=缩小视野
            var zoomStrength = Math.abs(deltaDistance) / handler.lastTouchDistance;
            
            console.log('缩放手势:', zoomDirection, '强度:', zoomStrength.toFixed(3));
            
            // 通知缩放事件
            if (handler.callbacks.onZoom) {
              handler.callbacks.onZoom({
                direction: zoomDirection,
                deltaDistance: deltaDistance,
                strength: zoomStrength,
                centerX: (touches[0].x + touches[1].x) / 2,
                centerY: (touches[0].y + touches[1].y) / 2
              });
            }
            
            handler.lastTouchDistance = currentDistance;
          }
          
        } else if (touches.length === 1 && handler.mapTouchStart && !config.map.simplifiedGesture) {
          // 单指移动处理（仅在非简化模式下执行，避免卡顿）
          var deltaX = touches[0].x - handler.mapTouchStart.x;
          var deltaY = touches[0].y - handler.mapTouchStart.y;
          var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // 如果移动距离超过阈值，取消点击识别
          if (distance > config.map.tapThreshold) {
            handler.mapTouchStart = null;
          }
        } else if (touches.length === 1 && handler.mapTouchStart && config.map.simplifiedGesture) {
          // 简化模式：只进行基本的移动距离检查，避免复杂计算
          var deltaX = Math.abs(touches[0].x - handler.mapTouchStart.x);
          var deltaY = Math.abs(touches[0].y - handler.mapTouchStart.y);
          
          // 简化的距离检查，避免开方运算
          if (deltaX > config.map.tapThreshold || deltaY > config.map.tapThreshold) {
            handler.mapTouchStart = null;
          }
        }
      },
      
      /**
       * 处理触摸结束事件
       * @param {Object} e 触摸事件对象
       */
      onTouchEnd: function(e) {
        var touches = e.touches;
        var changedTouches = e.changedTouches;
        
        if (touches.length === 0) {
          // 所有手指离开
          handler.isPinching = false;
          handler.lastTouchDistance = 0;
          
          // 检查是否是单击事件
          if (handler.mapTouchStart && !handler.isPinching && changedTouches.length > 0) {
            var deltaTime = Date.now() - handler.mapTouchStart.time;
            var deltaX = Math.abs(changedTouches[0].x - handler.mapTouchStart.x);
            var deltaY = Math.abs(changedTouches[0].y - handler.mapTouchStart.y);
            
            // 单击判断条件：时间短、移动距离小
            if (deltaTime < 300 && deltaX < 10 && deltaY < 10) {
              console.log('检测到地图单击:', changedTouches[0].x, changedTouches[0].y);
              
              // 通知单击事件
              if (handler.callbacks.onTap) {
                handler.callbacks.onTap({
                  x: changedTouches[0].x,
                  y: changedTouches[0].y,
                  time: deltaTime
                });
              }
            }
          }
          
          // 通知缩放结束
          if (handler.callbacks.onPinchEnd) {
            handler.callbacks.onPinchEnd();
          }
          
          handler.mapTouchStart = null;
          
        } else if (touches.length === 1) {
          // 从双指变为单指
          handler.isPinching = false;
          handler.lastTouchDistance = 0;
          
          // 通知缩放结束
          if (handler.callbacks.onPinchEnd) {
            handler.callbacks.onPinchEnd();
          }
        }
      },
      
      /**
       * 计算两个触摸点之间的距离
       * @param {Object} touch1 第一个触摸点
       * @param {Object} touch2 第二个触摸点
       * @returns {Number} 距离（像素）
       */
      getTouchDistance: function(touch1, touch2) {
        var dx = touch1.x - touch2.x;
        var dy = touch1.y - touch2.y;
        return Math.sqrt(dx * dx + dy * dy);
      },
      
      /**
       * 处理缩放操作（供主页面调用）
       * @param {Number} deltaDistance 距离变化
       * @param {Array} zoomLevels 缩放级别数组
       * @param {Number} currentIndex 当前缩放索引
       * @returns {Object} {newIndex: Number, newRange: Number, changed: Boolean}
       */
      handleZoom: function(deltaDistance, zoomLevels, currentIndex) {
        var result = {
          newIndex: currentIndex,
          newRange: zoomLevels[currentIndex],
          changed: false
        };
        
        var newIndex = currentIndex;
        
        // 修复缩放方向：双指向外（deltaDistance > 0）放大地图（看更小的范围）
        // 双指向内（deltaDistance < 0）缩小地图（看更大的范围）
        if (deltaDistance > 0) {
          // 双指向外 - 放大地图（减少范围）
          newIndex = Math.max(currentIndex - 1, 0);
        } else {
          // 双指向内 - 缩小地图（增加范围）
          newIndex = Math.min(currentIndex + 1, zoomLevels.length - 1);
        }
        
        if (newIndex !== currentIndex) {
          result.newIndex = newIndex;
          result.newRange = zoomLevels[newIndex];
          result.changed = true;
          
          console.log('缩放级别变化:', currentIndex, '->', newIndex, '范围:', result.newRange + ' NM');
        }
        
        return result;
      },
      
      /**
       * 重置手势状态
       */
      reset: function() {
        handler.lastTouchDistance = 0;
        handler.isPinching = false;
        handler.mapTouchStart = null;
        console.log('手势状态已重置');
      },
      
      /**
       * 获取当前手势状态
       * @returns {Object} 状态信息
       */
      getState: function() {
        return {
          isPinching: handler.isPinching,
          hasTouchStart: !!handler.mapTouchStart,
          lastDistance: handler.lastTouchDistance
        };
      },
      
      /**
       * 解绑事件（清理资源）
       */
      unbindEvents: function() {
        // 小程序中事件绑定在wxml，这里主要是清理内部状态
        handler.reset();
        console.log('手势事件已解绑');
      },
      
      /**
       * 销毁处理器
       */
      destroy: function() {
        handler.unbindEvents();
        handler.callbacks = null;
        handler.elementId = null;
        console.log('手势处理器已销毁');
      }
    };
    
    return handler;
  }
};

module.exports = GestureHandler;