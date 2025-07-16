// 引入RODEX数据
var rodexData = require('../../data/rodex.js');

Page({
  data: {
    // 步骤控制
    currentStep: 1, // 1:跑道识别 2:污染物类型 3:覆盖范围 4:深度 5:刹车效应 6:显示结果
    
    // RODEX组件数据
    rodex: {
      runwayDesignator: '',
      runwayDesignatorDisplay: '',
      depositType: '',
      depositTypeDisplay: '',
      contaminationExtent: '',
      contaminationExtentDisplay: '',
      depthCode: '',
      depthCodeDisplay: '',
      brakingCode: '',
      brakingCodeDisplay: '',
      isCleared: false,
      russiaMode: false,
      result: null,
      error: '',
      dataLoaded: true
    },

    // 选择器相关
    showRunwayPicker: false,
    showDepositTypePicker: false,
    showContaminationExtentPicker: false,
    showDepthPicker: false,
    showBrakingPicker: false,
    
    runwayActions: [],
    depositTypeActions: [],
    contaminationExtentActions: [],
    depthActions: [],
    brakingActions: [],

    // 生成的代码
    generatedCode: '',

    // 实时RODEX代码预览
    previewCode: '',
    currentInputPart: '', // 当前正在输入的部分

    // 示例数据
    examples: [
      {
        code: 'R99/421594',
        explanation: '重复之前报告：干雪覆盖11-25%跑道；深度15mm；刹车效应中等偏好',
        category: '常用格式'
      },
      {
        code: 'R27/521235',
        explanation: '跑道27：湿雪覆盖26-50%跑道；深度12mm；摩擦系数0.35',
        category: '标准格式'
      },
      {
        code: 'R14L/3//99',
        explanation: '跑道14L：霜/雾凇；深度不明显或无法测量；刹车效应不可靠',
        category: '特殊情况'
      },
      {
        code: 'R14L/CLRD//',
        explanation: '跑道14L污染已清除，无需进一步报告',
        category: '清除状态'
      },
      {
        code: 'R88///////',
        explanation: '所有跑道都有污染但报告不可用',
        category: '报告不可用'
      },
      {
        code: 'R09/820330',
        explanation: '跑道09：压实雪覆盖11-25%跑道；深度30cm；摩擦系数0.30',
        category: '俄罗斯格式'
      }
    ],

    // 折叠面板状态
    activeCollapseItems: []
  },

  onLoad: function() {
    console.log('RODEX解码器页面加载');
    console.log('初始currentStep:', this.data.currentStep);
    this.initializeRodexData();
    this.updatePreviewCode();
    
    // 确保currentStep正确设置
    this.setData({
      currentStep: 1
    });
    console.log('设置后currentStep:', this.data.currentStep);
  },

  // 测试函数
  testFunction: function() {
    console.log('测试按钮被点击');
    wx.showToast({
      title: '功能正常',
      icon: 'success'
    });
    
    // 测试数据设置
    this.setData({
      'rodex.runwayDesignator': '27L'
    });
  },

  // 初始化RODEX数据
  initializeRodexData: function() {
    try {
      // 初始化跑道选择器数据 - 修正van-action-sheet的数据格式
      var runwayActions = [
        { name: '99 - 重复之前报告' },
        { name: '88 - 所有跑道' },
        { name: '01 - 跑道01' },
        { name: '01L - 跑道01左' },
        { name: '01R - 跑道01右' },
        { name: '01C - 跑道01中' }
      ];

      // 添加更多跑道选项 (02-36)
      for (var i = 2; i <= 36; i++) {
        var runway = i.toString();
        if (runway.length === 1) {
          runway = '0' + runway;
        }
        runwayActions.push(
          { name: runway + ' - 跑道' + runway },
          { name: runway + 'L - 跑道' + runway + '左' },
          { name: runway + 'R - 跑道' + runway + '右' },
          { name: runway + 'C - 跑道' + runway + '中' }
        );
      }

      // 初始化污染物类型数据
      var depositTypeActions = [];
      if (rodexData && rodexData.components && rodexData.components.runway_deposits) {
        var deposits = rodexData.components.runway_deposits.values;
        for (var code in deposits) {
          if (deposits.hasOwnProperty(code)) {
            var description = deposits[code];
            depositTypeActions.push({
              name: code + ' - ' + description
            });
          }
        }
      }

      // 初始化污染覆盖范围数据
      var contaminationExtentActions = [];
      if (rodexData && rodexData.components && rodexData.components.extent_of_contamination) {
        var contamination = rodexData.components.extent_of_contamination.values;
        for (var code in contamination) {
          if (contamination.hasOwnProperty(code)) {
            var description = contamination[code];
            contaminationExtentActions.push({
              name: code + ' - ' + description,
              value: code
            });
          }
        }
      }

      // 初始化深度数据
      var depthActions = [];
      if (rodexData && rodexData.components && rodexData.components.depth_of_deposit) {
        var depths = rodexData.components.depth_of_deposit.values;
        for (var code in depths) {
          if (depths.hasOwnProperty(code)) {
            var description = depths[code];
            depthActions.push({
              name: code + ' - ' + description,
              value: code
            });
          }
        }
      }

      // 初始化刹车效应数据
      var brakingActions = [];
      if (rodexData && rodexData.components && rodexData.components.braking_action) {
        var braking = rodexData.components.braking_action;
        
        // 添加估算刹车效应
        if (braking.estimated_braking_action) {
          for (var code in braking.estimated_braking_action) {
            if (braking.estimated_braking_action.hasOwnProperty(code)) {
              var description = braking.estimated_braking_action[code];
              brakingActions.push({
                name: code + ' - ' + description,
                value: code
              });
            }
          }
        }

        // 添加特殊代码
        if (braking.special_codes) {
          for (var code in braking.special_codes) {
            if (braking.special_codes.hasOwnProperty(code)) {
              var description = braking.special_codes[code];
              brakingActions.push({
                name: code + ' - ' + description,
                value: code
              });
            }
          }
        }

        // 添加摩擦系数范围 (00-90)
        for (var i = 0; i <= 90; i += 5) {
          var code = i.toString();
          if (code.length === 1) {
            code = '0' + code;
          }
          var coefficient = i / 100;
          brakingActions.push({
            name: code + ' - 摩擦系数 ' + coefficient.toFixed(2),
            value: code
          });
        }
      }

      this.setData({
        runwayActions: runwayActions,
        depositTypeActions: depositTypeActions,
        contaminationExtentActions: contaminationExtentActions,
        depthActions: depthActions,
        brakingActions: brakingActions,
        'rodex.dataLoaded': true,
        'rodex.error': ''
      });

      console.log('✅ RODEX数据初始化完成');
      console.log('🔍 跑道选项数量:', runwayActions.length);
      console.log('🔍 污染物选项数量:', depositTypeActions.length);

    } catch (error) {
      console.error('❌ RODEX数据初始化失败:', error);
      this.setData({
        'rodex.error': '数据加载失败: ' + (error.message || '未知错误'),
        'rodex.dataLoaded': false
      });
    }
  },

  // 更新预览代码
  updatePreviewCode: function() {
    var rodex = this.data.rodex;
    var previewCode = 'R';
    var currentPart = '';
    
    // 根据当前步骤确定正在输入的部分
    switch (this.data.currentStep) {
      case 1:
        currentPart = 'runway';
        previewCode += rodex.runwayDesignator || '__';
        break;
      case 2:
        currentPart = 'deposit';
        previewCode += rodex.runwayDesignator || '__';
        if (rodex.isCleared) {
          previewCode += '/CLRD//';
        } else {
          previewCode += '/' + (rodex.depositType || '_');
        }
        break;
      case 3:
        currentPart = 'extent';
        previewCode += rodex.runwayDesignator || '__';
        previewCode += '/' + (rodex.depositType || '_') + (rodex.contaminationExtent || '_');
        break;
      case 4:
        currentPart = 'depth';
        previewCode += rodex.runwayDesignator || '__';
        previewCode += '/' + (rodex.depositType || '_') + (rodex.contaminationExtent || '_') + (rodex.depthCode || '__');
        break;
      case 5:
        currentPart = 'braking';
        previewCode += rodex.runwayDesignator || '__';
        previewCode += '/' + (rodex.depositType || '_') + (rodex.contaminationExtent || '_') + (rodex.depthCode || '__') + (rodex.brakingCode || '__');
        break;
      default:
        previewCode += rodex.runwayDesignator || '__';
        if (rodex.isCleared) {
          previewCode += '/CLRD//';
        } else {
          previewCode += '/' + (rodex.depositType || '_') + (rodex.contaminationExtent || '_') + (rodex.depthCode || '__') + (rodex.brakingCode || '__');
        }
    }
    
    this.setData({
      previewCode: previewCode,
      currentInputPart: currentPart
    });
  },

  // 步骤控制方法
  nextStep: function() {
    var currentStep = this.data.currentStep;
    
    // 校验当前步骤的输入
    if (currentStep === 1) {
      if (!this.data.rodex.runwayDesignator) {
        wx.showToast({
          title: '请先选择跑道',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!this.data.rodex.depositType && !this.data.rodex.isCleared) {
        wx.showToast({
          title: '请选择污染物类型或清除状态',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 3) {
      if (!this.data.rodex.contaminationExtent && !this.data.rodex.isCleared) {
        wx.showToast({
          title: '请选择污染覆盖范围',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 4) {
      if (!this.data.rodex.depthCode && !this.data.rodex.isCleared) {
        wx.showToast({
          title: '请选择污染物深度',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 5) {
      if (!this.data.rodex.brakingCode && !this.data.rodex.isCleared) {
        wx.showToast({
          title: '请选择刹车效应',
          icon: 'none'
        });
        return;
      }
    }
    
    // 进入下一步
    this.setData({
      currentStep: currentStep + 1
    });
    this.updatePreviewCode();
    
    // 如果到了最后一步，执行解码
    if (currentStep + 1 === 6) {
      this.generateRodexCode();
    }
  },

  // 步骤跳转方法
  goToStep: function(event) {
    var targetStep = parseInt(event.currentTarget.dataset.step);
    
    // 只允许跳转到当前步骤或已完成的步骤
    if (targetStep <= this.data.currentStep || this.canJumpToStep(targetStep)) {
      this.setData({
        currentStep: targetStep
      });
      this.updatePreviewCode();
      console.log('🔄 跳转到步骤', targetStep);
    } else {
      wx.showToast({
        title: '请按顺序完成步骤',
        icon: 'none'
      });
    }
  },

  // 检查是否可以跳转到指定步骤
  canJumpToStep: function(targetStep) {
    var rodex = this.data.rodex;
    
    // 如果是清除状态，可以直接跳到最后
    if (rodex.isCleared && targetStep <= 6) {
      return true;
    }
    
    // 检查前置条件
    switch (targetStep) {
      case 1:
        return true;
      case 2:
        return !!rodex.runwayDesignator;
      case 3:
        return !!rodex.runwayDesignator && (!!rodex.depositType || rodex.isCleared);
      case 4:
        return !!rodex.runwayDesignator && !!rodex.depositType && !!rodex.contaminationExtent;
      case 5:
        return !!rodex.runwayDesignator && !!rodex.depositType && !!rodex.contaminationExtent && !!rodex.depthCode;
      default:
        return false;
    }
  },

  // 返回上一步
  prevStep: function() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1,
        'rodex.result': null // 清除结果
      });
    }
  },

  // 返回第一步骤
  returnToFirstStep: function() {
    this.setData({
      currentStep: 1,
      'rodex.result': null,
      'rodex.error': ''
    });
    this.updatePreviewCode();
  },

  // 清除所有数据
  clearAllData: function() {
    wx.showModal({
      title: '确认清除',
      content: '您确定要清除所有输入的数据吗？',
      confirmText: '确认清除',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          this.setData({
            currentStep: 1,
            'rodex.runwayDesignator': '',
            'rodex.runwayDesignatorDisplay': '',
            'rodex.depositType': '',
            'rodex.depositTypeDisplay': '',
            'rodex.contaminationExtent': '',
            'rodex.contaminationExtentDisplay': '',
            'rodex.depthCode': '',
            'rodex.depthCodeDisplay': '',
            'rodex.brakingCode': '',
            'rodex.brakingCodeDisplay': '',
            'rodex.isCleared': false,
            'rodex.russiaMode': false,
            'rodex.result': null,
            'rodex.error': '',
            generatedCode: '',
            previewCode: ''
          });
          this.updatePreviewCode();
          wx.showToast({
            title: '数据已清除',
            icon: 'success'
          });
        }
      }.bind(this)
    });
  },

  // 重新开始（保留原功能，可能其他地方会用到）
  restart: function() {
    this.clearAllData();
  },

  // 跑道选择器方法
  showRunwayPicker: function() {
    // 防止重复触发
    if (this.data.showRunwayPicker) {
      return;
    }
    console.log('🔍 显示跑道选择器，跑道选项数量:', this.data.runwayActions.length);
    this.setData({ showRunwayPicker: true });
  },

  onRunwayPickerClose: function() {
    this.setData({ showRunwayPicker: false });
  },

  onRunwaySelect: function(event) {
    console.log('🔥 跑道选择事件触发:', event.detail);
    var selectedIndex = event.detail.index;
    var selectedAction = this.data.runwayActions[selectedIndex];
    
    if (!selectedAction) {
      console.error('🔥 未找到选中的跑道项:', selectedIndex);
      return;
    }
    
    // 从name中提取跑道代码（取第一部分）
    var runwayCode = selectedAction.name.split(' - ')[0];
    console.log('🔥 选中的跑道:', runwayCode, selectedAction);
    
    this.setData({
      'rodex.runwayDesignator': runwayCode,
      'rodex.runwayDesignatorDisplay': selectedAction.name,
      showRunwayPicker: false,
      'rodex.result': null,
      'rodex.error': ''
    });
    this.updatePreviewCode();
    
    console.log('🔥 跑道设置完成:', this.data.rodex.runwayDesignator);
  },

  // 污染物类型选择器方法
  showDepositTypePicker: function() {
    if (this.data.showDepositTypePicker) {
      return;
    }
    this.setData({ showDepositTypePicker: true });
  },

  onDepositTypePickerClose: function() {
    this.setData({ showDepositTypePicker: false });
  },

  onDepositTypeSelect: function(event) {
    var selectedValue = event.detail.value;
    var selectedAction = this.data.depositTypeActions.find(function(action) { return action.value === selectedValue; });
    
    this.setData({
      'rodex.depositType': selectedValue,
      'rodex.depositTypeDisplay': selectedAction ? selectedAction.name : selectedValue,
      'rodex.isCleared': false,
      showDepositTypePicker: false,
      'rodex.result': null,
      'rodex.error': ''
    });
    this.updatePreviewCode();
  },

  // 污染覆盖范围选择器方法
  showContaminationExtentPicker: function() {
    if (this.data.showContaminationExtentPicker) {
      return;
    }
    this.setData({ showContaminationExtentPicker: true });
  },

  onContaminationExtentPickerClose: function() {
    this.setData({ showContaminationExtentPicker: false });
  },

  onContaminationExtentSelect: function(event) {
    var selectedValue = event.detail.value;
    var selectedAction = this.data.contaminationExtentActions.find(function(action) { return action.value === selectedValue; });
    
    this.setData({
      'rodex.contaminationExtent': selectedValue,
      'rodex.contaminationExtentDisplay': selectedAction ? selectedAction.name : selectedValue,
      showContaminationExtentPicker: false,
      'rodex.result': null,
      'rodex.error': ''
    });
    this.updatePreviewCode();
  },

  // 深度选择器方法
  showDepthPicker: function() {
    if (this.data.showDepthPicker) {
      return;
    }
    this.setData({ showDepthPicker: true });
  },

  onDepthPickerClose: function() {
    this.setData({ showDepthPicker: false });
  },

  onDepthSelect: function(event) {
    var selectedValue = event.detail.value;
    var selectedAction = this.data.depthActions.find(function(action) { return action.value === selectedValue; });
    
    this.setData({
      'rodex.depthCode': selectedValue,
      'rodex.depthCodeDisplay': selectedAction ? selectedAction.name : selectedValue,
      showDepthPicker: false,
      'rodex.result': null,
      'rodex.error': ''
    });
    this.updatePreviewCode();
  },

  // 刹车效应选择器方法
  showBrakingPicker: function() {
    if (this.data.showBrakingPicker) {
      return;
    }
    this.setData({ showBrakingPicker: true });
  },

  onBrakingPickerClose: function() {
    this.setData({ showBrakingPicker: false });
  },

  onBrakingSelect: function(event) {
    var selectedValue = event.detail.value;
    var selectedAction = this.data.brakingActions.find(function(action) { return action.value === selectedValue; });
    
    this.setData({
      'rodex.brakingCode': selectedValue,
      'rodex.brakingCodeDisplay': selectedAction ? selectedAction.name : selectedValue,
      showBrakingPicker: false,
      'rodex.result': null,
      'rodex.error': ''
    });
    this.updatePreviewCode();
  },

  // 设置清除状态
  setCleared: function() {
    this.setData({
      'rodex.isCleared': true,
      'rodex.depositType': '',
      'rodex.depositTypeDisplay': '',
      'rodex.contaminationExtent': '',
      'rodex.contaminationExtentDisplay': '',
      'rodex.depthCode': '',
      'rodex.depthCodeDisplay': '',
      'rodex.brakingCode': '',
      'rodex.brakingCodeDisplay': '',
      'rodex.result': null,
      'rodex.error': ''
    });
    this.updatePreviewCode();
    
    // 如果在第2步设置清除状态，直接跳到生成步骤
    if (this.data.currentStep === 2) {
      this.setData({
        currentStep: 6
      });
      this.generateRodexCode();
    }
  },

  // 俄罗斯模式切换
  onRussiaModeChange: function(event) {
    this.setData({
      'rodex.russiaMode': event.detail
    });
  },

  // 生成RODEX代码并解码
  generateRodexCode: function() {
    try {
      var rodex = this.data.rodex;
      var rodexCode = 'R' + rodex.runwayDesignator;
      
      if (rodex.isCleared) {
        rodexCode += '/CLRD//';
      } else {
        rodexCode += '/' + (rodex.depositType || '/') + (rodex.contaminationExtent || '/') + (rodex.depthCode || '//') + (rodex.brakingCode || '//');
      }
      
      // 解码生成的代码
      var result = this.parseRodex(rodexCode);
      this.setData({
        'rodex.result': result,
        'rodex.error': '',
        generatedCode: rodexCode
      });
      
    } catch (error) {
      this.setData({
        'rodex.error': '生成失败: ' + (error.message || '未知错误')
      });
    }
  },


  // 解析RODEX代码 (保留原有逻辑)
  parseRodex: function(code) {
    var parts = [];
    var russiaNote = '';

    // 去除空格和特殊字符，确保输入安全
    var cleanCode = (code || '').toString().replace(/\s+/g, '').toUpperCase();

    // 检查基本格式
    if (!cleanCode || !cleanCode.startsWith('R')) {
      throw new Error('RODEX代码必须以R开头');
    }

    // 解析跑道代码 (RDRDR) - 支持1位或2位数字
    var runwayMatch = cleanCode.match(/^R(\d{1,2}[LCR]?|88|99)/);
    if (runwayMatch) {
      var runwayCode = runwayMatch[1];
      var runwayDesc = '';
      
      if (runwayCode === '88') {
        runwayDesc = '🛬 所有跑道';
      } else if (runwayCode === '99') {
        runwayDesc = '🔄 重复之前的跑道状态报告';
      } else {
        runwayDesc = '🛬 跑道 ' + runwayCode;
      }
      
      parts.push({
        title: '跑道识别',
        code: 'R' + runwayCode,
        description: runwayDesc,
        type: 'primary'
      });
    }

    // 检查是否为清除状态
    if (cleanCode.includes('CLRD')) {
      parts.push({
        title: '跑道状态',
        code: 'CLRD',
        description: '✅ 污染已清除，跑道可正常使用',
        type: 'success'
      });
      return { 
        parts: parts, 
        russiaNote: this.data.rodex.russiaMode ? this.getRussiaNote() : undefined 
      };
    }

    // 解析剩余部分
    var mainPart = cleanCode.substring(runwayMatch ? runwayMatch[0].length : 1);
    
    if (mainPart.indexOf('/') === 0) {
      var segments = mainPart.substring(1).split('');
      
      if (segments.length >= 2) {
        // 跑道沉积物类型
        var depositType = segments[0];
        if (depositType !== '/') {
          var depositDesc = this.getDepositDescription(depositType);
          parts.push({
            title: '污染物类型',
            code: depositType,
            description: '❄️ ' + depositDesc,
            type: 'warning'
          });
        }

        // 污染程度
        var contaminationExtent = segments[1];
        if (contaminationExtent !== '/') {
          var contaminationDesc = this.getContaminationDescription(contaminationExtent);
          parts.push({
            title: '污染覆盖范围',
            code: contaminationExtent,
            description: '📏 ' + contaminationDesc,
            type: 'warning'
          });
        }

        // 沉积物深度
        if (segments.length >= 4) {
          var depthCode = segments[2] + segments[3];
          if (depthCode !== '//') {
            var depthDesc = this.getDepthDescription(depthCode);
            parts.push({
              title: '污染物深度',
              code: depthCode,
              description: '📐 ' + depthDesc,
              type: 'info'
            });
          }
        }

        // 刹车效应 - 支持1位或2位代码
        if (segments.length >= 5) {
          var brakingCode = '';
          var warningMsg = '';
          
          // 完整的2位刹车效应代码
          if (segments.length >= 6) {
            brakingCode = segments[4] + segments[5];
          } 
          // 不完整的1位刹车效应代码 - 前面补0
          else if (segments.length === 5) {
            brakingCode = '0' + segments[4]; // 前面补0处理，如1变成01
            warningMsg = ' ⚠️ (代码不完整，已前置补0)';
          }
          
          if (brakingCode && brakingCode !== '//') {
            var brakingDesc = this.getBrakingDescription(brakingCode);
            
            parts.push({
              title: '刹车效应',
              code: brakingCode,
              description: '🚨 ' + brakingDesc + warningMsg,
              type: 'danger'
            });
          }
        }
      }
    }

    // 添加俄罗斯特殊说明
    if (this.data.rodex.russiaMode) {
      russiaNote = this.getRussiaNote();
    }

    return { 
      parts: parts, 
      russiaNote: russiaNote 
    };
  },

  // 获取沉积物类型描述
  getDepositDescription: function(code) {
    if (!rodexData || !rodexData.components || !rodexData.components.runway_deposits) {
      return '数据加载中...';
    }
    var deposits = rodexData.components.runway_deposits.values;
    return deposits[code] || '未知污染物类型';
  },

  // 获取污染程度描述
  getContaminationDescription: function(code) {
    if (!rodexData || !rodexData.components || !rodexData.components.extent_of_contamination) {
      return '数据加载中...';
    }
    var contamination = rodexData.components.extent_of_contamination.values;
    return contamination[code] || '未知污染程度';
  },

  // 获取深度描述
  getDepthDescription: function(code) {
    if (!rodexData || !rodexData.components || !rodexData.components.depth_of_deposit) {
      return '数据加载中...';
    }
    var depths = rodexData.components.depth_of_deposit.values;
    return depths[code] || '未知深度';
  },

  // 获取刹车效应描述
  getBrakingDescription: function(code) {
    if (!rodexData || !rodexData.components || !rodexData.components.braking_action) {
      return '数据加载中...';
    }
    var braking = rodexData.components.braking_action;
    
    // 检查摩擦系数
    var coefficient = parseInt(code);
    if (!isNaN(coefficient) && coefficient >= 0 && coefficient <= 90) {
      var coefficientValue = coefficient / 100;
      var description = '';
      
      // 如果开启俄罗斯模式，使用俄罗斯规范值逻辑
      if (this.data.rodex.russiaMode) {
        description = '🇷🇺 俄罗斯规范值 ' + coefficientValue.toFixed(2);
        
        // 根据RUSSIA.md获取对应的刹车效应等级
        var russianBrakingAction = this.getRussianBrakingActionFromNormative(coefficientValue);
        if (russianBrakingAction) {
          description += ' (' + russianBrakingAction.braking_action + ')';
          
          // 显示对应的测量值范围
          var measuredRange = '';
          if (russianBrakingAction.measured_min !== null && russianBrakingAction.measured_max !== null) {
            if (russianBrakingAction.measured_max >= 1.0) {
              measuredRange = russianBrakingAction.measured_min.toFixed(2) + '及以上';
            } else {
              measuredRange = russianBrakingAction.measured_min.toFixed(2) + '-' + russianBrakingAction.measured_max.toFixed(2);
            }
            description += '\n📊 对应测量值范围: ' + measuredRange;
          }
        }
      } else {
        // 非俄罗斯模式，使用国际标准
        description = '摩擦系数 ' + coefficientValue.toFixed(2);
        
        // 添加刹车效应对应说明 - 使用RODEX.md中的标准表格
        var brakingActionDesc = this.getBrakingActionFromCoefficient(coefficientValue);
        if (brakingActionDesc) {
          description += ' (' + brakingActionDesc + ')';
        }
      }
      
      return description;
    }
    
    // 检查估算刹车效应
    var estimatedBraking = braking.estimated_braking_action;
    if (estimatedBraking[code]) {
      return estimatedBraking[code];
    }
    
    // 检查特殊代码
    var specialCodes = braking.special_codes;
    if (specialCodes[code]) {
      return specialCodes[code];
    }
    
    return '未知刹车效应';
  },

  // 根据摩擦系数获取刹车效应描述
  getBrakingActionFromCoefficient: function(coefficient) {
    if (!rodexData || !rodexData.components || !rodexData.components.braking_action) {
      return null;
    }
    
    // 如果是俄罗斯模式，输入的是Normative值，使用俄罗斯专用表格
    if (this.data.rodex.russiaMode) {
      var russianEntry = this.getRussianBrakingActionFromNormative(coefficient);
      if (russianEntry) {
        return russianEntry.braking_action;
      }
      return null;
    }
    
    // 其他国家模式，使用RODEX.md中的标准对照表
    // 根据文档：0.40 and above = Good, 0.39 to 0.36 = Medium to good, 
    // 0.35 to 0.30 = Medium, 0.29 to 0.26 = Medium to poor, 0.25 and below = Poor
    if (coefficient >= 0.40) {
      return 'Good';
    } else if (coefficient >= 0.36) {
      return 'Medium to good';
    } else if (coefficient >= 0.30) {
      return 'Medium';
    } else if (coefficient >= 0.26) {
      return 'Medium to poor';
    } else {
      return 'Poor';
    }
  },

  // 根据俄罗斯规范值获取刹车效应等级 - 使用数据文件
  getRussianBrakingActionFromNormative: function(normativeValue) {
    // 使用rodex.js中的俄罗斯表格数据
    if (!rodexData || !rodexData.regional_variations || !rodexData.regional_variations.Russia) {
      console.error('俄罗斯数据未加载');
      return null;
    }
    
    var russianTable = rodexData.regional_variations.Russia.braking_action_table.table;
    
    // 查找符合规范值范围的条目
    for (var i = 0; i < russianTable.length; i++) {
      var entry = russianTable[i];
      if (normativeValue >= entry.normative_min && normativeValue <= entry.normative_max) {
        return entry;
      }
    }
    
    return null;
  },

  // 将俄罗斯规范值转换为估算的测量值
  convertNormativeToMeasured: function(normativeValue) {
    var russianEntry = this.getRussianBrakingActionFromNormative(normativeValue);
    if (russianEntry) {
      // 返回对应的测量值范围的中点
      return (russianEntry.measured_min + russianEntry.measured_max) / 2;
    }
    
    return null;
  },

  // 获取俄罗斯特殊说明
  getRussiaNote: function() {
    if (!rodexData || !rodexData.regional_variations || !rodexData.regional_variations.Russia) {
      return '俄罗斯数据加载中...';
    }
    var russiaData = rodexData.regional_variations.Russia;
    return russiaData.description + '\n\n操作说明：\n' + russiaData.operational_notes.join('\n');
  },

  // 兼容性方法 - 保留原有的输入框功能
  onRodexInputChange: function(event) {
    var value = (event.detail && event.detail.value) || event.detail || '';
    // 这里可以添加直接解析输入的逻辑，或者引导用户使用步骤式输入
  },

  // 填充示例代码
  fillExample: function(event) {
    var code = event.currentTarget.dataset.code;
    // 解析示例代码并填充到步骤中
    this.parseExampleToSteps(code);
  },

  // 解析示例代码到步骤
  parseExampleToSteps: function(code) {
    try {
      var cleanCode = code.replace(/\s+/g, '').toUpperCase();
      var runwayMatch = cleanCode.match(/^R(\d{2}[LCR]?|88|99)/);
      
      if (runwayMatch) {
        var runwayCode = runwayMatch[1];
        this.setData({
          'rodex.runwayDesignator': runwayCode,
          'rodex.runwayDesignatorDisplay': runwayCode + ' - 跑道' + runwayCode,
          currentStep: 2
        });

        var mainPart = cleanCode.substring(runwayMatch[0].length);
        if (mainPart.indexOf('/') === 0) {
          var segments = mainPart.substring(1).split('');
          
          if (cleanCode.indexOf('CLRD') !== -1) {
            this.setData({
              'rodex.isCleared': true,
              currentStep: 6
            });
            this.generateRodexCode();
          } else if (segments.length >= 6) {
            // 填充所有步骤
            this.setData({
              'rodex.depositType': segments[0] !== '/' ? segments[0] : '',
              'rodex.contaminationExtent': segments[1] !== '/' ? segments[1] : '',
              'rodex.depthCode': segments[2] + segments[3] !== '//' ? segments[2] + segments[3] : '',
              'rodex.brakingCode': segments[4] + segments[5] !== '//' ? segments[4] + segments[5] : '',
              currentStep: 6
            });
            this.generateRodexCode();
          }
        }
      }
    } catch (error) {
      console.error('解析示例失败:', error);
    }
  },

  // 折叠面板事件处理
  onCollapseChange: function(event) {
    this.setData({
      activeCollapseItems: event.detail
    });
  },

  // 数字键盘输入方法
  inputRunwayNumber: function(event) {
    console.log('🔢 数字键盘输入:', event.currentTarget.dataset.value);
    var number = event.currentTarget.dataset.value;
    var currentValue = this.data.rodex.runwayDesignator || '';
    console.log('🔢 当前值:', currentValue);
    
    // 限制长度（跑道最多2位数字+1位字母）
    if (currentValue.length >= 3) {
      console.log('🔢 长度超限，不添加');
      return;
    }
    
    var newValue = currentValue + number;
    console.log('🔢 新值:', newValue);
    this.setData({
      'rodex.runwayDesignator': newValue,
      'rodex.runwayDesignatorDisplay': 'R' + newValue
    });
    this.updatePreviewCode();
    console.log('🔢 设置完成，当前rodex.runwayDesignator:', this.data.rodex.runwayDesignator);
  },

  // 输入跑道字母或特殊选项
  selectRunwayOption: function(event) {
    console.log('🔤 选择跑道选项:', event.currentTarget.dataset.value);
    var option = event.currentTarget.dataset.value;
    var currentValue = this.data.rodex.runwayDesignator || '';
    console.log('🔤 当前值:', currentValue);
    
    if (option === '99' || option === '88') {
      // 特殊代码，直接替换
      this.setData({
        'rodex.runwayDesignator': option,
        'rodex.runwayDesignatorDisplay': 'R' + option + (option === '99' ? ' - 重复报告' : ' - 所有跑道')
      });
      console.log('🔤 设置特殊代码:', option);
    } else if (option === 'L' || option === 'R' || option === 'C') {
      // 字母后缀，添加到现有数字后
      if (currentValue && currentValue !== '99' && currentValue !== '88') {
        // 移除已有的字母后缀
        var numberPart = currentValue.replace(/[LRC]$/, '');
        var newValue = numberPart + option;
        this.setData({
          'rodex.runwayDesignator': newValue,
          'rodex.runwayDesignatorDisplay': 'R' + newValue
        });
        console.log('🔤 添加字母后缀:', newValue);
      } else {
        console.log('🔤 无效的字母后缀操作，当前值:', currentValue);
      }
    }
    this.updatePreviewCode();
    console.log('🔤 操作完成，最终值:', this.data.rodex.runwayDesignator);
  },

  // 清除跑道输入
  clearRunwayInput: function() {
    this.setData({
      'rodex.runwayDesignator': '',
      'rodex.runwayDesignatorDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 删除最后一个字符
  deleteRunwayChar: function() {
    var currentValue = this.data.rodex.runwayDesignator || '';
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      this.setData({
        'rodex.runwayDesignator': newValue,
        'rodex.runwayDesignatorDisplay': newValue ? 'R' + newValue : ''
      });
    }
    this.updatePreviewCode();
  },

  // 跑道输入框变化
  onRunwayInput: function(event) {
    var value = event.detail.value.toUpperCase();
    // 移除R前缀（如果用户输入了）
    value = value.replace(/^R/, '');
    // 限制格式：数字+可选字母
    value = value.replace(/[^0-9LRC]/g, '');
    
    this.setData({
      'rodex.runwayDesignator': value,
      'rodex.runwayDesignatorDisplay': value ? 'R' + value : ''
    });
    this.updatePreviewCode();
    console.log('跑道输入更新:', value);
  },

  // 污染物类型选择
  selectDepositType: function(event) {
    var code = event.currentTarget.dataset.code;
    var desc = event.currentTarget.dataset.desc;
    
    this.setData({
      'rodex.depositType': code,
      'rodex.depositTypeDisplay': code + ' - ' + desc,
      'rodex.isCleared': false
    });
    this.updatePreviewCode();
  },

  // 清除污染物选择
  clearDepositInput: function() {
    this.setData({
      'rodex.depositType': '',
      'rodex.depositTypeDisplay': '',
      'rodex.isCleared': false
    });
    this.updatePreviewCode();
  },

  // 污染覆盖范围选择
  selectCoverage: function(event) {
    var code = event.currentTarget.dataset.code;
    var desc = event.currentTarget.dataset.desc;
    
    this.setData({
      'rodex.contaminationExtent': code,
      'rodex.contaminationExtentDisplay': code + ' - ' + desc
    });
    this.updatePreviewCode();
  },

  // 清除覆盖范围选择
  clearCoverageInput: function() {
    this.setData({
      'rodex.contaminationExtent': '',
      'rodex.contaminationExtentDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 深度数字输入
  inputDepthNumber: function(event) {
    var number = event.currentTarget.dataset.value;
    var currentValue = this.data.rodex.depthCode || '';
    
    // 限制长度（深度最多2位）
    if (currentValue.length >= 2) {
      return;
    }
    
    var newValue = currentValue + number;
    this.setData({
      'rodex.depthCode': newValue,
      'rodex.depthCodeDisplay': newValue + 'mm'
    });
    this.updatePreviewCode();
  },

  // 深度特殊选项
  selectDepthOption: function(event) {
    var value = event.currentTarget.dataset.value;
    var description = '';
    
    if (value === '99') {
      description = '99 - 40mm以上';
    } else if (value === '//') {
      description = '// - 无法测量';
    } else if (value === '92') {
      description = '92 - 10cm以上';
    } else if (value === '93') {
      description = '93 - 15cm以上';
    }
    
    this.setData({
      'rodex.depthCode': value,
      'rodex.depthCodeDisplay': description
    });
    this.updatePreviewCode();
  },

  // 清除深度输入
  clearDepthInput: function() {
    this.setData({
      'rodex.depthCode': '',
      'rodex.depthCodeDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 删除深度字符
  deleteDepthChar: function() {
    var currentValue = this.data.rodex.depthCode || '';
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      this.setData({
        'rodex.depthCode': newValue,
        'rodex.depthCodeDisplay': newValue ? newValue + 'mm' : ''
      });
    }
    this.updatePreviewCode();
  },

  // 深度输入框变化
  onDepthInput: function(event) {
    var value = event.detail.value;
    // 只允许数字和斜杠
    value = value.replace(/[^0-9/]/g, '');
    
    this.setData({
      'rodex.depthCode': value,
      'rodex.depthCodeDisplay': value ? (value === '//' ? '// - 无法测量' : value + 'mm') : ''
    });
    this.updatePreviewCode();
  },

  // 刹车效应数字输入
  inputBrakingNumber: function(event) {
    var number = event.currentTarget.dataset.value;
    var currentValue = this.data.rodex.brakingCode || '';
    
    // 限制长度（刹车代码最多2位）
    if (currentValue.length >= 2) {
      return;
    }
    
    var newValue = currentValue + number;
    var coefficient = parseInt(newValue) / 100;
    this.setData({
      'rodex.brakingCode': newValue,
      'rodex.brakingCodeDisplay': newValue + ' - 摩擦系数 ' + coefficient.toFixed(2)
    });
    this.updatePreviewCode();
  },

  // 刹车效应选项选择
  selectBrakingOption: function(event) {
    var code = event.currentTarget.dataset.code;
    var desc = event.currentTarget.dataset.desc;
    
    this.setData({
      'rodex.brakingCode': code,
      'rodex.brakingCodeDisplay': code + ' - ' + desc
    });
    this.updatePreviewCode();
  },

  // 清除刹车效应输入
  clearBrakingInput: function() {
    this.setData({
      'rodex.brakingCode': '',
      'rodex.brakingCodeDisplay': ''
    });
    this.updatePreviewCode();
  },

  // 删除刹车效应字符
  deleteBrakingChar: function() {
    var currentValue = this.data.rodex.brakingCode || '';
    if (currentValue.length > 0) {
      var newValue = currentValue.slice(0, -1);
      if (newValue) {
        var coefficient = parseInt(newValue) / 100;
        this.setData({
          'rodex.brakingCode': newValue,
          'rodex.brakingCodeDisplay': newValue + ' - 摩擦系数 ' + coefficient.toFixed(2)
        });
      } else {
        this.setData({
          'rodex.brakingCode': '',
          'rodex.brakingCodeDisplay': ''
        });
      }
    }
    this.updatePreviewCode();
  },

  // 刹车效应输入框变化
  onBrakingInput: function(event) {
    var value = event.detail.value;
    // 只允许数字
    value = value.replace(/[^0-9]/g, '');
    
    var description = '';
    if (value) {
      var coefficient = parseInt(value) / 100;
      description = value + ' - 摩擦系数 ' + coefficient.toFixed(2);
    }
    
    this.setData({
      'rodex.brakingCode': value,
      'rodex.brakingCodeDisplay': description
    });
    this.updatePreviewCode();
  }
});