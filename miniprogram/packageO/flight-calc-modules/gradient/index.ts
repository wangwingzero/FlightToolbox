// 梯度计算页面
Page({
  data: {
    gradient: {
      gradientInput: '',
      groundSpeedInput: '',
      verticalSpeedInput: '',
      angleInput: '',
      gradientResult: '',
      verticalSpeedResult: '',
      angleResult: ''
    },
    // 🎯 新增：输入提示和帮助信息
    helpInfo: {
      showTips: false,
      currentTip: ''
    },
    // 常用组合配置
    presets: {
      standard: { angle: 3.0, groundSpeed: 150, description: '标准下降角度' },
      steep: { angle: 6.0, groundSpeed: 120, description: '陡峪下降角度' },
      climb: { gradient: 5.0, groundSpeed: 180, description: '标准爬升梯度' }
    }
  },

  // 数字输入验证函数
  onNumberInput(e: any) {
    let value = e.detail.value;
    // 只允许数字、负号、小数点
    value = value.replace(/[^-0-9.]/g, '');
    // 确保负号只能在开头
    if (value.indexOf('-') > 0) {
      value = value.replace(/-/g, '');
    }
    // 确保只有一个小数点
    const dotIndex = value.indexOf('.');
    if (dotIndex !== -1) {
      value = value.substring(0, dotIndex + 1) + value.substring(dotIndex + 1).replace(/\./g, '');
    }
    // 更新输入框的值
    const field = e.currentTarget.dataset.field;
    if (field) {
      this.setData({
        [`gradient.${field}Input`]: value
      });
    }
  },

  onLoad() {
    // 🎯 进入页面时扣减积分 - 梯度计算 2积分
    const pointsManager = require('../../../utils/points-manager.js');
    
    pointsManager.consumePoints('flight-calc-gradient', '梯度计算功能使用').then((result: any) => {
      if (result.success) {
        // 显示统一格式的积分消耗提示
        if (result.message !== '该功能免费使用') {
          wx.showToast({
            title: '消耗' + result.pointsConsumed + '积分，剩余' + result.remainingPoints + '积分',
            icon: 'success',
            duration: 2000
          });
        }
        
        // 积分扣费成功后初始化页面
        console.log('✅ 梯度计算功能已就绪');
      } else {
        // 积分不足，返回上一页
        console.log('积分不足，无法使用梯度计算功能');
        wx.showModal({
          title: '积分不足',
          content: `此功能需要 ${result.requiredPoints} 积分，您当前有 ${result.currentPoints} 积分。`,
          showCancel: true,
          cancelText: '返回',
          confirmText: '获取积分',
          success: (res: any) => {
            if (res.confirm) {
              // 跳转到积分获取页面（首页签到/观看广告）
              wx.switchTab({
                url: '/pages/others/index'
              });
            } else {
              // 返回上一页
              wx.navigateBack();
            }
          }
        });
      }
    }).catch((error: any) => {
      console.error('积分扣费失败:', error);
      // 错误回退：继续使用功能，确保用户体验
      console.log('⚠️ 积分系统不可用，功能正常开放');
      wx.showToast({
        title: '积分系统暂时不可用，功能正常开放',
        icon: 'none',
        duration: 3000
      });
    });
  },

  onShow() {
    // 页面显示时的处理逻辑
  },

  // 输入事件处理
  onGradientInputChange(event: any) {
    this.setData({
      'gradient.gradientInput': event.detail
    });
  },

  onGroundSpeedInputChange(event: any) {
    this.setData({
      'gradient.groundSpeedInput': event.detail
    });
  },

  onVerticalSpeedInputChange(event: any) {
    this.setData({
      'gradient.verticalSpeedInput': event.detail
    });
  },

  onAngleInputChange(event: any) {
    this.setData({
      'gradient.angleInput': event.detail
    });
  },

  // 梯度换算
  convertGradient() {
    const validateParams = () => {
      const gradientData = this.data.gradient;
      const { gradientInput, groundSpeedInput, verticalSpeedInput, angleInput } = gradientData;
      
      // 获取有效输入参数
      const inputs = {
        gradient: gradientInput && gradientInput.trim() !== '' ? parseFloat(gradientInput) : null,
        groundSpeed: groundSpeedInput && groundSpeedInput.trim() !== '' ? parseFloat(groundSpeedInput) : null,
        verticalSpeed: verticalSpeedInput && verticalSpeedInput.trim() !== '' ? parseFloat(verticalSpeedInput) : null,
        angle: angleInput && angleInput.trim() !== '' ? parseFloat(angleInput) : null
      };
      
      // 检查数值有效性
      const validInputs = Object.entries(inputs)
        .filter(([key, value]) => value !== null && !isNaN(value))
        .map(([key, value]) => ({ key, value }));
      
      if (validInputs.length < 2) {
        return {
          valid: false,
          message: '请至少输入两个有效参数进行换算（必须包含数值）'
        };
      }
      
      // 🎯 冲突检测：检查输入是否一致
      const conflicts = this.detectConflicts(inputs);
      if (conflicts.length > 0) {
        return {
          valid: false,
          message: `检测到输入冲突：${conflicts.join('、')}。请检查输入参数的一致性。`,
          conflicts: conflicts
        };
      }
      
      return { valid: true, inputs };
    };

    const performCalculation = (inputs) => {
      this.calculateGradientConversion(inputs);
      
      wx.showToast({
        title: '梯度换算完成',
        icon: 'success'
      });
    };

    // 🎯 增强验证和计算逻辑
    const validation = validateParams();
    if (!validation.valid) {
      wx.showModal({
        title: validation.conflicts ? '输入冲突' : '参数不完整',
        content: validation.message,
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }
    
    performCalculation(validation.inputs);
  },

  // 🎯 新增：冲突检测函数
  detectConflicts(inputs) {
    const conflicts = [];
    const { gradient, groundSpeed, verticalSpeed, angle } = inputs;
    
    // 容差值（允许的误差范围）
    const tolerance = 0.01; // 1%的误差
    
    // 如果有梯度、地速和升降率，检查它们是否一致
    if (gradient !== null && groundSpeed !== null && verticalSpeed !== null) {
      const expectedVerticalSpeed = (groundSpeed * 101.2686 * gradient) / 100;
      const diff = Math.abs(verticalSpeed - expectedVerticalSpeed);
      const relativeDiff = diff / Math.abs(expectedVerticalSpeed);
      
      if (relativeDiff > tolerance) {
        conflicts.push(`梯度${gradient}%、地速${groundSpeed}节计算的升降率应为${expectedVerticalSpeed.toFixed(0)}ft/min，与输入的${verticalSpeed}ft/min不一致`);
      }
    }
    
    // 如果有梯度和角度，检查它们是否一致
    if (gradient !== null && angle !== null) {
      const expectedAngle = Math.atan(gradient / 100) * (180 / Math.PI);
      const diff = Math.abs(angle - expectedAngle);
      
      if (diff > 0.1) { // 0.1度的误差
        conflicts.push(`梯度${gradient}%对应的角度应为${expectedAngle.toFixed(2)}°，与输入的${angle}°不一致`);
      }
    }
    
    // 如果有角度、地速和升降率，检查它们是否一致
    if (angle !== null && groundSpeed !== null && verticalSpeed !== null) {
      const angleRad = angle * (Math.PI / 180);
      const expectedVerticalSpeed = groundSpeed * 101.2686 * Math.tan(angleRad);
      const diff = Math.abs(verticalSpeed - expectedVerticalSpeed);
      const relativeDiff = diff / Math.abs(expectedVerticalSpeed);
      
      if (relativeDiff > tolerance) {
        conflicts.push(`角度${angle}°、地速${groundSpeed}节计算的升降率应为${expectedVerticalSpeed.toFixed(0)}ft/min，与输入的${verticalSpeed}ft/min不一致`);
      }
    }
    
    return conflicts;
  },

  // 🎯 改进的梯度换算核心逻辑
  calculateGradientConversion(inputs) {
    const { gradient, groundSpeed, verticalSpeed, angle } = inputs;

    // 清空之前的结果
    this.setData({
      'gradient.gradientResult': '',
      'gradient.verticalSpeedResult': '',
      'gradient.angleResult': ''
    });

    let calculatedResults = {
      gradient: null,
      verticalSpeed: null,
      angle: null
    };

    // 🎯 智能计算：基于输入参数自动补全其他参数
    
    // 优先级1：如果有梯度和地速，计算升降率和角度
    if (gradient !== null && groundSpeed !== null) {
      const groundSpeedFtPerMin = groundSpeed * 101.2686;
      calculatedResults.verticalSpeed = (groundSpeedFtPerMin * gradient) / 100;
      calculatedResults.angle = Math.atan(gradient / 100) * (180 / Math.PI);
    }
    // 优先级2：如果有升降率和地速，计算梯度和角度
    else if (verticalSpeed !== null && groundSpeed !== null) {
      const groundSpeedFtPerMin = groundSpeed * 101.2686;
      calculatedResults.gradient = (verticalSpeed / groundSpeedFtPerMin) * 100;
      calculatedResults.angle = Math.atan(Math.abs(verticalSpeed) / groundSpeedFtPerMin) * (180 / Math.PI);
    }
    // 优先级3：如果有角度和地速，计算梯度和升降率
    else if (angle !== null && groundSpeed !== null) {
      const groundSpeedFtPerMin = groundSpeed * 101.2686;
      const angleRad = angle * (Math.PI / 180);
      calculatedResults.gradient = Math.tan(angleRad) * 100;
      calculatedResults.verticalSpeed = groundSpeedFtPerMin * Math.tan(angleRad);
    }
    // 优先级4：如果有梯度和升降率，计算地速和角度
    else if (gradient !== null && verticalSpeed !== null) {
      const calculatedGroundSpeedFtPerMin = (verticalSpeed * 100) / gradient;
      const calculatedGroundSpeed = calculatedGroundSpeedFtPerMin / 101.2686;
      calculatedResults.angle = Math.atan(gradient / 100) * (180 / Math.PI);
      
      // 自动填充地速输入框
      this.setData({
        'gradient.groundSpeedInput': calculatedGroundSpeed.toFixed(1)
      });
    }
    // 优先级5：如果有梯度和角度，计算升降率（需要地速）
    else if (gradient !== null && angle !== null) {
      // 这种情况需要地速才能计算升降率
      calculatedResults.angle = Math.atan(gradient / 100) * (180 / Math.PI);
    }
    // 优先级6：如果有升降率和角度，计算梯度（需要地速）
    else if (verticalSpeed !== null && angle !== null) {
      const angleRad = angle * (Math.PI / 180);
      calculatedResults.gradient = Math.tan(angleRad) * 100;
    }
    // 优先级7：只有一个参数的情况
    else if (gradient !== null) {
      calculatedResults.angle = Math.atan(gradient / 100) * (180 / Math.PI);
    }
    else if (angle !== null) {
      const angleRad = angle * (Math.PI / 180);
      calculatedResults.gradient = Math.tan(angleRad) * 100;
    }

    // 🎯 更新结果显示
    const updateData = {};
    
    // 只更新未输入的字段
    if (gradient === null && calculatedResults.gradient !== null) {
      updateData['gradient.gradientResult'] = calculatedResults.gradient.toFixed(2);
    }
    if (verticalSpeed === null && calculatedResults.verticalSpeed !== null) {
      updateData['gradient.verticalSpeedResult'] = calculatedResults.verticalSpeed.toFixed(0);
    }
    if (angle === null && calculatedResults.angle !== null) {
      updateData['gradient.angleResult'] = calculatedResults.angle.toFixed(2);
    }
    
    this.setData(updateData);
    
    // 🎯 显示计算详情
    this.showCalculationDetails(inputs, calculatedResults);
  },

  // 🎯 新增：显示计算详情
  showCalculationDetails(inputs, results) {
    const { gradient, groundSpeed, verticalSpeed, angle } = inputs;
    let details = [];
    
    if (gradient !== null && groundSpeed !== null) {
      details.push('✓ 基于梯度和地速计算升降率和角度');
    } else if (verticalSpeed !== null && groundSpeed !== null) {
      details.push('✓ 基于升降率和地速计算梯度和角度');
    } else if (angle !== null && groundSpeed !== null) {
      details.push('✓ 基于角度和地速计算梯度和升降率');
    } else if (gradient !== null && verticalSpeed !== null) {
      details.push('✓ 基于梯度和升降率推算地速和角度');
    }
    
    if (details.length > 0) {
      console.log('🎯 梯度计算详情:', details.join(', '));
    }
  },

  // 清空数据
  clearGradient() {
    this.setData({
      'gradient.gradientInput': '',
      'gradient.groundSpeedInput': '',
      'gradient.verticalSpeedInput': '',
      'gradient.angleInput': '',
      'gradient.gradientResult': '',
      'gradient.verticalSpeedResult': '',
      'gradient.angleResult': ''
    });
    
    wx.showToast({
      title: '数据已清空',
      icon: 'success'
    });
  }

  // 🎯 新增：实时输入提示
  ,onInputFocus(event) {
    const { field } = event.currentTarget.dataset;
    let tipText = '';
    
    switch(field) {
      case 'gradient':
        tipText = '梯度表示飞机爬升或下降的百分比率，如3%表示每100英尺水平距离上升3英尺';
        break;
      case 'groundSpeed':
        tipText = '地速是飞机相对于地面的速度，单位为节(knot)';
        break;
      case 'verticalSpeed':
        tipText = '升降率是飞机垂直方向的速度，单位为英尺/分钟(ft/min)';
        break;
      case 'angle':
        tipText = '角度是飞机飞行轨迹与水平面的夹角，单位为度(°)';
        break;
    }
    
    if (tipText) {
      wx.showToast({
        title: tipText,
        icon: 'none',
        duration: 3000
      });
    }
  },

  // 🎯 新增：常用组合快捷键
  setPreset(event) {
    const { preset } = event.currentTarget.dataset;
    
    switch(preset) {
      case 'standard':
        // 标准下降 3°
        this.setData({
          'gradient.angleInput': '3.0',
          'gradient.groundSpeedInput': '150',
          'gradient.gradientInput': '',
          'gradient.verticalSpeedInput': ''
        });
        break;
      case 'steep':
        // 陡峪下降 6°
        this.setData({
          'gradient.angleInput': '6.0',
          'gradient.groundSpeedInput': '120',
          'gradient.gradientInput': '',
          'gradient.verticalSpeedInput': ''
        });
        break;
      case 'climb':
        // 标准爬升 5%
        this.setData({
          'gradient.gradientInput': '5.0',
          'gradient.groundSpeedInput': '180',
          'gradient.angleInput': '',
          'gradient.verticalSpeedInput': ''
        });
        break;
    }
    
    wx.showToast({
      title: '已设置常用组合，请点击计算',
      icon: 'success'
    });
  }
});