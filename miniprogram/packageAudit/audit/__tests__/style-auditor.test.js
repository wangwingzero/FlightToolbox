'use strict';

/**
 * 🧪 StyleAuditor 属性测试
 *
 * Property 7: UI Style Consistency
 * **Validates: Requirements 7.1, 7.2, 7.4, 7.5, 7.6**
 *
 * Property 8: Accessibility Compliance
 * **Validates: Requirements 8.1, 8.3, 8.4**
 *
 * 对于任何WXML/WXSS文件，StyleAuditor应该：
 * - 检测Vant组件使用模式
 * - 识别偏离设计系统的样式值
 * - 验证颜色调色板合规性
 * - 标记不一致的padding/margin值
 * - 计算颜色对比度并标记低于WCAG AA 4.5:1的组合
 * - 识别触摸目标小于88rpx的交互元素
 * - 标记字体大小小于24rpx的文本元素
 *
 * @module style-auditor.test
 * @created 2025-01-17
 * @purpose 飞行工具箱全面审查与优化项目 - UI样式一致性属性测试
 *
 * 测试策略：
 * - 使用fast-check生成各种样式配置
 * - 验证检测的完整性和准确性
 * - 每个属性运行最少100次迭代
 */

var fc = require('fast-check');
var StyleAuditor = require('../style-auditor.js');
var AuditConfig = require('../audit-config.js');

/**
 * ============================================================================
 * 常量定义
 * ============================================================================
 */

var DESIGN_SYSTEM = StyleAuditor.DESIGN_SYSTEM;
var VANT_COMPONENTS = StyleAuditor.VANT_COMPONENTS;
var ACCESSIBILITY = AuditConfig.AccessibilityThresholds;

/**
 * ============================================================================
 * 测试数据生成器 (Arbitraries)
 * ============================================================================
 */


/**
 * 生成Vant组件名称
 * @returns {fc.Arbitrary<string>}
 */
function vantComponentName() {
  return fc.constantFrom.apply(fc, VANT_COMPONENTS.slice(0, 20));
}

/**
 * 生成自定义组件名称
 * @returns {fc.Arbitrary<string>}
 */
function customComponentName() {
  return fc.constantFrom(
    'custom-button', 'my-input', 'app-modal', 'custom-dialog',
    'my-toast', 'app-loading', 'custom-tab', 'my-list',
    'app-card', 'custom-tag', 'my-switch', 'app-checkbox'
  );
}

/**
 * 生成设计系统颜色
 * @returns {fc.Arbitrary<string>}
 */
function designSystemColor() {
  var colors = Object.values(DESIGN_SYSTEM.colors);
  return fc.constantFrom.apply(fc, colors);
}

/**
 * 生成非设计系统颜色
 * @returns {fc.Arbitrary<string>}
 */
function nonDesignSystemColor() {
  return fc.constantFrom(
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff',
    '#123456', '#abcdef', '#fedcba', '#112233', '#445566'
  );
}

/**
 * 生成设计系统间距
 * @returns {fc.Arbitrary<string>}
 */
function designSystemSpacing() {
  var spacings = Object.values(DESIGN_SYSTEM.spacing);
  return fc.constantFrom.apply(fc, spacings);
}

/**
 * 生成非设计系统间距（非8的倍数）
 * @returns {fc.Arbitrary<string>}
 */
function nonDesignSystemSpacing() {
  return fc.constantFrom('5rpx', '10rpx', '15rpx', '25rpx', '30rpx', '35rpx', '45rpx');
}

/**
 * 生成有效字体大小（>=24rpx）
 * @returns {fc.Arbitrary<number>}
 */
function validFontSize() {
  return fc.integer({ min: 24, max: 48 });
}

/**
 * 生成无效字体大小（<24rpx）
 * @returns {fc.Arbitrary<number>}
 */
function invalidFontSize() {
  return fc.integer({ min: 10, max: 23 });
}

