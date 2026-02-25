var BasePage = require('../../utils/base-page.js');
var aviationMath = require('../utils/aviation-math.js');

// 物理常量
var CDI_FULL_SCALE_DEG = 10; // CDI 满偏对应 10° 偏移
var CDI_DOTS_TOTAL = 5;      // 满偏 5 dots
var UPDATE_INTERVAL = 33;    // ~30fps
var DISTANCE_NM = 15;        // 假设距 VOR 台 15nm

Page(BasePage.createPage({
  data: {
    canvasSize: 280,
    obsSetting: 0,
    currentHeading: 0,
    windDir: 0,
    windSpd: 0,
    cdiDots: 0,
    cdiDotsDisplay: '0.0',
    toFrom: 'TO',
    duration: 30,
    remainingTime: 30,
    timerPercent: 100,
    gameState: 'idle', // idle | playing | finished
    // 结果
    avgDeviation: '0.0',
    maxDeviation: '0.0',
    centeredPercent: 0,
    grade: 'practice',
    gradeText: '需要练习'
  },

  // 内部状态（不放 data）
  _canvas: null,
  _ctx: null,
  _dpr: 1,
  _animTimer: null,
  _gameTimer: null,
  _trackAngle: 0,       // 飞机实际航迹（含风偏）
  _angularOffset: 0,    // 当前角度偏移（度）
  _deviationSamples: null,
  _centeredSamples: 0,
  _totalSamples: 0,
  _maxDev: 0,

  customOnLoad: function () {
    var self = this;
    var sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    var screenWidth = sysInfo.windowWidth || 375;
    var size = Math.min(Math.floor(screenWidth * 0.75), 300);
    this._dpr = sysInfo.pixelRatio || 2;

    this.setData({ canvasSize: size }, function () {
      self.initCanvas();
    });
  },

  customOnUnload: function () {
    this.stopGame();
    this._canvas = null;
    this._ctx = null;
  },

  initCanvas: function () {
    var self = this;
    var retryCount = 0;
    var maxRetries = 3;

    var tryInit = function () {
      var query = wx.createSelectorQuery();
      query.select('#vorCanvas').fields({ node: true, size: true }).exec(function (res) {
        if (res && res[0] && res[0].node) {
          var canvas = res[0].node;
          var dpr = self._dpr;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          var ctx = canvas.getContext('2d');
          ctx.scale(dpr, dpr);

          self._canvas = canvas;
          self._ctx = ctx;

          // 绘制初始静态仪表
          self.drawHSI();
        } else {
          retryCount++;
          if (retryCount < maxRetries) {
            setTimeout(tryInit, 200 * retryCount);
          } else {
            console.error('VOR Canvas 初始化失败');
          }
        }
      });
    };

    setTimeout(tryInit, 100);
  },

  // ========== 游戏控制 ==========

  setDuration: function (e) {
    var dur = parseInt(e.currentTarget.dataset.dur, 10);
    this.setData({ duration: dur, remainingTime: dur });
  },

  startGame: function () {
    var self = this;

    // 随机生成场景
    var obs = Math.floor(Math.random() * 36) * 10; // 10° 步进
    var windDir = Math.floor(Math.random() * 360);
    var windSpd = 10 + Math.floor(Math.random() * 25); // 10-34kt
    // 初始航向 = OBS ± 随机偏差
    var hdgOffset = Math.floor(Math.random() * 21) - 10; // -10 ~ +10
    var heading = aviationMath.normalizeHeading(obs + hdgOffset);
    // 初始角度偏移（CDI 偏移）
    var initOffset = (Math.random() * 6) - 3; // -3° ~ +3°

    this._angularOffset = initOffset;
    this._deviationSamples = [];
    this._centeredSamples = 0;
    this._totalSamples = 0;
    this._maxDev = 0;

    var dur = this.data.duration;

    this.setData({
      obsSetting: obs,
      currentHeading: Math.round(heading),
      windDir: windDir,
      windSpd: windSpd,
      cdiDots: 0,
      cdiDotsDisplay: '0.0',
      toFrom: 'TO',
      remainingTime: dur,
      timerPercent: 100,
      gameState: 'playing'
    });

    // 启动物理更新循环
    this._animTimer = this.createSafeInterval(function () {
      self.updatePhysics();
      self.drawHSI();
    }, UPDATE_INTERVAL, 'VOR物理更新');

    // 启动倒计时
    this._gameTimer = this.createSafeInterval(function () {
      var remaining = self.data.remainingTime - 1;
      if (remaining <= 0) {
        self.endGame();
        return;
      }
      self.setData({
        remainingTime: remaining,
        timerPercent: Math.round(remaining / dur * 100)
      });
    }, 1000, 'VOR倒计时');
  },

  stopGame: function () {
    if (this._animTimer) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
    if (this._gameTimer) {
      clearInterval(this._gameTimer);
      this._gameTimer = null;
    }
  },

  endGame: function () {
    this.stopGame();

    var samples = this._deviationSamples || [];
    var total = this._totalSamples || 1;
    var sum = 0;
    for (var i = 0; i < samples.length; i++) {
      sum += Math.abs(samples[i]);
    }
    var avg = samples.length > 0 ? sum / samples.length : 0;
    var maxDev = this._maxDev || 0;
    var centeredPct = total > 0 ? Math.round(this._centeredSamples / total * 100) : 0;

    var grade, gradeText;
    if (avg <= 0.8 && centeredPct >= 70) {
      grade = 'excellent';
      gradeText = '优秀';
    } else if (avg <= 1.5 && centeredPct >= 50) {
      grade = 'good';
      gradeText = '良好';
    } else {
      grade = 'practice';
      gradeText = '需要练习';
    }

    this.setData({
      gameState: 'finished',
      remainingTime: 0,
      timerPercent: 0,
      avgDeviation: avg.toFixed(1),
      maxDeviation: maxDev.toFixed(1),
      centeredPercent: centeredPct,
      grade: grade,
      gradeText: gradeText
    });
  },

  // ========== 航向调整 ==========

  adjustHeading: function (e) {
    if (this.data.gameState !== 'playing') return;
    var delta = parseInt(e.currentTarget.dataset.delta, 10);
    var newHdg = aviationMath.normalizeHeading(this.data.currentHeading + delta);
    this.setData({ currentHeading: Math.round(newHdg) });
  },

  // ========== 物理模型 ==========

  updatePhysics: function () {
    var heading = this.data.currentHeading;
    var obs = this.data.obsSetting;
    var windDir = this.data.windDir;
    var windSpd = this.data.windSpd;

    // 计算风偏
    var wind = aviationMath.windComponents(windDir, windSpd, heading);
    // 实际航迹 = 航向 - 偏流角（偏流角为正表示右偏，航迹偏右）
    var track = aviationMath.normalizeHeading(heading - wind.driftAngle);
    this._trackAngle = track;

    // 航迹与 OBS 的角度差 → CDI 偏移变化率
    var trackError = aviationMath.headingDiff(obs, track);
    // trackError > 0 表示航迹在 OBS 右侧 → 飞机向右偏离 → CDI 向右偏
    // 偏移变化率（度/秒）取决于角度差和距离
    var dt = UPDATE_INTERVAL / 1000;
    // 简化模型：每秒偏移变化 ≈ sin(trackError) * groundSpeed / distance
    // 假设地速 ~240kt，距离 15nm
    var changeRate = Math.sin(trackError * Math.PI / 180) * 240 / (DISTANCE_NM * 3600);
    // changeRate 单位：度/帧时间
    this._angularOffset += changeRate * dt * 3600; // 转换为度

    // 限制最大偏移
    if (this._angularOffset > CDI_FULL_SCALE_DEG * 1.5) {
      this._angularOffset = CDI_FULL_SCALE_DEG * 1.5;
    }
    if (this._angularOffset < -CDI_FULL_SCALE_DEG * 1.5) {
      this._angularOffset = -CDI_FULL_SCALE_DEG * 1.5;
    }

    // CDI dots
    var dots = this._angularOffset / CDI_FULL_SCALE_DEG * CDI_DOTS_TOTAL;
    var absDots = Math.abs(dots);

    // 采样统计
    this._totalSamples++;
    this._deviationSamples.push(dots);
    if (absDots <= 1) {
      this._centeredSamples++;
    }
    if (absDots > this._maxDev) {
      this._maxDev = absDots;
    }

    this.setData({
      cdiDots: dots,
      cdiDotsDisplay: (dots >= 0 ? '+' : '') + dots.toFixed(1)
    });
  },

  // ========== Canvas 绘制 ==========

  drawHSI: function () {
    var ctx = this._ctx;
    if (!ctx) return;

    var size = this.data.canvasSize;
    var cx = size / 2;
    var cy = size / 2;
    var radius = size / 2 - 12;

    ctx.clearRect(0, 0, size, size);

    // 背景
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();

    // 罗盘盘面（以当前航向旋转）
    this.drawRotatingCompass(ctx, cx, cy, radius);

    // CDI 指针（固定在中心）
    this.drawCDI(ctx, cx, cy, radius);

    // 风向指示
    this.drawWindIndicator(ctx, cx, cy, radius);

    // 固定的飞机符号（顶部）
    this.drawFixedAircraft(ctx, cx, cy);
  },

  drawRotatingCompass: function (ctx, cx, cy, radius) {
    var heading = this.data.currentHeading;
    var obs = this.data.obsSetting;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-heading * Math.PI / 180);

    // 刻度
    for (var i = 0; i < 360; i += 5) {
      var angle = (i - 90) * Math.PI / 180;
      var isMajor = i % 30 === 0;
      var isMid = i % 10 === 0;
      var innerR = isMajor ? radius - 18 : (isMid ? radius - 12 : radius - 8);

      ctx.beginPath();
      ctx.moveTo(innerR * Math.cos(angle), innerR * Math.sin(angle));
      ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();

      if (isMajor) {
        var textR = radius - 26;
        var label = i === 0 ? 'N' : (i === 90 ? 'E' : (i === 180 ? 'S' : (i === 270 ? 'W' : String(i / 10))));
        ctx.save();
        ctx.translate(textR * Math.cos(angle), textR * Math.sin(angle));
        ctx.rotate(heading * Math.PI / 180); // 反旋转使文字正向
        ctx.fillStyle = '#fff';
        ctx.font = (i % 90 === 0 ? 'bold 12px' : '10px') + ' sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }
    }

    // OBS 径向线
    var obsAngle = (obs - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo((radius - 35) * Math.cos(obsAngle), (radius - 35) * Math.sin(obsAngle));
    ctx.lineTo((radius - 5) * Math.cos(obsAngle), (radius - 5) * Math.sin(obsAngle));
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.stroke();

    // OBS 反向
    var obsOpp = obsAngle + Math.PI;
    ctx.beginPath();
    ctx.moveTo((radius - 35) * Math.cos(obsOpp), (radius - 35) * Math.sin(obsOpp));
    ctx.lineTo((radius - 5) * Math.cos(obsOpp), (radius - 5) * Math.sin(obsOpp));
    ctx.strokeStyle = 'rgba(0,255,136,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  },

  drawCDI: function (ctx, cx, cy, radius) {
    var dots = this.data.cdiDots;
    var obs = this.data.obsSetting;
    var heading = this.data.currentHeading;

    // CDI 在仪表中心，沿 OBS 方向
    var obsRelative = (obs - heading) * Math.PI / 180;
    var perpAngle = obsRelative + Math.PI / 2;

    // dots 刻度标记
    var dotSpacing = radius * 0.1;
    ctx.save();
    ctx.translate(cx, cy);

    // 画 dot 刻度圆点（-5 到 +5）
    for (var d = -CDI_DOTS_TOTAL; d <= CDI_DOTS_TOTAL; d++) {
      if (d === 0) continue;
      var dx = d * dotSpacing * Math.cos(perpAngle);
      var dy = d * dotSpacing * Math.sin(perpAngle);
      ctx.beginPath();
      ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
    }

    // 中心圆环
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // CDI 偏移指针
    var clampedDots = Math.max(-CDI_DOTS_TOTAL, Math.min(CDI_DOTS_TOTAL, dots));
    var needleOffset = clampedDots * dotSpacing;
    var nx = needleOffset * Math.cos(perpAngle);
    var ny = needleOffset * Math.sin(perpAngle);

    // 指针线（沿 OBS 方向）
    var needleHalfLen = radius * 0.35;
    var dirX = Math.cos(obsRelative - Math.PI / 2);
    var dirY = Math.sin(obsRelative - Math.PI / 2);

    ctx.beginPath();
    ctx.moveTo(nx - needleHalfLen * dirX, ny - needleHalfLen * dirY);
    ctx.lineTo(nx + needleHalfLen * dirX, ny + needleHalfLen * dirY);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.stroke();

    // TO/FROM 三角形
    var toFromY = -radius * 0.2;
    ctx.save();
    ctx.rotate(obsRelative - Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, toFromY - 6);
    ctx.lineTo(-5, toFromY + 4);
    ctx.lineTo(5, toFromY + 4);
    ctx.closePath();
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    ctx.restore();

    ctx.restore();
  },

  drawWindIndicator: function (ctx, cx, cy, radius) {
    if (this.data.gameState !== 'playing') return;

    var windDir = this.data.windDir;
    var heading = this.data.currentHeading;
    // 风向相对于飞机航向
    var relWind = (windDir - heading - 90) * Math.PI / 180;
    var arrowR = radius * 0.88;
    var ax = cx + arrowR * Math.cos(relWind);
    var ay = cy + arrowR * Math.sin(relWind);

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(relWind + Math.PI / 2);

    // 风箭头
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-4, 4);
    ctx.lineTo(0, 2);
    ctx.lineTo(4, 4);
    ctx.closePath();
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();

    ctx.restore();
  },

  drawFixedAircraft: function (ctx, cx, cy) {
    // 固定在顶部的飞机符号（航向参考）
    var topY = cy - this.data.canvasSize / 2 + 22;

    ctx.save();
    ctx.translate(cx, topY);

    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-6, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fillStyle = '#ffcc00';
    ctx.fill();

    ctx.restore();
  }
}));
