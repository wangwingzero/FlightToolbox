# TabBar 页面原生模板广告增强设计文档

**创建日期**: 2025-12-25  
**文档版本**: v1.0  
**状态**: 待实现

---

## 一、需求概述

### 1.1 目标

在 4 个 TabBar 页面（资料查询、计算工具、通信、我的首页）增加原生模板广告，提升广告曝光和收益。**驾驶舱页面不需要增加广告**。

### 1.2 广告位置规划

每个页面增加 **2 个广告位**：

1. **横版广告**：放置在页面顶部特殊卡片下方
2. **竖版广告（卡片式）**：插入到卡片网格的第 3 个位置，样式与普通卡片一致

### 1.3 广告行为

- 用户观看激励视频广告后，获得 1 小时无广告奖励
- 无广告期间，这两个广告位自动隐藏，卡片网格自动回流填充

---

## 二、广告位 ID

使用现有已申请的广告位，**无需重新申请**：

| 广告类型 | 广告位 ID | 用途 |
|---------|----------|------|
| 横版原生模板 | `adunit-3a1bf3800fa937a2` | 顶部特殊卡片下方 |
| 竖版原生模板 | `adunit-d7a3b71f5ce0afca` | 卡片网格第 3 位置 |

---

## 三、各页面具体实现方案

### 3.1 资料查询页面 (`pages/search/index`)

#### 当前页面结构
```
┌─────────────────────────────┐
│  激励视频卡片（支持作者）     │  ← 已有
└─────────────────────────────┘
┌──────────┐  ┌──────────┐
│  卡片1   │  │  卡片2   │      ← displayCategories 数组
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│  卡片3   │  │  卡片4   │
└──────────┘  └──────────┘
     ...
┌─────────────────────────────┐
│  底部横版广告（已有）         │  ← 已有，建议删除（避免广告过多）
└─────────────────────────────┘
```

#### 改造后结构（删除底部广告）
```
┌─────────────────────────────┐
│  激励视频卡片（支持作者）     │
└─────────────────────────────┘
┌─────────────────────────────┐
│  【新增】横版广告            │  ← 位置1：激励卡片下方
└─────────────────────────────┘
┌──────────┐  ┌──────────┐
│  卡片1   │  │  卡片2   │
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│【竖版广告】│  │  卡片3   │      ← 位置2：第3格（原卡片3变第4）
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│  卡片4   │  │  卡片5   │
└──────────┘  └──────────┘
     ...
```

#### WXML 修改位置

**文件**: `miniprogram/pages/search/index.wxml`

**修改点 1**：在激励视频卡片 `</view>` 结束标签后，`categories-grid` 开始前，插入横版广告：

```xml
  <!-- 支持作者卡片结束 -->
  </view>

  <!-- 【新增】横版广告 - 激励卡片下方 -->
  <view wx:if="{{ !isAdFree && nativeAdEnabled }}" class="ad-horizontal-container">
    <ad unit-id="adunit-3a1bf3800fa937a2" ad-type="banner" ad-intervals="30"></ad>
  </view>

  <!-- 资料查询卡片网格 -->
  <view class="categories-grid">
```

**修改点 2**：在 `categories-grid` 内部，使用 `wx:for` 循环时插入竖版广告到第 3 位置：

```xml
  <view class="categories-grid">
    <!-- 前两个卡片正常渲染 -->
    <block wx:for="{{ displayCategories }}" wx:key="id">
      <!-- 在第3个位置（index=2）之前插入竖版广告 -->
      <view wx:if="{{ index === 2 && !isAdFree && nativeAdEnabled }}" class="category-card ad-card-vertical">
        <ad unit-id="adunit-d7a3b71f5ce0afca" ad-type="banner" ad-intervals="30"></ad>
      </view>
      
      <!-- 正常卡片 -->
      <view
        class="category-card theme-{{ item.themeColor }}"
        bind:tap="onCategoryClick"
        data-category="{{ item }}"
      >
        <view class="category-icon">{{ item.icon }}</view>
        <view class="category-content">
          <view class="category-title">{{ item.title }}</view>
          <view class="category-desc">{{ item.description }}</view>
        </view>
        <view class="category-points" wx:if="{{ item.pointsText }}">
          <van-tag type="{{ item.pointsType }}" size="mini">{{ item.pointsText }}</van-tag>
        </view>
        <view class="category-count">
          <van-tag type="{{ item.countType || 'primary' }}" size="medium">{{ item.count }}</van-tag>
        </view>
      </view>
    </block>
  </view>
```

