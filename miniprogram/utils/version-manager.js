/**
 * 🔐 版本管理工具
 *
 * 核心功能：
 * 1. 统一的版本前缀管理（解决版本间缓存污染问题）
 * 2. Storage Key 版本隔离
 * 3. 文件路径版本隔离
 * 4. 旧版本缓存迁移
 *
 * @module version-manager
 * @created 2025-01-08
 * @purpose 根本解决真机调试污染发布版本缓存的问题
 *
 * @example
 * var VersionManager = require('../../utils/version-manager.js');
 * var key = VersionManager.getVersionedKey('image_cache_index');
 * // 发布版本: 'release_2.10.0_image_cache_index'
 * // 真机调试: 'debug_2.10.0_image_cache_index'
 */

/**
 * 获取应用版本信息
 *
 * @returns {Object} 版本信息对象
 * @property {string} version - 版本号（如 '2.10.0'）
 * @property {string} envVersion - 环境版本（develop/trial/release）
 * @property {string} prefix - 版本前缀（debug_/trial_/release_/dev_）
 *
 * @example
 * var info = getAppVersionInfo();
 * console.log(info.version);    // '2.10.0'
 * console.log(info.envVersion); // 'release'
 * console.log(info.prefix);     // 'release_'
 */
function getAppVersionInfo() {
  try {
    var accountInfo = wx.getAccountInfoSync();
    var version = accountInfo.miniProgram.version || 'unknown';
    var envVersion = accountInfo.miniProgram.envVersion; // develop, trial, release

    var prefix = '';
    var description = '';

    switch (envVersion) {
      case 'develop':
        prefix = 'debug_';
        description = '真机调试';
        break;
      case 'trial':
        prefix = 'trial_';
        description = '体验版';
        break;
      case 'release':
        prefix = 'release_';
        description = '正式版';
        break;
      default:
        prefix = 'dev_';
        description = '开发者工具';
    }

    return {
      version: version,
      envVersion: envVersion,
      prefix: prefix,
      description: description,
      fullPrefix: prefix + version + '_'
    };
  } catch (error) {
    console.error('❌ 获取版本信息失败:', error);
    return {
      version: 'unknown',
      envVersion: 'unknown',
      prefix: 'unknown_',
      description: '未知环境',
      fullPrefix: 'unknown_'
    };
  }
}

/**
 * 获取带版本前缀的 Storage Key
 *
 * @param {string} baseKey - 基础key名称（不含版本前缀）
 * @returns {string} 版本化的key名称
 *
 * @example
 * // 发布版本 2.10.0
 * getVersionedKey('image_cache_index');
 * // 返回: 'release_2.10.0_image_cache_index'
 *
 * // 真机调试 2.10.0
 * getVersionedKey('image_cache_index');
 * // 返回: 'debug_2.10.0_image_cache_index'
 */
function getVersionedKey(baseKey) {
  var info = getAppVersionInfo();
  return info.fullPrefix + baseKey;
}

/**
 * 获取带版本前缀的文件路径
 *
 * @param {string} basePath - 基础路径（不含版本前缀）
 * @returns {string} 版本化的文件路径
 *
 * @example
 * getVersionedPath('/walkaround-images');
 * // 返回: '/release_2.10.0/walkaround-images'
 */
function getVersionedPath(basePath) {
  var info = getAppVersionInfo();

  // 确保basePath以/开头
  if (basePath.charAt(0) !== '/') {
    basePath = '/' + basePath;
  }

  return '/' + info.fullPrefix.replace(/_$/, '') + basePath;
}

/**
 * 迁移旧版本缓存到新版本
 *
 * 用于首次启用版本隔离时，将旧的无版本前缀缓存迁移到新的版本化key
 *
 * @param {string} baseKey - 基础key名称
 * @param {Object} options - 配置选项
 * @param {boolean} options.deleteOld - 是否删除旧key（默认false，保留以防回滚）
 * @param {boolean} options.force - 是否强制覆盖新key（默认false）
 * @returns {Object} 迁移结果
 *
 * @example
 * migrateLegacyCache('image_cache_index', {
 *   deleteOld: false,
 *   force: false
 * });
 */
