#!/usr/bin/env pwsh
# 微信小程序WXSS语法自动验证脚本
# 使用方法: .\validate-wxss.ps1

Write-Host "🔍 开始验证微信小程序WXSS语法..." -ForegroundColor Green

# 切换到miniprogram目录
$miniprogramPath = Join-Path $PSScriptRoot "miniprogram"
if (-not (Test-Path $miniprogramPath)) {
    Write-Host "❌ 找不到miniprogram目录!" -ForegroundColor Red
    exit 1
}

Set-Location $miniprogramPath

# 检查Node.js是否可用
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 请先安装Node.js!" -ForegroundColor Red
    exit 1
}

# 运行WXSS验证器
Write-Host "🔍 正在扫描所有WXSS文件..." -ForegroundColor Yellow

try {
    $result = node utils/wxss-validator.js
    $exitCode = $LASTEXITCODE
    
    Write-Host $result
    
    if ($exitCode -eq 0) {
        Write-Host "`n✅ WXSS语法验证通过！可以安全编译。" -ForegroundColor Green
    } else {
        Write-Host "`n❌ 发现WXSS语法错误！请修复后再编译。" -ForegroundColor Red
        Write-Host "💡 提示：通配符选择器(*)在微信小程序中不被支持" -ForegroundColor Yellow
    }
    
    exit $exitCode
} catch {
    Write-Host "❌ 验证过程中出现错误: $_" -ForegroundColor Red
    exit 1
} 