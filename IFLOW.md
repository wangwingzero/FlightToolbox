# FlightToolbox 项目概述

FlightToolbox（飞行工具箱）是专为航空飞行员设计的微信小程序，**必须能够在完全离线环境下正常运行**。项目采用分包架构解决微信小程序2MB主包限制，支持在无网络环境下正常使用所有核心功能。

## 项目类型
**微信小程序 (WeChat Mini Program)** - 专为航空飞行员设计的离线优先工具箱

## 核心技术栈
- **框架**: 微信小程序原生框架 + glass-easel组件框架
- **UI组件库**: Vant Weapp v1.11.7
- **语言**: JavaScript (ES6+) + TypeScript
- **包管理**: pnpm
- **基础库版本**: 3.8.9
- **分包策略**: 28个分包（15个功能分包 + 13个音频分包）
- **编译器**: SWC + ES6转换
- **懒加载**: lazyCodeLoading = "requiredComponents"

## 🚨 离线优先设计（核心约束）

- **原因**: 飞行员在空中必须开启飞行模式，无法使用网络
- **要求**: 所有核心数据本地存储，音频文件本地缓存，分包预加载
- **测试**: 开发时必须验证飞行模式下所有功能正常

## TabBar导航结构（5个主页面）

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

## 分包架构（28个分包）

### 功能分包（15个）

- `packageA` (icaoPackage): 民航英语词汇 - ICAO标准航空英语及应急特情词汇（1400+条）
- `packageB` (abbreviationsPackage): AIP标准及空客缩写（2万+条）
- `packageC` (airportPackage): 全球机场数据（7405个机场）
- `packageD` (definitionsPackage): 航空专业术语权威定义（3000+条）
- `packageF` (acrPackage): ACR计算工具
- `packageG` (dangerousGoodsPackage): 危险品规定查询
- `packageH` (twinEnginePackage): 双发飞机性能数据
- `packagePerformance`: 飞机性能参数与详解
- `packageCCAR` (caacPackage): CCAR民航规章（1447个文件）
- `packageIOSA` (iosaPackage): IATA运行安全审计术语（897条）
- `packageICAO` (icaoPublicationsPackage): ICAO出版物
- `packageO` (pagesPackage): 工具集合（28个子页面）
- `packageCompetence` (competencePackage): PLM胜任力及行为指标框架（13个胜任力，113个行为指标）
- `packageMedical` (medicalPackage): 民航体检标准（6大分类，完整标准数据）
- `packageRadiation` (radiationPackage): 航空辐射剂量计算工具

### 音频分包（13个国家/地区）

- `packageJapan`, `packagePhilippines`, `packageKorean`, `packageSingapore`
- `packageThailand`, `packageRussia`, `packageSrilanka`, `packageAustralia`
- `packageTurkey`, `packageFrance`, `packageAmerica`, `packageItaly`, `packageUAE`

**音频分包策略**：
- 共338个真实机场录音
- 按国家分包，避免单包过大
- 使用智能预加载机制（preloadRule配置）

## 项目结构

