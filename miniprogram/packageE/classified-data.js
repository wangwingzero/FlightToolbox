/**
 * 分类后的规范性文件数据管理器
 * 提供按类别和子类别查询规范性文件的功能
 */

const classifier = require('./classifier.js');
const normativeData = require('./normative.js');

// 缓存分类结果
let classifiedData = null;
let lastClassificationTime = null;

/**
 * 获取分类后的数据
 * @returns {Object} 分类结果
 */
function getClassifiedData() {
  if (!classifiedData || !lastClassificationTime || 
      Date.now() - lastClassificationTime > 24 * 60 * 60 * 1000) { // 24小时缓存
    console.log('🔄 重新分类规范性文件数据...');
    classifiedData = classifier.classifyNormativeDocuments(normativeData);
    lastClassificationTime = Date.now();
  }
  return classifiedData;
}

/**
 * 获取所有类别列表
 * @returns {Array} 类别列表
 */
function getCategories() {
  const data = getClassifiedData();
  return Object.keys(data.classified_documents).map(category => ({
    name: category,
    count: data.classification_summary[category].total_documents,
    subcategories: data.classification_summary[category].subcategories
  }));
}

/**
 * 获取指定类别下的所有子类别
 * @param {string} category - 类别名称
 * @returns {Array} 子类别列表
 */
function getSubcategories(category) {
  const data = getClassifiedData();
  if (!data.classified_documents[category]) {
    return [];
  }
  
  const subcategories = Object.keys(data.classified_documents[category]).map(subcategory => ({
    name: subcategory,
    count: data.classified_documents[category][subcategory].length,
    documents: data.classified_documents[category][subcategory]
  }));
  
  // 排序：CCAR部号按数字顺序，综合文件放在最后
  subcategories.sort((a, b) => {
    const nameA = a.name;
    const nameB = b.name;
    
    // 如果是综合文件，放在最后
    if (nameA === '综合文件') return 1;
    if (nameB === '综合文件') return -1;
    
    // 如果都是CCAR部号，按数字排序
    const ccarA = nameA.match(/CCAR-(\d+)/);
    const ccarB = nameB.match(/CCAR-(\d+)/);
    
    if (ccarA && ccarB) {
      return parseInt(ccarA[1]) - parseInt(ccarB[1]);
    }
    
    // 其他情况按字母顺序
    return nameA.localeCompare(nameB);
  });
  
  return subcategories;
}

/**
 * 获取指定类别和子类别下的所有文档
 * @param {string} category - 类别名称
 * @param {string} subcategory - 子类别名称
 * @returns {Array} 文档列表
 */
function getDocuments(category, subcategory) {
  const data = getClassifiedData();
  if (!data.classified_documents[category] || 
      !data.classified_documents[category][subcategory]) {
    return [];
  }
  
  return data.classified_documents[category][subcategory];
}

/**
 * 搜索文档
 * @param {string} keyword - 搜索关键词
 * @param {string} category - 可选，限定类别
 * @param {string} subcategory - 可选，限定子类别
 * @returns {Array} 匹配的文档列表
 */
function searchDocuments(keyword, category = null, subcategory = null) {
  const data = getClassifiedData();
  const results = [];
  const keywordLower = keyword.toLowerCase();
  
  const searchInCategory = (categoryName, categoryData) => {
    if (category && categoryName !== category) return;
    
    Object.entries(categoryData).forEach(([subName, documents]) => {
      if (subcategory && subName !== subcategory) return;
      
      documents.forEach(doc => {
        const titleMatch = doc.title.toLowerCase().includes(keywordLower);
        const docNumberMatch = doc.doc_number && doc.doc_number.toLowerCase().includes(keywordLower);
        const officeMatch = doc.office_unit && doc.office_unit.toLowerCase().includes(keywordLower);
        
        if (titleMatch || docNumberMatch || officeMatch) {
          results.push({
            ...doc,
            category: categoryName,
            subcategory: subName,
            matchType: titleMatch ? 'title' : (docNumberMatch ? 'doc_number' : 'office_unit'),
            type: 'document'
          });
        }
      });
    });
  };
  
  Object.entries(data.classified_documents).forEach(([categoryName, categoryData]) => {
    searchInCategory(categoryName, categoryData);
  });
  
  return results;
}

