'use strict';

/**
 * 📦 分包配置分析器
 *
 * 分析和优化微信小程序分包配置
 * 检测体积限制、预下载配置、占位页和版本化缓存Key使用
 *
 * @module subpackage-analyzer
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 分包配置分析
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 单包限制：2MB（硬性限制）
 * - 总包限制：30MB（普通小程序）
 * - 预下载额度：同一页面配置的预下载分包累计≤2MB
 * - 独立分包不能引用主包资源
 * - TabBar页面必须在主包
 *
 * ⚠️ 基于项目实战经验（docs/分包缓存说明/）：
 * - 必须使用占位页导航兜底（真机调试模式）
 * - 必须使用版本化缓存Key隔离环境
 * - 关键资源必须使用本地缓存永久化
 *
 * @example
 * var SubpackageAnalyzer = require('./subpackage-analyzer.js');
 * var sizeResult = SubpackageAnalyzer.analyzePackageSizes();
 * var preloadResult = SubpackageAnalyzer.analyzePreloadRules();
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 官方限制常量（2025-2026）
 * ⚠️ 这些是硬性限制，必须严格遵守
 *
 * @constant {Object}
 */
var LIMITS = {
  SINGLE_PACKAGE_MAX: 2 * 1024 * 1024,      // 2MB - 单包最大限制
  TOTAL_SIZE_MAX: 30 * 1024 * 1024,         // 30MB - 总包最大限制（普通小程序）
  TOTAL_SIZE_MAX_SERVICE: 20 * 1024 * 1024, // 20MB - 总包最大限制（服务商代开发）
  PRELOAD_QUOTA_PER_PAGE: 2 * 1024 * 1024   // 2MB - 单页面预下载额度
};

/**
 * 项目推荐阈值（比官方限制更保守）
 * 留有余量以确保安全和良好的用户体验
 *
 * @constant {Object}
 */
var RECOMMENDED = {
  SINGLE_PACKAGE: 1.5 * 1024 * 1024,        // 1.5MB - 单包建议值
  PRELOAD_QUOTA: 1.9 * 1024 * 1024          // 1.9MB - 预下载建议值
};

/**
 * 已知的音频分包列表（31个国家/地区）
 * @constant {Array}
 */
var AUDIO_PACKAGES = [
  'packageJapan', 'packagePhilippines', 'packageKorean', 'packageSingapore',
  'packageThailand', 'packageRussia', 'packageSrilanka', 'packageAustralia',
  'packageTurkey', 'packageFrance', 'packageAmerica', 'packageItaly',
  'packageUAE', 'packageUK', 'packageTaipei', 'packageMacau',
  'packageHongKong', 'packageCanada', 'packageEgypt', 'packageNewZealand',
  'packageMalaysia', 'packageIndonesia', 'packageVietnam', 'packageIndia',
  'packageCambodia', 'packageMyanmar', 'packageUzbekistan', 'packageMaldive',
  'packageSpain', 'packageGermany', 'packageHolland'
];

/**
 * 绕机检查图片分包列表
 * @constant {Array}
 */
var WALKAROUND_IMAGE_PACKAGES = [
  'packageWalkaroundImages1', 'packageWalkaroundImages2',
  'packageWalkaroundImages3', 'packageWalkaroundImages4',
  'packageWalkaroundImagesShared'
];

/**
 * 分包配置分析器
 * @namespace SubpackageAnalyzer
 */
