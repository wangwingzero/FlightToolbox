// 健康指南页面 - 整合飞行体能、太阳镜、听力等健康管理内容
var fitForFlightData = require('../fitForFlight.js');
var sunglassesData = require('../sunglasses.js');
var hearingData = require('../hearing.js');

Page({
  data: {
    healthGuides: [],
    filteredGuides: [],
    searchKeyword: '',
    searchPlaceholder: '搜索健康管理指南...',
    activeTab: '全部',
    categories: ['飞行体能', '太阳眼镜', '听力保护', '全部'],
    
    // 弹窗相关
    showDetailPopup: false,
    selectedGuide: null,
    
    // 主题相关
    isDarkMode: false
  },

  onLoad: function(options) {
    console.log('📋 健康指南页面加载');
    this.loadHealthGuides();
    this.checkTheme();
  },

  onShow: function() {
    // 页面显示时刷新数据
    this.loadHealthGuides();
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

  // 转换数据结构为统一格式
  transformDataToGuides: function() {
    var guides = [];
    var guidId = 1;

    // 处理飞行体能数据
    var fitData = fitForFlightData.fitForFlightData_zh;
    if (fitData && fitData.sections) {
      var sections = fitData.sections;
      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        guides.push({
          id: 'fit_' + guidId++,
          name_zh: section.title,
          name_en: 'Fitness for Flight',
          category: '飞行体能',
          source: 'FAA',
          publication: fitData.publicationInfo ? fitData.publicationInfo.publication : 'FAA AM-400/09/2',
          summary: section.content || (section.components ? '健身计划的基本组成部分' : section.points ? section.points.join('；') : '详见内容'),
          fullContent: section,
          type: 'fitness'
        });
      }
    }

    // 处理太阳镜数据
    var sunData = sunglassesData.sunglassesData_zh;
    if (sunData && sunData.sections) {
      var sections = sunData.sections;
      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        guides.push({
          id: 'sun_' + guidId++,
          name_zh: section.title,
          name_en: 'Pilot Sunglasses',
          category: '太阳眼镜',
          source: 'FAA',
          publication: sunData.publicationInfo ? sunData.publicationInfo.publication : 'FAA AM-400-05/1',
          summary: section.content ? section.content.substring(0, 100) + '...' : '详见内容',
          fullContent: section,
          type: 'sunglasses'
        });
      }
    }

    // 处理听力数据
    var hearData = hearingData.hearingData_zh;
    if (hearData && hearData.sections) {
      var sections = hearData.sections;
      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        guides.push({
          id: 'hear_' + guidId++,
          name_zh: section.title,
          name_en: 'Hearing and Noise in Aviation',
          category: '听力保护',
          source: 'FAA',
          publication: hearData.publicationInfo ? hearData.publicationInfo.publication : 'FAA AM-400-98/3',
          summary: section.content ? section.content.substring(0, 100) + '...' : '详见内容',
          fullContent: section,
          type: 'hearing'
        });
      }
    }

    return guides;
  },

  // 加载健康指南数据
  loadHealthGuides: function() {
    var self = this;
    try {
      var guides = this.transformDataToGuides();
      console.log('📋 加载健康指南数据：', guides.length + '条');
      
      self.setData({
        healthGuides: guides,
        filteredGuides: guides
      });
      
      // 更新搜索提示
      this.updateSearchPlaceholder();
    } catch (error) {
      console.error('❌ 加载健康指南数据失败：', error);
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
      placeholder = '搜索健康管理指南...';
    } else {
      placeholder = '搜索' + activeTab + '指南...';
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
    var filteredData = this.data.healthGuides;
    
    if (tab !== '全部') {
      filteredData = this.data.healthGuides.filter(function(item) {
        return item.category === tab;
      });
    }
    
    this.setData({
      filteredGuides: filteredData
    });
  },

  // 实时搜索功能
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
    var baseData = this.data.healthGuides;
    
    console.log('📋 执行搜索:', searchValue, '分类:', activeTab);
    
    // 先按标签过滤
    if (activeTab !== '全部') {
      baseData = this.data.healthGuides.filter(function(item) {
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
               (item.summary && item.summary.toLowerCase().includes(searchValue)) ||
               (item.source && item.source.toLowerCase().includes(searchValue));
      });
    }
    
    console.log('📋 搜索结果:', filteredData.length + '条');
    
    this.setData({
      filteredGuides: filteredData
    });
  },

  // 显示详情弹窗
  showGuideDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.filteredGuides[index];
    
    console.log('📋 查看健康指南详情：', item);
    
    if (!item) {
      console.error('未获取到指南数据，索引:', index);
      wx.showToast({
        title: '指南数据获取失败',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedGuide: item,
      showDetailPopup: true
    });
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedGuide: null
    });
  },

  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '健康管理指南 - FlightToolbox',
      path: '/packageHealth/health-guide/index'
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