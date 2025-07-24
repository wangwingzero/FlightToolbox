// 缩写查询页面
var BasePage = require('../../utils/base-page.js');

// 导入缩写数据
var abbreviationAIP = require('./abbreviationAIP.js');
var abbreviationsAirbus = require('./abbreviationsAirbus.js');

var pageConfig = {
  data: {
    // 当前激活的标签
    activeTab: 'all',
    
    // 搜索相关
    searchValue: '',
    searchPlaceholder: '搜索缩写、英文全称或中文翻译...',
    
    // 所有缩写数据
    allData: [],
    
    // 当前显示的数据
    displayData: [],
    
    // 总数统计
    totalCount: 0,
    
    // 详情弹窗
    showDetailPopup: false,
    selectedAbbreviation: {},
    
    // 分类映射
    categoryMap: {
      'AIP': { name: 'AIP标准', color: 'blue' },
      'Airbus': { name: '空客术语', color: 'purple' }
    },

    // 标签列表
    tabList: [
      { name: 'all', title: '全部', icon: '📋', count: 0 },
      { name: 'AIP', title: 'AIP', icon: '📖', count: 0 },
      { name: 'Airbus', title: '空客', icon: '✈️', count: 0 }
    ]
  },

  customOnLoad: function(options) {
    console.log('缩写查询页面加载');
    this.loadAbbreviationData();
  },

  // 加载缩写数据
  loadAbbreviationData: function() {
    var self = this;
    var allData = [];
    var uniqueId = 0;
    
    // 加载AIP缩写数据
    if (abbreviationAIP && abbreviationAIP.length > 0) {
      abbreviationAIP.forEach(function(item) {
        allData.push({
          id: 'aip_' + (uniqueId++), // 添加唯一标识符
          abbreviation: item.abbreviation,
          english_full: item.english_full,
          chinese_translation: item.chinese_translation,
          pronunciation: item.pronunciation,
          source: 'AIP',
          categoryName: 'AIP标准'
        });
      });
    }
    
    // 加载Airbus缩写数据
    if (abbreviationsAirbus && abbreviationsAirbus.length > 0) {
      abbreviationsAirbus.forEach(function(item) {
        allData.push({
          id: 'airbus_' + (uniqueId++), // 添加唯一标识符
          abbreviation: item.abbreviation,
          english_full: item.english_full,
          chinese_translation: item.chinese_translation,
          pronunciation: item.pronunciation,
          source: 'Airbus',
          categoryName: '空客术语'
        });
      });
    }
    
    // 验证TCAS数据是否正确加载
    var tcasItems = allData.filter(function(item) {
      var abbrev = (item.abbreviation || '').toLowerCase();
      return abbrev.indexOf('tcas') !== -1;
    });
    console.log('📋 TCAS数据验证:', tcasItems.length, '条');
    tcasItems.forEach(function(item) {
      console.log('  -', item.abbreviation, '(' + item.source + ')');
    });
    
    // 更新数据和计数
    this.setData({
      allData: allData,
      displayData: allData,
      totalCount: allData.length
    });
    
    // 更新标签计数
    this.updateTabCounts();
    
    console.log('缩写数据加载完成，共', allData.length, '条');
  },

  // 更新标签计数
  updateTabCounts: function() {
    var self = this;
    var allData = this.data.allData;
    var tabList = this.data.tabList;
    
    var counts = {
      'all': allData.length,
      'AIP': 0,
      'Airbus': 0
    };
    
    allData.forEach(function(item) {
      if (item.source === 'AIP') {
        counts.AIP++;
      } else if (item.source === 'Airbus') {
        counts.Airbus++;
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
        return item.source === activeTab;
      });
      console.log('📋 分类过滤后:', filteredData.length, '条');
    }
    
    // 搜索过滤
    if (searchValue) {
      var beforeSearchCount = filteredData.length;
      filteredData = filteredData.filter(function(item) {
        var abbrev = (item.abbreviation || '').toLowerCase();
        var englishFull = (item.english_full || '').toLowerCase();
        var chineseTranslation = (item.chinese_translation || '').toLowerCase();
        
        var matches = abbrev.indexOf(searchValue) !== -1 ||
                     englishFull.indexOf(searchValue) !== -1 ||
                     chineseTranslation.indexOf(searchValue) !== -1;
        
        // 如果搜索tcas，记录匹配详情
        if (searchValue === 'tcas' && matches) {
          console.log('✅ 找到TCAS匹配:', {
            缩写: item.abbreviation,
            英文: item.english_full,
            中文: item.chinese_translation,
            来源: item.source
          });
        }
        
        return matches;
      });
      console.log('🎯 搜索过滤:', beforeSearchCount, '→', filteredData.length, '条');
    }
    
    console.log('📊 最终结果:', filteredData.length, '条数据');
    
    this.setData({
      displayData: filteredData
    });
  },

  // 显示详情
  showAbbreviationDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayData[index];
    
    if (item) {
      this.setData({
        selectedAbbreviation: item,
        showDetailPopup: true
      });
    }
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedAbbreviation: {}
    });
  },

  // 复制缩写
  copyAbbreviation: function() {
    var item = this.data.selectedAbbreviation;
    if (item && item.abbreviation) {
      wx.setClipboardData({
        data: item.abbreviation,
        success: function() {
          wx.showToast({
            title: '缩写已复制',
            icon: 'success'
          });
        }
      });
    }
  },

  // 复制英文全称
  copyEnglishFull: function() {
    var item = this.data.selectedAbbreviation;
    if (item && item.english_full) {
      wx.setClipboardData({
        data: item.english_full,
        success: function() {
          wx.showToast({
            title: '英文全称已复制',
            icon: 'success'
          });
        }
      });
    }
  }
};

Page(BasePage.createPage(pageConfig));