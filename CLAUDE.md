# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请用中文回复

## 📱 项目概述

FlightToolbox（飞行工具箱）是专为航空飞行员设计的微信小程序，**必须能够在完全离线环境下正常运行**。

### 🚨 离线优先设计（核心约束）

- **原因**: 飞行员在空中必须开启飞行模式，无法使用网络
- **要求**: 所有核心数据本地存储，音频文件本地缓存，分包预加载
- **测试**: 开发时必须验证飞行模式下所有功能正常

## 🔥 分包加载三层防护机制（核心突破）

**历史问题**：微信小程序分包资源在真机调试和离线环境下存在严重问题：
- ❌ 真机调试模式下 `wx.loadSubpackage` 不可用 → 分包无法加载
- ❌ 微信会概率性清理分包缓存 → 离线重启后资源丢失
- ❌ Storage在不同版本间物理共享 → 调试污染生产环境

**最终解决方案（三层防护）**：

```javascript
// 🔥 第一层：占位页导航兜底（核心突破）
if (typeof wx.loadSubpackage !== 'function') {
  // 真机调试模式：通过页面导航强制加载分包
  wx.navigateTo({ url: '/<packageRoot>/pages/placeholder/index' });
  setTimeout(() => wx.navigateBack(), 200);
}

// 🔥 第二层：版本化缓存Key（隔离机制）
var VersionManager = require('./utils/version-manager.js');
var cacheKey = VersionManager.getVersionedKey('my_cache');
// 生成: 'debug_2.10.0_my_cache' 或 'release_2.10.0_my_cache'

// 🔥 第三层：本地缓存系统（可选但强烈推荐）
wx.getFileSystemManager().copyFile({
  srcPath: 分包资源路径,
  destPath: wx.env.USER_DATA_PATH + '/your-cache/file.ext'
});
```

**关键技术要点**：
- ✅ **占位页必须存在**：每个分包必须有可导航页面（图片分包用`pages/placeholder/index`，音频分包用`index`）
- ✅ **app.json使用name**：`wx.loadSubpackage({ name: 'packageName' })`，不是root
- ✅ **200ms延迟**：`setTimeout(() => wx.navigateBack(), 200)` 确保分包完全就绪（真机测试验证）
- ✅ **版本化Storage Key**：所有缓存key必须使用`VersionManager.getVersionedKey()`
- ✅ **本地持久化**：资源写入`wx.env.USER_DATA_PATH`实现真正离线可用

**详细实现文档**：
- 🔧 **通用技术方案**：`分包缓存说明/`（所有资源类型）
- 🎵 **音频业务管理**：`航线录音分包预加载规则记录/`（新增机场、故障排查、容量规划）

---

## 🚀 快速开始

```bash
# 安装依赖
cd miniprogram && npm install

# 微信开发者工具: 工具 -> 构建npm -> 编译

# 预览时开启飞行模式验证离线功能
```

**Windows开发环境注意事项**：
- 项目在Windows环境下开发，路径使用反斜杠（\）
- 命令行使用PowerShell或CMD
- find命令在Windows下需要特殊处理（使用PowerShell的Get-ChildItem或Git Bash）
- 推荐使用微信开发者工具内置的终端执行npm命令

## 🏗️ 核心架构

### TabBar导航结构（5个主页面）

```javascript
TabBar顺序（当前最新版本）:
1. pages/search/index        - 资料查询（首页）
2. pages/flight-calculator/index - 计算工具
3. pages/cockpit/index       - 驾驶舱
4. pages/operations/index    - 通信（原名：航班运行）
5. pages/home/index          - 我的首页
```

**重要变更**：

- 默认首页已从"我的首页"改为"资料查询"
- "航班运行"页面已更名为"通信"
- "通信翻译"功能已从资料查询页面迁移到通信页面（作为第一个卡片）

### 分包架构（54个分包）

#### 功能分包（17个）

- `packageA` (icaoPackage): 民航英语词汇 - ICAO标准航空英语及应急特情词汇（1400+条）
- `packageB` (abbreviationsPackage): AIP标准及空客缩写（2万+条）
- `packageC` (airportPackage): 全球机场数据（7405个机场）
- `packageD` (definitionsPackage): 航空专业术语权威定义（3000+条）
- `packageF` (acrPackage): ACR计算工具
- `packageG` (dangerousGoodsPackage): 危险品规定查询
- `packageH` (twinEnginePackage): 双发飞机性能数据
- `packageCCAR` (caacPackage): CCAR民航规章（1447个文件）
- `packageIOSA` (iosaPackage): IATA运行安全审计术语（897条）
- `packageICAO` (icaoPublicationsPackage): ICAO出版物
- `packageO` (pagesPackage): 工具集合（28个子页面）
- `packageCompetence` (competencePackage): PLM胜任力及行为指标框架（13个胜任力，113个行为指标）
- `packageMedical` (medicalPackage): 民航体检标准（6大分类，完整标准数据）
- `packageRadiation` (radiationPackage): 航空辐射剂量计算工具
- `packageDuty` (dutyPackage): 执勤期计算器
- `packagePerformance` (performancePackage): 飞机性能手册（7大章节，8个附录，基于Airbus官方文档）
- `packageWalkaround` (walkaroundPackage): 绕机检查主分包

#### 音频分包（30个国家/地区）

**亚洲地区**：
- `packageJapan`, `packagePhilippines`, `packageKorean`, `packageSingapore`
- `packageThailand`, `packageSrilanka`, `packageMalaysia`, `packageIndonesia`
- `packageVietnam`, `packageIndia`, `packageCambodia`, `packageMyanmar`
- `packageMaldive`, `packageUzbekistan`
- `packageTaipei` (中国台北), `packageMacau` (中国澳门), `packageHongKong` (中国香港)

**欧洲地区**：
- `packageRussia`, `packageTurkey`, `packageFrance`, `packageItaly`, `packageUK`
- `packageSpain`, `packageGermany`, `packageHolland`

**美洲地区**：
- `packageAmerica`, `packageCanada`

**大洋洲地区**：
- `packageAustralia`, `packageNewZealand`

**非洲地区**：
- `packageEgypt`

**中东地区**：
- `packageUAE`

**音频分包策略**：

- 按国家/地区分包，避免单包过大
- 使用智能预加载机制（preloadRule配置）
- 覆盖全球主要航空枢纽

#### 绕机检查分包（6个）

- `packageWalkaround` (walkaroundPackage): 绕机检查主分包
- `packageWalkaroundImages1-4` (walkaroundImages1-4Package): 绕机检查图片分包（4个区域图片包）
- `packageWalkaroundImagesShared` (walkaroundImagesSharedPackage): 绕机检查共享图片分包

**绕机检查分包策略**：
- 按图片区域分包（Images1-4）+ 共享图片分包（ImagesShared）
- 实现本地缓存机制，支持离线查看高清图片
- 分包预加载确保飞行模式可用

#### 通信失效分包（1个）

- `packageCommFailure` (communicationFailurePackage): 通信失效处理分包

**通信失效分包说明**：
- 包含国内和国际通信失效处理流程
- 覆盖7大航路区域（太平洋、东欧、欧洲、中东、北美、南美、非洲）
- 提供国家/地区详细通信失效规定

### 技术栈配置

```javascript
核心配置（project.config.json + app.json）:
- TypeScript支持: 部分模块使用（app.ts、packageO、services）
- 组件框架: glass-easel（新一代小程序组件框架）
- UI组件库: Vant Weapp (@vant/weapp)
- 编译器: SWC + ES6转换
- 懒加载: lazyCodeLoading = "requiredComponents"
- 广告系统: 横幅广告（Banner Ad）+ 格子广告（Grid Ad）
```

### JavaScript/TypeScript语法支持（重要）

**微信小程序原生支持ES6+语法**：

```javascript
// ✅ 支持的ES6+特性（可直接使用）
- let/const 变量声明
- 箭头函数: () => {}
- 模板字符串: `hello ${name}`
- 解构赋值: const {a, b} = obj
- 类: class MyClass {}
- Promise/async/await
- 扩展运算符: ...args
- for...of 循环
```

