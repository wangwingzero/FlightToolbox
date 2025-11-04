/**
 * 音频分包按需加载管理器
 * 实现用户点击国家卡片时异步加载对应的音频分包
 *
 * 核心功能：
 * 1. 按需异步加载音频分包
 * 2. 加载状态管理和缓存
 * 3. 用户友好的加载反馈
 * 4. 错误处理和重试机制
 * 5. 离线优先的设计理念
 */

// ==================== 依赖引入 ====================
var EnvDetector = require('./env-detector.js');

function AudioPackageLoader() {
  // 分包加载状态缓存
  this.loadedPackages = {};
  this.loadingPromises = {};

  // 初始化音频预加载引导器（用于持久化状态）
  try {
    var AudioPreloadGuide = require('./audio-preload-guide.js');
    this.audioPreloadGuide = new AudioPreloadGuide();
    console.log('🎯 音频分包加载管理器已连接预加载引导器');
  } catch (error) {
    console.warn('⚠️ 无法连接音频预加载引导器:', error);
    this.audioPreloadGuide = null;
  }

  // 音频分包映射配置
  this.packageMapping = {
    'japan': {
      packageName: 'japanAudioPackage',
      packageRoot: 'packageJapan',
      displayName: '日本成田机场',
      flag: '🇯🇵'
    },
    'philippines': {
      packageName: 'philippineAudioPackage', 
      packageRoot: 'packagePhilippines',
      displayName: '菲律宾马尼拉机场',
      flag: '🇵🇭'
    },
    'korea': {
      packageName: 'koreaAudioPackage',
      packageRoot: 'packageKorean',
      displayName: '韩国仁川机场',
      flag: '🇰🇷'
    },
    'singapore': {
      packageName: 'singaporeAudioPackage',
      packageRoot: 'packageSingapore',
      displayName: '新加坡樟宜机场',
      flag: '🇸🇬'
    },
    'malaysia': {
      packageName: 'malaysiaAudioPackage',
      packageRoot: 'packageMalaysia',
      displayName: '马来西亚吉隆坡国际机场',
      flag: '🇲🇾'
    },
    'indonesia': {
      packageName: 'indonesiaAudioPackage',
      packageRoot: 'packageIndonesia',
      displayName: '印度尼西亚雅加达国际机场',
      flag: '🇮🇩'
    },
    'vietnam': {
      packageName: 'vietnamAudioPackage',
      packageRoot: 'packageVietnam',
      displayName: '越南胡志明/河内机场',
      flag: '🇻🇳'
    },
    'india': {
      packageName: 'indiaAudioPackage',
      packageRoot: 'packageIndia',
      displayName: '印度德里机场',
      flag: '🇮🇳'
    },
    'cambodia': {
      packageName: 'cambodiaAudioPackage',
      packageRoot: 'packageCambodia',
      displayName: '柬埔寨金边机场',
      flag: '🇰🇭'
    },
    'myanmar': {
      packageName: 'myanmarAudioPackage',
      packageRoot: 'packageMyanmar',
      displayName: '缅甸仰光机场',
      flag: '🇲🇲'
    },
    'uzbekistan': {
      packageName: 'uzbekistanAudioPackage',
      packageRoot: 'packageUzbekistan',
      displayName: '乌兹别克斯坦塔什干机场',
      flag: '🇺🇿'
    },
    'maldive': {
      packageName: 'maldiveAudioPackage',
      packageRoot: 'packageMaldive',
      displayName: '马尔代夫马累机场',
      flag: '🇲🇻'
    },
    'spain': {
      packageName: 'spainAudioPackage',
      packageRoot: 'packageSpain',
      displayName: '西班牙马德里机场',
      flag: '🇪🇸'
    },
    'germany': {
      packageName: 'germanyAudioPackage',
      packageRoot: 'packageGermany',
      displayName: '德国法兰克福机场',
      flag: '🇩🇪'
    },
    'holland': {
      packageName: 'hollandAudioPackage',
      packageRoot: 'packageHolland',
      displayName: '荷兰阿姆斯特丹史基浦机场',
      flag: '🇳🇱'
    },
    'thailand': {
      packageName: 'thailandAudioPackage',
      packageRoot: 'packageThailand',
      displayName: '泰国曼谷机场',
      flag: '🇹🇭'
    },
    'russia': {
      packageName: 'russiaAudioPackage',
      packageRoot: 'packageRussia',
      displayName: '俄罗斯莫斯科机场',
      flag: '🇷🇺'
    },
    'turkey': {
      packageName: 'turkeyAudioPackage',
      packageRoot: 'packageTurkey',
      displayName: '土耳其伊斯坦布尔机场',
      flag: '🇹🇷'
    },
    'srilanka': {
      packageName: 'srilankaAudioPackage',
      packageRoot: 'packageSrilanka',
      displayName: '斯里兰卡科伦坡机场',
      flag: '🇱🇰'
    },
    'australia': {
      packageName: 'australiaAudioPackage',
      packageRoot: 'packageAustralia',
      displayName: '澳大利亚悉尼机场',
      flag: '🇦🇺'
    },
    'france': {
      packageName: 'franceAudioPackage',
      packageRoot: 'packageFrance',
      displayName: '法国戴高乐机场',
      flag: '🇫🇷'
    },
    'usa': {
      packageName: 'americaAudioPackage',
      packageRoot: 'packageAmerica',
      displayName: '美国旧金山机场',
      flag: '🇺🇸'
    },
    'italy': {
      packageName: 'italyAudioPackage',
      packageRoot: 'packageItaly',
      displayName: '意大利罗马机场',
      flag: '🇮🇹'
    },
    'uae': {
      packageName: 'uaeAudioPackage',
      packageRoot: 'packageUAE',
      displayName: '阿联酋迪拜机场',
      flag: '🇦🇪'
    },
    'uk': {
      packageName: 'ukAudioPackage',
      packageRoot: 'packageUK',
      displayName: '英国伦敦希斯罗机场',
      flag: '🇬🇧'
    },
    'chinese-taipei': {
      packageName: 'chineseTaipeiAudioPackage',
      packageRoot: 'packageTaipei',
      displayName: '中国台北松山机场',
      flag: '🇨🇳'
    },
    'macau': {
      packageName: 'chineseMacauAudioPackage',
      packageRoot: 'packageMacau',
      displayName: '中国澳门国际机场',
      flag: '🇲🇴'
    },
    'hongkong': {
      packageName: 'chineseHongKongAudioPackage',
      packageRoot: 'packageHongKong',
      displayName: '中国香港国际机场',
      flag: '🇭🇰'
    },
    'canada': {
      packageName: 'canadaAudioPackage',
      packageRoot: 'packageCanada',
      displayName: '加拿大温哥华国际机场',
      flag: '🇨🇦'
    },
    'new-zealand': {
      packageName: 'newZealandAudioPackage',
      packageRoot: 'packageNewZealand',
      displayName: '新西兰奥克兰机场',
      flag: '🇳🇿'
    },
    'egypt': {
      packageName: 'egyptAudioPackage',
      packageRoot: 'packageEgypt',
      displayName: '埃及开罗国际机场',
      flag: '🇪🇬'
    }
  };
  
  console.log('🎵 音频分包加载管理器已初始化');
}

