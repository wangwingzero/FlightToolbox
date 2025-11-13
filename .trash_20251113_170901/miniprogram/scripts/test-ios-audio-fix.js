/**
 * iOS音频播放修复测试脚本
 * 
 * 用于验证FlightToolbox中iOS静音模式下音频播放修复的效果
 * 
 * 使用方法：
 * 1. 在微信开发者工具中打开小程序
 * 2. 在控制台中运行此脚本
 * 3. 查看测试结果和兼容性报告
 * 
 * @author FlightToolbox Team
 * @version 1.0.0
 */

console.log('🧪 开始iOS音频播放修复测试...');

// 测试1: 检查全局音频配置
function testGlobalAudioConfig() {
  console.log('\n🔊 测试1: 检查全局音频配置');
  
  try {
    // 检查是否设置了全局音频配置
    const systemInfo = wx.getSystemInfoSync();
    console.log('📱 设备信息:', {
      platform: systemInfo.platform,
      SDKVersion: systemInfo.SDKVersion,
      system: systemInfo.system
    });
    
    // 检查iOS音频配置标记
    const iosAudioConfigured = wx.getStorageSync('iosAudioConfigured');
    console.log('🍎 iOS音频配置状态:', iosAudioConfigured);
    
    // 检查兼容性报告
    const compatibilityReport = wx.getStorageSync('iosCompatibilityReport');
    if (compatibilityReport) {
      console.log('📋 兼容性报告:', compatibilityReport);
    }
    
    return {
      success: true,
      platform: systemInfo.platform,
      iosAudioConfigured: iosAudioConfigured,
      hasCompatibilityReport: !!compatibilityReport
    };
  } catch (error) {
    console.error('❌ 全局音频配置测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 测试2: 测试iOS兼容性工具
function testIOSCompatibilityTool() {
  console.log('\n🍎 测试2: 测试iOS兼容性工具');
  
  try {
    const IOSAudioCompatibility = require('./utils/ios-audio-compatibility.js');
    
    // 初始化兼容性工具
    const compatibilityStatus = IOSAudioCompatibility.init();
    console.log('✅ iOS兼容性工具初始化成功:', compatibilityStatus);
    
    // 获取用户友好状态
    const userStatus = IOSAudioCompatibility.getUserFriendlyStatus();
    console.log('👤 用户友好状态:', userStatus);
    
    // 获取兼容性报告
    const report = IOSAudioCompatibility.generateCompatibilityReport();
    console.log('📊 完整兼容性报告:', report);
    
    return {
      success: true,
      compatibilityStatus: compatibilityStatus,
      userStatus: userStatus,
      report: report
    };
  } catch (error) {
    console.error('❌ iOS兼容性工具测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 测试3: 模拟音频上下文创建
function testAudioContextCreation() {
  console.log('\n🎵 测试3: 模拟音频上下文创建');
  
  try {
    const IOSAudioCompatibility = require('./utils/ios-audio-compatibility.js');
    
    // 创建音频上下文
    const audioContext = wx.createInnerAudioContext();
    console.log('✅ 音频上下文创建成功');
    
    // 应用iOS兼容性配置
    const configSuccess = IOSAudioCompatibility.configureAudioContext(audioContext);
    console.log('🔧 iOS兼容性配置结果:', configSuccess);
    
    // 执行预播放激活
    IOSAudioCompatibility.preplayActivation(audioContext)
      .then(() => {
        console.log('✅ 预播放激活成功');
      })
      .catch((error) => {
        console.warn('⚠️ 预播放激活失败:', error);
      });
    
    // 执行诊断和修复
    const diagnosis = IOSAudioCompatibility.diagnoseAndFix(audioContext);
    console.log('🔍 诊断结果:', diagnosis);
    
    // 清理资源
    audioContext.destroy();
    
    return {
      success: true,
      configSuccess: configSuccess,
      diagnosis: diagnosis
    };
  } catch (error) {
    console.error('❌ 音频上下文创建测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 测试4: 验证修复预期效果
function validateFixEffectiveness() {
  console.log('\n🎯 测试4: 验证修复预期效果');
  
  const testResults = {
    globalConfig: testGlobalAudioConfig(),
    compatibilityTool: testIOSCompatibilityTool(),
    audioContext: testAudioContextCreation()
  };
  
  console.log('\n📊 测试结果汇总:');
  console.log('全局配置测试:', testResults.globalConfig.success ? '✅ 通过' : '❌ 失败');
  console.log('兼容性工具测试:', testResults.compatibilityTool.success ? '✅ 通过' : '❌ 失败');
  console.log('音频上下文测试:', testResults.audioContext.success ? '✅ 通过' : '❌ 失败');
  
  // 计算总体成功率
  const totalTests = 3;
  const passedTests = Object.values(testResults).filter(result => result.success).length;
  const successRate = (passedTests / totalTests) * 100;
  
  console.log('\n🏆 总体测试结果:');
  console.log(`通过率: ${successRate}% (${passedTests}/${totalTests})`);
  
  if (successRate === 100) {
    console.log('🎉 所有测试通过！iOS音频播放修复预期有效');
  } else if (successRate >= 66) {
    console.log('⚠️ 大部分测试通过，修复基本有效，可能需要微调');
  } else {
    console.log('❌ 多项测试失败，修复需要进一步完善');
  }
  
  // 提供真机测试建议
  console.log('\n📱 真机测试建议:');
  console.log('1. 在iOS设备上开启静音模式');
  console.log('2. 打开FlightToolbox小程序');
  console.log('3. 进入航线录音学习功能');
  console.log('4. 播放任意录音文件');
  console.log('5. 验证音频是否能正常播放');
  console.log('6. 检查播放按钮状态是否正常');
  
  return {
    totalTests: totalTests,
    passedTests: passedTests,
    successRate: successRate,
    testResults: testResults
  };
}

// 执行所有测试
function runAllTests() {
  console.log('🚀 开始执行iOS音频播放修复完整测试套件');
  
  try {
    const finalResults = validateFixEffectiveness();
    
    // 保存测试结果到本地存储
    wx.setStorageSync('iosAudioTestResults', {
      timestamp: new Date().toISOString(),
      results: finalResults
    });
    
    console.log('\n💾 测试结果已保存到本地存储');
    console.log('🔍 可通过 wx.getStorageSync("iosAudioTestResults") 查看');
    
    return finalResults;
  } catch (error) {
    console.error('❌ 测试执行过程中发生错误:', error);
    return { success: false, error: error.message };
  }
}

// 导出测试函数
module.exports = {
  testGlobalAudioConfig,
  testIOSCompatibilityTool,
  testAudioContextCreation,
  validateFixEffectiveness,
  runAllTests
};

// 自动运行测试（如果在控制台中直接执行此文件）
if (typeof window === 'undefined' && typeof global === 'undefined') {
  // 微信小程序环境
  setTimeout(() => {
    runAllTests();
  }, 1000);
}

console.log('🧪 iOS音频播放修复测试脚本加载完成');