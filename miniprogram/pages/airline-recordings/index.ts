// 航线录音地区选择页面
Page({
  data: {
    continents: [],
    groupedRegions: [],
    regions: []
  },

  onLoad() {
    this.initializeData();
    this.initializePreloadedPackages();
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
      
      // 使用后备数据 - 完整的13个地区配置
      const fallbackData = [
        {
          id: 'asia',
          name: '亚洲',
          icon: '🌏',
          color: '#3B82F6',
          description: '亚洲地区机场陆空通话录音',
          totalCount: 160,
          regionCount: 7,
          regions: [
            { id: 'japan', name: '日本', flag: '🇯🇵', description: '成田机场真实陆空通话录音', count: 24, hasRealRecordings: true },
            { id: 'philippines', name: '菲律宾', flag: '🇵🇭', description: '马尼拉机场真实陆空通话录音', count: 27, hasRealRecordings: true },
            { id: 'korea', name: '韩国', flag: '🇰🇷', description: '仁川机场真实陆空通话录音', count: 19, hasRealRecordings: true },
            { id: 'singapore', name: '新加坡', flag: '🇸🇬', description: '樟宜机场真实陆空通话录音', count: 8, hasRealRecordings: true },
            { id: 'thailand', name: '泰国', flag: '🇹🇭', description: '曼谷机场真实陆空通话录音', count: 22, hasRealRecordings: true },
            { id: 'srilanka', name: '斯里兰卡', flag: '🇱🇰', description: '科伦坡机场真实陆空通话录音', count: 22, hasRealRecordings: true },
            { id: 'uae', name: '阿联酋', flag: '🇦🇪', description: '迪拜机场真实陆空通话录音', count: 38, hasRealRecordings: true }
          ]
        },
        {
          id: 'europe',
          name: '欧洲',
          icon: '🌍',
          color: '#10B981',
          description: '欧洲地区机场陆空通话录音',
          totalCount: 99,
          regionCount: 4,
          regions: [
            { id: 'france', name: '法国', flag: '🇫🇷', description: '戴高乐机场真实陆空通话录音', count: 19, hasRealRecordings: true },
            { id: 'russia', name: '俄罗斯', flag: '🇷🇺', description: '莫斯科机场真实陆空通话录音', count: 23, hasRealRecordings: true },
            { id: 'turkey', name: '土耳其', flag: '🇹🇷', description: '伊斯坦布尔机场真实陆空通话录音', count: 28, hasRealRecordings: true },
            { id: 'italy', name: '意大利', flag: '🇮🇹', description: '罗马菲乌米奇诺机场真实陆空通话录音', count: 29, hasRealRecordings: true }
          ]
        },
        {
          id: 'america',
          name: '美洲',
          icon: '🌎',
          color: '#F59E0B',
          description: '美洲地区机场陆空通话录音',
          totalCount: 52,
          regionCount: 1,
          regions: [
            { id: 'usa', name: '美国', flag: '🇺🇸', description: '旧金山机场真实陆空通话录音', count: 52, hasRealRecordings: true }
          ]
        },
        {
          id: 'oceania',
          name: '大洋洲',
          icon: '🏝️',
          color: '#8B5CF6',
          description: '大洋洲地区机场陆空通话录音',
          totalCount: 20,
          regionCount: 1,
          regions: [
            { id: 'australia', name: '澳大利亚', flag: '🇦🇺', description: '悉尼机场真实陆空通话录音', count: 20, hasRealRecordings: true }
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

  // 🆕 初始化预加载分包检查
  initializePreloadedPackages() {
    try {
      // 获取音频预加载引导实例
      const AudioPreloadGuide = require('../../utils/audio-preload-guide.js');
      this.audioPreloadGuide = new AudioPreloadGuide();
      
      console.log('🎯 音频预加载引导初始化完成');
    } catch (error) {
      console.error('❌ 初始化音频预加载引导失败:', error);
    }
  },

  // 🆕 检查分包是否已预加载
  async isPackageLoaded(regionId) {
    try {
      if (this.audioPreloadGuide) {
        return await this.audioPreloadGuide.checkPackagePreloaded(regionId);
      }
      return false;
    } catch (error) {
      console.error('❌ 检查分包预加载状态失败:', error);
      return false;
    }
  },

  // 🆕 显示预加载引导对话框
  async showPreloadGuideDialog(regionId) {
    try {
      if (this.audioPreloadGuide) {
        console.log('🎯 显示预加载引导对话框 for regionId:', regionId);
        return await this.audioPreloadGuide.showPreloadGuideDialog(regionId);
      }
      return false;
    } catch (error) {
      console.error('❌ 显示预加载引导对话框失败:', error);
      return false;
    }
  },

  // 选择地区 - 优化预加载检查逻辑
  async selectRegion(e: any) {
    const regionId = e.currentTarget.dataset.region;
    const region = this.data.regions.find(r => r.id === regionId);
    
    console.log('🎯 选择地区:', regionId, region);
    
    if (region && region.hasRealRecordings) {
      // 🆕 先检查分包是否已预加载
      console.log('🔍 检查音频分包预加载状态...');
      const isPreloaded = await this.isPackageLoaded(regionId);
      
      if (isPreloaded) {
        console.log('✅ 音频分包已预加载，直接导航');
        // 分包已预加载，直接导航
        wx.navigateTo({
          url: `/pages/recording-categories/index?regionId=${regionId}&regionName=${encodeURIComponent(region.name)}&regionFlag=${encodeURIComponent(region.flag)}`
        });
      } else {
        console.log('⚠️ 音频分包尚未预加载，显示引导对话框');
        // 分包未预加载，显示引导对话框
        const userAccepted = await this.showPreloadGuideDialog(regionId);
        
        if (!userAccepted) {
          // 用户拒绝跳转，尝试按需加载
          console.log('🚀 用户拒绝引导，尝试按需加载...');
          this.loadAudioPackageAndNavigate(regionId, region);
        }
        // 如果用户接受引导，音频预加载引导会自动处理跳转
      }
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
      // 获取或创建音频分包加载器实例
      let audioPackageLoader = getApp().globalData.audioPackageLoader;
      if (!audioPackageLoader) {
        console.log('🔧 全局音频分包加载器未初始化，创建本地实例...');
        const AudioPackageLoader = require('../../utils/audio-package-loader.js');
        audioPackageLoader = new AudioPackageLoader();
        // 保存到全局以供后续使用
        getApp().globalData.audioPackageLoader = audioPackageLoader;
      }
      
      console.log(`🚀 为 ${region.flag} ${region.name} 开始按需加载音频分包...`);
      
      // 显示加载状态（防止用户重复点击）
      wx.showLoading({
        title: `正在加载${region.name}音频...`,
        mask: true
      });
      
      // 异步加载对应的音频分包
      const loadSuccess = await audioPackageLoader.loadAudioPackageOnDemand(regionId);
      
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