// 飞机参数查询页面
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    aircraftList: [],
    filteredList: [],
    searchValue: '',
    selectedAircraft: null,
    showDetail: false
  },
  
  customOnLoad: function(options) {
    this.loadAircraftData();
  },
  
  // 加载飞机数据
  loadAircraftData: function() {
    var self = this;
    try {
      // 从同一分包加载数据
      var aircraftData = require('../aircraftData.js');
      
      self.setData({
        aircraftList: aircraftData,
        filteredList: aircraftData
      });
    } catch (error) {
      console.error('❌ 加载飞机数据失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },
  
  // 搜索功能
  onSearchChange: function(e) {
    var searchValue = '';
    if (e && e.detail) {
      searchValue = (e.detail.value || e.detail || '').toString().trim();
    }
    
    this.setData({
      searchValue: searchValue
    });
    
    // 实时搜索
    if (searchValue === '') {
      this.setData({
        filteredList: this.data.aircraftList
      });
    } else {
      this.performSearch(searchValue);
    }
  },
  
  // 执行搜索
  performSearch: function(searchValue) {
    var searchLower = searchValue.toLowerCase();
    var filteredList = this.data.aircraftList.filter(function(aircraft) {
      return (aircraft.model && aircraft.model.toLowerCase().includes(searchLower)) ||
             (aircraft.manufacturer && aircraft.manufacturer.toLowerCase().includes(searchLower)) ||
             (aircraft.icaoAerodromeReferenceCode && aircraft.icaoAerodromeReferenceCode.toLowerCase().includes(searchLower));
    });
    
    this.setData({
      filteredList: filteredList
    });
  },
  
  // 清空搜索
  onSearchClear: function() {
    this.setData({
      searchValue: '',
      filteredList: this.data.aircraftList
    });
  },
  
  // 选择飞机
  selectAircraft: function(e) {
    var index = e.currentTarget.dataset.index;
    var aircraft = this.data.filteredList[index];
    
    this.setData({
      selectedAircraft: aircraft,
      showDetail: true
    });
  },
  
  // 关闭详情
  closeDetail: function() {
    this.setData({
      showDetail: false,
      selectedAircraft: null
    });
  },
  
};

Page(BasePage.createPage(pageConfig));