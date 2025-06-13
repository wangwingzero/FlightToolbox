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
    acrDataLoaded: false
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
      const tirePressureLimits = {
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
      const evaluationMethodNames = {
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
          tirePressureCheckPassed: tirePressureCheckPassed,
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
        acrError: `计算失败: ${error.message || '请检查输入参数'}`
      })

      // 如果有错误，滚动到错误信息
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '.acr-error-section',
          duration: 500
        })
      }, 300)
    }
  }
}) 