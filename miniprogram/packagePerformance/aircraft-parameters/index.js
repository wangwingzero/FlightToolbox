// 飞机参数查询页面
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    aircraftList: [],
    filteredList: [],
    selectedCategory: null, // 当前选择的分类
    showCategoryList: true, // 是否显示分类选择
    selectedAircraft: null,
    showDetail: false,
    // 分类配置
    categories: [
      { id: 'Airbus', name: '空客', icon: '✈️', color: '#3b82f6', count: 0 },
      { id: 'Boeing', name: '波音', icon: '🛫', color: '#8b5cf6', count: 0 },
      { id: 'COMAC', name: '商飞', icon: '🇨🇳', color: '#10b981', count: 0 },
      { id: 'OTHER', name: '其他', icon: '🌐', color: '#f59e0b', count: 0 }
    ]
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

      // 统计各分类的机型数量
      var categories = self.data.categories;
      categories.forEach(function(cat) {
        if (cat.id === 'OTHER') {
          cat.count = aircraftData.filter(function(a) {
            return a.manufacturer !== 'Airbus' && a.manufacturer !== 'Boeing' && a.manufacturer !== 'COMAC';
          }).length;
        } else {
          cat.count = aircraftData.filter(function(a) {
            return a.manufacturer === cat.id;
          }).length;
        }
      });

      self.setData({
        aircraftList: aircraftData,
        categories: categories
      });
    } catch (error) {
      console.error('❌ 加载飞机数据失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },

  // 选择分类
  selectCategory: function(e) {
    var categoryId = e.currentTarget.dataset.id;
    var self = this;

    // 筛选该分类下的机型
    var filteredList;
    if (categoryId === 'OTHER') {
      filteredList = self.data.aircraftList.filter(function(aircraft) {
        return aircraft.manufacturer !== 'Airbus' && aircraft.manufacturer !== 'Boeing' && aircraft.manufacturer !== 'COMAC';
      });
    } else {
      filteredList = self.data.aircraftList.filter(function(aircraft) {
        return aircraft.manufacturer === categoryId;
      });
    }

    self.setData({
      selectedCategory: categoryId,
      showCategoryList: false,
      filteredList: filteredList
    });
  },

  // 返回分类选择
  backToCategories: function() {
    this.setData({
      selectedCategory: null,
      showCategoryList: true,
      filteredList: []
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