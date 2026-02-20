#!/usr/bin/env node
/**
 * merge-airports.js
 *
 * 合并现有 airportdata.js（含中文名）与 mwgg/Airports 数据（全球 29k+）,
 * 产出供 R2 上传的 JSON 文件。
 *
 * 合并策略：
 *   1. 保留现有 7,405 个机场，补充 tz / city / state 字段
 *   2. 从新数据中追加有 IATA 代码且现有数据中不存在的机场
 *   3. 不合并无 IATA 的小型/私人机场（对航线飞行员无用）
 *
 * 用法：
 *   node scripts/merge-airports.js                     # 使用本地 airports.json
 *   node scripts/merge-airports.js --download          # 从 GitHub 下载最新数据后合并
 *
 * 输出：
 *   scripts/output/airports-merged.json   — R2 上传用
 *   控制台打印合并统计
 */

var fs = require('fs');
var path = require('path');
var https = require('https');

// ---------- 路径 ----------
var ROOT = path.resolve(__dirname, '..');
var EXISTING_PATH = path.join(ROOT, 'miniprogram', 'packageC', 'airportdata.js');
var NEW_PATH = path.join(ROOT, 'airports.json');
var OUTPUT_DIR = path.join(__dirname, 'output');
var OUTPUT_PATH = path.join(OUTPUT_DIR, 'airports-merged.json');

var GITHUB_RAW_URL = 'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json';

// ---------- 参数解析 ----------
var shouldDownload = process.argv.indexOf('--download') !== -1;

// ---------- 国家代码 → 中文名映射（常见航线国家） ----------
var COUNTRY_ZH = {
  'US': '美国', 'CN': '中国', 'JP': '日本', 'KR': '韩国',
  'TH': '泰国', 'VN': '越南', 'SG': '新加坡', 'MY': '马来西亚',
  'ID': '印度尼西亚', 'PH': '菲律宾', 'IN': '印度', 'AU': '澳大利亚',
  'NZ': '新西兰', 'GB': '英国', 'FR': '法国', 'DE': '德国',
  'IT': '意大利', 'ES': '西班牙', 'PT': '葡萄牙', 'NL': '荷兰',
  'BE': '比利时', 'CH': '瑞士', 'AT': '奥地利', 'SE': '瑞典',
  'NO': '挪威', 'DK': '丹麦', 'FI': '芬兰', 'IE': '爱尔兰',
  'RU': '俄罗斯', 'TR': '土耳其', 'AE': '阿联酋', 'SA': '沙特阿拉伯',
  'QA': '卡塔尔', 'EG': '埃及', 'ZA': '南非', 'KE': '肯尼亚',
  'ET': '埃塞俄比亚', 'NG': '尼日利亚', 'BR': '巴西', 'MX': '墨西哥',
  'CA': '加拿大', 'AR': '阿根廷', 'CL': '智利', 'PE': '秘鲁',
  'CO': '哥伦比亚', 'IL': '以色列', 'PK': '巴基斯坦', 'BD': '孟加拉国',
  'LK': '斯里兰卡', 'MM': '缅甸', 'KH': '柬埔寨', 'LA': '老挝',
  'NP': '尼泊尔', 'MN': '蒙古', 'KZ': '哈萨克斯坦', 'UZ': '乌兹别克斯坦',
  'GR': '希腊', 'PL': '波兰', 'CZ': '捷克', 'HU': '匈牙利',
  'RO': '罗马尼亚', 'HR': '克罗地亚', 'BG': '保加利亚', 'RS': '塞尔维亚',
  'UA': '乌克兰', 'BY': '白俄罗斯', 'GE': '格鲁吉亚', 'AM': '亚美尼亚',
  'AZ': '阿塞拜疆', 'TW': '中国台湾', 'HK': '中国香港', 'MO': '中国澳门',
  'FJ': '斐济', 'PG': '巴布亚新几内亚', 'MV': '马尔代夫', 'JO': '约旦',
  'LB': '黎巴嫩', 'KW': '科威特', 'BH': '巴林', 'OM': '阿曼',
  'IR': '伊朗', 'IQ': '伊拉克', 'MA': '摩洛哥', 'TN': '突尼斯',
  'DZ': '阿尔及利亚', 'LY': '利比亚', 'TZ': '坦桑尼亚', 'UG': '乌干达',
  'GH': '加纳', 'CI': '科特迪瓦', 'SN': '塞内加尔', 'CM': '喀麦隆',
  'AO': '安哥拉', 'MZ': '莫桑比克', 'PA': '巴拿马', 'CU': '古巴',
  'JM': '牙买加', 'DO': '多米尼加', 'EC': '厄瓜多尔', 'VE': '委内瑞拉',
  'BO': '玻利维亚', 'PY': '巴拉圭', 'UY': '乌拉圭', 'IS': '冰岛',
  'LU': '卢森堡', 'MT': '马耳他', 'CY': '塞浦路斯', 'SK': '斯洛伐克',
  'SI': '斯洛文尼亚', 'EE': '爱沙尼亚', 'LV': '拉脱维亚', 'LT': '立陶宛',
  'AL': '阿尔巴尼亚', 'MK': '北马其顿', 'ME': '黑山', 'BA': '波黑',
  'XK': '科索沃', 'MD': '摩尔多瓦'
};