```
FlightToolbox/
├── miniprogram/                 # 小程序主目录
│   ├── pages/                   # 主包页面
│   │   ├── search/              # 资料查询（首页）
│   │   ├── flight-calculator/   # 飞行计算
│   │   ├── cockpit/             # 驾驶舱（18个专业模块）
│   │   ├── operations/          # 通信
│   │   └── home/                # 我的首页
│   ├── packageA-Z/              # 分包目录（28个分包）
│   ├── components/              # 组件目录
│   ├── utils/                   # 工具类目录
│   ├── data/                    # 主包数据目录
│   ├── services/                # 服务层
│   └── styles/                  # 样式文件
├── .cursor/rules/               # 开发规则文档
├── docs/                        # 项目文档
└── data/                        # 任务数据
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

## 核心功能模块

### 1. 资料查询 (离线优先)
- ICAO代码查询
- 航空缩写查询
- 定义查询
- 机场信息查询
- 本地全文搜索，无网络依赖

### 2. 飞行计算工具
- 各种航空专业计算器
- 单位换算工具
- 性能计算模块
- 所有计算本地实现

### 3. 航线录音学习
- 按国家/地区分包存储
- 支持离线播放
- 真实ATC录音学习

### 4. 通信失效程序
- 各地区差异化程序
- 国内外程序对比
- 紧急情况快速查询

### 5. 个人工具
- 个人检查单管理
- 资质管理（X天Y次计算逻辑）
- 事件报告系统

### 6. 胜任力管理（新增）
- PLM胜任力及行为指标框架
- 13个胜任力（9个核心+4个检查员教员）
- 113个行为指标详细描述
- 中英文搜索、分类筛选、详情浮窗、复制功能

### 7. 民航体检标准（新增）
- 6大分类：一般条件、精神科、内科、外科、耳鼻咽喉及口腔科、眼科
- 医学术语智能链接和浏览历史导航
- 评定结果彩色徽章（合格/不合格/运行观察）

### 8. 航空辐射剂量计算（新增）
- 航空辐射剂量评估工具
- 支持单点计算、航线评估、极地航线分析
- 完全离线可用

## 构建和运行命令

## 🚀 快速开始

```bash
# 安装依赖
cd miniprogram && npm install

# 微信开发者工具: 工具 -> 构建npm -> 编译

# 预览时开启飞行模式验证离线功能
```

### 开发命令

```bash
# 语法检查
pnpm run lint

# 开发模式（在微信开发者工具中预览）
pnpm run dev

# 构建（在微信开发者工具中构建npm）
pnpm run build

# 修复Vant字体问题
pnpm run fix-fonts
```

### 微信开发者工具设置
1. 导入项目根目录
2. 工具 -> 构建npm
3. 编译运行
4. 确保基础库版本为3.8.9

### 验证命令

```bash
# 检查分包数量（应该是28个）
grep -c "\"root\":" miniprogram/app.json

# 验证音频文件（应该是338个）
find . -name "*.mp3" 2>/dev/null | wc -l

# 检查Vant组件使用
grep -r "van-" miniprogram/pages --include="*.wxml" | wc -l

