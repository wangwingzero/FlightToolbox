// 引入RODEX数据
var rodexData = require('../../packageWeather/rodex.js');
// 引入BasePage基类
var BasePage = require('../../utils/base-page.js');
var AppConfig = require('../../utils/app-config.js');

var pageConfig = {
  // 定时器ID存储在实例属性（非data）
  _cursorTimer: null,
  _autoDecodeTimer: null,

  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 页面视图控制
    currentView: 'input', // 'input' | 'result'

    // 输入相关
    inputCode: '',
    showCursor: true,
    canDecode: false,
    codeHint: '',

    // 俄罗斯模式
    russiaMode: false,

    // 解码后的数据
    decodedCode: '',
    analysis: null,

    // 自动解析控制
    autoDecodeDelay: 300,

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
        code: 'R14L/CLRD60',
        explanation: '跑道14L污染已清除，摩擦系数0.60',
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

  customOnLoad: function() {
    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    this.startCursorBlink();
    this.validateInput();
    this.updateHint();
  },

  customOnShow: function() {
    // 页面显示时恢复光标闪烁
    if (!this._cursorTimer) {
      this.startCursorBlink();
    }
  },

  customOnHide: function() {
    // 页面隐藏时停止光标闪烁，节省资源
    this.stopCursorBlink();
  },

  customOnUnload: function() {
    // 页面卸载时清理所有定时器
    this.stopCursorBlink();
    this._clearAutoDecodeTimer();
  },
  
  // 开始光标闪烁
  startCursorBlink: function() {
    var self = this;
    this._cursorTimer = setInterval(function() {
      self.setData({
        showCursor: !self.data.showCursor
      });
    }, 500);
  },

  // 停止光标闪烁
  stopCursorBlink: function() {
    if (this._cursorTimer) {
      clearInterval(this._cursorTimer);
      this._cursorTimer = null;
    }
  },

  // 清理自动解析定时器
  _clearAutoDecodeTimer: function() {
    if (this._autoDecodeTimer) {
      clearTimeout(this._autoDecodeTimer);
      this._autoDecodeTimer = null;
    }
  },

  // 输入按键
  inputKey: function(event) {
    var value = event.currentTarget.dataset.value;
    var currentCode = this.data.inputCode;
    
    // 输入限制逻辑
    if (!this.canAddChar(currentCode, value)) {
      return;
    }
    
    this.setData({
      inputCode: currentCode + value
    });
    
    this.validateInput();
    this.updateHint();
  },
  
  // 输入特殊代码
  inputSpecial: function(event) {
    var value = event.currentTarget.dataset.value;
    var currentCode = this.data.inputCode;

    if (value === '99' || value === '88') {
      // 特殊跑道代码
      if (currentCode.length === 0) {
        this.setData({
          inputCode: value
        });
      }
    } else if (value === 'CLRD') {
      // CLRD状态
      var match = currentCode.match(/^(\d{1,2}[LCR]?|88|99)\/$/);
      if (match) {
        this.setData({
          inputCode: currentCode + 'CLRD'
        });
      }
    }

    this.validateInput();
    this.updateHint();
  },
  
  // 删除字符
  deleteChar: function() {
    var currentCode = this.data.inputCode;
    if (currentCode.length > 0) {
      this.setData({
        inputCode: currentCode.slice(0, -1)
      });
      this.validateInput();
      this.updateHint();
    }
  },
  
  // 清除所有
  clearAll: function() {
    // 清除自动解析定时器
    this._clearAutoDecodeTimer();

    this.setData({
      inputCode: '',
      canDecode: false,
      codeHint: ''
    });
  },
  
  // 快速填充示例
  quickFill: function(event) {
    var code = event.currentTarget.dataset.code;

    // 清除自动解析定时器
    this._clearAutoDecodeTimer();

    this.setData({
      inputCode: code
    });
    this.validateInput();
    this.updateHint();

    // 快速填充时立即触发解析（用户意图明确，无需延迟）
    if (this.data.canDecode) {
      this.decodeRODEX();
    }
  },
  
  // 切换俄罗斯模式
  toggleRussiaMode: function(event) {
    this.setData({
      russiaMode: event.detail.value
    });
  },

  // 判断是否可以添加字符
  canAddChar: function(currentCode, char) {
    // 基本长度限制 - 放宽到15个字符以支持特殊格式
    if (currentCode.length >= 15) {
      return false;
    }
    
    // 跑道代码阶段
    if (!currentCode.includes('/')) {
      // 数字
      if (/^\d$/.test(char)) {
        var numPart = currentCode.replace(/[LCR]$/, '');
        return numPart.length < 2;
      }
      // 字母
      if (/^[LCR]$/.test(char)) {
        return /^\d{1,2}$/.test(currentCode) && !/[LCR]/.test(currentCode);
      }
      // 斜杠
      if (char === '/') {
        return /^(\d{1,2}[LCR]?|88|99)$/.test(currentCode);
      }
    }
    
    // 污染物代码阶段
    var firstSlashIndex = currentCode.indexOf('/');
    if (firstSlashIndex !== -1) {
      var afterSlash = currentCode.substring(firstSlashIndex + 1);

      // CLRD状态 - 允许输入两位数字表示摩擦系数
      if (afterSlash === 'CLRD') {
        return /^\d$/.test(char);  // 允许输入数字
      }
      if (afterSlash.match(/^CLRD\d$/)) {
        return /^\d$/.test(char);  // 允许输入第二位数字
      }
      if (afterSlash.match(/^CLRD\d{2}$/)) {
        return false;  // 已经完整，不允许继续输入
      }

      // 特殊格式：///99// (跑道不可用)
      if (afterSlash === '//') {
        return char === '/' || char === '9';
      }
      if (afterSlash === '///') {
        return char === '9' || char === '/';
      }
      if (afterSlash === '//9') {
        return char === '9';
      }
      if (afterSlash === '//99') {
        return char === '/';
      }
      if (afterSlash === '//99/') {
        return char === '/';
      }
      if (afterSlash === '//99//') {
        return false;
      }

      // 支持连续斜杠输入（允许输入6个斜杠）
      if (afterSlash.match(/^\/+$/) && afterSlash.length < 6) {
        return char === '/' || (afterSlash.length >= 2 && char === '9');
      }

      // 正常状态码输入
      if (afterSlash.length < 6) {
        return /^[0-9\/]$/.test(char);
      }
    }
    
    return false;
  },
  
  // 验证输入
  validateInput: function() {
    var code = this.data.inputCode;
    var canDecode = false;
    var previousCanDecode = this.data.canDecode;

    // 完整的RODEX代码格式
    // R + 跑道代码 + / + CLRD + 两位数字摩擦系数 或 6位状态码
    var validPattern = /^(\d{1,2}[LCR]?|88|99)\/(CLRD\d{2}|[0-9\/]{6})$/;

    // 特殊格式：全斜杠（如R14L///////）
    var allSlashPattern = /^(\d{1,2}[LCR]?|88|99)\/\/\/\/\/\/$/;

    // 特殊格式：中间99（如R14L///99//）
    var special99Pattern = /^(\d{1,2}[LCR]?)\/\/\/99\/\/$/;

    if (validPattern.test(code) || allSlashPattern.test(code) || special99Pattern.test(code)) {
      canDecode = true;
    }

    this.setData({
      canDecode: canDecode
    });

    // 清除之前的定时器，防止重复触发
    this._clearAutoDecodeTimer();

    // 自动触发解析功能：
    // 1. 当输入从不完整变为完整时自动触发（canDecode: false → true）
    // 2. 延迟300ms给用户查看"输入完成"提示的时间
    // 3. 延迟期间二次验证状态，防止用户删除内容导致误触发
    // 4. 仅在输入视图触发，避免结果视图重复触发
    if (canDecode && !previousCanDecode && this.data.currentView === 'input') {
      var self = this;
      // 保存定时器ID以便后续清理
      this._autoDecodeTimer = setTimeout(function() {
        // 再次检查是否仍然可以解码（防止用户在延迟期间删除了内容）
        if (self.data.canDecode && self.data.currentView === 'input') {
          self.decodeRODEX();
        }
        // 执行后清除定时器ID
        self._autoDecodeTimer = null;
      }, self.data.autoDecodeDelay);
    }
  },
  
  // 更新输入提示
  updateHint: function() {
    var code = this.data.inputCode;
    var hint = '';

    if (code.length === 0) {
      hint = '请输入跑道代码';
    } else if (!code.includes('/')) {
      hint = '跑道: ' + code + ' - 按 / 继续';
    } else {
      var parts = code.split('/');
      if (parts[1] === '') {
        hint = '请输入污染物类型或CLRD';
      } else if (parts[1] === 'CLRD') {
        hint = 'CLRD - 污染已清除，输入摩擦系数';
      } else if (parts[1].match(/^CLRD\d$/)) {
        hint = 'CLRD - 请输入第二位摩擦系数';
      } else if (parts[1].match(/^CLRD\d{2}$/)) {
        hint = '输入完成 - 即将自动解析...';
      } else if (parts[1].startsWith('///')) {
        hint = '特殊状态代码';
      } else if (parts[1].length < 6) {
        var remaining = 6 - parts[1].length;
        hint = '还需输入 ' + remaining + ' 位状态码';
      } else {
        hint = '输入完成 - 即将自动解析...';
      }
    }

    this.setData({
      codeHint: hint
    });
  },
  
  // 解码RODEX
  decodeRODEX: function() {
    if (!this.data.canDecode) {
      return;
    }
    
    var code = this.data.inputCode;
    var analysis = this.analyzeRODEX(code);
    
    this.setData({
      currentView: 'result',
      decodedCode: 'R' + code,
      analysis: analysis
    });
  },
  
  // 分析RODEX代码
  analyzeRODEX: function(code) {
    var analysis = {
      runway: null,
      contaminant: null,
      braking: null,
      specialNotes: null,
      originalCode: code
    };
    
    // 解析跑道代码
    var runwayMatch = code.match(/^(\d{1,2}[LCR]?|88|99)/);
    if (runwayMatch) {
      var runwayCode = runwayMatch[1];
      analysis.runway = {
        code: 'R' + runwayCode,
        description: this.getRunwayDescription(runwayCode)
      };
    }
    
    // 解析污染物信息
    var firstSlashIndex = code.indexOf('/');
    if (firstSlashIndex !== -1) {
      var statusCode = code.substring(firstSlashIndex + 1);

      if (statusCode.match(/^CLRD\d{2}$/)) {
        // CLRD + 两位数字表示污染已清除 + 摩擦系数
        var frictionCode = statusCode.substring(4, 6);  // 提取后两位数字
        analysis.contaminant = {
          type: '无污染',
          coverage: '跑道已清除',
          depth: null
        };
        analysis.braking = this.getBrakingAnalysis(frictionCode);
        analysis.braking.code = frictionCode;
      } else if (statusCode === '//////') {
        // 全斜杠表示跑道污染但报告不可用
        analysis.statusCode = '//////';
        analysis.contaminant = {
          type: '污染状态未知',
          coverage: '报告不可用',
          depth: '报告不可用'
        };
        analysis.braking = {
          coefficient: '未报告',
          level: '未报告',
          levelEn: 'Not Reported',
          levelClass: 'not-reported'
        };
        analysis.specialNotes = '跑道污染但报告不可用（机场关闭或宵禁等）';
      } else if (statusCode === '//99//') {
        // 特殊格式：跑道不可用
        analysis.statusCode = '//99//';
        analysis.contaminant = {
          type: '跑道不可用',
          coverage: '跑道清理中',
          depth: '99'
        };
        analysis.braking = {
          coefficient: '未报告',
          level: '未报告',
          levelEn: 'Not Reported',
          levelClass: 'not-reported'
        };
        analysis.specialNotes = '跑道因清理工作暂时不可用';
      } else if (statusCode.length === 6 && !statusCode.match(/^\/+$/)) {
        // 解析6位状态码
        var depositType = statusCode[0];
        var coverage = statusCode[1];
        var depth = statusCode.substring(2, 4);
        var braking = statusCode.substring(4, 6);

        // 保存污染物状态码（前4位）
        analysis.statusCode = statusCode.substring(0, 4);

        analysis.contaminant = {
          type: this.getDepositDescription(depositType),
          typeCode: depositType,
          coverage: this.getContaminationDescription(coverage),
          coverageCode: coverage,
          depth: this.getDepthDescription(depth),
          depthCode: depth
        };

        analysis.braking = this.getBrakingAnalysis(braking);
        analysis.braking.code = braking;
      }
    }
    
    // 特殊说明
    if (this.data.russiaMode) {
      analysis.specialNotes = '俄罗斯模式：摩擦系数为规范值，已自动转换为对应的测量值范围';
    }
    
    return analysis;
  },
  
  // 获取跑道描述
  getRunwayDescription: function(code) {
    if (code === '88') return '所有跑道';
    if (code === '99') return '重复之前的报告';
    return '跑道 ' + code;
  },
  
  // 获取刹车分析
  getBrakingAnalysis: function(brakingCode) {
    var coefficient = parseInt(brakingCode) / 100;
    var level = '';
    var levelClass = '';
    var isRussianMode = this.data.russiaMode;
    
    // 估算刹车效应
    var levelEn = '';
    if (brakingCode === '91') {
      level = '差';
      levelEn = 'Poor';
      levelClass = 'poor';
      coefficient = '< 0.25';
    } else if (brakingCode === '92') {
      level = '中等偏差';
      levelEn = 'Medium to Poor';
      levelClass = 'medium-poor';
      coefficient = '0.26-0.29';
    } else if (brakingCode === '93') {
      level = '中等';
      levelEn = 'Medium';
      levelClass = 'medium';
      coefficient = '0.30-0.35';
    } else if (brakingCode === '94') {
      level = '中等偏好';
      levelEn = 'Medium to Good';
      levelClass = 'medium-good';
      coefficient = '0.36-0.39';
    } else if (brakingCode === '95') {
      level = '好';
      levelEn = 'Good';
      levelClass = 'good';
      coefficient = '≥ 0.40';
    } else if (brakingCode === '99') {
      level = '不可靠';
      levelEn = 'Unreliable';
      levelClass = 'unreliable';
      coefficient = '无法测量';
    } else if (brakingCode === '//') {
      level = '未报告';
      levelEn = 'Not Reported';
      levelClass = 'not-reported';
      coefficient = '未报告';
    } else {
      // 数字摩擦系数
      coefficient = coefficient.toFixed(2);
      
      if (isRussianMode) {
        // 俄罗斯模式：输入的是规范值
        if (parseFloat(coefficient) >= 0.42) {
          level = '好';
          levelEn = 'Good';
          levelClass = 'good';
        } else if (parseFloat(coefficient) >= 0.40) {
          level = '中等偏好';
          levelEn = 'Good to Medium';
          levelClass = 'medium-good';
        } else if (parseFloat(coefficient) >= 0.37) {
          level = '中等';
          levelEn = 'Medium';
          levelClass = 'medium';
        } else if (parseFloat(coefficient) >= 0.35) {
          level = '中等偏差';
          levelEn = 'Medium to Poor';
          levelClass = 'medium-poor';
        } else if (parseFloat(coefficient) >= 0.30) {
          level = '差';
          levelEn = 'Poor';
          levelClass = 'poor';
        } else {
          level = '不可靠';
          levelEn = 'Unreliable';
          levelClass = 'unreliable';
        }
      } else {
        // 普通模式：输入的是测量值
        if (parseFloat(coefficient) >= 0.40) {
          level = '好';
          levelEn = 'Good';
          levelClass = 'good';
        } else if (parseFloat(coefficient) >= 0.36) {
          level = '中等偏好';
          levelEn = 'Medium to Good';
          levelClass = 'medium-good';
        } else if (parseFloat(coefficient) >= 0.30) {
          level = '中等';
          levelEn = 'Medium';
          levelClass = 'medium';
        } else if (parseFloat(coefficient) >= 0.26) {
          level = '中等偏差';
          levelEn = 'Medium to Poor';
          levelClass = 'medium-poor';
        } else {
          level = '差';
          levelEn = 'Poor';
          levelClass = 'poor';
        }
      }
    }
    
    var result = {
      coefficient: coefficient,
      level: level,
      levelEn: levelEn,
      levelClass: levelClass
    };
    
    // 俄罗斯模式特殊处理
    if (isRussianMode && !isNaN(coefficient)) {
      result.russiaInfo = this.getRussianInfo(parseFloat(coefficient));
    }
    
    return result;
  },
  
  // 获取俄罗斯信息
  getRussianInfo: function(normativeCoefficient) {
    // 基于RUSSIA.md的对照表
    var info = {
      normative: normativeCoefficient.toFixed(2),
      measured: '',
      brakingAction: ''
    };
    
    if (normativeCoefficient >= 0.42) {
      info.measured = '0.40及以上';
      info.brakingAction = '好';
    } else if (normativeCoefficient >= 0.40) {
      info.measured = '0.36-0.39';
      info.brakingAction = '中等偏好';
    } else if (normativeCoefficient >= 0.37) {
      info.measured = '0.30-0.35';
      info.brakingAction = '中等';
    } else if (normativeCoefficient >= 0.35) {
      info.measured = '0.26-0.29';
      info.brakingAction = '中等偏差';
    } else if (normativeCoefficient >= 0.30) {
      info.measured = '0.17-0.25';
      info.brakingAction = '差';
    } else {
      info.measured = '低于0.17';
      info.brakingAction = '不可靠';
    }
    
    return info;
  },
  
  // 返回输入页面
  backToInput: function() {
    this.setData({
      currentView: 'input'
    });
  },
  
  // 新建解码
  newDecode: function() {
    this.setData({
      currentView: 'input',
      inputCode: '',
      canDecode: false,
      codeHint: '',
      russiaMode: false
    });
  },
  
  // 分享结果
  shareResult: function() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },
  
  // 获取沉积物类型描述
  getDepositDescription: function(code) {
    try {
      if (!rodexData || !rodexData.components || !rodexData.components.runway_deposits) {
        return '数据加载中...';
      }
      var deposits = rodexData.components.runway_deposits.values;
      return deposits[code] || '未知污染物类型';
    } catch (e) {
      console.error('获取沉积物描述错误:', e);
      return '未知污染物类型';
    }
  },

  // 获取污染程度描述
  getContaminationDescription: function(code) {
    try {
      if (!rodexData || !rodexData.components || !rodexData.components.extent_of_contamination) {
        return '数据加载中...';
      }
      var contamination = rodexData.components.extent_of_contamination.values;
      return contamination[code] || '未知污染程度';
    } catch (e) {
      console.error('获取污染程度描述错误:', e);
      return '未知污染程度';
    }
  },

  // 获取深度描述
  getDepthDescription: function(code) {
    try {
      if (!rodexData || !rodexData.components || !rodexData.components.depth_of_deposit) {
        return '数据加载中...';
      }
      var depths = rodexData.components.depth_of_deposit.values;
      return depths[code] || '未知深度';
    } catch (e) {
      console.error('获取深度描述错误:', e);
      return '未知深度';
    }
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));