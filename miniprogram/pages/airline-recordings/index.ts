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

  // 选择地区 - 新增按需加载逻辑
  selectRegion(e: any) {
    const regionId = e.currentTarget.dataset.region;
    const region = this.data.regions.find(r => r.id === regionId);
    
    console.log('🎯 选择地区:', regionId, region);
    
    if (region && region.hasRealRecordings) {
      // 🆕 在导航前先按需加载音频分包
      this.loadAudioPackageAndNavigate(regionId, region);
    } else {
      // 显示即将上线提示
      wx.showToast({
        title: '该地区录音即将上线',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 🆕 按需加载音频分包并导航
  async loadAudioPackageAndNavigate(regionId: string, region: any) {
    try {
      const audioPackageLoader = require('../../utils/audio-package-loader.js');
      
      console.log(`🚀 为 ${region.flag} ${region.name} 开始按需加载音频分包...`);
      
      // 显示加载状态（防止用户重复点击）
      wx.showLoading({
        title: `正在加载${region.name}音频...`,
        mask: true
      });
      
      // 异步加载对应的音频分包
      const loadSuccess = await audioPackageLoader.audioPackageLoader.loadAudioPackageOnDemand(regionId);
      
      // 隐藏加载提示
      wx.hideLoading();
      
      if (loadSuccess) {
        console.log(`✅ ${region.name} 音频分包加载成功，导航到录音分类页面`);
        
        // 分包加载成功，跳转到录音分类页面
        wx.navigateTo({
          url: `/pages/recording-categories/index?regionId=${regionId}&regionName=${encodeURIComponent(region.name)}&regionFlag=${encodeURIComponent(region.flag)}`
        });
      } else {
        console.warn(`⚠️ ${region.name} 音频分包加载失败，但仍然导航（可能使用兜底方案）`);
        
        // 显示友好的错误提示
        wx.showModal({
          title: '分包加载失败',
          content: `${region.flag} ${region.name}的音频分包加载失败。\n\n可能原因：\n• 网络连接不稳定\n• 首次加载需要时间\n\n是否继续尝试进入？`,
          confirmText: '继续尝试',
          cancelText: '稍后再试',
          success: (res) => {
            if (res.confirm) {
              // 用户选择继续，仍然导航
              wx.navigateTo({
                url: `/pages/recording-categories/index?regionId=${regionId}&regionName=${encodeURIComponent(region.name)}&regionFlag=${encodeURIComponent(region.flag)}`
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('❌ 按需加载音频分包时发生错误:', error);
      
      // 隐藏加载提示
      wx.hideLoading();
      
      // 出现异常时显示详细错误信息
      wx.showModal({
        title: '加载错误',
        content: `${region.flag} ${region.name}音频资源加载遇到问题。\n\n错误信息：${error.message || '未知错误'}\n\n是否继续尝试进入？`,
        confirmText: '继续尝试',
        cancelText: '稍后再试',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: `/pages/recording-categories/index?regionId=${regionId}&regionName=${encodeURIComponent(region.name)}&regionFlag=${encodeURIComponent(region.flag)}`
            });
          }
        }
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