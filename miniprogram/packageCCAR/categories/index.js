// CCAR规章分类页面
var BasePage = require('../../utils/base-page.js');
var CCARSearchManager = require('../search-manager.js');
var CCARDataManager = require('../../utils/ccar-data-manager.js');
var CCARDataLoader = require('../data-loader.js');
var CCARConfig = require('../config.js');
var CCARUtils = require('../utils.js');

var pageConfig = {
  data: {
    // 页面数据
    regulationData: [],
    normativeData: [],
    standardData: [],
    dataView: 'ccar', // ccar | standard
    categories: [],
    filteredCategories: [],
    currentTab: 0,
    tabs: ['全部'],
    searchKeyword: '',
    loading: true,
    // 搜索结果数据
    isSearchMode: false,
    searchedRegulations: [],
    searchedNormatives: [],
    searchedStandards: [],
    displayedStandards: [],
    standardPageSize: 30,
    standardCurrentPage: 1,
    standardHasMore: false,
    loadingMoreStandards: false,
    // 有效性筛选
    validityFilter: 'all', // all, valid, invalid
    // 时间筛选相关
    timeFilter: 'all', // all, year1, year3, year5, year10, custom
    timeFilterTitle: '全部时间', // 下拉菜单显示的标题
    timeFilterOptions: [
      { text: '全部时间', value: 'all' },
      { text: '近1个月', value: 'month1' },
      { text: '近3个月', value: 'month3' },
      { text: '近6个月', value: 'month6' },
      { text: '近1年', value: 'year1' },
      { text: '近3年', value: 'year3' },
      { text: '自定义日期', value: 'custom' }
    ],
    customStartDate: '', // 格式: YYYY-MM-DD
    customEndDate: '', // 格式: YYYY-MM-DD
    customStartDateDisplay: '', // 显示格式: YYYY年MM月DD日
    customEndDateDisplay: '', // 显示格式: YYYY年MM月DD日
    showTimeFilterDropdown: false, // 控制下拉菜单显示
    // 统计数据
    validRegulationsCount: 0,
    validNormativesCount: 0,
    validStandardsCount: 0,
    invalidRegulationsCount: 0,
    invalidNormativesCount: 0,
    invalidStandardsCount: 0
  },

  // 搜索管理器
  searchManager: null,

  customOnLoad: function(options) {
    var self = this;

    console.log('📱 页面加载开始');

    // 初始化年份范围（1988-2025）
    this.initializeYearRange();
    
    // 初始化搜索管理器
    this.searchManager = CCARSearchManager.createSearchIntegration(this, {
      searchFields: ['title', 'doc_number', 'office_unit', 'publish_date', 'doc_type'],
      onSearchResult: function(keyword, results, originalData) {
        self.handleSearchResult(keyword, results, originalData);
      }
    });
    
    // 使用BasePage的数据加载方法
    this.loadDataWithLoading(function() {
      return Promise.all([
        self.loadRegulationData(),
        self.loadNormativeData(),
        self.loadStandardData()
      ]).then(function() {
        self.generateCategories();
        self.initializeTabs();
        // 手动初始化下拉菜单
        self.initDropdownMenu();
        console.log('✅ 页面数据加载完成');
      });
    }, {
      loadingText: CCARConfig.LOADING_TEXT.CATEGORIES
    });
  },

  // 初始化下拉菜单
  initDropdownMenu: function() {
    var self = this;
    // 确保下拉菜单组件已渲染
    setTimeout(function() {
      if (self.selectComponent) {
        var dropdown = self.selectComponent('#timeFilterMenu');
        if (dropdown) {
          console.log('✅ 下拉菜单组件已初始化');
        }
      }
    }, 100);
  },

  // 加载规章数据
  loadRegulationData: function() {
    var self = this;
    return CCARDataLoader.loadRegulationData().then(function(regulations) {
      self.setData({
        regulationData: regulations
      });
    });
  },

  // 加载规范性文件数据
  loadNormativeData: function() {
    var self = this;
    return CCARDataLoader.loadNormativeData().then(function(normatives) {
      self.setData({
        normativeData: normatives
      });
    });
  },

  // 加载标准规范数据
  loadStandardData: function() {
    var self = this;
    return CCARDataLoader.loadStandardData().then(function(standards) {
      self.setData({
        standardData: standards
      });
    });
  },

  // 应用标准规范结果并初始化分页显示
  applyStandardResults: function(standards) {
    var list = standards || [];
    var pageSize = this.data.standardPageSize;
    var displayed = list.slice(0, pageSize);

    this.setData({
      searchedStandards: list,
      displayedStandards: displayed,
      standardCurrentPage: 1,
      standardHasMore: list.length > pageSize,
      loadingMoreStandards: false
    });
  },

  // 加载更多标准规范
  loadMoreStandards: function() {
    if (!this.data.standardHasMore || this.data.loadingMoreStandards) {
      return;
    }

    var pageSize = this.data.standardPageSize;
    var currentCount = this.data.displayedStandards.length;
    var nextChunk = this.data.searchedStandards.slice(currentCount, currentCount + pageSize);
    var nextDisplayed = this.data.displayedStandards.concat(nextChunk);

    this.setData({
      loadingMoreStandards: true
    });

    this.setData({
      displayedStandards: nextDisplayed,
      standardCurrentPage: this.data.standardCurrentPage + 1,
      standardHasMore: nextDisplayed.length < this.data.searchedStandards.length,
      loadingMoreStandards: false
    });
  },

  // 生成分类
  generateCategories: function() {
    var self = this;
    try {
      var categories = CCARDataManager.generateCategories(
        this.data.regulationData,
        this.data.normativeData
      );

      this.setData({
        categories: categories,
        filteredCategories: categories
      });
      
      // 更新统计数据
      this.updateValidityStats();
      
      console.log('✅ 分类生成成功，分类数量:', categories.length);
    } catch (error) {
      console.error('❌ 分类生成失败:', error);
      this.handleError(error, '分类数据生成失败');
    }
  },

  // 初始化标签
  initializeTabs: function() {
    try {
      var categoryNames = CCARDataManager.getCategoryNames();
      var tabs = ['全部'].concat(categoryNames);
      this.setData({
        tabs: tabs
      });
    } catch (error) {
      console.error('❌ 标签初始化失败:', error);
      this.setData({
        tabs: ['全部']
      });
    }
  },

  // 处理搜索结果（新增方法）
  handleSearchResult: function(keyword, results, originalData) {
    var validityFilter = this.data.validityFilter;
    var dataView = this.data.dataView;

    if (dataView === 'standard') {
      var allStandards = this.filterByValidityWithParam(this.data.standardData, validityFilter);

      if (this.data.timeFilter !== 'all') {
        allStandards = this.filterByTime(
          allStandards,
          this.data.timeFilter,
          this.data.customStartDate,
          this.data.customEndDate
        );
      }

      var searchedStandards = allStandards;
      if (keyword && keyword.trim()) {
        searchedStandards = this.searchManager.searchComponent.search(keyword, allStandards, {
          searchFields: CCARConfig.SEARCH_FIELDS.STANDARD,
          useCache: false
        }) || [];
      }

      this.applyStandardResults(searchedStandards);

      this.setData({
        isSearchMode: true,
        searchedRegulations: [],
        searchedNormatives: [],
        filteredCategories: [],
        searchKeyword: keyword
      });
      return;
    }
    
    if (this.data.currentTab === 0 && keyword) {
      // 在"全部"分类且有搜索关键字时，进入搜索模式
      var allRegulations = this.filterByValidityWithParam(this.data.regulationData, validityFilter);
      var allNormatives = this.filterByValidityWithParam(this.data.normativeData, validityFilter);
      
      // 搜索筛选后的数据
      var searchedRegulations = this.searchManager.searchComponent.search(keyword, allRegulations, {
        searchFields: ['title', 'doc_number', 'office_unit'],
        useCache: false
      }) || [];
      
      var searchedNormatives = this.searchManager.searchComponent.search(keyword, allNormatives, {
        searchFields: ['title', 'doc_number', 'office_unit', 'publish_date'],
        useCache: false
      }) || [];
      
      // 更新搜索状态
      this.setData({
        isSearchMode: true,
        searchedRegulations: searchedRegulations,
        searchedNormatives: searchedNormatives,
        searchedStandards: [],
        displayedStandards: [],
        standardHasMore: false,
        filteredCategories: [],
        searchKeyword: keyword
      });
      
      // 显示筛选提示
      if (validityFilter !== 'all') {
        var filterText = validityFilter === 'valid' ? '有效' : '失效';
        wx.showToast({
          title: '显示' + filterText + '：规章' + searchedRegulations.length + '，规范' + searchedNormatives.length,
          icon: 'none',
          duration: 2000
        });
      }
    } else {
      // 非搜索模式，显示分类
      this.setData({
        isSearchMode: false,
        searchedRegulations: [],
        searchedNormatives: [],
        searchedStandards: [],
        displayedStandards: [],
        standardHasMore: false,
        searchKeyword: keyword
      });
      this.filterCategories();
    }
  },

  // 切换标签
  onTabChange: function(event) {
    var index = event.detail.name || event.detail.index || event.currentTarget.dataset.index || 0;
    
    // 如果切换到具体分类，直接跳转到该分类的规章列表
    if (index > 0 && this.data.tabs[index]) {
      var selectedCategory = this.data.tabs[index];
      wx.navigateTo({
        url: '../regulations/index?category=' + encodeURIComponent(selectedCategory)
      });
      return;
    }
    
    this.setData({
      currentTab: index
    });
    this.filterCategories();
  },

  // 切换数据视图
  onDataViewChange: function(event) {
    var view = event.currentTarget.dataset.view;
    if (!view || view === this.data.dataView) {
      return;
    }

    this.setData({
      dataView: view,
      currentTab: 0,
      searchKeyword: '',
      isSearchMode: false,
      searchedRegulations: [],
      searchedNormatives: [],
      searchedStandards: [],
      displayedStandards: [],
      standardCurrentPage: 1,
      standardHasMore: false,
      loadingMoreStandards: false
    });

    this.filterCategories();
  },

  // 根据有效性筛选数据（使用统一筛选接口）
  filterByValidity: function(data) {
    return CCARUtils.filterByValidity(data, this.data.validityFilter);
  },

  // 根据有效性筛选数据（支持自定义筛选参数）
  filterByValidityWithParam: function(data, validityFilter) {
    return CCARUtils.filterByValidity(data, validityFilter);
  },

  // 过滤分类
  filterCategories: function(customValidityFilter) {
    var currentTab = this.data.currentTab;
    var searchKeyword = this.data.searchKeyword;
    var categories = this.data.categories;
    var dataView = this.data.dataView;
    // 允许传入自定义的筛选条件，解决异步更新问题
    var validityFilter = customValidityFilter || this.data.validityFilter;
    var timeFilter = this.data.timeFilter;

    if (dataView === 'standard') {
      var allStandards = this.filterByValidityWithParam(this.data.standardData, validityFilter);

      if (timeFilter !== 'all') {
        allStandards = this.filterByTime(
          allStandards,
          timeFilter,
          this.data.customStartDate,
          this.data.customEndDate
        );
      }

      if (searchKeyword) {
        allStandards = this.searchManager.searchComponent.search(searchKeyword, allStandards, {
          searchFields: CCARConfig.SEARCH_FIELDS.STANDARD,
          useCache: false
        }) || [];
      }

      this.applyStandardResults(allStandards);

      this.setData({
        isSearchMode: true,
        searchedRegulations: [],
        searchedNormatives: [],
        filteredCategories: []
      });

      return;
    }
    
    // 如果选择了时间筛选（非"全部时间"），强制进入搜索模式只显示规范性文件
    if (timeFilter !== 'all') {
      console.log('🕒 时间筛选激活，显示规范性文件搜索结果');
      
      // 获取规范性文件并应用有效性筛选
      var allNormatives = this.filterByValidityWithParam(this.data.normativeData, validityFilter);
      
      // 应用时间筛选
      var filteredNormatives = this.filterByTime(
        allNormatives, 
        timeFilter, 
        this.data.customStartDate, 
        this.data.customEndDate
      );
      
      // 如果有搜索关键词，再应用搜索筛选
      if (searchKeyword) {
        filteredNormatives = this.searchManager.searchComponent.search(searchKeyword, filteredNormatives, {
          searchFields: ['title', 'doc_number', 'office_unit', 'publish_date'],
          useCache: false
        }) || [];
      }
      
      // 进入搜索模式，只显示规范性文件
      this.setData({
        isSearchMode: true,
        searchedRegulations: [], // 时间筛选时不显示规章
        searchedNormatives: filteredNormatives,
        searchedStandards: [],
        displayedStandards: [],
        standardHasMore: false,
        filteredCategories: [] // 清空分类显示
      });
      
      console.log('🕒 时间筛选结果:', {
        timeFilter: timeFilter,
        validityFilter: validityFilter,
        searchKeyword: searchKeyword,
        规范性文件数: filteredNormatives.length
      });
      
      return;
    }
    
    // 如果在"全部"分类且有搜索关键字，进入搜索模式
    if (currentTab === 0 && searchKeyword) {
      // 先应用有效性筛选，再进行搜索
      var allRegulations = this.filterByValidityWithParam(this.data.regulationData, validityFilter);
      var allNormatives = this.filterByValidityWithParam(this.data.normativeData, validityFilter);
      
      console.log('📊 筛选统计:', {
        validityFilter: validityFilter,
        原始规章数: this.data.regulationData.length,
        筛选后规章数: allRegulations.length,
        原始规范性文件数: this.data.normativeData.length,
        筛选后规范性文件数: allNormatives.length
      });
      
      // 搜索筛选后的数据 - 使用搜索管理器中的搜索组件
      var searchedRegulations = this.searchManager.searchComponent.search(searchKeyword, allRegulations, {
        searchFields: ['title', 'doc_number', 'office_unit'],
        useCache: false // 禁用缓存确保实时搜索
      });
      
      var searchedNormatives = this.searchManager.searchComponent.search(searchKeyword, allNormatives, {
        searchFields: ['title', 'doc_number', 'office_unit', 'publish_date'],
        useCache: false // 禁用缓存确保实时搜索
      });
      
      // 确保搜索结果不为null
      searchedRegulations = searchedRegulations || [];
      searchedNormatives = searchedNormatives || [];
      
      // 对规范性文件应用时间筛选
      var timeFilter = this.data.timeFilter;
      if (timeFilter !== 'all' && searchedNormatives.length > 0) {
        var beforeTimeFilter = searchedNormatives.length;
        searchedNormatives = this.filterByTime(
          searchedNormatives, 
          timeFilter, 
          this.data.customStartDate, 
          this.data.customEndDate
        );
        
        console.log('🕒 时间筛选结果:', {
          timeFilter: timeFilter,
          筛选前规范性文件数: beforeTimeFilter,
          筛选后规范性文件数: searchedNormatives.length
        });
      }
      
      // 调试：验证搜索结果中的有效性字段
      console.log('🔍 搜索结果验证:', {
        validityFilter: validityFilter,
        规章样本: searchedRegulations.slice(0, 2).map(function(item) {
          return { title: item.title, validity: item.validity };
        }),
        规范性文件样本: searchedNormatives.slice(0, 2).map(function(item) {
          return { title: item.title, validity: item.validity };
        })
      });
      
      // 进入搜索模式，直接显示搜索结果
      this.setData({
        isSearchMode: true,
        searchedRegulations: searchedRegulations,
        searchedNormatives: searchedNormatives,
        searchedStandards: [],
        displayedStandards: [],
        standardHasMore: false,
        filteredCategories: [] // 清空分类显示
      });
      
      console.log('🔍 搜索结果:', {
        searchKeyword: searchKeyword,
        validityFilter: validityFilter,
        筛选前规章数: this.data.regulationData.length,
        筛选后规章数: allRegulations.length,
        搜索后规章数: searchedRegulations.length,
        筛选前规范性文件数: this.data.normativeData.length,
        筛选后规范性文件数: allNormatives.length,
        搜索后规范性文件数: searchedNormatives.length
      });
      
      // 在搜索模式下也显示筛选提示
      if (validityFilter !== 'all') {
        var filterText = validityFilter === 'valid' ? '有效' : '失效';
        wx.showToast({
          title: '显示' + filterText + '：规章' + searchedRegulations.length + '，规范' + searchedNormatives.length,
          icon: 'none',
          duration: 2000
        });
      }
      
      return;
    }
    
    // 非搜索模式，显示分类
    this.setData({
      isSearchMode: false,
      searchedRegulations: [],
      searchedNormatives: [],
      searchedStandards: [],
      displayedStandards: [],
      standardHasMore: false
    });
    
    var filtered = categories;
    
    // 按分类过滤
    if (currentTab > 0 && this.data.tabs[currentTab]) {
      var selectedCategory = this.data.tabs[currentTab];
      filtered = filtered.filter(function(cat) {
        return cat.category === selectedCategory;
      });
    }
    
    // 按搜索关键字过滤分类
    if (searchKeyword) {
      filtered = this.searchManager.searchComponent.search(searchKeyword, filtered, {
        searchFields: ['name', 'description', 'category']
      });
    }
    
    this.setData({
      filteredCategories: filtered
    });
  },

  // 更新统计数据
  updateValidityStats: function() {
    var stats = this.getValidityStats();
    this.setData({
      validRegulationsCount: stats.valid.regulations,
      validNormativesCount: stats.valid.normatives,
      validStandardsCount: stats.valid.standards,
      invalidRegulationsCount: stats.invalid.regulations,
      invalidNormativesCount: stats.invalid.normatives,
      invalidStandardsCount: stats.invalid.standards
    });
  },

  // 搜索输入 - 使用搜索管理器
  onSearchInput: function(event) {
    var keyword = event.detail.value || event.detail || '';
    this.searchManager.handleSearchInput(keyword);
  },

  // 新的有效性筛选切换（支持新UI）
  onValidityFilterChange: function(event) {
    var filter = event.currentTarget.dataset.filter;
    
    console.log('🔄 切换有效性筛选:', {
      from: this.data.validityFilter,
      to: filter,
      isSearchMode: this.data.isSearchMode,
      searchKeyword: this.data.searchKeyword
    });
    
    // 先更新状态
    this.setData({
      validityFilter: filter
    });
    
    // 传递新的筛选值给filterCategories，避免异步更新问题
    this.filterCategories(filter);
    
    // 提供用户反馈：在搜索模式下显示即时结果，在非搜索模式下显示统计
    if (this.data.isSearchMode && this.data.searchKeyword) {
      // 搜索模式下的反馈将在filterCategories中的搜索结果显示逻辑中处理
      console.log('🔍 搜索模式下切换筛选条件');
    } else if (!this.data.searchKeyword && this.data.currentTab === 0) {
      // 非搜索模式下显示筛选统计
      var allRegulations = this.filterByValidityWithParam(this.data.regulationData, filter);
      var allNormatives = this.filterByValidityWithParam(this.data.normativeData, filter);
      var allStandards = this.filterByValidityWithParam(this.data.standardData, filter);
      
      var filterText = filter === 'all' ? '全部' : (filter === 'valid' ? '有效' : '失效');
      var message = '';
      if (this.data.dataView === 'standard') {
        message = '已筛选' + filterText + '标准规范：' + allStandards.length + '条';
      } else {
        message = '已筛选' + filterText + '：规章' + allRegulations.length + '，规范' + allNormatives.length;
      }
      
      // 显示toast提示
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
      
      console.log('📊 筛选结果统计:', {
        filter: filter,
        regulations: allRegulations.length,
        normatives: allNormatives.length,
        standards: allStandards.length,
        dataView: this.data.dataView,
        message: message
      });
    }
  },

  // 获取统计数据（用于新UI显示）
  getValidityStats: function() {
    var allRegulations = this.data.regulationData || [];
    var allNormatives = this.data.normativeData || [];
    var allStandards = this.data.standardData || [];
    
    var validRegulations = this.filterByValidityWithParam(allRegulations, 'valid');
    var invalidRegulations = this.filterByValidityWithParam(allRegulations, 'invalid');
    var validNormatives = this.filterByValidityWithParam(allNormatives, 'valid');
    var invalidNormatives = this.filterByValidityWithParam(allNormatives, 'invalid');
    var validStandards = this.filterByValidityWithParam(allStandards, 'valid');
    var invalidStandards = this.filterByValidityWithParam(allStandards, 'invalid');
    
    return {
      all: {
        regulations: allRegulations.length,
        normatives: allNormatives.length,
        standards: allStandards.length,
        total: allRegulations.length + allNormatives.length + allStandards.length
      },
      valid: {
        regulations: validRegulations.length,
        normatives: validNormatives.length,
        standards: validStandards.length,
        total: validRegulations.length + validNormatives.length + validStandards.length
      },
      invalid: {
        regulations: invalidRegulations.length,
        normatives: invalidNormatives.length,
        standards: invalidStandards.length,
        total: invalidRegulations.length + invalidNormatives.length + invalidStandards.length
      }
    };
  },

  // 原有的有效性筛选切换方法（保持兼容性）
  onFilterChange: function(event) {
    var filter = event.currentTarget.dataset.filter;
    
    console.log('🔄 切换有效性筛选:', {
      from: this.data.validityFilter,
      to: filter,
      isSearchMode: this.data.isSearchMode,
      searchKeyword: this.data.searchKeyword
    });
    
    // 先更新状态
    this.setData({
      validityFilter: filter
    });
    
    // 传递新的筛选值给filterCategories，避免异步更新问题
    this.filterCategories(filter);
    
    // 提供用户反馈：在搜索模式下显示即时结果，在非搜索模式下显示统计
    if (this.data.isSearchMode && this.data.searchKeyword) {
      // 搜索模式下的反馈将在filterCategories中的搜索结果显示逻辑中处理
      console.log('🔍 搜索模式下切换筛选条件');
    } else if (!this.data.searchKeyword && this.data.currentTab === 0) {
      // 非搜索模式下显示筛选统计
      var allRegulations = this.filterByValidityWithParam(this.data.regulationData, filter);
      var allNormatives = this.filterByValidityWithParam(this.data.normativeData, filter);
      var allStandards = this.filterByValidityWithParam(this.data.standardData, filter);
      
      var filterText = filter === 'all' ? '全部' : (filter === 'valid' ? '有效' : '失效');
      var message = '';
      if (this.data.dataView === 'standard') {
        message = '已筛选' + filterText + '标准规范：' + allStandards.length + '条';
      } else {
        message = '已筛选' + filterText + '：规章' + allRegulations.length + '，规范' + allNormatives.length;
      }
      
      // 显示toast提示
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
      
      console.log('📊 筛选结果统计:', {
        filter: filter,
        regulations: allRegulations.length,
        normatives: allNormatives.length,
        standards: allStandards.length,
        dataView: this.data.dataView,
        message: message
      });
    }
  },

  // 点击分类项
  onCategoryClick: function(event) {
    var category = event.currentTarget.dataset.category;
    if (category) {
      // 跳转到规章列表页面
      wx.navigateTo({
        url: '../regulations/index?category=' + encodeURIComponent(category.category) + 
             '&subcategory=' + encodeURIComponent(category.name)
      });
    }
  },

  // 点击规章项（搜索结果）- 弹出选择弹窗
  onRegulationClick: function(event) {
    var regulation = event.currentTarget.dataset.regulation;
    if (regulation) {
      wx.showActionSheet({
        itemList: ['下载官方附件（如有）', '复制局方页面链接', '查看规范性文件'],
        success: function(res) {
          if (res.tapIndex === 0) {
            // 优先下载官方附件
            CCARUtils.downloadOfficialDocument(regulation, {
              fallbackCopy: true
            });
          } else if (res.tapIndex === 1) {
            // 复制页面链接
            CCARUtils.copyLink(regulation);
          } else if (res.tapIndex === 2) {
            // 跳转到规范性文件页面
            wx.navigateTo({
              url: '../normatives/index?docNumber=' + encodeURIComponent(regulation.doc_number) + 
                   '&title=' + encodeURIComponent(regulation.title)
            });
          }
        }
      });
    }
  },

  // 点击规范性文件项（搜索结果）- 弹出选择弹窗
  onNormativeClick: function(event) {
    var normative = event.currentTarget.dataset.normative;
    if (normative) {
      wx.showActionSheet({
        itemList: ['下载官方附件（如有）', '复制局方页面链接', '查看文件详情'],
        success: function(res) {
          if (res.tapIndex === 0) {
            // 优先下载官方附件
            CCARUtils.downloadOfficialDocument(normative, {
              fallbackCopy: true
            });
          } else if (res.tapIndex === 1) {
            // 复制页面链接
            CCARUtils.copyLink(normative);
          } else if (res.tapIndex === 2) {
            // 显示规范性文件详情
            CCARUtils.showFileDetail(normative);
          }
        }
      });
    }
  },

  // 点击标准规范项（搜索结果）- 弹出选择弹窗
  onStandardClick: function(event) {
    var standard = event.currentTarget.dataset.standard;
    if (standard) {
      wx.showActionSheet({
        itemList: ['下载官方附件（如有）', '复制局方页面链接', '查看文件详情'],
        success: function(res) {
          if (res.tapIndex === 0) {
            // 优先下载官方附件
            CCARUtils.downloadOfficialDocument(standard, {
              fallbackCopy: true
            });
          } else if (res.tapIndex === 1) {
            // 复制页面链接
            CCARUtils.copyLink(standard);
          } else if (res.tapIndex === 2) {
            // 显示标准规范详情
            CCARUtils.showFileDetail(standard);
          }
        }
      });
    }
  },

  // 初始化年份范围
  initializeYearRange: function() {
    var currentYear = new Date().getFullYear();
    var startYear = 1988;
    var yearRange = [];
    
    for (var year = currentYear; year >= startYear; year--) {
      yearRange.push(year.toString());
    }
    
    this.setData({
      yearRange: yearRange,
      customStartYear: currentYear - 5, // 默认5年前
      customEndYear: currentYear,
      customStartYearIndex: 5, // 对应当前年份-5
      customEndYearIndex: 0    // 对应当前年份
    });
  },

  // 起始日期选择变化
  onStartDateChange: function(event) {
    var date = event.detail.value; // 格式: YYYY-MM-DD
    var dateDisplay = this.formatDateToDisplay(date);
    
    this.setData({
      customStartDate: date,
      customStartDateDisplay: dateDisplay
    });
    
    // 如果起始日期大于结束日期，自动调整结束日期
    if (this.data.customEndDate && date > this.data.customEndDate) {
      this.setData({
        customEndDate: date,
        customEndDateDisplay: dateDisplay
      });
    }
    
    // 如果时间筛选是自定义，重新筛选数据
    if (this.data.timeFilter === 'custom') {
      this.filterCategories();
      this.showCustomDateFeedback();
    }
  },

  // 结束日期选择变化
  onEndDateChange: function(event) {
    var date = event.detail.value; // 格式: YYYY-MM-DD
    var dateDisplay = this.formatDateToDisplay(date);
    
    this.setData({
      customEndDate: date,
      customEndDateDisplay: dateDisplay
    });
    
    // 如果结束日期小于起始日期，自动调整起始日期
    if (this.data.customStartDate && date < this.data.customStartDate) {
      this.setData({
        customStartDate: date,
        customStartDateDisplay: dateDisplay
      });
    }
    
    // 如果时间筛选是自定义，重新筛选数据
    if (this.data.timeFilter === 'custom') {
      this.filterCategories();
      this.showCustomDateFeedback();
    }
  },

  // 格式化日期为显示格式
  formatDateToDisplay: function(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[0] + '年' + parts[1] + '月' + parts[2] + '日';
  },

  // 显示自定义日期筛选反馈
  showCustomDateFeedback: function() {
    if (!this.data.customStartDate || !this.data.customEndDate) {
      wx.showToast({
        title: '请选择完整的日期范围',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    var startDisplay = this.data.customStartDateDisplay || this.data.customStartDate;
    var endDisplay = this.data.customEndDateDisplay || this.data.customEndDate;
    
    var message = '';
    if (this.data.dataView === 'standard') {
      var allStandards = this.filterByValidityWithParam(this.data.standardData, this.data.validityFilter);
      var filteredStandards = this.filterByTime(allStandards, 'custom', this.data.customStartDate, this.data.customEndDate);
      message = '日期范围: ' + startDisplay + ' 至 ' + endDisplay + '，找到 ' + filteredStandards.length + ' 个标准规范';
    } else {
      var allNormatives = this.filterByValidityWithParam(this.data.normativeData, this.data.validityFilter);
      var filteredNormatives = this.filterByTime(allNormatives, 'custom', this.data.customStartDate, this.data.customEndDate);
      message = '日期范围: ' + startDisplay + ' 至 ' + endDisplay + '，找到 ' + filteredNormatives.length + ' 个规范性文件';
    }
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // 时间筛选函数
  filterByTime: function(data, timeFilter, customStartDate, customEndDate) {
    if (timeFilter === 'all' || !data || data.length === 0) {
      return data;
    }
    
    var currentDate = new Date();
    var startDate, endDate;
    
    switch(timeFilter) {
      case 'month1':
        startDate = new Date(currentDate);
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = currentDate;
        break;
      case 'month3':
        startDate = new Date(currentDate);
        startDate.setMonth(startDate.getMonth() - 3);
        endDate = currentDate;
        break;
      case 'month6':
        startDate = new Date(currentDate);
        startDate.setMonth(startDate.getMonth() - 6);
        endDate = currentDate;
        break;
      case 'year1':
        startDate = new Date(currentDate);
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = currentDate;
        break;
      case 'year3':
        startDate = new Date(currentDate);
        startDate.setFullYear(startDate.getFullYear() - 3);
        endDate = currentDate;
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) {
          return data;
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        // 设置结束日期为当天的23:59:59
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return data;
    }
    
    return data.filter(function(item) {
      if (!item.publish_date) return false;
      
      // 解析中文日期格式 "YYYY年MM月DD日"
      var dateMatch = item.publish_date.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (!dateMatch) {
        // 尝试只匹配年份
        var yearMatch = item.publish_date.match(/^(\d{4})年/);
        if (!yearMatch) return false;
        
        // 如果只有年份，创建该年1月1日的日期
        var itemDate = new Date(parseInt(yearMatch[1]), 0, 1);
      } else {
        // 完整日期
        var year = parseInt(dateMatch[1]);
        var month = parseInt(dateMatch[2]) - 1; // JavaScript月份从0开始
        var day = parseInt(dateMatch[3]);
        var itemDate = new Date(year, month, day);
      }
      
      return itemDate >= startDate && itemDate <= endDate;
    });
  },

  // 时间筛选变化事件
  onTimeFilterChange: function(event) {
    var timeFilter = event.detail;
    
    console.log('🕒 切换时间筛选:', {
      from: this.data.timeFilter,
      to: timeFilter
    });
    
    // 根据选择的值更新标题
    var filterTitle = '全部时间';
    var options = this.data.timeFilterOptions;
    for (var i = 0; i < options.length; i++) {
      if (options[i].value === timeFilter) {
        filterTitle = options[i].text;
        break;
      }
    }
    
    this.setData({
      timeFilter: timeFilter,
      timeFilterTitle: filterTitle
    });
    
    // 重新筛选数据
    this.filterCategories();
    
    // 显示筛选结果反馈
    this.showTimeFilterFeedback(timeFilter);
  },


  // 显示时间筛选反馈
  showTimeFilterFeedback: function(timeFilter) {
    var filterText = '';
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var currentMonth = currentDate.getMonth() + 1;
    var currentDay = currentDate.getDate();
    
    switch(timeFilter) {
      case 'all':
        filterText = '全部时间';
        break;
      case 'month1':
        var date1 = new Date(currentDate);
        date1.setMonth(date1.getMonth() - 1);
        filterText = '近1个月';
        break;
      case 'month3':
        var date3 = new Date(currentDate);
        date3.setMonth(date3.getMonth() - 3);
        filterText = '近3个月';
        break;
      case 'month6':
        var date6 = new Date(currentDate);
        date6.setMonth(date6.getMonth() - 6);
        filterText = '近6个月';
        break;
      case 'year1':
        filterText = '近1年';
        break;
      case 'year3':
        filterText = '近3年';
        break;
      case 'custom':
        if (this.data.customStartDateDisplay && this.data.customEndDateDisplay) {
          filterText = this.data.customStartDateDisplay + ' 至 ' + this.data.customEndDateDisplay;
        } else {
          filterText = '自定义日期范围';
        }
        break;
    }
    
    var message = '';
    if (this.data.dataView === 'standard') {
      var allStandards = this.filterByValidityWithParam(this.data.standardData, this.data.validityFilter);
      var filteredStandards = this.filterByTime(allStandards, timeFilter, this.data.customStartDate, this.data.customEndDate);
      message = '时间筛选: ' + filterText + '，找到 ' + filteredStandards.length + ' 个标准规范';
    } else {
      var allNormatives = this.filterByValidityWithParam(this.data.normativeData, this.data.validityFilter);
      var filteredNormatives = this.filterByTime(allNormatives, timeFilter, this.data.customStartDate, this.data.customEndDate);
      message = '时间筛选: ' + filterText + '，找到 ' + filteredNormatives.length + ' 个规范性文件';
    }
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // 清除搜索
  onClearSearch: function() {
    this.setData({
      searchKeyword: '',
      isSearchMode: false,
      searchedRegulations: [],
      searchedNormatives: [],
      searchedStandards: [],
      displayedStandards: [],
      standardHasMore: false,
      loadingMoreStandards: false
    });
    this.filterCategories();
  },

  // 切换时间筛选下拉菜单
  toggleTimeFilterDropdown: function() {
    console.log('🔄 切换时间筛选下拉菜单，当前状态:', this.data.showTimeFilterDropdown);
    this.setData({
      showTimeFilterDropdown: !this.data.showTimeFilterDropdown
    });
    console.log('🔄 新状态:', !this.data.showTimeFilterDropdown);
  },

  // 选择时间筛选选项
  onSelectTimeFilter: function(event) {
    var value = event.currentTarget.dataset.value;
    var options = this.data.timeFilterOptions;
    var title = '全部时间';
    
    // 找到对应的标题
    for (var i = 0; i < options.length; i++) {
      if (options[i].value === value) {
        title = options[i].text;
        break;
      }
    }
    
    this.setData({
      timeFilter: value,
      timeFilterTitle: title,
      showTimeFilterDropdown: false // 关闭下拉菜单
    });
    
    // 重新筛选数据
    this.filterCategories();
    
    // 显示筛选结果反馈
    this.showTimeFilterFeedback(value);
  },

  // 关闭时间筛选下拉菜单
  closeTimeFilterDropdown: function() {
    this.setData({
      showTimeFilterDropdown: false
    });
  },

  // 空函数，阻止事件冒泡
  noop: function() {
    // 空函数，用于阻止事件冒泡
  },

  // 快捷选择：最近一周
  selectLastWeek: function() {
    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    var startStr = this.formatDateToString(startDate);
    var endStr = this.formatDateToString(endDate);
    
    this.setData({
      customStartDate: startStr,
      customEndDate: endStr,
      customStartDateDisplay: this.formatDateToDisplay(startStr),
      customEndDateDisplay: this.formatDateToDisplay(endStr)
    });
    
    // 触发筛选
    this.filterCategories();
    this.showCustomDateFeedback();
  },
  
  // 快捷选择：最近一月
  selectLastMonth: function() {
    var endDate = new Date();
    var startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    var startStr = this.formatDateToString(startDate);
    var endStr = this.formatDateToString(endDate);
    
    this.setData({
      customStartDate: startStr,
      customEndDate: endStr,
      customStartDateDisplay: this.formatDateToDisplay(startStr),
      customEndDateDisplay: this.formatDateToDisplay(endStr)
    });
    
    // 触发筛选
    this.filterCategories();
    this.showCustomDateFeedback();
  },
  
  // 快捷选择：最近一年
  selectLastYear: function() {
    var endDate = new Date();
    var startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    var startStr = this.formatDateToString(startDate);
    var endStr = this.formatDateToString(endDate);
    
    this.setData({
      customStartDate: startStr,
      customEndDate: endStr,
      customStartDateDisplay: this.formatDateToDisplay(startStr),
      customEndDateDisplay: this.formatDateToDisplay(endStr)
    });
    
    // 触发筛选
    this.filterCategories();
    this.showCustomDateFeedback();
  },
  
  // 格式化日期为字符串(YYYY-MM-DD)
  formatDateToString: function(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    return year + '-' + month + '-' + day;
  },

  // 清除时间筛选
  onClearTimeFilter: function() {
    console.log('🗑️ 清除时间筛选');
    
    this.setData({
      timeFilter: 'all',
      timeFilterTitle: '全部时间',
      showTimeFilterDropdown: false
    });
    
    // 重新筛选数据
    this.filterCategories();
    
    // 显示清除反馈
    wx.showToast({
      title: '已清除时间筛选',
      icon: 'success',
      duration: 1500
    });
  },

  // 页面触底加载（标准规范模式分页）
  onReachBottom: function() {
    if (this.data.dataView === 'standard' && this.data.isSearchMode) {
      this.loadMoreStandards();
    }
  },

  // 页面卸载时清理资源
  onUnload: function() {
    if (this.searchManager) {
      this.searchManager.cleanup();
    }
  }
};

Page(BasePage.createPage(pageConfig));