**限制和注意事项**：

```javascript
// ❌ WXS脚本必须使用ES5语法
// WXS文件（.wxs）不支持ES6，必须用var、传统function

// ✅ 模块化使用CommonJS
const module = require('./path');  // 正确
// import module from './path';     // 不支持ES6 import/export

// ✅ TypeScript文件（.ts）完全支持
// operations/index.ts、flight-calculator/index.ts等可安全使用TS+ES6
```

**项目编译配置**：
- `project.config.json`已启用`"es6": true`
- 开发时直接使用ES6+语法，工具会自动处理兼容性
- 推荐使用现代JavaScript编码风格（let/const、箭头函数、async/await等）

## 🔐 版本化缓存Key使用规范

**核心问题**：微信小程序的Storage和文件系统在不同版本之间**物理共享**（发布版、真机调试、体验版使用同一存储空间）。

**新模块开发规范**（必须遵循）：

```javascript
var VersionManager = require('./utils/version-manager.js');

// 1. 定义基础key和实际key
var MY_CACHE_KEY_BASE = 'my_cache';
var MY_CACHE_KEY = '';

// 2. 初始化时设置版本化key
function init() {
  MY_CACHE_KEY = VersionManager.getVersionedKey(MY_CACHE_KEY_BASE);
  // 生成: 'debug_2.10.0_my_cache' 或 'release_2.10.0_my_cache'
  var cache = wx.getStorageSync(MY_CACHE_KEY) || {};
}

// 3. 保存缓存时使用版本化key
function saveCache(data) {
  wx.setStorageSync(MY_CACHE_KEY, data);
}
```

**已实施版本隔离的模块**：
- ✅ 绕机检查图片缓存（`packageWalkaround/pages/index/index.js`）
- ✅ 航线录音音频缓存（`utils/audio-cache-manager.js`，300MB空间）
- ✅ 数据索引缓存（`utils/data-index-cache-manager.js`，20倍搜索性能提升）

**真机调试注意事项**：
- ✅ 清除缓存时使用"清除当前版本缓存"
- ❌ 禁止使用"清除所有版本缓存"（影响发布版用户）
- 🔧 图片无法显示时使用"修复图片缓存"功能（我的首页 → 缓存管理）

**相关文档**：`缓存版本隔离完整修复方案.md` / `utils/version-manager.js`

## 📋 核心开发原则（必须遵循）

### 1. 离线优先（最高优先级）

- ✅ 所有核心功能必须在飞行模式下可用
- ✅ 数据存储在本地，不依赖网络
- ✅ 分包预加载，避免运行时加载失败

### 2. 使用BasePage基类（强制要求）

```javascript
// ✅ 正确方式
var BasePage = require('../../utils/base-page.js');
var pageConfig = {
  data: { loading: false },
  customOnLoad: function(options) {
    // 页面逻辑
  }
};
Page(BasePage.createPage(pageConfig));

// ❌ 错误方式
Page({
  onLoad() {} // 不使用BasePage
});
```

### 3. 跨分包引用必须异步

```javascript
// ✅ 正确方式
require('../../packageA/data.js', function(data) {
  // 处理数据
}, function(error) {
  self.handleError(error, '加载数据失败');
});

// ❌ 错误方式
var data = require('../../packageA/data.js'); // 生产环境可能失败
```

### 4. 响应式布局使用rpx单位

```css
/* ✅ 正确使用rpx (750rpx = 全屏宽度) */
.container {
  width: 750rpx;        /* 全屏宽度 */
  padding: 20rpx;       /* 响应式内边距 */
  font-size: 28rpx;     /* 响应式字体 */
}

/* ❌ 避免固定像素 */
.bad-container {
  width: 375px;         /* 仅适配iPhone6 */
}
```

### 5. GPS原始数据规则（严格禁止修改）

- 🚨 **GPS地速和GPS高度必须使用原始数据**
- 🚨 **禁止对GPS数据使用滤波、平滑等算法处理**
- 🚨 **`gps-manager.js`中的 `applySmartFiltering`已禁用，直接返回原始数据**
- ✅ GPS地速显示为整数（使用 `Math.round()`）
- ✅ GPS高度从米转英尺后直接显示，无平滑处理

### 6. 位置API使用规范

项目已申请以下四个位置API，严格按规范使用：

```javascript
// ✅ 1. wx.getLocation - 一次性获取位置
wx.getLocation({
  type: 'gcj02',
  altitude: true,
  isHighAccuracy: true,
  success: function(res) { /* ... */ }
});

// ✅ 2. wx.startLocationUpdate + wx.onLocationChange - 持续监控
wx.startLocationUpdate({
  type: 'gcj02',
  success: function() {
    wx.onLocationChange(function(res) {
      // 处理位置更新
    });
  }
});

// ✅ 3. 页面销毁时必须清理
wx.stopLocationUpdate();
wx.offLocationChange();

// ❌ 禁止使用未申请的后台定位API
// wx.startLocationUpdateBackground(); // 未申请，禁止使用
```

## 🎵 航线录音分包管理（重要）

### ⚠️ 核心经验总结

这是项目中最复杂的部分之一，经过多次试错才找到正确方法。**详细文档见**：`航线录音分包预加载规则记录/` 文件夹

## 🖼️ 图片分包本地缓存机制（关键突破）

### ⚠️ 核心发现：分包资源真正写入本地的方法

**历史问题**：仅依赖 `wx.loadSubpackage` 和 `preloadRule` 不能保证离线稳定性
- 分包资源可能被微信清理（概率性）
- 开发者工具与真机环境差异巨大
- 二次启动时图片可能黑屏或404

**解决方案**：三层防护机制（2025-01-04重大突破，2025-01-08完善）

**🔥 2025-01-08 重要更新**：实现缓存优先策略，彻底解决真机调试模式图片显示问题。详见：`航线录音分包预加载规则记录/修复说明/2025-01-08-绕机检查图片缓存优先策略修复.md`

**核心改进**：
1. ✅ **缓存优先检查**：优先检查本地缓存，全部缓存则跳过分包加载
2. ✅ **真机调试模式支持**：正确处理 `wx.loadSubpackage` 不可用的情况
3. ✅ **智能状态管理**：真机调试模式下保留预加载状态，避免重复引导

```javascript
// 🔥 关键技术：将分包图片写入 wx.env.USER_DATA_PATH
var IMAGE_CACHE_DIR = wx.env.USER_DATA_PATH + '/walkaround-images';
var IMAGE_CACHE_INDEX_KEY = 'walkaround_image_cache_index';

// 第一层防护：缓存优先检查（2025-01-08新增）
function ensurePackageLoaded(areaId) {
  // 1. 优先检查该区域所有图片是否已缓存
  return checkAreaImagesCached(areaId).then(function(allCached) {
    if (allCached) {
      console.log('✅ 所有图片已缓存，跳过分包加载');
      return true;  // 直接使用缓存，无需分包加载
    }

    // 2. 检测环境
    if (EnvDetector.isDevTools()) {
      return false;  // 开发者工具跳过
    }

    // 3. 检测真机调试模式（真机 + wx.loadSubpackage 不可用）
    if (typeof wx.loadSubpackage !== 'function') {
      console.warn('⚠️ 真机调试模式：将尝试直接访问分包资源');
      return true;  // 标记成功，让后续流程尝试加载
    }

    // 4. 真机运行模式：使用 wx.loadSubpackage
    return loadSubpackage(packageName);
  });
}

// 第二层防护：主动加载分包（真机运行模式）
wx.loadSubpackage({
  name: 'packageName',
  success: function() {
    // 200ms延迟确保分包完全就绪（经真机测试验证稳定）
    setTimeout(() => showDetails(), 200);
  }
});

// 第三层防护：本地缓存（核心突破）
wx.getImageInfo({
  src: originalSrc,  // 分包图片路径
  success: function(res) {
    // 🔥 关键：将图片复制到本地文件系统
    wx.getFileSystemManager().copyFile({
      srcPath: res.path,
      destPath: IMAGE_CACHE_DIR + '/cached_image.png',
      success: function() {
        // 后续直接使用 wxfile:// 路径，彻底离线化
      }
    });
  }
});

// 第三层：智能兜底
handleImageError: function(event) {
  // 1. 检查开发者工具环境（避免误判）
  if (typeof wx.loadSubpackage !== 'function') {
    console.warn('开发者工具环境，忽略错误');
    return;
  }

  // 2. 检查本地缓存
  var cachedPath = this.getCachedImagePath(cacheKey);
  if (cachedPath) {
    // 直接使用缓存
    this.updateCachedSrcInData(cacheKey, cachedPath);
    return;
  }

  // 3. 检查预加载状态
  this.preloadGuide.checkPackagePreloaded(areaId).then(function(isPreloaded) {
    if (isPreloaded) {
      // 已预加载，瞬时错误，自动重试（最多3次）
      if (retryCount < 3) {
        setTimeout(() => retry(), 300);
      }
    } else {
      // 未���加载，显示引导弹窗
      showGuideDialog();
    }
  });
}
```

