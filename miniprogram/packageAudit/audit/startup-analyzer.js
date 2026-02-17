'use strict';

/**
 * 🚀 启动性能分析器
 *
 * 分析主包体积、启动时序、首屏渲染时间
 * 识别可迁移到分包的模块，分析同步操作
 *
 * @module startup-analyzer
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 启动性能分析
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 主包建议控制在1.5MB以下（硬限制2MB）
 * - 使用lazyCodeLoading: "requiredComponents"按需注入
 * - 利用骨架屏提升用户心理预期
 * - 关注基础库3.x的Skia渲染引擎性能提升
 * - 代码注入耗时在低端机型上不应超过500ms
 *
 * @example
 * var StartupAnalyzer = require('./startup-analyzer.js');
 * var sizeAnalysis = StartupAnalyzer.analyzeMainPackageSize();
 * var movableModules = StartupAnalyzer.identifyMovableModules();
 * var syncOps = StartupAnalyzer.analyzeSyncOperations();
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 体积限制常量（基于官方规定）
 * @constant {Object}
 */
var LIMITS = {
  MAIN_PACKAGE_MAX: 2 * 1024 * 1024,           // 2MB硬限制
  MAIN_PACKAGE_RECOMMENDED: 1.5 * 1024 * 1024, // 1.5MB建议值
  SINGLE_PACKAGE_MAX: 2 * 1024 * 1024,         // 单包2MB限制
  TOTAL_SIZE_MAX: 30 * 1024 * 1024,            // 总包30MB限制
  PRELOAD_QUOTA: 2 * 1024 * 1024               // 预下载额度2MB
};

/**
 * 主包目录列表
 * 这些目录的内容会被计入主包体积
 * @constant {Array<string>}
 */
var MAIN_PACKAGE_DIRECTORIES = [
  'pages',       // 主包页面（20个页面）
  'utils',       // 共享工具（55+文件）
  'data',        // 共享数据文件
  'components',  // 共享组件
  'images',      // TabBar图标
  'audio',       // 共享音频文件
  'assets'       // 字体和静态资源
];

/**
 * 主包根文件列表
 * @constant {Array<string>}
 */
var MAIN_PACKAGE_ROOT_FILES = [
  'app.json',
  'app.ts',
  'app.js',
  'app.wxss',
  'project.config.json',
  'sitemap.json'
];

/**
 * 分包根目录前缀
 * @constant {string}
 */
var SUBPACKAGE_PREFIX = 'package';

/**
 * 文件类型权重（用于估算编译后体积）
 * @constant {Object}
 */
var FILE_TYPE_WEIGHTS = {
  '.js': 1.0,      // JavaScript文件
  '.ts': 0.9,      // TypeScript编译后通常略小
  '.json': 1.0,    // JSON配置文件
  '.wxml': 0.8,    // WXML模板（编译后压缩）
  '.wxss': 0.7,    // WXSS样式（编译后压缩）
  '.png': 1.0,     // PNG图片
  '.jpg': 1.0,     // JPG图片
  '.jpeg': 1.0,    // JPEG图片
  '.webp': 1.0,    // WebP图片
  '.gif': 1.0,     // GIF图片
  '.svg': 0.5,     // SVG（可压缩）
  '.mp3': 1.0,     // 音频文件
  '.ttf': 1.0,     // 字体文件
  '.woff': 1.0,    // Web字体
  '.woff2': 1.0    // Web字体2
};

/**
 * 可迁移模块类型
 * @constant {Object}
 */
var MOVABLE_MODULE_TYPES = {
  UTILITY: 'utility',           // 工具函数
  DATA: 'data',                 // 数据文件
  COMPONENT: 'component',       // 组件
  ASSET: 'asset',               // 静态资源
  PAGE: 'page'                  // 页面
};

/**
 * 同步操作类型
 * @constant {Object}
 */
var SYNC_OPERATION_TYPES = {
  STORAGE_SYNC: 'storage_sync',           // wx.getStorageSync/setStorageSync
  SYSTEM_INFO_SYNC: 'system_info_sync',   // wx.getSystemInfoSync
  FILE_SYNC: 'file_sync',                 // 文件系统同步操作
  REQUIRE_SYNC: 'require_sync',           // require同步加载
  BLOCKING_INIT: 'blocking_init'          // 阻塞式初始化
};


/**
 * 启动性能分析器
 * @namespace StartupAnalyzer
 */
