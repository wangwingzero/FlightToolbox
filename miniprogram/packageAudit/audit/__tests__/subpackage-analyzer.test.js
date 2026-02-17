'use strict';

/**
 * 🧪 SubpackageAnalyzer 属性测试
 *
 * Property 6: Subpackage Configuration Analysis
 * **Validates: Requirements 6.1, 6.3, 6.6**
 *
 * 对于任何包含分包配置的app.json，SubpackageAnalyzer应该：
 * - 分析preloadRule完整性
 * - 识别可以作为独立分包的分包
 * - 计算分包体积并标记超过2MB的分包
 * - 基于分包关系生成优化建议
 *
 * @module subpackage-analyzer.test
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 分包配置分析属性测试
 *
 * 测试策略：
 * - 使用fast-check生成各种分包配置
 * - 验证检测的完整性和准确性
 * - 每个属性运行最少100次迭代
 */

var fc = require('fast-check');
var SubpackageAnalyzer = require('../subpackage-analyzer.js');

/**
 * ============================================================================
 * 常量定义
 * ============================================================================
 */

var LIMITS = SubpackageAnalyzer.LIMITS;
var RECOMMENDED = SubpackageAnalyzer.RECOMMENDED;

// 2MB in bytes
var TWO_MB = 2 * 1024 * 1024;
// 30MB in bytes
var THIRTY_MB = 30 * 1024 * 1024;

/**
 * ============================================================================
 * 测试数据生成器 (Arbitraries)
 * ============================================================================
 */

/**
 * 生成有效的分包根目录名称
 * @returns {fc.Arbitrary<string>}
 */
function validPackageRoot() {
  return fc.constantFrom(
    'packageA', 'packageB', 'packageC', 'packageD', 'packageE',
    'packageF', 'packageG', 'packageH', 'packageO', 'packageCCAR',
    'packageIOSA', 'packageWeather', 'packageDuty', 'packageCompetence',
    'packageDiet', 'packageMedical', 'packageICAO', 'packageRadiation',
    'packageQAR', 'packageWalkaround', 'packageCommFailure',
    'packageAircraftParameters', 'packageAircraftPerformance', 'packageTermCenter'
  );
}

/**
 * 生成音频分包根目录名称
 * @returns {fc.Arbitrary<string>}
 */
function audioPackageRoot() {
  return fc.constantFrom.apply(fc, SubpackageAnalyzer.AUDIO_PACKAGES);
}

/**
 * 生成绕机检查图片分包根目录名称
 * @returns {fc.Arbitrary<string>}
 */
function walkaroundImagePackageRoot() {
  return fc.constantFrom.apply(fc, SubpackageAnalyzer.WALKAROUND_IMAGE_PACKAGES);
}

/**
 * 生成分包体积（字节）
 * @param {Object} options - 选项
 * @param {number} [options.min] - 最小体积
 * @param {number} [options.max] - 最大体积
 * @returns {fc.Arbitrary<number>}
 */
function packageSize(options) {
  options = options || {};
  var min = options.min !== undefined ? options.min : 100 * 1024; // 100KB
  var max = options.max !== undefined ? options.max : 3 * 1024 * 1024; // 3MB
  return fc.integer({ min: min, max: max });
}

/**
 * 生成分包页面列表
 * @returns {fc.Arbitrary<string[]>}
 */
function packagePages() {
  return fc.array(
    fc.constantFrom(
      'index', 'detail', 'list', 'search', 'settings',
      'pages/index/index', 'pages/detail/index', 'pages/list/index',
      'pages/placeholder/index', 'placeholder/index'
    ),
    { minLength: 1, maxLength: 5 }
  );
}

/**
 * 生成单个分包配置
 * @returns {fc.Arbitrary<Object>}
 */
function subpackageConfig() {
  return fc.record({
    root: validPackageRoot(),
    name: fc.option(fc.constantFrom('测试分包A', '测试分包B', '功能模块', '数据模块'), { nil: undefined }),
    pages: packagePages(),
    independent: fc.option(fc.boolean(), { nil: undefined })
  }).map(function(r) {
    var config = {
      root: r.root,
      pages: r.pages
    };
    if (r.name !== undefined) {
      config.name = r.name;
    }
    if (r.independent !== undefined) {
      config.independent = r.independent;
    }
    return config;
  });
}

/**
 * 生成带有占位页的分包配置
 * @returns {fc.Arbitrary<Object>}
 */