/**
 * 主要方法：按需加载音频分包
 * @param {string} regionId 地区ID
 * @returns {Promise<boolean>} 加载是否成功
 */
AudioPackageLoader.prototype.loadAudioPackageOnDemand = function(regionId) {
  var self = this;
  var packageInfo = this.packageMapping[regionId];
  
  if (!packageInfo) {
    console.warn('⚠️ 未找到地区 ' + regionId + ' 的分包配置');
    return Promise.resolve(false);
  }

  var packageName = packageInfo.packageName;
  var displayName = packageInfo.displayName;
  var flag = packageInfo.flag;

  // 检查是否已经加载
  if (this.loadedPackages[packageName]) {
    console.log('✅ 分包 ' + packageName + ' 已加载，直接使用');
    return Promise.resolve(true);
  }

  // 检查是否正在加载
  if (this.loadingPromises[packageName]) {
    console.log('⏳ 分包 ' + packageName + ' 正在加载中，等待完成...');
    return this.loadingPromises[packageName];
  }

  // 开始新的加载流程
  console.log('🚀 开始按需加载分包: ' + packageName + ' (' + flag + ' ' + displayName + ')');
  console.log('📦 分包配置信息:', {
    regionId: regionId,
    packageName: packageName,
    packageRoot: packageInfo.packageRoot,
    displayName: displayName
  });
  
  var loadingPromise = this.performPackageLoad(packageInfo);
  this.loadingPromises[packageName] = loadingPromise;
  
  return loadingPromise.then(function(result) {
    // 清理加载Promise
    delete self.loadingPromises[packageName];
    return result;
  }).catch(function(error) {
    // 清理加载Promise
    delete self.loadingPromises[packageName];
    throw error;
  });
};

/**
 * 执行分包加载的核心逻辑
 * @param {Object} packageInfo 分包信息
 * @returns {Promise<boolean>}
 */
