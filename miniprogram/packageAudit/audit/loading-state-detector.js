'use strict';

/**
 * 🔄 加载状态检测器
 *
 * 检测微信小程序页面中缺少加载状态的问题
 * 扫描异步操作（wx.request, Promise, async/await）
 * 验证是否有正确的loading、success、error状态处理
 *
 * @module loading-state-detector
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 加载状态检测
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 分级加载策略：短时间(<1s)静默处理，中等时间(1-3s)骨架屏，长时间(>3s)进度提示
 * - 骨架屏应与真实内容布局1:1匹配，避免视觉跳动
 * - 局部加载优于全局阻塞，使用Button Loading而非全局蒙层
 * - 乐观UI：低风险操作先更新界面，后台异步同步
 * - 超时处理：超过10秒应自动停止并显示重试按钮
 *
 * @example
 * var LoadingStateDetector = require('./loading-state-detector.js');
 * var issues = LoadingStateDetector.scanAsyncOperations({
 *   code: jsCode,
 *   filePath: 'pages/home/index.js'
 * });
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 异步操作模式
 * @constant {Object}
 */
var ASYNC_PATTERNS = {
  // wx.request 调用
  WX_REQUEST: {
    pattern: /wx\.request\s*\(/,
    name: 'wx.request',
    description: '网络请求'
  },
  // wx.cloud.callFunction 调用
  CLOUD_FUNCTION: {
    pattern: /wx\.cloud\.callFunction\s*\(/,
    name: 'wx.cloud.callFunction',
    description: '云函数调用'
  },
  // wx.downloadFile 调用
  DOWNLOAD_FILE: {
    pattern: /wx\.downloadFile\s*\(/,
    name: 'wx.downloadFile',
    description: '文件下载'
  },
  // wx.uploadFile 调用
  UPLOAD_FILE: {
    pattern: /wx\.uploadFile\s*\(/,
    name: 'wx.uploadFile',
    description: '文件上传'
  },
  // Promise 模式
  PROMISE: {
    pattern: /new\s+Promise\s*\(/,
    name: 'Promise',
    description: 'Promise异步操作'
  },
  // .then() 链式调用
  THEN_CHAIN: {
    pattern: /\.then\s*\(/,
    name: '.then()',
    description: 'Promise链式调用'
  },
  // async/await 模式 (ES6+, 可能在某些环境支持)
  ASYNC_FUNCTION: {
    pattern: /async\s+function|async\s*\(/,
    name: 'async function',
    description: '异步函数'
  },
  // await 关键字
  AWAIT: {
    pattern: /await\s+/,
    name: 'await',
    description: 'await表达式'
  },
  // wx.getStorage 异步版本
  GET_STORAGE: {
    pattern: /wx\.getStorage\s*\(/,
    name: 'wx.getStorage',
    description: '异步存储读取'
  },
  // wx.setStorage 异步版本
  SET_STORAGE: {
    pattern: /wx\.setStorage\s*\(/,
    name: 'wx.setStorage',
    description: '异步存储写入'
  }
};

/**
 * 加载状态模式
 * @constant {Object}
 */
var LOADING_STATE_PATTERNS = {
  // setData loading: true
  SET_LOADING_TRUE: /setData\s*\(\s*\{[^}]*loading\s*:\s*true/,
  // setData loading: false
  SET_LOADING_FALSE: /setData\s*\(\s*\{[^}]*loading\s*:\s*false/,
  // setData isLoading: true
  SET_IS_LOADING_TRUE: /setData\s*\(\s*\{[^}]*isLoading\s*:\s*true/,
  // setData isLoading: false
  SET_IS_LOADING_FALSE: /setData\s*\(\s*\{[^}]*isLoading\s*:\s*false/,
  // wx.showLoading
  WX_SHOW_LOADING: /wx\.showLoading\s*\(/,
  // wx.hideLoading
  WX_HIDE_LOADING: /wx\.hideLoading\s*\(/,
  // wx.showNavigationBarLoading
  WX_SHOW_NAV_LOADING: /wx\.showNavigationBarLoading\s*\(/,
  // wx.hideNavigationBarLoading
  WX_HIDE_NAV_LOADING: /wx\.hideNavigationBarLoading\s*\(/,
  // 通用loading状态变量
  LOADING_VAR: /loading|isLoading|fetching|isFetching|submitting|isSubmitting/i
};

/**
 * 错误状态模式
 * @constant {Object}
 */
var ERROR_STATE_PATTERNS = {
  // fail 回调
  FAIL_CALLBACK: /fail\s*:\s*function|fail\s*\(/,
  // catch 处理
  CATCH_HANDLER: /\.catch\s*\(/,
  // error 回调
  ERROR_CALLBACK: /error\s*:\s*function|onError\s*:/,
  // wx.showToast 错误提示
  WX_SHOW_TOAST: /wx\.showToast\s*\(/,
  // wx.showModal 错误弹窗
  WX_SHOW_MODAL: /wx\.showModal\s*\(/,
  // setData error 状态
  SET_ERROR_STATE: /setData\s*\(\s*\{[^}]*(error|hasError|isError)\s*:/
};

/**
 * 成功状态模式
 * @constant {Object}
 */
var SUCCESS_STATE_PATTERNS = {
  // success 回调
  SUCCESS_CALLBACK: /success\s*:\s*function|success\s*\(/,
  // complete 回调
  COMPLETE_CALLBACK: /complete\s*:\s*function|complete\s*\(/,
  // .then() 处理
  THEN_HANDLER: /\.then\s*\(/,
  // setData 更新数据
  SET_DATA_UPDATE: /setData\s*\(/
};

/**
 * 加载状态检测器
 * @namespace LoadingStateDetector
 */
var LoadingStateDetector = {
  /**
   * 异步操作模式
   */
  ASYNC_PATTERNS: ASYNC_PATTERNS,

  /**
   * 加载状态模式
   */
  LOADING_STATE_PATTERNS: LOADING_STATE_PATTERNS,

  /**
   * 错误状态模式
   */
  ERROR_STATE_PATTERNS: ERROR_STATE_PATTERNS,

  /**
   * 扫描异步操作的加载状态处理
   * 检测页面中的异步操作是否有正确的loading状态管理
   *
   * @param {Object} options - 扫描选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Array} 加载状态问题列表
   *
   * @example
   * var issues = LoadingStateDetector.scanAsyncOperations({
   *   code: jsCode,
   *   filePath: 'pages/home/index.js'
   * });
   */
  scanAsyncOperations: function(options) {
    var issues = [];
    options = options || {};

    if (!options.code || !options.filePath) {
      return issues;
    }

    try {
      var code = options.code;
      var filePath = options.filePath;
      var lines = code.split('\n');

      // 收集异步操作
      var asyncOperations = this._collectAsyncOperations(lines, filePath);

      // 分析每个异步操作的状态处理
      for (var i = 0; i < asyncOperations.length; i++) {
        var asyncOp = asyncOperations[i];
        var issue = this._analyzeAsyncStateHandling(asyncOp, code, filePath);
        if (issue) {
          issues.push(issue);
        }
      }

    } catch (error) {
      console.error('❌ 异步操作扫描失败:', error);
    }

    return issues;
  },

  /**
   * 收集异步操作
   * @private
   */
  _collectAsyncOperations: function(lines, filePath) {
    var operations = [];

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      // 检测各种异步模式
      var patternKeys = Object.keys(ASYNC_PATTERNS);
      for (var i = 0; i < patternKeys.length; i++) {
        var key = patternKeys[i];
        var patternInfo = ASYNC_PATTERNS[key];

        if (patternInfo.pattern.test(line)) {
          // 提取上下文（前后各5行）
          var contextStart = Math.max(0, lineNum - 5);
          var contextEnd = Math.min(lines.length - 1, lineNum + 20);
          var context = lines.slice(contextStart, contextEnd + 1).join('\n');

          operations.push({
            type: key,
            name: patternInfo.name,
            description: patternInfo.description,
            line: lineNum + 1,
            code: line.trim(),
            context: context,
            contextStartLine: contextStart + 1
          });
        }
      }
    }

    return operations;
  },

  /**
   * 分析异步操作的状态处理
   * @private
   */
  _analyzeAsyncStateHandling: function(asyncOp, fullCode, filePath) {
    var context = asyncOp.context;
    var hasLoadingBefore = false;
    var hasLoadingAfter = false;
    var hasErrorHandling = false;
    var hasSuccessHandling = false;

    // 检测loading状态
    var loadingPatternKeys = Object.keys(LOADING_STATE_PATTERNS);
    for (var i = 0; i < loadingPatternKeys.length; i++) {
      var pattern = LOADING_STATE_PATTERNS[loadingPatternKeys[i]];
      if (pattern.test(context)) {
        // 简单判断：如果上下文中有loading相关代码，认为有处理
        hasLoadingBefore = true;
        hasLoadingAfter = true;
        break;
      }
    }

    // 检测错误处理
    var errorPatternKeys = Object.keys(ERROR_STATE_PATTERNS);
    for (var j = 0; j < errorPatternKeys.length; j++) {
      var pattern = ERROR_STATE_PATTERNS[errorPatternKeys[j]];
      if (pattern.test(context)) {
        hasErrorHandling = true;
        break;
      }
    }

    // 检测成功处理
    var successPatternKeys = Object.keys(SUCCESS_STATE_PATTERNS);
    for (var k = 0; k < successPatternKeys.length; k++) {
      var pattern = SUCCESS_STATE_PATTERNS[successPatternKeys[k]];
      if (pattern.test(context)) {
        hasSuccessHandling = true;
        break;
      }
    }

    // 根据异步操作类型决定是否需要报告问题
    // wx.request 等网络请求必须有loading和error处理
    var requiresLoadingState = this._requiresLoadingState(asyncOp.type);
    var requiresErrorHandling = this._requiresErrorHandling(asyncOp.type);

    // 生成问题报告
    if (requiresLoadingState && !hasLoadingBefore) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.UI,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.MISSING_LOADING_STATE,
        file: filePath,
        line: asyncOp.line,
        description: asyncOp.name + ' (' + asyncOp.description + ') 缺少loading状态处理，用户无法感知操作进行中',
        suggestion: this._generateLoadingSuggestion(asyncOp),
        autoFixable: false,
        metadata: {
          asyncType: asyncOp.type,
          asyncName: asyncOp.name,
          code: asyncOp.code,
          hasErrorHandling: hasErrorHandling,
          hasSuccessHandling: hasSuccessHandling
        }
      });
    }

    if (requiresErrorHandling && !hasErrorHandling) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.UI,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.MISSING_ERROR_STATE,
        file: filePath,
        line: asyncOp.line,
        description: asyncOp.name + ' (' + asyncOp.description + ') 缺少错误处理，操作失败时用户无法获得反馈',
        suggestion: this._generateErrorSuggestion(asyncOp),
        autoFixable: false,
        metadata: {
          asyncType: asyncOp.type,
          asyncName: asyncOp.name,
          code: asyncOp.code,
          hasLoadingState: hasLoadingBefore,
          hasSuccessHandling: hasSuccessHandling
        }
      });
    }

    return null;
  },

  /**
   * 判断是否需要loading状态
   * @private
   */
  _requiresLoadingState: function(asyncType) {
    // 网络请求、文件操作等需要loading状态
    var requiresLoading = [
      'WX_REQUEST',
      'CLOUD_FUNCTION',
      'DOWNLOAD_FILE',
      'UPLOAD_FILE'
    ];
    return requiresLoading.indexOf(asyncType) !== -1;
  },

  /**
   * 判断是否需要错误处理
   * @private
   */
  _requiresErrorHandling: function(asyncType) {
    // 所有网络相关操作都需要错误处理
    var requiresError = [
      'WX_REQUEST',
      'CLOUD_FUNCTION',
      'DOWNLOAD_FILE',
      'UPLOAD_FILE',
      'PROMISE'
    ];
    return requiresError.indexOf(asyncType) !== -1;
  },

  /**
   * 生成loading状态建议
   * @private
   */
  _generateLoadingSuggestion: function(asyncOp) {
    var suggestions = {
      'WX_REQUEST': '在发起请求前设置loading状态：\n' +
        '1. 使用 this.setData({ loading: true }) 或\n' +
        '2. 使用 wx.showLoading({ title: "加载中..." })\n' +
        '请求完成后（success/fail/complete）恢复状态',
      'CLOUD_FUNCTION': '在调用云函数前显示loading：\n' +
        'wx.showLoading({ title: "处理中..." });\n' +
        '在回调中调用 wx.hideLoading()',
      'DOWNLOAD_FILE': '文件下载应显示进度：\n' +
        '1. 使用 downloadTask.onProgressUpdate 监听进度\n' +
        '2. 显示下载进度条或百分比',
      'UPLOAD_FILE': '文件上传应显示进度：\n' +
        '1. 使用 uploadTask.onProgressUpdate 监听进度\n' +
        '2. 显示上传进度条或百分比'
    };

    return suggestions[asyncOp.type] || '在异步操作前后添加loading状态管理';
  },

  /**
   * 生成错误处理建议
   * @private
   */
  _generateErrorSuggestion: function(asyncOp) {
    var suggestions = {
      'WX_REQUEST': '添加fail回调处理网络错误：\n' +
        'wx.request({\n' +
        '  ...,\n' +
        '  fail: function(err) {\n' +
        '    wx.showToast({ title: "网络错误", icon: "none" });\n' +
        '  }\n' +
        '})',
      'CLOUD_FUNCTION': '添加fail回调处理云函数错误：\n' +
        'wx.cloud.callFunction({\n' +
        '  ...,\n' +
        '  fail: function(err) {\n' +
        '    wx.showToast({ title: "请求失败", icon: "none" });\n' +
        '  }\n' +
        '})',
      'PROMISE': '添加.catch()处理Promise错误：\n' +
        'promise\n' +
        '  .then(function(res) { ... })\n' +
        '  .catch(function(err) {\n' +
        '    console.error(err);\n' +
        '    // 显示错误提示\n' +
        '  })',
      'DOWNLOAD_FILE': '添加fail回调处理下载失败：\n' +
        'wx.downloadFile({\n' +
        '  ...,\n' +
        '  fail: function(err) {\n' +
        '    wx.showToast({ title: "下载失败", icon: "none" });\n' +
        '  }\n' +
        '})',
      'UPLOAD_FILE': '添加fail回调处理上传失败：\n' +
        'wx.uploadFile({\n' +
        '  ...,\n' +
        '  fail: function(err) {\n' +
        '    wx.showToast({ title: "上传失败", icon: "none" });\n' +
        '  }\n' +
        '})'
    };

    return suggestions[asyncOp.type] || '添加错误处理逻辑，向用户显示友好的错误提示';
  },

  /**
   * 检测页面是否缺少loading状态
   * 分析整个页面的loading状态管理情况
   *
   * @param {Object} options - 检测选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Object} 页面loading状态分析结果
   *
   * @example
   * var result = LoadingStateDetector.analyzePageLoadingState({
   *   code: jsCode,
   *   filePath: 'pages/home/index.js'
   * });
   */
  analyzePageLoadingState: function(options) {
    var result = {
      file: options.filePath,
      hasLoadingInData: false,
      hasWxShowLoading: false,
      hasNavBarLoading: false,
      asyncOperationCount: 0,
      loadingHandledCount: 0,
      errorHandledCount: 0,
      issues: [],
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

      // 检测data中是否有loading状态变量
      result.hasLoadingInData = this._hasLoadingInData(code);

      // 检测是否使用wx.showLoading
      result.hasWxShowLoading = LOADING_STATE_PATTERNS.WX_SHOW_LOADING.test(code);

      // 检测是否使用导航栏loading
      result.hasNavBarLoading = LOADING_STATE_PATTERNS.WX_SHOW_NAV_LOADING.test(code);

      // 扫描异步操作问题
      result.issues = this.scanAsyncOperations(options);

      // 统计
      var lines = code.split('\n');
      var asyncOps = this._collectAsyncOperations(lines, filePath);
      result.asyncOperationCount = asyncOps.length;

      // 计算处理率
      var loadingIssues = result.issues.filter(function(issue) {
        return issue.type === AuditConfig.AuditIssueType.MISSING_LOADING_STATE;
      });
      var errorIssues = result.issues.filter(function(issue) {
        return issue.type === AuditConfig.AuditIssueType.MISSING_ERROR_STATE;
      });

      var networkOps = asyncOps.filter(function(op) {
        return ['WX_REQUEST', 'CLOUD_FUNCTION', 'DOWNLOAD_FILE', 'UPLOAD_FILE'].indexOf(op.type) !== -1;
      });

      if (networkOps.length > 0) {
        result.loadingHandledCount = networkOps.length - loadingIssues.length;
        result.errorHandledCount = networkOps.length - errorIssues.length;
      }

      // 生成建议
      result.recommendations = this._generateRecommendations(result);

      // 计算评分
      result.score = this._calculateScore(result);

    } catch (error) {
      console.error('❌ 页面loading状态分析失败:', error);
      result.error = error.message;
    }

    return result;
  },

  /**
   * 检测data中是否有loading状态变量
   * @private
   */
  _hasLoadingInData: function(code) {
    // 匹配 data: { ... loading: ... } 模式
    var dataPattern = /data\s*:\s*\{[^}]*\}/;
    var dataMatch = code.match(dataPattern);

    if (dataMatch) {
      var dataContent = dataMatch[0];
      return LOADING_STATE_PATTERNS.LOADING_VAR.test(dataContent);
    }

    return false;
  },

  /**
   * 生成建议
   * @private
   */
  _generateRecommendations: function(result) {
    var recommendations = [];

    // 如果没有任何loading机制
    if (!result.hasLoadingInData && !result.hasWxShowLoading && !result.hasNavBarLoading) {
      if (result.asyncOperationCount > 0) {
        recommendations.push({
          priority: 'high',
          title: '建议添加loading状态管理',
          description: '页面有 ' + result.asyncOperationCount + ' 个异步操作，但未检测到loading状态管理机制。' +
            '建议在data中添加loading变量，或使用wx.showLoading()。'
        });
      }
    }

    // 如果有大量未处理的loading
    var loadingIssueCount = result.issues.filter(function(issue) {
      return issue.type === AuditConfig.AuditIssueType.MISSING_LOADING_STATE;
    }).length;

    if (loadingIssueCount > 2) {
      recommendations.push({
        priority: 'high',
        title: '多个异步操作缺少loading状态',
        description: '检测到 ' + loadingIssueCount + ' 个异步操作缺少loading状态处理。' +
          '建议使用统一的loading管理方案，如封装请求工具函数。'
      });
    }

    // 如果有大量未处理的错误
    var errorIssueCount = result.issues.filter(function(issue) {
      return issue.type === AuditConfig.AuditIssueType.MISSING_ERROR_STATE;
    }).length;

    if (errorIssueCount > 2) {
      recommendations.push({
        priority: 'high',
        title: '多个异步操作缺少错误处理',
        description: '检测到 ' + errorIssueCount + ' 个异步操作缺少错误处理。' +
          '建议封装统一的错误处理逻辑，确保用户能获得错误反馈。'
      });
    }

    // 骨架屏建议
    if (result.asyncOperationCount > 0 && !result.hasLoadingInData) {
      recommendations.push({
        priority: 'medium',
        title: '考虑使用骨架屏',
        description: '对于数据加载页面，骨架屏比loading动画能提供更好的用户体验。' +
          '可使用微信开发者工具自动生成骨架屏代码。'
      });
    }

    return recommendations;
  },

  /**
   * 计算评分
   * @private
   */
  _calculateScore: function(result) {
    var score = 100;

    // 每个缺少loading状态的问题扣分
    var loadingIssues = result.issues.filter(function(issue) {
      return issue.type === AuditConfig.AuditIssueType.MISSING_LOADING_STATE;
    });
    score -= loadingIssues.length * 15;

    // 每个缺少错误处理的问题扣分
    var errorIssues = result.issues.filter(function(issue) {
      return issue.type === AuditConfig.AuditIssueType.MISSING_ERROR_STATE;
    });
    score -= errorIssues.length * 10;

    // 如果完全没有loading机制但有异步操作，额外扣分
    if (!result.hasLoadingInData && !result.hasWxShowLoading && !result.hasNavBarLoading) {
      if (result.asyncOperationCount > 0) {
        score -= 10;
      }
    }

    return Math.max(0, score);
  },


  /**
   * 检测页面onLoad中的数据获取是否有loading处理
   * 专门检测页面初始化时的数据加载
   *
   * @param {Object} options - 检测选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Array} 问题列表
   */
  scanOnLoadDataFetching: function(options) {
    var issues = [];
    options = options || {};

    if (!options.code || !options.filePath) {
      return issues;
    }

    try {
      var code = options.code;
      var filePath = options.filePath;
      var lines = code.split('\n');

      // 查找onLoad函数
      var onLoadInfo = this._findOnLoadFunction(lines);

      if (onLoadInfo.found) {
        var onLoadContent = onLoadInfo.content;

        // 检测onLoad中是否有网络请求
        var hasRequest = ASYNC_PATTERNS.WX_REQUEST.pattern.test(onLoadContent) ||
                         ASYNC_PATTERNS.CLOUD_FUNCTION.pattern.test(onLoadContent);

        if (hasRequest) {
          // 检测是否有loading处理
          var hasLoading = LOADING_STATE_PATTERNS.WX_SHOW_LOADING.test(onLoadContent) ||
                           LOADING_STATE_PATTERNS.SET_LOADING_TRUE.test(onLoadContent) ||
                           LOADING_STATE_PATTERNS.SET_IS_LOADING_TRUE.test(onLoadContent);

          if (!hasLoading) {
            issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.UI,
              severity: AuditConfig.AuditSeverity.MAJOR,
              type: AuditConfig.AuditIssueType.MISSING_LOADING_STATE,
              file: filePath,
              line: onLoadInfo.line,
              description: 'onLoad中有数据获取操作但缺少loading状态，页面初始化时用户可能看到空白内容',
              suggestion: '在onLoad开始时设置loading状态：\n' +
                '1. this.setData({ loading: true }) 并在WXML中显示骨架屏\n' +
                '2. 或使用 wx.showLoading({ title: "加载中..." })\n' +
                '数据获取完成后恢复状态',
              autoFixable: false,
              metadata: {
                location: 'onLoad',
                hasRequest: true
              }
            }));
          }
        }
      }

    } catch (error) {
      console.error('❌ onLoad数据获取扫描失败:', error);
    }

    return issues;
  },

  /**
   * 查找onLoad函数
   * @private
   */
  _findOnLoadFunction: function(lines) {
    var result = {
      found: false,
      line: 0,
      content: ''
    };

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      // 匹配 onLoad: function 或 onLoad(
      if (/onLoad\s*[:(]/.test(line)) {
        result.found = true;
        result.line = lineNum + 1;
        result.content = this._extractFunctionContent(lines, lineNum);
        break;
      }
    }

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
   * 综合扫描页面加载状态问题
   * 一次性扫描所有类型的加载状态问题
   *
   * @param {Object} options - 扫描选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Object} 综合扫描结果
   *
   * @example
   * var result = LoadingStateDetector.scanAll({
   *   code: jsCode,
   *   filePath: 'pages/home/index.js'
   * });
   * console.log('总问题数:', result.totalIssues);
   */
  scanAll: function(options) {
    var result = {
      file: options.filePath,
      asyncIssues: [],
      onLoadIssues: [],
      pageAnalysis: null,
      totalIssues: 0,
      majorCount: 0,
      minorCount: 0,
      score: 100
    };

    options = options || {};

    if (!options.code || !options.filePath) {
      return result;
    }

    try {
      // 扫描异步操作问题
      result.asyncIssues = this.scanAsyncOperations(options);

      // 扫描onLoad数据获取问题
      result.onLoadIssues = this.scanOnLoadDataFetching(options);

      // 页面整体分析
      result.pageAnalysis = this.analyzePageLoadingState(options);

      // 合并所有问题（去重）
      var allIssues = result.asyncIssues.concat(result.onLoadIssues);
      var uniqueIssues = this._deduplicateIssues(allIssues);

      result.totalIssues = uniqueIssues.length;

      // 统计严重级别
      for (var i = 0; i < uniqueIssues.length; i++) {
        var issue = uniqueIssues[i];
        switch (issue.severity) {
          case AuditConfig.AuditSeverity.MAJOR:
            result.majorCount++;
            break;
          case AuditConfig.AuditSeverity.MINOR:
            result.minorCount++;
            break;
        }
      }

      // 使用页面分析的评分
      result.score = result.pageAnalysis ? result.pageAnalysis.score : 100;

    } catch (error) {
      console.error('❌ 综合扫描失败:', error);
      result.error = error.message;
    }

    return result;
  },

  /**
   * 去重问题列表
   * @private
   */
  _deduplicateIssues: function(issues) {
    var seen = {};
    var unique = [];

    for (var i = 0; i < issues.length; i++) {
      var issue = issues[i];
      var key = issue.file + ':' + issue.line + ':' + issue.type;

      if (!seen[key]) {
        seen[key] = true;
        unique.push(issue);
      }
    }

    return unique;
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
    var allIssues = (scanResult.asyncIssues || [])
      .concat(scanResult.onLoadIssues || []);

    return this._deduplicateIssues(allIssues);
  },

  /**
   * 检测WXML中是否有loading相关的条件渲染
   * 检查页面模板是否正确显示loading状态
   *
   * @param {Object} options - 检测选项
   * @param {string} options.wxmlCode - WXML代码
   * @param {string} options.filePath - 文件路径
   * @returns {Object} WXML loading状态分析结果
   */
  analyzeWxmlLoadingState: function(options) {
    var result = {
      file: options.filePath,
      hasLoadingCondition: false,
      hasSkeletonScreen: false,
      hasEmptyState: false,
      hasErrorState: false,
      loadingElements: [],
      recommendations: []
    };

    options = options || {};

    if (!options.wxmlCode || !options.filePath) {
      return result;
    }

    try {
      var wxmlCode = options.wxmlCode;

      // 检测loading条件渲染
      // wx:if="{{loading}}" 或 wx:if="{{isLoading}}"
      var loadingConditionPattern = /wx:if\s*=\s*["']\{\{(loading|isLoading|fetching|isFetching)\}\}["']/gi;
      var loadingMatches = wxmlCode.match(loadingConditionPattern);
      if (loadingMatches) {
        result.hasLoadingCondition = true;
        result.loadingElements = loadingMatches;
      }

      // 检测骨架屏
      // 通常骨架屏有特定的class名称
      var skeletonPattern = /skeleton|loading-placeholder|placeholder-/i;
      result.hasSkeletonScreen = skeletonPattern.test(wxmlCode);

      // 检测空状态
      var emptyStatePattern = /empty|no-data|no-result|暂无/i;
      result.hasEmptyState = emptyStatePattern.test(wxmlCode);

      // 检测错误状态
      var errorStatePattern = /error|fail|失败|出错/i;
      result.hasErrorState = errorStatePattern.test(wxmlCode);

      // 生成建议
      if (!result.hasLoadingCondition) {
        result.recommendations.push({
          priority: 'medium',
          title: '建议添加loading条件渲染',
          description: 'WXML中未检测到loading状态的条件渲染。' +
            '建议添加 wx:if="{{loading}}" 来控制loading状态的显示。'
        });
      }

      if (!result.hasSkeletonScreen) {
        result.recommendations.push({
          priority: 'low',
          title: '考虑使用骨架屏',
          description: '骨架屏能提供更好的加载体验。' +
            '可使用微信开发者工具的骨架屏生成功能。'
        });
      }

      if (!result.hasEmptyState) {
        result.recommendations.push({
          priority: 'low',
          title: '建议添加空状态展示',
          description: '当数据为空时，应显示友好的空状态提示。'
        });
      }

    } catch (error) {
      console.error('❌ WXML loading状态分析失败:', error);
      result.error = error.message;
    }

    return result;
  },

  /**
   * 生成loading状态最佳实践代码示例
   *
   * @param {string} asyncType - 异步操作类型
   * @returns {Object} 代码示例
   */
  generateBestPracticeExample: function(asyncType) {
    var examples = {
      'WX_REQUEST': {
        js: [
          '// 数据获取最佳实践',
          'fetchData: function() {',
          '  var self = this;',
          '  ',
          '  // 1. 设置loading状态',
          '  this.setData({ loading: true, error: null });',
          '  ',
          '  wx.request({',
          '    url: "https://api.example.com/data",',
          '    success: function(res) {',
          '      // 2. 成功处理',
          '      self.setData({',
          '        data: res.data,',
          '        loading: false',
          '      });',
          '    },',
          '    fail: function(err) {',
          '      // 3. 错误处理',
          '      self.setData({',
          '        loading: false,',
          '        error: "加载失败，请重试"',
          '      });',
          '      wx.showToast({',
          '        title: "网络错误",',
          '        icon: "none"',
          '      });',
          '    }',
          '  });',
          '}'
        ].join('\n'),
        wxml: [
          '<!-- loading状态 -->',
          '<view wx:if="{{loading}}" class="loading-container">',
          '  <van-loading size="24px">加载中...</van-loading>',
          '</view>',
          '',
          '<!-- 错误状态 -->',
          '<view wx:elif="{{error}}" class="error-container">',
          '  <text>{{error}}</text>',
          '  <van-button size="small" bindtap="fetchData">重试</van-button>',
          '</view>',
          '',
          '<!-- 正常内容 -->',
          '<view wx:else class="content-container">',
          '  <!-- 数据展示 -->',
          '</view>'
        ].join('\n')
      },
      'SKELETON': {
        description: '骨架屏实现方案',
        steps: [
          '1. 在微信开发者工具中，点击模拟器右下角"..."',
          '2. 选择"生成骨架屏"',
          '3. 工具会自动生成 page.skeleton.wxml 和 page.skeleton.wxss',
          '4. 在页面WXML中引入骨架屏：',
          '   <import src="./index.skeleton.wxml"/>',
          '   <template is="skeleton" wx:if="{{loading}}"/>',
          '5. 在页面JS中控制loading状态'
        ].join('\n')
      }
    };

    return examples[asyncType] || examples['WX_REQUEST'];
  }
};

// 导出模块
module.exports = LoadingStateDetector;