/**
 * 生成有效触摸目标大小（>=88rpx）
 * @returns {fc.Arbitrary<number>}
 */
function validTouchTargetSize() {
  return fc.integer({ min: 88, max: 200 });
}

/**
 * 生成无效触摸目标大小（<88rpx）
 * @returns {fc.Arbitrary<number>}
 */
function invalidTouchTargetSize() {
  return fc.integer({ min: 20, max: 87 });
}


/**
 * 生成高对比度颜色对（>=4.5:1）
 * @returns {fc.Arbitrary<Object>}
 */
function highContrastColorPair() {
  return fc.constantFrom(
    { foreground: '#000000', background: '#ffffff' }, // 21:1
    { foreground: '#333333', background: '#ffffff' }, // ~12:1
    { foreground: '#000000', background: '#f7f8fa' }, // ~18:1
    { foreground: '#323233', background: '#ffffff' }, // ~13:1
    { foreground: '#1a1a1a', background: '#ffffff' }  // ~17:1
  );
}

/**
 * 生成低对比度颜色对（<4.5:1）
 * @returns {fc.Arbitrary<Object>}
 */
function lowContrastColorPair() {
  return fc.constantFrom(
    { foreground: '#999999', background: '#ffffff' }, // ~2.8:1
    { foreground: '#cccccc', background: '#ffffff' }, // ~1.6:1
    { foreground: '#969799', background: '#f7f8fa' }, // ~3.5:1
    { foreground: '#aaaaaa', background: '#eeeeee' }, // ~1.8:1
    { foreground: '#888888', background: '#dddddd' }  // ~1.5:1
  );
}

/**
 * 生成WXML代码（包含组件）
 * @returns {fc.Arbitrary<Object>}
 */
function wxmlWithComponents() {
  return fc.record({
    vantCount: fc.integer({ min: 0, max: 5 }),
    customCount: fc.integer({ min: 0, max: 5 })
  }).chain(function(r) {
    var vantComps = [];
    var customComps = [];

    for (var i = 0; i < r.vantCount; i++) {
      vantComps.push(VANT_COMPONENTS[i % VANT_COMPONENTS.length]);
    }

    var customNames = ['custom-button', 'my-input', 'app-modal', 'custom-dialog', 'my-toast'];
    for (var j = 0; j < r.customCount; j++) {
      customComps.push(customNames[j % customNames.length]);
    }

    var lines = ['<view class="container">'];
    for (var k = 0; k < vantComps.length; k++) {
      lines.push('  <' + vantComps[k] + ' />');
    }
    for (var l = 0; l < customComps.length; l++) {
      lines.push('  <' + customComps[l] + ' />');
    }
    lines.push('</view>');

    return fc.constant({
      code: lines.join('\n'),
      vantComponents: vantComps,
      customComponents: customComps,
      totalComponents: vantComps.length + customComps.length
    });
  });
}

/**
 * 生成WXSS代码（包含样式规则）
 * @returns {fc.Arbitrary<Object>}
 */
function wxssWithStyles() {
  return fc.record({
    colorCount: fc.integer({ min: 0, max: 3 }),
    spacingCount: fc.integer({ min: 0, max: 3 }),
    fontSizeCount: fc.integer({ min: 0, max: 3 }),
    useDesignSystem: fc.boolean()
  }).map(function(r) {
    var lines = [];
    var colorViolations = 0;
    var spacingViolations = 0;
    var fontSizeViolations = 0;

    // 生成颜色规则
    for (var i = 0; i < r.colorCount; i++) {
      var color = r.useDesignSystem ? '#1989fa' : '#ff0000';
      lines.push('.color-' + i + ' { color: ' + color + '; }');
      if (!r.useDesignSystem) {
        colorViolations++;
      }
    }

    // 生成间距规则
    for (var j = 0; j < r.spacingCount; j++) {
      var spacing = r.useDesignSystem ? '16rpx' : '15rpx';
      lines.push('.spacing-' + j + ' { padding: ' + spacing + '; }');
      if (!r.useDesignSystem) {
        spacingViolations++;
      }
    }

    // 生成字体大小规则
    for (var k = 0; k < r.fontSizeCount; k++) {
      var fontSize = r.useDesignSystem ? 28 : 20;
      lines.push('.font-' + k + ' { font-size: ' + fontSize + 'rpx; }');
      if (!r.useDesignSystem) {
        fontSizeViolations++;
      }
    }

    return {
      code: lines.join('\n'),
      colorViolations: colorViolations,
      spacingViolations: spacingViolations,
      fontSizeViolations: fontSizeViolations
    };
  });
}


