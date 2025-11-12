# 批量修复TypeScript页面的广告控制
# 为所有TS页面添加isAdFree状态和检查方法

Write-Host "开始修复TypeScript页面的广告控制..." -ForegroundColor Green

# 需要修复的TS页面列表（有广告的页面）
$tsPages = @(
    "packageO/qualification-manager/index.ts",
    "packageO/personal-checklist/index.ts",
    "packageO/flight-time-share/index.ts",
    "packageO/sunrise-sunset/index.ts",
    "packageO/sunrise-sunset-only/index.ts",
    "packageO/twin-engine-goaround/index.ts",
    "packageO/event-report/history.ts",
    "packageO/flight-calc-modules/acr/index.ts",
    "packageO/flight-calc-modules/crosswind/index.ts",
    "packageO/flight-calc-modules/descent/index.ts",
    "packageO/flight-calc-modules/detour/index.ts",
    "packageO/flight-calc-modules/distance/index.ts",
    "packageO/flight-calc-modules/gpws/index.ts",
    "packageO/flight-calc-modules/gradient/index.ts",
    "packageO/flight-calc-modules/pressure/index.ts",
    "packageO/flight-calc-modules/speed/index.ts",
    "packageO/flight-calc-modules/temperature/index.ts",
    "packageO/flight-calc-modules/weight/index.ts",
    "pages/airline-recordings/index.ts",
    "pages/audio-player/index.ts"
)

$updatedCount = 0
$errorCount = 0

foreach ($tsFile in $tsPages) {
    $filePath = Join-Path $PSScriptRoot "miniprogram" $tsFile

    if (Test-Path $filePath) {
        try {
            # 读取文件内容
            $content = Get-Content $filePath -Raw -Encoding UTF8

            # 检查是否已经有 isAdFree 字段
            if ($content -match 'isAdFree\s*:') {
                Write-Host "  ⏭️  跳过 (已有isAdFree): $tsFile" -ForegroundColor Yellow
                continue
            }

            # 检查对应的WXML是否有广告
            $wxmlFile = $tsFile -replace '\.ts$', '.wxml'
            $wxmlPath = Join-Path $PSScriptRoot "miniprogram" $wxmlFile
            if (-not (Test-Path $wxmlPath)) {
                Write-Host "  ⚠️  WXML不存在，跳过: $tsFile" -ForegroundColor Yellow
                continue
            }

            $wxmlContent = Get-Content $wxmlPath -Raw -Encoding UTF8
            if ($wxmlContent -notmatch 'ad-banner-container') {
                Write-Host "  ⏭️  跳过 (无广告): $tsFile" -ForegroundColor Yellow
                continue
            }

            # 查找 data: { 的位置
            if ($content -match '(?m)^(\s*)data:\s*\{') {
                $indent = $matches[1]

                # 在data对象中添加isAdFree字段
                # 查找data对象的第一个字段，在它前面插入isAdFree
                $content = $content -replace '(?m)(data:\s*\{\s*\n)', "`$1$indent  isAdFree: false, // 无广告状态`n`n"

                # 添加onShow方法（如果不存在）
                if ($content -notmatch 'onShow\s*[:（]') {
                    # 查找onLoad或第一个方法的位置
                    if ($content -match '(?m)^(\s*)(onLoad|onReady)') {
                        $methodIndent = $matches[1]
                        $insertPosition = $matches[0]

                        $onShowMethod = @"

$methodIndent// 页面显示时检查无广告状态
$methodIndent  onShow() {
$methodIndent    this.checkAdFreeStatus();
$methodIndent  },

"@
                        $content = $content -replace "(?m)^(\s*)(onLoad|onReady)", "$onShowMethod`$0"
                    }
                }

                # 添加checkAdFreeStatus方法（在文件末尾，Page({...})之前的最后}）
                if ($content -notmatch 'checkAdFreeStatus') {
                    # 查找Page()的最后一个方法
                    $checkMethod = @"

  // 检查无广告状态
  checkAdFreeStatus() {
    const adFreeManager = require('../../utils/ad-free-manager.js');
    try {
      const isAdFree = adFreeManager.isAdFreeToday();
      this.setData({ isAdFree });
      console.log('📅 无广告状态:', isAdFree ? '今日无广告' : '显示广告');
    } catch (error) {
      console.error('❌ 检查无广告状态失败:', error);
    }
  }
"@
                    # 在Page({...})的最后}之前插入
                    $content = $content -replace '(?m)^(\s*)\}\);?\s*$', "$checkMethod`n`$0"
                }

                # 写回文件
                $content | Set-Content $filePath -Encoding UTF8 -NoNewline
                Write-Host "  ✅ 已更新: $tsFile" -ForegroundColor Green
                $updatedCount++
            } else {
                Write-Host "  ⚠️  未找到data对象: $tsFile" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "  ❌ 处理失败: $tsFile - $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
    else {
        Write-Host "  ⚠️  文件不存在: $tsFile" -ForegroundColor Yellow
    }
}

Write-Host "`n更新完成！" -ForegroundColor Green
Write-Host "  ✅ 成功更新: $updatedCount 个文件" -ForegroundColor Green
Write-Host "  ❌ 失败: $errorCount 个文件" -ForegroundColor Red
Write-Host "`n提示: 所有TypeScript页面现在已支持isAdFree状态" -ForegroundColor Cyan
