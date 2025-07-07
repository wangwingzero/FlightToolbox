// 国际通信失效程序页面逻辑
const communicationFailureProcedure = require('../../../data/communication_failure/communication_failure_procedure.js');

Page({
  data: {
    isDarkMode: false,
    procedureData: {},
    selectedWeather: 'vmc', // 'vmc' or 'imc'
    selectedSeparation: 'procedural' // 'procedural' or 'surveillance'
  },

  onLoad() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '国际通信失效程序'
    });
    
    // 加载程序数据
    this.loadProcedureData();
    
    // 检查主题状态
    this.checkThemeStatus();
  },

  onShow() {
    // 每次显示页面时检查主题状态
    this.checkThemeStatus();
  },

  // 加载程序数据
  loadProcedureData() {
    if (communicationFailureProcedure && communicationFailureProcedure.communicationFailureProcedure) {
      this.setData({
        procedureData: communicationFailureProcedure.communicationFailureProcedure
      });
    } else {
      console.error('无法加载国际通信失效程序数据');
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },

  // 检查主题状态
  checkThemeStatus() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
  },

  // 设置应答机
  setTransponder() {
    wx.showModal({
      title: '应答机设置提醒',
      content: '请立即将应答机设置为：\n\n模式 A，编码 7600\n\n同时利用所有可供使用的手段发送紧急和/或紧迫信号。',
      showCancel: false,
      confirmText: '已设置'
    });
  },


  // 复制程序
  copyProcedure() {
    const procedureText = this.generateProcedureText();
    wx.setClipboardData({
      data: procedureText,
      success: () => {
        wx.showToast({
          title: '程序已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  // 生成程序文本
  generateProcedureText() {
    const data = this.data.procedureData;
    let text = `国际通信失效程序\n${data.document}\n\n`;
    
    text += `一般程序：\n`;
    text += `• 应答机编码：${data.general_procedures.transponder_code}\n`;
    text += `• ADS-B/ADS-C：${data.general_procedures.ads_b_ads_c}\n\n`;
    
    if (this.data.selectedWeather === 'vmc') {
      text += `VMC条件下：\n`;
      data.action_by_aircraft.vfr_conditions.steps.forEach((step: string, index: number) => {
        text += `${index + 1}. ${step}\n`;
      });
    } else {
      text += `IMC条件下：\n`;
      if (this.data.selectedSeparation === 'procedural') {
        text += `程序间隔：${data.action_by_aircraft.imc_conditions.steps.speed_and_level.procedural_separation}\n`;
      } else {
        text += `ATS监视：${data.action_by_aircraft.imc_conditions.steps.speed_and_level.ats_surveillance}\n`;
      }
      text += `航路：${data.action_by_aircraft.imc_conditions.steps.route}\n`;
      text += `下降和进近：${data.action_by_aircraft.imc_conditions.steps.descent_and_approach}\n`;
      text += `着陆：${data.action_by_aircraft.imc_conditions.steps.landing}\n`;
    }
    
    return text;
  },

  // 选择气象条件
  selectWeather(e: any) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedWeather: type
    });
  },

  // 选择间隔类型
  selectSeparation(e: any) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedSeparation: type
    });
  }
});