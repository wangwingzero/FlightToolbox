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
  
  // 🎨 性能优化：仅初始化时设置画布质量，避免每帧开销
  this.initCanvasQuality();
  
  // 🎨 渐变缓存：预先创建渐变对象
  this.cachedGradients = {};
}

AttitudeRenderer.prototype.initCanvasQuality = function() {
  var ctx = this.ctx;
  // 仅设置一次，避免每帧重复开销
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = this.config.enableHighQuality ? 'high' : 'medium';
};

// 🎨 渐变缓存方法：避免每帧重新创建渐变对象
AttitudeRenderer.prototype.getCachedGradient = function(name, factory) {
  if (!this.cachedGradients[name]) {
    this.cachedGradients[name] = factory.call(this);
  }
  return this.cachedGradients[name];
};

AttitudeRenderer.prototype = {
  // 准备渲染上下文（已优化，不再每帧设置画布质量）
  prepareContext: function() {
    var ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 🎨 已移除每帧设置画布质量的开销，质量在初始化时设置一次
    
    return ctx;
  },
  
  // 渲染主函数
  render: function(pitch, roll) {
  var startTime = Date.now();
  var ctx = this.ctx;
  var config = this.config;

  // 轻量级差分渲染：先判定是否需要绘制，避免先清屏造成闪烁
  this._lastRendered = this._lastRendered || { pitch: null, roll: null, t: 0 };
  var deltaPitch = this._lastRendered.pitch == null ? Infinity : Math.abs(pitch - this._lastRendered.pitch);
  var deltaRoll = this._lastRendered.roll == null ? Infinity : Math.abs(roll - this._lastRendered.roll);
  var timeSince = Date.now() - (this._lastRendered.t || 0);
  var needsRender = (deltaPitch > 0.2 || deltaRoll > 0.2) || timeSince > 500; // 0.2°阈值，500ms兜底
  if (!needsRender) {
    // 不清屏，直接跳过，防止闪烁
    return; // 跳过本帧
  }

  // 准备上下文后再清屏
  ctx = this.prepareContext();

  // 移动到画布中心
  ctx.translate(config.centerX, config.centerY);

      // 1. 绘制旋转的地平线部分（受roll影响）
  ctx.save();
  ctx.rotate(roll * Math.PI / 180);
  this.renderHorizon(ctx, pitch);
  this.renderPitchLadder(ctx, pitch);
  ctx.restore();

  // 轻微抗抖：对最终落笔位置做一次小范围插值，减小微小跳动
  if (!this._lastRendered) this._lastRendered = { pitch: pitch, roll: roll, t: Date.now() };
  var k = 0.2; // 低比例插值，避免明显延迟
  pitch = this._lastRendered.pitch + (pitch - this._lastRendered.pitch) * k;
  roll = this._lastRendered.roll + (roll - this._lastRendered.roll) * k;

    // 2. 绘制固定的飞机符号
    this.renderAircraftSymbol(ctx);

    // 3. 绘制外圈和刻度
    this.renderOuterRing(ctx);
    this.renderRollScale(ctx, roll);

    // 4. 绘制数值显示
    this.renderDataDisplay(ctx, pitch, roll);

      ctx.restore();
  
  // 更新“最后绘制值”以供下一帧差分判断与插值
  this._lastRendered = { pitch: pitch, roll: roll, t: Date.now() };
  
  // 更新性能统计
  this.updateRenderStats(Date.now() - startTime);
},
  
  // 渲染地平线（已优化：缓存渐变+阴影控制）
  renderHorizon: function(ctx, pitch) {
    var config = this.config;
    var radius = config.radius;
    var pitchOffset = -pitch * config.pitchScale;  // 🎯 修正：重新加上负号，地平线移动方向与飞机姿态相反
    
    // 创建圆形剪切区域
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius - config.borderWidth, 0, 2 * Math.PI);
    ctx.clip();
    
    // 🎨 缓存优化：使用预缓存的渐变对象
    var skyGradient = this.getCachedGradient('sky', function() {
      var grad = ctx.createLinearGradient(0, -radius, 0, 0);
      grad.addColorStop(0, '#1e3c72');
      grad.addColorStop(1, config.colors.sky);
      return grad;
    });
    
    var groundGradient = this.getCachedGradient('ground', function() {
      var grad = ctx.createLinearGradient(0, 0, 0, radius);
      grad.addColorStop(0, config.colors.ground);
      grad.addColorStop(1, '#3e2723');
      return grad;
    });
    
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
    
    // 🎨 性能优化：阴影可配置关闭
    if (config.enableShadows !== false) {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 4;
    }
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
    // 🎯 保存最后的原始传感器数据供校准使用
    this.lastRawData = rawData;
    
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
  
  // 🎯 增强型校准传感器
  calibrate: function() {
    if (this.dataBuffer.length < 10) {
      return { success: false, reason: '数据不足，需要至少10个数据点' };
    }
    
    // 检查数据稳定性（变化幅度应小于±1度）
    var pitchVariance = this.calculateVariance('pitch');
    var rollVariance = this.calculateVariance('roll');
    
    if (pitchVariance > 1 || rollVariance > 1) {
      return { success: false, reason: '设备移动过多，请保持静止' };
    }
    
    // 使用加权平均计算偏移量（最近的数据权重更高）
    var weightedPitchSum = 0;
    var weightedRollSum = 0;
    var totalWeight = 0;
    
    for (var i = 0; i < this.dataBuffer.length; i++) {
      var weight = Math.pow(0.9, this.dataBuffer.length - 1 - i);
      weightedPitchSum += this.dataBuffer[i].pitch * weight;
      weightedRollSum += this.dataBuffer[i].roll * weight;
      totalWeight += weight;
    }
    
    this.calibration.pitchOffset = weightedPitchSum / totalWeight;
    this.calibration.rollOffset = weightedRollSum / totalWeight;
    this.calibration.calibrationTime = Date.now();
    this.calibration.isValid = true;
    
    // 保存到本地存储
    this.saveCalibration();
    
    return { 
      success: true, 
      pitchOffset: this.calibration.pitchOffset.toFixed(2),
      rollOffset: this.calibration.rollOffset.toFixed(2)
    };
  },
  
  // 计算数据方差（用于稳定性检查）
  calculateVariance: function(type) {
    if (this.dataBuffer.length < 2) return 0;
    
    var sum = 0;
    var sumSquared = 0;
    
    this.dataBuffer.forEach(function(data) {
      var value = data[type];
      sum += value;
      sumSquared += value * value;
    });
    
    var mean = sum / this.dataBuffer.length;
    var variance = (sumSquared / this.dataBuffer.length) - (mean * mean);
    
    return Math.sqrt(variance);
  },
  
  // 保存校准数据到本地存储
  saveCalibration: function() {
    try {
      var calibrationData = {
        pitchOffset: this.calibration.pitchOffset,
        rollOffset: this.calibration.rollOffset,
        calibrationTime: this.calibration.calibrationTime,
        deviceInfo: wx.getSystemInfoSync(),
        isValid: this.calibration.isValid
      };
      wx.setStorageSync('attitude_calibration', calibrationData);
    } catch (error) {
      console.error('保存校准数据失败:', error);
    }
  },
  
  // 加载校准数据
  loadCalibration: function() {
    try {
      var calibrationData = wx.getStorageSync('attitude_calibration');
      if (calibrationData && calibrationData.isValid) {
        this.calibration.pitchOffset = calibrationData.pitchOffset || 0;
        this.calibration.rollOffset = calibrationData.rollOffset || 0;
        this.calibration.calibrationTime = calibrationData.calibrationTime;
        this.calibration.isValid = calibrationData.isValid;
        return true;
      }
    } catch (error) {
      console.error('加载校准数据失败:', error);
    }
    return false;
  },
  
  // 重置校准
  resetCalibration: function() {
    this.calibration.pitchOffset = 0;
    this.calibration.rollOffset = 0;
    this.calibration.calibrationTime = null;
    this.calibration.isValid = false;
    
    try {
      wx.removeStorageSync('attitude_calibration');
    } catch (error) {
      console.error('清除校准数据失败:', error);
    }
  },
  
  // 获取校准状态
  getCalibrationStatus: function() {
    return {
      isCalibrated: this.calibration.isValid,
      pitchOffset: this.calibration.pitchOffset,
      rollOffset: this.calibration.rollOffset,
      calibrationTime: this.calibration.calibrationTime
    };
  },
  
  // 🎯 快速校准 - 立即使用当前传感器数据作为零基准
  quickCalibrate: function() {
    // 🎯 简化校准逻辑：直接使用当前原始传感器数据作为新的偏移基准
    if (!this.lastRawData) {
      return { success: false, reason: '无原始传感器数据' };
    }
    
    // 目标偏移量（以当前原始值为参考）
    var targetPitchOffset = this.lastRawData.beta;
    var targetRollOffset = this.lastRawData.gamma;
    
    // 平滑过渡：避免一次性清空缓冲导致的可见跳变
    var steps = 8; // 8 帧内完成过渡
    var stepIdx = 0;
    var self = this;
    var startPitchOffset = this.calibration.pitchOffset || 0;
    var startRollOffset = this.calibration.rollOffset || 0;
    
    function step() {
      stepIdx++;
      var t = stepIdx / steps;
      // 线性插值到目标偏移
      self.calibration.pitchOffset = startPitchOffset + (targetPitchOffset - startPitchOffset) * t;
      self.calibration.rollOffset  = startRollOffset  + (targetRollOffset  - startRollOffset)  * t;
      self.calibration.calibrationTime = Date.now();
      self.calibration.isValid = true;
      if (stepIdx < steps) {
        // 不清空 dataBuffer，保持平滑递进
        setTimeout(step, 16); // ~60fps
      } else {
        try { self.saveCalibration(); } catch (e) {}
      }
    }
    step();
    
    // 立即返回成功，让UI反馈及时
    return {
      success: true,
      pitchOffset: targetPitchOffset.toFixed(2),
      rollOffset: targetRollOffset.toFixed(2)
    };
  },

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
  this._lastSensorProcessTime = 0;        // 传感器处理节流
  this.minSensorIntervalMs = 16;          // ~60Hz
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
      smoothFactor: 0.9,            // 稍强一点的平滑
      enableShadows: false,         // 默认关闭阴影以提升流畅度
      // 更新频率
      updateInterval: 50,
      
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
        
        // 🎯 加载保存的校准数据
        self.sensorProcessor.loadCalibration();
        
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
    
    // 避免重复注册监听器导致回调叠加
    try { wx.offDeviceMotionChange(); } catch (e) {}
    
    wx.startDeviceMotionListening({
      interval: 'ui',  // 使用UI级别的更新频率
      success: function() {
        self.sensorListening = true;
        self.setState(AttitudeState.ACTIVE);
        
        // 监听设备运动（带节流）
        wx.onDeviceMotionChange(function(res) {
          if (self.state === AttitudeState.ACTIVE) {
            var now = Date.now();
            if (self._lastSensorProcessTime && now - self._lastSensorProcessTime < self.minSensorIntervalMs) {
              return; // 输入节流，防止事件风暴
            }
            self._lastSensorProcessTime = now;
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
  
  // 🎯 优化传感器数据处理 - 确保数据更新触发渲染
  handleSensorData: function(rawData) {
    try {
      // 处理数据
      var processedData = this.sensorProcessor.process(rawData);
      
      // 更新当前数据
      var newData = {
        pitch: Math.round(processedData.pitch * 10) / 10,
        roll: Math.round(processedData.roll * 10) / 10
      };
      
      // 🎯 检查数据是否有变化
      var hasChange = !this.currentData || 
                     Math.abs(newData.pitch - this.currentData.pitch) > 0.1 ||
                     Math.abs(newData.roll - this.currentData.roll) > 0.1;
      
      this.currentData = newData;
      
      // 🎯 即使数据没有显著变化，也要定期触发回调确保UI更新
      if (hasChange || !this.lastCallbackTime || Date.now() - this.lastCallbackTime > 1000) {
        if (this.callbacks.onDataUpdate) {
          this.callbacks.onDataUpdate(this.currentData);
        }
        this.lastCallbackTime = Date.now();
      }
      
      // 🎯 记录最后的数据更新时间
      this.lastDataUpdateTime = Date.now();
      
    } catch (error) {
      console.error('🚨 传感器数据处理错误:', error);
      // 不中断处理，继续使用之前的数据
    }
  },
  
  // 🎯 优化渲染循环 - 修复卡住问题
  startRenderLoop: function(skipWatchdog) {
    var self = this;
    var targetFPS = 30;
    var frameInterval = 1000 / targetFPS;
    var lastFrameTime = 0;
    var errorCount = 0;
    var maxErrors = 5;

    var useRaf = (typeof self.canvas !== 'undefined' && self.canvas && typeof self.canvas.requestAnimationFrame === 'function');

    // 🔧 初始化渲染时间戳，供看门狗使用
    self._lastRenderTick = Date.now();
    
    function render() {
      try {
        // 🎯 移除双重频率控制，统一使用setTimeout间隔控制
        if (self.renderer && 
            (self.state === AttitudeState.ACTIVE || self.state === AttitudeState.SIMULATED) &&
            self.currentData) {
          
          // 🎯 强制渲染，确保流畅性
          self.renderer.render(self.currentData.pitch, self.currentData.roll);
          
          // 🔧 更新渲染时间戳，供看门狗判断渲染状态
          self._lastRenderTick = Date.now();
          
          // 重置错误计数
          errorCount = 0;
        }
        
        // 🎯 统一的30fps调度 (33ms间隔)
        if (self.state !== AttitudeState.STOPPED && self.state !== AttitudeState.ERROR) {
          if (useRaf) {
            self.animationHandle = self.canvas.requestAnimationFrame(render);
          } else {
            self.animationHandle = setTimeout(render, 33);
          }
        }
        
      } catch (error) {
        errorCount++;
        console.error('🚨 渲染循环错误 (' + errorCount + '/' + maxErrors + '):', error);
        
        if (errorCount < maxErrors) {
          // 继续尝试渲染
          if (useRaf) {
            self.animationHandle = self.canvas.requestAnimationFrame(render);
          } else {
            self.animationHandle = setTimeout(render, 100); // 延长间隔
          }
        } else {
          // 错误过多，停止渲染
          console.error('🚨 渲染循环错误过多，停止渲染');
          self.handleError('渲染循环失败: ' + error.message);
        }
      }
    }
    
    console.log('🎯 启动优化的渲染循环');
    render();
    
    // 🎯 添加看门狗机制，定期检查渲染状态（避免递归调用）
    if (!skipWatchdog) {
      self.startRenderWatchdog();
    }
  },
  
  // 🎯 新增：渲染看门狗机制
  startRenderWatchdog: function() {
    var self = this;
    
    // 🚨 防止重复启动看门狗定时器
    if (this.watchdogTimer) {
      console.log('⚠️  看门狗已存在，清除旧的定时器');
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    
    this.watchdogTimer = setInterval(function() {
      var now = Date.now();
      
      // 🔧 使用实际的渲染时间戳判断是否卡住（修复误判问题）
      if ((self.state === AttitudeState.ACTIVE || self.state === AttitudeState.SIMULATED) && 
          now - (self._lastRenderTick || 0) > 5000) {
        
        console.warn('🚨 检测到渲染停止，重启渲染循环');
        
        // 清除旧的动画句柄
        if (self.animationHandle) {
          clearTimeout(self.animationHandle);
          self.animationHandle = null;
        }
        
        // 🚨 重新启动渲染循环，但跳过看门狗以避免递归
        self.startRenderLoop(true);
      }
    }, 3000); // 每3秒检查一次
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
  
  // 🎯 增强型校准功能
  calibrate: function(callback) {
    var self = this;
    
    if (!this.sensorProcessor) {
      if (callback) callback({ success: false, reason: '传感器未初始化' });
      return;
    }
    
    // 校准过程需要10秒稳定数据
    var calibrationTime = 10;
    var countdown = calibrationTime;
    
    // 触发校准开始回调
    if (callback) callback({ 
      success: true, 
      phase: 'start', 
      countdown: countdown,
      message: '请保持设备静止，开始校准...'
    });
    
    // 倒计时校准过程
    var calibrationTimer = setInterval(function() {
      countdown--;
      
      // 更新进度
      if (callback) callback({
        success: true,
        phase: 'progress',
        countdown: countdown,
        progress: Math.round((1 - countdown / calibrationTime) * 100),
        message: '校准中，请保持静止 ' + countdown + 's'
      });
      
      if (countdown <= 0) {
        clearInterval(calibrationTimer);
        
        // 执行实际校准
        var result = self.sensorProcessor.calibrate();
        
        if (callback) {
          if (result.success) {
            callback({
              success: true,
              phase: 'complete',
              message: '校准成功！PITCH偏移: ' + result.pitchOffset + '°, ROLL偏移: ' + result.rollOffset + '°',
              data: result
            });
          } else {
            callback({
              success: false,
              phase: 'failed',
              reason: result.reason,
              message: '校准失败: ' + result.reason
            });
          }
        }
      }
    }, 1000);
  },
  
  // 重置校准
  resetCalibration: function() {
    if (this.sensorProcessor) {
      this.sensorProcessor.resetCalibration();
      wx.showToast({
        title: '校准已重置',
        icon: 'success',
        duration: 1500
      });
      return true;
    }
    return false;
  },
  
  // 获取校准状态
  getCalibrationStatus: function() {
    if (this.sensorProcessor) {
      return this.sensorProcessor.getCalibrationStatus();
    }
    return { isCalibrated: false };
  },
  
  // 🎯 快速校准 - 立即重置当前PITCH和ROLL为0
  quickCalibrate: function() {
    if (!this.sensorProcessor) {
      return { success: false, reason: '传感器未初始化' };
    }
    
    return this.sensorProcessor.quickCalibrate();
  },
  
  // 🎯 新增：强制刷新渲染 - 解决卡住问题
  forceRefresh: function() {
    console.log('🔄 强制刷新姿态仪渲染');
    
    try {
      // 清除旧的渲染循环
      if (this.animationHandle) {
        clearTimeout(this.animationHandle);
        this.animationHandle = null;
      }
      
      // 清除看门狗定时器
      if (this.watchdogTimer) {
        clearInterval(this.watchdogTimer);
        this.watchdogTimer = null;
      }
      
      // 重新启动渲染循环
      if (this.state === AttitudeState.ACTIVE || this.state === AttitudeState.SIMULATED) {
        this.startRenderLoop();
        return { success: true, message: '渲染循环已重启' };
      } else {
        return { success: false, message: '姿态仪未处于活动状态' };
      }
      
    } catch (error) {
      console.error('❌ 强制刷新失败:', error);
      return { success: false, message: '强制刷新失败: ' + error.message };
    }
  },
  
  // 获取状态信息
  getStatus: function() {
    return {
      state: this.state,
      data: this.currentData,
      performance: this.renderer ? this.renderer.getStats() : null
    };
  },
  
  // 🎯 优化停止函数 - 清理所有资源
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
    
    // 🎯 停止看门狗定时器
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    
    console.log('🎯 姿态仪完全停止，所有资源已清理');
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
    
    // 🎯 将姿态仪实例保存到页面对象中，供重置按钮使用
    if (currentPage) {
      currentPage.attitudeIndicator = indicator;
    }
    
    console.log('✈️ 姿态仪自动初始化完成');
    return indicator;
  }, 1500); // 延迟1.5秒确保页面完全加载
}

// 🎯 全局强制刷新函数 - 用于解决卡住问题
function forceRefreshGlobal() {
  try {
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    
    if (currentPage && currentPage.attitudeIndicator) {
      var result = currentPage.attitudeIndicator.forceRefresh();
      
      wx.showToast({
        title: result.success ? '已强制刷新' : '刷新失败',
        icon: result.success ? 'success' : 'error',
        duration: 2000
      });
      
      console.log('🔄 全局强制刷新结果:', result);
      return result;
    } else {
      console.warn('⚠️ 未找到姿态仪实例');
      return { success: false, message: '未找到姿态仪实例' };
    }
  } catch (error) {
    console.error('❌ 全局强制刷新失败:', error);
    return { success: false, message: '全局强制刷新失败: ' + error.message };
  }
}

// 🔧 兼容修复：在此前对 prototype 进行了整体覆盖赋值后，
// 早先定义在 prototype 上的工具方法会被覆盖掉。
// 这里重新挂载必要的方法，避免构造函数中调用 this.initCanvasQuality 报错。
AttitudeRenderer.prototype.initCanvasQuality = function() {
  var ctx = this.ctx;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = this.config.enableHighQuality ? 'high' : 'medium';
};

AttitudeRenderer.prototype.getCachedGradient = function(name, factory) {
  if (!this.cachedGradients[name]) {
    this.cachedGradients[name] = factory.call(this);
  }
  return this.cachedGradients[name];
};

module.exports = {
  create: create,
  AttitudeIndicatorV2: AttitudeIndicatorV2,
  AttitudeState: AttitudeState,
  autoInit: autoInit,
  forceRefreshGlobal: forceRefreshGlobal  // 🎯 暴露全局强制刷新函数
};