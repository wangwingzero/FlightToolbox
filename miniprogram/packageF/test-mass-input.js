// 测试机型重量输入逻辑
const acrManager = require('../utils/acr-manager.js');

console.log('🔧 开始机型重量输入逻辑测试...\n');

// 测试不同机型的重量数据结构
async function testMassDataStructures() {
  try {
    console.log('📦 加载ACR数据...');
    await acrManager.loadACRData();
    
    console.log('\n📋 测试不同机型的重量数据结构:');
    
    // 测试空客A330-300（预期为固定值）
    console.log('\n1. 空客A330-300 机型测试:');
    const airbusVariants = acrManager.getVariantsByModel('A330-300');
    if (airbusVariants.length > 0) {
      const variant = airbusVariants[0];
      const massData = variant.mass_kg;
      
      console.log(`   变型: ${variant.variantName}`);
      console.log(`   重量数据: ${JSON.stringify(massData)}`);
      console.log(`   数据类型: ${typeof massData}`);
      
      if (typeof massData === 'object' && massData.min !== undefined && massData.max !== undefined) {
        console.log(`   ✅ 波音类型 - 支持重量输入 (${massData.min}-${massData.max}kg)`);
      } else {
        console.log(`   ✅ 空客类型 - 固定重量 (${massData}kg)`);
        
        // 测试前端逻辑
        simulateFrontendLogic(variant);
      }
    }
    
    // 测试波音B747-400B（预期为min/max范围）
    console.log('\n2. 波音B747-400B 机型测试:');
    const boeingVariants = acrManager.getVariantsByModel('B747-400B');
    if (boeingVariants.length > 0) {
      const variant = boeingVariants[0];
      const massData = variant.mass_kg;
      
      console.log(`   变型: ${variant.variantName}`);
      console.log(`   重量数据: ${JSON.stringify(massData)}`);
      console.log(`   数据类型: ${typeof massData}`);
      
      if (typeof massData === 'object' && massData.min !== undefined && massData.max !== undefined) {
        console.log(`   ✅ 波音类型 - 支持重量输入 (${massData.min}-${massData.max}kg)`);
        
        // 测试前端逻辑
        simulateFrontendLogic(variant);
      } else {
        console.log(`   ✅ 空客类型 - 固定重量 (${massData}kg)`);
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 模拟前端逻辑
function simulateFrontendLogic(variantData) {
  console.log('\n📱 模拟前端逻辑:');
  
  const massData = variantData.mass_kg;
  let massInputEnabled = false;
  let massDisplayLabel = '飞机重量';
  let aircraftMass = '';
  let variantDisplay = '';
  
  if (typeof massData === 'object' && massData.min !== undefined && massData.max !== undefined) {
    // 波音机型：有最小最大值，允许用户输入
    massInputEnabled = true;
    massDisplayLabel = '飞机重量';
    aircraftMass = massData.min.toString(); // 默认使用最小值
    variantDisplay = `${variantData.variantName} (${massData.min}-${massData.max}kg)`;
  } else {
    // 空客机型：固定值，不允许用户输入
    massInputEnabled = false;
    massDisplayLabel = '飞机重量最大值';
    aircraftMass = massData.toString();
    variantDisplay = `${variantData.variantName} (${massData}kg)`;
  }
  
  console.log(`   变型显示: ${variantDisplay}`);
  console.log(`   质量标签: ${massDisplayLabel}`);
  console.log(`   质量数值: ${aircraftMass} kg`);
  console.log(`   可输入重量: ${massInputEnabled ? '是' : '否'}`);
  
  return {
    massInputEnabled,
    massDisplayLabel,
    aircraftMass,
    variantDisplay
  };
}

// 运行所有测试
async function runAllTests() {
  await testMassDataStructures();
  
  console.log('\n🎉 机型重量输入逻辑测试完成！');
  console.log('\n📝 总结:');
  console.log('   - 空客机型：显示固定重量，标签为"飞机重量最大值"，不可编辑');
  console.log('   - 波音机型：允许输入重量范围，标签为"飞机重量"，可编辑');
}

runAllTests(); 