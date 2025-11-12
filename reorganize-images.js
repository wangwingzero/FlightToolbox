// 绕机检查图片分包重组脚本（Node.js版本）
// 从3个分包重组为6个分包（按area-component映射精确分配）

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'miniprogram');

console.log('========================================');
console.log('绕机检查图片分包重组工具 v2.0');
console.log('========================================\n');

// 读取映射数据
const mappingFile = path.join(__dirname, 'area-component-mapping.json');
if (!fs.existsSync(mappingFile)) {
  console.error('错误: 找不到映射文件 area-component-mapping.json');
  console.error('请先运行: node build-area-component-map.js');
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
console.log('成功读取area-component映射数据\n');

// 定义旧分包位置
const oldPackages = {
  '1-8':   { root: 'packageWalkaroundImages1', subdir: 'component1' },
  '9-16':  { root: 'packageWalkaroundImages2', subdir: 'component2' },
  '17-24': { root: 'packageWalkaroundImages3', subdir: 'component3' }
};

// 辅助函数：在旧分包中查找PNG文件
function findComponentPNG(componentId) {
  const pngName = `${componentId}.png`;

  for (const range in oldPackages) {
    const pkg = oldPackages[range];
    const sourcePath = path.join(baseDir, pkg.root, pkg.subdir, pngName);
    if (fs.existsSync(sourcePath)) {
      return sourcePath;
    }
  }

  console.log(`  警告: 找不到PNG文件: ${pngName}`);
  return null;
}

// 步骤1: 删除旧的错误分包图片目录
console.log('[步骤1/3] 清理旧的分包图片目录...');
const packagesToClean = [
  'packageWalkaroundImages1', 'packageWalkaroundImages2', 'packageWalkaroundImages3',
  'packageWalkaroundImages4', 'packageWalkaroundImages5', 'packageWalkaroundImages6'
];

packagesToClean.forEach(pkgName => {
  const pkgPath = path.join(baseDir, pkgName);
  if (fs.existsSync(pkgPath)) {
    // 只删除images*目录
    const items = fs.readdirSync(pkgPath);
    items.forEach(item => {
      if (item.startsWith('images')) {
        const itemPath = path.join(pkgPath, item);
        if (fs.statSync(itemPath).isDirectory()) {
          fs.rmSync(itemPath, { recursive: true, force: true });
          console.log(`  删除: ${pkgName}/${item}`);
        }
      }
    });
  }
});

// 步骤2: 创建新分包图片目录
console.log('\n[步骤2/3] 创建新分包图片目录...');
mapping.newPackages.forEach(pkg => {
  const imagesPath = path.join(baseDir, pkg.name, pkg.folder);
  fs.mkdirSync(imagesPath, { recursive: true });
  console.log(`  创建: ${pkg.name}/${pkg.folder}`);
});

// 步骤3: 按Component映射复制PNG文件
console.log('\n[步骤3/3] 复制PNG文件（按Component映射）...');

mapping.newPackages.forEach(pkg => {
  console.log(`  处理 ${pkg.name}...`);

  const destFolder = path.join(baseDir, pkg.name, pkg.folder);
  const componentList = mapping.packageComponentMap[pkg.name];
  let copiedCount = 0;
  let missingCount = 0;

  componentList.forEach(componentId => {
    const sourcePath = findComponentPNG(componentId);

    if (sourcePath) {
      const destPath = path.join(destFolder, path.basename(sourcePath));
      fs.copyFileSync(sourcePath, destPath);
      copiedCount++;
    } else {
      missingCount++;
    }
  });

  const areaRange = `Areas ${pkg.areas[0]}-${pkg.areas[pkg.areas.length - 1]}`;
  console.log(`    已复制 ${copiedCount} 个PNG文件 (${areaRange})`);
  if (missingCount > 0) {
    console.log(`    缺失 ${missingCount} 个PNG文件`);
  }
});

// 统计新分包大小
console.log('\n========== 新分包大小统计 ==========');
let totalSize = 0;

mapping.newPackages.forEach(pkg => {
  const imagesPath = path.join(baseDir, pkg.name, pkg.folder);

  if (fs.existsSync(imagesPath)) {
    const files = fs.readdirSync(imagesPath).filter(f => f.endsWith('.png'));
    const fileCount = files.length;

    let size = 0;
    files.forEach(file => {
      size += fs.statSync(path.join(imagesPath, file)).size;
    });
    size = size / 1024; // Convert to KB
    totalSize += size;

    const status = size < 1024 ? 'OK' : (size < 2048 ? 'WARN' : 'ERROR');
    console.log(`  [${status}] ${pkg.name}: ${Math.round(size)} KB (${fileCount} PNG)`);
  }
});

console.log(`\n总大小: ${Math.round(totalSize)} KB`);

console.log('\n========================================');
console.log('PNG文件重组完成!');
console.log('========================================\n');

console.log('接下来需要手动执行:');
console.log('  1. 运行 node create-placeholder-pages.js 创建placeholder页面');
console.log('  2. 更新 app.json 的 subPackages 配置（6个分包）');
console.log('  3. 更新 data-helpers.js 的 IMAGE_PATH_CONFIG（6个路径）');
console.log('  4. 更新 app.json 的 preloadRule 配置（6个分包分布）');
console.log('  5. 删除旧的component1/2/3子目录（备份后）');
console.log('  6. 微信开发者工具重新编译');
console.log('  7. 真机测试验证\n');
