'use strict';

/**
 * Basic tests for AudioBugDetector
 * Verifies core functionality of the audio bug detection module
 */

var AudioBugDetector = require('../audio-bug-detector.js');

// Test helper
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message + ': expected ' + expected + ', got ' + actual);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test 1: Module loads correctly
console.log('Test 1: Module structure');
assertTrue(typeof AudioBugDetector === 'object', 'AudioBugDetector should be an object');
assertTrue(typeof AudioBugDetector.checkSingletonPattern === 'function', 'checkSingletonPattern should be a function');
assertTrue(typeof AudioBugDetector.checkiOSCompatibility === 'function', 'checkiOSCompatibility should be a function');
assertTrue(typeof AudioBugDetector.checkStateManagement === 'function', 'checkStateManagement should be a function');
assertTrue(typeof AudioBugDetector.checkErrorHandling === 'function', 'checkErrorHandling should be a function');
assertTrue(typeof AudioBugDetector.auditAll === 'function', 'auditAll should be a function');
console.log('  ✅ All methods exist');

// Test 2: checkSingletonPattern with good code
console.log('Test 2: checkSingletonPattern - good code');
var goodSingletonCode = [
  'Page({',
  '  onLoad: function() {',
  '    this.audioContext = wx.createInnerAudioContext();',
  '  },',
  '  onUnload: function() {',
  '    if (this.audioContext) {',
  '      this.audioContext.stop();',
  '      this.audioContext.destroy();',
  '    }',
  '  }',
  '});'
].join('\n');

var result2 = AudioBugDetector.checkSingletonPattern({ 
  code: goodSingletonCode, 
  filePath: 'test.js' 
});
assertEqual(result2.length, 0, 'Good singleton code should have no issues');
console.log('  ✅ Good singleton code passes');


// Test 3: checkSingletonPattern with bad code (no destroy)
console.log('Test 3: checkSingletonPattern - missing destroy');
var badSingletonCode = [
  'Page({',
  '  onLoad: function() {',
  '    this.audioContext = wx.createInnerAudioContext();',
  '  },',
  '  playAudio: function() {',
  '    this.audioContext.play();',
  '  }',
  '});'
].join('\n');

var result3 = AudioBugDetector.checkSingletonPattern({ 
  code: badSingletonCode, 
  filePath: 'test.js' 
});
assertTrue(result3.length > 0, 'Missing destroy should be detected');
assertEqual(result3[0].type, 'audio_not_singleton', 'Issue type should be audio_not_singleton');
console.log('  ✅ Missing destroy detected');

// Test 4: checkiOSCompatibility with proper config
console.log('Test 4: checkiOSCompatibility - good config');
var iosGoodCode = [
  'wx.setInnerAudioOption({ obeyMuteSwitch: false, speakerOn: true });',
  'this.audioContext = wx.createInnerAudioContext();'
].join('\n');

var result4 = AudioBugDetector.checkiOSCompatibility({ 
  code: iosGoodCode, 
  filePath: 'test.js' 
});
assertTrue(result4.hasGlobalConfig, 'Should detect global config');
assertEqual(result4.obeyMuteSwitch, false, 'obeyMuteSwitch should be false');
assertEqual(result4.issues.length, 0, 'Good iOS config should have no issues');
console.log('  ✅ Good iOS config passes');

// Test 5: checkiOSCompatibility with missing config
console.log('Test 5: checkiOSCompatibility - missing config');
var iosBadCode = [
  'this.audioContext = wx.createInnerAudioContext();',
  'this.audioContext.play();'
].join('\n');

var result5 = AudioBugDetector.checkiOSCompatibility({ 
  code: iosBadCode, 
  filePath: 'test.js' 
});
assertTrue(!result5.hasGlobalConfig, 'Should not detect global config');
assertTrue(result5.issues.length > 0, 'Missing config should be detected');
assertEqual(result5.issues[0].severity, 'critical', 'Missing iOS config should be critical');
console.log('  ✅ Missing iOS config detected');

// Test 6: checkErrorHandling with onError and retry
console.log('Test 6: checkErrorHandling - with onError and retry');
var errorGoodCode = [
  'this.audioContext = wx.createInnerAudioContext();',
  'this.audioContext.onError(function(res) {',
  '  wx.showToast({ title: "error" });',
  '  this.retryPlay();',
  '});'
].join('\n');

var result6 = AudioBugDetector.checkErrorHandling({ 
  code: errorGoodCode, 
  filePath: 'test.js' 
});
assertEqual(result6.length, 0, 'Code with onError, user feedback and retry should pass');
console.log('  ✅ Error handling with feedback and retry passes');

// Test 7: checkErrorHandling without onError
console.log('Test 7: checkErrorHandling - missing onError');
var errorBadCode = [
  'this.audioContext = wx.createInnerAudioContext();',
  'this.audioContext.play();'
].join('\n');

var result7 = AudioBugDetector.checkErrorHandling({ 
  code: errorBadCode, 
  filePath: 'test.js' 
});
assertTrue(result7.length > 0, 'Missing onError should be detected');
assertEqual(result7[0].type, 'audio_missing_error_handler', 'Issue type should be audio_missing_error_handler');
console.log('  ✅ Missing onError detected');

// Test 8: checkStateManagement - missing interruption handling
console.log('Test 8: checkStateManagement - missing interruption handling');
var stateCode = [
  'this.audioContext = wx.createInnerAudioContext();',
  'this.audioContext.play();'
].join('\n');

var result8 = AudioBugDetector.checkStateManagement({ 
  code: stateCode, 
  filePath: 'test.js' 
});
assertTrue(result8.length > 0, 'Missing interruption handling should be detected');
console.log('  ✅ Missing interruption handling detected');

// Test 9: auditAll comprehensive test
console.log('Test 9: auditAll - comprehensive audit');
var comprehensiveCode = [
  'Page({',
  '  data: { isPlaying: false },',
  '  onLoad: function() {',
  '    wx.setInnerAudioOption({ obeyMuteSwitch: false });',
  '    this.audioContext = wx.createInnerAudioContext();',
  '    this.audioContext.onError(function(res) {',
  '      wx.showToast({ title: "播放失败，请重试" });',
  '    });',
  '    this.audioContext.onInterruptionBegin(function() {});',
  '    this.audioContext.onInterruptionEnd(function() {});',
  '  },',
  '  onUnload: function() {',
  '    if (this.audioContext) {',
  '      this.audioContext.stop();',
  '      this.audioContext.destroy();',
  '    }',
  '  },',
  '  playAudio: function() {',
  '    this.audioContext.play();',
  '  }',
  '});'
].join('\n');

var result9 = AudioBugDetector.auditAll({ 
  code: comprehensiveCode, 
  filePath: 'test.js' 
});
assertTrue(result9.summary.hasAudioCode, 'Should detect audio code');
console.log('  Total issues:', result9.summary.totalIssues);
console.log('  ✅ Comprehensive audit completed');

console.log('\n========================================');
console.log('✅ All basic tests passed!');
console.log('========================================');
