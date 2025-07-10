// 气压换算页面
Page({
  data: {
    isDarkMode: false,
    airportElevation: '',
    qnhPressure: '',
    qfePressure: '',
    qnhResult: '',
    qfeResult: ''
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

  // 机场标高输入
  onElevationChange(event: any) {
    this.setData({
      airportElevation: event.detail
    });
  },

  // QNH输入
  onQNHChange(event: any) {
    this.setData({
      qnhPressure: event.detail
    });
  },

  // QFE输入
  onQFEChange(event: any) {
    this.setData({
      qfePressure: event.detail
    });
  },

  // 气压换算
  convertPressure() {
    const { airportElevation, qnhPressure, qfePressure } = this.data;
    
    if (!airportElevation || airportElevation.trim() === '') {
      wx.showToast({
        title: '请输入机场标高',
        icon: 'none'
      });
      return;
    }
    
    const elevation = parseFloat(airportElevation);
    if (isNaN(elevation)) {
      wx.showToast({
        title: '请输入有效的机场标高',
        icon: 'none'
      });
      return;
    }
    
    // 检查是否有QNH或QFE输入
    const hasQNH = qnhPressure && qnhPressure.trim() !== '';
    const hasQFE = qfePressure && qfePressure.trim() !== '';
    
    if (!hasQNH && !hasQFE) {
      wx.showToast({
        title: '请输入QNH或QFE气压值',
        icon: 'none'
      });
      return;
    }
    
    // 执行换算
    this.performPressureConversion(elevation, qnhPressure, qfePressure);
  },
  
  performPressureConversion(elevation: number, qnhInput: string, qfeInput: string) {
    // 气压高度公式：每30英尺高度差约等于1hPa气压差
    // 更精确的公式：ΔP = ΔH / 27 (hPa/ft)
    const pressurePerFoot = 1 / 27; // hPa per foot
    
    let qnhResult = '';
    let qfeResult = '';
    
    if (qnhInput && qnhInput.trim() !== '') {
      const qnh = parseFloat(qnhInput);
      if (!isNaN(qnh)) {
        // 从QNH计算QFE：QFE = QNH - (标高 × 压力梯度)
        const qfe = qnh - (elevation * pressurePerFoot);
        qfeResult = qfe.toFixed(1);
      }
    }
    
    if (qfeInput && qfeInput.trim() !== '') {
      const qfe = parseFloat(qfeInput);
      if (!isNaN(qfe)) {
        // 从QFE计算QNH：QNH = QFE + (标高 × 压力梯度)
        const qnh = qfe + (elevation * pressurePerFoot);
        qnhResult = qnh.toFixed(1);
      }
    }
    
    this.setData({
      qnhResult,
      qfeResult
    });
    
    wx.showToast({
      title: '换算完成',
      icon: 'success'
    });
  },

  // 清空气压数据
  clearPressure() {
    this.setData({
      airportElevation: '',
      qnhPressure: '',
      qfePressure: '',
      qnhResult: '',
      qfeResult: ''
    });
    
    wx.showToast({
      title: '已清空数据',
      icon: 'success'
    });
  }
});