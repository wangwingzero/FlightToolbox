// 资料查询页面
var BasePage = require('../../utils/base-page.js');
var AppConfig = require('../../utils/app-config.js');
var tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');
var adHelper = require('../../utils/ad-helper.js');

// 调试模式开关：仅在本页面内部控制日志输出
var DEBUG_MODE = false;

var pageConfig = {
  data: {
    // 插屏广告相关
    interstitialAd: null,
    interstitialAdLoaded: false,
    lastInterstitialAdShowTime: 0,

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
        path: '/packageCCAR/categories/index'
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
        path: '/packageICAO/index'
      },
      {
        id: 'abbreviations',
        icon: '🔤',
        title: '缩写',
        description: '告别字母恐惧症的神器',
        count: '3200+条缩写',
        countType: 'warning',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageB/index'
      },
      {
        id: 'authoritative-definitions',
        icon: '📚',
        title: '权威定义',
        description: '不懂就查，秒变行家',
        count: '3000+条定义',
        countType: 'success',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageD/index'
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
        path: '/packageC/index'
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
        path: '/packageAircraftPerformance/pages/index/index'
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
        path: '/packageO/incident-investigation/index'
      },
      {
        id: 'medical-standards',
        icon: '📋',
        title: '体检标准',
        description: '体检前必看，心里有底不慌',
        count: '权威标准',
        countType: 'danger',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageMedical/index'
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
        path: '/packageO/dangerous-goods/index'
      },
      {
        id: 'sunrise-sunset',
        icon: '🌅',
        title: '日出日落',
        description: '追着太阳飞的浪漫计算器',
        count: '天文算法',
        countType: 'warning',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageO/sunrise-sunset-only/index'
      },
      {
        id: 'iosa-audit',
        icon: '📋',
        title: 'IOSA审计',
        description: '审计神器，过检不慌',
        count: '897条术语',
        countType: 'primary',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageIOSA/index'
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
        path: '/packageCompetence/index'
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
        path: '/packageAircraftParameters/pages/aircraft-parameters/index'
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
        path: '/packageWalkaround/pages/index/index'
      }
    ],

    // 🔧 BUG-02修复：用于显示的分类列表（初始为空，在onLoad中初始化）
    displayCategories: []
  },
  
  customOnLoad: function(options) {
    // 页面加载时的逻辑
    if (DEBUG_MODE) {
      console.log('资料查询页面加载');
    }

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

    // 🎬 创建插屏广告实例
    this.createInterstitialAd();
  },
  
  // 🔧 新增：页面显示时的逻辑
  customOnShow: function() {
    if (DEBUG_MODE) {
      console.log('🎯 资料查询页面显示 - customOnShow被调用');
    }

    // 处理TabBar页面进入（标记访问+更新小红点）
    tabbarBadgeManager.handlePageEnter('pages/search/index');

    // 🎬 显示插屏广告（频率控制）
    this.showInterstitialAdWithControl();
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
    this.navigateToPage(category);
  },

  navigateToPage: function(category) {
    var self = this;
    wx.navigateTo({
      url: category.path,
      fail: function(err) {
        console.error('导航失败:', err);
        
        if (err.errMsg && err.errMsg.includes('timeout')) {
          // 分包加载超时，给用户友好提示
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