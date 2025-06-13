/**
 * 规范性文件分类器演示脚本
 * 展示分类器的实际效果和分类结果
 */

const testClassifier = require('./test-classifier.js');

console.log('🎯 开始规范性文件分类器演示...\n');

// 运行完整测试
const results = testClassifier.main();

// 生成详细的分类报告
console.log('\n📊 详细分类报告:\n');

// 按类别展示分类结果
Object.entries(results.classified_documents).forEach(([category, subcategories]) => {
  console.log(`\n📂 ${category} (${results.classification_summary[category].total_documents}个文件)`);
  console.log('=' .repeat(50));
  
  Object.entries(subcategories).forEach(([subcategory, documents]) => {
    console.log(`\n  📁 ${subcategory} (${documents.length}个文件):`);
    
    // 显示前5个文件作为示例
    documents.slice(0, 5).forEach((doc, index) => {
      const methodIcon = {
        'exact_match': '🎯',
        'fuzzy_match': '🔍', 
        'manual_required': '✋'
      }[doc.classification.method];
      
      console.log(`    ${index + 1}. ${methodIcon} ${doc.title}`);
      console.log(`       文号: ${doc.doc_number || '无'}`);
      console.log(`       分类方法: ${doc.classification.method} (${doc.classification.confidence})`);
      if (doc.classification.ccarNumber) {
        console.log(`       CCAR部号: ${doc.classification.ccarNumber}`);
      }
      console.log('');
    });
    
    if (documents.length > 5) {
      console.log(`    ... 还有${documents.length - 5}个文件\n`);
    }
  });
});

// 分析分类效果
console.log('\n🎯 分类效果分析:');
console.log('=' .repeat(50));

const totalDocs = results.total_documents;
const exactMatch = results.statistics.exact_match;
const fuzzyMatch = results.statistics.fuzzy_match;
const manualRequired = results.statistics.manual_required;

console.log(`✅ 自动化分类成功率: ${((exactMatch + fuzzyMatch) / totalDocs * 100).toFixed(1)}%`);
console.log(`🎯 精确匹配率: ${(exactMatch / totalDocs * 100).toFixed(1)}%`);
console.log(`🔍 模糊匹配率: ${(fuzzyMatch / totalDocs * 100).toFixed(1)}%`);
console.log(`✋ 需要手动处理: ${(manualRequired / totalDocs * 100).toFixed(1)}%`);

// 展示三级文件夹结构示例
console.log('\n📁 三级文件夹结构示例:');
console.log('=' .repeat(50));

// 选择几个有代表性的类别展示
const exampleCategories = ['航空人员', '运行', '机场', '安全、安保与事故调查'];

exampleCategories.forEach(category => {
  if (results.classified_documents[category]) {
    console.log(`\n📂 ${category}/`);
    
    Object.entries(results.classified_documents[category]).forEach(([subcategory, documents]) => {
      console.log(`  📂 ${subcategory}/ (${documents.length}个文件)`);
      
      // 显示前2个文件
      documents.slice(0, 2).forEach(doc => {
        console.log(`    📄 ${doc.title}`);
      });
      
      if (documents.length > 2) {
        console.log(`    📄 ... 还有${documents.length - 2}个文件`);
      }
    });
  }
});

// 展示部号提取效果
console.log('\n🔢 部号提取效果展示:');
console.log('=' .repeat(50));

const exampleExtractions = [
  'AC-121-FS-139',
  'AP-91-FS-2025-02R1', 
  'AC-67FS-001R2',
  'IB-FS-OPC-006',
  'MD-TR-2025-01',
  'AC-396-10R1'
];

exampleExtractions.forEach(docNum => {
  const classifier = require('./classifier.js');
  const extracted = classifier.extractCCARNumber(docNum);
  const mapping = classifier.CCAR_CATEGORY_MAP[extracted];
  
  console.log(`📄 ${docNum}`);
  console.log(`   → 提取部号: ${extracted}`);
  if (mapping) {
    console.log(`   → 分类: ${mapping.category} → ${mapping.subcategory}`);
  }
  console.log('');
});

// 展示模糊匹配效果
console.log('\n🔍 模糊匹配效果展示:');
console.log('=' .repeat(50));

const fuzzyExamples = results.classified_documents;
let fuzzyCount = 0;

Object.entries(fuzzyExamples).forEach(([category, subcategories]) => {
  Object.entries(subcategories).forEach(([subcategory, documents]) => {
    documents.forEach(doc => {
      if (doc.classification.method === 'fuzzy_match' && fuzzyCount < 5) {
        console.log(`📄 ${doc.title}`);
        console.log(`   → 司局: ${doc.office_unit || '无'}`);
        console.log(`   → 分类: ${category} → ${subcategory}`);
        console.log(`   → 置信度: ${doc.classification.confidence}`);
        console.log('');
        fuzzyCount++;
      }
    });
  });
});

// 总结
console.log('\n🎉 分类器演示完成!');
console.log('=' .repeat(50));
console.log(`✅ 成功处理 ${totalDocs} 个规范性文件`);
console.log(`📂 生成 ${Object.keys(results.classified_documents).length} 个主要类别`);
console.log(`📁 包含 ${Object.values(results.classified_documents).reduce((total, cat) => total + Object.keys(cat).length, 0)} 个子类别`);
console.log(`🎯 自动化分类成功率: ${((exactMatch + fuzzyMatch) / totalDocs * 100).toFixed(1)}%`);

console.log('\n📋 分类系统特点:');
console.log('• 🎯 三步分类法: 精确匹配 → 模糊匹配 → 手动分类');
console.log('• 📂 三级文件夹结构: 规章类别 → CCAR部号 → 规范性文件');
console.log('• 🔍 智能部号提取: 支持多种文号格式');
console.log('• 🏷️ 关键词匹配: 基于司局和标题的智能分类');
console.log('• 📊 完整统计: 提供详细的分类统计和报告');

console.log('\n🚀 系统已准备就绪，可以集成到小程序中使用！'); 