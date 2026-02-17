'use strict';

/**
 * 📊 审计报告输出页面
 *
 * 开发环境专用页面，用于显示审计结果和导出报告
 * 仅在开发环境下可访问
 *
 * @module audit-report
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 审计报告展示
 *
 * 功能特性：
 * - 显示综合评分（性能、UI、稳定性）
 * - 按严重程度筛选问题
 * - 按分类分组展示问题
 * - 支持导出JSON格式报告
 * - 仅开发环境可用
 */

var BasePage = require('../../utils/base-page.js');

// 尝试加载审计工具（开发环境）
var ReportGenerator = null;
var AuditConfig = null;

try {
  ReportGenerator = require('../audit/report-generator.js');
  AuditConfig = require('../audit/audit-config.js');
} catch (error) {
  console.warn('⚠️ 审计工具加载失败，可能不在开发环境:', error.message);
}

/**
 * 严重程度配置
 */
var SEVERITY_CONFIG = {
  critical: { label: '严重', color: '#ee0a24', icon: '🔴', order: 0 },
  major: { label: '主要', color: '#ff976a', icon: '🟠', order: 1 },
  minor: { label: '次要', color: '#ffd21e', icon: '🟡', order: 2 },
  info: { label: '提示', color: '#1989fa', icon: '🔵', order: 3 }
};

/**
 * 分类配置
 */
var CATEGORY_CONFIG = {
  performance: { label: '性能问题', icon: '⚡' },
  ui: { label: 'UI问题', icon: '🎨' },
  accessibility: { label: '无障碍问题', icon: '♿' },
  bug: { label: 'Bug/错误', icon: '🐛' },
  code_quality: { label: '代码质量', icon: '📝' }
};

