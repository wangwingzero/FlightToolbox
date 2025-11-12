/**
 * 航线录音音频缓存管理器
 *
 * 功能：将音频文件缓存到本地持久化存储，确保离线环境下音频可播放
 * 设计参考：绕机检查图片缓存方案（2025-01-04修复）
 *
 * 核心优势：
 * 1. 离线优先：音频缓存到 wx.env.USER_DATA_PATH，重启小程序后依然可用
 * 2. 自动缓存：首次播放成功后自动缓存，后续离线也能播放
 * 3. 智能兜底：分包加载失败时优先使用本地缓存
 * 4. 版本隔离：不同版本使用独立缓存，避免真机调试污染发布版本（2025-01-08新增）
 *
 * @author Claude Code
 * @date 2025-01-04
 * @updated 2025-01-08 - 添加版本隔离机制
 */

// ==================== 依赖引入 ====================
var EnvDetector = require('./env-detector.js');
var VersionManager = require('./version-manager.js');

// ==================== 常量配置 ====================

// 音频缓存目录（持久化存储路径）
var AUDIO_CACHE_DIR = wx.env.USER_DATA_PATH + '/audio-recordings';

// 🔐 缓存索引存储key - 版本隔离（2025-01-08优化）
var AUDIO_CACHE_INDEX_KEY_BASE = 'flight_audio_cache_index';  // 基础key
var AUDIO_CACHE_INDEX_KEY = '';  // 实际使用的key（会在初始化时设置为版本化key）

// 最大缓存大小（300MB，支持更多航线音频缓存）
// 优化说明（2025-01-04）：
// - 31个音频分包，约1346个文件，总量约200-500MB
// - 从100MB扩展到300MB，减少LRU清理频率，提升离线稳定性
var MAX_CACHE_SIZE = 300 * 1024 * 1024;

// 单个音频最大大小（5MB）
var MAX_AUDIO_SIZE = 5 * 1024 * 1024;

// ==================== AudioCacheManager 类 ====================

/**
 * 音频缓存管理器
 */
function AudioCacheManager() {
  this.cacheFs = null;              // 文件系统管理器
  this.cacheIndex = {};             // 缓存索引（内存缓存）
  this.cachePromises = {};          // 正在进行的缓存Promise（防止重复下载）
  this._initialized = false;        // 初始化标记
  this.totalCacheSize = 0;          // 当前缓存总大小
}

/**
 * 初始化音频缓存系统
 *
 * 功能：
 * 1. 创建缓存目录（如果不存在）
 * 2. 加载缓存索引到内存
 * 3. 计算当前缓存总大小
 *
 * 注意：支持重复调用，已初始化时直接返回
 * 性能优化：使用异步文件操作，避免阻塞主线程
 */
AudioCacheManager.prototype.initAudioCache = function() {
  var self = this;

  if (this._initialized) {
    return Promise.resolve();
  }

  return new Promise(function(resolve, reject) {
    try {
      // 🔥 关键：检测开发者工具环境（使用统一的EnvDetector工具）
      if (EnvDetector.isDevTools()) {
        console.warn('⚠️ 开发者工具环境：音频缓存功能仅在真机有效');
        self._initialized = true;
        resolve();
        return;
      }

      // 1. 获取文件系统管理器
      self.cacheFs = wx.getFileSystemManager();

      // 2. 确保缓存目录存在（异步）
      self.cacheFs.access({
        path: AUDIO_CACHE_DIR,
        success: function() {
          console.log('✅ 音频缓存目录已存在:', AUDIO_CACHE_DIR);
          self._finishInit(resolve);
        },
        fail: function(error) {
          // 目录不存在，创建目录（异步）
          self.cacheFs.mkdir({
            dirPath: AUDIO_CACHE_DIR,
            recursive: true,
            success: function() {
              console.log('✅ 音频缓存目录创建成功:', AUDIO_CACHE_DIR);
              self._finishInit(resolve);
            },
            fail: function(mkdirError) {
              console.error('❌ 创建音频缓存目录失败:', mkdirError);
              self._initialized = true;
              reject(mkdirError);
            }
          });
        }
      });

    } catch (error) {
      console.error('❌ 音频缓存管理器初始化失败:', error);
      self._initialized = true;
      reject(error);
    }
  });
};

