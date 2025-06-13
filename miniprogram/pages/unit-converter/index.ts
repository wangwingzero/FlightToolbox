// 常用换算页面
Page({
  data: {
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
    
    // 侧风计算相关
    crosswindHeading: '',
    crosswindDirection: '',
    crosswindSpeed: '',
    crosswindTrueAirspeed: '',
    crosswindComponent: '',
    headwindComponent: '',
    crosswindDisplayText: '',
    headwindDisplayText: '',
    driftAngle: '',
    groundSpeed: '',
    track: '',
    windAngle: 0,
    
    // ISA计算
    isaAltitude: '',
    isaOAT: '',
    isaStandardTemp: '',
    isaDeviation: '',
    
    // 转弯半径计算
    turnBankAngle: '',
    turnGroundSpeed: '',
    turnRadiusMeters: '',
    turnRadiusFeet: '',
    turnRadiusNauticalMiles: '',
    turnRate: '',
    turnTime360: '',
    
    // 梯度计算
    gradientInput: '',
    groundSpeedInput: '',
    verticalSpeedInput: '',
    angleInput: '',
    gradientResult: '',
    groundSpeedResult: '',
    verticalSpeedResult: '',
    angleResult: ''
  },

  onTabChange(event: any) {
    this.setData({
      activeTab: event.detail.index
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

  // 距离换算按钮
  convertDistance() {
    const values = this.data.distanceValues;
    const nonEmptyValues = Object.entries(values).filter(([key, value]) => value !== '');
    
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
    const values = this.data.weightValues;
    const nonEmptyValues = Object.entries(values).filter(([key, value]) => value !== '');
    
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
    const values = this.data.speedValues;
    const nonEmptyValues = Object.entries(values).filter(([key, value]) => value !== '');
    
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
    const values = this.data.temperatureValues;
    const nonEmptyValues = Object.entries(values).filter(([key, value]) => value !== '');
    
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

  // 清空梯度数据
  clearGradient() {
    this.setData({
      gradientInput: '',
      groundSpeedInput: '',
      verticalSpeedInput: '',
      angleInput: '',
      gradientResult: '',
      groundSpeedResult: '',
      verticalSpeedResult: '',
      angleResult: ''
    });
    wx.showToast({
      title: '已清空',
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

  // 侧风计算相关方法
  onCrosswindTrueAirspeedChange(event: any) {
    this.setData({ crosswindTrueAirspeed: event.detail })
  },

  onCrosswindHeadingChange(event: any) {
    this.setData({ crosswindHeading: event.detail })
  },

  onCrosswindDirectionChange(event: any) {
    this.setData({ crosswindDirection: event.detail })
  },

  onCrosswindSpeedChange(event: any) {
    this.setData({ crosswindSpeed: event.detail })
  },

  calculateCrosswind() {
    const tas = parseFloat(this.data.crosswindTrueAirspeed)
    const heading = parseFloat(this.data.crosswindHeading)
    let windDir = parseFloat(this.data.crosswindDirection)
    const windSpd = parseFloat(this.data.crosswindSpeed)
    
    // 处理字母输入的风向（仅用于计算，不改变显示）
    let windDirForCalculation = windDir
    if (isNaN(windDir)) {
      const windDirStr = this.data.crosswindDirection.toUpperCase()
      if (windDirStr === 'L' || windDirStr === 'LEFT') {
        windDirForCalculation = 270 // 西风
      } else if (windDirStr === 'R' || windDirStr === 'RIGHT') {
        windDirForCalculation = 90 // 东风
      } else {
        wx.showToast({
          title: '风向请输入度数(0-360)或L/R',
          icon: 'none'
        })
        return
      }
    } else {
      windDirForCalculation = windDir
    }
    
    if (isNaN(tas) || isNaN(heading) || isNaN(windSpd)) {
      wx.showToast({
        title: '请输入有效的真空速、航向、风向和风速',
        icon: 'none'
      })
      return
    }

    // 计算风向与航向的夹角
    let windAngle = windDirForCalculation - heading
    
    // 标准化角度到 -180 到 180 度范围
    while (windAngle > 180) windAngle -= 360
    while (windAngle < -180) windAngle += 360
    
    // 计算侧风和顶风分量
    const crosswindComponent = windSpd * Math.sin(windAngle * Math.PI / 180)
    const headwindComponent = windSpd * Math.cos(windAngle * Math.PI / 180)
    
    // 确定侧风方向（左侧风或右侧风）
    const crosswindDir = crosswindComponent > 0 ? 'R' : 'L'
    const crosswindMagnitude = Math.abs(crosswindComponent)
    
    // 计算地速
    const groundSpeed = Math.sqrt(Math.pow(tas - headwindComponent, 2) + Math.pow(crosswindComponent, 2))
    
    // 计算偏流角
    const driftAngle = Math.atan2(crosswindComponent, tas - headwindComponent) * 180 / Math.PI
    
    // 计算实际航迹
    let track = heading + driftAngle
    
    // 标准化航迹到0-360度范围
    while (track >= 360) track -= 360
    while (track < 0) track += 360
    
    // 生成显示文本
    const crosswindDisplayText = crosswindMagnitude === 0 ? 
      '无侧风 0 节' : 
      `${crosswindDir === 'L' ? '左' : '右'}侧风 ${crosswindMagnitude.toFixed(1)} 节`
    
    const headwindDisplayText = Math.abs(headwindComponent) < 0.1 ? 
      '无顶风/顺风 0 节' : 
      `${headwindComponent > 0 ? '顶风' : '顺风'} ${Math.abs(headwindComponent).toFixed(1)} 节`
    
    this.setData({
      crosswindComponent: crosswindMagnitude.toFixed(1),
      headwindComponent: headwindComponent.toFixed(1),
      crosswindDisplayText: crosswindDisplayText,
      headwindDisplayText: headwindDisplayText,
      driftAngle: driftAngle.toFixed(1),
      groundSpeed: groundSpeed.toFixed(1),
      track: track.toFixed(1),
      windAngle: windDirForCalculation, // 风向指针指向风的来向
      headingAngle: heading // 航向指针指向航向
    })
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

  // 梯度换算方法
  convertGradient() {
    const gradient = this.data.gradientInput ? parseFloat(this.data.gradientInput) : null
    const groundSpeed = this.data.groundSpeedInput ? parseFloat(this.data.groundSpeedInput) : null
    const verticalSpeed = this.data.verticalSpeedInput ? parseFloat(this.data.verticalSpeedInput) : null
    const angle = this.data.angleInput ? parseFloat(this.data.angleInput) : null

    // 清空所有结果
    this.setData({
      gradientResult: '',
      verticalSpeedResult: '',
      angleResult: ''
    })

    let hasCalculation = false

    // 情况1：梯度 + 地速 → 升降率 + 角度
    if (gradient !== null && !isNaN(gradient) && groundSpeed !== null && !isNaN(groundSpeed)) {
      if (gradient > 0 && groundSpeed > 0) {
        // 将地速从节转换为英尺/分钟
        const groundSpeedFtPerMin = groundSpeed * 101.27
        
        // 计算升降率 (英尺/分钟)
        const calculatedVerticalSpeed = (groundSpeedFtPerMin * gradient) / 100
        
        // 计算角度
        const calculatedAngle = Math.atan(gradient / 100) * (180 / Math.PI)
        
        this.setData({
          verticalSpeedResult: calculatedVerticalSpeed.toFixed(0),
          angleResult: calculatedAngle.toFixed(2)
        })
        hasCalculation = true
      }
    }

    // 情况2：地速 + 升降率 → 梯度 + 角度
    if (groundSpeed !== null && !isNaN(groundSpeed) && verticalSpeed !== null && !isNaN(verticalSpeed)) {
      if (groundSpeed > 0) {
        // 将地速从节转换为英尺/分钟
        const groundSpeedFtPerMin = groundSpeed * 101.27
        
        // 计算梯度 (%)
        const calculatedGradient = (verticalSpeed / groundSpeedFtPerMin) * 100
        
        // 计算角度
        const calculatedAngle = Math.atan(verticalSpeed / groundSpeedFtPerMin) * (180 / Math.PI)
        
        this.setData({
          gradientResult: calculatedGradient.toFixed(2),
          angleResult: calculatedAngle.toFixed(2)
        })
        hasCalculation = true
      }
    }

    // 情况3：仅梯度 → 角度
    if (!hasCalculation && gradient !== null && !isNaN(gradient) && gradient > 0) {
      const calculatedAngle = Math.atan(gradient / 100) * (180 / Math.PI)
      
      this.setData({
        angleResult: calculatedAngle.toFixed(2)
      })
      hasCalculation = true
    }

    // 情况4：角度 + 地速 → 梯度 + 升降率
    if (!hasCalculation && angle !== null && !isNaN(angle) && groundSpeed !== null && !isNaN(groundSpeed)) {
      if (angle > 0 && angle < 90 && groundSpeed > 0) {
        const angleRad = angle * Math.PI / 180
        const calculatedGradient = Math.tan(angleRad) * 100
        
        // 将地速从节转换为英尺/分钟
        const groundSpeedFtPerMin = groundSpeed * 101.27
        
        // 计算升降率
        const calculatedVerticalSpeed = (groundSpeedFtPerMin * calculatedGradient) / 100
        
        this.setData({
          gradientResult: calculatedGradient.toFixed(2),
          verticalSpeedResult: calculatedVerticalSpeed.toFixed(0)
        })
        hasCalculation = true
      }
    }

    // 情况5：梯度 + 升降率 → 地速 + 角度
    if (!hasCalculation && gradient !== null && !isNaN(gradient) && verticalSpeed !== null && !isNaN(verticalSpeed)) {
      if (gradient > 0 && verticalSpeed !== 0) {
        // 从梯度和升降率计算地速
        const calculatedGroundSpeedFtPerMin = (verticalSpeed * 100) / gradient
        const calculatedGroundSpeed = calculatedGroundSpeedFtPerMin / 101.27
        
        // 计算角度
        const calculatedAngle = Math.atan(gradient / 100) * (180 / Math.PI)
        
        this.setData({
          angleResult: calculatedAngle.toFixed(2)
        })
        hasCalculation = true
      }
    }

    // 情况6：角度 + 升降率 → 梯度 + 地速
    if (!hasCalculation && angle !== null && !isNaN(angle) && verticalSpeed !== null && !isNaN(verticalSpeed)) {
      if (angle > 0 && angle < 90 && verticalSpeed !== 0) {
        const angleRad = angle * Math.PI / 180
        const calculatedGradient = Math.tan(angleRad) * 100
        
        // 从角度和升降率计算地速
        const calculatedGroundSpeedFtPerMin = (verticalSpeed * 100) / calculatedGradient
        const calculatedGroundSpeed = calculatedGroundSpeedFtPerMin / 101.27
        
        this.setData({
          gradientResult: calculatedGradient.toFixed(2)
        })
        hasCalculation = true
      }
    }

    // 情况7：仅角度 → 梯度
    if (!hasCalculation && angle !== null && !isNaN(angle) && angle > 0 && angle < 90) {
      const angleRad = angle * Math.PI / 180
      const calculatedGradient = Math.tan(angleRad) * 100
      
      this.setData({
        gradientResult: calculatedGradient.toFixed(2)
      })
      hasCalculation = true
    }

    if (hasCalculation) {
      wx.showToast({
        title: '换算完成',
        icon: 'success'
      })
    } else {
      wx.showToast({
        title: '请输入有效的参数进行换算',
        icon: 'none'
      })
    }
  },

  // 梯度计算相关方法
  onGradientInputChange(event: any) {
    this.setData({
      gradientInput: event.detail
    })
  },

  onGroundSpeedInputChange(event: any) {
    this.setData({
      groundSpeedInput: event.detail
    })
  },

  onVerticalSpeedInputChange(event: any) {
    this.setData({
      verticalSpeedInput: event.detail
    })
  },

  onAngleInputChange(event: any) {
    this.setData({
      angleInput: event.detail
    })
  },



  // 转弯半径计算相关方法
  onTurnBankAngleChange(event: any) {
    this.setData({
      turnBankAngle: event.detail
    })
  },

  onTurnGroundSpeedChange(event: any) {
    this.setData({
      turnGroundSpeed: event.detail
    })
  },

  calculateTurnRadius() {
    const bankAngle = parseFloat(this.data.turnBankAngle)
    const groundSpeed = parseFloat(this.data.turnGroundSpeed)

    if (isNaN(bankAngle) || isNaN(groundSpeed)) {
      wx.showToast({
        title: '请输入有效的坡度角和地速',
        icon: 'none'
      })
      return
    }

    if (bankAngle <= 0 || bankAngle >= 90) {
      wx.showToast({
        title: '坡度角应在0-90度之间',
        icon: 'none'
      })
      return
    }

    if (groundSpeed <= 0) {
      wx.showToast({
        title: '地速应大于0',
        icon: 'none'
      })
      return
    }

    // 转弯半径计算公式：R = V² / (g × tan(θ))
    // V: 地速 (m/s)
    // g: 重力加速度 (9.81 m/s²)
    // θ: 坡度角 (弧度)
    
    // 将地速从节转换为米/秒 (1节 = 0.514444 m/s)
    const groundSpeedMs = groundSpeed * 0.514444
    
    // 将坡度角从度转换为弧度
    const bankAngleRad = bankAngle * Math.PI / 180
    
    // 计算转弯半径 (米)
    const radiusMeters = (groundSpeedMs * groundSpeedMs) / (9.81 * Math.tan(bankAngleRad))
    
    // 转换为其他单位
    const radiusFeet = radiusMeters * 3.28084 // 米转英尺
    const radiusNauticalMiles = radiusMeters / 1852 // 米转海里
    
    // 计算转弯率 (度/秒)
    // 转弯率 = (g × tan(θ)) / V × (180/π)
    const turnRateDegPerSec = (9.81 * Math.tan(bankAngleRad)) / groundSpeedMs * (180 / Math.PI)
    
    // 计算360度转弯时间 (秒)
    const time360 = 360 / turnRateDegPerSec

    this.setData({
      turnRadiusMeters: this.formatNumber(radiusMeters),
      turnRadiusFeet: this.formatNumber(radiusFeet),
      turnRadiusNauticalMiles: this.formatNumber(radiusNauticalMiles),
      turnRate: this.formatNumber(turnRateDegPerSec),
      turnTime360: this.formatNumber(time360)
    })
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '飞行工具箱 - 常用换算',
      desc: '航空常用换算工具，支持距离、重量、速度、温度换算，以及侧风、ISA、梯度、转弯半径计算',
      path: '/pages/unit-converter/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行工具箱 - 专业航空换算工具',
      query: 'from=timeline'
    }
  }
}); 