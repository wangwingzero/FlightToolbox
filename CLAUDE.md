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
- 音频分包(13个): 按国家分包，共338个真实机场录音

### 技术栈配置
- **TypeScript支持**: 项目部分模块使用TypeScript (packageO分包、services目录)
- **组件框架**: glass-easel (新一代小程序组件框架)
- **UI组件库**: Vant Weapp (@vant/weapp)
- **编译器**: SWC + Babel混合编译
- **懒加载**: requiredComponents模式，按需加载组件
- **位置权限**: 支持前台和后台GPS定位
- **广告系统**: 支持激励视频广告 (微信官方广告组件)

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

驾驶舱模块已重构为18个专业功能模块：

```
pages/cockpit/modules/
├── config.js                    # 🎛️ 配置管理(440个配置项)
├── flight-calculator.js         # ✈️ 飞行数据计算
├── airport-manager.js           # 🛬 机场搜索管理
├── gps-manager.js              # 📡 GPS位置追踪
├── compass-manager.js          # 🧭 指南针航向处理
├── compass-manager-simple.js   # 🧭 简化指南针管理器
├── map-renderer.js             # 🗺️ Canvas地图渲染
├── gesture-handler.js          # 👆 触摸手势处理
├── toast-manager.js            # 💬 智能提示管理
├── smart-filter.js             # 🧠 智能GPS数据滤波
├── attitude-indicator.js       # ✈️ 姿态仪表模块
├── sensor-fusion-core.js       # 🔬 传感器融合核心
├── logger.js                   # 📝 统一日志管理
├── audio-manager.js            # 🔊 音频播放管理
├── gps-spoofing-detector.js    # 🚨 GPS欺骗检测
├── accelerometer-manager.js    # 📐 加速度计管理
├── gyroscope-manager.js        # 🌐 陀螺仪管理
└── lifecycle-manager.js        # ⚡ 生命周期管理
```

#### 使用示例
```javascript
// 配置管理 - 所有参数集中管理，避免硬编码
var config = require('./modules/config.js');
var maxSpeed = config.gps.maxReasonableSpeed;  // 600kt

// 传感器融合核心使用示例
var SensorFusionCore = require('./modules/sensor-fusion-core.js');
var sensorCore = SensorFusionCore.create(config);

// GPS欺骗检测使用示例
var GPSSpoofingDetector = require('./modules/gps-spoofing-detector.js');
var spoofingDetector = GPSSpoofingDetector.create(config.gps.spoofingDetection);

// 模块创建和使用
var gpsManager = GPSManager.create(config);
var mapRenderer = MapRenderer.create('canvasId', config);
```

## 🔧 开发命令

### 常用命令
```bash
# 语法检查
find miniprogram -name "*.js" -exec node -c {} \;

# 使用npm scripts进行语法检查 (推荐)
cd miniprogram && npm run lint

# TypeScript语法检查 (针对.ts文件)
find miniprogram -name "*.ts" -not -path "*/node_modules/*" | head -10

# 检查分包数量 (应该是24个)
grep -c "\"root\":" miniprogram/app.json

# 验证音频文件 (应该是338个)
find . -name "*.mp3" 2>/dev/null | wc -l

# 检查Vant组件使用情况
grep -r "van-" miniprogram/pages --include="*.wxml" | wc -l

# 验证位置权限配置
grep -A 10 "permission" miniprogram/app.json

# 检查广告配置
grep -A 5 -B 5 "rewardVideoId" miniprogram/utils/app-config.js
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
9. **使用npm scripts**: 优先使用 `npm run lint` 等预定义脚本进行代码检查
10. **🚨 GPS原始数据规则**: GPS地速和GPS高度必须使用原始数据，不得使用任何算法处理（如平滑、滤波等）

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
```

#### 位置API使用规范 (已申请权限)

项目已成功申请以下四个位置API，使用时必须严格按照规范：

