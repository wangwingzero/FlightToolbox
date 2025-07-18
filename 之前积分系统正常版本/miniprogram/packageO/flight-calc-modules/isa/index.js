// ISA温度计算页面
Page({
  data: {
    isDarkMode: false,
    isaAltitude: '',
    isaOAT: '',
    isaStandardTemp: '',
    isaDeviation: ''
  },

  onLoad: function() {
    var app = getApp();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    });
  },

  onShow: function() {
    var app = getApp();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    });
  },

  // 高度输入变化处理
  onISAAltitudeChange: function(event) {
    var value = event.detail || '';
    this.setData({
      isaAltitude: value
    });
  },

  // 外界温度输入变化处理
  onISAOATChange: function(event) {
    var value = event.detail || '';
    this.setData({
      isaOAT: value
    });
  },

  // ISA温度计算
  calculateISA: function() {
    var altitude = parseFloat(this.data.isaAltitude);
    var oat = parseFloat(this.data.isaOAT);
    
    if (isNaN(altitude)) {
      wx.showToast({
        title: '请输入有效的高度值',
        icon: 'none'
      });
      return;
    }
    
    if (isNaN(oat)) {
      wx.showToast({
        title: '请输入有效的温度值',
        icon: 'none'
      });
      return;
    }
    
    // 高度范围检查
    if (altitude < 0) {
      wx.showToast({
        title: '高度不能为负数',
        icon: 'none'
      });
      return;
    }
    
    if (altitude > 65617) {
      wx.showToast({
        title: '高度超出ISA标准范围(最大65617英尺)',
        icon: 'none',
        duration: 3000
      });
      return;
    }
    
    var isaStandardTemp = this.calculateISATemperature(altitude);
    var deviation = oat - isaStandardTemp;
    
    this.setData({
      isaStandardTemp: this.formatNumber(isaStandardTemp),
      isaDeviation: this.formatNumber(deviation)
    });
    
    wx.showToast({
      title: 'ISA温度计算完成',
      icon: 'success'
    });
  },
  
  // 计算ISA标准温度（分层计算）
  calculateISATemperature: function(altitudeFt) {
    // ISA标准大气分层计算
    if (altitudeFt <= 36089) {
      // 对流层：15°C - 1.98°C/1000ft
      return 15 - (altitudeFt * 1.98 / 1000);
    } else if (altitudeFt <= 65617) {
      // 平流层下层：恒温-56.5°C
      return -56.5;
    } else {
      // 超出范围
      return null;
    }
  },

  // 清空ISA数据
  clearISA: function() {
    this.setData({
      isaAltitude: '',
      isaOAT: '',
      isaStandardTemp: '',
      isaDeviation: ''
    });
    
    wx.showToast({
      title: '已清空ISA数据',
      icon: 'success'
    });
  },

  // 格式化数字
  formatNumber: function(num) {
    return (Math.round(num * 100) / 100).toString();
  }
});