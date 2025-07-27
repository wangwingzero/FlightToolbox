// 性能详解页面
var BasePage = require('../utils/base-page.js');

// 导入性能数据
// 导入性能数据 - 使用 module.exports 格式
const aircraftLimitationsData = require('./aircraftLimitations.js');
const takeoffPerformanceData = require('./takeoffPerformance.js');
const landingPerformanceData = require('./landingPerformance.js');
const inFlightPerformanceData = require('./inFlightPerformance.js');
const fuelPlanningData = require('./fuelPlanningAndManagement.js');

var pageConfig = {
  data: {
    // 当前激活的标签
    activeTab: 'all',
    
    // 搜索相关
    searchValue: '',
    searchPlaceholder: '搜索性能参数中英文名称或定义...',
    
    // 所有性能数据
    allData: [],
    
    // 当前显示的数据
    displayData: [],
    
    // 分页相关
    filteredData: [], // 过滤后的所有数据
    pageSize: 15, // 每页显示15条
    currentPage: 0, // 当前页码（从0开始）
    hasMore: true, // 是否还有更多数据
    isLoading: false, // 是否正在加载
    
    // 总数统计
    totalCount: 0,
    
    // 详情弹窗
    showDetailPopup: false,
    selectedParameter: {},
    
    // 分类映射
    categoryMap: {
      'limitations': { name: '飞机限制', color: 'red' },
      'takeoff': { name: '起飞性能', color: 'blue' },
      'landing': { name: '着陆性能', color: 'green' },
      'inflight': { name: '飞行性能', color: 'purple' },
      'fuel': { name: '燃油规划', color: 'orange' }
    },

    // 新的标签列表
    tabList: [
      { name: 'all', title: '全部', icon: '📋', count: 0 },
      { name: 'limitations', title: '限制', icon: '⚠️', count: 0 },
      { name: 'takeoff', title: '起飞', icon: '🛫', count: 0 },
      { name: 'landing', title: '着陆', icon: '🛬', count: 0 },
      { name: 'inflight', title: '飞行', icon: '✈️', count: 0 },
      { name: 'fuel', title: '燃油', icon: '⛽', count: 0 }
    ]
  },

  customOnLoad: function(options) {
    console.log('性能详解页面加载');
    this.loadPerformanceData();
  },



  // 加载性能数据
  loadPerformanceData: function() {
    let allData = [];
    
    // 加载飞机限制数据
    const limitations = aircraftLimitationsData.aircraftLimitations || [];
    limitations.forEach(item => {
      allData.push({
        ...item,
        category: 'limitations',
        categoryName: '飞机限制'
      });
    });
    
    // 加载起飞性能数据
    const takeoff = takeoffPerformanceData.takeoffPerformance || [];
    takeoff.forEach(item => {
      allData.push({
        ...item,
        category: 'takeoff',
        categoryName: '起飞性能'
      });
    });
    
    // 加载着陆性能数据
    const landing = landingPerformanceData.landingPerformance || [];
    landing.forEach(item => {
      allData.push({
        ...item,
        category: 'landing',
        categoryName: '着陆性能'
      });
    });
    
    // 加载飞行性能数据
    const inflight = inFlightPerformanceData.inFlightPerformance || [];
    inflight.forEach(item => {
      allData.push({
        ...item,
        category: 'inflight',
        categoryName: '飞行性能'
      });
    });
    
    // 加载燃油规划数据
    const fuel = fuelPlanningData.fuelPlanningAndManagement || [];
    fuel.forEach(item => {
      allData.push({
        ...item,
        category: 'fuel',
        categoryName: '燃油规划'
      });
    });

    // 计算每个分类的数量
    const categoryCounts = {
      'limitations': allData.filter(item => item.category === 'limitations').length,
      'takeoff': allData.filter(item => item.category === 'takeoff').length,
      'landing': allData.filter(item => item.category === 'landing').length,
      'inflight': allData.filter(item => item.category === 'inflight').length,
      'fuel': allData.filter(item => item.category === 'fuel').length
    };

    // 更新标签列表的计数
    const updatedTabList = this.data.tabList.map(tab => {
      if (tab.name === 'all') {
        return { ...tab, count: allData.length };
      } else {
        return { ...tab, count: categoryCounts[tab.name] || 0 };
      }
    });

    this.setData({
      allData: allData,
      totalCount: allData.length,
      filteredData: allData,
      tabList: updatedTabList
    });
    
    // 初始加载第一页数据
    this.loadPageData(true);
    
    console.log('性能数据加载完成，总数:', allData.length);
    console.log('分类统计:', categoryCounts);
    console.log('前3个数据示例:', allData.slice(0, 3));
  },

  // 新的标签切换函数
  onCustomTabChange: function(e) {
    const activeTab = e.currentTarget.dataset.tab;
    console.log('标签切换到:', activeTab);
    
    this.setData({
      activeTab: activeTab,
      searchValue: ''
    });
    
    this.filterDataByTab(activeTab);
  },

  // 根据标签过滤数据
  filterDataByTab: function(tab) {
    let filteredData = this.data.allData;
    
    if (tab !== 'all') {
      filteredData = this.data.allData.filter(item => item.category === tab);
    }
    
    this.setData({
      filteredData: filteredData,
      currentPage: 0,
      hasMore: true
    });
    
    // 重新加载第一页数据
    this.loadPageData(true);
  },

  // 实时搜索功能
  onSearchChange: function(e) {
    const searchValue = e.detail;
    this.setData({
      searchValue: searchValue
    });
    
    // 实时搜索
    if (searchValue.trim() === '') {
      this.filterDataByTab(this.data.activeTab);
    } else {
      this.performSearch();
    }
  },

  onSearchClear: function() {
    this.setData({
      searchValue: ''
    });
    this.filterDataByTab(this.data.activeTab);
  },

  // 执行搜索
  performSearch: function() {
    const searchValue = this.data.searchValue.toLowerCase().trim();
    const activeTab = this.data.activeTab;
    
    let baseData = this.data.allData;
    
    // 先按标签过滤
    if (activeTab !== 'all') {
      baseData = this.data.allData.filter(item => item.category === activeTab);
    }
    
    // 再按搜索关键词过滤
    let filteredData = baseData;
    if (searchValue) {
      filteredData = baseData.filter(item => {
        return item.nameEn.toLowerCase().includes(searchValue) ||
               item.nameZh.includes(searchValue) ||
               item.definition.includes(searchValue) ||
               (item.relatedFormulas && item.relatedFormulas.some(formula => 
                 formula.toLowerCase().includes(searchValue)
               )) ||
               (item.regulatoryRequirement && 
                item.regulatoryRequirement.toLowerCase().includes(searchValue));
      });
    }
    
    this.setData({
      filteredData: filteredData,
      currentPage: 0,
      hasMore: true
    });
    
    // 重新加载第一页数据
    this.loadPageData(true);
  },

  // 加载分页数据
  loadPageData: function(isReset) {
    const filteredData = this.data.filteredData;
    const pageSize = this.data.pageSize;
    const currentPage = isReset ? 0 : this.data.currentPage;
    
    // 计算要显示的数据
    const startIndex = 0;
    const endIndex = (currentPage + 1) * pageSize;
    const newDisplayData = filteredData.slice(startIndex, endIndex);
    
    // 检查是否还有更多数据
    const hasMore = endIndex < filteredData.length;
    
    console.log('📄 分页加载:', {
      当前页: currentPage,
      显示条数: newDisplayData.length,
      总条数: filteredData.length,
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
    // 防止重复加载
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }
    
    console.log('📖 加载更多数据...');
    
    this.setData({
      isLoading: true
    });
    
    // 模拟加载延时，提升用户体验
    setTimeout(() => {
      const nextPage = this.data.currentPage + 1;
      this.setData({
        currentPage: nextPage
      });
      this.loadPageData(false);
    }, 300);
  },

  // 显示参数详情
  showParameterDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.displayData[index];
    
    console.log('点击索引:', index);
    console.log('点击的参数:', item);
    
    if (!item) {
      console.error('未获取到参数数据，索引:', index);
      wx.showToast({
        title: '参数数据获取失败',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedParameter: item,
      showDetailPopup: true
    }, () => {
      console.log('弹窗状态已更新:', this.data.showDetailPopup);
      console.log('选中的参数:', this.data.selectedParameter);
    });
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedParameter: {}
    });
  }
};

Page(BasePage.createPage(pageConfig));