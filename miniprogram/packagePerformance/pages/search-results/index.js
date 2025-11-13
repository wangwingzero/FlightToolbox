var BasePage = require('../../../utils/base-page.js');
var DataIndexCacheManager = require('../../../utils/data-index-cache-manager.js');

var pageConfig = {
  data: {
    loading: true,
    query: '',
    results: [],
    emptyImgSrc: '../../images/search-empty.png'
  },

  customOnLoad: function(options) {
    var q = options && options.q ? decodeURIComponent(options.q) : '';
    this.setData({ query: q });
    this.initSearch();
  },

  initSearch: function() {
    var self = this;
    var q = (this.data.query || '').trim();

    if (!q) {
      this.setData({ loading: false, results: [] });
      return;
    }

    require('../../data/performance-index.js', function(indexArray) {
      DataIndexCacheManager.initDatasetIndex(
        'performance',
        indexArray,
        ['title_zh', 'title_en', 'keywords', 'summary', 'code'],
        'id'
      ).then(function() {
        var ids = DataIndexCacheManager.search('performance', q, 200);
        var list = [];
        for (var i = 0; i < ids.length; i++) {
          for (var j = 0; j < indexArray.length; j++) {
            if (indexArray[j].id === ids[i]) {
              list.push(indexArray[j]);
              break;
            }
          }
        }
        self.setData({ results: list, loading: false });
      }).catch(function(error) {
        console.warn('索引搜索失败，降级到包含匹配:', error);
        var lq = q.toLowerCase();
        var list2 = indexArray.filter(function(it){
          return (
            (it.title_zh && String(it.title_zh).toLowerCase().indexOf(lq) !== -1) ||
            (it.title_en && String(it.title_en).toLowerCase().indexOf(lq) !== -1) ||
            (it.summary && String(it.summary).toLowerCase().indexOf(lq) !== -1) ||
            (it.keywords && String(it.keywords).toLowerCase().indexOf(lq) !== -1) ||
            (it.code && String(it.code).toLowerCase().indexOf(lq) !== -1)
          );
        }).slice(0, 200);
        self.setData({ results: list2, loading: false });
      });
    }, function(error) {
      console.error('加载搜索索引失败:', error);
      self.setData({ loading: false, results: [] });
      self.handleError(error, '加载搜索索引失败');
    });
  },

  onItemTap: function(e) {
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;

    if (!id) return;

    if (type === 'appendix') {
      wx.navigateTo({ url: '/packagePerformance/pages/section-detail/index?type=appendix&id=' + encodeURIComponent(id) });
      return;
    }
    if (type === 'section') {
      wx.navigateTo({ url: '/packagePerformance/pages/section-detail/index?id=' + encodeURIComponent(id) });
      return;
    }
    wx.navigateTo({ url: '/packagePerformance/pages/topic-detail/index?type=' + encodeURIComponent(type) + '&id=' + encodeURIComponent(id) });
  },

  // 空状态图片失败回退 svg
  onEmptyImgError: function() {
    if (this.data && typeof this.data.emptyImgSrc === 'string' && /\.png$/i.test(this.data.emptyImgSrc)) {
      this.setData({ emptyImgSrc: '../../images/search-empty.svg' });
    }
  }
};

Page(BasePage.createPage(pageConfig));