```javascript
// ✅ 1. wx.getLocation - 获取当前位置（一次性获取）
wx.getLocation({
  type: 'gcj02',              // 必须使用gcj02坐标系
  altitude: true,             // 建议获取高度信息
  isHighAccuracy: true,       // 开启高精度定位
  highAccuracyExpireTime: 5000, // 高精度超时时间
  success: function(res) {
    console.log('纬度:', res.latitude);
    console.log('经度:', res.longitude);
    console.log('速度:', res.speed);
    console.log('精确度:', res.accuracy);
    console.log('高度:', res.altitude);
  },
  fail: function(error) {
    self.handleError(error, 'GPS定位失败');
  }
});

// ✅ 2. wx.chooseLocation - 打开地图选择位置
wx.chooseLocation({
  latitude: currentLat,       // 可选：地图中心纬度
  longitude: currentLng,      // 可选：地图中心经度
  success: function(res) {
    console.log('位置名称:', res.name);
    console.log('详细地址:', res.address);
    console.log('纬度:', res.latitude);
    console.log('经度:', res.longitude);
  },
  fail: function(error) {
    if (error.errMsg === 'chooseLocation:fail cancel') {
      console.log('用户取消选择位置');
    } else {
      self.handleError(error, '选择位置失败');
    }
  }
});

// ✅ 3. wx.startLocationUpdate + wx.onLocationChange - 持续位置监控
// 必须配合使用，用于需要持续监控位置的场景（如驾驶舱导航）
wx.startLocationUpdate({
  type: 'gcj02',
  success: function() {
    console.log('持续定位已启动');
    
    // 监听位置变化
    wx.onLocationChange(function(res) {
      console.log('位置更新:', res.latitude, res.longitude);
      console.log('速度:', res.speed, 'm/s');
      console.log('精确度:', res.accuracy, 'm');
      // 处理位置更新...
    });
  },
  fail: function(error) {
    self.handleError(error, '启动持续定位失败');
  }
});

// ✅ 4. 停止持续定位（重要：避免电量消耗）
function stopLocationMonitoring() {
  wx.stopLocationUpdate({
    success: function() {
      console.log('持续定位已停止');
    }
  });
  wx.offLocationChange(); // 取消监听
}
```

#### 位置API使用注意事项

**权限配置要求：**
- app.json中已配置：`"requiredPrivateInfos": ["getLocation", "chooseLocation", "startLocationUpdate", "onLocationChange"]`
- permission中已配置：`"scope.userLocation"`权限说明
- requiredBackgroundModes中已配置：`["location"]`

**重要限制：**
- ❌ **不支持后台定位**：wx.startLocationUpdateBackground未申请，只能前台使用
- ⚠️ **频率限制**：wx.getLocation有调用频率限制，频繁使用建议改用wx.onLocationChange
- 🔋 **电量优化**：使用wx.onLocationChange时必须及时调用wx.stopLocationUpdate停止监控

**推荐使用场景：**
- **一次性定位**：使用wx.getLocation获取当前位置
- **地点选择**：使用wx.chooseLocation让用户选择位置
- **导航监控**：使用wx.startLocationUpdate + wx.onLocationChange组合
- **页面销毁时**：必须调用wx.stopLocationUpdate和wx.offLocationChange清理资源

### 代码审查清单
- ✅ 是否使用BasePage基类？
- ✅ 是否正确处理分包异步加载？
- ✅ 是否在离线模式下正常工作？
- ✅ 是否通过语法检查 (`node -c filename.js`)？
- ✅ **是否使用rpx单位进行响应式布局？**
- ✅ 驾驶舱功能是否使用config.js配置模块？
- ✅ **是否正确使用已申请的位置API？**
- ✅ **是否避免使用未申请的wx.startLocationUpdateBackground？**
- ✅ **位置监控是否正确清理资源（wx.stopLocationUpdate + wx.offLocationChange）？**
- ✅ TypeScript文件是否符合类型规范？
- ✅ 是否正确使用Vant UI组件？
- ✅ 错误处理是否使用统一的error-handler？
- ✅ **广告配置是否正确设置 (app-config.js 中的 rewardVideoId)？**
- ✅ **激励广告是否正确调用 ad-manager.js？**
- ✅ **GPS欺骗检测是否正确配置 (config.js中的spoofingDetection)？**
- ✅ **传感器融合是否正确初始化 (sensor-fusion-core.js)？**
- ✅ **🚨 GPS原始数据检查**: GPS地速和GPS高度是否直接使用原始数据，未经滤波处理？

