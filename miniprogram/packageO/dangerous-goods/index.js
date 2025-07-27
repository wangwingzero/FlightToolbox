// 危险品查询页面
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    activeTab: 'regulations',
    
    // 搜索相关
    searchValue: '',
    
    // 数据列表
    regulationsData: [],
    emergencyData: [],
    hiddenGoodsData: [],
    
    // 搜索结果
    filteredRegulations: [],
    filteredEmergency: [],
    filteredHidden: [],
    
    // 加载状态
    loading: true,
    
    // 详情弹窗相关
    showDetailPopup: false,
    detailType: '', // 'regulation', 'emergency', 'hidden'
    detailData: {},
    activeCollapse: [],
  },

  customOnLoad: function(options) {
    this.loadDangerousGoodsData();
  },

  // 加载危险品数据
  loadDangerousGoodsData: function() {
    var self = this;
    self.setData({ loading: true });
    
    try {
      // 异步加载分包数据
      self.loadRegulationsData();
      self.loadEmergencyData();
      self.loadHiddenGoodsData();
    } catch (error) {
      console.error('加载危险品数据失败:', error);
      self.handleError(error, '加载危险品数据');
    }
    
    // 延迟关闭loading，确保数据加载完成
    setTimeout(function() {
      self.setData({ loading: false });
    }, 1000);
  },

  // 加载危险品携带规定数据
  loadRegulationsData: function() {
    var self = this;
    console.log('🔄 开始加载危险品规定数据...');
    
    // 使用异步require进行跨分包数据加载
    require('../../packageG/dangerousGoodsRegulations.js', function(regulationsModule) {
      try {
        var rawData = regulationsModule.dangerousGoodsRegulations || [];
        // 处理描述文本截断
        var data = rawData.map(function(item) {
          return {
            item_name: item.item_name,
            description: item.description,
            category: item.category,
            regulations: item.regulations,
            allowed_in_carry_on: item.allowed_in_carry_on,
            allowed_in_checked_baggage: item.allowed_in_checked_baggage,
            carry_on_limit: item.carry_on_limit,
            checked_limit: item.checked_limit,
            requires_operator_approval: item.requires_operator_approval,
            requires_captain_notification: item.requires_captain_notification,
            special_condition: item.special_condition,
            shortDescription: item.description && item.description.length > 80 
              ? item.description.substring(0, 80) + '...' 
              : (item.description || '暂无描述')
          };
        });
        console.log('✅ 成功从packageG加载危险品规定数据:', data.length, '条');
        self.setData({ 
          regulationsData: data,
          filteredRegulations: data
        });
      } catch (error) {
        console.error('❌ 处理危险品规定数据失败:', error);
        self.setData({ 
          regulationsData: [],
          filteredRegulations: []
        });
      }
    }, function(error) {
      console.error('❌ 从packageG加载危险品规定数据失败:', error);
      // 兜底方案：使用默认数据
      var defaultData = [
        {
          item_name: "示例危险品",
          description: "数据加载失败，请检查网络连接",
          shortDescription: "数据加载失败，请检查网络连接"
        }
      ];
      self.setData({ 
        regulationsData: defaultData,
        filteredRegulations: defaultData
      });
    });
  },

  // 加载应急响应程序数据
  loadEmergencyData: function() {
    var self = this;
    console.log('🔄 开始加载应急响应数据...');
    
    // 使用异步require进行跨分包数据加载
    require('../../packageG/emergencyResponseProcedures.js', function(emergencyModule) {
      try {
        var data = emergencyModule.emergencyResponseProcedures || [];
        console.log('✅ 成功从packageG加载应急响应数据:', data.length, '条');
        self.setData({ 
          emergencyData: data,
          filteredEmergency: data
        });
      } catch (error) {
        console.error('❌ 处理应急响应数据失败:', error);
        self.setData({ 
          emergencyData: [],
          filteredEmergency: []
        });
      }
    }, function(error) {
      console.error('❌ 从packageG加载应急响应数据失败:', error);
      // 兜底方案：使用默认数据
      var defaultData = [
        {
          code: "示例代码",
          inherent_hazard: "数据加载失败",
          aircraft_hazard: "请检查网络连接",
          occupant_hazard: "或联系开发者"
        }
      ];
      self.setData({ 
        emergencyData: defaultData,
        filteredEmergency: defaultData
      });
    });
  },

  // 加载隐含危险品数据
  loadHiddenGoodsData: function() {
    var self = this;
    console.log('🔄 开始加载隐含危险品数据...');
    
    // 使用异步require进行跨分包数据加载
    require('../../packageG/hiddenDangerousGoods.js', function(hiddenModule) {
      try {
        var data = hiddenModule.hiddenDangerousGoods || [];
        console.log('✅ 成功从packageG加载隐含危险品数据:', data.length, '条');
        self.setData({ 
          hiddenGoodsData: data,
          filteredHidden: data
        });
      } catch (error) {
        console.error('❌ 处理隐含危险品数据失败:', error);
        self.setData({ 
          hiddenGoodsData: [],
          filteredHidden: []
        });
      }
    }, function(error) {
      console.error('❌ 从packageG加载隐含危险品数据失败:', error);
      // 兜底方案：使用默认数据
      var defaultData = [
        {
          category_zh: "示例类别",
          category_en: "Example Category",
          description: "数据加载失败，请检查网络连接"
        }
      ];
      self.setData({ 
        hiddenGoodsData: defaultData,
        filteredHidden: defaultData
      });
    });
  },

  // 切换标签页
  onTabChange: function(event) {
    var activeTab = event.currentTarget.dataset.tab;
    this.setData({ activeTab: activeTab });
    
    // 切换标签时清空搜索
    this.setData({ searchValue: '' });
    this.clearSearch();
  },

  // 搜索处理
  onSearch: function(event) {
    var searchValue = event.detail || this.data.searchValue;
    this.performSearch(searchValue);
  },

  onSearchChange: function(event) {
    var searchValue = event.detail;
    this.setData({ searchValue: searchValue });
    this.performSearch(searchValue);
  },

  onSearchClear: function() {
    this.setData({ searchValue: '' });
    this.clearSearch();
  },

  // 执行搜索
  performSearch: function(searchValue) {
    if (!searchValue.trim()) {
      this.clearSearch();
      return;
    }

    var searchLower = searchValue.toLowerCase();

    // 搜索携带规定
    var filteredRegulations = this.data.regulationsData.filter(function(item) {
      return (item.item_name && item.item_name.toLowerCase().includes(searchLower)) ||
             (item.description && item.description.toLowerCase().includes(searchLower));
    }).map(function(item) {
      return {
        item_name: item.item_name,
        description: item.description,
        category: item.category,
        regulations: item.regulations,
        allowed_in_carry_on: item.allowed_in_carry_on,
        allowed_in_checked_baggage: item.allowed_in_checked_baggage,
        carry_on_limit: item.carry_on_limit,
        checked_limit: item.checked_limit,
        requires_operator_approval: item.requires_operator_approval,
        requires_captain_notification: item.requires_captain_notification,
        special_condition: item.special_condition,
        shortDescription: item.description && item.description.length > 80 
          ? item.description.substring(0, 80) + '...' 
          : (item.description || '暂无描述')
      };
    });

    // 搜索应急响应
    var filteredEmergency = this.data.emergencyData.filter(function(item) {
      return (item.inherent_hazard && item.inherent_hazard.toLowerCase().includes(searchLower)) ||
             (item.aircraft_hazard && item.aircraft_hazard.toLowerCase().includes(searchLower)) ||
             (item.occupant_hazard && item.occupant_hazard.toLowerCase().includes(searchLower));
    });

    // 搜索隐含危险品
    var filteredHidden = this.data.hiddenGoodsData.filter(function(item) {
      return (item.category_zh && item.category_zh.toLowerCase().includes(searchLower)) ||
             (item.category_en && item.category_en.toLowerCase().includes(searchLower)) ||
             (item.description && item.description.toLowerCase().includes(searchLower));
    });

    this.setData({
      filteredRegulations: filteredRegulations,
      filteredEmergency: filteredEmergency,
      filteredHidden: filteredHidden
    });
  },

  // 清空搜索
  clearSearch: function() {
    this.setData({
      filteredRegulations: this.data.regulationsData,
      filteredEmergency: this.data.emergencyData,
      filteredHidden: this.data.hiddenGoodsData
    });
  },

  // 查看详情（新的方式）
  viewRegulationDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    this.setData({
      showDetailPopup: true,
      detailType: 'regulation',
      detailData: {
        title: '危险品携带规定',
        item_name: item.item_name,
        description: item.description,
        category: item.category,
        regulations: item.regulations,
        allowed_in_carry_on: item.allowed_in_carry_on,
        allowed_in_checked_baggage: item.allowed_in_checked_baggage,
        carry_on_limit: item.carry_on_limit,
        checked_limit: item.checked_limit,
        requires_operator_approval: item.requires_operator_approval,
        requires_captain_notification: item.requires_captain_notification,
        special_condition: item.special_condition
      }
    });
  },

  viewEmergencyDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    this.setData({
      showDetailPopup: true,
      detailType: 'emergency',
      detailData: {
        title: '应急响应程序 ' + item.code,
        code: item.code,
        inherent_hazard: item.inherent_hazard,
        aircraft_hazard: item.aircraft_hazard,
        occupant_hazard: item.occupant_hazard,
        spill_leak_procedure: item.spill_leak_procedure,
        fire_fighting_procedure: item.fire_fighting_procedure,
        other_considerations: item.other_considerations
      }
    });
  },

  viewHiddenDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    this.setData({
      showDetailPopup: true,
      detailType: 'hidden',
      detailData: {
        title: '隐含危险品详情',
        category_zh: item.category_zh,
        category_en: item.category_en,
        description: item.description,
        possible_items: item.possible_items
      }
    });
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({ 
      showDetailPopup: false,
      detailType: '',
      detailData: {},
      activeCollapse: []
    });
  },

  // 折叠面板变化
  onCollapseChange: function(event) {
    this.setData({
      activeCollapse: event.detail
    });
  },

  // 保留原有的方法作为备用（已废弃）
  showRegulationDetail: function(item) {
    // 使用新的弹窗方式
    this.setData({
      showDetailPopup: true,
      detailType: 'regulation',
      detailData: {
        title: '危险品携带规定',
        item_name: item.item_name,
        description: item.description,
        category: item.category,
        regulations: item.regulations,
        allowed_in_carry_on: item.allowed_in_carry_on,
        allowed_in_checked_baggage: item.allowed_in_checked_baggage,
        carry_on_limit: item.carry_on_limit,
        checked_limit: item.checked_limit,
        requires_operator_approval: item.requires_operator_approval,
        requires_captain_notification: item.requires_captain_notification,
        special_condition: item.special_condition
      }
    });
  },

  showEmergencyDetail: function(item) {
    // 使用新的弹窗方式
    this.setData({
      showDetailPopup: true,
      detailType: 'emergency',
      detailData: {
        title: '应急响应程序 ' + item.code,
        code: item.code,
        inherent_hazard: item.inherent_hazard,
        aircraft_hazard: item.aircraft_hazard,
        occupant_hazard: item.occupant_hazard,
        spill_leak_procedure: item.spill_leak_procedure,
        fire_fighting_procedure: item.fire_fighting_procedure,
        other_considerations: item.other_considerations
      }
    });
  },

  // 广告事件处理
  adLoad: function() {
    console.log('横幅广告加载成功');
  },
  
  adError: function(err) {
    console.error('横幅广告加载失败', err);
  },
  
  adClose: function() {
    console.log('横幅广告关闭');
  },

  showHiddenDetail: function(item) {
    // 使用新的弹窗方式
    this.setData({
      showDetailPopup: true,
      detailType: 'hidden',
      detailData: {
        title: '隐含危险品详情',
        category_zh: item.category_zh,
        category_en: item.category_en,
        description: item.description,
        possible_items: item.possible_items
      }
    });
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));