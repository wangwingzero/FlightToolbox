// 重量换算页面
Page({
  data: {
    weightValues: {
      gram: '',
      kilogram: '',
      pound: ''
    }
  },

  onLoad() {
    // 页面加载初始化
  },

  onShow() {
    // 页面显示时的处理逻辑
  },

  // 重量输入事件处理
  onWeightInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';

    // 如果输入值为空，只更新当前字段
    if (!value || value.trim() === '') {
      const newValues = { ...this.data.weightValues };
      newValues[unit] = value;
      this.setData({
        weightValues: newValues
      });
      return;
    }

    // 解析输入值
    const numValue = parseFloat(value);

    // 如果不是有效数字，只更新当前字段
    if (isNaN(numValue) || numValue < 0) {
      const newValues = { ...this.data.weightValues };
      newValues[unit] = value;
      this.setData({
        weightValues: newValues
      });
      return;
    }

    // 自动换算其他单位
    this.performWeightConversion(numValue, unit);
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

    // 从克转换为其他单位（保持输入源的原始值）
    const newValues: any = {
      gram: sourceUnit === 'gram' ? value.toString() : this.formatNumber(gramValue),
      kilogram: sourceUnit === 'kilogram' ? value.toString() : this.formatNumber(gramValue / 1000),
      pound: sourceUnit === 'pound' ? value.toString() : this.formatNumber(gramValue / 453.592)
    };

    this.setData({
      weightValues: newValues
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