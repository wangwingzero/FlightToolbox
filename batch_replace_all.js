const fs = require('fs');

// 从机场中文名字.js文件中读取映射关系
const chineseNamesContent = fs.readFileSync('机场中文名字.js', 'utf8');

// 提取airportNames对象
const airportNamesMatch = chineseNamesContent.match(/const airportNames = \{([\s\S]*)\};/);
if (!airportNamesMatch) {
    console.error('无法找到airportNames对象');
    process.exit(1);
}

// 解析映射对象
const airportNamesStr = airportNamesMatch[1];
const airportNamesMap = {};

// 使用正则表达式提取键值对
const regex = /"([^"]+)":\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(airportNamesStr)) !== null) {
    airportNamesMap[match[1]] = match[2];
}

console.log(`成功解析 ${Object.keys(airportNamesMap).length} 个机场名称映射`);

// 读取英文机场文件
const englishAirportsPath = 'miniprogram/packageC/english-shortname-airports.js';
let content = fs.readFileSync(englishAirportsPath, 'utf8');

let replaceCount = 0;
let totalChecked = 0;

// 批量替换
Object.entries(airportNamesMap).forEach(([english, chinese]) => {
    const pattern = `"ShortName": "${english}"`;
    const replacement = `"ShortName": "${chinese}"`;
    
    // 使用全局替换
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    
    if (matches) {
        content = content.replace(regex, replacement);
        console.log(`替换 ${matches.length} 个: ${english} -> ${chinese}`);
        replaceCount += matches.length;
    }
    totalChecked++;
});

console.log(`\n处理完成！`);
console.log(`总共检查了 ${totalChecked} 个映射关系`);
console.log(`成功替换了 ${replaceCount} 个英文名称为中文名称`);

// 保存文件
fs.writeFileSync(englishAirportsPath, content, 'utf8');
console.log('文件已保存');

// 检查还有多少英文名称
const remainingEnglish = content.match(/"ShortName": "[A-Za-z]/g);
console.log(`剩余英文名称数量: ${remainingEnglish ? remainingEnglish.length : 0}`);