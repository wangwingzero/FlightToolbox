/**
 * 我的首页页面 - 简化版本
 * 使用BasePage基类，遵循ES5语法
 * 已移除广告和积分系统，专注核心功能
 */

var BasePage = require('../../utils/base-page.js');
var dataLoader = require('../../utils/data-loader.js');
var greetingManager = require('../../utils/greeting-manager.js');
var modalManager = require('../../utils/modal-manager.js');
var qualificationHelper = require('../../utils/qualification-helper.js');

// 创建页面配置
var pageConfig = {
  data: {
    // 资质数据
    qualifications: [],
    greeting: '早上好',
    
    // 资质到期统计
    expiringSoonCount: 0,
    
    // 公众号相关数据
    showQRFallback: false,
    showQRCodeModal: false,
    
    // 其他UI相关数据
    medicalStandardsAvailable: true
  },
  
  /**
   * 自定义页面加载方法
   */
  customOnLoad: function(options) {
    console.log('🎯 页面加载开始');
    
    // 初始化管理器
    modalManager.init(this);
    
    // 更新问候语
    this.updateGreeting();
    
    // 加载资质数据
    this.refreshQualifications();
  },
  
  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    console.log('🎯 页面显示');
    
    // 更新问候语
    this.updateGreeting();
    
    // 刷新资质数据
    this.refreshQualifications();
  },
  
  /**
   * 更新问候语
   */
  updateGreeting: function() {
    var greeting = greetingManager.getRandomGreeting();
    this.setData({ greeting: greeting });
  },
  
  /**
   * 刷新资质数据
   */
  refreshQualifications: function() {
    var self = this;
    
    this.loadDataWithLoading(function() {
      return new Promise(function(resolve, reject) {
        try {
          var qualifications = qualificationHelper.getAllQualifications();
          var expiringSoonCount = qualificationHelper.getExpiringSoonCount();
          
          resolve({
            qualifications: qualifications,
            expiringSoonCount: expiringSoonCount
          });
        } catch (error) {
          reject(error);
        }
      });
    }, {
      context: '资质数据加载',
      loadingKey: 'qualificationsLoading',
      dataKey: 'qualificationsData'
    }).then(function(data) {
      self.setData({
        qualifications: data.qualifications,
        expiringSoonCount: data.expiringSoonCount
      });
    }).catch(function(error) {
      console.error('加载资质数据失败:', error);
    });
  },

  // === 页面导航方法 ===
  
  /**
   * 打开雪情通告编码器
   */
  openSnowtamEncoder: function() {
    wx.navigateTo({
      url: '/packageO/snowtam-encoder/index'
    });
  },
  
  /**
   * 打开雪情通告解码器
   */
  openSnowtamDecoder: function() {
    wx.navigateTo({
      url: '/packageO/snowtam-decoder/index'
    });
  },

  // 打开体检标准页面
  openMedicalStandards: function(e) {
    var target = e.currentTarget.dataset.target;
    console.log('🎯 点击目标：', target, '按钮类型：', target === 'health' ? '健康管理' : '体检标准');
    
    if (target === 'health') {
      console.log('🏥 打开健康管理页面');
      wx.showToast({
        title: '正在打开健康管理',
        icon: 'loading',
        duration: 1000
      });
      
      wx.navigateTo({
        url: '/packageHealth/health-guide/index',
        success: function(res) {
          console.log('✅ 成功跳转到健康管理页面');
        },
        fail: function(err) {
          console.error('❌ 跳转健康管理页面失败:', err);
          wx.showToast({
            title: '健康指南页面加载失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } else {
      console.log('🏥 打开体检标准页面');
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

  /**
   * 打开资质管理
   */
  openQualificationManager: function() {
    wx.navigateTo({
      url: '/packageO/qualification-manager/index'
    });
  },

  /**
   * 打开日出日落
   */
  openSunriseOnly: function() {
    wx.navigateTo({
      url: '/packageO/sunrise-sunset-only/index'
    });
  },

  /**
   * 打开夜航时间
   */
  openSunriseSunset: function() {
    wx.navigateTo({
      url: '/packageO/sunrise-sunset/index'
    });
  },

  /**
   * 打开事件报告
   */
  openEventReport: function() {
    wx.navigateTo({
      url: '/packageO/event-report/initial-report'
    });
  },

  /**
   * 打开事件调查
   */
  openIncidentInvestigation: function() {
    wx.navigateTo({
      url: '/packageO/incident-investigation/index'
    });
  },

  /**
   * 打开分飞行时间
   */
  openFlightTimeShare: function() {
    wx.navigateTo({
      url: '/packageO/flight-time-share/index'
    });
  },

  /**
   * 打开个人检查单
   */
  openPersonalChecklist: function() {
    wx.navigateTo({
      url: '/packageO/personal-checklist/index'
    });
  },

  /**
   * 打开长航线换班
   */
  openLongFlightCrewRotation: function() {
    wx.navigateTo({
      url: '/packageO/long-flight-crew-rotation/index'
    });
  },
  
  // === 弹窗关闭方法 ===
  
  /**
   * 关闭二维码弹窗
   */
  closeQRCodeModal: function() {
    this.setData({ showQRCodeModal: false });
  },
  
  // === 其他功能方法 ===
  
  /**
   * 预览二维码
   */
  previewQRCode: function() {
    wx.previewImage({
      urls: ['/images/OfficialAccount.png']
    });
  },
  
  /**
   * 跳转到公众号
   */
  jumpToOfficialAccount: function() {
    var self = this;
    
    // 直接尝试跳转，不显示确认弹窗
    try {
      wx.openOfficialAccountProfile({
        username: 'gh_68a6294836cd', // 使用正确的原始ID
        success: function() {
          console.log('✅ 成功跳转到公众号');
        },
        fail: function(error) {
          console.log('❌ 跳转失败，提示扫描二维码', error);
          wx.showToast({
            title: '请直接扫描下方二维码',
            icon: 'none',
            duration: 3000
          });
        }
      });
    } catch (error) {
      console.log('❌ API不支持或基础库版本过低，提示扫描二维码', error);
      wx.showToast({
        title: '请直接扫描下方二维码',
        icon: 'none',
        duration: 3000
      });
    }
  },
  
  /**
   * 显示公众号二维码弹窗
   */
  showQRCodeModal: function() {
    this.setData({
      showQRCodeModal: true
    });
  },
  
  /**
   * 复制公众号ID
   */
  copyOfficialAccountId: function() {
    wx.setClipboardData({
      data: '飞行播客',
      success: function() {
        wx.showToast({
          title: '公众号ID已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  
  /**
   * 提示用户搜索公众号
   */
  searchOfficialAccount: function() {
    var self = this;
    wx.showModal({
      title: '关注公众号',
      content: '请在微信中搜索"飞行播客"来关注我的公众号。',
      showCancel: true,
      cancelText: '取消',
      confirmText: '复制ID',
      success: function(res) {
        if (res.confirm) {
          self.copyOfficialAccountId();
        }
      }
    });
  },
  
  /**
   * 意见反馈
   */
  feedback: function() {
    wx.showModal({
      title: '意见反馈',
      content: '欢迎添加微信号wwingzero来和作者进行反馈',
      confirmText: '知道了',
      showCancel: false
    });
  },

  /**
   * 关于作者
   */
  aboutUs: function() {
    wx.showModal({
      title: '关于作者',
      content: '作者：虎大王\n\n作为一名飞行员，我深知大家在日常工作中遇到的各种痛点：计算复杂、查询繁琐、工具分散。\n\n为了帮助飞行员朋友们更高效地解决这些问题，我开发了这款小程序，集成了最实用的飞行工具。\n\n希望能为大家的飞行工作带来便利！',
      showCancel: false,
      confirmText: '了解了'
    });
  },
  
  /**
   * 版本信息
   */
  onVersionTap: function() {
    wx.showModal({
      title: '版本信息',
      content: '当前版本：v2.0.0\n\n所有功能现已开放！',
      showCancel: false,
      confirmText: '确定'
    });
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));