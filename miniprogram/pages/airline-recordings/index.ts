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
      // 从音频配置中加载真实数据
      const audioConfig = require('../../utils/audio-config.js');
      
      if (!audioConfig || !audioConfig.audioConfigManager) {
        throw new Error('音频配置管理器未找到');
      }
      
      const groupedRegions = audioConfig.audioConfigManager.getGroupedRegions();
      console.log('🎵 加载的音频配置数据:', groupedRegions);

      if (!groupedRegions || groupedRegions.length === 0) {
        throw new Error('没有可用的录音数据');
      }

      // 提取所有地区数据以保持兼容性
      const allRegions = [];
      groupedRegions.forEach(continent => {
        allRegions.push(...continent.regions);
      });

      this.setData({
        groupedRegions: groupedRegions,
        regions: allRegions
      });

      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      console.error('❌ 加载录音配置失败:', error);
      
      // 使用后备数据
      const fallbackData = [
        {
          id: 'asia',
          name: '亚洲',
          icon: '🌏',
          color: '#3B82F6',
          description: '亚洲地区机场陆空通话录音',
          totalCount: 78,
          regionCount: 4,
          regions: [
            { id: 'japan', name: '日本', flag: '🇯🇵', description: '成田机场真实陆空通话录音', count: 24, hasRealRecordings: true },
            { id: 'philippines', name: '菲律宾', flag: '🇵🇭', description: '马尼拉机场真实陆空通话录音', count: 27, hasRealRecordings: true },
            { id: 'korea', name: '韩国', flag: '🇰🇷', description: '仁川机场真实陆空通话录音', count: 19, hasRealRecordings: true },
            { id: 'singapore', name: '新加坡', flag: '🇸🇬', description: '樟宜机场真实陆空通话录音', count: 8, hasRealRecordings: true }
          ]
        }
      ];
      
      // 提取所有地区数据以保持兼容性
      const allRegions = [];
      fallbackData.forEach(continent => {
        allRegions.push(...continent.regions);
      });

      this.setData({
        groupedRegions: fallbackData,
        regions: allRegions
      });
      
      wx.showToast({
        title: '使用后备数据',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 选择地区
  selectRegion(e: any) {
    const regionId = e.currentTarget.dataset.region;
    const region = this.data.regions.find(r => r.id === regionId);
    
    console.log('🎯 选择地区:', regionId, region);
    
    if (region && region.hasRealRecordings) {
      // 跳转到录音分类页面
      wx.navigateTo({
        url: `/pages/recording-categories/index?regionId=${regionId}&regionName=${encodeURIComponent(region.name)}&regionFlag=${encodeURIComponent(region.flag)}`
      });
    } else {
      // 显示即将上线提示
      wx.showToast({
        title: '该地区录音即将上线',
        icon: 'none',
        duration: 2000
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