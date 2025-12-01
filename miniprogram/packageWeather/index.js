var BasePage = require('../utils/base-page.js');
var weatherAdvisoryConfig = require('../data/weather-advisory.js');
var rodexData = require('../data/rodex.js');
var AirportDataLoader = require('../packageC/data-loader.js');

// ==================== 常量定义 ====================
var MAX_INPUT_LENGTH = 5000;

var WEATHER_CODES = {
  'DZ': '毛毛雨', 'RA': '雨', 'SN': '雪', 'SG': '米雪', 'IC': '冰晶',
  'PL': '冰粒', 'GR': '雹', 'GS': '小冰雹和/或霰', 'UP': '未知降水',
  'BR': '轻雾', 'FG': '雾', 'FU': '烟', 'VA': '火山灰', 'DU': '尘',
  'SA': '沙', 'HZ': '霾', 'PY': '喷雾', 'PO': '尘/沙卷风',
  'SQ': '飚', 'FC': '漏斗云/陆龙卷或水龙卷', 'SS': '沙暴', 'DS': '尘暴',
  'SH': '阵雨', 'TS': '雷暴'
};

var DESCRIPTOR_CODES = {
  'MI': '浅的', 'PR': '部分的', 'BC': '碎片的', 'DR': '低吹', 'BL': '高吹',
  'SH': '阵性', 'TS': '雷暴', 'FZ': '冻结', 'VC': '附近', 'RE': '近期'
};

var CLOUD_AMOUNT_CODES = {
  'FEW': '少云（1～2个八分量）', 'SCT': '疏云（3～4个八分量）', 'BKN': '多云（5～7个八分量）',
  'OVC': '阴天（8个八分量）', 'NSC': '无显著云', 'NCD': '无云可见',
  'SKC': '晴空', 'CLR': '无显著云', 'VV': '垂直能见度'
};

// SIGMET/AIRMET 气象术语（避免误识别为机场代码）
var AVIATION_TERMS = {
  // 分布/类型
  'EMBD': '嵌入式（云中嵌有）', 'ISOL': '孤立的', 'OCNL': '偶发的', 'FREQ': '成片的',
  'OBSC': '遮蔽的', 'SQL': '飑线', 'LN': '线状', 'AREA': '区域',
  // 预报/观测
  'FCST': '预报', 'OBS': '观测', 'OTLK': '展望', 'VALID': '有效期',
  // 移动/变化
  'MOV': '移动', 'MOVG': '移动中', 'STNR': '静止', 'WKN': '减弱', 'INTSF': '加强',
  'NC': '无变化', 'INTST': '强度',
  // 位置/范围
  'FIR': '飞行情报区', 'UIR': '高空飞行情报区', 'CTA': '管制区', 'CTR': '管制地带',
  'ABV': '以上', 'BLW': '以下', 'BTN': '之间', 'AND': '和', 'TOP': '云顶', 'BASE': '云底',
  'SFC': '地面', 'FL': '飞行高度层', 'APRX': '大约', 'WI': '在...范围内',
  // 天气现象
  'CB': '积雨云', 'TCU': '浓积云', 'TS': '雷暴', 'TURB': '颠簸', 'ICE': '积冰',
  'MTW': '山地波', 'RDOACT': '放射性', 'CLD': '云', 'FZRA': '冻雨', 'FZDZ': '冻毛毛雨',
  'SEV': '严重', 'MOD': '中度', 'LGT': '轻度', 'HVY': '强',
  // 其他
  'CNL': '取消', 'AMD': '修订', 'COR': '更正', 'TEST': '测试',
  'PANS': '程序', 'INFO': '情报', 'NOTAM': '航行通告', 'NIL': '无'
};

// ==================== 预编译正则表达式 ====================
var PATTERNS = {
  metar: /^\s*(METAR|SPECI)\b/,
  metReport: /^\s*MET REPORT\b/,
  special: /^\s*SPECIAL\b/,
  taf: /^\s*TAF\b/,
  tafAuto: /^\s*[A-Z]{4}\s+\d{6}Z\s+\d{4}\/\d{4}\b/,
  metarAuto: /^\s*[A-Z]{4}\s+\d{6}Z\b/,
  sigmet: /\bSIGMET\b/,
  airmet: /\bAIRMET\b/,
  time: /^\d{6}Z$/,
  valid: /^\d{4}\/\d{4}$/,
  wind: /^(VRB|\d{3})(\d{2,3})(G\d{2,3})?(KT|MPS)$/,
  windVar: /^\d{3}V\d{3}$/,
  visibility: /^\d{4}$/,
  visibilitySm: /^([PM])?(\d{1,2}|\d\/\d)SM$/,
  rvr: /^R\d{2}[LCR]?\//,
  tempDew: /^M?\d{2}\/M?\d{2}$/,
  extremeTemp: /^(TX|TN)(M?\d{2})\/(\d{2})(\d{2})Z$/,
  qnh: /^Q\d{4}$/,
  qfe: /^QFE(\d{3})\/(\d{4})$/,
  cloud: /^(FEW|SCT|BKN|OVC|NSC|NCD|SKC|CLR|VV)(\d{3}|\/\/\/)?(CB|TCU)?$/,
  altimeterInch: /^A\d{4}$/,
  slp: /^SLP(\d{3}|NO)$/
};

// 全局时间显示模式：'local' 表示北京时间(UTC+8)，'utc' 表示世界时
var TIME_MODE = 'local';

// 动态构建天气现象正则（限制重复次数，防止ReDoS）
var wxKeys = Object.keys(WEATHER_CODES).join('|');
var descKeys = Object.keys(DESCRIPTOR_CODES).join('|');
// 最多允许2个天气现象组合（如TSRA），避免重复量词攻击
PATTERNS.weather = new RegExp('^([+-])?(' + descKeys + ')?(' + wxKeys + ')(?:' + wxKeys + ')?$');

// 常量配置
var UI_UPDATE_DELAY = 50;
var MAX_TOKEN_LENGTH = 20;
var MAX_TOKENS = 100;

// ==================== 工具函数 ====================
function toInt(str) {
  var n = parseInt(str, 10);
  return isNaN(n) ? null : n;
}

function buildAnalysis(summary, sections) {
  return { summary: summary || '', sections: sections || [] };
}

// ==================== 机场名称辅助函数 ====================
var _airportCache = null;

function ensureAirportDataLoaded() {
  // 返回 Promise，解析为机场数组（可能为空）
  if (_airportCache) {
    return Promise.resolve(_airportCache);
  }

  try {
    if (AirportDataLoader && typeof AirportDataLoader.loadAirportData === 'function') {
      return AirportDataLoader.loadAirportData().then(function(list) {
        _airportCache = Array.isArray(list) ? list : [];
        return _airportCache;
      }).catch(function() {
        _airportCache = [];
        return _airportCache;
      });
    }
  } catch (e) {
    _airportCache = [];
  }

  return Promise.resolve(_airportCache || []);
}

function getAirportDisplayName(icaoCode) {
  if (!icaoCode || typeof icaoCode !== 'string') return icaoCode || '';
  var code = icaoCode.toUpperCase();

  // 如果还没缓存机场表，则直接返回代码，避免阻塞当前同步解析
  if (!_airportCache || !_airportCache.length) {
    // 异步触发加载，后续解码会逐渐具备名称
    ensureAirportDataLoaded();
    return code;
  }

  for (var i = 0; i < _airportCache.length; i++) {
    var ap = _airportCache[i];
    if (ap && ap.ICAOCode === code) {
      var shortName = ap.ShortName || '';
      if (shortName) {
        return code + '（' + shortName + '）';
      }
      return code;
    }
  }

  return code;
}

// ==================== 通用格式化函数 ====================
function formatWindText(token) {
  if (!token) return '';
  var up = String(token).toUpperCase();
  if (!PATTERNS.wind.test(up)) return token;

  var m = PATTERNS.wind.exec(up);
  if (!m) return token;

  var dir = m[1], speed = m[2], gust = m[3] || '', unit = m[4];
  var unitText = unit === 'MPS' ? '米/秒' : '节';
  var dirText = dir === 'VRB' ? '风向多变' : ('风向 ' + dir + '°');
  var windDesc = dirText + '，风速 ' + parseInt(speed, 10) + ' ' + unitText;
  if (gust) windDesc += '，阵风 ' + parseInt(gust.substring(1), 10) + ' ' + unitText;
  return token + '（' + windDesc + '）';
}

function formatVisibilityText(token) {
  if (!token) return '';
  var up = String(token).toUpperCase();

  if (up === 'CAVOK') {
    return token + '（能见度≥10000米，1500米或者最高的最低扇区高度（两者取其大）以下无云，天空没有积雨云或浓积云，且无显著天气现象）';
  }

  if (PATTERNS.visibility.test(up)) {
    var visVal = parseInt(up, 10);
    if (!isNaN(visVal)) {
      var visDesc = visVal >= 9999 ? '≥10km' : visVal + 'm';
      return token + '（' + visDesc + '）';
    }
    return token;
  }

  if (PATTERNS.visibilitySm && PATTERNS.visibilitySm.test(up)) {
    var vm = PATTERNS.visibilitySm.exec(up);
    if (!vm) return token;
    var prefix = vm[1] || '';
    var core = vm[2];
    var more = prefix === 'P';
    var less = prefix === 'M';
    var miles = 0;

    if (core.indexOf('/') !== -1) {
      var fracParts = core.split('/');
      var num = parseInt(fracParts[0], 10);
      var den = parseInt(fracParts[1], 10);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        miles = num / den;
      }
    } else {
      var milesVal = parseFloat(core);
      if (!isNaN(milesVal)) miles = milesVal;
    }

    var visSmDesc = '';
    if (miles > 0) {
      var km = miles * 1.60934;
      if (more) {
        visSmDesc = '约>' + km.toFixed(1) + 'km';
      } else if (less) {
        visSmDesc = '约<' + km.toFixed(1) + 'km';
      } else {
        visSmDesc = '约' + km.toFixed(1) + 'km';
      }
      return token + '（' + visSmDesc + '）';
    }
  }

  return token;
}

