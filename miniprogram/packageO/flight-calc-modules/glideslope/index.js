// 下滑线高度计算页面 - ES5版本

Page({
  data: {
    glideslope: {
      angle: '3.0',
      distance: '',
      elevation: '0',
      aglAltitude: '',
      qnhAltitude: ''
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

  calculateGlideslope: function() {
    var angle = parseFloat(this.data.glideslope.angle);
    var distance = parseFloat(this.data.glideslope.distance);
    var elevation = parseFloat(this.data.glideslope.elevation);

    if (isNaN(angle) || isNaN(distance) || isNaN(elevation)) {
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

    // 计算AGL高度（下滑线高度，相对于地面）
    var angleRad = angle * Math.PI / 180;
    var aglAltitude = distance * 6076.12 * Math.tan(angleRad); // 海里转换为英尺

    // 计算QNH高度（修正海平面气压高度）
    var qnhAltitude = aglAltitude + elevation;

    this.setData({
      'glideslope.aglAltitude': this.formatNumber(aglAltitude),
      'glideslope.qnhAltitude': this.formatNumber(qnhAltitude)
    });

    wx.showToast({
      title: '下滑线高度计算完成',
      icon: 'success'
    });
  },

  clearGlideslope: function() {
    this.setData({
      'glideslope.angle': '3.0',
      'glideslope.distance': '',
      'glideslope.elevation': '0',
      'glideslope.aglAltitude': '',
      'glideslope.qnhAltitude': ''
    });
    wx.showToast({
      title: '数据已清空',
      icon: 'success'
    });
  },

  formatNumber: function(num) {
    return Math.round(num * 100) / 100 + '';
  }
});