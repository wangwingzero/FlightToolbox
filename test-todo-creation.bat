@echo off
echo 测试待办清单创建功能...
echo.

echo 1. 检查待办清单页面文件是否存在...
if exist "miniprogram\pages\todo-manager\index.ts" (
    echo ✓ TypeScript文件存在
) else (
    echo ✗ TypeScript文件不存在
    exit /b 1
)

if exist "miniprogram\pages\todo-manager\index.wxml" (
    echo ✓ WXML文件存在
) else (
    echo ✗ WXML文件不存在
    exit /b 1
)

if exist "miniprogram\pages\todo-manager\index.wxss" (
    echo ✓ WXSS文件存在
) else (
    echo ✗ WXSS文件不存在
    exit /b 1
)

if exist "miniprogram\services\todo.service.ts" (
    echo ✓ TodoService服务文件存在
) else (
    echo ✗ TodoService服务文件不存在
    exit /b 1
)

echo.
echo 2. 检查关键功能是否实现...

findstr /c:"showAddTodo" miniprogram\pages\todo-manager\index.ts >nul
if %errorlevel%==0 (
    echo ✓ showAddTodo方法存在
) else (
    echo ✗ showAddTodo方法不存在
)

findstr /c:"saveTodo" miniprogram\pages\todo-manager\index.ts >nul
if %errorlevel%==0 (
    echo ✓ saveTodo方法存在
) else (
    echo ✗ saveTodo方法不存在
)

findstr /c:"addTodo" miniprogram\services\todo.service.ts >nul
if %errorlevel%==0 (
    echo ✓ addTodo服务方法存在
) else (
    echo ✗ addTodo服务方法不存在
)

echo.
echo 3. 检查弹窗UI是否完整...

findstr /c:"showAddModal" miniprogram\pages\todo-manager\index.wxml >nul
if %errorlevel%==0 (
    echo ✓ 添加弹窗控制存在
) else (
    echo ✗ 添加弹窗控制不存在
)

findstr /c:"bind:click=\"saveTodo\"" miniprogram\pages\todo-manager\index.wxml >nul
if %errorlevel%==0 (
    echo ✓ 保存按钮绑定存在
) else (
    echo ✗ 保存按钮绑定不存在
)

findstr /c:"modal-footer" miniprogram\pages\todo-manager\index.wxss >nul
if %errorlevel%==0 (
    echo ✓ 弹窗底部样式存在
) else (
    echo ✗ 弹窗底部样式不存在
)

echo.
echo 4. 检查表单字段是否完整...

findstr /c:"form.title" miniprogram\pages\todo-manager\index.wxml >nul
if %errorlevel%==0 (
    echo ✓ 标题字段存在
) else (
    echo ✗ 标题字段不存在
)

findstr /c:"form.description" miniprogram\pages\todo-manager\index.wxml >nul
if %errorlevel%==0 (
    echo ✓ 描述字段存在
) else (
    echo ✗ 描述字段不存在
)

findstr /c:"form.priority" miniprogram\pages\todo-manager\index.wxml >nul
if %errorlevel%==0 (
    echo ✓ 优先级字段存在
) else (
    echo ✗ 优先级字段不存在
)

echo.
echo 测试完成！
echo.
echo 如果所有检查都通过，但仍然无法保存待办，可能的原因：
echo 1. 微信开发者工具的缓存问题 - 建议清除缓存重新编译
echo 2. 网络存储权限问题 - 检查小程序权限设置
echo 3. 表单验证失败 - 确保填写了必填的标题字段
echo 4. 组件库版本问题 - 检查Vant组件库是否正常加载
echo.
pause