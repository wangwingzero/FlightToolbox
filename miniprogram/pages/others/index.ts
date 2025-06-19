// 实用工具页面
const pointsManagerUtil = require('../../utils/points-manager.js')
const buttonChargeManager = require('../../utils/button-charge-manager.js') // 扣费管理器

Page({
  data: {
    qualifications: [] as any[], // 资质数据
    
    // 积分系统相关数据
    userPoints: 0,
    canSignIn: false,
    signInStreak: 0,
    showPointsModal: false,
    showSignInModal: false,
    showPointsRulesModal: false,
    signInResult: null as any,
    pointsTransactions: [] as any[],
    nextSignInReward: 15,
    lastPointsCheck: 0, // 用于检测积分更新
    
    // 广告观看相关数据
    dailyAdCount: 0,
    currentAdReward: 40,
    remainingAdToday: 15
  },

  onLoad() {
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
    }
    
    // 检查积分是否更新（用于广告观看后刷新）
    const lastPointsUpdate = wx.getStorageSync('points_updated') || 0;
    const lastCheck = this.data.lastPointsCheck || 0;
    
    if (lastPointsUpdate > lastCheck) {
      console.log('检测到积分更新，刷新积分显示');
      this.setData({ lastPointsCheck: lastPointsUpdate });
    }
    
    this.loadQualifications();
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
      const transactions = pointsManagerUtil.getTransactionHistory(10);
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
      
      // 显示激励广告
      const result = await adManager.showRewardedAd({
        source: 'others_page',
        context: '用户主动观看广告获取积分'
      });
      
      if (result.success) {
        console.log('✅ 广告展示成功，等待用户观看完成...');
        // 积分奖励将在广告观看完成后由ad-manager自动发放
        // 这里不需要手动发放积分
        
        // 延迟刷新积分显示，给广告播放留出时间
        setTimeout(() => {
          this.refreshPointsSystem();
        }, 1500);
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

  // 强制尝试显示广告（用于调试）
  async forceShowAd(adManager: any) {
    try {
      console.log('🚀 强制尝试显示广告...');
      
      const result = await adManager.showRewardedAd({
        source: 'others_page_force',
        context: '强制尝试显示广告'
      });
      
      if (result.success) {
        console.log('✅ 强制显示广告成功');
        setTimeout(() => {
          this.refreshPointsSystem();
        }, 1500);
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
      'signin_streak_2': '连续签到',
      'signin_streak_7': '连续签到',
      'signin_streak_30': '连续签到',
      'consume': '功能使用'
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
    const needMore = result.requiredPoints - result.currentPoints;
    const adsNeeded = Math.ceil(needMore / 40); // 每个广告40积分
    
    wx.showModal({
      title: '积分不足',
      content: `${result.message}\n\n建议操作：\n• 每日签到(${this.data.nextSignInReward}积分)\n• 观看激励广告(40积分)\n\n观看${adsNeeded}个广告即可获得足够积分`,
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
        
        this.setData({ qualifications: enabledQualifications });
        
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
      content: '感谢您的宝贵建议！\n\n请关注公众号：飞行播客\n在公众号内即可直接反馈\n\n我会认真对待每一条建议',
      confirmText: '知道了',
      showCancel: false
    })
  },

  aboutUs() {
    wx.showModal({
      title: '作者的话',
      content: '你好，我是开发者虎大王。\n\n开发"飞行小工具"，源于解决我们实际飞行中的诸多痛点。我的初衷很简单：为飞行员们打造一个纯粹、高效、可靠的掌上工具箱。',
      confirmText: '知道了',
      showCancel: false
    })
  },

  onShareAppMessage() {
    return {
      title: '飞行小工具 - 实用工具',
      path: '/pages/others/index'
    }
  },

  onShareTimeline() {
    return {
      title: '飞行小工具 - 实用工具'
    }
  }
}) 