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

// 创建页面配置
var pageConfig = {
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
    
    // 更新问候语
    this.updateGreeting();
    
    // 加载资质数据
    this.refreshQualifications();
    
    // 初始化广告观看计数器
    this.initAdViewCounter();
    
    // 初始化激励视频广告
    this.initRewardVideoAd();
  },
  
  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    console.log('🎯 页面显示');
    
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
   * 打开日出日落
   */
  openSunriseOnly: function() {
    wx.navigateTo({
      url: '/packageO/sunrise-sunset-only/index'
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
    this.setData({ showQRCodeModal: false });
  },
  
  // === 其他功能方法 ===
  
  /**
   * 预览二维码
   */
  previewQRCode: function() {
    wx.previewImage({
      urls: ['/images/OfficialAccount.png']
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
      content: '当前版本：v2.0.3\n\n更新说明：\n- 姿态仪渲染更顺滑，长时运行更稳定\n- GPS 智能滤波与日志开关优化\n- 若干细节与性能优化',
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
   * 初始化激励视频广告
   */
  initRewardVideoAd: function() {
    var self = this;
    
    // 检查是否支持激励视频广告API
    if (!wx.createRewardedVideoAd) {
      console.log('❌ 当前微信版本不支持激励视频广告');
      return;
    }
    
    try {
      // 如果已有广告实例，先销毁
      if (self.data.rewardVideoAd) {
        self.data.rewardVideoAd.destroy();
      }
      
      // 创建激励视频广告实例
      var videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-316c5630d7a1f9ef'
      });
      
      // 广告加载成功
      videoAd.onLoad(function() {
        console.log('✅ 激励视频广告加载成功');
        self.setData({ isAdLoading: false });
      });
      
      // 广告加载失败
      videoAd.onError(function(err) {
        console.error('❌ 激励视频广告加载失败:', err);
        self.setData({ isAdLoading: false });
        self.handleError(err, '加载赞赏广告');
      });
      
      // 广告关闭回调
      videoAd.onClose(function(res) {
        console.log('🎬 激励视频广告关闭, 用户行为:', res);
        
        if (res && res.isEnded) {
          // 用户看完了广告，增加计数器
          self.incrementAdViewCount();
          self.showThankYouMessage();
        } else {
          // 用户中途退出
          wx.showToast({
            title: '感谢您的支持💗',
            icon: 'none',
            duration: 2000
          });
        }
      });
      
      // 保存广告实例
      this.setData({ rewardVideoAd: videoAd });
      
    } catch (error) {
      console.error('❌ 初始化激励视频广告失败:', error);
      this.handleError(error, '初始化赞赏广告');
    }
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
   * 显示激励视频广告
   */
  showRewardAd: function() {
    var self = this;
    
    // 防止重复点击
    if (this.data.isAdLoading) {
      wx.showToast({
        title: '广告加载中...',
        icon: 'loading',
        duration: 1500
      });
      return;
    }
    
    // 先检查网络状态
    this.checkNetworkStatus().then(function(networkType) {
      console.log('🌐 网络状态:', networkType);
      
      // 显示温馨提示
      wx.showModal({
        title: '感谢您的支持💗',
        content: '即将播放30秒广告视频，您的支持是作者持续改进的动力！\n\n飞行模式下此功能不可用',
        confirmText: '观看广告',
        cancelText: '下次吧',
        success: function(res) {
          if (res.confirm) {
            self.playRewardVideo();
          }
        }
      });
      
    }).catch(function(error) {
      console.error('❌ 网络检查失败:', error);
      
      // 飞行模式或网络异常提示
      wx.showModal({
        title: '网络连接异常',
        content: '检测到您可能处于飞行模式或网络连接异常。\n\n赞赏功能需要网络连接，核心功能不受影响。',
        confirmText: '我知道了',
        showCancel: false
      });
    });
  },
  
  /**
   * 播放激励视频
   */
  playRewardVideo: function() {
    var self = this;
    var videoAd = this.data.rewardVideoAd;
    
    if (!videoAd) {
      wx.showToast({
        title: '广告初始化失败',
        icon: 'error',
        duration: 2000
      });
      return;
    }
    
    // 设置加载状态
    this.setData({ isAdLoading: true });
    
    // 显示广告
    videoAd.show().then(function() {
      console.log('✅ 激励视频广告开始播放');
    }).catch(function(error) {
      console.error('❌ 激励视频广告显示失败:', error);
      
      // 失败后尝试重新加载
      self.setData({ isAdLoading: true });
      
      videoAd.load().then(function() {
        return videoAd.show();
      }).then(function() {
        console.log('✅ 重试后激励视频广告开始播放');
      }).catch(function(retryError) {
        console.error('❌ 重试后仍然失败:', retryError);
        self.setData({ isAdLoading: false });
        
        wx.showModal({
          title: '广告播放失败',
          content: '暂时无法播放广告，可能是网络问题或广告资源不足。\n\n感谢您的支持意愿💗',
          confirmText: '我知道了',
          showCancel: false
        });
      });
    });
  },
  
  /**
   * 显示感谢消息
   */
  showThankYouMessage: function() {
    var self = this;
    
    // 显示诚恳的感谢弹窗
    wx.showModal({
      title: '非常感謝您的支持！💗',
      content: '您观看完整的广告对作者来说意义重大！\n\n您的每一次支持都是我持续改进FlightToolbox的动力。\n\n作为飞行员，我深知工具对飞行安全的重要性，我会继续努力为大家提供更好的功能！',
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