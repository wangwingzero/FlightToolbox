# 插屏广告智能展示策略 - 使用指南

## 📊 策略概述

基于行业最佳实践设计的多维度智能广告展示系统，在保证广告收益的同时确保用户体验。

### 🎯 核心特性

1. **多维度控制**
   - ⏰ 时间间隔：5分钟最小间隔
   - 🔢 操作次数：至少4次页面切换
   - ⏱️ 会话管理：每30分钟最多2次
   - 📅 每日上限：每天最多8次

2. **场景感知**
   - 🚫 驾驶舱页面不展示（关键功能保护）
   - ✅ 查询、计算等页面优先展示
   - 🎯 自然断点展示（任务完成后）

3. **用户分层**
   - 🆕 新用户保护：15分钟或10次操作后才展示
   - 👤 活跃用户：智能调节频率

4. **行业标准**
   - 基于Google建议：每小时1次
   - 每2-4次用户操作展示1次
   - 避免打断关键操作

## 📈 收益与体验平衡

### 预期效果

| 指标 | 旧策略（60秒） | 新策略（智能） | 说明 |
|------|--------------|--------------|------|
| 每小时展示次数 | 最多60次 | 最多2次 | 符合行业标准 |
| 每日展示次数 | 无限制 | 最多8次 | 避免用户厌烦 |
| 新用户保护 | ❌ 无 | ✅ 15分钟 | 提升留存率 |
| 关键页面保护 | ❌ 无 | ✅ 驾驶舱 | 保护核心功能 |
| 用户投诉风险 | 🔴 高 | 🟢 低 | 大幅降低 |
| 卸载风险 | 🔴 高 | 🟢 低 | 过度广告是卸载主因 |
| 广告点击率 | 🟡 中低 | 🟢 中高 | 自然断点提升点击率 |

### 收益分析

- ❌ **旧策略问题**：高频展示导致用户厌烦，点击率低，长期收益下降
- ✅ **新策略优势**：精准展示提升点击率，用户留存率提升，长期收益更高

## 🚀 使用方法

### 方法1：完整智能策略（推荐）

```javascript
// 在页面JS文件中引入
var adHelper = require('../../utils/ad-helper.js');

Page({
  data: {
    interstitialAd: null,
    interstitialAdLoaded: false
  },

  onLoad: function(options) {
    // 1. 创建广告实例
    this.data.interstitialAd = adHelper.setupInterstitialAd(this, '资料查询页');
  },

  onShow: function() {
    // 2. 获取当前页面路径
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    var route = currentPage.route || '';

    // 3. 使用智能策略展示广告
    adHelper.showInterstitialAdWithStrategy(
      this.data.interstitialAd,
      route,  // 当前页面路径
      this,   // 页面上下文
      '资料查询页'  // 页面名称（日志用）
    );
  },

  onUnload: function() {
    // 4. 清理广告实例
    adHelper.cleanupInterstitialAd(this, '资料查询页');
  }
});
```

### 方法2：使用BasePage（更简洁）

```javascript
var BasePage = require('../../utils/base-page.js');
var adHelper = require('../../utils/ad-helper.js');

var pageConfig = {
  data: {
    interstitialAd: null
  },

  customOnLoad: function(options) {
    // 创建广告实例
    this.data.interstitialAd = adHelper.setupInterstitialAd(this, '资料查询页');
  },

  customOnShow: function() {
    // 获取当前页面路径
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    var route = currentPage.route || '';

    // 智能展示广告
    adHelper.showInterstitialAdWithStrategy(
      this.data.interstitialAd,
      route,
      this,
      '资料查询页'
    );
  },

  customOnUnload: function() {
    // 清理广告实例
    adHelper.cleanupInterstitialAd(this, '资料查询页');
  }
};

Page(BasePage.createPage(pageConfig));
```

### 方法3：兼容旧代码（自动升级）

```javascript
// 旧代码无需修改，自动使用智能策略
var adHelper = require('../../utils/ad-helper.js');

customOnShow: function() {
  // 内部会自动获取页面路径并使用智能策略
  adHelper.showInterstitialAdSafely(
    this.data.interstitialAd,
    1000,
    this,
    '资料查询页'
  );
}
```

## 🔧 高级功能

### 查看广告统计

```javascript
// 获取当前广告展示统计
var stats = adHelper.getAdStatistics();
console.log('广告统计:', stats);

/* 输出示例：
{
  dailyCount: 3,          // 今日已展示次数
  dailyLimit: 8,          // 每日上限
  sessionCount: 1,        // 当前会话已展示次数
  sessionLimit: 2,        // 会话上限
  actionCount: 6,         // 当前操作计数
  actionRequired: 4,      // 要求的操作次数
  lastShowTime: 1234567890,  // 最后展示时间戳
  timeSinceLastShow: 180000,  // 距上次展示时间（毫秒）
  requiredInterval: 300000,   // 要求的时间间隔（毫秒）
  isNewUser: false,       // 是否为新用户
  appUsageTime: 3600000   // 应用使用时长（毫秒）
}
*/
```

### 自定义黑名单页面

