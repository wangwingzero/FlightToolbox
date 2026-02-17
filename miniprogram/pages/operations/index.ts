// 航班运行页面
const BasePage = require('../../utils/base-page.js');
const emergencyAltitudeData = require('../../data/emergency-altitude-data.js');
const AdManager = require('../../utils/ad-manager.js');
const AppConfig = require('../../utils/app-config.js');
const tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');
const adHelper = require('../../utils/ad-helper.js');
const VersionManager = require('../../utils/version-manager.js');
const EnvDetector = require('../../utils/env-detector.js');
const adFreeManager = require('../../utils/ad-free-manager.js');

// TypeScript类型定义

/** ICAO字母表项 */
interface IcaoAlphabetItem {
  letter: string;
  word: string;
  pronunciation: string;
}

/** 录音片段数据 */
interface AudioClip {
  id: string;
  name: string;
  airport?: string;
  category?: string;
  region?: string;
}

/** 录音分类数据 */
interface RecordingCategory {
  id: string;
  name: string;
  icon?: string;
}

/** 地区数据 */
interface RegionData {
  name: string;
  code: string;
  continent?: string;
}

/** 页面配置选项（从URL参数传入） */
interface PageLoadOptions {
  module?: string;
  targetAirport?: string;
  [key: string]: string | undefined;
}

