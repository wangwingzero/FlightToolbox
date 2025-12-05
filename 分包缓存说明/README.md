# 微信小程序分包加载与缓存完整解决方案

**适用场景**：图片分包、音频分包、PDF分包等所有需要离线访问的资源
**核心突破**：占位页导航兜底 + 版本化缓存Key + 本地缓存系统
**最后更新**：2025-01-13
**验证状态**：✅ 已在FlightToolbox项目真机全场景验证通过

> 💡 **音频分包业务管理**：如需新增音频机场、故障排查、容量规划，请查看 [航线录音分包预加载规则记录](../航线录音分包预加载规则记录/)

---

## 📋 文档导航

### 🚀 核心文档（必读）

1. **[分包完整实现指南](./分包完整实现指南.md)** ⭐⭐⭐ 最重要
   - 8步完整实现流程
   - 占位页导航兜底方案（核心突破）
   - 版本化缓存Key（隔离机制）
   - 本地缓存系统（可选但推荐）
   - 完整代码模板（可直接复制）
   - 真机验证清单

2. **[分包制作全流程](./分包制作全流程.md)** ⭐⭐
   - 快速参考流程
   - 适用范围和术语说明
   - 常见问题与解法

---

## 🎯 核心突破（三层防护机制）

### 历史问题

微信小程序分包资源在真机调试和离线环境下存在严重问题：

| 问题 | 现象 | 影响 |
|------|------|------|
| **真机调试API限制** | `wx.loadSubpackage` 不可用 | 分包无法加载，资源404 |
| **Storage跨版本共享** | 真机调试和发布版本共享Storage | 调试污染生产环境 |
| **分包资源被清理** | 微信概率性清理分包缓存 | 离线重启后资源丢失 |

### 最终解决方案

```javascript
// 🔥 第一层：占位页导航兜底（核心突破）
if (typeof wx.loadSubpackage !== 'function') {
  // 真机调试模式：通过页面导航强制加载分包
  wx.navigateTo({ url: '/<packageRoot>/pages/placeholder/index' });
  setTimeout(() => wx.navigateBack(), 200);
}

// 🔥 第二层：版本化缓存Key（隔离机制）
var cacheKey = VersionManager.getVersionedKey('my_cache');
// 生成: 'debug_2.10.0_my_cache' 或 'release_2.10.0_my_cache'

// 🔥 第三层：本地缓存系统（可选但强烈推荐）
wx.getFileSystemManager().copyFile({
  srcPath: 分包资源路径,
  destPath: wx.env.USER_DATA_PATH + '/your-cache/file.ext'
});
```

---

## 🚀 快速开始

直接查看 **[分包完整实现指南](./分包完整实现指南.md)**，按照8步流程实现即可。
---

## 🔑 核心技术要点

### 1. 占位页导航兜底（核心突破）
- **问题**：真机调试模式下 `wx.loadSubpackage` 不可用
- **方案**：使用 `wx.navigateTo('/<packageRoot>/pages/placeholder/index')` 强制触发分包加载
- **时序**：导航后等待200ms再返回，确保分包完全就绪

### 2. 版本化缓存Key（隔离机制）
- **问题**：Storage在不同版本/环境之间物理共享
- **方案**：使用 `VersionManager.getVersionedKey(baseKey)` 生成版本化Key
- **效果**：`debug_*/trial_*/release_*` 前缀自动隔离不同环境

### 3. 本地缓存系统（可选但推荐）
- **问题**：分包资源可能被微信清理
- **方案**：首次加载后写入 `wx.env.USER_DATA_PATH`
- **效果**：重启小程序后依然可用，真正的离线持久化

---

## ✅ 验证清单

```bash
✅ 占位页存在且可导航
✅ app.json 使用 name（不是root）
✅ 版本化缓存Key已实施
✅ 真机调试测试通过
✅ 预览模式测试通过
✅ 飞行模式测试通过
```

---

## 🎯 应用场景

本方案已在FlightToolbox项目成功应用于：

| 资源类型 | 分包数量 | 资源数量 | 状态 |
|---------|---------|---------|------|
| 🖼️ 绕机检查图片 | 6个分包 | 54张图片 | ✅ 已实施 |
| 🎵 航线录音音频 | 31个分包 | 708条录音 | ✅ 已实施 |
| 📊 数据索引 | - | 30万+条数据 | ✅ 已实施 |

**技术通用性**：可扩展到PDF、视频等所有需要离线访问的分包资源。

---

## 📞 获取帮助

- 📖 详细实现：查看 [分包完整实现指南](./分包完整实现指南.md)
- 🚀 快速参考：查看 [分包制作全流程](./分包制作全流程.md)

---

**文档版本**：v1.0（最终方案）
**最后更新**：2025-01-XX
**验证状态**：✅ 真机全场景验证通过

---

## 🔑 缓存 Key 管理统一规范（推荐所有小程序复用）

> 本节以 FlightToolbox 现有实现为基线，抽象出一套可复用的缓存 Key 管理方案，供后续所有小程序/分包业务统一参考。

### 1. 设计目标

- **隔离不同环境**：开发者工具 / 真机调试（develop）/ 体验版（trial）/ 正式版（release）互不污染。
- **隔离不同版本**：同一环境下新旧版本的缓存可以并存或平滑迁移。
- **按功能可定位**：从 Key 名一眼能看出属于哪个业务模块、承载什么数据。
- **支持迁移与清理**：可以批量迁移旧 Key，也可以按环境、按模块清理。

### 2. 基础概念

- **Base Key（基础 Key）**：不带版本前缀的逻辑名称，例如：
  - `image_cache_index`（图片缓存索引）
  - `audio_preload_status`（音频预加载状态）
  - `walkaround_image_status`（绕机图片预加载状态）
