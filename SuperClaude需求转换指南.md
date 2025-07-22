# SuperClaude 需求转换指南 🚀

## 概述 📋

本文档说明如何将用户需求转换为SuperClaude指令，并在SuperClaude对话框中直接输入执行，实现智能化的开发工作流程。

**重要提醒**：SuperClaude指令应该在SuperClaude对话框中输入，而不是在系统终端中输入。所有以`/sc:`开头的指令都是SuperClaude专用命令。

## 工作流程 🔄

### 1. 需求分析阶段
- **输入**：用户提供的功能需求、问题描述或开发任务
- **分析**：理解需求的复杂度、涉及的技术领域、预期输出
- **分类**：确定属于哪种类型的开发任务（分析、构建、改进、调试等）

### 2. SuperClaude指令转换
根据需求类型，选择合适的SuperClaude命令：

#### 🛠️ 开发类需求
- **功能实现** → `/sc:implement [功能描述] [--type component|api|service|feature]`
- **项目构建** → `/sc:build [目标] [--type dev|prod|test] [--optimize]`
- **系统设计** → `/sc:design [目标] [--type architecture|api|component]`

#### 📊 分析类需求
- **代码分析** → `/sc:analyze [目标] [--focus quality|security|performance]`
- **问题诊断** → `/sc:troubleshoot [问题描述] [--type bug|build|performance]`
- **代码解释** → `/sc:explain [目标] [--level basic|intermediate|advanced]`

#### ✨ 质量类需求
- **代码改进** → `/sc:improve [目标] [--type quality|performance|maintainability]`
- **代码清理** → `/sc:cleanup [目标] [--type code|imports|files|all]`
- **测试执行** → `/sc:test [目标] [--type unit|integration|e2e|all]`

#### 📝 文档类需求
- **文档生成** → `/sc:document [目标] [--type inline|external|api|guide]`
- **项目索引** → `/sc:index [目标] [--type docs|api|structure]`

#### 🔧 工具类需求
- **工作流生成** → `/sc:workflow [prd文件|功能描述] [--strategy systematic|agile|mvp]`
- **任务管理** → `/sc:task [动作] [任务ID] [--wave-mode] [--delegate]`
- **Git操作** → `/sc:git [操作] [--smart-commit] [--branch-strategy]`

### 3. 指令优化
根据具体情况添加智能标志：
- `--safe` - 安全模式，适用于生产环境
- `--preview` - 预览模式，先查看建议再执行
- `--with-tests` - 包含测试代码
- `--iterative` - 迭代式执行
- `--c7` - 启用Context7获取官方文档
- `--seq` - 启用Sequential进行复杂分析
- `--magic` - 启用Magic生成UI组件

### 4. SuperClaude执行
- 在SuperClaude对话框中直接输入转换后的指令
- 监控执行状态和输出
- 根据需要进行后续指令调整

## 需求转换示例 💡

### 示例1：用户认证系统开发
**用户需求**："我需要实现一个完整的用户认证系统，包括登录、注册、密码重置功能"

**转换后的SuperClaude指令**：
```bash
/sc:implement 用户认证系统 --type feature --with-tests --safe
```

### 示例2：性能问题诊断
**用户需求**："我的应用加载很慢，需要找出性能瓶颈"

**转换后的SuperClaude指令**：
```bash
/sc:troubleshoot "应用加载缓慢" --type performance --trace
/sc:analyze src/ --focus performance --depth deep
```

### 示例3：代码质量改进
**用户需求**："这个项目的代码很乱，需要重构和清理"

**转换后的SuperClaude指令**：
```bash
/sc:analyze src/ --focus quality
/sc:improve src/ --type maintainability --preview
/sc:cleanup src/ --type all --safe
```

### 示例5：深色模式代码清理
**用户需求**："微信小程序的深色模式支持不好，需要移除所有深色模式相关代码"

