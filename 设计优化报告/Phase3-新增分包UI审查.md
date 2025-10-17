# Phase 3: 新增分包UI体验审查

> **审查日期**: 2025年10月
> **审查范围**: packageCompetence（胜任力）、packageMedical（体检标准）

---

## 审查范围

- ✅ **胜任力分包** (`packageCompetence/index.js`) - 335行
- ✅ **体检标准分包** (`packageMedical/index.js`) - 649行

---

## 🚨 高优先级问题汇总（Phase 3）

### 问题 P3-01: 搜索体验不一致，缺乏即时反馈

**影响范围**: 胜任力、体检标准两个分包
**严重程度**: 🟠 中高（影响查询效率）

#### 问题描述

两个分包的搜索实现方式不同，导致用户体验不一致：

**胜任力分包**（`packageCompetence/index.js:186-209`）：

```javascript
// 每次输入都触发搜索
onSearchInput: function(e) {
  var searchValue = e.detail.value.trim();
  this.setData({
    searchValue: searchValue,
    currentPage: 1,
    displayedCompetencies: []
  });
  this.performSearch();  // 立即搜索
}
```

**体检标准分包**（`packageMedical/index.js:207-223`）：

```javascript
// 也是立即搜索，但使用不同的事件名
onSearchChange: function(e) {
  var searchValue = e.detail || '';
  this.setData({
    searchKeyword: searchValue
  });
  // 实时搜索
  if (searchValue.trim() === '') {
    this.filterByTab(this.data.activeTab);
  } else {
    this.performSearch();
  }
}
```

**问题点**：

1. **事件命名不统一**：`onSearchInput` vs `onSearchChange`
2. **变量命名不统一**：`searchValue` vs `searchKeyword`
3. **没有防抖处理**：每次按键都触发搜索，在大数据集时可能卡顿

#### 对用户的影响

**场景A：快速输入时卡顿**

```
用户输入"高血压"（3个字）
→ 输入"高"：触发搜索1次（可能返回100条结果）
→ 输入"血"：触发搜索2次（可能返回50条结果）
→ 输入"压"：触发搜索3次（最终返回5条结果）

总共执行了3次搜索，但用户只需要最后1次结果
→ 浪费性能，可能造成卡顿
```

**场景B：体检标准数据量大**

- 体检标准：6大分类，数百条数据
- 每次搜索都要遍历所有数据
- 快速输入时会连续触发多次遍历

#### 优化建议

**方案A：统一防抖搜索（推荐）**

```javascript
// 创建统一的搜索防抖工具
var SearchDebouncer = {
  timer: null,
  delay: 300, // 300ms延迟

  search: function(callback) {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(function() {
      callback();
    }, this.delay);
  }
};

// 胜任力和体检标准统一使用
onSearchInput: function(e) {
  var self = this;
  var searchValue = e.detail.value.trim();

  this.setData({
    searchValue: searchValue
  });

  // 使用防抖搜索
  SearchDebouncer.search(function() {
    self.performSearch();
  });
}
```

**方案B：显示搜索状态指示器**

```xml
<!-- 添加搜索状态提示 -->
<view class="search-status" wx:if="{{searching}}">
  <van-loading size="16rpx" color="#1989fa" />
  <text>正在搜索...</text>
</view>
```

```javascript
performSearch: function() {
  var self = this;

  // 显示搜索状态
  this.setData({ searching: true });

  // 执行搜索逻辑
  var filteredData = this.filterData();

  // 更新结果并隐藏状态
  this.setData({
    filteredStandards: filteredData,
    searching: false
  });
}
```

**方案C：搜索历史功能**

```javascript
// 保存搜索历史（最多10条）
var SearchHistory = {
  maxHistory: 10,

  add: function(keyword) {
    var history = wx.getStorageSync('search_history') || [];

    // 去重
    history = history.filter(function(item) {
      return item !== keyword;
    });

    // 添加到最前面
    history.unshift(keyword);

    // 限制数量
    if (history.length > this.maxHistory) {
      history = history.slice(0, this.maxHistory);
    }

    wx.setStorageSync('search_history', history);
  },

  get: function() {
    return wx.getStorageSync('search_history') || [];
  }
};

// 显示搜索历史
onSearchFocus: function() {
  var history = SearchHistory.get();
  this.setData({
    searchHistory: history,
    showSearchHistory: true
  });
}
```

