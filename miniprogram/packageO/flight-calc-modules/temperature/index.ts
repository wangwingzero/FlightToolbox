// 温度换算页面
Page({
  data: {
    isAdFree: false, // 无广告状态

    temperatureValues: {
      celsius: '',
      fahrenheit: '',
      kelvin: ''
    }
  },

  onLoad() {
    // 页面加载初始化
  },

  onShow() {
    // 检查无广告状态
    this.checkAdFreeStatus();
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

    // 如果输入值为空，只更新当前字段
    if (!value || value.trim() === '') {
      const newValues = { ...this.data.temperatureValues };
      newValues[unit] = value;
      this.setData({
        temperatureValues: newValues
      });
      return;
    }

    // 解析输入值（温度可以为负数）
    const numValue = parseFloat(value);

    // 如果不是有效数字，只更新当前字段
    if (isNaN(numValue)) {
      const newValues = { ...this.data.temperatureValues };
      newValues[unit] = value;
      this.setData({
        temperatureValues: newValues
      });
      return;
    }

    // 自动换算其他单位
    this.performTemperatureConversion(numValue, unit);
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

    // 从摄氏度转换为其他单位（保持输入源的原始值）
    const newValues: any = {
      celsius: sourceUnit === 'celsius' ? value.toString() : this.formatNumber(celsiusValue),
      fahrenheit: sourceUnit === 'fahrenheit' ? value.toString() : this.formatNumber(celsiusValue * 9 / 5 + 32),
      kelvin: sourceUnit === 'kelvin' ? value.toString() : this.formatNumber(celsiusValue + 273.15)
    };

    this.setData({
      temperatureValues: newValues
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
  },

  // 检查无广告状态
  checkAdFreeStatus() {
    const adFreeManager = require('../../../utils/ad-free-manager.js');
    try {
      const isAdFree = adFreeManager.isAdFreeToday();
      this.setData({ isAdFree });
      console.log('📅 无广告状态:', isAdFree ? '今日无广告' : '显示广告');
    } catch (error) {
      console.error('❌ 检查无广告状态失败:', error);
    }
  }
});