#### JS 修改说明

**文件**: `miniprogram/pages/search/index.js`

资料查询页面已有 `isAdFree` 和 `nativeAdEnabled` 逻辑，**无需修改 JS 文件**。只需确认以下两点：

1. `onShow` 中已调用 `adFreeManager.isAdFree()` 更新 `isAdFree`
2. `nativeAdEnabled` 已从 `app-config.js` 正确读取

#### 底部广告处理

资料查询页面底部已有一个横版广告，建议**删除**，避免同一页面广告过多影响用户体验：

```xml
<!-- ⚠️ 建议删除以下代码 -->
<view wx:if="{{ !isAdFree && nativeAdEnabled }}" class="ad-banner-container">
  <ad unit-id="adunit-3a1bf3800fa937a2" ad-type="banner" ad-intervals="30"></ad>
</view>
```

### 3.2 计算工具页面 (`pages/flight-calculator/index`)

#### 当前页面结构
```
┌─────────────────────────────┐
│  机场打卡卡片                │  ← 顶部特殊卡片
└─────────────────────────────┘
┌──────────┐  ┌──────────┐
│  卡片1   │  │  卡片2   │      ← displayModules 数组
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│  卡片3   │  │  卡片4   │
└──────────┘  └──────────┘
     ...
```

#### 改造后结构
```
┌─────────────────────────────┐
│  机场打卡卡片                │
└─────────────────────────────┘
┌─────────────────────────────┐
│  【新增】横版广告            │  ← 位置1
└─────────────────────────────┘
┌──────────┐  ┌──────────┐
│  卡片1   │  │  卡片2   │
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│【竖版广告】│  │  卡片3   │      ← 位置2
└──────────┘  └──────────┘
     ...
```

#### WXML 修改位置

**文件**: `miniprogram/pages/flight-calculator/index.wxml`

**修改点 1**：在机场打卡卡片 `</view>` 结束后，`modules-grid` 开始前插入横版广告：

```xml
    <!-- 机场打卡卡片结束 -->
    </view>

    <!-- 【新增】横版广告 - 机场打卡卡片下方 -->
    <view wx:if="{{ !isAdFree && nativeAdEnabled }}" class="ad-horizontal-container">
      <ad unit-id="adunit-3a1bf3800fa937a2" ad-type="banner" ad-intervals="30"></ad>
    </view>

    <!-- 飞行计算工具卡片网格 -->
    <view class="modules-grid">
```

**修改点 2**：在 `modules-grid` 内部插入竖版广告：

```xml
    <view class="modules-grid">
      <block wx:for="{{ displayModules }}" wx:key="id">
        <!-- 在第3个位置（index=2）之前插入竖版广告 -->
        <view wx:if="{{ index === 2 && !isAdFree && nativeAdEnabled }}" class="module-card ad-card-vertical">
          <ad unit-id="adunit-d7a3b71f5ce0afca" ad-type="banner" ad-intervals="30"></ad>
        </view>
        
        <!-- 正常卡片 -->
        <view
          class="module-card"
          bind:tap="selectModule"
          data-module="{{ item.id }}"
        >
          <view class="module-icon">{{ item.icon }}</view>
          <view class="module-title">{{ item.title }}</view>
          <view class="module-desc">{{ item.description }}</view>
          <view class="module-count">
            <van-tag type="{{ item.tagType || 'primary' }}" size="medium">{{ item.category }}</van-tag>
          </view>
        </view>
      </block>
    </view>
```

#### JS 修改

**文件**: `miniprogram/pages/flight-calculator/index.js`

需要在文件顶部引入依赖，在 `data` 中添加数据项，并在 `onShow` 中更新状态：

```javascript
// ⚠️ 在文件顶部引入（不要在 onShow 中 require）
const appConfig = require('../../utils/app-config.js');
const adFreeManager = require('../../utils/ad-free-manager.js');

Page({
  data: {
    // ... 其他已有数据
    isAdFree: false,           // 新增
    nativeAdEnabled: false     // 新增
  },

  onShow: function() {
    // ... 其他已有逻辑
    
    // 新增：更新广告显示状态
    this.setData({
      isAdFree: adFreeManager.isAdFree(),
      nativeAdEnabled: appConfig.nativeTemplateAdEnabled
    });
  }
});
```

