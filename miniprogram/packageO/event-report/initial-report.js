// 事件信息填报页面 - 分步引导填报系统
Page({
  data: {
    loading: false,
    
    // 当前步骤（0-4）
    currentStep: 0,
    
    // 步骤配置
    steps: [
      { title: '基本信息', subtitle: '填写航班基础信息', icon: '✈️', completed: false },
      { title: '事件概况', subtitle: '描述事件基本情况', icon: '📋', completed: false },
      { title: '详细经过', subtitle: '详述事件发生过程', icon: '📝', completed: false },
      { title: '相关因素', subtitle: '分析相关影响因素', icon: '🔍', completed: false },
      { title: '确认提交', subtitle: '检查并生成报告', icon: '✅', completed: false }
    ],
    
    // 个人信息（从存储加载）
    personalInfo: {
      department: '',
      name: '',
      license: ''
    },
    
    // 报告数据
    reportData: {
      // 第一步：基本信息
      basicInfo: {
        eventDate: '',
        flightNumber: '',
        aircraftType: '',
        aircraftReg: '',
        route: {
          departure: '',
          arrival: ''
        },
        times: {
          takeoff: '',
          landing: '',
          event: ''
        },
        crew: {
          captain: '',
          firstOfficer: '',
          observer: ''
        }
      },
      
      // 第二步：事件概况
      eventOverview: {
        location: '',
        phase: '',
        weather: '',
        briefDescription: ''
      },
      
      // 第三步：详细经过
      eventDetails: {
        beforeEvent: '',
        eventProcess: '',
        crewActions: '',
        eventResult: '',
        keyData: ''
      },
      
      // 第四步：相关因素
      relatedFactors: {
        personnelFactor: '',
        equipmentFactor: '',
        weatherFactor: '',
        otherFactors: ''
      }
    },
    
    // 快捷输入选项
    quickInputs: {
      aircraftTypes: ['A320', 'A321', 'A330', 'A350', 'B737', 'B747', 'B777', 'B787'],
      flightPhases: ['滑行阶段', '起飞阶段', '爬升阶段', '巡航阶段', '下降阶段', '进近阶段', '着陆阶段'],
      weatherConditions: ['VMC', 'IMC', '晴朗', '多云', '小雨', '中雨', '大雨', '雾', '雪'],
      eventTypes: [
        { title: 'TCAS RA警告', template: 'TCAS系统触发RA(Resolution Advisory)，指令为"CLIMB, CLIMB"' },
        { title: '发动机喘振', template: '发动机出现喘振现象，EGT温度异常升高' },
        { title: '液压系统故障', template: '液压系统出现故障指示，压力下降' },
        { title: '通信故障', template: '无线电通信设备出现故障，无法正常通信' }
      ]
    },
    
    // 显示控制
    showQuickInput: false,
    quickInputType: '',
    showDatePicker: false,
    showTimePicker: false,
    selectedDate: 0,
    selectedTime: 0,
    minDate: 0,
    maxDate: 0,
    
    // 生成的报告内容
    generatedReport: '',
    showReportModal: false
  },

  onLoad: function() {
    this.loadPersonalInfo();
    this.initDatePickerRange();
    this.initCurrentDateTime();
  },

  // 加载个人信息
  loadPersonalInfo: function() {
    try {
      var storedInfo = wx.getStorageSync('event_report_personal_info') || {};
      this.setData({
        'personalInfo.department': storedInfo.department || '',
        'personalInfo.name': storedInfo.name || '',
        'personalInfo.license': storedInfo.license || ''
      });
    } catch (error) {
      console.error('加载个人信息失败:', error);
    }
  },

  // 初始化日期选择器范围
  initDatePickerRange: function() {
    var now = new Date();
    var currentYear = now.getFullYear();
    
    var minDate = new Date();
    minDate.setFullYear(currentYear - 1);
    minDate.setMonth(0);
    minDate.setDate(1);
    
    var maxDate = new Date();
    maxDate.setFullYear(currentYear + 1);
    maxDate.setMonth(11);
    maxDate.setDate(31);
    
    this.setData({
      minDate: minDate.getTime(),
      maxDate: maxDate.getTime()
    });
  },

  // 初始化当前日期时间
  initCurrentDateTime: function() {
    var now = new Date();
    var dateStr = this.formatDate(now);
    var timeStr = this.formatTime(now);
    
    this.setData({
      'reportData.basicInfo.eventDate': dateStr,
      'reportData.basicInfo.times.event': timeStr
    });
  },

  // 格式化日期
  formatDate: function(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();
    
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    return year + '年' + month + '月' + day + '日';
  },

  // 格式化时间
  formatTime: function(date) {
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;
    
    return hours + ':' + minutes;
  },

  // 步骤导航
  nextStep: function() {
    if (this.validateCurrentStep()) {
      var currentStep = this.data.currentStep;
      if (currentStep < 4) {
        var steps = this.data.steps;
        steps[currentStep].completed = true;
        
        this.setData({
          currentStep: currentStep + 1,
          steps: steps
        });
      }
    }
  },

  prevStep: function() {
    var currentStep = this.data.currentStep;
    if (currentStep > 0) {
      this.setData({
        currentStep: currentStep - 1
      });
    }
  },

  // 跳转到指定步骤
  goToStep: function(e) {
    var step = parseInt(e.currentTarget.dataset.step);
    if (step <= this.data.currentStep || this.data.steps[step - 1].completed) {
      this.setData({
        currentStep: step
      });
    }
  },

  // 验证当前步骤
  validateCurrentStep: function() {
    var currentStep = this.data.currentStep;
    var reportData = this.data.reportData;
    
    switch (currentStep) {
      case 0: // 基本信息
        if (!reportData.basicInfo.flightNumber) {
          this.showToast('请填写航班号');
          return false;
        }
        if (!reportData.basicInfo.aircraftType) {
          this.showToast('请填写机型');
          return false;
        }
        if (!reportData.basicInfo.aircraftReg) {
          this.showToast('请填写机号');
          return false;
        }
        break;
        
      case 1: // 事件概况
        if (!reportData.eventOverview.location) {
          this.showToast('请填写事发位置');
          return false;
        }
        if (!reportData.eventOverview.phase) {
          this.showToast('请填写飞行阶段');
          return false;
        }
        if (!reportData.eventOverview.briefDescription) {
          this.showToast('请填写事件简述');
          return false;
        }
        break;
        
      case 2: // 详细经过
        if (!reportData.eventDetails.eventProcess) {
          this.showToast('请填写事件过程');
          return false;
        }
        if (!reportData.eventDetails.crewActions) {
          this.showToast('请填写机组处置');
          return false;
        }
        break;
        
      case 3: // 相关因素
        // 至少填写一个因素
        if (!reportData.relatedFactors.personnelFactor && 
            !reportData.relatedFactors.equipmentFactor && 
            !reportData.relatedFactors.weatherFactor && 
            !reportData.relatedFactors.otherFactors) {
          this.showToast('请至少填写一个相关因素');
          return false;
        }
        break;
    }
    
    return true;
  },

  // 显示提示
  showToast: function(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // 输入处理
  onFieldInput: function(e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value || '';
    var updateData = {};
    updateData[field] = value;
    this.setData(updateData);
  },

  // 快捷输入
  showQuickInputModal: function(e) {
    var type = e.currentTarget.dataset.type;
    this.setData({
      quickInputType: type,
      showQuickInput: true
    });
  },

  selectQuickInput: function(e) {
    var value = e.currentTarget.dataset.value;
    var field = e.currentTarget.dataset.field;
    var template = e.currentTarget.dataset.template;
    
    var updateData = {};
    updateData[field] = template || value;
    
    this.setData(updateData);
    this.closeQuickInput();
  },

  closeQuickInput: function() {
    this.setData({
      showQuickInput: false
    });
  },

  // 生成报告
  generateReport: function() {
    if (!this.validateAllSteps()) {
      return;
    }
    
    var report = this.buildReportContent();
    this.setData({
      generatedReport: report,
      showReportModal: true
    });
  },

  // 验证所有步骤
  validateAllSteps: function() {
    for (var i = 0; i < 4; i++) {
      var originalStep = this.data.currentStep;
      this.setData({ currentStep: i });
      
      if (!this.validateCurrentStep()) {
        this.setData({ currentStep: originalStep });
        return false;
      }
    }
    return true;
  },

  // 构建报告内容
  buildReportContent: function() {
    var data = this.data.reportData;
    var personal = this.data.personalInfo;
    
    var content = '事件信息报告\n\n';
    
    // 基本信息
    content += '【基本信息】\n';
    content += '报告人：' + personal.department + ' ' + personal.name + '\n';
    content += '事发日期：' + data.basicInfo.eventDate + '\n';
    content += '航班信息：' + data.basicInfo.aircraftType + '/' + data.basicInfo.aircraftReg + 
               '，执行' + data.basicInfo.flightNumber + '航班\n';
    
    if (data.basicInfo.route.departure && data.basicInfo.route.arrival) {
      content += '航线：' + data.basicInfo.route.departure + '-' + data.basicInfo.route.arrival + '\n';
    }
    
    // 机组信息
    if (data.basicInfo.crew.captain || data.basicInfo.crew.firstOfficer) {
      content += '机组成员：';
      if (data.basicInfo.crew.captain) content += '机长 ' + data.basicInfo.crew.captain;
      if (data.basicInfo.crew.firstOfficer) content += '，副驾驶 ' + data.basicInfo.crew.firstOfficer;
      if (data.basicInfo.crew.observer) content += '，观察员 ' + data.basicInfo.crew.observer;
      content += '\n';
    }
    
    content += '\n【事件概况】\n';
    content += '事发位置：' + data.eventOverview.location + '\n';
    content += '飞行阶段：' + data.eventOverview.phase + '\n';
    if (data.eventOverview.weather) content += '天气情况：' + data.eventOverview.weather + '\n';
    content += '事件简述：' + data.eventOverview.briefDescription + '\n';
    
    content += '\n【详细经过】\n';
    if (data.eventDetails.beforeEvent) content += '事发前状态：' + data.eventDetails.beforeEvent + '\n';
    content += '事件过程：' + data.eventDetails.eventProcess + '\n';
    content += '机组处置：' + data.eventDetails.crewActions + '\n';
    if (data.eventDetails.eventResult) content += '处置结果：' + data.eventDetails.eventResult + '\n';
    if (data.eventDetails.keyData) content += '关键数据：' + data.eventDetails.keyData + '\n';
    
    content += '\n【相关因素】\n';
    if (data.relatedFactors.personnelFactor) content += '人员因素：' + data.relatedFactors.personnelFactor + '\n';
    if (data.relatedFactors.equipmentFactor) content += '设备因素：' + data.relatedFactors.equipmentFactor + '\n';
    if (data.relatedFactors.weatherFactor) content += '天气因素：' + data.relatedFactors.weatherFactor + '\n';
    if (data.relatedFactors.otherFactors) content += '其他因素：' + data.relatedFactors.otherFactors + '\n';
    
    return content;
  },

  // 复制报告
  copyReport: function() {
    wx.setClipboardData({
      data: this.data.generatedReport,
      success: function() {
        wx.showToast({
          title: '内容已复制',
          icon: 'success'
        });
      }
    });
  },

  // 关闭报告弹窗
  closeReportModal: function() {
    this.setData({
      showReportModal: false
    });
  },

  // 保存草稿
  saveDraft: function() {
    try {
      wx.setStorageSync('event_report_draft', this.data.reportData);
      this.showToast('草稿已保存');
    } catch (error) {
      this.showToast('保存失败');
    }
  },

  // 加载草稿
  loadDraft: function() {
    try {
      var draft = wx.getStorageSync('event_report_draft');
      if (draft) {
        this.setData({
          reportData: draft
        });
        this.showToast('草稿已加载');
      } else {
        this.showToast('没有找到草稿');
      }
    } catch (error) {
      this.showToast('加载失败');
    }
  }
});