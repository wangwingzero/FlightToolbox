/**
 * 长航线换班页面 - 分步引导式设计
 * 使用BasePage基类和step-guide组件
 * 严格遵循ES5语法
 */

var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    // 分步引导相关
    currentStep: 1,
    stepConfig: [
      { step: 1, label: '航班信息' },
      { step: 2, label: '机组配置' },
      { step: 3, label: '换班规则' },
      { step: 4, label: '高级设置' },
      { step: 5, label: '预览确认' }
    ],
    
    // 步骤验证状态
    step1Validated: false,
    step2Validated: false,
    step3Validated: false,
    step4Validated: false,
    canProceedToNext: false,
    
    // 原有数据
    departureTime: Date.now(),
    departureTimeValue: '01:42',
    departureTimeDisplay: '',
    minDate: new Date(2025, 0, 1).getTime(),
    maxDate: new Date(2026, 11, 31).getTime(),
    flightHours: 8,
    flightMinutes: 30,
    crewCount: 2,
    rotationRounds: 1,
    landingAdvanceHours: 1,
    landingAdvanceMinutes: 0,
    
    // 选择器显示状态
    showDepartureTimePicker: false,
    showFlightDurationPicker: false,
    showLandingAdvanceTimePicker: false,
    
    // 选择器数据
    flightDurationColumns: [],
    landingAdvanceTimeColumns: [],
    
    // 计算相关
    averageTimeDisplay: '2小时30分钟',
    totalRotations: 2,
    previewSchedule: [],
    
    // 计算结果
    rotationResult: null,
    showResult: false,
    
    // 增强预览数据
    stepPreviewData: null,
    estimatedArrival: '',
    efficiencyScore: 0,
    workloadBalance: '一般',
    restTimeRatio: '0%',
    progressData: {
      step1: false,
      step2: false,
      step3: false,
      step4: false,
      overall: 0
    }
  },

  customOnLoad: function() {
    console.log('🛫 长航线换班页面加载');
    this.initializeData();
    this.setupTimePickerColumns();
    this.validateCurrentStep();
    this.updatePreviewData(); // 添加初始预览数据更新
  },

  // 初始化数据
  initializeData: function() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var hoursStr = hours < 10 ? '0' + hours : '' + hours;
    var minutesStr = minutes < 10 ? '0' + minutes : '' + minutes;
    var timeString = hoursStr + ':' + minutesStr;
    
    this.setData({
      departureTime: now.getTime(),
      departureTimeValue: timeString,
      departureTimeDisplay: this.formatTime(now)
    });
  },

  // 设置时间选择器的列数据
  setupTimePickerColumns: function() {
    var self = this;
    
    // 飞行时间选择器（0-20小时，0-59分钟）
    var flightDurationColumns = [
      {
        values: (function() {
          var arr = [];
          for (var i = 0; i <= 20; i++) {
            arr.push(i.toString());
          }
          return arr;
        })(),
        defaultIndex: 8
      },
      {
        values: (function() {
          var arr = [];
          for (var i = 0; i < 60; i++) {
            arr.push(i < 10 ? '0' + i : '' + i);
          }
          return arr;
        })(),
        defaultIndex: 30
      }
    ];

    // 进驾驶舱时间选择器（0-5小时，0-59分钟）
    var landingAdvanceTimeColumns = [
      {
        values: (function() {
          var arr = [];
          for (var i = 0; i <= 5; i++) {
            arr.push(i.toString());
          }
          return arr;
        })(),
        defaultIndex: 1
      },
      {
        values: (function() {
          var arr = [];
          for (var i = 0; i < 60; i++) {
            arr.push(i < 10 ? '0' + i : '' + i);
          }
          return arr;
        })(),
        defaultIndex: 0
      }
    ];

    this.setData({
      flightDurationColumns: flightDurationColumns,
      landingAdvanceTimeColumns: landingAdvanceTimeColumns
    });
  },

  // 步骤变化处理
  onStepChange: function(event) {
    var currentStep = event.detail.currentStep;
    console.log('🎯 步骤变化:', currentStep);
    
    this.setData({
      currentStep: currentStep
    });
    
    this.validateCurrentStep();
    this.updatePreviewData();
  },

  // 下一步处理
  onNextStep: function(event) {
    var newStep = event.detail.currentStep;
    console.log('➡️ 下一步:', newStep);
    
    if (this.validateStep(newStep - 1)) {
      this.setData({
        currentStep: newStep
      });
      this.validateCurrentStep();
      this.updatePreviewData();
      
      // 触觉反馈
      wx.vibrateShort({ type: 'light' });
    }
  },

  // 上一步处理
  onPrevStep: function(event) {
    var newStep = event.detail.currentStep;
    console.log('⬅️ 上一步:', newStep);
    
    this.setData({
      currentStep: newStep
    });
    this.validateCurrentStep();
  },

  // 完成处理
  onComplete: function(event) {
    console.log('🚀 完成配置');
    this.generateFinalResult();
  },

  // 验证当前步骤
  validateCurrentStep: function() {
    var currentStep = this.data.currentStep;
    var canProceed = false;
    
    switch (currentStep) {
      case 1:
        canProceed = this.data.departureTimeDisplay && this.data.flightHours > 0;
        this.setData({ step1Validated: canProceed });
        break;
      case 2:
        canProceed = this.data.crewCount >= 2 && this.data.crewCount <= 5;
        this.setData({ step2Validated: canProceed });
        break;
      case 3:
        canProceed = true; // 规则说明步骤，总是可以继续
        this.setData({ step3Validated: canProceed });
        break;
      case 4:
        canProceed = this.data.rotationRounds >= 1;
        this.setData({ step4Validated: canProceed });
        this.updateCalculationPreview();
        break;
      case 5:
        canProceed = true;
        this.generatePreviewSchedule();
        break;
    }
    
    this.setData({ canProceedToNext: canProceed });
  },

  // 验证指定步骤
  validateStep: function(step) {
    switch (step) {
      case 1:
        return this.data.departureTimeDisplay && this.data.flightHours > 0;
      case 2:
        return this.data.crewCount >= 2 && this.data.crewCount <= 5;
      case 3:
        return true;
      case 4:
        return this.data.rotationRounds >= 1;
      default:
        return true;
    }
  },

  // 更新预览数据 - 增强实时预览功能
  updatePreviewData: function() {
    var currentStep = this.data.currentStep;
    console.log('📊 更新预览数据 - 步骤:', currentStep);
    
    // 基础数据计算
    this.updateBasicCalculations();
    
    // 根据当前步骤更新特定预览内容
    switch (currentStep) {
      case 1:
        this.updateStep1Preview();
        break;
      case 2:
        this.updateStep2Preview();
        break;
      case 3:
        this.updateStep3Preview();
        break;
      case 4:
        this.updateStep4Preview();
        break;
      case 5:
        this.updateStep5Preview();
        break;
    }
    
    // 更新整体进度和验证状态
    this.updateOverallProgress();
  },

  // 更新基础计算数据
  updateBasicCalculations: function() {
    var totalFlightMinutes = this.data.flightHours * 60 + this.data.flightMinutes;
    var crewCount = this.data.crewCount;
    var rotationRounds = this.data.rotationRounds;
    
    // 计算预计到达时间
    var arrivalTime = null;
    var estimatedArrival = '';
    if (this.data.departureTime) {
      arrivalTime = this.addMinutes(new Date(this.data.departureTime), totalFlightMinutes);
      estimatedArrival = this.formatTime(arrivalTime);
    }
    
    // 计算平均工作时间
    var averageMinutesPerCrewPerRound = Math.floor(totalFlightMinutes / (crewCount * rotationRounds));
    var averageHours = Math.floor(averageMinutesPerCrewPerRound / 60);
    var averageRemainingMinutes = averageMinutesPerCrewPerRound % 60;
    
    // 计算效率指标
    var efficiency = this.calculateEfficiencyMetrics();
    
    this.setData({
      estimatedArrival: estimatedArrival,
      averageTimeDisplay: averageHours + '小时' + averageRemainingMinutes + '分钟',
      totalRotations: crewCount * rotationRounds,
      efficiencyScore: efficiency.score,
      workloadBalance: efficiency.balance,
      restTimeRatio: efficiency.restRatio
    });
  },

  // 计算效率指标
  calculateEfficiencyMetrics: function() {
    var totalFlightMinutes = this.data.flightHours * 60 + this.data.flightMinutes;
    var crewCount = this.data.crewCount;
    var rotationRounds = this.data.rotationRounds;
    var landingAdvanceMinutes = this.data.landingAdvanceHours * 60 + this.data.landingAdvanceMinutes;
    
    // 效率评分 (0-100)
    var averageWorkTime = totalFlightMinutes / crewCount;
    var idealWorkTime = 4 * 60; // 理想4小时
    var efficiencyScore = Math.min(100, Math.max(0, 100 - Math.abs(averageWorkTime - idealWorkTime) / idealWorkTime * 100));
    
    // 工作负荷平衡度
    var workloadBalance = rotationRounds >= 2 ? '良好' : '一般';
    
    // 休息时间比例
    var totalWorkTime = totalFlightMinutes;
    var totalAvailableTime = totalFlightMinutes * crewCount;
    var restTimeRatio = ((totalAvailableTime - totalWorkTime) / totalAvailableTime * 100).toFixed(1) + '%';
    
    return {
      score: Math.round(efficiencyScore),
      balance: workloadBalance,
      restRatio: restTimeRatio
    };
  },

  // 步骤1预览：航班基础信息
  updateStep1Preview: function() {
    var previewData = {
      stepTitle: '航班基础信息',
      stepIcon: '🛫',
      previewItems: []
    };
    
    if (this.data.departureTimeDisplay) {
      var totalMinutes = this.data.flightHours * 60 + this.data.flightMinutes;
      var estimatedArrival = this.addMinutes(new Date(this.data.departureTime), totalMinutes);
      
      previewData.previewItems = [
        { label: '起飞时间', value: this.data.departureTimeDisplay, status: 'success' },
        { label: '飞行时长', value: this.data.flightHours + '小时' + this.data.flightMinutes + '分钟', status: 'success' },
        { label: '预计到达', value: this.formatTime(estimatedArrival), status: 'info' },
        { label: '航班类型', value: totalMinutes > 8*60 ? '长航线' : '中短航线', status: totalMinutes > 8*60 ? 'success' : 'warning' }
      ];
    } else {
      previewData.previewItems = [
        { label: '配置状态', value: '请设置起飞时间和飞行时长', status: 'warning' }
      ];
    }
    
    this.setData({ stepPreviewData: previewData });
  },

  // 步骤2预览：机组配置分析
  updateStep2Preview: function() {
    var crewCount = this.data.crewCount;
    var totalFlightMinutes = this.data.flightHours * 60 + this.data.flightMinutes;
    var averageWorkTime = Math.floor(totalFlightMinutes / crewCount);
    var averageHours = Math.floor(averageWorkTime / 60);
    var averageMinutes = averageWorkTime % 60;
    
    var previewData = {
      stepTitle: '机组配置分析',
      stepIcon: '👥',
      previewItems: [
        { label: '机组套数', value: crewCount + '套', status: 'success' },
        { label: '人员配置', value: '每套2人 × ' + crewCount + '套 = ' + (crewCount * 2) + '人', status: 'info' },
        { label: '平均工作时间', value: averageHours + 'h' + averageMinutes + 'm', status: averageWorkTime > 5*60 ? 'warning' : 'success' },
        { label: '配置建议', value: this.getCrewConfigAdvice(crewCount, totalFlightMinutes), status: 'info' }
      ]
    };
    
    this.setData({ stepPreviewData: previewData });
  },

  // 步骤3预览：换班规则确认
  updateStep3Preview: function() {
    var previewData = {
      stepTitle: '换班规则确认',
      stepIcon: '🔄',
      previewItems: [
        { label: '第一套机组', value: '起飞 + 着陆', status: 'success' },
        { label: '其他机组', value: '巡航轮换', status: 'success' },
        { label: '换班原则', value: '平均分配 + 关键阶段保障', status: 'info' },
        { label: '安全标准', value: '符合CCAR-121规定', status: 'success' }
      ]
    };
    
    this.setData({ stepPreviewData: previewData });
  },

  // 步骤4预览：高级设置与优化
  updateStep4Preview: function() {
    var efficiency = this.calculateEfficiencyMetrics();
    var previewData = {
      stepTitle: '配置优化分析',
      stepIcon: '⚙️',
      previewItems: [
        { label: '换班轮数', value: this.data.rotationRounds + '轮', status: 'success' },
        { label: '进驾驶舱时间', value: '着陆前' + this.data.landingAdvanceHours + 'h' + this.data.landingAdvanceMinutes + 'm', status: 'success' },
        { label: '效率评分', value: efficiency.score + '/100', status: efficiency.score >= 80 ? 'success' : efficiency.score >= 60 ? 'warning' : 'error' },
        { label: '工作平衡度', value: efficiency.balance, status: efficiency.balance === '良好' ? 'success' : 'warning' }
      ]
    };
    
    this.setData({ stepPreviewData: previewData });
  },

  // 步骤5预览：最终确认
  updateStep5Preview: function() {
    try {
      var result = this.performRotationCalculation();
      var totalDuties = result ? result.dutySchedule.length : 0;
      
      var previewData = {
        stepTitle: '最终配置确认',
        stepIcon: '👀',
        previewItems: [
          { label: '总换班次数', value: totalDuties + '次', status: 'success' },
          { label: '配置完整性', value: '100%完成', status: 'success' },
          { label: '系统建议', value: this.getFinalRecommendation(), status: 'info' },
          { label: '准备状态', value: '可生成完整安排', status: 'success' }
        ]
      };
      
      this.setData({ stepPreviewData: previewData });
    } catch (error) {
      console.error('步骤5预览更新失败:', error);
    }
  },

  // 获取机组配置建议
  getCrewConfigAdvice: function(crewCount, totalFlightMinutes) {
    var totalHours = totalFlightMinutes / 60;
    
    if (totalHours < 8) {
      return crewCount <= 2 ? '配置合理' : '可考虑减少机组';
    } else if (totalHours < 12) {
      return crewCount >= 2 && crewCount <= 3 ? '配置优秀' : '建议2-3套机组';
    } else if (totalHours < 16) {
      return crewCount >= 3 && crewCount <= 4 ? '配置优秀' : '建议3-4套机组';
    } else {
      return crewCount >= 4 ? '配置合理' : '建议增加机组套数';
    }
  },

  // 获取最终建议
  getFinalRecommendation: function() {
    var efficiency = this.calculateEfficiencyMetrics();
    
    if (efficiency.score >= 90) {
      return '配置极佳，建议直接使用';
    } else if (efficiency.score >= 80) {
      return '配置良好，可优化机组轮数';
    } else if (efficiency.score >= 70) {
      return '配置一般，建议调整参数';
    } else {
      return '配置需优化，建议重新调整';
    }
  },

  // 更新整体进度
  updateOverallProgress: function() {
    var progressData = {
      step1: this.data.step1Validated,
      step2: this.data.step2Validated, 
      step3: this.data.step3Validated,
      step4: this.data.step4Validated,
      overall: (this.data.currentStep - 1) / 4 * 100
    };
    
    this.setData({ progressData: progressData });
  },

  // 更新计算预览
  updateCalculationPreview: function() {
    var totalFlightMinutes = this.data.flightHours * 60 + this.data.flightMinutes;
    var averageMinutesPerCrewPerRound = Math.floor(totalFlightMinutes / (this.data.crewCount * this.data.rotationRounds));
    var averageHours = Math.floor(averageMinutesPerCrewPerRound / 60);
    var averageRemainingMinutes = averageMinutesPerCrewPerRound % 60;
    var totalRotations = this.data.crewCount * this.data.rotationRounds;
    
    this.setData({
      averageTimeDisplay: averageHours + '小时' + averageRemainingMinutes + '分钟',
      totalRotations: totalRotations
    });
  },

  // 生成预览安排
  generatePreviewSchedule: function() {
    var self = this;
    
    try {
      var result = this.performRotationCalculation();
      if (result && result.dutySchedule) {
        var previewSchedule = result.dutySchedule.map(function(item) {
          return {
            crewNumber: item.crewNumber,
            phase: item.phase,
            phaseText: item.phase === 'takeoff' ? '起飞' : item.phase === 'landing' ? '着陆' : '巡航',
            displayStartTime: item.displayStartTime,
            displayEndTime: item.displayEndTime,
            displayDuration: item.displayDuration
          };
        });
        
        this.setData({
          previewSchedule: previewSchedule
        });
      }
    } catch (error) {
      console.error('生成预览失败:', error);
      this.handleError(error, '预览生成');
    }
  },

  // 机组套数变化
  changeCrewCount: function(event) {
    var delta = parseInt(event.currentTarget.dataset.delta, 10);
    var newCount = this.data.crewCount + delta;
    
    if (newCount >= 2 && newCount <= 5) {
      this.setData({
        crewCount: newCount,
        showResult: false
      });
      this.validateCurrentStep();
      this.updatePreviewData(); // 添加实时预览更新
    }
  },

  // 换班轮数变化
  changeRotationRounds: function(event) {
    var delta = parseInt(event.currentTarget.dataset.delta, 10);
    var newRounds = this.data.rotationRounds + delta;
    
    if (newRounds >= 1 && newRounds <= 5) {
      this.setData({
        rotationRounds: newRounds,
        showResult: false
      });
      this.validateCurrentStep();
      this.updatePreviewData(); // 添加实时预览更新
    }
  },

  // 生成最终结果
  generateFinalResult: function() {
    try {
      var result = this.performRotationCalculation();
      if (result) {
        this.setData({
          rotationResult: result,
          showResult: true
        });
        
        this.showSuccess('换班安排生成成功');
        wx.vibrateShort({ type: 'medium' });
        
        // 滚动到结果区域
        var self = this;
        setTimeout(function() {
          wx.pageScrollTo({
            selector: '.result-section',
            duration: 500
          });
        }, 100);
      }
    } catch (error) {
      console.error('生成最终结果失败:', error);
      this.handleError(error, '生成换班安排');
    }
  },

  // 重置到第一步
  resetToFirstStep: function() {
    this.setData({
      currentStep: 1,
      showResult: false,
      rotationResult: null,
      previewSchedule: []
    });
    
    // 重新验证
    this.validateCurrentStep();
    
    // 滚动到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    });
  },

  // 时间选择器相关方法 - 保持原有逻辑
  showDepartureTimePicker: function() {
    this.setData({ showDepartureTimePicker: true });
  },

  closeDepartureTimePicker: function() {
    this.setData({ showDepartureTimePicker: false });
  },

  confirmDepartureTime: function(event) {
    var timeString = event.detail;
    var timeParts = timeString.split(':');
    var hours = parseInt(timeParts[0], 10);
    var minutes = parseInt(timeParts[1], 10);
    
    var today = new Date();
    var selectedTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    
    this.setData({
      departureTime: selectedTime.getTime(),
      departureTimeValue: timeString,
      departureTimeDisplay: this.formatTime(selectedTime),
      showDepartureTimePicker: false,
      showResult: false
    });
    
    this.validateCurrentStep();
    this.updatePreviewData(); // 添加实时预览更新
  },

  showFlightDurationPicker: function() {
    this.setData({ showFlightDurationPicker: true });
  },

  closeFlightDurationPicker: function() {
    this.setData({ showFlightDurationPicker: false });
  },

  confirmFlightDuration: function(event) {
    var selectedValue = event.detail.value;
    var hours = parseInt(selectedValue[0], 10);
    var minutes = parseInt(selectedValue[1], 10);
    
    this.setData({
      flightHours: hours,
      flightMinutes: minutes,
      showFlightDurationPicker: false,
      showResult: false
    });
    
    this.validateCurrentStep();
    this.updatePreviewData(); // 添加实时预览更新
  },

  showLandingAdvanceTimePicker: function() {
    this.setData({ showLandingAdvanceTimePicker: true });
  },

  closeLandingAdvanceTimePicker: function() {
    this.setData({ showLandingAdvanceTimePicker: false });
  },

  confirmLandingAdvanceTime: function(event) {
    var selectedValue = event.detail.value;
    var hours = parseInt(selectedValue[0], 10);
    var minutes = parseInt(selectedValue[1], 10);
    
    this.setData({
      landingAdvanceHours: hours,
      landingAdvanceMinutes: minutes,
      showLandingAdvanceTimePicker: false,
      showResult: false
    });
    
    this.validateCurrentStep();
    this.updatePreviewData(); // 添加实时预览更新
  },

  // 保留原有的计算逻辑
  performRotationCalculation: function() {
    var departureTime = this.data.departureTime;
    var flightHours = this.data.flightHours;
    var flightMinutes = this.data.flightMinutes;
    var crewCount = this.data.crewCount;
    var rotationRounds = this.data.rotationRounds;
    var landingAdvanceHours = this.data.landingAdvanceHours;
    var landingAdvanceMinutes = this.data.landingAdvanceMinutes;

    if (!departureTime) {
      this.showError('请选择起飞时间');
      return null;
    }

    var departure = new Date(departureTime);
    var totalFlightMinutes = flightHours * 60 + flightMinutes;
    var arrival = this.addMinutes(departure, totalFlightMinutes);
    var landingAdvanceMinutesTotal = landingAdvanceHours * 60 + landingAdvanceMinutes;
    var averageMinutesPerCrewPerRound = Math.floor(totalFlightMinutes / (crewCount * rotationRounds));
    var averageHours = Math.floor(averageMinutesPerCrewPerRound / 60);
    var averageRemainingMinutes = averageMinutesPerCrewPerRound % 60;

    var dutySchedule = this.calculateCorrectMultiRoundRotation(
      departure,
      arrival,
      crewCount,
      rotationRounds,
      averageMinutesPerCrewPerRound,
      landingAdvanceMinutesTotal
    );

    return {
      departureTime: departure,
      flightDuration: { hours: flightHours, minutes: flightMinutes },
      crewCount: crewCount,
      rotationEndBefore: { hours: landingAdvanceHours, minutes: landingAdvanceMinutes },
      rotationInterval: { hours: averageHours, minutes: averageRemainingMinutes },
      arrivalTime: arrival,
      rotationStartTime: departure,
      rotationEndTime: this.addMinutes(arrival, -landingAdvanceMinutesTotal),
      dutySchedule: dutySchedule
    };
  },

  // 保留原有的计算方法
  calculateCorrectMultiRoundRotation: function(departure, arrival, crewCount, rotationRounds, averageMinutesPerCrewPerRound, landingAdvanceMinutesTotal) {
    var schedule = [];
    var landingStartTime = this.addMinutes(arrival, -landingAdvanceMinutesTotal);
    var rotationSequence = [];
    
    for (var round = 1; round <= rotationRounds; round++) {
      for (var crewIndex = 1; crewIndex <= crewCount; crewIndex++) {
        rotationSequence.push(crewIndex);
      }
    }
    
    var currentTime = new Date(departure.toString());
    
    for (var i = 0; i < rotationSequence.length; i++) {
      var crewIndex = rotationSequence[i];
      
      if (currentTime >= landingStartTime) {
        break;
      }
      
      var segmentEnd;
      if (i === 0 && crewIndex === 1) {
        segmentEnd = this.addMinutes(currentTime, averageMinutesPerCrewPerRound - landingAdvanceMinutesTotal);
      } else {
        segmentEnd = this.addMinutes(currentTime, averageMinutesPerCrewPerRound);
      }
      
      if (segmentEnd > landingStartTime) {
        segmentEnd = landingStartTime;
      }
      
      if (this.getMinutesFromStart(currentTime, segmentEnd) < 5) {
        break;
      }
      
      var phase = i === 0 ? 'takeoff' : 'cruise';
      
      schedule.push({
        crewNumber: crewIndex,
        startTime: new Date(currentTime.toString()),
        endTime: segmentEnd,
        duration: this.getTimeDifference(currentTime, segmentEnd),
        phase: phase,
        displayStartTime: this.formatTime(currentTime),
        displayEndTime: this.formatTime(segmentEnd),
        displayDuration: this.formatDuration(this.getTimeDifference(currentTime, segmentEnd))
      });
      
      currentTime = segmentEnd;
    }
    
    // 最后阶段：第1套机组着陆
    schedule.push({
      crewNumber: 1,
      startTime: landingStartTime,
      endTime: arrival,
      duration: this.getTimeDifference(landingStartTime, arrival),
      phase: 'landing',
      displayStartTime: this.formatTime(landingStartTime),
      displayEndTime: this.formatTime(arrival),
      displayDuration: this.formatDuration(this.getTimeDifference(landingStartTime, arrival))
    });
    
    return schedule;
  },

  // 工具方法
  addMinutes: function(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  },

  getTimeDifference: function(start, end) {
    var diffMs = end.getTime() - start.getTime();
    var diffMinutes = Math.floor(diffMs / 60000);
    var hours = Math.floor(diffMinutes / 60);
    var minutes = diffMinutes % 60;
    return { hours: hours, minutes: minutes };
  },

  getMinutesFromStart: function(start, current) {
    return Math.floor((current.getTime() - start.getTime()) / 60000);
  },

  formatTime: function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var hoursStr = hours < 10 ? '0' + hours : '' + hours;
    var minutesStr = minutes < 10 ? '0' + minutes : '' + minutes;
    return hoursStr + ':' + minutesStr;
  },

  formatDuration: function(duration) {
    var minutesStr = duration.minutes < 10 ? '0' + duration.minutes : '' + duration.minutes;
    return duration.hours + 'h' + minutesStr + 'm';
  },

  // 分享换班安排
  shareRotation: function() {
    if (!this.data.rotationResult) {
      this.showError('请先生成换班安排');
      return;
    }

    var result = this.data.rotationResult;
    var shareText = '长航线换班安排\n\n';
    shareText += '🛫 起飞: ' + this.formatTime(result.departureTime) + '\n';
    shareText += '🛬 着陆: ' + this.formatTime(result.arrivalTime) + '\n';
    shareText += '⏱️ 飞行时间: ' + result.flightDuration.hours + '小时' + result.flightDuration.minutes + '分钟\n';
    shareText += '👥 机组套数: ' + result.crewCount + '套\n';
    shareText += '🔄 换班轮数: ' + this.data.rotationRounds + '轮\n';
    shareText += '📋 值勤安排:\n';
    
    for (var i = 0; i < result.dutySchedule.length; i++) {
      var duty = result.dutySchedule[i];
      var title = duty.phase === 'takeoff' ? '第' + duty.crewNumber + '套机组(起飞)' : 
                 duty.phase === 'landing' ? '第' + duty.crewNumber + '套机组(着陆)' : 
                 '第' + duty.crewNumber + '套机组(巡航)';
      shareText += title + ': ' + duty.displayStartTime + '-' + duty.displayEndTime + ' (' + duty.displayDuration + ')\n';
    }

    var self = this;
    wx.setClipboardData({
      data: shareText,
      success: function() {
        self.showSuccess('换班安排已复制');
      }
    });
  },

  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '长航线换班计算工具',
      path: '/packageO/long-flight-crew-rotation/index'
    };
  },

  onShareTimeline: function() {
    return {
      title: '长航线换班计算工具 - FlightToolbox'
    };
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));