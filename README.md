# FlightToolbox 飞行小工具箱

<div align="center">
  <img src="https://img.shields.io/badge/微信小程序-FlightToolbox-blue.svg" alt="微信小程序">
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vant_Weapp-1.11.7-green.svg" alt="Vant Weapp">
  <img src="https://img.shields.io/badge/离线优先-✓-brightgreen.svg" alt="离线优先">
</div>

## 📖 项目简介

FlightToolbox 是一款专为飞行员设计的微信小程序，提供了丰富的航空专业工具和数据查询功能。小程序采用**离线优先**设计理念，确保在无网络环境下（如驾驶舱）所有核心功能都能正常工作。

### 🎯 核心特色

- **🛩️ 专业性**：专为飞行员量身定制的航空计算工具
- **📱 离线优先**：核心功能完全支持离线使用
- **🔍 万能查询**：整合缩写、定义、机场、通信、规章等海量数据
- **⚡ 高性能**：采用分包架构，优化加载速度和用户体验
- **🎨 现代UI**：基于Vant Weapp的"便当"风格设计

## 🚀 功能模块

### 1. 飞行速算 📊
- **梯度计算**：爬升梯度、下滑角度、垂直速度换算
- **GPWS预警**：地面接近警告系统参数计算
- **PITCH PITCH预警**：俯仰姿态预警计算
- **温度修正**：低温修正计算（符合ICAO Doc 8168标准）
- **ACR-PCR分析**：机场承载能力与飞机兼容性分析

### 2. 常用换算 🔄
- **长度单位**：英尺、米、海里、千米等互转
- **重量单位**：磅、千克、吨等互转
- **压力单位**：英寸汞柱、百帕、毫米汞柱等互转
- **温度单位**：摄氏度、华氏度、开尔文互转
- **速度单位**：节、千米/小时、米/秒等互转
- **燃油单位**：升、加仑、磅等互转

### 3. 特殊计算 🧮
- **温度梯度计算**：标准大气温度梯度计算
- **航空专业计算**：各类飞行性能计算
- **飞机型号数据库**：支持A320、A321、A330等机型

### 4. 万能查询 🔍
#### 缩写查询 (1197+ 条)
- 航空缩写及其英文全称、中文翻译
- 按字母分组浏览，支持全文搜索
- 智能搜索索引，快速响应

#### 定义查询 (5000+ 条)
- 航空专业术语定义
- 中英文对照
- 按拼音首字母分组

#### 机场查询 (1000+ 条)
- 全球机场信息
- ICAO/IATA代码查询
- 机场位置、详细信息

#### 通信查询 (ICAO Doc 9432)
- ICAO标准通信用语
- 按章节分类浏览
- 特情常用词汇
- 中英文对照

#### 规章查询 (1000+ 条)
- 中国民航规章文件
- 按文件类型分类
- 智能分类检索

### 5. 实用工具 🛠️
- **日出日落计算**：基于地理坐标的天文计算
- **夜航时间计算**：民航日夜时间界定
- **个人清单管理**：飞行前检查清单
- **资质管理**：飞行资质到期提醒
- **SNOWTAM解码**：雪情通告解码工具
- **飞行时间分享**：飞行经历记录分享
- **不安全事件报告**：标准化事件报告工具

## 🏗️ 技术架构

### 核心技术栈
- **框架**：微信小程序原生框架
- **语言**：TypeScript 5.8.3
- **UI组件**：Vant Weapp 1.11.7
- **数据管理**：自研分包数据管理器
- **搜索引擎**：自研前缀索引搜索

### 架构特点

#### 分包架构
```
├── 主包 (核心功能)
├── packageA (ICAO通信数据 ~200KB)
├── packageB (缩写数据 ~232KB)
├── packageC (机场数据 ~100KB)
├── packageD (定义数据 ~114KB)
├── packageE (规范性文件数据)
└── packageF (ACR机型数据)
```

#### 数据管理
- **多层兜底机制**：分包 → 主包 → 默认数据
- **24小时缓存**：减少重复加载
- **异步加载**：支持跨分包数据引用
- **预加载策略**：关键页面预下载相关分包

