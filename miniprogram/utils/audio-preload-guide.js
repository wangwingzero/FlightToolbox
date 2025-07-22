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

function AudioPreloadGuide() {
  // 音频分包预加载页面映射配置
  // 基于 app.json 中的 preloadRule 配置
  this.preloadPageMapping = {
    'japan': {
      packageName: 'packageJapan',
      regionName: '日本成田机场',
      flag: '🇯🇵',
      preloadPage: 'pages/audio-player/index',
      preloadPageName: '音频播放器',
      preloadPageIcon: '🎵',
      description: '日本成田机场陆空通话录音将通过音频播放器页面自动预加载'
    },
    'philippines': {
      packageName: 'packagePhilippines',
      regionName: '菲律宾马尼拉机场',
      flag: '🇵🇭',
      preloadPage: 'pages/operations/index',
      preloadPageName: '航班运行',
      preloadPageIcon: '✈️',
      description: '菲律宾马尼拉机场陆空通话录音将通过航班运行页面自动预加载'
    },
    'korea': {
      packageName: 'packageKorean',
      regionName: '韩国仁川机场',
      flag: '🇰🇷',
      preloadPage: 'pages/home/index',
      preloadPageName: '我的首页',
      preloadPageIcon: '🏠',
      description: '韩国仁川机场陆空通话录音将通过我的首页自动预加载'
    },
    'singapore': {
      packageName: 'packageSingapore',
      regionName: '新加坡樟宜机场',
      flag: '🇸🇬',
      preloadPage: 'pages/operations/index',
      preloadPageName: '航班运行',
      preloadPageIcon: '✈️',
      description: '新加坡樟宜机场陆空通话录音将通过航班运行页面自动预加载'
    },
    'russia': {
      packageName: 'packageRussia',
      regionName: '俄罗斯莫斯科机场',
      flag: '🇷🇺',
      preloadPage: 'pages/recording-categories/index',
      preloadPageName: '录音分类',
      preloadPageIcon: '📂',
      description: '俄罗斯莫斯科机场陆空通话录音将通过录音分类页面自动预加载'
    },
    'thailand': {
      packageName: 'packageThailand',
      regionName: '泰国曼谷机场',
      flag: '🇹🇭',
      preloadPage: 'packageO/personal-checklist/index',
      preloadPageName: '个人检查单',
      preloadPageIcon: '📋',
      description: '泰国曼谷机场陆空通话录音将通过个人检查单页面自动预加载'
    },
    'srilanka': {
      packageName: 'packageSrilanka',
      regionName: '斯里兰卡科伦坡机场',
      flag: '🇱🇰',
      preloadPage: 'pages/recording-clips/index',
      preloadPageName: '录音片段',
      preloadPageIcon: '🎙️',
      description: '斯里兰卡科伦坡机场陆空通话录音将通过录音片段页面自动预加载'
    },
    'france': {
      packageName: 'packageFrance',
      regionName: '法国戴高乐机场',
      flag: '🇫🇷',
      preloadPage: 'packageO/flight-time-share/index',
      preloadPageName: '飞行时间分享',
      preloadPageIcon: '⏰',
      description: '法国戴高乐机场陆空通话录音将通过飞行时间分享页面自动预加载'
    },
    'australia': {
      packageName: 'packageAustralia',
      regionName: '澳大利亚悉尼机场',
      flag: '🇦🇺',
      preloadPage: 'pages/home/index',
      preloadPageName: '我的首页',
      preloadPageIcon: '🏠',
      description: '澳大利亚悉尼机场陆空通话录音将通过首页自动预加载'
    },
    'usa': {
      packageName: 'packageAmerica',
      regionName: '美国旧金山机场',
      flag: '🇺🇸',
      preloadPage: 'pages/airline-recordings/index',
      preloadPageName: '航线录音',
      preloadPageIcon: '🎵',
      description: '美国旧金山机场陆空通话录音将通过航线录音页面自动预加载'
    },
    'turkey': {
      packageName: 'packageTurkey',
      regionName: '土耳其伊斯坦布尔机场',
      flag: '🇹🇷',
      preloadPage: 'packageO/sunrise-sunset/index',
      preloadPageName: '日出日落',
      preloadPageIcon: '🌅',
      description: '土耳其伊斯坦布尔机场陆空通话录音将通过日出日落页面自动预加载'
    },
    'italy': {
      packageName: 'packageItaly',
      regionName: '意大利罗马机场',
      flag: '🇮🇹',
      preloadPage: 'pages/communication-failure/index',
      preloadPageName: '通信失效程序',
      preloadPageIcon: '📡',
      description: '意大利罗马机场陆空通话录音将通过通信失效程序页面自动预加载'
    },
    'uae': {
      packageName: 'packageUAE',
      regionName: '阿联酋迪拜机场',
      flag: '🇦🇪',
      preloadPage: 'pages/medical-standards/index',
      preloadPageName: '体检标准',
      preloadPageIcon: '🏥',
      description: '阿联酋迪拜机场陆空通话录音将通过体检标准页面自动预加载'
    }
  };

  console.log('🎯 音频分包预加载引导配置管理器已初始化');
}

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
    return Promise.resolve(false);
  }
  
  return new Promise(function(resolve) {
    try {
      // 构建分包路径
      var packageRoot = guide.packageName.replace('AudioPackage', '').replace('Package', '');
      var packagePath = '/miniprogram/' + packageRoot + '/';
      
      console.log('🔍 检查分包路径:', packagePath);
      
      // 尝试访问分包资源
      wx.getFileSystemManager().access({
        path: packagePath,
        success: function() {
          console.log('✅ 分包 ' + guide.packageName + ' 已预加载');
          resolve(true);
        },
        fail: function(error) {
          console.log('❌ 分包 ' + guide.packageName + ' 尚未预加载，错误:', error);
          
          // 尝试不同的路径格式
          var altPath = '/' + packageRoot + '/';
          wx.getFileSystemManager().access({
            path: altPath,
            success: function() {
              console.log('✅ 分包 ' + guide.packageName + ' 已预加载 (备用路径)');
              resolve(true);
            },
            fail: function() {
              console.log('❌ 分包 ' + guide.packageName + ' 确实尚未预加载');
              resolve(false);
            }
          });
        }
      });
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
  var guide = this.getPreloadGuide(regionId);
  
  if (!guide) {
    console.error('❌ 无法跳转：未找到地区 ' + regionId + ' 的预加载页面配置');
    return Promise.resolve(false);
  }
  
  return new Promise(function(resolve) {
    try {
      var targetPage = guide.preloadPage;
      
      // 检查是否是分包页面
      if (targetPage.indexOf('packageO/') === 0) {
        // 分包页面使用相对路径
        wx.navigateTo({
          url: '/' + targetPage,
          success: function() {
            console.log('✅ 成功跳转到分包预加载页面:', targetPage);
            resolve(true);
          },
          fail: function(error) {
            console.error('❌ 跳转到分包预加载页面失败:', error);
            resolve(false);
          }
        });
      } else {
        // 主包页面使用绝对路径
        wx.navigateTo({
          url: '/' + targetPage,
          success: function() {
            console.log('✅ 成功跳转到主包预加载页面:', targetPage);
            resolve(true);
          },
          fail: function(error) {
            console.error('❌ 跳转到主包预加载页面失败:', error);
            resolve(false);
          }
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