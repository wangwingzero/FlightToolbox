// 资料查询页面
var BasePage = require('../../utils/base-page.js');
var AdManager = require('../../utils/ad-manager.js');
var AppConfig = require('../../utils/app-config.js');

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
        description: 'AIP标准及空客缩写术语查询',
        count: '2万+条缩写',
        countType: 'warning',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageB/index'
      },
      {
        id: 'communication-translation',
        icon: '📱',
        title: '通信翻译',
        description: 'ICAO标准航空英语及应急特情词汇',
        count: '1400+条句子词汇',
        countType: 'primary',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageA/index'
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
        title: '性能详解',
        description: '飞机性能参数详细解释',
        count: '50+解释',
        countType: 'success',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packagePerformance/index'
      },
      {
        id: 'twin-engine-goaround',
        icon: '✈️',
        title: '双发复飞梯度',
        description: '计算双发飞机复飞性能',
        count: '实时计算',
        countType: 'warning',
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '',
        path: '/packageO/twin-engine-goaround/index'
      }
    ],
    
    // 广告相关
    adClicksRemaining: 100,  // 剩余点击次数
    supportCardHighlight: false  // 支持卡片高亮状态
  },
  
  customOnLoad: function(options) {
    // 页面加载时的逻辑
    console.log('资料查询页面加载');
    
    // 初始化广告管理器（传入页面上下文）
    AdManager.init(this, AppConfig.ad.rewardVideoId);
    
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
    
    this.setData({
      adClicksRemaining: remaining
    });
    
    console.log('📊 资料查询页面 - 广告剩余点击次数:', remaining);
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
    
    console.log('💫 资料查询页面 - 激励作者卡片高亮提示');
  }

};

Page(BasePage.createPage(pageConfig));