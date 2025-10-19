// 资料查询页面
var BasePage = require('../../utils/base-page.js');
var AppConfig = require('../../utils/app-config.js');
var tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');
var adHelper = require('../../utils/ad-helper.js');

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
        description: '民航局规章制度及规范性文件',
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
        description: 'ICAO技术手册与标准附件',
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
        description: 'AIP及空客缩写术语查询',
        count: '2万+条缩写',
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
        description: '航空专业术语权威定义查询',
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
        description: '全球机场信息查询及代码检索',
        count: '7405个机场',
        countType: 'primary',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageC/index'
      },
      {
        id: 'incident-investigation',
        icon: '🔍',
        title: '事件调查',
        description: '搜索征候、事件等定性标准',
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
        description: '民航飞行员体检标准详细查询',
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
        description: '规定查询助手',
        count: '200+条规定',
        countType: 'danger',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageO/dangerous-goods/index'
      },
      {
        id: 'performance-explanation',
        icon: '📚',
        title: '性能术语',
        description: '飞机性能参数详细解释',
        count: '50+解释',
        countType: 'success',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packagePerformance/index'
      },
      {
        id: 'sunrise-sunset',
        icon: '🌅',
        title: '日出日落',
        description: '精确计算任意地点的日出日落时间',
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
        description: 'IATA运行安全审计术语查询',
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
        description: 'PLM胜任力及行为指标框架',
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
        description: '查询各型飞机技术参数',
        count: '200+参数',
        countType: 'primary',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packagePerformance/aircraft-parameters/index'
      }
    ],

    // 🔧 BUG-02修复：用于显示的分类列表（初始为空，在onLoad中初始化）
    displayCategories: []
  },
  
  customOnLoad: function(options) {
    // 页面加载时的逻辑
    console.log('资料查询页面加载');

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
    console.log('🎯 资料查询页面显示 - customOnShow被调用');

    // 处理TabBar页面进入（标记访问+更新小红点）
    tabbarBadgeManager.handlePageEnter('pages/search/index');

    // 🎬 显示插屏广告（频率控制）
    this.showInterstitialAdWithControl();

    console.log('🎯 资料查询页面显示 - customOnShow执行完成');
  },
  
  // 点击资料卡片
  onCategoryClick: function(e) {
    var self = this;
    var category = e.currentTarget.dataset.category;
    console.log('选择资料分类:', category);

    if (!category || !category.path) {
      return;
    }

    // 🚀 记录使用频率
    this.recordCategoryUsage(category.id);

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
      console.log('📊 记录使用:', categoryId, '次数:', usageStats[categoryId]);
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
    console.log('🔢 分类已按使用频率排序（完整列表:', this.data.allCategories.length, '个）');
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
   * 显示插屏广告（带全局频率控制）
   * 策略：全局60秒间隔，避免跨页面重复展示
   */
  showInterstitialAdWithControl: function() {
    // 使用ad-helper的安全展示方法（自动处理频率控制）
    adHelper.showInterstitialAdSafely(
      this.data.interstitialAd,
      1000,  // 延迟1秒
      this,  // 页面上下文（用于createSafeTimeout）
      '资料查询'
    );
  },

  /**
   * 页面卸载时销毁广告实例（使用ad-helper统一管理）
   */
  customOnUnload: function() {
    console.log('资料查询页面卸载，清理插屏广告资源');
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