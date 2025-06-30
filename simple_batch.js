// 简化的批量替换脚本
const fs = require('fs');

// 读取文件
let content = fs.readFileSync('miniprogram/packageC/english-shortname-airports.js', 'utf8');

// 定义一些重要的替换（避免特殊字符）
const replacements = [
    ['Egegik', '埃格吉克'],
    ['Bertoua', '贝尔图阿'],
    ['Betou', '贝图'],
    ['Batticaloa', '拜蒂克洛'],
    ['Bonthe', '邦特'],
    ['Bountiful', '邦蒂富尔'],
    ['Batangafo', '巴坦加福'],
    ['Butler', '巴特勒'],
    ['Butare', '布塔雷'],
    ['Bettles', '贝特尔斯'],
    ['Beatty', '比蒂'],
    ['Yarom', '亚罗姆'],
    ['Bursa', '布尔萨'],
    ['Burwell', '伯韦尔'],
    ['Benguela', '本格拉'],
    ['Bulolo', '布洛洛'],
    ['Buenaventura', '布埃纳文图拉'],
    ['Burao', '布拉奥'],
    ['Batumi', '巴统'],
    ['Bushehr', '布什尔'],
    ['Rabil', '拉比尔'],
    ['Berlevag', '贝尔莱沃格'],
    ['Vilhena', '维列纳'],
    ['Bovanenkovo', '博瓦年科沃'],
    ['Itenes', '伊特内斯'],
    ['Baures', '鲍勒斯'],
    ['Belmonte', '贝尔蒙特'],
    ['Bartlesville', '巴特尔斯维尔'],
    ['Breves', '布雷维斯'],
    ['Beluga', '别卢加'],
    ['Batesville', '贝茨维尔'],
    ['Beverly', '贝弗利'],
    ['Bhairawa', '派勒瓦'],
    ['Brawley', '布劳利'],
    ['Brownwood', '布朗伍德'],
    ['Blackwell', '布莱克威尔'],
    ['Bowman', '鲍曼'],
    ['Balakovo', '巴拉科沃'],
    ['Bogalusa', '博加卢萨'],
    ['Bakel', '巴克尔'],
    ['Bellburn', '贝尔本'],
    ['Balkhash', '巴尔喀什'],
    ['Buckeye', '巴克艾'],
    ['Buochs', '布奥克斯'],
    ['Baikonur', '拜科努尔'],
    ['Blytheville', '布莱斯维尔'],
    ['Burley', '伯利'],
    ['Beja', '贝雅'],
    ['Bayamo', '巴亚莫'],
    ['Bayankhongor', '巴彦洪戈尔'],
    ['Bonito', '博尼图'],
    ['Bantry', '班特里'],
    ['Bayreuth', '拜罗伊特'],
    ['Balikesir', '巴勒克埃西尔'],
    ['Bryansk', '布良斯克'],
    ['Bolzano', '博尔扎诺'],
    ['Strymba', '斯特里姆巴']
];

let replaceCount = 0;

// 执行替换
replacements.forEach(([english, chinese]) => {
    const pattern = `"ShortName": "${english}"`;
    const replacement = `"ShortName": "${chinese}"`;
    
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    
    if (matches) {
        content = content.replace(regex, replacement);
        console.log(`Replaced ${matches.length}: ${english} -> ${chinese}`);
        replaceCount += matches.length;
    }
});

console.log(`Total replaced: ${replaceCount}`);

// 保存文件
fs.writeFileSync('miniprogram/packageC/english-shortname-airports.js', content, 'utf8');
console.log('File saved');

// 检查剩余英文名称
const remainingEnglish = content.match(/"ShortName": "[A-Za-z]/g);
console.log(`Remaining English names: ${remainingEnglish ? remainingEnglish.length : 0}`);