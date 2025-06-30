// 特殊计算页面
import { calculateColdTempCorrection, ColdTempInput, CorrectionResult } from '../../utils/coldTempCalculator';

Page({
  data: {
    // 🎯 基于Context7最佳实践：全局主题状态
    isDarkMode: false,
    
    activeTab: 0,
    
    // 梯度计算
    gradientInput: '',
    groundSpeedInput: '',
    verticalSpeedInput: '',
    angleInput: '',
    gradientResult: '',
    groundSpeedResult: '',
    verticalSpeedResult: '',
    angleResult: '',
    
    // GPWS计算相关 - 每个Mode完全独立
    // Mode 1 参数
    mode1RA: '',
    mode1DescentRate: '', // 用户输入的下降率
    mode1ThresholdResult: null as any, // 阈值计算结果

    // Mode 2 参数
    mode2RA: '',
    mode2TCR: '',
    mode2Airspeed: '',
    mode2FlapsInLanding: false,
    mode2GearDown: false, // 新增：起落架状态
    mode2ILSMode: false, // 新增：ILS进近模式
    mode2TADActive: false,
    mode2Result: null,

    // Mode 3 参数 - 判断是否触发DON'T SINK警告
    mode3RA: '',
    mode3AltitudeLoss: '', // 实际的高度损失
    mode3Result: null,


    // Mode 4 参数 - 分类选择设计
    mode4SubMode: '4A', // 子模式选择：4A, 4B, 4C
    mode4SubModeDisplayName: 'Mode 4A - 巡航进近（起落架收上）', // 显示名称
    mode4RA: '',
    mode4Airspeed: '',
    mode4MaxRA: '', // 仅Mode 4C需要
    
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
    
    mode4Result: null,
    
    // 子模式选择器
    showMode4SubModePicker: false,
    mode4SubModeActions: [
      { name: 'Mode 4A - 巡航进近（起落架收上，襟翼非着陆构型）', value: '4A' },
      { name: 'Mode 4B - 进近构型（起落架放下或襟翼着陆构型）', value: '4B' },
      { name: 'Mode 4C - 起飞阶段地形穿越', value: '4C' }
    ],

    // Mode 5 参数
    mode5RA: '',
    mode5GSDeviation: '',
    mode5Result: null,

    // PITCH PITCH 计算相关
    pitchAircraftModel: 'A320_NO_LIP',
    pitchAircraftModelDisplay: 'A320 (未安装LIP)',
    pitchRadioHeight: '',
    pitchCurrentPitch: '',
    pitchPitchRate: '',
    pitchResult: false,
    pitchPredictivePitch: '',
    pitchThreshold: '',
    pitchWarningStatus: '',
    pitchShouldTrigger: false,
    showAircraftModelPicker: false,
    aircraftModelActions: [
      { name: 'A320 (未安装LIP)', value: 'A320_NO_LIP' },
      { name: 'A320 (已安装LIP)', value: 'A320_LIP' },
      { name: 'A321', value: 'A321' },
      { name: 'A330-200', value: 'A330-200' },
      { name: 'A330-300', value: 'A330-300' }
    ],

    // 温度修正计算相关
    coldTempAirportElevation: '',
    coldTempAirportTemperature: '',
    coldTempIfAltitude: '',
    coldTempFafAltitude: '',
    coldTempDaAltitude: '',
    coldTempMissedAltitude: '',
    coldTempOtherAltitude: '',
    coldTempIsFafPoint: false,
    coldTempFafDistance: '8.0',
    coldTempResult: null,
    coldTempError: '',

    // ACR-PCR计算相关
    acrSelectedManufacturer: '',
    acrSelectedModel: '',
    acrSelectedVariant: '',
    acrSelectedVariantDisplay: '',
    acrAircraftMass: '',
    acrMassInputEnabled: false, // 是否允许用户输入重量
    acrMassDisplayLabel: '飞机重量', // 重量字段显示标签
    
    // PCR参数
    acrPcrNumber: '',
    acrPavementType: '',
    acrPavementTypeDisplay: '',
    acrSubgradeStrength: '',
    acrSubgradeStrengthDisplay: '',
    acrTirePressure: 'W',
    acrTirePressureDisplay: 'W - 无限制 (Unlimited)',
    acrEvaluationMethod: 'T',
    acrEvaluationMethodDisplay: 'T - 技术评估 (Technical evaluation)',
    
    acrResult: null,
    acrError: '',
    
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
    
    // ACR数据加载状态
    acrDataLoaded: false,

    // 🎯 基于Context7最佳实践：广告相关数据
    showAd: false,
    adUnitId: ''
  },

  onLoad() {
    // 🎯 新增：初始化全局主题管理器
    try {
      const themeManager = require('../../utils/theme-manager.js');
      this.themeCleanup = themeManager.initPageTheme(this);
      console.log('🌙 特殊计算页面主题初始化完成');
    } catch (error) {
      console.warn('⚠️ 主题管理器初始化失败:', error);
    }
    
    // 页面加载时不立即初始化ACR数据，等用户切换到ACR标签页时再加载
    console.log('特殊计算页面加载完成')
    
    // 🎯 基于Context7最佳实践：初始化广告
    this.initAd()
  },

  onUnload() {
    // 🎯 新增：清理主题监听器
    if (this.themeCleanup && typeof this.themeCleanup === 'function') {
      try {
        this.themeCleanup();
        console.log('🌙 特殊计算页面主题监听器已清理');
      } catch (error) {
        console.warn('⚠️ 清理主题监听器时出错:', error);
      }
    }
  },

  onTabChange(event) {
    this.setData({
      activeTab: event.detail.index
    })
    
    // 如果切换到ACR标签页且数据未加载，则加载数据
    // 注意：删除PAPI后，ACR标签页的索引变为3
    if (event.detail.index === 3 && !this.data.acrDataLoaded) {
      console.log('用户切换到ACR标签页，开始加载数据')
      this.initACRData()
    }
  },

  // 初始化ACR数据
  async initACRData() {
    try {
      console.log('🔄 开始初始化ACR数据...')
      
      // 显示加载状态
      this.setData({
        acrError: '正在加载ACR数据...'
      })
      
      // 动态导入ACR管理器
      const acrManager = require('../../utils/acr-manager.js')
      const acrData = await acrManager.loadACRData()
      console.log('📊 ACR数据加载结果:', acrData ? '成功' : '失败')
      
      // 加载制造商列表
      const manufacturers = acrManager.getManufacturers()
      console.log('🏭 制造商列表:', manufacturers)
      
      if (manufacturers.length === 0) {
        throw new Error('制造商列表为空')
      }
      
      const manufacturerActions = manufacturers.map((manufacturer) => ({
        name: manufacturer,
        value: manufacturer
      }))
      
      // 初始化PCR参数选项
      const pavementTypeActions = [
        { name: 'F - 柔性道面 (Flexible)', value: 'F' },
        { name: 'R - 刚性道面 (Rigid)', value: 'R' }
      ]
      
      const subgradeStrengthActions = [
        { name: 'A - 高强度 (High)', value: 'A' },
        { name: 'B - 中强度 (Medium)', value: 'B' },
        { name: 'C - 低强度 (Low)', value: 'C' },
        { name: 'D - 超低强度 (Ultra Low)', value: 'D' }
      ]
      
      const tirePressureActions = [
        { name: 'W - 无限制 (Unlimited)', value: 'W' },
        { name: 'X - 高压轮胎 (High pressure)', value: 'X' },
        { name: 'Y - 中压轮胎 (Medium pressure)', value: 'Y' },
        { name: 'Z - 低压轮胎 (Low pressure)', value: 'Z' }
      ]
      
      const evaluationMethodActions = [
        { name: 'T - 技术评估 (Technical evaluation)', value: 'T' },
        { name: 'U - 使用经验 (Using experience)', value: 'U' }
      ]
      
      this.setData({
        acrManufacturerActions: manufacturerActions,
        pavementTypeActions: pavementTypeActions,
        subgradeStrengthActions: subgradeStrengthActions,
        tirePressureActions: tirePressureActions,
        evaluationMethodActions: evaluationMethodActions,
        acrDataLoaded: true,
        acrError: ''
      })
      
      console.log('✅ ACR数据初始化完成')
      
    } catch (error) {
      console.error('❌ ACR数据初始化失败:', error)
      this.setData({
        acrError: `数据加载失败: ${error.message || '未知错误'}`,
        acrDataLoaded: false
      })
    }
  },

  // QFE计算相关方法
  // 梯度换算方法
  convertGradient() {
    const validateParams = () => {
      const { gradientInput, groundSpeedInput, verticalSpeedInput, angleInput } = this.data;
      
      // 至少需要两个参数才能进行换算
      const paramCount = [gradientInput, groundSpeedInput, verticalSpeedInput, angleInput]
        .filter(param => param && param.trim() !== '').length;
      
      if (paramCount < 2) {
        return { valid: false, message: '请至少输入两个参数进行换算' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGradientConversion()
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
  onGradientInputChange(event) {
    this.setData({
      gradientInput: event.detail
    })
  },

  onGroundSpeedInputChange(event) {
    this.setData({
      groundSpeedInput: event.detail
    })
  },

  onVerticalSpeedInputChange(event) {
    this.setData({
      verticalSpeedInput: event.detail
    })
  },

  onAngleInputChange(event) {
    this.setData({
      angleInput: event.detail
    })
  },

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
    })
  },

  // GPWS计算相关方法 - 每个Mode独立计算

  // Mode 1 计算
  calculateMode1() {
    const validateParams = () => {
      const { mode1RA, mode1DescentRate } = this.data;
      
      if (!mode1RA) {
        return { valid: false, message: '请输入无线电高度' };
      }

      if (!mode1DescentRate) {
        return { valid: false, message: '请输入下降率' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performMode1Calculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
      
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 1 告警分析',
      performCalculation
    );
  },

  // Mode 2 计算
  calculateMode2() {
    const validateParams = () => {
      const { mode2RA, mode2TCR } = this.data;
      
      if (!mode2RA || !mode2TCR) {
        return { valid: false, message: '请输入无线电高度和地形接近率' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performMode2Calculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 2 分析',
      performCalculation
    );
  },

  // Mode 3 计算
  calculateMode3() {
    const validateParams = () => {
      const { mode3RA, mode3AltitudeLoss } = this.data;
      
      if (!mode3RA || !mode3AltitudeLoss) {
        return { valid: false, message: '请输入无线电高度和高度损失' };
      }
      
      return { valid: true };
    };
    
    const performCalculation = () => {
      this.performMode3Calculation();
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

  // Mode 4 计算
  calculateMode4() {
    const validateParams = () => {
      const { mode4RA, mode4Airspeed } = this.data;
      
      if (!mode4RA || !mode4Airspeed) {
        return { valid: false, message: '请输入无线电高度和空速' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performMode4Calculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 4 分析',
      performCalculation
    );
  },

  // Mode 5 计算
  calculateMode5() {
    const validateParams = () => {
      const { mode5RA, mode5GSDeviation } = this.data;
      
      if (!mode5RA || !mode5GSDeviation) {
        return { valid: false, message: '请输入无线电高度和下滑道偏离度' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performMode5Calculation();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 5 分析',
      performCalculation
    );
  },

  // Mode 1 具体计算逻辑 - 告警分析
  performMode1Calculation() {
    const ra = parseFloat(this.data.mode1RA)
    const descentRate = parseFloat(this.data.mode1DescentRate)
    
    if (ra <= 10 || ra >= 2450) {
      this.setData({
        mode1ThresholdResult: {
          valid: false,
          message: 'Mode 1 仅在10-2450ft无线电高度范围内有效',
          raValue: ra
        }
      })
      return
    }

    // 计算SINK RATE和PULL UP的阈值
    const sinkRateThreshold = Math.abs((ra + 572) / (-0.6035))
    
    let pullUpThreshold
    if (ra > 1000) {
      pullUpThreshold = Math.abs((ra + 400) / (-0.400))
    } else {
      pullUpThreshold = Math.abs((ra + 1620) / (-1.1133))
    }

    // 判断告警状态
    let status = '✅ 安全范围'
    let message = '当前下降率在安全范围内'
    let type = 'normal'
    let warningLevel = ''

    if (descentRate >= pullUpThreshold) {
      status = '🚨 PULL UP'
      message = '触发PULL UP红色警告！立即拉起！'
      type = 'danger'
      warningLevel = 'PULL UP (红色警告)'
    } else if (descentRate >= sinkRateThreshold) {
      status = '⚠️ SINK RATE'
      message = '触发SINK RATE黄色警告'
      type = 'warning'
      warningLevel = 'SINK RATE (黄色警告)'
    }

    this.setData({
      mode1ThresholdResult: {
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
    })
  },

  // Mode 1 反向计算逻辑 - 根据高度计算下降率阈值
  performMode1ReverseCalculation(ra: number) {
    if (ra <= 10 || ra >= 2450) {
      this.setData({
        mode1ThresholdResult: {
          valid: false,
          message: 'Mode 1 仅在10-2450ft无线电高度范围内有效',
          raValue: ra
        }
      })
      return
    }

    // 基于GPWS Mode 1官方公式进行反向计算
    // SINK RATE阈值: RA = -572 - 0.6035 * DR_neg
    // 解出: DR_neg = (RA + 572) / (-0.6035)
    // 因为DR_neg是负值，实际下降率 = |DR_neg|
    const sinkRateDescentRate = Math.abs((ra + 572) / (-0.6035))

    // PULL UP阈值计算（分高低高度）
    let pullUpDescentRate
    if (ra > 1000) {
      // 高高度: RA = -400 - 0.400 * DR_neg
      // 解出: DR_neg = (RA + 400) / (-0.400)
      pullUpDescentRate = Math.abs((ra + 400) / (-0.400))
    } else {
      // 低高度: RA = -1620 - 1.1133 * DR_neg  
      // 解出: DR_neg = (RA + 1620) / (-1.1133)
      pullUpDescentRate = Math.abs((ra + 1620) / (-1.1133))
    }

    // 计算安全下降率建议（比SINK RATE阈值小20%）
    const safeDescentRate = sinkRateDescentRate * 0.8

    this.setData({
      mode1ThresholdResult: {
        valid: true,
        raValue: ra,
        sinkRateThreshold: Math.round(sinkRateDescentRate),
        pullUpThreshold: Math.round(pullUpDescentRate),
        safeDescentRate: Math.round(safeDescentRate),
        altitudeRange: ra > 1000 ? '高高度' : '低高度',
        message: `在${ra}ft高度下的下降率阈值计算完成`,
        thresholdInfo: `在RA=${ra}ft时: SINK RATE≥${Math.round(sinkRateDescentRate)}ft/min, PULL UP≥${Math.round(pullUpDescentRate)}ft/min`
      }
    })
  },

  // Mode 2 具体计算逻辑 - 过度地形接近率
  performMode2Calculation() {
    const ra = parseFloat(this.data.mode2RA)
    const tcr = parseFloat(this.data.mode2TCR)
    const airspeed = parseFloat(this.data.mode2Airspeed) || 180  // 默认空速
    const flapsInLanding = this.data.mode2FlapsInLanding
    const gearDown = this.data.mode2GearDown
    const ilsMode = this.data.mode2ILSMode
    const tadActive = this.data.mode2TADActive
    
    let status = '正常状态'
    let message = '当前参数在安全范围内'
    let type = 'normal'
    let thresholdInfo = ''
    let envelopeInfo = ''
    
    // 模式2 - 过度地形接近率 (Excessive Terrain Closure Rate)
    // 基于标准包络线公式：
    // 下部斜线: H = -1579 + 0.7895 × TCR
    // 上部斜线: H = 522 + 0.1968 × TCR
    
    if (flapsInLanding || ilsMode) {
      // ===== 模式2B - 襟翼在着陆构型 或 ILS进近模式 =====
      
      // Mode 2B上限计算
      let upperLimit = 789  // Mode 2B基础上限
      let maxClosureRate = 3000  // Mode 2B最大逼近率
      
      if (tadActive) {
        upperLimit = 950   // TAD激活时上限为950ft
      }
      
      // Mode 2B边界检查
      let inMode2BEnvelope = false
      let violatesMode2BEnvelope = false
      
              // Mode 2B关键逼近率阈值（根据图表）
        const mode2B_MinTCR = 2038  // Mode 2B开始激活的最小TCR
        const mode2B_TransitionTCR = 2253  // 下边界转换点
        
        // 检查是否在Mode 2B有效包络范围内
        // 关键：Mode 2B只在TCR >= 2038 FPM时才激活
        if (tcr >= mode2B_MinTCR && tcr <= maxClosureRate && ra >= 30 && ra <= upperLimit) {
          inMode2BEnvelope = true
          
          // Mode 2B包络线计算
          const lowerSlope2B = -1579 + 0.7895 * tcr  // 下部斜线
          const upperSlope2B = 522 + 0.1968 * tcr    // 上部斜线
          
          // 根据模式和TCR确定下边界逻辑
          let effectiveLowerBoundary
          
          if (tcr < mode2B_TransitionTCR) {
            // TCR在2038-2253 FPM之间：使用斜线边界
            if (ilsMode && !flapsInLanding) {
              // ILS模式但襟翼未在着陆位置：下边界仅由无线电高度控制，恒定30ft截止
              effectiveLowerBoundary = 30
            } else {
              // 使用斜线计算的下边界
              effectiveLowerBoundary = Math.max(lowerSlope2B, 30)
            }
          } else {
            // TCR >= 2253 FPM：使用水平边界200ft（襟翼放下时会变化）
            if (flapsInLanding) {
              // 襟翼放下：下边界根据高度率变化（Mode 2B inhibit特性）
              effectiveLowerBoundary = 200  // 基础水平边界
            } else if (ilsMode) {
              // ILS模式：恒定30ft下边界
              effectiveLowerBoundary = 30
            } else {
              effectiveLowerBoundary = 200  // 标准水平边界
            }
          }
          
          // 检查是否穿透包络线（在包络线以下）
          // 注意：只有在包络有效区域内才检查穿透
          if (ra <= Math.max(effectiveLowerBoundary, upperSlope2B)) {
            violatesMode2BEnvelope = true
          
                      // 根据着陆构型和进近模式判断警告类型
            if (flapsInLanding && gearDown) {
              // 起落架和襟翼都在着陆构型：只发TERRAIN警告（Mode 2B抑制PULL UP）
              status = 'TERRAIN'
              message = `TERRAIN警告：地形接近率过大（完整着陆构型 - 抑制PULL UP）`
              type = 'warning'
            } else if (ilsMode && !flapsInLanding) {
              // ILS进近模式但襟翼未在着陆位置：根据起落架状态判断
              if (gearDown) {
                status = 'TERRAIN'
                message = `TERRAIN警告：ILS进近中地形接近率过大`
                type = 'warning'
              } else {
                status = 'PULL UP'
                message = `TERRAIN → PULL UP：ILS进近中严重地形接近威胁`
                type = 'danger'
              }
            } else {
              // 襟翼在着陆构型但起落架未放下，或其他情况：TERRAIN followed by PULL UP
              status = 'PULL UP'
              message = `TERRAIN → PULL UP：严重地形接近威胁（部分着陆构型）`
              type = 'danger'
            }
            
            thresholdInfo = `RA: ${ra}ft ≤ 包络线 (下: ${effectiveLowerBoundary.toFixed(0)}ft, 上: ${upperSlope2B.toFixed(0)}ft)`
            
            // 构建详细的包络信息
            let modeDescription = '2B'
            if (ilsMode && flapsInLanding) {
              modeDescription += ' (ILS+襟翼)'
            } else if (ilsMode) {
              modeDescription += ' (ILS)'
            } else if (flapsInLanding) {
              modeDescription += ' (襟翼)'
            }
            
            envelopeInfo = `TCR: ${tcr}ft/min, 襟翼: ${flapsInLanding ? '着陆构型' : '非着陆构型'}, 起落架: ${gearDown ? '放下' : '收上'}, ILS: ${ilsMode ? '激活' : '未激活'}, 上限: ${upperLimit}ft, 模式: ${modeDescription}`
        }
      }
      
              // 如果不在Mode 2B包络内，提供状态说明
        if (!inMode2BEnvelope) {
          let modeDescriptor = 'Mode 2B'
          if (ilsMode && flapsInLanding) {
            modeDescriptor += ' (ILS+襟翼)'
          } else if (ilsMode) {
            modeDescriptor += ' (ILS)'
          } else if (flapsInLanding) {
            modeDescriptor += ' (襟翼)'
          }
          
          if (tcr <= 0) {
            message = 'Mode 2仅在正向地形接近率时有效（TCR > 0）'
          } else if (tcr < mode2B_MinTCR) {
            message = `${modeDescriptor}需要TCR ≥ ${mode2B_MinTCR}ft/min才能激活`
          } else if (tcr > maxClosureRate) {
            message = `${modeDescriptor}地形接近率超出有效范围（TCR > ${maxClosureRate}ft/min）`
          } else if (ra < 30) {
            message = `${modeDescriptor}低于30ft时自动抑制`
          } else if (ra > upperLimit) {
            message = `${modeDescriptor}高于${upperLimit}ft时不激活`
          }
          
          const activationCondition = ilsMode || flapsInLanding ? 
            `激活条件: ${ilsMode ? 'ILS进近' : ''}${ilsMode && flapsInLanding ? '+' : ''}${flapsInLanding ? '襟翼着陆构型' : ''}` :
            '激活条件: 襟翼着陆构型 或 ILS进近'
          
          thresholdInfo = `当前: RA=${ra}ft, TCR=${tcr}ft/min, 有效范围: 30-${upperLimit}ft, ${mode2B_MinTCR}-${maxClosureRate}ft/min, ${activationCondition}`
        }
      
    } else {
      // ===== 模式2A - 襟翼未在着陆构型 =====
      
      // Mode 2A上限和最大逼近率计算
      let upperLimit = 1650  // Mode 2A基础上限
      let maxClosureRate = 5733  // Mode 2A基础最大逼近率
      
      // 空速扩展计算（仅在TAD未激活时）
      if (!tadActive && airspeed >= 220) {
        if (airspeed >= 310) {
          upperLimit = 2450
          maxClosureRate = 9800
        } else {
          // 线性插值: 220-310kt之间
          const speedRatio = (airspeed - 220) / (310 - 220)
          upperLimit = 1650 + speedRatio * (2450 - 1650)
          maxClosureRate = 5733 + speedRatio * (9800 - 5733)
        }
      } else if (tadActive) {
        // TAD激活时：上限降低到950ft，最大逼近率相应调整
        upperLimit = 950
        maxClosureRate = Math.min(5733, maxClosureRate)
      }
      
      // Mode 2A边界检查
      let inMode2AEnvelope = false
      let violatesMode2AEnvelope = false
      
              // Mode 2A关键逼近率阈值（根据图表）
        const mode2A_MinTCR = 2038  // Mode 2A开始有效边界的最小TCR（与Mode 2B相同）
        
        // 检查是否在Mode 2A有效包络范围内
        if (tcr >= mode2A_MinTCR && tcr <= maxClosureRate && ra >= 30 && ra <= upperLimit) {
        inMode2AEnvelope = true
        
        // Mode 2A包络线计算
        const lowerSlope2A = -1579 + 0.7895 * tcr  // 下部斜线
        const upperSlope2A = 522 + 0.1968 * tcr    // 上部斜线
        
        // 检查是否穿透包络线（在包络线以下）
        // 注意：只有在包络有效区域内才检查穿透
        if (ra <= Math.max(lowerSlope2A, upperSlope2A)) {
          violatesMode2AEnvelope = true
          
          // Mode 2A：先TERRAIN警告，持续则转为PULL UP
          status = 'PULL UP'
          message = `TERRAIN → PULL UP：严重地形接近威胁`
          type = 'danger'
          
          thresholdInfo = `RA: ${ra}ft ≤ 包络线 (下: ${Math.max(lowerSlope2A, 30).toFixed(0)}ft, 上: ${upperSlope2A.toFixed(0)}ft)`
          envelopeInfo = `TCR: ${tcr}ft/min, 空速: ${airspeed}kt, 上限: ${upperLimit.toFixed(0)}ft, 最大TCR: ${maxClosureRate.toFixed(0)}ft/min, 模式: 2A`
        }
      }
      
              // 如果不在Mode 2A包络内，提供状态说明
        if (!inMode2AEnvelope) {
          if (tcr <= 0) {
            message = 'Mode 2仅在正向地形接近率时有效（TCR > 0）'
          } else if (tcr < mode2A_MinTCR) {
            message = `Mode 2A需要TCR ≥ ${mode2A_MinTCR}ft/min才有有效边界`
          } else if (tcr > maxClosureRate) {
            message = `Mode 2A地形接近率超出有效范围（TCR > ${maxClosureRate.toFixed(0)}ft/min）`
          } else if (ra < 30) {
            message = 'Mode 2A低于30ft时自动抑制'
          } else if (ra > upperLimit) {
            message = `Mode 2A高于${upperLimit.toFixed(0)}ft时不激活`
          }
          thresholdInfo = `当前: RA=${ra}ft, TCR=${tcr}ft/min, 有效范围: 30-${upperLimit.toFixed(0)}ft, ${mode2A_MinTCR}-${maxClosureRate.toFixed(0)}ft/min`
        }
    }
    
    this.setData({
      mode2Result: {
        status,
        message,
        type,
        thresholdInfo,
        envelopeInfo
      }
    })
  },

  // Mode 3 具体计算逻辑 - 基于空客AMM的完整实现
  performMode3Calculation() {
    const ra = parseFloat(this.data.mode3RA)
    const actualAltitudeLoss = parseFloat(this.data.mode3AltitudeLoss)
    
    // 验证输入
    if (!ra || ra < 8 || ra > 1500) {
      this.setData({
        mode3Result: {
          status: '输入无效',
          message: 'Mode 3有效范围：8-1500ft RA',
          type: 'warning',
          thresholdInfo: '请输入有效的无线电高度',
          detailedInfo: '参考图表：Mode 3在8ft以下被抑制，1500ft以上不适用'
        }
      })
      return
    }
    
    if (actualAltitudeLoss < 0) {
      this.setData({
        mode3Result: {
          status: '输入无效',
          message: '高度损失不能为负值',
          type: 'warning',
          thresholdInfo: '请输入正确的高度损失值',
          detailedInfo: '高度损失应为正数，表示损失的高度'
        }
      })
      return
    }
    
    // 根据AMM公式和用户说明确定警告门限
    // 整个8-1500ft区间都使用线性关系：ALTITUDE LOSS = 5.4 + 0.092 × RA
    let warningThreshold = 5.4 + 0.092 * ra
    let zone = '线性区域'
    let formula = `5.4 + 0.092 × ${ra} = ${warningThreshold.toFixed(1)}ft`
    
    // 判断是否触发警告
    const isWarningTriggered = actualAltitudeLoss > warningThreshold
    
    let status, message, type
    
    if (isWarningTriggered) {
      status = 'DON\'T SINK 警告'
      message = `警告触发！高度损失${actualAltitudeLoss}ft 超过门限${warningThreshold.toFixed(1)}ft`
      type = 'warning'
    } else {
      status = '安全范围'
      message = `正常状态，高度损失${actualAltitudeLoss}ft 未超过门限${warningThreshold.toFixed(1)}ft`
      type = 'normal'
    }
    
    // 生成结果
    this.setData({
      mode3Result: {
        status: status,
        message: message,
        type: type,
        thresholdInfo: `RA ${ra}ft 对应门限：${warningThreshold.toFixed(1)}ft`,
        detailedInfo: `${zone} | ${formula} | 实际损失：${actualAltitudeLoss}ft | ${isWarningTriggered ? '⚠️ 触发警告' : '✅ 安全范围'}`
      }
    })
  },



  // Mode 4 具体计算逻辑 - 不安全地形穿越分析
  performMode4Calculation() {
    const ra = parseFloat(this.data.mode4RA)
    const airspeed = parseFloat(this.data.mode4Airspeed)
    const subMode = this.data.mode4SubMode
    
    let status = '✅ 正常状态'
    let message = '当前参数在安全范围内'
    let type = 'normal'
    let subModeInfo = ''
    let thresholdInfo = ''
    let envelopeInfo = ''
    
    if (subMode === '4A') {
      // Mode 4A - 巡航和进近阶段
      subModeInfo = 'Mode 4A - 巡航和进近阶段（起落架收上，襟翼非着陆构型）'
      
      const tadHighIntegrity = this.data.mode4A_TADHighIntegrity
      const tcfEnabled = this.data.mode4A_TCFEnabled
      
      // Mode 4A已激活（默认LDG CONF 3已选择）
      {
        // 基于AMM权威文档的Mode 4A计算逻辑
        let threshold = 500  // 标准上边界500ft
        let warningMessage = ''
        let boundaryType = '标准'
        
        // 根据空速和系统状态确定阈值和警告类型
        if (airspeed < 190) {
          // 低于190kts时，穿透500ft边界触发TOO LOW GEAR
          threshold = 500
          warningMessage = 'TOO LOW GEAR'
          boundaryType = '标准边界（500ft）'
        } else {
          // 高于190kts时的扩展警戒区域
          if (tcfEnabled || tadHighIntegrity) {
            // TCF启用或TAD高完整性：边界保持500ft不变
            threshold = 500
            warningMessage = 'TOO LOW TERRAIN'
            boundaryType = '500ft固定（TAD高完整性或TCF启用）'
          } else {
            // TCF未启用且TAD非高完整性：边界线性增加到1000ft
            if (airspeed >= 250) {
              threshold = 1000  // 250kts及以上时最大1000ft
            } else {
              // 190-250kts线性增加：500ft到1000ft
              threshold = 500 + (airspeed - 190) * ((1000 - 500) / (250 - 190))
            }
            warningMessage = 'TOO LOW TERRAIN'
            boundaryType = `扩展告警区域（${threshold.toFixed(0)}ft）`
          }
        }
        
                    // 检查飞越检测影响（基于图表：OVERFLIGHT AND FLAPS UP）
          // Mode 4A默认襟翼收上，所以飞越检测直接适用
          const overflightDetected = this.data.mode4A_OverflightDetected
          if (overflightDetected) {
            // 飞越其他航空器时，最大高度从1000ft降为800ft
            if (threshold > 800) {
              threshold = 800
              boundaryType = boundaryType.indexOf('扩展') !== -1 ? `扩展告警区域（800ft飞越限制）` : `${boundaryType}（800ft飞越限制）`
            }
          }
          
          // 检查几何高度功能影响
          if (tadHighIntegrity && tcfEnabled) {
            // 所有功能高完整性时，最大限制降为500ft
            if (threshold > 500) {
              threshold = 500
              boundaryType = '几何高度激活：500ft最大限制'
              envelopeInfo = '几何高度功能激活：最大限制500ft | '
            }
          }
        
        if (ra < threshold) {
          status = `🚨 ${warningMessage}`
          message = `Mode 4A警告：${warningMessage === 'TOO LOW GEAR' ? '起落架收上时高度过低' : '地形高度过低'}`
          type = 'danger'
          thresholdInfo = `当前RA: ${ra}ft < 阈值: ${threshold.toFixed(0)}ft`
          
          // 添加操作建议
          let actionAdvice = ''
          if (warningMessage === 'TOO LOW GEAR') {
            actionAdvice = ' | 建议：放下起落架或增加高度'
          } else {
            actionAdvice = ' | 建议：增加高度或检查地形'
          }
          
          envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'} | 飞越: ${overflightDetected ? '是' : '否'}${actionAdvice}`
        } else {
          thresholdInfo = `当前RA: ${ra}ft ≥ 阈值: ${threshold.toFixed(0)}ft（安全）`
          envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'} | 飞越: ${overflightDetected ? '是' : '否'}`
        }
      }
      
          } else if (subMode === '4B') {
        // Mode 4B - 进近构型（基于权威文档的精确实现）
        subModeInfo = 'Mode 4B - 进近构型（起落架放下或襟翼着陆构型）'
      
      const gearDown = this.data.mode4B_GearDown  // Mode 4B起落架状态
      const flapsInLanding = this.data.mode4B_FlapsInLanding
      const tadHighIntegrity = this.data.mode4B_TADHighIntegrity
      const tcfEnabled = this.data.mode4B_TCFEnabled
      
      // 根据权威文档：Mode 4B激活条件
      // "Mode 4B is active during cruise and approach, with:
      // - gear in landing configuration OR
      // - flaps in landing configuration and gear not in landing configuration"
      const mode4BActive = gearDown || flapsInLanding
      
      if (!mode4BActive) {
        status = '⚪ 模式未激活'
        message = 'Mode 4B未激活：需要起落架放下或襟翼在着陆构型'
        type = 'normal'
        subModeInfo += ' - 未激活'
        thresholdInfo = 'Mode 4B激活条件：起落架放下 OR 襟翼在着陆构型'
        envelopeInfo = ''
      } else {
        // 检查抑制条件：
        // "All Mode 4 alerts are inhibited if flaps and gear are in landing configuration."
        const allConfigInLanding = gearDown && flapsInLanding
        
        if (allConfigInLanding) {
          status = '⚪ 全构型抑制'
          message = 'Mode 4B被抑制：起落架和襟翼均在着陆构型'
          type = 'normal'
          subModeInfo += ' - 全构型抑制'
          thresholdInfo = '当起落架和襟翼均在着陆构型时，所有Mode 4告警被抑制（正常着陆构型）'
          envelopeInfo = 'GPWS/FLAP MODE开关正常开启，仅全构型时自动抑制告警'
        } else {
          // Mode 4B激活，基于权威文档进行精确计算
          // "The standard upper boundary for Mode 4B is at 245 ft. radio altitude."
          let threshold = 245
          let warningMessage = ''
          let boundaryType = '标准边界（245ft）'
          
          if (airspeed < 159) {
            // "Penetration below 159 kts results in TOO LOW GEAR voice message with gear up,
            // or TOO LOW FLAPS message with gear down and flaps not in Landing configuration"
            threshold = 245
            boundaryType = '固定边界（159kts以下）'
            
            if (!gearDown && flapsInLanding) {
              warningMessage = 'TOO LOW GEAR'  // 起落架收上，襟翼在着陆构型
            } else if (gearDown && !flapsInLanding) {
              warningMessage = 'TOO LOW FLAPS' // 起落架放下，襟翼非着陆构型
            }
          } else {
            // Above 159 kts
            if (!gearDown && flapsInLanding) {
              // "if landing gear is up and flaps are down, the voice message is TOO LOW GEAR.
              // The upper boundary stays constant to a value of 245 ft."
              threshold = 245
              warningMessage = 'TOO LOW GEAR'
              boundaryType = '固定边界（起落架收上+襟翼着陆构型）'
            } else if (gearDown && !flapsInLanding) {
              // "if landing gear is down and flaps are not in landing configuration,
              // the voice message is TOO LOW TERRAIN."
              warningMessage = 'TOO LOW TERRAIN'
              
              if (tadHighIntegrity || tcfEnabled) {
                // "The upper boundary stays constant to a value of 245 ft. if TAD is in high integrity or TCF enabled."
                threshold = 245
                boundaryType = 'TAD/TCF固定边界（245ft）'
              } else {
                // "Otherwise, the upper boundary increases linearly with airspeed to a maximum value of 1000 ft. radio altitude at 250 kts or more."
                if (airspeed >= 250) {
                  threshold = 1000
                  boundaryType = '扩展告警区域（最大1000ft）'
                } else {
                                      // 159-250kts线性增加：245ft到1000ft
                    threshold = 245 + (airspeed - 159) * ((1000 - 245) / (250 - 159))
                    boundaryType = `扩展告警区域（${threshold.toFixed(0)}ft）`
                }
              }
            }
          }
          
          // 检查飞越检测影响（基于图表：OVERFLIGHT AND FLAPS UP）
          // Mode 4B中，只有当襟翼收上时，飞越检测才适用800ft限制
          const overflightDetected = this.data.mode4B_OverflightDetected
          const flapsUp = !flapsInLanding  // 襟翼收上
          if (overflightDetected && flapsUp && threshold > 800) {
            threshold = 800
            boundaryType = boundaryType.indexOf('扩展') !== -1 ? `扩展告警区域（800ft飞越+襟翼收上限制）` : `${boundaryType}（800ft飞越+襟翼收上限制）`
          }
          
          // 检查几何高度功能影响
          // "The Mode 4A and 4B maximum limit is reduced to 500 ft. when all the following functions are active"
          if (tadHighIntegrity && tcfEnabled && threshold > 500) {
            threshold = 500
            boundaryType = '几何高度激活：500ft最大限制'
          }
          
          // 评估告警状态
          if (ra < threshold && warningMessage) {
            status = `🚨 ${warningMessage}`
            let alertType = ''
            if (warningMessage === 'TOO LOW GEAR') {
              alertType = '起落架相关高度过低'
            } else if (warningMessage === 'TOO LOW FLAPS') {
              alertType = '襟翼配置高度过低'
            } else {
              alertType = '地形高度过低'
            }
            
            message = `Mode 4B警告：${alertType}`
            type = 'danger'
            thresholdInfo = `当前RA: ${ra}ft < 阈值: ${threshold.toFixed(0)}ft`
            
            // 添加操作建议
            let actionAdvice = ''
            if (warningMessage === 'TOO LOW GEAR') {
              actionAdvice = ' | 建议：放下起落架或增加高度'
            } else if (warningMessage === 'TOO LOW FLAPS') {
              actionAdvice = ' | 建议：调整襟翼至着陆构型或增加高度'
            } else {
              actionAdvice = ' | 建议：增加高度或检查地形'
            }
            
            envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | 起落架: ${gearDown ? '放下' : '收上'} | 襟翼: ${flapsInLanding ? '着陆构型' : '非着陆构型'} | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'}${actionAdvice}`
          } else {
            thresholdInfo = `当前RA: ${ra}ft ≥ 阈值: ${threshold.toFixed(0)}ft（安全）`
            envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | 起落架: ${gearDown ? '放下' : '收上'} | 襟翼: ${flapsInLanding ? '着陆构型' : '非着陆构型'} | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'}`
          }
        }
      }
      
          } else if (subMode === '4C') {
        // Mode 4C - 起飞阶段地形穿越
        subModeInfo = 'Mode 4C - 起飞阶段地形穿越'
      
      const maxRA = parseFloat(this.data.mode4MaxRA) || 0
      const gearOrFlapsDown = this.data.mode4C_GearOrFlapsDown
      
              if (maxRA <= 0) {
          status = '⚠️ 参数错误'
          message = 'Mode 4C需要输入起飞后达到的最大RA值'
          type = 'warning'
          thresholdInfo = '请输入起飞过程中达到的最大无线电高度'
          envelopeInfo = '示例：起飞后RA从0上升到400ft'
        } else {
          // 实现75%滤波器逻辑
          const filterValue = 0.75 * maxRA
          
          if (ra < filterValue && gearOrFlapsDown) {
            status = '🚨 TOO LOW TERRAIN'
            message = 'Mode 4C警告：起飞阶段地形穿越高度不足！'
            type = 'danger'
            thresholdInfo = `当前RA: ${ra}ft < 滤波器值: ${filterValue.toFixed(0)}ft`
            envelopeInfo = `75%滤波器: 0.75 × ${maxRA}ft = ${filterValue.toFixed(0)}ft | 起落架或襟翼放下时触发警告`
          } else if (ra < filterValue && !gearOrFlapsDown) {
            status = '⚪ 条件不满足'
            message = 'RA低于滤波器值，但起落架和襟翼都收起，不触发警告'
            type = 'normal'
            thresholdInfo = `当前RA: ${ra}ft < 滤波器值: ${filterValue.toFixed(0)}ft`
            envelopeInfo = `75%滤波器: 0.75 × ${maxRA}ft = ${filterValue.toFixed(0)}ft | 需要起落架或襟翼放下才触发警告`
          } else {
            thresholdInfo = `当前RA: ${ra}ft ≥ 滤波器值: ${filterValue.toFixed(0)}ft（安全）`
            envelopeInfo = `75%滤波器: 0.75 × ${maxRA}ft = ${filterValue.toFixed(0)}ft | 起飞阶段地形穿越高度充足`
          }
        }
    }
    
    this.setData({
      mode4Result: {
        status,
        message,
        type,
        subModeInfo,
        thresholdInfo,
        envelopeInfo
      }
    })
  },

  // Mode 5 具体计算逻辑 - 过度下滑道偏离
  performMode5Calculation() {
    const ra = parseFloat(this.data.mode5RA)
    const gsDeviation = parseFloat(this.data.mode5GSDeviation)
    
    let status = '✅ 正常状态'
    let message = '当前参数在安全范围内'
    let type = 'normal'
    let thresholdInfo = ''
    let envelopeInfo = ''
    
    // Mode 5 - 过度下滑道下偏 (基于权威文档的精确实现)
    // 参考：Enhanced GPWS - Descent Below Glide Slope
    
    if (ra >= 1000) {
      message = 'Mode 5 仅在1000ft以下有效'
      thresholdInfo = `当前RA: ${ra}ft，有效范围: <1000ft`
      envelopeInfo = '前航道ILS进近时，1000ft以下才启用下滑道偏离检查'
    } else {
      // 计算基于高度的动态阈值（150ft以下有额外容限）
      let softThreshold = 1.3  // 软警告基准阈值
      let loudThreshold = 2.0  // 硬警告基准阈值
      
      if (ra < 150) {
        // "Both boundaries allow additional deviation below 150 ft. to allow for normal beam variations near the threshold"
        // 150ft以下允许额外偏离容限（根据图表的斜坡计算）
        // 从150ft到30ft，阈值线性增加（图表显示从2dots增加到约3.68dots，从1.3增加到约2.98）
        const additionalDeviation = (150 - ra) / (150 - 30) * (3.68 - 2.0)  // 硬警告额外容限
        loudThreshold = 2.0 + additionalDeviation
        
        const softAdditionalDeviation = (150 - ra) / (150 - 30) * (2.98 - 1.3)  // 软警告额外容限  
        softThreshold = 1.3 + softAdditionalDeviation
        
        envelopeInfo = `150ft以下额外容限：软警告${softThreshold.toFixed(1)} dots，硬警告${loudThreshold.toFixed(1)} dots | 适应跑道阈值附近波束变化`
      } else {
        envelopeInfo = `标准包络线：软警告1.3 dots（1000-150ft），硬警告2.0 dots（300ft以下）`
      }
      
      // 硬警告检查（大声GLIDE SLOPE）- 300ft以下且超过动态阈值
      if (ra < 300 && gsDeviation > loudThreshold) {
        status = '🚨 GLIDE SLOPE'
        message = `GLIDE SLOPE硬警告：严重下滑道偏离（大音量）`
        type = 'danger'
        thresholdInfo = `RA: ${ra}ft < 300ft，偏离度: ${gsDeviation.toFixed(1)} > ${loudThreshold.toFixed(1)} dots`
        
        if (ra < 150) {
          envelopeInfo += ` | 当前处于150ft以下增强容限区域`
        }
      } 
      // 软警告检查（软GLIDE SLOPE）- 1000ft以下且超过动态阈值，但不满足硬警告条件
      else if (gsDeviation > softThreshold && !(ra < 300 && gsDeviation > loudThreshold)) {
        status = '⚠️ GLIDE SLOPE'
        message = `GLIDE SLOPE软警告：下滑道偏离（-6dB音量）`
        type = 'warning'
        thresholdInfo = `RA: ${ra}ft，偏离度: ${gsDeviation.toFixed(1)} > ${softThreshold.toFixed(1)} dots`
        
        if (ra < 150) {
          envelopeInfo += ` | 当前处于150ft以下增强容限区域`
        } else if (ra >= 300) {
          envelopeInfo += ` | 300ft以上仅软警告`
        }
      } else {
        // 安全状态
        thresholdInfo = `RA: ${ra}ft，偏离度: ${gsDeviation.toFixed(1)} dots - 在安全范围内`
        
        if (ra < 300) {
          thresholdInfo += ` | 硬警告阈值: ${loudThreshold.toFixed(1)} dots`
        }
        thresholdInfo += ` | 软警告阈值: ${softThreshold.toFixed(1)} dots`
      }
    }
    
    this.setData({
      mode5Result: {
        status,
        message,
        type,
        thresholdInfo,
        envelopeInfo
      }
    })
  },

  // 新的独立Mode输入事件处理方法
  // Mode 1 事件
  onMode1RAChange(event) {
    this.setData({ mode1RA: event.detail })
  },

  onMode1DescentRateChange(event) {
    this.setData({ mode1DescentRate: event.detail || '' })
  },
  


  // Mode 2 事件
  onMode2RAChange(event) {
    this.setData({ mode2RA: event.detail })
  },
  
  onMode2TCRChange(event) {
    this.setData({ mode2TCR: event.detail })
  },
  
  onMode2AirspeedChange(event) {
    this.setData({ mode2Airspeed: event.detail })
  },
  
    onMode2FlapsChange(event) {
    this.setData({ mode2FlapsInLanding: event.detail })
  },

  onMode2GearChange(event) {
    this.setData({ mode2GearDown: event.detail })
  },

  onMode2ILSChange(event) {
    this.setData({ mode2ILSMode: event.detail })
  },

  onMode2TADChange(event) {
    this.setData({ mode2TADActive: event.detail })
  },

  // Mode 3 事件
  onMode3RAChange(event) {
    this.setData({
      mode3RA: event.detail || ''
    })
  },
  
  onMode3AltitudeLossChange(event) {
    this.setData({
      mode3AltitudeLoss: event.detail || ''
    })
  },

  // 重置Mode 3状态
  resetMode3() {
    this.setData({
      mode3RA: '',
      mode3AltitudeLoss: '',
      mode3Result: null
    })
  },

  // Mode 4 事件
  onMode4RAChange(event) {
    this.setData({ mode4RA: event.detail })
  },
  
  onMode4AirspeedChange(event) {
    this.setData({ mode4Airspeed: event.detail })
  },
  
  onMode4MaxRAChange(event) {
    this.setData({ mode4MaxRA: event.detail })
  },
  
  onMode4GearChange(event) {
    this.setData({ mode4GearUp: event.detail })
  },
  
  onMode4FlapsChange(event) {
    this.setData({ mode4FlapsInLanding: event.detail })
  },
  
  // Mode 4 子模式选择
  showMode4SubModePicker() {
    this.setData({ showMode4SubModePicker: true })
  },
  
  onMode4SubModePickerClose() {
    this.setData({ showMode4SubModePicker: false })
  },
  
  onMode4SubModeCardSelect(event) {
    const selectedMode = event.currentTarget.dataset.mode
    const selectedAction = this.data.mode4SubModeActions.find(item => item.value === selectedMode)
    this.setData({
      mode4SubMode: selectedMode,
      mode4SubModeDisplayName: selectedAction ? selectedAction.name : selectedMode,
      showMode4SubModePicker: false,
      mode4Result: null // 清除之前的计算结果
    })
  },
  
  // Mode 4A 事件处理
  
  onMode4A_TADHighIntegrityChange(event) {
    this.setData({ mode4A_TADHighIntegrity: event.detail })
  },
  
  onMode4A_TCFEnabledChange(event) {
    this.setData({ mode4A_TCFEnabled: event.detail })
  },
  
  onMode4A_OverflightDetectedChange(event) {
    this.setData({ mode4A_OverflightDetected: event.detail })
  },
  
  // Mode 4B 事件处理
  onMode4B_GearDownChange(event) {
    this.setData({ mode4B_GearDown: event.detail })
  },
  
  onMode4B_FlapsInLandingChange(event) {
    this.setData({ mode4B_FlapsInLanding: event.detail })
  },
  
  onMode4B_TADHighIntegrityChange(event) {
    this.setData({ mode4B_TADHighIntegrity: event.detail })
  },
  
  onMode4B_TCFEnabledChange(event) {
    this.setData({ mode4B_TCFEnabled: event.detail })
  },
  
  onMode4B_OverflightDetectedChange(event) {
    this.setData({ mode4B_OverflightDetected: event.detail })
  },
  
  // Mode 4C 事件处理
  onMode4C_GearOrFlapsDownChange(event) {
    this.setData({ mode4C_GearOrFlapsDown: event.detail })
  },

  // Mode 5 事件
  onMode5RAChange(event) {
    this.setData({ mode5RA: event.detail })
  },
  
  onMode5GSDeviationChange(event) {
    this.setData({ mode5GSDeviation: event.detail })
  },

  // PITCH PITCH计算相关方法
  calculatePitchPitch() {
    const validateParams = () => {
      const radioHeight = parseFloat(this.data.pitchRadioHeight);
      const currentPitch = parseFloat(this.data.pitchCurrentPitch);
      const pitchRate = parseFloat(this.data.pitchPitchRate);
      
      if (isNaN(radioHeight) || isNaN(currentPitch) || isNaN(pitchRate)) {
        return { valid: false, message: '请输入有效的无线电高度、当前俯仰角和俯仰率' };
      }

      if (!this.data.pitchAircraftModel) {
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
    const radioHeight = parseFloat(this.data.pitchRadioHeight)
    const currentPitch = parseFloat(this.data.pitchCurrentPitch)
    const pitchRate = parseFloat(this.data.pitchPitchRate)
    
    const predictivePitch = this.calculatePredictivePitch(currentPitch, pitchRate)
    
    // 根据机型确定阈值
    let threshold = 0
    let shouldTrigger = false
    
    switch (this.data.pitchAircraftModel) {
      case 'A320_NO_LIP':
        threshold = 9.25
        shouldTrigger = radioHeight < 20 && predictivePitch > threshold
        break
      case 'A320_LIP':
        threshold = 10
        shouldTrigger = radioHeight < 20 && predictivePitch > threshold
        break
      case 'A321':
        threshold = 8.25
        shouldTrigger = radioHeight < 20 && predictivePitch > threshold
        break
      case 'A330-200':
        threshold = 10.5
        shouldTrigger = radioHeight < 25 && predictivePitch > threshold
        break
      case 'A330-300':
        threshold = 9
        shouldTrigger = radioHeight < 25 && predictivePitch > threshold
        break
    }
    
    const warningStatus = shouldTrigger ? '⚠️ PITCH PITCH' : '✅ 正常'
    
    this.setData({
      pitchResult: true,
      pitchPredictivePitch: predictivePitch.toFixed(2),
      pitchThreshold: threshold.toString(),
      pitchWarningStatus: warningStatus,
      pitchShouldTrigger: shouldTrigger
    })
  },

  onPitchRadioHeightChange(event) {
    this.setData({ pitchRadioHeight: event.detail })
  },

  onPitchCurrentPitchChange(event) {
    this.setData({ pitchCurrentPitch: event.detail })
  },

  onPitchPitchRateChange(event) {
    this.setData({ pitchPitchRate: event.detail })
  },

  showAircraftPicker() {
    this.setData({ showAircraftModelPicker: true })
  },

  onAircraftPickerClose() {
    this.setData({ showAircraftModelPicker: false })
  },

  onAircraftModelSelect(event) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.aircraftModelActions.find(action => action.value === selectedValue)
    
    this.setData({
      pitchAircraftModel: selectedValue,
      pitchAircraftModelDisplay: selectedAction && selectedAction.name || selectedValue,
      showAircraftModelPicker: false
    })
  },

  calculatePredictivePitch(currentPitchDegrees, pitchRateDegreesPerSecond) {
    return currentPitchDegrees + pitchRateDegreesPerSecond * 1.0
  },

  onShareAppMessage() {
    return {
      title: '飞行小工具 - 特殊计算',
      path: '/pages/aviation-calculator/index'
    }
  },

  onShareTimeline() {
    return {
      title: '飞行小工具 - 特殊计算'
    }
  },

  // 温度修正计算相关方法
  calculateColdTemp() {
    const validateParams = () => {
      const airportElevation = parseFloat(this.data.coldTempAirportElevation);
      const airportTemperature = parseFloat(this.data.coldTempAirportTemperature);
      
      if (isNaN(airportElevation) || isNaN(airportTemperature)) {
        return { valid: false, message: '请输入机场标高和温度' };
      }
      
      const altitudes = [
        { name: 'IF高度', value: this.data.coldTempIfAltitude },
        { name: 'FAF高度', value: this.data.coldTempFafAltitude },
        { name: 'DA高度', value: this.data.coldTempDaAltitude },
        { name: '复飞高度', value: this.data.coldTempMissedAltitude },
        { name: '其他高度', value: this.data.coldTempOtherAltitude }
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
    const airportElevation = parseFloat(this.data.coldTempAirportElevation)
    const airportTemperature = parseFloat(this.data.coldTempAirportTemperature)
    
    const altitudes = [
      { name: 'IF高度', value: this.data.coldTempIfAltitude },
      { name: 'FAF高度', value: this.data.coldTempFafAltitude },
      { name: 'DA高度', value: this.data.coldTempDaAltitude },
      { name: '复飞高度', value: this.data.coldTempMissedAltitude },
      { name: '其他高度', value: this.data.coldTempOtherAltitude }
    ].filter(alt => alt.value && !isNaN(parseFloat(alt.value)))
    
    try {
      const results = altitudes.map(alt => {
        const altitude = parseFloat(alt.value)
        const input: ColdTempInput = {
          airportElevationFeet: airportElevation,
          airportTemperatureC: airportTemperature,
          uncorrectedAltitudeFeet: altitude,
          isFafPoint: this.data.coldTempIsFafPoint && alt.name === 'FAF高度',
          fafDistanceNm: this.data.coldTempIsFafPoint && alt.name === 'FAF高度' ? parseFloat(this.data.coldTempFafDistance) : undefined
        }
        
        const result = calculateColdTempCorrection(input)
        
        return {
          name: alt.name,
          originalAltitude: altitude,
          correctionFeet: result.correctionFeet,
          correctedAltitudeFeet: result.correctedAltitudeFeet,
          vpaInfo: result.vpaInfo
        }
      })
      
      this.setData({
        coldTempResult: { results },
        coldTempError: ''
      })
      
    } catch (error) {
      this.setData({ coldTempError: error.message || '计算出错' })
    }
  },

  onColdTempAirportElevationChange(event) {
    this.setData({ 
      coldTempAirportElevation: event.detail,
      coldTempError: ''
    })
  },

  // 机场温度输入实时处理（支持负数）
  onColdTempAirportTemperatureInput(event) {
    let value = event.detail.value || ''
    
    // 如果值为空，直接返回
    if (!value) {
      return value
    }
    
    // 允许输入：数字、小数点、负号（仅在开头）
    // 移除所有非法字符，但保留数字、小数点和负号
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
    
    // 返回处理后的值，这会更新输入框显示
    return value
  },

  onColdTempAirportTemperatureChange(event) {
    this.setData({ 
      coldTempAirportTemperature: event.detail,
      coldTempError: ''
    })
  },

  onColdTempIfAltitudeChange(event) {
    this.setData({ 
      coldTempIfAltitude: event.detail,
      coldTempError: ''
    })
  },

  onColdTempFafAltitudeChange(event) {
    this.setData({ 
      coldTempFafAltitude: event.detail,
      coldTempError: ''
    })
  },

  onColdTempDaAltitudeChange(event) {
    this.setData({ 
      coldTempDaAltitude: event.detail,
      coldTempError: ''
    })
  },

  onColdTempMissedAltitudeChange(event) {
    this.setData({ 
      coldTempMissedAltitude: event.detail,
      coldTempError: ''
    })
  },

  onColdTempOtherAltitudeChange(event) {
    this.setData({ 
      coldTempOtherAltitude: event.detail,
      coldTempError: ''
    })
  },

  onColdTempFafDistanceChange(event) {
    this.setData({ 
      coldTempFafDistance: event.detail,
      coldTempError: ''
    })
  },

  toggleColdTempFafPoint() {
    this.setData({
      coldTempIsFafPoint: !this.data.coldTempIsFafPoint,
      coldTempError: ''
    })
  },

  // ACR-PCR计算相关方法
  calculateACR() {
    const validateParams = () => {
      if (!this.data.acrSelectedVariant) {
        return { valid: false, message: '请选择飞机型号和改型' };
      }

      if (!this.data.acrAircraftMass) {
        return { valid: false, message: '请输入飞机重量' };
      }

      if (!this.data.acrPcrNumber) {
        return { valid: false, message: '请输入PCR数值' };
      }

      if (!this.data.acrPavementType) {
        return { valid: false, message: '请选择道面类型' };
      }

      if (!this.data.acrSubgradeStrength) {
        return { valid: false, message: '请选择道基强度类别' };
      }

      const mass = parseFloat(this.data.acrAircraftMass);
      const pcr = parseFloat(this.data.acrPcrNumber);

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
    // 验证输入
    const showError = (errorMsg) => {
      this.setData({ acrError: errorMsg })
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '.acr-error-section',
          duration: 500
        })
      }, 300)
    }

    try {
      const mass = parseFloat(this.data.acrAircraftMass)
      const pcr = parseFloat(this.data.acrPcrNumber)

      // 调用ACR管理器进行计算
      const acrManager = require('../../utils/acr-manager.js');
      const acrQueryResult = acrManager.queryACR(
        this.data.acrSelectedModel,
        this.data.acrSelectedVariant,
        mass,
        this.data.acrPavementType,
        this.data.acrSubgradeStrength
      )

      if (!acrQueryResult) {
        showError('ACR计算失败，请检查输入参数')
        return
      }

      // 构建完整的结果对象
      const safetyMargin = pcr - acrQueryResult.acr
      const canOperate = safetyMargin >= 0
      
      // 胎压检查逻辑
      const tirePressureCheckPassed = this.checkTirePressure(acrQueryResult.tirePressure, this.data.acrTirePressure)
      
      // 组装PCR代码
      const pcrCode = acrManager.assemblePCRCode(
        pcr,
        this.data.acrPavementType,
        this.data.acrSubgradeStrength,
        this.data.acrTirePressure || 'W'
      )

      const result = {
        // 飞机信息
        aircraftInfo: `${this.data.acrSelectedManufacturer} ${this.data.acrSelectedModel}`,
        variantName: this.data.acrSelectedVariant,
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
        evaluationMethod: this.data.acrEvaluationMethodDisplay || '技术评估',
        
        // ACR-PCR对比结果
        acr: acrQueryResult.acr,
        pcr: pcr,
        safetyMargin: safetyMargin,
        
        // 运行结论
        canOperate: canOperate && tirePressureCheckPassed,
        operationStatus: (canOperate && tirePressureCheckPassed) ? '可以运行' : '不建议运行',
        operationReason: this.getOperationReason(canOperate, tirePressureCheckPassed, safetyMargin)
      }

      this.setData({
        acrResult: result,
        acrError: ''
      })

    } catch (error) {
      showError(`计算错误: ${error.message || '未知错误'}`)
    }
  },

  /**
   * 检查胎压是否符合要求
   */
  checkTirePressure(aircraftTirePressure, airportTirePressureLimit) {
    if (!aircraftTirePressure || !airportTirePressureLimit) {
      return true // 如果没有数据，默认通过
    }

    // 胎压限制映射 (MPa)
    const pressureLimits = {
      'W': Infinity,  // 无限制
      'X': 1.75,      // 高压限制
      'Y': 1.25,      // 中压限制  
      'Z': 0.50       // 低压限制
    }

    const limit = pressureLimits[airportTirePressureLimit as keyof typeof pressureLimits]
    return limit === undefined || aircraftTirePressure <= limit
  },

  /**
   * 获取运行结论原因
   */
  getOperationReason(canOperate, tirePressureCheckPassed, safetyMargin) {
    if (!tirePressureCheckPassed) {
      return '飞机轮胎压力超过道面限制'
    }
    
    if (!canOperate) {
      return `ACR值超过PCR值 ${Math.abs(safetyMargin)} 点`
    }
    
    if (safetyMargin === 0) {
      return 'ACR值等于PCR值，刚好满足要求'
    }
    
    return `安全余量 ${safetyMargin} 点，符合运行要求`
  },

  showManufacturerPicker() {
    if (!this.data.acrDataLoaded) {
      this.initACRData()
      return
    }
    this.setData({ showAcrManufacturerPicker: true })
  },

  onAcrManufacturerPickerClose() {
    this.setData({ showAcrManufacturerPicker: false })
  },

  onAcrManufacturerSelect(event) {
    const selectedValue = event.detail.value
    
    // 加载该制造商的型号列表
    const acrManager = require('../../utils/acr-manager.js');
    const models = acrManager.getModelsByManufacturer(selectedValue)
    const modelActions = models.map((model) => ({
      name: model.model,
      value: model.model
    }))
    
    this.setData({
      acrSelectedManufacturer: selectedValue,
      acrSelectedModel: '',
      acrSelectedVariant: '',
      acrSelectedVariantDisplay: '',
      acrModelActions: modelActions,
      acrVariantActions: [],
      showAcrManufacturerPicker: false,
      acrResult: null,
      acrError: ''
    })
  },

  showModelPicker() {
    if (!this.data.acrSelectedManufacturer) {
      wx.showToast({
        title: '请先选择制造商',
        icon: 'none'
      })
      return
    }
    this.setData({ showAcrModelPicker: true })
  },

  onAcrModelPickerClose() {
    this.setData({ showAcrModelPicker: false })
  },

  onAcrModelSelect(event) {
    const selectedValue = event.detail.value
    
    // 加载该型号的变型列表
    const acrManager = require('../../utils/acr-manager.js');
    const variants = acrManager.getVariantsByModel(selectedValue)
    const variantActions = variants.map((variant) => ({
      name: variant.displayName, // 使用包含重量信息的显示名称
      value: variant.variantName // 实际值仍使用原始变型名称
    }))
    
    this.setData({
      acrSelectedModel: selectedValue,
      acrSelectedVariant: '',
      acrSelectedVariantDisplay: '',
      acrVariantActions: variantActions,
      showAcrModelPicker: false,
      acrResult: null,
      acrError: ''
    })
  },

  showVariantPicker() {
    if (!this.data.acrSelectedModel) {
      wx.showToast({
        title: '请先选择飞机型号',
        icon: 'none'
      })
      return
    }
    this.setData({ showAcrVariantPicker: true })
  },

  onAcrVariantPickerClose() {
    this.setData({ showAcrVariantPicker: false })
  },

  onAcrVariantSelect(event) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.acrVariantActions.find(action => action.value === selectedValue)
    
    // 获取变型详细信息
    const acrManager = require('../../utils/acr-manager.js');
    const variants = acrManager.getVariantsByModel(this.data.acrSelectedModel)
    const variantInfo = variants.find((v) => v.variantName === selectedValue)
    
    if (variantInfo) {
      // 检查是否为波音机型（需要输入重量范围）
      const isBoeing = this.data.acrSelectedManufacturer === 'Boeing'
      
      // 处理质量数据 - 可能是对象（Boeing）或数字（Airbus）
      let massDisplay = ''
      if (typeof variantInfo.mass_kg === 'object' && variantInfo.mass_kg.min && variantInfo.mass_kg.max) {
        // Boeing机型显示重量范围
        massDisplay = `${variantInfo.mass_kg.min}-${variantInfo.mass_kg.max}`
      } else if (typeof variantInfo.mass_kg === 'number') {
        // Airbus机型显示固定重量
        massDisplay = variantInfo.mass_kg.toString()
      }
      
      this.setData({
        acrSelectedVariant: selectedValue,
        acrSelectedVariantDisplay: selectedAction && selectedAction.name || variantInfo.displayName || selectedValue, // 优先显示带重量信息的名称
        acrMassInputEnabled: isBoeing,
        acrMassDisplayLabel: isBoeing ? '飞机重量 (范围内)' : '标准重量',
        acrAircraftMass: isBoeing ? '' : massDisplay,
        showAcrVariantPicker: false,
        acrResult: null,
        acrError: ''
      })
    }
  },

  onAcrAircraftMassChange(event) {
    this.setData({ 
      acrAircraftMass: event.detail,
      acrResult: null,
      acrError: ''
    })
  },

  onAcrPcrNumberChange(event) {
    this.setData({ 
      acrPcrNumber: event.detail,
      acrResult: null,
      acrError: ''
    })
  },

  showPavementTypePicker() {
    this.setData({ showPavementTypePicker: true })
  },

  onPavementTypePickerClose() {
    this.setData({ showPavementTypePicker: false })
  },

  onPavementTypeSelect(event) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.pavementTypeActions.find(action => action.value === selectedValue)
    
    this.setData({
      acrPavementType: selectedValue,
      acrPavementTypeDisplay: selectedAction && selectedAction.name || selectedValue,
      showPavementTypePicker: false
    })
  },

  showSubgradeStrengthPicker() {
    this.setData({ showSubgradeStrengthPicker: true })
  },

  onSubgradeStrengthPickerClose() {
    this.setData({ showSubgradeStrengthPicker: false })
  },

  onSubgradeStrengthSelect(event) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.subgradeStrengthActions.find(action => action.value === selectedValue)
    
    this.setData({
      acrSubgradeStrength: selectedValue,
      acrSubgradeStrengthDisplay: selectedAction && selectedAction.name || selectedValue,
      showSubgradeStrengthPicker: false
    })
  },

  showTirePressurePicker() {
    this.setData({ showTirePressurePicker: true })
  },

  onTirePressurePickerClose() {
    this.setData({ showTirePressurePicker: false })
  },

  onTirePressureSelect(event) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.tirePressureActions.find(action => action.value === selectedValue)
    
    this.setData({
      acrTirePressure: selectedValue,
      acrTirePressureDisplay: selectedAction && selectedAction.name || selectedValue,
      showTirePressurePicker: false
    })
  },

  showEvaluationMethodPicker() {
    this.setData({ showEvaluationMethodPicker: true })
  },

  onEvaluationMethodPickerClose() {
    this.setData({ showEvaluationMethodPicker: false })
  },

  onEvaluationMethodSelect(event) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.evaluationMethodActions.find(action => action.value === selectedValue)
    
    this.setData({
      acrEvaluationMethod: selectedValue,
      acrEvaluationMethodDisplay: selectedAction && selectedAction.name || selectedValue,
      showEvaluationMethodPicker: false
    })
  },

  // 🎯 基于Context7最佳实践：广告相关方法
  
  // 初始化广告
  initAd() {
    try {
      const adManagerUtil = require('../../utils/ad-manager.js');
      const adManager = new adManagerUtil();
      const adUnit = adManager.getBestAdUnit('calculator');
      
      if (adUnit) {
        this.setData({
          showAd: true,
          adUnitId: adUnit.id
        });
        
        console.log('🎯 航空计算器页面：广告初始化成功', adUnit);
      } else {
        console.log('🎯 航空计算器页面：无适合的广告单元或用户偏好设置');
        this.setData({ showAd: false });
      }
    } catch (error) {
      console.error('航空计算器页面广告初始化失败:', error);
      this.setData({ showAd: false });
    }
  },

  // 广告加载成功回调
  onAdLoad() {
    try {
      const adManagerUtil = require('../../utils/ad-manager.js');
      const adManager = new adManagerUtil();
      adManager.recordAdShown(this.data.adUnitId);
      console.log('🎯 航空计算器页面：广告加载成功');
    } catch (error) {
      console.error('广告加载回调处理失败:', error);
    }
  },

  // 广告加载失败回调
  onAdError(err) {
    console.log('🎯 航空计算器页面：广告加载失败，优雅降级', err);
    this.setData({ showAd: false });
  }
}) 
