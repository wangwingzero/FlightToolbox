# Cursor 编辑器缓存清除脚本
# 解决 Cursor 卡顿问题的完整清除方案
# 使用方法：在 PowerShell 中运行 ./clear-cursor-cache.ps1

param(
    [switch]$Force,           # 强制清除，不询问确认
    [switch]$BackupSettings,  # 备份用户设置
    [switch]$KeepExtensions   # 保留扩展缓存
)

# 设置控制台编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🚀 Cursor 缓存清除工具" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# 定义缓存路径
$AppDataPath = $env:APPDATA
$LocalAppDataPath = $env:LOCALAPPDATA
$TempPath = $env:TEMP

$CachePaths = @{
    "用户数据缓存" = "$AppDataPath\Cursor\User\workspaceStorage"
    "工作区缓存" = "$AppDataPath\Cursor\User\globalStorage"
    "扩展缓存" = "$AppDataPath\Cursor\User\extensions"
    "LSP缓存" = "$AppDataPath\Cursor\User\languageServer"
    "日志文件" = "$AppDataPath\Cursor\logs"
    "本地存储" = "$LocalAppDataPath\Cursor"
    "临时文件" = "$TempPath\cursor-*"
    "TypeScript缓存" = "$AppDataPath\Cursor\User\typescript"
    "Node模块缓存" = "$AppDataPath\Cursor\User\node_modules"
    "Crashdumps" = "$AppDataPath\Cursor\CrashDumps"
}

function Test-CursorRunning {
    $processes = Get-Process -Name "cursor*" -ErrorAction SilentlyContinue
    return $processes.Count -gt 0
}

function Stop-CursorProcesses {
    Write-Host "🔄 检查 Cursor 进程..." -ForegroundColor Yellow
    
    $processes = Get-Process -Name "cursor*" -ErrorAction SilentlyContinue
    if ($processes.Count -gt 0) {
        Write-Host "⚠️  发现 $($processes.Count) 个 Cursor 进程正在运行" -ForegroundColor Yellow
        
        if (-not $Force) {
            $confirm = Read-Host "是否关闭所有 Cursor 进程? (y/n)"
            if ($confirm -ne 'y' -and $confirm -ne 'Y') {
                Write-Host "❌ 操作已取消" -ForegroundColor Red
                exit 1
            }
        }
        
        Write-Host "🛑 正在关闭 Cursor 进程..." -ForegroundColor Yellow
        $processes | ForEach-Object {
            try {
                $_.CloseMainWindow()
                Start-Sleep -Seconds 2
                if (-not $_.HasExited) {
                    $_ | Stop-Process -Force
                }
                Write-Host "   ✅ 已关闭进程: $($_.Name) (PID: $($_.Id))" -ForegroundColor Green
            }
            catch {
                Write-Host "   ❌ 无法关闭进程: $($_.Name)" -ForegroundColor Red
            }
        }
        Start-Sleep -Seconds 3
    } else {
        Write-Host "✅ 没有运行中的 Cursor 进程" -ForegroundColor Green
    }
}

