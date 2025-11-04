/**
 * 音频分包预加载引导配置管理器
 * 当音频分包未加载时，引导用户访问对应的预加载页面
 * 
 * 核心功能：
 * 1. 提供音频分包与预加载页面的映射关系
 * 2. 生成用户友好的引导提示文案
 * 3. 提供一键跳转到预加载页面的功能
 * 4. 支持离线优先的预加载策略
 */

var TABBAR_PAGES = [
  '/pages/search/index',
  '/pages/flight-calculator/index',
  '/pages/cockpit/index',
  '/pages/operations/index',
  '/pages/home/index'
];

// 预加载状态版本号（用于清理旧版本的错误状态）
var PRELOAD_STATUS_VERSION = 2; // 修复开发者工具环境bug后的版本

function AudioPreloadGuide() {
  // 音频分包预加载页面映射配置
  // 基于 app.json 中的 preloadRule 配置
  this.preloadPageMapping = {
    'japan': {
      packageName: 'packageJapan',
      regionName: '日本成田机场',
      flag: '🇯🇵',
      preloadPage: 'pages/airline-recordings/index',
      preloadPageName: '航线录音',
      preloadPageIcon: '✈️',
      description: '日本成田机场陆空通话录音将通过航线录音页面自动预加载'
    },
    'philippines': {
      packageName: 'packagePhilippines',
      regionName: '菲律宾马尼拉机场',
      flag: '🇵🇭',
      preloadPage: 'pages/recording-categories/index',
      preloadPageName: '录音分类',
      preloadPageIcon: '📂',
      description: '菲律宾马尼拉机场陆空通话录音将通过录音分类页面自动预加载'
    },
    'korea': {
      packageName: 'packageKorean',
      regionName: '韩国仁川机场',
      flag: '🇰🇷',
      preloadPage: 'pages/audio-player/index',
      preloadPageName: '录音播放',
      preloadPageIcon: '🎵',
      description: '韩国仁川机场陆空通话录音将通过录音播放页面自动预加载'
    },
    'singapore': {
      packageName: 'packageSingapore',
      regionName: '新加坡樟宜机场',
      flag: '🇸🇬',
      preloadPage: 'pages/home/index',
      preloadPageName: '我的首页',
      preloadPageIcon: '👤',
      description: '新加坡樟宜机场陆空通话录音将通过我的首页自动预加载'
    },
    'russia': {
      packageName: 'packageRussia',
      regionName: '俄罗斯莫斯科机场',
      flag: '🇷🇺',
      preloadPage: 'packageCommFailure/pages/index',
      preloadPageName: '通信失效',
      preloadPageIcon: '📡',
      description: '俄罗斯莫斯科机场陆空通话录音将通过通信失效页面自动预加载'
    },
    'thailand': {
      packageName: 'packageThailand',
      regionName: '泰国曼谷机场',
      flag: '🇹🇭',
      preloadPage: 'pages/recording-clips/index',
      preloadPageName: '录音片段',
      preloadPageIcon: '🎬',
      description: '泰国曼谷机场陆空通话录音将通过录音片段页面自动预加载'
    },
    'srilanka': {
      packageName: 'packageSrilanka',
      regionName: '斯里兰卡科伦坡机场',
      flag: '🇱🇰',
      preloadPage: 'pages/recording-clips/index',
      preloadPageName: '录音片段',
      preloadPageIcon: '🎬',
      description: '斯里兰卡科伦坡机场陆空通话录音将通过录音片段页面自动预加载'
    },
    'france': {
      packageName: 'packageFrance',
      regionName: '法国戴高乐机场',
      flag: '🇫🇷',
      preloadPage: 'packageCommFailure/pages/index',
      preloadPageName: '通信失效',
      preloadPageIcon: '📡',
      description: '法国戴高乐机场陆空通话录音将通过通信失效页面自动预加载'
    },
    'australia': {
      packageName: 'packageAustralia',
      regionName: '澳大利亚悉尼机场',
      flag: '🇦🇺',
      preloadPage: 'packageCommFailure/pages/index',
      preloadPageName: '通信失效',
      preloadPageIcon: '📡',
      description: '澳大利亚悉尼机场陆空通话录音将通过通信失效页面自动预加载'
    },
    'usa': {
      packageName: 'packageAmerica',
      regionName: '美国旧金山机场',
      flag: '🇺🇸',
      preloadPage: 'pages/airline-recordings/index',
      preloadPageName: '航线录音',
      preloadPageIcon: '✈️',
      description: '美国旧金山机场陆空通话录音将通过航线录音页面自动预加载'
    },
    'turkey': {
      packageName: 'packageTurkey',
      regionName: '土耳其伊斯坦布尔机场',
      flag: '🇹🇷',
      preloadPage: 'pages/recording-clips/index',
      preloadPageName: '录音片段',
      preloadPageIcon: '🎬',
      description: '土耳其伊斯坦布尔机场陆空通话录音将通过录音片段页面自动预加载'
    },
    'italy': {
      packageName: 'packageItaly',
      regionName: '意大利罗马机场',
      flag: '🇮🇹',
      preloadPage: 'pages/recording-categories/index',
      preloadPageName: '录音分类',
      preloadPageIcon: '📂',
      description: '意大利罗马机场陆空通话录音将通过录音分类页面自动预加载'
    },
    'uae': {
      packageName: 'packageUAE',
      regionName: '阿联酋迪拜机场',
      flag: '🇦🇪',
      preloadPage: 'pages/recording-categories/index',
      preloadPageName: '录音分类',
      preloadPageIcon: '📂',
      description: '阿联酋迪拜机场陆空通话录音将通过录音分类页面自动预加载'
    },
    'uk': {
      packageName: 'packageUK',
      regionName: '英国伦敦希斯罗机场',
      flag: '🇬🇧',
      preloadPage: 'packageCommFailure/pages/index',
      preloadPageName: '通信失效',
      preloadPageIcon: '📡',
      description: '英国伦敦希斯罗机场陆空通话录音将通过通信失效页面自动预加载'
    },
    'chinese-taipei': {
      packageName: 'packageTaipei',
      regionName: '中国台北松山机场',
      flag: '🇨🇳',
      preloadPage: 'packageCommFailure/pages/index',
      preloadPageName: '通信失效',
      preloadPageIcon: '📡',
      description: '中国台北松山机场陆空通话录音将通过通信失效页面自动预加载'
    },
    'macau': {
      packageName: 'packageMacau',
      regionName: '中国澳门国际机场',
      flag: '🇲🇴',
      preloadPage: 'pages/recording-clips/index',
      preloadPageName: '录音片段',
      preloadPageIcon: '🎬',
      description: '中国澳门国际机场陆空通话录音将通过录音片段页面自动预加载'
    },
    'hongkong': {
      packageName: 'packageHongKong',
      regionName: '中国香港国际机场',
      flag: '🇭🇰',
      preloadPage: 'pages/operations/index',
      preloadPageName: '通信',
      preloadPageIcon: '📡',
      description: '中国香港国际机场陆空通话录音将通过通信页面自动预加载'
    },
    'canada': {
      packageName: 'packageCanada',
      regionName: '加拿大温哥华国际机场',
      flag: '🇨🇦',
      preloadPage: 'pages/home/index',
      preloadPageName: '我的首页',
      preloadPageIcon: '👤',
      description: '加拿大温哥华国际机场陆空通话录音将通过我的首页自动预加载'
    },
    'new-zealand': {
      packageName: 'packageNewZealand',
      regionName: '新西兰奥克兰机场',
      flag: '🇳🇿',
      preloadPage: 'pages/home/index',
      preloadPageName: '我的首页',
      preloadPageIcon: '👤',
      description: '新西兰奥克兰机场陆空通话录音将通过我的首页自动预加载'
    },
    'malaysia': {
      packageName: 'packageMalaysia',
      regionName: '马来西亚吉隆坡国际机场',
      flag: '🇲🇾',
      preloadPage: 'pages/airline-recordings/index',
      preloadPageName: '航线录音',
      preloadPageIcon: '📻',
      description: '马来西亚吉隆坡国际机场陆空通话录音将通过航线录音页面自动预加载'
    },
    'indonesia': {
      packageName: 'packageIndonesia',
      regionName: '印度尼西亚雅加达国际机场',
      flag: '🇮🇩',
      preloadPage: 'pages/airline-recordings/index',
      preloadPageName: '航线录音',
      preloadPageIcon: '📻',
      description: '印度尼西亚雅加达国际机场陆空通话录音将通过航线录音页面自动预加载'
    },
    'vietnam': {
      packageName: 'packageVietnam',
      regionName: '越南胡志明/河内机场',
      flag: '🇻🇳',
      preloadPage: 'pages/recording-clips/index',
      preloadPageName: '录音片段',
      preloadPageIcon: '🎬',
      description: '越南胡志明/河内机场陆空通话录音将通过录音片段页面自动预加载'
    },
    'india': {
      packageName: 'packageIndia',
      regionName: '印度德里机场',
      flag: '🇮🇳',
      preloadPage: 'pages/operations/index',
      preloadPageName: '通信',
      preloadPageIcon: '📡',
      description: '印度德里机场陆空通话录音将通过通信页面自动预加载'
    },
    'cambodia': {
      packageName: 'packageCambodia',
      regionName: '柬埔寨金边机场',
      flag: '🇰🇭',
      preloadPage: 'pages/operations/index',
      preloadPageName: '通信',
      preloadPageIcon: '📡',
      description: '柬埔寨金边机场陆空通话录音将通过通信页面自动预加载'
    },
    'myanmar': {
      packageName: 'packageMyanmar',
      regionName: '缅甸仰光机场',
      flag: '🇲🇲',
      preloadPage: 'pages/recording-clips/index',
      preloadPageName: '录音片段',
      preloadPageIcon: '🎬',
      description: '缅甸仰光机场陆空通话录音将通过录音片段页面自动预加载'
    },
    'uzbekistan': {
      packageName: 'packageUzbekistan',
      regionName: '乌兹别克斯坦塔什干机场',
      flag: '🇺🇿',
      preloadPage: 'packageCommFailure/pages/index',
      preloadPageName: '通信失效',
      preloadPageIcon: '📡',
      description: '乌兹别克斯坦塔什干机场陆空通话录音将通过通信失效页面自动预加载'
    },
    'maldive': {
      packageName: 'packageMaldive',
      regionName: '马尔代夫马累机场',
      flag: '🇲🇻',
      preloadPage: 'pages/audio-player/index',
      preloadPageName: '音频播放',
      preloadPageIcon: '🎵',
      description: '马尔代夫马累机场陆空通话录音将通过音频播放页面自动预加载'
    },
    'spain': {
      packageName: 'packageSpain',
      regionName: '西班牙马德里机场',
      flag: '🇪🇸',
      preloadPage: 'pages/audio-player/index',
      preloadPageName: '音频播放',
      preloadPageIcon: '🎵',
      description: '西班牙马德里机场陆空通话录音将通过音频播放页面自动预加载'
    },
    'germany': {
      packageName: 'packageGermany',
      regionName: '德国法兰克福机场',
      flag: '🇩🇪',
      preloadPage: 'pages/audio-player/index',
      preloadPageName: '音频播放',
      preloadPageIcon: '🎵',
      description: '德国法兰克福机场陆空通话录音将通过音频播放页面自动预加载'
    },
    'holland': {
      packageName: 'packageHolland',
      regionName: '荷兰阿姆斯特丹史基浦机场',
      flag: '🇳🇱',
      preloadPage: 'pages/airline-recordings/index',
      preloadPageName: '航线录音',
      preloadPageIcon: '📻',
      description: '荷兰阿姆斯特丹史基浦机场陆空通话录音将通过航线录音页面自动预加载'
    },
    'egypt': {
      packageName: 'packageEgypt',
      regionName: '埃及开罗国际机场',
      flag: '🇪🇬',
      preloadPage: 'pages/operations/index',
      preloadPageName: '通信',
      preloadPageIcon: '📡',
      description: '埃及开罗国际机场陆空通话录音将通过通信页面自动预加载'
    }
  };

  // 初始化本地存储系统
  this.initPreloadStorage();

  console.log('🎯 音频分包预加载引导配置管理器已初始化');
}

