'use strict';

/**
 * 🔍 缓存模式分析器
 *
 * 检测和分析小程序本地存储使用模式
 * 验证version-manager.js使用情况、同步存储操作、存储配额监控
 *
 * @module cache-analyzer
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 缓存模式分析
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 异步操作（推荐）：使用 wx.setStorage 和 wx.getStorage 配合 Promise
 * - 同步操作（慎用）：wx.setStorageSync 仅适用于启动阶段必须立即读取的关键配置
 * - 存储配额监控：利用 wx.getStorageInfo 定期检查，建议在占用率达到80%时触发清理
 * - 缓存版本管理：在缓存Key中嵌入版本号，确保版本升级时数据一致性
 * - LRU清理策略：记录每个Key的最后访问时间，优先清理过期或低频访问的数据
 *
 * @example
 * var CacheAnalyzer = require('./cache-analyzer.js');
 * var issues = CacheAnalyzer.checkVersionManagerUsage({ fileSystem: fs, files: jsFiles });
 * var syncOps = CacheAnalyzer.detectSyncStorageOperations({ code: jsCode, filePath: 'app.js' });
 * var quotaIssues = CacheAnalyzer.checkStorageQuotaMonitoring({ fileSystem: fs, files: jsFiles });
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 存储API模式
 * @constant {Object}
 */
