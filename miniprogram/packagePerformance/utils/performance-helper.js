/**
 * 飞机性能辅助函数
 * 文件：performance-helper.js
 * 说明：提供搜索、格式化等辅助功能
 */

var PerformanceHelper = {
  /**
   * 搜索飞机性能数据
   * @param {Array} index - 搜索索引数组
   * @param {String} query - 搜索关键词
   * @returns {Array} 搜索结果（按分数排序）
   */
  search: function(index, query) {
    if (!query || !Array.isArray(index)) {
      return [];
    }

    var lowerQuery = query.toLowerCase().trim();
    var results = [];

    index.forEach(function(item) {
      var score = 0;

      // 1. 代码精确匹配（最高权重）
      if (item.code && item.code.toLowerCase() === lowerQuery) {
        score += 100;
      } else if (item.code && item.code.toLowerCase().indexOf(lowerQuery) !== -1) {
        score += 50;
      }

      // 2. 中文标题匹配
      if (item.title_zh && item.title_zh.toLowerCase().indexOf(lowerQuery) !== -1) {
        score += 40;
      }

      // 3. 英文标题匹配
      if (item.title_en && item.title_en.toLowerCase().indexOf(lowerQuery) !== -1) {
        score += 35;
      }

      // 4. 关键词匹配
      if (item.keywords && Array.isArray(item.keywords)) {
        item.keywords.forEach(function(kw) {
          if (kw.toLowerCase().indexOf(lowerQuery) !== -1) {
            score += 30;
          }
        });
      }

      // 5. 规章匹配（如：CS 25.301）
      if (item.regulations && Array.isArray(item.regulations)) {
        item.regulations.forEach(function(reg) {
          if (reg.toLowerCase().indexOf(lowerQuery) !== -1) {
            score += 25;
          }
        });
      }

      // 6. 摘要匹配
      if (item.summary && item.summary.toLowerCase().indexOf(lowerQuery) !== -1) {
        score += 20;
      }

      // 7. 章节标题匹配（次要）
      if (item.sectionTitle && item.sectionTitle.toLowerCase().indexOf(lowerQuery) !== -1) {
        score += 15;
      }

      if (score > 0) {
        results.push({
          item: item,
          score: score
        });
      }
    });

    // 按分数排序（降序）
    results.sort(function(a, b) {
      return b.score - a.score;
    });

    // 返回条目（去掉分数）
    return results.map(function(r) {
      return r.item;
    });
  },

  /**
   * 高亮搜索关键词
   * @param {String} text - 原文本
   * @param {String} keywords - 搜索关键词
   * @returns {Object} 分段文本对象 {before, match, after}
   */
  highlightKeywords: function(text, keywords) {
    if (!text || !keywords) return { before: text, match: '', after: '' };

    var lowerText = text.toLowerCase();
    var lowerKeywords = keywords.toLowerCase();
    var startIndex = lowerText.indexOf(lowerKeywords);

    if (startIndex === -1) {
      return { before: text, match: '', after: '' };
    }

    var endIndex = startIndex + keywords.length;

    return {
      before: text.substring(0, startIndex),
      match: text.substring(startIndex, endIndex),
      after: text.substring(endIndex)
    };
  },

  /**
   * 格式化章节代码显示
   * @param {String} code - 章节代码
   * @param {String} type - 类型（section, subsection, topic等）
   * @returns {String} 格式化后的代码
   */
  formatCode: function(code, type) {
    if (!code) return '';

    switch (type) {
      case 'section':
        return code + '.';
      case 'subsection':
        return code;
      case 'topic':
      case 'subtopic':
        return code;
      case 'appendix':
        return code;
      default:
        return code;
    }
  },

  /**
   * 获取类型中文名称
   * @param {String} type - 类型标识
   * @returns {String} 中文名称
   */
  getTypeLabel: function(type) {
    var typeMap = {
      'section': '章节',
      'subsection': '小节',
      'topic': '主题',
      'subtopic': '子主题',
      'appendix': '附录'
    };
    return typeMap[type] || '条目';
  },

  /**
   * 根据章节ID获取图标
   * @param {String} sectionId - 章节ID
   * @returns {String} Emoji图标
   */
  getSectionIcon: function(sectionId) {
    var iconMap = {
      'A': '⚠️',
      'B': '✈️',
      'C': '🛫',
      'D': '🌤️',
      'E': '⚙️',
      'F': '🛬',
      'G': '⛽',
      'APPENDIX': '📚'
    };
    return iconMap[sectionId] || '📄';
  },

  /**
   * 生成面包屑导航路径
   * @param {Object} item - 索引条目
   * @returns {Array} 面包屑路径数组
   */
  generateBreadcrumb: function(item) {
    var breadcrumb = [
      { name: '飞机性能', url: '/packagePerformance/index' }
    ];

    if (item.sectionTitle && item.type !== 'section') {
      breadcrumb.push({
        name: item.section + '. ' + item.sectionTitle,
        url: '/packagePerformance/pages/section-detail/index?id=' + item.section
      });
    }

    if (item.type === 'topic' || item.type === 'subtopic') {
      breadcrumb.push({
        name: item.code + ' ' + item.title_zh,
        url: ''
      });
    }

    return breadcrumb;
  },

  /**
   * 防抖函数（用于搜索输入）
   * @param {Function} func - 要防抖的函数
   * @param {Number} delay - 延迟时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  debounce: function(func, delay) {
    var timer = null;
    return function() {
      var context = this;
      var args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function() {
        func.apply(context, args);
      }, delay);
    };
  },

  /**
   * 截断文本（用于摘要显示）
   * @param {String} text - 原文本
   * @param {Number} maxLength - 最大长度
   * @returns {String} 截断后的文本
   */
  truncateText: function(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  /**
   * 检查是否为速度符号
   * @param {String} keyword - 关键词
   * @returns {Boolean} 是否为速度符号
   */
  isSpeedSymbol: function(keyword) {
    var speedSymbols = [
      'VMO', 'MMO', 'VMCG', 'VMCA', 'VMCL', 'VMU', 'VS', 'VS1', 'VS0',
      'V1', 'V2', 'VR', 'VREF', 'VAP', 'VMBE', 'VTIRE'
    ];
    return speedSymbols.indexOf(keyword.toUpperCase()) !== -1;
  },

  /**
   * 检查是否为重量符号
   * @param {String} keyword - 关键词
   * @returns {Boolean} 是否为重量符号
   */
  isWeightSymbol: function(keyword) {
    var weightSymbols = ['MTOW', 'MLW', 'MZFW', 'MTW'];
    return weightSymbols.indexOf(keyword.toUpperCase()) !== -1;
  },

  /**
   * 检查是否为适航规章
   * @param {String} keyword - 关键词
   * @returns {Boolean} 是否为适航规章
   */
  isRegulation: function(keyword) {
    var regex = /(CS|FAR)\s*25\.\d+/i;
    return regex.test(keyword);
  }
};

module.exports = PerformanceHelper;
