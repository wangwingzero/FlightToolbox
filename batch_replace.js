const fs = require('fs');

// 完整的映射关系
const airportNamesMap = {
  "Bemichi": "贝米奇",
  "Baucau": "包考", 
  "Barcaldine": "巴卡尔丁",
  "Pococi": "波科西",
  "Bacau": "巴克乌",
  "Boca Do Acre": "阿克里河口",
  "Bartow": "巴托",
  "Borroloola Airp": "博罗卢拉机场",
  "Bozoum": "博祖姆",
  "Bamenda": "巴门达",
  "Batuna Mission": "巴图纳米申",
  "Barra Do Garcas": "巴拉杜加萨斯",
  "Bislig Airport": "比斯利格机场",
  "Big Piney": "大派尼",
  "Balikpapan-Born": "巴厘巴板-婆罗洲",
  "Borongan City": "博龙岸市",
  "Porto Seguro": "塞古罗港",
  "Besalampy Airpo": "贝萨兰皮机场",
  "Baler": "巴莱尔",
  "Busselton": "巴瑟尔顿",
  "Budardalur": "布达达鲁尔",
  "Boulia Airport": "布利亚机场",
  "Bequia": "贝基亚岛",
  "Balgo Hill Airp": "巴尔戈山机场",
  "Barreiras": "巴雷拉斯",
  "Barreirinhas Ai": "巴雷里尼亚斯机场",
  "San Carlos de B": "圣卡洛斯-德巴里洛切",
  "Bourke Airport": "伯克机场",
  "Barquisimeto": "巴基西梅托",
  "Bern": "伯尔尼",
  "Eoligarry": "埃奥利加里",
  "Bathurst Island": "巴瑟斯特岛",
  "Bremerhaven": "不来梅哈芬",
  "Barahona": "巴拉奥纳",
  "Bardstown": "巴兹敦",
  "Bosaso": "博萨索",
  "Bahia Solano": "索拉诺湾",
  "Sematan": "实马丹",
  "Camp Pohakuloa": "波哈库洛亚营地",
  "Bata Airport": "巴塔机场",
  "Bairnsdale Airp": "贝恩斯代尔机场",
  "Biskra": "比斯克拉",
  "Amol": "阿莫勒",
  "Bossangoa": "博桑戈阿",
  "Basco": "巴斯科",
  "Bisbee": "比斯比",
  "Basrah": "巴士拉",
  "Balsas": "巴尔萨斯",
  "Bost": "博斯特",
  "Basankusu": "巴桑库苏"
};

// 读取文件
let content = fs.readFileSync('miniprogram/packageC/english-shortname-airports.js', 'utf8');

// 批量替换
let replaceCount = 0;
for (const [english, chinese] of Object.entries(airportNamesMap)) {
  const pattern = `"ShortName": "${english}"`;
  const replacement = `"ShortName": "${chinese}"`;
  if (content.includes(pattern)) {
    content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    console.log(`替换: ${english} -> ${chinese}`);
    replaceCount++;
  }
}

console.log(`总共替换了 ${replaceCount} 个机场名称`);

// 写回文件
fs.writeFileSync('miniprogram/packageC/english-shortname-airports.js', content, 'utf8');
console.log('文件已保存');