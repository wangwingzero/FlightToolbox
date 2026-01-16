# 带版本号的 Storage Key 模式：永久缓存与环境隔离方案

> 创建时间：2025-12-06
> 
> 本文档详细说明如何在微信小程序中实现带版本号的 Storage Key 缓存机制，解决跨环境缓存污染和版本升级缓存失效问题。

---

## 一、问题背景

### 1.1 微信小程序缓存的痛点

| 问题 | 描述 |
|------|------|
| **环境污染** | 真机调试的缓存会污染正式版，导致数据错乱 |
| **版本冲突** | 旧版本缓存格式与新版本不兼容，导致崩溃 |
| **无法区分** | `wx.getStorageSync('my_cache')` 在所有环境返回同一份数据 |

### 1.2 核心需求

1. **环境隔离**：真机调试、体验版、正式版各自使用独立缓存
2. **版本隔离**：不同版本号使用独立缓存，避免格式冲突
3. **向后兼容**：新版本可以迁移旧缓存数据

---

## 二、解决方案：版本化 Storage Key

### 2.1 Key 命名规则

```
{环境前缀}{版本号}_{基础Key名}
```

**示例**：
- 正式版 2.10.0：`release_2.10.0_image_cache_index`
- 真机调试 2.10.0：`debug_2.10.0_image_cache_index`
- 体验版 2.10.0：`trial_2.10.0_image_cache_index`
- 开发者工具：`dev_image_cache_index`

### 2.2 环境前缀对照表

| envVersion | 前缀 | 说明 |
|------------|------|------|
| `release` | `release_` | 正式发布版本 |
| `trial` | `trial_` | 体验版 |
| `develop` | `debug_` | 真机调试 |
| 其他/未知 | `dev_` | 开发者工具本地运行 |

---

## 三、完整实现代码

### 3.1 版本管理工具 (version-manager.js)

```javascript
/**
 * 🔐 版本管理工具
 * 
 * 核心功能：
 * 1. 统一的版本前缀管理（解决版本间缓存污染问题）
 * 2. Storage Key 版本隔离
 * 3. 旧版本缓存迁移
 * 
 * @module version-manager
 */

/**
 * 获取应用版本信息
 * 
 * @returns {Object} 版本信息对象
 * @property {string} version - 版本号（如 '2.10.0'）
 * @property {string} envVersion - 环境版本（develop/trial/release）
 * @property {string} prefix - 环境前缀（debug_/trial_/release_/dev_）
 * @property {string} fullPrefix - 完整前缀（含版本号）
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
 * // 正式版 2.10.0
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
 * 获取仅带环境前缀的 Key（不含版本号）
 * 适用于不需要版本隔离的场景
 * 
 * @param {string} baseKey - 基础key名称
 * @returns {string} 环境隔离的key名称
 */
function getEnvScopedKey(baseKey) {
  var info = getAppVersionInfo();
  return info.prefix + baseKey;
}

module.exports = {
  getAppVersionInfo: getAppVersionInfo,
  getVersionedKey: getVersionedKey,
  getEnvScopedKey: getEnvScopedKey
};
```

### 3.2 缓存管理器示例 (cache-manager.js)

```javascript
/**
 * 缓存管理器示例
 * 演示如何使用版本化 Storage Key
 */

var VersionManager = require('./version-manager.js');

// ==================== 常量配置 ====================

// 🔐 缓存存储 Key 前缀（基础名称，不含版本）
var CACHE_KEY_BASE = 'my_data_cache_';

// 缓存版本号（数据格式变更时递增）
var CACHE_FORMAT_VERSION = 'v1';

// 缓存过期时间（30天）
var CACHE_EXPIRE_MS = 30 * 24 * 60 * 60 * 1000;

// ==================== 核心方法 ====================

/**
 * 获取完整的缓存 Key
 * 
 * @param {string} datasetName - 数据集名称
 * @returns {string} 完整的版本化 Key
 */
function getCacheKey(datasetName) {
  return VersionManager.getVersionedKey(CACHE_KEY_BASE + datasetName);
}

/**
 * 保存数据到缓存
 * 
 * @param {string} datasetName - 数据集名称
 * @param {*} data - 要缓存的数据
 */
function saveToCache(datasetName, data) {
  try {
    var key = getCacheKey(datasetName);
    var cacheData = {
      data: data,
      version: CACHE_FORMAT_VERSION,
      timestamp: Date.now(),
      itemCount: Array.isArray(data) ? data.length : Object.keys(data || {}).length
    };

    wx.setStorageSync(key, cacheData);
    
    var size = JSON.stringify(cacheData).length;
    console.log('✅ 缓存已保存:', datasetName, '大小:', (size / 1024).toFixed(2) + ' KB');
  } catch (error) {
    console.error('❌ 保存缓存失败:', datasetName, error);
  }
}

/**
 * 从缓存加载数据
 * 
 * @param {string} datasetName - 数据集名称
 * @returns {*} 缓存的数据，无效则返回 null
 */
function loadFromCache(datasetName) {
  try {
    var key = getCacheKey(datasetName);
    var cacheData = wx.getStorageSync(key);

    if (!cacheData) {
      console.log('📦 缓存不存在:', datasetName);
      return null;
    }

    // 验证版本号
    if (cacheData.version !== CACHE_FORMAT_VERSION) {
      console.log('⚠️ 缓存版本不匹配，需要重建:', datasetName);
      return null;
    }

    // 验证是否过期
    var age = Date.now() - (cacheData.timestamp || 0);
    if (age > CACHE_EXPIRE_MS) {
      console.log('⚠️ 缓存已过期，需要重建:', datasetName);
      return null;
    }

    console.log('✅ 从缓存加载:', datasetName, '数据量:', cacheData.itemCount);
    return cacheData.data;
  } catch (error) {
    console.error('❌ 加载缓存失败:', datasetName, error);
    return null;
  }
}

/**
 * 清除指定数据集的缓存
 * 
 * @param {string} datasetName - 数据集名称
 */
function clearCache(datasetName) {
  try {
    var key = getCacheKey(datasetName);
    wx.removeStorageSync(key);
    console.log('🧹 已清除缓存:', datasetName);
  } catch (error) {
    console.error('❌ 清除缓存失败:', datasetName, error);
  }
}

module.exports = {
  saveToCache: saveToCache,
  loadFromCache: loadFromCache,
  clearCache: clearCache,
  getCacheKey: getCacheKey
};
```

