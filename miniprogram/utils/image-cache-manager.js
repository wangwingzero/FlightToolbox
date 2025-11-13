/**
 * 绕机检查图片缓存管理器
 *
 * 功能：将图片文件缓存到本地持久化存储，确保离线环境下图片可显示
 * 设计参考：航线录音音频缓存方案 (audio-cache-manager.js)
 *
 * 核心优势：
 * 1. 离线优先：图片缓存到 wx.env.USER_DATA_PATH，重启小程序后依然可用
 * 2. 自动缓存：首次加载成功后自动缓存，后续离线也能显示
 * 3. 智能兜底：分包加载失败时优先使用本地缓存
 * 4. 版本隔离：不同版本使用独立缓存，避免真机调试污染发布版本
 *
 * 使用方法：
 * 1. 页面初始化时调用 ImageCacheManager.initImageCache()
 * 2. 显示图片前调用 ImageCacheManager.getCachedImagePath(cacheKey)
 * 3. 图片加载成功后调用 ImageCacheManager.ensureImageCached(cacheKey, originalSrc)
 *
 * @author Claude
 * @date 2025-01-09
 */

var EnvDetector = require('./env-detector.js');
var VersionManager = require('./version-manager.js');

// 图片缓存目录（持久化存储路径）
var IMAGE_CACHE_DIR = wx.env.USER_DATA_PATH + '/walkaround-images';

// 🔐 缓存索引存储key - 版本隔离（2025-01-09）
var IMAGE_CACHE_INDEX_KEY_BASE = 'walkaround_image_cache_index';
var IMAGE_CACHE_INDEX_KEY = '';  // 会在初始化时设置为版本化key

/**
 * 动态获取最大缓存大小（2025-01-13改进）
 *
 * 策略：使用可用空间的20%，最多100MB
 * 原因：不同设备存储空间差异很大，动态计算更合理
 *
 * @returns {Promise<number>} 最大缓存大小（字节）
 */
function getMaxCacheSize() {
  return new Promise(function(resolve) {
    wx.getStorageInfo({
      success: function(res) {
        // 使用可用空间的20%，最多100MB
        var availableKB = res.limitSize - res.currentSize;
        var availableMB = availableKB / 1024;
        var maxMB = Math.min(availableMB * 0.2, 100);

        // 确保至少10MB（防止空间过小）
        maxMB = Math.max(maxMB, 10);

        var maxBytes = maxMB * 1024 * 1024;
        console.log('📊 动态缓存大小计算:', {
          availableMB: availableMB.toFixed(2) + 'MB',
          suggestedMB: maxMB.toFixed(2) + 'MB',
          finalBytes: maxBytes
        });

        resolve(maxBytes);
      },
      fail: function(err) {
        console.warn('⚠️ 获取存储信息失败，使用默认值100MB:', err);
        // 降级到固定值100MB
        resolve(100 * 1024 * 1024);
      }
    });
  });
}

/**
 * 图片缓存管理器构造函数
 */
function ImageCacheManager() {
  this.cacheIndex = {};           // 缓存索引 { cacheKey: { path, size, timestamp, originalSrc } }
  this.totalCacheSize = 0;        // 当前缓存总大小
  this.cachePromises = {};        // 缓存Promise管理器（防止重复缓存）
  this.cacheFs = null;            // 文件系统管理器
  this._initialized = false;      // 初始化标志
  this.MAX_CACHE_SIZE = 100 * 1024 * 1024;  // 最大缓存大小（动态设置）
}

/**
 * 初始化图片缓存系统
 *
 * 功能：
 * 1. 创建缓存目录（如果不存在）
 * 2. 加载缓存索引
 * 3. 计算当前缓存总大小
 *
 * @returns {Promise} 初始化Promise
 */
