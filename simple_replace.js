// 简单的替换脚本，避免编码问题
const fs = require('fs');

// 读取文件
let content = fs.readFileSync('miniprogram/packageC/english-shortname-airports.js', 'utf8');

// 定义一些基本的替换
const replacements = [
  ['"ShortName": "Bartow"', '"ShortName": "巴托"'],
  ['"ShortName": "Bozoum"', '"ShortName": "博祖姆"'],
  ['"ShortName": "Bamenda"', '"ShortName": "巴门达"'],
  ['"ShortName": "Baler"', '"ShortName": "巴莱尔"'],
  ['"ShortName": "Busselton"', '"ShortName": "巴瑟尔顿"'],
  ['"ShortName": "Bequia"', '"ShortName": "贝基亚岛"'],
  ['"ShortName": "Barreiras"', '"ShortName": "巴雷拉斯"'],
  ['"ShortName": "Bern"', '"ShortName": "伯尔尼"'],
  ['"ShortName": "Bosaso"', '"ShortName": "博萨索"'],
  ['"ShortName": "Biskra"', '"ShortName": "比斯克拉"'],
  ['"ShortName": "Amol"', '"ShortName": "阿莫勒"'],
  ['"ShortName": "Basco"', '"ShortName": "巴斯科"'],
  ['"ShortName": "Bisbee"', '"ShortName": "比斯比"'],
  ['"ShortName": "Basrah"', '"ShortName": "巴士拉"'],
  ['"ShortName": "Balsas"', '"ShortName": "巴尔萨斯"'],
  ['"ShortName": "Bost"', '"ShortName": "博斯特"']
];

let replaceCount = 0;

// 执行替换
replacements.forEach(([from, to]) => {
  if (content.includes(from)) {
    content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
    console.log(`Replaced: ${from} -> ${to}`);
    replaceCount++;
  }
});

console.log(`Total replacements: ${replaceCount}`);

// 写回文件
fs.writeFileSync('miniprogram/packageC/english-shortname-airports.js', content, 'utf8');
console.log('File saved');