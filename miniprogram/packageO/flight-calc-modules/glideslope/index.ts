// 下滑线高度计算页面

Page({
  data: {
    isDarkMode: false,
    glideslope: {
      angle: '3.0',
      distance: '',
      elevation: '0',
      altitude: '',
      absoluteAltitude: ''
    }
  },

  onLoad() {
    // 🎯 进入页面时扣减积分 - 下滑线高度计算 1积分
    const pointsManager = require('../../../utils/points-manager.js');
    
    pointsManager.consumePoints('flight-calc-glideslope', '下滑线高度计算功能使用').then((result: any) => {
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
        console.log('积分不足，无法使用下滑线高度计算功能');
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
    const app = getApp<any>();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    });
  },

  onAngleChange(event: any) {
    this.setData({
      'glideslope.angle': event.detail
    });
  },

  onDistanceChange(event: any) {
    this.setData({
      'glideslope.distance': event.detail
    });
  },

  onElevationChange(event: any) {
    this.setData({
      'glideslope.elevation': event.detail
    });
  },

  calculateGlideslope() {
    const angle = parseFloat(this.data.glideslope.angle);
    const distance = parseFloat(this.data.glideslope.distance);
    const elevation = parseFloat(this.data.glideslope.elevation);

    if (isNaN(angle) || isNaN(distance) || isNaN(elevation)) {
      wx.showToast({
        title: '请输入有效的数值',
        icon: 'none'
      });
      return;
    }

    if (angle <= 0 || angle >= 90) {
      wx.showToast({
        title: '下滑角必须在0到90度之间',
        icon: 'none'
      });
      return;
    }

    if (distance <= 0) {
      wx.showToast({
        title: '距离必须大于0',
        icon: 'none'
      });
      return;
    }

    // 计算下滑线高度
    const angleRad = angle * Math.PI / 180;
    const altitude = distance * 6076.12 * Math.tan(angleRad); // 海里转换为英尺

    // 计算绝对高度
    const absoluteAltitude = altitude + elevation;

    this.setData({
      'glideslope.altitude': this.formatNumber(altitude),
      'glideslope.absoluteAltitude': this.formatNumber(absoluteAltitude)
    });

    wx.showToast({
      title: '下滑线高度计算完成',
      icon: 'success'
    });
  },

  clearGlideslope() {
    this.setData({
      'glideslope.angle': '3.0',
      'glideslope.distance': '',
      'glideslope.elevation': '0',
      'glideslope.altitude': '',
      'glideslope.absoluteAltitude': ''
    });
    wx.showToast({
      title: '数据已清空',
      icon: 'success'
    });
  },

  formatNumber(num: number): string {
    return Math.round(num * 100) / 100 + '';
  }
});