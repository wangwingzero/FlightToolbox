// 飞机性能主页面（搜索 + 列表）
var BasePage = require('../../../utils/base-page.js');

var pageConfig = {
  data: {
    // 原始数据
    allEntries: [],

    // 搜索与筛选
    searchValue: '',
    activeType: 'all', // all | definition | formula | figure
    activeTag: 'all',

    // 列表展示
    displayedEntries: [],
    pageSize: 20,
    currentPage: 1,
    hasMore: true,

    // 主题标签
    tagList: [
      { id: 'all', name: '全部' },
      { id: 'basic', name: '基础概念' },
      { id: 'takeoff', name: '起飞' },
      { id: 'climb-cruise', name: '爬升/巡航' },
      { id: 'descent-approach', name: '下降/进近' },
      { id: 'landing', name: '着陆' },
      { id: 'fuel-range', name: '燃油/航程' },
      { id: 'limits-envelope', name: '限制/包线' }
    ],

    typeTabs: [
      { id: 'all', name: '全部' },
      { id: 'definition', name: '定义' },
      { id: 'formula', name: '公式' },
      { id: 'figure', name: '图片' }
    ],

    loading: true
  },

  customOnLoad: function() {
    this.loadEntries();
  },

  // 加载性能条目数据
  loadEntries: function() {
    var self = this;
    try {
      // 从当前分包的数据文件加载
      var entries = require('../../data/aircraft-performance-entries.js');
      self.setData({
        allEntries: entries,
        loading: false
      });
      self.applyFilters(true);
    } catch (error) {
      console.error('❌ 加载飞机性能数据失败:', error);
      this.setData({
        allEntries: [],
        displayedEntries: [],
        loading: false,
        hasMore: false
      });
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
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
    this.applyFilters(true);
  },

  onSearchClear: function() {
    this.setData({ searchValue: '' });
    this.applyFilters(true);
  },

  // 类型切换
  onTypeTabChange: function(e) {
    var typeId = e.currentTarget.dataset.id;
    this.setData({ activeType: typeId });
    this.applyFilters(true);
  },

  // 标签切换
  onTagTap: function(e) {
    var tagId = e.currentTarget.dataset.id;
    this.setData({ activeTag: tagId });
    this.applyFilters(true);
  },

  // 统一筛选逻辑
  applyFilters: function(resetPage) {
    var allEntries = this.data.allEntries || [];
    var searchValue = (this.data.searchValue || '').trim().toLowerCase();
    var activeType = this.data.activeType;
    var activeTag = this.data.activeTag;

    var filtered = allEntries.filter(function(item) {
      // 类型筛选
      if (activeType !== 'all' && item.primaryType !== activeType) {
        return false;
      }

      // 标签筛选：用 tags 数组里的值做映射
      if (activeTag !== 'all') {
        var tags = item.tags || [];
        var tagMatch = false;

        if (activeTag === 'basic') {
          tagMatch = tags.indexOf('基础概念') !== -1;
        } else if (activeTag === 'takeoff') {
          tagMatch = tags.indexOf('起飞') !== -1;
        } else if (activeTag === 'climb-cruise') {
          tagMatch = tags.indexOf('爬升') !== -1 || tags.indexOf('巡航') !== -1;
        } else if (activeTag === 'descent-approach') {
          tagMatch = tags.indexOf('下降') !== -1 || tags.indexOf('进近') !== -1;
        } else if (activeTag === 'landing') {
          tagMatch = tags.indexOf('着陆') !== -1;
        } else if (activeTag === 'fuel-range') {
          tagMatch = tags.indexOf('燃油') !== -1 || tags.indexOf('航程') !== -1;
        } else if (activeTag === 'limits-envelope') {
          tagMatch = tags.indexOf('限制') !== -1 || tags.indexOf('飞行包线') !== -1;
        }

        if (!tagMatch) {
          return false;
        }
      }

      // 搜索关键字匹配
      if (!searchValue) {
        return true;
      }

      var titleZh = (item.titleZh || '').toLowerCase();
      var titleEn = (item.titleEn || '').toLowerCase();
      var summaryZh = (item.summaryZh || '').toLowerCase();
      var contentZh = (item.contentZh || '').toLowerCase();
      var keywordsZh = (item.keywordsZh || []).join(' ').toLowerCase();
      var keywordsEn = (item.keywordsEn || []).join(' ').toLowerCase();
      var regs = (item.regulationRefs || []).join(' ').toLowerCase();

      return (
        titleZh.indexOf(searchValue) !== -1 ||
        titleEn.indexOf(searchValue) !== -1 ||
        summaryZh.indexOf(searchValue) !== -1 ||
        contentZh.indexOf(searchValue) !== -1 ||
        keywordsZh.indexOf(searchValue) !== -1 ||
        keywordsEn.indexOf(searchValue) !== -1 ||
        regs.indexOf(searchValue) !== -1
      );
    });

    var pageSize = this.data.pageSize;
    var currentPage = resetPage ? 1 : this.data.currentPage;
    var endIndex = pageSize * currentPage;

    this.setData({
      displayedEntries: filtered.slice(0, endIndex),
      hasMore: endIndex < filtered.length,
      currentPage: currentPage
    });
  },

  // 加载更多
  onLoadMore: function() {
    if (!this.data.hasMore) return;
    var nextPage = this.data.currentPage + 1;
    this.setData({ currentPage: nextPage });
    this.applyFilters(false);
  },

  // 点击条目进入详情
  onEntryTap: function(e) {
    var entryId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/packageAircraftPerformance/pages/detail/index?id=' + encodeURIComponent(entryId)
    });
  }
};

Page(BasePage.createPage(pageConfig));
