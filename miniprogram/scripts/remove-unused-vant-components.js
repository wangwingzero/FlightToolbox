/**
 * 移除未使用的Vant Weapp组件
 *
 * 问题：Vant Weapp的uploader组件包含wx.chooseImage、wx.chooseVideo、wx.chooseMessageFile等API
 * 即使项目未使用这些组件，微信也会检测到并要求声明隐私权限
 *
 * 解决方案：在构建npm后，自动删除uploader组件目录
 */

const fs = require('fs');
const path = require('path');

// 需要删除的组件列表
const componentsToRemove = [
  'uploader'  // 包含文件/图片/视频选择API
];

// miniprogram_npm路径
const miniprogram_npm_path = path.join(__dirname, '../miniprogram_npm/@vant/weapp');

console.log('🧹 开始清理未使用的Vant组件...');

componentsToRemove.forEach(function(componentName) {
  const componentPath = path.join(miniprogram_npm_path, componentName);

  if (fs.existsSync(componentPath)) {
    try {
      // 递归删除目录
      fs.rmSync(componentPath, { recursive: true, force: true });
      console.log('✅ 已删除:', componentName);
    } catch (err) {
      console.error('❌ 删除失败:', componentName, err.message);
    }
  } else {
    console.log('⚠️  组件不存在（可能已删除）:', componentName);
  }
});

console.log('✨ 清理完成！');
console.log('');
console.log('📝 说明：');
console.log('   - uploader组件已被移除（项目未使用）');
console.log('   - 这样微信就不会检测到文件/图片/视频选择API');
console.log('   - 如果未来需要使用uploader，请移除此脚本');