### 核心原则（必须遵循）

1. **开发者工具环境检测（关键！）**
   ```javascript
   // ✅ 必须添加
   var isDevTools = (typeof wx.loadSubpackage !== 'function');
   if (isDevTools) {
     console.warn('开发者工具环境：图片加载失败是正常现象');
     return;  // 不执行任何错误处理
   }
   ```
   - 开发者工具不支持 `wx.loadSubpackage`
   - 图片路径在开发者工具中可能返回404
   - **绝对不能**在开发环境中清除预加载状态

2. **时序优化（200ms延迟）**
   ```javascript
   wx.loadSubpackage({
     success: function() {
       // 🔥 关键：添加200ms延迟确保分包完全就绪
       // 经真机测试验证，200ms在保证稳定性的同时响应速度更快
       setTimeout(() => {
         showAreaDetails();
       }, 200);
     }
   });
   ```

3. **本地缓存索引管理**
   ```javascript
   // 初始化缓存目录
   try {
     wx.getFileSystemManager().accessSync(IMAGE_CACHE_DIR);
   } catch (err) {
     wx.getFileSystemManager().mkdirSync(IMAGE_CACHE_DIR, true);
   }

   // 读取缓存索引
   this.imageCacheIndex = wx.getStorageSync(IMAGE_CACHE_INDEX_KEY) || {};
   ```

4. **防止重复缓存（Promise管理）**
   ```javascript
   // 使用Promise缓存，避免同一图片并发写入
   if (!this.imageCachePromises[cacheKey]) {
     this.imageCachePromises[cacheKey] = new Promise(function(resolve) {
       // 执行缓存逻辑
     }).finally(function() {
       delete this.imageCachePromises[cacheKey];
     });
   }
   ```

### 应用场景

**当前应用**：
- `packageWalkaround/pages/index/index.js` - 绕机检查图片系统（已实现）

**可扩展场景**：
- ✅ 所有需要离线显示的图片资源
- ✅ 分包中的静态图片资源
- ✅ 需要在飞行模式下稳定访问的资源

### 详细文档

**修复说明**：
- `航线录音分包预加载规则记录/修复说明/2025-01-04-绕机检查图片加载问题修复.md` - 完整技术文档

**核心经验**：
1. **主动加载 + 被动兜底缺一不可**
2. **离线资源必须本地化**：仅依赖分包路径不可靠
3. **开发者工具环境 ≠ 真机环境**：必须环境检测
4. **自动重试比弹窗更友好**：已预加载的资源自动重试
5. **时序问题很关键**：200ms延迟在真机测试中已验证稳定（初版500ms，优化后200ms）

### 快速验证命令

#### 方式1：真机调试工具验证（推荐 ⭐⭐⭐）

```bash
步骤：
1. 打开微信开发者工具
2. 点击"真机调试"按钮
3. 使用微信扫码连接真机
4. 进入"Storage"选项卡
5. 选择"文件系统" → usr → walkaround-images
6. 验证文件列表是否存在缓存的PNG文件
```

**优点**：
- ✅ 可视化查看文件列表
- ✅ 可以查看文件大小和创建时间
- ✅ 可以直接预览图片内容

---

#### 方式2：代码验证（快速 ⭐⭐）

```javascript
// 在任意页面的console中执行（推荐在app.js的onLaunch中添加）

// 1. 验证缓存目录和文件
var fs = wx.getFileSystemManager();
fs.readdir({
  dirPath: wx.env.USER_DATA_PATH + '/walkaround-images',
  success: function(res) {
    console.log('✅ 缓存目录存在');
    console.log('📁 缓存文件数量:', res.files.length);
    console.log('📋 文件列表:', res.files);
  },
  fail: function(err) {
    console.log('❌ 缓存目录不存��或为空');
    console.log('错误信息:', err);
  }
});

// 2. 验证缓存索引
var cacheIndex = wx.getStorageSync('walkaround_image_cache_index');
console.log('📊 缓存索引:', cacheIndex);
console.log('📊 已缓存图片数量:', Object.keys(cacheIndex || {}).length);

// 3. 验证存储空间使用情况
wx.getStorageInfo({
  success: function(res) {
    var usedMB = (res.currentSize / 1024).toFixed(2);
    var limitMB = (res.limitSize / 1024).toFixed(2);
    var usagePercent = ((res.currentSize / res.limitSize) * 100).toFixed(1);
    console.log('💾 存储使用情况: ' + usedMB + 'MB / ' + limitMB + 'MB (' + usagePercent + '%)');
  }
});
```

---

#### 方式3：日志验证（实时 ⭐）

**在真机运行时观察控制台日志**：

```bash
# 预期日志（成功场景）
🎯 用户点击区域 5，主动确保图片分包已加载
🔄 主动加载分包: walkaroundImages2Package (区域 5)
✅ 分包主动加载成功: walkaroundImages2Package
✅ 已标记 5-8 为预加载完成
✅ 延迟后显示详情，确保分包完全就绪
✅ 从本地缓存加载: area5_xxx.png
✅ 已缓存图片到本地: wxfile://usr/walkaround-images/area5_xxx.png
```

**关键日志关键词**：
- `✅ 已缓存图片到本地` → 缓存写入成功
- `✅ 从本地缓存加载` → 使用缓存加载
- `📦 从分包加载` → 使用分包加载
- `🌐 从网络加载` → 使用网络加载（不应该出现）

---

#### 方式4：功能测试（完整 ⭐⭐⭐）

```bash
测试步骤：

【首次完整流程】
1. 清除小程序缓存（删除小程序）
2. 重新打开小程序
3. 访问"日出日落"页面 → 触发区域5-8图片分包预加载
4. 访问"绕机检查" → 点击区域5
   ✅ 预期：图片正常显示 + 控制台出现"已缓存图片到本地"日志

【飞行模式重启测试】
5. 关闭小程序
6. 开启飞行模式（完全断网）
7. 重新打开小程序
8. 访问"绕机检查" → 点击区域5
   ✅ 预期：图片正常显示 + 无需重新预加载 + 无黑屏

【大图预览测试】
9. 点击任意缩略图
   ✅ 预期：大图即时显示 + 可左右滑动切换9张图片 + 加载速度快

【极端兜底测试】
10. 手动清空缓存目录（开发者工具 -> Storage -> Files -> 删除walkaround-images）
11. 保持飞行模式，重新进入绕机检查 → 区域5
    ✅ 预期：显示"图片加载失败"提示 + 引导重新预加载
```

### ❓ 常见问题（FAQ）

#### Q1: 为什么需要添加200ms延迟？可以去掉吗？

**A**: 不建议去掉。经过多次测试发现：
- **0ms（无延迟）**：图片加载失败率约10-15%
- **100ms**：低端设备偶尔失败（约5%概率）
- **200ms**：真机测试完全稳定（0%失败率） ✅ **推荐**
- **500ms**：过度保守，用户感知延迟明显

**原因**：`wx.loadSubpackage` 的 `success` 回调触发时，分包文件可能还在写入文件系统。添加延迟确保文件系统操作完成。

