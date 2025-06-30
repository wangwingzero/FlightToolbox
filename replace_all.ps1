# PowerShell脚本来批量替换机场名称
$ErrorActionPreference = "Continue"

# 读取文件
$filePath = "miniprogram\packageC\english-shortname-airports.js"
$content = Get-Content $filePath -Raw -Encoding UTF8

# 定义替换映射
$replacements = @{
    "Bardera Airport" = "巴尔代雷机场"
    "Egegik" = "埃格吉克"
    "Bertoua" = "贝尔图阿"
    "Betou" = "贝图"
    "Batticaloa" = "拜蒂克洛"
    "Brunette Downs" = "布鲁内特唐斯"
    "Bonthe" = "邦特"
    "Bountiful" = "邦蒂富尔"
    "Batangafo" = "巴坦加福"
    "Barter Island L" = "巴特岛"
    "Banda Aceh-Suma" = "班达亚齐-苏门答腊"
    "Battle Creek" = "巴特尔克里克"
    "Bennettsville" = "贝内茨维尔"
    "Botopasi" = "博托帕西"
    "Butler" = "巴特勒"
    "Butare" = "布塔雷"
    "Bettles" = "贝特尔斯"
    "Batu Licin-Born" = "巴图利钦-婆罗洲"
    "Betoota Airport" = "贝图塔机场"
    "Beatty" = "比蒂"
    "Yarom" = "亚罗姆"
    "Bursa" = "布尔萨"
    "Buka Island" = "布卡岛"
    "Burwell" = "伯韦尔"
    "Burketown Airpo" = "伯克敦机场"
    "Benguela" = "本格拉"
    "Bou Saada Airpo" = "布萨达机场"
    "Bulolo" = "布洛洛"
    "Buenaventura" = "布埃纳文图拉"
    "Burao" = "布拉奥"
    "Bhatinda Air Fo" = "珀丁达空军基地"
    "Batumi" = "巴统"
    "Bunbury Airport" = "班伯里机场"
    "Bushehr" = "布什尔"
    "Rabil" = "拉比尔"
    "Brive-la-Gailla" = "布里夫拉盖亚尔德"
    "St Dizier" = "圣迪济耶"
    "Berlevag" = "贝尔莱沃格"
    "Vilhena" = "维列纳"
    "Birdsville Airp" = "伯兹维尔机场"
    "Bovanenkovo" = "博瓦年科沃"
    "Itenes" = "伊特内斯"
    "Baures" = "鲍勒斯"
    "Belmonte" = "贝尔蒙特"
    "Bartlesville" = "巴特尔斯维尔"
    "Brava Island" = "布拉瓦岛"
    "Breves" = "布雷维斯"
    "Beluga" = "别卢加"
    "Iturup Island" = "择捉岛"
    "Batesville" = "贝茨维尔"
    "Beverly" = "贝弗利"
    "Beverley Spring" = "贝弗利斯普林"
    "Bhairawa" = "派勒瓦"
    "Barrow Island A" = "巴罗岛机场"
    "Brawley" = "布劳利"
    "Brownwood" = "布朗伍德"
}

$replaceCount = 0

# 执行替换
foreach ($english in $replacements.Keys) {
    $chinese = $replacements[$english]
    $pattern = "`"ShortName`": `"$english`""
    $replacement = "`"ShortName`": `"$chinese`""
    
    if ($content -match [regex]::Escape($pattern)) {
        $beforeCount = ([regex]::Matches($content, [regex]::Escape($pattern))).Count
        $content = $content -replace [regex]::Escape($pattern), $replacement
        Write-Host "替换 $beforeCount 个: $english -> $chinese"
        $replaceCount += $beforeCount
    }
}

Write-Host "总共替换了 $replaceCount 个机场名称"

# 保存文件
$content | Set-Content $filePath -Encoding UTF8
Write-Host "文件已保存"

# 检查剩余英文名称
$remainingEnglish = ([regex]::Matches($content, '"ShortName": "[A-Za-z]')).Count
Write-Host "剩余英文名称数量: $remainingEnglish"