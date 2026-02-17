/**
 * 低温修正计算器
 * 用于计算低温环境下的高度修正
 * 适用于航空仪表进近程序的高度修正
 */

/**
 * 计算低温高度修正
 * @param {Object} params 计算参数
 * @param {number} params.airportElevationFeet 机场标高(英尺)
 * @param {number} params.airportTemperatureC 机场温度(摄氏度)
 * @param {number} params.uncorrectedAltitudeFeet 未修正高度(英尺)
 * @param {boolean} params.isFafPoint 是否为FAF点
 * @param {number} params.fafDistanceNm FAF距离(海里)
 * @returns {Object} 修正结果
 */
function calculateColdTempCorrection(params) {
  var airportElevationFeet = params.airportElevationFeet;
  var airportTemperatureC = params.airportTemperatureC;
  var uncorrectedAltitudeFeet = params.uncorrectedAltitudeFeet;
  var isFafPoint = params.isFafPoint || false;
  var fafDistanceNm = params.fafDistanceNm || 0;

  // 1. 计算ISA温度 (标准大气温度)
  // ISA温度公式：T = 15 - 0.00198 * H (H为英尺高度)
  var isaTempC = 15 - (0.00198 * airportElevationFeet);

  // 2. 计算温度偏差
  var tempDeviationC = airportTemperatureC - isaTempC;

  // 3. 计算高度偏差（机场标高以上的高度）
  var heightAboveAirportFeet = uncorrectedAltitudeFeet - airportElevationFeet;

  // 4. 计算修正系数
  // 基于ICAO标准的温度修正公式
  // 修正系数 = (ISA温度 - 实际温度) / ISA温度(开尔文)
  // 注意：低温时需要增加高度，所以用ISA减去实际温度
  var isaKelvin = isaTempC + 273.15;
  var actualKelvin = airportTemperatureC + 273.15;
  var correctionFactor = (isaKelvin - actualKelvin) / isaKelvin;

  // 5. 计算高度修正值
  // 低温时correctionFactor为正，高温时为负
  var correctionFeet = Math.round(heightAboveAirportFeet * correctionFactor);

  // 6. 计算修正后高度
  var correctedAltitudeFeet = uncorrectedAltitudeFeet + correctionFeet;

  // 7. 构建基础结果
  var result = {
    isaTempC: Math.round(isaTempC * 10) / 10, // 保留1位小数
    tempDeviationC: Math.round(tempDeviationC * 10) / 10,
    correctionFeet: correctionFeet,
    correctedAltitudeFeet: correctedAltitudeFeet,
    vpaInfo: null
  };

  // 8. 如果是FAF点，计算VPA相关信息
  if (isFafPoint && fafDistanceNm > 0) {
    result.vpaInfo = calculateVpaInfo(
      fafDistanceNm,
      uncorrectedAltitudeFeet,
      correctedAltitudeFeet,
      airportElevationFeet
    );
  }

  return result;
}

/**
 * 计算VPA(Vertical Path Angle)相关信息
 * @param {number} fafDistanceNm FAF到跑道头距离(海里)
 * @param {number} uncorrectedFafFeet 未修正FAF高度(英尺)
 * @param {number} correctedFafFeet 修正后FAF高度(英尺)
 * @param {number} airportElevationFeet 机场标高(英尺)
 * @returns {Object} VPA信息
 */
function calculateVpaInfo(fafDistanceNm, uncorrectedFafFeet, correctedFafFeet, airportElevationFeet) {
  // 将海里转换为英尺 (1海里 = 6076英尺)
  var fafDistanceFeet = fafDistanceNm * 6076;

  // 计算设计VPA (基于未修正高度)
  var designedHeightAboveRunway = uncorrectedFafFeet - airportElevationFeet;
  var designedVpaRadians = Math.atan(designedHeightAboveRunway / fafDistanceFeet);
  var designedVpa = designedVpaRadians * (180 / Math.PI); // 转换为度

  // 计算实际VPA (基于修正后高度)
  var actualHeightAboveRunway = correctedFafFeet - airportElevationFeet;
  var actualVpaRadians = Math.atan(actualHeightAboveRunway / fafDistanceFeet);
  var actualVpa = actualVpaRadians * (180 / Math.PI);

  // 计算VPA变化
  var vpaChange = actualVpa - designedVpa;

  // 生成警告信息
  var warningMessage = generateVpaWarning(vpaChange, actualVpa);

  return {
    designedVpa: Math.round(designedVpa * 100) / 100, // 保留2位小数
    actualVpa: Math.round(actualVpa * 100) / 100,
    vpaChange: Math.round(vpaChange * 100) / 100,
    warningMessage: warningMessage
  };
}

