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
    // 有效性筛选
    validityFilter: 'all', // all, valid, invalid
    // 统计数据
    validRegulationsCount: 0,
    validNormativesCount: 0,
    invalidRegulationsCount: 0,
    invalidNormativesCount: 0
  },

  // 搜索管理器
  searchManager: null,

  customOnLoad: function(options) {
    var self = this;
    
    // 初始化搜索管理器
    this.searchManager = CCARSearchManager.createSearchIntegration(this, {
      searchFields: ['title', 'doc_number', 'office_unit', 'publish_date'],
      onSearchResult: function(keyword, results, originalData) {
        self.handleSearchResult(keyword, results, originalData);
      }
    });
    
    // 使用BasePage的数据加载方法
    this.loadDataWithLoading(function() {
      return Promise.all([
        self.loadRegulationData(),
        self.loadNormativeData()
      ]).then(function() {
        self.generateCategories();
        self.initializeTabs();
      });
    }, {
      loadingText: '正在加载规章数据...'
    });
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
    var self = this;
    var validityFilter = this.data.validityFilter;
    
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
        filteredCategories: [],
        searchKeyword: keyword
      });
      
      // 显示筛选提示
      if (validityFilter !== 'all') {
        var filterText = validityFilter === 'valid' ? '有效' : '失效';
        wx.showToast({
          title: '显示' + filterText + '结果：规章' + searchedRegulations.length + '条，文件' + searchedNormatives.length + '条',
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
    var self = this;
    var currentTab = this.data.currentTab;
    var searchKeyword = this.data.searchKeyword;
    var categories = this.data.categories;
    // 允许传入自定义的筛选条件，解决异步更新问题
    var validityFilter = customValidityFilter || this.data.validityFilter;
    
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
          title: '显示' + filterText + '结果：规章' + searchedRegulations.length + '条，文件' + searchedNormatives.length + '条',
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
      searchedNormatives: []
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
      invalidRegulationsCount: stats.invalid.regulations,
      invalidNormativesCount: stats.invalid.normatives
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
      
      var filterText = filter === 'all' ? '全部' : (filter === 'valid' ? '有效' : '失效');
      var message = '已筛选' + filterText + '文件：规章' + allRegulations.length + '条，规范性文件' + allNormatives.length + '条';
      
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
        message: message
      });
    }
  },

  // 获取统计数据（用于新UI显示）
  getValidityStats: function() {
    var allRegulations = this.data.regulationData || [];
    var allNormatives = this.data.normativeData || [];
    
    var validRegulations = this.filterByValidityWithParam(allRegulations, 'valid');
    var invalidRegulations = this.filterByValidityWithParam(allRegulations, 'invalid');
    var validNormatives = this.filterByValidityWithParam(allNormatives, 'valid');
    var invalidNormatives = this.filterByValidityWithParam(allNormatives, 'invalid');
    
    return {
      all: {
        regulations: allRegulations.length,
        normatives: allNormatives.length,
        total: allRegulations.length + allNormatives.length
      },
      valid: {
        regulations: validRegulations.length,
        normatives: validNormatives.length,
        total: validRegulations.length + validNormatives.length
      },
      invalid: {
        regulations: invalidRegulations.length,
        normatives: invalidNormatives.length,
        total: invalidRegulations.length + invalidNormatives.length
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
      
      var filterText = filter === 'all' ? '全部' : (filter === 'valid' ? '有效' : '失效');
      var message = '已筛选' + filterText + '文件：规章' + allRegulations.length + '条，规范性文件' + allNormatives.length + '条';
      
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
        itemList: ['复制链接', '查看规范性文件'],
        success: function(res) {
          if (res.tapIndex === 0) {
            // 复制链接
            CCARUtils.copyLink(regulation);
          } else if (res.tapIndex === 1) {
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
        itemList: ['复制链接', '查看文件详情'],
        success: function(res) {
          if (res.tapIndex === 0) {
            // 复制链接
            CCARUtils.copyLink(normative);
          } else if (res.tapIndex === 1) {
            // 显示规范性文件详情
            wx.showModal({
              title: '文件详情',
              content: '文件名：' + normative.title + '\n' +
                      '发布日期：' + (normative.publish_date || '未知') + '\n' +
                      '负责司局：' + (normative.office_unit || '未知') + '\n' +
                      '文件状态：' + (normative.validity || '未知'),
              showCancel: true,
              cancelText: '关闭',
              confirmText: '复制链接',
              success: function(modalRes) {
                if (modalRes.confirm) {
                  // 复制链接
                  CCARUtils.copyLink(normative);
                }
              }
            });
          }
        }
      });
    }
  },

  // 广告事件处理
  adLoad: function() {
    console.log('横幅广告加载成功');
  },
  
  adError: function(err) {
    console.error('横幅广告加载失败', err);
  },
  
  adClose: function() {
    console.log('横幅广告关闭');
  },

  // 页面卸载时清理资源
  onUnload: function() {
    if (this.searchManager) {
      this.searchManager.cleanup();
    }
  }
};

Page(BasePage.createPage(pageConfig));