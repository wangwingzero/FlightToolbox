// 绕飞耗油计算页面

Page({
  data: {
    isDarkMode: false,
    detour: {
      distance: '',
      groundSpeed: '',
      fuelConsumption: '',
      fuelResult: '',
      timeResult: ''
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

  onDistanceChange(event: any) {
    this.setData({
      'detour.distance': event.detail
    });
  },

  onGroundSpeedChange(event: any) {
    this.setData({
      'detour.groundSpeed': event.detail
    });
  },

  onFuelConsumptionChange(event: any) {
    this.setData({
      'detour.fuelConsumption': event.detail
    });
  },

  calculateDetour() {
    const distance = parseFloat(this.data.detour.distance);
    const groundSpeed = parseFloat(this.data.detour.groundSpeed);
    const fuelConsumption = parseFloat(this.data.detour.fuelConsumption);

    if (isNaN(distance) || isNaN(groundSpeed) || isNaN(fuelConsumption)) {
      wx.showToast({
        title: '请输入有效的数值',
        icon: 'none'
      });
      return;
    }

    if (distance <= 0 || groundSpeed <= 0 || fuelConsumption <= 0) {
      wx.showToast({
        title: '所有数值必须大于0',
        icon: 'none'
      });
      return;
    }

    // 计算飞行时间（小时）
    const timeHours = distance / groundSpeed;
    const timeMinutes = timeHours * 60;

    // 计算燃油消耗
    const fuelResult = fuelConsumption * timeHours;

    this.setData({
      'detour.fuelResult': this.formatNumber(fuelResult),
      'detour.timeResult': this.formatNumber(timeMinutes)
    });

    wx.showToast({
      title: '绕飞耗油计算完成',
      icon: 'success'
    });
  },

  clearDetour() {
    this.setData({
      'detour.distance': '',
      'detour.groundSpeed': '',
      'detour.fuelConsumption': '',
      'detour.fuelResult': '',
      'detour.timeResult': ''
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