AudioPackageLoader.prototype.performPackageLoad = function(packageInfo) {
  var self = this;
  var packageName = packageInfo.packageName;
  var packageRoot = packageInfo.packageRoot;
  var displayName = packageInfo.displayName;
  var flag = packageInfo.flag;
  
  // 1. 显示加载提示
  wx.showLoading({
    title: flag + ' 加载' + displayName + '音频资源...',
    mask: true
  });

  return new Promise(function(resolve, reject) {
    try {
      // 2. 检查环境支持（使用统一的EnvDetector工具）
      if (EnvDetector.isDevTools()) {
        console.log('⚠️ 开发者工具环境不支持wx.loadSubpackage，在真机上会正常工作');
        wx.hideLoading();

        // 仅在会话中标记为已加载（不持久化，因为分包实际未加载）
        self.loadedPackages[packageName] = true;

        // ⚠️ 开发者工具环境不持久化预加载状态
        // 因为分包实际上没有加载，持久化会导致误判
        console.log('⚠️ 开发者工具环境：不持久化预加载状态，避免误判');

        wx.showToast({
          title: flag + ' 音频资源准备就绪（开发者工具模式）',
          icon: 'none',
          duration: 1500
        });

        resolve(true);
        return;
      }

      // 3. 真机环境：执行异步分包加载
      console.log('🚀 开始异步加载音频分包:', packageName);
      
      wx.loadSubpackage({
        name: packageName,
        success: function(res) {
          wx.hideLoading();
          console.log('✅ 成功加载音频分包:', packageName);
          
          // 标记分包已加载
          self.loadedPackages[packageName] = true;
          
          // 🆕 持久化保存预加载状态
          if (self.audioPreloadGuide) {
            // 从packageName反向推导regionId
            var regionId = self.getRegionIdFromPackageName(packageName);
            if (regionId) {
              var markSuccess = self.audioPreloadGuide.markPackagePreloaded(regionId);
              if (markSuccess) {
                console.log('✅ 已持久化保存 ' + regionId + ' 的预加载状态');
              } else {
                console.warn('⚠️ 保存 ' + regionId + ' 预加载状态失败');
              }
            } else {
              console.warn('⚠️ 无法从分包名称 ' + packageName + ' 推导regionId');
            }
          } else {
            console.warn('⚠️ 音频预加载引导器不可用，无法持久化状态');
          }
          
          wx.showToast({
            title: flag + ' 音频资源加载完成',
            icon: 'success',
            duration: 1000
          });
          
          resolve(true);
        },
        fail: function(res) {
          wx.hideLoading();
          console.error('❌ 加载音频分包失败:', packageName, res);
          
          wx.showModal({
            title: '加载失败',
            content: flag + ' ' + displayName + '音频资源加载失败，请检查网络连接后重试。\n\n错误信息: ' + (res.errMsg || '未知错误'),
            showCancel: true,
            cancelText: '取消',
            confirmText: '重试',
            success: function(modalRes) {
              if (modalRes.confirm) {
                // 重试加载
                self.loadAudioPackageOnDemand(regionId).then(resolve).catch(reject);
              } else {
                reject(new Error('用户取消加载'));
              }
            }
          });
        }
      });

    } catch (error) {
      console.error('❌ 分包 ' + packageName + ' 加载失败:', error);
      wx.hideLoading();
      
      // 显示用户友好的错误提示
      self.showLoadFailureDialog(displayName, flag).then(function(shouldRetry) {
        if (shouldRetry) {
          // 用户选择重试
          self.performPackageLoad(packageInfo).then(resolve).catch(reject);
        } else {
          // 用户选择继续（使用已有资源或兜底方案）
          resolve(false);
        }
      });
    }
  });
};

/**
 * 检查分包是否已经可用
 * @param {string} packageRoot 分包根目录
 * @returns {Promise<boolean>}
 */
AudioPackageLoader.prototype.checkPackageAvailability = function(packageRoot) {
  return new Promise(function(resolve) {
    try {
      console.log('📦 检查分包可用性:', packageRoot);
      
      // 尝试访问分包目录
      wx.getFileSystemManager().access({
        path: '/' + packageRoot + '/',
        success: function() {
          console.log('✅ 分包 ' + packageRoot + ' 已可用');
          resolve(true);
        },
        fail: function(accessError) {
          console.log('❌ 分包 ' + packageRoot + ' 不可用');
          console.log('📦 访问失败详情:', accessError);
          
          // 尝试另一种检查方法：尝试require分包文件
          try {
            var testPath = '/' + packageRoot + '/index.js';
            require(testPath);
            console.log('✅ 通过require检查发现分包 ' + packageRoot + ' 可用');
            resolve(true);
          } catch (requireError) {
            console.log('❌ require检查也失败:', requireError);
            resolve(false);
          }
        }
      });
    } catch (error) {
      console.error('❌ 检查分包 ' + packageRoot + ' 可用性时发生异常:', error);
      resolve(false);
    }
  });
};

