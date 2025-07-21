// 标准通信用语页面 - 基于体检标准页面设计
const phraseologyData = require('../../data/phraseology.js');

Page({
  data: {
    // 搜索相关
    searchKeyword: '',
    searchPlaceholder: '搜索通信用语、情景或英文短语...',
    activeTab: '全部',
    
    // 数据相关
    phraseologyList: [],
    filteredPhraseology: [],
    categories: ['全部', '通用', '区域管制服务', '进近管制服务', '机场管制', 'ATS监视服务', '告警', '地勤_飞行机组'],
    
    // UI状态
    showDetailPopup: false,
    selectedPhraseology: null
  },

  onLoad() {
    console.log('标准通信用语页面加载');
    this.initializePhraseologyData();
  },

  onShow() {
    // 页面显示时的处理逻辑
  },

  // 初始化通信用语数据
  initializePhraseologyData() {
    try {
      const phraseologyList = [];
      let id = 1;

      // 遍历所有分类
      Object.keys(phraseologyData.phraseology).forEach(category => {
        const categoryData = phraseologyData.phraseology[category];
        
        // 遍历每个分类下的子项
        Object.keys(categoryData).forEach(subCategory => {
          const phrases = categoryData[subCategory];
          
          phrases.forEach(phrase => {
            phraseologyList.push({
              id: id++,
              category: category,
              subCategory: subCategory,
              situation_cn: phrase.situation_cn,
              phrase_en: phrase.phrase_en,
              phrase_cn: phrase.phrase_cn,
              speaker: phrase.speaker,
              // 用于搜索的组合字段
              searchText: `${phrase.situation_cn} ${phrase.phrase_en} ${phrase.phrase_cn} ${phrase.speaker} ${category} ${subCategory}`.toLowerCase()
            });
          });
        });
      });

      this.setData({
        phraseologyList: phraseologyList,
        filteredPhraseology: phraseologyList
      });

      console.log(`✅ 通信用语数据初始化完成，共 ${phraseologyList.length} 条记录`);
    } catch (error) {
      console.error('❌ 通信用语数据初始化失败:', error);
    }
  },


  // 标签页切换
  onTabChange(event) {
    const activeTab = event.detail.name;
    this.setData({ activeTab });
    this.filterPhraseology();
  },

  // 搜索输入变化
  onSearchChange(event) {
    const searchKeyword = event.detail.value;
    this.setData({ searchKeyword });
    this.filterPhraseology();
  },

  // 清除搜索
  onSearchClear() {
    this.setData({ searchKeyword: '' });
    this.filterPhraseology();
  },

  // 过滤通信用语
  filterPhraseology() {
    const { phraseologyList, activeTab, searchKeyword } = this.data;
    let filtered = phraseologyList;

    // 按分类过滤
    if (activeTab !== '全部') {
      filtered = filtered.filter(item => item.category === activeTab);
    }

    // 按关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.searchText.includes(keyword)
      );
    }

    this.setData({
      filteredPhraseology: filtered
    });
  },

  // 显示详情
  showPhraseologyDetail(event) {
    const index = event.currentTarget.dataset.index;
    const selectedPhraseology = this.data.filteredPhraseology[index];
    
    this.setData({
      selectedPhraseology,
      showDetailPopup: true
    });
  },

  // 关闭详情弹窗
  closeDetailPopup() {
    this.setData({
      showDetailPopup: false,
      selectedPhraseology: null
    });
  },

  // 复制内容
  copyContent(event) {
    const type = event.currentTarget.dataset.type;
    const { selectedPhraseology } = this.data;
    
    if (!selectedPhraseology) return;
    
    let content = '';
    switch (type) {
      case 'english':
        content = selectedPhraseology.phrase_en;
        break;
      case 'chinese':
        content = selectedPhraseology.phrase_cn;
        break;
      case 'all':
        content = `情景：${selectedPhraseology.situation_cn}\n英文：${selectedPhraseology.phrase_en}\n中文：${selectedPhraseology.phrase_cn}\n使用者：${selectedPhraseology.speaker}`;
        break;
    }
    
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '飞行工具箱 - 标准通信用语',
      path: '/pages/phraseology/index'
    };
  }
});