// 资料查询页面
var BasePage = require('../../utils/base-page.js');
var AdManager = require('../../utils/ad-manager.js');
var AppConfig = require('../../utils/app-config.js');
var tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');

var pageConfig = {
  data: {
    // 所有资料查询卡片
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
        id: 'incident-investigation',
        icon: '🔍',
        title: '事件调查',
        description: '民航征候事件案例查询分析',
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
      }
    ],
    
    // 广告相关
    adClicksRemaining: 100,  // 剩余点击次数
    supportCardHighlight: false  // 支持卡片高亮状态
  },
  
  customOnLoad: function(options) {
    // 页面加载时的逻辑
    console.log('资料查询页面加载');
    
    // 🔧 修复：不重复初始化AdManager，使用App中统一初始化的实例
    // AdManager已在app.js中初始化，这里只需要确保可用性
    if (!AdManager.isInitialized) {
      AdManager.init(); // 只在未初始化时才初始化
    }
    
    // 更新广告剩余点击次数
    this.updateAdClicksRemaining();
    
    // 确保allCategories数据已正确初始化
    if (!this.data.allCategories || this.data.allCategories.length === 0) {
      console.error('资料查询分类数据未初始化');
      // 可以在这里添加重新初始化逻辑或显示错误提示
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },
  
  // 🔧 新增：页面显示时的逻辑
  customOnShow: function() {
    console.log('🎯 资料查询页面显示 - customOnShow被调用');

    // 处理TabBar页面进入（标记访问+更新小红点）
    tabbarBadgeManager.handlePageEnter('pages/search/index');

    // 强制更新广告剩余点击次数显示
    this.updateAdClicksRemaining();

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
    
    // 使用通用卡片点击处理逻辑
    this.handleCardClick(function() {
      // 直接导航到目标页面
      self.navigateToPage(category);
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

  // === 广告相关方法 ===
  
  /**
   * 更新广告剩余点击次数显示
   */
  updateAdClicksRemaining: function() {
    var stats = AdManager.getStatistics();
    var remaining = stats.clicksUntilNext;

    console.log('📊 资料查询页面 - 广告剩余点击次数:', remaining, '(点击:', stats.clickCount, '阈值:', stats.nextThreshold, '时间戳:', stats.timestamp, ')');

    // 🔧 修复：强制更新数据，确保页面显示正确
    this.setData({
      adClicksRemaining: remaining
    });

    // 🚀 新增：当剩余次数为0时，启动红色高亮
    if (remaining === 0) {
      this.startSupportCardBlink();
    } else {
      this.stopSupportCardBlink();
    }

    console.log('📊 资料查询页面 - setData完成，当前页面数据:', this.data.adClicksRemaining);
  },

  /**
   * 🚀 新增:启动激励作者卡片闪烁动画
   */
  startSupportCardBlink: function() {
    // 设置闪烁状态(持续闪烁,不自动停止)
    this.setData({
      supportCardHighlight: true
    });

    console.log('✨ 资料查询页面 - 激励作者卡片开始持续闪烁');
  },

  /**
   * 🚀 新增:停止激励作者卡片闪烁
   */
  stopSupportCardBlink: function() {
    this.setData({
      supportCardHighlight: false
    });

    console.log('🛑 资料查询页面 - 激励作者卡片停止闪烁');
  },
  
  /**
   * 显示激励广告
   */
  showRewardAd: function() {
    // 直接使用广告管理器显示广告对话框
    AdManager.checkAndShow({
      title: '感谢您的支持💗',
      content: '作者独立开发维护不易，观看30秒广告即可支持作者继续优化产品。您的每一次支持都是作者前进的动力，真诚感谢！'
    });
  }

};

Page(BasePage.createPage(pageConfig));