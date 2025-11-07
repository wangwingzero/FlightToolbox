/**
 * 缓存编排器
 *
 * 统一处理音频与绕机图片的清理 / 补齐逻辑，供“我的首页”一键操作使用。
 *
 * 设计原则：
 * 1. 离线优先：确保资源写入 wx.env.USER_DATA_PATH，可在飞行模式下使用
 * 2. 环境检测：开发者工具环境跳过真实读写，避免误判
 * 3. 进度回调：外部可监听操作进度，给用户友好反馈
 * 4. 容错优先：任何一步失败不会阻塞整体流程，最终返回详细报告
 */

var AudioCacheManager = require('./audio-cache-manager.js');
var audioConfigModule = require('./audio-config.js');
var WalkaroundPreloadGuide = require('./walkaround-preload-guide.js');
var EnvDetector = require('./env-detector.js');
var DataHelpers = null;
var CheckItems = null;

var airlineRecordingsData = audioConfigModule.airlineRecordingsData;
var audioConfigManager = audioConfigModule.audioConfigManager;

var IMAGE_CACHE_DIR = wx.env.USER_DATA_PATH + '/walkaround-images';
var IMAGE_CACHE_INDEX_KEY = 'walkaround_image_cache_index';

function noop() {}

function callProgress(cb, payload) {
  (cb || noop)(payload);
}

function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

function loadSubpackage(packageName, options) {
  options = options || {};

  if (!packageName) {
    return Promise.resolve({ status: 'skipped', reason: 'empty' });
  }

  if (EnvDetector && EnvDetector.isDevTools && EnvDetector.isDevTools()) {
    return Promise.resolve({ status: 'skipped', reason: 'devtools' });
  }

  if (typeof wx.loadSubpackage !== 'function') {
    return Promise.resolve({ status: 'skipped', reason: 'unsupported' });
  }

  return new Promise(function(resolve, reject) {
    wx.loadSubpackage({
      name: packageName,
      success: function() {
        resolve({ status: 'success' });
      },
      fail: function(error) {
        if (options.silent) {
          resolve({ status: 'failed', error: error });
        } else {
          reject(error);
        }
      }
    });
  });
}

