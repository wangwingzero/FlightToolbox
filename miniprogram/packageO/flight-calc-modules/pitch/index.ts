// PITCH警告计算页面
Page({
  data: {
    isDarkMode: false,
    
    // 步骤控制
    currentStep: 1, // 1:选择飞机型号 2:输入无线电高度 3:输入当前俯仰角 4:输入俯仰率 5:显示结果
    
    // PITCH PITCH 计算相关
    pitch: {
      aircraftModel: '',
      aircraftModelDisplay: '',
      radioHeight: '',
      currentPitch: '',
      pitchRate: '',
      result: false,
      predictivePitch: '',
      threshold: '',
      warningStatus: '',
      shouldTrigger: false,
      heightLimit: '',
      thresholdGap: '',
      thresholdGapStatus: ''
    },

    // 飞机选择器相关状态
    showAircraftModelPicker: false,
    aircraftModelActions: [
      { name: 'A320 (未安装LIP)', value: 'A320_NO_LIP' },
      { name: 'A320 (已安装LIP)', value: 'A320_LIP' },
      { name: 'A321', value: 'A321' },
      { name: 'A330-200', value: 'A330-200' },
      { name: 'A330-300', value: 'A330-300' }
    ]
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
        console.log('🌙 PITCH页面主题监听器已清理');
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
      console.log('🌙 PITCH页面主题初始化完成');
    } catch (error) {
      console.warn('⚠️ 主题管理器初始化失败:', error);
    }
  },

  // 检查主题状态
  checkThemeStatus() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
  },

  // PITCH PITCH计算相关方法
  calculatePitchPitch() {
    const validateParams = () => {
      const pitchData = this.data.pitch;
      const radioHeight = parseFloat(pitchData.radioHeight);
      const currentPitch = parseFloat(pitchData.currentPitch);
      const pitchRate = parseFloat(pitchData.pitchRate);
      
      if (isNaN(radioHeight) || isNaN(currentPitch) || isNaN(pitchRate)) {
        return { valid: false, message: '请输入有效的无线电高度、当前俯仰角和俯仰率' };
      }

      if (!pitchData.aircraftModel) {
        return { valid: false, message: '请选择飞机型号' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performPitchPitchCalculation();
    };

    const buttonChargeManager = require('../../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-pitch',
      validateParams,
      'PITCH PITCH告警分析',
      performCalculation
    );
  },

  // 分离出来的实际PITCH PITCH计算逻辑
  performPitchPitchCalculation() {
    const pitchData = this.data.pitch;
    const radioHeight = parseFloat(pitchData.radioHeight);
    const currentPitch = parseFloat(pitchData.currentPitch);
    const pitchRate = parseFloat(pitchData.pitchRate);
    
    const predictivePitch = this.calculatePredictivePitch(currentPitch, pitchRate);
    
    // 根据机型确定阈值
    let threshold = 0;
    let shouldTrigger = false;
    let heightLimit = 20; // 默认高度限制
    
    switch (pitchData.aircraftModel) {
      case 'A320_NO_LIP':
        threshold = 9.25;
        heightLimit = 20;
        shouldTrigger = radioHeight < heightLimit && predictivePitch > threshold;
        break;
      case 'A320_LIP':
        threshold = 10;
        heightLimit = 20;
        shouldTrigger = radioHeight < heightLimit && predictivePitch > threshold;
        break;
      case 'A321':
        threshold = 8.25;
        heightLimit = 20;
        shouldTrigger = radioHeight < heightLimit && predictivePitch > threshold;
        break;
      case 'A330-200':
        threshold = 10.5;
        heightLimit = 25;
        shouldTrigger = radioHeight < heightLimit && predictivePitch > threshold;
        break;
      case 'A330-300':
        threshold = 9;
        heightLimit = 25;
        shouldTrigger = radioHeight < heightLimit && predictivePitch > threshold;
        break;
    }
    
    const warningStatus = shouldTrigger ? '⚠️ PITCH PITCH' : '✅ 正常';
    
    // 计算阈值差距
    const thresholdGap = predictivePitch - threshold;
    const thresholdGapStatus = thresholdGap >= 0 ? 'warning' : 'safe';
    
    this.setData({
      'pitch.result': true,
      'pitch.predictivePitch': predictivePitch.toFixed(2),
      'pitch.threshold': threshold.toString(),
      'pitch.warningStatus': warningStatus,
      'pitch.shouldTrigger': shouldTrigger,
      'pitch.heightLimit': heightLimit,
      'pitch.thresholdGap': (thresholdGap >= 0 ? '+' : '') + thresholdGap.toFixed(2),
      'pitch.thresholdGapStatus': thresholdGapStatus
    });
  },

  // 计算预测俯仰角
  calculatePredictivePitch(currentPitchDegrees: number, pitchRateDegreesPerSecond: number): number {
    return currentPitchDegrees + pitchRateDegreesPerSecond * 1.0;
  },

  // PITCH输入事件
  onPitchRadioHeightChange(event: any) {
    this.setData({ 
      'pitch.radioHeight': event.detail 
    });
  },

  onPitchCurrentPitchChange(event: any) {
    this.setData({ 
      'pitch.currentPitch': event.detail 
    });
  },

  onPitchPitchRateChange(event: any) {
    this.setData({ 
      'pitch.pitchRate': event.detail 
    });
  },

  // 步骤控制方法
  nextStep() {
    const currentStep = this.data.currentStep;
    
    // 校验当前步骤的输入
    if (currentStep === 1) {
      if (!this.data.pitch.aircraftModel) {
        wx.showToast({
          title: '请先选择飞机型号',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!this.data.pitch.radioHeight) {
        wx.showToast({
          title: '请输入无线电高度',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 3) {
      if (!this.data.pitch.currentPitch) {
        wx.showToast({
          title: '请输入当前俯仰角',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 4) {
      if (!this.data.pitch.pitchRate) {
        wx.showToast({
          title: '请输入俯仰率',
          icon: 'none'
        });
        return;
      }
    }
    
    // 进入下一步
    this.setData({
      currentStep: currentStep + 1
    });
    
    // 如果到了最后一步，执行计算
    if (currentStep + 1 === 5) {
      this.calculatePitchPitch();
    }
  },

  // 返回上一步
  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1,
        'pitch.result': false // 清除结果
      });
    }
  },

  // 重新开始
  restart() {
    this.setData({
      currentStep: 1,
      'pitch.aircraftModel': '',
      'pitch.aircraftModelDisplay': '',
      'pitch.radioHeight': '',
      'pitch.currentPitch': '',
      'pitch.pitchRate': '',
      'pitch.result': false,
      'pitch.predictivePitch': '',
      'pitch.threshold': '',
      'pitch.warningStatus': '',
      'pitch.shouldTrigger': false,
      'pitch.heightLimit': '',
      'pitch.thresholdGap': '',
      'pitch.thresholdGapStatus': ''
    });
  },

  // PITCH飞机选择器
  showAircraftPicker() {
    this.setData({ showAircraftModelPicker: true });
  },

  onAircraftPickerClose() {
    this.setData({ showAircraftModelPicker: false });
  },

  onAircraftModelSelect(event: any) {
    const selectedValue = event.detail.value;
    const selectedAction = this.data.aircraftModelActions.find(action => action.value === selectedValue);
    
    this.setData({
      'pitch.aircraftModel': selectedValue,
      'pitch.aircraftModelDisplay': selectedAction && selectedAction.name || selectedValue,
      showAircraftModelPicker: false,
      'pitch.result': false // 清除之前的计算结果
    });
    
    // 自动进入下一步
    setTimeout(() => {
      this.nextStep();
    }, 500);
  },

  // 清空数据
  clearData() {
    this.restart();
  },

  // 新增：飞机选择方法
  selectAircraft(event: any) {
    const { model, display } = event.currentTarget.dataset;
    
    this.setData({
      'pitch.aircraftModel': model,
      'pitch.aircraftModelDisplay': display,
      'pitch.result': false // 清除之前的计算结果
    });
  }
});