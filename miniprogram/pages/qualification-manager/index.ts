// 资质管理页面
interface QualificationItem {
  id: string;
  name: string;
  type: 'landing' | 'training' | 'certificate' | 'medical' | 'language';
  lastDate?: string;        // 最后一次完成日期
  expiryDate?: string;      // 到期日期
  validityDays?: number;    // 有效期天数
  count?: number;           // 计数（如起落次数）
  requiredCount?: number;   // 要求次数
  status: 'valid' | 'warning' | 'expired';
  warningDays?: number;     // 提前警告天数
  description?: string;     // 描述
  records?: QualificationRecord[];  // 记录列表
  daysRemaining?: number;   // 剩余天数（新增）
}

interface QualificationRecord {
  id: string;
  date: string;
  count?: number | string;
}

Page({
  data: {
    qualifications: [] as QualificationItem[],
    
    // 弹窗控制
    showAddPopup: false,
    showRecordPopup: false,
    showDatePicker: false,
    showExpiryDatePicker: false, // 新增：到期日期选择器
    
    // 表单数据
    currentQualification: null as QualificationItem | null,
    newRecord: {
      date: '',
      count: 1
    } as QualificationRecord,
    landingExpiryInfo: {
      oldestDate: '',
      expiryDateStr: '',
      daysRemaining: 0,
      isValid: false,
      totalCount: 0
    },
    
    // 显示用的记录（只显示最近3条）
    displayRecords: [] as QualificationRecord[],
    
    // 日期选择
    selectedDate: new Date(),
    selectedDateStr: '',
    selectedDateTimestamp: Date.now(),
    selectedExpiryDate: new Date(), // 新增：到期日期
    selectedExpiryDateStr: '',      // 新增：到期日期字符串
    minDate: new Date(2020, 0, 1).getTime(),
    maxDate: new Date(2040, 11, 31).getTime(), // 扩展到2040年
    
    // 资质类型选择
    showQualificationTypeSheet: false,
    qualificationTypes: [
      { name: '90天3次起落', value: 'landing', type: 'landing' },
      { name: '复训', value: 'training', type: 'training' },
      { name: '体检', value: 'medical', type: 'medical' },
      { name: 'ICAO英语等级', value: 'icao_english', type: 'language' },
      { name: '危险品培训', value: 'dangerous_goods', type: 'certificate' },
      { name: '机型检查', value: 'aircraft_check', type: 'training' },
      { name: '仪表等级', value: 'instrument_rating', type: 'certificate' }
    ],
    selectedQualificationType: null as any
  },

  onLoad() {
    this.loadQualifications();
    this.initDefaultDate();
    // 确保newRecord初始化正确
    this.setData({
      'newRecord.date': '',
      'newRecord.count': ''
    });
  },

  onShow() {
    // 每次显示页面时刷新倒计时
    this.updateQualificationStatus();
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
      'newRecord.date': this.formatDate(today)
    });
  },

  // 加载资质数据
  loadQualifications() {
    try {
      let qualifications = wx.getStorageSync('pilot_qualifications') || [];
      
      // 如果是第一次使用，添加演示数据
      if (qualifications.length === 0) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
        const oneYearLater = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
        const sixMonthsLater = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000);
        
        qualifications = [
          {
            id: 'demo_landing',
            name: '90天3次起落',
            type: 'landing',
            requiredCount: 3,
            validityDays: 90,
            warningDays: 30,
            description: '90天内需要完成3次起落',
            status: 'valid',
            records: [
              {
                id: 'record1',
                date: this.formatDate(sixtyDaysAgo),
                count: 2
              },
              {
                id: 'record2',
                date: this.formatDate(thirtyDaysAgo),
                count: 1
              }
            ],
            lastDate: this.formatDate(thirtyDaysAgo)
          },
          {
            id: 'demo_medical',
            name: '体检',
            type: 'medical',
            validityDays: 365,
            warningDays: 60,
            description: '体检有效期1年',
            status: 'valid',
            expiryDate: this.formatDate(oneYearLater),
            records: []
          },
          {
            id: 'demo_english',
            name: 'ICAO英语等级',
            type: 'language',
            validityDays: 1095, // 3年
            warningDays: 90,
            description: 'ICAO英语等级有效期3年',
            status: 'valid',
            expiryDate: this.formatDate(new Date(today.getTime() + 1095 * 24 * 60 * 60 * 1000)),
            records: []
          },
          {
            id: 'demo_training',
            name: '复训',
            type: 'training',
            validityDays: 180, // 6个月
            warningDays: 30,
            description: '复训有效期6个月',
            status: 'valid',
            expiryDate: this.formatDate(sixMonthsLater),
            records: []
          }
        ];
        
        // 保存演示数据
        wx.setStorageSync('pilot_qualifications', qualifications);
      }
      
      // 清理超过3条的历史记录
      const cleanedQualifications = qualifications.map((qual: QualificationItem) => {
        if (qual.records && qual.records.length > 3) {
          // 按日期排序并只保留最新3条
          const sortedRecords = qual.records.sort((a: QualificationRecord, b: QualificationRecord) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ).slice(0, 3);
          
          return { ...qual, records: sortedRecords };
        }
        return qual;
      });
      
      this.setData({ qualifications: cleanedQualifications });
      this.updateQualificationStatus();
      
      // 如果进行了清理，保存到存储
      if (JSON.stringify(cleanedQualifications) !== JSON.stringify(qualifications)) {
        this.saveQualifications();
      }
    } catch (error) {
      console.error('加载资质数据失败:', error);
    }
  },

  // 保存资质数据
  saveQualifications() {
    try {
      wx.setStorageSync('pilot_qualifications', this.data.qualifications);
    } catch (error) {
      console.error('保存资质数据失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  // 更新资质状态
  updateQualificationStatus() {
    const today = new Date();
    const qualifications = this.data.qualifications.map(qual => {
      let status: 'valid' | 'warning' | 'expired' = 'valid';
      let daysRemaining = 0;
      
      if (qual.type === 'landing') {
        // 90天3次起落检查
        const records = qual.records || [];
        const recentRecords = records.filter(record => {
          const recordDate = new Date(record.date);
          const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 90;
        });
        
        const totalCount = recentRecords.reduce((sum, record) => sum + (Number(record.count) || 0), 0);
        qual.count = totalCount;
        
        if (totalCount < (qual.requiredCount || 3)) {
          status = 'expired';
          daysRemaining = -1; // 表示不满足要求
        } else {
          // 计算到期日期（最早记录的90天后）
          const oldestRecord = recentRecords.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )[0];
          
          if (oldestRecord) {
            const oldestDate = new Date(oldestRecord.date);
            const expiryDate = new Date(oldestDate.getTime() + 90 * 24 * 60 * 60 * 1000);
            daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysRemaining <= 0) {
              status = 'expired';
            } else if (daysRemaining <= (qual.warningDays || 30)) {
              status = 'warning';
            }
          }
        }
      } else {
        // 其他资质类型基于到期日期检查
        if (qual.expiryDate) {
          const expiryDate = new Date(qual.expiryDate);
          daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
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
        daysRemaining 
      };
    });
    
    this.setData({ qualifications });
    this.saveQualifications();
  },

  // 显示添加资质弹窗
  showAddQualification() {
    this.setData({
      showQualificationTypeSheet: true
    });
  },

  // 选择资质类型
  onQualificationTypeSelect(event: any) {
    const selectedValue = event.detail.value;
    const selectedType = this.data.qualificationTypes.find(type => type.value === selectedValue);
    
    if (selectedType) {
      this.setData({
        selectedQualificationType: selectedType,
        showQualificationTypeSheet: false
      });
      
      this.createNewQualification(selectedType);
    }
  },

  // 创建新资质
  createNewQualification(typeInfo: any) {
    const id = 'qual_' + Date.now();
    let newQualification: QualificationItem;
    
    switch (typeInfo.value) {
      case 'landing':
        newQualification = {
          id,
          name: '90天3次起落',
          type: 'landing',
          requiredCount: 3,
          validityDays: 90,
          warningDays: 30,
          description: '90天内需要完成3次起落',
          status: 'expired',
          records: []
        };
        break;
      case 'training':
        newQualification = {
          id,
          name: '复训',
          type: 'training',
          validityDays: 180,
          warningDays: 30,
          description: '复训有效期6个月',
          status: 'valid',
          expiryDate: '',
          records: []
        };
        break;
      case 'medical':
        newQualification = {
          id,
          name: '体检',
          type: 'medical',
          validityDays: 365,
          warningDays: 60,
          description: '体检有效期1年',
          status: 'valid',
          expiryDate: '',
          records: []
        };
        break;
      case 'icao_english':
        newQualification = {
          id,
          name: 'ICAO英语等级',
          type: 'language',
          validityDays: 1095,
          warningDays: 90,
          description: 'ICAO英语等级有效期3年',
          status: 'valid',
          expiryDate: '',
          records: []
        };
        break;
      case 'dangerous_goods':
        newQualification = {
          id,
          name: '危险品培训',
          type: 'certificate',
          validityDays: 730,
          warningDays: 60,
          description: '危险品培训有效期2年',
          status: 'valid',
          expiryDate: '',
          records: []
        };
        break;
      case 'aircraft_check':
        newQualification = {
          id,
          name: '机型检查',
          type: 'training',
          validityDays: 365,
          warningDays: 60,
          description: '机型检查有效期1年',
          status: 'valid',
          expiryDate: '',
          records: []
        };
        break;
      case 'instrument_rating':
        newQualification = {
          id,
          name: '仪表等级',
          type: 'certificate',
          validityDays: 365,
          warningDays: 60,
          description: '仪表等级有效期1年',
          status: 'valid',
          expiryDate: '',
          records: []
        };
        break;
      default:
        return;
    }
    
    this.setData({
      currentQualification: newQualification,
      showAddPopup: true
    });
  },

  // 关闭资质类型选择
  closeQualificationTypeSheet() {
    this.setData({
      showQualificationTypeSheet: false
    });
  },

  // 显示记录弹窗
  showRecordPopup(event: any) {
    const id = event.currentTarget.dataset.id;
    const qualification = this.data.qualifications.find(q => q.id === id);
    
    if (qualification) {
      this.setData({
        currentQualification: qualification,
        showRecordPopup: true
      });
      
      // 计算起落资质的到期信息
      if (qualification.type === 'landing') {
        this.calculateLandingExpiryInfo(qualification);
      }
      
      // 更新显示记录
      this.updateDisplayRecords(qualification);
      
      // 重置表单
      this.setData({
        'newRecord.date': this.data.selectedDateStr,
        'newRecord.count': qualification.type === 'landing' ? '' : undefined
      });
    }
  },

  // 关闭弹窗
  closeAddPopup() {
    this.setData({
      showAddPopup: false,
      currentQualification: null
    });
  },

  closeRecordPopup() {
    this.setData({
      showRecordPopup: false,
      currentQualification: null,
      'newRecord.date': '',
      'newRecord.count': ''
    });
  },

  // 显示日期选择器
  showDatePicker() {
    this.setData({
      showDatePicker: true
    });
  },

  // 显示到期日期选择器
  showExpiryDatePicker() {
    this.setData({
      showExpiryDatePicker: true
    });
  },

  // 关闭日期选择器
  closeDatePicker() {
    this.setData({
      showDatePicker: false
    });
  },

  // 关闭到期日期选择器
  closeExpiryDatePicker() {
    this.setData({
      showExpiryDatePicker: false
    });
  },

  // 确认选择日期
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

  // 选择到期日期
  selectExpiryDate(event: any) {
    const selectedExpiryDate = new Date(event.detail);
    const expiryDateStr = this.formatDate(selectedExpiryDate);
    
    this.setData({
      selectedExpiryDate: selectedExpiryDate,
      selectedExpiryDateStr: expiryDateStr,
      showExpiryDatePicker: false,
      'currentQualification.expiryDate': expiryDateStr
    });
  },

  // 输入处理
  onCountInput(event: any) {
    const count = event.detail.value;
    this.setData({
      'newRecord.count': count
    });
  },

  onExpiryDateInput(event: any) {
    const expiryDate = event.detail.value;
    this.setData({
      'currentQualification.expiryDate': expiryDate
    });
  },

  // 保存新资质
  saveNewQualification() {
    const qualification = this.data.currentQualification;
    if (!qualification) return;
    
    // 验证到期日期
    if (qualification.type !== 'landing' && !qualification.expiryDate) {
      wx.showToast({
        title: '请选择到期日期',
        icon: 'none'
      });
      return;
    }
    
    const qualifications = [...this.data.qualifications, qualification];
    this.setData({ qualifications });
    this.saveQualifications();
    this.updateQualificationStatus();
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    this.closeAddPopup();
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
    
    // 验证起落次数
    if (qualification.type === 'landing') {
      const count = parseInt(newRecord.count as string);
      if (!count || count <= 0) {
        wx.showToast({
          title: '请输入有效的起落次数',
          icon: 'none'
        });
        return;
      }
      newRecord.count = count;
    }
    
    // 添加记录ID
    const recordWithId: QualificationRecord = {
      ...newRecord,
      id: 'record_' + Date.now()
    };
    
    // 更新资质记录
    const qualifications = this.data.qualifications.map(qual => {
      if (qual.id === qualification.id) {
        const updatedRecords = [recordWithId, ...(qual.records || [])];
        
        // 只保留最近3条记录
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
    this.updateQualificationStatus();
    
    // 更新当前资质对象
    const updatedQualification = qualifications.find(q => q.id === qualification.id);
    if (updatedQualification) {
      this.setData({
        currentQualification: updatedQualification
      });
      
      if (updatedQualification.type === 'landing') {
        this.calculateLandingExpiryInfo(updatedQualification);
      }
      
      this.updateDisplayRecords(updatedQualification);
    }
    
    // 重置表单
    this.setData({
      'newRecord.date': this.data.selectedDateStr,
      'newRecord.count': qualification.type === 'landing' ? '' : undefined
    });
    
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

  // 删除单条记录
  deleteRecord(event: any) {
    const recordId = event.currentTarget.dataset.recordId;
    const qualification = this.data.currentQualification;
    
    if (!qualification) return;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
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
          this.updateQualificationStatus();
          
          // 更新当前资质对象
          const updatedQualification = qualifications.find(q => q.id === qualification.id);
          if (updatedQualification) {
            this.setData({
              currentQualification: updatedQualification
            });
            
            if (updatedQualification.type === 'landing') {
              this.calculateLandingExpiryInfo(updatedQualification);
            }
            
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

  // 格式化日期
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 计算起落资质过期信息
  calculateLandingExpiryInfo(qualification: QualificationItem) {
    const today = new Date();
    const records = qualification.records || [];
    
    // 筛选90天内的记录
    const recentRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 90;
    });
    
    const totalCount = recentRecords.reduce((sum, record) => sum + (Number(record.count) || 0), 0);
    const isValid = totalCount >= (qualification.requiredCount || 3);
    
    let oldestDate = '';
    let expiryDateStr = '';
    let daysRemaining = 0;
    
    if (isValid && recentRecords.length > 0) {
      // 找到最早的记录
      const sortedRecords = recentRecords.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      oldestDate = sortedRecords[0].date;
      
      // 计算到期日期（最早记录的90天后）
      const oldestRecordDate = new Date(oldestDate);
      const expiryDate = new Date(oldestRecordDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      expiryDateStr = this.formatDate(expiryDate);
      
      // 计算剩余天数
      daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    this.setData({
      landingExpiryInfo: {
        oldestDate,
        expiryDateStr,
        daysRemaining: Math.max(0, daysRemaining),
        isValid,
        totalCount
      }
    });
  },

  // 计算剩余天数
  getDaysRemaining(qualification: QualificationItem): number {
    if (qualification.type === 'landing') {
      return qualification.daysRemaining || 0;
    } else if (qualification.expiryDate) {
      const today = new Date();
      const expiryDate = new Date(qualification.expiryDate);
      return Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  },

  // 获取状态文本
  getStatusText(qualification: QualificationItem): string {
    const daysRemaining = this.getDaysRemaining(qualification);
    
    if (qualification.type === 'landing') {
      if (qualification.status === 'expired') {
        return '不满足要求';
      } else if (qualification.status === 'warning') {
        return `${daysRemaining}天后到期`;
      } else {
        return `${daysRemaining}天后到期`;
      }
    } else {
      if (qualification.status === 'expired') {
        return '已过期';
      } else if (qualification.status === 'warning') {
        return `${daysRemaining}天后到期`;
      } else {
        return `${daysRemaining}天后到期`;
      }
    }
  },

  // 更新显示记录（只显示最近3条）
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

  // 分享功能
  onShareAppMessage() {
    return {
      title: 'FlightToolbox - 资质管理',
      path: '/pages/qualification-manager/index'
    };
  },

  onShareTimeline() {
    return {
      title: 'FlightToolbox - 资质管理'
    };
  }
}); 