---

## 四、使用示例

### 4.1 基本使用

```javascript
var CacheManager = require('../../utils/cache-manager.js');

Page({
  onLoad: function() {
    // 1️⃣ 优先从缓存加载
    var cachedData = CacheManager.loadFromCache('airports');
    
    if (cachedData) {
      console.log('✅ 使用缓存数据');
      this.setData({ airports: cachedData });
      return;
    }
    
    // 2️⃣ 缓存无效，从网络/分包加载
    this.loadAirportsFromSource().then(function(data) {
      // 3️⃣ 保存到缓存供下次使用
      CacheManager.saveToCache('airports', data);
      this.setData({ airports: data });
    }.bind(this));
  }
});
```

### 4.2 结合分包加载

```javascript
var CacheManager = require('../../utils/cache-manager.js');

/**
 * 加载分包数据（带缓存）
 */
async function loadPackageData() {
  // 1️⃣ 优先检查 Storage 缓存
  var cached = CacheManager.loadFromCache('package_data');
  if (cached && cached.length >= EXPECTED_COUNT) {
    console.log('✅ 从 Storage 恢复，跳过分包加载');
    return cached;
  }
  
  // 2️⃣ 检查 globalData（本次会话已加载）
  var app = getApp();
  if (app.globalData.packageDataLoaded) {
    var data = app.globalData.packageData;
    CacheManager.saveToCache('package_data', data);
    return data;
  }
  
  // 3️⃣ 触发分包加载（使用隐形占位页模式）
  await triggerPackageLoad();
  
  // 4️⃣ 从 globalData 获取并保存到缓存
  var loadedData = app.globalData.packageData;
  CacheManager.saveToCache('package_data', loadedData);
  
  return loadedData;
}
```

---

## 五、高级功能

### 5.1 旧缓存迁移

当首次启用版本隔离时，需要将旧的无前缀缓存迁移到新的版本化 Key：

```javascript
/**
 * 迁移旧版本缓存到新版本
 * 
 * @param {string} baseKey - 基础 Key 名称
 * @param {Object} options - 配置选项
 * @param {boolean} options.deleteOld - 是否删除旧 Key（默认 false）
 * @param {boolean} options.force - 是否强制覆盖（默认 false）
 */
function migrateLegacyCache(baseKey, options) {
  options = options || {};
  var deleteOld = options.deleteOld || false;
  var force = options.force || false;

  try {
    var oldKey = baseKey;  // 旧的无前缀 Key
    var newKey = VersionManager.getVersionedKey(baseKey);  // 新的版本化 Key

    // 检查迁移标记（避免重复迁移）
    var MIGRATION_FLAGS_KEY = 'cache_migration_flags';
    var migrationFlags = wx.getStorageSync(MIGRATION_FLAGS_KEY) || {};
    
    if (migrationFlags[baseKey] && !force) {
      console.log('📦 缓存已迁移，跳过:', baseKey);
      return { success: true, skipped: true };
    }

    // 读取旧缓存
    var oldCache = wx.getStorageSync(oldKey);
    if (!oldCache || Object.keys(oldCache).length === 0) {
      console.log('📦 旧缓存为空，无需迁移:', baseKey);
      migrationFlags[baseKey] = true;
      wx.setStorageSync(MIGRATION_FLAGS_KEY, migrationFlags);
      return { success: true, skipped: true };
    }

    // 检查新 Key 是否已有数据
    var newCache = wx.getStorageSync(newKey);
    if (newCache && Object.keys(newCache).length > 0 && !force) {
      console.log('📦 新缓存已存在，跳过迁移:', baseKey);
      migrationFlags[baseKey] = true;
      wx.setStorageSync(MIGRATION_FLAGS_KEY, migrationFlags);
      return { success: true, skipped: true };
    }

    // 执行迁移
    wx.setStorageSync(newKey, oldCache);
    console.log('✅ 缓存迁移成功:', oldKey, '->', newKey);

    // 标记已迁移
    migrationFlags[baseKey] = true;
    wx.setStorageSync(MIGRATION_FLAGS_KEY, migrationFlags);

    // 可选：删除旧 Key
    if (deleteOld) {
      wx.removeStorageSync(oldKey);
      console.log('🗑️ 已删除旧缓存:', oldKey);
    }

    return { success: true, migrated: true };
  } catch (error) {
    console.error('❌ 缓存迁移失败:', error);
    return { success: false, error: error };
  }
}
```

