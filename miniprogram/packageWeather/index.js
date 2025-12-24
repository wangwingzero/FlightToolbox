var BasePage = require('../utils/base-page.js');
var AppConfig = require('../utils/app-config.js');
var weatherAdvisoryConfig = require('../data/weather-advisory.js');
var rodexData = require('./rodex.js');
var snowtamConfig = require('./snowtam.js');
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
  metarTimeOnly: /^\s*\d{6}Z\s+/,  // 只有时间码开头的METAR片段
  // 中国民航报文类型前缀
  sa: /^\s*SA\s+\d{6}Z\b/,         // SA = 例行天气报告（中国民航 METAR）
  fc: /^\s*FC\s+\d{6}Z\s+\d{4}\/\d{4}\b/,  // FC = 短期机场预报（9小时）
  ft: /^\s*FT\s+\d{6}Z\s+\d{4}\/\d{4}\b/,  // FT = 机场预报（24小时 TAF）
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
var SNOWTAM_LETTER_FIELD_MAP = {
  A: 'location_indicator',
  B: 'date_time',
  C: 'runway',
  D: 'runway_condition_code',
  E: 'contamination_coverage',
  F: 'loose_contamination_depth',
  G: 'surface_condition_description',
  H: 'runway_width',
  I: 'runway_length_reduction',
  J: 'drift_snow',
  K: 'loose_sand',
  L: 'chemical_treatment',
  M: 'runway_snow_banks',
  N: 'taxiway_snow_banks',
  O: 'adjacent_snow_banks',
  P: 'taxiway_condition',
  R: 'apron_condition',
  S: 'measured_friction',
  T: 'plain_language'
};

function formatSnowtamDateTimeLocal(dt) {
  if (!dt || typeof dt !== 'string') return dt;
  var trimmed = dt.replace(/\s+/g, '');
  if (!/^\d{8}$/.test(trimmed)) return dt;
  var month = trimmed.substring(0, 2);
  var day = trimmed.substring(2, 4);
  var hour = trimmed.substring(4, 6);
  var minute = trimmed.substring(6, 8);

  // 原始报文中的时间视为 UTC
  var utcText = month + '月' + day + '日 ' + hour + ':' + minute;

  // UTC 模式：直接按报文显示
  if (TIME_MODE === 'utc') {
    return utcText + ' (UTC)';
  }

  // 北京时间 = UTC+8
  var local = shiftDayHourWithOffset(day, hour, 8);
  if (local) {
    return month + '月' + local.day + '日 ' + local.hour + ':' + minute + '（北京时间）';
  }

  // 回退：无法换算时仍返回 UTC 时间，但标注为北京时间
  return utcText + '（北京时间）';
}

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

// SNOWTAM 补充说明（remark）常见术语中英文对照
function translateSnowtamRemark(remark) {
  if (!remark || typeof remark !== 'string') return remark;
  var text = remark;

  function appendInline(re, zh) {
    text = text.replace(re, function(m) {
      return m + '（' + zh + '）';
    });
  }

  // 来自 AC-175-TM-2021-01 雪情通告编发规范中的情景意识术语
  appendInline(/\bDRIFTING SNOW\b/gi, '跑道上有吹积的雪堆');
  appendInline(/\bLOOSE SAND\b/gi, '跑道上有散沙');
  appendInline(/\bCHEMICALLY TREATED\b/gi, '跑道进行了化学处理');
  appendInline(/\bSNOWBANKS?\b/gi, '雪堤');
  appendInline(/\bADJ SNOWBANKS?\b/gi, '跑道附近有雪堤');

  // 起飞显著污染提示（如 RUNWAY 12 TAKEOFF SIGNIFICANT CONTAMINANT THIN RWYCC 5/5/5）
  appendInline(/\bTAKEOFF SIGNIFICANT CONTAMINANT THIN\b/gi, '起飞跑道存在显著的薄层污染物');

  // 滑行道/机坪状况
  appendInline(/\bALL TWY POOR\b/gi, '所有滑行道状况差');
  appendInline(/\bALL APRON POOR\b/gi, '所有机坪状况差');
  appendInline(/\bSOUTH DEICING APRON POOR\b/gi, '南侧除冰机坪状况差');

  text = text.replace(/\bTWY\s+([A-Z0-9]+)\s+POOR\b/gi, function(m, code) {
    return m + '（滑行道 ' + code + ' 状况差）';
  });

  text = text.replace(/\bAPRON\s+([A-Z0-9]+)\s+POOR\b/gi, function(m, code) {
    return m + '（机坪 ' + code + ' 状况差）';
  });

  // 结尾的报文编号/时间戳（如 EUECYIYN S0259/25），对理解无帮助，直接过滤
  text = text.replace(/\s+[A-Z]{4,8}\s+S\d{4}\/\d{2}\s*$/g, '');

  // 清理 REMARK 中用于分隔的多余斜杠：
  //   - "RWYCC 5/5/5 / RUNWAY 04R ..." → "RWYCC 5/5/5 RUNWAY 04R ..."
  //   - 结尾单独的 " /" 直接去掉
  text = text.replace(/\s*\/\s*(?=RUNWAY\b)/gi, ' ');
  text = text.replace(/\s*\/\s*$/g, '');

  // 跑道长度变短：RWY 16L REDUCED TO 3000 / RWY22LREDUCEDTO1450
  text = text.replace(/\bRWY\s*(\d{2}[LRC]?)\s*REDUCED\s*TO\s*(\d{3,4})\b/gi, function(m, rwy, len) {
    return m + '（跑道 ' + rwy + ' 变短至 ' + len + ' 米）';
  });
  text = text.replace(/\bRWY(\d{2}[LRC]?)REDUCEDTO(\d{3,4})\b/gi, function(m, rwy, len) {
    return m + '（跑道 ' + rwy + ' 变短至 ' + len + ' 米）';
  });

  return text;
}

function decodeRemarkCloudLayers(seq) {
  if (!seq || typeof seq !== 'string') return seq;
  var s = seq.toUpperCase();
  if (!/^[A-Z]{2}\d[A-Z]{2}\d[A-Z]{2}\d$/.test(s)) return seq;

  var map = {
    SC: '层积云',
    AC: '高积云',
    AS: '高层云',
    NS: '雨层云',
    ST: '层云',
    CU: '积云',
    CB: '积雨云',
    CI: '卷云'
  };

  var parts = [];
  for (var i = 0; i + 2 < s.length; i += 3) {
    var type = s.substring(i, i + 2);
    var amount = s.charAt(i + 2);
    if (!/^[0-9]$/.test(amount)) break;
    var zhType = map[type] || type;
    parts.push(type + amount + '：' + zhType + '覆盖约 ' + amount + '/8 的天空');
  }

  if (!parts.length) return seq;
  return s + '（' + parts.join('；') + '）';
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
  if (!weatherList || !weatherList.length) return results;

  var specialWxIcons = {
    'FC': '🌪️', // 漏斗云/龙卷
    'PO': '⚠️', // 尘/沙卷风
    'SS': '⚠️', // 沙暴
    'DS': '⚠️', // 尘暴
    'VA': '🌋', // 火山灰
    'TS': '⛈️', // 雷暴
    'SQ': '💨'  // 飚（飑线）
  };
  var specialOrder = ['FC', 'PO', 'SS', 'DS', 'VA', 'TS', 'SQ'];

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
    if (!descriptor) {
      // 没有前缀描述词时，优先尝试按两个天气现象组合解码（如 RADZ = RA + DZ）
      var wxMain = WEATHER_CODES[grp];
      var combined = '';
      if (!wxMain && grp.length === 4) {
        var p1 = grp.substring(0, 2);
        var p2 = grp.substring(2, 4);
        var zh1 = WEATHER_CODES[p1];
        var zh2 = WEATHER_CODES[p2];
        if (zh1 || zh2) {
          combined = (zh1 || p1) + (zh2 ? '和' + zh2 : '');
        }
      }
      phenomena = combined || wxMain || grp;
    }
    var intensity = sign === '+' ? '强' : (sign === '-' ? '轻' : '');
    var zh = (intensity + descriptor + phenomena).trim();
    if (!zh) zh = grp;

    var upRaw = raw.toUpperCase();
    var icon = '';
    for (var si = 0; si < specialOrder.length; si++) {
      var code = specialOrder[si];
      if (upRaw.indexOf(code) !== -1) {
        icon = specialWxIcons[code] || '';
        if (icon) break;
      }
    }

    var text = raw + '（' + zh + '）';
    if (icon) {
      text = icon + ' ' + text;
    }
    results.push(text);
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

  // UTC 模式：直接按报文时间显示
  if (TIME_MODE === 'utc') {
    var baseUtc = fromDay + '日' + fromHour + '时 至 ' + toDay + '日' + toHour + '时';
    return baseUtc + ' (UTC)';
  }

  // 北京时间 = UTC+8
  var fromLocal = shiftDayHourWithOffset(fromDay, fromHour, 8);
  var toLocal = shiftDayHourWithOffset(toDay, toHour, 8);
  if (fromLocal && toLocal) {
    var baseLocal = fromLocal.day + '日' + fromLocal.hour + '时 至 ' + toLocal.day + '日' + toLocal.hour + '时';
    return baseLocal + '（北京时间）';
  }

  // 回退：无法换算时仍返回 UTC 时间
  var fallback = fromDay + '日' + fromHour + '时 至 ' + toDay + '日' + toHour + '时';
  return fallback + ' (UTC)';
}

// 根据全局 TIME_MODE 格式化单个时间
function formatUtcBeijingTime(dayStr, hourStr, minuteStr) {
  var d = toInt(dayStr);
  var h = toInt(hourStr);
  var m = toInt(minuteStr);
  if (d === null || h === null || m === null) {
    return dayStr + '日' + hourStr + ':' + minuteStr + ' (UTC)';
  }

  // UTC 模式：直接按报文时间显示
  if (TIME_MODE === 'utc') {
    return dayStr + '日' + hourStr + ':' + minuteStr + ' (UTC)';
  }

  // 本地(北京时间)模式：在 UTC 基础上 +8 小时
  var local = shiftDayHourWithOffset(dayStr, hourStr, 8);
  if (local) {
    return local.day + '日' + local.hour + ':' + minuteStr + '（北京时间）';
  }

  // 回退：无法换算时返回 UTC
  return dayStr + '日' + hourStr + ':' + minuteStr + ' (UTC)';
}

