// packageRadiation/pages/index/index.js
// 航空辐射计算页面

var BasePage = require('../../../utils/base-page.js');
var AppConfig = require('../../../utils/app-config.js');
var radiationModel = require('../../utils/radiationModel.js');
var searchManager = require('../../../utils/search-manager.js').searchManager;

// 常量定义
var POLAR_ROUTE_INCREMENT_MICROSIEVERTS = 50; // 极地航线辐射增量（基于ICRP保守估计）
var FEET_TO_METERS = 0.3048; // 英尺转米转换系数
var METERS_TO_FEET = 3.28084; // 米转英尺转换系数
var SEARCH_DEBOUNCE_DELAY = 500; // 搜索防抖延迟（毫秒）

var SOLAR_REFERENCE_POINTS = [
  { year: 2009, label: '太阳极小期' },
  { year: 2000, label: '太阳极大期' }
];

// 固定参考点用于太阳调制系数计算（确保一致性）
// 太阳活动影响整个地球，调制系数应该是全局常数，不随位置变化
var SOLAR_MODULATION_REFERENCE_POINT = {
  latitude: 45.0,      // 中纬度标准参考点
  longitude: 0.0,      // 本初子午线
  altitudeMeters: 10668  // 35000英尺 ≈ 10668米（标准巡航高度）
};