/**
 * 综合搜索：同时搜索CCAR规章和规范性文件
 * @param {string} keyword - 搜索关键词
 * @returns {Array} 匹配的结果列表，包含CCAR规章和规范性文件
 */
function searchAll(keyword) {
  const results = [];
  const keywordLower = keyword.toLowerCase();
  
  // 1. 搜索CCAR规章
  if (classifier && classifier.CCAR_CATEGORY_MAP) {
    Object.entries(classifier.CCAR_CATEGORY_MAP).forEach(([ccarNumber, ccarInfo]) => {
      const ccarTitle = `CCAR-${ccarNumber} - ${ccarInfo.name}`;
      const ccarDescription = `中国民用航空规章第${ccarNumber}部`;
      
      const titleMatch = ccarTitle.toLowerCase().includes(keywordLower);
      const numberMatch = ccarNumber.includes(keywordLower);
      const nameMatch = ccarInfo.name.toLowerCase().includes(keywordLower);
      const categoryMatch = ccarInfo.category.toLowerCase().includes(keywordLower);
      
      if (titleMatch || numberMatch || nameMatch || categoryMatch) {
        results.push({
          title: ccarTitle,
          description: ccarDescription,
          category: ccarInfo.category,
          subcategory: `CCAR-${ccarNumber}`,
          ccar_number: ccarNumber,
          url: `https://www.caac.gov.cn/XXGK/XXGK/MHGZ/CCAR${ccarNumber}/`,
          type: 'ccar',
          matchType: titleMatch ? 'title' : (numberMatch ? 'number' : (nameMatch ? 'name' : 'category'))
        });
      }
    });
  }
  
  // 2. 搜索规范性文件
  const documentResults = searchDocuments(keyword);
  results.push(...documentResults);
  
  // 3. 按相关性和文号类型排序
  results.sort((a, b) => {
    // CCAR规章优先
    if (a.type === 'ccar' && b.type !== 'ccar') return -1;
    if (a.type !== 'ccar' && b.type === 'ccar') return 1;
    
    // 如果都是规范性文件，按文号类型和发布时间排序
    if (a.type === 'document' && b.type === 'document') {
      // 提取文号前缀（AC、IB、MD等）
      const getDocPrefix = (docNumber) => {
        if (!docNumber) return 'ZZZ'; // 无文号的排在最后
        const match = docNumber.match(/^([A-Z]+)/);
        return match ? match[1] : 'ZZZ';
      };
      
      const prefixA = getDocPrefix(a.doc_number);
      const prefixB = getDocPrefix(b.doc_number);
      
      // 先按文号前缀排序
      if (prefixA !== prefixB) {
        return prefixA.localeCompare(prefixB);
      }
      
      // 相同文号前缀内，按发布时间倒序（最新的在前）
      const dateA = new Date(a.publish_date || a.sign_date || '1900-01-01');
      const dateB = new Date(b.publish_date || b.sign_date || '1900-01-01');
      return dateB - dateA;
    }
    
    // 标题匹配优先（仅在同类型内）
    if (a.matchType === 'title' && b.matchType !== 'title') return -1;
    if (a.matchType !== 'title' && b.matchType === 'title') return 1;
    
    return 0;
  });
  
  return results;
}

/**
 * 获取分类统计信息
 * @returns {Object} 统计信息
 */
function getStatistics() {
  const data = getClassifiedData();
  return {
    total_documents: data.total_documents,
    total_categories: Object.keys(data.classified_documents).length,
    classification_methods: data.statistics,
    last_update: data.timestamp,
    categories_summary: data.classification_summary
  };
}

/**
 * 获取最近更新的文档
 * @param {number} limit - 返回数量限制，默认10
 * @returns {Array} 最近更新的文档列表
 */
