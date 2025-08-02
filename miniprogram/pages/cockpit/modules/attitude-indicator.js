/**
 * 姿态仪模块 V2.0 - 完全重构版本
 * 功能：显示飞机的俯仰角(Pitch)和滚转角(Roll)
 * 特性：高性能渲染、模块化设计、错误处理完善
 */

// 姿态仪状态枚举
var AttitudeState = {
  UNINITIALIZED: 'uninitialized',
  INITIALIZING: 'initializing',
  ACTIVE: 'active',
  SIMULATED: 'simulated',
  ERROR: 'error',
  STOPPED: 'stopped'
};

// 姿态仪渲染器类
function AttitudeRenderer(canvas, config) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.config = config;
  this.lastRenderTime = 0;
  this.renderStats = {
    frameCount: 0,
    totalTime: 0,
    fps: 0
  };
}

AttitudeRenderer.prototype = {
  // 准备渲染上下文
  prepareContext: function() {
    var ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 设置抗锯齿
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    return ctx;
  },
  
  // 渲染主函数
  render: function(pitch, roll) {
    var startTime = Date.now();
    var ctx = this.prepareContext();
    var config = this.config;
    
    // 移动到画布中心
    ctx.translate(config.centerX, config.centerY);
    
    // 1. 绘制旋转的地平线部分（受roll影响）
    ctx.save();
    ctx.rotate(roll * Math.PI / 180);
    this.renderHorizon(ctx, pitch);
    this.renderPitchLadder(ctx, pitch);
    ctx.restore();
    
    // 2. 绘制固定的飞机符号
    this.renderAircraftSymbol(ctx);
    
    // 3. 绘制外圈和刻度
    this.renderOuterRing(ctx);
    this.renderRollScale(ctx, roll);
    
    // 4. 绘制数值显示
    this.renderDataDisplay(ctx, pitch, roll);
    
    ctx.restore();
    
    // 更新性能统计
    this.updateRenderStats(Date.now() - startTime);
  },
  
  // 渲染地平线
  renderHorizon: function(ctx, pitch) {
    var config = this.config;
    var radius = config.radius;
    var pitchOffset = -pitch * config.pitchScale;  // 🎯 修正：重新加上负号，地平线移动方向与飞机姿态相反
    
    // 创建圆形剪切区域
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius - config.borderWidth, 0, 2 * Math.PI);
    ctx.clip();
    
    // 天空渐变
    var skyGradient = ctx.createLinearGradient(0, -radius, 0, pitchOffset);
    skyGradient.addColorStop(0, '#1e3c72');
    skyGradient.addColorStop(1, config.colors.sky);
    
    // 地面渐变
    var groundGradient = ctx.createLinearGradient(0, pitchOffset, 0, radius);
    groundGradient.addColorStop(0, config.colors.ground);
    groundGradient.addColorStop(1, '#3e2723');
    
    // 绘制天空
    ctx.fillStyle = skyGradient;
    ctx.fillRect(-radius, -radius, radius * 2, radius + pitchOffset);
    
    // 绘制地面
    ctx.fillStyle = groundGradient;
    ctx.fillRect(-radius, pitchOffset, radius * 2, radius * 2);
    
    // 绘制地平线
    ctx.beginPath();
    ctx.moveTo(-radius, pitchOffset);
    ctx.lineTo(radius, pitchOffset);
    ctx.strokeStyle = config.colors.horizon;
    ctx.lineWidth = config.horizonLineWidth;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.restore();
  },
  
  // 渲染俯仰角梯度
  renderPitchLadder: function(ctx, pitch) {
    var config = this.config;
    var radius = config.radius;
    var pitchScale = config.pitchScale;
    var pitchOffset = -pitch * pitchScale;  // 🎯 修正：与地平线渲染保持一致，使用负号
    
    ctx.save();
    ctx.strokeStyle = config.colors.pitchLines;
    ctx.fillStyle = config.colors.text;
    ctx.font = config.font.pitch;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 俯仰角刻度线配置
    var majorAngles = [-60, -40, -20, 20, 40, 60];
    var minorAngles = [-50, -30, -10, 10, 30, 50];
    
    // 绘制主刻度
    majorAngles.forEach(function(angle) {
      var y = pitchOffset + angle * pitchScale;  // 🎯 修正：恢复原来的计算方式
      if (Math.abs(y) < radius * 0.7) {
        var lineWidth = radius * 0.3;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-lineWidth / 2, y);
        ctx.lineTo(lineWidth / 2, y);
        ctx.stroke();
        
        // 角度数字
        ctx.fillText(Math.abs(angle).toString(), lineWidth / 2 + 15, y);
        ctx.fillText(Math.abs(angle).toString(), -lineWidth / 2 - 15, y);
      }
    });
    
    // 绘制次刻度
    ctx.lineWidth = 1;
    minorAngles.forEach(function(angle) {
      var y = pitchOffset + angle * pitchScale;  // 🎯 修正：恢复原来的计算方式
      if (Math.abs(y) < radius * 0.7) {
        var lineWidth = radius * 0.15;
        ctx.beginPath();
        ctx.moveTo(-lineWidth / 2, y);
        ctx.lineTo(lineWidth / 2, y);
        ctx.stroke();
      }
    });
    
    ctx.restore();
  },
  
  // 渲染飞机符号
  renderAircraftSymbol: function(ctx) {
    var config = this.config;
    
    ctx.save();
    ctx.strokeStyle = config.colors.aircraft;
    ctx.fillStyle = config.colors.aircraft;
    ctx.lineWidth = config.aircraftLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 添加发光效果
    ctx.shadowColor = config.colors.aircraft;
    ctx.shadowBlur = 6;
    
    // 中心圆点
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // 机翼
    var wingLength = config.aircraftWingLength;
    ctx.beginPath();
    // 左翼
    ctx.moveTo(-wingLength, 0);
    ctx.lineTo(-wingLength / 3, 0);
    ctx.lineTo(-wingLength / 3, 3);
    // 右翼
    ctx.moveTo(wingLength / 3, 0);
    ctx.lineTo(wingLength, 0);
    ctx.lineTo(wingLength / 3, 3);
    ctx.stroke();
    
    // 翼尖标记
    ctx.beginPath();
    ctx.moveTo(-wingLength, -6);
    ctx.lineTo(-wingLength, 6);
    ctx.moveTo(wingLength, -6);
    ctx.lineTo(wingLength, 6);
    ctx.stroke();
    
    ctx.restore();
  },
  
  // 渲染外圈
  renderOuterRing: function(ctx) {
    var config = this.config;
    var radius = config.radius;
    
    ctx.save();
    
    // 外圈阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // 外圈
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = config.colors.border;
    ctx.lineWidth = config.borderWidth;
    ctx.stroke();
    
    ctx.restore();
  },
  
  // 渲染滚转角刻度
  renderRollScale: function(ctx, roll) {
    var config = this.config;
    var radius = config.radius;
    
    ctx.save();
    ctx.strokeStyle = config.colors.angleMarks;
    ctx.fillStyle = config.colors.angleMarks;
    
    // 滚转角刻度
    for (var angle = -60; angle <= 60; angle += 10) {
      var radian = (angle - 90) * Math.PI / 180;
      var isMain = angle % 30 === 0;
      var markLength = isMain ? 12 : 8;
      
      var x1 = Math.cos(radian) * (radius - markLength);
      var y1 = Math.sin(radian) * (radius - markLength);
      var x2 = Math.cos(radian) * radius;
      var y2 = Math.sin(radian) * radius;
      
      ctx.lineWidth = isMain ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    // 当前滚转角指示器
    ctx.save();
    ctx.rotate(roll * Math.PI / 180); // 🎯 修正：移除负号，让指示器方向与现代仪表一致
    ctx.fillStyle = config.colors.aircraft;
    ctx.beginPath();
    ctx.moveTo(0, -radius + 5);
    ctx.lineTo(-6, -radius + 15);
    ctx.lineTo(6, -radius + 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    ctx.restore();
  },
  
  // 渲染数据显示
  renderDataDisplay: function(ctx, pitch, roll) {
    var config = this.config;
    
    ctx.save();
    ctx.font = config.font.values;
    ctx.fillStyle = config.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // 在底部显示数值
    var bottomY = config.radius + 20;
    ctx.fillText('俯仰: ' + pitch.toFixed(1) + '°', -40, bottomY);
    ctx.fillText('滚转: ' + roll.toFixed(1) + '°', 40, bottomY);
    
    ctx.restore();
  },
  
  // 更新渲染统计
  updateRenderStats: function(renderTime) {
    this.renderStats.frameCount++;
    this.renderStats.totalTime += renderTime;
    
    // 每秒更新一次FPS
    var now = Date.now();
    if (now - this.lastRenderTime > 1000) {
      this.renderStats.fps = this.renderStats.frameCount;
      this.renderStats.frameCount = 0;
      this.renderStats.totalTime = 0;
      this.lastRenderTime = now;
    }
  },
  
  // 获取性能统计
  getStats: function() {
    return {
      fps: this.renderStats.fps,
      avgRenderTime: this.renderStats.totalTime / Math.max(1, this.renderStats.frameCount)
    };
  }
};

// 传感器数据处理器
function SensorDataProcessor(config) {
  this.config = config;
  this.dataBuffer = [];
  this.maxBufferSize = 10;
  this.calibration = {
    pitchOffset: 0,
    rollOffset: 0
  };
}

SensorDataProcessor.prototype = {
  // 处理原始传感器数据
  process: function(rawData) {
    // 应用校准偏移，使用正确的符号方向
    var pitch = this.constrainPitch(rawData.beta - this.calibration.pitchOffset); // 🎯 恢复：让地平线移动方向正确
    var roll = this.normalizeRoll(rawData.gamma - this.calibration.rollOffset);   // 🎯 滚转角保持正确
    
    // 添加到缓冲区
    this.dataBuffer.push({ pitch: pitch, roll: roll, timestamp: Date.now() });
    if (this.dataBuffer.length > this.maxBufferSize) {
      this.dataBuffer.shift();
    }
    
    // 应用平滑滤波
    return this.applySmoothing();
  },
  
  // 限制俯仰角范围
  constrainPitch: function(pitch) {
    return Math.max(-90, Math.min(90, pitch || 0));
  },
  
  // 规范化滚转角
  normalizeRoll: function(roll) {
    roll = roll || 0;
    // 将 gamma 的 ±90° 范围扩展到 ±180°
    if (roll > 90) roll = 180 - roll;
    if (roll < -90) roll = -180 - roll;
    return roll;
  },
  
  // 应用平滑滤波
  applySmoothing: function() {
    if (this.dataBuffer.length === 0) {
      return { pitch: 0, roll: 0 };
    }
    
    var smoothFactor = this.config.smoothFactor;
    var latestData = this.dataBuffer[this.dataBuffer.length - 1];
    
    if (this.dataBuffer.length === 1) {
      return latestData;
    }
    
    // 加权平均
    var weightedPitch = 0;
    var weightedRoll = 0;
    var totalWeight = 0;
    
    for (var i = 0; i < this.dataBuffer.length; i++) {
      var weight = Math.pow(smoothFactor, this.dataBuffer.length - 1 - i);
      weightedPitch += this.dataBuffer[i].pitch * weight;
      weightedRoll += this.dataBuffer[i].roll * weight;
      totalWeight += weight;
    }
    
    return {
      pitch: weightedPitch / totalWeight,
      roll: weightedRoll / totalWeight
    };
  },
  
  // 校准传感器
  calibrate: function() {
    if (this.dataBuffer.length < 5) {
      return false;
    }
    
    var sumPitch = 0;
    var sumRoll = 0;
    
    this.dataBuffer.forEach(function(data) {
      sumPitch += data.pitch;
      sumRoll += data.roll;
    });
    
    this.calibration.pitchOffset = sumPitch / this.dataBuffer.length;
    this.calibration.rollOffset = sumRoll / this.dataBuffer.length;
    
    return true;
  }
};

// 主姿态仪类
function AttitudeIndicatorV2() {
  this.state = AttitudeState.UNINITIALIZED;
  this.renderer = null;
  this.sensorProcessor = null;
  this.config = null;
  this.animationHandle = null;
  this.sensorListening = false;
  this.currentData = { pitch: 0, roll: 0 };
  this.callbacks = {
    onStateChange: null,
    onDataUpdate: null,
    onError: null
  };
}

AttitudeIndicatorV2.prototype = {
  // 初始化
  init: function(canvasId, config, callbacks) {
    var self = this;
    // 使用内置配置，不再依赖外部config.js
    this.config = {
      // 颜色配置
      colors: {
        sky: '#4A90E2',              // 天空颜色（蓝色）
        ground: '#8B4513',           // 地面颜色（棕色）
        horizon: '#FFFFFF',          // 地平线颜色（白色）
        aircraft: '#FF6B00',         // 飞机标志颜色（橙色）
        border: '#CCCCCC',           // 外圈边框颜色
        background: '#000000',       // 背景颜色
        text: '#FFFFFF',             // 文字颜色
        angleMarks: '#CCCCCC',       // 角度刻度颜色
        pitchLines: '#FFFFFF'        // 俯仰角刻度线颜色
      },
      
      // 线条宽度
      borderWidth: 1,
      horizonLineWidth: 2,
      aircraftLineWidth: 3,
      
      // 飞机标志尺寸
      aircraftWingLength: 22,        // 飞机翼展长度
      
      // 俯仰角刻度配置
      pitchScale: 1.3,               // 俯仰角像素比例（像素/度）
      
      // 字体配置
      font: {
        pitch: '12px Arial',         // 俯仰角数字字体
        values: '14px Arial'         // 数值显示字体
      },
      
      // 平滑处理
      smoothFactor: 0.85,            // 数据平滑系数（0-1，越大越平滑）
      
      // 更新频率
      updateInterval: 50,            // 更新间隔（毫秒）
      
      // 布局控制配置 - 完全由JS控制样式
      layout: {
        // Canvas尺寸配置 - 🎯 修复：使用更保守的默认值避免跳变
        canvas: {
          baseSize: 340,             // 基础尺寸（rpx）- 降低默认值
          responsive: {
            maxWidth750: 370,        // ≤750px时的尺寸
            maxWidth600: 320,        // ≤600px时的尺寸
            maxWidth450: 270         // ≤450px时的尺寸
          }
        },
        
        // Grid布局配置 - 🎯 修复：优化默认布局避免跳变
        grid: {
          baseGap: 3,                // 基础间距（rpx）- 最小化间距
          basePadding: '25rpx 0rpx', // 基础内边距 - 减小默认值
          baseMinHeight: 380,        // 基础最小高度（rpx）- 减小默认值
          columns: {
            left: '160rpx',          // 固定左侧宽度 - 大幅增加
            center: '1fr',           // 中间自适应
            right: '160rpx'          // 固定右侧宽度 - 大幅增加
          },
          responsive: {
            maxWidth750: {
              gap: 3,
              padding: '24rpx 0rpx',
              minHeight: 400,
              columns: {
                left: '150rpx',
                center: '1fr',
                right: '150rpx'
              }
            },
            maxWidth600: {
              gap: 2,
              padding: '20rpx 0rpx',
              minHeight: 360,
              columns: {
                left: '155rpx',
                center: '1fr',
                right: '155rpx'
              }
            },
            maxWidth450: {
              gap: 2,
              padding: '16rpx 0rpx',
              minHeight: 320,
              columns: {
                left: '160rpx',
                center: '1fr',
                right: '160rpx'
              }
            }
          }
        },
        
        // 面板配置 - 🎯 修复：调整为大幅增大的面板尺寸
        panel: {
          baseWidth: 140,            // 基础宽度（rpx）- 大幅增大尺寸
          baseHeight: 110,           // 基础高度（rpx）- 大幅增大尺寸  
          basePadding: '16rpx 12rpx', // 面板内边距 - 增大
          responsive: {
            maxWidth750: { width: 135, height: 105, padding: '16rpx 12rpx' },
            maxWidth600: { width: 135, height: 105, padding: '16rpx 12rpx' },
            maxWidth450: { width: 130, height: 100, padding: '16rpx 12rpx' }
          }
        },
        
        // 文字样式配置
        text: {
          label: {
            baseFontSize: 18,        // 标签基础字体大小（rpx）
            baseMarginBottom: 6,     // 标签底部间距（rpx）
            responsive: {
              maxWidth750: { fontSize: 16, marginBottom: 5 },
              maxWidth600: { fontSize: 14, marginBottom: 4 },
              maxWidth450: { fontSize: 12, marginBottom: 3 }
            }
          },
          value: {
            baseFontSize: 38,        // 数值基础字体大小（rpx）
            baseMinWidth: 50,        // 数值最小宽度（rpx）
            responsive: {
              maxWidth750: { fontSize: 32, minWidth: 45 },
              maxWidth600: { fontSize: 28, minWidth: 40 },
              maxWidth450: { fontSize: 24, minWidth: 35 }
            }
          },
          unit: {
            baseFontSize: 16,        // 单位基础字体大小（rpx）
            baseMarginTop: 4,        // 单位顶部间距（rpx）
            responsive: {
              maxWidth750: { fontSize: 14, marginTop: 3 },
              maxWidth600: { fontSize: 12, marginTop: 2 },
              maxWidth450: { fontSize: 10, marginTop: 2 }
            }
          }
        }
      }
    };
    this.callbacks = Object.assign(this.callbacks, callbacks || {});
    
    this.setState(AttitudeState.INITIALIZING);
    
    // 初始化Canvas
    this.initCanvas(canvasId, function(success) {
      if (success) {
        // 初始化传感器处理器
        self.sensorProcessor = new SensorDataProcessor(self.config);
        
        // 尝试启动真实传感器
        self.startRealSensor();
      } else {
        self.handleError('Canvas初始化失败');
      }
    });
  },
  
  // 初始化Canvas
  initCanvas: function(canvasId, callback) {
    var self = this;
    var query = wx.createSelectorQuery();
    
    query.select('#' + canvasId).fields({ node: true, size: true }).exec(function(res) {
      if (res && res[0] && res[0].node) {
        var canvas = res[0].node;
        var systemInfo = wx.getSystemInfoSync();
        var dpr = systemInfo.pixelRatio;
        var screenWidth = systemInfo.screenWidth;
        
        // 🎯 【修复】先计算响应式布局参数，避免尺寸跳变
        var layoutParams = self.calculateLayoutParams(screenWidth);
        
        // 🎯 【修复】立即通过回调传递布局参数给主页面，确保在Canvas创建前完成布局
        console.log('🎯 【调试】计算的布局参数:', layoutParams);
        if (self.callbacks.onLayoutUpdate) {
          self.callbacks.onLayoutUpdate(layoutParams);
        }
        
        // 设置Canvas尺寸
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        
        // 缩放上下文以适应设备像素比
        var ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // 动态计算Canvas配置参数
        var actualWidth = res[0].width;
        var actualHeight = res[0].height;
        var dynamicConfig = Object.assign({}, self.config, {
          canvasWidth: actualWidth,
          canvasHeight: actualHeight,
          centerX: actualWidth / 2,
          centerY: actualHeight / 2,
          radius: Math.min(actualWidth, actualHeight) / 2 - 10  // 留10px边距
        });
        
        console.log('🎯 屏幕宽度:', screenWidth);
        console.log('🎯 Canvas实际尺寸:', actualWidth, 'x', actualHeight);
        console.log('🎯 计算的布局参数:', layoutParams);
        
        // 创建渲染器
        self.renderer = new AttitudeRenderer(canvas, dynamicConfig);
        
        callback(true);
      } else {
        callback(false);
      }
    });
  },
  
  // 🎯 计算响应式布局参数
  calculateLayoutParams: function(screenWidth) {
    var layout = this.config.layout;
    var params = {
      // Grid和Canvas参数
      canvasSize: layout.canvas.baseSize,
      gridGap: layout.grid.baseGap,
      gridPadding: layout.grid.basePadding,
      gridMinHeight: layout.grid.baseMinHeight,
      gridColumns: layout.grid.columns.left + ' ' + layout.grid.columns.center + ' ' + layout.grid.columns.right,
      panelWidth: layout.panel.baseWidth,
      panelHeight: layout.panel.baseHeight,
      panelPadding: layout.panel.basePadding,
      
      // 文字样式参数
      labelFontSize: layout.text.label.baseFontSize,
      labelMarginBottom: layout.text.label.baseMarginBottom,
      valueFontSize: layout.text.value.baseFontSize,
      valueMinWidth: layout.text.value.baseMinWidth,
      unitFontSize: layout.text.unit.baseFontSize,
      unitMarginTop: layout.text.unit.baseMarginTop
    };
    
    // 根据屏幕宽度应用响应式设置
    if (screenWidth <= 450) {
      var gridResp = layout.grid.responsive.maxWidth450;
      var panelResp = layout.panel.responsive.maxWidth450;
      var textResp = layout.text;
      
      params.canvasSize = layout.canvas.responsive.maxWidth450;
      params.gridGap = gridResp.gap;
      params.gridPadding = gridResp.padding;
      params.gridMinHeight = gridResp.minHeight;
      params.gridColumns = gridResp.columns.left + ' ' + gridResp.columns.center + ' ' + gridResp.columns.right;
      params.panelWidth = panelResp.width;
      params.panelHeight = panelResp.height;
      params.panelPadding = panelResp.padding;
      
      params.labelFontSize = textResp.label.responsive.maxWidth450.fontSize;
      params.labelMarginBottom = textResp.label.responsive.maxWidth450.marginBottom;
      params.valueFontSize = textResp.value.responsive.maxWidth450.fontSize;
      params.valueMinWidth = textResp.value.responsive.maxWidth450.minWidth;
      params.unitFontSize = textResp.unit.responsive.maxWidth450.fontSize;
      params.unitMarginTop = textResp.unit.responsive.maxWidth450.marginTop;
      
    } else if (screenWidth <= 600) {
      var gridResp = layout.grid.responsive.maxWidth600;
      var panelResp = layout.panel.responsive.maxWidth600;
      var textResp = layout.text;
      
      params.canvasSize = layout.canvas.responsive.maxWidth600;
      params.gridGap = gridResp.gap;
      params.gridPadding = gridResp.padding;
      params.gridMinHeight = gridResp.minHeight;
      params.gridColumns = gridResp.columns.left + ' ' + gridResp.columns.center + ' ' + gridResp.columns.right;
      params.panelWidth = panelResp.width;
      params.panelHeight = panelResp.height;
      params.panelPadding = panelResp.padding;
      
      params.labelFontSize = textResp.label.responsive.maxWidth600.fontSize;
      params.labelMarginBottom = textResp.label.responsive.maxWidth600.marginBottom;
      params.valueFontSize = textResp.value.responsive.maxWidth600.fontSize;
      params.valueMinWidth = textResp.value.responsive.maxWidth600.minWidth;
      params.unitFontSize = textResp.unit.responsive.maxWidth600.fontSize;
      params.unitMarginTop = textResp.unit.responsive.maxWidth600.marginTop;
      
    } else if (screenWidth <= 750) {
      var gridResp = layout.grid.responsive.maxWidth750;
      var panelResp = layout.panel.responsive.maxWidth750;
      var textResp = layout.text;
      
      params.canvasSize = layout.canvas.responsive.maxWidth750;
      params.gridGap = gridResp.gap;
      params.gridPadding = gridResp.padding;
      params.gridMinHeight = gridResp.minHeight;
      params.gridColumns = gridResp.columns.left + ' ' + gridResp.columns.center + ' ' + gridResp.columns.right;
      params.panelWidth = panelResp.width;
      params.panelHeight = panelResp.height;
      params.panelPadding = panelResp.padding;
      
      params.labelFontSize = textResp.label.responsive.maxWidth750.fontSize;
      params.labelMarginBottom = textResp.label.responsive.maxWidth750.marginBottom;
      params.valueFontSize = textResp.value.responsive.maxWidth750.fontSize;
      params.valueMinWidth = textResp.value.responsive.maxWidth750.minWidth;
      params.unitFontSize = textResp.unit.responsive.maxWidth750.fontSize;
      params.unitMarginTop = textResp.unit.responsive.maxWidth750.marginTop;
    }
    
    return params;
  },
  
  // 启动真实传感器
  startRealSensor: function() {
    var self = this;
    
    wx.startDeviceMotionListening({
      interval: 'ui',  // 使用UI级别的更新频率
      success: function() {
        self.sensorListening = true;
        self.setState(AttitudeState.ACTIVE);
        
        // 监听设备运动
        wx.onDeviceMotionChange(function(res) {
          if (self.state === AttitudeState.ACTIVE) {
            self.handleSensorData(res);
          }
        });
        
        // 启动渲染循环
        self.startRenderLoop();
      },
      fail: function(error) {
        console.warn('真实传感器不可用，切换到模拟模式', error);
        self.startSimulation();
      }
    });
  },
  
  // 启动模拟模式
  startSimulation: function() {
    var self = this;
    this.setState(AttitudeState.SIMULATED);
    
    // 模拟数据生成器
    var time = 0;
    this.simulationTimer = setInterval(function() {
      if (self.state !== AttitudeState.SIMULATED) {
        clearInterval(self.simulationTimer);
        return;
      }
      
      time += 0.05;
      var simulatedData = {
        beta: Math.sin(time * 0.3) * 20,  // ±20度俯仰
        gamma: Math.cos(time * 0.2) * 30  // ±30度滚转
      };
      
      self.handleSensorData(simulatedData);
    }, 50);
    
    // 启动渲染循环
    this.startRenderLoop();
  },
  
  // 处理传感器数据
  handleSensorData: function(rawData) {
    // 处理数据
    var processedData = this.sensorProcessor.process(rawData);
    
    // 更新当前数据
    this.currentData = {
      pitch: Math.round(processedData.pitch * 10) / 10,
      roll: Math.round(processedData.roll * 10) / 10
    };
    
    // 触发数据更新回调
    if (this.callbacks.onDataUpdate) {
      this.callbacks.onDataUpdate(this.currentData);
    }
  },
  
  // 启动渲染循环
  startRenderLoop: function() {
    var self = this;
    var targetFPS = 30;
    var frameInterval = 1000 / targetFPS;
    var lastFrameTime = 0;
    
    function render() {
      var now = Date.now();
      var deltaTime = now - lastFrameTime;
      
      if (deltaTime >= frameInterval) {
        if (self.renderer && (self.state === AttitudeState.ACTIVE || self.state === AttitudeState.SIMULATED)) {
          self.renderer.render(self.currentData.pitch, self.currentData.roll);
        }
        lastFrameTime = now - (deltaTime % frameInterval);
      }
      
      self.animationHandle = setTimeout(render, 16);
    }
    
    render();
  },
  
  // 设置状态
  setState: function(newState) {
    if (this.state !== newState) {
      this.state = newState;
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(newState);
      }
    }
  },
  
  // 处理错误
  handleError: function(error) {
    console.error('姿态仪错误:', error);
    this.setState(AttitudeState.ERROR);
    
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  },
  
  // 校准
  calibrate: function() {
    if (this.sensorProcessor) {
      var success = this.sensorProcessor.calibrate();
      if (success) {
        wx.showToast({
          title: '校准成功',
          icon: 'success',
          duration: 1500
        });
      } else {
        wx.showToast({
          title: '需要更多数据',
          icon: 'none',
          duration: 1500
        });
      }
      return success;
    }
    return false;
  },
  
  // 获取状态信息
  getStatus: function() {
    return {
      state: this.state,
      data: this.currentData,
      performance: this.renderer ? this.renderer.getStats() : null
    };
  },
  
  // 停止
  stop: function() {
    this.setState(AttitudeState.STOPPED);
    
    // 停止传感器监听
    if (this.sensorListening) {
      wx.stopDeviceMotionListening();
      wx.offDeviceMotionChange();
      this.sensorListening = false;
    }
    
    // 停止模拟
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
    
    // 停止渲染
    if (this.animationHandle) {
      clearTimeout(this.animationHandle);
      this.animationHandle = null;
    }
  },
  
  // 暂停
  pause: function() {
    if (this.state === AttitudeState.ACTIVE || this.state === AttitudeState.SIMULATED) {
      this.previousState = this.state;
      this.setState(AttitudeState.STOPPED);
    }
  },
  
  // 恢复
  resume: function() {
    if (this.previousState) {
      if (this.previousState === AttitudeState.ACTIVE) {
        this.startRealSensor();
      } else if (this.previousState === AttitudeState.SIMULATED) {
        this.startSimulation();
      }
    }
  }
};

