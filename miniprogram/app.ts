// app.ts
// 系统级错误过滤器 - 必须在所有代码之前运行
(function() {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // 检查是否为系统视图管理错误
    const messageParts = args.map((arg) => {
      if (typeof arg === 'string') {
        return arg;
      }
      if (arg && typeof (arg as any).errMsg === 'string') {
        return (arg as any).errMsg;
      }
      return '';
    }).filter((part) => !!part);

    const message = messageParts.join(' ');
    if (message) {
      // 仅过滤微信内部 TextView/ImageView 相关的已知无害错误
      if (message.indexOf('removeImageView:fail') !== -1 ||
          message.indexOf('removeTextView:fail') !== -1 ||
          message.indexOf('insertTextView:fail parent') !== -1 ||
          message.indexOf('updateTextView:fail') !== -1 ||
          message.indexOf('insertImageView:fail parent') !== -1 ||
          message.indexOf('updateImageView:fail') !== -1 ||
          (message.indexOf('not found') !== -1 && message.indexOf('View:fail') !== -1)) {
        // 静默处理，不输出到控制台
        return;
      }
    }

    // 其他错误正常输出
    originalConsoleError.apply(console, args);
  };
})();

(function() {
  try {
    const basePageModule = require('./utils/base-page.js');
    const baseShare = basePageModule.BasePage;
    const originalPage: any = Page as any;

    (Page as any) = function(config: any) {
      if (!config) {
        return originalPage(config);
      }

      if (!config.onShareAppMessage) {
        config.onShareAppMessage = function() {
          return baseShare.onShareAppMessage.call(baseShare);
        };
      }

      if (!config.onShareTimeline) {
        config.onShareTimeline = function() {
          return baseShare.onShareTimeline.call(baseShare);
        };
      }

      return originalPage(config);
    };
  } catch (e) {
    console.warn('全局分享注入失败:', e);
  }
})();

const subpackageLoader = require('./utils/subpackage-loader.js')
const subpackageDebugger = require('./utils/subpackage-debug.js')
const onboardingGuide = require('./utils/onboarding-guide.js')

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
    console.log(' FlightToolbox v' + APP_VERSION + ' 启动')

    // 基于Context7最佳实践：初始化警告处理器
    // 提前初始化，以便尽早过滤第三方库和全局配置产生的告警
    WarningHandler.init()

    // iOS音频播放修复：全局音频配置（必须在应用启动时设置）
    this.initGlobalAudioConfig()

    // 统一初始化广告管理器 - 避免各页面重复初始化
    AdManager.init({
      debug: false // 生产环境关闭调试
    })

    // 新增：初始化主题管理器
    this.initThemeManager()

    // 获取设备信息（兼容方式）
    try {
      // 设备信息仅在需要排查问题时使用，这里不再输出到控制台
    } catch (error) {
      console.warn('获取系统信息失败:', error)
    }

    // 初始化网络监听
    this.initNetworkMonitoring()

    // 延迟预加载数据，避免影响启动性能
    setTimeout(() => {
      // 默认仅预加载数据，如需查看分包诊断可在调试时手动调用 subpackageDebugger.fullDiagnostic
      this.preloadQueryData()
    }, 2000) // 2秒后开始预加载

    // 离线优先策略已改为按需加载（Lazy Loading）
    // 用户访问具体功能时再加载对应分包，避免启动时加载所有数据
    // 参考：航线录音分包预加载规则记录/修复说明/微信小程序分包资源本地缓存完整实现指南.md

    // 监听网络状态变化，有网络时补充缺失数据
    wx.onNetworkStatusChange((res) => {
      if (res.isConnected) {
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
    // 记录会话开始时间
    onboardingGuide.startSession()
  },


  onHide() {
    // 记录会话结束时间，累加使用时长
    onboardingGuide.endSession()
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

      // 通知页面数据已预加载完成
      wx.setStorageSync('queryDataPreloaded', true)

    } catch (error) {
      console.error(' 数据预加载失败:', error)
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
      return result

    } catch (error) {
      console.warn(` ${dataType} :`, error)
      return null
    }
  },

  // 
  isDataPreloaded() {
    return this.globalData.dataPreloadCompleted || wx.getStorageSync('queryDataPreloaded')
  },

  // 
  getPreloadStatus() {
    return {
      started: this.globalData.dataPreloadStarted,
      completed: this.globalData.dataPreloadCompleted,
      cacheStatus: subpackageLoader.getCacheStatus()
    }
  },

  // 
  initThemeManager() {
    try {
      // 
      this.globalData.theme = 'light'

    } catch (error) {
      console.warn(' ', error)

    }
  },

  // 初始化网络监听
  initNetworkMonitoring() {
    // 获取当前网络状态
    wx.getNetworkType({
      success: (res) => {
        wx.setStorageSync('lastNetworkType', res.networkType)
      },

      fail: (err) => {
        console.warn('获取网络状态失败:', err)
        wx.setStorageSync('lastNetworkType', 'unknown')
      }
    })

    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      wx.setStorageSync('lastNetworkType', res.networkType)
    })
  },

  // iOS音频播放修复：全局音频配置
  initGlobalAudioConfig() {

    // 引入统一工具函数
    const Utils = require('./utils/common-utils.js');

    try {
      // 检查微信版本是否支持
      const systemInfo = Utils.deviceDetection.getDeviceInfo();
      const SDKVersion = systemInfo.SDKVersion;
      const platform = systemInfo.platform;

      // 基础库版本检查（wx.setInnerAudioOption需要2.3.0+）
      if (Utils.isVersionAtLeast(SDKVersion, '2.3.0')) {
        // iOS设备特殊配置
        const isIOS = Utils.deviceDetection.isIOS();
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

        wx.setInnerAudioOption({
          ...audioConfig,
          success: (res) => {
            // iOS设备额外验证
            if (isIOS) {
              // 存储配置状态供音频播放页面使用
              Utils.storage.setItem('iosAudioConfigured', true);
            }
          },
          fail: (err) => {

            console.warn(' 全局音频配置失败:', err);
            // 失败时尝试基础配置
            this.initBasicAudioConfig();
          },
          complete: () => {}
        });

      } else {
        console.warn(' 微信版本过低，不支持高级音频配置，使用基础配置');
        this.initBasicAudioConfig();
      }

    } catch (error) {
      console.error(' 音频配置初始化失败，将使用默认配置:', error);
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
        },

        fail: (err) => {
          console.warn(' 基础音频配置也失败:', err);
        }
      });
    } catch (error) {
      console.warn(' 基础音频配置异常:', error);
    }
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