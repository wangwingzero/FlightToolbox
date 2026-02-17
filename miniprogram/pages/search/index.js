// 资料查询页面
var BasePage = require('../../utils/base-page.js');
var AppConfig = require('../../utils/app-config.js');
var tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');
var adHelper = require('../../utils/ad-helper.js');
var adCopyManager = require('../../utils/ad-copy-manager.js');
var onboardingGuide = require('../../utils/onboarding-guide.js');
var pilotLevelManager = require('../../utils/pilot-level-manager.js');
var EnvDetector = require('../../utils/env-detector.js');

// 调试模式开关：仅在本页面内部控制日志输出
var DEBUG_MODE = false;

var pageConfig = {
  data: {
    // 🦴 骨架屏状态 - 初始为true，确保100ms内显示骨架屏
    // Requirements: 1.5, 9.1
    pageLoading: true,

    // 插屏广告相关
    interstitialAd: null,
    interstitialAdLoaded: false,
    lastInterstitialAdShowTime: 0,

    // 激励视频广告相关
    rewardedVideoAd: null,
    rewardedVideoAdLoaded: false,
    rewardedVideoAdSupported: true,  // 标记是否支持激励视频广告
    hasWatchedToday: false,           // 今日是否已领取经验值

    // 广告文案相关（随机变化）
    adCopyTitle: '',                  // 广告文案标题
    adCopyDesc: '',                   // 广告文案描述
    adCopyIcon: '✨',                 // 感谢文案图标

    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 🔧 BUG-02修复：区分完整列表和显示列表
    // allCategories: 完整的不可变分类列表（原始数据，不修改）
    // displayCategories: 用于显示的分类列表（按使用频率排序后的结果）
    allCategories: [
      {
        id: 'ccar-regulations',
        icon: '📋',
        title: 'CCAR规章',
        description: '局方文件大全，考前必刷神器',
        count: '1447个文件',
        countType: 'primary',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageCCAR/categories/index',
        themeColor: 'blue' // iOS Blue - 深蓝色主题
      },
      {
        id: 'icao-publications',
        icon: '🌐',
        title: 'ICAO出版物',
        description: '国际民航大全，懂了就是专家',
        count: '450+出版物',
        countType: 'primary',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageICAO/index',
        themeColor: 'teal' // iOS Teal - 天蓝色主题
      },
      {
        id: 'term-center',
        icon: '📖',
        title: '缩写·定义·IOSA',
        description: '统一查询缩写 / 定义 / IOSA术语',
        count: '7000+条术语',
        countType: 'warning',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageTermCenter/index',
        themeColor: 'orange' // iOS Orange - 橙色主题
      },
      {
        id: 'airport-data',
        icon: '✈️',
        title: '机场数据',
        description: '全球机场一手掌握，四海为家',
        count: '7405个机场',
        countType: 'primary',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageC/index',
        themeColor: 'purple' // iOS Purple - 紫色主题
      },
      {
        id: 'aircraft-performance',
        icon: '🛩️',
        title: '飞机性能',
        description: '起飞、爬升、巡航、着陆性能速查',
        count: '性能定义与公式',
        countType: 'success',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageAircraftPerformance/pages/index/index',
        themeColor: 'indigo' // iOS Indigo - 靛蓝色主题
      },
      {
        id: 'incident-investigation',
        icon: '🔍',
        title: '事件调查',
        description: '前车之鉴，让飞行更安全',
        count: '案例学习',
        countType: 'success',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageO/incident-investigation/index',
        themeColor: 'red' // iOS Red - 红色主题
      },
      {
        id: 'dangerous-goods',
        icon: '☢️',
        title: '危险品',
        description: '关键时刻的救命稻草',
        count: '200+条规定',
        countType: 'danger',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageO/dangerous-goods/index',
        themeColor: 'system-red' // iOS System Red - 深红色主题
      },
      {
        id: 'sunrise-sunset',
        icon: '🌅',
        title: '日出日落 · 夜航时间',
        description: '日出日落 + 夜航时间一站式计算器',
        count: '天文算法 · 夜航专用',
        countType: 'warning',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageO/sunrise-sunset/index',
        themeColor: 'yellow' // iOS Yellow - 黄色主题
      },
      {
        id: 'medical-standards',
        icon: '📋',
        title: '体检标准',
        description: '体检标准 + 空勤灶，一页搞定什么病吃什么',
        count: '权威标准',
        countType: 'danger',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageMedical/index',
        themeColor: 'pink'
      },
      {
        id: 'competence',
        icon: '🎯',
        title: '胜任力',
        description: '升职加薪的能力地图',
        count: '13项胜任力',
        countType: 'success',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageCompetence/index',
        themeColor: 'mint' // iOS Mint - 薄荷绿主题
      },
      {
        id: 'aircraft-parameters',
        icon: '🛩️',
        title: '飞机参数',
        description: '机型尺寸、重量、航程等参数一览',
        count: '多机型参数',
        countType: 'success',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageAircraftParameters/pages/aircraft-parameters/index',
        themeColor: 'brown' // iOS Brown - 棕色主题
      },
      {
        id: 'walkaround',
        icon: '🔧',
        title: '绕机检查',
        description: 'A330绕机不遗漏的秘籍',
        count: '24个区域',
        countType: 'warning',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageWalkaround/pages/index/index',
        themeColor: 'gray' // iOS Gray - 灰色主题
      },
      {
        id: 'qar-monitoring',
        icon: '📊',
        title: 'QAR红色事件监控项',
        description: '飞行品质监控项目与标准速查',
        count: '民航规〔2024〕49号',
        countType: 'primary',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageQAR/index',
        themeColor: 'indigo' // iOS Indigo - 靛蓝主题
      }
    ],

    // 🔧 BUG-02修复：用于显示的分类列表（初始为空，在onLoad中初始化）
    displayCategories: []
  },
  
  customOnLoad: function(options) {
    var self = this;
    // 页面加载时的逻辑
    if (DEBUG_MODE) {
      console.log('资料查询页面加载');
    }

    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    // 确保allCategories数据已正确初始化
    if (!this.data.allCategories || this.data.allCategories.length === 0) {
      console.error('资料查询分类数据未初始化');
      // 可以在这里添加重新初始化逻辑或显示错误提示
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }

    // 🔧 BUG-02修复：初始化displayCategories为allCategories的副本
    // 保持allCategories不变，只修改displayCategories
    this.setData({
      displayCategories: this.data.allCategories.slice()
    });

    // 🚀 新增：按使用频率排序分类
    this.sortCategoriesByUsage();

    var isDevToolsEnv = false;
    try {
      if (EnvDetector && typeof EnvDetector.isDevTools === 'function') {
        isDevToolsEnv = EnvDetector.isDevTools();
      }
    } catch (e) {
      isDevToolsEnv = false;
    }

    if (!isDevToolsEnv) {
      // 🎬 创建插屏广告实例
      this.createInterstitialAd();

      // 🎁 创建激励视频广告实例
      this.createRewardedVideoAd();

      // ⏰ 检查今日是否已领取经验值
      this.checkTodayExpStatus();

      // 🎨 初始化广告文案
      this.updateAdCopy();
    }

    // 🦴 骨架屏：数据准备完成后隐藏骨架屏
    // 使用 nextTick 确保视图更新后再隐藏，实现平滑过渡
    // Requirements: 1.5, 9.1
    wx.nextTick(function() {
      self.setData({ pageLoading: false });
    });
  },
  
  // 🔧 新增：页面显示时的逻辑
  customOnShow: function() {
    if (DEBUG_MODE) {
      console.log('🎯 资料查询页面显示 - customOnShow被调用');
    }

    // 处理TabBar页面进入（标记访问+更新小红点）
    tabbarBadgeManager.handlePageEnter('pages/search/index');

    var isDevToolsEnv = false;
    try {
      if (EnvDetector && typeof EnvDetector.isDevTools === 'function') {
        isDevToolsEnv = EnvDetector.isDevTools();
      }
    } catch (e) {
      isDevToolsEnv = false;
    }

    if (!isDevToolsEnv) {
      // 🎬 显示插屏广告（频率控制）
      this.showInterstitialAdWithControl();

      // ⏰ 检查今日是否已领取经验值
      this.checkTodayExpStatus();

      // 🎨 更新广告文案（每次显示页面时随机变化）
      this.updateAdCopy();
    }
    if (DEBUG_MODE) {
      console.log('🎯 资料查询页面显示 - customOnShow执行完成');
    }
  },
  
  // 点击资料卡片
  onCategoryClick: function(e) {
    var self = this;
    var category = e.currentTarget.dataset.category;
    if (DEBUG_MODE) {
      console.log('选择资料分类:', category);
    }

    if (!category || !category.path) {
      return;
    }

    // 🚀 记录使用频率
    this.recordCategoryUsage(category.id);

    // 🎬 触发广告：记录卡片点击操作并尝试展示广告（带防抖和异常处理）
    try {
      // 防抖机制：避免短时间内重复触发
      if (this._adTriggerTimer) {
        if (DEBUG_MODE) {
          console.log('🎬 广告触发防抖中，跳过本次');
        }
      } else {
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
      }
    } catch (error) {
      console.error('🎬 广告触发失败:', error);
      // 不影响导航，继续执行
    }

    // 直接导航到目标页面
    if (category.id === 'airport-data') {
      wx.showLoading({
        title: '正在加载机场数据...'
      });

      this.preloadSubpackage('airportPackage').then(function() {
        wx.hideLoading();
        self.navigateToPage(category);
      }).catch(function(error) {
        wx.hideLoading();
        console.warn('预加载机场数据分包失败:', error);
        self.navigateToPage(category);
      });
    } else {
      this.navigateToPage(category);
    }
  },

  navigateToPage: function(category) {
    var self = this;
    wx.navigateTo({
      url: category.path,
      fail: function(err) {
        if (err.errMsg && err.errMsg.indexOf('timeout') !== -1) {
          // 分包加载超时，视为可重试场景，降级为告警日志
          console.warn('导航首次尝试超时，将重试:', err);

          wx.showLoading({
            title: '正在加载分包...'
          });
          
          setTimeout(function() {
            wx.hideLoading();
            wx.navigateTo({
              url: category.path,
              fail: function(retryErr) {
                console.error('重试导航失败:', retryErr);
                self.handleError(retryErr, '页面跳转失败，请重试');
              }
            });
          }, 2000);
        } else {
          console.error('导航失败:', err);
          self.handleError(err, '页面跳转失败');
        }
      }
    });
  },

  // === 🚀 使用频率追踪 ===

  /**
   * 记录分类使用频率
   */
  recordCategoryUsage: function(categoryId) {
    try {
      var usageStats = wx.getStorageSync('card_usage_stats') || {};
      usageStats[categoryId] = (usageStats[categoryId] || 0) + 1;
      wx.setStorageSync('card_usage_stats', usageStats);
      if (DEBUG_MODE) {
        console.log('📊 记录使用:', categoryId, '次数:', usageStats[categoryId]);
      }
    } catch (error) {
      console.error('记录使用频率失败:', error);
    }
  },

  /**
   * 🔧 BUG-02修复：按使用频率排序分类（更新displayCategories）
   */
  sortCategoriesByUsage: function() {
    // 🔧 BUG-02修复：从完整的allCategories排序，更新displayCategories
    var sorted = this.sortByUsageFrequency(this.data.allCategories);
    this.setData({ displayCategories: sorted });
    if (DEBUG_MODE) {
      console.log('🔢 分类已按使用频率排序（完整列表:', this.data.allCategories.length, '个）');
    }
  },

  /**
   * 排序算法：按使用频率降序
   */
  sortByUsageFrequency: function(categories) {
    var usageStats = {};
    try {
      usageStats = wx.getStorageSync('card_usage_stats') || {};
    } catch (error) {
      console.error('读取使用统计失败:', error);
    }

    // 复制数组避免修改原数据
    var sorted = categories.slice();

    sorted.sort(function(a, b) {
      var usageA = usageStats[a.id] || 0;
      var usageB = usageStats[b.id] || 0;
      return usageB - usageA;  // 降序：使用多的排前面
    });

    return sorted;
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
      // 使用顶部导入的统一配置管理广告位ID
      this.data.rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: AppConfig.ad.rewardedVideoAdUnitId
      });

      // ⚠️ 先移除可能存在的旧监听器，防止重复绑定
      // 微信小程序激励视频广告是页面内单例，多次调用会返回同一实例
      this.data.rewardedVideoAd.offLoad();
      this.data.rewardedVideoAd.offError();
      this.data.rewardedVideoAd.offClose();

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
          // 用户完整观看了广告，发放经验值奖励
          console.log('✅ 用户完整观看激励视频广告，发放经验值奖励');
          self.grantExpReward();

          // 🎯 标记用户已观看过激励广告（用于长时间使用提醒判断）
          onboardingGuide.markAdWatched();
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

    // 防御性检查：确保广告实例存在
    if (!this.data.rewardedVideoAd) {
      wx.showToast({
        title: '广告初始化中，请稍后',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (!this.data.rewardedVideoAdLoaded) {
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
        
        // 防御性检查：确保广告实例仍然存在
        if (!self.data.rewardedVideoAd) {
          wx.showToast({
            title: '广告加载失败',
            icon: 'none'
          });
          return;
        }
        
        // 展示失败，尝试重新加载
        self.data.rewardedVideoAd.load()
          .then(function() {
            return self.data.rewardedVideoAd.show();
          })
          .catch(function(retryErr) {
            console.error('❌ 重新加载并展示激励视频广告失败:', retryErr);

            // 根据错误码提供不同的用户反馈
            var errorMsg = '广告加载失败';
            if (retryErr && retryErr.errCode === 1004) {
              errorMsg = '暂无广告，请稍后再试';
            } else if (retryErr && retryErr.errCode === 1003) {
              errorMsg = '广告渲染失败，请稍后再试';
            } else if (retryErr && retryErr.errCode === 1002) {
              errorMsg = '网络异常，请检查网络连接';
            } else if (retryErr && retryErr.errCode === 1005) {
              errorMsg = '广告组件审核中';
            } else if (retryErr && retryErr.errCode === 1008) {
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
   * 发放经验值奖励（每日一次）
   */
  grantExpReward: function() {
    try {
      // 记录今日已领取
      var today = this.getTodayDateStr();
      wx.setStorageSync('last_exp_reward_date', today);

      // 发放经验值
      pilotLevelManager.recordRewardedAdWatch();

      // 更新页面状态
      this.safeSetData({
        hasWatchedToday: true
      });

      // 🎨 更新为感谢文案
      this.updateAdCopy();

      // 显示感谢提示
      wx.showToast({
        title: '感谢支持！+100经验',
        icon: 'success',
        duration: 2000
      });

      console.log('✅ 经验值奖励已发放（+100）');
    } catch (error) {
      console.error('❌ 发放经验值奖励失败:', error);
      wx.showToast({
        title: '领取失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 检查今日是否已领取经验值
   */
  checkTodayExpStatus: function() {
    try {
      var today = this.getTodayDateStr();
      var lastDate = wx.getStorageSync('last_exp_reward_date') || '';
      var hasWatched = (lastDate === today);

      this.safeSetData({
        hasWatchedToday: hasWatched
      });

      console.log('📅 今日经验值状态:', hasWatched ? '已领取' : '未领取');
    } catch (error) {
      console.error('❌ 检查经验值状态失败:', error);
    }
  },

  /**
   * 获取今日日期字符串（YYYY-MM-DD）
   */
  getTodayDateStr: function() {
    var d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var mm = m < 10 ? '0' + m : '' + m;
    var dd = day < 10 ? '0' + day : '' + day;
    return y + '-' + mm + '-' + dd;
  },

  /**
   * 销毁激励视频广告实例
   */
  destroyRewardedVideoAd: function() {
    if (this.data && this.data.rewardedVideoAd) {
      try {
        // 先移除事件监听器，防止内存泄漏
        this.data.rewardedVideoAd.offLoad();
        this.data.rewardedVideoAd.offError();
        this.data.rewardedVideoAd.offClose();
        
        // 销毁广告实例
        this.data.rewardedVideoAd.destroy();
        this.data.rewardedVideoAd = null;
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
      if (this.data.hasWatchedToday) {
        // 已领取状态：显示随机感谢文案
        var afterCopy = adCopyManager.getAfterAdCopy();
        this.safeSetData({
          adCopyTitle: afterCopy.title,
          adCopyIcon: afterCopy.icon
        });
      } else {
        // 未领取状态：显示随机吸引文案
        var beforeCopy = adCopyManager.getBeforeAdCopy();
        this.safeSetData({
          adCopyTitle: beforeCopy.title,
          adCopyDesc: beforeCopy.desc
        });
      }
    } catch (error) {
      console.error('❌ 更新广告文案失败:', error);
      // 降级方案：使用默认文案
      if (this.data.hasWatchedToday) {
        this.safeSetData({
          adCopyTitle: '感谢大佬支持！',
          adCopyIcon: '🫡'
        });
      } else {
        this.safeSetData({
          adCopyTitle: '帮作者买杯咖啡☕',
          adCopyDesc: '30秒视频，你的支持是我更新的动力'
        });
      }
    }
  },

  // === 🎬 插屏广告相关方法 ===

  /**
   * 创建插屏广告实例（使用ad-helper统一管理）
   */
  createInterstitialAd: function() {
    this.data.interstitialAd = adHelper.setupInterstitialAd(this, '资料查询');
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
      '资料查询'
    );
  },

  /**
   * 页面卸载时销毁广告实例（使用ad-helper统一管理）
   */
  customOnUnload: function() {
    if (DEBUG_MODE) {
      console.log('资料查询页面卸载，清理插屏广告资源');
    }
    adHelper.cleanupInterstitialAd(this, '资料查询');

    // 🧹 清理激励视频广告资源
    this.destroyRewardedVideoAd();
  },

  // 转发功能
  onShareAppMessage: function() {
    return {
      title: '飞行工具箱 - 资料查询',
      desc: '专业飞行资料查询工具，支持CCAR规章、机场数据、缩写查询等',
      path: '/pages/search/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '飞行资料查询工具',
      path: '/pages/search/index'
    };
  }

};

Page(BasePage.createPage(pageConfig));