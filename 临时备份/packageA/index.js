// 通信翻译页面 - 高端优雅重构版
console.log('开始加载通信翻译页面模块');

try {
  var BasePage = require('../utils/base-page.js');
  console.log('BasePage加载成功');
} catch (error) {
  console.error('BasePage加载失败:', error);
  // 使用传统Page构造方式作为降级方案
}

// 导入通信翻译数据
var icao900Data = require('./icao900.js');
var emergencyGlossaryData = require('./emergencyGlossary.js');

var pageConfig = {
  data: {
    // 当前激活的标签
    activeTab: 'all',
    
    // 搜索相关
    searchValue: '',
    searchPlaceholder: '搜索英语句子、中文翻译或应急词汇...',
    
    // 所有通信数据
    allData: [],
    
    // 当前显示的数据
    displayData: [],
    
    // 分页相关
    pageSize: 20, // 每页显示20条
    currentPage: 0, // 当前页码（从0开始）
    hasMore: true, // 是否还有更多数据
    isLoading: false, // 是否正在加载
    filteredAllData: [], // 过滤后的所有数据（用于分页）
    
    // 总数统计
    totalCount: 0,
    
    // 详情弹窗
    showDetailPopup: false,
    selectedItem: {},
    
    // 分类映射
    categoryMap: {
      'icao900': { name: 'ICAO标准英语', color: 'blue' },
      'emergency': { name: '应急特情词汇', color: 'red' }
    },

    // 标签列表
    tabList: [
      { name: 'all', title: '全部', icon: '📋', count: 0 },
      { name: 'icao900', title: 'ICAO900', icon: '✈️', count: 0 },
      { name: 'emergency', title: '应急词汇', icon: '🚨', count: 0 }
    ]
  },

  customOnLoad: function(options) {
    console.log('通信翻译页面加载 - 现代化简洁版');
    this.loadCommunicationData();
  },

  // 加载通信翻译数据
  loadCommunicationData: function() {
    var allData = [];
    
    // 加载ICAO900数据
    var icao900 = [];
    var chapters = icao900Data.chapters || [];
    chapters.forEach(function(chapter) {
      if (chapter.sentences && chapter.sentences.length > 0) {
        chapter.sentences.forEach(function(sentence) {
          icao900.push({
            id: sentence.id,
            english: sentence.english,
            chinese: sentence.chinese,
            chapter: chapter.name
          });
        });
      }
    });
    
    icao900.forEach(function(item) {
      allData.push({
        id: 'icao_' + item.id,
        category: 'icao900',
        categoryName: 'ICAO标准英语',
        chapterName: item.chapter,
        english: item.english,
        chinese: item.chinese,
        type: 'sentence'
      });
    });
    
    // 加载应急词汇数据
    var emergencyGlossary = emergencyGlossaryData.emergencyGlossary.glossary || emergencyGlossaryData.glossary || [];
    emergencyGlossary.forEach(function(categoryItem, categoryIndex) {
      if (categoryItem.terms && categoryItem.terms.length > 0) {
        categoryItem.terms.forEach(function(term, termIndex) {
          allData.push({
            id: 'emergency_' + categoryIndex + '_' + termIndex,
            category: 'emergency',
            categoryName: '应急特情词汇',
            chapterName: categoryItem.name,
            english: term.english,
            chinese: term.chinese,
            type: 'term'
          });
        });
      }
    });

    // 更新数据
    this.setData({
      allData: allData,
      filteredAllData: allData, // 初始时过滤后的数据就是全部数据
      totalCount: allData.length
    });
    
    // 初始显示第一页数据
    this.loadPageData(true);
    
    // 更新标签计数
    this.updateTabCounts();
    
    console.log('通信数据加载完成，共', allData.length, '条，初始显示', Math.min(this.data.pageSize, allData.length), '条');
  },

  // 加载分页数据
  loadPageData: function(isReset) {
    var self = this;
    var filteredAllData = this.data.filteredAllData;
    var pageSize = this.data.pageSize;
    var currentPage = isReset ? 0 : this.data.currentPage;
    
    // 计算要显示的数据
    var startIndex = 0;
    var endIndex = (currentPage + 1) * pageSize;
    var newDisplayData = filteredAllData.slice(startIndex, endIndex);
    
    // 检查是否还有更多数据
    var hasMore = endIndex < filteredAllData.length;
    
    console.log('📄 分页加载:', {
      当前页: currentPage,
      显示条数: newDisplayData.length,
      总条数: filteredAllData.length,
      还有更多: hasMore
    });
    
    this.setData({
      displayData: newDisplayData,
      currentPage: currentPage,
      hasMore: hasMore,
      isLoading: false
    });
  },

  // 加载更多数据
  loadMore: function() {
    var self = this;
    
    // 防止重复加载
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }
    
    console.log('📖 加载更多数据...');
    
    this.setData({
      isLoading: true
    });
    
    // 模拟加载延时，提升用户体验
    setTimeout(function() {
      var nextPage = self.data.currentPage + 1;
      self.setData({
        currentPage: nextPage
      });
      self.loadPageData(false);
    }, 300);
  },

  // 更新标签计数
  updateTabCounts: function() {
    var self = this;
    var allData = this.data.allData;
    var tabList = this.data.tabList;
    
    var counts = {
      'all': allData.length,
      'icao900': 0,
      'emergency': 0
    };
    
    allData.forEach(function(item) {
      if (item.category === 'icao900') {
        counts.icao900++;
      } else if (item.category === 'emergency') {
        counts.emergency++;
      }
    });
    
    // 更新计数
    tabList.forEach(function(tab) {
      tab.count = counts[tab.name] || 0;
    });
    
    this.setData({
      tabList: tabList
    });
  },

  // 标签切换
  onCustomTabChange: function(e) {
    var tabName = e.currentTarget.dataset.tab;
    console.log('切换标签:', tabName);
    
    this.setData({
      activeTab: tabName
    });
    
    this.filterData();
  },

  // 搜索输入
  onSearchChange: function(e) {
    this.setData({
      searchValue: e.detail
    });
    this.filterData();
  },

  // 清空搜索
  onSearchClear: function() {
    this.setData({
      searchValue: ''
    });
    this.filterData();
  },

  // 过滤数据
  filterData: function() {
    var self = this;
    var allData = this.data.allData;
    var activeTab = this.data.activeTab;
    var searchValue = this.data.searchValue.toLowerCase().trim();
    
    console.log('🔍 开始过滤数据:', {
      总数据量: allData.length,
      当前标签: activeTab,
      搜索词: searchValue
    });
    
    var filteredData = allData;
    
    // 分类过滤
    if (activeTab !== 'all') {
      filteredData = filteredData.filter(function(item) {
        return item.category === activeTab;
      });
      console.log('📋 分类过滤后:', filteredData.length, '条');
    }
    
    // 搜索过滤
    if (searchValue) {
      var beforeSearchCount = filteredData.length;
      filteredData = filteredData.filter(function(item) {
        var english = (item.english || '').toLowerCase();
        var chinese = (item.chinese || '').toLowerCase();
        var chapterName = (item.chapterName || '').toLowerCase();
        
        return english.indexOf(searchValue) !== -1 ||
               chinese.indexOf(searchValue) !== -1 ||
               chapterName.indexOf(searchValue) !== -1;
      });
      console.log('🎯 搜索过滤:', beforeSearchCount, '→', filteredData.length, '条');
    }
    
    console.log('📊 最终结果:', filteredData.length, '条数据');
    
    // 更新过滤后的数据并重置分页
    this.setData({
      filteredAllData: filteredData,
      currentPage: 0,
      hasMore: true
    });
    
    // 重新加载第一页数据
    this.loadPageData(true);
  },

  // 显示详情
  showCommunicationDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayData[index];
    
    if (item) {
      this.setData({
        selectedItem: item,
        showDetailPopup: true
      });
    }
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedItem: {}
    });
  }

};

// 页面创建 - 兼容降级处理
if (typeof BasePage !== 'undefined' && BasePage.createPage) {
  console.log('使用BasePage创建页面');
  Page(BasePage.createPage(pageConfig));
} else {
  console.log('使用传统方式创建页面');
  // 添加基本的生命周期方法
  pageConfig.onLoad = pageConfig.customOnLoad || function() {};
  pageConfig.onShow = pageConfig.customOnShow || function() {};
  Page(pageConfig);
}