**转换后的SuperClaude指令**：
```bash
/sc:analyze miniprogram/ --focus "深色模式|dark mode|dark theme" --type code
/sc:cleanup miniprogram/ --type code --focus "深色模式相关代码" --safe
```

### 示例4：从PRD生成实施计划
**用户需求**："根据这个产品需求文档，生成详细的开发计划"

**转换后的SuperClaude指令**：
```bash
/sc:workflow docs/feature-prd.md --strategy systematic --estimate --risks --milestones
```

## 监控和调整 📊

### 执行状态监控
- 观察SuperClaude的执行进度
- 检查是否有错误或警告信息
- 确认输出质量是否符合预期

### 后续调整策略
- 如果结果不理想，可以添加更多标志进行优化
- 可以链式执行多个命令以获得更好的结果
- 根据反馈调整指令参数

## 最佳实践 ⭐

1. **从简单开始**：先使用基础命令，再根据需要添加高级标志
2. **预览优先**：对于重要操作，先使用`--preview`查看建议
3. **安全第一**：生产环境操作使用`--safe`标志
4. **组合使用**：复杂需求可以分解为多个SuperClaude命令
5. **持续监控**：关注执行过程和结果质量

## 注意事项 ⚠️

- SuperClaude会自动激活相应的专家角色，无需手动指定
- 命令会根据项目类型和结构自动调整行为
- 复杂操作可能需要多个命令配合完成
- 确保在SuperClaude对话框中正确输入指令

## 代码修改规则 🔧

### 重要原则
- **所有代码修改都由SuperClaude执行**：用户不直接修改代码，而是通过SuperClaude指令来实现代码变更
- **单一职责**：每个SuperClaude指令专注于一个明确的任务目标
- **指令驱动**：通过精确的SuperClaude命令来描述需要的代码变更

### SuperClaude指令输入规范

#### 输入方式
1. **对话框输入**：在SuperClaude对话框中直接输入完整指令
2. **直接发送**：输入完成后直接发送消息执行
3. **避免分段**：不要将一个指令分多次输入
4. **避免终端命令**：不要在指令前添加`clear`等终端命令

#### 等待机制
- **完全完成原则**：必须等待SuperClaude完全完成当前工作
- **无读秒显示**：确认没有任何倒计时或进度显示后才能输入下一个指令
- **状态确认**：观察终端状态，确保SuperClaude处于空闲状态

#### 示例操作流程
```bash
# 步骤1：在SuperClaude对话框中输入完整指令
/sc:implement 用户认证功能 --type feature --with-tests

# 步骤2：发送消息执行
# 直接发送消息，SuperClaude会自动执行

# 步骤3：等待完成（观察状态）
# 等待SuperClaude完成所有分析和处理过程
# 确认SuperClaude显示完成状态

# 步骤4：输入下一个指令（如需要）
/sc:test src/auth --type unit
```

#### 深色模式清理示例
```bash
# 步骤1：分析深色模式相关代码
/sc:analyze miniprogram/ --focus "深色模式|dark mode|dark theme" --type code

# 步骤2：清理深色模式代码
/sc:cleanup miniprogram/ --type code --focus "深色模式" --safe --preview

# 步骤3：验证清理结果
/sc:analyze miniprogram/ --focus "深色模式残留" --type code
```

#### 错误避免
- ❌ 不要在SuperClaude工作时输入新指令
- ❌ 不要中断正在执行的SuperClaude任务
- ❌ 不要同时运行多个SuperClaude指令
- ❌ 不要在指令前添加`clear`等终端命令
- ❌ 不要在系统终端中输入SuperClaude指令
- ✅ 耐心等待每个指令完全执行完毕
- ✅ 在SuperClaude对话框中直接输入指令
- ✅ 观察SuperClaude状态确认完成后再继续

---

*通过这个指南，您可以高效地将任何开发需求转换为SuperClaude指令，让AI助手更好地理解和执行您的任务！* 🎯