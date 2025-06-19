// 数据验证和自动修正工具
// 基于官方民航局文档的标准CCAR名称数据库

/**
 * 官方CCAR规章标准名称数据库
 * 数据来源：中国民用航空局官方网站 (www.caac.gov.cn)
 * 最后更新：2025年1月
 */
const OFFICIAL_CCAR_NAMES = {
  // 航空人员类
  '61': {
    officialName: '民用航空器驾驶员合格审定规则',
    currentRevision: 'CCAR-61-R5',
    category: '航空人员',
    subcategory: 'CCAR-61',
    shortName: '驾驶员合格审定',
    commonNames: ['驾驶员执照', '飞行员执照', '驾驶员规则'],
    lastVerified: '2025-01-14',
    officialUrl: 'http://www.caac.gov.cn/XXGK/XXGK/MHGZ/201812/t20181219_193580.html'
  },
  '63': {
    officialName: '民用航空器飞行机械员合格审定规则',
    currentRevision: 'CCAR-63FS-R1',
    category: '航空人员',
    subcategory: 'CCAR-63',
    shortName: '飞行机械员合格审定',
    commonNames: ['飞行机械员', '机械员执照'],
    lastVerified: '2025-01-14'
  },
  '65': {
    officialName: '飞行签派员执照管理规则',
    currentRevision: 'CCAR-65-R2',
    category: '航空人员',
    subcategory: 'CCAR-65',
    shortName: '飞行签派员执照',
    commonNames: ['签派员执照', '飞行签派'],
    lastVerified: '2025-01-14'
  },
  '66': {
    officialName: '民用航空器维修人员执照管理规则',
    currentRevision: 'CCAR-66-R2',
    category: '航空人员',
    subcategory: 'CCAR-66',
    shortName: '维修人员执照',
    commonNames: ['维修执照', '维修人员合格证'],
    lastVerified: '2025-01-14'
  },
  '67': {
    officialName: '民用航空人员体检合格证管理规则',
    currentRevision: 'CCAR-67FS-R4',
    category: '航空人员',
    subcategory: 'CCAR-67',
    shortName: '体检合格证',
    commonNames: ['体检合格证管理', '医学标准'],
    lastVerified: '2025-01-14'
  },
  
  // 运行类
  '91': {
    officialName: '一般运行和飞行规则',
    currentRevision: 'CCAR-91-R2',
    category: '运行',
    subcategory: 'CCAR-91',
    shortName: '一般运行和飞行规则',
    commonNames: ['通用飞行规则', '一般运行规则'],
    lastVerified: '2025-01-14'
  },
  '121': {
    officialName: '大型飞机公共航空运输承运人运行合格审定规则',
    currentRevision: 'CCAR-121-R5',
    category: '运行',
    subcategory: 'CCAR-121',
    shortName: '大型飞机运输运行',
    commonNames: ['121部运行', '大型航空器运行'],
    lastVerified: '2025-01-14'
  },
  '135': {
    officialName: '小型航空器商业运输运营人运行合格审定规则',
    currentRevision: 'CCAR-135-R3',
    category: '运行',
    subcategory: 'CCAR-135',
    shortName: '小型航空器商业运输',
    commonNames: ['135部运行', '小型商业运输'],
    lastVerified: '2025-01-14'
  },

  // 适航类
  '21': {
    officialName: '民用航空产品和零部件合格审定规定',
    currentRevision: 'CCAR-21-R4',
    category: '航空器制造与适航',
    subcategory: 'CCAR-21',
    shortName: '产品和零部件审定',
    commonNames: ['产品审定', '零部件合格审定'],
    lastVerified: '2025-01-14'
  },
  '25': {
    officialName: '运输类飞机适航标准',
    currentRevision: 'CCAR-25-R4',
    category: '航空器制造与适航',
    subcategory: 'CCAR-25',
    shortName: '运输类飞机适航标准',
    commonNames: ['运输类适航', '大型飞机适航'],
    lastVerified: '2025-01-14'
  },

  // 维修类
  '145': {
    officialName: '民用航空器维修单位合格审定规定',
    currentRevision: 'CCAR-145-R3',
    category: '维修',
    subcategory: 'CCAR-145',
    shortName: '维修单位合格审定',
    commonNames: ['维修单位审定', '145部维修'],
    lastVerified: '2025-01-14'
  }
};

/**
 * 验证和修正CCAR名称
 * @param {string} ccarNumber - CCAR编号，如 "61", "121"
 * @param {string} currentName - 当前使用的名称
 * @returns {Object} 验证结果和修正建议
 */