### 5.2 缓存统计

```javascript
/**
 * 获取所有版本的缓存统计
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
      storageSize: info.currentSize,
      storageLimit: info.limitSize
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
      } else if (key.indexOf('cache') !== -1 || key.indexOf('index') !== -1) {
        stats.legacy.count++;
        stats.legacy.keys.push(key);
      }
    });

    return stats;
  } catch (error) {
    console.error('❌ 获取缓存统计失败:', error);
    return null;
  }
}
```

### 5.3 清理指定环境缓存

```javascript
/**
 * 清理指定环境的所有缓存
 * 
 * @param {string} envVersion - 环境版本（develop/trial/release/all）
 */
function clearVersionCaches(envVersion) {
  try {
    var info = wx.getStorageInfoSync();
    var allKeys = info.keys || [];
    var removed = [];

    var prefixToRemove = '';
    switch (envVersion) {
      case 'develop': prefixToRemove = 'debug_'; break;
      case 'trial': prefixToRemove = 'trial_'; break;
      case 'release': prefixToRemove = 'release_'; break;
      case 'all': prefixToRemove = ''; break;  // 清理所有
    }

    allKeys.forEach(function(key) {
      var shouldRemove = false;

      if (envVersion === 'all') {
        if (key.indexOf('debug_') === 0 ||
            key.indexOf('trial_') === 0 ||
            key.indexOf('release_') === 0 ||
            key.indexOf('dev_') === 0) {
          shouldRemove = true;
        }
      } else if (key.indexOf(prefixToRemove) === 0) {
        shouldRemove = true;
      }

      if (shouldRemove) {
        wx.removeStorageSync(key);
        removed.push(key);
      }
    });

    console.log('✅ 清理完成，共清理', removed.length, '个缓存 Key');
    return { success: true, removed: removed };
  } catch (error) {
    console.error('❌ 清理缓存失败:', error);
    return { success: false, error: error };
  }
}
```

---

## 六、最佳实践清单

### 6.1 Key 命名规范

- [ ] 使用描述性的 `baseKey`（如 `airport_data`、`image_cache_index`）
- [ ] 避免在 `baseKey` 中包含版本信息（版本由 VersionManager 管理）
- [ ] 统一使用小写字母和下划线

### 6.2 缓存数据结构

```javascript
// ✅ 推荐的缓存数据结构
{
  data: { ... },           // 实际数据
  version: 'v1',           // 数据格式版本（非应用版本）
  timestamp: 1701849600000, // 缓存时间戳
  itemCount: 100           // 数据量（便于日志）
}
```

### 6.3 加载优先级

```
1️⃣ Storage 缓存 → 最快，优先使用
2️⃣ globalData → 本次会话已加载
3️⃣ 网络/分包 → 最慢，仅在缓存失效时使用
```

### 6.4 版本升级策略

| 场景 | 策略 |
|------|------|
| 数据格式不变 | 递增 `CACHE_FORMAT_VERSION`（如 `v1` → `v2`），自动失效旧缓存 |
| 应用版本升级 | Key 自动变化（`release_2.10.0_` → `release_2.11.0_`），缓存隔离 |
| 需要迁移数据 | 使用 `migrateLegacyCache()` 迁移旧缓存 |

---

## 七、调试命令

在微信开发者工具控制台执行：

```javascript
// 查看所有缓存 Key
console.log(wx.getStorageInfoSync().keys);

// 查看缓存统计
var VersionManager = require('./utils/version-manager.js');
console.log(VersionManager.getCacheStatistics());

// 清除真机调试缓存
VersionManager.clearVersionCaches('develop');

// 清除所有版本化缓存
VersionManager.clearVersionCaches('all');

// 手动删除某个缓存
wx.removeStorageSync('release_2.10.0_my_cache');
```

---

## 八、总结

| 问题 | 解决方案 |
|------|----------|
| 环境污染 | Key 前缀区分：`debug_` / `trial_` / `release_` |
| 版本冲突 | Key 包含版本号：`release_2.10.0_xxx` |
| 数据格式变更 | 缓存内部的 `version` 字段验证 |
| 缓存过期 | 缓存内部的 `timestamp` 字段验证 |
| 旧缓存迁移 | `migrateLegacyCache()` 方法 |

**核心原则**：通过版本化的 Storage Key，实现环境隔离和版本隔离，彻底解决缓存污染问题。