/**
 * 清理可能在开发者工具环境下错误保存的预加载状态
 * @param {Object} preloadStatus 当前预加载状态
 */
AudioPreloadGuide.prototype.cleanupInvalidPreloadStatus = function(preloadStatus) {
  try {
    // 检查版本号
    var currentVersion = preloadStatus._version || 1;

    if (currentVersion < PRELOAD_STATUS_VERSION) {
      console.log('🧹 检测到旧版本预加载状态 (v' + currentVersion + ')，需要清理');
      console.log('📋 旧状态包含的地区:', Object.keys(preloadStatus).filter(function(k) { return k !== '_version'; }));

      // 清除所有旧版本的预加载状态
      var newStatus = {
        _version: PRELOAD_STATUS_VERSION
      };

      wx.setStorageSync('flight_toolbox_audio_preload_status', newStatus);
      console.log('✅ 已清理旧版本预加载状态，升级到 v' + PRELOAD_STATUS_VERSION);
      console.log('💡 提示：音频分包将在访问对应页面时自动预加载');
    } else if (!preloadStatus._version) {
      // 添加版本号到现有状态
      preloadStatus._version = PRELOAD_STATUS_VERSION;
      wx.setStorageSync('flight_toolbox_audio_preload_status', preloadStatus);
      console.log('✅ 已为预加载状态添加版本号: v' + PRELOAD_STATUS_VERSION);
    }
  } catch (error) {
    console.error('❌ 清理预加载状态失败:', error);
  }
};