**特殊情况**：
- 开发者工具：延迟无效（不支持分包加载）
- 高端设备：100ms可能足够，但为保证低端设备兼容性，建议统一使用200ms

---

#### Q2: 本地缓存会占用多少存储空间？

**A**:
- **单个图片**：约100-300KB（PNG格式）
- **绕机检查（9个区域，54张图片）**：约10-15MB
- **微信小程序本地存储限制**：
  - 默认：10MB
  - 可扩展：最高200MB（需向微信申请）

**存储优化建议**：
```javascript
// 1. 定期清理旧缓存（LRU策略）
function cleanOldCache() {
  var index = wx.getStorageSync(IMAGE_CACHE_INDEX_KEY) || {};
  var sortedKeys = Object.keys(index).sort(function(a, b) {
    return index[a].timestamp - index[b].timestamp;
  });

  // 保留最近30天的缓存
  var now = Date.now();
  var thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  sortedKeys.forEach(function(key) {
    if (index[key].timestamp < thirtyDaysAgo) {
      // 删除文件和索引
      wx.getFileSystemManager().unlinkSync(index[key].path);
      delete index[key];
    }
  });

  wx.setStorageSync(IMAGE_CACHE_INDEX_KEY, index);
}

// 2. 监控存储空间
wx.getStorageInfo({
  success: function(res) {
    var usedMB = (res.currentSize / 1024).toFixed(2);
    var limitMB = (res.limitSize / 1024).toFixed(2);
    console.log('存储使用情况:', usedMB + 'MB / ' + limitMB + 'MB');

    if (res.currentSize / res.limitSize > 0.8) {
      // 使用超过80%，触发清理
      cleanOldCache();
    }
  }
});
```

---

#### Q3: 开发者工具中看到"图片加载失败"正常吗？

**A**: **完全正常！** 这是预期行为。

**原因**：
- 开发者工具不支持 `wx.loadSubpackage` API
- 图片路径在开发者工具中会返回404错误
- 这不影响真机运行

**如何验证**：
```javascript
// 方法1：检测环境
var isDevTools = (typeof wx.loadSubpackage !== 'function');
console.log('当前环境:', isDevTools ? '开发者工具' : '真机');

// 方法2：真机调试（推荐）
// 1. 微信开发者工具 -> 预览 -> 扫码
// 2. 或：工具 -> 真机调试
// 3. 在真机上测试图片加载功能
```

**注意事项**：
- ✅ **真机测试是唯一可靠的验证方式**
- ❌ 不要在开发者工具中判断功能是否正常
- ⚠️ 如果代码中有 `if (isDevTools) return;` 逻辑，开发者工具中看不到任何错误提示是正常的

---

#### Q4: 如何判断图片是从缓存加载还是分包加载？

**A**: 可以通过日志和路径前缀判断：

```javascript
// 在handleImageLoad中添加日志
handleImageLoad: function(event) {
  var src = event.currentTarget.dataset.src || event.detail.src;
  var cacheKey = event.currentTarget.dataset.cacheKey;

  // 判断加载来源
  if (src.startsWith('wxfile://')) {
    console.log('✅ 从本地缓存加载:', cacheKey);
  } else if (src.startsWith('/package')) {
    console.log('📦 从分包加载:', cacheKey);
  } else {
    console.log('🌐 从网络加载:', src);
  }

  // ... 后续缓存逻辑
}
```

**路径前缀对照表**：
| 前缀 | 来源 | 性能 | 离线可用 |
|------|------|------|---------|
| `wxfile://usr/` | 本地缓存 | ⭐⭐⭐⭐⭐ 最快 | ✅ 是 |
| `/packageXXX/` | 分包 | ⭐⭐⭐⭐ 快 | ⚠️ 可能 |
| `https://` | 网络 | ⭐⭐ 慢 | ❌ 否 |

---

#### Q5: 如果缓存损坏或丢失怎么办？

**A**: 系统会自动降级到分包加载，并重新缓存。

**降级流程**：
```javascript
handleImageError: function(event) {
  // 1. 尝试从缓存加载
  var cachedPath = this.getCachedImagePath(cacheKey);
  if (cachedPath) {
    // 验证缓存文件是否存在
    try {
      wx.getFileSystemManager().accessSync(cachedPath);
      this.updateCachedSrcInData(cacheKey, cachedPath);
      return; // 缓存可用
    } catch (err) {
      // 缓存文件不存在，清除索引
      delete this.imageCacheIndex[cacheKey];
      this.persistImageCacheIndex();
    }
  }

  // 2. 降级到分包加载
  if (isPreloaded) {
    // 自动重试（最多3次）
    if (retryCount < 3) {
      setTimeout(() => retry(), 300);
    }
  } else {
    // 显示引导弹窗
    showGuideDialog();
  }
}
```

**缓存自我修复**：
- ✅ 如果缓存索引存在但文件丢失 → 自动清除索引，重新缓存
- ✅ 如果分包加载成功 → 自动重建缓存
- ✅ 如果重试3次仍失败 → 清除预加载标记，引导用户重新预加载

---

#### Q6: 这个方案可以用于音频分包吗？

**A**: **已经实现！** 音频缓存系统已完整上线（2025-01-04）。

**音频缓存架构**：

项目已实现完整的音频本地缓存系统，位于 `miniprogram/utils/`：

| 管理器 | 文件 | 功能 | 状态 |
|--------|------|------|------|
| 🎵 音频缓存管理器 | `audio-cache-manager.js` | 本地缓存、LRU清理、空间管理 | ✅ 已上线 |
| 🔥 智能预热管理器 | `audio-preheat-manager.js` | WiFi预热、历史记录、收藏管理 | ✅ 已上线 |
| 🏥 健康检查管理器 | `cache-health-manager.js` | 完整性检查、自动修复 | ✅ 已上线 |
| 📊 数据索引管理器 | `data-index-cache-manager.js` | 关键词索引、20x搜索加速 | ✅ 已上线 |

**核心特性**：

```javascript
// 1. 自动缓存（首次播放后）
AudioCacheManager.ensureAudioCached(cacheKey, originalSrc)
  .then(function(cachedPath) {
    // 返回 wxfile://usr/audio-recordings/xxx.mp3
    // 后续播放直接使用本地路径
  });

// 2. WiFi智能预热
AudioPreheatManager.startPreheat()
  .then(function(result) {
    // 自动缓存：收藏航线、常听航线、最近7天播放
    console.log('成功:', result.success, '失败:', result.failed);
  });

// 3. 健康检查与修复
CacheHealthManager.getHealthReport()
  .then(function(report) {
    // 检查：音频缓存、图片缓存、数据索引、存储空间
  });

CacheHealthManager.autoRepair()
  .then(function(result) {
    // 自动清理：无效缓存、过期索引
  });
```

**关键差异**：
| 资源类型 | 获取信息API | 缓存管理器 | 缓存大小限制 | 状态 |
|---------|------------|----------|------------|------|
| 图片 | `wx.getImageInfo` | 内置于 `packageWalkaround` | ~20MB | ✅ 已实现 |
| 音频 | `wx.getFileSystemManager().getFileInfo` | `audio-cache-manager.js` | **300MB** | ✅ 已实现 |
| 数据索引 | - | `data-index-cache-manager.js` | ~5MB | ✅ 已实现 |
| PDF | `wx.getFileInfo` | 💡 可扩展 | 待定 | 💡 未来考虑 |

---

### 🔥 技术通用性说明

**这个本地缓存方案已应用于所有需要离线稳定访问的分包资源**：

| 资源类型 | 当前状态 | 适用场景 | 实际收益 | 性能提升 | 优先级 |
|---------|---------|---------|---------|---------|--------|
| 🎵 音频资源 | ✅ 已实现 | 31个音频分包（航线录音） | 🔥 高（离线稳定性↑95%，"play audio fail"减少90%） | 🚀 首次播放后秒开 | P0 |
| 🖼️ 图片资源 | ✅ 已实现 | 绕机检查图片系统 | 🔥 高（离线稳定性↑80%，黑屏问题解决） | 🚀 加载速度4-5x | P0 |
| 📊 数据索引 | ✅ 已实现 | CCAR规章、ICAO词汇、AIP缩写、机场数据 | 🔥 高（搜索速度↑20x，100ms→5ms） | 🚀 搜索响应即时化 | P0 |
| 📄 PDF文档 | 💡 可扩展 | ICAO出版物等 | 💬 低（PDF较小，加载较稳定） | 💡 中等提升 | P3 |
| 🎬 视频资源 | 💡 可扩展 | 培训视频等 | 💬 低（视频较少使用） | 💡 需考虑存储 | P4 |

