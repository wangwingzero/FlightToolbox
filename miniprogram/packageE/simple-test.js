/**
 * 简单测试 - 验证分类器基本功能
 */

const classifier = require('./classifier.js');

// 测试部号提取功能
console.log('🧪 测试部号提取功能:');
const testNumbers = [
  'AC-121-FS-139',
  'AP-91-FS-2025-02R1',
  'AC-67FS-001R2',
  'AC-396-10R1',
  ''
];

testNumbers.forEach(docNum => {
  const extracted = classifier.extractCCARNumber(docNum);
  console.log(`  ${docNum || '(空)'} → ${extracted || '无法提取'}`);
});

// 测试单文档分类
console.log('\n🧪 测试单文档分类:');
const testDoc = {
  title: "运输航空驾驶员训练大纲制定和实施管理规定",
  doc_number: "AC-121-FS-139",
  office_unit: "飞行标准司"
};

const result = classifier.classifyDocument(testDoc);
console.log('测试文档:', testDoc.title);
console.log('分类结果:', result);

// 测试CCAR映射
console.log('\n🧪 测试CCAR映射:');
const testCCARs = ['121', '91', '61', '139'];
testCCARs.forEach(ccar => {
  const mapping = classifier.CCAR_CATEGORY_MAP[ccar];
  if (mapping) {
    console.log(`  CCAR-${ccar}: ${mapping.category} → ${mapping.subcategory}`);
  } else {
    console.log(`  CCAR-${ccar}: 未找到映射`);
  }
});

console.log('\n✅ 基本功能测试完成');

module.exports = {
  testExtraction: () => classifier.extractCCARNumber('AC-121-FS-139'),
  testClassification: () => classifier.classifyDocument(testDoc)
}; 