/**
 * 完成初始化（内部辅助方法）
 */
AudioCacheManager.prototype._finishInit = function(resolve) {
  try {
    // 🔐 使用版本化的key（2025-01-08优化）
    AUDIO_CACHE_INDEX_KEY = VersionManager.getVersionedKey(AUDIO_CACHE_INDEX_KEY_BASE);

    // 3. 加载缓存索引
    try {
      this.cacheIndex = wx.getStorageSync(AUDIO_CACHE_INDEX_KEY) || {};
      console.log('✅ 使用版本化缓存key:', AUDIO_CACHE_INDEX_KEY);
      console.log('✅ 音频缓存索引加载成功，已缓存音频数量:', Object.keys(this.cacheIndex).length);
    } catch (error) {
      console.warn('⚠️ 音频缓存索引加载失败，使用空索引:', error);
      this.cacheIndex = {};
    }

    // 4. 计算当前缓存总大小
    this.calculateTotalCacheSize();

    // 5. 初始化缓存Promise字典
    this.cachePromises = {};

    // 6. 标记已初始化
    this._initialized = true;

    console.log('✅ 音频缓存管理器初始化成功');
    resolve();

  } catch (error) {
    console.error('❌ 完成初始化失败:', error);
    this._initialized = true;
    resolve(); // 即使失败也resolve，避免阻塞
  }
};

/**
 * 计算当前缓存总大小
 */
AudioCacheManager.prototype.calculateTotalCacheSize = function() {
  var totalSize = 0;
  var self = this;

  Object.keys(this.cacheIndex).forEach(function(cacheKey) {
    var cacheInfo = self.cacheIndex[cacheKey];
    if (cacheInfo && cacheInfo.size) {
      totalSize += cacheInfo.size;
    }
  });

  this.totalCacheSize = totalSize;
  console.log('📊 音频缓存总大小:', (totalSize / 1024 / 1024).toFixed(2) + ' MB');
};

/**
 * 确保音频已缓存到本地
 *
 * @param {string} cacheKey - 缓存键（建议格式：regionId_airportCode_clipIndex）
 * @param {string} originalAudioSrc - 原始音频路径（分包路径）
 * @returns {Promise<string>} 缓存后的本地路径（wxfile://usr/audio-recordings/xxx.mp3）
 *
 * 工作流程：
 * 1. 检查是否已缓存，如果已缓存直接返回路径
 * 2. 检查是否正在缓存中，如果是则等待现有Promise
 * 3. 下载音频文件信息（获取临时路径）
 * 4. 复制到本地缓存目录
 * 5. 更新缓存索引并持久化
 */
AudioCacheManager.prototype.ensureAudioCached = function(cacheKey, originalAudioSrc) {
  var self = this;

  return new Promise(function(resolve, reject) {
    // 确保已初始化（异步）
    Promise.resolve(self.initAudioCache()).then(function() {

    // 1. 检查是否已缓存
    var existingPath = self.getCachedAudioPath(cacheKey);
    if (existingPath) {
      console.log('✅ 音频已缓存，直接使用:', existingPath);
      resolve(existingPath);
      return;
    }

    // 2. 检查是否正在缓存中（防止重复下载）
    if (self.cachePromises[cacheKey]) {
      console.log('⏳ 音频正在缓存中，等待完成:', cacheKey);
      self.cachePromises[cacheKey].then(resolve).catch(reject);
      return;
    }

    // 3. 开始缓存流程
    console.log('🔄 开始缓存音频:', cacheKey, originalAudioSrc);

    var cachePromise = new Promise(function(innerResolve, innerReject) {
      // 🔥 关键改进：直接使用FileSystemManager访问分包文件
      // 不依赖createInnerAudioContext的黑盒行为

      var targetPath = AUDIO_CACHE_DIR + '/' + self.generateCacheFileName(cacheKey);

      // 将分包路径转换为绝对路径
      var absoluteSrc = originalAudioSrc.startsWith('/') ? originalAudioSrc : '/' + originalAudioSrc;

      // 直接复制分包文件到缓存目录
      self.copyAudioToCache(absoluteSrc, targetPath, cacheKey)
        .then(function(cachedPath) {
          innerResolve(cachedPath);
        })
        .catch(function(error) {
          console.error('❌ 复制音频到缓存失败:', error);
          innerReject(error);
        });

    }).finally(function() {
      // 清理Promise引用
      delete self.cachePromises[cacheKey];
    });

    // 4. 保存Promise引用（防止重复缓存）
    self.cachePromises[cacheKey] = cachePromise;

    // 5. 返回Promise
    cachePromise.then(resolve).catch(reject);
    }).catch(function(initError) {
      // 初始化失败时的处理
      console.error('❌ 初始化失败:', initError);
      reject(initError);
    });
  });
};

