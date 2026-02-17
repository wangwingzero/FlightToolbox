// 事件信息填报页面 - 分步引导填报系统
var BasePage = require('../../utils/base-page.js');
var eventTypesData = require('../data/event-types.js');

// 事件类型数据缓存（避免重复解析）
var eventTypesCache = null;

var pageConfig = {
  data: {
    loading: false,
    
    // 当前步骤（0-3）
    currentStep: 0,

    // 步骤配置（4步流程）
    steps: [
      { title: '基本信息', subtitle: '填写航班基础信息', icon: '✈️', completed: false },
      { title: '事件类型', subtitle: '选择事件类型', icon: '📋', completed: false },
      { title: '事件详情', subtitle: '填写事件详细信息', icon: '📝', completed: false },
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
        department: '',                // 所属部门（可自由输入）
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
          leftSeat: '',
          leftSeatQualification: '',
          leftSeatRole: 'PF',          // 左座角色（默认PF）
          rightSeat: '',
          rightSeatQualification: '',
          rightSeatRole: 'PM',         // 右座角色（默认PM）
          observer: '',
          observerQualification: '',
          observerRole: ''             // 观察座角色
        }
      },

      // 第二步：事件类型选择
      eventType: {
        category: '',                  // 事件分类
        title: ''                      // 事件类型标题
      },

      // 第三步：事件详情（通用字段 + 特定字段）
      eventDetails: {
        // 通用字段（所有事件都需要）
        commonFields: {
          location: '',                // 所在区域/机场/跑道
          phase: '',                   // 飞行阶段
          weather: '',                 // 天气情况（可选）
          crewAction: '',              // 机组处置情况
          followUp: ''                 // 后续运行情况
        },
        // 特定字段（根据事件类型动态生成，用户填写）
        specificFields: {},            // 特定字段内容（对象，key-value）
        specificFieldsArray: []        // 特定字段定义（字段元数据数组）
      }
    },
    
    // 快捷输入选项（基于上海飞行部附件六格式）
    quickInputs: {
      aircraftTypes: ['A320', 'A321', 'A330', 'A350', 'B737', 'B747', 'B777', 'B787'],
      flightPhases: ['滑行阶段', '起飞阶段', '爬升阶段', '巡航阶段', '下降阶段', '进近阶段', '着陆阶段'],
      weatherConditions: ['VMC', 'IMC', '晴朗', '多云', '小雨', '中雨', '大雨', '雾', '雪'],

      // 新增：部门选项
      departments: ['A320部', 'A321部', 'A330部', 'A350部', 'B737部', 'B777部', 'B787部', 'C919部', 'ARJ21部'],

      // 飞行员资质等级代码（符合民航飞行员等级标准）
      qualifications: [
        'S1', 'S2',                                    // S系列：学员飞行员
        'F1', 'F2', 'F3', 'F4', 'F5',                 // F系列：副驾驶等级
        'C0', 'C1', 'C2', 'C3', 'C4', 'C5',           // C系列：机长等级
        'TA', 'TB', 'TC'                              // T系列：教员/检查员资质
      ]
    },

    // 事件类型数据（从 event-types.js 加载）
    eventTypesData: {
      categories: [],                  // 事件分类列表
      eventTypes: [],                  // 所有事件类型
      selectedCategory: '',            // 当前选择的分类
      filteredEventTypes: []           // 筛选后的事件类型列表
    },
    
    // 显示控制
    showQuickInput: false,
    quickInputType: '',
    quickInputTargetField: '', // 新增：存储快选按钮指定的目标字段
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

  customOnLoad: function() {
    this.loadEventTypesData();  // 加载事件类型数据
    this.loadPersonalInfo();
    this.initDatePickerRange();
    this.initCurrentDateTime();
    this.loadDraft();
  },

  customOnUnload: function() {
    // 清理草稿保存定时器，防止内存泄漏
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    console.log('页面销毁，已清理定时器');
  },

  // 加载事件类型数据（从 event-types.js，使用缓存优化）
  loadEventTypesData: function() {
    // 如果已缓存，直接使用
    if (eventTypesCache) {
      this.setData({
        'eventTypesData.categories': eventTypesCache.categories,
        'eventTypesData.eventTypes': eventTypesCache.eventTypes
      });
      console.log('✅ 使用缓存的事件类型数据');
      return;
    }

    // 首次加载：解析数据并缓存
    var categories = eventTypesData.getCategories();
    var eventTypes = eventTypesData.eventTypes;

    eventTypesCache = {
      categories: categories,
      eventTypes: eventTypes
    };

    this.setData({
      'eventTypesData.categories': categories,
      'eventTypesData.eventTypes': eventTypes
    });

    console.log('✅ 已加载并缓存事件类型数据：', categories.length, '个分类，', eventTypes.length, '个事件类型');
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
      // 使用BasePage统一错误处理
      this.handleError(error, '加载个人信息失败');
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

  // 格式化日期（带错误处理）
  formatDate: function(date) {
    // 参数验证
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('formatDate: 无效的日期参数', date);
      return '';
    }

    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return year + '年' + month + '月' + day + '日';
  },

  // 格式化时间（带错误处理）
  formatTime: function(date) {
    // 参数验证
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('formatTime: 无效的日期参数', date);
      return '';
    }

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
        if (!reportData.basicInfo.department) {
          this.showToast('请填写所属部门');
          return false;
        }
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
        if (!reportData.basicInfo.crew.leftSeat) {
          this.showToast('请填写左座姓名');
          return false;
        }
        if (!reportData.basicInfo.crew.rightSeat) {
          this.showToast('请填写右座姓名');
          return false;
        }
        if (!reportData.basicInfo.times.takeoff) {
          this.showToast('请填写起飞时间');
          return false;
        }
        if (!reportData.basicInfo.times.landing) {
          this.showToast('请填写着陆时间');
          return false;
        }
        if (!reportData.basicInfo.times.event) {
          this.showToast('请填写事发时间');
          return false;
        }

        // 验证PF角色分配（至少一个机组成员必须是PF）
        var crew = reportData.basicInfo.crew;
        var hasPF = false;

        if (crew.leftSeat && crew.leftSeatRole === 'PF') {
          hasPF = true;
        } else if (crew.rightSeat && crew.rightSeatRole === 'PF') {
          hasPF = true;
        } else if (crew.observer && crew.observerRole === 'PF') {
          hasPF = true;
        }

        if (!hasPF) {
          this.showToast('至少一个机组成员必须是PF');
          return false;
        }

        // 验证观察员如果有姓名必须选择角色
        if (crew.observer && !crew.observerRole) {
          this.showToast('观察员必须选择角色（PF/PM）');
          return false;
        }

        break;

      case 1: // 事件类型
        if (!reportData.eventType.title) {
          this.showToast('请选择事件类型');
          return false;
        }
        break;

      case 2: // 事件详情
        if (!reportData.eventDetails.commonFields.phase) {
          this.showToast('请填写飞行阶段');
          return false;
        }
        if (!reportData.eventDetails.commonFields.crewAction) {
          this.showToast('请填写机组处置情况');
          return false;
        }
        if (!reportData.eventDetails.commonFields.followUp) {
          this.showToast('请填写后续运行情况');
          return false;
        }
        // 特定字段为可选，不验证
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

  // 输入处理（增强数据一致性 + 嵌套路径支持）
  onFieldInput: function(e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value || '';

    // 防御性检查：确保field路径存在
    if (!field) {
      console.error('❌ onFieldInput: field路径未定义');
      return;
    }

    var updateData = {};
    updateData[field] = value;

    // 如果清空观察员姓名，同时清空观察员资质和角色
    if (field === 'reportData.basicInfo.crew.observer' && !value) {
      updateData['reportData.basicInfo.crew.observerQualification'] = '';
      updateData['reportData.basicInfo.crew.observerRole'] = '';
      console.log('观察员姓名已清空，同步清空资质和角色');
    }

    // 记录特定字段的更新（用于调试）
    if (field.indexOf('specificFields.') !== -1) {
      console.log('✏️ 更新特定字段:', field, '| 值长度:', value.length);
    }

    this.setData(updateData);

    // 自动保存草稿
    this.autoSaveDraft();
  },

  // 时间选择处理
  onTimeChange: function(e) {
    var field = e.currentTarget.dataset.field;
    var time = e.detail.value || '';
    var updateData = {};
    updateData[field] = time;
    this.setData(updateData);

    // 自动保存草稿
    this.autoSaveDraft();
  },

  // PF/PM角色选择处理（带互斥逻辑） - 统一封装
  handleRoleChange: function(seatType, newRole) {
    var crew = this.data.reportData.basicInfo.crew;
    var updateData = {};

    // 设置当前座位角色
    updateData['reportData.basicInfo.crew.' + seatType + 'Role'] = newRole;

    // 实现PF互斥逻辑
    if (newRole === 'PF') {
      // 如果当前座位选择PF，其他座位全部改为PM
      if (seatType !== 'leftSeat') {
        updateData['reportData.basicInfo.crew.leftSeatRole'] = 'PM';
      }
      if (seatType !== 'rightSeat') {
        updateData['reportData.basicInfo.crew.rightSeatRole'] = 'PM';
      }
      if (seatType !== 'observer' && crew.observer && crew.observerRole === 'PF') {
        updateData['reportData.basicInfo.crew.observerRole'] = 'PM';
      }
    } else if (newRole === 'PM') {
      // 如果当前座位改为PM，确保至少有一个PF
      var hasOtherPF = false;

      // 检查其他座位是否有PF
      if (seatType !== 'leftSeat' && crew.leftSeatRole === 'PF') {
        hasOtherPF = true;
      }
      if (seatType !== 'rightSeat' && crew.rightSeatRole === 'PF') {
        hasOtherPF = true;
      }
      if (seatType !== 'observer' && crew.observer && crew.observerRole === 'PF') {
        hasOtherPF = true;
      }

      // 如果没有其他PF，优先设置左座为PF
      if (!hasOtherPF) {
        if (seatType !== 'leftSeat') {
          updateData['reportData.basicInfo.crew.leftSeatRole'] = 'PF';
        } else if (seatType !== 'rightSeat') {
          updateData['reportData.basicInfo.crew.rightSeatRole'] = 'PF';
        }
      }
    }

    this.setData(updateData);
    this.autoSaveDraft();
  },

  onLeftSeatRoleChange: function(e) {
    this.handleRoleChange('leftSeat', e.detail.value);
  },

  onRightSeatRoleChange: function(e) {
    this.handleRoleChange('rightSeat', e.detail.value);
  },

  onObserverRoleChange: function(e) {
    this.handleRoleChange('observer', e.detail.value);
  },

  // 快捷输入（简化后的逻辑）
  showQuickInputModal: function(e) {
    var type = e.currentTarget.dataset.type;
    var field = e.currentTarget.dataset.field;

    // 错误检查：快选按钮必须设置 data-field 属性
    if (!field) {
      console.error('快选按钮缺少 data-field 属性');
      wx.showToast({
        title: '系统配置错误',
        icon: 'none'
      });
      return;
    }

    this.setData({
      quickInputType: type,
      quickInputTargetField: field,
      showQuickInput: true
    });
  },

  selectQuickInput: function(e) {
    var field = this.data.quickInputTargetField;

    // 错误检查：确保目标字段已设置
    if (!field) {
      console.error('无法确定目标字段');
      this.closeQuickInput();
      return;
    }

    var value = e.currentTarget.dataset.template || e.currentTarget.dataset.value;
    var updateData = {};
    updateData[field] = value;

    this.setData(updateData);
    this.closeQuickInput();

    // 自动保存草稿
    this.autoSaveDraft();
  },

  closeQuickInput: function() {
    this.setData({
      showQuickInput: false
    });
  },

  // ========== 事件类型选择逻辑 ==========

  /**
   * 选择事件分类（筛选事件类型列表）
   */
  selectCategory: function(e) {
    var category = e.currentTarget.dataset.category;
    var filteredTypes = eventTypesData.getEventTypesByCategory(category);

    this.setData({
      'eventTypesData.selectedCategory': category,
      'eventTypesData.filteredEventTypes': filteredTypes
    });
  },

  /**
   * 选择事件类型（动态生成特定字段模板）
   */
  selectEventType: function(e) {
    var title = e.currentTarget.dataset.title;
    var category = e.currentTarget.dataset.category;

    // 获取该事件类型的字段信息
    var eventFields = eventTypesData.getEventTypeFields(title);

    if (!eventFields) {
      this.showToast('未找到该事件类型');
      return;
    }

    // 初始化特定字段对象（所有字段值为空字符串）
    var specificFieldsObj = {};
    if (eventFields.specificFields && eventFields.specificFields.length > 0) {
      eventFields.specificFields.forEach(function(field) {
        specificFieldsObj[field.key] = '';
      });
    }

    // 更新选择的事件类型
    this.setData({
      'reportData.eventType.category': category,
      'reportData.eventType.title': title,
      // 设置特定字段定义数组
      'reportData.eventDetails.specificFieldsArray': eventFields.specificFields || [],
      // 初始化特定字段值对象
      'reportData.eventDetails.specificFields': specificFieldsObj
    });

    // 自动保存草稿
    this.autoSaveDraft();

    // 显示提示
    this.showToast('已选择：' + title);
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

  // 构建报告内容（符合附件六格式 - 2段式）
  buildReportContent: function() {
    var data = this.data.reportData;
    var basic = data.basicInfo;
    var eventType = data.eventType;
    var details = data.eventDetails;

    // ========== 第一段：基本信息（连贯叙述） ==========
    var content = '';

    // 部门
    var departmentInfo = '';
    if (basic.department) {
      departmentInfo += basic.department;
    }
    if (departmentInfo) {
      content += departmentInfo + '，';
    } else {
      content += 'XX部门，';
    }

    // 机型/机号
    content += '机型 ';
    if (basic.aircraftType) {
      content += basic.aircraftType;
    } else {
      content += 'XX';
    }
    content += '/';
    if (basic.aircraftReg) {
      content += basic.aircraftReg;
    } else {
      content += 'B-XXXX';
    }
    content += ' 号机执行 ';

    // 航班号
    if (basic.flightNumber) {
      content += basic.flightNumber;
    } else {
      content += 'MUXXXX';
    }

    // 航线（如果有）
    if (basic.route.departure || basic.route.arrival) {
      content += '（';
      if (basic.route.departure) {
        content += basic.route.departure;
      } else {
        content += 'XX';
      }
      content += '-';
      if (basic.route.arrival) {
        content += basic.route.arrival;
      } else {
        content += 'XX';
      }
      content += '）';
    }
    content += '航班';

    // 添加事件类型作为主题
    if (eventType.title) {
      content += eventType.title;
    }
    content += '。';

    // 起飞时间
    if (basic.times.takeoff) {
      content += '起飞时间北京时间' + basic.times.takeoff.replace(':', '：') + '，';
    }

    // 着陆时间
    if (basic.times.landing) {
      content += '着陆时间北京时间' + basic.times.landing.replace(':', '：') + '，';
    }

    // 机组成员
    content += '机组成员：';

    // 左座
    content += '左座';
    if (basic.crew.leftSeatRole) {
      content += basic.crew.leftSeatRole;
    } else {
      content += 'PF';
    }
    if (basic.crew.leftSeat) {
      content += basic.crew.leftSeat;
    } else {
      content += 'XX';
    }
    if (basic.crew.leftSeatQualification) {
      content += '（' + basic.crew.leftSeatQualification + '）';
    }
    content += '，';

    // 右座
    content += '右座';
    if (basic.crew.rightSeatRole) {
      content += basic.crew.rightSeatRole;
    } else {
      content += 'PM';
    }
    if (basic.crew.rightSeat) {
      content += basic.crew.rightSeat;
    } else {
      content += 'XX';
    }
    if (basic.crew.rightSeatQualification) {
      content += '（' + basic.crew.rightSeatQualification + '）';
    }

    // 观察座（如果有）
    if (basic.crew.observer) {
      content += '，观察座';
      if (basic.crew.observerRole) {
        content += basic.crew.observerRole;
      }
      content += basic.crew.observer;
      if (basic.crew.observerQualification) {
        content += '（' + basic.crew.observerQualification + '）';
      }
    }
    content += '。';

    // ========== 第二段：事件详细经过（连贯叙述） ==========
    content += '\n\n';

    // 飞行阶段
    if (details.commonFields.phase) {
      content += '在' + details.commonFields.phase + '，';
    }

    // 事发时间
    if (basic.times.event) {
      content += '北京时间' + basic.times.event.replace(':', '：') + '，';
    }

    // 事发位置
    if (details.commonFields.location) {
      content += details.commonFields.location + '，';
    }

    // 天气情况
    if (details.commonFields.weather) {
      content += '天气' + details.commonFields.weather + '，';
    }

    // 特定字段内容（按字段定义顺序拼接）
    if (details.specificFieldsArray && details.specificFieldsArray.length > 0) {
      var specificParts = [];

      // 遍历字段定义数组
      details.specificFieldsArray.forEach(function(field) {
        var value = details.specificFields[field.key];
        // 如果字段有值（非空字符串），添加到数组
        if (value && value.trim()) {
          specificParts.push(value.trim());
        }
      });

      // 拼接所有有值的字段
      if (specificParts.length > 0) {
        content += specificParts.join('，') + '，';
      }
    }

    // 机组处置情况
    if (details.commonFields.crewAction) {
      content += details.commonFields.crewAction + '，';
    }

    // 后续运行情况
    if (details.commonFields.followUp) {
      content += details.commonFields.followUp + '。';
    } else {
      content += '后续运行正常。';
    }

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

  // 自动保存草稿（节流 + 错误处理）
  autoSaveDraft: function() {
    var self = this;
    // 清除之前的定时器
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // 设置500ms延迟保存，避免频繁保存
    this.saveTimer = setTimeout(function() {
      try {
        wx.setStorageSync('event_report_draft', self.data.reportData);
        console.log('✅ 草稿自动保存成功');
      } catch (error) {
        console.error('❌ 自动保存失败:', error);

        // 检查是否是存储空间不足
        if (error.errMsg && error.errMsg.indexOf('exceed max size') !== -1) {
          wx.showToast({
            title: '存储空间不足，请清理缓存',
            icon: 'none',
            duration: 3000
          });
        } else if (error.errMsg && error.errMsg.indexOf('setStorage:fail') !== -1) {
          // 其他存储失败情况
          wx.showToast({
            title: '草稿保存失败，请稍后重试',
            icon: 'none',
            duration: 2000
          });
        }
      }
    }, 500);
  },

  // 加载草稿
  loadDraft: function() {
    try {
      var draft = wx.getStorageSync('event_report_draft');
      if (draft) {
        // 数据格式兼容性检查
        if (draft.eventDetails && draft.eventDetails.specificFields) {
          // 检查是否为旧格式（字符串）
          if (typeof draft.eventDetails.specificFields === 'string') {
            console.warn('⚠️ 检测到旧版本草稿格式，已清除');
            wx.showToast({
              title: '草稿格式已更新，请重新填写',
              icon: 'none',
              duration: 3000
            });
            // 清除旧格式草稿
            wx.removeStorageSync('event_report_draft');
            return;
          }
        }

        this.setData({
          reportData: draft
        });
        console.log('✅ 已加载草稿数据');
      }
    } catch (error) {
      // 使用BasePage统一错误处理
      this.handleError(error, '加载草稿失败');
    }
  },

  // 清除所有数据
  clearAllData: function() {
    var self = this;
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有填写的内容吗？此操作不可恢复。',
      success: function(res) {
        if (res.confirm) {
          // 重置所有数据
          self.setData({
            currentStep: 0,
            reportData: {
              basicInfo: {
                eventDate: '',
                department: '',
                flightNumber: '',
                aircraftType: '',
                aircraftReg: '',
                route: { departure: '', arrival: '' },
                times: { takeoff: '', landing: '', event: '' },
                crew: {
                  leftSeat: '',
                  leftSeatQualification: '',
                  leftSeatRole: 'PF',
                  rightSeat: '',
                  rightSeatQualification: '',
                  rightSeatRole: 'PM',
                  observer: '',
                  observerQualification: '',
                  observerRole: ''
                }
              },
              eventType: {
                category: '',
                title: ''
              },
              eventDetails: {
                commonFields: {
                  location: '',
                  phase: '',
                  weather: '',
                  crewAction: '',
                  followUp: ''
                },
                specificFields: {},
                specificFieldsArray: []
              }
            },
            steps: [
              { title: '基本信息', subtitle: '填写航班基础信息', icon: '✈️', completed: false },
              { title: '事件类型', subtitle: '选择事件类型', icon: '📋', completed: false },
              { title: '事件详情', subtitle: '填写事件详细信息', icon: '📝', completed: false },
              { title: '确认提交', subtitle: '检查并生成报告', icon: '✅', completed: false }
            ]
          });

          // 清除本地存储
          try {
            wx.removeStorageSync('event_report_draft');
            self.showToast('所有数据已清除');
          } catch (error) {
            // 使用BasePage统一错误处理
            self.handleError(error, '清除存储失败', true);
          }

          // 重新初始化当前日期时间
          self.initCurrentDateTime();
        }
      }
    });
  }
};

// 使用BasePage基类创建页面（符合项目开发规范）
Page(BasePage.createPage(pageConfig));