# 绕机检查图片分包重组脚本（简化版 - 仅复制PNG文件）
# 从3个分包重组为6个分包（按area-component映射精确分配）

$baseDir = "D:\FlightToolbox\miniprogram"
Set-Location $baseDir

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "绕机检查图片分包重组工具 v2.0 (简化版)" -ForegroundColor Cyan
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

# 步骤1: 删除旧的错误分包图片目录
Write-Host "`n[步骤1/3] 清理旧的分包图片目录..." -ForegroundColor Yellow
$packagesToClean = @(
    "packageWalkaroundImages1", "packageWalkaroundImages2", "packageWalkaroundImages3",
    "packageWalkaroundImages4", "packageWalkaroundImages5", "packageWalkaroundImages6"
)

foreach ($pkg in $packagesToClean) {
    $pkgPath = Join-Path $baseDir $pkg
    if (Test-Path $pkgPath) {
        $imageFolders = Get-ChildItem -Path $pkgPath -Directory | Where-Object { $_.Name -like "images*" }
        foreach ($folder in $imageFolders) {
            Remove-Item -Path $folder.FullName -Recurse -Force
            Write-Host "  删除: $pkg/$($folder.Name)" -ForegroundColor Green
        }
    }
}

# 步骤2: 创建新分包图片目录
Write-Host "`n[步骤2/3] 创建新分包图片目录..." -ForegroundColor Yellow
foreach ($pkg in $mapping.newPackages) {
    $pkgPath = Join-Path $baseDir $pkg.name
    $imagesPath = Join-Path $pkgPath $pkg.folder
    New-Item -ItemType Directory -Path $imagesPath -Force | Out-Null
    Write-Host "  创建: $($pkg.name)/$($pkg.folder)" -ForegroundColor Green
}

# 步骤3: 按Component映射复制PNG文件
Write-Host "`n[步骤3/3] 复制PNG文件（按Component映射）..." -ForegroundColor Yellow

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

# 统计新分包大小
Write-Host "`n========== 新分包大小统计 ==========" -ForegroundColor Yellow
$totalSize = 0
foreach ($pkg in $mapping.newPackages) {
    $pkgPath = Join-Path $baseDir $pkg.name
    $imagesPath = Join-Path $pkgPath $pkg.folder
    if (Test-Path $imagesPath) {
        $fileCount = (Get-ChildItem -Path $imagesPath -Filter "*.png" -File).Count
        $size = (Get-ChildItem -Path $imagesPath -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1KB
        $totalSize += $size
        $color = if ($size -lt 1024) { "Green" } elseif ($size -lt 2048) { "Yellow" } else { "Red" }
        Write-Host "  $($pkg.name): $([math]::Round($size, 0)) KB ($fileCount PNG)" -ForegroundColor $color
    }
}

Write-Host "`n总大小: $([math]::Round($totalSize, 0)) KB" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "PNG文件重组完成!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "接下来需要手动执行:" -ForegroundColor Yellow
Write-Host "  1. 运行 node create-placeholder-pages.js 创建placeholder页面" -ForegroundColor White
Write-Host "  2. 更新 app.json 的 subPackages 配置（6个分包）" -ForegroundColor White
Write-Host "  3. 更新 data-helpers.js 的 IMAGE_PATH_CONFIG（6个路径）" -ForegroundColor White
Write-Host "  4. 更新 app.json 的 preloadRule 配置（6个分包分布）" -ForegroundColor White
Write-Host "  5. 删除旧的component1/2/3子目录（备份后）" -ForegroundColor White
Write-Host "  6. 微信开发者工具重新编译" -ForegroundColor White
Write-Host "  7. 真机测试验证" -ForegroundColor White
Write-Host ""
