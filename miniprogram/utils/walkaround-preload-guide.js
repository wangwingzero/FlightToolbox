/**
 * 绕机检查图片分包预加载引导配置管理器
 * 当图片分包未加载时，引导用户访问对应的预加载页面
 *
 * 核心功能：
 * 1. 提供图片分包与预加载页面的映射关系（基于区域ID）
 * 2. 生成用户友好的引导提示文案
 * 3. 提供一键跳转到预加载页面的功能
 * 4. 支持离线优先的预加载策略
 * 5. 图片加载失败自动恢复
 *
 * 设计理念（参考航线录音成功经验）：
 * - 持久化标记（wx.setStorageSync）：记录用户已访问过预加载页面，关闭小程序后保留
 * - 图片加载失败自动恢复：当图片无法显示时，handleImageError 会自动清除标记并提示用户重新引导
 * - 微信分包缓存通常是持久化的，所以用户正常情况下只需引导一次
 * - 简单可靠：参考航线录音系统的简单单层存储实现（31个分包全部成功）
 */

var VersionManager = require('./version-manager.js');

var TABBAR_PAGES = [
  '/pages/search/index',
  '/pages/flight-calculator/index',
  '/pages/cockpit/index',
  '/pages/operations/index',
  '/pages/home/index'
];

// 🔐 版本隔离配置（2025-01-11修复）
// 持久化存储的key（基础key，无版本前缀）
var STORAGE_KEY_BASE = 'flight_toolbox_walkaround_preload_status';
// 实际使用的key（会在初始化时设置为版本化key）
var STORAGE_KEY = '';

function WalkaroundPreloadGuide() {
  // 🔐 使用版本化的Storage Key，避免不同版本之间的缓存污染
  if (!STORAGE_KEY) {
    STORAGE_KEY = VersionManager.getVersionedKey(STORAGE_KEY_BASE);
    console.log('✅ 预加载状态使用版本化key:', STORAGE_KEY);
  }

  // 简单的单层存储机制（参考航线录音成功经验）
  // 每次检查时直接从 wx.getStorageSync 读取，不做复杂的缓存

  // 图片分包预加载页面映射配置（基于区域ID范围）
  // 对应 app.json 中的 preloadRule 配置
  this.areaPackageMapping = {
    // 区域1-4: packageWalkaroundImages1 (在绕机检查页面本身预加载)
    '1-4': {
      packageName: 'walkaroundImages1Package',
      packageRoot: 'packageWalkaroundImages1',
      areaRange: [1, 2, 3, 4],
      areaNames: '前起落架、驾驶舱左侧、左翼前缘、左发动机',
      preloadPage: 'packageWalkaround/pages/index/index',
      preloadPageName: '绕机检查',
      preloadPageIcon: '✈️',
      description: '区域1-4的图片将在绕机检查页面自动预加载'
    },
    // 区域5-8: packageWalkaroundImages2
    '5-8': {
      packageName: 'walkaroundImages2Package',
      packageRoot: 'packageWalkaroundImages2',
      areaRange: [5, 6, 7, 8],
      areaNames: '左翼后缘、左起落架、APU舱、机身后部',
      preloadPage: 'packageO/sunrise-sunset/index',
      preloadPageName: '日出日落',
      preloadPageIcon: '🌅',
      description: '区域5-8的图片将通过日出日落页面自动预加载'
    },
    // 区域9-12: packageWalkaroundImages3
    '9-12': {
      packageName: 'walkaroundImages3Package',
      packageRoot: 'packageWalkaroundImages3',
      areaRange: [9, 10, 11, 12],
      areaNames: '水平安定面、垂直安定面、机身下部、右起落架',
      preloadPage: 'packageO/personal-checklist/index',
      preloadPageName: '个人检查单',
      preloadPageIcon: '📋',
      description: '区域9-12的图片将通过个人检查单页面自动预加载'
    },
    // 区域13-16: packageWalkaroundImages4
    '13-16': {
      packageName: 'walkaroundImages4Package',
      packageRoot: 'packageWalkaroundImages4',
      areaRange: [13, 14, 15, 16],
      areaNames: '右翼后缘、右发动机、右翼前缘、驾驶舱右侧',
      preloadPage: 'packageO/flight-time-share/index',
      preloadPageName: '飞行时间分摊',
      preloadPageIcon: '⏱️',
      description: '区域13-16的图片将通过飞行时间分摊页面自动预加载'
    },
    // 区域17-20: packageWalkaroundImages5
    '17-20': {
      packageName: 'walkaroundImagesSharedPackage',
      packageRoot: 'packageWalkaroundImagesShared',
      areaRange: [17, 18, 19, 20],
      areaNames: '机身前部、驾驶舱前风挡、机头雷达罩、前货舱',
      preloadPage: 'packageMedical/index',
      preloadPageName: '体检标准',
      preloadPageIcon: '🏥',
      description: '区域17-20的图片将通过体检标准页面自动预加载'
    },
    // 区域21-24: packageWalkaroundImages6
    '21-24': {
      packageName: 'walkaroundImagesSharedPackage',
      packageRoot: 'packageWalkaroundImagesShared',
      areaRange: [21, 22, 23, 24],
      areaNames: '前起落架舱、机身前部左侧、机身前部右侧、驾驶舱前部',
      preloadPage: 'pages/communication-rules/index',
      preloadPageName: '通信规范',
      preloadPageIcon: '📡',
      description: '区域21-24的图片将通过通信规范页面自动预加载'
    }
  };

  console.log('🎯 绕机检查图片分包预加载引导配置管理器已初始化（参考航线录音简单存储机制）');
}

