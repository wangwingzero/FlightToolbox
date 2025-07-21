/**
 * 分包加载器测试脚本
 * 用于验证智能分包加载器是否正常工作
 */

var subpackageLoader = require('./subpackage-loader.js');

/**
 * 测试所有分包数据加载
 */
function testAllPackages() {
  console.log('🧪 开始测试智能分包加载器...');
  
  var testPackages = [
    { name: 'packageA', description: 'ICAO通信数据' },
    { name: 'packageB', description: '缩写数据' },
    { name: 'packageC', description: '机场数据' },
    { name: 'packageD', description: '定义数据' },
    { name: 'packageE', description: '规范性文件数据' }
  ];
  
  var testPromises = testPackages.map(function(pkg) {
    return testSinglePackage(pkg.name, pkg.description);
  });
  
  Promise.all(testPromises).then(function(results) {
    console.log('✅ 分包测试完成，结果汇总:');
    results.forEach(function(result, index) {
      var pkg = testPackages[index];
      console.log('📦 ' + pkg.name + ' (' + pkg.description + '): ' + 
                  (result.success ? '✅ 成功，数据量: ' + result.count : '❌ 失败'));
    });
    
    var successCount = results.filter(function(r) { return r.success; }).length;
    console.log('📊 总结: ' + successCount + '/' + testPackages.length + ' 个分包测试成功');
  }).catch(function(error) {
    console.error('❌ 测试过程出错:', error);
  });
}

/**
 * 测试单个分包
 */
function testSinglePackage(packageName, description) {
  return new Promise(function(resolve) {
    console.log('🔍 测试分包:', packageName, '-', description);
    
    subpackageLoader.loadSubpackageData(packageName, [])
      .then(function(data) {
        var success = Array.isArray(data) && data.length > 0;
        var count = success ? data.length : 0;
        
        console.log('  ' + (success ? '✅' : '⚠️') + ' ' + packageName + ': ' + 
                    (success ? '加载成功，数据量: ' + count : '加载为空或失败'));
        
        if (success && data.length > 0) {
          // 显示数据结构示例
          var sample = data[0];
          var sampleKeys = Object.keys(sample).slice(0, 3).join(', ');
          console.log('  📋 数据结构示例: {' + sampleKeys + ', ...}');
        }
        
        resolve({ success: success, count: count });
      })
      .catch(function(error) {
        console.warn('  ❌ ' + packageName + ' 加载失败:', error.message);
        resolve({ success: false, count: 0, error: error.message });
      });
  });
}

/**
 * 测试缓存功能
 */
function testCacheFunction() {
  console.log('🧪 测试缓存功能...');
  
  // 第一次加载
  subpackageLoader.loadSubpackageData('packageB', [])
    .then(function(data1) {
      console.log('  第一次加载完成，数据量:', data1.length);
      
      // 立即第二次加载（应该从缓存获取）
      var startTime = Date.now();
      return subpackageLoader.loadSubpackageData('packageB', [])
        .then(function(data2) {
          var loadTime = Date.now() - startTime;
          console.log('  第二次加载完成，耗时:', loadTime + 'ms');
          console.log('  缓存测试结果:', loadTime < 10 ? '✅ 缓存生效' : '⚠️ 缓存可能未生效');
          console.log('  数据一致性:', data1.length === data2.length ? '✅ 一致' : '❌ 不一致');
        });
    })
    .catch(function(error) {
      console.error('  ❌ 缓存测试失败:', error);
    });
}

/**
 * 检查分包加载器状态
 */
function checkLoaderStatus() {
  console.log('📊 分包加载器状态检查:');
  
  try {
    var cacheStatus = subpackageLoader.getCacheStatus();
    console.log('  缓存状态:', cacheStatus);
    
    // 检查环境
    var isDevTools = subpackageLoader.isDevTools;
    console.log('  运行环境:', isDevTools ? '开发者工具' : '真机环境');
    
    // 检查分包映射配置
    var packageMapping = subpackageLoader.packageMapping;
    console.log('  分包映射配置:');
    Object.keys(packageMapping).forEach(function(key) {
      var info = packageMapping[key];
      console.log('    ' + key + ' -> ' + info.name + ' (' + info.dataFile + ')');
    });
    
  } catch (error) {
    console.error('  ❌ 状态检查失败:', error);
  }
}

module.exports = {
  testAllPackages: testAllPackages,
  testSinglePackage: testSinglePackage,
  testCacheFunction: testCacheFunction,
  checkLoaderStatus: checkLoaderStatus,
  
  // 运行完整测试套件
  runFullTest: function() {
    console.log('🚀 开始完整的分包加载器测试...');
    checkLoaderStatus();
    setTimeout(function() {
      testAllPackages();
      setTimeout(function() {
        testCacheFunction();
      }, 2000);
    }, 1000);
  }
};