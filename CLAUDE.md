# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请用中文回复

## 🚀 快速开始

```bash
# 安装依赖并构建
cd miniprogram && npm install
# 微信开发者工具: 工具 -> 构建npm -> 编译
# 预览时开启飞行模式验证离线功能
```

### 新页面开发模板

```javascript
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: { loading: false, list: [] },
  customOnLoad: function(options) {
    this.loadData();
  },
  loadData: function() {
    this.loadDataWithLoading(dataLoadFunction, {
      dataKey: 'list', context: '加载数据'
    });
  }
};

Page(BasePage.createPage(pageConfig));
```

### 核心开发原则

1. **离线优先**：所有功能必须在飞行模式下可用
2. **使用基类**：新页面必须继承BasePage  
3. **分包异步**：跨分包引用必须使用异步require
4. **统一错误处理**：使用基类的handleError方法

## 📱 项目概述

FlightToolbox是专为航空飞行员设计的微信小程序，**必须能够在完全离线环境下正常运行**。

### 🚨 离线优先设计

- **原因**: 飞行员在空中必须开启飞行模式，无法使用网络
- **要求**: 所有核心数据本地存储，音频文件本地缓存，分包预加载
- **测试**: 开发时必须验证飞行模式下所有功能正常

## 🏗️ 技术架构

### 分包架构
- 主包: 核心页面和统一基类系统
- 功能分包(11个): packageA(ICAO代码30万条)、packageB(缩写2万条)等
- 音频分包(13个): 按国家分包，共337个真实机场录音

### 技术栈配置
- **TypeScript支持**: 项目部分模块使用TypeScript (packageO分包、services目录)
- **组件框架**: glass-easel (新一代小程序组件框架)
- **UI组件库**: Vant Weapp (@vant/weapp)
- **编译器**: SWC + Babel混合编译
- **懒加载**: requiredComponents模式，按需加载组件
- **位置权限**: 支持前台和后台GPS定位

### 统一组件架构

#### 1. BasePage 基类 (必须使用)
```javascript
var BasePage = require('../../utils/base-page.js');
Page(BasePage.createPage(pageConfig));
```

#### 2. 跨分包引用 (必须异步)
```javascript
// ✅ 正确方式
require('../../packageA/data.js', function(data) {
  // 处理数据
}, function(error) {
  // 错误处理
});

// ❌ 错误方式
var data = require('../../packageA/data.js'); // 生产环境可能失败
```

### 驾驶舱模块化架构

驾驶舱模块已重构为8个专业功能模块：

```
pages/cockpit/modules/
├── config.js           # 🎛️ 配置管理(338个配置项)
├── flight-calculator.js # ✈️ 飞行数据计算
├── airport-manager.js   # 🛬 机场搜索管理
├── gps-manager.js      # 📡 GPS位置追踪
├── compass-manager.js  # 🧭 指南针航向处理
├── map-renderer.js     # 🗺️ Canvas地图渲染
├── gesture-handler.js  # 👆 触摸手势处理
└── toast-manager.js    # 💬 智能提示管理
```

#### 使用示例
```javascript
// 配置管理 - 所有参数集中管理，避免硬编码
var config = require('./modules/config.js');
var maxSpeed = config.gps.maxReasonableSpeed;  // 600kt

// 模块创建和使用
var gpsManager = GPSManager.create(config);
var mapRenderer = MapRenderer.create('canvasId', config);
```

## 🔧 开发命令

### 常用命令
```bash
# 语法检查
find miniprogram -name "*.js" -exec node -c {} \;

# TypeScript语法检查 (针对.ts文件)
find miniprogram -name "*.ts" -not -path "*/node_modules/*" | head -10

# 检查分包数量 (应该是24个)
grep -c "\"root\":" miniprogram/app.json

# 验证音频文件 (应该是337个)
find package* -name "*.mp3" 2>/dev/null | wc -l

# 检查Vant组件使用情况
grep -r "van-" miniprogram/pages --include="*.wxml" | wc -l

# 验证位置权限配置
grep -A 10 "permission" miniprogram/app.json
```

### 开发流程
```bash
# 1. 安装依赖
cd miniprogram && npm install

# 2. 微信开发者工具: 工具 -> 构建npm -> 编译

# 3. 真机预览测试，确保离线功能正常
```

### 新页面添加
```javascript
// 1. 在app.json中添加页面路径
// 2. 使用BasePage基类
var BasePage = require('../../utils/base-page.js');
var pageConfig = {
  customOnLoad: function(options) {
    // 页面逻辑
  }
};
Page(BasePage.createPage(pageConfig));
```

### 分包数据加载
```javascript
var dataLoader = require('../../utils/data-loader.js');
dataLoader.loadSubpackageData(this, 'packageName', './data.js', {
  fallbackData: [], context: '分包描述'
});
```

## 📋 开发规范

### 必须遵循的规则
1. **所有新页面必须使用BasePage基类**
2. **跨分包引用必须使用异步require**
3. **样式单位必须使用rpx进行响应式布局** (750rpx = 全屏宽度)
4. **错误处理使用统一机制**: `this.handleError(error, '上下文')`
5. **数据加载显示loading**: `this.loadDataWithLoading(loadFunction, options)`
6. **离线测试**: 开发完成后必须验证飞行模式下功能正常
7. **位置权限**: 驾驶舱功能必须正确请求和处理位置权限
8. **TypeScript文件**: packageO分包和services目录优先使用TypeScript

### 技术栈使用规范

