[CmdletBinding()]param(
  [switch]$Fix,
  [string]$Root = "."
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $Root).Path

$skipPatterns = @(
  "\node_modules\",
  "\miniprogram\node_modules\",
  "\miniprogram\miniprogram_npm\",
  "\.trash_"
)

function Test-SkipPath($path) {
  foreach ($p in $script:skipPatterns) {
    if ($path -like "*${p}*") { return $true }
  }
  return $false
}

$files = Get-ChildItem -LiteralPath $root -Recurse -File -Filter *.json -ErrorAction SilentlyContinue |
  Where-Object { -not (Test-SkipPath $_.FullName) }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$errors = @()
$bomFixed = 0
$bomFound = 0

foreach ($f in $files) {
  try {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)

    if ($hasBom) {
      if ($Fix) {
        $len = $bytes.Length - 3
        $newBytes = New-Object byte[] ($len -as [int])
        if ($len -gt 0) { [System.Array]::Copy($bytes, 3, $newBytes, 0, $len) }
        [System.IO.File]::WriteAllBytes($f.FullName, $newBytes)
        Write-Output ("Removed BOM: {0}" -f $f.FullName)
        $bomFixed++
      } else {
        $bomFound++
        Write-Output ("BOM detected: {0}" -f $f.FullName)
      }
    }

    # 解析 JSON
    try {
      $text = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
      $null = $text | ConvertFrom-Json -ErrorAction Stop
    } catch {
      $errors += "JSON parse failed: $($f.FullName) - $($_.Exception.Message)"
    }
  } catch {
    $errors += "Read failed: $($f.FullName) - $($_.Exception.Message)"
  }
}

Write-Output ("Summary: errors={0}, bomFound={1}, bomFixed={2}" -f $errors.Count, $bomFound, $bomFixed)
if ($errors.Count -gt 0) {
  Write-Output "Errors:"
  $errors | ForEach-Object { Write-Output "  - $_" }
  exit 1
}
