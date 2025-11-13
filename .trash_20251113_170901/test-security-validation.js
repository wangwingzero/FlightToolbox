#!/usr/bin/env node

/**
 * 安全验证测试脚本
 * 用于验证sanitizeComponentId函数是否能正确阻止恶意输入
 *
 * 运行方式：node test-security-validation.js
 */

// 模拟微信小程序的module.exports环境
global.module = { exports: {} };
global.console = console;

// 加载图片路径映射器
var ImagePathMapper = require('./miniprogram/packageWalkaround/utils/image-path-mapper.js');

console.log('========== 安全验证测试 ==========\n');

// 测试1：路径遍历攻击
console.log('【测试1】路径遍历攻击防护');
console.log('-----------------------------------');
testSecurityBlocked('../../etc/passwd', 5, 'Path traversal');
testSecurityBlocked('../sensitive/file', 3, 'Path traversal');
testSecurityBlocked('..\\windows\\system32', 2, 'Path traversal');
console.log('');

// 测试2：非法字符
console.log('【测试2】非法字符防护');
console.log('-----------------------------------');
testSecurityBlocked('file<script>', 5, 'illegal characters');
testSecurityBlocked('file;rm -rf', 3, 'illegal characters');
testSecurityBlocked('file|cat /etc/passwd', 2, 'illegal characters');
testSecurityBlocked('file$(whoami)', 4, 'illegal characters');
console.log('');

// 测试3：空值和类型错误
console.log('【测试3】空值和类型错误防护');
console.log('-----------------------------------');
testSecurityBlocked('', 5, 'must be a non-empty string');
testSecurityBlocked(null, 3, 'must be a non-empty string');
testSecurityBlocked(undefined, 2, 'must be a non-empty string');
testSecurityBlocked(123, 4, 'must be a non-empty string');
console.log('');

// 测试4：长度限制
console.log('【测试4】长度限制防护（DoS防护）');
console.log('-----------------------------------');
var longString = 'a'.repeat(101);
testSecurityBlocked(longString, 5, 'too long');
console.log('');

// 测试5：合法输入（应该通过）
console.log('【测试5】合法输入验证');
console.log('-----------------------------------');
testSecurityAllowed('slat', 5);
testSecurityAllowed('fuel_water_drain_valve', 3);
testSecurityAllowed('radome', 2);
testSecurityAllowed('landing_gear_structure', 10);
testSecurityAllowed('123-test_component', 8);
console.log('');

// 测试6：边界情况
console.log('【测试6】边界情况测试');
console.log('-----------------------------------');
testSecurityAllowed('a', 5);  // 单字符
testSecurityAllowed('a'.repeat(100), 3);  // 最大长度
testSecurityAllowed('test.png', 2);  // 带.png后缀（应自动清理）
testSecurityAllowed('TEST_123-component', 4);  // 大小写混合
console.log('');

console.log('========== 测试完成 ==========');

/**
 * 测试恶意输入是否被正确阻止
 */
function testSecurityBlocked(componentId, areaId, expectedError) {
  try {
    var result = ImagePathMapper.getImagePath(componentId, areaId);
    // 如果没有抛出异常，检查是否返回了占位图片
    if (result === '/images/placeholder.png') {
      console.log('✅ BLOCKED:', JSON.stringify(componentId), '→ 返回占位图片');
    } else {
      console.log('❌ FAILED:', JSON.stringify(componentId), '→ 未被阻止！返回:', result);
    }
  } catch (error) {
    // 理论上不应该到这里，因为getImagePath已经catch了异常
    console.log('✅ BLOCKED:', JSON.stringify(componentId), '→ 抛出异常');
  }
}

/**
 * 测试合法输入是否能正常通过
 */
function testSecurityAllowed(componentId, areaId) {
  try {
    var result = ImagePathMapper.getImagePath(componentId, areaId);
    if (result && result !== '/images/placeholder.png') {
      console.log('✅ ALLOWED:', componentId, '→', result.substring(0, 50));
    } else {
      console.log('❌ FAILED:', componentId, '→ 合法输入被错误阻止！');
    }
  } catch (error) {
    console.log('❌ FAILED:', componentId, '→ 合法输入被错误阻止！错误:', error.message);
  }
}