function formatRvrText(token) {
  if (!token) return '';
  var up = String(token).toUpperCase();
  if (!PATTERNS.rvr.test(up)) return token;

  // 1) 公制 RVR：R15/0600U
  var m = /^R(\d{2}[LCR]?)\/([PM]?\d{4})([UDN])?$/.exec(up);
  if (m) {
    var runway = m[1];
    var rvrValue = m[2];
    var trend = m[3];
    var desc = '跑道' + runway + '视程 ';
    if (rvrValue.charAt(0) === 'P') {
      desc += '>' + rvrValue.substring(1) + 'm';
    } else if (rvrValue.charAt(0) === 'M') {
      desc += '<' + rvrValue.substring(1) + 'm';
    } else {
      desc += rvrValue + 'm';
    }
    if (trend) {
      desc += '（' + (trend === 'U' ? '上升' : trend === 'D' ? '下降' : '无变化') + '）';
    }
    return token + '（' + desc + '）';
  }

  // 2) 英制 RVR：R15/5500VP6000FT/D
  m = /^R(\d{2}[LCR]?)\/([PM]?\d{4})V(P?\d{4})FT\/(U|D|N)$/.exec(up);
  if (m) {
    var rwy2 = m[1];
    var minStr = m[2];
    var maxStr = m[3];
    var trend2 = m[4];

    function formatFeetValue(str) {
      if (!str) return '';
      var sign = '';
      var digits = str;
      if (str.charAt(0) === 'P') { sign = '>'; digits = str.substring(1); }
      else if (str.charAt(0) === 'M') { sign = '<'; digits = str.substring(1); }
      var v = parseInt(digits, 10);
      if (isNaN(v)) return str + 'ft';
      var meters = Math.round(v * 0.3048);
      var text = '';
      if (sign) text += sign;
      text += v + 'ft（约';
      if (sign) text += sign;
      text += meters + 'm）';
      return text;
    }

    var minText = formatFeetValue(minStr);
    var maxText = formatFeetValue(maxStr);
    var desc2 = '跑道' + rwy2 + '视程 ' + minText + ' 至 ' + maxText;
    if (trend2) {
      desc2 += '（' + (trend2 === 'U' ? '上升' : trend2 === 'D' ? '下降' : '无变化') + '）';
    }
    return token + '（' + desc2 + '）';
  }

  // 3) 简化英制 RVR：R15/5500FT/D
  m = /^R(\d{2}[LCR]?)\/([PM]?\d{4})FT\/(U|D|N)$/.exec(up);
  if (m) {
    var rwy3 = m[1];
    var valStr = m[2];
    var trend3 = m[3];

    function formatFeetSingle(str2) {
      if (!str2) return '';
      var sign2 = '';
      var digits2 = str2;
      if (str2.charAt(0) === 'P') { sign2 = '>'; digits2 = str2.substring(1); }
      else if (str2.charAt(0) === 'M') { sign2 = '<'; digits2 = str2.substring(1); }
      var v2 = parseInt(digits2, 10);
      if (isNaN(v2)) return str2 + 'ft';
      var meters2 = Math.round(v2 * 0.3048);
      var text2 = '';
      if (sign2) text2 += sign2;
      text2 += v2 + 'ft（约';
      if (sign2) text2 += sign2;
      text2 += meters2 + 'm）';
      return text2;
    }

    var valText = formatFeetSingle(valStr);
    var desc3 = '跑道' + rwy3 + '视程 ' + valText;
    if (trend3) {
      desc3 += '（' + (trend3 === 'U' ? '上升' : trend3 === 'D' ? '下降' : '无变化') + '）';
    }
    return token + '（' + desc3 + '）';
  }

  return token;
}

/**
 * 解析天气现象代码
 * @param {Array} weatherList - 天气现象代码列表
 * @returns {Array} 解析后的天气描述列表
 */
function parseWeatherPhenomena(weatherList) {
  var results = [];
  for (var j = 0; j < weatherList.length; j++) {
    var raw = weatherList[j] || '';
    if (!raw) continue;
    var grp = raw.toUpperCase();
    var sign = '', descriptor = '', phenomena = '';
    if (grp[0] === '+' || grp[0] === '-') { sign = grp[0]; grp = grp.substring(1); }
    var dKeys = Object.keys(DESCRIPTOR_CODES);
    for (var d = 0; d < dKeys.length; d++) {
      if (grp.indexOf(dKeys[d]) === 0) {
        descriptor = DESCRIPTOR_CODES[dKeys[d]] || '';
        phenomena = WEATHER_CODES[grp.substring(dKeys[d].length)] || grp.substring(dKeys[d].length);
        break;
      }
    }
    if (!descriptor) phenomena = WEATHER_CODES[grp] || grp;
    var intensity = sign === '+' ? '强' : (sign === '-' ? '轻' : '');
    var zh = (intensity + descriptor + phenomena).trim();
    if (!zh) zh = grp;
    results.push(raw + '（' + zh + '）');
  }
  return results;
}

/**
 * 解析云况代码
 * @param {Array} cloudList - 云况代码列表
 * @returns {Array} 解析后的云况描述列表
 */
function parseCloudInfo(cloudList) {
  var results = [];
  for (var c = 0; c < cloudList.length; c++) {
    var cg = cloudList[c];
    if (!cg) continue;
    if (cg.indexOf('CAVOK') !== -1) {
      results.push('CAVOK（能见度≥10000米，1500米或者最高的最低扇区高度（两者取其大）以下无云，天空没有积雨云或浓积云，且无显著天气现象）');
      continue;
    }
    var m = PATTERNS.cloud.exec(cg.toUpperCase());
    if (!m) { results.push(cg); continue; }
    var cloudText = CLOUD_AMOUNT_CODES[m[1]] || m[1];
    if (m[2] && m[2] !== '///') {
      var h = toInt(m[2]);
      if (h !== null) cloudText += '，云底 ' + (h * 100) + 'ft';
    }
    if (m[3]) cloudText += m[3] === 'CB' ? '（积雨云）' : '（浓积云）';
    results.push(cg + '（' + cloudText + '）');
  }
  return results;
}

// 将 TAF 中的日/小时按照时差进行平移（用于 UTC → 本地时间转换）
function shiftDayHourWithOffset(dayStr, hourStr, offsetHours) {
  var d = toInt(dayStr);
  var h = toInt(hourStr);
  if (d === null || h === null) return null;

  var totalHours = h + offsetHours;
  var addDay = 0;
  if (totalHours >= 24) {
    addDay = Math.floor(totalHours / 24);
    totalHours = totalHours % 24;
  } else if (totalHours < 0) {
    addDay = Math.floor((totalHours - 23) / 24);
    totalHours = (totalHours % 24 + 24) % 24;
  }

  var newDay = d + addDay;
  if (newDay > 31 || newDay <= 0) {
    // 简单环绕到 1-31 范围内，避免跨月时出现 0 或 >31 的日期
    newDay = ((newDay - 1) % 31 + 31) % 31 + 1;
  }

  var dayOut = (newDay < 10 ? '0' : '') + newDay;
  var hourOut = (totalHours < 10 ? '0' : '') + totalHours;
  return { day: dayOut, hour: hourOut };
}

// 根据全局 TIME_MODE 格式化 TAF 有效期
function formatValidPeriodText(v) {
  if (!PATTERNS.valid.test(v)) return '';

  var from = v.substring(0, 4);
  var to = v.substring(5, 9);
  var fromDay = from.substring(0, 2);
  var fromHour = from.substring(2, 4);
  var toDay = to.substring(0, 2);
  var toHour = to.substring(2, 4);

  // 基础时间文本（不带时区）
  var baseText = fromDay + '日' + fromHour + '时 至 ' + toDay + '日' + toHour + '时';

  // UTC 模式
  if (TIME_MODE === 'utc') {
    return baseText + ' (UTC)';
  }

  // 北京时间 = UTC+8
  var fromLocal = shiftDayHourWithOffset(fromDay, fromHour, 8);
  var toLocal = shiftDayHourWithOffset(toDay, toHour, 8);
  if (fromLocal && toLocal) {
    return baseText + ' (北京时间)';
  }

  // 回退：无法换算时依然返回 UTC
  return baseText + ' (UTC)';
}

// 根据全局 TIME_MODE 格式化单个时间
function formatUtcBeijingTime(dayStr, hourStr, minuteStr) {
  var d = toInt(dayStr);
  var h = toInt(hourStr);
  var m = toInt(minuteStr);
  
  // 基础时间文本（不带时区）
  var baseText = dayStr + '日' + hourStr + ':' + minuteStr;
  
  if (d === null || h === null || m === null) {
    return baseText + ' (UTC)';
  }
  
  // UTC 模式
  if (TIME_MODE === 'utc') {
    return baseText + ' (UTC)';
  }
  
  // 本地(北京时间)模式
  var local = shiftDayHourWithOffset(dayStr, hourStr, 8);
  if (local) {
    return baseText + ' (北京时间)';
  }
  
  // 回退：无法换算时返回 UTC
  return baseText + ' (UTC)';
}

// 构造 TAF 预报阶段标题文案
function buildTafSegmentTitle(seg, index) {
  var code = (seg.code || '').toUpperCase();
  var base = '';

  if (seg.kind === 'INITIAL') {
    base = '初始预报（全时段）';
  } else if (seg.kind === 'BECMG') {
    base = '逐渐变化（BECMG）';
  } else if (seg.kind === 'TEMPO') {
    base = '临时波动（TEMPO）';
  } else if (seg.kind === 'PROB') {
    var m = /PROB(\d{2})/.exec(code);
    var probText = m ? m[1] : '';
    var isTempoProb = code.indexOf('TEMPO') !== -1;
    base = '概率' + (probText ? ' ' + probText + '% ' : ' ') + (isTempoProb ? '临时波动' : '预报') + '（' + code + '）';
  } else if (seg.kind === 'FM') {
    if (code.length === 8 && code.indexOf('FM') === 0) {
      var d = code.substring(2, 4);
      var h = code.substring(4, 6);
      var mi = code.substring(6, 8);
      var timeText = formatUtcBeijingTime(d, h, mi);
      base = '自 ' + timeText + ' 起（FM）';
    } else {
      base = '从指定时间起（FM）';
    }
  } else {
    base = '预报阶段 ' + (index + 1);
  }

  if (seg.timeInfo) {
    return base + ' · ' + seg.timeInfo;
  }
  return base;
}

