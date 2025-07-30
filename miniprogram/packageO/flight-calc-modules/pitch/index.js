// PITCH警告计算页面 - ES5版本
Page({
  data: {
    // 步骤控制
    currentStep: 1, // 1:选择飞机型号 2:输入无线电高度 3:输入当前飞机姿态 4:输入飞机姿态变化率 5:显示结果
    
    // PITCH PITCH 计算相关
    pitch: {
      aircraftModel: '',
      aircraftModelDisplay: '',
      radioHeight: '',
      currentAttitude: '', // 改名：当前俯仰角 → 当前飞机姿态
      attitudeChangeRate: '', // 改名：俯仰率 → 飞机姿态变化率
      result: false,
      predictiveAttitude: '', // 改名：预测俯仰角 → 预测飞机姿态
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

  onLoad: function() {
    // 直接初始化页面，无需积分验证
    console.log('✅ PITCH计算功能已就绪');
  },

  onShow: function() {
    // 页面显示时的处理逻辑
  },

  onUnload: function() {
    // 页面卸载清理
  },

  // PITCH PITCH计算相关方法
  calculatePitchPitch: function() {
    var self = this;
    var validateParams = function() {
      var pitchData = self.data.pitch;
      var radioHeight = parseFloat(pitchData.radioHeight);
      var currentAttitude = parseFloat(pitchData.currentAttitude);
      var attitudeChangeRate = parseFloat(pitchData.attitudeChangeRate);
      
      if (isNaN(radioHeight) || isNaN(currentAttitude) || isNaN(attitudeChangeRate)) {
        return { valid: false, message: '请输入有效的无线电高度、当前飞机姿态和飞机姿态变化率' };
      }

      if (!pitchData.aircraftModel) {
        return { valid: false, message: '请选择飞机型号' };
      }
      
      return { valid: true };
    };

    var performCalculation = function() {
      self.performPitchPitchCalculation();
    };

    var buttonChargeManager = require('../../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-pitch',
      validateParams,
      'PITCH PITCH告警分析',
      performCalculation
    );
  },

  // 分离出来的实际PITCH PITCH计算逻辑
  performPitchPitchCalculation: function() {
    var pitchData = this.data.pitch;
    var radioHeight = parseFloat(pitchData.radioHeight);
    var currentAttitude = parseFloat(pitchData.currentAttitude);
    var attitudeChangeRate = parseFloat(pitchData.attitudeChangeRate);
    
    var predictiveAttitude = this.calculatePredictiveAttitude(currentAttitude, attitudeChangeRate);
    
    // 根据机型确定阈值
    var threshold = 0;
    var shouldTrigger = false;
    var heightLimit = 20; // 默认高度限制
    
    switch (pitchData.aircraftModel) {
      case 'A320_NO_LIP':
        threshold = 9.25;
        heightLimit = 20;
        shouldTrigger = radioHeight < heightLimit && predictiveAttitude > threshold;
        break;
      case 'A320_LIP':
        threshold = 10;
        heightLimit = 20;
        shouldTrigger = radioHeight < heightLimit && predictiveAttitude > threshold;
        break;
      case 'A321':
        threshold = 8.25;
        heightLimit = 20;
        shouldTrigger = radioHeight < heightLimit && predictiveAttitude > threshold;
        break;
      case 'A330-200':
        threshold = 10.5;
        heightLimit = 25;
        shouldTrigger = radioHeight < heightLimit && predictiveAttitude > threshold;
        break;
      case 'A330-300':
        threshold = 9;
        heightLimit = 25;
        shouldTrigger = radioHeight < heightLimit && predictiveAttitude > threshold;
        break;
    }
    
    var warningStatus = shouldTrigger ? '⚠️ PITCH PITCH' : '✅ 正常';
    
    // 计算阈值差距
    var thresholdGap = predictiveAttitude - threshold;
    var thresholdGapStatus = thresholdGap >= 0 ? 'warning' : 'safe';
    
    this.setData({
      'pitch.result': true,
      'pitch.predictiveAttitude': predictiveAttitude.toFixed(2),
      'pitch.threshold': threshold.toString(),
      'pitch.warningStatus': warningStatus,
      'pitch.shouldTrigger': shouldTrigger,
      'pitch.heightLimit': heightLimit,
      'pitch.thresholdGap': (thresholdGap >= 0 ? '+' : '') + thresholdGap.toFixed(2),
      'pitch.thresholdGapStatus': thresholdGapStatus
    });
  },

  // 计算预测飞机姿态
  calculatePredictiveAttitude: function(currentAttitudeDegrees, attitudeChangeRateDegreesPerSecond) {
    return currentAttitudeDegrees + attitudeChangeRateDegreesPerSecond * 1.0;
  },

  // PITCH输入事件
  onPitchRadioHeightChange: function(event) {
    this.setData({ 
      'pitch.radioHeight': event.detail 
    });
  },

  onPitchCurrentAttitudeChange: function(event) { // 改名
    this.setData({ 
      'pitch.currentAttitude': event.detail 
    });
  },

  onPitchAttitudeChangeRateChange: function(event) { // 改名
    this.setData({ 
      'pitch.attitudeChangeRate': event.detail 
    });
  },

  // 步骤控制方法
  nextStep: function() {
    var currentStep = this.data.currentStep;
    
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
      if (!this.data.pitch.currentAttitude) {
        wx.showToast({
          title: '请输入当前飞机姿态',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 4) {
      if (!this.data.pitch.attitudeChangeRate) {
        wx.showToast({
          title: '请输入飞机姿态变化率',
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
  prevStep: function() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1,
        'pitch.result': false // 清除结果
      });
    }
  },

  // 重新开始
  restart: function() {
    this.setData({
      currentStep: 1,
      'pitch.aircraftModel': '',
      'pitch.aircraftModelDisplay': '',
      'pitch.radioHeight': '',
      'pitch.currentAttitude': '',
      'pitch.attitudeChangeRate': '',
      'pitch.result': false,
      'pitch.predictiveAttitude': '',
      'pitch.threshold': '',
      'pitch.warningStatus': '',
      'pitch.shouldTrigger': false,
      'pitch.heightLimit': '',
      'pitch.thresholdGap': '',
      'pitch.thresholdGapStatus': ''
    });
  },

  // PITCH飞机选择器
  showAircraftPicker: function() {
    this.setData({ showAircraftModelPicker: true });
  },

  onAircraftPickerClose: function() {
    this.setData({ showAircraftModelPicker: false });
  },

  onAircraftModelSelect: function(event) {
    var self = this;
    var selectedValue = event.detail.value;
    var selectedAction = null;
    
    // 寻找选中的选项
    for (var i = 0; i < this.data.aircraftModelActions.length; i++) {
      if (this.data.aircraftModelActions[i].value === selectedValue) {
        selectedAction = this.data.aircraftModelActions[i];
        break;
      }
    }
    
    this.setData({
      'pitch.aircraftModel': selectedValue,
      'pitch.aircraftModelDisplay': selectedAction ? selectedAction.name : selectedValue,
      showAircraftModelPicker: false,
      'pitch.result': false // 清除之前的计算结果
    });
    
    // 自动进入下一步
    setTimeout(function() {
      self.nextStep();
    }, 500);
  },

  // 清空数据
  clearData: function() {
    this.restart();
  },

  // 新增：飞机选择方法
  selectAircraft: function(event) {
    var model = event.currentTarget.dataset.model;
    var display = event.currentTarget.dataset.display;
    
    this.setData({
      'pitch.aircraftModel': model,
      'pitch.aircraftModelDisplay': display,
      'pitch.result': false // 清除之前的计算结果
    });
  }
});