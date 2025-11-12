const fs = require('fs');
const path = require('path');

// 读取checkitems数据
const data = require('./miniprogram/packageWalkaround/data/a330/checkitems.js');

// 统计每个区域需要的图片
const group1 = new Set();
const group2 = new Set();

data.checkItems.forEach(item => {
  if (item.areaId <= 12) {
    group1.add(item.componentId);
  } else {
    group2.add(item.componentId);
  }
});

const sourceDir = './miniprogram/packageWalkaround/images/component';
const targetDir1 = './miniprogram/packageWalkaround/images/component1';
const targetDir2 = './miniprogram/packageWalkaround/images/component2';

let copied1 = 0;
let copied2 = 0;
let failed = [];

// 复制区域1-12的图片
console.log('复制区域1-12的图片...');
group1.forEach(componentId => {
  const sourceFile = path.join(sourceDir, `${componentId}.png`);
  const targetFile = path.join(targetDir1, `${componentId}.png`);

  try {
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile);
      copied1++;
    } else {
      console.log(`⚠️  未找到: ${componentId}.png`);
      failed.push(componentId);
    }
  } catch (error) {
    console.error(`❌ 复制失败: ${componentId}.png -`, error.message);
    failed.push(componentId);
  }
});

// 复制区域13-24的图片
console.log('\\n复制区域13-24的图片...');
group2.forEach(componentId => {
  const sourceFile = path.join(sourceDir, `${componentId}.png`);
  const targetFile = path.join(targetDir2, `${componentId}.png`);

  try {
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile);
      copied2++;
    } else {
      console.log(`⚠️  未找到: ${componentId}.png`);
      if (!failed.includes(componentId)) {
        failed.push(componentId);
      }
    }
  } catch (error) {
    console.error(`❌ 复制失败: ${componentId}.png -`, error.message);
    if (!failed.includes(componentId)) {
      failed.push(componentId);
    }
  }
});

// 统计大小
const getDirectorySize = (dirPath) => {
  let totalSize = 0;
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      totalSize += stats.size;
    }
  });
  return totalSize;
};

const size1 = getDirectorySize(targetDir1) / (1024 * 1024);
const size2 = getDirectorySize(targetDir2) / (1024 * 1024);

console.log('\\n======================');
console.log('✅ 复制完成！');
console.log('======================');
console.log(`component1: ${copied1} 个文件, ${size1.toFixed(2)} MB`);
console.log(`component2: ${copied2} 个文件, ${size2.toFixed(2)} MB`);
console.log(`总计: ${copied1 + copied2} 个文件`);

if (failed.length > 0) {
  console.log('\\n⚠️  缺失的图片 (' + failed.length + '个):');
  console.log(failed.join(', '));
}
