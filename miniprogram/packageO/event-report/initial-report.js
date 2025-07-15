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
        // 紧急事件模板
        { title: 'TCAS RA警告', template: 'TCAS系统触发RA(Resolution Advisory)，指令为"CLIMB, CLIMB"，机组按指令执行，解除后恢复正常飞行' },
        { title: '发动机失效', template: '发动机出现失效，EGT温度异常，发动机相关告警，机组执行相应程序，单发着陆' },
        { title: '发动机喘振', template: '发动机出现喘振现象，N1转速波动，EGT温度异常升高，机组减小推力，现象消失' },
        { title: '液压系统故障', template: '液压系统出现故障指示，压力下降至XX PSI，相关系统功能受限，机组按程序处置' },
        { title: '通信故障', template: '无线电通信设备出现故障，无法正常与塔台/管制通信，改用备用频率/应急频率联系' },
        
        // 飞行控制类
        { title: '自动驾驶断开', template: '自动驾驶系统意外断开，机组接管手动操纵，检查系统状态后重新接通' },
        { title: '飞控系统警告', template: '飞行控制系统出现警告信息，操纵感觉异常，机组按程序检查并继续安全飞行' },
        { title: '配平失效', template: '水平安定面配平系统失效，需要较大操纵力维持姿态，机组启用人工配平' },
        
        // 起落架系统
        { title: '起落架放不下', template: '起落架无法正常放下，指示灯显示异常，机组执行应急放下程序，最终成功放下' },
        { title: '起落架收不上', template: '起飞后起落架无法正常收回，指示灯异常，机组决定保持放下状态继续飞行' },
        { title: '轮胎爆胎', template: '着陆时轮胎爆胎，飞机偏离跑道中线，机组修正方向，安全停止在跑道上' },
        
        // 电气系统
        { title: '发电机失效', template: '发电机出现故障，相关总线失电，备用电源自动启动，机组按程序重新配置电源' },
        { title: '电瓶过热', template: '电瓶温度过高告警，机组按程序断开电瓶，使用其他电源维持必要用电设备' },
        
        // 增压空调系统
        { title: '座舱失压', template: '座舱高度警告响起，座舱高度异常升高，机组戴上氧气面罩，立即下降' },
        { title: '空调系统故障', template: '空调系统出现故障，座舱温度异常，机组关闭故障组件，调节备用系统' },
        { title: '引气系统故障', template: '引气系统出现泄漏，引气压力异常，相关系统功能受影响，机组按程序处置' },
        
        // 导航系统
        { title: 'GPS信号丢失', template: 'GPS导航信号丢失，机组切换至其他导航方式，与管制联系确认位置' },
        { title: 'ILS偏航', template: 'ILS进近时航向道/下滑道偏差较大，机组复飞，要求雷达引导重新进近' },
        { title: '导航设备失效', template: '主要导航设备失效，机组启用备用导航设备，与管制协调导航支援' },
        
        // 天气相关
        { title: '严重颠簸', template: '遭遇严重颠簸，飞机剧烈摇摆，机组减速，系好安全带信号灯亮起，请示改变高度' },
        { title: '雷暴绕飞', template: '前方雷暴天气，机组请求偏航绕飞，获得管制同意后改变航路避开雷暴区域' },
        { title: '低能见度', template: '机场天气恶化，能见度降至最低标准以下，机组决定备降至其他机场' },
        
        // 地面作业
        { title: '跑道侵入', template: '其他航空器/车辆侵入跑道，塔台发出停止指令，机组中断起飞/复飞避让' },
        { title: '鸟击', template: '起飞/着陆过程中遭遇鸟击，发动机吸入鸟类或撞击机身，机组检查系统状态' },
        { title: '外来物损伤', template: '滑行时机轮压过跑道外来物，轮胎受损，机组停止滑行，申请检查' },
        
        // 客舱事件
        { title: '旅客突发疾病', template: '航班途中旅客突发疾病，乘务组实施急救，机组联系地面医疗，考虑就近降落' },
        { title: '客舱冒烟', template: '客舱内出现烟雾，来源不明，乘务组使用灭火器处置，机组准备紧急下降' },
        { title: '危险品事件', template: '发现旅客携带未申报危险品，乘务组按程序隔离处置，机组评估安全影响' },
        
        // 维修相关
        { title: '维修差错', template: '发现维修工作存在差错，影响飞行安全，机组中止飞行，返回检查维修' },
        { title: '放行单错误', template: '发现维修放行单信息错误，与实际状况不符，机组要求重新检查确认' },
        
        // 空管相关
        { title: '管制指令冲突', template: '收到相互冲突的管制指令，机组请求澄清，与管制员确认正确指令后执行' },
        { title: '无线电干扰', template: '通信频率受到干扰，信号质量差，机组请求更换频率或使用其他通信方式' },
        
        // 机场设施
        { title: '跑道状况不良', template: '跑道湿滑/有积水，刹车效果差，着陆距离增加，机组小心操纵安全停止' },
        { title: '助航灯光故障', template: '跑道/滑行道助航灯光故障，能见度受影响，机组请求地面引导滑行' }
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