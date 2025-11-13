var BasePage = require('../../../utils/base-page.js');

var pageConfig = {
  data: {
    loading: true,
    selectedType: 'all',
    allItems: [],
    displayItems: [],
    emptyImgSrc: '../../images/quick-lookup-empty.png'
  },

  customOnLoad: function() {
    this.loadQuickData();
  },

  loadQuickData: function() {
    var self = this;
    try {
      var data = require('../../data/quick-lookup.js');
      var items = data && (data.items || data.default || data);
      if (!Array.isArray(items)) items = [];
      self.setData({
        allItems: items,
        displayItems: items,
        loading: false
      });
    } catch (e) {
      console.error('❌ 加载快速查询数据失败:', e);
      self.setData({ loading: false });
      self.handleError(e, '加载快速查询数据失败');
    }
  },

  onFilterTap: function(e) {
    var t = e.currentTarget.dataset.type || 'all';
    this.setData({ selectedType: t });
    if (t === 'all') {
      this.setData({ displayItems: this.data.allItems });
      return;
    }
    var filtered = this.data.allItems.filter(function(it){ return it.type === t; });
    this.setData({ displayItems: filtered });
  },

  onItemTap: function(e) {
    var id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url: '/packagePerformance/pages/topic-detail/index?type=quick&id=' + encodeURIComponent(id)
    });
  },

  // 空状态图片失败回退 svg
  onEmptyImgError: function() {
    if (this.data && typeof this.data.emptyImgSrc === 'string' && /\.png$/i.test(this.data.emptyImgSrc)) {
      this.setData({ emptyImgSrc: '../../images/quick-lookup-empty.svg' });
    }
  }
};

Page(BasePage.createPage(pageConfig));
