# SuperClaude v3 命令完整指南 🚀

SuperClaude 提供了 16 个专门的斜杠命令，用于各种开发任务。每个命令都经过精心设计，能够智能激活相应的专家角色和工具。

## 快速开始 ⚡

**新手推荐命令**（无需阅读文档即可使用）：
```bash
/sc:help                    # 查看可用命令
/sc:analyze src/            # 智能分析代码
/sc:workflow feature-100-prd.md  # 从PRD生成实施工作流
/sc:implement user-auth     # 创建功能和组件（替代v2的/build）
/sc:build                   # 智能项目构建
/sc:improve messy-file.js   # 自动清理代码
/sc:troubleshoot "错误信息"  # 问题诊断和解决
```

---

## 命令分类 📋

### 🛠️ 开发类命令
- **`/sc:implement`** - 功能实现
- **`/sc:build`** - 项目构建
- **`/sc:design`** - 系统设计

### 📊 分析类命令
- **`/sc:analyze`** - 代码分析
- **`/sc:troubleshoot`** - 问题诊断
- **`/sc:explain`** - 代码解释

### ✨ 质量类命令
- **`/sc:improve`** - 代码改进
- **`/sc:test`** - 测试执行
- **`/sc:cleanup`** - 代码清理

### 📝 文档类命令
- **`/sc:document`** - 文档生成
- **`/sc:index`** - 项目索引

### 🔧 工具类命令
- **`/sc:git`** - Git操作
- **`/sc:estimate`** - 工作量估算
- **`/sc:task`** - 任务管理
- **`/sc:load`** - 项目加载
- **`/sc:spawn`** - 任务编排
- **`/sc:workflow`** - 工作流生成

---

## 详细命令说明 📖

### 🚀 /sc:implement - 功能实现
**用途**：实现功能、组件和代码功能，智能激活专家并提供全面的开发支持。

**语法**：
```bash
/sc:implement [功能描述] [--type component|api|service|feature] [--framework react|vue|express|etc] [--safe]
```

**参数**：
- `功能描述` - 要实现的功能或组件描述
- `--type` - 实现类型（组件、API、服务、功能）
- `--framework` - 指定框架
- `--safe` - 安全模式，更保守的实现
- `--with-tests` - 包含测试代码
- `--iterative` - 迭代式实现

**示例**：
```bash
/sc:implement 用户认证系统 --type feature --with-tests
/sc:implement 仪表板组件 --type component --framework react
/sc:implement 用户管理REST API --type api --safe
/sc:implement 支付处理服务 --type service --iterative
```

### 📊 /sc:analyze - 代码分析
**用途**：执行全面的代码分析，涵盖质量、安全、性能和架构领域。

**语法**：
```bash
/sc:analyze [目标] [--focus quality|security|performance|architecture] [--depth quick|deep]
```

**参数**：
- `目标` - 要分析的文件、目录或项目
- `--focus` - 分析重点（质量、安全、性能、架构）
- `--depth` - 分析深度（快速、深度）
- `--format` - 输出格式（文本、JSON、报告）

**示例**：
```bash
/sc:analyze src/ --focus security --depth deep
/sc:analyze components/ --focus performance
/sc:analyze --focus architecture --format report
```

### 🔧 /sc:build - 项目构建
**用途**：构建、编译和打包项目，提供全面的错误处理和优化。

**语法**：
```bash
/sc:build [目标] [--type dev|prod|test] [--clean] [--optimize]
```

**参数**：
- `目标` - 要构建的项目或特定组件
- `--type` - 构建类型（开发、生产、测试）
- `--clean` - 构建前清理构建产物
- `--optimize` - 启用构建优化
- `--verbose` - 启用详细构建输出

**示例**：
```bash
/sc:build --type prod --optimize
/sc:build frontend/ --clean --verbose
/sc:build --type test
```

### 🎨 /sc:design - 系统设计
**用途**：设计系统架构、API、组件接口和技术规范。

