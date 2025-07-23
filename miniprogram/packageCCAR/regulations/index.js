// CCAR规章列表页面
var BasePage = require('../../utils/base-page.js');
var SearchComponent = require('../../utils/search-component.js');
var CCARDataManager = require('../../utils/ccar-data-manager.js');

var pageConfig = {
  data: {
    // 页面数据
    category: '',
    subcategory: '',
    regulations: [],
    filteredRegulations: [],
    searchKeyword: '',
    loading: true
  },

  // 搜索组件
  searchComponent: null,

  customOnLoad: function(options) {
    var self = this;
    
    // 获取分类参数并解码，包括搜索关键字
    this.setData({
      category: decodeURIComponent(options.category || ''),
      subcategory: decodeURIComponent(options.subcategory || ''),
      searchKeyword: decodeURIComponent(options.searchKeyword || '')
    });
    
    console.log('规章列表页面参数:', {
      category: this.data.category,
      subcategory: this.data.subcategory,
      searchKeyword: this.data.searchKeyword
    });
    
    // 初始化搜索组件
    this.searchComponent = SearchComponent.createSearchComponent();
    
    // 加载数据
    this.loadDataWithLoading(function() {
      return self.loadRegulationsByCategory().then(function() {
        // 如果有搜索关键字，执行搜索
        if (self.data.searchKeyword) {
          self.filterRegulations();
        }
      });
    }, {
      loadingText: '正在加载规章列表...'
    });
  },

  // 根据分类加载规章
  loadRegulationsByCategory: function() {
    var self = this;
    return new Promise(function(resolve) {
      try {
        // 使用正确的相对路径访问分包根目录
        var regulationModule = require('../regulation.js');
        
        if (!regulationModule || !regulationModule.regulationData) {
          throw new Error('规章数据不可用');
        }
        
        var allRegulations = regulationModule.regulationData;
        var filteredRegulations = [];
        
        // 如果有分类参数，进行过滤
        if (self.data.category) {
          filteredRegulations = CCARDataManager.filterRegulationsByCategory(
            allRegulations, 
            self.data.category, 
            self.data.subcategory
          );
        } else {
          filteredRegulations = allRegulations;
        }
        
        self.setData({
          regulations: filteredRegulations,
          filteredRegulations: filteredRegulations
        });
        
        console.log('✅ 规章列表加载成功，数量:', filteredRegulations.length);
        resolve();
      } catch (error) {
        console.error('❌ 规章列表加载失败:', error);
        self.handleError(error, '规章列表加载失败');
        resolve();
      }
    });
  },

  // 搜索输入
  onSearchInput: function(event) {
    var keyword = event.detail.value || event.detail || '';
    this.setData({
      searchKeyword: keyword
    });
    this.filterRegulations();
  },

  // 过滤规章
  filterRegulations: function() {
    var searchKeyword = this.data.searchKeyword;
    var regulations = this.data.regulations;
    
    var filtered = regulations;
    
    // 按搜索关键字过滤
    if (searchKeyword) {
      filtered = this.searchComponent.search(searchKeyword, regulations, {
        searchFields: ['title', 'doc_number', 'office_unit']
      });
    }
    
    this.setData({
      filteredRegulations: filtered
    });
  },

  // 点击规章项
  onRegulationClick: function(event) {
    var regulation = event.currentTarget.dataset.regulation;
    if (regulation) {
      // 跳转到规范性文件页面
      wx.navigateTo({
        url: '../normatives/index?docNumber=' + encodeURIComponent(regulation.doc_number) + 
             '&title=' + encodeURIComponent(regulation.title)
      });
    }
  },

  // 复制规章链接
  onCopyLink: function(event) {
    event.stopPropagation(); // 阻止冒泡
    var regulation = event.currentTarget.dataset.regulation;
    
    if (regulation && regulation.url) {
      wx.setClipboardData({
        data: regulation.url,
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
};

Page(BasePage.createPage(pageConfig));