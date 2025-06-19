// 危险品查询页面
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
    activeCollapse: [] as string[]
  },

  onLoad() {
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
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载危险品携带规定数据
  loadRegulationsData() {
    try {
      require('../../packageG/dangerousGoodsRegulations.js', (res: any) => {
        console.log('✅ 成功从packageG加载危险品规定数据');
        const data = res.dangerousGoodsRegulations || [];
        this.setData({ 
          regulationsData: data,
          filteredRegulations: data
        });
      }, (err: any) => {
        console.error('❌ 从packageG加载危险品规定数据失败:', err);
      });
    } catch (error) {
      console.error('加载危险品规定数据失败:', error);
    }
  },

  // 加载应急响应程序数据
  loadEmergencyData() {
    try {
      require('../../packageG/emergencyResponseProcedures.js', (res: any) => {
        console.log('✅ 成功从packageG加载应急响应数据');
        const data = res.emergencyResponseProcedures || [];
        this.setData({ 
          emergencyData: data,
          filteredEmergency: data
        });
      }, (err: any) => {
        console.error('❌ 从packageG加载应急响应数据失败:', err);
      });
    } catch (error) {
      console.error('加载应急响应数据失败:', error);
    }
  },

  // 加载隐含危险品数据
  loadHiddenGoodsData() {
    try {
      require('../../packageG/hiddenDangerousGoods.js', (res: any) => {
        console.log('✅ 成功从packageG加载隐含危险品数据');
        const data = res.hiddenDangerousGoods || [];
        this.setData({ 
          hiddenGoodsData: data,
          filteredHidden: data
        });
      }, (err: any) => {
        console.error('❌ 从packageG加载隐含危险品数据失败:', err);
      });
    } catch (error) {
      console.error('加载隐含危险品数据失败:', error);
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
  }
}); 