'use strict';

/**
 * 🧪 ImageAnalyzer 属性测试
 *
 * Property 4: Image Resource Analysis
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.5**
 *
 * 对于任何项目中的图片文件集合，审计系统应该：
 * - 正确识别文件格式
 * - 准确计算文件大小
 * - 检测超过100KB的图片
 * - 识别缺少width/height属性的image元素
 * - 使用内容哈希检测跨分包重复图片
 *
 * @module image-analyzer.test
 * @created 2025-01-17
 * @purpose 飞行工具箱全面审查与优化项目 - 图片资源分析属性测试
 *
 * 测试策略：
 * - 使用fast-check生成各种图片文件配置
 * - 验证检测的完整性和准确性
 * - 每个属性运行最少100次迭代
 */

var fc = require('fast-check');
var ImageAnalyzer = require('../image-analyzer.js');

/**
 * ============================================================================
 * 常量定义
 * ============================================================================
 */

var THRESHOLDS = ImageAnalyzer.THRESHOLDS;
var IMAGE_EXTENSIONS = ImageAnalyzer.IMAGE_EXTENSIONS;
var RECOMMENDED_FORMATS = ImageAnalyzer.RECOMMENDED_FORMATS;
var DISCOURAGED_FORMATS = ImageAnalyzer.DISCOURAGED_FORMATS;

// 100KB in bytes
var HUNDRED_KB = 100 * 1024;
// 50KB in bytes
var FIFTY_KB = 50 * 1024;

/**
 * ============================================================================
 * 测试数据生成器 (Arbitraries)
 * ============================================================================
 */


/**
 * 生成有效的图片格式
 * @returns {fc.Arbitrary<string>}
 */