// 基于 trendRaw 文本构造 METAR 趋势预报条目（BECMG/TEMPO）
function buildMetarTrendItemsFromRaw(trendRaw, ctx) {
  if (!trendRaw || !trendRaw.trim) return [];
  var text = trendRaw.trim();
  if (!text) return [];

  var tokens = text.split(/\s+/);
  var items = [];
  var i = 0;

  while (i < tokens.length) {
    var t = tokens[i] || '';
    var up = t.toUpperCase();
    if (up !== 'BECMG' && up !== 'TEMPO') {
      i++;
      continue;
    }

    var kind = up;
    i++;

    var timeText = '';
    var next = tokens[i] || '';
    var nextUp = next.toUpperCase();
    if (PATTERNS.valid && PATTERNS.valid.test(nextUp)) {
      timeText = formatValidPeriodText(nextUp);
      i++;
    }

    var elemTokens = [];
    while (i < tokens.length) {
      var cur = tokens[i] || '';
      var curUp = cur.toUpperCase();
      if (curUp === 'BECMG' || curUp === 'TEMPO') break;
      elemTokens.push(cur);
      i++;
    }

    var summary = '';
    if (elemTokens.length && ctx && typeof ctx.decodeMetarFragment === 'function') {
      var frag = ctx.decodeMetarFragment(elemTokens.join(' '));
      if (frag && frag.analysis && frag.analysis.sections && frag.analysis.sections.length) {
        var first = frag.analysis.sections[0];
        if (first && first.items && first.items.length) {
          var parts = [];
          for (var j = 0; j < first.items.length; j++) {
            var it = first.items[j];
            parts.push((it.label || '') + '：' + (it.value || ''));
          }
          summary = parts.join('；');
        }
      }
    }

    if (!summary && elemTokens.length) {
      summary = elemTokens.join(' ');
    }

    var baseLabel = kind === 'BECMG' ? '逐渐变化' : '临时波动';
    var labelText = baseLabel;
    if (timeText) {
      // 有显式时间段（如 1700/1900），直接展示时间说明
      labelText += ' · ' + timeText;
    } else {
      // 无显式时间组时，按照 TREND 标准时效：默认未来两小时内
      if (kind === 'TEMPO') {
        // 统一为“原文代码（中文解释）”格式
        labelText = 'TEMPO(未来两小时内)';
      } else {
        // BECMG 情况做对称处理
        labelText = 'BECMG(未来两小时内)';
      }
    }

    items.push({ label: labelText, value: summary || '-' });
  }

  return items;
}

// 构造 TAF 预报阶段标题文案
function buildTafSegmentTitle(seg, index) {
  var code = (seg.code || '').toUpperCase();
  var base = '';

  if (seg.kind === 'INITIAL') {
    base = 'INITIAL(初始预报，全时段)';
  } else if (seg.kind === 'BECMG') {
    base = 'BECMG(逐渐变化)';
  } else if (seg.kind === 'TEMPO') {
    base = 'TEMPO(临时波动)';
  } else if (seg.kind === 'PROB') {
    var m = /PROB(\d{2})/.exec(code);
    var probText = m ? m[1] : '';
    var isTempoProb = code.indexOf('TEMPO') !== -1;
    var zhParts = [];
    if (probText) {
      zhParts.push('概率 ' + probText + '%');
    } else {
      zhParts.push('概率预报');
    }
    if (isTempoProb) {
      zhParts.push('临时波动');
    }
    base = code + '(' + zhParts.join(' ') + ')';
  } else if (seg.kind === 'FM') {
    if (code.length === 8 && code.indexOf('FM') === 0) {
      var d = code.substring(2, 4);
      var h = code.substring(4, 6);
      var mi = code.substring(6, 8);
      var timeText = formatUtcBeijingTime(d, h, mi);
      base = code + '(自 ' + timeText + ' 起)';
    } else {
      base = code ? (code + '(从指定时间起)') : 'FM(从指定时间起)';
    }
  } else {
    base = code ? (code + '(预报阶段 ' + (index + 1) + ')') : ('预报阶段 ' + (index + 1));
  }

  // 时间范围统一在卡片内部以“适用时间”字段展示，这里不再重复
  return base;
}

// 欧洲摩擦系数（RODEX）跑道状态解码（用于 METAR 中的 Rxx/xxxxxx、Rxx/////// 等）
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
    // 优先使用本地中文映射，保持与 SNOWTAM/GRF 文本风格一致
    var zhMap = {
      '0': '干燥，无明显污染物',
      '1': '潮湿',
      '2': '湿或局部积水',
      '3': '霜或霜冻（通常小于 1mm）',
      '4': '干雪',
      '5': '湿雪',
      '6': '雪浆',
      '7': '冰',
      '8': '压实或辗压雪',
      '9': '冻结车辙',
      '/': '污染物类型未报告（如正在清扫跑道）'
    };
    if (zhMap.hasOwnProperty(code)) return zhMap[code];

    // 回退到 rodex 数据中的原始说明（英文），避免丢信息
    var deposits = rodexData && rodexData.components && rodexData.components.runway_deposits && rodexData.components.runway_deposits.values;
    var raw = deposits && deposits[code];
    return raw || '未知污染物类型';
  } catch (e) {
    return '未知污染物类型';
  }
}

function rodexGetContaminationDescription(code) {
  try {
    var zhMap = {
      '1': '跑道表面不超过 10% 被污染',
      '2': '跑道表面超过 10% 至 25% 被污染',
      '5': '跑道表面超过 25% 至 50% 被污染',
      '9': '跑道表面超过 50% 至 100% 被污染',
      '/': '污染覆盖范围未报告（如正在清扫跑道）'
    };
    if (zhMap.hasOwnProperty(code)) return zhMap[code];

    var contamination = rodexData && rodexData.components && rodexData.components.extent_of_contamination && rodexData.components.extent_of_contamination.values;
    var raw = contamination && contamination[code];
    return raw || '未知污染程度';
  } catch (e) {
    return '未知污染程度';
  }
}

