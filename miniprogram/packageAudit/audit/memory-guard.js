'use strict';

/**
 * 🛡️ 内存管理守卫
 *
 * 检测和预防微信小程序中的内存泄漏问题
 * 扫描代码中的定时器、事件监听器、音频实例等资源使用
 * 确保在页面卸载时正确清理
 *
 * @module memory-guard
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 内存泄漏检测
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 定时器清理：保存timer ID，在onUnload中clearInterval/clearTimeout
 * - 事件监听器清理：使用配对的on/off，传递相同的handler引用
 * - 音频实例清理：先stop()再destroy()，然后置null
 * - 位置监听清理：stopLocationUpdate()
 *
 * @example
 * var MemoryGuard = require('./memory-guard.js');
 * var timerIssues = MemoryGuard.scanTimerUsage({ code: jsCode, filePath: 'pages/home/index.js' });
 * var listenerIssues = MemoryGuard.scanEventListeners({ code: jsCode, filePath: 'pages/home/index.js' });
 * var audioIssues = MemoryGuard.scanAudioInstances({ code: jsCode, filePath: 'pages/home/index.js' });
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 已知的wx.on* API及其对应的off方法
 * @constant {Object}
 */
var WX_EVENT_APIS = {
  'onNetworkStatusChange': 'offNetworkStatusChange',
  'onWindowResize': 'offWindowResize',
  'onAccelerometerChange': 'offAccelerometerChange',
  'onCompassChange': 'offCompassChange',
  'onGyroscopeChange': 'offGyroscopeChange',
  'onDeviceMotionChange': 'offDeviceMotionChange',
  'onMemoryWarning': 'offMemoryWarning',
  'onLocationChange': 'offLocationChange',
  'onLocationChangeError': 'offLocationChangeError',
  'onBLEConnectionStateChange': 'offBLEConnectionStateChange',
  'onBLECharacteristicValueChange': 'offBLECharacteristicValueChange'
};

/**
 * 定时器函数名称
 * @constant {Object}
 */
var TIMER_FUNCTIONS = {
  SET: ['setTimeout', 'setInterval'],
  CLEAR: ['clearTimeout', 'clearInterval']
};

/**
 * 音频相关API
 * @constant {Object}
 */
var AUDIO_APIS = {
  CREATE: ['createInnerAudioContext', 'createAudioContext'],
  CLEANUP: ['destroy', 'stop']
};

/**
 * 位置相关API
 * @constant {Object}
 */
var LOCATION_APIS = {
  START: ['startLocationUpdate', 'startLocationUpdateBackground'],
  STOP: ['stopLocationUpdate']
};

/**
 * 内存管理守卫
 * @namespace MemoryGuard
 */
