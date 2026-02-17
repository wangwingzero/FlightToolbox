'use strict';

/**
 * 🖼️ 图片资源分析器
 *
 * 扫描和分析微信小程序中的图片资源
 * 检测图片格式、大小、缺失属性和跨分包重复
 *
 * @module image-analyzer
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 图片资源优化
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - WebP/AVIF格式优先，比PNG/JPG减少约30%体积
 * - 单张本地图片建议不超过100KB（大图应托管CDN）
 * - 分享缩略图限制128KB以内
 * - 使用lazy-load属性实现懒加载
 * - 所有image元素应有明确的width/height属性
 * - 避免跨分包重复存储相同图片
 *
 * @example
 * var ImageAnalyzer = require('./image-analyzer.js');
 * var result = ImageAnalyzer.scanImageFiles({ fileSystem: fs });
 * var elements = ImageAnalyzer.checkImageElements({ wxmlCode: code });
 * var duplicates = ImageAnalyzer.detectDuplicateImages({ imageFiles: files });
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 图片资源阈值常量
 * @constant {Object}
 */
var THRESHOLDS = {
  MAX_IMAGE_SIZE: 100 * 1024,       // 100KB - 单张图片最大建议值
  WARNING_IMAGE_SIZE: 50 * 1024,    // 50KB - 警告阈值
  SHARE_THUMBNAIL_MAX: 128 * 1024,  // 128KB - 分享缩略图限制
  APP_SHARE_MAX: 32 * 1024          // 32KB - App分享限制
};

/**
 * 推荐的图片格式（按优先级排序）
 * @constant {Array}
 */
var RECOMMENDED_FORMATS = ['webp', 'avif', 'png', 'jpg', 'jpeg', 'svg'];

/**
 * 支持的图片扩展名
 * @constant {Array}
 */
var IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.bmp', '.ico'];

/**
 * 不推荐的图片格式（体积大或兼容性差）
 * @constant {Array}
 */
var DISCOURAGED_FORMATS = ['bmp', 'tiff', 'tif', 'gif'];

/**
 * 图片资源分析器
 * @namespace ImageAnalyzer
 */
