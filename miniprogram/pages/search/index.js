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
var pointsManagerUtil = require('../../utils/points-manager.js');

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
    
    // 分类菜单数据
    categoryList: [
      { name: 'abbreviations', title: '缩写查询', count: 0 },
      { name: 'definitions', title: '定义查询', count: 0 },
      { name: 'airports', title: '机场查询', count: 0 },
      { name: 'communications', title: '通信查询', count: 0 },
      { name: 'normative', title: '规章查询', count: 0 }
    ],
    
    // 缩写数据相关
    abbreviations: [],
    abbreviationsList: [],
    abbreviationGroups: [],
    filteredAbbreviations: [],
    currentLetterAbbreviations: [],
    selectedLetter: '',
    selectedAbbreviationLetter: '',
    selectedCategoryName: '',
    showAbbreviationGroups: true,
    showAbbreviationItems: false,
    abbreviationSearchValue: '',
    
    // 定义数据相关
    definitions: [],
    definitionsList: [],
    definitionGroups: [],
    filteredDefinitions: [],
    currentLetterDefinitions: [],
    selectedDefinitionLetter: '',
    selectedDefinitionCategoryName: '',
    showDefinitionGroups: true,
    definitionSearchValue: '',
    
    // 机场数据相关
    airports: [],
    airportsList: [],
    airportGroups: [],
    filteredAirports: [],
    currentLetterAirports: [],
    selectedAirportLetter: '',
    selectedAirportCategoryName: '',
    showAirportGroups: true,
    airportSearchValue: '',
    
    // 通信数据相关
    communications: [],
    communicationsList: [],
    communicationGroups: [],
    filteredCommunications: [],
    currentChapterCommunications: [],
    currentLetterCommunications: [],
    selectedChapter: '',
    selectedChapterName: '',
    selectedCommunicationLetter: '',
    showCommunicationGroups: true,
    communicationSearchValue: '',
    communicationsLoading: false,
    
    // 规章数据相关
    normativeDocuments: [],
    validityFilter: 'all',
    
    // 搜索相关
    searchValue: '',
    filteredList: [],
    
    // 积分扣费记录 - 避免重复扣费
    lastChargedAbbreviation: '',
    lastChargedDefinition: '',
    lastChargedAirport: '',
    lastChargedCommunication: '',
    lastChargedNormative: '',
    
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
    
    return dataLoader.loadSubpackageData(this, 'packageB', '../../packageB/abbreviations.js', {
      context: '缩写数据', 
      loadingKey: 'abbreviationsLoading',
      dataKey: 'abbreviationsData',
      fallbackData: []
    }).then(function(data) {
      var processedData = self.processAbbreviationsData(data);
      self.setData({
        abbreviations: processedData.abbreviations,
        abbreviationsList: processedData.abbreviations,
        abbreviationGroups: processedData.groups,
        filteredAbbreviations: processedData.abbreviations
      });
      
      // 更新分类菜单计数
      self.updateCategoryCount('abbreviations', processedData.abbreviations.length);
      
      return processedData;
    });
  },

  /**
   * 加载定义数据
   */
  loadDefinitionsData: function() {
    var self = this;
    
    return dataLoader.loadSubpackageData(this, 'packageD', '../../packageD/definitions.js', {
      context: '定义数据',
      loadingKey: 'definitionsLoading',
      dataKey: 'definitionsData',
      fallbackData: []
    }).then(function(data) {
      var processedData = self.processDefinitionsData(data);
      self.setData({
        definitions: processedData.definitions,
        definitionsList: processedData.definitions,
        definitionGroups: processedData.groups,
        filteredDefinitions: processedData.definitions
      });
      
      // 更新分类菜单计数
      self.updateCategoryCount('definitions', processedData.definitions.length);
      
      return processedData;
    });
  },

  /**
   * 加载机场数据
   */
  loadAirportsData: function() {
    var self = this;
    
    return dataLoader.loadSubpackageData(this, 'packageC', '../../packageC/airportdata.js', {
      context: '机场数据',
      loadingKey: 'airportsLoading',
      dataKey: 'airportsData',
      fallbackData: []
    }).then(function(data) {
      var processedData = self.processAirportsData(data);
      self.setData({
        airports: processedData.airports,
        airportsList: processedData.airports,
        airportGroups: processedData.groups,
        filteredAirports: processedData.airports
      });
      
      // 更新分类菜单计数
      self.updateCategoryCount('airports', processedData.airports.length);
      
      return processedData;
    });
  },

  /**
   * 加载通信数据
   */
  loadCommunicationsData: function() {
    var self = this;
    
    return dataLoader.loadSubpackageData(this, 'packageA', '../../packageA/icao900.js', {
      context: '通信数据',
      loadingKey: 'communicationsLoading',
      dataKey: 'communicationsData',
      fallbackData: []
    }).then(function(data) {
      var processedData = self.processCommunicationsData(data);
      self.setData({
        communications: processedData.communications,
        communicationsList: processedData.communications,
        communicationGroups: processedData.groups,
        filteredCommunications: processedData.communications
      });
      
      // 更新分类菜单计数
      self.updateCategoryCount('communications', processedData.communications.length);
      
      return processedData;
    });
  },

  /**
   * 加载规范性文件数据
   */
  loadNormativeDocumentsData: function() {
    var self = this;
    
    return dataLoader.loadSubpackageData(this, 'packageE', '../../packageE/data.js', {
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
      
      // 更新分类菜单计数
      self.updateCategoryCount('normative', processedData.documents.length);
      
      return processedData;
    });
  },

  /**
   * 更新分类菜单计数
   */
  updateCategoryCount: function(categoryName, count) {
    var categoryList = this.data.categoryList;
    for (var i = 0; i < categoryList.length; i++) {
      if (categoryList[i].name === categoryName) {
        categoryList[i].count = count;
        break;
      }
    }
    this.setData({ categoryList: categoryList });
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
      var groups = dataManagerUtil.groupDataByLetter(data, 'chinese_name');
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
      var groups = dataManagerUtil.groupDataByLetter(data, 'ICAOCode');
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
      // 通信数据有特殊的嵌套结构，需要先展平处理
      var flattenedData = [];
      if (data && data.chapters && Array.isArray(data.chapters)) {
        for (var i = 0; i < data.chapters.length; i++) {
          var chapter = data.chapters[i];
          if (chapter && chapter.sentences && Array.isArray(chapter.sentences)) {
            for (var j = 0; j < chapter.sentences.length; j++) {
              var sentence = chapter.sentences[j];
              if (sentence) {
                // 为每个句子添加章节信息
                var flatItem = {
                  id: sentence.id,
                  english: sentence.english,
                  chinese: sentence.chinese,
                  chapter: chapter.name || '未分类',
                  chapterIndex: i + 1
                };
                flattenedData.push(flatItem);
              }
            }
          }
        }
      }
      
      var groups = dataManagerUtil.groupDataByChapter(flattenedData);
      return {
        communications: flattenedData,
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
      // 为每个文档添加 is_effective 字段，将 validity 转换为布尔值
      var processedData = data.map(function(item) {
        return Object.assign({}, item, {
          is_effective: item.validity === '有效'
        });
      });
      
      var groups = dataManagerUtil.groupDataByLetter(processedData, 'title');
      return {
        documents: processedData,
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
    var activeTab;
    
    if (e.detail && e.detail.name) {
      activeTab = e.detail.name;
    } else if (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.name) {
      activeTab = e.currentTarget.dataset.name;
    } else if (e.detail) {
      activeTab = e.detail;
    } else {
      activeTab = this.data.activeTab; // 保持当前值
      console.warn('🔍 无法获取标签页名称，保持当前状态:', activeTab);
      return;
    }
    
    if (activeTab) {
      this.setData({ activeTab: activeTab });
      console.log('🔍 切换到标签页:', activeTab);
    }
  },

  /**
   * 通用搜索处理
   */
  onSearch: function(e) {
    this.onAbbreviationSearch(e);
  },

  /**
   * 通用搜索变化处理
   */
  onSearchChange: function(e) {
    this.onAbbreviationSearch(e);
  },

  /**
   * 通用搜索清除处理
   */
  onSearchClear: function() {
    this.setData({
      searchValue: '',
      filteredList: this.data.abbreviations
    });
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
    
    // 检查是否需要扣费（避免重复扣费）
    var trimmedValue = searchValue.trim();
    var shouldCharge = trimmedValue.length >= 2 && trimmedValue !== this.data.lastChargedAbbreviation;
    
    if (shouldCharge) {
      // 缩写搜索需要消费1积分
      pointsManagerUtil.consumePoints('abbreviations-search', '缩写搜索: ' + trimmedValue).then(function(result) {
        if (result.success) {
          // 记录已扣费的搜索词
          self.setData({ lastChargedAbbreviation: trimmedValue });
          
          // 显示积分扣费提示
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 1500
          });
          
          // 执行搜索
          self.doAbbreviationSearch(searchValue);
        } else {
          // 积分不足，不执行搜索
          console.log('积分不足，无法执行缩写搜索');
        }
      }).catch(function(error) {
        console.error('缩写搜索积分扣费失败:', error);
        // 扣费失败时仍然执行搜索
        self.doAbbreviationSearch(searchValue);
      });
    } else {
      // 不需要扣费，直接搜索
      this.doAbbreviationSearch(searchValue);
    }
  },
  
  /**
   * 实际执行缩写搜索
   */
  doAbbreviationSearch: function(searchValue) {
    this.setData({ showAbbreviationGroups: false });
    
    try {
      var results = searchComponent.search(searchValue, this.data.abbreviations, {
        searchFields: ['abbreviation', 'english_full', 'chinese_translation'],
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
   * 定义搜索变化
   */
  onDefinitionSearchChange: function(e) {
    this.onDefinitionSearch(e);
  },

  /**
   * 定义搜索清除
   */
  onDefinitionSearchClear: function() {
    this.setData({
      definitionSearchValue: '',
      filteredDefinitions: this.data.definitions,
      showDefinitionGroups: true
    });
  },

  /**
   * 执行定义搜索
   */
  performDefinitionSearch: function(searchValue) {
    var self = this;
    
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredDefinitions: this.data.definitions,
        showDefinitionGroups: true
      });
      return;
    }
    
    // 检查是否需要扣费（避免重复扣费）
    var trimmedValue = searchValue.trim();
    var shouldCharge = trimmedValue.length >= 2 && trimmedValue !== this.data.lastChargedDefinition;
    
    if (shouldCharge) {
      // 定义搜索需要消费1积分
      pointsManagerUtil.consumePoints('definitions-search', '定义搜索: ' + trimmedValue).then(function(result) {
        if (result.success) {
          // 记录已扣费的搜索词
          self.setData({ lastChargedDefinition: trimmedValue });
          
          // 显示积分扣费提示
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 1500
          });
          
          // 执行搜索
          self.doDefinitionSearch(searchValue);
        } else {
          // 积分不足，不执行搜索
          console.log('积分不足，无法执行定义搜索');
        }
      }).catch(function(error) {
        console.error('定义搜索积分扣费失败:', error);
        // 扣费失败时仍然执行搜索
        self.doDefinitionSearch(searchValue);
      });
    } else {
      // 不需要扣费，直接搜索
      this.doDefinitionSearch(searchValue);
    }
  },
  
  /**
   * 实际执行定义搜索
   */
  doDefinitionSearch: function(searchValue) {
    this.setData({ showDefinitionGroups: false });
    
    try {
      var results = searchComponent.search(searchValue, this.data.definitions, {
        searchFields: ['chinese_name', 'english_name', 'definition'],
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
   * 机场搜索变化
   */
  onAirportSearchChange: function(e) {
    this.onAirportSearch(e);
  },

  /**
   * 机场搜索清除
   */
  onAirportSearchClear: function() {
    this.setData({
      airportSearchValue: '',
      filteredAirports: this.data.airports,
      showAirportGroups: true
    });
  },

  /**
   * 执行机场搜索
   */
  performAirportSearch: function(searchValue) {
    var self = this;
    
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredAirports: this.data.airports,
        showAirportGroups: true
      });
      return;
    }
    
    // 检查是否需要扣费（避免重复扣费）
    var trimmedValue = searchValue.trim();
    var shouldCharge = trimmedValue.length >= 2 && trimmedValue !== this.data.lastChargedAirport;
    
    if (shouldCharge) {
      // 机场搜索需要消费1积分
      pointsManagerUtil.consumePoints('airports-search', '机场搜索: ' + trimmedValue).then(function(result) {
        if (result.success) {
          // 记录已扣费的搜索词
          self.setData({ lastChargedAirport: trimmedValue });
          
          // 显示积分扣费提示
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 1500
          });
          
          // 执行搜索
          self.doAirportSearch(searchValue);
        } else {
          // 积分不足，不执行搜索
          console.log('积分不足，无法执行机场搜索');
        }
      }).catch(function(error) {
        console.error('机场搜索积分扣费失败:', error);
        // 扣费失败时仍然执行搜索
        self.doAirportSearch(searchValue);
      });
    } else {
      // 不需要扣费，直接搜索
      this.doAirportSearch(searchValue);
    }
  },
  
  /**
   * 实际执行机场搜索
   */
  doAirportSearch: function(searchValue) {
    this.setData({ showAirportGroups: false });
    
    try {
      var results = searchComponent.search(searchValue, this.data.airports, {
        searchFields: ['ICAOCode', 'IATACode', 'ShortName', 'EnglishName', 'CountryName'],
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
   * 通信搜索变化
   */
  onCommunicationSearchChange: function(e) {
    this.onCommunicationSearch(e);
  },

  /**
   * 通信搜索清除
   */
  onCommunicationSearchClear: function() {
    this.setData({
      communicationSearchValue: '',
      filteredCommunications: this.data.communications,
      showCommunicationGroups: true
    });
  },

  /**
   * 执行通信搜索
   */
  performCommunicationSearch: function(searchValue) {
    var self = this;
    
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredCommunications: this.data.communications,
        showCommunicationGroups: true
      });
      return;
    }
    
    // 检查是否需要扣费（避免重复扣费）
    var trimmedValue = searchValue.trim();
    var shouldCharge = trimmedValue.length >= 2 && trimmedValue !== this.data.lastChargedCommunication;
    
    if (shouldCharge) {
      // 通信搜索需要消费1积分
      pointsManagerUtil.consumePoints('communications-search', '通信搜索: ' + trimmedValue).then(function(result) {
        if (result.success) {
          // 记录已扣费的搜索词
          self.setData({ lastChargedCommunication: trimmedValue });
          
          // 显示积分扣费提示
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 1500
          });
          
          // 执行搜索
          self.doCommunicationSearch(searchValue);
        } else {
          // 积分不足，不执行搜索
          console.log('积分不足，无法执行通信搜索');
        }
      }).catch(function(error) {
        console.error('通信搜索积分扣费失败:', error);
        // 扣费失败时仍然执行搜索
        self.doCommunicationSearch(searchValue);
      });
    } else {
      // 不需要扣费，直接搜索
      this.doCommunicationSearch(searchValue);
    }
  },
  
  /**
   * 实际执行通信搜索
   */
  doCommunicationSearch: function(searchValue) {
    this.setData({ showCommunicationGroups: false });
    
    try {
      var results = searchComponent.search(searchValue, this.data.communications, {
        searchFields: ['english', 'chinese', 'chapter'],
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
   * 字母分组选择（缩写）- 兼容方法
   */
  onLetterSelect: function(e) {
    this.onAbbreviationLetterTap(e);
  },

  /**
   * 缩写字母分组点击
   */
  onAbbreviationLetterTap: function(e) {
    var letter = e.currentTarget.dataset.letter;
    var groups = this.data.abbreviationGroups;
    var selectedGroup = null;
    
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].letter === letter) {
        selectedGroup = groups[i];
        break;
      }
    }
    
    if (selectedGroup && selectedGroup.items) {
      this.setData({
        selectedLetter: letter,
        selectedAbbreviationLetter: letter,
        currentLetterAbbreviations: selectedGroup.items,
        showAbbreviationGroups: false,
        showAbbreviationItems: true
      });
    }
  },

  /**
   * 返回缩写分组列表
   */
  backToAbbreviationGroups: function() {
    this.setData({
      showAbbreviationGroups: true,
      showAbbreviationItems: false,
      selectedLetter: '',
      selectedAbbreviationLetter: '',
      currentLetterAbbreviations: []
    });
  },

  /**
   * 字母分组选择（定义）- 兼容方法
   */
  onDefinitionLetterSelect: function(e) {
    this.onDefinitionLetterTap(e);
  },

  /**
   * 定义字母分组点击
   */
  onDefinitionLetterTap: function(e) {
    var letter = e.currentTarget.dataset.letter;
    var groups = this.data.definitionGroups;
    var selectedGroup = null;
    
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].letter === letter) {
        selectedGroup = groups[i];
        break;
      }
    }
    
    if (selectedGroup && selectedGroup.items) {
      this.setData({
        selectedDefinitionLetter: letter,
        currentLetterDefinitions: selectedGroup.items,
        showDefinitionGroups: false
      });
    }
  },

  /**
   * 返回定义分组列表
   */
  backToDefinitionGroups: function() {
    this.setData({
      showDefinitionGroups: true,
      selectedDefinitionLetter: '',
      currentLetterDefinitions: []
    });
  },

  /**
   * 字母分组选择（机场）- 兼容方法
   */
  onAirportLetterSelect: function(e) {
    this.onAirportLetterTap(e);
  },

  /**
   * 机场字母分组点击
   */
  onAirportLetterTap: function(e) {
    var letter = e.currentTarget.dataset.letter;
    var groups = this.data.airportGroups;
    var selectedGroup = null;
    
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].letter === letter) {
        selectedGroup = groups[i];
        break;
      }
    }
    
    if (selectedGroup && selectedGroup.items) {
      this.setData({
        selectedAirportLetter: letter,
        currentLetterAirports: selectedGroup.items,
        showAirportGroups: false
      });
    }
  },

  /**
   * 返回机场分组列表
   */
  backToAirportGroups: function() {
    this.setData({
      showAirportGroups: true,
      selectedAirportLetter: '',
      currentLetterAirports: []
    });
  },

  /**
   * 章节选择（通信）- 兼容方法
   */
  onChapterSelect: function(e) {
    this.onCommunicationLetterTap(e);
  },

  /**
   * 通信字母分组点击
   */
  onCommunicationLetterTap: function(e) {
    var letter = e.currentTarget.dataset.letter;
    var groups = this.data.communicationGroups;
    var selectedGroup = null;
    
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].letter === letter) {
        selectedGroup = groups[i];
        break;
      }
    }
    
    if (selectedGroup && selectedGroup.items) {
      this.setData({
        selectedChapter: letter,
        selectedChapterName: '字母 ' + letter,
        selectedCommunicationLetter: letter,
        currentChapterCommunications: selectedGroup.items,
        currentLetterCommunications: selectedGroup.items,
        showCommunicationGroups: false
      });
    }
  },

  /**
   * 返回通信分组列表
   */
  backToCommunicationGroups: function() {
    this.setData({
      showCommunicationGroups: true,
      selectedChapter: '',
      selectedChapterName: '',
      selectedCommunicationLetter: '',
      currentChapterCommunications: [],
      currentLetterCommunications: []
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
  },

  /**
   * 处理有效性过滤变更
   */
  onValidityFilterChange: function(e) {
    var filter = e.currentTarget.dataset.filter;
    this.setData({ validityFilter: filter });
    
    // 执行过滤
    this.filterNormativeDocuments();
  },

  /**
   * 过滤规章文档
   */
  filterNormativeDocuments: function() {
    var self = this;
    var filter = this.data.validityFilter;
    var searchValue = this.data.normativeSearchValue;
    var documents = this.data.normativeDocuments;
    
    // 先根据有效性过滤
    var filtered = documents.filter(function(doc) {
      if (filter === 'all') {
        return true;
      } else if (filter === 'valid') {
        return doc.validity === '有效';
      } else if (filter === 'invalid') {
        return doc.validity !== '有效';
      }
      return true;
    });
    
    // 如果有搜索关键词，再进行搜索过滤
    if (searchValue && searchValue.trim()) {
      var keyword = searchValue.trim().toLowerCase();
      filtered = filtered.filter(function(doc) {
        return (doc.title && doc.title.toLowerCase().indexOf(keyword) !== -1) ||
               (doc.doc_number && doc.doc_number.toLowerCase().indexOf(keyword) !== -1) ||
               (doc.office_unit && doc.office_unit.toLowerCase().indexOf(keyword) !== -1);
      });
    }
    
    // 更新过滤后的数据
    this.setData({
      filteredNormativeDocuments: filtered,
      showNormativeGroups: !searchValue // 搜索时不显示分组
    });
  },

  /**
   * 规章搜索
   */
  onNormativeSearch: function(e) {
    var searchValue = e.detail || '';
    this.setData({ normativeSearchValue: searchValue });
    this.performNormativeSearch(searchValue);
  },

  /**
   * 规章搜索输入变化
   */
  onNormativeSearchChange: function(e) {
    var searchValue = e.detail;
    this.setData({ normativeSearchValue: searchValue });
    this.performNormativeSearch(searchValue);
  },

  /**
   * 清除规章搜索
   */
  onNormativeSearchClear: function() {
    this.setData({
      normativeSearchValue: '',
      showNormativeGroups: true
    });
    this.filterNormativeDocuments();
  },

  /**
   * 执行规章搜索
   */
  performNormativeSearch: function(searchValue) {
    var self = this;
    var trimmedValue = (searchValue || this.data.normativeSearchValue || '').trim();
    
    if (!trimmedValue) {
      this.filterNormativeDocuments();
      return;
    }
    
    // 检查是否需要扣费（避免重复扣费）
    var shouldCharge = trimmedValue.length >= 2 && trimmedValue !== this.data.lastChargedNormative;
    
    if (shouldCharge) {
      // 规章搜索需要消费1积分
      pointsManagerUtil.consumePoints('normative-search', '规章搜索: ' + trimmedValue).then(function(result) {
        if (result.success) {
          // 记录已扣费的搜索词并设置搜索值
          self.setData({ 
            lastChargedNormative: trimmedValue,
            normativeSearchValue: trimmedValue
          });
          
          // 显示积分扣费提示
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 1500
          });
          
          // 执行搜索
          self.filterNormativeDocuments();
        } else {
          // 积分不足，不执行搜索
          console.log('积分不足，无法执行规章搜索');
        }
      }).catch(function(error) {
        console.error('规章搜索积分扣费失败:', error);
        // 扣费失败时仍然执行搜索，先设置搜索值
        self.setData({ normativeSearchValue: trimmedValue });
        self.filterNormativeDocuments();
      });
    } else {
      // 不需要扣费，直接搜索，先设置搜索值
      this.setData({ normativeSearchValue: trimmedValue });
      this.filterNormativeDocuments();
    }
  },

  /**
   * 规章字母分组点击
   */
  onNormativeLetterTap: function(e) {
    var letter = e.currentTarget.dataset.letter;
    var groups = this.data.normativeGroups;
    var selectedGroup = null;
    
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].letter === letter) {
        selectedGroup = groups[i];
        break;
      }
    }
    
    if (selectedGroup && selectedGroup.items) {
      this.setData({
        selectedNormativeLetter: letter,
        currentLetterNormatives: selectedGroup.items,
        showNormativeGroups: false
      });
    }
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));