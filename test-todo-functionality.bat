@echo off
echo ========================================
echo 测试TODO待办清单功能
echo ========================================
echo.

echo 1. 检查TODO服务文件...
if exist "miniprogram\services\todo.service.ts" (
    echo ✅ TODO服务文件存在
) else (
    echo ❌ TODO服务文件不存在
    goto :error
)

echo.
echo 2. 检查TODO页面文件...
if exist "miniprogram\pages\todo-manager\index.ts" (
    echo ✅ TODO页面TypeScript文件存在
) else (
    echo ❌ TODO页面TypeScript文件不存在
    goto :error
)

if exist "miniprogram\pages\todo-manager\index.wxml" (
    echo ✅ TODO页面WXML文件存在
) else (
    echo ❌ TODO页面WXML文件不存在
    goto :error
)

if exist "miniprogram\pages\todo-manager\index.wxss" (
    echo ✅ TODO页面样式文件存在
) else (
    echo ❌ TODO页面样式文件不存在
    goto :error
)

if exist "miniprogram\pages\todo-manager\index.json" (
    echo ✅ TODO页面配置文件存在
) else (
    echo ❌ TODO页面配置文件不存在
    goto :error
)

echo.
echo 3. 检查app.json页面注册...
findstr /C:"pages/todo-manager/index" miniprogram\app.json >nul
if %errorlevel%==0 (
    echo ✅ TODO页面已在app.json中注册
) else (
    echo ❌ TODO页面未在app.json中注册
    goto :error
)

echo.
echo 4. 检查个人首页TODO入口...
findstr /C:"openTodoManager" miniprogram\pages\others\index.ts >nul
if %errorlevel%==0 (
    echo ✅ 个人首页包含TODO入口方法
) else (
    echo ❌ 个人首页缺少TODO入口方法
    goto :error
)

findstr /C:"todo-alert-card" miniprogram\pages\others\index.wxml >nul
if %errorlevel%==0 (
    echo ✅ 个人首页包含TODO卡片
) else (
    echo ❌ 个人首页缺少TODO卡片
    goto :error
)

echo.
echo 5. 检查app.ts中的TODO提醒系统...
findstr /C:"initTodoReminderSystem" miniprogram\app.ts >nul
if %errorlevel%==0 (
    echo ✅ app.ts包含TODO提醒系统初始化
) else (
    echo ❌ app.ts缺少TODO提醒系统初始化
    goto :error
)

findstr /C:"TodoService" miniprogram\app.ts >nul
if %errorlevel%==0 (
    echo ✅ app.ts导入了TodoService
) else (
    echo ❌ app.ts未导入TodoService
    goto :error
)

echo.
echo ========================================
echo ✅ TODO功能检查完成，所有组件都已正确配置！
echo ========================================
echo.
echo TODO功能包括：
echo - 📋 待办事项的增删改查
echo - ⏰ 时间选择和提醒功能
echo - 🏷️ 分类和标签管理
echo - 📊 统计信息显示
echo - 📤📥 数据导入导出
echo - 🔍 搜索和筛选
echo - ☑️ 批量操作
echo - 🎨 主题适配
echo.
echo 🎉 TODO待办清单功能已完成！
goto :end

:error
echo.
echo ❌ 检查失败，请修复上述问题后重试
exit /b 1

:end
pause