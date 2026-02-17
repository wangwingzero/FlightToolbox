/**
 * 通用搜索组件 - 解决搜索功能重复代码问题
 * 严格遵循ES5语法，确保小程序兼容性
 * 支持防抖、缓存、多字段搜索等功能
 */

/**
 * 搜索组件构造函数
 */
function SearchComponent(options) {
  this.options = options || {};
  this.searchDelay = this.options.searchDelay || 300;
  this.enableCache = this.options.enableCache !== false;
  this.cache = {};
  this.searchTimer = null;
  this.minLength = this.options.minLength || 1;
  this.maxResults = this.options.maxResults || 100;
}

/**
 * 创建搜索混入对象
 */
SearchComponent.prototype.createSearchMixin = function(config) {
  var self = this;
  var searchConfig = config || {};
  
  return {
    data: {
      searchValue: '',
      originalData: [],
      filteredData: [],
      searchTimer: null,
      isSearching: false,
      searchResults: null
    },
    
    /**
     * 搜索输入处理
     */
    onSearchInput: function(e) {
      var value = e.detail.value || '';
      this.setData({ searchValue: value });
      
      // 防抖处理
      if (this.data.searchTimer) {
        clearTimeout(this.data.searchTimer);
      }
      
      var timer = setTimeout(function() {
        self.performSearch.call(this, value);
      }.bind(this), self.searchDelay);
      
      this.setData({ searchTimer: timer });
    },
    
    /**
     * 执行搜索
     */
    performSearch: function(keyword) {
      if (!keyword || keyword.length < self.minLength) {
        this.resetSearchResults();
        return;
      }
      
      this.setData({ isSearching: true });
      
      try {
        var results = self.search(keyword, this.data.originalData, searchConfig);
        this.setData({
          filteredData: results,
          searchResults: results,
          isSearching: false
        });
        
        // 触发搜索完成事件
        if (searchConfig.onSearchComplete && typeof searchConfig.onSearchComplete === 'function') {
          searchConfig.onSearchComplete.call(this, keyword, results);
        }
      } catch (error) {
        console.error('搜索失败:', error);
        this.setData({ isSearching: false });
        
        // 尝试兜底搜索
        this.fallbackSearch(keyword);
      }
    },
    
    /**
     * 重置搜索结果
     */
    resetSearchResults: function() {
      this.setData({
        filteredData: this.data.originalData,
        searchResults: null,
        isSearching: false
      });
      
      // 触发重置事件
      if (searchConfig.onSearchReset && typeof searchConfig.onSearchReset === 'function') {
        searchConfig.onSearchReset.call(this);
      }
    },
    
    /**
     * 兜底搜索
     */
    fallbackSearch: function(keyword) {
      var self = this;
      try {
        var filtered = this.data.originalData.filter(function(item) {
          return self.simpleMatch(item, keyword, searchConfig);
        });
        
        this.setData({
          filteredData: filtered,
          searchResults: filtered,
          isSearching: false
        });
      } catch (error) {
        console.error('兜底搜索也失败:', error);
        this.setData({
          filteredData: [],
          isSearching: false
        });
      }
    },
    
    /**
     * 清除搜索
     */
    clearSearch: function() {
      this.setData({ searchValue: '' });
      this.resetSearchResults();
    }
  };
};

/**
 * 主要搜索方法
 */
SearchComponent.prototype.search = function(keyword, data, config) {
  if (!keyword || !data || !Array.isArray(data)) {
    return [];
  }
  
  var searchConfig = config || {};
  var searchFields = searchConfig.searchFields || ['name', 'title', 'description'];
  var caseSensitive = searchConfig.caseSensitive === true;
  var exactMatch = searchConfig.exactMatch === true;
  var useCache = this.enableCache && searchConfig.useCache !== false;
  
  // 处理关键词
  var processedKeyword = caseSensitive ? keyword : keyword.toLowerCase();
  
  // 检查缓存
  var cacheKey = processedKeyword + '_' + JSON.stringify(searchFields);
  if (useCache && this.cache[cacheKey]) {
    return this.cache[cacheKey];
  }
  
  var results = [];
  var addedIds = {}; // 避免重复结果
  
  for (var i = 0; i < data.length && results.length < this.maxResults; i++) {
    var item = data[i];
    var itemId = item.id || i;
    
    if (addedIds[itemId]) {
      continue;
    }
    
    if (this.matchItem(item, processedKeyword, searchFields, caseSensitive, exactMatch)) {
      results.push(item);
      addedIds[itemId] = true;
    }
  }
  
  // 缓存结果
  if (useCache) {
    this.cache[cacheKey] = results;
  }
  
  return results;
};

/**
 * 匹配单个数据项
 */