**语法**：
```bash
/sc:design [目标] [--type architecture|api|component|database] [--format diagram|spec|code]
```

**参数**：
- `目标` - 要设计的系统、组件或功能
- `--type` - 设计类型（架构、API、组件、数据库）
- `--format` - 输出格式（图表、规范、代码）
- `--iterative` - 启用迭代式设计优化

**示例**：
```bash
/sc:design 用户管理系统 --type architecture --format diagram
/sc:design 支付API --type api --format spec
/sc:design 数据库架构 --type database --iterative
```

### ✨ /sc:improve - 代码改进
**用途**：对代码质量、性能、可维护性和最佳实践进行系统性改进。

**语法**：
```bash
/sc:improve [目标] [--type quality|performance|maintainability|style] [--safe]
```

**参数**：
- `目标` - 要改进的文件、目录或项目
- `--type` - 改进类型（质量、性能、可维护性、风格）
- `--safe` - 仅应用安全、低风险的改进
- `--preview` - 显示改进建议但不应用

**示例**：
```bash
/sc:improve src/ --type quality --safe
/sc:improve components/ --type performance --preview
/sc:improve utils/ --type maintainability
```

### 🧪 /sc:test - 测试执行
**用途**：执行测试、生成全面的测试报告并维护测试覆盖率标准。

**语法**：
```bash
/sc:test [目标] [--type unit|integration|e2e|all] [--coverage] [--watch]
```

**参数**：
- `目标` - 特定测试、文件或整个测试套件
- `--type` - 测试类型（单元、集成、端到端、全部）
- `--coverage` - 生成覆盖率报告
- `--watch` - 监视模式运行测试
- `--fix` - 可能时自动修复失败的测试

**示例**：
```bash
/sc:test --type all --coverage
/sc:test components/ --type unit --watch
/sc:test e2e/ --type e2e --fix
```

### 🔍 /sc:troubleshoot - 问题诊断
**用途**：系统性诊断和解决代码、构建、部署或系统行为中的问题。

**语法**：
```bash
/sc:troubleshoot [问题] [--type bug|build|performance|deployment] [--trace]
```

**参数**：
- `问题` - 问题描述或错误信息
- `--type` - 问题类别（错误、构建、性能、部署）
- `--trace` - 启用详细跟踪和日志记录
- `--fix` - 安全时自动应用修复

**示例**：
```bash
/sc:troubleshoot "构建失败" --type build --trace
/sc:troubleshoot "页面加载缓慢" --type performance
/sc:troubleshoot "部署错误" --type deployment --fix
```

### 📝 /sc:document - 文档生成
**用途**：为特定组件、函数或功能生成精确、专注的文档。

**语法**：
```bash
/sc:document [目标] [--type inline|external|api|guide] [--style brief|detailed]
```

**参数**：
- `目标` - 要文档化的特定文件、函数或组件
- `--type` - 文档类型（内联、外部、API、指南）
- `--style` - 文档风格（简洁、详细）
- `--template` - 使用特定文档模板

**示例**：
```bash
/sc:document utils/auth.js --type api --style detailed
/sc:document components/ --type guide --style brief
/sc:document --type inline src/main.js
```

### 🧹 /sc:cleanup - 代码清理
**用途**：系统性清理代码、删除死代码、优化导入并改进项目结构。

**语法**：
```bash
/sc:cleanup [目标] [--type code|imports|files|all] [--safe|--aggressive]
```

**参数**：
- `目标` - 要清理的文件、目录或整个项目
- `--type` - 清理类型（代码、导入、文件、全部）
- `--safe` - 保守清理（默认）
- `--aggressive` - 更彻底的清理，风险较高
- `--dry-run` - 预览更改但不应用

**示例**：
```bash
/sc:cleanup src/ --type all --safe
/sc:cleanup components/ --type imports --dry-run
/sc:cleanup --type code --aggressive
```

### 💡 /sc:explain - 代码解释
**用途**：提供代码功能、概念或系统行为的清晰、全面解释。

