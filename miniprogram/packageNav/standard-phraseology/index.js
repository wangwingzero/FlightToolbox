// packageNav/standard-phraseology/index.js
var BasePage = require('../../utils/base-page.js');
var phraseologyModule = require('../phraseology.js');

var PAGE_SIZE = 20;

/**
 * 将嵌套的 phraseology 数据扁平化为数组
 */
function flattenPhraseology(rawData) {
  var result = [];
  var id = 1;
  var speakerMap = {
    'ATC': { label: '管制员', cls: 'atc' },
    'Pilot': { label: '飞行员', cls: 'pilot' },
    'Pilot/ATC': { label: '双方', cls: 'both' },
    'Ground Crew': { label: '地勤', cls: 'ground' },
    'Flight Crew': { label: '机组', cls: 'crew' }
  };

  var categoryKeys = Object.keys(rawData);
  for (var c = 0; c < categoryKeys.length; c++) {
    var category = categoryKeys[c];
    var subCategories = rawData[category];
    var subKeys = Object.keys(subCategories);
    for (var s = 0; s < subKeys.length; s++) {
      var subKey = subKeys[s];
      var items = subCategories[subKey];
      // 从 subKey 中提取可读的子分类名
      var situation = subKey.replace(/^\d+_\d+_\d+_\d+_/, '');
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var speakerInfo = speakerMap[item.speaker] || { label: item.speaker, cls: 'other' };
        result.push({
          id: id++,
          category: category,
          situation: situation,
          situation_cn: item.situation_cn,
          phrase_en: item.phrase_en,
          phrase_cn: item.phrase_cn,
          speaker: speakerInfo.label,
          speakerClass: speakerInfo.cls,
          sourceType: 'phraseology'
        });
      }
    }
  }
  return result;
}

/**
 * 构建分类列表（含计数）
 */
function buildCategoryList(allData) {
  var categoryMap = {};
  for (var i = 0; i < allData.length; i++) {
    var cat = allData[i].category;
    if (!categoryMap[cat]) {
      categoryMap[cat] = 0;
    }
    categoryMap[cat]++;
  }

  var list = [{ name: 'all', title: '全部', count: allData.length }];
  var keys = Object.keys(categoryMap);
  for (var k = 0; k < keys.length; k++) {
    list.push({ name: keys[k], title: keys[k], count: categoryMap[keys[k]] });
  }
  return list;
}

/**
 * 搜索高亮
 */
function highlightText(text, keyword) {
  if (!keyword || !text) return '';
  var lowerText = text.toLowerCase();
  var lowerKw = keyword.toLowerCase();
  var idx = lowerText.indexOf(lowerKw);
  if (idx === -1) return '';
  var before = text.substring(0, idx);
  var match = text.substring(idx, idx + keyword.length);
  var after = text.substring(idx + keyword.length);
  return before + '<span style="color:#e74c3c;font-weight:bold;">' + match + '</span>' + after;
}

