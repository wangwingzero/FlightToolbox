# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请用中文回复

## 📱 项目概述

FlightToolbox（飞行工具箱）是专为航空飞行员设计的微信小程序，**必须能够在完全离线环境下正常运行**。

### 🚨 离线优先设计（核心约束）

- **原因**: 飞行员在空中必须开启飞行模式，无法使用网络
- **要求**: 所有核心数据本地存储，音频文件本地缓存，分包预加载
- **测试**: 开发时必须验证飞行模式下所有功能正常

## 🚀 快速开始

```bash
# 安装依赖
cd miniprogram && npm install

# 微信开发者工具: 工具 -> 构建npm -> 编译

# 预览时开启飞行模式验证离线功能
```

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

### 分包架构（26个分包）

#### 功能分包（13个）

- `packageA` (icaoPackage): ICAO标准航空英语及应急特情词汇（1400+条）
- `packageB` (abbreviationsPackage): AIP标准及空客缩写（2万+条）
- `packageC` (airportPackage): 全球机场数据（7405个机场）
- `packageD` (definitionsPackage): 航空专业术语权威定义（3000+条）
- `packageF` (acrPackage): ACR计算工具
- `packageG` (dangerousGoodsPackage): 危险品规定查询
- `packageH` (twinEnginePackage): 双发飞机性能数据
- `packagePerformance`: 飞机性能参数与详解
- `packageCCAR` (caacPackage): CCAR民航规章（1447个文件）
- `packageIOSA` (iosaPackage): IATA运行安全审计术语（897条）
- `packageO` (pagesPackage): 工具集合（28个子页面）
- `packageCompetence` (competencePackage): PLM胜任力及行为指标框架（13个胜任力，113个行为指标）
- `packageMedical` (medicalPackage): 民航体检标准（6大分类，完整标准数据）

#### 音频分包（13个国家/地区）

- `packageJapan`, `packagePhilippines`, `packageKorean`, `packageSingapore`
- `packageThailand`, `packageRussia`, `packageSrilanka`, `packageAustralia`
- `packageTurkey`, `packageFrance`, `packageAmerica`, `packageItaly`, `packageUAE`

**音频分包策略**：

- 共338个真实机场录音
- 按国家分包，避免单包过大
- 使用智能预加载机制（preloadRule配置）

### 技术栈配置

```javascript
核心配置（project.config.json + app.json）:
- TypeScript支持: 部分模块使用（app.ts、packageO、services）
- 组件框架: glass-easel（新一代小程序组件框架）
- UI组件库: Vant Weapp (@vant/weapp)
- 编译器: SWC + ES6转换
- 懒加载: lazyCodeLoading = "requiredComponents"
- 广告系统: 激励视频广告（Reward Video Ad） + 横幅广告（Banner Ad）+ 格子广告（Grid Ad）
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
- 微信开发者工具自动转译ES6到ES5以兼容旧设备
- 无需手动转换语法，保持现代JavaScript编码风格

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

## 🔧 开发命令

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
# 检查分包数量（应该是26个）
grep -c "\"root\":" miniprogram/app.json

# 验证音频文件（应该是338个）
find . -name "*.mp3" 2>/dev/null | wc -l

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

- [ ] 是否使用BasePage基类？
- [ ] 是否正确处理分包异步加载？
- [ ] 是否在离线模式（飞行模式）下正常工作？
- [ ] 是否通过语法检查？
- [ ] 是否使用rpx单位进行响应式布局？
- [ ] GPS地速和GPS高度是否使用原始数据，未经滤波处理？
- [ ] 是否正确使用已申请的位置API？
- [ ] 是否避免使用未申请的wx.startLocationUpdateBackground？
- [ ] 位置监控是否在页面销毁时正确清理资源？
- [ ] TypeScript文件是否符合类型规范？
- [ ] 错误处理是否使用统一的handleError方法？

## 📊 项目规模

- 音频文件: **338条** 真实机场录音
- 分包数量: **26个**（13功能+13音频）
- 数据记录: **30万+条**（ICAO、机场、缩写、胜任力、体检标准等）
- 覆盖国家: **13个** 主要航空国家
- 驾驶舱模块: **18个** 专业模块
- TabBar页面: **5个** 主导航页面
- 胜任力数据: **13个胜任力** + **113个行为指标**
- 体检标准: **6大分类** 完整标准数据

## 🔄 最近重大变更

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
2. 13个音频分包预加载配置已全面验证
3. 引导页面与app.json的preloadRule完美匹配

### 广告系统配置

1. **激励视频广告**（Reward Video Ad）- 用于"鼓励作者"功能
   - 广告单元ID: `adunit-079d7e04aeba0625`
   - 配置位置: `miniprogram/utils/app-config.js`
   - 使用页面: `pages/home/index`（我的首页）
2. **横幅广告**（Banner Ad）
   - 显示在各页面底部
3. **格子广告**（Grid Ad）
   - 用于特定功能区域

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
