// CCAR规范性文件页面
var BasePage = require('../../utils/base-page.js');
var SearchComponent = require('../../utils/search-component.js');
var CCARDataManager = require('../../utils/ccar-data-manager.js');

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
    pageSize: 20,
    currentPage: 1,
    hasMore: true,
    loadingMore: false
  },

  // 搜索组件
  searchComponent: null,

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
    
    // 初始化搜索组件
    try {
      this.searchComponent = SearchComponent.createSearchComponent();
      console.log('搜索组件初始化成功');
    } catch (error) {
      console.error('搜索组件初始化失败:', error);
      this.searchComponent = null;
    }
    
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
      loadingText: '正在加载规范性文件...'
    });
  },

  // 根据规章加载规范性文件
  loadNormativesByRegulation: function() {
    var self = this;
    return new Promise(function(resolve) {
      try {
        // 使用正确的相对路径访问分包根目录
        var normativeModule = require('../normative.js');
        
        if (!normativeModule || !normativeModule.normativeData) {
          throw new Error('规范性文件数据不可用');
        }
        
        var allNormatives = normativeModule.normativeData;
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
        if (!filteredNormatives || !Array.isArray(filteredNormatives)) {
          console.warn('过滤后的数据异常，使用所有数据');
          filteredNormatives = allNormatives || [];
        }
        
        self.setData({
          normatives: filteredNormatives,
          filteredNormatives: filteredNormatives,
          currentPage: 1,
          hasMore: filteredNormatives.length > self.data.pageSize
        });

        // 加载第一页数据
        self.loadPageData();

        console.log('✅ 规范性文件加载成功，数量:', filteredNormatives.length);
        resolve();
      } catch (error) {
        console.error('❌ 规范性文件加载失败:', error);
        // 设置空数组而不是undefined
        self.setData({
          normatives: [],
          filteredNormatives: [],
          displayedNormatives: [],
          hasMore: false
        });
        self.handleError(error, '规范性文件加载失败');
        resolve();
      }
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
    }, 300); // 添加小延迟，提供更好的用户体验
  },

  // 搜索输入
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
          searchFields: ['title', 'doc_number', 'publish_date', 'office_unit']
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
    
    // 按有效性状态过滤
    if (validityFilter !== 'all') {
      var targetValidity = validityFilter === 'valid' ? '有效' : '失效';
      filtered = filtered.filter(function(item) {
        return item.validity === targetValidity;
      });
    }
    
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

  // 复制文件链接
  onCopyLink: function(event) {
    var normative = event.currentTarget.dataset.normative;
    
    if (normative && normative.url) {
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
  },

  // 查看文件详情
  onFileDetail: function(event) {
    var normative = event.currentTarget.dataset.normative;
    
    if (normative) {
      // 显示文件详细信息
      wx.showModal({
        title: '文件详情',
        content: '文件名：' + normative.title + '\n' +
                '发布日期：' + (normative.publish_date || '未知') + '\n' +
                '负责司局：' + (normative.office_unit || '未知') + '\n' +
                '文件状态：' + (normative.validity || '未知'),
        showCancel: false,
        confirmText: '确定'
      });
    }
  }
};

Page(BasePage.createPage(pageConfig));