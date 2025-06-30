@echo off
chcp 65001 >nul
echo 🔧 开始自动修复微信小程序WXSS语法问题...

REM 切换到miniprogram目录
cd /d "%~dp0miniprogram"
if not exist "utils\wxss-auto-fix.js" (
    echo ❌ 找不到自动修复工具！
    pause
    exit /b 1
)

echo 🔍 正在扫描并修复所有WXSS文件...
echo ⚠️  注意：原文件将被备份为 .backup 文件
echo.

node utils\wxss-auto-fix.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ WXSS语法问题修复完成！
    echo 💡 提示：原文件已备份，如有问题可以手动恢复
    echo.
    echo 🔍 现在验证修复结果...
    node utils\wxss-validator.js
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ 修复成功！现在可以安全编译了。
    ) else (
        echo.
        echo ⚠️  仍有部分问题需要手动修复
    )
) else (
    echo.
    echo ❌ 自动修复过程中出现错误
)

echo.
echo 按任意键退出...
pause >nul 