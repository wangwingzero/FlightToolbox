// 引入SNOWTAM数据
var snowtamData = require('../../data/snowtam.js');

Page({
  data: {
    // 步骤控制 (更新为新的GRF格式步骤)
    currentStep: 1, // 1:机场 2:日期时间 3:跑道 4:跑道状况代码 5:污染物覆盖百分比 6:松散污染物深度 7:污染物状况说明 8:跑道宽度 9:跑道长度变短 10:情景意识 11:结果
    
    // SNOWTAM组件数据 (符合GRF格式)
    snowtam: {
      locationIndicator: '',
      locationIndicatorDisplay: '',
      dateTime: '',
      dateTimeDisplay: '',
      runway: '',
      runwayDisplay: '',
      runwayConditionCode: ['', '', ''], // RWYCC 跑道状况代码
      runwayConditionCodeDisplay: '',
      contaminationCoverage: ['', '', ''], // 污染物覆盖百分比
      contaminationCoverageDisplay: '',
      looseContaminationDepth: ['', '', ''], // 松散污染物深度
      looseContaminationDepthDisplay: '',
      surfaceConditionDescription: ['', '', ''], // 污染物状况说明
      surfaceConditionDescriptionDisplay: '',
      runwayWidth: '', // 跑道宽度
      runwayWidthDisplay: '',
      runwayLengthReduction: '', // 跑道长度变短
      runwayLengthReductionDisplay: '',
      // 情景意识部分字段
      driftSnow: '', // J项：吹积雪堆
      looseSand: '', // K项：散沙
      chemicalTreatment: '', // L项：化学处理
      runwaySnowBanks: '', // M项：跑道雪堤
      taxiwaySnowBanks: '', // N项：滑行道雪堤
      adjacentSnowBanks: '', // O项：跑道附近雪堤
      taxiwayCondition: '', // P项：滑行道状况
      apronCondition: '', // R项：机坪状况
      measuredFriction: '', // S项：测定的摩擦系数
      plainLanguage: '', // T项：明语说明
      result: null,
      error: '',
      dataLoaded: true
    },

    // 当前选中的分段
    currentRWYCCSegment: 0,
    currentCoverageSegment: 0,
    currentDepthSegment: 0,
    currentDescriptionSegment: 0,

    // 实时SNOWTAM代码预览
    previewCode: '',
    currentInputPart: '', // 当前正在输入的部分

    // 示例数据 (更新为GRF格式)
    examples: [
      {
        code: 'A)ZBAA B)12081200 C)01L D)5/5/2 E)100/100/75 F)04/03/04 G)雪浆/干雪/湿雪 H)40 I)01L 变短至3600',
        explanation: '北京首都机场01L跑道GRF雪情报告：头中间段污染轻微，跑道末段雪浆较厚，需要注意',
        category: '标准雪情'
      },
      {
        code: 'A)ZSSS B)01151800 C)16R D)2/1/0 E)100/100/100 F)06/12/09 G)雪浆/冰/压实的雪面上有水 H) I)',
        explanation: '上海浦东机场16R跑道GRF严重雪情报告：全段严重污染，状况恶劣',
        category: '严重雪情'
      },
      {
        code: 'A)ZYHB B)02280600 C)09 D)6/6/6 E)无/无/无 F)无/无/无 G)干/干/干 H) I)',
        explanation: '哈尔滨机场09跑道GRF清洁状态报告：全段干燥清洁，状况良好',
        category: '清洁状态'
      }
    ],

    // 输入键盘数据
    numberKeyboard: ['0','1','2','3','4','5','6','7','8','9'],
    letterKeyboard: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],

    // 折叠面板状态
    activeCollapseItems: []
  },

  onLoad: function() {
    this.initializeSnowtalData();
    this.updatePreviewCode();
    
    // 确保currentStep正确设置
    this.setData({
      currentStep: 1
    });
  },

  // 初始化SNOWTAM数据
  initializeSnowtalData: function() {
    try {
      this.setData({
        'snowtam.dataLoaded': true,
        'snowtam.error': ''
      });
    } catch (error) {
      console.error('❌ SNOWTAM数据初始化失败:', error);
      this.setData({
        'snowtam.error': '数据加载失败: ' + (error.message || '未知错误'),
        'snowtam.dataLoaded': false
      });
    }
  },

  // 更新预览代码 (符合GRF格式)
  updatePreviewCode: function() {
    var snowtam = this.data.snowtam;
    var previewCode = '';
    var currentPart = '';
    
    // 根据当前步骤确定正在输入的部分
    switch (this.data.currentStep) {
      case 1:
        currentPart = 'location';
        previewCode += 'A)' + (snowtam.locationIndicator || '____');
        break;
      case 2:
        currentPart = 'datetime';
        previewCode += 'A)' + (snowtam.locationIndicator || '____');
        previewCode += ' B)' + (snowtam.dateTime || '________');
        break;
      case 3:
        currentPart = 'runway';
        previewCode += 'A)' + (snowtam.locationIndicator || '____');
        previewCode += ' B)' + (snowtam.dateTime || '________');
        previewCode += ' C)' + (snowtam.runway || '__');
        break;
      case 4:
        currentPart = 'rwycc';
        previewCode += 'A)' + (snowtam.locationIndicator || '____');
        previewCode += ' B)' + (snowtam.dateTime || '________');
        previewCode += ' C)' + (snowtam.runway || '__');
        previewCode += ' D)' + (snowtam.runwayConditionCode[0] || '_') + '/' + (snowtam.runwayConditionCode[1] || '_') + '/' + (snowtam.runwayConditionCode[2] || '_');
        break;
      case 5:
        currentPart = 'coverage';
        previewCode += 'A)' + (snowtam.locationIndicator || '____');
        previewCode += ' B)' + (snowtam.dateTime || '________');
        previewCode += ' C)' + (snowtam.runway || '__');
        previewCode += ' D)' + (snowtam.runwayConditionCode[0] || '_') + '/' + (snowtam.runwayConditionCode[1] || '_') + '/' + (snowtam.runwayConditionCode[2] || '_');
        previewCode += ' E)' + (snowtam.contaminationCoverage[0] || '__') + '/' + (snowtam.contaminationCoverage[1] || '__') + '/' + (snowtam.contaminationCoverage[2] || '__');
        break;
      case 6:
        currentPart = 'depth';
        previewCode += 'A)' + (snowtam.locationIndicator || '____');
        previewCode += ' B)' + (snowtam.dateTime || '________');
        previewCode += ' C)' + (snowtam.runway || '__');
        previewCode += ' D)' + (snowtam.runwayConditionCode[0] || '_') + '/' + (snowtam.runwayConditionCode[1] || '_') + '/' + (snowtam.runwayConditionCode[2] || '_');
        previewCode += ' E)' + (snowtam.contaminationCoverage[0] || '__') + '/' + (snowtam.contaminationCoverage[1] || '__') + '/' + (snowtam.contaminationCoverage[2] || '__');
        previewCode += ' F)' + (snowtam.looseContaminationDepth[0] || '__') + '/' + (snowtam.looseContaminationDepth[1] || '__') + '/' + (snowtam.looseContaminationDepth[2] || '__');
        break;
      case 7:
        currentPart = 'description';
        previewCode += 'A)' + (snowtam.locationIndicator || '____');
        previewCode += ' B)' + (snowtam.dateTime || '________');
        previewCode += ' C)' + (snowtam.runway || '__');
        previewCode += ' D)' + (snowtam.runwayConditionCode[0] || '_') + '/' + (snowtam.runwayConditionCode[1] || '_') + '/' + (snowtam.runwayConditionCode[2] || '_');
        previewCode += ' E)' + (snowtam.contaminationCoverage[0] || '__') + '/' + (snowtam.contaminationCoverage[1] || '__') + '/' + (snowtam.contaminationCoverage[2] || '__');
        previewCode += ' F)' + (snowtam.looseContaminationDepth[0] || '__') + '/' + (snowtam.looseContaminationDepth[1] || '__') + '/' + (snowtam.looseContaminationDepth[2] || '__');
        previewCode += ' G)' + (snowtam.surfaceConditionDescription[0] || '__') + '/' + (snowtam.surfaceConditionDescription[1] || '__') + '/' + (snowtam.surfaceConditionDescription[2] || '__');
        break;
      case 8:
        currentPart = 'width';
        previewCode += 'A)' + (snowtam.locationIndicator || '____');
        previewCode += ' B)' + (snowtam.dateTime || '________');
        previewCode += ' C)' + (snowtam.runway || '__');
        previewCode += ' D)' + (snowtam.runwayConditionCode[0] || '_') + '/' + (snowtam.runwayConditionCode[1] || '_') + '/' + (snowtam.runwayConditionCode[2] || '_');
        previewCode += ' E)' + (snowtam.contaminationCoverage[0] || '__') + '/' + (snowtam.contaminationCoverage[1] || '__') + '/' + (snowtam.contaminationCoverage[2] || '__');
        previewCode += ' F)' + (snowtam.looseContaminationDepth[0] || '__') + '/' + (snowtam.looseContaminationDepth[1] || '__') + '/' + (snowtam.looseContaminationDepth[2] || '__');
        previewCode += ' G)' + (snowtam.surfaceConditionDescription[0] || '__') + '/' + (snowtam.surfaceConditionDescription[1] || '__') + '/' + (snowtam.surfaceConditionDescription[2] || '__');
        previewCode += ' H)' + (snowtam.runwayWidth || '__');
        break;
      case 9:
        currentPart = 'reduction';
        previewCode += 'A)' + (snowtam.locationIndicator || '____');
        previewCode += ' B)' + (snowtam.dateTime || '________');
        previewCode += ' C)' + (snowtam.runway || '__');
        previewCode += ' D)' + (snowtam.runwayConditionCode[0] || '_') + '/' + (snowtam.runwayConditionCode[1] || '_') + '/' + (snowtam.runwayConditionCode[2] || '_');
        previewCode += ' E)' + (snowtam.contaminationCoverage[0] || '__') + '/' + (snowtam.contaminationCoverage[1] || '__') + '/' + (snowtam.contaminationCoverage[2] || '__');
        previewCode += ' F)' + (snowtam.looseContaminationDepth[0] || '__') + '/' + (snowtam.looseContaminationDepth[1] || '__') + '/' + (snowtam.looseContaminationDepth[2] || '__');
        previewCode += ' G)' + (snowtam.surfaceConditionDescription[0] || '__') + '/' + (snowtam.surfaceConditionDescription[1] || '__') + '/' + (snowtam.surfaceConditionDescription[2] || '__');
        previewCode += ' H)' + (snowtam.runwayWidth || '__');
        previewCode += ' I)' + (snowtam.runwayLengthReduction || '__');
        break;
      default:
        previewCode += 'A)' + (snowtam.locationIndicator || '____');
        previewCode += ' B)' + (snowtam.dateTime || '________');
        previewCode += ' C)' + (snowtam.runway || '__');
        previewCode += ' D)' + (snowtam.runwayConditionCode[0] || '_') + '/' + (snowtam.runwayConditionCode[1] || '_') + '/' + (snowtam.runwayConditionCode[2] || '_');
        previewCode += ' E)' + (snowtam.contaminationCoverage[0] || '__') + '/' + (snowtam.contaminationCoverage[1] || '__') + '/' + (snowtam.contaminationCoverage[2] || '__');
        previewCode += ' F)' + (snowtam.looseContaminationDepth[0] || '__') + '/' + (snowtam.looseContaminationDepth[1] || '__') + '/' + (snowtam.looseContaminationDepth[2] || '__');
        previewCode += ' G)' + (snowtam.surfaceConditionDescription[0] || '__') + '/' + (snowtam.surfaceConditionDescription[1] || '__') + '/' + (snowtam.surfaceConditionDescription[2] || '__');
        previewCode += ' H)' + (snowtam.runwayWidth || '__');
        previewCode += ' I)' + (snowtam.runwayLengthReduction || '__');
    }
    
    this.setData({
      previewCode: previewCode,
      currentInputPart: currentPart
    });
  },

  // 步骤控制方法
  nextStep: function() {
    var currentStep = this.data.currentStep;
    
    // 校验当前步骤的输入
    if (currentStep === 1) {
      if (!this.data.snowtam.locationIndicator || this.data.snowtam.locationIndicator.length !== 4) {
        wx.showToast({
          title: '请输入4位机场代码',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!this.data.snowtam.dateTime || this.data.snowtam.dateTime.length !== 8) {
        wx.showToast({
          title: '请输入完整的日期时间(8位)',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 3) {
      if (!this.data.snowtam.runway) {
        wx.showToast({
          title: '请选择跑道',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 4) {
      var rwycc = this.data.snowtam.runwayConditionCode;
      if (!rwycc[0] || !rwycc[1] || !rwycc[2]) {
        wx.showToast({
          title: '请完成所有跑道段的RWYCC选择',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 5) {
      var coverage = this.data.snowtam.contaminationCoverage;
      if (!coverage[0] || !coverage[1] || !coverage[2]) {
        wx.showToast({
          title: '请完成所有跑道段的污染物覆盖百分比选择',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 6) {
      var depth = this.data.snowtam.looseContaminationDepth;
      if (!depth[0] || !depth[1] || !depth[2]) {
        wx.showToast({
          title: '请完成所有跑道段的松散污染物深度输入',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 7) {
      var description = this.data.snowtam.surfaceConditionDescription;
      if (!description[0] || !description[1] || !description[2]) {
        wx.showToast({
          title: '请完成所有跑道段的污染物状况说明',
          icon: 'none'
        });
        return;
      }
    }
    
    // 进入下一步
    this.setData({
      currentStep: currentStep + 1
    });
    this.updatePreviewCode();
    
    // 如果到了最后一步，执行生成
    if (currentStep + 1 === 11) {
      this.generateSnowtamCode();
    }
  },

  // 返回上一步
  prevStep: function() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1,
        'snowtam.result': null // 清除结果
      });
      this.updatePreviewCode();
    }
  },

  // 步骤跳转方法
  goToStep: function(event) {
    var targetStep = parseInt(event.currentTarget.dataset.step);
    
    // 只允许跳转到当前步骤或已完成的步骤
    if (targetStep <= this.data.currentStep) {
      this.setData({
        currentStep: targetStep
      });
      this.updatePreviewCode();
    } else {
      wx.showToast({
        title: '请按顺序完成步骤',
        icon: 'none'
      });
    }
  },

  // 重新开始
  restart: function() {
    this.setData({
      currentStep: 1,
      'snowtam.locationIndicator': '',
      'snowtam.locationIndicatorDisplay': '',
      'snowtam.dateTime': '',
      'snowtam.dateTimeDisplay': '',
      'snowtam.runway': '',
      'snowtam.runwayDisplay': '',
      'snowtam.runwayConditionCode': ['', '', ''],
      'snowtam.runwayConditionCodeDisplay': '',
      'snowtam.contaminationCoverage': ['', '', ''],
      'snowtam.contaminationCoverageDisplay': '',
      'snowtam.looseContaminationDepth': ['', '', ''],
      'snowtam.looseContaminationDepthDisplay': '',
      'snowtam.surfaceConditionDescription': ['', '', ''],
      'snowtam.surfaceConditionDescriptionDisplay': '',
      'snowtam.runwayWidth': '',
      'snowtam.runwayWidthDisplay': '',
      'snowtam.runwayLengthReduction': '',
      'snowtam.runwayLengthReductionDisplay': '',
      'snowtam.result': null,
      'snowtam.error': ''
    });
    this.updatePreviewCode();
  },

  // 机场代码输入
  inputLocationChar: function(event) {
    var char = event.currentTarget.dataset.value;
    var currentValue = this.data.snowtam.locationIndicator || '';
    
    // 限制长度（ICAO代码4位）
    if (currentValue.length >= 4) {
      return;
    }
    
    var newValue = currentValue + char;
    this.setData({
      'snowtam.locationIndicator': newValue,
      'snowtam.locationIndicatorDisplay': newValue
    });
    this.updatePreviewCode();
  },

  // 清除机场代码
  clearLocationInput: function() {
    this.setData({
      'snowtam.locationIndicator': '',
      'snowtam.locationIndicatorDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 删除机场代码字符
  deleteLocationChar: function() {
    var currentValue = this.data.snowtam.locationIndicator || '';
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      this.setData({
        'snowtam.locationIndicator': newValue,
        'snowtam.locationIndicatorDisplay': newValue
      });
    }
    this.updatePreviewCode();
  },

  // 机场代码输入框变化
  onLocationInput: function(event) {
    var value = event.detail.value.toUpperCase();
    // 只允许字母
    value = value.replace(/[^A-Z]/g, '');
    // 限制4位
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    
    this.setData({
      'snowtam.locationIndicator': value,
      'snowtam.locationIndicatorDisplay': value
    });
    this.updatePreviewCode();
  },

  // 机场快捷按钮
  setAirportCode: function(event) {
    var code = event.currentTarget.dataset.value;
    this.setData({
      'snowtam.locationIndicator': code,
      'snowtam.locationIndicatorDisplay': code
    });
    this.updatePreviewCode();
  },

  // 设置当前时间
  setCurrentTime: function() {
    var now = new Date();
    var month = (now.getMonth() + 1).toString().padStart(2, '0');
    var day = now.getDate().toString().padStart(2, '0');
    var hour = now.getHours().toString().padStart(2, '0');
    var minute = now.getMinutes().toString().padStart(2, '0');
    
    var dateTime = month + day + hour + minute;
    var displayValue = this.formatDateTimeDisplay(dateTime);
    
    this.setData({
      'snowtam.dateTime': dateTime,
      'snowtam.dateTimeDisplay': displayValue
    });
    this.updatePreviewCode();
  },

  // 设置时间选项
  setTimeOption: function(event) {
    var option = event.currentTarget.dataset.value;
    var now = new Date();
    var dateTime = '';
    
    switch (option) {
      case 'next-hour':
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        break;
      case '6am-today':
        now.setHours(6);
        now.setMinutes(0);
        break;
      case '12pm-today':
        now.setHours(12);
        now.setMinutes(0);
        break;
    }
    
    var month = (now.getMonth() + 1).toString().padStart(2, '0');
    var day = now.getDate().toString().padStart(2, '0');
    var hour = now.getHours().toString().padStart(2, '0');
    var minute = now.getMinutes().toString().padStart(2, '0');
    
    dateTime = month + day + hour + minute;
    var displayValue = this.formatDateTimeDisplay(dateTime);
    
    this.setData({
      'snowtam.dateTime': dateTime,
      'snowtam.dateTimeDisplay': displayValue
    });
    this.updatePreviewCode();
  },

  // 日期时间数字输入
  inputDateTimeNumber: function(event) {
    var number = event.currentTarget.dataset.value;
    var currentValue = this.data.snowtam.dateTime || '';
    
    // 限制长度（MMDDHHMM 8位）
    if (currentValue.length >= 8) {
      return;
    }
    
    var newValue = currentValue + number;
    var displayValue = this.formatDateTimeDisplay(newValue);
    
    this.setData({
      'snowtam.dateTime': newValue,
      'snowtam.dateTimeDisplay': displayValue
    });
    this.updatePreviewCode();
  },

  // 格式化日期时间显示
  formatDateTimeDisplay: function(value) {
    if (!value) return '';
    var formatted = value;
    if (value.length >= 2) {
      formatted = value.substring(0, 2) + '月';
      if (value.length >= 4) {
        formatted += value.substring(2, 4) + '日';
        if (value.length >= 6) {
          formatted += value.substring(4, 6) + ':';
          if (value.length >= 8) {
            formatted += value.substring(6, 8);
          }
        }
      }
    }
    return formatted;
  },

  // 清除日期时间
  clearDateTimeInput: function() {
    this.setData({
      'snowtam.dateTime': '',
      'snowtam.dateTimeDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 删除日期时间字符
  deleteDateTimeChar: function() {
    var currentValue = this.data.snowtam.dateTime || '';
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      var displayValue = this.formatDateTimeDisplay(newValue);
      this.setData({
        'snowtam.dateTime': newValue,
        'snowtam.dateTimeDisplay': displayValue
      });
    }
    this.updatePreviewCode();
  },

  // 日期时间输入框变化
  onDateTimeInput: function(event) {
    var value = event.detail.value;
    // 只允许数字
    value = value.replace(/[^0-9]/g, '');
    // 限制8位
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    
    var displayValue = this.formatDateTimeDisplay(value);
    
    this.setData({
      'snowtam.dateTime': value,
      'snowtam.dateTimeDisplay': displayValue
    });
    this.updatePreviewCode();
  },

  // 跑道数字输入
  inputRunwayNumber: function(event) {
    var number = event.currentTarget.dataset.value;
    var currentValue = this.data.snowtam.runway || '';
    
    // 限制长度（跑道最多3位）
    if (currentValue.length >= 3) {
      return;
    }
    
    var newValue = currentValue + number;
    this.setData({
      'snowtam.runway': newValue,
      'snowtam.runwayDisplay': newValue
    });
    this.updatePreviewCode();
  },

  // 跑道选项选择
  selectRunwayOption: function(event) {
    var option = event.currentTarget.dataset.value;
    var currentValue = this.data.snowtam.runway || '';
    
    if (option === '99' || option === '88') {
      // 特殊代码，直接替换
      this.setData({
        'snowtam.runway': option,
        'snowtam.runwayDisplay': option + (option === '99' ? ' - 所有跑道' : ' - 重复报告')
      });
    } else if (option === 'L' || option === 'R' || option === 'C') {
      // 字母后缀，添加到现有数字后
      if (currentValue && currentValue !== '99' && currentValue !== '88') {
        // 移除已有的字母后缀
        var numberPart = currentValue.replace(/[LRC]$/, '');
        var newValue = numberPart + option;
        this.setData({
          'snowtam.runway': newValue,
          'snowtam.runwayDisplay': newValue
        });
      }
    }
    this.updatePreviewCode();
  },

  // 清除跑道输入
  clearRunwayInput: function() {
    this.setData({
      'snowtam.runway': '',
      'snowtam.runwayDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 删除跑道字符
  deleteRunwayChar: function() {
    var currentValue = this.data.snowtam.runway || '';
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      this.setData({
        'snowtam.runway': newValue,
        'snowtam.runwayDisplay': newValue
      });
    }
    this.updatePreviewCode();
  },

  // 跑道输入框变化
  onRunwayInput: function(event) {
    var value = event.detail.value.toUpperCase();
    // 限制格式：数字+可选字母
    value = value.replace(/[^0-9LRC]/g, '');
    
    this.setData({
      'snowtam.runway': value,
      'snowtam.runwayDisplay': value
    });
    this.updatePreviewCode();
  },

  // 清洁区域输入
  inputClearedNumber: function(event) {
    var number = event.currentTarget.dataset.value;
    var currentValue = this.data.snowtam.clearedRunway || '';
    
    // 限制长度（7位数字）
    if (currentValue.length >= 7) {
      return;
    }
    
    var newValue = currentValue + number;
    var displayValue = this.formatClearedDisplay(newValue);
    
    this.setData({
      'snowtam.clearedRunway': newValue,
      'snowtam.clearedRunwayDisplay': displayValue
    });
    this.updatePreviewCode();
  },

  // 格式化清洁区域显示
  formatClearedDisplay: function(value) {
    if (!value) return '';
    if (value === 'NIL') return 'NIL - 无清洁区域';
    if (value.length >= 7) {
      var length = value.substring(0, 4);
      var width = value.substring(4, 7);
      return '长' + length + '米 × 宽' + width + '米';
    }
    return value;
  },

  // 设置NIL清洁区域
  setClearedNIL: function() {
    this.setData({
      'snowtam.clearedRunway': 'NIL',
      'snowtam.clearedRunwayDisplay': 'NIL - 无清洁区域'
    });
    this.updatePreviewCode();
  },

  // 清除清洁区域输入
  clearClearedInput: function() {
    this.setData({
      'snowtam.clearedRunway': '',
      'snowtam.clearedRunwayDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 删除清洁区域字符
  deleteClearedChar: function() {
    var currentValue = this.data.snowtam.clearedRunway || '';
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      var displayValue = this.formatClearedDisplay(newValue);
      this.setData({
        'snowtam.clearedRunway': newValue,
        'snowtam.clearedRunwayDisplay': displayValue
      });
    }
    this.updatePreviewCode();
  },

  // 跑道状况代码选择
  selectRWYCC: function(event) {
    var code = event.currentTarget.dataset.code;
    var segment = parseInt(event.currentTarget.dataset.segment);
    
    var rwycc = this.data.snowtam.runwayConditionCode.slice(); // 复制数组
    rwycc[segment] = code;
    
    this.setData({
      'snowtam.runwayConditionCode': rwycc
    });
    this.updateRWYCCDisplay();
    this.updatePreviewCode();
  },

  // 更新跑道状况代码显示
  updateRWYCCDisplay: function() {
    var rwycc = this.data.snowtam.runwayConditionCode;
    var display = '接地段:' + this.getRWYCCName(rwycc[0]) + 
                  ' 中间段:' + this.getRWYCCName(rwycc[1]) + 
                  ' 跑道末段:' + this.getRWYCCName(rwycc[2]);
    
    this.setData({
      'snowtam.runwayConditionCodeDisplay': display
    });
  },

  // 获取跑道状况代码名称
  getRWYCCName: function(code) {
    if (!snowtamData || !snowtamData.fields || !snowtamData.fields.runway_condition_code || !snowtamData.fields.runway_condition_code.codes) {
      return '未知';
    }
    var codes = snowtamData.fields.runway_condition_code.codes;
    return codes[code] || '未选择';
  },

  // 选择跑道状况代码分段
  selectRWYCCSegment: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    this.setData({
      currentRWYCCSegment: segment
    });
  },

  // 清除跑道状况代码输入
  clearRWYCCInput: function() {
    this.setData({
      'snowtam.runwayConditionCode': ['', '', ''],
      'snowtam.runwayConditionCodeDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 清除单个RWYCC分段
  clearRWYCCSegment: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    var rwycc = this.data.snowtam.runwayConditionCode.slice(); // 复制数组
    rwycc[segment] = '';
    
    this.setData({
      'snowtam.runwayConditionCode': rwycc
    });
    this.updateRWYCCDisplay();
    this.updatePreviewCode();
  },

  // 设置RWYCC快捷示例
  setRWYCCExample: function(event) {
    var example = event.currentTarget.dataset.example;
    var codes = example.split(',');
    
    this.setData({
      'snowtam.runwayConditionCode': codes
    });
    this.updateRWYCCDisplay();
    this.updatePreviewCode();
    
    wx.showToast({
      title: '已设置RWYCC组合',
      icon: 'success',
      duration: 1500
    });
  },

  // 深度输入
  inputDepthNumber: function(event) {
    var number = event.currentTarget.dataset.value;
    var segment = parseInt(event.currentTarget.dataset.segment);
    
    var depth = this.data.snowtam.depth.slice(); // 复制数组
    var currentValue = depth[segment] || '';
    
    // 限制长度（深度最多2位）
    if (currentValue.length >= 2) {
      return;
    }
    
    var newValue = currentValue + number;
    depth[segment] = newValue;
    
    this.setData({
      'snowtam.depth': depth
    });
    this.updateDepthDisplay();
    this.updatePreviewCode();
  },

  // 深度特殊选项
  selectDepthOption: function(event) {
    var value = event.currentTarget.dataset.value;
    var segment = parseInt(event.currentTarget.dataset.segment);
    
    var depth = this.data.snowtam.depth.slice(); // 复制数组
    depth[segment] = value;
    
    this.setData({
      'snowtam.depth': depth
    });
    this.updateDepthDisplay();
    this.updatePreviewCode();
  },

  // 选择深度分段
  selectDepthSegment: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    this.setData({
      currentDepthSegment: segment
    });
  },

  // 更新深度显示
  updateDepthDisplay: function() {
    var depth = this.data.snowtam.depth;
    var display = '接地段:' + this.formatDepthValue(depth[0]) + 
                  ' 中间段:' + this.formatDepthValue(depth[1]) + 
                  ' 跑道末段:' + this.formatDepthValue(depth[2]);
    
    this.setData({
      'snowtam.depthDisplay': display
    });
  },

  // 格式化深度值
  formatDepthValue: function(value) {
    if (!value) return '未设置';
    if (value === '//') return '无法测量';
    if (value === '99') return '40mm以上';
    var numValue = parseInt(value);
    if (numValue >= 92 && numValue <= 98) {
      return ((numValue - 90) * 5) + 'cm';
    }
    return value + 'mm';
  },

  // 清除深度输入
  clearDepthInput: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    var depth = this.data.snowtam.depth.slice(); // 复制数组
    depth[segment] = '';
    
    this.setData({
      'snowtam.depth': depth
    });
    this.updateDepthDisplay();
    this.updatePreviewCode();
  },

  // 删除深度字符
  deleteDepthChar: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    var depth = this.data.snowtam.depth.slice(); // 复制数组
    var currentValue = depth[segment] || '';
    
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      depth[segment] = newValue;
      
      this.setData({
        'snowtam.depth': depth
      });
      this.updateDepthDisplay();
      this.updatePreviewCode();
    }
  },

  // 摩擦系数输入
  inputFrictionNumber: function(event) {
    var number = event.currentTarget.dataset.value;
    var segment = parseInt(event.currentTarget.dataset.segment);
    
    var friction = this.data.snowtam.frictionBraking.slice(); // 复制数组
    var currentValue = friction[segment] || '';
    
    // 限制长度（摩擦系数最多2位）
    if (currentValue.length >= 2) {
      return;
    }
    
    var newValue = currentValue + number;
    friction[segment] = newValue;
    
    this.setData({
      'snowtam.frictionBraking': friction
    });
    this.updateFrictionDisplay();
    this.updatePreviewCode();
  },

  // 摩擦系数选项选择
  selectFrictionOption: function(event) {
    var code = event.currentTarget.dataset.code;
    var segment = parseInt(event.currentTarget.dataset.segment);
    
    var friction = this.data.snowtam.frictionBraking.slice(); // 复制数组
    friction[segment] = code;
    
    this.setData({
      'snowtam.frictionBraking': friction
    });
    this.updateFrictionDisplay();
    this.updatePreviewCode();
  },

  // 选择摩擦系数分段
  selectFrictionSegment: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    this.setData({
      currentFrictionSegment: segment
    });
  },

  // 更新摩擦系数显示
  updateFrictionDisplay: function() {
    var friction = this.data.snowtam.frictionBraking;
    var display = '接地段:' + this.formatFrictionValue(friction[0]) + 
                  ' 中间段:' + this.formatFrictionValue(friction[1]) + 
                  ' 跑道末段:' + this.formatFrictionValue(friction[2]);
    
    this.setData({
      'snowtam.frictionBrakingDisplay': display
    });
  },

  // 格式化摩擦系数值
  formatFrictionValue: function(value) {
    if (!value) return '未设置';
    if (value === '//') return '未报告';
    if (value === '99') return '不可靠';
    var numValue = parseInt(value);
    if (numValue >= 91 && numValue <= 95) {
      var actions = { '91': '差', '92': '中等/差', '93': '中等', '94': '中等/好', '95': '好' };
      return actions[value] || value;
    }
    if (numValue >= 0 && numValue <= 90) {
      return '摩擦系数' + (numValue / 100).toFixed(2);
    }
    return value;
  },

  // 清除摩擦系数输入
  clearFrictionInput: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    var friction = this.data.snowtam.frictionBraking.slice(); // 复制数组
    friction[segment] = '';
    
    this.setData({
      'snowtam.frictionBraking': friction
    });
    this.updateFrictionDisplay();
    this.updatePreviewCode();
  },

  // 删除摩擦系数字符
  deleteFrictionChar: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    var friction = this.data.snowtam.frictionBraking.slice(); // 复制数组
    var currentValue = friction[segment] || '';
    
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      friction[segment] = newValue;
      
      this.setData({
        'snowtam.frictionBraking': friction
      });
      this.updateFrictionDisplay();
      this.updatePreviewCode();
    }
  },

  // 雪堤输入
  inputSnowBankNumber: function(event) {
    var number = event.currentTarget.dataset.value;
    var side = event.currentTarget.dataset.side; // 'L' or 'R'
    var currentValue = this.data.snowtam.criticalSnowBanks || '';
    
    // 解析当前值
    var leftValue = '';
    var rightValue = '';
    
    if (currentValue && currentValue !== 'NIL') {
      var match = currentValue.match(/L(\d{2})R(\d{2})/);
      if (match) {
        leftValue = match[1];
        rightValue = match[2];
      }
    }
    
    if (side === 'L') {
      if (leftValue.length < 2) {
        leftValue += number;
      }
    } else if (side === 'R') {
      if (rightValue.length < 2) {
        rightValue += number;
      }
    }
    
    // 确保都是两位数
    leftValue = leftValue.padStart(2, '0');
    rightValue = rightValue.padStart(2, '0');
    
    var newValue = 'L' + leftValue + 'R' + rightValue;
    var displayValue = '左侧' + leftValue + 'cm 右侧' + rightValue + 'cm';
    
    this.setData({
      'snowtam.criticalSnowBanks': newValue,
      'snowtam.criticalSnowBanksDisplay': displayValue
    });
    this.updatePreviewCode();
  },

  // 设置NIL雪堤
  setSnowBankNIL: function() {
    this.setData({
      'snowtam.criticalSnowBanks': 'NIL',
      'snowtam.criticalSnowBanksDisplay': 'NIL - 无关键雪堤'
    });
    this.updatePreviewCode();
  },

  // 清除雪堤输入
  clearSnowBankInput: function() {
    this.setData({
      'snowtam.criticalSnowBanks': '',
      'snowtam.criticalSnowBanksDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 跑道灯光选择
  selectLightingOption: function(event) {
    var option = event.currentTarget.dataset.value;
    var desc = event.currentTarget.dataset.desc;
    
    this.setData({
      'snowtam.runwayLighting': option,
      'snowtam.runwayLightingDisplay': option + ' - ' + desc
    });
    this.updatePreviewCode();
  },

  // 清除灯光选择
  clearLightingInput: function() {
    this.setData({
      'snowtam.runwayLighting': '',
      'snowtam.runwayLightingDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 获取当前选中的沉积物分段
  getCurrentDepositSegment: function() {
    return this.data.currentDepositSegment || 0;
  },

  // 获取当前选中的深度分段
  getCurrentDepthSegment: function() {
    return this.data.currentDepthSegment || 0;
  },

  // 获取当前选中的摩擦分段
  getCurrentFrictionSegment: function() {
    return this.data.currentFrictionSegment || 0;
  },

  // 生成SNOWTAM代码
  generateSnowtamCode: function() {
    try {
      var snowtam = this.data.snowtam;
      var code = '';
      
      // A) 机场代码
      code += 'A)' + (snowtam.locationIndicator || '____');
      
      // B) 日期时间
      code += ' B)' + (snowtam.dateTime || '________');
      
      // C) 跑道
      code += ' C)' + (snowtam.runway || '__');
      
      // D) 跑道状况代码(RWYCC)
      code += ' D)' + (snowtam.runwayConditionCode[0] || '_') + '/' + (snowtam.runwayConditionCode[1] || '_') + '/' + (snowtam.runwayConditionCode[2] || '_');
      
      // E) 污染物覆盖百分比
      code += ' E)' + (snowtam.contaminationCoverage[0] || '_') + '/' + (snowtam.contaminationCoverage[1] || '_') + '/' + (snowtam.contaminationCoverage[2] || '_');
      
      // F) 松散污染物深度
      code += ' F)' + (snowtam.looseContaminationDepth[0] || '__') + '/' + (snowtam.looseContaminationDepth[1] || '__') + '/' + (snowtam.looseContaminationDepth[2] || '__');
      
      // G) 污染物状况说明
      code += ' G)' + (snowtam.surfaceConditionDescription[0] || '__') + '/' + (snowtam.surfaceConditionDescription[1] || '__') + '/' + (snowtam.surfaceConditionDescription[2] || '__');
      
      // H) 跑道宽度
      code += ' H)' + (snowtam.runwayWidth || '__');
      
      // I) 跑道长度变短
      code += ' I)' + (snowtam.runwayLengthReduction || '__');
      
      // 解析生成的代码
      var result = this.parseSnowtam(code);
      this.setData({
        'snowtam.result': result,
        'snowtam.error': '',
        generatedCode: code
      });
      
      // 显示成功提示
      wx.showToast({
        title: 'SNOWTAM生成成功',
        icon: 'success',
        duration: 2000
      });
      
    } catch (error) {
      this.setData({
        'snowtam.error': '生成失败: ' + (error.message || '未知错误')
      });
    }
  },

  // 解析SNOWTAM代码
  parseSnowtam: function(code) {
    var sections = [];
    
    try {
      // 解析各个部分
      var parts = code.split(' ');
      
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (part.startsWith('A)')) {
          sections.push({
            label: 'A) 机场位置指示器',
            value: part.substring(2),
            description: '机场ICAO代码: ' + part.substring(2)
          });
        } else if (part.startsWith('B)')) {
          sections.push({
            label: 'B) 日期时间',
            value: part.substring(2),
            description: '观测时间: ' + this.formatDateTimeDisplay(part.substring(2))
          });
        } else if (part.startsWith('C)')) {
          sections.push({
            label: 'C) 跑道',
            value: part.substring(2),
            description: '跑道编号: ' + part.substring(2)
          });
        } else if (part.startsWith('D)')) {
          sections.push({
            label: 'D) 跑道状况代码(RWYCC)',
            value: part.substring(2),
            description: '跑道状况代码: ' + this.formatRWYCCDescription(part.substring(2))
          });
        } else if (part.startsWith('E)')) {
          sections.push({
            label: 'E) 污染物覆盖百分比',
            value: part.substring(2),
            description: '污染物覆盖率: ' + this.formatCoverageDescription(part.substring(2))
          });
        } else if (part.startsWith('F)')) {
          sections.push({
            label: 'F) 松散污染物深度',
            value: part.substring(2),
            description: '污染物深度: ' + this.formatDepthDescription(part.substring(2))
          });
        } else if (part.startsWith('G)')) {
          sections.push({
            label: 'G) 污染物状况说明',
            value: part.substring(2),
            description: '表面状况: ' + this.formatSurfaceDescription(part.substring(2))
          });
        } else if (part.startsWith('H)')) {
          sections.push({
            label: 'H) 跑道宽度',
            value: part.substring(2),
            description: '跑道适用宽度: ' + (part.substring(2) === '__' ? '全宽度' : part.substring(2) + '米')
          });
        } else if (part.startsWith('I)')) {
          sections.push({
            label: 'I) 跑道长度变短',
            value: part.substring(2),
            description: '长度限制: ' + (part.substring(2) === '__' ? '无变化' : part.substring(2))
          });
        }
      }
    } catch (error) {
      console.error('解析SNOWTAM失败:', error);
    }
    
    return { sections: sections };
  },

  // 填充示例代码
  fillExample: function(event) {
    var code = event.currentTarget.dataset.code;
    // 解析示例代码并填充到步骤中
    this.parseExampleToSteps(code);
  },

  // 解析示例代码到步骤
  parseExampleToSteps: function(code) {
    try {
      var parts = code.split(' ');
      var deposits = ['', '', ''];
      var depth = ['', '', ''];
      var friction = ['', '', ''];
      
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        
        if (part.startsWith('A)')) {
          this.setData({
            'snowtam.locationIndicator': part.substring(2),
            'snowtam.locationIndicatorDisplay': part.substring(2)
          });
        } else if (part.startsWith('B)')) {
          var dateTime = part.substring(2);
          this.setData({
            'snowtam.dateTime': dateTime,
            'snowtam.dateTimeDisplay': this.formatDateTimeDisplay(dateTime)
          });
        } else if (part.startsWith('C)')) {
          this.setData({
            'snowtam.runway': part.substring(2),
            'snowtam.runwayDisplay': part.substring(2)
          });
        } else if (part.startsWith('D)')) {
          var cleared = part.substring(2);
          this.setData({
            'snowtam.clearedRunway': cleared,
            'snowtam.clearedRunwayDisplay': this.formatClearedDisplay(cleared)
          });
        } else if (part.startsWith('E)')) {
          var depositParts = part.substring(2).split('/');
          if (depositParts.length === 3) {
            deposits = depositParts;
            this.setData({
              'snowtam.deposits': deposits
            });
            this.updateDepositsDisplay();
          }
        } else if (part.startsWith('F)')) {
          var depthParts = part.substring(2).split('/');
          if (depthParts.length === 3) {
            depth = depthParts;
            this.setData({
              'snowtam.depth': depth
            });
            this.updateDepthDisplay();
          }
        } else if (part.startsWith('G)')) {
          var frictionParts = part.substring(2).split('/');
          if (frictionParts.length === 3) {
            friction = frictionParts;
            this.setData({
              'snowtam.frictionBraking': friction
            });
            this.updateFrictionDisplay();
          }
        } else if (part.startsWith('H)')) {
          var snowBanks = part.substring(2);
          this.setData({
            'snowtam.criticalSnowBanks': snowBanks,
            'snowtam.criticalSnowBanksDisplay': snowBanks === 'NIL' ? 'NIL - 无关键雪堤' : this.formatSnowBankDisplay(snowBanks)
          });
        } else if (part.startsWith('I)')) {
          var lighting = part.substring(2);
          this.setData({
            'snowtam.runwayLighting': lighting,
            'snowtam.runwayLightingDisplay': lighting + ' - ' + this.getLightingDescription(lighting)
          });
        }
      }
      
      this.setData({
        currentStep: 10
      });
      this.generateSnowtamCode();
      
    } catch (error) {
      console.error('解析示例失败:', error);
      wx.showToast({
        title: '示例解析失败',
        icon: 'none'
      });
    }
  },

  // 格式化雪堤显示
  formatSnowBankDisplay: function(value) {
    if (value === 'NIL') return 'NIL - 无关键雪堤';
    var match = value.match(/L(\d{2})R(\d{2})/);
    if (match) {
      return '左侧' + match[1] + 'cm 右侧' + match[2] + 'cm';
    }
    return value;
  },

  // 获取灯光描述
  getLightingDescription: function(code) {
    var descriptions = {
      'YES': '全部灯光正常',
      'NO': '灯光系统故障',
      'POOR': '灯光可见度差',
      'NIL': '无信息'
    };
    return descriptions[code] || '未知状态';
  },


  // 折叠面板事件处理
  onCollapseChange: function(event) {
    this.setData({
      activeCollapseItems: event.detail
    });
  },

  // RWYCC相关函数
  
  // 选择RWYCC分段
  selectRWYCCSegment: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    this.setData({
      currentRWYCCSegment: segment
    });
  },

  // 选择RWYCC代码
  selectRWYCC: function(event) {
    var code = event.currentTarget.dataset.code;
    var segment = parseInt(event.currentTarget.dataset.segment);
    var rwycc = this.data.snowtam.runwayConditionCode.slice(); // 复制数组
    rwycc[segment] = code;
    
    this.setData({
      'snowtam.runwayConditionCode': rwycc
    });
    this.updateRWYCCDisplay();
    this.updatePreviewCode();
    
    // 自动跳转到下一个分段
    if (segment < 2) {
      this.setData({
        currentRWYCCSegment: segment + 1
      });
    }
  },

  // 设置RWYCC示例
  setRWYCCExample: function(event) {
    var example = event.currentTarget.dataset.example;
    var codes = example.split(',');
    if (codes.length === 3) {
      this.setData({
        'snowtam.runwayConditionCode': codes
      });
      this.updateRWYCCDisplay();
      this.updatePreviewCode();
    }
  },

  // 更新RWYCC显示
  updateRWYCCDisplay: function() {
    var rwycc = this.data.snowtam.runwayConditionCode;
    var display = (rwycc[0] || '_') + '/' + (rwycc[1] || '_') + '/' + (rwycc[2] || '_');
    
    this.setData({
      'snowtam.runwayConditionCodeDisplay': display
    });
  },

  // 第5步：污染物覆盖百分比相关函数
  
  // 选择覆盖率分段
  selectCoverageSegment: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    this.setData({
      currentCoverageSegment: segment
    });
  },

  // 选择覆盖率
  selectCoverage: function(event) {
    var coverage = event.currentTarget.dataset.coverage;
    var segment = parseInt(event.currentTarget.dataset.segment);
    var coverageArray = this.data.snowtam.contaminationCoverage.slice(); // 复制数组
    coverageArray[segment] = coverage;
    
    this.setData({
      'snowtam.contaminationCoverage': coverageArray
    });
    this.updateCoverageDisplay();
    this.updatePreviewCode();
    
    // 自动跳转到下一个分段
    if (segment < 2) {
      this.setData({
        currentCoverageSegment: segment + 1
      });
    }
  },

  // 设置覆盖率示例
  setCoverageExample: function(event) {
    var example = event.currentTarget.dataset.example;
    var coverages = example.split(',');
    if (coverages.length === 3) {
      this.setData({
        'snowtam.contaminationCoverage': coverages
      });
      this.updateCoverageDisplay();
      this.updatePreviewCode();
    }
  },

  // 更新覆盖率显示
  updateCoverageDisplay: function() {
    var coverage = this.data.snowtam.contaminationCoverage;
    var display = (coverage[0] || '_') + '/' + (coverage[1] || '_') + '/' + (coverage[2] || '_');
    
    this.setData({
      'snowtam.contaminationCoverageDisplay': display
    });
  },

  // 第6步：松散污染物深度相关函数
  
  // 选择深度分段
  selectDepthSegment: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    this.setData({
      currentDepthSegment: segment
    });
  },

  // 输入深度数字
  inputDepthNumber: function(event) {
    var number = event.currentTarget.dataset.value;
    var segment = parseInt(event.currentTarget.dataset.segment);
    var depth = this.data.snowtam.looseContaminationDepth.slice(); // 复制数组
    var currentValue = depth[segment] || '';
    
    // 限制长度为2位数字
    if (currentValue.length >= 2) {
      return;
    }
    
    var newValue = currentValue + number;
    depth[segment] = newValue;
    
    this.setData({
      'snowtam.looseContaminationDepth': depth
    });
    this.updateDepthDisplay();
    this.updatePreviewCode();
    
    // 如果输入了2位数字，自动跳转到下一个分段
    if (newValue.length === 2 && segment < 2) {
      this.setData({
        currentDepthSegment: segment + 1
      });
    }
  },

  // 选择深度选项
  selectDepthOption: function(event) {
    var value = event.currentTarget.dataset.value;
    var segment = parseInt(event.currentTarget.dataset.segment);
    var depth = this.data.snowtam.looseContaminationDepth.slice(); // 复制数组
    depth[segment] = value;
    
    this.setData({
      'snowtam.looseContaminationDepth': depth
    });
    this.updateDepthDisplay();
    this.updatePreviewCode();
    
    // 自动跳转到下一个分段
    if (segment < 2) {
      this.setData({
        currentDepthSegment: segment + 1
      });
    }
  },

  // 清除深度输入
  clearDepthInput: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    var depth = this.data.snowtam.looseContaminationDepth.slice(); // 复制数组
    depth[segment] = '';
    
    this.setData({
      'snowtam.looseContaminationDepth': depth
    });
    this.updateDepthDisplay();
    this.updatePreviewCode();
  },

  // 删除深度字符
  deleteDepthChar: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    var depth = this.data.snowtam.looseContaminationDepth.slice(); // 复制数组
    var currentValue = depth[segment] || '';
    
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      depth[segment] = newValue;
      
      this.setData({
        'snowtam.looseContaminationDepth': depth
      });
      this.updateDepthDisplay();
      this.updatePreviewCode();
    }
  },

  // 设置深度示例
  setDepthExample: function(event) {
    var example = event.currentTarget.dataset.example;
    var depths = example.split(',');
    if (depths.length === 3) {
      this.setData({
        'snowtam.looseContaminationDepth': depths
      });
      this.updateDepthDisplay();
      this.updatePreviewCode();
    }
  },

  // 更新深度显示
  updateDepthDisplay: function() {
    var depth = this.data.snowtam.looseContaminationDepth;
    var display = (depth[0] || '_') + '/' + (depth[1] || '_') + '/' + (depth[2] || '_');
    
    this.setData({
      'snowtam.looseContaminationDepthDisplay': display
    });
  },

  // 第7步：污染物状况说明相关函数
  
  // 选择状况说明分段
  selectDescriptionSegment: function(event) {
    var segment = parseInt(event.currentTarget.dataset.segment);
    this.setData({
      currentDescriptionSegment: segment
    });
  },

  // 选择表面状况
  selectSurfaceCondition: function(event) {
    var condition = event.currentTarget.dataset.condition;
    var segment = parseInt(event.currentTarget.dataset.segment);
    var descriptions = this.data.snowtam.surfaceConditionDescription.slice(); // 复制数组
    descriptions[segment] = condition;
    
    this.setData({
      'snowtam.surfaceConditionDescription': descriptions
    });
    this.updateSurfaceConditionDisplay();
    this.updatePreviewCode();
    
    // 自动跳转到下一个分段
    if (segment < 2) {
      this.setData({
        currentDescriptionSegment: segment + 1
      });
    }
  },

  // 设置表面状况示例
  setSurfaceConditionExample: function(event) {
    var example = event.currentTarget.dataset.example;
    var conditions = example.split(',');
    if (conditions.length === 3) {
      this.setData({
        'snowtam.surfaceConditionDescription': conditions
      });
      this.updateSurfaceConditionDisplay();
      this.updatePreviewCode();
    }
  },

  // 更新表面状况显示
  updateSurfaceConditionDisplay: function() {
    var descriptions = this.data.snowtam.surfaceConditionDescription;
    var display = (descriptions[0] || '_') + '/' + (descriptions[1] || '_') + '/' + (descriptions[2] || '_');
    
    this.setData({
      'snowtam.surfaceConditionDescriptionDisplay': display
    });
  },

  // 第8步：跑道宽度相关函数
  
  // 设置跑道宽度
  setRunwayWidth: function(event) {
    var width = event.currentTarget.dataset.width;
    this.setData({
      'snowtam.runwayWidth': width,
      'snowtam.runwayWidthDisplay': width ? width + '米' : ''
    });
    this.updatePreviewCode();
  },

  // 输入宽度数字
  inputWidthNumber: function(event) {
    var number = event.currentTarget.dataset.value;
    var currentValue = this.data.snowtam.runwayWidth || '';
    
    // 限制长度为2位数字
    if (currentValue.length >= 2) {
      return;
    }
    
    var newValue = currentValue + number;
    this.setData({
      'snowtam.runwayWidth': newValue,
      'snowtam.runwayWidthDisplay': newValue + '米'
    });
    this.updatePreviewCode();
  },

  // 清除宽度输入
  clearWidthInput: function() {
    this.setData({
      'snowtam.runwayWidth': '',
      'snowtam.runwayWidthDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 删除宽度字符
  deleteWidthChar: function() {
    var currentValue = this.data.snowtam.runwayWidth || '';
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      this.setData({
        'snowtam.runwayWidth': newValue,
        'snowtam.runwayWidthDisplay': newValue ? newValue + '米' : ''
      });
      this.updatePreviewCode();
    }
  },

  // 第9步：跑道长度变短相关函数
  
  // 设置跑道长度变短
  setRunwayLengthReduction: function(event) {
    var reduction = event.currentTarget.dataset.reduction;
    this.setData({
      'snowtam.runwayLengthReduction': reduction,
      'snowtam.runwayLengthReductionDisplay': reduction
    });
    this.updatePreviewCode();
  },

  // 手动输入跑道号
  onRunwayNumberInput: function(event) {
    this.setData({
      tempRunwayNumber: event.detail.value
    });
  },

  // 手动输入跑道长度
  onRunwayLengthInput: function(event) {
    this.setData({
      tempRunwayLength: event.detail.value
    });
  },

  // 确认跑道长度变短设置
  confirmRunwayLengthReduction: function() {
    var runwayNumber = this.data.tempRunwayNumber;
    var runwayLength = this.data.tempRunwayLength;
    
    if (runwayNumber && runwayLength) {
      var reduction = runwayNumber + ' 变短至' + runwayLength;
      this.setData({
        'snowtam.runwayLengthReduction': reduction,
        'snowtam.runwayLengthReductionDisplay': reduction,
        tempRunwayNumber: '',
        tempRunwayLength: ''
      });
      this.updatePreviewCode();
    } else {
      wx.showToast({
        title: '请输入完整的跑道号和长度',
        icon: 'none'
      });
    }
  },

  // 清除跑道长度变短
  clearRunwayLengthReduction: function() {
    this.setData({
      'snowtam.runwayLengthReduction': '',
      'snowtam.runwayLengthReductionDisplay': '',
      tempRunwayNumber: '',
      tempRunwayLength: ''
    });
    this.updatePreviewCode();
  },

  // 第10步：情景意识部分相关函数
  
  // 选择情景意识选项
  selectSituationalOption: function(event) {
    var field = event.currentTarget.dataset.field;
    var value = event.currentTarget.dataset.value;
    var updateData = {};
    updateData['snowtam.' + field] = value;
    
    this.setData(updateData);
    this.updatePreviewCode();
  },

  // 设置情景意识示例
  setSituationalAwarenessExample: function(event) {
    var example = event.currentTarget.dataset.example;
    
    if (example === 'empty') {
      // 全部留空
      this.setData({
        'snowtam.driftSnow': '',
        'snowtam.looseSand': '',
        'snowtam.chemicalTreatment': '',
        'snowtam.runwaySnowBanks': '',
        'snowtam.taxiwaySnowBanks': '',
        'snowtam.adjacentSnowBanks': '',
        'snowtam.taxiwayCondition': '',
        'snowtam.apronCondition': '',
        'snowtam.measuredFriction': '',
        'snowtam.plainLanguage': ''
      });
    } else if (example === 'basic') {
      // 基本雪情信息
      this.setData({
        'snowtam.driftSnow': '',
        'snowtam.looseSand': '',
        'snowtam.chemicalTreatment': '01L 有化学处理',
        'snowtam.runwaySnowBanks': '',
        'snowtam.taxiwaySnowBanks': '',
        'snowtam.adjacentSnowBanks': '',
        'snowtam.taxiwayCondition': '',
        'snowtam.apronCondition': '',
        'snowtam.measuredFriction': '',
        'snowtam.plainLanguage': '跑道接地段进行了除冰处理'
      });
    } else if (example === 'severe') {
      // 严重雪情警告
      this.setData({
        'snowtam.driftSnow': '01L 有吹积雪堆',
        'snowtam.looseSand': '',
        'snowtam.chemicalTreatment': '',
        'snowtam.runwaySnowBanks': '01L 两侧 25米距跑道中线',
        'snowtam.taxiwaySnowBanks': '',
        'snowtam.adjacentSnowBanks': '01L 附近有雪堤',
        'snowtam.taxiwayCondition': 'ALL TWYS 差',
        'snowtam.apronCondition': '',
        'snowtam.measuredFriction': '',
        'snowtam.plainLanguage': '跑道及周边积雪严重，建议谨慎运行'
      });
    }
    
    this.updatePreviewCode();
  },

  // 格式化RWYCC描述
  formatRWYCCDescription: function(value) {
    if (!value || value === '_/_/_') return '未设置';
    var parts = value.split('/');
    var descriptions = [];
    var names = {
      '0': '湿冰/压实雪上有水',
      '1': '冰',
      '2': '积水>3mm/雪浆>3mm',
      '3': '湿滑/干雪>3mm',
      '4': '压实雪(≤-15°C)',
      '5': '霜/湿/雪浆≤3mm',
      '6': '干'
    };
    
    for (var i = 0; i < parts.length; i++) {
      descriptions.push(names[parts[i]] || parts[i]);
    }
    return descriptions.join(' / ');
  },

  // 格式化覆盖率描述
  formatCoverageDescription: function(value) {
    if (!value || value === '_/_/_') return '未设置';
    var parts = value.split('/');
    var descriptions = [];
    
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (part === '无') {
        descriptions.push('干燥(<10%)');
      } else if (part === '25') {
        descriptions.push('10%-25%');
      } else if (part === '50') {
        descriptions.push('26%-50%');
      } else if (part === '75') {
        descriptions.push('51%-75%');
      } else if (part === '100') {
        descriptions.push('76%-100%');
      } else {
        descriptions.push(part);
      }
    }
    return descriptions.join(' / ');
  },

  // 格式化深度描述
  formatDepthDescription: function(value) {
    if (!value || value === '__/__/__') return '未设置';
    var parts = value.split('/');
    var descriptions = [];
    
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (part === '无') {
        descriptions.push('不适用');
      } else if (part && part !== '_' && part !== '__') {
        descriptions.push(part + 'mm');
      } else {
        descriptions.push('未设置');
      }
    }
    return descriptions.join(' / ');
  },

  // 格式化表面状况描述
  formatSurfaceDescription: function(value) {
    if (!value || value === '__/__/__') return '未设置';
    return value.replace(/\//g, ' / ');
  }
});