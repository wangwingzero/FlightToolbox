// app.ts
// 🔇 系统级错误过滤器 - 必须在所有代码之前运行
(function() {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // 检查是否为系统视图管理错误
    const message = args.join(' ');
    if (message && typeof message === 'string') {
      // 过滤掉系统内部的视图管理错误
      if (message.indexOf('removeImageView:fail') !== -1 ||
          message.indexOf('removeTextView:fail') !== -1 ||
          message.indexOf('appServiceSDKScriptError') !== -1 ||
          (message.indexOf('not found') !== -1 && message.indexOf('View:fail') !== -1)) {
        // 静默处理，不输出到控制台
        return;
      }
    }
    // 其他错误正常输出
    originalConsoleError.apply(console, args);
  };
})();

const subpackageLoader = require('./utils/subpackage-loader.js')
const subpackageDebugger = require('./utils/subpackage-debug.js')

const WarningHandler = require('./utils/warning-handler.js')
const ErrorHandler = require('./utils/error-handler.js')
const AdManager = require('./utils/ad-manager.js')
const AppConfig = require('./utils/app-config.js')

// 🎯 版本信息自动化：从自动生成的版本文件导入
// 更新方式：修改package.json的version字段，然后运行 npm run generate-version
const versionInfo = require('./utils/version.js')
const APP_VERSION = versionInfo.version
const BUILD_DATE = versionInfo.buildDate