/**
 * ⚠️ 已废弃：原本用于初始化持久化存储，现在初始化逻辑已集成到构造函数中
 * 保留此方法仅为兼容性，避免破坏外部调用
 */
WalkaroundPreloadGuide.prototype.initPreloadStorage = function() {
  console.log('⚠️ initPreloadStorage 已废弃，初始化逻辑已集成到构造函数中');
};

/**
 * 根据区域ID获取对应的分包映射信息
 * @param {number} areaId 区域ID (1-24)
 * @returns {Object|null} 分包映射信息
 */
WalkaroundPreloadGuide.prototype.getPackageMappingByArea = function(areaId) {
  // 遍历所有映射配置，找到包含该区域ID的配置
  var mappingKeys = Object.keys(this.areaPackageMapping);

  for (var i = 0; i < mappingKeys.length; i++) {
    var key = mappingKeys[i];
    var mapping = this.areaPackageMapping[key];

    if (mapping.areaRange.indexOf(areaId) !== -1) {
      return {
        rangeKey: key,
        packageName: mapping.packageName,
        packageRoot: mapping.packageRoot,
        areaRange: mapping.areaRange,
        areaNames: mapping.areaNames,
        preloadPage: mapping.preloadPage,
        preloadPageName: mapping.preloadPageName,
        preloadPageIcon: mapping.preloadPageIcon,
        description: mapping.description
      };
    }
  }

  console.warn('⚠️ 未找到区域ID ' + areaId + ' 的分包映射配置');
  return null;
};

/**
 * 根据区域范围键获取分包映射信息
 * @param {string} rangeKey 范围键（如 '5-8'）
 * @returns {Object|null} 分包映射信息
 */
WalkaroundPreloadGuide.prototype.getPackageMappingByRange = function(rangeKey) {
  var mapping = this.areaPackageMapping[rangeKey];

  if (!mapping) {
    console.warn('⚠️ 未找到范围键 ' + rangeKey + ' 的分包映射配置');
    return null;
  }

  return {
    rangeKey: rangeKey,
    packageName: mapping.packageName,
    packageRoot: mapping.packageRoot,
    areaRange: mapping.areaRange,
    areaNames: mapping.areaNames,
    preloadPage: mapping.preloadPage,
    preloadPageName: mapping.preloadPageName,
    preloadPageIcon: mapping.preloadPageIcon,
    description: mapping.description
  };
};