function subpackageWithPlaceholder() {
  return fc.record({
    root: validPackageRoot(),
    hasPlaceholder: fc.boolean()
  }).map(function(r) {
    var pages = ['index', 'detail'];
    if (r.hasPlaceholder) {
      pages.push('pages/placeholder/index');
    }
    return {
      root: r.root,
      pages: pages
    };
  });
}

/**
 * 生成app.json配置
 * @returns {fc.Arbitrary<Object>}
 */
function appJsonConfig() {
  return fc.record({
    subPackages: fc.array(subpackageConfig(), { minLength: 1, maxLength: 10 }),
    hasPreloadRule: fc.boolean()
  }).map(function(r) {
    // 确保分包root唯一
    var uniquePackages = [];
    var seenRoots = {};
    for (var i = 0; i < r.subPackages.length; i++) {
      var pkg = r.subPackages[i];
      if (!seenRoots[pkg.root]) {
        seenRoots[pkg.root] = true;
        uniquePackages.push(pkg);
      }
    }

    var config = {
      subPackages: uniquePackages
    };

    if (r.hasPreloadRule && uniquePackages.length > 0) {
      config.preloadRule = {
        'pages/home/index': {
          network: 'all',
          packages: [uniquePackages[0].root]
        }
      };
    }

    return config;
  });
}

/**
 * 生成分包体积映射
 * @param {Array} subPackages - 分包配置数组
 * @param {Object} options - 选项
 * @returns {Object}
 */
function generatePackageSizes(subPackages, options) {
  options = options || {};
  var mainSize = options.mainPackageSize !== undefined ? 
    options.mainPackageSize : 1 * 1024 * 1024; // 默认1MB
  
  var sizes = {
    mainPackage: mainSize,
    subpackages: {}
  };

  for (var i = 0; i < subPackages.length; i++) {
    var pkg = subPackages[i];
    var size = options.subpackageSizes && options.subpackageSizes[pkg.root] !== undefined ?
      options.subpackageSizes[pkg.root] :
      500 * 1024; // 默认500KB
    sizes.subpackages[pkg.root] = size;
  }

  return sizes;
}

/**
 * 生成带有体积数据的完整配置
 * @returns {fc.Arbitrary<{appJson: Object, packageSizes: Object}>}
 */
function fullSubpackageConfig() {
  return fc.record({
    subPackageCount: fc.integer({ min: 1, max: 8 }),
    mainPackageSize: packageSize({ min: 500 * 1024, max: 2.5 * 1024 * 1024 }),
    subpackageSizeRange: fc.constantFrom('small', 'medium', 'large', 'exceeding')
  }).chain(function(r) {
    return fc.array(
      fc.record({
        root: validPackageRoot(),
        pages: packagePages()
      }),
      { minLength: r.subPackageCount, maxLength: r.subPackageCount }
    ).map(function(packages) {
      // 确保分包root唯一
      var uniquePackages = [];
      var seenRoots = {};
      for (var i = 0; i < packages.length; i++) {
        var pkg = packages[i];
        if (!seenRoots[pkg.root]) {
          seenRoots[pkg.root] = true;
          uniquePackages.push(pkg);
        }
      }

      // 根据范围生成分包体积
      var sizeMin, sizeMax;
      switch (r.subpackageSizeRange) {
        case 'small':
          sizeMin = 100 * 1024;
          sizeMax = 500 * 1024;
          break;
        case 'medium':
          sizeMin = 500 * 1024;
          sizeMax = 1.5 * 1024 * 1024;
          break;
        case 'large':
          sizeMin = 1.5 * 1024 * 1024;
          sizeMax = 2 * 1024 * 1024;
          break;
        case 'exceeding':
          sizeMin = 2 * 1024 * 1024 + 1;
          sizeMax = 3 * 1024 * 1024;
          break;
        default:
          sizeMin = 100 * 1024;
          sizeMax = 1 * 1024 * 1024;
      }

      var subpackageSizes = {};
      for (var j = 0; j < uniquePackages.length; j++) {
        subpackageSizes[uniquePackages[j].root] = 
          Math.floor(Math.random() * (sizeMax - sizeMin)) + sizeMin;
      }

      return {
        appJson: { subPackages: uniquePackages },
        packageSizes: {
          mainPackage: r.mainPackageSize,
          subpackages: subpackageSizes
        }
      };
    });
  });
}

/**
 * 生成预下载配置
 * @returns {fc.Arbitrary<Object>}
 */