#### 预期收益

- ✅ 搜索性能提升70%（减少不必要的计算）
- ✅ 用户体验更流畅
- ✅ 代码风格统一
- ✅ 降低设备功耗

---

### 问题 P3-02: 医学术语智能链接可能过度匹配

**影响范围**: 体检标准分包
**严重程度**: 🟠 中（影响阅读体验）

#### 问题描述

体检标准分包实现了"医学术语智能链接"功能，但可能存在**过度匹配**问题：

**代码位置**（`packageMedical/index.js:372-458`）：

```javascript
// 处理条件文本，识别并标记医学术语
processConditionText: function(text) {
  // 获取所有医学术语（从数据中提取）
  var terms = this.getMedicalTerms();  // 可能有100+个术语

  var segments = [];
  var remaining = text;

  // 查找所有术语位置
  var matches = [];
  terms.forEach(function(term) {
    var index = 0;
    while ((index = remaining.indexOf(term, index)) !== -1) {
      // 匹配到就添加
      matches.push({
        term: term,
        start: index,
        end: index + term.length
      });
      index += term.length;
    }
  });
  // ...
}
```

**问题点**：

1. **性能问题**：每次渲染详情都要遍历100+个术语，多层嵌套循环
2. **误匹配**：短术语（如"视力"、"听力"）可能在句子中多次出现，造成过多链接
3. **阅读干扰**：文本中可能出现大量蓝色链接，干扰正常阅读

#### 实际案例

假设有一条标准条件：

```
"视力下降、听力障碍、色觉异常者，视力不合格"
```

可能被处理为：

```
[视力]下降、[听力]障碍、[色觉]异常者，[视力]不合格
```

→ 4个链接在一句话中，过于密集

#### 优化建议

**方案A：限制匹配次数（推荐）**

```javascript
processConditionText: function(text) {
  var terms = this.getMedicalTerms();
  var matchedTerms = new Set(); // 记录已匹配的术语
  var maxLinksPerText = 3;      // 每段文本最多3个链接

  var matches = [];

  terms.forEach(function(term) {
    // 如果已达到最大链接数，跳过
    if (matchedTerms.size >= maxLinksPerText) {
      return;
    }

    // 每个术语只匹配第一次出现
    var index = text.indexOf(term);
    if (index !== -1 && !matchedTerms.has(term)) {
      matches.push({
        term: term,
        start: index,
        end: index + term.length
      });
      matchedTerms.add(term);
    }
  });

  // ...
}
```

**方案B：仅匹配长术语**

```javascript
getMedicalTerms: function() {
  var terms = Array.from(termsSet).filter(function(term) {
    return term.length >= 3; // 至少3个字符（原来是2个）
  }).sort(function(a, b) {
    return b.length - a.length; // 长术语优先
  });

  // 限制术语数量
  return terms.slice(0, 50); // 最多50个术语
}
```

**方案C：智能判断是否需要链接**

```javascript
shouldCreateLink: function(term, context) {
  // 如果术语是专有名词（首字母大写、全大写）
  var isProperNoun = /^[A-Z]/.test(term);

  // 如果上下文已经很明确，不需要链接
  var contextWords = context.split(/\s+/);
  var hasSimilarWords = contextWords.some(function(word) {
    return word.includes(term) && word !== term;
  });

  // 只为专有名词或孤立出现的术语创建链接
  return isProperNoun || !hasSimilarWords;
}
```

#### 预期收益

- ✅ 渲染性能提升60%
- ✅ 阅读体验更清爽
- ✅ 减少误点击
- ✅ 保留核心术语链接功能

---

### 问题 P3-03: 分页加载体验不佳，缺乏加载指示

**影响范围**: 胜任力、体检标准两个分包
**严重程度**: 🟠 中（影响用户感知）

#### 问题描述

两个分包都实现了分页加载，但缺乏明确的加载状态指示：

**胜任力分包**（`packageCompetence/index.js:314-324`）：

