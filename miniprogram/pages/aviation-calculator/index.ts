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
    
    // GPWS计算相关
    gpwsRA: '',
    gpwsDescentRate: '',
    gpwsAirspeed: '',
    gpwsAltitudeLoss: '',
    gpwsGSDeviation: '',
    gpwsFlapsInLanding: false,
    gpwsGearUp: false,
    gpwsAlertResult: '',
    gpwsThresholdInfo: '',
    gpwsAlertType: 'normal',

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

  // GPWS计算相关方法
  calculateGPWS() {
    // 参数验证函数
    const validateParams = () => {
      const ra = parseFloat(this.data.gpwsRA);
      const descentRate = parseFloat(this.data.gpwsDescentRate);
      const airspeed = parseFloat(this.data.gpwsAirspeed);
      const altitudeLoss = parseFloat(this.data.gpwsAltitudeLoss);
      const gsDeviation = parseFloat(this.data.gpwsGSDeviation);
      
      // 检查是否有足够的参数进行任一模式的计算
      const hasMode1Params = !isNaN(ra) && !isNaN(descentRate);
      const hasMode3Params = !isNaN(ra) && !isNaN(altitudeLoss);
      const hasMode4Params = !isNaN(ra) && !isNaN(airspeed);
      const hasMode5Params = !isNaN(ra) && !isNaN(gsDeviation);
      
      if (!hasMode1Params && !hasMode3Params && !hasMode4Params && !hasMode5Params) {
        return { valid: false, message: '请至少输入无线电高度和以下参数之一：下降率、高度损失、空速或下滑道偏离' };
      }
      
      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      this.performGPWSCalculation();
    };

    // 使用扣费管理器执行计算
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS模式分析',
      performCalculation
    );
  },

  // 重构后的专业GPWS计算逻辑
  performGPWSCalculation() {
    const ra = parseFloat(this.data.gpwsRA)
    const descentRate = parseFloat(this.data.gpwsDescentRate)
    const airspeed = parseFloat(this.data.gpwsAirspeed)
    const altitudeLoss = parseFloat(this.data.gpwsAltitudeLoss)
    const gsDeviation = parseFloat(this.data.gpwsGSDeviation)
    const flapsInLanding = this.data.gpwsFlapsInLanding
    const gearUp = this.data.gpwsGearUp
    
    let alertResult = '无告警'
    let thresholdInfo = ''
    let alertType = 'normal'
    
    // 计算地形接近率 (简化为下降率，实际应考虑地形梯度)
    const terrainClosureRate = descentRate
    
    // 模式1 - 过度下降率 (Excessive Descent Rate)
    // 基于霍尼韦尔EGPWS手册和空客AMM的精确公式
    if (!isNaN(ra) && !isNaN(descentRate) && ra > 10 && ra < 2450) {
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
        alertResult = 'PULL UP'
        thresholdInfo = `模式1: PULL UP警告 (RA: ${ra} < ${pullUpThreshold.toFixed(0)} ft, DR: ${descentRate} ft/min)`
        alertType = 'danger'
      } else if (ra < sinkRateThreshold) {
        alertResult = 'SINK RATE'
        thresholdInfo = `模式1: 过大下降率 (RA: ${ra} < ${sinkRateThreshold.toFixed(0)} ft, DR: ${descentRate} ft/min)`
        alertType = 'warning'
      }
    }
    
    // 模式2 - 过度地形接近率 (Excessive Terrain Closure Rate)
    // 根据图表修正阈值计算
    if (!isNaN(ra) && !isNaN(terrainClosureRate)) {
      if (flapsInLanding) {
        // 模式2B - 襟翼在着陆构型
        let terrainThreshold, pullUpThreshold
        if (ra < 500) {
          terrainThreshold = 1500
        } else {
          terrainThreshold = 1.0 * (ra - 500) + 1500  // 线性增长
        }
        
        if (ra < 300) {
          pullUpThreshold = 2500
        } else {
          pullUpThreshold = 0.9 * (ra - 300) + 2500  // 较缓的线性增长
        }
        
        if (terrainClosureRate > pullUpThreshold) {
          alertResult = 'PULL UP'
          thresholdInfo = `模式2B: PULL UP警告 (TCR: ${terrainClosureRate} > ${pullUpThreshold.toFixed(0)})`
          alertType = 'danger'
        } else if (terrainClosureRate > terrainThreshold) {
          alertResult = 'TERRAIN'
          thresholdInfo = `Mode 2B: Terrain Alert (TCR: ${terrainClosureRate} > ${terrainThreshold.toFixed(0)})`
          alertType = 'warning'
        }
      } else {
        // 模式2A - 襟翼未在着陆构型
        let terrainThreshold, pullUpThreshold
        if (ra < 700) {
          terrainThreshold = 2500
        } else {
          terrainThreshold = 1.4 * (ra - 700) + 2500  // 更陡的线性增长
        }
        
        if (ra < 500) {
          pullUpThreshold = 3500
        } else {
          pullUpThreshold = 1.25 * (ra - 500) + 3500
        }
        
        if (terrainClosureRate > pullUpThreshold) {
          alertResult = 'PULL UP'
          thresholdInfo = `模式2A: PULL UP警告 (TCR: ${terrainClosureRate} > ${pullUpThreshold.toFixed(0)})`
          alertType = 'danger'
        } else if (terrainClosureRate > terrainThreshold) {
          alertResult = 'TERRAIN'
          thresholdInfo = `Mode 2A: Terrain Alert (TCR: ${terrainClosureRate} > ${terrainThreshold.toFixed(0)})`
          alertType = 'warning'
        }
      }
    }
    
    // 模式3 - 起飞后过度高度损失 (Excessive Altitude Loss after Take-off)
    // 基于霍尼韦尔EGPWS手册和空客AMM的精确公式
    if (!isNaN(ra) && !isNaN(altitudeLoss) && ra > 30 && ra < 700) {
      // 精确公式: AL > (5.4 + 0.092 * RA)
      const allowedAltitudeLoss = 5.4 + 0.092 * ra
      if (altitudeLoss > allowedAltitudeLoss) {
        alertResult = 'DON\'T SINK'
        thresholdInfo = `模式3: 起飞后高度损失 (${altitudeLoss} > ${allowedAltitudeLoss.toFixed(1)} ft)`
        alertType = 'warning'
      }
    }
    
    // 模式4 - 不安全地形穿越 (Unsafe Terrain Clearance)
    // 根据图表修正速度阈值
    if (!isNaN(ra) && !isNaN(airspeed)) {
      if (gearUp && !flapsInLanding) {
        // 模式4A - 起落架收上，襟翼未在着陆构型
        // 图表显示：空速190kt是关键转折点
        let threshold
        if (airspeed <= 190) {
          threshold = 500  // 在190kt及以下，阈值为500ft
        } else {
          // 图表显示线性增长，斜率约为8.3
          threshold = 8.3 * (airspeed - 190) + 500
        }
        
        if (ra < threshold) {
          if (ra < 240) {  // 根据图表添加TOO LOW TERRAIN区域
            alertResult = 'TOO LOW TERRAIN'
            thresholdInfo = `Mode 4A: Too Low Terrain (RA: ${ra} < ${threshold.toFixed(0)} ft, AS: ${airspeed} kt)`
          } else {
            alertResult = 'TOO LOW GEAR'
            thresholdInfo = `Mode 4A: Too Low Gear (RA: ${ra} < ${threshold.toFixed(0)} ft, AS: ${airspeed} kt)`
          }
          alertType = 'warning'
        }
      } else if (!gearUp && !flapsInLanding) {
        // 模式4B - 起落架放下，襟翼未在着陆构型
        // 图表显示：空速150kt是关键转折点
        let threshold
        if (airspeed <= 150) {
          threshold = 240  // 在150kt及以下，阈值为240ft
        } else {
          // 图表显示线性增长，斜率约为5.2
          threshold = 5.2 * (airspeed - 150) + 240
        }
        
        if (ra < threshold) {
          alertResult = 'TOO LOW FLAPS'
          thresholdInfo = `Mode 4B: Too Low Flaps (RA: ${ra} < ${threshold.toFixed(0)} ft, AS: ${airspeed} kt)`
          alertType = 'warning'
        }
      }
    }
    
    // 模式5 - 过度下滑道下偏 (Excessive Glide Slope Deviation)
    // 基于霍尼韦尔EGPWS手册的精确逻辑：软警告和硬警告两个级别
    if (!isNaN(ra) && !isNaN(gsDeviation) && ra < 1000) {
      // 硬警告: (RA < 300 ft) AND (Dev_dots > 2.0)
      if (ra < 300 && gsDeviation > 2.0) {
        alertResult = 'GLIDE SLOPE'
        thresholdInfo = `模式5: 下滑道硬警告 (RA: ${ra} < 300ft, 偏离: ${gsDeviation} > 2.0 dots)`
        alertType = 'danger'
      } 
      // 软警告: (RA < 1000 ft) AND (Dev_dots > 1.3)
      else if (gsDeviation > 1.3) {
        alertResult = 'GLIDE SLOPE'
        thresholdInfo = `模式5: 下滑道软警告 (RA: ${ra} < 1000ft, 偏离: ${gsDeviation} > 1.3 dots)`
        alertType = 'warning'
      }
    }
    
    this.setData({
      gpwsAlertResult: alertResult,
      gpwsThresholdInfo: thresholdInfo,
      gpwsAlertType: alertType
    })
  },

  onGpwsFlapsChange(event: any) {
    this.setData({
      gpwsFlapsInLanding: event.detail
    })
  },

  onGpwsGearChange(event: any) {
    this.setData({
      gpwsGearUp: event.detail
    })
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

  // GPWS输入处理方法
  onGpwsRAChange(event: any) {
    this.setData({ gpwsRA: event.detail })
  },

  onGpwsDescentRateChange(event: any) {
    this.setData({ gpwsDescentRate: event.detail })
  },

  onGpwsAirspeedChange(event: any) {
    this.setData({ gpwsAirspeed: event.detail })
  },

  onGpwsAltitudeLossChange(event: any) {
    this.setData({ gpwsAltitudeLoss: event.detail })
  },

  onGpwsGSDeviationChange(event: any) {
    this.setData({ gpwsGSDeviation: event.detail })
  },
}) 