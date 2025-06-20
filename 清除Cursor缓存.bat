@echo off
chcp 65001 >nul
title Cursor 缓存清除工具

echo.
echo ═══════════════════════════════════════
echo     🚀 Cursor 缓存清除工具 v1.0
echo ═══════════════════════════════════════
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  需要管理员权限运行此脚本
    echo 请右键点击脚本选择"以管理员身份运行"
    echo.
    pause
    exit /b 1
)

echo ✅ 管理员权限确认
echo.

:: 询问是否继续
echo ⚠️  此操作将清除 Cursor 的所有缓存数据
echo 包括工作区缓存、扩展缓存、日志文件等
echo.
set /p confirm="是否继续清除缓存？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo ❌ 操作已取消
    pause
    exit /b 0
)

echo.
echo 🔄 开始清除 Cursor 缓存...
echo.

:: 停止 Cursor 进程
echo 🛑 正在关闭 Cursor 进程...
taskkill /f /im "Cursor.exe" >nul 2>&1
taskkill /f /im "cursor.exe" >nul 2>&1
taskkill /f /im "Code.exe" >nul 2>&1
timeout /t 2 >nul
echo ✅ Cursor 进程已关闭
echo.

:: 记录清除的文件数量
set /a total_cleared=0

:: 清除用户数据缓存
echo 🗑️  清除用户数据缓存...
if exist "%APPDATA%\Cursor\User\workspaceStorage" (
    rd /s /q "%APPDATA%\Cursor\User\workspaceStorage" >nul 2>&1
    echo    ✅ 用户数据缓存已清除
    set /a total_cleared+=1
) else (
    echo    📁 用户数据缓存不存在，跳过
)

:: 清除工作区缓存
echo 🗑️  清除工作区缓存...
if exist "%APPDATA%\Cursor\User\globalStorage" (
    rd /s /q "%APPDATA%\Cursor\User\globalStorage" >nul 2>&1
    echo    ✅ 工作区缓存已清除
    set /a total_cleared+=1
) else (
    echo    📁 工作区缓存不存在，跳过
)

:: 清除扩展缓存（可选）
echo 🗑️  清除扩展缓存...
if exist "%APPDATA%\Cursor\User\extensions" (
    echo    ⚠️  扩展缓存包含已安装的扩展
    set /p ext_confirm="是否清除扩展缓存？(Y/N): "
    if /i "!ext_confirm!"=="Y" (
        rd /s /q "%APPDATA%\Cursor\User\extensions" >nul 2>&1
        echo    ✅ 扩展缓存已清除
        set /a total_cleared+=1
    ) else (
        echo    ⏭️  跳过扩展缓存
    )
) else (
    echo    📁 扩展缓存不存在，跳过
)

:: 清除日志文件
echo 🗑️  清除日志文件...
if exist "%APPDATA%\Cursor\logs" (
    rd /s /q "%APPDATA%\Cursor\logs" >nul 2>&1
    echo    ✅ 日志文件已清除
    set /a total_cleared+=1
) else (
    echo    📁 日志文件不存在，跳过
)

:: 清除本地存储
echo 🗑️  清除本地存储...
if exist "%LOCALAPPDATA%\Cursor" (
    rd /s /q "%LOCALAPPDATA%\Cursor" >nul 2>&1
    echo    ✅ 本地存储已清除
    set /a total_cleared+=1
) else (
    echo    📁 本地存储不存在，跳过
)

:: 清除LSP缓存
echo 🗑️  清除LSP缓存...
if exist "%APPDATA%\Cursor\User\languageServer" (
    rd /s /q "%APPDATA%\Cursor\User\languageServer" >nul 2>&1
    echo    ✅ LSP缓存已清除
    set /a total_cleared+=1
) else (
    echo    📁 LSP缓存不存在，跳过
)

:: 清除TypeScript缓存
echo 🗑️  清除TypeScript缓存...
if exist "%APPDATA%\Cursor\User\typescript" (
    rd /s /q "%APPDATA%\Cursor\User\typescript" >nul 2>&1
    echo    ✅ TypeScript缓存已清除
    set /a total_cleared+=1
) else (
    echo    📁 TypeScript缓存不存在，跳过
)

:: 清除Node模块缓存
echo 🗑️  清除Node模块缓存...
if exist "%APPDATA%\Cursor\User\node_modules" (
    rd /s /q "%APPDATA%\Cursor\User\node_modules" >nul 2>&1
    echo    ✅ Node模块缓存已清除
    set /a total_cleared+=1
) else (
    echo    📁 Node模块缓存不存在，跳过
)

:: 清除崩溃转储
echo 🗑️  清除崩溃转储...
if exist "%APPDATA%\Cursor\CrashDumps" (
    rd /s /q "%APPDATA%\Cursor\CrashDumps" >nul 2>&1
    echo    ✅ 崩溃转储已清除
    set /a total_cleared+=1
) else (
    echo    📁 崩溃转储不存在，跳过
)

:: 清除临时文件
echo 🗑️  清除临时文件...
for /d %%i in ("%TEMP%\cursor*") do (
    rd /s /q "%%i" >nul 2>&1
    echo    ✅ 已删除临时目录: %%~nxi
    set /a total_cleared+=1
)

:: 清除TypeScript编译缓存
for %%i in ("%TEMP%\*.tsbuildinfo") do (
    del /f /q "%%i" >nul 2>&1
    echo    ✅ 已删除TS缓存: %%~nxi
)

echo.
echo ═══════════════════════════════════════
echo 📊 清除统计:
echo    💾 清除的缓存类型: %total_cleared% 种
echo    🎉 缓存清除完成!
echo ═══════════════════════════════════════
echo.

:: 显示优化建议
echo 💡 性能优化建议:
echo    1. 重启 Cursor 编辑器
echo    2. 关闭不必要的扩展
echo    3. 减少同时打开的文件数量
echo    4. 定期运行此脚本清除缓存
echo    5. 检查系统内存和磁盘空间
echo.

:: 询问是否启动Cursor
set /p start_cursor="🚀 是否立即启动 Cursor？(Y/N): "
if /i "%start_cursor%"=="Y" (
    echo 🚀 正在启动 Cursor...
    start "" "cursor" >nul 2>&1
    if %errorLevel% equ 0 (
        echo ✅ Cursor 已启动
    ) else (
        echo ❌ 无法自动启动 Cursor，请手动启动
    )
) else (
    echo ✅ 请手动启动 Cursor 来体验性能提升
)

echo.
echo Cursor 应该会运行得更流畅了！
echo.
pause 