// 绕飞耗油计算页面

Page({
  data: {
    isDarkMode: false,
    detour: {
      distance: '',                // 申请偏离航路距离
      groundSpeed: '',             // 地速
      fuelConsumption: '',         // 油耗率
      departureAngle: '30',        // 偏航角度，默认30°
      returnAngle: '30',           // 返回角度，默认30°
      fuelResult: '',              // 额外燃油消耗结果
      timeResult: '',              // 额外飞行时间结果
      actualDistance: '',          // 实际多飞距离
      departureSegment: '',        // 偏航段距离
      returnSegment: '',           // 返回段距离
      directDistance: '',          // 原直线距离
      calculationDetails: ''       // 计算详情
    }
  },

  onLoad() {
    // 🎯 进入页面时扣减积分 - 绕飞耗油计算 1积分
    const pointsManager = require('../../../utils/points-manager.js');
    
    pointsManager.consumePoints('flight-calc-detour', '绕飞耗油计算功能使用').then((result: any) => {
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
        console.log('积分不足，无法使用绕飞耗油计算功能');
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

  onDistanceChange(event: any) {
    this.setData({
      'detour.distance': event.detail
    });
  },

  onGroundSpeedChange(event: any) {
    this.setData({
      'detour.groundSpeed': event.detail
    });
  },

  onFuelConsumptionChange(event: any) {
    this.setData({
      'detour.fuelConsumption': event.detail
    });
  },

  onDepartureAngleChange(event: any) {
    this.setData({
      'detour.departureAngle': event.detail
    });
  },

  onReturnAngleChange(event: any) {
    this.setData({
      'detour.returnAngle': event.detail
    });
  },

  calculateDetour() {
    const distance = parseFloat(this.data.detour.distance);
    const groundSpeed = parseFloat(this.data.detour.groundSpeed);
    const fuelConsumption = parseFloat(this.data.detour.fuelConsumption);
    const departureAngle = parseFloat(this.data.detour.departureAngle);
    const returnAngle = parseFloat(this.data.detour.returnAngle);

    // 参数验证
    if (isNaN(distance) || isNaN(groundSpeed) || isNaN(fuelConsumption) || 
        isNaN(departureAngle) || isNaN(returnAngle)) {
      wx.showToast({
        title: '请输入有效的数值',
        icon: 'none'
      });
      return;
    }

    if (distance <= 0 || groundSpeed <= 0 || fuelConsumption <= 0) {
      wx.showToast({
        title: '距离、地速和油耗必须为正数',
        icon: 'none'
      });
      return;
    }

    if (departureAngle <= 0 || departureAngle > 90 || returnAngle <= 0 || returnAngle > 90) {
      wx.showToast({
        title: '偏航角度和返回角度必须大于0°且不超过90°',
        icon: 'none'
      });
      return;
    }

    // 🎯 基于正确几何学原理的绕飞距离计算
    try {
      // 将角度转换为弧度
      const alpha = departureAngle * Math.PI / 180;  // 偏航角度
      const beta = returnAngle * Math.PI / 180;      // 返回角度
      
      // 1. 计算偏航段距离：d / sin(α)
      const departureSegmentDistance = distance / Math.sin(alpha);
      
      // 2. 计算返回段距离：d / sin(β)  
      const returnSegmentDistance = distance / Math.sin(beta);
      
      // 3. 计算原直线距离：d / tan(α) + d / tan(β)
      const directDistance = distance / Math.tan(alpha) + distance / Math.tan(beta);
      
      // 4. 计算实际多飞距离
      const actualDetourDistance = departureSegmentDistance + returnSegmentDistance - directDistance;
      
      // 5. 计算额外绕飞时间（小时）
      const detourTimeHours = actualDetourDistance / groundSpeed;
      
      // 6. 计算额外燃油消耗（千克）
      const extraFuelKg = detourTimeHours * fuelConsumption;
      
      // 格式化时间显示
      const timeMinutes = Math.round(detourTimeHours * 60);
      const timeHours = Math.floor(timeMinutes / 60);
      const remainingMinutes = timeMinutes % 60;
      
      let timeDisplay = '';
      if (timeHours > 0) {
        timeDisplay = `${timeHours}小时${remainingMinutes}分钟`;
      } else {
        timeDisplay = `${remainingMinutes}分钟`;
      }
      
      // 详细的计算结果展示
      const calculationDetails = `几何计算详情：
偏航段距离：${this.formatNumber(departureSegmentDistance)} 海里
返回段距离：${this.formatNumber(returnSegmentDistance)} 海里  
原直线距离：${this.formatNumber(directDistance)} 海里
实际多飞距离：${this.formatNumber(actualDetourDistance)} 海里
额外飞行时间：${timeDisplay}
额外燃油消耗：${Math.round(extraFuelKg)} 千克

注：采用${departureAngle}°偏航 + ${returnAngle}°返回的几何路径计算`;
      
      this.setData({
        'detour.fuelResult': Math.round(extraFuelKg),
        'detour.timeResult': timeDisplay,
        'detour.actualDistance': this.formatNumber(actualDetourDistance),
        'detour.departureSegment': this.formatNumber(departureSegmentDistance),
        'detour.returnSegment': this.formatNumber(returnSegmentDistance),
        'detour.directDistance': this.formatNumber(directDistance),
        'detour.calculationDetails': calculationDetails
      });
      
      console.log('🎯 绕飞耗油计算完成:', {
        申请偏离航路距离: distance,
        偏航角度: departureAngle + '°',
        返回角度: returnAngle + '°', 
        偏航段距离: departureSegmentDistance.toFixed(2),
        返回段距离: returnSegmentDistance.toFixed(2),
        原直线距离: directDistance.toFixed(2),
        实际多飞距离: actualDetourDistance.toFixed(2),
        额外燃油: Math.round(extraFuelKg) + '千克'
      });
      
      wx.showToast({
        title: '绕飞耗油计算完成',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('绕飞耗油计算错误:', error);
      wx.showToast({
        title: '计算过程中发生错误，请检查输入参数',
        icon: 'none'
      });
    }
  },

  clearDetour() {
    this.setData({
      'detour.distance': '',
      'detour.groundSpeed': '',
      'detour.fuelConsumption': '',
      'detour.departureAngle': '30',    // 重置为默认值
      'detour.returnAngle': '30',       // 重置为默认值
      'detour.fuelResult': '',
      'detour.timeResult': '',
      'detour.actualDistance': '',
      'detour.departureSegment': '',
      'detour.returnSegment': '',
      'detour.directDistance': '',
      'detour.calculationDetails': ''
    });
    wx.showToast({
      title: '数据已清空',
      icon: 'success'
    });
  },

  formatNumber(num: number): string {
    if (num >= 100) {
      return num.toFixed(0);
    } else if (num >= 10) {
      return num.toFixed(1);
    } else {
      return num.toFixed(2);
    }
  }
});