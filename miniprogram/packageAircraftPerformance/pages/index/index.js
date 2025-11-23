// 飞机性能主页面（搜索 + 列表）
var BasePage = require('../../../utils/base-page.js');
var formulaCards = require('../../aircraft-performance-formula-cards.js');

// 根据标签确定主题色类名
function getThemeClass(tags) {
  if (!tags || tags.length === 0) return 'theme-default';
  
  var tagStr = tags.join(',');
  
  // 基础概念/基础公式 - 蓝色
  if (tagStr.indexOf('基础概念') !== -1 || tagStr.indexOf('基础公式') !== -1) {
    return 'theme-blue';
  }
  // 重量 - 紫色
  if (tagStr.indexOf('重量') !== -1) {
    return 'theme-purple';
  }
  // 起飞 - 橙色
  if (tagStr.indexOf('起飞') !== -1) {
    return 'theme-orange';
  }
  // 限制 - 红色
  if (tagStr.indexOf('限制') !== -1 && tagStr.indexOf('起飞') === -1) {
    return 'theme-red';
  }
  // 进近/着陆 - 绿色
  if (tagStr.indexOf('进近') !== -1 || tagStr.indexOf('着陆') !== -1) {
    return 'theme-green';
  }
  // 飞行力学 - 青色
  if (tagStr.indexOf('飞行力学') !== -1) {
    return 'theme-cyan';
  }
  // 爬升/下降 - 靛青色
  if (tagStr.indexOf('爬升') !== -1 || tagStr.indexOf('下降') !== -1) {
    return 'theme-indigo';
  }
  
  return 'theme-default';
}

var pageConfig = {
  data: {
    // 原始数据：公式卡片
    allCards: [],

    // 搜索关键字
    searchValue: '',

    // 展示列表
    displayedCards: [],

    loading: true
  },

  customOnLoad: function() {
    this.loadCards();
  },

  // 加载公式卡片数据
  loadCards: function() {
    var cards = formulaCards || [];
    var enhanced = cards.map(function(item) {
      var cloned = Object.assign({}, item);
      // 约定：图片文件名与卡片 id 一致
      cloned.imagePath = '../../images/' + item.id + '.png';
      // 根据标签确定主题色
      cloned.themeClass = getThemeClass(item.tags || []);
      return cloned;
    });

    this.setData({
      allCards: enhanced,
      loading: false
    });
    this.applyFilters();
  },

  // 搜索输入
  onSearchChange: function(e) {
    // van-search 的 change 事件 detail 直接是字符串
    var raw = '';
    if (typeof e.detail === 'string') {
      raw = e.detail;
    } else if (e.detail && typeof e.detail.value === 'string') {
      raw = e.detail.value;
    }

    var value = raw.replace(/^\s+|\s+$/g, ''); // 等价于 trim()
    this.setData({ searchValue: value });
    this.applyFilters();
  },

  onSearchClear: function() {
    this.setData({ searchValue: '' });
    this.applyFilters();
  },

  // 搜索过滤逻辑
  applyFilters: function() {
    var allCards = this.data.allCards || [];
    var keyword = (this.data.searchValue || '').trim().toLowerCase();

    if (!keyword) {
      this.setData({
        displayedCards: allCards
      });
      return;
    }

    var filtered = allCards.filter(function(item) {
      var titleZh = (item.titleZh || '').toLowerCase();
      var summaryZh = (item.summaryZh || '').toLowerCase();
      var contentZh = (item.contentZh || '').toLowerCase();
      var keywordsZh = (item.keywordsZh || []).join(' ').toLowerCase();

      return (
        titleZh.indexOf(keyword) !== -1 ||
        summaryZh.indexOf(keyword) !== -1 ||
        contentZh.indexOf(keyword) !== -1 ||
        keywordsZh.indexOf(keyword) !== -1
      );
    });

    this.setData({
      displayedCards: filtered
    });
  },

  // 点击卡片进入详情
  onCardTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/packageAircraftPerformance/pages/detail/index?id=' + encodeURIComponent(id)
    });
  },

  // 预览卡片图片大图
  onImagePreview: function(e) {
    var src = e.currentTarget.dataset.src;
    if (!src) {
      return;
    }

    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    wx.getImageInfo({
      src: src,
      success: function(res) {
        wx.hideLoading();
        var path = res && res.path ? res.path : src;
        wx.previewImage({
          current: path,
          urls: [path]
        });
      },
      fail: function() {
        wx.hideLoading();
        wx.previewImage({
          current: src,
          urls: [src]
        });
      }
    });
  }
};

Page(BasePage.createPage(pageConfig));
