// 测试胎压检查优先级逻辑
const acrManager = require('../utils/acr-manager.js');

console.log('🔧 开始胎压检查优先级逻辑测试...\n');

// 模拟计算逻辑
function simulateACRCalculation(aircraftTirePressure, pressureLimit, acr, pcr) {
  console.log(`\n📊 测试场景:`);
  console.log(`   飞机胎压: ${aircraftTirePressure} MPa`);
  console.log(`   道面限制: ${pressureLimit === null ? '无限制' : pressureLimit + ' MPa'}`);
  console.log(`   飞机ACR: ${acr}`);
  console.log(`   道面PCR: ${pcr}`);

  // 胎压检查
  let tirePressureCheckPassed = true;
  if (pressureLimit === null) {
    tirePressureCheckPassed = true;
  } else {
    tirePressureCheckPassed = aircraftTirePressure <= pressureLimit;
  }

  // ACR-PCR检查
  const acrPcrCheckPassed = acr <= pcr;

  // 综合判断：胎压和ACR-PCR都必须通过
  const canOperate = tirePressureCheckPassed && acrPcrCheckPassed;

  let operationStatus = '';
  let operationReason = '';

  if (!tirePressureCheckPassed) {
    // 胎压超限，直接不可使用
    operationStatus = '❌ 不可使用';
    operationReason = '胎压超限';
  } else if (!acrPcrCheckPassed) {
    // 胎压通过但ACR超限
    operationStatus = '❌ 不可使用';
    operationReason = 'ACR > PCR，不满足运行要求';
  } else {
    // 都通过
    operationStatus = '✅ 可以使用';
    operationReason = 'ACR ≤ PCR，满足运行要求';
  }

  console.log(`\n📋 检查结果:`);
  console.log(`   胎压检查: ${tirePressureCheckPassed ? '✅ 通过' : '❌ 超限'}`);
  console.log(`   ACR检查: ${acrPcrCheckPassed ? '✅ 通过' : '❌ 超限'}`);
  console.log(`   最终结果: ${operationStatus}`);
  console.log(`   原因: ${operationReason}`);

  return {
    tirePressureCheckPassed,
    acrPcrCheckPassed,
    canOperate,
    operationStatus,
    operationReason
  };
}

// 测试用例
console.log('🧪 开始测试不同场景...');

console.log('\n=== 测试用例1: 胎压超限但ACR合格 ===');
simulateACRCalculation(1.50, 1.25, 300, 400); // 胎压1.50 > 限制1.25，但ACR 300 < PCR 400

console.log('\n=== 测试用例2: 胎压合格但ACR超限 ===');
simulateACRCalculation(1.20, 1.25, 500, 400); // 胎压1.20 < 限制1.25，但ACR 500 > PCR 400

console.log('\n=== 测试用例3: 胎压和ACR都超限 ===');
simulateACRCalculation(1.50, 1.25, 500, 400); // 胎压1.50 > 限制1.25，且ACR 500 > PCR 400

console.log('\n=== 测试用例4: 胎压和ACR都合格 ===');
simulateACRCalculation(1.20, 1.25, 300, 400); // 胎压1.20 < 限制1.25，且ACR 300 < PCR 400

console.log('\n=== 测试用例5: 无胎压限制，ACR超限 ===');
simulateACRCalculation(2.00, null, 500, 400); // 无胎压限制，但ACR 500 > PCR 400

console.log('\n=== 测试用例6: 无胎压限制，ACR合格 ===');
simulateACRCalculation(2.00, null, 300, 400); // 无胎压限制，且ACR 300 < PCR 400

console.log('\n🎉 胎压检查优先级测试完成！');

console.log('\n📝 关键逻辑总结:');
console.log('   1. 胎压检查是强制性安全要求');
console.log('   2. 胎压超限时，无论ACR-PCR关系如何，都不可使用');
console.log('   3. 只有胎压通过且ACR ≤ PCR时，才可以使用');
console.log('   4. 失败原因会明确显示是胎压超限还是ACR超限'); 