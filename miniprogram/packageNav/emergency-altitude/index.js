// packageNav/emergency-altitude/index.js
var BasePage = require('../../utils/base-page.js');
var emergencyAltitudeData = require('../../data/emergency-altitude-data.js');

BasePage.createPage({
  data: {
    emergencyData: null,
    selectedEmergencyType: '',
    selectedProcedureStep: -1,
    emergencyStepsExpanded: []
  },

  customOnLoad: function(options) {
    this.setData({
      emergencyData: emergencyAltitudeData
    });
  },

  customOnShow: function() {
    // 无需额外操作
  },

  customOnUnload: function() {
    // 无需清理
  },

  /**
   * 选择紧急程序类型
   */
  selectEmergencyType: function(e) {
    var type = e.currentTarget.dataset.type;
    console.log('🚨 选择紧急程序类型:', type);

    this.setData({
      selectedEmergencyType: type,
      selectedProcedureStep: -1,
      emergencyStepsExpanded: []
    });

    // 更新页面标题
    var selectedCategory = null;
    for (var i = 0; i < this.data.emergencyData.categories.length; i++) {
      if (this.data.emergencyData.categories[i].id === type) {
        selectedCategory = this.data.emergencyData.categories[i];
        break;
      }
    }

    if (selectedCategory) {
      wx.setNavigationBarTitle({
        title: selectedCategory.title
      });
    }
  },

  /**
   * 切换程序步骤的展开状态
   */
  toggleProcedureStep: function(e) {
    var stepIndex = e.currentTarget.dataset.step;
    var expandedSteps = this.data.emergencyStepsExpanded.slice();

    var index = expandedSteps.indexOf(stepIndex);
    if (index > -1) {
      expandedSteps.splice(index, 1);
    } else {
      expandedSteps.push(stepIndex);
    }

    this.setData({
      emergencyStepsExpanded: expandedSteps
    });
  },

  /**
   * 返回紧急程序主页面
   */
  backToEmergencyMain: function() {
    this.setData({
      selectedEmergencyType: '',
      selectedProcedureStep: -1,
      emergencyStepsExpanded: []
    });

    wx.setNavigationBarTitle({
      title: '紧急改变高度'
    });
  },

  /**
   * 紧急程序快速操作
   */
  emergencyQuickAction: function(e) {
    var action = e.currentTarget.dataset.action;
    var type = e.currentTarget.dataset.type;

    switch (action) {
      case 'call-atc':
        wx.showModal({
          title: '通信联络',
          content: '立即联系空中交通管制：报告"要求天气偏离"或紧急情况',
          showCancel: false,
          confirmText: '知道了'
        });
        break;
      case 'emergency-frequency':
        wx.showModal({
          title: '紧急频率',
          content: '121.5 MHz - 国际应急频率\n123.45 MHz - 空对空备用频率',
          showCancel: false,
          confirmText: '知道了'
        });
        break;
      case 'altitude-table':
        this.showAltitudeReferenceTable(type);
        break;
      default:
        console.log('未知的快速操作:', action);
    }
  },

  /**
   * 显示高度参考表格
   */
  showAltitudeReferenceTable: function(type) {
    var selectedCategory = null;

    for (var i = 0; i < this.data.emergencyData.categories.length; i++) {
      if (this.data.emergencyData.categories[i].id === type) {
        selectedCategory = this.data.emergencyData.categories[i];
        break;
      }
    }

    if (selectedCategory && selectedCategory.altitudeTable) {
      var table = selectedCategory.altitudeTable;
      var content = table.title + '\n\n';

      for (var i = 0; i < table.rows.length; i++) {
        var row = table.rows[i];
        content += row[0] + ' | ' + row[1] + ' | ' + row[2] + '\n';
      }

      wx.showModal({
        title: '高度改变参考',
        content: content,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  onShareAppMessage: function() {
    return {
      title: '紧急改变高度程序 - FlightToolbox',
      path: '/packageNav/emergency-altitude/index'
    };
  }
})