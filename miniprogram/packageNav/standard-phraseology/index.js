// 标准通信用语页面 - 基于体检标准页面设计模式
var BasePage = require('../../utils/base-page.js');
var AppConfig = require('../../utils/app-config.js');
const phraseologyModule = require('../phraseology.js');

var pageConfig = {
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 搜索相关
    searchKeyword: '',
    searchPlaceholder: '搜索通信用语、词汇或英文短句...',

    // 分类相关
    activeTab: 'all',
    // all: 全部；phraseology: 通话；vocab_routine: 日常词汇；vocab_emergency: 特情词汇；vocab_icao900: ICAO 900句
    categories: ['all', 'phraseology', 'vocab_routine', 'vocab_emergency', 'vocab_icao900'],
    categoryList: [],

    // 数据相关
    phraseologyList: [],
    filteredPhraseology: [],

    // 分页相关
    displayData: [], // 当前显示的数据
    pageSize: 20, // 每页显示20条
    currentPage: 0, // 当前页码（从0开始）
    hasMore: true, // 是否还有更多数据
    isLoading: false, // 是否正在加载

    // 弹窗相关
    showDetailPopup: false,
    selectedPhrase: null
  },

  customOnLoad: function(options) {
    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    if (options && options.scope) {
      let scope = options.scope;

      // 兼容旧入口：scope=vocabulary 视为默认日常词汇
      if (scope === 'vocabulary') {
        scope = 'vocab_routine';
      }

      if (
        scope === 'all' ||
        scope === 'phraseology' ||
        scope === 'vocab_routine' ||
        scope === 'vocab_emergency' ||
        scope === 'vocab_icao900'
      ) {
        this.setData({ activeTab: scope });
      }
    }
    this.initializeData();
  },

  customOnShow: function() {
    // 页面显示时的处理逻辑
  },

  // 初始化数据
  initializeData() {
    const self = this;
    try {
      const phraseList = [];
      
      // 获取phraseology数据
      const phraseologyData = phraseologyModule.phraseology || phraseologyModule;
      
      if (!phraseologyData || typeof phraseologyData !== 'object') {
        wx.showToast({
          title: '数据加载失败',
          icon: 'error'
        });
        return;
      }
      
      // 遍历phraseology数据，转换为列表格式
      Object.keys(phraseologyData).forEach(category => {
        Object.keys(phraseologyData[category]).forEach(situationKey => {
          const phrases = phraseologyData[category][situationKey];
          phrases.forEach((phrase, index) => {
            phraseList.push({
              id: `${category}_${situationKey}_${index}`,
              sourceType: 'phraseology',
              category: category,
              situation: situationKey,
              situation_cn: phrase.situation_cn,
              phrase_en: phrase.phrase_en,
              phrase_cn: phrase.phrase_cn,
              speaker: phrase.speaker || 'ATC',
              speakerClass: (phrase.speaker || 'ATC').replace(/\s+/g, '').replace(/\//g, ''),
              searchText: `${phrase.situation_cn} ${phrase.phrase_en} ${phrase.phrase_cn} ${category} ${situationKey}`.toLowerCase()
            });
          });
        });
      });

      // 异步加载民航英语词汇数据（跨分包，必须使用带回调的 require）
      self.loadVocabularyData(phraseList);
      
    } catch (error) {
      console.error('❌ 标准通信用语数据初始化失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'error'
      });
    }
  },

  // 异步加载民航英语词汇数据（来自 packageA）
  loadVocabularyData(basePhraseList) {
    const self = this;
    const vocabularyList = [];
    let pending = 3; // 3 个异步加载：日常 / 应急 / ICAO 900
    let routineCount = 0;
    let emergencyCount = 0;
    let icaoCount = 0;

    function done() {
      pending--;
      if (pending > 0) {
        return;
      }

      const allItems = basePhraseList.concat(vocabularyList);
      const phraseCount = basePhraseList.length;

      const categoryList = [
        { title: '全部', name: 'all', count: allItems.length },
        { title: '通话', name: 'phraseology', count: phraseCount },
        { title: '日常', name: 'vocab_routine', count: routineCount },
        { title: '特情', name: 'vocab_emergency', count: emergencyCount },
        { title: '900句', name: 'vocab_icao900', count: icaoCount }
      ];

      self.setData({
        phraseologyList: allItems,
        filteredPhraseology: allItems,
        categoryList: categoryList
      });

      // 根据当前范围和搜索关键词应用过滤
      self.filterPhraseology();
    }

    // 日常词汇
    require('../../packageA/routineGlossary.js',
      function(mod) {
        try {
          const routineData =
            mod &&
            mod.routineGlossary &&
            mod.routineGlossary.glossary
              ? mod.routineGlossary.glossary
              : [];

          routineData.forEach(function(group, groupIndex) {
            if (group.terms && Array.isArray(group.terms)) {
              group.terms.forEach(function(term, index) {
                vocabularyList.push({
                  id: 'routine_' + groupIndex + '_' + index,
                  sourceType: 'vocabulary',
                  vocabType: 'routine',
                  category: '日常词汇',
                  situation: group.name,
                  situation_cn: group.name,
                  phrase_en: term.english,
                  phrase_cn: term.chinese,
                  speaker: '词汇',
                  speakerClass: 'Vocabulary',
                  searchText: (group.name + ' ' + (term.english || '') + ' ' + (term.chinese || '') + ' 日常 词汇 routine vocabulary').toLowerCase()
                });
                routineCount++;
              });
            }
          });
        } catch (e) {
          console.warn('❌ 日常词汇数据初始化失败:', e);
        }
        done();
      },
      function(err) {
        console.warn('❌ 日常词汇数据加载失败:', err);
        done();
      }
    );

    // 应急特情词汇
    require('../../packageA/emergencyGlossary.js',
      function(mod) {
        try {
          const emergencyData =
            mod &&
            mod.emergencyGlossary &&
            mod.emergencyGlossary.glossary
              ? mod.emergencyGlossary.glossary
              : [];

          emergencyData.forEach(function(group, groupIndex) {
            if (group.terms && Array.isArray(group.terms)) {
              group.terms.forEach(function(term, index) {
                vocabularyList.push({
                  id: 'emergency_' + groupIndex + '_' + index,
                  sourceType: 'vocabulary',
                  vocabType: 'emergency',
                  category: '应急特情',
                  situation: group.name,
                  situation_cn: group.name,
                  phrase_en: term.english,
                  phrase_cn: term.chinese,
                  speaker: '词汇',
                  speakerClass: 'Vocabulary',
                  searchText: (group.name + ' ' + (term.english || '') + ' ' + (term.chinese || '') + ' 应急 特情 emergency vocabulary').toLowerCase()
                });
                emergencyCount++;
              });
            }
          });
        } catch (e) {
          console.warn('❌ 应急词汇数据初始化失败:', e);
        }
        done();
      },
      function(err) {
        console.warn('❌ 应急词汇数据加载失败:', err);
        done();
      }
    );

    // ICAO 900句
    require('../../packageA/icao900.js',
      function(mod) {
        try {
          const icaoData = mod && mod.chapters ? mod.chapters : [];

          icaoData.forEach(function(chapter, chapterIndex) {
            if (chapter.sentences && Array.isArray(chapter.sentences)) {
              chapter.sentences.forEach(function(sentence, index) {
                vocabularyList.push({
                  id: 'icao900_' + chapterIndex + '_' + (sentence.id || index),
                  sourceType: 'vocabulary',
                  vocabType: 'icao900',
                  category: 'ICAO 900句',
                  situation: chapter.name,
                  situation_cn: chapter.name,
                  phrase_en: sentence.english,
                  phrase_cn: sentence.chinese,
                  speaker: '词汇',
                  speakerClass: 'Vocabulary',
                  searchText: (chapter.name + ' ' + (sentence.english || '') + ' ' + (sentence.chinese || '') + ' icao 900').toLowerCase()
                });
                icaoCount++;
              });
            }
          });
        } catch (e) {
          console.warn('❌ ICAO 900句数据初始化失败:', e);
        }
        done();
      },
      function(err) {
        console.warn('❌ ICAO 900句数据加载失败:', err);
        done();
      }
    );
  },

  // 标签页切换
  onTabChange(event) {
    const activeTab = event.currentTarget.dataset.name || event.detail.name;
    this.setData({ activeTab });
    this.filterPhraseology();
  },

  // 搜索功能
  onSearchChange(event) {
    const keyword = event.detail.value || event.detail;
    this.setData({ searchKeyword: keyword });
    this.filterPhraseology();
  },

  onSearchClear() {
    this.setData({ searchKeyword: '' });
    this.filterPhraseology();
  },

  // 高亮关键字
  highlightKeyword(text, keyword) {
    if (!keyword || !text) return text;

    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  // 过滤通信用语
  filterPhraseology() {
    const { phraseologyList, activeTab, searchKeyword } = this.data;
    let filtered = phraseologyList;

    // 按范围过滤（全部 / 通话规范 / 词汇子分类）
    if (activeTab === 'phraseology') {
      filtered = filtered.filter(item => item.sourceType === 'phraseology');
    } else if (activeTab === 'vocabulary') {
      // 兼容旧值：视为全部词汇
      filtered = filtered.filter(item => item.sourceType === 'vocabulary');
    } else if (activeTab === 'vocab_routine') {
      filtered = filtered.filter(item => item.sourceType === 'vocabulary' && item.vocabType === 'routine');
    } else if (activeTab === 'vocab_emergency') {
      filtered = filtered.filter(item => item.sourceType === 'vocabulary' && item.vocabType === 'emergency');
    } else if (activeTab === 'vocab_icao900') {
      filtered = filtered.filter(item => item.sourceType === 'vocabulary' && item.vocabType === 'icao900');
    }

    // 按关键词过滤
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(item =>
        item.searchText && item.searchText.indexOf(keyword) !== -1
      );

      // 为搜索结果添加高亮
      filtered = filtered.map(item => ({
        ...item,
        situation_cn_highlighted: this.highlightKeyword(item.situation_cn, searchKeyword),
        phrase_en_highlighted: this.highlightKeyword(item.phrase_en, searchKeyword),
        phrase_cn_highlighted: this.highlightKeyword(item.phrase_cn, searchKeyword),
        situation_highlighted: this.highlightKeyword(item.situation, searchKeyword)
      }));
    } else {
      // 没有搜索关键词时，清除高亮字段
      filtered = filtered.map(item => ({
        ...item,
        situation_cn_highlighted: null,
        phrase_en_highlighted: null,
        phrase_cn_highlighted: null,
        situation_highlighted: null
      }));
    }

    this.setData({
      filteredPhraseology: filtered,
      currentPage: 0,
      hasMore: true
    });
    
    // 重新加载第一页数据
    this.loadPageData(true);
  },

  // 加载分页数据
  loadPageData(isReset) {
    const filteredPhraseology = this.data.filteredPhraseology;
    const pageSize = this.data.pageSize;
    const currentPage = isReset ? 0 : this.data.currentPage;
    
    // 计算要显示的数据
    const startIndex = 0;
    const endIndex = (currentPage + 1) * pageSize;
    const newDisplayData = filteredPhraseology.slice(startIndex, endIndex);
    
    // 检查是否还有更多数据
    const hasMore = endIndex < filteredPhraseology.length;
    
    this.setData({
      displayData: newDisplayData,
      currentPage: currentPage,
      hasMore: hasMore,
      isLoading: false
    });
  },

  // 加载更多数据
  loadMore() {
    // 防止重复加载
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }
    
    this.setData({
      isLoading: true
    });
    
    // 模拟加载延时，提升用户体验
    setTimeout(() => {
      const nextPage = this.data.currentPage + 1;
      this.setData({
        currentPage: nextPage
      });
      this.loadPageData(false);
    }, 300);
  },

  // 显示详情
  showPhraseDetail(event) {
    const index = event.currentTarget.dataset.index;
    const phrase = this.data.displayData[index];

    // 确保详情弹窗中也显示高亮内容
    const { searchKeyword } = this.data;
    let selectedPhrase = { ...phrase };

    if (searchKeyword) {
      selectedPhrase = {
        ...selectedPhrase,
        situation_cn_highlighted: this.highlightKeyword(phrase.situation_cn, searchKeyword),
        phrase_en_highlighted: this.highlightKeyword(phrase.phrase_en, searchKeyword),
        phrase_cn_highlighted: this.highlightKeyword(phrase.phrase_cn, searchKeyword),
        situation_highlighted: this.highlightKeyword(phrase.situation, searchKeyword)
      };
    }

    this.setData({
      selectedPhrase: selectedPhrase,
      showDetailPopup: true
    });
  },

  // 关闭详情弹窗
  closeDetailPopup() {
    this.setData({
      showDetailPopup: false,
      selectedPhrase: null
    });
  },

  openCommunicationRules() {
    wx.navigateTo({
      url: '/packageNav/communication-rules/index',
      fail: function(err) {
        console.error('跳转通信技术页面失败', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 广告加载成功
  onAdLoad: function() {
    console.log('[StandardPhraseology] Banner ad loaded successfully');
  },

  // 广告加载失败
  onAdError: function(err) {
    console.warn('[StandardPhraseology] Banner ad load failed:', err);
    // 广告失败不影响页面功能，仅记录日志
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));