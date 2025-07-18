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
    
    // 优先加载normative.js数据（1308个规范性文件）
    let documentsToClassify = [];
    try {
      const normativeData = require('./normative.js');
      // 使用normativeData数组
      if (normativeData && normativeData.normativeData) {
        documentsToClassify = normativeData.normativeData;
        console.log(`📋 成功加载normative.js，共 ${documentsToClassify.length} 个规范性文件`);
      } else if (normativeData && normativeData.data) {
        documentsToClassify = normativeData.data;
        console.log(`📋 成功加载normative.js（兼容格式），共 ${documentsToClassify.length} 个规范性文件`);
      } else if (normativeData && Array.isArray(normativeData)) {
        documentsToClassify = normativeData;
        console.log(`📋 成功加载normative.js（数组格式），共 ${documentsToClassify.length} 个规范性文件`);
      } else {
        console.log('⚠️ normative.js格式不匹配，尝试使用regulation.js作为兜底');
        // 兜底：尝试使用regulation.js
        const regulationData = require('./regulation.js');
        if (regulationData && regulationData.regulationData) {
          documentsToClassify = regulationData.regulationData;
          console.log(`📋 兜底使用regulation.js，共 ${documentsToClassify.length} 个规章`);
        }
      }
    } catch (error) {
      console.log('⚠️ 加载normative.js失败，尝试使用regulation.js作为兜底:', error.message);
      // 兜底：使用regulation.js
      try {
        const regulationData = require('./regulation.js');
        if (regulationData && regulationData.regulationData) {
          documentsToClassify = regulationData.regulationData;
          console.log(`📋 兜底使用regulation.js，共 ${documentsToClassify.length} 个规章`);
        }
      } catch (fallbackError) {
        console.error('❌ 无法加载任何数据文件:', fallbackError.message);
      }
    }
    
    if (documentsToClassify.length === 0) {
      console.error('❌ 没有找到可分类的文档数据');
      return { classified_documents: {}, classification_summary: {} };
    }
    
    console.log(`📊 开始分类 ${documentsToClassify.length} 个文档...`);
    
    // 包装为classifier期望的格式
    const dataToClassify = { documents: documentsToClassify };
    classifiedData = classifier.classifyNormativeDocuments(dataToClassify);
    lastClassificationTime = Date.now();
    
    console.log('✅ 文档分类完成');
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

  // 异步加载regulation.js获取完整的标题信息
  let regulationDocuments = null;
  try {
    const regulationData = require('./regulation.js');
    // 新格式：获取regulationData数组
    if (regulationData && regulationData.regulationData) {
      regulationDocuments = regulationData.regulationData;
    } else if (regulationData && Array.isArray(regulationData)) {
      regulationDocuments = regulationData;
    } else if (regulationData && regulationData.documents) {
      // 兼容旧格式
      regulationDocuments = regulationData.documents;
    }
  } catch (error) {
    console.log('无法加载regulation.js，使用默认显示格式');
  }

  const subcategories = Object.keys(data.classified_documents[category]).map(subcategory => {
    let displayName = subcategory; // 默认显示名称
    
    // 如果是CCAR格式的子类别，尝试从regulation.js中获取完整信息
    if (subcategory.startsWith('CCAR-') && regulationDocuments && Array.isArray(regulationDocuments)) {
      const ccarMatch = subcategory.match(/CCAR-(\d+)/);
      if (ccarMatch) {
        const ccarNumber = ccarMatch[1];
        
        // 在regulation.js中查找匹配的文档
        const matchingDoc = regulationDocuments.find(doc => 
          doc.doc_number && doc.doc_number.includes(`CCAR-${ccarNumber}`)
        );
        
        if (matchingDoc && matchingDoc.title) {
          displayName = `${matchingDoc.doc_number} ${matchingDoc.title}`;
        }
      }
    }
    
    return {
      name: subcategory, // 保持原始名称用于数据查询
      displayName: displayName, // 新增显示名称字段
      count: data.classified_documents[category][subcategory].length,
      documents: data.classified_documents[category][subcategory]
    };
  });

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
        let titleMatch = false;
        let docNumberMatch = false;
        let officeMatch = false;
        
        // 对于短关键词（3个字符以下），要求更精确的匹配
        if (keywordLower.length <= 3) {
          // 对于"AR"这样的短关键词，要求是单词边界或独立的缩写
          const wordBoundaryRegex = new RegExp(`\\b${keywordLower}\\b`, 'i');
          titleMatch = doc.title && wordBoundaryRegex.test(doc.title.toLowerCase());
          docNumberMatch = doc.doc_number && wordBoundaryRegex.test(doc.doc_number.toLowerCase());
          officeMatch = doc.office_unit && wordBoundaryRegex.test(doc.office_unit.toLowerCase());
        } else {
          // 对于较长关键词，可以使用包含匹配
          titleMatch = doc.title && doc.title.toLowerCase().includes(keywordLower);
          docNumberMatch = doc.doc_number && doc.doc_number.toLowerCase().includes(keywordLower);
          officeMatch = doc.office_unit && doc.office_unit.toLowerCase().includes(keywordLower);
        }
        
        if (titleMatch || docNumberMatch || officeMatch) {
          results.push({
            ...doc,
            category: categoryName,
            subcategory: subName,
            matchType: titleMatch ? 'title' : (docNumberMatch ? 'doc_number' : 'office_unit'),
            type: 'document',
            validity: doc.validity || doc.status || '未知状态' // 添加有效性状态，支持多种字段名
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
 * 搜索所有类型的文档（CCAR规章和规范性文件）
 * @param {string} keyword - 搜索关键词
 * @returns {Array} 搜索结果数组
 */
function searchAll(keyword) {
  const results = [];
  const keywordLower = keyword.toLowerCase();
  
  // 1. 搜索CCAR规章
  if (classifier && classifier.CCAR_CATEGORY_MAP) {
    // 预先加载regulation.js数据以获取正确的URL
    let regulationDocuments = null;
    try {
      const regulationData = require('./regulation.js');
      if (regulationData && regulationData.regulationData) {
        regulationDocuments = regulationData.regulationData;
      } else if (regulationData && Array.isArray(regulationData)) {
        regulationDocuments = regulationData;
      } else if (regulationData && regulationData.documents) {
        regulationDocuments = regulationData.documents;
      }
    } catch (error) {
      console.log('🔍 搜索时无法加载regulation.js，使用默认URL格式');
    }
    
    Object.entries(classifier.CCAR_CATEGORY_MAP).forEach(([ccarNumber, ccarInfo]) => {
      const ccarTitle = `CCAR-${ccarNumber} - ${ccarInfo.name}`;
      const ccarDescription = `中国民用航空规章第${ccarNumber}部`;
      
      // 更精确的匹配逻辑，避免短关键词误匹配
      let titleMatch = false;
      let numberMatch = false;
      let nameMatch = false;
      let categoryMatch = false;
      
      // 对于短关键词（3个字符以下），要求更精确的匹配
      if (keywordLower.length <= 3) {
        // 对于"AR"这样的短关键词，要求是单词边界或独立的缩写
        const wordBoundaryRegex = new RegExp(`\\b${keywordLower}\\b`, 'i');
        titleMatch = wordBoundaryRegex.test(ccarTitle.toLowerCase());
        numberMatch = wordBoundaryRegex.test(ccarNumber);
        nameMatch = wordBoundaryRegex.test(ccarInfo.name.toLowerCase());
        categoryMatch = wordBoundaryRegex.test(ccarInfo.category.toLowerCase());
      } else {
        // 对于较长关键词，可以使用包含匹配
        titleMatch = ccarTitle.toLowerCase().includes(keywordLower);
        numberMatch = ccarNumber.includes(keywordLower);
        nameMatch = ccarInfo.name.toLowerCase().includes(keywordLower);
        categoryMatch = ccarInfo.category.toLowerCase().includes(keywordLower);
      }
      
      if (titleMatch || numberMatch || nameMatch || categoryMatch) {
        // 🔧 从regulation.js获取正确的URL，而不是使用默认格式
        let correctUrl = `https://www.caac.gov.cn/XXGK/XXGK/MHGZ/CCAR${ccarNumber}/`; // 默认URL
        let fullDocNumber = `CCAR-${ccarNumber}`;
        
        if (regulationDocuments && Array.isArray(regulationDocuments)) {
          // 在regulation.js中查找对应的CCAR文档
          const matchingDoc = regulationDocuments.find(doc => 
            doc.doc_number && doc.doc_number.includes(`CCAR-${ccarNumber}`)
          );
          
          if (matchingDoc) {
            if (matchingDoc.url) {
              correctUrl = matchingDoc.url;
              console.log(`✅ 搜索时找到CCAR-${ccarNumber}的正确URL:`, correctUrl);
            }
            if (matchingDoc.doc_number) {
              fullDocNumber = matchingDoc.doc_number;
            }
          }
        }
        
        results.push({
          title: `${fullDocNumber} - ${ccarInfo.name}`,
          description: ccarDescription,
          category: ccarInfo.category,
          subcategory: `CCAR-${ccarNumber}`,
          ccar_number: ccarNumber,
          doc_number: fullDocNumber,
          url: correctUrl, // 使用从regulation.js获取的正确URL
          type: 'ccar',
          validity: matchingDoc ? matchingDoc.validity : '未知状态', // 添加有效性状态
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