function sanitizeKey(input) {
  return String(input || '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function ensureWalkaroundModulesLoaded() {
  if (DataHelpers && CheckItems) {
    return;
  }

  try {
    DataHelpers = require('../packageWalkaround/utils/data-helpers.js');
  } catch (error) {
    console.error('❌ 加载绕机数据辅助模块失败:', error);
    throw error;
  }

  try {
    CheckItems = require('../packageWalkaround/data/a330/checkitems.js');
  } catch (error) {
    console.error('❌ 加载绕机检查项数据失败:', error);
    throw error;
  }
}

function ImageCacheHelper() {
  this.fs = null;
  this.cacheIndex = {};
  this.initialized = false;
  this.inflight = {};
}

ImageCacheHelper.prototype.init = function() {
  var self = this;

  if (this.initialized) {
    return Promise.resolve();
  }

  return new Promise(function(resolve) {
    try {
      self.fs = wx.getFileSystemManager();
    } catch (error) {
      console.error('❌ 初始化图片缓存文件系统失败:', error);
      self.fs = null;
      self.cacheIndex = {};
      self.initialized = true;
      resolve();
      return;
    }

    self.fs.access({
      path: IMAGE_CACHE_DIR,
      success: function() {
        finishInit();
      },
      fail: function() {
        self.fs.mkdir({
          dirPath: IMAGE_CACHE_DIR,
          recursive: true,
          success: finishInit,
          fail: function(err) {
            console.error('❌ 创建图片缓存目录失败:', err);
            finishInit();
          }
        });
      }
    });

    function finishInit() {
      try {
        self.cacheIndex = wx.getStorageSync(IMAGE_CACHE_INDEX_KEY) || {};
      } catch (error) {
        console.warn('⚠️ 读取图片缓存索引失败，使用空索引:', error);
        self.cacheIndex = {};
      }

      self.initialized = true;
      resolve();
    }
  });
};

ImageCacheHelper.prototype.persistIndex = function() {
  try {
    wx.setStorageSync(IMAGE_CACHE_INDEX_KEY, this.cacheIndex || {});
  } catch (error) {
    console.error('❌ 保存图片缓存索引失败:', error);
  }
};

ImageCacheHelper.prototype.generateFileName = function(cacheKey) {
  return sanitizeKey(cacheKey) + '.png';
};

ImageCacheHelper.prototype.ensureCached = function(cacheKey, originalSrc) {
  var self = this;

  if (!cacheKey || !originalSrc) {
    return Promise.resolve({ status: 'skipped', reason: 'invalid-params' });
  }

  if (EnvDetector && EnvDetector.isDevTools && EnvDetector.isDevTools()) {
    return Promise.resolve({ status: 'skipped', reason: 'devtools' });
  }

  return this.init().then(function() {
    if (!self.fs) {
      return { status: 'skipped', reason: 'fs-unavailable' };
    }

    var existing = self.cacheIndex[cacheKey];
    if (existing && existing.path) {
      return { status: 'cached', path: existing.path, fromCache: true };
    }

    if (self.inflight[cacheKey]) {
      return self.inflight[cacheKey];
    }

    var promise = new Promise(function(resolve, reject) {
      wx.getImageInfo({
        src: originalSrc,
        success: function(res) {
          if (!res || !res.path) {
            resolve({ status: 'skipped', reason: 'no-temp-path' });
            return;
          }

          var targetPath = IMAGE_CACHE_DIR + '/' + self.generateFileName(cacheKey);

          self.fs.copyFile({
            srcPath: res.path,
            destPath: targetPath,
            success: function() {
              var size = 0;
              self.fs.getFileInfo({
                filePath: targetPath,
                success: function(info) {
                  size = info.size || 0;
                  finalize(size);
                },
                fail: function() {
                  finalize(0);
                }
              });

              function finalize(finalSize) {
                self.cacheIndex[cacheKey] = {
                  path: targetPath,
                  timestamp: Date.now(),
                  size: finalSize
                };

                self.persistIndex();
                resolve({ status: 'cached', path: targetPath, size: finalSize, fromCache: false });
              }
            },
            fail: function(error) {
              reject(error);
            }
          });
        },
        fail: function(error) {
          reject(error);
        }
      });
    }).finally(function() {
      delete self.inflight[cacheKey];
    });

    self.inflight[cacheKey] = promise;
    return promise;
  });
};

ImageCacheHelper.prototype.clearAll = function() {
  var self = this;
  return this.init().then(function() {
    if (!self.fs) {
      self.cacheIndex = {};
      self.persistIndex();
      return { deletedCount: 0, freedSize: 0 };
    }

    return new Promise(function(resolve) {
      self.fs.readdir({
        dirPath: IMAGE_CACHE_DIR,
        success: function(res) {
          var files = res && res.files ? res.files : [];
          if (!files.length) {
            self.cacheIndex = {};
            self.persistIndex();
            resolve({ deletedCount: 0, freedSize: 0 });
            return;
          }

          var deletedCount = 0;
          var freedSize = 0;

          files.reduce(function(promise, fileName) {
            return promise.then(function() {
              var fullPath = IMAGE_CACHE_DIR + '/' + fileName;

              return new Promise(function(resDelete) {
                self.fs.getFileInfo({
                  filePath: fullPath,
                  success: function(info) {
                    freedSize += info.size || 0;
                    removeFile(fullPath, resDelete);
                  },
                  fail: function() {
                    removeFile(fullPath, resDelete);
                  }
                });
              });
            });
          }, Promise.resolve()).then(function() {
            self.cacheIndex = {};
            self.persistIndex();
            resolve({ deletedCount: deletedCount, freedSize: freedSize });
          }).catch(function(error) {
            console.error('❌ 清除图片缓存失败:', error);
            self.cacheIndex = {};
            self.persistIndex();
            resolve({ deletedCount: deletedCount, freedSize: freedSize, error: error });
          });

          function removeFile(path, callback) {
            self.fs.unlink({
              filePath: path,
              success: function() {
                deletedCount += 1;
                callback();
              },
              fail: function() {
                callback();
              }
            });
          }
        },
        fail: function(error) {
          if (error && error.errMsg && error.errMsg.indexOf('no such file or directory') !== -1) {
            self.cacheIndex = {};
            self.persistIndex();
            resolve({ deletedCount: 0, freedSize: 0 });
          } else {
            console.error('❌ 读取图片缓存目录失败:', error);
            self.cacheIndex = {};
            self.persistIndex();
            resolve({ deletedCount: 0, freedSize: 0, error: error });
          }
        }
      });
    });
  });
};

function buildAudioRegionMap() {
  var airports = audioConfigManager.getAirports ? audioConfigManager.getAirports() : (airlineRecordingsData.airports || []);
  var regionMap = {};

  airports.forEach(function(airport) {
    var regionId = airport.regionId || airport.id;
    if (!regionId) {
      return;
    }

    if (!regionMap[regionId]) {
      regionMap[regionId] = {
        regionId: regionId,
        packageName: airport.packageName,
        audioPath: airport.audioPath || ('/' + airport.packageName + '/'),
        clips: []
      };
    }

    if (Array.isArray(airport.clips)) {
      var decorated = airport.clips.map(function(clip) {
        return Object.assign({}, clip, {
          __airportId: airport.id
        });
      });
      regionMap[regionId].clips = regionMap[regionId].clips.concat(decorated);
    }
  });

  return regionMap;
}

function groupClipsByLabel(clips) {
  var categoryMap = new Map();

  clips.forEach(function(clip) {
    var label = clip && clip.label ? clip.label : '其他';
    if (!categoryMap.has(label)) {
      categoryMap.set(label, []);
    }
    categoryMap.get(label).push(clip);
  });

  return categoryMap;
}

function generateAudioCacheKey(regionId, categoryIndex) {
  return sanitizeKey(regionId) + '_clip_' + categoryIndex;
}

function generateImageCacheKey(areaId, originalSrc) {
  var baseKey = '';
  if (areaId) {
    baseKey += 'area' + areaId + '_';
  }
  baseKey += originalSrc || '';
  return sanitizeKey(baseKey);
}

function summarizeCacheResult(summary) {
  var audio = summary.audio || {};
  var images = summary.images || {};

  var audioText = '音频 ' + (audio.cached || 0) + '/' + (audio.total || 0);
  if (audio.failed) {
    audioText += '（失败' + audio.failed + '）';
  }

  var imageText = '图片 ' + (images.cached || 0) + '/' + (images.total || 0);
  if (images.failed) {
    imageText += '（失败' + images.failed + '）';
  }

  return audioText + '，' + imageText;
}

var cacheOrchestrator = {
  clearAllCaches: function(options) {
    options = options || {};
    var onProgress = options.onProgress;

    if (EnvDetector && EnvDetector.isDevTools && EnvDetector.isDevTools()) {
      callProgress(onProgress, { stage: 'skip', message: '开发者工具环境：跳过清理' });
      return Promise.resolve({
        status: 'skipped',
        reason: 'devtools',
        toastMessage: '开发者工具中无需清理缓存'
      });
    }

    var imageHelper = new ImageCacheHelper();

    callProgress(onProgress, { stage: 'audio-clear', message: '正在清空音频缓存' });

    var audioStatsBefore = { totalCount: 0, totalSize: 0 };

    return AudioCacheManager.initAudioCache().then(function() {
      try {
        audioStatsBefore = AudioCacheManager.getCacheStats ? AudioCacheManager.getCacheStats() : { totalCount: 0, totalSize: 0 };
      } catch (e) {
        audioStatsBefore = { totalCount: 0, totalSize: 0 };
      }

      return AudioCacheManager.clearAllCache();
    }).then(function() {
      callProgress(onProgress, { stage: 'audio-clear-done' });
      return imageHelper.clearAll();
    }).then(function(imageResult) {
      callProgress(onProgress, { stage: 'image-clear-done' });

      var summary = {
        status: 'success',
        audio: {
          deletedCount: audioStatsBefore.totalCount || 0,
          freedSize: audioStatsBefore.totalSize || 0
        },
        images: {
          deletedCount: imageResult.deletedCount || 0,
          freedSize: imageResult.freedSize || 0
        },
        toastMessage: '缓存已清空',
        modalMessage: '音频缓存和绕机图片缓存已全部清空。'
      };

      return summary;
    }).catch(function(error) {
      console.error('❌ 清空缓存失败:', error);
      return {
        status: 'failed',
        error: error,
        toastMessage: '清空失败，请稍后重试'
      };
    });
  },

  ensureAllCaches: function(options) {
    options = options || {};
    var onProgress = options.onProgress;

    if (EnvDetector && EnvDetector.isDevTools && EnvDetector.isDevTools()) {
      callProgress(onProgress, { stage: 'skip', message: '开发者工具环境：跳过补齐' });
      return Promise.resolve({
        status: 'skipped',
        reason: 'devtools',
        toastMessage: '请在真机上执行补齐缓存'
      });
    }

    var imageHelper = new ImageCacheHelper();
    var audioSummary = { total: 0, cached: 0, failed: 0 };
    var imageSummary = { total: 0, cached: 0, failed: 0 };
    var errors = [];

    function handleAudioRegion(regionEntry) {
      var categoryMap = groupClipsByLabel(regionEntry.clips || []);
      var sequence = Promise.resolve();

      categoryMap.forEach(function(categoryClips, label) {
        sequence = sequence.then(function() {
          return categoryClips.reduce(function(promise, clip, index) {
            return promise.then(function() {
              audioSummary.total += 1;
              var cacheKey = generateAudioCacheKey(regionEntry.regionId, index);
              var audioPath = (regionEntry.audioPath || '') + (clip.mp3_file || '');

              if (!clip || !clip.mp3_file) {
                audioSummary.failed += 1;
                errors.push({ type: 'audio', regionId: regionEntry.regionId, label: label, reason: 'missing-file', cacheKey: cacheKey });
                return Promise.resolve();
              }

              callProgress(onProgress, {
                stage: 'audio-cache',
                regionId: regionEntry.regionId,
                label: label,
                index: index + 1,
                total: categoryClips.length
              });

              return AudioCacheManager.ensureAudioCached(cacheKey, audioPath).then(function() {
                audioSummary.cached += 1;
              }).catch(function(error) {
                audioSummary.failed += 1;
                errors.push({ type: 'audio', regionId: regionEntry.regionId, label: label, cacheKey: cacheKey, error: error });
              });
            });
          }, Promise.resolve());
        });
      });

      return sequence;
    }

    function ensureAudioCaches() {
      var regionMap = buildAudioRegionMap();
      var regionIds = Object.keys(regionMap);

      return regionIds.reduce(function(promise, regionId) {
        return promise.then(function() {
          var regionEntry = regionMap[regionId];

          if (!regionEntry || !regionEntry.clips.length) {
            return;
          }

          callProgress(onProgress, {
            stage: 'audio-package',
            regionId: regionId,
            packageName: regionEntry.packageName
          });

          return loadSubpackage(regionEntry.packageName, { silent: true }).then(function() {
            return delay(200);
          }).then(function() {
            return handleAudioRegion(regionEntry);
          }).catch(function(error) {
            audioSummary.total += regionEntry.clips.length;
            audioSummary.failed += regionEntry.clips.length;
            errors.push({ type: 'audio-loader', regionId: regionId, error: error });
          });
        });
      }, Promise.resolve());
    }

    function ensureImageCaches() {
      var preloadGuide = new WalkaroundPreloadGuide();
      var mappingKeys = Object.keys(preloadGuide.areaPackageMapping || {});

      return mappingKeys.reduce(function(promise, rangeKey) {
        return promise.then(function() {
          var mapping = preloadGuide.areaPackageMapping[rangeKey];
          if (!mapping) {
            return;
          }

          callProgress(onProgress, {
            stage: 'image-package',
            rangeKey: rangeKey,
            packageName: mapping.packageName
          });

          return loadSubpackage(mapping.packageName, { silent: true }).then(function() {
            return delay(200);
          }).then(function() {
            ensureWalkaroundModulesLoaded();
            return cacheAreaRange(mapping.areaRange || []);
          }).catch(function(error) {
            imageSummary.total += (mapping.areaRange || []).length;
            imageSummary.failed += (mapping.areaRange || []).length;
            errors.push({ type: 'image-loader', rangeKey: rangeKey, error: error });
          });
        });
      }, Promise.resolve());
    }

    function cacheAreaRange(areaRange) {
      if (!DataHelpers || !CheckItems) {
        return Promise.reject(new Error('walkaround-modules-not-loaded'));
      }

      return areaRange.reduce(function(areaPromise, areaId) {
        return areaPromise.then(function() {
          var areaItems = CheckItems.checkItems.filter(function(item) {
            return item.areaId === areaId;
          });

          return areaItems.reduce(function(itemPromise, item) {
            return itemPromise.then(function() {
              imageSummary.total += 1;
              var originalSrc = DataHelpers.getImagePathByArea(areaId) + item.componentId + '.png';
              var cacheKey = generateImageCacheKey(areaId, originalSrc);

              callProgress(onProgress, {
                stage: 'image-cache',
                areaId: areaId,
                componentId: item.componentId
              });

              return imageHelper.ensureCached(cacheKey, originalSrc).then(function(result) {
                if (result && result.status === 'cached') {
                  imageSummary.cached += 1;
                } else {
                  imageSummary.failed += 1;
                }
              }).catch(function(error) {
                imageSummary.failed += 1;
                errors.push({ type: 'image', areaId: areaId, componentId: item.componentId, error: error });
              });
            });
          }, Promise.resolve());
        });
      }, Promise.resolve());
    }

    callProgress(onProgress, { stage: 'audio-init', message: '初始化音频缓存系统' });

    return AudioCacheManager.initAudioCache().then(function() {
      callProgress(onProgress, { stage: 'audio-start', message: '正在补齐航线录音' });
      return ensureAudioCaches();
    }).then(function() {
      callProgress(onProgress, { stage: 'image-start', message: '正在补齐绕机图片' });
      return ensureImageCaches();
    }).then(function() {
      var summary = {
        status: errors.length ? 'partial' : 'success',
        audio: audioSummary,
        images: imageSummary,
        errors: errors,
        toastMessage: errors.length ? '部分资源补齐失败' : '缓存已补齐',
        modalMessage: summarizeCacheResult({ audio: audioSummary, images: imageSummary })
      };

      return summary;
    }).catch(function(error) {
      console.error('❌ 补齐缓存失败:', error);
      errors.push({ type: 'general', error: error });
      return {
        status: 'failed',
        audio: audioSummary,
        images: imageSummary,
        errors: errors,
        toastMessage: '补齐失败，请稍后重试'
      };
    });
  }
};

module.exports = cacheOrchestrator;