var StartupAnalyzer = {
  /**
   * 体积限制常量（基于官方规定）
   */
  LIMITS: LIMITS,

  /**
   * 分析主包体积
   * 扫描主包目录，计算总体积，生成优化建议
   *
   * @param {Object} [options] - 分析选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Object} [options.appConfig] - app.json配置（用于测试注入）
   * @returns {Object} 包含体积分析结果和优化建议
   *
   * @example
   * var result = StartupAnalyzer.analyzeMainPackageSize();
   * console.log('主包总体积:', result.totalSize);
   * console.log('是否超限:', result.exceedsLimit);
   */
  analyzeMainPackageSize: function(options) {
    options = options || {};

    var result = {
      totalSize: 0,
      breakdown: {
        pages: { size: 0, files: [], percentage: 0 },
        utils: { size: 0, files: [], percentage: 0 },
        data: { size: 0, files: [], percentage: 0 },
        components: { size: 0, files: [], percentage: 0 },
        images: { size: 0, files: [], percentage: 0 },
        audio: { size: 0, files: [], percentage: 0 },
        assets: { size: 0, files: [], percentage: 0 },
        rootFiles: { size: 0, files: [], percentage: 0 },
        npm: { size: 0, files: [], percentage: 0 }
      },
      recommendations: [],
      exceedsLimit: false,
      exceedsRecommended: false,
      issues: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        limits: {
          max: LIMITS.MAIN_PACKAGE_MAX,
          recommended: LIMITS.MAIN_PACKAGE_RECOMMENDED
        }
      }
    };

    try {
      // 在小程序环境中，我们无法直接访问文件系统
      // 这里提供两种模式：
      // 1. 开发工具模式：通过注入的fileSystem接口分析
      // 2. 运行时模式：基于app.json配置进行估算

      if (options.fileSystem) {
        // 开发工具模式：实际扫描文件系统
        result = this._analyzeWithFileSystem(options.fileSystem, result);
      } else {
        // 运行时模式：基于配置估算
        result = this._analyzeFromConfig(options.appConfig, result);
      }

      // 计算百分比
      if (result.totalSize > 0) {
        var categories = Object.keys(result.breakdown);
        for (var i = 0; i < categories.length; i++) {
          var category = categories[i];
          result.breakdown[category].percentage = Math.round(
            (result.breakdown[category].size / result.totalSize) * 100
          );
        }
      }

      // 检查是否超限
      result.exceedsLimit = result.totalSize > LIMITS.MAIN_PACKAGE_MAX;
      result.exceedsRecommended = result.totalSize > LIMITS.MAIN_PACKAGE_RECOMMENDED;

      // 生成优化建议
      result.recommendations = this._generateSizeRecommendations(result);

      // 生成审计问题
      result.issues = this._generateSizeIssues(result);

    } catch (error) {
      console.error('❌ 主包体积分析失败:', error);
      result.error = error.message || '分析失败';
    }

    return result;
  },

  /**
   * 使用文件系统接口分析（开发工具模式）
   * @private
   */
  _analyzeWithFileSystem: function(fs, result) {
    var self = this;

    // 分析各目录
    for (var i = 0; i < MAIN_PACKAGE_DIRECTORIES.length; i++) {
      var dir = MAIN_PACKAGE_DIRECTORIES[i];
      var dirResult = this._scanDirectory(fs, dir);

      if (result.breakdown[dir]) {
        result.breakdown[dir].size = dirResult.size;
        result.breakdown[dir].files = dirResult.files;
      }

      result.totalSize += dirResult.size;
    }

    // 分析根文件
    for (var j = 0; j < MAIN_PACKAGE_ROOT_FILES.length; j++) {
      var file = MAIN_PACKAGE_ROOT_FILES[j];
      var fileSize = this._getFileSize(fs, file);

      if (fileSize > 0) {
        result.breakdown.rootFiles.size += fileSize;
        result.breakdown.rootFiles.files.push({
          path: file,
          size: fileSize
        });
        result.totalSize += fileSize;
      }
    }

    // 分析npm包（miniprogram_npm）
    var npmResult = this._scanDirectory(fs, 'miniprogram_npm');
    result.breakdown.npm.size = npmResult.size;
    result.breakdown.npm.files = npmResult.files;
    result.totalSize += npmResult.size;

    return result;
  },

  /**
   * 基于配置估算（运行时模式）
   * @private
   */
  _analyzeFromConfig: function(appConfig, result) {
    // 如果没有提供配置，尝试从全局获取
    if (!appConfig) {
      try {
        // 在小程序环境中尝试获取配置
        appConfig = this._getAppConfig();
      } catch (e) {
        // 使用默认估算值
        appConfig = null;
      }
    }

    if (appConfig) {
      // 基于页面数量估算
      var mainPages = appConfig.pages || [];
      var estimatedPageSize = mainPages.length * 15 * 1024; // 每页约15KB
      result.breakdown.pages.size = estimatedPageSize;
      result.breakdown.pages.files = mainPages.map(function(page) {
        return { path: page, size: 15 * 1024 };
      });

      // 估算utils目录（约55个文件）
      result.breakdown.utils.size = 55 * 8 * 1024; // 每文件约8KB

      // 估算其他目录
      result.breakdown.data.size = 100 * 1024;       // 约100KB
      result.breakdown.components.size = 50 * 1024;  // 约50KB
      result.breakdown.images.size = 100 * 1024;     // 约100KB（TabBar图标）
      result.breakdown.audio.size = 0;               // 主包音频应该很少
      result.breakdown.assets.size = 200 * 1024;     // 字体等约200KB
      result.breakdown.rootFiles.size = 20 * 1024;   // 根文件约20KB
      result.breakdown.npm.size = 300 * 1024;        // npm包约300KB

      // 计算总体积
      var categories = Object.keys(result.breakdown);
      for (var i = 0; i < categories.length; i++) {
        result.totalSize += result.breakdown[categories[i]].size;
      }
    } else {
      // 无法获取配置时的默认估算
      result.totalSize = 1.2 * 1024 * 1024; // 假设约1.2MB
      result.metadata.estimationMode = 'default';
    }

    result.metadata.estimationMode = result.metadata.estimationMode || 'config-based';
    return result;
  },

  /**
   * 扫描目录获取文件列表和大小
   * @private
   */
  _scanDirectory: function(fs, dirPath) {
    var result = {
      size: 0,
      files: []
    };

    try {
      if (!fs || typeof fs.readdirSync !== 'function') {
        return result;
      }

      var files = fs.readdirSync(dirPath);

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var filePath = dirPath + '/' + file;
        var stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // 递归扫描子目录
          var subResult = this._scanDirectory(fs, filePath);
          result.size += subResult.size;
          result.files = result.files.concat(subResult.files);
        } else {
          var fileSize = stat.size || 0;
          var ext = this._getFileExtension(file);
          var weight = FILE_TYPE_WEIGHTS[ext] || 1.0;

          result.size += Math.round(fileSize * weight);
          result.files.push({
            path: filePath,
            size: fileSize,
            extension: ext
          });
        }
      }
    } catch (error) {
      // 目录不存在或无法访问
      console.warn('⚠️ 无法扫描目录:', dirPath, error.message);
    }

    return result;
  },

  /**
   * 获取文件大小
   * @private
   */
  _getFileSize: function(fs, filePath) {
    try {
      if (!fs || typeof fs.statSync !== 'function') {
        return 0;
      }
      var stat = fs.statSync(filePath);
      return stat.size || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * 获取文件扩展名
   * @private
   */
  _getFileExtension: function(filename) {
    var lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) {
      return '';
    }
    return filename.substring(lastDot).toLowerCase();
  },

  /**
   * 尝试获取app.json配置
   * @private
   */
  _getAppConfig: function() {
    try {
      // 在小程序环境中，可以通过__wxConfig获取
      if (typeof __wxConfig !== 'undefined') {
        return __wxConfig;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  /**
   * 生成体积优化建议
   * @private
   */
  _generateSizeRecommendations: function(result) {
    var recommendations = [];

    // 检查是否超过建议值
    if (result.exceedsRecommended) {
      recommendations.push({
        priority: 'high',
        title: '主包体积超过建议值',
        description: '当前主包体积 ' + this._formatSize(result.totalSize) +
          '，超过建议值 ' + this._formatSize(LIMITS.MAIN_PACKAGE_RECOMMENDED) +
          '。建议将非首屏必需的功能迁移到分包。',
        estimatedImpact: 30
      });
    }

    // 检查是否超过硬限制
    if (result.exceedsLimit) {
      recommendations.push({
        priority: 'critical',
        title: '主包体积超过硬限制',
        description: '当前主包体积 ' + this._formatSize(result.totalSize) +
          '，超过硬限制 ' + this._formatSize(LIMITS.MAIN_PACKAGE_MAX) +
          '。必须立即优化，否则无法上传。',
        estimatedImpact: 100
      });
    }

    // 检查各目录占比
    var breakdown = result.breakdown;

    // utils目录过大
    if (breakdown.utils && breakdown.utils.percentage > 30) {
      recommendations.push({
        priority: 'medium',
        title: 'utils目录占比过高',
        description: 'utils目录占主包 ' + breakdown.utils.percentage +
          '%，建议将仅特定分包使用的工具函数迁移到对应分包。',
        estimatedImpact: 15
      });
    }

    // data目录过大
    if (breakdown.data && breakdown.data.size > 200 * 1024) {
      recommendations.push({
        priority: 'medium',
        title: 'data目录体积较大',
        description: 'data目录体积 ' + this._formatSize(breakdown.data.size) +
          '，建议将大型数据文件迁移到分包或使用云端存储。',
        estimatedImpact: 10
      });
    }

    // assets目录过大（字体等）
    if (breakdown.assets && breakdown.assets.size > 300 * 1024) {
      recommendations.push({
        priority: 'medium',
        title: 'assets目录体积较大',
        description: 'assets目录体积 ' + this._formatSize(breakdown.assets.size) +
          '，建议优化字体文件（使用字体子集化）或使用CDN加载。',
        estimatedImpact: 10
      });
    }

    // npm包过大
    if (breakdown.npm && breakdown.npm.size > 500 * 1024) {
      recommendations.push({
        priority: 'medium',
        title: 'npm包体积较大',
        description: 'npm包体积 ' + this._formatSize(breakdown.npm.size) +
          '，建议检查是否有未使用的依赖，或使用按需引入。',
        estimatedImpact: 15
      });
    }

    // 图片资源
    if (breakdown.images && breakdown.images.size > 150 * 1024) {
      recommendations.push({
        priority: 'low',
        title: '图片资源可优化',
        description: '主包图片体积 ' + this._formatSize(breakdown.images.size) +
          '，建议使用WebP格式并压缩图片。',
        estimatedImpact: 5
      });
    }

    return recommendations;
  },

  /**
   * 生成审计问题
   * @private
   */
  _generateSizeIssues: function(result) {
    var issues = [];

    if (result.exceedsLimit) {
      issues.push(AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.CRITICAL,
        type: AuditConfig.AuditIssueType.MAIN_PACKAGE_SIZE,
        file: 'miniprogram/',
        description: '主包体积 ' + this._formatSize(result.totalSize) +
          ' 超过2MB硬限制，无法上传发布',
        suggestion: '立即将非首屏必需的页面和资源迁移到分包',
        metadata: {
          currentSize: result.totalSize,
          limit: LIMITS.MAIN_PACKAGE_MAX,
          exceedBy: result.totalSize - LIMITS.MAIN_PACKAGE_MAX
        }
      }));
    } else if (result.exceedsRecommended) {
      issues.push(AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.MAIN_PACKAGE_SIZE,
        file: 'miniprogram/',
        description: '主包体积 ' + this._formatSize(result.totalSize) +
          ' 超过1.5MB建议值，可能影响启动性能',
        suggestion: '建议将低频功能迁移到分包，保持主包精简',
        metadata: {
          currentSize: result.totalSize,
          recommended: LIMITS.MAIN_PACKAGE_RECOMMENDED,
          exceedBy: result.totalSize - LIMITS.MAIN_PACKAGE_RECOMMENDED
        }
      }));
    }

    return issues;
  },

  /**
   * 格式化文件大小
   * @private
   */
  _formatSize: function(bytes) {
    if (bytes < 1024) {
      return bytes + 'B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + 'KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
    }
  },


  /**
   * 识别可移至分包的模块
   * 分析主包中的文件，识别可以安全迁移到分包的模块
   *
   * ⚠️ 注意：移动前需验证目标分包不会超过2MB
   *
   * @param {Object} [options] - 分析选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Object} [options.appConfig] - app.json配置（用于测试注入）
   * @param {Array} [options.subpackageSizes] - 各分包当前大小
   * @returns {Array} 可迁移模块列表
   *
   * @example
   * var modules = StartupAnalyzer.identifyMovableModules();
   * modules.forEach(function(m) {
   *   console.log(m.module, '->', m.targetPackage, '安全:', m.safeToMove);
   * });
   */
  identifyMovableModules: function(options) {
    options = options || {};

    var movableModules = [];

    try {
      // 分析utils目录中的可迁移模块
      var utilsModules = this._analyzeUtilsModules(options);
      movableModules = movableModules.concat(utilsModules);

      // 分析data目录中的可迁移数据
      var dataModules = this._analyzeDataModules(options);
      movableModules = movableModules.concat(dataModules);

      // 分析components目录中的可迁移组件
      var componentModules = this._analyzeComponentModules(options);
      movableModules = movableModules.concat(componentModules);

      // 分析assets目录中的可迁移资源
      var assetModules = this._analyzeAssetModules(options);
      movableModules = movableModules.concat(assetModules);

      // 验证迁移安全性
      movableModules = this._validateMoveSafety(movableModules, options);

    } catch (error) {
      console.error('❌ 可迁移模块识别失败:', error);
    }

    return movableModules;
  },

  /**
   * 分析utils目录中的可迁移模块
   * @private
   */
  _analyzeUtilsModules: function(options) {
    var modules = [];

    // 已知的分包专用工具（基于项目结构分析）
    var packageSpecificUtils = [
      // 音频相关工具 - 可迁移到音频分包
      {
        pattern: /audio-.*\.js$/,
        targetPackage: 'packageO',
        reason: '音频工具仅在音频播放页面使用',
        estimatedSize: 30 * 1024
      },
      // 绕机检查相关
      {
        pattern: /walkaround-.*\.js$/,
        targetPackage: 'packageWalkaround',
        reason: '绕机检查工具仅在绕机检查分包使用',
        estimatedSize: 20 * 1024
      },
      // QAR相关
      {
        pattern: /qar-.*\.js$/,
        targetPackage: 'packageQAR',
        reason: 'QAR分析工具仅在QAR分包使用',
        estimatedSize: 15 * 1024
      },
      // 辐射计算相关
      {
        pattern: /radiation-.*\.js$/,
        targetPackage: 'packageRadiation',
        reason: '辐射计算工具仅在辐射分包使用',
        estimatedSize: 10 * 1024
      }
    ];

    // 检查每个模式
    for (var i = 0; i < packageSpecificUtils.length; i++) {
      var util = packageSpecificUtils[i];
      modules.push({
        module: util.pattern.toString(),
        moduleType: MOVABLE_MODULE_TYPES.UTILITY,
        currentLocation: 'utils/',
        currentSize: util.estimatedSize,
        targetPackage: util.targetPackage,
        targetPackageCurrentSize: 0, // 需要实际计算
        reason: util.reason,
        safeToMove: true, // 初始假设安全，后续验证
        priority: 'medium',
        dependencies: [],
        dependents: []
      });
    }

    // 分析审计工具 - 这些是开发时工具，可以考虑条件加载
    modules.push({
      module: 'utils/audit/',
      moduleType: MOVABLE_MODULE_TYPES.UTILITY,
      currentLocation: 'utils/audit/',
      currentSize: 50 * 1024, // 估算
      targetPackage: 'packageO', // 或创建专门的开发工具分包
      targetPackageCurrentSize: 0,
      reason: '审计工具仅在开发调试时使用，生产环境可不加载',
      safeToMove: true,
      priority: 'low',
      dependencies: [],
      dependents: [],
      note: '建议使用条件编译或环境变量控制加载'
    });

    return modules;
  },

  /**
   * 分析data目录中的可迁移数据
   * @private
   */
  _analyzeDataModules: function(options) {
    var modules = [];

    // 已知的分包专用数据
    var packageSpecificData = [
      // 地区相关数据
      {
        pattern: 'data/regions/',
        targetPackage: 'packageCommFailure',
        reason: '地区数据主要在通信失效分包使用',
        estimatedSize: 50 * 1024
      },
      // 事故调查数据
      {
        pattern: 'data/incident-investigation/',
        targetPackage: 'packageO',
        reason: '事故调查数据仅在事故调查页面使用',
        estimatedSize: 30 * 1024
      }
    ];

    for (var i = 0; i < packageSpecificData.length; i++) {
      var data = packageSpecificData[i];
      modules.push({
        module: data.pattern,
        moduleType: MOVABLE_MODULE_TYPES.DATA,
        currentLocation: data.pattern,
        currentSize: data.estimatedSize,
        targetPackage: data.targetPackage,
        targetPackageCurrentSize: 0,
        reason: data.reason,
        safeToMove: true,
        priority: 'medium',
        dependencies: [],
        dependents: []
      });
    }

    return modules;
  },

  /**
   * 分析components目录中的可迁移组件
   * @private
   */
  _analyzeComponentModules: function(options) {
    var modules = [];

    // 分析组件使用情况
    // 如果某个组件仅在特定分包的页面中使用，可以迁移

    // 这里提供一个分析框架，实际实现需要扫描WXML文件
    var potentialComponents = [
      {
        component: 'components/audio-player/',
        usedInPackages: ['packageJapan', 'packageSingapore', '...'], // 音频分包
        targetPackage: 'packageO', // 或创建共享音频组件分包
        estimatedSize: 20 * 1024
      }
    ];

    for (var i = 0; i < potentialComponents.length; i++) {
      var comp = potentialComponents[i];
      // 如果组件仅在分包中使用，可以迁移
      if (comp.usedInPackages && comp.usedInPackages.length > 0) {
        var allInSubpackages = true;
        for (var j = 0; j < comp.usedInPackages.length; j++) {
          if (comp.usedInPackages[j].indexOf('package') !== 0) {
            allInSubpackages = false;
            break;
          }
        }

        if (allInSubpackages) {
          modules.push({
            module: comp.component,
            moduleType: MOVABLE_MODULE_TYPES.COMPONENT,
            currentLocation: comp.component,
            currentSize: comp.estimatedSize,
            targetPackage: comp.targetPackage,
            targetPackageCurrentSize: 0,
            reason: '组件仅在分包页面中使用',
            safeToMove: true,
            priority: 'medium',
            dependencies: [],
            dependents: comp.usedInPackages
          });
        }
      }
    }

    return modules;
  },

  /**
   * 分析assets目录中的可迁移资源
   * @private
   */
  _analyzeAssetModules: function(options) {
    var modules = [];

    // 字体文件分析
    modules.push({
      module: 'assets/fonts/',
      moduleType: MOVABLE_MODULE_TYPES.ASSET,
      currentLocation: 'assets/fonts/',
      currentSize: 200 * 1024, // 估算
      targetPackage: 'CDN', // 建议使用CDN而非分包
      targetPackageCurrentSize: 0,
      reason: '字体文件体积较大，建议使用CDN加载或字体子集化',
      safeToMove: true,
      priority: 'high',
      dependencies: [],
      dependents: [],
      note: '可使用fontmin工具进行字体子集化，仅保留使用的字符'
    });

    return modules;
  },

  /**
   * 验证迁移安全性
   * @private
   */
  _validateMoveSafety: function(modules, options) {
    var subpackageSizes = options.subpackageSizes || {};

    for (var i = 0; i < modules.length; i++) {
      var module = modules[i];

      // 检查目标分包是否会超限
      var targetCurrentSize = subpackageSizes[module.targetPackage] || 0;
      var afterMoveSize = targetCurrentSize + module.currentSize;

      if (afterMoveSize > LIMITS.SINGLE_PACKAGE_MAX) {
        module.safeToMove = false;
        module.unsafeReason = '迁移后目标分包将超过2MB限制（预计' +
          this._formatSize(afterMoveSize) + '）';
      } else if (afterMoveSize > LIMITS.MAIN_PACKAGE_RECOMMENDED) {
        module.safeToMove = true;
        module.warning = '迁移后目标分包将接近限制（预计' +
          this._formatSize(afterMoveSize) + '）';
      }

      // 更新目标分包当前大小
      module.targetPackageCurrentSize = targetCurrentSize;
    }

    return modules;
  },


  /**
   * 分析同步操作
   * 扫描app.ts/app.js中的onLaunch逻辑，识别可延迟执行的同步操作
   *
   * @param {Object} [options] - 分析选项
   * @param {string} [options.appCode] - app.ts/app.js源代码（用于测试注入）
   * @param {Object} [options.fileSystem] - 文件系统接口
   * @returns {Array} 可延迟执行的操作列表
   *
   * @example
   * var syncOps = StartupAnalyzer.analyzeSyncOperations();
   * syncOps.forEach(function(op) {
   *   if (op.deferrable) {
   *     console.log('可延迟:', op.operation, '位置:', op.location);
   *   }
   * });
   */
  analyzeSyncOperations: function(options) {
    options = options || {};

    var operations = [];

    try {
      var appCode = options.appCode;

      // 如果没有提供代码，尝试读取
      if (!appCode && options.fileSystem) {
        try {
          appCode = options.fileSystem.readFileSync('app.ts', 'utf8');
        } catch (e) {
          try {
            appCode = options.fileSystem.readFileSync('app.js', 'utf8');
          } catch (e2) {
            appCode = '';
          }
        }
      }

      // 如果仍然没有代码，使用预定义的分析结果
      if (!appCode) {
        operations = this._getDefaultSyncOperationsAnalysis();
      } else {
        operations = this._analyzeCodeForSyncOperations(appCode);
      }

      // 为每个操作添加优化建议
      operations = this._addDeferralSuggestions(operations);

    } catch (error) {
      console.error('❌ 同步操作分析失败:', error);
    }

    return operations;
  },

  /**
   * 分析代码中的同步操作
   * @private
   */
  _analyzeCodeForSyncOperations: function(code) {
    var operations = [];

    // 同步存储操作模式
    var syncStoragePatterns = [
      {
        pattern: /wx\.getStorageSync\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        type: SYNC_OPERATION_TYPES.STORAGE_SYNC,
        operation: 'wx.getStorageSync'
      },
      {
        pattern: /wx\.setStorageSync\s*\(\s*['"]([^'"]+)['"]/g,
        type: SYNC_OPERATION_TYPES.STORAGE_SYNC,
        operation: 'wx.setStorageSync'
      },
      {
        pattern: /wx\.removeStorageSync\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        type: SYNC_OPERATION_TYPES.STORAGE_SYNC,
        operation: 'wx.removeStorageSync'
      }
    ];

    // 同步系统信息操作
    var syncSystemPatterns = [
      {
        pattern: /wx\.getSystemInfoSync\s*\(\s*\)/g,
        type: SYNC_OPERATION_TYPES.SYSTEM_INFO_SYNC,
        operation: 'wx.getSystemInfoSync'
      },
      {
        pattern: /wx\.getDeviceInfo\s*\(\s*\)/g,
        type: SYNC_OPERATION_TYPES.SYSTEM_INFO_SYNC,
        operation: 'wx.getDeviceInfo'
      }
    ];

    // 同步文件操作
    var syncFilePatterns = [
      {
        pattern: /\.readFileSync\s*\(/g,
        type: SYNC_OPERATION_TYPES.FILE_SYNC,
        operation: 'readFileSync'
      },
      {
        pattern: /\.accessSync\s*\(/g,
        type: SYNC_OPERATION_TYPES.FILE_SYNC,
        operation: 'accessSync'
      },
      {
        pattern: /\.mkdirSync\s*\(/g,
        type: SYNC_OPERATION_TYPES.FILE_SYNC,
        operation: 'mkdirSync'
      }
    ];

    // require同步加载
    var requirePatterns = [
      {
        pattern: /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        type: SYNC_OPERATION_TYPES.REQUIRE_SYNC,
        operation: 'require'
      }
    ];

    // 合并所有模式
    var allPatterns = syncStoragePatterns
      .concat(syncSystemPatterns)
      .concat(syncFilePatterns)
      .concat(requirePatterns);

    // 分析代码
    var lines = code.split('\n');
    var inOnLaunch = false;
    var braceCount = 0;
    var onLaunchStartLine = -1;

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      // 检测onLaunch函数开始
      if (line.indexOf('onLaunch') !== -1 && line.indexOf('function') !== -1 ||
          line.indexOf('onLaunch()') !== -1 ||
          line.indexOf('onLaunch:') !== -1) {
        inOnLaunch = true;
        onLaunchStartLine = lineNum;
        braceCount = 0;
      }

      // 在onLaunch内部计数大括号
      if (inOnLaunch) {
        for (var c = 0; c < line.length; c++) {
          if (line[c] === '{') braceCount++;
          if (line[c] === '}') braceCount--;
        }

        // 检测onLaunch结束
        if (braceCount <= 0 && lineNum > onLaunchStartLine) {
          inOnLaunch = false;
        }

        // 在onLaunch内检测同步操作
        for (var p = 0; p < allPatterns.length; p++) {
          var patternInfo = allPatterns[p];
          var regex = new RegExp(patternInfo.pattern.source, 'g');
          var match;

          while ((match = regex.exec(line)) !== null) {
            operations.push({
              operation: patternInfo.operation,
              type: patternInfo.type,
              location: 'app.ts:' + (lineNum + 1),
              line: lineNum + 1,
              code: line.trim(),
              inOnLaunch: true,
              deferrable: this._isDeferrable(patternInfo.type, match[1] || ''),
              context: match[1] || null
            });
          }
        }
      }
    }

    return operations;
  },

  /**
   * 判断操作是否可延迟
   * @private
   */
  _isDeferrable: function(type, context) {
    // 某些操作必须在启动时执行
    var nonDeferrableContexts = [
      'hasShownDisclaimer',  // 免责声明检查
      'theme',               // 主题设置
      'userInfo'             // 用户信息
    ];

    // 检查上下文是否在非可延迟列表中
    if (context && nonDeferrableContexts.indexOf(context) !== -1) {
      return false;
    }

    // 根据类型判断
    switch (type) {
      case SYNC_OPERATION_TYPES.STORAGE_SYNC:
        // 大多数存储操作可以延迟或改为异步
        return true;

      case SYNC_OPERATION_TYPES.SYSTEM_INFO_SYNC:
        // 系统信息通常需要立即获取，但可以缓存
        return false;

      case SYNC_OPERATION_TYPES.FILE_SYNC:
        // 文件同步操作应该改为异步
        return true;

      case SYNC_OPERATION_TYPES.REQUIRE_SYNC:
        // require是必需的，但可以考虑懒加载
        return false;

      case SYNC_OPERATION_TYPES.BLOCKING_INIT:
        // 阻塞式初始化应该延迟
        return true;

      default:
        return true;
    }
  },

  /**
   * 获取默认的同步操作分析结果
   * 基于对app.ts的静态分析
   * @private
   */
  _getDefaultSyncOperationsAnalysis: function() {
    // 基于对当前app.ts的分析
    return [
      {
        operation: 'wx.getStorageSync',
        type: SYNC_OPERATION_TYPES.STORAGE_SYNC,
        location: 'app.ts:onLaunch',
        code: "wx.getStorageSync('hasShownDisclaimer')",
        inOnLaunch: true,
        deferrable: false,
        context: 'hasShownDisclaimer',
        reason: '免责声明检查必须在启动时执行'
      },
      {
        operation: 'wx.setStorageSync',
        type: SYNC_OPERATION_TYPES.STORAGE_SYNC,
        location: 'app.ts:initNetworkMonitoring',
        code: "wx.setStorageSync('lastNetworkType', res.networkType)",
        inOnLaunch: true,
        deferrable: true,
        context: 'lastNetworkType',
        reason: '网络状态可以异步存储'
      },
      {
        operation: 'wx.setStorageSync',
        type: SYNC_OPERATION_TYPES.STORAGE_SYNC,
        location: 'app.ts:preloadQueryData',
        code: "wx.setStorageSync('queryDataPreloaded', true)",
        inOnLaunch: false, // 在setTimeout中
        deferrable: true,
        context: 'queryDataPreloaded',
        reason: '预加载状态可以异步存储'
      },
      {
        operation: 'require',
        type: SYNC_OPERATION_TYPES.REQUIRE_SYNC,
        location: 'app.ts:顶部',
        code: "require('./utils/subpackage-loader.js')",
        inOnLaunch: false,
        deferrable: false,
        context: 'subpackage-loader',
        reason: '核心模块必须同步加载'
      },
      {
        operation: 'require',
        type: SYNC_OPERATION_TYPES.REQUIRE_SYNC,
        location: 'app.ts:顶部',
        code: "require('./utils/error-handler.js')",
        inOnLaunch: false,
        deferrable: false,
        context: 'error-handler',
        reason: '错误处理必须在启动时可用'
      },
      {
        operation: 'require',
        type: SYNC_OPERATION_TYPES.REQUIRE_SYNC,
        location: 'app.ts:顶部',
        code: "require('./utils/ad-manager.js')",
        inOnLaunch: false,
        deferrable: true,
        context: 'ad-manager',
        reason: '广告管理器可以延迟加载'
      },
      {
        operation: 'WarningHandler.init()',
        type: SYNC_OPERATION_TYPES.BLOCKING_INIT,
        location: 'app.ts:onLaunch',
        code: 'WarningHandler.init()',
        inOnLaunch: true,
        deferrable: false,
        context: 'warning-handler',
        reason: '警告处理器需要尽早初始化以过滤第三方库告警'
      },
      {
        operation: 'initGlobalAudioConfig()',
        type: SYNC_OPERATION_TYPES.BLOCKING_INIT,
        location: 'app.ts:onLaunch',
        code: 'this.initGlobalAudioConfig()',
        inOnLaunch: true,
        deferrable: false,
        context: 'audio-config',
        reason: 'iOS音频配置必须在应用启动时设置'
      },
      {
        operation: 'AdManager.init()',
        type: SYNC_OPERATION_TYPES.BLOCKING_INIT,
        location: 'app.ts:onLaunch',
        code: 'AdManager.init({ debug: false })',
        inOnLaunch: true,
        deferrable: true,
        context: 'ad-manager',
        reason: '广告初始化可以延迟到首屏渲染后'
      },
      {
        operation: 'initThemeManager()',
        type: SYNC_OPERATION_TYPES.BLOCKING_INIT,
        location: 'app.ts:onLaunch',
        code: 'this.initThemeManager()',
        inOnLaunch: true,
        deferrable: false,
        context: 'theme-manager',
        reason: '主题设置影响UI渲染，需要尽早执行'
      },
      {
        operation: 'initNetworkMonitoring()',
        type: SYNC_OPERATION_TYPES.BLOCKING_INIT,
        location: 'app.ts:onLaunch',
        code: 'this.initNetworkMonitoring()',
        inOnLaunch: true,
        deferrable: true,
        context: 'network-monitoring',
        reason: '网络监听可以延迟初始化'
      }
    ];
  },

  /**
   * 添加延迟执行建议
   * @private
   */
  _addDeferralSuggestions: function(operations) {
    for (var i = 0; i < operations.length; i++) {
      var op = operations[i];

      if (op.deferrable) {
        switch (op.type) {
          case SYNC_OPERATION_TYPES.STORAGE_SYNC:
            op.suggestion = '建议使用异步API（wx.getStorage/wx.setStorage）替代同步操作';
            op.asyncAlternative = op.operation.replace('Sync', '');
            break;

          case SYNC_OPERATION_TYPES.FILE_SYNC:
            op.suggestion = '建议使用异步文件API，避免阻塞主线程';
            op.asyncAlternative = op.operation.replace('Sync', '');
            break;

          case SYNC_OPERATION_TYPES.BLOCKING_INIT:
            op.suggestion = '建议使用setTimeout延迟到首屏渲染后执行，或使用wx.nextTick';
            op.deferralCode = 'setTimeout(function() { ' + op.code + ' }, 100);';
            break;

          case SYNC_OPERATION_TYPES.REQUIRE_SYNC:
            op.suggestion = '考虑使用动态import或条件加载，仅在需要时加载模块';
            break;

          default:
            op.suggestion = '建议延迟执行或改为异步操作';
        }

        // 估算优化影响
        op.estimatedImpact = this._estimateDeferralImpact(op);
      }
    }

    return operations;
  },

  /**
   * 估算延迟执行的影响
   * @private
   */
  _estimateDeferralImpact: function(op) {
    // 基于操作类型估算对启动时间的影响（毫秒）
    switch (op.type) {
      case SYNC_OPERATION_TYPES.STORAGE_SYNC:
        return 5; // 存储操作约5ms

      case SYNC_OPERATION_TYPES.SYSTEM_INFO_SYNC:
        return 10; // 系统信息约10ms

      case SYNC_OPERATION_TYPES.FILE_SYNC:
        return 20; // 文件操作约20ms

      case SYNC_OPERATION_TYPES.REQUIRE_SYNC:
        return 15; // require约15ms

      case SYNC_OPERATION_TYPES.BLOCKING_INIT:
        return 30; // 初始化操作约30ms

      default:
        return 10;
    }
  },


  /**
   * 生成骨架屏配置
   * 为指定页面生成骨架屏WXML和WXSS
   *
   * @param {string} pagePath - 页面路径
   * @param {Object} [options] - 配置选项
   * @param {string} [options.type] - 骨架屏类型（list/card/form/custom）
   * @returns {Object} 骨架屏WXML和WXSS
   *
   * @example
   * var skeleton = StartupAnalyzer.generateSkeletonConfig('pages/search/index');
   * console.log(skeleton.wxml);
   * console.log(skeleton.wxss);
   */
  generateSkeletonConfig: function(pagePath, options) {
    options = options || {};

    var type = options.type || this._detectPageType(pagePath);

    var result = {
      pagePath: pagePath,
      type: type,
      wxml: '',
      wxss: '',
      usage: ''
    };

    switch (type) {
      case 'list':
        result = this._generateListSkeleton(pagePath, result);
        break;

      case 'card':
        result = this._generateCardSkeleton(pagePath, result);
        break;

      case 'form':
        result = this._generateFormSkeleton(pagePath, result);
        break;

      case 'dashboard':
        result = this._generateDashboardSkeleton(pagePath, result);
        break;

      default:
        result = this._generateDefaultSkeleton(pagePath, result);
    }

    // 添加使用说明
    result.usage = this._generateSkeletonUsage(pagePath);

    return result;
  },

  /**
   * 检测页面类型
   * @private
   */
  _detectPageType: function(pagePath) {
    // 基于页面路径推断类型
    if (pagePath.indexOf('search') !== -1 ||
        pagePath.indexOf('list') !== -1 ||
        pagePath.indexOf('recording') !== -1) {
      return 'list';
    }

    if (pagePath.indexOf('detail') !== -1 ||
        pagePath.indexOf('player') !== -1) {
      return 'card';
    }

    if (pagePath.indexOf('calculator') !== -1 ||
        pagePath.indexOf('calc') !== -1) {
      return 'form';
    }

    if (pagePath.indexOf('home') !== -1 ||
        pagePath.indexOf('cockpit') !== -1) {
      return 'dashboard';
    }

    return 'default';
  },

  /**
   * 生成列表类型骨架屏
   * @private
   */
  _generateListSkeleton: function(pagePath, result) {
    result.wxml = [
      '<!-- 骨架屏组件 - ' + pagePath + ' -->',
      '<view class="skeleton-container" wx:if="{{loading}}">',
      '  <!-- 搜索框骨架 -->',
      '  <view class="skeleton-search">',
      '    <view class="skeleton-search-input skeleton-animate"></view>',
      '  </view>',
      '  ',
      '  <!-- 列表项骨架 -->',
      '  <view class="skeleton-list">',
      '    <view class="skeleton-item" wx:for="{{[1,2,3,4,5,6]}}" wx:key="index">',
      '      <view class="skeleton-avatar skeleton-animate"></view>',
      '      <view class="skeleton-content">',
      '        <view class="skeleton-title skeleton-animate"></view>',
      '        <view class="skeleton-desc skeleton-animate"></view>',
      '      </view>',
      '    </view>',
      '  </view>',
      '</view>'
    ].join('\n');

    result.wxss = [
      '/* 骨架屏样式 - ' + pagePath + ' */',
      '.skeleton-container {',
      '  padding: 24rpx;',
      '  background: #f7f8fa;',
      '  min-height: 100vh;',
      '}',
      '',
      '.skeleton-animate {',
      '  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);',
      '  background-size: 200% 100%;',
      '  animation: skeleton-loading 1.5s infinite;',
      '}',
      '',
      '@keyframes skeleton-loading {',
      '  0% { background-position: 200% 0; }',
      '  100% { background-position: -200% 0; }',
      '}',
      '',
      '.skeleton-search {',
      '  margin-bottom: 24rpx;',
      '}',
      '',
      '.skeleton-search-input {',
      '  height: 72rpx;',
      '  border-radius: 36rpx;',
      '}',
      '',
      '.skeleton-list {',
      '  background: #fff;',
      '  border-radius: 12rpx;',
      '}',
      '',
      '.skeleton-item {',
      '  display: flex;',
      '  padding: 24rpx;',
      '  border-bottom: 1rpx solid #ebedf0;',
      '}',
      '',
      '.skeleton-item:last-child {',
      '  border-bottom: none;',
      '}',
      '',
      '.skeleton-avatar {',
      '  width: 80rpx;',
      '  height: 80rpx;',
      '  border-radius: 8rpx;',
      '  flex-shrink: 0;',
      '}',
      '',
      '.skeleton-content {',
      '  flex: 1;',
      '  margin-left: 24rpx;',
      '}',
      '',
      '.skeleton-title {',
      '  height: 32rpx;',
      '  width: 60%;',
      '  border-radius: 4rpx;',
      '  margin-bottom: 16rpx;',
      '}',
      '',
      '.skeleton-desc {',
      '  height: 24rpx;',
      '  width: 80%;',
      '  border-radius: 4rpx;',
      '}'
    ].join('\n');

    return result;
  },

  /**
   * 生成卡片类型骨架屏
   * @private
   */
  _generateCardSkeleton: function(pagePath, result) {
    result.wxml = [
      '<!-- 骨架屏组件 - ' + pagePath + ' -->',
      '<view class="skeleton-container" wx:if="{{loading}}">',
      '  <!-- 头部骨架 -->',
      '  <view class="skeleton-header">',
      '    <view class="skeleton-header-title skeleton-animate"></view>',
      '    <view class="skeleton-header-subtitle skeleton-animate"></view>',
      '  </view>',
      '  ',
      '  <!-- 内容卡片骨架 -->',
      '  <view class="skeleton-card">',
      '    <view class="skeleton-card-image skeleton-animate"></view>',
      '    <view class="skeleton-card-body">',
      '      <view class="skeleton-line skeleton-animate" style="width: 80%;"></view>',
      '      <view class="skeleton-line skeleton-animate" style="width: 60%;"></view>',
      '      <view class="skeleton-line skeleton-animate" style="width: 70%;"></view>',
      '    </view>',
      '  </view>',
      '</view>'
    ].join('\n');

    result.wxss = [
      '/* 骨架屏样式 - ' + pagePath + ' */',
      '.skeleton-container {',
      '  padding: 24rpx;',
      '  background: #f7f8fa;',
      '  min-height: 100vh;',
      '}',
      '',
      '.skeleton-animate {',
      '  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);',
      '  background-size: 200% 100%;',
      '  animation: skeleton-loading 1.5s infinite;',
      '}',
      '',
      '@keyframes skeleton-loading {',
      '  0% { background-position: 200% 0; }',
      '  100% { background-position: -200% 0; }',
      '}',
      '',
      '.skeleton-header {',
      '  margin-bottom: 32rpx;',
      '}',
      '',
      '.skeleton-header-title {',
      '  height: 48rpx;',
      '  width: 50%;',
      '  border-radius: 8rpx;',
      '  margin-bottom: 16rpx;',
      '}',
      '',
      '.skeleton-header-subtitle {',
      '  height: 28rpx;',
      '  width: 30%;',
      '  border-radius: 4rpx;',
      '}',
      '',
      '.skeleton-card {',
      '  background: #fff;',
      '  border-radius: 12rpx;',
      '  overflow: hidden;',
      '}',
      '',
      '.skeleton-card-image {',
      '  width: 100%;',
      '  height: 300rpx;',
      '}',
      '',
      '.skeleton-card-body {',
      '  padding: 24rpx;',
      '}',
      '',
      '.skeleton-line {',
      '  height: 28rpx;',
      '  border-radius: 4rpx;',
      '  margin-bottom: 16rpx;',
      '}',
      '',
      '.skeleton-line:last-child {',
      '  margin-bottom: 0;',
      '}'
    ].join('\n');

    return result;
  },

  /**
   * 生成表单类型骨架屏
   * @private
   */
  _generateFormSkeleton: function(pagePath, result) {
    result.wxml = [
      '<!-- 骨架屏组件 - ' + pagePath + ' -->',
      '<view class="skeleton-container" wx:if="{{loading}}">',
      '  <!-- 表单项骨架 -->',
      '  <view class="skeleton-form">',
      '    <view class="skeleton-form-item" wx:for="{{[1,2,3,4]}}" wx:key="index">',
      '      <view class="skeleton-label skeleton-animate"></view>',
      '      <view class="skeleton-input skeleton-animate"></view>',
      '    </view>',
      '  </view>',
      '  ',
      '  <!-- 按钮骨架 -->',
      '  <view class="skeleton-button skeleton-animate"></view>',
      '</view>'
    ].join('\n');

    result.wxss = [
      '/* 骨架屏样式 - ' + pagePath + ' */',
      '.skeleton-container {',
      '  padding: 24rpx;',
      '  background: #f7f8fa;',
      '  min-height: 100vh;',
      '}',
      '',
      '.skeleton-animate {',
      '  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);',
      '  background-size: 200% 100%;',
      '  animation: skeleton-loading 1.5s infinite;',
      '}',
      '',
      '@keyframes skeleton-loading {',
      '  0% { background-position: 200% 0; }',
      '  100% { background-position: -200% 0; }',
      '}',
      '',
      '.skeleton-form {',
      '  background: #fff;',
      '  border-radius: 12rpx;',
      '  padding: 24rpx;',
      '  margin-bottom: 32rpx;',
      '}',
      '',
      '.skeleton-form-item {',
      '  margin-bottom: 32rpx;',
      '}',
      '',
      '.skeleton-form-item:last-child {',
      '  margin-bottom: 0;',
      '}',
      '',
      '.skeleton-label {',
      '  height: 28rpx;',
      '  width: 30%;',
      '  border-radius: 4rpx;',
      '  margin-bottom: 16rpx;',
      '}',
      '',
      '.skeleton-input {',
      '  height: 72rpx;',
      '  border-radius: 8rpx;',
      '}',
      '',
      '.skeleton-button {',
      '  height: 88rpx;',
      '  border-radius: 44rpx;',
      '}'
    ].join('\n');

    return result;
  },

  /**
   * 生成仪表盘类型骨架屏
   * @private
   */
  _generateDashboardSkeleton: function(pagePath, result) {
    result.wxml = [
      '<!-- 骨架屏组件 - ' + pagePath + ' -->',
      '<view class="skeleton-container" wx:if="{{loading}}">',
      '  <!-- 顶部统计卡片 -->',
      '  <view class="skeleton-stats">',
      '    <view class="skeleton-stat-item skeleton-animate" wx:for="{{[1,2,3]}}" wx:key="index"></view>',
      '  </view>',
      '  ',
      '  <!-- 功能入口 -->',
      '  <view class="skeleton-grid">',
      '    <view class="skeleton-grid-item" wx:for="{{[1,2,3,4,5,6]}}" wx:key="index">',
      '      <view class="skeleton-icon skeleton-animate"></view>',
      '      <view class="skeleton-text skeleton-animate"></view>',
      '    </view>',
      '  </view>',
      '</view>'
    ].join('\n');

    result.wxss = [
      '/* 骨架屏样式 - ' + pagePath + ' */',
      '.skeleton-container {',
      '  padding: 24rpx;',
      '  background: #f7f8fa;',
      '  min-height: 100vh;',
      '}',
      '',
      '.skeleton-animate {',
      '  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);',
      '  background-size: 200% 100%;',
      '  animation: skeleton-loading 1.5s infinite;',
      '}',
      '',
      '@keyframes skeleton-loading {',
      '  0% { background-position: 200% 0; }',
      '  100% { background-position: -200% 0; }',
      '}',
      '',
      '.skeleton-stats {',
      '  display: flex;',
      '  gap: 16rpx;',
      '  margin-bottom: 32rpx;',
      '}',
      '',
      '.skeleton-stat-item {',
      '  flex: 1;',
      '  height: 120rpx;',
      '  border-radius: 12rpx;',
      '}',
      '',
      '.skeleton-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(3, 1fr);',
      '  gap: 24rpx;',
      '  background: #fff;',
      '  border-radius: 12rpx;',
      '  padding: 32rpx;',
      '}',
      '',
      '.skeleton-grid-item {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '}',
      '',
      '.skeleton-icon {',
      '  width: 80rpx;',
      '  height: 80rpx;',
      '  border-radius: 16rpx;',
      '  margin-bottom: 16rpx;',
      '}',
      '',
      '.skeleton-text {',
      '  width: 80rpx;',
      '  height: 24rpx;',
      '  border-radius: 4rpx;',
      '}'
    ].join('\n');

    return result;
  },

  /**
   * 生成默认骨架屏
   * @private
   */
  _generateDefaultSkeleton: function(pagePath, result) {
    result.wxml = [
      '<!-- 骨架屏组件 - ' + pagePath + ' -->',
      '<view class="skeleton-container" wx:if="{{loading}}">',
      '  <view class="skeleton-block skeleton-animate"></view>',
      '  <view class="skeleton-block skeleton-animate" style="width: 80%;"></view>',
      '  <view class="skeleton-block skeleton-animate" style="width: 60%;"></view>',
      '</view>'
    ].join('\n');

    result.wxss = [
      '/* 骨架屏样式 - ' + pagePath + ' */',
      '.skeleton-container {',
      '  padding: 24rpx;',
      '  background: #f7f8fa;',
      '  min-height: 100vh;',
      '}',
      '',
      '.skeleton-animate {',
      '  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);',
      '  background-size: 200% 100%;',
      '  animation: skeleton-loading 1.5s infinite;',
      '}',
      '',
      '@keyframes skeleton-loading {',
      '  0% { background-position: 200% 0; }',
      '  100% { background-position: -200% 0; }',
      '}',
      '',
      '.skeleton-block {',
      '  height: 32rpx;',
      '  border-radius: 4rpx;',
      '  margin-bottom: 24rpx;',
      '}'
    ].join('\n');

    return result;
  },

  /**
   * 生成骨架屏使用说明
   * @private
   */
  _generateSkeletonUsage: function(pagePath) {
    return [
      '/* 使用说明 */',
      '// 1. 将WXML代码添加到页面模板顶部',
      '// 2. 将WXSS代码添加到页面样式文件',
      '// 3. 在页面data中添加 loading: true',
      '// 4. 数据加载完成后设置 loading: false',
      '',
      '// 示例代码:',
      'Page({',
      '  data: {',
      '    loading: true',
      '  },',
      '  onLoad: function() {',
      '    var self = this;',
      '    // 加载数据...',
      '    loadData().then(function(data) {',
      '      self.setData({',
      '        loading: false,',
      '        // ...其他数据',
      '      });',
      '    });',
      '  }',
      '});'
    ].join('\n');
  },

  /**
   * 生成启动性能报告
   * 综合分析结果生成完整报告
   *
   * @param {Object} [options] - 分析选项
   * @returns {Object} 完整的启动性能报告
   */
  generateReport: function(options) {
    options = options || {};

    var report = {
      timestamp: new Date().toISOString(),
      mainPackageAnalysis: this.analyzeMainPackageSize(options),
      movableModules: this.identifyMovableModules(options),
      syncOperations: this.analyzeSyncOperations(options),
      summary: {},
      recommendations: []
    };

    // 生成摘要
    report.summary = {
      mainPackageSize: report.mainPackageAnalysis.totalSize,
      mainPackageSizeFormatted: this._formatSize(report.mainPackageAnalysis.totalSize),
      exceedsLimit: report.mainPackageAnalysis.exceedsLimit,
      exceedsRecommended: report.mainPackageAnalysis.exceedsRecommended,
      movableModulesCount: report.movableModules.length,
      potentialSavings: this._calculatePotentialSavings(report.movableModules),
      deferrableOperationsCount: report.syncOperations.filter(function(op) {
        return op.deferrable;
      }).length,
      estimatedStartupImprovement: this._estimateStartupImprovement(report)
    };

    // 合并所有建议
    report.recommendations = report.mainPackageAnalysis.recommendations.concat(
      this._generateModuleRecommendations(report.movableModules),
      this._generateSyncRecommendations(report.syncOperations)
    );

    // 按优先级排序
    report.recommendations.sort(function(a, b) {
      var priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
    });

    return report;
  },

  /**
   * 计算潜在节省的体积
   * @private
   */
  _calculatePotentialSavings: function(modules) {
    var total = 0;
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].safeToMove) {
        total += modules[i].currentSize || 0;
      }
    }
    return total;
  },

  /**
   * 估算启动时间改善
   * @private
   */
  _estimateStartupImprovement: function(report) {
    var improvement = 0;

    // 基于可延迟操作估算
    var deferrableOps = report.syncOperations.filter(function(op) {
      return op.deferrable;
    });

    for (var i = 0; i < deferrableOps.length; i++) {
      improvement += deferrableOps[i].estimatedImpact || 10;
    }

    // 基于体积优化估算（每100KB约节省50ms）
    var potentialSavings = report.summary.potentialSavings || 0;
    improvement += Math.round((potentialSavings / (100 * 1024)) * 50);

    return improvement + 'ms';
  },

  /**
   * 生成模块迁移建议
   * @private
   */
  _generateModuleRecommendations: function(modules) {
    var recommendations = [];

    var safeModules = modules.filter(function(m) { return m.safeToMove; });

    if (safeModules.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: '发现 ' + safeModules.length + ' 个可迁移模块',
        description: '这些模块可以安全迁移到分包，预计节省 ' +
          this._formatSize(this._calculatePotentialSavings(safeModules)),
        estimatedImpact: 20
      });
    }

    return recommendations;
  },

  /**
   * 生成同步操作优化建议
   * @private
   */
  _generateSyncRecommendations: function(operations) {
    var recommendations = [];

    var deferrableOps = operations.filter(function(op) { return op.deferrable; });

    if (deferrableOps.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: '发现 ' + deferrableOps.length + ' 个可延迟的同步操作',
        description: '将这些操作延迟到首屏渲染后执行，可改善启动体验',
        estimatedImpact: 15
      });
    }

    return recommendations;
  }
};

// 导出模块
module.exports = StartupAnalyzer;
