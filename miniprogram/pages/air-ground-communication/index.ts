// 陆空通话助手页面
Page({
  data: {
    // 全局主题状态
    isDarkMode: false,
    
    // 页面导航状态
    selectedModule: '', // 当前选中的模块: 'airline-recordings', 'communication-rules'
    
    // 广告相关
    showAd: true,
    adUnitId: 'adunit-your-id-here',
    
    // 用户偏好设置
    userPreferences: {
      reduceAds: false
    },
    
    // 积分系统相关
    pointsData: {
      totalPoints: 0,
      dailyPoints: 0,
      hasSignedToday: false
    },
    
    // 搜索关键词
    searchKeyword: '',
    
    // 展开状态
    activeStandardCategories: [],
    
    
    // 航线录音相关数据
    continents: [],          // 大洲分组数据
    groupedRegions: [],      // 按大洲分组的地区数据
    regions: [],
    airports: [],
    recordingConfig: null,
    recordingCategories: [], // 新增：录音分类数据
    
    // 录音播放状态
    selectedRegion: '',
    selectedCategory: '', // 新增：选中的录音类型（进近、地面、放行、塔台）
    categoryClips: [], // 新增：当前类型的录音列表
    selectedAirport: '',
    filteredAirports: [],
    currentAirportClips: [],
    currentClipIndex: -1, // -1表示未选择任何录音
    currentClip: null,
    currentAudioSrc: '',
    
    // 播放器状态
    isPlaying: false,
    isLooping: false,
    volume: 80,
    showSubtitles: false, // 默认不显示字幕
    subtitleLang: 'cn', // 'en' or 'cn'
    audioContext: null,
    audioProgress: 0,
    
    // 学习状态管理
    learnedClips: [], // 已学会的录音ID列表
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
    ],
    
    // 通信规则数据 - 从分包加载
    communicationRules: null,
    
    // 通信规则页面状态
    selectedChapter: '',
    selectedSection: '',
    rulesSearchKeyword: '',
    activeRulesCategories: [],
    
    // 过滤后的通信规则
    filteredChapters: []
  },

  onLoad() {
    // 页面加载时初始化
    this.initializeData();
    // 设置初始导航栏标题
    wx.setNavigationBarTitle({
      title: '陆空通话助手'
    });
  },

  onShow() {
    // 页面显示时检查主题状态
    this.checkThemeStatus();
    
    // 刷新学习状态 - 当从播放页面返回时更新卡片状态
    this.refreshLearningStatus();
  },

  // 初始化数据
  initializeData() {
    // 这里可以从缓存加载用户偏好设置
    const userPreferences = wx.getStorageSync('userPreferences') || {};
    this.setData({
      userPreferences: {
        reduceAds: userPreferences.reduceAds || false
      },
      filteredAirports: this.data.airports
    });
    
    // 加载通信规则数据
    this.loadCommunicationRules();
    
    // 加载录音数据
    this.loadRecordingConfig();
  },

  // 从分包加载通信规则数据
  loadCommunicationRules() {
    wx.showLoading({
      title: '加载中...'
    });

    // 直接从主包加载数据
    const communicationRulesModule = require('../../utils/communication-rules.js');
    wx.hideLoading();
    
    // 处理加载成功的数据
    if (communicationRulesModule && communicationRulesModule.landAirCommunicationsData) {
      const rawData = communicationRulesModule.landAirCommunicationsData;
      
      // 转换数据格式为我们需要的格式
      const communicationRules = this.transformCommunicationData(rawData);
      
      this.setData({
        communicationRules,
        filteredChapters: communicationRules.chapters
      });
      
      console.log('✅ 成功从主包加载通信规则数据');
    } else {
      console.error('❌ 通信规则数据格式错误');
      this.setDefaultCommunicationRules();
    }
  },

  // 转换通信规则数据格式
  transformCommunicationData(rawData: any) {
    // 创建简化的数据结构
    const communicationRules = {
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
              id: "talking-requirements",
              title: "通话用语要求",
              icon: "🗣️",
              subsections: [
                {
                  id: "overview",
                  title: "通话概述",
                  content: [
                    "空中交通无线电通话用语应用于空中交通服务单位与航空器之间的话音联络。",
                    "它有自己特殊的发音规则，语言简洁、严谨，经过严格的缩减程序，通常为祈使句。",
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
          { altitude: "6000m", chinese: "六千", english: "SIX TOU-SAND METERS" },
          { altitude: "9000m", chinese: "九千", english: "NIN-er TOU-SAND METERS" },
          { altitude: "FL120", chinese: "高度层幺两洞", english: "FLIGHT LEVEL WUN TOO ZERO" },
          { altitude: "FL360", chinese: "高度层三六洞", english: "FLIGHT LEVEL TREE SIX ZERO" }
        ]
      }
    };

    // 如果有原始数据的章节，尝试解析
    if (rawData.chapters && Array.isArray(rawData.chapters)) {
      // 这里可以添加更复杂的数据转换逻辑
      console.log('原始数据包含', rawData.chapters.length, '个章节');
    }

    return communicationRules;
  },
  
  // 加载录音配置
  loadRecordingConfig() {
    console.log('🔄 开始加载录音配置...');
    const recordingModule = require('../../utils/audio-config.js');
    if (recordingModule && recordingModule.airlineRecordingsData) {
      const config = recordingModule.airlineRecordingsData;
      console.log('✅ 成功加载录音配置:', config);
      
      // 获取配置管理器实例
      const manager = recordingModule.audioConfigManager;
      
      // 获取分组后的数据
      const groupedRegions = manager.getGroupedRegions();
      
      // 直接使用内联的录音数据，不需要额外加载
      this.setData({
        continents: manager.getContinents(),
        groupedRegions: groupedRegions,
        regions: config.regions,
        airports: config.airports,  // 直接使用完整数据，包含 clips
        recordingConfig: config,
        filteredAirports: config.airports
      });
        
      console.log(`📍 配置了 ${config.regions.length} 个地区，${config.airports.length} 个机场`);
      
      // 输出每个机场的录音数量
      config.airports.forEach(airport => {
        console.log(`🏢 ${airport.name}: ${airport.clips.length}个录音`);
      });
      
      // 加载用户学习状态
      this.loadLearnedClips();
        
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
  generateClipId(clip: any, regionId: string) {
    return `${regionId}_${clip.mp3_file || clip.label}_${clip.full_transcript.slice(0, 20)}`;
  },
  
  // 检查录音是否已学会
  isClipLearned(clipId: string) {
    return this.data.learnedClips.includes(clipId);
  },
  
  // 切换录音学习状态
  toggleClipLearned(clipId: string) {
    const learnedClips = [...this.data.learnedClips];
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
  toggleShowLearnedNames(e: any) {
    const showLearnedNames = e.detail.value;
    this.setData({
      showLearnedNames: showLearnedNames
    });
  },
  
  // 切换录音学习状态（从界面触发）
  toggleLearnedStatus(e: any) {
    e.stopPropagation(); // 阻止事件冒泡
    const index = e.currentTarget.dataset.index;
    const clip = this.data.categoryClips[index];
    
    if (clip && clip.clipId) {
      // 切换学习状态
      this.toggleClipLearned(clip.clipId);
      
      // 更新categoryClips中的状态
      const updatedClips = [...this.data.categoryClips];
      updatedClips[index] = {
        ...updatedClips[index],
        isLearned: !updatedClips[index].isLearned
      };
      
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
      const updatedClips = this.data.categoryClips.map(clip => {
        const clipId = this.generateClipId(clip, this.data.selectedRegion);
        const isLearned = learnedClips.includes(clipId);
        console.log(`🔍 检查录音学习状态: ${clip.label} - ID: ${clipId} - 已学会: ${isLearned}`);
        return {
          ...clip,
          isLearned: isLearned,
          clipId: clipId
        };
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
      const updatedCurrentClip = {
        ...this.data.currentClip,
        isLearned: !this.data.currentClip.isLearned
      };
      
      // 更新categoryClips中的状态
      const updatedClips = [...this.data.categoryClips];
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

  // 选择地区
  selectRegion(e: any) {
    const regionId = e.currentTarget.dataset.region;
    
    // 获取该地区的所有录音
    const regionAirports = this.data.airports.filter(airport => airport.regionId === regionId);
    const allClips = regionAirports.reduce((clips, airport) => {
      return clips.concat(airport.clips || []);
    }, []);
    
    if (allClips.length > 0) {
      // 根据label自动分类
      const categories = this.getCategoriesFromClips(allClips);
      
      // 获取地区信息并更新导航栏标题
      const region = this.data.regions.find(r => r.id === regionId);
      const regionName = region ? `${region.flag} ${region.name}` : regionId;
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
    } else {
      wx.showToast({
        title: '暂无录音数据',
        icon: 'none'
      });
    }
  },
  
  // 从录音中提取分类信息
  getCategoriesFromClips(clips: any[]) {
    const categoryMap = new Map();
    
    clips.forEach(clip => {
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
  getCategoryIcon(label: string) {
    const iconMap: { [key: string]: string } = {
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
  getCategoryColor(label: string) {
    const colorMap: { [key: string]: string } = {
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
  selectCategory(e: any) {
    const categoryId = e.currentTarget.dataset.category;
    const category = this.data.recordingCategories.find(cat => cat.id === categoryId);
    
    if (category) {
      // 为每个录音添加学习状态
      const clipsWithLearningStatus = category.clips.map(clip => {
        const clipId = this.generateClipId(clip, this.data.selectedRegion);
        return {
          ...clip,
          isLearned: this.isClipLearned(clipId),
          clipId: clipId
        };
      });
      
      // 更新导航栏标题
      const region = this.data.regions.find(r => r.id === this.data.selectedRegion);
      const regionName = region ? `${region.flag} ${region.name}` : this.data.selectedRegion;
      wx.setNavigationBarTitle({
        title: `${regionName} - ${categoryId}`
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
    const region = this.data.regions.find(r => r.id === this.data.selectedRegion);
    const regionName = region ? `${region.flag} ${region.name}` : this.data.selectedRegion;
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
  selectAirport(e: any) {
    const airportId = e.currentTarget.dataset.airport;
    const airport = this.data.airports.find(airport => airport.id === airportId);
    
    console.log(`🏢 选择机场：${airportId}`);
    console.log(`📊 机场数据：`, airport);
    
    if (airport && airport.clips && airport.clips.length > 0) {
      console.log(`🎵 找到 ${airport.clips.length} 个录音`);
      
      this.setData({
        selectedAirport: airportId,
        currentAirportClips: airport.clips,
        currentClipIndex: 0,
        currentClip: airport.clips[0]
      });
      
      // 设置音频源
      this.setAudioSource(airport.clips[0], airportId);
    } else {
      console.warn(`⚠️ 机场 ${airportId} 没有录音数据`);
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
  setAudioSource(clip: any, airportId: string) {
    const airport = this.data.airports.find(a => a.id === airportId);
    if (airport && clip && clip.mp3_file) {
      // 根据机场ID确定正确的音频文件路径
      let audioPath = '';
      if (airportId === 'japan') {
        audioPath = `/packageJ/${clip.mp3_file}`;
      } else if (airportId === 'philippines') {
        audioPath = `/packageK/${clip.mp3_file}`;
      } else {
        // 默认使用配置的路径
        audioPath = `/packageI/${airport.audioPath}${clip.mp3_file}`;
      }
      
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
      
      console.log(`🎵 设置音频源：${audioPath}`);
    } else {
      console.error('❌ 设置音频源失败：找不到机场或录音文件');
    }
  },
  
  // 为分类录音设置音频源
  setAudioSourceForCategory(clip: any) {
    if (clip && clip.mp3_file) {
      // 根据当前选择的地区确定音频路径
      let audioPath = '';
      if (this.data.selectedRegion === 'japan') {
        audioPath = `/packageJ/${clip.mp3_file}`;
      } else if (this.data.selectedRegion === 'philippines') {
        audioPath = `/packageK/${clip.mp3_file}`;
      } else if (this.data.selectedRegion === 'germany') {
        audioPath = `/packageL/${clip.mp3_file}`;
      } else if (this.data.selectedRegion === 'usa') {
        audioPath = `/packageM/${clip.mp3_file}`;
      } else if (this.data.selectedRegion === 'australia') {
        audioPath = `/packageN/${clip.mp3_file}`;
      } else if (this.data.selectedRegion === 'south-africa') {
        audioPath = `/packageO/${clip.mp3_file}`;
      } else {
        // 默认路径
        audioPath = `/packageI/${clip.mp3_file}`;
      }
      
      console.log(`🎵 设置分类音频源：${audioPath}`);
      console.log(`🎵 录音信息：`, clip);
      
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
        title: `音频播放失败: ${error.errMsg || '未知错误'}`,
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
  selectClip(e: any) {
    const index = e.currentTarget.dataset.index;
    const clip = this.data.categoryClips[index];
    
    if (!clip) {
      wx.showToast({
        title: '录音数据错误',
        icon: 'none'
      });
      return;
    }
    
    // 停止当前播放
    if (this.data.audioContext) {
      this.data.audioContext.stop();
      this.data.audioContext.destroy();
      this.setData({ 
        audioContext: null,
        isPlaying: false 
      });
    }
    
    // 获取地区和分类信息
    const region = this.data.regions.find(r => r.id === this.data.selectedRegion);
    const regionName = region ? `${region.flag} ${region.name}` : this.data.selectedRegion;
    const categoryName = this.data.selectedCategory;
    
    // 准备传递给播放页面的数据
    const allClipsJson = encodeURIComponent(JSON.stringify(this.data.categoryClips));
    
    // 跳转到独立的音频播放页面
    wx.navigateTo({
      url: `/pages/audio-player/index?` + 
           `regionId=${this.data.selectedRegion}&` +
           `regionName=${encodeURIComponent(regionName)}&` +
           `categoryId=${this.data.selectedCategory}&` +
           `categoryName=${encodeURIComponent(categoryName)}&` +
           `clipIndex=${index}&` +
           `allClipsJson=${allClipsJson}`
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
    
    // 更新音频上下文的循环设置
    if (this.data.audioContext) {
      this.data.audioContext.loop = newLooping;
    }
  },
  
  // 音量调节
  onVolumeChange(e: any) {
    const volume = e.detail.value;
    this.setData({ volume });
    
    // 设置音量 (注意：小程序的audio组件不支持动态调节音量)
    wx.showToast({
      title: `音量: ${volume}%`,
      icon: 'none',
      duration: 1000
    });
  },
  
  // 切换字幕显示
  toggleSubtitles(e: any) {
    this.setData({
      showSubtitles: e.detail.value
    });
  },
  
  // 选择字幕语言
  selectSubtitleLang(e: any) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({
      subtitleLang: lang
    });
  },
  
  // 页面销毁时清理音频资源
  onUnload() {
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }
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

  // 检查主题状态
  checkThemeStatus() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
  },

  // 选择功能模块
  selectModule(e: any) {
    const module = e.currentTarget.dataset.module;
    this.setData({
      selectedModule: module
    });
    
    // 更新导航栏标题
    const titles: { [key: string]: string } = {
      'airline-recordings': '航线录音',
      'communication-rules': '通信规范'
    };
    wx.setNavigationBarTitle({
      title: titles[module] || '陆空通话助手'
    });
  },

  // 返回主页面
  backToMain() {
    this.setData({
      selectedModule: ''
    });
    // 恢复主页面标题
    wx.setNavigationBarTitle({
      title: '陆空通话助手'
    });
  },








  // 通信规则相关方法
  
  // 选择章节
  selectChapter(e: any) {
    const chapterId = e.currentTarget.dataset.chapterId;
    
    // 查找章节信息并设置导航栏标题
    const chapter = this.data.communicationRules?.chapters?.find(c => c.id === chapterId);
    if (chapter) {
      wx.setNavigationBarTitle({
        title: chapter.title
      });
    }
    
    this.setData({
      selectedChapter: chapterId,
      selectedSection: ''
    });
  },
  
  // 选择节
  selectSection(e: any) {
    const sectionId = e.currentTarget.dataset.sectionId;
    
    // 查找节信息并设置导航栏标题
    const chapter = this.data.communicationRules?.chapters?.find(c => c.id === this.data.selectedChapter);
    if (chapter) {
      const section = chapter.sections?.find(s => s.id === sectionId);
      if (section) {
        wx.setNavigationBarTitle({
          title: section.title
        });
      }
    }
    
    this.setData({
      selectedSection: sectionId
    });
  },
  
  // 返回章节列表
  backToChapters() {
    // 恢复通信规范标题
    wx.setNavigationBarTitle({
      title: '通信规范'
    });
    
    this.setData({
      selectedChapter: '',
      selectedSection: ''
    });
  },
  
  // 返回节列表
  backToSections() {
    // 恢复章节标题
    const chapter = this.data.communicationRules?.chapters?.find(c => c.id === this.data.selectedChapter);
    if (chapter) {
      wx.setNavigationBarTitle({
        title: chapter.title
      });
    }
    
    this.setData({
      selectedSection: ''
    });
  },
  
  // 通信规则搜索
  onRulesSearchInput(e: any) {
    const keyword = e.detail.value.toLowerCase();
    this.setData({ rulesSearchKeyword: keyword });
    this.filterCommunicationRules(keyword);
  },
  
  onRulesSearch(e: any) {
    const keyword = e.detail.value.toLowerCase();
    this.filterCommunicationRules(keyword);
  },
  
  // 过滤通信规则
  filterCommunicationRules(keyword: string) {
    if (!this.data.communicationRules || !this.data.communicationRules.chapters) {
      return;
    }
    
    if (!keyword) {
      this.setData({ filteredChapters: this.data.communicationRules.chapters });
      return;
    }
    
    const filtered = this.data.communicationRules.chapters.filter(chapter => {
      const titleMatch = chapter.title.toLowerCase().includes(keyword);
      const sectionMatch = chapter.sections && chapter.sections.some(section => 
        section.title.toLowerCase().includes(keyword) ||
        (section.subsections && section.subsections.some(subsection => 
          subsection.title.toLowerCase().includes(keyword) ||
          (subsection.content && subsection.content.some(content => content.toLowerCase().includes(keyword)))
        ))
      );
      return titleMatch || sectionMatch;
    });
    
    this.setData({ filteredChapters: filtered });
  },
  
  // 通信规则折叠面板变化
  onRulesChange(e: any) {
    this.setData({
      activeRulesCategories: e.detail
    });
  },
  
  // 复制通信规则内容
  copyRulesContent(e: any) {
    const content = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: content,
      success: () => {
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
      success: (res) => {
        if (res.confirm && res.content) {
          this.convertNumber(res.content);
        }
      }
    });
  },
  
  // 转换数字为通话读法
  convertNumber(input: string) {
    const numberMap: { [key: string]: { chinese: string, english: string } } = {
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
    
    const result = `输入: ${input}\n中文读法: ${chineseResult}\n英文读法: ${englishResult.trim()}`;
    
    wx.showModal({
      title: '转换结果',
      content: result,
      showCancel: true,
      cancelText: '关闭',
      confirmText: '复制',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: result,
            success: () => {
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
      success: (res) => {
        if (res.confirm && res.content) {
          this.convertAltitude(res.content);
        }
      }
    });
  },
  
  // 转换高度读法
  convertAltitude(input: string) {
    const commonAltitudes: { [key: string]: { chinese: string, english: string } } = {
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
      const result = `高度: ${input}\n中文读法: ${altitude.chinese}\n英文读法: ${altitude.english}`;
      
      wx.showModal({
        title: '高度读法',
        content: result,
        showCancel: true,
        cancelText: '关闭',
        confirmText: '复制',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: result,
              success: () => {
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
      success: (res) => {
        if (res.confirm && res.content) {
          this.convertTime(res.content);
        }
      }
    });
  },
  
  // 转换时间读法
  convertTime(input: string) {
    const timePattern = /^(\d{1,2}):(\d{2})$/;
    const match = input.match(timePattern);
    
    if (match) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2];
      const timeString = hours + minutes;
      
      const numberMap: { [key: string]: { chinese: string, english: string } } = {
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
      
      const result = `时间: ${input}\n标准格式: ${timeString}\n中文读法: ${chineseResult}\n英文读法: ${englishResult.trim()}`;
      
      wx.showModal({
        title: '时间读法',
        content: result,
        showCancel: true,
        cancelText: '关闭',
        confirmText: '复制',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: result,
              success: () => {
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
  
  // 快速查询
  openQuickReference() {
    wx.showActionSheet({
      itemList: ['数字读法表', '常用高度表', '字母读法表'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.showNumberReference();
            break;
          case 1:
            this.showAltitudeReference();
            break;
          case 2:
            this.showAlphabetReference();
            break;
        }
      }
    });
  },
  
  // 显示数字参考表
  showNumberReference() {
    if (!this.data.communicationRules || !this.data.communicationRules.quickReference) {
      wx.showToast({
        title: '数据加载中...',
        icon: 'none'
      });
      return;
    }
    
    const numbers = this.data.communicationRules.quickReference.numbers;
    let content = '数字读法参考表:\n\n';
    numbers.forEach(item => {
      content += `${item.digit}: ${item.chinese} (${item.english})\n`;
    });
    
    wx.showModal({
      title: '数字读法参考表',
      content: content,
      showCancel: false,
      confirmText: '知道了'
    });
  },
  
  // 显示高度参考表
  showAltitudeReference() {
    if (!this.data.communicationRules || !this.data.communicationRules.quickReference) {
      wx.showToast({
        title: '数据加载中...',
        icon: 'none'
      });
      return;
    }
    
    const altitudes = this.data.communicationRules.quickReference.commonAltitudes;
    let content = '常用高度读法:\n\n';
    altitudes.forEach(item => {
      content += `${item.altitude}: ${item.chinese}\n${item.english}\n\n`;
    });
    
    wx.showModal({
      title: '常用高度读法',
      content: content,
      showCancel: false,
      confirmText: '知道了'
    });
  },
  
  // 显示字母参考表
  showAlphabetReference() {
    const alphabet = this.data.icaoAlphabet.slice(0, 13); // 显示前13个字母
    let content = 'ICAO字母表（前13个）:\n\n';
    alphabet.forEach(item => {
      content += `${item.letter}: ${item.word} (${item.pronunciation})\n`;
    });
    content += '\n点击常用短语-通话规范查看完整表格';
    
    wx.showModal({
      title: 'ICAO字母表',
      content: content,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 广告相关方法
  onAdLoad() {
    console.log('广告加载成功');
  },

  onAdError(e: any) {
    console.error('广告加载失败:', e);
  }
});