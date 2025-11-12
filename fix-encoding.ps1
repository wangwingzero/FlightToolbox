# 修复文件编码从GBK到UTF-8

$wxmlFile = "D:\FlightToolbox\miniprogram\packageRadiation\pages\index\index.wxml"
$jsFile = "D:\FlightToolbox\miniprogram\packageRadiation\pages\index\index.js"
$tempWxml = "D:\FlightToolbox\miniprogram\packageRadiation\pages\index\index_temp.wxml"
$tempJs = "D:\FlightToolbox\miniprogram\packageRadiation\pages\index\index_temp.js"

Write-Host "正在修复index.wxml编码..."
try {
    $content = Get-Content -Path $wxmlFile -Encoding Default
    $content | Set-Content -Path $tempWxml -Encoding UTF8
    Move-Item -Path $tempWxml -Destination $wxmlFile -Force
    Write-Host "✓ index.wxml编码已修复"
} catch {
    Write-Host "✗ index.wxml修复失败: $_"
}

Write-Host "正在修复index.js编码..."
try {
    $content = Get-Content -Path $jsFile -Encoding Default
    $content | Set-Content -Path $tempJs -Encoding UTF8
    Move-Item -Path $tempJs -Destination $jsFile -Force
    Write-Host "✓ index.js编码已修复"
} catch {
    Write-Host "✗ index.js修复失败: $_"
}

Write-Host "编码修复完成！"
