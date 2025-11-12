/**
 * setData性能优化测试脚本
 * 用于验证BasePage优化效果
 */

// 模拟小程序环境
const mockWxAPI = {
  showToast: () => {},
  hideLoading: () => {},
  showLoading: () => {}
};

// 模拟setData方法
let setDataCallCount = 0;
let queueOverflowCount = 0;

const mockPage = {
  setData: function(data, callback) {
    setDataCallCount++;
    // 模拟setData执行时间
    setTimeout(() => {
      if (callback) callback();
    }, 10);
  }
};

// 引入优化后的BasePage
const BasePage = require('./miniprogram/utils/base-page.js').BasePage;

// 创建测试页面实例
const testPage = Object.assign({}, BasePage, mockPage);
testPage._setDataStats = {
  totalCalls: 0,
  queuedCalls: 0,
  throttledCalls: 0,
  maxQueueSize: 0,
  lastStatsReport: Date.now()
};

console.log('🧪 开始setData性能优化测试...\n');

// 测试1：高频GPS数据更新
console.log('📡 测试1：高频GPS数据更新（100次）');
const startTime1 = Date.now();
for (let i = 0; i < 100; i++) {
  testPage.safeSetData({
    latitude: 39.9042 + Math.random() * 0.01,
    longitude: 116.4074 + Math.random() * 0.01,
    speed: Math.random() * 100
  }, null, {
    priority: 'high',
    throttleKey: 'gps'
  });
}

setTimeout(() => {
  const duration1 = Date.now() - startTime1;
  console.log(`✅ 完成，耗时: ${duration1}ms`);
  console.log(`📊 实际setData调用次数: ${setDataCallCount}`);
  console.log(`🚀 节流效果: ${Math.round((100 - setDataCallCount) / 100 * 100)}%减少\n`);

  // 测试2：混合优先级数据更新
  console.log('🔄 测试2：混合优先级数据更新');
  setDataCallCount = 0;
  const startTime2 = Date.now();
  
  // 模拟真实场景：GPS + 传感器 + 调试数据
  for (let i = 0; i < 50; i++) {
    // 高优先级GPS数据
    testPage.safeSetData({
      latitude: 39.9042,
      longitude: 116.4074
    }, null, {
      priority: 'high',
      throttleKey: 'gps'
    });
    
    // 普通优先级传感器数据
    testPage.safeSetData({
      heading: Math.random() * 360
    }, null, {
      priority: 'normal',
      throttleKey: 'sensor'
    });
    
    // 低优先级调试数据
    testPage.safeSetData({
      'debugData.updateTime': new Date().toISOString()
    }, null, {
      priority: 'low',
      throttleKey: 'debug'
    });
  }

  setTimeout(() => {
    const duration2 = Date.now() - startTime2;
    console.log(`✅ 完成，耗时: ${duration2}ms`);
    console.log(`📊 实际setData调用次数: ${setDataCallCount} / 150`);
    console.log(`🎯 优化效果: ${Math.round((150 - setDataCallCount) / 150 * 100)}%减少`);
    
    // 输出统计信息
    console.log('\n📈 性能统计:', {
      '总调用次数': testPage._setDataStats?.totalCalls || 0,
      '排队次数': testPage._setDataStats?.queuedCalls || 0,
      '节流次数': testPage._setDataStats?.throttledCalls || 0,
      '最大队列长度': testPage._setDataStats?.maxQueueSize || 0
    });
    
    console.log('\n🎉 测试完成！setData队列满警告应大幅减少。');
  }, 2000);
}, 1500);