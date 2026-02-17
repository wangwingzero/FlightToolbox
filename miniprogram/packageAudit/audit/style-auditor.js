'use strict';

/**
 * 🎨 样式一致性审计器
 *
 * 检查微信小程序中的UI样式一致性
 * 验证Vant组件使用、设计规范遵循、颜色对比度和触摸目标大小
 *
 * @module style-auditor
 * @created 2025-01-17
 * @purpose 飞行工具箱全面审查与优化项目 - UI样式一致性审计
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 使用统一的设计系统（颜色、间距、圆角）
 * - Vant组件优先于自定义组件
 * - WCAG AA标准：文本对比度至少4.5:1
 * - 触摸目标最小44pt（88rpx）
 * - 最小字体大小24rpx
 *
 * @example
 * var StyleAuditor = require('./style-auditor.js');
 * var result = StyleAuditor.checkVantUsage({ wxmlCode: code });
 * var contrast = StyleAuditor.checkColorContrast({ wxssCode: css });
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 设计系统规范
 * @constant {Object}
 */
var DESIGN_SYSTEM = AuditConfig.DesignSystem;

/**
 * 无障碍阈值
 * @constant {Object}
 */
var ACCESSIBILITY = AuditConfig.AccessibilityThresholds;

/**
 * Vant组件列表
 * @constant {Array}
 */
var VANT_COMPONENTS = [
  'van-button', 'van-cell', 'van-cell-group', 'van-icon', 'van-image',
  'van-row', 'van-col', 'van-popup', 'van-toast', 'van-dialog',
  'van-transition', 'van-calendar', 'van-checkbox', 'van-checkbox-group',
  'van-datetime-picker', 'van-field', 'van-picker', 'van-radio', 'van-radio-group',
  'van-rate', 'van-search', 'van-slider', 'van-stepper', 'van-switch',
  'van-uploader', 'van-action-sheet', 'van-dropdown-menu', 'van-dropdown-item',
  'van-loading', 'van-notify', 'van-overlay', 'van-share-sheet', 'van-swipe-cell',
  'van-circle', 'van-collapse', 'van-collapse-item', 'van-count-down',
  'van-divider', 'van-empty', 'van-notice-bar', 'van-panel', 'van-progress',
  'van-skeleton', 'van-steps', 'van-sticky', 'van-tag', 'van-tree-select',
  'van-grid', 'van-grid-item', 'van-index-bar', 'van-index-anchor',
  'van-nav-bar', 'van-sidebar', 'van-sidebar-item', 'van-tab', 'van-tabs',
  'van-tabbar', 'van-tabbar-item', 'van-area', 'van-card', 'van-submit-bar',
  'van-goods-action', 'van-goods-action-icon', 'van-goods-action-button'
];

/**
 * 可替换为Vant的常见自定义组件模式
 * @constant {Object}
 */
var REPLACEABLE_PATTERNS = {
  'button': 'van-button',
  'btn': 'van-button',
  'input': 'van-field',
  'modal': 'van-popup',
  'dialog': 'van-dialog',
  'toast': 'van-toast',
  'loading': 'van-loading',
  'tab': 'van-tabs',
  'tabs': 'van-tabs',
  'list': 'van-cell-group',
  'card': 'van-card',
  'tag': 'van-tag',
  'badge': 'van-tag',
  'switch': 'van-switch',
  'checkbox': 'van-checkbox',
  'radio': 'van-radio',
  'slider': 'van-slider',
  'progress': 'van-progress',
  'skeleton': 'van-skeleton',
  'empty': 'van-empty',
  'divider': 'van-divider',
  'notice': 'van-notice-bar',
  'navbar': 'van-nav-bar',
  'search': 'van-search',
  'picker': 'van-picker',
  'popup': 'van-popup',
  'overlay': 'van-overlay',
  'collapse': 'van-collapse',
  'grid': 'van-grid',
  'steps': 'van-steps',
  'rate': 'van-rate',
  'stepper': 'van-stepper'
};

/**
 * 样式审计器
 * @namespace StyleAuditor
 */
