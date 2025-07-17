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
    console.log('飞机参数页面加载');
    this.loadAircraftData();
  },
  
  // 加载飞机数据
  loadAircraftData: function() {
    var self = this;
    try {
      // 从同一分包加载数据
      var aircraftData = require('../aircraftData.js');
      console.log('✅ 成功加载飞机数据，共', aircraftData.length, '个型号');
      
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
    var searchValue = e.detail.value.toLowerCase();
    var filteredList = this.data.aircraftList.filter(function(aircraft) {
      return aircraft.model.toLowerCase().includes(searchValue);
    });
    
    this.setData({
      searchValue: searchValue,
      filteredList: filteredList
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
  
  // 复制参数
  copyParameter: function(e) {
    var value = e.currentTarget.dataset.value;
    if (value && value !== 'null') {
      wx.setClipboardData({
        data: value,
        success: function() {
          wx.showToast({
            title: '已复制',
            icon: 'success'
          });
        }
      });
    }
  }
};

Page(BasePage.createPage(pageConfig));