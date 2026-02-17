---
inclusion: always
---

# 项目避坑指南

> 基于实际踩坑经验总结，避免重复犯错。

## 一、Kiro Hooks 避坑

### ❌ 绝对不要做

| 反模式 | 后果 |
|--------|------|
| `agentStop` + `askAgent` | **无限循环！** agent 完成 → 触发钩子 → agent 又完成 → 又触发... |
| `**/*` 宽泛触发模式 | 每次保存都触发，烧 credits |
| 运行长时间命令 | 阻塞 IDE |
| 模糊的 prompt | AI 乱改代码 |

### ✅ 推荐做法

| 钩子类型 | 推荐用途 | Action 类型 |
|---------|---------|------------|
| `fileEdited` | 自动构建、lint | `runCommand` (不会循环) |
| `fileCreated` | 新文件规范检查 | `askAgent` (只触发一次) |
| `promptSubmit` | 搜索提醒、预检 | `askAgent` |
| `userTriggered` | 代码审查、重构 | `askAgent` (手动触发) |

## 二、微信小程序避坑

### ES5 兼容性

**禁止使用**：
- `let` / `const` → 使用 `var`
- 箭头函数 `() => {}` → 使用 `function() {}`
- 模板字符串 `` `${x}` `` → 使用 `'str' + x`
- 解构赋值 `{a, b} = obj` → 使用 `var a = obj.a`
- `async/await` → 使用 `Promise.then()`

### 页面规范

**必须遵守**：
```javascript
// 必须继承 BasePage
var BasePage = require('../../utils/base-page.js');

// 使用 BasePage.createPage 而非 Page
BasePage.createPage({
  // ...
});
```

### 内存管理

**onUnload 必须清理**：
```javascript
onUnload: function() {
  // 清理定时器
  if (this.timer) {
    clearInterval(this.timer);
    this.timer = null;
  }
  
  // 清理音频实例
  if (this.audioContext) {
    this.audioContext.destroy();
    this.audioContext = null;
  }
  
  // 清理事件监听
  // ...
}
```

### 音频播放

**iOS 常见问题**：
- 自动播放被阻止 → 需要用户交互触发
- 后台播放中断 → 需要配置 `requiredBackgroundModes`
- 多个 InnerAudioContext 冲突 → 使用单例模式

**必须做**：
- 在 onUnload 中 `destroy()` 音频实例
- 处理 `onError` 回调
- iOS 和 Android 分别测试

### 离线优先

**必须考虑**：
- 网络请求失败时的降级方案
- 使用 `wx.getStorageSync` 缓存关键数据
- 不要假设网络总是可用

### 分包管理

**大小限制**：
- 单个分包 ≤ 2MB
- 主包 ≤ 2MB
- 总包 ≤ 20MB

**常见错误**：
- 新增音频文件后分包超限
- 忘记在 app.json 中注册新分包
- preloadRule 配置不合理

### setData 性能

**避免**：
- 一次性传递大量数据
- 频繁调用 setData
- 传递未使用的数据

**推荐**：
```javascript
// 只更新需要的字段
this.setData({
  'list[0].name': newName  // 路径更新
});
```

## 三、常见故障排查

| 问题 | 常见原因 |
|------|---------|
| 页面白屏 | JSON 配置错误、组件路径错误 |
| 音频不播放 | iOS 自动播放限制、实例未初始化 |
| 数据丢失 | Storage 被清理、key 冲突 |
| 内存泄漏 | onUnload 未清理资源 |
| 分包加载失败 | 路径错误、大小超限 |

## 四、代码审查检查清单

### P0 必须修复
- [ ] 安全问题：硬编码密钥、未验证输入
- [ ] 崩溃风险：空指针、未捕获异常、资源泄漏
- [ ] 逻辑错误：边界条件、off-by-one

### P1 应该修复
- [ ] 性能问题：不必要的循环、内存泄漏
- [ ] 复杂度：函数超过100行、嵌套超过4层
- [ ] 重复代码：可提取的公共逻辑

### P2 建议修复
- [ ] 命名规范
- [ ] 注释完善
- [ ] 代码风格一致性
