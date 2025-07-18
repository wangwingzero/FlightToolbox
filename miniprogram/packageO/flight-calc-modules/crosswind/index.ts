// 侧风分量计算页面

Page({
  data: {
    isDarkMode: false,
    crosswind: {
      trueAirspeed: '',
      heading: '',
      windDirection: '',
      windSpeed: '',
      crosswindComponent: '',
      headwindComponent: '',
      driftAngle: '',
      groundSpeed: ''
    }
  },

  onLoad() {
    // 🎯 进入页面时扣减积分 - 侧风分量计算 1积分
    const pointsManager = require('../../../utils/points-manager.js');
    
    pointsManager.consumePoints('flight-calc-crosswind', '侧风分量计算功能使用').then((result: any) => {
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
        console.log('积分不足，无法使用侧风分量计算功能');
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

  onTrueAirspeedChange(event: any) {
    this.setData({
      'crosswind.trueAirspeed': event.detail
    });
  },

  onHeadingChange(event: any) {
    this.setData({
      'crosswind.heading': event.detail
    });
  },

  onWindDirectionChange(event: any) {
    this.setData({
      'crosswind.windDirection': event.detail
    });
  },

  onWindSpeedChange(event: any) {
    this.setData({
      'crosswind.windSpeed': event.detail
    });
  },

  calculateCrosswind() {
    const validateParams = () => {
      const tas = parseFloat(this.data.crosswind.trueAirspeed);
      const heading = parseFloat(this.data.crosswind.heading);
      const windDir = parseFloat(this.data.crosswind.windDirection);
      const windSpeed = parseFloat(this.data.crosswind.windSpeed);

      if (isNaN(tas) || isNaN(heading) || isNaN(windDir) || isNaN(windSpeed)) {
        return {
          valid: false,
          message: '请输入有效的数值'
        };
      }

      if (tas <= 0 || windSpeed < 0) {
        return {
          valid: false,
          message: '真空速必须大于0，风速不能为负'
        };
      }

      return { valid: true };
    };

    const performCalculation = () => {
      const tas = parseFloat(this.data.crosswind.trueAirspeed);
      const heading = parseFloat(this.data.crosswind.heading);
      const windDir = parseFloat(this.data.crosswind.windDirection);
      const windSpeed = parseFloat(this.data.crosswind.windSpeed);

      // 计算风向与航向的夹角
      let windAngle = windDir - heading;
      if (windAngle > 180) windAngle -= 360;
      if (windAngle < -180) windAngle += 360;

      // 转换为弧度
      const windAngleRad = windAngle * Math.PI / 180;

      // 计算侧风分量和顶风分量
      const crosswindComponent = Math.abs(windSpeed * Math.sin(windAngleRad));
      const headwindComponent = windSpeed * Math.cos(windAngleRad);

      // 计算偏流角
      const driftAngle = Math.asin(windSpeed * Math.sin(windAngleRad) / tas) * 180 / Math.PI;

      // 计算地速
      const groundSpeed = Math.sqrt(tas * tas + windSpeed * windSpeed + 2 * tas * windSpeed * Math.cos(windAngleRad));

      this.setData({
        'crosswind.crosswindComponent': this.formatNumber(crosswindComponent),
        'crosswind.headwindComponent': this.formatNumber(headwindComponent),
        'crosswind.driftAngle': this.formatNumber(driftAngle),
        'crosswind.groundSpeed': this.formatNumber(groundSpeed)
      });

      wx.showToast({
        title: '侧风分量计算完成',
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

  clearCrosswind() {
    this.setData({
      'crosswind.trueAirspeed': '',
      'crosswind.heading': '',
      'crosswind.windDirection': '',
      'crosswind.windSpeed': '',
      'crosswind.crosswindComponent': '',
      'crosswind.headwindComponent': '',
      'crosswind.driftAngle': '',
      'crosswind.groundSpeed': ''
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