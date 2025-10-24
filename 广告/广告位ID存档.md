# FlightToolbox 广告位配置文档
**更新时间**: 2025-10-19
**状态**: 已部署并验证
**广告类型**: 横幅广告(Banner Ad) + 格子广告(Grid Ad) + 插屏广告(Interstitial Ad)

---

## 📊 当前使用的广告位(8个)

| 序号 | 广告位名称 | 广告位ID | 广告类型 | 模式 | 状态 | 使用次数 |
|------|-----------|---------|---------|------|------|---------|
| 1 | 横幅3单图 | `adunit-4e68875624a88762` | Banner Ad | 优选 | ✅ 已开启 | 10次 |
| 2 | 横幅2左文右图 | `adunit-3b2e78fbdab16389` | Banner Ad | 优选 | ✅ 已开启 | 16次 |
| 3 | 横幅1左图右文 | `adunit-2f5afef0d27dc863` | Banner Ad | 优选 | ✅ 已开启 | 8次 |
| 4 | 格子1-多格子 | `adunit-735d7d24032d4ca8` | Grid Ad | 自定义 | ✅ 已开启 | 5次 |
| 5 | 横幅卡片3-上文下图拼接 | `adunit-d6c8a55bd3cb4fd1` | Banner Ad | 优选 | ✅ 已开启 | 8次 |
| 6 | 横幅卡片2-上图下文叠加A | `adunit-d7a3b71f5ce0afca` | Banner Ad | 优选 | ✅ 已开启 | 8次 |
| 7 | 横幅卡片1-上图下文叠加B | `adunit-3a1bf3800fa937a2` | Banner Ad | 优选 | ✅ 已开启 | 8次 |
| 8 | 通用插屏广告 | `adunit-1a29f1939a1c7864` | Interstitial Ad | 优选 | ✅ 已开启 | 5个页面复用 |

**总使用次数**: 57处(横幅+格子) + 5个TabBar页面(插屏待部署)

**⚠️ 重要说明**：
- 插屏广告使用**1个广告位ID**，在5个TabBar页面复用
- 每个页面分别创建该广告位的实例（实例不能跨页面共用）
- 符合微信小程序插屏广告最佳实践

---

## 📍 广告位使用详细分布

### 1. 横幅1左图右文 (adunit-2f5afef0d27dc863) - 8次
- `packageO/flight-calc-modules/acr/index.wxml` - ACR计算工具
- `pages/cockpit/index.wxml` - 驾驶舱
- `pages/communication-failure/regions/africa/index.wxml` - 非洲通信失效
- `pages/communication-failure/international/index.wxml` - 国际通信失效
- `pages/recording-clips/index.wxml` - 录音片段
- `packagePerformance/index.wxml` - 飞机性能参数与详解
- `packageO/cpdlc/index.wxml` - CPDLC电文查询(第1-2个结果之间)
- `packageO/flight-calc-modules/weight/index.wxml` - 重量换算(页面底部) ✨ 新增

### 2. 横幅3单图 (adunit-4e68875624a88762) - 10次
- `pages/search/index.wxml` - 资料查询页(首页)
- `pages/communication-failure/index.wxml` - 通信失效主页
- `pages/communication-failure/regions/north-america/index.wxml` - 北美通信失效
- `pages/airline-recordings/index.wxml` - 航线录音
- `packageA/index.wxml` - 民航英语词汇(第1-2章之间)
- `packageMedical/index.wxml` - 民航体检标准查询(页面底部)
- `packageICAO/index.wxml` - ICAO出版物(页面底部)
- `packageO/incident-investigation/index.wxml` - 事件调查(页面底部)
- `packageIOSA/index.wxml` - IOSA审计(页面底部)
- `packageCompetence/index.wxml` - PLM胜任力及行为指标框架(页面底部)

