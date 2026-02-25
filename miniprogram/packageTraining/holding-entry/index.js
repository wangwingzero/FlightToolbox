var BasePage = require('../../utils/base-page.js');
var aviationMath = require('../utils/aviation-math.js');

var TYPE_LABELS = {
  direct: '直接进入（Direct）',
  teardrop: '偏置进入（Teardrop）',
  parallel: '平行进入（Parallel）'
};

var SECTOR_COLORS = {
  direct: '#3498db',
  teardrop: '#e67e22',
  parallel: '#9b59b6'
};

// 深色主题配色
var THEME = {
  bg: '#0d1b2a',
  bgOuter: '#1b2838',
  tick: 'rgba(255,255,255,0.5)',
  tickMajor: 'rgba(255,255,255,0.8)',
  text: '#fff',
  textDim: 'rgba(255,255,255,0.6)',
  pattern: '#00e676',
  patternDim: 'rgba(0,230,118,0.4)',
  fix: '#00e676',
  aircraft: '#ffd740',
  trail: '#ff6d00',
  boundary: 'rgba(255,255,255,0.25)'
};

Page(BasePage.createPage({
  data: {
    canvasSize: 300,
    aircraftHeading: 0,
    inboundCourse: 0,
    isRightTurn: true,
    answered: false,
    isCorrect: false,
    userAnswer: '',
    correctType: '',
    resultDetail: '',
    totalCount: 0,
    correctCount: 0,
    streak: 0,
    accuracy: 0,
    isAnimating: false,
    animationDone: false
  },

  _canvas: null,
  _ctx: null,
  _dpr: 1,
  _entryPath: [],
  _pathIndex: 0,
  _rafId: null,

  customOnLoad: function () {
    var self = this;
    var sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    var screenWidth = sysInfo.windowWidth || 375;
    var size = Math.min(Math.floor(screenWidth * 0.88), 340);
    this._dpr = sysInfo.pixelRatio || 2;

    this.setData({ canvasSize: size }, function () {
      self._initCanvas();
    });
  },

  customOnUnload: function () {
    this._stopAnimation();
    this._canvas = null;
    this._ctx = null;
  },

  _initCanvas: function () {
    var self = this;
    var retryCount = 0;

    var tryInit = function () {
      var query = wx.createSelectorQuery();
      query.select('#holdingCanvas').fields({ node: true, size: true }).exec(function (res) {
        if (res && res[0] && res[0].node) {
          var canvas = res[0].node;
          var dpr = self._dpr;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          var ctx = canvas.getContext('2d');
          ctx.scale(dpr, dpr);

          self._canvas = canvas;
          self._ctx = ctx;
          self.nextQuestion();
        } else {
          retryCount++;
          if (retryCount < 3) {
            setTimeout(tryInit, 200 * retryCount);
          }
        }
      });
    };

    setTimeout(tryInit, 100);
  },

  // ========== 出题 ==========

  generateQuestion: function () {
    var heading = Math.floor(Math.random() * 360);
    var inbound = Math.floor(Math.random() * 360);
    var isRight = Math.random() < 0.8;
    var result = aviationMath.holdingEntryType(heading, inbound, isRight);

    this.setData({
      aircraftHeading: heading,
      inboundCourse: inbound,
      isRightTurn: isRight,
      answered: false,
      isCorrect: false,
      userAnswer: '',
      correctType: result.type,
      resultDetail: ''
    });
  },

  nextQuestion: function () {
    this._stopAnimation();
    this._entryPath = [];
    this._pathIndex = 0;
    this.setData({ isAnimating: false, animationDone: false });
    this.generateQuestion();
    this._drawScene();
  },

  // ========== 答题 ==========

  onAnswer: function (e) {
    if (this.data.answered) return;
    var self = this;
    var userType = e.currentTarget.dataset.type;
    var acceptable = aviationMath.acceptableEntryTypes(
      this.data.aircraftHeading,
      this.data.inboundCourse,
      this.data.isRightTurn
    );
    var isCorrect = acceptable.indexOf(userType) !== -1;

    var total = this.data.totalCount + 1;
    var correct = this.data.correctCount + (isCorrect ? 1 : 0);
    var streak = isCorrect ? this.data.streak + 1 : 0;
    var accuracy = total > 0 ? Math.round(correct / total * 100) : 0;

    var detail = '正确答案：' + TYPE_LABELS[this.data.correctType];
    if (this.data.correctType !== userType && isCorrect) {
      detail = '边界区域，' + TYPE_LABELS[userType] + ' 也可接受';
    }

    this.setData({
      answered: true,
      isCorrect: isCorrect,
      userAnswer: userType,
      resultDetail: detail,
      totalCount: total,
      correctCount: correct,
      streak: streak,
      accuracy: accuracy
    }, function () {
      self._startAnimation();
    });
  },

  // ========== Canvas 绘制 ==========

  _drawScene: function () {
    var ctx = this._ctx;
    if (!ctx) return;

    var size = this.data.canvasSize;
    var cx = size / 2;
    var cy = size / 2;
    var R = size / 2 - 14;

    ctx.clearRect(0, 0, size, size);

    // 背景渐变圆
    this._drawBackground(ctx, cx, cy, R);
    // 罗盘刻度
    this._drawTicks(ctx, cx, cy, R);
    // 扇区
    this._drawSectors(ctx, cx, cy, R);
    // 扇区分界线
    this._drawBoundaryLines(ctx, cx, cy, R);
    // 等待航线（跑马场）
    this._drawHoldingPattern(ctx, cx, cy, R);

    // 动画轨迹 + 飞机
    if (this._entryPath.length > 0 && (this.data.isAnimating || this.data.animationDone)) {
      var idx = this.data.animationDone ? this._entryPath.length - 1 : this._pathIndex;
      this._drawTrail(ctx, this._entryPath, idx);
      var pt = this._entryPath[Math.min(idx, this._entryPath.length - 1)];
      this._drawPlane(ctx, pt.x, pt.y, pt.hdg, THEME.trail);
    } else {
      this._drawStaticPlane(ctx, cx, cy, R);
    }
  },

  _drawBackground: function (ctx, cx, cy, R) {
    // 外圈光晕
    var glow = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R + 6);
    glow.addColorStop(0, 'rgba(0,230,118,0)');
    glow.addColorStop(0.7, 'rgba(0,230,118,0.06)');
    glow.addColorStop(1, 'rgba(0,230,118,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R + 6, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // 主背景
    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, THEME.bg);
    grad.addColorStop(1, THEME.bgOuter);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 外圈边框
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  },

  _drawTicks: function (ctx, cx, cy, R) {
    var PI = Math.PI;
    for (var i = 0; i < 360; i += 5) {
      var angle = (i - 90) * PI / 180;
      var isMajor = i % 30 === 0;
      var isMid = i % 10 === 0;
      var outerR = R - 2;
      var innerR = isMajor ? R - 20 : (isMid ? R - 14 : R - 9);

      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
      ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
      ctx.strokeStyle = isMajor ? THEME.tickMajor : THEME.tick;
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();

      if (isMajor) {
        var textR = R - 28;
        var label;
        if (i === 0) label = 'N';
        else if (i === 90) label = 'E';
        else if (i === 180) label = 'S';
        else if (i === 270) label = 'W';
        else label = String(i / 10);

        ctx.save();
        ctx.translate(cx + textR * Math.cos(angle), cy + textR * Math.sin(angle));
        ctx.fillStyle = (i % 90 === 0) ? '#fff' : THEME.textDim;
        ctx.font = (i % 90 === 0 ? 'bold 13px' : '11px') + ' sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }
    }
  },

  _drawSectors: function (ctx, cx, cy, R) {
    var inbound = this.data.inboundCourse;
    var isRight = this.data.isRightTurn;
    var PI = Math.PI;
    var sectorR = R * 0.52;

    var sectors = [
      { start: 0, end: 110, type: 'direct' },
      { start: 110, end: 180, type: 'teardrop' },
      { start: 180, end: 290, type: 'parallel' },
      { start: 290, end: 360, type: 'direct' }
    ];

    for (var i = 0; i < sectors.length; i++) {
      var s = sectors[i];
      var startDeg, endDeg;
      if (isRight) {
        startDeg = inbound + s.start;
        endDeg = inbound + s.end;
      } else {
        startDeg = inbound - s.end;
        endDeg = inbound - s.start;
      }

      var startRad = (startDeg - 90) * PI / 180;
      var endRad = (endDeg - 90) * PI / 180;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, sectorR, startRad, endRad);
      ctx.closePath();
      ctx.fillStyle = SECTOR_COLORS[s.type] + '22';
      ctx.fill();

      // 扇区标签
      var midDeg = (startDeg + endDeg) / 2;
      var midRad = (midDeg - 90) * PI / 180;
      var labelR = sectorR * 0.55;
      var lx = cx + labelR * Math.cos(midRad);
      var ly = cy + labelR * Math.sin(midRad);

      ctx.save();
      ctx.fillStyle = SECTOR_COLORS[s.type] + 'cc';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var initial = s.type.charAt(0).toUpperCase();
      ctx.fillText(initial, lx, ly);
      ctx.restore();
    }
  },

  _drawBoundaryLines: function (ctx, cx, cy, R) {
    var inbound = this.data.inboundCourse;
    var isRight = this.data.isRightTurn;
    var PI = Math.PI;
    var lineR = R * 0.52;

    // 三条分界线角度（相对 inbound）：110°, 180°, 290°（= -70°）
    var angles = [110, 180, 290];
    for (var i = 0; i < angles.length; i++) {
      var deg = isRight ? inbound + angles[i] : inbound - angles[i];
      var rad = (deg - 90) * PI / 180;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + lineR * Math.cos(rad), cy + lineR * Math.sin(rad));
      ctx.strokeStyle = THEME.boundary;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // inbound course 线（贯穿整个罗盘）
    var ibRad = (inbound - 90) * PI / 180;
    var obRad = ibRad + PI;
    ctx.beginPath();
    ctx.moveTo(cx + R * 0.9 * Math.cos(obRad), cy + R * 0.9 * Math.sin(obRad));
    ctx.lineTo(cx + R * 0.9 * Math.cos(ibRad), cy + R * 0.9 * Math.sin(ibRad));
    ctx.strokeStyle = 'rgba(0,230,118,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  },

  _drawHoldingPattern: function (ctx, cx, cy, R) {
    var g = this._getGeometry();

    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = THEME.pattern;
    ctx.lineWidth = 2;

    var cw = g.isRight;
    var acw = !cw;

    ctx.moveTo(g.p1x, g.p1y);

    // fix 端转弯 p1 → p4
    var s1 = Math.atan2(g.p1y - g.ftCy, g.p1x - g.ftCx);
    var e1 = Math.atan2(g.p4y - g.ftCy, g.p4x - g.ftCx);
    ctx.arc(g.ftCx, g.ftCy, g.turnR, s1, e1, acw);

    // 出航 p4 → p3
    ctx.lineTo(g.p3x, g.p3y);

    // 远端转弯 p3 → p2
    var s2 = Math.atan2(g.p3y - g.frCy, g.p3x - g.frCx);
    var e2 = Math.atan2(g.p2y - g.frCy, g.p2x - g.frCx);
    ctx.arc(g.frCx, g.frCy, g.turnR, s2, e2, acw);

    // 入航 p2 → p1
    ctx.lineTo(g.p1x, g.p1y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Fix 点
    ctx.beginPath();
    ctx.arc(g.fixX, g.fixY, 5, 0, Math.PI * 2);
    ctx.fillStyle = THEME.fix;
    ctx.fill();

    // Fix 标签
    ctx.save();
    ctx.fillStyle = THEME.fix;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('FIX', g.fixX, g.fixY + 8);
    ctx.restore();

    // 入航方向箭头
    var midX = (g.p2x + g.p1x) / 2;
    var midY = (g.p2y + g.p1y) / 2;
    var aLen = 7;
    var ibRad = g.ibRad;
    ctx.beginPath();
    ctx.moveTo(midX + aLen * Math.cos(ibRad + 2.6), midY + aLen * Math.sin(ibRad + 2.6));
    ctx.lineTo(midX, midY);
    ctx.lineTo(midX + aLen * Math.cos(ibRad - 2.6), midY + aLen * Math.sin(ibRad - 2.6));
    ctx.strokeStyle = THEME.pattern;
    ctx.lineWidth = 2;
    ctx.stroke();
  },

  _drawStaticPlane: function (ctx, cx, cy, R) {
    var hdgRad = (this.data.aircraftHeading - 90) * Math.PI / 180;
    var acR = R * 0.75;
    var posAngle = hdgRad + Math.PI;
    var acX = cx + acR * Math.cos(posAngle);
    var acY = cy + acR * Math.sin(posAngle);

    // 航向线
    var lineLen = 28;
    ctx.beginPath();
    ctx.moveTo(acX, acY);
    ctx.lineTo(acX + lineLen * Math.cos(hdgRad), acY + lineLen * Math.sin(hdgRad));
    ctx.strokeStyle = THEME.aircraft;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    this._drawPlane(ctx, acX, acY, hdgRad, THEME.aircraft);
  },

  _drawPlane: function (ctx, x, y, hdgRad, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(hdgRad + Math.PI / 2);

    var s = 11;
    ctx.fillStyle = color;

    // 机身
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.5);
    ctx.lineTo(-s * 0.22, -s * 0.15);
    ctx.lineTo(-s * 0.18, s * 0.85);
    ctx.lineTo(0, s * 0.65);
    ctx.lineTo(s * 0.18, s * 0.85);
    ctx.lineTo(s * 0.22, -s * 0.15);
    ctx.closePath();
    ctx.fill();

    // 主翼
    ctx.beginPath();
    ctx.moveTo(-s * 1.15, s * 0.15);
    ctx.lineTo(-s * 0.18, -s * 0.25);
    ctx.lineTo(s * 0.18, -s * 0.25);
    ctx.lineTo(s * 1.15, s * 0.15);
    ctx.lineTo(s * 0.85, s * 0.28);
    ctx.lineTo(-s * 0.85, s * 0.28);
    ctx.closePath();
    ctx.fill();

    // 尾翼
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.7);
    ctx.lineTo(-s * 0.13, s * 0.5);
    ctx.lineTo(s * 0.13, s * 0.5);
    ctx.lineTo(s * 0.5, s * 0.7);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  // ========== 几何计算 ==========

  _getGeometry: function () {
    var size = this.data.canvasSize;
    var cx = size / 2;
    var cy = size / 2;
    var R = size / 2 - 14;
    var inbound = this.data.inboundCourse;
    var isRight = this.data.isRightTurn;
    var heading = this.data.aircraftHeading;
    var PI = Math.PI;

    var patternLen = R * 0.35;
    var turnR = R * 0.12;
    var ibRad = (inbound - 90) * PI / 180;
    var hdgRad = (heading - 90) * PI / 180;

    var fixX = cx + R * 0.15 * Math.cos(ibRad);
    var fixY = cy + R * 0.15 * Math.sin(ibRad);

    var outDir = ibRad + PI;
    var perpDir = isRight ? outDir - PI / 2 : outDir + PI / 2;

    var p1x = fixX, p1y = fixY;
    var p2x = fixX + patternLen * Math.cos(outDir);
    var p2y = fixY + patternLen * Math.sin(outDir);

    var offset = turnR * 2;
    var p3x = p2x + offset * Math.cos(perpDir);
    var p3y = p2y + offset * Math.sin(perpDir);
    var p4x = p1x + offset * Math.cos(perpDir);
    var p4y = p1y + offset * Math.sin(perpDir);

    var ftCx = (p1x + p4x) / 2;
    var ftCy = (p1y + p4y) / 2;
    var frCx = (p2x + p3x) / 2;
    var frCy = (p2y + p3y) / 2;

    var acR = R * 0.75;
    var posAngle = hdgRad + PI;
    var acX = cx + acR * Math.cos(posAngle);
    var acY = cy + acR * Math.sin(posAngle);

    return {
      patternLen: patternLen, turnR: turnR,
      ibRad: ibRad, hdgRad: hdgRad, perpDir: perpDir,
      fixX: fixX, fixY: fixY,
      p1x: p1x, p1y: p1y, p2x: p2x, p2y: p2y,
      p3x: p3x, p3y: p3y, p4x: p4x, p4y: p4y,
      ftCx: ftCx, ftCy: ftCy, frCx: frCx, frCy: frCy,
      acX: acX, acY: acY, isRight: isRight
    };
  },

  // ========== 动画 ==========

  _startAnimation: function () {
    var self = this;
    var path = this._buildEntryPath(this.data.correctType);
    if (!path || path.length === 0) return;

    this._entryPath = path;
    this._pathIndex = 0;
    this.setData({ isAnimating: true, animationDone: false });
    this._drawScene();

    // 优先使用 canvas.requestAnimationFrame，回退到 setInterval
    if (this._canvas && this._canvas.requestAnimationFrame) {
      var lastTime = 0;
      var step = function (ts) {
        if (!self.data.isAnimating) return;
        if (!lastTime) lastTime = ts;
        if (ts - lastTime >= 30) {
          lastTime = ts;
          self._pathIndex += 2;
          if (self._pathIndex >= self._entryPath.length) {
            self._pathIndex = self._entryPath.length - 1;
            self.setData({ isAnimating: false, animationDone: true });
            self._drawScene();
            return;
          }
          self._drawScene();
        }
        self._rafId = self._canvas.requestAnimationFrame(step);
      };
      self._rafId = self._canvas.requestAnimationFrame(step);
    } else {
      this._rafId = this.createSafeInterval(function () {
        self._pathIndex += 2;
        if (self._pathIndex >= self._entryPath.length) {
          self._pathIndex = self._entryPath.length - 1;
          self._stopAnimation();
          self.setData({ isAnimating: false, animationDone: true });
        }
        self._drawScene();
      }, 33, 'entry-anim');
    }
  },

  _stopAnimation: function () {
    if (this._rafId) {
      if (this._canvas && this._canvas.cancelAnimationFrame) {
        this._canvas.cancelAnimationFrame(this._rafId);
      } else {
        clearInterval(this._rafId);
      }
      this._rafId = null;
    }
  },

  skipAnimation: function () {
    if (!this.data.isAnimating) return;
    this._pathIndex = this._entryPath.length - 1;
    this._stopAnimation();
    this.setData({ isAnimating: false, animationDone: true });
    this._drawScene();
  },

  replayAnimation: function () {
    if (this.data.isAnimating) return;
    this._stopAnimation();
    this._pathIndex = 0;
    this._startAnimation();
  },

  // ========== 轨迹绘制 ==========

  _drawTrail: function (ctx, path, upTo) {
    if (!path || upTo < 1) return;

    // 渐变轨迹：前半段半透明，后半段实色
    var fadeStart = Math.max(0, upTo - 40);
    if (fadeStart > 0) {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (var j = 1; j <= fadeStart && j < path.length; j++) {
        ctx.lineTo(path[j].x, path[j].y);
      }
      ctx.strokeStyle = 'rgba(255,109,0,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(path[Math.max(0, fadeStart)].x, path[Math.max(0, fadeStart)].y);
    for (var i = Math.max(1, fadeStart + 1); i <= upTo && i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.strokeStyle = THEME.trail;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  },

  // ========== 路径生成 ==========

  _buildEntryPath: function (type) {
    var g = this._getGeometry();
    var path = [];
    var PI = Math.PI;

    // 飞机起始位置
    var startX = g.acX;
    var startY = g.acY;
    var startHdg = g.hdgRad;

    // 先飞向 fix
    this._appendStraight(path, startX, startY, startHdg, g.fixX, g.fixY, 60);

    if (type === 'direct') {
      path = path.concat(this._buildDirectPath(g));
    } else if (type === 'teardrop') {
      path = path.concat(this._buildTeardropPath(g));
    } else if (type === 'parallel') {
      path = path.concat(this._buildParallelPath(g));
    }

    return path;
  },

  _buildDirectPath: function (g) {
    var path = [];
    var PI = Math.PI;
    var turnDir = g.isRight ? 1 : -1;
    var outDir = g.ibRad + PI; // 出航方向

    // Direct进入：过fix后，向等待侧转弯（右等待右转，左等待左转）
    // 转到出航航向，即 inbound 反向
    var turnCx = g.fixX + g.turnR * Math.cos(g.perpDir);
    var turnCy = g.fixY + g.turnR * Math.sin(g.perpDir);
    var startAngle = Math.atan2(g.fixY - turnCy, g.fixX - turnCx);
    var turnAngle = PI; // 转180°到出航边
    var steps = 40;
    for (var i = 0; i <= steps; i++) {
      var a = startAngle + turnDir * turnAngle * i / steps;
      path.push({
        x: turnCx + g.turnR * Math.cos(a),
        y: turnCy + g.turnR * Math.sin(a),
        hdg: a + turnDir * PI / 2
      });
    }

    // 沿出航方向飞一段
    var last = path[path.length - 1];
    var outEndX = last.x + g.patternLen * 0.5 * Math.cos(outDir);
    var outEndY = last.y + g.patternLen * 0.5 * Math.sin(outDir);
    this._appendStraight(path, last.x, last.y, outDir, outEndX, outEndY, 25);

    return path;
  },

  _buildTeardropPath: function (g) {
    var path = [];
    var PI = Math.PI;
    var turnDir = g.isRight ? 1 : -1;
    var outDir = g.ibRad + PI;

    // 1. 从 fix 沿出航方向向等待侧偏 30° 飞出
    var tearAngle = outDir - turnDir * 30 * PI / 180;
    var tearLen = g.patternLen * 0.85;
    var tearEndX = g.fixX + tearLen * Math.cos(tearAngle);
    var tearEndY = g.fixY + tearLen * Math.sin(tearAngle);
    this._appendStraight(path, g.fixX, g.fixY, tearAngle, tearEndX, tearEndY, 35);

    // 2. 远端弧线转弯，与跑马场转弯方向一致
    //    照搬 parallel 的模式：圆心用 +dir*PI/2，角度用 +dir*sweep
    //    parallel 用 antiTurnDir(-turnDir)，teardrop 用 turnDir
    //    转 150°（= 180° - 30° 偏置角）
    var sweepAngle = PI * 150 / 180;
    var R2 = g.turnR;
    var turnCx = tearEndX + R2 * Math.cos(tearAngle + turnDir * PI / 2);
    var turnCy = tearEndY + R2 * Math.sin(tearAngle + turnDir * PI / 2);
    var aStart = Math.atan2(tearEndY - turnCy, tearEndX - turnCx);
    var steps2 = 45;
    for (var i = 1; i <= steps2; i++) {
      var a = aStart + turnDir * sweepAngle * i / steps2;
      path.push({
        x: turnCx + R2 * Math.cos(a),
        y: turnCy + R2 * Math.sin(a),
        hdg: a + turnDir * PI / 2
      });
    }

    // 3. 沿入航方向飞回 fix
    var last = path[path.length - 1];
    this._appendStraight(path, last.x, last.y, g.ibRad, g.fixX, g.fixY, 30);

    return path;
  },

  _buildParallelPath: function (g) {
    var path = [];
    var PI = Math.PI;
    var turnDir = g.isRight ? 1 : -1;
    var outDir = g.ibRad + PI; // 出航方向

    // Parallel进入：过fix后，沿出航方向飞出（在非等待侧，不转弯直接飞出航方向）
    var parLen = g.patternLen * 0.85;
    var parEndX = g.fixX + parLen * Math.cos(outDir);
    var parEndY = g.fixY + parLen * Math.sin(outDir);
    this._appendStraight(path, g.fixX, g.fixY, outDir, parEndX, parEndY, 35);

    // 在远端向非等待侧转弯（右等待时左转，左等待时右转）
    // 转过约 225°（超过180°）以截获入航航迹
    var antiTurnDir = -turnDir;
    var turnAngle3 = PI * 1.3;
    var turnCx3 = parEndX + g.turnR * 1.2 * Math.cos(outDir + antiTurnDir * PI / 2);
    var turnCy3 = parEndY + g.turnR * 1.2 * Math.sin(outDir + antiTurnDir * PI / 2);
    var startAngle3 = Math.atan2(parEndY - turnCy3, parEndX - turnCx3);
    var steps3 = 55;
    for (var i = 0; i <= steps3; i++) {
      var a = startAngle3 + antiTurnDir * turnAngle3 * i / steps3;
      path.push({
        x: turnCx3 + g.turnR * 1.2 * Math.cos(a),
        y: turnCy3 + g.turnR * 1.2 * Math.sin(a),
        hdg: a + antiTurnDir * PI / 2
      });
    }

    // 飞回 fix（沿入航方向）
    var last = path[path.length - 1];
    this._appendStraight(path, last.x, last.y, g.ibRad, g.fixX, g.fixY, 30);

    return path;
  },

  // ========== 工具方法 ==========

  _appendStraight: function (path, x1, y1, hdg, x2, y2, steps) {
    for (var i = 1; i <= steps; i++) {
      var t = i / steps;
      path.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
        hdg: hdg
      });
    }
  }

}));
