// 性能参数页面
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    // 功能卡片列表
    modules: [
      {
        id: 'aircraft-parameters',
        icon: '🛩️',
        title: '飞机参数',
        desc: '查询各型飞机技术参数',
        pointsText: '',
        pointsType: 'success',
        count: '200+参数',
        countType: 'primary'
      },
      {
        id: 'performance-explanation',
        icon: '📚',
        title: '性能详解',
        desc: '飞机性能参数详细解释',
        pointsText: '',
        pointsType: 'success',
        count: '50+解释',
        countType: 'success'
      },
      {
        id: 'twin-engine-goaround',
        icon: '✈️',
        title: '双发复飞梯度',
        desc: '计算双发飞机复飞性能',
        pointsText: '',
        pointsType: 'success',
        count: '实时计算',
        countType: 'warning'
      },
      {
        id: 'acr',
        icon: '🛬',
        title: 'ACR-PCR',
        desc: '飞机道面承载能力对比',
        pointsText: '',
        pointsType: 'success',
        count: '全机型',
        countType: 'primary'
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
    
    if (module === 'aircraft-parameters') {
      // 飞机参数查询，直接跳转
      wx.navigateTo({
        url: '/packagePerformance/aircraft-parameters/index'
      });
    } else if (module === 'performance-explanation') {
      // 性能详解功能，直接跳转
      wx.navigateTo({
        url: '/packagePerformance/index'
      });
    } else if (module === 'twin-engine-goaround') {
      // 双发复飞梯度，直接跳转
      wx.navigateTo({
        url: '/packageO/twin-engine-goaround/index'
      });
    } else if (module === 'acr') {
      // ACR-PCR，直接跳转
      wx.navigateTo({
        url: '/packageO/flight-calc-modules/acr/index'
      });
    }
    // 后续添加其他模块的跳转逻辑
  },

};

Page(BasePage.createPage(pageConfig));