function migrateLegacyCache(baseKey, options) {
  options = options || {};
  var deleteOld = options.deleteOld || false;
  var force = options.force || false;

  try {
    var oldKey = baseKey;
    var newKey = getVersionedKey(baseKey);

    // 🔥 改进：使用统一的迁移标记对象（2025-01-13）
    var MIGRATION_FLAGS_KEY = 'cache_migration_flags';
    var migrationFlags = wx.getStorageSync(MIGRATION_FLAGS_KEY) || {};

    // 检查是否已经迁移过
    if (migrationFlags[baseKey] && !force) {
      console.log('📦 缓存已迁移，跳过:', baseKey);
      return {
        success: true,
        skipped: true,
        reason: 'already_migrated'
      };
    }

    // 读取旧缓存
    var oldCache = wx.getStorageSync(oldKey);
    if (!oldCache || Object.keys(oldCache).length === 0) {
      console.log('📦 旧缓存为空，无需迁移:', baseKey);
      migrationFlags[baseKey] = true;
      wx.setStorageSync(MIGRATION_FLAGS_KEY, migrationFlags);
      return {
        success: true,
        skipped: true,
        reason: 'no_old_cache'
      };
    }

    // 读取新缓存
    var newCache = wx.getStorageSync(newKey);

    // 如果新key已有数据且不强制覆盖，跳过迁移
    if (newCache && Object.keys(newCache).length > 0 && !force) {
      console.log('📦 新缓存已存在，跳过迁移:', baseKey);
      migrationFlags[baseKey] = true;
      wx.setStorageSync(MIGRATION_FLAGS_KEY, migrationFlags);
      return {
        success: true,
        skipped: true,
        reason: 'new_cache_exists'
      };
    }

    // 执行迁移
    wx.setStorageSync(newKey, oldCache);
    console.log('✅ 缓存迁移成功:', oldKey, '->', newKey);
    console.log('📊 迁移数据量:', Object.keys(oldCache).length, '项');

    // 标记已迁移（使用统一标记对象）
    migrationFlags[baseKey] = true;
    wx.setStorageSync(MIGRATION_FLAGS_KEY, migrationFlags);

    // 删除旧key（可选）
    if (deleteOld) {
      wx.removeStorageSync(oldKey);
      console.log('🗑️ 已删除旧缓存key:', oldKey);
    } else {
      console.log('💾 保留旧缓存key（以防回滚）:', oldKey);
    }

    return {
      success: true,
      migrated: true,
      oldKey: oldKey,
      newKey: newKey,
      itemCount: Object.keys(oldCache).length
    };
  } catch (error) {
    console.error('❌ 缓存迁移失败:', error);
    return {
      success: false,
      error: error.message || error
    };
  }
}

/**
 * 批量迁移多个缓存
 *
 * @param {Array<string>} baseKeys - 基础key列表
 * @param {Object} options - 配置选项
 * @returns {Object} 批量迁移结果
 *
 * @example
 * batchMigrateCaches([
 *   'image_cache_index',
 *   'audio_cache_index',
 *   'data_index_cache'
 * ], { deleteOld: false });
 */
