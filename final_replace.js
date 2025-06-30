const fs = require('fs');

// 读取英文机场文件
const filePath = 'miniprogram/packageC/english-shortname-airports.js';
let content = fs.readFileSync(filePath, 'utf8');

// 从中文名字文件中提取的一些重要映射
const mappings = {
  "Batuna Mission": "巴图纳米申",
  "Barra Do Garcas": "巴拉杜加萨斯", 
  "Bislig Airport": "比斯利格机场",
  "Big Piney": "大派尼",
  "Balikpapan-Born": "巴厘巴板-婆罗洲",
  "Borongan City": "博龙岸市",
  "Porto Seguro": "塞古罗港",
  "Besalampy Airpo": "贝萨兰皮机场",
  "Budardalur": "布达达鲁尔",
  "Boulia Airport": "布利亚机场",
  "Balgo Hill Airp": "巴尔戈山机场",
  "Barreirinhas Ai": "巴雷里尼亚斯机场",
  "San Carlos de B": "圣卡洛斯-德巴里洛切",
  "Bourke Airport": "伯克机场",
  "Barquisimeto": "巴基西梅托",
  "Eoligarry": "埃奥利加里",
  "Bathurst Island": "巴瑟斯特岛",
  "Bremerhaven": "不来梅哈芬",
  "Barahona": "巴拉奥纳",
  "Bardstown": "巴兹敦",
  "Bahia Solano": "索拉诺湾",
  "Sematan": "实马丹",
  "Camp Pohakuloa": "波哈库洛亚营地",
  "Bata Airport": "巴塔机场",
  "Bairnsdale Airp": "贝恩斯代尔机场",
  "Bossangoa": "博桑戈阿",
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
  "Brewarrina Airp": "布雷瓦里纳机场"
};

let replaceCount = 0;

// 执行替换
Object.entries(mappings).forEach(([english, chinese]) => {
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

console.log(`\n总共替换了 ${replaceCount} 个机场名称`);

// 保存文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('文件已保存');

// 检查还有多少英文名称
const remainingEnglish = content.match(/"ShortName": "[A-Za-z]/g);
console.log(`剩余英文名称数量: ${remainingEnglish ? remainingEnglish.length : 0}`);