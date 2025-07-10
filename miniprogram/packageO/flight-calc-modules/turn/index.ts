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
    const app = getApp<any>();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
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