var pageConfig = {
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 无广告状态
    isAdFree: false,

    // Tab状态
    activeTab: 'route',

    quickAirportInput: '',
    quickAirportSuggestions: [],
    routeDepartureInput: '',
    routeArrivalInput: '',

    // 单点计算数据
    singlePoint: {
      latitude: '',
      longitude: '',
      altitude: '',
      flightHours: '1',
      date: '',
      result: null
    },

    // 航线计算数据
    route: {
      departure: null,
      arrival: null,
      cruiseAltitude: '',
      flightHours: '',
      date: '',
      isPolarRoute: false,  // 是否为极地航线
      result: null
    },

    // 机场选择相关
    selectedAirport: null,
    showAirportPopup: false,
    airportSearchKeyword: '',
    filteredAirports: [],
    currentPickerType: '', // 'single', 'departure', 'arrival'

    // 日期选择相关
    showDatePopup: false,
    currentDate: new Date().getTime(),
    minDate: new Date(2000, 0, 1).getTime(),
    maxDate: new Date(2030, 11, 31).getTime(),
    datePickerType: '' // 'single', 'route'
  },

  // 机场数据存储（不放在data中避免大数据传输）
  allAirportsData: [],

  // ========== 工具函数 ==========
  // 统一的输入值提取函数
  extractInputValue: function(e) {
    var value = e && e.detail;
    if (value && typeof value === 'object' && value.value !== undefined) {
      value = value.value;
    }
    return value || '';
  },

  // 统一的输入清理函数
  sanitizeNumericInput: function(value, allowNegative) {
    var pattern = allowNegative ? /[^\d.-]/g : /[^\d.]/g;
    return value.toString().replace(pattern, '');
  },

  // 统一的searchManager索引检查和创建
  ensureAirportIndex: function() {
    if (searchManager && typeof searchManager.createAirportIndex === 'function') {
      if (!searchManager.indexes.has('airports') && Array.isArray(this.allAirportsData) && this.allAirportsData.length > 0) {
        searchManager.createAirportIndex(this.allAirportsData);
      }
    }
  },

  // P2优化：高度变化数据计算独立函数
  // radiationModel已包含太阳调制，直接使用getDoseRate结果
  calculateAltitudeVariants: function(baseFeet, latitude, longitude, date, flightHours, polarIncrement) {
    var altitudeOffsets = [-10000, -5000, 0, 5000, 10000];
    var seenAltitudes = {};
    var altitudeVariants = [];
    polarIncrement = polarIncrement || 0; // 默认为0

    altitudeOffsets.forEach(function(offset) {
      var variantFeet = baseFeet + offset;

      // 高度不能为负数，最小为0
      if (variantFeet < 0) {
        variantFeet = 0;
      }

      variantFeet = Math.round(variantFeet);

      // 去重检查
      if (seenAltitudes[variantFeet]) {
        return;
      }
      seenAltitudes[variantFeet] = true;
      var variantMeters = variantFeet * FEET_TO_METERS;

      // getDoseRate已包含太阳调制，直接使用
      var variantRate = radiationModel.getDoseRate({
        latitude: latitude,
        longitude: longitude,
        altitude: variantMeters,
        date: date
      });

      var totalDose = variantRate * flightHours + polarIncrement; // 加上极地增量
      altitudeVariants.push({
        altitudeFeet: variantFeet,
        doseRate: variantRate.toFixed(3),
        totalDose: totalDose.toFixed(3)
      });
    });

    altitudeVariants.sort(function(a, b) { return a.altitudeFeet - b.altitudeFeet; });
    return altitudeVariants;
  },

  customOnLoad: function(options) {
    var self = this;

    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    // 设置默认日期为今天
    var today = this.formatDate(new Date());
    this.setData({
      'singlePoint.date': today,
      'singlePoint.flightHours': this.data.singlePoint.flightHours || '1',
      'route.date': today,
      'route.flightHours': this.data.route.flightHours || '1'
    });

    // 异步加载机场数据
    this.loadAirportData();

    console.log('✔️ 辐射计算页面已加载');
  },

  customOnShow: function() {
    // 检查无广告状态
    this.checkAdFreeStatus();
  },

  customOnUnload: function() {
    // 清理搜索定时器，防止内存泄漏
    if (this._quickSearchTimer) {
      clearTimeout(this._quickSearchTimer);
      this._quickSearchTimer = null;
    }
    if (this._routeInputTimer) {
      clearTimeout(this._routeInputTimer);
      this._routeInputTimer = null;
    }

    // 清理大数据对象，释放内存
    this.allAirportsData = null;

    console.log('✔️ 辐射计算页面卸载，已清理所有资源');
  },

  // 加载机场数据（使用统一数据管理器）
  loadAirportData: function() {
    var self = this;

    try {
      var dataManager = require('../../../utils/data-manager.js');
      dataManager.loadAirportData().then(function(airports) {
        // 存储机场数据供本地搜索使用
        self.allAirportsData = airports;

        // 初始化searchManager的机场索引
        self.ensureAirportIndex();

        console.log('✅ 机场数据加载成功，共 ' + airports.length + ' 条记录');
      }).catch(function(error) {
        console.error('❌ 加载机场数据失败:', error);
        self.allAirportsData = [];

        // 明确告知用户影响范围和解决方案
        wx.showModal({
          title: '机场数据加载失败',
          content: '快捷机场输入和航线计算功能将受限，建议重启小程序。您仍可使用手动输入经纬度进行单点计算。',
          showCancel: true,
          confirmText: '重启',
          cancelText: '继续使用',
          success: function(res) {
            if (res.confirm) {
              wx.reLaunch({ url: '/pages/home/index' });
            }
          }
        });
      });
    } catch (error) {
      console.error('❌ 加载数据管理器失败:', error);
      self.handleError(error, '加载机场数据失败');
      self.allAirportsData = [];

      // 明确告知用户影响范围和解决方案
      wx.showModal({
        title: '数据初始化失败',
        content: '机场数据无法加载，建议重启小程序。您仍可使用手动输入经纬度进行单点计算。',
        showCancel: true,
        confirmText: '重启',
        cancelText: '继续使用',
        success: function(res) {
          if (res.confirm) {
            wx.reLaunch({ url: '/pages/home/index' });
          }
        }
      });
    }
  },

  // ========== Tab切换 ==========
  onTabChange: function(e) {
    this.setData({
      activeTab: e.detail.name
    });
  },

  // ========== 快捷机场输入 ==========
  onQuickAirportInput: function(e) {
    var value = e && e.detail ? e.detail : '';
    var self = this;

    this.setData({
      quickAirportInput: value
    });

    if (this._quickSearchTimer) {
      clearTimeout(this._quickSearchTimer);
    }

    if (!value || !value.trim()) {
      this.setData({
        quickAirportSuggestions: []
      });
      return;
    }

    this._quickSearchTimer = setTimeout(function() {
      self.performQuickAirportSearch(value.trim());
    }, SEARCH_DEBOUNCE_DELAY);
  },

  onQuickAirportClear: function() {
    this.setData({
      quickAirportInput: '',
      quickAirportSuggestions: [],
      selectedAirport: null
    });
  },

  // ========== 单点计算输入处理 ==========
  onLatitudeChange: function(e) {
    var value = this.extractInputValue(e);
    value = this.sanitizeNumericInput(value, true); // 允许负数
    this.setData({
      'singlePoint.latitude': value
    });
  },

  onLongitudeChange: function(e) {
    var value = this.extractInputValue(e);
    value = this.sanitizeNumericInput(value, true); // 允许负数
    this.setData({
      'singlePoint.longitude': value
    });
  },

  onAltitudeChange: function(e) {
    var value = this.extractInputValue(e);
    value = this.sanitizeNumericInput(value, false); // 不允许负数
    this.setData({
      'singlePoint.altitude': value
    });
  },

  onFlightHoursChange: function(e) {
    var value = this.extractInputValue(e);
    value = this.sanitizeNumericInput(value, false); // 不允许负数
    this.setData({
      'singlePoint.flightHours': value
    });
  },

  // ========== 航线计算输入处理 ==========
  onCruiseAltitudeChange: function(e) {
    var value = this.extractInputValue(e);
    value = this.sanitizeNumericInput(value, false); // 不允许负数
    this.setData({
      'route.cruiseAltitude': value
    });
  },

  onRouteFlightHoursChange: function(e) {
    var value = this.extractInputValue(e);
    value = this.sanitizeNumericInput(value, false); // 不允许负数
    this.setData({
      'route.flightHours': value
    });
  },

  // 极地航线开关
  onPolarRouteChange: function(e) {
    var checked = e.detail;
    this.setData({
      'route.isPolarRoute': checked
    });
    console.log('极地航线开关:', checked);
  },

  performQuickAirportSearch: function(keyword) {
    var suggestions = [];
    var limit = 6;

    try {
      // 确保searchManager和索引都存在
      if (searchManager && typeof searchManager.searchAirports === 'function') {
        // P1优化：使用统一的索引检查方法
        this.ensureAirportIndex();
        suggestions = searchManager.searchAirports(keyword, limit) || [];
      }
    } catch (error) {
      console.error('❌ 快捷机场搜索失败:', error);
    }

    // 如果searchManager搜索失败或无结果，使用降级搜索
    if (suggestions.length === 0 && Array.isArray(this.allAirportsData)) {
      suggestions = this.performFallbackSearch(keyword);
    }

    // 自动选择逻辑：如果输入是四字代码且有精确匹配，自动选择
    var trimmedKeyword = keyword.trim();
    var upperKeyword = trimmedKeyword.toUpperCase();
    var exactMatch = null;

    // 检查是否是四字代码格式（4个字母）
    if (/^[A-Z]{4}$/.test(upperKeyword)) {
      // 查找ICAO代码精确匹配的机场
      for (var i = 0; i < suggestions.length; i++) {
        if (suggestions[i].ICAOCode && suggestions[i].ICAOCode.toUpperCase() === upperKeyword) {
          exactMatch = suggestions[i];
          break;
        }
      }

      // 如果找到精确匹配，自动选择该机场
      if (exactMatch) {
        this.autoSelectAirport(exactMatch);
        return; // 自动选择后直接返回，不显示建议列表
      }
    }

    this.setData({
      quickAirportSuggestions: suggestions.slice(0, limit)
    });
  },

  // 统一的单点计算机场选择逻辑
  selectAirportForSinglePoint: function(airport, isAutoSelect) {
    if (!airport || typeof airport.Latitude !== 'number' || typeof airport.Longitude !== 'number') {
      if (isAutoSelect) {
        console.error('❌ 自动选择机场失败：机场数据异常', airport);
      } else {
        wx.showToast({
          title: '机场数据异常',
          icon: 'none'
        });
      }
      return;
    }

    var displayName = airport.ShortName || airport.EnglishName || airport.ICAOCode || airport.IATACode || '';
    var inputDisplay = displayName + (airport.ICAOCode ? ' (' + airport.ICAOCode + ')' : '');

    this.setData({
      selectedAirport: airport,
      quickAirportInput: inputDisplay,
      quickAirportSuggestions: [],
      'singlePoint.latitude': airport.Latitude.toString(),
      'singlePoint.longitude': airport.Longitude.toString()
    });

    wx.showToast({
      title: isAutoSelect ? ('已自动匹配：' + (airport.ICAOCode || displayName)) : '已匹配机场',
      icon: 'success',
      duration: isAutoSelect ? 1500 : 1000
    });

    if (isAutoSelect) {
      console.log('✅ 自动选择机场:', airport.ICAOCode, displayName);
    }
  },

  selectQuickAirport: function(e) {
    var airport = e && e.currentTarget ? e.currentTarget.dataset.airport : null;
    this.selectAirportForSinglePoint(airport, false);
  },

  // 自动选择机场（当ICAO代码精确匹配时）
  autoSelectAirport: function(airport) {
    this.selectAirportForSinglePoint(airport, true);
  },

  updateRouteAirportByQuery: function(query, contextType) {
    if (!query) {
      if (contextType === 'departure') {
        this.setData({
          routeDepartureInput: '',
          'route.departure': null
        });
      } else {
        this.setData({
          routeArrivalInput: '',
          'route.arrival': null
        });
      }
      return;
    }

    var keyword = query.toLowerCase();
    var results = [];

    // 使用searchManager进行搜索，确保索引已创建
    if (searchManager && typeof searchManager.searchAirports === 'function') {
      // P1优化：使用统一的索引检查方法
      this.ensureAirportIndex();
      results = searchManager.searchAirports(keyword, 6) || [];
    }

    // 降级搜索：如果searchManager没有结果，使用本地搜索
    if (results.length === 0 && Array.isArray(this.allAirportsData)) {
      results = this.performFallbackSearch(query);
    }

    if (results.length === 0) {
      // 没有找到匹配的机场
      if (contextType === 'departure') {
        this.setData({
          routeDepartureInput: query,
          'route.departure': null
        });
      } else {
        this.setData({
          routeArrivalInput: query,
          'route.arrival': null
        });
      }
    } else {
      // 检查是否是四字代码且有ICAO精确匹配
      var trimmedQuery = query.trim();
      var upperKeyword = trimmedQuery.toUpperCase();
      var exactMatch = null;

      if (/^[A-Z]{4}$/.test(upperKeyword)) {
        for (var i = 0; i < results.length; i++) {
          if (results[i].ICAOCode && results[i].ICAOCode.toUpperCase() === upperKeyword) {
            exactMatch = results[i];
            break;
          }
        }
      }

      if (exactMatch) {
        // 找到ICAO精确匹配，自动选择
        this.selectAirportForRoute(exactMatch, contextType);
      } else if (results.length === 1) {
        // 只有一个匹配结果，直接使用
        this.selectAirportForRoute(results[0], contextType);
      } else {
        // 多个匹配结果且无精确匹配，显示选择弹窗
        this.showAirportSelectionDialog(results, contextType, query);
      }
    }
  },

  // 降级搜索方法
  performFallbackSearch: function(query) {
    var results = [];
    var upperQuery = query.toUpperCase();
    var i, item, exists;

    // 1. 优先匹配ICAO代码（精确匹配）
    for (i = 0; i < this.allAirportsData.length; i++) {
      item = this.allAirportsData[i];
      if (item.ICAOCode && item.ICAOCode.toUpperCase() === upperQuery) {
        results.push(item);
        return results; // 精确匹配，直接返回
      }
    }

    // 2. 匹配IATA代码
    for (i = 0; i < this.allAirportsData.length; i++) {
      item = this.allAirportsData[i];
      if (item.IATACode && item.IATACode.toUpperCase() === upperQuery) {
        results.push(item);
      }
    }

    // 3. 匹配中文名称（模糊匹配）
    if (results.length < 6) {
      for (i = 0; i < this.allAirportsData.length; i++) {
        item = this.allAirportsData[i];
        if (item.ShortName && item.ShortName.indexOf(query) !== -1) {
          // ES5兼容：替换Array.some()为循环检查
          exists = false;
          for (var j = 0; j < results.length; j++) {
            if (results[j].ICAOCode === item.ICAOCode) {
              exists = true;
              break;
            }
          }
          if (!exists && results.length < 6) {
            results.push(item);
          }
        }
      }
    }

    // 4. 匹配英文名称
    if (results.length < 6) {
      for (i = 0; i < this.allAirportsData.length; i++) {
        item = this.allAirportsData[i];
        if (item.EnglishName && item.EnglishName.toUpperCase().indexOf(upperQuery) !== -1) {
          // ES5兼容：替换Array.some()为循环检查
          exists = false;
          for (var k = 0; k < results.length; k++) {
            if (results[k].ICAOCode === item.ICAOCode) {
              exists = true;
              break;
            }
          }
          if (!exists && results.length < 6) {
            results.push(item);
          }
        }
      }
    }

    return results.slice(0, 6);
  },

  // 显示机场选择弹窗
  showAirportSelectionDialog: function(airports, contextType, query) {
    if (airports.length === 0) return;

    var actionItems = [];
    for (var i = 0; i < airports.length; i++) {
      var airport = airports[i];
      // 改进显示格式：中文名 + ICAO + IATA（如果有的话）
      var displayName = airport.ShortName || airport.EnglishName || '';
      if (airport.ICAOCode) {
        displayName += ' (' + airport.ICAOCode;
        if (airport.IATACode) {
          displayName += '/' + airport.IATACode;
        }
        displayName += ')';
      }
      actionItems.push({
        name: displayName,
        value: i
      });
    }

    var itemList = actionItems.map(function(item) { return item.name; });

    // 微信小程序ActionSheet最多支持6个选项
    if (itemList.length > 6) {
      itemList = itemList.slice(0, 6);
      airports = airports.slice(0, 6);
    }

    var self = this;
    var airportType = contextType === 'departure' ? '出发' : '到达';

    wx.showActionSheet({
      itemList: itemList,
      success: function(res) {
        var selectedAirport = airports[res.tapIndex];
        self.selectAirportForRoute(selectedAirport, contextType);
      },
      fail: function(err) {
        // 用户取消选择时给出提示
        wx.showToast({
          title: '请选择具体的' + airportType + '机场',
          icon: 'none',
          duration: 2500
        });
      }
    });
  },

  // 选择航线机场
  selectAirportForRoute: function(airport, contextType) {
    var displayName = airport.ShortName || airport.EnglishName || airport.ICAOCode || airport.IATACode || '';
    var inputDisplay = displayName + (airport.ICAOCode ? ' (' + airport.ICAOCode + ')' : '');

    if (contextType === 'departure') {
      this.setData({
        routeDepartureInput: inputDisplay,
        'route.departure': airport
      });
    } else {
      this.setData({
        routeArrivalInput: inputDisplay,
        'route.arrival': airport
      });
    }
  },

  handleRouteInputChange: function(value, contextType) {
    var self = this;
    var trimmed = value ? value.trim() : '';
    if (contextType === 'departure') {
      this.setData({ routeDepartureInput: trimmed });
    } else {
      this.setData({ routeArrivalInput: trimmed });
    }

    if (this._routeInputTimer) {
      clearTimeout(this._routeInputTimer);
    }

    this._routeInputTimer = setTimeout(function() {
      self.updateRouteAirportByQuery(trimmed, contextType);
    }, SEARCH_DEBOUNCE_DELAY);
  },

  onRouteDepartureInput: function(e) {
    var value = this.extractInputValue(e);
    this.handleRouteInputChange(value, 'departure');
  },

  onRouteArrivalInput: function(e) {
    var value = this.extractInputValue(e);
    this.handleRouteInputChange(value, 'arrival');
  },

  clearRouteDeparture: function() {
    this.setData({
      routeDepartureInput: '',
      'route.departure': null
    });
  },

  clearRouteArrival: function() {
    this.setData({
      routeArrivalInput: '',
      'route.arrival': null
    });
  },

  // ========== 日期选择 ==========
  showDatePicker: function() {
    this.setData({
      showDatePopup: true,
      datePickerType: 'single'
    });
  },

  showRouteDatePicker: function() {
    this.setData({
      showDatePopup: true,
      datePickerType: 'route'
    });
  },

  closeDatePicker: function() {
    this.setData({
      showDatePopup: false
    });
  },

  onDateConfirm: function(e) {
    var timestamp = e.detail;
    var dateStr = this.formatDate(new Date(timestamp));

    if (this.data.datePickerType === 'single') {
      this.setData({
        'singlePoint.date': dateStr
      });
    } else {
      this.setData({
        'route.date': dateStr
      });
    }

    this.closeDatePicker();
  },

  // ========== 单点辐射计算 ==========
  calculateSinglePoint: function() {
    var data = this.data.singlePoint;

    // 验证输入
    if (!data.latitude || !data.longitude || !data.altitude || !data.date) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    var latitude = parseFloat(data.latitude);
    var longitude = parseFloat(data.longitude);
    var altitudeFeet = parseFloat(data.altitude); // 用户输入的是英尺
    var flightHours = parseFloat(data.flightHours);

    if (data.flightHours === '' || isNaN(flightHours)) {
      flightHours = 1;
      this.setData({
        'singlePoint.flightHours': '1'
      });
    }

    // 验证纬度范围
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      wx.showToast({
        title: '纬度范围：-90 到 90',
        icon: 'none'
      });
      return;
    }

    // 验证经度范围
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      wx.showToast({
        title: '经度范围：-180 到 180',
        icon: 'none'
      });
      return;
    }

    // 验证高度（英尺）
    if (isNaN(altitudeFeet) || altitudeFeet < 0 || altitudeFeet > 60000) {
      wx.showToast({
        title: '高度范围：0-60000英尺',
        icon: 'none',
        duration: 2500
      });
      return;
    }

    // 验证飞行时间（民航规定年度最大飞行时间约1000小时）
    if (flightHours <= 0 || flightHours > 1200) {
      wx.showToast({
        title: '飞行时间范围：0-1200小时',
        icon: 'none',
        duration: 2500
      });
      return;
    }

    // 解析日期
    var date = this.parseDate(data.date);
    if (!date) {
      wx.showToast({
        title: '日期格式错误',
        icon: 'none'
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '计算中...',
      mask: true
    });

    try {
      var altitudeMeters = altitudeFeet * FEET_TO_METERS; // 英尺转米

      // getDoseRate已包含太阳调制，直接使用结果
      var doseRate = radiationModel.getDoseRate({
        latitude: latitude,
        longitude: longitude,
        altitude: altitudeMeters, // 传入米制高度
        date: date
      });

      var totalDose = doseRate * flightHours;

      // 获取太阳调制值（仅用于显示）
      var year = date.getFullYear();
      var solarModulation = this.getSolarModulation(year);

      // 构建太阳调制对比数据（仅用于显示参考）
      var solarComparisons = this.buildSolarComparisons({
        latitude: latitude,
        longitude: longitude,
        altitude: altitudeMeters,
        flightTimeHours: flightHours,
        currentYear: year
      });

      // 统一飞行时间显示格式（最多2位小数，去除不必要的尾零）
      var flightHoursDisplay = parseFloat(flightHours.toFixed(2)).toString();

      // P2优化：使用独立函数计算高度变化数据
      var altitudeVariants = this.calculateAltitudeVariants(
        altitudeFeet,
        latitude,
        longitude,
        date,
        flightHours,
        0  // 单点计算无极地增量
      );

      // 计算结果（显示英尺）
      var result = {
        doseRate: doseRate.toFixed(3),
        totalDose: totalDose.toFixed(3),
        latitude: latitude.toFixed(4),
        longitude: longitude.toFixed(4),
        altitudeFeet: Math.round(altitudeFeet), // 显示用户输入的英尺值
        flightHours: flightHoursDisplay,
        altitudeVariants: altitudeVariants,
        date: data.date,
        solarModulation: solarModulation,
        solarComparisons: solarComparisons
      };
      this.setData({
        'singlePoint.result': result
      });

      wx.hideLoading();
      wx.showToast({
        title: '计算完成',
        icon: 'success'
      });

      console.log('✅ 单点辐射计算结果:', result);
    } catch (error) {
      console.error('❌ 计算失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '计算失败：' + error.message,
        icon: 'none'
      });
    }
  },

  // ========== 航线辐射计算 ==========
  calculateRoute: function() {
    var data = this.data.route;

    // 验证输入
    if (!data.departure || !data.arrival || !data.cruiseAltitude || !data.date) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    var cruiseAltitudeFeet = parseFloat(data.cruiseAltitude); // 用户输入的是英尺
    var flightHours = parseFloat(data.flightHours);

    // 验证巡航高度
    if (isNaN(cruiseAltitudeFeet) || cruiseAltitudeFeet < 0 || cruiseAltitudeFeet > 60000) {
      wx.showToast({
        title: '巡航高度范围：0-60000英尺',
        icon: 'none',
        duration: 2500
      });
      return;
    }

    // 验证飞行时间（允许查询年度累计）
    if (!data.flightHours || isNaN(flightHours) || flightHours <= 0 || flightHours > 1200) {
      wx.showToast({
        title: '飞行时间范围：0-1200小时',
        icon: 'none',
        duration: 2500
      });
      return;
    }

    // 解析日期
    var date = this.parseDate(data.date);
    if (!date) {
      wx.showToast({
        title: '日期格式错误',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '计算中...',
      mask: true
    });

    try {
      // 转换英尺为米
      var cruiseAltitudeMeters = cruiseAltitudeFeet * FEET_TO_METERS;

      // 计算航线距离（使用Haversine公式）
      var distance = this.calculateDistance(
        data.departure.Latitude,
        data.departure.Longitude,
        data.arrival.Latitude,
        data.arrival.Longitude
      );

      // 根据飞行小时对航迹进行均匀采样（每10分钟一个采样点）
      var sampleCount = Math.max(1, Math.ceil(flightHours * 6));
      var stepHours = flightHours / sampleCount;
      var baseTotalDose = 0;
      var baseDoseRates = [];

      for (var i = 0; i < sampleCount; i++) {
        var ratio = (i + 0.5) / sampleCount;
        var coord = this.interpolateCoordinate(
          { lat: data.departure.Latitude, lon: data.departure.Longitude },
          { lat: data.arrival.Latitude, lon: data.arrival.Longitude },
          ratio
        );
        var sampleDate = new Date(date.getTime() + (i + 0.5) * stepHours * 3600000);

        // getDoseRate已包含太阳调制，直接使用
        var rate = radiationModel.getDoseRate({
          latitude: coord.lat,
          longitude: coord.lon,
          altitude: cruiseAltitudeMeters,
          date: sampleDate
        });
        baseTotalDose += rate * stepHours;
        baseDoseRates.push(rate);
      }

      var avgDoseRate = baseTotalDose / flightHours;
      var totalDose = avgDoseRate * flightHours;

      // 获取太阳调制值（仅用于显示）
      var year = date.getFullYear();
      var solarModulation = this.getSolarModulation(year);

      // 极地航线增量：如果勾选极地航线，增加固定增量
      var polarIncrement = 0;
      if (data.isPolarRoute) {
        polarIncrement = POLAR_ROUTE_INCREMENT_MICROSIEVERTS;
        totalDose += polarIncrement;
      }

      // 构建太阳调制对比数据（仅用于显示参考）
      var midLat = (data.departure.Latitude + data.arrival.Latitude) / 2;
      var midLon = (data.departure.Longitude + data.arrival.Longitude) / 2;
      var solarComparisons = this.buildSolarComparisons({
        latitude: midLat,
        longitude: midLon,
        altitude: cruiseAltitudeMeters,
        flightTimeHours: flightHours,
        currentYear: year,
        polarIncrement: polarIncrement
      });

      // P2优化：使用独立函数计算高度变化数据（使用航线中点坐标）
      var altitudeVariants = this.calculateAltitudeVariants(
        cruiseAltitudeFeet,
        midLat,
        midLon,
        date,
        flightHours,
        polarIncrement  // 传入极地增量
      );

      var result = {
        avgDoseRate: avgDoseRate.toFixed(3),
        totalDose: totalDose.toFixed(3),
        distance: distance.toFixed(1),
        flightTime: flightHours.toFixed(2),
        flightHours: flightHours.toFixed(2),
        cruiseAltitudeFeet: Math.round(cruiseAltitudeFeet), // 显示英尺
        altitudeVariants: altitudeVariants, // 添加高度变化数据
        polarIncrement: polarIncrement, // 极地增量
        isPolarRoute: data.isPolarRoute, // 是否极地航线
        date: data.date,
        solarModulation: solarModulation,
        solarComparisons: solarComparisons
      };

      this.setData({
        'route.result': result
      });

      wx.hideLoading();
      wx.showToast({
        title: '计算完成',
        icon: 'success'
      });

      console.log('✅ 航线辐射计算结果:', result);
    } catch (error) {
      console.error('❌ 航线计算失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '计算失败：' + error.message,
        icon: 'none'
      });
    }
  },

  // ========== 工具函数 ==========
  // 构建太阳调制对比数据（仅用于显示参考）
  // 计算不同太阳周期参考年份在相同位置和高度下的剂量率
  buildSolarComparisons: function(options) {
    options = options || {};

    var latitude = typeof options.latitude === 'number' ? options.latitude : 0;
    var longitude = typeof options.longitude === 'number' ? options.longitude : 0;
    var altitude = typeof options.altitude === 'number' ? options.altitude : 0;
    var flightTimeHours = typeof options.flightTimeHours === 'number' ? options.flightTimeHours : 1;
    var currentYear = typeof options.currentYear === 'number' ? options.currentYear : new Date().getFullYear();
    var polarIncrement = typeof options.polarIncrement === 'number' ? options.polarIncrement : 0;
    var self = this;

    // 获取当前年份的剂量率（作为基准）
    var currentDate = new Date(currentYear, 0, 1);
    var currentDoseRate = radiationModel.getDoseRate({
      latitude: latitude,
      longitude: longitude,
      altitude: altitude,
      date: currentDate
    });

    // 计算各参考年份的剂量率，并与当前年份对比
    return SOLAR_REFERENCE_POINTS.map(function(ref) {
      var refDate = new Date(ref.year, 0, 1);
      var refDoseRate = radiationModel.getDoseRate({
        latitude: latitude,
        longitude: longitude,
        altitude: altitude,
        date: refDate
      });
      var modulation = self.getSolarModulation(ref.year);

      // 计算相对于当前年份的变化百分比
      var deltaPercentValue = currentDoseRate > 0 ? ((refDoseRate - currentDoseRate) / currentDoseRate * 100) : 0;
      var deltaPercentRounded = Math.round(deltaPercentValue);

      var comparison = {
        year: ref.year,
        label: ref.label,
        modulation: modulation,
        doseRate: refDoseRate.toFixed(3),
        deltaPercent: deltaPercentRounded,
        deltaDirection: deltaPercentRounded >= 0 ? '↑' : '↓',
        deltaAbsPercent: Math.abs(deltaPercentRounded)
      };

      // 如果提供了飞行时间，计算总剂量
      if (flightTimeHours !== null) {
        var refTotalDose = refDoseRate * flightTimeHours + polarIncrement;
        comparison.totalDose = refTotalDose.toFixed(3);
      }

      return comparison;
    });
  },

  // 格式化日期：YYYY-MM-DD（ES5兼容）
  formatDate: function(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    // ES5兼容的补零方法
    var monthStr = month < 10 ? '0' + month : '' + month;
    var dayStr = day < 10 ? '0' + day : '' + day;

    return year + '-' + monthStr + '-' + dayStr;
  },

  // 解析日期字符串（增强iOS兼容性）
  parseDate: function(dateStr) {
    try {
      var parts = dateStr.split('-');
      if (parts.length !== 3) return null;

      var year = parseInt(parts[0]);
      var month = parseInt(parts[1]);
      var day = parseInt(parts[2]);

      // 验证合法性
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
      if (month < 1 || month > 12) return null;
      if (day < 1 || day > 31) return null;
      if (year < 2000 || year > 2030) return null; // 限制在太阳调制数据范围内

      // iOS兼容：使用补零的格式字符串
      var monthStr = month < 10 ? '0' + month : '' + month;
      var dayStr = day < 10 ? '0' + day : '' + day;

      // 创建日期对象（iOS安全方式：不使用T和Z）
      var date = new Date(year + '/' + monthStr + '/' + dayStr);

      // 验证日期是否有效（防止2月30日等情况）
      if (isNaN(date.getTime()) || date.getMonth() !== month - 1) return null;

      return date;
    } catch (e) {
      return null;
    }
  },

  // 获取太阳调制值
  getSolarModulation: function(year) {
    var modulation = {
      2000: 1100, 2001: 1050, 2002: 1000, 2003: 850, 2004: 700,
      2005: 550, 2006: 500, 2007: 480, 2008: 470, 2009: 460,
      2010: 500, 2011: 650, 2012: 850, 2013: 950, 2014: 1000,
      2015: 800, 2016: 650, 2017: 550, 2018: 500, 2019: 480,
      2020: 470, 2021: 520, 2022: 680, 2023: 850, 2024: 980,
      2025: 1050, 2026: 950, 2027: 800, 2028: 700, 2029: 600,
      2030: 550
    };
    return modulation[year] || 700;
  },

  // 计算两点距离（Haversine公式）
  calculateDistance: function(lat1, lon1, lat2, lon2) {
    var R = 6371; // 地球半径（公里）
    var dLat = this.toRad(lat2 - lat1);
    var dLon = this.toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRad: function(deg) {
    return deg * Math.PI / 180;
  },

  interpolateCoordinate: function(start, end, ratio) {
    if (ratio <= 0) return { lat: start.lat, lon: start.lon };
    if (ratio >= 1) return { lat: end.lat, lon: end.lon };
    var lat = start.lat + (end.lat - start.lat) * ratio;
    var lonDiff = end.lon - start.lon;
    if (lonDiff > 180) {
      lonDiff -= 360;
    } else if (lonDiff < -180) {
      lonDiff += 360;
    }
    var lon = start.lon + lonDiff * ratio;
    if (lon > 180) lon -= 360;
    if (lon < -180) lon += 360;
    return { lat: lat, lon: lon };
  },

  // 检查无广告状态
  checkAdFreeStatus: function() {
    var adFreeManager = require('../../../utils/ad-free-manager.js');
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