/**
 * 带重试机制的分包加载
 * @param {string} packageName 分包名称
 * @param {number} maxRetries 最大重试次数
 * @returns {Promise<boolean>}
 */
AudioPackageLoader.prototype.loadSubpackageWithRetry = function(packageName, maxRetries) {
  if (maxRetries === undefined) maxRetries = 2;
  
  return new Promise(function(resolve, reject) {
    var retryCount = 0;

    function attemptLoad() {
      console.log('🔄 尝试加载分包:', packageName, '第' + (retryCount + 1) + '次尝试');
      
      wx.loadSubpackage({
        name: packageName,
        success: function(res) {
          console.log('✅ 分包 ' + packageName + ' 加载成功 (尝试 ' + (retryCount + 1) + '/' + (maxRetries + 1) + ')');
          console.log('📦 加载成功响应:', res);
          resolve(true);
        },
        fail: function(error) {
          console.error('❌ 分包 ' + packageName + ' 加载失败 (尝试 ' + (retryCount + 1) + '/' + (maxRetries + 1) + ')');
          console.error('📦 失败详情:', error);
          console.error('📦 错误码:', error.errCode);
          console.error('📦 错误信息:', error.errMsg);
          
          if (retryCount < maxRetries) {
            retryCount++;
            var delayMs = 1000 * retryCount; // 线性退避：1s, 2s, 3s...
            console.log('🔄 ' + delayMs + 'ms 后重试加载分包 ' + packageName + '...');
            
            setTimeout(attemptLoad, delayMs);
          } else {
            var detailedError = new Error('分包' + packageName + '加载失败，已重试' + maxRetries + '次。错误信息：' + (error.errMsg || '未知错误'));
            detailedError.originalError = error;
            reject(detailedError);
          }
        }
      });
    }

    attemptLoad();
  });
};

/**
 * 显示加载失败对话框
 * @param {string} displayName 显示名称
 * @param {string} flag 国旗emoji
 * @returns {Promise<boolean>} 用户是否选择重试
 */
AudioPackageLoader.prototype.showLoadFailureDialog = function(displayName, flag) {
  return new Promise(function(resolve) {
    wx.showModal({
      title: '音频资源加载失败',
      content: flag + ' ' + displayName + '的音频资源加载失败。\n\n可能原因：\n• 网络连接不稳定\n• 服务器暂时无响应\n\n您可以重试加载，或继续使用现有功能。',
      confirmText: '重试加载',
      cancelText: '稍后再试',
      success: function(res) {
        resolve(res.confirm);
      },
      fail: function() {
        resolve(false);
      }
    });
  });
};

/**
 * 获取分包加载状态
 * @param {string} regionId 地区ID
 * @returns {Object} 加载状态信息
 */
AudioPackageLoader.prototype.getPackageStatus = function(regionId) {
  var packageInfo = this.packageMapping[regionId];
  
  if (!packageInfo) {
    return {
      isSupported: false,
      isLoaded: false,
      isLoading: false
    };
  }

  var packageName = packageInfo.packageName;
  
  return {
    isSupported: true,
    isLoaded: !!this.loadedPackages[packageName],
    isLoading: !!this.loadingPromises[packageName],
    packageName: packageName
  };
};

/**
 * 获取所有分包的加载状态
 * @returns {Object} 所有分包状态
 */
AudioPackageLoader.prototype.getAllPackageStatus = function() {
  var status = {};
  var self = this;
  
  Object.keys(this.packageMapping).forEach(function(regionId) {
    status[regionId] = self.getPackageStatus(regionId);
  });
  
  return status;
};

/**
 * 从分包名称反向推导regionId
 * @param {string} packageName 分包名称
 * @returns {string|null} regionId或null
 */
AudioPackageLoader.prototype.getRegionIdFromPackageName = function(packageName) {
  // 遍历packageMapping寻找匹配的packageName
  for (var regionId in this.packageMapping) {
    if (this.packageMapping[regionId].packageName === packageName) {
      return regionId;
    }
  }
  
  console.warn('⚠️ 未找到与分包名称 ' + packageName + ' 匹配的regionId');
  return null;
};

/**
 * 清理加载状态（用于调试）
 */
AudioPackageLoader.prototype.clearLoadingStatus = function() {
  this.loadedPackages = {};
  this.loadingPromises = {};
  console.log('🧹 音频分包加载状态已清除');
};

// 导出构造函数
module.exports = AudioPackageLoader;