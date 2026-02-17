'use strict';

/**
 * 📊 审计报告生成器
 *
 * 汇总所有审计工具的结果，生成综合性审计报告
 * 计算性能评分、UI评分、稳定性评分，生成优化建议优先级列表
 *
 * @module report-generator
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 综合审计报告生成
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 评分体系采用分层指标：用户感知层(40%)、服务健康层(30%)、资源效率层(20%)、稳定性(10%)
 * - 本项目采用：性能(70%)、UI(30%)的权重分配
 * - 引入"单项一票否决制"：关键问题可强制降低总分上限
 * - 报告结构：执行摘要、代码质量、安全合规、性能优化、AI增强建议
 * - 修复方案必须可量化、可追溯
 *
 * @example
 * var ReportGenerator = require('./report-generator.js');
 * var report = ReportGenerator.runFullAudit({ fileSystem: fs });
 * var markdown = ReportGenerator.generateMarkdownReport(report);
 * var json = ReportGenerator.generateJSONReport(report);
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

// 导入所有审计工具
var StartupAnalyzer = require('./startup-analyzer.js');
var SetDataOptimizer = require('./setdata-optimizer.js');
var ListOptimizer = require('./list-optimizer.js');
var MemoryGuard = require('./memory-guard.js');
var SubpackageAnalyzer = require('./subpackage-analyzer.js');
var ImageAnalyzer = require('./image-analyzer.js');
var StyleAuditor = require('./style-auditor.js');
var LoadingStateDetector = require('./loading-state-detector.js');
var AudioBugDetector = require('./audio-bug-detector.js');
var CacheAnalyzer = require('./cache-analyzer.js');
var ErrorHandlerAnalyzer = require('./error-handler-analyzer.js');
var CodeQualityAnalyzer = require('./code-quality-analyzer.js');

/**
 * 评分权重配置
 * @constant {Object}
 */
var SCORE_WEIGHTS = {
  // 总体权重（性能70%，UI30%）
  PERFORMANCE: 0.7,
  UI: 0.3,

  // 性能评分子权重
  PERFORMANCE_SUB: {
    STARTUP: 0.25,        // 启动性能
    SETDATA: 0.25,        // setData优化
    MEMORY: 0.20,         // 内存管理
    SUBPACKAGE: 0.15,     // 分包配置
    IMAGE: 0.15           // 图片资源
  },

  // UI评分子权重
  UI_SUB: {
    STYLE: 0.40,          // 样式一致性
    ACCESSIBILITY: 0.30,  // 无障碍设计
    LOADING: 0.30         // 加载状态
  },

  // 稳定性评分子权重
  STABILITY_SUB: {
    AUDIO: 0.30,          // 音频管理
    CACHE: 0.25,          // 缓存模式
    ERROR: 0.25,          // 错误处理
    CODE_QUALITY: 0.20    // 代码质量
  }
};

/**
 * 问题严重程度扣分规则
 * @constant {Object}
 */
var SEVERITY_DEDUCTIONS = {
  critical: 20,   // 严重问题：-20分/个
  major: 10,      // 主要问题：-10分/个
  minor: 3,       // 次要问题：-3分/个
  info: 1         // 提示信息：-1分/个
};

/**
 * 一票否决规则（触发后强制降低评分上限）
 * @constant {Object}
 */
var VETO_RULES = {
  // 主包超过2MB：总分上限60
  MAIN_PACKAGE_EXCEEDED: { maxScore: 60, description: '主包体积超过2MB限制' },
  // 存在严重内存泄漏：总分上限70
  CRITICAL_MEMORY_LEAK: { maxScore: 70, description: '存在严重内存泄漏风险' },
  // 音频单例未实现：总分上限75
  AUDIO_NOT_SINGLETON: { maxScore: 75, description: '音频未使用单例模式' },
  // 分包超过2MB：总分上限65
  SUBPACKAGE_EXCEEDED: { maxScore: 65, description: '分包体积超过2MB限制' }
};

/**
 * 优先级排序权重
 * @constant {Object}
 */
var PRIORITY_WEIGHTS = {
  // 严重程度权重
  SEVERITY: {
    critical: 100,
    major: 50,
    minor: 20,
    info: 5
  },
  // 影响类型权重
  IMPACT: {
    performance: 1.5,   // 性能问题优先
    stability: 1.3,     // 稳定性问题次之
    ui: 1.0             // UI问题最后
  },
  // 修复难度权重（快速修复优先）
  EFFORT: {
    autoFixable: 2.0,   // 可自动修复
    quick: 1.5,         // 快速修复（<1小时）
    medium: 1.0,        // 中等难度（1-4小时）
    complex: 0.5        // 复杂修复（>4小时）
  }
};

/**
 * 审计报告生成器
 * @namespace ReportGenerator
 */
