// 事件信息填报主页面
Page({
  data: {
    // 基本状态
    loading: false,
    
    // 个人信息预设
    personalInfo: {
      department: '', // 飞行分部
      name: '', // 姓名
      license: '' // 执照号
    },
    
    // 显示个人信息设置弹窗
    showPersonalInfoModal: false,
    
    // 显示事件信息填报说明弹窗
    showReportGuideModal: false,
    
    // 事件类型示例
    eventExamples: [
      {
        title: 'TCAS RA警告',
        description: '空中交通警戒与防撞系统决断性建议',
        icon: '🔴'
      },
      {
        title: '发动机喘振',
        description: '发动机压缩机失速现象',
        icon: '⚡'
      },
      {
        title: '设备故障',
        description: '各类机载设备异常或故障',
        icon: '⚠️'
      },
      {
        title: '天气偏离',
        description: '因天气原因的运行偏离',
        icon: '🌩️'
      }
    ]
  },

  onLoad: function() {
    this.loadPersonalInfo();
  },

  // 加载个人信息
  loadPersonalInfo: function() {
    try {
      var storedInfo = wx.getStorageSync('event_report_personal_info') || {};
      // 确保保持完整的数据结构，合并存储的数据和默认数据
      var personalInfo = {
        department: storedInfo.department || '',
        name: storedInfo.name || '',
        license: storedInfo.license || ''
      };
      this.setData({ personalInfo: personalInfo });
    } catch (error) {
      console.error('加载个人信息失败:', error);
    }
  },

  // 保存个人信息
  savePersonalInfo: function() {
    try {
      wx.setStorageSync('event_report_personal_info', this.data.personalInfo);
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      this.setData({ showPersonalInfoModal: false });
    } catch (error) {
      console.error('保存个人信息失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  // 设置个人信息
  setPersonalInfo: function() {
    this.setData({ showPersonalInfoModal: true });
  },

  // 关闭个人信息弹窗
  closePersonalInfoModal: function() {
    this.setData({ showPersonalInfoModal: false });
  },

  // 个人信息输入处理
  onPersonalInfoInput: function(e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value || '';
    // 创建新的对象副本，确保所有值都是字符串
    var personalInfo = {
      department: this.data.personalInfo.department || '',
      name: this.data.personalInfo.name || '',
      license: this.data.personalInfo.license || ''
    };
    personalInfo[field] = value;
    this.setData({
      personalInfo: personalInfo
    });
  },

  // 开始事件信息填报
  startEventReport: function() {
    var self = this;
    if (!this.validatePersonalInfo()) {
      wx.showModal({
        title: '提示',
        content: '请先设置个人信息',
        confirmText: '去设置',
        success: function(res) {
          if (res.confirm) {
            self.setPersonalInfo();
          }
        }
      });
      return;
    }
    
    wx.navigateTo({
      url: '/packageO/event-report/initial-report'
    });
  },


  // 验证个人信息
  validatePersonalInfo: function() {
    var personalInfo = this.data.personalInfo;
    // 只要求填写部门和姓名，执照号为可选
    return !!(personalInfo.department && personalInfo.name);
  },




  // 查看填报指南
  viewReportGuide: function() {
    this.setData({ showReportGuideModal: true });
  },

  // 关闭填报指南弹窗
  closeReportGuideModal: function() {
    this.setData({ showReportGuideModal: false });
  },

  // 转发功能
  onShareAppMessage: function() {
    return {
      title: '航空事件信息填报助手',
      desc: '专业的航空事件信息填报工具',
      path: '/packageO/event-report/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '航空事件信息填报助手 - 专业事件填报工具',
      query: 'from=timeline'
    };
  }
});