/**
 * 积分管理系统
 * 基于微信小程序激励广告最佳实践设计
 */

class PointsManager {
  constructor() {
    this.STORAGE_KEY = 'flight_toolbox_points';
    this.LAST_SIGNIN_KEY = 'last_signin_date';
    this.SIGNIN_STREAK_KEY = 'signin_streak';
    this.USER_INIT_KEY = 'user_initialized';
    this.DAILY_AD_COUNT_KEY = 'daily_ad_count';
    this.LAST_AD_DATE_KEY = 'last_ad_date';
    
    // 积分消费规则
    this.POINT_RULES = {
      // tabbar页面功能消费
      'flight-calc': -1,        // 飞行速算
      'unit-converter': -1,     // 常用换算
      'aviation-calculator': -2, // 特殊计算
      'abbreviations': -2,      // 万能查询
      
      // 实用工具页面功能消费
      'event-report': -3,       // 事件样例
      'snowtam-decoder': -3,    // 雪情通告
      'dangerous-goods': -3,    // 危险品
      'twin-engine-goaround': -3, // 双发复飞梯度
      'sunrise-sunset': -2,     // 夜航时间
      'flight-time-share': -2,  // 分飞行时间
      'personal-checklist': 0,  // 个人检查单（免费）
      'qualification-manager': 0 // 资质管理（免费）
    };
    
    // 按钮级别消费规则 - 细化到具体按钮操作
    this.BUTTON_RULES = {
      // 飞行速算页面按钮
      'flight-calc-descent-rate': -1,     // 计算下降率
      'flight-calc-glideslope': -1,       // 计算下滑线高度
      'flight-calc-detour-fuel': -1,      // 计算绕飞耗油
      'flight-calc-crosswind': -1,        // 侧风计算
      'flight-calc-turn-radius': -1,      // 转弯半径计算
      
      // 特殊计算页面按钮
      'aviation-calc-gradient': -2,       // 梯度换算
      'aviation-calc-qfe': -2,           // QFE计算
      'aviation-calc-cold-temp': -2,     // 低温修正  
      'aviation-calc-gpws': -2,          // GPWS计算
      'aviation-calc-pitch': -2,         // PITCH PITCH告警分析
      'aviation-calc-acr': -2,           // ACR-PCR分析
      'aviation-calc-wake': -2,          // 尾流计算
      
      // 双发复飞梯度查询
      'twin-engine-query': -3,           // 查询梯度
      
      // 万能查询搜索按钮
      'abbreviations-search': -2,        // 缩写搜索
      'definitions-search': -2,          // 定义搜索
      'airports-search': -2,             // 机场搜索
      'communications-search': -2,       // 通信搜索
      'normative-search': -2,            // 规章搜索
      
      // 常用换算页面按钮
      'unit-convert-distance': -1,       // 距离换算
      'unit-convert-weight': -1,         // 重量换算  
      'unit-convert-speed': -1,          // 速度换算
      'unit-convert-temperature': -1,    // 温度换算
      'unit-convert-isa': -1,            // ISA温度计算
      'unit-convert-qnh2qfe': -1,        // QNH换算QFE
      'unit-convert-qfe2qnh': -1,        // QFE换算QNH
      
      // 特殊计算页面按钮（每次计算扣2积分）
      'aviation-calc-gradient': -2,      // 梯度换算
      'aviation-calc-gpws': -2,          // GPWS模式分析
      'aviation-calc-pitch': -2,         // PITCH PITCH告警分析
      'aviation-calc-coldtemp': -2,      // 低温修正计算
      'aviation-calc-acr': -2,           // ACR-PCR分析
      
      // 其他功能按钮
      'snowtam-decode': -3,               // 雪情通告解码
      'dangerous-goods-search': -3,      // 危险品搜索
      'sunrise-sunset-calc': -2,         // 日出日落计算
      'sun-times-calc': -2,              // 日出日落时间计算
      'night-flight-calc': -2,           // 夜航时间计算
      'flight-time-calc': -2,            // 分飞行时间计算
      'unit-convert': -1,                // 单位换算计算（保持兼容性）
      'event-report-generate': -3        // 事件报告生成
    };
    
    // 积分奖励规则 - 新增递减机制
    this.REWARD_RULES = {
      'new_user': 50,           // 新用户奖励
      'signin_normal': 15,      // 普通签到
      'signin_streak_2': 20,    // 连续2天+签到
      'signin_streak_7': 30,    // 连续7天+签到
      'signin_streak_30': 50    // 连续30天+签到
    };
    
    // 广告观看奖励递减规则
    this.AD_REWARD_TIERS = [
      { count: 3, reward: 40, description: "前3次每次40积分" },
      { count: 7, reward: 30, description: "第4-7次每次30积分" }, 
      { count: 15, reward: 20, description: "第8-15次每次20积分" },
      { count: 999, reward: 10, description: "第16次后每次10积分" }
    ];
  }