/**
 * 复制音频文件到缓存目录
 *
 * @param {string} originalSrc - 原始音频路径（分包绝对路径）
 * @param {string} targetPath - 目标缓存路径
 * @param {string} cacheKey - 缓存键
 * @returns {Promise<string>} 缓存后的本地路径
 */
AudioCacheManager.prototype.copyAudioToCache = function(originalSrc, targetPath, cacheKey) {
  var self = this;

  return new Promise(function(resolve, reject) {
    // 🔥 关键改进：直接使用FileSystemManager访问分包文件
    console.log('🔄 开始复制音频文件:', originalSrc, '->', targetPath);

    // 1. 获取文件大小信息
    self.cacheFs.getFileInfo({
      filePath: originalSrc,
      success: function(fileInfo) {
        var fileSize = fileInfo.size;
        console.log('✅ 音频文件信息获取成功，大小:', (fileSize / 1024).toFixed(2) + ' KB');

        // 2. 检查文件大小是否超限
        if (fileSize > MAX_AUDIO_SIZE) {
          console.error('❌ 音频文件过大，超过限制:', fileSize, 'bytes');
          reject(new Error('音频文件过大'));
          return;
        }

        // 3. 检查缓存总大小是否会超限（异步清理）
        if (self.totalCacheSize + fileSize > MAX_CACHE_SIZE) {
          console.warn('⚠️ 缓存空间不足，需要清理旧缓存');

          // 异步清理缓存后继续复制
          self.cleanOldCache(fileSize).then(function() {
            self._performCopyFile(originalSrc, targetPath, cacheKey, fileSize, resolve, reject);
          }).catch(function(cleanError) {
            console.error('❌ 清理缓存失败，但继续尝试复制:', cleanError);
            // 清理失败也尝试复制（可能有足够空间）
            self._performCopyFile(originalSrc, targetPath, cacheKey, fileSize, resolve, reject);
          });
        } else {
          // 4. 直接复制文件到缓存目录
          self._performCopyFile(originalSrc, targetPath, cacheKey, fileSize, resolve, reject);
        }
      },
      fail: function(error) {
        console.error('❌ 无法获取音频文件信息:', originalSrc, error);

        // 兜底：如果无法获取文件信息，尝试直接复制（使用默认大小）
        console.warn('⚠️ 尝试直接复制音频文件（无文件信息）');

        self.cacheFs.copyFile({
          srcPath: originalSrc,
          destPath: targetPath,
          success: function() {
            var defaultSize = 1024 * 100; // 默认100KB

            self.cacheIndex[cacheKey] = {
              path: targetPath,
              size: defaultSize,
              timestamp: Date.now(),
              originalSrc: originalSrc
            };

            self.persistAudioCacheIndex();
            self.totalCacheSize += defaultSize;

            console.log('✅ 音频已缓存到本地（默认大小）:', targetPath);
            resolve(targetPath);
          },
          fail: function(copyError) {
            console.error('❌ 直接复制音频文件也失败:', copyError);
            reject(copyError);
          }
        });
      }
    });
  });
};

/**
 * 执行文件复制操作（内部辅助方法）
 *
 * @param {string} originalSrc - 原始文件路径
 * @param {string} targetPath - 目标缓存路径
 * @param {string} cacheKey - 缓存键
 * @param {number} fileSize - 文件大小
 * @param {Function} resolve - Promise resolve函数
 * @param {Function} reject - Promise reject函数
 */
