/**
 * 我的首页页面 - 简化版本
 * 使用BasePage基类，遵循ES5语法
 * 已移除广告和积分系统，专注核心功能
 * 添加赞赏功能支持作者（仅在联网时可用）
 */

var BasePage = require('../../utils/base-page.js');
var dataLoader = require('../../utils/data-loader.js');
var greetingManager = require('../../utils/greeting-manager.js');
var modalManager = require('../../utils/modal-manager.js');
var qualificationHelper = require('../../utils/qualification-helper.js');
var AdManager = require('../../utils/ad-manager.js');
var AppConfig = require('../../utils/app-config.js');

// 创建页面配置
var pageConfig = {
  data: {
    // 广告相关
    adClicksRemaining: 100,  // 剩余点击次数
    
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
    
    // 赞赏广告相关数据
    rewardVideoAd: null,
    isAdLoading: false,
    
    // 广告观看计数器
    adViewCount: 0
  },
  
  /**
   * 自定义页面加载方法
   */
  customOnLoad: function(options) {
    console.log('🎯 页面加载开始');
    
    // 初始化管理器
    modalManager.init(this);
    
    // 初始化广告管理器
    var self = this;
    AdManager.init({
      debug: true,  // 开启调试模式
      adUnitIds: [
        AppConfig.ad.rewardVideoId,
        'adunit-190474fb7b19f51e',
        'adunit-316c5630d7a1f9ef'
      ]
    });
    
    // 保存回调函数用于后续使用
    this.adCallbacks = {
      onComplete: function() {
        // 用户看完广告的回调
        self.incrementAdViewCount();
        self.showThankYouMessage();
      },
      onSkipped: function() {
        // 用户跳过广告的回调
        wx.showToast({
          title: '感谢您的支持💗',
          icon: 'none',
          duration: 2000
        });
      }
    };
    
    // 更新广告剩余点击次数
    this.updateAdClicksRemaining();
    
    // 更新问候语
    this.updateGreeting();
    
    // 加载资质数据
    this.refreshQualifications();
    
    // 初始化广告观看计数器
    this.initAdViewCounter();
  },
  
  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    console.log('🎯 页面显示');
    
    // 更新广告剩余点击次数
    this.updateAdClicksRemaining();
    
    // 更新问候语
    this.updateGreeting();
    
    // 刷新资质数据
    this.refreshQualifications();
  },
  
  /**
   * 更新问候语
   */
  updateGreeting: function() {
    var greeting = greetingManager.getRandomGreeting();
    this.setData({ greeting: greeting });
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
      self.setData({
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
    var self = this;
    this.handleCardClick(function() {
      var target = e.currentTarget.dataset.target;
      console.log('🎯 点击目标：', target, '按钮类型：', target === 'health' ? '健康管理' : '体检标准');
      
      if (target === 'health') {
        console.log('🏥 打开健康管理页面');
        wx.showToast({
          title: '正在打开健康管理',
          icon: 'loading',
          duration: 1000
        });
        
        wx.navigateTo({
          url: '/packageHealth/health-guide/index',
          success: function(res) {
            console.log('✅ 成功跳转到健康管理页面');
          },
          fail: function(err) {
            console.error('❌ 跳转健康管理页面失败:', err);
            wx.showToast({
              title: '健康指南页面加载失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      } else {
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
      }
    });
  },

  /**
   * 通用卡片点击处理 - 检查是否需要引导到激励作者
   */
  handleCardClick: function(navigateCallback) {
    // 检查是否应该引导到激励作者卡片
    if (AdManager.checkAndRedirect()) {
      // 如果触发了引导，更新显示的剩余次数
      this.updateAdClicksRemaining();
      return;
    }
    
    // 否则正常执行导航
    if (navigateCallback && typeof navigateCallback === 'function') {
      navigateCallback();
    }
  },
  
  /**
   * 更新广告剩余点击次数显示
   */
  updateAdClicksRemaining: function() {
    var stats = AdManager.getStatistics();
    var remaining = stats.clicksUntilNext;
    
    this.setData({
      adClicksRemaining: remaining
    });
    
    console.log('📊 广告剩余点击次数:', remaining, '(点击:', stats.clickCount, '阈值:', stats.nextThreshold, '时间戳:', stats.timestamp, ')');
  },
  
  /**
   * 头像点击事件 - 调试模式下设置广告触发次数
   */
  onAvatarTap: function() {
    var self = this;
    
    // 显示确认弹窗
    wx.showModal({
      title: '调试模式',
      content: '是否设置广告在3次操作后触发？\n（此功能仅用于测试）',
      confirmText: '确认设置',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          self.quickSetAdTrigger();
        }
      }
    });
  },

  /**
   * 测试功能：快速设置剩余3次触发
   * 用于快速测试广告弹框功能
   */
  quickSetAdTrigger: function() {
    var self = this;
    
    // 🔧 修复：使用更明显的调试阈值，避免与标准阈值冲突
    var debugThreshold = 103; // 明显的非100倍数阈值
    var debugClickCount = debugThreshold - 3; // 100次点击，剩余3次
    
    // 直接设置调试值
    wx.setStorageSync('ad_card_click_count', debugClickCount);
    wx.setStorageSync('ad_next_threshold', debugThreshold);
    
    wx.showToast({
      title: '🧪 调试模式：剩余3次触发',
      icon: 'success',
      duration: 2000
    });
    
    // 更新显示
    this.updateAdClicksRemaining();
    
    // 🔧 修复：调试模式后通知所有页面更新显示，确保同步
    if (typeof AdManager.notifyPagesUpdateAdDisplay === 'function') {
      AdManager.notifyPagesUpdateAdDisplay();
    }
    
    // 打印调试信息
    var newStats = AdManager.getStatistics();
    console.log('🧪 测试模式设置完成：', {
      '当前点击次数': newStats.clickCount,
      '触发阈值': newStats.nextThreshold,
      '剩余次数': newStats.clicksUntilNext
    });
  },
  
  /**
   * 打开资质管理
   */
  openQualificationManager: function() {
    var self = this;
    this.handleCardClick(function() {
      wx.navigateTo({
        url: '/packageO/qualification-manager/index'
      });
    });
  },

  /**
   * 打开日出日落
   */
  openSunriseOnly: function() {
    var self = this;
    this.handleCardClick(function() {
      wx.navigateTo({
        url: '/packageO/sunrise-sunset-only/index'
      });
    });
  },

  /**
   * 打开夜航时间
   */
  openSunriseSunset: function() {
    var self = this;
    this.handleCardClick(function() {
      wx.navigateTo({
        url: '/packageO/sunrise-sunset/index'
      });
    });
  },

  /**
   * 打开事件报告
   */
  openEventReport: function() {
    var self = this;
    this.handleCardClick(function() {
      wx.navigateTo({
        url: '/packageO/event-report/initial-report'
      });
    });
  },

  /**
   * 打开事件调查
   */
  openIncidentInvestigation: function() {
    var self = this;
    this.handleCardClick(function() {
      wx.navigateTo({
        url: '/packageO/incident-investigation/index'
      });
    });
  },

  /**
   * 打开分飞行时间
   */
  openFlightTimeShare: function() {
    var self = this;
    this.handleCardClick(function() {
      wx.navigateTo({
        url: '/packageO/flight-time-share/index'
      });
    });
  },

  /**
   * 打开个人检查单
   */
  openPersonalChecklist: function() {
    var self = this;
    this.handleCardClick(function() {
      wx.navigateTo({
        url: '/packageO/personal-checklist/index'
      });
    });
  },

  /**
   * 打开长航线换班
   */
  openLongFlightCrewRotation: function() {
    var self = this;
    this.handleCardClick(function() {
      wx.navigateTo({
        url: '/packageO/long-flight-crew-rotation/index'
      });
    });
  },
  
  // === 弹窗关闭方法 ===
  
  /**
   * 关闭二维码弹窗
   */
  closeQRCodeModal: function() {
    this.setData({ showQRCodeModal: false });
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
        self.setData({ showQRCodeModal: true });
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
    this.setData({
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
      content: '当前版本：v2.0.4\n\n更新说明：\n- 更新数据库\n- 增加激励广告\n- 优化GPS欺骗算法',
      showCancel: false,
      confirmText: '确定'
    });
  },
  
  // === 广告观看计数器相关方法 ===
  
  /**
   * 初始化广告观看计数器
   */
  initAdViewCounter: function() {
    var self = this;
    
    // 从本地存储获取广告观看次数
    try {
      var adViewCount = wx.getStorageSync('adViewCount') || 0;
      self.setData({ adViewCount: adViewCount });
      console.log('📊 当前广告观看次数:', adViewCount);
    } catch (error) {
      console.error('❌ 获取广告观看次数失败:', error);
      self.setData({ adViewCount: 0 });
    }
  },
  
  /**
   * 增加广告观看次数
   */
  incrementAdViewCount: function() {
    var self = this;
    var currentCount = self.data.adViewCount;
    var newCount = currentCount + 1;
    
    // 更新页面数据
    self.setData({ adViewCount: newCount });
    
    // 保存到本地存储
    try {
      wx.setStorageSync('adViewCount', newCount);
      console.log('✅ 广告观看次数已更新:', newCount);
    } catch (error) {
      console.error('❌ 保存广告观看次数失败:', error);
    }
  },
  
  // === 赞赏广告相关方法 ===
  
  /**
   * 获取广告实例（使用AdManager的实例）
   */
  getRewardVideoAd: function() {
    // 使用AdManager统一管理的广告实例
    return AdManager.videoAd;
  },
  
  /**
   * 检查网络状态
   */
  checkNetworkStatus: function() {
    return new Promise(function(resolve, reject) {
      wx.getNetworkType({
        success: function(res) {
          if (res.networkType === 'none') {
            reject(new Error('网络连接不可用'));
          } else {
            resolve(res.networkType);
          }
        },
        fail: function(error) {
          reject(error);
        }
      });
    });
  },
  
  /**
   * 激励作者 - 显示广告
   */
  showRewardAd: function() {
    // 直接使用广告管理器显示广告对话框
    AdManager.checkAndShow({
      title: '感谢您的支持💗',
      content: '作者独立开发维护不易，观看30秒广告即可支持作者继续优化产品。您的每一次支持都是作者前进的动力，真诚感谢！'
    });
  },
  
  /**
   * 高亮激励作者卡片（从广告管理器调用）
   */
  highlightSupportCard: function() {
    // 添加高亮动画效果
    this.setData({
      supportCardHighlight: true
    });
    
    // 2秒后移除高亮效果
    setTimeout(() => {
      this.setData({
        supportCardHighlight: false
      });
    }, 2000);
    
    console.log('💫 激励作者卡片高亮提示');
  },
  
  /**
   * 显示感谢消息
   */
  showThankYouMessage: function() {
    var self = this;
    
    // 显示诚恳的感谢弹窗
    wx.showModal({
      title: '非常感謝您的支持！💗',
      content: '您观看完整的广告对作者来说意义重大！\n\n您的每一次支持都是我持续改进飞行工具箱的动力。\n\n我会继续优化功能，为大家带来更好的使用体验！',
      confirmText: '继续使用',
      showCancel: false,
      success: function() {
        // 额外的感谢Toast
        setTimeout(function() {
          wx.showToast({
            title: '❤️ 再次感谢您！',
            icon: 'none',
            duration: 3000
          });
        }, 500);
      }
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
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));