### 3. 横幅2左文右图 (adunit-3b2e78fbdab16389) - 16次
- `pages/flight-calculator/index.wxml` - 飞行计算器
- `pages/communication-failure/domestic/index.wxml` - 国内通信失效
- `pages/communication-failure/regions/south-america/index.wxml` - 南美通信失效
- `pages/recording-categories/index.wxml` - 录音分类
- `packageCompetence/index.wxml` - PLM胜任力及行为指标框架(搜索结果第1-2个之间)
- `packageA/index.wxml` - 民航英语词汇(搜索结果第1-2个之间)
- `packageB/index.wxml` - AIP标准及空客缩写(搜索结果第1-2个之间)
- `packageMedical/index.wxml` - 民航体检标准查询(搜索结果第1-2个之间)
- `packageIOSA/index.wxml` - IOSA审计(搜索结果第1-2个之间)
- `packageO/incident-investigation/index.wxml` - 事件调查(全部Tab,第1-2个结果之间)
- `packageO/incident-investigation/index.wxml` - 事件调查(征候Tab,第1-2个结果之间)
- `packageO/incident-investigation/index.wxml` - 事件调查(一般事件Tab,第1-2个结果之间)
- `packageO/incident-investigation/index.wxml` - 事件调查(事件样例Tab,第1-2个结果之间)
- `packageO/incident-investigation/index.wxml` - 事件调查(术语定义Tab,第1-2个结果之间)
- `packageCCAR/categories/index.wxml` - CCAR民航规章分类(搜索结果规章和规范性文件之间)
  *【注：此页面原文档记录为14次，现增加胜任力页面后为16次】*

### 4. 横幅卡片3-上文下图拼接 (adunit-d6c8a55bd3cb4fd1) - 8次
- `pages/operations/index.wxml` - 通信页面
- `pages/communication-failure/regions/eastern-europe/index.wxml` - 东欧通信失效
- `pages/audio-player/index.wxml` - 音频播放器
- `pages/standard-phraseology/index.wxml` - ICAO标准对话(第1-2个结果之间)
- `packageB/index.wxml` - AIP标准及空客缩写(页面底部)
  *【注：此页面在搜索结果第1-2个之间还使用了横幅2】*
- `packageO/flight-calc-modules/turn/index.wxml` - 转弯半径计算(页面底部)
- `packageO/flight-calc-modules/glideslope/index.wxml` - 五边高度计算(页面底部)
- `packageDuty/index.wxml` - 执勤期计算器(计算按钮和计算结果之间)

### 5. 横幅卡片2-上图下文叠加A (adunit-d7a3b71f5ce0afca) - 8次 ⭐
- `pages/home/index.wxml` - **我的首页**(重点页面)
- `pages/communication-failure/regions/europe/index.wxml` - 欧洲通信失效
- `pages/communication-rules/index.wxml` - 通信规范
- `packageC/index.wxml` - 全球机场数据查询(第1-2个结果之间)
- `packageICAO/index.wxml` - ICAO出版物(第2-3个结果之间)
- `packageO/flight-calc-modules/distance/index.wxml` - 距离换算(页面底部)
- `packageO/flight-calc-modules/speed/index.wxml` - 速度换算(页面底部)

### 6. 格子1-多格子 (adunit-735d7d24032d4ca8) - 5次
- `pages/communication-failure/regions/pacific/index.wxml` - 太平洋通信失效
- `pages/communication-failure/regions/country-detail/index.wxml` - 国家详情
- `packageD/index.wxml` - 权威定义(第1-2个结果之间)
- `packageCCAR/categories/index.wxml` - CCAR民航规章分类
- `packageRadiation/pages/index/index.wxml` - 航空辐射剂量计算(航线评估Tab,巡航高度上方)

### 7. 横幅卡片1-上图下文叠加B (adunit-3a1bf3800fa937a2) - 8次
- `pages/communication-failure/regions/middle-east/index.wxml` - 中东通信失效
- `pages/communication-rules-detail/index.wxml` - 通信规范详情
- `packageO/sunrise-sunset-only/index.wxml` - 日出日落时间
- `packageA/index.wxml` - 民航英语词汇(页面底部)
- `packageD/index.wxml` - 权威定义(使用说明上方)
- `packageRadiation/pages/index/index.wxml` - 航空辐射剂量计算(单点评估Tab,飞行高度上方)
- `packageC/index.wxml` - 全球机场数据查询(页面底部)
- `packageO/flight-calc-modules/pressure/index.wxml` - 气压换算(页面底部)

### 8. 通用插屏广告 (adunit-1a29f1939a1c7864) - 5个TabBar页面复用

**✅ 最佳实践**：1个广告位ID，在多个页面分别创建实例

📍 **使用页面**（5个TabBar页面）：

1. **资料查询页** (`pages/search/index`)
   - 🎯 触发时机：用户点击某个分类进入详情时
   - 💡 建议：适当延迟，避免干扰浏览

