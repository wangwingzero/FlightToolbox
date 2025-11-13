/**
 * P章执勤期计算器 - 核心计算逻辑
 * 纯函数设计，不依赖外部状态
 */

var dutyData = require('./duty-data.js');

/**
 * 将时间字符串(HH:mm)转换为分钟数
 * @param {string} timeStr - 时间字符串，格式：HH:mm
 * @returns {number} 从00:00开始的分钟数
 */
function timeToMinutes(timeStr) {
  var parts = timeStr.split(':');
  var hours = parseInt(parts[0], 10);
  var minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * 将小数小时格式化为"X小时X分钟"
 * @param {number} decimalHours - 小数小时（例如：20.066666）
 * @returns {string} 格式化后的字符串（例如："20小时4分钟"）
 */
function formatDecimalHours(decimalHours) {
  var totalMinutes = Math.round(decimalHours * 60);
  var hours = Math.floor(totalMinutes / 60);
  var minutes = totalMinutes % 60;
  
  if (minutes === 0) {
    return hours + '小时';
  }
  return hours + '小时' + minutes + '分钟';
}

/**
 * 判断时间是否在指定范围内
 * @param {string} time - 时间字符串(HH:mm)
 * @param {string} start - 开始时间(HH:mm)
 * @param {string} end - 结束时间(HH:mm)
 * @returns {boolean}
 */
function isTimeInRange(time, start, end) {
  var timeMin = timeToMinutes(time);
  var startMin = timeToMinutes(start);
  var endMin = timeToMinutes(end);
  
  return timeMin >= startMin && timeMin <= endMin;
}

/**
 * 根据报到时间查询表A，获取最大飞行时间
 * @param {string} reportTime - 报到时间(HH:mm)
 * @returns {object} { maxFlightTime: number, timeRange: string, regulation: string }
 */
function getMaxFlightTimeFromTableA(reportTime) {
  var tableA = dutyData.TABLE_A;
  
  for (var i = 0; i < tableA.timeRanges.length; i++) {
    var range = tableA.timeRanges[i];
    if (isTimeInRange(reportTime, range.start, range.end)) {
      return {
        maxFlightTime: range.maxFlightTime,
        timeRange: range.start + ' - ' + range.end,
        regulation: dutyData.REGULATIONS.tableA
      };
    }
  }
  
  return null;
}

/**
 * 根据航段数确定查询键
 * @param {number} segments - 航段数
 * @returns {string} 查询键('1-4', '5', '6', '7+')
 */
function getSegmentKey(segments) {
  if (segments >= 1 && segments <= 4) {
    return '1-4';
  } else if (segments === 5) {
    return '5';
  } else if (segments === 6) {
    return '6';
  } else {
    return '7+';
  }
}

/**
 * 根据报到时间和航段数查询表B，获取最大飞行值勤期
 * @param {string} reportTime - 报到时间(HH:mm)
 * @param {number} segments - 航段数
 * @returns {object} { maxFDP: number, timeRange: string, segmentKey: string, regulation: string }
 */
function getMaxFDPFromTableB(reportTime, segments) {
  var tableB = dutyData.TABLE_B;
  var segmentKey = getSegmentKey(segments);
  
  for (var i = 0; i < tableB.timeRanges.length; i++) {
    var range = tableB.timeRanges[i];
    if (isTimeInRange(reportTime, range.start, range.end)) {
      return {
        maxFDP: range.segments[segmentKey],
        timeRange: range.start + ' - ' + range.end,
        segmentKey: segmentKey,
        regulation: dutyData.REGULATIONS.tableB
      };
    }
  }
  
  return null;
}

/**
 * 计算执勤结束时间
 * @param {string} reportTime - 报到时间(HH:mm)
 * @param {number} maxFDP - 最大飞行值勤期(小时，可以是小数)
 * @param {string} reportDate - 报到日期(YYYY-MM-DD)，可选
 * @returns {object} { endTime: string, endDate: string, endDateTime: Date }
 */
function calculateEndTime(reportTime, maxFDP, reportDate) {
  var parts = reportTime.split(':');
  var hours = parseInt(parts[0], 10);
  var minutes = parseInt(parts[1], 10);
  
  // 将maxFDP（小数小时）转换为总分钟数
  var totalMinutesToAdd = Math.round(maxFDP * 60);
  
  // 将报到时间转换为总分钟数
  var totalMinutes = hours * 60 + minutes + totalMinutesToAdd;
  
  // 计算结束时间的小时和分钟（都是整数）
  var endHours = Math.floor(totalMinutes / 60);
  var endMinutes = totalMinutes % 60;
  var daysAdded = 0;
  
  // 处理跨天
  while (endHours >= 24) {
    endHours -= 24;
    daysAdded++;
  }
  
  var endTimeStr = (endHours < 10 ? '0' + endHours : endHours) + ':' + 
                   (endMinutes < 10 ? '0' + endMinutes : endMinutes);
  
  // 如果提供了日期，计算结束日期
  var endDateStr = '';
  var endDateTime = null;
  if (reportDate) {
    // 🔧 iOS兼容性修复：将 "2025-10-25 00:10" 转换为 "2025/10/25 00:10"
    var iOSCompatibleDate = reportDate.replace(/-/g, '/') + ' ' + reportTime;
    var reportDateTime = new Date(iOSCompatibleDate);
    endDateTime = new Date(reportDateTime.getTime() + maxFDP * 60 * 60 * 1000);
    var year = endDateTime.getFullYear();
    var month = endDateTime.getMonth() + 1;
    var day = endDateTime.getDate();
    endDateStr = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
  }
  
  return {
    endTime: endTimeStr,
    endDate: endDateStr,
    endDateTime: endDateTime,
    daysAdded: daysAdded
  };
}

/**
 * 计算非扩编机组的限制
 * @param {string} reportTime - 报到时间(HH:mm)
 * @param {number} segments - 航段数
 * @param {string} reportDate - 报到日期(YYYY-MM-DD)，可选
 * @param {string} unexpectedType - 意外类型，可选
 * @param {boolean} hasIntermediateRest - 是否有中断休息，可选
 * @param {number} intermediateRestHours - 中断休息时长（小时），可选
 * @param {number} positioningHours - 置位时间（小时，小数），可选
 * @returns {object} 计算结果
 */
function calculateNormalCrew(reportTime, segments, reportDate, unexpectedType, hasIntermediateRest, intermediateRestHours, positioningHours) {
  // 查询表A获取最大飞行时间
  var flightTimeResult = getMaxFlightTimeFromTableA(reportTime);
  
  // 查询表B获取最大飞行值勤期
  var fdpResult = getMaxFDPFromTableB(reportTime, segments);
  
  if (!flightTimeResult || !fdpResult) {
    return {
      success: false,
      error: '无法查询到对应的限制数据'
    };
  }
  
  var baseFDP = fdpResult.maxFDP;
  var finalFDP = baseFDP;
  var extensionApplied = false;
  var extensionNote = '';
  
  // 如果有意外情况，直接应用延长
  if (unexpectedType === 'before-takeoff') {
    finalFDP = baseFDP + 2;
    extensionApplied = true;
    extensionNote = '⚠️ 已包含起飞前意外延长2小时（基础' + baseFDP + 'h + 延长2h）';
  }
  
  // 处理中断休息（如果有）
  var actualElapsedTime = finalFDP;  // 实际经过的时间（含休息）
  var intermediateRestNote = '';
  if (hasIntermediateRest && intermediateRestHours > 0) {
    actualElapsedTime = finalFDP + intermediateRestHours;
    intermediateRestNote = '⏸️ 执勤期含' + formatDecimalHours(intermediateRestHours) + '住宿场所休息（不计入执勤期）';
  }

  // 🆕 置位时间说明（置位不延长执勤期，只占用休息期）
  var positioningNote = '';
  if (positioningHours && positioningHours > 0) {
    positioningNote = '✈️ 置位时间：' + formatDecimalHours(positioningHours) + '（占用休息期，延后最早下次执勤时间）';
  }

  // 使用实际经过的时间计算执勤结束时间
  var endTimeResult = calculateEndTime(reportTime, actualElapsedTime, reportDate);
  
  return {
    success: true,
    crewType: 'normal',
    reportTime: reportTime,
    reportDate: reportDate,
    segments: segments,
    maxFlightTime: flightTimeResult.maxFlightTime,
    maxFDP: finalFDP,  // 直接使用延长后的值
    baseFDP: baseFDP,  // 保存基础值
    extensionApplied: extensionApplied,
    extensionNote: extensionNote,
    unexpectedType: unexpectedType,
    hasIntermediateRest: hasIntermediateRest,
    intermediateRestHours: intermediateRestHours,
    intermediateRestHoursText: formatDecimalHours(intermediateRestHours),  // 格式化后的休息时长
    intermediateRestNote: intermediateRestNote,
    positioningHours: positioningHours || 0,  // 🆕 置位时间
    positioningHoursText: formatDecimalHours(positioningHours || 0),  // 🆕 格式化后的置位时间
    positioningNote: positioningNote,  // 🆕 置位说明
    actualElapsedTime: actualElapsedTime,  // 实际经过时间（数值）
    actualElapsedTimeText: formatDecimalHours(actualElapsedTime),  // 格式化后的实际经过时间
    endTime: endTimeResult.endTime,
    endDate: endTimeResult.endDate,
    endDateTime: endTimeResult.endDateTime,
    daysAdded: endTimeResult.daysAdded,
    flightTimeRange: flightTimeResult.timeRange,
    fdpTimeRange: fdpResult.timeRange,
    segmentKey: fdpResult.segmentKey,
    regulations: {
      flightTime: flightTimeResult.regulation,
      fdp: fdpResult.regulation
    }
  };
}

/**
 * 根据机组人数和休息设施等级查询表C，获取最大飞行值勤期
 * @param {number} crewCount - 飞行员数量(3或4)
 * @param {number} restFacility - 休息设施等级(1/2/3)
 * @returns {object} { maxFDP: number, maxFlightTime: number, facilityName: string, regulation: string }
 */
function getMaxFDPFromTableC(crewCount, restFacility) {
  var tableC = dutyData.TABLE_C;
  
  for (var i = 0; i < tableC.crewConfigs.length; i++) {
    var config = tableC.crewConfigs[i];
    if (config.crewCount === crewCount) {
      for (var j = 0; j < config.restFacilities.length; j++) {
        var facility = config.restFacilities[j];
        if (facility.level === restFacility) {
          return {
            maxFDP: facility.maxFDP,
            maxFlightTime: config.maxFlightTime,
            facilityName: facility.name,
            regulation: dutyData.REGULATIONS.tableC
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * 计算扩编机组的限制
 * @param {number} crewCount - 飞行员数量(3或4)
 * @param {number} restFacility - 休息设施等级(1/2/3)
 * @param {string} reportTime - 报到时间(HH:mm)，可选
 * @param {string} reportDate - 报到日期(YYYY-MM-DD)，可选
 * @param {string} unexpectedType - 意外类型，可选
 * @param {boolean} hasIntermediateRest - 是否有中断休息，可选
 * @param {number} intermediateRestHours - 中断休息时长（小时），可选
 * @param {number} positioningHours - 置位时间（小时，小数），可选
 * @returns {object} 计算结果
 */
function calculateAugmentedCrew(crewCount, restFacility, reportTime, reportDate, unexpectedType, hasIntermediateRest, intermediateRestHours, positioningHours) {
  // 查询表C获取最大飞行值勤期和飞行时间
  var result = getMaxFDPFromTableC(crewCount, restFacility);

  if (!result) {
    return {
      success: false,
      error: '无法查询到对应的限制数据'
    };
  }

  // 获取休息设施说明
  var facilityDesc = dutyData.REST_FACILITY_DESCRIPTIONS[restFacility];

  var baseFDP = result.maxFDP;
  var finalFDP = baseFDP;
  var extensionApplied = false;
  var extensionNote = '';

  // 如果有意外情况，直接应用延长
  if (unexpectedType === 'before-takeoff') {
    finalFDP = baseFDP + 2;
    extensionApplied = true;
    extensionNote = '⚠️ 已包含起飞前意外延长2小时（基础' + baseFDP + 'h + 延长2h）';
  }

  // 处理中断休息（如果有）
  var actualElapsedTime = finalFDP;  // 实际经过的时间（含休息）
  var intermediateRestNote = '';
  if (hasIntermediateRest && intermediateRestHours > 0) {
    actualElapsedTime = finalFDP + intermediateRestHours;
    intermediateRestNote = '⏸️ 执勤期含' + formatDecimalHours(intermediateRestHours) + '住宿场所休息（不计入执勤期）';
  }

  // 🆕 置位时间说明（置位不延长执勤期，只占用休息期）
  var positioningNote = '';
  if (positioningHours && positioningHours > 0) {
    positioningNote = '✈️ 置位时间：' + formatDecimalHours(positioningHours) + '（占用休息期，延后最早下次执勤时间）';
  }

  // 计算执勤结束时间（如果提供了报到时间）
  var endTimeResult = null;
  if (reportTime) {
    endTimeResult = calculateEndTime(reportTime, actualElapsedTime, reportDate);
  }

  return {
    success: true,
    crewType: 'augmented',
    crewCount: crewCount,
    restFacility: restFacility,
    reportTime: reportTime,
    reportDate: reportDate,
    maxFlightTime: result.maxFlightTime,
    maxFDP: finalFDP,  // 直接使用延长后的值
    baseFDP: baseFDP,  // 保存基础值
    extensionApplied: extensionApplied,
    extensionNote: extensionNote,
    unexpectedType: unexpectedType,
    hasIntermediateRest: hasIntermediateRest,
    intermediateRestHours: intermediateRestHours,
    intermediateRestHoursText: formatDecimalHours(intermediateRestHours),  // 格式化后的休息时长
    intermediateRestNote: intermediateRestNote,
    positioningHours: positioningHours || 0,  // 🆕 置位时间
    positioningHoursText: formatDecimalHours(positioningHours || 0),  // 🆕 格式化后的置位时间
    positioningNote: positioningNote,  // 🆕 置位说明
    actualElapsedTime: actualElapsedTime,  // 实际经过时间（数值）
    actualElapsedTimeText: formatDecimalHours(actualElapsedTime),  // 格式化后的实际经过时间
    endTime: endTimeResult ? endTimeResult.endTime : null,
    endDate: endTimeResult ? endTimeResult.endDate : null,
    endDateTime: endTimeResult ? endTimeResult.endDateTime : null,
    daysAdded: endTimeResult ? endTimeResult.daysAdded : 0,
    facilityName: result.facilityName,
    facilityDescription: facilityDesc ? facilityDesc.description : '',
    facilityExample: facilityDesc ? facilityDesc.example : '',
    regulations: {
      flightTime: dutyData.REGULATIONS.augmentedFlightTime,
      fdp: result.regulation
    }
  };
}

/**
 * 获取累积限制
 * @returns {object} 累积限制数据
 */
function getCumulativeLimits() {
  var limits = dutyData.CUMULATIVE_LIMITS;
  
  return {
    continuous7Days: {
      fdp: limits.continuous7Days.fdp,
      label: limits.continuous7Days.label,
      regulation: limits.continuous7Days.regulation,
      description: '连续7天内的飞行值勤期总和不得超过60小时'
    },
    monthly: {
      flightTime: limits.monthly.flightTime,
      fdp: limits.monthly.fdp,
      label: limits.monthly.label,
      regulation: limits.monthly.regulation,
      description: '任一日历月内的飞行时间不得超过100小时，飞行值勤期不得超过210小时'
    },
    yearly: {
      flightTime: limits.yearly.flightTime,
      label: limits.yearly.label,
      regulation: limits.yearly.regulation,
      description: '任一日历年内的飞行时间不得超过900小时'
    }
  };
}

/**
 * 获取休息期要求
 * @returns {object} 休息期要求数据
 */
function getRestRequirements() {
  return dutyData.REST_REQUIREMENTS;
}

/**
 * 格式化计算结果为显示文本
 * @param {object} result - 计算结果
 * @returns {object} 格式化后的文本
 */
function formatResult(result) {
  if (!result.success) {
    return {
      success: false,
      error: result.error
    };
  }
  
  var formatted = {
    success: true,
    title: result.crewType === 'normal' ? '非扩编机组' : '扩编机组',
    maxFlightTime: result.maxFlightTime + '小时',
    maxFDP: result.maxFDP + '小时'
  };
  
  if (result.crewType === 'normal') {
    formatted.details = [
      '报到时间：' + result.reportTime,
      '航段数量：' + result.segments + '个',
      '时间段：' + result.flightTimeRange,
      '法规依据：' + result.regulations.flightTime + '、' + result.regulations.fdp
    ];
  } else {
    formatted.details = [
      '飞行员数量：' + result.crewCount + '名',
      '休息设施：' + result.facilityName,
      '设施说明：' + result.facilityDescription,
      '法规依据：' + result.regulations.flightTime + '、' + result.regulations.fdp
    ];
  }
  
  return formatted;
}

/**
 * 验证输入参数
 * @param {string} reportTime - 报到时间
 * @param {number} segments - 航段数
 * @returns {object} { valid: boolean, error: string }
 */
function validateNormalCrewInput(reportTime, segments) {
  // 验证时间格式
  var timePattern = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timePattern.test(reportTime)) {
    return {
      valid: false,
      error: '报到时间格式不正确，应为HH:mm格式'
    };
  }
  
  // 验证航段数
  if (!Number.isInteger(segments) || segments < 1 || segments > 20) {
    return {
      valid: false,
      error: '航段数应为1-20之间的整数'
    };
  }
  
  return { valid: true };
}

/**
 * 验证扩编机组输入参数
 * @param {number} crewCount - 飞行员数量
 * @param {number} restFacility - 休息设施等级
 * @returns {object} { valid: boolean, error: string }
 */
function validateAugmentedCrewInput(crewCount, restFacility) {
  if (crewCount !== 3 && crewCount !== 4) {
    return {
      valid: false,
      error: '飞行员数量必须为3或4'
    };
  }
  
  if (restFacility !== 1 && restFacility !== 2 && restFacility !== 3) {
    return {
      valid: false,
      error: '休息设施等级必须为1、2或3'
    };
  }
  
  return { valid: true };
}

/**
 * 计算剩余执勤时间（实时更新，每秒刷新）
 * @param {Date} endDateTime - 执勤结束时间
 * @returns {object} { remainingHours, remainingMinutes, remainingText, isExpired }
 */
function calculateRemainingTime(endDateTime) {
  var now = new Date();
  var diff = endDateTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return {
      remainingHours: 0,
      remainingMinutes: 0,
      remainingText: '已到期',
      isExpired: true
    };
  }
  
  // 实时计算小时、分钟（每秒更新，但不显示秒数）
  var hours = Math.floor(diff / (1000 * 60 * 60));
  var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  var text = hours + '小时' + minutes + '分钟';
  
  return {
    remainingHours: hours,
    remainingMinutes: minutes,
    remainingText: text,
    isExpired: false
  };
}

/**
 * 计算意外运行情况下的延长
 * @param {object} baseResult - 基础计算结果
 * @param {string} unexpectedType - 意外类型 'none' | 'before-takeoff'
 * @returns {object|null} 延长信息
*/
function calculateUnexpectedExtension(baseResult, unexpectedType) {
  if (unexpectedType === 'none' || !unexpectedType) {
    return null;
  }

  var maxFDP = baseResult.maxFDP;
  var extendedFDP = maxFDP;
  var notes = [];
  var title = '';

  if (unexpectedType === 'before-takeoff') {
    // 起飞前意外：可延长最多2小时
    extendedFDP = maxFDP + 2;
    title = '起飞前意外运行情况';
    notes = [
      '📌 可将最大飞行值勤期延长2小时',
      '⚠️ 延长30分钟以上只能在获得休息期前发生一次',
      '🚫 不能导致超出累积值勤期限制',
      '📝 延长30分钟以上需在10日内报告局方',
      '⏰ 需在30天内实施修正措施'
    ];
  }

  // 计算延长后的结束时间
  var extendedEndTime = null;
  if (baseResult.endDateTime) {
    var extendedDateTime = new Date(baseResult.endDateTime.getTime() + 2 * 60 * 60 * 1000);
    var hours = extendedDateTime.getHours();
    var minutes = extendedDateTime.getMinutes();
    var timeStr = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);
    
    var year = extendedDateTime.getFullYear();
    var month = extendedDateTime.getMonth() + 1;
    var day = extendedDateTime.getDate();
    var dateStr = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    
    extendedEndTime = dateStr + ' ' + timeStr;
  }
  
  return {
    title: title,
    extendedFDP: extendedFDP,
    extendedEndTime: extendedEndTime,
    notes: notes,
    regulation: '第121.485条(c)款'
  };
}

module.exports = {
  calculateNormalCrew: calculateNormalCrew,
  calculateAugmentedCrew: calculateAugmentedCrew,
  getCumulativeLimits: getCumulativeLimits,
  getRestRequirements: getRestRequirements,
  formatResult: formatResult,
  validateNormalCrewInput: validateNormalCrewInput,
  validateAugmentedCrewInput: validateAugmentedCrewInput,
  getMaxFlightTimeFromTableA: getMaxFlightTimeFromTableA,
  getMaxFDPFromTableB: getMaxFDPFromTableB,
  getMaxFDPFromTableC: getMaxFDPFromTableC,
  calculateEndTime: calculateEndTime,
  calculateRemainingTime: calculateRemainingTime,
  calculateUnexpectedExtension: calculateUnexpectedExtension,
  formatDecimalHours: formatDecimalHours
};
