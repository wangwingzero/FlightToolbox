// 构建area → componentId → PNG文件的映射关系
const fs = require('fs');
const path = require('path');

// 读取checkitems.js数据（直接require）
const checkItemsModule = require('./miniprogram/packageWalkaround/data/a330/checkitems.js');
const checkItems = checkItemsModule.checkItems;

console.log(`✅ 成功读取 ${checkItems.length} 个检查项`);

// 构建area → Set<componentId>映射
const areaComponentMap = {};
for (let i = 1; i <= 24; i++) {
  areaComponentMap[i] = new Set();
}

checkItems.forEach(item => {
  areaComponentMap[item.areaId].add(item.componentId);
});

// 统计每个area的组件数量
console.log('\n========== Area Component 统计 ==========');
for (let i = 1; i <= 24; i++) {
  const count = areaComponentMap[i].size;
  console.log(`Area ${String(i).padStart(2, '0')}: ${count} 个组件`);
}

// 构建6个新分包的componentId列表
const newPackages = [
  { name: 'packageWalkaroundImages1', areas: [1, 2, 3, 4], folder: 'images1' },
  { name: 'packageWalkaroundImages2', areas: [5, 6, 7, 8], folder: 'images2' },
  { name: 'packageWalkaroundImages3', areas: [9, 10, 11, 12], folder: 'images3' },
  { name: 'packageWalkaroundImages4', areas: [13, 14, 15, 16], folder: 'images4' },
  { name: 'packageWalkaroundImages5', areas: [17, 18, 19, 20], folder: 'images5' },
  { name: 'packageWalkaroundImages6', areas: [21, 22, 23, 24], folder: 'images6' }
];

// 为每个新分包收集componentId
const packageComponentMap = {};

newPackages.forEach(pkg => {
  const components = new Set();
  pkg.areas.forEach(areaId => {
    areaComponentMap[areaId].forEach(componentId => {
      components.add(componentId);
    });
  });
  packageComponentMap[pkg.name] = Array.from(components);
});

console.log('\n========== 新分包Component分布 ==========');
newPackages.forEach(pkg => {
  const count = packageComponentMap[pkg.name].length;
  console.log(`${pkg.name}: ${count} 个组件 (Areas ${pkg.areas[0]}-${pkg.areas[pkg.areas.length-1]})`);
});

// 输出为JSON文件供PowerShell使用
const outputPath = path.join(__dirname, 'area-component-mapping.json');
const outputData = {
  areaComponentMap: Object.fromEntries(
    Object.entries(areaComponentMap).map(([k, v]) => [k, Array.from(v)])
  ),
  packageComponentMap,
  newPackages
};

fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
console.log(`\n✅ 映射数据已保存到: ${outputPath}`);

// 验证PNG文件存在性
console.log('\n========== 验证PNG文件 ==========');
const oldPackages = [
  { root: 'packageWalkaroundImages1', subdir: 'component1' },
  { root: 'packageWalkaroundImages2', subdir: 'component2' },
  { root: 'packageWalkaroundImages3', subdir: 'component3' }
];

const allComponents = new Set();
Object.values(areaComponentMap).forEach(components => {
  components.forEach(c => allComponents.add(c));
});

let foundCount = 0;
let missingComponents = [];

allComponents.forEach(componentId => {
  const pngName = `${componentId}.png`;
  let found = false;

  for (const pkg of oldPackages) {
    const pngPath = path.join(__dirname, 'miniprogram', pkg.root, pkg.subdir, pngName);
    if (fs.existsSync(pngPath)) {
      found = true;
      break;
    }
  }

  if (found) {
    foundCount++;
  } else {
    missingComponents.push(componentId);
  }
});

console.log(`✅ 找到PNG文件: ${foundCount}/${allComponents.size}`);
if (missingComponents.length > 0) {
  console.log(`⚠️  缺失PNG文件的组件 (${missingComponents.length}个):`);
  missingComponents.forEach(c => console.log(`   - ${c}.png`));
}

console.log('\n✅ 分析完成！');
