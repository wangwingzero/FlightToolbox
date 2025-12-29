// 机场数据搜索页面
// 严格ES5语法，确保真机兼容性

var BasePage = require('../utils/base-page.js');
var SearchComponent = require('../utils/search-component.js');
var AirportDataLoader = require('./data-loader.js');
var AirportConfig = require('./config.js');
var AirportUtils = require('./utils.js');
var AppConfig = require('../utils/app-config.js');

var pageConfig = {
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,
    
    // UI状态数据（不存储大数据）
    searchResults: [],
    
    // UI状态
    searchKeyword: '',
    isSearchMode: false,
    loading: true,
    searchLoading: false,
    searchFocused: false,
    
    // 分页
    currentPage: 1,
    pageSize: 20,
    hasMoreData: true,
    displayedAirports: [],
    
    // 筛选和排序
    currentCountry: 'all',
    countryList: [],
    sortType: 'name', // name, icao, country, recent
    sortOptions: {
      'name': '按名称',
      'icao': '按代码', 
      'country': '按国家',
      'recent': '最近访问'
    },
    sortOptionsList: [],
    showSortPopup: false,
    
    // 快速筛选
    quickFilters: [],
    currentQuickFilter: 'all',
    
    // 统计信息
    totalCount: 0,
    countryStats: {},
    
    // 配置
    searchConfig: {},
    
    // 搜索建议和实时结果
    searchSuggestions: [],
    showSuggestions: false,
    realtimeResults: [],
    showRealtimePreview: false
  },
  
  // 搜索组件和定时器
  searchComponent: null,
  searchTimer: null,

  // 大数据存储（避免setData传输）
  airportData: [],
  filteredAirports: [],

  // 判断国家是否属于中国（包括台湾、香港、澳门）
  isChinaRegion: function(countryName) {
    if (!countryName) return false;

    // 转换为小写并去除空格,提高匹配准确性
    var normalized = countryName.toLowerCase().trim();

    // 精确匹配列表(避免误判"中国城市研究中心"等)
    var exactMatches = [
      '中国', 'china', 'cn', 'prc',
      '台湾', 'taiwan', 'tw', 'chinese taipei',
      '香港', 'hong kong', 'hongkong', 'hk',
      '澳门', '澳門', 'macau', 'macao', 'mo'
    ];

    // 精确匹配
    for (var i = 0; i < exactMatches.length; i++) {
      if (normalized === exactMatches[i]) {
        return true;
      }
    }

    // 部分匹配(针对"中国台湾"、"中华人民共和国"等)
    if (normalized.indexOf('中华人民共和国') !== -1 ||
        normalized.indexOf('中国台湾') !== -1 ||
        normalized.indexOf('中国香港') !== -1 ||
        normalized.indexOf('中国澳门') !== -1 ||
        normalized.indexOf('taiwan, china') !== -1 ||
        normalized.indexOf('hong kong, china') !== -1 ||
        normalized.indexOf('macau, china') !== -1) {
      return true;
    }

    return false;
  },

  // 判断是否为欧洲国家
  isEuropeRegion: function(countryName) {
    if (!countryName) return false;
    var normalized = countryName.toLowerCase().trim();

    var europeCountries = [
      '英国', 'united kingdom', 'uk', 'great britain', 'england',
      '法国', 'france', 'fr',
      '德国', 'germany', 'de', 'deutschland',
      '意大利', 'italy', 'it', 'italia',
      '西班牙', 'spain', 'es', 'españa',
      '荷兰', 'netherlands', 'holland', 'nl',
      '瑞士', 'switzerland', 'ch', 'swiss',
      '比利时', 'belgium', 'be',
      '奥地利', 'austria', 'at',
      '瑞典', 'sweden', 'se',
      '挪威', 'norway', 'no',
      '丹麦', 'denmark', 'dk',
      '芬兰', 'finland', 'fi',
      '波兰', 'poland', 'pl',
      '葡萄牙', 'portugal', 'pt',
      '希腊', 'greece', 'gr',
      '土耳其', 'turkey', 'tr', 'türkiye',
      '捷克', 'czech', 'czechia', 'cz',
      '匈牙利', 'hungary', 'hu',
      '爱尔兰', 'ireland', 'ie',
      '罗马尼亚', 'romania', 'ro',
      '保加利亚', 'bulgaria', 'bg'
    ];

    for (var i = 0; i < europeCountries.length; i++) {
      if (normalized === europeCountries[i] || normalized.indexOf(europeCountries[i]) === 0) {
        return true;
      }
    }
    return false;
  },

  // 判断是否为中东国家
  isMiddleEastRegion: function(countryName) {
    if (!countryName) return false;
    var normalized = countryName.toLowerCase().trim();

    var middleEastCountries = [
      '阿联酋', 'uae', 'united arab emirates', 'dubai', 'abu dhabi',
      '沙特', '沙特阿拉伯', 'saudi arabia', 'saudi', 'sa',
      '卡塔尔', 'qatar', 'qa',
      '科威特', 'kuwait', 'kw',
      '阿曼', 'oman', 'om',
      '巴林', 'bahrain', 'bh',
      '以色列', 'israel', 'il',
      '约旦', 'jordan', 'jo',
      '黎巴嫩', 'lebanon', 'lb',
      '伊拉克', 'iraq', 'iq',
      '伊朗', 'iran', 'ir'
    ];

    for (var i = 0; i < middleEastCountries.length; i++) {
      if (normalized === middleEastCountries[i] || normalized.indexOf(middleEastCountries[i]) !== -1) {
        return true;
      }
    }
    return false;
  },

  // 判断是否为俄罗斯
  isRussiaRegion: function(countryName) {
    if (!countryName) return false;
    var normalized = countryName.toLowerCase().trim();

    return normalized === '俄罗斯' ||
           normalized === 'russia' ||
           normalized === 'russian federation' ||
           normalized === 'ru' ||
           normalized.indexOf('russia') !== -1;
  },

  // 判断是否为东南亚国家
  isSoutheastAsiaRegion: function(countryName) {
    if (!countryName) return false;
    var normalized = countryName.toLowerCase().trim();

    var seaCountries = [
      '新加坡', 'singapore', 'sg',
      '泰国', 'thailand', 'th',
      '马来西亚', 'malaysia', 'my',
      '印度尼西亚', '印尼', 'indonesia', 'id',
      '越南', 'vietnam', 'vn',
      '菲律宾', 'philippines', 'ph',
      '缅甸', 'myanmar', 'burma', 'mm',
      '柬埔寨', 'cambodia', 'kh',
      '老挝', 'laos', 'la',
      '文莱', 'brunei', 'bn'
    ];

    for (var i = 0; i < seaCountries.length; i++) {
      if (normalized === seaCountries[i] || normalized.indexOf(seaCountries[i]) === 0) {
        return true;
      }
    }
    return false;
  },

  customOnLoad: function(options) {
    var self = this;
    
    // 读取分包页面广告开关状态（分包页面使用subPackageAdEnabled）
    this.setData({
      nativeAdEnabled: AppConfig.ad.subPackageAdEnabled || false
    });
    
    // 初始化搜索组件
    this.searchComponent = SearchComponent.createSearchComponent();
    
    // 设置配置
    this.setData({
      searchConfig: AirportConfig.searchConfig
    });
    
    // 使用BasePage的数据加载方法
    this.loadDataWithLoading(function() {
      return self.loadAirportData().then(function() {
        self.initializeData();
        self.updateDisplayedAirports();
      });
    }, {
      loadingText: AirportConfig.messages.loadingText
    });
  },
  
  // 加载机场数据
  loadAirportData: function() {
    var self = this;
    
    return AirportDataLoader.loadAirportData().then(function(airports) {
      
      // 分批设置数据，避免一次性传输过大
      self.setData({
        totalCount: airports.length
      });
      
      // 将数据存储在实例中，而不是data中，避免大数据传输
      self.airportData = airports;
      self.filteredAirports = airports;
      
      return airports;
    }).catch(function(error) {
      console.error('加载机场数据失败:', error);
      self.handleError(error, AirportConfig.messages.loadError);
      
      // 返回空数组确保程序继续运行
      self.airportData = [];
      self.filteredAirports = [];
      self.setData({
        totalCount: 0
      });
      
      return [];
    });
  },
  
  // 初始化数据
  initializeData: function() {
    this.generateCountryList();
    this.generateStatistics();
    this.initializeSearchSuggestions();
    this.initializeQuickFilters();
    this.initializeSortOptions();
  },
  
  // 生成国家列表
  generateCountryList: function() {
    var countries = {};
    var airports = this.airportData || [];
    
    for (var i = 0; i < airports.length; i++) {
      var country = airports[i].CountryName || '未知';
      countries[country] = (countries[country] || 0) + 1;
    }
    
    var countryArray = [{ name: '全部国家', value: 'all', count: airports.length }];
    
    for (var country in countries) {
      if (countries.hasOwnProperty(country)) {
        countryArray.push({
          name: country,
          value: country,
          count: countries[country]
        });
      }
    }
    
    // 按机场数量排序
    countryArray.sort(function(a, b) {
      if (a.value === 'all') return -1;
      if (b.value === 'all') return 1;
      return b.count - a.count;
    });
    
    this.setData({
      countryList: countryArray,
      countryStats: countries
    });
  },
  
  // 生成统计信息
  generateStatistics: function() {
    var airports = this.airportData || [];
    var stats = {
      total: airports.length,
      withIATA: 0,
      withCoordinates: 0,
      countries: 0
    };
    
    var countries = {};
    
    for (var i = 0; i < airports.length; i++) {
      var airport = airports[i];
      
      if (airport.IATACode && airport.IATACode.trim()) {
        stats.withIATA++;
      }
      
      if (airport.Latitude && airport.Longitude) {
        stats.withCoordinates++;
      }
      
      if (airport.CountryName) {
        countries[airport.CountryName] = true;
      }
    }
    
    stats.countries = Object.keys(countries).length;
    
    this.setData({
      statistics: stats
    });
  },
  
  // 初始化搜索建议
  initializeSearchSuggestions: function() {
    var airports = this.airportData || [];
    var suggestions = [];
    
    // 收集热门机场作为搜索建议
    var popularAirports = [
      'ZBAA', 'ZSPD', 'ZGGG', 'ZUUU', 'ZGSZ', // 中国主要机场
      'RJTT', 'RJAA', 'RJBB', 'RJGG', // 日本主要机场
      'RKSI', 'RKPC', 'RKPK', // 韩国主要机场
      'WSSS', 'WBKK', 'VTBS', 'RPLL', // 东南亚主要机场
      'OMDB', 'OOMS', 'OTHH', 'OEJN', // 中东主要机场
      'EGLL', 'EGKK', 'LFPG', 'EDDF', // 欧洲主要机场
      'KJFK', 'KLAX', 'KORD', 'KATL', // 美国主要机场
      'YSSY', 'YMML', 'NZAA', 'YPPH' // 澳新主要机场
    ];
    
    for (var i = 0; i < popularAirports.length && suggestions.length < 10; i++) {
      var icao = popularAirports[i];
      
      for (var j = 0; j < airports.length; j++) {
        if (airports[j].ICAOCode === icao) {
          suggestions.push({
            keyword: icao,
            display: airports[j].ShortName,
            type: 'popular'
          });
          break;
        }
      }
    }
    
    this.setData({
      searchSuggestions: suggestions
    });
  },

  // 初始化快速筛选
  initializeQuickFilters: function() {
    var self = this;
    var airports = this.airportData || [];
    var regions = {};
    var withIATA = 0;

    // ⚡ 性能优化: 单次遍历完成所有统计
    for (var i = 0; i < airports.length; i++) {
      var airport = airports[i];
      var country = airport.CountryName || '未知';

      // 统计各地区(支持多地区分类)
      if (self.isChinaRegion(country)) {
        regions['中国'] = (regions['中国'] || 0) + 1;
      } else if (self.isEuropeRegion(country)) {
        regions['欧洲'] = (regions['欧洲'] || 0) + 1;
      } else if (self.isMiddleEastRegion(country)) {
        regions['中东'] = (regions['中东'] || 0) + 1;
      } else if (self.isRussiaRegion(country)) {
        regions['俄罗斯'] = (regions['俄罗斯'] || 0) + 1;
      } else if (self.isSoutheastAsiaRegion(country)) {
        regions['东南亚'] = (regions['东南亚'] || 0) + 1;
      } else {
        // 其他单独国家
        regions[country] = (regions[country] || 0) + 1;
      }

      // 统计IATA代码
      if (airport.IATACode && airport.IATACode.trim()) {
        withIATA++;
      }
    }

    // 构建筛选器列表
    var filters = [
      { label: '全部', value: 'all', count: airports.length }
    ];

    // 添加地区分类(按中国航空公司常飞地区排序)
    var regionCategories = [
      { key: '中国', label: '中国' },
      { key: '东南亚', label: '东南亚' },
      { key: '日本', label: '日本' },
      { key: '韩国', label: '韩国' },
      { key: '欧洲', label: '欧洲' },
      { key: '中东', label: '中东' },
      { key: '俄罗斯', label: '俄罗斯' },
      { key: '美国', label: '美国' }
    ];

    for (var j = 0; j < regionCategories.length; j++) {
      var region = regionCategories[j];
      var count = regions[region.key] || 0;
      if (count > 0) {
        filters.push({
          label: region.label,
          value: region.key,
          count: count
        });
      }
    }

    // 添加其他分类筛选
    filters.push({
      label: '其他',
      value: 'has_iata',
      count: withIATA
    });

    this.setData({
      quickFilters: filters
    });
  },

  // 初始化排序选项
  initializeSortOptions: function() {
    var sortOptions = [
      {
        value: 'name',
        label: '按名称排序',
        desc: '按机场名称字母顺序',
        icon: 'sort'
      },
      {
        value: 'icao',
        label: '按ICAO代码',
        desc: '按ICAO代码字母顺序',
        icon: 'certificate'
      },
      {
        value: 'country',
        label: '按国家地区',
        desc: '按国家名称分组排序',
        icon: 'location'
      },
      {
        value: 'recent',
        label: '最近访问',
        desc: '按最近查看时间排序',
        icon: 'clock'
      }
    ];
    
    this.setData({
      sortOptionsList: sortOptions
    });
  },
  
  // 搜索输入处理
  onSearchInput: function(e) {
    var self = this;
    var keyword = e.detail.value || '';
    
    this.setData({
      searchKeyword: keyword,
      showSuggestions: keyword.length > 0 && keyword.length < 3,
      showRealtimePreview: false
    });
    
    // 清除之前的搜索定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    // 实时搜索预览（输入超过3个字符时）
    if (keyword.length >= 3) {
      this.performRealtimeSearch(keyword);
    }
    
    // 设置正式搜索延迟
    this.searchTimer = setTimeout(function() {
      self.performSearch(keyword);
    }, AirportConfig.searchConfig.searchDelay || 800);
  },
  
  // 搜索框聚焦
  onSearchFocus: function() {
    this.setData({
      searchFocused: true,
      showSuggestions: this.data.searchKeyword.length > 0 && this.data.searchKeyword.length < 3
    });
  },
  
  // 搜索框失去聚焦
  onSearchBlur: function() {
    var self = this;
    // 延迟隐藏，以便用户可以点击建议
    setTimeout(function() {
      self.setData({
        searchFocused: false
      });
    }, 200);
  },
  
  // 搜索确认
  onSearchConfirm: function(e) {
    var keyword = e.detail.value || this.data.searchKeyword;
    if (keyword && keyword.trim()) {
      this.performSearch(keyword);
      this.setData({
        showSuggestions: false,
        showRealtimePreview: false
      });
    }
  },
  
  // 实时搜索预览
  performRealtimeSearch: function(keyword) {
    if (!keyword || keyword.length < 3) {
      this.setData({
        realtimeResults: [],
        showRealtimePreview: false
      });
      return;
    }
    
    try {
      var results = AirportUtils.searchAirports(
        this.airportData || [],
        keyword,
        { maxResults: 10 }
      );
      
      this.setData({
        realtimeResults: results.slice(0, 5),
        showRealtimePreview: results.length > 0
      });
    } catch (error) {
      console.error('实时搜索错误:', error);
    }
  },
  
  // 执行搜索
  performSearch: function(keyword) {
    var self = this;
    
    if (!keyword || keyword.length < AirportConfig.searchConfig.minSearchLength) {
      // 重置到全部数据，只传输必要的显示数据
      var allData = this.airportData || [];
      var pageSize = this.data.pageSize;
      var displayedData = allData.slice(0, pageSize);
      
      // 将过滤后的数据存储在实例中，避免大数据传输
      this.filteredAirports = allData;
      
      this.setData({
        isSearchMode: false,
        currentPage: 1,
        showSuggestions: false,
        searchLoading: false,
        displayedAirports: displayedData,
        hasMoreData: allData.length > pageSize
      });
      return;
    }
    
    // 先设置搜索状态
    this.setData({
      searchLoading: true,
      showSuggestions: false
    });
    
    // 使用工具函数执行搜索
    try {
      var results = AirportUtils.searchAirports(
        this.airportData || [],
        keyword,
        {
          maxResults: AirportConfig.searchConfig.maxResults
        }
      );
      
      // 计算显示的数据（只显示第一页）
      var pageSize = this.data.pageSize;
      var displayedResults = results.slice(0, pageSize);
      
      // 将搜索结果存储在实例中，避免大数据传输
      this.filteredAirports = results;
      
      // 只传输显示需要的数据
      this.setData({
        isSearchMode: true,
        currentPage: 1,
        searchLoading: false,
        displayedAirports: displayedResults,
        hasMoreData: results.length > pageSize
      });
      
      // 显示搜索结果提示
      if (results.length === 0) {
        this.showToast(AirportConfig.messages.noResults, 'none');
      } else {
      }
      
    } catch (error) {
      console.error('搜索出错:', error);
      this.handleError(error, AirportConfig.messages.searchError);
      
      this.setData({
        searchLoading: false,
        isSearchMode: false
      });
    }
  },
  
  // 搜索建议点击
  onSuggestionTap: function(e) {
    var suggestion = e.currentTarget.dataset.suggestion;
    
    this.setData({
      searchKeyword: suggestion.keyword,
      showSuggestions: false,
      showRealtimePreview: false
    });
    
    this.performSearch(suggestion.keyword);
  },
  
  // 关闭搜索建议
  onCloseSuggestions: function() {
    this.setData({
      showSuggestions: false
    });
  },
  
  // 快速筛选点击
  onQuickFilterTap: function(e) {
    var filter = e.currentTarget.dataset.filter;
    
    this.setData({
      currentQuickFilter: filter.value
    });
    
    this.applyQuickFilter(filter.value);
  },
  
  // 应用快速筛选
  applyQuickFilter: function(filterValue) {
    var self = this;
    var baseData = this.airportData || [];
    var filtered;

    // 地区筛选
    if (filterValue === 'all') {
      filtered = baseData;
    } else if (filterValue === 'has_iata') {
      // 有IATA代码
      filtered = baseData.filter(function(airport) {
        return airport.IATACode && airport.IATACode.trim();
      });
    } else if (filterValue === '中国') {
      // 中国地区(包含港澳台)
      filtered = baseData.filter(function(airport) {
        return self.isChinaRegion(airport.CountryName);
      });
    } else if (filterValue === '欧洲') {
      // 欧洲地区
      filtered = baseData.filter(function(airport) {
        return self.isEuropeRegion(airport.CountryName);
      });
    } else if (filterValue === '中东') {
      // 中东地区
      filtered = baseData.filter(function(airport) {
        return self.isMiddleEastRegion(airport.CountryName);
      });
    } else if (filterValue === '俄罗斯') {
      // 俄罗斯
      filtered = baseData.filter(function(airport) {
        return self.isRussiaRegion(airport.CountryName);
      });
    } else if (filterValue === '东南亚') {
      // 东南亚地区
      filtered = baseData.filter(function(airport) {
        return self.isSoutheastAsiaRegion(airport.CountryName);
      });
    } else {
      // 精确匹配国家名(如日本、韩国、美国等)
      filtered = baseData.filter(function(airport) {
        return airport.CountryName === filterValue;
      });
    }

    this.filteredAirports = filtered;
    this.setData({
      currentPage: 1,
      isSearchMode: filterValue !== 'all'
    });

    this.updateDisplayedAirports();
  },
  
  // 显示排序弹窗
  onShowSortPopup: function() {
    this.setData({
      showSortPopup: true
    });
  },
  
  // 关闭排序弹窗
  onCloseSortPopup: function() {
    this.setData({
      showSortPopup: false
    });
  },
  
  // 排序选项点击
  onSortOptionTap: function(e) {
    var sort = e.currentTarget.dataset.sort;
    
    this.setData({
      sortType: sort.value,
      showSortPopup: false
    });
    
    this.applySorting(sort.value);
  },
  
  // 应用排序
  applySorting: function(sortType) {
    var data = this.filteredAirports || [];
    var sorted = data.slice(); // 创建副本
    
    switch (sortType) {
      case 'name':
        sorted.sort(function(a, b) {
          return (a.ShortName || '').localeCompare(b.ShortName || '');
        });
        break;
      case 'icao':
        sorted.sort(function(a, b) {
          return (a.ICAOCode || '').localeCompare(b.ICAOCode || '');
        });
        break;
      case 'country':
        sorted.sort(function(a, b) {
          var countryCompare = (a.CountryName || '').localeCompare(b.CountryName || '');
          if (countryCompare === 0) {
            return (a.ShortName || '').localeCompare(b.ShortName || '');
          }
          return countryCompare;
        });
        break;
      case 'recent':
        // 暂时按ICAO排序，后续可以添加访问记录
        sorted.sort(function(a, b) {
          return (a.ICAOCode || '').localeCompare(b.ICAOCode || '');
        });
        break;
    }
    
    this.filteredAirports = sorted;
    this.setData({
      currentPage: 1
    });
    
    this.updateDisplayedAirports();
  },
  
  // 国家筛选
  onCountryChange: function(e) {
    var country = e.detail.value;
    var countryName = this.data.countryList[country].value;
    
    this.setData({
      currentCountry: countryName
    });
    
    this.applyFilters();
  },
  
  // 应用筛选
  applyFilters: function() {
    var baseData = this.data.isSearchMode ? this.filteredAirports : this.airportData;
    var filtered = baseData || [];
    
    // 国家筛选
    if (this.data.currentCountry !== 'all') {
      filtered = filtered.filter(function(airport) {
        return airport.CountryName === this.data.currentCountry;
      }.bind(this));
    }
    
    // 将筛选结果存储在实例中
    this.filteredAirports = filtered;
    
    this.setData({
      currentPage: 1
    });
    
    this.updateDisplayedAirports();
  },
  
  // 更新显示的机场列表
  updateDisplayedAirports: function(cumulativeMode) {
    var pageSize = this.data.pageSize;
    var currentPage = this.data.currentPage;
    var filteredData = this.filteredAirports || [];
    var displayed;
    
    if (cumulativeMode) {
      // 累积模式：从第一页到当前页的所有数据（用于加载更多）
      var end = currentPage * pageSize;
      displayed = filteredData.slice(0, end);
    } else {
      // 分页模式：只显示当前页（用于搜索、筛选等）
      var start = (currentPage - 1) * pageSize;
      var endPage = start + pageSize;
      displayed = filteredData.slice(start, endPage);
    }
    
    this.setData({
      displayedAirports: displayed,
      hasMoreData: (currentPage * pageSize) < filteredData.length
    });
  },
  
  // 加载更多数据
  onLoadMore: function() {
    if (!this.data.hasMoreData || this.data.loading) {
      return;
    }
    
    this.setData({
      currentPage: this.data.currentPage + 1
    });
    
    // 使用累积模式显示更多数据
    this.updateDisplayedAirports(true);
  },
  
  // 点击机场项
  onAirportTap: function(e) {
    var airport = e.currentTarget.dataset.airport;
    
    if (!airport) {
      return;
    }
    
    // 导航到机场详情页面
    wx.navigateTo({
      url: './detail/index?icao=' + encodeURIComponent(airport.ICAOCode),
      fail: function(error) {
        console.error('导航到机场详情失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 在地图中显示机场
  onShowAirportInMap: function(e) {
    var airport = e.currentTarget.dataset.airport;
    
    if (!airport || !airport.Latitude || !airport.Longitude) {
      wx.showToast({
        title: '无坐标信息',
        icon: 'none'
      });
      return;
    }
    
    // 打开地图查看位置
    wx.openLocation({
      latitude: airport.Latitude,
      longitude: airport.Longitude,
      name: airport.ShortName,
      address: airport.CountryName + ' ' + (airport.EnglishName || ''),
      fail: function(error) {
        console.error('打开地图失败:', error);
        wx.showToast({
          title: '打开地图失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 清除搜索
  onClearSearch: function() {
    // 清除搜索定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    // 重置筛选数据到全部机场
    this.filteredAirports = this.airportData || [];
    
    this.setData({
      searchKeyword: '',
      isSearchMode: false,
      currentPage: 1,
      showSuggestions: false,
      showRealtimePreview: false,
      realtimeResults: [],
      currentQuickFilter: 'all'
    });
    
    this.updateDisplayedAirports();
  },
  
  // 下拉刷新
  onPullDownRefresh: function() {
    var self = this;
    
    // 清除缓存并重新加载
    AirportDataLoader.clearCache();
    
    this.loadAirportData().then(function() {
      self.initializeData();
      self.updateDisplayedAirports();
      
      wx.stopPullDownRefresh();
      self.showSuccess('数据已刷新');
    }).catch(function(error) {
      wx.stopPullDownRefresh();
      self.handleError(error, '刷新失败');
    });
  },
  
  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '机场数据查询 - FlightToolbox',
      path: '/packageAirport/index',
      imageUrl: '/images/share-airport.png'
    };
  },

  // 广告加载成功
  onAdLoad: function() {
    console.log('[机场数据查询] Banner ad loaded successfully');
  },

  // 广告加载失败
  onAdError: function(err) {
    console.warn('[机场数据查询] Banner ad load failed:', err);
    // 广告失败不影响页面功能，仅记录日志
  }

};

Page(BasePage.createPage(pageConfig));