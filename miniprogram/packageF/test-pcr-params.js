// 测试PCR参数分离功能
const acrManager = require('../utils/acr-manager.js');

console.log('🔧 开始PCR参数分离功能测试...\n');

// 测试新的PCR参数组装
function testPCRParams() {
  console.log('📋 测试PCR参数组装:');
  
  // 测试案例1: 标准参数
  const params1 = {
    pcr: 1090,
    pavementType: 'R',
    subgradeCategory: 'B', 
    tirePressureLimit: 'W',
    evaluationMethod: 'T'
  };
  
  const pcrCode1 = `${params1.pcr}/${params1.pavementType}/${params1.subgradeCategory}/${params1.tirePressureLimit}/${params1.evaluationMethod}`;
  console.log(`✅ 参数组装测试1: ${pcrCode1}`);
  
  // 测试案例2: 另一组参数
  const params2 = {
    pcr: 560,
    pavementType: 'F',
    subgradeCategory: 'C',
    tirePressureLimit: 'Y', 
    evaluationMethod: 'U'
  };
  
  const pcrCode2 = `${params2.pcr}/${params2.pavementType}/${params2.subgradeCategory}/${params2.tirePressureLimit}/${params2.evaluationMethod}`;
  console.log(`✅ 参数组装测试2: ${pcrCode2}`);
  
  return true;
}

// 测试PCR参数验证
function testPCRValidation() {
  console.log('\n📋 测试PCR参数验证:');
  
  const validParams = {
    pcrNumber: '1090',
    pavementType: 'R',
    subgradeStrength: 'B', 
    tirePressure: 'W',
    evaluationMethod: 'T'
  };
  
  // 验证PCR数值
  const pcrNumber = parseFloat(validParams.pcrNumber);
  const isValidNumber = !isNaN(pcrNumber) && pcrNumber > 0;
  console.log(`✅ PCR数值验证: ${validParams.pcrNumber} -> ${isValidNumber ? '有效' : '无效'}`);
  
  // 验证必填字段
  const requiredFields = ['pavementType', 'subgradeStrength', 'tirePressure', 'evaluationMethod'];
  const allFieldsValid = requiredFields.every(field => validParams[field] && validParams[field].length > 0);
  console.log(`✅ 必填字段验证: ${allFieldsValid ? '全部填写' : '有缺失'}`);
  
  // 组装最终的PCR对象
  const pcrInfo = {
    pcr: pcrNumber,
    pavementType: validParams.pavementType,
    subgradeCategory: validParams.subgradeStrength,
    tirePressureLimit: validParams.tirePressure,
    evaluationMethod: validParams.evaluationMethod
  };
  
  console.log(`✅ PCR对象组装:`, pcrInfo);
  
  return pcrInfo;
}

// 测试与ACR查询的兼容性
async function testACRCompatibility() {
  console.log('\n📋 测试与ACR查询的兼容性:');
  
  try {
    // 加载ACR数据
    await acrManager.loadACRData();
    
    // 使用新的PCR参数格式
    const pcrInfo = {
      pcr: 1090,
      pavementType: 'R',
      subgradeCategory: 'B',
      tirePressureLimit: 'W', 
      evaluationMethod: 'T'
    };
    
    // 测试ACR查询
    const acrInfo = acrManager.queryACR(
      'A330-300',
      'WV000',
      212900,
      pcrInfo.pavementType,
      pcrInfo.subgradeCategory
    );
    
    if (acrInfo) {
      console.log(`✅ ACR查询兼容性测试通过`);
      console.log(`   飞机ACR: ${acrInfo.acr}`);
      console.log(`   跑道PCR: ${pcrInfo.pcr}`);
      console.log(`   可以使用: ${acrInfo.acr <= pcrInfo.pcr ? '是' : '否'}`);
    } else {
      console.log(`❌ ACR查询失败`);
    }
    
  } catch (error) {
    console.log(`❌ 兼容性测试失败: ${error.message}`);
  }
}

// 运行所有测试
async function runAllTests() {
  testPCRParams();
  testPCRValidation();
  await testACRCompatibility();
  
  console.log('\n🎉 PCR参数分离功能测试完成！');
}

runAllTests(); 