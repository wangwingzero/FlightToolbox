'use strict';

/**
 * 📋 长列表渲染优化器
 *
 * 识别和优化长列表场景
 * 扫描代码中的列表渲染，识别性能问题和优化机会
 *
 * @module list-optimizer
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 长列表渲染优化
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 首选方案：Skyline渲染引擎的list-view/grid-view组件
 * - 备选方案：官方recycle-view组件（WebView模式）
 * - 自定义方案：基于IntersectionObserver的虚拟列表
 * - 关键优化：固定高度、图片懒加载、局部setData更新
 * - 数据切片：避免一次性向setData传递数千条数据
 * - 减少DOM复杂度：简化列表项内部的节点深度
 *
 * @example
 * var ListOptimizer = require('./list-optimizer.js');
 * var longLists = ListOptimizer.scanLongLists({ fileSystem: fs });
 * var heightAnalysis = ListOptimizer.analyzeItemHeight('pages/search/index');
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 长列表优化阈值
 * @constant {Object}
 */
var THRESHOLDS = {
  VIRTUAL_LIST_THRESHOLD: 100,    // 超过100项建议启用虚拟列表
  PAGINATION_THRESHOLD: 50,       // 超过50项建议分页
  WARNING_THRESHOLD: 30,          // 超过30项给出警告
  DEFAULT_PAGE_SIZE: 20,          // 默认分页大小
  PRELOAD_COUNT: 5,               // 预加载数量
  MAX_ITEMS_PER_SETDATA: 20,      // 单次setData最大项数
  FIXED_HEIGHT_TOLERANCE: 10      // 固定高度容差（rpx）
};

/**
 * 列表渲染模式类型
 * @constant {Object}
 */
var LIST_PATTERN_TYPES = {
  WX_FOR: 'wx:for',                     // 标准wx:for循环
  RECYCLE_VIEW: 'recycle-view',         // 官方recycle-view组件
  LIST_VIEW: 'list-view',               // Skyline list-view组件
  VIRTUAL_LIST: 'virtual-list',         // 自定义虚拟列表
  SCROLL_VIEW_LIST: 'scroll-view-list', // scroll-view内的列表
  SWIPER_LIST: 'swiper-list'            // swiper内的列表
};

/**
 * 列表数据加载模式
 * @constant {Object}
 */
var DATA_LOADING_PATTERNS = {
  ALL_AT_ONCE: 'all_at_once',           // 一次性加载所有数据
  PAGINATION: 'pagination',              // 分页加载
  INFINITE_SCROLL: 'infinite_scroll',    // 无限滚动
  LAZY_LOAD: 'lazy_load'                 // 懒加载
};

/**
 * 已知的长列表页面（基于项目分析）
 * @constant {Array}
 */
var KNOWN_LONG_LIST_PAGES = [
  {
    page: 'packageA/icao-vocabulary/index',
    listName: 'vocabularyList',
    estimatedItems: 5000,
    description: 'ICAO词汇表，约5000条记录'
  },
  {
    page: 'packageB/abbreviations/index',
    listName: 'abbreviationList',
    estimatedItems: 3000,
    description: '缩略语列表，约3000条记录'
  },
  {
    page: 'packageC/airport-database/index',
    listName: 'airportList',
    estimatedItems: 7405,
    description: '全球机场数据库，7405个机场'
  },
  {
    page: 'packageCCAR/regulation-list/index',
    listName: 'regulationList',
    estimatedItems: 500,
    description: 'CCAR规章列表'
  },
  {
    page: 'packageIOSA/standards/index',
    listName: 'standardsList',
    estimatedItems: 800,
    description: 'IOSA审计标准列表'
  },
  {
    page: 'pages/search/index',
    listName: 'searchResults',
    estimatedItems: 1000,
    description: '搜索结果列表，动态数量'
  },
  {
    page: 'packageTermCenter/term-list/index',
    listName: 'termList',
    estimatedItems: 2000,
    description: '术语中心列表'
  }
];

/**
 * 长列表渲染优化器
 * @namespace ListOptimizer
 */