ImageCacheManager.prototype.initImageCache = function() {
  var self = this;

  // 避免重复初始化
  if (this._initialized) {
    console.log('✅ 图片缓存系统已初始化，跳过');
    return Promise.resolve();
  }

  return new Promise(function(resolve, reject) {
    try {
      // 🔍 环境检测：开发者工具环境跳过（避免误报）
      if (EnvDetector.isDevTools()) {
        console.warn('⚠️ 开发者工具环境：图片缓存功能仅在真机有效');
        self._initialized = true;
        resolve();
        return;
      }

      // 🔐 版本隔离：使用版本化缓存key
      IMAGE_CACHE_INDEX_KEY = VersionManager.getVersionedKey(IMAGE_CACHE_INDEX_KEY_BASE);
      console.log('📦 使用版本化缓存key:', IMAGE_CACHE_INDEX_KEY);

      // 获取文件系统管理器
      self.cacheFs = wx.getFileSystemManager();

      // 检查缓存目录是否存在
      self.cacheFs.access({
        path: IMAGE_CACHE_DIR,
        success: function() {
          console.log('✅ 图片缓存目录已存在');
          self._finishInit(resolve);
        },
        fail: function() {
          console.log('📁 创建图片缓存目录:', IMAGE_CACHE_DIR);
          // 创建缓存目录（recursive: true 自动创建父目录）
          self.cacheFs.mkdir({
            dirPath: IMAGE_CACHE_DIR,
            recursive: true,
            success: function() {
              console.log('✅ 图片缓存目录创建成功');
              self._finishInit(resolve);
            },
            fail: function(err) {
              console.error('❌ 创建图片缓存目录失败:', err);
              reject(err);
            }
          });
        }
      });

    } catch (error) {
      console.error('❌ 图片缓存系统初始化异常:', error);
      reject(error);
    }
  });
};

/**
 * 完成初始化（内部方法）- 2025-01-13改进：动态获取缓存大小
 */
ImageCacheManager.prototype._finishInit = function(resolve) {
  var self = this;

  // 🔥 改进：动态获取最大缓存大小
  getMaxCacheSize().then(function(maxSize) {
    self.MAX_CACHE_SIZE = maxSize;
    console.log('📊 最大缓存大小设置为:', (maxSize / (1024 * 1024)).toFixed(2), 'MB');

    // 加载缓存索引
    self.cacheIndex = wx.getStorageSync(IMAGE_CACHE_INDEX_KEY) || {};

    // 计算当前缓存总大小
    self.totalCacheSize = 0;
    for (var key in self.cacheIndex) {
      if (self.cacheIndex.hasOwnProperty(key)) {
        self.totalCacheSize += self.cacheIndex[key].size || 0;
      }
    }

    var cachedCount = Object.keys(self.cacheIndex).length;
    var usedMB = (self.totalCacheSize / (1024 * 1024)).toFixed(2);
    var maxMB = (self.MAX_CACHE_SIZE / (1024 * 1024)).toFixed(0);
    console.log('✅ 图片缓存索引加载成功，已缓存图片数量:', cachedCount);
    console.log('💾 当前缓存大小:', usedMB, 'MB /', maxMB, 'MB');

    self._initialized = true;
    resolve();
  }).catch(function(error) {
    console.error('❌ 获取最大缓存大小失败，使用默认值:', error);
    self.MAX_CACHE_SIZE = 100 * 1024 * 1024;  // 降级到默认值

    // 继续初始化流程
    self.cacheIndex = wx.getStorageSync(IMAGE_CACHE_INDEX_KEY) || {};
    self.totalCacheSize = 0;
    for (var key in self.cacheIndex) {
      if (self.cacheIndex.hasOwnProperty(key)) {
        self.totalCacheSize += self.cacheIndex[key].size || 0;
      }
    }

    var cachedCount = Object.keys(self.cacheIndex).length;
    var usedMB = (self.totalCacheSize / (1024 * 1024)).toFixed(2);
    console.log('✅ 图片缓存索引加载成功（使用默认缓存大小），已缓存图片数量:', cachedCount);
    console.log('💾 当前缓存大小:', usedMB, 'MB / 100 MB');

    self._initialized = true;
    resolve();
  });
};

