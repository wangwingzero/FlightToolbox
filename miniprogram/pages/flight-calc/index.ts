// 飞行速算页面
const buttonChargeManager = require('../../utils/button-charge-manager.js');

Page({
  data: {
    activeTab: 0,
    
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
    headingAngle: 0,
    
    // 转弯半径计算
    turnBankAngle: '',
    turnGroundSpeed: '',
    turnRadiusMeters: '',
    turnRadiusFeet: '',
    turnRadiusNauticalMiles: '',
    turnRate: '',
    turnTime360: '',
    
    // 下降率计算
    currentAltitude: '',
    targetAltitude: '',
    distanceNM: '',
    currentGroundSpeed: '',
    descentRate: '',
    descentAngle: '',
    timeToDescend: '',
    descentGradient: '',

    // 下滑线计算相关
    glideslopeAngle: '3.0',      // 下滑角，默认3度
    distanceFromThreshold: '',   // 距离跑道头距离
    airportElevation: '0',       // 机场标高，默认0英尺
    glideslopeAltitude: '',      // 计算出的相对高度
    glideslopeAbsoluteAltitude: '', // 计算出的绝对高度
    glideslopeError: '',         // 错误信息

    // 绕飞耗油计算相关
    detourDistance: '',        // 偏离航路距离（海里）
    detourGroundSpeed: '',     // 地速（节）
    detourFuelConsumption: '', // 油耗（KG/H）
    detourFuelResult: '',      // 绕飞耗油结果
    detourTimeResult: '',      // 绕飞时间结果
    detourError: '',           // 错误信息
    detourCalculationDetails: '', // 计算详情
  },

  onTabChange(event: any) {
    this.setData({
      activeTab: event.detail.index
    });
  },

  // 侧风计算相关方法
  onCrosswindTrueAirspeedChange(event: any) {
    this.setData({
      crosswindTrueAirspeed: event.detail
    })
  },

  onCrosswindHeadingChange(event: any) {
    this.setData({
      crosswindHeading: event.detail
    })
  },

  onCrosswindDirectionChange(event: any) {
    this.setData({
      crosswindDirection: event.detail
    })
  },

  onCrosswindSpeedChange(event: any) {
    this.setData({
      crosswindSpeed: event.detail
    })
  },

  calculateCrosswind() {
    // 参数验证函数
    const validateParams = () => {
      const tas = parseFloat(this.data.crosswindTrueAirspeed);
      const heading = parseFloat(this.data.crosswindHeading);
      const windDir = this.data.crosswindDirection;
      const windSpd = parseFloat(this.data.crosswindSpeed);
      
      if (isNaN(tas) || isNaN(heading) || isNaN(windSpd)) {
        return { valid: false, message: '请输入有效的真空速、航向、风向和风速' };
      }
      
      // 检查风向输入
      const windDirNum = parseFloat(windDir);
      if (isNaN(windDirNum)) {
        const windDirStr = windDir.toUpperCase();
        if (windDirStr !== 'L' && windDirStr !== 'LEFT' && windDirStr !== 'R' && windDirStr !== 'RIGHT') {
          return { valid: false, message: '风向请输入度数(0-360)或L/R' };
        }
      }
      
      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      this.performCrosswindCalculation();
    };

    // 使用扣费管理器执行计算
    buttonChargeManager.executeCalculateWithCharge(
      'flight-calc-crosswind',
      validateParams,
      '侧风分量计算',
      performCalculation
    );
  },

  // 分离出来的实际侧风计算逻辑
  performCrosswindCalculation() {
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
      }
    } else {
      windDirForCalculation = windDir
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
    // 参数验证函数
    const validateParams = () => {
      const bankAngle = parseFloat(this.data.turnBankAngle);
      const groundSpeed = parseFloat(this.data.turnGroundSpeed);

      if (isNaN(bankAngle) || isNaN(groundSpeed)) {
        return { valid: false, message: '请输入有效的坡度角和地速' };
      }

      if (bankAngle <= 0 || bankAngle >= 90) {
        return { valid: false, message: '坡度角应在0-90度之间' };
      }

      if (groundSpeed <= 0) {
        return { valid: false, message: '地速应大于0' };
      }

      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      this.performTurnRadiusCalculation();
    };

    // 使用扣费管理器执行计算
    buttonChargeManager.executeCalculateWithCharge(
      'flight-calc-turn-radius',
      validateParams,
      '转弯半径计算',
      performCalculation
    );
  },

  // 分离出来的实际转弯半径计算逻辑
  performTurnRadiusCalculation() {
    const bankAngle = parseFloat(this.data.turnBankAngle)
    const groundSpeed = parseFloat(this.data.turnGroundSpeed)

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

  // 下降率计算相关方法
  onCurrentAltitudeChange(event: any) {
    this.setData({
      currentAltitude: event.detail
    })
  },

  onTargetAltitudeChange(event: any) {
    this.setData({
      targetAltitude: event.detail
    })
  },

  onDistanceNMChange(event: any) {
    this.setData({
      distanceNM: event.detail
    })
  },

  onCurrentGroundSpeedChange(event: any) {
    this.setData({
      currentGroundSpeed: event.detail
    })
  },

  calculateDescentRate() {
    // 参数验证函数
    const validateParams = () => {
      const currentAlt = parseFloat(this.data.currentAltitude);
      const targetAlt = parseFloat(this.data.targetAltitude);
      const distance = parseFloat(this.data.distanceNM);
      const groundSpeed = parseFloat(this.data.currentGroundSpeed);

      if (isNaN(currentAlt) || isNaN(targetAlt) || isNaN(distance) || isNaN(groundSpeed)) {
        return { valid: false, message: '请输入有效的高度、距离和地速' };
      }

      if (currentAlt <= targetAlt) {
        return { valid: false, message: '当前高度应大于目标高度' };
      }

      if (distance <= 0) {
        return { valid: false, message: '距离应大于0' };
      }

      if (groundSpeed <= 0) {
        return { valid: false, message: '地速应大于0' };
      }

      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      const currentAlt = parseFloat(this.data.currentAltitude);
      const targetAlt = parseFloat(this.data.targetAltitude);
      const distance = parseFloat(this.data.distanceNM);
      const groundSpeed = parseFloat(this.data.currentGroundSpeed);

      // 计算需要下降的高度差（英尺）
      const altitudeDifference = currentAlt - targetAlt;

      // 计算下降时间（小时）
      const timeToDescendHours = distance / groundSpeed;
      
      // 计算下降时间（分钟）
      const timeToDescendMinutes = timeToDescendHours * 60;

      // 计算所需下降率（英尺/分钟）
      const descentRate = altitudeDifference / timeToDescendMinutes;

      // 计算下降角度（度）
      // 将距离从海里转换为英尺 (1海里 = 6076.12英尺)
      const distanceFeet = distance * 6076.12;
      const descentAngle = Math.atan(altitudeDifference / distanceFeet) * (180 / Math.PI);

      // 计算下降梯度（百分比）
      const descentGradient = (altitudeDifference / distanceFeet) * 100;

      this.setData({
        descentRate: this.formatNumber(descentRate),
        descentAngle: this.formatNumber(descentAngle),
        timeToDescend: this.formatNumber(timeToDescendMinutes),
        descentGradient: this.formatNumber(descentGradient)
      });

      wx.showToast({
        title: '下降率计算完成',
        icon: 'success'
      });
    };

    // 使用扣费管理器执行计算
    buttonChargeManager.executeCalculateWithCharge(
      'flight-calc-descent-rate',
      validateParams,
      '计算下降率',
      performCalculation
    );
  },

  // 清空功能
  clearCrosswind() {
    this.setData({
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
      headingAngle: 0
    })
  },

  clearTurn() {
    this.setData({
      turnBankAngle: '',
      turnGroundSpeed: '',
      turnRadiusMeters: '',
      turnRadiusFeet: '',
      turnRadiusNauticalMiles: '',
      turnRate: '',
      turnTime360: ''
    })
  },

  clearDescentRate() {
    this.setData({
      currentAltitude: '',
      targetAltitude: '',
      distanceNM: '',
      currentGroundSpeed: '',
      descentRate: '',
      descentAngle: '',
      timeToDescend: '',
      descentGradient: ''
    })
  },

  // 下滑线计算相关方法
  onGlideslopeAngleChange(event: any) {
    this.setData({
      glideslopeAngle: event.detail
    })
  },

  onDistanceFromThresholdChange(event: any) {
    this.setData({
      distanceFromThreshold: event.detail
    })
  },

  onAirportElevationChange(event: any) {
    this.setData({
      airportElevation: event.detail
    })
  },

  calculateGlideslope() {
    // 参数验证函数
    const validateParams = () => {
      const angle = parseFloat(this.data.glideslopeAngle);
      const distance = parseFloat(this.data.distanceFromThreshold);
      const airportElevation = parseFloat(this.data.airportElevation) || 0;

      if (isNaN(angle) || isNaN(distance)) {
        return { valid: false, message: '请输入有效的下滑角和距离' };
      }

      if (angle <= 0 || angle > 30) {
        return { valid: false, message: '下滑角应在0-30度之间' };
      }

      if (distance <= 0) {
        return { valid: false, message: '距离应大于0' };
      }

      if (airportElevation < -1000 || airportElevation > 20000) {
        return { valid: false, message: '机场标高应在-1000到20000英尺之间' };
      }

      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      const angle = parseFloat(this.data.glideslopeAngle);
      const distance = parseFloat(this.data.distanceFromThreshold);
      const airportElevation = parseFloat(this.data.airportElevation) || 0;

      // 清除之前的错误信息
      this.setData({
        glideslopeError: ''
      });

      // 计算下滑线高度
      // ILS标准：下滑线在跑道入口上方50英尺通过
      // 公式：高度 = 距离 × tan(下滑角) + 50英尺（TCH）
      // 距离单位：海里，需要转换为英尺 (1海里 = 6076.12英尺)
      const distanceFeet = distance * 6076.12;
      const angleRad = angle * Math.PI / 180;
      const thresholdCrossingHeight = 50; // TCH标准高度50英尺
      
      // AGL高度：相对跑道入口的高度（包含50英尺TCH）
      const aglAltitudeFeet = distanceFeet * Math.tan(angleRad) + thresholdCrossingHeight;
      
      // QNH高度：海平面高度（AGL + 机场标高）
      const qnhAltitudeFeet = aglAltitudeFeet + airportElevation;

      this.setData({
        glideslopeAltitude: this.formatNumber(aglAltitudeFeet),
        glideslopeAbsoluteAltitude: this.formatNumber(qnhAltitudeFeet)
      });

      wx.showToast({
        title: '下滑线高度计算完成',
        icon: 'success'
      });
    };

    // 使用扣费管理器执行计算
    buttonChargeManager.executeCalculateWithCharge(
      'flight-calc-glideslope',
      validateParams,
      '计算下滑线高度',
      performCalculation
    );
  },

  clearGlideslope() {
    this.setData({
      glideslopeAngle: '3.0', // 重置为默认值
      distanceFromThreshold: '',
      airportElevation: '0', // 重置机场标高为默认值
      glideslopeAltitude: '',
      glideslopeAbsoluteAltitude: '',
      glideslopeError: ''
    })
  },

  // 数字格式化
  formatNumber(num: number): string {
    if (num >= 100) {
      return num.toFixed(0)
    } else if (num >= 10) {
      return num.toFixed(1)
    } else {
      return num.toFixed(2)
    }
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '飞行工具箱 - 飞行速算',
      desc: '专业飞行速算工具，支持下降率、下滑线、侧风分量、转弯半径和绕飞耗油计算',
      path: '/pages/flight-calc/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行速算工具',
      path: '/pages/flight-calc/index'
    }
  },
  
  // 绕飞耗油计算相关方法
  onDetourDistanceChange(event: any) {
    this.setData({
      detourDistance: event.detail
    })
  },

  onDetourGroundSpeedChange(event: any) {
    this.setData({
      detourGroundSpeed: event.detail
    })
  },

  onDetourFuelConsumptionChange(event: any) {
    this.setData({
      detourFuelConsumption: event.detail
    })
  },

  calculateDetourFuel() {
    // 参数验证函数
    const validateParams = () => {
      const { detourDistance, detourGroundSpeed, detourFuelConsumption } = this.data;
      
      if (!detourDistance || !detourGroundSpeed || !detourFuelConsumption) {
        return { valid: false, message: '请填写所有必需参数' };
      }
      
      const distance = parseFloat(detourDistance);
      const speed = parseFloat(detourGroundSpeed);
      const consumption = parseFloat(detourFuelConsumption);
      
      if (distance <= 0 || speed <= 0 || consumption <= 0) {
        return { valid: false, message: '所有参数必须为正数' };
      }
      
      if (speed > 1000) {
        return { valid: false, message: '地速不能超过1000节' };
      }
      
      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      this.performDetourFuelCalculation();
    };

    // 使用扣费管理器执行计算
    buttonChargeManager.executeCalculateWithCharge(
      'flight-calc-detour-fuel',
      validateParams,
      '绕飞耗油计算',
      performCalculation
    );
  },

  // 分离出来的实际绕飞耗油计算逻辑
  performDetourFuelCalculation() {
    const { detourDistance, detourGroundSpeed, detourFuelConsumption } = this.data
    
    // 清除之前的结果和错误
    this.setData({
      detourFuelResult: '',
      detourTimeResult: '',
      detourError: '',
      detourCalculationDetails: ''
    })
    
    const distance = parseFloat(detourDistance)
    const speed = parseFloat(detourGroundSpeed)
    const consumption = parseFloat(detourFuelConsumption)
    
    try {
      // 计算绕飞总距离（往返）
      const totalDetourDistance = distance * 2
      
      // 计算绕飞时间（小时）
      const detourTimeHours = totalDetourDistance / speed
      
      // 计算额外燃油消耗（千克）
      const extraFuelKg = detourTimeHours * consumption
      
      // 格式化结果
      const timeMinutes = Math.round(detourTimeHours * 60)
      const timeHours = Math.floor(timeMinutes / 60)
      const remainingMinutes = timeMinutes % 60
      
      let timeDisplay = ''
      if (timeHours > 0) {
        timeDisplay = `${timeHours}小时${remainingMinutes}分钟`
      } else {
        timeDisplay = `${remainingMinutes}分钟`
      }
      
      const calculationDetails = `绕飞总距离：${totalDetourDistance} 海里\n绕飞时间：${timeDisplay}\n额外燃油消耗：${Math.round(extraFuelKg)} 千克`
      
      this.setData({
        detourFuelResult: `${Math.round(extraFuelKg)} 千克`,
        detourTimeResult: timeDisplay,
        detourCalculationDetails: calculationDetails
      })
      
    } catch (error) {
      console.error('绕飞耗油计算错误:', error)
      this.setData({
        detourError: '计算过程中发生错误，请检查输入参数'
      })
    }
  },

  clearDetourFuel() {
    this.setData({
      detourDistance: '',
      detourGroundSpeed: '',
      detourFuelConsumption: '',
      detourFuelResult: '',
      detourTimeResult: '',
      detourError: '',
      detourCalculationDetails: ''
    })
  },
}) 