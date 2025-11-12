# 绕机检查图片分包重组脚本
# 从3个分包重组为6个分包（每个分包约750KB）

$baseDir = "D:\FlightToolbox\miniprogram"
Set-Location $baseDir

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "绕机检查图片分包重组工具" -ForegroundColor Cyan
Write-Host "3个分包 → 6个分包（每个约750KB）" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 定义新的6个分包结构
$newPackages = @(
    @{ Name = "packageWalkaroundImages1"; Areas = 1..4;   Folder = "images1" }
    @{ Name = "packageWalkaroundImages2"; Areas = 5..8;   Folder = "images2" }
    @{ Name = "packageWalkaroundImages3"; Areas = 9..12;  Folder = "images3" }
    @{ Name = "packageWalkaroundImages4"; Areas = 13..16; Folder = "images4" }
    @{ Name = "packageWalkaroundImages5"; Areas = 17..20; Folder = "images5" }
    @{ Name = "packageWalkaroundImages6"; Areas = 21..24; Folder = "images6" }
)

# 定义旧分包的映射
$oldPackages = @{
    "1-8"   = @{ Root = "packageWalkaroundImages1"; SubDir = "component1" }
    "9-16"  = @{ Root = "packageWalkaroundImages2"; SubDir = "component2" }
    "17-24" = @{ Root = "packageWalkaroundImages3"; SubDir = "component3" }
}

# 1. 创建新的分包目录结构
Write-Host "[步骤1/5] 创建新分包目录结构..." -ForegroundColor Yellow
foreach ($pkg in $newPackages) {
    $pkgPath = Join-Path $baseDir $pkg.Name
    $imagesPath = Join-Path $pkgPath $pkg.Folder
    $placeholderPath = Join-Path $pkgPath "pages\placeholder"

    # 创建目录
    New-Item -ItemType Directory -Path $imagesPath -Force | Out-Null
    New-Item -ItemType Directory -Path $placeholderPath -Force | Out-Null

    Write-Host "  ✓ 创建: $($pkg.Name)/$($pkg.Folder)" -ForegroundColor Green
}

# 2. 创建placeholder页面文件
Write-Host "`n[步骤2/5] 创建placeholder页面..." -ForegroundColor Yellow
foreach ($pkg in $newPackages) {
    $placeholderPath = Join-Path $baseDir "$($pkg.Name)\pages\placeholder"

    # index.js
    $jsContent = @"
// Placeholder page for $($pkg.Name)
Page({
  data: {},
  onLoad: function() {
    console.log('$($pkg.Name) placeholder loaded');
  }
});
"@
    Set-Content -Path (Join-Path $placeholderPath "index.js") -Value $jsContent -Encoding UTF8

    # index.json
    $jsonContent = @"
{
  "navigationBarTitleText": "加载中",
  "usingComponents": {}
}
"@
    Set-Content -Path (Join-Path $placeholderPath "index.json") -Value $jsonContent -Encoding UTF8

    # index.wxml
    $wxmlContent = @"
<view class="container">
  <text>Loading...</text>
</view>
"@
    Set-Content -Path (Join-Path $placeholderPath "index.wxml") -Value $wxmlContent -Encoding UTF8

    # index.wxss
    $wxssContent = @"
.container {
  padding: 20px;
  text-align: center;
}
"@
    Set-Content -Path (Join-Path $placeholderPath "index.wxss") -Value $wxssContent -Encoding UTF8

    Write-Host "  ✓ 创建placeholder: $($pkg.Name)" -ForegroundColor Green
}

# 3. 复制图片文件到新分包
Write-Host "`n[步骤3/5] 复制图片文件（按区域分配）..." -ForegroundColor Yellow

# 辅助函数：确定areaId所在的旧分包
function Get-OldPackageInfo {
    param([int]$areaId)

    if ($areaId -le 8) {
        return $oldPackages["1-8"]
    } elseif ($areaId -le 16) {
        return $oldPackages["9-16"]
    } else {
        return $oldPackages["17-24"]
    }
}

# 按新分包复制文件
foreach ($pkg in $newPackages) {
    Write-Host "  处理 $($pkg.Name)..." -ForegroundColor Cyan

    $destFolder = Join-Path $baseDir "$($pkg.Name)\$($pkg.Folder)"
    $copiedCount = 0

    foreach ($areaId in $pkg.Areas) {
        # 确定源分包
        $oldPkg = Get-OldPackageInfo -areaId $areaId
        $sourceFolder = Join-Path $baseDir "$($oldPkg.Root)\$($oldPkg.SubDir)"

        if (Test-Path $sourceFolder) {
            # 复制该区域的所有PNG文件
            Get-ChildItem -Path $sourceFolder -Filter "*.png" | ForEach-Object {
                $destFile = Join-Path $destFolder $_.Name
                Copy-Item -Path $_.FullName -Destination $destFile -Force
                $copiedCount++
            }
        }
    }

    Write-Host "    ✓ 已复制 $copiedCount 个文件 (Areas $($pkg.Areas[0])-$($pkg.Areas[-1]))" -ForegroundColor Green
}

Write-Host "`n[步骤4/5] 统计新分包大小..." -ForegroundColor Yellow
foreach ($pkg in $newPackages) {
    $pkgPath = Join-Path $baseDir $pkg.Name
    $size = (Get-ChildItem -Path $pkgPath -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1KB
    Write-Host "  $($pkg.Name): $([math]::Round($size, 0)) KB" -ForegroundColor Cyan
}

Write-Host "`n[步骤5/5] 重组完成！" -ForegroundColor Green
Write-Host "`n⚠️  接下来需要手动执行：" -ForegroundColor Yellow
Write-Host "  1. 更新 app.json 的 subPackages 配置（6个分包）" -ForegroundColor White
Write-Host "  2. 更新 app.json 的 preloadRule 配置" -ForegroundColor White
Write-Host "  3. 更新 data-helpers.js 的 IMAGE_PATH_CONFIG（6个路径）" -ForegroundColor White
Write-Host "  4. 删除旧的3个分包目录（备份后）" -ForegroundColor White
Write-Host "  5. 重新编译并真机测试" -ForegroundColor White
Write-Host "`n按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