function batchMigrateCaches(baseKeys, options) {
  var results = {
    total: baseKeys.length,
    succeeded: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  baseKeys.forEach(function(baseKey) {
    var result = migrateLegacyCache(baseKey, options);
    results.details.push({
      baseKey: baseKey,
      result: result
    });

    if (result.success) {
      if (result.skipped) {
        results.skipped++;
      } else {
        results.succeeded++;
      }
    } else {
      results.failed++;
    }
  });

  console.log('========== 批量迁移结果 ==========');
  console.log('总数:', results.total);
  console.log('成功:', results.succeeded);
  console.log('跳过:', results.skipped);
  console.log('失败:', results.failed);
  console.log('=================================');

  return results;
}

/**
 * 清理指定版本的所有缓存
 *
 * 危险操作！仅用于调试或紧急清理
 *
 * @param {Object} options - 配置选项
 * @param {string} options.envVersion - 环境版本（develop/trial/release/all）
 * @param {Array<string>} options.baseKeys - 要清理的baseKey列表（不传则清理所有）
 * @returns {Object} 清理结果
 *
 * @example
 * // 清理真机调试版本的所有缓存
 * clearVersionCaches({ envVersion: 'develop' });
 *
 * // 清理指定的缓存
 * clearVersionCaches({
 *   envVersion: 'develop',
 *   baseKeys: ['image_cache_index', 'audio_cache_index']
 * });
 */
function clearVersionCaches(options) {
  options = options || {};
  var envVersion = options.envVersion || 'develop';
  var baseKeys = options.baseKeys || [];

  try {
    var info = wx.getStorageInfoSync();
    var allKeys = info.keys || [];
    var removed = [];

    // 确定要清理的前缀
    var prefixToRemove = '';
    switch (envVersion) {
      case 'develop':
        prefixToRemove = 'debug_';
        break;
      case 'trial':
        prefixToRemove = 'trial_';
        break;
      case 'release':
        prefixToRemove = 'release_';
        break;
      case 'all':
        // 清理所有版本化的key
        break;
      default:
        console.error('❌ 无效的envVersion:', envVersion);
        return { success: false, error: 'invalid_env_version' };
    }

    allKeys.forEach(function(key) {
      var shouldRemove = false;

      if (envVersion === 'all') {
        // 清理所有版本化的key（包含 debug_/trial_/release_/dev_ 前缀）
        if (key.indexOf('debug_') === 0 ||
            key.indexOf('trial_') === 0 ||
            key.indexOf('release_') === 0 ||
            key.indexOf('dev_') === 0) {
          shouldRemove = true;
        }
      } else {
        // 清理指定版本的key
        if (key.indexOf(prefixToRemove) === 0) {
          shouldRemove = true;
        }
      }

      // 如果指定了baseKeys，只清理匹配的
      if (shouldRemove && baseKeys.length > 0) {
        shouldRemove = false;
        baseKeys.forEach(function(baseKey) {
          if (key.indexOf(baseKey) !== -1) {
            shouldRemove = true;
          }
        });
      }

      if (shouldRemove) {
        wx.removeStorageSync(key);
        removed.push(key);
        console.log('🗑️ 已清理:', key);
      }
    });

    console.log('✅ 清理完成，共清理', removed.length, '个缓存key');

    return {
      success: true,
      removed: removed,
      count: removed.length
    };
  } catch (error) {
    console.error('❌ 清理缓存失败:', error);
    return {
      success: false,
      error: error.message || error
    };
  }
}

/**
 * 获取所有版本的缓存统计
 *
 * @returns {Object} 缓存统计信息
 *
 * @example
 * var stats = getCacheStatistics();
 * console.log('发布版本缓存:', stats.release);
 * console.log('真机调试缓存:', stats.develop);
 */
function getCacheStatistics() {
  try {
    var info = wx.getStorageInfoSync();
    var allKeys = info.keys || [];

    var stats = {
      total: allKeys.length,
      release: { count: 0, keys: [] },
      trial: { count: 0, keys: [] },
      develop: { count: 0, keys: [] },
      dev: { count: 0, keys: [] },
      legacy: { count: 0, keys: [] },
      other: { count: 0, keys: [] },
      storageSize: info.currentSize,
      storageLimit: info.limitSize,
      storageUsagePercent: ((info.currentSize / info.limitSize) * 100).toFixed(2)
    };

    allKeys.forEach(function(key) {
      if (key.indexOf('release_') === 0) {
        stats.release.count++;
        stats.release.keys.push(key);
      } else if (key.indexOf('trial_') === 0) {
        stats.trial.count++;
        stats.trial.keys.push(key);
      } else if (key.indexOf('debug_') === 0) {
        stats.develop.count++;
        stats.develop.keys.push(key);
      } else if (key.indexOf('dev_') === 0) {
        stats.dev.count++;
        stats.dev.keys.push(key);
      } else if (
        key.indexOf('cache') !== -1 ||
        key.indexOf('index') !== -1 ||
        key.indexOf('preload') !== -1
      ) {
        // 可能是旧版本的缓存key（无版本前缀）
        stats.legacy.count++;
        stats.legacy.keys.push(key);
      } else {
        stats.other.count++;
        stats.other.keys.push(key);
      }
    });

    return stats;
  } catch (error) {
    console.error('❌ 获取缓存统计失败:', error);
    return null;
  }
}

/**
 * 打印缓存统计信息（用于调试）
 *
 * @example
 * logCacheStatistics();
 */
function logCacheStatistics() {
  var stats = getCacheStatistics();

  if (!stats) {
    console.error('❌ 无法获取缓存统计');
    return;
  }

  console.log('========== 缓存统计信息 ==========');
  console.log('存储使用:', (stats.storageSize / 1024).toFixed(2), 'MB /',
              (stats.storageLimit / 1024).toFixed(2), 'MB',
              '(' + stats.storageUsagePercent + '%)');
  console.log('总缓存key数:', stats.total);
  console.log('');
  console.log('【正式版缓存】', stats.release.count, '个');
  stats.release.keys.forEach(function(key) {
    console.log('  -', key);
  });
  console.log('');
  console.log('【体验版缓存】', stats.trial.count, '个');
  stats.trial.keys.forEach(function(key) {
    console.log('  -', key);
  });
  console.log('');
  console.log('【真机调试缓存】', stats.develop.count, '个');
  stats.develop.keys.forEach(function(key) {
    console.log('  -', key);
  });
  console.log('');
  console.log('【开发工具缓存】', stats.dev.count, '个');
  stats.dev.keys.forEach(function(key) {
    console.log('  -', key);
  });
  console.log('');
  console.log('【旧版本缓存（无前缀）】', stats.legacy.count, '个');
  stats.legacy.keys.forEach(function(key) {
    console.log('  -', key);
  });
  console.log('');
  console.log('【其他缓存】', stats.other.count, '个');
  console.log('=================================');
}

module.exports = {
  getAppVersionInfo: getAppVersionInfo,
  getVersionedKey: getVersionedKey,
  getVersionedPath: getVersionedPath,
  migrateLegacyCache: migrateLegacyCache,
  batchMigrateCaches: batchMigrateCaches,
  clearVersionCaches: clearVersionCaches,
  getCacheStatistics: getCacheStatistics,
  logCacheStatistics: logCacheStatistics
};