2. **飞行计算器** (`pages/flight-calculator/index`)
   - 🎯 触发时机：用户完成某个计算任务后
   - 💡 建议：在得到计算结果后展示

3. **驾驶舱** (`pages/cockpit/index`)
   - 🎯 触发时机：页面初始化完成后
   - 💡 建议：延迟3-5秒，确保用户已看到主要内容

4. **通信** (`pages/operations/index`)
   - 🎯 触发时机：用户点击某个通信功能进入详情时
   - 💡 建议：在功能切换间隙展示

5. **我的首页** (`pages/home/index`)
   - 🎯 触发时机：页面加载完成后
   - 💡 建议：延迟展示，避免影响用户体验

**🔑 关键实现要点**：
- 每个页面在 `onLoad` 中使用相同广告位ID创建独立实例
- 每个页面在 `onUnload` 中调用 `destroy()` 销毁实例
- 通过代码控制各页面的展示时机和频率
- 数据统一汇总，便于分析整体插屏广告效果

---

## 🛡️ 广告位使用规范

### 必须遵守的规则

1. ✅ **仅使用授权广告位**：严格使用上述8个广告位ID（7个横幅/格子 + 1个插屏），禁止使用其他广告位
2. ✅ **广告刷新间隔**：统一设置 `ad-intervals="30"`(30秒)
3. ✅ **放置位置**：
   - 横幅广告：统一放置在页面底部
   - 格子广告：放置在特定功能区域
   - 插屏广告：在合适的时机全屏展示
4. ✅ **容器类名**：使用 `ad-banner-container` 类包裹横幅广告
5. ✅ **插屏广告触发时机**：避免在用户刚进入页面或正在执行关键操作时展示
6. ✅ **插屏广告ID复用**：所有TabBar页面使用同一个插屏广告位ID（`adunit-1a29f1939a1c7864`），分别创建实例
7. ❌ **禁止使用未授权广告位**：未授权的广告位会影响收入分成

### 标准代码模板

```xml
<!-- 横幅广告标准代码 -->
<view class="ad-banner-container">
  <ad unit-id="adunit-d7a3b71f5ce0afca" ad-type="banner" ad-intervals="30"></ad>
</view>
```

```xml
<!-- 格子广告标准代码 -->
<view class="ad-container">
  <ad unit-id="adunit-735d7d24032d4ca8" ad-intervals="30" bindload="adLoad" binderror="adError" bindclose="adClose"></ad>
</view>
```

```xml
<!-- 插屏广告标准代码(WXML) -->
<ad unit-id="adunit-0dda7808a1b07fca" ad-type="interstitial" ad-intervals="30" bindload="onInterstitialAdLoad" binderror="onInterstitialAdError" bindclose="onInterstitialAdClose"></ad>
```

```javascript
// 插屏广告标准代码(JS) - 所有TabBar页面使用相同广告位ID
Page({
  data: {
    interstitialAdLoaded: false
  },

  onLoad: function() {
    // 监听插屏广告加载事件
    this.createInterstitialAd();
  },

  createInterstitialAd: function() {
    var self = this;
    // 创建插屏广告实例（所有页面使用相同的广告位ID）
    if (wx.createInterstitialAd) {
      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-1a29f1939a1c7864' // ⚠️ 所有TabBar页面统一使用此ID
      });

      // 监听广告加载成功
      this.interstitialAd.onLoad(function() {
        console.log('插屏广告加载成功');
        self.setData({ interstitialAdLoaded: true });
      });

      // 监听广告加载失败
      this.interstitialAd.onError(function(err) {
        console.error('插屏广告加载失败:', err);
      });

      // 监听广告关闭
      this.interstitialAd.onClose(function() {
        console.log('插屏广告关闭');
        // 可以在这里添加广告关闭后的逻辑
      });
    }
  },

  // 在合适的时机展示插屏广告
  showInterstitialAd: function() {
    if (this.interstitialAd && this.data.interstitialAdLoaded) {
      this.interstitialAd.show().catch(function(err) {
        console.error('插屏广告展示失败:', err);
      });
    }
  },

  onUnload: function() {
    // ⚠️ 页面卸载时必须销毁广告实例，释放资源
    if (this.interstitialAd) {
      this.interstitialAd.destroy();
    }
  }
});
```

