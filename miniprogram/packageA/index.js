// 通信翻译页面
var BasePage = require('../utils/base-page.js');

// 导入通信翻译数据
var icao900Data = require('./icao900.js');
var emergencyGlossaryData = require('./emergencyGlossary.js');

var pageConfig = {
  data: {
    // 当前激活的标签
    activeTab: 'all',
    
    // 搜索相关
    searchValue: '',
    searchPlaceholder: '搜索英语句子、中文翻译或应急词汇...',
    
    // 所有通信数据
    allData: [],
    
    // 当前显示的数据
    displayData: [],
    
    // 总数统计
    totalCount: 0,
    
    // 详情弹窗
    showDetailPopup: false,
    selectedItem: {},
    
    // 分类映射
    categoryMap: {
      'icao900': { name: 'ICAO标准英语', color: 'blue' },
      'emergency': { name: '应急特情词汇', color: 'red' }
    },

    // 标签列表
    tabList: [
      { name: 'all', title: '全部', icon: '📋', count: 0 },
      { name: 'icao900', title: 'ICAO900', icon: '✈️', count: 0 },
      { name: 'emergency', title: '应急词汇', icon: '🚨', count: 0 }
    ]
  },

  customOnLoad: function(options) {
    console.log('通信翻译页面加载');
    this.loadCommunicationData();
  },

  // 加载通信翻译数据
  loadCommunicationData: function() {
    var allData = [];
    
    // 加载ICAO900数据
    var icao900 = [];
    var chapters = icao900Data.chapters || [];
    chapters.forEach(function(chapter) {
      if (chapter.sentences && chapter.sentences.length > 0) {
        chapter.sentences.forEach(function(sentence) {
          icao900.push({
            id: sentence.id,
            english: sentence.english,
            chinese: sentence.chinese,
            chapter: chapter.name
          });
        });
      }
    });
    
    icao900.forEach(function(item) {
      allData.push({
        id: 'icao_' + item.id,
        category: 'icao900',
        categoryName: 'ICAO标准英语',
        chapterName: item.chapter,
        english: item.english,
        chinese: item.chinese,
        type: 'sentence'
      });
    });
    
    // 加载应急词汇数据
    var emergencyGlossary = emergencyGlossaryData.emergencyGlossary.glossary || emergencyGlossaryData.glossary || [];
    emergencyGlossary.forEach(function(categoryItem, categoryIndex) {
      if (categoryItem.terms && categoryItem.terms.length > 0) {
        categoryItem.terms.forEach(function(term, termIndex) {
          allData.push({
            id: 'emergency_' + categoryIndex + '_' + termIndex,
            category: 'emergency',
            categoryName: '应急特情词汇',
            chapterName: categoryItem.name,
            english: term.english,
            chinese: term.chinese,
            type: 'term'
          });
        });
      }
    });

    // 计算每个分类的数量
    var categoryCounts = {
      'icao900': allData.filter(function(item) { return item.category === 'icao900'; }).length,
      'emergency': allData.filter(function(item) { return item.category === 'emergency'; }).length
    };

    // 更新标签列表的计数
    var updatedTabList = this.data.tabList.map(function(tab) {
      if (tab.name === 'all') {
        return Object.assign({}, tab, { count: allData.length });
      } else {
        return Object.assign({}, tab, { count: categoryCounts[tab.name] || 0 });
      }
    });

    this.setData({
      allData: allData,
      totalCount: allData.length,
      displayData: allData,
      tabList: updatedTabList
    });
    
    console.log('通信数据加载完成，总数:', allData.length);
    console.log('分类统计:', categoryCounts);
    console.log('前3个数据示例:', allData.slice(0, 3));
  },

  // 标签切换函数
  onCustomTabChange: function(e) {
    var activeTab = e.currentTarget.dataset.tab;
    console.log('标签切换到:', activeTab);
    
    this.setData({
      activeTab: activeTab,
      searchValue: ''
    });
    
    this.filterDataByTab(activeTab);
  },

  // 根据标签过滤数据
  filterDataByTab: function(tab) {
    var filteredData = this.data.allData;
    
    if (tab !== 'all') {
      filteredData = this.data.allData.filter(function(item) {
        return item.category === tab;
      });
    }
    
    this.setData({
      displayData: filteredData
    });
  },

  // 实时搜索功能
  onSearchChange: function(e) {
    var searchValue = e.detail;
    this.setData({
      searchValue: searchValue
    });
    
    // 实时搜索
    if (searchValue.trim() === '') {
      this.filterDataByTab(this.data.activeTab);
    } else {
      this.performSearch();
    }
  },

  onSearchClear: function() {
    this.setData({
      searchValue: ''
    });
    this.filterDataByTab(this.data.activeTab);
  },

  // 执行搜索
  performSearch: function() {
    var searchValue = this.data.searchValue.toLowerCase().trim();
    var activeTab = this.data.activeTab;
    
    var baseData = this.data.allData;
    
    // 先按标签过滤
    if (activeTab !== 'all') {
      baseData = this.data.allData.filter(function(item) {
        return item.category === activeTab;
      });
    }
    
    // 再按搜索关键词过滤
    var filteredData = baseData;
    if (searchValue) {
      filteredData = baseData.filter(function(item) {
        return item.english.toLowerCase().includes(searchValue) ||
               item.chinese.includes(searchValue) ||
               (item.chapterName && item.chapterName.includes(searchValue));
      });
    }
    
    this.setData({
      displayData: filteredData
    });
  },

  // 显示详情
  showItemDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayData[index];
    
    console.log('点击索引:', index);
    console.log('点击的项目:', item);
    
    if (!item) {
      console.error('未获取到数据，索引:', index);
      wx.showToast({
        title: '数据获取失败',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedItem: item,
      showDetailPopup: true
    }, function() {
      console.log('弹窗状态已更新:', this.data.showDetailPopup);
      console.log('选中的项目:', this.data.selectedItem);
    }.bind(this));
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedItem: {}
    });
  }
};

Page(BasePage.createPage(pageConfig));