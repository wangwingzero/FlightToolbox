# CLAUDE.md

请用中文回复

## 项目概述

FlightToolbox（飞行工具箱）是专为航空飞行员设计的微信小程序，**必须能够在完全离线环境下正常运行**。

### 离线优先设计（核心约束）

- **原因**: 飞行员在空中必须开启飞行模式，无法使用网络
- **要求**: 所有核心数据本地存储，音频文件本地缓存，分包预加载
- **测试**: 开发时必须验证飞行模式下所有功能正常

## 分包加载三层防护机制

**核心问题**：真机调试模式下 `wx.loadSubpackage` 不可用，微信会概率性清理分包缓存。

**解决方案**：
```javascript
// 第一层：占位页导航兜底
if (typeof wx.loadSubpackage !== 'function') {
  wx.navigateTo({ url: '/<packageRoot>/pages/placeholder/index' });
  setTimeout(() => wx.navigateBack(), 200);
}

// 第二层：版本化缓存Key
var VersionManager = require('./utils/version-manager.js');
var cacheKey = VersionManager.getVersionedKey('my_cache');

// 第三层：本地缓存系统
wx.getFileSystemManager().copyFile({
  srcPath: 分包资源路径,
  destPath: wx.env.USER_DATA_PATH + '/your-cache/file.ext'
});
```

**详细文档**：`分包缓存说明/` | `航线录音分包预加载规则记录/`

## 快速开始

```bash
cd miniprogram && npm install
# 微信开发者工具: 工具 -> 构建npm -> 编译
```

## 核心架构

### TabBar导航（5个主页面）
1. `pages/search/index` - 资料查询（首页）
2. `pages/flight-calculator/index` - 计算工具
3. `pages/cockpit/index` - 驾驶舱
4. `pages/operations/index` - 通信
5. `pages/home/index` - 我的首页

### 分包架构（57个）
- **功能分包**（20个）：packageA~packageTermCenter
- **音频分包**（30个）：按国家/地区分包
- **绕机检查分包**（6个）：packageWalkaround + Images1-4 + ImagesShared
- **通信失效分包**（1个）：packageCommFailure

### 技术栈
- TypeScript + glass-easel + Vant Weapp + SWC
- 懒加载: `lazyCodeLoading = "requiredComponents"`

## 核心开发原则

### 1. 使用BasePage基类（强制）
```javascript
var BasePage = require('../../utils/base-page.js');
var pageConfig = {
  data: { loading: false },
  customOnLoad: function(options) { /* 页面逻辑 */ }
};
Page(BasePage.createPage(pageConfig));
```

### 2. 跨分包引用必须异步
```javascript
require('../../packageA/data.js', function(data) {
  // 处理数据
}, function(error) {
  self.handleError(error, '加载数据失败');
});
```

### 3. 响应式布局使用rpx
```css
.container { width: 750rpx; font-size: 28rpx; }
```

### 4. GPS原始数据规则（严格禁止修改）
- GPS地速和高度**必须使用原始数据**，禁止滤波/平滑处理
- `gps-manager.js`中的 `applySmartFiltering`已禁用

### 5. 位置API规范
- 已申请：getLocation, chooseLocation, startLocationUpdate, onLocationChange
- 禁止使用：startLocationUpdateBackground（未申请）
- 页面销毁时必须调用 stopLocationUpdate 和 offLocationChange

### 6. 版本化缓存Key
```javascript
var VersionManager = require('./utils/version-manager.js');
var cacheKey = VersionManager.getVersionedKey('my_cache');
// 生成: 'debug_2.10.0_my_cache' 或 'release_2.10.0_my_cache'
```

## 音频分包配置（8步）

```
步骤1: 创建分包目录和音频文件
步骤2: 创建数据文件（data/regions/{country}.js）
步骤3: 统计大小并选择预加载页面
步骤4: 更新 app.json（subPackages + preloadRule）
步骤5: 更新 utils/audio-preload-guide.js
步骤6: 更新 utils/audio-config.js         ← 页面显示
步骤7: 更新 utils/audio-package-loader.js  ← 分包加载
步骤8: 更新 pages/audio-player/index.ts   ← 音频播放
```

**约束**：单页面预加载 < 2MB，禁止在TabBar页面预加载，音频压缩到32-48kbps

**详细文档**：`航线录音分包预加载规则记录/`

## 驾驶舱模块（18个）

位于 `pages/cockpit/modules/`：config.js, gps-manager.js, compass-manager.js, map-renderer.js, sensor-fusion-core.js 等

## 重要文件

| 文件 | 用途 |
|------|------|
| `utils/base-page.js` | 统一页面基类（必须使用） |
| `utils/version-manager.js` | 版本化缓存Key管理 |
| `utils/audio-cache-manager.js` | 音频本地缓存（300MB） |
| `utils/data-index-cache-manager.js` | 数据索引缓存（20x搜索加速） |
| `utils/audio-preload-guide.js` | 音频预加载引导 |

## 广告系统

| 广告位ID | 类型 | 用途 |
|---------|------|------|
| `adunit-d7a3b71f5ce0afca` | Banner | 我的首页底部 |
| `adunit-1a29f1939a1c7864` | Interstitial | 5个TabBar页面复用 |
| `adunit-735d7d24032d4ca8` | Grid | 特定功能区域 |

**其他横幅**：adunit-4e68875624a88762, adunit-3b2e78fbdab16389, adunit-2f5afef0d27dc863, adunit-d6c8a55bd3cb4fd1, adunit-3a1bf3800fa937a2

## 代码审查清单

- [ ] 使用BasePage基类
- [ ] 分包异步加载
- [ ] 飞行模式下正常工作
- [ ] rpx响应式布局
- [ ] GPS数据未经滤波
- [ ] 位置API正确清理
- [ ] 缓存Key使用版本化
- [ ] 分包加载后添加200ms延迟

## 项目规模

- 分包：57个 | 数据：30万+条 | 国家：31个 | 驾驶舱模块：18个

## 外部详细文档

- `分包缓存说明/` - 通用技术方案
- `航线录音分包预加载规则记录/` - 音频管理完整指南
- `缓存版本隔离完整修复方案.md` - 版本隔离详细说明
