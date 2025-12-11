// CCAR规章列表页面
var BasePage = require('../../utils/base-page.js');
var CCARDataManager = require('../../utils/ccar-data-manager.js');
var CCARDataLoader = require('../data-loader.js');
var CCARConfig = require('../config.js');
var CCARUtils = require('../utils.js');

var pageConfig = {
  data: {
    // 页面数据
    category: '',
    subcategory: '',
    regulations: [],
    filteredRegulations: [],
    validityFilter: 'all', // 有效性筛选：all, valid, invalid
    loading: true,
    normativeData: [] // 规范性文件数据，用于统计数量
  },

  customOnLoad: function(options) {
    var self = this;

    // 获取分类参数并解码
    this.setData({
      category: decodeURIComponent(options.category || ''),
      subcategory: decodeURIComponent(options.subcategory || '')
    });

    console.log('规章列表页面参数:', {
      category: this.data.category,
      subcategory: this.data.subcategory
    });

    // 加载数据
    this.loadDataWithLoading(function() {
      return Promise.all([
        self.loadRegulationsByCategory(),
        self.loadNormativeData()
      ]).then(function() {
        self.calculateNormativeCounts();
        return { success: true }; // 返回一个有效的结果对象
      });
    }, {
      loadingText: CCARConfig.LOADING_TEXT.REGULATIONS,
      dataKey: 'loadResult' // 使用不同的dataKey避免冲突
    });
  },

  // 根据分类加载规章
  loadRegulationsByCategory: function() {
    var self = this;
    return CCARDataLoader.loadRegulationData().then(function(allRegulations) {
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
    }).catch(function(error) {
      console.error('❌ 规章列表加载失败:', error);
      self.handleError(error, CCARConfig.MESSAGES.DATA_LOAD_ERROR);
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

  // 计算每个规章的规范性文件数量
  calculateNormativeCounts: function() {
    var self = this;
    var regulations = this.data.filteredRegulations;
    var normativeData = this.data.normativeData;

    // 为每个规章计算规范性文件数量
    var regulationsWithCounts = regulations.map(function(regulation) {
      var count = 0;
      if (regulation.doc_number && normativeData.length > 0) {
        var relatedNormatives = CCARDataManager.getNormativesByRegulation(
          regulation.doc_number,
          normativeData
        );
        count = relatedNormatives ? relatedNormatives.length : 0;
      }

      // 创建新对象，添加规范性文件数量
      return Object.assign({}, regulation, {
        normativeCount: count
      });
    });

    this.setData({
      filteredRegulations: regulationsWithCounts
    });

    console.log('✅ 规范性文件数量计算完成');
  },

  // 过滤规章（仅按有效性筛选）
  filterRegulations: function() {
    var validityFilter = this.data.validityFilter;
    var regulations = this.data.regulations;

    var filtered = regulations;

    // 按有效性状态过滤（使用统一筛选接口）
    filtered = CCARUtils.filterByValidity(filtered, validityFilter);

    // 重新计算规范性文件数量
    var self = this;
    var regulationsWithCounts = filtered.map(function(regulation) {
      var count = 0;
      if (regulation.doc_number && self.data.normativeData.length > 0) {
        var relatedNormatives = CCARDataManager.getNormativesByRegulation(
          regulation.doc_number,
          self.data.normativeData
        );
        count = relatedNormatives ? relatedNormatives.length : 0;
      }

      return Object.assign({}, regulation, {
        normativeCount: count
      });
    });

    this.setData({
      filteredRegulations: regulationsWithCounts
    });
  },

  // 有效性筛选切换
  onFilterChange: function(event) {
    var filter = event.currentTarget.dataset.filter;
    this.setData({
      validityFilter: filter
    });
    this.filterRegulations();
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
    var regulation = event.currentTarget.dataset.regulation;
    CCARUtils.copyLink(regulation);
  },

  // 自定义分享到朋友（确保包含分类参数）
  onShareAppMessage: function() {
    var category = this.data.category;
    var subcategory = this.data.subcategory;
    var title = category ? 'CCAR规章 - ' + category : 'CCAR民航规章';
    
    var path = '/packageCCAR/regulations/index';
    if (category) {
      path += '?category=' + encodeURIComponent(category);
      if (subcategory) {
        path += '&subcategory=' + encodeURIComponent(subcategory);
      }
    }
    
    return {
      title: '飞行工具箱 - ' + title,
      path: path
    };
  },

  // 自定义分享到朋友圈
  onShareTimeline: function() {
    var category = this.data.category;
    var title = category ? 'CCAR规章 - ' + category : 'CCAR民航规章';
    
    var query = '';
    if (category) {
      query = 'category=' + encodeURIComponent(category);
      if (this.data.subcategory) {
        query += '&subcategory=' + encodeURIComponent(this.data.subcategory);
      }
    }
    
    return {
      title: '飞行工具箱 - ' + title,
      query: query
    };
  }
};

Page(BasePage.createPage(pageConfig));