**语法**：
```bash
/sc:explain [目标] [--level basic|intermediate|advanced] [--format text|diagram|examples]
```

**参数**：
- `目标` - 要解释的代码文件、函数、概念或系统
- `--level` - 解释复杂度（基础、中级、高级）
- `--format` - 输出格式（文本、图表、示例）
- `--context` - 解释的附加上下文

**示例**：
```bash
/sc:explain auth.js --level basic --format examples
/sc:explain "React hooks" --level intermediate
/sc:explain database-schema.sql --level advanced --format diagram
```

### 🔄 /sc:git - Git操作
**用途**：执行Git操作，提供智能提交信息、分支管理和工作流优化。

**语法**：
```bash
/sc:git [操作] [参数] [--smart-commit] [--branch-strategy]
```

**参数**：
- `操作` - Git操作（add、commit、push、pull、merge、branch、status）
- `参数` - 操作特定的参数
- `--smart-commit` - 生成智能提交信息
- `--branch-strategy` - 应用分支命名约定
- `--interactive` - 复杂操作的交互模式

**示例**：
```bash
/sc:git commit --smart-commit
/sc:git branch feature/user-auth --branch-strategy
/sc:git merge --interactive
```

### 📊 /sc:estimate - 工作量估算
**用途**：为任务、功能或项目提供开发估算。

**语法**：
```bash
/sc:estimate [任务描述] [--detailed] [--complexity] [--team-size <n>]
```

**参数**：
- `任务描述` - 要估算的任务或功能描述
- `--detailed` - 任务的详细分解
- `--complexity` - 专注于技术复杂性
- `--team-size <n>` - 在估算中考虑团队规模

**示例**：
```bash
/sc:estimate "添加用户认证" --detailed
/sc:estimate "实现支付系统" --complexity --team-size 3
/sc:estimate "迁移到微服务" --detailed --team-size 5
```

### 📋 /sc:task - 任务管理
**用途**：创建、执行和管理项目级任务层次结构，支持智能编排。

**语法**：
```bash
/sc:task [动作] [任务ID] [--wave-mode] [--delegate] [--validate]
```

**动作**：
- `create` - 创建新的项目级任务层次结构
- `execute` - 使用智能编排执行任务
- `status` - 查看跨会话的任务状态
- `analytics` - 任务性能和分析仪表板
- `optimize` - 优化任务执行策略
- `delegate` - 跨多个代理委派任务
- `validate` - 使用证据验证任务完成

**示例**：
```bash
/sc:task create "用户认证系统" --wave-mode
/sc:task execute AUTH-001 --delegate --validate
/sc:task status --all-sessions --detailed-breakdown
/sc:task analytics --project AUTH --optimization-recommendations
```

### 📦 /sc:load - 项目加载
**用途**：加载和分析项目上下文、配置、依赖项和环境设置。

**语法**：
```bash
/sc:load [目标] [--type project|config|deps|env] [--cache]
```

**参数**：
- `目标` - 要加载的项目目录或特定配置
- `--type` - 加载类型（项目、配置、依赖、环境）
- `--cache` - 缓存加载的上下文以便更快的后续访问
- `--refresh` - 强制刷新缓存的上下文

**示例**：
```bash
/sc:load --type project --cache
/sc:load config/ --type config --refresh
/sc:load --type deps --cache
```

### 🎯 /sc:spawn - 任务编排
**用途**：将复杂请求分解为可管理的子任务并协调其执行。

**语法**：
```bash
/sc:spawn [任务] [--sequential|--parallel] [--validate]
```

**参数**：
- `任务` - 要编排的复杂任务或项目
- `--sequential` - 按依赖顺序执行任务（默认）
- `--parallel` - 并发执行独立任务
- `--validate` - 在任务之间启用质量检查点

**示例**：
```bash
/sc:spawn "完整的用户管理系统" --sequential --validate
/sc:spawn "前端组件库" --parallel
/sc:spawn "API重构" --sequential --validate
```