/**
 * 初始化预加载状态存储系统
 * 确保本地存储中有预加载状态对象，并进行向后兼容处理
 */
AudioPreloadGuide.prototype.initPreloadStorage = function() {
  try {
    // 检查是否已有预加载状态存储
    var preloadStatus = wx.getStorageSync('flight_toolbox_audio_preload_status');

    if (!preloadStatus || typeof preloadStatus !== 'object') {
      // 首次使用，初始化空的预加载状态对象（包含版本号）
      wx.setStorageSync('flight_toolbox_audio_preload_status', {
        _version: PRELOAD_STATUS_VERSION
      });
      console.log('🎯 已初始化音频预加载状态存储系统 (v' + PRELOAD_STATUS_VERSION + ')');
    } else {
      console.log('🔍 音频预加载状态存储系统已存在，当前状态:', preloadStatus);

      // 🆕 检查并清理可能在开发者工具环境下错误保存的预加载状态
      this.cleanupInvalidPreloadStatus(preloadStatus);

      // 检查已有状态的有效性
      var validRegions = Object.keys(this.preloadPageMapping);
      var hasInvalidRegions = false;

      Object.keys(preloadStatus).forEach(function(regionId) {
        // 跳过版本号字段
        if (regionId === '_version') return;

        if (validRegions.indexOf(regionId) === -1) {
          console.warn('⚠️ 发现无效的预加载状态记录:', regionId);
          hasInvalidRegions = true;
        }
      });

      if (hasInvalidRegions) {
        console.log('🧹 清理无效的预加载状态记录...');
        var cleanedStatus = {
          _version: preloadStatus._version || PRELOAD_STATUS_VERSION
        };
        validRegions.forEach(function(regionId) {
          if (preloadStatus[regionId]) {
            cleanedStatus[regionId] = preloadStatus[regionId];
          }
        });
        wx.setStorageSync('flight_toolbox_audio_preload_status', cleanedStatus);
        console.log('✅ 已清理无效记录，当前有效状态:', cleanedStatus);
      }
    }
  } catch (error) {
    console.error('❌ 初始化预加载状态存储系统失败:', error);
    // 出现错误时尝试重置存储
    try {
      wx.setStorageSync('flight_toolbox_audio_preload_status', {
        _version: PRELOAD_STATUS_VERSION
      });
      console.log('🔄 已重置预加载状态存储系统');
    } catch (resetError) {
      console.error('❌ 重置预加载状态存储系统也失败:', resetError);
    }
  }
};

