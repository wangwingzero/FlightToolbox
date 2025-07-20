// 紧急改变高度页面
var BasePage = require('../../utils/base-page.js');
var emergencyAltitudeData = require('../../data/emergency-altitude-data.js');

var pageConfig = {
  data: {
    // 紧急程序数据
    emergencyData: emergencyAltitudeData,
    
    // 当前选中的紧急类型
    selectedEmergencyType: '',
    
    // 操作步骤展开状态
    emergencyStepsExpanded: [],
    
    // 当前选中的程序步骤
    selectedProcedureStep: -1
  },

  customOnLoad: function(options) {
    console.log('紧急改变高度页面加载');
  },

  customOnShow: function() {
    console.log('紧急改变高度页面显示');
  },

  /**
   * 选择紧急程序类型
   */
  selectEmergencyType: function(e) {
    var type = e.currentTarget.dataset.type;
    this.setData({
      selectedEmergencyType: type,
      emergencyStepsExpanded: [] // 重置展开状态
    });
    console.log('选择紧急类型:', type);
  },

  /**
   * 返回主界面
   */
  backToEmergencyMain: function() {
    this.setData({
      selectedEmergencyType: '',
      emergencyStepsExpanded: [],
      selectedProcedureStep: -1
    });
  },

  /**
   * 切换操作步骤展开状态
   */
  toggleProcedureStep: function(e) {
    var step = parseInt(e.currentTarget.dataset.step);
    var expanded = this.data.emergencyStepsExpanded;
    var index = expanded.indexOf(step);
    
    if (index > -1) {
      // 已展开，收起
      expanded.splice(index, 1);
    } else {
      // 未展开，展开
      expanded.push(step);
    }
    
    this.setData({
      emergencyStepsExpanded: expanded
    });
  },

  /**
   * 紧急程序快速操作
   */
  emergencyQuickAction: function(e) {
    var action = e.currentTarget.dataset.action;
    var type = e.currentTarget.dataset.type;
    
    console.log('快速操作:', action, type);
    
    switch(action) {
      case 'call-atc':
        this.showToast('请联系ATC管制员', 'none');
        break;
      case 'emergency-frequency':
        this.showToast('紧急频率: 121.5MHz', 'none');
        break;
      case 'altitude-table':
        this.showToast('请参考高度改变表格', 'none');
        break;
      default:
        this.showToast('功能开发中', 'none');
    }
  },

  /**
   * 显示提示信息
   */
  showToast: function(title, icon) {
    wx.showToast({
      title: title,
      icon: icon || 'success',
      duration: 2000
    });
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));