var MemoryGuard = {
  /**
   * 已知的wx事件API
   */
  WX_EVENT_APIS: WX_EVENT_APIS,

  /**
   * 扫描定时器使用模式
   * 检测setTimeout/setInterval调用，验证是否正确清理
   *
   * @param {Object} options - 扫描选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Array} 定时器问题列表
   *
   * @example
   * var issues = MemoryGuard.scanTimerUsage({
   *   code: jsCode,
   *   filePath: 'pages/home/index.js'
   * });
   */
  scanTimerUsage: function(options) {
    var issues = [];
    options = options || {};

    if (!options.code || !options.filePath) {
      return issues;
    }

    try {
      var code = options.code;
      var filePath = options.filePath;
      var lines = code.split('\n');

      // 收集定时器设置和清理信息
      var timerSets = [];
      var timerClears = [];
      var hasOnUnload = false;
      var onUnloadContent = '';

      // 第一遍扫描：收集所有定时器操作
      for (var lineNum = 0; lineNum < lines.length; lineNum++) {
        var line = lines[lineNum];

        // 检测onUnload函数
        if (/onUnload\s*[:(]/.test(line) || /customOnUnload\s*[:(]/.test(line)) {
          hasOnUnload = true;
          onUnloadContent = this._extractFunctionContent(lines, lineNum);
        }

        // 检测setTimeout/setInterval
        var setMatch = this._detectTimerSet(line, lineNum);
        if (setMatch) {
          timerSets.push(setMatch);
        }

        // 检测clearTimeout/clearInterval
        var clearMatch = this._detectTimerClear(line, lineNum);
        if (clearMatch) {
          timerClears.push(clearMatch);
        }
      }

      // 分析定时器是否正确清理
      for (var i = 0; i < timerSets.length; i++) {
        var timerSet = timerSets[i];
        var issue = this._analyzeTimerCleanup(timerSet, timerClears, hasOnUnload, onUnloadContent, filePath);
        if (issue) {
          issues.push(issue);
        }
      }

    } catch (error) {
      console.error('❌ 定时器扫描失败:', error);
    }

    return issues;
  },

  /**
   * 检测定时器设置
   * @private
   */
  _detectTimerSet: function(line, lineNum) {
    // 匹配 setTimeout 或 setInterval
    var patterns = [
      // this.timer = setTimeout(...)
      /this\.(\w+)\s*=\s*(setTimeout|setInterval)\s*\(/,
      // var timer = setTimeout(...)
      /var\s+(\w+)\s*=\s*(setTimeout|setInterval)\s*\(/,
      // self.timer = setTimeout(...)
      /self\.(\w+)\s*=\s*(setTimeout|setInterval)\s*\(/,
      // 直接调用 setTimeout(...) 不保存ID
      /^\s*(setTimeout|setInterval)\s*\(/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = line.match(patterns[i]);
      if (match) {
        var isStored = i < 3; // 前三种模式保存了ID
        var varName = isStored ? match[1] : null;
        var timerType = isStored ? match[2] : match[1];

        return {
          line: lineNum + 1,
          code: line.trim(),
          type: timerType,
          variableName: varName,
          isStored: isStored
        };
      }
    }

    return null;
  },

  /**
   * 检测定时器清理
   * @private
   */
  _detectTimerClear: function(line, lineNum) {
    // 匹配 clearTimeout 或 clearInterval
    var patterns = [
      // clearTimeout(this.timer)
      /(clearTimeout|clearInterval)\s*\(\s*this\.(\w+)\s*\)/,
      // clearTimeout(timer)
      /(clearTimeout|clearInterval)\s*\(\s*(\w+)\s*\)/,
      // clearTimeout(self.timer)
      /(clearTimeout|clearInterval)\s*\(\s*self\.(\w+)\s*\)/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = line.match(patterns[i]);
      if (match) {
        return {
          line: lineNum + 1,
          code: line.trim(),
          type: match[1],
          variableName: match[2]
        };
      }
    }

    return null;
  },

  /**
   * 分析定时器清理情况
   * @private
   */
  _analyzeTimerCleanup: function(timerSet, timerClears, hasOnUnload, onUnloadContent, filePath) {
    // 如果定时器ID没有保存，直接报告问题
    if (!timerSet.isStored) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.TIMER_NOT_CLEARED,
        file: filePath,
        line: timerSet.line,
        description: timerSet.type + ' 调用未保存返回的ID，无法在页面卸载时清理',
        suggestion: '将定时器ID保存到 this 上，如：this.timer = ' + timerSet.type + '(...); 并在onUnload中调用 clear' + (timerSet.type === 'setTimeout' ? 'Timeout' : 'Interval') + '(this.timer)',
        autoFixable: false,
        metadata: {
          timerType: timerSet.type,
          code: timerSet.code
        }
      });
    }

    // 检查是否有对应的清理调用
    var varName = timerSet.variableName;
    var hasClear = false;
    var clearInOnUnload = false;

    for (var i = 0; i < timerClears.length; i++) {
      var clear = timerClears[i];
      if (clear.variableName === varName) {
        hasClear = true;
        break;
      }
    }

    // 检查onUnload中是否有清理
    if (hasOnUnload && onUnloadContent) {
      var clearPattern = new RegExp('clear(Timeout|Interval)\\s*\\(\\s*(this\\.|self\\.)?(' + varName + ')\\s*\\)');
      clearInOnUnload = clearPattern.test(onUnloadContent);
    }

    // 如果没有清理调用，报告问题
    if (!hasClear) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.TIMER_NOT_CLEARED,
        file: filePath,
        line: timerSet.line,
        description: '定时器 ' + varName + ' (' + timerSet.type + ') 未找到对应的清理调用',
        suggestion: '在onUnload中添加：if (this.' + varName + ') { clear' + (timerSet.type === 'setTimeout' ? 'Timeout' : 'Interval') + '(this.' + varName + '); this.' + varName + ' = null; }',
        autoFixable: true,
        fixCode: this._generateTimerCleanupCode(varName, timerSet.type),
        metadata: {
          timerType: timerSet.type,
          variableName: varName,
          code: timerSet.code
        }
      });
    }

    // 如果有清理但不在onUnload中，报告警告
    if (hasClear && !clearInOnUnload && hasOnUnload) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MINOR,
        type: AuditConfig.AuditIssueType.TIMER_NOT_CLEARED,
        file: filePath,
        line: timerSet.line,
        description: '定时器 ' + varName + ' 的清理调用可能不在onUnload中，可能导致页面切换时内存泄漏',
        suggestion: '确保在onUnload中清理定时器：if (this.' + varName + ') { clear' + (timerSet.type === 'setTimeout' ? 'Timeout' : 'Interval') + '(this.' + varName + '); }',
        autoFixable: false,
        metadata: {
          timerType: timerSet.type,
          variableName: varName
        }
      });
    }

    return null;
  },

  /**
   * 生成定时器清理代码
   * @private
   */
  _generateTimerCleanupCode: function(varName, timerType) {
    var clearFunc = timerType === 'setTimeout' ? 'clearTimeout' : 'clearInterval';
    return [
      '// 在onUnload中添加以下代码:',
      'if (this.' + varName + ') {',
      '  ' + clearFunc + '(this.' + varName + ');',
      '  this.' + varName + ' = null;',
      '}'
    ].join('\n');
  },

  /**
   * 扫描事件监听器使用模式
   * 检测wx.on*调用，验证是否有对应的wx.off*清理
   *
   * @param {Object} options - 扫描选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Array} 事件监听器问题列表
   *
   * @example
   * var issues = MemoryGuard.scanEventListeners({
   *   code: jsCode,
   *   filePath: 'pages/home/index.js'
   * });
   */
  scanEventListeners: function(options) {
    var issues = [];
    options = options || {};

    if (!options.code || !options.filePath) {
      return issues;
    }

    try {
      var code = options.code;
      var filePath = options.filePath;
      var lines = code.split('\n');

      // 收集事件监听器设置和移除信息
      var listenerSets = [];
      var listenerRemoves = [];
      var hasOnUnload = false;
      var onUnloadContent = '';

      // 扫描所有行
      for (var lineNum = 0; lineNum < lines.length; lineNum++) {
        var line = lines[lineNum];

        // 检测onUnload函数
        if (/onUnload\s*[:(]/.test(line) || /customOnUnload\s*[:(]/.test(line)) {
          hasOnUnload = true;
          onUnloadContent = this._extractFunctionContent(lines, lineNum);
        }

        // 检测wx.on*调用
        var setMatch = this._detectListenerSet(line, lineNum);
        if (setMatch) {
          listenerSets.push(setMatch);
        }

        // 检测wx.off*调用
        var removeMatch = this._detectListenerRemove(line, lineNum);
        if (removeMatch) {
          listenerRemoves.push(removeMatch);
        }
      }

      // 分析监听器是否正确清理
      for (var i = 0; i < listenerSets.length; i++) {
        var listenerSet = listenerSets[i];
        var issue = this._analyzeListenerCleanup(listenerSet, listenerRemoves, hasOnUnload, onUnloadContent, filePath);
        if (issue) {
          issues.push(issue);
        }
      }

    } catch (error) {
      console.error('❌ 事件监听器扫描失败:', error);
    }

    return issues;
  },

  /**
   * 检测事件监听器设置
   * @private
   */
  _detectListenerSet: function(line, lineNum) {
    // 匹配 wx.on* 调用
    var pattern = /wx\.(on\w+)\s*\(/;
    var match = line.match(pattern);

    if (match) {
      var apiName = match[1];

      // 检查是否是已知的需要清理的API
      if (WX_EVENT_APIS[apiName]) {
        // 检测handler是否保存到变量
        var handlerSaved = this._detectHandlerSaved(line);

        return {
          line: lineNum + 1,
          code: line.trim(),
          apiName: apiName,
          offApiName: WX_EVENT_APIS[apiName],
          handlerSaved: handlerSaved.saved,
          handlerName: handlerSaved.name
        };
      }
    }

    return null;
  },

  /**
   * 检测handler是否保存到变量
   * @private
   */
  _detectHandlerSaved: function(line) {
    // 检测 this.handler 或 self.handler 模式
    var patterns = [
      /this\.(\w+Handler|\w+Callback|\w+Listener)/,
      /self\.(\w+Handler|\w+Callback|\w+Listener)/,
      /this\.(\w+)\s*\)/,  // wx.onXxx(this.handler)
      /self\.(\w+)\s*\)/   // wx.onXxx(self.handler)
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = line.match(patterns[i]);
      if (match) {
        return { saved: true, name: match[1] };
      }
    }

    // 检测是否使用匿名函数
    if (/function\s*\(/.test(line)) {
      return { saved: false, name: null };
    }

    return { saved: false, name: null };
  },

  /**
   * 检测事件监听器移除
   * @private
   */
  _detectListenerRemove: function(line, lineNum) {
    // 匹配 wx.off* 调用
    var pattern = /wx\.(off\w+)\s*\(/;
    var match = line.match(pattern);

    if (match) {
      var apiName = match[1];

      // 检测是否传递了handler引用
      var handlerPassed = this._detectHandlerPassed(line);

      return {
        line: lineNum + 1,
        code: line.trim(),
        apiName: apiName,
        handlerPassed: handlerPassed.passed,
        handlerName: handlerPassed.name
      };
    }

    return null;
  },

  /**
   * 检测off调用是否传递了handler引用
   * @private
   */
  _detectHandlerPassed: function(line) {
    // 检测 wx.offXxx(this.handler) 模式
    var patterns = [
      /off\w+\s*\(\s*this\.(\w+)\s*\)/,
      /off\w+\s*\(\s*self\.(\w+)\s*\)/,
      /off\w+\s*\(\s*(\w+)\s*\)/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = line.match(patterns[i]);
      if (match) {
        return { passed: true, name: match[1] };
      }
    }

    // 检测空调用 wx.offXxx()
    if (/off\w+\s*\(\s*\)/.test(line)) {
      return { passed: false, name: null };
    }

    return { passed: false, name: null };
  },

  /**
   * 分析监听器清理情况
   * @private
   */
  _analyzeListenerCleanup: function(listenerSet, listenerRemoves, hasOnUnload, onUnloadContent, filePath) {
    var apiName = listenerSet.apiName;
    var offApiName = listenerSet.offApiName;

    // 检查是否有对应的off调用
    var hasOff = false;
    var offInOnUnload = false;
    var offWithHandler = false;

    for (var i = 0; i < listenerRemoves.length; i++) {
      var remove = listenerRemoves[i];
      if (remove.apiName === offApiName) {
        hasOff = true;
        if (remove.handlerPassed) {
          offWithHandler = true;
        }
        break;
      }
    }

    // 检查onUnload中是否有off调用
    if (hasOnUnload && onUnloadContent) {
      var offPattern = new RegExp('wx\\.' + offApiName + '\\s*\\(');
      offInOnUnload = offPattern.test(onUnloadContent);
    }

    // 如果handler使用匿名函数，报告问题
    if (!listenerSet.handlerSaved) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.LISTENER_NOT_REMOVED,
        file: filePath,
        line: listenerSet.line,
        description: 'wx.' + apiName + ' 使用匿名函数作为handler，无法正确移除监听器',
        suggestion: '将handler保存到this上：this.handler = function(res) { ... }; wx.' + apiName + '(this.handler); 然后在onUnload中：wx.' + offApiName + '(this.handler);',
        autoFixable: false,
        metadata: {
          apiName: apiName,
          offApiName: offApiName,
          code: listenerSet.code
        }
      });
    }

    // 如果没有off调用，报告问题
    if (!hasOff) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.LISTENER_NOT_REMOVED,
        file: filePath,
        line: listenerSet.line,
        description: 'wx.' + apiName + ' 未找到对应的 wx.' + offApiName + ' 调用',
        suggestion: '在onUnload中添加：wx.' + offApiName + '(this.' + (listenerSet.handlerName || 'handler') + ');',
        autoFixable: true,
        fixCode: this._generateListenerCleanupCode(apiName, offApiName, listenerSet.handlerName),
        metadata: {
          apiName: apiName,
          offApiName: offApiName,
          handlerName: listenerSet.handlerName
        }
      });
    }

    // 如果有off但不在onUnload中，报告警告
    if (hasOff && !offInOnUnload && hasOnUnload) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MINOR,
        type: AuditConfig.AuditIssueType.LISTENER_NOT_REMOVED,
        file: filePath,
        line: listenerSet.line,
        description: 'wx.' + offApiName + ' 调用可能不在onUnload中，可能导致页面切换时内存泄漏',
        suggestion: '确保在onUnload中移除监听器：wx.' + offApiName + '(this.' + (listenerSet.handlerName || 'handler') + ');',
        autoFixable: false,
        metadata: {
          apiName: apiName,
          offApiName: offApiName
        }
      });
    }

    // 如果off调用没有传递handler引用，报告警告
    if (hasOff && !offWithHandler) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MINOR,
        type: AuditConfig.AuditIssueType.LISTENER_NOT_REMOVED,
        file: filePath,
        line: listenerSet.line,
        description: 'wx.' + offApiName + ' 调用未传递handler引用，可能无法正确移除特定监听器',
        suggestion: '传递相同的handler引用：wx.' + offApiName + '(this.' + (listenerSet.handlerName || 'handler') + ');',
        autoFixable: false,
        metadata: {
          apiName: apiName,
          offApiName: offApiName
        }
      });
    }

    return null;
  },

  /**
   * 生成监听器清理代码
   * @private
   */
  _generateListenerCleanupCode: function(apiName, offApiName, handlerName) {
    var handler = handlerName || 'handler';
    return [
      '// 在onLoad中保存handler引用:',
      'this.' + handler + ' = function(res) {',
      '  // 处理逻辑',
      '};',
      'wx.' + apiName + '(this.' + handler + ');',
      '',
      '// 在onUnload中移除监听器:',
      'wx.' + offApiName + '(this.' + handler + ');'
    ].join('\n');
  },

  /**
   * 扫描音频实例使用模式
   * 检测createInnerAudioContext调用，验证是否正确清理
   *
   * @param {Object} options - 扫描选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Array} 音频实例问题列表
   *
   * @example
   * var issues = MemoryGuard.scanAudioInstances({
   *   code: jsCode,
   *   filePath: 'pages/audio-player/index.js'
   * });
   */
  scanAudioInstances: function(options) {
    var issues = [];
    options = options || {};

    if (!options.code || !options.filePath) {
      return issues;
    }

    try {
      var code = options.code;
      var filePath = options.filePath;
      var lines = code.split('\n');

      // 收集音频实例创建和清理信息
      var audioCreates = [];
      var audioDestroys = [];
      var audioStops = [];
      var hasOnUnload = false;
      var onUnloadContent = '';

      // 扫描所有行
      for (var lineNum = 0; lineNum < lines.length; lineNum++) {
        var line = lines[lineNum];

        // 检测onUnload函数
        if (/onUnload\s*[:(]/.test(line) || /customOnUnload\s*[:(]/.test(line)) {
          hasOnUnload = true;
          onUnloadContent = this._extractFunctionContent(lines, lineNum);
        }

        // 检测音频实例创建
        var createMatch = this._detectAudioCreate(line, lineNum);
        if (createMatch) {
          audioCreates.push(createMatch);
        }

        // 检测destroy调用
        var destroyMatch = this._detectAudioDestroy(line, lineNum);
        if (destroyMatch) {
          audioDestroys.push(destroyMatch);
        }

        // 检测stop调用
        var stopMatch = this._detectAudioStop(line, lineNum);
        if (stopMatch) {
          audioStops.push(stopMatch);
        }
      }

      // 分析音频实例是否正确清理
      for (var i = 0; i < audioCreates.length; i++) {
        var audioCreate = audioCreates[i];
        var issue = this._analyzeAudioCleanup(audioCreate, audioDestroys, audioStops, hasOnUnload, onUnloadContent, filePath);
        if (issue) {
          issues.push(issue);
        }
      }

    } catch (error) {
      console.error('❌ 音频实例扫描失败:', error);
    }

    return issues;
  },

  /**
   * 检测音频实例创建
   * @private
   */
  _detectAudioCreate: function(line, lineNum) {
    // 匹配 createInnerAudioContext 调用
    var patterns = [
      // this.audio = wx.createInnerAudioContext()
      /this\.(\w+)\s*=\s*wx\.createInnerAudioContext\s*\(/,
      // var audio = wx.createInnerAudioContext()
      /var\s+(\w+)\s*=\s*wx\.createInnerAudioContext\s*\(/,
      // self.audio = wx.createInnerAudioContext()
      /self\.(\w+)\s*=\s*wx\.createInnerAudioContext\s*\(/,
      // 直接调用不保存
      /wx\.createInnerAudioContext\s*\(/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = line.match(patterns[i]);
      if (match) {
        var isStored = i < 3;
        var varName = isStored ? match[1] : null;

        return {
          line: lineNum + 1,
          code: line.trim(),
          variableName: varName,
          isStored: isStored
        };
      }
    }

    return null;
  },

  /**
   * 检测音频destroy调用
   * @private
   */
  _detectAudioDestroy: function(line, lineNum) {
    // 匹配 .destroy() 调用
    var patterns = [
      /this\.(\w+)\.destroy\s*\(/,
      /self\.(\w+)\.destroy\s*\(/,
      /(\w+)\.destroy\s*\(/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = line.match(patterns[i]);
      if (match) {
        return {
          line: lineNum + 1,
          code: line.trim(),
          variableName: match[1]
        };
      }
    }

    return null;
  },

  /**
   * 检测音频stop调用
   * @private
   */
  _detectAudioStop: function(line, lineNum) {
    // 匹配 .stop() 调用
    var patterns = [
      /this\.(\w+)\.stop\s*\(/,
      /self\.(\w+)\.stop\s*\(/,
      /(\w+)\.stop\s*\(/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = line.match(patterns[i]);
      if (match) {
        return {
          line: lineNum + 1,
          code: line.trim(),
          variableName: match[1]
        };
      }
    }

    return null;
  },

  /**
   * 分析音频实例清理情况
   * @private
   */
  _analyzeAudioCleanup: function(audioCreate, audioDestroys, audioStops, hasOnUnload, onUnloadContent, filePath) {
    var varName = audioCreate.variableName;

    // 如果音频实例没有保存，直接报告问题
    if (!audioCreate.isStored) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.AUDIO_NOT_DESTROYED,
        file: filePath,
        line: audioCreate.line,
        description: 'createInnerAudioContext 调用未保存返回的实例，无法在页面卸载时清理',
        suggestion: '将音频实例保存到 this 上，如：this.audio = wx.createInnerAudioContext(); 并在onUnload中调用 this.audio.stop(); this.audio.destroy();',
        autoFixable: false,
        metadata: {
          code: audioCreate.code
        }
      });
    }

    // 检查是否有destroy调用
    var hasDestroy = false;
    var destroyInOnUnload = false;

    for (var i = 0; i < audioDestroys.length; i++) {
      var destroy = audioDestroys[i];
      if (destroy.variableName === varName) {
        hasDestroy = true;
        break;
      }
    }

    // 检查是否有stop调用
    var hasStop = false;
    for (var j = 0; j < audioStops.length; j++) {
      var stop = audioStops[j];
      if (stop.variableName === varName) {
        hasStop = true;
        break;
      }
    }

    // 检查onUnload中是否有清理
    if (hasOnUnload && onUnloadContent) {
      var destroyPattern = new RegExp('(this\\.|self\\.)?(' + varName + ')\\.destroy\\s*\\(');
      destroyInOnUnload = destroyPattern.test(onUnloadContent);
    }

    // 如果没有destroy调用，报告问题
    if (!hasDestroy) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.AUDIO_NOT_DESTROYED,
        file: filePath,
        line: audioCreate.line,
        description: '音频实例 ' + varName + ' 未找到 destroy() 调用，可能导致内存泄漏',
        suggestion: '在onUnload中添加：if (this.' + varName + ') { this.' + varName + '.stop(); this.' + varName + '.destroy(); this.' + varName + ' = null; }',
        autoFixable: true,
        fixCode: this._generateAudioCleanupCode(varName),
        metadata: {
          variableName: varName,
          code: audioCreate.code
        }
      });
    }

    // 如果有destroy但没有stop，报告警告
    if (hasDestroy && !hasStop) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MINOR,
        type: AuditConfig.AuditIssueType.AUDIO_NOT_DESTROYED,
        file: filePath,
        line: audioCreate.line,
        description: '音频实例 ' + varName + ' 在destroy前未调用stop()，可能导致音频继续播放',
        suggestion: '在destroy前先调用stop()：this.' + varName + '.stop(); this.' + varName + '.destroy();',
        autoFixable: false,
        metadata: {
          variableName: varName
        }
      });
    }

    // 如果有destroy但不在onUnload中，报告警告
    if (hasDestroy && !destroyInOnUnload && hasOnUnload) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MINOR,
        type: AuditConfig.AuditIssueType.AUDIO_NOT_DESTROYED,
        file: filePath,
        line: audioCreate.line,
        description: '音频实例 ' + varName + ' 的destroy()调用可能不在onUnload中',
        suggestion: '确保在onUnload中清理音频实例',
        autoFixable: false,
        metadata: {
          variableName: varName
        }
      });
    }

    return null;
  },

  /**
   * 生成音频清理代码
   * @private
   */
  _generateAudioCleanupCode: function(varName) {
    return [
      '// 在onUnload中添加以下代码:',
      'if (this.' + varName + ') {',
      '  this.' + varName + '.stop();',
      '  this.' + varName + '.destroy();',
      '  this.' + varName + ' = null;',
      '}'
    ].join('\n');
  },

  /**
   * 分析页面生命周期清理情况
   * 综合检查页面是否有正确的资源清理
   *
   * @param {Object} options - 分析选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Object} 页面生命周期分析结果
   *
   * @example
   * var result = MemoryGuard.analyzePageLifecycle({
   *   code: jsCode,
   *   filePath: 'pages/home/index.js'
   * });
   */
  analyzePageLifecycle: function(options) {
    var result = {
      file: options.filePath,
      hasOnUnload: false,
      hasCustomOnUnload: false,
      usesBasePage: false,
      cleanupItems: [],
      missingCleanup: [],
      recommendations: [],
      score: 100
    };

    options = options || {};

    if (!options.code || !options.filePath) {
      return result;
    }

    try {
      var code = options.code;
      var filePath = options.filePath;
      var lines = code.split('\n');

      // 检测是否使用BasePage
      result.usesBasePage = /require\s*\(\s*['"].*base-page/.test(code) ||
                            /BasePage/.test(code) ||
                            /createPage\s*\(/.test(code);

      // 检测onUnload
      for (var lineNum = 0; lineNum < lines.length; lineNum++) {
        var line = lines[lineNum];

        if (/onUnload\s*[:(]/.test(line)) {
          result.hasOnUnload = true;
        }

        if (/customOnUnload\s*[:(]/.test(line)) {
          result.hasCustomOnUnload = true;
        }
      }

      // 收集需要清理的资源
      var timerIssues = this.scanTimerUsage(options);
      var listenerIssues = this.scanEventListeners(options);
      var audioIssues = this.scanAudioInstances(options);

      // 统计清理情况
      result.cleanupItems = [];
      result.missingCleanup = [];

      // 处理定时器问题
      for (var i = 0; i < timerIssues.length; i++) {
        var issue = timerIssues[i];
        if (issue.severity === AuditConfig.AuditSeverity.MAJOR ||
            issue.severity === AuditConfig.AuditSeverity.CRITICAL) {
          result.missingCleanup.push({
            type: 'timer',
            description: issue.description,
            line: issue.line
          });
        }
      }

      // 处理监听器问题
      for (var j = 0; j < listenerIssues.length; j++) {
        var issue = listenerIssues[j];
        if (issue.severity === AuditConfig.AuditSeverity.MAJOR ||
            issue.severity === AuditConfig.AuditSeverity.CRITICAL) {
          result.missingCleanup.push({
            type: 'listener',
            description: issue.description,
            line: issue.line
          });
        }
      }

      // 处理音频问题
      for (var k = 0; k < audioIssues.length; k++) {
        var issue = audioIssues[k];
        if (issue.severity === AuditConfig.AuditSeverity.MAJOR ||
            issue.severity === AuditConfig.AuditSeverity.CRITICAL) {
          result.missingCleanup.push({
            type: 'audio',
            description: issue.description,
            line: issue.line
          });
        }
      }

      // 生成建议
      result.recommendations = this._generateLifecycleRecommendations(result);

      // 计算评分
      result.score = this._calculateLifecycleScore(result);

    } catch (error) {
      console.error('❌ 页面生命周期分析失败:', error);
      result.error = error.message;
    }

    return result;
  },

  /**
   * 生成生命周期建议
   * @private
   */
  _generateLifecycleRecommendations: function(result) {
    var recommendations = [];

    // 检查是否使用BasePage
    if (!result.usesBasePage) {
      recommendations.push({
        priority: 'high',
        title: '建议使用BasePage基类',
        description: '使用BasePage可以自动处理常见的资源清理，减少内存泄漏风险'
      });
    }

    // 检查onUnload
    if (!result.hasOnUnload && !result.hasCustomOnUnload) {
      if (result.missingCleanup.length > 0) {
        recommendations.push({
          priority: 'high',
          title: '缺少onUnload生命周期函数',
          description: '页面使用了需要清理的资源，但没有onUnload函数来执行清理'
        });
      }
    }

    // 根据缺失清理数量生成建议
    if (result.missingCleanup.length > 0) {
      var timerCount = 0;
      var listenerCount = 0;
      var audioCount = 0;

      for (var i = 0; i < result.missingCleanup.length; i++) {
        var item = result.missingCleanup[i];
        if (item.type === 'timer') timerCount++;
        if (item.type === 'listener') listenerCount++;
        if (item.type === 'audio') audioCount++;
      }

      if (timerCount > 0) {
        recommendations.push({
          priority: 'high',
          title: '定时器未正确清理',
          description: '检测到 ' + timerCount + ' 个定时器可能未在onUnload中清理'
        });
      }

      if (listenerCount > 0) {
        recommendations.push({
          priority: 'high',
          title: '事件监听器未正确移除',
          description: '检测到 ' + listenerCount + ' 个事件监听器可能未在onUnload中移除'
        });
      }

      if (audioCount > 0) {
        recommendations.push({
          priority: 'high',
          title: '音频实例未正确销毁',
          description: '检测到 ' + audioCount + ' 个音频实例可能未在onUnload中销毁'
        });
      }
    }

    return recommendations;
  },

  /**
   * 计算生命周期评分
   * @private
   */
  _calculateLifecycleScore: function(result) {
    var score = 100;

    // 不使用BasePage扣分
    if (!result.usesBasePage) {
      score -= 10;
    }

    // 缺少onUnload扣分
    if (!result.hasOnUnload && !result.hasCustomOnUnload && result.missingCleanup.length > 0) {
      score -= 20;
    }

    // 每个缺失清理扣分
    score -= result.missingCleanup.length * 15;

    return Math.max(0, score);
  },

  /**
   * 生成清理代码建议
   * 根据检测到的问题生成完整的清理代码
   *
   * @param {Array} issues - 检测到的问题列表
   * @returns {Object} 清理代码建议
   *
   * @example
   * var allIssues = timerIssues.concat(listenerIssues).concat(audioIssues);
   * var cleanupCode = MemoryGuard.generateCleanupCode(allIssues);
   * console.log(cleanupCode.onUnloadCode);
   */
  generateCleanupCode: function(issues) {
    var result = {
      onLoadCode: [],
      onUnloadCode: [],
      fullExample: ''
    };

    if (!issues || issues.length === 0) {
      result.fullExample = '// 未检测到需要清理的资源';
      return result;
    }

    var timerCleanups = [];
    var listenerCleanups = [];
    var audioCleanups = [];

    // 分类处理问题
    for (var i = 0; i < issues.length; i++) {
      var issue = issues[i];
      var metadata = issue.metadata || {};

      if (issue.type === AuditConfig.AuditIssueType.TIMER_NOT_CLEARED) {
        if (metadata.variableName) {
          timerCleanups.push({
            varName: metadata.variableName,
            timerType: metadata.timerType
          });
        }
      } else if (issue.type === AuditConfig.AuditIssueType.LISTENER_NOT_REMOVED) {
        if (metadata.apiName) {
          listenerCleanups.push({
            apiName: metadata.apiName,
            offApiName: metadata.offApiName,
            handlerName: metadata.handlerName || 'handler'
          });
        }
      } else if (issue.type === AuditConfig.AuditIssueType.AUDIO_NOT_DESTROYED) {
        if (metadata.variableName) {
          audioCleanups.push({
            varName: metadata.variableName
          });
        }
      }
    }

    // 生成onLoad代码（handler保存）
    var onLoadLines = [];
    for (var j = 0; j < listenerCleanups.length; j++) {
      var listener = listenerCleanups[j];
      onLoadLines.push('// 保存handler引用以便后续移除');
      onLoadLines.push('this.' + listener.handlerName + ' = function(res) {');
      onLoadLines.push('  // 处理 ' + listener.apiName + ' 事件');
      onLoadLines.push('};');
      onLoadLines.push('wx.' + listener.apiName + '(this.' + listener.handlerName + ');');
      onLoadLines.push('');
    }
    result.onLoadCode = onLoadLines;

    // 生成onUnload代码
    var onUnloadLines = [];

    // 定时器清理
    if (timerCleanups.length > 0) {
      onUnloadLines.push('// 清理定时器');
      for (var k = 0; k < timerCleanups.length; k++) {
        var timer = timerCleanups[k];
        var clearFunc = timer.timerType === 'setTimeout' ? 'clearTimeout' : 'clearInterval';
        onUnloadLines.push('if (this.' + timer.varName + ') {');
        onUnloadLines.push('  ' + clearFunc + '(this.' + timer.varName + ');');
        onUnloadLines.push('  this.' + timer.varName + ' = null;');
        onUnloadLines.push('}');
      }
      onUnloadLines.push('');
    }

    // 监听器清理
    if (listenerCleanups.length > 0) {
      onUnloadLines.push('// 移除事件监听器');
      for (var l = 0; l < listenerCleanups.length; l++) {
        var listener = listenerCleanups[l];
        onUnloadLines.push('if (this.' + listener.handlerName + ') {');
        onUnloadLines.push('  wx.' + listener.offApiName + '(this.' + listener.handlerName + ');');
        onUnloadLines.push('}');
      }
      onUnloadLines.push('');
    }

    // 音频清理
    if (audioCleanups.length > 0) {
      onUnloadLines.push('// 销毁音频实例');
      for (var m = 0; m < audioCleanups.length; m++) {
        var audio = audioCleanups[m];
        onUnloadLines.push('if (this.' + audio.varName + ') {');
        onUnloadLines.push('  this.' + audio.varName + '.stop();');
        onUnloadLines.push('  this.' + audio.varName + '.destroy();');
        onUnloadLines.push('  this.' + audio.varName + ' = null;');
        onUnloadLines.push('}');
      }
    }

    result.onUnloadCode = onUnloadLines;

    // 生成完整示例
    var fullLines = [];
    fullLines.push('/**');
    fullLines.push(' * 资源清理代码示例');
    fullLines.push(' * 根据检测到的 ' + issues.length + ' 个问题生成');
    fullLines.push(' */');
    fullLines.push('');

    if (onLoadLines.length > 0) {
      fullLines.push('// === onLoad 中添加 ===');
      fullLines = fullLines.concat(onLoadLines);
      fullLines.push('');
    }

    if (onUnloadLines.length > 0) {
      fullLines.push('// === onUnload 中添加 ===');
      fullLines = fullLines.concat(onUnloadLines);
    }

    result.fullExample = fullLines.join('\n');

    return result;
  },

  /**
   * 提取函数内容
   * @private
   */
  _extractFunctionContent: function(lines, startLineNum) {
    var content = '';
    var braceCount = 0;
    var started = false;

    for (var i = startLineNum; i < lines.length; i++) {
      var line = lines[i];
      content += line + '\n';

      for (var c = 0; c < line.length; c++) {
        if (line[c] === '{') {
          braceCount++;
          started = true;
        }
        if (line[c] === '}') {
          braceCount--;
          if (started && braceCount === 0) {
            return content;
          }
        }
      }

      // 防止无限循环，最多读取200行
      if (i - startLineNum > 200) {
        break;
      }
    }

    return content;
  },

  /**
   * 综合扫描页面内存问题
   * 一次性扫描所有类型的内存问题
   *
   * @param {Object} options - 扫描选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Object} 综合扫描结果
   *
   * @example
   * var result = MemoryGuard.scanAll({
   *   code: jsCode,
   *   filePath: 'pages/home/index.js'
   * });
   * console.log('总问题数:', result.totalIssues);
   */
  scanAll: function(options) {
    var result = {
      file: options.filePath,
      timerIssues: [],
      listenerIssues: [],
      audioIssues: [],
      lifecycleAnalysis: null,
      totalIssues: 0,
      criticalCount: 0,
      majorCount: 0,
      minorCount: 0,
      cleanupCode: null,
      score: 100
    };

    options = options || {};

    if (!options.code || !options.filePath) {
      return result;
    }

    try {
      // 扫描各类问题
      result.timerIssues = this.scanTimerUsage(options);
      result.listenerIssues = this.scanEventListeners(options);
      result.audioIssues = this.scanAudioInstances(options);
      result.lifecycleAnalysis = this.analyzePageLifecycle(options);

      // 合并所有问题
      var allIssues = result.timerIssues
        .concat(result.listenerIssues)
        .concat(result.audioIssues);

      result.totalIssues = allIssues.length;

      // 统计严重级别
      for (var i = 0; i < allIssues.length; i++) {
        var issue = allIssues[i];
        switch (issue.severity) {
          case AuditConfig.AuditSeverity.CRITICAL:
            result.criticalCount++;
            break;
          case AuditConfig.AuditSeverity.MAJOR:
            result.majorCount++;
            break;
          case AuditConfig.AuditSeverity.MINOR:
            result.minorCount++;
            break;
        }
      }

      // 生成清理代码
      result.cleanupCode = this.generateCleanupCode(allIssues);

      // 计算综合评分
      result.score = this._calculateOverallScore(result);

    } catch (error) {
      console.error('❌ 综合扫描失败:', error);
      result.error = error.message;
    }

    return result;
  },

  /**
   * 计算综合评分
   * @private
   */
  _calculateOverallScore: function(result) {
    var score = 100;

    // 严重问题扣分
    score -= result.criticalCount * 25;
    score -= result.majorCount * 15;
    score -= result.minorCount * 5;

    // 生命周期评分影响
    if (result.lifecycleAnalysis) {
      var lifecycleScore = result.lifecycleAnalysis.score;
      // 生命周期评分占30%权重
      score = Math.round(score * 0.7 + lifecycleScore * 0.3);
    }

    return Math.max(0, score);
  },

  /**
   * 生成审计问题列表
   * 将扫描结果转换为标准审计问题格式
   *
   * @param {Object} scanResult - scanAll的结果
   * @returns {Array} 审计问题列表
   */
  generateAuditIssues: function(scanResult) {
    var issues = [];

    if (!scanResult) {
      return issues;
    }

    // 合并所有问题
    var allIssues = (scanResult.timerIssues || [])
      .concat(scanResult.listenerIssues || [])
      .concat(scanResult.audioIssues || []);

    return allIssues;
  }
};

// 导出模块
module.exports = MemoryGuard;
