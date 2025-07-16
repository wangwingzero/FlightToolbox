// 性能参数页面
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    // 功能卡片列表
    modules: [
      {
        id: 'twin-engine-goaround',
        icon: '✈️',
        title: '双发复飞梯度',
        desc: '计算双发飞机复飞性能',
        tag: '免费',
        tagType: 'success'
      }
      // 后续会添加更多性能相关功能
    ]
  },
  
  customOnLoad: function(options) {
    // 页面加载时的逻辑
    console.log('性能参数页面加载');
  },
  
  // 选择功能模块
  selectModule: function(e) {
    var module = e.currentTarget.dataset.module;
    console.log('选择模块:', module);
    
    if (module === 'twin-engine-goaround') {
      wx.navigateTo({
        url: '/packageO/twin-engine-goaround/index'
      });
    }
    // 后续添加其他模块的跳转逻辑
  }
};

Page(BasePage.createPage(pageConfig));