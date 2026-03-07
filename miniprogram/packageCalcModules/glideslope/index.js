// 五边高度计算页面 - ES5版本

Page({
  data: {
    glideslope: {
      angle: '3.0',
      distance: '',
      elevation: '0',
      thresholdHeight: '50',
      aglAltitude: '',
      qnhAltitude: '',
      papiLights: null  // PAPI灯显示状态
    }
  },

  onLoad: function() {
    // 直接初始化页面，无需积分验证
  },

  onShow: function() {
    // 页面显示时的处理逻辑
  },

  onAngleChange: function(event) {
    this.setData({
      'glideslope.angle': event.detail
    });
  },

  onDistanceChange: function(event) {
    this.setData({
      'glideslope.distance': event.detail
    });
  },

  onElevationChange: function(event) {
    this.setData({
      'glideslope.elevation': event.detail
    });
  },

  onThresholdHeightChange: function(event) {
    this.setData({
      'glideslope.thresholdHeight': event.detail
    });
  },

  calculateGlideslope: function() {
    var angle = parseFloat(this.data.glideslope.angle);
    var distance = parseFloat(this.data.glideslope.distance);
    var elevation = parseFloat(this.data.glideslope.elevation);
    var thresholdHeight = parseFloat(this.data.glideslope.thresholdHeight);

    if (isNaN(angle) || isNaN(distance) || isNaN(elevation) || isNaN(thresholdHeight)) {
      wx.showToast({
        title: '请输入有效的数值',
        icon: 'none'
      });
      return;
    }

    if (angle <= 0 || angle >= 90) {
      wx.showToast({
        title: '下滑角必须在0到90度之间',
        icon: 'none'
      });
      return;
    }

    if (distance <= 0) {
      wx.showToast({
        title: '距离必须大于0',
        icon: 'none'
      });
      return;
    }

    // 计算下滑线在距离跑道头某距离处的高度（不含跑道入口高度）
    var angleRad = angle * Math.PI / 180;
    var heightAtDistance = distance * 6076.12 * Math.tan(angleRad); // 海里转换为英尺

    // 加上飞越跑道入口高度，得到真正的五边高度（AGL高度）
    var aglAltitude = heightAtDistance + thresholdHeight;

    // 计算QNH高度（修正海平面气压高度）
    var qnhAltitude = aglAltitude + elevation;

    // 计算PAPI灯显示
    var papiLights = this.calculatePAPILights(angle);

    this.setData({
      'glideslope.aglAltitude': this.formatNumber(aglAltitude),
      'glideslope.qnhAltitude': this.formatNumber(qnhAltitude),
      'glideslope.papiLights': papiLights
    }, function() {
      // 数据更新完成后，滚动到结果区域
      wx.pageScrollTo({
        selector: '#result-section',
        duration: 300,
        offsetTop: -20
      });
    });

    wx.showToast({
      title: '五边高度计算完成',
      icon: 'success'
    });
  },

  clearGlideslope: function() {
    this.setData({
      'glideslope.angle': '3.0',
      'glideslope.distance': '',
      'glideslope.elevation': '0',
      'glideslope.thresholdHeight': '50',
      'glideslope.aglAltitude': '',
      'glideslope.qnhAltitude': '',
      'glideslope.papiLights': null
    });
    wx.showToast({
      title: '数据已清空',
      icon: 'success'
    });
  },

  formatNumber: function(num) {
    return Math.round(num * 100) / 100 + '';
  },

  /**
   * 根据下滑角计算PAPI灯显示
   * @param {number} angle - 下滑角（度）
   * @returns {object} - PAPI灯状态 { red: 红灯数量, white: 白灯数量, description: 描述 }
   */
  calculatePAPILights: function(angle) {
    var papi = {
      red: 0,
      white: 0,
      description: '',
      status: '' // 'too-low', 'low', 'normal', 'high', 'too-high'
    };

    if (angle < 2.5) {
      papi.red = 4;
      papi.white = 0;
      papi.description = '过低';
      papi.status = 'too-low';
    } else if (angle >= 2.5 && angle < 2.75) {
      papi.red = 3;
      papi.white = 1;
      papi.description = '偏低';
      papi.status = 'low';
    } else if (angle >= 2.75 && angle <= 3.25) {
      papi.red = 2;
      papi.white = 2;
      papi.description = '正常';
      papi.status = 'normal';
    } else if (angle > 3.25 && angle <= 3.5) {
      papi.red = 1;
      papi.white = 3;
      papi.description = '偏高';
      papi.status = 'high';
    } else {
      papi.red = 0;
      papi.white = 4;
      papi.description = '过高';
      papi.status = 'too-high';
    }

    return papi;
  }
});