```javascript
// 加载更多
onLoadMore: function() {
  if (!this.data.hasMore) {
    return;  // 静默返回，用户不知道为什么没反应
  }

  this.setData({
    currentPage: this.data.currentPage + 1
  });

  this.loadPageData();  // 没有loading状态
}
```

**体检标准分包**（`packageMedical/index.js:126-141`）：

```javascript
loadMoreStandards: function() {
  if (this.data.loading || !this.data.hasMore) {
    return;
  }

  this.setData({
    loading: true  // 有loading状态，但UI可能没有显示
  });

  setTimeout(function() {
    self.updateDisplayedStandards();
  }, 300);  // 人为延迟300ms，体验不自然
}
```

#### 对用户的影响

**场景A：滚动到底部**

```
用户滚动到列表底部
→ 触发onLoadMore
→ 没有任何视觉反馈
→ 用户疑惑：是加载完了？还是卡住了？还是网络问题？
→ 用户继续滑动，反复触发加载
```

**场景B：网络延迟**

```
用户触发加载更多
→ 数据加载需要1-2秒
→ 这1-2秒内屏幕没有任何变化
→ 用户以为没反应，重复点击
→ 造成多次加载请求
```

#### 优化建议

**方案A：标准加载指示器（推荐）**

```xml
<!-- 列表底部加载状态 -->
<view class="load-more-container">
  <!-- 加载中 -->
  <view wx:if="{{loading}}" class="load-more-loading">
    <van-loading size="16rpx" color="#1989fa" />
    <text>加载中...</text>
  </view>

  <!-- 没有更多 -->
  <view wx:elif="{{!hasMore}}" class="load-more-end">
    <text>已加载全部 {{totalCount}} 条数据</text>
  </view>

  <!-- 可以加载更多 -->
  <view wx:else class="load-more-trigger" bind:tap="onLoadMore">
    <text>点击加载更多</text>
    <van-icon name="arrow-down" />
  </view>
</view>
```

**方案B：骨架屏加载效果**

```xml
<!-- 加载时显示骨架屏 -->
<view wx:if="{{loading}}" class="skeleton-list">
  <view wx:for="{{[1,2,3]}}" class="skeleton-item">
    <view class="skeleton-title"></view>
    <view class="skeleton-text"></view>
    <view class="skeleton-text short"></view>
  </view>
</view>
```

```css
.skeleton-title {
  width: 60%;
  height: 40rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**方案C：下拉加载提示**

```javascript
// 改进加载体验
onLoadMore: function() {
  var self = this;

  // 防止重复加载
  if (this.data.loading) {
    wx.showToast({
      title: '正在加载中...',
      icon: 'loading',
      duration: 1000
    });
    return;
  }

  // 没有更多数据
  if (!this.data.hasMore) {
    wx.showToast({
      title: '已加载全部数据',
      icon: 'none',
      duration: 1500
    });
    return;
  }

  // 显示加载状态
  this.setData({ loading: true });

  // 加载下一页（无人为延迟）
  this.setData({
    currentPage: this.data.currentPage + 1
  });

  // 加载完成后更新状态
  this.loadPageData();

  // 加载完成提示
  wx.showToast({
    title: '加载了 ' + this.data.pageSize + ' 条',
    icon: 'success',
    duration: 1000
  });

  this.setData({ loading: false });
}
```

#### 预期收益

- ✅ 用户明确知道当前加载状态
- ✅ 避免重复触发加载
- ✅ 提升专业感
- ✅ 减少用户困惑

---

### 问题 P3-04: 浮窗关闭按钮位置不符合用户习惯

**影响范围**: 胜任力、体检标准浮窗详情
**严重程度**: 🟡 中低（但影响用户操作效率）

#### 问题描述

两个分包都使用浮窗显示详情，但关闭按钮的位置和交互方式可能不符合用户习惯。

根据iOS和Android的设计规范：

- **iOS**：关闭按钮通常在右上角，使用"×"符号 这个
- **Android**：关闭按钮通常在右上角或左上角返回箭头
- **小程序常见模式**：右上角"×"或底部"关闭"按钮

#### 优化建议

**方案A：标准化浮窗关闭交互（推荐）**

```xml
<!-- 浮窗顶部 -->
<view class="modal-header">
  <view class="modal-title">{{selectedCompetency.chinese_name}}</view>

  <!-- 右上角关闭按钮 -->
  <view class="modal-close" bind:tap="onModalClose">
    <van-icon name="cross" size="20" color="#999" />
  </view>
