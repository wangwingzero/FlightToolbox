var BasePage = require('../miniprogram/utils/base-page.js');

// 简化的模拟姿态数据发生器（离线可用）
function createSimulator() {
  let t = 0;
  return {
    next() {
      t += 0.06;
      // 平滑的正弦模拟
      const pitch = Math.round(Math.sin(t) * 10 * 10) / 10;   // ±10°
      const roll = Math.round(Math.cos(t * 0.9) * 20 * 10) / 10;  // ±20°
      const heading = (Math.round((t * 15) % 360 * 10) / 10 + 360) % 360;
      return { pitch, roll, heading };
    }
  };
}

var pageConfig = {
  data: {
    attitudeData: { pitch: 0, roll: 0, heading: 0 },
    testMode: 'simulate',
    showDebug: true,
    verboseLogging: false,
    sensorStatus: '未启动',
    renderFPS: 0,
    dataFreq: 0,
    calibrationStatus: '未校准',
    memoryUsage: 28,
    renderPerformance: 64,
    errorLog: []
  },

  customOnLoad: function() {
    this.sim = createSimulator();
    this.startRender();
  },

  // 渲染循环（离线可用）
  startRender: function() {
    const self = this;
    self._frameCount = 0;
    self._lastTime = Date.now();
    function loop() {
      if (!self._rendering) return;
      const data = self.sim.next();
      self.setData({ attitudeData: data });
      self._frameCount++;
      const now = Date.now();
      if (now - self._lastTime >= 1000) {
        self.setData({ renderFPS: self._frameCount });
        self._frameCount = 0;
        self._lastTime = now;
      }
      wx.nextTick(() => wx.createSelectorQuery().select('#attitudeCanvas').node());
      self._rafId = self._timer = setTimeout(loop, 33); // ~30fps
    }
    self._rendering = true;
    loop();
  },

  stopRender: function() {
    this._rendering = false;
    if (this._timer) clearTimeout(this._timer);
  },

  // 交互
  startSensor: function() {
    this.setData({ sensorStatus: '运行中' });
  },
  stopSensor: function() {
    this.setData({ sensorStatus: '已停止' });
  },
  calibrateSensor: function() {
    this.setData({ calibrationStatus: '已校准' });
  },
  switchMode: function(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ testMode: mode });
  },
  toggleVerboseLogging: function(e) {
    this.setData({ verboseLogging: e.detail.value });
  }
};

Page(BasePage.createPage(pageConfig));