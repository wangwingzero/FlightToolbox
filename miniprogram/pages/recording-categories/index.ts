// 录音分类选择页面
Page({
  data: {
    // 无广告状态
    isAdFree: false,

    regionId: '',
    regionName: '',
    regionFlag: '',
    recordingCategories: [],
    loadedPackages: [] // 已加载的分包名称数组
  },

  onLoad(options: any) {
    const { regionId = '', regionName = '', regionFlag = '' } = options;
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: `${decodeURIComponent(regionFlag)} ${decodeURIComponent(regionName)}`
    });
    
    this.setData({
      regionId: regionId,
      regionName: decodeURIComponent(regionName),
      regionFlag: decodeURIComponent(regionFlag)
    });

    // 初始化预加载分包状态
    this.initializePreloadedPackages();

    this.loadCategories();
  },

  onShow() {
    // 检查无广告状态
    this.checkAdFreeStatus();
  },

  // 初始化预加载分包状态
  initializePreloadedPackages() {
    // 🔄 调整预加载策略：录音分类页面仅预加载俄罗斯音频分包（避免2MB限制）
    const preloadedPackages = ["packageRussia"]; // 俄罗斯音频分包
    
    preloadedPackages.forEach(packageName => {
      if (!this.data.loadedPackages.includes(packageName)) {
        this.data.loadedPackages.push(packageName);
      }
    });
    
    this.setData({ loadedPackages: this.data.loadedPackages });
  },

  // 检查分包是否已加载（调整预加载模式）
  isPackageLoaded(packageName: string): boolean {
    // 🔄 调整预加载模式：录音分类页面仅预加载俄罗斯
    const preloadedPackages = ["packageRussia"]; // 根据app.json预加载规则配置
    return preloadedPackages.includes(packageName) || this.data.loadedPackages.includes(packageName);
  },

  // 加载分类数据
  loadCategories() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      // 从音频配置中加载真实数据
      const audioConfig = require('../../utils/audio-config.js');
      const airport = audioConfig.audioConfigManager.getAirportById(this.data.regionId);
      
      if (!airport || !airport.clips) {
        throw new Error(`未找到${this.data.regionName}的音频数据`);
      }

      // 按类别分组真实录音数据
      const clipsByCategory = {};
      airport.clips.forEach(clip => {
        const category = clip.label || '其他';
        if (!clipsByCategory[category]) {
          clipsByCategory[category] = [];
        }
        clipsByCategory[category].push(clip);
      });

      // 生成分类数据
      const categories = Object.keys(clipsByCategory).map(categoryName => {
        const iconMap = {
          '进近': '🛬',
          '塔台': '🗼', 
          '地面': '🚛',
          '放行': '📋'
        };
        const colorMap = {
          '进近': '#3B82F6',
          '塔台': '#8B5CF6',
          '地面': '#F59E0B', 
          '放行': '#EF4444'
        };

        return {
          id: categoryName,
          name: categoryName,
          icon: iconMap[categoryName] || '🎵',
          color: colorMap[categoryName] || '#6B7280',
          clips: clipsByCategory[categoryName]
        };
      });

      this.setData({
        recordingCategories: categories
      });

      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      console.error('❌ 加载分类数据失败:', error);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
  },


  // 选择分类
  selectCategory(e: any) {
    const categoryId = e.currentTarget.dataset.category;
    const category = this.data.recordingCategories.find(cat => cat.id === categoryId);
    
    if (category) {
      // 跳转到录音列表页面
      wx.navigateTo({
        url: `/pages/recording-clips/index?regionId=${this.data.regionId}&regionName=${encodeURIComponent(this.data.regionName)}&regionFlag=${encodeURIComponent(this.data.regionFlag)}&categoryId=${categoryId}&categoryName=${encodeURIComponent(category.name)}&allClipsJson=${encodeURIComponent(JSON.stringify(category.clips))}`
      });
    }
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