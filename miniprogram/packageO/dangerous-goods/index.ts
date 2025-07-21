// 危险品查询页面
// 工具管理器将在需要时动态引入

Page({
  data: {
    activeTab: 'regulations',
    
    // 分类列表
    categoryList: [
      { name: 'regulations', title: '携带规定', count: 0 },
      { name: 'emergency', title: '应急响应', count: 0 },
      { name: 'hidden', title: '隐含危险品', count: 0 }
    ],
    
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
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载危险品携带规定数据
  loadRegulationsData() {
    console.log('🔄 开始加载危险品规定数据...');
    
    // 使用异步require进行跨分包数据加载
    (require as any)('../../packageG/dangerousGoodsRegulations.js', (regulationsModule: any) => {
      try {
        const rawData = regulationsModule.dangerousGoodsRegulations || [];
        // 处理描述文本截断
        const data = rawData.map((item: any) => ({
          ...item,
          shortDescription: item.description && item.description.length > 80 
            ? item.description.substring(0, 80) + '...' 
            : (item.description || '暂无描述')
        }));
        console.log('✅ 成功从packageG加载危险品规定数据:', data.length, '条');
        this.setData({ 
          regulationsData: data,
          filteredRegulations: data
        });
        this.updateCategoryCount();
      } catch (error) {
        console.error('❌ 处理危险品规定数据失败:', error);
        this.setData({ 
          regulationsData: [],
          filteredRegulations: []
        });
      }
    }, (error: any) => {
      console.error('❌ 从packageG加载危险品规定数据失败:', error);
      // 兜底方案：使用默认数据
      const defaultData = [
        {
          item_name: "示例危险品",
          description: "数据加载失败，请检查网络连接"
        }
      ];
      this.setData({ 
        regulationsData: defaultData,
        filteredRegulations: defaultData
      });
    });
  },

  // 加载应急响应程序数据
  loadEmergencyData() {
    console.log('🔄 开始加载应急响应数据...');
    
    // 使用异步require进行跨分包数据加载
    (require as any)('../../packageG/emergencyResponseProcedures.js', (emergencyModule: any) => {
      try {
        const data = emergencyModule.emergencyResponseProcedures || [];
        console.log('✅ 成功从packageG加载应急响应数据:', data.length, '条');
        this.setData({ 
          emergencyData: data,
          filteredEmergency: data
        });
        this.updateCategoryCount();
      } catch (error) {
        console.error('❌ 处理应急响应数据失败:', error);
        this.setData({ 
          emergencyData: [],
          filteredEmergency: []
        });
      }
    }, (error: any) => {
      console.error('❌ 从packageG加载应急响应数据失败:', error);
      // 兜底方案：使用默认数据
      const defaultData = [
        {
          code: "示例代码",
          inherent_hazard: "数据加载失败",
          aircraft_hazard: "请检查网络连接",
          occupant_hazard: "或联系开发者"
        }
      ];
      this.setData({ 
        emergencyData: defaultData,
        filteredEmergency: defaultData
      });
      this.updateCategoryCount();
    });
  },

  // 加载隐含危险品数据
  loadHiddenGoodsData() {
    console.log('🔄 开始加载隐含危险品数据...');
    
    // 使用异步require进行跨分包数据加载
    (require as any)('../../packageG/hiddenDangerousGoods.js', (hiddenModule: any) => {
      try {
        const data = hiddenModule.hiddenDangerousGoods || [];
        console.log('✅ 成功从packageG加载隐含危险品数据:', data.length, '条');
        this.setData({ 
          hiddenGoodsData: data,
          filteredHidden: data
        });
      } catch (error) {
        console.error('❌ 处理隐含危险品数据失败:', error);
        this.setData({ 
          hiddenGoodsData: [],
          filteredHidden: []
        });
      }
    }, (error: any) => {
      console.error('❌ 从packageG加载隐含危险品数据失败:', error);
      // 兜底方案：使用默认数据
      const defaultData = [
        {
          category_zh: "示例类别",
          category_en: "Example Category",
          description: "数据加载失败，请检查网络连接"
        }
      ];
      this.setData({ 
        hiddenGoodsData: defaultData,
        filteredHidden: defaultData
      });
    });
  },

  // 切换分类菜单
  onTabChange(event) {
    const activeTab = event.currentTarget.dataset.name;
    this.setData({ activeTab });
    
    // 切换标签时清空搜索
    this.setData({ searchValue: '' });
    this.clearSearch();
  },

  // 搜索处理
  onSearch(event) {
    const searchValue = event.detail || this.data.searchValue;
    this.performSearch(searchValue);
  },

  onSearchChange(event) {
    const searchValue = event.detail;
    this.setData({ searchValue });
    this.performSearch(searchValue);
  },

  onSearchClear() {
    this.setData({ searchValue: '' });
    this.clearSearch();
  },

  // 执行搜索
  performSearch(searchValue) {
    if (!searchValue.trim()) {
      this.clearSearch();
      return;
    }

    const searchLower = searchValue.toLowerCase();

    // 搜索携带规定
    const filteredRegulations = this.data.regulationsData.filter((item) => 
      item.item_name && item.item_name.toLowerCase().includes(searchLower) ||
      item.description && item.description.toLowerCase().includes(searchLower)
    ).map((item) => ({
      ...item,
      shortDescription: item.description && item.description.length > 80 
        ? item.description.substring(0, 80) + '...' 
        : (item.description || '暂无描述')
    }));

    // 搜索应急响应
    const filteredEmergency = this.data.emergencyData.filter((item) => 
      item.inherent_hazard && item.inherent_hazard.toLowerCase().includes(searchLower) ||
      item.aircraft_hazard && item.aircraft_hazard.toLowerCase().includes(searchLower) ||
      item.occupant_hazard && item.occupant_hazard.toLowerCase().includes(searchLower)
    );

    // 搜索隐含危险品
    const filteredHidden = this.data.hiddenGoodsData.filter((item) => 
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
  viewRegulationDetail(event) {
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

  viewEmergencyDetail(event) {
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

  viewHiddenDetail(event) {
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
  onCollapseChange(event) {
    this.setData({
      activeCollapse: event.detail
    });
  },

  // 保留原有的方法作为备用（已废弃）
  showRegulationDetail(item) {
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

  showEmergencyDetail(item) {
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

  showHiddenDetail(item) {
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

  

  }); 