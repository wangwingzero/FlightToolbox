/**
 * 检查重复ID工具
 * 用途：扫描所有数据文件，检查是否存在重复的ID
 * 使用方法：node check-duplicate-ids.js
 */

const fs = require('fs');
const path = require('path');

// 需要检查的数据文件
const dataFiles = [
  'definitions.js',
  'AC-91-FS-2020-016R1.js',
  'AC-121-FS-33R1.js',
  'AC-121-FS-41R1.js',
  'CCAR-121-R8.js',
  'AC-91-FS-001R2.js',
  'AC-121-50R2.js'
];

console.log('🔍 开始扫描重复ID...\n');

// 存储所有id及其来源
const idMap = new Map();
const duplicates = new Set();

// 第一步：扫描所有文件，收集id
dataFiles.forEach(fileName => {
  const filePath = path.join(__dirname, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${fileName}`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const idRegex = /"id":\s*"([^"]+)"/g;
    let match;
    let count = 0;

    while ((match = idRegex.exec(content)) !== null) {
      const id = match[1];
      count++;

      if (idMap.has(id)) {
        // 发现重复
        duplicates.add(id);
        idMap.get(id).push({ file: fileName, position: match.index });
      } else {
        idMap.set(id, [{ file: fileName, position: match.index }]);
      }
    }

    console.log(`✅ ${fileName}: 找到 ${count} 个ID`);
  } catch (error) {
    console.error(`❌ 读取文件失败 ${fileName}:`, error.message);
  }
});

console.log(`\n📊 统计结果:`);
console.log(`   总ID数量: ${idMap.size}`);
console.log(`   重复ID数量: ${duplicates.size}`);

// 第二步：显示重复的id详情
if (duplicates.size > 0) {
  console.log('\n🚨 发现以下重复ID:\n');

  duplicates.forEach(id => {
    const locations = idMap.get(id);
    console.log(`   ID: ${id}`);
    console.log(`   出现次数: ${locations.length}`);
    locations.forEach(loc => {
      console.log(`     - ${loc.file}`);
    });
    console.log('');
  });

  console.log('⚠️  警告：发现重复ID，请立即修复！\n');
  console.log('修复方法：');
  console.log('1. 手动为每个重复的ID生成新的UUID');
  console.log('2. 或运行自动修复脚本：node fix-duplicate-ids.js\n');

  process.exit(1); // 以错误状态退出
} else {
  console.log('\n✅ 未发现重复ID，数据完整！');
  console.log('✨ 所有定义都有唯一的标识符\n');

  process.exit(0); // 以成功状态退出
}
