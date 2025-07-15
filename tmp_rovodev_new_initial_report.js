// 事件信息初报页面 - 完全仿照首报实现
Page({
  data: {
    loading: false,
    
    // 个人信息（从存储加载）
    personalInfo: {
      department: '',
      name: ''
    },
    
    // 初报表单数据 - 仿照首报结构
    reportData: {
      date: '', // 事发日期
      flightNumber: '', // 航班号
      aircraftType: '', // 机型
      aircraftReg: '', // 机号
      route: {
        departure: '', // 起飞机场
        arrival: '' // 着陆机场
      },
      crewMembers: {
        captain: '', // 机长
        firstOfficer: '', // 副驾驶
        observer: '' // 观察员（可选）
      },
      eventLocation: {
        area: '', // 事发区域
        phase: '' // 飞行阶段
      },
      weather: '', // 天气情况
      eventDescription: '', // 事件详细描述
      
      // 时间信息
      eventTime: '', // 事发时间
      takeoffTime: '', // 起飞时间
      landingTime: '', // 着陆时间
      
      // 相关因素
      personnelFactor: '', // 人员因素
      equipmentFactor: '', // 设备因素
      weatherFactor: '', // 天气因素
      otherInfo: '' // 其他信息
    },
    
    // 日期时间选择器相关
    showDateTimePicker: false,
    selectedDateTime: 0,
    minDate: 0,
    maxDate: 0,
    pickerType: 'date',
    pickerTitle: '选择日期',
    currentField: '',
    
    // 保存状态
    saving: false
  },

  onLoad() {
    this.loadPersonalInfo();
    this.loadDraft();
    this.initializeDateTime();
    this.initDateTimePicker();
  },

  // 加载个人信息
  loadPersonalInfo: function() {
    try {
      var personalInfo = wx.getStorageSync('event_report_personal_info') || {};
      this.setData({ 
        personalInfo: personalInfo,
        'reportData.crewMembers.captain': personalInfo.name || ''
      });
    } catch (error) {
      console.error('加载个人信息失败:', error);
    }
  },

  // 加载草稿
  loadDraft: function() {
    try {
      var draft = wx.getStorageSync('event_initial_report_draft');
      if (draft) {
        this.setData({ reportData: draft });
        wx.showToast({
          title: '已恢复草稿',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('加载草稿失败:', error);
    }
  },

  // 初始化日期时间
  initializeDateTime: function() {
    var now = new Date();
    var dateStr = this.formatDate(now);
    var timeStr = this.formatTime(now);
    
    this.setData({
      'reportData.date': dateStr,
      'reportData.eventTime': timeStr
    });
  },

  // 初始化日期时间选择器
  initDateTimePicker: function() {
    var now = new Date();
    var oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    var oneWeekLater = new Date();
    oneWeekLater.setDate(now.getDate() + 7);
    
    this.setData({
      selectedDateTime: now.getTime(),
      minDate: oneMonthAgo.getTime(),
      maxDate: oneWeekLater.getTime()
    });
  },

  // 格式化日期
  formatDate: function(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();
    // ES5兼容的padStart实现
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return year + '-' + month + '-' + day;
  },

  // 格式化时间
  formatTime: function(date) {
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    // ES5兼容的padStart实现
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;
    return hours + ':' + minutes;
  },

  // 格式化日期时间显示
  formatDateTime: function(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    
    // ES5兼容的padStart实现
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;
    
    return year + '年' + month + '月' + day + '日，北京时间' + hours + ':' + minutes;
  },

  // 输入处理 - 仿照首报
  onFieldInput: function(e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail || '';
    var updateData = {};
    updateData['reportData.' + field] = value;
    this.setData(updateData);
    this.saveDraft();
  },

  // 嵌套字段输入处理 - 仿照首报
  onNestedFieldInput: function(e) {
    var parent = e.currentTarget.dataset.parent;
    var field = e.currentTarget.dataset.field;
    var value = e.detail || '';
    var updateData = {};
    updateData['reportData.' + parent + '.' + field] = value;
    this.setData(updateData);
    this.saveDraft();
  },

  // 显示日期选择器
  showDateTimePickerModal: function() {
    var currentDate = this.data.reportData.date ? new Date(this.data.reportData.date) : new Date();
    this.setData({
      showDateTimePicker: true,
      selectedDateTime: currentDate.getTime(),
      pickerType: 'date',
      pickerTitle: '选择事发日期',
      currentField: 'date'
    });
  },

  // 显示事发时间选择器
  showEventTimePickerModal: function() {
    var currentTime = this.data.reportData.eventTime || '12:00';
    var today = new Date();
    var timeArray = currentTime.split(':');
    today.setHours(parseInt(timeArray[0]) || 12);
    today.setMinutes(parseInt(timeArray[1]) || 0);
    
    this.setData({
      showDateTimePicker: true,
      selectedDateTime: today.getTime(),
      pickerType: 'time',
      pickerTitle: '选择事发时间',
      currentField: 'eventTime'
    });
  },

  // 显示起飞时间选择器
  showTakeoffTimePickerModal: function() {
    var currentTime = this.data.reportData.takeoffTime || '12:00';
    var today = new Date();
    var timeArray = currentTime.split(':');
    today.setHours(parseInt(timeArray[0]) || 12);
    today.setMinutes(parseInt(timeArray[1]) || 0);
    
    this.setData({
      showDateTimePicker: true,
      selectedDateTime: today.getTime(),
      pickerType: 'time',
      pickerTitle: '选择起飞时间',
      currentField: 'takeoffTime'
    });
  },

  // 显示着陆时间选择器
  showLandingTimePickerModal: function() {
    var currentTime = this.data.reportData.landingTime || '12:00';
    var today = new Date();
    var timeArray = currentTime.split(':');
    today.setHours(parseInt(timeArray[0]) || 12);
    today.setMinutes(parseInt(timeArray[1]) || 0);
    
    this.setData({
      showDateTimePicker: true,
      selectedDateTime: today.getTime(),
      pickerType: 'time',
      pickerTitle: '选择着陆时间',
      currentField: 'landingTime'
    });
  },

  // 确认日期时间选择
  onDateTimeConfirm: function(e) {
    try {
      var selectedTimestamp = e && e.detail ? e.detail : this.data.selectedDateTime;
      var selectedDate = new Date(selectedTimestamp);
      var field = this.data.currentField;
      var updateData = {};
      
      if (this.data.pickerType === 'date') {
        var formattedDate = this.formatDate(selectedDate);
        updateData['reportData.' + field] = formattedDate;
      } else if (this.data.pickerType === 'time') {
        var formattedTime = this.formatTime(selectedDate);
        updateData['reportData.' + field] = formattedTime;
      }
      
      this.setData(updateData);
      this.onDateTimeCancel();
      this.saveDraft();
      
      wx.showToast({
        title: '时间已设置',
        icon: 'success'
      });
    } catch (error) {
      console.error('设置日期时间失败:', error);
      wx.showToast({
        title: '设置失败',
        icon: 'error'
      });
    }
  },

  // 取消日期时间选择
  onDateTimeCancel: function() {
    this.setData({
      showDateTimePicker: false
    });
  },

  // 保存草稿
  saveDraft: function() {
    try {
      wx.setStorageSync('event_initial_report_draft', this.data.reportData);
    } catch (error) {
      console.error('保存草稿失败:', error);
    }
  },

  // 清除草稿
  clearDraft: function() {
    var self = this;
    wx.showModal({
      title: '确认清除',
      content: '确定要清除当前填写的内容吗？',
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('event_initial_report_draft');
          self.setData({
            reportData: {
              date: self.formatDate(new Date()),
              flightNumber: '',
              aircraftType: '',
              aircraftReg: '',
              route: {
                departure: '',
                arrival: ''
              },
              crewMembers: {
                captain: self.data.personalInfo.name || '',
                firstOfficer: '',
                observer: ''
              },
              eventLocation: {
                area: '',
                phase: ''
              },
              weather: '',
              eventDescription: '',
              eventTime: self.formatTime(new Date()),
              takeoffTime: '',
              landingTime: '',
              personnelFactor: '',
              equipmentFactor: '',
              weatherFactor: '',
              otherInfo: ''
            }
          });
          wx.showToast({
            title: '已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 预览报告
  previewReport: function() {
    var reportText = this.generateReportText();
    wx.showModal({
      title: '报告预览',
      content: reportText,
      showCancel: true,
      cancelText: '返回',
      confirmText: '提交',
      success: function(res) {
        if (res.confirm) {
          this.submitReport();
        }
      }.bind(this)
    });
  },

  // 生成报告文本
  generateReportText: function() {
    var data = this.data.reportData;
    return '事件信息初报\n\n' +
           '• 事发日期：' + data.date + '\n' +
           '• 航班号：' + data.flightNumber + '\n' +
           '• 机型：' + data.aircraftType + '\n' +
           '• 机号：' + data.aircraftReg + '\n' +
           '• 航线：' + data.route.departure + '-' + data.route.arrival + '\n' +
           '• 机长：' + data.crewMembers.captain + '\n' +
           '• 副驾驶：' + data.crewMembers.firstOfficer + '\n' +
           '• 事发区域：' + data.eventLocation.area + '\n' +
           '• 飞行阶段：' + data.eventLocation.phase + '\n' +
           '• 天气情况：' + data.weather + '\n' +
           '• 事发时间：' + data.eventTime + '\n' +
           '• 事件描述：' + data.eventDescription + '\n\n' +
           '相关因素分析：\n' +
           '• 人员因素：' + data.personnelFactor + '\n' +
           '• 设备因素：' + data.equipmentFactor + '\n' +
           '• 天气因素：' + data.weatherFactor + '\n' +
           '• 其他信息：' + data.otherInfo;
  },

  // 提交报告
  submitReport: function() {
    if (!this.validateForm()) {
      return;
    }

    this.setData({ saving: true });
    
    setTimeout(() => {
      try {
        // 保存到历史记录
        var history = wx.getStorageSync('event_initial_report_history') || [];
        var newReport = {
          id: Date.now(),
          date: this.data.reportData.date,
          flightNumber: this.data.reportData.flightNumber,
          aircraftType: this.data.reportData.aircraftType,
          eventDescription: this.data.reportData.eventDescription,
          reportText: this.generateReportText(),
          submitTime: new Date().toISOString()
        };
        
        history.unshift(newReport);
        wx.setStorageSync('event_initial_report_history', history.slice(0, 50));
        
        // 清除草稿
        wx.removeStorageSync('event_initial_report_draft');
        
        this.setData({ saving: false });
        
        wx.showModal({
          title: '提交成功',
          content: '事件初报已成功提交，您可以在历史记录中查看',
          showCancel: false,
          success: function() {
            wx.navigateBack();
          }
        });
        
      } catch (error) {
        console.error('提交失败:', error);
        this.setData({ saving: false });
        wx.showToast({
          title: '提交失败',
          icon: 'error'
        });
      }
    }, 1000);
  },

  // 表单验证
  validateForm: function() {
    var data = this.data.reportData;
    var errors = [];
    
    if (!data.date) errors.push('请选择事发日期');
    if (!data.flightNumber) errors.push('请输入航班号');
    if (!data.aircraftType) errors.push('请输入机型');
    if (!data.route.departure) errors.push('请输入起飞机场');
    if (!data.route.arrival) errors.push('请输入着陆机场');
    if (!data.crewMembers.captain) errors.push('请输入机长姓名');
    if (!data.eventLocation.area) errors.push('请输入事发区域');
    if (!data.eventLocation.phase) errors.push('请输入飞行阶段');
    if (!data.eventTime) errors.push('请选择事发时间');
    if (!data.eventDescription) errors.push('请描述事件详情');
    
    if (errors.length > 0) {
      wx.showModal({
        title: '请完善信息',
        content: errors.join('\n'),
        showCancel: false
      });
      return false;
    }
    
    return true;
  }
});