var SubpackageAnalyzer = {
  /**
   * 官方限制常量
   */
  LIMITS: LIMITS,

  /**
   * 推荐阈值
   */
  RECOMMENDED: RECOMMENDED,

  /**
   * 音频分包列表
   */
  AUDIO_PACKAGES: AUDIO_PACKAGES,

  /**
   * 绕机检查图片分包列表
   */
  WALKAROUND_IMAGE_PACKAGES: WALKAROUND_IMAGE_PACKAGES,

  /**
   * 分析所有分包体积
   * 检测主包和各分包的体积，标记超限或接近限制的分包
   *
   * @param {Object} options - 分析选项
   * @param {Object} [options.appJson] - app.json配置对象（可选，用于测试）
   * @param {Object} [options.packageSizes] - 分包体积映射（可选，用于测试）
   * @returns {Object} 分包体积分析结果
   *
   * @example
   * var result = SubpackageAnalyzer.analyzePackageSizes();
   * console.log('主包体积:', result.mainPackage.size);
   * console.log('超限分包:', result.exceedingPackages);
   */
  analyzePackageSizes: function(options) {
    options = options || {};

    var result = {
      mainPackage: {
        size: 0,
        sizeFormatted: '0 KB',
        exceedsLimit: false,
        exceedsRecommended: false,
        usagePercent: 0
      },
      subpackages: [],
      totalSize: 0,
      totalSizeFormatted: '0 KB',
      totalExceedsLimit: false,
      exceedingPackages: [],
      warningPackages: [],
      issues: []
    };

    try {
      // 获取app.json配置
      var appJson = options.appJson || this._getAppJson();
      if (!appJson) {
        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.PERFORMANCE,
          severity: AuditConfig.AuditSeverity.CRITICAL,
          type: AuditConfig.AuditIssueType.SUBPACKAGE_SIZE,
          file: 'app.json',
          description: '无法读取app.json配置',
          suggestion: '确保app.json文件存在且格式正确'
        }));
        return result;
      }

      // 获取分包体积数据
      var packageSizes = options.packageSizes || this._getPackageSizes();

      // 分析主包
      var mainPackageSize = packageSizes.mainPackage || 0;
      result.mainPackage = {
        size: mainPackageSize,
        sizeFormatted: this._formatSize(mainPackageSize),
        exceedsLimit: mainPackageSize > LIMITS.SINGLE_PACKAGE_MAX,
        exceedsRecommended: mainPackageSize > RECOMMENDED.SINGLE_PACKAGE,
        usagePercent: ((mainPackageSize / LIMITS.SINGLE_PACKAGE_MAX) * 100).toFixed(1)
      };

      if (result.mainPackage.exceedsLimit) {
        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.PERFORMANCE,
          severity: AuditConfig.AuditSeverity.CRITICAL,
          type: AuditConfig.AuditIssueType.MAIN_PACKAGE_SIZE,
          file: 'miniprogram/',
          description: '主包体积 ' + result.mainPackage.sizeFormatted + ' 超过2MB限制',
          suggestion: '将非TabBar页面和非核心组件移至分包',
          metadata: { size: mainPackageSize, limit: LIMITS.SINGLE_PACKAGE_MAX }
        }));
        result.exceedingPackages.push({ name: 'mainPackage', size: mainPackageSize });
      } else if (result.mainPackage.exceedsRecommended) {
        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.PERFORMANCE,
          severity: AuditConfig.AuditSeverity.MAJOR,
          type: AuditConfig.AuditIssueType.MAIN_PACKAGE_SIZE,
          file: 'miniprogram/',
          description: '主包体积 ' + result.mainPackage.sizeFormatted + ' 超过1.5MB建议值',
          suggestion: '建议优化主包体积，将可延迟加载的模块移至分包',
          metadata: { size: mainPackageSize, recommended: RECOMMENDED.SINGLE_PACKAGE }
        }));
        result.warningPackages.push({ name: 'mainPackage', size: mainPackageSize });
      }

      result.totalSize = mainPackageSize;

      // 分析各分包
      var subPackages = appJson.subPackages || appJson.subpackages || [];
      for (var i = 0; i < subPackages.length; i++) {
        var pkg = subPackages[i];
        var pkgRoot = pkg.root;
        var pkgName = pkg.name || pkgRoot;
        var pkgSize = (packageSizes.subpackages && packageSizes.subpackages[pkgRoot]) || 0;

        var subpackageInfo = {
          root: pkgRoot,
          name: pkgName,
          size: pkgSize,
          sizeFormatted: this._formatSize(pkgSize),
          exceedsLimit: pkgSize > LIMITS.SINGLE_PACKAGE_MAX,
          exceedsRecommended: pkgSize > RECOMMENDED.SINGLE_PACKAGE,
          usagePercent: ((pkgSize / LIMITS.SINGLE_PACKAGE_MAX) * 100).toFixed(1),
          isAudioPackage: AUDIO_PACKAGES.indexOf(pkgRoot) !== -1,
          isWalkaroundImagePackage: WALKAROUND_IMAGE_PACKAGES.indexOf(pkgRoot) !== -1,
          pages: pkg.pages || []
        };

        result.subpackages.push(subpackageInfo);
        result.totalSize += pkgSize;

        if (subpackageInfo.exceedsLimit) {
          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.CRITICAL,
            type: AuditConfig.AuditIssueType.SUBPACKAGE_SIZE,
            file: pkgRoot + '/',
            description: '分包 ' + pkgName + ' 体积 ' + subpackageInfo.sizeFormatted + ' 超过2MB限制',
            suggestion: '拆分分包或移除不必要的资源文件',
            metadata: { packageRoot: pkgRoot, size: pkgSize, limit: LIMITS.SINGLE_PACKAGE_MAX }
          }));
          result.exceedingPackages.push({ name: pkgRoot, size: pkgSize });
        } else if (subpackageInfo.exceedsRecommended) {
          result.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.MINOR,
            type: AuditConfig.AuditIssueType.SUBPACKAGE_SIZE,
            file: pkgRoot + '/',
            description: '分包 ' + pkgName + ' 体积 ' + subpackageInfo.sizeFormatted + ' 超过1.5MB建议值',
            suggestion: '建议优化分包体积，预留空间应对未来扩展',
            metadata: { packageRoot: pkgRoot, size: pkgSize, recommended: RECOMMENDED.SINGLE_PACKAGE }
          }));
          result.warningPackages.push({ name: pkgRoot, size: pkgSize });
        }
      }

      // 检查总体积
      result.totalSizeFormatted = this._formatSize(result.totalSize);
      result.totalExceedsLimit = result.totalSize > LIMITS.TOTAL_SIZE_MAX;

      if (result.totalExceedsLimit) {
        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.PERFORMANCE,
          severity: AuditConfig.AuditSeverity.CRITICAL,
          type: AuditConfig.AuditIssueType.SUBPACKAGE_SIZE,
          file: 'app.json',
          description: '小程序总体积 ' + result.totalSizeFormatted + ' 超过30MB限制',
          suggestion: '移除不必要的资源或将部分资源托管至CDN',
          metadata: { totalSize: result.totalSize, limit: LIMITS.TOTAL_SIZE_MAX }
        }));
      }

    } catch (error) {
      console.error('❌ 分包体积分析失败:', error);
      result.error = error.message || String(error);
    }

    return result;
  },

  /**
   * 分析预下载配置
   * 检查每个页面的预下载额度是否超过2MB
   *
   * @param {Object} options - 分析选项
   * @param {Object} [options.appJson] - app.json配置对象（可选，用于测试）
   * @param {Object} [options.packageSizes] - 分包体积映射（可选，用于测试）
   * @returns {Array} 预下载配置分析结果
   *
   * @example
   * var result = SubpackageAnalyzer.analyzePreloadRules();
   * result.forEach(function(rule) {
   *   if (rule.exceedsQuota) {
   *     console.warn('预下载超额:', rule.page);
   *   }
   * });
   */
  analyzePreloadRules: function(options) {
    options = options || {};
    var results = [];

    try {
      var appJson = options.appJson || this._getAppJson();
      if (!appJson) {
        return results;
      }

      var preloadRule = appJson.preloadRule || {};
      var packageSizes = options.packageSizes || this._getPackageSizes();
      var subpackageSizes = packageSizes.subpackages || {};

      // 构建分包root到name的映射
      var rootToName = {};
      var subPackages = appJson.subPackages || appJson.subpackages || [];
      for (var i = 0; i < subPackages.length; i++) {
        var pkg = subPackages[i];
        rootToName[pkg.root] = pkg.name || pkg.root;
      }

      // 分析每个预下载规则
      var pages = Object.keys(preloadRule);
      for (var j = 0; j < pages.length; j++) {
        var page = pages[j];
        var rule = preloadRule[page];
        var packages = rule.packages || [];
        var network = rule.network || 'wifi';

        var totalPreloadSize = 0;
        var packageDetails = [];

        for (var k = 0; k < packages.length; k++) {
          var pkgRoot = packages[k];
          var pkgSize = subpackageSizes[pkgRoot] || 0;
          totalPreloadSize += pkgSize;

          packageDetails.push({
            root: pkgRoot,
            name: rootToName[pkgRoot] || pkgRoot,
            size: pkgSize,
            sizeFormatted: this._formatSize(pkgSize)
          });
        }

        var exceedsQuota = totalPreloadSize > LIMITS.PRELOAD_QUOTA_PER_PAGE;
        var exceedsRecommended = totalPreloadSize > RECOMMENDED.PRELOAD_QUOTA;

        var ruleResult = {
          page: page,
          network: network,
          packages: packageDetails,
          packageCount: packages.length,
          totalPreloadSize: totalPreloadSize,
          totalPreloadSizeFormatted: this._formatSize(totalPreloadSize),
          exceedsQuota: exceedsQuota,
          exceedsRecommended: exceedsRecommended,
          usagePercent: ((totalPreloadSize / LIMITS.PRELOAD_QUOTA_PER_PAGE) * 100).toFixed(1),
          recommendation: null,
          issues: []
        };

        // 生成建议
        if (exceedsQuota) {
          ruleResult.recommendation = '预下载配置超过2MB额度，超出部分将不会预下载。建议减少预下载分包数量或拆分分包。';
          ruleResult.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.MAJOR,
            type: AuditConfig.AuditIssueType.PRELOAD_QUOTA_EXCEEDED,
            file: 'app.json',
            line: null,
            description: '页面 ' + page + ' 的预下载配置 ' + ruleResult.totalPreloadSizeFormatted + ' 超过2MB额度',
            suggestion: '减少预下载分包数量，当前配置了 ' + packages.length + ' 个分包',
            metadata: {
              page: page,
              totalSize: totalPreloadSize,
              quota: LIMITS.PRELOAD_QUOTA_PER_PAGE,
              packages: packages
            }
          }));
        } else if (exceedsRecommended) {
          ruleResult.recommendation = '预下载配置接近2MB额度限制，建议预留空间。';
        }

        results.push(ruleResult);
      }

    } catch (error) {
      console.error('❌ 预下载配置分析失败:', error);
    }

    return results;
  },

  /**
   * 检查占位页配置
   * 验证每个分包是否有占位页用于真机调试兜底
   *
   * ⚠️ 项目实战：每个分包必须有占位页用于真机调试兜底
   * 问题：真机调试模式下 wx.loadSubpackage 不可用
   * 方案：通过页面导航强制触发分包加载
   *
   * @param {Object} options - 检查选项
   * @param {Object} [options.appJson] - app.json配置对象（可选，用于测试）
   * @param {Array} [options.existingPlaceholders] - 已存在的占位页列表（可选，用于测试）
   * @returns {Array} 占位页配置检查结果
   *
   * @example
   * var result = SubpackageAnalyzer.checkPlaceholderPages();
   * result.forEach(function(pkg) {
   *   if (!pkg.hasPlaceholder) {
   *     console.warn('缺少占位页:', pkg.packageRoot);
   *   }
   * });
   */
  checkPlaceholderPages: function(options) {
    options = options || {};
    var results = [];

    try {
      var appJson = options.appJson || this._getAppJson();
      if (!appJson) {
        return results;
      }

      var subPackages = appJson.subPackages || appJson.subpackages || [];
      var existingPlaceholders = options.existingPlaceholders || [];

      for (var i = 0; i < subPackages.length; i++) {
        var pkg = subPackages[i];
        var pkgRoot = pkg.root;
        var pkgName = pkg.name || pkgRoot;
        var pages = pkg.pages || [];

        // 检查是否有占位页
        var hasPlaceholder = false;
        var placeholderPath = null;

        // 常见的占位页路径模式
        var placeholderPatterns = [
          'pages/placeholder/index',
          'placeholder/index',
          'pages/placeholder',
          'placeholder'
        ];

        for (var j = 0; j < pages.length; j++) {
          var pagePath = pages[j];
          for (var k = 0; k < placeholderPatterns.length; k++) {
            if (pagePath.indexOf(placeholderPatterns[k]) !== -1 ||
                pagePath === placeholderPatterns[k]) {
              hasPlaceholder = true;
              placeholderPath = pkgRoot + '/' + pagePath;
              break;
            }
          }
          if (hasPlaceholder) break;
        }

        // 也检查外部提供的占位页列表
        if (!hasPlaceholder && existingPlaceholders.length > 0) {
          for (var m = 0; m < existingPlaceholders.length; m++) {
            if (existingPlaceholders[m].indexOf(pkgRoot) === 0) {
              hasPlaceholder = true;
              placeholderPath = existingPlaceholders[m];
              break;
            }
          }
        }

        var pkgResult = {
          packageRoot: pkgRoot,
          packageName: pkgName,
          hasPlaceholder: hasPlaceholder,
          placeholderPath: placeholderPath,
          isAudioPackage: AUDIO_PACKAGES.indexOf(pkgRoot) !== -1,
          isWalkaroundImagePackage: WALKAROUND_IMAGE_PACKAGES.indexOf(pkgRoot) !== -1,
          pages: pages,
          issues: []
        };

        // 对于图片分包，占位页是必须的
        if (pkgResult.isWalkaroundImagePackage && !hasPlaceholder) {
          pkgResult.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.MAJOR,
            type: 'missing_placeholder_page',
            file: pkgRoot + '/',
            description: '图片分包 ' + pkgName + ' 缺少占位页，真机调试时可能无法正确加载',
            suggestion: '添加 ' + pkgRoot + '/pages/placeholder/index 占位页用于真机调试兜底',
            metadata: { packageRoot: pkgRoot, packageName: pkgName }
          }));
        }

        // 对于音频分包，建议有占位页
        if (pkgResult.isAudioPackage && !hasPlaceholder) {
          pkgResult.issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.PERFORMANCE,
            severity: AuditConfig.AuditSeverity.MINOR,
            type: 'missing_placeholder_page',
            file: pkgRoot + '/',
            description: '音频分包 ' + pkgName + ' 缺少占位页',
            suggestion: '建议添加占位页以支持真机调试模式下的分包预加载',
            metadata: { packageRoot: pkgRoot, packageName: pkgName }
          }));
        }

        results.push(pkgResult);
      }

    } catch (error) {
      console.error('❌ 占位页检查失败:', error);
    }

    return results;
  },

  /**
   * 检查版本化缓存Key使用
   * 验证代码中是否正确使用VersionManager隔离不同环境
   *
   * ⚠️ 项目实战：必须使用VersionManager隔离不同环境
   * 问题：Storage在不同版本/环境之间物理共享
   * 方案：使用版本前缀隔离不同环境
   *
   * @param {Object} options - 检查选项
   * @param {Array} [options.files] - 要检查的文件列表（可选，用于测试）
   * @returns {Array} 版本化Key使用检查结果
   *
   * @example
   * var result = SubpackageAnalyzer.checkVersionedCacheKeys({
   *   files: [{ path: 'utils/cache.js', code: '...' }]
   * });
   */
  checkVersionedCacheKeys: function(options) {
    options = options || {};
    var results = [];

    try {
      var files = options.files || [];

      // 需要检查的Storage API模式
      var storagePatterns = [
        { pattern: /wx\.setStorageSync\s*\(\s*['"]([^'"]+)['"]/g, api: 'setStorageSync' },
        { pattern: /wx\.getStorageSync\s*\(\s*['"]([^'"]+)['"]/g, api: 'getStorageSync' },
        { pattern: /wx\.removeStorageSync\s*\(\s*['"]([^'"]+)['"]/g, api: 'removeStorageSync' },
        { pattern: /wx\.setStorage\s*\(\s*\{\s*key\s*:\s*['"]([^'"]+)['"]/g, api: 'setStorage' },
        { pattern: /wx\.getStorage\s*\(\s*\{\s*key\s*:\s*['"]([^'"]+)['"]/g, api: 'getStorage' },
        { pattern: /wx\.removeStorage\s*\(\s*\{\s*key\s*:\s*['"]([^'"]+)['"]/g, api: 'removeStorage' }
      ];

      // 版本化Key的模式（使用VersionManager）
      var versionedPatterns = [
        /VersionManager\.getVersionedKey/,
        /VersionManager\.getEnvScopedKey/,
        /getVersionedKey\s*\(/,
        /getEnvScopedKey\s*\(/
      ];

      // 可以忽略的Key（系统级或不需要版本化的）
      var ignoredKeyPatterns = [
        /^system_/,
        /^wx_/,
        /^__/,
        /^cache_migration_flags$/,
        /^app_launch_count$/,
        /^last_version$/
      ];

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var filePath = file.path;
        var code = file.code || '';
        var lines = code.split('\n');

        // 检查文件是否导入了VersionManager
        var hasVersionManagerImport = /require\s*\(\s*['"].*version-manager/.test(code) ||
                                      /VersionManager/.test(code);

        // 扫描每一行
        for (var lineNum = 0; lineNum < lines.length; lineNum++) {
          var line = lines[lineNum];

          // 检查是否使用了版本化方法
          var usesVersionedMethod = false;
          for (var v = 0; v < versionedPatterns.length; v++) {
            if (versionedPatterns[v].test(line)) {
              usesVersionedMethod = true;
              break;
            }
          }

          // 如果使用了版本化方法，跳过这行
          if (usesVersionedMethod) {
            continue;
          }

          // 检查直接使用Storage API的情况
          for (var p = 0; p < storagePatterns.length; p++) {
            var patternInfo = storagePatterns[p];
            var regex = new RegExp(patternInfo.pattern.source, 'g');
            var match;

            while ((match = regex.exec(line)) !== null) {
              var storageKey = match[1];

              // 检查是否是可忽略的Key
              var shouldIgnore = false;
              for (var ig = 0; ig < ignoredKeyPatterns.length; ig++) {
                if (ignoredKeyPatterns[ig].test(storageKey)) {
                  shouldIgnore = true;
                  break;
                }
              }

              if (shouldIgnore) {
                continue;
              }

              // 检查Key是否看起来像是硬编码的缓存Key
              var looksLikeCacheKey = /cache|index|data|audio|image|preload|offline/i.test(storageKey);

              results.push({
                file: filePath,
                line: lineNum + 1,
                api: patternInfo.api,
                storageKey: storageKey,
                isVersioned: false,
                hasVersionManagerImport: hasVersionManagerImport,
                looksLikeCacheKey: looksLikeCacheKey,
                suggestion: looksLikeCacheKey ?
                  '使用 VersionManager.getVersionedKey(\'' + storageKey + '\') 替代硬编码Key' :
                  '考虑是否需要使用版本化Key隔离不同环境',
                issues: []
              });

              if (looksLikeCacheKey) {
                results[results.length - 1].issues.push(AuditReport.createIssue({
                  category: AuditConfig.AuditCategory.CODE_QUALITY,
                  severity: AuditConfig.AuditSeverity.MAJOR,
                  type: 'unversioned_cache_key',
                  file: filePath,
                  line: lineNum + 1,
                  description: 'Storage Key "' + storageKey + '" 未使用版本化前缀，可能导致环境间缓存污染',
                  suggestion: '使用 VersionManager.getVersionedKey(\'' + storageKey + '\') 替代',
                  metadata: { storageKey: storageKey, api: patternInfo.api }
                }));
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ 版本化Key检查失败:', error);
    }

    return results;
  },

  /**
   * 检查独立分包配置
   * 验证独立分包是否错误依赖了主包资源
   *
   * @param {Object} options - 检查选项
   * @param {Object} [options.appJson] - app.json配置对象（可选，用于测试）
   * @returns {Array} 独立分包检查结果
   *
   * @example
   * var result = SubpackageAnalyzer.checkIndependentPackages();
   */
  checkIndependentPackages: function(options) {
    options = options || {};
    var results = [];

    try {
      var appJson = options.appJson || this._getAppJson();
      if (!appJson) {
        return results;
      }

      var subPackages = appJson.subPackages || appJson.subpackages || [];

      for (var i = 0; i < subPackages.length; i++) {
        var pkg = subPackages[i];
        var pkgRoot = pkg.root;
        var pkgName = pkg.name || pkgRoot;
        var isIndependent = pkg.independent === true;

        var pkgResult = {
          packageRoot: pkgRoot,
          packageName: pkgName,
          isIndependent: isIndependent,
          hasMainPackageDependency: false,
          canBeIndependent: false,
          issues: []
        };

        // 独立分包的限制说明
        if (isIndependent) {
          pkgResult.independentLimitations = [
            '不能引用主包的JS、WXML、WXSS、插件',
            'getApp()返回临时局部实例，非主包全局数据',
            'app.wxss全局样式不生效',
            'TabBar页面不能放在独立分包'
          ];
        }

        // 判断是否适合作为独立分包
        // 音频分包和图片分包通常不适合作为独立分包（需要主包的播放器等）
        var isAudioPackage = AUDIO_PACKAGES.indexOf(pkgRoot) !== -1;
        var isWalkaroundImagePackage = WALKAROUND_IMAGE_PACKAGES.indexOf(pkgRoot) !== -1;

        if (!isAudioPackage && !isWalkaroundImagePackage) {
          // 功能性分包可能适合作为独立分包
          pkgResult.canBeIndependent = true;
          pkgResult.independentSuggestion = '此分包可考虑配置为独立分包，提升从外部入口进入时的启动速度';
        }

        results.push(pkgResult);
      }

    } catch (error) {
      console.error('❌ 独立分包检查失败:', error);
    }

    return results;
  },

  /**
   * 生成分包优化建议
   * 综合分析后生成优化建议列表
   *
   * @param {Object} options - 生成选项
   * @returns {Array} 优化建议列表
   *
   * @example
   * var suggestions = SubpackageAnalyzer.generateOptimizationSuggestions();
   */
  generateOptimizationSuggestions: function(options) {
    options = options || {};
    var suggestions = [];

    try {
      // 分析分包体积
      var sizeResult = this.analyzePackageSizes(options);

      // 分析预下载配置
      var preloadResult = this.analyzePreloadRules(options);

      // 检查占位页
      var placeholderResult = this.checkPlaceholderPages(options);

      // 1. 体积优化建议
      if (sizeResult.exceedingPackages.length > 0) {
        suggestions.push({
          type: 'size_critical',
          priority: 'high',
          title: '分包体积超限',
          description: '有 ' + sizeResult.exceedingPackages.length + ' 个分包超过2MB限制',
          packages: sizeResult.exceedingPackages,
          safetyCheck: false,
          estimatedImpact: { severity: 'critical', blocksRelease: true }
        });
      }

      if (sizeResult.warningPackages.length > 0) {
        suggestions.push({
          type: 'size_warning',
          priority: 'medium',
          title: '分包体积接近限制',
          description: '有 ' + sizeResult.warningPackages.length + ' 个分包超过1.5MB建议值',
          packages: sizeResult.warningPackages,
          safetyCheck: true,
          estimatedImpact: { severity: 'warning', blocksRelease: false }
        });
      }

      // 2. 预下载优化建议
      var exceedingPreloads = preloadResult.filter(function(r) { return r.exceedsQuota; });
      if (exceedingPreloads.length > 0) {
        suggestions.push({
          type: 'preload_exceeded',
          priority: 'high',
          title: '预下载配置超额',
          description: '有 ' + exceedingPreloads.length + ' 个页面的预下载配置超过2MB额度',
          pages: exceedingPreloads.map(function(r) { return r.page; }),
          safetyCheck: false,
          estimatedImpact: { severity: 'major', blocksRelease: false }
        });
      }

      // 3. 占位页建议
      var missingPlaceholders = placeholderResult.filter(function(r) {
        return !r.hasPlaceholder && (r.isWalkaroundImagePackage || r.isAudioPackage);
      });
      if (missingPlaceholders.length > 0) {
        suggestions.push({
          type: 'missing_placeholder',
          priority: 'medium',
          title: '缺少占位页',
          description: '有 ' + missingPlaceholders.length + ' 个分包缺少占位页，可能影响真机调试',
          packages: missingPlaceholders.map(function(r) { return r.packageRoot; }),
          safetyCheck: true,
          estimatedImpact: { severity: 'minor', blocksRelease: false }
        });
      }

      // 4. 总体积建议
      if (sizeResult.totalSize > LIMITS.TOTAL_SIZE_MAX * 0.8) {
        var usagePercent = ((sizeResult.totalSize / LIMITS.TOTAL_SIZE_MAX) * 100).toFixed(1);
        suggestions.push({
          type: 'total_size_warning',
          priority: sizeResult.totalExceedsLimit ? 'high' : 'low',
          title: '总体积' + (sizeResult.totalExceedsLimit ? '超限' : '较高'),
          description: '小程序总体积 ' + sizeResult.totalSizeFormatted + '，已使用 ' + usagePercent + '% 额度',
          safetyCheck: !sizeResult.totalExceedsLimit,
          estimatedImpact: {
            severity: sizeResult.totalExceedsLimit ? 'critical' : 'info',
            blocksRelease: sizeResult.totalExceedsLimit
          }
        });
      }

    } catch (error) {
      console.error('❌ 生成优化建议失败:', error);
    }

    // 按优先级排序
    var priorityOrder = { high: 0, medium: 1, low: 2 };
    suggestions.sort(function(a, b) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return suggestions;
  },

  /**
   * 综合分析分包配置
   * 执行所有分析并返回综合报告
   *
   * @param {Object} options - 分析选项
   * @returns {Object} 综合分析报告
   *
   * @example
   * var report = SubpackageAnalyzer.analyzeAll();
   * console.log('总问题数:', report.totalIssues);
   */
  analyzeAll: function(options) {
    options = options || {};

    var report = {
      timestamp: new Date().toISOString(),
      packageSizes: null,
      preloadRules: null,
      placeholderPages: null,
      independentPackages: null,
      suggestions: null,
      totalIssues: 0,
      criticalIssues: 0,
      majorIssues: 0,
      minorIssues: 0,
      allIssues: []
    };

    try {
      // 执行各项分析
      report.packageSizes = this.analyzePackageSizes(options);
      report.preloadRules = this.analyzePreloadRules(options);
      report.placeholderPages = this.checkPlaceholderPages(options);
      report.independentPackages = this.checkIndependentPackages(options);
      report.suggestions = this.generateOptimizationSuggestions(options);

      // 收集所有问题
      if (report.packageSizes && report.packageSizes.issues) {
        report.allIssues = report.allIssues.concat(report.packageSizes.issues);
      }

      for (var i = 0; i < report.preloadRules.length; i++) {
        var preloadRule = report.preloadRules[i];
        if (preloadRule.issues) {
          report.allIssues = report.allIssues.concat(preloadRule.issues);
        }
      }

      for (var j = 0; j < report.placeholderPages.length; j++) {
        var placeholder = report.placeholderPages[j];
        if (placeholder.issues) {
          report.allIssues = report.allIssues.concat(placeholder.issues);
        }
      }

      // 统计问题数量
      report.totalIssues = report.allIssues.length;
      for (var k = 0; k < report.allIssues.length; k++) {
        var issue = report.allIssues[k];
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

  /**
   * 生成分析报告摘要文本
   *
   * @param {Object} report - 分析报告对象
   * @returns {string} 摘要文本
   */
  generateSummaryText: function(report) {
    if (!report) {
      return '无分析报告';
    }

    var lines = [
      '========== 分包配置分析报告 ==========',
      '时间: ' + report.timestamp,
      ''
    ];

    // 体积统计
    if (report.packageSizes) {
      var sizes = report.packageSizes;
      lines.push('【体积统计】');
      lines.push('  主包: ' + sizes.mainPackage.sizeFormatted + ' (' + sizes.mainPackage.usagePercent + '%)');
      lines.push('  分包数量: ' + sizes.subpackages.length);
      lines.push('  总体积: ' + sizes.totalSizeFormatted);

      if (sizes.exceedingPackages.length > 0) {
        lines.push('  ⚠️ 超限分包: ' + sizes.exceedingPackages.length + ' 个');
      }
      if (sizes.warningPackages.length > 0) {
        lines.push('  ⚡ 警告分包: ' + sizes.warningPackages.length + ' 个');
      }
      lines.push('');
    }

    // 预下载统计
    if (report.preloadRules && report.preloadRules.length > 0) {
      var exceedingCount = report.preloadRules.filter(function(r) { return r.exceedsQuota; }).length;
      lines.push('【预下载配置】');
      lines.push('  配置页面数: ' + report.preloadRules.length);
      if (exceedingCount > 0) {
        lines.push('  ⚠️ 超额页面: ' + exceedingCount + ' 个');
      }
      lines.push('');
    }

    // 问题统计
    lines.push('【问题统计】');
    lines.push('  总计: ' + report.totalIssues + ' 个问题');
    lines.push('  严重: ' + report.criticalIssues + ' 个');
    lines.push('  主要: ' + report.majorIssues + ' 个');
    lines.push('  次要: ' + report.minorIssues + ' 个');
    lines.push('');

    // 优化建议
    if (report.suggestions && report.suggestions.length > 0) {
      lines.push('【优化建议】');
      for (var i = 0; i < Math.min(5, report.suggestions.length); i++) {
        var suggestion = report.suggestions[i];
        lines.push('  ' + (i + 1) + '. [' + suggestion.priority.toUpperCase() + '] ' + suggestion.title);
        lines.push('     ' + suggestion.description);
      }
      if (report.suggestions.length > 5) {
        lines.push('  ... 还有 ' + (report.suggestions.length - 5) + ' 条建议');
      }
    }

    lines.push('');
    lines.push('=====================================');

    return lines.join('\n');
  },

  // ==================== 私有辅助方法 ====================

  /**
   * 获取app.json配置
   * @private
   * @returns {Object|null} app.json配置对象
   */
  _getAppJson: function() {
    // 在小程序环境中，无法直接读取app.json
    // 这个方法主要用于测试时注入配置
    // 实际使用时需要通过其他方式获取配置
    console.warn('⚠️ _getAppJson: 请通过options.appJson传入配置');
    return null;
  },

  /**
   * 获取分包体积数据
   * @private
   * @returns {Object} 分包体积映射
   */
  _getPackageSizes: function() {
    // 在小程序环境中，无法直接获取分包体积
    // 这个方法主要用于测试时注入数据
    // 实际使用时需要通过微信开发者工具或构建脚本获取
    console.warn('⚠️ _getPackageSizes: 请通过options.packageSizes传入体积数据');
    return {
      mainPackage: 0,
      subpackages: {}
    };
  },

  /**
   * 格式化体积大小
   * @private
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小字符串
   */
  _formatSize: function(bytes) {
    if (bytes === 0) return '0 B';

    var units = ['B', 'KB', 'MB', 'GB'];
    var unitIndex = 0;
    var size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return size.toFixed(2) + ' ' + units[unitIndex];
  },

  /**
   * 检查分包是否为音频分包
   * @param {string} packageRoot - 分包根目录
   * @returns {boolean} 是否为音频分包
   */
  isAudioPackage: function(packageRoot) {
    return AUDIO_PACKAGES.indexOf(packageRoot) !== -1;
  },

  /**
   * 检查分包是否为绕机检查图片分包
   * @param {string} packageRoot - 分包根目录
   * @returns {boolean} 是否为绕机检查图片分包
   */
  isWalkaroundImagePackage: function(packageRoot) {
    return WALKAROUND_IMAGE_PACKAGES.indexOf(packageRoot) !== -1;
  },

  /**
   * 获取分包类型
   * @param {string} packageRoot - 分包根目录
   * @returns {string} 分包类型
   */
  getPackageType: function(packageRoot) {
    if (this.isAudioPackage(packageRoot)) {
      return 'audio';
    }
    if (this.isWalkaroundImagePackage(packageRoot)) {
      return 'walkaround_image';
    }
    return 'functional';
  }
};

// 导出模块
module.exports = SubpackageAnalyzer;
