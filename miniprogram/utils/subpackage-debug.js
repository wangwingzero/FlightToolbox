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
    // 优先使用新的分离式API
    if (wx.getDeviceInfo) {
      var deviceInfo = wx.getDeviceInfo();
      info.platform = deviceInfo.platform;
      info.isDevTools = deviceInfo.platform === 'devtools';
    } else if (wx.getSystemInfoSync) {
      // 兜底使用旧API（静默警告，因为已知废弃）
      info.systemInfo = wx.getSystemInfoSync(); 
      info.platform = info.systemInfo.platform;
      info.isDevTools = info.platform === 'devtools';
    }
    
    // 获取窗口信息（如果需要）
    if (wx.getWindowInfo && !info.systemInfo) {
      var windowInfo = wx.getWindowInfo();
      info.systemInfo = Object.assign(info.systemInfo || {}, windowInfo);
    }
    
  } catch (error) {
    console.warn('环境检测异常:', error);
  }
  
  return info;
};

// 分包存在性检测（异步版本）
SubpackageDebugger.prototype.testSubpackageExists = function(packageName, dataFile, callback) {
  var testPath = '../' + packageName + '/' + dataFile;
  var result = {
    packageName: packageName,
    dataFile: dataFile,
    path: testPath,
    exists: false,
    error: null,
    dataPreview: null
  };
  
  var self = this;
  
  // 在开发环境中直接尝试require
  if (this._isDevEnvironment()) {
    try {
      var data = require(testPath);
      result.exists = true;
      result.dataPreview = self._getDataPreview(data);
    } catch (error) {
      result.error = '开发环境限制: ' + error.message;
    }
    callback && callback(result);
    return result;
  }
  
  // 生产环境：先尝试require，失败则认为分包未加载
  try {
    var data = require(testPath);
    result.exists = true;
    result.dataPreview = self._getDataPreview(data);
    callback && callback(result);
  } catch (error) {
    result.error = '分包可能未预加载: ' + error.message;
    callback && callback(result);
  }
  
  return result;
};

// 检测是否为开发环境
SubpackageDebugger.prototype._isDevEnvironment = function() {
  try {
    if (wx.getDeviceInfo) {
      return wx.getDeviceInfo().platform === 'devtools';
    } else if (wx.getSystemInfoSync) {
      return wx.getSystemInfoSync().platform === 'devtools';
    }
  } catch (error) {
    // 异常时假设为真机环境
  }
  return false;
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

// 完整诊断（支持异步callback）
SubpackageDebugger.prototype.fullDiagnostic = function(callback) {
  console.log('🔍 开始分包诊断...');
  
  var self = this;
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
    'packageCCAR': 'regulation.js'
  };
  
  var packageNames = Object.keys(packageMapping);
  var completedCount = 0;
  
  // 异步测试每个分包
  packageNames.forEach(function(packageName) {
    diagnostic.summary.totalPackages++;
    var dataFile = packageMapping[packageName];
    
    self.testSubpackageExists(packageName, dataFile, function(testResult) {
      diagnostic.packages[packageName] = testResult;
      
      if (testResult.exists) {
        diagnostic.summary.successfulPackages++;
        console.log('✅', packageName, '存在，数据量:', (testResult.dataPreview && testResult.dataPreview.length) || 'N/A');
      } else {
        diagnostic.summary.failedPackages++;
        console.log('❌', packageName, '不存在或无法访问:', testResult.error);
      }
      
      completedCount++;
      
      // 所有分包测试完成
      if (completedCount === packageNames.length) {
        // 输出诊断摘要
        console.log('📊 诊断摘要:');
        console.log('环境:', diagnostic.environment.platform);
        console.log('开发工具:', diagnostic.environment.isDevTools);
        console.log('wx.loadSubpackage可用:', diagnostic.environment.loadSubpackageAvailable);
        console.log('成功/总计:', diagnostic.summary.successfulPackages + '/' + diagnostic.summary.totalPackages);
        
        callback && callback(diagnostic);
      }
    });
  });
  
  // 返回初始诊断信息（异步完成前）
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