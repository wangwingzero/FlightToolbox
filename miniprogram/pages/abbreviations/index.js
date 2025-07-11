/**
 * 万能查询页面 - 重构版本
 * 使用BasePage基类和SearchComponent，遵循ES5语法
 * 包含缩写、定义、机场和通信查询功能
 * 解决搜索功能重复代码问题
 */

var BasePage = require('../../utils/base-page.js');
var SearchComponent = require('../../utils/search-component.js');
var dataLoader = require('../../utils/data-loader.js');
var dataManagerUtil = require('../../utils/data-manager.js');
var searchManagerModule = require('../../utils/search-manager.js');
var searchManager = searchManagerModule.searchManager;

// 创建搜索组件实例
var searchComponent = SearchComponent.createSearchComponent({
  searchDelay: 300,
  enableCache: true,
  minLength: 1,
  maxResults: 100
});

// 创建页面配置
var pageConfig = {
  data: {
    // 当前选中的标签页
    activeTab: 'abbreviations',
    
    // 缩写数据相关
    abbreviations: [],
    abbreviationGroups: [],
    filteredAbbreviations: [],
    currentLetterAbbreviations: [],
    selectedLetter: '',
    selectedCategoryName: '',
    showAbbreviationGroups: true,
    abbreviationSearchValue: '',
    
    // 定义数据相关
    definitions: [],
    definitionGroups: [],
    filteredDefinitions: [],
    currentLetterDefinitions: [],
    selectedDefinitionLetter: '',
    selectedDefinitionCategoryName: '',
    showDefinitionGroups: true,
    definitionSearchValue: '',
    
    // 机场数据相关
    airports: [],
    airportGroups: [],
    filteredAirports: [],
    currentLetterAirports: [],
    selectedAirportLetter: '',
    selectedAirportCategoryName: '',
    showAirportGroups: true,
    airportSearchValue: '',
    
    // 通信数据相关
    communications: [],
    communicationGroups: [],
    filteredCommunications: [],
    currentChapterCommunications: [],
    selectedChapter: '',
    selectedChapterName: '',
    showCommunicationGroups: true,
    communicationSearchValue: '',
    communicationsLoading: false,
    
    // 规章数据相关
    normativeDocuments: [],
    validityFilter: 'all',
    
    // 搜索相关
    searchValue: '',
    filteredList: [],
    
    // 规范性文件相关数据
    normativeSearchValue: '',
    filteredNormativeDocuments: [],
    normativeCategories: [],
    normativeSubcategories: [],
    normativeStatistics: {},
    ccarRegulation: null,
    showNormativeSearch: false,
    showNormativeCategoryDetail: false,
    showNormativeDocumentList: false,
    selectedNormativeCategory: '',
    selectedNormativeSubcategory: '',
    normativeLoading: false,
    
    // 规章字母分组相关
    showNormativeGroups: true,
    selectedNormativeLetter: '',
    normativeGroups: [],
    currentLetterNormatives: []
  },

  /**
   * 自定义页面加载方法
   */
  customOnLoad: function(options) {
    console.log('🔍 万能查询页面开始加载...');
    
    try {
      console.log('📱 运行环境: WeChat MiniProgram');
    } catch (error) {
      console.log('📱 运行环境: WeChat MiniProgram (获取详细信息失败)');
    }
    
    // 初始化所有数据
    this.initializeAllData();
  },

  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    console.log('🔍 万能查询页面显示');
    // 可以在这里刷新数据
  },

  /**
   * 初始化所有数据
   */
  initializeAllData: function() {
    var self = this;
    
    // 显示加载状态
    this.showLoading('正在加载数据...');
    
    // 并行加载所有数据
    Promise.all([
      this.loadAbbreviationsData(),
      this.loadDefinitionsData(),
      this.loadAirportsData(),
      this.loadCommunicationsData(),
      this.loadNormativeDocumentsData()
    ]).then(function(results) {
      console.log('✅ 所有数据加载完成');
      self.hideLoading();
    }).catch(function(error) {
      console.error('❌ 数据加载失败:', error);
      self.hideLoading();
      self.handleError(error, '数据加载');
    });
  },

  /**
   * 加载缩写数据
   */
  loadAbbreviationsData: function() {
    var self = this;
    
    return this.loadSubpackageData('packageA', '../../packageA/data.js', {
      context: '缩写数据',
      loadingKey: 'abbreviationsLoading',
      dataKey: 'abbreviationsData',
      fallbackData: []
    }).then(function(data) {
      var processedData = self.processAbbreviationsData(data);
      self.setData({
        abbreviations: processedData.abbreviations,
        abbreviationGroups: processedData.groups,
        filteredAbbreviations: processedData.abbreviations
      });
      return processedData;
    });
  },

  /**
   * 加载定义数据
   */
  loadDefinitionsData: function() {
    var self = this;
    
    return this.loadSubpackageData('packageD', '../../packageD/data.js', {
      context: '定义数据',
      loadingKey: 'definitionsLoading',
      dataKey: 'definitionsData',
      fallbackData: []
    }).then(function(data) {
      var processedData = self.processDefinitionsData(data);
      self.setData({
        definitions: processedData.definitions,
        definitionGroups: processedData.groups,
        filteredDefinitions: processedData.definitions
      });
      return processedData;
    });
  },

  /**
   * 加载机场数据
   */
  loadAirportsData: function() {
    var self = this;
    
    return this.loadSubpackageData('packageC', '../../packageC/data.js', {
      context: '机场数据',
      loadingKey: 'airportsLoading',
      dataKey: 'airportsData',
      fallbackData: []
    }).then(function(data) {
      var processedData = self.processAirportsData(data);
      self.setData({
        airports: processedData.airports,
        airportGroups: processedData.groups,
        filteredAirports: processedData.airports
      });
      return processedData;
    });
  },

  /**
   * 加载通信数据
   */
  loadCommunicationsData: function() {
    var self = this;
    
    return this.loadSubpackageData('packageF', '../../packageF/data.js', {
      context: '通信数据',
      loadingKey: 'communicationsLoading',
      dataKey: 'communicationsData',
      fallbackData: []
    }).then(function(data) {
      var processedData = self.processCommunicationsData(data);
      self.setData({
        communications: processedData.communications,
        communicationGroups: processedData.groups,
        filteredCommunications: processedData.communications
      });
      return processedData;
    });
  },

  /**
   * 加载规范性文件数据
   */
  loadNormativeDocumentsData: function() {
    var self = this;
    
    return this.loadSubpackageData('packageE', '../../packageE/data.js', {
      context: '规范性文件数据',
      loadingKey: 'normativeLoading',
      dataKey: 'normativeData',
      fallbackData: []
    }).then(function(data) {
      var processedData = self.processNormativeDocumentsData(data);
      self.setData({
        normativeDocuments: processedData.documents,
        normativeGroups: processedData.groups,
        filteredNormativeDocuments: processedData.documents
      });
      return processedData;
    });
  },

  /**
   * 处理缩写数据
   */
  processAbbreviationsData: function(data) {
    try {
      var groups = dataManagerUtil.groupDataByLetter(data, 'abbreviation');
      return {
        abbreviations: data,
        groups: groups
      };
    } catch (error) {
      console.error('处理缩写数据失败:', error);
      return { abbreviations: [], groups: [] };
    }
  },

  /**
   * 处理定义数据
   */
  processDefinitionsData: function(data) {
    try {
      var groups = dataManagerUtil.groupDataByLetter(data, 'term');
      return {
        definitions: data,
        groups: groups
      };
    } catch (error) {
      console.error('处理定义数据失败:', error);
      return { definitions: [], groups: [] };
    }
  },

  /**
   * 处理机场数据
   */
  processAirportsData: function(data) {
    try {
      var groups = dataManagerUtil.groupDataByLetter(data, 'icao');
      return {
        airports: data,
        groups: groups
      };
    } catch (error) {
      console.error('处理机场数据失败:', error);
      return { airports: [], groups: [] };
    }
  },

  /**
   * 处理通信数据
   */
  processCommunicationsData: function(data) {
    try {
      var groups = dataManagerUtil.groupDataByChapter(data);
      return {
        communications: data,
        groups: groups
      };
    } catch (error) {
      console.error('处理通信数据失败:', error);
      return { communications: [], groups: [] };
    }
  },

  /**
   * 处理规范性文件数据
   */
  processNormativeDocumentsData: function(data) {
    try {
      var groups = dataManagerUtil.groupDataByLetter(data, 'title');
      return {
        documents: data,
        groups: groups
      };
    } catch (error) {
      console.error('处理规范性文件数据失败:', error);
      return { documents: [], groups: [] };
    }
  },

  /**
   * 标签页切换
   */
  onTabChange: function(e) {
    var activeTab = e.detail.name;
    this.setData({ activeTab: activeTab });
    console.log('🔍 切换到标签页:', activeTab);
  },

  /**
   * 缩写搜索
   */
  onAbbreviationSearch: function(e) {
    var searchValue = e.detail.value;
    this.setData({ abbreviationSearchValue: searchValue });
    this.performAbbreviationSearch(searchValue);
  },

  /**
   * 执行缩写搜索
   */
  performAbbreviationSearch: function(searchValue) {
    var self = this;
    
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredAbbreviations: this.data.abbreviations,
        showAbbreviationGroups: true
      });
      return;
    }
    
    this.setData({ showAbbreviationGroups: false });
    
    try {
      var results = searchComponent.search(searchValue, this.data.abbreviations, {
        searchFields: ['abbreviation', 'definition', 'category'],
        caseSensitive: false,
        exactMatch: false
      });
      
      this.setData({ filteredAbbreviations: results });
    } catch (error) {
      console.error('缩写搜索失败:', error);
      this.fallbackAbbreviationSearch(searchValue);
    }
  },

  /**
   * 缩写搜索兜底方案
   */
  fallbackAbbreviationSearch: function(searchValue) {
    try {
      var results = searchManager.searchAbbreviations(searchValue, 100);
      this.setData({ filteredAbbreviations: results });
    } catch (error) {
      console.error('缩写搜索兜底方案也失败:', error);
      this.setData({ filteredAbbreviations: [] });
    }
  },

  /**
   * 定义搜索
   */
  onDefinitionSearch: function(e) {
    var searchValue = e.detail.value;
    this.setData({ definitionSearchValue: searchValue });
    this.performDefinitionSearch(searchValue);
  },

  /**
   * 执行定义搜索
   */
  performDefinitionSearch: function(searchValue) {
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredDefinitions: this.data.definitions,
        showDefinitionGroups: true
      });
      return;
    }
    
    this.setData({ showDefinitionGroups: false });
    
    try {
      var results = searchComponent.search(searchValue, this.data.definitions, {
        searchFields: ['term', 'definition', 'category'],
        caseSensitive: false,
        exactMatch: false
      });
      
      this.setData({ filteredDefinitions: results });
    } catch (error) {
      console.error('定义搜索失败:', error);
      this.fallbackDefinitionSearch(searchValue);
    }
  },

  /**
   * 定义搜索兜底方案
   */
  fallbackDefinitionSearch: function(searchValue) {
    try {
      var results = searchManager.searchDefinitions(searchValue, 100);
      this.setData({ filteredDefinitions: results });
    } catch (error) {
      console.error('定义搜索兜底方案也失败:', error);
      this.setData({ filteredDefinitions: [] });
    }
  },

  /**
   * 机场搜索
   */
  onAirportSearch: function(e) {
    var searchValue = e.detail.value;
    this.setData({ airportSearchValue: searchValue });
    this.performAirportSearch(searchValue);
  },

  /**
   * 执行机场搜索
   */
  performAirportSearch: function(searchValue) {
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredAirports: this.data.airports,
        showAirportGroups: true
      });
      return;
    }
    
    this.setData({ showAirportGroups: false });
    
    try {
      var results = searchComponent.search(searchValue, this.data.airports, {
        searchFields: ['icao', 'iata', 'name', 'city', 'country'],
        caseSensitive: false,
        exactMatch: false
      });
      
      this.setData({ filteredAirports: results });
    } catch (error) {
      console.error('机场搜索失败:', error);
      this.fallbackAirportSearch(searchValue);
    }
  },

  /**
   * 机场搜索兜底方案
   */
  fallbackAirportSearch: function(searchValue) {
    try {
      var results = searchManager.searchAirports(searchValue, 100);
      this.setData({ filteredAirports: results });
    } catch (error) {
      console.error('机场搜索兜底方案也失败:', error);
      this.setData({ filteredAirports: [] });
    }
  },

  /**
   * 通信搜索
   */
  onCommunicationSearch: function(e) {
    var searchValue = e.detail.value;
    this.setData({ communicationSearchValue: searchValue });
    this.performCommunicationSearch(searchValue);
  },

  /**
   * 执行通信搜索
   */
  performCommunicationSearch: function(searchValue) {
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredCommunications: this.data.communications,
        showCommunicationGroups: true
      });
      return;
    }
    
    this.setData({ showCommunicationGroups: false });
    
    try {
      var results = searchComponent.search(searchValue, this.data.communications, {
        searchFields: ['title', 'content', 'chapter', 'keywords'],
        caseSensitive: false,
        exactMatch: false
      });
      
      this.setData({ filteredCommunications: results });
    } catch (error) {
      console.error('通信搜索失败:', error);
      this.fallbackCommunicationSearch(searchValue);
    }
  },

  /**
   * 通信搜索兜底方案
   */
  fallbackCommunicationSearch: function(searchValue) {
    try {
      var results = searchManager.searchCommunications(searchValue, 100);
      this.setData({ filteredCommunications: results });
    } catch (error) {
      console.error('通信搜索兜底方案也失败:', error);
      this.setData({ filteredCommunications: [] });
    }
  },

  /**
   * 字母分组选择（缩写）
   */
  onLetterSelect: function(e) {
    var letter = e.currentTarget.dataset.letter;
    var items = e.currentTarget.dataset.items;
    
    this.setData({
      selectedLetter: letter,
      currentLetterAbbreviations: items,
      showAbbreviationGroups: false
    });
  },

  /**
   * 字母分组选择（定义）
   */
  onDefinitionLetterSelect: function(e) {
    var letter = e.currentTarget.dataset.letter;
    var items = e.currentTarget.dataset.items;
    
    this.setData({
      selectedDefinitionLetter: letter,
      currentLetterDefinitions: items,
      showDefinitionGroups: false
    });
  },

  /**
   * 字母分组选择（机场）
   */
  onAirportLetterSelect: function(e) {
    var letter = e.currentTarget.dataset.letter;
    var items = e.currentTarget.dataset.items;
    
    this.setData({
      selectedAirportLetter: letter,
      currentLetterAirports: items,
      showAirportGroups: false
    });
  },

  /**
   * 章节选择（通信）
   */
  onChapterSelect: function(e) {
    var chapter = e.currentTarget.dataset.chapter;
    var items = e.currentTarget.dataset.items;
    var chapterName = e.currentTarget.dataset.name;
    
    this.setData({
      selectedChapter: chapter,
      selectedChapterName: chapterName,
      currentChapterCommunications: items,
      showCommunicationGroups: false
    });
  },

  /**
   * 返回分组列表
   */
  backToGroups: function(e) {
    var type = e.currentTarget.dataset.type;
    
    switch (type) {
      case 'abbreviations':
        this.setData({
          showAbbreviationGroups: true,
          selectedLetter: '',
          currentLetterAbbreviations: []
        });
        break;
      case 'definitions':
        this.setData({
          showDefinitionGroups: true,
          selectedDefinitionLetter: '',
          currentLetterDefinitions: []
        });
        break;
      case 'airports':
        this.setData({
          showAirportGroups: true,
          selectedAirportLetter: '',
          currentLetterAirports: []
        });
        break;
      case 'communications':
        this.setData({
          showCommunicationGroups: true,
          selectedChapter: '',
          currentChapterCommunications: []
        });
        break;
    }
  },

  /**
   * 清除搜索
   */
  clearSearch: function(e) {
    var type = e.currentTarget.dataset.type;
    
    switch (type) {
      case 'abbreviations':
        this.setData({
          abbreviationSearchValue: '',
          filteredAbbreviations: this.data.abbreviations,
          showAbbreviationGroups: true
        });
        break;
      case 'definitions':
        this.setData({
          definitionSearchValue: '',
          filteredDefinitions: this.data.definitions,
          showDefinitionGroups: true
        });
        break;
      case 'airports':
        this.setData({
          airportSearchValue: '',
          filteredAirports: this.data.airports,
          showAirportGroups: true
        });
        break;
      case 'communications':
        this.setData({
          communicationSearchValue: '',
          filteredCommunications: this.data.communications,
          showCommunicationGroups: true
        });
        break;
    }
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));