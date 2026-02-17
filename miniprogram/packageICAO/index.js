// index.js

// ICAO出版物查询页面
var BasePage = require('../utils/base-page.js');

// 导入ICAO出版物数据
var icaoAirNavigation = require('./icao_db_air_navigation.js');
var icaoAirTransport = require('./icao_db_air_transport.js');
var icaoStandards = require('./icao_db_standards.js');
var icaoFramework = require('./icao_db_framework.js');
var icaoGovernance = require('./icao_db_governance_and_misc.js');

var pageConfig = {
  data: {
    // ICAO出版物数据
    allPublications: [],
    displayedPublications: [],

    // 分类选项
    activeCategory: 'all',
    categories: [
      { id: 'all', name: '全部', icon: '📚', count: 0 },
      { id: 'air_navigation', name: '空中航行', icon: '✈️', count: 0 },
      { id: 'air_transport', name: '空运经济', icon: '💼', count: 0 },
      { id: 'standards', name: '标准附件', icon: '📋', count: 0 },
      { id: 'framework', name: '政策框架', icon: '🏛️', count: 0 },
      { id: 'governance', name: '大会决议', icon: '⚖️', count: 0 }
    ],

    // 搜索相关
    searchValue: '',

    // 分页相关
    currentPage: 1,
    pageSize: 20,
    hasMore: true,

    // 统计信息
    totalCount: 0,
    filteredCount: 0,

    // 详情弹窗
    showDetailPopup: false,
    selectedPublication: {},

    // 语言代码映射
    languageMap: {
      'E': '英语',
      'A': '阿拉伯语',
      'C': '中文',
      'F': '法语',
      'R': '俄语',
      'S': '西班牙语',
      'English': '英语',
      'French': '法语',
      'Spanish': '西班牙语',
      'Russian': '俄语',
      'Chinese': '中文',
      'Arabic': '阿拉伯语',
      'Quadrilingual: E/F/R/S': '四语版（英/法/俄/西）',
      'Quadrilingual: E/F/S/R': '四语版（英/法/西/俄）',
      'Multilingual: E/A/C/F/R/S': '多语版（英/阿/中/法/俄/西）'
    }
  },

  customOnLoad: function(options) {
    this.loadICAOData();
  },

  // 加载ICAO数据
  loadICAOData: function() {
    var self = this;
    try {
      // 聚合所有ICAO出版物数据
      var allPublications = [];

      // 处理空中航行数据
      if (icaoAirNavigation && Array.isArray(icaoAirNavigation)) {
        icaoAirNavigation.forEach(function(item) {
          item.category = 'air_navigation';
          item.categoryName = '空中航行';
        });
        allPublications = allPublications.concat(icaoAirNavigation);
      }

      // 处理空运经济数据
      if (icaoAirTransport && Array.isArray(icaoAirTransport)) {
        icaoAirTransport.forEach(function(item) {
          item.category = 'air_transport';
          item.categoryName = '空运经济';
        });
        allPublications = allPublications.concat(icaoAirTransport);
      }

      // 处理标准附件数据
      if (icaoStandards && Array.isArray(icaoStandards)) {
        icaoStandards.forEach(function(item) {
          item.category = 'standards';
          item.categoryName = '标准附件';
        });
        allPublications = allPublications.concat(icaoStandards);
      }

      // 处理政策框架数据
      if (icaoFramework && Array.isArray(icaoFramework)) {
        icaoFramework.forEach(function(item) {
          item.category = 'framework';
          item.categoryName = '政策框架';
        });
        allPublications = allPublications.concat(icaoFramework);
      }

      // 处理大会决议数据
      if (icaoGovernance && Array.isArray(icaoGovernance)) {
        icaoGovernance.forEach(function(item) {
          item.category = 'governance';
          item.categoryName = '大会决议';
        });
        allPublications = allPublications.concat(icaoGovernance);
      }

      console.log('✅ 成功加载ICAO出版物数据:', allPublications.length + '条');

      // 更新分类统计
      var categories = this.data.categories;
      categories[0].count = allPublications.length; // 全部
      categories[1].count = allPublications.filter(function(item) {
        return item.category === 'air_navigation';
      }).length;
      categories[2].count = allPublications.filter(function(item) {
        return item.category === 'air_transport';
      }).length;
      categories[3].count = allPublications.filter(function(item) {
        return item.category === 'standards';
      }).length;
      categories[4].count = allPublications.filter(function(item) {
        return item.category === 'framework';
      }).length;
      categories[5].count = allPublications.filter(function(item) {
        return item.category === 'governance';
      }).length;

      self.setData({
        allPublications: allPublications,
        totalCount: allPublications.length,
        filteredCount: allPublications.length,
        categories: categories
      });

      // 加载第一页数据
      self.loadPageData();

    } catch (error) {
      console.error('❌ ICAO出版物数据加载失败:', error);
      self.handleError(error, 'ICAO出版物数据加载失败');

      self.setData({
        allPublications: [],
        totalCount: 0,
        filteredCount: 0,
        displayedPublications: [],
        hasMore: false
      });
    }
  },

  // 加载分页数据
  loadPageData: function() {
    var currentPage = this.data.currentPage;
    var pageSize = this.data.pageSize;
    var currentData = this.getCurrentData();
    var displayedPublications = this.data.displayedPublications;

    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, currentData.length);

    var newData = currentData.slice(startIndex, endIndex);
    var updatedDisplayed = currentPage === 1 ? newData : displayedPublications.concat(newData);

    var hasMore = endIndex < currentData.length;

    this.setData({
      displayedPublications: updatedDisplayed,
      hasMore: hasMore
    });
  },

  // 获取当前应该显示的数据
  getCurrentData: function() {
    var searchValue = this.data.searchValue.trim();
    var activeCategory = this.data.activeCategory;
    var allPublications = this.data.allPublications;

    // 分类过滤
    var filteredData = allPublications;
    if (activeCategory !== 'all') {
      filteredData = allPublications.filter(function(item) {
        return item.category === activeCategory;
      });
    }

    // 搜索过滤
    if (searchValue) {
      var lowerSearchValue = searchValue.toLowerCase();
      filteredData = filteredData.filter(function(item) {
        return (item.docNumber && item.docNumber.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
               (item.title && item.title.en && item.title.en.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
               (item.title && item.title.zh && item.title.zh.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
               (item.description && item.description.en && item.description.en.toLowerCase().indexOf(lowerSearchValue) !== -1);
      });
    }

    return filteredData;
  },

  // 分类切换
  onCategoryChange: function(e) {
    var category = e.currentTarget.dataset.category;
    this.setData({
      activeCategory: category,
      currentPage: 1,
      displayedPublications: []
    });

    var currentData = this.getCurrentData();
    this.setData({
      filteredCount: currentData.length
    });

    this.loadPageData();
  },

  // 搜索变化
  onSearchChange: function(e) {
    var searchValue = e.detail;
    this.setData({
      searchValue: searchValue,
      currentPage: 1,
      displayedPublications: []
    });

    var currentData = this.getCurrentData();
    this.setData({
      filteredCount: currentData.length
    });

    this.loadPageData();
  },

  // 清除搜索
  onSearchClear: function() {
    this.setData({
      searchValue: '',
      currentPage: 1,
      displayedPublications: [],
    });
    
    // 重新计算筛选后的数量
    var currentData = this.getCurrentData();
    this.setData({
      filteredCount: currentData.length
    });

    this.loadPageData();
  },

  // 加载更多
  onLoadMore: function() {
    if (!this.data.hasMore) {
      return;
    }

    this.setData({
      currentPage: this.data.currentPage + 1
    });

    this.loadPageData();
  },

  // 显示详情
  showPublicationDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var publication = this.data.displayedPublications[index];

    // 转换语言代码
    var languagesDisplay = '';
    if (publication.languages && publication.languages.length > 0) {
      var languageMap = this.data.languageMap;

      // 如果languages只有一个元素且是完整描述（如"Quadrilingual: E/F/R/S"），直接映射
      if (publication.languages.length === 1 && languageMap[publication.languages[0]]) {
        languagesDisplay = languageMap[publication.languages[0]];
      } else {
        // 否则逐个转换代码
        var languageNames = publication.languages.map(function(code) {
          return languageMap[code] || code;
        });
        languagesDisplay = languageNames.join('、');
      }
    }

    // 创建包含转换后语言的publication对象
    var displayPublication = Object.assign({}, publication, {
      languagesDisplay: languagesDisplay
    });

    this.setData({
      selectedPublication: displayPublication,
      showDetailPopup: true
    });
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false
    });
  },

  // 复制文档编号
  copyDocNumber: function() {
    var docNumber = this.data.selectedPublication.docNumber;
    wx.setClipboardData({
      data: docNumber,
      success: function() {
        wx.showToast({
          title: '已复制文档编号',
          icon: 'success'
        });
      }
    });
  }
};

Page(BasePage.createPage(pageConfig));