'use strict';

/**
 * 🔍 代码质量分析器
 *
 * 检测和分析小程序代码质量问题
 * 验证BasePage使用情况、重复代码模式、ES5合规性、未使用imports
 *
 * @module code-quality-analyzer
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 代码质量与可维护性分析
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 配置明确的语法版本（ES5 strict mode）
 * - 检测现代语法（let/const、箭头函数、模板字符串）防止生产环境崩溃
 * - 使用JSDoc模拟类型安全
 * - 检测重复代码模式，推荐提取到工具函数
 * - 验证Promise-based异步模式
 *
 * @example
 * var CodeQualityAnalyzer = require('./code-quality-analyzer.js');
 * var issues = CodeQualityAnalyzer.checkBasePageUsage({ fileSystem: fs, files: jsFiles });
 * var es5Issues = CodeQualityAnalyzer.checkES5Compliance({ code: jsCode, filePath: 'app.js' });
 * var unusedImports = CodeQualityAnalyzer.detectUnusedImports({ code: jsCode, filePath: 'app.js' });
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * BasePage使用模式
 * @constant {Object}
 */
var BASEPAGE_PATTERNS = {
  // 导入BasePage的模式
  IMPORT: /(?:var|const|let)\s+(\w*[Bb]ase[Pp]age\w*)\s*=\s*require\s*\(\s*['"][^'"]*base-page[^'"]*['"]\s*\)/,
  // 使用BasePage.create的模式
  CREATE_PAGE: /[Bb]ase[Pp]age\.create\s*\(/,
  // 使用Page()的模式
  PLAIN_PAGE: /\bPage\s*\(\s*\{/,
  // 使用Component()的模式
  COMPONENT: /\bComponent\s*\(\s*\{/,
  // 混入BasePage的模式
  MIXIN: /Object\.assign\s*\([^,]*,\s*[Bb]ase[Pp]age/
};

/**
 * ES5违规模式
 * @constant {Object}
 */
var ES5_VIOLATION_PATTERNS = {
  // let声明
  LET_DECLARATION: /\blet\s+\w+/g,
  // const声明
  CONST_DECLARATION: /\bconst\s+\w+/g,
  // 箭头函数
  ARROW_FUNCTION: /(?:\([^)]*\)|[\w$]+)\s*=>\s*(?:\{|[^{])/g,
  // 模板字符串
  TEMPLATE_LITERAL: /`[^`]*`/g,
  // 解构赋值 - 对象
  OBJECT_DESTRUCTURING: /(?:var|let|const)\s*\{[^}]+\}\s*=/g,
  // 解构赋值 - 数组
  ARRAY_DESTRUCTURING: /(?:var|let|const)\s*\[[^\]]+\]\s*=/g,
  // 展开运算符
  SPREAD_OPERATOR: /\.{3}\w+/g,
  // 默认参数
  DEFAULT_PARAMETER: /function\s*\w*\s*\([^)]*=\s*[^)]+\)/g,
  // class声明
  CLASS_DECLARATION: /\bclass\s+\w+/g,
  // for...of循环
  FOR_OF_LOOP: /\bfor\s*\(\s*(?:var|let|const)\s+\w+\s+of\s+/g,
  // for...in with let/const
  FOR_IN_MODERN: /\bfor\s*\(\s*(?:let|const)\s+\w+\s+in\s+/g,
  // async/await
  ASYNC_FUNCTION: /\basync\s+function/g,
  AWAIT_EXPRESSION: /\bawait\s+/g,
  // Symbol
  SYMBOL_USAGE: /\bSymbol\s*\(/g,
  // Promise.all/race等静态方法（ES6+）
  PROMISE_STATIC: /\bPromise\.(?:all|race|allSettled|any)\s*\(/g
};

/**
 * require/import模式
 * @constant {Object}
 */
var IMPORT_PATTERNS = {
  // CommonJS require
  REQUIRE: /(?:var|const|let)\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  // 解构require
  DESTRUCTURE_REQUIRE: /(?:var|const|let)\s*\{([^}]+)\}\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
};

/**
 * 重复代码模式
 * @constant {Object}
 */
var DUPLICATE_CODE_PATTERNS = {
  // wx.showToast模式
  SHOW_TOAST: /wx\.showToast\s*\(\s*\{[^}]*title\s*:\s*['"][^'"]*['"][^}]*\}\s*\)/g,
  // wx.showLoading模式
  SHOW_LOADING: /wx\.showLoading\s*\(\s*\{[^}]*\}\s*\)/g,
  // wx.request模式
  WX_REQUEST: /wx\.request\s*\(\s*\{[^}]*url\s*:[^}]*\}\s*\)/g,
  // setData模式
  SET_DATA: /this\.setData\s*\(\s*\{[^}]*\}\s*\)/g,
  // 错误处理模式
  ERROR_HANDLER: /catch\s*\(\s*\w+\s*\)\s*\{[^}]*console\.(?:error|log)\s*\([^)]*\)[^}]*\}/g
};

/**
 * 异步模式
 * @constant {Object}
 */
var ASYNC_PATTERNS = {
  // Promise构造
  PROMISE_NEW: /new\s+Promise\s*\(/g,
  // .then()链
  THEN_CHAIN: /\.then\s*\(/g,
  // .catch()链
  CATCH_CHAIN: /\.catch\s*\(/g,
  // 回调地狱检测（嵌套超过3层）
  CALLBACK_HELL: /function\s*\([^)]*\)\s*\{[^}]*function\s*\([^)]*\)\s*\{[^}]*function\s*\([^)]*\)\s*\{/g,
  // wx异步API
  WX_ASYNC_API: /wx\.(?:request|downloadFile|uploadFile|getStorage|setStorage|getLocation|chooseImage|saveFile|getFileInfo)\s*\(/g
};

/**
 * 页面文件模式
 * @constant {RegExp}
 */
var PAGE_FILE_PATTERN = /(?:pages|package\w*)\/[^/]+\/(?:index|[^/]+)\.js$/;

/**
 * 组件文件模式
 * @constant {RegExp}
 */
var COMPONENT_FILE_PATTERN = /components\/[^/]+\/(?:index|[^/]+)\.js$/;

/**
 * 代码质量分析器
 * @namespace CodeQualityAnalyzer
 */
var CodeQualityAnalyzer = {
  /**
   * BasePage使用模式
   */
  BASEPAGE_PATTERNS: BASEPAGE_PATTERNS,

  /**
   * ES5违规模式
   */
  ES5_VIOLATION_PATTERNS: ES5_VIOLATION_PATTERNS,

  /**
   * Import模式
   */
  IMPORT_PATTERNS: IMPORT_PATTERNS,

  /**
   * 重复代码模式
   */
  DUPLICATE_CODE_PATTERNS: DUPLICATE_CODE_PATTERNS,

  /**
   * 异步模式
   */
  ASYNC_PATTERNS: ASYNC_PATTERNS,



  /**
   * 检查BasePage使用情况
   * 验证页面是否使用统一的BasePage基类
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} BasePage使用分析结果
   *
   * @example
   * var result = CodeQualityAnalyzer.checkBasePageUsage({ fileSystem: fs, files: jsFiles });
   * console.log('使用BasePage的文件:', result.filesWithBasePage);
   * console.log('问题:', result.issues);
   */
  checkBasePageUsage: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      filesWithBasePage: [],
      filesWithoutBasePage: [],
      componentFiles: [],
      basePageUsageCount: 0,
      usageByMethod: {
        create: 0,
        mixin: 0,
        plainPage: 0
      },
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileBasePageUsage(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeBasePageResult(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileBasePageUsage(filePath, code);
            result.filesAnalyzed++;
            this._mergeBasePageResult(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateBasePageRecommendations(result);

    } catch (error) {
      console.error('❌ BasePage使用检查失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的BasePage使用情况
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileBasePageUsage: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      isPageFile: false,
      isComponentFile: false,
      hasBasePageImport: false,
      hasBasePageUsage: false,
      usesPlainPage: false,
      usageMethod: null,
      issues: []
    };

    // 检查是否是页面文件
    fileResult.isPageFile = PAGE_FILE_PATTERN.test(filePath);
    
    // 检查是否是组件文件
    fileResult.isComponentFile = COMPONENT_FILE_PATTERN.test(filePath);

    // 如果不是页面文件也不是组件文件，跳过
    if (!fileResult.isPageFile && !fileResult.isComponentFile) {
      return fileResult;
    }

    // 组件文件使用Component()是正常的
    if (fileResult.isComponentFile) {
      fileResult.usageMethod = 'component';
      return fileResult;
    }

    // 检查是否导入了BasePage
    fileResult.hasBasePageImport = BASEPAGE_PATTERNS.IMPORT.test(code);

    // 检查BasePage.create使用
    if (BASEPAGE_PATTERNS.CREATE_PAGE.test(code)) {
      fileResult.hasBasePageUsage = true;
      fileResult.usageMethod = 'create';
    }
    // 检查mixin使用
    else if (BASEPAGE_PATTERNS.MIXIN.test(code)) {
      fileResult.hasBasePageUsage = true;
      fileResult.usageMethod = 'mixin';
    }
    // 检查是否使用普通Page()
    else if (BASEPAGE_PATTERNS.PLAIN_PAGE.test(code)) {
      fileResult.usesPlainPage = true;
      fileResult.usageMethod = 'plainPage';
    }

    // 生成问题
    if (fileResult.isPageFile && !fileResult.hasBasePageUsage && fileResult.usesPlainPage) {
      fileResult.issues.push(AuditReport.createIssue({
        category: AuditConfig.AuditCategory.CODE_QUALITY,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.NOT_USING_BASEPAGE,
        file: filePath,
        description: '页面文件未使用BasePage基类，缺少统一的错误处理、主题管理和生命周期管理',
        suggestion: '导入base-page.js并使用BasePage.create()创建页面，或使用Object.assign混入BasePage方法'
      }));
    }

    return fileResult;
  },

  /**
   * 合并BasePage分析结果
   * @private
   */
  _mergeBasePageResult: function(result, fileResult) {
    if (fileResult.isComponentFile) {
      result.componentFiles.push(fileResult.filePath);
      return;
    }

    if (!fileResult.isPageFile) {
      return;
    }

    if (fileResult.hasBasePageUsage) {
      result.filesWithBasePage.push(fileResult.filePath);
      result.basePageUsageCount++;

      if (fileResult.usageMethod === 'create') {
        result.usageByMethod.create++;
      } else if (fileResult.usageMethod === 'mixin') {
        result.usageByMethod.mixin++;
      }
    } else if (fileResult.usesPlainPage) {
      result.filesWithoutBasePage.push(fileResult.filePath);
      result.usageByMethod.plainPage++;
    }

    result.issues = result.issues.concat(fileResult.issues);
  },

  /**
   * 生成BasePage使用建议
   * @private
   */
  _generateBasePageRecommendations: function(result) {
    var recommendations = [];

    if (result.filesWithoutBasePage.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '迁移到BasePage基类',
        description: '发现 ' + result.filesWithoutBasePage.length +
          ' 个页面文件未使用BasePage基类。建议迁移以获得统一的错误处理、主题管理和生命周期管理。',
        files: result.filesWithoutBasePage.slice(0, 10)
      });
    }

    if (result.basePageUsageCount > 0) {
      var totalPages = result.filesWithBasePage.length + result.filesWithoutBasePage.length;
      var usageRate = totalPages > 0 ? result.basePageUsageCount / totalPages : 0;
      
      if (usageRate > 0.7) {
        recommendations.push({
          priority: 'info',
          title: 'BasePage使用良好',
          description: '项目中 ' + Math.round(usageRate * 100) + '% 的页面使用了BasePage基类，这是良好的实践。'
        });
      }
    }

    return recommendations;
  },



  /**
   * 检查ES5 strict模式合规性
   * 检测代码中的ES6+语法，确保兼容ES5 strict模式
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} ES5合规性分析结果
   *
   * @example
   * var result = CodeQualityAnalyzer.checkES5Compliance({ code: jsCode, filePath: 'app.js' });
   * console.log('ES5违规数:', result.totalViolations);
   * console.log('问题:', result.issues);
   */
  checkES5Compliance: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      totalViolations: 0,
      violationsByType: {
        letDeclaration: 0,
        constDeclaration: 0,
        arrowFunction: 0,
        templateLiteral: 0,
        destructuring: 0,
        spreadOperator: 0,
        defaultParameter: 0,
        classDeclaration: 0,
        forOfLoop: 0,
        asyncAwait: 0,
        other: 0
      },
      filesWithViolations: [],
      compliantFiles: [],
      violations: [],
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileES5Compliance(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeES5Result(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileES5Compliance(filePath, code);
            result.filesAnalyzed++;
            this._mergeES5Result(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateES5Recommendations(result);

    } catch (error) {
      console.error('❌ ES5合规性检查失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的ES5合规性
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileES5Compliance: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      isCompliant: true,
      violations: [],
      violationsByType: {
        letDeclaration: 0,
        constDeclaration: 0,
        arrowFunction: 0,
        templateLiteral: 0,
        destructuring: 0,
        spreadOperator: 0,
        defaultParameter: 0,
        classDeclaration: 0,
        forOfLoop: 0,
        asyncAwait: 0,
        other: 0
      },
      issues: []
    };

    var lines = code.split('\n');

    // 检查各种ES6+语法
    var violationChecks = [
      { pattern: ES5_VIOLATION_PATTERNS.LET_DECLARATION, type: 'letDeclaration', name: 'let声明', suggestion: '使用var替代let' },
      { pattern: ES5_VIOLATION_PATTERNS.CONST_DECLARATION, type: 'constDeclaration', name: 'const声明', suggestion: '使用var替代const' },
      { pattern: ES5_VIOLATION_PATTERNS.ARROW_FUNCTION, type: 'arrowFunction', name: '箭头函数', suggestion: '使用function表达式替代箭头函数' },
      { pattern: ES5_VIOLATION_PATTERNS.TEMPLATE_LITERAL, type: 'templateLiteral', name: '模板字符串', suggestion: '使用字符串拼接替代模板字符串' },
      { pattern: ES5_VIOLATION_PATTERNS.OBJECT_DESTRUCTURING, type: 'destructuring', name: '对象解构', suggestion: '使用逐个属性赋值替代解构' },
      { pattern: ES5_VIOLATION_PATTERNS.ARRAY_DESTRUCTURING, type: 'destructuring', name: '数组解构', suggestion: '使用索引访问替代解构' },
      { pattern: ES5_VIOLATION_PATTERNS.SPREAD_OPERATOR, type: 'spreadOperator', name: '展开运算符', suggestion: '使用Array.prototype.concat或Object.assign替代' },
      { pattern: ES5_VIOLATION_PATTERNS.DEFAULT_PARAMETER, type: 'defaultParameter', name: '默认参数', suggestion: '在函数体内使用||或三元运算符设置默认值' },
      { pattern: ES5_VIOLATION_PATTERNS.CLASS_DECLARATION, type: 'classDeclaration', name: 'class声明', suggestion: '使用构造函数和原型链替代class' },
      { pattern: ES5_VIOLATION_PATTERNS.FOR_OF_LOOP, type: 'forOfLoop', name: 'for...of循环', suggestion: '使用传统for循环或forEach替代' },
      { pattern: ES5_VIOLATION_PATTERNS.ASYNC_FUNCTION, type: 'asyncAwait', name: 'async函数', suggestion: '使用Promise链替代async/await' },
      { pattern: ES5_VIOLATION_PATTERNS.AWAIT_EXPRESSION, type: 'asyncAwait', name: 'await表达式', suggestion: '使用Promise链替代async/await' }
    ];

    for (var i = 0; i < violationChecks.length; i++) {
      var check = violationChecks[i];
      this._findViolations(code, lines, filePath, check, fileResult);
    }

    // 判断是否合规
    fileResult.isCompliant = fileResult.violations.length === 0;

    return fileResult;
  },

  /**
   * 查找特定类型的违规
   * @private
   */
  _findViolations: function(code, lines, filePath, check, fileResult) {
    // 重置正则表达式
    check.pattern.lastIndex = 0;
    
    var match;
    while ((match = check.pattern.exec(code)) !== null) {
      // 计算行号
      var lineNum = this._getLineNumber(code, match.index);
      
      // 检查是否在注释中
      if (this._isInComment(code, match.index)) {
        continue;
      }

      // 检查是否在字符串中（对于某些模式）
      if (check.type === 'templateLiteral' || check.type === 'arrowFunction') {
        // 模板字符串和箭头函数需要特殊处理
      }

      var violation = {
        type: check.type,
        name: check.name,
        line: lineNum,
        code: match[0].substring(0, 50) + (match[0].length > 50 ? '...' : ''),
        suggestion: check.suggestion
      };

      fileResult.violations.push(violation);
      fileResult.violationsByType[check.type]++;

      // 创建问题记录
      fileResult.issues.push(AuditReport.createIssue({
        category: AuditConfig.AuditCategory.CODE_QUALITY,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.ES5_VIOLATION,
        file: filePath,
        line: lineNum,
        description: '检测到ES6+语法: ' + check.name + ' - 不兼容ES5 strict模式',
        suggestion: check.suggestion,
        metadata: {
          violationType: check.type,
          matchedCode: violation.code
        }
      }));
    }
  },

  /**
   * 获取字符位置对应的行号
   * @private
   */
  _getLineNumber: function(code, index) {
    var lines = code.substring(0, index).split('\n');
    return lines.length;
  },

  /**
   * 检查位置是否在注释中
   * @private
   */
  _isInComment: function(code, index) {
    // 检查单行注释
    var lineStart = code.lastIndexOf('\n', index) + 1;
    var lineContent = code.substring(lineStart, index);
    if (lineContent.indexOf('//') !== -1) {
      return true;
    }

    // 检查多行注释
    var beforeIndex = code.substring(0, index);
    var lastCommentStart = beforeIndex.lastIndexOf('/*');
    var lastCommentEnd = beforeIndex.lastIndexOf('*/');
    
    if (lastCommentStart > lastCommentEnd) {
      return true;
    }

    return false;
  },

  /**
   * 合并ES5合规性分析结果
   * @private
   */
  _mergeES5Result: function(result, fileResult) {
    result.totalViolations += fileResult.violations.length;

    // 合并类型统计
    var types = Object.keys(fileResult.violationsByType);
    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      result.violationsByType[type] += fileResult.violationsByType[type];
    }

    if (fileResult.isCompliant) {
      result.compliantFiles.push(fileResult.filePath);
    } else {
      result.filesWithViolations.push(fileResult.filePath);
    }

    result.violations = result.violations.concat(fileResult.violations.map(function(v) {
      return Object.assign({}, v, { file: fileResult.filePath });
    }));

    result.issues = result.issues.concat(fileResult.issues);
  },

  /**
   * 生成ES5合规性建议
   * @private
   */
  _generateES5Recommendations: function(result) {
    var recommendations = [];

    if (result.totalViolations > 0) {
      // 找出最常见的违规类型
      var maxType = 'other';
      var maxCount = 0;
      var types = Object.keys(result.violationsByType);
      for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (result.violationsByType[type] > maxCount) {
          maxCount = result.violationsByType[type];
          maxType = type;
        }
      }

      var typeNames = {
        letDeclaration: 'let声明',
        constDeclaration: 'const声明',
        arrowFunction: '箭头函数',
        templateLiteral: '模板字符串',
        destructuring: '解构赋值',
        spreadOperator: '展开运算符',
        defaultParameter: '默认参数',
        classDeclaration: 'class声明',
        forOfLoop: 'for...of循环',
        asyncAwait: 'async/await'
      };

      recommendations.push({
        priority: 'high',
        title: '修复ES5合规性问题',
        description: '发现 ' + result.totalViolations + ' 处ES6+语法违规，分布在 ' +
          result.filesWithViolations.length + ' 个文件中。最常见的问题是 ' +
          (typeNames[maxType] || maxType) + '（' + maxCount + ' 处）。',
        files: result.filesWithViolations.slice(0, 10)
      });
    }

    if (result.compliantFiles.length > 0 && result.filesWithViolations.length === 0) {
      recommendations.push({
        priority: 'info',
        title: 'ES5合规性良好',
        description: '所有 ' + result.compliantFiles.length + ' 个文件都符合ES5 strict模式要求。'
      });
    }

    return recommendations;
  },



  /**
   * 检测未使用的imports
   * 识别require导入但未在代码中使用的模块
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} 未使用imports分析结果
   *
   * @example
   * var result = CodeQualityAnalyzer.detectUnusedImports({ code: jsCode, filePath: 'app.js' });
   * console.log('未使用的imports:', result.unusedImports);
   * console.log('问题:', result.issues);
   */
  detectUnusedImports: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      totalImports: 0,
      usedImports: 0,
      unusedImports: [],
      filesWithUnusedImports: [],
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileUnusedImports(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeUnusedImportsResult(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileUnusedImports(filePath, code);
            result.filesAnalyzed++;
            this._mergeUnusedImportsResult(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateUnusedImportsRecommendations(result);

    } catch (error) {
      console.error('❌ 未使用imports检测失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的未使用imports
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileUnusedImports: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      imports: [],
      usedImports: [],
      unusedImports: [],
      issues: []
    };

    // 提取所有require导入
    var imports = this._extractImports(code);
    fileResult.imports = imports;

    // 检查每个导入是否被使用
    for (var i = 0; i < imports.length; i++) {
      var importInfo = imports[i];
      var isUsed = this._isImportUsed(code, importInfo);

      if (isUsed) {
        fileResult.usedImports.push(importInfo);
      } else {
        fileResult.unusedImports.push(importInfo);

        // 创建问题记录
        fileResult.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.CODE_QUALITY,
          severity: AuditConfig.AuditSeverity.MINOR,
          type: AuditConfig.AuditIssueType.UNUSED_IMPORT,
          file: filePath,
          line: importInfo.line,
          description: '未使用的导入: ' + importInfo.variableName + ' (来自 ' + importInfo.modulePath + ')',
          suggestion: '移除未使用的导入以减少代码体积和提高可读性',
          metadata: {
            variableName: importInfo.variableName,
            modulePath: importInfo.modulePath
          }
        }));
      }
    }

    return fileResult;
  },

  /**
   * 提取代码中的所有imports
   * @private
   */
  _extractImports: function(code) {
    var imports = [];
    var lines = code.split('\n');

    // 匹配普通require
    var requirePattern = /(?:var|const|let)\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    var match;

    while ((match = requirePattern.exec(code)) !== null) {
      var lineNum = this._getLineNumber(code, match.index);
      imports.push({
        variableName: match[1],
        modulePath: match[2],
        line: lineNum,
        type: 'require',
        fullMatch: match[0]
      });
    }

    // 匹配解构require
    var destructurePattern = /(?:var|const|let)\s*\{([^}]+)\}\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    
    while ((match = destructurePattern.exec(code)) !== null) {
      var lineNum = this._getLineNumber(code, match.index);
      var variables = match[1].split(',').map(function(v) {
        return v.trim().split(':')[0].trim(); // 处理重命名情况 { a: b }
      });

      for (var i = 0; i < variables.length; i++) {
        if (variables[i]) {
          imports.push({
            variableName: variables[i],
            modulePath: match[2],
            line: lineNum,
            type: 'destructure',
            fullMatch: match[0]
          });
        }
      }
    }

    return imports;
  },

  /**
   * 检查导入是否被使用
   * @private
   */
  _isImportUsed: function(code, importInfo) {
    var variableName = importInfo.variableName;
    
    // 移除导入语句本身
    var codeWithoutImport = code.replace(importInfo.fullMatch, '');

    // 构建正则表达式检查变量使用
    // 需要匹配：变量名后跟非字母数字字符（避免匹配变量名的一部分）
    var usagePattern = new RegExp('\\b' + this._escapeRegExp(variableName) + '\\b(?![\\w$])', 'g');
    
    // 检查是否在代码中使用（排除注释）
    var codeWithoutComments = this._removeComments(codeWithoutImport);
    
    return usagePattern.test(codeWithoutComments);
  },

  /**
   * 转义正则表达式特殊字符
   * @private
   */
  _escapeRegExp: function(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  /**
   * 移除代码中的注释
   * @private
   */
  _removeComments: function(code) {
    // 移除单行注释
    var result = code.replace(/\/\/[^\n]*/g, '');
    // 移除多行注释
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    return result;
  },

  /**
   * 合并未使用imports分析结果
   * @private
   */
  _mergeUnusedImportsResult: function(result, fileResult) {
    result.totalImports += fileResult.imports.length;
    result.usedImports += fileResult.usedImports.length;

    if (fileResult.unusedImports.length > 0) {
      result.filesWithUnusedImports.push(fileResult.filePath);
      
      for (var i = 0; i < fileResult.unusedImports.length; i++) {
        var unused = fileResult.unusedImports[i];
        result.unusedImports.push({
          file: fileResult.filePath,
          variableName: unused.variableName,
          modulePath: unused.modulePath,
          line: unused.line
        });
      }
    }

    result.issues = result.issues.concat(fileResult.issues);
  },

  /**
   * 生成未使用imports建议
   * @private
   */
  _generateUnusedImportsRecommendations: function(result) {
    var recommendations = [];

    if (result.unusedImports.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: '移除未使用的导入',
        description: '发现 ' + result.unusedImports.length + ' 个未使用的导入，分布在 ' +
          result.filesWithUnusedImports.length + ' 个文件中。移除这些导入可以减少代码体积。',
        imports: result.unusedImports.slice(0, 10)
      });
    }

    if (result.totalImports > 0 && result.unusedImports.length === 0) {
      recommendations.push({
        priority: 'info',
        title: '导入使用良好',
        description: '所有 ' + result.totalImports + ' 个导入都被正确使用。'
      });
    }

    return recommendations;
  },



  /**
   * 检测重复代码模式
   * 识别跨文件的重复代码模式，推荐提取到工具函数
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} 重复代码分析结果
   *
   * @example
   * var result = CodeQualityAnalyzer.detectDuplicatePatterns({ fileSystem: fs, files: jsFiles });
   * console.log('重复模式:', result.duplicatePatterns);
   * console.log('问题:', result.issues);
   */
  detectDuplicatePatterns: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      duplicatePatterns: [],
      patternsByType: {
        showToast: [],
        showLoading: [],
        wxRequest: [],
        setData: [],
        errorHandler: []
      },
      totalDuplicates: 0,
      issues: [],
      recommendations: []
    };

    try {
      // 收集所有文件的模式
      var allPatterns = {
        showToast: [],
        showLoading: [],
        wxRequest: [],
        setData: [],
        errorHandler: []
      };

      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var filePatterns = this._extractDuplicatePatterns(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._collectPatterns(allPatterns, filePatterns);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var filePatterns = this._extractDuplicatePatterns(filePath, code);
            result.filesAnalyzed++;
            this._collectPatterns(allPatterns, filePatterns);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 分析重复模式
      result.patternsByType = allPatterns;
      result.duplicatePatterns = this._analyzeDuplicatePatterns(allPatterns);
      result.totalDuplicates = result.duplicatePatterns.length;

      // 生成问题
      result.issues = this._generateDuplicateIssues(result.duplicatePatterns);

      // 生成建议
      result.recommendations = this._generateDuplicateRecommendations(result);

    } catch (error) {
      console.error('❌ 重复代码检测失败:', error);
    }

    return result;
  },

  /**
   * 提取文件中的代码模式
   * @private
   */
  _extractDuplicatePatterns: function(filePath, code) {
    var patterns = {
      showToast: [],
      showLoading: [],
      wxRequest: [],
      setData: [],
      errorHandler: []
    };

    var lines = code.split('\n');

    // 提取wx.showToast模式
    var toastMatches = code.match(DUPLICATE_CODE_PATTERNS.SHOW_TOAST) || [];
    for (var i = 0; i < toastMatches.length; i++) {
      var lineNum = this._getLineNumber(code, code.indexOf(toastMatches[i]));
      patterns.showToast.push({
        file: filePath,
        line: lineNum,
        code: toastMatches[i],
        normalized: this._normalizePattern(toastMatches[i])
      });
    }

    // 提取wx.showLoading模式
    var loadingMatches = code.match(DUPLICATE_CODE_PATTERNS.SHOW_LOADING) || [];
    for (var j = 0; j < loadingMatches.length; j++) {
      var lineNum = this._getLineNumber(code, code.indexOf(loadingMatches[j]));
      patterns.showLoading.push({
        file: filePath,
        line: lineNum,
        code: loadingMatches[j],
        normalized: this._normalizePattern(loadingMatches[j])
      });
    }

    // 提取错误处理模式
    var errorMatches = code.match(DUPLICATE_CODE_PATTERNS.ERROR_HANDLER) || [];
    for (var k = 0; k < errorMatches.length; k++) {
      var lineNum = this._getLineNumber(code, code.indexOf(errorMatches[k]));
      patterns.errorHandler.push({
        file: filePath,
        line: lineNum,
        code: errorMatches[k],
        normalized: this._normalizePattern(errorMatches[k])
      });
    }

    return patterns;
  },

  /**
   * 标准化代码模式（用于比较）
   * @private
   */
  _normalizePattern: function(code) {
    // 移除空白字符
    var normalized = code.replace(/\s+/g, ' ');
    // 移除字符串内容（保留结构）
    normalized = normalized.replace(/'[^']*'/g, "''");
    normalized = normalized.replace(/"[^"]*"/g, '""');
    return normalized.trim();
  },

  /**
   * 收集模式到总集合
   * @private
   */
  _collectPatterns: function(allPatterns, filePatterns) {
    var types = Object.keys(filePatterns);
    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      allPatterns[type] = allPatterns[type].concat(filePatterns[type]);
    }
  },

  /**
   * 分析重复模式
   * @private
   */
  _analyzeDuplicatePatterns: function(allPatterns) {
    var duplicates = [];
    var types = Object.keys(allPatterns);

    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      var patterns = allPatterns[type];

      // 按标准化模式分组
      var groups = {};
      for (var j = 0; j < patterns.length; j++) {
        var pattern = patterns[j];
        var key = pattern.normalized;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(pattern);
      }

      // 找出重复的模式（出现超过2次）
      var keys = Object.keys(groups);
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        if (groups[key].length >= 2) {
          // 检查是否跨文件重复
          var files = {};
          for (var m = 0; m < groups[key].length; m++) {
            files[groups[key][m].file] = true;
          }
          var fileCount = Object.keys(files).length;

          duplicates.push({
            type: type,
            pattern: key,
            occurrences: groups[key],
            count: groups[key].length,
            fileCount: fileCount,
            isCrossFile: fileCount > 1
          });
        }
      }
    }

    // 按出现次数排序
    duplicates.sort(function(a, b) {
      return b.count - a.count;
    });

    return duplicates;
  },

  /**
   * 生成重复代码问题
   * @private
   */
  _generateDuplicateIssues: function(duplicates) {
    var issues = [];

    for (var i = 0; i < duplicates.length; i++) {
      var dup = duplicates[i];
      
      // 只为跨文件重复或出现次数较多的模式生成问题
      if (dup.isCrossFile || dup.count >= 3) {
        var typeNames = {
          showToast: 'wx.showToast调用',
          showLoading: 'wx.showLoading调用',
          wxRequest: 'wx.request调用',
          setData: 'setData调用',
          errorHandler: '错误处理代码'
        };

        issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.CODE_QUALITY,
          severity: dup.isCrossFile ? AuditConfig.AuditSeverity.MAJOR : AuditConfig.AuditSeverity.MINOR,
          type: AuditConfig.AuditIssueType.DUPLICATE_CODE,
          file: dup.occurrences[0].file,
          line: dup.occurrences[0].line,
          description: '检测到重复的' + (typeNames[dup.type] || '代码模式') + 
            '，出现 ' + dup.count + ' 次' + 
            (dup.isCrossFile ? '，跨 ' + dup.fileCount + ' 个文件' : ''),
          suggestion: '建议提取到工具函数或使用base-page.js中的统一方法',
          metadata: {
            patternType: dup.type,
            occurrenceCount: dup.count,
            fileCount: dup.fileCount,
            files: dup.occurrences.map(function(o) { return o.file; }).filter(function(f, i, arr) {
              return arr.indexOf(f) === i;
            })
          }
        }));
      }
    }

    return issues;
  },

  /**
   * 生成重复代码建议
   * @private
   */
  _generateDuplicateRecommendations: function(result) {
    var recommendations = [];

    if (result.totalDuplicates > 0) {
      // 统计跨文件重复
      var crossFileCount = 0;
      for (var i = 0; i < result.duplicatePatterns.length; i++) {
        if (result.duplicatePatterns[i].isCrossFile) {
          crossFileCount++;
        }
      }

      if (crossFileCount > 0) {
        recommendations.push({
          priority: 'high',
          title: '提取重复代码到工具函数',
          description: '发现 ' + crossFileCount + ' 个跨文件重复的代码模式。' +
            '建议提取到utils目录下的工具函数，或使用base-page.js中的统一方法。',
          patterns: result.duplicatePatterns.filter(function(p) { return p.isCrossFile; }).slice(0, 5)
        });
      }

      if (result.totalDuplicates - crossFileCount > 0) {
        recommendations.push({
          priority: 'medium',
          title: '减少文件内重复代码',
          description: '发现 ' + (result.totalDuplicates - crossFileCount) + ' 个文件内重复的代码模式。' +
            '建议在文件内提取为局部函数。'
        });
      }
    }

    if (result.totalDuplicates === 0) {
      recommendations.push({
        priority: 'info',
        title: '代码重复度良好',
        description: '未检测到明显的重复代码模式。'
      });
    }

    return recommendations;
  },



  /**
   * 检查异步操作模式
   * 验证异步操作是否使用正确的Promise模式
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} 异步模式分析结果
   *
   * @example
   * var result = CodeQualityAnalyzer.checkAsyncPatterns({ code: jsCode, filePath: 'app.js' });
   * console.log('异步模式:', result.asyncPatterns);
   * console.log('问题:', result.issues);
   */
  checkAsyncPatterns: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      totalAsyncOperations: 0,
      promiseBasedCount: 0,
      callbackBasedCount: 0,
      callbackHellCount: 0,
      asyncPatterns: [],
      filesWithCallbackHell: [],
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileAsyncPatterns(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeAsyncResult(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileAsyncPatterns(filePath, code);
            result.filesAnalyzed++;
            this._mergeAsyncResult(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateAsyncRecommendations(result);

    } catch (error) {
      console.error('❌ 异步模式检查失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的异步模式
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileAsyncPatterns: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      asyncOperations: [],
      hasPromiseUsage: false,
      hasCallbackHell: false,
      callbackHellLocations: [],
      issues: []
    };

    // 检查Promise使用
    var promiseNewMatches = code.match(ASYNC_PATTERNS.PROMISE_NEW) || [];
    var thenMatches = code.match(ASYNC_PATTERNS.THEN_CHAIN) || [];
    var catchMatches = code.match(ASYNC_PATTERNS.CATCH_CHAIN) || [];

    fileResult.hasPromiseUsage = promiseNewMatches.length > 0 || 
                                  thenMatches.length > 0;

    // 检查wx异步API使用
    var wxAsyncMatches = code.match(ASYNC_PATTERNS.WX_ASYNC_API) || [];
    
    for (var i = 0; i < wxAsyncMatches.length; i++) {
      var lineNum = this._getLineNumber(code, code.indexOf(wxAsyncMatches[i]));
      fileResult.asyncOperations.push({
        type: 'wxAsync',
        code: wxAsyncMatches[i],
        line: lineNum
      });
    }

    // 检查回调地狱
    var callbackHellMatches = code.match(ASYNC_PATTERNS.CALLBACK_HELL) || [];
    if (callbackHellMatches.length > 0) {
      fileResult.hasCallbackHell = true;
      
      for (var j = 0; j < callbackHellMatches.length; j++) {
        var lineNum = this._getLineNumber(code, code.indexOf(callbackHellMatches[j]));
        fileResult.callbackHellLocations.push({
          line: lineNum,
          code: callbackHellMatches[j].substring(0, 100) + '...'
        });

        // 创建问题记录
        fileResult.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.CODE_QUALITY,
          severity: AuditConfig.AuditSeverity.MAJOR,
          type: 'callback_hell',
          file: filePath,
          line: lineNum,
          description: '检测到回调地狱（嵌套超过3层的回调函数）',
          suggestion: '使用Promise链或将嵌套回调提取为独立函数，提高代码可读性和可维护性'
        }));
      }
    }

    // 检查wx异步API是否有错误处理
    this._checkAsyncErrorHandling(code, filePath, fileResult);

    return fileResult;
  },

  /**
   * 检查异步操作的错误处理
   * @private
   */
  _checkAsyncErrorHandling: function(code, filePath, fileResult) {
    // 检查wx.request等是否有fail回调
    var wxRequestPattern = /wx\.request\s*\(\s*\{([^}]*)\}\s*\)/g;
    var match;

    while ((match = wxRequestPattern.exec(code)) !== null) {
      var configContent = match[1];
      var hasFail = /\bfail\s*:/.test(configContent);
      var hasComplete = /\bcomplete\s*:/.test(configContent);

      if (!hasFail && !hasComplete) {
        var lineNum = this._getLineNumber(code, match.index);
        fileResult.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.CODE_QUALITY,
          severity: AuditConfig.AuditSeverity.MINOR,
          type: 'missing_async_error_handler',
          file: filePath,
          line: lineNum,
          description: 'wx.request调用缺少fail或complete回调',
          suggestion: '添加fail回调处理网络错误，或使用Promise封装并添加.catch()'
        }));
      }
    }
  },

  /**
   * 合并异步模式分析结果
   * @private
   */
  _mergeAsyncResult: function(result, fileResult) {
    result.totalAsyncOperations += fileResult.asyncOperations.length;

    if (fileResult.hasPromiseUsage) {
      result.promiseBasedCount++;
    }

    if (fileResult.hasCallbackHell) {
      result.callbackHellCount++;
      result.filesWithCallbackHell.push(fileResult.filePath);
    }

    result.asyncPatterns = result.asyncPatterns.concat(
      fileResult.asyncOperations.map(function(op) {
        return Object.assign({}, op, { file: fileResult.filePath });
      })
    );

    result.issues = result.issues.concat(fileResult.issues);
  },

  /**
   * 生成异步模式建议
   * @private
   */
  _generateAsyncRecommendations: function(result) {
    var recommendations = [];

    if (result.callbackHellCount > 0) {
      recommendations.push({
        priority: 'high',
        title: '重构回调地狱',
        description: '发现 ' + result.callbackHellCount + ' 个文件存在回调地狱问题。' +
          '建议使用Promise链重构，提高代码可读性。',
        files: result.filesWithCallbackHell.slice(0, 10)
      });
    }

    if (result.promiseBasedCount > 0) {
      var promiseRate = result.filesAnalyzed > 0 ? 
        result.promiseBasedCount / result.filesAnalyzed : 0;
      
      if (promiseRate > 0.5) {
        recommendations.push({
          priority: 'info',
          title: 'Promise使用良好',
          description: '项目中 ' + Math.round(promiseRate * 100) + '% 的文件使用了Promise模式处理异步操作。'
        });
      }
    }

    return recommendations;
  },


  /**
   * 综合扫描所有代码质量问题
   * 执行完整的代码质量分析
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @returns {Object} 综合分析结果
   *
   * @example
   * var result = CodeQualityAnalyzer.scanAll({ fileSystem: fs, files: jsFiles });
   * console.log('BasePage使用:', result.basePageUsage);
   * console.log('ES5合规性:', result.es5Compliance);
   * console.log('未使用imports:', result.unusedImports);
   */
  scanAll: function(options) {
    options = options || {};

    var result = {
      timestamp: new Date().toISOString(),
      filesAnalyzed: 0,
      basePageUsage: null,
      es5Compliance: null,
      unusedImports: null,
      duplicatePatterns: null,
      asyncPatterns: null,
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
      result.basePageUsage = this.checkBasePageUsage(options);
      result.es5Compliance = this.checkES5Compliance(options);
      result.unusedImports = this.detectUnusedImports(options);
      result.duplicatePatterns = this.detectDuplicatePatterns(options);
      result.asyncPatterns = this.checkAsyncPatterns(options);

      // 汇总文件数
      result.filesAnalyzed = Math.max(
        result.basePageUsage.filesAnalyzed,
        result.es5Compliance.filesAnalyzed,
        result.unusedImports.filesAnalyzed,
        result.duplicatePatterns.filesAnalyzed,
        result.asyncPatterns.filesAnalyzed
      );

      // 汇总所有问题
      result.allIssues = []
        .concat(result.basePageUsage.issues || [])
        .concat(result.es5Compliance.issues || [])
        .concat(result.unusedImports.issues || [])
        .concat(result.duplicatePatterns.issues || [])
        .concat(result.asyncPatterns.issues || []);

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
        .concat(result.basePageUsage.recommendations || [])
        .concat(result.es5Compliance.recommendations || [])
        .concat(result.unusedImports.recommendations || [])
        .concat(result.duplicatePatterns.recommendations || [])
        .concat(result.asyncPatterns.recommendations || []);

      // 按优先级排序建议
      result.allRecommendations.sort(function(a, b) {
        var priorityOrder = { high: 0, medium: 1, low: 2, info: 3 };
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
      });

    } catch (error) {
      console.error('❌ 综合代码质量扫描失败:', error);
    }

    return result;
  },

  /**
   * 生成代码质量分析报告
   * 生成可读的Markdown格式报告
   *
   * @param {Object} scanResult - scanAll的返回结果
   * @returns {string} Markdown格式的报告
   *
   * @example
   * var result = CodeQualityAnalyzer.scanAll({ fileSystem: fs, files: jsFiles });
   * var report = CodeQualityAnalyzer.generateReport(result);
   * console.log(report);
   */
  generateReport: function(scanResult) {
    if (!scanResult) {
      return '# 代码质量分析报告\n\n无分析结果';
    }

    var lines = [
      '# 代码质量分析报告',
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

    // BasePage使用情况
    if (scanResult.basePageUsage) {
      var bp = scanResult.basePageUsage;
      lines.push('## 🏗️ BasePage使用情况');
      lines.push('');
      lines.push('- 使用BasePage的页面: ' + bp.filesWithBasePage.length);
      lines.push('- 未使用BasePage的页面: ' + bp.filesWithoutBasePage.length);
      lines.push('- 组件文件: ' + bp.componentFiles.length);
      lines.push('');

      if (bp.filesWithoutBasePage.length > 0) {
        lines.push('**需要迁移到BasePage的页面:**');
        for (var i = 0; i < Math.min(10, bp.filesWithoutBasePage.length); i++) {
          lines.push('- `' + bp.filesWithoutBasePage[i] + '`');
        }
        if (bp.filesWithoutBasePage.length > 10) {
          lines.push('- ... 还有 ' + (bp.filesWithoutBasePage.length - 10) + ' 个文件');
        }
        lines.push('');
      }
    }

    // ES5合规性
    if (scanResult.es5Compliance) {
      var es5 = scanResult.es5Compliance;
      lines.push('## 📜 ES5合规性');
      lines.push('');
      lines.push('- 总违规数: ' + es5.totalViolations);
      lines.push('- 合规文件数: ' + es5.compliantFiles.length);
      lines.push('- 违规文件数: ' + es5.filesWithViolations.length);
      lines.push('');

      if (es5.totalViolations > 0) {
        lines.push('**违规类型统计:**');
        var types = Object.keys(es5.violationsByType);
        for (var j = 0; j < types.length; j++) {
          var type = types[j];
          if (es5.violationsByType[type] > 0) {
            lines.push('- ' + type + ': ' + es5.violationsByType[type] + ' 处');
          }
        }
        lines.push('');
      }
    }

    // 未使用imports
    if (scanResult.unusedImports) {
      var ui = scanResult.unusedImports;
      lines.push('## 📦 导入使用情况');
      lines.push('');
      lines.push('- 总导入数: ' + ui.totalImports);
      lines.push('- 已使用: ' + ui.usedImports);
      lines.push('- 未使用: ' + ui.unusedImports.length);
      lines.push('');

      if (ui.unusedImports.length > 0) {
        lines.push('**未使用的导入:**');
        for (var k = 0; k < Math.min(10, ui.unusedImports.length); k++) {
          var unused = ui.unusedImports[k];
          lines.push('- `' + unused.variableName + '` in `' + unused.file + '`');
        }
        if (ui.unusedImports.length > 10) {
          lines.push('- ... 还有 ' + (ui.unusedImports.length - 10) + ' 个');
        }
        lines.push('');
      }
    }

    // 重复代码
    if (scanResult.duplicatePatterns) {
      var dp = scanResult.duplicatePatterns;
      lines.push('## 🔄 重复代码检测');
      lines.push('');
      lines.push('- 检测到的重复模式: ' + dp.totalDuplicates);
      lines.push('');

      if (dp.duplicatePatterns.length > 0) {
        lines.push('**主要重复模式:**');
        for (var m = 0; m < Math.min(5, dp.duplicatePatterns.length); m++) {
          var dup = dp.duplicatePatterns[m];
          lines.push('- ' + dup.type + ': 出现 ' + dup.count + ' 次' +
            (dup.isCrossFile ? '，跨 ' + dup.fileCount + ' 个文件' : ''));
        }
        lines.push('');
      }
    }

    // 异步模式
    if (scanResult.asyncPatterns) {
      var ap = scanResult.asyncPatterns;
      lines.push('## ⚡ 异步模式分析');
      lines.push('');
      lines.push('- 异步操作总数: ' + ap.totalAsyncOperations);
      lines.push('- 使用Promise的文件: ' + ap.promiseBasedCount);
      lines.push('- 存在回调地狱的文件: ' + ap.callbackHellCount);
      lines.push('');
    }

    // 优化建议
    if (scanResult.allRecommendations && scanResult.allRecommendations.length > 0) {
      lines.push('## 💡 优化建议');
      lines.push('');

      for (var n = 0; n < scanResult.allRecommendations.length; n++) {
        var rec = scanResult.allRecommendations[n];
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
      }
    }

    // 问题详情
    if (scanResult.allIssues && scanResult.allIssues.length > 0) {
      lines.push('## 📋 问题详情');
      lines.push('');

      for (var p = 0; p < Math.min(20, scanResult.allIssues.length); p++) {
        var issue = scanResult.allIssues[p];
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
module.exports = CodeQualityAnalyzer;
