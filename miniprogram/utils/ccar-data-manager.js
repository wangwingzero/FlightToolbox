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
      '行政管理',
      '航空人员', 
      '航空器制造与适航',
      '维修',
      '运行',
      '机场',
      '空中交通管理',
      '安全、安保与事故调查'
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
          description: this._getCategoryDescription(categoryName)
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
   * 获取分类描述
   * @private
   * @param {string} categoryName - 分类名称
   * @returns {string} - 分类描述
   */
  _getCategoryDescription: function(categoryName) {
    var descriptions = {
      '行政管理': '民航行政管理相关规章制度',
      '航空人员': '飞行员、空乘等航空人员资质管理',
      '航空器制造与适航': '航空器设计、制造、适航认证',
      '维修': '航空器维修、检验、保障',
      '运行': '航空运行标准、运营管理',
      '机场': '机场建设、运营、管理标准',
      '空中交通管理': '空管系统、飞行程序',
      '安全、安保与事故调查': '航空安全、安保、事故调查'
    };
    
    return descriptions[categoryName] || '相关规章制度';
  },

  /**
   * 获取CCAR分类映射表
   * @private
   * @returns {Object} - CCAR分类映射
   */
  _getCCARCategoryMapping: function() {
    return {
      // 行政管理类
      '12': { category: '行政管理' },
      '13': { category: '行政管理' },
      '14': { category: '行政管理' },
      '15': { category: '行政管理' },
      '17': { category: '行政管理' },
      '18': { category: '行政管理' },
      '19': { category: '行政管理' },
      '201': { category: '行政管理' },
      '209': { category: '行政管理' },
      '212': { category: '行政管理' },
      '221': { category: '行政管理' },
      '241': { category: '行政管理' },
      '243': { category: '行政管理' },
      '246': { category: '行政管理' },
      '273': { category: '行政管理' },
      '274': { category: '行政管理' },
      '276': { category: '行政管理' },
      
      // 航空人员类
      '61': { category: '航空人员' },
      '62': { category: '航空人员' },
      '63': { category: '航空人员' },
      '64': { category: '航空人员' },
      '65': { category: '航空人员' },
      '66': { category: '航空人员' },
      '67': { category: '航空人员' },
      '183': { category: '航空人员' },
      '242': { category: '航空人员' },
      
      // 航空器制造与适航类
      '21': { category: '航空器制造与适航' },
      '23': { category: '航空器制造与适航' },
      '25': { category: '航空器制造与适航' },
      '26': { category: '航空器制造与适航' },
      '27': { category: '航空器制造与适航' },
      '28': { category: '航空器制造与适航' },
      '29': { category: '航空器制造与适航' },
      '31': { category: '航空器制造与适航' },
      '33': { category: '航空器制造与适航' },
      '34': { category: '航空器制造与适航' },
      '35': { category: '航空器制造与适航' },
      '36': { category: '航空器制造与适航' },
      '37': { category: '航空器制造与适航' },
      '38': { category: '航空器制造与适航' },
      '39': { category: '航空器制造与适航' },
      '45': { category: '航空器制造与适航' },
      '47': { category: '航空器制造与适航' },
      '49': { category: '航空器制造与适航' },
      
      // 维修类
      '43': { category: '维修' },
      '145': { category: '维修' },
      '147': { category: '维修' },
      '183': { category: '维修' },
      
      // 运行类
      '91': { category: '运行' },
      '92': { category: '运行' },
      '121': { category: '运行' },
      '135': { category: '运行' },
      '136': { category: '运行' },
      '141': { category: '运行' },
      '142': { category: '运行' },
      '203': { category: '运行' },
      '216': { category: '运行' },
      '252': { category: '运行' },
      '396': { category: '运行' },
      
      // 机场类
      '139': { category: '机场' },
      '140': { category: '机场' },
      '158': { category: '机场' },
      '245': { category: '机场' },
      
      // 空中交通管理类
      '93': { category: '空中交通管理' },
      '97': { category: '空中交通管理' },
      '171': { category: '空中交通管理' },
      '172': { category: '空中交通管理' },
      
      // 安全、安保与事故调查类
      '174': { category: '安全、安保与事故调查' },
      '175': { category: '安全、安保与事故调查' },
      '398': { category: '安全、安保与事故调查' },
      '420': { category: '安全、安保与事故调查' }
    };
  }
};

module.exports = CCARDataManager;