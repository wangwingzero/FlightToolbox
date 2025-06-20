// 实用工具页面
const pointsManagerUtil = require('../../utils/points-manager.js')

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

  },

  onLoad() {
    this.updateGreeting();
    this.loadQualifications();
    this.initPointsSystem();
    this.initAdSystem();
  },

  onShow() {
    // 每次显示页面时重新加载资质数据和检查提醒
    // 特别处理时间变化的情况（跨日期刷新）
    const currentDate = new Date().toDateString();
    const lastCheckDate = wx.getStorageSync('lastQualificationCheckDate') || '';
    
    // 如果日期发生变化，强制刷新所有数据
    if (lastCheckDate !== currentDate) {
      console.log('检测到日期变化，强制刷新资质数据');
      wx.setStorageSync('lastQualificationCheckDate', currentDate);
      this.updateGreeting(); // 日期变化时更新问候语
    }
    
    // 🎯 优化：立即检查积分更新（支持广告观看后的即时刷新）
    this.checkAndRefreshPoints();
    
    // 🎯 新增：设置持续监听机制，确保捕获延迟的积分更新
    this.setupContinuousPointsMonitoring();
    
    this.loadQualifications();
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
  },

  onUnload() {
    // 页面卸载时清理广告实例
    try {
      const adManager = require('../../utils/ad-manager.js');
      adManager.destroy(); // 清理当前页面的广告实例
    } catch (error) {
      console.warn('清理广告实例失败:', error);
    }
    
    // 🎯 新增：清理积分监听定时器，防止内存泄漏
    if (this.data.pointsMonitorTimer) {
      clearInterval(this.data.pointsMonitorTimer);
      console.log('🎯 页面卸载时清理积分监听器');
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
      const adManager = require('../../utils/ad-manager.js');
      console.log('🎬 开始初始化页面广告系统...');
      
      // 初始化当前页面的广告实例
      const adInstance = adManager.initAdForCurrentPage();
      if (adInstance) {
        console.log('✅ 广告实例初始化成功');
      } else {
        console.log('❌ 广告实例初始化失败，可能是不支持的平台');
      }
    } catch (error) {
      console.error('广告系统初始化失败:', error);
    }
  },

  // 刷新积分系统数据
  refreshPointsSystem() {
    try {
      const userPoints = pointsManagerUtil.getCurrentPoints();
      const signInStatus = pointsManagerUtil.getSignInStatus();
      const transactions = pointsManagerUtil.getTransactionHistory(10); // 限制最多10条记录
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
      wx.showLoading({ title: '签到中...' });
      
      const result = await pointsManagerUtil.dailySignIn();
      
      wx.hideLoading();
      
      this.setData({
        signInResult: result,
        showSignInModal: true
      });
      
      // 刷新积分数据
      this.refreshPointsSystem();
    } catch (error) {
      wx.hideLoading();
      console.error('签到失败:', error);
      wx.showToast({
        title: '签到失败，请重试',
        icon: 'none'
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

  // 观看激励广告获取积分 - 支持递减机制
  async watchAdForPoints() {
    try {
      // 检查观看次数限制
      const adInfo = pointsManagerUtil.getNextAdRewardInfo();
      if (adInfo.currentCount >= adInfo.maxDailyCount) {
        wx.showToast({
          title: '今日观看次数已用完',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 引入广告管理器并初始化
      const adManager = require('../../utils/ad-manager.js');
      
      // 检查基础API支持
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
      
      console.log('✅ 激励视频广告API支持检查通过');
      
      // 确保广告实例已初始化
      const adInstance = adManager.initAdForCurrentPage();
      if (!adInstance) {
        console.log('❌ 广告实例初始化失败');
        wx.showToast({
          title: '广告组件初始化失败',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      console.log('🎬 广告实例初始化成功，检查状态...');
      console.log('广告实例详情:', adInstance);
      
      // 等待一小段时间让广告加载
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 检查广告状态
      const adStatus = adManager.getAdStatus();
      console.log('🎬 当前广告状态:', adStatus);
      
      if (!adStatus.canShow) {
        const message = adStatus.isLoading ? 
          '广告加载中，请稍候...' : 
          `广告暂时不可用 (就绪:${adStatus.isReady}, 加载中:${adStatus.isLoading})`;
        
        wx.showModal({
          title: '广告状态',
          content: `${message}\n\n在开发环境中，广告可能无法正常加载。建议在真机上测试广告功能。`,
          showCancel: true,
          cancelText: '取消',
          confirmText: '强制尝试',
          success: (res) => {
            if (res.confirm) {
              // 用户选择强制尝试
              this.forceShowAd(adManager);
            }
          }
        });
        return;
      }
      
      // 设置积分刷新回调
      this.setupPointsRefreshCallback();
      
      // 显示激励广告
      const result = await adManager.showRewardedAd({
        source: 'others_page',
        context: '用户主动观看广告获取积分'
      });
      
      if (result.success) {
        console.log('✅ 广告展示成功，等待用户观看完成...');
        // 积分奖励将在广告观看完成后由ad-manager自动发放
        // 页面刷新将由积分更新回调处理
      } else {
        wx.showToast({
          title: result.reason || '广告加载失败',
          icon: 'none',
          duration: 2000
        });
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

  // 设置积分刷新回调 - 立即响应积分更新
  setupPointsRefreshCallback() {
    // 监听积分更新标记的变化
    const checkPointsUpdate = () => {
      const currentUpdate = wx.getStorageSync('points_updated') || 0;
      const lastCheck = this.data.lastPointsCheck || 0;
      
      if (currentUpdate > lastCheck) {
        console.log('🎯 检测到积分更新，立即刷新页面显示');
        this.setData({ lastPointsCheck: currentUpdate });
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
    
    // 🎯 优化：更频繁的检查，确保第一时间响应
    // 前3秒内每200ms检查一次（高频检查），后续每500ms检查一次
    let checkCount = 0;
    const maxChecks = 25; // 增加检查次数：15次高频 + 10次常规 = 总共12.5秒
    
    const timer = setInterval(() => {
      checkCount++;
      
      if (checkPointsUpdate() || checkCount >= maxChecks) {
        clearInterval(timer);
        if (checkCount >= maxChecks) {
          console.log('积分更新检查超时，进行兜底刷新');
          this.refreshPointsSystem();
        }
      }
    }, checkCount < 15 ? 200 : 500); // 前15次用200ms间隔，后续用500ms间隔
  },

  // 强制尝试显示广告（用于调试）
  async forceShowAd(adManager: any) {
    try {
      console.log('🚀 强制尝试显示广告...');
      
      // 设置积分刷新回调
      this.setupPointsRefreshCallback();
      
      const result = await adManager.showRewardedAd({
        source: 'others_page_force',
        context: '强制尝试显示广告'
      });
      
      if (result.success) {
        console.log('✅ 强制显示广告成功，等待积分更新回调');
        // 积分刷新由回调处理，不再使用延迟刷新
      } else {
        console.log('❌ 强制显示广告失败:', result.reason);
        wx.showToast({
          title: result.reason || '广告显示失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('强制显示广告异常:', error);
      wx.showToast({
        title: '广告显示异常',
        icon: 'none'
      });
    }
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
    wx.showModal({
      title: '积分不足',
      content: `${result.message}\n\n获取积分方式：\n• 在本页面点击【签到】按钮\n• 点击任意页面的【观看广告】按钮\n• 前往其他功能页面观看广告`,
      confirmText: this.data.canSignIn ? '去签到' : '看广告',
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          if (this.data.canSignIn) {
            // 优先引导签到
            this.dailySignIn();
          } else {
            // 已签到，引导观看广告
            this.watchAdForPoints();
          }
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

  // 新增：打开日出日落计算页面
  openSunriseSunset() {
    this.checkAndConsumePoints('sunrise-sunset', () => {
      wx.navigateTo({
        url: '/pages/sunrise-sunset/index'
      });
    });
  },

  // 新增：资质管理
  openQualificationManager() {
    // 免费功能，无需积分检查
    wx.navigateTo({
      url: '/pages/qualification-manager/index'
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
      title: '飞行小工具 - 实用工具',
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
          content: '可在微信中搜索公众号"飞行播客"或原始ID: gh_68a6294836cd',
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

  // 直接跳转公众号（使用最新API）
  jumpToOfficialAccount() {
    // 使用wx.navigateToMiniProgram或显示备用方案
    try {
      // 尝试使用官方API（如果支持）
      (wx as any).openOfficialAccountProfile({
        username: 'gh_68a6294836cd',
        success: () => {
          console.log('✅ 成功跳转到公众号');
          wx.showToast({
            title: '跳转成功',
            icon: 'success',
            duration: 1500
          });
        },
        fail: () => {
          this.showQRCodeModal();
        }
      });
    } catch (error) {
      console.log('❌ API不支持，显示备用方案');
      this.showQRCodeModal();
    }
  },

  // 复制公众号ID
  copyOfficialAccountId() {
    wx.setClipboardData({
      data: 'gh_68a6294836cd',
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
              content: '请在微信中搜索"飞行播客"或公众号ID"gh_68a6294836cd"来关注我的公众号。',
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
  }
}) 