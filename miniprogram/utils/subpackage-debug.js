/**
 * 分包调试工具 - 帮助诊断分包加载问题
 */

function SubpackageDebugger() {
  this.testResults = {};
}

// 环境信息检测
SubpackageDebugger.prototype.detectEnvironment = function() {
  var info = {
    isDevTools: false,
    platform: 'unknown',
    loadSubpackageAvailable: typeof wx.loadSubpackage === 'function',
    wxConfig: typeof __wxConfig !== 'undefined',
    systemInfo: null
  };
  
  try {
    // 检测平台
    if (wx.getSystemInfoSync) {
      info.systemInfo = wx.getSystemInfoSync();
      info.platform = info.systemInfo.platform;
      info.isDevTools = info.platform === 'devtools';
    }
    
    if (wx.getDeviceInfo) {
      var deviceInfo = wx.getDeviceInfo();
      if (deviceInfo.platform === 'devtools') {
        info.isDevTools = true;
        info.platform = 'devtools';
      }
    }
  } catch (error) {
    console.warn('环境检测异常:', error);
  }
  
  return info;
};

// 分包存在性检测
SubpackageDebugger.prototype.testSubpackageExists = function(packageName, dataFile) {
  var testPath = '../' + packageName + '/' + dataFile;
  var result = {
    packageName: packageName,
    dataFile: dataFile,
    path: testPath,
    exists: false,
    error: null,
    dataPreview: null
  };
  
  try {
    var data = require(testPath);
    result.exists = true;
    result.dataPreview = this._getDataPreview(data);
  } catch (error) {
    result.error = error.message;
  }
  
  return result;
};

// 获取数据预览
SubpackageDebugger.prototype._getDataPreview = function(data) {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return {
      type: 'array',
      length: data.length,
      firstItem: data[0] || null
    };
  }
  
  if (typeof data === 'object') {
    var keys = Object.keys(data);
    return {
      type: 'object',
      keys: keys,
      firstKey: keys[0] || null,
      firstValue: data[keys[0]] || null
    };
  }
  
  return {
    type: typeof data,
    value: data
  };
};

// 完整诊断
SubpackageDebugger.prototype.fullDiagnostic = function() {
  console.log('🔍 开始分包诊断...');
  
  var diagnostic = {
    environment: this.detectEnvironment(),
    packages: {},
    summary: {
      totalPackages: 0,
      successfulPackages: 0,
      failedPackages: 0
    }
  };
  
  // 测试各个分包
  var packageMapping = {
    'packageA': 'icao900.js',
    'packageB': 'abbreviations.js', 
    'packageC': 'airportdata.js',
    'packageD': 'definitions.js',
    'packageE': 'data.js'
  };
  
  for (var packageName in packageMapping) {
    diagnostic.summary.totalPackages++;
    var dataFile = packageMapping[packageName];
    var testResult = this.testSubpackageExists(packageName, dataFile);
    diagnostic.packages[packageName] = testResult;
    
    if (testResult.exists) {
      diagnostic.summary.successfulPackages++;
      console.log('✅', packageName, '存在，数据量:', testResult.dataPreview.length || 'N/A');
    } else {
      diagnostic.summary.failedPackages++;
      console.log('❌', packageName, '不存在或无法访问:', testResult.error);
    }
  }
  
  // 输出诊断摘要
  console.log('📊 诊断摘要:');
  console.log('环境:', diagnostic.environment.platform);
  console.log('开发工具:', diagnostic.environment.isDevTools);
  console.log('wx.loadSubpackage可用:', diagnostic.environment.loadSubpackageAvailable);
  console.log('成功/总计:', diagnostic.summary.successfulPackages + '/' + diagnostic.summary.totalPackages);
  
  return diagnostic;
};

// 测试wx.loadSubpackage
SubpackageDebugger.prototype.testLoadSubpackage = function(packageName, callback) {
  if (typeof wx.loadSubpackage !== 'function') {
    console.log('wx.loadSubpackage 不可用');
    callback && callback(false, 'API不可用');
    return;
  }
  
  console.log('测试wx.loadSubpackage:', packageName);
  
  wx.loadSubpackage({
    name: packageName,
    success: function() {
      console.log('✅ wx.loadSubpackage 成功:', packageName);
      callback && callback(true, null);
    },
    fail: function(error) {
      console.log('❌ wx.loadSubpackage 失败:', packageName, error);
      callback && callback(false, error);
    }
  });
};

// 创建全局实例
var subpackageDebugger = new SubpackageDebugger();

module.exports = subpackageDebugger;