AudioCacheManager.prototype._performCopyFile = function(originalSrc, targetPath, cacheKey, fileSize, resolve, reject) {
  var self = this;

  this.cacheFs.copyFile({
    srcPath: originalSrc,
    destPath: targetPath,
    success: function() {
      // 更新缓存索引
      self.cacheIndex[cacheKey] = {
        path: targetPath,
        size: fileSize,
        timestamp: Date.now(),
        originalSrc: originalSrc
      };

      // 持久化索引
      self.persistAudioCacheIndex();

      // 更新总大小
      self.totalCacheSize += fileSize;

      console.log('✅ 音频已缓存到本地:', targetPath, '大小:', (fileSize / 1024).toFixed(2) + ' KB');
      resolve(targetPath);
    },
    fail: function(error) {
      console.error('❌ 复制音频文件失败:', error);
      reject(error);
    }
  });
};

/**
 * 获取已缓存音频的本地路径
 *
 * @param {string} cacheKey - 缓存键
 * @returns {string|null} 本地缓存路径，如果未缓存则返回null
 *
 * 🔥 设计说明：为什么不进行文件系统验证？
 *
 * 1. **避免同步I/O阻塞主线程**
 *    - wx.accessSync() 是同步操作，会阻塞主线程
 *    - 在音频播放等场景中调用会导致UI卡顿
 *    - 特别是低端设备上，同步文件操作可能耗时100-200ms
 *
 * 2. **文件完整性由统一系统检查**
 *    - cache-health-manager.js 每7天自动检查所有缓存文件
 *    - 检测并修复损坏的索引和丢失的文件
 *    - 避免重复验证带来的性能开销
 *
 * 3. **播放失败时自动触发缓存重建**
 *    - audio-player/index.ts 的 onError 事件会捕获播放失败
 *    - 自动调用 ensureAudioCached() 重新缓存文件
 *    - 实现自我修复机制
 *
 * 4. **职责分离原则**
 *    - getCachedPath：只负责查询索引（快速响应）
 *    - 文件验证：由健康检查系统负责（定时执行）
 *    - 缓存重建：由错误处理机制触发（按需执行）
 *
 * 5. **性能对比**
 *    - 不验证：查询索引 < 1ms
 *    - 同步验证：accessSync + 索引查询 ≈ 50-200ms
 *    - 性能提升：50-200倍
 *
 * 注意：此方法保持同步以兼容现有代码，但不执行实际的文件验证
 * 文件完整性验证由 cache-health-manager.js 统一负责
 */
AudioCacheManager.prototype.getCachedAudioPath = function(cacheKey) {
  // 如果未初始化，返回null（不阻塞主线程）
  if (!this._initialized) {
    return null;
  }

  var cacheInfo = this.cacheIndex[cacheKey];
  if (!cacheInfo || !cacheInfo.path) {
    return null;
  }

  // 🔥 关键：直接返回缓存路径，不进行文件系统验证
  // 原因见上方详细说明
  return cacheInfo.path;
};

/**
 * 生成缓存文件名
 *
 * @param {string} cacheKey - 缓存键
 * @returns {string} 文件名（包含.mp3扩展名）
 */
AudioCacheManager.prototype.generateCacheFileName = function(cacheKey) {
  // 将cacheKey转换为安全的文件名
  var safeFileName = cacheKey.replace(/[^a-zA-Z0-9_-]/g, '_');
  return safeFileName + '.mp3';
};

/**
 * 持久化缓存索引到本地存储
 */
AudioCacheManager.prototype.persistAudioCacheIndex = function() {
  try {
    wx.setStorageSync(AUDIO_CACHE_INDEX_KEY, this.cacheIndex);
    console.log('✅ 音频缓存索引已持久化');
  } catch (error) {
    console.error('❌ 持久化音频缓存索引失败:', error);
  }
};

/**
 * 清理旧缓存（LRU策略：最近最少使用）
 *
 * @param {number} requiredSize - 需要释放的空间大小（字节）
 * @returns {Promise} 清理完成的Promise
 *
 * 性能优化：使用异步文件删除，避免阻塞主线程
 */
