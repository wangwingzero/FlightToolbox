// 特殊计算页面

import { calculateColdTempCorrection, ColdTempInput, CorrectionResult } from '../../utils/coldTempCalculator';

// 引入ACR管理器
const acrManager = require('../../utils/acr-manager.js');

// PAPI计算常量
const NM_TO_METERS = 1852.0;
const METERS_TO_FEET = 3.28084;
const FEET_TO_METERS = 1 / METERS_TO_FEET;

// PAPI灯光角度配置 - 标准P3配置
const PAPI_STANDARD_ANGLES = {
  A_deg_min: [2, 30],  // 过低指示上边界
  B_deg_min: [2, 50],  // 正常下滑道下边界  
  C_deg_min: [3, 10],  // 正常下滑道上边界
  D_deg_min: [3, 30]   // 过高指示下边界
};



// PAPI辅助函数
function dmsToDecimalDegrees(degrees: number, minutes: number, seconds: number = 0): number {
  return degrees + minutes / 60 + seconds / 3600;
}



function calculateHeightAtDistanceMeters(distanceToPapiM: number, angleDegMinTuple: number[]): number {
  const angleDecimalDeg = dmsToDecimalDegrees(angleDegMinTuple[0], angleDegMinTuple[1]);
  const angleRad = angleDecimalDeg * Math.PI / 180;
  const heightM = distanceToPapiM * Math.tan(angleRad);
  return heightM;
}

