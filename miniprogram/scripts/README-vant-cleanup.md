# Vant Weapp 组件清理说明

## 问题背景

**症状**：微信小程序提交审核时，自动检测到文件/图片/视频选择相关API，要求填写隐私保护说明。

**根本原因**：
- 项目使用了 Vant Weapp UI组件库
- Vant Weapp 包含 `uploader` 组件（用于文件/图片上传）
- 即使项目未使用 `uploader` 组件，微信也会扫描 `miniprogram_npm` 中的所有代码
- 微信检测到以下API调用：
  - `wx.chooseImage` - 选择图片
  - `wx.chooseVideo` - 选择视频
  - `wx.chooseMessageFile` - 选择文件
  - `wx.chooseMedia` - 选择媒体（图片或视频）

## 解决方案

**方法**：删除未使用的 Vant Weapp 组件

**实施步骤**：

### 1. 创建清理脚本

文件：`scripts/remove-unused-vant-components.js`

功能：自动删除 `miniprogram_npm/@vant/weapp/uploader` 目录

### 2. 添加npm命令

在 `package.json` 中添加：
```json
"scripts": {
  "cleanup-vant": "node scripts/remove-unused-vant-components.js"
}
```

### 3. 执行清理

**方式一：手动执行**
```bash
npm run cleanup-vant
```

**方式二：在微信开发者工具构建npm后执行**
```bash
# 微信开发者工具：工具 -> 构建npm
# 构建完成后，运行：
npm run cleanup-vant
```

## 验证

### 1. 检查uploader是否已删除
```bash
ls miniprogram_npm/@vant/weapp/uploader
# 应该显示：No such file or directory
```

### 2. 检查项目代码
```bash
grep -r "chooseImage\|chooseVideo" miniprogram --exclude-dir=miniprogram_npm
# 应该没有任何输出（返回0行）
```

### 3. 重新提交审核
- 微信开发者工具 -> 上传代码
- 应该**不再**提示文件/图片/视频选择API

## 项目使用的Vant组件

以下是项目实际使用的Vant组件（已验证）：

| 组件 | 用途 | 状态 |
|------|------|------|
| van-action-sheet | 操作菜单 | ✅ 保留 |
| van-button | 按钮 | ✅ 保留 |
| van-cell / van-cell-group | 单元格列表 | ✅ 保留 |
| van-checkbox / van-checkbox-group | 复选框 | ✅ 保留 |
| van-col / van-row | 布局 | ✅ 保留 |
| van-collapse / van-collapse-item | 折叠面板 | ✅ 保留 |
| van-empty | 空状态 | ✅ 保留 |
| van-field | 输入框 | ✅ 保留 |
| van-grid / van-grid-item | 宫格 | ✅ 保留 |
| van-icon | 图标 | ✅ 保留 |
| van-loading | 加载中 | ✅ 保留 |
| van-picker | 选择器 | ✅ 保留 |
| van-popup | 弹出层 | ✅ 保留 |
| van-search | 搜索框 | ✅ 保留 |
| van-stepper | 步进器 | ✅ 保留 |
| **van-uploader** | **文件上传** | ❌ **已删除**（未使用） |

## 未来扩展

如果未来需要使用文件/图片上传功能：

### 方式一：不使用Vant Uploader
```javascript
// 自己实现上传功能
wx.chooseImage({
  success: function(res) {
    // 处理图片
  }
});
```

### 方式二：恢复Vant Uploader
1. 删除清理脚本：`scripts/remove-unused-vant-components.js`
2. 移除package.json中的 `cleanup-vant` 命令
3. 重新构建npm：微信开发者工具 -> 工具 -> 构建npm
4. 在 `app.json` 中添加API声明（**注意**：这些API不能放在`requiredPrivateInfos`中）
5. 在微信后台填写隐私保护说明

## 注意事项

⚠️ **重要**：每次执行以下操作后，需要重新运行清理脚本：
- `npm install` - 重新安装依赖
- 微信开发者工具：工具 -> 构建npm
- 删除 `miniprogram_npm` 目录后重建

**建议**：在提交代码前执行一次 `npm run cleanup-vant`，确保uploader组件已删除。

## 相关文件

- `scripts/remove-unused-vant-components.js` - 清理脚本
- `package.json` - npm命令配置
- `app.json` - 小程序配置（不需要声明文件/图片API）

## 技术支持

如有问题，请参考：
- Vant Weapp文档：https://vant-contrib.gitee.io/vant-weapp/
- 微信小程序隐私保护指引：https://developers.weixin.qq.com/miniprogram/dev/framework/user-privacy/

---

**最后更新**：2025-01-12
**维护者**：FlightToolbox Team