Page(BasePage.createPage({
  data: {
    phraseologyList: [],
    filteredPhraseology: [],
    displayData: [],
    categoryList: [],
    activeTab: 'all',
    searchKeyword: '',
    searchPlaceholder: '搜索通话用语（中英文/情景）',
    hasMore: false,
    isLoading: false,
    showDetailPopup: false,
    selectedPhrase: null
  },

  customOnLoad: function() {
    var rawData = phraseologyModule.phraseology;
    var allData = flattenPhraseology(rawData);
    var categoryList = buildCategoryList(allData);
    var displayData = allData.slice(0, PAGE_SIZE);

    this.setData({
      phraseologyList: allData,
      filteredPhraseology: allData,
      displayData: displayData,
      categoryList: categoryList,
      hasMore: allData.length > PAGE_SIZE
    });
  },

  customOnShow: function() {
    // 无需额外操作
  },

  customOnUnload: function() {
    // 无需清理
  },

  /**
   * 分类标签切换
   */
  onTabChange: function(e) {
    var name = e.currentTarget.dataset.name;
    this.setData({ activeTab: name });
    this._applyFilter();
  },

  /**
   * 搜索输入
   */
  onSearchChange: function(e) {
    var keyword = e.detail || '';
    this.setData({ searchKeyword: keyword });
    this._applyFilter();
  },

  /**
   * 清除搜索
   */
  onSearchClear: function() {
    this.setData({ searchKeyword: '' });
    this._applyFilter();
  },

  /**
   * 统一筛选 + 分页逻辑
   */
  _applyFilter: function() {
    var self = this;
    var keyword = self.data.searchKeyword;
    var tab = self.data.activeTab;
    var allData = self.data.phraseologyList;
    var filtered = [];

    for (var i = 0; i < allData.length; i++) {
      var item = allData[i];

      // 分类过滤
      if (tab !== 'all' && item.category !== tab) continue;

      // 搜索过滤
      if (keyword) {
        var kw = keyword.toLowerCase();
        var match = false;
        if (item.situation_cn && item.situation_cn.toLowerCase().indexOf(kw) > -1) match = true;
        if (item.phrase_en && item.phrase_en.toLowerCase().indexOf(kw) > -1) match = true;
        if (item.phrase_cn && item.phrase_cn.toLowerCase().indexOf(kw) > -1) match = true;
        if (item.situation && item.situation.toLowerCase().indexOf(kw) > -1) match = true;
        if (item.speaker && item.speaker.toLowerCase().indexOf(kw) > -1) match = true;
        if (!match) continue;
      }

      // 添加高亮
      var entry = {};
      for (var key in item) {
        if (item.hasOwnProperty(key)) {
          entry[key] = item[key];
        }
      }

      if (keyword) {
        entry.situation_cn_highlighted = highlightText(item.situation_cn, keyword);
        entry.situation_highlighted = highlightText(item.situation, keyword);
        entry.phrase_en_highlighted = highlightText(item.phrase_en, keyword);
        entry.phrase_cn_highlighted = highlightText(item.phrase_cn, keyword);
      } else {
        entry.situation_cn_highlighted = '';
        entry.situation_highlighted = '';
        entry.phrase_en_highlighted = '';
        entry.phrase_cn_highlighted = '';
      }

      filtered.push(entry);
    }

    var displayData = filtered.slice(0, PAGE_SIZE);
    self.setData({
      filteredPhraseology: filtered,
      displayData: displayData,
      hasMore: filtered.length > PAGE_SIZE
    });
  },

  /**
   * 加载更多
   */
  loadMore: function() {
    if (this.data.isLoading) return;
    var self = this;
    var currentLen = self.data.displayData.length;
    var filtered = self.data.filteredPhraseology;

    if (currentLen >= filtered.length) return;

    self.setData({ isLoading: true });

    // 模拟微延迟让 loading 动画显示
    setTimeout(function() {
      var nextBatch = filtered.slice(currentLen, currentLen + PAGE_SIZE);
      var newDisplay = self.data.displayData.concat(nextBatch);
      self.setData({
        displayData: newDisplay,
        hasMore: newDisplay.length < filtered.length,
        isLoading: false
      });
    }, 200);
  },

  /**
   * 显示详情弹窗
   */
  showPhraseDetail: function(e) {
    var index = parseInt(e.currentTarget.dataset.index, 10);
    var phrase = this.data.displayData[index];
    if (phrase) {
      this.setData({
        selectedPhrase: phrase,
        showDetailPopup: true
      });
    }
  },

  /**
   * 关闭详情弹窗
   */
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false
    });
  },

  /**
   * 打开通信技术要点（跳转到通信规则页面）
   */
  openCommunicationRules: function() {
    wx.navigateTo({
      url: '/packageNav/data/communication-rules/index',
      fail: function() {
        wx.showToast({
          title: '页面暂未开放',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 广告事件
   */
  onAdLoad: function() {
    console.log('横幅广告加载成功');
  },

  onAdError: function(err) {
    console.log('横幅广告加载失败:', err);
  },

  onShareAppMessage: function() {
    return {
      title: '陆空通话标准用语 - FlightToolbox',
      path: '/packageNav/standard-phraseology/index'
    };
  }
}));