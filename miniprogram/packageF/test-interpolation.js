// 插值计算测试脚本
// 测试Boeing机型的线性插值计算逻辑

const acrData = require('./ACR.js')

console.log('🧪 ACR插值计算测试开始...\n')

// 查找B747-400B作为测试对象
const aircraft = acrData.aircraftData.find(a => a.model === 'B747-400B')
if (!aircraft) {
  console.error('❌ 未找到B747-400B数据')
  process.exit(1)
}

const variant = aircraft.variants[0]
console.log(`📊 测试机型: ${aircraft.model}`)
console.log(`📊 变型: ${variant.variantName}`)
console.log(`📊 质量范围: ${variant.mass_kg.min}kg - ${variant.mass_kg.max}kg`)

// 测试插值计算函数
function testInterpolation(inputMass, pavementType = 'flexiblePavement', subgrade = 'high_A_200') {
  const minMass = variant.mass_kg.min
  const maxMass = variant.mass_kg.max
  
  // 限制输入质量在有效范围内
  let clampedMass = inputMass
  if (inputMass < minMass) {
    clampedMass = minMass
    console.log(`⚠️ 输入质量 ${inputMass}kg 低于最小质量，使用最小值 ${minMass}kg`)
  } else if (inputMass > maxMass) {
    clampedMass = maxMass
    console.log(`⚠️ 输入质量 ${inputMass}kg 超过最大质量，使用最大值 ${maxMass}kg`)
  }
  
  // 获取最大最小ACR值
  const maxACR = variant.acr.max[pavementType][subgrade]
  const minACR = variant.acr.min[pavementType][subgrade]
  
  // 线性插值计算
  const massRatio = (clampedMass - minMass) / (maxMass - minMass)
  const interpolatedACR = Math.round(minACR + (maxACR - minACR) * massRatio)
  
  console.log(`\n📈 插值计算详情:`)
  console.log(`   输入质量: ${inputMass}kg`)
  console.log(`   实际质量: ${clampedMass}kg`)
  console.log(`   最小ACR: ${minACR} (质量${minMass}kg时)`)
  console.log(`   最大ACR: ${maxACR} (质量${maxMass}kg时)`)
  console.log(`   质量比例: ${massRatio.toFixed(3)}`)
  console.log(`   插值ACR: ${interpolatedACR}`)
  
  return interpolatedACR
}

// 测试用例
console.log('\n=== 测试用例1: 最小质量 ===')
testInterpolation(242672)

console.log('\n=== 测试用例2: 最大质量 ===')
testInterpolation(398345)

console.log('\n=== 测试用例3: 中间质量(50%) ===')
const midMass = 242672 + (398345 - 242672) * 0.5
testInterpolation(Math.round(midMass))

console.log('\n=== 测试用例4: 25%质量 ===')
const quarterMass = 242672 + (398345 - 242672) * 0.25
testInterpolation(Math.round(quarterMass))

console.log('\n=== 测试用例5: 75%质量 ===')
const threeQuarterMass = 242672 + (398345 - 242672) * 0.75
testInterpolation(Math.round(threeQuarterMass))

console.log('\n=== 测试用例6: 超出范围 - 过低 ===')
testInterpolation(200000)

console.log('\n=== 测试用例7: 超出范围 - 过高 ===')
testInterpolation(450000)

console.log('\n=== 测试不同道面条件 ===')
console.log('\n刚性道面, 中等强度道基:')
testInterpolation(320000, 'rigidPavement', 'medium_B_120')

console.log('\n柔性道面, 低强度道基:')
testInterpolation(320000, 'flexiblePavement', 'low_C_80')

console.log('\n✅ 插值计算测试完成!')

// 对比固定参数机型
console.log('\n\n🔍 对比固定参数机型(A320-200):')
const a320 = acrData.aircraftData.find(a => a.model === 'A320-200')
if (a320) {
  const a320Variant = a320.variants[0]
  console.log(`📊 机型: ${a320.model}`)
  console.log(`📊 变型: ${a320Variant.variantName}`)
  console.log(`📊 固定质量: ${a320Variant.mass_kg}kg`)
  console.log(`📊 固定ACR: ${a320Variant.acr.flexiblePavement.high_A_200}`)
  console.log('   这是固定参数，无需插值计算')
}

module.exports = { testInterpolation } 