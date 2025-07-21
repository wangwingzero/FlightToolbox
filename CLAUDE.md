# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请用中文回复

## 📱 项目概述

FlightToolbox 是一个专为航空飞行员设计的微信小程序，专注于航空飞行工具和航线录音功能。主要功能包括：

- **🛫 航线飞行模块**：真实机场航线录音播放和学习
- **🔍 万能查询**：ICAO代码、缩写、定义、机场信息查询
- **🧮 飞行计算**：各种航空计算器和工具
- **📻 通信失效程序**：各地区通信失效处理差异程序
- **🛠️ 其他工具**：个人检查单、资质管理、事件报告等

## 🚨 CRITICAL - 必须离线运行

本小程序专为航空飞行员设计，**必须能够在完全离线环境下正常运行**。

### 为什么必须离线？
1. **飞行安全要求**：飞行员在空中执行任务时，手机必须开启飞行模式
2. **高空网络限制**：万米高空中无法使用移动网络或WiFi
3. **紧急情况处理**：通信失效等紧急情况下，飞行员需要立即访问程序和数据
4. **法规遵循**：民航法规要求飞行过程中关闭无线通信功能

### 设计要求
- ✅ **所有核心数据必须本地存储**：ICAO代码、机场数据、通信程序等
- ✅ **音频文件必须本地缓存**：航线录音、发音示例等
- ✅ **分包预加载策略**：确保关键数据在离线时可用
- ✅ **无网络依赖功能**：计算器、检查单、程序查询等
- ❌ **禁止在线API调用**：不能依赖实时网络数据
- ❌ **禁止云端存储依赖**：用户数据必须本地存储

### 测试验证
开发时必须验证：
1. 开启飞行模式后所有功能正常
2. 分包数据在无网络时可正常加载
3. 音频播放在离线状态下正常
4. 计算和查询功能完全离线可用

## 🚨 CRITICAL - 严格ES5语法要求

### 必须严格遵循ES5语法
虽然项目配置中启用了ES6（`"es6": true`），但实际开发中发现**真机环境对ES6+语法支持不稳定**，必须严格使用ES5语法确保真机兼容性。

#### ❌ 严格禁止使用的ES6+语法
```javascript
// 禁止使用的现代JavaScript语法
obj?.prop                    // 可选链操作符
obj ?? defaultValue         // 空值合并操作符
`template ${string}`        // 模板字符串
() => {}                    // 箭头函数
{...spread}                 // 扩展运算符
const/let declarations      // const/let声明
class MyClass {}            // ES6类
[a, b] = array             // 解构赋值
{prop} = object            // 对象解构
methodName() {}            // 方法简写
for...of loops             // for...of循环
```

#### ✅ 必须使用的ES5兼容语法
```javascript
// 必须使用的ES5语法
obj && obj.prop             // 传统条件检查
obj || defaultValue         // 逻辑或操作符
'string' + variable         // 字符串拼接
function() {}               // 普通函数声明
Object.assign({}, obj)      // 对象合并
var declarations           // var声明
function MyClass() {}      // 构造函数
MyClass.prototype.method   // 原型方法
for(var i=0; i<arr.length; i++) // 传统for循环
```

#### 🔧 关键修复模式
```javascript
// ❌ 错误示例
handleMethod(param) {
  const result = array.map(item => item.value);
  return `Result: ${result}`;
}

// ✅ 正确示例  
ExampleClass.prototype.handleMethod = function(param) {
  var self = this;
  var result = array.map(function(item) { 
    return item.value; 
  });
  return 'Result: ' + result;
};
```

#### 验证方法
```bash
# 语法验证命令
node -c miniprogram/path/to/file.js

# 批量验证
find miniprogram/ -name "*.js" -exec node -c {} \;
```

#### 真机调试错误特征
- 错误信息：`Unexpected token: punc (.)`
- 原因：使用了ES6+语法
- 解决：完全重写为ES5语法，不能增量修改

