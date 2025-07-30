// 体检标准页面 - 主包
var medicalData = require('../../data/medicalStandards.js');

Page({
  data: {
    medicalStandards: [],
    filteredStandards: [],
    displayedStandards: [], // 当前显示的数据
    searchKeyword: '',
    searchPlaceholder: '搜索体检标准...',
    activeTab: '全部',
    categories: ['一般条件', '精神科', '内科', '外科', '耳鼻咽喉及口腔科', '眼科'],
    categoryList: [],
    
    // 分页相关
    pageSize: 10, // 每页显示数量
    currentPage: 1, // 当前页码
    hasMore: true, // 是否还有更多数据
    loading: false, // 是否正在加载
    totalCount: 0, // 总数据量
    
    // 弹窗相关
    showDetailPopup: false,
    selectedStandard: null
  },

  onLoad: function(options) {
    console.log('📋 体检标准页面加载');
    // 延迟初始化，避免tabs组件的width初始化问题
    setTimeout(() => {
      this.loadMedicalStandards();
    }, 100);
  },

  onShow: function() {
    // 页面显示时刷新数据
    this.loadMedicalStandards();
  },


  // 加载体检标准数据
  loadMedicalStandards: function() {
    var self = this;
    try {
      var standards = medicalData.medicalStandards || [];
      console.log('📋 加载体检标准数据：', standards.length + '条');
      
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
      this.updateDisplayedStandards();
      
      // 更新搜索提示
      this.updateSearchPlaceholder();
    } catch (error) {
      console.error('❌ 加载体检标准数据失败：', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
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
    
    console.log('📋 更新显示数据：显示', displayedStandards.length, '条，共', filteredStandards.length, '条，还有更多:', hasMore);
    
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
    
    console.log('📋 加载更多体检标准数据');
    
    this.setData({
      loading: true,
      currentPage: this.data.currentPage + 1
    });
    
    // 延迟更新，模拟加载过程
    setTimeout(() => {
      this.updateDisplayedStandards();
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
    console.log('📋 切换分类：', activeTab);
    
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

  // 实时搜索功能 - 使用 onSearchChange
  onSearchChange: function(e) {
    var searchValue = e.detail || '';
    console.log('📋 搜索输入:', searchValue);
    
    this.setData({
      searchKeyword: searchValue
    });
    
    // 重置分页状态
    this.resetPagination();
    
    // 实时搜索
    if (searchValue.trim() === '') {
      this.filterByTab(this.data.activeTab);
    } else {
      this.performSearch();
    }
  },

  // 清空搜索
  onSearchClear: function() {
    console.log('📋 清空搜索');
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
    
    console.log('📋 执行搜索:', searchValue, '分类:', activeTab);
    
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
        return (item.name_zh && item.name_zh.toLowerCase().includes(searchValue)) ||
               (item.name_en && item.name_en.toLowerCase().includes(searchValue)) ||
               (item.category && item.category.toLowerCase().includes(searchValue)) ||
               (item.id && item.id.toLowerCase().includes(searchValue)) ||
               (item.standard && item.standard.assessment && 
                item.standard.assessment.toLowerCase().includes(searchValue)) ||
               (item.standard && Array.isArray(item.standard) && 
                item.standard.some(function(std) {
                  return (std.assessment && std.assessment.toLowerCase().includes(searchValue)) ||
                         (std.conditions && std.conditions.some(function(condition) {
                           return condition.toLowerCase().includes(searchValue);
                         }));
                }));
      });
    }
    
    console.log('📋 搜索结果:', filteredData.length + '条');
    
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
    
    console.log('📋 查看体检标准详情：', item);
    
    if (!item) {
      console.error('未获取到标准数据，索引:', index);
      wx.showToast({
        title: '标准数据获取失败',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedStandard: item,
      showDetailPopup: true
    });
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedStandard: null
    });
  },

  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '民航体检标准 - FlightToolbox',
      path: '/pages/medical-standards/index'
    };
  },


  // 页面卸载
  onUnload: function() {
    // 清除搜索定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }
});