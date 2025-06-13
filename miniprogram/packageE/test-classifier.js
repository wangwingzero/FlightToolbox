/**
 * 规范性文件分类器测试脚本
 * 用于测试分类器效果并生成详细的分类报告
 */

const classifier = require('./classifier.js');
const normativeData = require('./normative.js');

/**
 * 运行分类测试
 */
function runClassificationTest() {
  console.log('🚀 开始规范性文件分类测试...\n');
  
  // 执行分类
  const startTime = Date.now();
  const results = classifier.classifyNormativeDocuments(normativeData);
  const endTime = Date.now();
  
  console.log(`⏱️ 分类耗时: ${endTime - startTime}ms\n`);
  
  // 生成并打印报告
  const report = classifier.generateClassificationReport(results);
  console.log(report);
  
  // 详细分析
  console.log('## 详细分析\n');
  
  // 分析精确匹配的文件
  console.log('### 精确匹配示例（按部号分类）');
  let exactMatchCount = 0;
  Object.values(results.classified_documents).forEach(category => {
    Object.values(category).forEach(docs => {
      docs.forEach(doc => {
        if (doc.classification.method === 'exact_match' && exactMatchCount < 10) {
          console.log(`- ${doc.title} → ${doc.classification.category}/${doc.classification.subcategory} (部号: ${doc.classification.ccarNumber})`);
          exactMatchCount++;
        }
      });
    });
  });
  
  console.log('\n### 模糊匹配示例（按司局+关键词分类）');
  let fuzzyMatchCount = 0;
  Object.values(results.classified_documents).forEach(category => {
    Object.values(category).forEach(docs => {
      docs.forEach(doc => {
        if (doc.classification.method === 'fuzzy_match' && fuzzyMatchCount < 10) {
          console.log(`- ${doc.title} → ${doc.classification.category}/综合文件`);
          fuzzyMatchCount++;
        }
      });
    });
  });
  
  console.log('\n### 需要手动分类的文件');
  let manualCount = 0;
  Object.values(results.classified_documents).forEach(category => {
    Object.values(category).forEach(docs => {
      docs.forEach(doc => {
        if (doc.classification.method === 'manual_required') {
          console.log(`- ${doc.title} (文号: ${doc.doc_number || '无'}, 司局: ${doc.office_unit || '无'})`);
          manualCount++;
        }
      });
    });
  });
  
  if (manualCount === 0) {
    console.log('✅ 所有文件都已成功自动分类！');
  }
  
  return results;
}

/**
 * 测试特定文档的分类
 */
function testSpecificDocuments() {
  console.log('\n🔍 测试特定文档分类...\n');
  
  const testCases = [
    {
      title: "运输航空驾驶员训练大纲制定和实施管理规定",
      doc_number: "AC-121-FS-139",
      office_unit: "飞行标准司"
    },
    {
      title: "民用航空安全信息主动报告管理办法",
      doc_number: "AC-396-10R1",
      office_unit: "航空安全办公室"
    },
    {
      title: "运输机场旅客航站区无障碍环境规划建设指南",
      doc_number: "AC-158-CA-2025-01",
      office_unit: "机场司"
    },
    {
      title: "民航数据共享管理办法（试行）",
      doc_number: "",
      office_unit: "综合司"
    },
    {
      title: "农用无人驾驶航空器操控员培训管理规定（试行）",
      doc_number: "",
      office_unit: "综合司"
    }
  ];
  
  testCases.forEach((testDoc, index) => {
    const result = classifier.classifyDocument(testDoc);
    console.log(`测试案例 ${index + 1}:`);
    console.log(`  标题: ${testDoc.title}`);
    console.log(`  文号: ${testDoc.doc_number || '无'}`);
    console.log(`  司局: ${testDoc.office_unit || '无'}`);
    console.log(`  分类结果: ${result.category} → ${result.subcategory}`);
    console.log(`  分类方法: ${result.method} (置信度: ${result.confidence})`);
    if (result.ccarNumber) {
      console.log(`  CCAR部号: ${result.ccarNumber}`);
    }
    console.log('');
  });
}

/**
 * 生成文件夹结构预览
 */
function generateFolderStructure(results) {
  console.log('\n📁 生成的文件夹结构预览:\n');
  
  Object.entries(results.classified_documents).forEach(([category, subcategories]) => {
    console.log(`📂 ${category}/`);
    Object.entries(subcategories).forEach(([subcategory, docs]) => {
      console.log(`  📂 ${subcategory}/ (${docs.length}个文件)`);
      // 显示前3个文件作为示例
      docs.slice(0, 3).forEach(doc => {
        console.log(`    📄 ${doc.title}`);
      });
      if (docs.length > 3) {
        console.log(`    ... 还有${docs.length - 3}个文件`);
      }
    });
    console.log('');
  });
}

/**
 * 验证分类器的关键功能
 */
function validateClassifier() {
  console.log('\n🧪 验证分类器关键功能...\n');
  
  // 测试部号提取功能
  const testNumbers = [
    'AC-121-FS-139',
    'AP-91-FS-2025-02R1',
    'AC-67FS-001R2',
    'IB-FS-OPC-006',
    'MD-TR-2025-01',
    'AC-396-10R1',
    ''
  ];
  
  console.log('### 部号提取测试:');
  testNumbers.forEach(docNum => {
    const extracted = classifier.extractCCARNumber(docNum);
    console.log(`  ${docNum || '(空)'} → ${extracted || '无法提取'}`);
  });
  
  // 测试模糊匹配功能
  console.log('\n### 模糊匹配测试:');
  const fuzzyTests = [
    { office: '飞行标准司', title: '驾驶员执照管理规定' },
    { office: '机场司', title: '机场建设管理办法' },
    { office: '航空安全办公室', title: '安全事件报告规定' },
    { office: '运输司', title: '危险品运输管理' },
    { office: '综合司', title: '数据管理办法' }
  ];
  
  fuzzyTests.forEach(test => {
    const result = classifier.fuzzyMatchByOfficeAndTitle(test.office, test.title);
    console.log(`  ${test.office} + "${test.title}" → ${result || '无匹配'}`);
  });
  
  console.log('\n✅ 分类器功能验证完成');
}

// 主函数
function main() {
  console.log('=' .repeat(60));
  console.log('📋 规范性文件自动分类系统测试');
  console.log('=' .repeat(60));
  
  // 运行各项测试
  validateClassifier();
  testSpecificDocuments();
  const results = runClassificationTest();
  generateFolderStructure(results);
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 测试完成！分类系统已准备就绪。');
  console.log('=' .repeat(60));
  
  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  runClassificationTest,
  testSpecificDocuments,
  generateFolderStructure,
  validateClassifier,
  main
}; 