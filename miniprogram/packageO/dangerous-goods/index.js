// 危险品查询页面
var BasePage = require('../../utils/base-page.js');
var AppConfig = require('../../utils/app-config.js');

var pageConfig = {
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 无广告状态
    isAdFree: false,

    activeTab: 'all',

    // 常量定义
    PAGE_SIZE: 20,                    // 每页显示条数
    LOADING_DELAY: 1000,              // 加载延迟(ms)
    ALL_TAB_CATEGORY_COUNT: 4,        // "全部"标签页显示的分类数量
    DESCRIPTION_MAX_LENGTH: 80,       // 描述文本最大长度

    // 搜索相关
    searchValue: '',

    // 数据列表
    regulationsData: [],
    emergencyData: [],
    hiddenGoodsData: [],
    segregationData: null, // 隔离规则数据（矩阵+注释）
    groundEmergencyData: [], // 地面应急数据
    hazardLabelsAndMarks: [],
    crewProcedures: [],
    specialCargoSegregation: [],
    specialCargoSymbols: {},

    // 搜索结果
    filteredRegulations: [],
    filteredEmergency: [],
    filteredHidden: [],
    filteredGroundEmergency: [],
    filteredHazardLabelsAndMarks: [],
    filteredCrewProcedures: [],

    // 显示数据（分页）
    displayRegulations: [],
    displayEmergency: [],
    displayHidden: [],
    displayGroundEmergency: [],

    // 分页相关
    pageSize: 20, // 每页显示20条
    currentPage: 0, // 当前页码（从0开始）
    hasMore: true, // 是否还有更多数据
    isLoading: false, // 是否正在加载
    remainingCount: 0, // 剩余数据量

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
    // 读取分包页面广告开关状态（分包页面使用subPackageAdEnabled）
    this.setData({
      nativeAdEnabled: AppConfig.ad.subPackageAdEnabled || false
    });

    this.loadDangerousGoodsData();
  },

  customOnShow: function() {
    // 检查无广告状态
    this.checkAdFreeStatus();
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
      self.loadHazardLabelsAndMarks();
      self.loadCrewProcedures();
      self.loadSpecialCargoSegregation();
    } catch (error) {
      console.error('[危险品] 加载数据失败:', error);
      self.handleError(error, '加载危险品数据');

      // 提供重试选项
      wx.showModal({
        title: '数据加载失败',
        content: '危险品数据加载失败，是否重试？',
        confirmText: '重试',
        cancelText: '取消',
        success: function(res) {
          if (res.confirm) {
            self.loadDangerousGoodsData();
          }
        }
      });
    }

    // 延迟关闭loading，确保数据加载完成
    setTimeout(function() {
      self.setData({ loading: false });
    }, self.data.LOADING_DELAY);
  },

  // 处理单条数据项（提取公共逻辑）
  processRegulationItem: function(item) {
    var maxLen = this.data.DESCRIPTION_MAX_LENGTH;
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
      shortDescription: item.description && item.description.length > maxLen
        ? item.description.substring(0, maxLen) + '...'
        : (item.description || '暂无描述'),
      // 搜索索引：预处理小写文本，提升搜索性能
      _searchIndex: ((item.item_name || '') + ' ' + (item.description || '')).toLowerCase()
    };
  },

  // 验证数据完整性
  validateData: function(data, requiredField, dataName) {
    if (!Array.isArray(data)) {
      console.error('[危险品] ' + dataName + '数据格式错误：不是数组');
      return [];
    }

    if (data.length === 0) {
      console.warn('[危险品] ' + dataName + '数据为空');
      return [];
    }

    // 过滤无效数据
    var validData = data.filter(function(item) {
      return item && item[requiredField] && typeof item[requiredField] === 'string';
    });

    if (validData.length < data.length) {
      console.warn('[危险品] ' + dataName + '过滤了' + (data.length - validData.length) + '条无效数据');
    }

    return validData;
  },

  // 加载危险品携带规定数据
  loadRegulationsData: function() {
    var self = this;

    // 使用异步require进行跨分包数据加载
    require('../../packageG/dangerousGoodsRegulations.js', function(regulationsModule) {
      try {
        var rawData = regulationsModule.dangerousGoodsRegulations || [];

        // 验证数据完整性
        var validData = self.validateData(rawData, 'item_name', '携带规定');

        if (validData.length === 0 && rawData.length > 0) {
          wx.showToast({
            title: '危险品规定数据异常',
            icon: 'none',
            duration: 3000
          });
        }

        // 处理数据并建立搜索索引
        var data = validData.map(function(item) {
          return self.processRegulationItem(item);
        });

        self.setData({
          regulationsData: data,
          filteredRegulations: data
        });
        // 更新总数量
        self.updateTotalCount();
      } catch (error) {
        console.error('[危险品] 处理规定数据时出错:', error);
        self.setData({
          regulationsData: [],
          filteredRegulations: []
        });
      }
    }, function(error) {
      console.error('[危险品] 加载分包数据失败:', error);
      // 兜底方案：使用默认数据（离线友好提示）
      var defaultData = [
        {
          item_name: "数据加载失败",
          description: "危险品数据加载失败，请重启小程序。如问题持续，请联系技术支持。",
          shortDescription: "数据加载失败，请重启小程序",
          _searchIndex: "数据加载失败"
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
      console.error('[危险品] 加载应急响应数据失败:', error);
      // 兜底方案：使用默认数据（离线友好提示）
      var defaultData = [
        {
          code: "ERR",
          inherent_hazard: "数据加载失败，请重启小程序",
          aircraft_hazard: "如问题持续，请联系技术支持",
          occupant_hazard: ""
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
      console.error('[危险品] 加载隐含危险品数据失败:', error);
      // 兜底方案：使用默认数据（离线友好提示）
      var defaultData = [
        {
          category_zh: "数据加载失败",
          category_en: "Data Loading Error",
          description: "危险品数据加载失败，请重启小程序。如问题持续，请联系技术支持。"
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
      console.error('[危险品] 加载地面应急数据失败:', error);
      // 兜底方案（离线友好提示）
      var defaultData = [
        {
          code: "ERR",
          class: "错误",
          category_zh: "数据加载失败，请重启小程序",
          hazard_description_zh: "如问题持续，请联系技术支持"
        }
      ];
      self.setData({
        groundEmergencyData: defaultData,
        filteredGroundEmergency: defaultData
      });
    });
  },

  loadHazardLabelsAndMarks: function() {
    var self = this;

    require('../../packageG/hazardLabelsAndMarks.js', function(module) {
      try {
        var data = module.hazardLabelsAndMarks || [];
        self.setData({
          hazardLabelsAndMarks: data,
          filteredHazardLabelsAndMarks: data
        });
        self.updateTotalCount();
      } catch (error) {
        self.setData({
          hazardLabelsAndMarks: [],
          filteredHazardLabelsAndMarks: []
        });
      }
    }, function(error) {
      self.setData({
        hazardLabelsAndMarks: [],
        filteredHazardLabelsAndMarks: []
      });
    });
  },

  loadCrewProcedures: function() {
    var self = this;

    require('../../packageG/dgCrewProcedures.js', function(module) {
      try {
        var data = module.dgCrewProcedures || [];
        self.setData({
          crewProcedures: data,
          filteredCrewProcedures: data
        });
        self.updateTotalCount();
      } catch (error) {
        self.setData({
          crewProcedures: [],
          filteredCrewProcedures: []
        });
      }
    }, function(error) {
      self.setData({
        crewProcedures: [],
        filteredCrewProcedures: []
      });
    });
  },

  loadSpecialCargoSegregation: function() {
    var self = this;

    require('../../packageG/specialCargoSegregation.js', function(module) {
      try {
        var data = module.specialCargoSegregation || [];
        var symbols = module.specialCargoSymbols || {};
        self.setData({
          specialCargoSegregation: data,
          specialCargoSymbols: symbols
        });
        self.updateTotalCount();
      } catch (error) {
        self.setData({
          specialCargoSegregation: [],
          specialCargoSymbols: {}
        });
      }
    }, function(error) {
      self.setData({
        specialCargoSegregation: [],
        specialCargoSymbols: {}
      });
    });
  },

  // 更新总数量
  updateTotalCount: function() {
    var totalCount = this.data.filteredRegulations.length +
                     this.data.filteredEmergency.length +
                     this.data.filteredHidden.length +
                     this.data.filteredGroundEmergency.length +
                     (this.data.filteredHazardLabelsAndMarks ? this.data.filteredHazardLabelsAndMarks.length : 0) +
                     (this.data.filteredCrewProcedures ? this.data.filteredCrewProcedures.length : 0) +
                     (this.data.specialCargoSegregation ? this.data.specialCargoSegregation.length : 0) +
                     (this.data.segregationData ? 1 : 0);
    this.setData({ totalCount: totalCount });

    // 初始化分页数据
    this.loadPageData(true);
  },

  // 切换标签页
  onTabChange: function(event) {
    var activeTab = event.currentTarget.dataset.tab;

    // 清空所有display数据和分页状态
    this.setData({
      activeTab: activeTab,
      currentPage: 0,
      displayRegulations: [],
      displayEmergency: [],
      displayHidden: [],
      displayGroundEmergency: [],
      searchValue: '',
      isLoading: false,
      hasMore: true
    });

    // 切换标签时清空搜索
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

    // 搜索携带规定（使用预建的搜索索引，无需重新map）
    var filteredRegulations = this.data.regulationsData.filter(function(item) {
      // 优先使用预建索引，如无索引则降级到原始搜索
      if (item._searchIndex) {
        return item._searchIndex.includes(searchLower);
      }
      return (item.item_name && item.item_name.toLowerCase().includes(searchLower)) ||
             (item.description && item.description.toLowerCase().includes(searchLower));
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

    // 搜索机组危险品应急程序
    var filteredCrewProcedures = this.data.crewProcedures.filter(function(item) {
      return (item.title_zh && item.title_zh.toLowerCase().includes(searchLower)) ||
             (item.scene_zh && item.scene_zh.toLowerCase().includes(searchLower)) ||
             (item.summary_zh && item.summary_zh.toLowerCase().includes(searchLower));
    });

    // 搜索危险性标签与操作标记
    var filteredHazardLabelsAndMarks = this.data.hazardLabelsAndMarks.filter(function(item) {
      return (item.group_zh && item.group_zh.toLowerCase().includes(searchLower)) ||
             (item.group_en && item.group_en.toLowerCase().includes(searchLower)) ||
             (item.title_zh && item.title_zh.toLowerCase().includes(searchLower)) ||
             (item.title_en && item.title_en.toLowerCase().includes(searchLower)) ||
             (item.code && item.code.toLowerCase().includes(searchLower)) ||
             (item.keywords && item.keywords.toLowerCase().includes(searchLower)) ||
             (item.note_zh && item.note_zh.toLowerCase().includes(searchLower));
    });

    // 计算总数量
    var totalCount = filteredRegulations.length +
                     filteredEmergency.length +
                     filteredHidden.length +
                     filteredGroundEmergency.length +
                     filteredCrewProcedures.length +
                     filteredHazardLabelsAndMarks.length +
                     (this.data.specialCargoSegregation ? this.data.specialCargoSegregation.length : 0) +
                     (this.data.segregationData ? 1 : 0);

    this.setData({
      filteredRegulations: filteredRegulations,
      filteredEmergency: filteredEmergency,
      filteredHidden: filteredHidden,
      filteredGroundEmergency: filteredGroundEmergency,
      filteredCrewProcedures: filteredCrewProcedures,
      filteredHazardLabelsAndMarks: filteredHazardLabelsAndMarks,
      totalCount: totalCount,
      currentPage: 0
    });

    // 重新加载分页数据
    this.loadPageData(true);
  },

  // 清空搜索
  clearSearch: function() {
    var totalCount = this.data.regulationsData.length +
                     this.data.emergencyData.length +
                     this.data.hiddenGoodsData.length +
                     this.data.groundEmergencyData.length +
                     this.data.crewProcedures.length +
                     this.data.hazardLabelsAndMarks.length +
                     (this.data.specialCargoSegregation ? this.data.specialCargoSegregation.length : 0) +
                     (this.data.segregationData ? 1 : 0);

    this.setData({
      filteredRegulations: this.data.regulationsData,
      filteredEmergency: this.data.emergencyData,
      filteredHidden: this.data.hiddenGoodsData,
      filteredGroundEmergency: this.data.groundEmergencyData,
      filteredCrewProcedures: this.data.crewProcedures,
      filteredHazardLabelsAndMarks: this.data.hazardLabelsAndMarks,
      totalCount: totalCount,
      currentPage: 0
    });

    // 重新加载分页数据
    this.loadPageData(true);
  },

  // 解析文本，识别其中的危险品名称并添加链接
  // currentItemName: 当前物品名称，用于排除自己链接到自己的情况
  // 使用正则表达式优化性能，避免O(n×m×k)复杂度
  parseTextForItems: function(text, currentItemName) {
    if (!text) return [];

    var self = this;

    // 获取所有危险品名称，并排除当前物品名称
    var allItemNames = self.data.regulationsData
      .map(function(item) { return item.item_name; })
      .filter(function(name) {
        return name && name.trim().length > 0 && name !== currentItemName;
      });

    // 按长度降序排序，优先匹配长名称
    allItemNames.sort(function(a, b) {
      return b.length - a.length;
    });

    if (allItemNames.length === 0) {
      return [{ type: 'text', text: text }];
    }

    // 使用正则表达式一次性匹配所有危险品名称
    // 转义特殊字符以避免正则错误
    var escapedNames = allItemNames.map(function(name) {
      return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });

    // 构建正则表达式模式
    var pattern;
    try {
      pattern = new RegExp('(' + escapedNames.join('|') + ')', 'g');
    } catch (e) {
      console.error('[危险品] 正则表达式构建失败:', e);
      return [{ type: 'text', text: text }];
    }

    var result = [];
    var lastIndex = 0;
    var match;

    // 使用正则表达式逐个匹配
    while ((match = pattern.exec(text)) !== null) {
      // 添加匹配前的普通文本
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          text: text.substring(lastIndex, match.index)
        });
      }

      // 添加匹配到的术语
      result.push({
        type: 'term',
        text: match[0],
        itemName: match[0]
      });

      lastIndex = pattern.lastIndex;
    }

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

  // 查看机组危险品应急程序详情
  viewCrewProcedureDetail: function(event) {
    var item = event.currentTarget.dataset.item;

    this.setData({
      showDetailPopup: true,
      detailType: 'crewProcedure',
      detailData: {
        title: item.title_zh,
        title_zh: item.title_zh,
        scene_zh: item.scene_zh,
        summary_zh: item.summary_zh,
        steps: item.steps || [],
        warnings: item.warnings || [],
        post_landing: item.post_landing || [],
        role: item.role
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

  // 加载分页数据
  loadPageData: function(isReset) {
    var self = this;
    var activeTab = this.data.activeTab;
    var pageSize = this.data.PAGE_SIZE;
    var currentPage = isReset ? 0 : this.data.currentPage;

    if (activeTab === 'all') {
      // 全部标签页：分别对每种类型按比例分页
      var perTypePageSize = Math.ceil(pageSize / this.data.ALL_TAB_CATEGORY_COUNT);
      var endIndex = (currentPage + 1) * perTypePageSize;

      var displayRegulations = this.data.filteredRegulations.slice(0, endIndex);
      var displayEmergency = this.data.filteredEmergency.slice(0, endIndex);
      var displayHidden = this.data.filteredHidden.slice(0, endIndex);
      var displayGroundEmergency = this.data.filteredGroundEmergency.slice(0, endIndex);

      // 检查是否还有更多数据（任意类型还有数据）
      var hasMore = endIndex < this.data.filteredRegulations.length ||
                    endIndex < this.data.filteredEmergency.length ||
                    endIndex < this.data.filteredHidden.length ||
                    endIndex < this.data.filteredGroundEmergency.length;

      // 计算剩余数据量（使用总和而不是最大值）
      var remainingCount = Math.max(0, this.data.filteredRegulations.length - endIndex) +
                          Math.max(0, this.data.filteredEmergency.length - endIndex) +
                          Math.max(0, this.data.filteredHidden.length - endIndex) +
                          Math.max(0, this.data.filteredGroundEmergency.length - endIndex);

      this.setData({
        displayRegulations: displayRegulations,
        displayEmergency: displayEmergency,
        displayHidden: displayHidden,
        displayGroundEmergency: displayGroundEmergency,
        currentPage: currentPage,
        hasMore: hasMore,
        isLoading: false,
        remainingCount: remainingCount
      });
    } else if (activeTab === 'regulations') {
      // 携带规定标签页
      var endIndex = (currentPage + 1) * pageSize;
      var displayData = this.data.filteredRegulations.slice(0, endIndex);
      var hasMore = endIndex < this.data.filteredRegulations.length;
      var remainingCount = Math.max(0, this.data.filteredRegulations.length - endIndex);

      this.setData({
        displayRegulations: displayData,
        currentPage: currentPage,
        hasMore: hasMore,
        isLoading: false,
        remainingCount: remainingCount
      });
    } else if (activeTab === 'emergency') {
      // 应急响应标签页
      var endIndex = (currentPage + 1) * pageSize;
      var displayData = this.data.filteredEmergency.slice(0, endIndex);
      var hasMore = endIndex < this.data.filteredEmergency.length;
      var remainingCount = Math.max(0, this.data.filteredEmergency.length - endIndex);

      this.setData({
        displayEmergency: displayData,
        currentPage: currentPage,
        hasMore: hasMore,
        isLoading: false,
        remainingCount: remainingCount
      });
    } else if (activeTab === 'hidden') {
      // 隐含危险品标签页
      var endIndex = (currentPage + 1) * pageSize;
      var displayData = this.data.filteredHidden.slice(0, endIndex);
      var hasMore = endIndex < this.data.filteredHidden.length;
      var remainingCount = Math.max(0, this.data.filteredHidden.length - endIndex);

      this.setData({
        displayHidden: displayData,
        currentPage: currentPage,
        hasMore: hasMore,
        isLoading: false,
        remainingCount: remainingCount
      });
    } else if (activeTab === 'groundEmergency') {
      // 地面应急标签页
      var endIndex = (currentPage + 1) * pageSize;
      var displayData = this.data.filteredGroundEmergency.slice(0, endIndex);
      var hasMore = endIndex < this.data.filteredGroundEmergency.length;
      var remainingCount = Math.max(0, this.data.filteredGroundEmergency.length - endIndex);

      this.setData({
        displayGroundEmergency: displayData,
        currentPage: currentPage,
        hasMore: hasMore,
        isLoading: false,
        remainingCount: remainingCount
      });
    }
  },

  // 加载更多数据
  loadMore: function() {
    // 防止重复加载
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }

    this.setData({
      isLoading: true
    });

    // 直接执行，无需延时
    var nextPage = this.data.currentPage + 1;
    this.setData({
      currentPage: nextPage
    });
    this.loadPageData(false);
  },

  // 检查无广告状态
  checkAdFreeStatus: function() {
    var adFreeManager = require('../../utils/ad-free-manager.js');
    try {
      var isAdFree = adFreeManager.isAdFreeToday();
      this.setData({ isAdFree: isAdFree });
      console.log('📅 无广告状态:', isAdFree ? '今日无广告' : '显示广告');
    } catch (error) {
      console.error('❌ 检查无广告状态失败:', error);
    }
  }

};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));