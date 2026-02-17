// 通信规范页面
const { communicationDataManager } = require('../../utils/communication-manager.js');
const WalkaroundPreloadGuide = require('../../utils/walkaround-preload-guide.js');
const AppConfig = require('../../utils/app-config.js');

Page({
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 无广告状态
    isAdFree: false,

    // 通信规则数据
    rulesData: null,

    // 音频分包加载状态
    loadedPackages: []
  },

  onLoad() {
    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '通信技术要点'
    });

    // 标记绕机检查区域21-24的图片分包为已预加载（本页面自动预加载walkaroundImages6Package）
    try {
      const preloadGuide = new WalkaroundPreloadGuide()
      preloadGuide.markPackagePreloaded('21-24')
      console.log('✅ 已标记绕机检查区域21-24的图片分包为已预加载')
    } catch (error) {
      console.error('❌ 标记绕机检查图片分包失败:', error)
    }

    // 初始化预加载分包状态
    this.initializePreloadedPackages();

    // 加载通信规则数据
    this.loadCommunicationRules();
  },

  onShow() {
    // 检查无广告状态
    this.checkAdFreeStatus();

    // 页面显示时的操作
  },

  // 初始化预加载分包状态
  initializePreloadedPackages() {
    // 🔄 预加载模式：标记预加载的分包为已加载
    const preloadedPackages = ["packageSrilanka"]; // 1.3MB，预加载到此页面
    
    preloadedPackages.forEach(packageName => {
      if (!this.data.loadedPackages.includes(packageName)) {
        this.data.loadedPackages.push(packageName);
      }
    });
    
    this.setData({ loadedPackages: this.data.loadedPackages });
  },

  // 检查分包是否已加载（预加载模式）
  isPackageLoaded(packageName: string): boolean {
    // 🔄 预加载模式：检查预加载分包列表和实际加载状态
    const preloadedPackages = ["packageSrilanka"]; // 根据app.json预加载规则配置
    return preloadedPackages.includes(packageName) || this.data.loadedPackages.includes(packageName);
  },

  // 加载通信规则数据
  loadCommunicationRules() {
    try {
      // 从主包数据管理器获取数据
      const communicationRulesData = communicationDataManager.getCommunicationRules();
      
      // 检查数据是否存在
      if (!communicationRulesData || !communicationRulesData.aviationPhraseology) {
        throw new Error('通信规则数据不存在或格式错误');
      }

      const rulesData = communicationRulesData.aviationPhraseology;

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
      url: `/packageNav/communication-rules-detail/index?type=${type}&title=${encodeURIComponent(categoryTitle)}&data=${encodeURIComponent(JSON.stringify(categoryData))}`
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
      title: '通信技术 - 专业通信规范详解',
      path: '/packageNav/communication-rules/index'
    };
  },

  // 广告事件处理
  adLoad() {
    console.log('原生模板广告加载成功');
  },

  adError(err: any) {
    console.error('原生模板广告加载失败', err);
  },

  adClose() {
    console.log('原生模板广告关闭');
  },

  // 检查无广告状态
  checkAdFreeStatus: function() {
    const adFreeManager = require('../../utils/ad-free-manager.js');
    try {
      const isAdFree = adFreeManager.isAdFreeToday();
      this.setData({ isAdFree });
      console.log('📅 无广告状态:', isAdFree ? '今日无广告' : '显示广告');
    } catch (error) {
      console.error('❌ 检查无广告状态失败:', error);
    }
  }

});