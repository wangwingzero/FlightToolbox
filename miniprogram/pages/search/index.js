// 资料查询页面
var BasePage = require('../../utils/base-page.js');
var pointsManager = require('../../utils/points-manager.js');

var pageConfig = {
  data: {
    // 资料查询卡片列表
    categories: [
      {
        id: 'ccar-regulations',
        icon: '📋',
        title: 'CCAR规章',
        description: '民航局规章制度及规范性文件',
        count: '1447个文件',
        countType: 'primary',  // 数据量标签颜色
        pointsRequired: 2,
        pointsType: 'primary',
        pointsText: '2积分',
        path: '/packageCCAR/categories/index'
      },
      {
        id: 'airport-data',
        icon: '✈️',
        title: '机场数据',
        description: '全球机场信息查询及代码检索',
        count: '7405个机场',
        countType: 'primary',  // 数据量标签颜色
        pointsRequired: 1,
        pointsType: 'default',
        pointsText: '1积分',
        path: '/packageC/index'
      },
      {
        id: 'authoritative-definitions',
        icon: '📚',
        title: '权威定义',
        description: '航空专业术语权威定义查询',
        count: '3000+条定义',
        countType: 'success',  // 数据量标签颜色
        pointsRequired: 1,
        pointsType: 'default',
        pointsText: '1积分',
        path: '/packageD/index'
      },
      {
        id: 'abbreviations',
        icon: '🔤',
        title: '缩写',
        description: 'AIP标准及空客缩写术语查询',
        count: '2万+条缩写',
        countType: 'warning',  // 数据量标签颜色
        pointsRequired: 1,
        pointsType: 'default',
        pointsText: '1积分',
        path: '/packageB/index'
      },
      {
        id: 'communication-translation',
        icon: '📱',
        title: '通信翻译',
        description: 'ICAO标准航空英语及应急特情词汇',
        count: '1400+条句子词汇',
        countType: 'primary',  // 数据量标签颜色
        pointsRequired: 0,
        pointsType: 'success',
        pointsText: '免费',
        path: '/packageA/index'
      },
      {
        id: 'dangerous-goods',
        icon: '☢️',
        title: '危险品',
        description: '规定查询助手',
        count: '200+条规定',
        countType: 'danger',  // 数据量标签颜色
        pointsRequired: 3,
        pointsType: 'warning',
        pointsText: '3积分',
        path: '/packageO/dangerous-goods/index'
      }
    ]
  },
  
  customOnLoad: function(options) {
    // 页面加载时的逻辑
    console.log('资料查询页面加载');
    
    // 确保数据正确渲染
    this.setData({
      categories: this.data.categories
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

    // 检查积分并消费
    if (category.pointsRequired > 0) {
      // 需要积分的功能，先检查和消费积分
      pointsManager.consumePoints(category.id, `查询${category.title}`).then(function(result) {
        if (result.success) {
          // 积分消费成功，继续导航
          wx.showToast({
            title: `消费${category.pointsRequired}积分`,
            icon: 'success',
            duration: 1500
          });
          self.navigateToPage(category);
        } else {
          // 积分不足，显示提示并引导获取积分
          wx.showModal({
            title: '积分不足',
            content: `查询${category.title}需要${category.pointsRequired}积分\n当前积分：${result.currentPoints || 0}\n\n请通过签到或观看广告获取积分`,
            showCancel: true,
            cancelText: '取消',
            confirmText: '获取积分',
            success: function(modalRes) {
              if (modalRes.confirm) {
                // 跳转到首页获取积分
                wx.switchTab({
                  url: '/pages/home/index'
                });
              }
            }
          });
        }
      }).catch(function(error) {
        console.error('积分消费失败:', error);
        self.handleError(error, '积分系统异常');
      });
    } else {
      // 免费功能，直接导航
      self.navigateToPage(category);
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

  // 广告事件处理
  adLoad: function() {
    console.log('横幅广告加载成功');
  },
  
  adError: function(err) {
    console.error('横幅广告加载失败', err);
  },
  
  adClose: function() {
    console.log('横幅广告关闭');
  },

  // 底部广告事件处理
  adLoadBottom: function() {
    console.log('底部横幅广告加载成功');
  },
  
  adErrorBottom: function(err) {
    console.error('底部横幅广告加载失败', err);
  },
  
  adCloseBottom: function() {
    console.log('底部横幅广告关闭');
  }
};

Page(BasePage.createPage(pageConfig));