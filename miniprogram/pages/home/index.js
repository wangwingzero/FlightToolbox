/**
 * 我的首页页面
 * 使用BasePage基类，遵循ES5语法
 */

var BasePage = require('../../utils/base-page.js');
var modalManager = require('../../utils/modal-manager.js');
var qualificationHelper = require('../../utils/qualification-helper.js');
var onboardingGuide = require('../../utils/onboarding-guide.js');
var tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');
var adHelper = require('../../utils/ad-helper.js');
var AudioPreheatManager = require('../../utils/audio-preheat-manager.js');
var CacheHealthManager = require('../../utils/cache-health-manager.js');
var EnvDiagnostic = require('../../utils/env-diagnostic.js');
var pilotLevelManager = require('../../utils/pilot-level-manager.js');
var EnvDetector = require('../../utils/env-detector.js');
var VersionManager = require('../../utils/version-manager.js');

// 创建页面配置
var pageConfig = {
  data: {
    // 插屏广告相关
    interstitialAd: null,
    interstitialAdLoaded: false,
    lastInterstitialAdShowTime: 0,

    // 资质数据
    qualifications: [],
    greeting: '早上好',

    // 资质到期统计
    expiringSoonCount: 0,

    // 公众号相关数据
    showQRFallback: false,
    showQRCodeModal: false,

    // 其他UI相关数据
    medicalStandardsAvailable: true,

    // TabBar提示相关
  showTabBarHint: false,

  pilotLevel: 1,
  pilotLevelName: '理论课学员 Lv.1',
  pilotSegmentName: '理论课学员',
  pilotLevelIcon: '📘',
  pilotTotalXp: 0,
  pilotNextLevelXp: 100,
  pilotProgress: 0,
  pilotStats: null
  },

  /**
   * 新用户离线缓存引导弹窗
   * 从首页弹出，点击后跳转到离线管理页
   */
  maybePromptOfflinePreload: function() {
    var versionedDoneKey = '';
    var versionedLastPromptKey = '';

    // 使用版本化 Storage Key，确保每个版本都可以重新判断是否需要离线预加载
    try {
      if (VersionManager && typeof VersionManager.getVersionedKey === 'function') {
        versionedDoneKey = VersionManager.getVersionedKey('offlineAssetsPreloaded_v2');
        versionedLastPromptKey = VersionManager.getVersionedKey('offlineAssetsPreloadLastPrompt_v1');
      }
    } catch (error) {
      console.warn('获取离线预加载版本化key失败', error);
    }

    // 已完成当前版本离线预加载则不再提示
    try {
      if (versionedDoneKey && wx.getStorageSync(versionedDoneKey)) {
        return;
      }
    } catch (error) {
      console.warn('读取离线预加载标记失败', error);
    }

    // 每天最多提示一次：如果今天已经提示过则不再弹窗
    var todayString = '';
    try {
      var now = new Date();
      var year = now.getFullYear();
      var month = now.getMonth() + 1;
      var day = now.getDate();
      todayString = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);

      if (versionedLastPromptKey) {
        var lastPromptDate = wx.getStorageSync(versionedLastPromptKey);
        if (lastPromptDate === todayString) {
          return;
        }
      }
    } catch (error) {
      console.warn('读取离线预加载上次提示时间失败', error);
    }

    // 开发者工具环境不弹窗
    try {
      if (EnvDetector && typeof EnvDetector.isDevTools === 'function' && EnvDetector.isDevTools()) {
        return;
      }
    } catch (error) {
      console.warn('检测运行环境失败', error);
    }

    wx.showModal({
      title: '加载全部离线缓存',
      content: '将为您一次性下载所有航线录音和绕机检查图片，大约需要 1 分钟，仅首次需要，完成后即可离线使用。',
      confirmText: '立即加载',
      cancelText: '暂不',
      success: function(res) {
        // 记录今天已经提示过一次，避免当天重复弹窗
        try {
          if (versionedLastPromptKey && todayString) {
            wx.setStorageSync(versionedLastPromptKey, todayString);
          }
        } catch (error) {
          console.warn('写入离线预加载上次提示时间失败', error);
        }

        if (!res.confirm) {
          return;
        }

        wx.showToast({
          title: '将跳转到离线管理进行下载',
          icon: 'none',
          duration: 2000
        });

        wx.navigateTo({
          url: '/pages/offline-center/index?from=home_offline_prompt'
        });
      }
    });
  },


  /**
   * 自定义页面加载方法
   */
  customOnLoad: function(options) {
    console.log('🎯 页面加载开始');

    // 初始化管理器
    modalManager.init(this);

    // 更新问候语
    this.updateGreeting();

    // 加载资质数据
    this.refreshQualifications();

    // 显示TabBar小红点引导
    this.showTabBarBadges();

    // 🎬 创建插屏广告实例
    this.createInterstitialAd();

  },

  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    console.log('🎯 页面显示');

    // 处理TabBar页面进入（标记访问+更新小红点）
    tabbarBadgeManager.handlePageEnter('pages/home/index');

    // 🎬 显示插屏广告（频率控制）
    this.showInterstitialAdWithControl();

    // 更新问候语
    this.updateGreeting();

    // 刷新资质数据
    this.refreshQualifications();

    this.refreshPilotLevelInfo();

    this.maybePromptOfflinePreload();

  },

  /**
   * 自定义页面卸载方法
   */
  customOnUnload: function() {
    console.log('🧹 页面卸载');

    // 🧹 清理插屏广告资源
    this.destroyInterstitialAd();

  },

  /**
   * 格式化资质状态文本
   */
  formatQualificationStatus: function(item) {
    if (item.daysRemaining > 0) {
      return item.daysRemaining + '天后到期';
    } else if (item.daysRemaining === 0) {
      return '今日到期';
    } else {
      return '已过期' + Math.abs(item.daysRemaining) + '天';
    }
  },

  /**
   * 格式化资质图标
   */
  formatQualificationIcon: function(status) {
    var iconMap = {
      'expired': '❌',
      'warning': '⚠️',
      'valid': '✅'
    };
    return iconMap[status] || '✅';
  },

  /**
   * 更新问候语
   */
  updateGreeting: function() {
    this.safeSetData({ greeting: '' });
  },

  /**
   * 刷新资质数据
   */
  refreshQualifications: function() {
    var self = this;

    this.loadDataWithLoading(function() {
      return new Promise(function(resolve, reject) {
        try {
          var qualifications = qualificationHelper.getAllQualifications();
          var expiringSoonCount = qualificationHelper.getExpiringSoonCount();

          // 对资质进行排序：
          // 1. 过期的排最前面（daysRemaining < 0）
          // 2. 剩余天数越少的排越前面
          qualifications.sort(function(a, b) {
            // 过期状态优先（已过期的排前面）
            var aExpired = a.daysRemaining < 0 ? 1 : 0;
            var bExpired = b.daysRemaining < 0 ? 1 : 0;

            if (aExpired !== bExpired) {
              return bExpired - aExpired; // 过期的排前面
            }

            // 如果都是过期或都没过期，按剩余天数升序排列
            return a.daysRemaining - b.daysRemaining;
          });

          // 预处理资质数据，添加格式化后的文本和图标
          qualifications = qualifications.map(function(item) {
            return Object.assign({}, item, {
              statusText: self.formatQualificationStatus(item),
              iconEmoji: self.formatQualificationIcon(item.status)
            });
          });

          resolve({
            qualifications: qualifications,
            expiringSoonCount: expiringSoonCount
          });
        } catch (error) {
          reject(error);
        }
      });
    }, {
      context: '资质数据加载',
      loadingKey: 'qualificationsLoading',
      dataKey: 'qualificationsData'
    }).then(function(data) {
      self.safeSetData({
        qualifications: data.qualifications,
        expiringSoonCount: data.expiringSoonCount
      });
    }).catch(function(error) {
      console.error('加载资质数据失败:', error);
    });
  },

  refreshPilotLevelInfo: function() {
    var airportCount = 0;
    try {
      var cacheKey = VersionManager.getVersionedKey('airport_checkins');
      var stored = wx.getStorageSync(cacheKey);

      if (!Array.isArray(stored) || stored.length === 0) {
        // 兼容旧版本：从老 key 读取一次并迁移到新 key
        var legacyStored = wx.getStorageSync('airport_checkins_v1');
        if (Array.isArray(legacyStored) && legacyStored.length > 0) {
          stored = legacyStored;
          try {
            wx.setStorageSync(cacheKey, legacyStored);
          } catch (migrateError) {
            console.warn('迁移旧机场打卡记录失败(用于等级统计):', migrateError);
          }
        }
      }

      if (Array.isArray(stored)) {
        airportCount = stored.length;
      }
    } catch (error) {
      console.warn('读取机场打卡记录失败(用于等级统计):', error);
    }

    try {
      pilotLevelManager.recordDailyActive();
      var state = pilotLevelManager.getDisplayState({
        airportCount: airportCount
      });

      var icon = '✈️';
      var segmentName = state.segmentName || '';
      if (segmentName.indexOf('理论课') >= 0) {
        icon = '📘';
      } else if (segmentName.indexOf('航校') >= 0) {
        icon = '🎓';
      } else if (segmentName.indexOf('副驾驶') >= 0) {
        icon = '🧑‍✈️';
      } else if (segmentName.indexOf('机长') >= 0) {
        icon = '✈️';
      } else if (segmentName.indexOf('教员') >= 0) {
        icon = '🧑‍🏫';
      } else if (segmentName.indexOf('首席飞行员') >= 0) {
        icon = '🛫';
      } else if (segmentName.indexOf('传奇飞行员') >= 0) {
        icon = '👑';
      }

      this.safeSetData({
        pilotLevel: state.level,
        pilotLevelName: state.levelName,
        pilotSegmentName: segmentName || this.data.pilotSegmentName,
        pilotLevelIcon: icon,
        pilotTotalXp: state.totalXp,
        pilotNextLevelXp: state.nextLevelXp,
        pilotProgress: Math.round(state.progress * 100),
        pilotStats: state.stats
      });
    } catch (error) {
      console.warn('刷新飞行员等级信息失败:', error);
    }
  },

  // === 页面导航方法 ===

  /**
   * 通用导航前广告触发（优化版：防抖+异常处理）
   */
  triggerAdBeforeNavigation: function() {
    var self = this;

    try {
      // 防抖机制：避免短时间内重复触发
      if (this._adTriggerTimer) {
        console.log('🎬 广告触发防抖中，跳过本次');
        return;
      }

      this._adTriggerTimer = true;

      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1];
      var route = currentPage.route || '';
      adHelper.adStrategy.recordAction(route);
      this.showInterstitialAdWithControl();

      // 500ms后重置防抖标志
      this.createSafeTimeout(function() {
        self._adTriggerTimer = false;
      }, 500, '广告触发防抖');
    } catch (error) {
      console.error('🎬 广告触发失败:', error);
      // 不影响导航，继续执行
    }
  },

  /**
   * 打开雪情通告编码器
   */
  openSnowtamEncoder: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageO/snowtam-encoder/index'
    });
  },

  /**
   * 打开雪情通告解码器
   */
  openSnowtamDecoder: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageO/snowtam-decoder/index'
    });
  },

  // 打开体检标准页面
  openMedicalStandards: function(e) {
    console.log('🏥 打开体检标准页面');
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageMedical/index',
      success: function(res) {
        console.log('✅ 成功跳转到体检标准页面');
      },
      fail: function(err) {
        console.error('❌ 跳转体检标准页面失败:', err);
        wx.showToast({
          title: '页面加载失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 打开资质管理
   */
  openQualificationManager: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageO/qualification-manager/index'
    });
  },

  /**
   * 打开夜航时间
   */
  openSunriseSunset: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageO/sunrise-sunset/index'
    });
  },

  /**
   * 打开事件报告
   */
  openEventReport: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageO/event-report/initial-report'
    });
  },

  /**
   * 打开事件调查
   */
  openIncidentInvestigation: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageO/incident-investigation/index'
    });
  },

  /**
   * 打开分飞行时间
   */
  openFlightTimeShare: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageO/flight-time-share/index'
    });
  },

  /**
   * 打开空勤灶（膳食指南）
   */
  openDietKitchen: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageDiet/index'
    });
  },

  /**
   * 打开个人检查单
   */
  openPersonalChecklist: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageO/personal-checklist/index'
    });
  },

  /**
   * 打开长航线换班
   */
  openLongFlightCrewRotation: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageO/long-flight-crew-rotation/index'
    });
  },

  /**
   * 打开离线管理中心
   */
  openOfflineCenter: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/pages/offline-center/index'
    });
  },

  /**
   * 打开执勤期计算器
   */
  openDutyCalculator: function() {
    this.triggerAdBeforeNavigation();
    wx.navigateTo({
      url: '/packageDuty/index'
    });
  },

  // === 弹窗关闭方法 ===

  /**
   * 关闭二维码弹窗
   */
  closeQRCodeModal: function() {
    this.safeSetData({ showQRCodeModal: false });
  },

  // === 其他功能方法 ===

  /**
   * 预览二维码
   */
  previewQRCode: function() {
    var self = this;
    wx.previewImage({
      urls: ['/images/OfficialAccount.png'],
      fail: function(error) {
        self.handleError(error, '预览二维码失败');
        // 降级方案：显示弹窗二维码
        self.safeSetData({ showQRCodeModal: true });
      }
    });
  },

  /**
   * 跳转到公众号
   */
  jumpToOfficialAccount: function() {
    var self = this;

    // 直接尝试跳转，不显示确认弹窗
    try {
      wx.openOfficialAccountProfile({
        username: 'gh_68a6294836cd', // 使用正确的原始ID
        success: function() {
          console.log('✅ 成功跳转到公众号');
        },
        fail: function(error) {
          console.log('❌ 跳转失败，提示扫描二维码', error);
          wx.showToast({
            title: '请直接扫描下方二维码',
            icon: 'none',
            duration: 3000
          });
        }
      });
    } catch (error) {
      console.log('❌ API不支持或基础库版本过低，提示扫描二维码', error);
      wx.showToast({
        title: '请直接扫描下方二维码',
        icon: 'none',
        duration: 3000
      });
    }
  },

  /**
   * 显示公众号二维码弹窗
   */
  showQRCodeModal: function() {
    this.safeSetData({
      showQRCodeModal: true
    });
  },

  /**
   * 复制公众号ID
   */
  copyOfficialAccountId: function() {
    wx.setClipboardData({
      data: '飞行播客',
      success: function() {
        wx.showToast({
          title: '公众号ID已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  /**
   * 提示用户搜索公众号
   */
  searchOfficialAccount: function() {
    var self = this;
    wx.showModal({
      title: '关注公众号',
      content: '请在微信中搜索"飞行播客"来关注我的公众号。',
      showCancel: true,
      cancelText: '取消',
      confirmText: '复制ID',
      success: function(res) {
        if (res.confirm) {
          self.copyOfficialAccountId();
        }
      }
    });
  },

  /**
   * 意见反馈
   */
  feedback: function() {
    wx.showModal({
      title: '意见反馈',
      content: '欢迎添加微信号wwingzero来和作者进行反馈',
      confirmText: '知道了',
      showCancel: false
    });
  },

  /**
   * 关于作者
   */
  aboutUs: function() {
    wx.showModal({
      title: '关于作者',
      content: '作者：虎大王\n\n作为一名飞行员，我深知大家在日常工作中遇到的各种痛点：计算复杂、查询繁琐、工具分散。\n\n为了帮助飞行员朋友们更高效地解决这些问题，我开发了这款小程序，集成了最实用的飞行工具。\n\n希望能为大家的飞行工作带来便利！',
      showCancel: false,
      confirmText: '了解了'
    });
  },

  /**
   * 版本信息
   */
  onVersionTap: function() {
    wx.showModal({
      title: '版本信息',
      content: '当前版本：v2.13.4\n\n📦 本次更新重点：\n• 继续修了一些使用中发现的小问题，减少卡顿和异常提示\n• 优化部分页面的加载和跳转逻辑，让常用工具打开更顺畅\n\n感谢你一直陪着我飞～✈️',
      showCancel: false,
      confirmText: '确定'
    });
  },

  /**
   * 从卡片跳转到公众号（带失败处理）
   */
  jumpToOfficialAccountFromCard: function() {
    var self = this;

    // 直接尝试跳转，不显示确认弹窗
    try {
      wx.openOfficialAccountProfile({
        username: 'gh_68a6294836cd', // 使用正确的原始ID
        success: function() {
          console.log('✅ 从卡片成功跳转到公众号');
        },
        fail: function(error) {
          console.log('❌ 从卡片跳转失败，显示二维码弹窗', error);
          // 跳转失败时显示二维码弹窗
          self.showQRCodeModal();
        }
      });
    } catch (error) {
      console.log('❌ API不支持或基础库版本过低，显示二维码弹窗', error);
      // API不支持时显示二维码弹窗
      self.showQRCodeModal();
    }
  },

  // === TabBar提示相关方法 ===

  /**
   * 检查并显示TabBar提示
   */
  checkAndShowTabBarHint: function() {
    var self = this;

    // 检查是否需要显示TabBar提示
    if (onboardingGuide.showTabBarTip()) {
      // 使用BasePage的安全定时器，页面销毁时自动清理
      this.createSafeTimeout(function() {
        self.safeSetData({
          showTabBarHint: true
        });

        // 5秒后自动关闭提示
        self.createSafeTimeout(function() {
          self.closeTabBarHint();
        }, 5000, 'TabBar提示自动关闭');
      }, 800, 'TabBar提示显示');
    }
  },

  /**
   * 关闭TabBar提示
   */
  onHintClose: function() {
    this.closeTabBarHint();
  },

  /**
   * 关闭TabBar提示的实际实现
   */
  closeTabBarHint: function() {
    this.safeSetData({
      showTabBarHint: false
    });

    // 标记已显示
    onboardingGuide.markTabBarGuideAsShown();
  },

  // === TabBar小红点相关方法 ===

  /**
   * 显示TabBar小红点（用于引导用户探索其他页面）
   */
  showTabBarBadges: function() {
    var self = this;

    // 使用BasePage的安全定时器，页面销毁时自动清理
    this.createSafeTimeout(function() {
      // 显示所有未访问页面的小红点
      tabbarBadgeManager.showBadgesForUnvisited();

      // 打印统计信息
      var stats = tabbarBadgeManager.getVisitStatistics();
      console.log('📊 TabBar访问统计:', stats);
    }, 500, 'TabBar小红点显示');
  },

  // === 🎬 插屏广告相关方法 ===

  /**
   * 创建插屏广告实例（使用ad-helper统一管理）
   */
  createInterstitialAd: function() {
    this.data.interstitialAd = adHelper.setupInterstitialAd(this, '我的首页');
  },

  /**
   * 显示插屏广告（使用智能策略）
   * TabBar切换优化：2分钟间隔，每日最多20次
   */
  showInterstitialAdWithControl: function() {
    // 获取当前页面路径
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    var route = currentPage.route || '';

    // 使用智能策略展示广告
    adHelper.showInterstitialAdWithStrategy(
      this.data.interstitialAd,
      route,  // 当前页面路径
      this,   // 页面上下文
      '我的首页'
    );
  },

  /**
   * 销毁插屏广告实例（使用ad-helper统一管理）
   */
  destroyInterstitialAd: function() {
    adHelper.cleanupInterstitialAd(this, '我的首页');
  },


  // 转发功能
  onShareAppMessage: function() {
    return {
      title: '飞行工具箱 - 我的首页',
      desc: '专业飞行工具箱，管理飞行经历、资质证件、培训记录',
      path: '/pages/home/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '飞行工具箱',
      path: '/pages/home/index'
    };
  },


















};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));