/**
 * 获取缓存图片路径
 *
 * @param {String} cacheKey - 缓存key
 * @returns {String|null} 缓存图片路径（wxfile://格式）或null
 */
ImageCacheManager.prototype.getCachedImagePath = function(cacheKey) {
  if (!cacheKey) {
    return null;
  }

  var cacheInfo = this.cacheIndex[cacheKey];
  if (!cacheInfo || !cacheInfo.path) {
    return null;
  }

  // 验证文件是否真实存在
  try {
    this.cacheFs.accessSync(cacheInfo.path);
    return cacheInfo.path;  // wxfile://usr/walkaround-images/xxx.png
  } catch (err) {
    // 文件不存在，清除索引
    console.warn('⚠️ 缓存文件不存在，清除索引:', cacheKey);
    delete this.cacheIndex[cacheKey];
    this.persistImageCacheIndex();
    return null;
  }
};

/**
 * 确保图片已缓存到本地
 *
 * 核心逻辑：
 * 1. 检查是否已缓存 → 直接返回缓存路径
 * 2. 检查是否正在缓存 → 等待现有Promise
 * 3. 开始新的缓存操作 → 复制文件到USER_DATA_PATH
 *
 * @param {String} cacheKey - 缓存key（例如：area1_component1）
 * @param {String} originalImageSrc - 原始图片路径（例如：/packageWalkaroundImages1/images1/file.png）
 * @returns {Promise<String>} 缓存图片路径
 */
ImageCacheManager.prototype.ensureImageCached = function(cacheKey, originalImageSrc) {
  var self = this;

  return new Promise(function(resolve, reject) {
    // 确保初始化完成
    Promise.resolve(self.initImageCache()).then(function() {

      // 1. 检查是否已缓存
      var existingPath = self.getCachedImagePath(cacheKey);
      if (existingPath) {
        console.log('✅ 图片已缓存:', cacheKey, '→', existingPath);
        resolve(existingPath);
        return;
      }

      // 2. 检查是否正在缓存（防止重复下载）
      if (self.cachePromises[cacheKey]) {
        console.log('⏳ 图片正在缓存中，等待现有Promise:', cacheKey);
        self.cachePromises[cacheKey].then(resolve).catch(reject);
        return;
      }

      // 3. 开始新的缓存操作
      console.log('🔄 开始缓存图片:', cacheKey, 'from', originalImageSrc);

      var targetPath = IMAGE_CACHE_DIR + '/' + self.generateCacheFileName(cacheKey);
      var absoluteSrc = originalImageSrc.startsWith('/') ? originalImageSrc : '/' + originalImageSrc;

      // 创建缓存Promise
      var cachePromise = self.copyImageToCache(absoluteSrc, targetPath, cacheKey);
      self.cachePromises[cacheKey] = cachePromise;

      cachePromise
        .then(function(cachedPath) {
          console.log('✅ 图片缓存成功:', cacheKey, '→', cachedPath);
          resolve(cachedPath);
        })
        .catch(function(error) {
          console.error('❌ 图片缓存失败:', cacheKey, error);
          reject(error);
        })
        .finally(function() {
          // 清理Promise引用
          delete self.cachePromises[cacheKey];
        });

    }).catch(reject);
  });
};

/**
 * 生成缓存文件名（使用安全编码避免冲突）
 *
 * 改进历史：
 * - 2025-01-13: 改用 encodeURIComponent 编码，避免不同cacheKey产生相同文件名
 * - 原方案问题：'area1/component-1' 和 'area1_component_1' 都会变成 'area1_component_1'
 *
 * @param {String} cacheKey - 缓存key
 * @returns {String} 文件名（例如：area1_component1.png 或编码后的文件名）
 */
