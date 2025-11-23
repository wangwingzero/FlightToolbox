// CCAR规范性文件页面
var BasePage = require('../../utils/base-page.js');
var CCARSearchManager = require('../search-manager.js');
var CCARDataManager = require('../../utils/ccar-data-manager.js');
var CCARDataLoader = require('../data-loader.js');
var CCARConfig = require('../config.js');
var CCARUtils = require('../utils.js');

var pageConfig = {
  data: {
    // 页面数据
    docNumber: '',
    regulationTitle: '',
    normatives: [],
    filteredNormatives: [],
    displayedNormatives: [], // 当前显示的数据（分页）
    searchKeyword: '',
    validityFilter: 'all', // 有效性筛选：all, valid, invalid
    loading: true,
    // 分页相关
    pageSize: CCARConfig.PAGE_SIZE,
    currentPage: 1,
    hasMore: true,
    loadingMore: false
  },

  // 搜索组件
  searchManager: null,

  customOnLoad: function(options) {
    var self = this;
    
    // 获取参数
    this.setData({
      docNumber: options.docNumber || '',
      regulationTitle: decodeURIComponent(options.title || ''),
      searchKeyword: decodeURIComponent(options.searchKeyword || '')
    });
    
    console.log('规范性文件页面参数:', {
      docNumber: this.data.docNumber,
      regulationTitle: this.data.regulationTitle,
      searchKeyword: this.data.searchKeyword
    });
    
    // 初始化搜索管理器
    this.searchManager = CCARSearchManager.createSimpleSearchHandler(
      this, 
      'normatives', 
      'filteredNormatives', 
      CCARConfig.SEARCH_FIELDS.NORMATIVE
    );
    
    // 加载数据
    this.loadDataWithLoading(function() {
      return self.loadNormativesByRegulation().then(function() {
        // 如果有搜索关键字，执行搜索
        if (self.data.searchKeyword) {
          // 延迟执行确保数据已经设置
          setTimeout(function() {
            self.filterNormatives();
          }, 100);
        }
      });
    }, {
      loadingText: CCARConfig.LOADING_TEXT.NORMATIVES
    });
  },

  // 根据规章加载规范性文件
  loadNormativesByRegulation: function() {
    var self = this;
    return CCARDataLoader.loadNormativeData().then(function(allNormatives) {
      var filteredNormatives = [];
      
      console.log('加载规范性文件数据:', {
        totalCount: allNormatives.length,
        searchKeyword: self.data.searchKeyword,
        docNumber: self.data.docNumber
      });
      
      // 修复空状态问题：如果有搜索关键字，显示所有数据供搜索
      if (self.data.searchKeyword) {
        filteredNormatives = allNormatives;
      } else if (self.data.docNumber) {
        // 根据规章文号过滤规范性文件
        filteredNormatives = CCARDataManager.getNormativesByRegulation(
          self.data.docNumber,
          allNormatives
        );

        // 如果没有匹配到任何文件，设置为空数组（显示空状态）
        if (!filteredNormatives || filteredNormatives.length === 0) {
          console.log('⚠️ 没有匹配到相关规范性文件，显示空状态');
          filteredNormatives = [];
        }
      } else {
        // 默认显示所有数据
        filteredNormatives = allNormatives;
      }
      
      // 确保数据不是undefined
      filteredNormatives = filteredNormatives || allNormatives;
      
      self.setData({
        normatives: filteredNormatives,
        filteredNormatives: filteredNormatives,
        currentPage: 1,
        hasMore: filteredNormatives.length > self.data.pageSize
      });

      // 加载第一页数据
      self.loadPageData();

      console.log('✅ 规范性文件加载成功，数量:', filteredNormatives.length);
    }).catch(function(error) {
      console.error('❌ 规范性文件加载失败:', error);
      // 设置空数组而不是undefined
      self.setData({
        normatives: [],
        filteredNormatives: [],
        displayedNormatives: [],
        hasMore: false
      });
      self.handleError(error, CCARConfig.MESSAGES.DATA_LOAD_ERROR);
    });
  },

  // 分页加载数据
  loadPageData: function() {
    var self = this;
    var startIndex = (self.data.currentPage - 1) * self.data.pageSize;
    var endIndex = startIndex + self.data.pageSize;
    var pageData = self.data.filteredNormatives.slice(startIndex, endIndex);

    var displayedData = self.data.currentPage === 1 ? pageData : self.data.displayedNormatives.concat(pageData);

    self.setData({
      displayedNormatives: displayedData,
      hasMore: endIndex < self.data.filteredNormatives.length,
      loadingMore: false
    });
  },

  // 加载更多数据
  onLoadMore: function() {
    var self = this;
    if (!self.data.hasMore || self.data.loadingMore) {
      return;
    }

    self.setData({
      loadingMore: true,
      currentPage: self.data.currentPage + 1
    });

    setTimeout(function() {
      self.loadPageData();
    }, 100); // 添加小延迟，提供更好的用户体验
  },

  // 搜索输入（使用搜索管理器）
  onSearchInput: function(event) {
    var keyword = event.detail.value || event.detail || '';
    this.setData({
      searchKeyword: keyword
    });
    this.filterNormatives();
  },

  // 过滤规范性文件
  filterNormatives: function() {
    var searchKeyword = this.data.searchKeyword;
    var validityFilter = this.data.validityFilter;
    var normatives = this.data.normatives || [];
    
    console.log('开始过滤规范性文件:', {
      searchKeyword: searchKeyword,
      validityFilter: validityFilter,
      normativesCount: normatives.length
    });
    
    var filtered = normatives;
    
    // 按搜索关键字过滤
    if (searchKeyword && this.searchComponent) {
      try {
        filtered = this.searchComponent.search(searchKeyword, filtered, {
          searchFields: CCARConfig.SEARCH_FIELDS.NORMATIVE
        });
        
        // 确保filtered不是undefined
        if (!filtered || !Array.isArray(filtered)) {
          console.warn('搜索结果异常，使用原数据');
          filtered = normatives;
        }
        
        console.log('搜索完成，结果数量:', filtered.length);
      } catch (error) {
        console.error('搜索过程出错:', error);
        filtered = normatives;
      }
    }
    
    // 按有效性状态过滤（使用统一筛选接口）
    filtered = CCARUtils.filterByValidity(filtered, validityFilter);
    
    this.setData({
      filteredNormatives: filtered || [],
      currentPage: 1,
      hasMore: (filtered || []).length > this.data.pageSize
    });

    // 重新加载第一页数据
    this.loadPageData();
  },

  // 有效性筛选切换
  onFilterChange: function(event) {
    var filter = event.currentTarget.dataset.filter;
    this.setData({
      validityFilter: filter
    });
    this.filterNormatives();
  },

  // 点击规范性文件项
  onNormativeClick: function(event) {
    var normative = event.currentTarget.dataset.normative;
    if (normative) {
      wx.showActionSheet({
        itemList: ['复制链接（请在浏览器中粘贴打开下载）', '查看文件详情'],
        success: function(res) {
          if (res.tapIndex === 0) {
            CCARUtils.copyLink(normative);
          } else if (res.tapIndex === 1) {
            CCARUtils.showFileDetail(normative, {
              showCancel: false,
              confirmText: '确定'
            });
          }
        }
      });
    }
  },

  // 复制文件链接
  onCopyLink: function(event) {
    var normative = event.currentTarget.dataset.normative;
    CCARUtils.copyLink(normative);
  },

  // 查看文件详情
  onFileDetail: function(event) {
    var normative = event.currentTarget.dataset.normative;
    CCARUtils.showFileDetail(normative, {
      showCancel: false,
      confirmText: '确定'
    });
  }
};

Page(BasePage.createPage(pageConfig));