// RODEX 跑道状态解码（用于 METAR 中的 Rxx/xxxxxx、Rxx/////// 等）
function decodeRodexGroupToken(token) {
  if (!token || token.charAt(0) !== 'R') return null;
  var core = token.substring(1); // 去掉前缀 R

  var validPattern = /(\d{1,2}[LCR]?|88|99)\/(CLRD\d{2}|[0-9\/]{6})$/;
  var allSlashPattern = /(\d{1,2}[LCR]?|88|99)\/\/\/\/\/\/$/; // 形如 16///////、88///////
  var special99Pattern = /(\d{1,2}[LCR]?)\/\/\/99\/{2}$/;      // 形如 14///99//

  if (!validPattern.test(core) && !allSlashPattern.test(core) && !special99Pattern.test(core)) {
    return null;
  }

  var runwayMatch = core.match(/^(\d{1,2}[LCR]?|88|99)/);
  if (!runwayMatch) return null;
  var runwayCode = runwayMatch[1];
  var runwayText = '';
  if (runwayCode === '88') runwayText = '所有跑道';
  else if (runwayCode === '99') runwayText = '重复之前的跑道状态报告';
  else runwayText = '跑道' + runwayCode;

  var firstSlashIndex = core.indexOf('/');
  if (firstSlashIndex < 0) return null;
  var statusCode = core.substring(firstSlashIndex + 1);

  // statusCode 长度应为至少 6 位
  if (!statusCode || statusCode.length < 6) return runwayText + '：跑道状态未完整报告';

  // 全斜杠：污染但报告不可用（长度 6 或 7 等都视为同义）
  if (/^\/+$/ .test(statusCode)) {
    return runwayText + '：跑道有污染但具体状态未报告（报告不可用）';
  }
  // 特殊 //99//：跑道清理中，不可用
  if (statusCode === '//99//') {
    return runwayText + '：跑道因清理工作暂时不可用';
  }

  // CLRD + 两位数字：污染已清除 + 摩擦系数
  if (/^CLRD\d{2}$/.test(statusCode)) {
    var frictionCode = statusCode.substring(4, 6);
    var brakingInfo = rodexGetBrakingInfo(frictionCode);
    var partsCleared = ['污染已清除'];
    if (brakingInfo && brakingInfo.coefficient) {
      var frictionText = '摩擦系数 ' + brakingInfo.coefficient;
      var details = [];
      if (brakingInfo.europeLevel) {
        details.push('欧洲标准：刹车效应' + brakingInfo.europeLevel);
      }
      if (brakingInfo.russiaLevel) {
        details.push('俄罗斯标准：刹车效应' + brakingInfo.russiaLevel);
      }
      if (details.length) {
        frictionText += '（' + details.join('；') + '）';
      }
      partsCleared.push(frictionText);
    }
    return token + '（' + runwayText + '：' + partsCleared.join('，') + '）';
  }

  // 普通 6 位状态码：ERCRerereRBRBR
  if (statusCode.length === 6 && !/^\/+$/ .test(statusCode)) {
    var depositType = statusCode.charAt(0);
    var coverageCode = statusCode.charAt(1);
    var depthCode = statusCode.substring(2, 4);
    var brakingCode = statusCode.substring(4, 6);

    var depositDesc = rodexGetDepositDescription(depositType);
    var coverageDesc = rodexGetContaminationDescription(coverageCode);
    var depthDesc = rodexGetDepthDescription(depthCode);
    var braking = rodexGetBrakingInfo(brakingCode);

    var parts = [];
    if (depositDesc) parts.push(depositDesc);
    if (coverageDesc) parts.push(coverageDesc);
    if (depthDesc) parts.push('深度 ' + depthDesc);
    if (braking) {
      if (braking.coefficient) {
        var frictionText2 = '摩擦系数 ' + braking.coefficient;
        var detail2 = [];
        if (braking.europeLevel) {
          detail2.push('欧洲标准：刹车效应' + braking.europeLevel);
        }
        if (braking.russiaLevel) {
          detail2.push('俄罗斯标准：刹车效应' + braking.russiaLevel);
        }
        if (detail2.length) {
          frictionText2 += '（' + detail2.join('；') + '）';
        }
        parts.push(frictionText2);
      } else if (braking.level) {
        // 无明确系数但有级别时，至少展示欧洲标准级别
        parts.push('刹车效应' + braking.level);
      }
    }

    return token + '（' + runwayText + '：' + parts.join('，') + '）';
  }

  return token + '（' + runwayText + '：跑道状态未报告）';
}

function rodexGetDepositDescription(code) {
  try {
    var deposits = rodexData && rodexData.components && rodexData.components.runway_deposits && rodexData.components.runway_deposits.values;
    return deposits && deposits[code] ? deposits[code] : '未知污染物类型';
  } catch (e) {
    return '未知污染物类型';
  }
}

function rodexGetContaminationDescription(code) {
  try {
    var contamination = rodexData && rodexData.components && rodexData.components.extent_of_contamination && rodexData.components.extent_of_contamination.values;
    return contamination && contamination[code] ? contamination[code] : '未知污染程度';
  } catch (e) {
    return '未知污染程度';
  }
}

function rodexGetDepthDescription(code) {
  try {
    var depths = rodexData && rodexData.components && rodexData.components.depth_of_deposit && rodexData.components.depth_of_deposit.values;
    return depths && depths[code] ? depths[code] : '未知深度';
  } catch (e) {
    return '未知深度';
  }
}

function rodexGetBrakingInfo(brakingCode) {
  if (!brakingCode) return null;

  var coefficient;
  // level 仍然保持为“欧洲标准”的级别，保证向后兼容
  var level = '';
  var europeLevel = '';
  var russiaLevel = '';

  if (brakingCode === '91') {
    level = europeLevel = '差';
    coefficient = '< 0.25';
  } else if (brakingCode === '92') {
    level = europeLevel = '中等偏差';
    coefficient = '0.26-0.29';
  } else if (brakingCode === '93') {
    level = europeLevel = '中等';
    coefficient = '0.30-0.35';
  } else if (brakingCode === '94') {
    level = europeLevel = '中等偏好';
    coefficient = '0.36-0.39';
  } else if (brakingCode === '95') {
    level = europeLevel = '好';
    coefficient = '≥ 0.40';
  } else if (brakingCode === '99') {
    level = europeLevel = '不可靠';
    coefficient = '无法测量';
  } else if (brakingCode === '//') {
    level = europeLevel = '未报告';
    coefficient = '未报告';
  } else {
    var n = parseInt(brakingCode, 10);
    if (isNaN(n)) {
      coefficient = '';
      level = europeLevel = '';
    } else {
      var c = n / 100;
      coefficient = c.toFixed(2);

      // 欧洲/ICAO：按实测摩擦系数分级
      if (c >= 0.40) {
        level = europeLevel = '好';
      } else if (c >= 0.36) {
        level = europeLevel = '中等偏好';
      } else if (c >= 0.30) {
        level = europeLevel = '中等';
      } else if (c >= 0.26) {
        level = europeLevel = '中等偏差';
      } else {
        level = europeLevel = '差';
      }

      // 俄罗斯规范值：使用 rodex.js 中 regional_variations.Russia.braking_action_table
      try {
        var rv = rodexData && rodexData.regional_variations && rodexData.regional_variations.Russia;
        var tableWrap = rv && rv.braking_action_table;
        var table = tableWrap && tableWrap.table;
        if (table && table.length) {
          for (var i = 0; i < table.length; i++) {
            var row = table[i];
            if (typeof row.normative_min === 'number' && typeof row.normative_max === 'number') {
              if (c >= row.normative_min && c <= row.normative_max) {
                russiaLevel = rodexMapRussiaBrakingActionToZh(row.braking_action);
                break;
              }
            }
          }
        }
      } catch (e) {
        // 忽略俄罗斯映射异常，保持欧洲结果
      }
    }
  }

  return {
    coefficient: coefficient,
    level: level,
    europeLevel: europeLevel,
    russiaLevel: russiaLevel
  };
}

// 将俄罗斯 braking_action 英文描述映射为简明中文
function rodexMapRussiaBrakingActionToZh(action) {
  if (!action) return '';
  var a = String(action).toLowerCase();
  if (a.indexOf('good to medium') !== -1) return '好-中等';
  if (a.indexOf('medium to good') !== -1) return '中等-好';
  if (a.indexOf('medium to poor') !== -1) return '中等-差';
  if (a.indexOf('good') !== -1 && a.indexOf('medium') === -1) return '好';
  if (a.indexOf('medium') !== -1 && a.indexOf('good') === -1 && a.indexOf('poor') === -1) return '中等';
  if (a.indexOf('poor') !== -1 && a.indexOf('unreliable') === -1) return '差';
  if (a.indexOf('unreliable') !== -1) return '不可靠';
  return action;
}

