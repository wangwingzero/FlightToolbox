// 航线录音地区选择页面
Page({
  data: {
    isDarkMode: false,
    continents: [],
    groupedRegions: [],
    regions: []
  },

  onLoad() {
    this.initializeData();
  },

  // 初始化数据
  initializeData() {
    this.loadRecordingConfig();
  },

  // 加载录音配置数据
  loadRecordingConfig() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      // 这里应该从 utils/audio-config.js 或其他地方加载数据
      // 临时使用硬编码数据进行演示
      const tempData = {
        continents: [
          { id: 'asia', name: '亚洲', icon: '🌏', color: '#3B82F6', description: '亚洲地区航线', regionCount: 2 },
          { id: 'europe', name: '欧洲', icon: '🌍', color: '#10B981', description: '欧洲地区航线', regionCount: 1 },
          { id: 'america', name: '美洲', icon: '🌎', color: '#F59E0B', description: '美洲地区航线', regionCount: 1 },
          { id: 'oceania', name: '大洋洲', icon: '🏝️', color: '#06B6D4', description: '大洋洲地区航线', regionCount: 1 },
          { id: 'africa', name: '非洲', icon: '🌍', color: '#8B5CF6', description: '非洲地区航线', regionCount: 1 }
        ],
        regions: [
          { id: 'japan', name: '日本', flag: '🇯🇵', continentId: 'asia', hasRealRecordings: true, count: 45, description: '东京、大阪等主要机场' },
          { id: 'philippines', name: '菲律宾', flag: '🇵🇭', continentId: 'asia', hasRealRecordings: true, count: 32, description: '马尼拉等机场' },
          { id: 'germany', name: '德国', flag: '🇩🇪', continentId: 'europe', hasRealRecordings: false, count: 0, description: '法兰克福等机场' },
          { id: 'usa', name: '美国', flag: '🇺🇸', continentId: 'america', hasRealRecordings: false, count: 0, description: '纽约、洛杉矶等机场' },
          { id: 'australia', name: '澳大利亚', flag: '🇦🇺', continentId: 'oceania', hasRealRecordings: false, count: 0, description: '悉尼、墨尔本等机场' },
          { id: 'south-africa', name: '南非', flag: '🇿🇦', continentId: 'africa', hasRealRecordings: false, count: 0, description: '约翰内斯堡等机场' }
        ]
      };

      // 按大洲分组地区数据
      const groupedRegions = tempData.continents.map(continent => ({
        ...continent,
        regions: tempData.regions.filter(region => region.continentId === continent.id)
      }));

      this.setData({
        continents: tempData.continents,
        regions: tempData.regions,
        groupedRegions: groupedRegions
      });

      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      console.error('❌ 加载录音配置失败:', error);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
  },

  // 选择地区
  selectRegion(e: any) {
    const regionId = e.currentTarget.dataset.region;
    const region = this.data.regions.find(r => r.id === regionId);
    
    if (region && region.hasRealRecordings) {
      // 跳转到录音分类页面
      wx.navigateTo({
        url: `/pages/recording-categories/index?regionId=${regionId}&regionName=${encodeURIComponent(region.name)}&regionFlag=${encodeURIComponent(region.flag)}`
      });
    }
  },

  // 显示即将上线提示
  showComingSoon(e: any) {
    const regionId = e.currentTarget.dataset.region;
    const region = this.data.regions.find(r => r.id === regionId);
    
    wx.showModal({
      title: '敬请期待',
      content: `${region.flag} ${region.name}的真实陆空通话录音正在收集整理中，敬请期待！`,
      showCancel: false,
      confirmText: '知道了'
    });
  }
});