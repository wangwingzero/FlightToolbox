// 简化的ACR测试
const acrManager = require('../utils/acr-manager.js');

console.log('🔧 开始简化ACR测试...');

// 测试PCR解析
const testPCR = 'PCR 700/R/B/W/T';
console.log(`\n测试PCR解析: ${testPCR}`);
const pcrInfo = acrManager.parsePCR(testPCR);
console.log('PCR解析结果:', pcrInfo);

// 测试胎压逻辑
console.log('\n测试胎压检查逻辑：');

function testTirePressureLogic(aircraftPressure, limit, acr, pcr) {
  console.log(`飞机胎压: ${aircraftPressure} MPa, 限制: ${limit === null ? '无限制' : limit + ' MPa'}`);
  console.log(`飞机ACR: ${acr}, 道面PCR: ${pcr}`);
  
  // 胎压检查
  const tirePressureOk = limit === null || aircraftPressure <= limit;
  
  // ACR检查
  const acrOk = acr <= pcr;
  
  // 综合判断
  const canOperate = tirePressureOk && acrOk;
  
  let reason = '';
  if (!tirePressureOk) {
    reason = '胎压超限';
  } else if (!acrOk) {
    reason = 'ACR > PCR，不满足运行要求';
  } else {
    reason = 'ACR ≤ PCR，满足运行要求';
  }
  
  console.log(`结果: ${canOperate ? '✅ 可以使用' : '❌ 不可使用'} - ${reason}\n`);
}

// 测试各种场景
testTirePressureLogic(1.365, 0.5, 138, 700);  // 胎压超限
testTirePressureLogic(1.365, 1.75, 800, 700); // ACR超限
testTirePressureLogic(1.365, 1.75, 138, 700); // 都通过

console.log('🎉 简化测试完成！'); 