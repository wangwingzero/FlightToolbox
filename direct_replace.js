// 直接替换脚本 - 避免编码问题
const fs = require('fs');

// 读取文件
let content = fs.readFileSync('miniprogram/packageC/english-shortname-airports.js', 'utf8');

// 定义替换数组 - 从中文名字文件中提取的映射关系
const replacements = [
    ['"ShortName": "Balikpapan-Born"', '"ShortName": "巴厘巴板-婆罗洲"'],
    ['"ShortName": "Borongan City"', '"ShortName": "博龙岸市"'],
    ['"ShortName": "Porto Seguro"', '"ShortName": "塞古罗港"'],
    ['"ShortName": "Besalampy Airpo"', '"ShortName": "贝萨兰皮机场"'],
    ['"ShortName": "Borroloola Airp"', '"ShortName": "博罗卢拉机场"'],
    ['"ShortName": "Basankusu"', '"ShortName": "巴桑库苏"'],
    ['"ShortName": "Boswell Bay"', '"ShortName": "博斯韦尔贝"'],
    ['"ShortName": "Pathein"', '"ShortName": "勃生"'],
    ['"ShortName": "Bardera Airport"', '"ShortName": "巴尔代雷机场"'],
    ['"ShortName": "Egegik"', '"ShortName": "埃格吉克"'],
    ['"ShortName": "Bertoua"', '"ShortName": "贝尔图阿"'],
    ['"ShortName": "Betou"', '"ShortName": "贝图"'],
    ['"ShortName": "Batticaloa"', '"ShortName": "拜蒂克洛"'],
    ['"ShortName": "Brunette Downs"', '"ShortName": "布鲁内特唐斯"'],
    ['"ShortName": "Bonthe"', '"ShortName": "邦特"'],
    ['"ShortName": "Bountiful"', '"ShortName": "邦蒂富尔"'],
    ['"ShortName": "Batangafo"', '"ShortName": "巴坦加福"'],
    ['"ShortName": "Barter Island L"', '"ShortName": "巴特岛"'],
    ['"ShortName": "Banda Aceh-Suma"', '"ShortName": "班达亚齐-苏门答腊"'],
    ['"ShortName": "Battle Creek"', '"ShortName": "巴特尔克里克"'],
    ['"ShortName": "Bennettsville"', '"ShortName": "贝内茨维尔"'],
    ['"ShortName": "Botopasi"', '"ShortName": "博托帕西"'],
    ['"ShortName": "Butler"', '"ShortName": "巴特勒"'],
    ['"ShortName": "Butare"', '"ShortName": "布塔雷"'],
    ['"ShortName": "Bettles"', '"ShortName": "贝特尔斯"'],
    ['"ShortName": "Batu Licin-Born"', '"ShortName": "巴图利钦-婆罗洲"'],
    ['"ShortName": "Betoota Airport"', '"ShortName": "贝图塔机场"'],
    ['"ShortName": "Beatty"', '"ShortName": "比蒂"'],
    ['"ShortName": "Yarom"', '"ShortName": "亚罗姆"'],
    ['"ShortName": "Bursa"', '"ShortName": "布尔萨"'],
    ['"ShortName": "Buka Island"', '"ShortName": "布卡岛"'],
    ['"ShortName": "Burwell"', '"ShortName": "伯韦尔"'],
    ['"ShortName": "Burketown Airpo"', '"ShortName": "伯克敦机场"'],
    ['"ShortName": "Benguela"', '"ShortName": "本格拉"'],
    ['"ShortName": "Bou Saada Airpo"', '"ShortName": "布萨达机场"'],
    ['"ShortName": "Bulolo"', '"ShortName": "布洛洛"'],
    ['"ShortName": "Buenaventura"', '"ShortName": "布埃纳文图拉"'],
    ['"ShortName": "Burao"', '"ShortName": "布拉奥"'],
    ['"ShortName": "Bhatinda Air Fo"', '"ShortName": "珀丁达空军基地"'],
    ['"ShortName": "Batumi"', '"ShortName": "巴统"'],
    ['"ShortName": "Bunbury Airport"', '"ShortName": "班伯里机场"'],
    ['"ShortName": "Bushehr"', '"ShortName": "布什尔"'],
    ['"ShortName": "Rabil"', '"ShortName": "拉比尔"'],
    ['"ShortName": "Brive-la-Gailla"', '"ShortName": "布里夫拉盖亚尔德"'],
    ['"ShortName": "St Dizier"', '"ShortName": "圣迪济耶"'],
    ['"ShortName": "Berlevag"', '"ShortName": "贝尔莱沃格"'],
    ['"ShortName": "Vilhena"', '"ShortName": "维列纳"'],
    ['"ShortName": "Birdsville Airp"', '"ShortName": "伯兹维尔机场"'],
    ['"ShortName": "Bovanenkovo"', '"ShortName": "博瓦年科沃"'],
    ['"ShortName": "Itenes"', '"ShortName": "伊特内斯"'],
    ['"ShortName": "Baures"', '"ShortName": "鲍勒斯"']
];

let replaceCount = 0;

// 执行替换
replacements.forEach(([from, to]) => {
    if (content.includes(from)) {
        const beforeCount = (content.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
        console.log(`替换 ${beforeCount} 个: ${from} -> ${to}`);
        replaceCount += beforeCount;
    }
});

console.log(`\n总共替换了 ${replaceCount} 个机场名称`);

// 保存文件
fs.writeFileSync('miniprogram/packageC/english-shortname-airports.js', content, 'utf8');
console.log('文件已保存');

// 检查还有多少英文名称
const remainingEnglish = content.match(/"ShortName": "[A-Za-z]/g);
console.log(`剩余英文名称数量: ${remainingEnglish ? remainingEnglish.length : 0}`);