function validImageFormat() {
  return fc.constantFrom('png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'bmp', 'ico');
}

/**
 * 生成推荐的图片格式
 * @returns {fc.Arbitrary<string>}
 */
function recommendedFormat() {
  return fc.constantFrom('webp', 'avif', 'png', 'jpg', 'jpeg', 'svg');
}

/**
 * 生成不推荐的图片格式
 * @returns {fc.Arbitrary<string>}
 */
function discouragedFormat() {
  return fc.constantFrom('bmp', 'tiff', 'tif', 'gif');
}

/**
 * 生成有效的分包根目录名称
 * @returns {fc.Arbitrary<string>}
 */
function validPackageRoot() {
  return fc.constantFrom(
    'mainPackage', 'packageA', 'packageB', 'packageC', 'packageD',
    'packageO', 'packageCCAR', 'packageIOSA', 'packageWeather',
    'packageWalkaround', 'packageWalkaroundImages1', 'packageWalkaroundImages2',
    'packageJapan', 'packageSingapore', 'packageAmerica'
  );
}

/**
 * 生成图片文件大小（字节）
 * @param {Object} options - 选项
 * @param {number} [options.min] - 最小体积
 * @param {number} [options.max] - 最大体积
 * @returns {fc.Arbitrary<number>}
 */
function imageSize(options) {
  options = options || {};
  var min = options.min !== undefined ? options.min : 1024; // 1KB
  var max = options.max !== undefined ? options.max : 500 * 1024; // 500KB
  return fc.integer({ min: min, max: max });
}

/**
 * 生成图片文件名
 * @returns {fc.Arbitrary<string>}
 */
function imageFileName() {
  return fc.record({
    name: fc.constantFrom(
      'logo', 'icon', 'banner', 'background', 'avatar', 'thumbnail',
      'header', 'footer', 'button', 'arrow', 'close', 'menu',
      'tab-home', 'tab-search', 'airport-marker', 'selected-location'
    ),
    suffix: fc.option(fc.constantFrom('-active', '-hover', '-disabled', '-2x', '-3x'), { nil: '' })
  }).map(function(r) {
    return r.name + (r.suffix || '');
  });
}


/**
 * 生成单个图片文件配置
 * @returns {fc.Arbitrary<Object>}
 */
function imageFileConfig() {
  return fc.record({
    fileName: imageFileName(),
    format: validImageFormat(),
    size: imageSize(),
    packageRoot: validPackageRoot()
  }).map(function(r) {
    var path = r.packageRoot === 'mainPackage' ?
      'miniprogram/images/' + r.fileName + '.' + r.format :
      'miniprogram/' + r.packageRoot + '/images/' + r.fileName + '.' + r.format;

    return {
      path: path,
      size: r.size,
      format: r.format,
      packageRoot: r.packageRoot
    };
  });
}

/**
 * 生成超大图片文件配置（超过100KB）
 * @returns {fc.Arbitrary<Object>}
 */
function oversizedImageConfig() {
  return fc.record({
    fileName: imageFileName(),
    format: validImageFormat(),
    size: imageSize({ min: HUNDRED_KB + 1, max: 500 * 1024 }),
    packageRoot: validPackageRoot()
  }).map(function(r) {
    var path = r.packageRoot === 'mainPackage' ?
      'miniprogram/images/' + r.fileName + '.' + r.format :
      'miniprogram/' + r.packageRoot + '/images/' + r.fileName + '.' + r.format;

    return {
      path: path,
      size: r.size,
      format: r.format,
      packageRoot: r.packageRoot
    };
  });
}

/**
 * 生成正常大小图片文件配置（小于100KB）
 * @returns {fc.Arbitrary<Object>}
 */
function normalSizedImageConfig() {
  return fc.record({
    fileName: imageFileName(),
    format: validImageFormat(),
    size: imageSize({ min: 1024, max: HUNDRED_KB - 1 }),
    packageRoot: validPackageRoot()
  }).map(function(r) {
    var path = r.packageRoot === 'mainPackage' ?
      'miniprogram/images/' + r.fileName + '.' + r.format :
      'miniprogram/' + r.packageRoot + '/images/' + r.fileName + '.' + r.format;

    return {
      path: path,
      size: r.size,
      format: r.format,
      packageRoot: r.packageRoot
    };
  });
}


/**
 * 生成带哈希的图片文件配置（用于重复检测）
 * @returns {fc.Arbitrary<Object>}
 */
function imageFileWithHash() {
  return fc.record({
    fileName: imageFileName(),
    format: validImageFormat(),
    size: imageSize(),
    packageRoot: validPackageRoot(),
    hashSuffix: fc.integer({ min: 10000, max: 99999 })
  }).map(function(r) {
    var path = r.packageRoot === 'mainPackage' ?
      'miniprogram/images/' + r.fileName + '.' + r.format :
      'miniprogram/' + r.packageRoot + '/images/' + r.fileName + '.' + r.format;

    return {
      path: path,
      size: r.size,
      format: r.format,
      packageRoot: r.packageRoot,
      hash: r.size + '_' + r.hashSuffix.toString(16)
    };
  });
}

/**
 * 生成WXML中的image元素
 * @returns {fc.Arbitrary<Object>}
 */
function wxmlImageElement() {
  return fc.record({
    src: fc.constantFrom(
      '/images/logo.png',
      '/images/icon.png',
      '{{imageUrl}}',
      '/packageA/images/banner.jpg',
      'https://example.com/image.png'
    ),
    hasWidth: fc.boolean(),
    hasHeight: fc.boolean(),
    hasLazyLoad: fc.boolean(),
    hasMode: fc.boolean(),
    widthValue: fc.constantFrom('100rpx', '200rpx', '50%', '{{width}}'),
    heightValue: fc.constantFrom('100rpx', '200rpx', '50%', '{{height}}'),
    modeValue: fc.constantFrom('aspectFit', 'aspectFill', 'widthFix', 'scaleToFill')
  }).map(function(r) {
    var attrs = ['src="' + r.src + '"'];

    if (r.hasWidth) {
      attrs.push('width="' + r.widthValue + '"');
    }
    if (r.hasHeight) {
      attrs.push('height="' + r.heightValue + '"');
    }
    if (r.hasLazyLoad) {
      attrs.push('lazy-load="true"');
    }
    if (r.hasMode) {
      attrs.push('mode="' + r.modeValue + '"');
    }

    return {
      tag: '<image ' + attrs.join(' ') + ' />',
      src: r.src,
      hasWidth: r.hasWidth,
      hasHeight: r.hasHeight,
      hasLazyLoad: r.hasLazyLoad,
      hasMode: r.hasMode
    };
  });
}


/**
 * 生成WXML代码（包含多个image元素）
 * @returns {fc.Arbitrary<Object>}
 */
function wxmlCodeWithImages() {
  return fc.array(wxmlImageElement(), { minLength: 1, maxLength: 10 }).map(function(elements) {
    var lines = ['<view class="container">'];
    for (var i = 0; i < elements.length; i++) {
      lines.push('  ' + elements[i].tag);
    }
    lines.push('</view>');

    return {
      code: lines.join('\n'),
      elements: elements,
      totalElements: elements.length,
      missingDimensionsCount: elements.filter(function(e) {
        return !e.hasWidth || !e.hasHeight;
      }).length
    };
  });
}

/**
 * 生成重复图片组（同一哈希在多个分包）
 * @returns {fc.Arbitrary<Object>}
 */
function duplicateImageGroup() {
  return fc.record({
    fileName: imageFileName(),
    format: validImageFormat(),
    size: imageSize(),
    hashSuffix: fc.integer({ min: 10000, max: 99999 }),
    packageCount: fc.integer({ min: 2, max: 5 })
  }).chain(function(r) {
    var packages = ['packageA', 'packageB', 'packageC', 'packageD', 'packageO'];
    return fc.shuffledSubarray(packages, { minLength: r.packageCount, maxLength: r.packageCount })
      .map(function(selectedPackages) {
        var hash = r.size + '_' + r.hashSuffix.toString(16);
        var files = selectedPackages.map(function(pkg) {
          return {
            path: 'miniprogram/' + pkg + '/images/' + r.fileName + '.' + r.format,
            size: r.size,
            format: r.format,
            packageRoot: pkg,
            hash: hash
          };
        });

        return {
          hash: hash,
          files: files,
          packageCount: selectedPackages.length,
          wastedSize: r.size * (selectedPackages.length - 1)
        };
      });
  });
}


/**
 * ============================================================================
 * Property 4: Image Resource Analysis
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.5**
 * ============================================================================
 */

describe('Property 4: Image Resource Analysis', function() {

  /**
   * Property 4a: File Format Detection
   * **Validates: Requirements 4.1**
   *
   * 对于任何图片文件，应该正确识别其格式
   */
  describe('4a File Format Detection', function() {
    it('should correctly identify image format from file extension', function() {
      fc.assert(
        fc.property(
          imageFileConfig(),
          function(imageFile) {
            var result = ImageAnalyzer.scanImageFiles({
              imageFiles: [imageFile]
            });

            // 应该正确识别格式
            var format = imageFile.format.toLowerCase();
            return result.byFormat[format] !== undefined &&
                   result.byFormat[format].count === 1;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should count files by format correctly', function() {
      fc.assert(
        fc.property(
          fc.array(imageFileConfig(), { minLength: 1, maxLength: 20 }),
          function(imageFiles) {
            var result = ImageAnalyzer.scanImageFiles({
              imageFiles: imageFiles
            });

            // 计算预期的格式分布
            var expectedByFormat = {};
            for (var i = 0; i < imageFiles.length; i++) {
              var format = imageFiles[i].format.toLowerCase();
              expectedByFormat[format] = (expectedByFormat[format] || 0) + 1;
            }

            // 验证每种格式的计数
            var formats = Object.keys(expectedByFormat);
            for (var j = 0; j < formats.length; j++) {
              var fmt = formats[j];
              if (!result.byFormat[fmt] || result.byFormat[fmt].count !== expectedByFormat[fmt]) {
                return false;
              }
            }

            return true;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should flag discouraged formats', function() {
      fc.assert(
        fc.property(
          fc.record({
            fileName: imageFileName(),
            format: discouragedFormat(),
            size: imageSize(),
            packageRoot: validPackageRoot()
          }),
          function(r) {
            var imageFile = {
              path: 'miniprogram/images/' + r.fileName + '.' + r.format,
              size: r.size,
              format: r.format,
              packageRoot: r.packageRoot
            };

            var result = ImageAnalyzer.scanImageFiles({
              imageFiles: [imageFile]
            });

            // 不推荐格式应该被标记
            return result.discouragedFormatFiles.length === 1 &&
                   result.discouragedFormatFiles[0].format === r.format;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });


  /**
   * Property 4b: Size Calculation Accuracy
   * **Validates: Requirements 4.2**
   *
   * 对于任何图片文件集合，应该准确计算总大小
   */
  describe('4b Size Calculation Accuracy', function() {
    it('should calculate total size as sum of all file sizes', function() {
      fc.assert(
        fc.property(
          fc.array(imageFileConfig(), { minLength: 1, maxLength: 20 }),
          function(imageFiles) {
            var result = ImageAnalyzer.scanImageFiles({
              imageFiles: imageFiles
            });

            // 计算预期总大小
            var expectedTotal = 0;
            for (var i = 0; i < imageFiles.length; i++) {
              expectedTotal += imageFiles[i].size;
            }

            return result.totalSize === expectedTotal;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should correctly report file count', function() {
      fc.assert(
        fc.property(
          fc.array(imageFileConfig(), { minLength: 1, maxLength: 30 }),
          function(imageFiles) {
            var result = ImageAnalyzer.scanImageFiles({
              imageFiles: imageFiles
            });

            return result.totalFiles === imageFiles.length;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should calculate size by package correctly', function() {
      fc.assert(
        fc.property(
          fc.array(imageFileConfig(), { minLength: 1, maxLength: 15 }),
          function(imageFiles) {
            var result = ImageAnalyzer.scanImageFiles({
              imageFiles: imageFiles
            });

            // 计算预期的分包体积分布
            var expectedByPackage = {};
            for (var i = 0; i < imageFiles.length; i++) {
              var pkg = imageFiles[i].packageRoot;
              if (!expectedByPackage[pkg]) {
                expectedByPackage[pkg] = { count: 0, totalSize: 0 };
              }
              expectedByPackage[pkg].count++;
              expectedByPackage[pkg].totalSize += imageFiles[i].size;
            }

            // 验证每个分包的统计
            var packages = Object.keys(expectedByPackage);
            for (var j = 0; j < packages.length; j++) {
              var pkgName = packages[j];
              if (!result.byPackage[pkgName] ||
                  result.byPackage[pkgName].count !== expectedByPackage[pkgName].count ||
                  result.byPackage[pkgName].totalSize !== expectedByPackage[pkgName].totalSize) {
                return false;
              }
            }

            return true;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });


  /**
   * Property 4c: Oversized Image Detection
   * **Validates: Requirements 4.3**
   *
   * 对于任何超过100KB的图片，应该被正确检测并标记
   */
  describe('4c Oversized Image Detection', function() {
    it('should detect all images exceeding 100KB', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 0, max: 5 }),
          function(oversizedCount, normalCount) {
            var imageFiles = [];
            var expectedOversized = [];

            // 添加超大图片
            for (var i = 0; i < oversizedCount; i++) {
              var oversizedFile = {
                path: 'miniprogram/images/oversized' + i + '.png',
                size: HUNDRED_KB + Math.floor(Math.random() * 100 * 1024) + 1,
                format: 'png',
                packageRoot: 'mainPackage'
              };
              imageFiles.push(oversizedFile);
              expectedOversized.push(oversizedFile.path);
            }

            // 添加正常大小图片
            for (var j = 0; j < normalCount; j++) {
              imageFiles.push({
                path: 'miniprogram/images/normal' + j + '.png',
                size: Math.floor(Math.random() * (HUNDRED_KB - 1024)) + 1024,
                format: 'png',
                packageRoot: 'mainPackage'
              });
            }

            var result = ImageAnalyzer.scanImageFiles({
              imageFiles: imageFiles
            });

            // 应该检测到所有超大图片
            if (result.oversizedFiles.length !== oversizedCount) {
              return false;
            }

            // 验证检测到的文件路径
            var detectedPaths = result.oversizedFiles.map(function(f) { return f.path; });
            for (var k = 0; k < expectedOversized.length; k++) {
              if (detectedPaths.indexOf(expectedOversized[k]) === -1) {
                return false;
              }
            }

            return true;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag images under 100KB as oversized', function() {
      fc.assert(
        fc.property(
          fc.array(normalSizedImageConfig(), { minLength: 1, maxLength: 10 }),
          function(imageFiles) {
            var result = ImageAnalyzer.scanImageFiles({
              imageFiles: imageFiles
            });

            // 所有图片都小于100KB，不应该有超大图片
            return result.oversizedFiles.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should calculate exceeds amount correctly', function() {
      fc.assert(
        fc.property(
          oversizedImageConfig(),
          function(imageFile) {
            var result = ImageAnalyzer.scanImageFiles({
              imageFiles: [imageFile]
            });

            if (result.oversizedFiles.length !== 1) {
              return false;
            }

            var detected = result.oversizedFiles[0];
            var expectedExceedsBy = imageFile.size - HUNDRED_KB;

            return detected.exceedsBy === expectedExceedsBy;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect warning level files (50KB-100KB)', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          function(warningCount) {
            var imageFiles = [];

            // 添加警告级别图片（50KB-100KB）
            for (var i = 0; i < warningCount; i++) {
              imageFiles.push({
                path: 'miniprogram/images/warning' + i + '.png',
                size: FIFTY_KB + Math.floor(Math.random() * (HUNDRED_KB - FIFTY_KB - 1)) + 1,
                format: 'png',
                packageRoot: 'mainPackage'
              });
            }

            var result = ImageAnalyzer.scanImageFiles({
              imageFiles: imageFiles
            });

            // 应该检测到所有警告级别图片
            return result.warningFiles.length === warningCount;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });


  /**
   * Property 4d: Missing Dimensions Detection
   * **Validates: Requirements 4.5**
   *
   * 对于任何WXML文件中的image元素，应该检测缺少width/height属性的元素
   */
  describe('4d Missing Dimensions Detection', function() {
    it('should detect image elements missing width attribute', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          function(count) {
            var elements = [];
            for (var i = 0; i < count; i++) {
              elements.push('<image src="/images/test' + i + '.png" height="100rpx" />');
            }
            var wxmlCode = '<view>\n' + elements.join('\n') + '\n</view>';

            var result = ImageAnalyzer.checkImageElements({
              wxmlCode: wxmlCode,
              filePath: 'pages/test/index.wxml'
            });

            // 所有元素都缺少width
            return result.missingDimensions.length === count &&
                   result.missingDimensions.every(function(m) { return !m.hasWidth; });
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect image elements missing height attribute', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          function(count) {
            var elements = [];
            for (var i = 0; i < count; i++) {
              elements.push('<image src="/images/test' + i + '.png" width="100rpx" />');
            }
            var wxmlCode = '<view>\n' + elements.join('\n') + '\n</view>';

            var result = ImageAnalyzer.checkImageElements({
              wxmlCode: wxmlCode,
              filePath: 'pages/test/index.wxml'
            });

            // 所有元素都缺少height
            return result.missingDimensions.length === count &&
                   result.missingDimensions.every(function(m) { return !m.hasHeight; });
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect image elements missing both width and height', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          function(count) {
            var elements = [];
            for (var i = 0; i < count; i++) {
              elements.push('<image src="/images/test' + i + '.png" />');
            }
            var wxmlCode = '<view>\n' + elements.join('\n') + '\n</view>';

            var result = ImageAnalyzer.checkImageElements({
              wxmlCode: wxmlCode,
              filePath: 'pages/test/index.wxml'
            });

            // 所有元素都缺少width和height
            return result.missingDimensions.length === count &&
                   result.missingDimensions.every(function(m) {
                     return !m.hasWidth && !m.hasHeight;
                   });
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag image elements with both width and height', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          function(count) {
            var elements = [];
            for (var i = 0; i < count; i++) {
              elements.push('<image src="/images/test' + i + '.png" width="100rpx" height="100rpx" />');
            }
            var wxmlCode = '<view>\n' + elements.join('\n') + '\n</view>';

            var result = ImageAnalyzer.checkImageElements({
              wxmlCode: wxmlCode,
              filePath: 'pages/test/index.wxml'
            });

            // 所有元素都有width和height，不应该被标记
            return result.missingDimensions.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should correctly count total image elements', function() {
      fc.assert(
        fc.property(
          wxmlCodeWithImages(),
          function(wxmlData) {
            var result = ImageAnalyzer.checkImageElements({
              wxmlCode: wxmlData.code,
              filePath: 'pages/test/index.wxml'
            });

            return result.totalElements === wxmlData.totalElements;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });


  /**
   * Property 4e: Duplicate Image Detection
   * **Validates: Requirements 4.5**
   *
   * 对于任何跨分包的重复图片，应该使用内容哈希正确检测
   */
  describe('4e Duplicate Image Detection', function() {
    it('should detect duplicate images with same hash across packages', function() {
      fc.assert(
        fc.property(
          duplicateImageGroup(),
          function(dupGroup) {
            var result = ImageAnalyzer.detectDuplicateImages({
              imageFiles: dupGroup.files
            });

            // 应该检测到一组重复
            return result.totalDuplicateGroups === 1 &&
                   result.duplicateGroups[0].fileCount === dupGroup.packageCount;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should calculate wasted size correctly for duplicates', function() {
      fc.assert(
        fc.property(
          duplicateImageGroup(),
          function(dupGroup) {
            var result = ImageAnalyzer.detectDuplicateImages({
              imageFiles: dupGroup.files
            });

            // 浪费的空间 = 文件大小 * (重复数 - 1)
            var expectedWasted = dupGroup.wastedSize;

            return result.totalWastedSize === expectedWasted;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag unique images as duplicates', function() {
      fc.assert(
        fc.property(
          fc.array(imageFileWithHash(), { minLength: 1, maxLength: 10 }),
          function(imageFiles) {
            // 确保所有哈希都是唯一的
            var uniqueFiles = [];
            var seenHashes = {};
            for (var i = 0; i < imageFiles.length; i++) {
              if (!seenHashes[imageFiles[i].hash]) {
                seenHashes[imageFiles[i].hash] = true;
                uniqueFiles.push(imageFiles[i]);
              }
            }

            var result = ImageAnalyzer.detectDuplicateImages({
              imageFiles: uniqueFiles
            });

            // 没有重复
            return result.totalDuplicateGroups === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should identify cross-package duplicates correctly', function() {
      fc.assert(
        fc.property(
          duplicateImageGroup(),
          function(dupGroup) {
            var result = ImageAnalyzer.detectDuplicateImages({
              imageFiles: dupGroup.files
            });

            // 应该标记为跨分包重复
            return result.duplicateGroups.length === 1 &&
                   result.duplicateGroups[0].isCrossPackage === true &&
                   result.duplicateGroups[0].packageCount === dupGroup.packageCount;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should count duplicate files correctly', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }),
          function(groupCount) {
            var allFiles = [];
            var totalDuplicateFiles = 0;

            // 创建多组重复
            for (var g = 0; g < groupCount; g++) {
              var hash = 'hash_group_' + g;
              var fileCount = 2 + Math.floor(Math.random() * 3); // 2-4个文件
              var packages = ['packageA', 'packageB', 'packageC', 'packageD'];

              for (var f = 0; f < fileCount && f < packages.length; f++) {
                allFiles.push({
                  path: 'miniprogram/' + packages[f] + '/images/dup' + g + '.png',
                  size: 10000,
                  format: 'png',
                  packageRoot: packages[f],
                  hash: hash
                });
              }
              totalDuplicateFiles += Math.min(fileCount, packages.length) - 1;
            }

            var result = ImageAnalyzer.detectDuplicateImages({
              imageFiles: allFiles
            });

            return result.totalDuplicateFiles === totalDuplicateFiles;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });


  /**
   * Property 4f: Comprehensive Analysis
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.5**
   *
   * 综合分析应该正确汇总所有检测结果
   */
  describe('4f Comprehensive Analysis', function() {
    it('should aggregate all analysis results correctly', function() {
      fc.assert(
        fc.property(
          fc.array(imageFileConfig(), { minLength: 1, maxLength: 10 }),
          wxmlCodeWithImages(),
          function(imageFiles, wxmlData) {
            var report = ImageAnalyzer.analyzeAll({
              imageFiles: imageFiles,
              wxmlFiles: [{ path: 'pages/test/index.wxml', code: wxmlData.code }]
            });

            // 验证汇总数据
            return report.summary.totalImages === imageFiles.length &&
                   report.scanResult !== null &&
                   report.elementResult !== null;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should count issues by severity correctly', function() {
      fc.assert(
        fc.property(
          fc.array(oversizedImageConfig(), { minLength: 1, maxLength: 5 }),
          function(oversizedFiles) {
            var report = ImageAnalyzer.analyzeAll({
              imageFiles: oversizedFiles
            });

            // 超大图片应该产生MAJOR级别的问题
            return report.majorIssues >= oversizedFiles.length;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should generate suggestions based on analysis', function() {
      fc.assert(
        fc.property(
          fc.array(oversizedImageConfig(), { minLength: 3, maxLength: 5 }),
          function(oversizedFiles) {
            var report = ImageAnalyzer.analyzeAll({
              imageFiles: oversizedFiles
            });

            // 应该生成压缩超大图片的建议
            var hasOversizedSuggestion = report.suggestions.some(function(s) {
              return s.type === 'oversized_images';
            });

            return hasOversizedSuggestion;
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

describe('ImageAnalyzer Unit Tests', function() {
  describe('Edge Cases', function() {
    it('should handle empty image file list', function() {
      var result = ImageAnalyzer.scanImageFiles({
        imageFiles: []
      });

      expect(result.totalFiles).toBe(0);
      expect(result.totalSize).toBe(0);
      expect(result.oversizedFiles.length).toBe(0);
    });

    it('should handle empty WXML code', function() {
      var result = ImageAnalyzer.checkImageElements({
        wxmlCode: '',
        filePath: 'pages/test/index.wxml'
      });

      expect(result.totalElements).toBe(0);
      expect(result.missingDimensions.length).toBe(0);
    });

    it('should handle WXML without image elements', function() {
      var result = ImageAnalyzer.checkImageElements({
        wxmlCode: '<view><text>Hello</text></view>',
        filePath: 'pages/test/index.wxml'
      });

      expect(result.totalElements).toBe(0);
    });

    it('should handle image files without hash for duplicate detection', function() {
      var result = ImageAnalyzer.detectDuplicateImages({
        imageFiles: [
          { path: 'images/a.png', size: 1000, format: 'png', packageRoot: 'mainPackage' },
          { path: 'images/b.png', size: 1000, format: 'png', packageRoot: 'mainPackage' }
        ]
      });

      // 没有哈希，无法检测重复
      expect(result.totalDuplicateGroups).toBe(0);
    });

    it('should handle null options gracefully', function() {
      var scanResult = ImageAnalyzer.scanImageFiles(null);
      expect(scanResult.totalFiles).toBe(0);

      var elementResult = ImageAnalyzer.checkImageElements(null);
      expect(elementResult.totalElements).toBe(0);

      var dupResult = ImageAnalyzer.detectDuplicateImages(null);
      expect(dupResult.totalDuplicateGroups).toBe(0);
    });
  });

  describe('Format Size Helper', function() {
    it('should format bytes correctly', function() {
      // 测试私有方法通过公开方法间接测试
      var result = ImageAnalyzer.scanImageFiles({
        imageFiles: [{ path: 'test.png', size: 1024, format: 'png', packageRoot: 'mainPackage' }]
      });

      expect(result.totalSizeFormatted).toBe('1.0 KB');
    });

    it('should format KB correctly', function() {
      var result = ImageAnalyzer.scanImageFiles({
        imageFiles: [{ path: 'test.png', size: 102400, format: 'png', packageRoot: 'mainPackage' }]
      });

      expect(result.totalSizeFormatted).toBe('100.0 KB');
    });

    it('should format MB correctly', function() {
      var result = ImageAnalyzer.scanImageFiles({
        imageFiles: [{ path: 'test.png', size: 1048576, format: 'png', packageRoot: 'mainPackage' }]
      });

      expect(result.totalSizeFormatted).toBe('1.00 MB');
    });
  });


  describe('Package Root Detection', function() {
    it('should identify main package for images in miniprogram/images/', function() {
      var result = ImageAnalyzer.scanImageFiles({
        imageFiles: [{
          path: 'miniprogram/images/logo.png',
          size: 5000,
          format: 'png',
          packageRoot: 'mainPackage'
        }]
      });

      expect(result.byPackage['mainPackage']).toBeDefined();
      expect(result.byPackage['mainPackage'].count).toBe(1);
    });

    it('should identify subpackage for images in package directories', function() {
      var result = ImageAnalyzer.scanImageFiles({
        imageFiles: [{
          path: 'miniprogram/packageA/images/icon.png',
          size: 5000,
          format: 'png',
          packageRoot: 'packageA'
        }]
      });

      expect(result.byPackage['packageA']).toBeDefined();
      expect(result.byPackage['packageA'].count).toBe(1);
    });
  });

  describe('WXML Parsing', function() {
    it('should detect width in style attribute', function() {
      var result = ImageAnalyzer.checkImageElements({
        wxmlCode: '<image src="/images/test.png" style="width: 100rpx; height: 100rpx;" />',
        filePath: 'pages/test/index.wxml'
      });

      // style中有width和height，不应该被标记
      expect(result.missingDimensions.length).toBe(0);
    });

    it('should handle self-closing image tags', function() {
      var result = ImageAnalyzer.checkImageElements({
        wxmlCode: '<image src="/images/test.png" width="100rpx" height="100rpx"/>',
        filePath: 'pages/test/index.wxml'
      });

      expect(result.totalElements).toBe(1);
      expect(result.missingDimensions.length).toBe(0);
    });

    it('should handle image tags with dynamic attributes', function() {
      var result = ImageAnalyzer.checkImageElements({
        wxmlCode: '<image src="{{imageUrl}}" width="{{width}}" height="{{height}}" />',
        filePath: 'pages/test/index.wxml'
      });

      expect(result.totalElements).toBe(1);
      expect(result.missingDimensions.length).toBe(0);
    });

    it('should handle multiple image tags on same line', function() {
      var result = ImageAnalyzer.checkImageElements({
        wxmlCode: '<view><image src="/a.png" /><image src="/b.png" /></view>',
        filePath: 'pages/test/index.wxml'
      });

      expect(result.totalElements).toBe(2);
      expect(result.missingDimensions.length).toBe(2);
    });
  });

  describe('Issue Generation', function() {
    it('should create issues for oversized images', function() {
      var result = ImageAnalyzer.scanImageFiles({
        imageFiles: [{
          path: 'miniprogram/images/large.png',
          size: 150 * 1024, // 150KB
          format: 'png',
          packageRoot: 'mainPackage'
        }]
      });

      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].type).toBe('image_too_large');
      expect(result.issues[0].severity).toBe('major');
    });

    it('should create issues for missing dimensions', function() {
      var result = ImageAnalyzer.checkImageElements({
        wxmlCode: '<image src="/images/test.png" />',
        filePath: 'pages/test/index.wxml'
      });

      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].type).toBe('image_missing_dimensions');
    });

    it('should create issues for duplicate images', function() {
      var result = ImageAnalyzer.detectDuplicateImages({
        imageFiles: [
          { path: 'packageA/images/icon.png', size: 5000, format: 'png', packageRoot: 'packageA', hash: 'abc123' },
          { path: 'packageB/images/icon.png', size: 5000, format: 'png', packageRoot: 'packageB', hash: 'abc123' }
        ]
      });

      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].type).toBe('image_duplicate');
    });
  });


  describe('Suggestions Generation', function() {
    it('should suggest compression for oversized images', function() {
      var suggestions = ImageAnalyzer.generateSuggestions({
        scanResult: {
          oversizedFiles: [
            { path: 'images/large.png', size: 150 * 1024 }
          ],
          byFormat: { png: { count: 1 } },
          totalFiles: 1
        }
      });

      var hasCompressionSuggestion = suggestions.some(function(s) {
        return s.type === 'oversized_images';
      });

      expect(hasCompressionSuggestion).toBe(true);
    });

    it('should suggest WebP conversion when PNG/JPG dominant', function() {
      var suggestions = ImageAnalyzer.generateSuggestions({
        scanResult: {
          oversizedFiles: [],
          byFormat: {
            png: { count: 20 },
            jpg: { count: 15 },
            webp: { count: 5 }
          },
          totalFiles: 40
        }
      });

      var hasWebPSuggestion = suggestions.some(function(s) {
        return s.type === 'format_optimization';
      });

      expect(hasWebPSuggestion).toBe(true);
    });

    it('should suggest adding dimensions for missing width/height', function() {
      var suggestions = ImageAnalyzer.generateSuggestions({
        elementResult: {
          missingDimensions: [
            { file: 'pages/test/index.wxml', line: 1 },
            { file: 'pages/test/index.wxml', line: 5 }
          ],
          missingLazyLoad: []
        }
      });

      var hasDimensionSuggestion = suggestions.some(function(s) {
        return s.type === 'missing_dimensions';
      });

      expect(hasDimensionSuggestion).toBe(true);
    });

    it('should suggest eliminating cross-package duplicates', function() {
      var suggestions = ImageAnalyzer.generateSuggestions({
        duplicateResult: {
          totalDuplicateGroups: 2,
          totalWastedSizeFormatted: '50 KB',
          duplicateGroups: [
            { isCrossPackage: true, wastedSize: 25000 },
            { isCrossPackage: true, wastedSize: 25000 }
          ]
        }
      });

      var hasDuplicateSuggestion = suggestions.some(function(s) {
        return s.type === 'cross_package_duplicates';
      });

      expect(hasDuplicateSuggestion).toBe(true);
    });
  });

  describe('Report Summary', function() {
    it('should generate readable summary text', function() {
      var report = {
        timestamp: '2025-01-17T00:00:00.000Z',
        summary: {
          totalImages: 10,
          totalSizeFormatted: '500 KB',
          oversizedCount: 2,
          missingDimensionsCount: 3,
          duplicateGroupsCount: 1,
          wastedSizeFormatted: '20 KB'
        },
        totalIssues: 6,
        criticalIssues: 0,
        majorIssues: 3,
        minorIssues: 3,
        suggestions: [
          { priority: 'high', title: 'Test', description: 'Test description' }
        ]
      };

      var summaryText = ImageAnalyzer.generateSummaryText(report);

      expect(summaryText).toContain('图片总数: 10');
      expect(summaryText).toContain('总体积: 500 KB');
      expect(summaryText).toContain('超大图片: 2 个');
      expect(summaryText).toContain('总计: 6 个问题');
    });

    it('should handle null report gracefully', function() {
      var summaryText = ImageAnalyzer.generateSummaryText(null);
      expect(summaryText).toBe('无分析报告');
    });
  });
});
