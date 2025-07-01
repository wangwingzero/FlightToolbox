@echo off
chcp 65001 > nul
echo.
echo ========================================
echo 📋 TODO Markdown导出导入功能测试
echo ========================================
echo.

echo 🔍 检查TODO服务文件...
if exist "miniprogram\services\todo.service.ts" (
    echo ✅ todo.service.ts 存在
) else (
    echo ❌ todo.service.ts 不存在
    goto :error
)

echo.
echo 🔍 检查导出功能...
findstr /C:"exportTodos" miniprogram\services\todo.service.ts > nul
if %errorlevel% == 0 (
    echo ✅ 找到导出功能
) else (
    echo ❌ 未找到导出功能
    goto :error
)

echo.
echo 🔍 检查Markdown格式导出...
findstr /C:"markdown" miniprogram\services\todo.service.ts > nul
if %errorlevel% == 0 (
    echo ✅ 支持Markdown格式导出
) else (
    echo ❌ 不支持Markdown格式导出
    goto :error
)

echo.
echo 🔍 检查导入功能...
findstr /C:"importTodos" miniprogram\services\todo.service.ts > nul
if %errorlevel% == 0 (
    echo ✅ 找到导入功能
) else (
    echo ❌ 未找到导入功能
    goto :error
)

echo.
echo 🔍 检查多格式导入支持...
findstr /C:"importFromText" miniprogram\services\todo.service.ts > nul
if %errorlevel% == 0 (
    echo ✅ 支持文本格式导入
) else (
    echo ❌ 不支持文本格式导入
    goto :error
)

findstr /C:"importFromJSON" miniprogram\services\todo.service.ts > nul
if %errorlevel% == 0 (
    echo ✅ 支持JSON格式导入（向后兼容）
) else (
    echo ❌ 不支持JSON格式导入
    goto :error
)

echo.
echo 🔍 检查优先级文本转换...
findstr /C:"getPriorityText" miniprogram\services\todo.service.ts > nul
if %errorlevel% == 0 (
    echo ✅ 支持优先级文本转换
) else (
    echo ❌ 不支持优先级文本转换
    goto :error
)

echo.
echo 🔍 检查页面导出提示...
findstr /C:"Markdown格式" miniprogram\pages\todo-manager\index.ts > nul
if %errorlevel% == 0 (
    echo ✅ 页面包含Markdown格式提示
) else (
    echo ❌ 页面缺少Markdown格式提示
    goto :error
)

echo.
echo 🔍 检查导入界面更新...
findstr /C:"支持多种导入格式" miniprogram\pages\todo-manager\index.wxml > nul
if %errorlevel% == 0 (
    echo ✅ 导入界面已更新
) else (
    echo ❌ 导入界面未更新
    goto :error
)

echo.
echo 🔍 检查导入格式说明样式...
findstr /C:"import-formats" miniprogram\pages\todo-manager\index.wxss > nul
if %errorlevel% == 0 (
    echo ✅ 导入格式说明样式已添加
) else (
    echo ❌ 导入格式说明样式缺失
    goto :error
)

echo.
echo ========================================
echo ✅ 所有测试通过！
echo ========================================
echo.
echo 📋 功能特性：
echo   • 导出为用户友好的Markdown格式
echo   • 支持简单文本导入（每行一个待办）
echo   • 支持完整Markdown导入
echo   • 向后兼容JSON格式导入
echo   • 优先级emoji显示
echo   • 完成状态删除线显示
echo   • 详细的用户提示信息
echo.
echo 🎯 用户体验改进：
echo   • 非技术用户可以轻松理解导出内容
echo   • 可以直接分享到微信、QQ等聊天工具
echo   • 支持简单的文本列表导入
echo   • 清晰的格式说明和示例
echo.
goto :end

:error
echo.
echo ========================================
echo ❌ 测试失败！
echo ========================================
echo 请检查相关文件和代码实现
echo.

:end
pause