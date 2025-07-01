// 我的首页页面
const pointsManagerUtil = require('../../utils/points-manager.js')
const AdManager = require('../../utils/ad-manager.js')
const warningHandlerUtil = require('../../utils/warning-handler.js')
import { TodoService } from '../../services/todo.service'

Page({
  // 飞行励志问候语库 - 100条温馨且富有哲理的飞行相关话语
  flightGreetings: [
    // 温馨问候类 (20条)
    '早安，天空在召唤',
    '上午好，愿您翱翔蓝天',
    '中午好，向云端进发',
    '下午好，飞行梦想永不止步',
    '晚上好，星空是最美的航线',
    '夜深了，但飞行精神永不眠',
    '新的一天，新的飞行征程',
    '愿您今天的飞行一切顺利',
    '天空因您而更加精彩',
    '飞行员，您是天空的守护者',
    '今天也要安全飞行哦',
    '蓝天白云正在等待您',
    '每一次起飞都是新的开始',
    '愿风向永远有利于您',
    '飞行路上，我们与您同在',
    '今天的天气很适合飞行',
    '天空是您最美的办公室',
    '愿您的每一次降落都完美',
    '飞行员的一天从这里开始',
    '祝您今天飞行愉快',

    // 哲理智慧类 (25条)
    '天空教会我们什么是无限可能',
    '每一次飞行都是对重力的优雅反抗',
    '真正的飞行员，心中永远有北极星',
    '飞行不仅是技术，更是艺术',
    '在云端之上，我们看到更广阔的世界',
    '飞行让我们明白：高度决定视野',
    '每一朵云都有它的故事，每一次飞行都有它的意义',
    '飞行员的勇气，来自对未知的敬畏与征服',
    '天空是世界上最大的教室',
    '飞行让我们学会与风同行，与云共舞',
    '在万米高空，我们更接近梦想',
    '飞行是人类对自由最执着的追求',
    '每一次起飞，都是对可能性的验证',
    '飞行员的眼中，没有不可能的航线',
    '天空告诉我们：距离从来不是问题',
    '飞行是科学与艺术的完美结合',
    '在云层之上，我们看到的是希望',
    '飞行让我们明白：方向比速度更重要',
    '每一次着陆，都是为了下一次更好的起飞',
    '飞行员的心中，永远有一片净土叫天空',
    '飞行教会我们：细节决定成败',
    '在高空中，我们学会谦逊与敬畏',
    '飞行是对精确与耐心的终极考验',
    '天空没有边界，梦想也没有边界',
    '飞行让我们懂得：安全永远是第一位',

    // 励志激励类 (25条)
    '今天又是征服天空的一天',
    '每一次飞行都让我们更加强大',
    '飞行员的使命：连接世界的每一个角落',
    '您的技能可以带人们安全回家',
    '飞行路上没有捷径，只有专业',
    '您的每一次起飞都承载着信任',
    '专业飞行员，天空因您而安全',
    '您是连接梦想与现实的桥梁',
    '飞行技能每天都在让您变得更好',
    '您的责任重于泰山，使命高于云端',
    '专业造就安全，安全成就信任',
    '您的双手掌握着乘客的生命',
    '每一次检查都可能避免一次意外',
    '飞行员的价值在于专业与责任',
    '您的经验是天空中最宝贵的财富',
    '坚持学习，永远保持飞行热情',
    '您的专业让家庭团聚成为可能',
    '飞行路上，专业是您最好的伙伴',
    '每一次培训都让您更加卓越',
    '您的技能让不可能变成可能',
    '飞行员的荣耀来自于责任的担当',
    '您是天空中最亮的星',
    '专业飞行，让世界变得更小',
    '您的使命是将安全写在天空',
    '每一次飞行都是对自己的超越',

    // 诗意美好类 (20条)
    '天空是一首永远写不完的诗',
    '飞行让我们在云端写下浪漫',
    '每一朵云都是天空的信笺',
    '飞行员是天空与大地的信使',
    '在高空中，我们与星辰对话',
    '云海之上，心灵得到净化',
    '飞行是人类最美的舞蹈',
    '天空的怀抱温暖而宽广',
    '每一次飞行都是一场美丽的邂逅',
    '云层之间，藏着最美的风景',
    '飞行让我们触摸到天空的心跳',
    '在万米高空，时间都变得诗意',
    '飞机划过天际，留下美丽的航迹',
    '天空的蓝是世界上最纯净的颜色',
    '飞行让我们成为天空的一部分',
    '云朵是天空送给飞行员的礼物',
    '在高空中，我们听到了风的歌声',
    '每一次起飞都是诗的开始',
    '飞行让平凡的日子变得不凡',
    '天空的广阔让心灵得到释放',

    // 实用温馨类 (10条)
    '记得检查今天的天气哦',
    '飞行前别忘了完成检查清单',
    '安全飞行，平安回家',
    '今天的NOTAM查看了吗',
    '愿您的飞行日志又添精彩一页',
    '记得保持与地面的良好沟通',
    '每一次飞行都要全力以赴',
    '飞行工具箱为您的安全护航',
    '专业的工具配专业的飞行员',
    '让我们一起守护天空的安全'
  ],

  data: {
    qualifications: [] as any[], // 资质数据
    greeting: '早上好', // 问候语
    
    // 积分系统相关数据
    userPoints: 0,
    canSignIn: false,
    signInStreak: 0,
    showPointsModal: false,
    showSignInModal: false,
    showPointsRulesModal: false,
    showProductPhilosophyModal: false, // 🎯 新增：产品理念弹窗
    signInResult: null as any,
    pointsTransactions: [] as any[],
    nextSignInReward: 15,
    lastPointsCheck: 0, // 用于检测积分更新
    pointsMonitorTimer: null as any, // 🎯 新增：积分监听定时器
    
    // 广告观看相关数据
    dailyAdCount: 0,
    currentAdReward: 40,
    remainingAdToday: 15,
    
    // 资质到期统计
    expiringSoonCount: 0,
    
    // 公众号相关数据
    showQRFallback: false, // 是否显示二维码备用方案
    showQRCodeModal: false, // 是否显示二维码弹窗

    // 🎯 基于Context7最佳实践：广告相关数据
    showAd: false,
    adUnitId: '',
    userPreferences: { reduceAds: false },
    
    // 减少广告倒计时相关数据
    reduceAdsExpireTime: 0, // 到期时间戳
    countdownTimer: null as any, // 倒计时定时器
    remainingTime: '', // 剩余时间显示文本
    isCountdownActive: false, // 倒计时是否激活
    countdownClass: '', // 倒计时样式类名

    // 🎯 新增：深色模式切换相关数据
    isDarkMode: false, // 当前是否为深色模式
    themeMode: 'auto', // 🎯 主题模式：'auto', 'light', 'dark' - 新用户默认跟随系统

    // 🎯 新增：页面级别激励视频广告管理器
    pageRewardedAdManager: null as any,

    // 🎯 新增：用户引导相关数据
    showUserGuide: false, // 是否显示用户引导
    
    // 新增：引导效果分析
    guideAnalytics: null,
    showAnalyticsModal: false,
    
    // 新增：个性化推荐
    personalizedRecommendations: [],
    showRecommendationsModal: false,

    // 🚀 离线数据状态
    offlineDataStatus: {
      totalPackages: 8,
      loadedPackages: 0,
      loadingProgress: 0,
      isAllLoaded: false,
      lastUpdateTime: 0
    },
    showOfflineStatusModal: false,

    // TODO待办清单相关数据
    todoStats: {
      total: 0,
      pending: 0,
      completed: 0,
      overdue: 0
    },
    recentTodos: [] as any[] // 最近的待办事项（用于首页预览）
  },

  // 🎯 新增：页面级广告管理器实例
  adManagerInstance: null as any,


  onLoad() {
    console.log('🎯 页面加载开始');
    
    // 初始化所有系统
    this.initPointsSystem();
    this.initAdSystem();
    this.initThemeMode();
    this.updateGreeting();
    this.setupContinuousPointsMonitoring();
    
    this.loadQualifications();
    this.loadTodoData();
    
    // 🎯 刷新减少广告倒计时状态
    this.refreshReduceAdsCountdown();
    
    // 🚀 检查离线数据状态
    this.checkOfflineDataStatus();
    
    // 🎯 基于官方文档：激励视频广告应该在onLoad中初始化，而不是onShow
    this.initPageRewardedAd();

    // 🎯 新增：检查是否需要显示用户引导
    this.checkUserGuide();
  },

  onShow() {
    console.log('🎯 页面显示');
    
    this.checkAndRefreshPoints();
    this.setupContinuousPointsMonitoring();
    
    this.loadQualifications();
    this.loadTodoData();
    
    // 🎯 刷新减少广告倒计时状态
    this.refreshReduceAdsCountdown();
    
    
    // 🔧 移除：不再在onShow中初始化激励视频广告，改为在onLoad中初始化
    // this.initPageRewardedAd(); // 已移至onLoad
  },

  // 检查并刷新积分 - 优化的积分更新检测
  checkAndRefreshPoints() {
    const lastPointsUpdate = wx.getStorageSync('points_updated') || 0;
    const lastCheck = this.data.lastPointsCheck || 0;
    
    if (lastPointsUpdate > lastCheck) {
      console.log('🎯 onShow检测到积分更新，立即刷新显示');
      this.setData({ lastPointsCheck: lastPointsUpdate });
      
      // 显示积分更新提示（如果是从广告回来）
      const timeDiff = Date.now() - lastPointsUpdate;
      if (timeDiff < 3000) { // 3秒内的更新认为是刚刚发生的
        wx.showToast({
          title: '积分已到账！',
          icon: 'success',
          duration: 1500
        });
      }
    }
    
    // 无论是否检测到更新，都刷新积分系统确保数据准确
    this.refreshPointsSystem();
    
    // 🎯 基于Context7最佳实践：重新加载广告偏好（避免重复初始化）
    this.loadAdPreferences();
  },

  onUnload() {
    // 🎯 基于Context7最佳实践：页面卸载时完全销毁广告实例
    try {
      if (this.adManagerInstance) {
        // 使用新的destroy方法完全清理实例
        this.adManagerInstance.destroy();
        this.adManagerInstance = null;
        console.log('✅ 页面卸载时广告实例销毁成功');
      }
    } catch (error) {
      console.warn('⚠️ 页面卸载时清理广告实例失败:', error);
    }
    
    // 🎯 新增：清理主题监听器，防止内存泄漏
    if (this.themeCleanup && typeof this.themeCleanup === 'function') {
      try {
        this.themeCleanup();
        console.log('🌙 主题监听器已清理');
      } catch (error) {
        console.warn('⚠️ 清理主题监听器时出错:', error);
      }
    }
    
    // 🎯 新增：清理积分监听定时器，防止内存泄漏
    if (this.data.pointsMonitorTimer) {
      clearInterval(this.data.pointsMonitorTimer);
      console.log('🎯 页面卸载时清理积分监听器');
    }
    
    // 🎯 新增：清理倒计时定时器，防止内存泄漏
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      console.log('🎯 页面卸载时清理倒计时定时器');
    }
    
    // 🎯 页面卸载时销毁激励视频广告实例
    if (this.data.pageRewardedAdManager) {
      this.data.pageRewardedAdManager.destroy();
      console.log('✅ 页面激励视频广告实例已销毁');
    }
  },

  // 更新问候语 - 基于Context7用户体验最佳实践
  updateGreeting() {
    // 飞行励志问候语库 - 100条温馨且富有哲理的飞行相关话语
    const flightGreetings = [
      // 温馨问候类 (20条)
      '早安，天空在召唤',
      '上午好，愿您翱翔蓝天',
      '中午好，向云端进发',
      '下午好，飞行梦想永不止步',
      '晚上好，星空是最美的航线',
      '夜深了，但飞行精神永不眠',
      '新的一天，新的飞行征程',
      '愿您今天的飞行一切顺利',
      '天空因您而更加精彩',
      '飞行员，您是天空的守护者',
      '今天也要安全飞行哦',
      '蓝天白云正在等待您',
      '每一次起飞都是新的开始',
      '愿风向永远有利于您',
      '飞行路上，我们与您同在',
      '今天的天气很适合飞行',
      '天空是您最美的办公室',
      '愿您的每一次降落都完美',
      '飞行员的一天从这里开始',
      '祝您今天飞行愉快',

      // 哲理智慧类 (25条)
      '天空教会我们什么是无限可能',
      '每一次飞行都是对重力的优雅反抗',
      '真正的飞行员，心中永远有北极星',
      '飞行不仅是技术，更是艺术',
      '在云端之上，我们看到更广阔的世界',
      '飞行让我们明白：高度决定视野',
      '每一朵云都有它的故事，每一次飞行都有它的意义',
      '飞行员的勇气，来自对未知的敬畏与征服',
      '天空是世界上最大的教室',
      '飞行让我们学会与风同行，与云共舞',
      '在万米高空，我们更接近梦想',
      '飞行是人类对自由最执着的追求',
      '每一次起飞，都是对可能性的验证',
      '飞行员的眼中，没有不可能的航线',
      '天空告诉我们：距离从来不是问题',
      '飞行是科学与艺术的完美结合',
      '在云层之上，我们看到的是希望',
      '飞行让我们明白：方向比速度更重要',
      '每一次着陆，都是为了下一次更好的起飞',
      '飞行员的心中，永远有一片净土叫天空',
      '飞行教会我们：细节决定成败',
      '在高空中，我们学会谦逊与敬畏',
      '飞行是对精确与耐心的终极考验',
      '天空没有边界，梦想也没有边界',
      '飞行让我们懂得：安全永远是第一位',

      // 励志激励类 (25条)
      '今天又是征服天空的一天',
      '每一次飞行都让我们更加强大',
      '飞行员的使命：连接世界的每一个角落',
      '您的技能可以带人们安全回家',
      '飞行路上没有捷径，只有专业',
      '您的每一次起飞都承载着信任',
      '专业飞行员，天空因您而安全',
      '您是连接梦想与现实的桥梁',
      '飞行技能每天都在让您变得更好',
      '您的责任重于泰山，使命高于云端',
      '专业造就安全，安全成就信任',
      '您的双手掌握着乘客的生命',
      '每一次检查都可能避免一次意外',
      '飞行员的价值在于专业与责任',
      '您的经验是天空中最宝贵的财富',
      '坚持学习，永远保持飞行热情',
      '您的专业让家庭团聚成为可能',
      '飞行路上，专业是您最好的伙伴',
      '每一次培训都让您更加卓越',
      '您的技能让不可能变成可能',
      '飞行员的荣耀来自于责任的担当',
      '您是天空中最亮的星',
      '专业飞行，让世界变得更小',
      '您的使命是将安全写在天空',
      '每一次飞行都是对自己的超越',

      // 诗意美好类 (20条)
      '天空是一首永远写不完的诗',
      '飞行让我们在云端写下浪漫',
      '每一朵云都是天空的信笺',
      '飞行员是天空与大地的信使',
      '在高空中，我们与星辰对话',
      '云海之上，心灵得到净化',
      '飞行是人类最美的舞蹈',
      '天空的怀抱温暖而宽广',
      '每一次飞行都是一场美丽的邂逅',
      '云层之间，藏着最美的风景',
      '飞行让我们触摸到天空的心跳',
      '在万米高空，时间都变得诗意',
      '飞机划过天际，留下美丽的航迹',
      '天空的蓝是世界上最纯净的颜色',
      '飞行让我们成为天空的一部分',
      '云朵是天空送给飞行员的礼物',
      '在高空中，我们听到了风的歌声',
      '每一次起飞都是诗的开始',
      '飞行让平凡的日子变得不凡',
      '天空的广阔让心灵得到释放',

      // 实用温馨类 (10条)
      '记得检查今天的天气哦',
      '飞行前别忘了完成检查清单',
      '安全飞行，平安回家',
      '今天的NOTAM查看了吗',
      '愿您的飞行日志又添精彩一页',
      '记得保持与地面的良好沟通',
      '每一次飞行都要全力以赴',
      '飞行工具箱为您的安全护航',
      '专业的工具配专业的飞行员',
      '让我们一起守护天空的安全'
    ];

    // 从100条飞行励志问候语中随机选择一条
    const randomIndex = Math.floor(Math.random() * flightGreetings.length);
    const greeting = flightGreetings[randomIndex];
    
    console.log(`🎯 随机选择问候语: ${greeting} (索引: ${randomIndex}/${flightGreetings.length})`);
    
    this.setData({ greeting });
  },

  // 初始化积分系统
  async initPointsSystem() {
    try {
      // 初始化用户（新用户会获得奖励）
      await pointsManagerUtil.initUser();
      
      // 加载积分数据
      this.refreshPointsSystem();
    } catch (error) {
      console.error('积分系统初始化失败:', error);
    }
  },

  // 初始化广告系统
  initAdSystem() {
    try {
      console.log('🎬 开始初始化页面广告系统...');
      
      // 🎯 修复：确保只创建一次广告管理器实例
      if (!this.adManagerInstance) {
        const AdManager = require('../../utils/ad-manager.js');
        this.adManagerInstance = new AdManager();
        console.log('✅ 广告管理器实例创建成功');
      } else {
        console.log('🎯 广告管理器实例已存在，跳过创建');
      }
      
      // 🎯 基于Context7最佳实践：简化广告初始化，由页面级的initAd方法处理
      this.initAd();
      console.log('✅ 广告系统初始化完成');
    } catch (error) {
      console.error('广告系统初始化失败:', error);
    }
  },

  // 刷新积分系统数据
  refreshPointsSystem() {
    try {
      const userPoints = pointsManagerUtil.getCurrentPoints();
      const signInStatus = pointsManagerUtil.getSignInStatus();
      const transactions = pointsManagerUtil.getTransactionHistory(100); // 限制最多100条记录
      const nextReward = pointsManagerUtil.getNextSignInReward((signInStatus.currentStreak || 0) + 1);
      
      // 获取广告奖励信息
      const adInfo = pointsManagerUtil.getNextAdRewardInfo();
      
      this.setData({
        userPoints,
        canSignIn: !signInStatus.hasSignedToday,
        signInStreak: signInStatus.currentStreak || 0,
        pointsTransactions: transactions,
        nextSignInReward: nextReward,
        
        // 广告相关数据 - 简化显示
        dailyAdCount: adInfo.currentCount,
        currentAdReward: adInfo.currentReward,
        remainingAdToday: adInfo.maxDailyCount - adInfo.currentCount
      });
    } catch (error) {
      console.error('刷新积分数据失败:', error);
    }
  },

  // 显示积分详情
  showPointsDetail() {
    this.setData({
      showPointsModal: true
    });
  },

  // 关闭积分详情
  closePointsModal() {
    this.setData({
      showPointsModal: false
    });
  },

  // 每日签到
  async dailySignIn() {
    try {
      console.log('🎯 开始签到流程');
      wx.showLoading({ title: '签到中...' });
      
      // 添加超时保护
      const signInPromise = pointsManagerUtil.dailySignIn();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('签到超时')), 10000); // 10秒超时
      });
      
      const result = await Promise.race([signInPromise, timeoutPromise]);
      
      console.log('🎯 签到结果:', result);
      wx.hideLoading();
      
      if (result.success) {
        // 计算下次签到预期积分
        const nextSignInReward = pointsManagerUtil.getNextSignInReward(result.streak + 1);
        
        this.setData({
          signInResult: {
            ...result,
            nextSignInReward: nextSignInReward,
            consecutiveDays: result.streak  // 确保使用正确的字段名
          },
          showSignInModal: true
        });
        
        // 刷新积分数据
        this.refreshPointsSystem();
      } else {
        // 签到失败（比如今天已签到）
        wx.showToast({
          title: result.message || '签到失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('签到失败:', error);
      
      let errorMessage = '签到失败，请重试';
      if (error.message === '签到超时') {
        errorMessage = '签到超时，请检查网络后重试';
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 关闭签到结果弹窗
  closeSignInModal() {
    this.setData({
      showSignInModal: false,
      signInResult: null
    });
  },

  // 显示积分规则
  showPointsRules() {
    this.setData({
      showPointsRulesModal: true
    });
  },

  // 关闭积分规则
  closePointsRulesModal() {
    this.setData({
      showPointsRulesModal: false
    });
  },

  // 🎯 新增：显示产品理念说明
  showProductPhilosophy() {
    this.setData({
      showProductPhilosophyModal: true
    });
  },

  // 🎯 新增：关闭产品理念说明
  closeProductPhilosophyModal() {
    this.setData({
      showProductPhilosophyModal: false
    });
  },

  // 🎯 新增：从产品理念弹窗跳转到公众号二维码
  showQRCodeFromPhilosophy() {
    // 先关闭产品理念弹窗
    this.setData({
      showProductPhilosophyModal: false
    });
    
    // 延迟打开公众号弹窗，确保动画流畅
    setTimeout(() => {
      this.setData({
        showQRCodeModal: true
      });
    }, 300);
  },

  // 观看广告获取积分 - 使用页面级别广告管理器
  async watchAdForPoints() {
    try {
      console.log('🎬 用户请求观看激励视频广告');
      
      // 🎯 离线状态友好提示
      const networkType = wx.getStorageSync('lastNetworkType') || 'unknown';
      if (networkType === 'none') {
        wx.showModal({
          title: '🛩️ 离线模式',
          content: '当前处于离线状态，无法观看广告获取积分。\n\n所有核心功能（换算、计算、查询）仍可正常使用。',
          showCancel: true,
          cancelText: '了解',
          confirmText: '查看积分',
          success: (res) => {
            if (res.confirm) {
              this.showPointsDetail();
            }
          }
        });
        return;
      }
      
      // 检查是否有页面级别的广告管理器
      const pageAdManager = this.data.pageRewardedAdManager;
      if (!pageAdManager) {
        console.log('❌ 页面级别广告管理器未初始化，尝试重新初始化...');
        this.initPageRewardedAd();
        
        wx.showModal({
          title: '广告初始化',
          content: '广告服务正在初始化，请稍候再试。',
          showCancel: false,
          confirmText: '我知道了'
        });
        return;
      }

      // 检查激励视频广告API支持
      if (!wx.createRewardedVideoAd) {
        console.log('❌ 当前环境不支持激励视频广告API');
        wx.showModal({
          title: '不支持广告',
          content: '当前环境不支持激励视频广告功能。在微信开发者工具中，广告功能可能无法正常工作，请在真机上测试。',
          showCancel: false,
          confirmText: '我知道了'
        });
        return;
      }
      
      // 🎯 继续使用前面已声明的 pageAdManager 变量
      
      // 🎯 新增：检查广告加载状态
      if (!pageAdManager.isLoaded) {
        console.log('⏳ 广告数据尚未加载完成，先进行预加载...');
        
        wx.showToast({
          title: '广告加载中，请稍候...',
          icon: 'loading',
          duration: 2000
        });
        
        // 尝试预加载，然后延迟显示
        pageAdManager.preload().then(() => {
          setTimeout(() => {
            this.watchAdForPoints(); // 递归调用，此时应该已经加载完成
          }, 1000);
        });
        return;
      }
      
      console.log('✅ 激励视频广告API支持检查通过');
      
      // 🎯 基于Context7最佳实践：简化广告检查，直接尝试显示
      console.log('🎬 广告单元选择成功，检查状态...');
      console.log('广告单元详情:', pageAdManager.currentAdUnit);
      
      // 检查广告状态（简化版本）
      console.log('🎬 当前广告状态:', {
        canShow: true, 
        isReady: true, 
        isLoading: false, 
        currentAdUnit: pageAdManager.currentAdUnit.name
      });
      
      // 设置积分刷新回调
      this.setupPointsRefreshCallback();
      
      // 🎯 使用页面级别广告管理器显示激励广告
      const result = await pageAdManager.show({
        source: 'others_page',
        context: '用户主动观看广告获取积分'
      });
      
      if (result.success) {
        console.log('✅ 广告展示成功，等待用户观看完成...');
        // 积分奖励将在广告观看完成后由页面广告管理器自动发放
        // 页面刷新将由积分更新回调处理
      } else {
        console.log('❌ 广告展示失败:', result.reason);
        
        // 🎯 基于Context7最佳实践：提供用户友好的错误处理
        if (result.error && result.error.errMsg) {
          const errMsg = result.error.errMsg;
          
          if (errMsg.includes('show() on the page where rewardedVideoAd is created')) {
            // 如果仍然出现页面限制错误，尝试重新初始化
            console.log('🔄 检测到页面限制错误，尝试重新初始化广告...');
            this.initPageRewardedAd();
            
            wx.showModal({
              title: '广告初始化',
              content: '广告服务正在重新初始化，请稍候再试。',
              showCancel: false,
              confirmText: '我知道了'
            });
          } else if (errMsg.includes('no advertisement data available')) {
            // 🎯 新增：针对广告数据未就绪的特殊处理
            wx.showModal({
              title: '广告加载中',
              content: '广告正在加载中，请稍等片刻后再试。系统已自动为您重新加载广告。',
              showCancel: false,
              confirmText: '我知道了'
            });
          } else {
            wx.showToast({
              title: result.reason || '广告加载失败',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          wx.showToast({
            title: result.reason || '广告加载失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
    } catch (error) {
      console.error('❌ 观看广告失败:', error);
      wx.showToast({
        title: '广告服务暂时不可用',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 🎯 优化：设置积分刷新回调，减少轮询频率
  setupPointsRefreshCallback() {
    const checkPointsUpdate = () => {
      const lastPointsUpdate = wx.getStorageSync('points_updated') || 0;
      const lastCheck = this.data.lastPointsCheck || 0;
      
      if (lastPointsUpdate > lastCheck) {
        console.log('🎯 检测到积分更新，刷新显示');
        this.setData({ lastPointsCheck: lastPointsUpdate });
        this.refreshPointsSystem();
        
        // 显示积分更新成功的视觉反馈
        wx.showToast({
          title: '积分已更新！',
          icon: 'success',
          duration: 1000
        });
        
        return true; // 停止检查
      }
      return false;
    };
    
    // 立即检查一次
    if (checkPointsUpdate()) return;
    
    // 🎯 优化：减少轮询频率，因为现在有直接回调机制
    // 只进行少量的兜底检查，主要依赖直接回调
    let checkCount = 0;
    const maxChecks = 10; // 减少到10次检查，总共5秒
    
    const timer = setInterval(() => {
      checkCount++;
      
      if (checkPointsUpdate() || checkCount >= maxChecks) {
        clearInterval(timer);
        if (checkCount >= maxChecks) {
          console.log('积分更新检查超时，进行兜底刷新');
          this.refreshPointsSystem();
        }
      }
    }, 500); // 统一使用500ms间隔
  },



  // 格式化积分变动类型
  formatTransactionType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'new_user': '新用户奖励',
      'ad_watch': '观看广告',
      'signin_normal': '每日签到',
      'signin_streak_2': '连续签到奖励',
      'signin_streak_7': '连续签到奖励',
      'signin_streak_30': '连续签到奖励',
      'consume': '功能使用',
      'event-report': '事件报告',
      'snowtam-decoder': '雪情通告',
      'dangerous-goods': '危险品查询',
      'twin-engine-goaround': '双发复飞梯度',
      'sunrise-sunset': '夜航时间计算',
      'flight-time-share': '分飞行时间',
      'personal-checklist': '个人检查单',
      'qualification-manager': '资质管理',
      'unit-converter': '常用换算',
      'aviation-calculator': '特殊计算',
      'abbreviations': '万能查询',
      'flight-calc': '飞行速算'
    };
    return typeMap[type] || type;
  },

  // 格式化时间
  formatTransactionTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString();
    }
  },

  // 检查并消费积分的通用方法
  async checkAndConsumePoints(feature: string, action: () => void) {
    try {
      const result = await pointsManagerUtil.consumePoints(feature, `使用${this.getFeatureName(feature)}功能`);
      
      if (result.success) {
        // 积分消费成功，执行功能
        action();
        
        // 更新积分显示
        this.refreshPointsSystem();
        
        // 显示消费提示
        wx.showToast({
          title: `${result.message}`,
          icon: 'success',
          duration: 2000
        });
      } else {
        // 积分不足，显示获取积分选项
        this.showInsufficientPointsModal(result);
      }
    } catch (error) {
      console.error('积分检查失败:', error);
      wx.showToast({
        title: '功能暂时不可用',
        icon: 'none'
      });
    }
  },

  // 显示积分不足弹窗
  showInsufficientPointsModal(result: any) {
    // 🎯 简化离线状态检查
    const networkType = wx.getStorageSync('lastNetworkType') || 'unknown';
    const isOffline = networkType === 'none';
    
    let content = `${result.message}\n\n获取积分方式：\n• 在本页面点击【签到】按钮`;
    
    if (isOffline) {
      content += '\n• 当前处于离线状态，恢复网络后可观看广告获取积分\n\n🛩️ 注意：所有核心功能（换算、计算、查询）在离线状态下仍可正常使用';
    } else {
      content += '\n• 点击任意页面的【观看广告】按钮\n• 前往其他功能页面观看广告';
    }
    
    wx.showModal({
      title: '积分不足',
      content: content,
      confirmText: this.data.canSignIn ? '去签到' : (isOffline ? '了解' : '看广告'),
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          if (this.data.canSignIn) {
            // 优先引导签到
            this.dailySignIn();
          } else if (!isOffline) {
            // 已签到且在线，引导观看广告
            this.watchAdForPoints();
          }
          // 离线状态下，点击确认按钮不执行任何操作，只是为了关闭弹窗
        }
      }
    });
  },

  // 获取功能名称
  getFeatureName(feature: string): string {
    const featureNames: { [key: string]: string } = {
      'event-report': '事件样例',
      'snowtam-decoder': '雪情通告',
      'dangerous-goods': '危险品查询',
      'twin-engine-goaround': '双发复飞梯度',
      'long-flight-crew-rotation': '长航线换班',
      'sunrise-sunset': '夜航时间计算',
      'flight-time-share': '分飞行时间',
      'personal-checklist': '个人检查单',
      'qualification-manager': '资质管理'
    };
    return featureNames[feature] || feature;
  },

  // 加载资质数据
  loadQualifications() {
    try {
      const qualifications = wx.getStorageSync('pilot_qualifications_v2') || [];
      
      if (qualifications.length > 0) {
        // 更新资质状态
        const updatedQualifications = this.updateQualificationStatus(qualifications);
        
        // 只显示启用了提醒的资质
        const enabledQualifications = updatedQualifications.filter(q => 
          q.reminderEnabled !== false
        );
        
        // 计算即将到期的资质数量（30天内到期或已过期）
        const expiringSoonCount = enabledQualifications.filter(q => 
          q.status === 'warning' || q.status === 'expired'
        ).length;
        
        this.setData({ 
          qualifications: enabledQualifications,
          expiringSoonCount: expiringSoonCount
        });
        
        // 检查并显示提醒
        this.checkExpiringQualifications(updatedQualifications);
      } else {
        this.setData({ qualifications: [] });
      }
    } catch (error) {
      console.error('加载资质数据失败:', error);
      this.setData({ qualifications: [] });
    }
  },

  // 更新资质状态
  updateQualificationStatus(qualifications: any[]) {
    const today = new Date();
    
    return qualifications.map(qual => {
      let status = 'valid';
      let daysRemaining = 0;
      let currentCount = 0;
      let calculatedExpiryDate = '';
      
      if (qual.mode === 'daily') {
        // X天Y次模式
        const records = qual.records || [];
        const period = qual.dailyPeriod || 90;
        const required = qual.dailyRequired || 3;
        
        // 按日期排序，最新的在前面
        const sortedRecords = records.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // 累计最新的Y次活动
        let accumulatedCount = 0;
        const recentRecordsForRequired: any[] = [];
        
        for (const record of sortedRecords) {
          const recordCount = Number(record.count) || 0;
          if (accumulatedCount + recordCount <= required) {
            recentRecordsForRequired.push(record);
            accumulatedCount += recordCount;
          } else if (accumulatedCount < required) {
            recentRecordsForRequired.push(record);
            accumulatedCount = required;
            break;
          } else {
            break;
          }
        }
        
        currentCount = accumulatedCount;
        
        if (currentCount < required) {
          status = 'expired';
          daysRemaining = -1;
          calculatedExpiryDate = '不达标';
        } else {
          if (recentRecordsForRequired.length > 0) {
            const oldestRecord = recentRecordsForRequired.sort((a: any, b: any) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )[0];
            
            if (oldestRecord) {
              const oldestDate = new Date(oldestRecord.date);
              const expiryDate = new Date(oldestDate.getTime() + period * 24 * 60 * 60 * 1000);
              daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              calculatedExpiryDate = this.formatDate(expiryDate);
              
              if (daysRemaining <= 0) {
                status = 'expired';
              } else if (daysRemaining <= (qual.warningDays || 30)) {
                status = 'warning';
              }
            }
          }
        }
        
      } else if (qual.mode === 'monthly') {
        // X月Y次模式
        const records = qual.records || [];
        const period = (qual.monthlyPeriod || 12) * 30;
        const required = qual.monthlyRequired || 2;
        
        // 使用与日周期相同的逻辑
        const sortedRecords = records.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        let accumulatedCount = 0;
        const recentRecordsForRequired: any[] = [];
        
        for (const record of sortedRecords) {
          const recordCount = Number(record.count) || 0;
          if (accumulatedCount + recordCount <= required) {
            recentRecordsForRequired.push(record);
            accumulatedCount += recordCount;
          } else if (accumulatedCount < required) {
            recentRecordsForRequired.push(record);
            accumulatedCount = required;
            break;
          } else {
            break;
          }
        }
        
        currentCount = accumulatedCount;
        
        if (currentCount < required) {
          status = 'expired';
          daysRemaining = -1;
          calculatedExpiryDate = '不达标';
        } else {
          if (recentRecordsForRequired.length > 0) {
            const oldestRecord = recentRecordsForRequired.sort((a: any, b: any) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )[0];
            
            if (oldestRecord) {
              const oldestDate = new Date(oldestRecord.date);
              const expiryDate = new Date(oldestDate.getTime() + period * 24 * 60 * 60 * 1000);
              daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              calculatedExpiryDate = this.formatDate(expiryDate);
              
              if (daysRemaining <= 0) {
                status = 'expired';
              } else if (daysRemaining <= (qual.warningDays || 30)) {
                status = 'warning';
              }
            }
          }
        }
        
      } else if (qual.mode === 'expiry') {
        // 到期日期模式
        if (qual.expiryDate) {
          const expiryDate = new Date(qual.expiryDate);
          daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          calculatedExpiryDate = qual.expiryDate;
          
          if (daysRemaining <= 0) {
            status = 'expired';
          } else if (daysRemaining <= (qual.warningDays || 30)) {
            status = 'warning';
          }
        }
      }
      
      return { 
        ...qual, 
        status,
        daysRemaining,
        currentCount,
        calculatedExpiryDate
      };
    });
  },

  // 检查即将到期的资质并提醒
  checkExpiringQualifications(qualifications: any[]) {
    const expiringQuals = qualifications.filter(q => 
      (q.status === 'warning' || q.status === 'expired') && 
      q.reminderEnabled !== false // 只显示启用提醒的资质
    );
    
    if (expiringQuals.length > 0) {
      // 检查是否今天已经提醒过
      const lastReminderDate = wx.getStorageSync('lastReminderDate') || '';
      const today = new Date().toDateString();
      
      if (lastReminderDate !== today) {
        const message = expiringQuals.map(q => {
          if (q.daysRemaining > 0) {
            return `${q.name}: 还剩${q.daysRemaining}天`;
          } else if (q.daysRemaining === 0) {
            return `${q.name}: 今天到期`;
          } else {
            return `${q.name}: 已过期`;
          }
        }).join('\n');
        
        wx.showModal({
          title: '⚠️ 资质提醒',
          content: `您有${expiringQuals.length}个资质需要关注：\n\n${message}`,
          confirmText: '查看详情',
          cancelText: '知道了',
          success: (res) => {
            if (res.confirm) {
              this.openQualificationManager();
            }
          }
        });
        
        // 记录今天已经提醒过
        wx.setStorageSync('lastReminderDate', today);
      }
    }
  },

  // 格式化日期
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  },

  // 快捷工具方法
  openEventReport() {
    this.checkAndConsumePoints('event-report', () => {
      wx.navigateTo({
        url: '/pages/event-report/index'
      });
    });
  },

  openPersonalChecklist() {
    // 免费功能，无需积分检查
    wx.navigateTo({
      url: '/pages/personal-checklist/index'
    });
  },

  openFlightTimeShare() {
    this.checkAndConsumePoints('flight-time-share', () => {
      wx.navigateTo({
        url: '/pages/flight-time-share/index'
      });
    });
  },

  // 新增：雪情通告解码器
  openSnowtamDecoder() {
    this.checkAndConsumePoints('snowtam-decoder', () => {
      wx.navigateTo({
        url: '/pages/snowtam-decoder/index'
      });
    });
  },

  // 新增：打开日出日落时间查询（进入页面时扣费）
  openSunriseOnly() {
    wx.navigateTo({
      url: '/pages/sunrise-sunset-only/index'
    });
  },

  // 新增：打开夜航时间计算页面（进入页面时扣费）
  openSunriseSunset() {
    wx.navigateTo({
      url: '/pages/sunrise-sunset/index'
    });
  },

  // 新增：资质管理
  openQualificationManager() {
    // 免费功能，无需积分检查
    wx.navigateTo({
      url: '/pages/qualification-manager/index'
    });
  },

  // TODO待办清单管理
  openTodoManager() {
    // 免费功能，无需积分检查
    wx.navigateTo({
      url: '/pages/todo-manager/index'
    });
  },

  // 加载TODO数据
  loadTodoData() {
    try {
      const stats = TodoService.getTodoStats();
      const recentTodos = TodoService.getAllTodos().slice(0, 3); // 获取最近3个待办事项用于预览
      
      this.setData({
        todoStats: stats,
        recentTodos: recentTodos
      });
      
      console.log('📋 TODO数据加载完成:', { stats, recentTodosCount: recentTodos.length });
    } catch (error) {
      console.error('加载TODO数据失败:', error);
    }
  },

  // 格式化TODO日期显示
  formatTodoDate(dateStr: string): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateOnly.getTime() === today.getTime()) {
      return '今天';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
      return '明天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  },

  // 🎯 基于Context7最佳实践：长航线换班（进入时扣3积分）
  openLongFlightCrewRotation() {
    this.checkAndConsumePoints('long-flight-crew-rotation', () => {
      wx.navigateTo({
        url: '/pages/long-flight-crew-rotation/index'
      });
    });
  },

  // 新增：危险品查询
  openDangerousGoods() {
    this.checkAndConsumePoints('dangerous-goods', () => {
      wx.navigateTo({
        url: '/pages/dangerous-goods/index'
      });
    });
  },

  // 新增：双发复飞梯度
  openTwinEngineGoAround() {
    this.checkAndConsumePoints('twin-engine-goaround', () => {
      wx.navigateTo({
        url: '/pages/twin-engine-goaround/index'
      });
    });
  },

  // 应用信息方法
  feedback() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的宝贵建议！\n请在"飞行播客"公众号内反馈\n我会认真对待每一条建议',
      confirmText: '知道了',
      showCancel: false
    })
  },

  aboutUs() {
    wx.showModal({
      title: '关于作者',
      content: '作者：虎大王\n\n作为一名飞行员，我深知大家在日常工作中遇到的各种痛点：计算复杂、查询繁琐、工具分散。\n\n为了帮助飞行员朋友们更高效地解决这些问题，我开发了这款小程序，集成了最实用的飞行工具。\n\n希望能为大家的飞行工作带来便利！',
      showCancel: false,
      confirmText: '了解了'
    });
  },

  onShareAppMessage() {
    return {
      title: '飞行小工具 - 我的首页',
      path: '/pages/others/index'
    }
  },

  onShareTimeline() {
    return {
      title: '飞行工具箱 - 专业飞行工具集合',
      imageUrl: '/images/share-timeline.png'
    }
  },

  // 公众号组件加载成功
  onOfficialAccountLoad(e: any) {
    console.log('✅ 公众号组件加载成功:', e);
    // 组件加载成功，隐藏备用方案
    this.setData({
      showQRFallback: false
    });
  },

  // 公众号组件加载失败
  onOfficialAccountError(e: any) {
    console.log('❌ 公众号组件加载失败:', e);
    // 组件加载失败，显示备用方案
    this.setData({
      showQRFallback: true
    });
    
    // 记录错误信息便于调试
    console.log('公众号组件错误:', {
      error: e.detail || 'unknown_error',
      scene: 'others_page'
    });
  },

  // 显示二维码弹窗
  showQRCodeModal() {
    this.setData({
      showQRCodeModal: true
    });
  },

  // 关闭二维码弹窗
  closeQRCodeModal() {
    this.setData({
      showQRCodeModal: false
    });
  },

  // 显示二维码图片
  showQRCodeImage() {
    // 可以预览公众号二维码图片
    wx.previewImage({
      urls: ['/images/OfficialAccount.png'], // 公众号二维码图片
      success: () => {
        console.log('显示公众号二维码');
      },
      fail: () => {
        // 如果没有二维码图片，显示提示
        wx.showToast({
          title: '请在微信中搜索"飞行播客"',
          icon: 'none',
          duration: 3000
        });
      }
    });
  },

  // 预览二维码
  previewQRCode() {
    wx.previewImage({
      urls: ['/images/OfficialAccount.png'],
      current: '/images/OfficialAccount.png',
      success: () => {
        console.log('✅ 预览公众号二维码');
        // 埋点记录用户查看二维码
        console.log('预览二维码:', {
          scene: 'others_page',
          official_account: 'flight_podcast'
        });
      },
      fail: (err) => {
        console.log('❌ 二维码预览失败:', err);
        // 备用方案：显示复制ID提示
        wx.showModal({
          title: '关注飞行播客',
          content: '可在微信中搜索公众号"飞行播客"',
          showCancel: true,
          cancelText: '取消',
          confirmText: '复制ID',
          success: (res) => {
            if (res.confirm) {
              this.copyOfficialAccountId();
            }
          }
        });
      }
    });
  },

  // 跳转公众号（先询问用户确认）
  jumpToOfficialAccount() {
    wx.showModal({
      title: '关注飞行播客',
      content: '是否要跳转到"飞行播客"公众号？\n（将在微信中打开公众号页面）',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确认跳转',
      success: (res) => {
        if (res.confirm) {
          // 用户确认跳转，尝试使用最新API
          try {
            (wx as any).openOfficialAccountProfile({
              username: '飞行播客',
              success: () => {
                console.log('✅ 成功跳转到公众号');
                wx.showToast({
                  title: '跳转成功',
                  icon: 'success',
                  duration: 1500
                });
              },
              fail: () => {
                console.log('❌ 跳转失败，显示二维码');
                this.showQRCodeModal();
              }
            });
          } catch (error) {
            console.log('❌ API不支持，显示二维码');
            this.showQRCodeModal();
          }
        }
        // 如果用户点击取消，什么都不做
      }
    });
  },

  // 复制公众号ID
  copyOfficialAccountId() {
    wx.setClipboardData({
      data: '飞行播客',
      success: () => {
        wx.showToast({
          title: '公众号ID已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  // 提示用户搜索公众号
  searchOfficialAccount() {
    wx.showModal({
      title: '关注公众号',
              content: '请在微信中搜索"飞行播客"来关注我的公众号。',
      showCancel: true,
      cancelText: '取消',
      confirmText: '复制ID',
      success: (res) => {
        if (res.confirm) {
          this.copyOfficialAccountId();
        }
      }
    });
  },

  // 🎯 新增：设置持续监听机制，确保捕获延迟的积分更新
  setupContinuousPointsMonitoring() {
    // 清除之前的监听器，避免重复监听
    if (this.data.pointsMonitorTimer) {
      clearInterval(this.data.pointsMonitorTimer);
    }
    
    // 设置持续监听，每3秒检查一次积分更新
    const timer = setInterval(() => {
      const lastPointsUpdate = wx.getStorageSync('points_updated') || 0;
      const lastCheck = this.data.lastPointsCheck || 0;
      
      if (lastPointsUpdate > lastCheck) {
        console.log('🎯 持续监听检测到积分更新，立即刷新显示');
        this.setData({ lastPointsCheck: lastPointsUpdate });
        this.refreshPointsSystem();
        
        // 显示积分更新提示
        wx.showToast({
          title: '积分已更新！',
          icon: 'success',
          duration: 1500
        });
        
        // 更新成功后清除定时器，避免重复检查
        clearInterval(this.data.pointsMonitorTimer);
        this.setData({ pointsMonitorTimer: null });
      }
    }, 3000); // 每3秒检查一次
    
    // 保存定时器引用到data中
    this.setData({ pointsMonitorTimer: timer });
    
    // 设置最大监听时长为30秒，避免无限监听
    setTimeout(() => {
      if (this.data.pointsMonitorTimer) {
        clearInterval(this.data.pointsMonitorTimer);
        this.setData({ pointsMonitorTimer: null });
        console.log('🎯 积分监听器已自动清理（30秒超时）');
      }
    }, 30000);
  },

  // 🎯 基于Context7最佳实践：广告相关方法
  
  // 初始化广告
  initAd() {
    try {
      // 🎯 使用页面级广告管理器实例，避免重复创建
      const adManager = this.adManagerInstance;
      if (!adManager) {
        console.log('🎯 广告管理器未初始化，跳过自定义广告初始化');
        this.setData({ showAd: false });
        return;
      }
      
      this.loadAdPreferences();
      
      const adUnit = adManager.getBestAdUnit('tool');
      
      if (adUnit) {
        this.setData({
          showAd: true,
          adUnitId: adUnit.id
        });
        
        console.log('🎯 我的首页页面：广告初始化成功', adUnit);
      } else {
        console.log('🎯 我的首页页面：无适合的广告单元或用户偏好设置');
        this.setData({ showAd: false });
      }
    } catch (error) {
      console.log('🎯 广告初始化失败:', error);
      this.setData({ showAd: false });
    }
  },

  // 加载用户广告偏好
  loadAdPreferences() {
    try {
      // 🎯 使用页面级广告管理器实例，避免重复创建
      const adManager = this.adManagerInstance;
      if (!adManager) {
        console.log('🎯 广告管理器未初始化，使用默认偏好');
        this.setData({ userPreferences: { reduceAds: false } });
        return;
      }
      
      const preferences = adManager.getUserPreferences();
      this.setData({ userPreferences: preferences });
    } catch (error) {
      console.log('🎯 加载广告偏好失败:', error);
      this.setData({ userPreferences: { reduceAds: false } });
    }
  },

  // 处理减少广告开关变化
  async onReduceAdsChange(event: any) {
    const reduceAds = event.detail;
    
    if (reduceAds) {
      // 开启减少广告 - 显示确认弹窗
      wx.showModal({
        title: '开启减少广告显示',
        content: '开启此功能将消耗50积分，24小时内减少广告显示频率。是否确认开启？',
        showCancel: true,
        cancelText: '取消',
        confirmText: '确认开启',
        success: async (res) => {
          if (res.confirm) {
            // 用户确认，执行开启
            await this.activateReduceAds();
          } else {
            // 用户取消，重置开关状态
            this.setData({
              'userPreferences.reduceAds': false
            });
          }
        }
      });
    } else {
      // 关闭减少广告
      await this.deactivateReduceAds();
    }
  },

  // 广告加载成功回调
  onAdLoad() {
    try {
      // 🎯 使用页面级广告管理器实例，避免重复创建
      const adManager = this.adManagerInstance;
      if (adManager) {
        adManager.recordAdShown(this.data.adUnitId);
        console.log('🎯 我的首页页面：广告加载成功');
      }
    } catch (error) {
      console.log('🎯 记录广告显示失败:', error);
    }
  },

  // 广告加载失败回调
  onAdError(err: any) {
    console.log('🎯 我的首页页面：广告加载失败，优雅降级', err);
    this.setData({ showAd: false });
  },

  // 🎯 基于Context7最佳实践：减少广告倒计时功能
  
  // 初始化减少广告倒计时
  initReduceAdsCountdown() {
    const expireTime = wx.getStorageSync('reduceAdsExpireTime') || 0;
    const currentTime = Date.now();
    
    if (expireTime > currentTime) {
      // 还在有效期内
      this.setData({
        reduceAdsExpireTime: expireTime,
        'userPreferences.reduceAds': true,
        isCountdownActive: true
      });
      this.startCountdown();
      console.log('🎯 减少广告功能仍在有效期内，启动倒计时');
    } else if (expireTime > 0) {
      // 已过期，清理状态
      this.clearReduceAdsStatus();
      console.log('🎯 减少广告功能已过期，清理状态');
    }
  },
  
  // 刷新减少广告倒计时状态
  refreshReduceAdsCountdown() {
    if (this.data.isCountdownActive) {
      this.updateCountdownDisplay();
    }
  },
  
  // 激活减少广告功能
  async activateReduceAds() {
    const REDUCE_ADS_COST = 50; // 固定扣除50积分
    const DURATION_HOURS = 24; // 24小时有效期
    
    try {
      // 检查积分是否足够
      const pointsManager = require('../../utils/points-manager.js');
      const currentPoints = pointsManager.getCurrentPoints();
      
      if (currentPoints < REDUCE_ADS_COST) {
        wx.showModal({
          title: '积分不足',
          content: `开启"减少广告显示"需要${REDUCE_ADS_COST}积分，您当前积分：${currentPoints}`,
          showCancel: true,
          cancelText: '取消',
          confirmText: '获取积分',
          success: (res) => {
            if (res.confirm) {
              this.showPointsDetail(); // 显示积分获取方式
            }
            // 重置开关状态
            this.setData({
              'userPreferences.reduceAds': false
            });
          }
        });
        return;
      }
      
      // 扣除积分 - 直接扣除指定数量的积分
      const currentPointsAfterCheck = pointsManager.getCurrentPoints();
      const newPoints = currentPointsAfterCheck - REDUCE_ADS_COST;
      
      // 手动扣除积分并记录
      wx.setStorageSync('flight_toolbox_points', newPoints);
      
      // 记录交易日志
      pointsManager.logPointsTransaction({
        type: 'consume',
        amount: -REDUCE_ADS_COST,
        feature: 'reduce_ads',
        description: '减少广告显示',
        balanceAfter: newPoints,
        timestamp: new Date().getTime()
      });
      
      const success = true;
      
      if (success) {
        // 设置24小时后过期
        const expireTime = Date.now() + (DURATION_HOURS * 60 * 60 * 1000);
        wx.setStorageSync('reduceAdsExpireTime', expireTime);
        
        // 更新状态
        this.setData({
          reduceAdsExpireTime: expireTime,
          'userPreferences.reduceAds': true,
          isCountdownActive: true
        });
        
        // 更新广告管理器偏好
        try {
          // 🎯 使用页面级广告管理器实例，避免重复创建
          const adManager = this.adManagerInstance;
          if (adManager) {
            adManager.updateUserPreferences({ 
              reduceAds: true,
              reduceAdsExpireTime: expireTime 
            });
            console.log('🎯 已更新广告偏好：减少广告=true，到期时间=', new Date(expireTime).toLocaleString());
          }
        } catch (error) {
          console.log('🎯 更新广告偏好失败:', error);
        }
        
        // 启动倒计时
        this.startCountdown();
        
        // 重新初始化广告
        this.initAd();
        
        // 刷新积分显示
        this.refreshPointsSystem();
        
        wx.showToast({
          title: `已开启24小时减少广告（-${REDUCE_ADS_COST}积分）`,
          icon: 'success',
          duration: 3000
        });
        
        console.log('🎯 减少广告功能已激活，扣除积分:', REDUCE_ADS_COST);
      } else {
        // 扣除失败，重置开关
        this.setData({
          'userPreferences.reduceAds': false
        });
        wx.showToast({
          title: '积分扣除失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('激活减少广告功能失败:', error);
      this.setData({
        'userPreferences.reduceAds': false
      });
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },
  
  // 关闭减少广告功能
  async deactivateReduceAds() {
    this.clearReduceAdsStatus();
    
    // 🎯 修复：更新广告管理器偏好，使用页面级实例
    try {
      const adManager = this.adManagerInstance;
      if (adManager) {
        adManager.updateUserPreferences({ 
          reduceAds: false,
          reduceAdsExpireTime: 0 
        });
        console.log('🎯 已更新广告偏好：减少广告=false');
      }
    } catch (error) {
      console.log('🎯 更新广告偏好失败:', error);
    }
    
    // 重新初始化广告
    this.initAd();
    
    wx.showToast({
      title: '已恢复正常广告显示',
      icon: 'success'
    });
    
    console.log('🎯 减少广告功能已关闭');
  },
  
  // 清理减少广告状态
  clearReduceAdsStatus() {
    // 清除定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
    
    // 清除存储
    wx.removeStorageSync('reduceAdsExpireTime');
    
    // 重置状态
    this.setData({
      reduceAdsExpireTime: 0,
      countdownTimer: null,
      remainingTime: '',
      isCountdownActive: false,
      countdownClass: '',
      'userPreferences.reduceAds': false
    });
  },
  
  // 启动倒计时
  startCountdown() {
    // 清除之前的定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
    
    // 立即更新一次显示
    this.updateCountdownDisplay();
    
    // 每秒更新倒计时
    const timer = setInterval(() => {
      this.updateCountdownDisplay();
    }, 1000);
    
    this.setData({ countdownTimer: timer });
  },
  
  // 更新倒计时显示
  updateCountdownDisplay() {
    const currentTime = Date.now();
    const expireTime = this.data.reduceAdsExpireTime;
    
    if (expireTime <= currentTime) {
      // 时间到了，自动关闭功能
      this.handleCountdownExpired();
      return;
    }
    
    const remainingMs = expireTime - currentTime;
    const remainingTime = this.formatRemainingTime(remainingMs);
    
    // 根据剩余时间设置紧急状态样式
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let countdownClass = '';
    if (hours === 0 && minutes < 10) {
      countdownClass = 'countdown-critical'; // 少于10分钟，关键状态
    } else if (hours === 0) {
      countdownClass = 'countdown-urgent'; // 少于1小时，紧急状态
    }
    
    this.setData({ 
      remainingTime,
      countdownClass 
    });
  },
  
  // 格式化剩余时间显示
  formatRemainingTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  },
  
  // 处理倒计时到期
  handleCountdownExpired() {
    console.log('🎯 减少广告功能到期，自动恢复正常显示');
    
    this.clearReduceAdsStatus();
    
    // 🎯 修复：更新广告管理器偏好，使用页面级实例
    try {
      const adManager = this.adManagerInstance;
      if (adManager) {
        adManager.updateUserPreferences({ 
          reduceAds: false,
          reduceAdsExpireTime: 0 
        });
        console.log('🎯 已更新广告偏好：减少广告=false（到期自动关闭）');
      }
    } catch (error) {
      console.log('🎯 更新广告偏好失败:', error);
    }
    
    // 重新初始化广告
    this.initAd();
    
    // 提示用户
    wx.showToast({
      title: '广告已恢复显示',
      icon: 'success',
      duration: 2000
    });
  },

  // 🔒 隐藏功能：版本号点击事件（测试人员专用）
  onVersionTap() {
    wx.showModal({
      title: '版本信息',
      content: '当前版本：v1.1.7',
      editable: true,
      placeholderText: '输入内容...',
      confirmText: '确定',
      cancelText: '取消',
      success: (res: any) => {
        if (res.confirm && res.content) {
          this.handleVersionInput(res.content.trim());
        }
      }
    });
  },

  // 🔒 处理版本号输入（隐藏的测试功能）
  async handleVersionInput(input: string) {
    console.log('🔍 版本信息输入:', input);
    
    // 检查是否是特殊指令
    if (input === 'reset_points') {
      await this.resetUserPoints();
    } else if (input === 'clear_cache') {
      this.clearAllCache();
    } else if (input === 'test_ad') {
      this.testAdSystem();
    } else if (input === 'sunlipeng') {
      // 🎯 作者专用积分奖励指令
      await this.addAuthorReward();
    } else if (input === 'reset_guide') {
      // 🎯 重置用户引导状态
      this.resetUserGuide();
    } else if (input === 'show_guide') {
      // 🎯 手动显示用户引导
      this.showUserGuideManually();
    } else if (input === 'reset_signin') {
      // 🎯 重置签到状态（测试用）
      this.resetSignInStatus();
    } else {
      wx.showToast({
        title: '未知指令',
        icon: 'none'
      });
    }
  },

  // 🎯 添加作者奖励积分
  async addAuthorReward() {
    try {
      const pointsManager = require('../../utils/points-manager.js');
      
      // 添加999积分作为作者奖励
      const result = await pointsManager.addPoints(999, 'author_reward', '作者专用奖励');
      
      if (result.success) {
        // 刷新积分显示
        this.refreshPointsSystem();
        
        wx.showToast({
          title: '🎉 作者奖励+999积分',
          icon: 'success',
          duration: 2000
        });
        
        console.log('✅ 作者奖励积分添加成功:', result);
      } else {
        wx.showToast({
          title: '奖励失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('❌ 添加作者奖励积分失败:', error);
      wx.showToast({
        title: '奖励失败',
        icon: 'none'
      });
    }
  },

  // 🔒 重置用户积分（测试功能）
  async resetUserPoints() {
    try {
      const pointsManager = require('../../utils/points-manager.js');
      
      // 重置积分为0
      const result = await pointsManager.resetUserPoints();
      
      if (result.success) {
        this.refreshPointsSystem();
        wx.showToast({
          title: '积分已重置',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('❌ 重置积分失败:', error);
      wx.showToast({
        title: '重置失败',
        icon: 'none'
      });
    }
  },

  // 🔒 添加测试积分
  async addTestPoints(amount: number) {
    try {
      const pointsManager = require('../../utils/points-manager.js');
      
      const result = await pointsManager.addPoints(amount, 'test_reward', '测试奖励');
      
      if (result.success) {
        this.refreshPointsSystem();
        wx.showToast({
          title: `测试积分+${amount}`,
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('❌ 添加测试积分失败:', error);
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      });
    }
  },

  // 🔒 清除所有缓存
  clearAllCache() {
    try {
      wx.clearStorageSync();
      wx.showToast({
        title: '缓存已清除',
        icon: 'success'
      });
      
      // 重新初始化数据
      setTimeout(() => {
        this.onLoad();
      }, 1000);
    } catch (error) {
      console.error('❌ 清除缓存失败:', error);
      wx.showToast({
        title: '清除失败',
        icon: 'none'
      });
    }
  },

  // 🔒 测试广告系统
  testAdSystem() {
    try {
      console.log('🎬 开始测试广告系统...');
      
      if (this.adManagerInstance && this.adManagerInstance.showRewardedVideoAd) {
        this.adManagerInstance.showRewardedVideoAd((result: any) => {
          console.log('🎬 测试广告回调:', result);
          wx.showToast({
            title: '广告测试完成',
            icon: 'success'
          });
        });
      } else {
        wx.showToast({
          title: '广告系统未初始化',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('❌ 测试广告系统失败:', error);
      wx.showToast({
        title: '测试失败',
        icon: 'none'
      });
    }
  },

  // 🎯 新增：基于Context7最佳实践的深色模式功能

  // 初始化主题模式 - 使用全局主题管理器
  initThemeMode() {
    try {
      // 使用全局主题管理器初始化页面主题
      const themeManager = require('../../utils/theme-manager.js');
      
      // 初始化页面主题，并获取清理函数
      this.themeCleanup = themeManager.initPageTheme(this);
      
      console.log('🌙 页面主题初始化完成，已连接全局主题管理器');
      
    } catch (error) {
      console.error('❌ 主题模式初始化失败:', error);
      // 默认使用自动模式
      this.setData({
        themeMode: 'auto',
        isDarkMode: false
      });
    }
  },

  // 🎯 基于Context7最佳实践：直接选择主题模式
  selectThemeMode(event: any) {
    const selectedMode = event.currentTarget.dataset.mode;
    console.log('🌙 用户选择主题模式:', selectedMode);
    
    // 如果选择的是当前模式，则不执行任何操作
    if (selectedMode === this.data.themeMode) {
      console.log('🌙 主题模式未改变，跳过切换');
      return;
    }
    
    this.switchThemeMode(selectedMode);
  },

  // 手动切换主题模式（点击按钮）- 使用全局主题管理器
  switchThemeMode(targetMode?: string) {
    try {
      // 使用全局主题管理器
      const themeManager = require('../../utils/theme-manager.js');
      const result = themeManager.switchThemeMode(targetMode);
      
      // 更新本页面状态
      this.setData({
        themeMode: result.mode,
        isDarkMode: result.isDarkMode
      });
      
      // 显示反馈信息
      wx.showToast({
        title: `${result.emoji} 已切换到${result.name}`,
        icon: 'none',
        duration: 1800
      });
      
      console.log('🌙 全局主题切换成功:', result);
      
    } catch (error) {
      console.error('❌ 主题切换失败:', error);
      wx.showToast({
        title: '主题切换失败',
        icon: 'none',
        duration: 1500
      });
    }
  },





  // 🎯 基于Context7最佳实践：测试警告处理功能
  testWarningHandler() {
    console.group('🔧 警告处理器测试');
    
    try {
      // 引入警告处理工具
      const WarningHandler = require('../../utils/warning-handler.js');
      
      // 显示警告处理统计
      WarningHandler.showStats();
      
      // 显示详细的警告说明
      WarningHandler.showWarningExplanation();
      
      // 检查环境状态
      WarningHandler.checkEnvironment();
      
      console.groupEnd();
      
      // 显示测试完成提示
      wx.showToast({
        title: '警告处理器测试完成',
        icon: 'success',
        duration: 2000
      });
      
    } catch (error) {
      console.error('❌ 警告处理器测试失败:', error);
      console.groupEnd();
      
      wx.showToast({
        title: '警告处理器测试失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 🎯 新增：初始化页面级别激励视频广告
   * 解决 "you can only invoke show() on the page where rewardedVideoAd is created" 问题
   * 🔧 修复：避免重复绑定onClose事件
   */
  initPageRewardedAd() {
    try {
      // 🔧 新增：检查是否已经初始化，避免重复绑定事件
      if (this.data.pageRewardedAdManager) {
        console.log('🎬 页面级别激励视频广告已存在，跳过重复初始化');
        return;
      }

      if (this.adManagerInstance && this.adManagerInstance.createPageRewardedAd) {
        console.log('🎬 开始初始化页面级别激励视频广告...');
        
        const pageRewardedAdManager = this.adManagerInstance.createPageRewardedAd(this);
        
        if (pageRewardedAdManager) {
          this.setData({
            pageRewardedAdManager: pageRewardedAdManager
          });
          console.log('✅ 页面级别激励视频广告初始化成功');
        } else {
          console.log('❌ 页面级别激励视频广告初始化失败');
        }
      } else {
        console.log('❌ AdManager不支持页面级别激励视频广告');
      }
    } catch (error) {
      console.error('❌ 初始化页面级别激励视频广告时出错:', error);
    }
  },

  // 🎯 新增：积分更新回调方法，用于接收广告奖励等积分变化通知
  onPointsUpdated(result: any) {
    console.log('🔄 收到积分更新通知，立即刷新显示:', result);
    
    // 立即刷新积分显示
    this.refreshPointsSystem();
    
    // 显示积分更新成功的视觉反馈
    wx.showToast({
      title: `积分+${result.reward}`,
      icon: 'success',
      duration: 1500
    });
    
    // 清除任何正在进行的积分监听器，避免重复刷新
    if (this.data.pointsMonitorTimer) {
      clearInterval(this.data.pointsMonitorTimer);
      this.setData({ pointsMonitorTimer: null });
      console.log('🎯 积分监听器已清除（收到直接更新通知）');
    }
  },


  // 🎯 新增：设置持续监听机制，确保捕获延迟的积分更新

  // ========== 用户引导相关方法 ==========

  // 🎯 升级：智能用户引导检查
  checkUserGuide() {
    try {
      // 获取用户引导组件实例
      const guideComponent = this.selectComponent('#userGuide');
      if (!guideComponent) {
        console.log('🎯 用户引导组件未找到，跳过智能引导检查');
        return;
      }

      // 智能检查引导条件
      const guideType = guideComponent.checkGuideConditions();
      
      if (guideType) {
        console.log('🎯 检测到需要引导类型:', guideType);
        
        // 延迟显示引导，确保页面完全加载
        setTimeout(() => {
          this.startUserGuide(guideType);
        }, 2000);
      } else {
        console.log('🎯 当前不需要显示用户引导');
      }
    } catch (error) {
      console.error('❌ 智能用户引导检查失败:', error);
    }
  },

  // 🎯 升级：开始智能用户引导
  startUserGuide(guideType = 'welcome') {
    console.log('🎯 开始智能用户引导, 类型:', guideType);
    
    this.setData({
      showUserGuide: true,
      guideType: guideType
    });

    // 记录功能使用情况
    this.trackFeatureUsage('user_guide');
  },

  // 🎯 升级：引导完成回调
  onGuideComplete(event: any) {
    console.log('🎯 智能引导完成:', event.detail);
    
    this.setData({
      showUserGuide: false
    });

    // 根据引导类型给予不同奖励
    this.handleGuideCompletion(event.detail);
  },

  // 🎯 修改：处理引导完成后的奖励和后续操作
  async handleGuideCompletion(guideData: any) {
    const { type, userProfile } = guideData;
    
    try {
      // 根据引导类型给予不同奖励
      if (type === 'welcome') {
        await this.giveNewUserReward();
        
        // 显示欢迎消息
        wx.showModal({
          title: '🎉 欢迎加入FlightToolbox！',
          content: `亲爱的${this.getUserProfileName(userProfile)}，感谢您选择FlightToolbox！我们已为您准备了15积分作为欢迎礼物。`,
          showCancel: false,
          confirmText: '开始探索'
        });
        
        // 🎯 确保新用户状态正确标记
        wx.setStorageSync('user_onboarded', true);
        console.log('🎯 新用户引导完成，用户状态已更新');
        
      } else if (type === 'featureDiscovery') {
        // 功能发现奖励
        await this.giveFeatureDiscoveryReward();
      } else if (type === 'advanced') {
        // 高级用户奖励
        await this.giveAdvancedUserReward();
      }
      
      // 更新用户角色信息
      wx.setStorageSync('user_profile', userProfile);
      
    } catch (error) {
      console.error('❌ 处理引导完成奖励失败:', error);
    }
  },

  // 🎯 新增：获取用户角色显示名称
  getUserProfileName(profile: string): string {
    const profileNames = {
      pilot: '飞行员',
      student: '飞行学员', 
      mechanic: '机务人员'
    };
    return profileNames[profile] || '飞行员';
  },

  // 🎯 新增：跟踪功能使用情况
  trackFeatureUsage(feature: string) {
    try {
      const usage = wx.getStorageSync('feature_usage') || {};
      usage[feature] = (usage[feature] || 0) + 1;
      wx.setStorageSync('feature_usage', usage);
      
      console.log('🎯 功能使用跟踪:', feature, usage[feature]);
    } catch (error) {
      console.error('❌ 功能使用跟踪失败:', error);
    }
  },

  // 🎯 新增：隐藏引导
  hideGuide() {
    this.setData({
      showUserGuide: false
    });
  },

  // 🎯 升级：给新用户奖励
  async giveNewUserReward() {
    try {
      const pointsManager = require('../../utils/points-manager.js');
      
      // 检查是否已经给过新用户奖励
      const hasNewUserReward = wx.getStorageSync('new_user_reward_given') || false;
      
      if (!hasNewUserReward) {
        // 给新用户15积分奖励（提升奖励）
        const result = await pointsManager.addPoints(15, 'new_user_guide', '完成新手引导奖励');
        
        if (result.success) {
          // 刷新积分显示
          this.refreshPointsSystem();
          
          // 标记已给过奖励
          wx.setStorageSync('new_user_reward_given', true);
          
          console.log('✅ 新用户引导奖励发放成功');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ 发放新用户奖励失败:', error);
      return false;
    }
  },

  // 🎯 新增：功能发现奖励
  async giveFeatureDiscoveryReward() {
    try {
      const pointsManager = require('../../utils/points-manager.js');
      
      // 检查是否已经给过功能发现奖励
      const hasFeatureReward = wx.getStorageSync('feature_discovery_reward_given') || false;
      
      if (!hasFeatureReward) {
        // 给功能发现用户8积分奖励
        const result = await pointsManager.addPoints(8, 'feature_discovery', '功能发现引导奖励');
        
        if (result.success) {
          // 刷新积分显示
          this.refreshPointsSystem();
          
          // 显示奖励提示
          wx.showToast({
            title: '🎉 获得8积分奖励',
            icon: 'none',
            duration: 2000
          });
          
          // 标记已给过奖励
          wx.setStorageSync('feature_discovery_reward_given', true);
          
          console.log('✅ 功能发现奖励发放成功');
        }
      }
    } catch (error) {
      console.error('❌ 发放功能发现奖励失败:', error);
    }
  },

  // 🎯 新增：高级用户奖励
  async giveAdvancedUserReward() {
    try {
      const pointsManager = require('../../utils/points-manager.js');
      
      // 检查是否已经给过高级用户奖励
      const hasAdvancedReward = wx.getStorageSync('advanced_user_reward_given') || false;
      
      if (!hasAdvancedReward) {
        // 给高级用户12积分奖励
        const result = await pointsManager.addPoints(12, 'advanced_features', '高级功能引导奖励');
        
        if (result.success) {
          // 刷新积分显示
          this.refreshPointsSystem();
          
          // 显示奖励提示
          wx.showToast({
            title: '🎉 获得12积分奖励',
            icon: 'none',
            duration: 2000
          });
          
          // 标记已给过奖励
          wx.setStorageSync('advanced_user_reward_given', true);
          
          console.log('✅ 高级用户奖励发放成功');
        }
      }
    } catch (error) {
      console.error('❌ 发放高级用户奖励失败:', error);
    }
  },

  // 手动触发用户引导（用于测试或重新查看）
  showUserGuideManually() {
    this.startUserGuide();
  },

  // 🎯 修改：重置用户引导状态（测试用）
  resetUserGuide() {
    // 清除所有引导相关的状态标记
    wx.removeStorageSync('user_onboarded');
    wx.removeStorageSync('guide_shown_before');
    wx.removeStorageSync('completed_guides');
    wx.removeStorageSync('user_guide_completed');
    wx.removeStorageSync('user_guide_completed_time');
    wx.removeStorageSync('guide_start_time');
    wx.removeStorageSync('guide_prompt_shown');
    wx.removeStorageSync('new_user_reward_given');
    wx.removeStorageSync('feature_discovery_reward_given');
    wx.removeStorageSync('advanced_user_reward_given');
    wx.removeStorageSync('user_profile');
    wx.setStorageSync('app_first_launch', true);
    
    wx.showToast({
      title: '引导状态已重置',
      icon: 'success'
    });
    
    console.log('🎯 用户引导状态已完全重置');
  },

  // 重置签到状态（测试用）
  resetSignInStatus() {
    try {
      wx.removeStorageSync('last_signin_date');
      wx.removeStorageSync('signin_streak');
      
      // 刷新积分系统数据
      this.refreshPointsSystem();
      
      wx.showToast({
        title: '签到状态已重置',
        icon: 'success',
        duration: 2000
      });
      
      console.log('🎯 签到状态已重置，可以重新签到');
    } catch (error) {
      console.error('❌ 重置签到状态失败:', error);
      wx.showToast({
        title: '重置失败',
        icon: 'none'
      });
    }
  },



  // 🚀 检查离线数据状态
  checkOfflineDataStatus() {
    const loadedPackages = wx.getStorageSync('loaded_packages') || [];
    const failedPackages = wx.getStorageSync('failed_packages') || [];
    const totalPackages = 8;
    const loadedCount = loadedPackages.length;
    const progress = Math.round((loadedCount / totalPackages) * 100);
    const isAllLoaded = loadedCount === totalPackages;

    console.log('🚀 离线数据状态检查:', {
      loaded: loadedCount,
      total: totalPackages,
      progress: progress + '%',
      isComplete: isAllLoaded,
      loadedPackages: loadedPackages,
      failedPackages: failedPackages
    });

    this.setData({
      'offlineDataStatus.loadedPackages': loadedCount,
      'offlineDataStatus.loadingProgress': progress,
      'offlineDataStatus.isAllLoaded': isAllLoaded,
      'offlineDataStatus.lastUpdateTime': Date.now()
    });

    // 如果有失败的包，尝试重新加载
    if (failedPackages.length > 0) {
      console.log('🔄 发现失败的分包，尝试重新加载:', failedPackages);
      const ErrorHandler = require('../../utils/error-handler.js');
      ErrorHandler.manualPreloadPackages(failedPackages);
    }
  },

  // 🚀 显示离线数据状态详情
  showOfflineDataStatus() {
    this.checkOfflineDataStatus(); // 刷新状态
    this.setData({
      showOfflineStatusModal: true
    });
  },

  // 🚀 关闭离线数据状态弹窗
  closeOfflineStatusModal() {
    this.setData({
      showOfflineStatusModal: false
    });
  },

  // 🚀 手动触发数据下载
  manualDownloadOfflineData() {
    console.log('🔄 用户手动触发离线数据下载');
    
    wx.showModal({
      title: '下载离线数据',
      content: '将下载约1MB的离线数据，建议在WiFi环境下进行。是否继续？',
      success: (res) => {
        if (res.confirm) {
          // 显示加载提示
          wx.showLoading({
            title: '正在下载离线数据',
            mask: true
          });

          const ErrorHandler = require('../../utils/error-handler.js');
          ErrorHandler.aggressivePreloadAll();

          // 定时检查下载进度
          const checkProgress = () => {
            this.checkOfflineDataStatus();
            const currentProgress = this.data.offlineDataStatus.loadingProgress;
            
            if (currentProgress === 100) {
              wx.hideLoading();
              wx.showToast({
                title: '离线数据下载完成',
                icon: 'success',
                duration: 2000
              });
            } else {
              setTimeout(checkProgress, 1000);
            }
          };

          setTimeout(checkProgress, 2000);
        }
      }
    });
  },

  // 🚀 清除离线数据缓存
  clearOfflineDataCache() {
    wx.showModal({
      title: '清除离线数据',
      content: '确定要清除所有离线数据缓存吗？下次使用时需要重新下载。',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('loaded_packages');
            wx.removeStorageSync('failed_packages');
            
            // 清除数据管理器的缓存
            const dataManager = require('../../utils/data-manager.js');
            dataManager.clearAllCache();

            this.checkOfflineDataStatus();
            
            wx.showToast({
              title: '离线数据已清除',
              icon: 'success',
              duration: 2000
            });
          } catch (error) {
            console.error('❌ 清除离线数据失败:', error);
            wx.showToast({
              title: '清除失败',
              icon: 'none',
              duration: 2000
            });
          }
        }
      }
    });
  }

}) 