  /**
   * 初始化用户积分系统
   */
  async initUser() {
    try {
      const isInitialized = wx.getStorageSync(this.USER_INIT_KEY);
      if (!isInitialized) {
        // 新用户奖励
        await this.addPoints(this.REWARD_RULES.new_user, 'new_user', '新用户奖励');
        wx.setStorageSync(this.USER_INIT_KEY, true);
        
        // 显示欢迎消息
        wx.showModal({
          title: '欢迎使用飞行小工具',
          content: `恭喜您获得新用户奖励 ${this.REWARD_RULES.new_user} 积分！`,
          showCancel: false,
          confirmText: '开始使用'
        });
      }
    } catch (error) {
      console.error('用户初始化失败:', error);
    }
  }

  /**
   * 获取当前积分
   */
  getCurrentPoints() {
    try {
      return wx.getStorageSync(this.STORAGE_KEY) || 0;
    } catch (error) {
      console.error('获取积分失败:', error);
      return 0;
    }
  }

  /**
   * 扣除积分
   * @param {string} feature 功能名称
   * @param {string} description 描述
   */
  async consumePoints(feature, description = '') {
    const pointsToConsume = Math.abs(this.POINT_RULES[feature] || 0);
    
    if (pointsToConsume === 0) {
      return { success: true, message: '该功能免费使用' };
    }

    const currentPoints = this.getCurrentPoints();
    
    if (currentPoints < pointsToConsume) {
      // 积分不足，引导用户观看广告
      return {
        success: false,
        currentPoints,
        requiredPoints: pointsToConsume,
        message: `积分不足！当前积分：${currentPoints}，需要：${pointsToConsume}`
      };
    }

    try {
      const newPoints = currentPoints - pointsToConsume;
      wx.setStorageSync(this.STORAGE_KEY, newPoints);
      
      // 记录消费日志
      this.logPointsTransaction({
        type: 'consume',
        amount: -pointsToConsume,
        feature,
        description,
        balanceAfter: newPoints,
        timestamp: new Date().getTime()
      });

      return {
        success: true,
        pointsConsumed: pointsToConsume,
        remainingPoints: newPoints,
        message: `消费 ${pointsToConsume} 积分，剩余 ${newPoints} 积分`
      };
    } catch (error) {
      console.error('积分扣除失败:', error);
      return { success: false, message: '积分扣除失败' };
    }
  }

  /**
   * 按钮级别扣除积分
   * @param {string} buttonId 按钮标识符
   * @param {string} description 描述
   * @param {Function} callback 成功后的回调函数
   */
  async consumePointsForButton(buttonId, description = '', callback = null) {
    const pointsToConsume = Math.abs(this.BUTTON_RULES[buttonId] || 0);
    
    if (pointsToConsume === 0) {
      // 免费功能，直接执行回调
      if (callback && typeof callback === 'function') {
        callback();
      }
      return { success: true, message: '该功能免费使用' };
    }

    const currentPoints = this.getCurrentPoints();
    
    if (currentPoints < pointsToConsume) {
      // 积分不足，显示引导
      const adManager = require('./ad-manager.js');
      adManager.showInsufficientPointsGuide(pointsToConsume, currentPoints);
      
      return {
        success: false,
        currentPoints,
        requiredPoints: pointsToConsume,
        message: `积分不足！当前积分：${currentPoints}，需要：${pointsToConsume}`
      };
    }

    try {
      const newPoints = currentPoints - pointsToConsume;
      wx.setStorageSync(this.STORAGE_KEY, newPoints);
      
      // 记录消费日志
      this.logPointsTransaction({
        type: 'button_consume',
        amount: -pointsToConsume,
        buttonId,
        description,
        balanceAfter: newPoints,
        timestamp: new Date().getTime()
      });

      // 成功扣费后执行回调
      if (callback && typeof callback === 'function') {
        callback();
      }

      // 显示扣费提示
      wx.showToast({
        title: `消费 ${pointsToConsume} 积分`,
        icon: 'success',
        duration: 1500
      });

      // 通知页面更新积分显示
      wx.setStorageSync('points_updated', Date.now());

      return {
        success: true,
        pointsConsumed: pointsToConsume,
        remainingPoints: newPoints,
        message: `消费 ${pointsToConsume} 积分，剩余 ${newPoints} 积分`
      };
    } catch (error) {
      console.error('按钮积分扣除失败:', error);
      return { success: false, message: '积分扣除失败' };
    }
  }

