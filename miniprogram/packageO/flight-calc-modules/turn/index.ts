// 转弯半径计算页面

Page({
  data: {
    isDarkMode: false,
    turn: {
      bankAngle: '',
      groundSpeed: '',
      radiusMeters: '',
      turnRate: ''
    }
  },

  onLoad() {
    // 🎯 进入页面时扣减积分 - 转弯半径计算 1积分
    const pointsManager = require('../../../utils/points-manager.js');
    
    pointsManager.consumePoints('flight-calc-turn', '转弯半径计算功能使用').then((result: any) => {
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
        console.log('积分不足，无法使用转弯半径计算功能');
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

  onBankAngleChange(event: any) {
    this.setData({
      'turn.bankAngle': event.detail
    });
  },

  onGroundSpeedChange(event: any) {
    this.setData({
      'turn.groundSpeed': event.detail
    });
  },

  calculateTurn() {
    const bankAngle = parseFloat(this.data.turn.bankAngle);
    const groundSpeed = parseFloat(this.data.turn.groundSpeed);

    if (isNaN(bankAngle) || isNaN(groundSpeed)) {
      wx.showToast({
        title: '请输入有效的数值',
        icon: 'none'
      });
      return;
    }

    if (bankAngle <= 0 || bankAngle >= 90) {
      wx.showToast({
        title: '坡度角必须在0到90度之间',
        icon: 'none'
      });
      return;
    }

    if (groundSpeed <= 0) {
      wx.showToast({
        title: '地速必须大于0',
        icon: 'none'
      });
      return;
    }

    // 转换单位：节转换为米/秒
    const groundSpeedMs = groundSpeed * 0.514444;

    // 计算转弯半径 (米)
    const bankAngleRad = bankAngle * Math.PI / 180;
    const radiusMeters = (groundSpeedMs * groundSpeedMs) / (9.81 * Math.tan(bankAngleRad));
    
    // 将转弯半径从米转换为海里 (1海里 = 1852米)
    const radiusNauticalMiles = radiusMeters / 1852;

    // 计算转弯率 (度/秒)
    const turnRate = (9.81 * Math.tan(bankAngleRad)) / groundSpeedMs * 180 / Math.PI;

    this.setData({
      'turn.radiusMeters': this.formatNumber(radiusNauticalMiles), // 现在存储的是海里值
      'turn.turnRate': this.formatNumber(turnRate)
    });

    wx.showToast({
      title: '转弯半径计算完成',
      icon: 'success'
    });
  },

  clearTurn() {
    this.setData({
      'turn.bankAngle': '',
      'turn.groundSpeed': '',
      'turn.radiusMeters': '',
      'turn.turnRate': ''
    });
    wx.showToast({
      title: '数据已清空',
      icon: 'success'
    });
  },

  formatNumber(num: number): string {
    // 对于海里，保留更多精度
    if (num >= 10) {
      return num.toFixed(1);
    } else if (num >= 1) {
      return num.toFixed(2);
    } else {
      return num.toFixed(3);
    }
  }
});