# 验证位置权限配置
grep -A 10 "permission" miniprogram/app.json
```

## 开发约定

### 1. 离线优先原则 (不可妥协)
- ✅ 所有核心功能必须在飞行模式下正常运行
- ✅ 所有数据必须本地存储
- ✅ 音频文件必须本地缓存
- ❌ 禁止在线API调用作为核心功能依赖
- ❌ 禁止云端存储依赖

### 2. BasePage基类使用
所有页面必须继承BasePage基类：
```javascript
var BasePage = require('../../utils/base-page.js');
Page(BasePage.createPage(pageConfig));
```

### 3. JavaScript/TypeScript语法支持（重要）

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

### 4. 分包数据管理
- 使用统一数据管理器：`utils/data-manager.js`
- 异步加载分包数据
- 多层兜底机制：分包→主包→默认数据
- 24小时缓存机制

### 5. 跨分包引用必须异步

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

### 6. 响应式布局使用rpx单位

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

### 7. GPS原始数据规则（严格禁止修改）

- 🚨 **GPS地速和GPS高度必须使用原始数据**
- 🚨 **禁止对GPS数据使用滤波、平滑等算法处理**
- 🚨 **`gps-manager.js`中的 `applySmartFiltering`已禁用，直接返回原始数据**
- ✅ GPS地速显示为整数（使用 `Math.round()`）
- ✅ GPS高度从米转英尺后直接显示，无平滑处理

### 8. 位置API使用规范

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

### 9. 代码风格
- 2空格缩进
- 文件名使用kebab-case
- 组件名与目录名保持一致
- 优先使用现代JavaScript特性

## 测试要求

### 1. 离线测试
- 所有功能在飞行模式下测试
- 验证数据加载兜底机制
- 确认音频离线播放

### 2. 性能测试
- 启动性能监控
- 分包预加载效果
- 搜索响应速度

### 3. 兼容性测试
- 不同版本微信客户端
- 不同设备性能表现
- 基础库版本兼容性

## 开发流程

### 1. 修改前必须查阅官方文档
使用MCP工具访问微信小程序官方文档：
- 框架文档：https://developers.weixin.qq.com/miniprogram/dev/framework/
- 组件文档：https://developers.weixin.qq.com/miniprogram/dev/component/
- API文档：https://developers.weixin.qq.com/miniprogram/dev/api/

### 2. 新功能开发
1. 需求分析：确认离线可用性要求
2. 数据设计：规划本地存储方案
3. 分包规划：确定数据分包策略
4. 页面开发：使用BasePage基类
5. 离线测试：飞行模式下完整测试

### 3. 代码审查要点
- ✅ 检查离线功能完整性
- ✅ 验证BasePage使用
- ✅ 确认现代JavaScript语法使用合理
- ✅ 检查分包数据加载
- ✅ 验证错误处理机制

## 重要工具类

### 1. BasePage (utils/base-page.js)
- 统一页面基类
- 提供数据加载、错误处理、生命周期管理
- 支持分包数据异步加载

### 2. DataManager (utils/data-manager.js)
- 统一分包数据管理
- 24小时缓存机制
- 多层兜底策略

### 3. SubpackageLoader (utils/subpackage-loader.js)
- 分包异步加载工具
- 跨分包require支持

## 📊 项目规模

- 音频文件: **338条** 真实机场录音
- 分包数量: **28个**（15功能+13音频）
- 数据记录: **30万+条**（ICAO、机场、缩写、胜任力、体检标准等）
- 覆盖国家: **13个** 主要航空国家
- 驾驶舱模块: **18个** 专业模块
- TabBar页面: **5个** 主导航页面
- 胜任力数据: **13个胜任力** + **113个行为指标**
- 体检标准: **6大分类** 完整标准数据

## 🆕 新增功能分包说明

### packageCompetence（胜任力分包）

**功能概述**：PLM胜任力及行为指标框架查询系统

**关键特性**：
- 中英文搜索（支持代码、名称、描述、行为指标）
- 分类筛选（全部/核心胜任力/检查员教员）
- 详情浮窗（显示完整行为指标）
- 复制功能（格式化文本）
- 分页加载（每页20条）

### packageMedical（体检标准分包）

**功能概述**：民航体检标准查询系统

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

### packageRadiation（辐射剂量计算分包）

**功能概述**：航空辐射剂量评估工具

**关键特性**：
- 航空辐射剂量评估工具
- 支持单点计算、航线评估、极地航线分析
- 完全离线可用

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

## 注意事项

### 禁止事项
- ❌ 核心功能依赖网络API
- ❌ 直接跨分包require
- ❌ 使用eval、Proxy等不兼容语法
- ❌ 忽略离线测试
- ❌ 对GPS数据使用滤波、平滑等算法处理
- ❌ 使用未申请的位置API（如wx.startLocationUpdateBackground）

### 必须遵循
- ✅ 继承BasePage基类
- ✅ 使用统一数据管理器
- ✅ 实现离线优先设计
- ✅ 使用现代JavaScript（ES6+/TypeScript）
- ✅ 完整错误处理机制
- ✅ GPS地速和GPS高度使用原始数据
- ✅ 正确使用已申请的四个位置API
- ✅ 页面销毁时清理位置监控资源

## 发布检查清单

### 功能检查
- [ ] 所有功能离线可用
- [ ] 分包数据正常加载
- [ ] 音频播放正常
- [ ] 计算功能准确

### 性能检查
- [ ] 启动速度优化
- [ ] 内存使用合理
- [ ] 搜索响应及时
- [ ] 分包预加载有效

### 兼容性检查
- [ ] 基础库版本兼容
- [ ] 不同设备测试
- [ ] 语法兼容性确认
- [ ] 错误处理完善

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
2. 13个音频分包预加载配置已全面验证
3. 引导页面与app.json的preloadRule完美匹配

---

**记住：网络是增强，离线是基础。FlightToolbox必须在任何环境下都能可靠为飞行员服务。**