// ---------- 下载函数 ----------
function downloadFile(url, destPath) {
  return new Promise(function(resolve, reject) {
    console.log('下载: ' + url);
    var file = fs.createWriteStream(destPath);
    https.get(url, function(response) {
      // 处理重定向
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath).then(resolve, reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error('HTTP ' + response.statusCode));
      }
      response.pipe(file);
      file.on('finish', function() {
        file.close();
        var sizeMB = (fs.statSync(destPath).size / 1024 / 1024).toFixed(2);
        console.log('下载完成: ' + sizeMB + ' MB -> ' + destPath);
        resolve();
      });
    }).on('error', function(err) {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

// ---------- 合并函数 ----------
function merge() {
  console.log('加载现有机场数据...');
  var existing = require(EXISTING_PATH);
  console.log('  现有数据: ' + existing.length + ' 个机场');

  console.log('加载新机场数据...');
  var newData = JSON.parse(fs.readFileSync(NEW_PATH, 'utf8'));
  var newKeys = Object.keys(newData);
  console.log('  新数据: ' + newKeys.length + ' 个机场');

  // 建立现有数据索引
  var existingMap = {};
  existing.forEach(function(a) {
    existingMap[a.ICAOCode] = a;
  });

  var merged = [];
  var stats = {
    kept: 0,
    enriched: 0,
    added: 0,
    skippedNoIata: 0,
    onlyExisting: 0
  };

  // 第一步：处理现有机场 — 保留中文名，从新数据补充 tz/city/state
  existing.forEach(function(airport) {
    var enriched = {
      ICAOCode: airport.ICAOCode,
      IATACode: airport.IATACode || '',
      ShortName: airport.ShortName || '',
      CountryName: airport.CountryName || '',
      EnglishName: airport.EnglishName || '',
      Latitude: airport.Latitude,
      Longitude: airport.Longitude,
      Elevation: airport.Elevation
    };

    var newEntry = newData[airport.ICAOCode];
    if (newEntry) {
      if (newEntry.tz) enriched.tz = newEntry.tz;
      if (newEntry.city) enriched.city = newEntry.city;
      if (newEntry.state) enriched.state = newEntry.state;
      stats.enriched++;
    } else {
      stats.onlyExisting++;
    }

    stats.kept++;
    merged.push(enriched);
  });

  // 第二步：从新数据追加有 IATA 且现有数据中没有的机场
  newKeys.forEach(function(icao) {
    if (existingMap[icao]) return;

    var entry = newData[icao];
    if (!entry.iata) {
      stats.skippedNoIata++;
      return;
    }

    merged.push({
      ICAOCode: entry.icao,
      IATACode: entry.iata,
      ShortName: entry.city || entry.name || '',
      CountryName: COUNTRY_ZH[entry.country] || '',
      EnglishName: entry.name || '',
      Latitude: entry.lat,
      Longitude: entry.lon,
      Elevation: entry.elevation,
      tz: entry.tz || '',
      city: entry.city || '',
      state: entry.state || ''
    });
    stats.added++;
  });

  // 按 ICAO 排序
  merged.sort(function(a, b) {
    return a.ICAOCode < b.ICAOCode ? -1 : a.ICAOCode > b.ICAOCode ? 1 : 0;
  });

  // 输出
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  var jsonStr = JSON.stringify(merged);
  fs.writeFileSync(OUTPUT_PATH, jsonStr, 'utf8');

  var fileSizeMB = (Buffer.byteLength(jsonStr, 'utf8') / 1024 / 1024).toFixed(2);

  console.log('\n===== 合并统计 =====');
  console.log('保留现有机场:   ' + stats.kept);
  console.log('  其中补充新字段: ' + stats.enriched);
  console.log('  仅在现有数据:   ' + stats.onlyExisting);
  console.log('新增机场(有IATA): ' + stats.added);
  console.log('跳过(无IATA):    ' + stats.skippedNoIata);
  console.log('合并总数:        ' + merged.length);
  console.log('输出文件:        ' + OUTPUT_PATH);
  console.log('文件大小:        ' + fileSizeMB + ' MB');
}

// ---------- 主流程 ----------
if (shouldDownload) {
  downloadFile(GITHUB_RAW_URL, NEW_PATH).then(function() {
    merge();
  }).catch(function(err) {
    console.error('下载失败:', err.message);
    process.exit(1);
  });
} else {
  if (!fs.existsSync(NEW_PATH)) {
    console.error('airports.json 不存在，请使用 --download 参数自动下载');
    process.exit(1);
  }
  merge();
}