var ListOptimizer = {
  /**
   * 优化阈值常量
   */
  THRESHOLDS: THRESHOLDS,

  /**
   * 列表模式类型
   */
  LIST_PATTERN_TYPES: LIST_PATTERN_TYPES,

  /**
   * 数据加载模式
   */
  DATA_LOADING_PATTERNS: DATA_LOADING_PATTERNS,


  /**
   * 扫描长列表场景
   * 分析WXML文件中的列表渲染，识别超过阈值的长列表
   *
   * @param {Object} [options] - 扫描选项
   * @param {Object} [options.fileSystem] - 文件系统接口（用于测试注入）
   * @param {Array<string>} [options.files] - 要扫描的WXML文件列表
   * @param {string} [options.wxmlCode] - 单个WXML文件的代码（用于测试）
   * @param {string} [options.jsCode] - 对应JS文件的代码（用于测试）
   * @param {string} [options.pagePath] - 页面路径（用于测试）
   * @returns {Array} 长列表页面列表
   *
   * @example
   * var longLists = ListOptimizer.scanLongLists({ fileSystem: fs });
   * longLists.forEach(function(list) {
   *   console.log(list.page, ':', list.listName, '-', list.estimatedItems, '项');
   * });
   */
  scanLongLists: function(options) {
    options = options || {};

    var results = [];

    try {
      // 单文件模式（用于测试）
      if (options.wxmlCode && options.pagePath) {
        var pageResult = this._analyzePageForLongLists(
          options.pagePath,
          options.wxmlCode,
          options.jsCode || ''
        );
        results = results.concat(pageResult);
      }
      // 多文件模式
      else if (options.fileSystem && options.files) {
        for (var i = 0; i < options.files.length; i++) {
          var wxmlPath = options.files[i];
          try {
            var wxmlCode = options.fileSystem.readFileSync(wxmlPath, 'utf8');
            var jsPath = wxmlPath.replace(/\.wxml$/, '.js');
            var jsCode = '';
            try {
              jsCode = options.fileSystem.readFileSync(jsPath, 'utf8');
            } catch (e) {
              // JS文件可能不存在
            }

            var pagePath = wxmlPath.replace(/\/index\.wxml$/, '').replace(/\.wxml$/, '');
            var pageResults = this._analyzePageForLongLists(pagePath, wxmlCode, jsCode);
            results = results.concat(pageResults);
          } catch (e) {
            console.warn('⚠️ 无法读取文件:', wxmlPath, e.message);
          }
        }
      }
      // 默认模式：返回已知的长列表页面
      else {
        results = this._getKnownLongListPages();
      }

      // 为每个结果添加优化建议
      for (var j = 0; j < results.length; j++) {
        results[j].recommendations = this._generateListRecommendations(results[j]);
        results[j].issues = this._generateListIssues(results[j]);
      }

    } catch (error) {
      console.error('❌ 长列表扫描失败:', error);
    }

    return results;
  },

  /**
   * 分析单个页面的长列表
   * @private
   * @param {string} pagePath - 页面路径
   * @param {string} wxmlCode - WXML代码
   * @param {string} jsCode - JS代码
   * @returns {Array} 列表分析结果
   */
  _analyzePageForLongLists: function(pagePath, wxmlCode, jsCode) {
    var lists = [];

    // 1. 检测wx:for循环
    var wxForLists = this._detectWxForLists(wxmlCode);

    // 2. 检测recycle-view组件
    var recycleViewLists = this._detectRecycleViewLists(wxmlCode);

    // 3. 检测list-view组件（Skyline）
    var listViewLists = this._detectListViewLists(wxmlCode);

    // 4. 合并所有检测到的列表
    var allLists = wxForLists.concat(recycleViewLists).concat(listViewLists);

    // 5. 分析JS代码中的数据源
    var dataSourceAnalysis = this._analyzeDataSources(jsCode, allLists);

    // 6. 构建结果
    for (var i = 0; i < allLists.length; i++) {
      var list = allLists[i];
      var dataSource = dataSourceAnalysis[list.dataSource] || {};

      var listInfo = {
        page: pagePath,
        listName: list.dataSource,
        listType: list.type,
        estimatedItems: dataSource.estimatedItems || this._estimateItemCount(list, jsCode),
        hasVirtualList: list.type === LIST_PATTERN_TYPES.RECYCLE_VIEW ||
                        list.type === LIST_PATTERN_TYPES.LIST_VIEW ||
                        list.type === LIST_PATTERN_TYPES.VIRTUAL_LIST,
        hasPagination: dataSource.hasPagination || false,
        hasInfiniteScroll: dataSource.hasInfiniteScroll || false,
        loadingPattern: dataSource.loadingPattern || DATA_LOADING_PATTERNS.ALL_AT_ONCE,
        wxmlLine: list.line,
        itemTemplate: list.itemTemplate,
        hasFixedHeight: this._checkFixedHeight(list.itemTemplate, wxmlCode),
        hasImageLazyLoad: this._checkImageLazyLoad(list.itemTemplate, wxmlCode),
        complexity: this._analyzeItemComplexity(list.itemTemplate, wxmlCode)
      };

      // 只添加超过警告阈值的列表
      if (listInfo.estimatedItems >= THRESHOLDS.WARNING_THRESHOLD) {
        lists.push(listInfo);
      }
    }

    return lists;
  },

  /**
   * 检测wx:for列表
   * @private
   */
  _detectWxForLists: function(wxmlCode) {
    var lists = [];
    var lines = wxmlCode.split('\n');

    // 匹配wx:for属性
    var wxForPattern = /wx:for\s*=\s*["']\{\{([^}]+)\}\}["']/g;

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];
      var match;

      while ((match = wxForPattern.exec(line)) !== null) {
        var dataSource = match[1].trim();

        // 提取列表项模板（简化版，获取当前标签）
        var tagMatch = line.match(/<(\w+)/);
        var tagName = tagMatch ? tagMatch[1] : 'view';

        lists.push({
          type: LIST_PATTERN_TYPES.WX_FOR,
          dataSource: dataSource,
          line: lineNum + 1,
          tagName: tagName,
          itemTemplate: this._extractItemTemplate(wxmlCode, lineNum)
        });
      }
    }

    return lists;
  },

  /**
   * 检测recycle-view组件
   * @private
   */
  _detectRecycleViewLists: function(wxmlCode) {
    var lists = [];
    var lines = wxmlCode.split('\n');

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      if (line.indexOf('<recycle-view') !== -1 || line.indexOf('<recycle-list') !== -1) {
        // 提取数据源
        var dataMatch = line.match(/(?:wx:for|id)\s*=\s*["'](?:\{\{)?([^}"']+)(?:\}\})?["']/);
        var dataSource = dataMatch ? dataMatch[1] : 'recycleList';

        lists.push({
          type: LIST_PATTERN_TYPES.RECYCLE_VIEW,
          dataSource: dataSource,
          line: lineNum + 1,
          tagName: 'recycle-view',
          itemTemplate: this._extractItemTemplate(wxmlCode, lineNum)
        });
      }
    }

    return lists;
  },

  /**
   * 检测list-view组件（Skyline）
   * @private
   */
  _detectListViewLists: function(wxmlCode) {
    var lists = [];
    var lines = wxmlCode.split('\n');

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      if (line.indexOf('<list-view') !== -1) {
        var dataMatch = line.match(/wx:for\s*=\s*["']\{\{([^}]+)\}\}["']/);
        var dataSource = dataMatch ? dataMatch[1] : 'listData';

        lists.push({
          type: LIST_PATTERN_TYPES.LIST_VIEW,
          dataSource: dataSource,
          line: lineNum + 1,
          tagName: 'list-view',
          itemTemplate: this._extractItemTemplate(wxmlCode, lineNum)
        });
      }
    }

    return lists;
  },

  /**
   * 提取列表项模板
   * @private
   */
  _extractItemTemplate: function(wxmlCode, startLine) {
    var lines = wxmlCode.split('\n');
    var template = '';
    var depth = 0;
    var started = false;

    for (var i = startLine; i < lines.length && i < startLine + 50; i++) {
      var line = lines[i];
      template += line + '\n';

      // 计算标签深度
      var openTags = (line.match(/<\w+/g) || []).length;
      var closeTags = (line.match(/<\/\w+>/g) || []).length;
      var selfClosing = (line.match(/\/>/g) || []).length;

      if (openTags > 0) started = true;
      depth += openTags - closeTags - selfClosing;

      // 当深度回到0时，模板结束
      if (started && depth <= 0) {
        break;
      }
    }

    return template;
  },

  /**
   * 分析JS代码中的数据源
   * @private
   */
  _analyzeDataSources: function(jsCode, lists) {
    var analysis = {};

    for (var i = 0; i < lists.length; i++) {
      var list = lists[i];
      var dataSource = list.dataSource;

      analysis[dataSource] = {
        estimatedItems: this._estimateItemCountFromJS(jsCode, dataSource),
        hasPagination: this._checkPagination(jsCode, dataSource),
        hasInfiniteScroll: this._checkInfiniteScroll(jsCode),
        loadingPattern: this._detectLoadingPattern(jsCode, dataSource)
      };
    }

    return analysis;
  },

  /**
   * 从JS代码估算列表项数量
   * @private
   */
  _estimateItemCountFromJS: function(jsCode, dataSource) {
    // 检查是否有明确的数据长度
    var lengthPattern = new RegExp(dataSource + '\\.length\\s*[><=]+\\s*(\\d+)', 'g');
    var match = lengthPattern.exec(jsCode);
    if (match) {
      return parseInt(match[1], 10);
    }

    // 检查分页参数
    var pageSizePattern = /pageSize\s*[=:]\s*(\d+)/;
    var pageSizeMatch = jsCode.match(pageSizePattern);
    var pageSize = pageSizeMatch ? parseInt(pageSizeMatch[1], 10) : 20;

    var totalPattern = /total\s*[=:]\s*(\d+)/;
    var totalMatch = jsCode.match(totalPattern);
    if (totalMatch) {
      return parseInt(totalMatch[1], 10);
    }

    // 检查是否从大数据文件加载
    if (jsCode.indexOf('require') !== -1 && jsCode.indexOf('data') !== -1) {
      // 可能是从数据文件加载，假设较大
      return 500;
    }

    // 默认估算
    return 100;
  },

  /**
   * 估算列表项数量
   * @private
   */
  _estimateItemCount: function(list, jsCode) {
    // 首先检查是否是已知的长列表页面
    for (var i = 0; i < KNOWN_LONG_LIST_PAGES.length; i++) {
      var known = KNOWN_LONG_LIST_PAGES[i];
      if (list.dataSource === known.listName) {
        return known.estimatedItems;
      }
    }

    // 从JS代码估算
    return this._estimateItemCountFromJS(jsCode, list.dataSource);
  },

  /**
   * 检查是否有分页
   * @private
   */
  _checkPagination: function(jsCode, dataSource) {
    var paginationIndicators = [
      'page',
      'pageNum',
      'pageIndex',
      'currentPage',
      'pageSize',
      'loadMore',
      'hasMore',
      'onReachBottom'
    ];

    for (var i = 0; i < paginationIndicators.length; i++) {
      if (jsCode.indexOf(paginationIndicators[i]) !== -1) {
        return true;
      }
    }

    return false;
  },

  /**
   * 检查是否有无限滚动
   * @private
   */
  _checkInfiniteScroll: function(jsCode) {
    var infiniteScrollIndicators = [
      'onReachBottom',
      'scrolltolower',
      'loadMore',
      'infiniteScroll',
      'pullUpLoad'
    ];

    for (var i = 0; i < infiniteScrollIndicators.length; i++) {
      if (jsCode.indexOf(infiniteScrollIndicators[i]) !== -1) {
        return true;
      }
    }

    return false;
  },

  /**
   * 检测数据加载模式
   * @private
   */
  _detectLoadingPattern: function(jsCode, dataSource) {
    // 检查是否有分页
    if (this._checkPagination(jsCode, dataSource)) {
      if (this._checkInfiniteScroll(jsCode)) {
        return DATA_LOADING_PATTERNS.INFINITE_SCROLL;
      }
      return DATA_LOADING_PATTERNS.PAGINATION;
    }

    // 检查是否有懒加载
    if (jsCode.indexOf('lazyLoad') !== -1 || jsCode.indexOf('lazy-load') !== -1) {
      return DATA_LOADING_PATTERNS.LAZY_LOAD;
    }

    // 默认为一次性加载
    return DATA_LOADING_PATTERNS.ALL_AT_ONCE;
  },

  /**
   * 检查列表项是否有固定高度
   * @private
   */
  _checkFixedHeight: function(itemTemplate, wxmlCode) {
    if (!itemTemplate) return false;

    // 检查是否有明确的height样式
    var heightPattern = /height\s*:\s*(\d+)(rpx|px|vh)/;
    if (heightPattern.test(itemTemplate)) {
      return true;
    }

    // 检查是否有固定高度的class
    var fixedHeightClasses = ['item-fixed', 'fixed-height', 'list-item'];
    for (var i = 0; i < fixedHeightClasses.length; i++) {
      if (itemTemplate.indexOf(fixedHeightClasses[i]) !== -1) {
        return true;
      }
    }

    return false;
  },

  /**
   * 检查是否有图片懒加载
   * @private
   */
  _checkImageLazyLoad: function(itemTemplate, wxmlCode) {
    if (!itemTemplate) return false;

    // 检查image标签是否有lazy-load属性
    if (itemTemplate.indexOf('lazy-load') !== -1) {
      return true;
    }

    // 检查是否使用了懒加载组件
    if (itemTemplate.indexOf('van-image') !== -1) {
      return true; // Vant Image组件默认支持懒加载
    }

    return false;
  },

  /**
   * 分析列表项复杂度
   * @private
   */
  _analyzeItemComplexity: function(itemTemplate, wxmlCode) {
    if (!itemTemplate) {
      return { level: 'unknown', nodeCount: 0, depth: 0 };
    }

    // 计算节点数量
    var nodeCount = (itemTemplate.match(/<\w+/g) || []).length;

    // 计算最大嵌套深度
    var maxDepth = 0;
    var currentDepth = 0;
    var lines = itemTemplate.split('\n');

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var openTags = (line.match(/<\w+/g) || []).length;
      var closeTags = (line.match(/<\/\w+>/g) || []).length;
      var selfClosing = (line.match(/\/>/g) || []).length;

      currentDepth += openTags - closeTags - selfClosing;
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth;
      }
    }

    // 判断复杂度级别
    var level = 'low';
    if (nodeCount > 20 || maxDepth > 5) {
      level = 'high';
    } else if (nodeCount > 10 || maxDepth > 3) {
      level = 'medium';
    }

    return {
      level: level,
      nodeCount: nodeCount,
      depth: maxDepth
    };
  },

  /**
   * 获取已知的长列表页面
   * @private
   */
  _getKnownLongListPages: function() {
    var results = [];

    for (var i = 0; i < KNOWN_LONG_LIST_PAGES.length; i++) {
      var known = KNOWN_LONG_LIST_PAGES[i];
      results.push({
        page: known.page,
        listName: known.listName,
        listType: LIST_PATTERN_TYPES.WX_FOR, // 假设默认使用wx:for
        estimatedItems: known.estimatedItems,
        hasVirtualList: false,
        hasPagination: false,
        hasInfiniteScroll: false,
        loadingPattern: DATA_LOADING_PATTERNS.ALL_AT_ONCE,
        description: known.description,
        hasFixedHeight: false,
        hasImageLazyLoad: false,
        complexity: { level: 'unknown', nodeCount: 0, depth: 0 }
      });
    }

    return results;
  },


  /**
   * 生成列表优化建议
   * @private
   */
  _generateListRecommendations: function(listInfo) {
    var recommendations = [];

    // 检查是否需要虚拟列表
    if (listInfo.estimatedItems >= THRESHOLDS.VIRTUAL_LIST_THRESHOLD && !listInfo.hasVirtualList) {
      recommendations.push({
        priority: 'high',
        title: '建议使用虚拟列表',
        description: '列表项数量约 ' + listInfo.estimatedItems +
          ' 项，超过 ' + THRESHOLDS.VIRTUAL_LIST_THRESHOLD +
          ' 项阈值。建议使用虚拟列表（recycle-view或list-view）提升性能。',
        solution: this._getVirtualListSolution(),
        estimatedImpact: 40
      });
    }

    // 检查是否需要分页
    if (listInfo.estimatedItems >= THRESHOLDS.PAGINATION_THRESHOLD &&
        !listInfo.hasPagination && !listInfo.hasInfiniteScroll) {
      recommendations.push({
        priority: 'high',
        title: '建议实现分页或无限滚动',
        description: '当前一次性加载所有数据（约 ' + listInfo.estimatedItems +
          ' 项），建议实现分页加载或无限滚动。',
        solution: this._getPaginationSolution(),
        estimatedImpact: 30
      });
    }

    // 检查固定高度
    if (!listInfo.hasFixedHeight && listInfo.estimatedItems >= THRESHOLDS.WARNING_THRESHOLD) {
      recommendations.push({
        priority: 'medium',
        title: '建议设置固定高度',
        description: '列表项未设置固定高度，可能影响虚拟列表性能和滚动流畅度。',
        solution: '为列表项容器设置固定的height样式，或提供高度估算函数。',
        estimatedImpact: 15
      });
    }

    // 检查图片懒加载
    if (!listInfo.hasImageLazyLoad && listInfo.itemTemplate &&
        listInfo.itemTemplate.indexOf('<image') !== -1) {
      recommendations.push({
        priority: 'medium',
        title: '建议启用图片懒加载',
        description: '列表项包含图片但未启用懒加载，可能导致首屏加载缓慢。',
        solution: '为image标签添加lazy-load属性，或使用van-image组件。',
        estimatedImpact: 20
      });
    }

    // 检查列表项复杂度
    if (listInfo.complexity && listInfo.complexity.level === 'high') {
      recommendations.push({
        priority: 'medium',
        title: '建议简化列表项结构',
        description: '列表项DOM结构复杂（' + listInfo.complexity.nodeCount +
          ' 个节点，' + listInfo.complexity.depth + ' 层嵌套），可能影响渲染性能。',
        solution: '减少列表项内部的节点数量和嵌套深度，将复杂内容拆分为子组件。',
        estimatedImpact: 15
      });
    }

    return recommendations;
  },

  /**
   * 获取虚拟列表解决方案
   * @private
   */
  _getVirtualListSolution: function() {
    return [
      '方案1（推荐）：使用Skyline渲染引擎的list-view组件',
      '  - 在app.json中启用Skyline：{"renderer": "skyline"}',
      '  - 使用<list-view>替代<scroll-view>',
      '',
      '方案2：使用官方recycle-view组件',
      '  - npm install miniprogram-recycle-view',
      '  - 在页面json中引入组件',
      '  - 使用createRecycleContext管理数据',
      '',
      '方案3（项目内置）：使用virtual-list-mixin工具',
      '  - var VirtualListMixin = require("../utils/virtual-list-mixin.js");',
      '  - 在customOnLoad中调用: VirtualListMixin.initVirtualList(this, data, options)',
      '  - 在customOnUnload中调用: VirtualListMixin.cleanupObservers(this)',
      '  - 基于IntersectionObserver，自动管理可见组渲染',
      '  - 支持固定高度和动态高度两种模式',
      '',
      '方案4：基于IntersectionObserver手动实现',
      '  - 将数据分组（每组10-20项）',
      '  - 使用IntersectionObserver监听可见性',
      '  - 仅渲染可见区域的数据组'
    ].join('\n');
  },

  /**
   * 获取分页解决方案
   * @private
   */
  _getPaginationSolution: function() {
    return [
      '方案1：分页加载',
      '  - 初始只加载第一页数据（20-50项）',
      '  - 提供"加载更多"按钮或页码导航',
      '',
      '方案2：无限滚动',
      '  - 监听onReachBottom或scroll-view的scrolltolower事件',
      '  - 滚动到底部时自动加载下一页',
      '  - 使用hasMore标志控制加载状态',
      '',
      '示例代码：',
      'onReachBottom: function() {',
      '  if (this.data.hasMore && !this.data.loading) {',
      '    this.loadNextPage();',
      '  }',
      '}'
    ].join('\n');
  },

  /**
   * 生成审计问题
   * @private
   */
  _generateListIssues: function(listInfo) {
    var issues = [];

    // 超过100项且无虚拟列表
    if (listInfo.estimatedItems >= THRESHOLDS.VIRTUAL_LIST_THRESHOLD && !listInfo.hasVirtualList) {
      issues.push(AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.LONG_LIST_NO_VIRTUAL,
        file: listInfo.page,
        line: listInfo.wxmlLine,
        description: '长列表 "' + listInfo.listName + '" 包含约 ' +
          listInfo.estimatedItems + ' 项，未使用虚拟列表',
        suggestion: '使用recycle-view或list-view组件实现虚拟列表',
        metadata: {
          listName: listInfo.listName,
          estimatedItems: listInfo.estimatedItems,
          threshold: THRESHOLDS.VIRTUAL_LIST_THRESHOLD
        }
      }));
    }

    // 一次性加载所有数据
    if (listInfo.loadingPattern === DATA_LOADING_PATTERNS.ALL_AT_ONCE &&
        listInfo.estimatedItems >= THRESHOLDS.PAGINATION_THRESHOLD) {
      issues.push(AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: 'list_all_at_once_loading',
        file: listInfo.page,
        description: '列表 "' + listInfo.listName + '" 一次性加载所有数据（约 ' +
          listInfo.estimatedItems + ' 项）',
        suggestion: '实现分页加载或无限滚动，避免一次性加载大量数据',
        metadata: {
          listName: listInfo.listName,
          estimatedItems: listInfo.estimatedItems,
          loadingPattern: listInfo.loadingPattern
        }
      }));
    }

    // 列表项复杂度过高
    if (listInfo.complexity && listInfo.complexity.level === 'high' &&
        listInfo.estimatedItems >= THRESHOLDS.WARNING_THRESHOLD) {
      issues.push(AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MINOR,
        type: 'list_item_complexity',
        file: listInfo.page,
        description: '列表项结构复杂（' + listInfo.complexity.nodeCount +
          ' 个节点），可能影响渲染性能',
        suggestion: '简化列表项DOM结构，减少节点数量和嵌套深度',
        metadata: {
          listName: listInfo.listName,
          nodeCount: listInfo.complexity.nodeCount,
          depth: listInfo.complexity.depth
        }
      }));
    }

    return issues;
  },


  /**
   * 分析列表项高度配置
   * 检测列表项是否有固定高度或提供高度估算函数
   *
   * ⚠️ 固定高度可显著提升虚拟列表性能
   *
   * @param {string} pagePath - 页面路径
   * @param {Object} [options] - 分析选项
   * @param {string} [options.wxmlCode] - WXML代码（用于测试）
   * @param {string} [options.wxssCode] - WXSS代码（用于测试）
   * @param {string} [options.jsCode] - JS代码（用于测试）
   * @param {Object} [options.fileSystem] - 文件系统接口
   * @returns {Object} 高度配置分析结果
   *
   * @example
   * var heightAnalysis = ListOptimizer.analyzeItemHeight('pages/search/index');
   * console.log('固定高度:', heightAnalysis.hasFixedHeight);
   * console.log('估算高度:', heightAnalysis.estimatedHeight);
   */
  analyzeItemHeight: function(pagePath, options) {
    options = options || {};

    var result = {
      page: pagePath,
      hasFixedHeight: false,
      fixedHeightValue: null,
      hasHeightEstimator: false,
      estimatedHeight: null,
      heightSource: null,
      recommendation: '',
      issues: [],
      listItems: []
    };

    try {
      var wxmlCode = options.wxmlCode || '';
      var wxssCode = options.wxssCode || '';
      var jsCode = options.jsCode || '';

      // 如果提供了文件系统，读取文件
      if (options.fileSystem && !wxmlCode) {
        try {
          wxmlCode = options.fileSystem.readFileSync(pagePath + '/index.wxml', 'utf8');
        } catch (e) {
          try {
            wxmlCode = options.fileSystem.readFileSync(pagePath + '.wxml', 'utf8');
          } catch (e2) {
            // 文件不存在
          }
        }

        try {
          wxssCode = options.fileSystem.readFileSync(pagePath + '/index.wxss', 'utf8');
        } catch (e) {
          try {
            wxssCode = options.fileSystem.readFileSync(pagePath + '.wxss', 'utf8');
          } catch (e2) {
            // 文件不存在
          }
        }

        try {
          jsCode = options.fileSystem.readFileSync(pagePath + '/index.js', 'utf8');
        } catch (e) {
          try {
            jsCode = options.fileSystem.readFileSync(pagePath + '.js', 'utf8');
          } catch (e2) {
            // 文件不存在
          }
        }
      }

      // 1. 检测WXML中的列表项
      var listItems = this._detectListItemsForHeight(wxmlCode);
      result.listItems = listItems;

      // 2. 分析每个列表项的高度
      for (var i = 0; i < listItems.length; i++) {
        var item = listItems[i];
        var heightInfo = this._analyzeItemHeightDetail(item, wxmlCode, wxssCode, jsCode);

        if (heightInfo.hasFixedHeight) {
          result.hasFixedHeight = true;
          result.fixedHeightValue = heightInfo.fixedHeightValue;
          result.heightSource = heightInfo.heightSource;
        }

        if (heightInfo.hasHeightEstimator) {
          result.hasHeightEstimator = true;
        }

        item.heightInfo = heightInfo;
      }

      // 3. 估算高度（如果没有固定高度）
      if (!result.hasFixedHeight && listItems.length > 0) {
        result.estimatedHeight = this._estimateItemHeight(listItems[0], wxmlCode, wxssCode);
      }

      // 4. 生成建议
      result.recommendation = this._generateHeightRecommendation(result);

      // 5. 生成问题
      result.issues = this._generateHeightIssues(result, pagePath);

    } catch (error) {
      console.error('❌ 列表项高度分析失败:', error);
      result.error = error.message;
    }

    return result;
  },

  /**
   * 检测列表项元素
   * @private
   */
  _detectListItemsForHeight: function(wxmlCode) {
    var items = [];
    var lines = wxmlCode.split('\n');

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      var line = lines[lineNum];

      // 检测wx:for
      if (line.indexOf('wx:for') !== -1) {
        var dataMatch = line.match(/wx:for\s*=\s*["']\{\{([^}]+)\}\}["']/);
        var classMatch = line.match(/class\s*=\s*["']([^"']+)["']/);
        var styleMatch = line.match(/style\s*=\s*["']([^"']+)["']/);

        items.push({
          line: lineNum + 1,
          dataSource: dataMatch ? dataMatch[1] : 'unknown',
          className: classMatch ? classMatch[1] : '',
          inlineStyle: styleMatch ? styleMatch[1] : '',
          template: this._extractItemTemplate(wxmlCode, lineNum)
        });
      }
    }

    return items;
  },

  /**
   * 分析单个列表项的高度详情
   * @private
   */
  _analyzeItemHeightDetail: function(item, wxmlCode, wxssCode, jsCode) {
    var result = {
      hasFixedHeight: false,
      fixedHeightValue: null,
      heightSource: null,
      hasHeightEstimator: false,
      heightVariability: 'unknown'
    };

    // 1. 检查内联样式中的高度
    if (item.inlineStyle) {
      var inlineHeightMatch = item.inlineStyle.match(/height\s*:\s*(\d+)(rpx|px|vh|%)/);
      if (inlineHeightMatch) {
        result.hasFixedHeight = true;
        result.fixedHeightValue = inlineHeightMatch[1] + inlineHeightMatch[2];
        result.heightSource = 'inline-style';
      }
    }

    // 2. 检查WXSS中的高度
    if (!result.hasFixedHeight && item.className && wxssCode) {
      var classNames = item.className.split(/\s+/);
      for (var i = 0; i < classNames.length; i++) {
        var className = classNames[i];
        // 构建正则匹配类选择器
        var classPattern = new RegExp('\\.' + className + '\\s*\\{[^}]*height\\s*:\\s*(\\d+)(rpx|px|vh|%)', 'i');
        var classMatch = wxssCode.match(classPattern);
        if (classMatch) {
          result.hasFixedHeight = true;
          result.fixedHeightValue = classMatch[1] + classMatch[2];
          result.heightSource = 'wxss-class';
          break;
        }
      }
    }

    // 3. 检查JS中是否有高度估算函数
    if (jsCode) {
      var estimatorPatterns = [
        /itemHeight\s*[=:]/,
        /getItemHeight\s*[=:]/,
        /estimateHeight\s*[=:]/,
        /heightForItem\s*[=:]/
      ];

      for (var j = 0; j < estimatorPatterns.length; j++) {
        if (estimatorPatterns[j].test(jsCode)) {
          result.hasHeightEstimator = true;
          break;
        }
      }
    }

    // 4. 分析高度可变性
    if (item.template) {
      // 检查是否有可能导致高度变化的元素
      var variableHeightIndicators = [
        /<text[^>]*>.*\{\{.*\}\}.*<\/text>/,  // 动态文本
        /<rich-text/,                          // 富文本
        /<image[^>]*mode\s*=\s*["']aspectFit["']/,  // 自适应图片
        /wx:if/                                // 条件渲染
      ];

      var hasVariableContent = false;
      for (var k = 0; k < variableHeightIndicators.length; k++) {
        if (variableHeightIndicators[k].test(item.template)) {
          hasVariableContent = true;
          break;
        }
      }

      result.heightVariability = hasVariableContent ? 'variable' : 'fixed';
    }

    return result;
  },

  /**
   * 估算列表项高度
   * @private
   */
  _estimateItemHeight: function(item, wxmlCode, wxssCode) {
    // 基于模板内容估算高度
    if (!item || !item.template) {
      return 100; // 默认100rpx
    }

    var template = item.template;
    var estimatedHeight = 0;

    // 计算图片高度
    var imageMatches = template.match(/<image[^>]*>/g) || [];
    estimatedHeight += imageMatches.length * 150; // 每张图片约150rpx

    // 计算文本行高度
    var textMatches = template.match(/<text[^>]*>|<view[^>]*>[^<]+<\/view>/g) || [];
    estimatedHeight += textMatches.length * 40; // 每行文本约40rpx

    // 加上padding
    estimatedHeight += 32; // 上下padding各16rpx

    // 最小高度
    if (estimatedHeight < 80) {
      estimatedHeight = 80;
    }

    return estimatedHeight;
  },

  /**
   * 生成高度配置建议
   * @private
   */
  _generateHeightRecommendation: function(result) {
    if (result.hasFixedHeight) {
      return '列表项已设置固定高度（' + result.fixedHeightValue + '），有利于虚拟列表性能优化。';
    }

    if (result.hasHeightEstimator) {
      return '列表项有高度估算函数，可用于动态高度的虚拟列表。';
    }

    var recommendation = '建议为列表项设置固定高度以优化性能：\n';
    recommendation += '1. 在WXSS中为列表项类添加height属性\n';
    recommendation += '2. 或在WXML中使用内联style设置height\n';
    recommendation += '3. 如果高度确实需要动态，提供itemHeight估算函数\n';

    if (result.estimatedHeight) {
      recommendation += '\n估算高度约 ' + result.estimatedHeight + 'rpx，可作为参考。';
    }

    return recommendation;
  },

  /**
   * 生成高度相关的审计问题
   * @private
   */
  _generateHeightIssues: function(result, pagePath) {
    var issues = [];

    if (!result.hasFixedHeight && !result.hasHeightEstimator && result.listItems.length > 0) {
      issues.push(AuditReport.createIssue({
        category: AuditConfig.AuditCategory.PERFORMANCE,
        severity: AuditConfig.AuditSeverity.MINOR,
        type: 'list_item_no_fixed_height',
        file: pagePath,
        description: '列表项未设置固定高度，可能影响虚拟列表性能',
        suggestion: '为列表项设置固定高度或提供高度估算函数',
        metadata: {
          estimatedHeight: result.estimatedHeight,
          listItemCount: result.listItems.length
        }
      }));
    }

    return issues;
  },


  /**
   * 生成虚拟列表实现代码
   * 基于IntersectionObserver API实现按需渲染
   *
   * @param {Object} listConfig - 列表配置
   * @param {string} listConfig.listName - 列表数据名称
   * @param {number} listConfig.itemHeight - 列表项高度（rpx）
   * @param {number} [listConfig.pageSize=20] - 每页数量
   * @param {number} [listConfig.preloadCount=5] - 预加载数量
   * @returns {Object} 虚拟列表代码 { js, wxml, wxss }
   *
   * @example
   * var code = ListOptimizer.generateVirtualList({
   *   listName: 'vocabularyList',
   *   itemHeight: 120,
   *   pageSize: 20
   * });
   * console.log(code.js);
   */
  generateVirtualList: function(listConfig) {
    var listName = listConfig.listName || 'list';
    var itemHeight = listConfig.itemHeight || 100;
    var pageSize = listConfig.pageSize || THRESHOLDS.DEFAULT_PAGE_SIZE;
    var preloadCount = listConfig.preloadCount || THRESHOLDS.PRELOAD_COUNT;

    var result = {
      js: this._generateVirtualListJS(listName, itemHeight, pageSize, preloadCount),
      wxml: this._generateVirtualListWXML(listName, itemHeight),
      wxss: this._generateVirtualListWXSS(listName, itemHeight)
    };

    return result;
  },

  /**
   * 生成虚拟列表JS代码
   * @private
   */
  _generateVirtualListJS: function(listName, itemHeight, pageSize, preloadCount) {
    var code = [
      '/**',
      ' * 虚拟列表实现',
      ' * 基于IntersectionObserver的按需渲染',
      ' * 列表名称: ' + listName,
      ' * 列表项高度: ' + itemHeight + 'rpx',
      ' */',
      '',
      '// 在data中添加',
      'data: {',
      '  ' + listName + ': [],           // 完整数据',
      '  visibleGroups: {},              // 可见的数据组 { groupIndex: true }',
      '  groupedData: [],                // 分组后的数据',
      '  containerHeight: 0,             // 容器总高度',
      '  itemHeight: ' + itemHeight + ', // 列表项高度（rpx）',
      '  pageSize: ' + pageSize + ',     // 每组数量',
      '},',
      '',
      '// 初始化虚拟列表',
      'initVirtualList: function(data) {',
      '  var self = this;',
      '  var pageSize = this.data.pageSize;',
      '  var itemHeight = this.data.itemHeight;',
      '',
      '  // 将数据分组',
      '  var groupedData = [];',
      '  for (var i = 0; i < data.length; i += pageSize) {',
      '    groupedData.push({',
      '      index: Math.floor(i / pageSize),',
      '      items: data.slice(i, i + pageSize),',
      '      top: Math.floor(i / pageSize) * pageSize * itemHeight / 2 // rpx转px约除2',
      '    });',
      '  }',
      '',
      '  // 计算容器总高度',
      '  var containerHeight = data.length * itemHeight;',
      '',
      '  this.setData({',
      '    ' + listName + ': data,',
      '    groupedData: groupedData,',
      '    containerHeight: containerHeight,',
      '    visibleGroups: { 0: true } // 初始显示第一组',
      '  });',
      '',
      '  // 设置IntersectionObserver',
      '  this.setupObservers();',
      '},',
      '',
      '// 设置IntersectionObserver监听',
      'setupObservers: function() {',
      '  var self = this;',
      '  var groupedData = this.data.groupedData;',
      '',
      '  // 清除旧的observer',
      '  if (this.observers) {',
      '    for (var i = 0; i < this.observers.length; i++) {',
      '      this.observers[i].disconnect();',
      '    }',
      '  }',
      '  this.observers = [];',
      '',
      '  // 为每个组创建observer',
      '  for (var j = 0; j < groupedData.length; j++) {',
      '    (function(groupIndex) {',
      '      var observer = self.createIntersectionObserver();',
      '      observer.relativeToViewport({ top: 500, bottom: 500 })',
      '        .observe("#group-" + groupIndex, function(res) {',
      '          var visibleGroups = self.data.visibleGroups;',
      '          var isVisible = res.intersectionRatio > 0;',
      '',
      '          if (isVisible !== !!visibleGroups[groupIndex]) {',
      '            var update = {};',
      '            update["visibleGroups." + groupIndex] = isVisible;',
      '            self.setData(update);',
      '          }',
      '        });',
      '      self.observers.push(observer);',
      '    })(j);',
      '  }',
      '},',
      '',
      '// 页面卸载时清理',
      'onUnload: function() {',
      '  if (this.observers) {',
      '    for (var i = 0; i < this.observers.length; i++) {',
      '      this.observers[i].disconnect();',
      '    }',
      '    this.observers = null;',
      '  }',
      '}'
    ].join('\n');

    return code;
  },

  /**
   * 生成虚拟列表WXML代码
   * @private
   */
  _generateVirtualListWXML: function(listName, itemHeight) {
    var code = [
      '<!-- 虚拟列表容器 -->',
      '<scroll-view',
      '  class="virtual-list-container"',
      '  scroll-y',
      '  style="height: 100vh;"',
      '  enhanced',
      '  show-scrollbar="{{false}}"',
      '>',
      '  <!-- 占位容器，撑起滚动高度 -->',
      '  <view class="virtual-list-placeholder" style="height: {{containerHeight}}rpx;">',
      '    ',
      '    <!-- 数据组 -->',
      '    <block wx:for="{{groupedData}}" wx:key="index">',
      '      <view',
      '        id="group-{{item.index}}"',
      '        class="virtual-list-group"',
      '        style="position: absolute; top: {{item.top}}px; width: 100%;"',
      '      >',
      '        <!-- 仅当组可见时渲染内容 -->',
      '        <block wx:if="{{visibleGroups[item.index]}}">',
      '          <view',
      '            wx:for="{{item.items}}"',
      '            wx:for-item="dataItem"',
      '            wx:key="id"',
      '            class="virtual-list-item"',
      '            style="height: {{itemHeight}}rpx;"',
      '          >',
      '            <!-- 在这里放置列表项内容 -->',
      '            <text>{{dataItem.name}}</text>',
      '          </view>',
      '        </block>',
      '        ',
      '        <!-- 组不可见时显示占位 -->',
      '        <view',
      '          wx:else',
      '          class="virtual-list-placeholder-group"',
      '          style="height: {{item.items.length * itemHeight}}rpx;"',
      '        />',
      '      </view>',
      '    </block>',
      '    ',
      '  </view>',
      '</scroll-view>'
    ].join('\n');

    return code;
  },

  /**
   * 生成虚拟列表WXSS代码
   * @private
   */
  _generateVirtualListWXSS: function(listName, itemHeight) {
    var code = [
      '/* 虚拟列表样式 */',
      '.virtual-list-container {',
      '  width: 100%;',
      '  height: 100vh;',
      '  overflow: hidden;',
      '}',
      '',
      '.virtual-list-placeholder {',
      '  position: relative;',
      '  width: 100%;',
      '}',
      '',
      '.virtual-list-group {',
      '  width: 100%;',
      '}',
      '',
      '.virtual-list-item {',
      '  width: 100%;',
      '  height: ' + itemHeight + 'rpx;',
      '  box-sizing: border-box;',
      '  padding: 16rpx 24rpx;',
      '  border-bottom: 1rpx solid #ebedf0;',
      '  display: flex;',
      '  align-items: center;',
      '}',
      '',
      '.virtual-list-placeholder-group {',
      '  width: 100%;',
      '  background-color: #f7f8fa;',
      '}'
    ].join('\n');

    return code;
  }
};

// 导出模块
module.exports = ListOptimizer;
