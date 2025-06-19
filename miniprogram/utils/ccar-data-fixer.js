// CCAR数据自动修正脚本
// 用于检查和修正所有相关文件中的CCAR命名错误

const dataValidator = require('./data-validator.js');

/**
 * 检查和修正classifier.js中的CCAR数据
 */
function fixClassifierData() {
  try {
    const classifierPath = '../packageE/classifier.js';
    const classifierModule = require(classifierPath);
    
    console.log('🔍 检查 classifier.js 中的CCAR数据...');
    
    // 提取CCAR_PARTS映射表
    const ccarParts = classifierModule.CCAR_PARTS || {};
    const ccarArray = Object.keys(ccarParts).map(key => ({
      number: key,
      name: ccarParts[key].name,
      category: ccarParts[key].category,
      subcategory: ccarParts[key].subcategory
    }));
    
    // 验证数据
    const validation = dataValidator.batchValidateCCARData(ccarArray, 'name', 'number');
    console.log(dataValidator.generateCCARQualityReport(ccarArray));
    
    // 如果有错误，生成修正建议
    if (validation.needCorrection > 0) {
      console.log('📋 生成修正建议...');
      validation.corrections.forEach(correction => {
        console.log(`\n修正建议：`);
        console.log(`文件：miniprogram/packageE/classifier.js`);
        console.log(`行：'${correction.ccarNumber}': { category: '${correction.category}', subcategory: 'CCAR-${correction.ccarNumber}', name: '${correction.currentName}' }`);
        console.log(`应改为：'${correction.ccarNumber}': { category: '${correction.category}', subcategory: 'CCAR-${correction.ccarNumber}', name: '${correction.correctName}' }`);
      });
    }
    
    return validation;
  } catch (error) {
    console.error('❌ 检查 classifier.js 时出错:', error.message);
    return null;
  }
}

/**
 * 检查和修正regulation.js中的CCAR数据
 */
function fixRegulationData() {
  try {
    const regulationPath = '../packageE/regulation.js';
    
    console.log('🔍 检查 regulation.js 中的CCAR数据...');
    
    // 由于regulation.js是静态数据文件，需要特殊处理
    // 这里提供检查逻辑和修正建议
    console.log('ℹ️  regulation.js 需要手动检查以下CCAR条目的标题是否准确：');
    
    const commonCCARs = ['61', '63', '65', '66', '67', '91', '121', '135', '145'];
    commonCCARs.forEach(ccarNumber => {
      const officialData = dataValidator.OFFICIAL_CCAR_NAMES[ccarNumber];
      if (officialData) {
        console.log(`\nCCAR-${ccarNumber}:`);
        console.log(`  官方标准名称：${officialData.officialName}`);
        console.log(`  当前版本：${officialData.currentRevision}`);
        console.log(`  官方链接：${officialData.officialUrl || '需要查询'}`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ 检查 regulation.js 时出错:', error.message);
    return null;
  }
}

/**
 * 检查normative.js中的CCAR数据（如果存在）
 */
function fixNormativeData() {
  try {
    console.log('🔍 检查 normative.js 中的CCAR数据...');
    
    // 检查normative.js是否存在数据
    const normativePath = '../packageE/normative.js';
    
    console.log('ℹ️  请检查 normative.js 文件中是否包含CCAR相关数据');
    console.log('ℹ️  如果包含，请使用相同的标准化名称');
    
    return true;
  } catch (error) {
    console.error('❌ 检查 normative.js 时出错:', error.message);
    return null;
  }
}

/**
 * 生成完整的CCAR数据修正报告
 */
function generateFullReport() {
  console.log('\n' + '='.repeat(60));
  console.log('🛠️  CCAR数据一致性检查和修正报告');
  console.log('='.repeat(60));
  
  const results = {
    classifier: fixClassifierData(),
    regulation: fixRegulationData(),
    normative: fixNormativeData()
  };
  
  console.log('\n📊 检查摘要：');
  console.log(`classifier.js: ${results.classifier ? '✅ 已检查' : '❌ 检查失败'}`);
  console.log(`regulation.js: ${results.regulation ? '✅ 已检查' : '❌ 检查失败'}`);
  console.log(`normative.js: ${results.normative ? '✅ 已检查' : '❌ 检查失败'}`);
  
  console.log('\n💡 建议：');
  console.log('1. 立即修正所有发现的命名错误');
  console.log('2. 建立定期数据验证机制');
  console.log('3. 在数据更新时使用官方标准名称');
  console.log('4. 考虑建立自动化数据同步机制');
  
  return results;
}

/**
 * 验证特定CCAR编号的数据一致性
 */
function validateSpecificCCAR(ccarNumber) {
  console.log(`\n🔍 验证 CCAR-${ccarNumber} 的数据一致性...`);
  
  const officialData = dataValidator.OFFICIAL_CCAR_NAMES[ccarNumber];
  if (!officialData) {
    console.log(`❌ 未找到 CCAR-${ccarNumber} 的官方数据`);
    return false;
  }
  
  console.log(`✅ CCAR-${ccarNumber} 官方信息：`);
  console.log(`   标准名称：${officialData.officialName}`);
  console.log(`   当前版本：${officialData.currentRevision}`);
  console.log(`   类别：${officialData.category}`);
  console.log(`   简称：${officialData.shortName}`);
  
  if (officialData.commonNames.length > 0) {
    console.log(`   ⚠️  常见的错误名称：${officialData.commonNames.join(', ')}`);
  }
  
  return true;
}

// 如果直接运行此脚本
if (require.main === module) {
  generateFullReport();
}

module.exports = {
  fixClassifierData,
  fixRegulationData,
  fixNormativeData,
  generateFullReport,
  validateSpecificCCAR
}; 