#### 搜索优化
- **防抖机制**：300ms防抖，减少频繁搜索
- **前缀索引**：基于前缀树的快速搜索
- **分页加载**：大数据量分页显示
- **字母分组**：一次性加载优化为按需加载

## 📁 项目结构

```
FlightToolbox/
├── miniprogram/                    # 小程序源码
│   ├── app.js/ts                  # 小程序入口
│   ├── app.json                   # 全局配置
│   ├── pages/                     # 页面目录
│   │   ├── flight-calc/           # 飞行速算
│   │   ├── unit-converter/        # 常用换算
│   │   ├── aviation-calculator/   # 特殊计算
│   │   ├── abbreviations/         # 万能查询
│   │   ├── others/               # 实用工具
│   │   ├── personal-checklist/   # 个人清单
│   │   ├── qualification-manager/ # 资质管理
│   │   ├── snowtam-decoder/      # SNOWTAM解码
│   │   ├── sunrise-sunset/       # 日出日落
│   │   ├── flight-time-share/    # 飞行时间分享
│   │   └── event-report/         # 事件报告
│   ├── packageA-F/               # 分包数据
│   ├── utils/                    # 工具类
│   │   ├── data-manager.js       # 数据管理器
│   │   ├── search-manager.js     # 搜索管理器
│   │   ├── performance-monitor.js # 性能监控
│   │   └── suncalc.js           # 天文计算
│   ├── services/                 # 业务服务
│   └── data/                     # 主包数据
├── typings/                      # TypeScript 类型定义
├── .cursor/rules/                # 开发规范文档
└── README.md                     # 项目说明
```

## 🛠️ 开发指南

### 环境要求
- **微信开发者工具** 最新版
- **Node.js** ≥ 14.0.0
- **TypeScript** 5.8.3+

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd FlightToolbox
```

2. **安装依赖**
```bash
npm install
```

3. **导入项目**
- 打开微信开发者工具
- 导入项目，选择 `miniprogram` 目录
- 设置 AppID（测试号或正式AppID）

4. **编译运行**
- 确保启用 TypeScript 编译
- 点击编译，预览或真机调试

### 开发规范

项目遵循严格的开发规范，详见 [.cursor/rules](`.cursor/rules/`) 目录：

#### 核心规范
- **TypeScript优先**：所有页面使用 `.ts` 文件
- **离线优先**：核心功能必须支持离线使用
- **便当UI风格**：统一的Vant组件布局规范
- **搜索性能优化**：搜索功能必须优化性能
- **语法兼容性**：避免使用微信小程序不支持的ES6+语法

#### 具体规范
- [TypeScript 优先规则](`.cursor/rules/typescript-priority.mdc`)
- [离线优先设计规则](`.cursor/rules/miniprogram-offline-first.mdc`)
- [便当UI风格规范](`.cursor/rules/miniprogram-bento-ui-priority.mdc`)
- [搜索性能优化规则](`.cursor/rules/miniprogram-search-performance.mdc`)
- [语法兼容性规则](`.cursor/rules/miniprogram-syntax-compatibility.mdc`)

### 数据管理

#### 添加新数据
1. 将数据文件放入对应分包目录
2. 在 `data-manager.js` 中添加加载方法
3. 在页面中调用数据管理器加载数据
4. 更新 `app.json` 中的预加载配置

#### 数据格式标准
```javascript
// 缩写数据格式
{
  "abbreviation": "ACFT",
  "english_full": "Aircraft", 
  "chinese_translation": "航空器"
}

// 机场数据格式
{
  "ICAOCode": "ZBAA",
  "IATACode": "PEK",
  "airport_name": "北京首都国际机场",
  "city": "北京"
}
```

## 🎨 UI设计规范

### 便当风格设计
项目采用"便当"UI风格，确保界面整洁统一：

```xml
<!-- 标准便当布局 -->
<view class="container">
  <van-cell-group title="功能区域">
    <van-field label="输入项" placeholder="请输入"/>
    <van-cell>
      <van-button type="primary" block>操作按钮</van-button>
    </van-cell>
  </van-cell-group>