function rodexGetDepthDescription(code) {
  try {
    var depths = rodexData && rodexData.components && rodexData.components.depth_of_deposit && rodexData.components.depth_of_deposit.values;
    var raw = depths && depths[code];
    if (!raw) return '未知深度';

    var text = String(raw);

    // 典型格式："3mm"、"10mm" —— 直接返回
    var mMm = /^(\d+)mm$/i.exec(text);
    if (mMm) return mMm[1] + 'mm';

    // "less than 1mm" → "小于 1mm"
    var mLess = /^less than\s+(\d+)mm$/i.exec(text);
    if (mLess) return '小于 ' + mLess[1] + 'mm';

    // "10cm" → "10 厘米"
    var mCm = /^(\d+)cm$/i.exec(text);
    if (mCm) return mCm[1] + ' 厘米';

    if (/^40cm or more$/i.test(text)) return '40 厘米或更深';

    if (/^Runway or runways non-operational/i.test(text)) {
      return '因雪、雪浆、冰、大雪堆或跑道清理，跑道不可用';
    }
    if (/^Depth of deposit operationally not significant or not measurable\./i.test(text)) {
      return '污染物深度对运行影响不大或无法测量';
    }

    // 其余情况直接返回原文，避免损失信息
    return text;
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
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

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
    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    // 页面加载完成
    // 预先加载机场数据，确保首次解码时即可显示中文短名
    try {
      ensureAirportDataLoaded();
    } catch (e) {
      // 忽略加载失败，后续调用会按原逻辑回退为代码本身
    }
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
          self.handleError(error, '天气报文·摩擦系数·雪情通告');
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
    // SA = 中国民航例行天气报告（相当于 METAR）
    if (PATTERNS.sa.test(upperFirst)) {
      return this.decodeMetarLike(text, 'SA');
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
    // FC = 中国民航短期机场预报（9小时有效期）
    if (PATTERNS.fc.test(upperFirst)) {
      return this.decodeTaf(text, 'FC');
    }
    // FT = 中国民航机场预报（24小时有效期，相当于 TAF）
    if (PATTERNS.ft.test(upperFirst)) {
      return this.decodeTaf(text, 'FT');
    }
    // 自动识别 TAF 形态
    if (PATTERNS.tafAuto.test(upperFirst)) {
      return this.decodeTaf(text, 'TAF_NO_HEADER');
    }
    // 自动识别 METAR 形态（带机场代码）
    if (PATTERNS.metarAuto.test(upperFirst)) {
      return this.decodeMetarLike(text, 'METAR_NO_HEADER');
    }
    // 自动识别 METAR 片段（只有时间码开头，无机场代码）
    if (PATTERNS.metarTimeOnly.test(upperFirst)) {
      return this.decodeMetarLike(text, 'METAR_FRAGMENT');
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
    var snowtamResult = this.decodeSnowtamGrf(text);
    if (snowtamResult) return snowtamResult;

    var snowtamCompactResult = this.decodeSnowtamCompactHeader(text);
    if (snowtamCompactResult) return snowtamCompactResult;

    // 尝试解析多条 GRF 单行跑道状态汇总（每行一条 RCR）
    var runwayLineSections = [];
    var runwayLineCount = 0;
    var runwayAirportCode = '';
    var firstRunwayLineResult = null;
    var extraRunwayRemarks = [];
    var inRunwayRemarkBlock = false;
    var lines = text.split('\n');
    for (var li = 0; li < lines.length; li++) {
      var rawLine = (lines[li] || '').trim();
      if (!rawLine) continue;

      // REMARK 块后续行：直到遇到 Effective / Expires 开头的行
      if (inRunwayRemarkBlock) {
        if (/^(Effective|Expires)\b/i.test(rawLine)) {
          inRunwayRemarkBlock = false;
          // 继续按普通行处理 Effective/Expires（当前实现中会被忽略）
        } else {
          extraRunwayRemarks.push(rawLine);
          continue;
        }
      }

      // 若某行仅为四字母机场代码（如 EADD），记录为机场信息
      if (!runwayAirportCode && /^[A-Z]{4}$/.test(rawLine)) {
        runwayAirportCode = rawLine;
        continue;
      }

      // REMARK 行：记录为补充说明起始行，不按跑道行解析
      if (/^REMARK\b/i.test(rawLine) || /^REMARK\//i.test(rawLine)) {
        var remarkText = rawLine.replace(/^REMARK\/?\s*/i, '').trim();
        if (remarkText) {
          extraRunwayRemarks.push(remarkText);
        }
        inRunwayRemarkBlock = true;
        continue;
      }

      var line = rawLine.replace(/\s+/g, ' ');
      var singleResult = this.decodeSnowtamSingleLine(line);
      if (!singleResult) {
        singleResult = this.decodeSnowtamRunwayCompact(line);
      }
      if (!singleResult) {
        singleResult = this.decodeSnowtamRunwaySimple(line);
      }
      if (singleResult && singleResult.analysis && singleResult.analysis.sections) {
        runwayLineCount++;
        if (!firstRunwayLineResult) {
          firstRunwayLineResult = singleResult;
        }

        // 从该行解析跑道号，用于区分各段 section
        var tokensLine = line.split(/\s+/);
        var runwayTokLine = '';
        if (tokensLine.length >= 2 && /^\d{8}$/.test(tokensLine[0])) {
          // 标准单行 GRF：时间 + 跑道
          runwayTokLine = tokensLine[1];
        } else if (tokensLine.length >= 1 && /^(0[1-9]|[12][0-9]|3[0-6])[LRC]?$/.test(tokensLine[0])) {
          // 简化片段：直接以跑道号开头
          runwayTokLine = tokensLine[0];
        } else if (tokensLine.length >= 1 && /^RWY(0[1-9]|[12][0-9]|3[0-6])[LRC]?$/i.test(tokensLine[0])) {
          // RWY 开头格式
          runwayTokLine = tokensLine[0].substring(3).toUpperCase();
        }
        if (!runwayTokLine) {
          runwayTokLine = 'RWY' + runwayLineCount;
        }

        var secList = singleResult.analysis.sections || [];

        for (var si = 0; si < secList.length; si++) {
          var sec = secList[si] || {};
          var baseId = sec.id || 'section';
          var newId = baseId + '_' + runwayTokLine + '_' + runwayLineCount;
          var newTitle = sec.title || '';

          if (runwayTokLine) {
            if (newTitle === '基本信息') {
              newTitle = '基本信息 - 跑道 ' + runwayTokLine;
            } else if (newTitle === '三段跑道状况') {
              newTitle = '三段跑道状况 - 跑道 ' + runwayTokLine;
            } else if (newTitle === '补充说明') {
              newTitle = '补充说明 - 跑道 ' + runwayTokLine;
            }
          }

          runwayLineSections.push({
            id: newId,
            icon: sec.icon,
            title: newTitle || sec.title,
            items: sec.items || []
          });
        }
      }
    }

    if (runwayLineCount === 1) {
      // 只有一条跑道状态行（单行 GRF 或 RWY 开头格式）
      if (firstRunwayLineResult) {
        // 如果存在独立 REMARK 行，将其作为补充说明附加到该跑道结果中
        if (extraRunwayRemarks.length && firstRunwayLineResult.analysis && firstRunwayLineResult.analysis.sections) {
          var sectionsSingle = firstRunwayLineResult.analysis.sections;
          var mergedRemarkText = extraRunwayRemarks.join(' ');
          var displayRemark = translateSnowtamRemark(mergedRemarkText);
          var attached = false;
          for (var sr = 0; sr < sectionsSingle.length; sr++) {
            var secR = sectionsSingle[sr];
            if (secR && secR.title === '补充说明' && Array.isArray(secR.items)) {
              secR.items.push({ label: '备注', value: displayRemark });
              attached = true;
              break;
            }
          }
          if (!attached) {
            sectionsSingle.push({
              id: 'snowtam_runway_remark_extra',
              icon: '📝',
              title: '补充说明',
              items: [
                { label: '备注', value: displayRemark }
              ]
            });
          }
        }
        return firstRunwayLineResult;
      }
    } else if (runwayLineCount > 1) {
      // 多条单行 GRF：合并为一个统一结果，按跑道划分多个卡片
      var mergedSections = runwayLineSections.slice();

      // 若检测到独立的机场代码行（如 EADD），在最前方增加全局“基本信息”卡片
      if (runwayAirportCode) {
        mergedSections.unshift({
          id: 'snowtam_basic_' + runwayAirportCode,
          icon: '📍',
          title: '基本信息',
          items: [
            { label: '报文类型', value: 'SNOWTAM(GRF雪情通告)' },
            { label: '机场', value: getAirportDisplayName(runwayAirportCode) }
          ]
        });
      }

      // 将独立 REMARK 行合并为全局补充说明
      if (extraRunwayRemarks.length) {
        var mergedRemarkText = extraRunwayRemarks.join(' ');
        mergedSections.push({
          id: 'snowtam_runway_remarks_global',
          icon: '📝',
          title: '补充说明',
          items: [
            { label: '备注', value: translateSnowtamRemark(mergedRemarkText) }
          ]
        });
      }

      return {
        type: 'SNOWTAM_RUNWAY_LINES',
        typeLabel: '跑道状态汇总行（多条 GRF 单行）',
        analysis: buildAnalysis('', mergedSections),
        errorMessage: ''
      };
    }

    // GRF 覆盖/深度片段（如 100/100/100 NR/NR/03）
    var grfFragmentResult = this.decodeGrfFragment(text);
    if (grfFragmentResult) return grfFragmentResult;

    // SNOWTAM 情景说明片段（如 DRIFTING SNOW / LOOSE SAND / CHEMICALLY TREATED 等）
    var snowtamRemarkFragment = this.decodeSnowtamRemarkFragment(text);
    if (snowtamRemarkFragment) return snowtamRemarkFragment;

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
        if (f.code === 'WEATHER') {
          var rawWx = (m[0] || '').trim();
          if (!rawWx) {
            pushItem(f.group || 'body', f.labelZh || f.code || '', rawWx);
            continue;
          }

          var wxCodes = [];
          var segTokens = rawWx.split(/\s+/);
          for (var ti = 0; ti < segTokens.length; ti++) {
            var tok = segTokens[ti] || '';
            var upTok = tok.toUpperCase();
            if (WEATHER_CODES[upTok]) {
              wxCodes.push(upTok);
            }
          }

          var wxDesc = '';
          if (wxCodes.length) {
            var wxResults = parseWeatherPhenomena(wxCodes) || [];
            if (wxResults.length) {
              wxDesc = wxResults.join('\n');
            }
          }

          var display = wxDesc || rawWx;
          pushItem(f.group || 'body', f.labelZh || f.code || '', display);
          continue;
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

  // 括号包裹的紧凑型 SNOWTAM 头部
  // 示例：(SNOWTAM 0124 VCBI 01111035 04 5/2/2 100/50/75 NR/06/06 WET/STANDING WATER/STANDING WATER)
  // 解析思路：
  //   1）去掉首尾括号；
  //   2）匹配 SNOWTAM + 序号 + 机场 + 时间 + 跑道；
  //   3）将后半部分拼成标准单行 GRF：<时间> <跑道> <D> <E> <F> <G...>；
  //   4）复用 decodeSnowtamSingleLine，并在其基础上插入一张全局“基本信息”卡片。
  decodeSnowtamCompactHeader: function(text) {
    try {
      var raw = (text || '').trim();
      if (!raw) return null;

      // 仅当整段看起来是以 "(SNOWTAM" 开头、以 ")" 结束时尝试本解析
      if (!/^\(\s*SNOWTAM\b/i.test(raw) || raw.indexOf(')') === -1) return null;

      // 去掉首尾括号
      raw = raw.replace(/^\(/, '').replace(/\)$/, '').trim();
      if (!raw) return null;

      var tokens = raw.replace(/\s+/g, ' ').split(' ');
      if (tokens.length < 6) return null;

      var first = (tokens[0] || '').toUpperCase();
      if (first !== 'SNOWTAM') return null;

      var snNumber = tokens[1] || '';
      var airport = tokens[2] || '';
      var timeTok = tokens[3] || '';
      var runwayTok = tokens[4] || '';
      if (!/^[A-Z]{4}$/.test(airport)) return null;
      if (!/^\d{8}$/.test(timeTok)) return null;
      if (!/^(0[1-9]|[12][0-9]|3[0-6])[LRC]?$/.test(runwayTok)) return null;

      var restTokens = tokens.slice(5);
      if (!restTokens.length) return null;

      var singleLine = [timeTok, runwayTok].concat(restTokens).join(' ');
      var lineResult = this.decodeSnowtamSingleLine(singleLine);
      if (!lineResult || !lineResult.analysis || !lineResult.analysis.sections) return null;

      var sections = lineResult.analysis.sections.slice();

      // 在最前方插入 SNOWTAM 级别的基本信息
      var globalItems = [];
      if (snNumber) {
        globalItems.push({ label: 'SNOWTAM 序号', value: snNumber });
      }
      if (airport) {
        globalItems.push({ label: '机场', value: getAirportDisplayName(airport) });
      }
      globalItems.push({ label: '报文类型', value: 'SNOWTAM(GRF雪情通告)' });

      if (globalItems.length) {
        sections.unshift({
          id: 'snowtam_compact_basic_' + airport + '_' + snNumber,
          icon: '📍',
          title: '基本信息',
          items: globalItems
        });
      }

      return {
        type: 'SNOWTAM_GRF',
        typeLabel: 'SNOWTAM(GRF雪情通告)',
        analysis: buildAnalysis(lineResult.analysis.summary || '', sections),
        errorMessage: ''
      };
    } catch (e) {
      return null;
    }
  },

  decodeSnowtamGrf: function(text) {
    try {
      if (!snowtamConfig || !snowtamConfig.fields) return null;
      var raw = (text || '').replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\s+/g, ' ').trim();
      if (!raw) return null;
      var idxA = raw.indexOf('A)');
      if (idxA === -1) return null;
      var sub = raw.substring(idxA);
      if (sub.indexOf('B)') === -1 || sub.indexOf('C)') === -1 || sub.indexOf('D)') === -1) {
        return null;
      }

      var letterValues = {};
      var re = /([A-T])\)/g;
      var m;
      var positions = [];
      while ((m = re.exec(sub))) {
        positions.push({ key: m[1], index: m.index });
      }
      if (!positions.length) return null;

      for (var pi = 0; pi < positions.length; pi++) {
        var cur = positions[pi];
        var start = cur.index + 2;
        var end = pi + 1 < positions.length ? positions[pi + 1].index : sub.length;
        var value = sub.substring(start, end).trim();
        letterValues[cur.key] = value;
      }

      var fields = snowtamConfig.fields || {};
      var airportCode = (letterValues.A || '').trim();
      var runway = (letterValues.C || '').trim();
      var dtRaw = (letterValues.B || '').replace(/\s+/g, '');
      var evalTimeText = dtRaw ? formatSnowtamDateTimeLocal(dtRaw) : '';

      var basicItems = [];
      // 报文类型统一显示为 SNOWTAM(GRF雪情通告)
      basicItems.push({ label: '报文类型', value: 'SNOWTAM(GRF雪情通告)' });

      if (airportCode) {
        var airportLabel = (fields.location_indicator && fields.location_indicator.label) || '机场';
        basicItems.push({ label: airportLabel, value: getAirportDisplayName(airportCode) });
      }

      if (dtRaw) {
        var dtLabel = (fields.date_time && fields.date_time.label) || '评估时间';
        basicItems.push({ label: dtLabel, value: evalTimeText || dtRaw });
      }

      if (runway) {
        var rwLabel = (fields.runway && fields.runway.label) || '跑道';
        basicItems.push({ label: rwLabel, value: runway });
      }

      var perfItems = [];
      var d = (letterValues.D || '').split('/');
      var e = (letterValues.E || '').split('/');
      var f = (letterValues.F || '').split('/');
      var g = (letterValues.G || '').split('/');
      var posNames = (fields.runway_condition_code && fields.runway_condition_code.positions) || ['跑道1/3', '跑道2/3', '跑道3/3'];
      var dCodesMap = fields.runway_condition_code && fields.runway_condition_code.codes;
      var eMap = fields.contamination_coverage && fields.contamination_coverage.values;

      for (var si = 0; si < 3; si++) {
        var parts = [];
        var codeD = (d[si] || '').trim();
        if (codeD) {
          parts.push('跑道状况代码：' + codeD);
        }

        var codeE = (e[si] || '').trim();
        if (codeE) {
          if (codeE === '无') {
            parts.push('污染物覆盖范围：无(道面干燥或覆盖污染物少于10%)');
          } else {
            parts.push('污染物覆盖范围：' + codeE + '%');
          }
        }

        var codeF = (f[si] || '').trim();
        if (codeF) {
          if (codeF === '无') {
            parts.push('松散污染物深度：无/不适用');
          } else if (/^\d{2}$/.test(codeF)) {
            var depthVal2 = parseInt(codeF, 10);
            if (!isNaN(depthVal2)) {
              parts.push('松散污染物深度：' + depthVal2 + ' 毫米');
            } else {
              parts.push('松散污染物深度：' + codeF);
            }
          } else {
            parts.push('松散污染物深度：' + codeF);
          }
        }

        var codeG = (g[si] || '').trim();
        if (codeG) {
          parts.push('污染物种类：' + codeG);
        }

        var valueText = parts.length ? parts.join('，') : '未报告';
        perfItems.push({ label: posNames[si] || ('跑道' + (si + 1) + '/3'), value: valueText });
      }

      var hRaw = (letterValues.H || '').trim();
      var iRaw = (letterValues.I || '').trim();
      if (hRaw) {
        var hLabel = (fields.runway_width && fields.runway_width.label) || '跑道宽度';
        perfItems.push({ label: hLabel, value: hRaw });
      }

      if (iRaw) {
        var iLabel = (fields.runway_length_reduction && fields.runway_length_reduction.label) || '跑道长度变短';
        perfItems.push({ label: iLabel, value: iRaw });
      }

      var situItems = [];
      var situLetters = ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T'];
      for (var sl = 0; sl < situLetters.length; sl++) {
        var letter = situLetters[sl];
        var rawVal = (letterValues[letter] || '').trim();
        if (!rawVal) continue;
        var fieldKey = SNOWTAM_LETTER_FIELD_MAP[letter];
        var fieldCfg = fieldKey && fields[fieldKey];
        var label = (fieldCfg && fieldCfg.label) || (letter + ') 项');
        var displayVal = translateSnowtamRemark(rawVal);
        situItems.push({ label: label, value: displayVal });
      }

      var sections = [];
      sections.push({ id: 'basic', icon: '📍', title: '基本信息', items: basicItems });
      if (perfItems.length) {
        sections.push({ id: 'performance', icon: '🛬', title: '性能计算部分（A–I）', items: perfItems });
      }
      if (situItems.length) {
        sections.push({ id: 'situational', icon: '⚠️', title: '情景意识部分（J–T）', items: situItems });
      }

      var summaryParts = [];
      if (airportCode) summaryParts.push(getAirportDisplayName(airportCode) + ' 机场');
      if (runway) summaryParts.push('跑道 ' + runway);
      if (evalTimeText) summaryParts.push('评估时间 ' + evalTimeText);
      var summary = summaryParts.length ? summaryParts.join('，') + '，含 GRF 跑道状态信息' : 'SNOWTAM(GRF雪情通告) 跑道状态信息';

      return {
        type: 'SNOWTAM_GRF',
        typeLabel: 'SNOWTAM(GRF雪情通告)',
        analysis: buildAnalysis(summary, sections),
        errorMessage: ''
      };
    } catch (e) {
      return null;
    }
  },

  decodeSnowtamSingleLine: function(line) {
    try {
      var text = (line || '').replace(/\s+/g, ' ').trim();
      if (!text) return null;
      var tokens = text.split(' ');
      if (!tokens || tokens.length < 5) return null;

      var timeTok = tokens[0];
      var runwayTok = tokens[1];
      if (!/^\d{8}$/.test(timeTok)) return null;
      if (!/^(0[1-9]|[12][0-9]|3[0-6])[LRC]?$/.test(runwayTok)) return null;

      var condTok = tokens[2] || '';
      var covTok = tokens[3] || '';
      var depthTok = tokens[4] || '';

      // G 项：污染物种类可能包含空格（如 WET SNOW），需从第 6 个 token 开始累加，直到包含 2 个斜线（3 段）
      var surfaceTok = '';
      var remark = '';
      if (tokens.length >= 6) {
        var surfStart = 5;
        surfaceTok = tokens[surfStart] || '';
        var slashCount = (surfaceTok.match(/\//g) || []).length;
        var j = surfStart + 1;
        while (j < tokens.length && slashCount < 2) {
          surfaceTok += ' ' + (tokens[j] || '');
          slashCount = (surfaceTok.match(/\//g) || []).length;
          j++;
        }
        if (j < tokens.length) {
          remark = tokens.slice(j).join(' ');
        }
      }

      var condParts = condTok.split('/');
      var covParts = covTok.split('/');
      var depthParts = depthTok.split('/');
      var surfParts = surfaceTok ? surfaceTok.split('/') : [];
      if (condParts.length !== 3 || covParts.length !== 3 || depthParts.length !== 3) return null;
      if (surfParts.length && surfParts.length !== 3) return null;

      var timeText = formatSnowtamDateTimeLocal(timeTok);

      var basicItems = [
        { label: '报文类型', value: 'SNOWTAM(GRF雪情通告)' },
        { label: '评估时间', value: timeText || timeTok },
        { label: '跑道', value: runwayTok }
      ];

      var fields = snowtamConfig && snowtamConfig.fields ? snowtamConfig.fields : {};
      var dCodesMap = fields.runway_condition_code && fields.runway_condition_code.codes;
      var eMap = fields.contamination_coverage && fields.contamination_coverage.values;
      var posNames = (fields.runway_condition_code && fields.runway_condition_code.positions) || ['跑道1/3', '跑道2/3', '跑道3/3'];

      var perfItems = [];
      for (var i = 0; i < 3; i++) {
        var parts = [];
        var dCode = (condParts[i] || '').trim();
        var covCode = (covParts[i] || '').trim();
        var depthCode = (depthParts[i] || '').trim();
        var surfCode = (surfParts[i] || '').trim();

        if (!dCode && !covCode && !depthCode && !surfCode) {
          continue;
        }

        // D 项：跑道状况代码（RWYCC）
        if (dCode) {
          parts.push('跑道状况代码：' + dCode);
        }

        // G 项：跑道状况说明（污染物种类）
        if (surfCode) {
          var up = surfCode.toUpperCase();
          var surfZh = '';
          if (up === 'DRY') surfZh = '干燥';
          else if (up === 'WET') surfZh = '湿';
          else if (up === 'SLUSH') surfZh = '雪浆';
          else if (up === 'SNOW') surfZh = '积雪';
          else if (up === 'ICE') surfZh = '冰';
          else if (up === 'NR') surfZh = '未报告';
          if (surfZh) {
            // 显示为 WET(湿) 这样的顺序
            parts.push('污染物种类：' + surfCode + '(' + surfZh + ')');
          } else {
            parts.push('污染物种类：' + surfCode);
          }
        }

        // F 项：跑道污染物深度
        if (depthCode) {
          if (depthCode === 'NR') {
            parts.push('松散污染物深度：NR(不适用或低于通报门限)');
          } else if (/^\d{2}$/.test(depthCode)) {
            var depthVal = parseInt(depthCode, 10);
            if (!isNaN(depthVal)) {
              parts.push('松散污染物深度：' + depthVal + ' 毫米');
            } else {
              parts.push('松散污染物深度：' + depthCode);
            }
          } else {
            parts.push('松散污染物深度：' + depthCode);
          }
        }

        // E 项：跑道污染物覆盖范围
        if (covCode) {
          if (covCode === 'NR') {
            parts.push('污染物覆盖范围：NR(不适用或未报告)');
          } else {
            parts.push('污染物覆盖范围：' + covCode + '%');
          }
        }

        var labelText = posNames[i] || ('跑道' + (i + 1) + '/3');
        if (!parts.length) {
          perfItems.push({ label: labelText, value: '未报告' });
          continue;
        }

        for (var li = 0; li < parts.length; li++) {
          perfItems.push({
            label: li === 0 ? labelText : '',
            value: parts[li]
          });
        }
      }

      var sections = [];
      sections.push({ id: 'basic', icon: '📍', title: '基本信息', items: basicItems });
      if (perfItems.length) {
        sections.push({ id: 'performance', icon: '🛬', title: '三段跑道状况', items: perfItems });
      }
      if (remark) {
        sections.push({ id: 'remark', icon: '📝', title: '补充说明', items: [
          { label: '备注', value: translateSnowtamRemark(remark) }
        ]});
      }

      var summary = '跑道 ' + runwayTok + '，评估时间 ' + (timeText || timeTok) + '，来自单行跑道状态汇总';
      return {
        type: 'SNOWTAM_RUNWAY_LINE',
        typeLabel: '跑道状态汇总行（GRF 单行）',
        analysis: buildAnalysis(summary, sections),
        errorMessage: ''
      };
    } catch (e) {
      return null;
    }
  },

  // RWY 开头的跑道状态汇总行解析（无时间组）
  // 示例：RWY36L 5/5/5 WET/WET/WET NR/NR/NR 100/100/100
  decodeSnowtamRunwayCompact: function(line) {
    try {
      var text = (line || '').replace(/\s+/g, ' ').trim();
      if (!text) return null;
      var tokens = text.split(' ');
      if (!tokens || tokens.length < 5) return null;

      var rwyToken = (tokens[0] || '').toUpperCase();
      var m = /^RWY(0[1-9]|[12][0-9]|3[0-6])[LRC]?$/.exec(rwyToken);
      if (!m) return null;
      var runwayTok = rwyToken.substring(3);

      var condTok = tokens[1] || '';
      var surfTok = tokens[2] || '';
      var depthTok = tokens[3] || '';
      var covTok = tokens[4] || '';

      var condParts = condTok.split('/');
      var surfParts = surfTok.split('/');
      var depthParts = depthTok.split('/');
      var covParts = covTok.split('/');
      if (condParts.length !== 3 || surfParts.length !== 3 ||
          depthParts.length !== 3 || covParts.length !== 3) {
        return null;
      }

      var fields = snowtamConfig && snowtamConfig.fields ? snowtamConfig.fields : {};
      var posNames = (fields.runway_condition_code && fields.runway_condition_code.positions) || ['跑道1/3', '跑道2/3', '跑道3/3'];

      var basicItems = [
        { label: '报文类型', value: 'SNOWTAM(GRF雪情通告)' },
        { label: '跑道', value: runwayTok }
      ];

      var perfItems = [];
      for (var i = 0; i < 3; i++) {
        var parts = [];
        var dCode = (condParts[i] || '').trim();
        var surfCode = (surfParts[i] || '').trim();
        var depthCode = (depthParts[i] || '').trim();
        var covCode = (covParts[i] || '').trim();

        if (!dCode && !surfCode && !depthCode && !covCode) {
          continue;
        }

        if (dCode) {
          parts.push('跑道状况代码：' + dCode);
        }

        if (surfCode) {
          var up = surfCode.toUpperCase();
          var surfZh = '';
          if (up === 'DRY') surfZh = '干燥';
          else if (up === 'WET') surfZh = '湿';
          else if (up === 'SLUSH') surfZh = '雪浆';
          else if (up === 'SNOW') surfZh = '积雪';
          else if (up === 'ICE') surfZh = '冰';
          else if (up === 'NR') surfZh = '未报告';
          if (surfZh) {
            parts.push('污染物种类：' + surfCode + '(' + surfZh + ')');
          } else {
            parts.push('污染物种类：' + surfCode);
          }
        }

        if (depthCode) {
          if (depthCode === 'NR') {
            parts.push('松散污染物深度：NR(不适用或低于通报门限)');
          } else if (/^\d{2}$/.test(depthCode)) {
            var depthVal = parseInt(depthCode, 10);
            if (!isNaN(depthVal)) {
              parts.push('松散污染物深度：' + depthVal + ' 毫米');
            } else {
              parts.push('松散污染物深度：' + depthCode);
            }
          } else {
            parts.push('松散污染物深度：' + depthCode);
          }
        }

        if (covCode) {
          if (covCode === 'NR') {
            parts.push('污染物覆盖范围：NR(不适用或未报告)');
          } else {
            parts.push('污染物覆盖范围：' + covCode + '%');
          }
        }

        var labelText = posNames[i] || ('跑道' + (i + 1) + '/3');
        if (!parts.length) {
          perfItems.push({ label: labelText, value: '未报告' });
          continue;
        }
        for (var li = 0; li < parts.length; li++) {
          perfItems.push({
            label: li === 0 ? labelText : '',
            value: parts[li]
          });
        }
      }

      var sections = [];
      sections.push({ id: 'basic', icon: '📍', title: '基本信息', items: basicItems });
      if (perfItems.length) {
        sections.push({ id: 'performance', icon: '🛬', title: '三段跑道状况', items: perfItems });
      }

      var summary = '跑道 ' + runwayTok + '，来自 RWY 开头的跑道状态汇总行';
      return {
        type: 'SNOWTAM_RUNWAY_LINE',
        typeLabel: '跑道状态汇总行（RWY 格式）',
        analysis: buildAnalysis(summary, sections),
        errorMessage: ''
      };
    } catch (e) {
      return null;
    }
  },

  // 以跑道号开头、无时间组的 GRF 单行
  // 示例：09R 5/2/2 100/50/75 NR/06/06 WET/SLUSH/SLUSH
  decodeSnowtamRunwaySimple: function(line) {
    try {
      var text = (line || '').replace(/\s+/g, ' ').trim();
      if (!text) return null;
      var tokens = text.split(' ');
      if (!tokens || tokens.length < 4) return null;

      var runwayTok = tokens[0];
      if (!/^(0[1-9]|[12][0-9]|3[0-6])[LRC]?$/.test(runwayTok)) return null;

      var condTok = tokens[1] || '';
      var covTok = tokens[2] || '';
      var depthTok = tokens[3] || '';

      // G 项：污染物种类可能包含空格（如 WET SNOW），从第 5 个 token 开始累加，直到包含 2 个斜线
      var surfaceTok = '';
      var remark = '';
      if (tokens.length >= 5) {
        var surfStart = 4;
        surfaceTok = tokens[surfStart] || '';
        var slashCount = (surfaceTok.match(/\//g) || []).length;
        var j = surfStart + 1;
        while (j < tokens.length && slashCount < 2) {
          surfaceTok += ' ' + (tokens[j] || '');
          slashCount = (surfaceTok.match(/\//g) || []).length;
          j++;
        }
        if (j < tokens.length) {
          remark = tokens.slice(j).join(' ');
        }
      }

      var condParts = condTok.split('/');
      var covParts = covTok.split('/');
      var depthParts = depthTok.split('/');
      var surfParts = surfaceTok ? surfaceTok.split('/') : [];
      if (condParts.length !== 3 || covParts.length !== 3 || depthParts.length !== 3) return null;
      if (surfParts.length && surfParts.length !== 3) return null;

      var fields = snowtamConfig && snowtamConfig.fields ? snowtamConfig.fields : {};
      var posNames = (fields.runway_condition_code && fields.runway_condition_code.positions) || ['跑道1/3', '跑道2/3', '跑道3/3'];

      var basicItems = [
        { label: '报文类型', value: 'SNOWTAM(GRF雪情通告)' },
        { label: '跑道', value: runwayTok }
      ];

      var perfItems = [];
      for (var i = 0; i < 3; i++) {
        var parts = [];
        var dCode = (condParts[i] || '').trim();
        var covCode = (covParts[i] || '').trim();
        var depthCode = (depthParts[i] || '').trim();
        var surfCode = (surfParts[i] || '').trim();

        if (!dCode && !covCode && !depthCode && !surfCode) {
          continue;
        }

        if (dCode) {
          parts.push('跑道状况代码：' + dCode);
        }

        if (surfCode) {
          var up = surfCode.toUpperCase();
          var surfZh = '';
          if (up === 'DRY') surfZh = '干燥';
          else if (up === 'WET') surfZh = '湿';
          else if (up === 'SLUSH') surfZh = '雪浆';
          else if (up === 'SNOW') surfZh = '积雪';
          else if (up === 'ICE') surfZh = '冰';
          else if (up === 'NR') surfZh = '未报告';
          if (surfZh) {
            parts.push('污染物种类：' + surfCode + '(' + surfZh + ')');
          } else {
            parts.push('污染物种类：' + surfCode);
          }
        }

        if (depthCode) {
          if (depthCode === 'NR') {
            parts.push('松散污染物深度：NR(不适用或低于通报门限)');
          } else if (/^\d{2}$/.test(depthCode)) {
            var depthVal = parseInt(depthCode, 10);
            if (!isNaN(depthVal)) {
              parts.push('松散污染物深度：' + depthVal + ' 毫米');
            } else {
              parts.push('松散污染物深度：' + depthCode);
            }
          } else {
            parts.push('松散污染物深度：' + depthCode);
          }
        }

        if (covCode) {
          if (covCode === 'NR') {
            parts.push('污染物覆盖范围：NR(不适用或未报告)');
          } else {
            parts.push('污染物覆盖范围：' + covCode + '%');
          }
        }

        var labelText = posNames[i] || ('跑道' + (i + 1) + '/3');
        if (!parts.length) {
          perfItems.push({ label: labelText, value: '未报告' });
          continue;
        }
        for (var li = 0; li < parts.length; li++) {
          perfItems.push({
            label: li === 0 ? labelText : '',
            value: parts[li]
          });
        }
      }

      var sections = [];
      sections.push({ id: 'basic', icon: '📍', title: '基本信息', items: basicItems });
      if (perfItems.length) {
        sections.push({ id: 'performance', icon: '🛬', title: '三段跑道状况', items: perfItems });
      }
      if (remark) {
        sections.push({ id: 'remark', icon: '📝', title: '补充说明', items: [
          { label: '备注', value: translateSnowtamRemark(remark) }
        ]});
      }

      var summary = '跑道 ' + runwayTok + '，来自跑道状态汇总片段';
      return {
        type: 'SNOWTAM_RUNWAY_LINE',
        typeLabel: '跑道状态汇总行（GRF 片段）',
        analysis: buildAnalysis(summary, sections),
        errorMessage: ''
      };
    } catch (e) {
      return null;
    }
  },

  // GRF 三段片段解析：支持 D/E/F/G 任意组合片段
  // 示例：
  //  - 5/5/5 100/100/100        (D+E)
  //  - 100/100/100 NR/NR/03    (E+F)
  //  - NR/NR/03 WET/WET/WET    (F+G)
  //  - 5/5/5                   (仅 D)
  // 解码后按“三段跑道状况”标准样式展示，每段多行，缺失字段不显示
  decodeGrfFragment: function(text) {
    var raw = (text || '').replace(/\s+/g, ' ').trim();
    if (!raw) return null;
    var tokens = raw.split(' ');
    if (!tokens.length || tokens.length > 3) return null;

    function classifyGrfToken(tok) {
      if (!tok) return '';
      var parts = tok.split('/');
      if (parts.length !== 3) return '';

      var allDigit1 = true;
      var allCovLike = true;
      var allDepthLike = true;
      var allAlpha = true;

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (!/^\d$/.test(p) || parseInt(p, 10) > 6) {
          allDigit1 = false;
        }
        if (!/^\d{1,3}$/.test(p) && p !== 'NR' && p !== '无') {
          allCovLike = false;
        }
        if (!/^\d{2}$/.test(p) && p !== 'NR' && p !== '无') {
          allDepthLike = false;
        }
        if (!/^[A-Z]+$/.test(p)) {
          allAlpha = false;
        }
      }

      if (allDigit1) return 'D';      // 跑道状况代码
      if (allAlpha) return 'G';       // 污染物种类
      if (allDepthLike) return 'F';   // 深度
      if (allCovLike) return 'E';     // 覆盖
      return '';
    }

    var dTok = '', eTok = '', fTok = '', gTok = '';
    for (var ti = 0; ti < tokens.length; ti++) {
      var tk = tokens[ti];
      var kind = classifyGrfToken(tk);
      if (!kind) return null;
      if (kind === 'D') { if (dTok) return null; dTok = tk; }
      else if (kind === 'E') { if (eTok) return null; eTok = tk; }
      else if (kind === 'F') { if (fTok) return null; fTok = tk; }
      else if (kind === 'G') { if (gTok) return null; gTok = tk; }
    }

    if (!dTok && !eTok && !fTok && !gTok) return null;

    var dParts = dTok ? dTok.split('/') : ['', '', ''];
    var eParts = eTok ? eTok.split('/') : ['', '', ''];
    var fParts = fTok ? fTok.split('/') : ['', '', ''];
    var gParts = gTok ? gTok.split('/') : ['', '', ''];

    if ((dTok && dParts.length !== 3) || (eTok && eParts.length !== 3) ||
        (fTok && fParts.length !== 3) || (gTok && gParts.length !== 3)) {
      return null;
    }

    var fields = snowtamConfig && snowtamConfig.fields ? snowtamConfig.fields : {};
    var eMap = fields.contamination_coverage && fields.contamination_coverage.values;
    var posNames = (fields.runway_condition_code && fields.runway_condition_code.positions) || ['跑道1/3', '跑道2/3', '跑道3/3'];

    var perfItems = [];
    for (var i2 = 0; i2 < 3; i2++) {
      var parts2 = [];
      var dCode2 = (dParts[i2] || '').trim();
      var covCode2 = (eParts[i2] || '').trim();
      var depthCode2 = (fParts[i2] || '').trim();
      var surfCode2 = (gParts[i2] || '').trim();

      if (!dCode2 && !covCode2 && !depthCode2 && !surfCode2) {
        continue;
      }

      // D：跑道状况代码
      if (dCode2) {
        parts2.push('跑道状况代码：' + dCode2);
      }

      // G：污染物种类
      if (surfCode2) {
        var up2 = surfCode2.toUpperCase();
        var surfZh2 = '';
        if (up2 === 'DRY') surfZh2 = '干燥';
        else if (up2 === 'WET') surfZh2 = '湿';
        else if (up2 === 'SLUSH') surfZh2 = '雪浆';
        else if (up2 === 'SNOW') surfZh2 = '积雪';
        else if (up2 === 'ICE') surfZh2 = '冰';
        else if (up2 === 'NR') surfZh2 = '未报告';
        if (surfZh2) {
          parts2.push('污染物种类：' + surfCode2 + '(' + surfZh2 + ')');
        } else {
          parts2.push('污染物种类：' + surfCode2);
        }
      }

      // F：松散污染物深度
      if (depthCode2) {
        if (depthCode2 === '无' || depthCode2 === 'NR') {
          parts2.push('松散污染物深度：NR(不适用或低于通报门限)');
        } else if (/^\d{2}$/.test(depthCode2)) {
          var depthVal3 = parseInt(depthCode2, 10);
          if (!isNaN(depthVal3)) {
            parts2.push('松散污染物深度：' + depthVal3 + ' 毫米');
          } else {
            parts2.push('松散污染物深度：' + depthCode2);
          }
        } else {
          parts2.push('松散污染物深度：' + depthCode2);
        }
      }

      // E：污染物覆盖范围
      if (covCode2) {
        if (covCode2 === '无' || covCode2 === 'NR') {
          parts2.push('污染物覆盖范围：无(道面干燥或覆盖污染物少于10%)');
        } else {
          var covDesc2 = eMap && eMap[covCode2];
          parts2.push('污染物覆盖范围：' + covCode2 + '%');
        }
      }

      var labelText2 = posNames[i2] || ('跑道' + (i2 + 1) + '/3');
      if (!parts2.length) {
        perfItems.push({ label: labelText2, value: '未报告' });
        continue;
      }

      for (var li2 = 0; li2 < parts2.length; li2++) {
        perfItems.push({
          label: li2 === 0 ? labelText2 : '',
          value: parts2[li2]
        });
      }
    }

    if (!perfItems.length) return null;

    return {
      type: 'GRF_FRAGMENT',
      typeLabel: 'GRF 三段跑道片段',
      analysis: buildAnalysis('', [
        { id: 'grf_fragment', icon: '🛬', title: '三段跑道状况', items: perfItems }
      ]),
      errorMessage: ''
    };
  },

  // SNOWTAM 情景说明片段解析（J–R 项关键术语），如：DRIFTING SNOW / LOOSE SAND
  decodeSnowtamRemarkFragment: function(text) {
    var raw = (text || '').trim();
    if (!raw) return null;
    var normalized = raw.replace(/\s+/g, ' ');

    // 利用已有的 translateSnowtamRemark，如果没有任何术语被识别，则不视为 SNOWTAM 片段
    var translated = translateSnowtamRemark(normalized);
    if (!translated || translated === normalized) return null;

    return {
      type: 'SNOWTAM_REMARK_FRAGMENT',
      typeLabel: 'SNOWTAM 情景说明',
      analysis: buildAnalysis('SNOWTAM 情景说明：' + translated, [
        {
          id: 'snowtam_remark_fragment',
          icon: '📝',
          title: '情景意识说明（J–R 项）',
          items: [
            { label: '说明', value: translated }
          ]
        }
      ]),
      errorMessage: ''
    };
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

    if (AVIATION_TERMS[up]) {
      return { type: '气象术语', icon: '📖', label: up, value: AVIATION_TERMS[up] };
    }

    if (up === 'AO1') {
      return { type: '自动观测站类型', icon: '🤖', label: 'AO1', value: '自动化观测站，无降水类型鉴别器（无法区分雨、雪等不同降水类型）' };
    }
    if (up === 'AO2') {
      return { type: '自动观测站类型', icon: '🤖', label: 'AO2', value: '自动化观测站，配备降水类型鉴别器（可区分不同类型的降水，例如雨/雪等）' };
    }

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
    // 中国民航报文类型
    if (up === 'SA') { return { type: '报文类型', icon: '📋', label: 'SA', value: '例行天气报告（中国民航格式，相当于 METAR）' }; }
    if (up === 'FC') { return { type: '报文类型', icon: '📅', label: 'FC', value: '短期机场预报（中国民航格式，9小时有效期）' }; }
    if (up === 'FT') { return { type: '报文类型', icon: '📆', label: 'FT', value: '机场预报（中国民航格式，24小时有效期，相当于 TAF）' }; }

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
    var isCorrection = false;

    if (kind === 'MET_REPORT') {
      type = 'MET REPORT'; typeLabel = 'MET REPORT(机场当地天气报告)'; idx = 2;
    } else if (kind === 'METAR_NO_HEADER') {
      type = 'METAR*'; typeLabel = 'METAR*(自动识别的 METAR 报文)';
    } else if (kind === 'METAR_FRAGMENT') {
      type = 'METAR片段'; typeLabel = 'METAR 片段（无机场代码的气象报文）';
    } else if (kind === 'SA') {
      // SA = 中国民航例行天气报告（METAR 变体，无机场代码）
      type = 'SA'; typeLabel = 'SA(例行天气报告)';
      idx = 1; // 跳过 SA 标识符，下一个直接是时间码（无机场代码）
    } else if (typeToken === 'METAR' || typeToken === 'SPECI') {
      type = typeToken;
      typeLabel = typeToken === 'METAR' ? 'METAR(机场例行天气报告)' : 'SPECI(机场特别天气报告)';
      idx = 1;
      if ((tokens[idx] || '').toUpperCase() === 'COR') {
        isCorrection = true;
        idx++;
      }
    }

    var station = '';
    var stationDisplay = '';
    var timeToken = '';
    var timeText = '';

    // SA 报文没有机场代码，时间码直接跟在 SA 后面
    if (kind === 'SA') {
      timeToken = tokens[idx] || '';
      if (PATTERNS.time.test(timeToken)) {
        var dayObs = timeToken.substring(0, 2);
        var hourObs = timeToken.substring(2, 4);
        var minObs = timeToken.substring(4, 6);
        timeText = formatUtcBeijingTime(dayObs, hourObs, minObs);
        idx++;
      }
    } else {
      station = tokens[idx] || ''; idx++;
      stationDisplay = getAirportDisplayName(station);
      timeToken = tokens[idx] || '';
      if (PATTERNS.time.test(timeToken)) {
        var dayObs = timeToken.substring(0, 2);
        var hourObs = timeToken.substring(2, 4);
        var minObs = timeToken.substring(4, 6);
        timeText = formatUtcBeijingTime(dayObs, hourObs, minObs);
        idx++;
      }
    }

    var wind = '', windVar = '', visibility = '', rvrList = [], runwayStates = [], weather = [], clouds = [], tempDew = '', qnh = '', qfe = '', altimeterInch = '', slp = '', trendNosig = '', trendRaw = '', remarkItems = [], inRemarks = false, inTrend = false, remarkRawTokens = [];

    for (var i = idx; i < tokens.length; i++) {
      var t = tokens[i], upper = t.toUpperCase();
      var consumed = false;

      // 进入 RMK/备注段落，同时结束趋势段
      if (upper === 'RMK' || upper === 'RMKS') {
        inRemarks = true;
        inTrend = false;
        consumed = true;
        continue;
      }

      // METAR 趋势预报组（BECMG/TEMPO），累积原文
      if (!inRemarks && (upper === 'BECMG' || upper === 'TEMPO')) {
        inTrend = true;
        if (!trendRaw) {
          trendRaw = t;
        } else {
          trendRaw += ' ' + t;
        }
        consumed = true;
        continue;
      }

      // RMK：精确温度/露点（TsnTTTsnTdTdTd）
      if (inRemarks && /^T\d{8}$/.test(upper)) {
        var tMatch = /^T(\d)(\d{3})(\d)(\d{3})$/.exec(upper);
        var tText = upper;
        if (tMatch) {
          var sign1 = tMatch[1] === '1' ? -1 : 1;
          var tRaw = parseInt(tMatch[2], 10);
          var sign2 = tMatch[3] === '1' ? -1 : 1;
          var tdRaw = parseInt(tMatch[4], 10);
          var descParts = [];

          if (!isNaN(tRaw)) {
            var tVal = sign1 * (tRaw / 10.0);
            descParts.push('精确温度 ' + tVal.toFixed(1) + '°C');
          }
          if (!isNaN(tdRaw)) {
            var tdVal = sign2 * (tdRaw / 10.0);
            descParts.push('精确露点 ' + tdVal.toFixed(1) + '°C');
          }

          if (descParts.length) {
            tText = upper + '（' + descParts.join('，') + '）';
          }
        }
        remarkItems.push({ label: '精细温度', value: tText });
        consumed = true;
        continue;
      }

      // 趋势段内的其余 token 继续累积到 trendRaw，直到 RMK 或报文结束
      if (inTrend) {
        trendRaw += ' ' + t;
        consumed = true;
        continue;
      }

      // RMK：自动观测站类型（AO1/AO2）
      if (inRemarks && (upper === 'AO1' || upper === 'AO2')) {
        var autoDesc = upper === 'AO1'
          ? '自动化观测站，无降水类型鉴别器（无法区分雨、雪等不同降水类型）'
          : '自动化观测站，配备降水类型鉴别器（可区分不同类型的降水，例如雨/雪等）';
        var autoText = upper + '（' + autoDesc + '）';
        remarkItems.push({ label: '观测站类型', value: autoText });
        consumed = true;
        continue;
      }

      // RMK：降水开始/结束时间（RABxxEyy）
      if (inRemarks && /^RAB\d{2}(E\d{2})?$/.test(upper)) {
        var rabMatch = /^RAB(\d{2})(E(\d{2}))?$/.exec(upper);
        if (rabMatch) {
          var rabStart = rabMatch[1];
          var rabEnd = rabMatch[3] || '';
          var rabText = '雨在本小时 ' + rabStart + ' 分开始';
          if (rabEnd) {
            rabText += '，在本小时 ' + rabEnd + ' 分结束';
          }
          remarkItems.push({ label: '降水时段', value: rabText });
        } else {
          remarkItems.push({ label: '降水时段', value: t });
        }
        consumed = true;
        continue;
      }

      // RMK：降雪开始/结束时间（SNBhhmmEyyBzz 等）
      if (inRemarks && /^SNB\d{4}/.test(upper)) {
        var snbBody = upper.substring(3);
        var snbHour = snbBody.substring(0, 2);
        var snbMin = snbBody.substring(2, 4);
        var snbRest = snbBody.substring(4);
        var snbText = '降雪在本小时 ' + snbHour + ':' + snbMin + ' 分开始';
        var snbEndMatch = /E(\d{2})/.exec(snbRest);
        if (snbEndMatch) {
          snbText += '，在本小时 ' + snbEndMatch[1] + ' 分结束';
        }
        var snbReBeginMatch = /B(\d{2})/.exec(snbRest);
        if (snbReBeginMatch) {
          snbText += '，并在本小时 ' + snbReBeginMatch[1] + ' 分再次开始';
        }
        remarkItems.push({ label: '降雪时段', value: upper + '（' + snbText + '）' });
        consumed = true;
        continue;
      }

      // RMK：风向突变（WIND SHIFT 30 FROPA 等）
      if (inRemarks && upper === 'WIND' && (tokens[i + 1] || '').toUpperCase() === 'SHIFT') {
        var shiftMinuteToken = tokens[i + 2] || '';
        var shiftMinuteMatch = /^(\d{2})$/.exec(shiftMinuteToken);
        var shiftMinute = shiftMinuteMatch ? shiftMinuteMatch[1] : '';
        var shiftReasonParts = [];
        var sj = i + 3;
        while (sj < tokens.length) {
          var sNext = tokens[sj] || '';
          var sUp = sNext.toUpperCase();
          if (sUp === 'RMK' || sUp === 'RMKS') break;
          if (/^RAB\d{2}(E\d{2})?$/.test(sUp)) break;
          if (sUp === 'PCPN') break;
          if (PATTERNS.slp && PATTERNS.slp.test(sUp)) break;
          if (PATTERNS.qnh && PATTERNS.qnh.test(sUp)) break;
          if (PATTERNS.altimeterInch && PATTERNS.altimeterInch.test(sUp)) break;
          shiftReasonParts.push(sNext);
          sj++;
        }
        var shiftText = '风向发生显著变化';
        if (shiftMinute) {
          shiftText += '，发生在本小时 ' + shiftMinute + ' 分';
        }
        var shiftReason = shiftReasonParts.join(' ');
        if (shiftReason) {
          shiftText += '（原因：' + shiftReason + '）';
        }
        remarkItems.push({ label: '风向突变', value: shiftText });
        i = sj - 1;
        consumed = true;
        continue;
      }

      // RMK：局部能见度低于某值（VIS LWR THAN 1/4SM）
      if (inRemarks && upper === 'VIS' && (tokens[i + 1] || '').toUpperCase() === 'LWR' && (tokens[i + 2] || '').toUpperCase() === 'THAN') {
        var visToken = tokens[i + 3] || '';
        var visDesc = visToken ? formatVisibilityText(visToken) : '';
        if (!visDesc) visDesc = visToken;
        var visText = '局部能见度低于 ' + (visDesc || visToken || '');
        remarkItems.push({ label: '能见度提示', value: visText });
        i = i + 3;
        consumed = true;
        continue;
      }

      // RMK：3/6 小时降水量编码 6RRRR 或 6////
      if (inRemarks && /^6(\d{4}|\/\/\/\/)$/.test(upper)) {
        var sixText = upper;
        if (upper === '6////') {
          sixText += '（过去 3 或 6 小时累计降水量数据缺失）';
        } else {
          var sixDigits = upper.substring(1);
          var sixVal = parseInt(sixDigits, 10);
          if (!isNaN(sixVal)) {
            if (sixDigits === '0000') {
              sixText += '（过去 3 或 6 小时累计降水量为微量，小于 0.01 英寸）';
            } else {
              sixText += '（过去 3 或 6 小时累计降水量约 ' + (sixVal / 100).toFixed(2) + ' 英寸）';
            }
          }
        }
        remarkItems.push({ label: '累计降水量', value: sixText });
        consumed = true;
        continue;
      }

      // RMK：云型统计编码 8/6//（低/中/高云型摘要）
      if (inRemarks && /^8\/[0-9\/]{3}$/.test(upper)) {
        var lowCode = upper.charAt(2);
        var midCode = upper.charAt(3);
        var highCode = upper.charAt(4);
        var lowMap = {
          '0': '无显著低层云',
          '1': '小积云或淡碎积云（良好天气）',
          '2': '中等/浓积云或非恶劣天气的碎积云',
          '3': '积雨云',
          '4': '层云或层云碎片在其他云下',
          '5': '恶劣天气的层云碎片或积云碎片',
          '6': '由积云扩展成的层积云',
          '7': '非由积云扩展成的层积云',
          '8': '积云与层积云，积云未明显发展',
          '9': '积雨云（常伴有其他低云）'
        };
        var lowText = /[0-9]/.test(lowCode)
          ? '低层云型代码 ' + lowCode + '：' + (lowMap[lowCode] || '低层云型')
          : '低层云型未报';
        var midText = midCode === '/' ? '中层云型缺报' : ('中层云型代码 ' + midCode);
        var highText = highCode === '/' ? '高层云型缺报' : ('高层云型代码 ' + highCode);
        var eightText = upper + '（' + lowText + '；' + midText + '；' + highText + '）';
        remarkItems.push({ label: '云型统计', value: eightText });
        consumed = true;
        continue;
      }

      // RMK：云层细节编码（如 SC2SC3AC3）
      if (inRemarks && /^[A-Z]{2}\d[A-Z]{2}\d[A-Z]{2}\d$/.test(upper)) {
        var cloudDetail = decodeRemarkCloudLayers(upper);
        remarkItems.push({ label: '云层细节', value: cloudDetail });
        consumed = true;
        continue;
      }

      // RMK：积冰代码 I1xxx（过去一小时积冰量）
      if (inRemarks && /^I\d{4}$/.test(upper)) {
        var iMatch = /^I(\d)(\d{3})$/.exec(upper);
        if (iMatch) {
          var iPeriodCode = iMatch[1];
          var iAmountCode = iMatch[2];
          var iPeriodText = '';
          if (iPeriodCode === '1') iPeriodText = '过去一小时';
          else if (iPeriodCode === '2') iPeriodText = '过去3小时';
          else if (iPeriodCode === '3') iPeriodText = '过去6小时';
          else iPeriodText = '指定时段';

          var iAmountText;
          var iVal = parseInt(iAmountCode, 10);
          if (!isNaN(iVal)) {
            if (iAmountCode === '000') {
              iAmountText = '微量积冰（小于 0.01 英寸）';
            } else {
              iAmountText = '积冰约 ' + (iVal / 100).toFixed(2) + ' 英寸';
            }
          } else {
            iAmountText = '积冰量 ' + iAmountCode;
          }

          var iText = upper + '（' + iPeriodText + iAmountText + '）';
          remarkItems.push({ label: '积冰', value: iText });
        } else {
          remarkItems.push({ label: '积冰', value: upper });
        }
        consumed = true;
        continue;
      }

      // RMK：密度高度（DENSITY ALT -356FT）
      if (inRemarks && upper === 'DENSITY' && (tokens[i + 1] || '').toUpperCase() === 'ALT') {
        var altToken = tokens[i + 2] || '';
        var mAlt = /^(-?\d+)(FT)$/i.exec(altToken);
        var descAlt = 'DENSITY ALT ' + altToken;
        if (mAlt) {
          var ftVal = parseInt(mAlt[1], 10);
          if (!isNaN(ftVal)) {
            var mVal = Math.round(ftVal * 0.3048);
            descAlt += '（密度高度约 ' + ftVal + ' 英尺，约 ' + mVal + ' 米）';
          }
        }
        remarkItems.push({ label: '密度高度', value: descAlt });
        i = i + 2;
        consumed = true;
        continue;
      }

      // 备注中的降水量（PCPN ...）
      if (inRemarks && upper === 'PCPN') {
        var next1Raw = tokens[i + 1] || '';
        var next2Raw = tokens[i + 2] || '';
        var next1Up = next1Raw.toUpperCase();
        var next2Up = next2Raw.toUpperCase();

        // 特例：PCPN VRY LGT（过去一小时降水量极轻）
        if (next1Up === 'VRY' && next2Up === 'LGT') {
          var rawPcpn = 'PCPN VRY LGT';
          var descVry = rawPcpn + '（过去一小时降水量极轻）';
          remarkItems.push({ label: '降水量', value: descVry });
          // 消费掉 VRY 和 LGT
          i = i + 2;
          consumed = true;
          continue;
        }

        var amountToken = next1Raw;
        var amountMatch = /^([0-9]+(?:\.[0-9]+)?)(MM|IN)$/i.exec(amountToken);
        var amountText = '';
        if (amountMatch) {
          var val = parseFloat(amountMatch[1]);
          var unit = amountMatch[2].toUpperCase();
          if (!isNaN(val)) {
            if (unit === 'MM') {
              amountText = val + ' 毫米';
            } else if (unit === 'IN') {
              amountText = val + ' 英寸';
            }
          }
        }
        if (!amountText && amountToken) {
          amountText = amountToken;
        }

        var periodParts = [];
        var j = i + 2;
        while (j < tokens.length) {
          var next = tokens[j] || '';
          var nextUpper = next.toUpperCase();
          // 避免吞掉后续的 SLP/QNH/高度表设定等要素
          if (PATTERNS.slp && PATTERNS.slp.test(nextUpper)) break;
          if (PATTERNS.qnh && PATTERNS.qnh.test(nextUpper)) break;
          if (PATTERNS.altimeterInch && PATTERNS.altimeterInch.test(nextUpper)) break;
          if (PATTERNS.wind && PATTERNS.wind.test(nextUpper)) break;
          if (PATTERNS.tempDew && PATTERNS.tempDew.test(nextUpper)) break;
          if (nextUpper === 'RMK' || nextUpper === 'RMKS') break;
          periodParts.push(next);
          j++;
        }

        var periodText = periodParts.join(' ');
        var desc = '';
        if (amountText) {
          desc = '过去一小时降水量 ' + amountText;
        } else {
          desc = '过去一小时降水量（' + [amountToken].concat(periodParts).join(' ') + '）';
        }
        if (periodText) {
          desc += '（' + periodText + '）';
        }
        remarkItems.push({ label: '降水量', value: desc });

        // 跳过已消费的 PCPN 数值与时间描述
        i = j - 1;
        consumed = true;
        continue;
      }

      // RMK：FG DSIPTG VRBL CONDS（雾正在消散，条件多变）
      if (inRemarks && upper === 'FG' && (tokens[i + 1] || '').toUpperCase() === 'DSIPTG') {
        var hasVrblConds = (tokens[i + 2] || '').toUpperCase() === 'VRBL' && (tokens[i + 3] || '').toUpperCase() === 'CONDS';
        var fgRawParts = [t];
        if (tokens[i + 1]) fgRawParts.push(tokens[i + 1]);
        if (tokens[i + 2]) fgRawParts.push(tokens[i + 2]);
        if (tokens[i + 3]) fgRawParts.push(tokens[i + 3]);
        var fgRaw = fgRawParts.join(' ');
        var fgDesc = hasVrblConds
          ? fgRaw + '（雾正在消散，机场天气条件多变）'
          : fgRaw + '（雾正在消散）';
        remarkItems.push({ label: '天气趋势', value: fgDesc });
        if (hasVrblConds) {
          i = i + 3;
        } else {
          i = i + 1;
        }
        consumed = true;
        continue;
      }

      if (!wind && PATTERNS.wind.test(upper)) { wind = t; continue; }
      if (!windVar && PATTERNS.windVar && PATTERNS.windVar.test(upper)) { windVar = t; continue; }
      if (!visibility && (upper === 'CAVOK' || PATTERNS.visibility.test(upper) || (PATTERNS.visibilitySm && PATTERNS.visibilitySm.test(upper)))) {
        visibility = t;
        if (upper === 'CAVOK') clouds.push('CAVOK');
        continue;
      }

      // 跑道状况（欧洲摩擦系数（RODEX）），优先于 RVR 解析
      if (upper.charAt(0) === 'R') {
        var rodexTextMain = decodeRodexGroupToken(upper);
        if (rodexTextMain) {
          runwayStates.push(rodexTextMain);
          consumed = true;
          continue;
        }
      }

      if (PATTERNS.rvr.test(upper)) { rvrList.push(t); consumed = true; continue; }
      if (!tempDew && PATTERNS.tempDew.test(upper)) { tempDew = t; consumed = true; continue; }
      if (!qnh && PATTERNS.qnh.test(upper)) { qnh = t; consumed = true; continue; }
      if (!qfe && PATTERNS.qfe && PATTERNS.qfe.test(upper)) { qfe = t; consumed = true; continue; }
      if (!altimeterInch && PATTERNS.altimeterInch && PATTERNS.altimeterInch.test(upper)) { altimeterInch = t; consumed = true; continue; }
      if (!slp && PATTERNS.slp && PATTERNS.slp.test(upper)) { slp = t; consumed = true; continue; }
      if (PATTERNS.weather.test(upper)) { weather.push(upper); consumed = true; continue; }
      if (PATTERNS.cloud.test(upper)) { clouds.push(upper); consumed = true; continue; }
      if (upper === 'NOSIG') { trendNosig = '无显著变化（2小时内预计无显著天气变化）'; consumed = true; continue; }

      // RMK 段内未被任何规则识别的 token，作为原文备注保留
      if (inRemarks && !consumed && t) {
        remarkRawTokens.push(t);
      }
    }

    // 若备注中仍有未被结构化解析的 RMK 文本，则以原文形式一并展示
    if (remarkRawTokens.length) {
      var rawRemarkText = remarkRawTokens.join(' ');
      remarkItems.push({ label: '备注原文', value: rawRemarkText });
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

    var basicItems = [
      { label: '报文类型', value: typeLabel },
      { label: '机场', value: stationDisplay || '-' },
      { label: '观测时间', value: timeText || '-' }
    ];
    if (isCorrection) {
      basicItems.push({ label: '更正标记', value: 'COR：更正报文，替代之前发布的报文' });
    }

    var sections = [
      { id: 'basic', icon: '📍', title: '基本信息', items: basicItems },
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
    } else if (trendRaw) {
      var trendItems = buildMetarTrendItemsFromRaw(trendRaw, this);
      if (!trendItems || !trendItems.length) {
        trendItems = [{ label: '趋势组', value: trendRaw }];
      }
      sections.push({ id: 'trend', icon: '➡️', title: '趋势预报', items: trendItems });
    }

    if (remarkItems && remarkItems.length) {
      sections.push({ id: 'remarks', icon: '📝', title: '备注信息', items: remarkItems });
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
    } else if (kind === 'FC') {
      // FC = 中国民航短期机场预报（9小时有效期）
      type = 'FC';
      typeLabel = 'FC(短期机场预报)';
      idx = 1; // 跳过 FC 标识符
    } else if (kind === 'FT') {
      // FT = 中国民航机场预报（24小时有效期）
      type = 'FT';
      typeLabel = 'FT(机场预报)';
      idx = 1; // 跳过 FT 标识符
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

    var station = '';
    var stationDisplay = '';
    var issueTime = '';
    var issueText = '';

    // FC/FT 报文没有机场代码，发布时间直接跟在 FC/FT 后面
    if (kind === 'FC' || kind === 'FT') {
      issueTime = tokens[idx] || '';
      if (PATTERNS.time.test(issueTime)) {
        var dayIssue = issueTime.substring(0, 2);
        var hourIssue = issueTime.substring(2, 4);
        var minIssue = issueTime.substring(4, 6);
        issueText = formatUtcBeijingTime(dayIssue, hourIssue, minIssue);
        idx++;
      }
    } else {
      station = tokens[idx] || '';
      idx++;
      stationDisplay = getAirportDisplayName(station);

      issueTime = tokens[idx] || '';
      if (PATTERNS.time.test(issueTime)) {
        var dayIssue = issueTime.substring(0, 2);
        var hourIssue = issueTime.substring(2, 4);
        var minIssue = issueTime.substring(4, 6);
        issueText = formatUtcBeijingTime(dayIssue, hourIssue, minIssue);
        idx++;
      }
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
        { label: '机场', value: stationDisplay || station || '-' },
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

    var summary = (stationDisplay ? stationDisplay + ' 机场' : (station ? station + ' 机场' : '')) + ' 机场预报（TAF），有效期：' + (validText || '未解析');
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
