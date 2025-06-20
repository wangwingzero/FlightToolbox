// 特殊计算页面

import { calculateColdTempCorrection, ColdTempInput, CorrectionResult } from '../../utils/coldTempCalculator';

// 引入ACR管理器
const acrManager = require('../../utils/acr-manager.js');
// 引入按钮收费管理器
const buttonChargeManager = require('../../utils/button-charge-manager.js');

Page({
  data: {
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
    mode1DescentRate: '',
    mode1Result: null as any,

    // Mode 2 参数
    mode2RA: '',
    mode2TCR: '',
    mode2Airspeed: '',
    mode2FlapsInLanding: false,
    mode2TADActive: false,
    mode2Result: null as any,

    // Mode 3 参数
    mode3RA: '',
    mode3AltitudeLoss: '',
    mode3Result: null as any,

    // Mode 4 参数
    mode4RA: '',
    mode4Airspeed: '',
    mode4MaxRA: '',
    mode4GearUp: false,
    mode4FlapsInLanding: false,
    mode4TADActive: false,
    mode4Result: null as any,

    // Mode 5 参数
    mode5RA: '',
    mode5GSDeviation: '',
    mode5Result: null as any,

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
    coldTempResult: null as any,
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
    
    acrResult: null as any,
    acrError: '',
    
    // ACR选择器相关
    showAcrManufacturerPicker: false,
    showAcrModelPicker: false,
    showAcrVariantPicker: false,
    acrManufacturerActions: [] as any[],
    acrModelActions: [] as any[],
    acrVariantActions: [] as any[],

    // PCR参数选择器
    showPavementTypePicker: false,
    showSubgradeStrengthPicker: false,
    showTirePressurePicker: false,
    showEvaluationMethodPicker: false,
    pavementTypeActions: [] as any[],
    subgradeStrengthActions: [] as any[],
    tirePressureActions: [] as any[],
    evaluationMethodActions: [] as any[],
    
    // ACR数据加载状态
    acrDataLoaded: false,
  },

  onLoad() {
    // 页面加载时不立即初始化ACR数据，等用户切换到ACR标签页时再加载
    console.log('特殊计算页面加载完成')
  },

  onTabChange(event: any) {
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
      
      const acrData = await acrManager.loadACRData()
      console.log('📊 ACR数据加载结果:', acrData ? '成功' : '失败')
      
      // 加载制造商列表
      const manufacturers = acrManager.getManufacturers()
      console.log('🏭 制造商列表:', manufacturers)
      
      if (manufacturers.length === 0) {
        throw new Error('制造商列表为空')
      }
      
      const manufacturerActions = manufacturers.map((manufacturer: string) => ({
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
        { name: 'X - 高 (High) ≤1.75 MPa (254 psi)', value: 'X' },
        { name: 'Y - 中 (Medium) ≤1.25 MPa (181 psi)', value: 'Y' },
        { name: 'Z - 低 (Low) ≤0.50 MPa (73 psi)', value: 'Z' }
      ]
      
      const evaluationMethodActions = [
        { name: 'T - 技术评估 (Technical evaluation)', value: 'T' },
        { name: 'U - 经验评估 (Using aircraft experience)', value: 'U' }
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
      
    } catch (error: any) {
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
    // 参数验证函数
    const validateParams = () => {
      const gradient = this.data.gradientInput ? parseFloat(this.data.gradientInput) : null;
      const groundSpeed = this.data.groundSpeedInput ? parseFloat(this.data.groundSpeedInput) : null;
      const verticalSpeed = this.data.verticalSpeedInput ? parseFloat(this.data.verticalSpeedInput) : null;
      const angle = this.data.angleInput ? parseFloat(this.data.angleInput) : null;

      // 至少需要两个参数
      const nonNullParams = [gradient, groundSpeed, verticalSpeed, angle].filter(p => p !== null && !isNaN(p));
      if (nonNullParams.length < 2) {
        return { valid: false, message: '请至少输入两个参数' };
      }

      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      this.performGradientConversion();
    };

    // 使用扣费管理器执行计算
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
      
      if (!mode1RA || !mode1DescentRate) {
        return { valid: false, message: '请输入无线电高度和下降率' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performMode1Calculation();
    };

    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calculator',
      validateParams,
      'GPWS Mode 1 分析',
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

    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calculator',
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

    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calculator',
      validateParams,
      'GPWS Mode 3 分析',
      performCalculation
    );
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

    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calculator',
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

    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calculator',
      validateParams,
      'GPWS Mode 5 分析',
      performCalculation
    );
  },

  // Mode 1 具体计算逻辑 - 过度下降率
  performMode1Calculation() {
    const ra = parseFloat(this.data.mode1RA)
    const descentRate = parseFloat(this.data.mode1DescentRate)
    
    let status = '正常状态'
    let message = '当前参数在安全范围内'
    let type = 'normal'
    let thresholdInfo = ''
    
    // 模式1 - 过度下降率 (Excessive Descent Rate)
    // 基于霍尼韦尔EGPWS手册和空客AMM的精确公式
    if (ra > 10 && ra < 2450) {
      // 下降率为负值（下降为负），但输入为正值，需要转换
      const DR_neg = -Math.abs(descentRate)
      
      // "SINK RATE" (外边界): RA < (-572 - 0.6035 * DR_neg)
      const sinkRateThreshold = -572 - 0.6035 * DR_neg
      
      // "PULL UP" (内边界): 分高低高度两段
      let pullUpThreshold
      if (ra > 1000) {
        // 高高度: RA < (-400 - 0.400 * DR_neg)
        pullUpThreshold = -400 - 0.400 * DR_neg
      } else {
        // 低高度: RA < (-1620 - 1.1133 * DR_neg)
        pullUpThreshold = -1620 - 1.1133 * DR_neg
      }
      
      if (ra < pullUpThreshold) {
        status = 'PULL UP'
        message = `PULL UP警告：无线电高度过低且下降率过大`
        type = 'danger'
        thresholdInfo = `RA: ${ra}ft < ${pullUpThreshold.toFixed(0)}ft (阈值), 下降率: ${descentRate}ft/min`
      } else if (ra < sinkRateThreshold) {
        status = 'SINK RATE'
        message = `SINK RATE警告：下降率过大`
        type = 'warning'
        thresholdInfo = `RA: ${ra}ft < ${sinkRateThreshold.toFixed(0)}ft (阈值), 下降率: ${descentRate}ft/min`
      }
    }
    
    this.setData({
      mode1Result: {
        status,
        message,
        type,
        thresholdInfo
      }
    })
  },

  // Mode 2 具体计算逻辑 - 过度地形接近率
  performMode2Calculation() {
    const ra = parseFloat(this.data.mode2RA)
    const tcr = parseFloat(this.data.mode2TCR)
    const airspeed = parseFloat(this.data.mode2Airspeed) || 180  // 默认空速
    const flapsInLanding = this.data.mode2FlapsInLanding
    const tadActive = this.data.mode2TADActive
    
    let status = '正常状态'
    let message = '当前参数在安全范围内'
    let type = 'normal'
    let thresholdInfo = ''
    
    // 模式2 - 过度地形接近率 (Excessive Terrain Closure Rate)
    // 基于霍尼韦尔EGPWS手册和空客AMM的精确公式
    if (flapsInLanding) {
      // 模式2B - 襟翼在着陆构型
      const threshold2B = -1579 + 0.7895 * tcr
      const upperLimit = tadActive ? 950 : 789  // TAD激活时限制上限
      
      if (ra < threshold2B && ra < upperLimit) {
        status = 'TERRAIN'
        message = `TERRAIN警告：地形接近率过大（襟翼着陆构型）`
        type = 'warning'
        thresholdInfo = `RA: ${ra}ft < ${threshold2B.toFixed(0)}ft (阈值), TCR: ${tcr}ft/min, 上限: ${upperLimit}ft`
      }
    } else {
      // 模式2A - 襟翼未在着陆构型
      const threshold2A = -1579 + 0.7895 * tcr
      let upperLimit = 1650  // 基础上限
      
      // 空速扩展（仅在TAD未激活时）
      if (!tadActive && airspeed >= 220) {
        if (airspeed >= 310) {
          upperLimit = 2450
        } else {
          upperLimit = 1650 + (airspeed - 220) * ((2450 - 1650) / (310 - 220))
        }
      } else if (tadActive) {
        upperLimit = 950  // TAD激活时固定较低上限
      }
      
      if (ra < threshold2A && ra < upperLimit) {
        status = 'TERRAIN'
        message = `TERRAIN警告：地形接近率过大`
        type = 'warning'
        thresholdInfo = `RA: ${ra}ft < ${threshold2A.toFixed(0)}ft (阈值), TCR: ${tcr}ft/min, 空速: ${airspeed}kt, 上限: ${upperLimit.toFixed(0)}ft`
      }
    }
    
    this.setData({
      mode2Result: {
        status,
        message,
        type,
        thresholdInfo
      }
    })
  },

  // Mode 3 具体计算逻辑 - 起飞后过度高度损失
  performMode3Calculation() {
    const ra = parseFloat(this.data.mode3RA)
    const altitudeLoss = parseFloat(this.data.mode3AltitudeLoss)
    
    let status = '正常状态'
    let message = '当前参数在安全范围内'
    let type = 'normal'
    let thresholdInfo = ''
    
    // 模式3 - 起飞后过度高度损失 (Excessive Altitude Loss after Take-off)
    // 基于霍尼韦尔EGPWS手册和空客AMM的精确公式
    if (ra > 30 && ra < 700) {
      // 精确公式: AL > (5.4 + 0.092 * RA)
      const allowedAltitudeLoss = 5.4 + 0.092 * ra
      
      if (altitudeLoss > allowedAltitudeLoss) {
        status = 'DON\'T SINK'
        message = `DON'T SINK警告：起飞后高度损失过大`
        type = 'warning'
        thresholdInfo = `高度损失: ${altitudeLoss}ft > ${allowedAltitudeLoss.toFixed(1)}ft (阈值), RA: ${ra}ft`
      }
    } else {
      message = 'Mode 3 仅在30-700ft无线电高度范围内有效'
      thresholdInfo = `当前RA: ${ra}ft，有效范围: 30-700ft`
    }
    
    this.setData({
      mode3Result: {
        status,
        message,
        type,
        thresholdInfo
      }
    })
  },

  // Mode 4 具体计算逻辑 - 不安全地形穿越
  performMode4Calculation() {
    const ra = parseFloat(this.data.mode4RA)
    const airspeed = parseFloat(this.data.mode4Airspeed)
    const maxRA = parseFloat(this.data.mode4MaxRA) || 0
    const gearUp = this.data.mode4GearUp
    const flapsInLanding = this.data.mode4FlapsInLanding
    const tadActive = this.data.mode4TADActive
    
    let status = '正常状态'
    let message = '当前参数在安全范围内'
    let type = 'normal'
    let thresholdInfo = ''
    
    // 模式4 - 不安全地形穿越 (Unsafe Terrain Clearance)
    if (gearUp && !flapsInLanding) {
      // 模式4A - 起落架收上，襟翼未在着陆构型
      let threshold = 500  // 基础阈值
      
      // 空速扩展（仅在TAD未激活时）
      if (!tadActive && airspeed > 190) {
        if (airspeed >= 250) {
          threshold = 1000
        } else {
          threshold = 500 + (airspeed - 190) * ((1000 - 500) / (250 - 190))
        }
      }
      
      if (ra < threshold) {
        if (ra < 240) {
          status = 'TOO LOW TERRAIN'
          message = `TOO LOW TERRAIN警告：高度过低`
        } else {
          status = 'TOO LOW GEAR'
          message = `TOO LOW GEAR警告：起落架收上时高度过低`
        }
        type = 'warning'
        thresholdInfo = `RA: ${ra}ft < ${threshold.toFixed(0)}ft (阈值), 空速: ${airspeed}kt, TAD: ${tadActive ? '激活' : '未激活'}`
      }
    } else if (!gearUp && !flapsInLanding) {
      // 模式4B - 起落架放下，襟翼未在着陆构型
      let threshold = 245  // 基础阈值
      
      // 空速扩展（仅在TAD未激活时）
      if (!tadActive && airspeed > 159) {
        if (airspeed >= 250) {
          threshold = 1000
        } else {
          threshold = 245 + (airspeed - 159) * ((1000 - 245) / (250 - 159))
        }
      }
      
      if (ra < threshold) {
        status = 'TOO LOW FLAPS'
        message = `TOO LOW FLAPS警告：襟翼未在着陆构型时高度过低`
        type = 'warning'
        thresholdInfo = `RA: ${ra}ft < ${threshold.toFixed(0)}ft (阈值), 空速: ${airspeed}kt, TAD: ${tadActive ? '激活' : '未激活'}`
      }
    }
    
    // 模式4C - 起飞/复飞阶段（需要最大高度参数）
    if (maxRA > 0) {
      const mtc = 0.75 * maxRA  // 最小地形穿越高度
      if (ra < mtc) {
        status = 'TOO LOW TERRAIN'
        message = `TOO LOW TERRAIN警告：低于起飞后最小地形穿越高度`
        type = 'warning'
        thresholdInfo = `RA: ${ra}ft < ${mtc.toFixed(0)}ft (75%最大高度), 最大RA: ${maxRA}ft`
      }
    }
    
    this.setData({
      mode4Result: {
        status,
        message,
        type,
        thresholdInfo
      }
    })
  },

  // Mode 5 具体计算逻辑 - 过度下滑道偏离
  performMode5Calculation() {
    const ra = parseFloat(this.data.mode5RA)
    const gsDeviation = parseFloat(this.data.mode5GSDeviation)
    
    let status = '正常状态'
    let message = '当前参数在安全范围内'
    let type = 'normal'
    let thresholdInfo = ''
    
    // 模式5 - 过度下滑道下偏 (Excessive Glide Slope Deviation)
    // 基于霍尼韦尔EGPWS手册的精确逻辑：软警告和硬警告两个级别
    if (ra < 1000) {
      // 硬警告: (RA < 300 ft) AND (Dev_dots > 2.0)
      if (ra < 300 && gsDeviation > 2.0) {
        status = 'GLIDE SLOPE'
        message = `GLIDE SLOPE硬警告：严重下滑道偏离`
        type = 'danger'
        thresholdInfo = `RA: ${ra}ft < 300ft, 偏离度: ${gsDeviation} > 2.0 dots`
      } 
      // 软警告: (RA < 1000 ft) AND (Dev_dots > 1.3)
      else if (gsDeviation > 1.3) {
        status = 'GLIDE SLOPE'
        message = `GLIDE SLOPE软警告：下滑道偏离`
        type = 'warning'
        thresholdInfo = `RA: ${ra}ft < 1000ft, 偏离度: ${gsDeviation} > 1.3 dots`
      }
    } else {
      message = 'Mode 5 仅在1000ft以下有效'
      thresholdInfo = `当前RA: ${ra}ft，有效范围: <1000ft`
    }
    
    this.setData({
      mode5Result: {
        status,
        message,
        type,
        thresholdInfo
      }
    })
  },

  // 清空所有GPWS输入和结果
  clearAllGPWS() {
    this.setData({
      // Mode 1
      mode1RA: '',
      mode1DescentRate: '',
      mode1Result: null,
      
      // Mode 2
      mode2RA: '',
      mode2TCR: '',
      mode2Airspeed: '',
      mode2FlapsInLanding: false,
      mode2TADActive: false,
      mode2Result: null,
      
      // Mode 3
      mode3RA: '',
      mode3AltitudeLoss: '',
      mode3Result: null,
      
      // Mode 4
      mode4RA: '',
      mode4Airspeed: '',
      mode4MaxRA: '',
      mode4GearUp: false,
      mode4FlapsInLanding: false,
      mode4TADActive: false,
      mode4Result: null,
      
      // Mode 5
      mode5RA: '',
      mode5GSDeviation: '',
      mode5Result: null
    })
    
    wx.showToast({
      title: '已清空所有输入',
      icon: 'success',
      duration: 1500
    })
  },

  // 新的独立Mode输入事件处理方法
  // Mode 1 事件
  onMode1RAChange(event: any) {
    this.setData({ mode1RA: event.detail })
  },
  
  onMode1DescentRateChange(event: any) {
    this.setData({ mode1DescentRate: event.detail })
  },

  // Mode 2 事件
  onMode2RAChange(event: any) {
    this.setData({ mode2RA: event.detail })
  },
  
  onMode2TCRChange(event: any) {
    this.setData({ mode2TCR: event.detail })
  },
  
  onMode2AirspeedChange(event: any) {
    this.setData({ mode2Airspeed: event.detail })
  },
  
  onMode2FlapsChange(event: any) {
    this.setData({ mode2FlapsInLanding: event.detail })
  },
  
  onMode2TADChange(event: any) {
    this.setData({ mode2TADActive: event.detail })
  },

  // Mode 3 事件
  onMode3RAChange(event: any) {
    this.setData({ mode3RA: event.detail })
  },
  
  onMode3AltitudeLossChange(event: any) {
    this.setData({ mode3AltitudeLoss: event.detail })
  },

  // Mode 4 事件
  onMode4RAChange(event: any) {
    this.setData({ mode4RA: event.detail })
  },
  
  onMode4AirspeedChange(event: any) {
    this.setData({ mode4Airspeed: event.detail })
  },
  
  onMode4MaxRAChange(event: any) {
    this.setData({ mode4MaxRA: event.detail })
  },
  
  onMode4GearChange(event: any) {
    this.setData({ mode4GearUp: event.detail })
  },
  
  onMode4FlapsChange(event: any) {
    this.setData({ mode4FlapsInLanding: event.detail })
  },
  
  onMode4TADChange(event: any) {
    this.setData({ mode4TADActive: event.detail })
  },

  // Mode 5 事件
  onMode5RAChange(event: any) {
    this.setData({ mode5RA: event.detail })
  },
  
  onMode5GSDeviationChange(event: any) {
    this.setData({ mode5GSDeviation: event.detail })
  },

  // PITCH PITCH计算相关方法
  calculatePitchPitch() {
    // 参数验证函数
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

    // 实际计算逻辑
    const performCalculation = () => {
      this.performPitchPitchCalculation();
    };

    // 使用扣费管理器执行计算
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

  onPitchRadioHeightChange(event: any) {
    this.setData({ pitchRadioHeight: event.detail })
  },

  onPitchCurrentPitchChange(event: any) {
    this.setData({ pitchCurrentPitch: event.detail })
  },

  onPitchPitchRateChange(event: any) {
    this.setData({ pitchPitchRate: event.detail })
  },

  showAircraftPicker() {
    this.setData({ showAircraftModelPicker: true })
  },

  onAircraftPickerClose() {
    this.setData({ showAircraftModelPicker: false })
  },

  onAircraftModelSelect(event: any) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.aircraftModelActions.find(action => action.value === selectedValue)
    
    this.setData({
      pitchAircraftModel: selectedValue,
      pitchAircraftModelDisplay: selectedAction && selectedAction.name || selectedValue,
      showAircraftModelPicker: false
    })
  },

  calculatePredictivePitch(currentPitchDegrees: number, pitchRateDegreesPerSecond: number): number {
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
    // 参数验证函数
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

    // 实际计算逻辑
    const performCalculation = () => {
      this.performColdTempCalculation();
    };

    // 使用扣费管理器执行计算
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
      
    } catch (error: any) {
      this.setData({ coldTempError: error.message || '计算出错' })
    }
  },

  onColdTempAirportElevationChange(event: any) {
    this.setData({ 
      coldTempAirportElevation: event.detail,
      coldTempError: ''
    })
  },

  // 机场温度输入实时处理（支持负数）
  onColdTempAirportTemperatureInput(event: any) {
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

  onColdTempAirportTemperatureChange(event: any) {
    this.setData({ 
      coldTempAirportTemperature: event.detail,
      coldTempError: ''
    })
  },

  onColdTempIfAltitudeChange(event: any) {
    this.setData({ 
      coldTempIfAltitude: event.detail,
      coldTempError: ''
    })
  },

  onColdTempFafAltitudeChange(event: any) {
    this.setData({ 
      coldTempFafAltitude: event.detail,
      coldTempError: ''
    })
  },

  onColdTempDaAltitudeChange(event: any) {
    this.setData({ 
      coldTempDaAltitude: event.detail,
      coldTempError: ''
    })
  },

  onColdTempMissedAltitudeChange(event: any) {
    this.setData({ 
      coldTempMissedAltitude: event.detail,
      coldTempError: ''
    })
  },

  onColdTempOtherAltitudeChange(event: any) {
    this.setData({ 
      coldTempOtherAltitude: event.detail,
      coldTempError: ''
    })
  },

  onColdTempFafDistanceChange(event: any) {
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
    // 参数验证函数
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

    // 实际计算逻辑
    const performCalculation = () => {
      this.performACRCalculation();
    };

    // 使用扣费管理器执行计算
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
    const showError = (errorMsg: string) => {
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

    } catch (error: any) {
      showError(`计算错误: ${error.message || '未知错误'}`)
    }
  },

  /**
   * 检查胎压是否符合要求
   */
  checkTirePressure(aircraftTirePressure: number, airportTirePressureLimit: string): boolean {
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
  getOperationReason(canOperate: boolean, tirePressureCheckPassed: boolean, safetyMargin: number): string {
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

  onAcrManufacturerSelect(event: any) {
    const selectedValue = event.detail.value
    
    // 加载该制造商的型号列表
    const models = acrManager.getModelsByManufacturer(selectedValue)
    const modelActions = models.map((model: any) => ({
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

  onAcrModelSelect(event: any) {
    const selectedValue = event.detail.value
    
    // 加载该型号的变型列表
    const variants = acrManager.getVariantsByModel(selectedValue)
    const variantActions = variants.map((variant: any) => ({
      name: variant.variantName,
      value: variant.variantName
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

  onAcrVariantSelect(event: any) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.acrVariantActions.find(action => action.value === selectedValue)
    
    // 获取变型详细信息
    const variants = acrManager.getVariantsByModel(this.data.acrSelectedModel)
    const variantInfo = variants.find((v: any) => v.variantName === selectedValue)
    
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
        acrSelectedVariantDisplay: selectedAction && selectedAction.name || selectedValue,
        acrMassInputEnabled: isBoeing,
        acrMassDisplayLabel: isBoeing ? '飞机重量 (范围内)' : '标准重量',
        acrAircraftMass: isBoeing ? '' : massDisplay,
        showAcrVariantPicker: false,
        acrResult: null,
        acrError: ''
      })
    }
  },

  onAcrAircraftMassChange(event: any) {
    this.setData({ 
      acrAircraftMass: event.detail,
      acrResult: null,
      acrError: ''
    })
  },

  onAcrPcrNumberChange(event: any) {
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

  onPavementTypeSelect(event: any) {
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

  onSubgradeStrengthSelect(event: any) {
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

  onTirePressureSelect(event: any) {
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

  onEvaluationMethodSelect(event: any) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.evaluationMethodActions.find(action => action.value === selectedValue)
    
    this.setData({
      acrEvaluationMethod: selectedValue,
      acrEvaluationMethodDisplay: selectedAction && selectedAction.name || selectedValue,
      showEvaluationMethodPicker: false
    })
  },
}) 