function validateCCARName(ccarNumber, currentName) {
  const officialData = OFFICIAL_CCAR_NAMES[ccarNumber];
  
  if (!officialData) {
    return {
      isValid: false,
      error: `未找到CCAR-${ccarNumber}的官方数据`,
      suggestion: null
    };
  }

  const { officialName, shortName, commonNames } = officialData;
  
  // 检查是否使用官方全称
  if (currentName === officialName) {
    return {
      isValid: true,
      message: '使用官方标准名称',
      data: officialData
    };
  }

  // 检查是否使用认可的简称
  if (currentName === shortName) {
    return {
      isValid: true,
      message: '使用官方认可的简称',
      data: officialData,
      suggestion: `建议使用官方全称：${officialName}`
    };
  }

  // 检查是否使用常见的非官方名称
  if (commonNames.includes(currentName)) {
    return {
      isValid: false,
      error: `使用了非官方名称：${currentName}`,
      correctName: officialName,
      suggestion: `应修正为官方名称：${officialName}`,
      data: officialData
    };
  }

  return {
    isValid: false,
    error: `未知的CCAR-${ccarNumber}名称：${currentName}`,
    correctName: officialName,
    suggestion: `应使用官方名称：${officialName}`,
    data: officialData
  };
}

/**
 * 批量验证CCAR数据
 * @param {Array} dataArray - 包含CCAR信息的数据数组
 * @param {string} nameField - 名称字段名，默认为'name'
 * @param {string} numberField - 编号字段名，默认为'doc_number'
 * @returns {Object} 验证报告
 */
function batchValidateCCARData(dataArray, nameField = 'name', numberField = 'doc_number') {
  const results = {
    total: dataArray.length,
    valid: 0,
    needCorrection: 0,
    errors: [],
    corrections: []
  };

  dataArray.forEach((item, index) => {
    const docNumber = item[numberField];
    const currentName = item[nameField];
    
    // 提取CCAR编号
    const ccarMatch = docNumber && docNumber.match(/CCAR-(\d+)/);
    if (!ccarMatch) {
      return; // 跳过非CCAR文档
    }

    const ccarNumber = ccarMatch[1];
    const validation = validateCCARName(ccarNumber, currentName);

    if (validation.isValid) {
      results.valid++;
    } else {
      results.needCorrection++;
      results.corrections.push({
        index,
        ccarNumber,
        currentName,
        correctName: validation.correctName,
        docNumber,
        error: validation.error,
        suggestion: validation.suggestion
      });
    }

    if (validation.error) {
      results.errors.push({
        index,
        ccarNumber,
        error: validation.error
      });
    }
  });

  return results;
}

/**
 * 自动修正CCAR数据
 * @param {Array} dataArray - 要修正的数据数组
 * @param {string} nameField - 名称字段名
 * @param {string} numberField - 编号字段名
 * @returns {Object} 修正结果
 */
function autoCorrectCCARData(dataArray, nameField = 'name', numberField = 'doc_number') {
  const corrections = [];
  
  dataArray.forEach((item, index) => {
    const docNumber = item[numberField];
    const ccarMatch = docNumber && docNumber.match(/CCAR-(\d+)/);
    
    if (ccarMatch) {
      const ccarNumber = ccarMatch[1];
      const officialData = OFFICIAL_CCAR_NAMES[ccarNumber];
      
      if (officialData && item[nameField] !== officialData.officialName) {
        corrections.push({
          index,
          field: nameField,
          oldValue: item[nameField],
          newValue: officialData.officialName,
          ccarNumber,
          docNumber
        });
        
        // 执行修正
        item[nameField] = officialData.officialName;
      }
    }
  });

  return {
    totalCorrections: corrections.length,
    corrections,
    correctedData: dataArray
  };
}

/**
 * 生成CCAR数据质量报告
 * @param {Array} dataArray - 数据数组
 * @returns {string} 格式化的报告
 */
function generateCCARQualityReport(dataArray) {
  const validation = batchValidateCCARData(dataArray);
  
  let report = `\n=== CCAR数据质量报告 ===\n`;
  report += `总计：${validation.total} 条记录\n`;
  report += `有效：${validation.valid} 条\n`;
  report += `需要修正：${validation.needCorrection} 条\n\n`;

  if (validation.corrections.length > 0) {
    report += `需要修正的项目：\n`;
    validation.corrections.forEach((correction, index) => {
      report += `${index + 1}. CCAR-${correction.ccarNumber}\n`;
      report += `   当前名称：${correction.currentName}\n`;
      report += `   正确名称：${correction.correctName}\n`;
      report += `   文档编号：${correction.docNumber}\n\n`;
    });
  }

  return report;
}

module.exports = {
  OFFICIAL_CCAR_NAMES,
  validateCCARName,
  batchValidateCCARData,
  autoCorrectCCARData,
  generateCCARQualityReport
}; 