var ImageAnalyzer = {
  /**
   * 阈值常量
   */
  THRESHOLDS: THRESHOLDS,

  /**
   * 推荐格式
   */
  RECOMMENDED_FORMATS: RECOMMENDED_FORMATS,

  /**
   * 支持的扩展名
   */
  IMAGE_EXTENSIONS: IMAGE_EXTENSIONS,

  /**
   * 不推荐的格式
   */
  DISCOURAGED_FORMATS: DISCOURAGED_FORMATS,


  /**
   * 扫描所有图片文件
   * 分析项目中的图片文件格式和大小
   *
   * @param {Object} options - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array} [options.imageFiles] - 图片文件列表（用于测试注入）
   *   每个文件对象包含: { path, size, format, packageRoot }
   * @param {string} [options.basePath] - 基础路径（默认'miniprogram/'）
   * @returns {Object} 图片文件扫描结果
   *
   * @example
   * var result = ImageAnalyzer.scanImageFiles({
   *   imageFiles: [
   *     { path: 'images/logo.png', size: 150000, format: 'png', packageRoot: 'mainPackage' }
   *   ]
   * });
   */
  scanImageFiles: function(options) {
    options = options || {};

    var result = {
      totalFiles: 0,
      totalSize: 0,
      totalSizeFormatted: '0 KB',
      byFormat: {},
      byPackage: {},
      oversizedFiles: [],
      warningFiles: [],
      discouragedFormatFiles: [],
      issues: [],
      recommendations: []
    };

    try {
      // 获取图片文件列表
      var imageFiles = options.imageFiles || [];

      // 如果提供了文件系统接口，扫描实际文件
      if (options.fileSystem && !options.imageFiles) {
        imageFiles = this._scanFileSystem(options.fileSystem, options.basePath || 'miniprogram/');
      }

      result.totalFiles = imageFiles.length;

      // 分析每个图片文件
      for (var i = 0; i < imageFiles.length; i++) {
        var file = imageFiles[i];
        var filePath = file.path;
        var fileSize = file.size || 0;
        var format = file.format || this._getFileFormat(filePath);
        var packageRoot = file.packageRoot || this._getPackageRoot(filePath);

        result.totalSize += fileSize;

        // 按格式统计
        if (!result.byFormat[format]) {
          result.byFormat[format] = {
            count: 0,
            totalSize: 0,
            files: []
          };
        }
        result.byFormat[format].count++;
        result.byFormat[format].totalSize += fileSize;
        result.byFormat[format].files.push({
          path: filePath,
          size: fileSize,
          sizeFormatted: this._formatSize(fileSize)
        });

        // 按分包统计
        if (!result.byPackage[packageRoot]) {
          result.byPackage[packageRoot] = {
            count: 0,
            totalSize: 0,
            files: []
          };
        }
        result.byPackage[packageRoot].count++;
        result.byPackage[packageRoot].totalSize += fileSize;
        result.byPackage[packageRoot].files.push({
          path: filePath,
          size: fileSize,
          format: format
        });

        // 检测超大文件
        if (fileSize > THRESHOLDS.MAX_IMAGE_SIZE) {
          var oversizedInfo = {
            path: filePath,
            size: fileSize,
            sizeFormatted: this._formatSize(fileSize),
            format: format,
            packageRoot: packageRoot,
            exceedsBy: fileSize - THRESHOLDS.MAX_IMAGE_SIZE,
            exceedsByFormatted: this._formatSize(fileSize - THRESHOLDS.MAX_IMAGE_SIZE)
          };
          result.oversizedFiles.push(oversizedInfo);

          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.MAJOR,
            type: AuditConfig.AuditIssueType.IMAGE_TOO_LARGE,
            file: filePath,
            description: '图片文件 ' + this._formatSize(fileSize) + ' 超过100KB限制',
            suggestion: '压缩图片或转换为WebP格式，或将大图托管至CDN',
            metadata: {
              size: fileSize,
              threshold: THRESHOLDS.MAX_IMAGE_SIZE,
              format: format
            }
          }));
        }
        // 检测警告级别文件
        else if (fileSize > THRESHOLDS.WARNING_IMAGE_SIZE) {
          result.warningFiles.push({
            path: filePath,
            size: fileSize,
            sizeFormatted: this._formatSize(fileSize),
            format: format,
            packageRoot: packageRoot
          });

          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.MINOR,
            type: AuditConfig.AuditIssueType.IMAGE_TOO_LARGE,
            file: filePath,
            description: '图片文件 ' + this._formatSize(fileSize) + ' 超过50KB警告阈值',
            suggestion: '考虑压缩图片或转换为WebP格式以减小体积',
            metadata: {
              size: fileSize,
              threshold: THRESHOLDS.WARNING_IMAGE_SIZE,
              format: format
            }
          }));
        }

        // 检测不推荐的格式
        if (DISCOURAGED_FORMATS.indexOf(format.toLowerCase()) !== -1) {
          result.discouragedFormatFiles.push({
            path: filePath,
            size: fileSize,
            format: format,
            packageRoot: packageRoot
          });

          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.MINOR,
            type: AuditConfig.AuditIssueType.IMAGE_WRONG_FORMAT,
            file: filePath,
            description: '图片使用不推荐的格式: ' + format.toUpperCase(),
            suggestion: '建议转换为WebP或PNG格式以获得更好的压缩率和兼容性',
            metadata: { format: format }
          }));
        }
      }

      result.totalSizeFormatted = this._formatSize(result.totalSize);

      // 生成优化建议
      result.recommendations = this._generateScanRecommendations(result);

    } catch (error) {
      console.error('❌ 图片文件扫描失败:', error);
      result.error = error.message || String(error);
    }

    return result;
  },


  /**
   * 检查WXML文件中的image元素
   * 检测缺少width/height属性的image元素
   *
   * @param {Object} options - 检查选项
   * @param {string} [options.wxmlCode] - WXML代码（单文件模式）
   * @param {string} [options.filePath] - 文件路径（单文件模式）
   * @param {Array} [options.wxmlFiles] - WXML文件列表（多文件模式）
   *   每个文件对象包含: { path, code }
   * @returns {Object} image元素检查结果
   *
   * @example
   * var result = ImageAnalyzer.checkImageElements({
   *   wxmlCode: '<image src="/images/logo.png" />',
   *   filePath: 'pages/home/index.wxml'
   * });
   */
  checkImageElements: function(options) {
    options = options || {};

    var result = {
      totalElements: 0,
      missingDimensions: [],
      missingLazyLoad: [],
      missingMode: [],
      issues: [],
      recommendations: []
    };

    try {
      var filesToCheck = [];

      // 单文件模式
      if (options.wxmlCode) {
        filesToCheck.push({
          path: options.filePath || 'unknown.wxml',
          code: options.wxmlCode
        });
      }

      // 多文件模式
      if (options.wxmlFiles && options.wxmlFiles.length > 0) {
        filesToCheck = filesToCheck.concat(options.wxmlFiles);
      }

      // 分析每个文件
      for (var i = 0; i < filesToCheck.length; i++) {
        var file = filesToCheck[i];
        var fileResult = this._analyzeWxmlImageElements(file.path, file.code);

        result.totalElements += fileResult.totalElements;
        result.missingDimensions = result.missingDimensions.concat(fileResult.missingDimensions);
        result.missingLazyLoad = result.missingLazyLoad.concat(fileResult.missingLazyLoad);
        result.missingMode = result.missingMode.concat(fileResult.missingMode);
        result.issues = result.issues.concat(fileResult.issues);
      }

      // 生成建议
      result.recommendations = this._generateElementRecommendations(result);

    } catch (error) {
      console.error('❌ image元素检查失败:', error);
      result.error = error.message || String(error);
    }

    return result;
  },

  /**
   * 分析单个WXML文件中的image元素
   * @private
   * @param {string} filePath - 文件路径
   * @param {string} wxmlCode - WXML代码
   * @returns {Object} 分析结果
   */
  _analyzeWxmlImageElements: function(filePath, wxmlCode) {
    var result = {
      totalElements: 0,
      missingDimensions: [],
      missingLazyLoad: [],
      missingMode: [],
      issues: []
    };

    if (!wxmlCode) {
      return result;
    }

    var lines = wxmlCode.split('\n');

    // 匹配image标签的正则表达式
    // 支持自闭合和非自闭合标签
    var imageTagPattern = /<image\s+([^>]*?)(?:\/>|>)/gi;
    var match;

    // 用于跟踪多行标签
    var fullCode = wxmlCode;
    var currentIndex = 0;

    while ((match = imageTagPattern.exec(fullCode)) !== null) {
      result.totalElements++;

      var tagContent = match[0];
      var attributes = match[1] || '';

      // 计算行号
      var lineNumber = this._getLineNumber(fullCode, match.index);

      // 提取src属性
      var srcMatch = attributes.match(/src\s*=\s*["']([^"']*?)["']/i);
      var src = srcMatch ? srcMatch[1] : '';

      // 检查width属性
      var hasWidth = /\bwidth\s*=/.test(attributes) ||
                     /\bstyle\s*=\s*["'][^"']*width\s*:/.test(attributes);

      // 检查height属性
      var hasHeight = /\bheight\s*=/.test(attributes) ||
                      /\bstyle\s*=\s*["'][^"']*height\s*:/.test(attributes);

      // 检查lazy-load属性
      var hasLazyLoad = /\blazy-load\s*(?:=\s*["']?(?:true|{{[^}]*}})["']?)?/.test(attributes) ||
                        /\blazy-load\b/.test(attributes);

      // 检查mode属性
      var hasMode = /\bmode\s*=/.test(attributes);

      // 记录缺少尺寸的元素
      if (!hasWidth || !hasHeight) {
        var missingInfo = {
          file: filePath,
          line: lineNumber,
          src: src,
          hasWidth: hasWidth,
          hasHeight: hasHeight,
          tagContent: tagContent.length > 100 ? tagContent.substring(0, 100) + '...' : tagContent
        };
        result.missingDimensions.push(missingInfo);

        var missingAttrs = [];
        if (!hasWidth) missingAttrs.push('width');
        if (!hasHeight) missingAttrs.push('height');

        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.PERFORMANCE,
          severity: AuditConfig.AuditSeverity.MINOR,
          type: AuditConfig.AuditIssueType.IMAGE_MISSING_DIMENSIONS,
          file: filePath,
          line: lineNumber,
          description: 'image元素缺少 ' + missingAttrs.join(' 和 ') + ' 属性',
          suggestion: '添加明确的width和height属性以避免布局抖动，提升渲染性能',
          metadata: {
            src: src,
            missingAttributes: missingAttrs
          }
        }));
      }

      // 记录缺少lazy-load的元素（仅对非首屏图片建议）
      if (!hasLazyLoad && !this._isLikelyAboveFold(src, filePath)) {
        result.missingLazyLoad.push({
          file: filePath,
          line: lineNumber,
          src: src
        });
      }

      // 记录缺少mode的元素
      if (!hasMode) {
        result.missingMode.push({
          file: filePath,
          line: lineNumber,
          src: src
        });
      }
    }

    return result;
  },


  /**
   * 检测跨分包重复图片
   * 使用内容哈希检测不同分包中的重复图片
   *
   * @param {Object} options - 检测选项
   * @param {Array} [options.imageFiles] - 图片文件列表（用于测试注入）
   *   每个文件对象包含: { path, size, hash, packageRoot }
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @returns {Object} 重复图片检测结果
   *
   * @example
   * var result = ImageAnalyzer.detectDuplicateImages({
   *   imageFiles: [
   *     { path: 'packageA/images/icon.png', size: 5000, hash: 'abc123', packageRoot: 'packageA' },
   *     { path: 'packageB/images/icon.png', size: 5000, hash: 'abc123', packageRoot: 'packageB' }
   *   ]
   * });
   */
  detectDuplicateImages: function(options) {
    options = options || {};

    var result = {
      totalDuplicateGroups: 0,
      totalDuplicateFiles: 0,
      totalWastedSize: 0,
      totalWastedSizeFormatted: '0 KB',
      duplicateGroups: [],
      issues: [],
      recommendations: []
    };

    try {
      var imageFiles = options.imageFiles || [];

      // 如果提供了文件系统接口，扫描实际文件
      if (options.fileSystem && !options.imageFiles) {
        imageFiles = this._scanFileSystemWithHash(options.fileSystem, options.basePath || 'miniprogram/');
      }

      // 按哈希值分组
      var hashGroups = {};
      for (var i = 0; i < imageFiles.length; i++) {
        var file = imageFiles[i];
        var hash = file.hash;

        if (!hash) {
          continue;
        }

        if (!hashGroups[hash]) {
          hashGroups[hash] = [];
        }
        hashGroups[hash].push(file);
      }

      // 找出重复的组（同一哈希有多个文件且来自不同分包）
      var hashKeys = Object.keys(hashGroups);
      for (var j = 0; j < hashKeys.length; j++) {
        var hash = hashKeys[j];
        var files = hashGroups[hash];

        if (files.length < 2) {
          continue;
        }

        // 检查是否来自不同分包
        var packages = {};
        for (var k = 0; k < files.length; k++) {
          var pkgRoot = files[k].packageRoot || 'mainPackage';
          packages[pkgRoot] = true;
        }

        var packageCount = Object.keys(packages).length;
        if (packageCount < 2) {
          // 同一分包内的重复也记录，但优先级较低
          if (files.length > 1) {
            var samePackageDup = {
              hash: hash,
              fileCount: files.length,
              packageCount: 1,
              files: files.map(function(f) {
                return {
                  path: f.path,
                  size: f.size,
                  sizeFormatted: this._formatSize(f.size),
                  packageRoot: f.packageRoot
                };
              }, this),
              wastedSize: files[0].size * (files.length - 1),
              isCrossPackage: false
            };
            samePackageDup.wastedSizeFormatted = this._formatSize(samePackageDup.wastedSize);

            result.duplicateGroups.push(samePackageDup);
            result.totalDuplicateGroups++;
            result.totalDuplicateFiles += files.length - 1;
            result.totalWastedSize += samePackageDup.wastedSize;
          }
          continue;
        }

        // 跨分包重复
        var duplicateGroup = {
          hash: hash,
          fileCount: files.length,
          packageCount: packageCount,
          packages: Object.keys(packages),
          files: files.map(function(f) {
            return {
              path: f.path,
              size: f.size,
              sizeFormatted: this._formatSize(f.size),
              packageRoot: f.packageRoot
            };
          }, this),
          wastedSize: files[0].size * (files.length - 1),
          isCrossPackage: true
        };
        duplicateGroup.wastedSizeFormatted = this._formatSize(duplicateGroup.wastedSize);

        result.duplicateGroups.push(duplicateGroup);
        result.totalDuplicateGroups++;
        result.totalDuplicateFiles += files.length - 1;
        result.totalWastedSize += duplicateGroup.wastedSize;

        // 创建问题记录
        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.PERFORMANCE,
          severity: AuditConfig.AuditSeverity.MAJOR,
          type: AuditConfig.AuditIssueType.IMAGE_DUPLICATE,
          file: files[0].path,
          description: '图片在 ' + packageCount + ' 个分包中重复存在，浪费 ' + duplicateGroup.wastedSizeFormatted,
          suggestion: '将共用图片移至主包或创建共享资源分包，避免跨分包重复',
          metadata: {
            hash: hash,
            fileCount: files.length,
            packages: Object.keys(packages),
            wastedSize: duplicateGroup.wastedSize
          }
        }));
      }

      result.totalWastedSizeFormatted = this._formatSize(result.totalWastedSize);

      // 按浪费空间排序（大的在前）
      result.duplicateGroups.sort(function(a, b) {
        return b.wastedSize - a.wastedSize;
      });

      // 生成建议
      result.recommendations = this._generateDuplicateRecommendations(result);

    } catch (error) {
      console.error('❌ 重复图片检测失败:', error);
      result.error = error.message || String(error);
    }

    return result;
  },


  /**
   * 生成优化建议
   * 基于扫描结果生成图片优化建议
   *
   * @param {Object} options - 生成选项
   * @param {Object} [options.scanResult] - scanImageFiles的结果
   * @param {Object} [options.elementResult] - checkImageElements的结果
   * @param {Object} [options.duplicateResult] - detectDuplicateImages的结果
   * @returns {Array} 优化建议列表
   *
   * @example
   * var suggestions = ImageAnalyzer.generateSuggestions({
   *   scanResult: scanResult,
   *   elementResult: elementResult,
   *   duplicateResult: duplicateResult
   * });
   */
  generateSuggestions: function(options) {
    options = options || {};
    var suggestions = [];

    try {
      var scanResult = options.scanResult;
      var elementResult = options.elementResult;
      var duplicateResult = options.duplicateResult;

      // 1. 基于文件扫描的建议
      if (scanResult) {
        // 超大文件建议
        if (scanResult.oversizedFiles && scanResult.oversizedFiles.length > 0) {
          suggestions.push({
            type: 'oversized_images',
            priority: 'high',
            title: '压缩超大图片',
            description: '有 ' + scanResult.oversizedFiles.length + ' 个图片超过100KB，' +
                         '总计 ' + this._formatSize(this._sumSizes(scanResult.oversizedFiles)),
            files: scanResult.oversizedFiles.slice(0, 10), // 最多显示10个
            action: '使用TinyPNG或Squoosh压缩，或转换为WebP格式',
            estimatedSaving: this._formatSize(this._sumSizes(scanResult.oversizedFiles) * 0.5)
          });
        }

        // 格式优化建议
        if (scanResult.byFormat) {
          var pngCount = scanResult.byFormat.png ? scanResult.byFormat.png.count : 0;
          var jpgCount = (scanResult.byFormat.jpg ? scanResult.byFormat.jpg.count : 0) +
                         (scanResult.byFormat.jpeg ? scanResult.byFormat.jpeg.count : 0);
          var webpCount = scanResult.byFormat.webp ? scanResult.byFormat.webp.count : 0;

          if ((pngCount + jpgCount) > webpCount * 2 && (pngCount + jpgCount) > 10) {
            suggestions.push({
              type: 'format_optimization',
              priority: 'medium',
              title: '转换为WebP格式',
              description: '项目中有 ' + pngCount + ' 个PNG和 ' + jpgCount + ' 个JPG图片，' +
                           '转换为WebP可减少约30%体积',
              action: '使用cwebp工具或在线转换器批量转换',
              estimatedSaving: '约30%体积减少'
            });
          }
        }

        // 不推荐格式建议
        if (scanResult.discouragedFormatFiles && scanResult.discouragedFormatFiles.length > 0) {
          suggestions.push({
            type: 'discouraged_formats',
            priority: 'medium',
            title: '替换不推荐的图片格式',
            description: '有 ' + scanResult.discouragedFormatFiles.length + ' 个图片使用BMP/GIF等不推荐格式',
            files: scanResult.discouragedFormatFiles,
            action: '转换为PNG或WebP格式'
          });
        }
      }

      // 2. 基于元素检查的建议
      if (elementResult) {
        // 缺少尺寸建议
        if (elementResult.missingDimensions && elementResult.missingDimensions.length > 0) {
          suggestions.push({
            type: 'missing_dimensions',
            priority: 'high',
            title: '添加图片尺寸属性',
            description: '有 ' + elementResult.missingDimensions.length + ' 个image元素缺少width/height属性',
            count: elementResult.missingDimensions.length,
            action: '为所有image元素添加明确的width和height属性，避免布局抖动',
            impact: '提升首屏渲染性能，避免CLS（累积布局偏移）'
          });
        }

        // 懒加载建议
        if (elementResult.missingLazyLoad && elementResult.missingLazyLoad.length > 10) {
          suggestions.push({
            type: 'lazy_load',
            priority: 'low',
            title: '启用图片懒加载',
            description: '有 ' + elementResult.missingLazyLoad.length + ' 个非首屏图片可启用懒加载',
            action: '为非首屏image元素添加lazy-load属性',
            impact: '减少首屏加载时间'
          });
        }
      }

      // 3. 基于重复检测的建议
      if (duplicateResult) {
        if (duplicateResult.totalDuplicateGroups > 0) {
          var crossPackageDups = duplicateResult.duplicateGroups.filter(function(g) {
            return g.isCrossPackage;
          });

          if (crossPackageDups.length > 0) {
            suggestions.push({
              type: 'cross_package_duplicates',
              priority: 'high',
              title: '消除跨分包重复图片',
              description: '有 ' + crossPackageDups.length + ' 组图片在多个分包中重复，' +
                           '浪费 ' + duplicateResult.totalWastedSizeFormatted,
              groups: crossPackageDups.slice(0, 5),
              action: '将共用图片移至主包images/目录或创建packageSharedImages分包',
              estimatedSaving: duplicateResult.totalWastedSizeFormatted
            });
          }
        }
      }

      // 按优先级排序
      var priorityOrder = { high: 0, medium: 1, low: 2 };
      suggestions.sort(function(a, b) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    } catch (error) {
      console.error('❌ 生成优化建议失败:', error);
    }

    return suggestions;
  },


  /**
   * 综合分析图片资源
   * 执行所有分析并返回综合报告
   *
   * @param {Object} options - 分析选项
   * @param {Array} [options.imageFiles] - 图片文件列表
   * @param {Array} [options.wxmlFiles] - WXML文件列表
   * @param {Object} [options.fileSystem] - 文件系统接口
   * @returns {Object} 综合分析报告
   *
   * @example
   * var report = ImageAnalyzer.analyzeAll({
   *   imageFiles: imageFiles,
   *   wxmlFiles: wxmlFiles
   * });
   */
  analyzeAll: function(options) {
    options = options || {};

    var report = {
      timestamp: new Date().toISOString(),
      scanResult: null,
      elementResult: null,
      duplicateResult: null,
      suggestions: null,
      summary: {
        totalImages: 0,
        totalSize: 0,
        totalSizeFormatted: '0 KB',
        oversizedCount: 0,
        missingDimensionsCount: 0,
        duplicateGroupsCount: 0,
        wastedSize: 0,
        wastedSizeFormatted: '0 KB'
      },
      totalIssues: 0,
      criticalIssues: 0,
      majorIssues: 0,
      minorIssues: 0,
      allIssues: []
    };

    try {
      // 1. 扫描图片文件
      report.scanResult = this.scanImageFiles({
        imageFiles: options.imageFiles,
        fileSystem: options.fileSystem,
        basePath: options.basePath
      });

      // 2. 检查image元素
      if (options.wxmlFiles && options.wxmlFiles.length > 0) {
        report.elementResult = this.checkImageElements({
          wxmlFiles: options.wxmlFiles
        });
      }

      // 3. 检测重复图片
      if (options.imageFiles && options.imageFiles.length > 0) {
        report.duplicateResult = this.detectDuplicateImages({
          imageFiles: options.imageFiles,
          fileSystem: options.fileSystem
        });
      }

      // 4. 生成建议
      report.suggestions = this.generateSuggestions({
        scanResult: report.scanResult,
        elementResult: report.elementResult,
        duplicateResult: report.duplicateResult
      });

      // 5. 汇总统计
      if (report.scanResult) {
        report.summary.totalImages = report.scanResult.totalFiles;
        report.summary.totalSize = report.scanResult.totalSize;
        report.summary.totalSizeFormatted = report.scanResult.totalSizeFormatted;
        report.summary.oversizedCount = report.scanResult.oversizedFiles ?
          report.scanResult.oversizedFiles.length : 0;

        // 收集问题
        if (report.scanResult.issues) {
          report.allIssues = report.allIssues.concat(report.scanResult.issues);
        }
      }

      if (report.elementResult) {
        report.summary.missingDimensionsCount = report.elementResult.missingDimensions ?
          report.elementResult.missingDimensions.length : 0;

        if (report.elementResult.issues) {
          report.allIssues = report.allIssues.concat(report.elementResult.issues);
        }
      }

      if (report.duplicateResult) {
        report.summary.duplicateGroupsCount = report.duplicateResult.totalDuplicateGroups;
        report.summary.wastedSize = report.duplicateResult.totalWastedSize;
        report.summary.wastedSizeFormatted = report.duplicateResult.totalWastedSizeFormatted;

        if (report.duplicateResult.issues) {
          report.allIssues = report.allIssues.concat(report.duplicateResult.issues);
        }
      }

      // 6. 统计问题数量
      report.totalIssues = report.allIssues.length;
      for (var i = 0; i < report.allIssues.length; i++) {
        var issue = report.allIssues[i];
        switch (issue.severity) {
          case AuditConfig.AuditSeverity.CRITICAL:
            report.criticalIssues++;
            break;
          case AuditConfig.AuditSeverity.MAJOR:
            report.majorIssues++;
            break;
          case AuditConfig.AuditSeverity.MINOR:
            report.minorIssues++;
            break;
        }
      }

    } catch (error) {
      console.error('❌ 综合分析失败:', error);
      report.error = error.message || String(error);
    }

    return report;
  },


  // ==================== 私有辅助方法 ====================

  /**
   * 格式化文件大小
   * @private
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小字符串
   */
  _formatSize: function(bytes) {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  },

  /**
   * 获取文件格式（扩展名）
   * @private
   * @param {string} filePath - 文件路径
   * @returns {string} 文件格式（小写）
   */
  _getFileFormat: function(filePath) {
    if (!filePath) return 'unknown';
    var lastDot = filePath.lastIndexOf('.');
    if (lastDot === -1) return 'unknown';
    return filePath.substring(lastDot + 1).toLowerCase();
  },

  /**
   * 获取文件所属分包
   * @private
   * @param {string} filePath - 文件路径
   * @returns {string} 分包根目录
   */
  _getPackageRoot: function(filePath) {
    if (!filePath) return 'mainPackage';

    // 移除miniprogram/前缀
    var path = filePath.replace(/^miniprogram\//, '');

    // 检查是否在分包目录中
    var packageMatch = path.match(/^(package[A-Za-z0-9]+)\//);
    if (packageMatch) {
      return packageMatch[1];
    }

    return 'mainPackage';
  },

  /**
   * 获取代码中的行号
   * @private
   * @param {string} code - 完整代码
   * @param {number} index - 字符索引
   * @returns {number} 行号（从1开始）
   */
  _getLineNumber: function(code, index) {
    var lines = code.substring(0, index).split('\n');
    return lines.length;
  },

  /**
   * 判断图片是否可能在首屏
   * @private
   * @param {string} src - 图片源
   * @param {string} filePath - 文件路径
   * @returns {boolean} 是否可能在首屏
   */
  _isLikelyAboveFold: function(src, filePath) {
    // 首屏图片的常见特征
    var aboveFoldPatterns = [
      /logo/i,
      /banner/i,
      /header/i,
      /icon/i,
      /avatar/i,
      /tabbar/i,
      /nav/i
    ];

    for (var i = 0; i < aboveFoldPatterns.length; i++) {
      if (aboveFoldPatterns[i].test(src) || aboveFoldPatterns[i].test(filePath)) {
        return true;
      }
    }

    return false;
  },

  /**
   * 计算文件大小总和
   * @private
   * @param {Array} files - 文件列表
   * @returns {number} 总大小
   */
  _sumSizes: function(files) {
    var total = 0;
    for (var i = 0; i < files.length; i++) {
      total += files[i].size || 0;
    }
    return total;
  },

  /**
   * 扫描文件系统获取图片文件
   * @private
   * @param {Object} fileSystem - 文件系统接口
   * @param {string} basePath - 基础路径
   * @returns {Array} 图片文件列表
   */
  _scanFileSystem: function(fileSystem, basePath) {
    var imageFiles = [];

    // 这是一个占位实现，实际使用时需要根据环境提供具体实现
    // 在微信小程序环境中，可以使用wx.getFileSystemManager()
    // 在Node.js测试环境中，可以使用fs模块

    if (fileSystem && typeof fileSystem.readdirSync === 'function') {
      try {
        var self = this;
        var scanDir = function(dirPath) {
          var entries = fileSystem.readdirSync(dirPath);
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var fullPath = dirPath + '/' + entry;

            try {
              var stat = fileSystem.statSync(fullPath);
              if (stat.isDirectory()) {
                scanDir(fullPath);
              } else if (stat.isFile()) {
                var ext = self._getFileFormat(entry);
                if (IMAGE_EXTENSIONS.indexOf('.' + ext) !== -1) {
                  imageFiles.push({
                    path: fullPath,
                    size: stat.size,
                    format: ext,
                    packageRoot: self._getPackageRoot(fullPath)
                  });
                }
              }
            } catch (e) {
              // 忽略无法访问的文件
            }
          }
        };

        scanDir(basePath);
      } catch (error) {
        console.warn('⚠️ 文件系统扫描失败:', error);
      }
    }

    return imageFiles;
  },

  /**
   * 扫描文件系统并计算哈希
   * @private
   * @param {Object} fileSystem - 文件系统接口
   * @param {string} basePath - 基础路径
   * @returns {Array} 带哈希的图片文件列表
   */
  _scanFileSystemWithHash: function(fileSystem, basePath) {
    var imageFiles = this._scanFileSystem(fileSystem, basePath);

    // 如果文件系统支持读取文件内容，计算简单哈希
    if (fileSystem && typeof fileSystem.readFileSync === 'function') {
      for (var i = 0; i < imageFiles.length; i++) {
        var file = imageFiles[i];
        try {
          var content = fileSystem.readFileSync(file.path);
          file.hash = this._simpleHash(content);
        } catch (e) {
          // 忽略无法读取的文件
        }
      }
    }

    return imageFiles;
  },

  /**
   * 简单哈希函数
   * 用于检测重复文件，不需要加密强度
   * @private
   * @param {Buffer|string} content - 文件内容
   * @returns {string} 哈希值
   */
  _simpleHash: function(content) {
    // 简单的哈希实现，基于内容长度和采样
    var str = typeof content === 'string' ? content : String(content);
    var hash = 0;
    var len = str.length;

    // 采样计算哈希，避免大文件性能问题
    var step = Math.max(1, Math.floor(len / 1000));
    for (var i = 0; i < len; i += step) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // 加入长度信息
    return len.toString(16) + '_' + Math.abs(hash).toString(16);
  },


  /**
   * 生成扫描结果的建议
   * @private
   * @param {Object} result - 扫描结果
   * @returns {Array} 建议列表
   */
  _generateScanRecommendations: function(result) {
    var recommendations = [];

    if (result.oversizedFiles && result.oversizedFiles.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '压缩超大图片',
        description: '有 ' + result.oversizedFiles.length + ' 个图片超过100KB限制'
      });
    }

    if (result.discouragedFormatFiles && result.discouragedFormatFiles.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: '转换不推荐格式',
        description: '有 ' + result.discouragedFormatFiles.length + ' 个图片使用不推荐的格式'
      });
    }

    // 检查WebP使用率
    var webpCount = result.byFormat.webp ? result.byFormat.webp.count : 0;
    var totalCount = result.totalFiles;
    if (totalCount > 10 && webpCount / totalCount < 0.3) {
      recommendations.push({
        priority: 'medium',
        title: '增加WebP格式使用',
        description: 'WebP格式仅占 ' + ((webpCount / totalCount) * 100).toFixed(1) + '%，建议更多使用WebP'
      });
    }

    return recommendations;
  },

  /**
   * 生成元素检查的建议
   * @private
   * @param {Object} result - 元素检查结果
   * @returns {Array} 建议列表
   */
  _generateElementRecommendations: function(result) {
    var recommendations = [];

    if (result.missingDimensions && result.missingDimensions.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '添加图片尺寸',
        description: '有 ' + result.missingDimensions.length + ' 个image元素缺少width/height属性'
      });
    }

    if (result.missingLazyLoad && result.missingLazyLoad.length > 5) {
      recommendations.push({
        priority: 'low',
        title: '启用懒加载',
        description: '有 ' + result.missingLazyLoad.length + ' 个图片可启用lazy-load'
      });
    }

    return recommendations;
  },

  /**
   * 生成重复检测的建议
   * @private
   * @param {Object} result - 重复检测结果
   * @returns {Array} 建议列表
   */
  _generateDuplicateRecommendations: function(result) {
    var recommendations = [];

    var crossPackageDups = result.duplicateGroups.filter(function(g) {
      return g.isCrossPackage;
    });

    if (crossPackageDups.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '消除跨分包重复',
        description: '有 ' + crossPackageDups.length + ' 组图片跨分包重复，浪费 ' + result.totalWastedSizeFormatted
      });
    }

    var samePackageDups = result.duplicateGroups.filter(function(g) {
      return !g.isCrossPackage;
    });

    if (samePackageDups.length > 0) {
      recommendations.push({
        priority: 'low',
        title: '清理同分包重复',
        description: '有 ' + samePackageDups.length + ' 组图片在同一分包内重复'
      });
    }

    return recommendations;
  },

  /**
   * 生成报告摘要文本
   *
   * @param {Object} report - 分析报告对象
   * @returns {string} 摘要文本
   */
  generateSummaryText: function(report) {
    if (!report) {
      return '无分析报告';
    }

    var lines = [
      '========== 图片资源分析报告 ==========',
      '时间: ' + report.timestamp,
      '',
      '【总览】',
      '  图片总数: ' + report.summary.totalImages,
      '  总体积: ' + report.summary.totalSizeFormatted,
      '  超大图片: ' + report.summary.oversizedCount + ' 个',
      '  缺少尺寸: ' + report.summary.missingDimensionsCount + ' 个',
      '  重复组数: ' + report.summary.duplicateGroupsCount + ' 组',
      '  浪费空间: ' + report.summary.wastedSizeFormatted,
      '',
      '【问题统计】',
      '  总计: ' + report.totalIssues + ' 个问题',
      '  严重: ' + report.criticalIssues + ' 个',
      '  主要: ' + report.majorIssues + ' 个',
      '  次要: ' + report.minorIssues + ' 个'
    ];

    if (report.suggestions && report.suggestions.length > 0) {
      lines.push('');
      lines.push('【优化建议】');
      for (var i = 0; i < Math.min(5, report.suggestions.length); i++) {
        var sug = report.suggestions[i];
        lines.push('  ' + (i + 1) + '. [' + sug.priority.toUpperCase() + '] ' + sug.title);
        lines.push('     ' + sug.description);
      }
      if (report.suggestions.length > 5) {
        lines.push('  ... 还有 ' + (report.suggestions.length - 5) + ' 条建议');
      }
    }

    lines.push('');
    lines.push('=====================================');

    return lines.join('\n');
  }
};

// 导出模块
module.exports = ImageAnalyzer;
