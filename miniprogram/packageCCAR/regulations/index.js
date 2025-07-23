// CCAR规章列表页面
var BasePage = require('../../utils/base-page.js');
var CCARDataManager = require('../../utils/ccar-data-manager.js');

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
      loadingText: '正在加载规章列表...',
      dataKey: 'loadResult' // 使用不同的dataKey避免冲突
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

    // 按有效性状态过滤
    if (validityFilter !== 'all') {
      var targetValidity = validityFilter === 'valid' ? '有效' : '失效';
      filtered = filtered.filter(function(item) {
        return item.validity === targetValidity;
      });
    }

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
    } else {
      wx.showToast({
        title: '链接不可用',
        icon: 'none',
        duration: 1500
      });
    }
  }
};

Page(BasePage.createPage(pageConfig));