SearchComponent.prototype.matchItem = function(item, keyword, searchFields, caseSensitive, exactMatch) {
  for (var i = 0; i < searchFields.length; i++) {
    var field = searchFields[i];
    var value = this.getFieldValue(item, field);
    
    if (value && this.matchValue(value, keyword, caseSensitive, exactMatch)) {
      return true;
    }
  }
  return false;
};

/**
 * 获取字段值（支持嵌套字段）
 */
SearchComponent.prototype.getFieldValue = function(item, field) {
  if (!item || !field) {
    return '';
  }
  
  // 支持嵌套字段，如 'user.name'
  var fields = field.split('.');
  var value = item;
  
  for (var i = 0; i < fields.length; i++) {
    if (value && typeof value === 'object' && value.hasOwnProperty(fields[i])) {
      value = value[fields[i]];
    } else {
      return '';
    }
  }
  
  return String(value || '');
};

/**
 * 匹配值
 */
SearchComponent.prototype.matchValue = function(value, keyword, caseSensitive, exactMatch) {
  var processedValue = caseSensitive ? value : value.toLowerCase();
  
  if (exactMatch) {
    return processedValue === keyword;
  } else {
    return processedValue.indexOf(keyword) !== -1;
  }
};

/**
 * 简单匹配（兜底方案）
 */
SearchComponent.prototype.simpleMatch = function(item, keyword, config) {
  var searchConfig = config || {};
  var fields = searchConfig.searchFields || ['name', 'title', 'description'];
  var processedKeyword = keyword.toLowerCase();
  
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var value = this.getFieldValue(item, field);
    if (value && value.toLowerCase().indexOf(processedKeyword) !== -1) {
      return true;
    }
  }
  
  return false;
};

/**
 * 高级搜索（支持多个关键词）
 */
SearchComponent.prototype.advancedSearch = function(keywords, data, config) {
  if (!keywords || !data || !Array.isArray(data)) {
    return [];
  }
  
  var keywordArray = keywords.split(/\s+/).filter(function(k) { return k.length > 0; });
  if (keywordArray.length === 0) {
    return [];
  }
  
  var searchConfig = config || {};
  var matchMode = searchConfig.matchMode || 'any'; // 'any' 或 'all'
  
  var results = [];
  
  for (var i = 0; i < data.length && results.length < this.maxResults; i++) {
    var item = data[i];
    var matchCount = 0;
    
    for (var j = 0; j < keywordArray.length; j++) {
      var keyword = keywordArray[j];
      if (this.matchItem(item, keyword.toLowerCase(), searchConfig.searchFields || ['name', 'title', 'description'], false, false)) {
        matchCount++;
      }
    }
    
    var shouldInclude = false;
    if (matchMode === 'all') {
      shouldInclude = matchCount === keywordArray.length;
    } else {
      shouldInclude = matchCount > 0;
    }
    
    if (shouldInclude) {
      results.push(item);
    }
  }
  
  return results;
};

/**
 * 搜索建议
 */
SearchComponent.prototype.getSuggestions = function(keyword, data, config) {
  if (!keyword || keyword.length < 2) {
    return [];
  }
  
  var searchConfig = config || {};
  var maxSuggestions = searchConfig.maxSuggestions || 10;
  var suggestionFields = searchConfig.suggestionFields || ['name', 'title'];
  
  var suggestions = [];
  var addedSuggestions = {};
  
  for (var i = 0; i < data.length && suggestions.length < maxSuggestions; i++) {
    var item = data[i];
    
    for (var j = 0; j < suggestionFields.length; j++) {
      var field = suggestionFields[j];
      var value = this.getFieldValue(item, field);
      
      if (value && value.toLowerCase().indexOf(keyword.toLowerCase()) === 0) {
        if (!addedSuggestions[value]) {
          suggestions.push(value);
          addedSuggestions[value] = true;
        }
      }
    }
  }
  
  return suggestions;
};

/**
 * 清除缓存
 */
SearchComponent.prototype.clearCache = function() {
  this.cache = {};
  console.log('🧹 搜索缓存已清除');
};

/**
 * 获取缓存状态
 */
SearchComponent.prototype.getCacheStatus = function() {
  var cacheKeys = Object.keys(this.cache);
  return {
    total: cacheKeys.length,
    keys: cacheKeys,
    size: JSON.stringify(this.cache).length
  };
};

/**
 * 工厂方法：创建搜索实例
 */
function createSearchComponent(options) {
  return new SearchComponent(options);
}

/**
 * 快速搜索方法（静态方法）
 */
function quickSearch(keyword, data, searchFields) {
  var searchComponent = new SearchComponent();
  return searchComponent.search(keyword, data, {
    searchFields: searchFields || ['name', 'title', 'description']
  });
}

// 导出
module.exports = {
  SearchComponent: SearchComponent,
  createSearchComponent: createSearchComponent,
  quickSearch: quickSearch
};