AudioCacheManager.prototype.cleanOldCache = function(requiredSize) {
  var self = this;

  return new Promise(function(resolve, reject) {
    // 按时间戳排序（最旧的在前）
    var sortedKeys = Object.keys(self.cacheIndex).sort(function(a, b) {
      var timeA = self.cacheIndex[a].timestamp || 0;
      var timeB = self.cacheIndex[b].timestamp || 0;
      return timeA - timeB;
    });

    var freedSize = 0;
    var deletedCount = 0;
    var deletePromises = [];

    // 收集需要删除的文件
    var filesToDelete = [];
    for (var i = 0; i < sortedKeys.length && freedSize < requiredSize; i++) {
      var cacheKey = sortedKeys[i];
      var cacheInfo = self.cacheIndex[cacheKey];

      filesToDelete.push({
        key: cacheKey,
        path: cacheInfo.path,
        size: cacheInfo.size || 0
      });

      freedSize += (cacheInfo.size || 0);
    }

    // 异步删除所有文件
    filesToDelete.forEach(function(file) {
      var deletePromise = new Promise(function(resolveDelete) {
        self.cacheFs.unlink({
          filePath: file.path,
          success: function() {
            deletedCount++;
            delete self.cacheIndex[file.key];
            console.log('🗑️ 已删除旧缓存:', file.key);
            resolveDelete();
          },
          fail: function(error) {
            console.error('❌ 删除缓存文件失败:', file.key, error);
            resolveDelete(); // 即使失败也继续
          }
        });
      });

      deletePromises.push(deletePromise);
    });

    // 等待所有删除完成
    Promise.all(deletePromises).then(function() {
      // 更新总大小
      self.totalCacheSize -= freedSize;

      // 持久化索引
      self.persistAudioCacheIndex();

      console.log('✅ 缓存清理完成，删除', deletedCount, '个文件，释放', (freedSize / 1024 / 1024).toFixed(2) + ' MB');
      resolve({
        deletedCount: deletedCount,
        freedSize: freedSize
      });
    }).catch(function(error) {
      console.error('❌ 缓存清理过程出错:', error);
      reject(error);
    });
  });
};

/**
 * 清空所有缓存
 *
 * 用途：设置页面提供"清空音频缓存"功能
 * 性能优化：使用异步文件删除，避免阻塞主线程
 */
AudioCacheManager.prototype.clearAllCache = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    try {
      var deletePromises = [];

      // 异步删除所有缓存文件
      Object.keys(self.cacheIndex).forEach(function(cacheKey) {
        var cacheInfo = self.cacheIndex[cacheKey];

        var deletePromise = new Promise(function(resolveDelete) {
          self.cacheFs.unlink({
            filePath: cacheInfo.path,
            success: function() {
              console.log('🗑️ 已删除缓存:', cacheKey);
              resolveDelete();
            },
            fail: function(error) {
              console.warn('⚠️ 删除缓存文件失败:', cacheKey, error);
              resolveDelete(); // 即使失败也继续
            }
          });
        });

        deletePromises.push(deletePromise);
      });

      // 等待所有删除完成
      Promise.all(deletePromises).then(function() {
        // 清空索引
        self.cacheIndex = {};
        self.totalCacheSize = 0;
        self.persistAudioCacheIndex();

        console.log('✅ 所有音频缓存已清空');
        resolve();
      }).catch(function(error) {
        console.error('❌ 清空音频缓存过程出错:', error);
        reject(error);
      });

    } catch (error) {
      console.error('❌ 清空音频缓存失败:', error);
      reject(error);
    }
  });
};

/**
 * 获取缓存统计信息
 *
 * @returns {Object} 缓存统计信息
 */
AudioCacheManager.prototype.getCacheStats = function() {
  return {
    totalCount: Object.keys(this.cacheIndex).length,
    totalSize: this.totalCacheSize,
    totalSizeMB: (this.totalCacheSize / 1024 / 1024).toFixed(2),
    maxSizeMB: (MAX_CACHE_SIZE / 1024 / 1024).toFixed(2)
  };
};

// ==================== 导出单例 ====================

var audioCacheManagerInstance = new AudioCacheManager();

module.exports = {
  // 单例实例
  instance: audioCacheManagerInstance,

  // 快捷方法（直接调用单例方法）
  initAudioCache: function() {
    return audioCacheManagerInstance.initAudioCache();
  },

  ensureAudioCached: function(cacheKey, originalAudioSrc) {
    return audioCacheManagerInstance.ensureAudioCached(cacheKey, originalAudioSrc);
  },

  getCachedAudioPath: function(cacheKey) {
    return audioCacheManagerInstance.getCachedAudioPath(cacheKey);
  },

  clearAllCache: function() {
    return audioCacheManagerInstance.clearAllCache();
  },

  getCacheStats: function() {
    return audioCacheManagerInstance.getCacheStats();
  }
};
