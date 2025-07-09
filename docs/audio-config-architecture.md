# 🛩️ FlightToolbox 音频配置架构文档

## 📖 概述

本文档是 FlightToolbox 小程序新增机场音频的**完整操作指南**。任何人按照此文档，都能快速完成新机场音频的集成。

## 🎯 新增机场完整流程

### 📋 准备清单

在开始之前，请确保您有以下材料：

- [ ] **音频文件**：`.mp3` 格式的录音文件
- [ ] **录音信息**：每个录音的英文原文和中文翻译
- [ ] **机场信息**：国家名、机场名、ICAO代码等
- [ ] **开发环境**：微信开发者工具

---

## ⚡ 快速上手：5步完成新增

### 第1步：准备音频数据文件 📁

在 `miniprogram/data/regions/` 目录下创建新的数据文件：

**文件名格式**：`[国家英文小写].js`

**示例**：`singapore.js`

```javascript
const SingaporeData = {
  "clips": [
    {
      "label": "进近",
      "full_transcript": "Singapore Airlines 117, turn left heading 180, descend to 9000 feet.",
      "translation_cn": "新航117，左转航向180，下降至9000英尺。",
      "mp3_file": "Singapore-Airlines-117_Turn-Left-180-Descend-9000.mp3"
    },
    {
      "label": "塔台",
      "full_transcript": "Singapore Airlines 117, runway 02 left, cleared to land.",
      "translation_cn": "新航117，跑道02左，可以落地。",
      "mp3_file": "Singapore-Airlines-117_Runway-02L-Cleared-to-Land.mp3"
    }
    // ... 更多录音数据
  ]
};

module.exports = SingaporeData;
```

**⚠️ 重要说明**：
- `label`：录音类型（进近/塔台/地面/放行/区调）
- `full_transcript`：英文原文（必须准确）
- `translation_cn`：中文翻译
- `mp3_file`：音频文件名（格式：`航班号_动作描述.mp3`）

---

### 第2步：创建音频分包目录 📦

在 `miniprogram/` 目录下创建分包文件夹：

**命名格式**：`package[国家英文首字母大写]`

```bash
# 创建新加坡分包目录
mkdir miniprogram/packageSingapore

# 将所有 MP3 音频文件放入该目录
cp *.mp3 miniprogram/packageSingapore/
```

**必须创建的基础文件**：

1. **index.js**：
```javascript
Page({
  data: {},
  onLoad() {
    console.log('新加坡音频分包页面加载');
  }
});
```

2. **index.json**：
```json
{
  "navigationBarTitleText": "新加坡机场录音",
  "navigationBarBackgroundColor": "#16a085",
  "navigationBarTextStyle": "white"
}
```

3. **index.wxml**：
```xml
<view class="container">
  <view class="header">
    <text>🇸🇬 新加坡樟宜机场录音</text>
  </view>
</view>
```

---

### 第3步：更新音频配置管理器 ⚙️

编辑 `miniprogram/utils/audio-config.js` 文件：

#### 3.1 添加数据文件引用

在文件顶部的 `try` 块中添加：

```javascript
// 找到这段代码
try {
  japanData = require('../data/regions/japan.js');
  philippinesData = require('../data/regions/philippines.js');
  koreanData = require('../data/regions/korean.js');
  // 👇 添加这一行
  singaporeData = require('../data/regions/singapore.js');
  // ... 其他数据文件
}
```

在变量声明部分添加：

```javascript
// 找到这行
let japanData, philippinesData, koreanData, singaporeData, germanyData, ...
// 确保 singaporeData 在变量列表中
```

#### 3.2 添加地区信息

在 `this.regions` 数组中添加：

```javascript
{
  id: 'singapore',
  continentId: 'asia',
  name: '新加坡',
  flag: '🇸🇬',
  description: '樟宜机场真实陆空通话录音',
  count: 8,  // 实际录音数量
  hasRealRecordings: true
},
```

#### 3.3 添加机场配置

在 `this.airports` 数组中添加：

```javascript
{
  id: 'singapore',
  regionId: 'singapore',
  name: '新加坡樟宜机场',
  city: '新加坡',
  icao: 'WSSS',
  packageName: 'packageSingapore',
  audioPath: '/packageSingapore/',
  icon: '🌟',
  description: '樟宜国际机场陆空通话录音',
  clips: singaporeData.clips || []
},
```

---

### 第4步：更新小程序配置 📱

编辑 `miniprogram/app.json` 文件：

#### 4.1 添加分包配置

在 `subPackages` 数组中添加：

```json
{
  "root": "packageSingapore",
  "name": "singaporeAudioPackage",
  "pages": ["index"]
},
```

#### 4.2 预加载策略规划 ⚖️

**⚠️ 重要**：微信小程序每个页面预加载限制为 2MB，需要合理分配分包。

