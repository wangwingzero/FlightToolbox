// 危险品查询页面
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    activeTab: 'all',

    // 搜索相关
    searchValue: '',

    // 数据列表
    regulationsData: [],
    emergencyData: [],
    hiddenGoodsData: [],
    segregationData: null, // 隔离规则数据（矩阵+注释）
    groundEmergencyData: [], // 地面应急数据

    // 搜索结果
    filteredRegulations: [],
    filteredEmergency: [],
    filteredHidden: [],
    filteredGroundEmergency: [],

    // 总数量
    totalCount: 0,

    // 加载状态
    loading: true,

    // 详情弹窗相关
    showDetailPopup: false,
    detailType: '', // 'regulation', 'emergency', 'hidden', 'groundEmergency'
    detailData: {},
    activeCollapse: [],

    // 导航历史（用于实现返回功能）
    navigationHistory: [],

    // 隔离规则相关
    segregationMatrix: null,
    segregationNotes: null,
    selectedClass1: '',
    selectedClass2: '',
    segregationResult: '',

    // 危险品类别列表（带中文说明）
    classList: [
      '1_excl_1.4S (1类爆炸品,不含1.4S)',
      '2.1 易燃气体',
      '2.2, 2.3 非易燃无毒/毒性气体',
      '3 易燃液体',
      '4.1 易燃固体',
      '4.2 自燃物质',
      '4.3 遇水释放易燃气体的物质',
      '5.1 氧化剂',
      '5.2 有机过氧化物',
      '8 腐蚀性物质',
      '9_battery (锂电池-注4)'
    ],
    classIndex1: -1,
    classIndex2: -1,
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
      self.loadSegregationData();
      self.loadGroundEmergencyData();
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
        self.setData({
          regulationsData: data,
          filteredRegulations: data
        });
        // 更新总数量
        self.updateTotalCount();
      } catch (error) {
        self.setData({
          regulationsData: [],
          filteredRegulations: []
        });
      }
    }, function(error) {
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

    // 使用异步require进行跨分包数据加载
    require('../../packageG/emergencyResponseProcedures.js', function(emergencyModule) {
      try {
        var data = emergencyModule.emergencyResponseProcedures || [];
        self.setData({
          emergencyData: data,
          filteredEmergency: data
        });
        // 更新总数量
        self.updateTotalCount();
      } catch (error) {
        self.setData({
          emergencyData: [],
          filteredEmergency: []
        });
      }
    }, function(error) {
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

    // 使用异步require进行跨分包数据加载
    require('../../packageG/hiddenDangerousGoods.js', function(hiddenModule) {
      try {
        var data = hiddenModule.hiddenDangerousGoods || [];
        self.setData({
          hiddenGoodsData: data,
          filteredHidden: data
        });
        // 更新总数量
        self.updateTotalCount();
      } catch (error) {
        self.setData({
          hiddenGoodsData: [],
          filteredHidden: []
        });
      }
    }, function(error) {
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

  // 加载隔离规则数据
  loadSegregationData: function() {
    var self = this;

    // 使用异步require进行跨分包数据加载
    require('../../packageG/segregationRules.js', function(segregationModule) {
      try {
        var matrix = segregationModule.segregationMatrix || {};
        var notes = segregationModule.segregationNotes || {};
        self.setData({
          segregationMatrix: matrix,
          segregationNotes: notes,
          segregationData: {
            matrix: matrix,
            notes: notes
          }
        });
        // 更新总数量
        self.updateTotalCount();
      } catch (error) {
        self.setData({
          segregationMatrix: null,
          segregationNotes: null,
          segregationData: null
        });
      }
    }, function(error) {
      // 兜底方案
      self.setData({
        segregationMatrix: null,
        segregationNotes: null,
        segregationData: null
      });
    });
  },

  // 加载地面应急数据
  loadGroundEmergencyData: function() {
    var self = this;

    // 使用异步require进行跨分包数据加载
    require('../../packageG/groundHandlingEmergencyChart.js', function(groundModule) {
      try {
        var data = groundModule.groundHandlingEmergencyChart || [];
        self.setData({
          groundEmergencyData: data,
          filteredGroundEmergency: data
        });
        // 更新总数量
        self.updateTotalCount();
      } catch (error) {
        self.setData({
          groundEmergencyData: [],
          filteredGroundEmergency: []
        });
      }
    }, function(error) {
      // 兜底方案
      var defaultData = [
        {
          code: "示例代码",
          class: "示例类别",
          category_zh: "数据加载失败",
          hazard_description_zh: "请检查网络连接"
        }
      ];
      self.setData({
        groundEmergencyData: defaultData,
        filteredGroundEmergency: defaultData
      });
    });
  },

  // 更新总数量
  updateTotalCount: function() {
    var totalCount = this.data.filteredRegulations.length +
                     this.data.filteredEmergency.length +
                     this.data.filteredHidden.length +
                     this.data.filteredGroundEmergency.length +
                     (this.data.segregationData ? 1 : 0);
    this.setData({ totalCount: totalCount });
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

    // 搜索地面应急
    var filteredGroundEmergency = this.data.groundEmergencyData.filter(function(item) {
      return (item.code && item.code.toLowerCase().includes(searchLower)) ||
             (item.class && item.class.toLowerCase().includes(searchLower)) ||
             (item.category_zh && item.category_zh.toLowerCase().includes(searchLower)) ||
             (item.category_en && item.category_en.toLowerCase().includes(searchLower)) ||
             (item.hazard_description_zh && item.hazard_description_zh.toLowerCase().includes(searchLower));
    });

    // 计算总数量
    var totalCount = filteredRegulations.length + filteredEmergency.length + filteredHidden.length + filteredGroundEmergency.length;

    this.setData({
      filteredRegulations: filteredRegulations,
      filteredEmergency: filteredEmergency,
      filteredHidden: filteredHidden,
      filteredGroundEmergency: filteredGroundEmergency,
      totalCount: totalCount
    });
  },

  // 清空搜索
  clearSearch: function() {
    var totalCount = this.data.regulationsData.length +
                     this.data.emergencyData.length +
                     this.data.hiddenGoodsData.length +
                     this.data.groundEmergencyData.length +
                     (this.data.segregationData ? 1 : 0);

    this.setData({
      filteredRegulations: this.data.regulationsData,
      filteredEmergency: this.data.emergencyData,
      filteredHidden: this.data.hiddenGoodsData,
      filteredGroundEmergency: this.data.groundEmergencyData,
      totalCount: totalCount
    });
  },

  // 解析文本，识别其中的危险品名称并添加链接
  // currentItemName: 当前物品名称，用于排除自己链接到自己的情况
  parseTextForItems: function(text, currentItemName) {
    if (!text) return [];

    var self = this;
    var result = [];
    var lastIndex = 0;

    // 获取所有危险品名称，并排除当前物品名称
    var allItemNames = self.data.regulationsData.map(function(item) {
      return item.item_name;
    }).filter(function(name) {
      return name && name.trim().length > 0 && name !== currentItemName;
    });

    // 按长度降序排序，优先匹配长名称
    allItemNames.sort(function(a, b) {
      return b.length - a.length;
    });

    // 创建正则表达式来匹配危险品名称
    var matches = [];
    allItemNames.forEach(function(itemName) {
      var index = text.indexOf(itemName);
      while (index !== -1) {
        matches.push({
          start: index,
          end: index + itemName.length,
          itemName: itemName
        });
        index = text.indexOf(itemName, index + 1);
      }
    });

    // 按起始位置排序
    matches.sort(function(a, b) {
      return a.start - b.start;
    });

    // 去除重叠的匹配
    var filteredMatches = [];
    var lastEnd = -1;
    matches.forEach(function(match) {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    });

    // 构建结果数组
    filteredMatches.forEach(function(match) {
      // 添加普通文本
      if (lastIndex < match.start) {
        result.push({
          type: 'text',
          text: text.substring(lastIndex, match.start)
        });
      }

      // 添加术语
      result.push({
        type: 'term',
        text: match.itemName,
        itemName: match.itemName
      });

      lastIndex = match.end;
    });

    // 添加剩余的文本
    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        text: text.substring(lastIndex)
      });
    }

    return result;
  },

  // 查看详情（新的方式）
  viewRegulationDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    var self = this;

    // 解析描述文本中的危险品名称，排除当前物品本身
    var descriptionParts = self.parseTextForItems(item.description, item.item_name);

    self.setData({
      showDetailPopup: true,
      detailType: 'regulation',
      detailData: {
        title: '危险品携带规定',
        item_name: item.item_name,
        description: item.description,
        descriptionParts: descriptionParts,
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
    var self = this;

    // 解析各个危险类型文本中的危险品名称（应急响应没有当前物品概念，所以不排除）
    var inherent_hazard_parts = self.parseTextForItems(item.inherent_hazard);
    var aircraft_hazard_parts = self.parseTextForItems(item.aircraft_hazard);
    var occupant_hazard_parts = self.parseTextForItems(item.occupant_hazard);

    self.setData({
      showDetailPopup: true,
      detailType: 'emergency',
      detailData: {
        title: '应急响应程序 ' + item.code,
        code: item.code,
        inherent_hazard: item.inherent_hazard,
        inherent_hazard_parts: inherent_hazard_parts,
        aircraft_hazard: item.aircraft_hazard,
        aircraft_hazard_parts: aircraft_hazard_parts,
        occupant_hazard: item.occupant_hazard,
        occupant_hazard_parts: occupant_hazard_parts,
        spill_leak_procedure: item.spill_leak_procedure,
        fire_fighting_procedure: item.fire_fighting_procedure,
        other_considerations: item.other_considerations
      }
    });
  },

  viewHiddenDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    var self = this;

    // 解析描述文本中的危险品名称（隐含危险品使用类别名称作为排除）
    var descriptionParts = self.parseTextForItems(item.description, item.category_zh);

    self.setData({
      showDetailPopup: true,
      detailType: 'hidden',
      detailData: {
        title: '隐含危险品详情',
        category_zh: item.category_zh,
        category_en: item.category_en,
        description: item.description,
        descriptionParts: descriptionParts,
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
      activeCollapse: [],
      navigationHistory: []
    });
  },

  // 处理术语点击
  onItemClick: function(event) {
    var itemName = event.currentTarget.dataset.item;
    var self = this;

    // 查找该危险品
    var item = self.data.regulationsData.find(function(item) {
      return item.item_name === itemName;
    });

    if (!item) {
      wx.showToast({
        title: '未找到该危险品',
        icon: 'none'
      });
      return;
    }

    // 保存当前状态到导航历史
    var currentState = {
      detailType: self.data.detailType,
      detailData: self.data.detailData
    };
    var navigationHistory = self.data.navigationHistory.concat([currentState]);

    // 解析新物品的描述文本，排除新物品本身的名称
    var descriptionParts = self.parseTextForItems(item.description, item.item_name);

    // 显示新物品的详情
    self.setData({
      detailType: 'regulation',
      detailData: {
        title: '危险品携带规定',
        item_name: item.item_name,
        description: item.description,
        descriptionParts: descriptionParts,
        category: item.category,
        regulations: item.regulations,
        allowed_in_carry_on: item.allowed_in_carry_on,
        allowed_in_checked_baggage: item.allowed_in_checked_baggage,
        carry_on_limit: item.carry_on_limit,
        checked_limit: item.checked_limit,
        requires_operator_approval: item.requires_operator_approval,
        requires_captain_notification: item.requires_captain_notification,
        special_condition: item.special_condition
      },
      navigationHistory: navigationHistory
    });
  },

  // 返回上一个详情页面
  goBackInHistory: function() {
    var self = this;
    var navigationHistory = self.data.navigationHistory;

    if (navigationHistory.length === 0) {
      return;
    }

    // 获取上一个状态
    var previousState = navigationHistory[navigationHistory.length - 1];
    var newHistory = navigationHistory.slice(0, -1);

    // 恢复上一个状态
    self.setData({
      detailType: previousState.detailType,
      detailData: previousState.detailData,
      navigationHistory: newHistory
    });
  },

  // 折叠面板变化
  onCollapseChange: function(event) {
    this.setData({
      activeCollapse: event.detail
    });
  },

  // 查看地面应急详情
  viewGroundEmergencyDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    var self = this;

    self.setData({
      showDetailPopup: true,
      detailType: 'groundEmergency',
      detailData: {
        title: '地面应急响应 ' + item.code,
        code: item.code,
        class: item.class,
        category_zh: item.category_zh,
        category_en: item.category_en,
        hazard_description_zh: item.hazard_description_zh,
        hazard_description_en: item.hazard_description_en,
        immediate_action_zh: item.immediate_action_zh,
        immediate_action_en: item.immediate_action_en
      }
    });
  },

  // 隔离规则：选择第一个危险品类别
  onSelectClass1: function(event) {
    var index = event.detail.value;
    var classList = this.data.classList;
    var selectedClass = classList[index];
    this.setData({
      selectedClass1: selectedClass,
      classIndex1: index
    });
    this.checkSegregation();
  },

  // 隔离规则：选择第二个危险品类别
  onSelectClass2: function(event) {
    var index = event.detail.value;
    var classList = this.data.classList;
    var selectedClass = classList[index];
    this.setData({
      selectedClass2: selectedClass,
      classIndex2: index
    });
    this.checkSegregation();
  },

  // 检查隔离要求
  checkSegregation: function() {
    var class1 = this.data.selectedClass1;
    var class2 = this.data.selectedClass2;
    var matrix = this.data.segregationMatrix;

    if (!class1 || !class2 || !matrix) {
      this.setData({ segregationResult: '' });
      return;
    }

    var result = '';
    if (matrix[class1] && matrix[class1][class2]) {
      result = matrix[class1][class2];
    }

    this.setData({ segregationResult: result });
  },

  // 查看隔离规则注释
  viewSegregationNote: function(event) {
    var noteKey = event.currentTarget.dataset.note;
    var notes = this.data.segregationNotes;

    if (!notes || !notes[noteKey]) {
      wx.showToast({
        title: '注释未找到',
        icon: 'none'
      });
      return;
    }

    var note = notes[noteKey];
    wx.showModal({
      title: noteKey.toUpperCase(),
      content: note.zh + '\n\n' + note.en,
      showCancel: false,
      confirmText: '知道了'
    });
  },

};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));