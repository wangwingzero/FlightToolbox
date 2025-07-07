// 下滑线高度计算页面

Page({
  data: {
    isDarkMode: false,
    glideslope: {
      angle: '3.0',
      distance: '',
      elevation: '0',
      altitude: '',
      absoluteAltitude: ''
    }
  },

  onLoad() {
    const app = getApp<any>();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    });
  },

  onShow() {
    const app = getApp<any>();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    });
  },

  onAngleChange(event: any) {
    this.setData({
      'glideslope.angle': event.detail
    });
  },

  onDistanceChange(event: any) {
    this.setData({
      'glideslope.distance': event.detail
    });
  },

  onElevationChange(event: any) {
    this.setData({
      'glideslope.elevation': event.detail
    });
  },

  calculateGlideslope() {
    const angle = parseFloat(this.data.glideslope.angle);
    const distance = parseFloat(this.data.glideslope.distance);
    const elevation = parseFloat(this.data.glideslope.elevation);

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

    // 计算下滑线高度
    const angleRad = angle * Math.PI / 180;
    const altitude = distance * 6076.12 * Math.tan(angleRad); // 海里转换为英尺

    // 计算绝对高度
    const absoluteAltitude = altitude + elevation;

    this.setData({
      'glideslope.altitude': this.formatNumber(altitude),
      'glideslope.absoluteAltitude': this.formatNumber(absoluteAltitude)
    });

    wx.showToast({
      title: '下滑线高度计算完成',
      icon: 'success'
    });
  },

  clearGlideslope() {
    this.setData({
      'glideslope.angle': '3.0',
      'glideslope.distance': '',
      'glideslope.elevation': '0',
      'glideslope.altitude': '',
      'glideslope.absoluteAltitude': ''
    });
    wx.showToast({
      title: '数据已清空',
      icon: 'success'
    });
  },

  formatNumber(num: number): string {
    return Math.round(num * 100) / 100 + '';
  }
});