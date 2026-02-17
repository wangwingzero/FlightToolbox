/**
 * 触摸手势处理器模块
 * 
 * 🔧 2025-07-31 重要修改：
 * - 移除单指触摸处理，避免干扰页面滚动
 * - 仅保留双指缩放功能
 * - 移除disable-scroll属性，让页面可以正常滚动
 * 
 * 当前支持功能：
 * - 双指缩放手势（调整地图距离圈）
 * 
 * 已移除功能（避免干扰页面滚动）：
 * - 单指点击识别
 * - 长按检测
 * - 航点交互
 * 
 * 设计原则：
 * - 最小化触摸事件处理，不干扰页面原生滚动
 * - 仅处理必要的缩放手势
 * - 保持界面流畅性
 */

var Logger = require('./logger.js');

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
      
      // 长按检测状态
      longPressTimer: null,
      longPressThreshold: 800, // 长按阈值（毫秒）
      isLongPressing: false,
      longPressStartPos: null,
      
      // 航点交互状态
      selectedWaypoint: null,
      isWaypointMode: false,
      
      // 坐标转换相关
      mapRenderer: null,
      currentPosition: null,
      
      /**
       * 初始化手势处理器
       * @param {String} elementId Canvas元素ID
       * @param {Object} callbacks 回调函数集合
       * @param {Object} dependencies 依赖对象
       */
      init: function(elementId, callbacks, dependencies) {
        handler.elementId = elementId;
        handler.callbacks = callbacks || {};
        
        // 设置依赖对象
        if (dependencies) {
          handler.mapRenderer = dependencies.mapRenderer;
          handler.waypointManager = dependencies.waypointManager;
        }
        
        handler.bindEvents();
      },
      
      /**
       * 绑定触摸事件
       */
      bindEvents: function() {
        // 由于小程序的事件绑定是在wxml中进行的，
        // 这里主要提供事件处理函数供主页面调用
        if (config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('手势处理器已初始化，元素ID:', handler.elementId);
        }
      },
      
      /**
       * 处理触摸开始事件
       * @param {Object} e 触摸事件对象
       */
      onTouchStart: function(e) {
        var touches = e.touches;
        
        if (touches.length === 1) {
          // 🔧 修改：单指触摸时不做任何处理，让页面可以正常滚动
          // 只记录基本信息，用于后续可能的双指检测
          handler.mapTouchStart = {
            x: touches[0].x,
            y: touches[0].y,
            time: Date.now()
          };
          handler.isPinching = false;
          handler.isLongPressing = false;
          
          // 🔧 注释掉长按检测和单指操作，避免干扰页面滚动
          // handler.startLongPressDetection(touches[0]);
          
        } else if (touches.length === 2) {
          // 双指触摸，准备缩放
          var distance = handler.getTouchDistance(touches[0], touches[1]);
          handler.lastTouchDistance = distance;
          handler.isPinching = true;
          handler.mapTouchStart = null;
          
          if (config.debug && config.debug.enableVerboseLogging) {
            Logger.debug('双指触摸开始，距离:', distance);
          }
          
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
        
        // 🔧 修改：只处理双指缩放，忽略单指移动
        if (touches.length === 2 && handler.isPinching) {
          // 双指缩放处理
          var currentDistance = handler.getTouchDistance(touches[0], touches[1]);
          var deltaDistance = currentDistance - handler.lastTouchDistance;
          
          // 缩放阈值，避免过于敏感
          if (Math.abs(deltaDistance) > config.map.pinchThreshold) {
            
            // 计算缩放方向和强度
            var zoomDirection = deltaDistance > 0 ? 'out' : 'in'; // out=放大视野, in=缩小视野
            var zoomStrength = Math.abs(deltaDistance) / handler.lastTouchDistance;
            
            if (config.debug && config.debug.enableVerboseLogging) {
              Logger.debug('缩放手势:', zoomDirection, '强度:', zoomStrength.toFixed(3));
            }
            
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
        }
        // 🔧 修改：移除单指移动的所有处理逻辑，让页面可以正常滚动
      },
      
      /**
       * 处理触摸结束事件
       * @param {Object} e 触摸事件对象
       */
      onTouchEnd: function(e) {
        var touches = e.touches;
        
        // 🔧 修改：简化逻辑，只处理缩放结束
        if (touches.length === 0) {
          // 所有手指离开，重置状态
          if (handler.isPinching && handler.callbacks.onPinchEnd) {
            handler.callbacks.onPinchEnd();
          }
          
          handler.isPinching = false;
          handler.lastTouchDistance = 0;
          handler.mapTouchStart = null;
          
        } else if (touches.length === 1 && handler.isPinching) {
          // 从双指变为单指，结束缩放
          if (handler.callbacks.onPinchEnd) {
            handler.callbacks.onPinchEnd();
          }
          
          handler.isPinching = false;
          handler.lastTouchDistance = 0;
        }
      },
      
      /**
       * 开始长按检测
       * @param {Object} touch 触摸点对象
       */
      startLongPressDetection: function(touch) {
        // 保存长按起始位置
        handler.longPressStartPos = {
          x: touch.x,
          y: touch.y,
          time: Date.now()
        };
        
        // 设置长按定时器
        handler.longPressTimer = setTimeout(function() {
          if (handler.longPressStartPos) {
            handler.isLongPressing = true;
            handler.onLongPress(handler.longPressStartPos);
          }
        }, handler.longPressThreshold);
      },
      
      /**
       * 取消长按检测
       */
      cancelLongPressDetection: function() {
        if (handler.longPressTimer) {
          clearTimeout(handler.longPressTimer);
          handler.longPressTimer = null;
        }
        handler.longPressStartPos = null;
      },
      
      /**
       * 处理长按事件
       * @param {Object} position 长按位置
       */
      onLongPress: function(position) {
        if (config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('检测到长按:', position.x, position.y);
        }
        
        // 转换为GPS坐标
        var gpsCoordinate = handler.convertToGPS(position);
        
        if (gpsCoordinate) {
          var terrainInfo = null;
          
          // 通知长按事件（用于创建航点）
          if (handler.callbacks.onLongPress) {
            handler.callbacks.onLongPress({
              screenPosition: position,
              gpsCoordinate: gpsCoordinate,
              terrainInfo: terrainInfo
            });
          }
        }
      },
      
      /**
       * 将屏幕坐标转换为GPS坐标
       * @param {Object} screenPos 屏幕位置 {x, y}
       * @returns {Object} GPS坐标 {lat, lng} 或 null
       */
      convertToGPS: function(screenPos) {
        if (!handler.mapRenderer || !handler.mapRenderer.currentData) {
          return null;
        }
        
        var mapData = handler.mapRenderer.currentData;
        var aircraftLat = mapData.latitude;
        var aircraftLng = mapData.longitude;
        var mapRange = mapData.mapRange;
        var mapHeading = handler.mapRenderer.getMapDisplayHeading ? handler.mapRenderer.getMapDisplayHeading() : 0;
        
        if (!aircraftLat || !aircraftLng || !mapRange) {
          return null;
        }
        
        // 获取Canvas尺寸
        var canvasWidth = handler.mapRenderer.canvasWidth;
        var canvasHeight = handler.mapRenderer.canvasHeight;
        var radius = Math.min(canvasWidth, canvasHeight) * 0.4;
        
        // 计算相对于地图中心的偏移（像素）
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        var deltaX = screenPos.x - centerX;
        var deltaY = screenPos.y - centerY;
        
        // 转换为地图单位（海里）
        var pixelsPerNM = radius / (mapRange / 4);
        var offsetX_NM = deltaX / pixelsPerNM;
        var offsetY_NM = -deltaY / pixelsPerNM; // Y轴翻转
        
        // 考虑地图定向角度
        var angle = mapHeading * Math.PI / 180;
        var rotatedX = offsetX_NM * Math.cos(angle) + offsetY_NM * Math.sin(angle);
        var rotatedY = -offsetX_NM * Math.sin(angle) + offsetY_NM * Math.cos(angle);
        
        // 转换为GPS坐标
        var lat = aircraftLat + (rotatedY / 60); // 1度约60海里
        var lng = aircraftLng + (rotatedX / (60 * Math.cos(aircraftLat * Math.PI / 180)));
        
        return {
          lat: lat,
          lng: lng
        };
      },
      
      /**
       * 将GPS坐标转换为屏幕坐标
       * @param {Number} lat GPS纬度
       * @param {Number} lng GPS经度
       * @returns {Object} 屏幕坐标 {x, y} 或 null
       */
      convertToScreen: function(lat, lng) {
        if (!handler.mapRenderer || !handler.mapRenderer.currentData) {
          return null;
        }
        
        var mapData = handler.mapRenderer.currentData;
        var aircraftLat = mapData.latitude;
        var aircraftLng = mapData.longitude;
        var mapRange = mapData.mapRange;
        var mapHeading = handler.mapRenderer.getMapDisplayHeading ? handler.mapRenderer.getMapDisplayHeading() : 0;
        
        if (!aircraftLat || !aircraftLng || !mapRange) {
          return null;
        }
        
        // 计算相对距离（海里）
        var deltaLat = lat - aircraftLat;
        var deltaLng = lng - aircraftLng;
        var distanceY = deltaLat * 60;
        var distanceX = deltaLng * 60 * Math.cos(aircraftLat * Math.PI / 180);
        
        // 考虑地图定向角度
        var angle = mapHeading * Math.PI / 180;
        var rotatedX = distanceX * Math.cos(angle) - distanceY * Math.sin(angle);
        var rotatedY = distanceX * Math.sin(angle) + distanceY * Math.cos(angle);
        
        // 转换为屏幕坐标
        var canvasWidth = handler.mapRenderer.canvasWidth;
        var canvasHeight = handler.mapRenderer.canvasHeight;
        var radius = Math.min(canvasWidth, canvasHeight) * 0.4;
        var pixelsPerNM = radius / (mapRange / 4);
        
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        var screenX = centerX + rotatedX * pixelsPerNM;
        var screenY = centerY - rotatedY * pixelsPerNM; // Y轴翻转
        
        return {
          x: screenX,
          y: screenY
        };
      },
      
      /**
       * 检查点击位置是否命中航点
       * @param {Object} touchPos 触摸位置
       * @returns {Object} 命中的航点对象或null
       */
      checkWaypointClick: function(touchPos) {
        if (!handler.waypointManager || !handler.mapRenderer) {
          return null;
        }
        
        var activeWaypoints = handler.waypointManager.getActiveWaypoints();
        var hitRadius = 20; // 点击命中半径（像素）
        
        for (var i = 0; i < activeWaypoints.length; i++) {
          var waypoint = activeWaypoints[i];
          var screenPos = handler.convertToScreen(waypoint.lat, waypoint.lng);
          
          if (screenPos) {
            var distance = Math.sqrt(
              Math.pow(touchPos.x - screenPos.x, 2) +
              Math.pow(touchPos.y - screenPos.y, 2)
            );
            
            if (distance <= hitRadius) {
              return waypoint;
            }
          }
        }
        
        return null;
      },
      
      /**
       * 设置航点模式
       * @param {Boolean} enabled 是否启用航点模式
       */
      setWaypointMode: function(enabled) {
        handler.isWaypointMode = enabled;
        if (config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('航点模式:', enabled ? '启用' : '禁用');
        }
      },
      
      /**
       * 更新当前位置（用于坐标转换）
       * @param {Object} position 位置信息
       */
      updateCurrentPosition: function(position) {
        handler.currentPosition = position;
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
          
          if (config.debug.enableVerboseLogging) {
            Logger.debug('缩放级别变化:', currentIndex, '->', newIndex, '范围:', result.newRange + ' NM');
          }
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
        
        // 清理长按检测状态
        handler.cancelLongPressDetection();
        handler.isLongPressing = false;
        handler.longPressStartPos = null;
        
        // 清理航点交互状态
        handler.selectedWaypoint = null;
        
        if (config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('手势状态已重置');
        }
      },
      
      /**
       * 获取当前手势状态
       * @returns {Object} 状态信息
       */
      getState: function() {
        return {
          isPinching: handler.isPinching,
          hasTouchStart: !!handler.mapTouchStart,
          lastDistance: handler.lastTouchDistance,
          isLongPressing: handler.isLongPressing,
          hasLongPressTimer: !!handler.longPressTimer,
          isWaypointMode: handler.isWaypointMode,
          selectedWaypoint: handler.selectedWaypoint ? handler.selectedWaypoint.id : null
        };
      },
      
      /**
       * 解绑事件（清理资源）
       */
      unbindEvents: function() {
        // 小程序中事件绑定在wxml，这里主要是清理内部状态
        handler.reset();
        if (config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('手势事件已解绑');
        }
      },
      
      /**
       * 销毁处理器
       */
      destroy: function() {
        handler.unbindEvents();
        handler.callbacks = null;
        handler.elementId = null;
        if (config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('手势处理器已销毁');
        }
      },

      /**
       * ===== 生命周期管理接口 =====
       */
      
      /**
       * 启动手势处理器（标准化接口）
       */
      start: function() {
        if (config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('🚀 手势处理器启动');
        }
        // 手势处理器在init时已经绑定事件
        return Promise.resolve();
      },
      
      /**
       * 停止手势处理器（标准化接口）
       */
      stop: function() {
        if (config.debug && config.debug.enableVerboseLogging) {
          Logger.debug('⏹️ 手势处理器停止');
        }
        handler.reset();
        return Promise.resolve();
      },
      
      /**
       * 获取手势处理器状态（标准化接口）
       */
      getStatus: function() {
        var state = handler.getState();
        
        return {
          name: '手势处理器',
          state: handler.elementId ? 'running' : 'stopped',
          isHealthy: true,
          isRunning: !!handler.elementId,
          lastError: null,
          diagnostics: {
            elementId: handler.elementId,
            hasCallbacks: !!handler.callbacks,
            gestureState: state,
            activeGestures: [
              state.isPinching && 'pinch',
              state.hasTouchStart && 'touch',
              state.isLongPressing && 'longPress'
            ].filter(Boolean)
          }
        };
      }
    };
    
    return handler;
  }
};

module.exports = GestureHandler;