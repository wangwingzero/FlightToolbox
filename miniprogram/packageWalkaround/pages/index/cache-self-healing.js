/**
 * 🏥 图片缓存自愈系统
 *
 * 功能：
 * 1. 版本隔离：真机调试和发布版本使用不同的缓存key
 * 2. 自动检测：启动时检测缓存完整性
 * 3. 自动修复：发现问题时自动重建索引或清理损坏缓存
 *
 * @created 2025-01-08
 * @purpose 解决真机调试污染发布版本缓存的问题
 */

/**
 * 获取带版本前缀的Storage Key
 *
 * @param {string} baseKey - 基础key名称
 * @returns {string} 版本化的key名称
 *
 * @example
 * // 发布版本: release_2.10.0_walkaround_image_cache_index
 * // 真机调试: debug_2.10.0_walkaround_image_cache_index
 * // 开发工具: develop_walkaround_image_cache_index
 */
function getVersionedKey(baseKey) {
  try {
    var accountInfo = wx.getAccountInfoSync();
    var version = accountInfo.miniProgram.version || 'unknown';
    var envVersion = accountInfo.miniProgram.envVersion; // develop, trial, release

    var prefix = '';
    switch (envVersion) {
      case 'develop':
        prefix = 'debug_';  // 真机调试
        break;
      case 'trial':
        prefix = 'trial_';  // 体验版
        break;
      case 'release':
        prefix = 'release_';  // 正式版
        break;
      default:
        prefix = 'dev_';  // 开发者工具
    }

    return prefix + version + '_' + baseKey;
  } catch (error) {
    console.error('❌ 获取版本信息失败，使用默认key:', error);
    return baseKey;  // 降级到原始key
  }
}

/**
 * 检查缓存索引的完整性
 *
 * @param {Object} cacheIndex - 缓存索引对象
 * @param {string} cacheDir - 缓存目录路径
 * @returns {Promise<Object>} 检查结果
 *
 * @example
 * checkCacheIntegrity(cacheIndex, IMAGE_CACHE_DIR).then(function(result) {
 *   if (result.needsRepair) {
 *     // 需要修复
 *   }
 * });
 */
function checkCacheIntegrity(cacheIndex, cacheDir) {
  return new Promise(function(resolve) {
    var fs = wx.getFileSystemManager();

    // 检查缓存目录是否存在
    fs.readdir({
      dirPath: cacheDir,
      success: function(res) {
        var actualFiles = res.files || [];
        var indexedFiles = Object.keys(cacheIndex);

        // 统计不一致的文件
        var missingFiles = [];  // 索引中有但文件不存在
        var orphanFiles = [];   // 文件存在但索引中没有

        // 检查索引中的文件是否真实存在
        indexedFiles.forEach(function(key) {
          var entry = cacheIndex[key];
          var fileName = entry.path;

          // 如果路径包含目录分隔符，提取文件名
          if (fileName && fileName.indexOf('/') !== -1) {
            var parts = fileName.split('/');
            fileName = parts[parts.length - 1];
          }

          if (actualFiles.indexOf(fileName) === -1) {
            missingFiles.push(key);
          }
        });

        // 检查文件系统中的文件是否都在索引中
        actualFiles.forEach(function(file) {
          var found = false;
          indexedFiles.forEach(function(key) {
            var entry = cacheIndex[key];
            var fileName = entry.path;

            if (fileName && fileName.indexOf('/') !== -1) {
              var parts = fileName.split('/');
              fileName = parts[parts.length - 1];
            }

            if (fileName === file) {
              found = true;
            }
          });

          if (!found) {
            orphanFiles.push(file);
          }
        });

        var needsRepair = missingFiles.length > 0 || orphanFiles.length > 0;

        resolve({
          needsRepair: needsRepair,
          totalIndexed: indexedFiles.length,
          totalFiles: actualFiles.length,
          missingFiles: missingFiles,  // 索引中有但文件不存在（需要清理索引）
          orphanFiles: orphanFiles,    // 文件存在但未索引（需要添加到索引）
          healthy: !needsRepair
        });
      },
      fail: function(err) {
        // 缓存目录不存在或无法读取
        var indexedFiles = Object.keys(cacheIndex);
        resolve({
          needsRepair: indexedFiles.length > 0,  // 如果有索引但目录不存在，需要修复
          totalIndexed: indexedFiles.length,
          totalFiles: 0,
          missingFiles: indexedFiles,
          orphanFiles: [],
          healthy: indexedFiles.length === 0,
          error: err
        });
      }
    });
  });
}