var STORAGE_API_PATTERNS = {
  // 同步存储操作（应谨慎使用）
  SYNC_GET: /wx\.getStorageSync\s*\(/g,
  SYNC_SET: /wx\.setStorageSync\s*\(/g,
  SYNC_REMOVE: /wx\.removeStorageSync\s*\(/g,
  SYNC_CLEAR: /wx\.clearStorageSync\s*\(/g,
  SYNC_INFO: /wx\.getStorageInfoSync\s*\(/g,

  // 异步存储操作（推荐）
  ASYNC_GET: /wx\.getStorage\s*\(/g,
  ASYNC_SET: /wx\.setStorage\s*\(/g,
  ASYNC_REMOVE: /wx\.removeStorage\s*\(/g,
  ASYNC_CLEAR: /wx\.clearStorage\s*\(/g,
  ASYNC_INFO: /wx\.getStorageInfo\s*\(/g
};

/**
 * 关键数据缓存Key模式（应使用版本化Key）
 * @constant {Array<string>}
 */
var CRITICAL_CACHE_KEY_PATTERNS = [
  'cache',
  'index',
  'data',
  'config',
  'settings',
  'user',
  'token',
  'session',
  'preload',
  'offline',
  'audio',
  'image',
  'resource'
];

/**
 * 版本管理器使用模式
 * @constant {Object}
 */
var VERSION_MANAGER_PATTERNS = {
  IMPORT: /(?:var|const|let)\s+\w*[Vv]ersion[Mm]anager\w*\s*=\s*require\s*\(\s*['"][^'"]*version-manager[^'"]*['"]\s*\)/,
  GET_VERSIONED_KEY: /[Vv]ersion[Mm]anager\.getVersionedKey\s*\(/g,
  GET_ENV_SCOPED_KEY: /[Vv]ersion[Mm]anager\.getEnvScopedKey\s*\(/g,
  GET_VERSIONED_PATH: /[Vv]ersion[Mm]anager\.getVersionedPath\s*\(/g
};

/**
 * 存储配额监控模式
 * @constant {Object}
 */
var QUOTA_MONITORING_PATTERNS = {
  GET_STORAGE_INFO: /wx\.getStorageInfo(?:Sync)?\s*\(/,
  CURRENT_SIZE_CHECK: /currentSize/,
  LIMIT_SIZE_CHECK: /limitSize/,
  STORAGE_USAGE_PERCENT: /(?:currentSize\s*\/\s*limitSize|storageUsage|usagePercent)/
};

/**
 * 缓存模式分析器
 * @namespace CacheAnalyzer
 */
var CacheAnalyzer = {
  /**
   * 存储API模式
   */
  STORAGE_API_PATTERNS: STORAGE_API_PATTERNS,

  /**
   * 关键缓存Key模式
   */
  CRITICAL_CACHE_KEY_PATTERNS: CRITICAL_CACHE_KEY_PATTERNS,

  /**
   * 版本管理器模式
   */
  VERSION_MANAGER_PATTERNS: VERSION_MANAGER_PATTERNS,


  /**
   * 检查version-manager.js使用情况
   * 验证关键数据是否使用版本化缓存Key
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} 版本管理器使用分析结果
   *
   * @example
   * var result = CacheAnalyzer.checkVersionManagerUsage({ fileSystem: fs, files: jsFiles });
   * console.log('使用版本化Key的文件:', result.filesWithVersionedKeys);
   * console.log('问题:', result.issues);
   */
  checkVersionManagerUsage: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      filesWithVersionManager: [],
      filesWithVersionedKeys: [],
      filesWithStorageButNoVersioning: [],
      versionedKeyUsageCount: 0,
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileVersionManagerUsage(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeFileResult(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileVersionManagerUsage(filePath, code);
            result.filesAnalyzed++;
            this._mergeFileResult(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateVersionManagerRecommendations(result);

    } catch (error) {
      console.error('❌ version-manager使用检查失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的version-manager使用情况
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileVersionManagerUsage: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      hasVersionManagerImport: false,
      hasVersionedKeyUsage: false,
      hasStorageOperations: false,
      hasCriticalCacheKeys: false,
      versionedKeyCount: 0,
      storageOperations: [],
      criticalCacheKeys: [],
      issues: []
    };

    // 检查是否导入了version-manager
    fileResult.hasVersionManagerImport = VERSION_MANAGER_PATTERNS.IMPORT.test(code);

    // 检查是否使用了getVersionedKey
    var versionedKeyMatches = code.match(VERSION_MANAGER_PATTERNS.GET_VERSIONED_KEY);
    if (versionedKeyMatches) {
      fileResult.hasVersionedKeyUsage = true;
      fileResult.versionedKeyCount = versionedKeyMatches.length;
    }

    // 检查是否使用了getEnvScopedKey
    var envScopedKeyMatches = code.match(VERSION_MANAGER_PATTERNS.GET_ENV_SCOPED_KEY);
    if (envScopedKeyMatches) {
      fileResult.hasVersionedKeyUsage = true;
      fileResult.versionedKeyCount += envScopedKeyMatches.length;
    }

    // 检查存储操作
    fileResult.storageOperations = this._detectStorageOperations(code, filePath);
    fileResult.hasStorageOperations = fileResult.storageOperations.length > 0;

    // 检查是否有关键缓存Key
    fileResult.criticalCacheKeys = this._detectCriticalCacheKeys(code, filePath);
    fileResult.hasCriticalCacheKeys = fileResult.criticalCacheKeys.length > 0;

    // 生成问题
    if (fileResult.hasStorageOperations && fileResult.hasCriticalCacheKeys && !fileResult.hasVersionedKeyUsage) {
      fileResult.issues.push(AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: 'cache_not_versioned',
        file: filePath,
        description: '文件使用了存储操作和关键缓存Key，但未使用version-manager进行版本化',
        suggestion: '导入version-manager.js并使用getVersionedKey()包装缓存Key，确保版本升级时数据一致性'
      }));
    }

    return fileResult;
  },

  /**
   * 检测存储操作
   * @private
   */
  _detectStorageOperations: function(code, filePath) {
    var operations = [];
    var lines = code.split('\n');

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      // 检测同步存储操作
      if (/wx\.(?:get|set|remove|clear)StorageSync\s*\(/.test(line)) {
        operations.push({
          line: lineNum + 1,
          code: line.trim(),
          type: 'sync',
          file: filePath
        });
      }

      // 检测异步存储操作
      if (/wx\.(?:get|set|remove|clear)Storage\s*\(/.test(line) &&
          !/wx\.(?:get|set|remove|clear)StorageSync/.test(line)) {
        operations.push({
          line: lineNum + 1,
          code: line.trim(),
          type: 'async',
          file: filePath
        });
      }
    }

    return operations;
  },

  /**
   * 检测关键缓存Key
   * @private
   */
  _detectCriticalCacheKeys: function(code, filePath) {
    var criticalKeys = [];
    var lines = code.split('\n');

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      // 检测存储操作中的Key
      var storageKeyMatch = line.match(/wx\.(?:get|set|remove)Storage(?:Sync)?\s*\(\s*['"]([^'"]+)['"]/);
      if (storageKeyMatch) {
        var key = storageKeyMatch[1];
        // 检查是否是关键缓存Key
        for (var i = 0; i < CRITICAL_CACHE_KEY_PATTERNS.length; i++) {
          if (key.toLowerCase().indexOf(CRITICAL_CACHE_KEY_PATTERNS[i]) !== -1) {
            criticalKeys.push({
              key: key,
              line: lineNum + 1,
              code: line.trim(),
              pattern: CRITICAL_CACHE_KEY_PATTERNS[i],
              file: filePath
            });
            break;
          }
        }
      }

      // 检测对象形式的存储操作
      var objectStorageMatch = line.match(/wx\.(?:get|set|remove)Storage\s*\(\s*\{/);
      if (objectStorageMatch) {
        // 尝试提取key字段
        var keyFieldMatch = code.substring(code.indexOf(line)).match(/key\s*:\s*['"]([^'"]+)['"]/);
        if (keyFieldMatch) {
          var key = keyFieldMatch[1];
          for (var j = 0; j < CRITICAL_CACHE_KEY_PATTERNS.length; j++) {
            if (key.toLowerCase().indexOf(CRITICAL_CACHE_KEY_PATTERNS[j]) !== -1) {
              criticalKeys.push({
                key: key,
                line: lineNum + 1,
                code: line.trim(),
                pattern: CRITICAL_CACHE_KEY_PATTERNS[j],
                file: filePath
              });
              break;
            }
          }
        }
      }
    }

    return criticalKeys;
  },

  /**
   * 合并文件分析结果
   * @private
   */
  _mergeFileResult: function(result, fileResult) {
    if (fileResult.hasVersionManagerImport) {
      result.filesWithVersionManager.push(fileResult.filePath);
    }

    if (fileResult.hasVersionedKeyUsage) {
      result.filesWithVersionedKeys.push(fileResult.filePath);
      result.versionedKeyUsageCount += fileResult.versionedKeyCount;
    }

    if (fileResult.hasStorageOperations && !fileResult.hasVersionedKeyUsage) {
      result.filesWithStorageButNoVersioning.push(fileResult.filePath);
    }

    result.issues = result.issues.concat(fileResult.issues);
  },

  /**
   * 生成版本管理器使用建议
   * @private
   */
  _generateVersionManagerRecommendations: function(result) {
    var recommendations = [];

    if (result.filesWithStorageButNoVersioning.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '使用版本化缓存Key',
        description: '发现 ' + result.filesWithStorageButNoVersioning.length +
          ' 个文件使用了存储操作但未使用版本化Key。建议导入version-manager.js并使用getVersionedKey()包装缓存Key。',
        files: result.filesWithStorageButNoVersioning
      });
    }

    if (result.versionedKeyUsageCount > 0) {
      recommendations.push({
        priority: 'info',
        title: '版本化Key使用良好',
        description: '项目中有 ' + result.versionedKeyUsageCount + ' 处使用了版本化缓存Key，这是良好的实践。'
      });
    }

    return recommendations;
  },


  /**
   * 检测同步存储操作
   * 识别可以转换为异步的同步存储操作
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} 同步存储操作分析结果
   *
   * @example
   * var result = CacheAnalyzer.detectSyncStorageOperations({ code: jsCode, filePath: 'app.js' });
   * console.log('同步操作数:', result.syncOperationCount);
   * console.log('可转换为异步的操作:', result.convertibleOperations);
   */
  detectSyncStorageOperations: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      syncOperationCount: 0,
      asyncOperationCount: 0,
      syncOperations: [],
      convertibleOperations: [],
      acceptableSyncOperations: [],
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileSyncOperations(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeSyncOperationResult(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileSyncOperations(filePath, code);
            result.filesAnalyzed++;
            this._mergeSyncOperationResult(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateSyncOperationRecommendations(result);

    } catch (error) {
      console.error('❌ 同步存储操作检测失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的同步存储操作
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileSyncOperations: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      syncOperations: [],
      asyncOperations: [],
      convertibleOperations: [],
      acceptableSyncOperations: [],
      issues: []
    };

    var lines = code.split('\n');

    // 跟踪当前函数上下文
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
          if (functionStack.length > 0 &&
              braceCount <= functionStack[functionStack.length - 1].braceCount) {
            functionStack.pop();
            currentFunction = functionStack.length > 0 ?
              functionStack[functionStack.length - 1].name : null;
          }
        }
      }

      // 检测同步存储操作
      var syncOp = this._detectSyncStorageOperation(line, lineNum, currentFunction, filePath);
      if (syncOp) {
        fileResult.syncOperations.push(syncOp);

        // 判断是否可转换为异步
        if (this._isSyncOperationConvertible(syncOp, currentFunction)) {
          fileResult.convertibleOperations.push(syncOp);

          // 创建问题记录
          fileResult.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.MINOR,
            type: AuditConfig.AuditIssueType.SYNC_STORAGE_OPERATION,
            file: filePath,
            line: syncOp.line,
            description: '同步存储操作 ' + syncOp.api + ' 可能阻塞主线程',
            suggestion: '建议转换为异步操作 ' + syncOp.asyncAlternative + '，使用Promise或async/await处理'
          }));
        } else {
          fileResult.acceptableSyncOperations.push(syncOp);
        }
      }

      // 检测异步存储操作
      var asyncOp = this._detectAsyncStorageOperation(line, lineNum, filePath);
      if (asyncOp) {
        fileResult.asyncOperations.push(asyncOp);
      }
    }

    return fileResult;
  },

  /**
   * 检测函数定义
   * @private
   */
  _detectFunctionDefinition: function(line) {
    var patterns = [
      /function\s+(\w+)\s*\(/,
      /(\w+)\s*:\s*function\s*\(/,
      /^\s*(\w+)\s*\([^)]*\)\s*\{/,
      /(onLoad|onShow|onReady|onHide|onUnload|onLaunch|onError)\s*[:(]/
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
   * 检测同步存储操作
   * @private
   */
  _detectSyncStorageOperation: function(line, lineNum, currentFunction, filePath) {
    var syncApis = [
      { pattern: /wx\.getStorageSync\s*\(/, api: 'wx.getStorageSync', asyncAlt: 'wx.getStorage' },
      { pattern: /wx\.setStorageSync\s*\(/, api: 'wx.setStorageSync', asyncAlt: 'wx.setStorage' },
      { pattern: /wx\.removeStorageSync\s*\(/, api: 'wx.removeStorageSync', asyncAlt: 'wx.removeStorage' },
      { pattern: /wx\.clearStorageSync\s*\(/, api: 'wx.clearStorageSync', asyncAlt: 'wx.clearStorage' },
      { pattern: /wx\.getStorageInfoSync\s*\(/, api: 'wx.getStorageInfoSync', asyncAlt: 'wx.getStorageInfo' }
    ];

    for (var i = 0; i < syncApis.length; i++) {
      if (syncApis[i].pattern.test(line)) {
        // 尝试提取存储Key
        var keyMatch = line.match(/wx\.\w+Sync\s*\(\s*['"]([^'"]+)['"]/);
        var storageKey = keyMatch ? keyMatch[1] : null;

        return {
          api: syncApis[i].api,
          asyncAlternative: syncApis[i].asyncAlt,
          line: lineNum + 1,
          code: line.trim(),
          function: currentFunction,
          storageKey: storageKey,
          file: filePath
        };
      }
    }

    return null;
  },

  /**
   * 检测异步存储操作
   * @private
   */
  _detectAsyncStorageOperation: function(line, lineNum, filePath) {
    var asyncApis = [
      { pattern: /wx\.getStorage\s*\(/, api: 'wx.getStorage' },
      { pattern: /wx\.setStorage\s*\(/, api: 'wx.setStorage' },
      { pattern: /wx\.removeStorage\s*\(/, api: 'wx.removeStorage' },
      { pattern: /wx\.clearStorage\s*\(/, api: 'wx.clearStorage' },
      { pattern: /wx\.getStorageInfo\s*\(/, api: 'wx.getStorageInfo' }
    ];

    for (var i = 0; i < asyncApis.length; i++) {
      // 确保不是同步版本
      if (asyncApis[i].pattern.test(line) && !/Sync\s*\(/.test(line)) {
        return {
          api: asyncApis[i].api,
          line: lineNum + 1,
          code: line.trim(),
          file: filePath
        };
      }
    }

    return null;
  },

  /**
   * 判断同步操作是否可转换为异步
   * @private
   */
  _isSyncOperationConvertible: function(syncOp, currentFunction) {
    // 在onLaunch中的同步操作通常是必要的（启动时需要立即读取配置）
    if (currentFunction === 'onLaunch') {
      return false;
    }

    // 在onLoad中的同步操作可能是必要的（页面初始化）
    // 但仍建议转换为异步
    if (currentFunction === 'onLoad') {
      return true; // 仍然建议转换，但优先级较低
    }

    // 其他情况都建议转换为异步
    return true;
  },

  /**
   * 合并同步操作分析结果
   * @private
   */
  _mergeSyncOperationResult: function(result, fileResult) {
    result.syncOperationCount += fileResult.syncOperations.length;
    result.asyncOperationCount += fileResult.asyncOperations.length;
    result.syncOperations = result.syncOperations.concat(fileResult.syncOperations);
    result.convertibleOperations = result.convertibleOperations.concat(fileResult.convertibleOperations);
    result.acceptableSyncOperations = result.acceptableSyncOperations.concat(fileResult.acceptableSyncOperations);
    result.issues = result.issues.concat(fileResult.issues);
  },

  /**
   * 生成同步操作优化建议
   * @private
   */
  _generateSyncOperationRecommendations: function(result) {
    var recommendations = [];

    if (result.convertibleOperations.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: '转换同步存储操作为异步',
        description: '发现 ' + result.convertibleOperations.length +
          ' 个同步存储操作可以转换为异步操作，以避免阻塞主线程。',
        operations: result.convertibleOperations.slice(0, 10) // 最多显示10个
      });
    }

    if (result.acceptableSyncOperations.length > 0) {
      recommendations.push({
        priority: 'info',
        title: '可接受的同步存储操作',
        description: '发现 ' + result.acceptableSyncOperations.length +
          ' 个同步存储操作位于启动阶段（如onLaunch），这些操作通常是必要的。'
      });
    }

    var asyncRatio = result.asyncOperationCount /
      (result.syncOperationCount + result.asyncOperationCount || 1);
    if (asyncRatio > 0.7) {
      recommendations.push({
        priority: 'info',
        title: '异步操作使用良好',
        description: '项目中 ' + Math.round(asyncRatio * 100) + '% 的存储操作使用了异步API，这是良好的实践。'
      });
    }

    return recommendations;
  },


  /**
   * 检查存储配额监控
   * 验证是否实现了存储配额监控和清理机制
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} 存储配额监控分析结果
   *
   * @example
   * var result = CacheAnalyzer.checkStorageQuotaMonitoring({ fileSystem: fs, files: jsFiles });
   * console.log('是否有配额监控:', result.hasQuotaMonitoring);
   * console.log('是否有清理机制:', result.hasCleanupMechanism);
   */
  checkStorageQuotaMonitoring: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      hasQuotaMonitoring: false,
      hasCleanupMechanism: false,
      hasLRUStrategy: false,
      quotaMonitoringFiles: [],
      cleanupMechanismFiles: [],
      lruStrategyFiles: [],
      storageInfoUsage: [],
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileQuotaMonitoring(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeQuotaMonitoringResult(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileQuotaMonitoring(filePath, code);
            result.filesAnalyzed++;
            this._mergeQuotaMonitoringResult(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateQuotaMonitoringRecommendations(result);

      // 生成问题
      if (!result.hasQuotaMonitoring) {
        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.PERFORMANCE,
          severity: AuditConfig.AuditSeverity.MAJOR,
          type: 'missing_quota_monitoring',
          file: 'project',
          description: '项目未实现存储配额监控，可能导致存储空间耗尽时出现错误',
          suggestion: '建议使用wx.getStorageInfo监控存储使用情况，在占用率达到80%时触发清理逻辑'
        }));
      }

      if (!result.hasCleanupMechanism && result.hasQuotaMonitoring) {
        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.PERFORMANCE,
          severity: AuditConfig.AuditSeverity.MINOR,
          type: 'missing_cleanup_mechanism',
          file: 'project',
          description: '项目有存储配额监控但未实现清理机制',
          suggestion: '建议实现LRU或基于时间的缓存清理策略，在存储空间不足时自动清理旧数据'
        }));
      }

    } catch (error) {
      console.error('❌ 存储配额监控检查失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的存储配额监控
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileQuotaMonitoring: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      hasQuotaMonitoring: false,
      hasCleanupMechanism: false,
      hasLRUStrategy: false,
      storageInfoUsage: [],
      cleanupPatterns: [],
      lruPatterns: []
    };

    var lines = code.split('\n');

    // 检测存储信息获取
    var hasStorageInfo = QUOTA_MONITORING_PATTERNS.GET_STORAGE_INFO.test(code);
    var hasCurrentSizeCheck = QUOTA_MONITORING_PATTERNS.CURRENT_SIZE_CHECK.test(code);
    var hasLimitSizeCheck = QUOTA_MONITORING_PATTERNS.LIMIT_SIZE_CHECK.test(code);

    if (hasStorageInfo && (hasCurrentSizeCheck || hasLimitSizeCheck)) {
      fileResult.hasQuotaMonitoring = true;
    }

    // 检测清理机制
    var cleanupPatterns = [
      /removeStorage(?:Sync)?\s*\(/,
      /clearStorage(?:Sync)?\s*\(/,
      /cleanup|clean|clear|purge|evict/i,
      /删除|清理|清除/
    ];

    for (var i = 0; i < cleanupPatterns.length; i++) {
      if (cleanupPatterns[i].test(code)) {
        fileResult.hasCleanupMechanism = true;
        break;
      }
    }

    // 检测LRU策略
    var lruPatterns = [
      /LRU|lru/,
      /lastAccess|lastUsed|accessTime|useTime/i,
      /最近.*使用|最少.*使用/,
      /evict.*oldest|remove.*oldest/i
    ];

    for (var j = 0; j < lruPatterns.length; j++) {
      if (lruPatterns[j].test(code)) {
        fileResult.hasLRUStrategy = true;
        break;
      }
    }

    // 提取存储信息使用位置
    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      if (/wx\.getStorageInfo(?:Sync)?\s*\(/.test(line)) {
        fileResult.storageInfoUsage.push({
          line: lineNum + 1,
          code: line.trim(),
          file: filePath
        });
      }
    }

    return fileResult;
  },

  /**
   * 合并配额监控分析结果
   * @private
   */
  _mergeQuotaMonitoringResult: function(result, fileResult) {
    if (fileResult.hasQuotaMonitoring) {
      result.hasQuotaMonitoring = true;
      result.quotaMonitoringFiles.push(fileResult.filePath);
    }

    if (fileResult.hasCleanupMechanism) {
      result.hasCleanupMechanism = true;
      result.cleanupMechanismFiles.push(fileResult.filePath);
    }

    if (fileResult.hasLRUStrategy) {
      result.hasLRUStrategy = true;
      result.lruStrategyFiles.push(fileResult.filePath);
    }

    result.storageInfoUsage = result.storageInfoUsage.concat(fileResult.storageInfoUsage);
  },

  /**
   * 生成配额监控建议
   * @private
   */
  _generateQuotaMonitoringRecommendations: function(result) {
    var recommendations = [];

    if (!result.hasQuotaMonitoring) {
      recommendations.push({
        priority: 'high',
        title: '实现存储配额监控',
        description: '建议使用wx.getStorageInfo定期检查存储使用情况。' +
          '微信小程序存储限制为10MB，建议在占用率达到80%（约8MB）时触发清理逻辑。',
        code: this._generateQuotaMonitoringCode()
      });
    }

    if (!result.hasCleanupMechanism) {
      recommendations.push({
        priority: 'high',
        title: '实现缓存清理机制',
        description: '建议实现基于LRU（最近最少使用）的缓存清理策略，' +
          '在存储空间不足时自动清理旧数据，确保关键数据不丢失。',
        code: this._generateCleanupMechanismCode()
      });
    }

    if (!result.hasLRUStrategy && result.hasCleanupMechanism) {
      recommendations.push({
        priority: 'medium',
        title: '升级为LRU清理策略',
        description: '当前清理机制可能不够智能，建议升级为LRU策略，' +
          '记录每个缓存Key的最后访问时间，优先清理低频访问的数据。'
      });
    }

    if (result.hasQuotaMonitoring && result.hasCleanupMechanism) {
      recommendations.push({
        priority: 'info',
        title: '存储管理良好',
        description: '项目已实现存储配额监控和清理机制，这是良好的实践。'
      });
    }

    return recommendations;
  },

  /**
   * 生成配额监控示例代码
   * @private
   */
  _generateQuotaMonitoringCode: function() {
    return [
      '/**',
      ' * 检查存储配额使用情况',
      ' * @returns {Object} 存储使用信息',
      ' */',
      'function checkStorageQuota() {',
      '  try {',
      '    var info = wx.getStorageInfoSync();',
      '    var usagePercent = (info.currentSize / info.limitSize) * 100;',
      '    ',
      '    console.log("存储使用:", (info.currentSize / 1024).toFixed(2), "KB /",',
      '                (info.limitSize / 1024).toFixed(2), "KB",',
      '                "(" + usagePercent.toFixed(1) + "%)");',
      '    ',
      '    // 当使用率超过80%时触发清理',
      '    if (usagePercent > 80) {',
      '      console.warn("⚠️ 存储空间不足，触发清理...");',
      '      cleanupOldCache();',
      '    }',
      '    ',
      '    return {',
      '      currentSize: info.currentSize,',
      '      limitSize: info.limitSize,',
      '      usagePercent: usagePercent,',
      '      keys: info.keys',
      '    };',
      '  } catch (error) {',
      '    console.error("❌ 获取存储信息失败:", error);',
      '    return null;',
      '  }',
      '}'
    ].join('\n');
  },

  /**
   * 生成清理机制示例代码
   * @private
   */
  _generateCleanupMechanismCode: function() {
    return [
      '/**',
      ' * LRU缓存清理',
      ' * 清理最近最少使用的缓存数据',
      ' */',
      'function cleanupOldCache() {',
      '  try {',
      '    var info = wx.getStorageInfoSync();',
      '    var keys = info.keys || [];',
      '    ',
      '    // 获取缓存索引（记录每个Key的最后访问时间）',
      '    var cacheIndex = wx.getStorageSync("cache_access_index") || {};',
      '    ',
      '    // 按最后访问时间排序',
      '    var sortedKeys = keys',
      '      .filter(function(key) {',
      '        // 排除关键系统Key',
      '        return key.indexOf("cache_access_index") === -1;',
      '      })',
      '      .sort(function(a, b) {',
      '        var timeA = cacheIndex[a] || 0;',
      '        var timeB = cacheIndex[b] || 0;',
      '        return timeA - timeB; // 最旧的在前',
      '      });',
      '    ',
      '    // 清理最旧的20%数据',
      '    var cleanCount = Math.ceil(sortedKeys.length * 0.2);',
      '    for (var i = 0; i < cleanCount; i++) {',
      '      var key = sortedKeys[i];',
      '      wx.removeStorageSync(key);',
      '      delete cacheIndex[key];',
      '      console.log("🗑️ 清理缓存:", key);',
      '    }',
      '    ',
      '    // 更新索引',
      '    wx.setStorageSync("cache_access_index", cacheIndex);',
      '    console.log("✅ 清理完成，共清理", cleanCount, "个缓存");',
      '    ',
      '  } catch (error) {',
      '    console.error("❌ 缓存清理失败:", error);',
      '  }',
      '}'
    ].join('\n');
  },


  /**
   * 检查存储错误处理
   * 验证存储操作是否有适当的错误处理
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @param {string} [options.code] - 单个文件的代码（用于测试）
   * @param {string} [options.filePath] - 单个文件的路径（用于测试）
   * @returns {Object} 存储错误处理分析结果
   *
   * @example
   * var result = CacheAnalyzer.checkStorageErrorHandling({ code: jsCode, filePath: 'app.js' });
   * console.log('有错误处理的操作数:', result.operationsWithErrorHandling);
   * console.log('缺少错误处理的操作:', result.operationsWithoutErrorHandling);
   */
  checkStorageErrorHandling: function(options) {
    options = options || {};

    var result = {
      filesAnalyzed: 0,
      totalStorageOperations: 0,
      operationsWithErrorHandling: 0,
      operationsWithoutErrorHandling: 0,
      operationsWithTryCatch: [],
      operationsWithFailCallback: [],
      operationsWithoutHandling: [],
      issues: [],
      recommendations: []
    };

    try {
      // 单文件模式（用于测试）
      if (options.code && options.filePath) {
        var fileResult = this._analyzeFileStorageErrorHandling(
          options.filePath,
          options.code
        );
        result.filesAnalyzed = 1;
        this._mergeErrorHandlingResult(result, fileResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var filePath = options.files[i];
          try {
            var code = options.fileSystem.readFileSync(filePath, 'utf8');
            var fileResult = this._analyzeFileStorageErrorHandling(filePath, code);
            result.filesAnalyzed++;
            this._mergeErrorHandlingResult(result, fileResult);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', filePath, e.message);
          }
        }
      }

      // 生成建议
      result.recommendations = this._generateErrorHandlingRecommendations(result);

    } catch (error) {
      console.error('❌ 存储错误处理检查失败:', error);
    }

    return result;
  },

  /**
   * 分析单个文件的存储错误处理
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} code - 文件代码
   * @returns {Object} 文件分析结果
   */
  _analyzeFileStorageErrorHandling: function(filePath, code) {
    var fileResult = {
      filePath: filePath,
      operationsWithTryCatch: [],
      operationsWithFailCallback: [],
      operationsWithoutHandling: [],
      issues: []
    };

    var lines = code.split('\n');

    // 跟踪try-catch块
    var inTryCatch = false;
    var tryStartLine = -1;
    var braceCount = 0;
    var tryBraceCount = 0;

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      // 检测try块开始
      if (/\btry\s*\{/.test(line)) {
        inTryCatch = true;
        tryStartLine = lineNum;
        tryBraceCount = braceCount;
      }

      // 跟踪大括号
      for (var c = 0; c < line.length; c++) {
        if (line[c] === '{') braceCount++;
        if (line[c] === '}') {
          braceCount--;
          // 检查是否退出try-catch块
          if (inTryCatch && braceCount <= tryBraceCount) {
            // 检查是否有catch
            var nextLines = lines.slice(lineNum, lineNum + 3).join(' ');
            if (/\}\s*catch\s*\(/.test(nextLines)) {
              // 有catch块，继续
            } else {
              inTryCatch = false;
            }
          }
        }
      }

      // 检测catch块结束
      if (inTryCatch && /\}\s*(?:finally\s*\{|\s*$)/.test(line) && braceCount <= tryBraceCount) {
        inTryCatch = false;
      }

      // 检测同步存储操作
      var syncMatch = line.match(/wx\.(get|set|remove|clear)StorageSync\s*\(/);
      if (syncMatch) {
        var operation = {
          api: 'wx.' + syncMatch[1] + 'StorageSync',
          line: lineNum + 1,
          code: line.trim(),
          file: filePath
        };

        if (inTryCatch) {
          fileResult.operationsWithTryCatch.push(operation);
        } else {
          fileResult.operationsWithoutHandling.push(operation);

          // 创建问题记录
          fileResult.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.BUG,
            severity: AuditConfig.AuditSeverity.MINOR,
            type: 'storage_no_error_handling',
            file: filePath,
            line: lineNum + 1,
            description: '同步存储操作 ' + operation.api + ' 缺少try-catch错误处理',
            suggestion: '建议使用try-catch包装同步存储操作，或转换为异步操作并处理fail回调'
          }));
        }
      }

      // 检测异步存储操作
      var asyncMatch = line.match(/wx\.(get|set|remove|clear)Storage\s*\(\s*\{/);
      if (asyncMatch && !/Sync/.test(line)) {
        var operation = {
          api: 'wx.' + asyncMatch[1] + 'Storage',
          line: lineNum + 1,
          code: line.trim(),
          file: filePath
        };

        // 检查是否有fail回调
        var contextCode = lines.slice(lineNum, Math.min(lineNum + 10, lines.length)).join('\n');
        var hasFailCallback = /fail\s*:\s*function|fail\s*\(|\.catch\s*\(/.test(contextCode);

        if (hasFailCallback) {
          fileResult.operationsWithFailCallback.push(operation);
        } else {
          fileResult.operationsWithoutHandling.push(operation);

          // 创建问题记录
          fileResult.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.BUG,
            severity: AuditConfig.AuditSeverity.MINOR,
            type: 'storage_no_error_handling',
            file: filePath,
            line: lineNum + 1,
            description: '异步存储操作 ' + operation.api + ' 缺少fail回调或catch处理',
            suggestion: '建议添加fail回调处理存储操作失败的情况，确保数据不丢失'
          }));
        }
      }
    }

    return fileResult;
  },

  /**
   * 合并错误处理分析结果
   * @private
   */
  _mergeErrorHandlingResult: function(result, fileResult) {
    result.operationsWithTryCatch = result.operationsWithTryCatch.concat(fileResult.operationsWithTryCatch);
    result.operationsWithFailCallback = result.operationsWithFailCallback.concat(fileResult.operationsWithFailCallback);
    result.operationsWithoutHandling = result.operationsWithoutHandling.concat(fileResult.operationsWithoutHandling);
    result.issues = result.issues.concat(fileResult.issues);

    result.totalStorageOperations = result.operationsWithTryCatch.length +
      result.operationsWithFailCallback.length +
      result.operationsWithoutHandling.length;

    result.operationsWithErrorHandling = result.operationsWithTryCatch.length +
      result.operationsWithFailCallback.length;

    result.operationsWithoutErrorHandling = result.operationsWithoutHandling.length;
  },

  /**
   * 生成错误处理建议
   * @private
   */
  _generateErrorHandlingRecommendations: function(result) {
    var recommendations = [];

    if (result.operationsWithoutErrorHandling > 0) {
      var errorRate = result.operationsWithoutErrorHandling / result.totalStorageOperations;

      recommendations.push({
        priority: errorRate > 0.5 ? 'high' : 'medium',
        title: '添加存储操作错误处理',
        description: '发现 ' + result.operationsWithoutErrorHandling + ' 个存储操作缺少错误处理（占比 ' +
          Math.round(errorRate * 100) + '%）。存储操作可能因配额不足、权限问题等原因失败，' +
          '建议添加适当的错误处理以确保数据不丢失。',
        operations: result.operationsWithoutHandling.slice(0, 10)
      });
    }

    if (result.operationsWithErrorHandling > 0) {
      recommendations.push({
        priority: 'info',
        title: '错误处理覆盖良好',
        description: '项目中有 ' + result.operationsWithErrorHandling +
          ' 个存储操作已实现错误处理，这是良好的实践。'
      });
    }

    return recommendations;
  },


  /**
   * 综合扫描所有缓存模式
   * 执行完整的缓存模式分析
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的文件列表
   * @returns {Object} 综合分析结果
   *
   * @example
   * var result = CacheAnalyzer.scanAll({ fileSystem: fs, files: jsFiles });
   * console.log('版本管理:', result.versionManager);
   * console.log('同步操作:', result.syncOperations);
   * console.log('配额监控:', result.quotaMonitoring);
   * console.log('错误处理:', result.errorHandling);
   */
  scanAll: function(options) {
    options = options || {};

    var result = {
      timestamp: new Date().toISOString(),
      filesAnalyzed: 0,
      versionManager: null,
      syncOperations: null,
      quotaMonitoring: null,
      errorHandling: null,
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
      result.versionManager = this.checkVersionManagerUsage(options);
      result.syncOperations = this.detectSyncStorageOperations(options);
      result.quotaMonitoring = this.checkStorageQuotaMonitoring(options);
      result.errorHandling = this.checkStorageErrorHandling(options);

      // 汇总文件数
      result.filesAnalyzed = Math.max(
        result.versionManager.filesAnalyzed,
        result.syncOperations.filesAnalyzed,
        result.quotaMonitoring.filesAnalyzed,
        result.errorHandling.filesAnalyzed
      );

      // 汇总所有问题
      result.allIssues = []
        .concat(result.versionManager.issues || [])
        .concat(result.syncOperations.issues || [])
        .concat(result.quotaMonitoring.issues || [])
        .concat(result.errorHandling.issues || []);

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
        .concat(result.versionManager.recommendations || [])
        .concat(result.syncOperations.recommendations || [])
        .concat(result.quotaMonitoring.recommendations || [])
        .concat(result.errorHandling.recommendations || []);

      // 按优先级排序建议
      result.allRecommendations.sort(function(a, b) {
        var priorityOrder = { high: 0, medium: 1, low: 2, info: 3 };
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
      });

    } catch (error) {
      console.error('❌ 综合缓存模式扫描失败:', error);
    }

    return result;
  },

  /**
   * 生成缓存分析报告
   * 生成可读的Markdown格式报告
   *
   * @param {Object} scanResult - scanAll的返回结果
   * @returns {string} Markdown格式的报告
   *
   * @example
   * var result = CacheAnalyzer.scanAll({ fileSystem: fs, files: jsFiles });
   * var report = CacheAnalyzer.generateReport(result);
   * console.log(report);
   */
  generateReport: function(scanResult) {
    if (!scanResult) {
      return '# 缓存模式分析报告\n\n无分析结果';
    }

    var lines = [
      '# 缓存模式分析报告',
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

    // 版本管理器使用情况
    if (scanResult.versionManager) {
      lines.push('## 🔐 版本管理器使用情况');
      lines.push('');
      lines.push('- 使用版本化Key的文件: ' + scanResult.versionManager.filesWithVersionedKeys.length);
      lines.push('- 版本化Key使用次数: ' + scanResult.versionManager.versionedKeyUsageCount);
      lines.push('- 使用存储但未版本化的文件: ' + scanResult.versionManager.filesWithStorageButNoVersioning.length);
      lines.push('');

      if (scanResult.versionManager.filesWithStorageButNoVersioning.length > 0) {
        lines.push('**需要添加版本化Key的文件:**');
        for (var i = 0; i < Math.min(10, scanResult.versionManager.filesWithStorageButNoVersioning.length); i++) {
          lines.push('- `' + scanResult.versionManager.filesWithStorageButNoVersioning[i] + '`');
        }
        lines.push('');
      }
    }

    // 同步操作情况
    if (scanResult.syncOperations) {
      lines.push('## ⚡ 同步存储操作');
      lines.push('');
      lines.push('- 同步操作数: ' + scanResult.syncOperations.syncOperationCount);
      lines.push('- 异步操作数: ' + scanResult.syncOperations.asyncOperationCount);
      lines.push('- 可转换为异步的操作: ' + scanResult.syncOperations.convertibleOperations.length);
      lines.push('');
    }

    // 配额监控情况
    if (scanResult.quotaMonitoring) {
      lines.push('## 📦 存储配额监控');
      lines.push('');
      lines.push('- 是否有配额监控: ' + (scanResult.quotaMonitoring.hasQuotaMonitoring ? '✅ 是' : '❌ 否'));
      lines.push('- 是否有清理机制: ' + (scanResult.quotaMonitoring.hasCleanupMechanism ? '✅ 是' : '❌ 否'));
      lines.push('- 是否有LRU策略: ' + (scanResult.quotaMonitoring.hasLRUStrategy ? '✅ 是' : '❌ 否'));
      lines.push('');
    }

    // 错误处理情况
    if (scanResult.errorHandling) {
      lines.push('## 🛡️ 错误处理');
      lines.push('');
      lines.push('- 总存储操作数: ' + scanResult.errorHandling.totalStorageOperations);
      lines.push('- 有错误处理的操作: ' + scanResult.errorHandling.operationsWithErrorHandling);
      lines.push('- 缺少错误处理的操作: ' + scanResult.errorHandling.operationsWithoutErrorHandling);
      lines.push('');
    }

    // 优化建议
    if (scanResult.allRecommendations && scanResult.allRecommendations.length > 0) {
      lines.push('## 💡 优化建议');
      lines.push('');

      for (var j = 0; j < scanResult.allRecommendations.length; j++) {
        var rec = scanResult.allRecommendations[j];
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

        if (rec.code) {
          lines.push('```javascript');
          lines.push(rec.code);
          lines.push('```');
          lines.push('');
        }
      }
    }

    // 问题详情
    if (scanResult.allIssues && scanResult.allIssues.length > 0) {
      lines.push('## 📋 问题详情');
      lines.push('');

      for (var k = 0; k < Math.min(20, scanResult.allIssues.length); k++) {
        var issue = scanResult.allIssues[k];
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
module.exports = CacheAnalyzer;