### 3.3 通信页面 (`pages/operations/index`)

#### 当前页面结构
```
┌─────────────────────────────┐
│  随机航线录音播放器卡片       │  ← 顶部特殊卡片
└─────────────────────────────┘
┌──────────┐  ┌──────────┐
│  航线录音 │  │  陆空通话 │      ← 硬编码的卡片（非数组循环）
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│ CPDLC电文│  │  通信失效 │
└──────────┘  └──────────┘
┌──────────┐
│紧急改变高度│
└──────────┘
┌─────────────────────────────┐
│  底部横版广告（已有）         │
└─────────────────────────────┘
```

#### 改造后结构
```
┌─────────────────────────────┐
│  随机航线录音播放器卡片       │
└─────────────────────────────┘
┌─────────────────────────────┐
│  【新增】横版广告            │  ← 位置1
└─────────────────────────────┘
┌──────────┐  ┌──────────┐
│  航线录音 │  │  陆空通话 │
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│【竖版广告】│  │ CPDLC电文│      ← 位置2：第3格
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│  通信失效 │  │紧急改变高度│
└──────────┘  └──────────┘
```

#### ⚠️ 特殊说明

通信页面的卡片是**硬编码**的，不是通过数组循环渲染。需要手动在第 2 个卡片后插入竖版广告。

#### WXML 修改位置

**文件**: `miniprogram/pages/operations/index.wxml`

**修改点 1**：在 `quick-audio-card` 结束后，`modules-grid` 开始前插入横版广告：

```xml
    <!-- 随机航线录音播放器卡片结束 -->
    </view>

    <!-- 【新增】横版广告 - 播放器卡片下方 -->
    <view wx:if="{{ !isAdFree && nativeAdEnabled }}" class="ad-horizontal-container">
      <ad unit-id="adunit-3a1bf3800fa937a2" ad-type="banner" ad-intervals="30"></ad>
    </view>

    <!-- 航班运行功能卡片网格 -->
    <view class="modules-grid">
```

**修改点 2**：在 `modules-grid` 内部，第 2 个卡片（陆空通话）后面插入竖版广告：

```xml
    <view class="modules-grid">
      <!-- 卡片1：航线录音 -->
      <view class="module-card" bind:tap="selectModule" data-module="airline-recordings">
        <view class="module-icon">🎧</view>
        <view class="module-title">航线录音</view>
        <view class="module-desc">听听前辈怎么说话，跟着学准没错</view>
        <view class="module-count">
          <van-tag type="warning" size="medium">330条录音</van-tag>
        </view>
      </view>
      
      <!-- 卡片2：陆空通话 -->
      <view class="module-card" bind:tap="openStandardPhraseology">
        <view class="module-icon">💬</view>
        <view class="module-title">陆空通话</view>
        <view class="module-desc">一站式搜索标准用语与通信规范</view>
        <view class="module-count">
          <van-tag type="primary" size="medium">200+用语 · 6个要点</van-tag>
        </view>
      </view>

      <!-- 【新增】竖版广告 - 第3个位置 -->
      <view wx:if="{{ !isAdFree && nativeAdEnabled }}" class="module-card ad-card-vertical">
        <ad unit-id="adunit-d7a3b71f5ce0afca" ad-type="banner" ad-intervals="30"></ad>
      </view>

      <!-- 卡片3：CPDLC电文（原第3，现第4） -->
      <view class="module-card" bind:tap="openCPDLC">
        ...
      </view>
      
      <!-- 后续卡片保持不变 -->
    </view>
```

#### JS 修改

**文件**: `miniprogram/pages/operations/index.js`

同计算工具页面，需要添加 `isAdFree` 和 `nativeAdEnabled` 数据项。

### 3.4 我的首页 (`pages/home/index`)

#### 当前页面结构
```
┌─────────────────────────────┐
│  用户状态卡片（等级/经验）    │  ← 顶部特殊卡片
└─────────────────────────────┘
┌─────────────────────────────┐
│  资质提醒卡片                │
└─────────────────────────────┘
┌──────────┐  ┌──────────┐
│执勤期计算器│  │ 个人检查单│      ← tools-grid（硬编码卡片）
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│ 长航线换班│  │ 分飞行时间│
└──────────┘  └──────────┘
     ...
┌─────────────────────────────┐
│  离线模式横幅                │
└─────────────────────────────┘
┌─────────────────────────────┐
│  应用信息卡片                │
└─────────────────────────────┘
┌─────────────────────────────┐
│  底部横版广告（已有）         │
└─────────────────────────────┘
```

