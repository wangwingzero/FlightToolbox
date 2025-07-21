// 万能查询通用详情页面
Page({
  data: {
    item: null,
    loading: true,
    type: '', // abbreviation, definition, airport, communication, regulation
    pageTitle: ''
  },

  onLoad: function(options) {
    console.log('详情页面加载参数:', options);
    
    var type = options.type || 'abbreviation';
    var itemId = options.id;
    
    var pageTitle = this.getPageTitle(type);
    this.setData({
      type: type,
      pageTitle: pageTitle
    });
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: pageTitle
    });

    // 加载数据
    this.loadItemData(type, itemId);
  },

  onShow: function() {
    // 页面显示时的操作
  },

  // 获取页面标题
  getPageTitle: function(type) {
    var titles = {
      'abbreviation': '简缩字详情',
      'definition': '定义详情', 
      'airport': '机场详情',
      'communication': '通信用语详情',
      'regulation': '规章详情'
    };
    return titles[type] || '详情';
  },

  // 加载数据
  loadItemData: function(type, itemId) {
    var app = getApp();
    var item = null;

    // 从全局数据获取选中的项目
    switch(type) {
      case 'abbreviation':
        item = app.globalData.selectedAbbreviation;
        break;
      case 'definition':
        item = app.globalData.selectedDefinition;
        break;
      case 'airport':
        item = app.globalData.selectedAirport;
        break;
      case 'communication':
        item = app.globalData.selectedCommunication;
        break;
      case 'regulation':
        item = app.globalData.selectedRegulation;
        break;
    }

    if (item) {
      this.setData({
        item: item,
        loading: false
      });
    } else {
      // 如果没有数据，显示错误或返回
      wx.showToast({
        title: '数据加载失败',
        icon: 'error'
      });
      setTimeout(function() {
        wx.navigateBack();
      }, 1500);
    }
  },


  // 分享功能
  onShare: function() {
    var item = this.data.item;
    var type = this.data.type;
    var content = '';
    
    switch(type) {
      case 'abbreviation':
        content = item.abbreviation + ': ' + item.english_full + ' - ' + item.chinese_translation;
        break;
      case 'definition':
        content = item.chinese_name + ': ' + (item.definition || item.english_name);
        break;
      case 'airport':
        content = item.ShortName + ' (' + item.ICAOCode + '/' + item.IATACode + ') - ' + item.EnglishName;
        break;
      case 'communication':
        content = item.english + ' - ' + item.chinese;
        break;
      case 'regulation':
        content = item.doc_number + ': ' + item.title;
        break;
    }

    wx.setClipboardData({
      data: content,
      success: function() {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  onUnload: function() {
    // 页面卸载清理
  },

  // 页面分享
  onShareAppMessage: function() {
    var item = this.data.item;
    var type = this.data.type;
    var pageTitle = this.data.pageTitle;
    var title = pageTitle;
    
    if (item) {
      switch(type) {
        case 'abbreviation':
          title = item.abbreviation + ' - ' + item.chinese_translation;
          break;
        case 'definition':
          title = item.chinese_name;
          break;
        case 'airport':
          title = item.ShortName + ' (' + item.ICAOCode + ')';
          break;
        case 'communication':
          title = item.chinese;
          break;
        case 'regulation':
          title = item.title || item.doc_number;
          break;
      }
    }

    var itemId = item && item.id ? item.id : '';
    return {
      title: title,
      path: '/pages/abbreviations/detail?type=' + type + '&id=' + itemId,
      imageUrl: '/images/share-logo.png'
    };
  }
});