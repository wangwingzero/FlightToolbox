// 常用换算页面
// 🎯 常用换算已改为免费，移除按钮收费管理器

// ES5兼容的Object.entries实现
function getObjectEntries(obj: any): [string, any][] {
  const entries: [string, any][] = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      entries.push([key, obj[key]]);
    }
  }
  return entries;
}

Page({
  data: {
    // 🎯 基于Context7最佳实践：全局主题状态
    isDarkMode: false,
    
    // 新增：模块选择状态
    selectedModule: '', // 当前选中的模块：distance, speed, temperature, weight, pressure, isa
    
    activeTab: 0,
    
    // 距离换算数据
    distanceValues: {
      meter: '',
      kilometer: '',
      nauticalMile: '',
      mile: '',
      foot: '',
      inch: ''
    },
    // 重量换算数据
    weightValues: {
      gram: '',
      kilogram: '',
      pound: ''
    },
    // 速度换算数据
    speedValues: {
      meterPerSecond: '',
      kilometerPerHour: '',
      knot: ''
    },
    // 温度换算数据
    temperatureValues: {
      celsius: '',
      fahrenheit: '',
      kelvin: ''
    },
    

    
    // ISA计算
    isaAltitude: '',
    isaOAT: '',
    isaStandardTemp: '',
    isaDeviation: '',
    

    
    // QFE计算
    qnhInput: '',
    qfeInput: '',
    elevationInput: '',
    qnhResult: '',
    qfeResult: '',
    
  },

  onLoad() {
    // 🎯 新增：初始化全局主题管理器
    try {
      const themeManager = require('../../utils/theme-manager.js');
      this.themeCleanup = themeManager.initPageTheme(this);
      console.log('🌙 常用换算页面主题初始化完成');
    } catch (error) {
      console.warn('⚠️ 主题管理器初始化失败:', error);
    }
    
    // 🎯 离线优先：监听网络状态变化
    this.initNetworkMonitor();
    
  },

  onUnload() {
    // 🎯 新增：清理主题监听器
    if (this.themeCleanup && typeof this.themeCleanup === 'function') {
      try {
        this.themeCleanup();
        console.log('🌙 常用换算页面主题监听器已清理');
      } catch (error) {
        console.warn('⚠️ 清理主题监听器时出错:', error);
      }
    }
  },

  onTabChange(event: any) {
    this.setData({
      activeTab: event.detail.index
    });
  },

  // 新增：模块选择方法
  selectModule(event: any) {
    const module = event.currentTarget.dataset.module;
    this.setData({
      selectedModule: module
    });
    console.log('选择模块:', module);
  },

  // 新增：返回模块选择页面
  backToModules() {
    this.setData({
      selectedModule: ''
    });
  },

  // 距离换算相关方法
  onDistanceInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    // 只更新当前输入的字段值，不进行实时换算
    const newValues = { ...this.data.distanceValues };
    newValues[unit] = value;
    
    this.setData({
      distanceValues: newValues
    });
  },

  // 重量换算相关方法
  onWeightInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    // 只更新当前输入的字段值，不进行实时换算
    const newValues = { ...this.data.weightValues };
    newValues[unit] = value;
    
    this.setData({
      weightValues: newValues
    });
  },

  // 速度换算相关方法
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

  // 温度换算相关方法
  onTemperatureInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    // 只更新当前输入的字段值，不进行实时换算
    const newValues = { ...this.data.temperatureValues };
    newValues[unit] = value;
    
    this.setData({
      temperatureValues: newValues
    });
  },

  // 温度数字输入实时处理（支持负数）
  onTemperatureNumberInput(event: any) {
    let value = event.detail.value || ''
    
    // 如果值为空，直接返回
    if (!value) {
      return value
    }
    
    // 允许输入：数字、小数点、负号（仅在开头）
    value = value.replace(/[^\d.-]/g, '')
    
    // 确保负号只能在开头
    if (value.indexOf('-') > 0) {
      value = value.replace(/-/g, '')
    }
    
    // 确保只有一个负号
    const negativeCount = (value.match(/-/g) || []).length
    if (negativeCount > 1) {
      value = value.replace(/-/g, '')
      if (value.charAt(0) !== '-') {
        value = '-' + value
      }
    }
    
    // 确保只有一个小数点
    const dotCount = (value.match(/\./g) || []).length
    if (dotCount > 1) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts.slice(1).join('')
    }
    
    // 返回处理后的值
    return value
  },

  // 距离换算按钮
  convertDistance() {
    // 直接执行距离换算计算
    this.performDistanceCalculation();
  },

  // 距离换算实际计算逻辑
  performDistanceCalculation() {
    const values = this.data.distanceValues;
    const nonEmptyValues = getObjectEntries(values).filter(([key, value]) => value !== '');
    
    if (nonEmptyValues.length === 0) {
      wx.showToast({
        title: '请先输入数值',
        icon: 'none'
      });
      return;
    }
    
    if (nonEmptyValues.length > 1) {
      // 有多个输入值，检查是否存在冲突
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
      
      // 使用第一个有效值进行换算，并提示用户
      this.performDistanceConversion(firstUnit, firstInputValue);
      
      wx.showToast({
        title: `检测到多个输入值，已使用${this.getDistanceUnitName(firstUnit)}进行换算`,
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
      
      this.performDistanceConversion(unit, inputValue);
      
      wx.showToast({
        title: '换算完成',
        icon: 'success'
      });
    }
  },

  // 执行距离换算的核心逻辑
  performDistanceConversion(unit: string, inputValue: number) {
    // 先转换为米作为基准单位
    let meters = 0;
    switch (unit) {
      case 'meter':
        meters = inputValue;
        break;
      case 'kilometer':
        meters = inputValue * 1000;
        break;
      case 'nauticalMile':
        meters = inputValue * 1852;
        break;
      case 'mile':
        meters = inputValue * 1609.344;
        break;
      case 'foot':
        meters = inputValue * 0.3048;
        break;
      case 'inch':
        meters = inputValue * 0.0254;
        break;
    }

    // 从米转换为其他单位
    const newValues = {
      meter: this.formatNumber(meters),
      kilometer: this.formatNumber(meters / 1000),
      nauticalMile: this.formatNumber(meters / 1852),
      mile: this.formatNumber(meters / 1609.344),
      foot: this.formatNumber(meters / 0.3048),
      inch: this.formatNumber(meters / 0.0254)
    };

    this.setData({
      distanceValues: newValues
    });
  },

  // 获取距离单位的中文名称
  getDistanceUnitName(unit: string): string {
    const unitNames: { [key: string]: string } = {
      'meter': '米',
      'kilometer': '千米',
      'nauticalMile': '海里',
      'mile': '英里',
      'foot': '英尺',
      'inch': '英寸'
    };
    return unitNames[unit] || unit;
  },

  // 重量换算按钮
  convertWeight() {
    // 直接执行重量换算计算
    this.performWeightCalculation();
  },

  // 重量换算实际计算逻辑
  performWeightCalculation() {
    const values = this.data.weightValues;
    const nonEmptyValues = getObjectEntries(values).filter(([key, value]) => value !== '');
    
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
      
      this.performWeightConversion(firstUnit, firstInputValue);
      
      wx.showToast({
        title: `检测到多个输入值，已使用${this.getWeightUnitName(firstUnit)}进行换算`,
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
      
      this.performWeightConversion(unit, inputValue);
      
      wx.showToast({
        title: '换算完成',
        icon: 'success'
      });
    }
  },

  // 执行重量换算的核心逻辑
  performWeightConversion(unit: string, inputValue: number) {
    // 先转换为克作为基准单位
    let grams = 0;
    switch (unit) {
      case 'gram':
        grams = inputValue;
        break;
      case 'kilogram':
        grams = inputValue * 1000;
        break;
      case 'pound':
        grams = inputValue * 453.592;
        break;
    }

    // 从克转换为其他单位
    const newValues = {
      gram: this.formatNumber(grams),
      kilogram: this.formatNumber(grams / 1000),
      pound: this.formatNumber(grams / 453.592)
    };

    this.setData({
      weightValues: newValues
    });
  },

  // 获取重量单位的中文名称
  getWeightUnitName(unit: string): string {
    const unitNames: { [key: string]: string } = {
      'gram': '克',
      'kilogram': '千克',
      'pound': '磅'
    };
    return unitNames[unit] || unit;
  },

  // 速度换算按钮
  convertSpeed() {
    // 直接执行速度换算计算
    this.performSpeedCalculation();
  },

  // 速度换算实际计算逻辑
  performSpeedCalculation() {
    const values = this.data.speedValues;
    const nonEmptyValues = getObjectEntries(values).filter(([key, value]) => value !== '');
    
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

  // 温度换算按钮
  convertTemperature() {
    // 直接执行温度换算计算
    this.performTemperatureCalculation();
  },

  // 温度换算实际计算逻辑
  performTemperatureCalculation() {
    const values = this.data.temperatureValues;
    const nonEmptyValues = getObjectEntries(values).filter(([key, value]) => value !== '');
    
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
      
      this.performTemperatureConversion(firstUnit, firstInputValue);
      
      wx.showToast({
        title: `检测到多个输入值，已使用${this.getTemperatureUnitName(firstUnit)}进行换算`,
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
      
      this.performTemperatureConversion(unit, inputValue);
      
      wx.showToast({
        title: '换算完成',
        icon: 'success'
      });
    }
  },

  // 执行温度换算的核心逻辑
  performTemperatureConversion(unit: string, inputValue: number) {
    // 先转换为摄氏度作为基准单位
    let celsius = 0;
    switch (unit) {
      case 'celsius':
        celsius = inputValue;
        break;
      case 'fahrenheit':
        celsius = (inputValue - 32) * 5 / 9;
        break;
      case 'kelvin':
        celsius = inputValue - 273.15;
        break;
    }

    // 从摄氏度转换为其他单位
    const newValues = {
      celsius: this.formatNumber(celsius),
      fahrenheit: this.formatNumber(celsius * 9 / 5 + 32),
      kelvin: this.formatNumber(celsius + 273.15)
    };

    this.setData({
      temperatureValues: newValues
    });
  },

  // 获取温度单位的中文名称
  getTemperatureUnitName(unit: string): string {
    const unitNames: { [key: string]: string } = {
      'celsius': '摄氏度',
      'fahrenheit': '华氏度',
      'kelvin': '开尔文'
    };
    return unitNames[unit] || unit;
  },

  // 清空距离数据
  clearDistance() {
    this.setData({
      distanceValues: {
        meter: '',
        kilometer: '',
        nauticalMile: '',
        mile: '',
        foot: '',
        inch: ''
      }
    });
    wx.showToast({
      title: '已清空距离数据',
      icon: 'success'
    });
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
      title: '已清空重量数据',
      icon: 'success'
    });
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
      title: '已清空温度数据',
      icon: 'success'
    });
  },

  // 气压换算方法
  convertPressure() {
    // 参数验证函数
    const validateParams = () => {
      const elevation = parseFloat(this.data.elevationInput);
      const qnh = parseFloat(this.data.qnhInput);
      const qfe = parseFloat(this.data.qfeInput);
      
      // 至少需要两个参数才能计算
      if ((isNaN(elevation) && isNaN(qnh)) || 
          (isNaN(elevation) && isNaN(qfe)) || 
          (isNaN(qnh) && isNaN(qfe))) {
        return { valid: false, message: '请至少输入两个参数' };
      }
      
      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      const elevation = parseFloat(this.data.elevationInput) || 0;
      const qnh = parseFloat(this.data.qnhInput);
      const qfe = parseFloat(this.data.qfeInput);
      
      // 计算QNH (QFE + 高度修正)
      if (!isNaN(qfe) && !isNaN(elevation)) {
        // 每30英尺高度约1hPa气压差
        const pressureDiff = elevation / 30;
        const calculatedQNH = qfe + pressureDiff;
        
        this.setData({
          qnhResult: calculatedQNH.toFixed(1)
        });
      }
      
      // 计算QFE (QNH - 高度修正)
      if (!isNaN(qnh) && !isNaN(elevation)) {
        // 每30英尺高度约1hPa气压差
        const pressureDiff = elevation / 30;
        const calculatedQFE = qnh - pressureDiff;
        
        this.setData({
          qfeResult: calculatedQFE.toFixed(1)
        });
      }
    };

    // 执行参数验证
    const validation = validateParams();
    if (!validation.valid) {
      wx.showToast({
        title: validation.message,
        icon: 'none'
      });
      return;
    }

    // 直接执行计算
    performCalculation();
    
    wx.showToast({
      title: '气压换算完成',
      icon: 'success'
    });
  },

  // 清空气压换算
  clearPressure() {
    this.setData({
      elevationInput: '',
      qnhInput: '',
      qfeInput: '',
      qnhResult: '',
      qfeResult: ''
    });
    wx.showToast({
      title: '已清空气压数据',
      icon: 'success'
    });
  },

  // ISA温度计算方法
  calculateISA() {
    // 参数验证函数
    const validateParams = () => {
      const altitude = parseFloat(this.data.isaAltitude);
      const oat = parseFloat(this.data.isaOAT);
      
      if (isNaN(altitude)) {
        return { valid: false, message: '请输入有效的高度' };
      }
      
      if (isNaN(oat)) {
        return { valid: false, message: '请输入有效的外界温度' };
      }
      
      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      const altitude = parseFloat(this.data.isaAltitude);
      const oat = parseFloat(this.data.isaOAT);
      
      // ISA标准温度计算 (海平面15°C，每1000英尺降低2°C)
      let isaTemp = 15 - (altitude / 1000) * 2;
      
      // 温度偏差 (实际温度 - ISA标准温度)
      const deviation = oat - isaTemp;
      
      this.setData({
        isaStandardTemp: isaTemp.toFixed(1),
        isaDeviation: deviation.toFixed(1)
      });
    };

    // 执行参数验证
    const validation = validateParams();
    if (!validation.valid) {
      wx.showToast({
        title: validation.message,
        icon: 'none'
      });
      return;
    }

    // 直接执行计算
    performCalculation();
    
    wx.showToast({
      title: 'ISA温度计算完成',
      icon: 'success'
    });
  },

  // 清空ISA温度计算
  clearISA() {
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

  // ISA高度输入变化
  onISAAltitudeChange(event: any) {
    this.setData({
      isaAltitude: event.detail
    });
  },

  // ISA外界温度输入变化
  onISAOATChange(event: any) {
    this.setData({
      isaOAT: event.detail
    });
  },

  // 机场标高输入变化
  onElevationInputChange(event: any) {
    this.setData({
      elevationInput: event.detail
    });
  },

  // QNH输入变化
  onQNHInputChange(event: any) {
    this.setData({
      qnhInput: event.detail
    });
  },

  // QFE输入变化
  onQFEInputChange(event: any) {
    this.setData({
      qfeInput: event.detail
    });
  },

  // 清空QFE数据
  clearQFE() {
    this.setData({
      qnhInput: '',
      qfeInput: '',
      elevationInput: '',
      qnhResult: '',
      qfeResult: ''
    });
    wx.showToast({
      title: '已清空QFE数据',
      icon: 'success'
    });
  },

  // 清空所有数据
  clearAll() {
    this.setData({
      distanceValues: {
        meter: '',
        kilometer: '',
        nauticalMile: '',
        mile: '',
        foot: '',
        inch: ''
      },
      weightValues: {
        gram: '',
        kilogram: '',
        pound: ''
      },
      speedValues: {
        meterPerSecond: '',
        kilometerPerHour: '',
        knot: ''
      },
      temperatureValues: {
        celsius: '',
        fahrenheit: '',
        kelvin: ''
      }
    });
    wx.showToast({
      title: '已清空所有数据',
      icon: 'success'
    });
  },

  // 格式化数字，保留合适的小数位数
  formatNumber(num: number): string {
    if (num === 0) return '0';
    
    // 对于很大或很小的数字，使用科学计数法
    if (Math.abs(num) >= 1000000 || (Math.abs(num) < 0.001 && Math.abs(num) > 0)) {
      return num.toExponential(6);
    }
    
    // 对于普通数字，保留适当的小数位数
    if (Math.abs(num) >= 100) {
      return num.toFixed(2);
    } else if (Math.abs(num) >= 1) {
      return num.toFixed(4);
    } else {
      return num.toFixed(6);
    }
  },



  // ISA计算相关方法
  onIsaAltitudeChange(event: any) {
    this.setData({
      isaAltitude: event.detail
    })
  },

  onIsaOATChange(event: any) {
    this.setData({
      isaOAT: event.detail
    })
  },

  calculateISA() {
    // 直接执行ISA温度计算
    this.performISACalculation();
  },

  // ISA计算实际计算逻辑
  performISACalculation() {
    const altitude = parseFloat(this.data.isaAltitude)
    const oat = parseFloat(this.data.isaOAT)
    
    if (isNaN(altitude)) {
      wx.showToast({
        title: '请输入有效的高度',
        icon: 'none'
      })
      return
    }

    // ISA标准温度：海平面15°C，每1000英尺下降2°C
    const standardTemp = 15 - (altitude / 1000) * 2
    
    let deviation = ''
    if (!isNaN(oat)) {
      const tempDeviation = oat - standardTemp
      deviation = tempDeviation >= 0 ? `+${tempDeviation.toFixed(1)}°C` : `${tempDeviation.toFixed(1)}°C`
    }
    
    this.setData({
      isaStandardTemp: standardTemp.toFixed(1),
      isaDeviation: deviation
    })
  },

  onQNHInputChange(event: any) {
    this.setData({ qnhInput: event.detail })
  },

  onQFEInputChange(event: any) {
    this.setData({ qfeInput: event.detail })
  },

  onElevationInputChange(event: any) {
    this.setData({ elevationInput: event.detail })
  },

  convertQNHtoQFE() {
    // 直接执行QNH转QFE计算
    this.performQNHtoQFE();
  },

  // QNH转QFE实际计算逻辑
  performQNHtoQFE() {
    const qnh = parseFloat(this.data.qnhInput)
    const elevation = parseFloat(this.data.elevationInput)
    
    if (isNaN(qnh) || isNaN(elevation)) {
      wx.showToast({
        title: '请输入有效的QNH和机场标高',
        icon: 'none'
      })
      return
    }

    // 使用精确的ISA标准：每27英尺对应1 hPa
    // 基于压高公式的简化计算，适用于低空精确转换
    // QFE = QNH - (标高(英尺) / 27)
    const qfe = qnh - (elevation / 27)
    
    this.setData({
      qfeResult: qfe.toFixed(1)
    })
  },

  convertQFEtoQNH() {
    // 直接执行QFE转QNH计算
    this.performQFEtoQNH();
  },

  // QFE转QNH实际计算逻辑
  performQFEtoQNH() {
    const qfe = parseFloat(this.data.qfeInput)
    const elevation = parseFloat(this.data.elevationInput)
    
    if (isNaN(qfe) || isNaN(elevation)) {
      wx.showToast({
        title: '请输入有效的QFE和机场标高',
        icon: 'none'
      })
      return
    }

    // 使用精确的ISA标准：每27英尺对应1 hPa
    // 基于压高公式的简化计算，适用于低空精确转换
    // QNH = QFE + (标高(英尺) / 27)
    const qnh = qfe + (elevation / 27)
    
    this.setData({
      qnhResult: qnh.toFixed(1)
    })
  },





  // 转发功能
  onShareAppMessage() {
    return {
      title: '飞行工具箱 - 常用换算',
      desc: '航空常用换算工具，支持距离、重量、速度、温度换算，以及侧风、ISA、梯度、转弯半径计算',
      path: '/packageO/unit-converter/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行工具箱 - 专业航空换算工具',
      query: 'from=timeline'
    }
  },


  // 🎯 离线优先：网络状态监控
  initNetworkMonitor() {
    try {
      // 监听网络状态变化
      wx.onNetworkStatusChange((res) => {
        if (!res.isConnected) {
          console.log('🔄 网络断开，切换到离线模式');
          // 确保清除任何可能的loading状态
          wx.hideLoading();
          wx.hideNavigationBarLoading();
        } else {
          console.log('🔄 网络恢复，网络类型:', res.networkType);
        }
      });
      console.log('🔄 网络状态监控已启动');
    } catch (error) {
      console.warn('⚠️ 网络监控初始化失败:', error);
    }
  }
}); 