// 飞行速算页面
// 工具管理器将在需要时动态引入
const pointsManagerUtil = require('../../utils/points-manager.js');

Page({
  data: {
    // 🎯 基于Context7最佳实践：全局主题状态
    isDarkMode: false,
    
    // 新增：模块选择状态
    selectedModule: '', // 当前选中的模块：descent, crosswind, turn, glideslope, detour
    
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
    
    // 🎯 基于Context7最佳实践：罗盘度数显示
    compassNorth: '000',
    compassEast: '090', 
    compassSouth: '180',
    compassWest: '270',
    trackAngle: 0, // 航迹指针角度（数值）
    
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

    // 🎯 基于Context7最佳实践：改进的绕飞耗油计算相关
    detourDistance: '',        // 申请偏离航路距离（海里）
    detourGroundSpeed: '',     // 地速（节）
    detourFuelConsumption: '', // 油耗（KG/H）
    detourDepartureAngle: '30',    // 偏航角度（度），默认30°
    detourReturnAngle: '30',       // 返回角度（度），默认30°
    detourFuelResult: '',      // 绕飞耗油结果
    detourTimeResult: '',      // 绕飞时间结果
    detourError: '',           // 错误信息
    detourCalculationDetails: '',
    
    // 🎯 新增：详细的绕飞几何计算结果
    detourActualDistance: '',      // 实际多飞距离
    detourDepartureSegment: '',    // 偏航段距离
    detourReturnSegment: '',       // 返回段距离
    detourDirectDistance: '',      // 原直线距离


  },

  onLoad() {
    // 🎯 积分检查：飞行速算需要1积分
    this.checkAndConsumePoints('flight-calc', () => {
      // 🎯 新增：初始化全局主题管理器
      try {
        const themeManager = require('../../utils/theme-manager.js');
        this.themeCleanup = themeManager.initPageTheme(this);
        console.log('🌙 飞行速算页面主题初始化完成');
      } catch (error) {
        console.warn('⚠️ 主题管理器初始化失败:', error);
      }
    });
  },

  onUnload() {
    // 🎯 新增：清理主题监听器
    if (this.themeCleanup && typeof this.themeCleanup === 'function') {
      try {
        this.themeCleanup();
        console.log('🌙 飞行速算页面主题监听器已清理');
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
    // 参数验证
    const tas = parseFloat(this.data.crosswindTrueAirspeed);
    const heading = parseFloat(this.data.crosswindHeading);
    const windDir = this.data.crosswindDirection;
    const windSpd = parseFloat(this.data.crosswindSpeed);
    
    if (isNaN(tas) || isNaN(heading) || isNaN(windSpd)) {
      wx.showToast({
        title: '请输入有效的真空速、航向、风向和风速',
        icon: 'none'
      });
      return;
    }
    
    // 检查风向输入
    const windDirNum = parseFloat(windDir);
    if (isNaN(windDirNum)) {
      const windDirStr = windDir.toUpperCase();
      if (windDirStr !== 'L' && windDirStr !== 'LEFT' && windDirStr !== 'R' && windDirStr !== 'RIGHT') {
        wx.showToast({
          title: '风向请输入度数(0-360)或L/R',
          icon: 'none'
        });
        return;
      }
    }

    // 直接执行计算
    this.performCrosswindCalculation();
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
    
    // 🎯 基于Context7最佳实践：修复风向罗盘角度计算
    // 确保角度值在0-360度范围内，并格式化为3位数字符串
    const normalizeAngle = (angle: number): number => {
      while (angle >= 360) angle -= 360;
      while (angle < 0) angle += 360;
      return angle;
    };

    const formatAngle = (angle: number): string => {
      const rounded = Math.round(normalizeAngle(angle)).toString();
      // 🎯 修复ES兼容性：使用传统方法格式化为3位数
      if (rounded.length === 1) return '00' + rounded;
      if (rounded.length === 2) return '0' + rounded;
      return rounded;
    };

    // 计算罗盘上各个方向的角度显示
    const headingFormatted = formatAngle(heading);
    const windDirFormatted = formatAngle(windDirForCalculation);
    const trackFormatted = formatAngle(track);

    console.log('🧭 风向罗盘角度调试信息:');
    console.log(`航向: ${heading}° -> ${headingFormatted}`);
    console.log(`风向输入: ${windDirForCalculation}° (风的来向)`);
    console.log(`风向显示: ${windDirFormatted}° (应该与输入一致)`); 
    console.log(`航迹: ${track}° -> ${trackFormatted}`);
    console.log(`风向角差: ${windAngle}°`);
    console.log(`偏流角: ${driftAngle}°`);

    // 🎯 计算罗盘四个方向的度数显示
    const compassNorth = formatAngle(heading);
    const compassEast = formatAngle(heading + 90);
    const compassSouth = formatAngle(heading + 180);
    const compassWest = formatAngle(heading + 270);
    
    this.setData({
      crosswindComponent: crosswindMagnitude.toFixed(1),
      headwindComponent: headwindComponent.toFixed(1),
      crosswindDisplayText: crosswindDisplayText,
      headwindDisplayText: headwindDisplayText,
      driftAngle: driftAngle.toFixed(1),
      groundSpeed: groundSpeed.toFixed(1),
      track: trackFormatted,
      // 🎯 修复：使用正确的角度值用于CSS transform
      windAngle: normalizeAngle(windDirForCalculation), // 风向指针的角度
      headingAngle: normalizeAngle(heading), // 航向指针的角度
      trackAngle: normalizeAngle(track), // 🎯 新增：航迹指针的角度（数值）
      // 🎯 新增：罗盘度数显示
      compassNorth: compassNorth,
      compassEast: compassEast,
      compassSouth: compassSouth,
      compassWest: compassWest
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
    // 参数验证
    const bankAngle = parseFloat(this.data.turnBankAngle);
    const groundSpeed = parseFloat(this.data.turnGroundSpeed);

    if (isNaN(bankAngle) || isNaN(groundSpeed)) {
      wx.showToast({
        title: '请输入有效的坡度角和地速',
        icon: 'none'
      });
      return;
    }

    if (bankAngle <= 0 || bankAngle >= 90) {
      wx.showToast({
        title: '坡度角应在0-90度之间',
        icon: 'none'
      });
      return;
    }

    if (groundSpeed <= 0) {
      wx.showToast({
        title: '地速应大于0',
        icon: 'none'
      });
      return;
    }

    // 直接执行计算
    this.performTurnRadiusCalculation();
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
    // 参数验证
    const currentAlt = parseFloat(this.data.currentAltitude);
    const targetAlt = parseFloat(this.data.targetAltitude);
    const distance = parseFloat(this.data.distanceNM);
    const groundSpeed = parseFloat(this.data.currentGroundSpeed);

    if (isNaN(currentAlt) || isNaN(targetAlt) || isNaN(distance) || isNaN(groundSpeed)) {
      wx.showToast({
        title: '请输入有效的高度、距离和地速',
        icon: 'none'
      });
      return;
    }

    if (currentAlt <= targetAlt) {
      wx.showToast({
        title: '当前高度应大于目标高度',
        icon: 'none'
      });
      return;
    }

    if (distance <= 0) {
      wx.showToast({
        title: '距离应大于0',
        icon: 'none'
      });
      return;
    }

    if (groundSpeed <= 0) {
      wx.showToast({
        title: '地速应大于0',
        icon: 'none'
      });
      return;
    }

    // 直接执行计算逻辑
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
      headingAngle: 0,
      trackAngle: 0,
      // 🎯 重置罗盘度数显示
      compassNorth: '000',
      compassEast: '090',
      compassSouth: '180', 
      compassWest: '270'
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
    // 参数验证
    const angle = parseFloat(this.data.glideslopeAngle);
    const distance = parseFloat(this.data.distanceFromThreshold);
    const airportElevation = parseFloat(this.data.airportElevation) || 0;

    if (isNaN(angle) || isNaN(distance)) {
      wx.showToast({
        title: '请输入有效的下滑角和距离',
        icon: 'none'
      });
      return;
    }

    if (angle <= 0 || angle > 30) {
      wx.showToast({
        title: '下滑角应在0-30度之间',
        icon: 'none'
      });
      return;
    }

    if (distance <= 0) {
      wx.showToast({
        title: '距离应大于0',
        icon: 'none'
      });
      return;
    }

    if (airportElevation < -1000 || airportElevation > 20000) {
      wx.showToast({
        title: '机场标高应在-1000到20000英尺之间',
        icon: 'none'
      });
      return;
    }

    // 清除之前的错误信息
    this.setData({
      glideslopeError: ''
    });

    // 直接执行计算逻辑
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
      path: '/packageO/flight-calc/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行速算工具',
      path: '/packageO/flight-calc/index'
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

  // 🎯 基于Context7最佳实践：新增角度输入处理方法
  onDetourDepartureAngleChange(event: any) {
    this.setData({
      detourDepartureAngle: event.detail
    })
  },

  onDetourReturnAngleChange(event: any) {
    this.setData({
      detourReturnAngle: event.detail
    })
  },

  calculateDetourFuel() {
    // 🎯 基于Context7最佳实践：改进的参数验证
    const { detourDistance, detourGroundSpeed, detourFuelConsumption, detourDepartureAngle, detourReturnAngle } = this.data;
    
    if (!detourDistance || !detourGroundSpeed || !detourFuelConsumption || !detourDepartureAngle || !detourReturnAngle) {
      wx.showToast({
        title: '请填写所有必需参数',
        icon: 'none'
      });
      return;
    }
    
    const distance = parseFloat(detourDistance);
    const speed = parseFloat(detourGroundSpeed);
    const consumption = parseFloat(detourFuelConsumption);
    const departureAngle = parseFloat(detourDepartureAngle);
    const returnAngle = parseFloat(detourReturnAngle);
    
    if (distance <= 0 || speed <= 0 || consumption <= 0) {
      wx.showToast({
        title: '距离、地速和油耗必须为正数',
        icon: 'none'
      });
      return;
    }
    
    if (departureAngle <= 0 || departureAngle > 90 || returnAngle <= 0 || returnAngle > 90) {
      wx.showToast({
        title: '偏航角度和返回角度必须大于0°且不超过90°',
        icon: 'none'
      });
      return;
    }
    
    if (speed > 1000) {
      wx.showToast({
        title: '地速不能超过1000节',
        icon: 'none'
      });
      return;
    }
    
    if (distance > 500) {
      wx.showToast({
        title: '申请偏离航路距离不能超过500海里',
        icon: 'none'
      });
      return;
    }

    // 直接执行计算
    this.performDetourFuelCalculation();
  },

  // 🎯 基于Context7最佳实践：改进的绕飞耗油计算逻辑
  performDetourFuelCalculation() {
    const { detourDistance, detourGroundSpeed, detourFuelConsumption, detourDepartureAngle, detourReturnAngle } = this.data
    
    // 清除之前的结果和错误
    this.setData({
      detourFuelResult: '',
      detourTimeResult: '',
      detourError: '',
      detourCalculationDetails: '',
      detourActualDistance: '',
      detourDepartureSegment: '',
      detourReturnSegment: '',
      detourDirectDistance: ''
    })
    
    const d = parseFloat(detourDistance)  // 申请偏离航路距离
    const speed = parseFloat(detourGroundSpeed)
    const consumption = parseFloat(detourFuelConsumption)
    const alpha = parseFloat(detourDepartureAngle) * Math.PI / 180  // 转换为弧度
    const beta = parseFloat(detourReturnAngle) * Math.PI / 180      // 转换为弧度
    
    try {
      // 🎯 基于正确几何学原理的绕飞距离计算
      
      // 1. 计算偏航段距离：d / sin(α)
      const departureSegmentDistance = d / Math.sin(alpha)
      
      // 2. 计算返回段距离：d / sin(β)  
      const returnSegmentDistance = d / Math.sin(beta)
      
      // 3. 计算原直线距离：d / tan(α) + d / tan(β)
      const directDistance = d / Math.tan(alpha) + d / Math.tan(beta)
      
      // 4. 计算实际多飞距离
      const actualDetourDistance = departureSegmentDistance + returnSegmentDistance - directDistance
      
      // 5. 计算额外绕飞时间（小时）
      const detourTimeHours = actualDetourDistance / speed
      
      // 6. 计算额外燃油消耗（千克）
      const extraFuelKg = detourTimeHours * consumption
      
      // 格式化时间显示
      const timeMinutes = Math.round(detourTimeHours * 60)
      const timeHours = Math.floor(timeMinutes / 60)
      const remainingMinutes = timeMinutes % 60
      
      let timeDisplay = ''
      if (timeHours > 0) {
        timeDisplay = `${timeHours}小时${remainingMinutes}分钟`
      } else {
        timeDisplay = `${remainingMinutes}分钟`
      }
      
      // 🎯 基于Context7最佳实践：详细的计算结果展示
      const calculationDetails = `几何计算详情：
偏航段距离：${this.formatNumber(departureSegmentDistance)} 海里
返回段距离：${this.formatNumber(returnSegmentDistance)} 海里  
原直线距离：${this.formatNumber(directDistance)} 海里
实际多飞距离：${this.formatNumber(actualDetourDistance)} 海里
额外飞行时间：${timeDisplay}
额外燃油消耗：${Math.round(extraFuelKg)} 千克

注：采用${detourDepartureAngle}°偏航 + ${detourReturnAngle}°返回的几何路径计算`
      
      this.setData({
        detourFuelResult: `${Math.round(extraFuelKg)} 千克`,
        detourTimeResult: timeDisplay,
        detourCalculationDetails: calculationDetails,
        detourActualDistance: this.formatNumber(actualDetourDistance),
        detourDepartureSegment: this.formatNumber(departureSegmentDistance),
        detourReturnSegment: this.formatNumber(returnSegmentDistance),
        detourDirectDistance: this.formatNumber(directDistance)
      })
      
      console.log('🎯 绕飞耗油计算完成:', {
        申请偏离航路距离: d,
        偏航角度: detourDepartureAngle + '°',
        返回角度: detourReturnAngle + '°', 
        偏航段距离: departureSegmentDistance.toFixed(2),
        返回段距离: returnSegmentDistance.toFixed(2),
        原直线距离: directDistance.toFixed(2),
        实际多飞距离: actualDetourDistance.toFixed(2),
        额外燃油: Math.round(extraFuelKg) + '千克'
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
      detourDepartureAngle: '30',    // 重置为默认值
      detourReturnAngle: '30',       // 重置为默认值
      detourFuelResult: '',
      detourTimeResult: '',
      detourError: '',
      detourCalculationDetails: '',
      detourActualDistance: '',
      detourDepartureSegment: '',
      detourReturnSegment: '',
      detourDirectDistance: ''
    })
  },

  // 积分检查和消费方法
  async checkAndConsumePoints(featureId: string, callback: () => void) {
    try {
      console.log(`🎯 开始检查积分 - 功能: ${featureId}`);
      const result = await pointsManagerUtil.consumePoints(featureId, `使用${featureId}功能`);
      
      if (result.success) {
        console.log(`✅ 积分消费成功，执行功能: ${featureId}`);
        callback();
        
        if (result.message !== '该功能免费使用') {
          wx.showToast({
            title: result.message,
            icon: 'success',
            duration: 2000
          });
        }
      } else {
        console.log(`❌ 积分不足: ${featureId}`, result);
        wx.showModal({
          title: '积分不足',
          content: `飞行速算需要 ${result.requiredPoints} 积分，您当前有 ${result.currentPoints} 积分。`,
          showCancel: true,
          cancelText: '返回',
          confirmText: '获取积分',
          success: (res) => {
            if (res.cancel) {
              wx.navigateBack();
            } else {
              // 跳转到积分获取页面
              wx.switchTab({
                url: '/pages/others/index'
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('💥 积分检查失败:', error);
      // 错误回退：直接执行功能，确保用户体验
      callback();
      
      wx.showToast({
        title: '积分系统暂时不可用，功能正常开放',
        icon: 'none',
        duration: 3000
      });
    }
  },

}) 