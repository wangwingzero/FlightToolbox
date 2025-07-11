/**
 * 气压换算页面 - 重构版本
 * 使用BasePage基类，遵循ES5语法
 * 解决主题管理和步骤控制重复代码问题
 */

var BasePage = require('../../../utils/base-page.js');

// 创建页面配置
var pageConfig = {
  data: {
    // 步骤控制
    currentStep: 1, // 1:输入参数 2:查看结果
    
    // 气压换算相关
    pressure: {
      airportElevation: '',
      qnhPressure: '',
      qfePressure: '',
      result: null,
      error: ''
    },
    
    // 计算结果
    calculationResult: null
  },

  /**
   * 自定义页面加载方法
   */
  customOnLoad: function(options) {
    console.log('🌡️ 气压换算页面加载');
    // 基类已经处理了主题初始化
  },

  /**
   * 自定义页面显示方法
   */
  customOnShow: function() {
    console.log('🌡️ 气压换算页面显示');
    // 基类已经处理了主题检查
  },

  /**
   * 设置计算结果用于新界面显示
   */
  setCalculationResult: function(result) {
    var icon = '✅';
    var type = 'safe';
    
    if (result.status && result.status.indexOf('错误') !== -1) {
      icon = '⚠️';
      type = 'warning';
    }
    
    var calculationResult = {};
    for (var key in result) {
      if (result.hasOwnProperty(key)) {
        calculationResult[key] = result[key];
      }
    }
    calculationResult.icon = icon;
    calculationResult.type = type;
    
    this.setData({
      calculationResult: calculationResult
    });
  },

  /**
   * 下一步
   */
  nextStep: function() {
    var currentStep = this.data.currentStep;
    
    // 校验输入
    if (currentStep === 1) {
      var pressureData = this.data.pressure;
      if (!pressureData.airportElevation) {
        this.showError('请输入机场标高');
        return;
      }
      
      if (!pressureData.qnhPressure && !pressureData.qfePressure) {
        this.showError('请至少输入QNH或QFE气压值');
        return;
      }
      
      // 执行计算
      this.calculatePressure();
    }
    
    // 进入下一步
    this.setData({
      currentStep: currentStep + 1
    });
  },

  /**
   * 上一步
   */
  prevStep: function() {
    var currentStep = this.data.currentStep;
    if (currentStep > 1) {
      this.setData({
        currentStep: currentStep - 1
      });
    }
  },

  /**
   * 重置计算器
   */
  resetCalculator: function() {
    this.setData({
      currentStep: 1,
      pressure: {
        airportElevation: '',
        qnhPressure: '',
        qfePressure: '',
        result: null,
        error: ''
      },
      calculationResult: null
    });
  },

  /**
   * 计算气压
   */
  calculatePressure: function() {
    var self = this;
    var pressureData = this.data.pressure;
    
    this.loadDataWithLoading(function() {
      return new Promise(function(resolve, reject) {
        try {
          var elevation = parseFloat(pressureData.airportElevation);
          var qnh = pressureData.qnhPressure ? parseFloat(pressureData.qnhPressure) : null;
          var qfe = pressureData.qfePressure ? parseFloat(pressureData.qfePressure) : null;
          
          // 验证输入
          if (isNaN(elevation)) {
            throw new Error('机场标高必须为数字');
          }
          
          if (qnh && isNaN(qnh)) {
            throw new Error('QNH气压值必须为数字');
          }
          
          if (qfe && isNaN(qfe)) {
            throw new Error('QFE气压值必须为数字');
          }
          
          var result = self.performPressureCalculation(elevation, qnh, qfe);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }, {
      context: '气压计算',
      loadingKey: 'calculating',
      dataKey: 'calculationData'
    }).then(function(result) {
      // 更新压力数据
      var updatedPressure = {};
      for (var key in self.data.pressure) {
        if (self.data.pressure.hasOwnProperty(key)) {
          updatedPressure[key] = self.data.pressure[key];
        }
      }
      updatedPressure.result = result;
      updatedPressure.error = '';
      
      self.setData({ pressure: updatedPressure });
      self.setCalculationResult(result);
      
      console.log('✅ 气压计算完成');
    }).catch(function(error) {
      console.error('❌ 气压计算失败:', error);
      
      var updatedPressure = {};
      for (var key in self.data.pressure) {
        if (self.data.pressure.hasOwnProperty(key)) {
          updatedPressure[key] = self.data.pressure[key];
        }
      }
      updatedPressure.error = error.message || '计算失败';
      
      self.setData({ pressure: updatedPressure });
      self.showError('计算失败：' + error.message);
    });
  },

  /**
   * 执行气压计算
   */
  performPressureCalculation: function(elevation, qnh, qfe) {
    // 气压高度差换算：每1000英尺约等于30 hPa
    var pressureAltitudeFactor = 30 / 1000; // hPa per foot
    
    var result = {
      elevation: elevation,
      qnh: qnh,
      qfe: qfe,
      calculatedQnh: null,
      calculatedQfe: null,
      pressureDifference: null,
      status: '计算成功'
    };
    
    // 根据海拔高度计算压力差
    var pressureDifference = elevation * pressureAltitudeFactor;
    result.pressureDifference = Math.round(pressureDifference * 10) / 10;
    
    // 如果提供了QNH，计算QFE
    if (qnh) {
      result.calculatedQfe = Math.round((qnh - pressureDifference) * 10) / 10;
    }
    
    // 如果提供了QFE，计算QNH
    if (qfe) {
      result.calculatedQnh = Math.round((qfe + pressureDifference) * 10) / 10;
    }
    
    // 验证结果的合理性
    if (result.calculatedQnh && (result.calculatedQnh < 950 || result.calculatedQnh > 1050)) {
      result.status = '⚠️ 警告：计算的QNH值(' + result.calculatedQnh + ' hPa)超出正常范围(950-1050 hPa)';
    }
    
    if (result.calculatedQfe && (result.calculatedQfe < 950 || result.calculatedQfe > 1050)) {
      result.status = '⚠️ 警告：计算的QFE值(' + result.calculatedQfe + ' hPa)超出正常范围(950-1050 hPa)';
    }
    
    return result;
  },

  /**
   * 输入值变化处理
   */
  onInputChange: function(e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value;
    
    var updateData = {};
    updateData['pressure.' + field] = value;
    
    this.setData(updateData);
  },

  /**
   * 清除输入
   */
  clearInput: function(e) {
    var field = e.currentTarget.dataset.field;
    
    var updateData = {};
    updateData['pressure.' + field] = '';
    
    this.setData(updateData);
  },

  /**
   * 复制结果到剪贴板
   */
  copyResult: function() {
    var result = this.data.pressure.result;
    if (!result) {
      this.showError('没有计算结果可复制');
      return;
    }
    
    var copyText = '气压换算结果：\n';
    copyText += '机场标高: ' + result.elevation + ' ft\n';
    
    if (result.qnh) {
      copyText += 'QNH: ' + result.qnh + ' hPa\n';
    }
    if (result.calculatedQfe) {
      copyText += '计算的QFE: ' + result.calculatedQfe + ' hPa\n';
    }
    
    if (result.qfe) {
      copyText += 'QFE: ' + result.qfe + ' hPa\n';
    }
    if (result.calculatedQnh) {
      copyText += '计算的QNH: ' + result.calculatedQnh + ' hPa\n';
    }
    
    copyText += '压力差: ' + result.pressureDifference + ' hPa\n';
    copyText += '状态: ' + result.status;
    
    wx.setClipboardData({
      data: copyText,
      success: function() {
        wx.showToast({
          title: '结果已复制',
          icon: 'success'
        });
      },
      fail: function() {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 分享结果
   */
  shareResult: function() {
    // 小程序分享功能
    var result = this.data.pressure.result;
    if (!result) {
      this.showError('没有计算结果可分享');
      return;
    }
    
    // 这里可以触发分享功能
    this.showSuccess('分享功能开发中');
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));