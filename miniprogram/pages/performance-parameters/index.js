// 性能参数页面
var BasePage = require('../../utils/base-page.js');
var pointsManager = require('../../utils/points-manager.js');

var pageConfig = {
  data: {
    // 功能卡片列表
    modules: [
      {
        id: 'aircraft-parameters',
        icon: '🛩️',
        title: '飞机参数',
        desc: '查询各型飞机技术参数',
        tag: '免费',
        tagType: 'success'
      },
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
        tag: '3积分',
        tagType: 'warning'
      },
      {
        id: 'acr',
        icon: '🛬',
        title: 'ACR-PCR',
        desc: '飞机道面承载能力对比',
        tag: '2积分',
        tagType: 'primary'
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
    
    if (module === 'aircraft-parameters') {
      // 飞机参数查询，免费功能
      wx.navigateTo({
        url: '/packagePerformance/aircraft-parameters/index'
      });
    } else if (module === 'performance-explanation') {
      // 性能详解需要消费1积分
      pointsManager.consumePoints('performance-explanation', '性能详解功能使用').then(function(result) {
        if (result.success) {
          // 记录积分更新时间，让其他页面刷新积分显示
          wx.setStorageSync('points_updated', Date.now());
          
          // 显示积分扣费提示
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 2000
          });
          
          // 延迟跳转，让用户看到积分扣费提示
          setTimeout(function() {
            wx.navigateTo({
              url: '/packagePerformance/index'
            });
          }, 1000);
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
      // 双发复飞梯度需要消费3积分
      pointsManager.consumePoints('twin-engine-goaround', '双发复飞梯度功能使用').then(function(result) {
        if (result.success) {
          // 记录积分更新时间，让其他页面刷新积分显示
          wx.setStorageSync('points_updated', Date.now());
          
          // 显示积分扣费提示
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 2000
          });
          
          // 延迟跳转，让用户看到积分扣费提示
          setTimeout(function() {
            wx.navigateTo({
              url: '/packageO/twin-engine-goaround/index'
            });
          }, 1000);
        } else {
          // 积分不足，已在积分管理器中处理提示
          console.log('积分不足，无法使用双发复飞梯度功能');
        }
      }).catch(function(error) {
        console.error('积分扣费失败:', error);
        wx.showToast({
          title: '功能暂时不可用',
          icon: 'none'
        });
      });
    } else if (module === 'acr') {
      // ACR-PCR需要消费2积分
      pointsManager.consumePoints('flight-calc-acr', 'ACR-PCR计算功能使用').then(function(result) {
        if (result.success) {
          // 记录积分更新时间，让其他页面刷新积分显示
          wx.setStorageSync('points_updated', Date.now());
          
          // 显示积分扣费提示
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 2000
          });
          
          // 延迟跳转，让用户看到积分扣费提示
          setTimeout(function() {
            wx.navigateTo({
              url: '/packageO/flight-calc-modules/acr/index'
            });
          }, 1000);
        } else {
          // 积分不足，已在积分管理器中处理提示
          console.log('积分不足，无法使用ACR-PCR功能');
        }
      }).catch(function(error) {
        console.error('积分扣费失败:', error);
        wx.showToast({
          title: '功能暂时不可用',
          icon: 'none'
        });
      });
    }
    // 后续添加其他模块的跳转逻辑
  }
};

Page(BasePage.createPage(pageConfig));