##### 4.2.1 计算分包大小
```bash
# 检查新分包大小
du -sh miniprogram/package[CountryName]/

# 检查现有预加载页面的分包总大小
du -sh miniprogram/packageJapan/ miniprogram/packageRussia/  # 当前: 1.78MB
```

##### 4.2.2 选择预加载页面策略

**当前预加载分配 (2024年实际配置)**：
```json
"preloadRule": {
  "pages/air-ground-communication/index": {
    "network": "all",
    "packages": ["packageJapan", "packageRussia"]  // 1.78MB ✅
  },
  "pages/recording-categories/index": {
    "network": "all", 
    "packages": ["packageKorean", "packageSingapore", "packagePhilippines"]  // 1.29MB ✅
  },
  "pages/recording-clips/index": {
    "network": "all",
    "packages": ["packageThailand"]  // 968KB ✅
  }
}
```

##### 4.2.3 新分包预加载决策流程

**大分包 (>1MB)**：
- 优先分配到 `air-ground-communication` 页面
- 如果该页面容量不足，重新平衡现有分包

**小分包 (<500KB)**：
- 优先分配到 `recording-categories` 页面
- 可以与其他小分包组合

**中等分包 (500KB-1MB)**：
- 评估所有页面剩余容量
- 选择最优分配方案

---

### 第5步：更新音频播放器配置 🎵

编辑 `miniprogram/pages/audio-player/index.ts` 文件：

#### 5.1 添加路径映射

在 `regionPathMap` 对象中添加：

```typescript
const regionPathMap: { [key: string]: string } = {
  'japan': '/packageJapan/',
  'philippines': '/packagePhilippines/', 
  'korea': '/packageKorean/',
  'singapore': '/packageSingapore/',  // 👈 添加这一行
  'thailand': '/packageThailand/',
  'russia': '/packageRussia/',
  // ... 其他路径映射
};
```

#### 5.2 添加分包加载映射

在 `subpackageMap` 对象中添加：

```typescript
const subpackageMap: { [key: string]: string } = {
  'japan': 'japanAudioPackage',
  'philippines': 'philippineAudioPackage',
  'korea': 'koreaAudioPackage', 
  'singapore': 'singaporeAudioPackage',  // 👈 添加这一行
  'thailand': 'thailandAudioPackage',
  'russia': 'russiaAudioPackage',
  // ... 其他分包映射
};
```

---

### 第6步：更新预加载分包列表 📋

根据您在第4步选择的预加载策略，更新对应页面的预加载分包列表：

#### 6.1 如果添加到 `air-ground-communication` 页面

编辑 `miniprogram/pages/air-ground-communication/index.ts`：

```typescript
// 方法1: 检查分包是否已加载
isPackageLoaded(packageName: string): boolean {
  const preloadedPackages = [
    "packageJapan", 
    "packageRussia",
    "packageSingapore"  // 👈 如果预加载到此页面，添加这一行
  ];
  return preloadedPackages.includes(packageName) || this.data.loadedPackages.includes(packageName);
}

// 方法2: 初始化预加载状态
initializePreloadedPackages() {
  const preloadedPackages = [
    "packageJapan", 
    "packageRussia",
    "packageSingapore"  // 👈 如果预加载到此页面，添加这一行
  ];
  preloadedPackages.forEach(packageName => {
    if (!this.data.loadedPackages.includes(packageName)) {
      this.data.loadedPackages.push(packageName);
    }
  });
  this.setData({ loadedPackages: this.data.loadedPackages });
}
```

#### 6.2 如果添加到其他页面

如果新分包被分配到 `recording-categories` 或 `recording-clips` 页面，那么**无需修改代码**，因为这些页面使用异步加载机制。

---

## ✅ 验证与测试

### 配置检查清单 🔍

完成所有配置后，按顺序执行以下检查：

#### 阶段1：文件和语法检查
- [ ] **数据文件语法**：`node -c miniprogram/data/regions/[country].js`
- [ ] **音频配置语法**：`node -c miniprogram/utils/audio-config.js`
- [ ] **小程序配置**：`node -e "require('./miniprogram/app.json')"`
- [ ] **音频文件存在**：确认所有 mp3 文件都在分包目录中

#### 阶段2：分包大小检查
- [ ] **新分包大小**：`du -sh miniprogram/package[Country]/`
- [ ] **预加载页面总大小**：验证 < 2MB 限制
- [ ] **所有分包总大小**：`du -sh miniprogram/package*/`

#### 阶段3：配置一致性检查
- [ ] **数据文件导入**：检查 `audio-config.js` 中的 require 语句
- [ ] **地区配置**：检查 `regions` 数组中的新地区
- [ ] **机场配置**：检查 `airports` 数组中的新机场
- [ ] **分包定义**：检查 `app.json` 中的 `subPackages` 配置
- [ ] **预加载规则**：检查 `app.json` 中的 `preloadRule` 配置
- [ ] **路径映射**：检查 `audio-player/index.ts` 中的路径和分包映射
- [ ] **预加载列表**：检查相关页面的预加载分包列表

### 功能测试步骤 🧪