- **Versioned Key（版本化 Key）**：通过 `VersionManager.getVersionedKey(baseKey)` 生成的真正用于 `wx.setStorageSync` 的 Key，例如：
  - `release_2.10.0_image_cache_index`
  - `debug_2.10.0_audio_preload_status`

在所有需要 **持久化到 Storage** 的缓存/状态中，**一律使用 Versioned Key，而不是裸的 Base Key**。

### 3. 命名规范

1. **Base Key 命名建议**
   - 统一使用 **小写+下划线**：`module_purpose_suffix`。
   - 建议带上项目前缀避免冲突，例如 FlightToolbox：`flight_toolbox_audio_preload_status`。
   - 尽量语义化：看名字就能知道大致内容和用途（`_index`、`_status`、`_cache` 等）。

2. **环境前缀与版本前缀**（由 `VersionManager` 统一生成）
   - develop（真机调试）：`debug_` + `version` + `_`。
   - trial（体验版）：`trial_` + `version` + `_`。
   - release（正式版）：`release_` + `version` + `_`。
   - 其他/开发者工具：`dev_` / `unknown_`。

3. **最终 Key 结构**

```text
<prefix><version>_<baseKey>
例：release_2.10.0_flight_toolbox_audio_preload_status
```

### 4. 推荐使用模板（模块内部）

> 下面是通用模板，已在 `AudioPreloadGuide` 等模块中实践通过，可以直接复制到新业务中使用，只需替换 Base Key 和字段结构。

1. **模块顶部定义 Base Key 与缓存 Key 变量**

```javascript
var VersionManager = require('./version-manager.js');

var STORAGE_KEY_BASE = 'flight_toolbox_audio_preload_status'; // 仅作为逻辑名
var STORAGE_KEY = ''; // 实际用于 Storage 的版本化 Key
```

2. **在构造函数或 init 中初始化版本化 Key**

```javascript
function AudioPreloadGuide() {
  if (!STORAGE_KEY) {
    STORAGE_KEY = VersionManager.getVersionedKey(STORAGE_KEY_BASE);
    console.log('✅ 音频预加载状态使用版本化key:', STORAGE_KEY);
  }

  // ... 其他初始化逻辑
}
```

3. **读写 Storage 时始终使用 `STORAGE_KEY`**

```javascript
// 读取
var preloadStatus = wx.getStorageSync(STORAGE_KEY) || {};

// 修改
preloadStatus[regionId] = Date.now();

// 写回
wx.setStorageSync(STORAGE_KEY, preloadStatus);
```

4. **首次初始化状态对象时加入 `_version` 字段（可选但推荐）**

```javascript
if (!preloadStatus || typeof preloadStatus !== 'object') {
  wx.setStorageSync(STORAGE_KEY, {
    _version: PRELOAD_STATUS_VERSION
  });
}
```

这样可以在状态结构本身发生变更时（字段调整、结构升级），通过 `_version` 字段做一次性迁移或清理。

### 5. 旧 Key 迁移策略

当项目从「非版本化 Key」升级为「版本化 Key」时，推荐使用 `VersionManager.migrateLegacyCache` / `batchMigrateCaches` 进行一次性迁移：

- **适用场景**：
  - 线上已经存在旧 Key（例如：`image_cache_index`）。
  - 现在希望改为 `release_2.10.0_image_cache_index` 等版本化形式。

- **迁移要点**：
  - 迁移函数会读取旧 Key 的内容，并写入到对应的版本化 Key。
  - 通过内部的 `cache_migration_flags` 记录已迁移的 baseKey，避免重复迁移。
  - 可选择是否删除旧 Key（一般建议 **保留一段时间，便于回滚**）。

> 建议做法：在调试工具页或一次性脚本中调用迁移函数，而不是放在正常业务路径里长期执行。

### 6. 缓存清理与统计（调试/运维）

`VersionManager` 已经内置了一套通用的缓存清理与统计能力，建议所有项目统一使用：

- **按环境清理版本化缓存**：
  - 清理真机调试缓存：`clearVersionCaches({ envVersion: 'develop' })`
  - 清理体验版缓存：`clearVersionCaches({ envVersion: 'trial' })`
  - 清理正式版缓存：`clearVersionCaches({ envVersion: 'release' })`
  - 清理所有带前缀的缓存：`clearVersionCaches({ envVersion: 'all' })`
- **仅清理指定模块相关的 Key**：
  - 通过 `baseKeys: ['image_cache_index', 'audio_preload_status']` 精确控制要清理哪些业务。
- **获取与打印缓存统计**：
  - `getCacheStatistics()`：返回各环境 Key 数量、总占用空间等。
  - `logCacheStatistics()`：直接在控制台打印详细列表，便于排查。

### 7. 推荐应用场景

所有「会写入 Storage 的持久状态」都建议使用版本化 Key 管理，包括但不限于：

- **分包预加载状态**：
  - 如音频分包、绕机图片分包、PDF 分包是否已引导/已预加载等。
- **资源缓存索引**：
  - 各类图片/音频/视频在本地 `wx.env.USER_DATA_PATH` 的缓存索引、大小统计等。
- **重型计算结果缓存**：
  - 一些代价较高的计算结果（如数据索引、解析结果）。
- **业务状态缓存**：
  - 用户最近浏览位置、阅读进度、离线任务队列等。

> 统一使用 `VersionManager.getVersionedKey(baseKey)` + 清晰的 Base Key 命名，可以保证：
> - 真机调试与正式版互不干扰；
> - 新旧版本可以安全共存或平滑迁移；
> - 运维和排查问题时可以快速识别和清理相关缓存。