### 📈 /sc:workflow - 工作流生成
**用途**：分析产品需求文档（PRD）和功能规范，生成全面的分步实施工作流。

**语法**：
```bash
/sc:workflow [prd文件|功能描述] [--persona expert] [--c7] [--sequential] [--strategy systematic|agile|mvp] [--output roadmap|tasks|detailed]
```

**参数**：
- `prd文件|功能描述` - PRD文件路径或直接功能描述
- `--persona` - 强制特定专家角色（架构师、前端、后端、安全、运维等）
- `--strategy` - 工作流策略（系统性、敏捷、MVP）
- `--output` - 输出格式（路线图、任务、详细）
- `--estimate` - 包含时间和复杂性估算
- `--dependencies` - 映射外部依赖和集成
- `--risks` - 包含风险评估和缓解策略
- `--parallel` - 识别可并行化的工作流
- `--milestones` - 创建基于里程碑的项目阶段

**示例**：
```bash
/sc:workflow docs/feature-100-prd.md --strategy systematic --c7 --sequential --estimate
/sc:workflow "用户仪表板与实时分析" --persona frontend --output detailed
/sc:workflow 用户认证系统 --strategy mvp --risks --parallel --milestones
/sc:workflow 支付处理API --persona backend --dependencies --c7 --output tasks
```

### 📚 /sc:index - 项目索引
**用途**：创建和维护全面的项目文档、索引和知识库。

**语法**：
```bash
/sc:index [目标] [--type docs|api|structure|readme] [--format md|json|yaml]
```

**参数**：
- `目标` - 要文档化的项目目录或特定组件
- `--type` - 文档类型（文档、API、结构、README）
- `--format` - 输出格式（Markdown、JSON、YAML）
- `--update` - 更新现有文档

**示例**：
```bash
/sc:index src/ --type api --format md
/sc:index --type structure --format json
/sc:index components/ --type docs --update
```

---

## 常用工作流程 🔄

### 新项目入门
```bash
/sc:load --deep --summary
/sc:analyze --focus architecture
/sc:test --coverage
/sc:document README
```

### 错误调查
```bash
/sc:troubleshoot "具体错误信息" --logs
/sc:analyze --focus security
/sc:test --type unit affected-component
```

### 代码质量改进
```bash
/sc:analyze --focus quality
/sc:improve --preview src/
/sc:cleanup --safe
/sc:test --coverage
```

### 部署前检查清单
```bash
/sc:test --type all --coverage
/sc:analyze --focus security
/sc:build --type prod --optimize
/sc:git --smart-commit
```

---

## 智能特性 🧠

### 自动专家激活
SuperClaude会根据任务自动激活相应的专家角色：
- 🏗️ **架构师** - 系统设计和架构
- 🎨 **前端专家** - UI/UX和可访问性
- ⚙️ **后端专家** - API和基础设施
- 🔍 **分析师** - 调试和问题解决
- 🛡️ **安全专家** - 安全问题和漏洞
- ✍️ **文档专家** - 文档和写作

### MCP集成
- **Context7** - 获取官方库文档和模式
- **Sequential** - 帮助复杂的多步骤思考
- **Magic** - 生成现代UI组件
- **Playwright** - 浏览器自动化和测试

### Wave系统
7个命令支持Wave系统：`/analyze`、`/build`、`/design`、`/implement`、`/improve`、`/task`、`/workflow`

---

## 使用技巧 💡

1. **从简单开始** - 使用 `/sc:help` 和 `/sc:analyze README.md` 开始
2. **组合使用** - 命令可以链式使用以获得更好的结果
3. **使用预览** - 许多命令支持 `--preview` 或 `--dry-run` 标志
4. **智能标志** - SuperClaude会自动选择合适的标志和优化
5. **上下文感知** - 命令会根据项目类型和结构自动调整行为

---

*SuperClaude v3 - 让开发工作流程更智能、更高效！* 🚀