/**
 * 获取指定地区的预加载引导信息
 * @param {string} regionId 地区ID
 * @returns {Object|null} 预加载引导信息
 */
AudioPreloadGuide.prototype.getPreloadGuide = function(regionId) {
  var guide = this.preloadPageMapping[regionId];
  
  if (!guide) {
    console.warn('⚠️ 未找到地区 ' + regionId + ' 的预加载引导配置');
    return null;
  }
  
  return {
    regionId: regionId,
    regionName: guide.regionName,
    flag: guide.flag,
    packageName: guide.packageName,
    preloadPage: guide.preloadPage,
    preloadPageName: guide.preloadPageName,
    preloadPageIcon: guide.preloadPageIcon,
    description: guide.description
  };
};

/**
 * 生成用户友好的引导提示文案
 * @param {string} regionId 地区ID
 * @returns {Object} 引导提示文案
 */
AudioPreloadGuide.prototype.generateGuideMessage = function(regionId) {
  var guide = this.getPreloadGuide(regionId);
  
  if (!guide) {
    return {
      title: '音频资源加载失败',
      content: '抱歉，无法加载该地区的音频资源。请检查网络连接或稍后再试。',
      actionText: '重试',
      canNavigate: false
    };
  }
  
  return {
    title: guide.flag + ' ' + guide.regionName + ' 音频资源',
    content: '要播放 ' + guide.regionName + ' 的陆空通话录音，首次需要先去指定页面自动加载音频资源。\n\n' +
             '请点击下方按钮访问 ' + guide.preloadPageIcon + ' ' + guide.preloadPageName + ' 页面，' +
             '系统将自动为您预加载音频资源。',
    actionText: '前往',
    actionIcon: guide.preloadPageIcon,
    canNavigate: true,
    targetPage: guide.preloadPage,
    description: guide.description
  };
};

