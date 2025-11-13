/**
 * iOS音频播放问题快速诊断工具
 * 
 * 用于快速诊断和修复iOS静音模式下音频播放问题
 * 在微信开发者工具控制台中运行此脚本
 * 
 * @author FlightToolbox Team
 * @version 1.0.0
 */

console.log('🍎 iOS音频播放问题快速诊断工具启动...');

// 快速诊断函数
function quickDiagnosis() {
  console.log('\n🔍 开始iOS音频快速诊断');
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    device: {},
    audioConfig: {},
    compatibility: {},
    issues: [],
    recommendations: []
  };
  
  try {
    // 1. 设备信息检测
    const __di = (typeof wx.getDeviceInfo === 'function') ? (wx.getDeviceInfo() || {}) : {};
    const __abi = (typeof wx.getAppBaseInfo === 'function') ? (wx.getAppBaseInfo() || {}) : {};
    const __si = (typeof wx.getSystemInfoSync === 'function') ? (wx.getSystemInfoSync() || {}) : {};
    diagnosis.device = {
      platform: __di.platform || __abi.platform || __si.platform,
      system: __di.system || __si.system,
      SDKVersion: __abi.SDKVersion || __abi.hostVersion || __si.SDKVersion,
      brand: __di.brand || __si.brand,
      model: __di.model || __si.model
    };
    
    console.log('📱 设备信息:', diagnosis.device);
    
    // 2. 音频配置检查
    diagnosis.audioConfig = {
      iosAudioConfigured: wx.getStorageSync('iosAudioConfigured') || false,
      compatibilityReport: wx.getStorageSync('iosCompatibilityReport') || null
    };
    
    console.log('🔊 音频配置状态:', diagnosis.audioConfig);
    
    // 3. iOS兼容性检查
    if (diagnosis.device.platform === 'ios') {
      console.log('🍎 检测到iOS设备');
      
      // 检查兼容性报告
      if (diagnosis.audioConfig.compatibilityReport) {
        diagnosis.compatibility = diagnosis.audioConfig.compatibilityReport.compatibility;
        console.log('📊 兼容性状态:', diagnosis.compatibility);
      }
      
      // iOS设备特殊检查
      if (!diagnosis.audioConfig.iosAudioConfigured) {
        diagnosis.issues.push('iOS音频配置未生效');
        diagnosis.recommendations.push('重新启动应用以确保音频配置生效');
      }
      
      if (diagnosis.compatibility.compatibleVersion === false) {
        diagnosis.issues.push('微信版本过低');
        diagnosis.recommendations.push('升级微信客户端到最新版本');
      }
      
    } else {
      console.log('📱 非iOS设备，iOS音频问题不适用');
      diagnosis.recommendations.push('当前为非iOS设备，无需特殊处理');
    }
    
    // 4. 生成诊断报告
    console.log('\n📋 诊断报告:');
    console.log('设备平台:', diagnosis.device.platform);
    console.log('发现问题数量:', diagnosis.issues.length);
    console.log('建议数量:', diagnosis.recommendations.length);
    
    if (diagnosis.issues.length > 0) {
      console.log('\n❌ 发现的问题:');
      diagnosis.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    if (diagnosis.recommendations.length > 0) {
      console.log('\n💡 建议:');
      diagnosis.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    // 5. 保存诊断结果
    wx.setStorageSync('iosAudioQuickDiagnosis', diagnosis);
    console.log('\n💾 诊断结果已保存到本地存储');
    
    return diagnosis;
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
    diagnosis.issues.push('诊断过程出错: ' + error.message);
    return diagnosis;
  }
}

// 快速修复函数
function quickFix() {
  console.log('\n🔧 开始iOS音频快速修复');
  
  try {
    // 1. 重新设置全局音频配置
    console.log('🔧 重新设置全局音频配置...');
    wx.setInnerAudioOption({
      obeyMuteSwitch: false,
      mixWithOther: false,
      speakerOn: true,
      success: () => {
        console.log('✅ 全局音频配置设置成功');
        wx.setStorageSync('iosAudioConfigured', true);
      },
      fail: (err) => {
        console.warn('⚠️ 全局音频配置设置失败:', err);
      }
    });
    
    // 2. 清理兼容性缓存（强制重新初始化）
    console.log('🔧 清理兼容性缓存...');
    try {
      wx.removeStorageSync('iosCompatibilityReport');
      console.log('✅ 兼容性缓存已清理');
    } catch (error) {
      console.warn('⚠️ 清理兼容性缓存失败:', error);
    }
    
    // 3. 重置音频状态
    console.log('🔧 重置音频状态...');
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (currentPage && currentPage.route && currentPage.route.includes('audio-player')) {
      console.log('✅ 检测到音频播放页面，尝试重置音频状态');
      
      // 通知页面重置音频状态
      if (typeof currentPage.resetAudioState === 'function') {
        currentPage.resetAudioState();
      } else if (currentPage.data && currentPage.data.audioContext) {
        // 销毁现有音频上下文
        try {
          currentPage.data.audioContext.destroy();
          currentPage.data.audioContext = null;
          currentPage.setData({ isPlaying: false });
          console.log('✅ 音频上下文已重置');
        } catch (error) {
          console.warn('⚠️ 音频上下文重置失败:', error);
        }
      }
    } else {
      console.log('ℹ️ 当前不在音频播放页面，请手动导航到录音播放页面测试');
    }
    
    console.log('\n✅ 快速修复完成');
    console.log('💡 建议：重新进入录音播放页面测试音频播放功能');
    
    wx.showToast({
      title: '修复完成，请重新测试',
      icon: 'success',
      duration: 2000
    });
    
  } catch (error) {
    console.error('❌ 快速修复过程中发生错误:', error);
    wx.showToast({
      title: '修复失败，请查看控制台',
      icon: 'none',
      duration: 2000
    });
  }
}

// 测试音频播放函数
function testAudioPlayback() {
  console.log('\n🧪 开始音频播放测试');
  
  try {
    // 创建测试音频上下文
    const testAudioContext = wx.createInnerAudioContext();
    
    // 设置测试音频源（使用一个简单的音频文件）
    testAudioContext.src = '/packageJapan/japan_atc_1.mp3'; // 示例路径
    testAudioContext.volume = 0.5; // 50%音量
    
    console.log('🧪 测试音频源:', testAudioContext.src);
    
    // 绑定测试事件
    testAudioContext.onPlay(() => {
      console.log('✅ 测试音频开始播放');
      
      // 播放1秒后停止
      setTimeout(() => {
        testAudioContext.stop();
        console.log('✅ 测试音频播放完成');
        
        wx.showToast({
          title: '音频播放测试成功',
          icon: 'success',
          duration: 1500
        });
      }, 1000);
    });
    
    testAudioContext.onError((error) => {
      console.error('❌ 测试音频播放失败:', error);
      
      wx.showToast({
        title: '音频播放测试失败',
        icon: 'none',
        duration: 2000
      });
    });
    
    // 开始测试播放
    testAudioContext.play();
    console.log('🧪 测试音频播放已启动');
    
  } catch (error) {
    console.error('❌ 音频播放测试失败:', error);
    wx.showToast({
      title: '测试失败，请查看控制台',
      icon: 'none',
      duration: 2000
    });
  }
}

// 导出函数
module.exports = {
  quickDiagnosis,
  quickFix,
  testAudioPlayback
};

// 自动运行诊断（如果在控制台中直接执行此文件）
if (typeof window === 'undefined' && typeof global === 'undefined') {
  // 微信小程序环境
  console.log('🍎 iOS音频诊断工具加载完成');
  console.log('💡 可用命令:');
  console.log('  quickDiagnosis() - 快速诊断');
  console.log('  quickFix() - 快速修复');
  console.log('  testAudioPlayback() - 测试音频播放');
  
  // 自动运行一次诊断
  setTimeout(() => {
    quickDiagnosis();
  }, 1000);
}

console.log('🍎 iOS音频播放问题快速诊断工具加载完成');