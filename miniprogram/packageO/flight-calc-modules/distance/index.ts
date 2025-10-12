// 距离换算页面
Page({
  data: {
    distanceValues: {
      meter: '',
      kilometer: '',
      nauticalMile: ''
    }
  },

  onLoad() {
    // 页面加载初始化
  },

  onShow() {
    // 页面显示时的处理逻辑
  },

  onDistanceInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';

    // 如果输入值为空，只更新当前字段
    if (!value || value.trim() === '') {
      const newValues = { ...this.data.distanceValues };
      newValues[unit] = value;
      this.setData({
        distanceValues: newValues
      });
      return;
    }

    // 解析输入值
    const numValue = parseFloat(value);

    // 如果不是有效数字，只更新当前字段
    if (isNaN(numValue) || numValue < 0) {
      const newValues = { ...this.data.distanceValues };
      newValues[unit] = value;
      this.setData({
        distanceValues: newValues
      });
      return;
    }

    // 自动换算其他单位
    this.performDistanceConversion(numValue, unit);
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

    // 从米转换为其他单位（保持输入源的原始值）
    const newValues: any = {
      meter: sourceUnit === 'meter' ? value.toString() : this.formatNumber(meterValue),
      kilometer: sourceUnit === 'kilometer' ? value.toString() : this.formatNumber(meterValue / 1000),
      nauticalMile: sourceUnit === 'nauticalMile' ? value.toString() : this.formatNumber(meterValue / 1852)
    };

    this.setData({
      distanceValues: newValues
    });
  },
  
  formatNumber(num: number): string {
    // 避免使用科学计数法，显示完整数值
    if (num >= 100) {
      // 大于等于100，显示整数
      return Math.round(num).toString();
    } else if (num >= 1) {
      // 1-100之间，保留2位小数
      return num.toFixed(2);
    } else if (num > 0) {
      // 小于1的正数，保留4位小数
      return num.toFixed(4);
    } else {
      // 0或负数
      return num.toString();
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