'use strict';

/**
 * 🔧 setData性能优化器
 *
 * 检测和优化setData调用模式
 * 扫描代码中的setData调用，识别性能问题和优化机会
 *
 * @module setdata-optimizer
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - setData性能优化
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 单次setData数据量建议控制在1024KB以内
 * - 使用路径字符串局部更新：this.setData({'list[0].like': true})
 * - 非渲染态变量不放入data，挂载到this.privateData
 * - 高频事件（onPageScroll）必须节流，或使用WXS在渲染层处理
 * - 多个setData尽量合并为一次调用
 *
 * @example
 * var SetDataOptimizer = require('./setdata-optimizer.js');
 * var calls = SetDataOptimizer.scanSetDataCalls({ fileSystem: fs });
 * var batchable = SetDataOptimizer.detectBatchableCalls(filePath, code);
 * var unbound = SetDataOptimizer.detectUnboundData(jsPath, wxmlPath, jsCode, wxmlCode);
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 性能阈值常量
 * @constant {Object}
 */
var THRESHOLDS = {
  MAX_PAYLOAD_SIZE: 1024 * 1024,    // 1024KB建议上限
  WARNING_PAYLOAD_SIZE: 100 * 1024, // 100KB警告阈值
  BATCH_INTERVAL: 50,               // 50ms内应合并
  HIGH_FREQ_THROTTLE: 500,          // 高频数据500ms节流
  SENSOR_THROTTLE: 300              // 传感器数据300ms节流
};

/**
 * setData调用模式类型
 * @constant {Object}
 */
var CALL_PATTERN_TYPES = {
  SIMPLE: 'simple',                 // 简单调用 this.setData({key: value})
  FULL_ARRAY_UPDATE: 'full_array',  // 全量数组更新
  FULL_OBJECT_UPDATE: 'full_object', // 全量对象更新
  PARTIAL_UPDATE: 'partial',        // 局部更新 this.setData({'list[0].name': value})
  CALLBACK: 'callback',             // 带回调的调用
  HIGH_FREQUENCY: 'high_freq'       // 高频调用（在scroll/sensor handler中）
};

/**
 * 高频事件处理函数名称
 * @constant {Array<string>}
 */
var HIGH_FREQUENCY_HANDLERS = [
  'onPageScroll',
  'onScroll',
  'onTouchMove',
  'onAccelerometerChange',
  'onCompassChange',
  'onGyroscopeChange',
  'onDeviceMotionChange'
];

/**
 * setData性能优化器
 * @namespace SetDataOptimizer
 */
