// 危险品查询页面
// 工具管理器将在需要时动态引入

Page({
  data: {
    activeTab: 'regulations',
    
    // 搜索相关
    searchValue: '',
    
    // 数据列表
    regulationsData: [] as any[],
    emergencyData: [] as any[],
    hiddenGoodsData: [] as any[],
    
    // 搜索结果
    filteredRegulations: [] as any[],
    filteredEmergency: [] as any[],
    filteredHidden: [] as any[],
    
    // 加载状态
    loading: true,
    
    // 详情弹窗相关
    showDetailPopup: false,
    detailType: '', // 'regulation', 'emergency', 'hidden'
    detailData: {} as any,
    activeCollapse: [] as string[],

    // 🎯 基于Context7最佳实践：广告相关数据
    showAd: false,
    adUnitId: ''
  },

  onLoad() {
    // 🎯 基于Context7最佳实践：初始化广告
    this.initAd();
    this.loadDangerousGoodsData();
  },

  // 加载危险品数据
  async loadDangerousGoodsData() {
    this.setData({ loading: true });
    
    try {
      // 异步加载分包数据
      this.loadRegulationsData();
      this.loadEmergencyData();
      this.loadHiddenGoodsData();
    } catch (error) {
      console.error('加载危险品数据失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载危险品携带规定数据
  loadRegulationsData() {
    try {
      console.log('🔄 开始加载危险品规定数据...');
      // 使用同步require避免TypeScript错误
      const regulationsModule = require('../../packageG/dangerousGoodsRegulations.js');
      const data = regulationsModule.dangerousGoodsRegulations || [];
      console.log('✅ 成功加载危险品规定数据:', data.length, '条');
      this.setData({ 
        regulationsData: data,
        filteredRegulations: data
      });
    } catch (error) {
      console.error('❌ 加载危险品规定数据失败:', error);
    }
  },

  // 加载应急响应程序数据
  loadEmergencyData() {
    try {
      console.log('🔄 开始加载应急响应数据...');
      const emergencyModule = require('../../packageG/emergencyResponseProcedures.js');
      const data = emergencyModule.emergencyResponseProcedures || [];
      console.log('✅ 成功加载应急响应数据:', data.length, '条');
      this.setData({ 
        emergencyData: data,
        filteredEmergency: data
      });
    } catch (error) {
      console.error('❌ 加载应急响应数据失败:', error);
    }
  },

  // 加载隐含危险品数据
  loadHiddenGoodsData() {
    try {
      console.log('🔄 开始加载隐含危险品数据...');
      const hiddenModule = require('../../packageG/hiddenDangerousGoods.js');
      const data = hiddenModule.hiddenDangerousGoods || [];
      console.log('✅ 成功加载隐含危险品数据:', data.length, '条');
      this.setData({ 
        hiddenGoodsData: data,
        filteredHidden: data
      });
    } catch (error) {
      console.error('❌ 加载隐含危险品数据失败:', error);
    }
  },

  // 切换标签页
  onTabChange(event: any) {
    const activeTab = event.detail.name;
    this.setData({ activeTab });
    
    // 切换标签时清空搜索
    this.setData({ searchValue: '' });
    this.clearSearch();
  },

  // 搜索处理
  onSearch(event: any) {
    const searchValue = event.detail || this.data.searchValue;
    this.performSearch(searchValue);
  },

  onSearchChange(event: any) {
    const searchValue = event.detail;
    this.setData({ searchValue });
    this.performSearch(searchValue);
  },

  onSearchClear() {
    this.setData({ searchValue: '' });
    this.clearSearch();
  },

  // 执行搜索
  performSearch(searchValue: string) {
    if (!searchValue.trim()) {
      this.clearSearch();
      return;
    }

    const searchLower = searchValue.toLowerCase();

    // 搜索携带规定
    const filteredRegulations = this.data.regulationsData.filter((item: any) => 
      item.item_name && item.item_name.toLowerCase().includes(searchLower) ||
      item.description && item.description.toLowerCase().includes(searchLower)
    );

    // 搜索应急响应
    const filteredEmergency = this.data.emergencyData.filter((item: any) => 
      item.inherent_hazard && item.inherent_hazard.toLowerCase().includes(searchLower) ||
      item.aircraft_hazard && item.aircraft_hazard.toLowerCase().includes(searchLower) ||
      item.occupant_hazard && item.occupant_hazard.toLowerCase().includes(searchLower)
    );

    // 搜索隐含危险品
    const filteredHidden = this.data.hiddenGoodsData.filter((item: any) => 
      item.category_zh && item.category_zh.toLowerCase().includes(searchLower) ||
      item.category_en && item.category_en.toLowerCase().includes(searchLower) ||
      item.description && item.description.toLowerCase().includes(searchLower)
    );

    this.setData({
      filteredRegulations,
      filteredEmergency,
      filteredHidden
    });
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      filteredRegulations: this.data.regulationsData,
      filteredEmergency: this.data.emergencyData,
      filteredHidden: this.data.hiddenGoodsData
    });
  },

  // 查看详情（新的方式）
  viewRegulationDetail(event: any) {
    const item = event.currentTarget.dataset.item;
    this.setData({
      showDetailPopup: true,
      detailType: 'regulation',
      detailData: {
        title: '危险品携带规定',
        ...item
      }
    });
  },

  viewEmergencyDetail(event: any) {
    const item = event.currentTarget.dataset.item;
    this.setData({
      showDetailPopup: true,
      detailType: 'emergency',
      detailData: {
        title: `应急响应程序 ${item.code}`,
        ...item
      }
    });
  },

  viewHiddenDetail(event: any) {
    const item = event.currentTarget.dataset.item;
    this.setData({
      showDetailPopup: true,
      detailType: 'hidden',
      detailData: {
        title: '隐含危险品详情',
        ...item
      }
    });
  },

  // 关闭详情弹窗
  closeDetailPopup() {
    this.setData({ 
      showDetailPopup: false,
      detailType: '',
      detailData: {},
      activeCollapse: []
    });
  },

  // 折叠面板变化
  onCollapseChange(event: any) {
    this.setData({
      activeCollapse: event.detail
    });
  },

  // 保留原有的方法作为备用（已废弃）
  showRegulationDetail(item: any) {
    // 使用新的弹窗方式
    this.setData({
      showDetailPopup: true,
      detailType: 'regulation',
      detailData: {
        title: '危险品携带规定',
        ...item
      }
    });
  },

  showEmergencyDetail(item: any) {
    // 使用新的弹窗方式
    this.setData({
      showDetailPopup: true,
      detailType: 'emergency',
      detailData: {
        title: `应急响应程序 ${item.code}`,
        ...item
      }
    });
  },

  showHiddenDetail(item: any) {
    // 使用新的弹窗方式
    this.setData({
      showDetailPopup: true,
      detailType: 'hidden',
      detailData: {
        title: '隐含危险品详情',
        ...item
      }
    });
  },

  // 🎯 基于Context7最佳实践：广告相关方法
  initAd() {
    try {
      const adManagerUtil = require('../../utils/ad-manager.js');
      const AdManager = adManagerUtil;
      const adManager = new AdManager();
      const adUnit = adManager.getBestAdUnit('list');
      
      console.log('🎯 危险品页面广告初始化:', { adUnit, showAd: !!adUnit });
      
      if (adUnit) {
        this.setData({
          showAd: true,
          adUnitId: adUnit.id
        });
        console.log('✅ 危险品页面广告已启用:', adUnit.id);
      } else {
        // 测试用：强制显示广告
        this.setData({
          showAd: true,
          adUnitId: 'adunit-test-id'
        });
        console.log('⚠️ 使用测试广告ID');
      }
    } catch (error) {
      console.log('❌ 广告初始化失败:', error);
      // 测试用：即使失败也显示广告
      this.setData({
        showAd: true,
        adUnitId: 'adunit-fallback-id'
      });
    }
  },

  onAdLoad() {
    try {
      const adManagerUtil = require('../../utils/ad-manager.js');
      const AdManager = adManagerUtil;
      const adManager = new AdManager();
      adManager.recordAdShown(this.data.adUnitId);
    } catch (error) {
      console.log('广告记录失败:', error);
    }
  },

  onAdError() {
    this.setData({ showAd: false });
  }
}); 