#### 改造后结构
```
┌─────────────────────────────┐
│  用户状态卡片（等级/经验）    │
└─────────────────────────────┘
┌─────────────────────────────┐
│  【新增】横版广告            │  ← 位置1：用户状态卡片下方
└─────────────────────────────┘
┌─────────────────────────────┐
│  资质提醒卡片                │
└─────────────────────────────┘
┌──────────┐  ┌──────────┐
│执勤期计算器│  │ 个人检查单│
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│【竖版广告】│  │ 长航线换班│      ← 位置2：第3格
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│ 分飞行时间│  │  资质管理 │
└──────────┘  └──────────┘
     ...
```

#### WXML 修改位置

**文件**: `miniprogram/pages/home/index.wxml`

**修改点 1**：在 `user-status-card` 结束后，`qualification-alert-card` 开始前插入横版广告：

```xml
  <!-- 用户状态卡片结束 -->
  </view>

  <!-- 【新增】横版广告 - 用户状态卡片下方 -->
  <view wx:if="{{ !isAdFree && nativeAdEnabled }}" class="ad-horizontal-container">
    <ad unit-id="adunit-3a1bf3800fa937a2" ad-type="banner" ad-intervals="30"></ad>
  </view>

  <!-- 资质提醒卡片 -->
  <view wx:if="{{ qualifications.length > 0 }}" class="qualification-alert-card">
```

**修改点 2**：在 `tools-grid` 内部，第 2 个卡片（个人检查单）后面插入竖版广告：

```xml
  <view class="tools-grid">
    <!-- 卡片1：执勤期计算器 -->
    <view class="category-card flight-calc" bind:tap="openDutyCalculator">
      <view class="card-icon">⏱️</view>
      <view class="card-title">执勤期计算器</view>
      <view class="card-desc">值班多久合法，秒查不求人</view>
      <view class="card-badge">
        <van-tag type="warning" size="medium">法规查询</van-tag>
      </view>
    </view>

    <!-- 卡片2：个人检查单 -->
    <view class="category-card management" bind:tap="openPersonalChecklist">
      <view class="card-icon">✅</view>
      <view class="card-title">个人检查单</view>
      <view class="card-desc">私人定制检查单，不遗漏不心慌</view>
      <view class="card-badge">
        <van-tag type="purple" size="medium">个性定制</van-tag>
      </view>
    </view>

    <!-- 【新增】竖版广告 - 第3个位置 -->
    <view wx:if="{{ !isAdFree && nativeAdEnabled }}" class="category-card ad-card-vertical">
      <ad unit-id="adunit-d7a3b71f5ce0afca" ad-type="banner" ad-intervals="30"></ad>
    </view>

    <!-- 卡片3：长航线换班（原第3，现第4） -->
    <view class="category-card flight-calc" bind:tap="openLongFlightCrewRotation">
      ...
    </view>
    
    <!-- 后续卡片保持不变 -->
  </view>
```

#### JS 修改

**文件**: `miniprogram/pages/home/index.js`

同上，需要添加 `isAdFree` 和 `nativeAdEnabled` 数据项。

---

## 四、通用样式定义

### 4.1 横版广告容器样式

在各页面的 WXSS 文件中添加（或在全局样式 `app.wxss` 中统一添加）：

```css
/* 横版广告容器 - 激励卡片/特殊卡片下方 */
.ad-horizontal-container {
  margin: 16rpx 24rpx 8rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow: 
    0 2rpx 16rpx rgba(0, 0, 0, 0.04),
    0 0rpx 2rpx rgba(0, 0, 0, 0.02);
}

.ad-horizontal-container ad {
  width: 100%;
}
```

### 4.2 竖版广告卡片样式

竖版广告需要和普通卡片保持一致的外观：

```css
/* 竖版广告卡片 - 融入卡片网格 */
.ad-card-vertical {
  background: #FFFFFF;
  border-radius: 28rpx;
  overflow: hidden;
  min-height: 320rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 2rpx 16rpx rgba(0, 0, 0, 0.04),
    0 0rpx 2rpx rgba(0, 0, 0, 0.02);
}

.ad-card-vertical ad {
  width: 100%;
  height: 100%;
}

/* 确保广告卡片参与 grid 布局 */
.categories-grid .ad-card-vertical,
.modules-grid .ad-card-vertical,
.tools-grid .ad-card-vertical {
  /* 继承 grid 子项的默认行为 */
}
```

