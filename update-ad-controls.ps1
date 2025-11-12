# 批量更新广告控制脚本
# 为所有横幅广告添加 isAdFree 判断

Write-Host "开始批量更新广告控制..." -ForegroundColor Green

# 需要更新的文件列表（排除已更新的 home 和 search）
$files = @(
    "miniprogram\packageDuty\index.wxml",
    "miniprogram\packageO\rodex-decoder\index.wxml",
    "miniprogram\pages\emergency-altitude\index.wxml",
    "miniprogram\packageO\sunrise-sunset\index.wxml",
    "miniprogram\pages\communication-failure\index.wxml",
    "miniprogram\packageO\cpdlc\index.wxml",
    "miniprogram\packageA\index.wxml",
    "miniprogram\packageO\incident-investigation\index.wxml",
    "miniprogram\pages\cockpit\index.wxml",
    "miniprogram\packageO\flight-calc-modules\weight\index.wxml",
    "miniprogram\packageO\personal-checklist\index.wxml",
    "miniprogram\packageO\flight-calc-modules\turn\index.wxml",
    "miniprogram\packageO\flight-calc-modules\temperature\index.wxml",
    "miniprogram\packageO\flight-calc-modules\speed\index.wxml",
    "miniprogram\packageO\flight-calc-modules\isa\index.wxml",
    "miniprogram\packageO\flight-calc-modules\pressure\index.wxml",
    "miniprogram\packageO\twin-engine-goaround\index.wxml",
    "miniprogram\packageO\dangerous-goods\index.wxml",
    "miniprogram\packageCompetence\index.wxml",
    "miniprogram\packageO\flight-calc-modules\gradient\index.wxml",
    "miniprogram\packageO\flight-calc-modules\distance\index.wxml",
    "miniprogram\packageO\flight-calc-modules\glideslope\index.wxml",
    "miniprogram\packageIOSA\index.wxml",
    "miniprogram\packageO\flight-calc-modules\crosswind\index.wxml",
    "miniprogram\packagePerformance\aircraft-parameters\index.wxml",
    "miniprogram\packageO\flight-calc-modules\gpws\index.wxml",
    "miniprogram\packagePerformance\index.wxml",
    "miniprogram\packageMedical\index.wxml",
    "miniprogram\packageO\flight-calc-modules\descent\index.wxml",
    "miniprogram\packageO\flight-calc-modules\detour\index.wxml",
    "miniprogram\packageB\index.wxml",
    "miniprogram\packageCCAR\categories\index.wxml",
    "miniprogram\packageC\index.wxml",
    "miniprogram\packageO\flight-calc-modules\cold-temp\index.wxml",
    "miniprogram\packageO\flight-calc-modules\pitch\index.wxml",
    "miniprogram\packageRadiation\pages\index\index.wxml",
    "miniprogram\packageD\index.wxml",
    "miniprogram\packageICAO\index.wxml",
    "miniprogram\pages\standard-phraseology\index.wxml",
    "miniprogram\packageO\flight-time-share\index.wxml",
    "miniprogram\packageO\qualification-manager\index.wxml",
    "miniprogram\packageO\long-flight-crew-rotation\index.wxml",
    "miniprogram\pages\operations\index.wxml",
    "miniprogram\packageO\event-report\initial-report.wxml",
    "miniprogram\pages\flight-calculator\index.wxml",
    "miniprogram\packageO\sunrise-sunset-only\index.wxml",
    "miniprogram\packageO\flight-calc-modules\acr\index.wxml"
)

$updatedCount = 0
$errorCount = 0

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file

    if (Test-Path $filePath) {
        try {
            # 读取文件内容
            $content = Get-Content $filePath -Raw -Encoding UTF8

            # 检查是否已经有 isAdFree 判断
            if ($content -match 'wx:if="\{\{\s*!isAdFree\s*\}\}".*?ad-banner-container') {
                Write-Host "  ⏭️  跳过 (已更新): $file" -ForegroundColor Yellow
                continue
            }

            # 替换广告容器
            $originalContent = $content

            # 模式1: 带注释的横幅广告
            $content = $content -replace '(<!--\s*横幅广告.*?-->\s*)<view\s+class="ad-banner-container">', '$1<view wx:if="{{ !isAdFree }}" class="ad-banner-container">'

            # 模式2: 不带注释的横幅广告
            $content = $content -replace '<view\s+class="ad-banner-container">(?!\s*<!--)', '<view wx:if="{{ !isAdFree }}" class="ad-banner-container">'

            # 检查是否有修改
            if ($content -ne $originalContent) {
                # 写回文件
                $content | Set-Content $filePath -Encoding UTF8 -NoNewline
                Write-Host "  ✅ 已更新: $file" -ForegroundColor Green
                $updatedCount++
            } else {
                Write-Host "  ⚠️  未找到匹配: $file" -ForegroundColor Cyan
            }
        }
        catch {
            Write-Host "  ❌ 处理失败: $file - $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
    else {
        Write-Host "  ⚠️  文件不存在: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n更新完成！" -ForegroundColor Green
Write-Host "  ✅ 成功更新: $updatedCount 个文件" -ForegroundColor Green
Write-Host "  ❌ 失败: $errorCount 个文件" -ForegroundColor Red
Write-Host "`n提示: 所有使用BasePage的页面已自动拥有 isAdFree 状态" -ForegroundColor Cyan