</view>
```

### 样式规范
```css
.container {
  padding: 0 16rpx !important;
  background-color: #f7f8fa;
  min-height: 100vh;
}
```

### 颜色主题
- **缩写功能**：蓝紫色渐变 (#667eea → #764ba2)
- **定义功能**：绿色渐变 (#52c41a → #389e0d)
- **机场功能**：橙红色渐变 (#ff9a56 → #ff6b6b)
- **通信功能**：紫色渐变 (#722ed1 → #531dab)
- **规章功能**：金色渐变 (#faad14 → #d48806)

## 📊 性能优化

### 分包预加载
```json
{
  "preloadRule": {
    "pages/abbreviations/index": {
      "network": "all",
      "packages": ["packageA", "packageB", "packageC", "packageD"]
    }
  }
}
```

### 搜索优化
- **防抖搜索**：300ms防抖机制
- **前缀索引**：快速搜索算法
- **分页加载**：大数据量分页显示
- **字母分组**：减少DOM渲染压力

### 启动优化
- **初始渲染缓存**：启用缓存机制
- **懒加载**：按需加载组件
- **代码分离**：核心功能与增强功能分离

## 🔧 配置说明

### 基础配置
- **基础库版本**：≥ 2.11.2（支持分包异步化）
- **代码分包**：6个分包，总计约650KB数据
- **离线存储**：localStorage + 分包缓存

### 功能配置
```javascript
// 搜索配置
const searchConfig = {
  debounceDelay: 300,
  pageSize: 50,
  maxResults: 1000
}

// 缓存配置  
const cacheConfig = {
  expireTime: 24 * 60 * 60 * 1000, // 24小时
  maxCacheSize: 100
}
```

## 🧪 测试

### 功能测试
- 所有功能页面提供测试入口
- 支持分包数据加载状态检查
- 缓存机制验证

### 性能测试
- 启动性能监控
- 搜索响应时间监控
- 内存使用情况跟踪

### 离线测试
- 飞行模式下功能验证
- 网络断开恢复测试
- 数据完整性检查

## 📱 使用说明

### 小程序码
*此处应该放置小程序码图片*

### 功能亮点
1. **专业数据**：整合了1万+条航空专业数据
2. **离线可用**：网络环境不佳时依然可用
3. **快速搜索**：毫秒级搜索响应
4. **界面美观**：现代化的用户界面设计
5. **定期更新**：数据持续更新维护

## 🤝 贡献指南

### 贡献流程
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

### 贡献内容
- **功能增强**：新功能开发
- **数据更新**：航空数据更新维护
- **Bug修复**：问题修复和优化
- **文档完善**：文档和注释改进

### 代码规范
- 遵循项目既定的开发规范
- 保持代码风格一致
- 添加必要的测试和文档
- 确保离线优先原则

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

- **项目维护**：FlightToolbox团队
- **技术支持**：通过小程序内反馈功能
- **数据更新**：欢迎提供最新的航空数据

## 🙏 致谢

感谢所有为项目贡献数据和代码的开发者，特别感谢：
- ICAO 国际民航组织提供的标准文档
- 中国民航局发布的规章制度
- 各航空公司提供的专业数据
- 广大飞行员用户的反馈和建议

---

<div align="center">
  <p>🛩️ 为飞行安全助力，让专业工具触手可得 🛩️</p>
  <p>Made with ❤️ for Aviation Professionals</p>
</div>

## 📋 微信审核说明

**FlightToolbox飞行小工具箱**是一款专为民航飞行员设计的专业工具小程序。提供航空单位换算、飞行性能计算、国际民航组织标准数据查询、机场信息查询、飞行资质管理等核心功能。所有数据均来源于ICAO国际民航组织官方文档和中国民航局公开规章。采用离线优先设计，确保飞行员在驾驶舱等网络受限环境下正常使用，提升飞行安全保障水平。 