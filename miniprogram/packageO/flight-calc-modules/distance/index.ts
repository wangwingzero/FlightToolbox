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
    const { meter, kilometer, nauticalMile } = this.data.distanceValues;
    
    // 检查是否有输入值
    const inputValues = [meter, kilometer, nauticalMile].filter(val => val && val.trim() !== '');
    if (inputValues.length === 0) {
      wx.showToast({
        title: '请输入至少一个距离值',
        icon: 'none'
      });
      return;
    }
    
    let sourceValue = 0;
    let sourceUnit = '';
    
    // 确定输入源和值
    if (meter && meter.trim() !== '') {
      sourceValue = parseFloat(meter);
      sourceUnit = 'meter';
    } else if (kilometer && kilometer.trim() !== '') {
      sourceValue = parseFloat(kilometer);
      sourceUnit = 'kilometer';
    } else if (nauticalMile && nauticalMile.trim() !== '') {
      sourceValue = parseFloat(nauticalMile);
      sourceUnit = 'nauticalMile';
    }
    
    if (isNaN(sourceValue) || sourceValue < 0) {
      wx.showToast({
        title: '请输入有效的正数',
        icon: 'none'
      });
      return;
    }
    
    // 执行换算
    this.performDistanceConversion(sourceValue, sourceUnit);
  },
  
  performDistanceConversion(value: number, sourceUnit: string) {
    let meterValue = 0;
    
    // 先转换为米（基准单位）
    switch (sourceUnit) {
      case 'meter':
        meterValue = value;
        break;
      case 'kilometer':
        meterValue = value * 1000;
        break;
      case 'nauticalMile':
        meterValue = value * 1852; // 1海里 = 1852米
        break;
    }
    
    // 从米转换为其他单位
    const newValues = {
      meter: this.formatNumber(meterValue),
      kilometer: this.formatNumber(meterValue / 1000),
      nauticalMile: this.formatNumber(meterValue / 1852)
    };
    
    this.setData({
      distanceValues: newValues
    });
    
    wx.showToast({
      title: '换算完成',
      icon: 'success'
    });
  },
  
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return num.toExponential(3);
    } else if (num >= 100) {
      return num.toFixed(0);
    } else if (num >= 1) {
      return num.toFixed(2);
    } else {
      return num.toFixed(4);
    }
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