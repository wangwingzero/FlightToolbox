const pointsManager = require('../../utils/points-manager.js');
const adManager = require('../../utils/ad-manager.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示签到按钮
    showSignIn: {
      type: Boolean,
      value: true
    },
    // 是否显示广告按钮
    showAd: {
      type: Boolean,
      value: true
    },
    // 页面类型，用于计算消费积分
    pageType: {
      type: String,
      value: ''
    },
    points: {
      type: Number,
      value: 0
    },
    canSignIn: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentPoints: 0,
    showPointsDetail: false,
    signInStatus: {
      hasSignedToday: false,
      currentStreak: 0,
      nextReward: 15
    },
    adStatus: {
      isReady: false,
      isLoading: false,
      canShow: false,
      rewardPoints: 40
    },
    transactionHistory: []
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this.initPointsHeader();
    },

    detached() {
      // 清理资源
    }
  },

  /**
   * 页面生命周期
   */
  pageLifetimes: {
    show() {
      this.refreshData();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 初始化积分头部组件
     */
    initPointsHeader() {
      this.refreshData();
      
      // 初始化用户（新用户奖励）
      pointsManager.initUser();
    },

    /**
     * 刷新数据
     */
    refreshData() {
      // 更新积分
      const currentPoints = pointsManager.getCurrentPoints();
      
      // 更新签到状态
      const signInStatus = pointsManager.getSignInStatus();
      
      // 更新广告状态
      const adStatus = adManager.getAdStatus();
      
      // 获取交易历史
      const transactionHistory = pointsManager.getTransactionHistory(10);

      this.setData({
        currentPoints,
        signInStatus,
        adStatus,
        transactionHistory
      });
    },

    /**
     * 点击积分显示区域
     */
    onPointsDetailTap() {
      this.setData({
        showPointsDetail: true
      });
    },

    /**
     * 关闭积分详情弹窗
     */
    closePointsDetail() {
      this.setData({
        showPointsDetail: false
      });
    },

    /**
     * 签到按钮点击
     */
    async onSignInTap() {
      if (this.data.signInStatus.hasSignedToday) {
        wx.showToast({
          title: '今日已签到',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({
        title: '签到中...',
        mask: true
      });

      try {
        const result = await pointsManager.dailySignIn();
        wx.hideLoading();

        if (result.success) {
          // 签到成功
          wx.showModal({
            title: '签到成功！',
            content: result.message,
            showCancel: false,
            confirmText: '太棒了！',
            success: () => {
              this.refreshData();
              // 向父页面发送签到成功事件
              this.triggerEvent('signin-success', result);
            }
          });
        } else {
          wx.showToast({
            title: result.message,
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        wx.hideLoading();
        console.error('签到失败:', error);
        wx.showToast({
          title: '签到失败，请重试',
          icon: 'none'
        });
      }
    },

    /**
     * 观看广告按钮点击
     */
    async onWatchAdTap() {
      try {
        const result = await adManager.showRewardedAd({
          source: 'points_header',
          pageType: this.properties.pageType
        });

        if (result.success) {
          // 广告展示成功，等待奖励发放
          console.log('激励广告展示成功');
          
          // 延迟刷新数据，等待奖励到账
          setTimeout(() => {
            this.refreshData();
            this.triggerEvent('ad-reward', { success: true });
          }, 1000);
        }
      } catch (error) {
        console.error('激励广告展示失败:', error);
        this.triggerEvent('ad-reward', { success: false, error });
      }
    },

    /**
     * 检查功能访问权限
     * 供父页面调用
     */
    checkFeatureAccess(feature) {
      return pointsManager.checkFeatureAccess(feature);
    },

    /**
     * 消费积分
     * 供父页面调用
     */
    async consumePoints(feature, description) {
      const result = await pointsManager.consumePoints(feature, description);
      
      if (result.success) {
        // 消费成功，刷新显示
        this.refreshData();
        this.triggerEvent('points-consumed', result);
      } else {
        // 积分不足，显示引导
        adManager.showInsufficientPointsGuide(
          result.requiredPoints,
          result.currentPoints
        );
        this.triggerEvent('points-insufficient', result);
      }
      
      return result;
    },

    /**
     * 获取下一个里程碑文本
     */
    getNextMilestoneText(currentStreak) {
      if (currentStreak < 2) {
        return '连续2天可得+20积分';
      } else if (currentStreak < 7) {
        return `还需${7 - currentStreak}天达成7天连签`;
      } else if (currentStreak < 30) {
        return `还需${30 - currentStreak}天达成30天连签`;
      } else {
        return '已达成最高连签奖励！';
      }
    },

    /**
     * 获取连签进度百分比
     */
    getStreakProgress(currentStreak) {
      if (currentStreak < 7) {
        return (currentStreak / 7) * 100;
      } else if (currentStreak < 30) {
        return ((currentStreak - 7) / (30 - 7)) * 100;
      } else {
        return 100;
      }
    },

    /**
     * 获取交易描述
     */
    getTransactionDesc(transaction) {
      const descriptions = {
        'new_user': '新用户奖励',
        'ad_watch': '观看激励广告',
        'signin_normal': '每日签到',
        'signin_streak_2': '连续签到奖励',
        'signin_streak_7': '连续签到奖励',
        'signin_streak_30': '连续签到奖励',
        'flight-calc': '飞行速算',
        'unit-converter': '常用换算',
        'aviation-calculator': '特殊计算',
        'abbreviations': '万能查询',
        'event-report': '事件样例',
        'snowtam-decoder': '雪情通告',
        'dangerous-goods': '危险品',
        'twin-engine-goaround': '双发复飞梯度',
        'sunrise-sunset': '夜航时间',
        'flight-time-share': '分飞行时间'
      };
      
      return descriptions[transaction.reason || transaction.feature] || '积分交易';
    },

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      if (diff < 60000) {
        return '刚刚';
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
      } else {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      }
    },

    // 显示积分详情
    showPointsDetail() {
      this.triggerEvent('pointsDetail');
    },

    // 签到操作
    onSignIn() {
      this.triggerEvent('signIn');
    }
  }
}); 