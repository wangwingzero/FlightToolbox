var BasePage = require('../../../utils/base-page.js');

var pageConfig = {
  data: {
    loading: true,
    type: '',
    id: '',
    item: null,
    htmlContent: '',
    sourceText: '',
    plugins: { latex: {} },
    tagStyle: { p: 'line-height:1.8' }
  },

  customOnLoad: function(options) {
    var t = options && options.type ? options.type : '';
    var id = options && options.id ? options.id : '';
    this.setData({ type: t, id: id });
    this.loadItem();
  },

  loadItem: function() {
    var self = this;
    var t = this.data.type;
    var id = this.data.id;

    if (!id) {
      this.setData({ loading: false });
      return;
    }

    if (t === 'quick') {
      try {
        var quick = require('../../data/quick-lookup.js');
        var items = quick && (quick.items || quick.default || quick);
        if (!Array.isArray(items)) items = [];
        var found = null;
        for (var i = 0; i < items.length; i++) {
          if (items[i].id === id) { found = items[i]; break; }
        }
        var html = '';
        if (found && found.summary) {
          html += '<p>' + this._esc(found.summary) + '</p>';
        }
        if (found && found.formulas && found.formulas.length) {
          for (var f = 0; f < found.formulas.length; f++) {
            html += '<p>$$' + String(found.formulas[f]) + '$$</p>';
          }
        }
        var src = '';
        if (found && found.sourceRef && found.sourceRef.title) {
          src = '来源：' + found.sourceRef.title;
        }
        this.setData({ item: found, htmlContent: html, sourceText: src, loading: false });
      } catch (e) {
        console.error('加载快速查询数据失败:', e);
        this.setData({ loading: false });
        this.handleError(e, '加载快速查询数据失败');
      }
      return;
    }

    require('../../data/performance-data.js', function(data) {
      var foundItem = null;

      if (t === 'topic') {
        foundItem = self._findTopicById(data, id);
      } else if (t === 'subsection') {
        foundItem = self._findSubsectionById(data, id);
      } else {
        foundItem = self._findTopicById(data, id) || self._findSubsectionById(data, id);
      }

      var html2 = '';
      if (foundItem && foundItem.content) {
        var parts = String(foundItem.content).split(/\n+/);
        for (var p = 0; p < parts.length; p++) {
          if (parts[p]) html2 += '<p>' + self._esc(parts[p]) + '</p>';
        }
      }
      var src2 = '';
      if (foundItem && foundItem.code && foundItem.title_zh) {
        src2 = '来源：' + foundItem.code + ' ' + foundItem.title_zh;
      }
      self.setData({ item: foundItem, htmlContent: html2, sourceText: src2, loading: false });
    }, function(error) {
      console.error('加载性能数据失败:', error);
      self.setData({ loading: false });
      self.handleError(error, '加载数据失败');
    });
  },

  _findTopicById: function(data, id) {
    var sections = data.sections || [];
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var subs = s.subsections || [];
      for (var j = 0; j < subs.length; j++) {
        var sub = subs[j];
        var topics = sub.topics || [];
        for (var k = 0; k < topics.length; k++) {
          if (topics[k].id === id) return topics[k];
        }
      }
    }
    return null;
  },

  _findSubsectionById: function(data, id) {
    var sections = data.sections || [];
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var subs = s.subsections || [];
      for (var j = 0; j < subs.length; j++) {
        if (subs[j].id === id) return subs[j];
      }
    }
    return null;
  },

  onTopicTap: function(e) {
    var topic = e.currentTarget.dataset.topic;
    if (!topic || !topic.id) return;
    wx.navigateTo({ url: '/packagePerformance/pages/topic-detail/index?type=topic&id=' + encodeURIComponent(topic.id) });
  },

  _esc: function(s) {
    var str = String(s);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

Page(BasePage.createPage(pageConfig));
