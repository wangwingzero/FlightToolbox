/**
 * iOS音频兼容性工具类
 * 
 * 专门解决iOS设备在静音模式下的音频播放问题
 * 确保FlightToolbox在iOS设备的任何模式下都能可靠播放音频
 * 
 * @author FlightToolbox Team
 * @version 1.0.0
 */

const IOSAudioCompatibility = {
  // 设备信息缓存
  deviceInfo: null,
  
  // 兼容性状态
  compatibilityStatus: {
    isIOS: false,
    audioConfigured: false,
    preplayActivated: false,
    useWebAudio: false,
    compatibleVersion: true
  },
  
  // 兼容性检查结果缓存
  compatibilityCache: new Map(),
  
  // 缓存过期时间（毫秒）
  CACHE_EXPIRY_TIME: 30 * 60 * 1000, // 30分钟
  
  /**
   * 初始化iOS音频兼容性
   */
  init: function() {
    console.log('🍎 iOS音频兼容性工具初始化');
    
    // 检测设备信息
    this.detectDeviceInfo();
    
    // 检查音频配置状态
    this.checkAudioConfigStatus();
    
    // 输出兼容性报告
    this.generateCompatibilityReport();
    
    return this.compatibilityStatus;
  },
  
  /**
   * 获取缓存的兼容性检查结果
   */
  getCachedCompatibility: function(deviceInfo) {
    const cacheKey = this.generateCacheKey(deviceInfo);
    const cached = this.compatibilityCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_EXPIRY_TIME) {
      console.log('🍎 使用缓存的兼容性检查结果');
      return cached.data;
    }
    
    return null;
  },
  
  /**
   * 缓存兼容性检查结果
   */
  setCachedCompatibility: function(deviceInfo, compatibilityData) {
    const cacheKey = this.generateCacheKey(deviceInfo);
    
    this.compatibilityCache.set(cacheKey, {
      data: compatibilityData,
      timestamp: Date.now()
    });
    
    console.log('🍎 兼容性检查结果已缓存');
  },
  
  /**
   * 生成缓存键
   */
  generateCacheKey: function(deviceInfo) {
    return `${deviceInfo.platform}_${deviceInfo.SDKVersion}_${deviceInfo.system}`;
  },
  
  /**
   * 清理过期缓存
   */
  cleanExpiredCache: function() {
    const now = Date.now();
    const expiredKeys = [];
    
    this.compatibilityCache.forEach((value, key) => {
      if (now - value.timestamp >= this.CACHE_EXPIRY_TIME) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.compatibilityCache.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      console.log(`🍎 清理了${expiredKeys.length}个过期缓存项`);
    }
  },
  
  /**
   * 检测设备信息
   */
  detectDeviceInfo: function() {
    try {
      // 引入统一工具函数
      const Utils = require('./common-utils.js');
      
      const systemInfo = Utils.deviceDetection.getDeviceInfo();
      
      this.deviceInfo = {
        platform: systemInfo.platform,
        system: systemInfo.system,
        SDKVersion: systemInfo.SDKVersion,
        version: systemInfo.version,
        model: systemInfo.model,
        brand: systemInfo.brand,
        pixelRatio: systemInfo.pixelRatio,
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight
      };
      
      this.compatibilityStatus.isIOS = Utils.deviceDetection.isIOS();
      
      console.log('📱 设备信息检测完成:', this.deviceInfo);
      console.log('🍎 iOS设备检测结果:', this.compatibilityStatus.isIOS);
      
    } catch (error) {
      console.error('❌ 设备信息检测失败:', error);
      this.compatibilityStatus.isIOS = false;
    }
  },
  
  /**
   * 检查音频配置状态
   */
  checkAudioConfigStatus: function() {
    try {
      // 引入统一工具函数
      const Utils = require('./common-utils.js');
      
      // 检查全局音频配置是否已完成
      const audioConfigured = Utils.storage.getItem('iosAudioConfigured', false);
      this.compatibilityStatus.audioConfigured = audioConfigured;
      
      // 检查微信版本兼容性
      const SDKVersion = this.deviceInfo ? this.deviceInfo.SDKVersion : '0.0.0';
      this.compatibilityStatus.compatibleVersion = Utils.isVersionAtLeast(SDKVersion, '2.3.0');
      
      console.log('🔊 音频配置状态检查:', {
        audioConfigured: audioConfigured,
        compatibleVersion: this.compatibilityStatus.compatibleVersion,
        SDKVersion: SDKVersion
      });
      
    } catch (error) {
      console.error('❌ 音频配置状态检查失败:', error);
    }
  },
  
  /**
   * 生成兼容性报告
   */
  generateCompatibilityReport: function() {
    const report = {
      device: this.deviceInfo,
      compatibility: this.compatibilityStatus,
      recommendations: this.getRecommendations()
    };
    
    console.log('📋 iOS音频兼容性报告:', report);
    
    // 存储报告供调试使用
    try {
      wx.setStorageSync('iosCompatibilityReport', report);
    } catch (error) {
      console.warn('⚠️ 兼容性报告存储失败:', error);
    }
    
    return report;
  },
  
  /**
   * 获取兼容性建议
   */
  getRecommendations: function() {
    const recommendations = [];
    
    if (!this.compatibilityStatus.isIOS) {
      recommendations.push('非iOS设备，无需特殊处理');
      return recommendations;
    }
    
    if (!this.compatibilityStatus.compatibleVersion) {
      recommendations.push('升级微信客户端到最新版本以获得最佳音频体验');
    }
    
    if (!this.compatibilityStatus.audioConfigured) {
      recommendations.push('建议重新启动应用以确保音频配置生效');
    }
    
    if (this.compatibilityStatus.isIOS) {
      recommendations.push('iOS设备：音频将在静音模式下正常播放');
      recommendations.push('如遇问题，请检查：设置-声音-静音模式下的振动');
    }
    
    return recommendations;
  },
  
  /**
   * 为音频上下文应用iOS兼容性配置
   */
  configureAudioContext: function(audioContext) {
    if (!audioContext) {
      console.error('❌ 音频上下文为空，无法配置');
      return false;
    }
    
    if (!this.compatibilityStatus.isIOS) {
      console.log('📱 非iOS设备，使用标准配置');
      return true;
    }
    
    try {
      console.log('🍎 为iOS设备配置音频上下文');
      
      // iOS特殊配置
      audioContext.autoplay = false;
      audioContext.loop = false;
      
      // 强制使用扬声器（iOS重要）
      if (audioContext.playbackRate !== undefined) {
        // 保持正常播放速率
        audioContext.playbackRate = 1;
      }
      
      console.log('✅ iOS音频上下文配置完成');
      return true;
      
    } catch (error) {
      console.error('❌ iOS音频上下文配置失败:', error);
      return false;
    }
  },
  
  /**
   * 预播放激活（解决iOS首次播放无声音问题）
   */
  preplayActivation: function(audioContext) {
    return new Promise((resolve, reject) => {
      if (!audioContext) {
        reject(new Error('音频上下文为空'));
        return;
      }
      
      if (!this.compatibilityStatus.isIOS) {
        console.log('📱 非iOS设备，无需预播放激活');
        resolve(true);
        return;
      }
      
      // 🍎 增强：每次都尝试预播放激活，确保静音模式兼容性
      console.log('🍎 开始iOS预播放激活（静音模式兼容）');
      
      try {
        const originalVolume = audioContext.volume || 1;
        const originalSrc = audioContext.src;
        
        // 🍎 关键修复：静音预播放 + 强制音频通道激活
        audioContext.volume = 0;
        
        // 🍎 增强预播放策略：多次短促播放确保音频通道激活
        const preplaySequence = () => {
          console.log('🍎 执行iOS预播放序列');
          
          // 第一次短促播放
          audioContext.play();
          
          setTimeout(() => {
            try {
              audioContext.pause();
              
              // 第二次短促播放（确保激活）
              setTimeout(() => {
                audioContext.play();
                
                setTimeout(() => {
                  try {
                    audioContext.pause();
                    audioContext.volume = originalVolume;
                    
                    if (originalSrc && audioContext.src !== originalSrc) {
                      audioContext.src = originalSrc;
                    }
                    
                    this.compatibilityStatus.preplayActivated = true;
                    console.log('✅ iOS预播放激活完成（静音模式兼容）');
                    
                    resolve(true);
                  } catch (error) {
                    console.error('❌ iOS预播放激活清理失败:', error);
                    reject(error);
                  }
                }, 50);
              }, 50);
            } catch (error) {
              console.error('❌ iOS预播放序列中断:', error);
              reject(error);
            }
          }, 50);
        };
        
        // 🍎 添加全局音频配置重试（针对静音模式）
        if (wx.setInnerAudioOption) {
          wx.setInnerAudioOption({
            obeyMuteSwitch: false,
            speakerOn: true,
            success: () => {
              console.log('🍎 全局音频配置重设成功，开始预播放');
              preplaySequence();
            },
            fail: (err) => {
              console.warn('⚠️ 全局音频配置重设失败，继续预播放:', err);
              preplaySequence();
            }
          });
        } else {
          preplaySequence();
        }
        
      } catch (error) {
        console.error('❌ iOS预播放激活失败:', error);
        reject(error);
      }
    });
  },
  
  /**
   * 检查并修复音频播放问题
   */
  diagnoseAndFix: function(audioContext) {
    console.log('🔍 开始iOS音频播放诊断和修复');
    
    const diagnosis = {
      issues: [],
      fixes: [],
      status: 'unknown'
    };
    
    // 检查设备兼容性
    if (!this.compatibilityStatus.isIOS) {
      diagnosis.status = 'no_ios';
      diagnosis.issues.push('非iOS设备，无需特殊处理');
      return diagnosis;
    }
    
    // 检查音频配置
    if (!this.compatibilityStatus.audioConfigured) {
      diagnosis.issues.push('全局音频配置未生效');
      diagnosis.fixes.push('重新设置全局音频配置');
      
      try {
        wx.setInnerAudioOption({
          obeyMuteSwitch: false,
          mixWithOther: false,
          speakerOn: true,
          success: () => {
            console.log('✅ 诊断修复：全局音频配置重新设置成功');
            this.compatibilityStatus.audioConfigured = true;
          },
          fail: (err) => {
            console.warn('⚠️ 诊断修复：全局音频配置重新设置失败', err);
          }
        });
      } catch (error) {
        console.error('❌ 诊断修复：全局音频配置异常', error);
      }
    }
    
    // 检查音频上下文
    if (audioContext) {
      // 应用兼容性配置
      const configSuccess = this.configureAudioContext(audioContext);
      if (configSuccess) {
        diagnosis.fixes.push('音频上下文已配置iOS兼容性');
      } else {
        diagnosis.issues.push('音频上下文配置失败');
      }
      
      // 执行预播放激活
      this.preplayActivation(audioContext)
        .then(() => {
          diagnosis.fixes.push('预播放激活完成');
        })
        .catch((error) => {
          diagnosis.issues.push('预播放激活失败: ' + error.message);
        });
    }
    
    // 确定诊断状态
    if (diagnosis.issues.length === 0) {
      diagnosis.status = 'healthy';
    } else if (diagnosis.fixes.length > 0) {
      diagnosis.status = 'fixed';
    } else {
      diagnosis.status = 'issues';
    }
    
    console.log('📋 iOS音频诊断完成:', diagnosis);
    return diagnosis;
  },
  
  /**
   * 获取用户友好的状态信息
   */
  getUserFriendlyStatus: function() {
    if (!this.compatibilityStatus.isIOS) {
      return {
        title: '音频系统正常',
        message: '您的设备支持标准音频播放',
        type: 'success'
      };
    }
    
    if (this.compatibilityStatus.audioConfigured && this.compatibilityStatus.preplayActivated) {
      return {
        title: 'iOS音频优化已启用',
        message: '静音模式下也能正常播放音频',
        type: 'success'
      };
    }
    
    if (!this.compatibilityStatus.compatibleVersion) {
      return {
        title: '建议升级微信',
        message: '升级到最新版本以获得更好的音频体验',
        type: 'warning'
      };
    }
    
    return {
      title: 'iOS音频兼容性',
      message: '正在优化音频播放设置...',
      type: 'info'
    };
  },
  
  /**
   * 版本比较工具
   */
  compareVersion: function(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);
    
    while (v1.length < len) {
      v1.push('0');
    }
    while (v2.length < len) {
      v2.push('0');
    }
    
    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i]);
      const num2 = parseInt(v2[i]);
      
      if (num1 > num2) {
        return 1;
      }
      if (num1 < num2) {
        return -1;
      }
    }
    return 0;
  },
  
  /**
   * 重置兼容性状态（用于调试）
   */
  reset: function() {
    console.log('🔄 重置iOS音频兼容性状态');
    
    this.compatibilityStatus = {
      isIOS: false,
      audioConfigured: false,
      preplayActivated: false,
      useWebAudio: false,
      compatibleVersion: true
    };
    
    try {
      wx.removeStorageSync('iosAudioConfigured');
      wx.removeStorageSync('iosCompatibilityReport');
    } catch (error) {
      console.warn('⚠️ 清理兼容性缓存失败:', error);
    }
    
    // 重新初始化
    return this.init();
  }
};

module.exports = IOSAudioCompatibility;