// Define IAppOption interface locally
App({
  globalData: {
    userInfo: null,
    theme: 'light', // 固定浅色模式
    dataPreloadStarted: false,
    dataPreloadCompleted: false,
    // 版本信息
    version: APP_VERSION,
    buildDate: BUILD_DATE,
    // 资料查询详情页面数据存储
    selectedAbbreviation: null,
    selectedDefinition: null,
    selectedAirport: null,
    selectedCommunication: null,
    selectedRegulation: null
  },

  onLaunch() {
    console.log('🚀 FlightToolbox v' + APP_VERSION + ' 启动')
    console.log('📅 构建日期: ' + BUILD_DATE)
    console.log('✨ 新功能: 支持中文机场名称输入')
    
    // 🔊 iOS音频播放修复：全局音频配置（必须在应用启动时设置）
    this.initGlobalAudioConfig()
    
    // 🎯 基于Context7最佳实践：初始化警告处理器
    // 过滤开发环境中的无害警告，提升开发体验
    WarningHandler.init()
    WarningHandler.checkEnvironment()
    
    // 🎯 统一初始化广告管理器 - 避免各页面重复初始化
    // 注意：激励视频广告功能已移除，AdManager为空实现
    AdManager.init({
      debug: false // 生产环境关闭调试
    })
    
    // 🎯 新增：初始化主题管理器
    this.initThemeManager()
    
    // 延迟显示警告说明，避免与启动日志混淆
    setTimeout(() => {
      WarningHandler.showWarningExplanation()
    }, 1000)
    
    // 获取设备信息（兼容方式）
    try {
      console.log('设备信息: WeChat MiniProgram Environment')
    } catch (error) {
      console.warn('获取系统信息失败:', error)
    }
    
    // 获取启动场景
    const launchOptions = wx.getLaunchOptionsSync()
    console.log('启动场景:', launchOptions)
    
    // 初始化网络监听
    this.initNetworkMonitoring()
    
    
    
    // 延迟预加载数据，避免影响启动性能
    setTimeout(() => {
      // 运行分包诊断
      console.log('🔍 运行分包诊断...')
      subpackageDebugger.fullDiagnostic(function(diagnostic) {
        console.log('📋 分包诊断完成，结果:', diagnostic.summary)
      })
      
      this.preloadQueryData()
    }, 2000) // 2秒后开始预加载

    // 🚀 离线优先：积极预加载所有分包数据
    setTimeout(() => {
      ErrorHandler.aggressivePreloadAll()
    }, 5000) // 5秒后开始积极预加载

    // 📱 监听网络状态变化，有网络时补充缺失数据
    wx.onNetworkStatusChange((res) => {
      if (res.isConnected) {
        console.log('📶 网络已连接，检查并补充缺失数据')
        setTimeout(() => {
          ErrorHandler.checkAndFillMissingPackages()
        }, 1000)
      }
    })



    // 检查是否是首次使用
    const hasShownDisclaimer = wx.getStorageSync('hasShownDisclaimer');
    
    if (!hasShownDisclaimer) {
      // 延迟一下确保页面加载完成
      setTimeout(() => {
        this.showDisclaimerDialog();
      }, 1000);
    }
  },

  onShow() {
    console.log('App Show')
    
  },


  onHide() {
    console.log('App Hide')
  },

  onError(error) {
    console.error('App Error:', error)
    // 使用错误处理工具记录错误
    ErrorHandler.logError('app_error', error)
  },



  // 预加载资料查询数据
  async preloadQueryData() {
    if (this.globalData.dataPreloadStarted) {
      return
    }
    
    this.globalData.dataPreloadStarted = true
    console.log('🚀 开始预加载资料查询数据...')
    
    try {
      // 并行预加载所有数据，但不阻塞主流程 - 使用新的智能分包加载器
      const preloadPromises = [
        this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageB', []), 'abbreviations', 15000),
        this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageD', []), 'definitions', 15000),
        this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageC', []), 'airports', 15000),
        this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageA', []), 'icao', 20000),
        this.preloadWithTimeout(subpackageLoader.loadSubpackageData('packageCCAR', []), 'normatives', 15000)
      ]
      
      // 等待所有预加载完成（或超时）- ES5兼容方式
      const results = [];
      for (let i = 0; i < preloadPromises.length; i++) {
        try {
          const result = await preloadPromises[i];
          results.push({ status: 'fulfilled', value: result });
        } catch (error) {
          results.push({ status: 'rejected', reason: error });
        }
      }
      
      this.globalData.dataPreloadCompleted = true
      console.log('✅ 资料查询数据预加载完成')
      
      // 通知页面数据已预加载完成
      wx.setStorageSync('queryDataPreloaded', true)
      
    } catch (error) {
      console.error('❌ 数据预加载失败:', error)
    }
  },

  // 带超时的预加载
  async preloadWithTimeout(promise, dataType, timeout) {
    try {
      const result = await Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`${dataType} 预加载超时`)), timeout)
        )
      ])
      console.log(`✅ ${dataType} 数据预加载成功`)
      return result
    } catch (error) {
      console.warn(`⚠️ ${dataType} 数据预加载失败:`, error)
      return null
    }
  },

  // 检查数据是否已预加载
  isDataPreloaded() {
    return this.globalData.dataPreloadCompleted || wx.getStorageSync('queryDataPreloaded')
  },

  // 获取预加载状态
  getPreloadStatus() {
    return {
      started: this.globalData.dataPreloadStarted,
      completed: this.globalData.dataPreloadCompleted,
      cacheStatus: subpackageLoader.getCacheStatus()
    }
  },


  // 🎯 新增：初始化主题管理器
  initThemeManager() {
    try {
      console.log('💡 已设置为固定浅色模式')
      
      // 设置固定浅色主题
      this.globalData.theme = 'light'
      
      console.log('✅ 应用已配置为固定浅色模式')
    } catch (error) {
      console.warn('⚠️ 主题管理器初始化失败:', error)
    }
  },

  // 初始化网络监听
  initNetworkMonitoring() {
    console.log('🌐 初始化网络监听...')
    
    // 获取当前网络状态
    wx.getNetworkType({
      success: (res) => {
        console.log('当前网络类型:', res.networkType)
        wx.setStorageSync('lastNetworkType', res.networkType)
      },
      fail: (err) => {
        console.warn('获取网络状态失败:', err)
        wx.setStorageSync('lastNetworkType', 'unknown')
      }
    })
    
    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      console.log('网络状态变化:', {
        isConnected: res.isConnected,
        networkType: res.networkType
      })
      
      wx.setStorageSync('lastNetworkType', res.networkType)
    })
  },

  // 🔊 iOS音频播放修复：全局音频配置
  initGlobalAudioConfig() {
    console.log('🔊 初始化全局音频配置（iOS静音兼容）');
    
    try {
      // 检查微信版本是否支持
      const systemInfo = wx.getSystemInfoSync();
      const SDKVersion = systemInfo.SDKVersion;
      const platform = systemInfo.platform;
      
      console.log('📱 设备信息:', { platform: platform, SDKVersion: SDKVersion });
      
      // 基础库版本检查（wx.setInnerAudioOption需要2.3.0+）
      if (this.compareVersion(SDKVersion, '2.3.0') >= 0) {
        // iOS设备特殊配置
        const isIOS = platform === 'ios';
        const audioConfig = {
          obeyMuteSwitch: false,    // iOS下即使静音模式也能播放（航空安全需求）
          mixWithOther: false,      // 不与其他音频混播，确保飞行安全
          speakerOn: true,          // 强制使用扬声器播放
          // iOS特殊配置
          ...(isIOS && {
            // iOS设备可能需要的额外配置
            autoplay: false,         // 禁用自动播放，避免iOS限制
          })
        };
        
        console.log('🔊 音频配置:', audioConfig);
        
        wx.setInnerAudioOption({
          ...audioConfig,
          success: (res) => {
            console.log('✅ 全局音频配置成功（iOS静音兼容）');
            console.log('🔊 配置详情：obeyMuteSwitch=false, mixWithOther=false, speakerOn=true');
            
            // iOS设备额外验证
            if (isIOS) {
              console.log('🍎 iOS设备音频配置已优化');
              // 存储配置状态供音频播放页面使用
              wx.setStorageSync('iosAudioConfigured', true);
            }
          },
          fail: (err) => {
            console.warn('⚠️ 全局音频配置失败:', err);
            // 失败时尝试基础配置
            this.initBasicAudioConfig();
          },
          complete: () => {
            console.log('🔊 音频配置设置完成');
          }
        });
      } else {
        console.warn('⚠️ 微信版本过低，不支持高级音频配置，使用基础配置');
        this.initBasicAudioConfig();
      }
      
    } catch (error) {
      console.error('❌ 音频配置初始化失败，将使用默认配置:', error);
      // 标记配置失败状态，供后续功能使用
      this.globalData.audioConfigFailed = true;
      this.initBasicAudioConfig();
    }
  },
  
  // 基础音频配置（兼容旧版本）
  initBasicAudioConfig() {
    try {
      wx.setInnerAudioOption({
        obeyMuteSwitch: false,
        success: () => {
          console.log('✅ 基础音频配置成功');
        },
        fail: (err) => {
          console.warn('⚠️ 基础音频配置也失败:', err);
        }
      });
    } catch (error) {
      console.warn('⚠️ 基础音频配置异常:', error);
    }
  },
  
  // 版本比较工具
  compareVersion(v1, v2) {
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

  // 新用户免责声明弹窗
  showDisclaimerDialog() {
    wx.showModal({
      title: '重要声明',
      content: '本小程序旨在帮助飞行员学习航空理论知识，包括性能计算、概念理解、规章条例等内容。\n\n但请注意：所有计算逻辑均基于作者个人理解编写，可能存在错误且未经官方验证。\n\n因此，本小程序所有数据仅供学习参考，严禁用于实际飞行操作！',
      showCancel: false,
      confirmText: '我已知晓',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          // 标记已显示过免责声明
          wx.setStorageSync('hasShownDisclaimer', true);
        }
      }
    });
  }
})