```javascript
// 在 ad-strategy.js 中修改配置
var CONFIG = {
  // ...其他配置

  // 黑名单页面（这些页面不展示插屏广告）
  BLACKLIST_PAGES: [
    'pages/cockpit/index',      // 驾驶舱
    'pages/custom/page'         // 自定义添加
  ],

  // 优先级页面（这些页面切换后更适合展示广告）
  PRIORITY_PAGES: [
    'pages/search/index',        // 资料查询
    'pages/flight-calculator/index'  // 计算工具
  ]
};
```

### 调整策略参数

```javascript
// 在 ad-strategy.js 中修改 CONFIG 对象

var CONFIG = {
  // 基础时间间隔（默认5分钟）
  BASE_TIME_INTERVAL: 5 * 60 * 1000,  // 可改为 10 * 60 * 1000（10分钟）

  // 最少操作次数（默认4次）
  MIN_ACTION_COUNT: 4,  // 可改为 6（更谨慎）

  // 每个会话最多展示次数（默认2次）
  MAX_ADS_PER_SESSION: 2,  // 可改为 1（更保守）

  // 每日最大展示次数（默认8次）
  MAX_ADS_PER_DAY: 8,  // 可改为 6（更少）

  // 新用户保护期（默认15分钟）
  NEW_USER_PROTECTION_TIME: 15 * 60 * 1000,  // 可改为 30 * 60 * 1000（30分钟）

  // 新用户保护操作次数（默认10次）
  NEW_USER_PROTECTION_ACTIONS: 10,  // 可改为 15（更多）

  // 展示延迟（默认1.5秒）
  SHOW_DELAY: 1500  // 可改为 2000（2秒）
};
```

## 🧪 测试和调试

### 开启调试模式

```javascript
// 在 ad-helper.js 中设置
var DEBUG_MODE = true;  // 开启详细日志

// 在 ad-strategy.js 中没有调试开关，所有日志默认输出
```

### 重置广告数据（仅测试用）

```javascript
// 仅在 DEBUG_MODE = true 时可用
adHelper.resetAllAdData();
```

### 测试场景

1. **新用户测试**
   - 首次启动后15分钟内或10次操作内不应出现广告

2. **频率测试**
   - 连续切换页面4次后可能出现广告
   - 同一会话（30分钟）内最多2次
   - 每天最多8次

3. **黑名单测试**
   - 在驾驶舱页面应该永不出现广告

4. **时间间隔测试**
   - 两次广告之间至少间隔5分钟

## 📋 5个TabBar页面配置清单

### 需要修改的页面

| 页面 | 路径 | 优先级 | 是否黑名单 |
|------|------|--------|-----------|
| 资料查询 | pages/search/index | ✅ 高 | ❌ |
| 计算工具 | pages/flight-calculator/index | ✅ 高 | ❌ |
| 驾驶舱 | pages/cockpit/index | ❌ - | ✅ 是 |
| 通信 | pages/operations/index | 🟡 中 | ❌ |
| 我的首页 | pages/home/index | 🟡 中 | ❌ |

### 实施建议

1. **优先级页面**（资料查询、计算工具）
   - 这些页面用户完成任务后最适合展示广告
   - 保持现有配置即可

2. **黑名单页面**（驾驶舱）
   - 已在策略中配置为黑名单
   - 永不展示插屏广告
   - 保护关键飞行功能

3. **普通页面**（通信、我的首页）
   - 正常展示广告
   - 受智能策略控制

## 🎓 最佳实践建议

### ✅ DO（推荐做法）

1. 使用 `showInterstitialAdWithStrategy` 获得完整策略支持
2. 在 `onShow` 中调用广告展示（自然断点）
3. 在 `onUnload` 中清理广告实例
4. 定期查看 `getAdStatistics()` 监控广告表现
5. 根据用户反馈调整策略参数

### ❌ DON'T（避免做法）

1. ❌ 不要手动控制展示频率（策略已自动管理）
2. ❌ 不要在 `onLoad` 中立即展示广告
3. ❌ 不要在用户点击按钮后立即展示（容易误点）
4. ❌ 不要在关键操作中展示（如驾驶舱）
5. ❌ 不要绕过策略直接调用 `adInstance.show()`

## 📊 监控和优化

### 关键指标

定期监控以下指标以优化策略：

1. **用户留存率**：新用户7日留存率
2. **卸载率**：是否因广告导致卸载
3. **广告点击率**：实际点击率 vs 展示率
4. **用户投诉**：关于广告的用户反馈
5. **广告收益**：总收益 vs 展示次数

### 优化建议

- 如果点击率低 → 增加操作次数阈值
- 如果用户投诉多 → 增加时间间隔或减少每日上限
- 如果收益低 → 适度降低操作次数阈值（但不要过度）
- 如果新用户留存差 → 延长新用户保护期

## 🔄 版本历史

### v2.0（当前版本）
- ✨ 引入智能展示策略
- ✨ 多维度频率控制
- ✨ 场景感知和用户分层
- ✨ 基于行业最佳实践

### v1.0（旧版本）
- ⚠️ 简单时间间隔控制（60秒）
- ⚠️ 无操作次数限制
- ⚠️ 无每日上限
- ⚠️ 无新用户保护

## 📞 技术支持

如有问题，请查看：
1. 代码注释（ad-helper.js 和 ad-strategy.js）
2. 控制台日志（开启 DEBUG_MODE）
3. 广告统计信息（getAdStatistics()）
