var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    showPanel: true,
    pitch: 0,
    roll: 0,
    simulating: false
  },

  customOnLoad: function() {
    // 初始化：不启动网络行为，完全离线
    console.log('🧪 预览页面已加载');
  },

  onTogglePanel: function(e) {
    var checked = !!(e && e.detail && e.detail.value);
    this.safeSetData({ showPanel: checked });
  },

  startSim: function() {
    var self = this;
    if (this.data.simulating) return;

    this.safeSetData({ simulating: true });

    var t = 0;
    this._simTimer = this.createSafeInterval(function() {
      t += 1;
      // 模拟俯仰/横滚（轻幅度），频率~12.5Hz
      var pitch = Math.round(10 * Math.sin(t / 10) * 10) / 10; // ±10°
      var roll  = Math.round(20 * Math.sin(t / 15) * 10) / 10; // ±20°

      self.safeSetData({
        pitch: pitch,
        roll: roll
      }, null, {
        throttleKey: 'previewMotion',
        priority: 'high'
      });

    }, 80, '预览-姿态模拟');
  },

  stopSim: function() {
    if (this._simTimer) {
      clearInterval(this._simTimer);
      this._simTimer = null;
    }
    this.safeSetData({ simulating: false });
  },

  onUnload: function() {
    this.stopSim();
  }
};

Page(BasePage.createPage(pageConfig));