## 📁 重要文件

### 核心工具文件
- `miniprogram/utils/base-page.js` - 统一页面基类 (必须使用)
- `miniprogram/utils/data-loader.js` - 统一数据加载管理器
- `miniprogram/utils/search-component.js` - 统一搜索组件
- `miniprogram/utils/audio-config.js` - 音频配置管理器
- `miniprogram/utils/error-handler.js` - 全局错误处理器 (自动初始化)
- `miniprogram/utils/button-charge-manager.js` - 按钮防重复计算管理器
- `miniprogram/utils/console-helper.js` - 控制台输出管理
- `miniprogram/utils/app-config.js` - 应用全局配置 (广告、API配置)
- `miniprogram/utils/ad-manager.js` - 广告管理器
- `miniprogram/utils/subpackage-loader.js` - 智能分包加载器
- `miniprogram/utils/subpackage-debug.js` - 分包诊断工具
- `miniprogram/utils/warning-handler.js` - 警告处理器

### 服务层文件 (TypeScript)
- `miniprogram/app.ts` - 主应用文件 (TypeScript版本)
- 注意: services目录实际不存在TypeScript文件，仅app.ts使用TypeScript

### 驾驶舱模块化文件
- `miniprogram/pages/cockpit/modules/config.js` - 配置管理 (440个配置项)
- `miniprogram/pages/cockpit/modules/*.js` - 18大功能模块

### 配置文件
- `project.config.json` - 小程序项目配置 (ES6: true, SWC: true, glass-easel)
- `miniprogram/app.json` - 全局配置 (页面、分包、预加载、位置权限)
- `miniprogram/package.json` - 依赖管理 (Vant Weapp + npm scripts)
- `miniprogram/utils/app-config.js` - 应用配置 (广告单元ID等)

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
find . -name "*.mp3" | head -5

# 检查音频配置
var audioConfig = require('../../utils/audio-config.js');
var regionData = audioConfig.getRegionData('japan');
```

### 位置权限异常
```bash
# 检查位置权限配置
grep -A 15 "permission" miniprogram/app.json

# 验证已申请的位置API配置
grep -A 5 "requiredPrivateInfos" miniprogram/app.json

# 检查位置相关API调用（确保使用正确的API）
grep -r "getLocation\|chooseLocation\|startLocationUpdate\|onLocationChange" miniprogram/pages/cockpit/

