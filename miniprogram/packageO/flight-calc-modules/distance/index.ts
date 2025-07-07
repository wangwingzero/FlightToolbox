// 距离换算页面
Page({
  data: {
    isDarkMode: false,
    distanceValues: {
      meter: '',
      kilometer: '',
      nauticalMile: ''
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

  onDistanceInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    const newValues = { ...this.data.distanceValues };
    newValues[unit] = value;
    
    this.setData({
      distanceValues: newValues
    });
  },

  convertDistance() {
    wx.showToast({
      title: '距离换算功能开发中',
      icon: 'none'
    });
  },

  clearDistance() {
    this.setData({
      distanceValues: {
        meter: '',
        kilometer: '',
        nauticalMile: ''
      }
    });
    
    wx.showToast({
      title: '已清空数据',
      icon: 'success'
    });
  }
});