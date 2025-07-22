// 下滑线高度计算页面 - ES5版本

Page({
  data: {
    glideslope: {
      angle: '3.0',
      distance: '',
      elevation: '0',
      aglAltitude: '',
      qnhAltitude: ''
    }
  },

  onLoad: function() {
    var self = this;
    // 🎯 进入页面时扣减积分 - 下滑线高度计算 1积分
    var pointsManager = require('../../../utils/points-manager.js');
    
    pointsManager.consumePoints('flight-calc-glideslope', '下滑线高度计算功能使用').then(function(result) {
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
        console.log('✅ 下滑线高度计算功能已就绪');
      } else {
        // 积分不足，返回上一页
        console.log('积分不足，无法使用下滑线高度计算功能');
        wx.showModal({
          title: '积分不足',
          content: '此功能需要 ' + result.requiredPoints + ' 积分，您当前有 ' + result.currentPoints + ' 积分。',
          showCancel: true,
          cancelText: '返回',
          confirmText: '获取积分',
          success: function(res) {
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
    }).catch(function(error) {
      console.error('积分扣费失败:', error);
      // 错误回退：继续使用功能，确保用户体验
      console.log('⚠️ 下滑线积分系统不可用');
      wx.showToast({
        title: '积分系统暂时不可用，功能正常开放',
        icon: 'none',
        duration: 3000
      });
    });
  },

  onShow: function() {
    // 页面显示时的处理逻辑
  },

  onAngleChange: function(event) {
    this.setData({
      'glideslope.angle': event.detail
    });
  },

  onDistanceChange: function(event) {
    this.setData({
      'glideslope.distance': event.detail
    });
  },

  onElevationChange: function(event) {
    this.setData({
      'glideslope.elevation': event.detail
    });
  },

  calculateGlideslope: function() {
    var angle = parseFloat(this.data.glideslope.angle);
    var distance = parseFloat(this.data.glideslope.distance);
    var elevation = parseFloat(this.data.glideslope.elevation);

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

    // 计算AGL高度（下滑线高度，相对于地面）
    var angleRad = angle * Math.PI / 180;
    var aglAltitude = distance * 6076.12 * Math.tan(angleRad); // 海里转换为英尺

    // 计算QNH高度（修正海平面气压高度）
    var qnhAltitude = aglAltitude + elevation;

    this.setData({
      'glideslope.aglAltitude': this.formatNumber(aglAltitude),
      'glideslope.qnhAltitude': this.formatNumber(qnhAltitude)
    });

    wx.showToast({
      title: '下滑线高度计算完成',
      icon: 'success'
    });
  },

  clearGlideslope: function() {
    this.setData({
      'glideslope.angle': '3.0',
      'glideslope.distance': '',
      'glideslope.elevation': '0',
      'glideslope.aglAltitude': '',
      'glideslope.qnhAltitude': ''
    });
    wx.showToast({
      title: '数据已清空',
      icon: 'success'
    });
  },

  formatNumber: function(num) {
    return Math.round(num * 100) / 100 + '';
  }
});