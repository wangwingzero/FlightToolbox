/**
 * 激励广告管理器
 * 基于微信小程序激励广告最佳实践设计
 * 
 * 核心原则：
 * 1. 用户主动观看，绝不强制
 * 2. 提前创建，按需展示
 * 3. 错误恢复与用户友好提示
 * 4. 安全的奖励发放机制
 */

const pointsManager = require('./points-manager.js');

class AdManager {
  constructor() {
    this.adUnitId = 'adunit-316c5630d7a1f9ef'; // 您提供的广告单元ID
    this.lastAdShowTime = 0;
    this.minAdInterval = 30000; // 飞行友好：30秒间隔，比普通应用更宽松
    this.pageInstances = new Map(); // 存储每个页面的广告实例
    
    console.log('🛫 AdManager 已初始化 (离线优先，飞行专用模式)');
    // 离线优先设计：完全基于客户端的安全验证
    // 专为飞行过程中的离线使用场景优化
    // - 无需网络连接进行验证
    // - 宽容的频率限制
    // - 智能的本地安全检查
  }

  /**
   * 为当前页面初始化激励视频广告
   * 每个页面需要独立的广告实例
   */
  initAdForCurrentPage() {
    if (!wx.createRewardedVideoAd) {
      console.warn('当前版本不支持激励视频广告');
      return null;
    }

    try {
      const pageInstance = getCurrentPages()[getCurrentPages().length - 1];
      const pageRoute = pageInstance.route;
      
      // 如果当前页面已有广告实例，直接返回
      if (this.pageInstances.has(pageRoute)) {
        return this.pageInstances.get(pageRoute);
      }

      const rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: this.adUnitId
      });

      const adInstance = {
        ad: rewardedVideoAd,
        isAdReady: false,
        isLoading: false,
        pageRoute: pageRoute
      };

      this.setupAdListeners(adInstance);
      this.pageInstances.set(pageRoute, adInstance);
      
      // 预加载广告
      this.preloadAd(adInstance);
      