# 检查是否误用了未申请的后台定位API
grep -r "startLocationUpdateBackground" miniprogram/
```

**位置API故障排查：**
- ✅ **确认权限申请**：四个API (getLocation, chooseLocation, startLocationUpdate, onLocationChange) 已在requiredPrivateInfos中声明
- ❌ **避免后台定位**：不要使用wx.startLocationUpdateBackground（未申请）
- 🔋 **资源清理**：确保页面销毁时调用wx.stopLocationUpdate和wx.offLocationChange
- ⚠️ **频率限制**：wx.getLocation有调用频率限制，持续定位请使用wx.onLocationChange

**GPS权限申请最佳实践（参考docs/GPS权限申请解决方案.md）：**
- 🚀 **立即权限申请**：在GPS管理器`init`方法中立即调用`checkLocationPermission()`
- ✈️ **离线模式优化**：离线模式下跳过`wx.getSetting`检查，直接尝试GPS定位
- 🎯 **自动启动定位**：权限获取成功后自动启动`wx.startLocationUpdate`
- 📊 **强制GPS坐标系**：使用`type: 'wgs84'`避免网络定位，确保离线可用
- ⚡ **避免权限延迟**：不要等待用户操作或特定条件，在模块初始化时立即处理

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


## 📊 项目规模
- 音频文件: **338条** 真实机场录音 (包含1个GPS语音提示)
- 分包数量: **24个** (11功能+13音频)
- 数据记录: **30万+条** (ICAO、机场、缩写等)
- 覆盖国家: **13个** 主要航空国家
- 驾驶舱模块: **18个专业模块** (GPS、指南针、地图等)

## 🔄 项目更新日志

### 2025-08-02 GPS权限申请策略优化
解决了驾驶舱GPS定位的核心问题：

**问题修复：**
- ❌ **权限申请时机过晚** → ✅ **页面初始化时立即申请权限**
- ❌ **离线模式长时间等待** → ✅ **离线模式跳过网络API，直接尝试GPS**
- ❌ **需要手动启动定位** → ✅ **权限获取后自动启动持续定位**
- ❌ **高度数据卡在固定值** → ✅ **使用wgs84坐标系，实时更新高度**

**技术改进：**
- 🔧 修改`gps-manager.js`的`init`方法，立即调用权限检查
- 🌐 优化`checkLocationPermission`方法，离线模式下直接启动GPS
- 📡 确保`startLocationTracking`自动启动持续定位监听
- 📖 新增详细的GPS权限申请解决方案文档 (`docs/GPS权限申请解决方案.md`)

### 2025-09-14 姿态仪页面切换卡住问题修复
解决了驾驶舱页面切换后姿态仪卡住不动的问题：

**问题现象：**
- 姿态仪初始显示正常
- 切换到其他页面再返回驾驶舱，姿态仪画面卡住不动
- 传感器仍在工作但渲染循环中断

**根本原因：**
- 页面隐藏时`pause()`方法未正确停止渲染循环和看门狗
- 页面恢复时`resume()`方法未检查渲染循环状态
- 渲染循环中断后无法自动恢复

**修复方案：**
1. **增强`pause()`方法** (`attitude-indicator.js:1461-1496`)
   - 正确停止渲染循环和看门狗定时器
   - 保存状态供恢复使用
   - 保留传感器监听以加快恢复

2. **改进`resume()`方法** (`attitude-indicator.js:1499-1513`)
   - 清理旧的动画句柄和定时器
   - 重置渲染器缓存确保立即更新
   - 延迟检查渲染循环是否正常启动

3. **优化页面`onShow`恢复逻辑** (`cockpit/index.js:362-403`)
   - 检查姿态仪状态并智能恢复
   - 延迟验证恢复是否成功
   - 失败时自动触发强制刷新

4. **改进传感器重启** (`attitude-indicator.js:997-1038`)
   - 避免重复注册监听器
   - 正确清理之前的监听状态
   - 确保渲染循环正常启动

**技术要点：**
- 生命周期管理：确保页面切换时正确暂停和恢复所有组件
- 资源清理：避免定时器和监听器重复导致内存泄漏
- 容错机制：多重检查和自动修复确保稳定性

### 2025-09-13 GPS原始数据显示优化
GPS数据显示策略重大调整，确保实时性和准确性：

**核心修改：**
- 🚨 **禁用智能滤波**：完全禁用`smart-filter.js`的滤波算法，直接使用原始GPS数据
- 🔧 **地速整数化**：GPS地速从保留小数改为整数显示（42kt而不是41.8kt）
- ⚡ **实时响应**：解决GPS数值卡住不动的问题，数据变化立即反映
- 📍 **原始数据优先**：高度和地速直接使用GPS原始转换值，无延迟

**技术实现：**
- 修改`gps-manager.js:2047` - `applySmartFiltering`方法直接返回原始数据
- 修改`gps-manager.js:1755` - GPS地速使用`Math.round()`整数显示
- 确保GPS高度和地速的实时性，解决之前数值滞后问题

### 2025-09-09 最新架构升级
驾驶舱模块已扩展至18个专业模块，新增传感器融合和GPS欺骗检测：

**新增模块：**
- `sensor-fusion-core.js` - 传感器融合核心引擎
- `gps-spoofing-detector.js` - GPS欺骗检测系统 (支持语音警告)
- `accelerometer-manager.js` - 加速度计数据管理
- `gyroscope-manager.js` - 陀螺仪数据管理
- `lifecycle-manager.js` - 组件生命周期统一管理
- `compass-manager-simple.js` - 简化版指南针管理器
- `logger.js` - 统一日志记录系统
- `audio-manager.js` - 音频播放管理器

**功能增强：**
- GPS欺骗检测：智能识别GPS数据异常，支持语音提示
- 传感器融合：整合GPS、指南针、加速度计、陀螺仪数据
- 配置管理优化：从338个增加至440个配置项
- 音频系统：新增GPS欺骗警告音频 (总计338个音频文件)
- 智能日志系统：统一管理所有模块的日志输出

### 2025-08-01 驾驶舱智能仪表升级
新增姿态仪表模块和按钮防重复计算管理：

**新增文件：**
- `pages/cockpit/modules/attitude-indicator.js` - 姿态仪表模块(俯仰角、滚转角显示)
- `pages/cockpit/modules/smart-filter.js` - 智能GPS数据滤波器
- `miniprogram/utils/button-charge-manager.js` - 按钮防重复计算管理器

**模块升级：**
- 驾驶舱模块数量由9个增加至11个
- 新增高性能姿态仪表渲染器
- 优化计算按钮防重复点击保护
- 增强GPS数据智能过滤功能

### 2025-07-30 驾驶舱模块重构完成
驾驶舱功能已完成模块化重构，新增智能过滤器和配置管理系统：

**新增文件：**
- `pages/cockpit/modules/simple-filter.js` - 简化GPS滤波器
- `pages/cockpit/modules/config.js` - 统一配置管理（338个配置项）
- `miniprogram/utils/console-helper.js` - 控制台输出管理

**删除文件：**
- `pages/cockpit/modules/gps-quality-assessor.js` - GPS质量评估（功能整合）
- `pages/cockpit/modules/kalman-filter.js` - 复杂卡尔曼滤波（性能问题）
- `pages/cockpit/modules/waypoint-manager.js` - 航点管理（功能重构）
- `pages/cockpit/components/waypoint-editor.*` - 航点编辑器组件

**配置管理优化：**
- 集中管理GPS、指南针、地图、UI等338个配置项
- 新增智能Toast管理系统，避免重复提示
- 简化卡尔曼滤波，提高稳定性和性能
- 优化地图渲染和手势处理性能

**位置API使用规范：**
项目已成功申请四个位置API，严格按照规范使用：
- ✅ `wx.getLocation` - 一次性获取位置
- ✅ `wx.chooseLocation` - 地图选择位置  
- ✅ `wx.startLocationUpdate` + `wx.onLocationChange` - 持续位置监控
- ❌ 避免使用未申请的 `wx.startLocationUpdateBackground`

**GPS数据处理原则（重要）：**
- 🚨 **使用原始数据**：GPS地速和GPS高度必须直接使用原始GPS数据，不得使用任何滤波或平滑算法
- 📍 **禁用智能滤波**：`gps-manager.js`中的`applySmartFiltering`方法已禁用，直接返回原始数据
- ⚡ **实时响应**：GPS数据变化必须立即反映在界面上，不允许滞后或延迟
- 🔧 **地速整数显示**：GPS地速使用`Math.round()`显示为整数（如：42kt）
- 📊 **高度实时转换**：GPS高度从米转英尺后直接显示，无平滑处理

**GPS权限申请核心原则（重要）：**
- 🚀 **立即申请权限**：在GPS模块初始化时立即申请，不要延迟到用户操作时
- ✈️ **离线优化策略**：离线模式下跳过`wx.getSetting`等网络API，直接尝试GPS
- 🎯 **自动化启动**：权限获取后自动启动持续定位，无需用户手动干预
- 📊 **坐标系选择**：驾驶舱使用`type: 'wgs84'`确保GPS原始数据和离线可用性
- 📖 **参考文档**：详细技术实现见 `docs/GPS权限申请解决方案.md`