// 通信翻译页面
var BasePage = require('../utils/base-page.js');
var AppConfig = require('../utils/app-config.js');

var pageConfig = {
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,
    
    // 标签页配置
    tabList: [
      {
        name: 'all',
        title: '全部',
        icon: '📱',
        count: 0
      },
      {
        name: 'routine',
        title: '日常',
        icon: '✈️',
        count: 0
      },
      {
        name: 'emergency',
        title: '应急',
        icon: '🚨',
        count: 0
      },
      {
        name: 'icao900',
        title: '900句',
        icon: '📻',
        count: 0
      }
    ],
    activeTab: 'all',

    // 搜索相关
    searchValue: '',
    searchPlaceholder: '搜索中文或英文内容...',

    // 数据相关
    originalData: [], // 原始数据
    displayData: [], // 当前显示的数据
    filteredAllData: [], // 搜索后的全部数据
    emergencyData: [], // 应急特情数据
    icaoData: [], // ICAO 900句数据
    routineData: [], // 日常词汇数据
    icaoChapters: [], // ICAO章节列表数据
    emergencyCategories: [], // 应急特情分类列表数据
    routineCategories: [], // 日常词汇分类列表数据
    
    // 视图模式控制
    viewMode: 'chapterList', // 'chapterList' | 'chapterDetail' | 'categoryList' | 'categoryDetail' | 'search'
    selectedChapter: null, // 当前选中的章节
    selectedCategory: null, // 当前选中的应急特情分类
    
    // 分页相关
    pageSize: 20,
    hasMore: false,
    isLoading: false,
    totalCount: 0,
    
    // 详情弹窗
    showDetailPopup: false,
    selectedItem: null
  },
  
  customOnLoad: function(options) {
    // 读取分包页面广告开关状态（分包页面使用subPackageAdEnabled）
    this.setData({
      nativeAdEnabled: AppConfig.ad.subPackageAdEnabled || false
    });
    this.loadData();
  },
  
  // 加载数据
  loadData: function() {
    var self = this;

    try {
      // 加载应急特情数据
      require('./emergencyGlossary.js', function(emergencyModule) {
        var emergencyData = self.processEmergencyData(emergencyModule);

        // 加载ICAO 900句数据
        require('./icao900.js', function(icaoModule) {
          var icaoData = self.processIcaoData(icaoModule);

          // 加载日常词汇数据
          require('./routineGlossary.js', function(routineModule) {
            var routineData = self.processRoutineData(routineModule);

            // 合并数据
            var allData = emergencyData.concat(icaoData).concat(routineData);

            self.setData({
              originalData: allData,
              emergencyData: emergencyData,
              icaoData: icaoData,
              routineData: routineData,
              totalCount: allData.length,
              'tabList[0].count': allData.length, // 全部数量
              'tabList[1].count': routineData.length, // 日常词汇
              'tabList[2].count': emergencyData.length, // 应急特情
              'tabList[3].count': icaoData.length // ICAO
            });

            self.filterData();

          }, function(error) {
            console.error('日常词汇数据加载失败:', error);
            self.handleError(error, '日常词汇数据加载失败');
          });

        }, function(error) {
          console.error('ICAO数据加载失败:', error);
          self.handleError(error, 'ICAO数据加载失败');
        });

      }, function(error) {
        console.error('应急特情数据加载失败:', error);
        self.handleError(error, '应急特情数据加载失败');
      });

    } catch (error) {
      console.error('数据加载异常:', error);
      this.handleError(error, '数据加载失败');
    }
  },
  
  // 处理应急特情数据
  processEmergencyData: function(emergencyModule) {
    var processedData = [];
    var categoriesData = [];
    
    // 正确访问数据源：emergencyModule.emergencyGlossary.glossary
    var emergencyGlossary = emergencyModule.emergencyGlossary;
    
    if (emergencyGlossary && emergencyGlossary.glossary) {
      emergencyGlossary.glossary.forEach(function(category, categoryIndex) {
        // 保存分类信息
        categoriesData.push({
          id: 'emergency_category_' + categoryIndex,
          name: category.name,
          index: categoryIndex,
          termsCount: category.terms ? category.terms.length : 0
        });
        
        if (category.terms && Array.isArray(category.terms)) {
          category.terms.forEach(function(term, termIndex) {
            processedData.push({
              id: 'emergency_' + categoryIndex + '_' + termIndex,
              type: 'emergency',
              category: category.name || '应急特情',
              chinese: term.chinese || '',
              english: term.english || '',
              source: '应急特情词汇',
              categoryIndex: categoryIndex,
              categoryName: category.name,
              isEmergency: true
            });
          });
        }
      });
    }
    
    // 将分类数据保存到页面data中
    this.setData({
      emergencyCategories: categoriesData
    });
    
    return processedData;
  },
  
  // 处理ICAO 900句数据
  processIcaoData: function(icaoModule) {
    var processedData = [];
    var chaptersData = [];
    
    if (icaoModule && icaoModule.chapters) {
      icaoModule.chapters.forEach(function(chapter, chapterIndex) {
        // 保存章节信息
        chaptersData.push({
          id: 'chapter_' + chapterIndex,
          name: chapter.name,
          index: chapterIndex,
          sentenceCount: chapter.sentences ? chapter.sentences.length : 0
        });
        
        // 处理章节下的句子
        if (chapter.sentences) {
          chapter.sentences.forEach(function(sentence, sentenceIndex) {
            processedData.push({
              id: 'icao_' + chapterIndex + '_' + sentenceIndex,
              type: 'icao900',
              category: chapter.name || 'ICAO标准句',
              chinese: sentence.chinese || '',
              english: sentence.english || '',
              source: 'ICAO 900句',
              chapterIndex: chapterIndex,
              chapterName: chapter.name,
              isEmergency: false
            });
          });
        }
      });
    }
    
    // 将章节数据保存到页面data中
    this.setData({
      icaoChapters: chaptersData
    });

    return processedData;
  },

  // 处理日常词汇数据
  processRoutineData: function(routineModule) {
    var processedData = [];
    var categoriesData = [];

    // 正确访问数据源：routineModule.routineGlossary.glossary
    var routineGlossary = routineModule.routineGlossary;

    if (routineGlossary && routineGlossary.glossary) {
      routineGlossary.glossary.forEach(function(category, categoryIndex) {
        // 保存分类信息
        categoriesData.push({
          id: 'routine_category_' + categoryIndex,
          name: category.name,
          index: categoryIndex,
          termsCount: category.terms ? category.terms.length : 0
        });

        if (category.terms && Array.isArray(category.terms)) {
          category.terms.forEach(function(term, termIndex) {
            processedData.push({
              id: 'routine_' + categoryIndex + '_' + termIndex,
              type: 'routine',
              category: category.name || '日常词汇',
              chinese: term.chinese || '',
              english: term.english || '',
              source: '日常运行词汇',
              categoryIndex: categoryIndex,
              categoryName: category.name,
              isEmergency: false
            });
          });
        }
      });
    }

    // 将分类数据保存到页面data中
    this.setData({
      routineCategories: categoriesData
    });

    return processedData;
  },

  // 切换标签页
  onCustomTabChange: function(e) {
    var tab = e.currentTarget.dataset.tab;

    var viewMode;
    if (tab === 'emergency' || tab === 'routine') {
      viewMode = 'categoryList'; // 应急特情和日常词汇显示分类列表
    } else if (tab === 'all' || tab === 'icao900') {
      viewMode = 'chapterList'; // ICAO显示章节列表
    } else {
      viewMode = 'list';
    }

    this.setData({
      activeTab: tab,
      searchValue: '',
      viewMode: viewMode,
      selectedChapter: null,
      selectedCategory: null
    });

    this.filterData();
  },
  
  // 搜索功能
  onSearchChange: function(e) {
    var searchValue = e.detail.value || e.detail;
    var activeTab = this.data.activeTab;
    var viewMode;

    if (searchValue) {
      viewMode = 'search';
    } else {
      if (activeTab === 'emergency' || activeTab === 'routine') {
        viewMode = 'categoryList';
      } else if (activeTab === 'all' || activeTab === 'icao900') {
        viewMode = 'chapterList';
      } else {
        viewMode = 'list';
      }
    }

    this.setData({
      searchValue: searchValue,
      viewMode: viewMode
    });
    this.filterData();
  },

  onSearchClear: function() {
    var activeTab = this.data.activeTab;
    var viewMode;

    if (activeTab === 'emergency' || activeTab === 'routine') {
      viewMode = 'categoryList';
    } else if (activeTab === 'all' || activeTab === 'icao900') {
      viewMode = 'chapterList';
    } else {
      viewMode = 'list';
    }

    this.setData({
      searchValue: '',
      viewMode: viewMode
    });
    this.filterData();
  },
  
  // 过滤数据
  filterData: function() {
    var activeTab = this.data.activeTab;
    var searchValue = (this.data.searchValue || '').toLowerCase().trim();
    var viewMode = this.data.viewMode;
    var displayData = [];
    var filteredData = [];
    
    
    if (viewMode === 'search' && searchValue) {
      // 搜索模式：根据标签页搜索对应数据源
      var sourceData = [];
      switch (activeTab) {
        case 'emergency':
          sourceData = this.data.emergencyData;
          break;
        case 'icao900':
          sourceData = this.data.icaoData;
          break;
        case 'routine':
          sourceData = this.data.routineData;
          break;
        case 'all':
        default:
          sourceData = this.data.originalData; // 全部数据（包含ICAO + 应急特情 + 日常词汇）
          break;
      }

      filteredData = sourceData.filter(function(item) {
        return (item.chinese && item.chinese.toLowerCase().includes(searchValue)) ||
               (item.english && item.english.toLowerCase().includes(searchValue)) ||
               (item.category && item.category.toLowerCase().includes(searchValue));
      });

      displayData = filteredData.slice(0, this.data.pageSize);

    } else if (viewMode === 'chapterList') {
      // 章节列表模式：显示ICAO章节
      displayData = this.data.icaoChapters;
      filteredData = this.data.icaoChapters;

    } else if (viewMode === 'categoryList') {
      // 分类列表模式：根据activeTab显示应急特情或日常词汇分类
      if (activeTab === 'emergency') {
        displayData = this.data.emergencyCategories;
        filteredData = this.data.emergencyCategories;
      } else if (activeTab === 'routine') {
        displayData = this.data.routineCategories;
        filteredData = this.data.routineCategories;
      }

    } else if (viewMode === 'chapterDetail') {
      // 章节详情模式：显示选中章节的句子
      var selectedChapter = this.data.selectedChapter;
      if (selectedChapter !== null) {
        filteredData = this.data.icaoData.filter(function(item) {
          return item.chapterIndex === selectedChapter;
        });
        displayData = filteredData.slice(0, this.data.pageSize);
      }

    } else if (viewMode === 'categoryDetail') {
      // 分类详情模式：根据activeTab显示对应分类的词汇
      var selectedCategory = this.data.selectedCategory;
      if (selectedCategory !== null) {
        if (activeTab === 'emergency') {
          filteredData = this.data.emergencyData.filter(function(item) {
            return item.categoryIndex === selectedCategory;
          });
        } else if (activeTab === 'routine') {
          filteredData = this.data.routineData.filter(function(item) {
            return item.categoryIndex === selectedCategory;
          });
        }
        displayData = filteredData.slice(0, this.data.pageSize);
      }
    }
    
    this.setData({
      filteredAllData: filteredData,
      displayData: displayData,
      hasMore: filteredData.length > displayData.length,
      isLoading: false
    });
  },
  
  // 加载更多
  loadMore: function() {
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }
    
    this.setData({
      isLoading: true
    });
    
    var currentLength = this.data.displayData.length;
    var newData = this.data.filteredAllData.slice(currentLength, currentLength + this.data.pageSize);
    
    setTimeout(() => {
      this.setData({
        displayData: this.data.displayData.concat(newData),
        hasMore: this.data.displayData.length + newData.length < this.data.filteredAllData.length,
        isLoading: false
      });
    }, 300);
  },
  
  // 显示详情
  showItemDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayData[index];
    
    if (item) {
      this.setData({
        selectedItem: item,
        showDetailPopup: true
      });
    }
  },
  
  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedItem: null
    });
  },
  
  // 选择章节
  selectChapter: function(e) {
    var chapterIndex = e.currentTarget.dataset.index;
    var chapter = this.data.icaoChapters[chapterIndex];
    
    
    this.setData({
      selectedChapter: chapter.index,
      viewMode: 'chapterDetail'
    });
    
    this.filterData();
  },
  
  // 返回章节列表
  backToChapterList: function() {
    this.setData({
      selectedChapter: null,
      viewMode: 'chapterList'
    });
    
    this.filterData();
  },
  
  // 选择应急特情分类
  selectCategory: function(e) {
    var categoryIndex = e.currentTarget.dataset.index;
    var category = this.data.emergencyCategories[categoryIndex];
    
    
    this.setData({
      selectedCategory: category.index,
      viewMode: 'categoryDetail'
    });
    
    this.filterData();
  },
  
  // 返回分类列表
  backToCategoryList: function() {
    this.setData({
      selectedCategory: null,
      viewMode: 'categoryList'
    });

    this.filterData();
  },

  // 广告加载成功
  onAdLoad: function() {
    console.log('[PackageA] Banner ad loaded successfully');
  },

  // 广告加载失败
  onAdError: function(err) {
    console.warn('[PackageA] Banner ad load failed:', err);
    // 广告失败不影响页面功能，仅记录日志
  }
};

Page(BasePage.createPage(pageConfig));