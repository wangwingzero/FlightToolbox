/**
 * QAR红色事件监控项页面
 * 飞行品质监控信息管理办法 - 民航规〔2024〕49号
 */
var BasePage = require('../utils/base-page.js');

// 加载各机型数据
var airbusData = require('./QAR_airbus.js');
var boeingData = require('./QAR_boeing.js');
var otherData = require('./QAR_other.js');

var AppConfig = require('../utils/app-config.js');

var pageConfig = {
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 机型分类
    activeCategory: 'airbus',
    categoryTabs: [
      { id: 'airbus', name: '空客', icon: '🛩️', count: 0 },
      { id: 'boeing', name: '波音', icon: '✈️', count: 0 },
      { id: 'other', name: '其他', icon: '🛫', count: 0 }
    ],

    // 子机型选择
    activeAircraftType: '',
    aircraftTypes: [],

    // 监控项目数据
    allItems: [],
    displayedItems: [],

    // 搜索相关
    searchValue: '',
    searchFocused: false,

    // 分页
    currentPage: 1,
    pageSize: 20,
    hasMore: true,

    // 统计
    totalCount: 0,
    filteredCount: 0,

    // 详情弹窗
    showModal: false,
    selectedItem: {},

    // 限制值弹窗
    showLimitsModal: false,
    currentLimits: null,

    // 数据来源信息
    docInfo: {
      documentNumber: '民航规〔2024〕49号',
      effectiveDate: '2025-01-01',
      title: '飞行品质监控信息管理办法'
    }
  },

  customOnLoad: function(options) {
    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    this.initData();
  },

  // 初始化数据
  initData: function() {
    var self = this;

    // 统计各分类数量
    var airbusTypes = this.getAircraftTypes('airbus');
    var boeingTypes = this.getAircraftTypes('boeing');
    var otherTypes = this.getAircraftTypes('other');

    var categoryTabs = this.data.categoryTabs;
    categoryTabs[0].count = airbusTypes.length;
    categoryTabs[1].count = boeingTypes.length;
    categoryTabs[2].count = otherTypes.length;

    this.setData({
      categoryTabs: categoryTabs,
      aircraftTypes: airbusTypes,
      activeAircraftType: airbusTypes.length > 0 ? airbusTypes[0].id : ''
    });

    // 加载第一个机型的数据
    if (airbusTypes.length > 0) {
      this.loadAircraftData(airbusTypes[0].id);
    }
  },

  // 获取机型列表
  getAircraftTypes: function(category) {
    var data = this.getCategoryData(category);
    if (!data || !data.monitoringStandards) return [];

    var types = Object.keys(data.monitoringStandards);
    return types.map(function(type) {
      return {
        id: type,
        name: type,
        count: data.monitoringStandards[type].length
      };
    });
  },

  // 获取分类数据
  getCategoryData: function(category) {
    switch (category) {
      case 'airbus':
        return airbusData;
      case 'boeing':
        return boeingData;
      case 'other':
        return otherData;
      default:
        return null;
    }
  },

  // 切换机型分类
  onCategoryChange: function(e) {
    var category = e.currentTarget ? e.currentTarget.dataset.tab : e.detail.name;
    var aircraftTypes = this.getAircraftTypes(category);

    this.setData({
      activeCategory: category,
      aircraftTypes: aircraftTypes,
      activeAircraftType: aircraftTypes.length > 0 ? aircraftTypes[0].id : '',
      searchValue: '',
      currentPage: 1
    });

    if (aircraftTypes.length > 0) {
      this.loadAircraftData(aircraftTypes[0].id);
    } else {
      this.setData({
        allItems: [],
        displayedItems: [],
        totalCount: 0,
        filteredCount: 0,
        hasMore: false
      });
    }
  },

  // 选择子机型
  onAircraftTypeChange: function(e) {
    var typeId = e.currentTarget.dataset.type;

    this.setData({
      activeAircraftType: typeId,
      searchValue: '',
      currentPage: 1
    });

    this.loadAircraftData(typeId);
  },

  // 加载机型数据
  loadAircraftData: function(typeId) {
    var category = this.data.activeCategory;
    var data = this.getCategoryData(category);

    if (!data || !data.monitoringStandards || !data.monitoringStandards[typeId]) {
      this.setData({
        allItems: [],
        displayedItems: [],
        totalCount: 0,
        filteredCount: 0,
        hasMore: false
      });
      return;
    }

    var items = data.monitoringStandards[typeId];

    this.setData({
      allItems: items,
      totalCount: items.length,
      filteredCount: items.length,
      currentPage: 1
    });

    this.loadPageData();
  },

  // 加载分页数据
  loadPageData: function() {
    var currentPage = this.data.currentPage;
    var pageSize = this.data.pageSize;
    var currentData = this.getCurrentData();
    var displayedItems = this.data.displayedItems;

    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, currentData.length);

    var newData = currentData.slice(startIndex, endIndex);
    var updatedDisplayed = currentPage === 1 ? newData : displayedItems.concat(newData);

    var hasMore = endIndex < currentData.length;

    this.setData({
      displayedItems: updatedDisplayed,
      hasMore: hasMore
    });
  },

  // 获取当前筛选后的数据
  getCurrentData: function() {
    var allItems = this.data.allItems;
    var searchValue = this.data.searchValue.trim().toLowerCase();

    if (!searchValue) {
      return allItems;
    }

    return allItems.filter(function(item) {
      var matchItem = item.item && item.item.toLowerCase().indexOf(searchValue) !== -1;
      var matchParameter = item.parameter && item.parameter.toLowerCase().indexOf(searchValue) !== -1;
      var matchPhase = item.phase && item.phase.toLowerCase().indexOf(searchValue) !== -1;
      var matchStandard = item.standard && item.standard.toLowerCase().indexOf(searchValue) !== -1;
      var matchRemark = item.remark && item.remark.toLowerCase().indexOf(searchValue) !== -1;

      return matchItem || matchParameter || matchPhase || matchStandard || matchRemark;
    });
  },

  // 搜索输入（兼容van-search的change事件）
  onSearchInput: function(e) {
    var self = this;
    var value = e.detail || '';

    // 清除之前的定时器
    if (this._searchTimer) {
      clearTimeout(this._searchTimer);
    }

    // 防抖处理
    this._searchTimer = setTimeout(function() {
      self.setData({
        searchValue: value,
        currentPage: 1
      });

      var currentData = self.getCurrentDataWithSearch(value.trim().toLowerCase());
      self.setData({
        filteredCount: currentData.length
      });

      self.loadPageData();
    }, 300);
  },

  // 带搜索词获取数据
  getCurrentDataWithSearch: function(searchValue) {
    var allItems = this.data.allItems;

    if (!searchValue) {
      return allItems;
    }

    return allItems.filter(function(item) {
      var matchItem = item.item && item.item.toLowerCase().indexOf(searchValue) !== -1;
      var matchParameter = item.parameter && item.parameter.toLowerCase().indexOf(searchValue) !== -1;
      var matchPhase = item.phase && item.phase.toLowerCase().indexOf(searchValue) !== -1;
      var matchStandard = item.standard && item.standard.toLowerCase().indexOf(searchValue) !== -1;
      var matchRemark = item.remark && item.remark.toLowerCase().indexOf(searchValue) !== -1;

      return matchItem || matchParameter || matchPhase || matchStandard || matchRemark;
    });
  },

  onSearchFocus: function() {
    this.setData({ searchFocused: true });
  },

  onSearchBlur: function() {
    this.setData({ searchFocused: false });
  },

  onSearchClear: function() {
    this.setData({
      searchValue: '',
      filteredCount: this.data.totalCount,
      currentPage: 1
    });
    this.loadPageData();
  },

  // 加载更多
  onLoadMore: function() {
    if (!this.data.hasMore) return;

    this.setData({
      currentPage: this.data.currentPage + 1
    });

    this.loadPageData();
  },

  // 点击监控项目
  onItemTap: function(e) {
    var item = e.currentTarget.dataset.item;

    this.setData({
      selectedItem: item,
      showModal: true
    });
  },

  // 关闭详情弹窗
  onModalClose: function() {
    this.setData({
      showModal: false,
      selectedItem: {}
    });
  },

  // 查看限制值
  onViewLimits: function() {
    var category = this.data.activeCategory;
    var typeId = this.data.activeAircraftType;
    var data = this.getCategoryData(category);

    // 数据文件中的键名是 limitations，不是 limits
    if (data && data.limitations && data.limitations[typeId]) {
      var limitsArray = data.limitations[typeId];
      // 取第一个限制值对象（通常每个机型只有一条限制值记录）
      var currentLimits = limitsArray.length > 0 ? limitsArray[0] : null;
      
      this.setData({
        currentLimits: currentLimits,
        showLimitsModal: true
      });
    } else {
      wx.showToast({
        title: '暂无限制值数据',
        icon: 'none'
      });
    }
  },

  // 关闭限制值弹窗
  onLimitsModalClose: function() {
    this.setData({
      showLimitsModal: false,
      currentLimits: null
    });
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: 'QAR红色事件监控项 - 飞行品质监控',
      path: '/packageQAR/index'
    };
  },

  onShareTimeline: function() {
    return {
      title: 'QAR红色事件监控项',
      path: '/packageQAR/index'
    };
  }
};

Page(BasePage.createPage(pageConfig));