ImageCacheManager.prototype.generateCacheFileName = function(cacheKey) {
  // 方案1：使用 encodeURIComponent 编码，然后替换%为_（更安全）
  try {
    var encoded = encodeURIComponent(cacheKey).replace(/%/g, '_');

    // 如果编码后的文件名太长（超过100字符），使用简单哈希
    if (encoded.length > 100) {
      return this._generateHashedFileName(cacheKey);
    }

    return encoded + '.png';
  } catch (error) {
    // 降级：使用原方案
    console.warn('⚠️ 文件名编码失败，使用降级方案:', error);
    var safeName = cacheKey.replace(/[^a-zA-Z0-9_-]/g, '_');
    return safeName + '.png';
  }
};

/**
 * 生成哈希文件名（用于长文件名）
 *
 * @param {String} str - 原始字符串
 * @returns {String} 哈希文件名
 * @private
 */
ImageCacheManager.prototype._generateHashedFileName = function(str) {
  // 简单哈希算法（DJB2）
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; // hash * 33 + char
    hash = hash & hash; // Convert to 32bit integer
  }

  // 添加前缀和原字符串的前8个字符（便于调试识别）
  var prefix = str.substring(0, 8).replace(/[^a-zA-Z0-9]/g, '_');
  return 'hash_' + prefix + '_' + Math.abs(hash).toString(16) + '.png';
};

/**
 * 复制图片到缓存目录
 *
 * @param {String} originalSrc - 原始图片路径
 * @param {String} targetPath - 目标缓存路径
 * @param {String} cacheKey - 缓存key
 * @returns {Promise<String>} 缓存图片路径
 */
ImageCacheManager.prototype.copyImageToCache = function(originalSrc, targetPath, cacheKey) {
  var self = this;

  return new Promise(function(resolve, reject) {
    // 🔥 关键步骤1：获取图片信息（触发微信加载分包图片）
    wx.getImageInfo({
      src: originalSrc,
      success: function(imageInfo) {
        console.log('📸 图片信息获取成功:', {
          width: imageInfo.width,
          height: imageInfo.height,
          path: imageInfo.path
        });

        // 🔥 关键步骤2：获取文件大小
        self.cacheFs.getFileInfo({
          filePath: imageInfo.path,  // 使用微信返回的真实路径
          success: function(fileInfo) {
            var fileSize = fileInfo.size;
            console.log('📊 图片大小:', (fileSize / 1024).toFixed(2), 'KB');

            // 检查是否需要清理旧缓存
            if (self.totalCacheSize + fileSize > self.MAX_CACHE_SIZE) {
              console.log('⚠️ 缓存空间不足，开始清理旧缓存');
              self.cleanOldCache(fileSize).then(function() {
                self._performCopyFile(imageInfo.path, targetPath, cacheKey, fileSize, resolve, reject);
              }).catch(reject);
            } else {
              self._performCopyFile(imageInfo.path, targetPath, cacheKey, fileSize, resolve, reject);
            }
          },
          fail: function(err) {
            console.error('❌ 获取图片文件信息失败:', err);
            reject(err);
          }
        });
      },
      fail: function(err) {
        console.error('❌ 获取图片信息失败:', originalSrc, err);
        reject(err);
      }
    });
  });
};

/**
 * 执行文件复制（内部方法）
 */
ImageCacheManager.prototype._performCopyFile = function(srcPath, targetPath, cacheKey, fileSize, resolve, reject) {
  var self = this;

  console.log('📋 开始复制文件:', {
    from: srcPath,
    to: targetPath,
    size: (fileSize / 1024).toFixed(2) + 'KB'
  });

  // 🔥 关键步骤3：复制文件到持久化目录
  this.cacheFs.copyFile({
    srcPath: srcPath,
    destPath: targetPath,
    success: function() {
      console.log('✅ 文件复制成功:', targetPath);

      // 更新缓存索引
      self.cacheIndex[cacheKey] = {
        path: targetPath,
        size: fileSize,
        timestamp: Date.now(),
        originalSrc: srcPath
      };

      // 持久化缓存索引
      self.persistImageCacheIndex();

      // 更新总大小
      self.totalCacheSize += fileSize;

      var usedMB = (self.totalCacheSize / (1024 * 1024)).toFixed(2);
      console.log('💾 当前缓存大小:', usedMB, 'MB /', (self.MAX_CACHE_SIZE / (1024 * 1024)).toFixed(0), 'MB');

      resolve(targetPath);
    },
    fail: function(err) {
      console.error('❌ 文件复制失败:', err);
      reject(err);
    }
  });
};

