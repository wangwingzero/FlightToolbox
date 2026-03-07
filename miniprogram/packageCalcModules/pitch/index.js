// packageCalcModules/pitch/index.js
var BasePage = require('../../utils/base-page.js');
var buttonChargeManager = require('../../utils/button-charge-manager.js');

/**
 * PITCH PITCH 警告阈值表
 * 根据机型返回 { threshold: 度, heightLimit: 英尺 }
 */
function getPitchThreshold(model) {
  switch (model) {
    case 'A320_NO_LIP':
      return { threshold: 9.25, heightLimit: 20 };
    case 'A320_LIP':
      return { threshold: 10.0, heightLimit: 20 };
    case 'A321':
      return { threshold: 8.25, heightLimit: 20 };
    case 'A330-200':
      return { threshold: 10.5, heightLimit: 25 };
    case 'A330-300':
      return { threshold: 9.0, heightLimit: 25 };
    default:
      return { threshold: 9.25, heightLimit: 20 };
  }
}

BasePage.createPage({
  data: {
    currentStep: 1,
    pitch: {
      aircraftModel: '',
      aircraftModelDisplay: '',
      radioHeight: '',
      currentAttitude: '',
      attitudeChangeRate: '',
      result: false,
      shouldTrigger: false,
      predictiveAttitude: '',
      threshold: '',
      thresholdGap: '',
      thresholdGapStatus: ''
    }
  },

  customOnLoad: function() {
    // 初始化在步骤1
    this.setData({ currentStep: 1 });
  },

  customOnShow: function() {
    // 无需额外操作
  },

  customOnUnload: function() {
    // 无需清理
  },

  /**
   * 选择飞机型号，进入步骤2
   */
  selectAircraft: function(e) {
    var model = e.currentTarget.dataset.model;
    var display = e.currentTarget.dataset.display;
    this.setData({
      'pitch.aircraftModel': model,
      'pitch.aircraftModelDisplay': display,
      'pitch.result': false,
      currentStep: 2
    });
  },

  /**
   * 返回上一步
   */
  goBackStep: function() {
    var step = this.data.currentStep;
    if (step > 1) {
      this.setData({ currentStep: step - 1 });
    }
  },

  /**
   * 无线电高度输入
   */
  onPitchRadioHeightChange: function(e) {
    this.setData({ 'pitch.radioHeight': e.detail });
  },

  /**
   * 当前飞机姿态输入
   */
  onPitchCurrentAttitudeChange: function(e) {
    this.setData({ 'pitch.currentAttitude': e.detail });
  },

  /**
   * 飞机姿态变化率输入
   */
  onPitchAttitudeChangeRateChange: function(e) {
    this.setData({ 'pitch.attitudeChangeRate': e.detail });
  },

  /**
   * 触发计算（含参数校验 + 功能收费门控）
   */
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

    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-pitch', validateParams, 'PITCH PITCH告警分析', performCalculation
    );
  },

  /**
   * 执行PITCH PITCH告警计算
   * 公式：predictiveAttitude = currentAttitude + attitudeChangeRate * 1.0
   * 判定：radioHeight < heightLimit && predictiveAttitude > threshold
   */
  performPitchPitchCalculation: function() {
    var pitchData = this.data.pitch;
    var radioHeight = parseFloat(pitchData.radioHeight);
    var currentAttitude = parseFloat(pitchData.currentAttitude);
    var attitudeChangeRate = parseFloat(pitchData.attitudeChangeRate);

    // 获取机型阈值
    var config = getPitchThreshold(pitchData.aircraftModel);
    var threshold = config.threshold;
    var heightLimit = config.heightLimit;

    // 预测姿态 = 当前姿态 + 变化率 × 1秒
    var predictiveAttitude = currentAttitude + attitudeChangeRate * 1.0;
    predictiveAttitude = Math.round(predictiveAttitude * 100) / 100;

    // 判定是否触发
    var shouldTrigger = (radioHeight < heightLimit) && (predictiveAttitude > threshold);

    // 阈值差距
    var thresholdGap = Math.round((predictiveAttitude - threshold) * 100) / 100;
    var thresholdGapStatus = thresholdGap >= 0 ? 'warning' : 'safe';

    this.setData({
      'pitch.predictiveAttitude': predictiveAttitude,
      'pitch.threshold': threshold,
      'pitch.shouldTrigger': shouldTrigger,
      'pitch.thresholdGap': thresholdGap,
      'pitch.thresholdGapStatus': thresholdGapStatus,
      'pitch.result': true,
      currentStep: 3
    });
  },

  /**
   * 重新计算（回到步骤1）
   */
  restart: function() {
    this.setData({
      currentStep: 1,
      pitch: {
        aircraftModel: '',
        aircraftModelDisplay: '',
        radioHeight: '',
        currentAttitude: '',
        attitudeChangeRate: '',
        result: false,
        shouldTrigger: false,
        predictiveAttitude: '',
        threshold: '',
        thresholdGap: '',
        thresholdGapStatus: ''
      }
    });
  },

  onShareAppMessage: function() {
    return {
      title: 'PITCH警告计算 - FlightToolbox',
      path: '/packageCalcModules/pitch/index'
    };
  }
})