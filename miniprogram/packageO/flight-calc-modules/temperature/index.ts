// 温度换算页面
Page({
  data: {
    isDarkMode: false,
    temperatureValues: {
      celsius: '',
      fahrenheit: '',
      kelvin: ''
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

  // 数字输入验证函数
  onNumberInput(e: any) {
    let value = e.detail.value;
    // 只允许数字、负号、小数点
    value = value.replace(/[^-0-9.]/g, '');
    // 确保负号只能在开头
    if (value.indexOf('-') > 0) {
      value = value.replace(/-/g, '');
    }
    // 确保只有一个小数点
    const dotIndex = value.indexOf('.');
    if (dotIndex !== -1) {
      value = value.substring(0, dotIndex + 1) + value.substring(dotIndex + 1).replace(/\./g, '');
    }
    // 更新输入框的值
    const unit = e.currentTarget.dataset.unit;
    if (unit) {
      this.setData({
        [`temperatureValues.${unit}`]: value
      });
    }
  },

  // 温度输入事件处理
  onTemperatureInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    const newValues = { ...this.data.temperatureValues };
    newValues[unit] = value;
    
    this.setData({
      temperatureValues: newValues
    });
  },

  // 温度换算
  convertTemperature() {
    const { celsius, fahrenheit, kelvin } = this.data.temperatureValues;
    
    // 检查是否有输入值
    const inputValues = [celsius, fahrenheit, kelvin].filter(val => val && val.trim() !== '');
    if (inputValues.length === 0) {
      wx.showToast({
        title: '请输入至少一个温度值',
        icon: 'none'
      });
      return;
    }
    
    let sourceValue = 0;
    let sourceUnit = '';
    
    // 确定输入源和值
    if (celsius && celsius.trim() !== '') {
      sourceValue = parseFloat(celsius);
      sourceUnit = 'celsius';
    } else if (fahrenheit && fahrenheit.trim() !== '') {
      sourceValue = parseFloat(fahrenheit);
      sourceUnit = 'fahrenheit';
    } else if (kelvin && kelvin.trim() !== '') {
      sourceValue = parseFloat(kelvin);
      sourceUnit = 'kelvin';
    }
    
    if (isNaN(sourceValue)) {
      wx.showToast({
        title: '请输入有效的数值',
        icon: 'none'
      });
      return;
    }
    
    // 执行换算
    this.performTemperatureConversion(sourceValue, sourceUnit);
  },
  
  performTemperatureConversion(value: number, sourceUnit: string) {
    let celsiusValue = 0;
    
    // 先转换为摄氏度（基准单位）
    switch (sourceUnit) {
      case 'celsius':
        celsiusValue = value;
        break;
      case 'fahrenheit':
        celsiusValue = (value - 32) * 5 / 9;
        break;
      case 'kelvin':
        celsiusValue = value - 273.15;
        break;
    }
    
    // 从摄氏度转换为其他单位
    const newValues = {
      celsius: this.formatNumber(celsiusValue),
      fahrenheit: this.formatNumber(celsiusValue * 9 / 5 + 32),
      kelvin: this.formatNumber(celsiusValue + 273.15)
    };
    
    this.setData({
      temperatureValues: newValues
    });
    
    wx.showToast({
      title: '换算完成',
      icon: 'success'
    });
  },
  
  formatNumber(num: number): string {
    return num.toFixed(2);
  },

  // 清空温度数据
  clearTemperature() {
    this.setData({
      temperatureValues: {
        celsius: '',
        fahrenheit: '',
        kelvin: ''
      }
    });
    
    wx.showToast({
      title: '已清空数据',
      icon: 'success'
    });
  }
});