/**
 * CCAR搜索管理器 - 统一搜索组件使用方式
 * 标准化搜索防抖、结果处理、状态管理
 * 使用内置搜索逻辑，避免分包跨包引用问题
 */

var CCARConfig = require('./config.js');

/**
 * CCAR搜索管理器
 */
var CCARSearchManager = {
  
  /**
   * 内置搜索组件（避免跨包引用）
   */
  createSearchComponent: function() {
    return {
      /**
       * 搜索方法
       * @param {string} keyword - 搜索关键字
       * @param {Array} data - 搜索数据源
       * @param {Object} options - 搜索选项
       * @returns {Array} 搜索结果
       */
      search: function(keyword, data, options) {
        if (!keyword || !data || !Array.isArray(data)) {
          return data || [];
        }
        
        var config = options || {};
        var searchFields = config.searchFields || ['title'];
        var lowerKeyword = keyword.toLowerCase();
        
        return data.filter(function(item) {
          for (var i = 0; i < searchFields.length; i++) {
            var field = searchFields[i];
            var value = item[field];
            if (value && typeof value === 'string' && 
                value.toLowerCase().indexOf(lowerKeyword) !== -1) {
              return true;
            }
          }
          return false;
        });
      }
    };
  },
  
  /**
   * 创建标准化的搜索集成器
   * @param {Object} pageContext - 页面上下文对象
   * @param {Object} options - 搜索配置选项
   * @returns {Object} 搜索集成器对象
   */
  createSearchIntegration: function(pageContext, options) {
    var self = this;
    var searchComponent = this.createSearchComponent();
    var searchTimer = null;
    
    // 默认配置
    var config = Object.assign({
      debounceDelay: CCARConfig.SEARCH_DEBOUNCE_DELAY,
      searchFields: ['title', 'doc_number'],
      onSearchResult: null, // 搜索结果回调
      onSearchStart: null,  // 搜索开始回调
      onSearchEnd: null     // 搜索结束回调
    }, options || {});
    
    return {
      // 暴露搜索组件供外部使用
      searchComponent: searchComponent,
      
      /**
       * 处理搜索输入（带防抖）
       * @param {string} keyword - 搜索关键字
       */
      handleSearchInput: function(keyword) {
        var integration = this;
        
        // 清除之前的定时器
        if (searchTimer) {
          clearTimeout(searchTimer);
        }
        
        // 触发搜索开始回调
        if (config.onSearchStart) {
          config.onSearchStart(keyword);
        }
        
        // 设置防抖定时器
        searchTimer = setTimeout(function() {
          integration.performSearch(keyword);
        }, config.debounceDelay);
      },
      
      /**
       * 执行搜索操作
       * @param {string} keyword - 搜索关键字
       */
      performSearch: function(keyword) {
        try {
          // 获取搜索数据源
          var searchData = this.getSearchData();
          if (!searchData || !Array.isArray(searchData)) {
            console.warn('搜索数据源无效');
            return;
          }
          
          var results = [];
          if (keyword && keyword.trim()) {
            // 执行搜索
            results = searchComponent.search(keyword, searchData, {
              searchFields: config.searchFields,
              useCache: false // 禁用缓存确保实时搜索
            });
            
            // 确保搜索结果不为null
            results = results || [];
          } else {
            // 空关键字时显示全部数据
            results = searchData;
          }
          
          // 触发搜索结果回调
          if (config.onSearchResult) {
            config.onSearchResult(keyword, results, searchData);
          }
          
          // 触发搜索结束回调
          if (config.onSearchEnd) {
            config.onSearchEnd(keyword, results);
          }
          
        } catch (error) {
          console.error('搜索执行失败:', error);
          // 触发搜索结束回调（错误情况）
          if (config.onSearchEnd) {
            config.onSearchEnd(keyword, []);
          }
        }
      },
      
      /**
       * 获取搜索数据源（需要页面实现）
       * @returns {Array} 搜索数据源
       */
      getSearchData: function() {
        if (config.getSearchData) {
          return config.getSearchData();
        }
        
        // 默认尝试从页面数据中获取
        return pageContext.data.searchData || 
               pageContext.data.filteredData || 
               pageContext.data.data || 
               [];
      },
      
      /**
       * 清理搜索定时器
       */
      cleanup: function() {
        if (searchTimer) {
          clearTimeout(searchTimer);
          searchTimer = null;
        }
      },
      
      /**
       * 更新搜索配置
       * @param {Object} newConfig - 新配置
       */
      updateConfig: function(newConfig) {
        config = Object.assign(config, newConfig || {});
      }
    };
  },
  
  /**
   * 创建简化的搜索处理器（用于简单场景）
   * @param {Object} pageContext - 页面上下文
   * @param {string} dataKey - 数据在page.data中的键名
   * @param {string} resultKey - 结果在page.data中的键名
   * @param {Array} searchFields - 搜索字段列表
   * @returns {Function} 搜索输入处理函数
   */
  createSimpleSearchHandler: function(pageContext, dataKey, resultKey, searchFields) {
    var integration = this.createSearchIntegration(pageContext, {
      searchFields: searchFields || ['title'],
      getSearchData: function() {
        return pageContext.data[dataKey] || [];
      },
      onSearchResult: function(keyword, results) {
        var updateData = {};
        updateData[resultKey] = results;
        updateData.searchKeyword = keyword;
        updateData.isSearchMode = keyword && keyword.trim().length > 0;
        
        pageContext.setData(updateData);
      }
    });
    
    return function(event) {
      var keyword = event.detail.value || event.detail || '';
      integration.handleSearchInput(keyword);
    };
  }
};

module.exports = CCARSearchManager;