'use strict';

/**
 * 🔍 错误处理分析器
 *
 * 检测和分析小程序错误处理模式
 * 验证error-handler.js使用情况、空catch块、console.error上下文信息
 *
 * @module error-handler-analyzer
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 错误处理一致性分析
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 分层捕获、集中管控、自动告警
 * - 网络层：拦截器统一处理
 * - 全局层：wx.onError、wx.onUnhandledRejection、wx.onAppRouteError
 * - 数据层：setData异常监控、版本兼容性检查
 * - 业务层：区分错误等级、容错降级策略
 * - 使用Error.cause链接错误链
 * - 空catch块会吞掉错误，应使用ESLint no-empty规则检测
 * - console.error应包含结构化上下文信息（userId、操作、时间戳等）
 *
 * @example
 * var ErrorHandlerAnalyzer = require('./error-handler-analyzer.js');
 * var issues = ErrorHandlerAnalyzer.checkErrorHandlerUsage({ fileSystem: fs, files: jsFiles });
 * var emptyCatches = ErrorHandlerAnalyzer.detectEmptyCatchBlocks({ code: jsCode, filePath: 'app.js' });
 * var contextIssues = ErrorHandlerAnalyzer.checkConsoleErrorContext({ code: jsCode, filePath: 'app.js' });
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 错误处理器导入模式
 * @constant {Object}
 */
