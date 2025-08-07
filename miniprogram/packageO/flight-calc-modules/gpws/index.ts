// GPWS模拟计算页面
Page({
  data: {
    // 步骤控制
    currentStep: 1, // 1:选择模式 2:输入参数 3:显示结果
    calculating: false, // 计算进行中状态
    
    // GPWS模式描述
    modeDescriptions: {
      mode1: 'Mode 1 - 下降率告警分析，监测SINK RATE和PULL UP警告',
      mode2: 'Mode 2 - 地形接近率分析，监测过度地形接近警告',
      mode3: 'Mode 3 - 高度损失分析，监测DON\'T SINK警告',
      mode4: 'Mode 4 - 地形穿越分析，监测TOO LOW TERRAIN警告',
      mode5: 'Mode 5 - 下滑道偏离分析，监测GLIDE SLOPE警告'
    },
    
    // 计算结果
    calculationResult: null,
    
    // GPWS告警模拟数据
    gpws: {
      activeMode: 'mode1',
      
      // Mode 1 参数
      mode1: {
        ra: '',
        descentRate: '', // 用户输入的下降率
        thresholdResult: null // 阈值计算结果
      },

      // Mode 2 参数
      mode2: {
        ra: '',
        tcr: '',
        airspeed: '',
        flapsInLanding: false,
        gearDown: false, // 新增：起落架状态
        ilsMode: false, // 新增：ILS进近模式
        tadActive: false,
        result: null
      },

      // Mode 3 参数 - 判断是否触发DON'T SINK警告
      mode3: {
        ra: '',
        altitudeLoss: '', // 实际的高度损失
        result: null
      },

      // Mode 4 参数 - 分类选择设计
      mode4: {
        subMode: '4A', // 子模式选择：4A, 4B, 4C
        subModeDisplayName: 'Mode 4A - 巡航进近（起落架收上）', // 显示名称
        ra: '',
        airspeed: '',
        maxRA: '', // 仅Mode 4C需要
        
        // Mode 4A 参数
        mode4A_GearUp: true, // 4A要求起落架收上
        mode4A_FlapsInLanding: false, // 4A要求襟翼不在着陆构型
        mode4A_LdgConf3Selected: true, // MCDU LDG CONF 3选择 - 默认已选择
        mode4A_TADHighIntegrity: false, // TAD高完整性
        mode4A_TCFEnabled: false, // TCF启用
        mode4A_OverflightDetected: false, // 飞越检测
        
        // Mode 4B 参数
        mode4B_GearDown: true, // 4B起落架放下
        mode4B_FlapsInLanding: false, // 4B襟翼不在着陆构型
        mode4B_TADHighIntegrity: false, // TAD高完整性
        mode4B_TCFEnabled: false, // TCF启用
        mode4B_OverflightDetected: false, // 4B飞越检测
        
        // Mode 4C 参数 (起飞阶段)
        mode4C_TakeoffPhase: true, // 4C起飞阶段标志
        mode4C_GearOrFlapsDown: false, // 起落架或襟翼放下
        
        result: null
      },

      // Mode 5 参数
      mode5: {
        ra: '',
        gsDeviation: '',
        result: null
      }
    },

    // Mode 4 子模式选择器
    showMode4SubModePicker: false,
    mode4SubModeActions: [
      { name: 'Mode 4A - 巡航进近（起落架收上，襟翼非着陆构型）', value: '4A' },
      { name: 'Mode 4B - 进近构型（起落架放下或襟翼着陆构型）', value: '4B' },
      { name: 'Mode 4C - 起飞阶段地形穿越', value: '4C' }
    ]
  },

  onLoad() {
  },

  onShow() {
    // 页面显示时的处理逻辑
  },

  onUnload() {
    // 页面卸载清理
    this.setData({
      calculating: false,
      calculationResult: null
    });
  },


  // 步骤控制方法
  nextStep() {
    const currentStep = this.data.currentStep;
    
    // 防止重复点击
    if (this.data.calculating) {
      wx.showToast({
        title: '计算中，请稍候',
        icon: 'loading',
        duration: 1000
      });
      return;
    }
    
    // 校验当前步骤的输入
    if (currentStep === 1) {
      if (!this.data.gpws.activeMode) {
        wx.showToast({
          title: '请先选择GPWS模式',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 2) {
      // 验证参数输入
      if (!this.validateCurrentModeInputs()) {
        wx.showToast({
          title: '请完成参数输入',
          icon: 'none'
        });
        return;
      }
    }
    
    // 进入下一步
    if (currentStep === 2) {
      // 设置计算状态并显示loading
      this.setData({ calculating: true });
      
      // 显示计算进度提示
      wx.showLoading({
        title: '计算中...',
        mask: true
      });
      
      const activeMode = this.data.gpws.activeMode;
      this.executeCalculation(activeMode);
    } else {
      this.setData({
        currentStep: currentStep + 1
      });
    }
  },

  // 返回上一步
  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1,
        calculationResult: null // 清除结果
      });
    }
  },

  // 重新开始
  restart() {
    // 隐藏可能存在的loading提示
    wx.hideLoading();
    
    this.setData({
      currentStep: 1,
      calculating: false, // 重置计算状态
      'gpws.activeMode': 'mode1',
      'gpws.mode1.ra': '',
      'gpws.mode1.descentRate': '',
      'gpws.mode1.thresholdResult': null,
      'gpws.mode2.ra': '',
      'gpws.mode2.tcr': '',
      'gpws.mode2.airspeed': '',
      'gpws.mode2.flapsInLanding': false,
      'gpws.mode2.gearDown': false,
      'gpws.mode2.ilsMode': false,
      'gpws.mode2.tadActive': false,
      'gpws.mode2.result': null,
      'gpws.mode3.ra': '',
      'gpws.mode3.altitudeLoss': '',
      'gpws.mode3.result': null,
      'gpws.mode4.subMode': '4A',
      'gpws.mode4.ra': '',
      'gpws.mode4.airspeed': '',
      'gpws.mode4.maxRA': '',
      'gpws.mode4.result': null,
      'gpws.mode5.ra': '',
      'gpws.mode5.gsDeviation': '',
      'gpws.mode5.result': null,
      calculationResult: null
    });
  },

  // GPWS模式选择
  selectGPWSMode(e: any) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ 
      'gpws.activeMode': mode 
    });
    
    // 选择模式后自动进入下一步
    this.nextStep();
  },

  // 验证当前模式输入
  validateCurrentModeInputs() {
    const activeMode = this.data.gpws.activeMode;
    const gpwsData = this.data.gpws;
    
    // 辅助函数：检查值是否为有效输入（不为空字符串，允许数值0）
    const isValidInput = (value: any) => {
      return value !== '' && value !== null && value !== undefined;
    };
    
    switch (activeMode) {
      case 'mode1':
        return isValidInput(gpwsData.mode1.ra) && isValidInput(gpwsData.mode1.descentRate);
      case 'mode2':
        return isValidInput(gpwsData.mode2.ra) && isValidInput(gpwsData.mode2.tcr);
      case 'mode3':
        return isValidInput(gpwsData.mode3.ra) && isValidInput(gpwsData.mode3.altitudeLoss);
      case 'mode4':
        return isValidInput(gpwsData.mode4.ra) && isValidInput(gpwsData.mode4.airspeed) && 
               (gpwsData.mode4.subMode !== '4C' || isValidInput(gpwsData.mode4.maxRA));
      case 'mode5':
        return isValidInput(gpwsData.mode5.ra) && isValidInput(gpwsData.mode5.gsDeviation);
      default:
        return false;
    }
  },

  // 执行对应模式的计算
  executeCalculation(mode: string) {
    switch(mode) {
      case 'mode1':
        this.calculateGPWSMode1();
        break;
      case 'mode2':
        this.calculateGPWSMode2();
        break;
      case 'mode3':
        this.calculateGPWSMode3();
        break;
      case 'mode4':
        this.calculateGPWSMode4();
        break;
      case 'mode5':
        this.calculateGPWSMode5();
        break;
    }
  },

  // 选择子模式方法
  selectSubMode(event: any) {
    const subMode = event.currentTarget.dataset.submode;
    const displayNames: {[key: string]: string} = {
      '4A': 'Mode 4A - 巡航进近（起落架收上）',
      '4B': 'Mode 4B - 进近构型（起落架放下或襟翼着陆构型）',
      '4C': 'Mode 4C - 起飞阶段地形穿越'
    };
    
    this.setData({
      'gpws.mode4.subMode': subMode,
      'gpws.mode4.subModeDisplayName': displayNames[subMode] || subMode
    });
  },

  // 设置计算结果
  setCalculationResult(result: any) {
    // 根据原始计算结果的类型设置图标和状态（修复显示不一致bug）
    let icon = '✅';
    let type = 'safe';
    
    // 使用原始result.type字段进行判断，而不是解析status字符串
    if (result.type === 'warning') {
      icon = '⚠️';
      type = 'warning';
    } else if (result.type === 'danger') {
      icon = '🚨';
      type = 'alert';
    } else if (result.type === 'normal') {
      icon = '✅';
      type = 'safe';
    }
    
    // 兼容旧逻辑：如果result.type不存在，fallback到status字符串检查
    if (!result.type) {
      if (result.status && (
        result.status.includes('警告') ||
        result.status.includes('SINK RATE') ||
        result.status.includes('TERRAIN') ||
        result.status.includes('DON\'T SINK') ||
        result.status.includes('GLIDE SLOPE')
      )) {
        icon = '⚠️';
        type = 'warning';
      } else if (result.status && result.status.includes('PULL UP')) {
        icon = '🚨';
        type = 'alert';
      }
    }
    
    // 设置计算结果并同时更新到步骤3
    this.setData({
      calculationResult: {
        ...result,
        icon: icon,
        type: type
      },
      currentStep: 3,  // 确保只有在设置了结果后才跳转到步骤3
      calculating: false  // 清除计算状态
    });
    
    // 隐藏loading提示
    wx.hideLoading();
  },

  // ========== GPWS计算相关方法 - 每个Mode独立计算 ==========

  // Mode 1 计算
  calculateGPWSMode1() {
    const validateParams = () => {
      const mode1Data = this.data.gpws.mode1;
      
      if (!mode1Data.ra) {
        return { valid: false, message: '请输入无线电高度' };
      }

      if (!mode1Data.descentRate) {
        return { valid: false, message: '请输入下降率' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGPWSMode1Calculation();
    };

    const buttonChargeManager = require('../../../utils/button-charge-manager.js');
      
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 1 告警分析',
      performCalculation
    );
  },

  // Mode 1 具体计算逻辑 - 告警分析
  performGPWSMode1Calculation() {
    const mode1Data = this.data.gpws.mode1;
    const ra = parseFloat(mode1Data.ra);
    const descentRate = parseFloat(mode1Data.descentRate);
    
    if (ra <= 10 || ra >= 2450) {
      this.setData({
        'gpws.mode1.thresholdResult': {
          valid: false,
          message: 'Mode 1 仅在10-2450ft无线电高度范围内有效',
          raValue: ra
        }
      });
      return;
    }

    // 计算SINK RATE和PULL UP的阈值
    const sinkRateThreshold = Math.abs((ra + 572) / (-0.6035));
    
    let pullUpThreshold;
    if (ra > 1000) {
      pullUpThreshold = Math.abs((ra + 400) / (-0.400));
    } else {
      pullUpThreshold = Math.abs((ra + 1620) / (-1.1133));
    }

    // 判断告警状态
    let status = '✅ 安全范围';
    let message = '当前下降率在安全范围内';
    let type = 'normal';
    let warningLevel = '';

    if (descentRate >= pullUpThreshold) {
      status = '🚨 PULL UP';
      message = '触发PULL UP红色警告！立即拉起！';
      type = 'danger';
      warningLevel = 'PULL UP (红色警告)';
    } else if (descentRate >= sinkRateThreshold) {
      status = '⚠️ SINK RATE';
      message = '触发SINK RATE黄色警告';
      type = 'warning';
      warningLevel = 'SINK RATE (黄色警告)';
    }

    const result = {
      valid: true,
      status: status,
      message: message,
      type: type,
      raValue: ra,
      descentRateValue: descentRate,
      sinkRateThreshold: Math.round(sinkRateThreshold),
      pullUpThreshold: Math.round(pullUpThreshold),
      warningLevel: warningLevel,
      thresholdInfo: `SINK RATE门限: ${Math.round(sinkRateThreshold)}ft/min, PULL UP门限: ${Math.round(pullUpThreshold)}ft/min`,
      detailedInfo: `在RA=${ra}ft、下降率=${descentRate}ft/min时的分析结果`
    };
    
    this.setData({
      'gpws.mode1.thresholdResult': result
    });
    
    // 设置计算结果用于新界面显示
    this.setCalculationResult(result);
  },

  // Mode 2 计算
  calculateGPWSMode2() {
    const validateParams = () => {
      const mode2Data = this.data.gpws.mode2;
      
      if (!mode2Data.ra || !mode2Data.tcr) {
        return { valid: false, message: '请输入无线电高度和地形接近率' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGPWSMode2Calculation();
    };

    const buttonChargeManager = require('../../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 2 分析',
      performCalculation
    );
  },

  // Mode 2 具体计算逻辑 - 过度地形接近率
  performGPWSMode2Calculation() {
    const mode2Data = this.data.gpws.mode2;
    const ra = parseFloat(mode2Data.ra);
    const tcr = parseFloat(mode2Data.tcr);
    const airspeed = parseFloat(mode2Data.airspeed) || 180;  // 默认空速
    const flapsInLanding = mode2Data.flapsInLanding;
    const gearDown = mode2Data.gearDown;
    const ilsMode = mode2Data.ilsMode;
    const tadActive = mode2Data.tadActive;
    
    let status = '正常状态';
    let message = '当前参数在安全范围内';
    let type = 'normal';
    let thresholdInfo = '';
    let envelopeInfo = '';
    
    // 模式2 - 过度地形接近率 (基于权威文档的精确实现)
    
    if (flapsInLanding || ilsMode) {
      // ===== 模式2B - 襟翼在着陆构型 或 ILS进近模式 =====
      
      // Mode 2B上限计算
      let upperLimit = 789;  // Mode 2B基础上限
      let maxClosureRate = 3000;  // Mode 2B最大逼近率
      
      if (tadActive) {
        upperLimit = 950;   // TAD激活时上限为950ft
      }
      
      // Mode 2B边界检查
      let inMode2BEnvelope = false;
      let violatesMode2BEnvelope = false;
      
      // Mode 2B关键逼近率阈值（根据图表）
      const mode2B_MinTCR = 2038;  // Mode 2B开始激活的最小TCR
      const mode2B_TransitionTCR = 2253;  // 下边界转换点
      
      // 检查是否在Mode 2B有效包络范围内
      if (tcr >= mode2B_MinTCR && tcr <= maxClosureRate && ra >= 30 && ra <= upperLimit) {
        inMode2BEnvelope = true;
        
        // Mode 2B包络线计算
        const lowerSlope2B = -1579 + 0.7895 * tcr;  // 下部斜线
        const upperSlope2B = 522 + 0.1968 * tcr;    // 上部斜线
        
        // 根据模式和TCR确定下边界逻辑
        let effectiveLowerBoundary;
        
        if (tcr < mode2B_TransitionTCR) {
          // TCR在2038-2253 FPM之间：使用斜线边界
          if (ilsMode && !flapsInLanding) {
            // ILS模式但襟翼未在着陆位置：下边界仅由无线电高度控制，恒定30ft截止
            effectiveLowerBoundary = 30;
          } else {
            // 使用斜线计算的下边界
            effectiveLowerBoundary = Math.max(lowerSlope2B, 30);
          }
        } else {
          // TCR >= 2253 FPM：使用水平边界200ft（襟翼放下时会变化）
          if (flapsInLanding) {
            // 襟翼放下：下边界根据高度率变化（Mode 2B inhibit特性）
            effectiveLowerBoundary = 200;  // 基础水平边界
          } else if (ilsMode) {
            // ILS模式：恒定30ft下边界
            effectiveLowerBoundary = 30;
          } else {
            effectiveLowerBoundary = 200;  // 标准水平边界
          }
        }
        
        // 检查是否穿透包络线（在包络线以下）
        if (ra <= Math.max(effectiveLowerBoundary, upperSlope2B)) {
          violatesMode2BEnvelope = true;
        
          // 根据着陆构型和进近模式判断警告类型
          if (flapsInLanding && gearDown) {
            // 起落架和襟翼都在着陆构型：只发TERRAIN警告（Mode 2B抑制PULL UP）
            status = 'TERRAIN';
            message = `TERRAIN警告：地形接近率过大（完整着陆构型 - 抑制PULL UP）`;
            type = 'warning';
          } else if (ilsMode && !flapsInLanding) {
            // ILS进近模式但襟翼未在着陆位置：根据起落架状态判断
            if (gearDown) {
              status = 'TERRAIN';
              message = `TERRAIN警告：ILS进近中地形接近率过大`;
              type = 'warning';
            } else {
              status = 'PULL UP';
              message = `TERRAIN → PULL UP：ILS进近中严重地形接近威胁`;
              type = 'danger';
            }
          } else {
            // 襟翼在着陆构型但起落架未放下，或其他情况：TERRAIN followed by PULL UP
            status = 'PULL UP';
            message = `TERRAIN → PULL UP：严重地形接近威胁（部分着陆构型）`;
            type = 'danger';
          }
          
          thresholdInfo = `RA: ${ra}ft ≤ 包络线 (下: ${effectiveLowerBoundary.toFixed(0)}ft, 上: ${upperSlope2B.toFixed(0)}ft)`;
          
          // 构建详细的包络信息
          let modeDescription = '2B';
          if (ilsMode && flapsInLanding) {
            modeDescription += ' (ILS+襟翼)';
          } else if (ilsMode) {
            modeDescription += ' (ILS)';
          } else if (flapsInLanding) {
            modeDescription += ' (襟翼)';
          }
          
          envelopeInfo = `TCR: ${tcr}ft/min, 襟翼: ${flapsInLanding ? '着陆构型' : '非着陆构型'}, 起落架: ${gearDown ? '放下' : '收上'}, ILS: ${ilsMode ? '激活' : '未激活'}, 上限: ${upperLimit}ft, 模式: ${modeDescription}`;
        }
      }
      
      // 如果不在Mode 2B包络内，提供状态说明
      if (!inMode2BEnvelope) {
        let modeDescriptor = 'Mode 2B';
        if (ilsMode && flapsInLanding) {
          modeDescriptor += ' (ILS+襟翼)';
        } else if (ilsMode) {
          modeDescriptor += ' (ILS)';
        } else if (flapsInLanding) {
          modeDescriptor += ' (襟翼)';
        }
        
        if (tcr <= 0) {
          message = 'Mode 2仅在正向地形接近率时有效（TCR > 0）';
        } else if (tcr < mode2B_MinTCR) {
          message = `${modeDescriptor}需要TCR ≥ ${mode2B_MinTCR}ft/min才能激活`;
        } else if (tcr > maxClosureRate) {
          message = `${modeDescriptor}地形接近率超出有效范围（TCR > ${maxClosureRate}ft/min）`;
        } else if (ra < 30) {
          message = `${modeDescriptor}低于30ft时自动抑制`;
        } else if (ra > upperLimit) {
          message = `${modeDescriptor}高于${upperLimit}ft时不激活`;
        }
        
        const activationCondition = ilsMode || flapsInLanding ? 
          `激活条件: ${ilsMode ? 'ILS进近' : ''}${ilsMode && flapsInLanding ? '+' : ''}${flapsInLanding ? '襟翼着陆构型' : ''}` :
          '激活条件: 襟翼着陆构型 或 ILS进近';
        
        thresholdInfo = `当前: RA=${ra}ft, TCR=${tcr}ft/min, 有效范围: 30-${upperLimit}ft, ${mode2B_MinTCR}-${maxClosureRate}ft/min, ${activationCondition}`;
      }
      
    } else {
      // ===== 模式2A - 襟翼未在着陆构型 =====
      
      // Mode 2A上限和最大逼近率计算
      let upperLimit = 1650;  // Mode 2A基础上限
      let maxClosureRate = 5733;  // Mode 2A基础最大逼近率
      
      // 空速扩展计算（仅在TAD未激活时）
      if (!tadActive && airspeed >= 220) {
        if (airspeed >= 310) {
          upperLimit = 2450;
          maxClosureRate = 9800;
        } else {
          // 线性插值: 220-310kt之间
          const speedRatio = (airspeed - 220) / (310 - 220);
          upperLimit = 1650 + speedRatio * (2450 - 1650);
          maxClosureRate = 5733 + speedRatio * (9800 - 5733);
        }
      } else if (tadActive) {
        // TAD激活时：上限降低到950ft，最大逼近率相应调整
        upperLimit = 950;
        maxClosureRate = Math.min(5733, maxClosureRate);
      }
      
      // Mode 2A边界检查
      let inMode2AEnvelope = false;
      let violatesMode2AEnvelope = false;
      
      // Mode 2A关键逼近率阈值（根据图表）
      const mode2A_MinTCR = 2038;  // Mode 2A开始有效边界的最小TCR（与Mode 2B相同）
      
      // 检查是否在Mode 2A有效包络范围内
      if (tcr >= mode2A_MinTCR && tcr <= maxClosureRate && ra >= 30 && ra <= upperLimit) {
        inMode2AEnvelope = true;
        
        // Mode 2A包络线计算
        const lowerSlope2A = -1579 + 0.7895 * tcr;  // 下部斜线
        const upperSlope2A = 522 + 0.1968 * tcr;    // 上部斜线
        
        // 检查是否穿透包络线（在包络线以下）
        if (ra <= Math.max(lowerSlope2A, upperSlope2A)) {
          violatesMode2AEnvelope = true;
          
          // Mode 2A：先TERRAIN警告，持续则转为PULL UP
          status = 'PULL UP';
          message = `TERRAIN → PULL UP：严重地形接近威胁`;
          type = 'danger';
          
          thresholdInfo = `RA: ${ra}ft ≤ 包络线 (下: ${Math.max(lowerSlope2A, 30).toFixed(0)}ft, 上: ${upperSlope2A.toFixed(0)}ft)`;
          envelopeInfo = `TCR: ${tcr}ft/min, 空速: ${airspeed}kt, 上限: ${upperLimit.toFixed(0)}ft, 最大TCR: ${maxClosureRate.toFixed(0)}ft/min, 模式: 2A`;
        }
      }
      
      // 如果不在Mode 2A包络内，提供状态说明
      if (!inMode2AEnvelope) {
        if (tcr <= 0) {
          message = 'Mode 2仅在正向地形接近率时有效（TCR > 0）';
        } else if (tcr < mode2A_MinTCR) {
          message = `Mode 2A需要TCR ≥ ${mode2A_MinTCR}ft/min才有有效边界`;
        } else if (tcr > maxClosureRate) {
          message = `Mode 2A地形接近率超出有效范围（TCR > ${maxClosureRate.toFixed(0)}ft/min）`;
        } else if (ra < 30) {
          message = 'Mode 2A低于30ft时自动抑制';
        } else if (ra > upperLimit) {
          message = `Mode 2A高于${upperLimit.toFixed(0)}ft时不激活`;
        }
        thresholdInfo = `当前: RA=${ra}ft, TCR=${tcr}ft/min, 有效范围: 30-${upperLimit.toFixed(0)}ft, ${mode2A_MinTCR}-${maxClosureRate.toFixed(0)}ft/min`;
      }
    }
    
    const result = {
      status,
      message,
      type,
      thresholdInfo,
      envelopeInfo
    };
    
    this.setData({
      'gpws.mode2.result': result
    });
    
    // 设置计算结果用于新界面显示
    this.setCalculationResult(result);
  },

  // Mode 3 计算
  calculateGPWSMode3() {
    const validateParams = () => {
      const mode3Data = this.data.gpws.mode3;
      
      if (!mode3Data.ra || !mode3Data.altitudeLoss) {
        return { valid: false, message: '请输入无线电高度和高度损失' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGPWSMode3Calculation();
    };

    const buttonChargeManager = require('../../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 3 分析',
      performCalculation
    );
  },

  // Mode 3 具体计算逻辑 - 基于空客AMM的完整实现
  performGPWSMode3Calculation() {
    const mode3Data = this.data.gpws.mode3;
    const ra = parseFloat(mode3Data.ra);
    const actualAltitudeLoss = parseFloat(mode3Data.altitudeLoss);
    
    // 验证输入
    if (!ra || ra < 8 || ra > 1500) {
      this.setData({
        'gpws.mode3.result': {
          status: '输入无效',
          message: 'Mode 3有效范围：8-1500ft RA',
          type: 'warning',
          thresholdInfo: '请输入有效的无线电高度',
          detailedInfo: '参考图表：Mode 3在8ft以下被抑制，1500ft以上不适用'
        }
      });
      return;
    }
    
    if (actualAltitudeLoss < 0) {
      this.setData({
        'gpws.mode3.result': {
          status: '输入无效',
          message: '高度损失不能为负值',
          type: 'warning',
          thresholdInfo: '请输入正确的高度损失值',
          detailedInfo: '高度损失应为正数，表示损失的高度'
        }
      });
      return;
    }
    
    // 根据AMM公式和用户说明确定警告门限
    // 整个8-1500ft区间都使用线性关系：ALTITUDE LOSS = 5.4 + 0.092 × RA
    let warningThreshold = 5.4 + 0.092 * ra;
    let zone = '线性区域';
    let formula = `5.4 + 0.092 × ${ra} = ${warningThreshold.toFixed(1)}ft`;
    
    // 判断是否触发警告
    const isWarningTriggered = actualAltitudeLoss > warningThreshold;
    
    let status, message, type;
    
    if (isWarningTriggered) {
      status = 'DON\'T SINK 警告';
      message = `警告触发！高度损失${actualAltitudeLoss}ft 超过门限${warningThreshold.toFixed(1)}ft`;
      type = 'warning';
    } else {
      status = '安全范围';
      message = `正常状态，高度损失${actualAltitudeLoss}ft 未超过门限${warningThreshold.toFixed(1)}ft`;
      type = 'normal';
    }
    
    // 生成结果
    const result = {
      status: status,
      message: message,
      type: type,
      thresholdInfo: `RA ${ra}ft 对应门限：${warningThreshold.toFixed(1)}ft`,
      detailedInfo: `${zone} | ${formula} | 实际损失：${actualAltitudeLoss}ft | ${isWarningTriggered ? '⚠️ 触发警告' : '✅ 安全范围'}`
    };
    
    this.setData({
      'gpws.mode3.result': result
    });
    
    // 设置计算结果用于新界面显示
    this.setCalculationResult(result);
  },

  // Mode 4 计算
  calculateGPWSMode4() {
    const validateParams = () => {
      const mode4Data = this.data.gpws.mode4;
      
      if (!mode4Data.ra || !mode4Data.airspeed) {
        return { valid: false, message: '请输入无线电高度和空速' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGPWSMode4Calculation();
    };

    const buttonChargeManager = require('../../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 4 分析',
      performCalculation
    );
  },

  // Mode 4 具体计算逻辑 - 不安全地形穿越分析
  performGPWSMode4Calculation() {
    const mode4Data = this.data.gpws.mode4;
    const ra = parseFloat(mode4Data.ra);
    const airspeed = parseFloat(mode4Data.airspeed);
    const subMode = mode4Data.subMode;
    
    let status = '✅ 正常状态';
    let message = '当前参数在安全范围内';
    let type = 'normal';
    let subModeInfo = '';
    let thresholdInfo = '';
    let envelopeInfo = '';
    
    if (subMode === '4A') {
      // Mode 4A - 巡航和进近阶段
      subModeInfo = 'Mode 4A - 巡航和进近阶段（起落架收上，襟翼非着陆构型）';
      
      const tadHighIntegrity = mode4Data.mode4A_TADHighIntegrity;
      const tcfEnabled = mode4Data.mode4A_TCFEnabled;
      
      // Mode 4A已激活（默认LDG CONF 3已选择）
      {
        // 基于AMM权威文档的Mode 4A计算逻辑
        let threshold = 500;  // 标准上边界500ft
        let warningMessage = '';
        let boundaryType = '标准';
        
        // 根据空速和系统状态确定阈值和警告类型
        if (airspeed < 190) {
          // 低于190kts时，穿透500ft边界触发TOO LOW GEAR
          threshold = 500;
          warningMessage = 'TOO LOW GEAR';
          boundaryType = '标准边界（500ft）';
        } else {
          // 高于190kts时的扩展警戒区域
          if (tcfEnabled || tadHighIntegrity) {
            // TCF启用或TAD高完整性：边界保持500ft不变
            threshold = 500;
            warningMessage = 'TOO LOW TERRAIN';
            boundaryType = '500ft固定（TAD高完整性或TCF启用）';
          } else {
            // TCF未启用且TAD非高完整性：边界线性增加到1000ft
            if (airspeed >= 250) {
              threshold = 1000;  // 250kts及以上时最大1000ft
            } else {
              // 190-250kts线性增加：500ft到1000ft
              threshold = 500 + (airspeed - 190) * ((1000 - 500) / (250 - 190));
            }
            warningMessage = 'TOO LOW TERRAIN';
            boundaryType = `扩展告警区域（${threshold.toFixed(0)}ft）`;
          }
        }
        
        // 检查飞越检测影响（基于图表：OVERFLIGHT AND FLAPS UP）
        // Mode 4A默认襟翼收上，所以飞越检测直接适用
        const overflightDetected = mode4Data.mode4A_OverflightDetected;
        if (overflightDetected) {
          // 飞越其他航空器时，最大高度从1000ft降为800ft
          if (threshold > 800) {
            threshold = 800;
            boundaryType = boundaryType.indexOf('扩展') !== -1 ? `扩展告警区域（800ft飞越限制）` : `${boundaryType}（800ft飞越限制）`;
          }
        }
        
        // 检查几何高度功能影响
        if (tadHighIntegrity && tcfEnabled) {
          // 所有功能高完整性时，最大限制降为500ft
          if (threshold > 500) {
            threshold = 500;
            boundaryType = '几何高度激活：500ft最大限制';
            envelopeInfo = '几何高度功能激活：最大限制500ft | ';
          }
        }
      
        if (ra < threshold) {
          status = `🚨 ${warningMessage}`;
          message = `Mode 4A警告：${warningMessage === 'TOO LOW GEAR' ? '起落架收上时高度过低' : '地形高度过低'}`;
          type = 'danger';
          thresholdInfo = `当前RA: ${ra}ft < 阈值: ${threshold.toFixed(0)}ft`;
          
          // 添加操作建议
          let actionAdvice = '';
          if (warningMessage === 'TOO LOW GEAR') {
            actionAdvice = ' | 建议：放下起落架或增加高度';
          } else {
            actionAdvice = ' | 建议：增加高度或检查地形';
          }
          
          envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'} | 飞越: ${overflightDetected ? '是' : '否'}${actionAdvice}`;
        } else {
          thresholdInfo = `当前RA: ${ra}ft ≥ 阈值: ${threshold.toFixed(0)}ft（安全）`;
          envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'} | 飞越: ${overflightDetected ? '是' : '否'}`;
        }
      }
      
    } else if (subMode === '4B') {
      // Mode 4B - 进近构型（基于权威文档的精确实现）
      subModeInfo = 'Mode 4B - 进近构型（起落架放下或襟翼着陆构型）';
    
      const gearDown = mode4Data.mode4B_GearDown;  // Mode 4B起落架状态
      const flapsInLanding = mode4Data.mode4B_FlapsInLanding;
      const tadHighIntegrity = mode4Data.mode4B_TADHighIntegrity;
      const tcfEnabled = mode4Data.mode4B_TCFEnabled;
      
      // 根据权威文档：Mode 4B激活条件
      const mode4BActive = gearDown || flapsInLanding;
      
      if (!mode4BActive) {
        status = '⚪ 模式未激活';
        message = 'Mode 4B未激活：需要起落架放下或襟翼在着陆构型';
        type = 'normal';
        subModeInfo += ' - 未激活';
        thresholdInfo = 'Mode 4B激活条件：起落架放下 OR 襟翼在着陆构型';
        envelopeInfo = '';
      } else {
        // 检查抑制条件：
        const allConfigInLanding = gearDown && flapsInLanding;
        
        if (allConfigInLanding) {
          status = '⚪ 全构型抑制';
          message = 'Mode 4B被抑制：起落架和襟翼均在着陆构型';
          type = 'normal';
          subModeInfo += ' - 全构型抑制';
          thresholdInfo = '当起落架和襟翼均在着陆构型时，所有Mode 4告警被抑制（正常着陆构型）';
          envelopeInfo = 'GPWS/FLAP MODE开关正常开启，仅全构型时自动抑制告警';
        } else {
          // Mode 4B激活，基于权威文档进行精确计算
          let threshold = 245;
          let warningMessage = '';
          let boundaryType = '标准边界（245ft）';
          
          if (airspeed < 159) {
            threshold = 245;
            boundaryType = '固定边界（159kts以下）';
            
            if (!gearDown && flapsInLanding) {
              warningMessage = 'TOO LOW GEAR';  // 起落架收上，襟翼在着陆构型
            } else if (gearDown && !flapsInLanding) {
              warningMessage = 'TOO LOW FLAPS'; // 起落架放下，襟翼非着陆构型
            }
          } else {
            // Above 159 kts
            if (!gearDown && flapsInLanding) {
              threshold = 245;
              warningMessage = 'TOO LOW GEAR';
              boundaryType = '固定边界（起落架收上+襟翼着陆构型）';
            } else if (gearDown && !flapsInLanding) {
              warningMessage = 'TOO LOW TERRAIN';
              
              if (tadHighIntegrity || tcfEnabled) {
                threshold = 245;
                boundaryType = 'TAD/TCF固定边界（245ft）';
              } else {
                if (airspeed >= 250) {
                  threshold = 1000;
                  boundaryType = '扩展告警区域（最大1000ft）';
                } else {
                  // 159-250kts线性增加：245ft到1000ft
                  threshold = 245 + (airspeed - 159) * ((1000 - 245) / (250 - 159));
                  boundaryType = `扩展告警区域（${threshold.toFixed(0)}ft）`;
                }
              }
            }
          }
          
          // 检查飞越检测影响（基于图表：OVERFLIGHT AND FLAPS UP）
          const overflightDetected = mode4Data.mode4B_OverflightDetected;
          const flapsUp = !flapsInLanding;  // 襟翼收上
          if (overflightDetected && flapsUp && threshold > 800) {
            threshold = 800;
            boundaryType = boundaryType.indexOf('扩展') !== -1 ? `扩展告警区域（800ft飞越+襟翼收上限制）` : `${boundaryType}（800ft飞越+襟翼收上限制）`;
          }
          
          // 检查几何高度功能影响
          if (tadHighIntegrity && tcfEnabled && threshold > 500) {
            threshold = 500;
            boundaryType = '几何高度激活：500ft最大限制';
          }
          
          // 评估告警状态
          if (ra < threshold && warningMessage) {
            status = `🚨 ${warningMessage}`;
            let alertType = '';
            if (warningMessage === 'TOO LOW GEAR') {
              alertType = '起落架相关高度过低';
            } else if (warningMessage === 'TOO LOW FLAPS') {
              alertType = '襟翼配置高度过低';
            } else {
              alertType = '地形高度过低';
            }
            
            message = `Mode 4B警告：${alertType}`;
            type = 'danger';
            thresholdInfo = `当前RA: ${ra}ft < 阈值: ${threshold.toFixed(0)}ft`;
            
            // 添加操作建议
            let actionAdvice = '';
            if (warningMessage === 'TOO LOW GEAR') {
              actionAdvice = ' | 建议：放下起落架或增加高度';
            } else if (warningMessage === 'TOO LOW FLAPS') {
              actionAdvice = ' | 建议：调整襟翼至着陆构型或增加高度';
            } else {
              actionAdvice = ' | 建议：增加高度或检查地形';
            }
            
            envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | 起落架: ${gearDown ? '放下' : '收上'} | 襟翼: ${flapsInLanding ? '着陆构型' : '非着陆构型'} | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'}${actionAdvice}`;
          } else {
            thresholdInfo = `当前RA: ${ra}ft ≥ 阈值: ${threshold.toFixed(0)}ft（安全）`;
            envelopeInfo = `${boundaryType} | 空速: ${airspeed}kts | 起落架: ${gearDown ? '放下' : '收上'} | 襟翼: ${flapsInLanding ? '着陆构型' : '非着陆构型'} | TAD: ${tadHighIntegrity ? '高完整性' : '标准'} | TCF: ${tcfEnabled ? '启用' : '关闭'}`;
          }
        }
      }
      
    } else if (subMode === '4C') {
      // Mode 4C - 起飞阶段地形穿越
      subModeInfo = 'Mode 4C - 起飞阶段地形穿越';
    
      const maxRA = parseFloat(mode4Data.maxRA) || 0;
      const gearOrFlapsDown = mode4Data.mode4C_GearOrFlapsDown;
      
      if (maxRA <= 0) {
        status = '⚠️ 参数错误';
        message = 'Mode 4C需要输入起飞后达到的最大RA值';
        type = 'warning';
        thresholdInfo = '请输入起飞过程中达到的最大无线电高度';
        envelopeInfo = '示例：起飞后RA从0上升到400ft';
      } else {
        // 实现75%滤波器逻辑
        const filterValue = 0.75 * maxRA;
        
        if (ra < filterValue && gearOrFlapsDown) {
          status = '🚨 TOO LOW TERRAIN';
          message = 'Mode 4C警告：起飞阶段地形穿越高度不足！';
          type = 'danger';
          thresholdInfo = `当前RA: ${ra}ft < 滤波器值: ${filterValue.toFixed(0)}ft`;
          envelopeInfo = `75%滤波器: 0.75 × ${maxRA}ft = ${filterValue.toFixed(0)}ft | 起落架或襟翼放下时触发警告`;
        } else if (ra < filterValue && !gearOrFlapsDown) {
          status = '⚪ 条件不满足';
          message = 'RA低于滤波器值，但起落架和襟翼都收起，不触发警告';
          type = 'normal';
          thresholdInfo = `当前RA: ${ra}ft < 滤波器值: ${filterValue.toFixed(0)}ft`;
          envelopeInfo = `75%滤波器: 0.75 × ${maxRA}ft = ${filterValue.toFixed(0)}ft | 需要起落架或襟翼放下才触发警告`;
        } else {
          thresholdInfo = `当前RA: ${ra}ft ≥ 滤波器值: ${filterValue.toFixed(0)}ft（安全）`;
          envelopeInfo = `75%滤波器: 0.75 × ${maxRA}ft = ${filterValue.toFixed(0)}ft | 起飞阶段地形穿越高度充足`;
        }
      }
    }
    
    const result = {
      status,
      message,
      type,
      subModeInfo,
      thresholdInfo,
      envelopeInfo
    };
    
    this.setData({
      'gpws.mode4.result': result
    });
    
    // 设置计算结果用于新界面显示
    this.setCalculationResult(result);
  },

  // Mode 5 计算
  calculateGPWSMode5() {
    const validateParams = () => {
      const mode5Data = this.data.gpws.mode5;
      
      if (!mode5Data.ra || !mode5Data.gsDeviation) {
        return { valid: false, message: '请输入无线电高度和下滑道偏离度' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performGPWSMode5Calculation();
    };

    const buttonChargeManager = require('../../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-gpws',
      validateParams,
      'GPWS Mode 5 分析',
      performCalculation
    );
  },

  // Mode 5 具体计算逻辑 - 过度下滑道偏离
  performGPWSMode5Calculation() {
    const mode5Data = this.data.gpws.mode5;
    const ra = parseFloat(mode5Data.ra);
    const gsDeviation = parseFloat(mode5Data.gsDeviation);
    
    let status = '✅ 正常状态';
    let message = '当前参数在安全范围内';
    let type = 'normal';
    let thresholdInfo = '';
    let envelopeInfo = '';
    
    // Mode 5 - 过度下滑道下偏 (基于权威文档的精确实现)
    
    if (ra >= 1000) {
      message = 'Mode 5 仅在1000ft以下有效';
      thresholdInfo = `当前RA: ${ra}ft，有效范围: <1000ft`;
      envelopeInfo = '前航道ILS进近时，1000ft以下才启用下滑道偏离检查';
    } else {
      // 计算基于高度的动态阈值（150ft以下有额外容限）
      let softThreshold = 1.3;  // 软警告基准阈值
      let loudThreshold = 2.0;  // 硬警告基准阈值
      
      if (ra < 150) {
        // 150ft以下允许额外偏离容限（根据图表的斜坡计算）
        const additionalDeviation = (150 - ra) / (150 - 30) * (3.68 - 2.0);  // 硬警告额外容限
        loudThreshold = 2.0 + additionalDeviation;
        
        const softAdditionalDeviation = (150 - ra) / (150 - 30) * (2.98 - 1.3);  // 软警告额外容限  
        softThreshold = 1.3 + softAdditionalDeviation;
        
        envelopeInfo = `150ft以下额外容限：软警告${softThreshold.toFixed(1)} dots，硬警告${loudThreshold.toFixed(1)} dots | 适应跑道阈值附近波束变化`;
      } else {
        envelopeInfo = `标准包络线：软警告1.3 dots（1000-150ft），硬警告2.0 dots（300ft以下）`;
      }
      
      // 硬警告检查（大声GLIDE SLOPE）- 300ft以下且超过动态阈值
      if (ra < 300 && gsDeviation > loudThreshold) {
        status = '🚨 GLIDE SLOPE';
        message = `GLIDE SLOPE硬警告：严重下滑道偏离（大音量）`;
        type = 'danger';
        thresholdInfo = `RA: ${ra}ft < 300ft，偏离度: ${gsDeviation.toFixed(1)} > ${loudThreshold.toFixed(1)} dots`;
        
        if (ra < 150) {
          envelopeInfo += ` | 当前处于150ft以下增强容限区域`;
        }
      } 
      // 软警告检查（软GLIDE SLOPE）- 1000ft以下且超过动态阈值，但不满足硬警告条件
      else if (gsDeviation > softThreshold && !(ra < 300 && gsDeviation > loudThreshold)) {
        status = '⚠️ GLIDE SLOPE';
        message = `GLIDE SLOPE软警告：下滑道偏离（-6dB音量）`;
        type = 'warning';
        thresholdInfo = `RA: ${ra}ft，偏离度: ${gsDeviation.toFixed(1)} > ${softThreshold.toFixed(1)} dots`;
        
        if (ra < 150) {
          envelopeInfo += ` | 当前处于150ft以下增强容限区域`;
        } else if (ra >= 300) {
          envelopeInfo += ` | 300ft以上仅软警告`;
        }
      } else {
        // 安全状态
        thresholdInfo = `RA: ${ra}ft，偏离度: ${gsDeviation.toFixed(1)} dots - 在安全范围内`;
        
        if (ra < 300) {
          thresholdInfo += ` | 硬警告阈值: ${loudThreshold.toFixed(1)} dots`;
        }
        thresholdInfo += ` | 软警告阈值: ${softThreshold.toFixed(1)} dots`;
      }
    }
    
    const result = {
      status,
      message,
      type,
      thresholdInfo,
      envelopeInfo
    };
    
    this.setData({
      'gpws.mode5.result': result
    });
    
    // 设置计算结果用于新界面显示
    this.setCalculationResult(result);
  },

  // ========== GPWS输入事件处理方法 ==========

  // Mode 1 事件
  onGPWSMode1RAChange(event: any) {
    this.setData({ 'gpws.mode1.ra': event.detail });
  },

  onGPWSMode1DescentRateChange(event: any) {
    this.setData({ 'gpws.mode1.descentRate': event.detail || '' });
  },

  // Mode 2 事件
  onGPWSMode2RAChange(event: any) {
    this.setData({ 'gpws.mode2.ra': event.detail });
  },

  onGPWSMode2TCRChange(event: any) {
    this.setData({ 'gpws.mode2.tcr': event.detail });
  },

  onGPWSMode2AirspeedChange(event: any) {
    this.setData({ 'gpws.mode2.airspeed': event.detail });
  },

  onGPWSMode2FlapsChange(event: any) {
    this.setData({ 'gpws.mode2.flapsInLanding': event.detail });
  },

  onGPWSMode2GearChange(event: any) {
    this.setData({ 'gpws.mode2.gearDown': event.detail });
  },

  onGPWSMode2ILSChange(event: any) {
    this.setData({ 'gpws.mode2.ilsMode': event.detail });
  },

  onGPWSMode2TADChange(event: any) {
    this.setData({ 'gpws.mode2.tadActive': event.detail });
  },

  // Mode 3 事件
  onGPWSMode3RAChange(event: any) {
    this.setData({
      'gpws.mode3.ra': event.detail || ''
    });
  },

  onGPWSMode3AltitudeLossChange(event: any) {
    this.setData({
      'gpws.mode3.altitudeLoss': event.detail || ''
    });
  },

  // 重置Mode 3状态
  resetGPWSMode3() {
    this.setData({
      'gpws.mode3.ra': '',
      'gpws.mode3.altitudeLoss': '',
      'gpws.mode3.result': null
    });
  },

  // Mode 4 事件
  onGPWSMode4RAChange(event: any) {
    this.setData({ 'gpws.mode4.ra': event.detail });
  },

  onGPWSMode4AirspeedChange(event: any) {
    this.setData({ 'gpws.mode4.airspeed': event.detail });
  },

  onGPWSMode4MaxRAChange(event: any) {
    this.setData({ 'gpws.mode4.maxRA': event.detail });
  },

  // Mode 4A 事件处理
  onGPWSMode4A_TADHighIntegrityChange(event: any) {
    this.setData({ 'gpws.mode4.mode4A_TADHighIntegrity': event.detail });
  },

  onGPWSMode4A_TCFEnabledChange(event: any) {
    this.setData({ 'gpws.mode4.mode4A_TCFEnabled': event.detail });
  },

  onGPWSMode4A_OverflightDetectedChange(event: any) {
    this.setData({ 'gpws.mode4.mode4A_OverflightDetected': event.detail });
  },

  // Mode 4B 事件处理
  onGPWSMode4B_GearDownChange(event: any) {
    this.setData({ 'gpws.mode4.mode4B_GearDown': event.detail });
  },

  onGPWSMode4B_FlapsInLandingChange(event: any) {
    this.setData({ 'gpws.mode4.mode4B_FlapsInLanding': event.detail });
  },

  onGPWSMode4B_TADHighIntegrityChange(event: any) {
    this.setData({ 'gpws.mode4.mode4B_TADHighIntegrity': event.detail });
  },

  onGPWSMode4B_TCFEnabledChange(event: any) {
    this.setData({ 'gpws.mode4.mode4B_TCFEnabled': event.detail });
  },

  onGPWSMode4B_OverflightDetectedChange(event: any) {
    this.setData({ 'gpws.mode4.mode4B_OverflightDetected': event.detail });
  },

  // Mode 4C 事件处理
  onGPWSMode4C_GearOrFlapsDownChange(event: any) {
    this.setData({ 'gpws.mode4.mode4C_GearOrFlapsDown': event.detail });
  },

  // Mode 5 事件
  onGPWSMode5RAChange(event: any) {
    this.setData({ 'gpws.mode5.ra': event.detail });
  },

  onGPWSMode5GSDeviationChange(event: any) {
    this.setData({ 'gpws.mode5.gsDeviation': event.detail });
  },

  // ========== Mode 4 子模式选择方法 ==========

  // Mode 4 子模式选择
  showGPWSMode4SubModePicker() {
    this.setData({ showMode4SubModePicker: true });
  },

  onGPWSMode4SubModePickerClose() {
    this.setData({ showMode4SubModePicker: false });
  },

  onGPWSMode4SubModeCardSelect(event: any) {
    const selectedMode = event.currentTarget.dataset.mode;
    const selectedAction = this.data.mode4SubModeActions.find(item => item.value === selectedMode);
    this.setData({
      'gpws.mode4.subMode': selectedMode,
      'gpws.mode4.subModeDisplayName': selectedAction ? selectedAction.name : selectedMode,
      showMode4SubModePicker: false,
      'gpws.mode4.result': null // 清除之前的计算结果
    });
  },

  // ========== 工具方法 ==========

  // 清空数据
  clearData(mode: string) {
    const clearPath = `gpws.${mode}`;
    const currentData = this.data.gpws[mode as keyof typeof this.data.gpws] as any;
    
    if (currentData) {
      const clearedData = { ...currentData };
      Object.keys(clearedData).forEach(key => {
        if (key !== 'result' && key !== 'subMode' && key !== 'subModeDisplayName') {
          if (typeof clearedData[key] === 'boolean') {
            // 保持布尔值的默认状态
            return;
          }
          clearedData[key] = '';
        } else if (key === 'result') {
          clearedData[key] = null;
        }
      });
      this.setData({ [clearPath]: clearedData });
    }
  }
});