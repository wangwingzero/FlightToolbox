// 音频播放页面
var AudioPreloadGuide = require('../../utils/audio-preload-guide.js');
var IOSAudioCompatibility = require('../../utils/ios-audio-compatibility.js');
var AudioResourceManager = require('../../utils/audio-resource-manager.js');
var TimeoutController = require('../../utils/timeout-controller.js');
var Utils = require('../../utils/common-utils.js');

Page({
  data: {
    // 传递的参数
    regionId: '',
    regionName: '',
    categoryId: '',
    categoryName: '',
    clipIndex: 0,
    
    // 录音数据
    allClips: [],
    currentClip: null,
    
    // 播放器状态
    isPlaying: false,
    isLooping: false,
    volume: 100,
    showSubtitles: false,
    subtitleLang: 'cn',
    audioContext: null,
    audioProgress: 0,
    currentTimeText: '00:00',
    totalTimeText: '00:00',
    currentAudioSrc: '',
    
    // 学习状态
    learnedClips: [],
    showLearnedNames: false,
    
    // 预加载引导状态
    preloadGuide: null,
    isCheckingPreload: false,
    showPreloadGuide: false,
    
    // iOS兼容性状态
    iosCompatibility: null,
    isIOSDevice: false,
    audioCompatibilityReport: null,
    
    // 分包加载状态
    loadedPackages: [],
    
    // 音频播放状态
    isFirstPlay: true,
    retryCount: 0,
    maxRetryCount: 3,
    isDevTools: false,
    simulationInterval: null,
    
    // 音频播放完整性检查
    lastUpdateTime: 0,
    playbackCheckInterval: null,
    hasReachedNearEnd: false,
    
    // 音频预加载状态
    isAudioReady: false,
    audioPreloadAttempts: 0,
    maxPreloadAttempts: 3,

    // 预加载标记状态
    hasMarkedPreloaded: false,
    
    // iOS兼容性状态
    iosCompatibility: null,
    iosDiagnosis: null
  },

  onLoad(options: any) {
    console.log('🎵 音频播放页面加载', options);

    // 🍎 初始化iOS音频兼容性工具
    this.data.iosCompatibility = IOSAudioCompatibility.init();
    console.log('🍎 iOS兼容性状态:', this.data.iosCompatibility);

    // 初始化预加载引导管理器
    this.data.preloadGuide = new AudioPreloadGuide();

    // 检测是否在开发者工具环境
    this.checkDevToolsEnvironment();
    
    // 解析传递的参数
    const {
      regionId = '',
      regionName = '',
      categoryId = '',
      categoryName = '',
      clipIndex = '0',
      allClipsJson = '[]'
    } = options;

    try {
      const allClips = JSON.parse(decodeURIComponent(allClipsJson));
      const index = parseInt(clipIndex);
      const currentClip = allClips[index] || null;
      
      this.setData({
        regionId: regionId,
        regionName: decodeURIComponent(regionName),
        categoryId: categoryId,
        categoryName: decodeURIComponent(categoryName),
        clipIndex: index,
        allClips: allClips,
        currentClip: currentClip
      });

      // 初始化预加载分包状态
      this.initializePreloadedPackages();

      // 加载学习状态
      this.loadLearnedClips();
      
      // 设置音频源
      if (currentClip) {
        this.checkPreloadAndSetAudioSource(currentClip);
      }
    } catch (error) {
      console.error('❌ 解析参数失败:', error);
      wx.showToast({
        title: '页面数据错误',
        icon: 'none'
      });
    }
  },

  // 初始化预加载分包状态
  initializePreloadedPackages() {
    // 🔄 完全分散预加载策略（避免单页面2MB限制）：
    // audio-player页面作为核心播放页面，预加载最常用的三个分包作为备用
    // 所有分包都已通过其他页面预加载，这里只是标记备用状态
    const backupPreloadedPackages = ["japanAudioPackage", "singaporeAudioPackage", "philippineAudioPackage"];
    
    backupPreloadedPackages.forEach(packageName => {
      if (!this.data.loadedPackages.includes(packageName)) {
        this.data.loadedPackages.push(packageName);
      }
    });
    
    this.setData({ loadedPackages: this.data.loadedPackages });
    console.log('✅ audio-player 已标记备用预加载分包:', this.data.loadedPackages);
    console.log('📋 完全分散预加载策略: 所有音频分包都通过不同页面分散预加载');
  },

  // 检查分包是否已加载（完全分散预加载模式）
  isPackageLoaded(packageName: string): boolean {
    // 🔄 完全分散预加载检查
    // 所有音频分包都通过不同页面预加载，理论上都应该可用
    const allPreloadMapping: { [key: string]: string } = {
      "japanAudioPackage": "主页(others)",
      "singaporeAudioPackage": "主页(others)", 
      "philippineAudioPackage": "陆空通话页面",
      "koreaAudioPackage": "陆空通话页面",
      "russiaAudioPackage": "录音分类页面",
      "srilankaAudioPackage": "录音片段页面",
      "thailandAudioPackage": "航线录音页面",
      "franceAudioPackage": "航线录音页面",
      "turkeyAudioPackage": "日出日落页面",
      "australiaAudioPackage": "资料查询页面"
    };
    
    // 检查是否为预加载分包
    const isPreloaded = allPreloadMapping[packageName] !== undefined;
    const isLoaded = isPreloaded || this.data.loadedPackages.includes(packageName);
    
    if (isPreloaded && !this.data.loadedPackages.includes(packageName)) {
      console.log('✅ 分包 ' + packageName + ' 已在 ' + allPreloadMapping[packageName] + ' 预加载');
      // 标记为已加载避免重复检测
      const currentLoadedPackages = this.data.loadedPackages.slice();
      currentLoadedPackages.push(packageName);
      this.setData({ loadedPackages: currentLoadedPackages });
    }
    
    return isLoaded;
  },

  // 检测开发者工具环境
  checkDevToolsEnvironment() {
    const isDevTools = Utils.deviceDetection.isDevTools();
    
    this.setData({
      isDevTools: isDevTools
    });
    
    if (isDevTools) {
      console.log('⚠️ 检测到开发者工具环境，音频播放可能受限');
    }
  },

  onUnload() {
    // 🧹 使用统一资源管理器清理所有资源
    AudioResourceManager.cleanup();
    
    console.log('✅ 页面卸载，所有音频资源已清理');
  },

  // 加载用户学习状态
  loadLearnedClips() {
    try {
      const learnedClips = Utils.storage.getItem('learnedClips', []);
      
      // 更新所有录音的学习状态
      const updatedClips = this.data.allClips.map(clip => ({
        ...clip,
        isLearned: learnedClips.includes(this.generateClipId(clip, this.data.regionId))
      }));
      
      this.setData({
        learnedClips: learnedClips,
        allClips: updatedClips,
        currentClip: updatedClips[this.data.clipIndex] || null
      });
    } catch (error) {
      console.error('❌ 加载学习状态失败:', error);
    }
  },

  // 保存学习状态
  saveLearnedClips() {
    try {
      Utils.storage.setItem('learnedClips', this.data.learnedClips);
    } catch (error) {
      console.error('❌ 保存学习状态失败:', error);
    }
  },

  // 生成录音唯一ID
  generateClipId(clip: any, regionId: string) {
    return regionId + '_' + (clip.mp3_file || clip.label) + '_' + clip.full_transcript.slice(0, 20);
  },

  // 检查预加载状态并设置音频源
  checkPreloadAndSetAudioSource(clip: any) {
    var self = this;
    
    if (!this.data.preloadGuide) {
      console.error('❌ 预加载引导管理器未初始化');
      this.setAudioSource(clip);
      return;
    }

    // 设置检查状态
    this.setData({ isCheckingPreload: true });
    
    console.log('🔍 检查地区 ' + this.data.regionId + ' 的音频分包预加载状态...');
    
    // 先尝试直接播放，如果失败再显示引导
    this.setAudioSource(clip);
    this.setData({ isCheckingPreload: false });
    
    // 备用：如果播放失败，可以在错误回调中显示引导
    // 这样可以避免不必要的预加载检查延迟
  },

  // 显示预加载引导对话框
  showPreloadGuideDialog(clip: any) {
    var self = this;
    
    console.log('🎯 进入 showPreloadGuideDialog 方法');
    console.log('🔍 clip 参数:', clip);
    console.log('🔍 this.data.preloadGuide:', this.data.preloadGuide);
    console.log('🔍 this.data.regionId:', this.data.regionId);
    
    if (!this.data.preloadGuide) {
      console.error('❌ 预加载引导管理器未初始化，尝试重新创建');
      this.data.preloadGuide = new AudioPreloadGuide();
      
      if (!this.data.preloadGuide) {
        console.error('❌ 无法创建预加载引导管理器');
        this.setAudioSource(clip);
        return;
      }
    }

    console.log('🎯 显示预加载引导对话框，地区:', this.data.regionId);
    
    this.data.preloadGuide.showPreloadGuideDialog(this.data.regionId).then(function(userNavigated) {
      if (userNavigated) {
        console.log('✅ 用户已前往预加载页面');
        // 用户选择前往预加载页面，可以显示一个提示
        wx.showToast({
          title: '请稍后返回播放',
          icon: 'none',
          duration: 2000
        });
        
        // 可以考虑在一段时间后自动检查预加载状态
        setTimeout(function() {
          self.recheckPreloadStatus(clip);
        }, 3000);
      } else {
        console.log('🤷 用户选择稍后再说，尝试直接播放');
        // 用户选择稍后再说，尝试直接播放（可能使用兜底方案）
        self.setAudioSource(clip);
      }
    }).catch(function(error) {
      console.error('❌ 显示预加载引导对话框失败:', error);
      self.setAudioSource(clip);
    });
  },

  // 重新检查预加载状态
  recheckPreloadStatus(clip: any) {
    var self = this;
    
    if (!this.data.preloadGuide) {
      this.setAudioSource(clip);
      return;
    }

    console.log('🔄 重新检查预加载状态...');
    
    this.data.preloadGuide.checkPackagePreloaded(this.data.regionId).then(function(isPreloaded) {
      if (isPreloaded) {
        console.log('✅ 分包现在已预加载，可以播放音频');
        wx.showToast({
          title: '音频资源已就绪',
          icon: 'success',
          duration: 1500
        });
        self.setAudioSource(clip);
      } else {
        console.log('⚠️ 分包仍未预加载，使用兜底方案');
        self.setAudioSource(clip);
      }
    }).catch(function(error) {
      console.error('❌ 重新检查预加载状态失败:', error);
      self.setAudioSource(clip);
    });
  },

  // 设置音频源
  setAudioSource(clip: any) {
    if (!clip || !clip.mp3_file) {
      console.error('❌ 无效的录音数据');
      this.setData({ currentAudioSrc: '' });
      return;
    }

    // 根据架构文档，使用 regionPathMap 构建路径
    const regionPathMap: { [key: string]: string } = {
      'japan': '/packageJapan/',
      'philippines': '/packagePhilippines/',
      'korea': '/packageKorean/',
      'singapore': '/packageSingapore/',
      'thailand': '/packageThailand/',
      'germany': '/packageGermany/',
      'france': '/packageFrance/',
      'usa': '/packageAmerica/',
      'italy': '/packageItaly/',
      'australia': '/packageAustralia/',
      'south-africa': '/packageSouthAfrica/',
      'russia': '/packageRussia/',
      'srilanka': '/packageSrilanka/',
      'turkey': '/packageTurkey/',
      'uae': '/packageUAE/'
    };

    const basePath = regionPathMap[this.data.regionId];
    if (!basePath) {
      console.error('❌ 未找到地区ID "' + this.data.regionId + '" 的路径映射');
      this.setData({ currentAudioSrc: '' });
      return;
    }
    
    const audioPath = basePath + clip.mp3_file;

    console.log('🎵 设置音频源: ' + audioPath);

    // 先直接更新data，然后调用setData
    this.data.currentAudioSrc = audioPath;
    this.data.currentClip = clip;
    this.data.isFirstPlay = true;
    this.data.retryCount = 0;
    
    this.setData({
      currentAudioSrc: audioPath,
      currentClip: clip,
      isFirstPlay: true,
      retryCount: 0,
      isAudioReady: false,
      audioPreloadAttempts: 0,
      hasReachedNearEnd: false,
      hasMarkedPreloaded: false
    });
    
    console.log('🎵 setData完成，验证currentAudioSrc: ' + this.data.currentAudioSrc);

    // 销毁旧的音频上下文
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }

    // 创建新的音频上下文
    this.createAudioContext();
  },

  // 🔧 iOS音频兼容性：初始化兼容性工具
  initIOSCompatibility() {
    console.log('🍎 初始化iOS音频兼容性...');
    
    if (!this.data.iosCompatibility) {
      console.warn('⚠️ iOS兼容性工具未初始化');
      return;
    }
    
    // 获取兼容性报告
    const report = this.data.iosCompatibility.getCompatibilityReport();
    this.setData({ audioCompatibilityReport: report });
    
    console.log('📊 音频兼容性报告:', report);
    
    // 显示兼容性建议
    if (report.recommendations && report.recommendations.length > 0) {
      report.recommendations.forEach((rec, index) => {
        setTimeout(() => {
          if (rec.type === 'error') {
            wx.showModal({
              title: rec.title,
              content: rec.message + '\n\n' + rec.action,
              showCancel: false,
              confirmText: '知道了'
            });
          } else if (rec.type === 'warning') {
            wx.showToast({
              title: rec.message,
              icon: 'none',
              duration: 3000
            });
          }
        }, 1000 + index * 500); // 延迟显示，避免重叠
      });
    }
    
    // 验证音频配置
    this.verifyAudioConfigWithCompatibility();
  },
  
  // 🔧 使用兼容性工具验证音频配置
  verifyAudioConfigWithCompatibility() {
    if (!this.data.iosCompatibility) {
      return;
    }
    
    this.data.iosCompatibility.verifyAudioConfig().then((success) => {
      if (success) {
        console.log('✅ 音频配置验证成功');
      } else {
        console.warn('⚠️ 音频配置验证失败，将使用兼容性模式');
      }
    });
  },

  // 创建音频上下文
  createAudioContext() {
    if (!this.data.currentAudioSrc) {
      console.error('❌ 无法创建音频上下文：音频源为空');
      return;
    }

    console.log('🎵 正在创建音频上下文:', this.data.currentAudioSrc);
    const self = this;

    // 🧹 销毁旧的音频上下文并清理资源
    if (this.data.audioContext) {
      AudioResourceManager.destroyAudioContext(this.data.audioContext);
    }

    // 确保分包已加载后再创建音频上下文
    this.ensureSubpackageLoaded(async function() {
      console.log('🎵 分包确认加载完成，开始创建音频上下文');
      
      try {
        // 🔄 使用超时控制创建音频上下文
        const audioContext = await TimeoutController.createAudioContextWithRetry(() => {
          const ctx = wx.createInnerAudioContext();
          
          // 在开发者工具中，尝试修正音频路径
          let audioSrc = self.data.currentAudioSrc;
          if (self.data.isDevTools && audioSrc) {
            // 开发者工具可能需要相对路径
            audioSrc = audioSrc.replace(/^\//, './');
            console.log('🛠️ 开发者工具路径修正:', audioSrc);
          }
          
          // 确保音频源正确设置
          if (audioSrc) {
            ctx.src = audioSrc;
            console.log('🎵 音频源设置完成:', ctx.src);
          } else {
            throw new Error('音频源为空，无法设置');
          }
          
          return ctx;
        });
        
        // 🔧 基础音频配置
        audioContext.autoplay = false;
        audioContext.loop = self.data.isLooping;
        audioContext.volume = self.data.volume / 100;
        
        // 🍎 iOS兼容性配置
        const isIOSDevice = self.data.iosCompatibility && self.data.iosCompatibility.compatibilityStatus && self.data.iosCompatibility.compatibilityStatus.isIOS;
        if (self.data.iosCompatibility && isIOSDevice) {
          console.log('🍎 应用iOS音频兼容性配置');
          const configSuccess = self.data.iosCompatibility.configureAudioContext(audioContext);
          if (!configSuccess) {
            console.warn('⚠️ iOS音频配置失败，使用默认配置');
          }
        }
        
        // 🧹 添加到资源管理器
        AudioResourceManager.addAudioContext(audioContext);
        
        // 预加载音频以减少播放延迟
        audioContext.startTime = 0;
        
        // 直接将audioContext存储到this.data，不使用setData
        self.data.audioContext = audioContext;
        self.data.retryCount = 0;
        
        // 只更新界面需要的数据
        self.setData({ 
          retryCount: 0 
        });
        
        console.log('🎵 音频上下文创建成功，开始绑定事件');
        
        self.bindAudioEvents(audioContext);
        
      } catch (error) {
        console.error('❌ 创建音频上下文失败:', error);
        
        // 显示错误提示
        wx.showToast({
          title: '音频初始化失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 确保分包已加载（支持异步加载）
  ensureSubpackageLoaded(callback: () => void) {
    // 在开发者工具环境下跳过分包检查
    if (this.data.isDevTools) {
      console.log('⚠️ 开发者工具环境：跳过分包检查，直接尝试播放');
      callback();
      return;
    }

    // 正确的分包名称映射（subPackageName）
    const subpackageMap: { [key: string]: string } = {
      'japan': 'japanAudioPackage',
      'philippines': 'philippineAudioPackage',
      'korea': 'koreaAudioPackage',
      'singapore': 'singaporeAudioPackage',
      'thailand': 'thailandAudioPackage',
      'france': 'franceAudioPackage',
      'russia': 'russiaAudioPackage',
      'srilanka': 'srilankaAudioPackage',
      'australia': 'australiaAudioPackage',
      'turkey': 'turkeyAudioPackage'
    };

    const subpackageName = subpackageMap[this.data.regionId];
    if (!subpackageName) {
      console.log('🎵 无需加载分包，直接创建音频上下文');
      callback();
      return;
    }

    // 检查分包是否已预加载
    if (this.isPackageLoaded(subpackageName)) {
      console.log('✅ 分包已预加载: ' + subpackageName);
      callback();
      return;
    }

    // 分包未预加载，进行异步加载
    console.log('🔄 开始异步加载分包: ' + subpackageName);
    this.loadAudioPackage(subpackageName, callback);
  },

  // 异步加载音频分包
  loadAudioPackage(subpackageName: string, callback: () => void) {
    const self = this;
    
    // 开发者工具环境检测
    if (this.data.isDevTools || !wx.loadSubpackage) {
      console.log('⚠️ 开发者工具环境：跳过分包加载，直接执行回调');
      // 标记分包为已加载（模拟）
      const currentLoadedPackages = self.data.loadedPackages.slice();
      if (!currentLoadedPackages.includes(subpackageName)) {
        currentLoadedPackages.push(subpackageName);
        self.setData({ loadedPackages: currentLoadedPackages });
      }
      callback();
      return;
    }
    
    wx.showLoading({
      title: '正在加载音频资源...',
      mask: true
    });

    wx.loadSubpackage({
      name: subpackageName,
      success: function() {
        wx.hideLoading();
        console.log('✅ 成功加载音频分包: ' + subpackageName);
        
        // 标记分包为已加载
        const currentLoadedPackages = self.data.loadedPackages.slice();
        if (!currentLoadedPackages.includes(subpackageName)) {
          currentLoadedPackages.push(subpackageName);
          self.setData({ loadedPackages: currentLoadedPackages });
        }
        
        // 执行回调
        callback();
      },
      fail: function(res) {
        wx.hideLoading();
        console.error('❌ 加载音频分包失败: ' + subpackageName, res);
        
        wx.showModal({
          title: '音频加载失败',
          content: '音频资源加载失败，请检查网络连接或稍后重试。\n\n错误信息: ' + (res.errMsg || '未知错误'),
          showCancel: true,
          cancelText: '取消',
          confirmText: '重试',
          success: function(modalRes) {
            if (modalRes.confirm) {
              // 重试加载
              self.loadAudioPackage(subpackageName, callback);
            }
          }
        });
      }
    });
  },

  // 显示分包引导提示
  showSubpackageGuide(packageName: string) {
    // 根据分包提供具体的引导路径
    const guideMap: { [key: string]: { pages: string[], description: string } } = {
      'packageJapan': {
        pages: ['录音分类页面'],
        description: '日本机场录音'
      },
      'packagePhilippines': {
        pages: ['录音分类页面'],
        description: '菲律宾机场录音'
      },
      'packageKorean': {
        pages: ['录音分类页面'],
        description: '韩国机场录音'
      },
      'packageSingapore': {
        pages: ['录音分类页面'],
        description: '新加坡机场录音'
      },
      'packageThailand': {
        pages: ['音频播放页面'],
        description: '泰国机场录音'
      },
      'packageRussia': {
        pages: ['通信规则页面'],
        description: '俄罗斯机场录音'
      },
      'packageSrilanka': {
        pages: ['录音片段页面'],
        description: '斯里兰卡机场录音'
      },
      'packageAustralia': {
        pages: ['资料查询页面'],
        description: '澳大利亚机场录音'
      },
      'packageTurkey': {
        pages: ['航班运行页面'],
        description: '土耳其机场录音'
      }
    };

    const guide = guideMap[packageName];
    const description = guide ? guide.description : '音频资源';
    
    wx.showModal({
      title: '音频资源未准备好',
      content: `${description}还未加载完成。\n\n请先浏览其他页面，让小程序自动准备音频资源，稍后再回来播放。\n\n💡 小贴士：多浏览几个页面可以让更多音频资源提前准备好。`,
      showCancel: true,
      cancelText: '知道了',
      confirmText: '前往浏览',
      success: (res) => {
        if (res.confirm) {
          // 引导用户返回上级页面
          wx.navigateBack({
            delta: 1,
            fail: () => {
              // 如果无法返回，跳转到首页
              wx.switchTab({
                url: '/pages/others/index'
              });
            }
          });
        }
      }
    });
  },

  // 检查分包加载状态
  checkSubpackageStatus(packageName: string, callback: (isLoaded: boolean) => void) {
    // 通过尝试require分包中的文件来检查分包是否已加载
    try {
      const packageRootMap: { [key: string]: string } = {
        'japanAudioPackage': 'packageJapan',
        'philippineAudioPackage': 'packagePhilippines',
        'koreaAudioPackage': 'packageKorean',
        'singaporeAudioPackage': 'packageSingapore',
        'thailandAudioPackage': 'packageThailand',
        'russiaAudioPackage': 'packageRussia',
        'srilankaAudioPackage': 'packageSrilanka',
        'australiaAudioPackage': 'packageAustralia',
        'turkeyAudioPackage': 'packageTurkey'
      };

      const packageRoot = packageRootMap[packageName];
      if (!packageRoot) {
        callback(false);
        return;
      }

      // 检查分包是否可访问
      wx.getFileSystemManager().access({
        path: `/${packageRoot}/`,
        success: () => {
          console.log(`📦 分包 ${packageName} 已加载`);
          callback(true);
        },
        fail: () => {
          console.log(`📦 分包 ${packageName} 未加载`);
          callback(false);
        }
      });
    } catch (error) {
      console.log('📦 检查分包状态时出错: ' + error);
      callback(false);
    }
  },

  // 绑定音频事件
  bindAudioEvents(audioContext: any) {
    // 绑定事件
    audioContext.onPlay(() => {
      console.log('🎵 音频开始播放');
      this.setData({ isPlaying: true });

      // 🍎 iOS兼容性：播放成功时的诊断和修复
      if (this.data.iosCompatibility && this.data.iosCompatibility.compatibilityStatus && this.data.iosCompatibility.compatibilityStatus.isIOS) {
        console.log('🍎 iOS设备音频播放成功，执行兼容性诊断');
        const diagnosis = this.data.iosCompatibility.diagnoseAndFix(audioContext);
        this.setData({ iosDiagnosis: diagnosis });
        
        // 显示用户友好的状态信息
        const userStatus = this.data.iosCompatibility.getUserFriendlyStatus();
        if (userStatus.type === 'success') {
          console.log('✅', userStatus.title, '-', userStatus.message);
        }
      }

      // 音频播放成功，自动标记该地区为已预加载
      if (this.data.preloadGuide && this.data.regionId && !this.data.hasMarkedPreloaded) {
        console.log('🎯 音频播放成功，标记地区为已预加载:', this.data.regionId);
        const markSuccess = this.data.preloadGuide.markPackagePreloaded(this.data.regionId);
        if (markSuccess) {
          console.log('✅ 已成功标记', this.data.regionId, '音频资源为预加载完成');
          this.setData({ hasMarkedPreloaded: true });
        }
      }
    });

    audioContext.onPause(() => {
      console.log('⏸️ 音频暂停播放');
      // 暂停时也清理检查，避免误判
      if (this.data.playbackCheckInterval) {
        clearInterval(this.data.playbackCheckInterval);
        this.setData({ playbackCheckInterval: null });
      }
      this.setData({ isPlaying: false });
    });

    audioContext.onStop(() => {
      console.log('⏹️ 音频停止播放');
      // 清理播放完整性检查
      if (this.data.playbackCheckInterval) {
        clearInterval(this.data.playbackCheckInterval);
        this.setData({ playbackCheckInterval: null });
      }
      this.setData({ 
        isPlaying: false, 
        audioProgress: 0,
        hasReachedNearEnd: false 
      });
    });

    audioContext.onEnded(() => {
      console.log('🏁 音频播放结束事件触发');
      this.handleAudioEnd();
    });

    audioContext.onTimeUpdate(() => {
      if (audioContext.duration > 0) {
        const progress = (audioContext.currentTime / audioContext.duration) * 100;
        const currentTime = this.formatTime(audioContext.currentTime);
        const totalTime = this.formatTime(audioContext.duration);
        
        // 防止进度超过100%，但允许接近100%时继续更新
        const clampedProgress = Math.min(progress, 99.5);
        
        this.setData({ 
          audioProgress: clampedProgress,
          currentTimeText: currentTime,
          totalTimeText: totalTime
        });
        
        // 当接近结束时（最后0.5秒），预加载结束状态
        if (progress >= 95) {
          console.log('🎵 音频即将结束，当前进度:', progress.toFixed(2) + '%');
          this.setData({ hasReachedNearEnd: true });
        }
        
        // 记录最后更新时间，用于检测播放是否真正结束
        this.setData({ lastUpdateTime: Date.now() });
      }
    });

    audioContext.onError((error) => {
      console.error('❌ 音频播放错误:', error);
      console.error('📦 错误详情:', {
        errCode: error.errCode,
        errMsg: error.errMsg,
        audioSrc: this.data.currentAudioSrc,
        regionId: this.data.regionId
      });
      
      this.setData({ isPlaying: false });
      
      // 🍎 iOS兼容性：音频错误时的诊断和修复
      if (this.data.iosCompatibility && this.data.iosCompatibility.compatibilityStatus && this.data.iosCompatibility.compatibilityStatus.isIOS) {
        console.log('🍎 iOS设备音频播放错误，执行兼容性诊断');
        const diagnosis = this.data.iosCompatibility.diagnoseAndFix(audioContext);
        this.setData({ iosDiagnosis: diagnosis });
        
        // 如果诊断提供了修复建议，显示给用户
        if (diagnosis.fixes && diagnosis.fixes.length > 0) {
          console.log('🔧 iOS兼容性修复建议:', diagnosis.fixes);
        }
      }
      
      // 开发者工具环境特殊处理
      if (this.data.isDevTools) {
        this.handleDevToolsAudioError(error);
        return;
      }
      
      // 检查是否是分包未加载导致的错误
      const isSubpackageError = error.errCode === 10001 || 
                               (error.errMsg && error.errMsg.includes('not found param')) ||
                               (error.errMsg && error.errMsg.includes('play audio fail'));
                               
      if (isSubpackageError) {
        console.log('🔍 检测到分包加载问题，直接显示预加载引导');
        
        // 对于音频播放失败的情况，直接显示预加载引导
        if (error.errMsg && error.errMsg.includes('play audio fail')) {
          console.log('🎯 音频播放失败，显示预加载引导对话框');
          console.log('🔍 当前地区ID:', this.data.regionId);
          console.log('🔍 当前录音数据:', this.data.currentClip);
          console.log('🔍 预加载引导管理器:', this.data.preloadGuide);
          
          // 设置状态防止重复调用
          this.setData({ isPlaying: false });
          
          // 延迟显示对话框，确保不被其他操作干扰
          var self = this;
          setTimeout(function() {
            self.showPreloadGuideDialog(self.data.currentClip);
          }, 100);
          return;
        }
        
        // 其他分包错误情况，先尝试重新加载
        console.log('🔄 尝试重新确保分包加载');
        var context = this;
        this.ensureSubpackageLoaded(function() {
          console.log('🔄 分包重新确认加载完成，重试播放');
          context.createAudioContext();
        });
        return;
      }
      
      // 检查重试次数
      if (this.data.retryCount < this.data.maxRetryCount) {
        const newRetryCount = this.data.retryCount + 1;
        this.setData({ retryCount: newRetryCount });
        
        console.log(`🔄 第${newRetryCount}次重试创建音频上下文...`);
        
        setTimeout(() => {
          this.createAudioContext();
        }, 1000 * newRetryCount);
        
        wx.showToast({
          title: `音频播放失败，正在重试(${newRetryCount}/${this.data.maxRetryCount})...`,
          icon: 'none',
          duration: 2000
        });
      } else {
        // 最后重试失败，显示预加载引导对话框
        console.log('🎯 播放重试失败，显示预加载引导对话框');
        this.showPreloadGuideDialog(this.data.currentClip);
      }
    });

    audioContext.onCanplay(() => {
      console.log('✅ 音频文件可以播放');
      // 修复this上下文问题
      if (self && self.setData) {
        self.setData({ isAudioReady: true });
        console.log('🎵 音频已准备就绪，可以播放');

        // 音频文件可以播放，自动标记该地区为已预加载
        if (self.data.preloadGuide && self.data.regionId && !self.data.hasMarkedPreloaded) {
          console.log('🎯 音频文件准备就绪，标记地区为已预加载:', self.data.regionId);
          const markSuccess = self.data.preloadGuide.markPackagePreloaded(self.data.regionId);
          if (markSuccess) {
            console.log('✅ 已成功标记', self.data.regionId, '音频资源为预加载完成');
            self.setData({ hasMarkedPreloaded: true });
          }
        }
      } else {
        console.warn('⚠️ 页面上下文不可用，跳过状态更新');
      }
    });

    // audioContext已经在createAudioContext中存储，无需再次setData
  },

  // 处理开发者工具音频错误
  handleDevToolsAudioError(error: any) {
    console.log('🛠️ 开发者工具音频播放错误，这是正常现象');
    console.log('🛠️ 错误详情:', error);
    console.log('🛠️ 预期音频路径:', this.data.currentAudioSrc);
    
    // 显示开发者工具专用提示
    if (this.data.retryCount === 0) {
      wx.showModal({
        title: '开发者工具限制',
        content: '开发者工具环境下分包音频无法播放，这是正常现象。\n\n✅ 预加载机制正常工作\n✅ 音频路径配置正确\n\n请在真机上测试真实的音频播放功能。',
        showCancel: true,
        cancelText: '知道了',
        confirmText: '模拟播放',
        success: (res) => {
          if (res.confirm) {
            // 模拟播放状态
            this.simulateAudioPlayback();
          }
        }
      });
      
      this.setData({ retryCount: 999 }); // 防止重复弹窗
    }
  },

  // 模拟音频播放（仅用于开发者工具测试UI）
  simulateAudioPlayback() {
    console.log('🎭 模拟音频播放开始');
    
    this.setData({ 
      isPlaying: true,
      currentTimeText: '00:00',
      totalTimeText: '00:30',
      audioProgress: 0
    });

    // 模拟播放进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += 3.33; // 每300ms增加3.33%，约30秒播放完成
      
      const currentTime = Math.floor((progress / 100) * 30); // 模拟30秒音频
      const currentTimeText = this.formatTime(currentTime);
      
      this.setData({
        audioProgress: progress,
        currentTimeText: currentTimeText
      });

      if (progress >= 100) {
        clearInterval(interval);
        this.setData({ 
          isPlaying: false,
          audioProgress: 0,
          currentTimeText: '00:00'
        });
        console.log('🎭 模拟音频播放结束');
        
        wx.showToast({
          title: '模拟播放完成',
          icon: 'success',
          duration: 1500
        });
      }
    }, 300);

    // 存储定时器引用以便清理
    this.setData({ simulationInterval: interval });
  },

  // 格式化时间
  formatTime(seconds: number) {
    return Utils.timeFormatter.formatTime(seconds);
  },

  // 播放/暂停切换
  togglePlayPause() {
    console.log('🎯 点击播放/暂停按钮');
    console.log('🍎 iOS兼容性调试信息:', {
      hasCompatibility: !!this.data.iosCompatibility,
      compatibilityStatus: this.data.iosCompatibility?.compatibilityStatus,
      isIOSDevice: this.data.iosCompatibility?.compatibilityStatus?.isIOS,
      audioContext: !!this.data.audioContext,
      currentSrc: this.data.currentAudioSrc,
      isPlaying: this.data.isPlaying
    });
    
    const self = this;
    
    // 开发者工具环境下的模拟播放控制
    if (this.data.isDevTools && this.data.simulationInterval) {
      if (this.data.isPlaying) {
        // 暂停模拟播放
        clearInterval(this.data.simulationInterval);
        this.setData({ 
          isPlaying: false,
          simulationInterval: null
        });
        console.log('🎭 模拟播放已暂停');
      } else {
        // 恢复模拟播放
        this.simulateAudioPlayback();
      }
      return;
    }
    
    // 🍎 iOS设备特殊处理：确保全局音频配置生效
    const isIOSDevice = this.data.iosCompatibility && this.data.iosCompatibility.compatibilityStatus && this.data.iosCompatibility.compatibilityStatus.isIOS;
    if (isIOSDevice) {
      console.log('🍎 iOS设备检测到，重新设置全局音频配置');
      try {
        wx.setInnerAudioOption({
          obeyMuteSwitch: false,
          speakerOn: true,
          mixWithOther: false,
          success: () => {
            console.log('✅ iOS全局音频配置重新设置成功');
          },
          fail: (err) => {
            console.warn('⚠️ iOS全局音频配置重新设置失败:', err);
          }
        });
      } catch (error) {
        console.error('❌ iOS全局音频配置设置异常:', error);
      }
    }
    
    // 确保分包已加载（支持异步加载）
    this.ensureSubpackageLoaded(function() {
      console.log('🔄 分包加载完成，开始播放逻辑');
      
      // 分包加载完成后，确保音频上下文存在
      if (!self.data.audioContext && self.data.currentAudioSrc) {
        console.log('🔄 音频上下文不存在，创建新的音频上下文');
        self.createAudioContext();
        
        // 等待音频上下文创建完成后再播放
        setTimeout(() => {
          if (self.data.audioContext) {
            console.log('✅ 音频上下文创建完成，开始播放');
            self.playAudio();
          } else {
            console.error('❌ 音频上下文创建失败');
            wx.showToast({
              title: '播放器初始化失败',
              icon: 'none'
            });
          }
        }, 500);
        return;
      }
      
      if (self.data.audioContext) {
        console.log('✅ 音频上下文存在，执行播放操作');
        if (self.data.isPlaying) {
          console.log('⏸️ 暂停播放');
          self.data.audioContext.pause();
        } else {
          console.log('▶️ 开始播放');
          self.playAudio();
        }
      } else {
        console.error('❌ 音频上下文不存在，无法播放');
        wx.showToast({
          title: '播放器初始化失败',
          icon: 'none'
        });
      }
    });
  },

  // 处理音频播放结束
  handleAudioEnd() {
    console.log('🎵 处理音频播放结束');
    
    // 清理播放完整性检查
    if (this.data.playbackCheckInterval) {
      clearInterval(this.data.playbackCheckInterval);
      this.setData({ playbackCheckInterval: null });
    }
    
    // 确保进度条显示100%完成
    this.setData({ 
      isPlaying: false, 
      audioProgress: 100,
      currentTimeText: this.data.totalTimeText,
      hasReachedNearEnd: false
    });
    
    console.log('✅ 音频播放完整结束，进度条已设置为100%');
    
    // 延迟重置进度条，让用户看到完整播放
    setTimeout(() => {
      this.setData({ 
        audioProgress: 0, 
        currentTimeText: '00:00' 
      });
    }, 800);
  },

  // 预加载音频数据
  preloadAudioData(audioContext: any) {
    const self = this;
    
    // 避免重复预加载
    if (this.data.isAudioReady || this.data.audioPreloadAttempts >= this.data.maxPreloadAttempts) {
      console.log('⏭️ 跳过预加载：已准备就绪或达到最大尝试次数');
      return;
    }
    
    const attempts = this.data.audioPreloadAttempts + 1;
    this.setData({ audioPreloadAttempts: attempts });
    
    console.log(`🔄 开始音频预加载 (第${attempts}次尝试)...`);
    
    try {
      // 预加载策略：短暂播放然后立即暂停
      const originalVolume = audioContext.volume;
      audioContext.volume = 0; // 静音预加载
      
      // 先尝试播放
      audioContext.play();
      
      setTimeout(() => {
        try {
          if (!self.data.isPlaying) {
            audioContext.pause();
            audioContext.seek(0);
            audioContext.volume = originalVolume; // 恢复音量
            self.setData({ isAudioReady: true });
            console.log('✅ 音频预加载完成，已准备播放');
          }
        } catch (error) {
          console.error('❌ 预加载暂停时出错:', error);
          // 即使出错也标记为准备就绪
          audioContext.volume = originalVolume;
          self.setData({ isAudioReady: true });
        }
      }, 150);
      
    } catch (error) {
      console.error('❌ 音频预加载失败:', error);
      // 预加载失败，直接标记为准备就绪
      this.setData({ isAudioReady: true });
    }
  },

  // 等待音频准备就绪
  waitForAudioReady(callback: () => void) {
    if (this.data.isAudioReady) {
      console.log('✅ 音频已准备就绪，立即开始播放');
      callback();
      return;
    }
    
    console.log('⏳ 等待音频准备就绪...');
    let waitCount = 0;
    const maxWait = 15; // 最多等待1.5秒
    
    const checkReady = () => {
      waitCount++;
      if (this.data.isAudioReady || waitCount >= maxWait) {
        if (this.data.isAudioReady) {
          console.log('✅ 音频已准备就绪，开始播放');
        } else {
          console.log('⚠️ 音频准备超时，强制开始播放');
          // 超时也标记为准备就绪，避免无限等待
          this.setData({ isAudioReady: true });
        }
        callback();
      } else {
        setTimeout(checkReady, 100);
      }
    };
    
    checkReady();
  },

  // 启动播放完整性检查
  startPlaybackIntegrityCheck() {
    // 清理之前的检查
    if (this.data.playbackCheckInterval) {
      clearInterval(this.data.playbackCheckInterval);
    }
    
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - this.data.lastUpdateTime;
      
      // 如果已经接近结束且超过1秒没有更新，可能是提前结束了
      if (this.data.hasReachedNearEnd && timeSinceLastUpdate > 1000 && this.data.isPlaying) {
        console.log('⚠️ 检测到可能的提前结束，手动触发完整结束');
        this.handleAudioEnd();
        clearInterval(checkInterval);
      }
    }, 200);
    
    this.setData({ playbackCheckInterval: checkInterval });
  },

  // 🔧 iOS兼容性：播放音频的独立方法
  playAudio() {
    if (!this.data.audioContext) {
      console.error('❌ 音频上下文不存在');
      return;
    }

    try {
      // 🍎 修复：正确检查iOS设备状态
      const isIOSDevice = this.data.iosCompatibility && this.data.iosCompatibility.compatibilityStatus && this.data.iosCompatibility.compatibilityStatus.isIOS;
      
      // 使用兼容性工具处理iOS预播放
      if (this.data.iosCompatibility && isIOSDevice) {
        console.log('🍎 iOS设备：使用兼容性工具预播放处理');
        
        this.data.iosCompatibility.preplayActivation(this.data.audioContext).then(() => {
          this.performActualPlay();
        }).catch((error) => {
          console.warn('⚠️ iOS预播放激活失败，使用常规播放:', error);
          this.performActualPlay();
        });
      } else {
        // 非iOS设备或兼容性工具不可用，直接播放
        console.log('📱 非iOS设备或兼容性工具不可用，使用常规播放');
        this.performActualPlay();
      }
    } catch (error) {
      console.error('❌ 播放音频时发生错误:', error);
      
      if (this.data.isDevTools) {
        wx.showToast({
          title: '开发者工具环境，请在真机测试',
          icon: 'none',
          duration: 2000
        });
      } else {
        wx.showToast({
          title: '播放失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  },
  
  // 🔧 实际播放执行方法
  performActualPlay() {
    // 等待音频准备就绪后再播放
    this.waitForAudioReady(() => {
      // 音频准备就绪，开始播放
      console.log('🎵 开始播放音频...');
      this.data.audioContext.play();
      
      // 启动播放完整性检查
      this.startPlaybackIntegrityCheck();
      
      // 添加播放开始的额外检查（iOS重要）
      setTimeout(() => {
        if (!this.data.isPlaying) {
          console.log('⚠️ 播放可能未正常开始，重试一次');
          this.data.audioContext.play();
        }
      }, 200);
      
      // iOS设备二次确认延迟检查
      const systemInfo = wx.getSystemInfoSync();
      if (systemInfo.platform === 'ios') {
        setTimeout(() => {
          if (!this.data.isPlaying && this.data.audioContext) {
            console.log('🍎 iOS设备：二次确认播放状态');
            this.data.audioContext.play();
          }
        }, 500);
      }
    });
      
      // 如果是首次播放，给予友好提示
      if (this.data.isFirstPlay) {
        this.setData({ isFirstPlay: false });
        
        // 延迟检查播放状态
        setTimeout(() => {
          if (!this.data.isPlaying && !this.data.isDevTools) {
            console.log('⚠️ 首次播放可能需要等待分包加载或用户交互');
            wx.showToast({
              title: '正在加载音频，请稍候...',
              icon: 'loading',
              duration: 3000
            });
          }
        }, 1000);
      }
  },

  // 上一个录音
  previousClip() {
    const currentIndex = this.data.clipIndex;
    if (currentIndex > 0) {
      this.selectClip({ currentTarget: { dataset: { index: currentIndex - 1 } } });
    } else {
      wx.showToast({
        title: '已经是第一个录音',
        icon: 'none'
      });
    }
  },

  // 下一个录音
  nextClip() {
    const currentIndex = this.data.clipIndex;
    if (currentIndex < this.data.allClips.length - 1) {
      this.selectClip({ currentTarget: { dataset: { index: currentIndex + 1 } } });
    } else {
      wx.showToast({
        title: '已经是最后一个录音',
        icon: 'none'
      });
    }
  },

  // 选择录音
  selectClip(e: any) {
    const index = parseInt(e.currentTarget.dataset.index);
    const clip = this.data.allClips[index];
    
    if (!clip) return;

    // 停止当前播放
    if (this.data.audioContext) {
      this.data.audioContext.stop();
    }

    this.setData({
      clipIndex: index,
      currentClip: clip,
      isPlaying: false,
      audioProgress: 0,
      isAudioReady: false,
      audioPreloadAttempts: 0,
      hasReachedNearEnd: false
    });

    // 设置新的音频源
    this.checkPreloadAndSetAudioSource(clip);
  },

  // 切换循环模式
  toggleLoop() {
    const newLooping = !this.data.isLooping;
    this.setData({ isLooping: newLooping });
    
    if (this.data.audioContext) {
      this.data.audioContext.loop = newLooping;
    }
    
    wx.showToast({
      title: newLooping ? '已开启循环播放' : '已关闭循环播放',
      icon: 'success',
      duration: 1500
    });
  },

  // 音量调节
  onVolumeChange(e: any) {
    const volume = e.detail.value;
    this.setData({ volume });
    
    if (this.data.audioContext) {
      this.data.audioContext.volume = volume / 100;
    }
  },

  // 切换字幕显示
  toggleSubtitles(e: any) {
    this.setData({ showSubtitles: e.detail.value });
  },

  // 选择字幕语言
  selectSubtitleLang(e: any) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({ subtitleLang: lang });
  },


  // 切换当前录音的学习状态
  toggleCurrentClipLearned() {
    if (!this.data.currentClip) return;

    const clipId = this.generateClipId(this.data.currentClip, this.data.regionId);
    const learnedClips = [...this.data.learnedClips];
    const index = learnedClips.indexOf(clipId);
    
    let isLearned = false;
    if (index > -1) {
      learnedClips.splice(index, 1);
    } else {
      learnedClips.push(clipId);
      isLearned = true;
    }

    // 更新当前录音状态
    const updatedCurrentClip = {
      ...this.data.currentClip,
      isLearned: isLearned
    };

    // 更新所有录音列表中的状态
    const updatedAllClips = [...this.data.allClips];
    updatedAllClips[this.data.clipIndex] = updatedCurrentClip;

    this.setData({
      learnedClips: learnedClips,
      currentClip: updatedCurrentClip,
      allClips: updatedAllClips
    });

    this.saveLearnedClips();
    
    console.log('✅ 播放页面状态更新完成: ' + clipId + ' - 已学会: ' + isLearned);
    console.log('📚 当前学习状态列表:', learnedClips);

    wx.showToast({
      title: isLearned ? '已标记为学会' : '已标记为未学会',
      icon: 'success',
      duration: 1500
    });
  },

  // 广告加载成功
  adLoad() {
    console.log('横幅广告加载成功');
  },

  // 广告加载失败
  adError(err: any) {
    console.error('横幅广告加载失败', err);
  },

  // 广告关闭
  adClose() {
    console.log('横幅广告关闭');
  }
});