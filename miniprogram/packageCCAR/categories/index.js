// CCAR规章分类页面
var BasePage = require('../../utils/base-page.js');
var SearchComponent = require('../../utils/search-component.js');
var CCARDataManager = require('../../utils/ccar-data-manager.js');

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
    validityFilter: 'all' // all, valid, invalid
  },

  // 搜索组件和定时器
  searchComponent: null,
  searchTimer: null,

  customOnLoad: function(options) {
    var self = this;
    
    // 初始化搜索组件
    this.searchComponent = SearchComponent.createSearchComponent();
    
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
    return new Promise(function(resolve) {
      try {
        // 使用正确的相对路径访问分包根目录
        var regulationModule = require('../regulation.js');
        var regulations = regulationModule && regulationModule.regulationData 
                        ? regulationModule.regulationData : [];
        
        self.setData({
          regulationData: regulations
        });
        console.log('✅ 规章数据加载成功，数量:', regulations.length);
        resolve();
      } catch (error) {
        console.error('❌ 规章数据加载失败:', error);
        self.setData({
          regulationData: []
        });
        resolve(); // 继续执行，不阻塞Promise.all
      }
    });
  },

  // 加载规范性文件数据
  loadNormativeData: function() {
    var self = this;
    return new Promise(function(resolve) {
      try {
        // 使用正确的相对路径访问分包根目录
        var normativeModule = require('../normative.js');
        var normatives = normativeModule && normativeModule.normativeData 
                       ? normativeModule.normativeData : [];
        
        self.setData({
          normativeData: normatives
        });
        console.log('✅ 规范性文件数据加载成功，数量:', normatives.length);
        resolve();
      } catch (error) {
        console.error('❌ 规范性文件数据加载失败:', error);
        self.setData({
          normativeData: []
        });
        resolve(); // 继续执行，不阻塞Promise.all
      }
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

  // 根据有效性筛选数据
  filterByValidity: function(data) {
    return this.filterByValidityWithParam(data, this.data.validityFilter);
  },

  // 根据有效性筛选数据（支持自定义筛选参数）
  filterByValidityWithParam: function(data, validityFilter) {
    if (validityFilter === 'all') {
      return data;
    } else if (validityFilter === 'valid') {
      return data.filter(function(item) {
        return item.validity === '有效';
      });
    } else if (validityFilter === 'invalid') {
      return data.filter(function(item) {
        return item.validity === '失效' || item.validity === '废止';
      });
    }
    
    return data;
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
      
      // 搜索筛选后的数据 - 先清除缓存确保使用最新数据
      if (this.searchComponent && this.searchComponent.cache) {
        this.searchComponent.cache = {}; // 清除搜索缓存
      }
      
      var searchedRegulations = this.searchComponent.search(searchKeyword, allRegulations, {
        searchFields: ['title', 'doc_number', 'office_unit'],
        useCache: false // 禁用缓存确保实时搜索
      });
      
      var searchedNormatives = this.searchComponent.search(searchKeyword, allNormatives, {
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
      filtered = this.searchComponent.search(searchKeyword, filtered, {
        searchFields: ['name', 'description', 'category']
      });
    }
    
    this.setData({
      filteredCategories: filtered
    });
  },

  // 搜索输入 - 实时搜索
  onSearchInput: function(event) {
    var self = this;
    var keyword = event.detail.value || event.detail || '';
    
    // 清除之前的延时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    // 设置新的延时器，实现防抖
    this.searchTimer = setTimeout(function() {
      self.setData({
        searchKeyword: keyword
      });
      
      // 实时过滤分类或搜索
      self.filterCategories();
      
      // 记录搜索行为
      if (keyword.length > 0) {
        console.log('🔍 实时搜索:', {
          keyword: keyword,
          timestamp: new Date().toISOString()
        });
      }
    }, 300); // 300ms防抖延时
  },

  // 有效性筛选切换
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

  // 点击规章项（搜索结果）
  onRegulationClick: function(event) {
    var regulation = event.currentTarget.dataset.regulation;
    if (regulation) {
      // 跳转到规范性文件页面，显示该规章下的规范性文件
      wx.navigateTo({
        url: '../normatives/index?docNumber=' + encodeURIComponent(regulation.doc_number) + 
             '&title=' + encodeURIComponent(regulation.title)
      });
    }
  },

  // 点击规范性文件项（搜索结果）
  onNormativeClick: function(event) {
    var normative = event.currentTarget.dataset.normative;
    if (normative && normative.url) {
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
        success: function(res) {
          if (res.confirm) {
            // 复制链接
            wx.setClipboardData({
              data: normative.url,
              success: function() {
                wx.showToast({
                  title: '链接已复制',
                  icon: 'success',
                  duration: 1500
                });
              },
              fail: function() {
                wx.showToast({
                  title: '复制失败',
                  icon: 'none',
                  duration: 1500
                });
              }
            });
          }
        }
      });
    }
  },

  // 页面卸载时清理定时器
  onUnload: function() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }
};

Page(BasePage.createPage(pageConfig));