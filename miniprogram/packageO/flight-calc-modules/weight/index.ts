// 速度换算页面
Page({
  data: {
    isDarkMode: false,
    speedValues: {
      meterPerSecond: '',
      kilometerPerHour: '',
      knot: ''
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

  // 速度输入事件处理
  onSpeedInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    // 只更新当前输入的字段值，不进行实时换算
    const newValues = { ...this.data.speedValues };
    newValues[unit] = value;
    
    this.setData({
      speedValues: newValues
    });
  },

  // 速度换算
  convertSpeed() {
    const nonEmptyValues = this.getObjectEntries(this.data.speedValues).filter(([, value]) => value !== '');
    if (nonEmptyValues.length === 0) {
      wx.showToast({
        title: '请先输入数值',
        icon: 'none'
      });
      return;
    }

    this.performSpeedCalculation();
  },

  // 速度换算实际计算逻辑
  performSpeedCalculation() {
    const values = this.data.speedValues;
    const nonEmptyValues = this.getObjectEntries(values).filter(([key, value]) => value !== '');
    
    if (nonEmptyValues.length === 0) {
      wx.showToast({
        title: '请先输入数值',
        icon: 'none'
      });
      return;
    }
    
    if (nonEmptyValues.length > 1) {
      // 有多个输入值，使用第一个有效值进行换算
      const firstValue = nonEmptyValues[0];
      const firstUnit = firstValue[0];
      const firstInputValue = parseFloat(firstValue[1]);
      
      if (isNaN(firstInputValue)) {
        wx.showToast({
          title: '请输入有效数值',
          icon: 'none'
        });
        return;
      }
      
      this.performSpeedConversion(firstUnit, firstInputValue);
      
      wx.showToast({
        title: `检测到多个输入值，已使用${this.getSpeedUnitName(firstUnit)}进行换算`,
        icon: 'none',
        duration: 2000
      });
    } else {
      // 只有一个输入值，直接换算
      const [unit, value] = nonEmptyValues[0];
      const inputValue = parseFloat(value);
      
      if (isNaN(inputValue)) {
        wx.showToast({
          title: '请输入有效数值',
          icon: 'none'
        });
        return;
      }
      
      this.performSpeedConversion(unit, inputValue);
      
      wx.showToast({
        title: '换算完成',
        icon: 'success'
      });
    }
  },

  // 执行速度换算的核心逻辑
  performSpeedConversion(unit: string, inputValue: number) {
    // 先转换为米/秒作为基准单位
    let meterPerSecond = 0;
    switch (unit) {
      case 'meterPerSecond':
        meterPerSecond = inputValue;
        break;
      case 'kilometerPerHour':
        meterPerSecond = inputValue / 3.6;
        break;
      case 'knot':
        meterPerSecond = inputValue * 0.514444;
        break;
    }

    // 从米/秒转换为其他单位
    const newValues = {
      meterPerSecond: this.formatNumber(meterPerSecond),
      kilometerPerHour: this.formatNumber(meterPerSecond * 3.6),
      knot: this.formatNumber(meterPerSecond / 0.514444)
    };

    this.setData({
      speedValues: newValues
    });
  },

  // 获取速度单位的中文名称
  getSpeedUnitName(unit: string): string {
    const unitNames: { [key: string]: string } = {
      'meterPerSecond': '米/秒',
      'kilometerPerHour': '千米/时',
      'knot': '节'
    };
    return unitNames[unit] || unit;
  },

  // 清空速度数据
  clearSpeed() {
    this.setData({
      speedValues: {
        meterPerSecond: '',
        kilometerPerHour: '',
        knot: ''
      }
    });
    
    wx.showToast({
      title: '已清空速度数据',
      icon: 'success'
    });
  },

  // 获取对象的键值对数组
  getObjectEntries(obj: any): Array<[string, any]> {
    return Object.keys(obj).map(key => [key, obj[key]]);
  },

  // 格式化数字
  formatNumber(num: number): string {
    return Math.round(num * 1000000) / 1000000 + '';
  }
});