  /**
   * 增加积分
   * @param {number} points 积分数量
   * @param {string} reason 原因
   * @param {string} description 描述
   */
  async addPoints(points, reason, description = '') {
    try {
      const currentPoints = this.getCurrentPoints();
      const newPoints = currentPoints + points;
      wx.setStorageSync(this.STORAGE_KEY, newPoints);
      
      // 记录奖励日志
      this.logPointsTransaction({
        type: 'reward',
        amount: points,
        reason,
        description,
        balanceAfter: newPoints,
        timestamp: new Date().getTime()
      });

      return {
        success: true,
        pointsAdded: points,
        totalPoints: newPoints,
        message: `获得 ${points} 积分，总积分 ${newPoints}`
      };
    } catch (error) {
      console.error('积分增加失败:', error);
      return { success: false, message: '积分增加失败' };
    }
  }

  /**
   * 签到功能
   */
  async dailySignIn() {
    try {
      const today = new Date().toDateString();
      const lastSignIn = wx.getStorageSync(this.LAST_SIGNIN_KEY);
      const currentStreak = wx.getStorageSync(this.SIGNIN_STREAK_KEY) || 0;

      if (lastSignIn === today) {
        return {
          success: false,
          message: '今日已签到，明天再来吧！',
          streak: currentStreak
        };
      }

      // 计算连续签到天数
      let newStreak = 1;
      if (lastSignIn) {
        const lastDate = new Date(lastSignIn);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // 连续签到
          newStreak = currentStreak + 1;
        } else {
          // 中断了，重新开始
          newStreak = 1;
        }
      }

      // 根据连续签到天数确定奖励
      let signInReward;
      let rewardType;
      if (newStreak >= 30) {
        signInReward = this.REWARD_RULES.signin_streak_30;
        rewardType = 'signin_streak_30';
      } else if (newStreak >= 7) {
        signInReward = this.REWARD_RULES.signin_streak_7;
        rewardType = 'signin_streak_7';
      } else if (newStreak >= 2) {
        signInReward = this.REWARD_RULES.signin_streak_2;
        rewardType = 'signin_streak_2';
      } else {
        signInReward = this.REWARD_RULES.signin_normal;
        rewardType = 'signin_normal';
      }

      // 更新签到记录
      wx.setStorageSync(this.LAST_SIGNIN_KEY, today);
      wx.setStorageSync(this.SIGNIN_STREAK_KEY, newStreak);

      // 增加积分
      const result = await this.addPoints(
        signInReward, 
        rewardType, 
        `连续签到${newStreak}天`
      );

      return {
        success: true,
        pointsEarned: signInReward,
        streak: newStreak,
        totalPoints: result.totalPoints,
        message: `签到成功！连续${newStreak}天，获得${signInReward}积分`
      };

    } catch (error) {
      console.error('签到失败:', error);
      return { success: false, message: '签到失败' };
    }
  }

  /**
   * 获取签到状态
   */
  getSignInStatus() {
    try {
      const today = new Date().toDateString();
      const lastSignIn = wx.getStorageSync(this.LAST_SIGNIN_KEY);
      const currentStreak = wx.getStorageSync(this.SIGNIN_STREAK_KEY) || 0;
      
      return {
        hasSignedToday: lastSignIn === today,
        currentStreak,
        nextReward: this.getNextSignInReward(currentStreak + 1)
      };
    } catch (error) {
      console.error('获取签到状态失败:', error);
      return { hasSignedToday: false, currentStreak: 0, nextReward: 15 };
    }
  }

  /**
   * 获取下次签到奖励
   */
  getNextSignInReward(streak) {
    if (streak >= 30) return this.REWARD_RULES.signin_streak_30;
    if (streak >= 7) return this.REWARD_RULES.signin_streak_7;
    if (streak >= 2) return this.REWARD_RULES.signin_streak_2;
    return this.REWARD_RULES.signin_normal;
  }

  /**
   * 获取当日广告观看次数
   */
  getDailyAdCount() {
    const today = new Date().toDateString();
    const lastAdDate = wx.getStorageSync(this.LAST_AD_DATE_KEY);
    
    if (lastAdDate !== today) {
      // 新的一天，重置计数
      wx.setStorageSync(this.DAILY_AD_COUNT_KEY, 0);
      wx.setStorageSync(this.LAST_AD_DATE_KEY, today);
      return 0;
    }
    
    return wx.getStorageSync(this.DAILY_AD_COUNT_KEY) || 0;
  }

  /**
   * 根据观看次数获取当前奖励金额
   */
  getCurrentAdReward() {
    const count = this.getDailyAdCount();
    
    for (const tier of this.AD_REWARD_TIERS) {
      if (count < tier.count) {
        return tier.reward;
      }
    }
    
    return this.AD_REWARD_TIERS[this.AD_REWARD_TIERS.length - 1].reward;
  }

  /**
   * 获取下次观看奖励信息
   */
  getNextAdRewardInfo() {
    const count = this.getDailyAdCount();
    const currentReward = this.getCurrentAdReward();
    
    // 找到当前所在的奖励层级
    let currentTier = this.AD_REWARD_TIERS.find(tier => count < tier.count);
    if (!currentTier) {
      currentTier = this.AD_REWARD_TIERS[this.AD_REWARD_TIERS.length - 1];
    }
    
    // 计算剩余次数
    const remainingInTier = currentTier.count - count;
    
    return {
      currentReward,
      currentCount: count,
      remainingInTier: remainingInTier > 0 ? remainingInTier : 0,
      tierDescription: currentTier.description,
      maxDailyCount: 15 // 每日最多观看15次
    };
  }

  /**
   * 观看激励广告奖励积分 - 支持递减机制
   */
  async watchAdReward() {
    try {
      const count = this.getDailyAdCount();
      const maxDaily = 15;
      
      // 检查每日观看限制
      if (count >= maxDaily) {
        wx.showToast({
          title: '今日观看次数已用完',
          icon: 'none',
          duration: 2000
        });
        return { success: false, message: '今日观看次数已用完' };
      }
      
      const reward = this.getCurrentAdReward();
      
      // 增加积分
      const result = await this.addPoints(
        reward,
        'ad_watch',
        `观看激励广告(第${count + 1}次)`
      );

      // 更新观看次数
      wx.setStorageSync(this.DAILY_AD_COUNT_KEY, count + 1);
      
      // 获取下次奖励信息
      const nextInfo = this.getNextAdRewardInfo();
      
      wx.showToast({
        title: `获得${reward}积分！`,
        icon: 'success',
        duration: 2000
      });

      // 🎯 新增：立即通知页面刷新积分显示
      wx.setStorageSync('points_updated', Date.now());

      return { 
        success: true, 
        reward, 
        newCount: count + 1,
        nextReward: nextInfo.currentReward,
        remainingToday: maxDaily - (count + 1)
      };
    } catch (error) {
      console.error('广告奖励失败:', error);
      throw error;
    }
  }

  /**
   * 记录积分交易日志
   */
  logPointsTransaction(transaction) {
    try {
      const TRANSACTION_LOG_KEY = 'points_transaction_log';
      let logs = wx.getStorageSync(TRANSACTION_LOG_KEY) || [];
      
      logs.unshift(transaction);
      
      // 只保留最近100条记录
      if (logs.length > 100) {
        logs = logs.slice(0, 100);
      }
      
      wx.setStorageSync(TRANSACTION_LOG_KEY, logs);
    } catch (error) {
      console.error('记录交易日志失败:', error);
    }
  }

  /**
   * 获取积分交易历史
   */
  getTransactionHistory(limit = 20) {
    try {
      const TRANSACTION_LOG_KEY = 'points_transaction_log';
      const logs = wx.getStorageSync(TRANSACTION_LOG_KEY) || [];
      return logs.slice(0, limit);
    } catch (error) {
      console.error('获取交易历史失败:', error);
      return [];
    }
  }

  /**
   * 检查功能权限
   */
  checkFeatureAccess(feature) {
    const requiredPoints = Math.abs(this.POINT_RULES[feature] || 0);
    const currentPoints = this.getCurrentPoints();
    
    return {
      hasAccess: currentPoints >= requiredPoints,
      currentPoints,
      requiredPoints,
      needMorePoints: Math.max(0, requiredPoints - currentPoints)
    };
  }

  /**
   * 检查按钮权限
   */
  checkButtonAccess(buttonId) {
    const requiredPoints = Math.abs(this.BUTTON_RULES[buttonId] || 0);
    const currentPoints = this.getCurrentPoints();
    
    return {
      hasAccess: currentPoints >= requiredPoints,
      currentPoints,
      requiredPoints,
      needMorePoints: Math.max(0, requiredPoints - currentPoints),
      isFree: requiredPoints === 0
    };
  }
}

// 创建单例实例
const pointsManager = new PointsManager();

module.exports = pointsManager; 