### ⚠️ 重要提醒
1. **开发者工具可能支持ES6**，但真机不支持
2. **必须在真机上测试**，确保语法兼容性
3. **重构时采用完全重写**，而非增量修改
4. **所有新代码都必须严格遵循ES5标准**

## 📦 重构后的统一组件架构（2025年7月）

### 🎯 核心组件使用
重构后项目提供统一的基类和组件，**所有新页面必须使用以下组件**：

#### 1. BasePage 统一页面基类
```javascript
// 新页面必须使用BasePage基类
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    // 页面数据
  },
  
  customOnLoad: function(options) {
    // 自定义加载逻辑（主题管理自动处理）
  },
  
  // 使用基类提供的方法
  myMethod: function() {
    this.loadDataWithLoading(loadFunction, options);
    this.showSuccess('操作成功');
    this.handleError(error, '操作失败');
  }
};

Page(BasePage.createPage(pageConfig));
```

#### 2. SearchComponent 统一搜索组件
```javascript
var SearchComponent = require('../../utils/search-component.js');
var searchComponent = SearchComponent.createSearchComponent();

// 在页面中使用
performSearch: function(keyword) {
  var results = searchComponent.search(keyword, this.data.originalData, {
    searchFields: ['name', 'description']
  });
  this.setData({ filteredData: results });
}
```

#### 3. PickerComponent 统一选择器组件
```javascript
var PickerComponent = require('../../utils/picker-component.js');
var pickerComponent = PickerComponent.createPickerComponent();

// 创建选择器混入
var pickerMixin = pickerComponent.createPickerMixin({
  onConfirm: function(event) {
    // 处理选择结果
  }
});
```

#### 4. DataLoader 统一数据加载
```javascript
var dataLoader = require('../../utils/data-loader.js');

// 分包数据加载
dataLoader.loadSubpackageData(this, 'packageA', '../../packageA/data.js', {
  fallbackData: [],
  context: '分包数据'
});
```

### 🚨 重要约定

1. **文件扩展名**：重构后的页面使用 `.js` 扩展名（ES5兼容）
2. **生命周期**：使用 `customOnLoad`、`customOnShow` 等自定义生命周期
3. **错误处理**：优先使用基类的 `handleError()` 方法
4. **数据加载**：优先使用基类的 `loadDataWithLoading()` 方法
5. **主题管理**：基类自动处理，无需手动管理

### 📋 重构完成状态
- ✅ **BasePage基类**：已完成，解决48个文件的主题管理重复
- ✅ **搜索组件**：已完成，解决6个文件的搜索功能重复  
- ✅ **Picker组件**：已完成，解决14个文件的选择器重复
- ✅ **数据加载器**：已完成，支持分包异步化和离线缓存
- ✅ **错误处理系统**：已完成，解决74个文件的错误处理重复

### 📖 详细文档
参考 `miniprogram/utils/README.md` 获取完整的组件使用指南。

## 🏗️ 技术架构

### 小程序架构
- **框架**：微信小程序原生框架
- **组件库**：Vant Weapp UI组件库
- **开发语言**：严格ES5 JavaScript（禁用ES6+语法）
- **编译器**：关闭ES6转换，使用原生ES5

### 📦 分包结构
项目采用分包架构，按功能和地区分包：

#### 功能分包
- `packageA` - ICAO代码数据 (30万条记录)
- `packageB` - 缩写数据 (2万条记录)
- `packageC` - 机场数据 (5千条记录)
- `packageD` - 定义数据 (3千条记录)
- `packageE` - 规范数据 (法规文件)
- `packageF` - ACR数据 (跑道系数)
- `packageG` - 危险品数据 (运输规范)
- `packageH` - 双发复飞数据 (梯度计算)
- `packageO` - 其他页面功能 (工具集合)