var ReportGenerator = {
  /**
   * 评分权重配置
   */
  SCORE_WEIGHTS: SCORE_WEIGHTS,

  /**
   * 严重程度扣分规则
   */
  SEVERITY_DEDUCTIONS: SEVERITY_DEDUCTIONS,

  /**
   * 一票否决规则
   */
  VETO_RULES: VETO_RULES,

  /**
   * 优先级权重
   */
  PRIORITY_WEIGHTS: PRIORITY_WEIGHTS,


  /**
   * 运行完整审计
   * 执行所有审计工具并收集结果
   *
   * @param {Object} options - 审计选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要审计的文件列表
   * @param {string} [options.projectName] - 项目名称
   * @param {string} [options.version] - 项目版本
   * @param {boolean} [options.skipAnalyzers] - 跳过某些分析器（用于测试）
   * @returns {Object} 完整的审计报告
   *
   * @example
   * var report = ReportGenerator.runFullAudit({
   *   fileSystem: fs,
   *   projectName: '飞行工具箱',
   *   version: '2.13.4'
   * });
   */
  runFullAudit: function(options) {
    options = options || {};
    var startTime = Date.now();

    // 创建报告
    var report = AuditReport.createReport({
      projectName: options.projectName || '飞行工具箱',
      version: options.version || 'unknown'
    });

    // 初始化审计结果收集器
    var auditResults = {
      startup: null,
      setData: null,
      list: null,
      memory: null,
      subpackage: null,
      image: null,
      style: null,
      loading: null,
      audio: null,
      cache: null,
      errorHandler: null,
      codeQuality: null
    };

    // 初始化一票否决标记
    var vetoFlags = [];

    try {
      // 1. 启动性能分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.startup) {
        auditResults.startup = this._runStartupAnalysis(options, report, vetoFlags);
      }

      // 2. setData性能分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.setData) {
        auditResults.setData = this._runSetDataAnalysis(options, report);
      }

      // 3. 长列表分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.list) {
        auditResults.list = this._runListAnalysis(options, report);
      }

      // 4. 内存管理分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.memory) {
        auditResults.memory = this._runMemoryAnalysis(options, report, vetoFlags);
      }

      // 5. 分包配置分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.subpackage) {
        auditResults.subpackage = this._runSubpackageAnalysis(options, report, vetoFlags);
      }

      // 6. 图片资源分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.image) {
        auditResults.image = this._runImageAnalysis(options, report);
      }

      // 7. 样式一致性分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.style) {
        auditResults.style = this._runStyleAnalysis(options, report);
      }

      // 8. 加载状态分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.loading) {
        auditResults.loading = this._runLoadingAnalysis(options, report);
      }

      // 9. 音频Bug分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.audio) {
        auditResults.audio = this._runAudioAnalysis(options, report, vetoFlags);
      }

      // 10. 缓存模式分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.cache) {
        auditResults.cache = this._runCacheAnalysis(options, report);
      }

      // 11. 错误处理分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.errorHandler) {
        auditResults.errorHandler = this._runErrorHandlerAnalysis(options, report);
      }

      // 12. 代码质量分析
      if (!options.skipAnalyzers || !options.skipAnalyzers.codeQuality) {
        auditResults.codeQuality = this._runCodeQualityAnalysis(options, report);
      }

    } catch (error) {
      console.error('❌ 审计过程出错:', error);
      // 记录错误但继续生成报告
      report.metadata.errors = report.metadata.errors || [];
      report.metadata.errors.push({
        phase: 'analysis',
        message: error.message || String(error)
      });
    }

    // 计算各项评分
    var scores = this.calculateAllScores(report, auditResults, vetoFlags);
    report.summary.performanceScore = scores.performance;
    report.summary.uiScore = scores.ui;
    report.summary.stabilityScore = scores.stability;
    report.summary.overallScore = scores.overall;

    // 生成优化建议优先级列表
    report.recommendations = this.generatePriorityList(report);

    // 更新元数据
    var endTime = Date.now();
    AuditReport.updateMetadata(report, {
      auditDuration: endTime - startTime,
      vetoFlags: vetoFlags,
      auditResults: auditResults
    });

    // 完成报告
    return AuditReport.finalizeReport(report);
  },


  /**
   * 运行启动性能分析
   * @private
   */
  _runStartupAnalysis: function(options, report, vetoFlags) {
    var result = { issues: [], metrics: {} };

    try {
      // 分析主包体积
      if (typeof StartupAnalyzer.analyzeMainPackageSize === 'function') {
        var sizeAnalysis = StartupAnalyzer.analyzeMainPackageSize(options);
        result.metrics.mainPackageSize = sizeAnalysis;

        // 检查是否超过限制
        if (sizeAnalysis && sizeAnalysis.exceedsLimit) {
          vetoFlags.push(VETO_RULES.MAIN_PACKAGE_EXCEEDED);
          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.CRITICAL,
            type: AuditConfig.AuditIssueType.MAIN_PACKAGE_SIZE,
            file: 'miniprogram/',
            description: '主包体积超过2MB限制，当前: ' + this._formatSize(sizeAnalysis.totalSize),
            suggestion: '将非核心模块迁移到分包，使用lazyCodeLoading按需加载'
          }));
        } else if (sizeAnalysis && sizeAnalysis.exceedsRecommended) {
          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.MAJOR,
            type: AuditConfig.AuditIssueType.MAIN_PACKAGE_SIZE,
            file: 'miniprogram/',
            description: '主包体积超过1.5MB建议值，当前: ' + this._formatSize(sizeAnalysis.totalSize),
            suggestion: '考虑将部分工具模块迁移到分包以优化启动速度'
          }));
        }
      }

      // 分析可迁移模块
      if (typeof StartupAnalyzer.identifyMovableModules === 'function') {
        var movableModules = StartupAnalyzer.identifyMovableModules(options);
        result.metrics.movableModules = movableModules;

        if (movableModules && movableModules.length > 0) {
          for (var i = 0; i < Math.min(movableModules.length, 5); i++) {
            var module = movableModules[i];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.PERFORMANCE,
              severity: AuditConfig.AuditSeverity.MINOR,
              type: AuditConfig.AuditIssueType.MAIN_PACKAGE_SIZE,
              file: module.path || module.module,
              description: '模块可迁移到分包: ' + (module.module || module.path),
              suggestion: '将此模块迁移到 ' + (module.targetPackage || '合适的分包')
            }));
          }
        }
      }

      // 分析同步操作
      if (typeof StartupAnalyzer.analyzeSyncOperations === 'function') {
        var syncOps = StartupAnalyzer.analyzeSyncOperations(options);
        result.metrics.syncOperations = syncOps;

        if (syncOps && syncOps.length > 0) {
          for (var j = 0; j < syncOps.length; j++) {
            var op = syncOps[j];
            if (op.deferrable) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.PERFORMANCE,
                severity: AuditConfig.AuditSeverity.MINOR,
                type: 'sync_operation_deferrable',
                file: op.location || 'app.ts',
                line: op.line,
                description: '同步操作可延迟执行: ' + op.operation,
                suggestion: '将此操作移至首屏渲染后执行，或使用异步方式'
              }));
            }
          }
        }
      }

      // 添加问题到报告
      for (var k = 0; k < result.issues.length; k++) {
        AuditReport.addIssueToReport(report, result.issues[k]);
      }

    } catch (error) {
      console.error('❌ 启动性能分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },


  /**
   * 运行setData性能分析
   * @private
   */
  _runSetDataAnalysis: function(options, report) {
    var result = { issues: [], metrics: {} };

    try {
      // 扫描setData调用
      if (typeof SetDataOptimizer.scanSetDataCalls === 'function') {
        var calls = SetDataOptimizer.scanSetDataCalls(options);
        result.metrics.setDataCalls = calls;

        if (calls && calls.length > 0) {
          for (var i = 0; i < calls.length; i++) {
            var call = calls[i];
            if (call.issues && call.issues.length > 0) {
              for (var j = 0; j < call.issues.length; j++) {
                var issue = call.issues[j];
                result.issues.push(AuditReport.createIssue({
                  category: AuditConfig.AuditCategory.PERFORMANCE,
                  severity: issue.severity || AuditConfig.AuditSeverity.MAJOR,
                  type: issue.type || AuditConfig.AuditIssueType.SETDATA_LARGE_PAYLOAD,
                  file: call.file,
                  line: call.line,
                  description: issue.description || 'setData性能问题',
                  suggestion: issue.suggestion || '优化setData调用'
                }));
              }
            }
          }
        }
      }

      // 检测可批量合并的调用
      if (typeof SetDataOptimizer.detectBatchableCalls === 'function' && options.files) {
        for (var k = 0; k < options.files.length; k++) {
          var filePath = options.files[k];
          var batchable = SetDataOptimizer.detectBatchableCalls(filePath, options.code);
          if (batchable && batchable.length > 0) {
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.PERFORMANCE,
              severity: AuditConfig.AuditSeverity.MINOR,
              type: AuditConfig.AuditIssueType.SETDATA_FREQUENT_CALLS,
              file: filePath,
              description: '发现 ' + batchable.length + ' 组可合并的setData调用',
              suggestion: '将50ms内的多次setData合并为一次调用'
            }));
          }
        }
      }

      // 添加问题到报告
      for (var m = 0; m < result.issues.length; m++) {
        AuditReport.addIssueToReport(report, result.issues[m]);
      }

    } catch (error) {
      console.error('❌ setData性能分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },

  /**
   * 运行长列表分析
   * @private
   */
  _runListAnalysis: function(options, report) {
    var result = { issues: [], metrics: {} };

    try {
      // 扫描长列表场景
      if (typeof ListOptimizer.scanLongLists === 'function') {
        var longLists = ListOptimizer.scanLongLists(options);
        result.metrics.longLists = longLists;

        if (longLists && longLists.length > 0) {
          for (var i = 0; i < longLists.length; i++) {
            var list = longLists[i];
            if (!list.hasVirtualList && list.estimatedItems > 100) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.PERFORMANCE,
                severity: AuditConfig.AuditSeverity.MAJOR,
                type: AuditConfig.AuditIssueType.LONG_LIST_NO_VIRTUAL,
                file: list.page,
                description: '长列表(' + list.estimatedItems + '项)未使用虚拟列表: ' + list.listName,
                suggestion: '使用recycle-view或IntersectionObserver实现虚拟列表'
              }));
            } else if (!list.hasVirtualList && list.estimatedItems > 50) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.PERFORMANCE,
                severity: AuditConfig.AuditSeverity.MINOR,
                type: AuditConfig.AuditIssueType.LONG_LIST_NO_VIRTUAL,
                file: list.page,
                description: '列表(' + list.estimatedItems + '项)建议使用分页或虚拟列表: ' + list.listName,
                suggestion: '考虑实现分页加载或虚拟列表优化'
              }));
            }
          }
        }
      }

      // 添加问题到报告
      for (var j = 0; j < result.issues.length; j++) {
        AuditReport.addIssueToReport(report, result.issues[j]);
      }

    } catch (error) {
      console.error('❌ 长列表分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },


  /**
   * 运行内存管理分析
   * @private
   */
  _runMemoryAnalysis: function(options, report, vetoFlags) {
    var result = { issues: [], metrics: {} };

    try {
      // 扫描定时器使用
      if (typeof MemoryGuard.scanTimerUsage === 'function') {
        var timerIssues = MemoryGuard.scanTimerUsage(options);
        result.metrics.timerIssues = timerIssues;

        if (timerIssues && timerIssues.length > 0) {
          var unclearedTimers = timerIssues.filter(function(t) { return !t.hasCleanup; });
          if (unclearedTimers.length > 5) {
            vetoFlags.push(VETO_RULES.CRITICAL_MEMORY_LEAK);
          }

          for (var i = 0; i < timerIssues.length; i++) {
            var timer = timerIssues[i];
            if (!timer.hasCleanup) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.PERFORMANCE,
                severity: AuditConfig.AuditSeverity.MAJOR,
                type: AuditConfig.AuditIssueType.TIMER_NOT_CLEARED,
                file: timer.file || options.filePath,
                line: timer.line,
                description: '定时器未在onUnload中清理: ' + (timer.type || 'timer'),
                suggestion: '在onUnload中调用clearTimeout/clearInterval并置null'
              }));
            }
          }
        }
      }

      // 扫描事件监听器
      if (typeof MemoryGuard.scanEventListeners === 'function') {
        var listenerIssues = MemoryGuard.scanEventListeners(options);
        result.metrics.listenerIssues = listenerIssues;

        if (listenerIssues && listenerIssues.length > 0) {
          for (var j = 0; j < listenerIssues.length; j++) {
            var listener = listenerIssues[j];
            if (!listener.hasUnbind) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.PERFORMANCE,
                severity: AuditConfig.AuditSeverity.MAJOR,
                type: AuditConfig.AuditIssueType.LISTENER_NOT_REMOVED,
                file: listener.file || options.filePath,
                line: listener.line,
                description: '事件监听器未移除: wx.' + listener.eventType,
                suggestion: '在onUnload中调用wx.' + (MemoryGuard.WX_EVENT_APIS[listener.eventType] || 'off' + listener.eventType.slice(2))
              }));
            }
          }
        }
      }

      // 扫描音频实例
      if (typeof MemoryGuard.scanAudioInstances === 'function') {
        var audioIssues = MemoryGuard.scanAudioInstances(options);
        result.metrics.audioIssues = audioIssues;

        if (audioIssues && audioIssues.length > 0) {
          for (var k = 0; k < audioIssues.length; k++) {
            var audio = audioIssues[k];
            if (!audio.hasDestroy) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.PERFORMANCE,
                severity: AuditConfig.AuditSeverity.MAJOR,
                type: AuditConfig.AuditIssueType.AUDIO_NOT_DESTROYED,
                file: audio.file || options.filePath,
                line: audio.line,
                description: '音频实例未销毁: ' + (audio.instanceName || 'audioContext'),
                suggestion: '在onUnload中调用audioContext.stop()和audioContext.destroy()'
              }));
            }
          }
        }
      }

      // 添加问题到报告
      for (var m = 0; m < result.issues.length; m++) {
        AuditReport.addIssueToReport(report, result.issues[m]);
      }

    } catch (error) {
      console.error('❌ 内存管理分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },


  /**
   * 运行分包配置分析
   * @private
   */
  _runSubpackageAnalysis: function(options, report, vetoFlags) {
    var result = { issues: [], metrics: {} };

    try {
      // 分析分包体积
      if (typeof SubpackageAnalyzer.analyzePackageSizes === 'function') {
        var sizeAnalysis = SubpackageAnalyzer.analyzePackageSizes(options);
        result.metrics.packageSizes = sizeAnalysis;

        if (sizeAnalysis && sizeAnalysis.subpackages) {
          for (var i = 0; i < sizeAnalysis.subpackages.length; i++) {
            var pkg = sizeAnalysis.subpackages[i];
            if (pkg.exceedsLimit) {
              vetoFlags.push(VETO_RULES.SUBPACKAGE_EXCEEDED);
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.PERFORMANCE,
                severity: AuditConfig.AuditSeverity.CRITICAL,
                type: AuditConfig.AuditIssueType.SUBPACKAGE_SIZE,
                file: pkg.name,
                description: '分包体积超过2MB限制: ' + pkg.name + ' (' + this._formatSize(pkg.size) + ')',
                suggestion: '拆分分包或移除不必要的资源文件'
              }));
            }
          }
        }
      }

      // 分析预下载配置
      if (typeof SubpackageAnalyzer.analyzePreloadRules === 'function') {
        var preloadAnalysis = SubpackageAnalyzer.analyzePreloadRules(options);
        result.metrics.preloadRules = preloadAnalysis;

        if (preloadAnalysis && preloadAnalysis.length > 0) {
          for (var j = 0; j < preloadAnalysis.length; j++) {
            var rule = preloadAnalysis[j];
            if (rule.exceedsQuota) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.PERFORMANCE,
                severity: AuditConfig.AuditSeverity.MAJOR,
                type: AuditConfig.AuditIssueType.PRELOAD_QUOTA_EXCEEDED,
                file: 'app.json',
                description: '页面 ' + rule.page + ' 预下载配置超过2MB额度',
                suggestion: '减少预下载分包数量或优化分包体积'
              }));
            }
          }
        }
      }

      // 检查占位页配置
      if (typeof SubpackageAnalyzer.checkPlaceholderPages === 'function') {
        var placeholderCheck = SubpackageAnalyzer.checkPlaceholderPages(options);
        result.metrics.placeholderPages = placeholderCheck;

        if (placeholderCheck && placeholderCheck.length > 0) {
          for (var k = 0; k < placeholderCheck.length; k++) {
            var placeholder = placeholderCheck[k];
            if (!placeholder.hasPlaceholder) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.BUG,
                severity: AuditConfig.AuditSeverity.MINOR,
                type: 'missing_placeholder_page',
                file: placeholder.package,
                description: '分包缺少占位页: ' + placeholder.package,
                suggestion: '添加占位页用于真机调试模式下的分包加载兜底'
              }));
            }
          }
        }
      }

      // 添加问题到报告
      for (var m = 0; m < result.issues.length; m++) {
        AuditReport.addIssueToReport(report, result.issues[m]);
      }

    } catch (error) {
      console.error('❌ 分包配置分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },

  /**
   * 运行图片资源分析
   * @private
   */
  _runImageAnalysis: function(options, report) {
    var result = { issues: [], metrics: {} };

    try {
      // 扫描图片文件
      if (typeof ImageAnalyzer.scanImageFiles === 'function') {
        var imageAnalysis = ImageAnalyzer.scanImageFiles(options);
        result.metrics.imageFiles = imageAnalysis;

        if (imageAnalysis && imageAnalysis.oversizedImages) {
          for (var i = 0; i < imageAnalysis.oversizedImages.length; i++) {
            var img = imageAnalysis.oversizedImages[i];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.PERFORMANCE,
              severity: img.size > 200 * 1024 ? AuditConfig.AuditSeverity.MAJOR : AuditConfig.AuditSeverity.MINOR,
              type: AuditConfig.AuditIssueType.IMAGE_TOO_LARGE,
              file: img.path,
              description: '图片体积过大: ' + this._formatSize(img.size),
              suggestion: '压缩图片或转换为WebP格式'
            }));
          }
        }

        if (imageAnalysis && imageAnalysis.wrongFormatImages) {
          for (var j = 0; j < imageAnalysis.wrongFormatImages.length; j++) {
            var wrongImg = imageAnalysis.wrongFormatImages[j];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.PERFORMANCE,
              severity: AuditConfig.AuditSeverity.INFO,
              type: AuditConfig.AuditIssueType.IMAGE_WRONG_FORMAT,
              file: wrongImg.path,
              description: '图片格式不推荐: ' + wrongImg.format,
              suggestion: '转换为WebP格式可减少约30%体积'
            }));
          }
        }
      }

      // 检测重复图片
      if (typeof ImageAnalyzer.detectDuplicateImages === 'function') {
        var duplicates = ImageAnalyzer.detectDuplicateImages(options);
        result.metrics.duplicateImages = duplicates;

        if (duplicates && duplicates.length > 0) {
          for (var k = 0; k < duplicates.length; k++) {
            var dup = duplicates[k];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.PERFORMANCE,
              severity: AuditConfig.AuditSeverity.MINOR,
              type: AuditConfig.AuditIssueType.IMAGE_DUPLICATE,
              file: dup.files ? dup.files[0] : 'unknown',
              description: '发现重复图片，共 ' + (dup.count || dup.files.length) + ' 处',
              suggestion: '将重复图片移至共享目录或使用CDN'
            }));
          }
        }
      }

      // 添加问题到报告
      for (var m = 0; m < result.issues.length; m++) {
        AuditReport.addIssueToReport(report, result.issues[m]);
      }

    } catch (error) {
      console.error('❌ 图片资源分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },


  /**
   * 运行样式一致性分析
   * @private
   */
  _runStyleAnalysis: function(options, report) {
    var result = { issues: [], metrics: {} };

    try {
      // 检查Vant组件使用
      if (typeof StyleAuditor.checkVantUsage === 'function') {
        var vantUsage = StyleAuditor.checkVantUsage(options);
        result.metrics.vantUsage = vantUsage;

        if (vantUsage && vantUsage.issues) {
          for (var i = 0; i < vantUsage.issues.length; i++) {
            var issue = vantUsage.issues[i];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.UI,
              severity: AuditConfig.AuditSeverity.MINOR,
              type: AuditConfig.AuditIssueType.VANT_USAGE_INCONSISTENT,
              file: issue.file || options.filePath,
              description: issue.description || 'Vant组件使用不一致',
              suggestion: issue.suggestion || '使用Vant组件替代自定义组件'
            }));
          }
        }
      }

      // 检查设计规范遵循
      if (typeof StyleAuditor.checkDesignSystem === 'function') {
        var designCheck = StyleAuditor.checkDesignSystem(options);
        result.metrics.designSystem = designCheck;

        if (designCheck && designCheck.length > 0) {
          for (var j = 0; j < designCheck.length; j++) {
            var violation = designCheck[j];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.UI,
              severity: violation.severity || AuditConfig.AuditSeverity.MINOR,
              type: AuditConfig.AuditIssueType.STYLE_INCONSISTENT,
              file: violation.file,
              description: violation.property + ': ' + violation.value + ' (期望: ' + violation.expected + ')',
              suggestion: '使用设计系统规范值: ' + violation.expected
            }));
          }
        }
      }

      // 检查颜色对比度
      if (typeof StyleAuditor.checkColorContrast === 'function') {
        var contrastCheck = StyleAuditor.checkColorContrast(options);
        result.metrics.colorContrast = contrastCheck;

        if (contrastCheck && contrastCheck.length > 0) {
          for (var k = 0; k < contrastCheck.length; k++) {
            var contrast = contrastCheck[k];
            if (contrast.ratio < 4.5) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.ACCESSIBILITY,
                severity: contrast.ratio < 3 ? AuditConfig.AuditSeverity.MAJOR : AuditConfig.AuditSeverity.MINOR,
                type: AuditConfig.AuditIssueType.COLOR_LOW_CONTRAST,
                file: contrast.file,
                description: '颜色对比度不足: ' + contrast.ratio.toFixed(2) + ':1 (WCAG AA要求4.5:1)',
                suggestion: '调整前景色或背景色以提高对比度'
              }));
            }
          }
        }
      }

      // 检查触摸目标大小
      if (typeof StyleAuditor.checkTouchTargets === 'function') {
        var touchCheck = StyleAuditor.checkTouchTargets(options);
        result.metrics.touchTargets = touchCheck;

        if (touchCheck && touchCheck.length > 0) {
          for (var m = 0; m < touchCheck.length; m++) {
            var touch = touchCheck[m];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.ACCESSIBILITY,
              severity: AuditConfig.AuditSeverity.MINOR,
              type: AuditConfig.AuditIssueType.TOUCH_TARGET_TOO_SMALL,
              file: touch.file,
              description: '触摸目标过小: ' + touch.size + ' (最小要求88rpx)',
              suggestion: '增加元素尺寸或添加padding至少88rpx'
            }));
          }
        }
      }

      // 添加问题到报告
      for (var n = 0; n < result.issues.length; n++) {
        AuditReport.addIssueToReport(report, result.issues[n]);
      }

    } catch (error) {
      console.error('❌ 样式一致性分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },

  /**
   * 运行加载状态分析
   * @private
   */
  _runLoadingAnalysis: function(options, report) {
    var result = { issues: [], metrics: {} };

    try {
      // 扫描异步操作
      if (typeof LoadingStateDetector.scanAsyncOperations === 'function') {
        var asyncOps = LoadingStateDetector.scanAsyncOperations(options);
        result.metrics.asyncOperations = asyncOps;

        if (asyncOps && asyncOps.length > 0) {
          for (var i = 0; i < asyncOps.length; i++) {
            var op = asyncOps[i];
            if (!op.hasLoadingState) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.UI,
                severity: AuditConfig.AuditSeverity.MINOR,
                type: AuditConfig.AuditIssueType.MISSING_LOADING_STATE,
                file: op.file || options.filePath,
                line: op.line,
                description: '异步操作缺少加载状态: ' + (op.name || op.type),
                suggestion: '在异步操作前设置loading状态，完成后清除'
              }));
            }
            if (!op.hasErrorState) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.UI,
                severity: AuditConfig.AuditSeverity.MINOR,
                type: AuditConfig.AuditIssueType.MISSING_ERROR_STATE,
                file: op.file || options.filePath,
                line: op.line,
                description: '异步操作缺少错误处理: ' + (op.name || op.type),
                suggestion: '添加fail回调或catch处理，显示用户友好的错误提示'
              }));
            }
          }
        }
      }

      // 添加问题到报告
      for (var j = 0; j < result.issues.length; j++) {
        AuditReport.addIssueToReport(report, result.issues[j]);
      }

    } catch (error) {
      console.error('❌ 加载状态分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },


  /**
   * 运行音频Bug分析
   * @private
   */
  _runAudioAnalysis: function(options, report, vetoFlags) {
    var result = { issues: [], metrics: {} };

    try {
      // 检查单例模式
      if (typeof AudioBugDetector.checkSingletonPattern === 'function') {
        var singletonCheck = AudioBugDetector.checkSingletonPattern(options);
        result.metrics.singletonPattern = singletonCheck;

        if (singletonCheck && singletonCheck.length > 0) {
          var hasNonSingleton = singletonCheck.some(function(s) { return !s.isSingleton; });
          if (hasNonSingleton) {
            vetoFlags.push(VETO_RULES.AUDIO_NOT_SINGLETON);
          }

          for (var i = 0; i < singletonCheck.length; i++) {
            var singleton = singletonCheck[i];
            if (!singleton.isSingleton) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.BUG,
                severity: AuditConfig.AuditSeverity.MAJOR,
                type: AuditConfig.AuditIssueType.AUDIO_NOT_SINGLETON,
                file: singleton.file || options.filePath,
                description: '音频实例未使用单例模式',
                suggestion: '使用单例模式管理InnerAudioContext，避免重复创建'
              }));
            }
          }
        }
      }

      // 检查iOS兼容性
      if (typeof AudioBugDetector.checkiOSCompatibility === 'function') {
        var iosCheck = AudioBugDetector.checkiOSCompatibility(options);
        result.metrics.iosCompatibility = iosCheck;

        if (iosCheck && !iosCheck.obeyMuteSwitch) {
          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.BUG,
            severity: AuditConfig.AuditSeverity.MAJOR,
            type: AuditConfig.AuditIssueType.AUDIO_IOS_MUTE_SWITCH,
            file: options.filePath || 'audio-related',
            description: 'iOS静音模式配置缺失或错误',
            suggestion: '设置obeyMuteSwitch: false以在iOS静音模式下播放音频'
          }));
        }

        if (iosCheck && iosCheck.issues) {
          for (var j = 0; j < iosCheck.issues.length; j++) {
            var iosIssue = iosCheck.issues[j];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.BUG,
              severity: iosIssue.severity || AuditConfig.AuditSeverity.MINOR,
              type: 'audio_ios_issue',
              file: iosIssue.file || options.filePath,
              description: iosIssue.description,
              suggestion: iosIssue.suggestion
            }));
          }
        }
      }

      // 检查状态管理
      if (typeof AudioBugDetector.checkStateManagement === 'function') {
        var stateCheck = AudioBugDetector.checkStateManagement(options);
        result.metrics.stateManagement = stateCheck;

        if (stateCheck && stateCheck.length > 0) {
          for (var k = 0; k < stateCheck.length; k++) {
            var state = stateCheck[k];
            if (state.raceCondition) {
              result.issues.push(AuditReport.createIssue({
                category: AuditConfig.AuditCategory.BUG,
                severity: AuditConfig.AuditSeverity.MAJOR,
                type: AuditConfig.AuditIssueType.AUDIO_RACE_CONDITION,
                file: state.file || options.filePath,
                description: '音频状态管理存在竞态条件',
                suggestion: state.suggestion || '使用状态锁或Promise链确保操作顺序'
              }));
            }
          }
        }
      }

      // 添加问题到报告
      for (var m = 0; m < result.issues.length; m++) {
        AuditReport.addIssueToReport(report, result.issues[m]);
      }

    } catch (error) {
      console.error('❌ 音频Bug分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },

  /**
   * 运行缓存模式分析
   * @private
   */
  _runCacheAnalysis: function(options, report) {
    var result = { issues: [], metrics: {} };

    try {
      // 检查版本管理器使用
      if (typeof CacheAnalyzer.checkVersionManagerUsage === 'function') {
        var versionCheck = CacheAnalyzer.checkVersionManagerUsage(options);
        result.metrics.versionManagerUsage = versionCheck;

        if (versionCheck && versionCheck.issues) {
          for (var i = 0; i < versionCheck.issues.length; i++) {
            var issue = versionCheck.issues[i];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.BUG,
              severity: AuditConfig.AuditSeverity.MINOR,
              type: 'cache_not_versioned',
              file: issue.file,
              description: '缓存Key未使用版本管理: ' + issue.key,
              suggestion: '使用VersionManager.getVersionedKey()管理缓存Key'
            }));
          }
        }
      }

      // 检测同步存储操作
      if (typeof CacheAnalyzer.detectSyncStorageOperations === 'function') {
        var syncOps = CacheAnalyzer.detectSyncStorageOperations(options);
        result.metrics.syncStorageOperations = syncOps;

        if (syncOps && syncOps.length > 0) {
          for (var j = 0; j < syncOps.length; j++) {
            var syncOp = syncOps[j];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.PERFORMANCE,
              severity: AuditConfig.AuditSeverity.INFO,
              type: AuditConfig.AuditIssueType.SYNC_STORAGE_OPERATION,
              file: syncOp.file || options.filePath,
              line: syncOp.line,
              description: '使用同步存储操作: ' + syncOp.operation,
              suggestion: '考虑使用异步版本wx.getStorage/wx.setStorage'
            }));
          }
        }
      }

      // 添加问题到报告
      for (var k = 0; k < result.issues.length; k++) {
        AuditReport.addIssueToReport(report, result.issues[k]);
      }

    } catch (error) {
      console.error('❌ 缓存模式分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },


  /**
   * 运行错误处理分析
   * @private
   */
  _runErrorHandlerAnalysis: function(options, report) {
    var result = { issues: [], metrics: {} };

    try {
      // 检查错误处理器使用
      if (typeof ErrorHandlerAnalyzer.checkErrorHandlerUsage === 'function') {
        var handlerCheck = ErrorHandlerAnalyzer.checkErrorHandlerUsage(options);
        result.metrics.errorHandlerUsage = handlerCheck;

        if (handlerCheck && handlerCheck.issues) {
          for (var i = 0; i < handlerCheck.issues.length; i++) {
            var issue = handlerCheck.issues[i];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.CODE_QUALITY,
              severity: AuditConfig.AuditSeverity.MINOR,
              type: AuditConfig.AuditIssueType.MISSING_ERROR_HANDLER,
              file: issue.file,
              description: '页面未使用统一错误处理器',
              suggestion: '导入并使用error-handler.js进行错误处理'
            }));
          }
        }
      }

      // 检测空catch块
      if (typeof ErrorHandlerAnalyzer.detectEmptyCatchBlocks === 'function') {
        var emptyCatches = ErrorHandlerAnalyzer.detectEmptyCatchBlocks(options);
        result.metrics.emptyCatchBlocks = emptyCatches;

        if (emptyCatches && emptyCatches.length > 0) {
          for (var j = 0; j < emptyCatches.length; j++) {
            var emptyCatch = emptyCatches[j];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.CODE_QUALITY,
              severity: AuditConfig.AuditSeverity.MAJOR,
              type: AuditConfig.AuditIssueType.EMPTY_CATCH_BLOCK,
              file: emptyCatch.file || options.filePath,
              line: emptyCatch.line,
              description: '空catch块会吞掉错误',
              suggestion: '在catch块中记录错误或重新抛出'
            }));
          }
        }
      }

      // 检查console.error上下文
      if (typeof ErrorHandlerAnalyzer.checkConsoleErrorContext === 'function') {
        var contextCheck = ErrorHandlerAnalyzer.checkConsoleErrorContext(options);
        result.metrics.consoleErrorContext = contextCheck;

        if (contextCheck && contextCheck.issues) {
          for (var k = 0; k < contextCheck.issues.length; k++) {
            var contextIssue = contextCheck.issues[k];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.CODE_QUALITY,
              severity: AuditConfig.AuditSeverity.INFO,
              type: 'console_error_no_context',
              file: contextIssue.file || options.filePath,
              line: contextIssue.line,
              description: 'console.error缺少上下文信息',
              suggestion: '添加文件名、函数名、相关数据等上下文信息'
            }));
          }
        }
      }

      // 添加问题到报告
      for (var m = 0; m < result.issues.length; m++) {
        AuditReport.addIssueToReport(report, result.issues[m]);
      }

    } catch (error) {
      console.error('❌ 错误处理分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },

  /**
   * 运行代码质量分析
   * @private
   */
  _runCodeQualityAnalysis: function(options, report) {
    var result = { issues: [], metrics: {} };

    try {
      // 检查BasePage使用
      if (typeof CodeQualityAnalyzer.checkBasePageUsage === 'function') {
        var basePageCheck = CodeQualityAnalyzer.checkBasePageUsage(options);
        result.metrics.basePageUsage = basePageCheck;

        if (basePageCheck && basePageCheck.issues) {
          for (var i = 0; i < basePageCheck.issues.length; i++) {
            var issue = basePageCheck.issues[i];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.CODE_QUALITY,
              severity: AuditConfig.AuditSeverity.MINOR,
              type: AuditConfig.AuditIssueType.NOT_USING_BASEPAGE,
              file: issue.file,
              description: '页面未使用BasePage基类',
              suggestion: '使用BasePage.create()创建页面以获得统一的生命周期管理'
            }));
          }
        }
      }

      // 检查ES5合规性
      if (typeof CodeQualityAnalyzer.checkES5Compliance === 'function') {
        var es5Check = CodeQualityAnalyzer.checkES5Compliance(options);
        result.metrics.es5Compliance = es5Check;

        if (es5Check && es5Check.length > 0) {
          for (var j = 0; j < es5Check.length; j++) {
            var violation = es5Check[j];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.CODE_QUALITY,
              severity: AuditConfig.AuditSeverity.MAJOR,
              type: AuditConfig.AuditIssueType.ES5_VIOLATION,
              file: violation.file || options.filePath,
              line: violation.line,
              description: 'ES5违规: ' + violation.type + ' - ' + violation.code,
              suggestion: '使用ES5语法替代: ' + (violation.suggestion || '参考ES5规范')
            }));
          }
        }
      }

      // 检测未使用的imports
      if (typeof CodeQualityAnalyzer.detectUnusedImports === 'function') {
        var unusedImports = CodeQualityAnalyzer.detectUnusedImports(options);
        result.metrics.unusedImports = unusedImports;

        if (unusedImports && unusedImports.length > 0) {
          for (var k = 0; k < unusedImports.length; k++) {
            var unused = unusedImports[k];
            result.issues.push(AuditReport.createIssue({
              category: AuditConfig.AuditCategory.CODE_QUALITY,
              severity: AuditConfig.AuditSeverity.INFO,
              type: AuditConfig.AuditIssueType.UNUSED_IMPORT,
              file: unused.file || options.filePath,
              line: unused.line,
              description: '未使用的导入: ' + unused.name,
              suggestion: '移除未使用的require语句'
            }));
          }
        }
      }

      // 添加问题到报告
      for (var m = 0; m < result.issues.length; m++) {
        AuditReport.addIssueToReport(report, result.issues[m]);
      }

    } catch (error) {
      console.error('❌ 代码质量分析出错:', error);
      result.error = error.message || String(error);
    }

    return result;
  },


  /**
   * 计算所有评分
   *
   * @param {Object} report - 审计报告
   * @param {Object} auditResults - 各审计工具的结果
   * @param {Array} vetoFlags - 一票否决标记
   * @returns {Object} 包含各项评分的对象
   */
  calculateAllScores: function(report, auditResults, vetoFlags) {
    var performanceScore = this.calculatePerformanceScore(report, auditResults);
    var uiScore = this.calculateUIScore(report, auditResults);
    var stabilityScore = this.calculateStabilityScore(report, auditResults);
    var overallScore = this.calculateOverallScore(performanceScore, uiScore, stabilityScore);

    // 应用一票否决规则
    if (vetoFlags && vetoFlags.length > 0) {
      var minMaxScore = 100;
      for (var i = 0; i < vetoFlags.length; i++) {
        if (vetoFlags[i].maxScore < minMaxScore) {
          minMaxScore = vetoFlags[i].maxScore;
        }
      }
      if (overallScore > minMaxScore) {
        overallScore = minMaxScore;
      }
    }

    return {
      performance: performanceScore,
      ui: uiScore,
      stability: stabilityScore,
      overall: overallScore
    };
  },

  /**
   * 计算性能评分 (0-100)
   *
   * @param {Object} report - 审计报告
   * @param {Object} auditResults - 各审计工具的结果
   * @returns {number} 性能评分
   */
  calculatePerformanceScore: function(report, auditResults) {
    var baseScore = 100;
    var deductions = 0;

    // 从报告中筛选性能相关问题
    var performanceIssues = AuditReport.filterIssuesByCategory(report, AuditConfig.AuditCategory.PERFORMANCE);

    // 计算扣分
    for (var i = 0; i < performanceIssues.length; i++) {
      var issue = performanceIssues[i];
      deductions += SEVERITY_DEDUCTIONS[issue.severity] || 0;
    }

    // 子维度加权（如果有详细指标）
    if (auditResults) {
      // 启动性能
      if (auditResults.startup && auditResults.startup.metrics) {
        var startupMetrics = auditResults.startup.metrics;
        if (startupMetrics.mainPackageSize && startupMetrics.mainPackageSize.exceedsRecommended) {
          deductions += 5; // 额外扣分
        }
      }

      // setData性能
      if (auditResults.setData && auditResults.setData.metrics) {
        var setDataMetrics = auditResults.setData.metrics;
        if (setDataMetrics.setDataCalls && setDataMetrics.setDataCalls.length > 50) {
          deductions += 3; // 大量setData调用
        }
      }

      // 长列表
      if (auditResults.list && auditResults.list.metrics) {
        var listMetrics = auditResults.list.metrics;
        if (listMetrics.longLists) {
          var unoptimizedLists = listMetrics.longLists.filter(function(l) {
            return !l.hasVirtualList && l.estimatedItems > 100;
          });
          deductions += unoptimizedLists.length * 5;
        }
      }
    }

    return Math.max(0, Math.min(100, baseScore - deductions));
  },

  /**
   * 计算UI评分 (0-100)
   *
   * @param {Object} report - 审计报告
   * @param {Object} auditResults - 各审计工具的结果
   * @returns {number} UI评分
   */
  calculateUIScore: function(report, auditResults) {
    var baseScore = 100;
    var deductions = 0;

    // 从报告中筛选UI相关问题
    var uiIssues = AuditReport.filterIssuesByCategory(report, AuditConfig.AuditCategory.UI);
    var accessibilityIssues = AuditReport.filterIssuesByCategory(report, AuditConfig.AuditCategory.ACCESSIBILITY);

    // 计算UI问题扣分
    for (var i = 0; i < uiIssues.length; i++) {
      var issue = uiIssues[i];
      deductions += SEVERITY_DEDUCTIONS[issue.severity] || 0;
    }

    // 计算无障碍问题扣分
    for (var j = 0; j < accessibilityIssues.length; j++) {
      var accIssue = accessibilityIssues[j];
      deductions += SEVERITY_DEDUCTIONS[accIssue.severity] || 0;
    }

    // 子维度加权
    if (auditResults) {
      // 样式一致性
      if (auditResults.style && auditResults.style.metrics) {
        var styleMetrics = auditResults.style.metrics;
        if (styleMetrics.designSystem && styleMetrics.designSystem.length > 20) {
          deductions += 5; // 大量样式不一致
        }
      }

      // 加载状态
      if (auditResults.loading && auditResults.loading.metrics) {
        var loadingMetrics = auditResults.loading.metrics;
        if (loadingMetrics.asyncOperations) {
          var missingLoading = loadingMetrics.asyncOperations.filter(function(op) {
            return !op.hasLoadingState;
          });
          if (missingLoading.length > 10) {
            deductions += 5;
          }
        }
      }
    }

    return Math.max(0, Math.min(100, baseScore - deductions));
  },

  /**
   * 计算稳定性评分 (0-100)
   *
   * @param {Object} report - 审计报告
   * @param {Object} auditResults - 各审计工具的结果
   * @returns {number} 稳定性评分
   */
  calculateStabilityScore: function(report, auditResults) {
    var baseScore = 100;
    var deductions = 0;

    // 从报告中筛选Bug和代码质量问题
    var bugIssues = AuditReport.filterIssuesByCategory(report, AuditConfig.AuditCategory.BUG);
    var codeQualityIssues = AuditReport.filterIssuesByCategory(report, AuditConfig.AuditCategory.CODE_QUALITY);

    // 计算Bug问题扣分（权重更高）
    for (var i = 0; i < bugIssues.length; i++) {
      var bugIssue = bugIssues[i];
      deductions += (SEVERITY_DEDUCTIONS[bugIssue.severity] || 0) * 1.5;
    }

    // 计算代码质量问题扣分
    for (var j = 0; j < codeQualityIssues.length; j++) {
      var cqIssue = codeQualityIssues[j];
      deductions += SEVERITY_DEDUCTIONS[cqIssue.severity] || 0;
    }

    // 子维度加权
    if (auditResults) {
      // 音频问题
      if (auditResults.audio && auditResults.audio.metrics) {
        var audioMetrics = auditResults.audio.metrics;
        if (audioMetrics.singletonPattern) {
          var nonSingleton = audioMetrics.singletonPattern.filter(function(s) {
            return !s.isSingleton;
          });
          deductions += nonSingleton.length * 10;
        }
      }

      // 内存问题
      if (auditResults.memory && auditResults.memory.metrics) {
        var memoryMetrics = auditResults.memory.metrics;
        if (memoryMetrics.timerIssues) {
          var unclearedTimers = memoryMetrics.timerIssues.filter(function(t) {
            return !t.hasCleanup;
          });
          deductions += unclearedTimers.length * 3;
        }
      }

      // 错误处理
      if (auditResults.errorHandler && auditResults.errorHandler.metrics) {
        var errorMetrics = auditResults.errorHandler.metrics;
        if (errorMetrics.emptyCatchBlocks && errorMetrics.emptyCatchBlocks.length > 5) {
          deductions += 10;
        }
      }
    }

    return Math.max(0, Math.min(100, baseScore - deductions));
  },

  /**
   * 计算综合评分 (0-100)
   * 性能70%权重，UI30%权重
   *
   * @param {number} performanceScore - 性能评分
   * @param {number} uiScore - UI评分
   * @param {number} stabilityScore - 稳定性评分（作为参考，不直接计入）
   * @returns {number} 综合评分
   */
  calculateOverallScore: function(performanceScore, uiScore, stabilityScore) {
    // 基础计算：性能70% + UI30%
    var baseOverall = Math.round(
      performanceScore * SCORE_WEIGHTS.PERFORMANCE +
      uiScore * SCORE_WEIGHTS.UI
    );

    // 稳定性作为调整因子（如果稳定性很低，会拉低总分）
    if (stabilityScore < 50) {
      baseOverall = Math.round(baseOverall * 0.9); // 稳定性差时降低10%
    } else if (stabilityScore < 70) {
      baseOverall = Math.round(baseOverall * 0.95); // 稳定性一般时降低5%
    }

    return Math.max(0, Math.min(100, baseOverall));
  },


  /**
   * 生成优化建议优先级列表
   *
   * 排序规则：
   * 1. 严重程度（critical > major > minor > info）
   * 2. 影响类型（performance > stability > ui）
   * 3. 修复难度（快速修复优先）
   *
   * @param {Object} report - 审计报告
   * @returns {Array} 排序后的优化建议列表
   */
  generatePriorityList: function(report) {
    var recommendations = [];
    var issueGroups = {};

    // 按类型分组问题
    for (var i = 0; i < report.issues.length; i++) {
      var issue = report.issues[i];
      var key = issue.type + '_' + issue.category;
      if (!issueGroups[key]) {
        issueGroups[key] = {
          type: issue.type,
          category: issue.category,
          severity: issue.severity,
          count: 0,
          issues: [],
          autoFixable: issue.autoFixable
        };
      }
      issueGroups[key].count++;
      issueGroups[key].issues.push(issue);
      // 取最高严重级别
      if (this._severityRank(issue.severity) > this._severityRank(issueGroups[key].severity)) {
        issueGroups[key].severity = issue.severity;
      }
    }

    // 转换为建议列表
    var groupKeys = Object.keys(issueGroups);
    for (var j = 0; j < groupKeys.length; j++) {
      var group = issueGroups[groupKeys[j]];
      var priority = this._calculatePriority(group);
      var effort = this._estimateEffort(group);

      recommendations.push({
        id: AuditReport.generateId(),
        title: this._generateRecommendationTitle(group),
        description: this._generateRecommendationDescription(group),
        priority: priority > 70 ? 'high' : (priority > 40 ? 'medium' : 'low'),
        priorityScore: priority,
        category: group.category,
        severity: group.severity,
        issueCount: group.count,
        effort: effort,
        estimatedImpact: this._estimateImpact(group),
        autoFixable: group.autoFixable,
        affectedFiles: this._getAffectedFiles(group.issues)
      });
    }

    // 按优先级排序
    recommendations.sort(function(a, b) {
      return b.priorityScore - a.priorityScore;
    });

    return recommendations;
  },

  /**
   * 计算问题优先级分数
   * @private
   */
  _calculatePriority: function(group) {
    var severityScore = PRIORITY_WEIGHTS.SEVERITY[group.severity] || 0;
    var impactMultiplier = 1;

    // 根据分类调整影响权重
    if (group.category === AuditConfig.AuditCategory.PERFORMANCE) {
      impactMultiplier = PRIORITY_WEIGHTS.IMPACT.performance;
    } else if (group.category === AuditConfig.AuditCategory.BUG) {
      impactMultiplier = PRIORITY_WEIGHTS.IMPACT.stability;
    } else {
      impactMultiplier = PRIORITY_WEIGHTS.IMPACT.ui;
    }

    // 根据修复难度调整
    var effortMultiplier = group.autoFixable ? PRIORITY_WEIGHTS.EFFORT.autoFixable : PRIORITY_WEIGHTS.EFFORT.medium;

    // 问题数量也影响优先级
    var countBonus = Math.min(group.count * 2, 20);

    return Math.round(severityScore * impactMultiplier * effortMultiplier + countBonus);
  },

  /**
   * 估算修复难度
   * @private
   */
  _estimateEffort: function(group) {
    if (group.autoFixable) {
      return 'quick';
    }

    // 根据问题类型估算
    var complexTypes = [
      AuditConfig.AuditIssueType.LONG_LIST_NO_VIRTUAL,
      AuditConfig.AuditIssueType.MAIN_PACKAGE_SIZE,
      AuditConfig.AuditIssueType.SUBPACKAGE_SIZE
    ];

    if (complexTypes.indexOf(group.type) !== -1) {
      return 'complex';
    }

    if (group.count > 10) {
      return 'medium';
    }

    return 'quick';
  },

  /**
   * 估算修复影响
   * @private
   */
  _estimateImpact: function(group) {
    var baseImpact = 0;

    switch (group.severity) {
      case AuditConfig.AuditSeverity.CRITICAL:
        baseImpact = 80;
        break;
      case AuditConfig.AuditSeverity.MAJOR:
        baseImpact = 50;
        break;
      case AuditConfig.AuditSeverity.MINOR:
        baseImpact = 20;
        break;
      default:
        baseImpact = 5;
    }

    // 性能问题影响更大
    if (group.category === AuditConfig.AuditCategory.PERFORMANCE) {
      baseImpact = Math.round(baseImpact * 1.3);
    }

    return Math.min(100, baseImpact + group.count);
  },

  /**
   * 生成建议标题
   * @private
   */
  _generateRecommendationTitle: function(group) {
    var titles = {
      'main_package_size': '优化主包体积',
      'subpackage_size': '优化分包体积',
      'preload_quota_exceeded': '调整预下载配置',
      'setdata_large_payload': '优化setData数据量',
      'setdata_frequent_calls': '合并频繁的setData调用',
      'setdata_unbound_data': '移除非绑定数据',
      'long_list_no_virtual': '实现虚拟列表',
      'timer_not_cleared': '清理未释放的定时器',
      'listener_not_removed': '移除未解绑的事件监听器',
      'audio_not_destroyed': '销毁音频实例',
      'audio_not_singleton': '实现音频单例模式',
      'audio_ios_mute_switch': '修复iOS静音模式问题',
      'image_too_large': '压缩过大的图片',
      'image_duplicate': '合并重复图片',
      'style_inconsistent': '统一样式规范',
      'color_low_contrast': '提高颜色对比度',
      'touch_target_too_small': '增大触摸目标',
      'missing_loading_state': '添加加载状态',
      'empty_catch_block': '完善错误处理',
      'not_using_basepage': '使用BasePage基类',
      'es5_violation': '修复ES5兼容性问题'
    };

    return titles[group.type] || '修复 ' + group.type + ' 问题';
  },

  /**
   * 生成建议描述
   * @private
   */
  _generateRecommendationDescription: function(group) {
    var count = group.count;
    var sample = group.issues[0];

    return '发现 ' + count + ' 处相关问题。' +
           (sample.suggestion ? ' 建议: ' + sample.suggestion : '');
  },

  /**
   * 获取受影响的文件列表
   * @private
   */
  _getAffectedFiles: function(issues) {
    var files = {};
    for (var i = 0; i < issues.length; i++) {
      if (issues[i].file) {
        files[issues[i].file] = true;
      }
    }
    return Object.keys(files).slice(0, 10); // 最多返回10个文件
  },

  /**
   * 严重级别排序
   * @private
   */
  _severityRank: function(severity) {
    var ranks = {
      'critical': 4,
      'major': 3,
      'minor': 2,
      'info': 1
    };
    return ranks[severity] || 0;
  },


  /**
   * 生成Markdown格式报告
   *
   * @param {Object} report - 审计报告对象
   * @returns {string} Markdown格式的报告
   */
  generateMarkdownReport: function(report) {
    if (!report) {
      return '# 审计报告\n\n无数据';
    }

    var lines = [];
    var timestamp = report.timestamp ? new Date(report.timestamp).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN');

    // 标题
    lines.push('# 🔍 飞行工具箱审计报告');
    lines.push('');
    lines.push('**项目**: ' + (report.projectName || '飞行工具箱'));
    lines.push('**版本**: ' + (report.version || 'unknown'));
    lines.push('**生成时间**: ' + timestamp);
    lines.push('');

    // 执行摘要
    lines.push('## 📊 执行摘要');
    lines.push('');
    lines.push('### 评分概览');
    lines.push('');
    lines.push('| 指标 | 评分 | 状态 |');
    lines.push('|------|------|------|');
    lines.push('| 综合评分 | **' + report.summary.overallScore + '/100** | ' + this._getScoreEmoji(report.summary.overallScore) + ' |');
    lines.push('| 性能评分 | ' + report.summary.performanceScore + '/100 | ' + this._getScoreEmoji(report.summary.performanceScore) + ' |');
    lines.push('| UI评分 | ' + report.summary.uiScore + '/100 | ' + this._getScoreEmoji(report.summary.uiScore) + ' |');
    lines.push('| 稳定性评分 | ' + report.summary.stabilityScore + '/100 | ' + this._getScoreEmoji(report.summary.stabilityScore) + ' |');
    lines.push('');

    // 问题统计
    lines.push('### 问题统计');
    lines.push('');
    lines.push('| 严重程度 | 数量 |');
    lines.push('|----------|------|');
    lines.push('| 🔴 严重 (Critical) | ' + report.summary.criticalCount + ' |');
    lines.push('| 🟠 主要 (Major) | ' + report.summary.majorCount + ' |');
    lines.push('| 🟡 次要 (Minor) | ' + report.summary.minorCount + ' |');
    lines.push('| 🔵 提示 (Info) | ' + report.summary.infoCount + ' |');
    lines.push('| **总计** | **' + report.summary.totalIssues + '** |');
    lines.push('');

    // 一票否决警告
    if (report.metadata && report.metadata.vetoFlags && report.metadata.vetoFlags.length > 0) {
      lines.push('### ⚠️ 关键警告');
      lines.push('');
      for (var v = 0; v < report.metadata.vetoFlags.length; v++) {
        var veto = report.metadata.vetoFlags[v];
        lines.push('- **' + veto.description + '** (评分上限: ' + veto.maxScore + ')');
      }
      lines.push('');
    }

    // 优化建议
    if (report.recommendations && report.recommendations.length > 0) {
      lines.push('## 🎯 优化建议（按优先级排序）');
      lines.push('');

      var highPriority = report.recommendations.filter(function(r) { return r.priority === 'high'; });
      var mediumPriority = report.recommendations.filter(function(r) { return r.priority === 'medium'; });
      var lowPriority = report.recommendations.filter(function(r) { return r.priority === 'low'; });

      if (highPriority.length > 0) {
        lines.push('### 🔴 高优先级');
        lines.push('');
        for (var h = 0; h < Math.min(highPriority.length, 10); h++) {
          var rec = highPriority[h];
          lines.push((h + 1) + '. **' + rec.title + '** (' + rec.issueCount + '处)');
          lines.push('   - ' + rec.description);
          lines.push('   - 预估影响: ' + rec.estimatedImpact + '% | 修复难度: ' + this._getEffortText(rec.effort));
          lines.push('');
        }
      }

      if (mediumPriority.length > 0) {
        lines.push('### 🟠 中优先级');
        lines.push('');
        for (var m = 0; m < Math.min(mediumPriority.length, 10); m++) {
          var medRec = mediumPriority[m];
          lines.push((m + 1) + '. **' + medRec.title + '** (' + medRec.issueCount + '处)');
          lines.push('   - ' + medRec.description);
          lines.push('');
        }
      }

      if (lowPriority.length > 0) {
        lines.push('### 🟡 低优先级');
        lines.push('');
        for (var l = 0; l < Math.min(lowPriority.length, 5); l++) {
          var lowRec = lowPriority[l];
          lines.push((l + 1) + '. ' + lowRec.title + ' (' + lowRec.issueCount + '处)');
        }
        lines.push('');
      }
    }

    // 详细问题列表
    lines.push('## 📋 详细问题列表');
    lines.push('');

    // 按分类分组
    var categories = ['performance', 'ui', 'accessibility', 'bug', 'code_quality'];
    var categoryNames = {
      'performance': '性能问题',
      'ui': 'UI问题',
      'accessibility': '无障碍问题',
      'bug': 'Bug/错误',
      'code_quality': '代码质量'
    };

    for (var c = 0; c < categories.length; c++) {
      var cat = categories[c];
      var catIssues = AuditReport.filterIssuesByCategory(report, cat);

      if (catIssues.length > 0) {
        lines.push('### ' + categoryNames[cat] + ' (' + catIssues.length + ')');
        lines.push('');

        // 按严重程度排序
        catIssues.sort(function(a, b) {
          return this._severityRank(b.severity) - this._severityRank(a.severity);
        }.bind(this));

        for (var i = 0; i < Math.min(catIssues.length, 20); i++) {
          var issue = catIssues[i];
          var severityIcon = this._getSeverityIcon(issue.severity);
          lines.push('- ' + severityIcon + ' **' + issue.file + '**' + (issue.line ? ':' + issue.line : ''));
          lines.push('  - ' + issue.description);
          lines.push('  - 💡 ' + issue.suggestion);
          lines.push('');
        }

        if (catIssues.length > 20) {
          lines.push('*... 还有 ' + (catIssues.length - 20) + ' 个问题*');
          lines.push('');
        }
      }
    }

    // 审计元数据
    lines.push('## 📈 审计元数据');
    lines.push('');
    lines.push('| 指标 | 值 |');
    lines.push('|------|-----|');
    lines.push('| 审计耗时 | ' + (report.metadata.auditDuration || 0) + 'ms |');
    lines.push('| 扫描文件数 | ' + (report.metadata.filesScanned || 0) + ' |');
    lines.push('| 扫描代码行数 | ' + (report.metadata.linesScanned || 0) + ' |');
    lines.push('| 审计工具版本 | ' + (report.metadata.auditorVersion || '1.0.0') + ' |');
    lines.push('');

    lines.push('---');
    lines.push('*报告由飞行工具箱审计系统自动生成*');

    return lines.join('\n');
  },


  /**
   * 生成JSON格式报告
   *
   * @param {Object} report - 审计报告对象
   * @param {boolean} [pretty] - 是否格式化输出
   * @returns {string} JSON格式的报告
   */
  generateJSONReport: function(report, pretty) {
    if (!report) {
      return '{}';
    }

    // 创建导出版本的报告
    var exportReport = {
      meta: {
        projectName: report.projectName,
        version: report.version,
        timestamp: report.timestamp,
        generatedAt: new Date().toISOString(),
        auditorVersion: report.metadata.auditorVersion || '1.0.0'
      },
      scores: {
        overall: report.summary.overallScore,
        performance: report.summary.performanceScore,
        ui: report.summary.uiScore,
        stability: report.summary.stabilityScore
      },
      summary: {
        totalIssues: report.summary.totalIssues,
        bySeverity: {
          critical: report.summary.criticalCount,
          major: report.summary.majorCount,
          minor: report.summary.minorCount,
          info: report.summary.infoCount
        },
        byCategory: report.categoryStats
      },
      recommendations: report.recommendations.map(function(rec) {
        return {
          id: rec.id,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          category: rec.category,
          issueCount: rec.issueCount,
          effort: rec.effort,
          estimatedImpact: rec.estimatedImpact,
          affectedFiles: rec.affectedFiles
        };
      }),
      issues: report.issues.map(function(issue) {
        return {
          id: issue.id,
          category: issue.category,
          severity: issue.severity,
          type: issue.type,
          file: issue.file,
          line: issue.line,
          description: issue.description,
          suggestion: issue.suggestion,
          autoFixable: issue.autoFixable
        };
      }),
      metadata: {
        auditDuration: report.metadata.auditDuration,
        filesScanned: report.metadata.filesScanned,
        linesScanned: report.metadata.linesScanned,
        vetoFlags: report.metadata.vetoFlags || []
      }
    };

    if (pretty) {
      return JSON.stringify(exportReport, null, 2);
    }

    return JSON.stringify(exportReport);
  },

  /**
   * 获取评分对应的emoji
   * @private
   */
  _getScoreEmoji: function(score) {
    if (score >= 90) return '🟢 优秀';
    if (score >= 80) return '🟢 良好';
    if (score >= 70) return '🟡 一般';
    if (score >= 60) return '🟠 较差';
    return '🔴 需改进';
  },

  /**
   * 获取严重程度图标
   * @private
   */
  _getSeverityIcon: function(severity) {
    var icons = {
      'critical': '🔴',
      'major': '🟠',
      'minor': '🟡',
      'info': '🔵'
    };
    return icons[severity] || '⚪';
  },

  /**
   * 获取修复难度文本
   * @private
   */
  _getEffortText: function(effort) {
    var texts = {
      'quick': '快速修复',
      'medium': '中等难度',
      'complex': '复杂修复'
    };
    return texts[effort] || '未知';
  },

  /**
   * 格式化文件大小
   * @private
   */
  _formatSize: function(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    var units = ['B', 'KB', 'MB', 'GB'];
    var i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return bytes.toFixed(2) + ' ' + units[i];
  }
};

// 导出模块
module.exports = ReportGenerator;
