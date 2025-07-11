/**
 * 资质管理页面 - 重构版本
 * 使用BasePage基类和PickerComponent，遵循ES5语法
 * 支持3种倒计时模式：月周期、日周期、到期日期
 */

var BasePage = require('../../utils/base-page.js');
var PickerComponent = require('../../utils/picker-component.js');

// 创建Picker组件实例
var pickerComponent = PickerComponent.createPickerComponent({
  enableStorage: true,
  storageKey: 'qualification_picker_history'
});

// 创建日期选择器混入
var datePickerMixin = pickerComponent.createPickerMixin({
  title: '选择日期',
  onConfirm: function(event) {
    console.log('日期选择确认:', event);
  }
});

// 创建模式选择器混入
var modePickerMixin = pickerComponent.createPickerMixin({
  title: '选择倒计时模式',
  onConfirm: function(event) {
    console.log('模式选择确认:', event);
  }
});

// 创建页面配置
var pageConfig = {
  data: {
    qualifications: [],
    
    // 统计数据
    validCount: 0,
    warningCount: 0,
    expiredCount: 0,
    
    // 弹窗控制
    showModeSelectionSheet: false,
    showAddPopup: false,
    showRecordPopup: false,
    showDatePicker: false,
    showExpiryDatePicker: false,
    
    // 表单数据
    currentQualification: null,
    newRecord: {
      date: '',
      count: 1
    },
    
    // 新建资质表单
    newQualificationForm: {
      name: '',
      mode: '',
      monthlyPeriod: 12,
      monthlyRequired: 2,
      dailyPeriod: 90,
      dailyRequired: 3,
      expiryDate: '',
      warningDays: 30,
      description: ''
    },
    
    // 显示用的记录（只显示最近3条）
    displayRecords: [],
    
    // 日期选择
    selectedDate: null,
    selectedDateStr: '',
    selectedDateTimestamp: 0,
    selectedExpiryDate: null,
    selectedExpiryDateStr: '',
    minDate: new Date(2020, 0, 1).getTime(),
    maxDate: new Date(2040, 11, 31).getTime(),
    
    // 倒计时模式选择
    countdownModes: [
      { name: 'X月Y次 (如12个月2次)', value: 'monthly' },
      { name: 'X天Y次 (如90天3次起落)', value: 'daily' },
      { name: '到期日期 (如体检到期)', value: 'expiry' }
    ],
    selectedMode: '',
    
    // 常用资质模板
    qualificationTemplates: [
      {
        name: '90天3次起落',
        value: 0,
        mode: 'daily',
        dailyPeriod: 90,
        dailyRequired: 3,
        warningDays: 30,
        description: '90天内需要完成3次起落'
      },
      {
        name: 'ICAO英语等级',
        value: 1,
        mode: 'monthly',
        monthlyPeriod: 36,
        monthlyRequired: 1,
        warningDays: 90,
        description: '36个月内需要完成1次ICAO英语等级考试'
      },
      {
        name: '体检',
        value: 2,
        mode: 'expiry',
        warningDays: 60,
        description: '体检有效期到期提醒'
      }
    ],
    showTemplateSheet: false
  },

  /**
   * 自定义页面加载方法
   */
  customOnLoad: function(options) {
    console.log('📋 资质管理页面加载');
    this.loadQualifications();
    this.initDefaultDate();
  },

  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    // 每次显示页面时刷新倒计时
    var currentDate = new Date().toDateString();
    var lastCheckDate = wx.getStorageSync('lastQualificationCheckDate') || '';
    
    // 如果日期发生变化，强制刷新所有数据
    if (lastCheckDate !== currentDate) {
      console.log('检测到日期变化，强制刷新资质数据');
      wx.setStorageSync('lastQualificationCheckDate', currentDate);
      this.loadQualifications();
    }
    
    this.updateQualificationStatus();
  },

  /**
   * 处理Android返回按钮
   */
  onBackPress: function() {
    if (this.data.showRecordPopup) {
      this.closeRecordPopup();
      return true;
    }
    if (this.data.showAddPopup) {
      this.closeAddPopup();
      return true;
    }
    if (this.data.showDatePicker) {
      this.closeDatePicker();
      return true;
    }
    if (this.data.showExpiryDatePicker) {
      this.closeExpiryDatePicker();
      return true;
    }
    if (this.data.showModeSelectionSheet) {
      this.closeModeSelectionSheet();
      return true;
    }
    if (this.data.showTemplateSheet) {
      this.closeTemplateSheet();
      return true;
    }
    
    return false;
  },

  /**
   * 初始化默认日期
   */
  initDefaultDate: function() {
    var today = new Date();
    var oneYearLater = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    this.setData({
      selectedDate: today,
      selectedDateStr: this.formatDate(today),
      selectedDateTimestamp: today.getTime(),
      selectedExpiryDate: oneYearLater,
      selectedExpiryDateStr: this.formatDate(oneYearLater),
      'newRecord.date': this.formatDate(today),
      'newQualificationForm.expiryDate': this.formatDate(oneYearLater)
    });
  },

  /**
   * 加载资质数据
   */
  loadQualifications: function() {
    var self = this;
    
    this.loadDataWithLoading(function() {
      return new Promise(function(resolve, reject) {
        try {
          var qualifications = self.getStoredQualifications();
          
          // 如果没有数据，创建演示数据
          if (qualifications.length === 0) {
            qualifications = self.createDemoQualifications();
            self.saveQualifications(qualifications);
          }
          
          // 更新资质状态
          qualifications = self.updateAllQualificationsStatus(qualifications);
          
          resolve(qualifications);
        } catch (error) {
          reject(error);
        }
      });
    }, {
      context: '资质数据加载',
      loadingKey: 'qualificationsLoading',
      dataKey: 'qualificationsData'
    }).then(function(qualifications) {
      self.setData({ qualifications: qualifications });
      self.updateStatistics();
    }).catch(function(error) {
      console.error('加载资质数据失败:', error);
    });
  },

  /**
   * 获取存储的资质数据
   */
  getStoredQualifications: function() {
    try {
      return wx.getStorageSync('qualifications') || [];
    } catch (error) {
      console.error('获取资质数据失败:', error);
      return [];
    }
  },

  /**
   * 保存资质数据
   */
  saveQualifications: function(qualifications) {
    try {
      wx.setStorageSync('qualifications', qualifications);
    } catch (error) {
      console.error('保存资质数据失败:', error);
      this.handleError(error, '保存资质数据');
    }
  },

  /**
   * 创建演示数据
   */
  createDemoQualifications: function() {
    var today = new Date();
    var demo = [
      {
        id: 'demo_landing_' + Date.now(),
        name: '90天3次起落',
        mode: 'daily',
        status: 'valid',
        dailyPeriod: 90,
        dailyRequired: 3,
        warningDays: 30,
        description: '90天内需要完成3次起落',
        records: [
          {
            id: 'record1',
            date: this.formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
            count: 1
          },
          {
            id: 'record2',
            date: this.formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)),
            count: 1
          },
          {
            id: 'record3',
            date: this.formatDate(today),
            count: 1
          }
        ]
      },
      {
        id: 'demo_medical_' + Date.now(),
        name: '体检',
        mode: 'expiry',
        status: 'warning',
        expiryDate: this.formatDate(new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000)),
        warningDays: 60,
        description: '体检有效期到期提醒',
        records: []
      }
    ];
    
    return demo;
  },

  /**
   * 更新所有资质状态
   */
  updateAllQualificationsStatus: function(qualifications) {
    var self = this;
    return qualifications.map(function(qualification) {
      return self.calculateQualificationStatus(qualification);
    });
  },

  /**
   * 计算资质状态
   */
  calculateQualificationStatus: function(qualification) {
    var today = new Date();
    var status = 'expired';
    var daysRemaining = 0;
    var currentCount = 0;
    var calculatedExpiryDate = '';
    var lastDate = '';
    
    try {
      if (qualification.mode === 'expiry') {
        // 到期日期模式
        if (qualification.expiryDate) {
          var expiryDate = new Date(qualification.expiryDate);
          var timeDiff = expiryDate.getTime() - today.getTime();
          daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
          calculatedExpiryDate = qualification.expiryDate;
          
          if (daysRemaining > qualification.warningDays) {
            status = 'valid';
          } else if (daysRemaining > 0) {
            status = 'warning';
          } else {
            status = 'expired';
          }
        }
      } else {
        // 周期模式（月周期或日周期）
        var records = qualification.records || [];
        var periodDays = 0;
        var requiredCount = 0;
        
        if (qualification.mode === 'monthly') {
          periodDays = qualification.monthlyPeriod * 30; // 简化计算
          requiredCount = qualification.monthlyRequired;
        } else if (qualification.mode === 'daily') {
          periodDays = qualification.dailyPeriod;
          requiredCount = qualification.dailyRequired;
        }
        
        // 计算当前周期内的有效记录
        var cutoffDate = new Date(today.getTime() - periodDays * 24 * 60 * 60 * 1000);
        var validRecords = records.filter(function(record) {
          var recordDate = new Date(record.date);
          return recordDate >= cutoffDate;
        });
        
        currentCount = validRecords.length;
        
        // 找到最后一次记录
        if (records.length > 0) {
          var sortedRecords = records.slice().sort(function(a, b) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          lastDate = sortedRecords[0].date;
        }
        
        // 计算状态
        if (currentCount >= requiredCount) {
          status = 'valid';
          // 计算下次需要完成的日期
          if (validRecords.length > 0) {
            var oldestValidRecord = validRecords.reduce(function(oldest, record) {
              return new Date(record.date) < new Date(oldest.date) ? record : oldest;
            });
            var nextRequiredDate = new Date(new Date(oldestValidRecord.date).getTime() + periodDays * 24 * 60 * 60 * 1000);
            var timeDiff = nextRequiredDate.getTime() - today.getTime();
            daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
            calculatedExpiryDate = this.formatDate(nextRequiredDate);
            
            if (daysRemaining <= qualification.warningDays) {
              status = 'warning';
            }
          }
        } else {
          status = 'expired';
          daysRemaining = 0;
        }
      }
    } catch (error) {
      console.error('计算资质状态失败:', error);
      status = 'expired';
    }
    
    // 更新资质对象
    var updatedQualification = {};
    for (var key in qualification) {
      if (qualification.hasOwnProperty(key)) {
        updatedQualification[key] = qualification[key];
      }
    }
    
    updatedQualification.status = status;
    updatedQualification.daysRemaining = daysRemaining;
    updatedQualification.currentCount = currentCount;
    updatedQualification.lastDate = lastDate;
    updatedQualification.calculatedExpiryDate = calculatedExpiryDate;
    
    return updatedQualification;
  },

  /**
   * 更新统计数据
   */
  updateStatistics: function() {
    var qualifications = this.data.qualifications;
    var validCount = 0;
    var warningCount = 0;
    var expiredCount = 0;
    
    qualifications.forEach(function(qualification) {
      switch (qualification.status) {
        case 'valid':
          validCount++;
          break;
        case 'warning':
          warningCount++;
          break;
        case 'expired':
          expiredCount++;
          break;
      }
    });
    
    this.setData({
      validCount: validCount,
      warningCount: warningCount,
      expiredCount: expiredCount
    });
  },

  /**
   * 更新资质状态
   */
  updateQualificationStatus: function() {
    var qualifications = this.data.qualifications;
    var updatedQualifications = this.updateAllQualificationsStatus(qualifications);
    this.setData({ qualifications: updatedQualifications });
    this.updateStatistics();
    this.saveQualifications(updatedQualifications);
  },

  /**
   * 显示添加资质弹窗
   */
  showAddQualification: function() {
    this.setData({ showAddPopup: true });
  },

  /**
   * 关闭添加资质弹窗
   */
  closeAddPopup: function() {
    this.setData({
      showAddPopup: false,
      newQualificationForm: {
        name: '',
        mode: '',
        monthlyPeriod: 12,
        monthlyRequired: 2,
        dailyPeriod: 90,
        dailyRequired: 3,
        expiryDate: '',
        warningDays: 30,
        description: ''
      }
    });
  },

  /**
   * 显示模式选择
   */
  showModeSelection: function() {
    this.setData({ showModeSelectionSheet: true });
  },

  /**
   * 关闭模式选择
   */
  closeModeSelectionSheet: function() {
    this.setData({ showModeSelectionSheet: false });
  },

  /**
   * 选择模式
   */
  selectMode: function(e) {
    var mode = e.currentTarget.dataset.mode;
    var modeName = e.currentTarget.dataset.name;
    
    this.setData({
      'newQualificationForm.mode': mode,
      selectedMode: modeName,
      showModeSelectionSheet: false
    });
  },

  /**
   * 显示模板选择
   */
  showTemplateSelection: function() {
    this.setData({ showTemplateSheet: true });
  },

  /**
   * 关闭模板选择
   */
  closeTemplateSheet: function() {
    this.setData({ showTemplateSheet: false });
  },

  /**
   * 选择模板
   */
  selectTemplate: function(e) {
    var index = e.detail.value;
    var template = this.data.qualificationTemplates[index];
    
    var newForm = {
      name: template.name,
      mode: template.mode,
      monthlyPeriod: template.monthlyPeriod || 12,
      monthlyRequired: template.monthlyRequired || 2,
      dailyPeriod: template.dailyPeriod || 90,
      dailyRequired: template.dailyRequired || 3,
      expiryDate: this.data.newQualificationForm.expiryDate,
      warningDays: template.warningDays || 30,
      description: template.description || ''
    };
    
    // 找到对应的模式名称
    var selectedModeName = '';
    for (var i = 0; i < this.data.countdownModes.length; i++) {
      if (this.data.countdownModes[i].value === template.mode) {
        selectedModeName = this.data.countdownModes[i].name;
        break;
      }
    }
    
    this.setData({
      newQualificationForm: newForm,
      selectedMode: selectedModeName,
      showTemplateSheet: false
    });
  },

  /**
   * 表单输入处理
   */
  onFormInput: function(e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value;
    
    var updateData = {};
    updateData['newQualificationForm.' + field] = value;
    
    this.setData(updateData);
  },

  /**
   * 日期格式化
   */
  formatDate: function(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  },

  /**
   * 显示日期选择器
   */
  showDatePicker: function() {
    this.setData({ showDatePicker: true });
  },

  /**
   * 关闭日期选择器
   */
  closeDatePicker: function() {
    this.setData({ showDatePicker: false });
  },

  /**
   * 日期选择确认
   */
  onDatePickerConfirm: function(e) {
    var selectedDate = new Date(e.detail.value);
    this.setData({
      selectedDate: selectedDate,
      selectedDateStr: this.formatDate(selectedDate),
      selectedDateTimestamp: selectedDate.getTime(),
      'newRecord.date': this.formatDate(selectedDate),
      showDatePicker: false
    });
  },

  /**
   * 保存新资质
   */
  saveNewQualification: function() {
    var self = this;
    var form = this.data.newQualificationForm;
    
    // 验证表单
    if (!form.name.trim()) {
      this.showError('请输入资质名称');
      return;
    }
    
    if (!form.mode) {
      this.showError('请选择倒计时模式');
      return;
    }
    
    if (form.mode === 'expiry' && !form.expiryDate) {
      this.showError('请选择到期日期');
      return;
    }
    
    // 创建新资质
    var newQualification = {
      id: 'qual_' + Date.now(),
      name: form.name.trim(),
      mode: form.mode,
      warningDays: form.warningDays || 30,
      description: form.description.trim(),
      records: []
    };
    
    if (form.mode === 'monthly') {
      newQualification.monthlyPeriod = form.monthlyPeriod;
      newQualification.monthlyRequired = form.monthlyRequired;
    } else if (form.mode === 'daily') {
      newQualification.dailyPeriod = form.dailyPeriod;
      newQualification.dailyRequired = form.dailyRequired;
    } else if (form.mode === 'expiry') {
      newQualification.expiryDate = form.expiryDate;
    }
    
    // 计算状态
    newQualification = this.calculateQualificationStatus(newQualification);
    
    // 添加到列表
    var qualifications = this.data.qualifications.slice();
    qualifications.push(newQualification);
    
    this.setData({ qualifications: qualifications });
    this.updateStatistics();
    this.saveQualifications(qualifications);
    this.closeAddPopup();
    
    this.showSuccess('资质添加成功');
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));