#### 尺寸单位规范 (必须使用rpx)
```css
/* ✅ 正确使用rpx (响应式像素单位) */
.container {
  width: 750rpx;        /* 全屏宽度 */
  height: 200rpx;       /* 响应式高度 */
  padding: 20rpx;       /* 响应式内边距 */
  margin: 10rpx 0;      /* 响应式外边距 */
  font-size: 28rpx;     /* 响应式字体 */
}

/* ❌ 避免使用固定像素 */
.bad-container {
  width: 375px;         /* 仅适配iPhone6 */
  height: 100px;        /* 无响应式 */
}

/* 📏 rpx换算参考 (以iPhone6为标准)
   750rpx = 375px = 750物理像素
   1rpx = 0.5px = 1物理像素 */
```

#### 组件和API使用规范
```javascript
// ✅ 使用Vant组件的正确方式
<van-button type="primary" bind:click="handleSubmit">提交</van-button>

// ✅ 异步加载分包数据 (必须方式)
require('../../packageA/data.js', function(data) {
  // 处理数据
}, function(error) {
  self.handleError(error, '加载ICAO数据');
});

// ✅ 位置权限处理
wx.getLocation({
  type: 'gcj02',
  success: function(res) {
    // 处理位置数据
  },
  fail: function(error) {
    self.handleError(error, 'GPS定位失败');
  }
});
```

### 代码审查清单
- ✅ 是否使用BasePage基类？
- ✅ 是否正确处理分包异步加载？
- ✅ 是否在离线模式下正常工作？
- ✅ 是否通过语法检查 (`node -c filename.js`)？
- ✅ **是否使用rpx单位进行响应式布局？**
- ✅ 驾驶舱功能是否使用config.js配置模块？
- ✅ 是否正确处理位置权限 (前台/后台)？
- ✅ TypeScript文件是否符合类型规范？
- ✅ 是否正确使用Vant UI组件？
- ✅ 错误处理是否使用统一的error-handler？

## 📁 重要文件

### 核心工具文件
- `miniprogram/utils/base-page.js` - 统一页面基类 (必须使用)
- `miniprogram/utils/data-loader.js` - 统一数据加载管理器
- `miniprogram/utils/search-component.js` - 统一搜索组件
- `miniprogram/utils/audio-config.js` - 音频配置管理器
- `miniprogram/utils/error-handler.js` - 全局错误处理器 (自动初始化)

### 服务层文件 (TypeScript)
- `miniprogram/services/report.builder.ts` - 报告构建服务
- `miniprogram/services/storage.service.ts` - 存储服务

### 驾驶舱模块化文件
- `miniprogram/pages/cockpit/modules/config.js` - 配置管理 (338个配置项)
- `miniprogram/pages/cockpit/modules/*.js` - 9大功能模块

### 配置文件
- `project.config.json` - 小程序项目配置 (ES6: true, SWC: true, glass-easel)
- `miniprogram/app.json` - 全局配置 (页面、分包、预加载、位置权限)
- `miniprogram/package.json` - 依赖管理 (仅Vant Weapp)

## 🚨 故障排除

### 分包加载失败
```bash
# 1. 检查预加载规则
grep -A 5 -B 5 "preloadRule" miniprogram/app.json

# 2. 验证分包路径  
find package* -name "index.js" | wc -l  # 应该显示24个

# 3. 使用异步加载替换同步require
```

### 音频播放异常
```bash
# 验证音频文件路径
find package* -name "*.mp3" | head -5

# 检查音频配置
var audioConfig = require('../../utils/audio-config.js');
var regionData = audioConfig.getRegionData('japan');
```

### 位置权限异常
```bash
# 检查位置权限配置
grep -A 15 "permission" miniprogram/app.json

# 验证后台定位配置  
grep "requiredBackgroundModes" miniprogram/app.json

# 检查位置相关API调用
grep -r "getLocation\|startLocationUpdate" miniprogram/pages/cockpit/
```

### TypeScript编译问题
```bash
# 检查TypeScript文件语法 (排除node_modules)
find miniprogram -name "*.ts" -not -path "*/node_modules/*" -exec echo "检查: {}" \;

# 验证services目录的TypeScript文件
ls -la miniprogram/services/*.ts

# 检查是否有TypeScript编译错误
# 注意: 使用微信开发者工具的TypeScript编译器
```

### glass-easel组件问题
```bash
# 检查组件框架配置
grep "componentFramework" project.config.json

# 验证懒加载配置
grep "lazyCodeLoading" miniprogram/app.json

# 检查Vant组件是否正确引入
find miniprogram -name "*.json" -exec grep -l "van-" {} \;
```

### 语法错误排查
如果遇到 "Unexpected token: punc (.)" 错误：
1. 确认 `project.config.json` 中 `"es6": true` 已启用
2. 在真机上测试验证功能
3. 如遇兼容性问题，使用更保守的语法

## 广告系统

### 横幅广告 (优先使用)
```javascript
<ad-custom unit-id="adunit-4e68875624a88762" bindload="adLoad" binderror="adError"></ad-custom>

// 可用广告位ID:
// adunit-4e68875624a88762, adunit-3b2e78fbdab16389
// adunit-2f5afef0d27dc863, adunit-d6c8a55bd3cb4fd1
// adunit-d7a3b71f5ce0afca, adunit-3a1bf3800fa937a2
```

### 格子广告 (特殊情况)
```javascript
// 仅在页面广告过多或与音频冲突时使用
<ad-custom unit-id="adunit-735d7d24032d4ca8" bindload="adLoad" binderror="adError"></ad-custom>
```

### 激励视频广告
```javascript
var pageConfig = {
  customOnLoad: function() {
    if (wx.createRewardedVideoAd) {
      this.data.videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-316c5630d7a1f9ef'
      });
    }
  }
};
```

## 📊 项目规模
- 音频文件: **337条** 真实机场录音
- 分包数量: **24个** (11功能+13音频)
- 数据记录: **30万+条** (ICAO、机场、缩写等)
- 覆盖国家: **13个** 主要航空国家