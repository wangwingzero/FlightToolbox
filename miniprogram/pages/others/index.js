/// <reference path="../../typings/index.d.ts" />

/**
 * 我的首页页面 - 重构版本
 * 使用BasePage基类，遵循ES5语法
 * 解决重复代码问题，确保离线功能和小程序兼容性
 */

var BasePage = require('../../utils/base-page.js');
var dataLoader = require('../../utils/data-loader.js');
var pointsManagerUtil = require('../../utils/points-manager.js');
var AdManager = require('../../utils/ad-manager.js');
var warningHandlerUtil = require('../../utils/warning-handler.js');
var greetingManager = require('../../utils/greeting-manager.js');
var modalManager = require('../../utils/modal-manager.js');
var qualificationHelper = require('../../utils/qualification-helper.js');

// 创建页面配置
var pageConfig = {
  data: {
    // 资质数据
    qualifications: [],
    greeting: '早上好',
    
    // 积分系统相关数据
    userPoints: 0,
    canSignIn: false,
    signInStreak: 0,
    showPointsModal: false,
    showSignInModal: false,
    showPointsRulesModal: false,
    showProductPhilosophyModal: false,
    signInResult: null,
    pointsTransactions: [],
    nextSignInReward: 15,
    lastPointsCheck: 0,
    pointsMonitorTimer: null,
    
    // 广告观看相关数据
    dailyAdCount: 0,
    currentAdReward: 40,
    remainingAdToday: 15,
    
    // 资质到期统计
    expiringSoonCount: 0,
    
    // 公众号相关数据
    showQRFallback: false,
    showQRCodeModal: false,
    
    // 主题模式相关数据
    themeMode: 'auto',
    
    // 激励视频广告实例
    videoAd: null,
    
    // 减少广告倒计时
    reduceAds: {
      active: false,
      remainingTime: ''
    },
    reduceAdsTimer: null,
    
    showAnalyticsModal: false,
    
    // 个性化推荐
    personalizedRecommendations: [],
    showRecommendationsModal: false,
    
    // 离线数据状态
    offlineDataStatus: {
      totalPackages: 8,
      loadedPackages: 0,
      loadingProgress: 0,
      isAllLoaded: false,
      lastUpdateTime: 0
    },
    showOfflineStatusModal: false,
    
    // 音频分包加载状态
    loadedPackages: []
  },

  /**
   * 自定义页面加载方法
   */
  customOnLoad: function(options) {
    var self = this;
    console.log('🎯 页面加载开始');
    
    // 初始化管理器
    modalManager.init(this);
    
    // 初始化所有系统
    this.initializePreloadedPackages();
    this.initPointsSystem();
    this.updateGreeting();
    this.setupContinuousPointsMonitoring();
    this.loadQualifications();
    this.refreshReduceAdsCountdown();
    this.checkOfflineDataStatus();
    this.initPageRewardedAd();
    this.checkUserGuide();
  },

  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    console.log('🎯 页面显示');
    
    this.checkAndRefreshPoints();
    this.setupContinuousPointsMonitoring();
    this.loadQualifications();
    this.refreshReduceAdsCountdown();
  },

  /**
   * 自定义页面卸载方法
   */
  customOnUnload: function() {
    var self = this;
    
    // 清理激励视频广告实例
    if (this.data.videoAd) {
      try {
        this.data.videoAd.offLoad();
        this.data.videoAd.offError();
        this.data.videoAd.offClose();
        console.log('✅ 激励视频广告事件监听器已清理');
      } catch (error) {
        console.log('⚠️ 清理广告事件监听器时出错:', error);
      }
    }
    
    // 清理积分监听定时器
    if (this.data.pointsMonitorTimer) {
      clearInterval(this.data.pointsMonitorTimer);
      console.log('🎯 页面卸载时清理积分监听器');
    }
    
    if (this.data.reduceAdsTimer) {
      clearInterval(this.data.reduceAdsTimer);
    }
  },

  /**
   * 初始化预加载分包状态
   */
  initializePreloadedPackages: function() {
    // 🔄 预加载模式：标记预加载的分包为已加载
    var preloadedPackages = ["packageC"]; // 1.7MB，预加载到此页面
    var self = this;
    
    preloadedPackages.forEach(function(packageName) {
      if (self.data.loadedPackages.indexOf(packageName) === -1) {
        self.data.loadedPackages.push(packageName);
      }
    });
    
    this.setData({ loadedPackages: this.data.loadedPackages });
    console.log('✅ others 已标记预加载分包:', this.data.loadedPackages);
  },

  /**
   * 检查分包是否已加载（预加载模式）
   */
  isPackageLoaded: function(packageName) {
    // 🔄 预加载模式：检查预加载分包列表和实际加载状态
    var preloadedPackages = ["packageC"]; // 根据app.json预加载规则配置
    return preloadedPackages.indexOf(packageName) !== -1 || this.data.loadedPackages.indexOf(packageName) !== -1;
  },

  /**
   * 更新问候语
   */
  updateGreeting: function() {
    var greeting = greetingManager.getRandomGreeting();
    this.setData({ greeting: greeting });
  },

  /**
   * 初始化积分系统
   */
  initPointsSystem: function() {
    var self = this;
    
    // 使用基类的数据加载方法
    this.loadDataWithLoading(function() {
      return new Promise(function(resolve, reject) {
        pointsManagerUtil.initUser().then(function() {
          self.refreshPointsSystem();
          resolve('积分系统初始化成功');
        }).catch(function(error) {
          console.error('积分系统初始化失败:', error);
          reject(error);
        });
      });
    }, {
      context: '积分系统初始化',
      loadingKey: 'pointsLoading',
      dataKey: 'pointsData'
    });
  },

  /**
   * 刷新积分系统数据
   */
  refreshPointsSystem: function() {
    try {
      var userPoints = pointsManagerUtil.getCurrentPoints();
      var signInStatus = pointsManagerUtil.getSignInStatus();
      var canSignIn = !signInStatus.hasSignedToday;
      var signInStreak = signInStatus.currentStreak || 0;
      var nextSignInReward = pointsManagerUtil.getNextSignInReward(signInStreak);
      var pointsTransactions = pointsManagerUtil.getTransactionHistory(10);
      var dailyAdCount = pointsManagerUtil.getDailyAdCount();
      var remainingAdToday = Math.max(0, 15 - dailyAdCount);
      
      this.setData({
        userPoints: userPoints,
        canSignIn: canSignIn,
        signInStreak: signInStreak,
        nextSignInReward: nextSignInReward,
        pointsTransactions: pointsTransactions,
        dailyAdCount: dailyAdCount,
        remainingAdToday: remainingAdToday
      });
      
      console.log('🎯 积分系统数据刷新完成');
    } catch (error) {
      console.error('刷新积分系统数据失败:', error);
      this.handleError(error, '刷新积分数据');
    }
  },

  /**
   * 检查并刷新积分
   */
  checkAndRefreshPoints: function() {
    var lastPointsUpdate = wx.getStorageSync('points_updated') || 0;
    var lastCheck = this.data.lastPointsCheck || 0;
    
    if (lastPointsUpdate > lastCheck) {
      console.log('🎯 onShow检测到积分更新，立即刷新显示');
      this.setData({ lastPointsCheck: lastPointsUpdate });
      
      // 显示积分更新提示
      var timeDiff = Date.now() - lastPointsUpdate;
      if (timeDiff < 3000) {
        this.showSuccess('积分已到账！');
      }
    }
    
    this.refreshPointsSystem();
  },

  /**
   * 加载资质数据
   */
  loadQualifications: function() {
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

  /**
   * 设置持续积分监控
   */
  setupContinuousPointsMonitoring: function() {
    var self = this;
    
    // 清除之前的定时器
    if (this.data.pointsMonitorTimer) {
      clearInterval(this.data.pointsMonitorTimer);
    }
    
    // 设置新的定时器
    var timer = setInterval(function() {
      var lastPointsUpdate = wx.getStorageSync('points_updated') || 0;
      var lastCheck = self.data.lastPointsCheck || 0;
      
      if (lastPointsUpdate > lastCheck) {
        console.log('🎯 后台监听检测到积分更新');
        self.setData({ lastPointsCheck: lastPointsUpdate });
        self.refreshPointsSystem();
      }
    }, 2000);
    
    this.setData({ pointsMonitorTimer: timer });
  },

  /**
   * 刷新减少广告倒计时状态
   */
  refreshReduceAdsCountdown: function() {
    var self = this;
    
    try {
      var reduceAdsEndTime = wx.getStorageSync('reduce_ads_end_time') || 0;
      var now = Date.now();
      
      if (reduceAdsEndTime > now) {
        var remainingTime = reduceAdsEndTime - now;
        var hours = Math.floor(remainingTime / 3600000);
        var minutes = Math.floor((remainingTime % 3600000) / 60000);
        
        this.setData({
          'reduceAds.active': true,
          'reduceAds.remainingTime': hours + '小时' + minutes + '分钟'
        });
        
        // 启动倒计时器
        this.startReduceAdsCountdown();
      } else {
        this.setData({
          'reduceAds.active': false,
          'reduceAds.remainingTime': ''
        });
      }
    } catch (error) {
      console.error('刷新减少广告倒计时状态失败:', error);
    }
  },

  /**
   * 启动减少广告倒计时
   */
  startReduceAdsCountdown: function() {
    var self = this;
    
    // 清除之前的倒计时器
    if (this.data.reduceAdsTimer) {
      clearInterval(this.data.reduceAdsTimer);
    }
    
    var timer = setInterval(function() {
      var reduceAdsEndTime = wx.getStorageSync('reduce_ads_end_time') || 0;
      var now = Date.now();
      
      if (reduceAdsEndTime > now) {
        var remainingTime = reduceAdsEndTime - now;
        var hours = Math.floor(remainingTime / 3600000);
        var minutes = Math.floor((remainingTime % 3600000) / 60000);
        
        self.setData({
          'reduceAds.remainingTime': hours + '小时' + minutes + '分钟'
        });
      } else {
        self.setData({
          'reduceAds.active': false,
          'reduceAds.remainingTime': ''
        });
        clearInterval(timer);
      }
    }, 60000); // 每分钟更新一次
    
    this.setData({ reduceAdsTimer: timer });
  },

  /**
   * 检查离线数据状态
   */
  checkOfflineDataStatus: function() {
    var self = this;
    
    this.loadDataWithLoading(function() {
      return new Promise(function(resolve, reject) {
        try {
          var packageNames = ['packageA', 'packageB', 'packageC', 'packageD', 'packageE', 'packageF', 'packageG', 'packageH'];
          var loadedCount = 0;
          var loadPromises = [];
          
          packageNames.forEach(function(packageName) {
            var promise = self.checkPackageLoaded(packageName).then(function(isLoaded) {
              if (isLoaded) {
                loadedCount++;
              }
              return isLoaded;
            });
            loadPromises.push(promise);
          });
          
          Promise.all(loadPromises).then(function(results) {
            var totalPackages = packageNames.length;
            var loadingProgress = Math.round((loadedCount / totalPackages) * 100);
            var isAllLoaded = loadedCount === totalPackages;
            
            resolve({
              totalPackages: totalPackages,
              loadedPackages: loadedCount,
              loadingProgress: loadingProgress,
              isAllLoaded: isAllLoaded,
              lastUpdateTime: Date.now()
            });
          });
        } catch (error) {
          reject(error);
        }
      });
    }, {
      context: '离线数据状态检查',
      loadingKey: 'offlineStatusLoading',
      dataKey: 'offlineStatusData'
    }).then(function(status) {
      self.setData({ offlineDataStatus: status });
    }).catch(function(error) {
      console.error('检查离线数据状态失败:', error);
    });
  },

  /**
   * 检查分包是否已加载
   */
  checkPackageLoaded: function(packageName) {
    return new Promise(function(resolve, reject) {
      try {
        var testPath = '../' + packageName + '/index.js';
        require(testPath);
        resolve(true);
      } catch (error) {
        resolve(false);
      }
    });
  },

  /**
   * 初始化页面激励视频广告
   */
  initPageRewardedAd: function() {
    var self = this;
    
    try {
      if (typeof wx.createRewardedVideoAd === 'function') {
        var videoAd = wx.createRewardedVideoAd({
          adUnitId: 'adunit-72c5bb5399f91a40'
        });
        
        videoAd.onLoad(function() {
          console.log('✅ 激励视频广告加载成功');
        });
        
        videoAd.onError(function(err) {
          console.error('❌ 激励视频广告加载失败:', err);
        });
        
        videoAd.onClose(function(res) {
          if (res && res.isEnded) {
            self.handleAdReward();
          } else {
            self.showError('请观看完整广告以获得奖励');
          }
        });
        
        this.setData({ videoAd: videoAd });
      } else {
        console.warn('⚠️ 当前环境不支持激励视频广告');
      }
    } catch (error) {
      console.error('初始化激励视频广告失败:', error);
    }
  },

  /**
   * 处理广告奖励
   */
  handleAdReward: function() {
    var self = this;
    
    pointsManagerUtil.watchAdReward().then(function(result) {
      if (result.success) {
        self.showSuccess('获得' + result.points + '积分！');
        self.refreshPointsSystem();
        
        // 记录积分更新时间
        wx.setStorageSync('points_updated', Date.now());
      } else {
        self.showError(result.message || '获得奖励失败');
      }
    }).catch(function(error) {
      console.error('处理广告奖励失败:', error);
      self.handleError(error, '处理广告奖励');
    });
  },

  /**
   * 检查用户引导
   */
  checkUserGuide: function() {
    try {
      var hasShownGuide = wx.getStorageSync('has_shown_user_guide');
      if (!hasShownGuide) {
        // 显示用户引导逻辑
        console.log('🎯 新用户，显示引导');
        wx.setStorageSync('has_shown_user_guide', true);
      }
    } catch (error) {
      console.warn('检查用户引导失败:', error);
    }
  },

  /**
   * 签到方法
   */
  signIn: function() {
    var self = this;
    
    this.loadDataWithLoading(function() {
      return pointsManagerUtil.dailySignIn();
    }, {
      context: '每日签到',
      loadingKey: 'signInLoading'
    }).then(function(result) {
      self.setData({
        signInResult: result,
        showSignInModal: true
      });
      self.refreshPointsSystem();
      
      // 记录积分更新时间
      wx.setStorageSync('points_updated', Date.now());
    }).catch(function(error) {
      self.showError('签到失败：' + error.message);
    });
  },

  /**
   * 观看广告
   */
  watchAd: function() {
    if (this.data.videoAd) {
      this.data.videoAd.show().catch(function(err) {
        console.error('显示激励视频广告失败:', err);
        self.showError('广告加载失败，请稍后重试');
      });
    } else {
      this.showError('广告功能暂不可用');
    }
  },

  /**
   * 显示积分详情
   */
  showPointsDetail: function() {
    this.setData({ showPointsModal: true });
  },

  /**
   * 关闭积分详情
   */
  closePointsModal: function() {
    this.setData({ showPointsModal: false });
  },

  /**
   * 关闭签到结果弹窗
   */
  closeSignInModal: function() {
    this.setData({ showSignInModal: false });
  },

  /**
   * 导航到指定页面
   */
  navigateToPage: function(e) {
    var url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url: url
      });
    }
  },

  /**
   * 打开双发复飞梯度查询
   */
  openTwinEngineGoAround: function() {
    wx.navigateTo({
      url: '/packageO/twin-engine-goaround/index'
    });
  },

  /**
   * 打开日出日落时间查询
   */
  openSunriseOnly: function() {
    wx.navigateTo({
      url: '/packageO/sunrise-sunset-only/index'
    });
  },

  /**
   * 打开夜航时间计算
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
      url: '/packageO/event-report/index'
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
   * 打开资质管理
   */
  openQualificationManager: function() {
    wx.navigateTo({
      url: '/packageO/qualification-manager/index'
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
   * 每日签到
   */
  dailySignIn: function() {
    this.signIn();
  },

  /**
   * 观看广告获取积分
   */
  watchAdForPoints: function() {
    this.watchAd();
  },

  /**
   * 显示积分规则
   */
  showPointsRules: function() {
    this.setData({ showPointsRulesModal: true });
  },

  /**
   * 显示产品理念
   */
  showProductPhilosophy: function() {
    this.setData({ showProductPhilosophyModal: true });
  },

  /**
   * 关闭积分规则弹窗
   */
  closePointsRulesModal: function() {
    this.setData({ showPointsRulesModal: false });
  },

  /**
   * 关闭产品理念弹窗
   */
  closeProductPhilosophyModal: function() {
    this.setData({ showProductPhilosophyModal: false });
  },

  /**
   * 打开危险品查询
   */
  openDangerousGoods: function() {
    wx.navigateTo({
      url: '/packageO/dangerous-goods/index'
    });
  },

  /**
   * 打开RODEX解码器
   */
  openRodexDecoder: function() {
    wx.navigateTo({
      url: '/packageO/rodex-decoder/index'
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

  /**
   * 关闭分析弹窗
   */
  closeAnalyticsModal: function() {
    this.setData({ showAnalyticsModal: false });
  },

  /**
   * 关闭二维码弹窗
   */
  closeQRCodeModal: function() {
    this.setData({ showQRCodeModal: false });
  },

  /**
   * 关闭报告详情
   */
  closeReportDetail: function() {
    // 处理报告详情关闭逻辑
  },

  /**
   * 预览二维码
   */
  previewQRCode: function() {
    // 处理二维码预览逻辑
  },

  /**
   * 选择主题模式
   */
  selectThemeMode: function(e) {
    var mode = e.currentTarget.dataset.mode;
    if (mode) {
      // 处理主题模式切换逻辑
      try {
        var themeManager = require('../../utils/theme-manager.js');
        themeManager.setTheme(mode);
        this.setData({ themeMode: mode });
      } catch (error) {
        console.error('主题切换失败:', error);
      }
    }
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));