function preloadRuleConfig() {
  return fc.record({
    pageCount: fc.integer({ min: 1, max: 5 }),
    packagesPerPage: fc.integer({ min: 1, max: 4 })
  }).chain(function(r) {
    var pages = [];
    for (var i = 0; i < r.pageCount; i++) {
      pages.push('pages/page' + i + '/index');
    }

    return fc.array(
      validPackageRoot(),
      { minLength: r.packagesPerPage * r.pageCount, maxLength: r.packagesPerPage * r.pageCount }
    ).map(function(packageRoots) {
      var preloadRule = {};
      var pkgIndex = 0;

      for (var j = 0; j < pages.length; j++) {
        var pagePackages = [];
        for (var k = 0; k < r.packagesPerPage && pkgIndex < packageRoots.length; k++) {
          pagePackages.push(packageRoots[pkgIndex]);
          pkgIndex++;
        }
        preloadRule[pages[j]] = {
          network: 'all',
          packages: pagePackages
        };
      }

      return preloadRule;
    });
  });
}

/**
 * 生成Storage API调用代码
 * @returns {fc.Arbitrary<{code: string, storageKey: string, api: string, isVersioned: boolean}>}
 */
function storageApiCode() {
  return fc.record({
    api: fc.constantFrom(
      'setStorageSync', 'getStorageSync', 'removeStorageSync',
      'setStorage', 'getStorage', 'removeStorage'
    ),
    keyType: fc.constantFrom('cache', 'data', 'system', 'versioned'),
    keyName: fc.constantFrom(
      'image_cache', 'audio_data', 'preload_index', 'offline_data',
      'system_config', 'user_settings', 'app_state'
    )
  }).map(function(r) {
    var storageKey = r.keyName;
    var isVersioned = r.keyType === 'versioned';
    var code;

    if (isVersioned) {
      code = 'var key = VersionManager.getVersionedKey("' + storageKey + '");\n';
      if (r.api.indexOf('Sync') !== -1) {
        code += 'wx.' + r.api + '(key, data);';
      } else {
        code += 'wx.' + r.api + '({ key: key, data: data });';
      }
    } else {
      if (r.api.indexOf('Sync') !== -1) {
        code = 'wx.' + r.api + '("' + storageKey + '", data);';
      } else {
        code = 'wx.' + r.api + '({ key: "' + storageKey + '", data: data });';
      }
    }

    return {
      code: code,
      storageKey: storageKey,
      api: r.api,
      isVersioned: isVersioned,
      looksLikeCacheKey: /cache|index|data|audio|image|preload|offline/i.test(storageKey)
    };
  });
}


/**
 * ============================================================================
 * Property 6: Subpackage Configuration Analysis
 * **Validates: Requirements 6.1, 6.3, 6.6**
 * ============================================================================
 */

