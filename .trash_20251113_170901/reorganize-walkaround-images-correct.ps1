# 绕机检查图片分包重组脚本（正确版本）
# 从3个分包重组为6个分包（按area-component映射精确分配）

$baseDir = "D:\FlightToolbox\miniprogram"
Set-Location $baseDir

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "绕机检查图片分包重组工具 v2.0" -ForegroundColor Cyan
Write-Host "3个分包 -> 6个分包（按Component精确分配）" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 读取映射数据
$mappingFile = "D:\FlightToolbox\area-component-mapping.json"
if (-not (Test-Path $mappingFile)) {
    Write-Host "错误: 找不到映射文件 $mappingFile" -ForegroundColor Red
    Write-Host "请先运行: node build-area-component-map.js" -ForegroundColor Yellow
    exit 1
}

$mapping = Get-Content $mappingFile | ConvertFrom-Json
Write-Host "成功读取area-component映射数据" -ForegroundColor Green

# 定义旧分包位置
$oldPackages = @{
    "1-8"   = @{ Root = "packageWalkaroundImages1"; SubDir = "component1" }
    "9-16"  = @{ Root = "packageWalkaroundImages2"; SubDir = "component2" }
    "17-24" = @{ Root = "packageWalkaroundImages3"; SubDir = "component3" }
}

# 辅助函数：在旧分包中查找PNG文件
function Find-ComponentPNG {
    param([string]$componentId)

    $pngName = "$componentId.png"

    foreach ($range in $oldPackages.Keys) {
        $pkg = $oldPackages[$range]
        $sourcePath = Join-Path $baseDir "$($pkg.Root)\$($pkg.SubDir)\$pngName"
        if (Test-Path $sourcePath) {
            return $sourcePath
        }
    }

    Write-Host "  警告: 找不到PNG文件: $pngName" -ForegroundColor Yellow
    return $null
}

# 步骤1: 删除旧的错误分包（如果存在）
Write-Host "`n[步骤1/5] 清理旧的分包目录..." -ForegroundColor Yellow
$packagesToClean = @(
    "packageWalkaroundImages1", "packageWalkaroundImages2", "packageWalkaroundImages3",
    "packageWalkaroundImages4", "packageWalkaroundImages5", "packageWalkaroundImages6"
)

foreach ($pkg in $packagesToClean) {
    $pkgPath = Join-Path $baseDir $pkg
    if (Test-Path $pkgPath) {
        # 只删除新创建的目录，保留旧的component1/2/3
        $imageFolders = Get-ChildItem -Path $pkgPath -Directory | Where-Object { $_.Name -like "images*" }
        $placeholderPath = Join-Path $pkgPath "pages"

        foreach ($folder in $imageFolders) {
            Remove-Item -Path $folder.FullName -Recurse -Force
            Write-Host "  删除: $pkg/$($folder.Name)" -ForegroundColor Green
        }

        if (Test-Path $placeholderPath) {
            Remove-Item -Path $placeholderPath -Recurse -Force
            Write-Host "  删除: $pkg/pages" -ForegroundColor Green
        }
    }
}

# 步骤2: 创建新分包目录结构
Write-Host "`n[步骤2/5] 创建新分包目录结构..." -ForegroundColor Yellow
foreach ($pkg in $mapping.newPackages) {
    $pkgPath = Join-Path $baseDir $pkg.name
    $imagesPath = Join-Path $pkgPath $pkg.folder
    $placeholderPath = Join-Path $pkgPath "pages\placeholder"

    # 创建目录
    New-Item -ItemType Directory -Path $imagesPath -Force | Out-Null
    New-Item -ItemType Directory -Path $placeholderPath -Force | Out-Null

    Write-Host "  创建: $($pkg.name)/$($pkg.folder)" -ForegroundColor Green
}

