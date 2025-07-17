// 体检标准页面 - 主包
var medicalData = require('../../data/medicalStandards.js');

Page({
  data: {
    medicalStandards: [],
    filteredStandards: [],
    searchKeyword: '',
    searchPlaceholder: '搜索体检标准...',
    activeTab: '全部',
    categories: ['一般条件', '精神科', '内科', '外科', '耳鼻咽喉及口腔科', '眼科'],
    
    // 弹窗相关
    showDetailPopup: false,
    selectedStandard: null,
    
    // 主题相关
    isDarkMode: false
  },

  onLoad: function(options) {
    console.log('📋 体检标准页面加载');
    this.loadMedicalStandards();
    this.checkTheme();
  },

  onShow: function() {
    // 页面显示时刷新数据
    this.loadMedicalStandards();
    this.checkTheme();
  },

  // 检查主题
  checkTheme: function() {
    var self = this;
    try {
      var isDarkMode = wx.getStorageSync('isDarkMode') || false;
      self.setData({
        isDarkMode: isDarkMode
      });
    } catch (error) {
      console.log('获取主题状态失败:', error);
    }
  },

  // 加载体检标准数据
  loadMedicalStandards: function() {
    var self = this;
    try {
      var standards = medicalData.medicalStandards || [];
      console.log('📋 加载体检标准数据：', standards.length + '条');
      
      self.setData({
        medicalStandards: standards,
        filteredStandards: standards
      });
      
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
    var activeTab = e.detail.name;
    console.log('📋 切换分类：', activeTab);
    
    this.setData({
      activeTab: activeTab,
      searchKeyword: ''
    });
    
    this.updateSearchPlaceholder();
    this.filterByTab(activeTab);
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
  },

  // 实时搜索功能 - 使用 onSearchChange
  onSearchChange: function(e) {
    var searchValue = e.detail || '';
    console.log('📋 搜索输入:', searchValue);
    
    this.setData({
      searchKeyword: searchValue
    });
    
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
  },

  // 显示详情弹窗
  showStandardDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.filteredStandards[index];
    
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