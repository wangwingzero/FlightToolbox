// 低温修正计算页面
var calculateColdTempCorrection = require('../../../utils/coldTempCalculator.js').calculateColdTempCorrection;

Page({
  data: {
    isDarkMode: false,
    coldTemp: {
      airportElevation: '',       // 机场标高
      airportTemperature: '',     // 机场温度
      ifAltitude: '',            // IF高度
      fafAltitude: '',           // FAF高度
      daAltitude: '',            // DA高度
      missedAltitude: '',        // 复飞高度
      otherAltitude: '',         // 其他高度
      isFafPoint: false,          // 是否FAF点
      fafDistance: '',            // FAF距离
      result: null               // 计算结果
    }
  },

  onLoad: function() {
    var app = getApp();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    });
  },

  onShow: function() {
    var app = getApp();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    });
  },

  // 🌡️ 低温修正相关方法
  onColdTempAirportElevationChange: function(event) {
    this.setData({
      'coldTemp.airportElevation': event.detail
    });
  },

  onColdTempAirportTemperatureChange: function(event) {
    this.setData({
      'coldTemp.airportTemperature': event.detail
    });
  },

  onColdTempIfAltitudeChange: function(event) {
    this.setData({
      'coldTemp.ifAltitude': event.detail
    });
  },

  onColdTempFafAltitudeChange: function(event) {
    this.setData({
      'coldTemp.fafAltitude': event.detail
    });
  },

  onColdTempDaAltitudeChange: function(event) {
    this.setData({
      'coldTemp.daAltitude': event.detail
    });
  },

  onColdTempMissedAltitudeChange: function(event) {
    this.setData({
      'coldTemp.missedAltitude': event.detail
    });
  },

  onColdTempOtherAltitudeChange: function(event) {
    this.setData({
      'coldTemp.otherAltitude': event.detail
    });
  },

  onColdTempFafPointChange: function(event) {
    this.setData({
      'coldTemp.isFafPoint': event.detail
    });
  },

  onColdTempFafDistanceChange: function(event) {
    this.setData({
      'coldTemp.fafDistance': event.detail
    });
  },

  calculateColdTemp: function() {
    var coldTempData = this.data.coldTemp;
    var airportElevation = coldTempData.airportElevation;
    var airportTemperature = coldTempData.airportTemperature;
    var ifAltitude = coldTempData.ifAltitude;
    var daAltitude = coldTempData.daAltitude;
    var isFafPoint = coldTempData.isFafPoint;
    var fafDistance = coldTempData.fafDistance;
    
    // 参数验证
    if (!airportElevation || !airportTemperature || !daAltitude) {
      wx.showModal({
        title: '参数不完整',
        content: '请输入机场标高、机场温度和DA/MDA高度',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }
    
    var airportElevationFeet = parseFloat(airportElevation);
    var airportTemperatureC = parseFloat(airportTemperature);
    var uncorrectedAltitudeFeet = parseFloat(daAltitude);
    
    if (isNaN(airportElevationFeet) || isNaN(airportTemperatureC) || isNaN(uncorrectedAltitudeFeet)) {
      wx.showModal({
        title: '数值错误',
        content: '请输入有效的数值',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }
    
    // FAF参数验证
    var fafDistanceNm;
    if (isFafPoint) {
      if (!fafDistance) {
        wx.showModal({
          title: 'FAF参数缺失',
          content: '启用FAF计算时请输入FAF距离',
          showCancel: false,
          confirmText: '我知道了'
        });
        return;
      }
      fafDistanceNm = parseFloat(fafDistance);
      if (isNaN(fafDistanceNm)) {
        wx.showModal({
          title: 'FAF距离错误',
          content: '请输入有效的FAF距离数值',
          showCancel: false,
          confirmText: '我知道了'
        });
        return;
      }
    }
    
    try {
      // 构建输入参数
      var input = {
        airportElevationFeet: airportElevationFeet,
        airportTemperatureC: airportTemperatureC,
        uncorrectedAltitudeFeet: uncorrectedAltitudeFeet,
        isFafPoint: isFafPoint,
        fafDistanceNm: fafDistanceNm
      };
      
      // 调用计算函数
      var result = calculateColdTempCorrection(input);
      
      // 更新结果
      this.setData({
        'coldTemp.result': result
      });
      
      console.log('🌡️ 低温修正计算完成:', result);
      
      wx.showToast({
        title: '低温修正计算完成',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('低温修正计算错误:', error);
      wx.showModal({
        title: '计算错误',
        content: '计算过程中发生错误：' + (error.message || error),
        showCancel: false,
        confirmText: '我知道了'
      });
    }
  },

  clearColdTemp: function() {
    this.setData({
      'coldTemp.airportElevation': '',
      'coldTemp.airportTemperature': '',
      'coldTemp.ifAltitude': '',
      'coldTemp.fafAltitude': '',
      'coldTemp.daAltitude': '',
      'coldTemp.missedAltitude': '',
      'coldTemp.otherAltitude': '',
      'coldTemp.isFafPoint': false,
      'coldTemp.fafDistance': '',
      'coldTemp.result': null
    });
    
    wx.showToast({
      title: '数据已清空',
      icon: 'success'
    });
  }
});