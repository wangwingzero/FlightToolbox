// 温度修正计算页面
import { calculateColdTempCorrection, ColdTempInput, CorrectionResult } from '../../../utils/coldTempCalculator';

Page({
  data: {
    isDarkMode: false,
    coldTemp: {
      airportElevation: '',       // 机场标高
      airportTemperature: '',     // 机场温度
      uncorrectedAltitude: '',    // 需修正高度
      isFafPoint: false,          // 是否FAF点
      fafDistance: '',            // FAF距离
      result: null as CorrectionResult | null  // 计算结果
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

  // 🌡️ 温度修正相关方法
  onColdTempAirportElevationChange(event: any) {
    this.setData({
      'coldTemp.airportElevation': event.detail
    });
  },

  onColdTempAirportTemperatureChange(event: any) {
    this.setData({
      'coldTemp.airportTemperature': event.detail
    });
  },

  onColdTempUncorrectedAltitudeChange(event: any) {
    this.setData({
      'coldTemp.uncorrectedAltitude': event.detail
    });
  },

  onColdTempFafPointChange(event: any) {
    this.setData({
      'coldTemp.isFafPoint': event.detail
    });
  },

  onColdTempFafDistanceChange(event: any) {
    this.setData({
      'coldTemp.fafDistance': event.detail
    });
  },

  calculateColdTemp() {
    const { airportElevation, airportTemperature, uncorrectedAltitude, isFafPoint, fafDistance } = this.data.coldTemp;
    
    // 参数验证
    if (!airportElevation || !airportTemperature || !uncorrectedAltitude) {
      wx.showModal({
        title: '参数不完整',
        content: '请输入机场标高、机场温度和需修正高度',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }
    
    const airportElevationFeet = parseFloat(airportElevation);
    const airportTemperatureC = parseFloat(airportTemperature);
    const uncorrectedAltitudeFeet = parseFloat(uncorrectedAltitude);
    
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
    let fafDistanceNm: number | undefined = undefined;
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
      const input: ColdTempInput = {
        airportElevationFeet,
        airportTemperatureC,
        uncorrectedAltitudeFeet,
        isFafPoint,
        fafDistanceNm
      };
      
      // 调用计算函数
      const result = calculateColdTempCorrection(input);
      
      // 更新结果
      this.setData({
        'coldTemp.result': result
      });
      
      console.log('🌡️ 温度修正计算完成:', result);
      
      wx.showToast({
        title: '温度修正计算完成',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('温度修正计算错误:', error);
      wx.showModal({
        title: '计算错误',
        content: `计算过程中发生错误：${error.message || error}`,
        showCancel: false,
        confirmText: '我知道了'
      });
    }
  },

  clearColdTemp() {
    this.setData({
      'coldTemp.airportElevation': '',
      'coldTemp.airportTemperature': '',
      'coldTemp.uncorrectedAltitude': '',
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