### 4.3 各页面特定样式调整

由于各页面的卡片样式类名不同，需要分别处理：

| 页面 | 卡片网格类名 | 卡片类名 | 广告卡片类名 |
|-----|------------|---------|------------|
| 资料查询 | `.categories-grid` | `.category-card` | `.category-card.ad-card-vertical` |
| 计算工具 | `.modules-grid` | `.module-card` | `.module-card.ad-card-vertical` |
| 通信 | `.modules-grid` | `.module-card` | `.module-card.ad-card-vertical` |
| 我的首页 | `.tools-grid` | `.category-card` | `.category-card.ad-card-vertical` |

---

## 五、JS 逻辑修改

### 5.1 需要修改的文件

| 页面 | JS 文件路径 |
|-----|-----------|
| 资料查询 | `miniprogram/pages/search/index.js` |
| 计算工具 | `miniprogram/pages/flight-calculator/index.js` |
| 通信 | `miniprogram/pages/operations/index.js` |
| 我的首页 | `miniprogram/pages/home/index.js` |

### 5.2 通用修改模板

每个页面的 JS 文件都需要做以下修改：

#### 5.2.1 引入依赖（⚠️ 必须在文件顶部）

```javascript
// 文件顶部，Page({}) 之前
const appConfig = require('../../utils/app-config.js');
const adFreeManager = require('../../utils/ad-free-manager.js');
```

> ⚠️ **重要**：不要在 `onShow` 或其他生命周期函数中使用 `require`，这会导致每次调用都重新加载模块，影响性能。

#### 5.2.2 添加 data 字段

```javascript
data: {
  // ... 其他已有数据
  isAdFree: false,           // 是否处于无广告状态
  nativeAdEnabled: false     // 原生模板广告总开关
},
```

#### 5.2.3 在 onShow 中更新广告状态

```javascript
onShow: function() {
  // ... 其他已有逻辑
  
  // 更新广告显示状态
  this.updateAdStatus();
},

// 新增方法：更新广告状态
updateAdStatus: function() {
  this.setData({
    isAdFree: adFreeManager.isAdFree(),
    nativeAdEnabled: appConfig.nativeTemplateAdEnabled
  });
},
```

### 5.3 资料查询页面特殊说明

资料查询页面（`pages/search/index.js`）已经有 `isAdFree` 和 `nativeAdEnabled` 的逻辑，只需确认：

1. `onShow` 中是否正确调用了 `adFreeManager.isAdFree()`
2. `nativeAdEnabled` 是否从 `app-config.js` 正确读取

如果已有，则无需重复添加。

---

## 六、广告显示/隐藏逻辑

### 6.1 控制条件

广告显示需要同时满足以下条件：

```javascript
// 显示广告的条件
const shouldShowAd = !isAdFree && nativeAdEnabled;
```

- `isAdFree`: 用户是否处于无广告状态（观看激励视频后 1 小时内为 true）
- `nativeAdEnabled`: 原生模板广告总开关（在 `app-config.js` 中配置）

### 6.2 无广告状态触发

当用户在资料查询页面观看完激励视频后：

1. `ad-free-manager.js` 会记录无广告开始时间
2. `isAdFree` 变为 `true`
3. 所有页面的广告自动隐藏（通过 `wx:if` 条件）
4. 卡片网格自动回流，填充广告位置

### 6.3 无广告状态过期

1 小时后：

1. `adFreeManager.isAdFree()` 返回 `false`
2. 用户下次进入页面时（`onShow`），广告重新显示

---

## 七、测试检查清单

### 7.1 功能测试

- [ ] 资料查询页面：横版广告在激励卡片下方正确显示
- [ ] 资料查询页面：竖版广告在第 3 个卡片位置正确显示
- [ ] 计算工具页面：横版广告在机场打卡卡片下方正确显示
- [ ] 计算工具页面：竖版广告在第 3 个卡片位置正确显示
- [ ] 通信页面：横版广告在播放器卡片下方正确显示
- [ ] 通信页面：竖版广告在第 3 个卡片位置正确显示
- [ ] 我的首页：横版广告在用户状态卡片下方正确显示
- [ ] 我的首页：竖版广告在第 3 个卡片位置正确显示
- [ ] 驾驶舱页面：确认没有新增广告

