// 资质管理页面 - 支持3种倒计时模式
interface QualificationItem {
  id: string;
  name: string;
  mode: 'monthly' | 'daily' | 'expiry';    // 倒计时模式：月周期、日周期、到期日期
  status: 'valid' | 'warning' | 'expired';
  warningDays?: number;     // 提前警告天数
  reminderEnabled?: boolean; // 提醒开关，默认true
  description?: string;     // 描述
  records?: QualificationRecord[];  // 记录列表
  daysRemaining?: number;   // 剩余天数
  
  // 月周期模式 (X月Y次)
  monthlyPeriod?: number;   // 多少个月
  monthlyRequired?: number; // 要求次数
  
  // 日周期模式 (X天Y次)
  dailyPeriod?: number;     // 多少天
  dailyRequired?: number;   // 要求次数
  
  // 到期日期模式
  expiryDate?: string;      // 到期日期
  
  // 统计信息
  currentCount?: number;    // 当前有效次数
  lastDate?: string;        // 最后一次完成日期
  
  // 计算得出的到期日期（适用于所有模式）
  calculatedExpiryDate?: string;  // 计算出的具体到期日期
}

interface QualificationRecord {
  id: string;
  date: string;
  count?: number | string;
}

// 工具管理器将在需要时动态引入

Page({
  data: {
    qualifications: [] as QualificationItem[],
    
    // 主题控制
    isDarkMode: false,
    
    // 统计数据
    validCount: 0,
    warningCount: 0,
    expiredCount: 0,
    
    // 弹窗控制
    showModeSelectionSheet: false,  // 模式选择
    showAddPopup: false,
    showRecordPopup: false,
    showDatePicker: false,
    showExpiryDatePicker: false,
    
    // 表单数据
    currentQualification: null as QualificationItem | null,
    newRecord: {
      date: '',
      count: 1
    } as QualificationRecord,
    
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
    displayRecords: [] as QualificationRecord[],
    
    // 日期选择
    selectedDate: new Date(),
    selectedDateStr: '',
    selectedDateTimestamp: Date.now(),
    selectedExpiryDate: new Date(),
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
        value: 0,  // 添加value字段供action-sheet使用
        mode: 'daily',
        dailyPeriod: 90,
        dailyRequired: 3,
        warningDays: 30,
        description: '90天内需要完成3次起落'
      },
      {
        name: 'ICAO英语等级',
        value: 1,  // 添加value字段供action-sheet使用
        mode: 'monthly',
        monthlyPeriod: 36,
        monthlyRequired: 1,
        warningDays: 90,
        description: '36个月内需要完成1次ICAO英语等级考试'
      },
      {
        name: '体检',
        value: 2,  // 添加value字段供action-sheet使用
        mode: 'expiry',
        warningDays: 60,
        description: '体检有效期到期提醒'
      }
    ],
    showTemplateSheet: false,
    

  },

  onLoad() {
    this.loadQualifications();
    this.initDefaultDate();
    this.checkTheme();
    
  },

  onShow() {
    // 每次显示页面时刷新倒计时
    // 特别处理时间变化的情况（跨日期刷新）
    const currentDate = new Date().toDateString();
    const lastCheckDate = wx.getStorageSync('lastQualificationCheckDate') || '';
    
    // 如果日期发生变化，强制刷新所有数据
    if (lastCheckDate !== currentDate) {
      console.log('检测到日期变化，强制刷新资质数据');
      wx.setStorageSync('lastQualificationCheckDate', currentDate);
      // 重新加载数据以确保演示数据也基于新的当前时间
      this.loadQualifications();
    }
    
    this.updateQualificationStatus();
  },

  // 处理Android返回按钮
  onBackPress() {
    // 如果有弹窗显示，先关闭弹窗
    if (this.data.showRecordPopup) {
      this.closeRecordPopup();
      return true; // 阻止默认返回行为
    }
    if (this.data.showAddPopup) {
      this.closeAddPopup();
      return true; // 阻止默认返回行为
    }
    if (this.data.showDatePicker) {
      this.closeDatePicker();
      return true; // 阻止默认返回行为
    }
    if (this.data.showExpiryDatePicker) {
      this.closeExpiryDatePicker();
      return true; // 阻止默认返回行为
    }
    if (this.data.showModeSelectionSheet) {
      this.closeModeSelectionSheet();
      return true; // 阻止默认返回行为
    }
    if (this.data.showTemplateSheet) {
      this.closeTemplateSheet();
      return true; // 阻止默认返回行为
    }
    
    // 如果没有弹窗，允许正常返回
    return false;
  },

  // 初始化默认日期
  initDefaultDate() {
    const today = new Date();
    const oneYearLater = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
    
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

  // 加载资质数据
  loadQualifications() {
    try {
      let qualifications = wx.getStorageSync('pilot_qualifications_v2') || [];
      
      // 🎯 修改：新用户默认为空状态，不再添加演示数据
      // 用户需要自己添加资质项目
      
      this.setData({ qualifications });
      this.updateQualificationStatus();
    } catch (error) {
      console.error('加载资质数据失败:', error);
    }
  },

  // 保存资质数据
  saveQualifications() {
    try {
      wx.setStorageSync('pilot_qualifications_v2', this.data.qualifications);
    } catch (error) {
      console.error('保存资质数据失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  // 更新资质状态
  // 检查并设置主题
  checkTheme() {
    try {
      const themeManager = require('../../utils/theme-manager.js');
      const themeInfo = themeManager.getThemeInfo();
      this.setData({
        isDarkMode: themeInfo.isDarkMode,
        themeMode: themeInfo.themeMode,
        containerClass: `container ${themeInfo.isDarkMode ? 'dark' : 'light'}`
      });
      console.log('当前主题模式:', themeInfo.isDarkMode ? '深色' : '浅色');
    } catch (error) {
      console.error('获取主题失败:', error);
      // 设置默认值
      this.setData({
        isDarkMode: false,
        themeMode: 'light',
        containerClass: 'container light'
      });
    }
  },
  
  // 显示帮助信息
  showHelpInfo() {
    wx.showModal({
      title: '资质统计信息',
      content: `当前共有 ${this.data.qualifications.length} 项资质监控\n✅ 正常: ${this.data.validCount} 项\n⚠️ 即将到期: ${this.data.warningCount} 项\n❌ 已过期: ${this.data.expiredCount} 项`,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 增加次数
  increaseCount() {
    const currentCount = Number(this.data.newRecord.count) || 0;
    this.setData({
      'newRecord.count': currentCount + 1
    });
  },

  // 减少次数
  decreaseCount() {
    const currentCount = Number(this.data.newRecord.count) || 1;
    if (currentCount > 1) {
      this.setData({
        'newRecord.count': currentCount - 1
      });
    }
  },

  // 增加警告天数
  increaseWarningDays() {
    if (!this.data.currentQualification) return;
    const currentDays = Number(this.data.currentQualification.warningDays) || 30;
    this.updateWarningDays(currentDays + 1);
  },

  // 减少警告天数
  decreaseWarningDays() {
    if (!this.data.currentQualification) return;
    const currentDays = Number(this.data.currentQualification.warningDays) || 30;
    if (currentDays > 1) {
      this.updateWarningDays(currentDays - 1);
    }
  },

  // 更新警告天数的通用方法
  updateWarningDays(newDays: number) {
    if (!this.data.currentQualification) return;
    
    const currentQualId = this.data.currentQualification.id;
    
    // 更新当前资质的提醒天数
    const qualifications = this.data.qualifications.map(qual => {
      if (qual.id === currentQualId) {
        return {
          ...qual,
          warningDays: newDays
        };
      }
      return qual;
    });
    
    // 更新当前资质对象
    const updatedCurrentQualification = {
      ...this.data.currentQualification,
      warningDays: newDays
    };
    
    this.setData({ 
      qualifications,
      currentQualification: updatedCurrentQualification
    });
    
    // 保存数据并更新状态
    this.saveQualifications();
    this.updateQualificationStatus();
  },

  // 切换提醒状态
  toggleReminder() {
    if (!this.data.currentQualification) return;
    
    const newReminderState = !(this.data.currentQualification.reminderEnabled !== false);
    const currentQualId = this.data.currentQualification.id;
    
    // 更新当前资质的提醒状态
    const qualifications = this.data.qualifications.map(qual => {
      if (qual.id === currentQualId) {
        return {
          ...qual,
          reminderEnabled: newReminderState
        };
      }
      return qual;
    });
    
    // 更新当前资质对象
    const updatedCurrentQualification = {
      ...this.data.currentQualification,
      reminderEnabled: newReminderState
    };
    
    this.setData({
      qualifications,
      currentQualification: updatedCurrentQualification
    });
    
    // 保存数据
    this.saveQualifications();

    // 显示状态提示
    wx.showToast({
      title: newReminderState ? '提醒已开启' : '提醒已关闭',
      icon: 'success'
    });
  },

  // 显示删除记录确认
  showDeleteRecordConfirm(event: any) {
    const recordId = event.currentTarget.dataset.recordId;
    const qualification = this.data.currentQualification;
    
    if (!qualification) return;
    
    // 找到要删除的记录
    const recordToDelete = (qualification.records || []).find(record => record.id === recordId);
    if (!recordToDelete) return;
    
    wx.showModal({
      title: '确认删除记录',
      content: `确定要删除 ${recordToDelete.date} 的记录吗？\n删除后将重新计算资质状态。`,
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this.deleteRecord(event);
        }
      }
    });
  },

  updateQualificationStatus() {
    const today = new Date();
    const qualifications = this.data.qualifications.map(qual => {
      let status: 'valid' | 'warning' | 'expired' = 'valid';
      let daysRemaining = 0;
      let currentCount = 0;
      let calculatedExpiryDate = '';
      
      if (qual.mode === 'daily') {
        // X天Y次模式 - 只使用最新的3条记录进行计算
        const records = qual.records || [];
        const period = qual.dailyPeriod || 90;
        const required = qual.dailyRequired || 3;
        
        // 按日期排序，最新的在前面
        const sortedRecords = records.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // 累计最新的N次起落，找到对应的记录
        let accumulatedCount = 0;
        const recentRecordsForRequired: any[] = [];
        
        for (const record of sortedRecords) {
          const recordCount = Number(record.count) || 0;
          if (accumulatedCount + recordCount <= required) {
            // 这条记录的所有次数都需要
            recentRecordsForRequired.push(record);
            accumulatedCount += recordCount;
          } else if (accumulatedCount < required) {
            // 这条记录的部分次数需要
            recentRecordsForRequired.push(record);
            accumulatedCount = required;
            break;
          } else {
            break;
          }
        }
        
        currentCount = accumulatedCount;
        
        if (currentCount < required) {
          status = 'expired';
          daysRemaining = -1;
          calculatedExpiryDate = '不达标';
        } else {
          // 基于最新N次起落对应的记录，计算最早记录的到期时间
          if (recentRecordsForRequired.length > 0) {
            const oldestRecord = recentRecordsForRequired.sort((a: any, b: any) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )[0];
          
            if (oldestRecord) {
              const oldestDate = new Date(oldestRecord.date);
              const expiryDate = new Date(oldestDate.getTime() + period * 24 * 60 * 60 * 1000);
              daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              calculatedExpiryDate = this.formatDate(expiryDate);
              
              if (daysRemaining <= 0) {
                status = 'expired';
              } else if (daysRemaining <= (qual.warningDays || 30)) {
              status = 'warning';
            }
          }
        }
        }
        
      } else if (qual.mode === 'monthly') {
        // X月Y次模式 - 使用与日周期相同的"最新Y次"逻辑
        const records = qual.records || [];
        const period = (qual.monthlyPeriod || 12) * 30; // 转换为天数
        const required = qual.monthlyRequired || 2;
        
        // 按日期排序，最新的在前面
        const sortedRecords = records.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // 累计最新的Y次活动，找到对应的记录
        let accumulatedCount = 0;
        const recentRecordsForRequired: any[] = [];
        
        for (const record of sortedRecords) {
          const recordCount = Number(record.count) || 0;
          if (accumulatedCount + recordCount <= required) {
            // 这条记录的所有次数都需要
            recentRecordsForRequired.push(record);
            accumulatedCount += recordCount;
          } else if (accumulatedCount < required) {
            // 这条记录的部分次数需要
            recentRecordsForRequired.push(record);
            accumulatedCount = required;
            break;
          } else {
            break;
          }
        }
        
        currentCount = accumulatedCount;
        
        if (currentCount < required) {
          status = 'expired';
          daysRemaining = -1;
          calculatedExpiryDate = '不达标';
        } else {
          // 基于最新Y次对应的记录，计算最早记录的到期时间
          if (recentRecordsForRequired.length > 0) {
            const oldestRecord = recentRecordsForRequired.sort((a: any, b: any) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )[0];
            
            if (oldestRecord) {
              const oldestDate = new Date(oldestRecord.date);
              const expiryDate = new Date(oldestDate.getTime() + period * 24 * 60 * 60 * 1000);
              daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              calculatedExpiryDate = this.formatDate(expiryDate);
              
              if (daysRemaining <= 0) {
                status = 'expired';
              } else if (daysRemaining <= (qual.warningDays || 30)) {
                status = 'warning';
              }
            }
          }
        }
        
      } else if (qual.mode === 'expiry') {
        // 到期日期模式
        if (qual.expiryDate) {
        const expiryDate = new Date(qual.expiryDate);
          daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          calculatedExpiryDate = qual.expiryDate;
        
          if (daysRemaining <= 0) {
          status = 'expired';
          } else if (daysRemaining <= (qual.warningDays || 30)) {
          status = 'warning';
          }
        }
      }
      
      return { 
        ...qual, 
        status,
        daysRemaining,
        currentCount,
        calculatedExpiryDate
      };
    });
    
    // 计算统计数据
    const validCount = qualifications.filter(q => q.status === 'valid').length;
    const warningCount = qualifications.filter(q => q.status === 'warning').length;
    const expiredCount = qualifications.filter(q => q.status === 'expired').length;
    
    this.setData({ 
      qualifications,
      validCount,
      warningCount,
      expiredCount
    });
    this.saveQualifications();
  },

  // 显示模式选择
  showModeSelection() {
    this.setData({
      showModeSelectionSheet: true
    });
  },

  // 选择倒计时模式
  onModeSelect(event: any) {
    const selectedMode = event.detail.value;
    this.setData({
      selectedMode: selectedMode,
      showModeSelectionSheet: false,
      'newQualificationForm.mode': selectedMode
    });
    
    // 重置表单
    this.resetNewQualificationForm();
    
    // 显示创建弹窗
      this.setData({
      showAddPopup: true
    });
  },

  // 重置新建资质表单
  resetNewQualificationForm() {
    const today = new Date();
    const oneYearLater = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    this.setData({
      'newQualificationForm.name': '',
      'newQualificationForm.monthlyPeriod': 12,
      'newQualificationForm.monthlyRequired': 2,
      'newQualificationForm.dailyPeriod': 90,
      'newQualificationForm.dailyRequired': 3,
      'newQualificationForm.expiryDate': this.formatDate(oneYearLater),
      'newQualificationForm.warningDays': 30,
      'newQualificationForm.description': ''
    });
  },

  // 显示模板选择
  showTemplateSelection() {
    this.setData({
      showTemplateSheet: true
    });
  },

  // 选择模板
  onTemplateSelect(event: any) {
    console.log('模板选择事件:', event.detail);
    const templateIndex = event.detail.value;
    const template = this.data.qualificationTemplates[templateIndex];
    
    console.log('选中的模板索引:', templateIndex);
    console.log('选中的模板:', template);
    
    if (template) {
      const today = new Date();
      const oneYearLater = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
      
      this.setData({
        selectedMode: template.mode,
        'newQualificationForm.mode': template.mode,
        'newQualificationForm.name': template.name,
        'newQualificationForm.monthlyPeriod': template.monthlyPeriod || 12,
        'newQualificationForm.monthlyRequired': template.monthlyRequired || 1,
        'newQualificationForm.dailyPeriod': template.dailyPeriod || 90,
        'newQualificationForm.dailyRequired': template.dailyRequired || 3,
        'newQualificationForm.expiryDate': this.formatDate(oneYearLater),
        'newQualificationForm.warningDays': template.warningDays || 30,
        'newQualificationForm.description': template.description || '',
        showTemplateSheet: false,
        showAddPopup: true
      });
      
      console.log('模板数据已设置，显示创建弹窗');
    } else {
      console.error('未找到模板，索引:', templateIndex);
    }
  },

  closeTemplateSheet() {
    console.log('关闭模板选择弹窗');
    this.setData({
      showTemplateSheet: false
    });
  },

  closeModeSelectionSheet() {
    this.setData({
      showModeSelectionSheet: false
    });
  },

  // 表单输入处理
  onFormInput(event: any) {
    const field = event.currentTarget.dataset.field;
    const value = event.detail.value || event.detail || '';
    this.setData({
      [`newQualificationForm.${field}`]: value
    });
  },

  onFormNumberInput(event: any) {
    const field = event.currentTarget.dataset.field;
    const value = event.detail.value || event.detail || '';
    
    let processedValue: number | string;
    
    // 如果输入为空字符串，保持为空，允许用户继续输入
    if (value === '' || value === undefined) {
      processedValue = '';
    } else {
      const parsedValue = parseInt(String(value));
      // 如果是有效数字，设置为该数字，否则使用合理的默认值
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        processedValue = parsedValue;
      } else {
        // 为不同字段提供合理的默认值
        if (field === 'monthlyPeriod') {
          processedValue = 12;
        } else if (field === 'dailyPeriod') {
          processedValue = 90;
        } else if (field === 'monthlyRequired' || field === 'dailyRequired') {
          processedValue = 1;
        } else if (field === 'warningDays') {
          processedValue = 30;
        } else {
          processedValue = 1;
        }
      }
    }
    
    this.setData({
      [`newQualificationForm.${field}`]: processedValue
    });
  },

  // 显示到期日期选择器
  showExpiryDatePicker() {
    this.setData({
      showExpiryDatePicker: true
    });
  },

  closeExpiryDatePicker() {
    this.setData({
      showExpiryDatePicker: false
    });
  },

  // 选择到期日期
  selectExpiryDate(event: any) {
    const selectedExpiryDate = new Date(event.detail);
    const expiryDateStr = this.formatDate(selectedExpiryDate);
    
    this.setData({
      selectedExpiryDate: selectedExpiryDate,
      selectedExpiryDateStr: expiryDateStr,
      showExpiryDatePicker: false,
      'newQualificationForm.expiryDate': expiryDateStr
    });
  },

  // 保存新资质
  saveNewQualification() {
    const form = this.data.newQualificationForm;
    
    // 验证表单
    if (!form.name) {
      wx.showToast({
        title: '请输入资质名称',
        icon: 'none'
      });
      return;
    }
    
    if (form.mode === 'expiry' && !form.expiryDate) {
      wx.showToast({
        title: '请选择到期日期',
        icon: 'none'
      });
      return;
    }
    
    // 处理数字字段，确保空值使用默认值
    const monthlyPeriod = (typeof form.monthlyPeriod === 'string' && form.monthlyPeriod === '') ? 12 : Number(form.monthlyPeriod || 12);
    const monthlyRequired = (typeof form.monthlyRequired === 'string' && form.monthlyRequired === '') ? 1 : Number(form.monthlyRequired || 1);
    const dailyPeriod = (typeof form.dailyPeriod === 'string' && form.dailyPeriod === '') ? 90 : Number(form.dailyPeriod || 90);
    const dailyRequired = (typeof form.dailyRequired === 'string' && form.dailyRequired === '') ? 3 : Number(form.dailyRequired || 3);
    const warningDays = (typeof form.warningDays === 'string' && form.warningDays === '') ? 30 : Number(form.warningDays || 30);

  // 创建新资质
    const newQualification: QualificationItem = {
      id: 'qual_' + Date.now(),
      name: form.name,
      mode: form.mode as any,
      warningDays: warningDays,
      reminderEnabled: true, // 默认开启提醒
      description: form.description,
      status: 'valid',
      records: []
    };

    // 根据模式设置参数
    if (form.mode === 'monthly') {
      newQualification.monthlyPeriod = monthlyPeriod;
      newQualification.monthlyRequired = monthlyRequired;
      newQualification.currentCount = 0;
    } else if (form.mode === 'daily') {
      newQualification.dailyPeriod = dailyPeriod;
      newQualification.dailyRequired = dailyRequired;
      newQualification.currentCount = 0;
    } else if (form.mode === 'expiry') {
      newQualification.expiryDate = form.expiryDate;
    }
    
    const qualifications = [...this.data.qualifications, newQualification];
    this.setData({ qualifications });
    this.saveQualifications();
    this.updateQualificationStatus();
    
    wx.showToast({
      title: '创建成功',
      icon: 'success'
    });
    
    this.closeAddPopup();
  },

  closeAddPopup() {
    this.setData({
      showAddPopup: false,
      selectedMode: '',
      currentQualification: null
    });
  },

  // 显示记录弹窗
  showRecordPopup(event: any) {
    const id = event.currentTarget.dataset.id;
    
    // 先更新状态确保数据最新
    this.updateQualificationStatus();
    
    const qualification = this.data.qualifications.find(q => q.id === id);
    
    if (qualification) {
      this.setData({
        currentQualification: qualification,
        showRecordPopup: true
      });
      
      // 更新显示记录
      this.updateDisplayRecords(qualification);
      
      // 重置表单
      this.setData({
        'newRecord.date': this.data.selectedDateStr,
        'newRecord.count': 1
      });
    }
  },

  closeRecordPopup() {
    this.setData({ 
      showRecordPopup: false, 
      currentQualification: null,
      'newRecord.date': '',
      'newRecord.count': 1
    });
    
    // 关闭弹窗时刷新状态
    this.updateQualificationStatus();
  },

  // 日期选择
  showDatePicker() {
    this.setData({ 
      showDatePicker: true 
    });
  },

  closeDatePicker() {
    this.setData({
      showDatePicker: false
    });
  },

  selectDate(event: any) {
    const selectedDate = new Date(event.detail);
      this.setData({
        selectedDate: selectedDate,
      selectedDateStr: this.formatDate(selectedDate),
      selectedDateTimestamp: selectedDate.getTime(),
      showDatePicker: false,
      'newRecord.date': this.formatDate(selectedDate)
    });
  },

  onCountInput(event: any) {
    const value = event.detail || event.detail.value || event.target.value;
    
    // 如果输入为空字符串，保持为空，允许用户继续输入
    if (value === '' || value === undefined) {
      this.setData({
        'newRecord.count': ''
      });
      } else {
      const count = parseInt(String(value));
      // 如果是有效数字，设置为该数字，否则保持当前值
      if (!isNaN(count) && count >= 0) {
        this.setData({
          'newRecord.count': count
        });
      }
    }
  },

  // 处理提醒状态开关
  onReminderToggle(event: any) {
    if (!this.data.currentQualification) return; // 防止null访问
    
    const reminderEnabled = event.detail;
    const currentQualId = this.data.currentQualification.id; // 提取ID避免重复访问
    
    // 更新当前资质的提醒状态
    const qualifications = this.data.qualifications.map(qual => {
      if (qual.id === currentQualId) {
        return {
          ...qual,
          reminderEnabled: reminderEnabled
        };
      }
      return qual;
    });
    
    // 更新当前资质对象
    const updatedCurrentQualification = {
      ...this.data.currentQualification,
      reminderEnabled: reminderEnabled
    };
    
      this.setData({
      qualifications,
      currentQualification: updatedCurrentQualification
    });
    
    // 保存数据
    this.saveQualifications();

    // 显示状态提示
    wx.showToast({
      title: reminderEnabled ? '提醒已开启' : '提醒已关闭',
      icon: 'success'
    });
  },

  // 处理提醒天数输入
  onWarningDaysInput(event: any) {
    if (!this.data.currentQualification) return; // 防止null访问
    
    const value = event.detail.value || event.detail || '';
    const currentQualId = this.data.currentQualification.id; // 提取ID避免重复访问
    const currentWarningDays = this.data.currentQualification.warningDays;
    
    let warningDays: number;
    
    // 如果输入为空字符串，使用默认值30
    if (value === '' || value === undefined) {
      warningDays = 30;
    } else {
      const parsedValue = parseInt(String(value));
      // 如果是有效数字，设置为该数字，否则保持当前值
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        warningDays = parsedValue;
      } else {
        // 如果输入无效，保持之前的值或默认值
        warningDays = currentWarningDays || 30;
      }
    }
    
    // 更新当前资质的提醒天数
    const qualifications = this.data.qualifications.map(qual => {
      if (qual.id === currentQualId) {
        return {
          ...qual,
          warningDays: warningDays
        };
      }
      return qual;
    });
    
    // 更新当前资质对象
    const updatedCurrentQualification = {
      ...this.data.currentQualification,
      warningDays: value === '' ? '' as any : warningDays // 界面显示保持用户输入状态
    };
    
    this.setData({ 
      qualifications,
      currentQualification: updatedCurrentQualification
    });
    
    // 保存数据并更新状态
    this.saveQualifications();
    this.updateQualificationStatus();
  },

  // 添加记录
  addRecord() {
    const qualification = this.data.currentQualification;
    const newRecord = this.data.newRecord;
    
    if (!qualification || !newRecord.date) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    // 对于到期日期模式，直接设置到期日期
    if (qualification.mode === 'expiry') {
      const qualifications = this.data.qualifications.map(qual => {
        if (qual.id === qualification.id) {
          return {
            ...qual,
            expiryDate: newRecord.date
          };
        }
        return qual;
      });
      
      this.setData({ qualifications });
      this.saveQualifications();
      
      // 更新状态
      this.updateQualificationStatus();
      
      // 获取更新后的当前资质对象
      const updatedQualification = this.data.qualifications.find(q => q.id === qualification.id);
      if (updatedQualification) {
        this.setData({
          currentQualification: updatedQualification
        });
      }
      
      // 不关闭弹窗，让用户继续在当前界面查看
      wx.showToast({
        title: '到期时间设置成功',
        icon: 'success'
      });
      return;
    }
    
    // 对于其他模式，验证次数
    let count: number;
    if (newRecord.count === '' || newRecord.count === undefined || newRecord.count === null) {
      wx.showToast({
        title: '请输入次数',
          icon: 'none'
        });
        return;
      }
    
    count = parseInt(String(newRecord.count));
    if (isNaN(count) || count <= 0) {
      wx.showToast({
        title: '请输入有效的次数（大于0）',
        icon: 'none'
      });
      return;
    }
    
    // 添加记录
    const recordWithId: QualificationRecord = {
      id: 'record_' + Date.now(),
      date: newRecord.date,
      count: count  // count已经是验证过的number类型
    };

    // 更新资质记录
    const qualifications = this.data.qualifications.map(qual => {
      if (qual.id === qualification.id) {
        const updatedRecords = [recordWithId, ...(qual.records || [])];
        
        // 只保留最新的3条记录
        const limitedRecords = updatedRecords.slice(0, 3);
        
        return {
          ...qual,
          records: limitedRecords,
          lastDate: newRecord.date
        };
      }
      return qual;
    });

    this.setData({ qualifications });
    this.saveQualifications();
    
    // 先更新状态，这会重新计算所有资质的状态信息
    this.updateQualificationStatus();
    
    // 然后获取更新后的当前资质对象（包含最新的状态信息）
    const updatedQualification = this.data.qualifications.find(q => q.id === qualification.id);
    if (updatedQualification) {
    this.setData({ 
        currentQualification: updatedQualification
      });
      
      this.updateDisplayRecords(updatedQualification);
    }
    
    // 重置表单 - 延迟执行，确保界面更新完成
    setTimeout(() => {
    this.setData({
        'newRecord.date': this.data.selectedDateStr,
        'newRecord.count': 1
      });
    }, 100);
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  // 删除资质
  deleteQualification(event: any) {
    const id = event.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个资质项目吗？',
      success: (res) => {
        if (res.confirm) {
          const qualifications = this.data.qualifications.filter(qual => qual.id !== id);
          this.setData({ qualifications });
          this.saveQualifications();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 确认删除资质（从弹窗中删除）
  confirmDeleteQualification(event: any) {
    const id = event.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个资质项目吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          const qualifications = this.data.qualifications.filter(qual => qual.id !== id);
          this.setData({ qualifications });
          this.saveQualifications();
          
          // 关闭弹窗
          this.closeRecordPopup();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 删除记录
  deleteRecord(event: any) {
    const recordId = event.currentTarget.dataset.recordId;
    const qualification = this.data.currentQualification;
    
    if (!qualification) return;
    
    // 找到要删除的记录
    const recordToDelete = (qualification.records || []).find(record => record.id === recordId);
    if (!recordToDelete) return;
    
    wx.showModal({
      title: '确认删除记录',
      content: `确定要删除 ${recordToDelete.date} 的记录吗？\n删除后将重新计算资质状态。`,
      confirmText: '删除',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          // 更新资质记录
          const qualifications = this.data.qualifications.map(qual => {
            if (qual.id === qualification.id) {
              const updatedRecords = (qual.records || []).filter(record => record.id !== recordId);
              
              // 更新最后日期
              let lastDate = '';
              if (updatedRecords.length > 0) {
                const sortedRecords = updatedRecords.sort((a, b) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                lastDate = sortedRecords[0].date;
              }
              
              return {
                ...qual,
                records: updatedRecords,
                lastDate: lastDate
              };
            }
            return qual;
          });
          
          this.setData({ qualifications });
          this.saveQualifications();
          
          // 先更新状态，这会重新计算所有资质的状态信息
          this.updateQualificationStatus();
          
          // 然后获取更新后的当前资质对象（包含最新的状态信息）
          const updatedQualification = this.data.qualifications.find(q => q.id === qualification.id);
          if (updatedQualification) {
          this.setData({ 
              currentQualification: updatedQualification
            });
            
            this.updateDisplayRecords(updatedQualification);
          }
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清空所有历史记录
  clearAllRecords() {
    const qualification = this.data.currentQualification;
    
    if (!qualification || !qualification.records || qualification.records.length === 0) return;
    
    wx.showModal({
      title: '确认清空',
      content: `确定要清空 ${qualification.name} 的所有历史记录吗？\n这将删除 ${qualification.records.length} 条记录，操作不可恢复。`,
      confirmText: '清空',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          // 更新资质记录
          const qualifications = this.data.qualifications.map(qual => {
            if (qual.id === qualification.id) {
              return {
                ...qual,
                records: [],
                lastDate: '',
                currentCount: 0
              };
            }
            return qual;
          });
          
          this.setData({ qualifications });
          this.saveQualifications();
          
          // 先更新状态，这会重新计算所有资质的状态信息
          this.updateQualificationStatus();
          
          // 然后获取更新后的当前资质对象（包含最新的状态信息）
          const updatedQualification = this.data.qualifications.find(q => q.id === qualification.id);
          if (updatedQualification) {
            this.setData({ 
              currentQualification: updatedQualification
            });
            
            this.updateDisplayRecords(updatedQualification);
          }
          
          wx.showToast({
            title: '已清空历史记录',
            icon: 'success'
          });
        }
      }
    });
  },

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    const monthPadded = month.length === 1 ? '0' + month : month;
    const dayPadded = day.length === 1 ? '0' + day : day;
    return `${year}-${monthPadded}-${dayPadded}`;
  },

  updateDisplayRecords(qualification: QualificationItem) {
    const records = qualification.records || [];
    // 按日期排序，最新的在前面，只显示最近3条
    const sortedRecords = records.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 3);
    
    this.setData({
      displayRecords: sortedRecords
    });
  },

  onShareAppMessage() {
    return {
      title: 'FlightToolbox - 资质管理',
      path: '/packageO/qualification-manager/index'
    };
  },

  onShareTimeline() {
    return {
      title: 'FlightToolbox - 资质管理'
    };
  },

}); 