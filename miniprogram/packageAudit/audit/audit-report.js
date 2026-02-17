'use strict';

/**
 * 🔍 审计报告数据结构
 *
 * 定义审计问题记录和审计报告的数据结构
 * 提供创建、管理和序列化审计结果的工具函数
 *
 * @module audit-report
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 审计报告数据结构定义
 *
 * @example
 * var AuditReport = require('./audit-report.js');
 * var issue = AuditReport.createIssue({
 *   category: 'performance',
 *   severity: 'major',
 *   type: 'setdata_large_payload',
 *   file: 'pages/home/index.js',
 *   line: 42,
 *   description: 'setData数据量超过100KB',
 *   suggestion: '使用局部更新或分批更新'
 * });
 */

var AuditConfig = require('./audit-config.js');

/**
 * 生成唯一ID
 *
 * @returns {string} 唯一标识符
 */
function generateId() {
  var timestamp = Date.now().toString(36);
  var randomPart = Math.random().toString(36).substring(2, 8);
  return 'audit_' + timestamp + '_' + randomPart;
}

/**
 * 创建审计问题记录
 *
 * @param {Object} options - 问题配置
 * @param {string} options.category - 问题分类（performance/ui/bug/accessibility/code_quality）
 * @param {string} options.severity - 严重级别（critical/major/minor/info）
 * @param {string} options.type - 问题类型（参见AuditIssueType）
 * @param {string} options.file - 文件路径
 * @param {number} [options.line] - 行号（可选）
 * @param {string} options.description - 问题描述
 * @param {string} options.suggestion - 优化建议
 * @param {boolean} [options.autoFixable] - 是否可自动修复（默认false）
 * @param {string} [options.fixCode] - 修复代码（如可自动修复）
 * @param {Object} [options.metadata] - 额外元数据
 * @returns {Object} 审计问题记录
 *
 * @example
 * var issue = createIssue({
 *   category: 'performance',
 *   severity: 'major',
 *   type: 'setdata_large_payload',
 *   file: 'pages/home/index.js',
 *   line: 42,
 *   description: 'setData数据量为256KB，超过100KB警告阈值',
 *   suggestion: '使用路径字符串进行局部更新，如 this.setData({"list[0].name": value})'
 * });
 */
function createIssue(options) {
  if (!options) {
    throw new Error('createIssue: options is required');
  }

  // 验证必填字段
  var requiredFields = ['category', 'severity', 'type', 'file', 'description', 'suggestion'];
  for (var i = 0; i < requiredFields.length; i++) {
    var field = requiredFields[i];
    if (!options[field]) {
      throw new Error('createIssue: ' + field + ' is required');
    }
  }

  // 验证category值
  var validCategories = Object.keys(AuditConfig.AuditCategory).map(function(key) {
    return AuditConfig.AuditCategory[key];
  });
  if (validCategories.indexOf(options.category) === -1) {
    throw new Error('createIssue: invalid category "' + options.category + '"');
  }

  // 验证severity值
  var validSeverities = Object.keys(AuditConfig.AuditSeverity).map(function(key) {
    return AuditConfig.AuditSeverity[key];
  });
  if (validSeverities.indexOf(options.severity) === -1) {
    throw new Error('createIssue: invalid severity "' + options.severity + '"');
  }

  return {
    id: generateId(),
    category: options.category,
    severity: options.severity,
    type: options.type,
    file: options.file,
    line: options.line || null,
    description: options.description,
    suggestion: options.suggestion,
    autoFixable: options.autoFixable || false,
    fixCode: options.fixCode || null,
    metadata: options.metadata || {},
    createdAt: new Date().toISOString()
  };
}

/**
 * 创建审计报告
 *
 * @param {Object} [options] - 报告配置
 * @param {string} [options.projectName] - 项目名称
 * @param {string} [options.version] - 项目版本
 * @returns {Object} 审计报告对象
 *
 * @example
 * var report = createReport({
 *   projectName: '飞行工具箱',
 *   version: '2.13.4'
 * });
 */