var pageConfig = {
  data: {
    // 环境检测
    isDev: false,
    isLoading: false,
    hasError: false,
    errorMessage: '',

    // 审计报告数据
    report: null,
    hasReport: false,

    // 评分数据
    scores: {
      overall: 0,
      performance: 0,
      ui: 0,
      stability: 0
    },

    // 问题统计
    summary: {
      totalIssues: 0,
      criticalCount: 0,
      majorCount: 0,
      minorCount: 0,
      infoCount: 0
    },

    // 筛选状态
    currentFilter: 'all', // all, critical, major, minor, info
    filterOptions: [
      { value: 'all', label: '全部', icon: '📋' },
      { value: 'critical', label: '严重', icon: '🔴' },
      { value: 'major', label: '主要', icon: '🟠' },
      { value: 'minor', label: '次要', icon: '🟡' },
      { value: 'info', label: '提示', icon: '🔵' }
    ],

    // 分组后的问题列表
    groupedIssues: [],

    // 展开状态
    expandedGroups: {},

    // 优化建议
    recommendations: [],

    // 一票否决警告
    vetoFlags: [],

    // 导出状态
    isExporting: false
  },

  customOnLoad: function() {
    var self = this;

    // 检测开发环境
    this.checkDevEnvironment();

    // 如果不是开发环境，显示警告
    if (!this.data.isDev) {
      this.setData({
        hasError: true,
        errorMessage: '此页面仅在开发环境下可用'
      });
      return;
    }

    // 检查审计工具是否可用
    if (!ReportGenerator) {
      this.setData({
        hasError: true,
        errorMessage: '审计工具未加载，请确保在开发环境中运行'
      });
      return;
    }
  },

  /**
   * 检测是否为开发环境
   */
  checkDevEnvironment: function() {
    var isDev = false;

    try {
      // 方法1：检查 __wxConfig
      if (typeof __wxConfig !== 'undefined' && __wxConfig.envVersion) {
        isDev = __wxConfig.envVersion === 'develop' || __wxConfig.envVersion === 'trial';
      }

      // 方法2：检查账户信息
      var accountInfo = wx.getAccountInfoSync();
      if (accountInfo && accountInfo.miniProgram) {
        var envVersion = accountInfo.miniProgram.envVersion;
        isDev = envVersion === 'develop' || envVersion === 'trial';
      }
    } catch (error) {
      console.warn('环境检测失败:', error);
      // 默认允许访问（开发者工具中可能检测失败）
      isDev = true;
    }

    this.setData({ isDev: isDev });
  },

  /**
   * 运行审计
   */
  runAudit: function() {
    var self = this;

    if (!ReportGenerator) {
      this.showToast('审计工具未加载');
      return;
    }

    this.setData({
      isLoading: true,
      hasError: false,
      errorMessage: ''
    });

    // 使用setTimeout模拟异步，避免阻塞UI
    setTimeout(function() {
      try {
        // 运行完整审计
        var report = ReportGenerator.runFullAudit({
          projectName: '飞行工具箱',
          version: '2.13.4'
        });

        // 处理报告数据
        self.processReport(report);

        self.setData({
          isLoading: false,
          hasReport: true
        });

        self.showToast('审计完成');
      } catch (error) {
        console.error('审计执行失败:', error);
        self.setData({
          isLoading: false,
          hasError: true,
          errorMessage: '审计执行失败: ' + (error.message || String(error))
        });
      }
    }, 100);
  },

  /**
   * 处理审计报告数据
   */
  processReport: function(report) {
    if (!report) {
      return;
    }

    // 提取评分
    var scores = {
      overall: report.summary.overallScore || 0,
      performance: report.summary.performanceScore || 0,
      ui: report.summary.uiScore || 0,
      stability: report.summary.stabilityScore || 0
    };

    // 提取统计
    var summary = {
      totalIssues: report.summary.totalIssues || 0,
      criticalCount: report.summary.criticalCount || 0,
      majorCount: report.summary.majorCount || 0,
      minorCount: report.summary.minorCount || 0,
      infoCount: report.summary.infoCount || 0
    };

    // 提取一票否决警告
    var vetoFlags = [];
    if (report.metadata && report.metadata.vetoFlags) {
      vetoFlags = report.metadata.vetoFlags;
    }

    // 提取优化建议（取前10条）
    var recommendations = [];
    if (report.recommendations && report.recommendations.length > 0) {
      recommendations = report.recommendations.slice(0, 10);
    }

    // 分组问题
    var groupedIssues = this.groupIssuesByCategory(report.issues || []);

    // 初始化展开状态（默认展开有严重问题的分组）
    var expandedGroups = {};
    groupedIssues.forEach(function(group) {
      // 如果有严重或主要问题，默认展开
      var hasCritical = group.issues.some(function(issue) {
        return issue.severity === 'critical' || issue.severity === 'major';
      });
      expandedGroups[group.category] = hasCritical;
    });

    this.setData({
      report: report,
      scores: scores,
      summary: summary,
      vetoFlags: vetoFlags,
      recommendations: recommendations,
      groupedIssues: groupedIssues,
      expandedGroups: expandedGroups
    });
  },

  /**
   * 按分类分组问题
   */
  groupIssuesByCategory: function(issues) {
    var self = this;
    var groups = {};

    // 分组
    issues.forEach(function(issue) {
      var category = issue.category || 'other';
      if (!groups[category]) {
        groups[category] = {
          category: category,
          label: CATEGORY_CONFIG[category] ? CATEGORY_CONFIG[category].label : category,
          icon: CATEGORY_CONFIG[category] ? CATEGORY_CONFIG[category].icon : '📌',
          issues: [],
          criticalCount: 0,
          majorCount: 0,
          minorCount: 0,
          infoCount: 0
        };
      }

      groups[category].issues.push(issue);

      // 统计各严重程度数量
      if (issue.severity === 'critical') {
        groups[category].criticalCount++;
      } else if (issue.severity === 'major') {
        groups[category].majorCount++;
      } else if (issue.severity === 'minor') {
        groups[category].minorCount++;
      } else {
        groups[category].infoCount++;
      }
    });

    // 转换为数组并排序（按严重问题数量）
    var result = Object.keys(groups).map(function(key) {
      return groups[key];
    });

    result.sort(function(a, b) {
      // 优先按严重问题数量排序
      var aWeight = a.criticalCount * 1000 + a.majorCount * 100 + a.minorCount * 10 + a.infoCount;
      var bWeight = b.criticalCount * 1000 + b.majorCount * 100 + b.minorCount * 10 + b.infoCount;
      return bWeight - aWeight;
    });

    return result;
  },

  /**
   * 切换筛选条件
   */
  onFilterChange: function(e) {
    var filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    this.applyFilter(filter);
  },

  /**
   * 应用筛选
   */
  applyFilter: function(filter) {
    if (!this.data.report || !this.data.report.issues) {
      return;
    }

    var issues = this.data.report.issues;

    // 筛选问题
    if (filter !== 'all') {
      issues = issues.filter(function(issue) {
        return issue.severity === filter;
      });
    }

    // 重新分组
    var groupedIssues = this.groupIssuesByCategory(issues);

    this.setData({ groupedIssues: groupedIssues });
  },

  /**
   * 切换分组展开状态
   */
  toggleGroup: function(e) {
    var category = e.currentTarget.dataset.category;
    var expandedGroups = this.data.expandedGroups;
    expandedGroups[category] = !expandedGroups[category];
    this.setData({ expandedGroups: expandedGroups });
  },

  /**
   * 导出JSON报告
   */
  exportJSON: function() {
    var self = this;

    if (!this.data.report) {
      this.showToast('请先运行审计');
      return;
    }

    this.setData({ isExporting: true });

    try {
      // 生成JSON报告
      var jsonReport = ReportGenerator.generateJSONReport(this.data.report, true);

      // 复制到剪贴板
      wx.setClipboardData({
        data: jsonReport,
        success: function() {
          self.setData({ isExporting: false });
          wx.showToast({
            title: 'JSON已复制到剪贴板',
            icon: 'success',
            duration: 2000
          });
        },
        fail: function(error) {
          self.setData({ isExporting: false });
          self.showToast('复制失败: ' + error.errMsg);
        }
      });
    } catch (error) {
      this.setData({ isExporting: false });
      this.showToast('导出失败: ' + error.message);
    }
  },

  /**
   * 导出Markdown报告
   */
  exportMarkdown: function() {
    var self = this;

    if (!this.data.report) {
      this.showToast('请先运行审计');
      return;
    }

    this.setData({ isExporting: true });

    try {
      // 生成Markdown报告
      var mdReport = ReportGenerator.generateMarkdownReport(this.data.report);

      // 复制到剪贴板
      wx.setClipboardData({
        data: mdReport,
        success: function() {
          self.setData({ isExporting: false });
          wx.showToast({
            title: 'Markdown已复制到剪贴板',
            icon: 'success',
            duration: 2000
          });
        },
        fail: function(error) {
          self.setData({ isExporting: false });
          self.showToast('复制失败: ' + error.errMsg);
        }
      });
    } catch (error) {
      this.setData({ isExporting: false });
      this.showToast('导出失败: ' + error.message);
    }
  },

  /**
   * 获取评分等级样式
   */
  getScoreLevel: function(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'average';
    if (score >= 60) return 'poor';
    return 'critical';
  },

  /**
   * 获取评分等级文本
   */
  getScoreLevelText: function(score) {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    if (score >= 60) return '较差';
    return '需改进';
  },

  /**
   * 显示提示
   */
  showToast: function(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }
};

// 使用BasePage基类创建页面
Page(BasePage.createPage(pageConfig));
