@echo off
chcp 65001 >nul
echo 🔍 开始验证微信小程序WXSS语法...

REM 切换到miniprogram目录
cd /d "%~dp0miniprogram"
if not exist "utils\wxss-validator.js" (
    echo ❌ 找不到验证器文件！
    pause
    exit /b 1
)

echo 🔍 正在扫描所有WXSS文件...
node utils\wxss-validator.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ WXSS语法验证通过！可以安全编译。
    echo 💡 提示：双击此文件可随时验证WXSS语法
) else (
    echo.
    echo ❌ 发现WXSS语法错误！请修复后再编译。
    echo 💡 提示：通配符选择器(*)在微信小程序中不被支持
)

echo.
echo 按任意键退出...
pause >nul 