function Backup-UserSettings {
    if ($BackupSettings) {
        $backupPath = "$env:USERPROFILE\Desktop\cursor-settings-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Write-Host "💾 备份用户设置到: $backupPath" -ForegroundColor Cyan
        
        try {
            New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
            
            $settingsPath = "$AppDataPath\Cursor\User\settings.json"
            $keybindingsPath = "$AppDataPath\Cursor\User\keybindings.json"
            
            if (Test-Path $settingsPath) {
                Copy-Item $settingsPath "$backupPath\settings.json"
                Write-Host "   ✅ 已备份 settings.json" -ForegroundColor Green
            }
            
            if (Test-Path $keybindingsPath) {
                Copy-Item $keybindingsPath "$backupPath\keybindings.json"
                Write-Host "   ✅ 已备份 keybindings.json" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "   ❌ 备份失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

function Clear-CacheDirectory {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        try {
            $items = Get-ChildItem -Path $Path -Recurse -ErrorAction SilentlyContinue
            $size = ($items | Measure-Object -Property Length -Sum).Sum / 1MB
            
            Write-Host "🗑️  清除 $Description..." -ForegroundColor Yellow
            Write-Host "   📁 路径: $Path" -ForegroundColor Gray
            Write-Host "   📊 大小: $([math]::Round($size, 2)) MB" -ForegroundColor Gray
            
            Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "   ✅ 清除完成" -ForegroundColor Green
            
            return $size
        }
        catch {
            Write-Host "   ❌ 清除失败: $($_.Exception.Message)" -ForegroundColor Red
            return 0
        }
    } else {
        Write-Host "📁 $Description 不存在，跳过" -ForegroundColor Gray
        return 0
    }
}

function Clear-TempFiles {
    Write-Host "🗑️  清除临时文件..." -ForegroundColor Yellow
    
    $tempFiles = Get-ChildItem -Path $TempPath -Name "cursor-*" -ErrorAction SilentlyContinue
    $totalSize = 0
    
    foreach ($file in $tempFiles) {
        $fullPath = Join-Path $TempPath $file
        try {
            $size = (Get-ChildItem -Path $fullPath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
            Remove-Item -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue
            $totalSize += $size
            Write-Host "   ✅ 已删除: $file ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ 无法删除: $file" -ForegroundColor Red
        }
    }
    
    return $totalSize
}

function Start-CursorCleanup {
    # 停止 Cursor 进程
    Stop-CursorProcesses
    
    # 备份设置
    Backup-UserSettings
    
    # 清除缓存
    Write-Host "`n🧹 开始清除缓存..." -ForegroundColor Cyan
    $totalCleared = 0
    
    foreach ($cache in $CachePaths.GetEnumerator()) {
        # 如果选择保留扩展，跳过扩展缓存
        if ($KeepExtensions -and $cache.Key -eq "扩展缓存") {
            Write-Host "⏭️  跳过 $($cache.Key)（用户选择保留）" -ForegroundColor Yellow
            continue
        }
        
        $cleared = Clear-CacheDirectory -Path $cache.Value -Description $cache.Key
        $totalCleared += $cleared
    }
    
    # 清除临时文件
    $tempCleared = Clear-TempFiles
    $totalCleared += $tempCleared
    
    # 清除 Windows 临时文件中的 TypeScript 缓存
    Write-Host "🗑️  清除 TypeScript 编译缓存..." -ForegroundColor Yellow
    $tsCachePattern = "$env:TEMP\*.tsbuildinfo"
    $tsFiles = Get-ChildItem -Path $tsCachePattern -ErrorAction SilentlyContinue
    if ($tsFiles) {
        $tsFiles | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ 已清除 $($tsFiles.Count) 个 TypeScript 缓存文件" -ForegroundColor Green
    }
    
    Write-Host "`n📊 清除统计:" -ForegroundColor Cyan
    Write-Host "   💾 总共清除: $([math]::Round($totalCleared, 2)) MB" -ForegroundColor Green
    Write-Host "   📁 清除的缓存类型: $($CachePaths.Count) 种" -ForegroundColor Green
}

function Show-PostCleanupTips {
    Write-Host "`n💡 性能优化建议:" -ForegroundColor Cyan
    Write-Host "   1. 重启 Cursor 编辑器" -ForegroundColor White
    Write-Host "   2. 关闭不必要的扩展" -ForegroundColor White
    Write-Host "   3. 减少同时打开的文件数量" -ForegroundColor White
    Write-Host "   4. 定期运行此脚本清除缓存" -ForegroundColor White
    Write-Host "   5. 检查系统内存和磁盘空间" -ForegroundColor White
    
    Write-Host "`n🔄 手动清除方法:" -ForegroundColor Cyan
    Write-Host "   • Ctrl+Shift+P -> 'Developer: Reload Window'" -ForegroundColor White
    Write-Host "   • Ctrl+Shift+P -> 'Developer: Clear Cache and Reload'" -ForegroundColor White
    Write-Host "   • 文件 -> 首选项 -> 设置 -> 搜索 'cache'" -ForegroundColor White
}

function Start-Cursor {
    $confirm = Read-Host "`n🚀 是否立即启动 Cursor? (y/n)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        Write-Host "🚀 正在启动 Cursor..." -ForegroundColor Green
        try {
            Start-Process "cursor" -ErrorAction SilentlyContinue
            Write-Host "✅ Cursor 已启动" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ 无法自动启动 Cursor，请手动启动" -ForegroundColor Red
        }
    }
}

# 主执行流程
try {
    if (-not $Force) {
        Write-Host "⚠️  此操作将清除 Cursor 的所有缓存数据" -ForegroundColor Yellow
        Write-Host "包括工作区缓存、扩展缓存、日志文件等" -ForegroundColor Yellow
        $confirm = Read-Host "`n是否继续? (y/n)"
        
        if ($confirm -ne 'y' -and $confirm -ne 'Y') {
            Write-Host "❌ 操作已取消" -ForegroundColor Red
            exit 0
        }
    }
    
    # 开始清除
    Start-CursorCleanup
    
    # 显示完成信息
    Write-Host "`n🎉 缓存清除完成!" -ForegroundColor Green
    Write-Host "Cursor 应该会运行得更流畅了" -ForegroundColor Green
    
    # 显示建议
    Show-PostCleanupTips
    
    # 询问是否启动 Cursor
    Start-Cursor
    
} catch {
    Write-Host "`n❌ 清除过程中发生错误:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n请以管理员权限运行此脚本" -ForegroundColor Yellow
}

Write-Host "`n按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 