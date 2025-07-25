/**
 * 规范性文件分类器 - 重构版本
 * 将硬编码数据提取到配置文件，简化分类逻辑
 * 优化性能和可维护性
 */

// 加载配置数据
var ccarMapping = require('./config/ccar-mapping.json');
var officeMapping = require('./config/office-mapping.json');
var keywordMapping = require('./config/keyword-mapping.json');

/**
 * 配置加载器 - 统一管理分类配置
 */
var ClassifierConfig = {
  // 缓存已加载的配置
  _ccarMap: null,
  _officeMap: null,
  _keywordMap: null,
  
  /**
   * 获取CCAR映射表
   */
  getCCARMapping: function() {
    if (!this._ccarMap) {
      this._ccarMap = ccarMapping;
    }
    return this._ccarMap;
  },
  
  /**
   * 获取司局映射表
   */
  getOfficeMapping: function() {
    if (!this._officeMap) {
      this._officeMap = officeMapping;
    }
    return this._officeMap;
  },
  
  /**
   * 获取关键词映射表
   */
  getKeywordMapping: function() {
    if (!this._keywordMap) {
      this._keywordMap = keywordMapping;
    }
    return this._keywordMap;
  }
};

/**
 * 规则引擎 - 分离业务逻辑和数据
 */
var ClassificationRules = {
  
  /**
   * 从文档编号中提取CCAR部号
   * @param {string} docNumber - 文档编号
   * @returns {string|null} - 提取的部号
   */
  extractCCARNumber: function(docNumber) {
    if (!docNumber || typeof docNumber !== 'string') {
      return null;
    }

    var patterns = [
      /^(?:AC|AP|IB|MD)-(\d+)-/i,
      /^(?:AC|AP|IB|MD)-(\d+)(?:[A-Z]*)-/i,
      /^(?:AC|AP|IB|MD)-(\d+)$/i,
      /CCAR-(\d+)/i
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = docNumber.match(patterns[i]);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  },

  /**
   * 精确匹配 - 按CCAR部号匹配
   * @param {string} docNumber - 文档编号
   * @returns {Object|null} - 匹配结果
   */
  exactMatch: function(docNumber) {
    var ccarNumber = this.extractCCARNumber(docNumber);
    if (!ccarNumber) return null;
    
    var mapping = ClassifierConfig.getCCARMapping();
    var key = 'CCAR-' + ccarNumber;
    
    if (mapping[key]) {
      return {
        category: mapping[key].category,
        subcategory: mapping[key].subcategory,
        subcategoryName: mapping[key].name,
        method: 'exact_match',
        confidence: 'high',
        ccarNumber: ccarNumber
      };
    }
    return null;
  },

  /**
   * 司局匹配 - 按负责司局匹配可能的分类
   * @param {string} officeUnit - 负责司局
   * @returns {Array|null} - 可能的分类列表
   */
  matchByOffice: function(officeUnit) {
    if (!officeUnit) return null;
    
    var officeMap = ClassifierConfig.getOfficeMapping();
    for (var office in officeMap) {
      if (officeUnit.includes(office)) {
        return officeMap[office];
      }
    }
    return null;
  },

  /**
   * 关键词匹配 - 按标题内容匹配
   * @param {string} title - 文档标题
   * @param {Array} candidateCategories - 候选分类（来自司局匹配）
   * @returns {string|null} - 匹配的分类
   */
  matchByKeywords: function(title, candidateCategories) {
    if (!title) return null;
    
    var titleLower = title.toLowerCase();
    var keywordMap = ClassifierConfig.getKeywordMapping();
    
    // 如果有候选分类，优先在候选中匹配
    if (candidateCategories && candidateCategories.length > 0) {
      for (var i = 0; i < candidateCategories.length; i++) {
        var category = candidateCategories[i];
        var keywords = keywordMap[category] || [];
        
        for (var j = 0; j < keywords.length; j++) {
          if (titleLower.includes(keywords[j].toLowerCase())) {
            return category;
          }
        }
      }
    }
    
    // 全局关键词匹配
    for (var category in keywordMap) {
      var keywords = keywordMap[category];
      for (var k = 0; k < keywords.length; k++) {
        if (titleLower.includes(keywords[k].toLowerCase())) {
          return category;
        }
      }
    }
    
    return null;
  },

  /**
   * 特殊规则处理 - 处理复杂的分类逻辑
   * @param {string} officeUnit - 负责司局
   * @param {string} title - 文档标题
   * @param {string} docNumber - 文档编号
   * @returns {string|null} - 匹配的分类
   */
  applySpecialRules: function(officeUnit, title, docNumber) {
    var docLower = (docNumber || '').toLowerCase();
    var titleLower = (title || '').toLowerCase();
    
    // 飞行标准司特殊处理
    if (officeUnit && officeUnit.includes('飞行标准司')) {
      // IB-FS-OPS类文档明确是运行类
      if (docLower.includes('ib-fs-ops') || docLower.includes('ac-91-fs')) {
        return '运行';
      }
      
      // IB-FS-MED类文档需要特殊判断
      if (docLower.includes('ib-fs-med')) {
        var operationKeywords = ['病媒生物', '防制', '蚊虫', '鼠类', '航空器'];
        var hasOperationKeyword = operationKeywords.some(function(keyword) {
          return titleLower.includes(keyword);
        });
        
        if (hasOperationKeyword && (titleLower.includes('防制') || titleLower.includes('消毒'))) {
          return '运行';
        }
        return '航空人员';
      }
      
      // AC-67FS类文档明确是航空人员医学类
      if (docLower.includes('ac-67fs')) {
        return '航空人员';
      }
    }
    
    // 危险品相关特殊处理
    var dangerousGoodsPatterns = ['ac-276', 'ap-276', 'ac-395', 'ac-396', 'ac-398', 'ac-399'];
    if (dangerousGoodsPatterns.some(function(pattern) { return docLower.includes(pattern); })) {
      return '安全、安保与事故调查';
    }
    
    return null;
  }
};

/**
 * 主分类器
 */
var DocumentClassifier = {
  
  /**
   * 对单个规范性文件进行分类
   * @param {Object} document - 规范性文件对象
   * @returns {Object} - 分类结果
   */
  classifyDocument: function(document) {
    var docNumber = document.doc_number;
    var officeUnit = document.office_unit;
    var title = document.title;
    
    // 第一步：精确匹配（按CCAR部号）
    var exactResult = ClassificationRules.exactMatch(docNumber);
    if (exactResult) {
      return exactResult;
    }
    
    // 第二步：特殊规则处理
    var specialCategory = ClassificationRules.applySpecialRules(officeUnit, title, docNumber);
    if (specialCategory) {
      return {
        category: specialCategory,
        subcategory: '综合文件',
        subcategoryName: '综合文件',
        method: 'special_rule',
        confidence: 'high',
        ccarNumber: null
      };
    }
    
    // 第三步：司局+关键词模糊匹配
    var candidateCategories = ClassificationRules.matchByOffice(officeUnit);
    var keywordCategory = ClassificationRules.matchByKeywords(title, candidateCategories);
    
    if (keywordCategory) {
      return {
        category: keywordCategory,
        subcategory: '综合文件',
        subcategoryName: '综合文件',
        method: 'fuzzy_match',
        confidence: candidateCategories && candidateCategories.length === 1 ? 'high' : 'medium',
        ccarNumber: null
      };
    }
    
    // 第四步：默认分类（兜底）
    if (candidateCategories && candidateCategories.length > 0) {
      return {
        category: candidateCategories[0],
        subcategory: '综合文件',
        subcategoryName: '综合文件',
        method: 'office_fallback',
        confidence: 'low',
        ccarNumber: null
      };
    }
    
    // 最终兜底
    return {
      category: '待分类',
      subcategory: '待分类',
      subcategoryName: '待分类',
      method: 'manual_required',
      confidence: 'low',
      ccarNumber: null
    };
  }
};

module.exports = {
  // 主要接口
  classifyDocument: DocumentClassifier.classifyDocument,
  
  // 配置访问接口（供测试和调试使用）
  getCCARMapping: ClassifierConfig.getCCARMapping,
  getOfficeMapping: ClassifierConfig.getOfficeMapping,
  getKeywordMapping: ClassifierConfig.getKeywordMapping,
  
  // 规则引擎接口（供测试使用）
  extractCCARNumber: ClassificationRules.extractCCARNumber,
  
  // 向后兼容的接口（如果其他模块有使用）
  fuzzyMatchByOfficeAndTitle: function(officeUnit, title, docNumber) {
    var candidateCategories = ClassificationRules.matchByOffice(officeUnit);
    var specialCategory = ClassificationRules.applySpecialRules(officeUnit, title, docNumber);
    if (specialCategory) return specialCategory;
    
    return ClassificationRules.matchByKeywords(title, candidateCategories);
  }
};