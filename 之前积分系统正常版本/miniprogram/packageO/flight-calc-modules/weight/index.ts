// 重量换算页面
Page({
  data: {
    isDarkMode: false,
    weightValues: {
      gram: '',
      kilogram: '',
      pound: ''
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

  // 重量输入事件处理
  onWeightInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    const newValues = { ...this.data.weightValues };
    newValues[unit] = value;
    
    this.setData({
      weightValues: newValues
    });
  },

  // 重量换算
  convertWeight() {
    const { gram, kilogram, pound } = this.data.weightValues;
    
    // 检查是否有输入值
    const inputValues = [gram, kilogram, pound].filter(val => val && val.trim() !== '');
    if (inputValues.length === 0) {
      wx.showToast({
        title: '请输入至少一个重量值',
        icon: 'none'
      });
      return;
    }
    
    let sourceValue = 0;
    let sourceUnit = '';
    
    // 确定输入源和值
    if (gram && gram.trim() !== '') {
      sourceValue = parseFloat(gram);
      sourceUnit = 'gram';
    } else if (kilogram && kilogram.trim() !== '') {
      sourceValue = parseFloat(kilogram);
      sourceUnit = 'kilogram';
    } else if (pound && pound.trim() !== '') {
      sourceValue = parseFloat(pound);
      sourceUnit = 'pound';
    }
    
    if (isNaN(sourceValue) || sourceValue < 0) {
      wx.showToast({
        title: '请输入有效的正数',
        icon: 'none'
      });
      return;
    }
    
    // 执行换算
    this.performWeightConversion(sourceValue, sourceUnit);
  },
  
  performWeightConversion(value: number, sourceUnit: string) {
    let gramValue = 0;
    
    // 先转换为克（基准单位）
    switch (sourceUnit) {
      case 'gram':
        gramValue = value;
        break;
      case 'kilogram':
        gramValue = value * 1000;
        break;
      case 'pound':
        gramValue = value * 453.592; // 1磅 = 453.592克
        break;
    }
    
    // 从克转换为其他单位
    const newValues = {
      gram: this.formatNumber(gramValue),
      kilogram: this.formatNumber(gramValue / 1000),
      pound: this.formatNumber(gramValue / 453.592)
    };
    
    this.setData({
      weightValues: newValues
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

  // 清空重量数据
  clearWeight() {
    this.setData({
      weightValues: {
        gram: '',
        kilogram: '',
        pound: ''
      }
    });
    
    wx.showToast({
      title: '已清空数据',
      icon: 'success'
    });
  }
});