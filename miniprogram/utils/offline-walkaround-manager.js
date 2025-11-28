var ImageCacheManager = require('./image-cache-manager.js');
var WalkaroundPreloadGuide = require('./walkaround-preload-guide.js');
var EnvDetector = require('./env-detector.js');
var WalkaroundImageLibraryVersion = require('./walkaround-image-library-version.js');

function getStats() {
  try {
    var stats = ImageCacheManager.getCacheStats() || {};
    return {
      totalCount: stats.totalCount || 0,
      totalSizeMB: stats.totalSizeMB || '0.00',
      maxSizeMB: stats.maxSizeMB || '0',
      totalSize: stats.totalSize || 0
    };
  } catch (e) {
    console.error('[offline-walkaround-manager] getStats failed', e);
    return {
      totalCount: 0,
      totalSizeMB: '0.00',
      maxSizeMB: '0',
      totalSize: 0
    };
  }
}

function getNetworkType() {
  return new Promise(function(resolve) {
    if (!wx || typeof wx.getNetworkType !== 'function') {
      resolve('unknown');
      return;
    }
    wx.getNetworkType({
      success: function(res) {
        resolve((res && res.networkType) || 'unknown');
      },
      fail: function() {
        resolve('unknown');
      }
    });
  });
}

function preloadAllImagePackages(onMessage) {
  return new Promise(function(resolve) {
    if (!wx || typeof wx.loadSubpackage !== 'function') {
      resolve({ successPackages: [], failedPackages: [] });
      return;
    }

    var guide = new WalkaroundPreloadGuide();
    var mapping = guide.areaPackageMapping || {};
    var packageNameMap = {};
    for (var key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        var pkgName = mapping[key].packageName;
        if (pkgName) {
          packageNameMap[pkgName] = true;
        }
      }
    }

    var names = Object.keys(packageNameMap);
    if (!names.length) {
      resolve({ successPackages: [], failedPackages: [] });
      return;
    }

    var success = [];
    var failed = [];
    var index = 0;

    function next() {
      if (index >= names.length) {
        resolve({ successPackages: success, failedPackages: failed });
        return;
      }
      var name = names[index++];
      if (typeof onMessage === 'function') {
        onMessage('正在加载图片分包 ' + name);
      }
      wx.loadSubpackage({
        name: name,
        success: function() {
          success.push(name);
          next();
        },
        fail: function(err) {
          console.error('[offline-walkaround-manager] loadSubpackage fail', name, err);
          failed.push(name);
          next();
        }
      });
    }

    next();
  });
}

function preloadWalkaroundDataPackage(onMessage) {
  return new Promise(function(resolve) {
    if (!wx || typeof wx.loadSubpackage !== 'function') {
      resolve(false);
      return;
    }

    wx.loadSubpackage({
      name: 'walkaroundPackage',
      success: function() {
        if (typeof onMessage === 'function') {
          onMessage('绕机检查数据分包加载完成');
        }
        resolve(true);
      },
      fail: function(err) {
        console.error('[offline-walkaround-manager] loadSubpackage fail', 'walkaroundPackage', err);
        resolve(false);
      }
    });
  });
}

function buildAllImageTasks(onMessage, checkItemsModule, imagePathMapperModule) {
  var list = [];
  var seen = {};
  try {
    var items = (checkItemsModule && checkItemsModule.checkItems) || [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item) {
        continue;
      }
      var areaId = item.areaId;
      var componentId = item.componentId;
      if (!areaId || !componentId) {
        continue;
      }
      var mapper = imagePathMapperModule;
      if (!mapper || typeof mapper.getImagePath !== 'function') {
        continue;
      }
      var src = mapper.getImagePath(componentId, areaId);
      if (!src) {
        continue;
      }
      var libraryVersion = (WalkaroundImageLibraryVersion && WalkaroundImageLibraryVersion.WALKAROUND_IMAGE_LIBRARY_VERSION) || 'v1';
      var cacheKey = libraryVersion + '_a330_area' + areaId + '_' + componentId;
      if (seen[cacheKey]) {
        continue;
      }
      seen[cacheKey] = true;
      list.push({
        areaId: areaId,
        componentId: componentId,
        src: src,
        cacheKey: cacheKey
      });
    }
  } catch (e) {
    console.error('[offline-walkaround-manager] build tasks error', e);
  }
  if (typeof onMessage === 'function') {
    onMessage('已收集绕机检查图片 ' + list.length + ' 张');
  }
  return list;
}

function startFullOffline(options) {
  options = options || {};
  var onProgress = typeof options.onProgress === 'function' ? options.onProgress : function() {};
  var onMessage = typeof options.onMessage === 'function' ? options.onMessage : function() {};

  return new Promise(function(resolve, reject) {
    getNetworkType()
      .then(function(networkType) {
        onMessage('当前网络环境: ' + networkType);
        return preloadAllImagePackages(onMessage);
      })
      .then(function(preloadResult) {
        onMessage('图片分包加载完成，成功 ' + preloadResult.successPackages.length + ' 个，失败 ' + preloadResult.failedPackages.length + ' 个');
        return ImageCacheManager.initImageCache();
      })
      .then(function() {
        return preloadWalkaroundDataPackage(onMessage);
      })
      .then(function() {
        var checkItemsModule = null;
        var imagePathMapperModule = null;
        if (!EnvDetector.isDevTools()) {
          try {
            checkItemsModule = require('../packageWalkaround/data/a330/checkitems.js');
          } catch (e) {
            console.error('[offline-walkaround-manager] require checkitems failed', e);
          }
          try {
            imagePathMapperModule = require('../packageWalkaround/utils/image-path-mapper.js');
          } catch (e2) {
            console.error('[offline-walkaround-manager] require image-path-mapper failed', e2);
          }
        }

        var tasks = buildAllImageTasks(onMessage, checkItemsModule, imagePathMapperModule);
        var total = tasks.length;
        var done = 0;
        var failed = 0;
        var failedByArea = {};

        if (!total) {
          resolve({
            total: 0,
            success: 0,
            failed: 0,
            failedByArea: failedByArea
          });
          return;
        }

        onProgress({
          done: 0,
          total: total,
          percent: 0
        });

        function processTask(index) {
          if (index >= total) {
            resolve({
              total: total,
              success: total - failed,
              failed: failed,
              failedByArea: failedByArea
            });
            return;
          }

          var task = tasks[index];

          ImageCacheManager.ensureImageCached(task.cacheKey, task.src)
            .then(function() {
              done++;
              var percent = Math.round((done * 100) / total);
              onProgress({
                done: done,
                total: total,
                percent: percent,
                areaId: task.areaId,
                componentId: task.componentId
              });
              processTask(index + 1);
            })
            .catch(function(err) {
              console.error('[offline-walkaround-manager] ensureImageCached fail', task, err);
              done++;
              failed++;
              failedByArea[task.areaId] = (failedByArea[task.areaId] || 0) + 1;
              var percent = Math.round((done * 100) / total);
              onMessage('缓存失败: 区域 ' + task.areaId + ' 组件 ' + task.componentId);
              onProgress({
                done: done,
                total: total,
                percent: percent,
                areaId: task.areaId,
                componentId: task.componentId
              });
              processTask(index + 1);
            });
        }

        processTask(0);
      })
      .catch(function(err) {
        console.error('[offline-walkaround-manager] startFullOffline error', err);
        reject(err);
      });
  });
}

module.exports = {
  getStats: getStats,
  startFullOffline: startFullOffline
};
