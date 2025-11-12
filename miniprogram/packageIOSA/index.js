// IOSA审计页面 - 参考事件调查页面样式
var BasePage = require('../utils/base-page.js');

var pageConfig = {
  data: {
    // 定义数据
    allDefinitions: [],
    displayedDefinitions: [],
    filteredDefinitions: [],

    // 搜索相关
    searchValue: '',
    searchPlaceholder: '搜索IOSA术语、定义内容...',

    // 分类相关
    activeTab: '全部',
    categoryList: [],

    // 分页相关
    pageSize: 15,
    hasMore: true,
    isLoadingMore: false,

    // 统计信息
    totalCount: 0,
    filteredCount: 0,

    // 弹窗相关
    showDetailPopup: false,
    detailData: {},
    canGoBack: false,

    // 加载状态
    loading: true,

    // 历史记录（支持术语链接跳转）
    historyStack: []
  },
  
  customOnLoad: function(options) {
    this.loadDefinitionsData();
  },
  
  // 加载定义数据
  loadDefinitionsData: function() {
    var self = this;
    self.setData({ loading: true });

    try {
      var definitionsModule = require('./IOSA.js');
      var definitions = definitionsModule || [];

      // 统计各分类数量
      var categoryMap = {
        '全部': { title: '全部', name: '全部', count: definitions.length },
        'A-D': { title: 'A-D', name: 'A-D', count: 0 },
        'E-H': { title: 'E-H', name: 'E-H', count: 0 },
        'I-L': { title: 'I-L', name: 'I-L', count: 0 },
        'M-P': { title: 'M-P', name: 'M-P', count: 0 },
        'Q-T': { title: 'Q-T', name: 'Q-T', count: 0 },
        'U-Z': { title: 'U-Z', name: 'U-Z', count: 0 }
      };

      // 统计每个分类的术语数量
      definitions.forEach(function(item) {
        // 添加空值检查
        if (!item.english_name) {
          console.warn('⚠️ IOSA术语缺少英文名称，跳过分类:', item.chinese_name || item.id);
          return;
        }

        var firstLetter = self.getFirstLetter(item.english_name);
        var category = self.getLetterCategory(firstLetter);
        if (categoryMap[category]) {
          categoryMap[category].count++;
        }
      });

      var categoryList = Object.values(categoryMap);

      self.setData({
        allDefinitions: definitions,
        filteredDefinitions: definitions,
        categoryList: categoryList,
        totalCount: definitions.length,
        filteredCount: definitions.length,
        loading: false
      });

      // 初始化显示数据
      self.loadInitialData();

    } catch (error) {
      console.error('❌ IOSA审计数据加载失败:', error);
      self.handleError(error, 'IOSA审计数据加载失败');

      self.setData({
        allDefinitions: [],
        filteredDefinitions: [],
        categoryList: [],
        totalCount: 0,
        filteredCount: 0,
        displayedDefinitions: [],
        hasMore: false,
        loading: false
      });
    }
  },
  
  // 初始化显示数据
  loadInitialData: function() {
    var pageSize = this.data.pageSize;
    var filteredDefinitions = this.data.filteredDefinitions;
    
    var displayedDefinitions = filteredDefinitions.slice(0, pageSize);
    var hasMore = filteredDefinitions.length > pageSize;
    
    this.setData({
      displayedDefinitions: displayedDefinitions,
      hasMore: hasMore
    });
  },
  
  // 搜索变化处理
  onSearchChange: function(e) {
    var searchValue = e.detail.trim();
    this.setData({ searchValue: searchValue });

    // 实时搜索
    this.performSearch();
  },

  // 清空搜索
  onSearchClear: function() {
    this.setData({ searchValue: '' });
    this.performSearch();
  },

  // 选项卡切换
  onTabChange: function(e) {
    var activeTab = e.currentTarget.dataset.name || e.detail.name;

    this.setData({
      activeTab: activeTab,
      searchValue: ''
    });

    this.updateSearchPlaceholder();
    this.filterByTab(activeTab);
  },

  // 更新搜索提示
  updateSearchPlaceholder: function() {
    var activeTab = this.data.activeTab;
    var placeholder = '';

    if (activeTab === '全部') {
      placeholder = '搜索IOSA术语、定义内容...';
    } else {
      placeholder = '在 ' + activeTab + ' 范围内搜索...';
    }

    this.setData({
      searchPlaceholder: placeholder
    });
  },

  // 根据标签过滤数据
  filterByTab: function(tab) {
    var self = this;
    var filteredData = this.data.allDefinitions;

    if (tab !== '全部') {
      filteredData = this.data.allDefinitions.filter(function(item) {
        // 添加空值检查
        if (!item.english_name) {
          return false;
        }

        var firstLetter = self.getFirstLetter(item.english_name);
        var category = self.getLetterCategory(firstLetter);
        return category === tab;
      });
    }

    this.setData({
      filteredDefinitions: filteredData,
      filteredCount: filteredData.length
    });

    // 重新加载显示数据
    this.loadInitialData();
  },

  // 获取英文名称的首字母
  getFirstLetter: function(englishName) {
    if (!englishName || englishName.length === 0) {
      return '';
    }
    return englishName.charAt(0).toUpperCase();
  },

  // 根据首字母获取分类
  getLetterCategory: function(letter) {
    if (letter >= 'A' && letter <= 'D') {
      return 'A-D';
    } else if (letter >= 'E' && letter <= 'H') {
      return 'E-H';
    } else if (letter >= 'I' && letter <= 'L') {
      return 'I-L';
    } else if (letter >= 'M' && letter <= 'P') {
      return 'M-P';
    } else if (letter >= 'Q' && letter <= 'T') {
      return 'Q-T';
    } else if (letter >= 'U' && letter <= 'Z') {
      return 'U-Z';
    }
    return '全部';
  },
  
  // 执行搜索
  performSearch: function() {
    var searchValue = this.data.searchValue.trim();
    var activeTab = this.data.activeTab;
    var allDefinitions = this.data.allDefinitions;
    var filteredDefinitions;

    // 先按分类过滤
    var baseData = allDefinitions;
    if (activeTab !== '全部') {
      var self = this;
      baseData = allDefinitions.filter(function(item) {
        // 添加空值检查
        if (!item.english_name) {
          return false;
        }

        var firstLetter = self.getFirstLetter(item.english_name);
        var category = self.getLetterCategory(firstLetter);
        return category === activeTab;
      });
    }

    // 再按搜索关键词过滤
    if (!searchValue) {
      filteredDefinitions = baseData;
    } else {
      var lowerSearchValue = searchValue.toLowerCase();
      filteredDefinitions = baseData.filter(function(item) {
        return (item.chinese_name && item.chinese_name.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
               (item.english_name && item.english_name.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
               (item.definition && item.definition.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
               (item.equivalent_terms && item.equivalent_terms.toLowerCase().indexOf(lowerSearchValue) !== -1);
      });
    }

    this.setData({
      filteredDefinitions: filteredDefinitions,
      filteredCount: filteredDefinitions.length
    });

    // 重新加载显示数据
    this.loadInitialData();
  },
  
  // 加载更多
  loadMore: function() {
    if (this.data.isLoadingMore || !this.data.hasMore) {
      return;
    }

    this.setData({ isLoadingMore: true });

    var self = this;
    setTimeout(function() {
      var currentDisplayed = self.data.displayedDefinitions;
      var filteredDefinitions = self.data.filteredDefinitions;
      var pageSize = self.data.pageSize;

      var nextBatch = filteredDefinitions.slice(
        currentDisplayed.length,
        currentDisplayed.length + pageSize
      );

      var newDisplayed = currentDisplayed.concat(nextBatch);
      var hasMore = newDisplayed.length < filteredDefinitions.length;

      self.setData({
        displayedDefinitions: newDisplayed,
        hasMore: hasMore,
        isLoadingMore: false
      });
    }, 500);
  },
  
  // 查看术语详情
  viewDefinitionDetail: function(e) {
    var item = e.currentTarget.dataset.item;
    if (!item) {
      return;
    }
    
    console.log('首次显示术语详情:', item.chinese_name);
    
    // 处理等效术语，将字符串转换为可点击的术语数组
    var processedItem = this.processTermForDisplay(item);
    
    console.log('处理后的数据:', {
      chinese_name: processedItem.chinese_name,
      has_equivalent_terms: processedItem.has_equivalent_terms,
      equivalent_terms_array: processedItem.equivalent_terms_array,
      see_also_array: processedItem.see_also_array,
      source: processedItem.source,
      source_type: typeof processedItem.source,
      source_length: processedItem.source ? processedItem.source.length : 0
    });
    
    // 清空历史记录，开始新的浏览
    this.setData({
      showDetailPopup: true,
      detailData: processedItem,
      canGoBack: false,
      historyStack: []
    }, function() {
      console.log('首次显示详情数据设置完成');
    });
  },
  
  // 处理术语显示数据，解析等效术语为可点击链接
  processTermForDisplay: function(item) {
    var processedItem = Object.assign({}, item);
    
    // 处理等效术语字符串，分割为数组用于显示链接
    if (processedItem.equivalent_terms && processedItem.equivalent_terms.trim()) {
      var equivalentTerms = processedItem.equivalent_terms.split(',');
      var equivalentTermsArray = [];
      
      for (var i = 0; i < equivalentTerms.length; i++) {
        var term = equivalentTerms[i].trim();
        if (term) {
          equivalentTermsArray.push(term);
        }
      }
      
      if (equivalentTermsArray.length > 0) {
        processedItem.equivalent_terms_array = equivalentTermsArray;
      }
      
      // 确保有等效术语标识
      processedItem.has_equivalent_terms = true;
      
      // Debug日志 - 检查等效术语处理
      if (processedItem.chinese_name && (processedItem.chinese_name.includes('事故数据交换') || 
          processedItem.chinese_name.includes('ADX') || processedItem.chinese_name.includes('近地警告系统') ||
          processedItem.chinese_name.includes('GPWS'))) {
        console.log('等效术语处理调试:', {
          chinese_name: processedItem.chinese_name,
          equivalent_terms: '"' + processedItem.equivalent_terms + '"',
          equivalent_terms_length: processedItem.equivalent_terms ? processedItem.equivalent_terms.length : 0,
          equivalent_terms_array: equivalentTermsArray,
          has_equivalent_terms: true
        });
      }
    } else {
      processedItem.has_equivalent_terms = false;
      
      // Debug日志 - 检查空等效术语情况
      if (processedItem.chinese_name && (processedItem.chinese_name.includes('事故数据交换') || 
          processedItem.chinese_name.includes('ADX'))) {
        console.log('空等效术语调试:', {
          chinese_name: processedItem.chinese_name,
          equivalent_terms: processedItem.equivalent_terms,
          has_equivalent_terms: false,
          equivalent_terms_type: typeof processedItem.equivalent_terms
        });
      }
    }
    
    // 确保see_also_array被正确传递，如果没有则从see_also生成
    if (!processedItem.see_also_array || processedItem.see_also_array.length === 0) {
      if (processedItem.see_also && processedItem.see_also.trim()) {
        var seeAlsoTerms = processedItem.see_also.split(',');
        var seeAlsoArray = [];
        
        for (var j = 0; j < seeAlsoTerms.length; j++) {
          var term = seeAlsoTerms[j].trim();
          if (term) {
            seeAlsoArray.push(term);
          }
        }
        
        if (seeAlsoArray.length > 0) {
          processedItem.see_also_array = seeAlsoArray;
        }
      }
    }
    
    // Debug日志 - 检查参见术语处理
    if (processedItem.chinese_name && (processedItem.chinese_name.includes('地形感知和警告系统') || 
        processedItem.chinese_name.includes('TAWS') || processedItem.chinese_name.includes('增强型近地警告系统'))) {
      console.log('参见术语处理调试:', {
        chinese_name: processedItem.chinese_name,
        see_also: processedItem.see_also,
        see_also_array: processedItem.see_also_array,
        see_also_array_length: processedItem.see_also_array ? processedItem.see_also_array.length : 0
      });
    }
    
    return processedItem;
  },
  
  // 术语链接点击
  onTermClick: function(e) {
    var targetTerm = e.currentTarget.dataset.term;
    console.log('点击术语:', targetTerm);
    
    if (!targetTerm) {
      console.log('错误: 未获取到术语数据');
      return;
    }
    
    // 在当前数据中查找目标术语
    var allDefinitions = this.data.allDefinitions;
    var targetDefinition = this.findTermByName(targetTerm, allDefinitions);
    
    if (targetDefinition) {
      console.log('找到匹配术语:', targetDefinition.chinese_name);
      
      // 将当前术语推入历史栈
      var currentHistory = this.data.historyStack || [];
      var currentDetail = this.data.detailData;
      
      currentHistory.push(currentDetail);
      
      // 处理目标术语的显示数据
      var processedTargetDefinition = this.processTermForDisplay(targetDefinition);
      
      // 显示目标术语
      var self = this;
      self.setData({
        detailData: processedTargetDefinition,
        historyStack: currentHistory,
        canGoBack: true
      }, function() {
        console.log('术语跳转成功，页面已更新为:', processedTargetDefinition.chinese_name);
      });
    } else {
      console.log('术语跳转失败，未找到匹配:', targetTerm);
      this.showError('未找到术语：' + targetTerm);
    }
  },
  
  // 查找术语 - 优化匹配逻辑，避免循环跳转
  findTermByName: function(termName, definitions) {
    // 清理术语名称，移除多余空格和括号内容
    var cleanTermName = termName.trim();
    var currentTerm = this.data.detailData; // 获取当前显示的术语，避免自我匹配
    
    // 特殊术语映射表 - 处理数据中的描述性长名称
    var termMapping = {
      'Ground Proximity Warning System with a Forward Looking Terrain Avoidance Function': 'Ground Proximity Warning System (GPWS)',
      'Ground Proximity Warning System (GPWS) with a Forward Looking Terrain Avoidance Function': 'Ground Proximity Warning System (GPWS)'
    };
    
    // 检查是否有特殊映射
    if (termMapping[cleanTermName]) {
      cleanTermName = termMapping[cleanTermName];
      console.log('术语映射:', termName, '->', cleanTermName);
    }
    
    // 匹配结果数组，用于优先级排序
    var exactMatches = [];       // 精确匹配
    var englishMatches = [];     // 英文名称匹配
    var abbreviationMatches = []; // 缩写匹配（英文名称包含括号中的缩写）
    var equivalentMatches = [];   // 等效术语匹配
    var fuzzyMatches = [];        // 模糊匹配
    
    for (var i = 0; i < definitions.length; i++) {
      var definition = definitions[i];
      
      // 跳过当前正在显示的术语，避免循环跳转
      if (currentTerm && currentTerm.chinese_name === definition.chinese_name && 
          currentTerm.english_name === definition.english_name) {
        continue;
      }
      
      // 1. 精确匹配（最高优先级）
      if (definition.english_name === cleanTermName || 
          definition.chinese_name === cleanTermName) {
        exactMatches.push(definition);
        continue;
      }
      
      // 2. 缩写匹配 - 检查英文名称是否包含括号中的缩写
      if (definition.english_name && definition.english_name.indexOf('(') !== -1) {
        var acronym = definition.english_name.match(/\(([^)]+)\)/);
        if (acronym && acronym[1] === cleanTermName) {
          abbreviationMatches.push(definition);
          continue;
        }
      }
      
      // 3. 英文名称包含匹配
      if (definition.english_name && definition.english_name.toLowerCase().indexOf(cleanTermName.toLowerCase()) !== -1) {
        englishMatches.push(definition);
        continue;
      }
      
      // 4. equivalent_terms字符串包含匹配
      if (definition.equivalent_terms && 
          definition.equivalent_terms.toLowerCase().indexOf(cleanTermName.toLowerCase()) !== -1) {
        equivalentMatches.push(definition);
        continue;
      }
      
      // 5. 反向匹配 - 如果搜索词包含括号，提取主要部分
      if (cleanTermName.indexOf('(') !== -1) {
        var mainTerm = cleanTermName.split('(')[0].trim();
        if (definition.english_name && definition.english_name.toLowerCase().indexOf(mainTerm.toLowerCase()) !== -1) {
          fuzzyMatches.push(definition);
        }
      }
    }
    
    // 按优先级返回匹配结果
    if (exactMatches.length > 0) {
      console.log('找到精确匹配:', exactMatches[0].chinese_name);
      return exactMatches[0];
    }
    
    if (abbreviationMatches.length > 0) {
      console.log('找到缩写匹配:', abbreviationMatches[0].chinese_name);
      return abbreviationMatches[0];
    }
    
    if (englishMatches.length > 0) {
      console.log('找到英文名称匹配:', englishMatches[0].chinese_name);
      return englishMatches[0];
    }
    
    if (equivalentMatches.length > 0) {
      // 对等效术语匹配进行过滤，排除当前术语
      for (var j = 0; j < equivalentMatches.length; j++) {
        var match = equivalentMatches[j];
        if (!currentTerm || match.chinese_name !== currentTerm.chinese_name) {
          console.log('找到等效术语匹配:', match.chinese_name);
          return match;
        }
      }
    }
    
    if (fuzzyMatches.length > 0) {
      console.log('找到模糊匹配:', fuzzyMatches[0].chinese_name);
      return fuzzyMatches[0];
    }
    
    // 调试日志
    console.log('未找到术语匹配:', cleanTermName, '(已排除当前术语:', currentTerm ? currentTerm.chinese_name : 'none', ')');
    return null;
  },
  
  // 返回历史记录
  goBackInHistory: function() {
    var historyStack = this.data.historyStack;
    if (historyStack.length > 0) {
      var previousTerm = historyStack.pop();
      
      this.setData({
        detailData: previousTerm,
        historyStack: historyStack,
        canGoBack: historyStack.length > 0
      });
    }
  },
  
  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      detailData: {},
      canGoBack: false,
      historyStack: []
    });
  },
  
  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadDefinitionsData();
    wx.stopPullDownRefresh();
    this.showSuccess('数据刷新成功');
  }
};

Page(BasePage.createPage(pageConfig));