**收益说明**：
- **离线稳定性**：飞行模式下二次启动资源可用率（无缓存 vs 有缓存）
- **性能提升**：加载速度提升倍数、搜索响应时间缩短
- **用户体验**：减少加载失败提示、预加载引导次数、等待时间

**已实现的缓存系统**：

```javascript
// ✅ 1. 音频缓存系统（2025-01-04上线）
miniprogram/utils/audio-cache-manager.js      // 300MB缓存空间
miniprogram/utils/audio-preheat-manager.js    // WiFi智能预热
miniprogram/utils/cache-health-manager.js     // 统一健康检查

// ✅ 2. 图片缓存系统（2025-01-04上线）
miniprogram/packageWalkaround/pages/index/index.js  // 内置图片缓存

// ✅ 3. 数据索引系统（2025-01-04上线）
miniprogram/utils/data-index-cache-manager.js // 关键词索引缓存
```

**性能优化要点**（2025-01-04更新）：

1. ✅ **异步文件操作**：所有文件I/O使用异步API，避免阻塞主线程
2. ✅ **并发删除优化**：LRU清理使用Promise.all并发删除文件（5-10x提速）
3. ✅ **输入验证**：防止路径穿越攻击（正则表达式白名单）
4. ✅ **环境检测**：区分开发工具与真机环境，避免误报
5. ✅ **算法优化**：索引构建使用Set替代Array（O(1) vs O(n)，50%提速）
6. ✅ **缓存索引可添加版本号**：资源更新时清理旧缓存

**使用示例**（我的首页已集成）：

```javascript
// pages/home/index.js 中已集成的功能

// 1. 查看音频缓存统计
showAudioCacheStats: function() {
  var stats = AudioCacheManager.getCacheStats();
  // 显示：已缓存数量、占用空间、使用率
}

// 2. 启动智能预热
startAudioPreheat: function() {
  AudioPreheatManager.startPreheat().then(function(result) {
    // 根据用户历史和收藏自动缓存音频
  });
}

// 3. 健康检查与修复
showCacheHealthReport: function() {
  CacheHealthManager.getHealthReport().then(function(report) {
    // 检查所有缓存系统的健康状况
  });
}
```

---

### ⚡ 性能影响分析（2025-01-04更新）

#### 内存占用

| 组件 | 大小 | 说明 |
|------|------|------|
| 音频缓存索引 | 5-20KB | 存储在Storage中，约1000个音频文件索引 |
| 图片缓存索引 | 1-5KB | 存储在Storage中，绕机检查54张图片索引 |
| 数据关键词索引 | 50-200KB | 内存中，CCAR/ICAO/AIP等大型数据集索引 |
| Promise管理器 | <1KB | 仅在缓存写入时临时占用 |
| 文件系统句柄 | <1KB | wx.getFileSystemManager()实例 |

**总内存占用**：
- 音频系统：约20-30MB（常用航线音频缓存）
- 图片系统：约10-15MB（绕机检查54张图片）
- 数据索引：约1-3MB（关键词映射表）
- **合计**：约30-50MB（对比300MB缓存空间，内存占用极小）

#### 首次加载时间对比

**测试环境**：
- 设备：iPhone 13 Pro / 小米11
- 网络：WiFi / 4G / 飞行模式
- 资源：PNG图片（1024x768）、MP3音频（32kbps）

| 场景 | 无本地缓存 | 有本地缓存 | 提速倍数 | 稳定性提升 |
|------|----------|----------|---------|-----------|
| 🎵 音频首次播放 | 500-1200ms | 80-150ms | **6-15倍** ⭐⭐⭐ | - |
| 🎵 音频重复播放 | 200-500ms | **50-80ms** | **4-10倍** ⭐⭐⭐ | 离线可用↑95% |
| 🖼️ 图片首次加载 | 200-500ms | 50-100ms | **4-5倍** ⭐⭐ | - |
| 🖼️ 大图预览 | 300-800ms | 50-100ms | **6-8倍** ⭐⭐ | - |
| 📊 数据搜索（CCAR） | 100-200ms | **5-10ms** | **20倍** ⭐⭐⭐ | 搜索响应即时化 |
| 🚀 离线二次启动 | 可能失败 | 稳定加载 | 稳定性↑80-95% | **关键改进** ⭐⭐⭐ |

**关键发现**：
- ✅ **音频缓存**：首次播放后，后续播放速度提升6-15倍，飞行模式下100%可用
- ✅ **图片缓存**：解决黑屏和404问题，离线稳定性提升80%
- ✅ **数据索引**：搜索速度20倍提升，CCAR规章1447个文件秒级响应
- ✅ **用户体验**：减少"play audio fail"错误90%，预加载引导次数减少80%

#### 网络流量

| 阶段 | 流量消耗 | 说明 |
|------|---------|------|
| 首次加载 | 2-5MB per package | 需要下载分包 |
| 二次加载（无缓存） | 0-5MB | 概率性重新下载 |
| 二次加载（有缓存） | **0MB** ✅ | 完全离线 |

**节省流量**：平均每次启动节省2-5MB（假设每天打开5次，月节省300-750MB）

#### 性能对比总结

| 指标 | 无本地缓存 | 有本地缓存 | 提升幅度 |
|-----|----------|----------|---------|
| 离线稳定性 | 60-70% | **99%+** | ↑40% ⭐⭐⭐ |
| 二次加载速度 | 200-500ms | **50-100ms** | 4-5倍 ⭐⭐ |
| 网络依赖 | 中等 | **无** | 完全离线 ⭐⭐⭐ |
| 存储占用 | 0MB | 10-15MB | 可接受 ✅ |
| 实施复杂度 | N/A | 低 | 2-3天 ✅ |

**结论**：
- ✅ **推荐在所有离线场景下实施本地缓存**
- ✅ **投入产出比极高**（2-3天开发时间，换取80%稳定性提升）
- ✅ **用户体验显著改善**（加载速度提升4-5倍）

---

### 8步配置流程（不是5步！）

**历史教训**：最初只做了5步配置，导致UK和Chinese Taipei音频无法播放。经过排查发现，**必须完成全部8步**：

```bash
步骤1: 创建分包目录和音频文件
步骤2: 创建数据文件（data/regions/{country}.js）
步骤3: 统计大小并选择预加载页面
步骤4: 更新 app.json（subPackages + preloadRule）
步骤5: 更新 utils/audio-preload-guide.js
步骤6: 更新 utils/audio-config.js         ← 🔥 关键（页面显示）
步骤7: 更新 utils/audio-package-loader.js  ← 🔥 关键（分包加载）
步骤8: 更新 pages/audio-player/index.ts   ← 🔥 关键（音频播放）
```

**步骤6-8经常被遗漏**，导致音频无法播放！

### 3个核心配置文件

```javascript
// 1. audio-config.js - 控制页面显示
// 缺少：航线录音页面看不到国家卡片
this.regions = [
  { id: 'uk', name: '英国', ... }
];
this.airports = [
  { regionId: 'uk', clips: ukData.clips, ... }
];

// 2. audio-package-loader.js - 控制分包加载
// 缺少：点击播放时提示"分包加载失败"
this.packageMapping = {
  'uk': {
    packageName: 'ukAudioPackage',
    packageRoot: 'packageUK'
  }
};

// 3. audio-player/index.ts - 控制音频播放
// 缺少：播放器初始化失败，音频无法播放
const regionPathMap = {
  'uk': '/packageUK/'  // ⚠️ 前后都要斜杠
};
```

### 关键约束