var SetDataOptimizer = {
  /**
   * 性能阈值常量
   */
  THRESHOLDS: THRESHOLDS,

  /**
   * 调用模式类型
   */
  CALL_PATTERN_TYPES: CALL_PATTERN_TYPES,


  /**
   * 扫描所有setData调用
   * 分析代码中的setData调用，识别性能问题
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Array} setData调用分析结果
   *
   * @example
   * var calls = SetDataOptimizer.scanSetDataCalls({ fileSystem: fs });
   * calls.forEach(function(call) {
   *   console.log(call.file, ':', call.line, '-', call.issues.join(', '));
   * });
   */
  scanSetDataCalls: function(options) {
    options = options || {};

    var results = [];

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResults = this._analyzeFileSetDataCalls(
          options.filePath,
          options.code
        );
        results = results.concat(fileResults);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResults = this._analyzeFileSetDataCalls(filePath, code);
            results = results.concat(fileResults);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }
      // 默认模式：返回分析框架
      else {
        results = this._getDefaultAnalysisFramework();
      }

    } catch (error) {
      console.error('❌ setData调用扫描失败:', error);
    }

    return results;
  },

  /**
   * 分析单个文件中的setData调用
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Array} setData调用列表
   */
  _analyzeFileSetDataCalls: function(filePath, code) {
    var calls = [];
    var lines = code.split('\n');

    // 跟踪当前所在的函数上下文
    var currentFunction = null;
    var functionStack = [];
    var braceCount = 0;

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      // 检测函数定义
      var funcMatch = this._detectFunctionDefinition(line);
      if (funcMatch) {
        functionStack.push({
          name: funcMatch,
          startLine: lineNum,
          braceCount: braceCount
        });
        currentFunction = funcMatch;
      }

      // 跟踪大括号
      for (var c = 0; c < line.length; c++) {
        if (line[c] === '{') braceCount++;
        if (line[c] === '}') {
          braceCount--;
          // 检查是否退出当前函数
          if (functionStack.length > 0 &&
              braceCount <= functionStack[functionStack.length - 1].braceCount) {
            functionStack.pop();
            currentFunction = functionStack.length > 0 ?
              functionStack[functionStack.length - 1].name : null;
          }
        }
      }

      // 检测setData调用
      var setDataMatch = this._detectSetDataCall(line, lineNum, lines);
      if (setDataMatch) {
        var callInfo = {
          file: filePath,
          line: lineNum + 1,
          code: line.trim(),
          function: currentFunction,
          pattern: setDataMatch.pattern,
          dataKeys: setDataMatch.dataKeys,
          estimatedSize: setDataMatch.estimatedSize,
          hasCallback: setDataMatch.hasCallback,
          issues: [],
          suggestions: []
        };

        // 检测问题
        callInfo.issues = this._detectCallIssues(callInfo, currentFunction);
        callInfo.suggestions = this._generateSuggestions(callInfo);

        calls.push(callInfo);
      }
    }

    return calls;
  },

  /**
   * 检测函数定义
   * @private
   */
  _detectFunctionDefinition: function(line) {
    // 匹配各种函数定义模式
    var patterns = [
      // function name() {}
      /function\s+(\w+)\s*\(/,
      // name: function() {}
      /(\w+)\s*:\s*function\s*\(/,
      // name() {} (ES6方法简写)
      /^\s*(\w+)\s*\([^)]*\)\s*\{/,
      // 生命周期函数
      /(onLoad|onShow|onReady|onHide|onUnload|onPullDownRefresh|onReachBottom|onPageScroll|onShareAppMessage|onTabItemTap)\s*[:(]/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = line.match(patterns[i]);
      if (match) {
        return match[1];
      }
    }

    return null;
  },

  /**
   * 检测setData调用
   * @private
   */
  _detectSetDataCall: function(line, lineNum, lines) {
    // 基本setData调用模式
    var setDataPattern = /this\.setData\s*\(/;
    if (!setDataPattern.test(line)) {
      return null;
    }

    var result = {
      pattern: CALL_PATTERN_TYPES.SIMPLE,
      dataKeys: [],
      estimatedSize: 0,
      hasCallback: false
    };

    // 尝试提取setData的参数
    var fullCall = this._extractFullSetDataCall(line, lineNum, lines);

    // 检测是否有回调函数
    result.hasCallback = /,\s*function\s*\(/.test(fullCall) ||
                         /,\s*\(\)\s*=>/.test(fullCall) ||
                         /,\s*\w+\s*\)$/.test(fullCall);

    // 提取数据键
    result.dataKeys = this._extractDataKeys(fullCall);

    // 检测调用模式
    result.pattern = this._detectCallPattern(fullCall, result.dataKeys);

    // 估算数据大小（基于代码长度的粗略估算）
    result.estimatedSize = this._estimateDataSize(fullCall);

    return result;
  },

  /**
   * 提取完整的setData调用（可能跨多行）
   * @private
   */
  _extractFullSetDataCall: function(startLine, lineNum, lines) {
    var call = startLine;
    var parenCount = 0;
    var started = false;

    // 计算起始行的括号
    for (var c = 0; c < startLine.length; c++) {
      if (startLine[c] === '(') {
        parenCount++;
        started = true;
      }
      if (startLine[c] === ')') {
        parenCount--;
      }
    }

    // 如果括号未闭合，继续读取后续行
    var maxLines = 20; // 最多读取20行
    var currentLine = lineNum + 1;

    while (parenCount > 0 && currentLine < lines.length && currentLine - lineNum < maxLines) {
      var nextLine = lines[currentLine];
      call += '\n' + nextLine;

      for (var c = 0; c < nextLine.length; c++) {
        if (nextLine[c] === '(') parenCount++;
        if (nextLine[c] === ')') parenCount--;
      }

      currentLine++;
    }

    return call;
  },

  /**
   * 提取数据键
   * @private
   */
  _extractDataKeys: function(callCode) {
    var keys = [];

    // 匹配对象字面量中的键
    // 简单键: { key: value }
    var simpleKeyPattern = /[{,]\s*(\w+)\s*:/g;
    var match;
    while ((match = simpleKeyPattern.exec(callCode)) !== null) {
      if (keys.indexOf(match[1]) === -1) {
        keys.push(match[1]);
      }
    }

    // 字符串键: { 'key': value } 或 { "key": value }
    var stringKeyPattern = /[{,]\s*['"]([^'"]+)['"]\s*:/g;
    while ((match = stringKeyPattern.exec(callCode)) !== null) {
      if (keys.indexOf(match[1]) === -1) {
        keys.push(match[1]);
      }
    }

    return keys;
  },

  /**
   * 检测调用模式
   * @private
   */
  _detectCallPattern: function(callCode, dataKeys) {
    // 检测局部更新模式 (如 'list[0].name')
    if (/['"][^'"]+\[\d+\][^'"]*['"]/.test(callCode) ||
        /['"][^'"]+\.[^'"]+['"]/.test(callCode)) {
      return CALL_PATTERN_TYPES.PARTIAL_UPDATE;
    }

    // 检测全量数组更新
    for (var i = 0; i < dataKeys.length; i++) {
      var key = dataKeys[i];
      // 检查是否是数组赋值
      var arrayPattern = new RegExp(key + '\\s*:\\s*\\[');
      if (arrayPattern.test(callCode)) {
        return CALL_PATTERN_TYPES.FULL_ARRAY_UPDATE;
      }
    }

    // 检测全量对象更新
    for (var j = 0; j < dataKeys.length; j++) {
      var key = dataKeys[j];
      // 检查是否是对象赋值（排除简单值）
      var objectPattern = new RegExp(key + '\\s*:\\s*\\{');
      if (objectPattern.test(callCode)) {
        return CALL_PATTERN_TYPES.FULL_OBJECT_UPDATE;
      }
    }

    return CALL_PATTERN_TYPES.SIMPLE;
  },

  /**
   * 估算数据大小
   * @private
   */
  _estimateDataSize: function(callCode) {
    // 基于代码长度的粗略估算
    // 实际数据大小可能更大（如变量引用的数据）
    var codeLength = callCode.length;

    // 移除空白字符后的长度
    var compactLength = callCode.replace(/\s+/g, '').length;

    // 假设实际数据是代码长度的2-5倍（考虑变量展开）
    return compactLength * 3;
  },

  /**
   * 检测调用问题
   * @private
   */
  _detectCallIssues: function(callInfo, currentFunction) {
    var issues = [];

    // 检查是否在高频处理函数中
    if (currentFunction && HIGH_FREQUENCY_HANDLERS.indexOf(currentFunction) !== -1) {
      issues.push({
        type: 'high_frequency_setdata',
        severity: AuditConfig.AuditSeverity.MAJOR,
        message: '在高频事件处理函数 ' + currentFunction + ' 中调用setData，可能导致性能问题'
      });
    }

    // 检查全量数组更新
    if (callInfo.pattern === CALL_PATTERN_TYPES.FULL_ARRAY_UPDATE) {
      issues.push({
        type: 'full_array_update',
        severity: AuditConfig.AuditSeverity.MINOR,
        message: '全量数组更新，建议使用局部更新如 this.setData({"list[index].field": value})'
      });
    }

    // 检查全量对象更新
    if (callInfo.pattern === CALL_PATTERN_TYPES.FULL_OBJECT_UPDATE) {
      issues.push({
        type: 'full_object_update',
        severity: AuditConfig.AuditSeverity.MINOR,
        message: '全量对象更新，建议使用局部更新如 this.setData({"obj.field": value})'
      });
    }

    // 检查估算大小
    if (callInfo.estimatedSize > THRESHOLDS.WARNING_PAYLOAD_SIZE) {
      issues.push({
        type: 'large_payload',
        severity: AuditConfig.AuditSeverity.MAJOR,
        message: 'setData数据量较大（估算 ' + Math.round(callInfo.estimatedSize / 1024) + 'KB），建议优化'
      });
    }

    return issues;
  },

  /**
   * 生成优化建议
   * @private
   */
  _generateSuggestions: function(callInfo) {
    var suggestions = [];

    if (callInfo.pattern === CALL_PATTERN_TYPES.FULL_ARRAY_UPDATE) {
      suggestions.push('使用路径字符串进行局部更新：this.setData({"list[' + 'index].field": value})');
    }

    if (callInfo.pattern === CALL_PATTERN_TYPES.FULL_OBJECT_UPDATE) {
      suggestions.push('使用路径字符串进行局部更新：this.setData({"obj.field": value})');
    }

    for (var i = 0; i < callInfo.issues.length; i++) {
      var issue = callInfo.issues[i];
      if (issue.type === 'high_frequency_setdata') {
        suggestions.push('考虑使用节流（throttle）限制setData调用频率');
        suggestions.push('考虑使用WXS在渲染层处理高频数据');
      }
    }

    return suggestions;
  },

  /**
   * 获取默认分析框架
   * @private
   */
  _getDefaultAnalysisFramework: function() {
    return [
      {
        file: 'pages/*/index.js',
        description: '页面文件setData调用分析',
        checkPoints: [
          '检查onPageScroll中的setData调用',
          '检查全量数组/对象更新',
          '检查数据大小',
          '检查是否使用safeSetData'
        ]
      }
    ];
  },


  /**
   * 检测可批量合并的调用
   * 识别同一函数内50ms内可以合并的多个setData调用
   *
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Array} 可合并的调用组
   *
   * @example
   * var batchable = SetDataOptimizer.detectBatchableCalls('pages/home/index.js', code);
   * batchable.forEach(function(group) {
   *   console.log('可合并调用:', group.calls.length, '个');
   *   console.log('建议合并为:', group.suggestedMerge);
   * });
   */
  detectBatchableCalls: function(filePath, code) {
    var batchableGroups = [];

    try {
      var lines = code.split('\n');

      // 跟踪当前函数和其中的setData调用
      var currentFunction = null;
      var functionStack = [];
      var braceCount = 0;
      var setDataCallsInFunction = [];

      for (var lineNum = 0; lineNum < lines.length; lineNum++) {
        var line = lines[lineNum];

        // 检测函数定义
        var funcMatch = this._detectFunctionDefinition(line);
        if (funcMatch) {
          // 保存之前函数的setData调用分析
          if (currentFunction && setDataCallsInFunction.length > 1) {
            var groups = this._groupBatchableCalls(setDataCallsInFunction, currentFunction);
            batchableGroups = batchableGroups.concat(groups);
          }

          functionStack.push({
            name: funcMatch,
            startLine: lineNum,
            braceCount: braceCount
          });
          currentFunction = funcMatch;
          setDataCallsInFunction = [];
        }

        // 跟踪大括号
        for (var c = 0; c < line.length; c++) {
          if (line[c] === '{') braceCount++;
          if (line[c] === '}') {
            braceCount--;
            // 检查是否退出当前函数
            if (functionStack.length > 0 &&
                braceCount <= functionStack[functionStack.length - 1].braceCount) {
              // 分析当前函数的setData调用
              if (setDataCallsInFunction.length > 1) {
                var groups = this._groupBatchableCalls(setDataCallsInFunction, currentFunction);
                batchableGroups = batchableGroups.concat(groups);
              }

              functionStack.pop();
              currentFunction = functionStack.length > 0 ?
                functionStack[functionStack.length - 1].name : null;
              setDataCallsInFunction = [];
            }
          }
        }

        // 检测setData调用
        if (/this\.setData\s*\(/.test(line)) {
          var fullCall = this._extractFullSetDataCall(line, lineNum, lines);
          var dataKeys = this._extractDataKeys(fullCall);

          setDataCallsInFunction.push({
            line: lineNum + 1,
            code: line.trim(),
            fullCode: fullCall,
            dataKeys: dataKeys,
            file: filePath
          });
        }
      }

      // 处理最后一个函数
      if (currentFunction && setDataCallsInFunction.length > 1) {
        var groups = this._groupBatchableCalls(setDataCallsInFunction, currentFunction);
        batchableGroups = batchableGroups.concat(groups);
      }

      // 为每个组生成合并建议
      for (var i = 0; i < batchableGroups.length; i++) {
        batchableGroups[i].suggestedMerge = this._generateMergeSuggestion(batchableGroups[i]);
        batchableGroups[i].file = filePath;
      }

    } catch (error) {
      console.error('❌ 可合并调用检测失败:', error);
    }

    return batchableGroups;
  },

  /**
   * 将setData调用分组为可合并的组
   * @private
   */
  _groupBatchableCalls: function(calls, functionName) {
    var groups = [];

    if (calls.length < 2) {
      return groups;
    }

    // 检测连续的setData调用（行号相近）
    var currentGroup = [calls[0]];

    for (var i = 1; i < calls.length; i++) {
      var prevCall = calls[i - 1];
      var currCall = calls[i];

      // 如果两个调用行号相差不超过10行，认为可以合并
      // （实际的50ms判断需要运行时分析，这里用行号近似）
      if (currCall.line - prevCall.line <= 10) {
        currentGroup.push(currCall);
      } else {
        // 保存当前组（如果有多个调用）
        if (currentGroup.length > 1) {
          groups.push({
            function: functionName,
            calls: currentGroup.slice(),
            lineRange: {
              start: currentGroup[0].line,
              end: currentGroup[currentGroup.length - 1].line
            },
            reason: '这些setData调用在同一函数内且行号相近，建议合并为一次调用'
          });
        }
        currentGroup = [currCall];
      }
    }

    // 处理最后一组
    if (currentGroup.length > 1) {
      groups.push({
        function: functionName,
        calls: currentGroup.slice(),
        lineRange: {
          start: currentGroup[0].line,
          end: currentGroup[currentGroup.length - 1].line
        },
        reason: '这些setData调用在同一函数内且行号相近，建议合并为一次调用'
      });
    }

    return groups;
  },

  /**
   * 生成合并建议代码
   * @private
   */
  _generateMergeSuggestion: function(group) {
    var allKeys = [];
    var keyValuePairs = [];

    for (var i = 0; i < group.calls.length; i++) {
      var call = group.calls[i];
      for (var j = 0; j < call.dataKeys.length; j++) {
        var key = call.dataKeys[j];
        if (allKeys.indexOf(key) === -1) {
          allKeys.push(key);
          keyValuePairs.push(key + ': /* value */');
        }
      }
    }

    var suggestion = 'this.setData({\n';
    for (var k = 0; k < keyValuePairs.length; k++) {
      suggestion += '  ' + keyValuePairs[k];
      if (k < keyValuePairs.length - 1) {
        suggestion += ',';
      }
      suggestion += '\n';
    }
    suggestion += '});';

    return suggestion;
  },


  /**
   * 检测非视图绑定数据
   * 识别setData中设置但未在WXML中使用的数据键
   *
   * @param {string} jsPath - JS文件路径
   * @param {string} wxmlPath - WXML文件路径
   * @param {string} jsCode - JS文件代码
   * @param {string} wxmlCode - WXML文件代码
   * @returns {Array} 非绑定数据列表
   *
   * @example
   * var unbound = SetDataOptimizer.detectUnboundData(
   *   'pages/home/index.js',
   *   'pages/home/index.wxml',
   *   jsCode,
   *   wxmlCode
   * );
   * unbound.forEach(function(item) {
   *   console.log('非绑定数据:', item.dataKey, '建议:', item.suggestion);
   * });
   */
  detectUnboundData: function(jsPath, wxmlPath, jsCode, wxmlCode) {
    var unboundData = [];

    try {
      // 1. 从JS代码中提取所有setData设置的键
      var setDataKeys = this._extractAllSetDataKeys(jsCode);

      // 2. 从WXML代码中提取所有数据绑定
      var wxmlBindings = this._extractWxmlBindings(wxmlCode);

      // 3. 从JS代码中提取data初始化的键
      var initialDataKeys = this._extractInitialDataKeys(jsCode);

      // 4. 合并所有在setData中使用的键
      var allSetDataKeys = {};
      for (var i = 0; i < setDataKeys.length; i++) {
        var keyInfo = setDataKeys[i];
        var baseKey = this._getBaseKey(keyInfo.key);
        if (!allSetDataKeys[baseKey]) {
          allSetDataKeys[baseKey] = [];
        }
        allSetDataKeys[baseKey].push(keyInfo);
      }

      // 5. 检查哪些键未在WXML中绑定
      var setDataKeyNames = Object.keys(allSetDataKeys);
      for (var j = 0; j < setDataKeyNames.length; j++) {
        var key = setDataKeyNames[j];

        // 检查是否在WXML中使用
        var isUsedInWxml = this._isKeyUsedInWxml(key, wxmlBindings);

        // 检查是否是已知的非视图数据（如状态标志）
        var isKnownNonViewData = this._isKnownNonViewData(key);

        if (!isUsedInWxml && !isKnownNonViewData) {
          var locations = allSetDataKeys[key];
          unboundData.push({
            dataKey: key,
            file: jsPath,
            locations: locations.map(function(loc) {
              return { line: loc.line, code: loc.code };
            }),
            suggestion: this._generateUnboundDataSuggestion(key),
            severity: AuditConfig.AuditSeverity.MINOR,
            type: AuditConfig.AuditIssueType.SETDATA_UNBOUND_DATA
          });
        }
      }

    } catch (error) {
      console.error('❌ 非绑定数据检测失败:', error);
    }

    return unboundData;
  },

  /**
   * 从JS代码中提取所有setData设置的键
   * @private
   */
  _extractAllSetDataKeys: function(code) {
    var keys = [];
    var lines = code.split('\n');

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      // 检测setData调用
      if (/this\.setData\s*\(/.test(line)) {
        var fullCall = this._extractFullSetDataCall(line, lineNum, lines);
        var dataKeys = this._extractDataKeys(fullCall);

        for (var i = 0; i < dataKeys.length; i++) {
          keys.push({
            key: dataKeys[i],
            line: lineNum + 1,
            code: line.trim()
          });
        }
      }
    }

    return keys;
  },

  /**
   * 从WXML代码中提取所有数据绑定
   * @private
   */
  _extractWxmlBindings: function(wxmlCode) {
    var bindings = [];

    // 匹配 {{expression}} 中的变量
    var mustachePattern = /\{\{([^}]+)\}\}/g;
    var match;

    while ((match = mustachePattern.exec(wxmlCode)) !== null) {
      var expression = match[1];

      // 提取表达式中的变量名
      var variables = this._extractVariablesFromExpression(expression);
      bindings = bindings.concat(variables);
    }

    // 匹配 wx:for="{{list}}" 中的变量
    var wxForPattern = /wx:for\s*=\s*["']\{\{([^}]+)\}\}["']/g;
    while ((match = wxForPattern.exec(wxmlCode)) !== null) {
      bindings.push(match[1].trim());
    }

    // 匹配 wx:if="{{condition}}" 中的变量
    var wxIfPattern = /wx:if\s*=\s*["']\{\{([^}]+)\}\}["']/g;
    while ((match = wxIfPattern.exec(wxmlCode)) !== null) {
      var variables = this._extractVariablesFromExpression(match[1]);
      bindings = bindings.concat(variables);
    }

    // 匹配 wx:elif="{{condition}}" 中的变量
    var wxElifPattern = /wx:elif\s*=\s*["']\{\{([^}]+)\}\}["']/g;
    while ((match = wxElifPattern.exec(wxmlCode)) !== null) {
      var variables = this._extractVariablesFromExpression(match[1]);
      bindings = bindings.concat(variables);
    }

    // 匹配 hidden="{{condition}}" 中的变量
    var hiddenPattern = /hidden\s*=\s*["']\{\{([^}]+)\}\}["']/g;
    while ((match = hiddenPattern.exec(wxmlCode)) !== null) {
      var variables = this._extractVariablesFromExpression(match[1]);
      bindings = bindings.concat(variables);
    }

    // 匹配 data-xxx="{{value}}" 中的变量
    var dataAttrPattern = /data-\w+\s*=\s*["']\{\{([^}]+)\}\}["']/g;
    while ((match = dataAttrPattern.exec(wxmlCode)) !== null) {
      var variables = this._extractVariablesFromExpression(match[1]);
      bindings = bindings.concat(variables);
    }

    // 去重
    var uniqueBindings = [];
    for (var i = 0; i < bindings.length; i++) {
      if (uniqueBindings.indexOf(bindings[i]) === -1) {
        uniqueBindings.push(bindings[i]);
      }
    }

    return uniqueBindings;
  },

  /**
   * 从表达式中提取变量名
   * @private
   */
  _extractVariablesFromExpression: function(expression) {
    var variables = [];

    // 移除字符串字面量
    expression = expression.replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '');

    // 匹配变量名（包括点号访问）
    var varPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)/g;
    var match;

    while ((match = varPattern.exec(expression)) !== null) {
      var varName = match[1];

      // 排除关键字和常见的内置对象
      var keywords = ['true', 'false', 'null', 'undefined', 'item', 'index',
                      'Math', 'Number', 'String', 'Array', 'Object', 'JSON',
                      'parseInt', 'parseFloat', 'isNaN', 'isFinite'];

      if (keywords.indexOf(varName) === -1 && keywords.indexOf(varName.split('.')[0]) === -1) {
        // 只取第一级变量名
        var baseVar = varName.split('.')[0];
        if (variables.indexOf(baseVar) === -1) {
          variables.push(baseVar);
        }
      }
    }

    return variables;
  },

  /**
   * 从JS代码中提取data初始化的键
   * @private
   */
  _extractInitialDataKeys: function(code) {
    var keys = [];

    // 匹配 data: { ... } 或 data() { return { ... } }
    var dataPattern = /data\s*[:{]\s*(?:return\s*)?\{([^}]+)\}/;
    var match = code.match(dataPattern);

    if (match) {
      var dataContent = match[1];
      var keyPattern = /(\w+)\s*:/g;
      var keyMatch;

      while ((keyMatch = keyPattern.exec(dataContent)) !== null) {
        keys.push(keyMatch[1]);
      }
    }

    return keys;
  },

  /**
   * 获取键的基础名称（去除数组索引和属性路径）
   * @private
   */
  _getBaseKey: function(key) {
    // 'list[0].name' -> 'list'
    // 'obj.field' -> 'obj'
    return key.split(/[\.\[]/)[0];
  },

  /**
   * 检查键是否在WXML中使用
   * @private
   */
  _isKeyUsedInWxml: function(key, wxmlBindings) {
    for (var i = 0; i < wxmlBindings.length; i++) {
      var binding = wxmlBindings[i];
      // 检查完全匹配或前缀匹配
      if (binding === key || binding.indexOf(key + '.') === 0 || binding.indexOf(key + '[') === 0) {
        return true;
      }
      // 检查binding是否是key的子属性
      if (key.indexOf(binding + '.') === 0 || key.indexOf(binding + '[') === 0) {
        return true;
      }
    }
    return false;
  },

  /**
   * 检查是否是已知的非视图数据
   * @private
   */
  _isKnownNonViewData: function(key) {
    // 这些是常见的非视图绑定数据，用于内部状态管理
    var knownNonViewKeys = [
      'loading',           // 加载状态（虽然可能绑定到视图）
      'isLoading',
      'isRefreshing',
      'hasMore',
      'page',
      'pageSize',
      'total',
      'timer',
      'timerId',
      'audioContext',
      'innerAudioContext',
      'observer',
      'intersectionObserver',
      'animation',
      'animationData',
      'scrollTop',
      'windowHeight',
      'windowWidth',
      'statusBarHeight',
      'safeAreaBottom',
      'platform',
      'systemInfo'
    ];

    return knownNonViewKeys.indexOf(key) !== -1;
  },

  /**
   * 生成非绑定数据的优化建议
   * @private
   */
  _generateUnboundDataSuggestion: function(key) {
    return '数据键 "' + key + '" 未在WXML中绑定使用。' +
           '建议：1) 如果是内部状态，改用 this.' + key + ' 或 this.privateData.' + key + ' 存储；' +
           '2) 如果确实需要在视图中使用，请检查WXML绑定是否正确。';
  },


  /**
   * 生成局部更新代码
   * 将全量更新转换为局部更新
   *
   * @param {Object} originalCall - 原始setData调用信息
   * @param {string} originalCall.code - 原始代码
   * @param {string} originalCall.pattern - 调用模式
   * @param {Array} originalCall.dataKeys - 数据键列表
   * @returns {Object} 优化建议
   *
   * @example
   * var suggestion = SetDataOptimizer.generatePartialUpdate({
   *   code: 'this.setData({ list: newList })',
   *   pattern: 'full_array',
   *   dataKeys: ['list']
   * });
   * console.log(suggestion.optimizedCode);
   */
  generatePartialUpdate: function(originalCall) {
    var result = {
      original: originalCall.code,
      optimizedCode: null,
      explanation: '',
      applicable: false
    };

    try {
      var pattern = originalCall.pattern;

      if (pattern === CALL_PATTERN_TYPES.FULL_ARRAY_UPDATE) {
        result = this._generateArrayPartialUpdate(originalCall, result);
      } else if (pattern === CALL_PATTERN_TYPES.FULL_OBJECT_UPDATE) {
        result = this._generateObjectPartialUpdate(originalCall, result);
      } else if (pattern === CALL_PATTERN_TYPES.SIMPLE) {
        result.explanation = '简单更新模式，无需优化';
        result.applicable = false;
      } else if (pattern === CALL_PATTERN_TYPES.PARTIAL_UPDATE) {
        result.explanation = '已经是局部更新模式，无需优化';
        result.applicable = false;
      }

    } catch (error) {
      console.error('❌ 生成局部更新代码失败:', error);
      result.error = error.message;
    }

    return result;
  },

  /**
   * 生成数组局部更新代码
   * @private
   */
  _generateArrayPartialUpdate: function(originalCall, result) {
    var dataKeys = originalCall.dataKeys || [];

    if (dataKeys.length === 0) {
      result.explanation = '无法识别数据键';
      return result;
    }

    var arrayKey = dataKeys[0]; // 假设第一个键是数组

    result.applicable = true;
    result.explanation = '将全量数组更新转换为局部更新';

    // 生成示例代码
    result.optimizedCode = [
      '// 原始代码（全量更新）:',
      '// ' + originalCall.code,
      '',
      '// 优化方案1: 更新单个元素',
      'var index = /* 要更新的索引 */;',
      'this.setData({',
      '  [\'' + arrayKey + '[\' + index + \'].field\']: newValue',
      '});',
      '',
      '// 优化方案2: 更新多个元素（使用路径字符串）',
      'var updates = {};',
      'changedIndices.forEach(function(index) {',
      '  updates[\'' + arrayKey + '[\' + index + \']\']] = newItems[index];',
      '});',
      'this.setData(updates);',
      '',
      '// 优化方案3: 追加元素（而非替换整个数组）',
      'var currentList = this.data.' + arrayKey + ';',
      'var newIndex = currentList.length;',
      'this.setData({',
      '  [\'' + arrayKey + '[\' + newIndex + \']\']: newItem',
      '});'
    ].join('\n');

    return result;
  },

  /**
   * 生成对象局部更新代码
   * @private
   */
  _generateObjectPartialUpdate: function(originalCall, result) {
    var dataKeys = originalCall.dataKeys || [];

    if (dataKeys.length === 0) {
      result.explanation = '无法识别数据键';
      return result;
    }

    var objectKey = dataKeys[0]; // 假设第一个键是对象

    result.applicable = true;
    result.explanation = '将全量对象更新转换为局部更新';

    // 生成示例代码
    result.optimizedCode = [
      '// 原始代码（全量更新）:',
      '// ' + originalCall.code,
      '',
      '// 优化方案: 使用路径字符串更新特定字段',
      'this.setData({',
      '  \'' + objectKey + '.fieldName\': newValue,',
      '  \'' + objectKey + '.anotherField\': anotherValue',
      '});',
      '',
      '// 如果需要更新多个字段，可以动态构建更新对象',
      'var updates = {};',
      'Object.keys(changedFields).forEach(function(field) {',
      '  updates[\'' + objectKey + '.\' + field] = changedFields[field];',
      '});',
      'this.setData(updates);'
    ].join('\n');

    return result;
  },

  /**
   * 生成审计问题列表
   * 将扫描结果转换为标准审计问题格式
   *
   * @param {Array} scanResults - scanSetDataCalls的结果
   * @returns {Array} 审计问题列表
   */
  generateAuditIssues: function(scanResults) {
    var issues = [];

    for (var i = 0; i < scanResults.length; i++) {
      var result = scanResults[i];

      // 跳过没有问题的调用
      if (!result.issues || result.issues.length === 0) {
        continue;
      }

      for (var j = 0; j < result.issues.length; j++) {
        var issue = result.issues[j];

        issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.PERFORMANCE,
          severity: issue.severity,
          type: this._mapIssueType(issue.type),
          file: result.file,
          line: result.line,
          description: issue.message,
          suggestion: result.suggestions.length > 0 ? result.suggestions.join('; ') : '优化setData调用',
          metadata: {
            pattern: result.pattern,
            dataKeys: result.dataKeys,
            estimatedSize: result.estimatedSize,
            function: result.function
          }
        }));
      }
    }

    return issues;
  },

  /**
   * 映射问题类型到审计问题类型
   * @private
   */
  _mapIssueType: function(issueType) {
    var typeMap = {
      'high_frequency_setdata': AuditConfig.AuditIssueType.SETDATA_FREQUENT_CALLS,
      'full_array_update': AuditConfig.AuditIssueType.SETDATA_LARGE_PAYLOAD,
      'full_object_update': AuditConfig.AuditIssueType.SETDATA_LARGE_PAYLOAD,
      'large_payload': AuditConfig.AuditIssueType.SETDATA_LARGE_PAYLOAD
    };

    return typeMap[issueType] || AuditConfig.AuditIssueType.SETDATA_LARGE_PAYLOAD;
  },

  /**
   * 分析页面的setData使用情况
   * 综合分析单个页面的所有setData问题
   *
   * @param {string} jsPath - JS文件路径
   * @param {string} wxmlPath - WXML文件路径
   * @param {string} jsCode - JS文件代码
   * @param {string} wxmlCode - WXML文件代码
   * @returns {Object} 页面setData分析报告
   */
  analyzePageSetData: function(jsPath, wxmlPath, jsCode, wxmlCode) {
    var report = {
      file: jsPath,
      totalCalls: 0,
      issueCount: 0,
      issues: [],
      batchableGroups: [],
      unboundData: [],
      recommendations: [],
      score: 100 // 满分100
    };

    try {
      // 1. 扫描setData调用
      var calls = this.scanSetDataCalls({
        code: jsCode,
        filePath: jsPath
      });
      report.totalCalls = calls.length;

      // 收集问题
      for (var i = 0; i < calls.length; i++) {
        if (calls[i].issues && calls[i].issues.length > 0) {
          report.issues = report.issues.concat(calls[i].issues.map(function(issue) {
            return {
              line: calls[i].line,
              type: issue.type,
              message: issue.message,
              severity: issue.severity
            };
          }));
        }
      }
      report.issueCount = report.issues.length;

      // 2. 检测可合并调用
      report.batchableGroups = this.detectBatchableCalls(jsPath, jsCode);

      // 3. 检测非绑定数据
      if (wxmlCode) {
        report.unboundData = this.detectUnboundData(jsPath, wxmlPath, jsCode, wxmlCode);
      }

      // 4. 生成建议
      report.recommendations = this._generatePageRecommendations(report);

      // 5. 计算评分
      report.score = this._calculatePageScore(report);

    } catch (error) {
      console.error('❌ 页面setData分析失败:', error);
      report.error = error.message;
    }

    return report;
  },

  /**
   * 生成页面级优化建议
   * @private
   */
  _generatePageRecommendations: function(report) {
    var recommendations = [];

    // 基于问题数量
    if (report.issueCount > 5) {
      recommendations.push({
        priority: 'high',
        title: 'setData调用存在较多问题',
        description: '检测到 ' + report.issueCount + ' 个setData相关问题，建议逐一优化'
      });
    }

    // 基于可合并调用
    if (report.batchableGroups.length > 0) {
      var totalBatchable = 0;
      for (var i = 0; i < report.batchableGroups.length; i++) {
        totalBatchable += report.batchableGroups[i].calls.length;
      }
      recommendations.push({
        priority: 'medium',
        title: '存在可合并的setData调用',
        description: '检测到 ' + totalBatchable + ' 个setData调用可以合并为 ' +
                     report.batchableGroups.length + ' 次调用'
      });
    }

    // 基于非绑定数据
    if (report.unboundData.length > 0) {
      recommendations.push({
        priority: 'low',
        title: '存在非视图绑定数据',
        description: '检测到 ' + report.unboundData.length + ' 个数据键未在WXML中使用，' +
                     '建议改用this.privateData存储'
      });
    }

    return recommendations;
  },

  /**
   * 计算页面setData评分
   * @private
   */
  _calculatePageScore: function(report) {
    var score = 100;

    // 每个问题扣分
    for (var i = 0; i < report.issues.length; i++) {
      var issue = report.issues[i];
      switch (issue.severity) {
        case AuditConfig.AuditSeverity.CRITICAL:
          score -= 20;
          break;
        case AuditConfig.AuditSeverity.MAJOR:
          score -= 10;
          break;
        case AuditConfig.AuditSeverity.MINOR:
          score -= 3;
          break;
        case AuditConfig.AuditSeverity.INFO:
          score -= 1;
          break;
      }
    }

    // 可合并调用扣分
    score -= report.batchableGroups.length * 5;

    // 非绑定数据扣分
    score -= report.unboundData.length * 2;

    return Math.max(0, score);
  }
};

// 导出模块
module.exports = SetDataOptimizer;
