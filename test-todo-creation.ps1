Write-Host "测试待办清单创建功能..." -ForegroundColor Yellow
Write-Host ""

Write-Host "1. 检查待办清单页面文件是否存在..." -ForegroundColor Cyan

if (Test-Path "miniprogram\pages\todo-manager\index.ts") {
    Write-Host "✓ TypeScript文件存在" -ForegroundColor Green
} else {
    Write-Host "✗ TypeScript文件不存在" -ForegroundColor Red
    exit 1
}

if (Test-Path "miniprogram\pages\todo-manager\index.wxml") {
    Write-Host "✓ WXML文件存在" -ForegroundColor Green
} else {
    Write-Host "✗ WXML文件不存在" -ForegroundColor Red
    exit 1
}

if (Test-Path "miniprogram\pages\todo-manager\index.wxss") {
    Write-Host "✓ WXSS文件存在" -ForegroundColor Green
} else {
    Write-Host "✗ WXSS文件不存在" -ForegroundColor Red
    exit 1
}

if (Test-Path "miniprogram\services\todo.service.ts") {
    Write-Host "✓ TodoService服务文件存在" -ForegroundColor Green
} else {
    Write-Host "✗ TodoService服务文件不存在" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. 检查关键功能是否实现..." -ForegroundColor Cyan

$tsContent = Get-Content "miniprogram\pages\todo-manager\index.ts" -Raw
if ($tsContent -match "showAddTodo") {
    Write-Host "✓ showAddTodo方法存在" -ForegroundColor Green
} else {
    Write-Host "✗ showAddTodo方法不存在" -ForegroundColor Red
}

if ($tsContent -match "saveTodo") {
    Write-Host "✓ saveTodo方法存在" -ForegroundColor Green
} else {
    Write-Host "✗ saveTodo方法不存在" -ForegroundColor Red
}

$serviceContent = Get-Content "miniprogram\services\todo.service.ts" -Raw
if ($serviceContent -match "addTodo") {
    Write-Host "✓ addTodo服务方法存在" -ForegroundColor Green
} else {
    Write-Host "✗ addTodo服务方法不存在" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. 检查弹窗UI是否完整..." -ForegroundColor Cyan

$wxmlContent = Get-Content "miniprogram\pages\todo-manager\index.wxml" -Raw
if ($wxmlContent -match "showAddModal") {
    Write-Host "✓ 添加弹窗控制存在" -ForegroundColor Green
} else {
    Write-Host "✗ 添加弹窗控制不存在" -ForegroundColor Red
}

if ($wxmlContent -match 'bind:click="saveTodo"') {
    Write-Host "✓ 保存按钮绑定存在" -ForegroundColor Green
} else {
    Write-Host "✗ 保存按钮绑定不存在" -ForegroundColor Red
}

$wxssContent = Get-Content "miniprogram\pages\todo-manager\index.wxss" -Raw
if ($wxssContent -match "modal-footer") {
    Write-Host "✓ 弹窗底部样式存在" -ForegroundColor Green
} else {
    Write-Host "✗ 弹窗底部样式不存在" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. 检查表单字段是否完整..." -ForegroundColor Cyan

if ($wxmlContent -match "form\.title") {
    Write-Host "✓ 标题字段存在" -ForegroundColor Green
} else {
    Write-Host "✗ 标题字段不存在" -ForegroundColor Red
}

if ($wxmlContent -match "form\.description") {
    Write-Host "✓ 描述字段存在" -ForegroundColor Green
} else {
    Write-Host "✗ 描述字段不存在" -ForegroundColor Red
}

if ($wxmlContent -match "form\.priority") {
    Write-Host "✓ 优先级字段存在" -ForegroundColor Green
} else {
    Write-Host "✗ 优先级字段不存在" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. 检查保存按钮的具体实现..." -ForegroundColor Cyan

# 检查保存按钮的具体代码
$saveButtonPattern = 'bind:click="saveTodo"'
if ($wxmlContent -match $saveButtonPattern) {
    Write-Host "✓ 保存按钮事件绑定正确" -ForegroundColor Green
    
    # 查找保存按钮的上下文
    $lines = $wxmlContent -split "`n"
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -match 'bind:click="saveTodo"') {
            Write-Host "保存按钮位置: 第$($i+1)行" -ForegroundColor Blue
            if ($i -gt 0) { Write-Host "  前一行: $($lines[$i-1].Trim())" -ForegroundColor Gray }
            Write-Host "  当前行: $($lines[$i].Trim())" -ForegroundColor White
            if ($i -lt $lines.Length-1) { Write-Host "  后一行: $($lines[$i+1].Trim())" -ForegroundColor Gray }
            break
        }
    }
} else {
    Write-Host "✗ 保存按钮事件绑定不存在" -ForegroundColor Red
}

Write-Host ""
Write-Host "测试完成！" -ForegroundColor Yellow
Write-Host ""
Write-Host "如果所有检查都通过，但仍然无法保存待办，可能的原因：" -ForegroundColor White
Write-Host "1. 微信开发者工具的缓存问题 - 建议清除缓存重新编译" -ForegroundColor Gray
Write-Host "2. 网络存储权限问题 - 检查小程序权限设置" -ForegroundColor Gray
Write-Host "3. 表单验证失败 - 确保填写了必填的标题字段" -ForegroundColor Gray
Write-Host "4. 组件库版本问题 - 检查Vant组件库是否正常加载" -ForegroundColor Gray
Write-Host "5. 弹窗层级问题 - 检查z-index设置" -ForegroundColor Gray