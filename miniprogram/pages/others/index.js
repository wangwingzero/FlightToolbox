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
    
    // 其他UI相关数据
    showAnalyticsModal: false,
    showReportDetailModal: false,
    selectedReport: null,
    medicalStandardsAvailable: true
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
    this.initializeAllSystems();
    
    // 更新问候语
    this.updateGreeting();
  },
  
  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    console.log('🎯 页面显示');
    
    // 更新问候语
    this.updateGreeting();
    
    // 刷新积分系统
    this.refreshPointsSystem();
    
    // 刷新资质数据
    this.refreshQualifications();
    
    // 检查并刷新积分
    this.checkAndRefreshPoints();
  },
  
  /**
   * 自定义页面隐藏方法
   */
  customOnHide: function() {
    // 清除定时器
    if (this.data.pointsMonitorTimer) {
      clearInterval(this.data.pointsMonitorTimer);
      this.setData({ pointsMonitorTimer: null });
    }
  },
  
  /**
   * 自定义页面卸载方法
   */
  customOnUnload: function() {
    // 清除所有定时器
    if (this.data.pointsMonitorTimer) {
      clearInterval(this.data.pointsMonitorTimer);
    }
  },
  
  /**
   * 初始化所有系统
   */
  initializeAllSystems: function() {
    // 初始化积分系统
    this.initPointsSystem();
    
    // 初始化激励视频广告
    this.initRewardedVideoAd();
    
    // 设置持续积分监控
    this.setupContinuousPointsMonitoring();
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
      var currentAdReward = pointsManagerUtil.getCurrentAdReward();
      var remainingAdToday = Math.max(0, 15 - dailyAdCount);
      
      this.setData({
        userPoints: userPoints,
        canSignIn: canSignIn,
        signInStreak: signInStreak,
        nextSignInReward: nextSignInReward,
        pointsTransactions: pointsTransactions,
        dailyAdCount: dailyAdCount,
        currentAdReward: currentAdReward,
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
      
      this.refreshPointsSystem();
    }
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
   * 初始化激励视频广告
   */
  initRewardedVideoAd: function() {
    var self = this;
    
    try {
      if (wx.createRewardedVideoAd) {
        var videoAd = wx.createRewardedVideoAd({
          adUnitId: 'adunit-316c5630d7a1f9ef'
        });
        
        videoAd.onLoad(function() {
          console.log('激励视频广告加载成功');
        });
        
        videoAd.onError(function(err) {
          console.error('激励视频广告加载失败:', err);
          // 如果是开发环境，给出友好提示
          if (err.errCode === 1004) {
            console.warn('⚠️ 广告位配置错误或广告数据不可用');
          }
        });
        
        videoAd.onClose(function(res) {
          if (res && res.isEnded) {
            self.handleAdReward();
          } else {
            self.showError('请观看完整广告以获得奖励');
          }
          
          // 广告播放完成后重新加载，为下次播放做准备
          videoAd.load().catch(function(loadErr) {
            console.warn('重新加载广告失败:', loadErr);
          });
        });
        
        // 初始加载广告
        videoAd.load().catch(function(loadErr) {
          console.warn('初始加载广告失败:', loadErr);
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
        self.showSuccess('获得' + result.reward + '积分！');
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
        signInResult: {
          pointsEarned: result.pointsEarned,
          consecutiveDays: result.streak,
          nextSignInReward: self.data.nextSignInReward
        },
        showSignInModal: true
      });
      self.refreshPointsSystem();
      
      // 记录积分更新时间
      wx.setStorageSync('points_updated', Date.now());
    }).catch(function(error) {
      self.showError('签到失败：' + (error.message || '未知错误'));
    });
  },
  
  /**
   * 观看广告
   */
  watchAd: function() {
    var self = this;
    if (this.data.videoAd) {
      // 直接显示广告，失败时重新加载后再次尝试
      this.data.videoAd.show().catch(function(err) {
        console.error('激励视频广告显示失败:', err);
        
        // 失败重试：先加载后显示
        self.data.videoAd.load().then(function() {
          return self.data.videoAd.show();
        }).catch(function(retryErr) {
          console.error('激励视频广告重试失败:', retryErr);
          
          // 处理不同类型的错误
          if (retryErr.errMsg && retryErr.errMsg.includes('no advertisement data available')) {
            self.showError('暂无广告资源，请稍后重试');
          } else if (retryErr.errCode === 1004) {
            self.showError('广告配置错误，功能暂不可用');
          } else {
            self.showError('广告加载失败，请稍后重试');
          }
        });
      });
    } else {
      this.showError('广告功能暂不可用');
    }
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
    var self = this;
    // 雪情通告解码器需要消费3积分
    pointsManagerUtil.consumePoints('snowtam-decoder', '雪情通告解码器功能使用').then(function(result) {
      if (result.success) {
        // 立即刷新积分显示
        self.refreshPointsSystem();
        
        // 记录积分更新时间
        wx.setStorageSync('points_updated', Date.now());
        
        // 显示积分扣费提示
        wx.showToast({
          title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
          icon: 'success',
          duration: 2000
        });
        
        // 延迟跳转，让用户看到积分扣费提示
        setTimeout(function() {
          wx.navigateTo({
            url: '/packageO/snowtam-decoder/index'
          });
        }, 1000);
      } else {
        // 积分不足，已在积分管理器中处理提示
        console.log('积分不足，无法使用雪情通告解码器功能');
      }
    }).catch(function(error) {
      console.error('积分扣费失败:', error);
      self.showError('功能暂时不可用');
    });
  },
  
  /**
   * 测试雪情通告导航
   */
  testSnowtamNavigation: function() {
    this.openSnowtamEncoder();
  },

  // 打开体检标准页面
  openMedicalStandards: function(e) {
    var self = this;
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
      // 体检标准需要消费2积分
      pointsManagerUtil.consumePoints('medical-standards', '体检标准查询功能使用').then(function(result) {
        if (result.success) {
          // 立即刷新积分显示
          self.refreshPointsSystem();
          
          // 记录积分更新时间
          wx.setStorageSync('points_updated', Date.now());
          
          // 显示积分扣费提示
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 2000
          });
          
          // 延迟跳转，让用户看到积分扣费提示
          setTimeout(function() {
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
          }, 1000);
        } else {
          // 积分不足，已在积分管理器中处理提示
          console.log('积分不足，无法使用体检标准功能');
        }
      }).catch(function(error) {
        console.error('积分扣费失败:', error);
        self.showError('功能暂时不可用');
      });
    }
  },

  // 添加其他缺失的方法
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
    var self = this;
    // 事件报告需要消费3积分
    pointsManagerUtil.consumePoints('event-report', '事件报告功能使用').then(function(result) {
      if (result.success) {
        // 立即刷新积分显示
        self.refreshPointsSystem();
        
        // 记录积分更新时间
        wx.setStorageSync('points_updated', Date.now());
        
        // 显示积分扣费提示
        wx.showToast({
          title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
          icon: 'success',
          duration: 2000
        });
        
        // 延迟跳转，让用户看到积分扣费提示
        setTimeout(function() {
          wx.navigateTo({
            url: '/packageO/event-report/initial-report'
          });
        }, 1000);
      } else {
        // 积分不足，已在积分管理器中处理提示
        console.log('积分不足，无法使用事件报告功能');
      }
    }).catch(function(error) {
      console.error('积分扣费失败:', error);
      self.showError('功能暂时不可用');
    });
  },

  /**
   * 打开事件调查
   */
  openIncidentInvestigation: function() {
    var self = this;
    // 事件调查需要消费3积分
    pointsManagerUtil.consumePoints('incident-investigation', '事件调查功能使用').then(function(result) {
      if (result.success) {
        // 立即刷新积分显示
        self.refreshPointsSystem();
        
        // 记录积分更新时间
        wx.setStorageSync('points_updated', Date.now());
        
        // 显示积分扣费提示
        wx.showToast({
          title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
          icon: 'success',
          duration: 2000
        });
        
        // 延迟跳转，让用户看到积分扣费提示
        setTimeout(function() {
          wx.navigateTo({
            url: '/packageO/incident-investigation/index'
          });
        }, 1000);
      } else {
        // 积分不足，已在积分管理器中处理提示
        console.log('积分不足，无法使用事件调查功能');
      }
    }).catch(function(error) {
      console.error('积分扣费失败:', error);
      self.showError('功能暂时不可用');
    });
  },

  /**
   * 打开分飞行时间
   */
  openFlightTimeShare: function() {
    var self = this;
    // 分飞行时间需要消费2积分
    pointsManagerUtil.consumePoints('flight-time-share', '分飞行时间功能使用').then(function(result) {
      if (result.success) {
        // 立即刷新积分显示
        self.refreshPointsSystem();
        
        // 记录积分更新时间
        wx.setStorageSync('points_updated', Date.now());
        
        // 显示积分扣费提示
        wx.showToast({
          title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
          icon: 'success',
          duration: 2000
        });
        
        // 延迟跳转，让用户看到积分扣费提示
        setTimeout(function() {
          wx.navigateTo({
            url: '/packageO/flight-time-share/index'
          });
        }, 1000);
      } else {
        // 积分不足，已在积分管理器中处理提示
        console.log('积分不足，无法使用分飞行时间功能');
      }
    }).catch(function(error) {
      console.error('积分扣费失败:', error);
      self.showError('功能暂时不可用');
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
    var self = this;
    // 长航线换班需要消费3积分
    pointsManagerUtil.consumePoints('long-flight-crew-rotation', '长航线换班功能使用').then(function(result) {
      if (result.success) {
        // 立即刷新积分显示
        self.refreshPointsSystem();
        
        // 记录积分更新时间
        wx.setStorageSync('points_updated', Date.now());
        
        // 显示积分扣费提示
        wx.showToast({
          title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
          icon: 'success',
          duration: 2000
        });
        
        // 延迟跳转，让用户看到积分扣费提示
        setTimeout(function() {
          wx.navigateTo({
            url: '/packageO/long-flight-crew-rotation/index'
          });
        }, 1000);
      } else {
        // 积分不足，已在积分管理器中处理提示
        console.log('积分不足，无法使用长航线换班功能');
      }
    }).catch(function(error) {
      console.error('积分扣费失败:', error);
      self.showError('功能暂时不可用');
    });
  },

  // === 积分相关方法 ===
  
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
   * 显示积分详情
   */
  showPointsDetail: function() {
    this.setData({ showPointsModal: true });
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
  
  // === 弹窗关闭方法 ===
  
  /**
   * 关闭积分详情
   */
  closePointsModal: function() {
    this.setData({ showPointsModal: false });
  },

  /**
   * 关闭签到成功弹窗
   */
  closeSignInModal: function() {
    this.setData({ showSignInModal: false });
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
   * 关闭报告详情
   */
  closeReportDetail: function() {
    this.setData({ showReportDetailModal: false });
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
    wx.navigateTo({
      url: '/pages/official-account/index'
    });
  },
  
  /**
   * 选择主题模式
   */
  selectThemeMode: function(e) {
    var mode = e.currentTarget.dataset.mode;
    this.setData({ themeMode: mode });
    wx.setStorageSync('themeMode', mode);
    
    // 通知其他页面更新主题
    wx.setStorageSync('theme_updated', Date.now());
  },
  
  /**
   * 格式化交易类型
   */
  formatTransactionType: function(type) {
    var typeMap = {
      'consume': '积分消费',
      'button_consume': '功能使用',
      'reward': '积分奖励',
      'new_user': '新用户奖励',
      'signin_normal': '每日签到',
      'signin_streak_2': '连续签到',
      'signin_streak_7': '连续签到',
      'signin_streak_30': '连续签到',
      'ad_watch': '观看广告'
    };
    return typeMap[type] || type;
  },
  
  /**
   * 格式化交易时间
   */
  formatTransactionTime: function(timestamp) {
    if (!timestamp) return '';
    
    var date = new Date(timestamp);
    var now = new Date();
    var diff = now - date;
    
    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) {
      return Math.floor(diff / 3600000) + '小时前';
    } else {
      return (date.getMonth() + 1) + '月' + date.getDate() + '日';
    }
  },
  
  /**
   * 意见反馈
   */
  feedback: function() {
    wx.navigateTo({
      url: '/pages/feedback/index'
    });
  },
  
  /**
   * 关于作者
   */
  aboutUs: function() {
    wx.navigateTo({
      url: '/pages/about/index'
    });
  },
  
  /**
   * 版本信息
   */
  onVersionTap: function() {
    this.showSuccess('v1.2.1 - 积分系统版');
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));