/**
 * 检查音频分包是否已预加载
 * @param {string} regionId 地区ID
 * @returns {Promise<boolean>} 是否已预加载
 */
AudioPreloadGuide.prototype.checkPackagePreloaded = function(regionId) {
  var guide = this.getPreloadGuide(regionId);
  
  if (!guide) {
    console.warn('⚠️ 未找到地区 ' + regionId + ' 的预加载引导配置');
    return Promise.resolve(false);
  }
  
  return new Promise(function(resolve) {
    try {
      // 从本地存储检查预加载状态
      var preloadStatus = wx.getStorageSync('flight_toolbox_audio_preload_status') || {};
      var isPreloaded = !!preloadStatus[regionId];
      
      console.log('🔍 检查地区 ' + regionId + ' 预加载状态:', isPreloaded ? '已预加载' : '未预加载');
      console.log('📱 当前所有预加载状态:', preloadStatus);
      
      resolve(isPreloaded);
    } catch (error) {
      console.error('❌ 检查分包预加载状态失败:', error);
      resolve(false);
    }
  });
};

/**
 * 跳转到预加载页面
 * @param {string} regionId 地区ID
 * @returns {Promise<boolean>} 是否成功跳转
 */
AudioPreloadGuide.prototype.navigateToPreloadPage = function(regionId) {
  var self = this;
  var guide = this.getPreloadGuide(regionId);

  if (!guide) {
    console.error('❌ 无法跳转：未找到地区 ' + regionId + ' 的预加载页面配置');
    return Promise.resolve(false);
  }

  return new Promise(function(resolve) {
    try {
      var targetPage = guide.preloadPage;
      var fullUrl = '/' + targetPage;
      var tabbarPages = TABBAR_PAGES;

      var navigateSuccessHandler = function() {
        console.log('✅ 成功跳转到预加载页面:', fullUrl);
        self.markPackagePreloaded(regionId);
        console.log('✅ 已标记地区 ' + regionId + ' 为已引导状态');
        resolve(true);
      };

      var navigateFailHandler = function(error) {
        console.error('❌ 跳转到预加载页面失败:', error);
        wx.showToast({
          title: '跳转失败，请手动前往相关页面',
          icon: 'none',
          duration: 2000
        });
        resolve(false);
      };

      if (tabbarPages.indexOf(fullUrl) > -1) {
        wx.switchTab({
          url: fullUrl,
          success: navigateSuccessHandler,
          fail: navigateFailHandler
        });
      } else if (targetPage.indexOf('packageO/') === 0 || targetPage.indexOf('package') === 0) {
        wx.navigateTo({
          url: fullUrl,
          success: navigateSuccessHandler,
          fail: navigateFailHandler
        });
      } else {
        wx.navigateTo({
          url: fullUrl,
          success: navigateSuccessHandler,
          fail: navigateFailHandler
        });
      }
    } catch (error) {
      console.error('❌ 跳转到预加载页面时发生异常:', error);
      resolve(false);
    }
  });
};

/**
 * 显示预加载引导对话框
 * @param {string} regionId 地区ID
 * @returns {Promise<boolean>} 用户是否选择跳转
 */
