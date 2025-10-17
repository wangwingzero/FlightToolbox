// 体检标准页面 - packageMedical分包
var BasePage = require('../utils/base-page.js');
var AdManager = require('../utils/ad-manager.js');

var pageConfig = {
  data: {
    medicalStandards: [],
    filteredStandards: [],
    displayedStandards: [], // 当前显示的数据
    searchKeyword: '',
    searchPlaceholder: '搜索体检标准...',
    activeTab: '全部',
    categoryList: [],

    // 分页相关
    pageSize: 10, // 每页显示数量
    currentPage: 1, // 当前页码
    hasMore: true, // 是否还有更多数据
    loading: false, // 是否正在加载
    totalCount: 0, // 总数据量

    // 弹窗相关
    showDetailPopup: false,
    selectedStandard: null,

    // 浏览历史功能
    viewHistory: [], // 浏览历史栈
    canGoBack: false, // 是否可以返回

    // 广告相关
    adClicksRemaining: 100
  },

  customOnLoad: function(options) {
    var self = this;
    // 更新广告剩余次数
    this.updateAdClicksRemaining();

    // 延迟初始化，避免tabs组件的width初始化问题
    setTimeout(function() {
      self.loadMedicalStandards();
    }, 100);
  },

  customOnShow: function() {
    // 页面显示时刷新广告计数
    this.updateAdClicksRemaining();
  },

  // 加载体检标准数据
  loadMedicalStandards: function() {
    var self = this;

    // 使用异步加载分包数据
    require('./medicalStandards.js', function(medicalData) {
      try {
        var standards = medicalData.medicalStandards || [];

        // 为每个标准添加分类简称
        standards = standards.map(function(item) {
          return Object.assign({}, item, {
            categoryShort: self.getCategoryShort(item.category)
          });
        });

        // 统计各分类数量并创建分类列表
        var categoryMap = {
          '全部': { title: '全部', name: '全部', count: standards.length },
          '一般条件': { title: '一般条件', name: '一般条件', count: 0 },
          '精神科': { title: '精神科', name: '精神科', count: 0 },
          '内科': { title: '内科', name: '内科', count: 0 },
          '外科': { title: '外科', name: '外科', count: 0 },
          '耳鼻咽喉及口腔科': { title: '耳鼻咽喉及口腔科', name: '耳鼻咽喉及口腔科', count: 0 },
          '眼科': { title: '眼科', name: '眼科', count: 0 }
        };

        standards.forEach(function(item) {
          if (categoryMap[item.category]) {
            categoryMap[item.category].count++;
          }
        });

        var categoryList = Object.values(categoryMap);

        self.setData({
          medicalStandards: standards,
          filteredStandards: standards,
          categoryList: categoryList,
          totalCount: standards.length
        });

        // 初始化分页显示
        self.updateDisplayedStandards();

        // 更新搜索提示
        self.updateSearchPlaceholder();
      } catch (error) {
        console.error('❌ 加载体检标准数据失败：', error);
        self.handleError(error, '数据加载失败');
      }
    }, function(error) {
      console.error('❌ 加载体检标准数据模块失败：', error);
      self.handleError(error, '数据模块加载失败');
    });
  },

  // 更新显示的数据（分页逻辑）
  updateDisplayedStandards: function() {
    var filteredStandards = this.data.filteredStandards;
    var pageSize = this.data.pageSize;
    var currentPage = this.data.currentPage;

    // 计算应该显示的数据
    var endIndex = currentPage * pageSize;
    var displayedStandards = filteredStandards.slice(0, endIndex);
    var hasMore = endIndex < filteredStandards.length;

    this.setData({
      displayedStandards: displayedStandards,
      hasMore: hasMore,
      loading: false
    });
  },

  // 加载更多数据
  loadMoreStandards: function() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }

    var self = this;
    this.setData({
      loading: true,
      currentPage: this.data.currentPage + 1
    });

    // 延迟更新，模拟加载过程
    setTimeout(function() {
      self.updateDisplayedStandards();
    }, 300);
  },

  // 重置分页状态
  resetPagination: function() {
    this.setData({
      currentPage: 1,
      hasMore: true,
      loading: false
    });
  },

  // 更新搜索提示
  updateSearchPlaceholder: function() {
    var activeTab = this.data.activeTab;
    var placeholder = '';

    if (activeTab === '全部') {
      placeholder = '搜索体检标准...';
    } else {
      placeholder = '搜索' + activeTab + '标准...';
    }

    this.setData({
      searchPlaceholder: placeholder
    });
  },

  // 选项卡切换
  onTabChange: function(e) {
    var activeTab = e.currentTarget.dataset.name || e.detail.name;

    this.setData({
      activeTab: activeTab,
      searchKeyword: ''
    });

    this.updateSearchPlaceholder();
    this.filterByTab(activeTab);
  },

  // 获取分类显示名称 - 直接返回完整分类名
  getCategoryShort: function(category) {
    // 直接返回完整分类名称，不再使用简称
    return category;
  },

  // 根据标签过滤数据
  filterByTab: function(tab) {
    var filteredData = this.data.medicalStandards;

    if (tab !== '全部') {
      filteredData = this.data.medicalStandards.filter(function(item) {
        return item.category === tab;
      });
    }

    this.setData({
      filteredStandards: filteredData
    });

    // 重置分页并更新显示
    this.resetPagination();
    this.updateDisplayedStandards();
  },

  // 实时搜索功能 - P3-01: 添加300ms防抖
  onSearchChange: function(e) {
    var self = this;
    var searchValue = e.detail || '';

    this.setData({
      searchKeyword: searchValue
    });

    // 清除之前的防抖定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }

    // 重置分页状态
    this.resetPagination();

    // 设置新的防抖定时器（300ms）
    if (searchValue.trim() === '') {
      // 空搜索立即执行
      this.filterByTab(this.data.activeTab);
    } else {
      // 非空搜索使用防抖
      this.searchTimer = setTimeout(function() {
        self.performSearch();
      }, 300);
    }
  },

  // 清空搜索
  onSearchClear: function() {
    this.setData({
      searchKeyword: ''
    });
    this.resetPagination();
    this.filterByTab(this.data.activeTab);
  },

  // 执行搜索
  performSearch: function() {
    var searchValue = this.data.searchKeyword.toLowerCase().trim();
    var activeTab = this.data.activeTab;
    var baseData = this.data.medicalStandards;

    // 先按标签过滤
    if (activeTab !== '全部') {
      baseData = this.data.medicalStandards.filter(function(item) {
        return item.category === activeTab;
      });
    }

    // 再按搜索关键词过滤
    var filteredData = baseData;
    if (searchValue) {
      filteredData = baseData.filter(function(item) {
        // 搜索基本信息
        var matchBasic = (item.name_zh && item.name_zh.toLowerCase().includes(searchValue)) ||
                        (item.name_en && item.name_en.toLowerCase().includes(searchValue)) ||
                        (item.category && item.category.toLowerCase().includes(searchValue)) ||
                        (item.id && item.id.toLowerCase().includes(searchValue));

        if (matchBasic) return true;

        // 搜索评定标准 - 处理对象格式
        if (item.standard && !Array.isArray(item.standard)) {
          var matchAssessment = item.standard.assessment &&
                               item.standard.assessment.toLowerCase().includes(searchValue);
          var matchConditions = item.standard.conditions &&
                               item.standard.conditions.some(function(condition) {
                                 return condition.toLowerCase().includes(searchValue);
                               });
          var matchNotes = item.standard.notes &&
                          item.standard.notes.toLowerCase().includes(searchValue);

          if (matchAssessment || matchConditions || matchNotes) return true;
        }

        // 搜索评定标准 - 处理数组格式
        if (item.standard && Array.isArray(item.standard)) {
          var matchArray = item.standard.some(function(std) {
            var matchStdAssessment = std.assessment &&
                                    std.assessment.toLowerCase().includes(searchValue);
            var matchStdConditions = std.conditions &&
                                    std.conditions.some(function(condition) {
                                      return condition.toLowerCase().includes(searchValue);
                                    });
            var matchStdNotes = std.notes &&
                               std.notes.toLowerCase().includes(searchValue);

            return matchStdAssessment || matchStdConditions || matchStdNotes;
          });

          if (matchArray) return true;
        }

        return false;
      });
    }

    this.setData({
      filteredStandards: filteredData
    });

    // 更新分页显示
    this.updateDisplayedStandards();
  },

  // 显示详情弹窗
  showStandardDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayedStandards[index];

    if (!item) {
      wx.showToast({
        title: '标准数据获取失败',
        icon: 'none'
      });
      return;
    }

    // 清除术语缓存，确保排除当前标准
    this._cachedTerms = null;

    // 先设置selectedStandard，使getMedicalTerms能获取正确的currentStandardId
    this.setData({
      selectedStandard: item
    });

    // 为每个评定结果添加样式类和术语链接
    var processedItem = this.processStandardItem(item);

    this.setData({
      selectedStandard: processedItem,
      showDetailPopup: true
    });
  },

  // 处理标准项目，为评定结果添加样式类
  processStandardItem: function(item) {
    var self = this;
    var processed = Object.assign({}, item);

    // 处理数组格式的standard
    if (processed.standard && Array.isArray(processed.standard)) {
      processed.standard = processed.standard.map(function(stdItem) {
        var processedStdItem = Object.assign({}, stdItem, {
          badgeClass: self.getAssessmentBadgeClass(stdItem.assessment)
        });

        // 处理条件文本，添加术语链接
        if (processedStdItem.conditions && processedStdItem.conditions.length > 0) {
          processedStdItem.processedConditions = processedStdItem.conditions.map(function(condition) {
            return self.processConditionText(condition);
          });
        }

        return processedStdItem;
      });
    }
    // 处理对象格式的standard
    else if (processed.standard && processed.standard.assessment) {
      processed.standard = Object.assign({}, processed.standard, {
        badgeClass: self.getAssessmentBadgeClass(processed.standard.assessment)
      });

      // 处理条件文本，添加术语链接
      if (processed.standard.conditions && processed.standard.conditions.length > 0) {
        processed.standard.processedConditions = processed.standard.conditions.map(function(condition) {
          return self.processConditionText(condition);
        });
      }
    }

    return processed;
  },

  // 处理条件文本，识别并标记医学术语
  processConditionText: function(text) {
    if (!text) return { segments: [] };

    // 获取所有医学术语（从数据中提取）
    var terms = this.getMedicalTerms();

    var segments = [];
    var remaining = text;
    var processedIndices = new Set();

    // 查找所有术语位置
    var matches = [];
    terms.forEach(function(term) {
      var index = 0;
      while ((index = remaining.indexOf(term, index)) !== -1) {
        // 检查是否与已匹配的区域重叠
        var overlaps = false;
        for (var i = index; i < index + term.length; i++) {
          if (processedIndices.has(i)) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          matches.push({
            term: term,
            start: index,
            end: index + term.length
          });

          // 标记已处理的索引
          for (var i = index; i < index + term.length; i++) {
            processedIndices.add(i);
          }
        }

        index += term.length;
      }
    });

    // 按位置排序
    matches.sort(function(a, b) {
      return a.start - b.start;
    });

    // 构建文本片段数组
    var lastIndex = 0;

    matches.forEach(function(match) {
      // 添加术语前的普通文本
      if (match.start > lastIndex) {
        segments.push({
          type: 'text',
          content: remaining.substring(lastIndex, match.start)
        });
      }

      // 添加术语（作为可点击链接）
      segments.push({
        type: 'term',
        content: match.term,
        term: match.term
      });

      lastIndex = match.end;
    });

    // 添加剩余文本
    if (lastIndex < remaining.length) {
      segments.push({
        type: 'text',
        content: remaining.substring(lastIndex)
      });
    }

    // 如果没有找到任何术语，返回原文本
    if (segments.length === 0) {
      segments.push({
        type: 'text',
        content: text
      });
    }

    return { segments: segments };
  },

  // 获取所有医学术语 - 只匹配其他标准的标题
  getMedicalTerms: function() {
    if (this._cachedTerms) {
      return this._cachedTerms;
    }

    var terms = new Set();
    var standards = this.data.medicalStandards || [];
    var currentStandardId = this.data.selectedStandard ? this.data.selectedStandard.id : null;

    // 只收集其他标准的中文名称作为术语
    standards.forEach(function(standard) {
      // 排除当前标准本身
      if (standard.name_zh && standard.id !== currentStandardId) {
        terms.add(standard.name_zh);
      }
    });

    // 转换为数组并缓存，按长度降序排序
    this._cachedTerms = Array.from(terms).filter(function(term) {
      return term.length >= 2; // 至少2个字符
    }).sort(function(a, b) {
      return b.length - a.length; // 长术语优先匹配
    });

    return this._cachedTerms;
  },

  // 根据评定结果获取样式类
  getAssessmentBadgeClass: function(assessment) {
    if (!assessment) return 'badge-default';

    if (assessment.includes('不合格')) {
      return 'badge-unqualified';
    } else if (assessment.includes('运行观察')) {
      return 'badge-observation';
    } else if (assessment.includes('合格')) {
      return 'badge-qualified';
    }

    return 'badge-default';
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedStandard: null,
      viewHistory: [], // 清空浏览历史
      canGoBack: false // 重置返回标志
    });
  },

  // 点击医学术语链接 - 直接打开该标准的详情弹窗
  onTermTap: function(e) {
    var term = e.currentTarget.dataset.term;

    if (!term) {
      console.warn('未获取到术语信息');
      return;
    }

    console.log('点击医学术语:', term);

    // 在所有标准中查找该术语对应的标准
    var targetStandard = null;
    var standards = this.data.medicalStandards || [];

    for (var i = 0; i < standards.length; i++) {
      if (standards[i].name_zh === term) {
        targetStandard = standards[i];
        break;
      }
    }

    if (!targetStandard) {
      wx.showToast({
        title: '未找到相关标准',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    // 将当前标准添加到浏览历史（在跳转前保存）
    var currentStandard = this.data.selectedStandard;
    if (currentStandard) {
      var viewHistory = this.data.viewHistory.slice(); // 复制历史数组
      viewHistory.push(currentStandard);

      this.setData({
        viewHistory: viewHistory,
        canGoBack: true
      });
    }

    // 清除术语缓存
    this._cachedTerms = null;

    // 设置新的selectedStandard
    this.setData({
      selectedStandard: targetStandard
    });

    // 处理标准项（添加样式和术语链接）
    var processedItem = this.processStandardItem(targetStandard);

    // 更新弹窗内容（保持弹窗打开状态）
    this.setData({
      selectedStandard: processedItem
    });

    // 显示切换提示
    wx.showToast({
      title: '查看: ' + term,
      icon: 'none',
      duration: 1000
    });
  },

  // 返回上一个浏览的标准
  goBackInHistory: function() {
    var viewHistory = this.data.viewHistory;

    if (viewHistory.length === 0) {
      console.warn('浏览历史为空，无法返回');
      return;
    }

    // 从历史栈中取出上一个标准
    var previousStandard = viewHistory.pop();

    // 清除术语缓存
    this._cachedTerms = null;

    // 设置selectedStandard
    this.setData({
      selectedStandard: previousStandard,
      viewHistory: viewHistory,
      canGoBack: viewHistory.length > 0
    });

    // 处理标准项（添加样式和术语链接）
    var processedItem = this.processStandardItem(previousStandard);

    // 更新弹窗内容
    this.setData({
      selectedStandard: processedItem
    });

    // 显示返回提示
    wx.showToast({
      title: '返回: ' + previousStandard.name_zh,
      icon: 'none',
      duration: 1000
    });
  },

  // === 广告相关方法 ===

  /**
   * 更新广告剩余点击次数显示
   */
  updateAdClicksRemaining: function() {
    var stats = AdManager.getStatistics();
    this.setData({
      adClicksRemaining: stats.clicksUntilNext
    });
  },

  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '民航体检标准 - FlightToolbox',
      path: '/packageMedical/index'
    };
  },

  // 页面卸载
  customOnUnload: function() {
    // 清除搜索定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }
};

Page(BasePage.createPage(pageConfig));
