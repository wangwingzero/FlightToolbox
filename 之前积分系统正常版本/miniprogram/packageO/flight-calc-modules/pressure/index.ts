// 气压换算页面
Page({
  data: {
    isDarkMode: false,
    
    // 步骤控制
    currentStep: 1, // 1:输入参数 2:查看结果
    
    // 气压换算相关
    pressure: {
      airportElevation: '',
      qnhPressure: '',
      qfePressure: '',
      result: null,
      error: ''
    },
    
    // 计算结果
    calculationResult: null
  },

  onLoad() {
    this.initializeTheme();
  },

  onShow() {
    this.checkThemeStatus();
  },

  onUnload() {
    // 清理主题监听器
    if (this.themeCleanup && typeof this.themeCleanup === 'function') {
      try {
        this.themeCleanup();
        console.log('🌙 气压换算页面主题监听器已清理');
      } catch (error) {
        console.warn('⚠️ 清理主题监听器时出错:', error);
      }
    }
  },

  // 初始化主题
  initializeTheme() {
    try {
      const themeManager = require('../../../utils/theme-manager.js');
      this.themeCleanup = themeManager.initPageTheme(this);
      console.log('🌙 气压换算页面主题初始化完成');
    } catch (error) {
      console.warn('⚠️ 主题管理器初始化失败:', error);
    }
  },

  // 检查主题状态
  checkThemeStatus() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
  },

  // 设置计算结果用于新界面显示
  setCalculationResult(result: any) {
    let icon = '✅';
    let type = 'safe';
    if (result.status && result.status.includes('错误')) {
      icon = '⚠️';
      type = 'warning';
    }
    this.setData({
      calculationResult: { ...result, icon: icon, type: type }
    });
  },

  // 步骤控制方法
  nextStep() {
    const currentStep = this.data.currentStep;
    
    // 校验输入
    if (currentStep === 1) {
      const pressureData = this.data.pressure;
      if (!pressureData.airportElevation) {
        wx.showToast({
          title: '请输入机场标高',
          icon: 'none'
        });
        return;
      }
      
      if (!pressureData.qnhPressure && !pressureData.qfePressure) {
        wx.showToast({
          title: '请输入QNH或QFE气压值',
          icon: 'none'
        });
        return;
      }
    }
    
    // 进入下一步
    this.setData({
      currentStep: currentStep + 1
    });
    
    // 如果到了计算步骤，执行计算
    if (currentStep + 1 === 2) {
      this.calculatePressure();
    }
  },

  // 返回上一步
  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1,
        calculationResult: null
      });
    }
  },

  // 重新开始
  restart() {
    this.setData({
      currentStep: 1,
      'pressure.airportElevation': '',
      'pressure.qnhPressure': '',
      'pressure.qfePressure': '',
      'pressure.result': null,
      'pressure.error': '',
      calculationResult: null
    });
  },

  // 验证当前输入
  validateCurrentInputs() {
    const pressureData = this.data.pressure;
    return pressureData.airportElevation && (pressureData.qnhPressure || pressureData.qfePressure);
  },

  // 机场标高输入
  onElevationChange(event: any) {
    this.setData({
      'pressure.airportElevation': event.detail,
      'pressure.result': null,
      'pressure.error': '',
      calculationResult: null
    });
  },

  // QNH输入
  onQNHChange(event: any) {
    this.setData({
      'pressure.qnhPressure': event.detail,
      'pressure.result': null,
      'pressure.error': '',
      calculationResult: null
    });
  },

  // QFE输入
  onQFEChange(event: any) {
    this.setData({
      'pressure.qfePressure': event.detail,
      'pressure.result': null,
      'pressure.error': '',
      calculationResult: null
    });
  },

  // 气压换算计算
  calculatePressure() {
    const validateParams = () => {
      const pressureData = this.data.pressure;
      
      if (!pressureData.airportElevation) {
        return { valid: false, message: '请输入机场标高' };
      }
      
      if (!pressureData.qnhPressure && !pressureData.qfePressure) {
        return { valid: false, message: '请输入QNH或QFE气压值' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performPressureCalculation();
    };

    const buttonChargeManager = require('../../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-pressure',
      validateParams,
      '气压换算分析',
      performCalculation
    );
  },

  // 分离出来的实际气压计算逻辑
  performPressureCalculation() {
    const pressureData = this.data.pressure;
    
    const showError = (errorMsg: string) => {
      this.setData({ 'pressure.error': errorMsg });
    };

    try {
      const elevation = parseFloat(pressureData.airportElevation);
      
      if (isNaN(elevation)) {
        showError('请输入有效的机场标高');
        return;
      }

      // 气压高度公式：每27英尺高度差约等于1hPa气压差
      // 精确公式：ΔP = ΔH / 27 (hPa/ft)
      const pressurePerFoot = 1 / 27; // hPa per foot
      
      let qnhResult = '';
      let qfeResult = '';
      let calculationType = '';
      
      if (pressureData.qnhPressure && pressureData.qnhPressure.trim() !== '') {
        const qnh = parseFloat(pressureData.qnhPressure);
        if (!isNaN(qnh)) {
          // 从QNH计算QFE：QFE = QNH - (标高 × 压力梯度)
          const qfe = qnh - (elevation * pressurePerFoot);
          qfeResult = qfe.toFixed(1);
          calculationType = 'QNH → QFE';
        }
      }
      
      if (pressureData.qfePressure && pressureData.qfePressure.trim() !== '') {
        const qfe = parseFloat(pressureData.qfePressure);
        if (!isNaN(qfe)) {
          // 从QFE计算QNH：QNH = QFE + (标高 × 压力梯度)
          const qnh = qfe + (elevation * pressurePerFoot);
          qnhResult = qnh.toFixed(1);
          if (calculationType) {
            calculationType = 'QNH ↔ QFE';
          } else {
            calculationType = 'QFE → QNH';
          }
        }
      }

      if (!qnhResult && !qfeResult) {
        showError('请输入有效的气压值');
        return;
      }

      // 构建完整的结果对象
      const result = {
        status: '✅ 换算完成',
        message: `气压换算计算完成：${calculationType}`,
        calculationType: calculationType,
        
        // 输入参数
        inputElevation: elevation,
        inputQNH: pressureData.qnhPressure ? parseFloat(pressureData.qnhPressure) : null,
        inputQFE: pressureData.qfePressure ? parseFloat(pressureData.qfePressure) : null,
        
        // 计算结果
        calculatedQNH: qnhResult ? parseFloat(qnhResult) : null,
        calculatedQFE: qfeResult ? parseFloat(qfeResult) : null,
        
        // 计算详情
        pressureGradient: pressurePerFoot,
        elevationEffect: (elevation * pressurePerFoot).toFixed(2),
        
        // 显示信息
        thresholdInfo: `机场标高: ${elevation}ft | 高度效应: ${(elevation * pressurePerFoot).toFixed(2)} hPa`,
        detailedInfo: `换算基于标准大气压力梯度计算`,
        envelopeInfo: 'QNH用于高度测量，QFE用于机场操作 | 换算结果基于ICAO标准'
      };

      this.setData({
        'pressure.result': result,
        'pressure.error': ''
      });

      // 设置计算结果用于新界面显示
      this.setCalculationResult(result);

    } catch (error) {
      showError(`计算错误: ${(error as Error).message || '未知错误'}`);
    }
  },

  // 清空气压数据
  clearPressure() {
    this.restart();
  }
});