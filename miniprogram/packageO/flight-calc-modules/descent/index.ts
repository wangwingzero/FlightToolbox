// 下降率计算页面

Page({
  data: {
    // 🎯 全局主题状态
    isDarkMode: false,
    
    // 下降率计算数据
    descent: {
      currentAltitude: '',
      targetAltitude: '',
      distanceNM: '',
      currentGroundSpeed: '',
      descentRate: '',
      descentAngle: '',
      timeToDescend: '',
      descentGradient: ''
    }
  },

  onLoad() {
    // 🎯 进入页面时扣减积分 - 下降率计算 1积分
    const pointsManager = require('../../../utils/points-manager.js');
    
    pointsManager.consumePoints('flight-calc-descent', '下降率计算功能使用').then((result: any) => {
      if (result.success) {
        // 显示统一格式的积分消耗提示
        if (result.message !== '该功能免费使用') {
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 2000
          });
        }
        
        // 积分扣费成功后初始化页面
        const app = getApp<any>();
        this.setData({
          isDarkMode: app.globalData.isDarkMode || false
        });
      } else {
        // 积分不足，返回上一页
        console.log('积分不足，无法使用下降率计算功能');
        wx.showModal({
          title: '积分不足',
          content: `此功能需要 ${result.requiredPoints} 积分，您当前有 ${result.currentPoints} 积分。`,
          showCancel: true,
          cancelText: '返回',
          confirmText: '获取积分',
          success: (res: any) => {
            if (res.confirm) {
              // 跳转到积分获取页面（首页签到/观看广告）
              wx.switchTab({
                url: '/pages/others/index'
              });
            } else {
              // 返回上一页
              wx.navigateBack();
            }
          }
        });
      }
    }).catch((error: any) => {
      console.error('积分扣费失败:', error);
      // 错误回退：继续使用功能，确保用户体验
      const app = getApp<any>();
      this.setData({
        isDarkMode: app.globalData.isDarkMode || false
      });
      wx.showToast({
        title: '积分系统暂时不可用，功能正常开放',
        icon: 'none',
        duration: 3000
      });
    });
  },

  onShow() {
    // 每次显示时更新主题状态
    const app = getApp<any>();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    });
  },

  // 下降率计算相关方法
  onCurrentAltitudeChange(event: any) {
    this.setData({
      'descent.currentAltitude': event.detail
    });
  },

  onTargetAltitudeChange(event: any) {
    this.setData({
      'descent.targetAltitude': event.detail
    });
  },

  onDistanceNMChange(event: any) {
    this.setData({
      'descent.distanceNM': event.detail
    });
  },

  onCurrentGroundSpeedChange(event: any) {
    this.setData({
      'descent.currentGroundSpeed': event.detail
    });
  },

  // 计算下降率
  calculateDescentRate() {
    const validateParams = () => {
      const currentAltitude = parseFloat(this.data.descent.currentAltitude);
      const targetAltitude = parseFloat(this.data.descent.targetAltitude);
      const distanceNM = parseFloat(this.data.descent.distanceNM);
      const currentGroundSpeed = parseFloat(this.data.descent.currentGroundSpeed);

      if (isNaN(currentAltitude) || isNaN(targetAltitude) || isNaN(distanceNM) || isNaN(currentGroundSpeed)) {
        return {
          valid: false,
          message: '请输入有效的数值'
        };
      }

      if (currentAltitude <= targetAltitude) {
        return {
          valid: false,
          message: '当前高度必须大于目标高度'
        };
      }

      if (distanceNM <= 0) {
        return {
          valid: false,
          message: '距离必须大于0'
        };
      }

      if (currentGroundSpeed <= 0) {
        return {
          valid: false,
          message: '地速必须大于0'
        };
      }

      return { valid: true };
    };

    const performCalculation = () => {
      const currentAltitude = parseFloat(this.data.descent.currentAltitude);
      const targetAltitude = parseFloat(this.data.descent.targetAltitude);
      const distanceNM = parseFloat(this.data.descent.distanceNM);
      const currentGroundSpeed = parseFloat(this.data.descent.currentGroundSpeed);

      // 计算高度差
      const altitudeDifference = currentAltitude - targetAltitude;

      // 计算下降率 (英尺/分钟)
      const timeToDescendHours = distanceNM / currentGroundSpeed;
      const timeToDescendMinutes = timeToDescendHours * 60;
      const descentRate = altitudeDifference / timeToDescendMinutes;

      // 计算下降角度
      const descentAngle = Math.atan(altitudeDifference / (distanceNM * 6076.12)) * (180 / Math.PI);

      // 计算下降梯度 (%)
      const descentGradient = (altitudeDifference / (distanceNM * 6076.12)) * 100;

      this.setData({
        'descent.descentRate': this.formatNumber(descentRate),
        'descent.descentAngle': this.formatNumber(descentAngle),
        'descent.timeToDescend': this.formatNumber(timeToDescendMinutes),
        'descent.descentGradient': this.formatNumber(descentGradient)
      });

      wx.showToast({
        title: '下降率计算完成',
        icon: 'success'
      });
    };

    // 🎯 移除按钮级扣费，改为页面级扣费（在首页进入飞行计算工具时扣费）
    // 直接执行计算逻辑
    const validation = validateParams();
    if (!validation.valid) {
      wx.showToast({
        title: validation.message || '参数不完整',
        icon: 'none'
      });
      return;
    }
    
    performCalculation();
  },

  // 清空下降率数据
  clearDescentRate() {
    this.setData({
      'descent.currentAltitude': '',
      'descent.targetAltitude': '',
      'descent.distanceNM': '',
      'descent.currentGroundSpeed': '',
      'descent.descentRate': '',
      'descent.descentAngle': '',
      'descent.timeToDescend': '',
      'descent.descentGradient': ''
    });
    wx.showToast({
      title: '数据已清空',
      icon: 'success'
    });
  },

  // 格式化数字
  formatNumber(num: number): string {
    return Math.round(num * 100) / 100 + '';
  }
});