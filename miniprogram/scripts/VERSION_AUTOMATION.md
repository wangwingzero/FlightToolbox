# 版本号自动化系统

## 📦 功能概述

FlightToolbox小程序实现了版本号自动化管理系统，避免在多个文件中手动维护版本号。

## 🏗️ 系统架构

```
package.json (版本号来源)
    ↓
scripts/generate-version.js (生成脚本)
    ↓
utils/version.js (自动生成的版本文件)
    ↓
app.ts (应用入口使用版本号)
```

## 🚀 使用方法

### 方法1：手动更新版本号

1. **修改版本号**
   ```bash
   # 编辑 miniprogram/package.json
   # 将 "version": "1.0.0" 改为 "version": "1.0.1"
   ```

2. **生成版本文件**
   ```bash
   cd miniprogram
   npm run generate-version
   ```

3. **验证更新**
   - 查看 `utils/version.js` 确认版本号已更新
   - 启动小程序，控制台显示新版本号

### 方法2：使用npm version命令（推荐）

npm提供了标准的版本管理命令，会自动：
- 更新package.json的版本号
- 创建git commit和tag
- 触发preversion和postversion钩子

```bash
cd miniprogram

# 补丁版本号 (1.0.0 -> 1.0.1)
npm version patch

# 次版本号 (1.0.0 -> 1.1.0)
npm version minor

# 主版本号 (1.0.0 -> 2.0.0)
npm version major

# 自定义版本号
npm version 1.2.3
```

**注意**：npm version命令会自动运行`npm run generate-version`（通过preversion和postversion钩子）

## 📂 文件说明

### 1. package.json
```json
{
  "version": "1.0.0",
  "scripts": {
    "generate-version": "node scripts/generate-version.js",
    "preversion": "npm run generate-version",
    "postversion": "npm run generate-version"
  }
}
```

**作用**：
- 定义唯一的版本号来源
- 配置npm scripts
- 配置version钩子

### 2. scripts/generate-version.js
**作用**：
- 读取package.json的version字段
- 生成当前构建日期
- 自动生成utils/version.js文件

### 3. utils/version.js（自动生成，请勿手动修改）
```javascript
module.exports = {
  version: '1.0.0',
  buildDate: '2025-10-19',
  getVersionInfo: function() {
    return {
      version: this.version,
      buildDate: this.buildDate,
      fullVersion: this.version + ' (' + this.buildDate + ')'
    };
  }
};
```

**作用**：
- 导出版本号和构建日期
- 提供版本信息获取方法

### 4. app.ts
```typescript
const versionInfo = require('./utils/version.js')
const APP_VERSION = versionInfo.version
const BUILD_DATE = versionInfo.buildDate

App({
  globalData: {
    version: APP_VERSION,
    buildDate: BUILD_DATE
  },
  onLaunch() {
    console.log('🚀 FlightToolbox v' + APP_VERSION + ' 启动')
    console.log('📅 构建日期: ' + BUILD_DATE)
  }
})
```

**作用**：
- 从version.js导入版本号
- 在应用启动时显示版本信息

## ⚠️ 重要约束

1. **唯一版本号来源**
   - ✅ **只在`package.json`中修改版本号**
   - ❌ 不要手动修改`utils/version.js`
   - ❌ 不要在`app.ts`中硬编码版本号

2. **构建前生成**
   - 在微信开发者工具中构建前，确保运行过`npm run generate-version`
   - 使用`npm version`命令会自动执行

3. **版本文件追踪**
   - `utils/version.js`应该提交到git（包含在仓库中）
   - 这样团队成员拉取代码后可以直接看到版本号

## 🔄 工作流示例

### 发布新版本流程

```bash
# 1. 确保在miniprogram目录
cd miniprogram

# 2. 使用npm version更新版本号（自动生成version.js）
npm version patch  # 或 minor / major

# 3. 提交更改（npm version已创建commit和tag）
git push && git push --tags

# 4. 在微信开发者工具中构建和上传
```

### 日常开发流程

```bash
# 开发过程中无需关心版本号
# 只有发布新版本时才使用npm version命令
```

## 📊 版本号规范（语义化版本）

遵循Semantic Versioning 2.0.0规范：

```
主版本号.次版本号.补丁版本号
   ↓        ↓        ↓
  1    .    0    .    0
```

- **主版本号（Major）**：不兼容的API修改
- **次版本号（Minor）**：向下兼容的功能新增
- **补丁版本号（Patch）**：向下兼容的问题修正

### 示例

- `1.0.0 -> 1.0.1`：修复bug
- `1.0.1 -> 1.1.0`：新增辐射计算功能
- `1.1.0 -> 2.0.0`：重大架构变更

## ✅ 优势

1. **单一数据源**：版本号只在package.json中定义
2. **自动化**：无需手动同步多个文件
3. **构建日期**：自动记录每次构建的时间
4. **标准化**：遵循npm标准版本管理流程
5. **可追溯**：git tag自动创建，版本历史清晰

## 🐛 故障排除

### 问题1：version.js版本号未更新

**原因**：未运行generate-version脚本

**解决**：
```bash
cd miniprogram
npm run generate-version
```

### 问题2：app.ts显示旧版本号

**原因**：微信开发者工具缓存

**解决**：
1. 点击"编译" → "清缓存" → "全部清除"
2. 重新编译项目

### 问题3：npm version命令失败

**原因**：可能git工作区不干净

**解决**：
```bash
# 查看git状态
git status

# 提交或暂存修改
git add .
git commit -m "commit message"

# 然后再运行npm version
npm version patch
```

## 📚 相关资源

- [npm version文档](https://docs.npmjs.com/cli/v9/commands/npm-version)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [FlightToolbox项目文档](../../CLAUDE.md)