function createReport(options) {
  options = options || {};

  return {
    // 基本信息
    id: generateId(),
    projectName: options.projectName || '飞行工具箱',
    version: options.version || 'unknown',
    timestamp: new Date().toISOString(),

    // 汇总统计
    summary: {
      totalIssues: 0,
      criticalCount: 0,
      majorCount: 0,
      minorCount: 0,
      infoCount: 0,
      performanceScore: 100,    // 0-100
      uiScore: 100,             // 0-100
      stabilityScore: 100,      // 0-100
      overallScore: 100         // 0-100
    },

    // 按分类统计
    categoryStats: {
      performance: { total: 0, critical: 0, major: 0, minor: 0, info: 0 },
      ui: { total: 0, critical: 0, major: 0, minor: 0, info: 0 },
      bug: { total: 0, critical: 0, major: 0, minor: 0, info: 0 },
      accessibility: { total: 0, critical: 0, major: 0, minor: 0, info: 0 },
      code_quality: { total: 0, critical: 0, major: 0, minor: 0, info: 0 }
    },

    // 问题列表
    issues: [],

    // 优化建议（按优先级排序）
    recommendations: [],

    // 审计元数据
    metadata: {
      auditDuration: 0,         // 审计耗时（毫秒）
      filesScanned: 0,          // 扫描文件数
      linesScanned: 0,          // 扫描代码行数
      auditorVersion: '1.0.0'   // 审计工具版本
    }
  };
}

/**
 * 向报告添加问题
 *
 * @param {Object} report - 审计报告对象
 * @param {Object} issue - 审计问题记录
 * @returns {Object} 更新后的报告
 *
 * @example
 * var report = createReport();
 * var issue = createIssue({ ... });
 * addIssueToReport(report, issue);
 */
function addIssueToReport(report, issue) {
  if (!report || !issue) {
    throw new Error('addIssueToReport: report and issue are required');
  }

  // 添加问题到列表
  report.issues.push(issue);

  // 更新总计数
  report.summary.totalIssues++;

  // 更新严重级别计数
  switch (issue.severity) {
    case AuditConfig.AuditSeverity.CRITICAL:
      report.summary.criticalCount++;
      break;
    case AuditConfig.AuditSeverity.MAJOR:
      report.summary.majorCount++;
      break;
    case AuditConfig.AuditSeverity.MINOR:
      report.summary.minorCount++;
      break;
    case AuditConfig.AuditSeverity.INFO:
      report.summary.infoCount++;
      break;
  }

  // 更新分类统计
  var category = issue.category;
  if (report.categoryStats[category]) {
    report.categoryStats[category].total++;
    report.categoryStats[category][issue.severity]++;
  }

  return report;
}

/**
 * 批量添加问题到报告
 *
 * @param {Object} report - 审计报告对象
 * @param {Array<Object>} issues - 审计问题记录数组
 * @returns {Object} 更新后的报告
 */
function addIssuesToReport(report, issues) {
  if (!report || !issues) {
    throw new Error('addIssuesToReport: report and issues are required');
  }

  for (var i = 0; i < issues.length; i++) {
    addIssueToReport(report, issues[i]);
  }

  return report;
}

/**
 * 计算审计评分
 *
 * 评分规则：
 * - 基础分100分
 * - critical问题：-20分/个
 * - major问题：-10分/个
 * - minor问题：-3分/个
 * - info问题：-1分/个
 * - 最低0分
 *
 * @param {Object} report - 审计报告对象
 * @returns {Object} 更新后的报告（包含计算后的评分）
 */
