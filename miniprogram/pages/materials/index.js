// 资料查询页面
var BasePage = require('../../utils/base-page.js');

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
        tagType: 'primary',
        path: '/packageCCAR/categories/index'
      }
      // 后续可以添加更多资料卡片
    ]
  },
  
  customOnLoad: function(options) {
    // 页面加载时的逻辑
    console.log('资料查询页面加载');
  },
  
  // 点击资料卡片
  onCategoryClick: function(e) {
    var self = this;
    var category = e.currentTarget.dataset.category;
    console.log('选择资料分类:', category);
    
    if (category && category.path) {
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
    }
  }
};

Page(BasePage.createPage(pageConfig));