// 工厂函数
function create(canvasId, config, callbacks) {
  var indicator = new AttitudeIndicatorV2();
  indicator.init(canvasId, config, callbacks);
  return indicator;
}

// 自动初始化功能
function autoInit() {
  // 页面加载完成后自动创建姿态仪
  setTimeout(function() {
    // 获取当前页面实例，用于更新数据
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    
    var indicator = create('attitudeIndicator', null, {
      onStateChange: function(state) {
        console.log('✈️ 姿态仪状态变化:', state);
      },
      onDataUpdate: function(data) {
        // 🔧 减少日志频率：只在数据有显著变化时记录
        if (!indicator.lastLoggedData || 
            Math.abs(data.pitch - (indicator.lastLoggedData.pitch || 0)) > 2 ||
            Math.abs(data.roll - (indicator.lastLoggedData.roll || 0)) > 2) {
          console.log('✈️ 姿态仪数据更新:', data);
          indicator.lastLoggedData = data;
        }
        
        // 🎯 更新页面data，让WXML能显示实时的PITCH和ROLL数值
        if (currentPage && currentPage.setData) {
          currentPage.setData({
            pitch: -data.pitch,  // 🎯 修正：只修正显示数值的符号，不影响渲染
            roll: data.roll
          });
        }
      },
      onError: function(error) {
        console.error('❌ 姿态仪错误:', error);
      }
    });
    console.log('✈️ 姿态仪自动初始化完成');
  }, 1500); // 延迟1.5秒确保页面完全加载
}

module.exports = {
  create: create,
  AttitudeIndicatorV2: AttitudeIndicatorV2,
  AttitudeState: AttitudeState,
  autoInit: autoInit
};