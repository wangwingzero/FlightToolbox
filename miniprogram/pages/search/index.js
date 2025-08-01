// 资料查询页面
var BasePage = require('../../utils/base-page.js');

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
    ]
  },
  
  customOnLoad: function(options) {
    // 页面加载时的逻辑
    console.log('资料查询页面加载');
    
    // 确保数据正确渲染
    this.setData({
      basicQueryCategories: this.data.basicQueryCategories,
      professionalToolsCategories: this.data.professionalToolsCategories,
      communicationToolsCategories: this.data.communicationToolsCategories,
      performanceToolsCategories: this.data.performanceToolsCategories
    });
  },
  
  // 点击资料卡片
  onCategoryClick: function(e) {
    var self = this;
    var category = e.currentTarget.dataset.category;
    console.log('选择资料分类:', category);
    
    if (!category || !category.path) {
      return;
    }

    // 直接导航到目标页面，移除积分验证
    self.navigateToPage(category);
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

};

Page(BasePage.createPage(pageConfig));