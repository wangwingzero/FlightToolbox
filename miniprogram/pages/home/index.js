/**
 * 我的首页页面
 * 使用BasePage基类，遵循ES5语法
 */

var BasePage = require('../../utils/base-page.js');
var greetingManager = require('../../utils/greeting-manager.js');
var modalManager = require('../../utils/modal-manager.js');
var qualificationHelper = require('../../utils/qualification-helper.js');
var onboardingGuide = require('../../utils/onboarding-guide.js');
var tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');
var adHelper = require('../../utils/ad-helper.js');
var adCopyManager = require('../../utils/ad-copy-manager.js');

// 创建页面配置
var pageConfig = {
  data: {
    // 插屏广告相关
    interstitialAd: null,
    interstitialAdLoaded: false,
    lastInterstitialAdShowTime: 0,

    // 激励视频广告相关
    rewardedVideoAd: null,
    rewardedVideoAdLoaded: false,
    rewardedVideoAdSupported: true,  // 🆕 标记是否支持激励视频广告
    isAdFree: false,                  // 是否已获得今日无广告
    adFreeTimeRemaining: '',          // 剩余无广告时间（格式化字符串）

    // 广告文案相关（随机变化）
    adCopyTitle: '',                  // 广告文案标题
    adCopyDesc: '',                   // 广告文案描述
    adCopyIcon: '✨',                 // 感谢文案图标

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

    // 更新问候语
    this.updateGreeting();

    // 加载资质数据
    this.refreshQualifications();

    // 显示TabBar小红点引导
    this.showTabBarBadges();

    // 🎬 创建插屏广告实例
    this.createInterstitialAd();

    // 🎁 创建激励视频广告实例
    this.createRewardedVideoAd();

    // ⏰ 检查并更新无广告状态
    this.checkAdFreeStatus();

    // 🎨 初始化广告文案
    this.updateAdCopy();
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

    // ⏰ 检查并更新无广告状态
    this.checkAdFreeStatus();

    // 🎨 更新广告文案（每次显示页面时随机变化）
    this.updateAdCopy();
  },

  /**
   * 自定义页面卸载方法
   */
  customOnUnload: function() {
    console.log('🧹 页面卸载');

    // 🧹 清理插屏广告资源
    this.destroyInterstitialAd();

    // 🧹 清理激励视频广告资源
    this.destroyRewardedVideoAd();
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

  /**
   * 打开执勤期计算器
   */
  openDutyCalculator: function() {
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
      content: '当前版本：v2.8.1\n\n✨ 新增功能：\n• 航线录音大幅扩展 - 新增18个国家/地区\n• 音频分包总数达31个，800+条录音\n• 新增：柬埔寨、加拿大、埃及、德国、荷兰、香港、印度、印尼、澳门、马来西亚、马尔代夫、缅甸、新西兰、西班牙、台北、英国、乌兹别克斯坦、越南\n• 主包大小优化，提升加载速度\n• 音频数据质量提升\n\n感谢您的支持！✈️',
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

  // === 🎁 激励视频广告相关方法 ===

  /**
   * 创建激励视频广告实例
   */
  createRewardedVideoAd: function() {
    var self = this;
    console.log('🎁 创建激励视频广告实例');

    if (!wx.createRewardedVideoAd) {
      console.warn('⚠️ 当前微信版本不支持激励视频广告');
      this.safeSetData({ rewardedVideoAdSupported: false });
      return;
    }

    try {
      // 使用统一配置管理广告位ID
      var appConfig = require('../../utils/app-config.js');

      this.data.rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: appConfig.ad.rewardedVideoAdUnitId
      });

      // 监听广告加载成功
      this.data.rewardedVideoAd.onLoad(function() {
        console.log('✅ 激励视频广告加载成功');
        self.safeSetData({ rewardedVideoAdLoaded: true });
      });

      // 监听广告加载失败
      this.data.rewardedVideoAd.onError(function(err) {
        console.error('❌ 激励视频广告加载失败:', err);
        self.safeSetData({ rewardedVideoAdLoaded: false });
      });

      // 监听用户点击关闭广告
      this.data.rewardedVideoAd.onClose(function(res) {
        if (res && res.isEnded) {
          // 用户完整观看了广告，发放奖励
          console.log('✅ 用户完整观看激励视频广告，发放奖励');
          self.grantAdFreeReward();
        } else {
          // 用户中途退出，不发放奖励
          console.log('⚠️ 用户未完整观看激励视频广告');
          wx.showToast({
            title: '请观看完整视频',
            icon: 'none',
            duration: 2000
          });
        }

        // 重新加载广告，准备下次观看
        self.data.rewardedVideoAd.load()
          .then(function() {
            console.log('✅ 激励视频广告重新加载成功');
            self.safeSetData({ rewardedVideoAdLoaded: true });
          })
          .catch(function(err) {
            console.error('❌ 激励视频广告重新加载失败:', err);
            self.safeSetData({ rewardedVideoAdLoaded: false });
          });
      });

    } catch (error) {
      console.error('❌ 创建激励视频广告实例失败:', error);
    }
  },

  /**
   * 显示激励视频广告
   */
  showRewardedVideoAd: function() {
    var self = this;

    if (!this.data.rewardedVideoAd || !this.data.rewardedVideoAdLoaded) {
      wx.showToast({
        title: '广告加载中，请稍后',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.data.rewardedVideoAd.show()
      .catch(function(err) {
        console.error('❌ 激励视频广告展示失败:', err);
        // 展示失败，尝试重新加载
        self.data.rewardedVideoAd.load()
          .then(function() {
            return self.data.rewardedVideoAd.show();
          })
          .catch(function(err) {
            console.error('❌ 重新加载并展示激励视频广告失败:', err);

            // 根据错误码提供不同的用户反馈
            var errorMsg = '广告加载失败';
            if (err.errCode === 1004) {
              errorMsg = '暂无广告，请稍后再试';
            } else if (err.errCode === 1003) {
              errorMsg = '广告渲染失败，请稍后再试';
            } else if (err.errCode === 1002) {
              errorMsg = '网络异常，请检查网络连接';
            } else if (err.errCode === 1005) {
              errorMsg = '广告组件审核中';
            } else if (err.errCode === 1008) {
              errorMsg = '广告单元已关闭';
            }

            // 更新加载状态
            self.safeSetData({ rewardedVideoAdLoaded: false });

            wx.showModal({
              title: '提示',
              content: errorMsg + '\n\n您的支持很重要！请稍后重试。',
              showCancel: false
            });
          });
      });
  },

  /**
   * 发放无广告奖励（1小时）
   */
  grantAdFreeReward: function() {
    var adFreeManager = require('../../utils/ad-free-manager.js');

    try {
      // 使用统一的工具方法设置1小时无广告状态
      if (adFreeManager.setAdFreeForOneHour()) {
        // 更新页面状态
        this.safeSetData({
          isAdFree: true
        });

        // 更新剩余时间
        this.updateAdFreeTimeRemaining();

        // 🎨 更新为感谢文案
        this.updateAdCopy();

        // 显示感谢提示
        wx.showToast({
          title: '感谢支持！1小时无广告',
          icon: 'success',
          duration: 2000
        });

        console.log('✅ 无广告奖励已发放（1小时）');
      } else {
        // 设置失败，给用户反馈
        wx.showModal({
          title: '保存失败',
          content: '无法保存无广告状态，请稍后重试',
          showCancel: false
        });
      }
    } catch (error) {
      console.error('❌ 发放无广告奖励失败:', error);
      this.handleError(error, '保存失败，请稍后重试');
    }
  },

  /**
   * 检查无广告状态（1小时有效期）
   */
  checkAdFreeStatus: function() {
    var adFreeManager = require('../../utils/ad-free-manager.js');

    try {
      var isAdFree = adFreeManager.isAdFreeActive();

      this.safeSetData({
        isAdFree: isAdFree
      });

      if (isAdFree) {
        // 更新剩余时间
        this.updateAdFreeTimeRemaining();

        // 启动定时器，每10秒更新一次剩余时间
        this.startAdFreeTimer();
      }

      console.log('📅 无广告状态检查:', isAdFree ? '有效期内' : '需要观看广告');
    } catch (error) {
      console.error('❌ 检查无广告状态失败:', error);
    }
  },

  /**
   * 更新无广告剩余时间
   */
  updateAdFreeTimeRemaining: function() {
    var adFreeManager = require('../../utils/ad-free-manager.js');
    var timeStr = adFreeManager.getAdFreeTimeRemaining();

    this.safeSetData({
      adFreeTimeRemaining: timeStr
    });
  },

  /**
   * 启动无广告定时器（每10秒更新一次）
   */
  startAdFreeTimer: function() {
    var self = this;

    // 使用BasePage的安全定时器，页面销毁时自动清理
    this.createSafeInterval(function() {
      if (self.data.isAdFree) {
        var adFreeManager = require('../../utils/ad-free-manager.js');
        
        // 检查是否还在有效期内
        if (adFreeManager.isAdFreeActive()) {
          // 更新剩余时间显示
          self.updateAdFreeTimeRemaining();
        } else {
          // 1小时已过期，恢复广告显示
          self.safeSetData({ isAdFree: false });
          console.log('⏰ 无广告时间已到期，恢复广告显示');
        }
      }
    }, 10000, '无广告时间更新'); // 每10秒更新一次
  },

  /**
   * 销毁激励视频广告实例
   */
  destroyRewardedVideoAd: function() {
    if (this.data.rewardedVideoAd) {
      try {
        this.data.rewardedVideoAd.destroy();
        console.log('🧹 激励视频广告实例已销毁');
      } catch (error) {
        console.error('❌ 销毁激励视频广告实例失败:', error);
      }
    }
  },

  /**
   * 更新广告文案（随机变化）
   */
  updateAdCopy: function() {
    try {
      if (this.data.isAdFree) {
        // 已观看状态：显示随机感谢文案
        var afterCopy = adCopyManager.getAfterAdCopy();
        this.safeSetData({
          adCopyTitle: afterCopy.title,
          adCopyIcon: afterCopy.icon
        });
      } else {
        // 未观看状态：显示随机吸引文案
        var beforeCopy = adCopyManager.getBeforeAdCopy();
        this.safeSetData({
          adCopyTitle: beforeCopy.title,
          adCopyDesc: beforeCopy.desc
        });
      }
    } catch (error) {
      console.error('❌ 更新广告文案失败:', error);
      // 降级方案：使用默认文案
      if (this.data.isAdFree) {
        this.safeSetData({
          adCopyTitle: '江湖有你，真好！',
          adCopyIcon: '✨'
        });
      } else {
        this.safeSetData({
          adCopyTitle: '江湖规矩，看个广告支持一下',
          adCopyDesc: '维护不易，1小时清爽体验'
        });
      }
    }
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
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));
