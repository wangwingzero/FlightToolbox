const fs = require('fs');

// 读取中文名字文件，使用不同的编码尝试
let chineseNamesContent;
try {
    chineseNamesContent = fs.readFileSync('机场中文名字.js', 'utf8');
} catch (error) {
    console.log('UTF8读取失败，尝试其他方式...');
    try {
        chineseNamesContent = fs.readFileSync('机场中文名字.js', 'latin1');
    } catch (error2) {
        console.error('无法读取中文名字文件');
        process.exit(1);
    }
}

// 手动定义一些重要的映射关系（从中文名字文件中提取）
const airportNamesMap = {
    "Basankusu": "巴桑库苏",
    "Boswell Bay": "博斯韦尔贝",
    "Pathein": "勃生",
    "Bardera Airport": "巴尔代雷机场",
    "Egegik": "埃格吉克",
    "Bertoua": "贝尔图阿",
    "Betou": "贝图",
    "Batticaloa": "拜蒂克洛",
    "Brunette Downs": "布鲁内特唐斯",
    "Bonthe": "邦特",
    "Bountiful": "邦蒂富尔",
    "Batangafo": "巴坦加福",
    "Barter Island L": "巴特岛",
    "Banda Aceh-Suma": "班达亚齐-苏门答腊",
    "Battle Creek": "巴特尔克里克",
    "Bennettsville": "贝内茨维尔",
    "Botopasi": "博托帕西",
    "Butler": "巴特勒",
    "Butare": "布塔雷",
    "Bettles": "贝特尔斯",
    "Batu Licin-Born": "巴图利钦-婆罗洲",
    "Betoota Airport": "贝图塔机场",
    "Beatty": "比蒂",
    "Yarom": "亚罗姆",
    "Bursa": "布尔萨",
    "Buka Island": "布卡岛",
    "Burwell": "伯韦尔",
    "Burketown Airpo": "伯克敦机场",
    "Benguela": "本格拉",
    "Bou Saada Airpo": "布萨达机场",
    "Bulolo": "布洛洛",
    "Buenaventura": "布埃纳文图拉",
    "Burao": "布拉奥",
    "Bhatinda Air Fo": "珀丁达空军基地",
    "Batumi": "巴统",
    "Bunbury Airport": "班伯里机场",
    "Bushehr": "布什尔",
    "Rabil": "拉比尔",
    "Brive-la-Gailla": "布里夫拉盖亚尔德",
    "St Dizier": "圣迪济耶",
    "Berlevag": "贝尔莱沃格",
    "Vilhena": "维列纳",
    "Birdsville Airp": "伯兹维尔机场",
    "Bovanenkovo": "博瓦年科沃",
    "Itenes": "伊特内斯",
    "Baures": "鲍勒斯",
    "Belmonte": "贝尔蒙特",
    "Bartlesville": "巴特尔斯维尔",
    "Brava Island": "布拉瓦岛",
    "Breves": "布雷维斯",
    "Beluga": "别卢加",
    "Iturup Island": "择捉岛",
    "Batesville": "贝茨维尔",
    "Beverly": "贝弗利",
    "Beverley Spring": "贝弗利斯普林",
    "Bhairawa": "派勒瓦",
    "Barrow Island A": "巴罗岛机场",
    "Brawley": "布劳利",
    "Brownwood": "布朗伍德",
    "Braunschweig Wo": "不伦瑞克",
    "Barrow-in-Furne": "巴罗因弗内斯",
    "Bowling Green": "鲍灵格林",
    "Brac Island": "布拉奇岛",
    "Blackwell": "布莱克威尔",
    "Bowman": "鲍曼",
    "Balakovo": "巴拉科沃",
    "Brewarrina Airp": "布雷瓦里纳机场",
    "Cayo Santa Mari": "圣玛丽亚岛",
    "Bogalusa": "博加卢萨",
    "Babo-Papua Isla": "巴博-巴布亚岛",
    "Bade-Papua Isla": "巴德-巴布亚岛",
    "Bakel": "巴克尔",
    "Bellburn": "贝尔本",
    "Bendigo Airport": "本迪戈机场",
    "Balkhash": "巴尔喀什",
    "Aima Ata": "阿拉木图",
    "Buckeye": "巴克艾",
    "Buochs": "布奥克斯",
    "Biala Podlaska": "比亚瓦-波德拉斯卡",
    "Bam Airport": "巴姆机场",
    "Borrego Springs": "博雷戈斯普林斯",
    "Bontang-Borneo": "邦唐-婆罗洲",
    "Butuan City": "武端市",
    "Breiddalsvik": "布雷达尔斯维克",
    "Baikonur": "拜科努尔",
    "Al-Bayda": "贝达",
    "Blytheville": "布莱斯维尔",
    "Burley": "伯利",
    "Beja": "贝雅",
    "Bouake Airport": "布瓦凯机场",
    "Bayamo": "巴亚莫",
    "Bayankhongor": "巴彦洪戈尔",
    "Bonito": "博尼图",
    "Barimunya Airpo": "巴里穆尼亚机场",
    "Bunju Island": "班珠岛",
    "Laeso": "莱斯岛",
    "Bantry": "班特里",
    "Bayreuth": "拜罗伊特",
    "Blakely Island": "布莱克利岛",
    "Cabo Frio": "卡布弗里乌",
    "Balranald Airpo": "巴尔拉纳德机场",
    "Balikesir": "巴勒克埃西尔",
    "Bryansk": "布良斯克",
    "Bolzano": "博尔扎诺",
    "Lakefield Natio": "莱克菲尔德国家公园",
    "Strymba": "斯特里姆巴",
    "Brize Norton": "布莱兹诺顿"
};

// 读取英文机场文件
let content = fs.readFileSync('miniprogram/packageC/english-shortname-airports.js', 'utf8');

let replaceCount = 0;

// 执行替换
Object.entries(airportNamesMap).forEach(([english, chinese]) => {
    const pattern = `"ShortName": "${english}"`;
    const replacement = `"ShortName": "${chinese}"`;
    
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    
    if (matches) {
        content = content.replace(regex, replacement);
        console.log(`替换 ${matches.length} 个: ${english} -> ${chinese}`);
        replaceCount += matches.length;
    }
});

console.log(`总共替换了 ${replaceCount} 个机场名称`);

// 保存文件
fs.writeFileSync('miniprogram/packageC/english-shortname-airports.js', content, 'utf8');
console.log('文件已保存');

// 检查还有多少英文名称
const remainingEnglish = content.match(/"ShortName": "[A-Za-z]/g);
console.log(`剩余英文名称数量: ${remainingEnglish ? remainingEnglish.length : 0}`);