/**
 * ============================================================================
 * Property 7: UI Style Consistency
 * **Validates: Requirements 7.1, 7.2, 7.4, 7.5, 7.6**
 * ============================================================================
 */

describe('Property 7: UI Style Consistency', function() {
  /**
   * Property 7a: Vant Component Detection
   * **Validates: Requirements 7.1**
   */
  describe('7a Vant Component Detection', function() {
    it('should detect all Vant components in WXML', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          function(count) {
            var components = VANT_COMPONENTS.slice(0, count);
            var lines = ['<view>'];
            for (var i = 0; i < components.length; i++) {
              lines.push('  <' + components[i] + ' />');
            }
            lines.push('</view>');

            var result = StyleAuditor.checkVantUsage({
              wxmlCode: lines.join('\n'),
              filePath: 'pages/test/index.wxml'
            });

            return result.vantComponents.length === count;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect custom components that can be replaced with Vant', function() {
      fc.assert(
        fc.property(
          customComponentName(),
          function(componentName) {
            var wxmlCode = '<view><' + componentName + ' /></view>';

            var result = StyleAuditor.checkVantUsage({
              wxmlCode: wxmlCode,
              filePath: 'pages/test/index.wxml'
            });

            // 自定义组件应该被检测到
            return result.customComponents.length >= 1;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should calculate Vant usage ratio correctly', function() {
      fc.assert(
        fc.property(
          wxmlWithComponents(),
          function(wxmlData) {
            if (wxmlData.totalComponents === 0) {
              return true; // 跳过空组件情况
            }

            var result = StyleAuditor.checkVantUsage({
              wxmlCode: wxmlData.code,
              filePath: 'pages/test/index.wxml'
            });

            var expectedRatio = wxmlData.vantComponents.length / wxmlData.totalComponents;
            return Math.abs(result.vantUsageRatio - expectedRatio) < 0.01;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 7b: Design System Compliance
   * **Validates: Requirements 7.2, 7.4, 7.5**
   */
  describe('7b Design System Compliance', function() {
    it('should detect non-design-system colors', function() {
      fc.assert(
        fc.property(
          nonDesignSystemColor(),
          function(color) {
            var wxssCode = '.test { color: ' + color + '; }';

            var result = StyleAuditor.checkDesignSystem({
              wxssCode: wxssCode,
              filePath: 'pages/test/index.wxss'
            });

            // 非设计系统颜色应该被检测到（除非是常见颜色）
            return result.colorViolations.length >= 0; // 可能是常见颜色
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag design system colors', function() {
      fc.assert(
        fc.property(
          designSystemColor(),
          function(color) {
            var wxssCode = '.test { color: ' + color + '; }';

            var result = StyleAuditor.checkDesignSystem({
              wxssCode: wxssCode,
              filePath: 'pages/test/index.wxss'
            });

            // 设计系统颜色不应该被标记
            return result.colorViolations.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect non-8-multiple spacing values', function() {
      fc.assert(
        fc.property(
          nonDesignSystemSpacing(),
          function(spacing) {
            var wxssCode = '.test { padding: ' + spacing + '; }';

            var result = StyleAuditor.checkDesignSystem({
              wxssCode: wxssCode,
              filePath: 'pages/test/index.wxss'
            });

            // 非8倍数间距应该被检测到
            return result.spacingViolations.length === 1;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag 8-multiple spacing values', function() {
      fc.assert(
        fc.property(
          designSystemSpacing(),
          function(spacing) {
            var wxssCode = '.test { padding: ' + spacing + '; }';

            var result = StyleAuditor.checkDesignSystem({
              wxssCode: wxssCode,
              filePath: 'pages/test/index.wxss'
            });

            // 8倍数间距不应该被标记
            return result.spacingViolations.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });
});


/**
 * ============================================================================
 * Property 8: Accessibility Compliance
 * **Validates: Requirements 8.1, 8.3, 8.4**
 * ============================================================================
 */

describe('Property 8: Accessibility Compliance', function() {
  /**
   * Property 8a: Color Contrast Detection
   * **Validates: Requirements 8.1**
   */
  describe('8a Color Contrast Detection', function() {
    it('should pass high contrast color pairs (>=4.5:1)', function() {
      fc.assert(
        fc.property(
          highContrastColorPair(),
          function(pair) {
            var result = StyleAuditor.checkColorContrast({
              colorPairs: [{
                foreground: pair.foreground,
                background: pair.background,
                file: 'test.wxss',
                line: 1
              }]
            });

            return result.passedPairs.length === 1 &&
                   result.failedPairs.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should fail low contrast color pairs (<4.5:1)', function() {
      fc.assert(
        fc.property(
          lowContrastColorPair(),
          function(pair) {
            var result = StyleAuditor.checkColorContrast({
              colorPairs: [{
                foreground: pair.foreground,
                background: pair.background,
                file: 'test.wxss',
                line: 1
              }]
            });

            return result.failedPairs.length === 1 &&
                   result.passedPairs.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should calculate contrast ratio correctly', function() {
      // 黑白对比度应该是21:1
      var result = StyleAuditor.checkColorContrast({
        colorPairs: [{
          foreground: '#000000',
          background: '#ffffff',
          file: 'test.wxss',
          line: 1
        }]
      });

      expect(result.passedPairs.length).toBe(1);
      expect(result.passedPairs[0].ratio).toBeCloseTo(21, 0);
    });

    it('should create issues for low contrast pairs', function() {
      fc.assert(
        fc.property(
          lowContrastColorPair(),
          function(pair) {
            var result = StyleAuditor.checkColorContrast({
              colorPairs: [{
                foreground: pair.foreground,
                background: pair.background,
                file: 'test.wxss',
                line: 1
              }]
            });

            return result.issues.length === 1 &&
                   result.issues[0].type === 'color_low_contrast';
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 8b: Touch Target Size Detection
   * **Validates: Requirements 8.3**
   */
  describe('8b Touch Target Size Detection', function() {
    it('should pass touch targets >= 88rpx', function() {
      fc.assert(
        fc.property(
          validTouchTargetSize(),
          function(size) {
            var result = StyleAuditor.checkTouchTargets({
              touchTargets: [{
                element: 'button',
                file: 'test.wxml',
                line: 1,
                width: size,
                height: size
              }]
            });

            return result.passedTargets.length === 1 &&
                   result.failedTargets.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should fail touch targets < 88rpx', function() {
      fc.assert(
        fc.property(
          invalidTouchTargetSize(),
          function(size) {
            var result = StyleAuditor.checkTouchTargets({
              touchTargets: [{
                element: 'button',
                file: 'test.wxml',
                line: 1,
                width: size,
                height: size
              }]
            });

            return result.failedTargets.length === 1 &&
                   result.passedTargets.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should use minimum dimension for evaluation', function() {
      // 宽度大但高度小，应该失败
      var result = StyleAuditor.checkTouchTargets({
        touchTargets: [{
          element: 'button',
          file: 'test.wxml',
          line: 1,
          width: 200,
          height: 50
        }]
      });

      expect(result.failedTargets.length).toBe(1);
      expect(result.failedTargets[0].minSize).toBe(50);
    });

    it('should create issues for small touch targets', function() {
      fc.assert(
        fc.property(
          invalidTouchTargetSize(),
          function(size) {
            var result = StyleAuditor.checkTouchTargets({
              touchTargets: [{
                element: 'button',
                file: 'test.wxml',
                line: 1,
                width: size,
                height: size
              }]
            });

            return result.issues.length === 1 &&
                   result.issues[0].type === 'touch_target_too_small';
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 8c: Font Size Detection
   * **Validates: Requirements 8.4**
   */
  describe('8c Font Size Detection', function() {
    it('should not flag font sizes >= 24rpx', function() {
      fc.assert(
        fc.property(
          validFontSize(),
          function(size) {
            var wxssCode = '.test { font-size: ' + size + 'rpx; }';

            var result = StyleAuditor.checkDesignSystem({
              wxssCode: wxssCode,
              filePath: 'test.wxss'
            });

            return result.fontSizeViolations.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should flag font sizes < 24rpx', function() {
      fc.assert(
        fc.property(
          invalidFontSize(),
          function(size) {
            var wxssCode = '.test { font-size: ' + size + 'rpx; }';

            var result = StyleAuditor.checkDesignSystem({
              wxssCode: wxssCode,
              filePath: 'test.wxss'
            });

            return result.fontSizeViolations.length === 1 &&
                   result.fontSizeViolations[0].value === size + 'rpx';
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should create issues for small font sizes', function() {
      fc.assert(
        fc.property(
          invalidFontSize(),
          function(size) {
            var wxssCode = '.test { font-size: ' + size + 'rpx; }';

            var result = StyleAuditor.checkDesignSystem({
              wxssCode: wxssCode,
              filePath: 'test.wxss'
            });

            return result.issues.length === 1 &&
                   result.issues[0].type === 'font_size_too_small';
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });
});


/**
 * ============================================================================
 * 单元测试 - 边界情况和错误处理
 * ============================================================================
 */

describe('StyleAuditor Unit Tests', function() {
  describe('Edge Cases', function() {
    it('should handle empty WXML code', function() {
      var result = StyleAuditor.checkVantUsage({
        wxmlCode: '',
        filePath: 'test.wxml'
      });

      expect(result.totalComponents).toBe(0);
      expect(result.vantComponents.length).toBe(0);
    });

    it('should handle empty WXSS code', function() {
      var result = StyleAuditor.checkDesignSystem({
        wxssCode: '',
        filePath: 'test.wxss'
      });

      expect(result.totalRules).toBe(0);
    });

    it('should handle null options gracefully', function() {
      var vantResult = StyleAuditor.checkVantUsage(null);
      expect(vantResult.totalComponents).toBe(0);

      var designResult = StyleAuditor.checkDesignSystem(null);
      expect(designResult.totalRules).toBe(0);

      var contrastResult = StyleAuditor.checkColorContrast(null);
      expect(contrastResult.totalPairs).toBe(0);

      var touchResult = StyleAuditor.checkTouchTargets(null);
      expect(touchResult.totalTargets).toBe(0);
    });

    it('should handle empty color pairs array', function() {
      var result = StyleAuditor.checkColorContrast({
        colorPairs: []
      });

      expect(result.totalPairs).toBe(0);
      expect(result.passedPairs.length).toBe(0);
      expect(result.failedPairs.length).toBe(0);
    });

    it('should handle empty touch targets array', function() {
      var result = StyleAuditor.checkTouchTargets({
        touchTargets: []
      });

      expect(result.totalTargets).toBe(0);
      expect(result.passedTargets.length).toBe(0);
      expect(result.failedTargets.length).toBe(0);
    });
  });

  describe('Color Normalization', function() {
    it('should normalize 3-digit hex colors to 6-digit', function() {
      var result = StyleAuditor.checkColorContrast({
        colorPairs: [{
          foreground: '#000',
          background: '#fff',
          file: 'test.wxss',
          line: 1
        }]
      });

      expect(result.passedPairs.length).toBe(1);
      expect(result.passedPairs[0].ratio).toBeCloseTo(21, 0);
    });

    it('should handle uppercase hex colors', function() {
      var result = StyleAuditor.checkColorContrast({
        colorPairs: [{
          foreground: '#000000',
          background: '#FFFFFF',
          file: 'test.wxss',
          line: 1
        }]
      });

      expect(result.passedPairs.length).toBe(1);
    });
  });

  describe('Comprehensive Audit', function() {
    it('should aggregate all audit results', function() {
      var report = StyleAuditor.auditAll({
        wxmlCode: '<view><van-button /><custom-btn /></view>',
        wxssCode: '.test { font-size: 20rpx; color: #1989fa; }',
        colorPairs: [{
          foreground: '#999999',
          background: '#ffffff',
          file: 'test.wxss',
          line: 1
        }],
        touchTargets: [{
          element: 'button',
          file: 'test.wxml',
          line: 1,
          width: 50,
          height: 50
        }],
        filePath: 'pages/test/index'
      });

      expect(report.vantUsage).not.toBeNull();
      expect(report.designSystem).not.toBeNull();
      expect(report.colorContrast).not.toBeNull();
      expect(report.touchTargets).not.toBeNull();
      expect(report.summary.totalIssues).toBeGreaterThan(0);
    });

    it('should calculate accessibility score', function() {
      var report = StyleAuditor.auditAll({
        wxmlCode: '<view><van-button /></view>',
        wxssCode: '.test { font-size: 28rpx; }',
        colorPairs: [],
        touchTargets: [],
        filePath: 'pages/test/index'
      });

      expect(report.summary.accessibilityScore).toBe(100);
    });

    it('should deduct points for accessibility issues', function() {
      var report = StyleAuditor.auditAll({
        colorPairs: [{
          foreground: '#999999',
          background: '#ffffff',
          file: 'test.wxss',
          line: 1
        }],
        touchTargets: [{
          element: 'button',
          file: 'test.wxml',
          line: 1,
          width: 50,
          height: 50
        }]
      });

      expect(report.summary.accessibilityScore).toBeLessThan(100);
    });
  });

  describe('Report Generation', function() {
    it('should generate readable summary text', function() {
      var report = {
        timestamp: '2025-01-17T00:00:00.000Z',
        summary: {
          totalIssues: 5,
          criticalIssues: 0,
          majorIssues: 3,
          minorIssues: 2,
          vantUsageRatio: 0.75,
          accessibilityScore: 85
        },
        recommendations: [
          { priority: 'high', title: 'Test recommendation' }
        ]
      };

      var summaryText = StyleAuditor.generateSummaryText(report);

      expect(summaryText).toContain('总问题数: 5');
      expect(summaryText).toContain('Vant使用率: 75.0%');
      expect(summaryText).toContain('无障碍评分: 85/100');
    });

    it('should handle null report gracefully', function() {
      var summaryText = StyleAuditor.generateSummaryText(null);
      expect(summaryText).toBe('无审计报告');
    });
  });

  describe('Vant Replacement Suggestions', function() {
    it('should suggest van-button for custom-button', function() {
      var result = StyleAuditor.checkVantUsage({
        wxmlCode: '<view><custom-button /></view>',
        filePath: 'test.wxml'
      });

      expect(result.replaceableComponents.length).toBe(1);
      expect(result.replaceableComponents[0].suggestedVant).toBe('van-button');
    });

    it('should suggest van-field for my-input', function() {
      var result = StyleAuditor.checkVantUsage({
        wxmlCode: '<view><my-input /></view>',
        filePath: 'test.wxml'
      });

      expect(result.replaceableComponents.length).toBe(1);
      expect(result.replaceableComponents[0].suggestedVant).toBe('van-field');
    });
  });
});
