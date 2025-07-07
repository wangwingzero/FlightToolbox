// 飞行计算页面 - 整合飞行速算、特殊计算、常用换算三个页面
import { calculateColdTempCorrection, ColdTempInput, CorrectionResult } from '../../utils/coldTempCalculator';

Page({
  data: {
    // 🎯 全局主题状态
    isDarkMode: false,
    
    // 页面导航状态
    selectedModule: '', // 当前选中的模块
    
    // 模块标题
    moduleTitle: '',
    

    
    // 飞行速算模块数据
    flightCalcData: {
      // 下降率计算
      descent: {
        currentAltitude: '',
        targetAltitude: '',
        distanceNM: '',
        currentGroundSpeed: '',
        descentRate: '',
        descentAngle: '',
        timeToDescend: '',
        descentGradient: ''
      },
      
      // 侧风分量计算
      crosswind: {
        crosswindTrueAirspeed: '',
        crosswindHeading: '',
        crosswindDirection: '',
        crosswindSpeed: '',
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
        compassNorth: '000',
        compassEast: '090',
        compassSouth: '180',
        compassWest: '270'
      },
      
      // 转弯半径计算
      turn: {
        turnBankAngle: '',
        turnGroundSpeed: '',
        turnRadiusMeters: '',
        turnRadiusFeet: '',
        turnRadiusNauticalMiles: '',
        turnRate: '',
        turnTime360: ''
      },
      
      // 下滑线高度计算
      glideslope: {
        glideslopeAngle: '3.0',
        distanceFromThreshold: '',
        airportElevation: '0',
        glideslopeAltitude: '',
        glideslopeAbsoluteAltitude: '',
        glideslopeError: ''
      },
      
      // 绕飞耗油计算
      detour: {
        detourDistance: '',
        detourGroundSpeed: '',
        detourFuelConsumption: '',
        detourDepartureAngle: '30',
        detourReturnAngle: '30',
        detourFuelResult: '',
        detourTimeResult: '',
        detourError: '',
        detourCalculationDetails: '',
        detourActualDistance: '',
        detourDepartureSegment: '',
        detourReturnSegment: '',
        detourDirectDistance: ''
      }
    },
    
    // 特殊计算模块数据
    aviationCalcData: {
      // 温度修正计算相关
      coldTemp: {
        airportElevation: '',
        airportTemperature: '',
        ifAltitude: '',
        fafAltitude: '',
        daAltitude: '',
        missedAltitude: '',
        otherAltitude: '',
        isFafPoint: false,
        fafDistance: '8.0',
        result: null,
        error: ''
      },

      // 梯度计算
      gradient: {
        gradientInput: '',
        groundSpeedInput: '',
        verticalSpeedInput: '',
        angleInput: '',
        gradientResult: '',
        verticalSpeedResult: '',
        angleResult: ''
      },

      // PITCH PITCH 计算相关
      pitch: {
        aircraftModel: 'A320_NO_LIP',
        aircraftModelDisplay: 'A320 (未安装LIP)',
        radioHeight: '',
        currentPitch: '',
        pitchRate: '',
        result: false,
        predictivePitch: '',
        threshold: '',
        warningStatus: '',
        shouldTrigger: false
      },

      // ACR-PCR计算相关
      acr: {
        selectedManufacturer: '',
        selectedModel: '',
        selectedVariant: '',
        selectedVariantDisplay: '',
        aircraftMass: '',
        massInputEnabled: false, // 是否允许用户输入重量
        massDisplayLabel: '飞机重量', // 重量字段显示标签
        
        // PCR参数
        pcrNumber: '',
        pavementType: '',
        pavementTypeDisplay: '',
        subgradeStrength: '',
        subgradeStrengthDisplay: '',
        tirePressure: 'W',
        tirePressureDisplay: 'W - 无限制 (Unlimited)',
        evaluationMethod: 'T',
        evaluationMethodDisplay: 'T - 技术评估 (Technical evaluation)',
        
        result: null,
        error: '',
        dataLoaded: false
      },

      // GPWS告警模拟
      gpws: {
        activeMode: 'mode1',
        
        // Mode 1 参数
        mode1: {
          ra: '',
          descentRate: '', // 用户输入的下降率
          thresholdResult: null // 阈值计算结果
        },

        // Mode 2 参数
        mode2: {
          ra: '',
          tcr: '',
          airspeed: '',
          flapsInLanding: false,
          gearDown: false, // 新增：起落架状态
          ilsMode: false, // 新增：ILS进近模式
          tadActive: false,
          result: null
        },

        // Mode 3 参数 - 判断是否触发DON'T SINK警告
        mode3: {
          ra: '',
          altitudeLoss: '', // 实际的高度损失
          result: null
        },

        // Mode 4 参数 - 分类选择设计
        mode4: {
          subMode: '4A', // 子模式选择：4A, 4B, 4C
          subModeDisplayName: 'Mode 4A - 巡航进近（起落架收上）', // 显示名称
          ra: '',
          airspeed: '',
          maxRA: '', // 仅Mode 4C需要
          
          // Mode 4A 参数
          mode4A_GearUp: true, // 4A要求起落架收上
          mode4A_FlapsInLanding: false, // 4A要求襟翼不在着陆构型
          mode4A_LdgConf3Selected: true, // MCDU LDG CONF 3选择 - 默认已选择
          mode4A_TADHighIntegrity: false, // TAD高完整性
          mode4A_TCFEnabled: false, // TCF启用
          mode4A_OverflightDetected: false, // 飞越检测
          
          // Mode 4B 参数
          mode4B_GearDown: true, // 4B起落架放下
          mode4B_FlapsInLanding: false, // 4B襟翼不在着陆构型
          mode4B_TADHighIntegrity: false, // TAD高完整性
          mode4B_TCFEnabled: false, // TCF启用
          mode4B_OverflightDetected: false, // 4B飞越检测
          
          // Mode 4C 参数 (起飞阶段)
          mode4C_TakeoffPhase: true, // 4C起飞阶段标志
          mode4C_GearOrFlapsDown: false, // 起落架或襟翼放下
          
          result: null
        },

        // Mode 5 参数
        mode5: {
          ra: '',
          gsDeviation: '',
          result: null
        }
      }
    },
    
    // 常用换算模块数据
    unitConverterData: {
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
      qfeResult: ''
    },

    // 选择器相关状态
    showAircraftModelPicker: false,
    aircraftModelActions: [
      { name: 'A320 (未安装LIP)', value: 'A320_NO_LIP' },
      { name: 'A320 (已安装LIP)', value: 'A320_LIP' },
      { name: 'A321', value: 'A321' },
      { name: 'A330-200', value: 'A330-200' },
      { name: 'A330-300', value: 'A330-300' }
    ],

    // ACR选择器相关
    showAcrManufacturerPicker: false,
    showAcrModelPicker: false,
    showAcrVariantPicker: false,
    acrManufacturerActions: [],
    acrModelActions: [],
    acrVariantActions: [],

    // PCR参数选择器
    showPavementTypePicker: false,
    showSubgradeStrengthPicker: false,
    showTirePressurePicker: false,
    showEvaluationMethodPicker: false,
    pavementTypeActions: [],
    subgradeStrengthActions: [],
    tirePressureActions: [],
    evaluationMethodActions: [],

    // Mode 4 子模式选择器
    showMode4SubModePicker: false,
    mode4SubModeActions: [
      { name: 'Mode 4A - 巡航进近（起落架收上，襟翼非着陆构型）', value: '4A' },
      { name: 'Mode 4B - 进近构型（起落架放下或襟翼着陆构型）', value: '4B' },
      { name: 'Mode 4C - 起飞阶段地形穿越', value: '4C' }
    ]
  },

  onLoad() {
    // 页面加载时初始化
    this.initializeData();
    
    // 初始化主题管理器
    try {
      const themeManager = require('../../utils/theme-manager.js');
      this.themeCleanup = themeManager.initPageTheme(this);
      console.log('🌙 飞行计算页面主题初始化完成');
    } catch (error) {
      console.warn('⚠️ 主题管理器初始化失败:', error);
    }
    

  },

  onShow() {
    // 页面显示时检查主题状态
    this.checkThemeStatus();
  },

  onUnload() {
    // 清理主题监听器
    if (this.themeCleanup && typeof this.themeCleanup === 'function') {
      try {
        this.themeCleanup();
        console.log('🌙 飞行计算页面主题监听器已清理');
      } catch (error) {
        console.warn('⚠️ 清理主题监听器时出错:', error);
      }
    }
  },

  // 初始化数据
  initializeData() {
    // 初始化数据
  },

  // 检查主题状态
  checkThemeStatus() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
  },




  // 选择模块
  selectModule(e: any) {
    const module = e.currentTarget.dataset.module;
    
    // 跳转到独立子页面的模块
    const independentModules = ['descent', 'crosswind', 'turn', 'glideslope', 'detour', 'gradient', 'distance', 'speed', 'temperature', 'weight', 'pressure', 'isa'];
    if (independentModules.includes(module)) {
      wx.navigateTo({
        url: `/packageO/flight-calc-modules/${module}/index`
      });
      return;
    }
    
    // 其他模块保持原有浮窗逻辑
    const moduleTitle = this.getModuleTitle(module);
    this.setData({
      selectedModule: module,
      moduleTitle
    });

    // 根据模块类型进行初始化
    if (module === 'acr' && !this.data.aviationCalcData.acr.dataLoaded) {
      this.initACRData();
    } else if (module === 'gpws') {
      // 初始化GPWS为Mode 1
      this.setData({ 
        'aviationCalcData.gpws.activeMode': 'mode1' 
      });
    }
  },

  // 返回到主页面
  backToModules() {
    this.setData({
      selectedModule: '',
      moduleTitle: ''
    });
  },

  // 获取模块标题
  getModuleTitle(module: string): string {
    const titles: { [key: string]: string } = {
      // 飞行速算
      'descent': '📉 下降率计算',
      'crosswind': '🌪️ 侧风分量',
      'turn': '🔄 转弯半径',
      'glideslope': '📐 下滑线高度',
      'detour': '🛣️ 绕飞耗油',
      
      // 特殊计算
      'coldTemp': '🌡️ 温度修正',
      'gradient': '📐 梯度计算',
      'pitch': '⚠️ PITCH警告',
      'acr': '🛬 ACR-PCR',
      'gpws': '🚨 GPWS模拟',
      
      // 常用换算
      'distance': '📏 距离换算',
      'speed': '⚡ 速度换算',
      'temperature': '🌡️ 温度换算',
      'weight': '⚖️ 重量换算',
      'pressure': '🌪️ 气压换算',
      'isa': '🌡️ ISA温度'
    };
    
    return titles[module] || module;
  },



  // ========== 飞行速算模块计算方法 ==========
  
  // 下降率计算相关方法
  onCurrentAltitudeChange(event: any) {
    this.setData({
      'flightCalcData.descent.currentAltitude': event.detail
    });
  },

  onTargetAltitudeChange(event: any) {
    this.setData({
      'flightCalcData.descent.targetAltitude': event.detail
    });
  },

  onDistanceNMChange(event: any) {
    this.setData({
      'flightCalcData.descent.distanceNM': event.detail
    });
  },

  onCurrentGroundSpeedChange(event: any) {
    this.setData({
      'flightCalcData.descent.currentGroundSpeed': event.detail
    });
  },

  calculateDescentRate() {
    // 参数验证函数
    const validateParams = () => {
      const descentData = this.data.flightCalcData.descent;
      const currentAlt = parseFloat(descentData.currentAltitude);
      const targetAlt = parseFloat(descentData.targetAltitude);
      const distance = parseFloat(descentData.distanceNM);
      const groundSpeed = parseFloat(descentData.currentGroundSpeed);

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
      const descentData = this.data.flightCalcData.descent;
      const currentAlt = parseFloat(descentData.currentAltitude);
      const targetAlt = parseFloat(descentData.targetAltitude);
      const distance = parseFloat(descentData.distanceNM);
      const groundSpeed = parseFloat(descentData.currentGroundSpeed);

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
        'flightCalcData.descent.descentRate': this.formatNumber(descentRate),
        'flightCalcData.descent.descentAngle': this.formatNumber(descentAngle),
        'flightCalcData.descent.timeToDescend': this.formatNumber(timeToDescendMinutes),
        'flightCalcData.descent.descentGradient': this.formatNumber(descentGradient)
      });

      wx.showToast({
        title: '下降率计算完成',
        icon: 'success'
      });
    };

    // 使用扣费管理器执行计算
    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'flight-calc-descent-rate',
      validateParams,
      '计算下降率',
      performCalculation
    );
  },

  // 侧风分量计算相关方法
  onCrosswindTrueAirspeedChange(event: any) {
    this.setData({
      'flightCalcData.crosswind.crosswindTrueAirspeed': event.detail
    });
  },

  onCrosswindHeadingChange(event: any) {
    this.setData({
      'flightCalcData.crosswind.crosswindHeading': event.detail
    });
  },

  onCrosswindDirectionChange(event: any) {
    this.setData({
      'flightCalcData.crosswind.crosswindDirection': event.detail
    });
  },

  onCrosswindSpeedChange(event: any) {
    this.setData({
      'flightCalcData.crosswind.crosswindSpeed': event.detail
    });
  },

  calculateCrosswind() {
    // 参数验证函数
    const validateParams = () => {
      const crosswindData = this.data.flightCalcData.crosswind;
      const tas = parseFloat(crosswindData.crosswindTrueAirspeed);
      const heading = parseFloat(crosswindData.crosswindHeading);
      const windDir = crosswindData.crosswindDirection;
      const windSpd = parseFloat(crosswindData.crosswindSpeed);
      
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
    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'flight-calc-crosswind',
      validateParams,
      '侧风分量计算',
      performCalculation
    );
  },

  // 分离出来的实际侧风计算逻辑
  performCrosswindCalculation() {
    const crosswindData = this.data.flightCalcData.crosswind;
    const tas = parseFloat(crosswindData.crosswindTrueAirspeed);
    const heading = parseFloat(crosswindData.crosswindHeading);
    let windDir = parseFloat(crosswindData.crosswindDirection);
    const windSpd = parseFloat(crosswindData.crosswindSpeed);
    
    // 处理字母输入的风向（仅用于计算，不改变显示）
    let windDirForCalculation = windDir;
    if (isNaN(windDir)) {
      const windDirStr = crosswindData.crosswindDirection.toUpperCase();
      if (windDirStr === 'L' || windDirStr === 'LEFT') {
        windDirForCalculation = 270; // 西风
      } else if (windDirStr === 'R' || windDirStr === 'RIGHT') {
        windDirForCalculation = 90; // 东风
      }
    } else {
      windDirForCalculation = windDir;
    }

    // 计算风向与航向的夹角
    let windAngle = windDirForCalculation - heading;
    
    // 标准化角度到 -180 到 180 度范围
    while (windAngle > 180) windAngle -= 360;
    while (windAngle < -180) windAngle += 360;
    
    // 计算侧风和顶风分量
    const crosswindComponent = windSpd * Math.sin(windAngle * Math.PI / 180);
    const headwindComponent = windSpd * Math.cos(windAngle * Math.PI / 180);
    
    // 确定侧风方向（左侧风或右侧风）
    const crosswindDir = crosswindComponent > 0 ? 'R' : 'L';
    const crosswindMagnitude = Math.abs(crosswindComponent);
    
    // 计算地速
    const groundSpeed = Math.sqrt(Math.pow(tas - headwindComponent, 2) + Math.pow(crosswindComponent, 2));
    
    // 计算偏流角
    const driftAngle = Math.atan2(crosswindComponent, tas - headwindComponent) * 180 / Math.PI;
    
    // 计算实际航迹
    let track = heading + driftAngle;
    
    // 标准化航迹到0-360度范围
    while (track >= 360) track -= 360;
    while (track < 0) track += 360;
    
    // 生成显示文本
    const crosswindDisplayText = crosswindMagnitude === 0 ? 
      '无侧风 0 节' : 
      `${crosswindDir === 'L' ? '左' : '右'}侧风 ${crosswindMagnitude.toFixed(1)} 节`;
    
    const headwindDisplayText = Math.abs(headwindComponent) < 0.1 ? 
      '无顶风/顺风 0 节' : 
      `${headwindComponent > 0 ? '顶风' : '顺风'} ${Math.abs(headwindComponent).toFixed(1)} 节`;
    
    // 确保角度值在0-360度范围内，并格式化为3位数字符串
    const normalizeAngle = (angle: number): number => {
      while (angle >= 360) angle -= 360;
      while (angle < 0) angle += 360;
      return angle;
    };

    const formatAngle = (angle: number): string => {
      const rounded = Math.round(normalizeAngle(angle)).toString();
      // 修复ES兼容性：使用传统方法格式化为3位数
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

    // 计算罗盘四个方向的度数显示
    const compassNorth = formatAngle(heading);
    const compassEast = formatAngle(heading + 90);
    const compassSouth = formatAngle(heading + 180);
    const compassWest = formatAngle(heading + 270);
    
    this.setData({
      'flightCalcData.crosswind.crosswindComponent': crosswindMagnitude.toFixed(1),
      'flightCalcData.crosswind.headwindComponent': headwindComponent.toFixed(1),
      'flightCalcData.crosswind.crosswindDisplayText': crosswindDisplayText,
      'flightCalcData.crosswind.headwindDisplayText': headwindDisplayText,
      'flightCalcData.crosswind.driftAngle': driftAngle.toFixed(1),
      'flightCalcData.crosswind.groundSpeed': groundSpeed.toFixed(1),
      'flightCalcData.crosswind.track': trackFormatted,
      // 修复：使用正确的角度值用于CSS transform
      'flightCalcData.crosswind.windAngle': normalizeAngle(windDirForCalculation), // 风向指针的角度
      'flightCalcData.crosswind.headingAngle': normalizeAngle(heading), // 航向指针的角度
      'flightCalcData.crosswind.trackAngle': normalizeAngle(track), // 新增：航迹指针的角度（数值）
      // 新增：罗盘度数显示
      'flightCalcData.crosswind.compassNorth': compassNorth,
      'flightCalcData.crosswind.compassEast': compassEast,
      'flightCalcData.crosswind.compassSouth': compassSouth,
      'flightCalcData.crosswind.compassWest': compassWest
    });
  },

  // 转弯半径计算相关方法
  onTurnBankAngleChange(event: any) {
    this.setData({
      'flightCalcData.turn.turnBankAngle': event.detail
    });
  },

  onTurnGroundSpeedChange(event: any) {
    this.setData({
      'flightCalcData.turn.turnGroundSpeed': event.detail
    });
  },

  calculateTurnRadius() {
    // 参数验证函数
    const validateParams = () => {
      const turnData = this.data.flightCalcData.turn;
      const bankAngle = parseFloat(turnData.turnBankAngle);
      const groundSpeed = parseFloat(turnData.turnGroundSpeed);

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
    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'flight-calc-turn-radius',
      validateParams,
      '转弯半径计算',
      performCalculation
    );
  },

  // 分离出来的实际转弯半径计算逻辑
  performTurnRadiusCalculation() {
    const turnData = this.data.flightCalcData.turn;
    const bankAngle = parseFloat(turnData.turnBankAngle);
    const groundSpeed = parseFloat(turnData.turnGroundSpeed);

    // 转弯半径计算公式：R = V² / (g × tan(θ))
    // V: 地速 (m/s)
    // g: 重力加速度 (9.81 m/s²)
    // θ: 坡度角 (弧度)
    
    // 将地速从节转换为米/秒 (1节 = 0.514444 m/s)
    const groundSpeedMs = groundSpeed * 0.514444;
    
    // 将坡度角从度转换为弧度
    const bankAngleRad = bankAngle * Math.PI / 180;
    
    // 计算转弯半径 (米)
    const radiusMeters = (groundSpeedMs * groundSpeedMs) / (9.81 * Math.tan(bankAngleRad));
    
    // 转换为其他单位
    const radiusFeet = radiusMeters * 3.28084; // 米转英尺
    const radiusNauticalMiles = radiusMeters / 1852; // 米转海里
    
    // 计算转弯率 (度/秒)
    // 转弯率 = (g × tan(θ)) / V × (180/π)
    const turnRateDegPerSec = (9.81 * Math.tan(bankAngleRad)) / groundSpeedMs * (180 / Math.PI);
    
    // 计算360度转弯时间 (秒)
    const time360 = 360 / turnRateDegPerSec;

    this.setData({
      'flightCalcData.turn.turnRadiusMeters': this.formatNumber(radiusMeters),
      'flightCalcData.turn.turnRadiusFeet': this.formatNumber(radiusFeet),
      'flightCalcData.turn.turnRadiusNauticalMiles': this.formatNumber(radiusNauticalMiles),
      'flightCalcData.turn.turnRate': this.formatNumber(turnRateDegPerSec),
      'flightCalcData.turn.turnTime360': this.formatNumber(time360)
    });
  },

  // 下滑线高度计算相关方法
  onGlideslopeAngleChange(event: any) {
    this.setData({
      'flightCalcData.glideslope.glideslopeAngle': event.detail
    });
  },

  onDistanceFromThresholdChange(event: any) {
    this.setData({
      'flightCalcData.glideslope.distanceFromThreshold': event.detail
    });
  },

  onAirportElevationChange(event: any) {
    this.setData({
      'flightCalcData.glideslope.airportElevation': event.detail
    });
  },

  calculateGlideslope() {
    // 参数验证函数
    const validateParams = () => {
      const glideslopeData = this.data.flightCalcData.glideslope;
      const angle = parseFloat(glideslopeData.glideslopeAngle);
      const distance = parseFloat(glideslopeData.distanceFromThreshold);
      const airportElevation = parseFloat(glideslopeData.airportElevation) || 0;

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
      const glideslopeData = this.data.flightCalcData.glideslope;
      const angle = parseFloat(glideslopeData.glideslopeAngle);
      const distance = parseFloat(glideslopeData.distanceFromThreshold);
      const airportElevation = parseFloat(glideslopeData.airportElevation) || 0;

      // 清除之前的错误信息
      this.setData({
        'flightCalcData.glideslope.glideslopeError': ''
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
        'flightCalcData.glideslope.glideslopeAltitude': this.formatNumber(aglAltitudeFeet),
        'flightCalcData.glideslope.glideslopeAbsoluteAltitude': this.formatNumber(qnhAltitudeFeet)
      });

      wx.showToast({
        title: '下滑线高度计算完成',
        icon: 'success'
      });
    };

    // 使用扣费管理器执行计算
    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'flight-calc-glideslope',
      validateParams,
      '计算下滑线高度',
      performCalculation
    );
  },

  // 绕飞耗油计算相关方法
  onDetourDistanceChange(event: any) {
    this.setData({
      'flightCalcData.detour.detourDistance': event.detail
    });
  },

  onDetourGroundSpeedChange(event: any) {
    this.setData({
      'flightCalcData.detour.detourGroundSpeed': event.detail
    });
  },

  onDetourFuelConsumptionChange(event: any) {
    this.setData({
      'flightCalcData.detour.detourFuelConsumption': event.detail
    });
  },

  onDetourDepartureAngleChange(event: any) {
    this.setData({
      'flightCalcData.detour.detourDepartureAngle': event.detail
    });
  },

  onDetourReturnAngleChange(event: any) {
    this.setData({
      'flightCalcData.detour.detourReturnAngle': event.detail
    });
  },

  calculateDetourFuel() {
    // 改进的参数验证函数
    const validateParams = () => {
      const detourData = this.data.flightCalcData.detour;
      const { detourDistance, detourGroundSpeed, detourFuelConsumption, detourDepartureAngle, detourReturnAngle } = detourData;
      
      if (!detourDistance || !detourGroundSpeed || !detourFuelConsumption || !detourDepartureAngle || !detourReturnAngle) {
        return { valid: false, message: '请填写所有必需参数' };
      }
      
      const distance = parseFloat(detourDistance);
      const speed = parseFloat(detourGroundSpeed);
      const consumption = parseFloat(detourFuelConsumption);
      const departureAngle = parseFloat(detourDepartureAngle);
      const returnAngle = parseFloat(detourReturnAngle);
      
      if (distance <= 0 || speed <= 0 || consumption <= 0) {
        return { valid: false, message: '距离、地速和油耗必须为正数' };
      }
      
      if (departureAngle <= 0 || departureAngle > 90 || returnAngle <= 0 || returnAngle > 90) {
        return { valid: false, message: '偏航角度和返回角度必须大于0°且不超过90°' };
      }
      
      if (speed > 1000) {
        return { valid: false, message: '地速不能超过1000节' };
      }
      
      if (distance > 500) {
        return { valid: false, message: '申请偏离航路距离不能超过500海里' };
      }
      
      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      this.performDetourFuelCalculation();
    };

    // 使用扣费管理器执行计算
    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'flight-calc-detour-fuel',
      validateParams,
      '绕飞耗油计算',
      performCalculation
    );
  },

  // 改进的绕飞耗油计算逻辑
  performDetourFuelCalculation() {
    const detourData = this.data.flightCalcData.detour;
    const { detourDistance, detourGroundSpeed, detourFuelConsumption, detourDepartureAngle, detourReturnAngle } = detourData;
    
    // 清除之前的结果和错误
    this.setData({
      'flightCalcData.detour.detourFuelResult': '',
      'flightCalcData.detour.detourTimeResult': '',
      'flightCalcData.detour.detourError': '',
      'flightCalcData.detour.detourCalculationDetails': '',
      'flightCalcData.detour.detourActualDistance': '',
      'flightCalcData.detour.detourDepartureSegment': '',
      'flightCalcData.detour.detourReturnSegment': '',
      'flightCalcData.detour.detourDirectDistance': ''
    });
    
    const d = parseFloat(detourDistance);  // 申请偏离航路距离
    const speed = parseFloat(detourGroundSpeed);
    const consumption = parseFloat(detourFuelConsumption);
    const alpha = parseFloat(detourDepartureAngle) * Math.PI / 180;  // 转换为弧度
    const beta = parseFloat(detourReturnAngle) * Math.PI / 180;      // 转换为弧度
    
    try {
      // 基于正确几何学原理的绕飞距离计算
      
      // 1. 计算偏航段距离：d / sin(α)
      const departureSegmentDistance = d / Math.sin(alpha);
      
      // 2. 计算返回段距离：d / sin(β)  
      const returnSegmentDistance = d / Math.sin(beta);
      
      // 3. 计算原直线距离：d / tan(α) + d / tan(β)
      const directDistance = d / Math.tan(alpha) + d / Math.tan(beta);
      
      // 4. 计算实际多飞距离
      const actualDetourDistance = departureSegmentDistance + returnSegmentDistance - directDistance;
      
      // 5. 计算额外绕飞时间（小时）
      const detourTimeHours = actualDetourDistance / speed;
      
      // 6. 计算额外燃油消耗（千克）
      const extraFuelKg = detourTimeHours * consumption;
      
      // 格式化时间显示
      const timeMinutes = Math.round(detourTimeHours * 60);
      const timeHours = Math.floor(timeMinutes / 60);
      const remainingMinutes = timeMinutes % 60;
      
      let timeDisplay = '';
      if (timeHours > 0) {
        timeDisplay = `${timeHours}小时${remainingMinutes}分钟`;
      } else {
        timeDisplay = `${remainingMinutes}分钟`;
      }
      
      // 详细的计算结果展示
      const calculationDetails = `几何计算详情：
偏航段距离：${this.formatNumber(departureSegmentDistance)} 海里
返回段距离：${this.formatNumber(returnSegmentDistance)} 海里  
原直线距离：${this.formatNumber(directDistance)} 海里
实际多飞距离：${this.formatNumber(actualDetourDistance)} 海里
额外飞行时间：${timeDisplay}
额外燃油消耗：${Math.round(extraFuelKg)} 千克

注：采用${detourDepartureAngle}°偏航 + ${detourReturnAngle}°返回的几何路径计算`;
      
      this.setData({
        'flightCalcData.detour.detourFuelResult': `${Math.round(extraFuelKg)} 千克`,
        'flightCalcData.detour.detourTimeResult': timeDisplay,
        'flightCalcData.detour.detourCalculationDetails': calculationDetails,
        'flightCalcData.detour.detourActualDistance': this.formatNumber(actualDetourDistance),
        'flightCalcData.detour.detourDepartureSegment': this.formatNumber(departureSegmentDistance),
        'flightCalcData.detour.detourReturnSegment': this.formatNumber(returnSegmentDistance),
        'flightCalcData.detour.detourDirectDistance': this.formatNumber(directDistance)
      });
      
      console.log('🎯 绕飞耗油计算完成:', {
        申请偏离航路距离: d,
        偏航角度: detourDepartureAngle + '°',
        返回角度: detourReturnAngle + '°', 
        偏航段距离: departureSegmentDistance.toFixed(2),
        返回段距离: returnSegmentDistance.toFixed(2),
        原直线距离: directDistance.toFixed(2),
        实际多飞距离: actualDetourDistance.toFixed(2),
        额外燃油: Math.round(extraFuelKg) + '千克'
      });
      
    } catch (error) {
      console.error('绕飞耗油计算错误:', error);
      this.setData({
        'flightCalcData.detour.detourError': '计算过程中发生错误，请检查输入参数'
      });
    }
  },

  // 清空功能
  clearCrosswind() {
    this.setData({
      'flightCalcData.crosswind.crosswindHeading': '',
      'flightCalcData.crosswind.crosswindDirection': '',
      'flightCalcData.crosswind.crosswindSpeed': '',
      'flightCalcData.crosswind.crosswindTrueAirspeed': '',
      'flightCalcData.crosswind.crosswindComponent': '',
      'flightCalcData.crosswind.headwindComponent': '',
      'flightCalcData.crosswind.crosswindDisplayText': '',
      'flightCalcData.crosswind.headwindDisplayText': '',
      'flightCalcData.crosswind.driftAngle': '',
      'flightCalcData.crosswind.groundSpeed': '',
      'flightCalcData.crosswind.track': '',
      'flightCalcData.crosswind.windAngle': 0,
      'flightCalcData.crosswind.headingAngle': 0,
      'flightCalcData.crosswind.trackAngle': 0,
      // 重置罗盘度数显示
      'flightCalcData.crosswind.compassNorth': '000',
      'flightCalcData.crosswind.compassEast': '090',
      'flightCalcData.crosswind.compassSouth': '180',
      'flightCalcData.crosswind.compassWest': '270'
    });
  },

  clearTurn() {
    this.setData({
      'flightCalcData.turn.turnBankAngle': '',
      'flightCalcData.turn.turnGroundSpeed': '',
      'flightCalcData.turn.turnRadiusMeters': '',
      'flightCalcData.turn.turnRadiusFeet': '',
      'flightCalcData.turn.turnRadiusNauticalMiles': '',
      'flightCalcData.turn.turnRate': '',
      'flightCalcData.turn.turnTime360': ''
    });
  },

  clearDescentRate() {
    this.setData({
      'flightCalcData.descent.currentAltitude': '',
      'flightCalcData.descent.targetAltitude': '',
      'flightCalcData.descent.distanceNM': '',
      'flightCalcData.descent.currentGroundSpeed': '',
      'flightCalcData.descent.descentRate': '',
      'flightCalcData.descent.descentAngle': '',
      'flightCalcData.descent.timeToDescend': '',
      'flightCalcData.descent.descentGradient': ''
    });
  },

  clearGlideslope() {
    this.setData({
      'flightCalcData.glideslope.glideslopeAngle': '3.0', // 重置为默认值
      'flightCalcData.glideslope.distanceFromThreshold': '',
      'flightCalcData.glideslope.airportElevation': '0', // 重置机场标高为默认值
      'flightCalcData.glideslope.glideslopeAltitude': '',
      'flightCalcData.glideslope.glideslopeAbsoluteAltitude': '',
      'flightCalcData.glideslope.glideslopeError': ''
    });
  },

  clearDetourFuel() {
    this.setData({
      'flightCalcData.detour.detourDistance': '',
      'flightCalcData.detour.detourGroundSpeed': '',
      'flightCalcData.detour.detourFuelConsumption': '',
      'flightCalcData.detour.detourDepartureAngle': '30',    // 重置为默认值
      'flightCalcData.detour.detourReturnAngle': '30',       // 重置为默认值
      'flightCalcData.detour.detourFuelResult': '',
      'flightCalcData.detour.detourTimeResult': '',
      'flightCalcData.detour.detourError': '',
      'flightCalcData.detour.detourCalculationDetails': '',
      'flightCalcData.detour.detourActualDistance': '',
      'flightCalcData.detour.detourDepartureSegment': '',
      'flightCalcData.detour.detourReturnSegment': '',
      'flightCalcData.detour.detourDirectDistance': ''
    });
  },

  // 数字格式化
  formatNumber(num: number): string {
    if (num >= 100) {
      return num.toFixed(0);
    } else if (num >= 10) {
      return num.toFixed(1);
    } else {
      return num.toFixed(2);
    }
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '飞行工具箱 - 飞行计算',
      desc: '专业飞行计算工具，支持飞行速算、特殊计算、常用换算',
      path: '/pages/flight-calculator/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行计算工具',
      path: '/pages/flight-calculator/index'
    };
  },

  // ========== 特殊计算模块方法 ==========

  // 初始化ACR数据
  async initACRData() {
    try {
      console.log('🔄 开始初始化ACR数据...');
      
      // 显示加载状态
      this.setData({
        'aviationCalcData.acr.error': '正在加载ACR数据...'
      });
      
      // 动态导入ACR管理器
      const acrManager = require('../../utils/acr-manager.js');
      const acrData = await acrManager.loadACRData();
      console.log('📊 ACR数据加载结果:', acrData ? '成功' : '失败');
      
      // 加载制造商列表
      const manufacturers = acrManager.getManufacturers();
      console.log('🏭 制造商列表:', manufacturers);
      
      if (manufacturers.length === 0) {
        throw new Error('制造商列表为空');
      }
      
      const manufacturerActions = manufacturers.map((manufacturer) => ({
        name: manufacturer,
        value: manufacturer
      }));
      
      // 初始化PCR参数选项
      const pavementTypeActions = [
        { name: 'F - 柔性道面 (Flexible)', value: 'F' },
        { name: 'R - 刚性道面 (Rigid)', value: 'R' }
      ];
      
      const subgradeStrengthActions = [
        { name: 'A - 高强度 (High)', value: 'A' },
        { name: 'B - 中强度 (Medium)', value: 'B' },
        { name: 'C - 低强度 (Low)', value: 'C' },
        { name: 'D - 超低强度 (Ultra Low)', value: 'D' }
      ];
      
      const tirePressureActions = [
        { name: 'W - 无限制 (Unlimited)', value: 'W' },
        { name: 'X - 高压轮胎 (High pressure)', value: 'X' },
        { name: 'Y - 中压轮胎 (Medium pressure)', value: 'Y' },
        { name: 'Z - 低压轮胎 (Low pressure)', value: 'Z' }
      ];
      
      const evaluationMethodActions = [
        { name: 'T - 技术评估 (Technical evaluation)', value: 'T' },
        { name: 'U - 使用经验 (Using experience)', value: 'U' }
      ];
      
      this.setData({
        acrManufacturerActions: manufacturerActions,
        pavementTypeActions: pavementTypeActions,
        subgradeStrengthActions: subgradeStrengthActions,
        tirePressureActions: tirePressureActions,
        evaluationMethodActions: evaluationMethodActions,
        'aviationCalcData.acr.dataLoaded': true,
        'aviationCalcData.acr.error': ''
      });
      
      console.log('✅ ACR数据初始化完成');
      
    } catch (error) {
      console.error('❌ ACR数据初始化失败:', error);
      this.setData({
        'aviationCalcData.acr.error': `数据加载失败: ${error.message || '未知错误'}`,
        'aviationCalcData.acr.dataLoaded': false
      });
    }
  },

  // GPWS模式选择
  selectGPWSMode(e: any) {
    const mode = e.currentTarget.dataset.mode;
    console.log('选择GPWS模式:', mode);
    this.setData({ 
      'aviationCalcData.gpws.activeMode': mode 
    });
  },

  // 温度修正计算
  calculateColdTemp() {
    const validateParams = () => {
      const coldTempData = this.data.aviationCalcData.coldTemp;
      const airportElevation = parseFloat(coldTempData.airportElevation);
      const airportTemperature = parseFloat(coldTempData.airportTemperature);
      
      if (isNaN(airportElevation) || isNaN(airportTemperature)) {
        return { valid: false, message: '请输入机场标高和温度' };
      }
      
      const altitudes = [
        { name: 'IF高度', value: coldTempData.ifAltitude },
        { name: 'FAF高度', value: coldTempData.fafAltitude },
        { name: 'DA高度', value: coldTempData.daAltitude },
        { name: '复飞高度', value: coldTempData.missedAltitude },
        { name: '其他高度', value: coldTempData.otherAltitude }
      ].filter(alt => alt.value && !isNaN(parseFloat(alt.value)));
      
      if (altitudes.length === 0) {
        return { valid: false, message: '请至少输入一个高度值' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performColdTempCalculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-coldtemp',
      validateParams,
      '低温修正计算',
      performCalculation
    );
  },

  // 分离出来的实际低温修正计算逻辑
  performColdTempCalculation() {
    const coldTempData = this.data.aviationCalcData.coldTemp;
    const airportElevation = parseFloat(coldTempData.airportElevation);
    const airportTemperature = parseFloat(coldTempData.airportTemperature);
    
    const altitudes = [
      { name: 'IF高度', value: coldTempData.ifAltitude },
      { name: 'FAF高度', value: coldTempData.fafAltitude },
      { name: 'DA高度', value: coldTempData.daAltitude },
      { name: '复飞高度', value: coldTempData.missedAltitude },
      { name: '其他高度', value: coldTempData.otherAltitude }
    ].filter(alt => alt.value && !isNaN(parseFloat(alt.value)));
    
    try {
      const results = altitudes.map(alt => {
        const altitude = parseFloat(alt.value);
        const input: ColdTempInput = {
          airportElevationFeet: airportElevation,
          airportTemperatureC: airportTemperature,
          uncorrectedAltitudeFeet: altitude,
          isFafPoint: coldTempData.isFafPoint && alt.name === 'FAF高度',
          fafDistanceNm: coldTempData.isFafPoint && alt.name === 'FAF高度' ? parseFloat(coldTempData.fafDistance) : undefined
        };
        
        const result = calculateColdTempCorrection(input);
        
        return {
          name: alt.name,
          originalAltitude: altitude,
          correctionFeet: result.correctionFeet,
          correctedAltitudeFeet: result.correctedAltitudeFeet,
          vpaInfo: result.vpaInfo
        };
      });
      
      this.setData({
        'aviationCalcData.coldTemp.result': { results },
        'aviationCalcData.coldTemp.error': ''
      });
      
    } catch (error) {
      this.setData({ 
        'aviationCalcData.coldTemp.error': error.message || '计算出错' 
      });
    }
  },

  // 温度修正输入事件
  onColdTempAirportElevationChange(event: any) {
    this.setData({ 
      'aviationCalcData.coldTemp.airportElevation': event.detail,
      'aviationCalcData.coldTemp.error': ''
    });
  },

  onColdTempAirportTemperatureChange(event: any) {
    this.setData({ 
      'aviationCalcData.coldTemp.airportTemperature': event.detail,
      'aviationCalcData.coldTemp.error': ''
    });
  },

  onColdTempIfAltitudeChange(event: any) {
    this.setData({ 
      'aviationCalcData.coldTemp.ifAltitude': event.detail,
      'aviationCalcData.coldTemp.error': ''
    });
  },

  onColdTempFafAltitudeChange(event: any) {
    this.setData({ 
      'aviationCalcData.coldTemp.fafAltitude': event.detail,
      'aviationCalcData.coldTemp.error': ''
    });
  },

  onColdTempDaAltitudeChange(event: any) {
    this.setData({ 
      'aviationCalcData.coldTemp.daAltitude': event.detail,
      'aviationCalcData.coldTemp.error': ''
    });
  },

  onColdTempMissedAltitudeChange(event: any) {
    this.setData({ 
      'aviationCalcData.coldTemp.missedAltitude': event.detail,
      'aviationCalcData.coldTemp.error': ''
    });
  },

  onColdTempOtherAltitudeChange(event: any) {
    this.setData({ 
      'aviationCalcData.coldTemp.otherAltitude': event.detail,
      'aviationCalcData.coldTemp.error': ''
    });
  },

  onColdTempFafDistanceChange(event: any) {
    this.setData({ 
      'aviationCalcData.coldTemp.fafDistance': event.detail,
      'aviationCalcData.coldTemp.error': ''
    });
  },

  toggleColdTempFafPoint() {
    this.setData({
      'aviationCalcData.coldTemp.isFafPoint': !this.data.aviationCalcData.coldTemp.isFafPoint,
      'aviationCalcData.coldTemp.error': ''
    });
  },

  // 梯度计算方法
  convertGradient() {
    const validateParams = () => {
      const gradientData = this.data.aviationCalcData.gradient;
      const { gradientInput, groundSpeedInput, verticalSpeedInput, angleInput } = gradientData;
      
      // 至少需要两个参数才能进行换算
      const paramCount = [gradientInput, groundSpeedInput, verticalSpeedInput, angleInput]
        .filter(param => param && param.trim() !== '').length;
      
      if (paramCount < 2) {
        return { valid: false, message: '请至少输入两个参数进行换算' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGradientConversion();
    };

    // 使用扣费管理器执行计算
    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gradient',
      validateParams,
      '梯度换算',
      performCalculation
    );
  },

  // 分离出来的实际计算逻辑
  performGradientConversion() {
    const gradientData = this.data.aviationCalcData.gradient;
    const gradient = gradientData.gradientInput ? parseFloat(gradientData.gradientInput) : null;
    const groundSpeed = gradientData.groundSpeedInput ? parseFloat(gradientData.groundSpeedInput) : null;
    const verticalSpeed = gradientData.verticalSpeedInput ? parseFloat(gradientData.verticalSpeedInput) : null;
    const angle = gradientData.angleInput ? parseFloat(gradientData.angleInput) : null;

    // 清空所有结果
    this.setData({
      'aviationCalcData.gradient.gradientResult': '',
      'aviationCalcData.gradient.verticalSpeedResult': '',
      'aviationCalcData.gradient.angleResult': ''
    });

    let hasCalculation = false;

    // 情况1：梯度 + 地速 → 升降率 + 角度
    if (gradient !== null && !isNaN(gradient) && groundSpeed !== null && !isNaN(groundSpeed)) {
      if (gradient > 0 && groundSpeed > 0) {
        // 将地速从节转换为英尺/分钟
        const groundSpeedFtPerMin = groundSpeed * 101.27;
        
        // 计算升降率 (英尺/分钟)
        const calculatedVerticalSpeed = (groundSpeedFtPerMin * gradient) / 100;
        
        // 计算角度
        const calculatedAngle = Math.atan(gradient / 100) * (180 / Math.PI);
        
        this.setData({
          'aviationCalcData.gradient.verticalSpeedResult': calculatedVerticalSpeed.toFixed(0),
          'aviationCalcData.gradient.angleResult': calculatedAngle.toFixed(2)
        });
        hasCalculation = true;
      }
    }

    // 情况2：地速 + 升降率 → 梯度 + 角度
    if (groundSpeed !== null && !isNaN(groundSpeed) && verticalSpeed !== null && !isNaN(verticalSpeed)) {
      if (groundSpeed > 0) {
        // 将地速从节转换为英尺/分钟
        const groundSpeedFtPerMin = groundSpeed * 101.27;
        
        // 计算梯度 (%)
        const calculatedGradient = (verticalSpeed / groundSpeedFtPerMin) * 100;
        
        // 计算角度
        const calculatedAngle = Math.atan(verticalSpeed / groundSpeedFtPerMin) * (180 / Math.PI);
        
        this.setData({
          'aviationCalcData.gradient.gradientResult': calculatedGradient.toFixed(2),
          'aviationCalcData.gradient.angleResult': calculatedAngle.toFixed(2)
        });
        hasCalculation = true;
      }
    }

    // 情况3：仅梯度 → 角度
    if (!hasCalculation && gradient !== null && !isNaN(gradient) && gradient > 0) {
      const calculatedAngle = Math.atan(gradient / 100) * (180 / Math.PI);
      
      this.setData({
        'aviationCalcData.gradient.angleResult': calculatedAngle.toFixed(2)
      });
      hasCalculation = true;
    }

    // 情况4：角度 + 地速 → 梯度 + 升降率
    if (!hasCalculation && angle !== null && !isNaN(angle) && groundSpeed !== null && !isNaN(groundSpeed)) {
      if (angle > 0 && angle < 90 && groundSpeed > 0) {
        const angleRad = angle * Math.PI / 180;
        const calculatedGradient = Math.tan(angleRad) * 100;
        
        // 将地速从节转换为英尺/分钟
        const groundSpeedFtPerMin = groundSpeed * 101.27;
        
        // 计算升降率
        const calculatedVerticalSpeed = (groundSpeedFtPerMin * calculatedGradient) / 100;
        
        this.setData({
          'aviationCalcData.gradient.gradientResult': calculatedGradient.toFixed(2),
          'aviationCalcData.gradient.verticalSpeedResult': calculatedVerticalSpeed.toFixed(0)
        });
        hasCalculation = true;
      }
    }

    // 情况5：仅角度 → 梯度
    if (!hasCalculation && angle !== null && !isNaN(angle) && angle > 0 && angle < 90) {
      const angleRad = angle * Math.PI / 180;
      const calculatedGradient = Math.tan(angleRad) * 100;
      
      this.setData({
        'aviationCalcData.gradient.gradientResult': calculatedGradient.toFixed(2)
      });
      hasCalculation = true;
    }

    if (hasCalculation) {
      wx.showToast({
        title: '换算完成',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '请输入有效的参数进行换算',
        icon: 'none'
      });
    }
  },

  // 梯度计算输入事件
  onGradientInputChange(event: any) {
    this.setData({
      'aviationCalcData.gradient.gradientInput': event.detail
    });
  },

  onGroundSpeedInputChange(event: any) {
    this.setData({
      'aviationCalcData.gradient.groundSpeedInput': event.detail
    });
  },

  onVerticalSpeedInputChange(event: any) {
    this.setData({
      'aviationCalcData.gradient.verticalSpeedInput': event.detail
    });
  },

  onAngleInputChange(event: any) {
    this.setData({
      'aviationCalcData.gradient.angleInput': event.detail
    });
  },

  clearGradient() {
    this.setData({
      'aviationCalcData.gradient.gradientInput': '',
      'aviationCalcData.gradient.groundSpeedInput': '',
      'aviationCalcData.gradient.verticalSpeedInput': '',
      'aviationCalcData.gradient.angleInput': '',
      'aviationCalcData.gradient.gradientResult': '',
      'aviationCalcData.gradient.verticalSpeedResult': '',
      'aviationCalcData.gradient.angleResult': ''
    });
  },

  // PITCH PITCH计算相关方法
  calculatePitchPitch() {
    const validateParams = () => {
      const pitchData = this.data.aviationCalcData.pitch;
      const radioHeight = parseFloat(pitchData.radioHeight);
      const currentPitch = parseFloat(pitchData.currentPitch);
      const pitchRate = parseFloat(pitchData.pitchRate);
      
      if (isNaN(radioHeight) || isNaN(currentPitch) || isNaN(pitchRate)) {
        return { valid: false, message: '请输入有效的无线电高度、当前俯仰角和俯仰率' };
      }

      if (!pitchData.aircraftModel) {
        return { valid: false, message: '请选择飞机型号' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performPitchPitchCalculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-pitch',
      validateParams,
      'PITCH PITCH告警分析',
      performCalculation
    );
  },

  // 分离出来的实际PITCH PITCH计算逻辑
  performPitchPitchCalculation() {
    const pitchData = this.data.aviationCalcData.pitch;
    const radioHeight = parseFloat(pitchData.radioHeight);
    const currentPitch = parseFloat(pitchData.currentPitch);
    const pitchRate = parseFloat(pitchData.pitchRate);
    
    const predictivePitch = this.calculatePredictivePitch(currentPitch, pitchRate);
    
    // 根据机型确定阈值
    let threshold = 0;
    let shouldTrigger = false;
    
    switch (pitchData.aircraftModel) {
      case 'A320_NO_LIP':
        threshold = 9.25;
        shouldTrigger = radioHeight < 20 && predictivePitch > threshold;
        break;
      case 'A320_LIP':
        threshold = 10;
        shouldTrigger = radioHeight < 20 && predictivePitch > threshold;
        break;
      case 'A321':
        threshold = 8.25;
        shouldTrigger = radioHeight < 20 && predictivePitch > threshold;
        break;
      case 'A330-200':
        threshold = 10.5;
        shouldTrigger = radioHeight < 25 && predictivePitch > threshold;
        break;
      case 'A330-300':
        threshold = 9;
        shouldTrigger = radioHeight < 25 && predictivePitch > threshold;
        break;
    }
    
    const warningStatus = shouldTrigger ? '⚠️ PITCH PITCH' : '✅ 正常';
    
    this.setData({
      'aviationCalcData.pitch.result': true,
      'aviationCalcData.pitch.predictivePitch': predictivePitch.toFixed(2),
      'aviationCalcData.pitch.threshold': threshold.toString(),
      'aviationCalcData.pitch.warningStatus': warningStatus,
      'aviationCalcData.pitch.shouldTrigger': shouldTrigger
    });
  },

  calculatePredictivePitch(currentPitchDegrees: number, pitchRateDegreesPerSecond: number): number {
    return currentPitchDegrees + pitchRateDegreesPerSecond * 1.0;
  },

  // PITCH输入事件
  onPitchRadioHeightChange(event: any) {
    this.setData({ 
      'aviationCalcData.pitch.radioHeight': event.detail 
    });
  },

  onPitchCurrentPitchChange(event: any) {
    this.setData({ 
      'aviationCalcData.pitch.currentPitch': event.detail 
    });
  },

  onPitchPitchRateChange(event: any) {
    this.setData({ 
      'aviationCalcData.pitch.pitchRate': event.detail 
    });
  },

  // PITCH飞机选择器
  showAircraftPicker() {
    this.setData({ showAircraftModelPicker: true });
  },

  onAircraftPickerClose() {
    this.setData({ showAircraftModelPicker: false });
  },

  onAircraftModelSelect(event: any) {
    const selectedValue = event.detail.value;
    const selectedAction = this.data.aircraftModelActions.find(action => action.value === selectedValue);
    
    this.setData({
      'aviationCalcData.pitch.aircraftModel': selectedValue,
      'aviationCalcData.pitch.aircraftModelDisplay': selectedAction && selectedAction.name || selectedValue,
      showAircraftModelPicker: false
    });
  },
  
  // ACR-PCR计算方法
  calculateACR() {
    const validateParams = () => {
      const acrData = this.data.aviationCalcData.acr;
      if (!acrData.selectedVariant) {
        return { valid: false, message: '请选择飞机型号和改型' };
      }

      if (!acrData.aircraftMass) {
        return { valid: false, message: '请输入飞机重量' };
      }

      if (!acrData.pcrNumber) {
        return { valid: false, message: '请输入PCR数值' };
      }

      if (!acrData.pavementType) {
        return { valid: false, message: '请选择道面类型' };
      }

      if (!acrData.subgradeStrength) {
        return { valid: false, message: '请选择道基强度类别' };
      }

      const mass = parseFloat(acrData.aircraftMass);
      const pcr = parseFloat(acrData.pcrNumber);

      if (isNaN(mass) || isNaN(pcr)) {
        return { valid: false, message: '请输入有效的数值' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performACRCalculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-acr',
      validateParams,
      'ACR-PCR分析',
      performCalculation
    );
  },

  // 分离出来的实际ACR计算逻辑
  performACRCalculation() {
    const acrData = this.data.aviationCalcData.acr;
    
    // 验证输入
    const showError = (errorMsg: string) => {
      this.setData({ 'aviationCalcData.acr.error': errorMsg });
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '.acr-error-section',
          duration: 500
        });
      }, 300);
    };

    try {
      const mass = parseFloat(acrData.aircraftMass);
      const pcr = parseFloat(acrData.pcrNumber);

      // 调用ACR管理器进行计算
      const acrManager = require('../../utils/acr-manager.js');
      const acrQueryResult = acrManager.queryACR(
        acrData.selectedModel,
        acrData.selectedVariant,
        mass,
        acrData.pavementType,
        acrData.subgradeStrength
      );

      if (!acrQueryResult) {
        showError('ACR计算失败，请检查输入参数');
        return;
      }

      // 构建完整的结果对象
      const safetyMargin = pcr - acrQueryResult.acr;
      const canOperate = safetyMargin >= 0;
      
      // 胎压检查逻辑
      const tirePressureCheckPassed = this.checkTirePressure(acrQueryResult.tirePressure, acrData.tirePressure);
      
      // 组装PCR代码
      const pcrCode = acrManager.assemblePCRCode(
        pcr,
        acrData.pavementType,
        acrData.subgradeStrength,
        acrData.tirePressure || 'W'
      );

      const result = {
        // 飞机信息
        aircraftInfo: `${acrData.selectedManufacturer} ${acrData.selectedModel}`,
        variantName: acrData.selectedVariant,
        inputMass: mass,
        actualMass: acrQueryResult.actualMass,
        isInterpolated: acrQueryResult.isInterpolated,
        calculationMethod: acrQueryResult.isInterpolated ? '线性插值计算' : '固定参数',
        
        // 飞机参数
        loadPercentageMLG: acrQueryResult.loadPercentageMLG,
        
        // 道面条件
        pcrCode: pcrCode,
        pavementTypeName: acrQueryResult.pavementTypeName,
        subgradeName: acrQueryResult.subgradeName,
        tirePressureCheck: tirePressureCheckPassed ? '通过' : '不通过',
        tirePressureCheckPassed: tirePressureCheckPassed,
        evaluationMethod: acrData.evaluationMethodDisplay || '技术评估',
        
        // ACR-PCR对比结果
        acr: acrQueryResult.acr,
        pcr: pcr,
        safetyMargin: safetyMargin,
        
        // 运行结论
        canOperate: canOperate && tirePressureCheckPassed,
        operationStatus: (canOperate && tirePressureCheckPassed) ? '可以运行' : '不建议运行',
        operationReason: this.getOperationReason(canOperate, tirePressureCheckPassed, safetyMargin)
      };

      this.setData({
        'aviationCalcData.acr.result': result,
        'aviationCalcData.acr.error': ''
      });

    } catch (error) {
      showError(`计算错误: ${(error as Error).message || '未知错误'}`);
    }
  },

  /**
   * 检查胎压是否符合要求
   */
  checkTirePressure(aircraftTirePressure: number, airportTirePressureLimit: string): boolean {
    if (!aircraftTirePressure || !airportTirePressureLimit) {
      return true; // 如果没有数据，默认通过
    }

    // 胎压限制映射 (MPa)
    const pressureLimits: { [key: string]: number } = {
      'W': Infinity,  // 无限制
      'X': 1.75,      // 高压限制
      'Y': 1.25,      // 中压限制  
      'Z': 0.50       // 低压限制
    };

    const limit = pressureLimits[airportTirePressureLimit];
    return limit === undefined || aircraftTirePressure <= limit;
  },

  /**
   * 获取运行结论原因
   */
  getOperationReason(canOperate: boolean, tirePressureCheckPassed: boolean, safetyMargin: number): string {
    if (!tirePressureCheckPassed) {
      return '飞机轮胎压力超过道面限制';
    }
    
    if (!canOperate) {
      return `ACR值超过PCR值 ${Math.abs(safetyMargin)} 点`;
    }
    
    if (safetyMargin === 0) {
      return 'ACR值等于PCR值，刚好满足要求';
    }
    
    return `安全余量 ${safetyMargin} 点，符合运行要求`;
  },

  // ACR选择器方法
  showAcrManufacturerPicker() {
    if (!this.data.aviationCalcData.acr.dataLoaded) {
      this.initACRData();
      return;
    }
    this.setData({ showAcrManufacturerPicker: true });
  },

  onAcrManufacturerPickerClose() {
    this.setData({ showAcrManufacturerPicker: false });
  },

  onAcrManufacturerSelect(event: any) {
    const selectedValue = event.detail.value;
    
    // 加载该制造商的型号列表
    const acrManager = require('../../utils/acr-manager.js');
    const models = acrManager.getModelsByManufacturer(selectedValue);
    const modelActions = models.map((model: any) => ({
      name: model.model,
      value: model.model
    }));
    
    this.setData({
      'aviationCalcData.acr.selectedManufacturer': selectedValue,
      'aviationCalcData.acr.selectedModel': '',
      'aviationCalcData.acr.selectedVariant': '',
      'aviationCalcData.acr.selectedVariantDisplay': '',
      acrModelActions: modelActions,
      acrVariantActions: [],
      showAcrManufacturerPicker: false,
      'aviationCalcData.acr.result': null,
      'aviationCalcData.acr.error': ''
    });
  },

  showAcrModelPicker() {
    if (!this.data.aviationCalcData.acr.selectedManufacturer) {
      wx.showToast({
        title: '请先选择制造商',
        icon: 'none'
      });
      return;
    }
    this.setData({ showAcrModelPicker: true });
  },

  onAcrModelPickerClose() {
    this.setData({ showAcrModelPicker: false });
  },

  onAcrModelSelect(event: any) {
    const selectedValue = event.detail.value;
    
    // 加载该型号的变型列表
    const acrManager = require('../../utils/acr-manager.js');
    const variants = acrManager.getVariantsByModel(selectedValue);
    const variantActions = variants.map((variant: any) => ({
      name: variant.displayName, // 使用包含重量信息的显示名称
      value: variant.variantName // 实际值仍使用原始变型名称
    }));
    
    this.setData({
      'aviationCalcData.acr.selectedModel': selectedValue,
      'aviationCalcData.acr.selectedVariant': '',
      'aviationCalcData.acr.selectedVariantDisplay': '',
      acrVariantActions: variantActions,
      showAcrModelPicker: false,
      'aviationCalcData.acr.result': null,
      'aviationCalcData.acr.error': ''
    });
  },

  showAcrVariantPicker() {
    if (!this.data.aviationCalcData.acr.selectedModel) {
      wx.showToast({
        title: '请先选择飞机型号',
        icon: 'none'
      });
      return;
    }
    this.setData({ showAcrVariantPicker: true });
  },

  onAcrVariantPickerClose() {
    this.setData({ showAcrVariantPicker: false });
  },

  onAcrVariantSelect(event: any) {
    const selectedValue = event.detail.value;
    const selectedAction = this.data.acrVariantActions.find(action => action.value === selectedValue);
    
    // 获取变型详细信息
    const acrManager = require('../../utils/acr-manager.js');
    const variants = acrManager.getVariantsByModel(this.data.aviationCalcData.acr.selectedModel);
    const variantInfo = variants.find((v: any) => v.variantName === selectedValue);
    
    if (variantInfo) {
      // 检查是否为波音机型（需要输入重量范围）
      const isBoeing = this.data.aviationCalcData.acr.selectedManufacturer === 'Boeing';
      
      // 处理质量数据 - 可能是对象（Boeing）或数字（Airbus）
      let massDisplay = '';
      if (typeof variantInfo.mass_kg === 'object' && variantInfo.mass_kg.min && variantInfo.mass_kg.max) {
        // Boeing机型显示重量范围
        massDisplay = `${variantInfo.mass_kg.min}-${variantInfo.mass_kg.max}`;
      } else if (typeof variantInfo.mass_kg === 'number') {
        // Airbus机型显示固定重量
        massDisplay = variantInfo.mass_kg.toString();
      }
      
      this.setData({
        'aviationCalcData.acr.selectedVariant': selectedValue,
        'aviationCalcData.acr.selectedVariantDisplay': selectedAction && selectedAction.name || variantInfo.displayName || selectedValue, // 优先显示带重量信息的名称
        'aviationCalcData.acr.massInputEnabled': isBoeing,
        'aviationCalcData.acr.massDisplayLabel': isBoeing ? '飞机重量 (范围内)' : '标准重量',
        'aviationCalcData.acr.aircraftMass': isBoeing ? '' : massDisplay,
        showAcrVariantPicker: false,
        'aviationCalcData.acr.result': null,
        'aviationCalcData.acr.error': ''
      });
    }
  },

  // ACR输入事件
  onAcrAircraftMassChange(event: any) {
    this.setData({ 
      'aviationCalcData.acr.aircraftMass': event.detail,
      'aviationCalcData.acr.result': null,
      'aviationCalcData.acr.error': ''
    });
  },

  onAcrPcrNumberChange(event: any) {
    this.setData({ 
      'aviationCalcData.acr.pcrNumber': event.detail,
      'aviationCalcData.acr.result': null,
      'aviationCalcData.acr.error': ''
    });
  },

  showAcrPavementTypePicker() {
    this.setData({ showPavementTypePicker: true });
  },

  onAcrPavementTypePickerClose() {
    this.setData({ showPavementTypePicker: false });
  },

  onAcrPavementTypeSelect(event: any) {
    const selectedValue = event.detail.value;
    const selectedAction = this.data.pavementTypeActions.find(action => action.value === selectedValue);
    
    this.setData({
      'aviationCalcData.acr.pavementType': selectedValue,
      'aviationCalcData.acr.pavementTypeDisplay': selectedAction && selectedAction.name || selectedValue,
      showPavementTypePicker: false
    });
  },

  showAcrSubgradeStrengthPicker() {
    this.setData({ showSubgradeStrengthPicker: true });
  },

  onAcrSubgradeStrengthPickerClose() {
    this.setData({ showSubgradeStrengthPicker: false });
  },

  onAcrSubgradeStrengthSelect(event: any) {
    const selectedValue = event.detail.value;
    const selectedAction = this.data.subgradeStrengthActions.find(action => action.value === selectedValue);
    
    this.setData({
      'aviationCalcData.acr.subgradeStrength': selectedValue,
      'aviationCalcData.acr.subgradeStrengthDisplay': selectedAction && selectedAction.name || selectedValue,
      showSubgradeStrengthPicker: false
    });
  },

  showAcrTirePressurePicker() {
    this.setData({ showTirePressurePicker: true });
  },

  onAcrTirePressurePickerClose() {
    this.setData({ showTirePressurePicker: false });
  },

  onAcrTirePressureSelect(event: any) {
    const selectedValue = event.detail.value;
    const selectedAction = this.data.tirePressureActions.find(action => action.value === selectedValue);
    
    this.setData({
      'aviationCalcData.acr.tirePressure': selectedValue,
      'aviationCalcData.acr.tirePressureDisplay': selectedAction && selectedAction.name || selectedValue,
      showTirePressurePicker: false
    });
  },

  showAcrEvaluationMethodPicker() {
    this.setData({ showEvaluationMethodPicker: true });
  },

  onAcrEvaluationMethodPickerClose() {
    this.setData({ showEvaluationMethodPicker: false });
  },

  onAcrEvaluationMethodSelect(event: any) {
    const selectedValue = event.detail.value;
    const selectedAction = this.data.evaluationMethodActions.find(action => action.value === selectedValue);
    
    this.setData({
      'aviationCalcData.acr.evaluationMethod': selectedValue,
      'aviationCalcData.acr.evaluationMethodDisplay': selectedAction && selectedAction.name || selectedValue,
      showEvaluationMethodPicker: false
    });
  },

  // ========== GPWS计算相关方法 - 每个Mode独立计算 ==========

  // Mode 1 计算
  calculateGPWSMode1() {
    const validateParams = () => {
      const mode1Data = this.data.aviationCalcData.gpws.mode1;
      
      if (!mode1Data.ra) {
        return { valid: false, message: '请输入无线电高度' };
      }

      if (!mode1Data.descentRate) {
        return { valid: false, message: '请输入下降率' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGPWSMode1Calculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
      
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 1 告警分析',
      performCalculation
    );
  },

  // Mode 1 具体计算逻辑 - 告警分析
  performGPWSMode1Calculation() {
    const mode1Data = this.data.aviationCalcData.gpws.mode1;
    const ra = parseFloat(mode1Data.ra);
    const descentRate = parseFloat(mode1Data.descentRate);
    
    if (ra <= 10 || ra >= 2450) {
      this.setData({
        'aviationCalcData.gpws.mode1.thresholdResult': {
          valid: false,
          message: 'Mode 1 仅在10-2450ft无线电高度范围内有效',
          raValue: ra
        }
      });
      return;
    }

    // 计算SINK RATE和PULL UP的阈值
    const sinkRateThreshold = Math.abs((ra + 572) / (-0.6035));
    
    let pullUpThreshold;
    if (ra > 1000) {
      pullUpThreshold = Math.abs((ra + 400) / (-0.400));
    } else {
      pullUpThreshold = Math.abs((ra + 1620) / (-1.1133));
    }

    // 判断告警状态
    let status = '✅ 安全范围';
    let message = '当前下降率在安全范围内';
    let type = 'normal';
    let warningLevel = '';

    if (descentRate >= pullUpThreshold) {
      status = '🚨 PULL UP';
      message = '触发PULL UP红色警告！立即拉起！';
      type = 'danger';
      warningLevel = 'PULL UP (红色警告)';
    } else if (descentRate >= sinkRateThreshold) {
      status = '⚠️ SINK RATE';
      message = '触发SINK RATE黄色警告';
      type = 'warning';
      warningLevel = 'SINK RATE (黄色警告)';
    }

    this.setData({
      'aviationCalcData.gpws.mode1.thresholdResult': {
        valid: true,
        status: status,
        message: message,
        type: type,
        raValue: ra,
        descentRateValue: descentRate,
        sinkRateThreshold: Math.round(sinkRateThreshold),
        pullUpThreshold: Math.round(pullUpThreshold),
        warningLevel: warningLevel,
        thresholdInfo: `SINK RATE门限: ${Math.round(sinkRateThreshold)}ft/min, PULL UP门限: ${Math.round(pullUpThreshold)}ft/min`,
        detailedInfo: `在RA=${ra}ft、下降率=${descentRate}ft/min时的分析结果`
      }
    });
  },

  // Mode 2 计算
  calculateGPWSMode2() {
    const validateParams = () => {
      const mode2Data = this.data.aviationCalcData.gpws.mode2;
      
      if (!mode2Data.ra || !mode2Data.tcr) {
        return { valid: false, message: '请输入无线电高度和地形接近率' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGPWSMode2Calculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 2 分析',
      performCalculation
    );
  },

  // Mode 2 具体计算逻辑 - 过度地形接近率
  performGPWSMode2Calculation() {
    const mode2Data = this.data.aviationCalcData.gpws.mode2;
    const ra = parseFloat(mode2Data.ra);
    const tcr = parseFloat(mode2Data.tcr);
    const airspeed = parseFloat(mode2Data.airspeed) || 180;  // 默认空速
    const flapsInLanding = mode2Data.flapsInLanding;
    const gearDown = mode2Data.gearDown;
    const ilsMode = mode2Data.ilsMode;
    const tadActive = mode2Data.tadActive;
    
    let status = '正常状态';
    let message = '当前参数在安全范围内';
    let type = 'normal';
    let thresholdInfo = '';
    let envelopeInfo = '';
    
    // 模式2 - 过度地形接近率 (基于权威文档的精确实现)
    
    if (flapsInLanding || ilsMode) {
      // ===== 模式2B - 襟翼在着陆构型 或 ILS进近模式 =====
      
      // Mode 2B上限计算
      let upperLimit = 789;  // Mode 2B基础上限
      let maxClosureRate = 3000;  // Mode 2B最大逼近率
      
      if (tadActive) {
        upperLimit = 950;   // TAD激活时上限为950ft
      }
      
      // Mode 2B边界检查
      let inMode2BEnvelope = false;
      let violatesMode2BEnvelope = false;
      
      // Mode 2B关键逼近率阈值（根据图表）
      const mode2B_MinTCR = 2038;  // Mode 2B开始激活的最小TCR
      const mode2B_TransitionTCR = 2253;  // 下边界转换点
      
      // 检查是否在Mode 2B有效包络范围内
      if (tcr >= mode2B_MinTCR && tcr <= maxClosureRate && ra >= 30 && ra <= upperLimit) {
        inMode2BEnvelope = true;
        
        // Mode 2B包络线计算
        const lowerSlope2B = -1579 + 0.7895 * tcr;  // 下部斜线
        const upperSlope2B = 522 + 0.1968 * tcr;    // 上部斜线
        
        // 根据模式和TCR确定下边界逻辑
        let effectiveLowerBoundary;
        
        if (tcr < mode2B_TransitionTCR) {
          // TCR在2038-2253 FPM之间：使用斜线边界
          if (ilsMode && !flapsInLanding) {
            // ILS模式但襟翼未在着陆位置：下边界仅由无线电高度控制，恒定30ft截止
            effectiveLowerBoundary = 30;
          } else {
            // 使用斜线计算的下边界
            effectiveLowerBoundary = Math.max(lowerSlope2B, 30);
          }
        } else {
          // TCR >= 2253 FPM：使用水平边界200ft（襟翼放下时会变化）
          if (flapsInLanding) {
            // 襟翼放下：下边界根据高度率变化（Mode 2B inhibit特性）
            effectiveLowerBoundary = 200;  // 基础水平边界
          } else if (ilsMode) {
            // ILS模式：恒定30ft下边界
            effectiveLowerBoundary = 30;
          } else {
            effectiveLowerBoundary = 200;  // 标准水平边界
          }
        }
        
        // 检查是否穿透包络线（在包络线以下）
        if (ra <= Math.max(effectiveLowerBoundary, upperSlope2B)) {
          violatesMode2BEnvelope = true;
        
          // 根据着陆构型和进近模式判断警告类型
          if (flapsInLanding && gearDown) {
            // 起落架和襟翼都在着陆构型：只发TERRAIN警告（Mode 2B抑制PULL UP）
            status = 'TERRAIN';
            message = `TERRAIN警告：地形接近率过大（完整着陆构型 - 抑制PULL UP）`;
            type = 'warning';
          } else if (ilsMode && !flapsInLanding) {
            // ILS进近模式但襟翼未在着陆位置：根据起落架状态判断
            if (gearDown) {
              status = 'TERRAIN';
              message = `TERRAIN警告：ILS进近中地形接近率过大`;
              type = 'warning';
            } else {
              status = 'PULL UP';
              message = `TERRAIN → PULL UP：ILS进近中严重地形接近威胁`;
              type = 'danger';
            }
          } else {
            // 襟翼在着陆构型但起落架未放下，或其他情况：TERRAIN followed by PULL UP
            status = 'PULL UP';
            message = `TERRAIN → PULL UP：严重地形接近威胁（部分着陆构型）`;
            type = 'danger';
          }
          
          thresholdInfo = `RA: ${ra}ft ≤ 包络线 (下: ${effectiveLowerBoundary.toFixed(0)}ft, 上: ${upperSlope2B.toFixed(0)}ft)`;
          
          // 构建详细的包络信息
          let modeDescription = '2B';
          if (ilsMode && flapsInLanding) {
            modeDescription += ' (ILS+襟翼)';
          } else if (ilsMode) {
            modeDescription += ' (ILS)';
          } else if (flapsInLanding) {
            modeDescription += ' (襟翼)';
          }
          
          envelopeInfo = `TCR: ${tcr}ft/min, 襟翼: ${flapsInLanding ? '着陆构型' : '非着陆构型'}, 起落架: ${gearDown ? '放下' : '收上'}, ILS: ${ilsMode ? '激活' : '未激活'}, 上限: ${upperLimit}ft, 模式: ${modeDescription}`;
        }
      }
      
      // 如果不在Mode 2B包络内，提供状态说明
      if (!inMode2BEnvelope) {
        let modeDescriptor = 'Mode 2B';
        if (ilsMode && flapsInLanding) {
          modeDescriptor += ' (ILS+襟翼)';
        } else if (ilsMode) {
          modeDescriptor += ' (ILS)';
        } else if (flapsInLanding) {
          modeDescriptor += ' (襟翼)';
        }
        
        if (tcr <= 0) {
          message = 'Mode 2仅在正向地形接近率时有效（TCR > 0）';
        } else if (tcr < mode2B_MinTCR) {
          message = `${modeDescriptor}需要TCR ≥ ${mode2B_MinTCR}ft/min才能激活`;
        } else if (tcr > maxClosureRate) {
          message = `${modeDescriptor}地形接近率超出有效范围（TCR > ${maxClosureRate}ft/min）`;
        } else if (ra < 30) {
          message = `${modeDescriptor}低于30ft时自动抑制`;
        } else if (ra > upperLimit) {
          message = `${modeDescriptor}高于${upperLimit}ft时不激活`;
        }
        
        const activationCondition = ilsMode || flapsInLanding ? 
          `激活条件: ${ilsMode ? 'ILS进近' : ''}${ilsMode && flapsInLanding ? '+' : ''}${flapsInLanding ? '襟翼着陆构型' : ''}` :
          '激活条件: 襟翼着陆构型 或 ILS进近';
        
        thresholdInfo = `当前: RA=${ra}ft, TCR=${tcr}ft/min, 有效范围: 30-${upperLimit}ft, ${mode2B_MinTCR}-${maxClosureRate}ft/min, ${activationCondition}`;
      }
      
    } else {
      // ===== 模式2A - 襟翼未在着陆构型 =====
      
      // Mode 2A上限和最大逼近率计算
      let upperLimit = 1650;  // Mode 2A基础上限
      let maxClosureRate = 5733;  // Mode 2A基础最大逼近率
      
      // 空速扩展计算（仅在TAD未激活时）
      if (!tadActive && airspeed >= 220) {
        if (airspeed >= 310) {
          upperLimit = 2450;
          maxClosureRate = 9800;
        } else {
          // 线性插值: 220-310kt之间
          const speedRatio = (airspeed - 220) / (310 - 220);
          upperLimit = 1650 + speedRatio * (2450 - 1650);
          maxClosureRate = 5733 + speedRatio * (9800 - 5733);
        }
      } else if (tadActive) {
        // TAD激活时：上限降低到950ft，最大逼近率相应调整
        upperLimit = 950;
        maxClosureRate = Math.min(5733, maxClosureRate);
      }
      
      // Mode 2A边界检查
      let inMode2AEnvelope = false;
      let violatesMode2AEnvelope = false;
      
      // Mode 2A关键逼近率阈值（根据图表）
      const mode2A_MinTCR = 2038;  // Mode 2A开始有效边界的最小TCR（与Mode 2B相同）
      
      // 检查是否在Mode 2A有效包络范围内
      if (tcr >= mode2A_MinTCR && tcr <= maxClosureRate && ra >= 30 && ra <= upperLimit) {
        inMode2AEnvelope = true;
        
        // Mode 2A包络线计算
        const lowerSlope2A = -1579 + 0.7895 * tcr;  // 下部斜线
        const upperSlope2A = 522 + 0.1968 * tcr;    // 上部斜线
        
        // 检查是否穿透包络线（在包络线以下）
        if (ra <= Math.max(lowerSlope2A, upperSlope2A)) {
          violatesMode2AEnvelope = true;
          
          // Mode 2A：先TERRAIN警告，持续则转为PULL UP
          status = 'PULL UP';
          message = `TERRAIN → PULL UP：严重地形接近威胁`;
          type = 'danger';
          
          thresholdInfo = `RA: ${ra}ft ≤ 包络线 (下: ${Math.max(lowerSlope2A, 30).toFixed(0)}ft, 上: ${upperSlope2A.toFixed(0)}ft)`;
          envelopeInfo = `TCR: ${tcr}ft/min, 空速: ${airspeed}kt, 上限: ${upperLimit.toFixed(0)}ft, 最大TCR: ${maxClosureRate.toFixed(0)}ft/min, 模式: 2A`;
        }
      }
      
      // 如果不在Mode 2A包络内，提供状态说明
      if (!inMode2AEnvelope) {
        if (tcr <= 0) {
          message = 'Mode 2仅在正向地形接近率时有效（TCR > 0）';
        } else if (tcr < mode2A_MinTCR) {
          message = `Mode 2A需要TCR ≥ ${mode2A_MinTCR}ft/min才有有效边界`;
        } else if (tcr > maxClosureRate) {
          message = `Mode 2A地形接近率超出有效范围（TCR > ${maxClosureRate.toFixed(0)}ft/min）`;
        } else if (ra < 30) {
          message = 'Mode 2A低于30ft时自动抑制';
        } else if (ra > upperLimit) {
          message = `Mode 2A高于${upperLimit.toFixed(0)}ft时不激活`;
        }
        thresholdInfo = `当前: RA=${ra}ft, TCR=${tcr}ft/min, 有效范围: 30-${upperLimit.toFixed(0)}ft, ${mode2A_MinTCR}-${maxClosureRate.toFixed(0)}ft/min`;
      }
    }
    
    this.setData({
      'aviationCalcData.gpws.mode2.result': {
        status,
        message,
        type,
        thresholdInfo,
        envelopeInfo
      }
    });
  },

  // Mode 3 计算
  calculateGPWSMode3() {
    const validateParams = () => {
      const mode3Data = this.data.aviationCalcData.gpws.mode3;
      
      if (!mode3Data.ra || !mode3Data.altitudeLoss) {
        return { valid: false, message: '请输入无线电高度和高度损失' };
      }
      
      return { valid: true };
    };
    
    const performCalculation = () => {
      this.performGPWSMode3Calculation();
    };
    
    const validation = validateParams();
    if (!validation.valid) {
      wx.showToast({
        title: validation.message,
        icon: 'none'
      });
      return;
    }
    
    performCalculation();
  },

  // Mode 3 具体计算逻辑 - 基于空客AMM的完整实现
  performGPWSMode3Calculation() {
    const mode3Data = this.data.aviationCalcData.gpws.mode3;
    const ra = parseFloat(mode3Data.ra);
    const actualAltitudeLoss = parseFloat(mode3Data.altitudeLoss);
    
    // 验证输入
    if (!ra || ra < 8 || ra > 1500) {
      this.setData({
        'aviationCalcData.gpws.mode3.result': {
          status: '输入无效',
          message: 'Mode 3有效范围：8-1500ft RA',
          type: 'warning',
          thresholdInfo: '请输入有效的无线电高度',
          detailedInfo: '参考图表：Mode 3在8ft以下被抑制，1500ft以上不适用'
        }
      });
      return;
    }
    
    if (actualAltitudeLoss < 0) {
      this.setData({
        'aviationCalcData.gpws.mode3.result': {
          status: '输入无效',
          message: '高度损失不能为负值',
          type: 'warning',
          thresholdInfo: '请输入正确的高度损失值',
          detailedInfo: '高度损失应为正数，表示损失的高度'
        }
      });
      return;
    }
    
    // 根据AMM公式和用户说明确定警告门限
    // 整个8-1500ft区间都使用线性关系：ALTITUDE LOSS = 5.4 + 0.092 × RA
    let warningThreshold = 5.4 + 0.092 * ra;
    let zone = '线性区域';
    let formula = `5.4 + 0.092 × ${ra} = ${warningThreshold.toFixed(1)}ft`;
    
    // 判断是否触发警告
    const isWarningTriggered = actualAltitudeLoss > warningThreshold;
    
    let status, message, type;
    
    if (isWarningTriggered) {
      status = 'DON\'T SINK 警告';
      message = `警告触发！高度损失${actualAltitudeLoss}ft 超过门限${warningThreshold.toFixed(1)}ft`;
      type = 'warning';
    } else {
      status = '安全范围';
      message = `正常状态，高度损失${actualAltitudeLoss}ft 未超过门限${warningThreshold.toFixed(1)}ft`;
      type = 'normal';
    }
    
    // 生成结果
    this.setData({
      'aviationCalcData.gpws.mode3.result': {
        status: status,
        message: message,
        type: type,
        thresholdInfo: `RA ${ra}ft 对应门限：${warningThreshold.toFixed(1)}ft`,
        detailedInfo: `${zone} | ${formula} | 实际损失：${actualAltitudeLoss}ft | ${isWarningTriggered ? '⚠️ 触发警告' : '✅ 安全范围'}`
      }
    });
  },

  // Mode 4 计算
  calculateGPWSMode4() {
    const validateParams = () => {
      const mode4Data = this.data.aviationCalcData.gpws.mode4;
      
      if (!mode4Data.ra || !mode4Data.airspeed) {
        return { valid: false, message: '请输入无线电高度和空速' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGPWSMode4Calculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 4 分析',
      performCalculation
    );
  },

  // Mode 4 具体计算逻辑 - 不安全地形穿越分析
  performGPWSMode4Calculation() {
    const mode4Data = this.data.aviationCalcData.gpws.mode4;
    const ra = parseFloat(mode4Data.ra);
    const airspeed = parseFloat(mode4Data.airspeed);
    const subMode = mode4Data.subMode;
    
    let status = '✅ 正常状态';
    let message = '当前参数在安全范围内';
    let type = 'normal';
    let subModeInfo = '';
    let thresholdInfo = '';
    let envelopeInfo = '';
    
    if (subMode === '4A') {
      // Mode 4A - 巡航和进近阶段
      subModeInfo = 'Mode 4A - 巡航和进近阶段（起落架收上，襟翼非着陆构型）';
      
      const tadHighIntegrity = mode4Data.mode4A_TADHighIntegrity;
      const tcfEnabled = mode4Data.mode4A_TCFEnabled;
      
      // Mode 4A已激活（默认LDG CONF 3已选择）
      {
        // 基于AMM权威文档的Mode 4A计算逻辑
        let threshold = 500;  // 标准上边界500ft
        let warningMessage = '';
        let boundaryType = '标准';
        
        // 根据空速和系统状态确定阈值和警告类型
        if (airspeed < 190) {
          // 低于190kts时，穿透500ft边界触发TOO LOW GEAR
          threshold = 500;
          warningMessage = 'TOO LOW GEAR';
          boundaryType = '标准边界（500ft）';
        } else {
          // 高于190kts时的扩展警戒区域
          if (tcfEnabled || tadHighIntegrity) {
            // TCF启用或TAD高完整性：边界保持500ft不变
            threshold = 500;
            warningMessage = 'TOO LOW TERRAIN';
            boundaryType = '500ft固定（TAD高完整性或TCF启用）';
          } else {
            // TCF未启用且TAD非高完整性：边界线性增加到1000ft
            if (airspeed >= 250) {
              threshold = 1000;  // 250kts及以上时最大1000ft
            } else {
              // 190-250kts线性增加：500ft到1000ft
              threshold = 500 + (airspeed - 190) * ((1000 - 500) / (250 - 190));
            }
            warningMessage = 'TOO LOW TERRAIN';
            boundaryType = `扩展告警区域（${threshold.toFixed(0)}ft）`;
          }
        }
        
        // 检查飞越检测影响（基于图表：OVERFLIGHT AND FLAPS UP）
        // Mode 4A默认襟翼收上，所以飞越检测直接适用
        const overflightDetected = mode4Data.mode4A_OverflightDetected;
        if (overflightDetected) {
          // 飞越其他航空器时，最大高度从1000ft降为800ft
          if (threshold > 800) {
            threshold = 800;
            boundaryType = boundaryType.indexOf('扩展') !== -1 ? `扩展告警区域（800ft飞越限制）` : `${boundaryType}（800ft飞越限制）`;
          }
        }
        
        // 检查几何高度功能影响
        if (tadHighIntegrity && tcfEnabled) {
          // 所有功能高完整性时，最大限制降为500ft
          if (threshold > 500) {
            threshold = 500;
            boundaryType = '几何高度激活：500ft最大限制';
            envelopeInfo = '几何高度功能激活：最大限制500ft | ';
          }
        }
      
        if (ra < threshold) {
          status = `🚨 ${warningMessage}`;
          message = `Mode 4A警告：${warningMessage === 'TOO LOW GEAR' ? '起落架收上时高度过低' : '地形高度过低'}`;
          type = 'danger';
          thresholdInfo = `当前RA: ${ra}ft < 阈值: ${threshold.toFixed(0)}ft`;
          
          // 添加操作建议
          let actionAdvice = '';
          if (warningMessage === 'TOO LOW GEAR') {
            actionAdvice = ' | 建议：放下起落架或增加高度';
          } else {
            actionAdvice = ' | 建议：增加高度或检查地形';
          }
          
          envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'} | 飞越: ${overflightDetected ? '是' : '否'}${actionAdvice}`;
        } else {
          thresholdInfo = `当前RA: ${ra}ft ≥ 阈值: ${threshold.toFixed(0)}ft（安全）`;
          envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'} | 飞越: ${overflightDetected ? '是' : '否'}`;
        }
      }
      
    } else if (subMode === '4B') {
      // Mode 4B - 进近构型（基于权威文档的精确实现）
      subModeInfo = 'Mode 4B - 进近构型（起落架放下或襟翼着陆构型）';
    
      const gearDown = mode4Data.mode4B_GearDown;  // Mode 4B起落架状态
      const flapsInLanding = mode4Data.mode4B_FlapsInLanding;
      const tadHighIntegrity = mode4Data.mode4B_TADHighIntegrity;
      const tcfEnabled = mode4Data.mode4B_TCFEnabled;
      
      // 根据权威文档：Mode 4B激活条件
      const mode4BActive = gearDown || flapsInLanding;
      
      if (!mode4BActive) {
        status = '⚪ 模式未激活';
        message = 'Mode 4B未激活：需要起落架放下或襟翼在着陆构型';
        type = 'normal';
        subModeInfo += ' - 未激活';
        thresholdInfo = 'Mode 4B激活条件：起落架放下 OR 襟翼在着陆构型';
        envelopeInfo = '';
      } else {
        // 检查抑制条件：
        const allConfigInLanding = gearDown && flapsInLanding;
        
        if (allConfigInLanding) {
          status = '⚪ 全构型抑制';
          message = 'Mode 4B被抑制：起落架和襟翼均在着陆构型';
          type = 'normal';
          subModeInfo += ' - 全构型抑制';
          thresholdInfo = '当起落架和襟翼均在着陆构型时，所有Mode 4告警被抑制（正常着陆构型）';
          envelopeInfo = 'GPWS/FLAP MODE开关正常开启，仅全构型时自动抑制告警';
        } else {
          // Mode 4B激活，基于权威文档进行精确计算
          let threshold = 245;
          let warningMessage = '';
          let boundaryType = '标准边界（245ft）';
          
          if (airspeed < 159) {
            threshold = 245;
            boundaryType = '固定边界（159kts以下）';
            
            if (!gearDown && flapsInLanding) {
              warningMessage = 'TOO LOW GEAR';  // 起落架收上，襟翼在着陆构型
            } else if (gearDown && !flapsInLanding) {
              warningMessage = 'TOO LOW FLAPS'; // 起落架放下，襟翼非着陆构型
            }
          } else {
            // Above 159 kts
            if (!gearDown && flapsInLanding) {
              threshold = 245;
              warningMessage = 'TOO LOW GEAR';
              boundaryType = '固定边界（起落架收上+襟翼着陆构型）';
            } else if (gearDown && !flapsInLanding) {
              warningMessage = 'TOO LOW TERRAIN';
              
              if (tadHighIntegrity || tcfEnabled) {
                threshold = 245;
                boundaryType = 'TAD/TCF固定边界（245ft）';
              } else {
                if (airspeed >= 250) {
                  threshold = 1000;
                  boundaryType = '扩展告警区域（最大1000ft）';
                } else {
                  // 159-250kts线性增加：245ft到1000ft
                  threshold = 245 + (airspeed - 159) * ((1000 - 245) / (250 - 159));
                  boundaryType = `扩展告警区域（${threshold.toFixed(0)}ft）`;
                }
              }
            }
          }
          
          // 检查飞越检测影响（基于图表：OVERFLIGHT AND FLAPS UP）
          const overflightDetected = mode4Data.mode4B_OverflightDetected;
          const flapsUp = !flapsInLanding;  // 襟翼收上
          if (overflightDetected && flapsUp && threshold > 800) {
            threshold = 800;
            boundaryType = boundaryType.indexOf('扩展') !== -1 ? `扩展告警区域（800ft飞越+襟翼收上限制）` : `${boundaryType}（800ft飞越+襟翼收上限制）`;
          }
          
          // 检查几何高度功能影响
          if (tadHighIntegrity && tcfEnabled && threshold > 500) {
            threshold = 500;
            boundaryType = '几何高度激活：500ft最大限制';
          }
          
          // 评估告警状态
          if (ra < threshold && warningMessage) {
            status = `🚨 ${warningMessage}`;
            let alertType = '';
            if (warningMessage === 'TOO LOW GEAR') {
              alertType = '起落架相关高度过低';
            } else if (warningMessage === 'TOO LOW FLAPS') {
              alertType = '襟翼配置高度过低';
            } else {
              alertType = '地形高度过低';
            }
            
            message = `Mode 4B警告：${alertType}`;
            type = 'danger';
            thresholdInfo = `当前RA: ${ra}ft < 阈值: ${threshold.toFixed(0)}ft`;
            
            // 添加操作建议
            let actionAdvice = '';
            if (warningMessage === 'TOO LOW GEAR') {
              actionAdvice = ' | 建议：放下起落架或增加高度';
            } else if (warningMessage === 'TOO LOW FLAPS') {
              actionAdvice = ' | 建议：调整襟翼至着陆构型或增加高度';
            } else {
              actionAdvice = ' | 建议：增加高度或检查地形';
            }
            
            envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | 起落架: ${gearDown ? '放下' : '收上'} | 襟翼: ${flapsInLanding ? '着陆构型' : '非着陆构型'} | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'}${actionAdvice}`;
          } else {
            thresholdInfo = `当前RA: ${ra}ft ≥ 阈值: ${threshold.toFixed(0)}ft（安全）`;
            envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | 起落架: ${gearDown ? '放下' : '收上'} | 襟翼: ${flapsInLanding ? '着陆构型' : '非着陆构型'} | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'}`;
          }
        }
      }
      
    } else if (subMode === '4C') {
      // Mode 4C - 起飞阶段地形穿越
      subModeInfo = 'Mode 4C - 起飞阶段地形穿越';
    
      const maxRA = parseFloat(mode4Data.maxRA) || 0;
      const gearOrFlapsDown = mode4Data.mode4C_GearOrFlapsDown;
      
      if (maxRA <= 0) {
        status = '⚠️ 参数错误';
        message = 'Mode 4C需要输入起飞后达到的最大RA值';
        type = 'warning';
        thresholdInfo = '请输入起飞过程中达到的最大无线电高度';
        envelopeInfo = '示例：起飞后RA从0上升到400ft';
      } else {
        // 实现75%滤波器逻辑
        const filterValue = 0.75 * maxRA;
        
        if (ra < filterValue && gearOrFlapsDown) {
          status = '🚨 TOO LOW TERRAIN';
          message = 'Mode 4C警告：起飞阶段地形穿越高度不足！';
          type = 'danger';
          thresholdInfo = `当前RA: ${ra}ft < 滤波器值: ${filterValue.toFixed(0)}ft`;
          envelopeInfo = `75%滤波器: 0.75 × ${maxRA}ft = ${filterValue.toFixed(0)}ft | 起落架或襟翼放下时触发警告`;
        } else if (ra < filterValue && !gearOrFlapsDown) {
          status = '⚪ 条件不满足';
          message = 'RA低于滤波器值，但起落架和襟翼都收起，不触发警告';
          type = 'normal';
          thresholdInfo = `当前RA: ${ra}ft < 滤波器值: ${filterValue.toFixed(0)}ft`;
          envelopeInfo = `75%滤波器: 0.75 × ${maxRA}ft = ${filterValue.toFixed(0)}ft | 需要起落架或襟翼放下才触发警告`;
        } else {
          thresholdInfo = `当前RA: ${ra}ft ≥ 滤波器值: ${filterValue.toFixed(0)}ft（安全）`;
          envelopeInfo = `75%滤波器: 0.75 × ${maxRA}ft = ${filterValue.toFixed(0)}ft | 起飞阶段地形穿越高度充足`;
        }
      }
    }
    
    this.setData({
      'aviationCalcData.gpws.mode4.result': {
        status,
        message,
        type,
        subModeInfo,
        thresholdInfo,
        envelopeInfo
      }
    });
  },

  // Mode 5 计算
  calculateGPWSMode5() {
    const validateParams = () => {
      const mode5Data = this.data.aviationCalcData.gpws.mode5;
      
      if (!mode5Data.ra || !mode5Data.gsDeviation) {
        return { valid: false, message: '请输入无线电高度和下滑道偏离度' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGPWSMode5Calculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 5 分析',
      performCalculation
    );
  },

  // Mode 5 具体计算逻辑 - 过度下滑道偏离
  performGPWSMode5Calculation() {
    const mode5Data = this.data.aviationCalcData.gpws.mode5;
    const ra = parseFloat(mode5Data.ra);
    const gsDeviation = parseFloat(mode5Data.gsDeviation);
    
    let status = '✅ 正常状态';
    let message = '当前参数在安全范围内';
    let type = 'normal';
    let thresholdInfo = '';
    let envelopeInfo = '';
    
    // Mode 5 - 过度下滑道下偏 (基于权威文档的精确实现)
    
    if (ra >= 1000) {
      message = 'Mode 5 仅在1000ft以下有效';
      thresholdInfo = `当前RA: ${ra}ft，有效范围: <1000ft`;
      envelopeInfo = '前航道ILS进近时，1000ft以下才启用下滑道偏离检查';
    } else {
      // 计算基于高度的动态阈值（150ft以下有额外容限）
      let softThreshold = 1.3;  // 软警告基准阈值
      let loudThreshold = 2.0;  // 硬警告基准阈值
      
      if (ra < 150) {
        // 150ft以下允许额外偏离容限（根据图表的斜坡计算）
        const additionalDeviation = (150 - ra) / (150 - 30) * (3.68 - 2.0);  // 硬警告额外容限
        loudThreshold = 2.0 + additionalDeviation;
        
        const softAdditionalDeviation = (150 - ra) / (150 - 30) * (2.98 - 1.3);  // 软警告额外容限  
        softThreshold = 1.3 + softAdditionalDeviation;
        
        envelopeInfo = `150ft以下额外容限：软警告${softThreshold.toFixed(1)} dots，硬警告${loudThreshold.toFixed(1)} dots | 适应跑道阈值附近波束变化`;
      } else {
        envelopeInfo = `标准包络线：软警告1.3 dots（1000-150ft），硬警告2.0 dots（300ft以下）`;
      }
      
      // 硬警告检查（大声GLIDE SLOPE）- 300ft以下且超过动态阈值
      if (ra < 300 && gsDeviation > loudThreshold) {
        status = '🚨 GLIDE SLOPE';
        message = `GLIDE SLOPE硬警告：严重下滑道偏离（大音量）`;
        type = 'danger';
        thresholdInfo = `RA: ${ra}ft < 300ft，偏离度: ${gsDeviation.toFixed(1)} > ${loudThreshold.toFixed(1)} dots`;
        
        if (ra < 150) {
          envelopeInfo += ` | 当前处于150ft以下增强容限区域`;
        }
      } 
      // 软警告检查（软GLIDE SLOPE）- 1000ft以下且超过动态阈值，但不满足硬警告条件
      else if (gsDeviation > softThreshold && !(ra < 300 && gsDeviation > loudThreshold)) {
        status = '⚠️ GLIDE SLOPE';
        message = `GLIDE SLOPE软警告：下滑道偏离（-6dB音量）`;
        type = 'warning';
        thresholdInfo = `RA: ${ra}ft，偏离度: ${gsDeviation.toFixed(1)} > ${softThreshold.toFixed(1)} dots`;
        
        if (ra < 150) {
          envelopeInfo += ` | 当前处于150ft以下增强容限区域`;
        } else if (ra >= 300) {
          envelopeInfo += ` | 300ft以上仅软警告`;
        }
      } else {
        // 安全状态
        thresholdInfo = `RA: ${ra}ft，偏离度: ${gsDeviation.toFixed(1)} dots - 在安全范围内`;
        
        if (ra < 300) {
          thresholdInfo += ` | 硬警告阈值: ${loudThreshold.toFixed(1)} dots`;
        }
        thresholdInfo += ` | 软警告阈值: ${softThreshold.toFixed(1)} dots`;
      }
    }
    
    this.setData({
      'aviationCalcData.gpws.mode5.result': {
        status,
        message,
        type,
        thresholdInfo,
        envelopeInfo
      }
    });
  },

  // GPWS输入事件处理方法
  // Mode 1 事件
  onGPWSMode1RAChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode1.ra': event.detail });
  },

  onGPWSMode1DescentRateChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode1.descentRate': event.detail || '' });
  },

  // Mode 2 事件
  onGPWSMode2RAChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode2.ra': event.detail });
  },
  
  onGPWSMode2TCRChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode2.tcr': event.detail });
  },
  
  onGPWSMode2AirspeedChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode2.airspeed': event.detail });
  },
  
  onGPWSMode2FlapsChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode2.flapsInLanding': event.detail });
  },

  onGPWSMode2GearChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode2.gearDown': event.detail });
  },

  onGPWSMode2ILSChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode2.ilsMode': event.detail });
  },

  onGPWSMode2TADChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode2.tadActive': event.detail });
  },

  // Mode 3 事件
  onGPWSMode3RAChange(event: any) {
    this.setData({
      'aviationCalcData.gpws.mode3.ra': event.detail || ''
    });
  },
  
  onGPWSMode3AltitudeLossChange(event: any) {
    this.setData({
      'aviationCalcData.gpws.mode3.altitudeLoss': event.detail || ''
    });
  },

  // 重置Mode 3状态
  resetGPWSMode3() {
    this.setData({
      'aviationCalcData.gpws.mode3.ra': '',
      'aviationCalcData.gpws.mode3.altitudeLoss': '',
      'aviationCalcData.gpws.mode3.result': null
    });
  },

  // Mode 4 事件
  onGPWSMode4RAChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.ra': event.detail });
  },
  
  onGPWSMode4AirspeedChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.airspeed': event.detail });
  },
  
  onGPWSMode4MaxRAChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.maxRA': event.detail });
  },
  
  // Mode 4 子模式选择
  showGPWSMode4SubModePicker() {
    this.setData({ showMode4SubModePicker: true });
  },
  
  onGPWSMode4SubModePickerClose() {
    this.setData({ showMode4SubModePicker: false });
  },
  
  onGPWSMode4SubModeCardSelect(event: any) {
    const selectedMode = event.currentTarget.dataset.mode;
    const selectedAction = this.data.mode4SubModeActions.find(item => item.value === selectedMode);
    this.setData({
      'aviationCalcData.gpws.mode4.subMode': selectedMode,
      'aviationCalcData.gpws.mode4.subModeDisplayName': selectedAction ? selectedAction.name : selectedMode,
      showMode4SubModePicker: false,
      'aviationCalcData.gpws.mode4.result': null // 清除之前的计算结果
    });
  },
  
  // Mode 4A 事件处理
  onGPWSMode4A_TADHighIntegrityChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.mode4A_TADHighIntegrity': event.detail });
  },
  
  onGPWSMode4A_TCFEnabledChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.mode4A_TCFEnabled': event.detail });
  },
  
  onGPWSMode4A_OverflightDetectedChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.mode4A_OverflightDetected': event.detail });
  },
  
  // Mode 4B 事件处理
  onGPWSMode4B_GearDownChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.mode4B_GearDown': event.detail });
  },
  
  onGPWSMode4B_FlapsInLandingChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.mode4B_FlapsInLanding': event.detail });
  },
  
  onGPWSMode4B_TADHighIntegrityChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.mode4B_TADHighIntegrity': event.detail });
  },
  
  onGPWSMode4B_TCFEnabledChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.mode4B_TCFEnabled': event.detail });
  },
  
  onGPWSMode4B_OverflightDetectedChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.mode4B_OverflightDetected': event.detail });
  },
  
  // Mode 4C 事件处理
  onGPWSMode4C_GearOrFlapsDownChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode4.mode4C_GearOrFlapsDown': event.detail });
  },

  // Mode 5 事件
  onGPWSMode5RAChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode5.ra': event.detail });
  },
  
  onGPWSMode5GSDeviationChange(event: any) {
    this.setData({ 'aviationCalcData.gpws.mode5.gsDeviation': event.detail });
  },

  // 通用清空数据方法
  clearData(category: string, module: string) {
    const dataPath = `${category}Data.${module}`;
    const currentData = this.data[`${category}Data` as keyof typeof this.data] as any;
    
    if (currentData && currentData[module]) {
      const clearedData = { ...currentData[module] };
      Object.keys(clearedData).forEach(key => {
        if (key !== 'result') {
          clearedData[key] = '';
        } else {
          clearedData[key] = null;
        }
      });
      
      this.setData({
        [dataPath]: clearedData
      });
    }
  },

  // ===== 常用换算功能 =====

  // 距离换算相关方法
  onDistanceInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    // 只更新当前输入的字段值，不进行实时换算
    const newValues = { ...this.data.unitConverterData.distanceValues };
    newValues[unit] = value;
    
    this.setData({
      'unitConverterData.distanceValues': newValues
    });
  },

  // 重量换算相关方法
  onWeightInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    // 只更新当前输入的字段值，不进行实时换算
    const newValues = { ...this.data.unitConverterData.weightValues };
    newValues[unit] = value;
    
    this.setData({
      'unitConverterData.weightValues': newValues
    });
  },

  // 速度换算相关方法
  onSpeedInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    // 只更新当前输入的字段值，不进行实时换算
    const newValues = { ...this.data.unitConverterData.speedValues };
    newValues[unit] = value;
    
    this.setData({
      'unitConverterData.speedValues': newValues
    });
  },

  // 温度换算相关方法
  onTemperatureInput(event: any) {
    const { unit } = event.currentTarget.dataset;
    const value = event.detail || '';
    
    // 只更新当前输入的字段值，不进行实时换算
    const newValues = { ...this.data.unitConverterData.temperatureValues };
    newValues[unit] = value;
    
    this.setData({
      'unitConverterData.temperatureValues': newValues
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
    // 参数验证函数
    const validateParams = () => {
      const nonEmptyValues = this.getObjectEntries(this.data.unitConverterData.distanceValues).filter(([, value]) => value !== '');
      if (nonEmptyValues.length === 0) {
        return { valid: false, message: '请先输入数值' };
      }
      return { valid: true };
    };

    // 使用积分扣除机制包装计算逻辑
    try {
      const chargeManager = require('../../utils/button-charge-manager.js');
      chargeManager.executeCalculateWithCharge(
        'unit-convert-distance',
        validateParams,
        '距离换算',
        () => {
          this.performDistanceCalculation();
        }
      );
    } catch (error) {
      console.warn('按钮收费管理器不可用，直接执行计算:', error);
      this.performDistanceCalculation();
    }
  },

  // 距离换算实际计算逻辑
  performDistanceCalculation() {
    const values = this.data.unitConverterData.distanceValues;
    const nonEmptyValues = this.getObjectEntries(values).filter(([key, value]) => value !== '');
    
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
      'unitConverterData.distanceValues': newValues
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
    // 参数验证函数
    const validateParams = () => {
      const nonEmptyValues = this.getObjectEntries(this.data.unitConverterData.weightValues).filter(([, value]) => value !== '');
      if (nonEmptyValues.length === 0) {
        return { valid: false, message: '请先输入数值' };
      }
      return { valid: true };
    };

    // 使用积分扣除机制包装计算逻辑
    try {
      const chargeManager = require('../../utils/button-charge-manager.js');
      chargeManager.executeCalculateWithCharge(
        'unit-convert-weight',
        validateParams,
        '重量换算',
        () => {
          this.performWeightCalculation();
        }
      );
    } catch (error) {
      console.warn('按钮收费管理器不可用，直接执行计算:', error);
      this.performWeightCalculation();
    }
  },

  // 重量换算实际计算逻辑
  performWeightCalculation() {
    const values = this.data.unitConverterData.weightValues;
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
      'unitConverterData.weightValues': newValues
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
    // 参数验证函数
    const validateParams = () => {
      const nonEmptyValues = this.getObjectEntries(this.data.unitConverterData.speedValues).filter(([, value]) => value !== '');
      if (nonEmptyValues.length === 0) {
        return { valid: false, message: '请先输入数值' };
      }
      return { valid: true };
    };

    // 使用积分扣除机制包装计算逻辑
    try {
      const chargeManager = require('../../utils/button-charge-manager.js');
      chargeManager.executeCalculateWithCharge(
        'unit-convert-speed',
        validateParams,
        '速度换算',
        () => {
          this.performSpeedCalculation();
        }
      );
    } catch (error) {
      console.warn('按钮收费管理器不可用，直接执行计算:', error);
      this.performSpeedCalculation();
    }
  },

  // 速度换算实际计算逻辑
  performSpeedCalculation() {
    const values = this.data.unitConverterData.speedValues;
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
      'unitConverterData.speedValues': newValues
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
    // 参数验证函数
    const validateParams = () => {
      const nonEmptyValues = this.getObjectEntries(this.data.unitConverterData.temperatureValues).filter(([, value]) => value !== '');
      if (nonEmptyValues.length === 0) {
        return { valid: false, message: '请先输入数值' };
      }
      return { valid: true };
    };

    // 使用积分扣除机制包装计算逻辑
    try {
      const chargeManager = require('../../utils/button-charge-manager.js');
      chargeManager.executeCalculateWithCharge(
        'unit-convert-temperature',
        validateParams,
        '温度换算',
        () => {
          this.performTemperatureCalculation();
        }
      );
    } catch (error) {
      console.warn('按钮收费管理器不可用，直接执行计算:', error);
      this.performTemperatureCalculation();
    }
  },

  // 温度换算实际计算逻辑
  performTemperatureCalculation() {
    const values = this.data.unitConverterData.temperatureValues;
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
      'unitConverterData.temperatureValues': newValues
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

  // 气压换算方法
  convertPressure() {
    // 参数验证函数
    const validateParams = () => {
      const elevation = parseFloat(this.data.unitConverterData.elevationInput);
      const qnh = parseFloat(this.data.unitConverterData.qnhInput);
      const qfe = parseFloat(this.data.unitConverterData.qfeInput);
      
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
      const elevation = parseFloat(this.data.unitConverterData.elevationInput) || 0;
      const qnh = parseFloat(this.data.unitConverterData.qnhInput);
      const qfe = parseFloat(this.data.unitConverterData.qfeInput);
      
      // 计算QNH (QFE + 高度修正)
      if (!isNaN(qfe) && !isNaN(elevation)) {
        // 每30英尺高度约1hPa气压差
        const pressureDiff = elevation / 30;
        const calculatedQNH = qfe + pressureDiff;
        
        this.setData({
          'unitConverterData.qnhResult': calculatedQNH.toFixed(1)
        });
      }
      
      // 计算QFE (QNH - 高度修正)
      if (!isNaN(qnh) && !isNaN(elevation)) {
        // 每30英尺高度约1hPa气压差
        const pressureDiff = elevation / 30;
        const calculatedQFE = qnh - pressureDiff;
        
        this.setData({
          'unitConverterData.qfeResult': calculatedQFE.toFixed(1)
        });
      }
    };

    // 使用扣费管理器执行计算
    try {
      const chargeManager = require('../../utils/button-charge-manager.js');
      chargeManager.executeCalculateWithCharge(
        'unit-converter-pressure',
        validateParams,
        '气压换算',
        performCalculation
      );
    } catch (error) {
      console.warn('按钮收费管理器不可用，直接执行计算:', error);
      performCalculation();
    }
  },

  // ISA温度计算方法
  calculateISA() {
    // 参数验证函数
    const validateParams = () => {
      const altitude = parseFloat(this.data.unitConverterData.isaAltitude);
      const oat = parseFloat(this.data.unitConverterData.isaOAT);
      
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
      const altitude = parseFloat(this.data.unitConverterData.isaAltitude);
      const oat = parseFloat(this.data.unitConverterData.isaOAT);
      
      // ISA标准温度计算 (海平面15°C，每1000英尺降低2°C)
      let isaTemp = 15 - (altitude / 1000) * 2;
      
      // 温度偏差 (实际温度 - ISA标准温度)
      const deviation = oat - isaTemp;
      
      this.setData({
        'unitConverterData.isaStandardTemp': isaTemp.toFixed(1),
        'unitConverterData.isaDeviation': deviation.toFixed(1)
      });
    };

    // 使用扣费管理器执行计算
    try {
      const chargeManager = require('../../utils/button-charge-manager.js');
      chargeManager.executeCalculateWithCharge(
        'unit-converter-isa',
        validateParams,
        'ISA温度计算',
        performCalculation
      );
    } catch (error) {
      console.warn('按钮收费管理器不可用，直接执行计算:', error);
      performCalculation();
    }
  },

  // ISA高度输入变化
  onISAAltitudeChange(event: any) {
    this.setData({
      'unitConverterData.isaAltitude': event.detail
    });
  },

  // ISA外界温度输入变化
  onISAOATChange(event: any) {
    this.setData({
      'unitConverterData.isaOAT': event.detail
    });
  },

  // 机场标高输入变化
  onElevationInputChange(event: any) {
    this.setData({
      'unitConverterData.elevationInput': event.detail
    });
  },

  // QNH输入变化
  onQNHInputChange(event: any) {
    this.setData({
      'unitConverterData.qnhInput': event.detail
    });
  },

  // QFE输入变化
  onQFEInputChange(event: any) {
    this.setData({
      'unitConverterData.qfeInput': event.detail
    });
  },

  // 清空距离数据
  clearDistance() {
    this.setData({
      'unitConverterData.distanceValues': {
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
      'unitConverterData.weightValues': {
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
      'unitConverterData.speedValues': {
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
      'unitConverterData.temperatureValues': {
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

  // 清空气压换算
  clearPressure() {
    this.setData({
      'unitConverterData.elevationInput': '',
      'unitConverterData.qnhInput': '',
      'unitConverterData.qfeInput': '',
      'unitConverterData.qnhResult': '',
      'unitConverterData.qfeResult': ''
    });
    wx.showToast({
      title: '已清空气压数据',
      icon: 'success'
    });
  },

  // 清空ISA温度计算
  clearISA() {
    this.setData({
      'unitConverterData.isaAltitude': '',
      'unitConverterData.isaOAT': '',
      'unitConverterData.isaStandardTemp': '',
      'unitConverterData.isaDeviation': ''
    });
    wx.showToast({
      title: '已清空ISA数据',
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

  // ES5兼容的Object.entries实现
  getObjectEntries(obj: any): [string, any][] {
    const entries: [string, any][] = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        entries.push([key, obj[key]]);
      }
    }
    return entries;
  }
});