```javascript
⚠️ 微信小程序限制：
1. 单页面预加载总大小 < 2MB（严格）
2. 禁止在TabBar主页面预加载音频
3. 音频必须压缩到 32-48kbps
4. regionId 必须在所有文件中保持完全一致
```

### 快速验证命令

```powershell
# 新增机场后必须运行的检查（在 miniprogram 目录）
$regionId = "uk"  # 替换为你的regionId

# 检查核心配置文件
Write-Output "检查核心配置文件:"
Select-String -Path "utils\audio-config.js" -Pattern "id: '$regionId'" | Select-Object -First 1
Select-String -Path "utils\audio-package-loader.js" -Pattern "'$regionId':" | Select-Object -First 1
Select-String -Path "pages\audio-player\index.ts" -Pattern "'$regionId':" | Select-Object -First 1

# 检查音频数量一致性
$audioCount = (Get-ChildItem "package*\*.mp3" -File | Where-Object {$_.Directory.Name -like "*$regionId*"}).Count
$dataCount = (Select-String -Path "data\regions\$regionId.js" -Pattern '"mp3_file":').Matches.Count
Write-Output "音频文件: $audioCount, 数据记录: $dataCount"

# 检查预加载页面大小
$packages = @('packageA', 'packageB')  # 替换为你的预加载页面的分包列表
$total = 0
foreach ($pkg in $packages) {
  $size = (Get-ChildItem "$pkg\*.mp3" -File | Measure-Object -Property Length -Sum).Sum / 1MB
  $total += $size
}
Write-Output "预加载页面总大小: $([math]::Round($total, 2)) MB (必须 < 2MB)"
```

### 完整文档索引

**快速开始**：
- `航线录音分包预加载规则记录/新增机场快速开始指南.md` - 30-60分钟上手
- `航线录音分包预加载规则记录/配置模板.md` - 可复制的配置模板

**深度学习**：
- `航线录音分包预加载规则记录/航线录音分包完整管理指南.md` - 完整技术文档
- `航线录音分包预加载规则记录/航线录音分包实战经验与最佳实践.md` - 实战经验总结

**问题排查**：
- `航线录音分包预加载规则记录/故障排查-音频无法播放.md` - 音频播放问题诊断

**容量规划**：
- `航线录音分包预加载规则记录/机场录音扩展容量规划.md` - 未来扩展指南

### 命名规范速查

```javascript
// regionId（核心标识，必须在所有文件中统一）
✅ 'uk', 'japan', 'korea', 'singapore', 'chinese-taipei'
❌ 'UK', 'south-korea', '英国'（不能大写、不能用下划线、不能用中文）

// 分包目录名
✅ packageJapan, packageUK, packageSingapore
❌ Packagejapan, package_japan, packageJP

// 数据文件名
✅ japan.js, uk.js, chinese-taipei.js
❌ Japan.js, south-korea.js, 韩国.js

// 音频文件名
✅ China-Eastern-7551_Descend-FL250.mp3
❌ china_eastern_7551.mp3（小写、下划线）
```

### 测试验证

```bash
新增机场后必须完成的测试：
✅ 运行自动化验证脚本
✅ 微信开发者工具编译无错误
✅ Android真机测试（在线+离线）
✅ iOS真机测试（在线+离线）
✅ 验证预加载引导弹窗正常
✅ 验证飞行模式下音频可播放
```

## 🔧 开发命令

### 依赖管理

```bash
# 安装依赖
cd miniprogram && npm install

# 修复Vant字体问题（自动执行）
npm run fix-fonts

# 生成版本信息
npm run generate-version

# 构建npm（必须在微信开发者工具中执行）
# 工具 -> 构建npm -> 编译
```

### 语法检查

```bash
# 检查所有JS文件
find miniprogram -name "*.js" -not -path "*/node_modules/*" -exec node -c {} \;

# 使用npm scripts（推荐）
cd miniprogram && npm run lint

# 检查TypeScript文件
find miniprogram -name "*.ts" -not -path "*/node_modules/*"
```

### 验证命令

```bash
# 检查分包数量（应该是54个）
grep -c "\"root\":" miniprogram/app.json

# Windows PowerShell替代命令
# (Get-Content miniprogram/app.json | Select-String '"root":').Count

# 验证音频文件
find miniprogram -name "*.mp3" 2>/dev/null | wc -l

# Windows PowerShell替代命令
# (Get-ChildItem -Path miniprogram -Filter *.mp3 -Recurse).Count

# 检查Vant组件使用
grep -r "van-" miniprogram/pages --include="*.wxml" | wc -l

# 验证位置权限配置
grep -A 10 "permission" miniprogram/app.json

# 验证新增分包
grep -A 5 "competencePackage\|medicalPackage" miniprogram/app.json
```

## 🗂️ 驾驶舱模块化架构

驾驶舱已重构为18个专业功能模块：

```
pages/cockpit/modules/
├── config.js                    # 🎛️ 配置管理(440个配置项)
├── flight-calculator.js         # ✈️ 飞行数据计算
├── airport-manager.js           # 🛬 机场搜索管理
├── gps-manager.js              # 📡 GPS位置追踪
├── compass-manager.js          # 🧭 指南针航向处理
├── map-renderer.js             # 🗺️ Canvas地图渲染
├── gesture-handler.js          # 👆 触摸手势处理
├── toast-manager.js            # 💬 智能提示管理
├── smart-filter.js             # 🧠 智能GPS数据滤波（已禁用）
├── attitude-indicator.js       # ✈️ 姿态仪表模块
├── sensor-fusion-core.js       # 🔬 传感器融合核心
├── logger.js                   # 📝 统一日志管理
├── audio-manager.js            # 🔊 音频播放管理
├── gps-spoofing-detector.js    # 🚨 GPS欺骗检测
├── accelerometer-manager.js    # 📐 加速度计管理
├── gyroscope-manager.js        # 🌐 陀螺仪管理
├── lifecycle-manager.js        # ⚡ 生命周期管理
└── compass-manager-simple.js   # 🧭 简化指南针管理器
```

### 使用示例

```javascript
// 配置管理 - 所有参数集中管理
var config = require('./modules/config.js');
var maxSpeed = config.gps.maxReasonableSpeed;  // 600kt

// 传感器融合核心
var SensorFusionCore = require('./modules/sensor-fusion-core.js');
var sensorCore = SensorFusionCore.create(config);

// GPS欺骗检测
var GPSSpoofingDetector = require('./modules/gps-spoofing-detector.js');
var spoofingDetector = GPSSpoofingDetector.create(config.gps.spoofingDetection);
```

## 📁 重要文件说明

### 核心工具文件

- `miniprogram/utils/base-page.js` - 统一页面基类（必须使用）
- `miniprogram/utils/data-loader.js` - 统一数据加载管理器
- `miniprogram/utils/audio-config.js` - 音频配置管理器
- `miniprogram/utils/audio-preload-guide.js` - 音频预加载引导系统（13个地区配置）
- `miniprogram/utils/ad-manager.js` - 广告管理器（激励视频广告实现）
- `miniprogram/utils/app-config.js` - 应用全局配置（包含广告ID配置）
- `miniprogram/utils/error-handler.js` - 全局错误处理器（自动初始化）
- `miniprogram/utils/tabbar-badge-manager.js` - TabBar小红点管理
- `miniprogram/utils/onboarding-guide.js` - 用户引导管理

### 驾驶舱模块文件

- `miniprogram/pages/cockpit/modules/config.js` - 配置管理（440个配置项）
- `miniprogram/pages/cockpit/modules/*.js` - 18大功能模块

### 配置文件

- `project.config.json` - 小程序项目配置（ES6: true, SWC: true, glass-easel）
- `miniprogram/app.json` - 全局配置（页面、分包、预加载、位置权限）
- `miniprogram/app.ts` - 主应用入口（TypeScript）
- `miniprogram/package.json` - 依赖管理（Vant Weapp + npm scripts）

## 🚨 故障排除

### 分包加载失败

```bash
# 1. 检查预加载规则
grep -A 5 "preloadRule" miniprogram/app.json

# 2. 验证分包路径
find package* -name "index.js" | wc -l  # 应该显示24个

# 3. 使用异步加载替换同步require
```

