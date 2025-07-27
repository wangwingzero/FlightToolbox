// 标准通信用语页面 - 基于体检标准页面设计模式
const phraseologyModule = require('../../data/phraseology.js');

Page({
  data: {
    // 搜索相关
    searchKeyword: '',
    searchPlaceholder: '搜索通信用语、情况或英文短语...',
    
    // 分类相关
    activeTab: '全部',
    categories: ['全部', '通用', '区域管制服务', '进近管制服务', '机场管制', 'ATS监视服务', '告警', '地勤_飞行机组'],
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

  onLoad() {
    console.log('🎯 标准通信用语页面加载');
    this.initializeData();
  },

  onShow() {
    // 页面显示时的处理逻辑
  },

  // 初始化数据
  initializeData() {
    try {
      const phraseList = [];
      
      // 获取phraseology数据
      console.log('📦 phraseologyModule:', phraseologyModule);
      const phraseologyData = phraseologyModule.phraseology || phraseologyModule;
      console.log('📊 phraseologyData:', phraseologyData);
      console.log('📊 phraseologyData类型:', typeof phraseologyData);
      
      if (!phraseologyData || typeof phraseologyData !== 'object') {
        console.error('❌ phraseology数据格式错误:', phraseologyData);
        wx.showToast({
          title: '数据加载失败',
          icon: 'error'
        });
        return;
      }
      
      console.log('✅ 数据验证通过，分类数量:', Object.keys(phraseologyData).length);
      
      // 遍历phraseology数据，转换为列表格式
      Object.keys(phraseologyData).forEach(category => {
        Object.keys(phraseologyData[category]).forEach(situationKey => {
          const phrases = phraseologyData[category][situationKey];
          phrases.forEach((phrase, index) => {
            phraseList.push({
              id: `${category}_${situationKey}_${index}`,
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

      // 统计各分类数量并创建分类列表
      const categoryMap = {
        '全部': { title: '全部', name: '全部', count: phraseList.length },
        '通用': { title: '通用', name: '通用', count: 0 },
        '区域管制服务': { title: '区域管制', name: '区域管制服务', count: 0 },
        '进近管制服务': { title: '进近管制', name: '进近管制服务', count: 0 },
        '机场管制': { title: '机场管制', name: '机场管制', count: 0 },
        'ATS监视服务': { title: '监视服务', name: 'ATS监视服务', count: 0 },
        '告警': { title: '告警', name: '告警', count: 0 },
        '地勤_飞行机组': { title: '地勤', name: '地勤_飞行机组', count: 0 }
      };

      phraseList.forEach(item => {
        if (categoryMap[item.category]) {
          categoryMap[item.category].count++;
        }
      });

      const categoryList = Object.values(categoryMap);

      this.setData({
        phraseologyList: phraseList,
        filteredPhraseology: phraseList,
        categoryList: categoryList
      });
      
      // 初始加载第一页数据
      this.loadPageData(true);
      
      console.log(`✅ 标准通信用语数据加载成功，共 ${phraseList.length} 条记录`);
      console.log('📊 分类统计:', categoryList);
    } catch (error) {
      console.error('❌ 标准通信用语数据初始化失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'error'
      });
    }
  },


  // 标签页切换
  onTabChange(event) {
    const activeTab = event.currentTarget.dataset.name || event.detail.name;
    console.log('🎯 分类切换:', activeTab);
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

    // 按分类过滤
    if (activeTab !== '全部') {
      filtered = filtered.filter(item => item.category === activeTab);
    }

    // 按关键词过滤
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(item =>
        item.searchText.includes(keyword)
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
    
    console.log('📄 分页加载:', {
      当前页: currentPage,
      显示条数: newDisplayData.length,
      总条数: filteredPhraseology.length,
      还有更多: hasMore
    });
    
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
    
    console.log('📖 加载更多数据...');
    
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

  // 广告事件处理
  adLoad() {
    console.log('横幅广告加载成功');
  },
  
  adError(err) {
    console.error('横幅广告加载失败', err);
  },
  
  adClose() {
    console.log('横幅广告关闭');
  }
});