const pageConfig = {
  data: {
    // 🦴 骨架屏状态 - 初始为true，确保100ms内显示骨架屏
    // Requirements: 1.5, 9.1
    pageLoading: true,

    // 插屏广告相关
    interstitialAd: null as WechatMiniprogram.InterstitialAd | null,
    interstitialAdLoaded: false,
    lastInterstitialAdShowTime: 0,

    // 无广告状态
    isAdFree: false,

    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 页面导航状态
    selectedModule: '', // 当前选中的模块: 'airline-recordings', 'communication-rules', 'emergency-altitude'

    // 分包加载状态缓存
    loadedPackages: [] as string[], // 已加载的分包名称数组

    // 航线录音相关数据
    continents: [] as string[],          // 大洲分组数据
    groupedRegions: [] as { continent: string; regions: RegionData[] }[],      // 按大洲分组的地区数据
    regions: [] as RegionData[],
    airports: [] as string[],
    recordingConfig: null as any,
    recordingCategories: [] as RecordingCategory[], // 新增：录音分类数据

    // 录音播放状态
    selectedRegion: '',
    selectedCategory: '', // 新增：选中的录音类型（进近、地面、放行、塔台）
    categoryClips: [] as AudioClip[], // 新增：当前类型的录音列表
    selectedAirport: '',
    filteredAirports: [] as string[],
    currentAirportClips: [] as AudioClip[],
    currentClipIndex: -1, // -1表示未选择任何录音
    currentClip: null as AudioClip | null,
    currentAudioSrc: '',

    // 播放器状态
    isPlaying: false,
    isLooping: false,
    volume: 80,
    showSubtitles: false, // 默认不显示字幕
    subtitleLang: 'cn' as 'en' | 'cn',
    audioContext: null as WechatMiniprogram.InnerAudioContext | null,
    audioProgress: 0,
    // 航线录音快捷播放器文案
    quickPlayerTitle: '随机航线录音',
    quickPlayerSubtitle: '',
    quickPlayerStatus: '点击播放随机已缓存的航线录音',
    quickPlayerLoading: false,
    quickPlayerPlaylist: [] as any[],
    quickPlayerIndex: -1,

    // 学习状态管理
    learnedClips: [] as string[], // 已学会的录音ID列表
    showLearnedNames: false, // 是否显示已学会的录音名称

    // ICAO字母表
    icaoAlphabet: [
      { letter: "A", word: "ALPHA", pronunciation: "AL-FAH" },
      { letter: "B", word: "BRAVO", pronunciation: "BRAH-VOH" },
      { letter: "C", word: "CHARLIE", pronunciation: "CHAR-LEE" },
      { letter: "D", word: "DELTA", pronunciation: "DEL-TAH" },
      { letter: "E", word: "ECHO", pronunciation: "ECK-OH" },
      { letter: "F", word: "FOXTROT", pronunciation: "FOKS-TROT" },
      { letter: "G", word: "GOLF", pronunciation: "GOLF" },
      { letter: "H", word: "HOTEL", pronunciation: "HOH-TEL" },
      { letter: "I", word: "INDIA", pronunciation: "IN-DEE-AH" },
      { letter: "J", word: "JULIET", pronunciation: "JEW-LEE-ETT" },
      { letter: "K", word: "KILO", pronunciation: "KEY-LOH" },
      { letter: "L", word: "LIMA", pronunciation: "LEE-MAH" },
      { letter: "M", word: "MIKE", pronunciation: "MIKE" },
      { letter: "N", word: "NOVEMBER", pronunciation: "NO-VEM-BER" },
      { letter: "O", word: "OSCAR", pronunciation: "OSS-CAH" },
      { letter: "P", word: "PAPA", pronunciation: "PAH-PAH" },
      { letter: "Q", word: "QUEBEC", pronunciation: "KEH-BECK" },
      { letter: "R", word: "ROMEO", pronunciation: "ROW-ME-OH" },
      { letter: "S", word: "SIERRA", pronunciation: "SEE-AIR-RAH" },
      { letter: "T", word: "TANGO", pronunciation: "TANG-GO" },
      { letter: "U", word: "UNIFORM", pronunciation: "YOU-NEE-FORM" },
      { letter: "V", word: "VICTOR", pronunciation: "VIK-TAH" },
      { letter: "W", word: "WHISKEY", pronunciation: "WISS-KEY" },
      { letter: "X", word: "XRAY", pronunciation: "ECKS-RAY" },
      { letter: "Y", word: "YANKEE", pronunciation: "YANG-KEY" },
      { letter: "Z", word: "ZULU", pronunciation: "ZOO-LOO" }
    ] as IcaoAlphabetItem[],

    // 紧急改变高度程序数据
    emergencyData: emergencyAltitudeData,
    selectedEmergencyType: '', // 当前选中的紧急程序类型
    selectedProcedureStep: -1, // 当前选中的步骤（-1表示未选中）
    emergencyStepsExpanded: [] as number[], // 展开的步骤列表

    // 导航状态
    pageInfo: {} as Record<string, any>
  },

  customOnLoad(options: PageLoadOptions) {
    const self = this;
    console.log('🚀 页面加载开始');

    // 🔧 修复：不重复初始化AdManager，使用App中统一初始化的实例
    if (!AdManager.isInitialized) {
      AdManager.init({
        debug: true
      });
    }

    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    // 页面加载时初始化
    this.initializeData();
    // 设置初始导航栏标题
    wx.setNavigationBarTitle({
      title: '通信'
    });

    // 初始化预加载分包状态
    this.initializePreloadedPackages();

    // 🎬 创建插屏广告实例
    this.createInterstitialAd();

    // 🦴 骨架屏：数据准备完成后隐藏骨架屏
    // 使用 nextTick 确保视图更新后再隐藏，实现平滑过渡
    // Requirements: 1.5, 9.1
    wx.nextTick(function() {
      self.setData({ pageLoading: false });
    });

    console.log('✅ 页面加载完成');
  },

  customOnShow() {
    // 处理TabBar页面进入（标记访问+更新小红点）
    tabbarBadgeManager.handlePageEnter('pages/operations/index');

    // 更新广告显示状态
    this.setData({
      isAdFree: adFreeManager.isAdFreeActive()
    });

    // 🎬 显示插屏广告（频率控制）
    this.showInterstitialAdWithControl();

    // 刷新学习状态 - 当从播放页面返回时更新卡片状态
    this.refreshLearningStatus();
  },

  // 初始化数据
  initializeData() {
    this.setData({
      filteredAirports: this.data.airports
    });
    
    // 加载录音数据
    this.loadRecordingConfig();
  },

  // 初始化预加载分包状态
  initializePreloadedPackages() {
    // 🔄 完全分散预加载策略（避免单页面2MB限制）：
    // 主页(others)：日本、新加坡
    // 当前页面：菲律宾、韩国
    // recording-categories页面：俄罗斯、泰国  
    // recording-clips页面：斯里兰卡、土耳其
    // audio-player页面：日本、新加坡、菲律宾（备用）
    // abbreviations页面：澳大利亚
    
    const currentPagePreloaded = ["philippineAudioPackage", "koreaAudioPackage"];
    const currentLoadedPackages = this.data.loadedPackages.slice();
    
    currentPagePreloaded.forEach(function(packageName) {
      if (!currentLoadedPackages.includes(packageName)) {
        currentLoadedPackages.push(packageName);
      }
    });
    
    this.setData({ loadedPackages: currentLoadedPackages });
    console.log('✅ 已标记当前页面预加载分包:', currentLoadedPackages);
    console.log('📋 完全分散预加载策略: 所有音频分包都通过不同页面预加载，无需异步加载');
  },

  // 加载录音配置
  loadRecordingConfig() {
    console.log('🔄 开始加载录音配置...');
    const recordingModule = require('../../utils/audio-config.js');
    if (recordingModule && recordingModule.airlineRecordingsData) {
      const config = recordingModule.airlineRecordingsData;
      const manager = recordingModule.audioConfigManager;
      const groupedRegions = manager.getGroupedRegions();

      // 先设置元数据（大洲、地区、机场框架），clips 稍后异步加载
      this.setData({
        continents: manager.getContinents(),
        groupedRegions: groupedRegions,
        regions: config.regions,
        airports: config.airports,
        recordingConfig: config,
        filteredAirports: config.airports
      });

      console.log('📍 配置了 ' + config.regions.length + ' 个地区，' + config.airports.length + ' 个机场');

      // 异步加载地区录音数据（从 packageRegionData 分包）
      var self = this;
      manager.loadAllRegionClips().then(function() {
        var updatedConfig = manager.getFullConfig();
        self.setData({
          airports: updatedConfig.airports,
          recordingConfig: updatedConfig,
          filteredAirports: updatedConfig.airports
        });

        updatedConfig.airports.forEach(function(airport) {
          console.log('🏢 ' + airport.name + ': ' + airport.clips.length + '个录音');
        });

        // 加载用户学习状态
        self.loadLearnedClips();
      });

    } else {
      console.error('❌ 录音配置数据格式错误');
    }
  },
  
  // 加载用户学习状态
  loadLearnedClips() {
    try {
      const learnedClips = wx.getStorageSync('learnedClips') || [];
      this.setData({
        learnedClips: learnedClips
      });
      console.log('📚 已加载学习状态:', learnedClips);
    } catch (error) {
      console.error('❌ 加载学习状态失败:', error);
    }
  },
  
  // 保存学习状态
  saveLearnedClips() {
    try {
      wx.setStorageSync('learnedClips', this.data.learnedClips);
      console.log('💾 已保存学习状态');
    } catch (error) {
      console.error('❌ 保存学习状态失败:', error);
    }
  },
  
  // 生成录音的唯一ID
  generateClipId(clip, regionId) {
    return regionId + '_' + (clip.mp3_file || clip.label) + '_' + clip.full_transcript.slice(0, 20);
  },
  
  // 检查录音是否已学会
  isClipLearned(clipId) {
    return this.data.learnedClips.includes(clipId);
  },
  
  // 切换录音学习状态
  toggleClipLearned(clipId) {
    const learnedClips = this.data.learnedClips.slice();
    const index = learnedClips.indexOf(clipId);
    
    if (index > -1) {
      // 如果已学会，则移除
      learnedClips.splice(index, 1);
    } else {
      // 如果未学会，则添加
      learnedClips.push(clipId);
    }
    
    this.setData({
      learnedClips: learnedClips
    });
    
    this.saveLearnedClips();
  },
  
  // 切换显示学习名称
  toggleShowLearnedNames(e) {
    const showLearnedNames = e.detail.value;
    this.setData({
      showLearnedNames: showLearnedNames
    });
  },
  
  // 切换录音学习状态（从界面触发）
  toggleLearnedStatus(e) {
    e.stopPropagation(); // 阻止事件冒泡
    const index = e.currentTarget.dataset.index;
    const clip = this.data.categoryClips[index];
    
    if (clip && clip.clipId) {
      // 切换学习状态
      this.toggleClipLearned(clip.clipId);
      
      // 更新categoryClips中的状态
      const updatedClips = this.data.categoryClips.slice();
      updatedClips[index] = Object.assign({}, updatedClips[index], {
        isLearned: !updatedClips[index].isLearned
      });
      
      this.setData({
        categoryClips: updatedClips
      });
      
      // 显示反馈
      wx.showToast({
        title: updatedClips[index].isLearned ? '已标记为学会' : '已标记为未学会',
        icon: 'success',
        duration: 1500
      });
    }
  },
  
  // 刷新学习状态 - 当从播放页面返回时更新
  refreshLearningStatus() {
    // 只有在有录音数据时才刷新
    if (this.data.categoryClips.length > 0) {
      console.log('🔄 刷新学习状态');
      
      // 重新加载学习状态
      const learnedClips = wx.getStorageSync('learnedClips') || [];
      
      // 更新categoryClips中每个录音的学习状态
      const self = this;
      const updatedClips = this.data.categoryClips.map(function(clip) {
        const clipId = self.generateClipId(clip, self.data.selectedRegion);
        const isLearned = learnedClips.includes(clipId);
        console.log('🔍 检查录音学习状态: ' + clip.label + ' - ID: ' + clipId + ' - 已学会: ' + isLearned);
        return Object.assign({}, clip, {
          isLearned: isLearned,
          clipId: clipId
        });
      });
      
      this.setData({
        learnedClips: learnedClips,
        categoryClips: updatedClips
      });
      
      console.log('✅ 学习状态已刷新');
    }
  },
  
  // 切换当前录音的学习状态
  toggleCurrentClipLearned() {
    if (this.data.currentClip && this.data.currentClip.clipId) {
      // 切换学习状态
      this.toggleClipLearned(this.data.currentClip.clipId);
      
      // 更新当前录音的状态
      const updatedCurrentClip = Object.assign({}, this.data.currentClip, {
        isLearned: !this.data.currentClip.isLearned
      });
      
      // 更新categoryClips中的状态
      const updatedClips = this.data.categoryClips.slice();
      updatedClips[this.data.currentClipIndex] = updatedCurrentClip;
      
      this.setData({
        currentClip: updatedCurrentClip,
        categoryClips: updatedClips
      });
      
      // 显示反馈
      wx.showToast({
        title: updatedCurrentClip.isLearned ? '已标记为学会' : '已标记为未学会',
        icon: 'success',
        duration: 1500
      });
    }
  },
  
  // 显示即将上线提示
  showComingSoon(e) {
    const regionId = e.currentTarget.dataset.region;
    const region = this.data.regions.find(function(r) { return r.id === regionId; });
    
    wx.showModal({
      title: '敬请期待',
      content: region.flag + ' ' + region.name + '的真实陆空通话录音正在收集整理中，敬请期待！',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 选择地区
  selectRegion(e) {
    const regionId = e.currentTarget.dataset.region;
    
    // 获取地区信息
    const region = this.data.regions.find(function(r) { return r.id === regionId; });
    if (!region) {
      wx.showToast({
        title: '地区信息不存在',
        icon: 'none'
      });
      return;
    }

    // 检查是否需要动态加载分包
    const subpackageMap = {
      'japan': 'japanAudioPackage',
      'philippines': 'philippineAudioPackage', 
      'korea': 'koreaAudioPackage',
      'singapore': 'singaporeAudioPackage',
      'thailand': 'thailandAudioPackage',
      'russia': 'russiaAudioPackage',
      'srilanka': 'srilankaAudioPackage',
      'turkey': 'turkeyAudioPackage',
      'australia': 'australiaAudioPackage'
    };

    const requiredPackage = subpackageMap[regionId];
    if (requiredPackage && !this.isPackageLoaded(requiredPackage)) {
      // 检查是否是分散预加载的分包
      const distributedPreloadMap = {
        "koreaAudioPackage": "录音分类页面", 
        "russiaAudioPackage": "录音分类页面",  
        "thailandAudioPackage": "录音片段页面",
        "srilankaAudioPackage": "通信规则页面",
        "australiaAudioPackage": "资料查询页面"
      };
      
      if (distributedPreloadMap[requiredPackage]) {
        console.log('💡 ' + region.name + ' 音频分包可通过访问 ' + distributedPreloadMap[requiredPackage] + ' 预加载');
      }
      
      this.loadAudioPackage(requiredPackage, regionId);
      return;
    }

    // 分包已预加载或无需分包，直接处理
    this.processRegionData(regionId);
  },

  // 动态加载音频分包
  loadAudioPackage(packageName, regionId) {
    const self = this;
    
    // 检测开发者工具环境 - 使用兼容性工具
    const systemInfoHelper = require('../../utils/system-info-helper.js');
    const deviceInfo = systemInfoHelper.getDeviceInfo();
    const isDevTools = deviceInfo.platform === 'devtools';
    
    if (isDevTools || !wx.loadSubpackage) {
      console.log('⚠️ 开发者工具环境：跳过分包加载，直接处理地区数据');
      // 标记分包为已加载（模拟）
      const currentLoadedPackages = self.data.loadedPackages.slice();
      if (!currentLoadedPackages.includes(packageName)) {
        currentLoadedPackages.push(packageName);
        self.setData({ loadedPackages: currentLoadedPackages });
      }
      
      // 重新加载录音配置
      self.loadRecordingConfig();
      
      // 直接处理地区数据
      setTimeout(function() {
        self.processRegionData(regionId);
      }, 100);
      return;
    }
    
    wx.showLoading({
      title: '正在加载音频资源...',
      mask: true
    });

    wx.loadSubpackage({
      name: packageName,
      success: function() {
        wx.hideLoading();
        console.log('✅ 成功加载音频分包: ' + packageName);
        
        // 标记分包已加载
        const currentLoadedPackages = self.data.loadedPackages.slice();
        if (!currentLoadedPackages.includes(packageName)) {
          currentLoadedPackages.push(packageName);
          self.setData({ loadedPackages: currentLoadedPackages });
        }
        
        wx.showToast({
          title: '音频资源加载完成',
          icon: 'success',
          duration: 1000
        });
        
        // 重新加载录音配置以包含新加载的分包数据
        self.loadRecordingConfig();
        
        // 延迟处理地区数据，确保数据已更新
        setTimeout(function() {
          self.processRegionData(regionId);
        }, 500);
      },
      fail: function(res) {
        wx.hideLoading();
        console.error('❌ 加载音频分包失败: ' + packageName, res);
        wx.showModal({
          title: '加载失败',
          content: '音频资源加载失败，请检查网络连接后重试。\n错误信息: ' + (res.errMsg || '未知错误'),
          showCancel: true,
          cancelText: '取消',
          confirmText: '重试',
          success: function(modalRes) {
            if (modalRes.confirm) {
              // 重试加载
              self.loadAudioPackage(packageName, regionId);
            }
          }
        });
      }
    });
  },

  // 检查分包是否已加载
  isPackageLoaded(packageName) {
    // 🔄 完全分散预加载检查
    // 所有音频分包都通过不同页面预加载，无需异步加载
    const allPreloadMapping = {
      "japanAudioPackage": "主页(others)",
      "singaporeAudioPackage": "主页(others)", 
      "philippineAudioPackage": "陆空通话页面",
      "koreaAudioPackage": "陆空通话页面",
      "russiaAudioPackage": "录音分类页面",
      "thailandAudioPackage": "录音分类页面",
      "srilankaAudioPackage": "录音片段页面",
      "turkeyAudioPackage": "录音片段页面",
      "australiaAudioPackage": "资料查询页面"
    };
    
    // 当前页面预加载的分包
    const currentPagePreloaded = ["philippineAudioPackage", "koreaAudioPackage"];
    
    // 检查是否已加载（当前页面预加载 + 运行时动态加载状态）
    const isLoaded = currentPagePreloaded.includes(packageName) || 
                     this.data.loadedPackages.includes(packageName);
    
    if (!isLoaded && allPreloadMapping[packageName]) {
      console.log('📍 分包 ' + packageName + ' 在 ' + allPreloadMapping[packageName] + ' 预加载');
    }
    
    return isLoaded;
  },


  // 处理地区数据
  processRegionData(regionId, retried) {
    // 获取该地区的所有录音
    const regionAirports = this.data.airports.filter(function(airport) { return airport.regionId === regionId; });
    const allClips = regionAirports.reduce(function(clips, airport) {
      return clips.concat(airport.clips || []);
    }, []);

    if (allClips.length > 0) {
      // 根据label自动分类
      const categories = this.getCategoriesFromClips(allClips);

      // 获取地区信息并更新导航栏标题
      const region = this.data.regions.find(function(r) { return r.id === regionId; });
      const regionName = region ? (region.flag + ' ' + region.name) : regionId;
      wx.setNavigationBarTitle({
        title: regionName
      });

      // 进入分类选择页面
      this.setData({
        selectedRegion: regionId,
        recordingCategories: categories,
        categoryClips: [],
        currentClipIndex: 0,
        currentClip: null
      });
    } else if (!retried) {
      // clips 可能尚未加载完成，尝试等待异步加载
      var self = this;
      var recordingModule = require('../../utils/audio-config.js');
      var manager = recordingModule.audioConfigManager;

      wx.showLoading({ title: '加载录音数据...', mask: true });
      manager.loadAllRegionClips().then(function() {
        wx.hideLoading();
        var updatedConfig = manager.getFullConfig();
        self.setData({
          airports: updatedConfig.airports,
          recordingConfig: updatedConfig,
          filteredAirports: updatedConfig.airports
        });
        self.processRegionData(regionId, true);
      }).catch(function() {
        wx.hideLoading();
        wx.showToast({ title: '加载录音数据失败', icon: 'none' });
      });
    } else {
      wx.showToast({
        title: '暂无录音数据',
        icon: 'none'
      });
    }
  },
  
  // 从录音中提取分类信息
  getCategoriesFromClips(clips) {
    const categoryMap = new Map();
    
    clips.forEach(function(clip) {
      const label = clip.label || '其他';
      if (!categoryMap.has(label)) {
        categoryMap.set(label, {
          id: label,
          name: label,
          icon: this.getCategoryIcon(label),
          color: this.getCategoryColor(label),
          clips: []
        });
      }
      categoryMap.get(label).clips.push(clip);
    });
    
    return Array.from(categoryMap.values());
  },
  
  // 获取分类图标
  getCategoryIcon(label) {
    const iconMap = {
      '进近': '🛬',
      '进场': '🛬',
      '区调': '📡',
      '塔台': '🗼',
      '地面': '🚛',
      '离场': '🛫',
      '放行': '📋',
      '机坪': '🅿️',
      '其他': '📻'
    };
    return iconMap[label] || '📻';
  },
  
  // 获取分类颜色
  getCategoryColor(label) {
    const colorMap = {
      '进近': '#3B82F6',
      '进场': '#3B82F6',
      '区调': '#06B6D4',
      '塔台': '#8B5CF6',
      '地面': '#F59E0B',
      '离场': '#10B981',
      '放行': '#EF4444',
      '机坪': '#F97316',
      '其他': '#6B7280'
    };
    return colorMap[label] || '#6B7280';
  },
  
  // 选择录音类型
  selectCategory(e) {
    const categoryId = e.currentTarget.dataset.category;
    const category = this.data.recordingCategories.find(function(cat) { return cat.id === categoryId; });
    
    if (category) {
      // 为每个录音添加学习状态
      const self = this;
      const clipsWithLearningStatus = category.clips.map(function(clip) {
        const clipId = self.generateClipId(clip, self.data.selectedRegion);
        return Object.assign({}, clip, {
          isLearned: self.isClipLearned(clipId),
          clipId: clipId
        });
      });
      
      // 更新导航栏标题
      const region = this.data.regions.find(function(r) { return r.id === this.data.selectedRegion; });
      const regionName = region ? (region.flag + ' ' + region.name) : this.data.selectedRegion;
      wx.setNavigationBarTitle({
        title: regionName + ' - ' + categoryId
      });
      
      this.setData({
        selectedCategory: categoryId,
        categoryClips: clipsWithLearningStatus,
        currentClipIndex: -1, // 重置为未选择状态
        currentClip: null
      });
    }
  },
  
  // 返回地区选择
  backToRegions() {
    this.setData({
      selectedRegion: '',
      selectedCategory: '',
      selectedAirport: '',
      recordingCategories: [],
      categoryClips: [],
      currentClipIndex: 0,
      currentClip: null,
      currentAudioSrc: '',
      isPlaying: false
    });
    
    // 恢复航线录音标题
    wx.setNavigationBarTitle({
      title: '航线录音'
    });
    
    // 停止播放
    if (this.data.audioContext) {
      this.data.audioContext.stop();
      this.data.audioContext.destroy();
      this.setData({ audioContext: null });
    }
  },
  
  // 返回分类选择
  backToCategories() {
    this.setData({
      selectedCategory: '',
      categoryClips: [],
      currentClipIndex: -1,
      currentClip: null,
      currentAudioSrc: '',
      isPlaying: false
    });
    
    // 恢复地区标题
    const region = this.data.regions.find(function(r) { return r.id === this.data.selectedRegion; });
    const regionName = region ? (region.flag + ' ' + region.name) : this.data.selectedRegion;
    wx.setNavigationBarTitle({
      title: regionName
    });
    
    // 停止播放
    if (this.data.audioContext) {
      this.data.audioContext.stop();
      this.data.audioContext.destroy();
      this.setData({ audioContext: null });
    }
  },
  
  // 返回录音卡片列表
  backToClips() {
    this.setData({
      currentClipIndex: -1,
      currentClip: null,
      currentAudioSrc: '',
      isPlaying: false,
      audioProgress: 0
    });
    
    // 停止播放
    if (this.data.audioContext) {
      this.data.audioContext.stop();
      this.data.audioContext.destroy();
      this.setData({ audioContext: null });
    }
  },
  
  // 选择机场
  selectAirport(e) {
    const airportId = e.currentTarget.dataset.airport;
    const airport = this.data.airports.find(function(airport) { return airport.id === airportId; });
    
    console.log('🏢 选择机场：' + airportId);
    console.log('📊 机场数据：', airport);
    
    if (airport && airport.clips && airport.clips.length > 0) {
      console.log('🎵 找到 ' + airport.clips.length + ' 个录音');
      
      this.setData({
        selectedAirport: airportId,
        currentAirportClips: airport.clips,
        currentClipIndex: 0,
        currentClip: airport.clips[0]
      });
      
      // 设置音频源
      this.setAudioSource(airport.clips[0], airportId);
    } else {
      console.warn('⚠️ 机场 ' + airportId + ' 没有录音数据');
      wx.showToast({
        title: '暂无录音数据',
        icon: 'none'
      });
    }
  },
  
  // 返回机场列表
  backToAirports() {
    this.setData({
      selectedAirport: '',
      currentAirportClips: [],
      currentClipIndex: 0,
      currentClip: null,
      currentAudioSrc: '',
      isPlaying: false
    });
    
    // 停止播放
    if (this.data.audioContext) {
      this.data.audioContext.stop();
      this.data.audioContext.destroy();
      this.setData({ audioContext: null });
    }
  },
  
  // 设置音频源
  setAudioSource(clip, airportId) {
    const airport = this.data.airports.find(function(a) { return a.id === airportId; });
    if (airport && clip && clip.mp3_file) {
      // 使用音频配置管理器获取正确的路径
      const recordingModule = require('../../utils/audio-config.js');
      const audioConfigManager = recordingModule.audioConfigManager;
      const audioPath = audioConfigManager.getAudioPath(airportId, clip.mp3_file) || (airport.audioPath + clip.mp3_file);
      
      this.setData({
        currentAudioSrc: audioPath,
        currentClip: clip
      });
      
      // 销毁旧的音频上下文
      if (this.data.audioContext) {
        this.data.audioContext.destroy();
      }
      
      // 创建新的音频上下文
      this.createAudioContext();
      
      console.log('🎵 设置音频源：' + audioPath);
    } else {
      console.error('❌ 设置音频源失败：找不到机场或录音文件');
    }
  },
  
  // 为分类录音设置音频源
  setAudioSourceForCategory(clip) {
    if (clip && clip.mp3_file) {
      // 使用音频配置管理器获取正确的路径
      const recordingModule = require('../../utils/audio-config.js');
      const audioConfigManager = recordingModule.audioConfigManager;
      const audioPath = audioConfigManager.getAudioPath(this.data.selectedRegion, clip.mp3_file);
      
      console.log('🎵 设置分类音频源：' + audioPath);
      console.log('🎵 录音信息：', clip);
      
      this.setData({
        currentAudioSrc: audioPath,
        currentClip: clip
      });
      
      // 销毁旧的音频上下文
      if (this.data.audioContext) {
        console.log('🗑️ 销毁旧的音频上下文');
        this.data.audioContext.destroy();
        this.setData({ audioContext: null });
      }
      
      // 创建新的音频上下文
      this.createAudioContext();
      
    } else {
      console.error('❌ 设置分类音频源失败：找不到录音文件', clip);
      wx.showToast({
        title: '录音文件不存在',
        icon: 'none'
      });
    }
  },
  
  // 创建音频上下文
  createAudioContext() {
    if (!this.data.currentAudioSrc) {
      console.error('❌ 无法创建音频上下文：音频源为空');
      return;
    }

    console.log('🎵 正在创建音频上下文，音频源:', this.data.currentAudioSrc);
    
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = this.data.currentAudioSrc;
    audioContext.loop = this.data.isLooping;
    audioContext.volume = this.data.volume / 100;
    
    // 绑定事件
    audioContext.onPlay(() => {
      console.log('🎵 音频开始播放');
      this.setData({ isPlaying: true });
    });
    
    audioContext.onPause(() => {
      console.log('⏸️ 音频暂停播放');
      this.setData({ isPlaying: false });
    });
    
    audioContext.onStop(() => {
      console.log('⏹️ 音频停止播放');
      this.setData({ isPlaying: false, audioProgress: 0 });
    });
    
    audioContext.onEnded(() => {
      console.log('🏁 音频播放结束');
      this.setData({ isPlaying: false, audioProgress: 0 });
      // 如果不是循环模式，自动播放下一个
      if (!this.data.isLooping && this.data.categoryClips.length > 1) {
        this.nextClip();
      }
    });
    
    audioContext.onTimeUpdate(() => {
      if (audioContext.duration > 0) {
        const progress = (audioContext.currentTime / audioContext.duration) * 100;
        this.setData({ audioProgress: progress });
      }
    });
    
    audioContext.onError((error) => {
      console.error('❌ 音频播放错误:', error);
      console.error('❌ 音频文件路径:', this.data.currentAudioSrc);
      wx.showToast({
        title: '音频播放失败: ' + (error.errMsg || '未知错误'),
        icon: 'none',
        duration: 3000
      });
      this.setData({ isPlaying: false });
    });

    audioContext.onCanplay(() => {
      console.log('✅ 音频文件可以播放');
    });

    audioContext.onWaiting(() => {
      console.log('⏳ 音频正在加载...');
    });
    
    this.setData({ audioContext });
    console.log('✅ 音频上下文创建完成');
  },
  
  // 选择录音片段 - 跳转到独立的音频播放页面
  selectClip(e) {
    const index = e.currentTarget.dataset.index;
    const clip = this.data.categoryClips[index];
    const region = this.data.regions.find(function(r) { return r.id === this.data.selectedRegion; });

    if (!clip || !region || !region.subPackageName) {
      wx.showToast({
        title: '录音或配置数据错误',
        icon: 'none'
      });
      return;
    }

    // 检查分包是否已加载
    if (!this.isPackageLoaded(region.subPackageName)) {
      // 检测开发者工具环境 - 使用兼容性工具
      const systemInfoHelper = require('../../utils/system-info-helper.js');
      const deviceInfo = systemInfoHelper.getDeviceInfo();
      const isDevTools = deviceInfo.platform === 'devtools';
      
      if (isDevTools || !wx.loadSubpackage) {
        console.log('⚠️ 开发者工具环境：跳过分包加载，直接导航到音频播放页面');
        // 标记分包为已加载（模拟）
        const currentLoadedPackages = this.data.loadedPackages.slice();
        if (!currentLoadedPackages.includes(region.subPackageName)) {
          currentLoadedPackages.push(region.subPackageName);
          this.setData({ loadedPackages: currentLoadedPackages });
        }
        this.navigateToAudioPlayer(index, region);
        return;
      }
      
      wx.showLoading({
        title: '正在加载音频资源...',
        mask: true
      });

      const self = this;
      wx.loadSubpackage({
        name: region.subPackageName,
        success: function() {
          wx.hideLoading();
          // 标记分包已加载
          const currentLoadedPackages = self.data.loadedPackages.slice();
          if (!currentLoadedPackages.includes(region.subPackageName)) {
            currentLoadedPackages.push(region.subPackageName);
            self.setData({ loadedPackages: currentLoadedPackages });
          }
          self.navigateToAudioPlayer(index, region);
        },
        fail: function(res) {
          wx.hideLoading();
          console.error('❌ 分包加载失败:', res);
          wx.showModal({
            title: '加载失败',
            content: '音频资源加载失败，请检查网络连接后重试。\n错误信息: ' + (res.errMsg || '未知错误'),
            showCancel: true,
            cancelText: '取消',
            confirmText: '重试',
            success: function(modalRes) {
              if (modalRes.confirm) {
                self.selectClip(e);
              }
            }
          });
        }
      });
    } else {
      this.navigateToAudioPlayer(index, region);
    }
  },

  // 导航到音频播放器
  navigateToAudioPlayer(index, region) {
    wx.showLoading({
      title: '加载音频...',
      mask: true
    });

    // 停止当前播放
    if (this.data.audioContext) {
      this.data.audioContext.stop();
      this.data.audioContext.destroy();
      this.setData({ 
        audioContext: null,
        isPlaying: false 
      });
    }
    
    const regionName = region ? (region.flag + ' ' + region.name) : this.data.selectedRegion;
    const categoryName = this.data.selectedCategory;
    const allClipsJson = encodeURIComponent(JSON.stringify(this.data.categoryClips));
    
    // 跳转到独立的音频播放页面
    wx.navigateTo({
      url: '/packageNav/audio-player/index?' + 
           'regionId=' + this.data.selectedRegion + '&' +
           'regionName=' + encodeURIComponent(regionName) + '&' +
           'categoryId=' + this.data.selectedCategory + '&' +
           'categoryName=' + encodeURIComponent(categoryName) + '&' +
           'clipIndex=' + index + '&' +
           'allClipsJson=' + allClipsJson,
      success: function() {
        wx.hideLoading();
      },
      fail: function() {
        wx.hideLoading();
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 播放/暂停切换
  togglePlayPause() {
    console.log('🎯 点击播放/暂停按钮');
    console.log('🎯 当前状态 - isPlaying:', this.data.isPlaying);
    console.log('🎯 当前状态 - audioContext:', !!this.data.audioContext);
    console.log('🎯 当前状态 - currentAudioSrc:', this.data.currentAudioSrc);
    
    if (!this.data.audioContext && this.data.currentAudioSrc) {
      console.log('🎵 音频上下文不存在，正在创建...');
      this.createAudioContext();
    }
    
    if (this.data.audioContext) {
      if (this.data.isPlaying) {
        console.log('⏸️ 正在暂停播放');
        this.data.audioContext.pause();
      } else {
        console.log('▶️ 正在开始播放');
        this.data.audioContext.play();
      }
    } else {
      console.error('❌ 无法播放：音频上下文未创建');
      wx.showToast({
        title: '播放器初始化失败',
        icon: 'none'
      });
    }
  },
  
  // 上一个录音
  previousClip() {
    const currentIndex = this.data.currentClipIndex;
    const clips = this.data.categoryClips;
    
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const newClip = clips[newIndex];
      
      this.setData({
        currentClipIndex: newIndex,
        currentClip: newClip,
        isPlaying: false
      });
      
      this.setAudioSourceForCategory(newClip);
    }
  },
  
  // 下一个录音
  nextClip() {
    const currentIndex = this.data.currentClipIndex;
    const clips = this.data.categoryClips;
    
    if (currentIndex < clips.length - 1) {
      const newIndex = currentIndex + 1;
      const newClip = clips[newIndex];
      
      this.setData({
        currentClipIndex: newIndex,
        currentClip: newClip,
        isPlaying: false
      });
      
      this.setAudioSourceForCategory(newClip);
    }
  },
  
  // 切换循环模式
  toggleLoop() {
    const newLooping = !this.data.isLooping;
    this.setData({
      isLooping: newLooping
    });
  },
  
  // 选择字幕语言
  selectSubtitleLang(e) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({
      subtitleLang: lang
    });
  },

  // 航线录音快捷播放卡片点击
  handleQuickRoutePlayTap() {
    console.log('🎧 航线录音快捷播放器点击');

    if (this.data.quickPlayerLoading) {
      return;
    }

    // 如果已有音频在播放或已初始化上下文，则执行播放/暂停切换
    if (this.data.currentAudioSrc && this.data.audioContext) {
      this.togglePlayPause();
      return;
    }

    this.setData({
      quickPlayerLoading: true,
      quickPlayerStatus: '正在查找已缓存的录音...'
    });

    // 构建或复用播放列表
    let playlist = this.data.quickPlayerPlaylist || [];
    if (!playlist.length) {
      playlist = this.buildQuickPlayerPlaylistFromCache();
    }

    if (!playlist.length) {
      this.setData({
        quickPlayerLoading: false,
        quickPlayerStatus: '暂无已缓存的航线录音，将打开“航线录音”进行缓存'
      });

      wx.showToast({
        title: '还没有离线缓存的航线录音，正在打开“航线录音”进行缓存',
        icon: 'none',
        duration: 2000
      });

      wx.navigateTo({
        url: '/packageNav/airline-recordings/index'
      });

      return;
    }

    // 随机选择一个起始索引，并自动播放
    const randomIndex = Math.floor(Math.random() * playlist.length);
    this.switchQuickPlayerToIndex(randomIndex, playlist, true);
  },

  // 快捷播放器 - 上一条
  handleQuickRoutePrevTap(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (this.data.quickPlayerLoading) {
      return;
    }

    let playlist = this.data.quickPlayerPlaylist || [];
    if (!playlist.length) {
      playlist = this.buildQuickPlayerPlaylistFromCache();
      if (!playlist.length) {
        wx.showToast({
          title: '暂无已缓存的航线录音',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      // 第一次使用上一条时，只选中第一条，不自动播放
      this.switchQuickPlayerToIndex(0, playlist, false);
      return;
    }

    const count = playlist.length;
    if (!count) {
      return;
    }

    const currentIndex = this.data.quickPlayerIndex >= 0 ? this.data.quickPlayerIndex : 0;
    const newIndex = (currentIndex - 1 + count) % count;

    // 根据当前播放状态决定是否自动播放
    this.switchQuickPlayerToIndex(newIndex, playlist, this.data.isPlaying);
  },

  // 快捷播放器 - 下一条
  handleQuickRouteNextTap(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (this.data.quickPlayerLoading) {
      return;
    }

    let playlist = this.data.quickPlayerPlaylist || [];
    if (!playlist.length) {
      playlist = this.buildQuickPlayerPlaylistFromCache();
      if (!playlist.length) {
        wx.showToast({
          title: '暂无已缓存的航线录音',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      // 第一次使用下一条时，只选中第一条，不自动播放
      this.switchQuickPlayerToIndex(0, playlist, false);
      return;
    }

    const count = playlist.length;
    if (!count) {
      return;
    }

    const currentIndex = this.data.quickPlayerIndex >= 0 ? this.data.quickPlayerIndex : 0;
    const newIndex = (currentIndex + 1) % count;

    this.switchQuickPlayerToIndex(newIndex, playlist, this.data.isPlaying);
  },

  // 快捷播放器 - 切换到指定索引
  switchQuickPlayerToIndex(index, playlist, autoPlay) {
    const list = playlist || this.data.quickPlayerPlaylist || [];
    if (!list || !list.length) {
      console.warn('⚠️ 快捷播放器切换失败：播放列表为空');
      this.setData({
        quickPlayerLoading: false
      });
      return;
    }

    let targetIndex = index;
    if (targetIndex < 0) {
      targetIndex = 0;
    }
    if (targetIndex >= list.length) {
      targetIndex = list.length - 1;
    }

    const item = list[targetIndex];
    if (!item || !item.cachePath) {
      console.warn('⚠️ 快捷播放器切换失败：目标项无有效缓存路径', item);
      this.setData({
        quickPlayerLoading: false
      });
      return;
    }

    // 计算显示标题与字幕
    const airportName = item.airportName || item.airport || '';
    const label = item.label || '';
    const titleParts: string[] = [];
    if (airportName) {
      titleParts.push(airportName);
    }
    if (label) {
      titleParts.push(label);
    }
    const displayTitle = titleParts.length ? titleParts.join(' · ') : '随机航线录音';

    const subtitleCN = item.full_transcript || '';
    const subtitleEN = item.english_transcript || '';
    const displaySubtitle = this.data.subtitleLang === 'en'
      ? (subtitleEN || subtitleCN)
      : (subtitleCN || subtitleEN);

    // 停止并销毁旧的音频上下文
    if (this.data.audioContext) {
      try {
        this.data.audioContext.stop();
        this.data.audioContext.destroy();
      } catch (error) {
        console.warn('⚠️ 停止旧音频上下文时出错(快捷播放器):', error);
      }
    }

    this.setData({
      quickPlayerPlaylist: list,
      quickPlayerIndex: targetIndex,
      audioContext: null,
      isPlaying: false,
      audioProgress: 0,
      currentClipIndex: -1,
      currentClip: null,
      currentAudioSrc: item.cachePath,
      quickPlayerTitle: displayTitle,
      quickPlayerSubtitle: displaySubtitle,
      quickPlayerStatus: autoPlay ? '正在播放' : '已选中',
      quickPlayerLoading: false
    });

    this.createAudioContext();

    if (autoPlay && this.data.audioContext) {
      try {
        this.data.audioContext.play();
      } catch (error) {
        console.error('❌ 启动快捷播放失败:', error);
        wx.showToast({
          title: '播放失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  },

  // 从音频缓存索引中构建快捷播放器播放列表
  buildQuickPlayerPlaylistFromCache() {
    try {
      const versionedKey = VersionManager.getVersionedKey('flight_audio_cache_index');
      const cacheIndex = wx.getStorageSync(versionedKey) || {};
      const keys = Object.keys(cacheIndex);

      if (!keys.length) {
        console.log('🎧 快捷播放器：没有找到任何缓存的航线录音');
        return [];
      }

      const airports = (this.data.airports || []) as any[];

      if (!airports.length) {
        console.warn('⚠️ 快捷播放器：airports 数据为空，无法解析字幕');
      }

      const playlist: any[] = [];

      keys.forEach((key) => {
        const cacheItem: any = (cacheIndex as any)[key];
        if (!cacheItem || !cacheItem.path) {
          return;
        }

        const cachePath = cacheItem.path;
        const originalSrcRaw = cacheItem.originalSrc || '';

        let matchedAirport: any = null;
        let filename = '';
        let matchedClip: any = null;

        if (originalSrcRaw && airports.length) {
          const normalized = originalSrcRaw.startsWith('/') ? originalSrcRaw : '/' + originalSrcRaw;

          for (let i = 0; i < airports.length; i++) {
            const airport = airports[i];
            if (!airport || !airport.audioPath) {
              continue;
            }
            const audioPath = airport.audioPath;
            if (normalized.indexOf(audioPath) === 0) {
              matchedAirport = airport;
              filename = normalized.slice(audioPath.length);
              break;
            }
          }

          if (matchedAirport && filename) {
            filename = filename.replace(/^\/+/, '');
            const clips = matchedAirport.clips || [];
            for (let i = 0; i < clips.length; i++) {
              const clip = clips[i];
              if (clip && clip.mp3_file === filename) {
                matchedClip = clip;
                break;
              }
            }
          }
        }

        const airportName = matchedAirport ? matchedAirport.name : '';
        const regionId = matchedAirport ? matchedAirport.regionId : '';
        const label = matchedClip && matchedClip.label ? matchedClip.label : '';
        const subtitleCN = matchedClip && matchedClip.full_transcript ? matchedClip.full_transcript : '';
        const subtitleEN = matchedClip && matchedClip.english_transcript ? matchedClip.english_transcript : '';

        const titleParts: string[] = [];
        if (airportName) {
          titleParts.push(airportName);
        }
        if (label) {
          titleParts.push(label);
        }
        const displayTitle = titleParts.length ? titleParts.join(' · ') : '随机航线录音';

        playlist.push({
          cachePath: cachePath,
          originalSrc: originalSrcRaw,
          airportId: matchedAirport && matchedAirport.id,
          airportName: airportName,
          regionId: regionId,
          label: label,
          mp3_file: matchedClip && matchedClip.mp3_file,
          full_transcript: subtitleCN,
          english_transcript: subtitleEN,
          title: displayTitle
        });
      });

      // 过滤无效项
      const filtered = playlist.filter(function(item) {
        return !!item && !!item.cachePath;
      });

      // 随机打乱一次队列，提升“随机”体验
      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = filtered[i];
        filtered[i] = filtered[j];
        filtered[j] = tmp;
      }

      console.log('🎧 快捷播放器：已构建播放列表，条数:', filtered.length);

      return filtered;
    } catch (error) {
      console.error('❌ 构建快捷播放器播放列表失败:', error);
      return [];
    }
  },

  // 从音频缓存索引中随机选取一条可用的航线录音（保留原工具方法，供其他逻辑复用）
  getRandomCachedClipForQuickPlayer() {
    try {
      const versionedKey = VersionManager.getVersionedKey('flight_audio_cache_index');
      const cacheIndex = wx.getStorageSync(versionedKey) || {};
      const keys = Object.keys(cacheIndex);

      if (!keys.length) {
        console.log('🎧 没有找到任何缓存的航线录音');
        return null;
      }

      const validItems = keys
        .map((key) => (cacheIndex as any)[key])
        .filter((item: any) => item && item.path);

      if (!validItems.length) {
        console.log('🎧 缓存索引中没有可用的音频路径');
        return null;
      }

      const randomIndex = Math.floor(Math.random() * validItems.length);
      const chosen = validItems[randomIndex];

      return {
        cachePath: chosen.path,
        originalSrc: chosen.originalSrc || ''
      };
    } catch (error) {
      console.error('❌ 获取随机缓存录音失败:', error);
      return null;
    }
  },

  // 页面销毁时清理音频资源
  customOnUnload() {
    console.log('🧹 页面卸载，开始清理资源...');

    // 🧹 清理插屏广告资源（定时器由ad-helper自动管理）
    this.destroyInterstitialAd();

    // 清理音频资源
    if (this.data.audioContext) {
      try {
        this.data.audioContext.stop();
        this.data.audioContext.destroy();
        console.log('✅ 音频上下文已销毁');
      } catch (error) {
        console.warn('⚠️ 清理音频资源时出错:', error);
      }
    }

    // 清理支持卡片高亮定时器
    if (this.supportCardTimer) {
      clearTimeout(this.supportCardTimer);
      this.supportCardTimer = null;
      console.log('✅ 支持卡片高亮定时器已清理');
    }

    console.log('✅ 页面资源清理完成');
  },

  // 设置默认通信规则数据（兜底）
  setDefaultCommunicationRules() {
    const defaultRules = {
      documentTitle: "陆空通话学习资料",
      organization: "专业航空通信",
      chapters: [
        {
          id: "chapter1",
          title: "总则",
          icon: "📋", 
          color: "#3B82F6",
          sections: [
            {
              id: "basic",
              title: "基础规范",
              icon: "🗣️",
              subsections: [
                {
                  id: "overview",
                  title: "通话概述",
                  content: [
                    "空中交通无线电通话用语应用于空中交通服务单位与航空器之间的话音联络。",
                    "使用标准的发音规则，语言简洁、严谨。",
                    "陆空通话中应使用汉语普通话或英语，时间采用UTC（协调世界时）。"
                  ]
                }
              ]
            }
          ]
        }
      ],
      quickReference: {
        numbers: [
          { digit: "0", chinese: "洞", english: "ZE-RO" },
          { digit: "1", chinese: "幺", english: "WUN" },
          { digit: "2", chinese: "两", english: "TOO" },
          { digit: "3", chinese: "三", english: "TREE" },
          { digit: "4", chinese: "四", english: "FOW-er" },
          { digit: "5", chinese: "五", english: "FIFE" },
          { digit: "6", chinese: "六", english: "SIX" },
          { digit: "7", chinese: "拐", english: "SEV-en" },
          { digit: "8", chinese: "八", english: "AIT" },
          { digit: "9", chinese: "九", english: "NIN-er" }
        ],
        commonAltitudes: [
          { altitude: "3000m", chinese: "三千", english: "TREE TOU-SAND METERS" },
          { altitude: "6000m", chinese: "六千", english: "SIX TOU-SAND METERS" }
        ]
      }
    };

    this.setData({
      communicationRules: defaultRules,
      filteredChapters: defaultRules.chapters
    });

    wx.showToast({
      title: '使用离线数据',
      icon: 'none'
    });
  },

  // 打开ICAO标准对话页面
  openStandardPhraseology() {
    console.log('🎯 打开ICAO标准对话页面');

    // 使用统一的卡片点击处理（自动处理广告触发）
    this.handleCardClick(() => {
      wx.navigateTo({
        url: '/packageNav/standard-phraseology/index',
        fail: (err) => {
          console.error('❌ 跳转ICAO标准对话页面失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    });
  },

  // 打开CPDLC电文查询页面
  openCPDLC() {
    console.log('🎯 打开CPDLC电文查询页面');

    // 使用统一的卡片点击处理（自动处理广告触发）
    this.handleCardClick(() => {
      wx.navigateTo({
        url: '/packageO/cpdlc/index',
        fail: (err) => {
          console.error('❌ 跳转CPDLC电文查询页面失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    });
  },

  // 选择功能模块
  selectModule(e) {
    const module = e.currentTarget.dataset.module;
    
    console.log('🎯 选择模块:', module);
    
    // 使用通用卡片点击处理逻辑
    this.handleCardClick(() => {
      this.navigateToModule(module);
    });
  },

  /**
   * 通用卡片点击处理（优化版：防抖+异常处理）
   */
  handleCardClick: function(navigateCallback) {
    const self = this;

    // 🎬 触发广告：记录卡片点击操作并尝试展示广告（带防抖和异常处理）
    try {
      // 防抖机制：避免短时间内重复触发
      if (this._adTriggerTimer) {
        console.log('🎬 广告触发防抖中，跳过本次');
      } else {
        this._adTriggerTimer = true;

        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const route = currentPage.route || '';
        adHelper.adStrategy.recordAction(route);
        this.showInterstitialAdWithControl();

        // 500ms后重置防抖标志
        this.createSafeTimeout(function() {
          self._adTriggerTimer = false;
        }, 500, '广告触发防抖');
      }
    } catch (error) {
      console.error('🎬 广告触发失败:', error);
      // 不影响导航，继续执行
    }

    // 执行导航
    if (navigateCallback && typeof navigateCallback === 'function') {
      try {
        navigateCallback();
      } catch (error) {
        console.error('[handleCardClick] 导航失败:', error);
      }
    }
  },

  // 导航到具体模块
  navigateToModule(module) {
    
    if (module === 'airline-recordings') {
      // 航线录音，直接跳转
      wx.navigateTo({
        url: '/packageNav/airline-recordings/index'
      });
    } else if (module === 'communication-failure') {
      // 通信失效，跳转到分包页面
      wx.navigateTo({
        url: '/packageCommFailure/pages/index'
      });
    } else if (module === 'communication-rules') {
      // 陆空通话规范，直接跳转
      wx.navigateTo({
        url: '/packageNav/standard-phraseology/index'
      });
    } else if (module === 'emergency-altitude') {
      // 紧急改变高度程序，直接显示
      this.setData({
        selectedModule: 'emergency-altitude'
      });
      // 更新页面标题
      wx.setNavigationBarTitle({
        title: '紧急改变高度'
      });
    }
  },

  // 返回主页面
  backToMain() {
    this.setData({
      selectedModule: ''
    });
    // 恢复主页面标题
    wx.setNavigationBarTitle({
      title: '通信'
    });
  },

  
  // 返回规范章节列表
  backToRulesChapters() {
    // 恢复陆空通话规范标题
    wx.setNavigationBarTitle({
      title: '陆空通话'
    });
    
    this.setData({
      selectedChapter: '',
      selectedSection: ''
    });
  },
  
  // 返回节列表
  backToSections() {
    // 恢复章节标题
    const chapter = (this.data.communicationRules && this.data.communicationRules.chapters) ? this.data.communicationRules.chapters.find(function(c) { return c.id === this.data.selectedChapter; }) : null;
    if (chapter) {
      wx.setNavigationBarTitle({
        title: chapter.title
      });
    }
    
    this.setData({
      selectedSection: ''
    });
  },
  
  
  // 通信规则折叠面板变化
  onRulesChange(e) {
    this.setData({
      activeRulesCategories: e.detail
    });
  },
  
  // 复制通信规则内容
  copyRulesContent(e) {
    const content = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: content,
      success: function() {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },
  
  // 快速工具方法
  
  // 数字转换工具
  openNumberConverter() {
    wx.showModal({
      title: '数字转换工具',
      content: '请输入数字，将自动转换为航空通话读法',
      editable: true,
      placeholderText: '请输入数字...',
      success: function(res) {
        if (res.confirm && res.content) {
          this.convertNumber(res.content);
        }
      }
    });
  },
  
  // 转换数字为通话读法
  convertNumber(input) {
    const numberMap = {
      '0': { chinese: '洞', english: 'ZE-RO' },
      '1': { chinese: '幺', english: 'WUN' },
      '2': { chinese: '两', english: 'TOO' },
      '3': { chinese: '三', english: 'TREE' },
      '4': { chinese: '四', english: 'FOW-er' },
      '5': { chinese: '五', english: 'FIFE' },
      '6': { chinese: '六', english: 'SIX' },
      '7': { chinese: '拐', english: 'SEV-en' },
      '8': { chinese: '八', english: 'AIT' },
      '9': { chinese: '九', english: 'NIN-er' },
      '.': { chinese: '点', english: 'DAY-SEE-MAL' }
    };
    
    let chineseResult = '';
    let englishResult = '';
    
    for (let char of input) {
      if (numberMap[char]) {
        chineseResult += numberMap[char].chinese;
        englishResult += numberMap[char].english + ' ';
      }
    }
    
    const result = '输入: ' + input + '\n中文读法: ' + chineseResult + '\n英文读法: ' + englishResult.trim();
    
    wx.showModal({
      title: '转换结果',
      content: result,
      showCancel: true,
      cancelText: '关闭',
      confirmText: '复制',
      success: function(res) {
        if (res.confirm) {
          wx.setClipboardData({
            data: result,
            success: function() {
              wx.showToast({
                title: '已复制到剪贴板',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },
  
  // 高度读法工具
  openAltitudeConverter() {
    wx.showModal({
      title: '高度读法工具',
      content: '请输入高度值（如：3000m, FL120）',
      editable: true,
      placeholderText: '如: 3000m 或 FL120',
      success: function(res) {
        if (res.confirm && res.content) {
          this.convertAltitude(res.content);
        }
      }
    });
  },
  
  // 转换高度读法
  convertAltitude(input) {
    const commonAltitudes = {
      '600m': { chinese: '六百', english: 'SIX HUN-dred METERS' },
      '1200m': { chinese: '幺两', english: 'WUN TOU-SAND TOO HUN-dred METERS' },
      '3000m': { chinese: '三千', english: 'TREE TOU-SAND METERS' },
      '6000m': { chinese: '六千', english: 'SIX TOU-SAND METERS' },
      '9000m': { chinese: '九千', english: 'NIN-er TOU-SAND METERS' },
      'FL120': { chinese: '高度层幺两洞', english: 'FLIGHT LEVEL WUN TOO ZERO' },
      'FL360': { chinese: '高度层三六洞', english: 'FLIGHT LEVEL TREE SIX ZERO' }
    };
    
    const altitude = commonAltitudes[input.toUpperCase()];
    
    if (altitude) {
      const result = '高度: ' + input + '\n中文读法: ' + altitude.chinese + '\n英文读法: ' + altitude.english;
      
      wx.showModal({
        title: '高度读法',
        content: result,
        showCancel: true,
        cancelText: '关闭',
        confirmText: '复制',
        success: function(res) {
          if (res.confirm) {
            wx.setClipboardData({
              data: result,
              success: function() {
                wx.showToast({
                  title: '已复制到剪贴板',
                  icon: 'success'
                });
              }
            });
          }
        }
      });
    } else {
      wx.showToast({
        title: '未找到该高度读法',
        icon: 'none'
      });
    }
  },
  
  // 时间读法工具
  openTimeConverter() {
    wx.showModal({
      title: '时间读法工具',
      content: '请输入时间（24小时制，如：13:45）',
      editable: true,
      placeholderText: '如: 13:45',
      success: function(res) {
        if (res.confirm && res.content) {
          this.convertTime(res.content);
        }
      }
    });
  },
  
  // 转换时间读法
  convertTime(input) {
    const timePattern = /^(\d{1,2}):(\d{2})$/;
    const match = input.match(timePattern);
    
    if (match) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2];
      const timeString = hours + minutes;
      
      const numberMap = {
        '0': { chinese: '洞', english: 'ZE-RO' },
        '1': { chinese: '幺', english: 'WUN' },
        '2': { chinese: '两', english: 'TOO' },
        '3': { chinese: '三', english: 'TREE' },
        '4': { chinese: '四', english: 'FOW-er' },
        '5': { chinese: '五', english: 'FIFE' },
        '6': { chinese: '六', english: 'SIX' },
        '7': { chinese: '拐', english: 'SEV-en' },
        '8': { chinese: '八', english: 'AIT' },
        '9': { chinese: '九', english: 'NIN-er' }
      };
      
      let chineseResult = '';
      let englishResult = '';
      
      for (let char of timeString) {
        if (numberMap[char]) {
          chineseResult += numberMap[char].chinese;
          englishResult += numberMap[char].english + ' ';
        }
      }
      
      const result = '时间: ' + input + '\n标准格式: ' + timeString + '\n中文读法: ' + chineseResult + '\n英文读法: ' + englishResult.trim();
      
      wx.showModal({
        title: '时间读法',
        content: result,
        showCancel: true,
        cancelText: '关闭',
        confirmText: '复制',
        success: function(res) {
          if (res.confirm) {
            wx.setClipboardData({
              data: result,
              success: function() {
                wx.showToast({
                  title: '已复制到剪贴板',
                  icon: 'success'
                });
              }
            });
          }
        }
      });
    } else {
      wx.showToast({
        title: '时间格式错误',
        icon: 'none'
      });
    }
  },
  
  
  // ==================== 紧急改变高度程序相关方法 ====================

  /**
   * 选择紧急程序类型
   * @param {Object} e 事件对象
   */
  selectEmergencyType: function(e) {
    var type = e.currentTarget.dataset.type;
    console.log('🚨 选择紧急程序类型:', type);
    
    this.setData({
      selectedEmergencyType: type,
      selectedProcedureStep: -1, // 重置步骤选择
      emergencyStepsExpanded: [] // 重置展开状态
    });
    
    // 更新页面标题
    var selectedCategory = null;
    for (var i = 0; i < this.data.emergencyData.categories.length; i++) {
      if (this.data.emergencyData.categories[i].id === type) {
        selectedCategory = this.data.emergencyData.categories[i];
        break;
      }
    }
    
    if (selectedCategory) {
      wx.setNavigationBarTitle({
        title: selectedCategory.title
      });
    }
  },

  /**
   * 切换程序步骤的展开状态
   * @param {Object} e 事件对象
   */
  toggleProcedureStep: function(e) {
    var stepIndex = e.currentTarget.dataset.step;
    var expandedSteps = this.data.emergencyStepsExpanded.slice(); // 复制数组
    
    var index = expandedSteps.indexOf(stepIndex);
    if (index > -1) {
      // 如果已展开，则折叠
      expandedSteps.splice(index, 1);
    } else {
      // 如果未展开，则展开
      expandedSteps.push(stepIndex);
    }
    
    this.setData({
      emergencyStepsExpanded: expandedSteps
    });
  },

  /**
   * 返回紧急程序主页面
   */
  backToEmergencyMain: function() {
    this.setData({
      selectedEmergencyType: '',
      selectedProcedureStep: -1,
      emergencyStepsExpanded: []
    });
    
    // 恢复页面标题
    wx.setNavigationBarTitle({
      title: '紧急改变高度'
    });
  },

  /**
   * 查看程序详细文档
   * @param {Object} e 事件对象
   */
  viewEmergencyDocument: function(e) {
    var type = e.currentTarget.dataset.type;
    var selectedCategory = null;
    
    for (var i = 0; i < this.data.emergencyData.categories.length; i++) {
      if (this.data.emergencyData.categories[i].id === type) {
        selectedCategory = this.data.emergencyData.categories[i];
        break;
      }
    }
    
    // 文档查看功能已移除，所有信息已整合在界面中
  },

  /**
   * 跳转到紧急改变高度独立页面
   */
  navigateToEmergencyAltitude: function() {
    wx.navigateTo({
      url: '/packageNav/emergency-altitude/index'
    });
  },

  /**
   * 紧急程序快速操作
   * @param {Object} e 事件对象
   */
  emergencyQuickAction: function(e) {
    var action = e.currentTarget.dataset.action;
    var type = e.currentTarget.dataset.type;
    
    switch (action) {
      case 'call-atc':
        wx.showModal({
          title: '通信联络',
          content: '立即联系空中交通管制：报告"要求天气偏离"或紧急情况',
          showCancel: false,
          confirmText: '知道了'
        });
        break;
      case 'emergency-frequency':
        wx.showModal({
          title: '紧急频率',
          content: '121.5 MHz - 国际应急频率\n123.45 MHz - 空对空备用频率',
          showCancel: false,
          confirmText: '知道了'
        });
        break;
      case 'altitude-table':
        this.showAltitudeReferenceTable(type);
        break;
      default:
        console.log('未知的快速操作:', action);
    }
  },

  /**
   * 显示高度参考表格
   * @param {String} type 程序类型
   */
  showAltitudeReferenceTable: function(type) {
    var selectedCategory = null;
    
    for (var i = 0; i < this.data.emergencyData.categories.length; i++) {
      if (this.data.emergencyData.categories[i].id === type) {
        selectedCategory = this.data.emergencyData.categories[i];
        break;
      }
    }
    
    if (selectedCategory && selectedCategory.altitudeTable) {
      var table = selectedCategory.altitudeTable;
      var content = table.title + '\n\n';
      
      // 构建表格内容
      for (var i = 0; i < table.rows.length; i++) {
        var row = table.rows[i];
        content += row[0] + ' | ' + row[1] + ' | ' + row[2] + '\n';
      }
      
      wx.showModal({
        title: '高度改变参考',
        content: content,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  // 广告事件处理
  adLoad() {
    console.log('横幅广告加载成功');
  },
  
  adError(err) {
    console.error('横幅广告加载失败', err);
  },
  
  adClose() {
    console.log('横幅广告关闭');
  },

  // 底部广告事件处理
  adLoadBottom() {
    console.log('底部横幅广告加载成功');
  },

  adErrorBottom(err) {
    console.error('底部横幅广告加载失败', err);
  },

  adCloseBottom() {
    console.log('底部横幅广告关闭');
  },

  // === 🎬 插屏广告相关方法 ===

  /**
   * 创建插屏广告实例（使用ad-helper统一管理）
   */
  createInterstitialAd: function() {
    this.data.interstitialAd = adHelper.setupInterstitialAd(this, '通信');
  },

  /**
   * 显示插屏广告（使用智能策略）
   * TabBar切换优化：2分钟间隔，每日最多20次
   */
  showInterstitialAdWithControl: function() {
    // 获取当前页面路径
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const route = currentPage.route || '';

    // 使用智能策略展示广告
    adHelper.showInterstitialAdWithStrategy(
      this.data.interstitialAd,
      route,  // 当前页面路径
      this,   // 页面上下文
      '通信'
    );
  },

  /**
   * 销毁插屏广告实例（使用ad-helper统一管理）
   */
  destroyInterstitialAd: function() {
    adHelper.cleanupInterstitialAd(this, '通信');
  },

  // 转发功能
  onShareAppMessage: function() {
    return {
      title: '飞行工具箱 - 通信',
      desc: '专业航空通信工具，支持航线录音、标准通信用语、通信规范等',
      path: '/pages/operations/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '航空通信工具',
      path: '/pages/operations/index'
    };
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));