### 7.2 无广告状态测试

- [ ] 观看激励视频后，所有页面的 2 个广告位都隐藏
- [ ] 广告隐藏后，卡片网格自动回流，无空白
- [ ] 1 小时后，广告重新显示

### 7.3 样式测试

- [ ] 横版广告与页面风格协调
- [ ] 竖版广告与普通卡片大小、圆角、阴影一致
- [ ] 广告在不同屏幕尺寸下显示正常

### 7.4 边界情况测试

- [ ] `nativeAdEnabled` 为 `false` 时，所有广告不显示
- [ ] 广告加载失败时，不影响页面其他功能
- [ ] 快速切换 TabBar 页面时，广告状态正确

---

## 八、相关文件清单

### 8.1 需要修改的文件

| 文件路径 | 修改内容 |
|---------|---------|
| `miniprogram/pages/search/index.wxml` | 添加 2 个广告位，删除底部广告 |
| `miniprogram/pages/search/index.wxss` | 添加广告容器样式 |
| `miniprogram/pages/search/index.js` | 无需修改（已有广告逻辑） |
| `miniprogram/pages/flight-calculator/index.wxml` | 添加 2 个广告位 |
| `miniprogram/pages/flight-calculator/index.wxss` | 添加广告容器样式 |
| `miniprogram/pages/flight-calculator/index.js` | 添加广告状态逻辑 |
| `miniprogram/pages/operations/index.wxml` | 添加 2 个广告位 |
| `miniprogram/pages/operations/index.wxss` | 添加广告容器样式 |
| `miniprogram/pages/operations/index.js` | 添加广告状态逻辑 |
| `miniprogram/pages/home/index.wxml` | 添加 2 个广告位 |
| `miniprogram/pages/home/index.wxss` | 添加广告容器样式 |
| `miniprogram/pages/home/index.js` | 添加广告状态逻辑 |

### 8.2 依赖文件（只读，无需修改）

| 文件路径 | 用途 |
|---------|-----|
| `miniprogram/utils/app-config.js` | 读取 `nativeTemplateAdEnabled` 配置 |
| `miniprogram/utils/ad-free-manager.js` | 读取无广告状态 |

---

## 九、注意事项

### 9.1 广告静音问题

微信原生模板广告（`<ad>` 组件）**没有提供静音参数**。广告的声音由广告素材本身决定：

- 大部分原生模板广告素材默认是静音的
- 只有用户主动点击广告进入落地页后，才可能有声音
- 开发者无法通过代码控制广告声音

### 9.2 广告位 ID 复用

横版和竖版广告位 ID 可以在多个页面复用，微信会自动统计各页面的曝光数据。

### 9.3 广告加载失败处理

广告加载失败时，`<ad>` 组件会自动隐藏，不会显示空白区域。无需额外处理。

### 9.4 性能考虑

- 广告组件会自动管理加载和缓存
- 不要在 `onHide` 中销毁广告，让系统自动管理
- `ad-intervals="30"` 表示 30 秒刷新一次，这是合理的频率

### 9.5 边界情况处理

#### displayCategories/displayModules 数组长度不足 3

如果卡片数组长度小于 3，竖版广告不会显示（因为 `index === 2` 条件不满足）。这是预期行为，无需特殊处理。

#### 广告组件加载失败

微信 `<ad>` 组件在加载失败时会自动隐藏，不会显示空白。可以添加 `binderror` 事件监听，但不是必须的：

```xml
<ad 
  unit-id="adunit-xxx" 
  ad-type="banner" 
  ad-intervals="30"
  binderror="onAdError"
></ad>
```

```javascript
onAdError: function(e) {
  console.log('广告加载失败:', e.detail);
  // 可选：上报错误日志
}
```

### 9.6 代码风格一致性

- WXML 中的条件判断统一使用 `wx:if="{{ !isAdFree && nativeAdEnabled }}"`
- 广告容器类名统一使用 `ad-horizontal-container`（横版）和 `ad-card-vertical`（竖版）
- 所有广告组件统一设置 `ad-intervals="30"`

---

**文档结束**

如有疑问，请参考 `广告/广告位ID存档.md` 中的详细配置说明。
