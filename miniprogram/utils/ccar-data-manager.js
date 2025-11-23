/**
 * CCAR规章数据管理器 - 清理版本
 * 专为packageCCAR分包设计的数据管理工具
 * 严格遵循ES5语法，确保小程序兼容性
 * 移除所有调试日志，提升性能
 */

/**
 * CCAR数据管理器
 */
var CCARDataManager = {
  // 缓存数据
  _regulationData: null,
  _normativeData: null,
  _classificationData: null,

  /**
   * 获取分类名称列表
   */
  getCategoryNames: function() {
    return [
      '行政程序规则(1-20部)',
      '航空器(21-59部)',
      '航空人员(60-70部)',
      '空域、导航设施、空中交通规则和一般运行规则(71-120部)',
      '民用航空企业合格审定及运行(121-139部)',
      '学校、非航空人员及其他单位的合格审定及运行(140-149部)',
      '民用机场建设和管理(150-179部)',
      '委任代表规则(180-189部)',
      '航空保险(190-199部)',
      '综合管理规则(201-250部)',
      '航空基金(251-270部)',
      '航空运输规则(271-325部)',
      '航空保安(326-355部)',
      '科技和计量标准(356-390部)',
      '航空器搜寻援救和事故调查(391-400部)'
    ];
  },

  /**
   * 生成分类数据（供categories页面使用）
   * @param {Array} regulationData - 规章数据
   * @param {Array} normativeData - 规范性文件数据
   * @returns {Array} - 分类列表
   */
  generateCategories: function(regulationData, normativeData) {
    try {
      this._regulationData = regulationData || [];
      this._normativeData = normativeData || [];

      var categoryNames = this.getCategoryNames();
      var categories = [];

      // 为每个分类生成统计信息
      for (var i = 0; i < categoryNames.length; i++) {
        var categoryName = categoryNames[i];
        var categoryData = this._getRegulationsByCategory(categoryName);
        var normativeCount = this._getNormativesByCategory(categoryName);

        categories.push({
          name: categoryName,
          category: categoryName,
          regulationCount: categoryData.length,
          normativeCount: normativeCount.length,
          description: this._getCategoryDescription(categoryName),
          firstChar: this._getCategoryFirstChar(categoryName)
        });
      }

      this._classificationData = categories;
      return categories;
    } catch (error) {
      console.error('❌ 生成分类失败:', error);
      return [];
    }
  },

  /**
   * 根据分类过滤规章
   * @param {Array} regulationData - 规章数据
   * @param {string} category - 分类名称
   * @param {string} subcategory - 子分类名称
   * @returns {Array} - 过滤后的规章列表
   */
  filterRegulationsByCategory: function(regulationData, category, subcategory) {
    try {
      if (!regulationData || regulationData.length === 0) {
        return [];
      }

      // 如果没有指定分类，返回所有数据
      if (!category) {
        return regulationData;
      }

      var filtered = this._getRegulationsByCategory(category, regulationData);
      return filtered;
    } catch (error) {
      console.error('❌ 按分类过滤规章失败:', error);
      return [];
    }
  },

  /**
   * 根据规章获取相关的规范性文件
   * @param {string} docNumber - 规章编号
   * @param {Array} normativeData - 规范性文件数据
   * @returns {Array} - 相关的规范性文件
   */
  getNormativesByRegulation: function(docNumber, normativeData) {
    try {
      if (!docNumber || !normativeData) {
        return [];
      }

      // 提取CCAR编号用于匹配
      var ccarNumber = this._extractCCARNumber(docNumber);
      
      var matchedFiles = normativeData.filter(function(item) {
        if (!item.doc_number) return false;
        
        // 尝试多种匹配方式
        var itemCcarNumber = this._extractCCARNumber(item.doc_number);
        
        // 1. CCAR编号精确匹配
        if (ccarNumber && itemCcarNumber && ccarNumber === itemCcarNumber) {
          return true;
        }
        
        // 2. 文档编号包含匹配（忽略大小写）
        if (item.doc_number.toLowerCase().includes(docNumber.toLowerCase())) {
          return true;
        }
        
        // 3. 如果是CCAR开头的规章，尝试匹配相关的AC、AP等文档
        if (ccarNumber && docNumber.match(/^CCAR/i)) {
          // 匹配AC-XX、AP-XX等格式，其中XX是CCAR编号
          var relatedPattern = new RegExp('(AC|AP|IB|MD)[_\\-]?' + ccarNumber + '[_\\-]', 'i');
          if (item.doc_number.match(relatedPattern)) {
            return true;
          }
        }
        
        // 4. 特殊处理：如果规章编号包含部分匹配
        // 例如：CCAR-21-R4 应该能匹配到 AC-21-xxx、AP-21-xxx等
        if (ccarNumber) {
          var ccarPart = '-' + ccarNumber + '-';
          var itemPart = item.doc_number.replace(/[_]/g, '-');
          if (itemPart.includes(ccarPart)) {
            return true;
          }
        }
        
        return false;
      }.bind(this));
      
      return matchedFiles;
    } catch (error) {
      console.error('❌ 获取规范性文件失败:', error);
      return [];
    }
  },

  /**
   * 获取指定分类的规章
   * @private
   * @param {string} category - 分类名称
   * @param {Array} regulationData - 规章数据（可选）
   * @returns {Array} - 该分类的规章列表
   */
  _getRegulationsByCategory: function(category, regulationData) {
    var data = regulationData || this._regulationData || [];
    
    var categoryMapping = this._getCCARCategoryMapping();
    var matchedRegulations = [];
    
    for (var i = 0; i < data.length; i++) {
      var regulation = data[i];
      if (!regulation.doc_number) {
        continue;
      }
      
      var ccarNumber = this._extractCCARNumber(regulation.doc_number);
      if (!ccarNumber) {
        continue;
      }
      
      var mapping = categoryMapping[ccarNumber];
      if (!mapping) {
        continue;
      }
      
      if (mapping.category === category) {
        matchedRegulations.push(regulation);
      }
    }
    
    return matchedRegulations;
  },

  /**
   * 获取指定分类的规范性文件数量（返回数组形式）
   * @private
   * @param {string} category - 分类名称
   * @returns {Array} - 该分类的规范性文件列表
   */
  _getNormativesByCategory: function(category) {
    var data = this._normativeData || [];
    var count = 0;
    
    // 获取该分类下的所有CCAR编号
    var categoryMapping = this._getCCARCategoryMapping();
    var ccarNumbers = [];
    
    for (var key in categoryMapping) {
      if (categoryMapping[key].category === category) {
        ccarNumbers.push(key);
      }
    }
    
    // 统计该分类下的规范性文件
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      if (!item.doc_number) continue;
      
      var ccarNumber = this._extractCCARNumber(item.doc_number);
      if (ccarNumber && ccarNumbers.indexOf(ccarNumber) !== -1) {
        count++;
      }
    }
    
    // 返回一个表示数量的数组
    return new Array(count);
  },

  /**
   * 获取分类描述
   * @private
   * @param {string} categoryName - 分类名称
   * @returns {string} - 分类描述
   */
  _getCategoryDescription: function(categoryName) {
    var descriptions = {
      '行政程序规则(1-20部)': '民航行政程序及基础性规则',
      '航空器(21-59部)': '航空器设计、制造、适航及相关技术要求',
      '航空人员(60-70部)': '航空人员执照、训练与运行管理',
      '空域、导航设施、空中交通规则和一般运行规则(71-120部)': '空域管理、导航设施和一般运行规则',
      '民用航空企业合格审定及运行(121-139部)': '航空承运人及维修单位合格审定和运行管理',
      '学校、非航空人员及其他单位的合格审定及运行(140-149部)': '培训机构及其他单位合格审定与运行',
      '民用机场建设和管理(150-179部)': '机场规划、建设、运行与管理要求',
      '委任代表规则(180-189部)': '委任代表的资格、职责及管理',
      '航空保险(190-199部)': '航空保险与赔偿相关规则',
      '综合管理规则(201-250部)': '民航综合管理与通用性管理规则',
      '航空基金(251-270部)': '航空基金的设立与管理',
      '航空运输规则(271-325部)': '航空运输运行与市场管理规则',
      '航空保安(326-355部)': '航空安全保卫与防范要求',
      '科技和计量标准(356-390部)': '民航科技、计量与标准化管理',
      '航空器搜寻援救和事故调查(391-400部)': '航空器搜寻援救与事故调查程序'
    };

    return descriptions[categoryName] || '相关规章制度';
  },

  /**
   * 获取分类显示用首字符
   * @private
   * @param {string} categoryName - 分类名称
   * @returns {string} - 首个有效字符
   */
  _getCategoryFirstChar: function(categoryName) {
    if (!categoryName || typeof categoryName !== 'string') {
      return '?';
    }

    var text = categoryName.replace(/^\s+|\s+$/g, '');
    if (!text) {
      return '?';
    }

    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch !== ' ' && ch !== '（' && ch !== '(') {
        return ch;
      }
    }

    return text.charAt(0);
  },

  /**
   * 提取CCAR编号
   * @private
   * @param {string} docNumber - 文档编号
   * @returns {string|null} - 提取的CCAR编号
   */
  _extractCCARNumber: function(docNumber) {
    if (!docNumber || typeof docNumber !== 'string') {
      return null;
    }
    
    // 先处理特殊字符问题，将中文破折号替换为英文连字符
    var normalizedDocNumber = docNumber.replace(/–/g, '-');
    
    // 匹配CCAR-数字格式，支持多种变体
    var ccarMatch = normalizedDocNumber.match(/CCAR[_\-]?(\d+)/i);
    if (ccarMatch && ccarMatch[1]) {
      return ccarMatch[1];
    }
    
    // 匹配AC-数字格式（咨询通告）
    var acMatch = normalizedDocNumber.match(/AC[_\-]?(\d+)/i);
    if (acMatch && acMatch[1]) {
      return acMatch[1];
    }
    
    // 匹配AP-数字格式（审定程序）
    var apMatch = normalizedDocNumber.match(/AP[_\-]?(\d+)/i);
    if (apMatch && apMatch[1]) {
      return apMatch[1];
    }
    
    // 匹配IB-数字格式（信息通告）
    var ibMatch = normalizedDocNumber.match(/IB[_\-]?[A-Z]*[_\-]?(\d+)/i);
    if (ibMatch && ibMatch[1]) {
      // 对于IB类型，尝试从后续部分提取CCAR编号
      var ccarPart = normalizedDocNumber.match(/(\d+)[_\-]/);
      if (ccarPart && ccarPart[1]) {
        return ccarPart[1];
      }
    }
    
    // 匹配MD-数字格式（管理文件）
    var mdMatch = normalizedDocNumber.match(/MD[_\-]?[A-Z]*[_\-]?(\d+)/i);
    if (mdMatch && mdMatch[1]) {
      // 对于MD类型，尝试从文档编号推断CCAR编号
      var ccarPart = normalizedDocNumber.match(/(\d{2,3})[_\-]/);
      if (ccarPart && ccarPart[1]) {
        return ccarPart[1];
      }
    }
    
    // 匹配MH/T格式（民航行业标准）
    var mhMatch = normalizedDocNumber.match(/MH\/T\s*(\d+)/i);
    if (mhMatch && mhMatch[1]) {
      // MH/T标准通常与机场相关，返回机场类的CCAR编号
      return '139'; // 默认归类到机场相关
    }
    
    return null;
  },

  /**
   * 获取CCAR分类映射表
   * @private
   * @returns {Object} - CCAR分类映射
   */
  _getCCARCategoryMapping: function() {
    var mapping = {};

    var ranges = [
      { name: '行政程序规则(1-20部)', start: 1, end: 20 },
      { name: '航空器(21-59部)', start: 21, end: 59 },
      { name: '航空人员(60-70部)', start: 60, end: 70 },
      { name: '空域、导航设施、空中交通规则和一般运行规则(71-120部)', start: 71, end: 120 },
      { name: '民用航空企业合格审定及运行(121-139部)', start: 121, end: 139 },
      { name: '学校、非航空人员及其他单位的合格审定及运行(140-149部)', start: 140, end: 149 },
      { name: '民用机场建设和管理(150-179部)', start: 150, end: 179 },
      { name: '委任代表规则(180-189部)', start: 180, end: 189 },
      { name: '航空保险(190-199部)', start: 190, end: 199 },
      { name: '综合管理规则(201-250部)', start: 201, end: 250 },
      { name: '航空基金(251-270部)', start: 251, end: 270 },
      { name: '航空运输规则(271-325部)', start: 271, end: 325 },
      { name: '航空保安(326-355部)', start: 326, end: 355 },
      { name: '科技和计量标准(356-390部)', start: 356, end: 390 },
      { name: '航空器搜寻援救和事故调查(391-400部)', start: 391, end: 400 }
    ];

    // 根据区间填充映射表
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      for (var num = range.start; num <= range.end; num++) {
        mapping[String(num)] = { category: range.name };
      }
    }

    // 特殊补充：部分超出 400 但与事故调查等相关的部号，归入最后一类
    mapping['420'] = { category: '航空器搜寻援救和事故调查(391-400部)' };

    return mapping;
  }
};

module.exports = CCARDataManager;