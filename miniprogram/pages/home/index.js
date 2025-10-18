/**
 * 我的首页页面
 * 使用BasePage基类，遵循ES5语法
 * 包含激励视频广告功能
 */

var BasePage = require('../../utils/base-page.js');
var greetingManager = require('../../utils/greeting-manager.js');
var modalManager = require('../../utils/modal-manager.js');
var qualificationHelper = require('../../utils/qualification-helper.js');
var onboardingGuide = require('../../utils/onboarding-guide.js');
var tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');
var appConfig = require('../../utils/app-config.js');

// 创建页面配置
var pageConfig = {
  // 激励视频广告实例（页面实例变量，防止内存泄漏）
  _rewardedVideoAd: null,
  _adLoaded: false,

  data: {
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
    showTabBarHint: false
  },

  /**
   * 自定义页面加载方法
   */
  customOnLoad: function(options) {
    console.log('🎯 页面加载开始');

    // 初始化管理器
    modalManager.init(this);

    // 初始化激励视频广告
    this.initRewardedVideoAd();

    // 更新问候语
    this.updateGreeting();

    // 加载资质数据
    this.refreshQualifications();

    // 显示TabBar小红点引导
    this.showTabBarBadges();
  },

  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    console.log('🎯 页面显示');

    // 处理TabBar页面进入（标记访问+更新小红点）
    tabbarBadgeManager.handlePageEnter('pages/home/index');

    // 更新问候语
    this.updateGreeting();

    // 刷新资质数据
    this.refreshQualifications();
  },

  /**
   * 自定义页面卸载方法
   */
  customOnUnload: function() {
    console.log('🧹 页面卸载，清理广告资源');

    // 清理激励视频广告
    if (this._rewardedVideoAd) {
      try {
        this._rewardedVideoAd.offLoad();
        this._rewardedVideoAd.offError();
        this._rewardedVideoAd.offClose();
        this._rewardedVideoAd.destroy();
        this._rewardedVideoAd = null;
        this._adLoaded = false;
        console.log('✅ 激励视频广告资源已清理');
      } catch (error) {
        console.warn('⚠️ 清理广告资源时出错:', error);
      }
    }
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
    var greeting = greetingManager.getRandomGreeting();
    this.safeSetData({ greeting: greeting });
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

  // === 页面导航方法 ===

  /**
   * 打开雪情通告编码器
   */
  openSnowtamEncoder: function() {
    wx.navigateTo({
      url: '/packageO/snowtam-encoder/index'
    });
  },

  /**
   * 打开雪情通告解码器
   */
  openSnowtamDecoder: function() {
    wx.navigateTo({
      url: '/packageO/snowtam-decoder/index'
    });
  },

  // 打开体检标准页面
  openMedicalStandards: function(e) {
    console.log('🏥 打开体检标准页面');
    wx.navigateTo({
      url: '/pages/medical-standards/index',
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
    wx.navigateTo({
      url: '/packageO/qualification-manager/index'
    });
  },

  /**
   * 打开夜航时间
   */
  openSunriseSunset: function() {
    wx.navigateTo({
      url: '/packageO/sunrise-sunset/index'
    });
  },

  /**
   * 打开事件报告
   */
  openEventReport: function() {
    wx.navigateTo({
      url: '/packageO/event-report/initial-report'
    });
  },

  /**
   * 打开事件调查
   */
  openIncidentInvestigation: function() {
    wx.navigateTo({
      url: '/packageO/incident-investigation/index'
    });
  },

  /**
   * 打开分飞行时间
   */
  openFlightTimeShare: function() {
    wx.navigateTo({
      url: '/packageO/flight-time-share/index'
    });
  },

  /**
   * 打开个人检查单
   */
  openPersonalChecklist: function() {
    wx.navigateTo({
      url: '/packageO/personal-checklist/index'
    });
  },

  /**
   * 打开长航线换班
   */
  openLongFlightCrewRotation: function() {
    wx.navigateTo({
      url: '/packageO/long-flight-crew-rotation/index'
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
      content: '更新说明：v2.5.0\n\n✨ 更新内容：\n• 新增"胜任力"和"体检标准"查询\n• 驾驶舱下滑线计算功能增强\n• 调整TabBar导航结构\n• 新增CCAR法规文件\n• 性能全面提升\n\n感谢您的支持！',
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

  // === 激励视频广告相关方法 ===

  /**
   * 初始化激励视频广告
   */
  initRewardedVideoAd: function() {
    var self = this;

    // 避免重复创建（单例模式）
    if (self._rewardedVideoAd) {
      console.log('✅ 激励视频广告已初始化，跳过重复创建');
      return;
    }

    // 检查是否支持激励视频广告
    if (!wx.createRewardedVideoAd) {
      console.log('❌ 当前微信版本不支持激励视频广告');
      return;
    }

    // 创建激励视频广告实例
    self._rewardedVideoAd = wx.createRewardedVideoAd({
      adUnitId: appConfig.ad.rewardVideoId
    });

    // 监听广告加载成功
    self._rewardedVideoAd.onLoad(function() {
      console.log('✅ 激励视频广告加载成功');
      self._adLoaded = true;
    });

    // 监听广告加载失败
    self._rewardedVideoAd.onError(function(err) {
      console.error('❌ 激励视频广告错误:', {
        errCode: err.errCode,
        errMsg: err.errMsg,
        adUnitId: appConfig.ad.rewardVideoId
      });
      self._adLoaded = false;
      self.handleError(err, '激励视频广告加载');
    });

    // 监听广告关闭
    self._rewardedVideoAd.onClose(function(res) {
      // 广告关闭后立即预加载下一次
      self._adLoaded = false;
      self._rewardedVideoAd.load()
        .then(function() {
          console.log('✅ 广告预加载成功');
        })
        .catch(function(err) {
          console.warn('⚠️ 广告预加载失败:', err);
        });

      if (res && res.isEnded) {
        // 用户完整观看了广告
        console.log('✅ 用户完整观看了广告');
        wx.showToast({
          title: '感谢您的支持！',
          icon: 'success',
          duration: 2000
        });
      } else {
        // 用户中途退出
        console.log('⚠️ 用户未完整观看广告');
        wx.showToast({
          title: '需要完整观看广告哦',
          icon: 'none',
          duration: 2000
        });
      }
    });

    // 初始化时预加载广告
    self._rewardedVideoAd.load()
      .then(function() {
        console.log('🎬 激励视频广告初始化并预加载完成');
      })
      .catch(function(err) {
        console.warn('⚠️ 初始化预加载失败:', err);
      });
  },

  /**
   * 显示激励视频广告
   */
  showRewardedVideoAd: function() {
    var self = this;

    if (!self._rewardedVideoAd) {
      wx.showToast({
        title: '广告功能不可用',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '广告加载中...',
      mask: true
    });

    // 优化：先检查是否已加载
    if (self._adLoaded) {
      // 已加载，直接显示
      self._rewardedVideoAd.show()
        .then(function() {
          wx.hideLoading();
        })
        .catch(function(err) {
          wx.hideLoading();
          // 显示失败，标记未加载并重新加载
          self._adLoaded = false;
          self._loadAndShowAd();
        });
    } else {
      // 未加载，先加载后显示
      self._loadAndShowAd();
    }
  },

  /**
   * 辅助方法：加载并显示广告
   */
  _loadAndShowAd: function() {
    var self = this;

    self._rewardedVideoAd.load()
      .then(function() {
        return self._rewardedVideoAd.show();
      })
      .then(function() {
        wx.hideLoading();
      })
      .catch(function(err) {
        wx.hideLoading();
        self.handleError(err, '激励视频广告显示');
        wx.showToast({
          title: '广告加载失败，请稍后再试',
          icon: 'none',
          duration: 2000
        });
      });
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));