var StyleAuditor = {
  /**
   * 设计系统规范
   */
  DESIGN_SYSTEM: DESIGN_SYSTEM,

  /**
   * Vant组件列表
   */
  VANT_COMPONENTS: VANT_COMPONENTS,

  /**
   * 可替换模式
   */
  REPLACEABLE_PATTERNS: REPLACEABLE_PATTERNS,


  /**
   * 检查Vant组件使用情况
   * 分析页面中Vant组件和自定义组件的使用
   *
   * @param {Object} options - 检查选项
   * @param {string} [options.wxmlCode] - WXML代码
   * @param {string} [options.jsonCode] - JSON配置代码
   * @param {string} [options.filePath] - 文件路径
   * @param {Array} [options.wxmlFiles] - WXML文件列表
   * @returns {Object} Vant组件使用分析结果
   */
  checkVantUsage: function(options) {
    options = options || {};

    var result = {
      totalComponents: 0,
      vantComponents: [],
      customComponents: [],
      replaceableComponents: [],
      vantUsageRatio: 0,
      issues: [],
      recommendations: []
    };

    try {
      var filesToCheck = [];

      if (options.wxmlCode) {
        filesToCheck.push({
          path: options.filePath || 'unknown.wxml',
          wxmlCode: options.wxmlCode,
          jsonCode: options.jsonCode || ''
        });
      }

      if (options.wxmlFiles && options.wxmlFiles.length > 0) {
        filesToCheck = filesToCheck.concat(options.wxmlFiles);
      }

      var allVantComponents = [];
      var allCustomComponents = [];
      var allReplaceableComponents = [];

      for (var i = 0; i < filesToCheck.length; i++) {
        var file = filesToCheck[i];
        var fileResult = this._analyzeComponentUsage(
          file.path,
          file.wxmlCode,
          file.jsonCode
        );

        allVantComponents = allVantComponents.concat(fileResult.vantComponents);
        allCustomComponents = allCustomComponents.concat(fileResult.customComponents);
        allReplaceableComponents = allReplaceableComponents.concat(fileResult.replaceableComponents);
        result.issues = result.issues.concat(fileResult.issues);
      }

      result.vantComponents = allVantComponents;
      result.customComponents = allCustomComponents;
      result.replaceableComponents = allReplaceableComponents;
      result.totalComponents = allVantComponents.length + allCustomComponents.length;

      if (result.totalComponents > 0) {
        result.vantUsageRatio = allVantComponents.length / result.totalComponents;
      }

      result.recommendations = this._generateVantRecommendations(result);

    } catch (error) {
      console.error('❌ Vant组件使用检查失败:', error);
      result.error = error.message || String(error);
    }

    return result;
  },

  /**
   * 分析单个文件的组件使用
   * @private
   */
  _analyzeComponentUsage: function(filePath, wxmlCode, jsonCode) {
    var result = {
      vantComponents: [],
      customComponents: [],
      replaceableComponents: [],
      issues: []
    };

    if (!wxmlCode) {
      return result;
    }

    // 从JSON配置中获取注册的组件
    var registeredComponents = {};
    if (jsonCode) {
      try {
        var jsonConfig = JSON.parse(jsonCode);
        if (jsonConfig.usingComponents) {
          registeredComponents = jsonConfig.usingComponents;
        }
      } catch (e) {
        // 忽略JSON解析错误
      }
    }

    // 匹配所有组件标签
    var componentPattern = /<([a-z][a-z0-9-]*)\s/gi;
    var match;
    var seenComponents = {};

    while ((match = componentPattern.exec(wxmlCode)) !== null) {
      var tagName = match[1].toLowerCase();

      if (seenComponents[tagName]) {
        continue;
      }
      seenComponents[tagName] = true;

      // 检查是否是Vant组件
      if (VANT_COMPONENTS.indexOf(tagName) !== -1) {
        result.vantComponents.push({
          name: tagName,
          file: filePath
        });
      }
      // 检查是否是自定义组件（非原生标签）
      else if (this._isCustomComponent(tagName, registeredComponents)) {
        result.customComponents.push({
          name: tagName,
          file: filePath
        });

        // 检查是否可以替换为Vant组件
        var replacement = this._findVantReplacement(tagName);
        if (replacement) {
          result.replaceableComponents.push({
            name: tagName,
            file: filePath,
            suggestedVant: replacement
          });

          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.UI,
            severity: AuditConfig.AuditSeverity.MINOR,
            type: AuditConfig.AuditIssueType.VANT_USAGE_INCONSISTENT,
            file: filePath,
            description: '自定义组件 <' + tagName + '> 可替换为Vant组件 <' + replacement + '>',
            suggestion: '使用Vant组件可获得更好的一致性和维护性',
            metadata: {
              customComponent: tagName,
              vantReplacement: replacement
            }
          }));
        }
      }
    }

    return result;
  },


  /**
   * 检查设计规范遵循情况
   * 验证样式值是否符合设计系统
   *
   * @param {Object} options - 检查选项
   * @param {string} [options.wxssCode] - WXSS代码
   * @param {string} [options.filePath] - 文件路径
   * @param {Array} [options.wxssFiles] - WXSS文件列表
   * @returns {Object} 设计规范检查结果
   */
  checkDesignSystem: function(options) {
    options = options || {};

    var result = {
      totalRules: 0,
      colorViolations: [],
      spacingViolations: [],
      borderRadiusViolations: [],
      fontSizeViolations: [],
      issues: [],
      recommendations: []
    };

    try {
      var filesToCheck = [];

      if (options.wxssCode) {
        filesToCheck.push({
          path: options.filePath || 'unknown.wxss',
          code: options.wxssCode
        });
      }

      if (options.wxssFiles && options.wxssFiles.length > 0) {
        filesToCheck = filesToCheck.concat(options.wxssFiles);
      }

      for (var i = 0; i < filesToCheck.length; i++) {
        var file = filesToCheck[i];
        var fileResult = this._analyzeDesignSystem(file.path, file.code);

        result.totalRules += fileResult.totalRules;
        result.colorViolations = result.colorViolations.concat(fileResult.colorViolations);
        result.spacingViolations = result.spacingViolations.concat(fileResult.spacingViolations);
        result.borderRadiusViolations = result.borderRadiusViolations.concat(fileResult.borderRadiusViolations);
        result.fontSizeViolations = result.fontSizeViolations.concat(fileResult.fontSizeViolations);
        result.issues = result.issues.concat(fileResult.issues);
      }

      result.recommendations = this._generateDesignSystemRecommendations(result);

    } catch (error) {
      console.error('❌ 设计规范检查失败:', error);
      result.error = error.message || String(error);
    }

    return result;
  },

  /**
   * 分析单个文件的设计规范遵循
   * @private
   */
  _analyzeDesignSystem: function(filePath, wxssCode) {
    var result = {
      totalRules: 0,
      colorViolations: [],
      spacingViolations: [],
      borderRadiusViolations: [],
      fontSizeViolations: [],
      issues: []
    };

    if (!wxssCode) {
      return result;
    }

    var lines = wxssCode.split('\n');
    var designColors = Object.values(DESIGN_SYSTEM.colors);
    var designSpacing = Object.values(DESIGN_SYSTEM.spacing);
    var designBorderRadius = Object.values(DESIGN_SYSTEM.borderRadius);

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var lineNumber = i + 1;

      // 检查颜色值
      var colorMatch = line.match(/(?:color|background|border-color)\s*:\s*(#[0-9a-fA-F]{3,8})/i);
      if (colorMatch) {
        result.totalRules++;
        var colorValue = colorMatch[1].toLowerCase();

        // 标准化颜色值
        var normalizedColor = this._normalizeColor(colorValue);
        var isDesignColor = designColors.some(function(c) {
          return this._normalizeColor(c) === normalizedColor;
        }, this);

        if (!isDesignColor && !this._isCommonColor(normalizedColor)) {
          result.colorViolations.push({
            file: filePath,
            line: lineNumber,
            value: colorValue,
            property: colorMatch[0].split(':')[0].trim()
          });
        }
      }

      // 检查间距值
      var spacingMatch = line.match(/(?:padding|margin)\s*:\s*(\d+rpx)/i);
      if (spacingMatch) {
        result.totalRules++;
        var spacingValue = spacingMatch[1];

        if (designSpacing.indexOf(spacingValue) === -1) {
          var numValue = parseInt(spacingValue, 10);
          // 只标记不是8的倍数的值
          if (numValue % 8 !== 0) {
            result.spacingViolations.push({
              file: filePath,
              line: lineNumber,
              value: spacingValue,
              suggestion: this._findClosestSpacing(numValue)
            });
          }
        }
      }

      // 检查圆角值
      var radiusMatch = line.match(/border-radius\s*:\s*(\d+rpx)/i);
      if (radiusMatch) {
        result.totalRules++;
        var radiusValue = radiusMatch[1];

        if (designBorderRadius.indexOf(radiusValue) === -1) {
          result.borderRadiusViolations.push({
            file: filePath,
            line: lineNumber,
            value: radiusValue,
            suggestion: this._findClosestBorderRadius(parseInt(radiusValue, 10))
          });
        }
      }

      // 检查字体大小
      var fontMatch = line.match(/font-size\s*:\s*(\d+)rpx/i);
      if (fontMatch) {
        result.totalRules++;
        var fontSize = parseInt(fontMatch[1], 10);

        if (fontSize < ACCESSIBILITY.MIN_FONT_SIZE) {
          result.fontSizeViolations.push({
            file: filePath,
            line: lineNumber,
            value: fontSize + 'rpx',
            minRequired: ACCESSIBILITY.MIN_FONT_SIZE + 'rpx'
          });

          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.ACCESSIBILITY,
            severity: AuditConfig.AuditSeverity.MAJOR,
            type: AuditConfig.AuditIssueType.FONT_SIZE_TOO_SMALL,
            file: filePath,
            line: lineNumber,
            description: '字体大小 ' + fontSize + 'rpx 小于最小要求 ' + ACCESSIBILITY.MIN_FONT_SIZE + 'rpx',
            suggestion: '增大字体大小以提高可读性',
            metadata: {
              value: fontSize,
              minRequired: ACCESSIBILITY.MIN_FONT_SIZE
            }
          }));
        }
      }
    }

    return result;
  },


  /**
   * 检查颜色对比度
   * 验证文本和背景颜色的对比度是否符合WCAG标准
   *
   * @param {Object} options - 检查选项
   * @param {string} [options.wxssCode] - WXSS代码
   * @param {string} [options.filePath] - 文件路径
   * @param {Array} [options.colorPairs] - 颜色对列表（用于测试注入）
   *   每个对象包含: { foreground, background, file, line }
   * @returns {Object} 颜色对比度检查结果
   */
  checkColorContrast: function(options) {
    options = options || {};

    var result = {
      totalPairs: 0,
      passedPairs: [],
      failedPairs: [],
      issues: [],
      recommendations: []
    };

    try {
      var colorPairs = options.colorPairs || [];

      // 如果提供了WXSS代码，尝试提取颜色对
      if (options.wxssCode && colorPairs.length === 0) {
        colorPairs = this._extractColorPairs(options.wxssCode, options.filePath);
      }

      result.totalPairs = colorPairs.length;

      for (var i = 0; i < colorPairs.length; i++) {
        var pair = colorPairs[i];
        var ratio = this._calculateContrastRatio(pair.foreground, pair.background);

        var pairResult = {
          foreground: pair.foreground,
          background: pair.background,
          file: pair.file,
          line: pair.line,
          ratio: ratio,
          ratioFormatted: ratio.toFixed(2) + ':1',
          wcagAA: ratio >= ACCESSIBILITY.WCAG_AA_CONTRAST_RATIO,
          wcagAAA: ratio >= ACCESSIBILITY.WCAG_AAA_CONTRAST_RATIO
        };

        if (pairResult.wcagAA) {
          result.passedPairs.push(pairResult);
        } else {
          result.failedPairs.push(pairResult);

          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.ACCESSIBILITY,
            severity: AuditConfig.AuditSeverity.MAJOR,
            type: AuditConfig.AuditIssueType.COLOR_LOW_CONTRAST,
            file: pair.file,
            line: pair.line,
            description: '颜色对比度 ' + pairResult.ratioFormatted + ' 低于WCAG AA标准 4.5:1',
            suggestion: '增加前景色和背景色之间的对比度',
            metadata: {
              foreground: pair.foreground,
              background: pair.background,
              ratio: ratio,
              required: ACCESSIBILITY.WCAG_AA_CONTRAST_RATIO
            }
          }));
        }
      }

      result.recommendations = this._generateContrastRecommendations(result);

    } catch (error) {
      console.error('❌ 颜色对比度检查失败:', error);
      result.error = error.message || String(error);
    }

    return result;
  },

  /**
   * 检查触摸目标大小
   * 验证交互元素的触摸目标是否足够大
   *
   * @param {Object} options - 检查选项
   * @param {string} [options.wxmlCode] - WXML代码
   * @param {string} [options.wxssCode] - WXSS代码
   * @param {string} [options.filePath] - 文件路径
   * @param {Array} [options.touchTargets] - 触摸目标列表（用于测试注入）
   * @returns {Object} 触摸目标检查结果
   */
  checkTouchTargets: function(options) {
    options = options || {};

    var result = {
      totalTargets: 0,
      passedTargets: [],
      failedTargets: [],
      issues: [],
      recommendations: []
    };

    try {
      var touchTargets = options.touchTargets || [];

      // 如果提供了代码，尝试提取触摸目标
      if (options.wxmlCode && touchTargets.length === 0) {
        touchTargets = this._extractTouchTargets(
          options.wxmlCode,
          options.wxssCode,
          options.filePath
        );
      }

      result.totalTargets = touchTargets.length;

      for (var i = 0; i < touchTargets.length; i++) {
        var target = touchTargets[i];
        var minSize = Math.min(target.width || 0, target.height || 0);
        var passed = minSize >= ACCESSIBILITY.MIN_TOUCH_TARGET_SIZE;

        var targetResult = {
          element: target.element,
          file: target.file,
          line: target.line,
          width: target.width,
          height: target.height,
          minSize: minSize,
          passed: passed,
          minRequired: ACCESSIBILITY.MIN_TOUCH_TARGET_SIZE
        };

        if (passed) {
          result.passedTargets.push(targetResult);
        } else {
          result.failedTargets.push(targetResult);

          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.ACCESSIBILITY,
            severity: AuditConfig.AuditSeverity.MAJOR,
            type: AuditConfig.AuditIssueType.TOUCH_TARGET_TOO_SMALL,
            file: target.file,
            line: target.line,
            description: '触摸目标 ' + minSize + 'rpx 小于最小要求 ' + ACCESSIBILITY.MIN_TOUCH_TARGET_SIZE + 'rpx',
            suggestion: '增大触摸目标尺寸以提高可用性',
            metadata: {
              element: target.element,
              width: target.width,
              height: target.height,
              minRequired: ACCESSIBILITY.MIN_TOUCH_TARGET_SIZE
            }
          }));
        }
      }

      result.recommendations = this._generateTouchTargetRecommendations(result);

    } catch (error) {
      console.error('❌ 触摸目标检查失败:', error);
      result.error = error.message || String(error);
    }

    return result;
  },


  /**
   * 综合样式审计
   * 执行所有样式检查并返回综合报告
   *
   * @param {Object} options - 审计选项
   * @param {string} [options.wxmlCode] - WXML代码
   * @param {string} [options.wxssCode] - WXSS代码
   * @param {string} [options.jsonCode] - JSON配置代码
   * @param {string} [options.filePath] - 文件路径
   * @returns {Object} 综合审计报告
   */
  auditAll: function(options) {
    options = options || {};

    var report = {
      timestamp: new Date().toISOString(),
      vantUsage: null,
      designSystem: null,
      colorContrast: null,
      touchTargets: null,
      summary: {
        totalIssues: 0,
        criticalIssues: 0,
        majorIssues: 0,
        minorIssues: 0,
        vantUsageRatio: 0,
        accessibilityScore: 100
      },
      allIssues: [],
      recommendations: []
    };

    try {
      // 1. 检查Vant组件使用
      report.vantUsage = this.checkVantUsage({
        wxmlCode: options.wxmlCode,
        jsonCode: options.jsonCode,
        filePath: options.filePath
      });

      // 2. 检查设计规范
      report.designSystem = this.checkDesignSystem({
        wxssCode: options.wxssCode,
        filePath: options.filePath
      });

      // 3. 检查颜色对比度
      report.colorContrast = this.checkColorContrast({
        wxssCode: options.wxssCode,
        colorPairs: options.colorPairs,
        filePath: options.filePath
      });

      // 4. 检查触摸目标
      report.touchTargets = this.checkTouchTargets({
        wxmlCode: options.wxmlCode,
        wxssCode: options.wxssCode,
        touchTargets: options.touchTargets,
        filePath: options.filePath
      });

      // 汇总问题
      if (report.vantUsage && report.vantUsage.issues) {
        report.allIssues = report.allIssues.concat(report.vantUsage.issues);
      }
      if (report.designSystem && report.designSystem.issues) {
        report.allIssues = report.allIssues.concat(report.designSystem.issues);
      }
      if (report.colorContrast && report.colorContrast.issues) {
        report.allIssues = report.allIssues.concat(report.colorContrast.issues);
      }
      if (report.touchTargets && report.touchTargets.issues) {
        report.allIssues = report.allIssues.concat(report.touchTargets.issues);
      }

      // 统计问题数量
      report.summary.totalIssues = report.allIssues.length;
      for (var i = 0; i < report.allIssues.length; i++) {
        var issue = report.allIssues[i];
        switch (issue.severity) {
          case AuditConfig.AuditSeverity.CRITICAL:
            report.summary.criticalIssues++;
            break;
          case AuditConfig.AuditSeverity.MAJOR:
            report.summary.majorIssues++;
            break;
          case AuditConfig.AuditSeverity.MINOR:
            report.summary.minorIssues++;
            break;
        }
      }

      // 计算Vant使用率
      if (report.vantUsage) {
        report.summary.vantUsageRatio = report.vantUsage.vantUsageRatio;
      }

      // 计算无障碍评分
      report.summary.accessibilityScore = this._calculateAccessibilityScore(report);

      // 汇总建议
      report.recommendations = this._generateOverallRecommendations(report);

    } catch (error) {
      console.error('❌ 综合样式审计失败:', error);
      report.error = error.message || String(error);
    }

    return report;
  },


  // ==================== 私有辅助方法 ====================

  /**
   * 判断是否是自定义组件
   * @private
   */
  _isCustomComponent: function(tagName, registeredComponents) {
    // 原生标签列表
    var nativeTags = [
      'view', 'scroll-view', 'swiper', 'swiper-item', 'movable-area', 'movable-view',
      'cover-view', 'cover-image', 'icon', 'text', 'rich-text', 'progress',
      'button', 'checkbox', 'checkbox-group', 'form', 'input', 'label', 'picker',
      'picker-view', 'picker-view-column', 'radio', 'radio-group', 'slider',
      'switch', 'textarea', 'navigator', 'functional-page-navigator', 'image',
      'video', 'camera', 'live-player', 'live-pusher', 'map', 'canvas',
      'open-data', 'web-view', 'ad', 'official-account', 'block', 'template',
      'import', 'include', 'wxs', 'slot', 'page-meta', 'navigation-bar',
      'match-media', 'page-container', 'share-element', 'root-portal',
      'channel-live', 'channel-video', 'voip-room', 'keyboard-accessory',
      'aria-component', 'native-component', 'recycle-view', 'recycle-item',
      'list-view', 'grid-view', 'sticky-header', 'sticky-section', 'snapshot'
    ];

    if (nativeTags.indexOf(tagName) !== -1) {
      return false;
    }

    // 检查是否在注册的组件中
    if (registeredComponents && registeredComponents[tagName]) {
      return true;
    }

    // 以van-开头的是Vant组件
    if (tagName.indexOf('van-') === 0) {
      return false;
    }

    // 包含连字符的可能是自定义组件
    return tagName.indexOf('-') !== -1;
  },

  /**
   * 查找可替换的Vant组件
   * @private
   */
  _findVantReplacement: function(tagName) {
    var lowerName = tagName.toLowerCase();

    // 直接匹配
    if (REPLACEABLE_PATTERNS[lowerName]) {
      return REPLACEABLE_PATTERNS[lowerName];
    }

    // 部分匹配
    var keys = Object.keys(REPLACEABLE_PATTERNS);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (lowerName.indexOf(key) !== -1) {
        return REPLACEABLE_PATTERNS[key];
      }
    }

    return null;
  },

  /**
   * 标准化颜色值
   * @private
   */
  _normalizeColor: function(color) {
    if (!color) return '';

    color = color.toLowerCase().trim();

    // 将3位颜色扩展为6位
    if (/^#[0-9a-f]{3}$/.test(color)) {
      return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }

    return color;
  },

  /**
   * 判断是否是常见颜色
   * @private
   */
  _isCommonColor: function(color) {
    var commonColors = [
      '#ffffff', '#000000', '#333333', '#666666', '#999999', '#cccccc',
      '#f5f5f5', '#fafafa', '#eeeeee', '#e5e5e5', '#dddddd',
      'transparent', 'inherit', 'initial'
    ];
    return commonColors.indexOf(color) !== -1;
  },

  /**
   * 查找最接近的间距值
   * @private
   */
  _findClosestSpacing: function(value) {
    var spacingValues = [8, 16, 24, 32, 48];
    var closest = spacingValues[0];
    var minDiff = Math.abs(value - closest);

    for (var i = 1; i < spacingValues.length; i++) {
      var diff = Math.abs(value - spacingValues[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = spacingValues[i];
      }
    }

    return closest + 'rpx';
  },

  /**
   * 查找最接近的圆角值
   * @private
   */
  _findClosestBorderRadius: function(value) {
    var radiusValues = [8, 12, 16, 999];
    var closest = radiusValues[0];
    var minDiff = Math.abs(value - closest);

    for (var i = 1; i < radiusValues.length; i++) {
      var diff = Math.abs(value - radiusValues[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = radiusValues[i];
      }
    }

    return closest + 'rpx';
  },


  /**
   * 从WXSS中提取颜色对
   * @private
   */
  _extractColorPairs: function(wxssCode, filePath) {
    var pairs = [];

    if (!wxssCode) {
      return pairs;
    }

    // 简单的颜色对提取（实际实现需要更复杂的CSS解析）
    var rulePattern = /([^{}]+)\{([^{}]+)\}/g;
    var match;

    while ((match = rulePattern.exec(wxssCode)) !== null) {
      var properties = match[2];

      var colorMatch = properties.match(/(?:^|;)\s*color\s*:\s*(#[0-9a-fA-F]{3,8})/i);
      var bgMatch = properties.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})/i);

      if (colorMatch && bgMatch) {
        pairs.push({
          foreground: colorMatch[1],
          background: bgMatch[1],
          file: filePath || 'unknown.wxss',
          line: this._getLineNumber(wxssCode, match.index)
        });
      }
    }

    return pairs;
  },

  /**
   * 从WXML中提取触摸目标
   * @private
   */
  _extractTouchTargets: function(wxmlCode, wxssCode, filePath) {
    var targets = [];

    if (!wxmlCode) {
      return targets;
    }

    // 匹配可点击元素
    var clickablePattern = /<(button|view|image|text)[^>]*(?:bind(?:tap|click)|catchtap)[^>]*>/gi;
    var match;

    while ((match = clickablePattern.exec(wxmlCode)) !== null) {
      var element = match[1];
      var attrs = match[0];

      // 尝试从style属性提取尺寸
      var widthMatch = attrs.match(/(?:width|min-width)\s*[:=]\s*["']?(\d+)(?:rpx)?["']?/i);
      var heightMatch = attrs.match(/(?:height|min-height)\s*[:=]\s*["']?(\d+)(?:rpx)?["']?/i);

      var width = widthMatch ? parseInt(widthMatch[1], 10) : 0;
      var height = heightMatch ? parseInt(heightMatch[1], 10) : 0;

      // 如果没有内联样式，尝试从class获取
      if (width === 0 || height === 0) {
        var classMatch = attrs.match(/class\s*=\s*["']([^"']+)["']/i);
        if (classMatch && wxssCode) {
          var classes = classMatch[1].split(/\s+/);
          for (var i = 0; i < classes.length; i++) {
            var classStyles = this._getClassStyles(wxssCode, classes[i]);
            if (classStyles.width && width === 0) {
              width = classStyles.width;
            }
            if (classStyles.height && height === 0) {
              height = classStyles.height;
            }
          }
        }
      }

      // 只添加有尺寸信息的目标
      if (width > 0 || height > 0) {
        targets.push({
          element: element,
          file: filePath || 'unknown.wxml',
          line: this._getLineNumber(wxmlCode, match.index),
          width: width,
          height: height
        });
      }
    }

    return targets;
  },

  /**
   * 从WXSS中获取类样式
   * @private
   */
  _getClassStyles: function(wxssCode, className) {
    var styles = { width: 0, height: 0 };

    var classPattern = new RegExp('\\.' + className + '\\s*\\{([^}]+)\\}', 'i');
    var match = wxssCode.match(classPattern);

    if (match) {
      var properties = match[1];

      var widthMatch = properties.match(/(?:width|min-width)\s*:\s*(\d+)(?:rpx)?/i);
      var heightMatch = properties.match(/(?:height|min-height)\s*:\s*(\d+)(?:rpx)?/i);

      if (widthMatch) {
        styles.width = parseInt(widthMatch[1], 10);
      }
      if (heightMatch) {
        styles.height = parseInt(heightMatch[1], 10);
      }
    }

    return styles;
  },

  /**
   * 获取代码中的行号
   * @private
   */
  _getLineNumber: function(code, index) {
    var lines = code.substring(0, index).split('\n');
    return lines.length;
  },


  /**
   * 计算颜色对比度
   * 基于WCAG 2.0算法
   * @private
   */
  _calculateContrastRatio: function(foreground, background) {
    var fgLuminance = this._getRelativeLuminance(foreground);
    var bgLuminance = this._getRelativeLuminance(background);

    var lighter = Math.max(fgLuminance, bgLuminance);
    var darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * 计算相对亮度
   * @private
   */
  _getRelativeLuminance: function(color) {
    var rgb = this._hexToRgb(color);
    if (!rgb) {
      return 0;
    }

    var r = this._linearize(rgb.r / 255);
    var g = this._linearize(rgb.g / 255);
    var b = this._linearize(rgb.b / 255);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  /**
   * 线性化颜色分量
   * @private
   */
  _linearize: function(value) {
    if (value <= 0.03928) {
      return value / 12.92;
    }
    return Math.pow((value + 0.055) / 1.055, 2.4);
  },

  /**
   * 将十六进制颜色转换为RGB
   * @private
   */
  _hexToRgb: function(hex) {
    if (!hex) {
      return null;
    }

    hex = this._normalizeColor(hex);

    var result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return null;
    }

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  },

  /**
   * 计算无障碍评分
   * @private
   */
  _calculateAccessibilityScore: function(report) {
    var score = 100;
    var deductions = 0;

    // 颜色对比度问题扣分
    if (report.colorContrast && report.colorContrast.failedPairs) {
      deductions += report.colorContrast.failedPairs.length * 10;
    }

    // 触摸目标问题扣分
    if (report.touchTargets && report.touchTargets.failedTargets) {
      deductions += report.touchTargets.failedTargets.length * 5;
    }

    // 字体大小问题扣分
    if (report.designSystem && report.designSystem.fontSizeViolations) {
      deductions += report.designSystem.fontSizeViolations.length * 5;
    }

    return Math.max(0, score - deductions);
  },


  /**
   * 生成Vant使用建议
   * @private
   */
  _generateVantRecommendations: function(result) {
    var recommendations = [];

    if (result.replaceableComponents && result.replaceableComponents.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: '使用Vant组件替换自定义组件',
        description: '有 ' + result.replaceableComponents.length + ' 个自定义组件可替换为Vant组件',
        action: '逐步将自定义组件替换为对应的Vant组件'
      });
    }

    if (result.vantUsageRatio < 0.5 && result.totalComponents > 5) {
      recommendations.push({
        priority: 'low',
        title: '提高Vant组件使用率',
        description: 'Vant组件使用率仅 ' + (result.vantUsageRatio * 100).toFixed(1) + '%',
        action: '优先使用Vant组件以保持UI一致性'
      });
    }

    return recommendations;
  },

  /**
   * 生成设计规范建议
   * @private
   */
  _generateDesignSystemRecommendations: function(result) {
    var recommendations = [];

    if (result.colorViolations && result.colorViolations.length > 5) {
      recommendations.push({
        priority: 'medium',
        title: '统一颜色使用',
        description: '有 ' + result.colorViolations.length + ' 处颜色值不在设计系统中',
        action: '使用设计系统定义的颜色变量'
      });
    }

    if (result.spacingViolations && result.spacingViolations.length > 5) {
      recommendations.push({
        priority: 'low',
        title: '统一间距使用',
        description: '有 ' + result.spacingViolations.length + ' 处间距值不符合8的倍数规则',
        action: '使用8rpx的倍数作为间距值'
      });
    }

    if (result.fontSizeViolations && result.fontSizeViolations.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '修复字体大小问题',
        description: '有 ' + result.fontSizeViolations.length + ' 处字体大小小于最小要求',
        action: '将字体大小增大到至少 ' + ACCESSIBILITY.MIN_FONT_SIZE + 'rpx'
      });
    }

    return recommendations;
  },

  /**
   * 生成对比度建议
   * @private
   */
  _generateContrastRecommendations: function(result) {
    var recommendations = [];

    if (result.failedPairs && result.failedPairs.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '修复颜色对比度问题',
        description: '有 ' + result.failedPairs.length + ' 处颜色对比度不符合WCAG AA标准',
        action: '增加前景色和背景色之间的对比度，确保比值至少为4.5:1'
      });
    }

    return recommendations;
  },

  /**
   * 生成触摸目标建议
   * @private
   */
  _generateTouchTargetRecommendations: function(result) {
    var recommendations = [];

    if (result.failedTargets && result.failedTargets.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '增大触摸目标',
        description: '有 ' + result.failedTargets.length + ' 个触摸目标小于最小要求',
        action: '将触摸目标尺寸增大到至少 ' + ACCESSIBILITY.MIN_TOUCH_TARGET_SIZE + 'rpx'
      });
    }

    return recommendations;
  },

  /**
   * 生成综合建议
   * @private
   */
  _generateOverallRecommendations: function(report) {
    var recommendations = [];

    // 汇总各部分建议
    if (report.vantUsage && report.vantUsage.recommendations) {
      recommendations = recommendations.concat(report.vantUsage.recommendations);
    }
    if (report.designSystem && report.designSystem.recommendations) {
      recommendations = recommendations.concat(report.designSystem.recommendations);
    }
    if (report.colorContrast && report.colorContrast.recommendations) {
      recommendations = recommendations.concat(report.colorContrast.recommendations);
    }
    if (report.touchTargets && report.touchTargets.recommendations) {
      recommendations = recommendations.concat(report.touchTargets.recommendations);
    }

    // 按优先级排序
    var priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort(function(a, b) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return recommendations;
  },

  /**
   * 生成报告摘要文本
   *
   * @param {Object} report - 审计报告对象
   * @returns {string} 摘要文本
   */
  generateSummaryText: function(report) {
    if (!report) {
      return '无审计报告';
    }

    var lines = [
      '========== 样式一致性审计报告 ==========',
      '时间: ' + report.timestamp,
      '',
      '【总览】',
      '  总问题数: ' + report.summary.totalIssues,
      '  严重问题: ' + report.summary.criticalIssues,
      '  主要问题: ' + report.summary.majorIssues,
      '  次要问题: ' + report.summary.minorIssues,
      '  Vant使用率: ' + (report.summary.vantUsageRatio * 100).toFixed(1) + '%',
      '  无障碍评分: ' + report.summary.accessibilityScore + '/100'
    ];

    if (report.recommendations && report.recommendations.length > 0) {
      lines.push('');
      lines.push('【优化建议】');
      for (var i = 0; i < Math.min(5, report.recommendations.length); i++) {
        var rec = report.recommendations[i];
        lines.push('  ' + (i + 1) + '. [' + rec.priority.toUpperCase() + '] ' + rec.title);
      }
    }

    lines.push('');
    lines.push('=====================================');

    return lines.join('\n');
  }
};

// 导出模块
module.exports = StyleAuditor;
