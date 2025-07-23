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
    searchedNormatives: []
  },

  // 搜索组件
  searchComponent: null,

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
    var index = event.detail.name || event.detail.index || 0;
    
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

  // 过滤分类
  filterCategories: function() {
    var self = this;
    var currentTab = this.data.currentTab;
    var searchKeyword = this.data.searchKeyword;
    var categories = this.data.categories;
    
    // 如果在"全部"分类且有搜索关键字，进入搜索模式
    if (currentTab === 0 && searchKeyword) {
      // 同时搜索规章和规范性文件
      var allRegulations = this.data.regulationData;
      var allNormatives = this.data.normativeData;
      
      var searchedRegulations = this.searchComponent.search(searchKeyword, allRegulations, {
        searchFields: ['title', 'doc_number', 'office_unit']
      });
      
      var searchedNormatives = this.searchComponent.search(searchKeyword, allNormatives, {
        searchFields: ['title', 'doc_number', 'office_unit', 'publish_date']
      });
      
      // 进入搜索模式，直接显示搜索结果
      this.setData({
        isSearchMode: true,
        searchedRegulations: searchedRegulations || [],
        searchedNormatives: searchedNormatives || [],
        filteredCategories: [] // 清空分类显示
      });
      
      console.log('进入搜索模式:', {
        searchKeyword: searchKeyword,
        regulationCount: searchedRegulations.length,
        normativeCount: searchedNormatives.length
      });
      
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

  // 搜索输入
  onSearchInput: function(event) {
    this.setData({
      searchKeyword: event.detail.value || event.detail || ''
    });
    this.filterCategories();
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
  }
};

Page(BasePage.createPage(pageConfig));