Page({
  data: {
    activeTab: 0,
    

    
    // QFE计算
    qnhInput: '',
    qfeInput: '',
    elevationInput: '',
    qnhResult: '',
    qfeResult: '',
    

    

    
    // PAPI计算
    papiDistToThreshold: '5.0',
    papiDistanceToRunway: '420', // 默认420米
    papiAirportElevation: '0.0', // 默认0米
    papiResults: null as any,
    papiStatusText: '',
    
    // GPWS计算相关
    gpwsRA: '',
    gpwsDescentRate: '',
    gpwsAirspeed: '',
    gpwsAltitudeLoss: '',
    gpwsMaxRaGained: '',
    gpwsGSDeviation: '',
    gpwsRollAngle: '',
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

    // GRF雪情通告解码相关
    grfSnowTamInput: '',
    
    // 解码结果
    grfDecodedResult: null as any,
    grfError: ''
  },

  onLoad() {
    // 页面加载时不立即初始化ACR数据，等用户切换到ACR标签页时再加载
    console.log('特殊计算页面加载完成')
    
    // GRF工具默认为空，让用户直接输入
    this.setData({
      grfSnowTamInput: ''
    })
  },

  onTabChange(event: any) {
    this.setData({
      activeTab: event.detail.index
    })
    
    // 如果切换到ACR标签页且数据未加载，则加载数据
    if (event.detail.index === 4 && !this.data.acrDataLoaded) {
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
        acrError: '' // 清除错误信息
      })
      
      console.log('✅ ACR数据初始化完成，制造商数量:', manufacturers.length)
    } catch (error: any) {
      console.error('❌ ACR数据初始化失败:', error)
      this.setData({
        acrError: `ACR数据加载失败: ${error.message || '未知错误'}`,
        acrDataLoaded: false
      })
    }
  },





  // QFE计算相关方法
  onQNHInputChange(event: any) {
    this.setData({
      qnhInput: event.detail
    })
  },

  onQFEInputChange(event: any) {
    this.setData({
      qfeInput: event.detail
    })
  },

  onElevationInputChange(event: any) {
    this.setData({
      elevationInput: event.detail
    })
  },

  convertQNHtoQFE() {
    const qnh = parseFloat(this.data.qnhInput)
    const elevation = parseFloat(this.data.elevationInput)
    
    if (isNaN(qnh) || isNaN(elevation)) {
      wx.showToast({
        title: '请输入有效的QNH和机场标高',
        icon: 'none'
      })
      return
    }

    // QFE = QNH - (标高 × 0.03386)
    const qfe = qnh - (elevation * 0.03386)
    
    this.setData({
      qfeResult: qfe.toFixed(1)
    })
  },

  convertQFEtoQNH() {
    const qfe = parseFloat(this.data.qfeInput)
    const elevation = parseFloat(this.data.elevationInput)
    
    if (isNaN(qfe) || isNaN(elevation)) {
      wx.showToast({
        title: '请输入有效的QFE和机场标高',
        icon: 'none'
      })
      return
    }

    // QNH = QFE + (标高 × 0.03386)
    const qnh = qfe + (elevation * 0.03386)
    
    this.setData({
      qnhResult: qnh.toFixed(1)
    })
  },



  // PAPI输入字段变化处理
  onPapiDistToThresholdChange(event: any) {
    this.setData({ papiDistToThreshold: event.detail });
  },

  onPapiDistanceToRunwayChange(event: any) {
    this.setData({ papiDistanceToRunway: event.detail });
  },

  onPapiAirportElevationChange(event: any) {
    this.setData({ papiAirportElevation: event.detail });
  },

  // PAPI计算主方法
  calculatePAPI() {
    try {
      const distToThresholdNm = parseFloat(this.data.papiDistToThreshold);
      const papiDistanceInputVal = parseFloat(this.data.papiDistanceToRunway);
      const airportElevationInputVal = parseFloat(this.data.papiAirportElevation);
      
      if (isNaN(distToThresholdNm) || distToThresholdNm < 0) {
        wx.showToast({ title: '请输入有效的到跑道头距离', icon: 'none' });
        return;
      }
      
      if (isNaN(papiDistanceInputVal) || papiDistanceInputVal <= 0) {
        wx.showToast({ title: '请输入有效的PAPI距跑道头距离', icon: 'none' });
        return;
      }
      
      if (isNaN(airportElevationInputVal)) {
        wx.showToast({ title: '请输入有效的机场标高', icon: 'none' });
        return;
      }
      
      const distToThresholdM = distToThresholdNm * NM_TO_METERS;
      
      // PAPI距跑道头距离已经是米制
      const papiDistanceM = papiDistanceInputVal;
      
      const distToPapiM = distToThresholdM + papiDistanceM;
      
      if (distToPapiM <= 0) {
        wx.showToast({ title: '飞机已飞过PAPI灯，指示不适用', icon: 'none' });
        this.setData({
          papiResults: {
            TOO_HIGH: '不适用',
            SLIGHTLY_HIGH: '不适用',
            ON_PATH: '不适用',
            SLIGHTLY_LOW: '不适用',
            TOO_LOW: '不适用'
          },
          papiStatusText: '飞机已飞过PAPI灯或在其正上方'
        });
        return;
      }
      
      // 使用标准P3角度计算各高度
      const hAM = calculateHeightAtDistanceMeters(distToPapiM, PAPI_STANDARD_ANGLES.A_deg_min);
      const hBM = calculateHeightAtDistanceMeters(distToPapiM, PAPI_STANDARD_ANGLES.B_deg_min);
      const hCM = calculateHeightAtDistanceMeters(distToPapiM, PAPI_STANDARD_ANGLES.C_deg_min);
      const hDM = calculateHeightAtDistanceMeters(distToPapiM, PAPI_STANDARD_ANGLES.D_deg_min);
      
      // 转换为MSL高度（加上机场标高）
      const airportElevationM = airportElevationInputVal;
      const hAMslM = hAM + airportElevationM;
      const hBMslM = hBM + airportElevationM;
      const hCMslM = hCM + airportElevationM;
      const hDMslM = hDM + airportElevationM;
      
      // 转换为英尺显示
      const hAFt = hAMslM * METERS_TO_FEET;
      const hBFt = hBMslM * METERS_TO_FEET;
      const hCFt = hCMslM * METERS_TO_FEET;
      const hDFt = hDMslM * METERS_TO_FEET;
      
      const results = {
        TOO_HIGH: `≥ ${hDFt.toFixed(0)} 英尺`,
        SLIGHTLY_HIGH: `${hCFt.toFixed(0)} 英尺 - ${hDFt.toFixed(0)} 英尺 (不含)`,
        ON_PATH: `${hBFt.toFixed(0)} 英尺 - ${hCFt.toFixed(0)} 英尺 (不含)`,
        SLIGHTLY_LOW: `${hAFt.toFixed(0)} 英尺 - ${hBFt.toFixed(0)} 英尺 (不含)`,
        TOO_LOW: `< ${hAFt.toFixed(0)} 英尺`
      };
      
      // 生成状态文本
      const distToPapiNmDisplay = distToPapiM / NM_TO_METERS;
      
      let statusText = `飞机到PAPI实际距离: ${distToPapiNmDisplay.toFixed(2)} 海里。`;
      statusText += `PAPI安装: 距跑道头 ${papiDistanceInputVal.toFixed(1)} 米。`;
      statusText += `机场标高: ${airportElevationInputVal.toFixed(1)} 米。`;
      statusText += `计算基于标准PAPI配置 (P3标准，20米眼高设计)。`;
      
      this.setData({
        papiResults: results,
        papiStatusText: statusText
      });
      
    } catch (error) {
      wx.showToast({ title: '计算出错，请检查输入', icon: 'none' });
      console.error('PAPI计算错误:', error);
    }
  },

  // GPWS输入字段变化处理
  onGpwsRAChange(event: any) {
    this.setData({ gpwsRA: event.detail });
  },

  onGpwsDescentRateChange(event: any) {
    this.setData({ gpwsDescentRate: event.detail });
  },

  onGpwsAirspeedChange(event: any) {
    this.setData({ gpwsAirspeed: event.detail });
  },

  onGpwsAltitudeLossChange(event: any) {
    this.setData({ gpwsAltitudeLoss: event.detail });
  },

  onGpwsMaxRaGainedChange(event: any) {
    this.setData({ gpwsMaxRaGained: event.detail });
  },

  onGpwsGSDeviationChange(event: any) {
    this.setData({ gpwsGSDeviation: event.detail });
  },

  onGpwsRollAngleChange(event: any) {
    this.setData({ gpwsRollAngle: event.detail });
  },



  // GPWS计算主方法
  calculateGPWS() {
    const ra = parseFloat(this.data.gpwsRA || 'NaN');
    const descentRate = parseFloat(this.data.gpwsDescentRate || 'NaN');
    const airspeed = parseFloat(this.data.gpwsAirspeed || 'NaN');
    const altitudeLoss = parseFloat(this.data.gpwsAltitudeLoss || 'NaN');
    const maxRaGained = parseFloat(this.data.gpwsMaxRaGained || 'NaN');
    const gsDeviation = parseFloat(this.data.gpwsGSDeviation || 'NaN');
    const rollAngle = parseFloat(this.data.gpwsRollAngle || 'NaN');
    const flapsInLandingConfig = this.data.gpwsFlapsInLanding;
    const gearUp = this.data.gpwsGearUp;

    let message: string = "无基础告警";
    let type: 'alert' | 'normal' = "normal";
    let thresholdMsg: string = "";
    let triggered: boolean = false;

    if (isNaN(ra)) {
      this.setData({ 
        gpwsAlertResult: "请输入无线电高度", 
        gpwsAlertType: "alert", 
        gpwsThresholdInfo: "" 
      });
      return;
    }

    // 定义最接近模式信息
    interface ClosestModeInfo {
      name: string;
      diff: number;
      current: string;
      threshold: string;
    }

    let closestMode: ClosestModeInfo = { name: "", diff: Infinity, current: "", threshold: "" };

    const updateClosest = (
      modeName: string,
      currentVal: number,
      thresholdVal: number | { lower: number; upper: number } | null,
      conditionMet: boolean = false
    ): void => {
      if (conditionMet) {
        triggered = true;
        return;
      }
      if (triggered || thresholdVal === null) return;

      let diff: number = Infinity;
      let currentThresholdStr: string = "";

      if (typeof thresholdVal === 'number') {
        diff = Math.abs(currentVal - thresholdVal);
        currentThresholdStr = `门限约 ${thresholdVal.toFixed(1)}`;
      } else if (thresholdVal && typeof thresholdVal === 'object' && 'lower' in thresholdVal && 'upper' in thresholdVal) {
        const range = thresholdVal;
        if (currentVal < range.lower) diff = range.lower - currentVal;
        else if (currentVal > range.upper) diff = currentVal - range.upper;
        else diff = 0;
        currentThresholdStr = `应在 ${range.lower.toFixed(1)}-${range.upper.toFixed(1)} 之间`;
      }

      if (diff < closestMode.diff) {
        closestMode.name = modeName;
        closestMode.diff = diff;
        closestMode.current = `${currentVal.toFixed(1)}`;
        closestMode.threshold = currentThresholdStr;
      }
    };

    // --- Mode 1: Excessive Descent Rate ---
    if (ra > 30 && ra <= 2500 && !isNaN(descentRate)) {
      let pullUpBoundaryDR = Infinity;
      if (ra < 500) pullUpBoundaryDR = 4000;
      else if (ra < 1800) pullUpBoundaryDR = (2000 + (1800 - ra) * (8000 / 1300));

      let sinkRateBoundaryDR = Infinity;
      if (ra < 1000) sinkRateBoundaryDR = 2500;
      else if (ra < 2400) sinkRateBoundaryDR = (1500 + (2400 - ra) * (6000 / 1400));

      if (descentRate > pullUpBoundaryDR) {
        message = "PULL UP (Mode 1)";
        type = "alert";
        thresholdMsg = `下降率 ${descentRate.toFixed(0)} ft/min, 超过RA ${ra.toFixed(0)}ft 时门限约 ${pullUpBoundaryDR.toFixed(0)} ft/min`;
        triggered = true;
      } else if (!triggered && descentRate > sinkRateBoundaryDR) {
        message = "SINK RATE (Mode 1)";
        type = "alert";
        thresholdMsg = `下降率 ${descentRate.toFixed(0)} ft/min, 超过RA ${ra.toFixed(0)}ft 时门限约 ${sinkRateBoundaryDR.toFixed(0)} ft/min`;
        triggered = true;
      }
      if (!triggered) {
        updateClosest("Mode 1 (SINK RATE)", descentRate, sinkRateBoundaryDR);
        if (descentRate <= sinkRateBoundaryDR) {
          updateClosest("Mode 1 (PULL UP)", descentRate, pullUpBoundaryDR);
        }
      }
    }

    // --- Mode 2A & 2B (使用Descent Rate代替Terrain Closure Rate) ---
    if (!triggered && ra > 30 && !isNaN(descentRate) && !isNaN(airspeed)) {
      let mode2Name: string = "";
      let pullUpBoundaryDR_M2: number = Infinity;
      let terrainBoundaryDR_M2: number = Infinity;

      if (!flapsInLandingConfig && ra <= 2500) { // Mode 2A
        mode2Name = "Mode 2A";
        const effectiveRaLimitPullUp = airspeed > 220 ? 1800 : 1500;
        const effectiveRaLimitTerrain = airspeed > 220 ? 2400 : 2000;

        if (ra < (effectiveRaLimitPullUp * 0.4)) pullUpBoundaryDR_M2 = 4000;
        else if (ra < effectiveRaLimitPullUp) pullUpBoundaryDR_M2 = (2500 + (effectiveRaLimitPullUp - ra) * (7500 / (effectiveRaLimitPullUp * 0.6)));

        if (ra < (effectiveRaLimitTerrain * 0.5)) terrainBoundaryDR_M2 = 2000;
        else if (ra < effectiveRaLimitTerrain) terrainBoundaryDR_M2 = (1500 + (effectiveRaLimitTerrain - ra) * (8500 / (effectiveRaLimitTerrain * 0.5)));

      } else if (flapsInLandingConfig && ra <= 1000) { // Mode 2B
        mode2Name = "Mode 2B";
        const effectiveRaLimitPullUp = 600;
        const effectiveRaLimitTerrain = 800;

        if (ra < 250) pullUpBoundaryDR_M2 = 3500;
        else if (ra < effectiveRaLimitPullUp) pullUpBoundaryDR_M2 = (2000 + (effectiveRaLimitPullUp - ra) * (6000 / 350));

        if (ra < 400) terrainBoundaryDR_M2 = 1500;
        else if (ra < effectiveRaLimitTerrain) terrainBoundaryDR_M2 = (1000 + (effectiveRaLimitTerrain - ra) * (8000 / 400));
      }

      if (mode2Name) {
        if (descentRate > pullUpBoundaryDR_M2) {
          message = `PULL UP (${mode2Name})`;
          type = "alert";
          thresholdMsg = `下降率 ${descentRate.toFixed(0)}, 超过RA ${ra.toFixed(0)}ft 时门限约 ${pullUpBoundaryDR_M2.toFixed(0)}`;
          triggered = true;
        } else if (!triggered && descentRate > terrainBoundaryDR_M2) {
          message = `TERRAIN TERRAIN (${mode2Name})`;
          type = "alert";
          thresholdMsg = `下降率 ${descentRate.toFixed(0)}, 超过RA ${ra.toFixed(0)}ft 时门限约 ${terrainBoundaryDR_M2.toFixed(0)}`;
          triggered = true;
        }
        if (!triggered) {
          updateClosest(`${mode2Name} (TERRAIN)`, descentRate, terrainBoundaryDR_M2);
          if (descentRate <= terrainBoundaryDR_M2) {
            updateClosest(`${mode2Name} (PULL UP)`, descentRate, pullUpBoundaryDR_M2);
          }
        }
      }
    }

    // --- Mode 3: Excessive Altitude Loss after Take-off ---
    if (!triggered && ra > 30 && ra <= 700 && !isNaN(altitudeLoss) && altitudeLoss > 0) {
      const lossBoundary = (0.2 * ra + 10);
      if (altitudeLoss > lossBoundary) {
        message = "DON'T SINK (Mode 3)";
        type = "alert";
        thresholdMsg = `高度损失 ${altitudeLoss.toFixed(0)}ft, 超过RA ${ra.toFixed(0)}ft 时门限约 ${lossBoundary.toFixed(0)}ft`;
        triggered = true;
      }
      if (!triggered) updateClosest("Mode 3", altitudeLoss, lossBoundary);
    }

    // --- Mode 4A: Gear up, Flaps not landing ---
    if (!triggered && gearUp && !flapsInLandingConfig && ra > 30 && ra <= 1000 && !isNaN(airspeed)) {
      const raBoundary4A = 500;
      const airspeedThresh4A = 190;
      if (ra < raBoundary4A) {
        if (airspeed < airspeedThresh4A) {
          message = "TOO LOW GEAR (Mode 4A)";
          thresholdMsg = `RA ${ra.toFixed(0)}ft < ${raBoundary4A}ft (空速 ${airspeed.toFixed(0)}kt < ${airspeedThresh4A}kt)`;
        } else {
          message = "TOO LOW TERRAIN (Mode 4A)";
          thresholdMsg = `RA ${ra.toFixed(0)}ft < ${raBoundary4A}ft (空速 ${airspeed.toFixed(0)}kt >= ${airspeedThresh4A}kt)`;
        }
        type = "alert";
        triggered = true;
      }
      if (!triggered) updateClosest("Mode 4A (RA)", ra, {lower: -Infinity, upper: raBoundary4A - 0.1});
    }

    // --- Mode 4B: Gear down, Flaps not landing ---
    if (!triggered && !gearUp && !flapsInLandingConfig && ra > 30 && ra <= 1000 && !isNaN(airspeed)) {
      const raBoundary4B = 250;
      const airspeedThresh4B = 190;
      if (ra < raBoundary4B) {
        if (airspeed < airspeedThresh4B) {
          message = "TOO LOW FLAPS (Mode 4B)";
          thresholdMsg = `RA ${ra.toFixed(0)}ft < ${raBoundary4B}ft (空速 ${airspeed.toFixed(0)}kt < ${airspeedThresh4B}kt)`;
        } else {
          message = "TOO LOW TERRAIN (Mode 4B)";
          thresholdMsg = `RA ${ra.toFixed(0)}ft < ${raBoundary4B}ft (空速 ${airspeed.toFixed(0)}kt >= ${airspeedThresh4B}kt)`;
        }
        type = "alert";
        triggered = true;
      }
      if (!triggered) updateClosest("Mode 4B (RA)", ra, {lower: -Infinity, upper: raBoundary4B - 0.1});
    }

    // --- Mode 4C: EGPWS only, Gear up OR Flaps not landing ---
    if (!triggered && (gearUp || !flapsInLandingConfig) && ra > 30 && ra <= 1000 && !isNaN(maxRaGained) && maxRaGained > 0 && !isNaN(airspeed)) {
      let raLimit4C = 30;
      if (airspeed <= 190) raLimit4C = Math.min(600, 50 + (maxRaGained / 2400) * 550);
      else if (airspeed >= 250) raLimit4C = Math.min(1000, 50 + (maxRaGained / 2400) * 950);
      else { // 线性插值
        const factor = (airspeed - 190) / (250 - 190);
        const limitLow = 50 + (maxRaGained / 2400) * 550;
        const limitHigh = 50 + (maxRaGained / 2400) * 950;
        raLimit4C = Math.min(1000, limitLow + factor * (limitHigh - limitLow));
      }
      if (raLimit4C < 30) raLimit4C = 30; // 保证最低30

      if (ra < raLimit4C) {
        message = "TOO LOW TERRAIN (Mode 4C)";
        type = "alert";
        thresholdMsg = `RA ${ra.toFixed(0)}ft < 计算门限 ${raLimit4C.toFixed(0)}ft (基于空速和最大爬升RA)`;
        triggered = true;
      }
      if (!triggered) updateClosest("Mode 4C (RA)", ra, {lower: -Infinity, upper: raLimit4C - 0.1});
    }

    // --- Mode 5: Excessive Glide Slope Deviation ---
    if (!triggered && ra > 30 && ra <= 1000 && !isNaN(gsDeviation) && gsDeviation > 0) {
      let gsDevBoundary = 0;
      if (ra >= 200) gsDevBoundary = 1.3 + ((1000 - ra) / 800) * 0.7;
      else gsDevBoundary = 2.0 + ((200 - ra) / 170) * 1.5;

      if (gsDeviation > gsDevBoundary) {
        message = "GLIDE SLOPE (Mode 5)";
        type = "alert";
        thresholdMsg = `下滑道偏离 ${gsDeviation.toFixed(1)}点, 超过RA ${ra.toFixed(0)}ft 时门限约 ${gsDevBoundary.toFixed(1)}点`;
        triggered = true;
      }
      if (!triggered) updateClosest("Mode 5 (GS Dev)", gsDeviation, gsDevBoundary);
    }

    // --- Mode 6: Excessive Bank Angle ---
    if (!triggered && ra > 30 && ra < 150 && !isNaN(rollAngle)) {
      const bankAngleBoundary = 35;
      if (Math.abs(rollAngle) > bankAngleBoundary) {
        message = "BANK ANGLE BANK ANGLE (Mode 6)";
        type = "alert";
        thresholdMsg = `坡度 |${rollAngle.toFixed(0)}°| > ${bankAngleBoundary}°`;
        triggered = true;
      }
      if (!triggered) updateClosest("Mode 6 (Bank Angle)", Math.abs(rollAngle), bankAngleBoundary);
    }

    if (!triggered && closestMode.name && closestMode.diff !== Infinity) {
      thresholdMsg = `最接近: ${closestMode.name}. 当前值: ${closestMode.current}, ${closestMode.threshold}.`;
    } else if (!triggered) {
      thresholdMsg = "";
    }

    this.setData({
      gpwsAlertResult: message,
      gpwsAlertType: type,
      gpwsThresholdInfo: thresholdMsg
    });
  },

  // 切换襟翼配置
  toggleFlaps() {
    const newValue = !this.data.gpwsFlapsInLanding;
    console.log('切换襟翼配置:', this.data.gpwsFlapsInLanding, '->', newValue);
    this.setData({ 
      gpwsFlapsInLanding: newValue 
    });
    // 显示提示确认切换成功
    wx.showToast({
      title: `襟翼: ${newValue ? '着陆形态' : '非着陆形态'}`,
      icon: 'none',
      duration: 1000
    });
  },

  // 切换起落架配置
  toggleGear() {
    const newValue = !this.data.gpwsGearUp;
    console.log('切换起落架配置:', this.data.gpwsGearUp, '->', newValue);
    this.setData({ 
      gpwsGearUp: newValue 
    });
    // 显示提示确认切换成功
    wx.showToast({
      title: `起落架: ${newValue ? '收上' : '放下'}`,
      icon: 'none',
      duration: 1000
    });
  },

  // PITCH PITCH 相关方法
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
    const selectedModel = event.detail.value;
    const selectedAction = this.data.aircraftModelActions.find(action => action.value === selectedModel);
    
    this.setData({
      pitchAircraftModel: selectedModel,
      pitchAircraftModelDisplay: (selectedAction && selectedAction.name) || selectedModel,
      showAircraftModelPicker: false,
      pitchResult: false // 重置结果
    });
  },

  // 计算预测俯仰姿态
  calculatePredictivePitch(currentPitchDegrees: number, pitchRateDegreesPerSecond: number): number {
    return currentPitchDegrees + pitchRateDegreesPerSecond * 1.0;
  },

  // PITCH PITCH 警告计算
  calculatePitchPitch() {
    const radioHeight = parseFloat(this.data.pitchRadioHeight);
    const currentPitch = parseFloat(this.data.pitchCurrentPitch);
    const pitchRate = parseFloat(this.data.pitchPitchRate);
    const aircraftModel = this.data.pitchAircraftModel;

    // 验证基本输入
    if (isNaN(radioHeight) || isNaN(currentPitch) || isNaN(pitchRate)) {
      wx.showToast({
        title: '请输入有效的飞行参数',
        icon: 'none'
      });
      return;
    }

    // 计算预测俯仰角
    const predictivePitch = this.calculatePredictivePitch(currentPitch, pitchRate);

    let shouldTrigger = false;
    let threshold = 0;

    // 根据机型应用特定逻辑（基于修正后的文档）
    switch (aircraftModel) {
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
        // 基于新文档，为A330添加低高度门槛（使用25英尺）
        shouldTrigger = radioHeight < 25 && predictivePitch > threshold;
        break;
      case 'A330-300':
        threshold = 9;
        // 基于新文档，为A330添加低高度门槛（使用25英尺）
        shouldTrigger = radioHeight < 25 && predictivePitch > threshold;
        break;
      default:
        wx.showToast({
          title: '未知的飞机型号',
          icon: 'none'
        });
        return;
    }

    const warningStatus = shouldTrigger ? '⚠️ PITCH PITCH 警告触发' : '✅ 正常，无警告';

    this.setData({
      pitchResult: true,
      pitchPredictivePitch: predictivePitch.toFixed(2),
      pitchThreshold: threshold.toString(),
      pitchWarningStatus: warningStatus,
      pitchShouldTrigger: shouldTrigger
    });
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '飞行工具箱 - 特殊计算',
      desc: '航空特殊计算工具，包含QFE/QNH转换、PAPI计算、温度修正、GPWS警告分析等功能',
      path: '/pages/aviation-calculator/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行工具箱 - 专业特殊计算工具',
      query: 'from=timeline'
    }
  },

  // 温度修正相关方法
  onColdTempAirportElevationChange(event: any) {
    this.setData({
      coldTempAirportElevation: event.detail
    });
  },

  onColdTempAirportTemperatureChange(event: any) {
    this.setData({
      coldTempAirportTemperature: event.detail
    });
  },



  onColdTempIfAltitudeChange(event: any) {
    this.setData({
      coldTempIfAltitude: event.detail
    });
  },

  onColdTempFafAltitudeChange(event: any) {
    this.setData({
      coldTempFafAltitude: event.detail
    });
  },

  onColdTempDaAltitudeChange(event: any) {
    this.setData({
      coldTempDaAltitude: event.detail
    });
  },

  onColdTempMissedAltitudeChange(event: any) {
    this.setData({
      coldTempMissedAltitude: event.detail
    });
  },

  onColdTempOtherAltitudeChange(event: any) {
    this.setData({
      coldTempOtherAltitude: event.detail
    });
  },

  onColdTempFafDistanceChange(event: any) {
    this.setData({
      coldTempFafDistance: event.detail
    });
  },



  toggleColdTempFafPoint() {
    const newValue = !this.data.coldTempIsFafPoint;
    this.setData({
      coldTempIsFafPoint: newValue
    });
    wx.showToast({
      title: `VPA分析: ${newValue ? '开启' : '关闭'}`,
      icon: 'none',
      duration: 1000
    });
  },

  calculateColdTemp() {
    // 清空上次的结果和错误信息
    this.setData({ 
      coldTempResult: null, 
      coldTempError: '' 
    });

    // 数据校验
    const airportElevation = parseFloat(this.data.coldTempAirportElevation);
    const airportTemperature = parseFloat(this.data.coldTempAirportTemperature);

    if (isNaN(airportElevation) || isNaN(airportTemperature)) {
      this.setData({ 
        coldTempError: '请填写机场标高和机场温度' 
      });
      return;
    }

    // 收集所有输入的高度
    const altitudes = [
      { name: 'IF高度', value: this.data.coldTempIfAltitude },
      { name: 'FAF高度', value: this.data.coldTempFafAltitude },
      { name: 'DA高度', value: this.data.coldTempDaAltitude },
      { name: '复飞高度', value: this.data.coldTempMissedAltitude },
      { name: '其他高度', value: this.data.coldTempOtherAltitude }
    ].filter(alt => alt.value && alt.value.trim() !== '');

    if (altitudes.length === 0) {
      this.setData({ 
        coldTempError: '请至少输入一个高度值' 
      });
      return;
    }

    // 计算所有输入高度的修正值
    const results: any[] = [];
    
    try {
      for (const altitude of altitudes) {
        const uncorrectedAltitude = parseFloat(altitude.value);
        
        if (isNaN(uncorrectedAltitude)) {
          continue;
        }

        const input: ColdTempInput = {
          airportElevationFeet: airportElevation,
          airportTemperatureC: airportTemperature,
          uncorrectedAltitudeFeet: uncorrectedAltitude,
          isFafPoint: altitude.name === 'FAF高度' && this.data.coldTempIsFafPoint,
          fafDistanceNm: parseFloat(this.data.coldTempFafDistance) || 8.0,
        };

        const correctionResult = calculateColdTempCorrection(input);
        
        results.push({
          name: altitude.name,
          originalAltitude: uncorrectedAltitude,
          correctionFeet: correctionResult.correctionFeet,
          correctedAltitudeFeet: correctionResult.correctedAltitudeFeet,
          vpaInfo: correctionResult.vpaInfo
        });
      }
      
      this.setData({
        coldTempResult: { results: results }
      });

    } catch (e: any) {
      this.setData({
        coldTempError: e.message || '计算过程中发生错误'
      });
    }
  },

  // ACR-PCR相关方法
  
  // 显示制造商选择器
  showManufacturerPicker() {
    this.setData({
      showAcrManufacturerPicker: true
    })
  },

  // 制造商选择器关闭
  onAcrManufacturerPickerClose() {
    this.setData({
      showAcrManufacturerPicker: false
    })
  },

  // 制造商选择
  onAcrManufacturerSelect(event: any) {
    const manufacturer = event.detail.value
    
    // 获取该制造商的型号列表
    const models = acrManager.getModelsByManufacturer(manufacturer)
    const modelActions = models.map((model: any) => ({
      name: `${model.model} (${model.variantCount}个改型)`,
      value: model.model
    }))
    
    this.setData({
      acrSelectedManufacturer: manufacturer,
      acrSelectedModel: '',
      acrSelectedVariant: '',
      acrSelectedVariantDisplay: '',
      acrModelActions: modelActions,
      showAcrManufacturerPicker: false,
      acrResult: null,
      acrError: ''
    })
  },

  // 显示型号选择器
  showModelPicker() {
    if (!this.data.acrSelectedManufacturer) {
      wx.showToast({
        title: '请先选择制造商',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      showAcrModelPicker: true
    })
  },

  // 型号选择器关闭
  onAcrModelPickerClose() {
    this.setData({
      showAcrModelPicker: false
    })
  },

  // 型号选择
  onAcrModelSelect(event: any) {
    const model = event.detail.value
    
    // 获取该型号的变型列表
    const variants = acrManager.getVariantsByModel(model)
    const variantActions = variants.map((variant: any) => ({
      name: `${variant.variantName} (${variant.mass_kg}kg)`,
      value: variant.variantName
    }))
    
    this.setData({
      acrSelectedModel: model,
      acrSelectedVariant: '',
      acrSelectedVariantDisplay: '',
      acrVariantActions: variantActions,
      showAcrModelPicker: false,
      acrResult: null,
      acrError: ''
    })
  },

  // 显示变型选择器
  showVariantPicker() {
    if (!this.data.acrSelectedModel) {
      wx.showToast({
        title: '请先选择飞机型号',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      showAcrVariantPicker: true
    })
  },

  // 变型选择器关闭
  onAcrVariantPickerClose() {
    this.setData({
      showAcrVariantPicker: false
    })
  },

  // 变型选择
  onAcrVariantSelect(event: any) {
    const variantName = event.detail.value
    const variants = acrManager.getVariantsByModel(this.data.acrSelectedModel)
    const selectedVariant = variants.find((v: any) => v.variantName === variantName)
    
    if (selectedVariant) {
      // 检查是否有min/max质量范围（波音机型）还是固定质量（空客机型）
      const massData = selectedVariant.mass_kg
      let massInputEnabled = false
      let massDisplayLabel = '飞机重量'
      let aircraftMass = ''
      let variantDisplay = ''
      
      if (typeof massData === 'object' && massData.min !== undefined && massData.max !== undefined) {
        // 波音机型：有最小最大值，允许用户输入
        massInputEnabled = true
        massDisplayLabel = '飞机重量'
        aircraftMass = massData.min.toString() // 默认使用最小值
        variantDisplay = `${variantName} (${massData.min}-${massData.max}kg)`
      } else {
        // 空客机型：固定值，不允许用户输入
        massInputEnabled = false
        massDisplayLabel = '飞机重量最大值'
        aircraftMass = massData.toString()
        variantDisplay = `${variantName} (${massData}kg)`
      }
      
      this.setData({
        acrSelectedVariant: variantName,
        acrSelectedVariantDisplay: variantDisplay,
        acrAircraftMass: aircraftMass,
        acrMassInputEnabled: massInputEnabled,
        acrMassDisplayLabel: massDisplayLabel,
        showAcrVariantPicker: false,
        acrResult: null,
        acrError: ''
      })
    }
  },

  // 飞机重量输入变化
  onAcrAircraftMassChange(event: any) {
    this.setData({
      acrAircraftMass: event.detail,
      acrResult: null,
      acrError: ''
    })
  },



  // PCR数值输入变化
  onAcrPcrNumberChange(event: any) {
    this.setData({
      acrPcrNumber: event.detail,
      acrResult: null,
      acrError: ''
    })
  },

  // 道面类型选择器
  showPavementTypePicker() {
    this.setData({ showPavementTypePicker: true })
  },

  onPavementTypePickerClose() {
    this.setData({ showPavementTypePicker: false })
  },

  onPavementTypeSelect(event: any) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.pavementTypeActions.find((action: any) => action.value === selectedValue)
    
    this.setData({
      acrPavementType: selectedValue,
      acrPavementTypeDisplay: selectedAction ? selectedAction.name : selectedValue,
      showPavementTypePicker: false,
      acrResult: null,
      acrError: ''
    })
  },

  // 道基强度类别选择器
  showSubgradeStrengthPicker() {
    this.setData({ showSubgradeStrengthPicker: true })
  },

  onSubgradeStrengthPickerClose() {
    this.setData({ showSubgradeStrengthPicker: false })
  },

  onSubgradeStrengthSelect(event: any) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.subgradeStrengthActions.find((action: any) => action.value === selectedValue)
    
    this.setData({
      acrSubgradeStrength: selectedValue,
      acrSubgradeStrengthDisplay: selectedAction ? selectedAction.name : selectedValue,
      showSubgradeStrengthPicker: false,
      acrResult: null,
      acrError: ''
    })
  },

  // 最大允许胎压选择器
  showTirePressurePicker() {
    this.setData({ showTirePressurePicker: true })
  },

  onTirePressurePickerClose() {
    this.setData({ showTirePressurePicker: false })
  },

  onTirePressureSelect(event: any) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.tirePressureActions.find((action: any) => action.value === selectedValue)
    
    this.setData({
      acrTirePressure: selectedValue,
      acrTirePressureDisplay: selectedAction ? selectedAction.name : selectedValue,
      showTirePressurePicker: false,
      acrResult: null,
      acrError: ''
    })
  },

  // 评估方法选择器
  showEvaluationMethodPicker() {
    this.setData({ showEvaluationMethodPicker: true })
  },

  onEvaluationMethodPickerClose() {
    this.setData({ showEvaluationMethodPicker: false })
  },

  onEvaluationMethodSelect(event: any) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.evaluationMethodActions.find((action: any) => action.value === selectedValue)
    
    this.setData({
      acrEvaluationMethod: selectedValue,
      acrEvaluationMethodDisplay: selectedAction ? selectedAction.name : selectedValue,
      showEvaluationMethodPicker: false,
      acrResult: null,
      acrError: ''
    })
  },

  // 计算ACR - 修正逻辑：根据飞机参数查询ACR值，与PCR值比较
  calculateACR() {
    try {
      console.log('🔄 开始ACR计算...')
      
      // 验证输入的辅助函数
      const showError = (errorMsg: string) => {
        this.setData({ acrError: errorMsg })
        setTimeout(() => {
          wx.pageScrollTo({
            selector: '.acr-error-section',
            duration: 500
          })
        }, 300)
      }

      // 验证飞机信息
      if (!this.data.acrSelectedModel) {
        showError('请选择飞机型号')
        return
      }
      
      if (!this.data.acrSelectedVariant) {
        showError('请选择具体改型')
        return
      }
      
      if (!this.data.acrAircraftMass) {
        showError(this.data.acrMassInputEnabled ? '请输入飞机重量' : '请先选择飞机改型')
        return
      }

      const mass = parseFloat(this.data.acrAircraftMass)
      if (isNaN(mass) || mass <= 0) {
        showError('飞机重量数据无效')
        return
      }

      // 验证PCR参数
      if (!this.data.acrPcrNumber) {
        showError('请输入PCR数值')
        return
      }

      const pcrNumber = parseFloat(this.data.acrPcrNumber)
      if (isNaN(pcrNumber) || pcrNumber <= 0) {
        showError('请输入有效的PCR数值')
        return
      }

      if (!this.data.acrPavementType) {
        showError('请选择道面类型')
        return
      }

      if (!this.data.acrSubgradeStrength) {
        showError('请选择道基强度类别')
        return
      }

      if (!this.data.acrTirePressure) {
        showError('请选择最大允许胎压')
        return
      }

      if (!this.data.acrEvaluationMethod) {
        showError('请选择评估方法')
        return
      }

      // 组装PCR信息对象
      const pcrInfo = {
        pcr: pcrNumber,
        pavementType: this.data.acrPavementType,
        subgradeCategory: this.data.acrSubgradeStrength,
        tirePressureLimit: this.data.acrTirePressure,
        evaluationMethod: this.data.acrEvaluationMethod
      }

      console.log('📋 PCR信息:', {
        pcr: pcrInfo.pcr,
        pavementType: pcrInfo.pavementType,
        subgradeCategory: pcrInfo.subgradeCategory,
        tirePressureLimit: pcrInfo.tirePressureLimit,
        evaluationMethod: pcrInfo.evaluationMethod
      })

      // 根据飞机参数和道面条件查询对应的ACR值
      const acrInfo = acrManager.queryACR(
        this.data.acrSelectedModel,
        this.data.acrSelectedVariant,
        mass,
        pcrInfo.pavementType,
        pcrInfo.subgradeCategory
      )

      if (!acrInfo) {
        showError('未找到对应的ACR数据，请检查飞机型号、质量和道面条件')
        return
      }

      console.log('📊 ACR查询结果:', acrInfo)

      // 胎压限制检查（强制性安全要求）
      const tirePressureLimits: { [key: string]: number | null } = {
        'W': null,    // 无限制 (Unlimited)
        'X': 1.75,    // 高 (High) ≤1.75 MPa (254 psi)
        'Y': 1.25,    // 中 (Medium) ≤1.25 MPa (181 psi)
        'Z': 0.5      // 低 (Low) ≤0.50 MPa (73 psi)
      }
      
      const aircraftTirePressure = acrInfo.tirePressure
      const pressureLimit = tirePressureLimits[pcrInfo.tirePressureLimit]
      let tirePressureCheckPassed = true
      let tirePressureCheckMessage = ''
      
      if (pressureLimit === null) {
        // W - 无限制
        tirePressureCheckPassed = true
        tirePressureCheckMessage = '✅ 通过（无胎压限制）'
      } else {
        // 检查是否超出限制
        tirePressureCheckPassed = aircraftTirePressure <= pressureLimit
        if (tirePressureCheckPassed) {
          tirePressureCheckMessage = `✅ 通过（${aircraftTirePressure} ≤ ${pressureLimit} MPa）`
        } else {
          tirePressureCheckMessage = `❌ 超限（${aircraftTirePressure} > ${pressureLimit} MPa）`
        }
      }

      // ACR-PCR对比检查
      const acrPcrCheckPassed = acrInfo.acr <= pcrInfo.pcr
      
      // 综合判断：胎压和ACR-PCR都必须通过
      const canOperate = tirePressureCheckPassed && acrPcrCheckPassed
      
      let operationStatus = ''
      let operationReason = ''
      
      if (!tirePressureCheckPassed) {
        // 胎压超限，直接不可使用
        operationStatus = '❌ 不可使用'
        operationReason = '胎压超限'
      } else if (!acrPcrCheckPassed) {
        // 胎压通过但ACR超限
        operationStatus = '❌ 不可使用'
        operationReason = 'ACR > PCR，不满足运行要求'
      } else {
        // 都通过
        operationStatus = '✅ 可以使用'
        operationReason = 'ACR ≤ PCR，满足运行要求'
      }
      
      // 计算安全余量
      const safetyMargin = pcrInfo.pcr - acrInfo.acr
      
      console.log('✅ 综合安全分析完成:', {
        飞机ACR: acrInfo.acr,
        道面PCR: pcrInfo.pcr,
        胎压检查: tirePressureCheckPassed ? '通过' : '超限',
        ACR检查: acrPcrCheckPassed ? '通过' : '超限',
        最终结果: canOperate ? '可以使用' : '不可使用',
        原因: operationReason
      })
      
      // 评估方法名称映射
      const evaluationMethodNames: { [key: string]: string } = {
        'T': '技术评估',
        'U': '经验评估'
      }
      
      // 设置详细结果
      this.setData({
        acrResult: {
          // 飞机信息
          aircraftInfo: `${this.data.acrSelectedModel} ${this.data.acrSelectedVariantDisplay || ''}`,
          inputMass: mass,
          actualMass: acrInfo.actualMass,
          variantName: acrInfo.variant.variantName,
          tirePressure: acrInfo.tirePressure,
          loadPercentageMLG: acrInfo.loadPercentageMLG,
          
          // 道面条件
          pcrCode: `${pcrNumber}/${this.data.acrPavementType}/${this.data.acrSubgradeStrength}/${this.data.acrTirePressure}/${this.data.acrEvaluationMethod}`,
          pavementTypeName: acrInfo.pavementTypeName,
          subgradeName: acrInfo.subgradeName,
          
          // ACR-PCR对比
          acr: acrInfo.acr,
          pcr: pcrInfo.pcr,
          canOperate: canOperate,
          operationStatus: operationStatus,
          operationReason: operationReason,
          safetyMargin: safetyMargin,
          tirePressureCheckPassed: tirePressureCheckPassed,
          
          // 胎压检查
          tirePressureCheck: tirePressureCheckMessage,
          evaluationMethod: `${pcrInfo.evaluationMethod} - ${evaluationMethodNames[pcrInfo.evaluationMethod] || '未知'}`,
          
          // 计算方式信息
          isInterpolated: acrInfo.isInterpolated,
          calculationMethod: acrInfo.isInterpolated ? '线性插值计算' : '固定参数查询'
        },
        acrError: ''
      })

      // 自动滚动到结果区域
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '.acr-result-section',
          duration: 500
        })
      }, 300)

    } catch (error) {
      console.error('❌ ACR计算失败:', error)
      this.setData({
        acrError: `计算失败: ${error instanceof Error ? error.message : '请检查输入参数'}`
      })

      // 如果有错误，滚动到错误信息
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '.acr-error-section',
          duration: 500
        })
      }, 300)
    }
  },

  // =========================
  // GRF雪情通告解码相关方法
  // =========================



  // SNOWTAM输入变化
  onGrfSnowTamInputChange(event: any) {
    const input = event.detail
    this.setData({ grfSnowTamInput: input })
    
    // 实时解析功能：只要有输入内容就尝试解析
    if (input && input.trim()) {
      try {
        const result = this.parseSnowTamText(input.trim())
    this.setData({ 
          grfDecodedResult: result,
          grfError: ''
        })
      } catch (error: any) {
        // 输入不完整时不显示错误，而是显示部分解析结果
        const partialResult = this.parsePartialSnowTam(input.trim())
    this.setData({
          grfDecodedResult: partialResult,
          grfError: ''
        })
      }
    } else {
      // 清空输入时清空结果
    this.setData({ 
        grfDecodedResult: null,
        grfError: ''
      })
    }
  },



  // 解析SNOWTAM
  parseSnowTam() {
    const input = this.data.grfSnowTamInput.trim()
    if (!input) {
      this.setData({ grfError: '请输入SNOWTAM报文' })
      return
    }

    try {
      const result = this.parseSnowTamText(input)
      this.setData({ 
        grfDecodedResult: result,
        grfError: ''
      })
    } catch (error: any) {
      this.setData({ 
        grfError: `解析错误: ${error.message}`,
        grfDecodedResult: null
      })
    }
  },



  // 解析SNOWTAM文本
  parseSnowTamText(text: string) {
    console.log('parseSnowTamText 输入:', text)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line)
    
    // 查找机场代码和观测时间
    let airportCode = ''
    let observationTime = ''
    const allRunways = [] // 存储所有跑道的数据
    
    for (const line of lines) {
      console.log('处理行:', line)
      
      // 方法1: 匹配完整简化报头格式: SWZB0151 ZBAA 02170230
      const headerMatch = line.match(/SW[A-Z]{2}\d{4}\s+([A-Z]{4})\s+(\d{8})/)
      if (headerMatch) {
        airportCode = headerMatch[1]
        observationTime = headerMatch[2]
        console.log('方法1匹配报头:', { airportCode, observationTime })
        continue
      }
      
      // 方法2: 匹配机场代码和时间的独立行: ZBAA 02170155 或时间
      if (!airportCode || !observationTime) {
        const airportTimeMatch = line.match(/^([A-Z]{4})\s+(\d{6,8})$/)
        if (airportTimeMatch) {
          airportCode = airportTimeMatch[1]
          observationTime = airportTimeMatch[2]
          console.log('方法2匹配机场时间:', { airportCode, observationTime })
          continue
        }
      }
      
      // 方法3: 提取机场代码（如果还没有）
      if (!airportCode) {
        const codeMatch = line.match(/\b([A-Z]{4})\b/)
        if (codeMatch && !line.includes('/')) { // 避免匹配跑道数据行
          airportCode = codeMatch[1]
          console.log('方法3提取机场代码:', airportCode)
        }
      }
      
      // 方法4: 提取时间戳（如果还没有）
      if (!observationTime) {
        const timeMatch = line.match(/\b(\d{6,8})\b/)
        if (timeMatch && !line.includes('/')) { // 避免匹配跑道数据行
          observationTime = timeMatch[1]
          console.log('方法4提取时间:', observationTime)
        }
      }
      
      // 方法5: 匹配跑道数据行 - 更严格的匹配
      // 格式1: 02170155 16L 2/5/3 100/50/75 04/03/04 SLUSH/DRY SNOW/WET SNOW
      // 格式2: 16L 2/5/3 100/50/75 04/03/04 SLUSH/DRY SNOW/WET SNOW
      // 格式3: 02170230 16R 2/5/3 75/100/100 04/03/NR SLUSH/SLUSH/SLUSH 50
      // 格式4: 02170225 01L 5/5/5 100/100/100 02/05/10 (污染物状况在下一行)
      
      // 先检查这行是否包含机场代码，如果是则跳过作为跑道数据处理
      const isAirportLine = line.match(/^[A-Z]{4}\s+\d{6,8}/)
      
      if (!isAirportLine) {
        // 只对非机场代码行进行跑道数据匹配
        const runwayMatch = line.match(/(?:(\d{6,8})\s+)?([0-9]{1,2}[LRC]?)\s+([\d\/]+)(?:\s+([\d\/NR]+))?(?:\s+([\d\/NR]+))?(?:\s+(.+?))?(?:\s+(\d+))?$/)
        if (runwayMatch && runwayMatch[3] && runwayMatch[3].includes('/')) {
          const timeInLine = runwayMatch[1]
          const runway = runwayMatch[2]
          const rwyccStr = runwayMatch[3]
          let coverageStr = runwayMatch[4] || 'NR/NR/NR'
          let depthStr = runwayMatch[5] || 'NR/NR/NR'
          let conditionStr = runwayMatch[6] || 'NR/NR/NR'
          const runwayWidth = runwayMatch[7] || ''
          
          // 如果这行包含时间，更新观测时间
          if (timeInLine && !observationTime) {
            observationTime = timeInLine
          }
          
          // 检查是否污染物状况在下一行（如果当前行没有污染物描述，只有数字）
          const currentIndex = lines.indexOf(line)
          if (currentIndex >= 0 && currentIndex < lines.length - 1) {
            const nextLine = lines[currentIndex + 1]
            
            // 检查下一行是否包含污染物类型描述（包含字母和斜线）
            if (nextLine && nextLine.match(/[A-Z\/]+/) && !nextLine.match(/\d{6,8}/) && !nextLine.match(/\w+\s+[\d\/]+/)) {
              // 下一行可能包含污染物状况，检查格式
              const nextLineClean = nextLine.trim()
              
              // 如果下一行看起来像污染物描述
              if (nextLineClean.includes('/') || nextLineClean.match(/WET|DRY|SLUSH|SNOW|ICE|WATER|FROST/)) {
                // 解析下一行的污染物信息
                const conditionMatch = nextLineClean.match(/^([A-Z\/\s]+?)(?:\s+SNOW(\d+))?$/)
                if (conditionMatch) {
                  conditionStr = conditionMatch[1]
                  const snowDepth = conditionMatch[2]
                  
                  // 如果有雪深度信息，可能需要调整深度数据
                  if (snowDepth) {
                    // SNOW50 表示特殊的雪深度信息，可以添加到明语说明中
                    console.log('发现雪深度信息:', snowDepth)
                  }
                } else {
                  conditionStr = nextLineClean
                }
              }
            }
          }
          
          console.log('方法5匹配跑道数据:', { runway, rwyccStr, coverageStr, depthStr, conditionStr, runwayWidth })
          
          // 解析这个跑道的数据
          const runwayData = this.parseRunwayData(runway, rwyccStr, coverageStr, depthStr, conditionStr, runwayWidth)
          if (runwayData) {
            allRunways.push(runwayData)
          }
        }
      }
    }
        
        // 如果是6位时间，前面补当前月份
    if (observationTime && observationTime.length === 6) {
          const currentMonth = new Date().getMonth() + 1
          observationTime = currentMonth.toString().padStart(2, '0') + observationTime
        }
        
    console.log('解析结果汇总:', { airportCode, observationTime, allRunways })

    if (allRunways.length === 0) {
      throw new Error('未找到有效的跑道数据。支持格式：\n1. 完整SNOWTAM格式\n2. 简化格式：机场代码 时间 跑道号 RWYCC\n3. 最简格式：跑道号 RWYCC代码\n4. 多跑道格式：每行一个跑道数据')
    }

    // 查找明语说明
    let plainLanguage = ''
    for (const line of lines) {
      if (line.includes('RWY') && (line.includes('.') || line.includes(')'))) {
        plainLanguage = line.replace(/\)$/, '') // 移除末尾的括号
        break
      }
    }

    // 生成多跑道标准雪情通告翻译
    const formattedObsTime = observationTime ? this.formatObservationTime(String(observationTime)) : '未知'
    const safetyAdvice = this.generateMultiRunwaySafetyAdvice(allRunways, airportCode || '未知', formattedObsTime, plainLanguage)
    
    // 生成用于WXML显示的translationLines
    const translationLines = this.parseTranslationText(safetyAdvice)

    // 返回第一个跑道的数据作为主要显示（保持兼容性），同时包含所有跑道数据
    const primaryRunway = allRunways[0]
    return {
      airport: airportCode || '未知',
      observationTime: formattedObsTime,
      runway: allRunways.map(r => r.runway).join(', '),
      segments: primaryRunway.segments,
      runwayWidth: primaryRunway.runwayWidth || null,
      plainLanguage: plainLanguage,
      safetyAdvice: safetyAdvice,
      translationLines: translationLines,
      allRunways: allRunways // 新增：包含所有跑道的数据
    }
  },



  // 部分解析SNOWTAM文本（用于实时解析）
  parsePartialSnowTam(text: string) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line)
    
    // 提取可识别的信息
    let airportCode = '输入中...'
    let observationTime = '输入中...'
    let translationContent = '💡 正在实时解析您的输入...\n\n'
    
    let foundAirport = false
    let foundTime = false
    let foundRunway = false
    
    // 尝试提取机场代码（只有在标准位置的才认为是机场代码）
    for (const line of lines) {
      // 只在标准SNOWTAM格式的位置查找机场代码
      // 例如：ZBAA 170225 或 SWZB0151 ZBAA 02170230
      const standardMatch = line.match(/^(?:\w+\s+)?([A-Z]{4})\s+\d{6,8}/)
      if (standardMatch) {
        const potentialCode = standardMatch[1]
        // 确保是标准的ICAO机场代码（不在情景意识内容中）
        if (!line.match(/LOOSE|DRIFTING|STANDING|COMPACTED|CHEMICALLY|REDUCED|SNOWBANK|SLUSH|WET|DRY|SNOW|ICE/i)) {
          airportCode = potentialCode
          translationContent += `✅ 识别到机场代码：【${airportCode}】\n`
          foundAirport = true
          break
        }
      }
    }
    
    // 尝试解析情景意识内容
    let situationalAwareness = ''
    for (const line of lines) {
      // 检查是否包含情景意识关键词或污染物描述
      if (line.match(/REDUCED|DRIFTING|LOOSE|CHEMICALLY|SNOWBANK|POOR|ADJ|SLUSH|SNOW|WET|DRY|ICE|WATER|COMPACTED|STANDING|FROST/i)) {
        // 排除纯数据行（包含大量斜线的行）
        if (!line.match(/[\d\/]{10,}/)) {
          situationalAwareness += line + ' '
          
          // 如果是污染物描述，提供翻译
          if (line.match(/SLUSH|SNOW|WET|DRY|ICE|WATER|COMPACTED|STANDING|FROST/i)) {
            translationContent += `✅ 识别到污染物描述：【${line}】\n`
            // 翻译污染物
            const conditions = line.split(/[\/\s]+/).filter(c => c.trim())
            const translated = conditions.map(c => this.translateCondition(c.trim())).filter((t, index) => t !== conditions[index].trim())
            if (translated.length > 0) {
              translationContent += `  翻译：${translated.join('、')}\n`
            }
          } else {
            translationContent += `✅ 识别到情景意识内容：【${line}】\n`
          }
        }
      }
    }
    
    // 翻译情景意识内容
    if (situationalAwareness.trim()) {
      const plainLanguageItems = this.translatePlainLanguageItems(situationalAwareness.trim())
      if (plainLanguageItems && plainLanguageItems.length > 0) {
        translationContent += `\n『情景意识翻译』\n`
        plainLanguageItems.forEach(item => {
          translationContent += `  ${item.code}项 - ${item.title}：\n`
          translationContent += `      ${item.content}\n`
          if (item.note) {
            translationContent += `      注意：${item.note}\n`
          }
        })
      }
    }
    
    // 尝试提取时间（只有在标准位置的才认为是观测时间）
    for (const line of lines) {
      // 只在标准SNOWTAM格式的位置查找时间
      // 例如：ZBAA 170225 或 SWZB0151 ZBAA 02170230
      const timeMatch = line.match(/(?:[A-Z]{4}\s+)?(\d{6,8})(?:\s+\w+)?(?:\s+[\d\/]+)?$/)
      if (timeMatch && !line.includes('/')) {
        // 确保这不是跑道数据行或情景意识内容
        if (!line.match(/SLUSH|WET|DRY|SNOW|ICE|LOOSE|DRIFTING|CHEMICALLY|TREATED/i)) {
          const timeStr = timeMatch[1]
          observationTime = this.formatObservationTime(timeStr)
          translationContent += `✅ 识别到观测时间：【${observationTime}】\n`
          foundTime = true
          break
        }
      }
    }
    
    // 尝试提取跑道信息
    const allRunways = []
    for (const line of lines) {
      // 尝试匹配完整的跑道数据行
      const runwayMatch = line.match(/(?:\d{6,8}\s+)?(\w+)\s+([\d\/]+)/)
      if (runwayMatch && runwayMatch[2].includes('/')) {
        const runway = runwayMatch[1]
        const rwyccStr = runwayMatch[2]
        
        if (!foundRunway) {
          translationContent += `✅ 识别到跑道数据：【${runway}】状况代码：【${rwyccStr}】\n`
          foundRunway = true
        }
        
        // 分析RWYCC代码
        const rwyccCodes = rwyccStr.split('/').map(code => {
          const num = parseInt(code)
          return isNaN(num) ? 6 : num
        })
        
        allRunways.push({
          runway: runway,
          rwyccStr: rwyccStr,
          rwyccCodes: rwyccCodes
        })
      } else {
        // 尝试匹配各种数据格式
        console.log('检查行内容:', line)
        
        // 格式1：5/5/5 100/100/100 NR/NR/03 (RWYCC 覆盖范围 深度)
        let complexDataMatch = line.match(/([\d\/]+)\s+([\d\/]+)\s+([\d\/NR]+)(?:\s+(.+))?/)
        let dataType = 'rwycc-coverage-depth'
        
        // 格式2：NR/NR/03 WET/WET/WET SNOW (深度 污染物)
        if (!complexDataMatch) {
          complexDataMatch = line.match(/([\d\/NR]+)\s+(.+)/)
          dataType = 'depth-condition'
        }
        
        // 格式3：单独的数据片段
        if (!complexDataMatch) {
          complexDataMatch = line.match(/([\d\/NR]+)/)
          dataType = 'single-data'
        }
        
        console.log('复杂数据匹配结果:', complexDataMatch, '类型:', dataType)
        if (complexDataMatch) {
          let rwyccStr, coverageStr, depthStr, conditionStr
          
          if (dataType === 'rwycc-coverage-depth') {
            // 完整的三段数据：RWYCC 覆盖范围 深度
            rwyccStr = complexDataMatch[1]
            coverageStr = complexDataMatch[2]
            depthStr = complexDataMatch[3]
            conditionStr = complexDataMatch[4] || 'NR/NR/NR'
          } else if (dataType === 'depth-condition') {
            // 深度和污染物：深度 污染物
            rwyccStr = '6/6/6'  // 默认值
            coverageStr = '100/100/100'  // 默认值
            depthStr = complexDataMatch[1]
            conditionStr = complexDataMatch[2]
          } else {
            // 单一数据片段，尝试判断类型
            const dataStr = complexDataMatch[1]
            if (dataStr.match(/^[0-6]\/[0-6]\/[0-6]$/)) {
              // RWYCC格式
              rwyccStr = dataStr
              coverageStr = '100/100/100'
              depthStr = 'NR/NR/NR'
              conditionStr = 'NR/NR/NR'
            } else {
              // 其他格式，当作深度处理
              rwyccStr = '6/6/6'
              coverageStr = '100/100/100'
              depthStr = dataStr
              conditionStr = 'NR/NR/NR'
            }
          }
          let runway = '数据输入中'
          
          if (!foundRunway) {
            translationContent += `✅ 识别到完整雪情数据\n`
            translationContent += `  • 跑道状况代码：【${rwyccStr}】\n`
            translationContent += `  • 覆盖范围：【${coverageStr}】\n`
            translationContent += `  • 深度信息：【${depthStr}】\n`
            if (complexDataMatch[4]) {
              translationContent += `  • 污染物状况：【${conditionStr}】\n`
            }
            foundRunway = true
          }
          
          // 解析数据
          const rwyccCodes = rwyccStr.split('/').map(code => {
            const num = parseInt(code)
            return isNaN(num) ? 6 : Math.min(Math.max(num, 0), 6)
          })
          const coverages = coverageStr.split('/').map(c => c === 'NR' ? 'NR' : parseInt(c))
          const depths = depthStr.split('/')
          const conditions = conditionStr.split('/').map(c => this.translateCondition(c.trim()))
          
          // 添加到跑道数据中用于标准翻译显示
          allRunways.push({
            runway: runway,
            rwyccStr: rwyccStr,
            rwyccCodes: rwyccCodes,
            coverageStr: coverageStr,
            depthStr: depthStr,
            conditionStr: conditionStr
          })
          
          translationContent += `\n『详细解析』\n`
          for (let i = 0; i < 3; i++) {
            const segmentName = ['接地段(1/3)', '中段(1/3)', '滑跑段(1/3)'][i]
            const rwycc = rwyccCodes[i] || 6
            const coverage = coverages[i] || 'NR'
            const depth = depths[i] || 'NR'
            const condition = conditions[i] || 'NR'
            const prefix = i === 2 ? '└─' : '├─'
            
            translationContent += `  ${prefix} ${segmentName}：\n`
            translationContent += `      RWYCC：${rwycc} (${this.getRwyccDescription(rwycc)})\n`
            translationContent += `      覆盖范围：${coverage}${coverage !== 'NR' ? '%' : ''}\n`
            translationContent += `      深度：${depth}${depth !== 'NR' ? 'mm' : ''}\n`  
            translationContent += `      污染物：${condition}\n`
          }
          
        } else {
          // 尝试匹配简单的数据片段
          const dataOnlyMatch = line.match(/([\d\/NR]+)(?:\s+([\d\/NR]+))?(?:\s+(.+))?/)
          if (dataOnlyMatch && dataOnlyMatch[1].includes('/')) {
            // 检查是否包含典型的雪情数据格式
            if (line.match(/\d+\/\d+\/\d+/) || line.match(/NR/) || line.match(/WET|SLUSH|SNOW|ICE/)) {
              const dataStr = dataOnlyMatch[1]
              let runway = '未知跑道'
              
              if (!foundRunway) {
                translationContent += `✅ 识别到数据片段：【${dataStr}】\n`
                foundRunway = true
              }
              
              // 尝试解析为RWYCC、覆盖范围或深度
              if (dataStr.match(/^[\d\/]+$/) && !dataStr.includes('NR')) {
                // 可能是RWYCC代码
                const rwyccCodes = dataStr.split('/').map(code => {
                  const num = parseInt(code)
                  return (num >= 0 && num <= 6) ? num : 6
                })
                
                allRunways.push({
                  runway: runway,
                  rwyccStr: dataStr,
                  rwyccCodes: rwyccCodes
                })
              } else {
                // 可能是覆盖范围或深度数据
                translationContent += `  • 数据内容：${dataStr}\n`
                if (dataOnlyMatch[2]) {
                  translationContent += `  • 附加数据：${dataOnlyMatch[2]}\n`
                }
                if (dataOnlyMatch[3]) {
                  translationContent += `  • 污染物状况：${dataOnlyMatch[3]}\n`
                }
              }
            }
          }
        }
      }
    }
    
    // 显示解析结果
    if (allRunways.length > 0 || foundRunway) {
      if (allRunways.length > 0) {
        translationContent += `\n『解析结果详情』\n`
        
        allRunways.forEach((runwayData) => {
          if (allRunways.length > 1) {
            translationContent += `\n跑道 ${runwayData.runway}：\n`
          } else {
            translationContent += `跑道：【${runwayData.runway}】\n`
          }
          translationContent += `状况代码：【${runwayData.rwyccStr}】\n`
          
          runwayData.rwyccCodes.forEach((code, segIndex) => {
            const segmentName = ['接地段(1/3)', '中段(1/3)', '滑跑段(1/3)'][segIndex]
            const description = this.getRwyccDescription(code) || '未知'
            const prefix = segIndex === 2 ? '└─' : '├─'
            translationContent += `  ${prefix} ${segmentName}：${code} (${description})\n`
          })
        })
      }
      
      // 提示继续输入
      if (!foundAirport || !foundTime) {
        translationContent += `\n💭 还可以输入：\n`
        if (!foundAirport) translationContent += `• 机场代码 (如 ZBAA)\n`
        if (!foundTime) translationContent += `• 观测时间 (如 02170230)\n`
        if (!foundRunway) {
          translationContent += `• 跑道号 (如 16L)\n`
          translationContent += `• 状况代码 (如 2/5/3)\n`
        }
      }
    } else {
      // 如果没有识别到具体数据，提供输入提示
      if (!foundAirport && !foundTime && !foundRunway) {
        translationContent = '📝 请输入SNOWTAM报文内容...\n\n'
        translationContent += '📖 支持格式示例：\n'
        translationContent += '• 完整格式：SWZB0151 ZBAA 02170230\n'
        translationContent += '• 简化格式：ZBAA 170230 16L 2/5/3\n'
        translationContent += '• 跑道数据：16L 2/5/3 100/50/75 04/03/04\n'
        translationContent += '• 数据片段：100/100/100 NR/NR/03 WET/WET/SLUSH\n'
        translationContent += '• 多跑道：每行一个跑道的数据\n\n'
        translationContent += '⚡ 实时解析：输入内容会立即显示解析结果'
      } else {
        translationContent += `\n💭 继续输入跑道数据...\n`
        translationContent += `• 格式：跑道号 状况代码\n`
        translationContent += `• 示例：16L 2/5/3\n`
        translationContent += `• 示例：16R 2/5/3 75/100/100 04/03/NR\n`
      }
    }
    
    // 判断内容类型并生成相应的标题
    let finalTranslationContent = translationContent
    const hasSituationalAwareness = situationalAwareness.trim().length > 0
    const hasRunwayData = allRunways.length > 0 || foundRunway
    
    // 如果主要是情景意识内容，用情景意识部分标题
    if (hasSituationalAwareness && !hasRunwayData) {
      finalTranslationContent = translationContent.replace(/『飞机性能计算部分』/g, '『情景意识部分』')
      finalTranslationContent = finalTranslationContent.replace(/飞机性能计算部分 - 跑道 100/g, '情景意识部分')
    }
    
    // 生成用于WXML显示的translationLines
    const translationLines = this.parseTranslationText(finalTranslationContent)
    
    // 构建segments数据
    let segments = [
      { rwycc: 6, rwyCcDescription: '待输入', coverage: 'NR', depth: 'NR', condition: 'NR' },
      { rwycc: 6, rwyCcDescription: '待输入', coverage: 'NR', depth: 'NR', condition: 'NR' },
      { rwycc: 6, rwyCcDescription: '待输入', coverage: 'NR', depth: 'NR', condition: 'NR' }
    ]
    
    // 如果有跑道数据，更新segments
    if (allRunways.length > 0) {
      const firstRunway = allRunways[0]
      if (firstRunway.rwyccCodes && firstRunway.coverageStr && firstRunway.depthStr) {
        const coverages = firstRunway.coverageStr.split('/').map(c => c === 'NR' ? 'NR' : parseInt(c))
        const depths = firstRunway.depthStr.split('/')
        const conditions = firstRunway.conditionStr ? firstRunway.conditionStr.split('/').map(c => c.trim()) : ['NR', 'NR', 'NR']
        
        for (let i = 0; i < 3; i++) {
          segments[i] = {
            rwycc: firstRunway.rwyccCodes[i] || 6,
            rwyCcDescription: this.getRwyccDescription(firstRunway.rwyccCodes[i] || 6),
            coverage: coverages[i] !== 'NR' ? String(coverages[i]) : 'NR',
            depth: depths[i] || 'NR', 
            condition: conditions[i] || 'NR'
          }
        }
      }
    }
    
    return {
      airport: foundAirport ? airportCode : '输入中...',  // 只有真正找到机场代码才显示
      observationTime: foundTime ? String(observationTime) : '输入中...',  // 只有真正找到时间才显示，确保是字符串类型
      runway: foundRunway ? (allRunways.length > 0 ? allRunways[0].runway : '数据输入中') : '输入中...',
      segments: segments,
      runwayWidth: null,
      plainLanguage: situationalAwareness.trim() || null,
      safetyAdvice: finalTranslationContent,
      translationLines: translationLines,
      isPartial: true, // 标记这是部分解析结果
      contentType: hasSituationalAwareness && !hasRunwayData ? 'situational' : 'performance' // 标记内容类型
    }
  },

  // 解析单个跑道数据的辅助方法
  parseRunwayData(runway: string, rwyccStr: string, coverageStr: string, depthStr: string, conditionStr: string, runwayWidth: string) {
      const rwyccCodes = rwyccStr.split('/').map(code => parseInt(code))
      const coverages = coverageStr.split('/').map(coverage => {
        if (coverage === 'NR') return 'NR'
        return parseInt(coverage)
      })
      const depths = depthStr.split('/')
      
      // 处理污染物条件字符串
      let conditions = ['NR', 'NR', 'NR']
    if (conditionStr && conditionStr !== 'NR/NR/NR' && conditionStr !== 'NR') {
      console.log('处理污染物条件字符串:', conditionStr)
      
      // 处理末尾可能的跑道宽度数字或特殊标记（如SNOW50）
        let cleanConditionStr = conditionStr.trim()
        const widthMatch = cleanConditionStr.match(/(.+?)\s*(\d+)$/)
        if (widthMatch) {
          cleanConditionStr = widthMatch[1]
          if (!runwayWidth) runwayWidth = widthMatch[2]
        }
      
      // 处理特殊格式如 "WET/WET/WET SNOW50"
      const specialMatch = cleanConditionStr.match(/^([^0-9]+?)(\s+SNOW\d+)?$/)
      if (specialMatch) {
        cleanConditionStr = specialMatch[1].trim()
      }
        
        if (cleanConditionStr.includes('/')) {
        // 直接按斜线分割
          conditions = cleanConditionStr.split('/').map(c => c.trim())
        console.log('按斜线分割的污染物条件:', conditions)
        } else {
          // 智能分割复合污染物名称
          const parts = cleanConditionStr.split(/\s+/)
          conditions = []
          let currentCondition = ''
          
          for (const part of parts) {
            if (part.includes('SNOW') || part.includes('ICE') || part.includes('WATER') || 
                part.includes('WET') || part.includes('DRY') || part.includes('SLUSH') ||
                part.includes('FROST') || part.includes('COMPACTED')) {
              if (currentCondition) {
                conditions.push(currentCondition.trim())
              }
              currentCondition = part
            } else {
              currentCondition += (currentCondition ? ' ' : '') + part
            }
          }
          if (currentCondition) {
            conditions.push(currentCondition.trim())
          }
        console.log('智能分割的污染物条件:', conditions)
        }
        
        // 确保有3个条件
        while (conditions.length < 3) {
        conditions.push(conditions[conditions.length - 1] || 'NR')
        }
        conditions = conditions.slice(0, 3)
      console.log('最终的污染物条件:', conditions)
      }

    const segments = []
      for (let i = 0; i < 3; i++) {
        segments.push({
          rwycc: rwyccCodes[i] || 6,
        rwyCcDescription: this.getRwyccDescription(rwyccCodes[i]),
          coverage: coverages[i] || 'NR',
          depth: depths[i] || 'NR',
          condition: (conditions[i] && conditions[i].trim()) || 'NR'
        })
    }

    return {
      runway: runway,
      segments: segments,
      runwayWidth: runwayWidth || null
    }
  },



  // 格式化观测时间
  formatObservationTime(timeStr: string) {
    if (!timeStr) return '未知'
    
    if (timeStr.length === 8) {
      // 8位格式: MMDDHHNN
      const month = timeStr.substring(0, 2)
      const day = timeStr.substring(2, 4)
      const hour = timeStr.substring(4, 6)
      const minute = timeStr.substring(6, 8)
      return `${month}月${day}日 ${hour}:${minute}`
    } else if (timeStr.length === 6) {
      // 6位格式: DDHHNN
      const day = timeStr.substring(0, 2)
      const hour = timeStr.substring(2, 4)
      const minute = timeStr.substring(4, 6)
      return `${day}日 ${hour}:${minute}`
    } else {
      return timeStr
    }
  },

    // 生成标准雪情通告翻译
  generateSafetyAdvice(segments: any[], airportCode?: string, observationTime?: string, runwayNumber?: string) {
    let translation = ''
    
    // 飞机性能计算部分翻译
    translation += '『飞机性能计算部分』\n'
    
    // A项 - 发生地
    const airport = airportCode || (this.data.grfDecodedResult && this.data.grfDecodedResult.airport) || '未知'
    translation += `A) 发生地：【${airport}】\n`
    
    // B项 - 观测时间  
    const obsTime = observationTime || (this.data.grfDecodedResult && this.data.grfDecodedResult.observationTime) || '未知'
    translation += `B) 观测时间：【${obsTime}】\n`
    
    // C项 - 跑道号码
    const runway = runwayNumber || (this.data.grfDecodedResult && this.data.grfDecodedResult.runway) || '未知'
    translation += `C) 跑道号码：【${runway}】\n`
    
    // D项 - 跑道状况代码
    const rwyccCodes = segments.map(seg => seg.rwycc).join('/')
    translation += `D) 跑道状况代码：【${rwyccCodes}】\n`
    translation += `   ├─ 接地段(1/3)：${segments[0] && segments[0].rwycc} (${this.getRwyccDescription(segments[0] && segments[0].rwycc)})\n`
    translation += `   ├─ 中段(1/3)：${segments[1] && segments[1].rwycc} (${this.getRwyccDescription(segments[1] && segments[1].rwycc)})\n`
    translation += `   └─ 滑跑段(1/3)：${segments[2] && segments[2].rwycc} (${this.getRwyccDescription(segments[2] && segments[2].rwycc)})\n`
    
    // E项 - 跑道污染物覆盖范围
    const coverages = segments.map(seg => seg.coverage === 'NR' ? 'NR' : `${seg.coverage}%`).join('/')
    translation += `E) 跑道污染物覆盖范围：【${coverages}】\n`
    segments.forEach((seg, index) => {
      const segmentName = ['接地段', '中段', '滑跑段'][index]
      const coverageDesc = seg.coverage === 'NR' ? '无报告' : `覆盖${seg.coverage}%`
      translation += `   ${index === 2 ? '└─' : '├─'} ${segmentName}：${coverageDesc}\n`
    })
    
    // F项 - 跑道污染物深度
    const depths = segments.map(seg => seg.depth === 'NR' ? 'NR' : `${seg.depth}mm`).join('/')
    translation += `F) 跑道污染物深度：【${depths}】\n`
    segments.forEach((seg, index) => {
      const segmentName = ['接地段', '中段', '滑跑段'][index]
      const depthDesc = seg.depth === 'NR' ? '无报告' : `深度${seg.depth}毫米`
      translation += `   ${index === 2 ? '└─' : '├─'} ${segmentName}：${depthDesc}\n`
    })
    
    // G项 - 跑道状况说明
    const conditions = segments.map(seg => this.translateCondition(seg.condition)).join(' / ')
    translation += `G) 跑道状况说明：【${conditions}】\n`
    segments.forEach((seg, index) => {
      const segmentName = ['接地段', '中段', '滑跑段'][index]
      const conditionDesc = this.translateCondition(seg.condition)
      translation += `   ${index === 2 ? '└─' : '├─'} ${segmentName}：${conditionDesc}\n`
    })
    
    // H项 - 跑道状况代码对应的跑道宽度
    const runwayWidth = this.data.grfDecodedResult && this.data.grfDecodedResult.runwayWidth
    if (runwayWidth) {
      translation += `H) 跑道状况代码对应的跑道宽度：【${runwayWidth}米】\n`
      translation += `   └─ 说明：清理宽度小于公布跑道宽度\n`
    } else {
      translation += `H) 跑道状况代码对应的跑道宽度：【未报告】\n`
      translation += `   └─ 说明：使用公布的跑道宽度\n`
    }
    
    // 情景意识部分（从原始报文中提取和翻译）
    const originalInput = this.data.grfSnowTamInput || ''
    const plainLanguageFromInput = this.extractPlainLanguageFromInput(originalInput)
    
    if (plainLanguageFromInput && plainLanguageFromInput.trim()) {
      translation += '\n『情景意识部分』\n'
      
      // 详细翻译明语说明中的各项内容
      const translatedItems = this.translatePlainLanguageItems(plainLanguageFromInput)
      if (translatedItems.length > 0) {
        translatedItems.forEach((item, index) => {
          translation += `${item.code}) 【${item.title}】：【${item.content}】\n`
          translation += `   └─ 注意事项：${item.note}\n`
          if (index < translatedItems.length - 1) {
            translation += '\n'
          }
        })
      }
    }
    


    return translation
  },

  // 解析翻译文本为结构化数据
  parseTranslationText(text: string) {
    const lines = text.split('\n')
    return lines.map(line => {
      const parts = []
      let currentText = ''
      let isInHighlight = false
      let isInTitle = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '『') {
          if (currentText) {
            parts.push({ text: currentText, isHighlight: false, isTitle: false })
            currentText = ''
          }
          isInTitle = true
        } else if (char === '』') {
          if (currentText) {
            parts.push({ text: currentText, isHighlight: false, isTitle: true })
            currentText = ''
          }
          isInTitle = false
        } else if (char === '【') {
          if (currentText) {
            parts.push({ text: currentText, isHighlight: false, isTitle: false })
            currentText = ''
          }
          isInHighlight = true
        } else if (char === '】') {
          if (currentText) {
            parts.push({ text: currentText, isHighlight: true, isTitle: false })
            currentText = ''
          }
          isInHighlight = false
        } else {
          currentText += char
        }
      }
      
      if (currentText) {
        parts.push({ text: currentText, isHighlight: isInHighlight, isTitle: isInTitle })
      }
      
      return { parts }
    })
  },

  // 生成带样式的翻译内容数组
  generateStyledTranslation(segments: any[]) {
    const items = []
    
    // 飞机性能计算部分
    items.push({ text: '【飞机性能计算部分】', type: 'header' })
    
    // A项 - 发生地
    const airport = (this.data.grfDecodedResult && this.data.grfDecodedResult.airport) || '未知'
    items.push({ 
      text: 'A) 发生地：', 
      type: 'label',
      value: airport,
      valueType: 'data'
    })
    
    // B项 - 观测时间  
    const obsTime = (this.data.grfDecodedResult && this.data.grfDecodedResult.observationTime) || '未知'
    items.push({ 
      text: 'B) 观测时间：', 
      type: 'label',
      value: obsTime,
      valueType: 'data'
    })
    
    // C项 - 跑道号码
    const runway = (this.data.grfDecodedResult && this.data.grfDecodedResult.runway) || '未知'
    items.push({ 
      text: 'C) 跑道号码：', 
      type: 'label',
      value: runway,
      valueType: 'data'
    })
    
    // D项 - 跑道状况代码
    const rwyccCodes = segments.map((seg: any) => seg.rwycc).join('/')
    items.push({ 
      text: 'D) 跑道状况代码：', 
      type: 'label',
      value: rwyccCodes,
      valueType: 'data'
    })
    
    items.push({ text: `   ├─ 接地段(1/3)：${segments[0] && segments[0].rwycc} (${this.getRwyccDescription(segments[0] && segments[0].rwycc)})`, type: 'detail' })
    items.push({ text: `   ├─ 中段(1/3)：${segments[1] && segments[1].rwycc} (${this.getRwyccDescription(segments[1] && segments[1].rwycc)})`, type: 'detail' })
    items.push({ text: `   └─ 滑跑段(1/3)：${segments[2] && segments[2].rwycc} (${this.getRwyccDescription(segments[2] && segments[2].rwycc)})`, type: 'detail' })
    
    return items
  },

  // 获取RWYCC描述
  getRwyccDescription(rwycc: number) {
    const descriptions: { [key: number]: string } = {
      0: '极差',
      1: '差', 
      2: '差',
      3: '中等',
      4: '中等至好',
      5: '好',
      6: '干燥'
    }
    return descriptions[rwycc] || '未知'
  },

  // 翻译污染物状况
  translateCondition(condition: string) {
    if (!condition || condition === 'NR') return '无报告'
    
    const translations: { [key: string]: string } = {
      'ICE': '冰',
      'WET ICE': '湿冰',
      'STANDING WATER': '积水',
      'SLUSH': '雪浆',
      'COMPACTED SNOW': '压实的雪',
      'WET SNOW': '湿雪',
      'DRY SNOW': '干雪',
      'DRY SONW': '干雪', // 处理可能的拼写错误
      'WET': '潮湿',
      'FROST': '霜',
      'DRY': '干燥',
      'DAMP': '润湿',
    }
    
    // 首先尝试完全匹配
    if (translations[condition]) {
      return translations[condition]
    }
    
    // 如果没有完全匹配，尝试智能分割和翻译复合污染物
    // 例如："WET SNOW DRIFTING SNOW" -> "湿雪 吹积雪"
    const parts = []
    let currentPart = ''
    const words = condition.split(/\s+/)
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      currentPart += (currentPart ? ' ' : '') + word
      
      // 检查当前组合是否是已知的污染物类型
      if (translations[currentPart]) {
        parts.push(translations[currentPart])
        currentPart = ''
      } else {
        // 检查下一个词是否会形成已知类型
        const nextWord = words[i + 1]
        if (nextWord) {
          const nextCombination = currentPart + ' ' + nextWord
          if (!translations[nextCombination]) {
            // 如果下个组合也不是已知类型，尝试翻译当前部分
            if (translations[word]) {
              if (currentPart === word) {
                parts.push(translations[word])
                currentPart = ''
              }
            }
          }
        } else {
          // 最后一个词，尝试翻译
          if (translations[word]) {
            if (currentPart === word) {
              parts.push(translations[word])
            } else {
              parts.push(currentPart)
            }
            currentPart = ''
          }
        }
      }
    }
    
    // 如果还有剩余部分，添加到结果中
    if (currentPart) {
      parts.push(translations[currentPart] || currentPart)
    }
    
    return parts.length > 0 ? parts.join(' ') : condition
  },

  // 从输入中提取明语说明
  extractPlainLanguageFromInput(input: string) {
    // 清理HTML实体编码
    const cleanInput = input
      .replace(/&#10;/g, '\n')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
    
    // 查找明语说明部分 - 通常在主要数据行之后
    const lines = cleanInput.split(/[\n\r]/).map(line => line.trim()).filter(line => line)
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // 跳过包含基本数据的行（机场代码、时间、跑道数据等）
      if (line.match(/^[A-Z]{4}\s+\d{6,8}/) || 
          line.match(/\d{6,8}\s+\w+\s+[\d\/]+/) ||
          line.match(/SNOWTAM\s+\d+/)) {
        continue
      }
      
      // 查找包含情景意识关键词的行
      if (line.match(/(?:SNOWBANK|POOR|CHEMICALLY|DRIFTING|REDUCED|LOOSE|ADJ)/i)) {
        return line
      }
      
      // 如果这行看起来像明语说明（包含多个英文单词但不是基本数据格式）
      if (line.match(/[A-Z\s]{10,}/) && !line.match(/[\d\/]{5,}/)) {
        return line
      }
    }
    
    return ''
  },

  // 翻译明语说明项目
  translatePlainLanguageItems(plainLanguage: string) {
    const items: Array<{code: string, title: string, content: string, note: string}> = []
    const upperText = plainLanguage.toUpperCase()
    
    // I项：跑道长度变短
    const reducedMatches = upperText.match(/RWY\s+(\w+)\s+REDUCED\s+TO\s+(\d+)/g)
    if (reducedMatches) {
      reducedMatches.forEach(match => {
        const parts = match.match(/RWY\s+(\w+)\s+REDUCED\s+TO\s+(\d+)/)
        if (parts) {
          items.push({
            code: 'I',
            title: '跑道长度变短',
            content: `跑道${parts[1]}长度变短至${parts[2]}米`,
            note: '飞行机组应检查在性能计算中是否使用了正确的可用着陆距离（LDA）/可用起飞距离（TODA）/可用起飞滑跑距离（TORA）/可用加速停止距离（ASDA），并核实使用的跑道入口位置。'
          })
        }
      })
    }
    
    // J项：跑道上有吹积的雪堆
    const driftingSnowMatches = upperText.match(/RWY\s+(\w+)\s+DRIFTING\s+SNOW|DRIFTING\s+SNOW/g)
    if (driftingSnowMatches) {
      driftingSnowMatches.forEach(match => {
        if (match.includes('RWY')) {
          const parts = match.match(/RWY\s+(\w+)\s+DRIFTING\s+SNOW/)
          if (parts) {
            items.push({
              code: 'J',
              title: '跑道上有吹积的雪堆',
              content: `跑道${parts[1]}上有吹积的雪堆`,
              note: '在侧风条件下产生的"移动跑道"视错觉。'
            })
          }
        } else {
          items.push({
            code: 'J',
            title: '跑道上有吹积的雪堆',
            content: '跑道上有吹积的雪堆',
            note: '在侧风条件下产生的"移动跑道"视错觉。'
          })
        }
      })
    }
    
    // K项：跑道上有散沙
    const looseSandMatches = upperText.match(/RWY\s+(\w+)\s+LOOSE\s+SAND/g)
    if (looseSandMatches) {
      looseSandMatches.forEach(match => {
        const parts = match.match(/RWY\s+(\w+)\s+LOOSE\s+SAND/)
        if (parts) {
          items.push({
            code: 'K',
            title: '跑道上有散沙',
            content: `跑道${parts[1]}上有散沙`,
            note: '如果使用反推，发动机会吸入沙子。如果预期会使用反推，对性能计算进行调整。'
          })
        }
      })
    }
    
    // L项：跑道化学处理
    const chemicalMatches = upperText.match(/RWY\s+(\w+)\s+CHEMICALLY\s+TREATED/g)
    if (chemicalMatches) {
      chemicalMatches.forEach(match => {
        const parts = match.match(/RWY\s+(\w+)\s+CHEMICALLY\s+TREATED/)
        if (parts) {
          items.push({
            code: 'L',
            title: '跑道的化学处理',
            content: `跑道${parts[1]}进行了化学处理`,
            note: '可能会造成刹车磨损。'
          })
        }
      })
    }
    
    // M项：跑道上有雪堤
    const snowbankMatches = upperText.match(/RWY\s+(\w+)\s+SNOWBANK\s+([LR]+)(\d+)\s+FM\s+CL/g)
    if (snowbankMatches) {
      snowbankMatches.forEach(match => {
        const parts = match.match(/RWY\s+(\w+)\s+SNOWBANK\s+([LR]+)(\d+)\s+FM\s+CL/)
        if (parts) {
          const runway = parts[1]
          const side = parts[2] === 'L' ? '左侧' : parts[2] === 'R' ? '右侧' : '左右两侧'
          const distance = parts[3]
          items.push({
            code: 'M',
            title: '跑道上有雪堤',
            content: `跑道${runway}上有雪堤，距中线${side}${distance}米`,
            note: '如果清除的宽度小于全跑道宽度（非全宽清理），要注意雪堤。存在失去方向控制或将雪吸入发动机的危险。'
          })
        }
      })
    }
    
    // N项：滑行道上有雪堤
    const taxiwaySnowbankMatches = upperText.match(/TWY\s+([A-Z\d]+)\s+SNOWBANK/g)
    if (taxiwaySnowbankMatches) {
      taxiwaySnowbankMatches.forEach(match => {
        const parts = match.match(/TWY\s+([A-Z\d]+)\s+SNOWBANK/)
        if (parts) {
          items.push({
            code: 'N',
            title: '滑行道上有雪堤',
            content: `滑行道${parts[1]}上有雪堤`,
            note: '滑行时避免吸入雪。'
          })
        }
      })
    }
    
    // O项：跑道附近有雪堤
    const adjSnowbankMatches = upperText.match(/RWY\s+(\w+)\s+ADJ\s+SNOWBANK/g)
    if (adjSnowbankMatches) {
      adjSnowbankMatches.forEach(match => {
        const parts = match.match(/RWY\s+(\w+)\s+ADJ\s+SNOWBANK/)
        if (parts) {
          items.push({
            code: 'O',
            title: '跑道附近有雪堤',
            content: `跑道${parts[1]}附近有雪堤`,
            note: '滑行时避免吸入雪。'
          })
        }
      })
    }
    
    // P项：滑行道状况
    const taxiwayPoorMatches = upperText.match(/TWY\s+([A-Z\d]+)\s+POOR|ALL\s+TWY\s+POOR/g)
    if (taxiwayPoorMatches) {
      taxiwayPoorMatches.forEach(match => {
        if (match.includes('ALL TWY POOR')) {
          items.push({
            code: 'P',
            title: '滑行道状况',
            content: '所有滑行道状况差',
            note: '相应地调整滑行速度和滑行技术。'
          })
        } else {
          const parts = match.match(/TWY\s+([A-Z\d]+)\s+POOR/)
          if (parts) {
            items.push({
              code: 'P',
              title: '滑行道状况',
              content: `滑行道${parts[1]}状况差`,
              note: '相应地调整滑行速度和滑行技术。'
            })
          }
        }
      })
    }
    
    // R项：停机坪状况
    const apronPoorMatches = upperText.match(/APRON\s+([A-Z\d]+)\s+POOR|ALL\s+APRON\s+POOR/g)
    if (apronPoorMatches) {
      apronPoorMatches.forEach(match => {
        if (match.includes('ALL APRON POOR')) {
          items.push({
            code: 'R',
            title: '停机坪状况',
            content: '所有停机坪状况差',
            note: '相应地调整滑行速度和滑行技术。'
          })
        } else {
          const parts = match.match(/APRON\s+([A-Z\d]+)\s+POOR/)
          if (parts) {
            items.push({
              code: 'R',
              title: '停机坪状况',
              content: `停机坪${parts[1]}状况差`,
              note: '相应地调整滑行速度和滑行技术。'
            })
          }
        }
      })
    }
    
    return items
  },

  // 生成多跑道标准雪情通告翻译
  generateMultiRunwaySafetyAdvice(allRunways: any[], airportCode: string, observationTime: string, plainLanguage?: string) {
    let translation = ''
    
    // 为每个跑道生成独立的飞机性能计算部分
    allRunways.forEach((runwayData, index) => {
      const { runway, segments } = runwayData
      
      // 每个跑道独立的飞机性能计算部分
      translation += `『飞机性能计算部分 - 跑道 ${runway}』\n`
      
      // A项 - 发生地
      translation += `A) 发生地：【${airportCode}】\n`
      
      // B项 - 观测时间  
      translation += `B) 观测时间：【${observationTime}】\n`
      
      // C项 - 跑道号码（当前跑道）
      translation += `C) 跑道号码：【${runway}】\n`
      
      // D项 - 跑道状况代码
      const rwyccCodes = segments.map((seg: any) => seg.rwycc).join('/')
      translation += `D) 跑道状况代码：【${rwyccCodes}】\n`
      translation += `   ├─ 接地段(1/3)：${segments[0] && segments[0].rwycc} (${this.getRwyccDescription(segments[0] && segments[0].rwycc)})\n`
      translation += `   ├─ 中段(1/3)：${segments[1] && segments[1].rwycc} (${this.getRwyccDescription(segments[1] && segments[1].rwycc)})\n`
      translation += `   └─ 滑跑段(1/3)：${segments[2] && segments[2].rwycc} (${this.getRwyccDescription(segments[2] && segments[2].rwycc)})\n`
      
      // E项 - 跑道污染物覆盖范围
      const coverages = segments.map((seg: any) => seg.coverage === 'NR' ? 'NR' : `${seg.coverage}%`).join('/')
      translation += `E) 跑道污染物覆盖范围：【${coverages}】\n`
      segments.forEach((seg: any, segIndex: number) => {
        const segmentName = ['接地段', '中段', '滑跑段'][segIndex]
        const coverageDesc = seg.coverage === 'NR' ? '无报告' : `覆盖${seg.coverage}%`
        translation += `   ${segIndex === 2 ? '└─' : '├─'} ${segmentName}：${coverageDesc}\n`
      })
      
      // F项 - 跑道污染物深度
      const depths = segments.map((seg: any) => seg.depth === 'NR' ? 'NR' : `${seg.depth}mm`).join('/')
      translation += `F) 跑道污染物深度：【${depths}】\n`
      segments.forEach((seg: any, segIndex: number) => {
        const segmentName = ['接地段', '中段', '滑跑段'][segIndex]
        const depthDesc = seg.depth === 'NR' ? '无报告' : `深度${seg.depth}毫米`
        translation += `   ${segIndex === 2 ? '└─' : '├─'} ${segmentName}：${depthDesc}\n`
      })
      
      // G项 - 跑道状况说明
      const conditions = segments.map((seg: any) => this.translateCondition(seg.condition)).join(' / ')
      translation += `G) 跑道状况说明：【${conditions}】\n`
      segments.forEach((seg: any, segIndex: number) => {
        const segmentName = ['接地段', '中段', '滑跑段'][segIndex]
        const conditionDesc = this.translateCondition(seg.condition)
        translation += `   ${segIndex === 2 ? '└─' : '├─'} ${segmentName}：${conditionDesc}\n`
      })
      
      // H项 - 跑道状况代码对应的跑道宽度
      const runwayWidth = runwayData.runwayWidth
      if (runwayWidth) {
        translation += `H) 跑道状况代码对应的跑道宽度：【${runwayWidth}米】\n`
        translation += `   └─ 说明：清理宽度小于公布跑道宽度\n`
        } else {
        translation += `H) 跑道状况代码对应的跑道宽度：【未报告】\n`
        translation += `   └─ 说明：使用公布的跑道宽度\n`
      }
      
      // 如果不是最后一个跑道，添加分隔符
      if (index < allRunways.length - 1) {
        translation += '\n'
      }
    })
    
        // 情景意识部分（如果有明语说明）- 只在最后添加一次
    if (plainLanguage && plainLanguage.trim()) {
      translation += '\n『情景意识部分』\n'
      
      // 详细翻译明语说明中的各项内容
      const translatedItems = this.translatePlainLanguageItems(plainLanguage)
      if (translatedItems.length > 0) {
        translatedItems.forEach((item, index) => {
          translation += `${item.code}) 【${item.title}】：【${item.content}】\n`
          translation += `   └─ 注意事项：${item.note}\n`
          if (index < translatedItems.length - 1) {
            translation += '\n'
          }
        })
      }
    }

    return translation
  }
}) 