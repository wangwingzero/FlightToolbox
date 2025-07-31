/**
 * 地图渲染器模块
 * 
 * 提供Canvas地图渲染功能，包括：
 * - 导航地图初始化和管理
 * - 距离圈和方位标记绘制
 * - 航向指示和航迹显示
 * - 机场位置和标注绘制
 * - 飞机图标渲染
 * - 地图定向模式切换
 * - 地形图层显示和渲染
 * - 航点标记和管理
 * 
 * 设计原则：
 * - Canvas绘制逻辑封装
 * - 数据驱动渲染，支持实时更新
 * - 性能优化，避免不必要的重绘
 * - 支持多种显示模式
 * - 模块化图层管理
 */

var MapRenderer = {
  /**
   * 创建地图渲染器实例
   * @param {String} canvasId Canvas元素ID
   * @param {Object} config 配置参数
   * @returns {Object} 渲染器实例
   */
  create: function(canvasId, config) {
    var renderer = {
      // 内部状态
      canvasId: canvasId,
      mapCanvas: null,
      canvasWidth: 0,
      canvasHeight: 0,
      callbacks: null,
      renderTimer: null,
      blinkTimer: null,
      isInitialized: false,
      
      // 缩放状态管理
      currentZoomIndex: config.map.defaultZoomIndex,
      
      // 智能渲染优化状态
      lastRenderData: {},
      lastRenderTime: 0,
      renderThrottleEnabled: config.performance.renderOptimization ? config.performance.renderOptimization.enableSmartRender : false,
      
      // 航点管理
      waypointManager: null,
      
      // 当前渲染数据
      currentData: {
        // GPS数据
        latitude: 0,
        longitude: 0,
        altitude: 0,
        speed: 0,
        
        // 指南针数据
        heading: 0,
        track: 0,
        headingMode: 'heading',
        
        // 机场数据
        nearbyAirports: [],
        trackedAirport: null,
        
        // 地图配置
        mapRange: 40,
        mapOrientationMode: 'heading-up',
        mapStableHeading: 0,
        
        // 地形和航点数据
        activeWaypoints: [],
        selectedWaypoint: null
      },
      
      /**
       * 初始化渲染器
       * @param {Object} page 页面实例
       * @param {Object} callbacks 回调函数集合
       */
      init: function(page, callbacks) {
        renderer.pageRef = page;
        renderer.callbacks = callbacks || {};
        
        // 初始化地形管理器
        
        // 初始化航点管理器
        if (callbacks.waypointManager) {
          renderer.waypointManager = callbacks.waypointManager;
        }
        
        // 延迟初始化Canvas，避免框架内部错误
        setTimeout(function() {
          renderer.initCanvas();
        }, config.performance.canvasInitDelay);
      },
      
      /**
       * 初始化Canvas (使用Canvas 2D API)
       */
      initCanvas: function() {
        try {
          // 使用Canvas 2D API获取Canvas节点
          var query = wx.createSelectorQuery().in(renderer.pageRef);
          query.select('#' + renderer.canvasId)
            .fields({ node: true, size: true })
            .exec(function(res) {
              if (!res[0] || !res[0].node) {
                console.error('Canvas节点获取失败');
                if (renderer.callbacks.onCanvasError) {
                  renderer.callbacks.onCanvasError(new Error('Canvas节点获取失败'));
                }
                return;
              }
              
              var canvas = res[0].node;
              var ctx = canvas.getContext('2d');
              
              // 设置Canvas实际尺寸
              var dpr = wx.getSystemInfoSync().pixelRatio;
              canvas.width = res[0].width * dpr;
              canvas.height = res[0].height * dpr;
              ctx.scale(dpr, dpr);
              
              // 保存Canvas相关信息
              renderer.canvas = canvas;
              renderer.mapCanvas = ctx;
              renderer.canvasWidth = res[0].width;
              renderer.canvasHeight = res[0].height;
              
              console.log('导航地图Canvas 2D初始化成功');
              console.log('Canvas尺寸:', res[0].width, 'x', res[0].height);
              console.log('设备像素比:', dpr);
              
              renderer.isInitialized = true;
              
              // 初始绘制
              renderer.render();
              
              // 启动渲染定时器
              renderer.startRenderLoop();
              
              if (renderer.callbacks.onCanvasReady) {
                renderer.callbacks.onCanvasReady({
                  width: renderer.canvasWidth,
                  height: renderer.canvasHeight
                });
              }
            });
          
        } catch (error) {
          console.error('导航地图Canvas初始化失败:', error);
          if (renderer.callbacks.onCanvasError) {
            renderer.callbacks.onCanvasError(error);
          }
        }
      },
      
      /**
       * 启动渲染循环（幂等版：可安全重复调用）
       */
      startRenderLoop: function() {
        // 🔧 修复：先停止现有定时器，防止重复创建
        renderer.stopRenderLoop();
        
        console.log('🎬 启动地图渲染循环');
        
        // 🔧 增强：启动前检查并修复mapRange
        if (!renderer.currentData.mapRange || renderer.currentData.mapRange <= 0) {
          var defaultRange = config.map.zoomLevels[config.map.defaultZoomIndex];
          console.log('🔧 启动渲染循环时发现mapRange无效，重置为:', defaultRange + 'NM');
          renderer.currentData.mapRange = defaultRange;
        }
        
        // 立即渲染一次
        renderer.render();
        
        // 地图更新定时器
        renderer.renderTimer = setInterval(function() {
          renderer.render();
        }, config.map.updateInterval);
        
        // 闪烁效果定时器（用于追踪机场）
        renderer.blinkTimer = setInterval(function() {
          if (renderer.currentData.trackedAirport) {
            renderer.render();
          }
        }, config.map.blinkInterval);
      },
      
      /**
       * 停止渲染循环（增强版：提供调试信息）
       */
      stopRenderLoop: function() {
        var stopped = false;
        
        if (renderer.renderTimer) {
          clearInterval(renderer.renderTimer);
          renderer.renderTimer = null;
          stopped = true;
        }
        
        if (renderer.blinkTimer) {
          clearInterval(renderer.blinkTimer);
          renderer.blinkTimer = null;
          stopped = true;
        }
        
        if (stopped) {
          console.log('⏹️ 地图渲染循环已停止');
        }
      },
      
      /**
       * 更新渲染数据（优化版：智能渲染 + 权限修复）
       * @param {Object} data 新的渲染数据
       */
      updateData: function(data) {
        var hasSignificantChange = false;
        
        // 🔧 增强修复：检查mapRange是否从无效变为有效
        var wasMapRangeInvalid = !renderer.currentData.mapRange || renderer.currentData.mapRange <= 0;
        var isMapRangeValid = data.mapRange && data.mapRange > 0;
        var isPermissionUpdate = wasMapRangeInvalid && isMapRangeValid;
        
        // 合并新数据到当前数据并检测重要变化
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            var oldValue = renderer.currentData[key];
            var newValue = data[key];
            
            // 检测是否有重要变化
            if (renderer.isSignificantChange(key, oldValue, newValue)) {
              hasSignificantChange = true;
            }
            
            renderer.currentData[key] = newValue;
          }
        }
        
        // 🔧 修复：权限授予后强制重新渲染，忽略智能渲染优化
        if (isPermissionUpdate) {
          console.log('🔧 检测到mapRange从无效恢复为有效，强制重新渲染');
          console.log('🔧 地图范围已更新:', renderer.currentData.mapRange + 'NM');
          hasSignificantChange = true;
          
          // 立即清空并重绘
          if (renderer.mapCanvas) {
            renderer.render();
          }
          return; // 直接返回，已经渲染过了
        }
        
        // 如果启用了智能渲染且没有重要变化，则跳过渲染
        if (renderer.renderThrottleEnabled && !hasSignificantChange) {
          var timeSinceLastRender = Date.now() - renderer.lastRenderTime;
          var maxRenderInterval = 1000 / (config.performance.renderOptimization.maxRenderFPS || 30);
          
          if (timeSinceLastRender < maxRenderInterval) {
            return; // 跳过此次渲染
          }
        }
        
        // 执行渲染
        renderer.render();
      },
      
      /**
       * 检测数据变化是否重要
       * @param {String} key 数据键
       * @param {*} oldValue 旧值
       * @param {*} newValue 新值
       * @returns {Boolean} 是否有重要变化
       */
      isSignificantChange: function(key, oldValue, newValue) {
        if (oldValue === undefined || newValue === undefined) {
          return true; // 初始化数据视为重要变化
        }
        
        switch (key) {
          case 'heading':
          case 'track':
            // 航向/航迹变化超过阈值才重新渲染
            var threshold = config.performance.renderOptimization ? 
              config.performance.renderOptimization.trackingThreshold : 2;
            return Math.abs(oldValue - newValue) > threshold;
            
          case 'mapRange':
          case 'mapOrientationMode':
          case 'headingMode':
            // 地图配置变化始终重要
            return oldValue !== newValue;
            
          case 'nearbyAirports':
          case 'trackedAirport':
            // 机场数据变化检测
            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
            
          case 'latitude':
          case 'longitude':
            // 位置变化超过0.0001度（约11米）才重新渲染
            return Math.abs(oldValue - newValue) > 0.0001;
            
          case 'speed':
            // 速度变化超过5kt才重新渲染
            return Math.abs(oldValue - newValue) > 5;
            
          default:
            // 其他变化都视为重要
            return oldValue !== newValue;
        }
      },
      
      /**
       * 执行渲染（优化版：记录渲染时间）
       */
      render: function() {
        if (!renderer.isInitialized || !renderer.mapCanvas || !renderer.canvasWidth) {
          return;
        }
        
        // 🔧 增强：渲染前再次检查mapRange
        if (!renderer.currentData.mapRange || renderer.currentData.mapRange <= 0) {
          var defaultRange = config.map.zoomLevels[config.map.defaultZoomIndex];
          console.warn('🔧 渲染时发现mapRange无效，紧急修复:', defaultRange + 'NM');
          renderer.currentData.mapRange = defaultRange;
        }
        
        try {
          renderer.lastRenderTime = Date.now();
          renderer.drawNavigationMap();
        } catch (error) {
          console.error('地图渲染失败:', error);
          if (renderer.callbacks.onRenderError) {
            renderer.callbacks.onRenderError(error);
          }
        }
      },
      
      /**
       * 绘制导航地图
       */
      drawNavigationMap: function() {
        var ctx = renderer.mapCanvas;
        var width = renderer.canvasWidth;
        var height = renderer.canvasHeight;
        var centerX = width / 2;
        var centerY = height / 2;
        var radius = Math.min(width, height) * 0.4;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 设置背景  
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制地形图层（如果启用）
        
        // 绘制距离圈
        renderer.drawRangeRings(ctx, centerX, centerY, radius);
        
        // 绘制航向指示
        renderer.drawHeadingIndicator(ctx, centerX, centerY, radius);
        
        // 绘制机场
        renderer.drawAirports(ctx, centerX, centerY, radius);
        
        // 绘制航点（如果有）
        if (renderer.currentData.activeWaypoints.length > 0) {
          renderer.drawWaypoints(ctx, centerX, centerY, radius);
        }
        
        // 绘制飞机（中心位置）
        renderer.drawAircraft(ctx, centerX, centerY);
        
        // Canvas 2D API不需要调用draw()，绘制是立即的
      },
      
      /**
       * 绘制距离圈（终极防护版：确保权限申请期间正常显示）
       * @param {Object} ctx Canvas上下文
       * @param {Number} centerX 中心X坐标
       * @param {Number} centerY 中心Y坐标
       * @param {Number} maxRadius 最大半径
       */
      drawRangeRings: function(ctx, centerX, centerY, maxRadius) {
        var aircraftY = centerY; // 飞机的Y位置（居中）
        
        // 🔧 终极防护：确保mapRange始终有有效值，特别是权限申请期间
        var currentRange = renderer.currentData.mapRange;
        
        // 第一重防护：检查当前mapRange
        if (!currentRange || currentRange === 0 || currentRange === null || currentRange === undefined) {
          currentRange = config.map.zoomLevels[config.map.defaultZoomIndex];
          console.log('🔧 第一重防护：mapRange无效，使用默认值:', currentRange + 'NM');
          renderer.currentData.mapRange = currentRange;
        }
        
        // 第二重防护：检查是否为有效数字
        if (isNaN(currentRange) || currentRange <= 0) {
          currentRange = config.map.zoomLevels[config.map.defaultZoomIndex];
          console.log('🔧 第二重防护：mapRange不是有效数字，重置为:', currentRange + 'NM');
          renderer.currentData.mapRange = currentRange;
        }
        
        // 第三重防护：确保在合理范围内
        var minRange = Math.min.apply(Math, config.map.zoomLevels);
        var maxRange = Math.max.apply(Math, config.map.zoomLevels);
        if (currentRange < minRange || currentRange > maxRange) {
          currentRange = config.map.zoomLevels[config.map.defaultZoomIndex];
          console.log('🔧 第三重防护：mapRange超出范围，重置为:', currentRange + 'NM');
          renderer.currentData.mapRange = currentRange;
        }
        
        // 第四重防护：权限申请期间特殊处理
        if (typeof wx !== 'undefined' && wx.getStorageSync && 
            (currentRange === undefined || currentRange === null || currentRange === 0)) {
          try {
            // 尝试从本地存储获取上次的mapRange
            var storedRange = wx.getStorageSync('lastMapRange');
            if (storedRange && storedRange > 0) {
              currentRange = storedRange;
              console.log('🔧 第四重防护：从本地存储恢复mapRange:', currentRange + 'NM');
            } else {
              currentRange = config.map.zoomLevels[config.map.defaultZoomIndex];
              console.log('🔧 第四重防护：本地存储无效，使用默认值:', currentRange + 'NM');
            }
            renderer.currentData.mapRange = currentRange;
          } catch (storageError) {
            console.warn('🔧 第四重防护：本地存储访问失败，使用默认值');
            currentRange = config.map.zoomLevels[config.map.defaultZoomIndex];
            renderer.currentData.mapRange = currentRange;
          }
        }
        
        // 最终验证：确保currentRange是正数
        if (currentRange <= 0) {
          currentRange = 40; // 硬编码后备值
          console.error('🔧 终极防护：所有防护失败，使用硬编码值:', currentRange + 'NM');
          renderer.currentData.mapRange = currentRange;
        }
        
        // 🔧 新增：保存有效的mapRange到本地存储
        try {
          if (typeof wx !== 'undefined' && wx.setStorageSync && currentRange > 0) {
            wx.setStorageSync('lastMapRange', currentRange);
          }
        } catch (storageError) {
          // 忽略存储错误，不影响渲染
        }
        
        // 调试信息：确保使用正确的地图范围
        if (Math.random() < 0.1) { // 10%的概率输出调试信息，避免过于频繁
          console.log('绘制距离圈，最终范围:', currentRange + 'NM', '(经过', '终极防护验证)');
        }
        
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // 绘制4个同心圆，代表当前缩放级别的等距环
        var rings = 4;
        
        for (var i = 1; i <= rings; i++) {
          var ringRadius = (maxRadius / rings) * i;
          var ringDistance = (currentRange / rings) * i; // 计算每个圈对应的距离
          
          // 绘制距离圈
          ctx.beginPath();
          ctx.arc(centerX, aircraftY, ringRadius, 0, 2 * Math.PI);
          ctx.stroke();
          
          // 在距离圈内侧显示距离标签
          ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
          ctx.font = '11px sans-serif';
          
          // 右上方60°方向显示距离数字
          var angle60 = 60 * Math.PI / 180;
          var x60 = centerX + Math.sin(angle60) * (ringRadius - 15);
          var y60 = aircraftY - Math.cos(angle60) * (ringRadius - 15);
          ctx.textAlign = 'center';
          ctx.fillText(ringDistance.toString(), x60, y60);
        }
        
        // 重置文本对齐和线条样式
        ctx.textAlign = 'left';
        ctx.setLineDash([]);
      },
      
      /**
       * 绘制航向指示
       * @param {Object} ctx Canvas上下文
       * @param {Number} centerX 中心X坐标
       * @param {Number} centerY 中心Y坐标
       * @param {Number} radius 半径
       */
      drawHeadingIndicator: function(ctx, centerX, centerY, radius) {
        var mapHeading = renderer.getMapDisplayHeading(); // 使用稳定的地图航向
        var track = Math.round(renderer.currentData.track || 0); // 航迹角度，格式化为整数
        var heading = renderer.currentData.heading; // 航向角度
        var aircraftY = centerY; // 飞机的Y位置（居中）
        
        // 绘制方位标记
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        
        // 绘制8个主要方位（基于航迹定向）
        var directions = [
          {angle: 0, label: 'N'},
          {angle: 45, label: 'NE'},
          {angle: 90, label: 'E'},
          {angle: 135, label: 'SE'},
          {angle: 180, label: 'S'},
          {angle: 225, label: 'SW'},
          {angle: 270, label: 'W'},
          {angle: 315, label: 'NW'}
        ];
        
        // 绘制圆形方位框架（以飞机位置为中心）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX, aircraftY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        for (var i = 0; i < directions.length; i++) {
          var dir = directions[i];
          var angle = (dir.angle - mapHeading) * Math.PI / 180; // 使用稳定的地图航向
          var x1 = centerX + Math.sin(angle) * radius;
          var y1 = aircraftY - Math.cos(angle) * radius;
          var x2 = centerX + Math.sin(angle) * (radius - 10);
          var y2 = aircraftY - Math.cos(angle) * (radius - 10);
          
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          
          // 标注方位
          if (dir.angle % 90 === 0) {
            ctx.fillStyle = '#00ff88';
            ctx.font = '12px sans-serif';
            var textX = centerX + Math.sin(angle) * (radius + 15);
            var textY = aircraftY - Math.cos(angle) * (radius + 15);
            ctx.fillText(dir.label, textX - 5, textY + 5);
          }
        }
        
        // 绘制航迹线（从飞机位置向上，黄色）
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, aircraftY);
        ctx.lineTo(centerX, aircraftY - radius);
        ctx.stroke();
        
        // 在距离圈正上方显示航迹数值
        ctx.fillStyle = '#ffff00';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        var trackText = track.toString().padStart(3, '0') + '°';
        ctx.fillText(trackText, centerX, aircraftY - radius - 20);
        
        // 在最外层距离圈上用小方块显示航向
        var headingAngle = (heading - mapHeading) * Math.PI / 180; // 航向相对于地图方向的角度
        var headingX = centerX + Math.sin(headingAngle) * radius;
        var headingY = aircraftY - Math.cos(headingAngle) * radius;
        
        // 绘制航向紫色三角形
        ctx.fillStyle = '#9966ff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        var triangleSize = 8;
        ctx.beginPath();
        // 绘制指向外侧的三角形
        ctx.moveTo(headingX + Math.sin(headingAngle) * triangleSize, headingY - Math.cos(headingAngle) * triangleSize); // 顶点
        ctx.lineTo(headingX - Math.sin(headingAngle + Math.PI/3) * triangleSize/2, headingY + Math.cos(headingAngle + Math.PI/3) * triangleSize/2); // 左下
        ctx.lineTo(headingX - Math.sin(headingAngle - Math.PI/3) * triangleSize/2, headingY + Math.cos(headingAngle - Math.PI/3) * triangleSize/2); // 右下
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 在距离圈内侧显示航向数值
        ctx.fillStyle = '#9966ff';
        ctx.font = '12px sans-serif';
        var headingText = heading.toString().padStart(3, '0') + '°';
        var innerRadius = radius - 25; // 距离圈内侧位置
        var innerHeadingX = centerX + Math.sin(headingAngle) * innerRadius;
        var innerHeadingY = aircraftY - Math.cos(headingAngle) * innerRadius;
        ctx.textAlign = 'center';
        ctx.fillText(headingText, innerHeadingX, innerHeadingY + 4);
        
        // 重置文本对齐
        ctx.textAlign = 'left';
      },
      
      /**
       * 绘制机场
       * @param {Object} ctx Canvas上下文
       * @param {Number} centerX 中心X坐标
       * @param {Number} centerY 中心Y坐标
       * @param {Number} maxRadius 最大半径
       */
      drawAirports: function(ctx, centerX, centerY, maxRadius) {
        var nearbyAirports = renderer.currentData.nearbyAirports;
        if (!nearbyAirports || nearbyAirports.length === 0) return;
        
        var mapHeading = renderer.getMapDisplayHeading(); // 使用稳定的地图航向
        var scale = maxRadius / renderer.currentData.mapRange;
        var aircraftY = centerY; // 飞机的Y位置（居中）
        var currentTime = Date.now();
        var trackedAirportCode = renderer.currentData.trackedAirport ? renderer.currentData.trackedAirport.ICAOCode : null;
        
        for (var i = 0; i < nearbyAirports.length; i++) {
          var airport = nearbyAirports[i];
          
          // 计算相对位置
          var relativeBearing = (airport.bearing - mapHeading + 360) % 360;
          var angle = relativeBearing * Math.PI / 180;
          var distance = airport.distance * scale;
          
          // 如果超出显示范围，跳过
          if (distance > maxRadius * 1.5) continue;
          
          // 从飞机位置计算机场位置
          var x = centerX + Math.sin(angle) * distance;
          var y = aircraftY - Math.cos(angle) * distance;
          
          // 如果机场在画布外，跳过
          if (y < 0 || y > renderer.canvasHeight) continue;
          
          // 检查是否是用户指定的机场
          var isTrackedAirport = trackedAirportCode && airport.ICAOCode === trackedAirportCode;
          
          if (isTrackedAirport) {
            // 用户指定机场：闪烁效果
            var blinkCycle = Math.floor(currentTime / config.map.airportBlinkCycle) % 2;
            var opacity = blinkCycle === 0 ? 1.0 : 0.3;
            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#00b4ff';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            
            // 绘制较大的圆点
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // 重置透明度
            ctx.globalAlpha = 1.0;
          } else {
            // 普通机场：正常显示
            ctx.fillStyle = '#00b4ff';
            ctx.strokeStyle = '#00b4ff';
            ctx.lineWidth = 1;
            
            // 绘制机场圆点
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
          }
          
          // 标注机场代码和中文名称
          ctx.font = '8px sans-serif';
          ctx.fillStyle = '#00b4ff';
          ctx.textAlign = 'left';
          
          // 显示ICAO代码
          ctx.fillText(airport.ICAOCode, x + 5, y - 5);
          
          // 显示中文名称（如果有的话）
          if (airport.ShortName) {
            ctx.fillText(airport.ShortName, x + 5, y + 10);
          }
        }
      },
      
      /**
       * 绘制飞机（在中心位置）
       * @param {Object} ctx Canvas上下文
       * @param {Number} centerX 中心X坐标
       * @param {Number} centerY 中心Y坐标
       */
      drawAircraft: function(ctx, centerX, centerY) {
        // 将飞机放在Canvas中心
        var aircraftY = centerY;
        
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        
        // 绘制飞机图标（简化的三角形）
        ctx.beginPath();
        ctx.moveTo(centerX, aircraftY - 15);      // 机头
        ctx.lineTo(centerX - 10, aircraftY + 10); // 左翼
        ctx.lineTo(centerX - 3, aircraftY + 5);   // 左侧机身
        ctx.lineTo(centerX - 3, aircraftY + 15);  // 左尾翼
        ctx.lineTo(centerX + 3, aircraftY + 15);  // 右尾翼
        ctx.lineTo(centerX + 3, aircraftY + 5);   // 右侧机身
        ctx.lineTo(centerX + 10, aircraftY + 10); // 右翼
        ctx.closePath();
        ctx.fill();
        
        // 中心圆点
        ctx.beginPath();
        ctx.arc(centerX, aircraftY, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
      },
      
      /**
       * 获取用于地图显示的稳定航向（增强静止检测版）
       * @returns {Number} 地图显示航向
       */
      getMapDisplayHeading: function() {
        // 如果是北向朝上模式，始终返回0
        if (renderer.currentData.mapOrientationMode === 'north-up') {
          return 0;
        }
        
        var currentSpeed = renderer.currentData.speed || 0;
        var currentHeading = renderer.currentData.heading || 0;
        var currentTrack = renderer.currentData.track || 0;
        var headingMode = renderer.currentData.headingMode || 'heading';
        
        // 🔧 增强的静止状态检测
        var isStationary = currentSpeed < 5; // 5kt以下视为静止
        var hasValidTrack = currentTrack > 0; // 是否有有效航迹数据
        var hasValidHeading = currentHeading > 0 || currentHeading === 0; // 航向数据是否有效
        
        // 调试信息：每5秒输出一次，避免过于频繁
        if (!renderer.LastDebugHeadingTime || Date.now() - renderer.LastDebugHeadingTime > 5000) {
          console.log('🎯 地图航向状态:', {
            headingMode: headingMode,
            heading: currentHeading,
            track: currentTrack,
            speed: currentSpeed,
            isStationary: isStationary,
            hasValidTrack: hasValidTrack,
            mapStableHeading: renderer.currentData.mapStableHeading
          });
          renderer.LastDebugHeadingTime = Date.now();
        }
        
        // 🔧 静止状态特殊处理
        if (isStationary) {
          // 静止时优先使用最后一个稳定的航向值，避免抖动
          if (renderer.currentData.mapStableHeading !== undefined && 
              renderer.currentData.mapStableHeading !== null) {
            // console.log('🚁 静止状态，使用稳定航向:', renderer.currentData.mapStableHeading); // 🔧 减少频繁日志
            return renderer.currentData.mapStableHeading;
          }
          
          // 如果没有稳定航向，使用有效的航迹或航向数据
          if (headingMode === 'track' && hasValidTrack) {
            // 静止时记录航迹作为稳定航向
            renderer.currentData.mapStableHeading = currentTrack;
            console.log('🚁 静止状态记录航迹作为稳定航向:', currentTrack);
            return currentTrack;
          } else if (hasValidHeading) {
            // 静止时记录航向作为稳定航向
            renderer.currentData.mapStableHeading = currentHeading;
            console.log('🚁 静止状态记录航向作为稳定航向:', currentHeading);
            return currentHeading;
          }
          
          // 如果都没有有效数据，保持0度（北向）
          console.log('🚁 静止状态且无有效数据，保持北向');
          return 0;
        }
        
        // 🔧 移动状态的正常逻辑
        if (headingMode === 'track') {
          // 航迹模式：直接使用GPS计算的航迹值
          if (hasValidTrack) {
            console.log('✈️ 移动状态，使用航迹模式:', currentTrack);
            return currentTrack;
          } else {
            // 航迹无效时，回退到航向
            console.warn('✈️ 航迹数据无效，回退到航向:', currentHeading);
            return currentHeading;
          }
        } else {
          // 航向模式：使用指南针航向
          if (hasValidHeading) {
            console.log('🧭 移动状态，使用航向模式:', currentHeading);
            return currentHeading;
          } else {
            // 航向无效时，回退到航迹
            console.warn('🧭 航向数据无效，回退到航迹:', currentTrack);
            return currentTrack;
          }
        }
      },
      
      /**
       * 设置缩放级别（强化版：确保完全同步）
       * @param {Number} newRange 新的地图范围
       * @param {Number} newIndex 新的缩放索引
       */
      setZoomLevel: function(newRange, newIndex) {
        // 强制更新渲染器的缩放数据
        renderer.currentData.mapRange = newRange;
        if (newIndex !== undefined) {
          renderer.currentZoomIndex = newIndex;
        }
        
        console.log('地图渲染器缩放更新:', {
          newRange: newRange,
          newIndex: newIndex,
          rendererRange: renderer.currentData.mapRange,
          rendererIndex: renderer.currentZoomIndex
        });
        
        // 立即重绘，确保视觉效果同步
        renderer.render();
        
        // 通知页面更新UI显示
        if (renderer.callbacks.onZoomChange) {
          renderer.callbacks.onZoomChange({
            newRange: newRange,
            newIndex: newIndex || renderer.currentZoomIndex
          });
        }
      },
      
      /**
       * 切换地图定向模式
       * @returns {Object} {newMode: String, message: String}
       */
      toggleOrientation: function() {
        var currentMode = renderer.currentData.mapOrientationMode;
        var newMode = currentMode === 'heading-up' ? 'north-up' : 'heading-up';
        
        // 切换到北向朝上时，重置稳定航向为0
        if (newMode === 'north-up') {
          renderer.currentData.mapStableHeading = 0;
        } else {
          // 切换到航向朝上时，使用当前航向
          renderer.currentData.mapStableHeading = renderer.currentData.headingMode === 'heading' ? 
            renderer.currentData.heading : renderer.currentData.track;
        }
        
        renderer.currentData.mapOrientationMode = newMode;
        
        // 立即重绘地图
        renderer.render();
        
        var message = newMode === 'north-up' ? '北向朝上' : '航向朝上';
        
        // 显示提示
        wx.showToast({
          title: message,
          icon: 'none',
          duration: 1500
        });
        
        // 通知状态变化
        if (renderer.callbacks.onOrientationChange) {
          renderer.callbacks.onOrientationChange({
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
       * 强制重绘
       */
      forceRender: function() {
        renderer.render();
      },
      
      /**
       * 获取渲染器状态
       * @returns {Object} 状态信息
       */
      getStatus: function() {
        return {
          isInitialized: renderer.isInitialized,
          hasCanvas: !!renderer.mapCanvas,
          canvasSize: {
            width: renderer.canvasWidth,
            height: renderer.canvasHeight
          },
          hasRenderTimer: !!renderer.renderTimer,
          hasBlinkTimer: !!renderer.blinkTimer,
          currentRange: renderer.currentData.mapRange,
          orientationMode: renderer.currentData.mapOrientationMode
        };
      },
      
      /**
       * 🔧 Canvas状态诊断工具
       * @returns {Object} 详细的诊断信息
       */
      diagnoseCanvas: function() {
        var status = {
          timestamp: new Date().toLocaleTimeString(),
          isInitialized: renderer.isInitialized,
          canvas: {
            exists: !!renderer.canvas,
            context: !!renderer.mapCanvas,
            width: renderer.canvasWidth,
            height: renderer.canvasHeight,
            node: renderer.canvas ? 'valid' : 'null'
          },
          timers: {
            renderTimer: !!renderer.renderTimer,
            blinkTimer: !!renderer.blinkTimer,
            renderTimerValue: renderer.renderTimer,
            blinkTimerValue: renderer.blinkTimer
          },
          data: {
            mapRange: renderer.currentData.mapRange,
            hasValidRange: !!(renderer.currentData.mapRange && renderer.currentData.mapRange > 0),
            orientationMode: renderer.currentData.mapOrientationMode,
            hasNearbyAirports: renderer.currentData.nearbyAirports ? renderer.currentData.nearbyAirports.length : 0,
            hasTrackedAirport: !!renderer.currentData.trackedAirport
          },
          performance: {
            lastRenderTime: renderer.lastRenderTime,
            renderThrottleEnabled: renderer.renderThrottleEnabled
          }
        };
        
        // 输出诊断信息到控制台
        console.log('🔧 Canvas诊断报告 (' + status.timestamp + '):', status);
        
        // 检查常见问题
        var issues = [];
        if (!status.isInitialized) issues.push('渲染器未初始化');
        if (!status.canvas.exists) issues.push('Canvas节点丢失');
        if (!status.canvas.context) issues.push('Canvas上下文丢失');
        if (!status.timers.renderTimer) issues.push('渲染定时器未运行');
        if (!status.data.hasValidRange) issues.push('mapRange无效: ' + status.data.mapRange);
        
        if (issues.length > 0) {
          console.warn('🚨 检测到问题:', issues);
          status.issues = issues;
        } else {
          console.log('✅ Canvas状态正常');
          status.issues = [];
        }
        
        return status;
      },
      
      /**
       * 绘制地形图层（增强版：更真实的地形渲染）
       * @param {Object} ctx Canvas上下文
       * @param {Number} centerX 中心X坐标  
       * @param {Number} centerY 中心Y坐标
       * @param {Number} radius 半径
       */
      
      
      
      
      /**
       * 绘制航点标记
       * @param {Object} ctx Canvas上下文
       * @param {Number} centerX 中心X坐标
       * @param {Number} centerY 中心Y坐标  
       * @param {Number} radius 半径
       */
      drawWaypoints: function(ctx, centerX, centerY, radius) {
        var waypoints = renderer.currentData.activeWaypoints;
        var aircraftLat = renderer.currentData.latitude;
        var aircraftLng = renderer.currentData.longitude;
        var currentRange = renderer.currentData.mapRange;
        var mapHeading = renderer.getMapDisplayHeading();
        
        if (!aircraftLat || !aircraftLng || !currentRange) {
          return;
        }
        
        var pixelsPerNM = radius / (currentRange / 4);
        
        for (var i = 0; i < waypoints.length; i++) {
          var waypoint = waypoints[i];
          
          // 计算航点相对于飞机的距离和方位
          var deltaLat = waypoint.lat - aircraftLat;
          var deltaLng = waypoint.lng - aircraftLng;
          
          // 转换为海里
          var distanceY = deltaLat * 60;
          var distanceX = deltaLng * 60 * Math.cos(aircraftLat * Math.PI / 180);
          
          // 计算总距离
          var totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          
          // 只绘制在显示范围内的航点
          if (totalDistance > currentRange / 2) {
            continue;
          }
          
          // 根据地图定向计算屏幕坐标
          var angle = mapHeading * Math.PI / 180;
          var rotatedX = distanceX * Math.cos(angle) - distanceY * Math.sin(angle);
          var rotatedY = distanceX * Math.sin(angle) + distanceY * Math.cos(angle);
          
          var screenX = centerX + rotatedX * pixelsPerNM;
          var screenY = centerY - rotatedY * pixelsPerNM;
          
          // 绘制航点标记
          ctx.strokeStyle = waypoint.enabled ? '#FF6600' : '#666666';
          ctx.fillStyle = waypoint.enabled ? '#FF6600' : '#666666';
          ctx.lineWidth = 2;
          
          // 绘制菱形标记
          ctx.beginPath();
          ctx.moveTo(screenX, screenY - 8);
          ctx.lineTo(screenX + 6, screenY);
          ctx.lineTo(screenX, screenY + 8);
          ctx.lineTo(screenX - 6, screenY);
          ctx.closePath();
          ctx.stroke();
          
          // 如果是选中的航点，填充颜色
          if (waypoint.id === renderer.currentData.selectedWaypoint) {
            ctx.fill();
          }
          
          // 绘制航点名称
          if (waypoint.name) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(waypoint.name, screenX, screenY - 12);
          }
          
          // 绘制距离信息
          ctx.fillStyle = '#CCCCCC';
          ctx.font = '9px sans-serif';
          ctx.fillText(totalDistance.toFixed(1) + 'NM', screenX, screenY + 18);
          
          // 绘制提醒半径（如果启用）
          if (waypoint.enabled && waypoint.alertRadius > 0) {
            ctx.strokeStyle = 'rgba(255, 102, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(screenX, screenY, waypoint.alertRadius * pixelsPerNM, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        
        // 重置文本对齐
        ctx.textAlign = 'left';
      },
      
      
      /**
       * 更新航点数据
       * @param {Array} waypoints 航点数组
       */
      updateWaypoints: function(waypoints) {
        renderer.currentData.activeWaypoints = waypoints || [];
        
        // 强制重新渲染
        renderer.render();
      },
      
      /**
       * 设置选中的航点
       * @param {String} waypointId 航点ID
       */
      setSelectedWaypoint: function(waypointId) {
        renderer.currentData.selectedWaypoint = waypointId;
        
        // 强制重新渲染
        renderer.render();
      },
      
      /**
       * 销毁渲染器
       */
      destroy: function() {
        renderer.stopRenderLoop();
        
        // 清理Canvas上下文
        renderer.mapCanvas = null;
        renderer.isInitialized = false;
        
        // 清理引用
        renderer.callbacks = null;
        renderer.pageRef = null;
        
        console.log('地图渲染器已销毁');
      }
    };
    
    return renderer;
  }
};

module.exports = MapRenderer;