function calculateScores(report) {
  if (!report) {
    throw new Error('calculateScores: report is required');
  }

  // 评分权重
  var weights = {
    critical: 20,
    major: 10,
    minor: 3,
    info: 1
  };

  // 计算各分类评分
  var categories = ['performance', 'ui', 'bug', 'accessibility', 'code_quality'];
  var categoryScores = {};

  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    var stats = report.categoryStats[cat];
    var deduction = (stats.critical * weights.critical) +
                    (stats.major * weights.major) +
                    (stats.minor * weights.minor) +
                    (stats.info * weights.info);
    categoryScores[cat] = Math.max(0, 100 - deduction);
  }

  // 计算综合评分
  // 性能70%权重，UI30%权重
  var performanceScore = categoryScores.performance;
  var uiScore = categoryScores.ui;
  var stabilityScore = Math.round(
    (categoryScores.bug + categoryScores.code_quality) / 2
  );

  // 综合评分：性能70% + UI30%
  var overallScore = Math.round(
    performanceScore * 0.7 + uiScore * 0.3
  );

  // 更新报告评分
  report.summary.performanceScore = performanceScore;
  report.summary.uiScore = uiScore;
  report.summary.stabilityScore = stabilityScore;
  report.summary.overallScore = overallScore;

  return report;
}

/**
 * 添加优化建议
 *
 * @param {Object} report - 审计报告对象
 * @param {Object} recommendation - 优化建议
 * @param {string} recommendation.title - 建议标题
 * @param {string} recommendation.description - 建议描述
 * @param {string} recommendation.priority - 优先级（high/medium/low）
 * @param {string} recommendation.category - 相关分类
 * @param {number} recommendation.estimatedImpact - 预估影响（0-100）
 * @returns {Object} 更新后的报告
 */
function addRecommendation(report, recommendation) {
  if (!report || !recommendation) {
    throw new Error('addRecommendation: report and recommendation are required');
  }

  report.recommendations.push({
    id: generateId(),
    title: recommendation.title,
    description: recommendation.description,
    priority: recommendation.priority || 'medium',
    category: recommendation.category,
    estimatedImpact: recommendation.estimatedImpact || 0,
    createdAt: new Date().toISOString()
  });

  // 按优先级和影响排序
  report.recommendations.sort(function(a, b) {
    var priorityOrder = { high: 0, medium: 1, low: 2 };
    var priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return b.estimatedImpact - a.estimatedImpact;
  });

  return report;
}

/**
 * 按严重级别筛选问题
 *
 * @param {Object} report - 审计报告对象
 * @param {string} severity - 严重级别
 * @returns {Array<Object>} 筛选后的问题列表
 */
function filterIssuesBySeverity(report, severity) {
  if (!report || !severity) {
    return [];
  }

  return report.issues.filter(function(issue) {
    return issue.severity === severity;
  });
}

/**
 * 按分类筛选问题
 *
 * @param {Object} report - 审计报告对象
 * @param {string} category - 问题分类
 * @returns {Array<Object>} 筛选后的问题列表
 */
function filterIssuesByCategory(report, category) {
  if (!report || !category) {
    return [];
  }

  return report.issues.filter(function(issue) {
    return issue.category === category;
  });
}

/**
 * 按文件筛选问题
 *
 * @param {Object} report - 审计报告对象
 * @param {string} filePath - 文件路径
 * @returns {Array<Object>} 筛选后的问题列表
 */
function filterIssuesByFile(report, filePath) {
  if (!report || !filePath) {
    return [];
  }

  return report.issues.filter(function(issue) {
    return issue.file === filePath;
  });
}

/**
 * 获取可自动修复的问题
 *
 * @param {Object} report - 审计报告对象
 * @returns {Array<Object>} 可自动修复的问题列表
 */
function getAutoFixableIssues(report) {
  if (!report) {
    return [];
  }

  return report.issues.filter(function(issue) {
    return issue.autoFixable === true;
  });
}

/**
 * 序列化报告为JSON字符串
 *
 * @param {Object} report - 审计报告对象
 * @param {boolean} [pretty] - 是否格式化输出（默认false）
 * @returns {string} JSON字符串
 */
function serializeReport(report, pretty) {
  if (!report) {
    return '{}';
  }

  if (pretty) {
    return JSON.stringify(report, null, 2);
  }

  return JSON.stringify(report);
}

