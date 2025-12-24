// 录音列表页面
const AppConfig = require('../../utils/app-config.js');

Page({
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 无广告状态
    isAdFree: false,

    regionId: '',
    regionName: '',
    regionFlag: '',
    categoryId: '',
    categoryName: '',
    allClips: [],
    learnedClips: [],
    loadedPackages: [] // 已加载的分包名称数组
  },

  onLoad(options: any) {
    const {
      regionId = '',
      regionName = '',
      regionFlag = '',
      categoryId = '',
      categoryName = '',
      allClipsJson = '[]'
    } = options;

    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: `${decodeURIComponent(regionFlag)} ${decodeURIComponent(regionName)} - ${decodeURIComponent(categoryName)}`
    });

    try {
      const allClips = JSON.parse(decodeURIComponent(allClipsJson));
      
      this.setData({
        regionId: regionId,
        regionName: decodeURIComponent(regionName),
        regionFlag: decodeURIComponent(regionFlag),
        categoryId: categoryId,
        categoryName: decodeURIComponent(categoryName),
        allClips: allClips
      });

      // 初始化预加载分包状态
      this.initializePreloadedPackages();

      // 加载学习状态
      this.loadLearnedClips();
    } catch (error) {
      console.error('❌ 解析参数失败:', error);
      wx.showToast({
        title: '页面数据错误',
        icon: 'none'
      });
    }
  },

  // 初始化预加载分包状态
  initializePreloadedPackages() {
    // 🔄 调整预加载策略：录音片段页面仅预加载斯里兰卡音频分包（避免2MB限制）
    const preloadedPackages = ["packageSrilanka"]; // 斯里兰卡音频分包
    
    preloadedPackages.forEach(packageName => {
      if (!this.data.loadedPackages.includes(packageName)) {
        this.data.loadedPackages.push(packageName);
      }
    });
    
    this.setData({ loadedPackages: this.data.loadedPackages });
  },

  // 检查分包是否已加载（调整预加载模式）
  isPackageLoaded(packageName: string): boolean {
    // 🔄 调整预加载模式：录音片段页面仅预加载斯里兰卡
    const preloadedPackages = ["packageSrilanka"]; // 根据app.json预加载规则配置
    return preloadedPackages.includes(packageName) || this.data.loadedPackages.includes(packageName);
  },

  onShow() {
    // 检查无广告状态
    this.checkAdFreeStatus();

    // 页面显示时刷新学习状态
    this.refreshLearningStatus();
  },

  // 加载用户学习状态
  loadLearnedClips() {
    try {
      const learnedClips = wx.getStorageSync('learnedClips') || [];
      
      // 更新所有录音的学习状态
      const updatedClips = this.data.allClips.map(clip => ({
        ...clip,
        isLearned: learnedClips.includes(this.generateClipId(clip, this.data.regionId))
      }));
      
      this.setData({
        learnedClips: learnedClips,
        allClips: updatedClips
      });
    } catch (error) {
      console.error('❌ 加载学习状态失败:', error);
    }
  },

  // 刷新学习状态
  refreshLearningStatus() {
    this.loadLearnedClips();
  },

  // 生成录音唯一ID
  generateClipId(clip: any, regionId: string) {
    return `${regionId}_${clip.mp3_file || clip.label}_${clip.full_transcript.slice(0, 20)}`;
  },

  // 保存学习状态
  saveLearnedClips() {
    try {
      wx.setStorageSync('learnedClips', this.data.learnedClips);
    } catch (error) {
      console.error('❌ 保存学习状态失败:', error);
    }
  },

  // 切换学习状态
  toggleLearnedStatus(e: any) {
    e.stopPropagation(); // 阻止冒泡到selectClip
    
    const index = parseInt(e.currentTarget.dataset.index);
    const clip = this.data.allClips[index];
    
    if (!clip) return;

    const clipId = this.generateClipId(clip, this.data.regionId);
    const learnedClips = [...this.data.learnedClips];
    const clipIndex = learnedClips.indexOf(clipId);
    
    let isLearned = false;
    if (clipIndex > -1) {
      learnedClips.splice(clipIndex, 1);
    } else {
      learnedClips.push(clipId);
      isLearned = true;
    }

    // 更新录音状态
    const updatedClips = [...this.data.allClips];
    updatedClips[index] = {
      ...clip,
      isLearned: isLearned
    };

    this.setData({
      learnedClips: learnedClips,
      allClips: updatedClips
    });

    this.saveLearnedClips();
    
    wx.showToast({
      title: isLearned ? '已标记为学会' : '已标记为未学会',
      icon: 'success',
      duration: 1500
    });
  },

  // 选择录音
  selectClip(e: any) {
    const index = parseInt(e.currentTarget.dataset.index);
    
    // 跳转到音频播放页面
    wx.navigateTo({
      url: `/pages/audio-player/index?regionId=${this.data.regionId}&regionName=${encodeURIComponent(this.data.regionName)}&categoryId=${this.data.categoryId}&categoryName=${encodeURIComponent(this.data.categoryName)}&clipIndex=${index}&allClipsJson=${encodeURIComponent(JSON.stringify(this.data.allClips))}`
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