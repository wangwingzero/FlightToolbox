// 健康管理页面
var BasePage = require('../../utils/base-page.js');

// 导入健康数据
var fitForFlightData = require('./fitForFlight.js');
var hearingData = require('./hearing.js');
var sunglassesData = require('./sunglasses.js');
var medicalData = require('../../data/medicalStandards.js');

var pageConfig = {
  data: {
    // 当前激活的标签
    activeTab: 'all',
    
    // 搜索相关
    searchValue: '',
    searchPlaceholder: '搜索健康管理中英文名称或内容...',
    
    // 所有健康数据
    allData: [],
    
    // 当前显示的数据
    displayData: [],
    
    // 总数统计
    totalCount: 0,
    
    // 详情弹窗
    showDetailPopup: false,
    selectedParameter: {},
    
    // 分类映射
    categoryMap: {
      'fitness': { name: '飞行体能', color: 'green' },
      'hearing': { name: '听力防护', color: 'blue' },
      'vision': { name: '视力保护', color: 'purple' },
      'medical': { name: '体检标准', color: 'orange' }
    }
  },

  customOnLoad: function(options) {
    console.log('健康管理页面加载');
    this.loadHealthData();
    
    // 测试数据
    setTimeout(function() {
      console.log('当前显示数据数量:', this.data.displayData.length);
      console.log('当前总数据数量:', this.data.allData.length);
    }.bind(this), 1000);
  },

  // 获取医学标准概要
  getStandardSummary: function(standard) {
    var summary = '';
    if (standard.category) {
      summary += '[' + standard.category + '] ';
    }
    if (standard.subCategory) {
      summary += standard.subCategory + ' - ';
    }
    
    if (standard.standard) {
      if (Array.isArray(standard.standard)) {
        var assessments = [];
        for (var i = 0; i < standard.standard.length; i++) {
          assessments.push(standard.standard[i].assessment);
        }
        summary += '评估结果：' + assessments.join('、');
      } else {
        summary += '评估结果：' + standard.standard.assessment;
      }
    }
    
    return summary || '查看详细的体检鉴定标准和条件';
  },

  // 加载健康数据
  loadHealthData: function() {
    var allData = [];
    
    // 处理飞行体能数据
    if (fitForFlightData.fitForFlightData_zh) {
      var fitData = fitForFlightData.fitForFlightData_zh;
      allData.push({
        nameZh: fitData.title,
        nameEn: 'Fit for Flight',
        definition: fitData.introduction,
        category: 'fitness',
        categoryName: '飞行体能',
        fullData: fitData,
        type: 'comprehensive'
      });
      
      // 添加各个章节作为独立条目
      if (fitData.sections) {
        fitData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'fitness',
            categoryName: '飞行体能',
            fullData: section,
            type: 'section'
          });
        });
      }
    }
    
    // 处理听力数据
    if (hearingData.hearingData_zh) {
      var hearData = hearingData.hearingData_zh;
      allData.push({
        nameZh: hearData.title,
        nameEn: 'Hearing and Noise in Flight',
        definition: '本文档详细介绍了飞行中的听力保护和噪音管理知识',
        category: 'hearing',
        categoryName: '听力防护',
        fullData: hearData,
        type: 'comprehensive'
      });
      
      // 添加各个章节
      if (hearData.sections) {
        hearData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'hearing',
            categoryName: '听力防护',
            fullData: section,
            type: 'section'
          });
        });
      }
    }
    
    // 处理太阳镜数据
    if (sunglassesData.sunglassesData_zh) {
      var sunData = sunglassesData.sunglassesData_zh;
      allData.push({
        nameZh: sunData.title,
        nameEn: 'Pilot Sunglasses: Beyond Image',
        definition: sunData.introduction,
        category: 'vision',
        categoryName: '视力保护',
        fullData: sunData,
        type: 'comprehensive'
      });
      
      // 添加各个章节
      if (sunData.sections) {
        sunData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'vision',
            categoryName: '视力保护',
            fullData: section,
            type: 'section'
          });
        });
      }
    }
    
    // 处理体检标准数据
    if (medicalData.medicalStandards) {
      var standards = medicalData.medicalStandards;
      for (var i = 0; i < standards.length; i++) {
        var standard = standards[i];
        allData.push({
          nameZh: standard.name_zh,
          nameEn: standard.name_en,
          definition: this.getStandardSummary(standard),
          category: 'medical',
          categoryName: '体检标准',
          fullData: standard,
          type: 'standard'
        });
      }
    }

    this.setData({
      allData: allData,
      totalCount: allData.length,
      displayData: allData
    });
    
    console.log('健康数据加载完成，总数:', allData.length);
    console.log('前3个数据示例:', allData.slice(0, 3));
  },

  // 标签切换
  onTabChange: function(e) {
    var activeTab = e.detail.name;
    this.setData({
      activeTab: activeTab,
      searchValue: ''
    });
    this.filterDataByTab(activeTab);
  },

  // 根据标签过滤数据
  filterDataByTab: function(tab) {
    var filteredData = this.data.allData;
    
    if (tab !== 'all') {
      filteredData = this.data.allData.filter(function(item) {
        return item.category === tab;
      });
    }
    
    this.setData({
      displayData: filteredData
    });
  },

  // 实时搜索功能
  onSearchChange: function(e) {
    var searchValue = e.detail;
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
    var searchValue = this.data.searchValue.toLowerCase().trim();
    var activeTab = this.data.activeTab;
    
    var baseData = this.data.allData;
    
    // 先按标签过滤
    if (activeTab !== 'all') {
      baseData = this.data.allData.filter(function(item) {
        return item.category === activeTab;
      });
    }
    
    // 再按搜索关键词过滤
    var filteredData = baseData;
    if (searchValue) {
      filteredData = baseData.filter(function(item) {
        return item.nameEn.toLowerCase().includes(searchValue) ||
               item.nameZh.includes(searchValue) ||
               item.definition.includes(searchValue);
      });
    }
    
    this.setData({
      displayData: filteredData
    });
  },

  // 显示参数详情
  showParameterDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayData[index];
    
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
    }, function() {
      console.log('弹窗状态已更新:', this.data.showDetailPopup);
      console.log('选中的参数:', this.data.selectedParameter);
    }.bind(this));
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