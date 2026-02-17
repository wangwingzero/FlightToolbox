// 航线录音地区选择页面
const AppConfig = require('../../utils/app-config.js');

Page({
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 无广告状态
    isAdFree: false,

    continents: [],
    groupedRegions: [],
    regions: [],
    searchKeyword: '',
    displayedRegions: [],
    filteredRegionsCount: 0,
    expandedContinents: {} as Record<string, boolean> // 记录每个洲的展开状态
  },

  // 搜索防抖定时器
  searchTimer: null as any,

  onLoad() {
    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

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

      // 初始化所有洲为折叠状态
      const expandedContinents: Record<string, boolean> = {};
      groupedRegions.forEach((continent: any) => {
        expandedContinents[continent.id] = false;
      });

      this.setData({
        groupedRegions: groupedRegions,
        regions: allRegions,
        displayedRegions: groupedRegions,
        expandedContinents: expandedContinents
      });

      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      console.error('❌ 加载录音配置失败:', error);
      
      // 使用后备数据 - 完整的15个地区配置（v2.8.1最新）
      const fallbackData = [
        {
          id: 'asia',
          name: '亚洲',
          icon: '🌏',
          color: '#0f766e',
          description: '亚洲地区机场陆空通话录音',
          totalCount: 282,
          regionCount: 8,
          regions: [
            { id: 'korea', name: '韩国', flag: '🇰🇷', airport: '仁川机场', description: '仁川机场', count: 85, hasRealRecordings: true },
            { id: 'japan', name: '日本', flag: '🇯🇵', airport: '成田机场', description: '成田机场', count: 67, hasRealRecordings: true },
            { id: 'singapore', name: '新加坡', flag: '🇸🇬', airport: '樟宜机场', description: '樟宜机场', count: 42, hasRealRecordings: true },
            { id: 'uae', name: '阿联酋', flag: '🇦🇪', airport: '迪拜机场', description: '迪拜机场', count: 38, hasRealRecordings: true },
            { id: 'philippines', name: '菲律宾', flag: '🇵🇭', airport: '马尼拉机场', description: '马尼拉机场', count: 27, hasRealRecordings: true },
            { id: 'thailand', name: '泰国', flag: '🇹🇭', airport: '曼谷机场', description: '曼谷机场', count: 27, hasRealRecordings: true },
            { id: 'srilanka', name: '斯里兰卡', flag: '🇱🇰', airport: '科伦坡机场', description: '科伦坡机场', count: 22, hasRealRecordings: true },
            { id: 'chinese-taipei', name: '中国台北', flag: '🇨🇳', airport: '松山机场', description: '松山机场', count: 17, hasRealRecordings: true }
          ]
        },
        {
          id: 'europe',
          name: '欧洲',
          icon: '🌍',
          color: '#10B981',
          description: '欧洲地区机场陆空通话录音',
          totalCount: 135,
          regionCount: 5,
          regions: [
            { id: 'uk', name: '英国', flag: '🇬🇧', airport: '伦敦希斯罗机场', description: '伦敦希斯罗', count: 36, hasRealRecordings: true },
            { id: 'italy', name: '意大利', flag: '🇮🇹', airport: '罗马菲乌米奇诺机场', description: '罗马菲乌米奇诺', count: 29, hasRealRecordings: true },
            { id: 'turkey', name: '土耳其', flag: '🇹🇷', airport: '伊斯坦布尔机场', description: '伊斯坦布尔', count: 28, hasRealRecordings: true },
            { id: 'russia', name: '俄罗斯', flag: '🇷🇺', airport: '莫斯科机场', description: '莫斯科机场', count: 23, hasRealRecordings: true },
            { id: 'france', name: '法国', flag: '🇫🇷', airport: '戴高乐机场', description: '戴高乐机场', count: 19, hasRealRecordings: true }
          ]
        },
        {
          id: 'america',
          name: '美洲',
          icon: '🌎',
          color: '#F59E0B',
          description: '美洲地区机场陆空通话录音',
          totalCount: 53,
          regionCount: 1,
          regions: [
            { id: 'usa', name: '美国', flag: '🇺🇸', airport: '旧金山机场', description: '洛杉矶/纽约', count: 53, hasRealRecordings: true }
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
            { id: 'australia', name: '澳大利亚', flag: '🇦🇺', airport: '悉尼机场', description: '悉尼机场', count: 20, hasRealRecordings: true }
          ]
        }
      ];
      
      // 提取所有地区数据以保持兼容性
      const allRegions = [];
      fallbackData.forEach(continent => {
        allRegions.push(...continent.regions);
      });

      // 初始化所有洲为折叠状态
      const expandedContinents: Record<string, boolean> = {};
      fallbackData.forEach((continent: any) => {
        expandedContinents[continent.id] = false;
      });

      this.setData({
        groupedRegions: fallbackData,
        regions: allRegions,
        displayedRegions: fallbackData,
        expandedContinents: expandedContinents
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
      const AudioPreloadGuide = require('../audio-preload-guide.js');
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
          url: `/packageNav/recording-categories/index?regionId=${regionId}&regionName=${encodeURIComponent(region.name)}&regionFlag=${encodeURIComponent(region.flag)}`
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
        const AudioPackageLoader = require('../audio-package-loader.js');
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
          url: `/packageNav/recording-categories/index?regionId=${regionId}&regionName=${encodeURIComponent(region.name)}&regionFlag=${encodeURIComponent(region.flag)}`
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
                url: `/packageNav/recording-categories/index?regionId=${regionId}&regionName=${encodeURIComponent(region.name)}&regionFlag=${encodeURIComponent(region.flag)}`
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
              url: `/packageNav/recording-categories/index?regionId=${regionId}&regionName=${encodeURIComponent(region.name)}&regionFlag=${encodeURIComponent(region.flag)}`
            });
          }
        }
      });
    }
  },

  // 打开离线下载中心
  openOfflineCenter() {
    wx.navigateTo({
      url: '/packageNav/offline-center/index',
      fail: (error) => {
        console.error('❌ 打开离线中心失败:', error);
        wx.showToast({
          title: '打开离线中心失败',
          icon: 'none'
        });
      }
    });
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

  // 调试方法 - 检查数据结构
  onShow: function() {
    // 检查无广告状态
    this.checkAdFreeStatus();

    console.log('🔍 当前页面数据:', this.data.groupedRegions);
    if (this.data.groupedRegions) {
      this.data.groupedRegions.forEach((continent: any) => {
        console.log(`🌍 大洲: ${continent.name} (${continent.id})`);
      });
    }
  },

  // 🔍 搜索输入处理（防抖优化）
  onSearchInput(e: any) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });

    // 清除之前的定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    // 设置新的防抖定时器（300ms）
    this.searchTimer = setTimeout(() => {
      this.filterRegions(keyword);
    }, 300);
  },

  // 🔍 搜索确认
  onSearchConfirm(e: any) {
    const keyword = e.detail.value.trim();
    this.filterRegions(keyword);
  },

  // 🔍 清除搜索
  clearSearch() {
    this.setData({ 
      searchKeyword: '',
      displayedRegions: this.data.groupedRegions,
      filteredRegionsCount: 0
    });
  },

  // 🔍 过滤地区
  filterRegions(keyword: string) {
    if (!keyword) {
      // 没有搜索词，显示所有地区，恢复折叠状态
      const expandedContinents: Record<string, boolean> = {};
      this.data.groupedRegions.forEach((continent: any) => {
        expandedContinents[continent.id] = false;
      });
      
      this.setData({
        displayedRegions: this.data.groupedRegions,
        filteredRegionsCount: 0,
        expandedContinents: expandedContinents
      });
      return;
    }

    const lowerKeyword = keyword.toLowerCase();
    const filteredGroups: any[] = [];
    let totalCount = 0;
    const expandedContinents: Record<string, boolean> = {};

    // 遍历所有大洲
    this.data.groupedRegions.forEach((continent: any) => {
      const filteredRegions = continent.regions.filter((region: any) => {
        // 搜索国家名称、机场名称、描述
        return region.name.toLowerCase().includes(lowerKeyword) ||
               region.airport.toLowerCase().includes(lowerKeyword) ||
               region.description.toLowerCase().includes(lowerKeyword) ||
               region.flag.includes(keyword);
      });

      if (filteredRegions.length > 0) {
        filteredGroups.push({
          ...continent,
          regions: filteredRegions,
          regionCount: filteredRegions.length
        });
        totalCount += filteredRegions.length;
        // 搜索时自动展开有结果的洲
        expandedContinents[continent.id] = true;
      }
    });

    this.setData({
      displayedRegions: filteredGroups,
      filteredRegionsCount: totalCount,
      expandedContinents: expandedContinents
    });

    // 如果没有搜索结果，显示提示
    if (totalCount === 0) {
      wx.showToast({
        title: '未找到匹配结果',
        icon: 'none',
        duration: 1500
      });
    }
  },

  // 📂 切换洲的展开/折叠状态
  toggleContinent(e: any) {
    const continentId = e.currentTarget.dataset.continentId;
    const currentState = this.data.expandedContinents[continentId] || false;

    this.setData({
      [`expandedContinents.${continentId}`]: !currentState
    });
  },

  // === 无广告状态检查 ===

  /**
   * 检查无广告状态
   */
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
