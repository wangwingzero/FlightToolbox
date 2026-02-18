var audioConfig = require('./audio-config.js');
var AudioCacheKey = require('./audio-cache-key.js');
var R2Config = require('./r2-config.js');

var audioConfigManager = audioConfig && audioConfig.audioConfigManager;

function getAllAirports() {
  if (!audioConfigManager || typeof audioConfigManager.getAirports !== 'function') {
    return [];
  }
  return audioConfigManager.getAirports() || [];
}

function getAirportsByIds(airportIds) {
  if (!airportIds || !airportIds.length) {
    return [];
  }
  var all = getAllAirports();
  var map = {};
  all.forEach(function(airport) {
    if (airport && airport.id) {
      map[airport.id] = airport;
    }
  });
  return airportIds.map(function(id) {
    return map[id];
  }).filter(function(item) { return !!item; });
}

function getAirportById(airportId) {
  if (!audioConfigManager || typeof audioConfigManager.getAirportById !== 'function') {
    return null;
  }
  return audioConfigManager.getAirportById(airportId);
}

function buildOfflineTasksForAirport(airportId) {
  var tasks = [];
  if (!airportId) {
    return tasks;
  }

  var airport = getAirportById(airportId);
  if (!airport || !airport.clips || !airport.clips.length) {
    return tasks;
  }

  var regionId = airport.regionId || airport.id;
  var airportCode = airport.icao || '';
  var audioPath = airport.audioPath || '';

  var clipsByCategory = {};
  var categoryOrder = [];

  airport.clips.forEach(function(clip) {
    if (!clip) {
      return;
    }
    var category = clip.label || '其他';
    if (!clipsByCategory[category]) {
      clipsByCategory[category] = [];
      categoryOrder.push(category);
    }
    clipsByCategory[category].push(clip);
  });

  categoryOrder.forEach(function(categoryId) {
    var list = clipsByCategory[categoryId] || [];
    for (var i = 0; i < list.length; i++) {
      var clip = list[i];
      if (!clip || !clip.mp3_file) {
        continue;
      }
      var cacheKey = AudioCacheKey.generateAudioCacheKey({
        regionId: regionId,
        mp3File: clip.mp3_file,
        airportCode: airportCode,
        clipIndex: i
      });
      var originalAudioSrc;
      if (R2Config.useR2ForAudio) {
        // R2 模式：从远程下载
        var packageDir = audioPath.replace(/^\//, '').replace(/\/$/, '');
        originalAudioSrc = R2Config.getAudioUrl(packageDir, clip.mp3_file);
      } else {
        // 本地模式：使用分包路径
        originalAudioSrc = audioPath + clip.mp3_file;
      }
      tasks.push({
        airportId: airport.id,
        regionId: regionId,
        airportCode: airportCode,
        categoryId: categoryId,
        clipIndex: i,
        cacheKey: cacheKey,
        originalAudioSrc: originalAudioSrc
      });
    }
  });

  return tasks;
}

module.exports = {
  getAllAirports: getAllAirports,
  getAirportsByIds: getAirportsByIds,
  getAirportById: getAirportById,
  buildOfflineTasksForAirport: buildOfflineTasksForAirport
};