#### 音频分包（按国家地区）
- `packageJapan` - 日本成田机场录音 (24条)
- `packagePhilippines` - 菲律宾马尼拉机场录音 (27条)
- `packageKorean` - 韩国仁川机场录音 (19条)
- `packageSingapore` - 新加坡樟宜机场录音 (8条)
- `packageThailand` - 泰国曼谷机场录音 (22条)
- `packageRussia` - 俄罗斯莫斯科机场录音 (23条)
- `packageSrilanka` - 斯里兰卡科伦坡机场录音 (22条)
- `packageAustralia` - 澳大利亚悉尼机场录音 (20条)
- `packageTurkey` - 土耳其伊斯坦布尔机场录音 (28条)
- `packageFrance` - 法国戴高乐机场录音 (19条)
- `packageAmerica` - 美国旧金山机场录音 (52条)
- `packageItaly` - 意大利罗马机场录音 (29条)

### 🎵 音频配置架构
音频系统采用三层架构：
1. **数据层**：`miniprogram/data/regions/*.js` - 各国录音数据和元信息
2. **配置层**：`miniprogram/utils/audio-config.js` - 统一配置管理器
3. **分包层**：`package*/` - 音频资源分包存储

## 🔧 开发命令

### 微信小程序开发流程
```bash
# 1. 安装依赖
cd miniprogram && npm install

# 2. 构建npm包 (微信开发者工具)
# 工具 -> 构建npm -> 确认构建

# 3. 编译构建
# 微信开发者工具 -> 编译
```

### 代码检查
```bash
# JavaScript语法检查（ES5验证）
node -c miniprogram/utils/[filename].js

# 批量语法验证
find miniprogram/ -name "*.js" -exec node -c {} \;
```

### 发布前检查 ✅
1. **语法检查**：`node -c` 验证所有JS文件
2. **微信开发者工具编译**：确保无编译错误
3. **真机预览测试**：通过微信开发者工具真机预览功能
4. **离线功能测试**：确保开启飞行模式后功能正常
5. **分包验证**：确保分包异步加载正常
6. **音频测试**：验证音频播放功能
7. **代码体积检查**：确保主包<2MB，分包<2MB各自限制

## 📁 重要文件说明

### 核心配置文件
- `project.config.json` - 小程序项目配置 (ES6: true，但实际开发需使用ES5)
- `miniprogram/app.json` - 小程序全局配置 (页面、分包、预加载)

### 重构后的核心工具文件
- `miniprogram/utils/base-page.js` - 统一页面基类 (解决48个文件的主题管理重复)
- `miniprogram/utils/data-loader.js` - 统一数据加载管理器 (支持分包异步化)
- `miniprogram/utils/search-component.js` - 统一搜索组件 (解决6个文件的搜索重复)
- `miniprogram/utils/picker-component.js` - 统一选择器组件 (解决14个文件的选择器重复)
- `miniprogram/utils/error-handler.js` - 扩展错误处理系统 (解决74个文件的错误处理重复)

### 音频系统核心文件
- `miniprogram/utils/audio-config.js` - 音频配置管理器 (支持12个国家地区)
- `miniprogram/data/regions/*.js` - 各国录音数据文件 (包含元信息和文件路径)

## 📚 参考文档

### 重构架构相关
- 重构后的工具组件使用指南: `miniprogram/utils/README.md`
  - 包含BasePage、SearchComponent、PickerComponent等完整使用说明
  - 详细的ES5语法兼容性指南
  - 离线优先设计原则

### 音频配置架构相关
- 音频分包配置和管理: `docs/audio-config-architecture.md`
- 音频分包优化策略: `docs/audio-subpackage-optimization.md`

### 语法错误修复相关
- 微信小程序语法验证与错误修复: `docs/miniprogram-syntax-validation.md`
  - 适用于解决"Unexpected token: punc (.)"等语法错误
  - 包含ES6+语法兼容性处理方案
  - 提供系统性的修复流程和预防措施

## 📊 项目统计

### 代码规模
- 总音频数量: **293条** 真实机场录音
- 覆盖国家: **12个** 主要航空国家
- 分包数量: **21个** 功能和音频分包
- 核心页面: **25个** 主要功能页面
- 工具组件: **20个** 重构后的统一组件

### 数据规模
- ICAO代码: **30万条** 全球机场代码
- 缩写词典: **2万条** 航空缩写
- 机场数据: **5千条** 机场信息
- 定义词典: **3千条** 专业术语

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.