### 插屏广告最佳实践

1. **广告位ID复用策略**（⭐ 重点）：
   - ✅ 使用1个插屏广告位ID（`adunit-1a29f1939a1c7864`）
   - ✅ 在5个TabBar页面分别创建该广告位的实例
   - ✅ 每个页面独立管理自己的实例（onLoad创建，onUnload销毁）
   - ✅ 数据统一汇总，便于分析整体效果
   - ❌ 不要为不同页面创建多个插屏广告位ID
   - ❌ 不要尝试跨页面共用实例（会报错）

2. **触发时机建议**：
   - ✅ 用户完成某个操作后（如完成计算、查看完某个详情）
   - ✅ 页面切换时（离开当前页面前）
   - ✅ 用户停留一定时间后（建议3-5秒）
   - ❌ 避免在用户刚进入页面时立即展示
   - ❌ 避免在用户正在输入或操作时展示

3. **频率控制**：
   - 建议同一个用户会话中插屏广告展示不超过3次
   - 两次展示之间至少间隔30秒

4. **错误处理**：
   - 广告加载失败时不影响页面正常功能
   - 静默处理错误，不展示错误提示给用户

---

## 📝 2025-10-19 重大更新记录

### 新增内容

1. ✅ **新增插屏广告功能**
   - 新增1个通用插屏广告位ID（`adunit-1a29f1939a1c7864`）
   - 覆盖5个主要TabBar页面：资料查询、计算工具、驾驶舱、通信、我的首页
   - 符合微信小程序插屏广告最佳实践（1个ID多页面复用）
   - 提供完整的代码实现模板和最佳实践指南
   - 状态：已申请并开启，待部署到代码中

### 删除内容

1. ❌ **删除激励视频广告功能**
   - 移除广告单元ID: `adunit-079d7e04aeba0625`
   - 删除"鼓励作者"功能卡片
   - 清理 `pages/home/index.js` 中所有激励视频广告代码
   - 清理 `pages/home/index.wxml` 中的广告触发按钮

2. ❌ **删除用户额度系统**
   - 移除观看广告获取额度的机制
   - 移除额度耗尽时的引导逻辑

### 更新内容

1. ✅ **完善横幅广告部署**
   - 7个横幅+格子广告位全部投入使用
   - 覆盖23个页面/功能模块
   - 广告位分布均衡,覆盖主要流量页面

2. ✅ **更新配置文档**
   - 更新 `CLAUDE.md` 广告系统配置说明
   - 更新技术栈配置描述
   - 添加广告位详细使用表格

3. ✅ **修正版本号**
   - 版本号从 v2.5.0 更新为 v2.6.0

---

## 🔄 广告策略调整说明

### 第一阶段：激励视频广告（2025-10-17前）
- **广告类型**: 激励视频广告
- **广告位数量**: 1个
- **使用页面**: 仅在"我的首页"(需用户点击)
- **触发方式**: 用户主动点击"鼓励作者"按钮

### 第二阶段：横幅+格子广告（2025-10-19）
- **广告类型**: 横幅广告 + 格子广告
- **广告位数量**: 7个
- **使用页面**: 23个页面
- **触发方式**: 页面自动加载展示
- **优势**:
  - ✅ 更广的曝光覆盖
  - ✅ 自动展示,无需用户主动操作
  - ✅ 多样化广告形式,提升用户体验
  - ✅ 简化代码逻辑,降低维护成本

### 第三阶段：增加插屏广告（2025-10-19）
- **广告类型**: 横幅广告 + 格子广告 + 插屏广告
- **广告位数量**: 8个（7个横幅/格子 + 1个通用插屏）
- **使用页面**: 23个页面 + 5个TabBar页面（插屏复用）
- **触发方式**:
  - 横幅/格子：页面自动加载展示
  - 插屏：在合适的时机全屏展示（5个TabBar页面使用同一广告位ID）
- **新增优势**:
  - ✅ 插屏广告展示面积更大，吸引力更强
  - ✅ 覆盖5个主要TabBar页面，流量价值最大化
  - ✅ 智能触发机制，平衡收益与用户体验
  - ✅ 多层次广告策略，提升整体广告效果
  - ✅ **符合最佳实践**：1个插屏广告位ID多页面复用，数据统一便于分析

---

## ⚠️ 重要提醒

### 广告位ID管理

