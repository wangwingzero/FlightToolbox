// 空勤灶 - 民航空勤人员膳食指南搜索页面

var BasePage = require('../utils/base-page.js');

var pageConfig = {
  data: {
    dietGuides: [],
    filteredGuides: [],
    displayedGuides: [],
    searchKeyword: '',
    searchPlaceholder: '搜索膳食建议，例如：高脂血、高血压、糖尿病...',
    activeTab: '全部',
    categoryList: [],

    // 分页
    pageSize: 8,
    currentPage: 1,
    hasMore: true,
    loading: false,

    // 详情弹窗
    showDetailPopup: false,
    selectedGuide: null
  },

  customOnLoad: function () {
    this.loadDietGuides();
  },

  // 加载膳食数据
  loadDietGuides: function () {
    var self = this;
    try {
      var dietData = require('./dietGuides.js');
      var guides = (dietData && dietData.dietGuides) || [];

      // 构建分类统计
      var categoryMap = {
        '全部': { title: '全部', name: '全部', count: guides.length },
        '慢性病管理': { title: '慢性病管理', name: '慢性病管理', count: 0 },
        '机上配餐': { title: '机上配餐', name: '机上配餐', count: 0 },
        '基础原则': { title: '基础原则', name: '基础原则', count: 0 }
      };

      guides.forEach(function (item) {
        if (item.group && categoryMap[item.group]) {
          categoryMap[item.group].count++;
        }
      });

      var categoryList = Object.keys(categoryMap).map(function (key) {
        return categoryMap[key];
      });

      self.setData({
        dietGuides: guides,
        filteredGuides: guides,
        categoryList: categoryList
      });

      self.resetPagination();
      self.updateDisplayedGuides();
      self.updateSearchPlaceholder();
    } catch (error) {
      console.error('❌ 加载膳食指南数据失败：', error);
      self.handleError && self.handleError(error, '数据加载失败');
    }
  },

  // 更新分页显示
  updateDisplayedGuides: function () {
    var filteredGuides = this.data.filteredGuides || [];
    var pageSize = this.data.pageSize;
    var currentPage = this.data.currentPage;

    var endIndex = currentPage * pageSize;
    var displayedGuides = filteredGuides.slice(0, endIndex);
    var hasMore = endIndex < filteredGuides.length;

    this.setData({
      displayedGuides: displayedGuides,
      hasMore: hasMore,
      loading: false
    });
  },

  loadMoreGuides: function () {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }

    var self = this;
    this.setData({
      loading: true,
      currentPage: this.data.currentPage + 1
    });

    setTimeout(function () {
      self.updateDisplayedGuides();
    }, 200);
  },

  resetPagination: function () {
    this.setData({
      currentPage: 1,
      hasMore: true,
      loading: false
    });
  },

  // 搜索提示
  updateSearchPlaceholder: function () {
    var activeTab = this.data.activeTab;
    var placeholder = '';

    if (activeTab === '全部') {
      placeholder = '搜索膳食建议，例如：高脂血、高血压、糖尿病...';
    } else {
      placeholder = '在 ' + activeTab + ' 中搜索膳食建议...';
    }

    this.setData({
      searchPlaceholder: placeholder
    });
  },

  // 标签切换
  onTabChange: function (e) {
    var activeTab = e.currentTarget.dataset.name || e.detail.name;

    this.setData({
      activeTab: activeTab,
      searchKeyword: ''
    });

    this.updateSearchPlaceholder();
    this.filterByTab(activeTab);
  },

  // 按分类过滤
  filterByTab: function (tab) {
    var baseData = this.data.dietGuides || [];

    if (tab !== '全部') {
      baseData = baseData.filter(function (item) {
        return item.group === tab;
      });
    }

    this.setData({
      filteredGuides: baseData
    });

    this.resetPagination();
    this.updateDisplayedGuides();
  },

  // 实时搜索
  onSearchChange: function (e) {
    var self = this;
    var value = e.detail || '';

    this.setData({
      searchKeyword: value
    });

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }

    this.resetPagination();

    if (!value || !value.trim()) {
      this.filterByTab(this.data.activeTab);
      return;
    }

    this.searchTimer = setTimeout(function () {
      self.performSearch();
    }, 300);
  },

  onSearchClear: function () {
    this.setData({
      searchKeyword: ''
    });
    this.resetPagination();
    this.filterByTab(this.data.activeTab);
  },

  performSearch: function () {
    var keyword = (this.data.searchKeyword || '').toLowerCase().trim();
    var activeTab = this.data.activeTab;
    var baseData = this.data.dietGuides || [];

    if (activeTab !== '全部') {
      baseData = baseData.filter(function (item) {
        return item.group === activeTab;
      });
    }

    var filtered = baseData;

    if (keyword) {
      filtered = baseData.filter(function (item) {
        var fields = [];

        if (item.name_zh) fields.push(item.name_zh);
        if (item.name_en) fields.push(item.name_en);
        if (item.categoryShort) fields.push(item.categoryShort);
        if (item.group) fields.push(item.group);
        if (item.brief) fields.push(item.brief);

        if (Array.isArray(item.keywords)) {
          fields = fields.concat(item.keywords);
        }
        if (Array.isArray(item.focusPoints)) {
          fields = fields.concat(item.focusPoints);
        }

        return fields.some(function (text) {
          if (!text) return false;
          var lower = String(text).toLowerCase();
          return lower.indexOf(keyword) !== -1;
        });
      });
    }

    this.setData({
      filteredGuides: filtered
    });

    this.updateDisplayedGuides();
  },

  // 详情弹窗
  showGuideDetail: function (e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayedGuides[index];

    if (!item) {
      wx.showToast({
        title: '未找到膳食建议',
        icon: 'none'
      });
      return;
    }

    this.setData({
      selectedGuide: item,
      showDetailPopup: true
    });
  },

  closeDetailPopup: function () {
    this.setData({
      showDetailPopup: false,
      selectedGuide: null
    });
  },

  // 页面卸载
  customOnUnload: function () {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  },

  onShareAppMessage: function () {
    return {
      title: '空勤灶 - 民航空勤人员膳食指南',
      path: '/packageDiet/index'
    };
  }
};

Page(BasePage.createPage(pageConfig));