/**
 * 持久化缓存索引到Storage
 */
ImageCacheManager.prototype.persistImageCacheIndex = function() {
  try {
    wx.setStorageSync(IMAGE_CACHE_INDEX_KEY, this.cacheIndex);
    console.log('💾 持久化存储:', this.cacheIndex);
  } catch (error) {
    console.error('❌ 持久化缓存索引失败:', error);
  }
};

/**
 * 并发控制工具（2025-01-13新增）
 *
 * 限制Promise数组的并发执行数量，避免大量文件操作同时执行导致性能抖动
 *
 * @param {Array<Function>} tasks - 返回Promise的函数数组
 * @param {Number} limit - 最大并发数（默认5）
 * @returns {Promise<Array>} 所有任务的结果数组
 *
 * @example
 * var tasks = fileList.map(function(file) {
 *   return function() {
 *     return deleteFile(file);
 *   };
 * });
 * this.limitConcurrency(tasks, 5).then(function(results) {
 *   console.log('所有文件删除完成');
 * });
 */
ImageCacheManager.prototype.limitConcurrency = function(tasks, limit) {
  limit = limit || 5;  // 默认最多5个并发
  var self = this;

  return new Promise(function(resolve, reject) {
    var results = [];
    var executing = [];
    var index = 0;

    function executeNext() {
      // 所有任务已启动
      if (index >= tasks.length) {
        // 等待所有执行中的任务完成
        if (executing.length === 0) {
          resolve(results);
        }
        return;
      }

      // 当前任务索引
      var currentIndex = index++;
      var task = tasks[currentIndex];

      // 执行任务
      var p = Promise.resolve().then(function() {
        return task();
      }).then(function(result) {
        results[currentIndex] = result;

        // 从执行列表中移除
        var execIndex = executing.indexOf(p);
        if (execIndex !== -1) {
          executing.splice(execIndex, 1);
        }

        // 继续执行下一个任务
        executeNext();
      }).catch(function(error) {
        results[currentIndex] = { error: error };

        // 从执行列表中移除
        var execIndex = executing.indexOf(p);
        if (execIndex !== -1) {
          executing.splice(execIndex, 1);
        }

        // 继续执行下一个任务
        executeNext();
      });

      executing.push(p);

      // 如果还未达到并发限制，继续启动
      if (executing.length < limit) {
        executeNext();
      }
    }

    // 启动初始并发任务
    executeNext();
  });
};

/**
 * 清理旧缓存（LRU策略）
 *
 * @param {Number} requiredSize - 需要的空间大小
 * @returns {Promise}
 */
