// 健康指南页面 - 整合所有健康管理内容
var fitForFlightData = require('../fitForFlight.js');
var sunglassesData = require('../sunglasses.js');
var hearingData = require('../hearing.js');
var fatigueData = require('../fatigue.js');
var hypoxiaData = require('../hypoxia.js');
var spatialDisorientationData = require('../spatialDisorientation.js');
var alcoholData = require('../alcohol.js');
var medicationsData = require('../medications.js');
var dvtData = require('../dvt.js');
var carbonMonoxideData = require('../carbonMonoxide.js');
var circadianRhythmData = require('../circadianRhythm.js');
var gForceData = require('../gForce.js');
var osaData = require('../osa.js');
var toxicityData = require('../Toxicity.js');
var pilotVisionData = require('../pilotVision.js');
var laserHazardsData = require('../laserHazards.js');
var laserEyeSurgeryData = require('../laserEyeSurgery.js');
var decompressionSicknessData = require('../decompressionSickness.js');
var lepData = require('../lep.js');

Page({
  data: {
    healthGuides: [],
    filteredGuides: [],
    displayedGuides: [], // 当前显示的数据
    searchKeyword: '',
    searchPlaceholder: '搜索健康管理...',
    activeTab: '全部',
    categories: ['生理学', '身体健康', '环境因素', '药物酒精', '视听健康', '全部'],
    
    // 分类标签菜单数据
    categoryList: [
      { name: '全部', title: '全部', count: 0 },
      { name: '生理学', title: '生理学', count: 0 },
      { name: '身体健康', title: '身体健康', count: 0 },
      { name: '环境因素', title: '环境因素', count: 0 },
      { name: '药物酒精', title: '药物酒精', count: 0 },
      { name: '视听健康', title: '视听健康', count: 0 }
    ],
    
    // 分页相关
    pageSize: 10, // 每页显示数量
    currentPage: 1, // 当前页码
    hasMore: true, // 是否还有更多数据
    loading: false, // 是否正在加载
    
    // 统计数据
    comprehensiveCount: 0,
    totalCount: 0, // 总数据量
    
    // 弹窗相关
    showDetailPopup: false,
    selectedGuide: null
  },

  onLoad: function(options) {
    console.log('📋 健康指南页面加载');
    // 延迟初始化，避免tabs组件的width初始化问题
    setTimeout(() => {
      this.loadHealthGuides();
    }, 100);
  },

  onShow: function() {
    // 页面显示时刷新数据
    this.loadHealthGuides();
  },

  // 转换数据结构为统一格式
  transformDataToGuides: function() {
    var guides = [];
    var guidId = 1;
    var self = this;

    // 定义健康模块配置
    var healthModules = [
      { data: fitForFlightData.fitForFlightData_zh, category: '身体健康', type: 'fitness', nameEn: 'Fitness for Flight' },
      { data: sunglassesData.sunglassesData_zh, category: '视听健康', type: 'sunglasses', nameEn: 'Pilot Sunglasses' },
      { data: hearingData.hearingData_zh, category: '视听健康', type: 'hearing', nameEn: 'Hearing and Noise in Aviation' },
      { data: fatigueData.fatigueData_zh, category: '生理学', type: 'fatigue', nameEn: 'Fatigue in Aviation' },
      { data: hypoxiaData.hypoxiaData_zh, category: '生理学', type: 'hypoxia', nameEn: 'Hypoxia' },
      { data: spatialDisorientationData.spatialDisorientationData_zh, category: '生理学', type: 'spatial', nameEn: 'Spatial Disorientation' },
      { data: alcoholData.alcoholData_zh, category: '药物酒精', type: 'alcohol', nameEn: 'Alcohol and Flying' },
      { data: medicationsData.medicationsData_zh, category: '药物酒精', type: 'medications', nameEn: 'Medications and Flying' },
      { data: dvtData.dvtData_zh, category: '身体健康', type: 'dvt', nameEn: 'Deep Vein Thrombosis' },
      { data: carbonMonoxideData.carbonMonoxideData_zh, category: '环境因素', type: 'co', nameEn: 'Carbon Monoxide' },
      { data: circadianRhythmData.circadianRhythmData_zh, category: '生理学', type: 'circadian', nameEn: 'Circadian Rhythm' },
      { data: gForceData.gForceData_zh, category: '生理学', type: 'gforce', nameEn: 'G-Force Effects' },
      { data: osaData.osaData_zh, category: '身体健康', type: 'osa', nameEn: 'Obstructive Sleep Apnea' },
      { data: toxicityData.toxicityData_zh, category: '环境因素', type: 'toxicity', nameEn: 'Toxicity and Aviation' },
      { data: pilotVisionData.pilotVisionData_zh, category: '视听健康', type: 'vision', nameEn: 'Pilot Vision' },
      { data: laserHazardsData.laserHazardsData_zh, category: '环境因素', type: 'laser', nameEn: 'Laser Hazards' },
      { data: laserEyeSurgeryData.laserEyeSurgeryData_zh, category: '视听健康', type: 'surgery', nameEn: 'Laser Eye Surgery' },
      { data: decompressionSicknessData.decompressionSicknessData_zh, category: '生理学', type: 'decompression', nameEn: 'Decompression Sickness' },
      { data: lepData.lepData_zh, category: '身体健康', type: 'lep', nameEn: 'Lower Extremity Pain' }
    ];

    // 处理所有健康模块
    for (var moduleIndex = 0; moduleIndex < healthModules.length; moduleIndex++) {
      var module = healthModules[moduleIndex];
      var moduleData = module.data;
      
      try {
        if (moduleData && moduleData.sections) {
          var sections = moduleData.sections;
          for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            if (section && section.title) {
              guides.push({
                id: module.type + '_' + guidId++,
                name_zh: section.title,
                name_en: module.nameEn,
                category: module.category,
                source: 'FAA',
                publication: moduleData.publicationInfo ? moduleData.publicationInfo.publication : 'FAA',
                summary: self.generateSummary(section),
                fullContent: section,
                type: section.components && section.components.length > 3 ? 'comprehensive' : 'quick',
                moduleTitle: moduleData.title || module.nameEn
              });
            }
          }
        }
      } catch (error) {
        console.log('加载模块失败:', module.type, error);
      }
    }

    return guides;
  },

  // 生成内容摘要
  generateSummary: function(section) {
    if (section.content) {
      return section.content.length > 150 ? section.content.substring(0, 150) + '...' : section.content;
    }
    if (section.key_concepts && section.key_concepts.length > 0) {
      var concepts = section.key_concepts.slice(0, 2).join('；');
      return concepts.length > 150 ? concepts.substring(0, 150) + '...' : concepts;
    }
    if (section.points && section.points.length > 0) {
      var points = section.points.slice(0, 3).join('；');
      return points.length > 150 ? points.substring(0, 150) + '...' : points;
    }
    if (section.components && section.components.length > 0) {
      return '包含' + section.components.length + '个主要组成部分：' + 
             section.components.slice(0, 2).map(function(c) { return c.name; }).join('、') + 
             (section.components.length > 2 ? '等' : '');
    }
    if (section.subsections && section.subsections.length > 0) {
      return '包含' + section.subsections.length + '个子章节：' + 
             section.subsections.slice(0, 2).map(function(s) { return s.title; }).join('、') + 
             (section.subsections.length > 2 ? '等' : '');
    }
    return '详见完整内容';
  },

  // 加载健康指南数据
  loadHealthGuides: function() {
    var self = this;
    try {
      var guides = this.transformDataToGuides();
      console.log('📋 加载健康指南数据：', guides.length + '条');
      
      // 计算完整指南数量（这里可以根据实际需求定义什么是"完整指南"）
      var comprehensiveCount = guides.filter(function(guide) {
        return guide.type === 'comprehensive' || guide.fullContent && guide.fullContent.sections;
      }).length;
      
      // 更新分类标签菜单的统计数量
      var updatedCategoryList = this.data.categoryList.map(function(category) {
        if (category.name === '全部') {
          return { name: category.name, title: category.title, count: guides.length };
        } else {
          var count = guides.filter(function(guide) {
            return guide.category === category.name;
          }).length;
          return { name: category.name, title: category.title, count: count };
        }
      });
      
      self.setData({
        healthGuides: guides,
        filteredGuides: guides,
        comprehensiveCount: comprehensiveCount,
        categoryList: updatedCategoryList,
        totalCount: guides.length
      });
      
      // 初始化分页显示
      this.updateDisplayedGuides();
      
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

  // 更新显示的数据（分页逻辑）
  updateDisplayedGuides: function() {
    var filteredGuides = this.data.filteredGuides;
    var pageSize = this.data.pageSize;
    var currentPage = this.data.currentPage;
    
    // 计算应该显示的数据
    var endIndex = currentPage * pageSize;
    var displayedGuides = filteredGuides.slice(0, endIndex);
    var hasMore = endIndex < filteredGuides.length;
    
    console.log('📋 更新显示数据：显示', displayedGuides.length, '条，共', filteredGuides.length, '条，还有更多:', hasMore);
    
    this.setData({
      displayedGuides: displayedGuides,
      hasMore: hasMore,
      loading: false
    });
  },

  // 加载更多数据
  loadMoreGuides: function() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }
    
    console.log('📋 加载更多健康指南数据');
    
    this.setData({
      loading: true,
      currentPage: this.data.currentPage + 1
    });
    
    // 延迟更新，模拟加载过程
    setTimeout(() => {
      this.updateDisplayedGuides();
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
      placeholder = '搜索健康管理...';
    } else {
      placeholder = '搜索' + activeTab + '指南...';
    }
    
    this.setData({
      searchPlaceholder: placeholder
    });
  },

  // 选项卡切换
  onTabChange: function(e) {
    var activeTab = e.currentTarget.dataset.name;
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
    
    // 重置分页并更新显示
    this.resetPagination();
    this.updateDisplayedGuides();
  },

  // 实时搜索功能
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
    
    // 更新分页显示
    this.updateDisplayedGuides();
  },

  // 显示详情弹窗
  showGuideDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayedGuides[index];
    
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
      title: '健康管理 - FlightToolbox',
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