### 位置权限异常

```bash
# 检查位置权限配置
grep -A 15 "permission" miniprogram/app.json

# 验证已申请的位置API
grep -A 5 "requiredPrivateInfos" miniprogram/app.json

# 检查是否误用未申请的后台定位API
grep -r "startLocationUpdateBackground" miniprogram/
```

**位置API故障排查**：

- ✅ 确认四个API已声明：getLocation, chooseLocation, startLocationUpdate, onLocationChange
- ❌ 避免使用wx.startLocationUpdateBackground（未申请）
- 🔋 确保页面销毁时调用wx.stopLocationUpdate和wx.offLocationChange
- ⚠️ wx.getLocation有频率限制，持续定位使用wx.onLocationChange

### GPS权限申请最佳实践

- 🚀 **立即申请权限**：在GPS模块初始化时立即申请
- ✈️ **离线优化**：离线模式跳过wx.getSetting检查，直接尝试GPS
- 🎯 **自动启动**：权限获取后自动启动wx.startLocationUpdate
- 📊 **强制GPS坐标系**：使用type: 'wgs84'确保离线可用

### TypeScript编译问题

```bash
# 检查TypeScript文件语法
find miniprogram -name "*.ts" -not -path "*/node_modules/*"

# 注意：使用微信开发者工具的TypeScript编译器
```

## ✅ 代码审查清单

开发完成后，必须检查以下项：

### 基础规范
- [ ] 是否使用BasePage基类？
- [ ] 是否正确处理分包异步加载？
- [ ] 是否在离线模式（飞行模式）下正常工作？
- [ ] 是否通过语法检查？
- [ ] 是否使用rpx单位进行响应式布局？
- [ ] TypeScript文件是否符合类型规范？
- [ ] 错误处理是否使用统一的handleError方法？

### GPS相关
- [ ] GPS地速和GPS高度是否使用原始数据，未经滤波处理？
- [ ] 是否正确使用已申请的位置API？
- [ ] 是否避免使用未申请的wx.startLocationUpdateBackground？
- [ ] 位置监控是否在页面销毁时正确清理资源？

### 分包资源管理（图片/音频）
- [ ] 是否添加了开发者工具环境检测？
- [ ] 图片/音频加载失败时是否检查了预加载状态？
- [ ] 已预加载的资源是否实现了自动重试机制（最多3次）？
- [ ] 是否将关键资源写入本地缓存（wx.env.USER_DATA_PATH）？
- [ ] 是否正确管理缓存索引（wx.getStorageSync/setStorageSync）？
- [ ] 主动加载分包后是否添加了适当延迟（推荐200ms）？
- [ ] 页面销毁时是否清理了所有定时器引用？
- [ ] 是否添加了防抖机制避免重复弹窗？

## 📊 项目规模

- 分包数量: **54个**（17功能+30音频+6绕机检查+1通信失效）
- 数据记录: **30万+条**（ICAO、机场、缩写、胜任力、体检标准、飞机性能等）
- 覆盖国家: **31个** 主要航空国家/地区
- 驾驶舱模块: **18个** 专业模块
- TabBar页面: **5个** 主导航页面
- 胜任力数据: **13个胜任力** + **113个行为指标**
- 体检标准: **6大分类** 完整标准数据
- packageO工具: **28个** 子页面
- 飞机性能: **7大章节** + **8个附录** (Getting to Grips With Aircraft Performance)

## 🔄 最近重大变更

### v2.6.0版本更新（2025-10-18）

1. **新增辐射剂量计算工具**
   - 航空辐射剂量评估工具
   - 支持单点计算、航线评估、极地航线分析
   - 完全离线可用

2. **长航线机组轮换交互优化**
   - 起飞时间改为分开输入小时和分钟
   - 将弹窗输入改为页面内嵌输入
   - 提升交互体验

3. **UI界面全面简化提升**
   - 移除冗余页面头部组件
   - 优化分类标签页样式
   - 多个页面布局改进（参考体检标准设计）
   - 提升界面简洁度和一致性

### 新增功能分包（2025-10）

1. **胜任力管理分包** (`packageCompetence`)
   - 实现PLM胜任力及行为指标框架
   - 包含13个胜任力（9个核心+4个检查员教员）
   - 113个行为指标详细描述
   - 支持中英文搜索、分类筛选、详情浮窗、复制功能
   - 完全离线可用

2. **民航体检标准分包** (`packageMedical`)
   - 实现民航体检标准查询系统
   - 6大分类：一般条件、精神科、内科、外科、耳鼻咽喉及口腔科、眼科
   - 支持医学术语智能链接和浏览历史导航
   - 评定结果彩色徽章（合格/不合格/运行观察）
   - 完全离线可用

### TabBar结构调整

1. 默认首页从"我的首页"改为"资料查询"
2. "航班运行"更名为"通信"
3. TabBar顺序：资料查询 → 计算工具 → 驾驶舱 → 通信 → 我的首页
4. 资料查询页面新增"胜任力"和"体检标准"卡片

### 功能迁移

1. "通信翻译"从资料查询页面迁移到通信页面
2. 通信页面现包含：通信翻译、航线录音、标准通信用语、通信规范、通信失效、紧急改变高度

### 音频预加载系统优化

1. 修复音频引导弹窗重复出现的bug
2. 31个音频分包预加载配置已全面验证
3. 引导页面与app.json的preloadRule完美匹配
4. 预加载规则按页面路由智能分配，提升加载效率

### 广告系统配置

**重要说明**：项目已申请并授权以下8个广告位ID，开发时必须严格使用这些ID，禁止使用其他广告位ID。

#### 授权广告位ID列表

| 广告位名称 | 广告位ID | 广告类型 | 模式 | 用途 |
|-----------|---------|---------|------|------|
| 横幅3单图 | `adunit-4e68875624a88762` | Banner Ad | 优选 | 页面底部横幅广告 |
| 横幅2左文右图 | `adunit-3b2e78fbdab16389` | Banner Ad | 优选 | 页面底部横幅广告 |
| 横幅1左图右文 | `adunit-2f5afef0d27dc863` | Banner Ad | 优选 | 页面底部横幅广告 |
| 格子1-多格子 | `adunit-735d7d24032d4ca8` | Grid Ad | 自定义 | 特定功能区域 |
| 横幅卡片3-上文下图拼接 | `adunit-d6c8a55bd3cb4fd1` | Banner Ad | 优选 | 页面底部横幅广告 |
| 横幅卡片2-上图下文叠加A | `adunit-d7a3b71f5ce0afca` | Banner Ad | 优选 | **当前使用**：我的首页底部 |
| 横幅卡片1-上图下文叠加B | `adunit-3a1bf3800fa937a2` | Banner Ad | 优选 | 页面底部横幅广告 |
| 通用插屏广告 | `adunit-1a29f1939a1c7864` | Interstitial Ad | 优选 | **5个TabBar页面复用** |

#### 广告使用规范

1. ✅ **仅使用授权广告位**：严格使用上表中的8个广告位ID（7个横幅/格子 + 1个插屏）
2. ✅ **横幅广告放置位置**：页面底部，使用 `ad-banner-container` 类包裹
3. ✅ **广告刷新间隔**：建议设置 `ad-intervals="30"`（30秒）
4. ✅ **插屏广告ID复用**：所有TabBar页面使用同一个插屏广告位ID（`adunit-1a29f1939a1c7864`），分别创建实例
5. ❌ **禁止使用其他广告位ID**：未授权的广告位ID会影响收入分成

#### 广告代码示例

```xml
<!-- 横幅广告标准代码 -->
<view class="ad-banner-container">
  <ad unit-id="adunit-d7a3b71f5ce0afca" ad-type="banner" ad-intervals="30"></ad>
</view>
```

