// 临时脚本：检查JavaScript文件中的ES6+语法问题
const fs = require('fs');
const path = require('path');

// 需要检查的ES6+语法模式
const es6Patterns = [
  /const\s+/g,           // const声明
  /let\s+/g,             // let声明  
  /\?\./g,               // 可选链
  /`.*\$\{.*\}`/g,       // 模板字符串
  /\.includes\(/g,       // includes方法
  /=>\s*{/g,             // 箭头函数
  /for\s*\(\s*const\s+/g, // for...of with const
  /for\s*\(\s*let\s+/g    // for...of with let
];

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    es6Patterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        const patternNames = ['const', 'let', '可选链', '模板字符串', 'includes', '箭头函数', 'for...of const', 'for...of let'];
        issues.push(`${patternNames[index]}: ${matches.length}处`);
      }
    });
    
    if (issues.length > 0) {
      console.log(`❌ ${filePath}:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      return false;
    } else {
      console.log(`✅ ${filePath}: 无ES6+语法问题`);
      return true;
    }
  } catch (error) {
    console.log(`⚠️  ${filePath}: 读取失败`);
    return true;
  }
}

// 检查主要的JavaScript文件
const jsFiles = [
  'miniprogram/utils/search-manager.js',
  'miniprogram/utils/error-handler.js', 
  'miniprogram/packageE/index.js',
  'miniprogram/utils/audio-config.js',
  'miniprogram/utils/communication-manager.js',
  'miniprogram/packageO/rodex-decoder/index.js'
];

console.log('🔍 检查JavaScript文件ES6+语法兼容性...\n');
jsFiles.forEach(checkFile);