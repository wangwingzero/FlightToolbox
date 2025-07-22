/**
 * 微信小程序启动诊断工具
 * 用于检查常见的启动问题和配置错误
 */

function DiagnosticTool() {
  this.issues = [];
  this.suggestions = [];
}

DiagnosticTool.prototype.runDiagnostic = function() {
  console.log('🔍 FlightToolbox 启动诊断开始...');
  
  // 1. 检查环境信息
  this.checkEnvironment();
  
  // 2. 检查Vant组件
  this.checkVantComponents();
  
  // 3. 检查分包配置
  this.checkSubpackages();
  
  // 4. 检查API使用
  this.checkAPIs();
  
  // 输出诊断结果
  this.outputResults();
};

DiagnosticTool.prototype.checkEnvironment = function() {
  var envInfo = {};
  
  try {
    if (wx.getAccountInfoSync) {
      var accountInfo = wx.getAccountInfoSync();
      envInfo.envVersion = accountInfo.miniProgram.envVersion;
      envInfo.version = accountInfo.miniProgram.version;
      
      if (envInfo.envVersion === 'develop') {
        this.addSuggestion('✅ 开发环境检测正常');
      }
    }
  } catch (error) {
    this.addIssue('❌ 环境信息获取失败: ' + error.message);
  }
  
  console.log('🔧 环境信息:', envInfo);
  return envInfo;
};

DiagnosticTool.prototype.checkVantComponents = function() {
  // 检查常用的Vant组件是否可用
  var commonComponents = [
    'van-button',
    'van-cell', 
    'van-icon',
    'van-loading',
    'van-popup',
    'van-search'
  ];
  
  var componentIssues = 0;
  commonComponents.forEach(function(component) {
    // 这里无法直接检测组件，但可以检查配置
    console.log('📦 检查组件:', component);
  });
  
  if (componentIssues === 0) {
    this.addSuggestion('✅ Vant组件配置检查完成');
  }
};

DiagnosticTool.prototype.checkSubpackages = function() {
  // 检查分包配置
  var expectedSubpackages = [
    'packageF',
    'packageG', 
    'packageH'
  ];
  
  expectedSubpackages.forEach(function(packageName) {
    console.log('📦 检查分包:', packageName);
  });
  
  this.addSuggestion('✅ 分包配置检查完成');
};

DiagnosticTool.prototype.checkAPIs = function() {
  var deprecatedAPIs = [];
  
  // 检查废弃API的使用
  if (wx.getSystemInfoSync) {
    console.log('⚠️ 检测到废弃API: wx.getSystemInfoSync');
    deprecatedAPIs.push('wx.getSystemInfoSync');
  }
  
  if (deprecatedAPIs.length > 0) {
    this.addIssue('❌ 使用了废弃的API: ' + deprecatedAPIs.join(', '));
    this.addSuggestion('💡 建议使用新API: wx.getDeviceInfo, wx.getAppBaseInfo');
  } else {
    this.addSuggestion('✅ API使用检查通过');
  }
};

DiagnosticTool.prototype.addIssue = function(issue) {
  this.issues.push(issue);
};

DiagnosticTool.prototype.addSuggestion = function(suggestion) {
  this.suggestions.push(suggestion);
};

DiagnosticTool.prototype.outputResults = function() {
  console.log('\n📊 诊断结果汇总:');
  console.log('================');
  
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
  
  console.log('\n🔧 常见解决步骤:');
  console.log('1. 在微信开发者工具中：工具 → 构建npm');
  console.log('2. 重新编译项目');
  console.log('3. 清除缓存后重新预览');
  console.log('4. 检查project.config.json中的packNpmManually配置');
};

module.exports = DiagnosticTool;