```javascript
// 插屏广告标准代码 - 所有TabBar页面使用相同广告位ID
Page({
  data: {
    interstitialAdLoaded: false
  },

  onLoad: function() {
    this.createInterstitialAd();
  },

  createInterstitialAd: function() {
    var self = this;
    if (wx.createInterstitialAd) {
      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-1a29f1939a1c7864' // ⚠️ 所有TabBar页面统一使用此ID
      });

      this.interstitialAd.onLoad(function() {
        console.log('插屏广告加载成功');
        self.setData({ interstitialAdLoaded: true });
      });

      this.interstitialAd.onError(function(err) {
        console.error('插屏广告加载失败:', err);
      });

      this.interstitialAd.onClose(function() {
        console.log('插屏广告关闭');
      });
    }
  },

  showInterstitialAd: function() {
    if (this.interstitialAd && this.data.interstitialAdLoaded) {
      this.interstitialAd.show().catch(function(err) {
        console.error('插屏广告展示失败:', err);
      });
    }
  },

  onUnload: function() {
    // ⚠️ 页面卸载时必须销毁广告实例
    if (this.interstitialAd) {
      this.interstitialAd.destroy();
    }
  }
});
```

## 🆕 新增功能分包说明

### packageCompetence（胜任力分包）

**功能概述**：PLM胜任力及行为指标框架查询系统

**数据结构**：
```javascript
// competence-data.js
var coreCompetencies = [
  {
    id: 'KNO',                    // 胜任力代码
    category: 'core',             // 'core' 或 'instructor'
    chinese_name: '知识应用',
    english_name: 'Application of Knowledge',
    description: '...',           // 中文描述
    description_en: '...',        // 英文描述
    behaviors: [                  // 行为指标数组
      {
        id: 'OB_KNO_1',
        code: 'OB KNO.1',
        chinese: '...',
        english: '...'
      }
    ],
    source: '附件D：PLM胜任力及行为指标框架',
    section: 'D-1',               // 'D-1' 或 'D-2'
    behavior_count: 7
  }
];
```

**关键特性**：
- 中英文搜索（支持代码、名称、描述、行为指标）
- 分类筛选（全部/核心胜任力/检查员教员）
- 详情浮窗（显示完整行为指标）
- 复制功能（格式化文本）
- 分页加载（每页20条）

### packageMedical（体检标准分包）

**功能概述**：民航体检标准查询系统

**数据结构**：
```javascript
// medicalStandards.js
var medicalStandards = [
  {
    id: 'M_001',
    category: '一般条件',         // 分类
    name_zh: '身高',
    name_en: 'Height',
    standard: {                   // 评定标准
      assessment: '合格',         // 评定结果
      conditions: ['...'],        // 条件列表
      notes: '...'               // 备注
    }
  }
];
```

**关键特性**：
- 6大分类：一般条件、精神科、内科、外科、耳鼻咽喉及口腔科、眼科
- 医学术语智能链接（自动识别其他标准的标题）
- 浏览历史导航（点击术语时保存历史，支持返回）
- 评定结果彩色徽章：
  - 合格：绿色
  - 不合格：红色
  - 运行观察：橙色
- 实时搜索（中英文、评定标准、条件、备注）
- 分页加载（每页10条）

**医学术语链接系统**：
- 自动识别条件文本中的医学术语
- 术语可点击跳转到对应标准详情
- 浏览历史栈支持多层返回
- 排除当前标准本身的术语匹配

### packagePerformance（飞机性能分包）

**功能概述**：Getting to Grips With Aircraft Performance v2.0 - Airbus官方飞机性能手册查询系统

**数据来源**：
- 文档：Getting to Grips With Aircraft Performance v2.0 (Airbus 2025)
- 路径：`docs/Getting_to_Grips_With_Aircraft_Performance_v2.md`
- 总页数：260页

**数据结构**：
```javascript
// performance-data.js
var performanceData = {
  metadata: {
    title: 'Getting to Grips With Aircraft Performance',
    source: 'Airbus S.A.S.',
    version: 'v2.0',
    year: '2025',
    totalSections: 7,      // 主章节总数
    totalAppendices: 8,    // 附录总数
    totalPages: 260
  },
  sections: [              // 7个主章节
    {
      id: 'A',
      code: 'A',
      title_zh: '飞机限制',
      title_en: 'AIRCRAFT LIMITATIONS',
      icon: '⚠️',
      description: '载荷系数、结构重量、速度限制',
      subsections: [...]   // 子章节数组
    }
  ],
  appendices: [...]        // 8个附录
};

// performance-index.js（搜索索引）
var performanceIndex = [
  {
    id: 'A1_1',
    type: 'topic',         // section/subsection/topic/appendix
    section: 'A',
    sectionTitle: '飞机限制',
    code: '1.1',
    title_zh: '载荷系数',
    title_en: 'Load Factors',
    keywords: ['VMO', 'MMO', 'VMCG', 'V1', 'V2', ...],
    regulations: ['CS 25.301', 'FAR 25.301', ...],
    summary: '...'
  }
];
```

**章节结构**（7个主章节）：
- **A. 飞机限制** ⚠️：载荷系数、速度限制、重量限制、环境包线
- **B. 运行速度** ✈️：通用速度、起飞速度、着陆速度、巡航速度
- **C. 起飞** 🛫：起飞性能、地面限制、减推力起飞
- **D. 飞行中性能** 🌤️：爬升、巡航、下降与等待
- **E. 故障飞行性能** ⚙️：发动机故障、ETOPS、航路研究
- **F. 着陆** 🛬：着陆限制、复飞限制
- **G. 燃油规划** ⛽：EASA和FAA燃油规划规则

**附录**（8个）：
- APPENDIX 1: 国际标准大气 (ISA)
- APPENDIX 2: 飞机运行温度
- APPENDIX 3: 高度测量 (Altimetry)
- APPENDIX 4: 速度
- APPENDIX 5: 飞行力学
- APPENDIX 6: 航空资料汇编 (AIP)
- APPENDIX 7: SNOWTAM运行使用
- APPENDIX 8: 缩写与符号

**关键特性**：
- ✅ 版本化缓存机制（Storage缓存~80KB）
- ✅ 多字段智能搜索（代码、标题、关键词、规章）
- ✅ 7个章节渐变卡片 + 8个附录网格布局
- ✅ 子章节展开/收起交互
- ✅ 面包屑导航
- ✅ 完全离线可用（飞行模式支持）
- ✅ 响应式布局（rpx单位）

**搜索支持**：
- 章节代码：`A`, `B`, `C.3`, `1.2.1`
- 速度符号：`VMO`, `VMCG`, `V1`, `V2`, `VR`, `VREF`
- 重量符号：`MTOW`, `MLW`, `MZFW`, `MTW`
- 适航规章：`CS 25.301`, `FAR 25.103`
- 中英文标题：`起飞`, `着陆`, `Takeoff`, `Landing`

**数据扩展说明**：
- ⚠️ **当前为示例数据**：仅包含2个章节和2个附录用于开发测试
- ✅ **完整数据待补充**：需包含所有7个章节和8个附录（约200-300条索引）
- 📝 **数据文件说明**：`performance-data.js` 和 `performance-index.js` 文件开头包含详细的数据提取指南，供其他AI参考

**技术栈**：
- 使用 `BasePage` 基类
- 使用 `VersionManager` 版本化缓存
- 使用 Vant Weapp UI组件
- 渐变卡片设计（参考 packageCompetence）
- rpx响应式布局

**性能优化**：
- 分包大小：~134KB（远低于2MB限制）
- Storage占用：~80KB（数据+索引缓存）
- 搜索响应：<100ms（索引缓存）
- 首次加载：<2秒

## 📝 新页面开发模板

```javascript
// 标准页面模板（使用BasePage基类）
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    loading: false,
    list: []
  },

  customOnLoad: function(options) {
    // 初始化数据
    this.loadData();
  },

  customOnShow: function() {
    // 页面显示时的逻辑
  },

  loadData: function() {
    var self = this;
    this.loadDataWithLoading(function() {
      return new Promise(function(resolve, reject) {
        // 加载数据逻辑
        resolve({ list: [] });
      });
    }, {
      context: '加载数据',
      dataKey: 'list'
    }).then(function(data) {
      self.setData({ list: data.list });
    });
  }
};

Page(BasePage.createPage(pageConfig));
```
