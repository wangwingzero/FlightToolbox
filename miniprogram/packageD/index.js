// 权威定义页面
var BasePage = require('../utils/base-page.js');

var pageConfig = {
  data: {
    // 定义数据
    allDefinitions: [],
    displayedDefinitions: [],

    // 搜索相关
    searchValue: '',
    searchFocused: false,

    // 分类筛选相关
    selectedCategory: 'all', // 当前选中的分类
    categoryList: [],        // 分类列表

    // 分页相关
    currentPage: 1,
    pageSize: 20,
    hasMore: true,

    // 统计信息
    totalCount: 0,
    filteredCount: 0,

    // 浮窗相关
    showModal: false,
    selectedDefinition: {},

    // 浏览历史功能
    viewHistory: [], // 浏览历史栈
    canGoBack: false // 是否可以返回
  },
  
  customOnLoad: function(options) {
    this.loadDefinitionsData();
  },
  
  // 加载定义数据
  loadDefinitionsData: function() {
    var self = this;
    try {
      // 加载多个定义文件
      var allDefinitions = [];
      
      // 加载基础定义文件
      try {
        var definitionsModule = require('./definitions.js');
        if (definitionsModule && Array.isArray(definitionsModule)) {
          allDefinitions = allDefinitions.concat(definitionsModule);
        }
      } catch (error) {
        console.warn('⚠️ definitions.js 加载失败:', error);
      }
      
      // 加载AC-91-FS-2020-016R1定义文件
      try {
        var ac91Module = require('./AC-91-FS-2020-016R1.js');
        if (ac91Module && Array.isArray(ac91Module)) {
          allDefinitions = allDefinitions.concat(ac91Module);
        }
      } catch (error) {
        console.warn('⚠️ AC-91-FS-2020-016R1.js 加载失败:', error);
      }
      
      // 加载AC-121-FS-33R1定义文件
      try {
        var ac121Module = require('./AC-121-FS-33R1.js');
        if (ac121Module && Array.isArray(ac121Module)) {
          allDefinitions = allDefinitions.concat(ac121Module);
        }
      } catch (error) {
        console.warn('⚠️ AC-121-FS-33R1.js 加载失败:', error);
      }

      // 加载AC-121-FS-41R1定义文件（CRM训练）
      try {
        var ac121fs41Module = require('./AC-121-FS-41R1.js');
        if (ac121fs41Module && Array.isArray(ac121fs41Module)) {
          allDefinitions = allDefinitions.concat(ac121fs41Module);
        }
      } catch (error) {
        console.warn('⚠️ AC-121-FS-41R1.js 加载失败:', error);
      }
      
      // 加载CCAR-121-R8定义文件
      try {
        var ccar121Module = require('./CCAR-121-R8.js');
        if (ccar121Module && Array.isArray(ccar121Module)) {
          allDefinitions = allDefinitions.concat(ccar121Module);
        }
      } catch (error) {
        console.warn('⚠️ CCAR-121-R8.js 加载失败:', error);
      }
      
      // 加载AC-91-FS-001R2定义文件
      try {
        var ac91fs001Module = require('./AC-91-FS-001R2.js');
        if (ac91fs001Module && Array.isArray(ac91fs001Module)) {
          allDefinitions = allDefinitions.concat(ac91fs001Module);
        }
      } catch (error) {
        console.warn('⚠️ AC-91-FS-001R2.js 加载失败:', error);
      }

      // 加载AC-121-50R2定义文件（地面结冰条件下的运行）
      try {
        var ac12150r2Module = require('./AC-121-50R2.js');
        if (ac12150r2Module && Array.isArray(ac12150r2Module)) {
          allDefinitions = allDefinitions.concat(ac12150r2Module);
        }
      } catch (error) {
        console.warn('⚠️ AC-121-50R2.js 加载失败:', error);
      }

      console.log('✅ 成功加载定义数据:', allDefinitions.length + '条');

      // 初始化分类列表并统计数量
      var categoryList = self.initializeCategoryList(allDefinitions);

      self.setData({
        allDefinitions: allDefinitions,
        totalCount: allDefinitions.length,
        filteredCount: allDefinitions.length,
        categoryList: categoryList
      });

      // 构建术语映射缓存（性能优化）
      self.buildTermNameMap(allDefinitions);

      // 初始化第一页数据
      self.loadPageData();
      
    } catch (error) {
      console.error('❌ 权威定义数据加载失败:', error);
      self.handleError(error, '权威定义数据加载失败');
      
      // 设置默认空数据
      self.setData({
        allDefinitions: [],
        totalCount: 0,
        filteredCount: 0,
        displayedDefinitions: [],
        hasMore: false
      });
    }
  },
  
  // 获取数据项的分类
  getCategoryForItem: function(item) {
    var source = item.source || '';

    if (source.indexOf('CCAR') !== -1) {
      return 'ccar';
    } else if (source.indexOf('AC-') !== -1 || source.indexOf('AC ') !== -1) {
      return 'ac';
    } else if (source.indexOf('《国际民用航空公约》') !== -1 || source.indexOf('ICAO') !== -1) {
      return 'icao';
    } else if ((source.indexOf('法') !== -1 || source.indexOf('条例') !== -1 || source.indexOf('规定》') !== -1) && source.indexOf('CCAR') === -1) {
      return 'law';
    } else if (source.indexOf('标准') !== -1 || source.indexOf('规范') !== -1) {
      return 'standard';
    } else {
      return 'other';
    }
  },

  // 构建术语映射缓存（性能优化）
  buildTermNameMap: function(allDefinitions) {
    var self = this;

    // 创建术语中文名称到完整定义的映射
    self._termNameMap = {};
    allDefinitions.forEach(function(def) {
      if (def.chinese_name) {
        self._termNameMap[def.chinese_name] = def;
      }
    });

    // 按长度排序术语，优先匹配长的术语（只排序一次）
    self._sortedTerms = Object.keys(self._termNameMap).sort(function(a, b) {
      return b.length - a.length;
    });

    console.log('✅ 术语映射缓存构建完成:', self._sortedTerms.length + '个术语');
  },

  // 初始化分类列表并统计数量
  initializeCategoryList: function(allDefinitions) {
    var categoryCounts = {
      'all': allDefinitions.length,
      'ccar': 0,
      'ac': 0,
      'icao': 0,
      'law': 0,
      'standard': 0,
      'other': 0
    };

    // 统计每个分类的数量
    var self = this;
    allDefinitions.forEach(function(item) {
      var category = self.getCategoryForItem(item);
      categoryCounts[category]++;
    });

    // 构建分类列表
    return [
      { id: 'all', name: '全部', count: categoryCounts.all },
      { id: 'ccar', name: 'CCAR规章', count: categoryCounts.ccar },
      { id: 'ac', name: 'AC咨询通告', count: categoryCounts.ac },
      { id: 'icao', name: 'ICAO附件', count: categoryCounts.icao },
      { id: 'law', name: '法律法规', count: categoryCounts.law },
      { id: 'standard', name: '标准规范', count: categoryCounts.standard },
      { id: 'other', name: '其他', count: categoryCounts.other }
    ];
  },

  // 分类点击事件
  onCategoryTap: function(e) {
    var category = e.currentTarget.dataset.category;
    if (category === this.data.selectedCategory) {
      return; // 点击当前分类，不做处理
    }

    this.setData({
      selectedCategory: category,
      currentPage: 1,
      displayedDefinitions: []
    });

    // 执行筛选
    this.performSearch();
  },

  // 加载分页数据
  loadPageData: function() {
    var currentPage = this.data.currentPage;
    var pageSize = this.data.pageSize;
    var currentData = this.getCurrentData();
    var displayedDefinitions = this.data.displayedDefinitions;
    
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, currentData.length);
    
    var newData = currentData.slice(startIndex, endIndex);
    var updatedDisplayed = currentPage === 1 ? newData : displayedDefinitions.concat(newData);
    
    var hasMore = endIndex < currentData.length;
    
    this.setData({
      displayedDefinitions: updatedDisplayed,
      hasMore: hasMore
    });
    
  },
  
  // 获取当前应该显示的数据（考虑搜索状态和分类筛选）
  getCurrentData: function() {
    var allData = this.data.allDefinitions;
    var selectedCategory = this.data.selectedCategory;
    var searchValue = this.data.searchValue.trim();

    // 第一步：根据分类筛选
    var categoryFiltered = allData;
    if (selectedCategory && selectedCategory !== 'all') {
      var self = this;
      categoryFiltered = allData.filter(function(item) {
        return self.getCategoryForItem(item) === selectedCategory;
      });
    }

    // 第二步：如果没有搜索关键词，直接返回分类筛选后的数据
    if (!searchValue) {
      return categoryFiltered;
    }

    // 第三步：在分类筛选结果的基础上执行搜索过滤和排序
    var lowerSearchValue = searchValue.toLowerCase();

    // 先过滤出匹配的结果
    var filteredResults = categoryFiltered.filter(function(item) {
      return (item.chinese_name && item.chinese_name.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
             (item.english_name && item.english_name.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
             (item.definition && item.definition.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
             (item.source && item.source.toLowerCase().indexOf(lowerSearchValue) !== -1);
    });

    // 按相关性排序：标题匹配优先于内容匹配
    filteredResults.sort(function(a, b) {
      // 计算优先级分数（分数越小越靠前）
      var scoreA = getMatchScore(a);
      var scoreB = getMatchScore(b);

      return scoreA - scoreB;
    });

    // 计算匹配优先级分数
    function getMatchScore(item) {
      var chineseName = item.chinese_name ? item.chinese_name.toLowerCase() : '';
      var englishName = item.english_name ? item.english_name.toLowerCase() : '';
      var definition = item.definition ? item.definition.toLowerCase() : '';
      var source = item.source ? item.source.toLowerCase() : '';

      // 完全匹配中文名称（优先级最高）
      if (chineseName === lowerSearchValue) {
        return 1;
      }

      // 中文名称包含搜索词（优先级第二）
      if (chineseName.indexOf(lowerSearchValue) !== -1) {
        return 2;
      }

      // 英文名称包含搜索词（优先级第三）
      if (englishName.indexOf(lowerSearchValue) !== -1) {
        return 3;
      }

      // 定义内容包含搜索词（优先级第四）
      if (definition.indexOf(lowerSearchValue) !== -1) {
        return 4;
      }

      // 来源包含搜索词（优先级最低）
      if (source.indexOf(lowerSearchValue) !== -1) {
        return 5;
      }

      // 默认
      return 6;
    }

    return filteredResults;
  },
  
  // 搜索输入处理（实时搜索 + 防抖优化）
  onSearchInput: function(e) {
    var self = this;
    var searchValue = (e.detail.value || '').trim();

    // 更新搜索值（立即）
    this.setData({
      searchValue: searchValue
    });

    // 清除之前的防抖定时器
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // 防抖执行搜索（延迟300ms）
    this.searchDebounceTimer = setTimeout(function() {
      self.setData({
        currentPage: 1,
        displayedDefinitions: []
      });
      self.performSearch();
    }, 300);
  },
  
  // 执行搜索
  performSearch: function() {
    var currentData = this.getCurrentData();
    
    this.setData({
      filteredCount: currentData.length,
      currentPage: 1,
      displayedDefinitions: []
    });
    
    // 重新加载第一页数据
    this.loadPageData();
    
  },
  
  // 清空搜索
  onSearchClear: function() {
    
    this.setData({
      searchValue: '',
      currentPage: 1,
      displayedDefinitions: []
    });
    
    // 立即执行搜索恢复全部数据
    this.performSearch();
  },
  
  // 搜索框聚焦
  onSearchFocus: function() {
    this.setData({
      searchFocused: true
    });
  },
  
  // 搜索框失焦
  onSearchBlur: function() {
    this.setData({
      searchFocused: false
    });
  },
  
  // 搜索确认
  onSearchConfirm: function(e) {
    this.performSearch();
  },
  

  
  // 菜单按钮点击
  onMenuTap: function() {
    var self = this;
    wx.showActionSheet({
      itemList: ['刷新数据', '使用说明', '反馈建议'],
      success: function(res) {
        switch(res.tapIndex) {
          case 0:
            self.onPullDownRefresh();
            break;
          case 1:
            self.showTips();
            break;
          case 2:
            self.showFeedback();
            break;
        }
      }
    });
  },
  
  // 显示使用说明
  showTips: function() {
    wx.showModal({
      title: '使用说明',
      content: '• 提供航空专业术语的权威定义查询\n• 支持中英文术语名称和定义内容搜索\n• 点击任意定义可复制完整内容到剪贴板\n• 支持离线使用，无需网络连接\n• 所有定义均来自官方权威文件',
      showCancel: false,
      confirmText: '知道了'
    });
  },
  
  // 显示反馈
  showFeedback: function() {
    wx.showModal({
      title: '反馈建议',
      content: '如有问题或建议，请通过小程序内的反馈功能联系我们。',
      showCancel: false,
      confirmText: '知道了'
    });
  },
  
  // 加载更多
  onLoadMore: function() {
    if (!this.data.hasMore) {
      return;
    }
    
    this.setData({
      currentPage: this.data.currentPage + 1
    });
    
    this.loadPageData();
  },
  
  // 点击定义项 - 显示浮窗
  onDefinitionTap: function(e) {
    var definition = e.currentTarget.dataset.definition;
    if (!definition) {
      return;
    }

    // 处理定义数据，识别其中的术语
    var processedDefinition = this.processItemForDisplay(definition);

    // 如果当前已有弹窗显示，添加到历史记录
    if (this.data.showModal) {
      this.data.viewHistory.push({
        definition: this.data.selectedDefinition
      });
    }

    this.setData({
      showModal: true,
      selectedDefinition: processedDefinition,
      canGoBack: this.data.viewHistory.length > 0
    });
  },

  // 关闭浮窗
  onModalClose: function() {
    this.setData({
      showModal: false,
      selectedDefinition: {},
      viewHistory: [], // 清空历史记录
      canGoBack: false
    });
  },

  // 返回上一个定义
  goBackInHistory: function() {
    var self = this;

    if (self.data.viewHistory.length > 0) {
      var previousView = self.data.viewHistory.pop();

      self.setData({
        selectedDefinition: previousView.definition,
        canGoBack: self.data.viewHistory.length > 0
      });
    }
  },
  
  // 阻止事件冒泡
  stopPropagation: function() {
    // 阻止点击浮窗内容时关闭浮窗
  },
  
  // 复制定义内容（点击定义内容区域触发）
  onCopyDefinitionContent: function() {
    var definition = this.data.selectedDefinition;
    if (!definition) {
      return;
    }

    // 构建复制文本
    var textToCopy = definition.chinese_name + '\n';
    if (definition.english_name) {
      textToCopy += definition.english_name + '\n\n';
    }
    textToCopy += definition.definition + '\n\n' + '来源：' + definition.source;

    var self = this;
    wx.setClipboardData({
      data: textToCopy,
      success: function() {
        self.showSuccess('定义内容已复制到剪贴板');
      },
      fail: function() {
        console.error('复制失败');
        self.showError('复制失败，请重试');
      }
    });
  },

  // 复制定义内容（已废弃，保留兼容）
  onCopyDefinition: function() {
    this.onCopyDefinitionContent();
  },

  // 智能识别内容中的术语并标记（使用缓存提升性能）
  processTermsInContent: function(content, excludeTermName) {
    if (!content) return {
      content: content,
      hasTerms: false,
      termMap: {}
    };

    var self = this;

    // 使用缓存的术语映射，避免重复构建（性能优化）
    var cachedTermNameMap = self._termNameMap || {};
    var cachedSortedTerms = self._sortedTerms || [];

    // 如果缓存不存在，返回空结果（数据未加载完成）
    if (!cachedSortedTerms.length) {
      return {
        content: content,
        hasTerms: false,
        termMap: {},
        originalContent: content
      };
    }

    var processedContent = content;
    var termMap = {};
    var hasTerms = false;

    // 查找并标记术语，避免重复标记
    var alreadyMarked = [];

    cachedSortedTerms.forEach(function(termName) {
      // 排除当前定义自身的名称
      if (excludeTermName && termName === excludeTermName) {
        return;
      }

      var termDef = cachedTermNameMap[termName];

      // 检查是否已经被较长的术语包含
      var shouldSkip = false;
      for (var i = 0; i < alreadyMarked.length; i++) {
        if (alreadyMarked[i].indexOf(termName) > -1) {
          shouldSkip = true;
          break;
        }
      }

      if (!shouldSkip && processedContent.indexOf(termName) > -1) {
        hasTerms = true;
        termMap[termName] = termDef;
        alreadyMarked.push(termName);

        // 标记术语但不使用HTML，使用特殊标记符
        var markStart = '[[TERM_START:' + termName + ']]';
        var markEnd = '[[TERM_END]]';

        // 安全的替换
        if (processedContent.indexOf(markStart) === -1 || processedContent.indexOf(termName) < processedContent.indexOf(markStart)) {
          var parts = processedContent.split(termName);
          if (parts.length > 1) {
            processedContent = parts.join(markStart + termName + markEnd);
          }
        }
      }
    });

    return {
      content: processedContent,
      hasTerms: hasTerms,
      termMap: termMap,
      originalContent: content
    };
  },

  // 解析文本并创建可点击的术语组件
  parseContentWithTerms: function(content, excludeTermName) {
    if (!content) return [];

    var termData = this.processTermsInContent(content, excludeTermName);

    if (!termData.hasTerms) {
      return [{ type: 'text', text: content }];
    }

    var parts = [];
    var processedContent = termData.content;
    var lastIndex = 0;

    // 使用正则表达式分割内容
    var termRegex = /\[\[TERM_START:(.*?)\]\](.*?)\[\[TERM_END\]\]/g;
    var match;

    while ((match = termRegex.exec(processedContent)) !== null) {
      // 添加术语前的普通文本
      if (match.index > lastIndex) {
        var beforeText = processedContent.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push({ type: 'text', text: beforeText });
        }
      }

      // 添加术语部分
      parts.push({
        type: 'term',
        text: match[2],
        termName: match[1]
      });

      lastIndex = termRegex.lastIndex;
    }

    // 添加剩余的普通文本
    if (lastIndex < processedContent.length) {
      var remainingText = processedContent.substring(lastIndex);
      if (remainingText) {
        parts.push({ type: 'text', text: remainingText });
      }
    }

    return parts;
  },

  // 处理项目数据用于显示
  processItemForDisplay: function(item) {
    if (!item) return item;

    // 创建副本避免修改原始数据
    var processedItem = JSON.parse(JSON.stringify(item));

    // 处理definition字段的术语识别，排除当前定义自身的名称
    if (processedItem.definition) {
      processedItem.definitionParts = this.parseContentWithTerms(
        processedItem.definition,
        processedItem.chinese_name
      );
    }

    return processedItem;
  },

  // 点击术语
  onTermClick: function(event) {
    var termName = event.currentTarget.dataset.term;
    var self = this;

    if (termName) {
      // 在术语定义中查找
      var foundTerm = self.data.allDefinitions.find(function(item) {
        return item.chinese_name === termName;
      });

      if (foundTerm) {
        // 处理找到的术语数据
        var processedTerm = self.processItemForDisplay(foundTerm);

        // 添加当前定义到历史记录
        self.data.viewHistory.push({
          definition: self.data.selectedDefinition
        });

        // 显示新的术语定义
        self.setData({
          selectedDefinition: processedTerm,
          canGoBack: self.data.viewHistory.length > 0
        });
      } else {
        // 如果未找到，显示提示
        wx.showToast({
          title: '未找到相关定义',
          icon: 'none',
          duration: 2000
        });
      }
    }
  },
  
  
  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadDefinitionsData();
    wx.stopPullDownRefresh();
    this.showSuccess('数据刷新成功');
  },

  // ============ 广告事件处理 ============
  // 格子广告事件
  adLoad: function(e) {
    console.log('✅ [权威定义] 格子广告加载成功', e);
  },

  adError: function(e) {
    console.warn('⚠️ [权威定义] 格子广告加载失败', e.detail);
  },

  adClose: function(e) {
    console.log('📊 [权威定义] 格子广告关闭', e);
  },

  // 横幅广告事件
  onAdLoad: function() {
    console.log('[权威定义] Banner ad loaded successfully');
  },

  onAdError: function(err) {
    console.warn('[权威定义] Banner ad load failed:', err);
    // 广告失败不影响页面功能，仅记录日志
  },
  // ====================================

  // 页面卸载时清理搜索定时器
  customOnUnload: function() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }
};

Page(BasePage.createPage(pageConfig));