/**
 * 生成VPA警告信息
 * @param {number} vpaChange VPA变化值(度)
 * @param {number} actualVpa 实际VPA(度)
 * @returns {string} 警告信息
 */
function generateVpaWarning(vpaChange, actualVpa) {
  var absChange = Math.abs(vpaChange);
  
  if (absChange < 0.1) {
    return '进近角度变化很小，对飞行路径影响轻微';
  } else if (absChange < 0.3) {
    if (vpaChange > 0) {
      return '进近角度略有增加，注意适当增加下降率';
    } else {
      return '进近角度略有减少，注意适当减小下降率';
    }
  } else if (absChange < 0.5) {
    if (vpaChange > 0) {
      return '进近角度明显增加，需要显著增加下降率';
    } else {
      return '进近角度明显减少，需要显著减小下降率';
    }
  } else {
    if (vpaChange > 0) {
      return '⚠️ 进近角度大幅增加，建议重新评估进近程序的安全性';
    } else {
      return '⚠️ 进近角度大幅减少，建议重新评估进近程序的安全性';
    }
  }
}

/**
 * 验证输入参数的有效性
 * @param {Object} params 输入参数
 * @returns {Object} 验证结果
 */
function validateInput(params) {
  var errors = [];

  if (typeof params.airportElevationFeet !== 'number' || isNaN(params.airportElevationFeet)) {
    errors.push('机场标高必须是有效数字');
  }

  if (typeof params.airportTemperatureC !== 'number' || isNaN(params.airportTemperatureC)) {
    errors.push('机场温度必须是有效数字');
  }

  if (typeof params.uncorrectedAltitudeFeet !== 'number' || isNaN(params.uncorrectedAltitudeFeet)) {
    errors.push('未修正高度必须是有效数字');
  }

  // 检查温度合理性 (地球表面温度范围)
  if (params.airportTemperatureC < -80 || params.airportTemperatureC > 60) {
    errors.push('机场温度超出合理范围(-80°C 到 60°C)');
  }

  // 检查高度合理性
  if (params.airportElevationFeet < -1000 || params.airportElevationFeet > 20000) {
    errors.push('机场标高超出合理范围(-1000ft 到 20000ft)');
  }

  if (params.uncorrectedAltitudeFeet < params.airportElevationFeet) {
    errors.push('进近高度不能低于机场标高');
  }

  // FAF特殊验证
  if (params.isFafPoint) {
    if (typeof params.fafDistanceNm !== 'number' || isNaN(params.fafDistanceNm)) {
      errors.push('FAF距离必须是有效数字');
    } else if (params.fafDistanceNm <= 0 || params.fafDistanceNm > 50) {
      errors.push('FAF距离超出合理范围(0 到 50海里)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * 计算多个高度的批量修正
 * @param {Object} baseParams 基础参数
 * @param {Array} altitudes 高度数组
 * @returns {Array} 修正结果数组
 */
function calculateBatchCorrections(baseParams, altitudes) {
  var results = [];

  for (var i = 0; i < altitudes.length; i++) {
    var altitude = altitudes[i];
    var params = {
      airportElevationFeet: baseParams.airportElevationFeet,
      airportTemperatureC: baseParams.airportTemperatureC,
      uncorrectedAltitudeFeet: altitude.value,
      isFafPoint: altitude.type === 'faf' && baseParams.isFafPoint,
      fafDistanceNm: baseParams.fafDistanceNm
    };

    var validation = validateInput(params);
    if (validation.isValid) {
      var result = calculateColdTempCorrection(params);
      results.push({
        name: altitude.name,
        type: altitude.type,
        originalFeet: altitude.value,
        result: result
      });
    } else {
      results.push({
        name: altitude.name,
        type: altitude.type,
        originalFeet: altitude.value,
        error: validation.errors.join('; ')
      });
    }
  }

  return results;
}

module.exports = {
  calculateColdTempCorrection: calculateColdTempCorrection,
  validateInput: validateInput,
  calculateBatchCorrections: calculateBatchCorrections
};