function getRecentDocuments(limit = 10) {
  const data = getClassifiedData();
  const allDocuments = [];
  
  // 收集所有文档
  Object.entries(data.classified_documents).forEach(([category, subcategories]) => {
    Object.entries(subcategories).forEach(([subcategory, documents]) => {
      documents.forEach(doc => {
        allDocuments.push({
          ...doc,
          category,
          subcategory
        });
      });
    });
  });
  
  // 按发布日期排序
  allDocuments.sort((a, b) => {
    const dateA = new Date(a.publish_date || a.sign_date || '1900-01-01');
    const dateB = new Date(b.publish_date || b.sign_date || '1900-01-01');
    return dateB - dateA;
  });
  
  return allDocuments.slice(0, limit);
}

/**
 * 按CCAR部号获取相关文档
 * @param {string} ccarNumber - CCAR部号，如 "121", "91"
 * @returns {Object} 包含CCAR规章和相关规范性文件
 */
function getDocumentsByCCAR(ccarNumber) {
  const data = getClassifiedData();
  const results = {
    ccar_number: ccarNumber,
    ccar_info: classifier.CCAR_CATEGORY_MAP[ccarNumber] || null,
    normative_documents: [],
    related_documents: []
  };
  
  // 查找精确匹配的规范性文件
  Object.entries(data.classified_documents).forEach(([category, subcategories]) => {
    Object.entries(subcategories).forEach(([subcategory, documents]) => {
      documents.forEach(doc => {
        if (doc.classification && doc.classification.ccarNumber === ccarNumber) {
          results.normative_documents.push({
            ...doc,
            category,
            subcategory
          });
        }
      });
    });
  });
  
  // 查找相关文档（同类别下的其他文档）
  if (results.ccar_info) {
    const targetCategory = results.ccar_info.category;
    const targetSubcategory = results.ccar_info.subcategory;
    
    if (data.classified_documents[targetCategory] && 
        data.classified_documents[targetCategory][targetSubcategory]) {
      results.related_documents = data.classified_documents[targetCategory][targetSubcategory]
        .filter(doc => !doc.classification || doc.classification.ccarNumber !== ccarNumber)
        .map(doc => ({
          ...doc,
          category: targetCategory,
          subcategory: targetSubcategory
        }));
    }
  }
  
  return results;
}

/**
 * 导出分类数据为JSON格式
 * @param {boolean} includeFullData - 是否包含完整文档数据
 * @returns {Object} 导出的数据
 */
function exportClassifiedData(includeFullData = false) {
  const data = getClassifiedData();
  
  if (!includeFullData) {
    // 只导出结构和统计信息
    return {
      timestamp: data.timestamp,
      total_documents: data.total_documents,
      classification_summary: data.classification_summary,
      statistics: data.statistics
    };
  }
  
  return data;
}

/**
 * 获取分类方法的详细说明
 * @returns {Object} 分类方法说明
 */
function getClassificationMethodInfo() {
  return {
    exact_match: {
      name: '精确匹配',
      description: '通过文档编号中的CCAR部号进行精确分类',
      confidence: 'high',
      examples: ['AC-121-FS-139 → CCAR-121', 'AP-91-FS-2025-02R1 → CCAR-91']
    },
    fuzzy_match: {
      name: '模糊匹配',
      description: '通过负责司局和标题关键词进行模糊分类',
      confidence: 'medium',
      examples: ['飞行标准司 + "驾驶员" → 航空人员类', '机场司 + "机场" → 机场类']
    },
    manual_required: {
      name: '需要手动分类',
      description: '无法通过自动化规则分类，需要人工干预',
      confidence: 'low',
      examples: ['文号为空且标题过于宽泛的文档']
    }
  };
}

/**
 * 清除分类缓存，强制重新分类
 */
function clearClassificationCache() {
  console.log('🗑️ 清除分类缓存...');
  classifiedData = null;
  lastClassificationTime = null;
}

module.exports = {
  getClassifiedData,
  getCategories,
  getSubcategories,
  getDocuments,
  searchDocuments,
  searchAll,
  getStatistics,
  getRecentDocuments,
  getDocumentsByCCAR,
  exportClassifiedData,
  getClassificationMethodInfo,
  clearClassificationCache
}; 