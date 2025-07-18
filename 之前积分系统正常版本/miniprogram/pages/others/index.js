// 简化测试版本 - 用于排查问题
console.log('🚨 简化测试版本加载');

Page({
  data: {
    greeting: '测试版本',
    medicalStandardsAvailable: true
  },
  
  onLoad: function(options) {
    console.log('🚨 简化版onLoad被调用');
    console.log('🐛 方法检查:');
    console.log('- openSnowtamEncoder:', typeof this.openSnowtamEncoder);
    console.log('- testSnowtamNavigation:', typeof this.testSnowtamNavigation);
    console.log('- openMedicalStandards:', typeof this.openMedicalStandards);
  },
  
  openSnowtamEncoder: function() {
    console.log('🌨️ 简化版openSnowtamEncoder被调用！');
    wx.showToast({
      title: '方法调用成功！',
      icon: 'success'
    });
    
    setTimeout(function() {
      wx.navigateTo({
        url: '/packageO/snowtam-encoder/index'
      });
    }, 1000);
  },
  
  testSnowtamNavigation: function() {
    console.log('🧪 简化版testSnowtamNavigation被调用！');
    wx.showToast({
      title: 'TEST成功！',
      icon: 'success'
    });
    
    wx.navigateTo({
      url: '/packageO/snowtam-encoder/index'
    });
  },
  

  // 打开体检标准页面
  openMedicalStandards: function(e) {
    var target = e.currentTarget.dataset.target;
    console.log('🎯 点击目标：', target, '按钮类型：', target === 'health' ? '健康管理' : '体检标准');
    
    if (target === 'health') {
      console.log('🏥 打开健康管理指南页面');
      wx.showToast({
        title: '正在打开健康管理指南',
        icon: 'loading',
        duration: 1000
      });
      
      wx.navigateTo({
        url: '/packageHealth/health-guide/index',
        success: function(res) {
          console.log('✅ 成功跳转到健康管理指南页面');
        },
        fail: function(err) {
          console.error('❌ 跳转健康管理指南页面失败:', err);
          wx.showToast({
            title: '健康指南页面加载失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } else {
      console.log('🏥 打开体检标准页面');
      wx.showToast({
        title: '正在打开体检标准',
        icon: 'loading',
        duration: 1000
      });
      
      wx.navigateTo({
        url: '/pages/medical-standards/index',
        success: function(res) {
          console.log('✅ 成功跳转到体检标准页面');
        },
        fail: function(err) {
          console.error('❌ 跳转体检标准页面失败:', err);
          wx.showToast({
            title: '页面加载失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    }
  },

  // 添加其他缺失的方法
  openQualificationManager: function() {
    console.log('📜 打开资质管理');
    wx.navigateTo({
      url: '/packageO/qualification-manager/index'
    });
  },

  openSunriseOnly: function() {
    console.log('🌅 打开日出日落');
    wx.navigateTo({
      url: '/packageO/sunrise-sunset-only/index'
    });
  },

  openSunriseSunset: function() {
    console.log('🌙 打开夜航时间');
    wx.navigateTo({
      url: '/packageO/sunrise-sunset/index'
    });
  },

  openEventReport: function() {
    console.log('📝 打开事件报告');
    wx.navigateTo({
      url: '/packageO/event-report/initial-report'
    });
  },

  openIncidentInvestigation: function() {
    console.log('🔍 打开事件调查');
    var pointsManager = require('../../utils/points-manager.js');
    
    // 事件调查需要消费3积分
    pointsManager.consumePoints('incident-investigation', '事件调查功能使用').then(function(result) {
      if (result.success) {
        wx.navigateTo({
          url: '/packageO/incident-investigation/index'
        });
      } else {
        // 积分不足，已在积分管理器中处理提示
        console.log('积分不足，无法使用事件调查功能');
      }
    }).catch(function(error) {
      console.error('积分扣费失败:', error);
      wx.showToast({
        title: '功能暂时不可用',
        icon: 'none'
      });
    });
  },

  openFlightTimeShare: function() {
    console.log('⏰ 打开分飞行时间');
    wx.navigateTo({
      url: '/packageO/flight-time-share/index'
    });
  },

  openPersonalChecklist: function() {
    console.log('✅ 打开个人检查单');
    wx.navigateTo({
      url: '/packageO/personal-checklist/index'
    });
  },

  openLongFlightCrewRotation: function() {
    console.log('🔄 打开长航线换班');
    wx.navigateTo({
      url: '/packageO/long-flight-crew-rotation/index'
    });
  },

  // 占位方法，避免报错
  showProductPhilosophy: function() {
    console.log('💝 显示产品理念');
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  showPointsDetail: function() {
    console.log('🎯 显示积分详情');
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  dailySignIn: function() {
    console.log('⭐ 每日签到');
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  watchAdForPoints: function() {
    console.log('📺 观看广告');
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  showPointsRules: function() {
    console.log('❓ 显示积分规则');
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  previewQRCode: function() {
    console.log('📱 预览二维码');
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  closePointsModal: function() {
    console.log('关闭积分弹窗');
  },

  closePointsRulesModal: function() {
    console.log('关闭规则弹窗');
  },

  closeProductPhilosophyModal: function() {
    console.log('关闭理念弹窗');
  },

  closeReportDetail: function() {
    console.log('关闭报告详情');
  },

  showQRCodeImage: function() {
    console.log('显示二维码图片');
  },

  selectThemeMode: function() {
    console.log('选择主题模式');
  },

  closeAnalyticsModal: function() {
    console.log('关闭分析弹窗');
  }
});

console.log('🚨 简化测试版本Page()调用完成');