/**
 * 生成用户友好的引导提示文案
 * @param {number} areaId 区域ID
 * @returns {Object} 引导提示文案
 */
WalkaroundPreloadGuide.prototype.generateGuideMessage = function(areaId) {
  var mapping = this.getPackageMappingByArea(areaId);

  if (!mapping) {
    return {
      title: '图片资源加载失败',
      content: '抱歉，无法加载该区域的图片资源。请检查网络连接或稍后再试。',
      actionText: '重试',
      canNavigate: false
    };
  }

  return {
    title: '✈️ 绕机检查图片资源',
    content: '要查看区域 ' + areaId + ' (' + mapping.areaNames.split('、')[areaId - mapping.areaRange[0]] + ') 的检查图片，' +
             '首次需要先访问指定页面自动加载图片资源。\n\n' +
             '请访问 ' + mapping.preloadPageIcon + ' ' + mapping.preloadPageName + ' 页面，' +
             '系统将自动为您预加载区域 ' + mapping.areaRange.join('-') + ' 的图片资源。\n\n' +
             '涉及区域：' + mapping.areaNames,
    actionText: '立即前往',
    actionIcon: mapping.preloadPageIcon,
    canNavigate: true,
    targetPage: mapping.preloadPage,
    preloadPageName: mapping.preloadPageName,
    description: mapping.description,
    rangeKey: mapping.rangeKey
  };
};

/**
 * 检查指定区域的图片分包是否已预加载（简单单层存储）
 * @param {number} areaId 区域ID
 * @returns {Promise<boolean>} 是否已预加载
 *
 * 实现方式（参考航线录音成功经验）：
 * - 每次都从 wx.getStorageSync 直接读取
 * - 不做复杂的缓存
 * - 不做主动验证（因为 wx.getFileSystemManager().access() 无法访问分包文件）
 * - 依赖图片加载失败时的 handleImageError 自动清除标记
 */