ImageCacheManager.prototype.cleanOldCache = function(requiredSize) {
  var self = this;

  return new Promise(function(resolve, reject) {
    try {
      var cacheItems = [];

      // 收集所有缓存项
      for (var key in self.cacheIndex) {
        if (self.cacheIndex.hasOwnProperty(key)) {
          cacheItems.push({
            key: key,
            info: self.cacheIndex[key]
          });
        }
      }

      // 按时间戳排序（最旧的在前）
      cacheItems.sort(function(a, b) {
        return a.info.timestamp - b.info.timestamp;
      });

      var freedSize = 0;
      var deletedCount = 0;
      var deleteTasks = [];  // 改为任务数组（函数）

      // 删除最旧的缓存直到释放足够空间
      for (var i = 0; i < cacheItems.length && freedSize < requiredSize; i++) {
        var item = cacheItems[i];

        (function(itemKey, itemPath, itemSize) {
          // 🔥 改进（2025-01-13）：改为返回Promise的函数，用于并发控制
          var deleteTask = function() {
            return new Promise(function(delResolve) {
              self.cacheFs.unlink({
                filePath: itemPath,
                success: function() {
                  console.log('🧹 已删除旧缓存:', itemKey);
                  delete self.cacheIndex[itemKey];
                  freedSize += itemSize;
                  deletedCount++;
                  delResolve();
                },
                fail: function(err) {
                  console.warn('⚠️ 删除缓存失败:', itemKey, err);
                  delResolve();
                }
              });
            });
          };
          deleteTasks.push(deleteTask);
        })(item.key, item.info.path, item.info.size);
      }

      // 🔥 改进（2025-01-13）：使用并发控制，最多5个文件同时删除
      self.limitConcurrency(deleteTasks, 5).then(function() {
        self.totalCacheSize -= freedSize;
        self.persistImageCacheIndex();

        console.log('🧹 缓存清理完成:', {
          deletedCount: deletedCount,
          freedSize: (freedSize / (1024 * 1024)).toFixed(2) + 'MB',
          remainingSize: (self.totalCacheSize / (1024 * 1024)).toFixed(2) + 'MB'
        });

        resolve();
      }).catch(reject);

    } catch (error) {
      console.error('❌ 清理缓存异常:', error);
      reject(error);
    }
  });
};

/**
 * 清空所有缓存
 *
 * @returns {Promise}
 */
ImageCacheManager.prototype.clearAllCache = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    try {
      var deleteTasks = [];  // 改为任务数组（函数）

      for (var key in self.cacheIndex) {
        if (self.cacheIndex.hasOwnProperty(key)) {
          (function(itemPath) {
            // 🔥 改进（2025-01-13）：改为返回Promise的函数，用于并发控制
            var deleteTask = function() {
              return new Promise(function(delResolve) {
                self.cacheFs.unlink({
                  filePath: itemPath,
                  success: function() {
                    delResolve();
                  },
                  fail: function() {
                    delResolve();
                  }
                });
              });
            };
            deleteTasks.push(deleteTask);
          })(self.cacheIndex[key].path);
        }
      }

      // 🔥 改进（2025-01-13）：使用并发控制，最多5个文件同时删除
      self.limitConcurrency(deleteTasks, 5).then(function() {
        // 清空索引
        self.cacheIndex = {};
        self.totalCacheSize = 0;
        self.persistImageCacheIndex();

        console.log('🧹 所有图片缓存已清空');
        resolve();
      }).catch(reject);

    } catch (error) {
      console.error('❌ 清空缓存异常:', error);
      reject(error);
    }
  });
};

/**
 * 获取缓存统计信息
 *
 * @returns {Object} 统计信息
 */
ImageCacheManager.prototype.getCacheStats = function() {
  var totalCount = Object.keys(this.cacheIndex).length;
  var totalSizeMB = (this.totalCacheSize / (1024 * 1024)).toFixed(2);
  var maxSizeMB = (this.MAX_CACHE_SIZE / (1024 * 1024)).toFixed(0);

  return {
    totalCount: totalCount,
    totalSize: this.totalCacheSize,
    totalSizeMB: totalSizeMB,
    maxSizeMB: maxSizeMB,
    cacheIndex: this.cacheIndex
  };
};

// 创建全局单例
var imageCacheManager = new ImageCacheManager();

// 导出接口
module.exports = {
  initImageCache: function() {
    return imageCacheManager.initImageCache();
  },

  getCachedImagePath: function(cacheKey) {
    return imageCacheManager.getCachedImagePath(cacheKey);
  },

  ensureImageCached: function(cacheKey, originalSrc) {
    return imageCacheManager.ensureImageCached(cacheKey, originalSrc);
  },

  clearAllCache: function() {
    return imageCacheManager.clearAllCache();
  },

  getCacheStats: function() {
    return imageCacheManager.getCacheStats();
  }
};
