/**
 * 自动化修复音频数据文件ES6语法问题
 * 将const改为var，移除对象属性引号
 *
 * 使用方式：
 * node miniprogram/scripts/fix-audio-files-es5.js
 * node miniprogram/scripts/fix-audio-files-es5.js --dry-run  // 仅检查，不修改
 */

var fs = require('fs');
var path = require('path');

// 需要修复的文件列表
var FILES_TO_FIX = [
  'miniprogram/data/regions/japan.js',
  'miniprogram/data/regions/philippines.js',
  'miniprogram/data/regions/korean.js',
  'miniprogram/data/regions/singapore.js',
  'miniprogram/data/regions/thailand.js',
  'miniprogram/data/regions/russia.js',
  'miniprogram/data/regions/uae.js'
];

var dryRun = process.argv.includes('--dry-run');

function fixES6Syntax(content) {
  var modified = content;

  // 1. 将const改为var
  modified = modified.replace(/^const\s+/gm, 'var ');

  // 2. 移除对象属性的引号（仅移除非必要的引号）
  // "clips" => clips
  modified = modified.replace(/"clips":/g, 'clips:');

  // "label" => label
  modified = modified.replace(/"label":/g, 'label:');

  // "full_transcript" => full_transcript
  modified = modified.replace(/"full_transcript":/g, 'full_transcript:');

  // "translation_cn" => translation_cn
  modified = modified.replace(/"translation_cn":/g, 'translation_cn:');

  // "mp3_file" => mp3_file
  modified = modified.replace(/"mp3_file":/g, 'mp3_file:');

  return modified;
}

function fixFile(filePath) {
  var fullPath = path.join(process.cwd(), filePath);

  // 检查文件是否存在
  if (!fs.existsSync(fullPath)) {
    console.error('❌ 文件不存在:', filePath);
    return false;
  }

  // 读取原文件内容
  var originalContent = fs.readFileSync(fullPath, 'utf8');

  // 修复ES6语法
  var fixedContent = fixES6Syntax(originalContent);

  // 检查是否有修改
  if (originalContent === fixedContent) {
    console.log('⏭️  无需修改:', filePath);
    return true;
  }

  if (dryRun) {
    console.log('🔍 [DRY RUN] 将要修改:', filePath);
    console.log('   - const改为var');
    console.log('   - 移除对象属性引号');
    return true;
  }

  // 创建备份文件
  var backupPath = fullPath + '.backup';
  fs.writeFileSync(backupPath, originalContent, 'utf8');
  console.log('💾 已备份:', filePath + '.backup');

  // 写入修复后的内容
  fs.writeFileSync(fullPath, fixedContent, 'utf8');
  console.log('✅ 已修复:', filePath);

  return true;
}

function main() {
  console.log('========================================');
  console.log('音频数据文件ES5语法自动修复工具');
  console.log('========================================\n');

  if (dryRun) {
    console.log('🔍 运行模式: DRY RUN（仅检查，不修改）\n');
  } else {
    console.log('🔧 运行模式: 修复模式（会修改文件并备份）\n');
  }

  var successCount = 0;
  var failCount = 0;

  FILES_TO_FIX.forEach(function(file) {
    if (fixFile(file)) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log('\n========================================');
  console.log('修复统计');
  console.log('========================================');
  console.log('✅ 成功:', successCount);
  console.log('❌ 失败:', failCount);
  console.log('📁 总计:', FILES_TO_FIX.length);

  if (!dryRun && successCount > 0) {
    console.log('\n💡 提示:');
    console.log('  - 所有修改的文件已自动备份（.backup扩展名）');
    console.log('  - 请使用git diff检查修改是否正确');
    console.log('  - 确认无误后可删除备份文件');
  }
}

// 运行主函数
try {
  main();
} catch (error) {
  console.error('\n❌ 发生错误:', error);
  process.exit(1);
}