# 步骤3: 创建placeholder页面文件
Write-Host "`n[步骤3/5] 创建placeholder页面..." -ForegroundColor Yellow
foreach ($pkg in $mapping.newPackages) {
    $placeholderPath = Join-Path $baseDir "$($pkg.name)\pages\placeholder"
    $pkgName = $pkg.name

    # index.js
    @"
// Placeholder page for $pkgName
Page({
  data: {},
  onLoad: function() {
    console.log('$pkgName placeholder loaded');
  }
});
"@ | Out-File -FilePath (Join-Path $placeholderPath "index.js") -Encoding UTF8

    # index.json
    @"
{
  "navigationBarTitleText": "加载中",
  "usingComponents": {}
}
"@ | Out-File -FilePath (Join-Path $placeholderPath "index.json") -Encoding UTF8

    # index.wxml
    @"
<view class="container">
  <text>Loading...</text>
</view>
"@ | Out-File -FilePath (Join-Path $placeholderPath "index.wxml") -Encoding UTF8

    # index.wxss
    @"
.container {
  padding: 20px;
  text-align: center;
}
"@ | Out-File -FilePath (Join-Path $placeholderPath "index.wxss") -Encoding UTF8

    Write-Host "  创建placeholder: $($pkg.name)" -ForegroundColor Green
}

# 步骤4: 按Component映射复制PNG文件
Write-Host "`n[步骤4/5] 复制PNG文件（按Component映射）..." -ForegroundColor Yellow

foreach ($pkg in $mapping.newPackages) {
    Write-Host "  处理 $($pkg.name)..." -ForegroundColor Cyan

    $destFolder = Join-Path $baseDir "$($pkg.name)\$($pkg.folder)"
    $componentList = $mapping.packageComponentMap.($pkg.name)
    $copiedCount = 0
    $missingCount = 0

    foreach ($componentId in $componentList) {
        $sourcePath = Find-ComponentPNG -componentId $componentId

        if ($sourcePath) {
            $destPath = Join-Path $destFolder (Split-Path $sourcePath -Leaf)
            Copy-Item -Path $sourcePath -Destination $destPath -Force
            $copiedCount++
        } else {
            $missingCount++
        }
    }

    $areaRange = "Areas $($pkg.areas[0])-$($pkg.areas[-1])"
    Write-Host "    已复制 $copiedCount 个PNG文件 ($areaRange)" -ForegroundColor Green
    if ($missingCount -gt 0) {
        Write-Host "    缺失 $missingCount 个PNG文件" -ForegroundColor Yellow
    }
}

# 步骤5: 统计新分包大小
Write-Host "`n[步骤5/5] 统计新分包大小..." -ForegroundColor Yellow
$totalSize = 0
foreach ($pkg in $mapping.newPackages) {
    $pkgPath = Join-Path $baseDir $pkg.name
    $fileCount = (Get-ChildItem -Path (Join-Path $pkgPath $pkg.folder) -Filter "*.png" -File).Count
    $size = (Get-ChildItem -Path $pkgPath -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1KB
    $totalSize += $size
    $color = if ($size -lt 1024) { "Green" } elseif ($size -lt 2048) { "Yellow" } else { "Red" }
    Write-Host "  $($pkg.name): $([math]::Round($size, 0)) KB ($fileCount files)" -ForegroundColor $color
}

Write-Host "`n总大小: $([math]::Round($totalSize, 0)) KB" -ForegroundColor Cyan

Write-Host "`n[重组完成!]" -ForegroundColor Green
Write-Host "`n接下来需要手动执行:" -ForegroundColor Yellow
Write-Host "  1. 更新 app.json 的 subPackages 配置（6个分包）" -ForegroundColor White
Write-Host "  2. 更新 data-helpers.js 的 IMAGE_PATH_CONFIG（6个路径）" -ForegroundColor White
Write-Host "  3. 更新 app.json 的 preloadRule 配置（6个分包分布）" -ForegroundColor White
Write-Host "  4. 删除旧的component1/2/3子目录（备份后）" -ForegroundColor White
Write-Host "  5. 微信开发者工具重新编译" -ForegroundColor White
Write-Host "  6. 真机测试验证" -ForegroundColor White
Write-Host "`n完成!" -ForegroundColor Green