WalkaroundPreloadGuide.prototype.checkPackagePreloaded = function(areaId) {
  // R2 模式下不需要预加载本地分包
  var R2Config = require('./r2-config.js');
  if (R2Config.useR2ForImages) {
    return Promise.resolve(true);
  }

  var mapping = this.getPackageMappingByArea(areaId);

  if (!mapping) {
    console.warn('⚠️ 未找到区域ID ' + areaId + ' 的分包映射配置');
    return Promise.resolve(false);
  }

  return new Promise(function(resolve) {
    try {
      // 直接从本地存储检查预加载状态（参考航线录音实现）
      var preloadStatus = wx.getStorageSync(STORAGE_KEY) || {};
      var isPreloaded = !!preloadStatus[mapping.rangeKey];

      console.log('🔍 检查区域 ' + areaId + ' (' + mapping.rangeKey + ') 预加载状态:', isPreloaded ? '已预加载' : '未预加载');
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
 * @param {number} areaId 区域ID
 * @returns {Promise<boolean>} 是否成功跳转
 */
WalkaroundPreloadGuide.prototype.navigateToPreloadPage = function(areaId) {
  var self = this;
  var mapping = this.getPackageMappingByArea(areaId);

  if (!mapping) {
    console.error('❌ 无法跳转：未找到区域ID ' + areaId + ' 的预加载页面配置');
    return Promise.resolve(false);
  }

  return new Promise(function(resolve) {
    try {
      var targetPage = mapping.preloadPage;
      var fullUrl = '/' + targetPage;
      var tabbarPages = TABBAR_PAGES;

      var navigateSuccessHandler = function() {
        console.log('✅ 成功跳转到预加载页面:', fullUrl);
        self.markPackagePreloaded(mapping.rangeKey);
        console.log('✅ 已标记区域范围 ' + mapping.rangeKey + ' 为已引导状态');

        // 显示简短的成功提示
        wx.showToast({
          title: '图片资源加载中...',
          icon: 'loading',
          duration: 1500
        });

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

      // 判断目标页面类型并使用相应的跳转方法
      if (tabbarPages.indexOf(fullUrl) > -1) {
        // TabBar页面使用switchTab
        wx.switchTab({
          url: fullUrl,
          success: navigateSuccessHandler,
          fail: navigateFailHandler
        });
      } else {
        // 普通页面使用navigateTo
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
 * @param {number} areaId 区域ID
 * @returns {Promise<boolean>} 用户是否选择跳转
 */
WalkaroundPreloadGuide.prototype.showPreloadGuideDialog = function(areaId) {
  var self = this;

  console.log('🎯 WalkaroundPreloadGuide.showPreloadGuideDialog 被调用');
  console.log('🔍 areaId:', areaId);

  var guideMessage = this.generateGuideMessage(areaId);
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
          self.navigateToPreloadPage(areaId).then(function(success) {
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
  });
};

/**
 * 标记指定分包范围为已预加载（简单单层存储）
 * @param {string} rangeKey 范围键（如 '5-8', '9-12'）
 * @returns {boolean} 是否成功标记
 *
 * 实现方式（参考航线录音成功经验）：
 * - 直接写入 wx.setStorageSync
 * - 不维护额外的会话缓存
 */
WalkaroundPreloadGuide.prototype.markPackagePreloaded = function(rangeKey) {
  try {
    var timestamp = Date.now();

    // 读取当前状态并更新
    var preloadStatus = wx.getStorageSync(STORAGE_KEY) || {};
    preloadStatus[rangeKey] = timestamp;
    wx.setStorageSync(STORAGE_KEY, preloadStatus);

    console.log('✅ 已标记区域范围 ' + rangeKey + ' 为预加载完成');
    console.log('💾 持久化存储:', preloadStatus);

    return true;
  } catch (error) {
    console.error('❌ 标记预加载状态失败:', error);
    return false;
  }
};

/**
 * 清除指定区域范围的预加载状态（简单单层存储）
 * @param {string} rangeKey 范围键，如果为空则清除所有状态
 * @returns {boolean} 是否成功清除
 *
 * 实现方式（参考航线录音成功经验）：
 * - 直接操作 wx.setStorageSync
 * - 不维护额外的会话缓存
 */
WalkaroundPreloadGuide.prototype.clearPreloadStatus = function(rangeKey) {
  try {
    if (!rangeKey) {
      // 清除所有预加载状态
      wx.setStorageSync(STORAGE_KEY, {});
      console.log('🧹 已清除所有绕机检查图片预加载状态');
    } else {
      // 清除指定范围的预加载状态
      var preloadStatus = wx.getStorageSync(STORAGE_KEY) || {};
      delete preloadStatus[rangeKey];
      wx.setStorageSync(STORAGE_KEY, preloadStatus);
      console.log('🧹 已清除区域范围 ' + rangeKey + ' 的预加载状态');
    }
    return true;
  } catch (error) {
    console.error('❌ 清除预加载状态失败:', error);
    return false;
  }
};

/**
 * 获取所有区域范围的预加载状态
 * @returns {Promise<Object>} 所有区域范围的预加载状态
 */
WalkaroundPreloadGuide.prototype.getAllPreloadStatus = function() {
  var self = this;
  var rangeKeys = Object.keys(this.areaPackageMapping);

  return new Promise(function(resolve) {
    try {
      // 使用统一的存储key（参考航线录音）
      var preloadStatus = wx.getStorageSync(STORAGE_KEY) || {};
      var status = {};

      rangeKeys.forEach(function(rangeKey) {
        var mapping = self.areaPackageMapping[rangeKey];
        status[rangeKey] = {
          rangeKey: rangeKey,
          isPreloaded: !!preloadStatus[rangeKey],
          mapping: mapping,
          timestamp: preloadStatus[rangeKey] || null
        };
      });

      resolve(status);
    } catch (error) {
      console.error('❌ 获取预加载状态失败:', error);
      resolve({});
    }
  });
};

// 导出构造函数
module.exports = WalkaroundPreloadGuide;