#### 开发者工具测试
1. **重启开发者工具**
2. **检查控制台错误**：确保无红色错误信息
3. **进入"陆空通话"页面**
4. **点击"航线录音"**
5. **验证新国家显示**：确认新增国家出现在列表中
6. **选择新增国家**：
   - 预加载分包：应立即进入分类页面
   - 异步加载分包：应显示"正在加载音频资源..."
7. **选择录音分类**
8. **播放音频测试**：
   - 检查音频路径正确：`/package[Country]/xxx.mp3`
   - 确认音频能正常播放
   - 验证中英文文本显示正确

#### 真机测试（推荐）
1. **扫码预览到真机**
2. **重复开发者工具的测试步骤**
3. **特别关注异步加载功能**：真机环境下的分包加载体验

### 常见问题诊断 🔧

#### 问题1：国家不显示
**可能原因**：
- `audio-config.js` 中缺少地区配置
- 数据文件导入失败

**检查方法**：
```bash
node -e "const config = require('./miniprogram/utils/audio-config.js'); console.log(config.audioConfigManager.getRegions().map(r => r.name));"
```

#### 问题2：音频无法播放
**可能原因**：
- 路径映射配置缺失
- 分包映射配置缺失  
- 音频文件不存在

**检查方法**：
1. 确认控制台中音频路径正确
2. 手动检查文件是否存在
3. 检查 `audio-player/index.ts` 配置

#### 问题3：预加载超限
**错误信息**：`preloadRule source size exceed max limit 2MB`

**解决方法**：
1. 计算当前页面分包总大小
2. 重新分配分包到其他页面
3. 更新对应的预加载分包列表

---

## 📋 标准规范

### 命名规范

| 项目 | 格式 | 示例 |
|------|------|------|
| **数据文件** | `[国家小写].js` | `singapore.js` |
| **分包目录** | `package[国家首字母大写]` | `packageSingapore` |
| **地区ID** | 小写英文 | `singapore` |
| **音频文件** | `航班号_动作描述.mp3` | `Singapore-Airlines-117_Turn-Left-180.mp3` |

### 数据格式标准

**必需字段**：
- `label`：录音类型（进近/塔台/地面/放行/区调）
- `full_transcript`：英文原文
- `translation_cn`：中文翻译  
- `mp3_file`：音频文件名

**录音类型标准**：
- **进近**：Approach Control
- **塔台**：Tower Control  
- **地面**：Ground Control
- **放行**：Clearance Delivery
- **区调**：Area Control

---

## 🔧 常见问题解决

### Q1：音频播放失败
**原因**：音频文件路径不正确
**解决**：检查 `mp3_file` 字段与实际文件名是否一致

### Q2：页面不显示新增国家
**原因**：配置文件语法错误或路径错误
**解决**：检查 `utils/audio-config.js` 语法和引用路径

### Q3：点击国家没有反应
**原因**：`hasRealRecordings` 设置为 `false` 或数据结构错误
**解决**：确保设置为 `true` 且数据格式正确

### Q4：小程序编译错误
**原因**：`app.json` 语法错误或引用不存在的分包
**解决**：检查JSON语法和分包目录是否存在

---

## 🎯 最佳实践

### 1. 音频文件优化
- **格式**：MP3格式
- **大小**：控制在 500KB 以内
- **质量**：清晰可听，无噪音

### 2. 命名一致性
- 使用英文命名，避免中文字符
- 统一使用驼峰命名法
- 文件名描述要清晰明确

### 3. 数据质量
- 英文原文必须准确
- 中文翻译要专业、通俗易懂
- 录音分类要准确

### 4. 测试充分性
- 每个录音都要测试播放
- 检查所有页面跳转
- 验证音量控制功能

---

## 📊 当前系统状态

### 已集成地区

| 国家 | 分包名 | 录音数量 | 状态 |
|------|--------|----------|------|
| 🇯🇵 日本 | `packageJapan` | 24个 | ✅ 完成 |
| 🇵🇭 菲律宾 | `packagePhilippines` | 27个 | ✅ 完成 |
| 🇰🇷 韩国 | `packageKorean` | 19个 | ✅ 完成 |
| 🇸🇬 新加坡 | `packageSingapore` | 8个 | ✅ 完成 |

### 系统架构图

```
FlightToolbox 音频系统
├── 数据层 (data/regions/*.js)
├── 配置层 (utils/audio-config.js)  
├── 分包层 (package*/）
├── 界面层 (pages/*)
└── 播放层 (audio-player)
```

---

## 📞 支持与联系

遇到问题？请：

1. **检查本文档**：90%的问题都能在这里找到答案
2. **查看控制台**：微信开发者工具的控制台会显示详细错误
3. **对比现有代码**：参考已成功集成的国家（如新加坡）

---

**文档版本**：v2.0  
**最后更新**：2024-07-05  
**维护者**：FlightToolbox 开发团队

---

✈️ **祝您顺利完成音频集成！**