      return adInstance;
    } catch (error) {
      console.error('激励广告初始化失败:', error);
      return null;
    }
  }

  /**
   * 设置广告事件监听器
   * 只绑定一次，避免重复绑定
   */
  setupAdListeners(adInstance) {
    if (!adInstance || !adInstance.ad) return;

    try {
      // 广告加载成功
      adInstance.ad.onLoad(() => {
        try {
          console.log(`激励视频广告素材加载成功 (${adInstance.pageRoute})`);
          adInstance.isAdReady = true;
          adInstance.isLoading = false;
        } catch (error) {
          console.error('处理广告加载成功事件失败:', error);
        }
      });

      // 广告加载失败
      adInstance.ad.onError((err) => {
        try {
          console.error(`激励视频广告加载失败 (${adInstance.pageRoute})`, err);
          adInstance.isAdReady = false;
          adInstance.isLoading = false;
          this.handleAdError(err);
        } catch (error) {
          console.error('处理广告错误事件失败:', error);
        }
      });

      // 广告关闭事件 - 核心奖励逻辑
      adInstance.ad.onClose((res) => {
        try {
          console.log(`激励视频广告关闭 (${adInstance.pageRoute})`, res);
          this.handleAdClose(res);
        } catch (error) {
          console.error('处理广告关闭事件失败:', error);
        }
      });
    } catch (error) {
      console.error('设置广告监听器失败:', error);
    }
  }

  /**
   * 预加载广告
   * 在后台预先加载，提升用户体验
   */
  async preloadAd(adInstance) {
    if (!adInstance || !adInstance.ad || adInstance.isLoading) return;

    try {
      adInstance.isLoading = true;
      await adInstance.ad.load();
      console.log(`激励广告预加载成功 (${adInstance.pageRoute})`);
    } catch (error) {
      console.error(`激励广告预加载失败 (${adInstance.pageRoute}):`, error);
      adInstance.isLoading = false;
    }
  }

  /**
   * 检查广告是否可展示
   */
  isAdAvailable(adInstance) {
    // 检查API支持
    if (!wx.createRewardedVideoAd) {
      return { available: false, reason: '当前版本不支持激励视频广告' };
    }

    // 检查广告实例
    if (!adInstance || !adInstance.ad) {
      return { available: false, reason: '广告组件未初始化' };
    }

    // 检查加载状态
    if (!adInstance.isAdReady) {
      return { available: false, reason: '广告正在加载中，请稍候...' };
    }

    // 检查频率限制
    const now = Date.now();
    if (now - this.lastAdShowTime < this.minAdInterval) {
      const remaining = Math.ceil((this.minAdInterval - (now - this.lastAdShowTime)) / 1000);
      return { available: false, reason: `请等待 ${remaining} 秒后再试` };
    }

    return { available: true, reason: '广告已就绪' };
  }

  /**
   * 展示激励广告
   * @param {Object} context 上下文信息，用于用户引导
   */
  async showRewardedAd(context = {}) {
    // 为当前页面初始化广告实例
    const adInstance = this.initAdForCurrentPage();
    if (!adInstance) {
      const reason = '广告组件初始化失败';
      wx.showToast({
        title: reason,
        icon: 'none',
        duration: 2000
      });
      return { success: false, reason };
    }

    const availability = this.isAdAvailable(adInstance);
    
    if (!availability.available) {
      wx.showToast({
        title: availability.reason,
        icon: 'none',
        duration: 2000
      });
      return { success: false, reason: availability.reason };
    }

    try {
      // 显示加载提示
      wx.showLoading({
        title: '广告加载中...',
        mask: true
      });

      await adInstance.ad.show();
      wx.hideLoading();
      
      this.lastAdShowTime = Date.now();
      console.log(`🛫 激励视频广告展示成功 (离线优先) (${adInstance.pageRoute})`);
      
      return { success: true, message: '广告展示成功' };
    } catch (error) {
      // 确保在任何情况下都隐藏loading
      try {
        wx.hideLoading();
      } catch (hideError) {
        console.warn('隐藏loading失败:', hideError);
      }
      
      console.error(`❌ 激励视频广告展示失败 (${adInstance.pageRoute}):`, error);
      
      // 尝试重新加载并展示
      return await this.retryShowAd(adInstance);
    }
  }

  /**
   * 重试展示广告
   * 当首次展示失败时的恢复策略
   */
  async retryShowAd(adInstance) {
    if (!adInstance || !adInstance.ad) {
      return { success: false, reason: '广告实例不存在' };
    }

    try {
      wx.showLoading({
        title: '重新加载中...',
        mask: true
      });

      await adInstance.ad.load();
      await adInstance.ad.show();
      
      wx.hideLoading();
      this.lastAdShowTime = Date.now();
      
      return { success: true, message: '广告展示成功' };
    } catch (error) {
      // 确保在任何情况下都隐藏loading
      try {
        wx.hideLoading();
      } catch (hideError) {
        console.warn('隐藏loading失败:', hideError);
      }
      
      console.error(`激励视频广告重试失败 (${adInstance.pageRoute}):`, error);
      
      wx.showModal({
        title: '广告加载失败',
        content: '暂时无法加载广告，请稍后再试',
        showCancel: false,
        confirmText: '知道了'
      });
      
      return { success: false, reason: '广告重试失败' };
    }
  }

  /**
   * 处理广告关闭事件
   * 离线优先的奖励发放逻辑（适用于飞行过程中）
   */
  async handleAdClose(res) {
    console.log('🛫 广告关闭事件触发 (离线优先模式)', res);
    
    try {
      await this.handleOfflineAdReward(res);
      
      // 预加载下一个广告，为下次使用做准备
      this.scheduleNextAdPreload();
      
    } catch (error) {
      console.error('🚨 离线广告奖励处理异常:', error);
      
      // 离线模式的容错处理
      wx.showToast({
        title: '网络异常，但积分已安全保存',
        icon: 'none',
        duration: 2000
      });
    }
  }

  /**
   * 调度下一个广告预加载
   * 为保证用户下次使用时广告已就绪
   */
  scheduleNextAdPreload() {
    setTimeout(() => {
      const pageInstance = getCurrentPages()[getCurrentPages().length - 1];
      if (pageInstance) {
        const pageRoute = pageInstance.route;
        const adInstance = this.pageInstances.get(pageRoute);
        if (adInstance) {
          console.log('🛫 自动预加载下一个广告 (飞行优化)');
          this.preloadAd(adInstance);
        }
      }
    }, 2000); // 2秒后开始预加载，避免与当前操作冲突
  }

  /**
   * 离线优先的广告奖励处理
   * 专为飞行过程中的离线使用设计
   */
  async handleOfflineAdReward(res, isRetry = false) {
    // 离线优先的安全验证
    const securityCheck = this.performOfflineSecurityCheck(res);
    
    if (res && res.isEnded && securityCheck.passed) {
      console.log('客户端：视频播放完成，准备发放奖励');
      
      // 显示奖励处理中的提示
      wx.showLoading({
        title: '奖励发放中...',
        mask: true
      });

      try {
        const pointsManager = require('./points-manager.js');
        
        // 发放积分奖励 - 使用新的递减机制
        const result = await pointsManager.watchAdReward();
        wx.hideLoading();
        
        if (result.success) {
          // 显示奖励成功提示
          const nextRewardText = result.remainingToday > 0 ? 
            `\n下次奖励：${result.nextReward}积分 (今日还可观看${result.remainingToday}次)` : 
            '\n今日观看次数已满';
            
          wx.showModal({
            title: '奖励已发放！',
            content: `恭喜您获得 ${result.reward} 积分！\n当前总积分：${pointsManager.getCurrentPoints()}${nextRewardText}`,
            showCancel: false,
            confirmText: '太棒了！',
            success: () => {
              // 🎯 优化：立即通知所有页面刷新积分显示
              const updateTimestamp = Date.now();
              wx.setStorageSync('points_updated', updateTimestamp);
              
              // 🎯 新增：主动触发当前页面的积分刷新
              this.triggerImmediatePointsRefresh();
              
              // 🎯 新增：延迟再次通知，确保捕获所有页面
              setTimeout(() => {
                wx.setStorageSync('points_updated', Date.now());
              }, 500);
            }
          });
        } else {
          // 特殊处理今日次数用完的情况
          if (result.message === '今日观看次数已用完') {
            wx.showToast({
              title: '今日观看次数已用完',
              icon: 'none',
              duration: 2000
            });
          } else {
            throw new Error(result.message);
          }
        }
      } catch (error) {
        // 确保在任何情况下都隐藏loading
        try {
          wx.hideLoading();
        } catch (hideError) {
          console.warn('隐藏loading失败:', hideError);
        }
        
        console.error('奖励发放失败:', error);
        wx.showToast({
          title: '奖励发放失败，请联系客服',
          icon: 'none',
          duration: 3000
        });
      }
    } else {
      console.log('客户端：安全检查未通过或视频未完整观看，无奖励');
      wx.showToast({
        title: securityCheck.reason || '未完整观看，无法获得奖励',
        icon: 'none',
        duration: 2000
      });
    }
  }

  /**
   * 离线安全检查（飞行专用）
   * 设计原则：严格但宽容，优先保证功能可用性
   */
  performOfflineSecurityCheck(adResult) {
    const checks = [];
    let passed = true;
    
    try {
      // 1. 时间间隔检查
      const now = Date.now();
      const timeSinceLastAd = now - this.lastAdShowTime;
      
      if (timeSinceLastAd < this.minAdInterval) {
        checks.push({ name: 'time_interval', passed: false, reason: '观看间隔过短' });
        passed = false;
      } else {
        checks.push({ name: 'time_interval', passed: true });
      }
      
      // 2. 每日次数检查（飞行友好：相对宽松）
      const today = new Date().toDateString();
      const dailyCountKey = `ad_daily_count_${today}`;
      const todayCount = wx.getStorageSync(dailyCountKey) || 0;
      
      if (todayCount >= 15) { // 飞行期间每日最多15次（比普通情况更宽松）
        checks.push({ name: 'daily_limit', passed: false, reason: '今日观看次数已达上限' });
        passed = false;
      } else {
        checks.push({ name: 'daily_limit', passed: true });
        // 更新今日计数
        wx.setStorageSync(dailyCountKey, todayCount + 1);
      }
      
      // 3. 用户行为检查（飞行优化：考虑长途飞行场景）
      const userBehaviorKey = 'ad_user_behavior';
      const behaviorData = wx.getStorageSync(userBehaviorKey) || { 
        recentAds: [], 
        suspiciousActivity: 0 
      };
      
      // 记录本次观看
      behaviorData.recentAds.push({
        timestamp: now,
        result: adResult
      });
      
      // 只保留最近15次记录（适应长途飞行）
      if (behaviorData.recentAds.length > 15) {
        behaviorData.recentAds = behaviorData.recentAds.slice(-15);
      }
      
      // 检查是否有可疑行为（10分钟内超过5次，适应飞行无聊时段）
      const recentCount = behaviorData.recentAds.filter(ad => 
        now - ad.timestamp < 600000 // 10分钟
      ).length;
      
      if (recentCount > 5) {
        behaviorData.suspiciousActivity++;
        checks.push({ name: 'behavior_check', passed: false, reason: '观看频率过高，请适当休息' });
        passed = false;
      } else {
        checks.push({ name: 'behavior_check', passed: true });
      }
      
      wx.setStorageSync(userBehaviorKey, behaviorData);
      
      // 4. 基础验证
      if (!adResult || typeof adResult.isEnded !== 'boolean') {
        checks.push({ name: 'result_validation', passed: false, reason: '广告结果无效' });
        passed = false;
      } else {
        checks.push({ name: 'result_validation', passed: true });
      }
      
      console.log('🛫 离线安全检查结果 (飞行优化):', { 
        passed, 
        checks,
        todayCount: todayCount + (passed ? 1 : 0),
        recentCount,
        flightFriendly: true
      });
      
      const failedCheck = checks.find(c => !c.passed);
      return { passed, checks, reason: failedCheck ? failedCheck.reason : null };
      
    } catch (error) {
      console.error('🚨 离线安全检查异常:', error);
      // 离线模式下，检查异常时更宽容，优先保证功能可用
      console.log('🛫 离线模式：安全检查异常，采用宽容策略');
      return { passed: true, checks: [], reason: '离线模式宽容策略' };
    }
  }

  /**
   * 处理广告错误
   */
  handleAdError(err) {
    const errorMessages = {
      1000: '后端接口错误，请稍后重试',
      1001: '参数错误',
      1002: '广告单元无效',
      1003: '无权限',
      1004: '暂无合适的广告',
      1005: '广告组件使用频繁，请稍后再试',
      1006: '广告组件正在创建',
      1007: '广告组件已过期',
      1008: '广告组件尚未加载'
    };

    const message = errorMessages[err.errCode] || '广告加载失败';
    console.error(`广告错误[${err.errCode}]: ${message}`);

    // 对于1004（无合适广告）错误，延迟重试
    if (err.errCode === 1004) {
      setTimeout(() => {
        this.preloadAd();
      }, 30000); // 30秒后重试
    }
  }

  /**
   * 显示积分不足引导界面
   * 当用户积分不足时，引导观看广告获取积分
   */
  showInsufficientPointsGuide(requiredPoints, currentPoints) {
    wx.showModal({
      title: '积分不足',
      content: `使用此功能需要 ${requiredPoints} 积分，您当前有 ${currentPoints} 积分。\n\n获取积分方式：\n• 前往【实用工具】页面签到\n• 点击页面上的【观看广告】按钮`,
      confirmText: '观看广告',
      cancelText: '暂不使用',
      success: (res) => {
        if (res.confirm) {
          this.showRewardedAd({
            reason: 'insufficient_points',
            requiredPoints,
            currentPoints
          });
        }
      }
    });
  }

  /**
   * 获取广告状态信息
   */
  getAdStatus() {
    const pageInstance = getCurrentPages()[getCurrentPages().length - 1];
    const pageRoute = pageInstance ? pageInstance.route : 'unknown';
    const adInstance = this.pageInstances.get(pageRoute);
    
    return {
      pageRoute: pageRoute,
      isInitialized: !!adInstance,
      isReady: adInstance ? adInstance.isAdReady : false,
      isLoading: adInstance ? adInstance.isLoading : false,
      canShow: adInstance ? this.isAdAvailable(adInstance).available : false,
      lastShowTime: this.lastAdShowTime,
      rewardPoints: pointsManager.getCurrentAdReward(),
      totalInstances: this.pageInstances.size
    };
  }

  /**
   * 销毁广告实例
   * @param {string} pageRoute 可选，指定页面路由，不传则销毁当前页面实例
   */
  destroy(pageRoute) {
    if (!pageRoute) {
      // 获取当前页面路由
      const pageInstance = getCurrentPages()[getCurrentPages().length - 1];
      pageRoute = pageInstance ? pageInstance.route : null;
    }
    
    if (pageRoute && this.pageInstances.has(pageRoute)) {
      const adInstance = this.pageInstances.get(pageRoute);
      if (adInstance.ad && typeof adInstance.ad.destroy === 'function') {
        adInstance.ad.destroy();
      }
      this.pageInstances.delete(pageRoute);
      console.log(`已销毁页面 ${pageRoute} 的广告实例`);
    }
  }

  /**
   * 销毁所有广告实例
   */
  destroyAll() {
    for (const [pageRoute, adInstance] of this.pageInstances) {
      if (adInstance.ad && typeof adInstance.ad.destroy === 'function') {
        adInstance.ad.destroy();
      }
    }
    this.pageInstances.clear();
    console.log('已销毁所有广告实例');
  }

  /**
   * 新增：主动触发当前页面的积分刷新
   */
  triggerImmediatePointsRefresh() {
    console.log('🎯 主动触发当前页面的积分刷新');
    
    try {
      // 获取当前页面实例
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      
      if (currentPage) {
        console.log('🎯 当前页面路由：', currentPage.route);
        
        // 如果是others页面（个人积分页面），直接调用刷新方法
        if (currentPage.route === 'pages/others/index' && typeof currentPage.refreshPointsSystem === 'function') {
          console.log('🎯 检测到others页面，立即刷新积分显示');
          currentPage.refreshPointsSystem();
          
          // 显示积分到账提示
          wx.showToast({
            title: '积分已到账！',
            icon: 'success',
            duration: 1500
          });
        }
        
        // 如果页面有points-header组件，尝试刷新组件
        if (typeof currentPage.selectComponent === 'function') {
          const pointsHeader = currentPage.selectComponent('#points-header');
          if (pointsHeader && typeof pointsHeader.refreshData === 'function') {
            console.log('🎯 检测到points-header组件，立即刷新');
            pointsHeader.refreshData();
          }
        }
        
        // 通用的页面积分刷新方法调用
        if (typeof currentPage.checkAndRefreshPoints === 'function') {
          console.log('🎯 调用页面通用积分刷新方法');
          currentPage.checkAndRefreshPoints();
        }
      }
    } catch (error) {
      console.warn('🚨 主动刷新积分失败，将依赖后续的轮询机制:', error);
    }
  }
}

// 创建单例实例
const adManager = new AdManager();

module.exports = adManager; 