AudioPreloadGuide.prototype.showPreloadGuideDialog = function(regionId) {
  var self = this;
  
  console.log('🎯 AudioPreloadGuide.showPreloadGuideDialog 被调用');
  console.log('🔍 regionId:', regionId);
  
  var guideMessage = this.generateGuideMessage(regionId);
  console.log('🔍 生成的引导消息:', guideMessage);
  
  return new Promise(function(resolve) {
    if (!guideMessage.canNavigate) {
      // 无法导航的情况，只显示简单提示
      wx.showModal({
        title: guideMessage.title,
        content: guideMessage.content,
        showCancel: false,
        confirmText: guideMessage.actionText,
        success: function() {
          resolve(false);
        },
        fail: function() {
          resolve(false);
        }
      });
      return;
    }
    
    // 显示引导对话框
    console.log('🎯 准备显示引导对话框');
    console.log('🔍 对话框配置:', {
      title: guideMessage.title,
      content: guideMessage.content,
      confirmText: guideMessage.actionText,
      cancelText: '稍后再说'
    });
    
    // 添加短暂延迟确保对话框能够正常显示
    setTimeout(function() {
      console.log('🎯 延迟后显示对话框');
      wx.showModal({
      title: guideMessage.title,
      content: guideMessage.content,
      confirmText: guideMessage.actionText,
      cancelText: '稍后再说',
      success: function(res) {
        console.log('🎯 wx.showModal success 回调被调用');
        console.log('🔍 用户选择结果:', res);
        
        if (res.confirm) {
          console.log('🎯 用户选择前往预加载页面:', guideMessage.targetPage);
          // 用户选择跳转
          self.navigateToPreloadPage(regionId).then(function(success) {
            resolve(success);
          });
        } else {
          console.log('🤷 用户选择稍后再说');
          resolve(false);
        }
      },
      fail: function(error) {
        console.error('❌ wx.showModal fail 回调被调用:', error);
        resolve(false);
      }
    });
    }, 500); // 500ms延迟
  });
};

/**
 * 标记音频分包为已预加载
 * @param {string} regionId 地区ID
 * @returns {boolean} 是否成功标记
 */
AudioPreloadGuide.prototype.markPackagePreloaded = function(regionId) {
  var guide = this.getPreloadGuide(regionId);

  if (!guide) {
    console.warn('⚠️ 无法标记未知地区 ' + regionId + ' 的预加载状态');
    return false;
  }

  try {
    // 获取当前预加载状态
    var preloadStatus = wx.getStorageSync('flight_toolbox_audio_preload_status') || {};

    // 确保版本号存在
    if (!preloadStatus._version) {
      preloadStatus._version = PRELOAD_STATUS_VERSION;
    }

    // 标记该地区为已预加载（记录时间戳）
    preloadStatus[regionId] = Date.now();

    // 保存到本地存储
    wx.setStorageSync('flight_toolbox_audio_preload_status', preloadStatus);

    console.log('✅ 已标记地区 ' + regionId + ' (' + guide.regionName + ') 为预加载完成');
    console.log('📱 更新后的预加载状态:', preloadStatus);

    return true;
  } catch (error) {
    console.error('❌ 标记预加载状态失败:', error);
    return false;
  }
};

/**
 * 清除指定地区的预加载状态（调试用）
 * @param {string} regionId 地区ID，如果为空则清除所有状态
 * @returns {boolean} 是否成功清除
 */
AudioPreloadGuide.prototype.clearPreloadStatus = function(regionId) {
  try {
    if (!regionId) {
      // 清除所有预加载状态
      wx.setStorageSync('flight_toolbox_audio_preload_status', {});
      console.log('🧹 已清除所有音频预加载状态');
    } else {
      // 清除指定地区的预加载状态
      var preloadStatus = wx.getStorageSync('flight_toolbox_audio_preload_status') || {};
      delete preloadStatus[regionId];
      wx.setStorageSync('flight_toolbox_audio_preload_status', preloadStatus);
      console.log('🧹 已清除地区 ' + regionId + ' 的预加载状态');
    }
    return true;
  } catch (error) {
    console.error('❌ 清除预加载状态失败:', error);
    return false;
  }
};

/**
 * 获取所有地区的预加载状态
 * @returns {Promise<Object>} 所有地区的预加载状态
 */
AudioPreloadGuide.prototype.getAllPreloadStatus = function() {
  var self = this;
  var regionIds = Object.keys(this.preloadPageMapping);
  var promises = [];
  
  regionIds.forEach(function(regionId) {
    promises.push(
      self.checkPackagePreloaded(regionId).then(function(isPreloaded) {
        return {
          regionId: regionId,
          isPreloaded: isPreloaded,
          guide: self.getPreloadGuide(regionId)
        };
      })
    );
  });
  
  return Promise.all(promises).then(function(results) {
    var status = {};
    results.forEach(function(result) {
      status[result.regionId] = result;
    });
    return status;
  });
};

// 导出构造函数
module.exports = AudioPreloadGuide;