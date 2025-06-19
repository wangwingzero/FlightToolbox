"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateColdTempCorrection = calculateColdTempCorrection;
/**
 * ICAO 标准大气模型中的常量
 */
const CONSTANTS = {
    T_ISA_SL_C: 15.0, // ISA 海平面标准温度 (°C)
    T_ISA_SL_K: 288.15, // ISA 海平面标准温度 (K) = 15°C + 273.15
    T_K0: 273.15, // 0°C 的开尔文绝对温度值 (K)
    L0_METRIC: -0.0065, // ISA第一层中气压高度温度标准递减率 (°C/m)
    FEET_TO_METERS: 0.3048, // 英尺到米的转换系数
    METERS_TO_FEET: 1 / 0.3048, // 米到英尺的转换系数
    NM_TO_METERS: 1852, // 海里到米的转换系数
};
/**
 * 根据 ICAO PANS-OPS Doc 8168 标准对数公式计算温度高度修正
 * 公式: Δh = (-ΔTSTD/L0) × ln[1 + (L0 × hFAP)/(T0 + L0 × hTHR)]
 * @param input 包含所有输入参数的对象
 * @returns 返回包含修正值、修正后高度以及可选VPA分析的对象
 */
function calculateColdTempCorrection(input) {
    const { airportElevationFeet, airportTemperatureC, uncorrectedAltitudeFeet, isFafPoint = false, fafDistanceNm = 0 } = input;
    // --- 步骤 1: 单位转换和参数准备 ---
    const hTHR_m = airportElevationFeet * CONSTANTS.FEET_TO_METERS; // 高于平均海平面的入口标高
    const hFAP_m = (uncorrectedAltitudeFeet - airportElevationFeet) * CONSTANTS.FEET_TO_METERS; // FAP高于入口的程序高
    if (hFAP_m < 0) {
        throw new Error("修正前高度必须大于机场标高。");
    }
    // --- 步骤 2: 计算温度偏差 ---
    // ΔTSTD = 相对于标准日(ISA)温度的温度偏差
    // 需要将机场温度调整到对应高度的ISA标准温度进行比较
    const isaTemperatureAtAirport = CONSTANTS.T_ISA_SL_C + CONSTANTS.L0_METRIC * hTHR_m; // 机场高度的ISA标准温度(°C)
    const deltaT_STD = airportTemperatureC - isaTemperatureAtAirport; // 温度偏差(°C)
    // --- 步骤 3: 应用ICAO标准对数公式 ---
    // Δh = (-ΔTSTD/L0) × ln[1 + (L0 × hFAP)/(T0 + L0 × hTHR)]
    // 根据ICAO标准，T0应该使用开尔文温度，L0使用K/m
    const T0_K = CONSTANTS.T_ISA_SL_K; // 海平面的标准温度 (288.15K)
    const L0_K = CONSTANTS.L0_METRIC; // ISA第一层中气压高度温度标准递减率 (-0.0065K/m)
    // 将机场高度的ISA温度转换为开尔文
    const isaTemperatureAtAirport_K = isaTemperatureAtAirport + CONSTANTS.T_K0; // 转换为开尔文
    // 计算对数内部的表达式 - 使用开尔文温度
    const logArgument = 1 + (L0_K * hFAP_m) / (T0_K + L0_K * hTHR_m);
    if (logArgument <= 0) {
        throw new Error("计算出现错误，对数参数必须大于零。");
    }
    // 计算高度修正值 (米)
    const deltaH_m = (-deltaT_STD / L0_K) * Math.log(logArgument);
    // --- 步骤 4: 将结果转换回英尺 ---
    const correctionFeet = deltaH_m * CONSTANTS.METERS_TO_FEET;
    const correctedAltitudeFeet = uncorrectedAltitudeFeet + correctionFeet;
    const result = {
        correctionFeet: Math.round(correctionFeet), // 通常取整
        correctedAltitudeFeet: Math.round(correctedAltitudeFeet) // 通常取整
    };
    // --- 步骤 4: 如果是FAF点，计算FPA ---
    if (isFafPoint && fafDistanceNm > 0) {
        const fafDistance_m = fafDistanceNm * CONSTANTS.NM_TO_METERS;
        const runwayThresholdHeight_ft = 50; // 跑道头通常比机场标高高50英尺
        // 设计FPA（基于修正前的气压高度，相对于跑道头）
        const H_ft = uncorrectedAltitudeFeet - airportElevationFeet; // FAP高于入口的程序高(英尺)
        const designedFpa_ft = H_ft - runwayThresholdHeight_ft;
        const designedFpa_m = designedFpa_ft * CONSTANTS.FEET_TO_METERS;
        const designedFpaRad = Math.atan(designedFpa_m / fafDistance_m);
        const designedFpa = designedFpaRad * (180 / Math.PI);
        // 修正后的FPA（基于修正后的气压高度，相对于跑道头）
        const correctedHeight_ft = H_ft + correctionFeet;
        const fpaAfterCorrection_ft = correctedHeight_ft - runwayThresholdHeight_ft;
        const fpaAfterCorrection_m = fpaAfterCorrection_ft * CONSTANTS.FEET_TO_METERS;
        const fpaAfterCorrectionRad = Math.atan(fpaAfterCorrection_m / fafDistance_m);
        const fpaAfterCorrection = fpaAfterCorrectionRad * (180 / Math.PI);
        const fpaIncrease = fpaAfterCorrection - designedFpa;
        // 生成正确的警告消息
        let changeDescription = '';
        const absChange = Math.abs(fpaIncrease);
        if (fpaIncrease > 0) {
            changeDescription = `温度修正使FPA需要增大 ${absChange.toFixed(2)}°`;
        }
        else if (fpaIncrease < 0) {
            changeDescription = `温度修正使FPA需要减小 ${absChange.toFixed(2)}°`;
        }
        else {
            changeDescription = `温度修正对FPA无影响`;
        }
        result.vpaInfo = {
            designedVpa: parseFloat(designedFpa.toFixed(2)), // 设计FPA
            actualVpa: parseFloat(fpaAfterCorrection.toFixed(2)), // 修正后FPA
            vpaChange: parseFloat(fpaIncrease.toFixed(2)),
            warningMessage: `未修正前FPA为 ${designedFpa.toFixed(2)}°，修正后FPA为 ${fpaAfterCorrection.toFixed(2)}°。${changeDescription}。`
        };
    }
    return result;
}