/**
 * 自动修复缓存
 *
 * @param {Object} cacheIndex - 当前缓存索引
 * @param {string} cacheDir - 缓存目录路径
 * @param {Object} integrityResult - 完整性检查结果
 * @returns {Promise<Object>} 修复后的缓存索引
 */
function repairCache(cacheIndex, cacheDir, integrityResult) {
  return new Promise(function(resolve) {
    var fs = wx.getFileSystemManager();
    var repairedIndex = Object.assign({}, cacheIndex);
    var repairLog = {
      removedEntries: 0,
      addedEntries: 0,
      totalRepaired: 0
    };

    // 1. 清理索引中但文件不存在的项
    integrityResult.missingFiles.forEach(function(key) {
      delete repairedIndex[key];
      repairLog.removedEntries++;
    });

    // 2. 为未索引的文件添加索引
    integrityResult.orphanFiles.forEach(function(fileName) {
      if (fileName.endsWith('.png')) {
        var cacheKey = fileName.replace('.png', '');
        repairedIndex[cacheKey] = {
          path: fileName,
          timestamp: Date.now(),
          repaired: true  // 标记为自动修复
        };
        repairLog.addedEntries++;
      }
    });

    repairLog.totalRepaired = repairLog.removedEntries + repairLog.addedEntries;

    console.log('🔧 缓存自动修复完成:', repairLog);

    resolve({
      index: repairedIndex,
      log: repairLog
    });
  });
}

/**
 * 启动时自动检查并修复缓存
 *
 * 用法：在 customOnLoad 中调用
 *
 * @param {Object} context - 页面上下文（this）
 * @param {string} cacheIndexKey - 缓存索引的Storage key
 * @param {string} cacheDir - 缓存目录路径
 * @returns {Promise<void>}
 */
function initSelfHealing(context, cacheIndexKey, cacheDir) {
  return new Promise(function(resolve) {
    console.log('🏥 启动缓存自愈系统...');

    // 1. 使用版本化的key
    var versionedKey = getVersionedKey(cacheIndexKey);
    console.log('📦 使用版本化缓存key:', versionedKey);

    // 2. 读取缓存索引
    var cacheIndex = wx.getStorageSync(versionedKey) || {};

    // 3. 检查完整性
    checkCacheIntegrity(cacheIndex, cacheDir).then(function(result) {
      console.log('🔍 缓存完整性检查结果:', result);

      if (result.needsRepair) {
        console.warn('⚠️ 检测到缓存不一致，开始自动修复...');

        // 4. 自动修复
        repairCache(cacheIndex, cacheDir, result).then(function(repairResult) {
          // 5. 保存修复后的索引
          wx.setStorageSync(versionedKey, repairResult.index);

          // 6. 更新页面上下文
          context.imageCacheIndex = repairResult.index;
          context.imageCacheIndexKey = versionedKey;

          console.log('✅ 缓存已自动修复并保存');
          resolve();
        });
      } else {
        console.log('✅ 缓存完整性良好，无需修复');

        // 更新页面上下文
        context.imageCacheIndex = cacheIndex;
        context.imageCacheIndexKey = versionedKey;

        resolve();
      }
    });
  });
}

/**
 * 迁移旧版本缓存到新版本
 *
 * 用于首次启用版本隔离时，将旧的缓存迁移到新的版本化key
 *
 * @param {string} oldKey - 旧的key（无版本前缀）
 * @param {string} newKey - 新的key（有版本前缀）
 * @returns {boolean} 是否成功迁移
 */
function migrateLegacyCache(oldKey, newKey) {
  try {
    var oldCache = wx.getStorageSync(oldKey);

    if (oldCache && Object.keys(oldCache).length > 0) {
      var newCache = wx.getStorageSync(newKey);

      // 如果新key还没有数据，迁移旧数据
      if (!newCache || Object.keys(newCache).length === 0) {
        wx.setStorageSync(newKey, oldCache);
        console.log('📦 已迁移旧缓存到新版本key:', Object.keys(oldCache).length, '个文件');

        // 可选：删除旧key（保留一段时间以防回滚）
        // wx.removeStorageSync(oldKey);

        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ 迁移旧缓存失败:', error);
    return false;
  }
}

module.exports = {
  getVersionedKey: getVersionedKey,
  checkCacheIntegrity: checkCacheIntegrity,
  repairCache: repairCache,
  initSelfHealing: initSelfHealing,
  migrateLegacyCache: migrateLegacyCache
};
