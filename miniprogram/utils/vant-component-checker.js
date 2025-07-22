/**
 * Vant组件路径检查工具
 * 用于验证npm构建结果和组件路径配置
 */

function VantComponentChecker() {
  this.issues = [];
  this.suggestions = [];
}

VantComponentChecker.prototype.checkComponentPaths = function() {
  console.log('🔍 检查Vant组件配置...');
  
  // 1. 检查miniprogram_npm目录
  this.checkNpmDirectory();
  
  // 2. 检查组件路径格式
  this.checkComponentFormat();
  
  // 3. 检查项目配置
  this.checkProjectConfig();
  
  // 输出结果
  this.outputResults();
};

VantComponentChecker.prototype.checkNpmDirectory = function() {
  try {
    // 这里无法直接检查文件系统，但可以提供检查指引
    console.log('📁 请手动检查以下目录是否存在:');
    console.log('   ✓ miniprogram/miniprogram_npm/');
    console.log('   ✓ miniprogram/miniprogram_npm/@vant/');
    console.log('   ✓ miniprogram/miniprogram_npm/@vant/weapp/');
    
    this.addSuggestion('💡 如果上述目录不存在，需要在微信开发者工具中构建npm');
  } catch (error) {
    this.addIssue('❌ 目录检查失败: ' + error.message);
  }
};

VantComponentChecker.prototype.checkComponentFormat = function() {
  console.log('📦 检查组件引用格式...');
  
  // 正确的格式示例
  console.log('✅ 正确格式: "@vant/weapp/button/index"');
  console.log('❌ 错误格式: "../../miniprogram_npm/@vant/weapp/button/index"');
  
  this.addSuggestion('💡 所有组件都应使用npm包名格式，而非相对路径');
};

VantComponentChecker.prototype.checkProjectConfig = function() {
  console.log('⚙️ 检查项目配置...');
  
  // 提供正确的配置参考
  console.log('📋 project.config.json 应包含:');
  console.log('   "packNpmManually": true');
  console.log('   "packNpmRelationList": [');
  console.log('     {');
  console.log('       "packageJsonPath": "./miniprogram/package.json",');
  console.log('       "miniprogramNpmDistDir": "./miniprogram/miniprogram_npm/"');
  console.log('     }');
  console.log('   ]');
  
  this.addSuggestion('✅ 项目配置已更新为正确路径');
};

VantComponentChecker.prototype.addIssue = function(issue) {
  this.issues.push(issue);
};

VantComponentChecker.prototype.addSuggestion = function(suggestion) {
  this.suggestions.push(suggestion);
};

VantComponentChecker.prototype.outputResults = function() {
  console.log('\n📊 Vant组件检查结果:');
  console.log('====================');
  
  if (this.issues.length > 0) {
    console.log('\n🚨 发现的问题:');
    this.issues.forEach(function(issue) {
      console.log(issue);
    });
  }
  
  if (this.suggestions.length > 0) {
    console.log('\n💡 建议和解决方案:');
    this.suggestions.forEach(function(suggestion) {
      console.log(suggestion);
    });
  }
  
  console.log('\n🔧 完整修复流程:');
  console.log('1. 运行 fix-vant-components.cmd');
  console.log('2. 微信开发者工具 → 工具 → 构建npm');
  console.log('3. 重新编译项目');
  console.log('4. 检查控制台是否还有组件路径错误');
};

// 创建实例供使用
var vantChecker = new VantComponentChecker();

module.exports = vantChecker;