/**
 * 从JSON字符串反序列化报告
 *
 * @param {string} jsonString - JSON字符串
 * @returns {Object|null} 审计报告对象，解析失败返回null
 */
function deserializeReport(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('❌ 反序列化报告失败:', error);
    return null;
  }
}

/**
 * 生成报告摘要文本
 *
 * @param {Object} report - 审计报告对象
 * @returns {string} 摘要文本
 */
function generateSummaryText(report) {
  if (!report) {
    return '无审计报告';
  }

  var lines = [
    '========== 审计报告摘要 ==========',
    '项目: ' + report.projectName,
    '版本: ' + report.version,
    '时间: ' + report.timestamp,
    '',
    '【评分】',
    '  综合评分: ' + report.summary.overallScore + '/100',
    '  性能评分: ' + report.summary.performanceScore + '/100',
    '  UI评分: ' + report.summary.uiScore + '/100',
    '  稳定性评分: ' + report.summary.stabilityScore + '/100',
    '',
    '【问题统计】',
    '  总计: ' + report.summary.totalIssues + ' 个问题',
    '  严重: ' + report.summary.criticalCount + ' 个',
    '  主要: ' + report.summary.majorCount + ' 个',
    '  次要: ' + report.summary.minorCount + ' 个',
    '  提示: ' + report.summary.infoCount + ' 个',
    '',
    '【分类统计】'
  ];

  var categories = Object.keys(report.categoryStats);
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    var stats = report.categoryStats[cat];
    lines.push('  ' + cat + ': ' + stats.total + ' 个问题');
  }

  if (report.recommendations.length > 0) {
    lines.push('');
    lines.push('【优化建议】');
    for (var j = 0; j < Math.min(5, report.recommendations.length); j++) {
      var rec = report.recommendations[j];
      lines.push('  ' + (j + 1) + '. [' + rec.priority.toUpperCase() + '] ' + rec.title);
    }
    if (report.recommendations.length > 5) {
      lines.push('  ... 还有 ' + (report.recommendations.length - 5) + ' 条建议');
    }
  }

  lines.push('');
  lines.push('【审计元数据】');
  lines.push('  扫描文件数: ' + report.metadata.filesScanned);
  lines.push('  扫描代码行数: ' + report.metadata.linesScanned);
  lines.push('  审计耗时: ' + report.metadata.auditDuration + 'ms');
  lines.push('=================================');

  return lines.join('\n');
}

/**
 * 更新报告元数据
 *
 * @param {Object} report - 审计报告对象
 * @param {Object} metadata - 元数据更新
 * @returns {Object} 更新后的报告
 */
function updateMetadata(report, metadata) {
  if (!report || !metadata) {
    return report;
  }

  var keys = Object.keys(metadata);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    report.metadata[key] = metadata[key];
  }

  return report;
}

/**
 * 完成报告（计算评分并生成最终报告）
 *
 * @param {Object} report - 审计报告对象
 * @returns {Object} 完成的报告
 */
function finalizeReport(report) {
  if (!report) {
    throw new Error('finalizeReport: report is required');
  }

  // 计算评分
  calculateScores(report);

  // 更新完成时间
  report.finalizedAt = new Date().toISOString();

  return report;
}

// 导出所有函数
module.exports = {
  // 创建函数
  createIssue: createIssue,
  createReport: createReport,

  // 报告操作
  addIssueToReport: addIssueToReport,
  addIssuesToReport: addIssuesToReport,
  addRecommendation: addRecommendation,
  calculateScores: calculateScores,
  finalizeReport: finalizeReport,
  updateMetadata: updateMetadata,

  // 筛选函数
  filterIssuesBySeverity: filterIssuesBySeverity,
  filterIssuesByCategory: filterIssuesByCategory,
  filterIssuesByFile: filterIssuesByFile,
  getAutoFixableIssues: getAutoFixableIssues,

  // 序列化
  serializeReport: serializeReport,
  deserializeReport: deserializeReport,
  generateSummaryText: generateSummaryText,

  // 工具函数
  generateId: generateId
};