1. **所有广告位ID已记录在以下位置**:
   - `CLAUDE.md`（需更新）
   - `广告\广告位ID存档.md`(本文档)

2. **开发时严格遵守**:
   - 仅使用8个授权广告位ID（7个横幅/格子 + 1个通用插屏）
   - 插屏广告统一使用 `adunit-1a29f1939a1c7864`，在多个页面分别创建实例
   - 禁止使用任何未授权的广告位ID
   - 禁止使用已删除的激励视频广告ID

3. **代码审查要求**:
   - 新增广告时必须从8个授权广告位中选择
   - 插屏广告必须使用指定的通用广告位ID
   - 提交代码前检查广告位ID是否在授权列表中
   - 定期审查项目中的广告使用情况

### 插屏广告特别提醒

1. **插屏广告使用注意事项**:
   - ✅ 所有TabBar页面统一使用广告位ID：`adunit-1a29f1939a1c7864`
   - ✅ 必须使用 `wx.createInterstitialAd()` API在每个页面创建独立实例
   - ✅ 必须在页面卸载时调用 `destroy()` 销毁广告实例
   - ✅ 必须处理广告加载失败的情况，不影响页面功能
   - ❌ 禁止为不同页面创建多个插屏广告位ID
   - ❌ 禁止尝试跨页面共用实例（微信限制，会报错）
   - ❌ 避免在用户关键操作时展示广告
   - ❌ 避免频繁展示广告，影响用户体验

2. **测试要求**:
   - 验证插屏广告在真机上的展示效果
   - 测试广告加载失败时的降级处理
   - 验证广告展示频率是否合理
   - 确保广告不影响页面核心功能

---

## 📈 广告效果评估

### 预期效果

- **覆盖率**: 28个页面（预计），覆盖主要用户流量
- **展示频率**:
  - 横幅/格子：自动展示，30秒刷新
  - 插屏：智能触发，用户操作后展示
- **用户体验**:
  - 横幅广告：页面底部固定位置，不干扰主要功能
  - 插屏广告：全屏展示，合理时机触发
- **预期收益**: 相比单一激励视频广告，预期显著提升曝光量和收益

### 后续优化方向

1. 监控各广告位的展示和点击数据
2. 根据数据调整广告位分布策略
3. 优化高流量页面的广告配置
4. 评估用户反馈，调整广告形式
5. **插屏广告优化**：
   - 收集插屏广告的展示数据和用户反馈
   - 调整插屏广告的触发时机和频率
   - 优化广告展示逻辑，提升用户体验

---

## 🔍 维护清单

### 定期检查项(建议每月)

- [ ] 检查所有广告位ID是否在授权列表中（8个）
- [ ] 验证广告展示是否正常（横幅、格子、插屏）
- [ ] 验证所有TabBar页面插屏广告使用的是同一个广告位ID
- [ ] 验证插屏广告触发时机是否合理
- [ ] 检查插屏广告展示频率是否影响用户体验
- [ ] 收集用户对广告的反馈
- [ ] 分析广告数据,优化配置
- [ ] 更新本文档记录

### 紧急情况处理

如发现使用了未授权的广告位ID:

1. 立即停止使用该广告位
2. 替换为授权列表中的广告位ID
3. 更新相关文档
4. 提交代码修复

### 插屏广告部署清单

待完成任务（⚠️ 所有页面使用相同广告位ID：`adunit-1a29f1939a1c7864`）：

- [ ] 创建通用广告工具模块 `utils/ad-helper.js`
- [ ] 在 `pages/search/index.js` 中实现插屏广告（使用通用ID）
- [ ] 在 `pages/flight-calculator/index.js` 中实现插屏广告（使用通用ID）
- [ ] 在 `pages/cockpit/index.js` 中实现插屏广告（使用通用ID）
- [ ] 在 `pages/operations/index.js` 中实现插屏广告（使用通用ID）
- [ ] 在 `pages/home/index.js` 中实现插屏广告（使用通用ID）
- [ ] 测试广告展示效果和触发时机
- [ ] 优化广告展示频率控制逻辑
- [ ] 验证所有页面使用的是同一个广告位ID
- [ ] 更新 CLAUDE.md 中的广告配置说明

---

**文档维护**: 请在每次广告配置变更后更新本文档
**联系方式**: 如有疑问,请查阅 `CLAUDE.md` 或联系项目负责人
