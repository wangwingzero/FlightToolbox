// 梯度计算页面
Page({
  data: {
    isDarkMode: false,
    gradient: {
      gradientInput: '',
      groundSpeedInput: '',
      verticalSpeedInput: '',
      angleInput: '',
      gradientResult: '',
      verticalSpeedResult: '',
      angleResult: ''
    }
  },

  onLoad() {
    const app = getApp<any>();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    });
  },

  onShow() {
    const app = getApp<any>();
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    });
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
      
      // 检查至少有两个参数
      const paramCount = [gradientInput, groundSpeedInput, verticalSpeedInput, angleInput]
        .filter(param => param && param.trim() !== '').length;
      
      if (paramCount < 2) {
        return {
          valid: false,
          message: '请至少输入两个参数进行换算'
        };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.calculateGradientConversion();
      
      wx.showToast({
        title: '梯度换算完成',
        icon: 'success'
      });
    };

    // 🎯 移除按钮级扣费，改为页面级扣费（在首页进入飞行计算工具时扣费）
    // 直接执行计算逻辑
    const validation = validateParams();
    if (!validation.valid) {
      wx.showToast({
        title: validation.message || '参数不完整',
        icon: 'none'
      });
      return;
    }
    
    performCalculation();
  },

  // 梯度换算核心逻辑
  calculateGradientConversion() {
    const gradientData = this.data.gradient;
    const gradient = gradientData.gradientInput ? parseFloat(gradientData.gradientInput) : null;
    const groundSpeed = gradientData.groundSpeedInput ? parseFloat(gradientData.groundSpeedInput) : null;
    const verticalSpeed = gradientData.verticalSpeedInput ? parseFloat(gradientData.verticalSpeedInput) : null;
    const angle = gradientData.angleInput ? parseFloat(gradientData.angleInput) : null;

    // 清空之前的结果
    this.setData({
      'gradient.gradientResult': '',
      'gradient.verticalSpeedResult': '',
      'gradient.angleResult': ''
    });

    let hasCalculation = false;

    // 从梯度和地速计算升降率和角度
    if (gradient !== null && !isNaN(gradient) && groundSpeed !== null && !isNaN(groundSpeed)) {
      if (gradient > 0 && groundSpeed > 0) {
        hasCalculation = true;
        
        // 地速转换为英尺/分钟
        const groundSpeedFtPerMin = groundSpeed * 101.2686; // 1节 = 101.2686英尺/分钟
        
        // 计算升降率 (ft/min)
        const calculatedVerticalSpeed = (groundSpeedFtPerMin * gradient) / 100;
        
        // 计算角度
        const calculatedAngle = Math.atan(gradient / 100) * (180 / Math.PI);
        
        this.setData({
          'gradient.verticalSpeedResult': calculatedVerticalSpeed.toFixed(0),
          'gradient.angleResult': calculatedAngle.toFixed(2)
        });
      }
    }

    // 从升降率和地速计算梯度和角度
    if (!hasCalculation && verticalSpeed !== null && !isNaN(verticalSpeed) && groundSpeed !== null && !isNaN(groundSpeed)) {
      if (verticalSpeed !== 0 && groundSpeed > 0) {
        hasCalculation = true;
        
        // 地速转换为英尺/分钟
        const groundSpeedFtPerMin = groundSpeed * 101.2686;
        
        // 计算梯度 (%)
        const calculatedGradient = (verticalSpeed / groundSpeedFtPerMin) * 100;
        
        // 计算角度
        const calculatedAngle = Math.atan(Math.abs(verticalSpeed) / groundSpeedFtPerMin) * (180 / Math.PI);
        
        this.setData({
          'gradient.gradientResult': calculatedGradient.toFixed(2),
          'gradient.angleResult': calculatedAngle.toFixed(2)
        });
      }
    }

    // 从梯度计算角度
    if (!hasCalculation && gradient !== null && !isNaN(gradient) && gradient > 0) {
      const calculatedAngle = Math.atan(gradient / 100) * (180 / Math.PI);
      
      this.setData({
        'gradient.angleResult': calculatedAngle.toFixed(2)
      });
      hasCalculation = true;
    }

    // 从角度和地速计算梯度和升降率
    if (!hasCalculation && angle !== null && !isNaN(angle) && groundSpeed !== null && !isNaN(groundSpeed)) {
      if (angle > 0 && angle < 90 && groundSpeed > 0) {
        hasCalculation = true;
        
        // 地速转换为英尺/分钟
        const groundSpeedFtPerMin = groundSpeed * 101.2686;
        
        // 角度转换为弧度
        const angleRad = angle * (Math.PI / 180);
        
        // 计算梯度
        const calculatedGradient = Math.tan(angleRad) * 100;
        
        // 计算升降率
        const calculatedVerticalSpeed = groundSpeedFtPerMin * Math.tan(angleRad);
        
        this.setData({
          'gradient.gradientResult': calculatedGradient.toFixed(2),
          'gradient.verticalSpeedResult': calculatedVerticalSpeed.toFixed(0)
        });
      }
    }

    // 从角度计算梯度
    if (!hasCalculation && angle !== null && !isNaN(angle) && angle > 0 && angle < 90) {
      const angleRad = angle * (Math.PI / 180);
      const calculatedGradient = Math.tan(angleRad) * 100;
      
      this.setData({
        'gradient.gradientResult': calculatedGradient.toFixed(2)
      });
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
});