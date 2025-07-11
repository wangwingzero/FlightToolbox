// 通信规范页面
const { communicationDataManager } = require('../../utils/communication-manager.js');

Page({
  data: {
    // 全局主题状态
    isDarkMode: false,
    
    // 通信规则数据
    rulesData: null,
    
    // 音频分包加载状态
    loadedPackages: []
  },

  onLoad() {
    console.log('📖 通信规范页面加载');
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '通信规范'
    });

    // 初始化预加载分包状态
    this.initializePreloadedPackages();
    
    // 检查主题状态
    this.checkThemeStatus();
    
    // 加载通信规则数据
    this.loadCommunicationRules();
  },

  onShow() {
    // 每次显示页面时检查主题状态
    this.checkThemeStatus();
  },

  // 初始化预加载分包状态
  initializePreloadedPackages() {
    // 🔄 预加载模式：标记预加载的分包为已加载
    const preloadedPackages = ["packageRussia"]; // 1.3MB，预加载到此页面
    
    preloadedPackages.forEach(packageName => {
      if (!this.data.loadedPackages.includes(packageName)) {
        this.data.loadedPackages.push(packageName);
      }
    });
    
    this.setData({ loadedPackages: this.data.loadedPackages });
    console.log('✅ communication-rules 已标记预加载分包:', this.data.loadedPackages);
  },

  // 检查分包是否已加载（预加载模式）
  isPackageLoaded(packageName: string): boolean {
    // 🔄 预加载模式：检查预加载分包列表和实际加载状态
    const preloadedPackages = ["packageRussia"]; // 根据app.json预加载规则配置
    return preloadedPackages.includes(packageName) || this.data.loadedPackages.includes(packageName);
  },

  // 检查主题状态
  checkThemeStatus() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
  },

  // 加载通信规则数据
  loadCommunicationRules() {
    try {
      console.log('📊 开始加载通信规则数据...');
      
      // 从主包数据管理器获取数据
      const communicationRulesData = communicationDataManager.getCommunicationRules();
      
      // 检查数据是否存在
      if (!communicationRulesData || !communicationRulesData.aviationPhraseology) {
        throw new Error('通信规则数据不存在或格式错误');
      }

      const rulesData = communicationRulesData.aviationPhraseology;
      console.log('✅ 通信规则数据加载成功:', rulesData);

      this.setData({
        rulesData: rulesData
      });

    } catch (error) {
      console.error('❌ 加载通信规则数据失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },

  // 选择规范分类
  selectRulesCategory(e: any) {
    const type = e.currentTarget.dataset.type;
    
    console.log('🎯 选择规范分类:', type);
    
    if (!this.data.rulesData) {
      wx.showToast({
        title: '数据尚未加载，请稍后',
        icon: 'none'
      });
      return;
    }

    // 获取对应的数据
    const categoryData = this.data.rulesData[type];
    if (!categoryData) {
      wx.showToast({
        title: '该分类数据不存在',
        icon: 'none'
      });
      return;
    }

    // 获取分类标题
    const categoryTitle = this.getCategoryTitle(type);
    
    // 跳转到详情页面
    wx.navigateTo({
      url: `/pages/communication-rules-detail/index?type=${type}&title=${encodeURIComponent(categoryTitle)}&data=${encodeURIComponent(JSON.stringify(categoryData))}`
    });
  },

  // 获取分类标题
  getCategoryTitle(type: string): string {
    const titles: { [key: string]: string } = {
      'phraseologyRequirements': '通话要求',
      'pronunciation': '发音规则',
      'standardPhrases': '标准用语',
      'callSignPhraseology': '呼号用法',
      'weatherPhraseology': '天气报文'
    };
    return titles[type] || '未知分类';
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '陆空通话规范 - 专业通信规范详解',
      path: '/pages/communication-rules/index'
    };
  }
});