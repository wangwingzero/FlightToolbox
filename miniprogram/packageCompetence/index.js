// 胜任力页面
var BasePage = require('../utils/base-page.js');

var pageConfig = {
  data: {
    // 胜任力数据
    allCompetencies: [],
    displayedCompetencies: [],

    // 搜索相关
    searchValue: '',
    searchFocused: false,
    searchTimer: null, // P3-01: 搜索防抖定时器

    // 分类筛选
    activeCategory: 'all', // 'all', 'core', 'instructor'
    categoryTabs: [
      { id: 'all', name: '全部', count: 0 },
      { id: 'core', name: '核心胜任力', count: 0 },
      { id: 'instructor', name: '检查员教员', count: 0 }
    ],

    // 分页相关
    currentPage: 1,
    pageSize: 20,
    hasMore: true,

    // 统计信息
    totalCount: 0,
    filteredCount: 0,

    // 浮窗相关
    showModal: false,
    selectedCompetency: {},

    // 展开/折叠状态
    expandedItems: {} // 记录哪些胜任力的行为指标已展开
  },

  customOnLoad: function(options) {
    this.loadCompetenceData();
  },

  // 加载胜任力数据
  loadCompetenceData: function() {
    var self = this;
    try {
      // 异步加载数据文件
      require('./competence-data.js', function(competenceData) {
        if (!competenceData || !Array.isArray(competenceData)) {
          throw new Error('胜任力数据格式错误');
        }

        console.log('✅ 成功加载胜任力数据:', competenceData.length + '条');

        // 统计分类数量
        var coreCount = competenceData.filter(function(item) {
          return item.category === 'core';
        }).length;

        var instructorCount = competenceData.filter(function(item) {
          return item.category === 'instructor';
        }).length;

        // 更新分类标签计数
        var categoryTabs = self.data.categoryTabs;
        categoryTabs[0].count = competenceData.length;
        categoryTabs[1].count = coreCount;
        categoryTabs[2].count = instructorCount;

        self.setData({
          allCompetencies: competenceData,
          totalCount: competenceData.length,
          filteredCount: competenceData.length,
          categoryTabs: categoryTabs
        });

        // 初始化第一页数据
        self.loadPageData();

      }, function(error) {
        console.error('❌ 胜任力数据加载失败:', error);
        self.handleError(error, '胜任力数据加载失败，请重试');

        // 设置默认空数据
        self.setData({
          allCompetencies: [],
          totalCount: 0,
          filteredCount: 0,
          displayedCompetencies: [],
          hasMore: false
        });
      });

    } catch (error) {
      console.error('❌ 胜任力数据加载失败:', error);
      self.handleError(error, '胜任力数据加载失败');

      // 设置默认空数据
      self.setData({
        allCompetencies: [],
        totalCount: 0,
        filteredCount: 0,
        displayedCompetencies: [],
        hasMore: false
      });
    }
  },

  // 加载分页数据
  loadPageData: function() {
    var currentPage = this.data.currentPage;
    var pageSize = this.data.pageSize;
    var currentData = this.getCurrentData();
    var displayedCompetencies = this.data.displayedCompetencies;

    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, currentData.length);

    var newData = currentData.slice(startIndex, endIndex);
    var updatedDisplayed = currentPage === 1 ? newData : displayedCompetencies.concat(newData);

    var hasMore = endIndex < currentData.length;

    this.setData({
      displayedCompetencies: updatedDisplayed,
      hasMore: hasMore
    });
  },

  // 获取当前应该显示的数据（考虑搜索和分类筛选）
  getCurrentData: function() {
    var allCompetencies = this.data.allCompetencies;
    var activeCategory = this.data.activeCategory;
    var searchValue = this.data.searchValue.trim();

    // 先按分类筛选
    var filteredData = allCompetencies;
    if (activeCategory !== 'all') {
      filteredData = allCompetencies.filter(function(item) {
        return item.category === activeCategory;
      });
    }

    // 再按搜索词过滤
    if (searchValue) {
      var lowerSearchValue = searchValue.toLowerCase();
      filteredData = filteredData.filter(function(item) {
        // 搜索代码、中文名称、英文名称、描述、行为指标
        var matchCode = (item.id && item.id.toLowerCase().indexOf(lowerSearchValue) !== -1);

        var matchName = (item.chinese_name && item.chinese_name.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
                       (item.english_name && item.english_name.toLowerCase().indexOf(lowerSearchValue) !== -1);

        var matchDescription = (item.description && item.description.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
                              (item.description_en && item.description_en.toLowerCase().indexOf(lowerSearchValue) !== -1);

        var matchBehaviors = false;
        if (item.behaviors && Array.isArray(item.behaviors)) {
          matchBehaviors = item.behaviors.some(function(behavior) {
            return (behavior.chinese && behavior.chinese.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
                   (behavior.english && behavior.english.toLowerCase().indexOf(lowerSearchValue) !== -1);
          });
        }

        return matchCode || matchName || matchDescription || matchBehaviors;
      });
    }

    return filteredData;
  },

  // 分类切换
  onCategoryChange: function(e) {
    var categoryId = e.detail.name || e.currentTarget.dataset.category;

    this.setData({
      activeCategory: categoryId,
      currentPage: 1,
      displayedCompetencies: []
    });

    this.performSearch();
  },

  // 搜索输入处理 - P3-01: 添加300ms防抖
  onSearchInput: function(e) {
    var self = this;
    var searchValue = (e.detail.value || '').trim();

    this.setData({
      searchValue: searchValue
    });

    // 清除之前的定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer);
    }

    // 设置新的防抖定时器（300ms）
    var timer = setTimeout(function() {
      self.setData({
        currentPage: 1,
        displayedCompetencies: []
      });
      self.performSearch();
    }, 300);

    this.setData({
      searchTimer: timer
    });
  },

  // 执行搜索
  performSearch: function() {
    var currentData = this.getCurrentData();

    this.setData({
      filteredCount: currentData.length,
      currentPage: 1,
      displayedCompetencies: []
    });

    this.loadPageData();
  },

  // 清空搜索
  onSearchClear: function() {
    this.setData({
      searchValue: '',
      currentPage: 1,
      displayedCompetencies: []
    });

    this.performSearch();
  },

  // 搜索框聚焦
  onSearchFocus: function() {
    this.setData({
      searchFocused: true
    });
  },

  // 搜索框失焦
  onSearchBlur: function() {
    this.setData({
      searchFocused: false
    });
  },

  // 切换行为指标展开/折叠
  toggleBehaviors: function(e) {
    var competencyId = e.currentTarget.dataset.id;
    var expandedItems = this.data.expandedItems;

    expandedItems[competencyId] = !expandedItems[competencyId];

    this.setData({
      expandedItems: expandedItems
    });
  },

  // 点击胜任力项 - 显示浮窗
  onCompetencyTap: function(e) {
    var competency = e.currentTarget.dataset.competency;
    if (!competency) {
      return;
    }

    this.setData({
      showModal: true,
      selectedCompetency: competency
    });
  },

  // 关闭浮窗
  onModalClose: function() {
    this.setData({
      showModal: false,
      selectedCompetency: {}
    });
  },

  // 阻止事件冒泡
  stopPropagation: function() {
    // 阻止点击浮窗内容时关闭浮窗
  },

  // 复制胜任力内容
  onCopyCompetency: function() {
    var competency = this.data.selectedCompetency;
    if (!competency) {
      return;
    }

    // 构建复制文本
    var textToCopy = competency.id + ' - ' + competency.chinese_name + ' / ' + competency.english_name + '\n\n';
    textToCopy += '描述：' + competency.description + '\n';
    if (competency.description_en) {
      textToCopy += competency.description_en + '\n';
    }

    textToCopy += '\n行为指标 (Observable Behaviours)：\n';
    if (competency.behaviors && Array.isArray(competency.behaviors)) {
      competency.behaviors.forEach(function(behavior, index) {
        textToCopy += '\n' + (index + 1) + '. ' + behavior.code + '\n';
        textToCopy += '   ' + behavior.chinese + '\n';
        textToCopy += '   ' + behavior.english + '\n';
      });
    }

    textToCopy += '\n来源：' + competency.source + ' (' + competency.section + ')';

    var self = this;
    wx.setClipboardData({
      data: textToCopy,
      success: function() {
        self.showSuccess('胜任力内容已复制到剪贴板');
        self.onModalClose();
      },
      fail: function() {
        console.error('复制失败');
        self.showError('复制失败，请重试');
      }
    });
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

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadCompetenceData();
    wx.stopPullDownRefresh();
    this.showSuccess('数据刷新成功');
  },

  // P3-01: 页面卸载时清理搜索定时器
  customOnUnload: function() {
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer);
      this.data.searchTimer = null;
    }
  }
};

Page(BasePage.createPage(pageConfig));
