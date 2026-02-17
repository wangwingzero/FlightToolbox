# Kiro Hooks & Steering 配置指南

> 基于实际踩坑经验总结的最佳实践，供其他 AI 学习参考。

## 核心原则：道家"无"思维

**不搜"最佳实践"，搜"常见错误"**

- 知道什么不能做，比知道什么能做更重要
- 避开所有的坑，剩下的就是正确的路
- 失败案例比成功案例更有教育意义

---

## 一、Hooks 避坑指南

### ❌ 绝对不要做

| 反模式 | 后果 |
|--------|------|
| `agentStop` + `askAgent` | **无限循环！** agent 完成 → 触发钩子 → agent 又完成 → 又触发... |
| `**/*` 宽泛触发模式 | 每次保存都触发，烧 credits |
| 运行长时间命令 (npm run dev) | 阻塞 IDE |
| 模糊的 prompt ("fix the code") | AI 乱改代码 |
| 创建钩子后不重启 Kiro | 钩子不生效 |

### ✅ 推荐做法

| 钩子类型 | 推荐用途 | Action 类型 |
|---------|---------|------------|
| `fileEdited` | 自动构建、lint | `runCommand` (不会循环) |
| `fileCreated` | 新文件规范检查 | `askAgent` (只触发一次) |
| `promptSubmit` | 搜索提醒、预检 | `askAgent` |
| `userTriggered` | 代码审查、重构 | `askAgent` (手动触发) |

### 钩子示例

**好的钩子** - 用 `runCommand` 避免循环：
```json
{
  "enabled": true,
  "name": "C++ Build on Save",
  "when": {
    "type": "fileEdited",
    "patterns": ["HuGeScreenshot-cpp/src/**/*.cpp"]
  },
  "then": {
    "type": "runCommand",
    "command": "cd HuGeScreenshot-cpp && powershell -File build.ps1"
  }
}
```

**坏的钩子** - 会无限循环：
```json
{
  "when": { "type": "agentStop" },
  "then": { "type": "askAgent", "prompt": "审查代码..." }
}
```

---

## 二、Steering 避坑指南

### ❌ 绝对不要做

| 反模式 | 后果 |
|--------|------|
| 放 API 密钥/密码 | 泄露到 LLM 和 git |
| 不更新 steering 文件 | AI 用过时的架构生成代码 |
| 全局规则放项目特定内容 | 污染其他项目 |
| 只写规则不写原因 | AI 机械遵守，边缘情况出错 |

### ✅ 推荐做法

1. **条件加载**：用 `fileMatch` 减少 context 消耗
```yaml
---
inclusion: fileMatch
fileMatchPattern: "**/*.cpp"
---
# C++ 规范（只在编辑 C++ 文件时加载）
```

2. **解释原因**：不只写规则，还要写为什么
```markdown
> 为什么需要这个规则：防止 Lambda 连接导致的崩溃
```

3. **定期更新**：steering 不是"设置后就忘"的东西

---

## 三、搜索策略：避坑优先

### 查询格式

**避坑查询** ✅：
```
「{技术} 常见错误和反模式，有哪些坑要避免？」
「{功能} 失败案例，什么情况会出问题？」
「{问题} 不要这样做，有哪些 bad practices？」
```

**普通查询** ❌：
```
「{技术} 最佳实践」
「{功能} 教程」
```

### 示例对比

| 场景 | 避坑查询 ✅ | 普通查询 ❌ |
|------|-----------|-----------|
| Qt 信号槽 | 「Qt connect Lambda 有哪些常见错误会导致崩溃？」 | 「Qt connect 最佳实践」 |
| 异步编程 | 「Python asyncio 常见的坑和反模式有哪些？」 | 「Python asyncio 教程」 |
| 内存管理 | 「C++ Qt 内存泄漏的常见原因？」 | 「C++ 内存管理最佳实践」 |

---

## 四、用户报告的真实故障

1. **Session 累积崩溃**：187 个 session 文件导致加载 20-30 秒，最终 IDE 卡死
2. **配置被忽略**：YAML 语法错误或本地/全局配置冲突
3. **诊断循环**：环境问题时 agent 反复尝试同一个失败的修复
4. **依赖缺失**：钩子依赖的外部工具不在 PATH 里，静默失败

---

## 五、最重要的钩子：搜索避坑

### 🔥 必装钩子：search-pitfalls-first

这是**最重要的钩子**，体现道家"无"思维的核心：

```json
{
  "enabled": true,
  "name": "Search Pitfalls First",
  "description": "道家思维：先知其不可为，方能有所为",
  "version": "1",
  "when": {
    "type": "promptSubmit"
  },
  "then": {
    "type": "askAgent",
    "prompt": "Before starting, search for pitfalls and anti-patterns:\n\nStep 1: Identify if task involves code/design changes\n\nStep 2: Search for what NOT to do (required)\nUse mcp_google_ai_search_google_ai_search with queries like:\n- '{technology} common mistakes and anti-patterns to avoid'\n- '{feature} pitfalls and failure cases'\n- '{problem} what NOT to do, bad practices'\n\nStep 3: Summarize the pitfalls to avoid\n\nExceptions (skip search):\n- Pure information queries\n- Simple file operations\n- User says 'no search' or '直接做'"
  }
}
```

**为什么这个钩子最重要？**

1. **promptSubmit 触发**：每次用户提问都会先搜索，确保不踩已知的坑
2. **避坑优先**：不搜"怎么做"，搜"什么不能做"
3. **道家哲学**：知道什么不能做，剩下的自然是对的
4. **不会循环**：promptSubmit 只在用户发消息时触发一次

**搜索查询模板**：
```
「{技术} 常见错误和反模式，有哪些坑要避免？」
「{功能} 失败案例，什么情况会出问题？」  
「{问题} 不要这样做，有哪些 bad practices？」
```

---

## 六、完整配置参考

### 钩子 (.kiro/hooks/)

```
search-pitfalls-first.kiro.hook # 🔥 最重要！promptSubmit 搜索避坑
cpp-build-on-save.kiro.hook     # fileEdited + runCommand (自动构建)
cpp-lambda-check.kiro.hook      # fileEdited + askAgent (检查 Lambda)
cpp-code-quality.kiro.hook      # fileCreated + askAgent (新文件规范)
```

## 七、Steering 配置

```
google-ai-search.md   # 避坑优先搜索规范
code-review.md        # 代码审查规范
file-encoding.md      # UTF-8 编码规范
product.md            # 产品功能
structure.md          # 项目结构
tech.md               # 技术栈
```

---

## 八、哲学总结

> 「为学日益，为道日损。损之又损，以至于无为。」—— 老子

- **不追求完美**：知道什么不能做，剩下的自然是对的
- **避坑优先**：搜索失败案例比搜索最佳实践更有价值
- **简单可控**：用 steering 代替容易出问题的 agentStop 钩子
- **手动触发**：需要审查时用 userTriggered，不要自动循环
