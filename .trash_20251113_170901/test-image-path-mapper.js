#!/usr/bin/env node

/**
 * 图片路径映射器测试脚本
 * 用于验证image-path-mapper.js的功能是否正常
 *
 * 运行方式：node test-image-path-mapper.js
 */

// 模拟微信小程序的module.exports环境
global.module = { exports: {} };
global.console = console;

// 加载图片路径映射器
var ImagePathMapper = require('./miniprogram/packageWalkaround/utils/image-path-mapper.js');

console.log('========== 图片路径映射器测试 ==========\n');

// 测试1：已迁移的共享图片
console.log('【测试1】已迁移的共享图片');
console.log('-----------------------------------');
testImagePath('slat', 5, '/packageWalkaroundImagesShared/images/wings/slat.png');
testImagePath('fuel_water_drain_valve', 3, '/packageWalkaroundImagesShared/images/common/fuel_water_drain_valve.png');
testImagePath('magnetic_fuel_level', 8, '/packageWalkaroundImagesShared/images/common/magnetic_fuel_level.png');
console.log('');

// 测试2：未迁移的原分包图片
console.log('【测试2】未迁移的原分包图片');
console.log('-----------------------------------');
testImagePath('radome', 2, '/packageWalkaroundImages1/images1/radome.png');
testImagePath('landing_light', 6, '/packageWalkaroundImages2/images2/landing_light.png');
testImagePath('wheel_well', 10, '/packageWalkaroundImages3/images3/wheel_well.png');
console.log('');

// 测试3：边界情况
console.log('【测试3】边界情况测试');
console.log('-----------------------------------');
// 区域1（最小）
testImagePath('pitot_probes', 1, '/packageWalkaroundImages1/images1/pitot_probes.png');
// 区域24（最大）
testImagePath('rudder', 24, '/packageWalkaroundImages6/images6/rudder.png');
console.log('');

// 测试4：共享图片判断
console.log('【测试4】共享图片判断');
console.log('-----------------------------------');
console.log('slat 是共享图片？', ImagePathMapper.isSharedImage('slat') ? '✅ 是' : '❌ 否');
console.log('fuel_water_drain_valve 是共享图片？', ImagePathMapper.isSharedImage('fuel_water_drain_valve') ? '✅ 是' : '❌ 否');
console.log('radome 是共享图片？', ImagePathMapper.isSharedImage('radome') ? '❌ 是（错误）' : '✅ 否');
console.log('');

// 测试5：共享图片统计
console.log('【测试5】共享图片统计');
console.log('-----------------------------------');
var stats = ImagePathMapper.getSharedImagesStats();
console.log('共享图片总数:', stats.totalCount);
console.log('分类统计:', JSON.stringify(stats.categories, null, 2));
console.log('');

console.log('========== 测试完成 ==========');

/**
 * 测试辅助函数
 */
function testImagePath(componentId, areaId, expectedPath) {
  var actualPath = ImagePathMapper.getImagePath(componentId, areaId);
  var passed = actualPath === expectedPath;

  console.log(
    (passed ? '✅' : '❌'),
    'getImagePath(\'' + componentId + '\', ' + areaId + ')',
    passed ? '' : '\n   预期: ' + expectedPath + '\n   实际: ' + actualPath
  );
}