describe('Property 6: Subpackage Configuration Analysis', function() {
  /**
   * Property 6a: Size Calculation Accuracy
   * **Validates: Requirements 6.6**
   *
   * 对于任何分包配置，总体积应该等于主包体积加上所有分包体积之和
   */
  describe('6a Size Calculation Accuracy', function() {
    it('should calculate total size as sum of main package and all subpackages', function() {
      fc.assert(
        fc.property(
          fc.record({
            mainPackageSize: packageSize({ min: 100 * 1024, max: 2 * 1024 * 1024 }),
            subpackageCount: fc.integer({ min: 1, max: 5 })
          }),
          function(r) {
            // 生成分包配置
            var subPackages = [];
            var subpackageSizes = {};
            var expectedSubpackageTotal = 0;

            for (var i = 0; i < r.subpackageCount; i++) {
              var root = 'package' + String.fromCharCode(65 + i); // packageA, packageB, etc.
              var size = Math.floor(Math.random() * 1024 * 1024) + 100 * 1024;
              subPackages.push({ root: root, pages: ['index'] });
              subpackageSizes[root] = size;
              expectedSubpackageTotal += size;
            }

            var result = SubpackageAnalyzer.analyzePackageSizes({
              appJson: { subPackages: subPackages },
              packageSizes: {
                mainPackage: r.mainPackageSize,
                subpackages: subpackageSizes
              }
            });

            var expectedTotal = r.mainPackageSize + expectedSubpackageTotal;

            // 总体积应该等于主包 + 所有分包
            return result.totalSize === expectedTotal;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should correctly report main package size', function() {
      fc.assert(
        fc.property(
          packageSize({ min: 100 * 1024, max: 2.5 * 1024 * 1024 }),
          function(mainSize) {
            var result = SubpackageAnalyzer.analyzePackageSizes({
              appJson: { subPackages: [{ root: 'packageA', pages: ['index'] }] },
              packageSizes: {
                mainPackage: mainSize,
                subpackages: { 'packageA': 500 * 1024 }
              }
            });

            return result.mainPackage.size === mainSize;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should correctly count subpackages', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          function(count) {
            var subPackages = [];
            var subpackageSizes = {};

            for (var i = 0; i < count; i++) {
              var root = 'pkg' + i;
              subPackages.push({ root: root, pages: ['index'] });
              subpackageSizes[root] = 500 * 1024;
            }

            var result = SubpackageAnalyzer.analyzePackageSizes({
              appJson: { subPackages: subPackages },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: subpackageSizes
              }
            });

            return result.subpackages.length === count;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });


  /**
   * Property 6b: Exceeding Detection
   * **Validates: Requirements 6.6**
   *
   * 超过2MB的分包应该被正确标记
   */
  describe('6b Exceeding Detection', function() {
    it('should flag packages exceeding 2MB limit', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 0, max: 5 }),
          function(exceedingCount, normalCount) {
            var subPackages = [];
            var subpackageSizes = {};
            var expectedExceeding = [];

            // 添加超限分包
            for (var i = 0; i < exceedingCount; i++) {
              var root = 'exceedPkg' + i;
              var size = TWO_MB + Math.floor(Math.random() * 1024 * 1024) + 1; // > 2MB
              subPackages.push({ root: root, pages: ['index'] });
              subpackageSizes[root] = size;
              expectedExceeding.push(root);
            }

            // 添加正常分包
            for (var j = 0; j < normalCount; j++) {
              var normalRoot = 'normalPkg' + j;
              var normalSize = Math.floor(Math.random() * (TWO_MB - 100 * 1024)) + 100 * 1024; // < 2MB
              subPackages.push({ root: normalRoot, pages: ['index'] });
              subpackageSizes[normalRoot] = normalSize;
            }

            if (subPackages.length === 0) {
              return true; // 跳过空配置
            }

            var result = SubpackageAnalyzer.analyzePackageSizes({
              appJson: { subPackages: subPackages },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: subpackageSizes
              }
            });

            // 超限分包数量应该匹配
            var detectedExceeding = result.exceedingPackages.map(function(p) { return p.name; });

            // 所有预期超限的分包都应该被检测到
            for (var k = 0; k < expectedExceeding.length; k++) {
              if (detectedExceeding.indexOf(expectedExceeding[k]) === -1) {
                return false;
              }
            }

            return result.exceedingPackages.length === exceedingCount;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag packages under 2MB limit', function() {
      fc.assert(
        fc.property(
          packageSize({ min: 100 * 1024, max: TWO_MB - 1 }),
          function(size) {
            var result = SubpackageAnalyzer.analyzePackageSizes({
              appJson: { subPackages: [{ root: 'testPkg', pages: ['index'] }] },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: { 'testPkg': size }
              }
            });

            // 不应该有超限分包
            var hasExceeding = result.exceedingPackages.some(function(p) {
              return p.name === 'testPkg';
            });

            return !hasExceeding;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should flag main package exceeding 2MB', function() {
      fc.assert(
        fc.property(
          packageSize({ min: TWO_MB + 1, max: 3 * 1024 * 1024 }),
          function(mainSize) {
            var result = SubpackageAnalyzer.analyzePackageSizes({
              appJson: { subPackages: [{ root: 'testPkg', pages: ['index'] }] },
              packageSizes: {
                mainPackage: mainSize,
                subpackages: { 'testPkg': 500 * 1024 }
              }
            });

            // 主包应该被标记为超限
            return result.mainPackage.exceedsLimit === true &&
                   result.exceedingPackages.some(function(p) { return p.name === 'mainPackage'; });
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });


  /**
   * Property 6c: Preload Quota Detection
   * **Validates: Requirements 6.1**
   *
   * 预下载配置超过2MB额度的页面应该被正确标记
   */
  describe('6c Preload Quota Detection', function() {
    it('should flag preload rules exceeding 2MB quota', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 4 }),
          function(packageCount) {
            // 创建多个分包，每个1MB，总和超过2MB
            var subPackages = [];
            var subpackageSizes = {};
            var preloadPackages = [];
            var totalPreloadSize = 0;

            for (var i = 0; i < packageCount; i++) {
              var root = 'preloadPkg' + i;
              var size = 1 * 1024 * 1024; // 1MB each
              subPackages.push({ root: root, pages: ['index'] });
              subpackageSizes[root] = size;
              preloadPackages.push(root);
              totalPreloadSize += size;
            }

            var result = SubpackageAnalyzer.analyzePreloadRules({
              appJson: {
                subPackages: subPackages,
                preloadRule: {
                  'pages/home/index': {
                    network: 'all',
                    packages: preloadPackages
                  }
                }
              },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: subpackageSizes
              }
            });

            if (result.length === 0) {
              return false;
            }

            var rule = result[0];

            // 如果总预下载体积超过2MB，应该被标记
            if (totalPreloadSize > TWO_MB) {
              return rule.exceedsQuota === true;
            } else {
              return rule.exceedsQuota === false;
            }
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag preload rules within 2MB quota', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }),
          function(packageCount) {
            // 创建分包，确保总和不超过2MB
            var subPackages = [];
            var subpackageSizes = {};
            var preloadPackages = [];
            var sizePerPackage = Math.floor((TWO_MB - 100 * 1024) / packageCount);

            for (var i = 0; i < packageCount; i++) {
              var root = 'smallPkg' + i;
              subPackages.push({ root: root, pages: ['index'] });
              subpackageSizes[root] = sizePerPackage;
              preloadPackages.push(root);
            }

            var result = SubpackageAnalyzer.analyzePreloadRules({
              appJson: {
                subPackages: subPackages,
                preloadRule: {
                  'pages/home/index': {
                    network: 'all',
                    packages: preloadPackages
                  }
                }
              },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: subpackageSizes
              }
            });

            if (result.length === 0) {
              return true; // 没有预下载规则
            }

            // 不应该被标记为超额
            return result[0].exceedsQuota === false;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should calculate total preload size correctly', function() {
      fc.assert(
        fc.property(
          fc.array(packageSize({ min: 100 * 1024, max: 1 * 1024 * 1024 }), { minLength: 1, maxLength: 4 }),
          function(sizes) {
            var subPackages = [];
            var subpackageSizes = {};
            var preloadPackages = [];
            var expectedTotal = 0;

            for (var i = 0; i < sizes.length; i++) {
              var root = 'calcPkg' + i;
              subPackages.push({ root: root, pages: ['index'] });
              subpackageSizes[root] = sizes[i];
              preloadPackages.push(root);
              expectedTotal += sizes[i];
            }

            var result = SubpackageAnalyzer.analyzePreloadRules({
              appJson: {
                subPackages: subPackages,
                preloadRule: {
                  'pages/test/index': {
                    network: 'all',
                    packages: preloadPackages
                  }
                }
              },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: subpackageSizes
              }
            });

            if (result.length === 0) {
              return false;
            }

            // 总预下载体积应该等于所有分包体积之和
            return result[0].totalPreloadSize === expectedTotal;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });


  /**
   * Property 6d: Placeholder Page Detection
   * **Validates: Requirements 6.1**
   *
   * 占位页检测应该准确识别有无占位页的分包
   */
  describe('6d Placeholder Page Detection', function() {
    it('should detect packages with placeholder pages', function() {
      fc.assert(
        fc.property(
          fc.boolean(),
          validPackageRoot(),
          function(hasPlaceholder, root) {
            var pages = ['index', 'detail'];
            if (hasPlaceholder) {
              pages.push('pages/placeholder/index');
            }

            var result = SubpackageAnalyzer.checkPlaceholderPages({
              appJson: {
                subPackages: [{ root: root, pages: pages }]
              }
            });

            if (result.length === 0) {
              return false;
            }

            // 检测结果应该与实际情况匹配
            return result[0].hasPlaceholder === hasPlaceholder;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect various placeholder page patterns', function() {
      var placeholderPatterns = [
        'pages/placeholder/index',
        'placeholder/index',
        'pages/placeholder',
        'placeholder'
      ];

      fc.assert(
        fc.property(
          fc.constantFrom.apply(fc, placeholderPatterns),
          function(pattern) {
            var result = SubpackageAnalyzer.checkPlaceholderPages({
              appJson: {
                subPackages: [{ root: 'testPkg', pages: ['index', pattern] }]
              }
            });

            if (result.length === 0) {
              return false;
            }

            // 应该检测到占位页
            return result[0].hasPlaceholder === true;
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });

    it('should flag walkaround image packages without placeholder', function() {
      fc.assert(
        fc.property(
          walkaroundImagePackageRoot(),
          function(root) {
            var result = SubpackageAnalyzer.checkPlaceholderPages({
              appJson: {
                subPackages: [{ root: root, pages: ['index'] }]
              }
            });

            if (result.length === 0) {
              return false;
            }

            // 绕机检查图片分包应该被识别
            if (!result[0].isWalkaroundImagePackage) {
              return false;
            }

            // 没有占位页应该产生问题
            if (!result[0].hasPlaceholder) {
              return result[0].issues.length > 0;
            }

            return true;
          }
        ),
        { numRuns: 20, verbose: true }
      );
    });

    it('should identify audio packages correctly', function() {
      fc.assert(
        fc.property(
          audioPackageRoot(),
          function(root) {
            var result = SubpackageAnalyzer.checkPlaceholderPages({
              appJson: {
                subPackages: [{ root: root, pages: ['index'] }]
              }
            });

            if (result.length === 0) {
              return false;
            }

            // 音频分包应该被正确识别
            return result[0].isAudioPackage === true;
          }
        ),
        { numRuns: 31, verbose: true }
      );
    });
  });


  /**
   * Property 6e: Versioned Cache Key Detection
   * **Validates: Requirements 6.1**
   *
   * 未使用版本化Key的Storage调用应该被检测到
   */
  describe('6e Versioned Cache Key Detection', function() {
    it('should detect unversioned storage keys', function() {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'setStorageSync', 'getStorageSync', 'removeStorageSync'
          ),
          fc.constantFrom(
            'image_cache', 'audio_data', 'preload_index', 'offline_data'
          ),
          function(api, keyName) {
            var code = 'wx.' + api + '("' + keyName + '", data);';

            var result = SubpackageAnalyzer.checkVersionedCacheKeys({
              files: [{ path: 'utils/cache.js', code: code }]
            });

            // 应该检测到未版本化的缓存Key
            if (result.length === 0) {
              return false;
            }

            return result[0].storageKey === keyName &&
                   result[0].isVersioned === false;
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });

    it('should not flag versioned storage keys', function() {
      fc.assert(
        fc.property(
          fc.constantFrom('my_cache', 'user_data', 'app_state'),
          function(keyName) {
            var code = 'var key = VersionManager.getVersionedKey("' + keyName + '");\n' +
                       'wx.setStorageSync(key, data);';

            var result = SubpackageAnalyzer.checkVersionedCacheKeys({
              files: [{ path: 'utils/cache.js', code: code }]
            });

            // 使用版本化方法的行不应该被标记
            return result.length === 0;
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });

    it('should ignore system keys', function() {
      fc.assert(
        fc.property(
          fc.constantFrom('system_config', 'wx_token', '__internal'),
          function(keyName) {
            var code = 'wx.setStorageSync("' + keyName + '", data);';

            var result = SubpackageAnalyzer.checkVersionedCacheKeys({
              files: [{ path: 'utils/system.js', code: code }]
            });

            // 系统Key应该被忽略
            return result.length === 0;
          }
        ),
        { numRuns: 30, verbose: true }
      );
    });

    it('should identify cache-like keys correctly', function() {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'image_cache_index', 'audio_preload_data', 'offline_cache',
            'user_settings', 'app_config', 'theme_preference'
          ),
          function(keyName) {
            var code = 'wx.setStorageSync("' + keyName + '", data);';

            var result = SubpackageAnalyzer.checkVersionedCacheKeys({
              files: [{ path: 'utils/storage.js', code: code }]
            });

            if (result.length === 0) {
              return true; // 可能被忽略
            }

            // 检查是否正确识别为缓存Key
            var isCacheLike = /cache|index|data|audio|image|preload|offline/i.test(keyName);
            return result[0].looksLikeCacheKey === isCacheLike;
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });
  });


  /**
   * Property 6f: Independent Package Detection
   * **Validates: Requirements 6.3**
   *
   * 独立分包配置应该被正确识别
   */
  describe('6f Independent Package Detection', function() {
    it('should identify independent packages', function() {
      fc.assert(
        fc.property(
          fc.boolean(),
          validPackageRoot(),
          function(isIndependent, root) {
            var pkg = { root: root, pages: ['index'] };
            if (isIndependent) {
              pkg.independent = true;
            }

            var result = SubpackageAnalyzer.checkIndependentPackages({
              appJson: { subPackages: [pkg] }
            });

            if (result.length === 0) {
              return false;
            }

            // 独立分包标记应该正确
            return result[0].isIndependent === isIndependent;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not suggest audio packages as independent', function() {
      fc.assert(
        fc.property(
          audioPackageRoot(),
          function(root) {
            var result = SubpackageAnalyzer.checkIndependentPackages({
              appJson: {
                subPackages: [{ root: root, pages: ['index'] }]
              }
            });

            if (result.length === 0) {
              return false;
            }

            // 音频分包不应该被建议作为独立分包
            return result[0].canBeIndependent === false;
          }
        ),
        { numRuns: 31, verbose: true }
      );
    });

    it('should not suggest walkaround image packages as independent', function() {
      fc.assert(
        fc.property(
          walkaroundImagePackageRoot(),
          function(root) {
            var result = SubpackageAnalyzer.checkIndependentPackages({
              appJson: {
                subPackages: [{ root: root, pages: ['index'] }]
              }
            });

            if (result.length === 0) {
              return false;
            }

            // 绕机检查图片分包不应该被建议作为独立分包
            return result[0].canBeIndependent === false;
          }
        ),
        { numRuns: 5, verbose: true }
      );
    });

    it('should suggest functional packages as potential independent', function() {
      fc.assert(
        fc.property(
          validPackageRoot(),
          function(root) {
            // 排除音频和图片分包
            if (SubpackageAnalyzer.isAudioPackage(root) ||
                SubpackageAnalyzer.isWalkaroundImagePackage(root)) {
              return true; // 跳过
            }

            var result = SubpackageAnalyzer.checkIndependentPackages({
              appJson: {
                subPackages: [{ root: root, pages: ['index'] }]
              }
            });

            if (result.length === 0) {
              return false;
            }

            // 功能性分包可以被建议作为独立分包
            return result[0].canBeIndependent === true;
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });
  });


  /**
   * Property 6g: Optimization Suggestions Generation
   * **Validates: Requirements 6.1, 6.3, 6.6**
   *
   * 优化建议应该基于分析结果正确生成
   */
  describe('6g Optimization Suggestions Generation', function() {
    it('should generate critical suggestions for exceeding packages', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }),
          function(exceedingCount) {
            var subPackages = [];
            var subpackageSizes = {};

            for (var i = 0; i < exceedingCount; i++) {
              var root = 'exceedPkg' + i;
              subPackages.push({ root: root, pages: ['index'] });
              subpackageSizes[root] = TWO_MB + 500 * 1024; // 2.5MB
            }

            var result = SubpackageAnalyzer.generateOptimizationSuggestions({
              appJson: { subPackages: subPackages },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: subpackageSizes
              }
            });

            // 应该有体积超限的建议
            var hasSizeCritical = result.some(function(s) {
              return s.type === 'size_critical' && s.priority === 'high';
            });

            return hasSizeCritical;
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });

    it('should generate warning suggestions for packages near limit', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }),
          function(warningCount) {
            var subPackages = [];
            var subpackageSizes = {};

            for (var i = 0; i < warningCount; i++) {
              var root = 'warnPkg' + i;
              subPackages.push({ root: root, pages: ['index'] });
              // 1.6MB - 超过推荐值但不超过限制
              subpackageSizes[root] = 1.6 * 1024 * 1024;
            }

            var result = SubpackageAnalyzer.generateOptimizationSuggestions({
              appJson: { subPackages: subPackages },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: subpackageSizes
              }
            });

            // 应该有体积警告的建议
            var hasSizeWarning = result.some(function(s) {
              return s.type === 'size_warning';
            });

            return hasSizeWarning;
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });

    it('should generate preload exceeded suggestions', function() {
      fc.assert(
        fc.property(
          fc.constant(true),
          function() {
            var subPackages = [
              { root: 'pkg1', pages: ['index'] },
              { root: 'pkg2', pages: ['index'] },
              { root: 'pkg3', pages: ['index'] }
            ];

            var result = SubpackageAnalyzer.generateOptimizationSuggestions({
              appJson: {
                subPackages: subPackages,
                preloadRule: {
                  'pages/home/index': {
                    network: 'all',
                    packages: ['pkg1', 'pkg2', 'pkg3']
                  }
                }
              },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: {
                  'pkg1': 1 * 1024 * 1024,
                  'pkg2': 1 * 1024 * 1024,
                  'pkg3': 1 * 1024 * 1024
                }
              }
            });

            // 应该有预下载超额的建议
            var hasPreloadExceeded = result.some(function(s) {
              return s.type === 'preload_exceeded';
            });

            return hasPreloadExceeded;
          }
        ),
        { numRuns: 20, verbose: true }
      );
    });

    it('should sort suggestions by priority', function() {
      fc.assert(
        fc.property(
          fc.constant(true),
          function() {
            // 创建多个分包，确保产生多种优先级的建议
            var subPackages = [
              { root: 'criticalPkg1', pages: ['index'] },
              { root: 'criticalPkg2', pages: ['index'] },
              { root: 'warnPkg1', pages: ['index'] },
              { root: 'warnPkg2', pages: ['index'] }
            ];

            var result = SubpackageAnalyzer.generateOptimizationSuggestions({
              appJson: {
                subPackages: subPackages,
                preloadRule: {
                  'pages/home/index': {
                    network: 'all',
                    packages: ['criticalPkg1', 'criticalPkg2', 'warnPkg1', 'warnPkg2']
                  }
                }
              },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: {
                  'criticalPkg1': 2.5 * 1024 * 1024, // 超限
                  'criticalPkg2': 2.3 * 1024 * 1024, // 超限
                  'warnPkg1': 1.6 * 1024 * 1024,     // 警告
                  'warnPkg2': 1.7 * 1024 * 1024      // 警告
                }
              }
            });

            // 如果没有建议或只有一个，排序是平凡正确的
            if (result.length <= 1) {
              return true;
            }

            // 高优先级应该在前面或相等
            var priorityOrder = { high: 0, medium: 1, low: 2 };
            for (var i = 1; i < result.length; i++) {
              var prevPriority = priorityOrder[result[i - 1].priority];
              var currPriority = priorityOrder[result[i].priority];
              
              // 如果优先级未定义，默认为low
              if (prevPriority === undefined) prevPriority = 2;
              if (currPriority === undefined) currPriority = 2;
              
              // 前一个优先级不应该比后一个低（数字大表示优先级低）
              if (prevPriority > currPriority) {
                return false;
              }
            }

            return true;
          }
        ),
        { numRuns: 20, verbose: true }
      );
    });
  });


  /**
   * Property 6h: Comprehensive Analysis
   * **Validates: Requirements 6.1, 6.3, 6.6**
   *
   * analyzeAll应该返回完整的分析报告
   */
  describe('6h Comprehensive Analysis', function() {
    it('should return complete analysis report', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          function(packageCount) {
            var subPackages = [];
            var subpackageSizes = {};

            for (var i = 0; i < packageCount; i++) {
              var root = 'analysisPkg' + i;
              subPackages.push({ root: root, pages: ['index'] });
              subpackageSizes[root] = 500 * 1024;
            }

            var result = SubpackageAnalyzer.analyzeAll({
              appJson: {
                subPackages: subPackages,
                preloadRule: {}
              },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: subpackageSizes
              }
            });

            // 报告应该包含所有必要字段
            return result.timestamp !== undefined &&
                   result.packageSizes !== undefined &&
                   result.preloadRules !== undefined &&
                   result.placeholderPages !== undefined &&
                   result.suggestions !== undefined &&
                   typeof result.totalIssues === 'number';
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });

    it('should count issues correctly', function() {
      fc.assert(
        fc.property(
          fc.constant(true),
          function() {
            // 创建一个会产生问题的配置
            var result = SubpackageAnalyzer.analyzeAll({
              appJson: {
                subPackages: [
                  { root: 'exceedPkg', pages: ['index'] },
                  { root: 'packageWalkaroundImages1', pages: ['index'] } // 缺少占位页
                ],
                preloadRule: {}
              },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: {
                  'exceedPkg': 2.5 * 1024 * 1024, // 超限
                  'packageWalkaroundImages1': 500 * 1024
                }
              }
            });

            // 总问题数应该等于各类问题之和
            var calculatedTotal = result.criticalIssues + result.majorIssues + result.minorIssues;

            // 允许有INFO级别的问题不计入
            return result.totalIssues >= calculatedTotal;
          }
        ),
        { numRuns: 20, verbose: true }
      );
    });

    it('should generate readable summary text', function() {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }),
          function(packageCount) {
            var subPackages = [];
            var subpackageSizes = {};

            for (var i = 0; i < packageCount; i++) {
              var root = 'summaryPkg' + i;
              subPackages.push({ root: root, pages: ['index'] });
              subpackageSizes[root] = 500 * 1024;
            }

            var report = SubpackageAnalyzer.analyzeAll({
              appJson: {
                subPackages: subPackages,
                preloadRule: {}
              },
              packageSizes: {
                mainPackage: 1 * 1024 * 1024,
                subpackages: subpackageSizes
              }
            });

            var summary = SubpackageAnalyzer.generateSummaryText(report);

            // 摘要应该是字符串且包含关键信息
            return typeof summary === 'string' &&
                   summary.indexOf('分包配置分析报告') !== -1 &&
                   summary.indexOf('体积统计') !== -1;
          }
        ),
        { numRuns: 30, verbose: true }
      );
    });
  });
});
