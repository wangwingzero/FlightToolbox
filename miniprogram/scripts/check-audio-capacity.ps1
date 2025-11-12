# 航线录音分包容量监控脚本
# 用途：检查所有音频分包大小和预加载页面容量
# 使用：cd miniprogram; .\scripts\check-audio-capacity.ps1 [-Detailed]

param([switch]$Detailed)

Write-Output ""
Write-Output "╔═══════════════════════════════════════════════╗"
Write-Output "║     航线录音分包容量监控                      ║"
Write-Output "╚═══════════════════════════════════════════════╝"
Write-Output ""

# 统计所有分包
$packages = Get-ChildItem "package*" -Directory | 
            Where-Object { (Get-ChildItem "$_\*.mp3" -File -ErrorAction SilentlyContinue).Count -gt 0 }

$totalSize = 0
$totalCount = 0
$packageList = @()

foreach ($pkg in $packages) {
  $count = (Get-ChildItem "$pkg\*.mp3" -File -ErrorAction SilentlyContinue).Count
  if ($count -gt 0) {
    $size = (Get-ChildItem "$pkg\*.mp3" -File | 
             Measure-Object -Property Length -Sum).Sum / 1MB
    $totalSize += $size
    $totalCount += $count
    
    $packageList += [PSCustomObject]@{
      Name = $pkg.Name
      Count = $count
      SizeMB = [math]::Round($size, 2)
    }
  }
}

Write-Output "📦 分包统计:"
Write-Output ""
if ($Detailed) {
  foreach ($pkg in ($packageList | Sort-Object -Property SizeMB -Descending)) {
    Write-Output "  $($pkg.Name.PadRight(25)) $($pkg.Count) 条  $($pkg.SizeMB) MB"
  }
} else {
  Write-Output "  总分包数: $($packageList.Count) 个"
}
Write-Output "  总录音数: $totalCount 条"
Write-Output "  总大小: $([math]::Round($totalSize, 2)) MB"
Write-Output ""

# 统计预加载页面
Write-Output "📄 预加载页面容量:"
Write-Output ""

$pageConfigs = @{
  "通信失效 (pages/communication-failure/index)" = @('packageRussia', 'packageAustralia', 'packageFrance', 
                 'packageThailand', 'packageSrilanka', 'packageTurkey', 
                 'packageItaly')
  "录音片段 (pages/recording-clips/index)" = @('packagePhilippines', 'packageJapan')
  "录音分类 (pages/recording-categories/index)" = @('packageKorean', 'packageUAE', 'packageAmerica', 'packageMacau')
  "航线录音 (pages/airline-recordings/index)" = @('packageUK', 'packageTaipei', 'packageEgypt')
  "通信页面 (pages/operations/index)" = @('packageHongKong')
  "我的首页 (pages/home/index)" = @('packageSingapore', 'packageCanada')
}

$allSafe = $true
$totalRemaining = 0

foreach ($page in $pageConfigs.Keys) {
  $pageSize = 0
  $pkgList = @()
  
  foreach ($pkg in $pageConfigs[$page]) {
    if (Test-Path $pkg) {
      $size = (Get-ChildItem "$pkg\*.mp3" -File -ErrorAction SilentlyContinue | 
               Measure-Object -Property Length -Sum).Sum / 1MB
      $pageSize += $size
      $pkgList += "$pkg ($([math]::Round($size, 2)) MB)"
    }
  }
  
  $remaining = 2.0 - $pageSize
  $totalRemaining += $remaining
  $status = if ($pageSize -lt 1.8) { "✅" } else { "❌"; $allSafe = $false }
  $warning = if ($pageSize -gt 1.5) { " ⚠️" } else { "" }
  
  Write-Output "  $status $page"
  Write-Output "     当前: $([math]::Round($pageSize, 2)) MB | 剩余: $([math]::Round($remaining, 2)) MB$warning"
  
  if ($Detailed -and $pkgList.Count -gt 0) {
    Write-Output "     包含: $($pkgList -join ', ')"
  }
  
  Write-Output ""
}

Write-Output "=========================================="
if ($allSafe) {
  Write-Output "🎉 所有预加载页面都在安全范围内！"
} else {
  Write-Output "⚠️ 有页面超过安全限制（1.8 MB），需要调整！"
}

Write-Output ""
Write-Output "💡 容量分析:"
Write-Output "   总剩余容量: $([math]::Round($totalRemaining, 2)) MB"
Write-Output "   平均单机场: $([math]::Round($totalSize / $packageList.Count, 2)) MB"
Write-Output "   可再增加: 约 $([int]($totalRemaining / 0.25)) 个机场"
Write-Output ""

# 推荐分配
Write-Output "📊 推荐分配优先级（按剩余容量排序）:"
Write-Output ""

$pageCapacity = @()
foreach ($page in $pageConfigs.Keys) {
  $pageSize = 0
  foreach ($pkg in $pageConfigs[$page]) {
    if (Test-Path $pkg) {
      $size = (Get-ChildItem "$pkg\*.mp3" -File -ErrorAction SilentlyContinue | 
               Measure-Object -Property Length -Sum).Sum / 1MB
      $pageSize += $size
    }
  }
  $remaining = 2.0 - $pageSize
  
  $priority = if ($remaining -gt 1.5) { "⭐⭐⭐⭐⭐" }
              elseif ($remaining -gt 1.0) { "⭐⭐⭐⭐" }
              elseif ($remaining -gt 0.5) { "⭐⭐⭐" }
              elseif ($remaining -gt 0.3) { "⭐⭐" }
              else { "⭐" }
  
  $pageCapacity += [PSCustomObject]@{
    Page = $page.Split('(')[0].Trim()
    Remaining = $remaining
    Priority = $priority
    CanAdd = [int]($remaining / 0.25)
  }
}

foreach ($item in ($pageCapacity | Sort-Object -Property Remaining -Descending)) {
  Write-Output "  $($item.Priority) $($item.Page.PadRight(10)) - 剩余 $([math]::Round($item.Remaining, 2)) MB (可增 ~$($item.CanAdd) 个机场)"
}

Write-Output ""
Write-Output "✅ 检查完成！"
Write-Output ""

