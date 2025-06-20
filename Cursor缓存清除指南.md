# Cursor 缓存清除指南

## 🚀 快速使用

### 方法一：运行 PowerShell 脚本（推荐）

1. **保存脚本文件**
   ```powershell
   # 将 clear-cursor-cache.ps1 保存到任意目录
   ```

2. **以管理员身份运行 PowerShell**
   - 按 `Win + X`，选择"Windows PowerShell (管理员)"
   - 或右键点击开始菜单，选择"终端 (管理员)"

3. **导航到脚本目录并运行**
   ```powershell
   cd "脚本所在目录"
   .\clear-cursor-cache.ps1
   ```

### 方法二：一键运行（复制粘贴）

如果您想直接运行而不保存文件，可以在 PowerShell 中直接执行：

```powershell
# 停止 Cursor 进程
Get-Process -Name "cursor*" -ErrorAction SilentlyContinue | Stop-Process -Force

# 清除主要缓存目录
$paths = @(
    "$env:APPDATA\Cursor\User\workspaceStorage",
    "$env:APPDATA\Cursor\User\globalStorage", 
    "$env:APPDATA\Cursor\logs",
    "$env:LOCALAPPDATA\Cursor"
)

foreach ($path in $paths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "已清除: $path" -ForegroundColor Green
    }
}

# 清除临时文件
Remove-Item -Path "$env:TEMP\cursor-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\*.tsbuildinfo" -Force -ErrorAction SilentlyContinue

Write-Host "✅ Cursor 缓存清除完成!" -ForegroundColor Green
```

## 📋 脚本参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `-Force` | 跳过所有确认提示，强制执行 | `.\clear-cursor-cache.ps1 -Force` |
| `-BackupSettings` | 清除前备份用户设置到桌面 | `.\clear-cursor-cache.ps1 -BackupSettings` |
| `-KeepExtensions` | 保留扩展缓存，不清除已安装的扩展 | `.\clear-cursor-cache.ps1 -KeepExtensions` |

### 组合使用示例
```powershell
# 强制清除 + 备份设置 + 保留扩展
.\clear-cursor-cache.ps1 -Force -BackupSettings -KeepExtensions
```

## 🗂️ 清除的缓存类型

脚本会清除以下类型的缓存：

### 主要缓存目录
- **用户数据缓存** - `%APPDATA%\Cursor\User\workspaceStorage`
- **工作区缓存** - `%APPDATA%\Cursor\User\globalStorage`
- **扩展缓存** - `%APPDATA%\Cursor\User\extensions`
- **LSP缓存** - `%APPDATA%\Cursor\User\languageServer`
- **日志文件** - `%APPDATA%\Cursor\logs`

### 系统缓存
- **本地存储** - `%LOCALAPPDATA%\Cursor`
- **临时文件** - `%TEMP%\cursor-*`
- **TypeScript缓存** - `%APPDATA%\Cursor\User\typescript`
- **Node模块缓存** - `%APPDATA%\Cursor\User\node_modules`
- **崩溃转储** - `%APPDATA%\Cursor\CrashDumps`

## 🔧 手动清除方法

如果您不想使用脚本，也可以手动清除：

### 通过 Cursor 命令面板
1. 打开 Cursor
2. 按 `Ctrl+Shift+P` 打开命令面板
3. 输入并选择以下命令：
   - `Developer: Clear Cache and Reload`
   - `Developer: Reload Window`
   - `TypeScript: Restart TS Server`

### 手动删除文件夹
1. 完全关闭 Cursor
2. 手动删除以下文件夹：
   ```
   %APPDATA%\Cursor\User\workspaceStorage
   %APPDATA%\Cursor\User\globalStorage
   %APPDATA%\Cursor\logs
   %LOCALAPPDATA%\Cursor
   ```

## ⚠️ 注意事项

### 清除前备份重要数据
- **用户设置**: `%APPDATA%\Cursor\User\settings.json`
- **快捷键设置**: `%APPDATA%\Cursor\User\keybindings.json`
- **工作区配置**: 项目中的 `.vscode` 文件夹

### 可能需要重新配置的项目
- 扩展设置和配置
- 工作区特定的设置
- LSP 服务器配置
- 调试配置

## 🚀 性能优化建议

清除缓存后，建议采取以下措施进一步优化性能：

### 扩展管理
- 禁用不必要的扩展
- 定期更新扩展到最新版本
- 避免安装功能重复的扩展

### 工作环境优化
- 关闭不需要的文件和标签页
- 使用工作区功能管理项目
- 定期清理项目中的 `node_modules` 等大文件夹

### 系统优化
- 确保系统有足够的内存和磁盘空间
- 定期重启系统
- 关闭其他占用资源的程序

## 🆘 常见问题

### Q: 清除后扩展不见了怎么办？
A: 使用 `-KeepExtensions` 参数，或者重新安装需要的扩展。

### Q: 清除后设置丢失了怎么办？
A: 使用 `-BackupSettings` 参数进行备份，然后从备份中恢复。

### Q: 脚本执行失败怎么办？
A: 确保以管理员权限运行 PowerShell，并完全关闭 Cursor。

### Q: 清除后还是很卡怎么办？
A: 可能是系统或硬件问题，检查系统资源使用情况。

## 📝 定期维护建议

- **每周清除一次**：适用于重度使用者
- **每月清除一次**：适用于一般使用者
- **出现卡顿时**：立即清除缓存
- **版本更新后**：清除缓存以避免兼容性问题

---

**💡 提示**: 将此脚本加入到你的开发工具集中，定期运行可以保持 Cursor 的最佳性能状态。 