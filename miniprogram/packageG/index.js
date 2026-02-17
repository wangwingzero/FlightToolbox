/**
 * packageG 分包入口页面 - 危险品查询分包
 * 使用BasePage基类，确保资源管理和错误处理
 */

var BasePage = require('../utils/base-page.js');

var pageConfig = {
  data: {
    title: '危险品查询分包',
    loading: false
  },

  /**
   * 自定义页面加载方法
   */
  customOnLoad: function(options) {
    console.log('📦 packageG 分包页面加载 - 危险品查询');

    // 初始化页面数据
    this.initPageData();
  },

  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    console.log('📦 packageG 分包页面显示');
  },

  /**
   * 自定义页面卸载方法
   */
  customOnUnload: function() {
    console.log('📦 packageG 分包页面卸载');
    // BasePage会自动清理资源，这里处理自定义清理逻辑
  },

  /**
   * 初始化页面数据
   */
  initPageData: function() {
    // 使用safeSetData确保安全的数据更新
    this.safeSetData({
      title: '危险品查询分包',
      loading: false
    });
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));