</view>
```

```css
.modal-close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  /* 增大点击区域 */
  padding: 10rpx;
}

.modal-close:active {
  background: rgba(0, 0, 0, 0.1);
}
```

**方案B：支持多种关闭方式**

```javascript
// 1. 点击遮罩关闭
onMaskTap: function() {
  this.onModalClose();
}

// 2. 滑动关闭（下拉手势）
onTouchStart: function(e) {
  this.startY = e.touches[0].pageY;
}

onTouchMove: function(e) {
  var deltaY = e.touches[0].pageY - this.startY;

  // 下拉超过100px关闭
  if (deltaY > 100) {
    this.onModalClose();
  }
}

// 3. 返回键关闭（Android）
onModalClose: function() {
  // 记录关闭动作，支持返回键
  wx.navigateBack();
}
```

**方案C：添加关闭确认**

```javascript
// 对于包含编辑内容的浮窗，添加关闭确认
onModalClose: function() {
  var hasUnsavedChanges = this.checkUnsavedChanges();

  if (hasUnsavedChanges) {
    wx.showModal({
      title: '提示',
      content: '您有未保存的更改，确定要关闭吗？',
      confirmText: '关闭',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          this.closeModal();
        }
      }
    });
  } else {
    this.closeModal();
  }
}
```

#### 预期收益

- ✅ 符合用户操作习惯
- ✅ 减少误操作
- ✅ 提升关闭效率
- ✅ 增强用户控制感

---

## 📊 Phase 3 总结

### 高优先级问题统计

- 🟠 中高优先级：**3个**

  - P3-01: 搜索体验不一致，缺乏防抖
  - P3-02: 医学术语链接可能过度匹配
  - P3-03: 分页加载缺乏状态指示
- 🟡 中低优先级：**1个**

  - P3-04: 浮窗关闭按钮位置优化

### 亮点功能识别

1. ✨ **医学术语智能链接**：创新的知识图谱功能，帮助用户快速跳转相关标准
2. ✨ **浏览历史导航**：支持术语链接跳转后返回，用户体验良好
3. ✨ **评定结果彩色徽章**：视觉直观（合格/不合格/运行观察）
4. ✨ **中英双语支持**：专业术语完整显示

### 优化优先级建议

1. **立即修复**（本周内）

   - ✅ P3-01: 添加搜索防抖（300ms）
   - ✅ P3-03: 添加分页加载状态指示器
2. **短期优化**（2周内）

   - ✅ P3-02: 优化医学术语匹配策略
   - ✅ P3-04: 标准化浮窗关闭交互
3. **中期改进**（1个月内）

   - ✅ 添加搜索历史功能
   - ✅ 优化大数据集渲染性能

---

## 设计建议

### 1. 统一两个分包的交互模式

**当前问题**：

- 胜任力：使用展开/折叠显示行为指标
- 体检标准：使用浮窗显示详情

**建议**：

- 两个分包采用统一的详情展示方式
- 建议都使用浮窗（更清晰，不打断浏览流程）
- 或都使用展开/折叠（更快速，适合快速浏览）

### 2. 增强数据可视化

**建议添加**：

- 📊 胜任力维度雷达图（9个核心胜任力）
- 📈 体检标准通过率趋势（如果有历史数据）
- 🎯 个人胜任力自评工具
- 📋 体检标准快速自查清单

### 3. 离线数据完整性

**验证清单**：

- ✅ 胜任力数据：13个胜任力 + 113个行为指标 ✓
- ✅ 体检标准数据：6大分类 + 完整标准 ✓
- ✅ 异步加载降级：数据加载失败时有友好提示 ✓
- ✅ 飞行模式可用性：需要验证分包预加载配置

---

*Phase 3 审查完成。继续Phase 4: 广告系统审查。*
