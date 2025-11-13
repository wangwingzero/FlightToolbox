# Claude Code 状态栏脚本
# 显示：当前目录 [Git分支] | 模型名称

$input = [Console]::In.ReadToEnd() | ConvertFrom-Json

$currentDir = $input.workspace.current_dir
$shortDir = Split-Path -Leaf $currentDir
if ($currentDir -match '^[A-Z]:\\') {
    $drive = $currentDir.Substring(0, 2)
    $shortDir = "$drive\...\$shortDir"
}

$gitBranch = ""
try {
    $gitOutput = git -C $currentDir branch --show-current 2>$null
    if ($LASTEXITCODE -eq 0 -and $gitOutput) {
        $gitBranch = " [$gitOutput]"
    }
} catch {}

$modelName = $input.model.display_name
$modelShort = switch -Regex ($modelName) {
    'Sonnet.*4\.5' { 'Sonnet 4.5' }
    'Sonnet.*3\.7' { 'Sonnet 3.7' }
    'Sonnet.*3\.5' { 'Sonnet 3.5' }
    'Opus' { 'Opus' }
    'Haiku' { 'Haiku' }
    default { $modelName }
}

Write-Host "$shortDir$gitBranch | $modelShort" -NoNewline