var ERROR_HANDLER_PATTERNS = {
  // 导入error-handler.js的模式
  IMPORT: /(?:var|const|let)\s+\w*[Ee]rror[Hh]andler\w*\s*=\s*require\s*\(\s*['"][^'"]*error-handler[^'"]*['"]\s*\)/,
  // 使用error-handler方法的模式
  HANDLE_ERROR: /[Ee]rror[Hh]andler\.handleError\s*\(/g,
  HANDLE_NETWORK_ERROR: /[Ee]rror[Hh]andler\.handleNetworkError\s*\(/g,
  SAFE_ASYNC: /[Ee]rror[Hh]andler\.safeAsync\s*\(/g,
  LOG_ERROR: /[Ee]rror[Hh]andler\.logError\s*\(/g,
  GET_ERROR_MESSAGE: /[Ee]rror[Hh]andler\.getErrorMessage\s*\(/g
};

/**
 * try-catch模式
 * @constant {Object}
 */
var TRY_CATCH_PATTERNS = {
  // 检测try块开始
  TRY_START: /\btry\s*\{/,
  // 检测catch块
  CATCH_BLOCK: /\}\s*catch\s*\(\s*(\w+)\s*\)\s*\{/,
  // 检测finally块
  FINALLY_BLOCK: /\}\s*finally\s*\{/
};

/**
 * console.error模式
 * @constant {Object}
 */
var CONSOLE_ERROR_PATTERNS = {
  // 基本console.error调用
  BASIC: /console\.error\s*\(/g,
  // 带上下文的console.error（推荐模式）
  WITH_CONTEXT: /console\.error\s*\(\s*['"][^'"]*['"]\s*,\s*\{/,
  // 仅字符串的console.error
  STRING_ONLY: /console\.error\s*\(\s*['"][^'"]*['"]\s*\)/,
  // 仅变量的console.error
  VARIABLE_ONLY: /console\.error\s*\(\s*\w+\s*\)/
};

/**
 * 空catch块检测模式
 * @constant {Object}
 */
var EMPTY_CATCH_PATTERNS = {
  // 完全空的catch块
  COMPLETELY_EMPTY: /\}\s*catch\s*\(\s*\w+\s*\)\s*\{\s*\}/,
  // 仅有注释的catch块
  COMMENT_ONLY: /\}\s*catch\s*\(\s*\w+\s*\)\s*\{\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)\s*\}/,
  // 仅有console.log的catch块（不够充分）
  CONSOLE_LOG_ONLY: /\}\s*catch\s*\(\s*(\w+)\s*\)\s*\{\s*console\.log\s*\([^)]*\)\s*;?\s*\}/
};

/**
 * 页面文件模式（需要使用error-handler的文件）
 * @constant {RegExp}
 */
var PAGE_FILE_PATTERN = /(?:pages|package\w*)\/[^/]+\/(?:index|[^/]+)\.js$/;

/**
 * 错误处理分析器
 * @namespace ErrorHandlerAnalyzer
 */
var ErrorHandlerAnalyzer = {
  /**
   * 错误处理器导入模式
   */
  ERROR_HANDLER_PATTERNS: ERROR_HANDLER_PATTERNS,

  /**
   * try-catch模式
   */
  TRY_CATCH_PATTERNS: TRY_CATCH_PATTERNS,

  /**
   * console.error模式
   */
  CONSOLE_ERROR_PATTERNS: CONSOLE_ERROR_PATTERNS,

  /**
   * 空catch块模式
   */
  EMPTY_CATCH_PATTERNS: EMPTY_CATCH_PATTERNS,


  /**
   * 检查error-handler.js使用情况
   * 验证页面是否使用统一的错误处理机制
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} error-handler使用分析结果
   *
   * @example
   * var result = ErrorHandlerAnalyzer.checkErrorHandlerUsage({ fileSystem: fs, files: jsFiles });
   * console.log('使用error-handler的文件:', result.filesWithErrorHandler);
   * console.log('问题:', result.issues);
   */
  checkErrorHandlerUsage: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      filesWithErrorHandler: [],
      filesWithoutErrorHandler: [],
      errorHandlerUsageCount: 0,
      usageByMethod: {
        handleError: 0,
        handleNetworkError: 0,
        safeAsync: 0,
        logError: 0,
        getErrorMessage: 0
      },
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileErrorHandlerUsage(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeErrorHandlerResult(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileErrorHandlerUsage(filePath, code);
            result.filesAnalyzed++;
            this._mergeErrorHandlerResult(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateErrorHandlerRecommendations(result);

    } catch (error) {
      console.error('❌ error-handler使用检查失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的error-handler使用情况
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileErrorHandlerUsage: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      hasErrorHandlerImport: false,
      hasErrorHandlerUsage: false,
      isPageFile: false,
      hasTryCatch: false,
      hasAsyncOperations: false,
      usageCount: 0,
      usageByMethod: {
        handleError: 0,
        handleNetworkError: 0,
        safeAsync: 0,
        logError: 0,
        getErrorMessage: 0
      },
      issues: []
    };

    // 检查是否是页面文件
    fileResult.isPageFile = PAGE_FILE_PATTERN.test(filePath);

    // 检查是否导入了error-handler
    fileResult.hasErrorHandlerImport = ERROR_HANDLER_PATTERNS.IMPORT.test(code);

    // 检查各种error-handler方法的使用
    var handleErrorMatches = code.match(ERROR_HANDLER_PATTERNS.HANDLE_ERROR);
    if (handleErrorMatches) {
      fileResult.usageByMethod.handleError = handleErrorMatches.length;
      fileResult.usageCount += handleErrorMatches.length;
    }

    var handleNetworkErrorMatches = code.match(ERROR_HANDLER_PATTERNS.HANDLE_NETWORK_ERROR);
    if (handleNetworkErrorMatches) {
      fileResult.usageByMethod.handleNetworkError = handleNetworkErrorMatches.length;
      fileResult.usageCount += handleNetworkErrorMatches.length;
    }

    var safeAsyncMatches = code.match(ERROR_HANDLER_PATTERNS.SAFE_ASYNC);
    if (safeAsyncMatches) {
      fileResult.usageByMethod.safeAsync = safeAsyncMatches.length;
      fileResult.usageCount += safeAsyncMatches.length;
    }

    var logErrorMatches = code.match(ERROR_HANDLER_PATTERNS.LOG_ERROR);
    if (logErrorMatches) {
      fileResult.usageByMethod.logError = logErrorMatches.length;
      fileResult.usageCount += logErrorMatches.length;
    }

    var getErrorMessageMatches = code.match(ERROR_HANDLER_PATTERNS.GET_ERROR_MESSAGE);
    if (getErrorMessageMatches) {
      fileResult.usageByMethod.getErrorMessage = getErrorMessageMatches.length;
      fileResult.usageCount += getErrorMessageMatches.length;
    }

    fileResult.hasErrorHandlerUsage = fileResult.usageCount > 0;

    // 检查是否有try-catch块
    fileResult.hasTryCatch = TRY_CATCH_PATTERNS.TRY_START.test(code);

    // 检查是否有异步操作（需要错误处理）
    fileResult.hasAsyncOperations = this._hasAsyncOperations(code);

    // 生成问题
    if (fileResult.isPageFile && !fileResult.hasErrorHandlerImport && 
        (fileResult.hasTryCatch || fileResult.hasAsyncOperations)) {
      fileResult.issues.push(AuditReport.createIssue({
        category: AuditConfig.AuditCategory.CODE_QUALITY,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.MISSING_ERROR_HANDLER,
        file: filePath,
        description: '页面文件有错误处理需求但未使用统一的error-handler.js',
        suggestion: '导入error-handler.js并使用handleError()、safeAsync()等方法进行统一错误处理，确保错误日志记录和用户友好提示'
      }));
    }

    return fileResult;
  },

  /**
   * 检查代码是否有异步操作
   * @private
   */
  _hasAsyncOperations: function(code) {
    var asyncPatterns = [
      /wx\.request\s*\(/,
      /wx\.downloadFile\s*\(/,
      /wx\.uploadFile\s*\(/,
      /wx\.getStorage\s*\(/,
      /wx\.setStorage\s*\(/,
      /wx\.getLocation\s*\(/,
      /wx\.chooseImage\s*\(/,
      /wx\.saveFile\s*\(/,
      /wx\.getFileInfo\s*\(/,
      /new\s+Promise\s*\(/,
      /\.then\s*\(/,
      /async\s+function/,
      /await\s+/
    ];

    for (var i = 0; i < asyncPatterns.length; i++) {
      if (asyncPatterns[i].test(code)) {
        return true;
      }
    }

    return false;
  },

  /**
   * 合并error-handler分析结果
   * @private
   */
  _mergeErrorHandlerResult: function(result, fileResult) {
    if (fileResult.hasErrorHandlerImport || fileResult.hasErrorHandlerUsage) {
      result.filesWithErrorHandler.push(fileResult.filePath);
    } else if (fileResult.isPageFile && (fileResult.hasTryCatch || fileResult.hasAsyncOperations)) {
      result.filesWithoutErrorHandler.push(fileResult.filePath);
    }

    result.errorHandlerUsageCount += fileResult.usageCount;

    // 合并方法使用统计
    var methods = Object.keys(fileResult.usageByMethod);
    for (var i = 0; i < methods.length; i++) {
      var method = methods[i];
      result.usageByMethod[method] += fileResult.usageByMethod[method];
    }

    result.issues = result.issues.concat(fileResult.issues);
  },

  /**
   * 生成error-handler使用建议
   * @private
   */
  _generateErrorHandlerRecommendations: function(result) {
    var recommendations = [];

    if (result.filesWithoutErrorHandler.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '使用统一错误处理机制',
        description: '发现 ' + result.filesWithoutErrorHandler.length +
          ' 个页面文件有错误处理需求但未使用error-handler.js。建议导入并使用统一的错误处理方法。',
        files: result.filesWithoutErrorHandler.slice(0, 10)
      });
    }

    if (result.errorHandlerUsageCount > 0) {
      recommendations.push({
        priority: 'info',
        title: '错误处理使用良好',
        description: '项目中有 ' + result.errorHandlerUsageCount + ' 处使用了统一错误处理机制，这是良好的实践。'
      });
    }

    return recommendations;
  },


  /**
   * 检测空catch块
   * 识别try-catch中没有适当错误处理的catch块
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} 空catch块分析结果
   *
   * @example
   * var result = ErrorHandlerAnalyzer.detectEmptyCatchBlocks({ code: jsCode, filePath: 'app.js' });
   * console.log('空catch块数:', result.emptyCatchCount);
   * console.log('问题:', result.issues);
   */
  detectEmptyCatchBlocks: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      totalTryCatchBlocks: 0,
      emptyCatchCount: 0,
      consoleOnlyCatchCount: 0,
      properCatchCount: 0,
      emptyCatchBlocks: [],
      consoleOnlyCatchBlocks: [],
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileEmptyCatch(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeEmptyCatchResult(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileEmptyCatch(filePath, code);
            result.filesAnalyzed++;
            this._mergeEmptyCatchResult(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateEmptyCatchRecommendations(result);

    } catch (error) {
      console.error('❌ 空catch块检测失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的空catch块
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileEmptyCatch: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      tryCatchBlocks: [],
      emptyCatchBlocks: [],
      consoleOnlyCatchBlocks: [],
      properCatchBlocks: [],
      issues: []
    };

    var lines = code.split('\n');
    var tryCatchInfo = this._extractTryCatchBlocks(code, lines, filePath);

    fileResult.tryCatchBlocks = tryCatchInfo.blocks;

    for (var i = 0; i < tryCatchInfo.blocks.length; i++) {
      var block = tryCatchInfo.blocks[i];

      if (block.isEmpty) {
        fileResult.emptyCatchBlocks.push(block);

        // 创建问题记录
        fileResult.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.CODE_QUALITY,
          severity: AuditConfig.AuditSeverity.MAJOR,
          type: AuditConfig.AuditIssueType.EMPTY_CATCH_BLOCK,
          file: filePath,
          line: block.catchLine,
          description: '空的catch块会吞掉错误，导致问题难以排查',
          suggestion: '在catch块中添加适当的错误处理：记录日志、通知用户或重新抛出错误。如果确实需要忽略错误，请添加注释说明原因。'
        }));
      } else if (block.isConsoleOnly) {
        fileResult.consoleOnlyCatchBlocks.push(block);

        // 创建问题记录（较低严重级别）
        fileResult.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.CODE_QUALITY,
          severity: AuditConfig.AuditSeverity.MINOR,
          type: AuditConfig.AuditIssueType.EMPTY_CATCH_BLOCK,
          file: filePath,
          line: block.catchLine,
          description: 'catch块仅使用console.log/console.warn，缺少完整的错误处理',
          suggestion: '建议使用error-handler.js的handleError()方法，或至少使用console.error并包含上下文信息'
        }));
      } else {
        fileResult.properCatchBlocks.push(block);
      }
    }

    return fileResult;
  },

  /**
   * 提取try-catch块信息
   * @private
   */
  _extractTryCatchBlocks: function(code, lines, filePath) {
    var blocks = [];
    
    // 使用正则表达式查找所有 try-catch 块
    var tryCatchRegex = /\btry\s*\{/g;
    var match;
    
    while ((match = tryCatchRegex.exec(code)) !== null) {
      var tryStartPos = match.index;
      
      // 计算try所在的行号
      var tryLine = code.substring(0, tryStartPos).split('\n').length;
      
      // 找到try块的结束位置（匹配大括号）
      var braceCount = 0;
      var tryBlockEnd = -1;
      var inString = false;
      var stringChar = '';
      
      for (var i = tryStartPos; i < code.length; i++) {
        var c = code[i];
        
        // 处理字符串
        if (!inString && (c === '"' || c === "'")) {
          inString = true;
          stringChar = c;
        } else if (inString && c === stringChar && code[i - 1] !== '\\') {
          inString = false;
        }
        
        if (!inString) {
          if (c === '{') braceCount++;
          if (c === '}') {
            braceCount--;
            if (braceCount === 0) {
              tryBlockEnd = i;
              break;
            }
          }
        }
      }
      
      if (tryBlockEnd === -1) continue;
      
      // Find catch
      var afterTry = code.substring(tryBlockEnd + 1);
      var catchMatch = afterTry.match(/^\s*catch\s*\(\s*(\w+)\s*\)\s*\{/);
      
      if (catchMatch) {
        var catchVariable = catchMatch[1];
        var catchStartPos = tryBlockEnd + 1 + catchMatch.index + catchMatch[0].length;
        var catchLine = code.substring(0, catchStartPos).split('\n').length;
        
        // 找到catch块的结束位置
        braceCount = 1;
        var catchBlockEnd = -1;
        inString = false;
        
        for (var j = catchStartPos; j < code.length; j++) {
          var ch = code[j];
          
          if (!inString && (ch === '"' || ch === "'")) {
            inString = true;
            stringChar = ch;
          } else if (inString && ch === stringChar && code[j - 1] !== '\\') {
            inString = false;
          }
          
          if (!inString) {
            if (ch === '{') braceCount++;
            if (ch === '}') {
              braceCount--;
              if (braceCount === 0) {
                catchBlockEnd = j;
                break;
              }
            }
          }
        }
        
        if (catchBlockEnd !== -1) {
          var catchContent = code.substring(catchStartPos, catchBlockEnd).trim();
          var analysis = this._analyzeCatchContent(catchContent, catchVariable);
          
          blocks.push({
            tryLine: tryLine,
            catchLine: catchLine,
            catchVariable: catchVariable,
            catchContent: catchContent,
            isEmpty: analysis.isEmpty,
            isConsoleOnly: analysis.isConsoleOnly,
            hasProperHandling: analysis.hasProperHandling,
            file: filePath
          });
        }
      }
    }

    return { blocks: blocks };
  },

  /**
   * 查找catch块（保留用于兼容性）
   * @private
   * @deprecated 使用 _extractTryCatchBlocks 代替
   */
  _findCatchBlock: function(lines, startIndex, filePath) {
    // 从startIndex开始查找catch
    for (var i = startIndex; i < Math.min(startIndex + 3, lines.length); i++) {
      var combinedLines = lines.slice(startIndex, i + 1).join(' ');
      var catchMatch = combinedLines.match(/\}\s*catch\s*\(\s*(\w+)\s*\)\s*\{/);

      if (catchMatch) {
        var catchVariable = catchMatch[1];
        var catchStartLine = i + 1;

        // 提取catch块内容
        var braceCount = 1;
        var catchContent = [];
        var endIndex = i;

        for (var j = i; j < lines.length; j++) {
          var line = lines[j];

          // 跳过catch行本身的开始部分
          if (j === i) {
            var catchIndex = line.indexOf('{', line.indexOf('catch'));
            if (catchIndex !== -1) {
              line = line.substring(catchIndex + 1);
            }
          }

          for (var c = 0; c < line.length; c++) {
            if (line[c] === '{') braceCount++;
            if (line[c] === '}') {
              braceCount--;
              if (braceCount === 0) {
                // 找到catch块结束
                catchContent.push(line.substring(0, c).trim());
                endIndex = j;
                break;
              }
            }
          }

          if (braceCount === 0) break;
          catchContent.push(line.trim());
        }

        var contentStr = catchContent.join('\n').trim();
        var analysis = this._analyzeCatchContent(contentStr, catchVariable);

        return {
          line: catchStartLine,
          variable: catchVariable,
          content: contentStr,
          isEmpty: analysis.isEmpty,
          isConsoleOnly: analysis.isConsoleOnly,
          hasProperHandling: analysis.hasProperHandling,
          endIndex: endIndex
        };
      }
    }

    return null;
  },

  /**
   * 分析catch块内容
   * @private
   */
  _analyzeCatchContent: function(content, catchVariable) {
    var result = {
      isEmpty: false,
      isConsoleOnly: false,
      hasProperHandling: false
    };

    // 移除注释
    var contentWithoutComments = content
      .replace(/\/\/[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();

    // 检查是否为空
    if (contentWithoutComments === '' || contentWithoutComments === '}') {
      result.isEmpty = true;
      return result;
    }

    // 检查是否仅有console.log/console.warn
    var consoleLogPattern = /^(?:console\.(?:log|warn)\s*\([^)]*\)\s*;?\s*)+$/;
    if (consoleLogPattern.test(contentWithoutComments)) {
      result.isConsoleOnly = true;
      return result;
    }

    // 检查是否有适当的错误处理
    var properHandlingPatterns = [
      /console\.error\s*\(/,
      /[Ee]rror[Hh]andler\.handleError\s*\(/,
      /[Ee]rror[Hh]andler\.logError\s*\(/,
      /throw\s+/,
      /wx\.showToast\s*\(/,
      /wx\.showModal\s*\(/,
      /reject\s*\(/,
      /callback\s*\(/,
      /onError\s*\(/,
      /fail\s*\(/
    ];

    for (var i = 0; i < properHandlingPatterns.length; i++) {
      if (properHandlingPatterns[i].test(contentWithoutComments)) {
        result.hasProperHandling = true;
        return result;
      }
    }

    // 检查是否使用了catch变量
    var variablePattern = new RegExp('\\b' + catchVariable + '\\b');
    if (variablePattern.test(contentWithoutComments)) {
      result.hasProperHandling = true;
      return result;
    }

    // 如果有其他代码但没有使用错误变量，可能是不完整的处理
    result.isConsoleOnly = true;
    return result;
  },

  /**
   * 合并空catch块分析结果
   * @private
   */
  _mergeEmptyCatchResult: function(result, fileResult) {
    result.totalTryCatchBlocks += fileResult.tryCatchBlocks.length;
    result.emptyCatchCount += fileResult.emptyCatchBlocks.length;
    result.consoleOnlyCatchCount += fileResult.consoleOnlyCatchBlocks.length;
    result.properCatchCount += fileResult.properCatchBlocks.length;

    result.emptyCatchBlocks = result.emptyCatchBlocks.concat(fileResult.emptyCatchBlocks);
    result.consoleOnlyCatchBlocks = result.consoleOnlyCatchBlocks.concat(fileResult.consoleOnlyCatchBlocks);
    result.issues = result.issues.concat(fileResult.issues);
  },

  /**
   * 生成空catch块建议
   * @private
   */
  _generateEmptyCatchRecommendations: function(result) {
    var recommendations = [];

    if (result.emptyCatchCount > 0) {
      recommendations.push({
        priority: 'high',
        title: '修复空catch块',
        description: '发现 ' + result.emptyCatchCount +
          ' 个空的catch块。空catch块会吞掉错误，导致问题难以排查。建议添加适当的错误处理逻辑。',
        blocks: result.emptyCatchBlocks.slice(0, 10)
      });
    }

    if (result.consoleOnlyCatchCount > 0) {
      recommendations.push({
        priority: 'medium',
        title: '增强catch块错误处理',
        description: '发现 ' + result.consoleOnlyCatchCount +
          ' 个catch块仅使用console.log/warn。建议使用console.error并包含上下文信息，或使用error-handler.js进行统一处理。',
        blocks: result.consoleOnlyCatchBlocks.slice(0, 10)
      });
    }

    if (result.properCatchCount > 0) {
      var properRate = result.properCatchCount / result.totalTryCatchBlocks;
      if (properRate > 0.7) {
        recommendations.push({
          priority: 'info',
          title: '错误处理覆盖良好',
          description: '项目中 ' + Math.round(properRate * 100) + '% 的catch块有适当的错误处理，这是良好的实践。'
        });
      }
    }

    return recommendations;
  },


  /**
   * 检查console.error上下文信息
   * 验证console.error调用是否包含足够的调试信息
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} console.error上下文分析结果
   *
   * @example
   * var result = ErrorHandlerAnalyzer.checkConsoleErrorContext({ code: jsCode, filePath: 'app.js' });
   * console.log('有上下文的调用数:', result.withContextCount);
   * console.log('缺少上下文的调用:', result.withoutContextCalls);
   */
  checkConsoleErrorContext: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      totalConsoleErrorCalls: 0,
      withContextCount: 0,
      withoutContextCount: 0,
      stringOnlyCount: 0,
      variableOnlyCount: 0,
      withContextCalls: [],
      withoutContextCalls: [],
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileConsoleError(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeConsoleErrorResult(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileConsoleError(filePath, code);
            result.filesAnalyzed++;
            this._mergeConsoleErrorResult(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateConsoleErrorRecommendations(result);

    } catch (error) {
      console.error('❌ console.error上下文检查失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的console.error调用
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileConsoleError: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      consoleErrorCalls: [],
      withContextCalls: [],
      withoutContextCalls: [],
      issues: []
    };

    var lines = code.split('\n');

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      // 检测console.error调用
      if (/console\.error\s*\(/.test(line)) {
        var callInfo = this._analyzeConsoleErrorCall(line, lineNum, lines, filePath);
        if (callInfo) {
          fileResult.consoleErrorCalls.push(callInfo);

          if (callInfo.hasContext) {
            fileResult.withContextCalls.push(callInfo);
          } else {
            fileResult.withoutContextCalls.push(callInfo);

            // 创建问题记录
            fileResult.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.CODE_QUALITY,
              severity: AuditConfig.AuditSeverity.MINOR,
              type: 'console_error_no_context',
              file: filePath,
              line: lineNum + 1,
              description: 'console.error调用缺少上下文信息，难以定位问题',
              suggestion: '建议添加结构化上下文信息，如：console.error("操作失败", { file: "' + 
                this._getFileName(filePath) + '", function: "functionName", error: err, data: relevantData })'
            }));
          }
        }
      }
    }

    return fileResult;
  },

  /**
   * 分析单个console.error调用
   * @private
   */
  _analyzeConsoleErrorCall: function(line, lineNum, lines, filePath) {
    var callInfo = {
      line: lineNum + 1,
      code: line.trim(),
      file: filePath,
      hasContext: false,
      contextType: 'none',
      arguments: []
    };

    // 提取完整的console.error调用（可能跨多行）
    var fullCall = this._extractFullCall(lines, lineNum, 'console.error');
    if (!fullCall) return null;

    callInfo.code = fullCall.code;

    // 分析参数
    var argsAnalysis = this._analyzeConsoleErrorArgs(fullCall.code);
    callInfo.arguments = argsAnalysis.arguments;
    callInfo.hasContext = argsAnalysis.hasContext;
    callInfo.contextType = argsAnalysis.contextType;

    return callInfo;
  },

  /**
   * 提取完整的函数调用（处理跨行情况）
   * @private
   */
  _extractFullCall: function(lines, startLine, funcName) {
    var code = '';
    var parenCount = 0;
    var started = false;

    for (var i = startLine; i < Math.min(startLine + 10, lines.length); i++) {
      var line = lines[i];
      code += (i > startLine ? ' ' : '') + line;

      for (var c = 0; c < line.length; c++) {
        if (line[c] === '(' && !started) {
          started = true;
          parenCount = 1;
        } else if (started) {
          if (line[c] === '(') parenCount++;
          if (line[c] === ')') {
            parenCount--;
            if (parenCount === 0) {
              // 找到完整调用
              var funcIndex = code.indexOf(funcName);
              if (funcIndex !== -1) {
                var endIndex = code.indexOf(')', funcIndex);
                return {
                  code: code.substring(funcIndex, endIndex + 1).trim(),
                  endLine: i
                };
              }
            }
          }
        }
      }
    }

    // 如果没找到完整调用，返回当前行
    return {
      code: lines[startLine].trim(),
      endLine: startLine
    };
  },

  /**
   * 分析console.error参数
   * @private
   */
  _analyzeConsoleErrorArgs: function(callCode) {
    var result = {
      arguments: [],
      hasContext: false,
      contextType: 'none'
    };

    // 提取括号内的内容
    var match = callCode.match(/console\.error\s*\(([\s\S]*)\)$/);
    if (!match) return result;

    var argsStr = match[1].trim();
    if (!argsStr) return result;

    // 简单的参数分析
    // 检查是否有对象参数（上下文信息）
    if (/\{[\s\S]*\}/.test(argsStr)) {
      result.hasContext = true;
      result.contextType = 'object';
    }
    // 检查是否有多个参数
    else if (/,/.test(argsStr)) {
      // 检查第二个参数是否是变量（可能是错误对象）
      var parts = this._splitArgs(argsStr);
      if (parts.length >= 2) {
        var secondArg = parts[1].trim();
        // 如果第二个参数是变量或对象，认为有上下文
        if (/^\w+$/.test(secondArg) || /^\{/.test(secondArg)) {
          result.hasContext = true;
          result.contextType = 'variable';
        }
      }
      result.arguments = parts;
    }
    // 仅字符串
    else if (/^['"]/.test(argsStr)) {
      result.contextType = 'string_only';
    }
    // 仅变量
    else if (/^\w+$/.test(argsStr)) {
      result.hasContext = true;
      result.contextType = 'error_variable';
    }

    return result;
  },

  /**
   * 分割参数（简单实现，不处理嵌套）
   * @private
   */
  _splitArgs: function(argsStr) {
    var args = [];
    var current = '';
    var depth = 0;
    var inString = false;
    var stringChar = '';

    for (var i = 0; i < argsStr.length; i++) {
      var c = argsStr[i];

      if (!inString && (c === '"' || c === "'")) {
        inString = true;
        stringChar = c;
      } else if (inString && c === stringChar && argsStr[i - 1] !== '\\') {
        inString = false;
      }

      if (!inString) {
        if (c === '{' || c === '[' || c === '(') depth++;
        if (c === '}' || c === ']' || c === ')') depth--;

        if (c === ',' && depth === 0) {
          args.push(current.trim());
          current = '';
          continue;
        }
      }

      current += c;
    }

    if (current.trim()) {
      args.push(current.trim());
    }

    return args;
  },

  /**
   * 获取文件名
   * @private
   */
  _getFileName: function(filePath) {
    var parts = filePath.split('/');
    return parts[parts.length - 1];
  },

  /**
   * 合并console.error分析结果
   * @private
   */
  _mergeConsoleErrorResult: function(result, fileResult) {
    result.totalConsoleErrorCalls += fileResult.consoleErrorCalls.length;
    result.withContextCount += fileResult.withContextCalls.length;
    result.withoutContextCount += fileResult.withoutContextCalls.length;

    // 统计类型
    for (var i = 0; i < fileResult.withoutContextCalls.length; i++) {
      var call = fileResult.withoutContextCalls[i];
      if (call.contextType === 'string_only') {
        result.stringOnlyCount++;
      }
    }

    result.withContextCalls = result.withContextCalls.concat(fileResult.withContextCalls);
    result.withoutContextCalls = result.withoutContextCalls.concat(fileResult.withoutContextCalls);
    result.issues = result.issues.concat(fileResult.issues);
  },

  /**
   * 生成console.error建议
   * @private
   */
  _generateConsoleErrorRecommendations: function(result) {
    var recommendations = [];

    if (result.withoutContextCount > 0) {
      var noContextRate = result.withoutContextCount / result.totalConsoleErrorCalls;

      recommendations.push({
        priority: noContextRate > 0.5 ? 'medium' : 'low',
        title: '增强console.error上下文信息',
        description: '发现 ' + result.withoutContextCount + ' 个console.error调用缺少上下文信息（占比 ' +
          Math.round(noContextRate * 100) + '%）。建议添加结构化上下文信息以便于问题定位。',
        example: this._generateConsoleErrorExample()
      });
    }

    if (result.withContextCount > 0) {
      var contextRate = result.withContextCount / result.totalConsoleErrorCalls;
      if (contextRate > 0.7) {
        recommendations.push({
          priority: 'info',
          title: 'console.error使用良好',
          description: '项目中 ' + Math.round(contextRate * 100) + '% 的console.error调用包含上下文信息，这是良好的实践。'
        });
      }
    }

    return recommendations;
  },

  /**
   * 生成console.error示例代码
   * @private
   */
  _generateConsoleErrorExample: function() {
    return [
      '// ❌ 不推荐：缺少上下文',
      'console.error("操作失败");',
      'console.error(err);',
      '',
      '// ✅ 推荐：包含结构化上下文',
      'console.error("用户下单失败", {',
      '  file: "order.js",',
      '  function: "submitOrder",',
      '  userId: userId,',
      '  orderId: orderId,',
      '  error: err,',
      '  timestamp: new Date().toISOString()',
      '});'
    ].join('\n');
  },


  /**
   * 综合扫描所有错误处理模式
   * 执行完整的错误处理分析
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @returns {Object} 综合分析结果
   *
   * @example
   * var result = ErrorHandlerAnalyzer.scanAll({ fileSystem: fs, files: jsFiles });
   * console.log('error-handler使用:', result.errorHandlerUsage);
   * console.log('空catch块:', result.emptyCatchBlocks);
   * console.log('console.error上下文:', result.consoleErrorContext);
   */
  scanAll: function(options) {
    options = options || {};

    var result = {
      timestamp: new Date().toISOString(),
      filesAnalyzed: 0,
      errorHandlerUsage: null,
      emptyCatchBlocks: null,
      consoleErrorContext: null,
      summary: {
        totalIssues: 0,
        criticalCount: 0,
        majorCount: 0,
        minorCount: 0,
        infoCount: 0
      },
      allIssues: [],
      allRecommendations: []
    };

    try {
      // 执行各项检查
      result.errorHandlerUsage = this.checkErrorHandlerUsage(options);
      result.emptyCatchBlocks = this.detectEmptyCatchBlocks(options);
      result.consoleErrorContext = this.checkConsoleErrorContext(options);

      // 汇总文件数
      result.filesAnalyzed = Math.max(
        result.errorHandlerUsage.filesAnalyzed,
        result.emptyCatchBlocks.filesAnalyzed,
        result.consoleErrorContext.filesAnalyzed
      );

      // 汇总所有问题
      result.allIssues = []
        .concat(result.errorHandlerUsage.issues || [])
        .concat(result.emptyCatchBlocks.issues || [])
        .concat(result.consoleErrorContext.issues || []);

      // 统计问题数量
      for (var i = 0; i < result.allIssues.length; i++) {
        var issue = result.allIssues[i];
        result.summary.totalIssues++;

        switch (issue.severity) {
          case AuditConfig.AuditSeverity.CRITICAL:
            result.summary.criticalCount++;
            break;
          case AuditConfig.AuditSeverity.MAJOR:
            result.summary.majorCount++;
            break;
          case AuditConfig.AuditSeverity.MINOR:
            result.summary.minorCount++;
            break;
          case AuditConfig.AuditSeverity.INFO:
            result.summary.infoCount++;
            break;
        }
      }

      // 汇总所有建议
      result.allRecommendations = []
        .concat(result.errorHandlerUsage.recommendations || [])
        .concat(result.emptyCatchBlocks.recommendations || [])
        .concat(result.consoleErrorContext.recommendations || []);

      // 按优先级排序建议
      result.allRecommendations.sort(function(a, b) {
        var priorityOrder = { high: 0, medium: 1, low: 2, info: 3 };
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
      });

    } catch (error) {
      console.error('❌ 综合错误处理扫描失败:', error);
    }

    return result;
  },

  /**
   * 生成错误处理分析报告
   * 生成可读的Markdown格式报告
   *
   * @param {Object} scanResult - scanAll的返回结果
   * @returns {string} Markdown格式的报告
   *
   * @example
   * var result = ErrorHandlerAnalyzer.scanAll({ fileSystem: fs, files: jsFiles });
   * var report = ErrorHandlerAnalyzer.generateReport(result);
   * console.log(report);
   */
  generateReport: function(scanResult) {
    if (!scanResult) {
      return '# 错误处理分析报告\n\n无分析结果';
    }

    var lines = [
      '# 错误处理分析报告',
      '',
      '**生成时间**: ' + scanResult.timestamp,
      '**分析文件数**: ' + scanResult.filesAnalyzed,
      '',
      '## 📊 问题统计',
      '',
      '| 级别 | 数量 |',
      '|------|------|',
      '| 🔴 严重 | ' + scanResult.summary.criticalCount + ' |',
      '| 🟠 主要 | ' + scanResult.summary.majorCount + ' |',
      '| 🟡 次要 | ' + scanResult.summary.minorCount + ' |',
      '| 🔵 提示 | ' + scanResult.summary.infoCount + ' |',
      '| **总计** | **' + scanResult.summary.totalIssues + '** |',
      ''
    ];

    // error-handler使用情况
    if (scanResult.errorHandlerUsage) {
      var usage = scanResult.errorHandlerUsage;
      lines.push('## 🛡️ error-handler.js 使用情况');
      lines.push('');
      lines.push('- 使用error-handler的文件: ' + usage.filesWithErrorHandler.length);
      lines.push('- 需要但未使用的文件: ' + usage.filesWithoutErrorHandler.length);
      lines.push('- 总使用次数: ' + usage.errorHandlerUsageCount);
      lines.push('');

      if (usage.errorHandlerUsageCount > 0) {
        lines.push('**方法使用统计:**');
        lines.push('- handleError(): ' + usage.usageByMethod.handleError + ' 次');
        lines.push('- handleNetworkError(): ' + usage.usageByMethod.handleNetworkError + ' 次');
        lines.push('- safeAsync(): ' + usage.usageByMethod.safeAsync + ' 次');
        lines.push('- logError(): ' + usage.usageByMethod.logError + ' 次');
        lines.push('- getErrorMessage(): ' + usage.usageByMethod.getErrorMessage + ' 次');
        lines.push('');
      }

      if (usage.filesWithoutErrorHandler.length > 0) {
        lines.push('**需要添加error-handler的文件:**');
        for (var i = 0; i < Math.min(10, usage.filesWithoutErrorHandler.length); i++) {
          lines.push('- `' + usage.filesWithoutErrorHandler[i] + '`');
        }
        if (usage.filesWithoutErrorHandler.length > 10) {
          lines.push('- ... 还有 ' + (usage.filesWithoutErrorHandler.length - 10) + ' 个文件');
        }
        lines.push('');
      }
    }

    // 空catch块情况
    if (scanResult.emptyCatchBlocks) {
      var empty = scanResult.emptyCatchBlocks;
      lines.push('## 🚫 空catch块检测');
      lines.push('');
      lines.push('- 总try-catch块数: ' + empty.totalTryCatchBlocks);
      lines.push('- 空catch块数: ' + empty.emptyCatchCount);
      lines.push('- 仅console.log的catch块: ' + empty.consoleOnlyCatchCount);
      lines.push('- 有适当处理的catch块: ' + empty.properCatchCount);
      lines.push('');

      if (empty.emptyCatchBlocks.length > 0) {
        lines.push('**空catch块位置:**');
        for (var j = 0; j < Math.min(10, empty.emptyCatchBlocks.length); j++) {
          var block = empty.emptyCatchBlocks[j];
          lines.push('- `' + block.file + '` 行 ' + block.catchLine);
        }
        if (empty.emptyCatchBlocks.length > 10) {
          lines.push('- ... 还有 ' + (empty.emptyCatchBlocks.length - 10) + ' 个');
        }
        lines.push('');
      }
    }

    // console.error上下文情况
    if (scanResult.consoleErrorContext) {
      var context = scanResult.consoleErrorContext;
      lines.push('## 📝 console.error 上下文信息');
      lines.push('');
      lines.push('- 总console.error调用数: ' + context.totalConsoleErrorCalls);
      lines.push('- 有上下文的调用: ' + context.withContextCount);
      lines.push('- 缺少上下文的调用: ' + context.withoutContextCount);
      lines.push('');

      if (context.totalConsoleErrorCalls > 0) {
        var contextRate = context.withContextCount / context.totalConsoleErrorCalls;
        lines.push('**上下文覆盖率**: ' + Math.round(contextRate * 100) + '%');
        lines.push('');
      }
    }

    // 优化建议
    if (scanResult.allRecommendations && scanResult.allRecommendations.length > 0) {
      lines.push('## 💡 优化建议');
      lines.push('');

      for (var k = 0; k < scanResult.allRecommendations.length; k++) {
        var rec = scanResult.allRecommendations[k];
        var priorityIcon = {
          high: '🔴',
          medium: '🟠',
          low: '🟡',
          info: '🔵'
        }[rec.priority] || '⚪';

        lines.push('### ' + priorityIcon + ' ' + rec.title);
        lines.push('');
        lines.push(rec.description);
        lines.push('');

        if (rec.example) {
          lines.push('**示例代码:**');
          lines.push('```javascript');
          lines.push(rec.example);
          lines.push('```');
          lines.push('');
        }
      }
    }

    // 问题详情
    if (scanResult.allIssues && scanResult.allIssues.length > 0) {
      lines.push('## 📋 问题详情');
      lines.push('');

      for (var m = 0; m < Math.min(20, scanResult.allIssues.length); m++) {
        var issue = scanResult.allIssues[m];
        var severityIcon = {
          critical: '🔴',
          major: '🟠',
          minor: '🟡',
          info: '🔵'
        }[issue.severity] || '⚪';

        lines.push('### ' + severityIcon + ' ' + issue.description);
        lines.push('');
        lines.push('- **文件**: `' + issue.file + '`' + (issue.line ? ' (行 ' + issue.line + ')' : ''));
        lines.push('- **类型**: ' + issue.type);
        lines.push('- **建议**: ' + issue.suggestion);
        lines.push('');
      }

      if (scanResult.allIssues.length > 20) {
        lines.push('*... 还有 ' + (scanResult.allIssues.length - 20) + ' 个问题未显示*');
        lines.push('');
      }
    }

    return lines.join('\n');
  }
};

// 导出模块
module.exports = ErrorHandlerAnalyzer;
