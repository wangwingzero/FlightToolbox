var AudioCacheManager = require('../utils/audio-cache-manager.js');
var AudioPackageLoader = require('./audio-package-loader.js');
var AudioDataProvider = require('../utils/audio-data-provider.js');
var VersionManager = require('../utils/version-manager.js');

var AIRPORT_STATUS_KEY_BASE = 'flight_toolbox_offline_airports_status';
var AIRPORT_STATUS_KEY = VersionManager.getVersionedKey(AIRPORT_STATUS_KEY_BASE);

function getStats() {
  try {
    var stats = AudioCacheManager.getCacheStats() || {};
    return {
      totalCount: stats.totalCount || 0,
      totalSize: stats.totalSize || 0,
      totalSizeMB: stats.totalSizeMB || '0.00',
      maxSizeMB: stats.maxSizeMB || '0.00'
    };
  } catch (e) {
    console.error('[offline-audio-manager] getStats failed', e);
    return {
      totalCount: 0,
      totalSize: 0,
      totalSizeMB: '0.00',
      maxSizeMB: '0.00'
    };
  }
}

function loadAirportStatusMap() {
  try {
    var map = wx.getStorageSync(AIRPORT_STATUS_KEY);
    if (!map || typeof map !== 'object') {
      return {};
    }
    return map;
  } catch (e) {
    console.error('[offline-audio-manager] loadAirportStatusMap error', e);
    return {};
  }
}

function saveAirportStatusMap(map) {
  try {
    wx.setStorageSync(AIRPORT_STATUS_KEY, map || {});
  } catch (e) {
    console.error('[offline-audio-manager] saveAirportStatusMap error', e);
  }
}

function getAllAirportStatusMap() {
  return loadAirportStatusMap();
}

function getAirportStatus(airportId) {
  var map = loadAirportStatusMap();
  return map[airportId] || 'none';
}

function updateAirportStatusByResult(byAirport) {
  var map = loadAirportStatusMap();
  Object.keys(byAirport || {}).forEach(function(airportId) {
    var info = byAirport[airportId];
    if (!info) {
      return;
    }
    if (info.total > 0 && info.failed === 0) {
      map[airportId] = 'offline';
    } else if (info.success > 0 && info.failed > 0) {
      map[airportId] = 'partial';
    } else if (!info.success && info.failed > 0) {
      map[airportId] = 'none';
    }
  });
  saveAirportStatusMap(map);
}

function downloadAirportsOffline(options) {
  options = options || {};
  var airportIds = options.airportIds || [];
  var onProgress = typeof options.onProgress === 'function' ? options.onProgress : function() {};
  var onMessage = typeof options.onMessage === 'function' ? options.onMessage : function() {};

  if (!airportIds.length) {
    return Promise.resolve({ total: 0, success: 0, failed: 0, byAirport: {} });
  }

  return new Promise(function(resolve, reject) {
    try {
      var airports = AudioDataProvider.getAirportsByIds(airportIds);
      if (!airports.length) {
        resolve({ total: 0, success: 0, failed: 0, byAirport: {} });
        return;
      }

      var audioPackageLoader = new AudioPackageLoader();
      var allTasks = [];
      var regionIdSet = {};

      airports.forEach(function(airport) {
        if (!airport) {
          return;
        }
        if (airport.regionId) {
          regionIdSet[airport.regionId] = true;
        }
        var tasks = AudioDataProvider.buildOfflineTasksForAirport(airport.id);
        allTasks = allTasks.concat(tasks);
      });

      // 去重
      var seen = {};
      allTasks = allTasks.filter(function(task) {
        if (!task || !task.cacheKey || !task.originalAudioSrc) {
          return false;
        }
        if (seen[task.cacheKey]) {
          return false;
        }
        seen[task.cacheKey] = true;
        return true;
      });

      var total = allTasks.length;
      if (!total) {
        resolve({ total: 0, success: 0, failed: 0, byAirport: {} });
        return;
      }

      var regionIds = Object.keys(regionIdSet);
      var regionIndex = 0;

      function preloadNextRegion() {
        if (regionIndex >= regionIds.length) {
          processTask(0);
          return;
        }
        var regionId = regionIds[regionIndex++];
        onMessage('正在加载 ' + regionId + ' 机场音频资源');
        audioPackageLoader.loadAudioPackageOnDemand(regionId)
          .then(function() {
            preloadNextRegion();
          })
          .catch(function(err) {
            console.error('[offline-audio-manager] loadAudioPackageOnDemand fail', regionId, err);
            preloadNextRegion();
          });
      }

      var done = 0;
      var failed = 0;
      var byAirport = {};

      function processTask(index) {
        if (index >= total) {
          updateAirportStatusByResult(byAirport);
          resolve({
            total: total,
            success: total - failed,
            failed: failed,
            byAirport: byAirport
          });
          return;
        }

        var task = allTasks[index];

        AudioCacheManager.ensureAudioCached(task.cacheKey, task.originalAudioSrc)
          .then(function() {
            done++;
            var airportInfo = byAirport[task.airportId] || { total: 0, success: 0, failed: 0 };
            airportInfo.total++;
            airportInfo.success++;
            byAirport[task.airportId] = airportInfo;

            var percent = Math.round((done * 100) / total);
            onProgress({
              done: done,
              total: total,
              percent: percent,
              airportId: task.airportId,
              regionId: task.regionId,
              categoryId: task.categoryId,
              clipIndex: task.clipIndex
            });

            processTask(index + 1);
          })
          .catch(function(err) {
            console.error('[offline-audio-manager] ensureAudioCached fail', task, err);
            done++;
            failed++;
            var airportInfo = byAirport[task.airportId] || { total: 0, success: 0, failed: 0 };
            airportInfo.total++;
            airportInfo.failed++;
            byAirport[task.airportId] = airportInfo;

            var percent = Math.round((done * 100) / total);
            onProgress({
              done: done,
              total: total,
              percent: percent,
              airportId: task.airportId,
              regionId: task.regionId,
              categoryId: task.categoryId,
              clipIndex: task.clipIndex
            });

            processTask(index + 1);
          });
      }

      preloadNextRegion();
    } catch (e) {
      console.error('[offline-audio-manager] downloadAirportsOffline error', e);
      reject(e);
    }
  });
}

function clearAll() {
  return AudioCacheManager.clearAllCache().then(function() {
    try {
      wx.removeStorageSync(AIRPORT_STATUS_KEY);
    } catch (e) {
      console.error('[offline-audio-manager] clearAll removeStorage error', e);
    }
  });
}

module.exports = {
  getStats: getStats,
  getAllAirportStatusMap: getAllAirportStatusMap,
  getAirportStatus: getAirportStatus,
  downloadAirportsOffline: downloadAirportsOffline,
  clearAll: clearAll
};
