// 低温修正计算页面
var calculateColdTempCorrection = require('../../../utils/coldTempCalculator.js').calculateColdTempCorrection;

Page({
  data: {
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

  // 数字输入验证函数
  onNumberInput: function(e) {
    let value = e.detail.value;
    // 只允许数字、负号、小数点
    value = value.replace(/[^-0-9.]/g, '');
    // 确保负号只能在开头
    if (value.indexOf('-') > 0) {
      value = value.replace(/-/g, '');
    }
    // 确保只有一个小数点
    const dotIndex = value.indexOf('.');
    if (dotIndex !== -1) {
      value = value.substring(0, dotIndex + 1) + value.substring(dotIndex + 1).replace(/\./g, '');
    }
    // 更新输入框的值
    this.setData({
      [`coldTemp.${e.currentTarget.dataset.field || 'airportTemperature'}`]: value
    });
  },

  onLoad: function() {
    // 🎯 进入页面时扣减积分 - 低温修正计算 2积分
    var pointsManager = require('../../../utils/points-manager.js');
    var self = this;
    
    pointsManager.consumePoints('flight-calc-cold-temp', '低温修正计算功能使用').then(function(result) {
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
        console.log('✅ 低温修正计算功能已就绪');
      } else {
        // 积分不足，返回上一页
        console.log('积分不足，无法使用低温修正计算功能');
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
                url: '/pages/home/index'
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
      console.log('⚠️ 低温修正积分系统不可用');
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
    var fafAltitude = coldTempData.fafAltitude;
    var daAltitude = coldTempData.daAltitude;
    var missedAltitude = coldTempData.missedAltitude;
    var otherAltitude = coldTempData.otherAltitude;
    var isFafPoint = coldTempData.isFafPoint;
    var fafDistance = coldTempData.fafDistance;

    // 基础参数验证
    if (!airportElevation || !airportTemperature) {
      wx.showModal({
        title: '参数不完整',
        content: '请输入机场标高和机场温度',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }

    // 检查是否至少输入了一个高度
    var hasAnyAltitude = ifAltitude || fafAltitude || daAltitude || missedAltitude || otherAltitude;
    if (!hasAnyAltitude) {
      wx.showModal({
        title: '参数不完整',
        content: '请至少输入一个需要修正的高度',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }

    var airportElevationFeet = parseFloat(airportElevation);
    var airportTemperatureC = parseFloat(airportTemperature);

    if (isNaN(airportElevationFeet) || isNaN(airportTemperatureC)) {
      wx.showModal({
        title: '数值错误',
        content: '请输入有效的机场标高和温度数值',
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
      // 准备所有需要计算的高度
      var altitudesToCalculate = [];

      if (ifAltitude) {
        var ifAltitudeFeet = parseFloat(ifAltitude);
        if (!isNaN(ifAltitudeFeet)) {
          altitudesToCalculate.push({
            name: 'IF高度',
            originalFeet: ifAltitudeFeet,
            type: 'if'
          });
        }
      }

      if (fafAltitude) {
        var fafAltitudeFeet = parseFloat(fafAltitude);
        if (!isNaN(fafAltitudeFeet)) {
          altitudesToCalculate.push({
            name: 'FAF高度',
            originalFeet: fafAltitudeFeet,
            type: 'faf'
          });
        }
      }

      if (daAltitude) {
        var daAltitudeFeet = parseFloat(daAltitude);
        if (!isNaN(daAltitudeFeet)) {
          altitudesToCalculate.push({
            name: 'DA/MDA高度',
            originalFeet: daAltitudeFeet,
            type: 'da'
          });
        }
      }

      if (missedAltitude) {
        var missedAltitudeFeet = parseFloat(missedAltitude);
        if (!isNaN(missedAltitudeFeet)) {
          altitudesToCalculate.push({
            name: '复飞高度',
            originalFeet: missedAltitudeFeet,
            type: 'missed'
          });
        }
      }

      if (otherAltitude) {
        var otherAltitudeFeet = parseFloat(otherAltitude);
        if (!isNaN(otherAltitudeFeet)) {
          altitudesToCalculate.push({
            name: '其他高度',
            originalFeet: otherAltitudeFeet,
            type: 'other'
          });
        }
      }

      // 为每个高度计算修正值
      var results = [];
      for (var i = 0; i < altitudesToCalculate.length; i++) {
        var altitude = altitudesToCalculate[i];
        var input = {
          airportElevationFeet: airportElevationFeet,
          airportTemperatureC: airportTemperatureC,
          uncorrectedAltitudeFeet: altitude.originalFeet,
          isFafPoint: isFafPoint && altitude.type === 'faf', // 只有FAF高度才启用FAF特殊计算
          fafDistanceNm: fafDistanceNm
        };

        var result = calculateColdTempCorrection(input);
        results.push({
          name: altitude.name,
          type: altitude.type,
          originalFeet: altitude.originalFeet,
          correctionFeet: result.correctionFeet,
          correctedFeet: result.correctedAltitudeFeet,
          vpaInfo: result.vpaInfo // 修正：使用vpaInfo而不是fafResult
        });
      }

      // 计算通用信息（使用第一个高度的结果）
      var firstResult = calculateColdTempCorrection({
        airportElevationFeet: airportElevationFeet,
        airportTemperatureC: airportTemperatureC,
        uncorrectedAltitudeFeet: altitudesToCalculate[0].originalFeet,
        isFafPoint: false,
        fafDistanceNm: 0
      });

      // 更新结果
      this.setData({
        'coldTemp.result': {
          results: results,
          isaTempC: firstResult.isaTempC,
          tempDeviationC: firstResult.tempDeviationC,
          hasMultipleResults: results.length > 1
        }
      });

      console.log('🌡️ 低温修正计算完成:', results);

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