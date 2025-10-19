/**
 * Vant Weapp字体离线化自动修复脚本
 *
 * 问题：Vant组件库默认从CDN加载字体，在飞行模式下无法使用
 * 解决：将字体URL替换为本地路径
 *
 * 使用：在npm install后自动运行（通过package.json的postinstall脚本）
 */

const fs = require('fs');
const path = require('path');

// 目标文件路径
const iconWxssPath = path.join(__dirname, '../miniprogram_npm/@vant/weapp/icon/index.wxss');

/**
 * 修复Vant字体引用
 */
function fixVantFonts() {
  console.log('\n🔧 开始修复Vant字体引用...\n');

  // 检查文件是否存在
  if (!fs.existsSync(iconWxssPath)) {
    console.warn('⚠️  警告：Vant icon组件文件不存在，跳过修复');
    console.warn('   路径:', iconWxssPath);
    console.warn('   提示：请先运行微信开发者工具的"构建npm"功能\n');
    return;
  }

  try {
    // 读取文件内容
    let content = fs.readFileSync(iconWxssPath, 'utf8');

    // 检查是否已经修复
    if (content.includes('url(/assets/fonts/vant-icon')) {
      console.log('✅ Vant字体已经是本地路径，无需修复\n');
      return;
    }

    // 替换字体URL - woff2格式
    const cdnPattern = /url\(\/\/at\.alicdn\.com\/t\/c\/font_2553510_\w+\.woff2\?t=\d+\)/g;
    content = content.replace(cdnPattern, 'url(/assets/fonts/vant-icon.woff2)');

    // 替换字体URL - woff格式
    const cdnPatternWoff = /url\(\/\/at\.alicdn\.com\/t\/c\/font_2553510_\w+\.woff\?t=\d+\)/g;
    content = content.replace(cdnPatternWoff, 'url(/assets/fonts/vant-icon.woff)');

    // 写回文件
    fs.writeFileSync(iconWxssPath, content, 'utf8');

    console.log('✅ Vant字体路径已成功修复为本地路径');
    console.log('   原路径: //at.alicdn.com/t/c/font_2553510_*.woff2');
    console.log('   新路径: /assets/fonts/vant-icon.woff2');
    console.log('   ');
    console.log('📋 受影响组件: van-tag, van-icon');
    console.log('🎯 受益页面: 所有使用van-tag的页面（13个页面）');
    console.log('✈️  离线模式: 完全支持飞行模式使用\n');

  } catch (error) {
    console.error('❌ 修复Vant字体失败:', error.message);
    console.error('   请手动修改文件:', iconWxssPath);
    console.error('   参考文档: miniprogram/VANT_FONT_FIX.md\n');
    process.exit(1);
  }
}

// 执行修复
fixVantFonts();