// ==================== 页面配置 ====================
var pageConfig = {
  data: {
    rawInput: '',
    detectedType: '',
    detectedTypeLabel: '',
    errorMessage: '',
    analysis: null,
    isAdFree: false,
    loading: false,
    // 时间显示模式：'local' = 北京时间，'utc' = 世界时
    timeMode: 'local'
  },

  // ==================== 生命周期 ====================
  customOnLoad: function() {
    // 页面加载完成
  },

  customOnShow: function() {
    // 页面显示
  },

  customOnHide: function() {
    // 页面隐藏
  },

  customOnUnload: function() {
    // 页面卸载，清理数据
    this.setData({
      rawInput: '',
      analysis: null,
      errorMessage: '',
      detectedType: '',
      detectedTypeLabel: '',
      loading: false
    });
  },

  // ==================== 事件处理 ====================
  onExampleTap: function(e) {
    var example = e.currentTarget.dataset.example || '';
    if (!example) return;

    this.setData({
      rawInput: example,
      errorMessage: '',
      analysis: null,
      detectedType: '',
      detectedTypeLabel: ''
    });

    this.handleDecode();
  },

  onInputChange: function(e) {
    var value = (e.detail && e.detail.value) || '';

    // 输入长度限制
    if (value.length > MAX_INPUT_LENGTH) {
      this.setData({
        errorMessage: '报文过长，最大' + MAX_INPUT_LENGTH + '字符'
      });
      return;
    }

    this.setData({
      rawInput: value,
      errorMessage: '',
      analysis: null,
      detectedType: '',
      detectedTypeLabel: ''
    });
  },

  onInputFocus: function() {},
  onInputBlur: function() {},

  handleClear: function() {
    if (!this.data.rawInput) return;
    this.setData({
      rawInput: '',
      detectedType: '',
      detectedTypeLabel: '',
      errorMessage: '',
      analysis: null
    });
  },

  // 时间模式切换：北京时间 / UTC
  onTimeModeTap: function(e) {
    var mode = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.mode) || '';
    if (mode !== 'local' && mode !== 'utc') return;
    if (mode === this.data.timeMode) return;

    // 更新全局与页面状态
    TIME_MODE = mode;
    this.setData({ timeMode: mode });

    // 若当前已有报文，则按新时区模式重新解码
    var text = (this.data.rawInput || '').trim();
    if (text) {
      this.handleDecode();
    }
  },

  handleDecode: function() {
    var self = this;
    var text = (this.data.rawInput || '').trim();

    if (!text) {
      this.setData({ errorMessage: '请输入报文内容' });
      return;
    }

    // 二次验证输入长度
    if (text.length > MAX_INPUT_LENGTH) {
      this.setData({ errorMessage: '报文过长，请检查输入' });
      return;
    }

    // 显示加载状态
    this.setData({ loading: true, errorMessage: '' });

    // 使用 setTimeout 让 UI 更新
    setTimeout(function() {
      try {
        var result = self.decodeMessage(text);

        if (result && result.analysis) {
          self.setData({
            detectedType: result.type || '',
            detectedTypeLabel: result.typeLabel || '',
            analysis: result.analysis,
            errorMessage: '',
            loading: false
          });
        } else {
          self.setData({
            detectedType: '',
            detectedTypeLabel: '',
            analysis: null,
            errorMessage: (result && result.errorMessage) || '未能识别该报文类型',
            loading: false
          });
        }
      } catch (error) {
        console.error('[Weather Decoder] Error:', error);
        // 使用BasePage统一错误处理
        if (self.handleError) {
          self.handleError(error, '天气报文解码');
        }
        self.setData({
          errorMessage: '解码失败：' + (error.message || '请检查报文格式'),
          loading: false
        });
      }
    }, UI_UPDATE_DELAY);
  },

  // ==================== 报文识别 ====================
  decodeMessage: function(rawText) {
    var text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    if (!text) {
      return { type: '', typeLabel: '', analysis: null, errorMessage: '报文内容为空' };
    }

    var firstLine = text.split('\n')[0];
    var upperFirst = firstLine.toUpperCase();

    // METAR / SPECI
    if (PATTERNS.metar.test(upperFirst)) {
      return this.decodeMetarLike(text, 'METAR');
    }
    // MET REPORT / SPECIAL
    if (PATTERNS.metReport.test(upperFirst) || PATTERNS.special.test(upperFirst)) {
      var metReport = this.decodeMetReportDetailed(text);
      if (metReport) return metReport;
      return this.decodeMetarLike(text, 'MET_REPORT');
    }
    // TAF
    if (PATTERNS.taf.test(upperFirst)) {
      return this.decodeTaf(text, 'TAF');
    }
    // 自动识别 TAF 形态
    if (PATTERNS.tafAuto.test(upperFirst)) {
      return this.decodeTaf(text, 'TAF_NO_HEADER');
    }
    // 自动识别 METAR 形态
    if (PATTERNS.metarAuto.test(upperFirst)) {
      return this.decodeMetarLike(text, 'METAR_NO_HEADER');
    }
    // VA / TC / SWX ADVISORY
    if (upperFirst.indexOf('VA ADVISORY') !== -1) {
      return this.decodeStructuredAdvisory(text, 'VA_ADVISORY');
    }
    if (upperFirst.indexOf('TC ADVISORY') !== -1) {
      return this.decodeStructuredAdvisory(text, 'TC_ADVISORY');
    }
    if (upperFirst.indexOf('SWX ADVISORY') !== -1) {
      return this.decodeStructuredAdvisory(text, 'SWX_ADVISORY');
    }
    // SIGMET / AIRMET
    if (PATTERNS.sigmet.test(upperFirst)) {
      return this.decodeSigmet(text, 'SIGMET');
    }
    if (PATTERNS.airmet.test(upperFirst)) {
      return this.decodeSigmet(text, 'AIRMET');
    }
    // METAR 片段
    var fragmentResult = this.decodeMetarFragment(firstLine);
    if (fragmentResult) return fragmentResult;

    return {
      type: 'UNKNOWN',
      typeLabel: '未识别',
      analysis: null,
      errorMessage: '未能识别该报文类型，请确认是否为 ICAO 标准格式'
    };
  },

  // ==================== MET REPORT 解析 ====================
  decodeMetReportDetailed: function(text) {
    try {
      var config = weatherAdvisoryConfig && weatherAdvisoryConfig.MET_REPORT;
      if (!config || !config.fields || !config.fields.length) return null;

      var fields = config.fields;
      var itemsByGroup = {};
      var totalCount = 0;
      var headerInfo = { station: '', time: '' };

      function pushItem(groupKey, label, value) {
        var g = groupKey || 'body';
        if (!itemsByGroup[g]) itemsByGroup[g] = [];
        itemsByGroup[g].push({ label: label, value: value });
        totalCount++;
      }

      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (!f || !f.pattern) continue;
        var re;
        try { re = new RegExp(f.pattern, 'm'); } catch (e) { continue; }
        var m = re.exec(text);
        if (!m) continue;

        if (f.code === 'HEADER') {
          if (m[2]) headerInfo.station = m[2];
          if (m[3]) headerInfo.time = m[3];
        }
        pushItem(f.group || 'body', f.labelZh || f.code || '', m[0]);
      }

      if (!totalCount) return null;

      var sections = [];
      var groupOrder = ['header', 'body', 'footer', 'other'];
      var groupTitles = { header: '报头信息', body: '主体信息', footer: '附加信息', other: '其他' };

      for (var gi = 0; gi < groupOrder.length; gi++) {
        var gKey = groupOrder[gi];
        var arr = itemsByGroup[gKey];
        if (!arr || !arr.length) continue;
        sections.push({
          id: gKey,
          icon: gKey === 'header' ? '📍' : '🌦️',
          title: groupTitles[gKey] || gKey,
          items: arr
        });
      }

      sections.push({
        id: 'raw', icon: '📄', title: '原始报文',
        items: [{ label: '原文', value: text }]
      });

      var summary = (headerInfo.station ? headerInfo.station + ' 机场' : '') +
        (headerInfo.time ? '，观测时间 ' + headerInfo.time : '') +
        '，解析出 ' + totalCount + ' 个字段';

      return {
        type: 'MET_REPORT',
        typeLabel: '机场例行/特殊天气报告（MET REPORT）',
        analysis: buildAnalysis(summary, sections),
        errorMessage: ''
      };
    } catch (e) {
      return null;
    }
  },

  // ==================== METAR 片段解析 ====================
  decodeMetarFragment: function(line) {
    var self = this;
    var text = (line || '').trim().replace(/\s+/g, ' ').replace(/=$/, '');
    if (!text) return null;

    // 限制token数量，防止过度循环
    var tokens = text.split(' ').slice(0, MAX_TOKENS);
    var recognized = [];
    var items = [];

    // 辅助函数：添加识别结果
    function addResult(token, label, value) {
      recognized.push(token);
      items.push({ label: label, value: value });
    }

    // 单独处理单个token的情况（用户只输入一个元素）
    if (tokens.length === 1) {
      var single = tokens[0].toUpperCase();
      var singleResult = self.decodeSingleToken(single);
      if (singleResult) {
        return {
          type: 'METAR_FRAGMENT',
          typeLabel: 'METAR/SPECI 报文元素',
          analysis: buildAnalysis('识别为 ' + singleResult.type + '：' + text, [
            { id: 'element', icon: singleResult.icon, title: singleResult.type, items: [
              { label: singleResult.label, value: singleResult.value }
            ]}
          ]),
          errorMessage: ''
        };
      }
    }

    // 多token情况，逐个解析
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var up = t.toUpperCase();

      // 跳过过长的token
      if (up.length > MAX_TOKEN_LENGTH) {
        continue;
      }

      // 时间戳 YYGGggZ
      if (PATTERNS.time.test(up)) {
        var day = up.substring(0, 2);
        var hour = up.substring(2, 4);
        var min = up.substring(4, 6);
        var timeText = formatUtcBeijingTime(day, hour, min);
        addResult(up, '观测时间', timeText);
        continue;
      }

      // 气象术语（优先于机场代码检查）
      if (AVIATION_TERMS[up]) {
        addResult(up, '气象术语', AVIATION_TERMS[up]);
        continue;
      }

      // 机场代码：仅在片段首个 token 上尝试识别，避免将 SHRA 等天气现象误判为机场
      if (i === 0 && /^[A-Z]{4}$/.test(up) && !AVIATION_TERMS[up]) {
        addResult(up, '机场代码', up);
        continue;
      }

      // 风 dddffGfmfmKT/MPS
      if (PATTERNS.wind.test(up)) {
        var m = PATTERNS.wind.exec(up);
        if (m) {
          var dir = m[1], speed = m[2], gust = m[3] || '', unit = m[4];
          var unitText = unit === 'MPS' ? '米/秒' : '节';
          var dirText = dir === 'VRB' ? '风向多变' : ('风向 ' + dir + '°');
          var windDesc = dirText + '，风速 ' + parseInt(speed, 10) + ' ' + unitText;
          if (gust) windDesc += '，阵风 ' + parseInt(gust.substring(1), 10) + ' ' + unitText;
          addResult(up, '地面风', windDesc);
        }
        continue;
      }

      // 风向变化 dddVddd
      if (PATTERNS.windVar && PATTERNS.windVar.test(up)) {
        var baseDir1 = up.substring(0, 3);
        var baseDir2 = up.substring(4, 7);
        addResult(up, '风向变化', '风向在 ' + baseDir1 + '° 至 ' + baseDir2 + '° 之间变化');
        continue;
      }

      // SLP 海平面气压
      if (PATTERNS.slp && PATTERNS.slp.test(up)) {
        var sm = PATTERNS.slp.exec(up);
        var part = sm && sm[1];
        if (part === 'NO') {
          addResult(up, '海平面气压', 'SLP 未提供');
        } else {
          var ppp = parseInt(part, 10);
          if (!isNaN(ppp)) {
            var slpHpa = (ppp <= 499 ? 1000.0 : 900.0) + ppp / 10.0;
            addResult(up, '海平面气压', slpHpa.toFixed(1) + ' hPa');
          } else {
            addResult(up, '海平面气压', up);
          }
        }
        continue;
      }

      // 能见度
      if (up === 'CAVOK') {
        addResult(up, '能见度', 'CAVOK：能见度≥10000米，1500米或者最高的最低扇区高度（两者取其大）以下无云，天空没有积雨云或浓积云，且无显著天气现象');
        continue;
      }
      if (PATTERNS.visibility.test(up)) {
        var visVal = parseInt(up, 10);
        var visDesc = visVal >= 9999 ? '≥10km' : visVal + 'm';
        addResult(up, '能见度', visDesc);
        continue;
      }
      if (PATTERNS.visibilitySm && PATTERNS.visibilitySm.test(up)) {
        var vm = PATTERNS.visibilitySm.exec(up);
        var prefix = vm[1] || '';
        var core = vm[2];
        var more = prefix === 'P';
        var less = prefix === 'M';
        var miles = 0;
        if (core.indexOf('/') !== -1) {
          var fracParts = core.split('/');
          var num = parseInt(fracParts[0], 10);
          var den = parseInt(fracParts[1], 10);
          if (!isNaN(num) && !isNaN(den) && den !== 0) {
            miles = num / den;
          }
        } else {
          var milesVal = parseFloat(core);
          if (!isNaN(milesVal)) miles = milesVal;
        }
        var visSmDesc = '';
        if (more) visSmDesc += '>';
        else if (less) visSmDesc += '<';
        visSmDesc += core + 'SM';
        if (miles > 0) {
          var km = miles * 1.60934;
          visSmDesc += '（约';
          if (more) visSmDesc += '>';
          else if (less) visSmDesc += '<';
          visSmDesc += km.toFixed(1) + 'km）';
        }
        addResult(up, '能见度', visSmDesc);
        continue;
      }

      // 温度/露点（修复M负值处理）
      if (PATTERNS.tempDew.test(up)) {
        var parts = up.split('/');
        var tempVal = parts[0].charAt(0) === 'M' ? '-' + parts[0].substring(1) : parts[0];
        var dewVal = parts[1].charAt(0) === 'M' ? '-' + parts[1].substring(1) : parts[1];
        addResult(up, '温度/露点', '温度 ' + tempVal + '°C，露点 ' + dewVal + '°C');
        continue;
      }

      if (PATTERNS.extremeTemp && PATTERNS.extremeTemp.test(up)) {
        var em = PATTERNS.extremeTemp.exec(up);
        if (em) {
          var kind = em[1];
          var tStr = em[2];
          var dayExt = em[3];
          var hourExt = em[4];
          var tVal = tStr.charAt(0) === 'M' ? '-' + tStr.substring(1) : tStr;
          var label = kind === 'TX' ? '最高温度' : '最低温度';
          // 极端温度时间只有日和小时，分钟统一视为00
          var timeStr = formatUtcBeijingTime(dayExt, hourExt, '00');
          var value = label + ' ' + tVal + '°C，于 ' + timeStr;
          addResult(up, label, value);
        }
        continue;
      }

      // QNH
      if (PATTERNS.qnh.test(up)) {
        var qnhVal = parseInt(up.substring(1), 10);
        addResult(up, 'QNH', qnhVal + ' hPa');
        continue;
      }

      // QFE 站高气压（俄罗斯等地区常见写法：QFE762/1016）
      if (PATTERNS.qfe && PATTERNS.qfe.test(up)) {
        var qfeMatch = PATTERNS.qfe.exec(up);
        if (qfeMatch) {
          var qfeMm = qfeMatch[1];
          var qfeHpa = qfeMatch[2];
          addResult(up, 'QFE', 'QFE ' + qfeMm + ' mmHg（约 ' + qfeHpa + ' hPa）');
        } else {
          addResult(up, 'QFE', up);
        }
        continue;
      }

      // 高度表设定（英寸汞柱）
      if (PATTERNS.altimeterInch && PATTERNS.altimeterInch.test(up)) {
        var aInt = parseInt(up.substring(1), 10);
        if (!isNaN(aInt)) {
          var inch = Math.floor(aInt / 100) + (aInt % 100) / 100;
          var hpa = Math.round(inch * 33.8639);
          addResult(up, '高度表设定', inch.toFixed(2) + ' 英寸汞柱（约 ' + hpa + ' hPa）');
        }
        continue;
      }

      // 云况
      if (PATTERNS.cloud.test(up)) {
        var cm = PATTERNS.cloud.exec(up);
        if (cm) {
          var cloudText = CLOUD_AMOUNT_CODES[cm[1]] || cm[1];
          if (cm[2] && cm[2] !== '///') {
            var cloudH = parseInt(cm[2], 10);
            if (!isNaN(cloudH)) cloudText += '，云底 ' + (cloudH * 100) + 'ft';
          }
          if (cm[3]) cloudText += cm[3] === 'CB' ? '（积雨云）' : '（浓积云）';
          addResult(up, '云况', cloudText);
        }
        continue;
      }

      // 天气现象
      if (PATTERNS.weather.test(up)) {
        var wxRes = parseWeatherPhenomena([up]);
        if (wxRes.length) {
          addResult(up, '天气现象', wxRes.join('；'));
        }
        continue;
      }

      // 跑道状况（RODEX 格式）或 RVR
      if (up.charAt(0) === 'R') {
        var rodexText = decodeRodexGroupToken(up);
        if (rodexText) {
          addResult(up, '跑道状况', rodexText);
          continue;
        }
      }

      // RVR
      if (PATTERNS.rvr.test(up)) {
        addResult(up, 'RVR', up);
        continue;
      }

      // 特殊关键词
      if (up === 'NOSIG') { addResult(up, '趋势预报', '无显著变化'); continue; }
      if (up === 'NSW') { addResult(up, '天气终止', '无显著天气'); continue; }
      if (up === 'AUTO') { addResult(up, '自动观测', '自动气象站数据'); continue; }
      if (up === 'COR') { addResult(up, '更正', '更正报文'); continue; }
      if (up === 'NIL') { addResult(up, '缺失', '报文缺失'); continue; }
    }

    // 构建返回结果
    if (!recognized.length) return null;

    return {
      type: 'METAR_FRAGMENT',
      typeLabel: 'METAR/SPECI 报文片段',
      analysis: buildAnalysis('识别出 ' + recognized.length + ' 个报文元素', [
        { id: 'elements', icon: '📊', title: '解析结果', items: items }
      ]),
      errorMessage: ''
    };
  },

  // 解析单个token
  decodeSingleToken: function(up) {
    // 时间戳
    if (PATTERNS.time.test(up)) {
      var day = up.substring(0, 2);
      var hour = up.substring(2, 4);
      var min = up.substring(4, 6);
      var timeText = formatUtcBeijingTime(day, hour, min);
      return { type: '观测时间', icon: '🕐', label: '时间', value: timeText };
    }

    // 气象术语
    if (AVIATION_TERMS[up]) {
      return { type: '气象术语', icon: '📖', label: up, value: AVIATION_TERMS[up] };
    }

    // 机场代码
    if (/^[A-Z]{4}$/.test(up) && !AVIATION_TERMS[up]) {
      return { type: '机场代码', icon: '✈️', label: '机场', value: up };
    }

    // 风
    if (PATTERNS.wind.test(up)) {
      var m = PATTERNS.wind.exec(up);
      if (m) {
        var dir = m[1], speed = m[2], gust = m[3] || '', unit = m[4];
        var unitText = unit === 'MPS' ? '米/秒' : '节';
        var dirText = dir === 'VRB' ? '风向多变' : ('风向 ' + dir + '°');
        var windDesc = dirText + '，风速 ' + parseInt(speed, 10) + ' ' + unitText;
        if (gust) windDesc += '，阵风 ' + parseInt(gust.substring(1), 10) + ' ' + unitText;
        return { type: '地面风', icon: '🌬️', label: '风况', value: windDesc };
      }
    }

    // CAVOK
    if (up === 'CAVOK') {
      return { type: '能见度与云况', icon: '☀️', label: 'CAVOK', value: '能见度≥10000米，1500米或者最高的最低扇区高度（两者取其大）以下无云，天空没有积雨云或浓积云，且无显著天气现象' };
    }

    // 能见度
    if (PATTERNS.visibility.test(up)) {
      var visVal = parseInt(up, 10);
      var visDesc = visVal >= 9999 ? '>=10km' : visVal + 'm';
      return { type: '主导能见度', icon: '👁️', label: '能见度', value: visDesc };
    }
    if (PATTERNS.visibilitySm && PATTERNS.visibilitySm.test(up)) {
      var vm = PATTERNS.visibilitySm.exec(up);
      var prefix = vm[1] || '';
      var core = vm[2];
      var more = prefix === 'P';
      var less = prefix === 'M';
      var miles = 0;
      if (core.indexOf('/') !== -1) {
        var fracParts = core.split('/');
        var num = parseInt(fracParts[0], 10);
        var den = parseInt(fracParts[1], 10);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          miles = num / den;
        }
      } else {
        var milesVal = parseFloat(core);
        if (!isNaN(milesVal)) miles = milesVal;
      }
      var visSmDesc = '';
      if (more) visSmDesc += '>';
      else if (less) visSmDesc += '<';
      visSmDesc += core + 'SM';
      if (miles > 0) {
        var km = miles * 1.60934;
        visSmDesc += '（约';
        if (more) visSmDesc += '>';
        else if (less) visSmDesc += '<';
        visSmDesc += km.toFixed(1) + 'km）';
      }
      return { type: '主导能见度', icon: '👁️', label: '能见度', value: visSmDesc };
    }

    // 温度/露点
    if (PATTERNS.tempDew.test(up)) {
      var parts = up.split('/');
      var tempVal = parts[0].charAt(0) === 'M' ? '-' + parts[0].substring(1) : parts[0];
      var dewVal = parts[1].charAt(0) === 'M' ? '-' + parts[1].substring(1) : parts[1];
      return { type: '温度/露点', icon: '🌡️', label: '温度与露点', value: '气温 ' + tempVal + '°C，露点温度 ' + dewVal + '°C' };
    }

    // 极端温度
    if (PATTERNS.extremeTemp && PATTERNS.extremeTemp.test(up)) {
      var em2 = PATTERNS.extremeTemp.exec(up);
      if (em2) {
        var kind2 = em2[1];
        var tStr2 = em2[2];
        var dayExt2 = em2[3];
        var hourExt2 = em2[4];
        var tVal2 = tStr2.charAt(0) === 'M' ? '-' + tStr2.substring(1) : tStr2;
        var label2 = kind2 === 'TX' ? '最高温度' : '最低温度';
        var timeStr2 = formatUtcBeijingTime(dayExt2, hourExt2, '00');
        var value2 = label2 + ' ' + tVal2 + '°C，于 ' + timeStr2;
        return { type: '极端温度', icon: '🌡️', label: label2, value: value2 };
      }
    }

    // QNH
    if (PATTERNS.qnh.test(up)) {
      var qnhVal = parseInt(up.substring(1), 10);
      return { type: '气压', icon: '🔴', label: 'QNH', value: qnhVal + ' hPa' };
    }

    // QFE 站高气压
    if (PATTERNS.qfe && PATTERNS.qfe.test(up)) {
      var qfeMatch2 = PATTERNS.qfe.exec(up);
      if (qfeMatch2) {
        var qfeMm2 = qfeMatch2[1];
        var qfeHpa2 = qfeMatch2[2];
        return { type: '气压', icon: '🔴', label: 'QFE', value: 'QFE ' + qfeMm2 + ' mmHg（约 ' + qfeHpa2 + ' hPa）' };
      }
      return { type: '气压', icon: '🔴', label: 'QFE', value: up };
    }

    // 高度表设定（英寸汞柱）
    if (PATTERNS.altimeterInch && PATTERNS.altimeterInch.test(up)) {
      var aInt = parseInt(up.substring(1), 10);
      if (!isNaN(aInt)) {
        var inch = Math.floor(aInt / 100) + (aInt % 100) / 100;
        var hpa = Math.round(inch * 33.8639);
        return { type: '高度表设定', icon: '🔴', label: '高度表', value: inch.toFixed(2) + ' 英寸汞柱（约 ' + hpa + ' hPa）' };
      }
    }

    // SLP 海平面气压
    if (PATTERNS.slp && PATTERNS.slp.test(up)) {
      var sm = PATTERNS.slp.exec(up);
      var part = sm && sm[1];
      if (part === 'NO') {
        return { type: '海平面气压', icon: '🔴', label: 'SLP', value: '未提供' };
      } else {
        var ppp = parseInt(part, 10);
        if (!isNaN(ppp)) {
          var slpHpa = (ppp <= 499 ? 1000.0 : 900.0) + ppp / 10.0;
          return { type: '海平面气压', icon: '🔴', label: 'SLP', value: slpHpa.toFixed(1) + ' hPa' };
        }
      }
      return { type: '海平面气压', icon: '🔴', label: 'SLP', value: up };
    }

    // 云况
    if (PATTERNS.cloud.test(up)) {
      var cm = PATTERNS.cloud.exec(up);
      if (cm) {
        var cloudText = CLOUD_AMOUNT_CODES[cm[1]] || cm[1];
        if (cm[2] && cm[2] !== '///') {
          var h = parseInt(cm[2], 10);
          if (!isNaN(h)) cloudText += '，云底高度 ' + (h * 100) + 'ft（约' + Math.round(h * 30.48) + 'm）';
        }
        if (cm[3]) cloudText += cm[3] === 'CB' ? '（积雨云）' : '（浓积云）';
        return { type: '云况', icon: '☁️', label: '云层', value: cloudText };
      }
    }

    // 天气现象
    if (PATTERNS.weather.test(up)) {
      var wxResults = parseWeatherPhenomena([up]);
      if (wxResults.length) {
        return { type: '天气现象', icon: '🌦️', label: '天气', value: wxResults.join('；') };
      }
    }

    // RVR 或 RODEX 跑道状况
    if (PATTERNS.rvr.test(up)) {
      var rodexText2 = decodeRodexGroupToken(up);
      if (rodexText2) {
        return { type: '跑道状况', icon: '🛬', label: '跑道状况', value: rodexText2 };
      }

      var rvrMatch = /^R(\d{2}[LCR]?)\/([PM]?\d{4})([UDN])?$/.exec(up);
      if (rvrMatch) {
        var runway = rvrMatch[1];
        var rvrValue = rvrMatch[2];
        var trend = rvrMatch[3];
        var desc = '跑道' + runway + '视程 ';
        if (rvrValue.charAt(0) === 'P') {
          desc += '>' + rvrValue.substring(1) + 'm';
        } else if (rvrValue.charAt(0) === 'M') {
          desc += '<' + rvrValue.substring(1) + 'm';
        } else {
          desc += rvrValue + 'm';
        }
        if (trend) desc += ' (' + (trend === 'U' ? '上升' : trend === 'D' ? '下降' : '无变化') + ')';
        return { type: '跑道视程', icon: '🛬', label: 'RVR', value: desc };
      }
      return { type: '跑道视程', icon: '🛬', label: 'RVR', value: up };
    }

    // 有效期
    if (PATTERNS.valid.test(up)) {
      var periodText = formatValidPeriodText(up);
      return { type: '有效期', icon: '📅', label: '预报有效期', value: periodText };
    }

    // 特殊关键词
    if (up === 'NOSIG') { return { type: '趋势预报', icon: '➡️', label: 'NOSIG', value: '无显著变化（2小时内预计无显著天气变化）' }; }
    if (up === 'NSW') { return { type: '天气终止', icon: '🌤️', label: 'NSW', value: '无显著天气（之前的天气现象已结束）' }; }
    if (up === 'AUTO') { return { type: '自动观测', icon: '🤖', label: 'AUTO', value: '该报文由自动气象观测系统生成' }; }
    if (up === 'COR') { return { type: '更正报文', icon: '✏️', label: 'COR', value: '更正报文，替代之前发布的报文' }; }
    if (up === 'NIL') { return { type: '报文缺失', icon: '❌', label: 'NIL', value: '报文缺失或取消' }; }
    if (up === 'METAR') { return { type: '报文类型', icon: '📋', label: 'METAR', value: '机场例行天气报告（每小时或半小时发布）' }; }
    if (up === 'SPECI') { return { type: '报文类型', icon: '⚡', label: 'SPECI', value: '机场特别天气报告（天气显著变化时发布）' }; }

    return null;
  },

  // ==================== METAR/SPECI 解析 ====================
  decodeMetarLike: function(text, kind) {
    var line = text.split('\n')[0];
    var normalized = line.replace(/\s+/g, ' ').trim().replace(/=$/, '');
    var tokens = normalized.split(' ');

    var idx = 0;
    var typeToken = (tokens[idx] || '').toUpperCase();
    var type = typeToken;
    var typeLabel = '机场天气实况';

    if (kind === 'MET_REPORT') {
      type = 'MET REPORT'; typeLabel = 'MET REPORT(机场当地天气报告)'; idx = 2;
    } else if (kind === 'METAR_NO_HEADER') {
      type = 'METAR*'; typeLabel = 'METAR*(自动识别的 METAR 报文)';
    } else if (typeToken === 'METAR' || typeToken === 'SPECI') {
      type = typeToken;
      typeLabel = typeToken === 'METAR' ? 'METAR(机场例行天气报告)' : 'SPECI(机场特别天气报告)';
      idx = 1;
      if ((tokens[idx] || '').toUpperCase() === 'COR') idx++;
    }

    var station = tokens[idx] || ''; idx++;
    var stationDisplay = getAirportDisplayName(station);
    var timeToken = tokens[idx] || '';
    var timeText = '';
    if (PATTERNS.time.test(timeToken)) {
      var dayObs = timeToken.substring(0, 2);
      var hourObs = timeToken.substring(2, 4);
      var minObs = timeToken.substring(4, 6);
      timeText = formatUtcBeijingTime(dayObs, hourObs, minObs);
      idx++;
    }

    var wind = '', windVar = '', visibility = '', rvrList = [], runwayStates = [], weather = [], clouds = [], tempDew = '', qnh = '', qfe = '', altimeterInch = '', slp = '', trendNosig = '';

    for (var i = idx; i < tokens.length; i++) {
      var t = tokens[i], upper = t.toUpperCase();
      if (!wind && PATTERNS.wind.test(upper)) { wind = t; continue; }
      if (!windVar && PATTERNS.windVar && PATTERNS.windVar.test(upper)) { windVar = t; continue; }
      if (!visibility && (upper === 'CAVOK' || PATTERNS.visibility.test(upper) || (PATTERNS.visibilitySm && PATTERNS.visibilitySm.test(upper)))) {
        visibility = t;
        if (upper === 'CAVOK') clouds.push('CAVOK');
        continue;
      }

      // 跑道状况（RODEX），优先于 RVR 解析
      if (upper.charAt(0) === 'R') {
        var rodexTextMain = decodeRodexGroupToken(upper);
        if (rodexTextMain) {
          runwayStates.push(rodexTextMain);
          continue;
        }
      }

      if (PATTERNS.rvr.test(upper)) { rvrList.push(t); continue; }
      if (!tempDew && PATTERNS.tempDew.test(upper)) { tempDew = t; continue; }
      if (!qnh && PATTERNS.qnh.test(upper)) { qnh = t; continue; }
      if (!qfe && PATTERNS.qfe && PATTERNS.qfe.test(upper)) { qfe = t; continue; }
      if (!altimeterInch && PATTERNS.altimeterInch && PATTERNS.altimeterInch.test(upper)) { altimeterInch = t; continue; }
      if (!slp && PATTERNS.slp && PATTERNS.slp.test(upper)) { slp = t; continue; }
      if (PATTERNS.weather.test(upper)) { weather.push(upper); continue; }
      if (PATTERNS.cloud.test(upper)) { clouds.push(upper); continue; }
      if (upper === 'NOSIG') { trendNosig = '无显著变化（2小时内预计无显著天气变化）'; continue; }
    }

    var weatherTexts = parseWeatherPhenomena(weather);
    var cloudTexts = parseCloudInfo(clouds);

    // 将地面风、能见度、RVR 转换为带中文说明的文本
    var windText = wind ? formatWindText(wind) : '未报告';
    if (windVar && PATTERNS.windVar && PATTERNS.windVar.test(windVar.toUpperCase())) {
      var vDir1 = windVar.substring(0, 3);
      var vDir2 = windVar.substring(4, 7);
      windText += '，风向在 ' + vDir1 + '° 至 ' + vDir2 + '° 之间变化';
    }
    var visText = visibility ? formatVisibilityText(visibility) : '未报告';
    var rvrDisplay = '未报告';
    if (rvrList.length) {
      var rvrTexts = [];
      for (var r = 0; r < rvrList.length; r++) {
        rvrTexts.push(formatRvrText(rvrList[r]));
      }
      rvrDisplay = rvrTexts.join('；');
    }

    // 地面状况：只展示报文中实际出现的要素
    var surfaceItems = [
      { label: '风', value: windText },
      { label: '能见度', value: visText }
    ];

    if (rvrList.length) {
      surfaceItems.push({ label: 'RVR', value: rvrDisplay });
    }

    if (runwayStates.length) {
      for (var rs = 0; rs < runwayStates.length; rs++) {
        surfaceItems.push({ label: '跑道状况', value: runwayStates[rs] });
      }
    }

    var sections = [
      { id: 'basic', icon: '📍', title: '基本信息', items: [
        { label: '报文类型', value: typeLabel },
        { label: '机场', value: stationDisplay || '-' },
        { label: '观测时间', value: timeText || '-' }
      ]},
      { id: 'surface', icon: '🌬️', title: '地面状况', items: surfaceItems },
      { id: 'weather', icon: '🌦️', title: '天气现象与云', items: [
        { label: '天气', value: weatherTexts.length ? weatherTexts.join('；') : '无显著天气' },
        { label: '云况', value: cloudTexts.length ? cloudTexts.join('；') : '无显著云' }
      ]}
    ];

    if (tempDew || qnh || altimeterInch || slp) {
      // 解析温度/露点
      var tempDewText = '-';
      if (tempDew && PATTERNS.tempDew.test(tempDew.toUpperCase())) {
        var tdParts = tempDew.split('/');
        var tempVal = tdParts[0].charAt(0) === 'M' ? '-' + tdParts[0].substring(1) : tdParts[0];
        var dewVal = tdParts[1].charAt(0) === 'M' ? '-' + tdParts[1].substring(1) : tdParts[1];
        var tempInt = parseInt(tempVal, 10);
        var dewInt = parseInt(dewVal, 10);
        if (!isNaN(tempInt) && !isNaN(dewInt)) {
          tempDewText = '温度 ' + tempInt + '°C，露点 ' + dewInt + '°C';
        } else {
          tempDewText = tempDew;  // 解析失败时保留原始值
        }
      }

      // 解析QNH（欧洲格式 Q1018）
      var qnhText = '-';
      if (qnh && PATTERNS.qnh.test(qnh.toUpperCase())) {
        var qnhVal = parseInt(qnh.substring(1), 10);
        qnhText = qnh + '（' + qnhVal + ' hPa）';
      }

      // 解析QFE（如 QFE762/1016）
      var qfeText = '-';
      if (qfe && PATTERNS.qfe && PATTERNS.qfe.test(String(qfe).toUpperCase())) {
        var qm = PATTERNS.qfe.exec(String(qfe).toUpperCase());
        if (qm) {
          var mm = qm[1];
          var hpaQfe = qm[2];
          qfeText = String(qfe) + '（' + mm + ' mmHg，约 ' + hpaQfe + ' hPa）';
        } else {
          qfeText = String(qfe);
        }
      }

      var tempItems = [
        { label: '温度/露点', value: tempDewText }
      ];

      // 解析高度表设定（美国格式 A3007）
      var altimeterText = '-';
      if (altimeterInch) {
        var aInt2 = parseInt(String(altimeterInch).substring(1), 10);
        if (!isNaN(aInt2)) {
          var inch2 = Math.floor(aInt2 / 100) + (aInt2 % 100) / 100;
          var hpa2 = Math.round(inch2 * 33.8639);
          altimeterText = String(altimeterInch) + '（' + inch2.toFixed(2) + ' 英寸汞柱，约 ' + hpa2 + ' hPa）';
        } else {
          altimeterText = String(altimeterInch);
        }
      }

      // 气压基准：合并 QNH / 高度表设定
      var pressureBaselineText = '-';
      if (qnhText !== '-' && altimeterText !== '-') {
        pressureBaselineText = qnhText + '；' + altimeterText;
      } else if (qnhText !== '-') {
        pressureBaselineText = qnhText;
      } else if (altimeterText !== '-') {
        pressureBaselineText = altimeterText;
      }

      if (pressureBaselineText !== '-') {
        tempItems.push({ label: '气压基准', value: pressureBaselineText });
      }

      // 有 QFE 时一起展示
      if (qfeText !== '-') {
        tempItems.push({ label: 'QFE', value: qfeText });
      }

      if (slp) {
        var sm2 = PATTERNS.slp.exec(String(slp).toUpperCase());
        var part2 = sm2 && sm2[1];
        var slpText = slp;
        if (part2 && part2 !== 'NO') {
          var p2 = parseInt(part2, 10);
          if (!isNaN(p2)) {
            var slpHpa2 = (p2 <= 499 ? 1000.0 : 900.0) + p2 / 10.0;
            slpText = 'SLP ' + part2 + '（' + slpHpa2.toFixed(1) + ' hPa）';
          }
        } else if (part2 === 'NO') {
          slpText = '未提供（SLP NO）';
        }
        tempItems.push({ label: '海平面气压', value: slpText });
      }
      sections.push({ id: 'temp', icon: '🌡️', title: '温度与气压', items: tempItems });
    }

    if (trendNosig) {
      sections.push({ id: 'trend', icon: '➡️', title: '趋势预报', items: [
        { label: '短时趋势', value: trendNosig }
      ]});
    }

    var summary = (stationDisplay ? stationDisplay + ' 机场' : '') +
      (timeText ? '，' + timeText : '') +
      (weatherTexts.length ? '，' + weatherTexts.join('、') : '');

    return { type: type, typeLabel: typeLabel, analysis: buildAnalysis(summary, sections), errorMessage: '' };
  },

  // ==================== TAF 解析 ====================
  decodeTaf: function(text, kind) {
    var full = (text || '').replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\s+/g, ' ').trim().replace(/=$/, '');
    if (!full) {
      return { type: '', typeLabel: '', analysis: null, errorMessage: '报文内容为空' };
    }

    var tokens = full.split(' ');
    var idx = 0;
    var type = 'TAF';
    var typeLabel = '机场预报（TAF）';

    if (kind === 'TAF_NO_HEADER') {
      type = 'TAF*';
      typeLabel = '自动识别的机场预报（TAF）';
    } else {
      var first = (tokens[idx] || '').toUpperCase();
      if (first === 'TAF') {
        idx++;
        var modifier = (tokens[idx] || '').toUpperCase();
        if (modifier === 'AMD' || modifier === 'COR') {
          type += ' ' + modifier;
          typeLabel += '（' + modifier + '）';
          idx++;
        }
      }
    }

    var station = tokens[idx] || '';
    idx++;

    var issueTime = tokens[idx] || '';
    var issueText = '';
    if (PATTERNS.time.test(issueTime)) {
      var dayIssue = issueTime.substring(0, 2);
      var hourIssue = issueTime.substring(2, 4);
      var minIssue = issueTime.substring(4, 6);
      issueText = formatUtcBeijingTime(dayIssue, hourIssue, minIssue);
      idx++;
    }

    var validToken = tokens[idx] || '';
    var validText = '';
    var restStart = idx;

    if (PATTERNS.valid.test(validToken)) {
      validText = formatValidPeriodText(validToken);
      restStart = idx + 1;
    }

    var restTokens = tokens.slice(restStart);

    function isProbToken(t) { return /^PROB(30|40)$/.test(t); }
    function isFmToken(t) { return t.length === 8 && t.indexOf('FM') === 0 && /^\d{6}$/.test(t.substring(2)); }

    var segments = [];
    var current = { kind: 'INITIAL', code: 'INITIAL', timeInfo: '', tokens: [] };

    function pushCurrent() {
      if (current && current.tokens && current.tokens.length) {
        segments.push(current);
      }
    }

    for (var i = 0; i < restTokens.length; i++) {
      var tkRaw = restTokens[i] || '';
      var tk = tkRaw.toUpperCase();

      if (tk === 'BECMG' || tk === 'TEMPO' || isProbToken(tk) || isFmToken(tk)) {
        pushCurrent();
        current = { kind: tk, code: tk, timeInfo: '', tokens: [] };

        if (isProbToken(tk)) {
          var prob = tk.substring(4);
          current.kind = 'PROB';
          if ((restTokens[i + 1] || '').toUpperCase() === 'TEMPO') {
            current.code = tk + ' TEMPO';
            i++;
          }
        } else if (isFmToken(tk)) {
          current.kind = 'FM';
          current.code = tk;
        }

        var next = restTokens[i + 1] || '';
        if (PATTERNS.valid.test(next)) {
          current.timeInfo = formatValidPeriodText(next);
          i++;
        }
        continue;
      }

      current.tokens.push(restTokens[i]);
    }
    pushCurrent();

    var sections = [
      { id: 'basic', icon: '📍', title: '基本信息', items: [
        { label: '报文类型', value: typeLabel },
        { label: '机场', value: station || '-' },
        { label: '发布时间', value: issueText || '-' },
        { label: '有效期', value: validText || '-' }
      ]}
    ];

    for (var si = 0; si < segments.length; si++) {
      var seg = segments[si];
      var segText = seg.tokens.join(' ');
      var frag = segText ? this.decodeMetarFragment(segText) : null;
      var items = [];

      if (seg.timeInfo) {
        items.push({ label: '适用时间', value: seg.timeInfo });
      }

      if (frag && frag.analysis && frag.analysis.sections && frag.analysis.sections.length) {
        var firstSection = frag.analysis.sections[0];
        if (firstSection && firstSection.items && firstSection.items.length) {
          items = items.concat(firstSection.items);
        }
      } else if (segText) {
        items.push({ label: '说明', value: segText });
      }

      sections.push({
        id: 'segment_' + (si + 1),
        icon: '🌦️',
        title: buildTafSegmentTitle(seg, si),
        items: items
      });
    }

    var summary = (station ? station + ' 机场' : '') + ' 机场预报（TAF），有效期：' + (validText || '未解析');
    if (segments.length > 1) {
      summary += '，共 ' + segments.length + ' 个预报阶段';
    }

    return {
      type: 'TAF',
      typeLabel: typeLabel,
      analysis: buildAnalysis(summary, sections),
      errorMessage: ''
    };
  },

  // ==================== Advisory 解析 ====================
  decodeStructuredAdvisory: function(text, advisoryType) {
    var typeLabels = {
      'VA_ADVISORY': '火山灰咨询报（VA ADVISORY）',
      'TC_ADVISORY': '热带气旋咨询报（TC ADVISORY）',
      'SWX_ADVISORY': '空间天气咨询报（SWX ADVISORY）'
    };
    var typeLabel = typeLabels[advisoryType] || '天气咨询报文';
    var config = weatherAdvisoryConfig && weatherAdvisoryConfig[advisoryType];

    if (!config || !config.fields || !config.fields.length) {
      var lines = text.replace(/\r\n/g, '\n').split('\n');
      var items = [];
      for (var i = 0; i < lines.length; i++) {
        var ln = lines[i].trim();
        if (!ln || /ADVISORY$/i.test(ln)) continue;
        var cIdx = ln.indexOf(':');
        if (cIdx > 0) {
          items.push({ label: ln.substring(0, cIdx).trim(), value: ln.substring(cIdx + 1).trim() });
        }
      }
      return {
        type: advisoryType, typeLabel: typeLabel,
        analysis: buildAnalysis(typeLabel + '，共 ' + items.length + ' 个字段', [
          { id: 'fields', icon: '📡', title: '报文字段', items: items.length ? items : [{ label: '提示', value: '未能解析字段' }] }
        ]),
        errorMessage: ''
      };
    }

    var fields = config.fields;
    var codeMap = {};
    for (var fi = 0; fi < fields.length; fi++) codeMap[fields[fi].code.toUpperCase()] = fields[fi];

    var itemsByGroup = {}, totalCount = 0;
    function pushItem(groupKey, label, value) {
      var g = groupKey || 'other';
      if (!itemsByGroup[g]) itemsByGroup[g] = [];
      itemsByGroup[g].push({ label: label, value: value });
      totalCount++;
    }

    var lines2 = text.replace(/\r\n/g, '\n').split('\n');
    for (var li = 0; li < lines2.length; li++) {
      var line2 = lines2[li].trim();
      if (!line2) continue;
      var idxColon = line2.indexOf(':');
      if (idxColon <= 0) continue;
      var heading = line2.substring(0, idxColon).trim().toUpperCase();
      var field = codeMap[heading];
      if (!field) continue;
      pushItem(field.group || 'other', field.labelZh || field.code, line2.substring(idxColon + 1).trim());
    }

    var sections2 = [];
    var groupOrder = ['header', 'volcano_info', 'meta', 'observation', 'forecast', 'body', 'footer', 'other'];
    var groupTitles2 = {
      header: '报头信息', volcano_info: '火山信息', meta: '元数据',
      observation: '观测信息', forecast: '预报信息', body: '主体信息',
      footer: '附加信息', other: '其他'
    };
    for (var gi2 = 0; gi2 < groupOrder.length; gi2++) {
      var gKey2 = groupOrder[gi2], arr2 = itemsByGroup[gKey2];
      if (!arr2 || !arr2.length) continue;
      sections2.push({ id: gKey2, icon: gKey2 === 'header' ? '📍' : '📄', title: groupTitles2[gKey2] || gKey2, items: arr2 });
    }

    return {
      type: advisoryType, typeLabel: typeLabel,
      analysis: buildAnalysis(typeLabel + '，解析出 ' + totalCount + ' 个字段', sections2),
      errorMessage: ''
    };
  },

  // ==================== SIGMET/AIRMET 解析 ====================
  decodeSigmet: function(text, sigType) {
    var typeLabel = sigType === 'SIGMET' ? '重要气象情报（SIGMET）' : '低空气象情报（AIRMET）';
    var normalized = (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    if (!normalized) {
      return {
        type: sigType,
        typeLabel: typeLabel,
        analysis: null,
        errorMessage: '报文内容为空'
      };
    }

    var lines = normalized.split('\n');
    var headerLine = '';
    for (var i = 0; i < lines.length; i++) {
      var ln = (lines[i] || '').trim();
      if (ln) { headerLine = ln; break; }
    }

    var headerUpper = headerLine.toUpperCase().replace(/\s+/g, ' ');
    var tokens = headerUpper.split(' ');

    var seq = '', valid = '', firText = '', phenomenonTokens = [], obsFc = '';
    var areaText = '', levelText = '', movementText = '', trendText = '';

    var idx = 0;
    if (tokens[idx] === 'SIGMET' || tokens[idx] === 'AIRMET') {
      idx++;
    }

    if (tokens[idx] && tokens[idx] !== 'VALID') {
      seq = tokens[idx];
      idx++;
    }

    if (tokens[idx] === 'VALID') {
      if (tokens[idx + 1]) {
        valid = tokens[idx + 1];
        idx += 2;
      } else {
        idx++;
      }
    }

    var idxFir = -1;
    for (var fi = idx; fi < tokens.length; fi++) {
      if (tokens[fi] === 'FIR' || tokens[fi] === 'UIR' || tokens[fi] === 'FIR/UIR') {
        idxFir = fi;
        break;
      }
    }
    if (idxFir !== -1) {
      var firTokens = tokens.slice(idx, idxFir);
      if (firTokens.length === 1) {
        firText = firTokens[0].replace('-', '') + ' FIR';
      } else if (firTokens.length >= 2) {
        var f1 = firTokens[0].replace('-', '');
        var f2 = firTokens[1].replace('-', '');
        var namePart = firTokens.length > 2 ? firTokens.slice(2).join(' ') : '';
        firText = (namePart ? namePart + ' ' : '') + f1 + (f2 && f2 !== f1 ? '-' + f2 : '') + ' FIR';
      }
      idx = idxFir + 1;
    }

    var idxObs = -1;
    for (var oi = idx; oi < tokens.length; oi++) {
      if (tokens[oi] === 'OBS' || tokens[oi] === 'FCST') {
        idxObs = oi;
        obsFc = tokens[oi];
        break;
      }
    }
    var phenEnd = idxObs !== -1 ? idxObs : tokens.length;
    if (phenEnd > idx) {
      phenomenonTokens = tokens.slice(idx, phenEnd);
    }
    idx = idxObs !== -1 ? idxObs + 1 : phenEnd;

    function findIndex(start, keys) {
      for (var ix = start; ix < tokens.length; ix++) {
        for (var ki = 0; ki < keys.length; ki++) {
          if (tokens[ix] === keys[ki]) return ix;
        }
      }
      return -1;
    }

    var idxWI = -1;
    for (var wi = idx; wi < tokens.length; wi++) {
      if (tokens[wi] === 'WI' || tokens[wi] === 'WITHIN') {
        idxWI = wi;
        break;
      }
    }
    var idxTopOrSfc = findIndex(idx, ['TOP', 'SFC']);
    var idxMov = findIndex(idx, ['MOV']);
    var idxTrend = findIndex(idx, ['INTSF', 'WKN', 'NC']);

    if (idxWI !== -1) {
      var areaEnd = tokens.length;
      if (idxTopOrSfc !== -1 && idxTopOrSfc > idxWI) areaEnd = Math.min(areaEnd, idxTopOrSfc);
      if (idxMov !== -1 && idxMov > idxWI) areaEnd = Math.min(areaEnd, idxMov);
      areaText = tokens.slice(idxWI, areaEnd).join(' ');
    }

    if (idxTopOrSfc !== -1) {
      var levelEnd = tokens.length;
      if (idxMov !== -1 && idxMov > idxTopOrSfc) levelEnd = Math.min(levelEnd, idxMov);
      levelText = tokens.slice(idxTopOrSfc, levelEnd).join(' ');
    }

    if (idxMov !== -1) {
      var movEnd = idxTrend !== -1 && idxTrend > idxMov ? idxTrend : tokens.length;
      movementText = tokens.slice(idxMov, movEnd).join(' ');
    }

    if (idxTrend !== -1) {
      trendText = tokens[idxTrend];
    }

    function translateToken(tok) {
      var up = tok.toUpperCase();
      if (AVIATION_TERMS[up]) return AVIATION_TERMS[up] + '（' + up + '）';
      if (WEATHER_CODES[up]) return WEATHER_CODES[up] + '（' + up + '）';
      return tok;
    }

    var phenomenonText = '';
    if (phenomenonTokens.length) {
      var translated = [];
      for (var pt = 0; pt < phenomenonTokens.length; pt++) {
        translated.push(translateToken(phenomenonTokens[pt]));
      }
      phenomenonText = translated.join('，');
    }

    var obsFcText = '';
    if (obsFc === 'OBS') obsFcText = '实况观测（OBS）';
    else if (obsFc === 'FCST') obsFcText = '预报情况（FCST）';

    var trendZh = '';
    if (trendText === 'INTSF') trendZh = '预计增强（INTSF）';
    else if (trendText === 'WKN') trendZh = '预计减弱（WKN）';
    else if (trendText === 'NC') trendZh = '强度基本不变（NC）';

    var otherLines = lines.length > 1 ? lines.slice(1).join('\n') : '';

    var sections = [
      { id: 'basic', icon: '📍', title: '报头信息', items: [
        { label: '报文类型', value: typeLabel },
        { label: '序号', value: seq || '-' },
        { label: '有效期', value: valid || '-' },
        { label: '适用区域（FIR）', value: firText || '-' }
      ]},
      { id: 'phenomenon', icon: '🌩️', title: '天气现象', items: [
        { label: '现象描述', value: phenomenonText || '未能识别具体现象' },
        { label: '观测/预报', value: obsFcText || '-' }
      ]},
      { id: 'space', icon: '🗺️', title: '影响范围与高度', items: [
        { label: '水平范围', value: areaText || '未解析 WI/LINE 区域描述' },
        { label: '垂直范围/云顶', value: levelText || '-' }
      ]},
      { id: 'movement', icon: '➡️', title: '移动与趋势', items: [
        { label: '移动情况', value: movementText || '-' },
        { label: '强度变化', value: trendZh || (trendText || '-') }
      ]}
    ];

    if (otherLines) {
      sections.push({
        id: 'extra', icon: '📄', title: '补充内容', items: [
          { label: '其他行', value: otherLines }
        ]
      });
    }

    sections.push({
      id: 'raw', icon: '⚠️', title: '原始报文', items: [
        { label: '原文', value: text }
      ]
    });

    var summaryParts = [];
    if (firText) summaryParts.push(firText);
    summaryParts.push(typeLabel);
    if (phenomenonText) summaryParts.push(phenomenonText);
    if (levelText) summaryParts.push(levelText);
    if (movementText) summaryParts.push(movementText);
    var summary = summaryParts.join('，');

    return {
      type: sigType,
      typeLabel: typeLabel,
      analysis: buildAnalysis(summary, sections),
      errorMessage: ''
    };
  }
};

Page(BasePage.createPage(pageConfig));
