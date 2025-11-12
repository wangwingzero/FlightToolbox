const path = require('path');

function safeRequire(relativePath) {
  try {
    return require(path.join('..', 'data', 'a330', relativePath));
  } catch (error) {
    console.error('加载数据文件失败:', relativePath, error.message);
    return null;
  }
}

function main() {
  const areas = safeRequire('areas.js');
  const components = safeRequire('components.js');
  const checkItems = safeRequire('checkitems.js');

  if (!areas || !components || !checkItems) {
    process.exit(1);
  }

  console.log('区域数量:', (areas.areas || []).length);
  console.log('部件数量:', (components.components || []).length);
  console.log('检查项数量:', (checkItems.checkItems || []).length);
  console.log('数据文件加载成功 ✅');
}

main();

