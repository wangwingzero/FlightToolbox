// 性能参数页面
var BasePage = require('../../utils/base-page.js');
var pointsManager = require('../../utils/points-manager.js');

var pageConfig = {
  data: {
    // 功能卡片列表
    modules: [
      {
        id: 'performance-explanation',
        icon: '📚',
        title: '性能详解',
        desc: '飞机性能参数详细解释',
        tag: '1积分',
        tagType: 'default'
      },
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
    var self = this;
    var module = e.currentTarget.dataset.module;
    console.log('选择模块:', module);
    
    if (module === 'performance-explanation') {
      // 性能详解需要消费1积分
      pointsManager.consumePoints('performance-explanation', '性能详解功能使用').then(function(result) {
        if (result.success) {
          wx.navigateTo({
            url: '/packagePerformance/index'
          });
        } else {
          // 积分不足，已在积分管理器中处理提示
          console.log('积分不足，无法使用性能详解功能');
        }
      }).catch(function(error) {
        console.error('积分扣费失败:', error);
        wx.showToast({
          title: '功能暂时不可用',
          icon: 'none'
        });
      });
    } else if (module === 'twin-engine-goaround') {
      wx.navigateTo({
        url: '/packageO/twin-engine-goaround/index'
      });
    }
    // 后续添加其他模块的跳转逻辑
  }
};

Page(BasePage.createPage(pageConfig));