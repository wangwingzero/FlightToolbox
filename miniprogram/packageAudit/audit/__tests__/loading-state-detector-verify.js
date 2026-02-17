'use strict';

/**
 * Quick verification test for LoadingStateDetector
 */

var LoadingStateDetector = require('../loading-state-detector.js');

// Test 1: Detect wx.request without loading state
var testCode1 = [
  'Page({',
  '  data: {',
  '    list: []',
  '  },',
  '  onLoad: function() {',
  '    wx.request({',
  '      url: "https://api.example.com/data",',
  '      success: function(res) {',
  '        this.setData({ list: res.data });',
  '      }',
  '    });',
  '  }',
  '});'
].join('\n');

var issues1 = LoadingStateDetector.scanAsyncOperations({
  code: testCode1,
  filePath: 'pages/test/index.js'
});

console.log('Test 1 - wx.request without loading:');
console.log('  Issues found:', issues1.length);
if (issues1.length > 0) {
  console.log('  First issue type:', issues1[0].type);
  console.log('  Severity:', issues1[0].severity);
}

// Test 2: Detect wx.request with loading state
var testCode2 = [
  'Page({',
  '  data: {',
  '    loading: false,',
  '    list: []',
  '  },',
  '  onLoad: function() {',
  '    this.setData({ loading: true });',
  '    wx.request({',
  '      url: "https://api.example.com/data",',
  '      success: function(res) {',
  '        this.setData({ list: res.data, loading: false });',
  '      },',
  '      fail: function(err) {',
  '        this.setData({ loading: false });',
  '        wx.showToast({ title: "Error", icon: "none" });',
  '      }',
  '    });',
  '  }',
  '});'
].join('\n');

var issues2 = LoadingStateDetector.scanAsyncOperations({
  code: testCode2,
  filePath: 'pages/test/index.js'
});

console.log('\nTest 2 - wx.request with loading:');
console.log('  Issues found:', issues2.length);

// Test 3: Page analysis
var analysis = LoadingStateDetector.analyzePageLoadingState({
  code: testCode1,
  filePath: 'pages/test/index.js'
});

console.log('\nTest 3 - Page analysis:');
console.log('  Has loading in data:', analysis.hasLoadingInData);
console.log('  Has wx.showLoading:', analysis.hasShowLoading);
console.log('  Async operations:', analysis.asyncOperations.length);

console.log('\n✅ Verification complete');
