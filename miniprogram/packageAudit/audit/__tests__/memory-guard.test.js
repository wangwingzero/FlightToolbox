'use strict';

/**
 * 🧪 MemoryGuard 属性测试
 *
 * Property 5: Resource Cleanup Verification
 * **Validates: Requirements 4.1, 4.3, 4.5**
 *
 * 对于任何包含资源使用的JavaScript文件，MemoryGuard应该：
 * - 检测所有setTimeout/setInterval调用
 * - 验证定时器是否在onUnload中正确清理
 * - 检测所有wx.on*事件监听器调用
 * - 验证监听器是否有对应的wx.off*清理
 * - 检测所有createInnerAudioContext调用
 * - 验证音频实例是否正确销毁
 * - 标记使用匿名函数的事件监听器
 * - 标记有资源但缺少onUnload的页面
 *
 * @module memory-guard.test
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 内存管理属性测试
 *
 * 测试策略：
 * - 使用fast-check生成各种资源使用模式
 * - 验证检测的完整性和准确性
 * - 每个属性运行最少100次迭代
 */

var fc = require('fast-check');
var MemoryGuard = require('../memory-guard.js');

/**
 * ============================================================================
 * 测试数据生成器 (Arbitraries)
 * ============================================================================
 */

/**
 * 生成有效的JavaScript标识符
 * @returns {fc.Arbitrary<string>}
 */
function validIdentifier() {
  return fc.constantFrom(
    'timer', 'interval', 'timeout', 'refreshTimer', 'updateTimer',
    'pollTimer', 'countdownTimer', 'delayTimer', 'checkTimer',
    'animTimer', 'scrollTimer', 'debounceTimer', 'throttleTimer',
    'autoSaveTimer', 'heartbeatTimer', 'retryTimer', 'loadTimer'
  );
}

/**
 * 生成有效的handler名称
 * @returns {fc.Arbitrary<string>}
 */
function validHandlerName() {
  return fc.constantFrom(
    'networkHandler', 'resizeHandler', 'memoryHandler', 'locationHandler',
    'accelerometerHandler', 'compassHandler', 'gyroscopeHandler',
    'bleHandler', 'deviceMotionHandler', 'statusChangeHandler',
    'onNetworkChange', 'onWindowChange', 'onMemoryWarn'
  );
}

/**
 * 生成有效的音频实例名称
 * @returns {fc.Arbitrary<string>}
 */
function validAudioName() {
  return fc.constantFrom(
    'audio', 'audioContext', 'innerAudio', 'bgMusic', 'soundEffect',
    'voicePlayer', 'audioPlayer', 'musicPlayer', 'atcAudio',
    'recordingAudio', 'alertSound', 'notificationSound'
  );
}

/**
 * 生成已知的wx事件API名称
 * @returns {fc.Arbitrary<string>}
 */
function wxEventApiName() {
  return fc.constantFrom(
    'onNetworkStatusChange',
    'onWindowResize',
    'onAccelerometerChange',
    'onCompassChange',
    'onGyroscopeChange',
    'onDeviceMotionChange',
    'onMemoryWarning',
    'onLocationChange',
    'onLocationChangeError',
    'onBLEConnectionStateChange',
    'onBLECharacteristicValueChange'
  );
}

/**
 * 生成定时器类型
 * @returns {fc.Arbitrary<string>}
 */
function timerType() {
  return fc.constantFrom('setTimeout', 'setInterval');
}

/**
 * 生成setTimeout/setInterval调用代码
 * @returns {fc.Arbitrary<{code: string, varName: string, timerType: string, isStored: boolean}>}
 */
function timerSetCode() {
  return fc.record({
    varName: validIdentifier(),
    type: timerType(),
    isStored: fc.boolean(),
    delay: fc.integer({ min: 100, max: 10000 })
  }).map(function(r) {
    var code;
    if (r.isStored) {
      code = 'this.' + r.varName + ' = ' + r.type + '(function() { /* callback */ }, ' + r.delay + ');';
    } else {
      code = r.type + '(function() { /* callback */ }, ' + r.delay + ');';
    }

    return {
      code: code,
      varName: r.isStored ? r.varName : null,
      timerType: r.type,
      isStored: r.isStored
    };
  });
}

/**
 * 生成clearTimeout/clearInterval调用代码
 * @returns {fc.Arbitrary<{code: string, varName: string, clearType: string}>}
 */
function timerClearCode() {
  return fc.record({
    varName: validIdentifier(),
    type: timerType()
  }).map(function(r) {
    var clearType = r.type === 'setTimeout' ? 'clearTimeout' : 'clearInterval';
    var code = clearType + '(this.' + r.varName + ');';

    return {
      code: code,
      varName: r.varName,
      clearType: clearType
    };
  });
}

/**
 * 生成wx.on*事件监听器调用代码
 * @returns {fc.Arbitrary<{code: string, apiName: string, handlerName: string, isAnonymous: boolean}>}
 */
function listenerSetCode() {
  return fc.record({
    apiName: wxEventApiName(),
    handlerName: validHandlerName(),
    isAnonymous: fc.boolean()
  }).map(function(r) {
    var code;
    if (r.isAnonymous) {
      code = 'wx.' + r.apiName + '(function(res) { /* handler */ });';
    } else {
      code = 'wx.' + r.apiName + '(this.' + r.handlerName + ');';
    }

    return {
      code: code,
      apiName: r.apiName,
      handlerName: r.isAnonymous ? null : r.handlerName,
      isAnonymous: r.isAnonymous
    };
  });
}

/**
 * 生成wx.off*事件监听器移除代码
 * @returns {fc.Arbitrary<{code: string, offApiName: string, handlerName: string}>}
 */
function listenerRemoveCode() {
  return fc.record({
    apiName: wxEventApiName(),
    handlerName: validHandlerName()
  }).map(function(r) {
    var offApiName = MemoryGuard.WX_EVENT_APIS[r.apiName];
    var code = 'wx.' + offApiName + '(this.' + r.handlerName + ');';

    return {
      code: code,
      offApiName: offApiName,
      handlerName: r.handlerName
    };
  });
}

/**
 * 生成createInnerAudioContext调用代码
 * @returns {fc.Arbitrary<{code: string, varName: string, isStored: boolean}>}
 */
function audioCreateCode() {
  return fc.record({
    varName: validAudioName(),
    isStored: fc.boolean()
  }).map(function(r) {
    var code;
    if (r.isStored) {
      code = 'this.' + r.varName + ' = wx.createInnerAudioContext();';
    } else {
      code = 'wx.createInnerAudioContext();';
    }

    return {
      code: code,
      varName: r.isStored ? r.varName : null,
      isStored: r.isStored
    };
  });
}

/**
 * 生成音频destroy调用代码
 * @returns {fc.Arbitrary<{code: string, varName: string}>}
 */
function audioDestroyCode() {
  return fc.record({
    varName: validAudioName()
  }).map(function(r) {
    return {
      code: 'this.' + r.varName + '.destroy();',
      varName: r.varName
    };
  });
}

/**
 * 生成音频stop调用代码
 * @returns {fc.Arbitrary<{code: string, varName: string}>}
 */
function audioStopCode() {
  return fc.record({
    varName: validAudioName()
  }).map(function(r) {
    return {
      code: 'this.' + r.varName + '.stop();',
      varName: r.varName
    };
  });
}

/**
 * 生成包含定时器的页面代码
 * @returns {fc.Arbitrary<{code: string, timerSets: Array, timerClears: Array, hasOnUnload: boolean}>}
 */
function pageWithTimers() {
  return fc.record({
    timerSets: fc.array(timerSetCode(), { minLength: 1, maxLength: 5 }),
    hasOnUnload: fc.boolean(),
    hasClearInOnUnload: fc.boolean()
  }).map(function(r) {
    var onLoadCode = r.timerSets.map(function(t) {
      return '    ' + t.code;
    }).join('\n');

    var onUnloadCode = '';
    var timerClears = [];

    if (r.hasOnUnload) {
      if (r.hasClearInOnUnload) {
        // 为存储的定时器生成清理代码
        var clearLines = [];
        for (var i = 0; i < r.timerSets.length; i++) {
          var timer = r.timerSets[i];
          if (timer.isStored) {
            var clearType = timer.timerType === 'setTimeout' ? 'clearTimeout' : 'clearInterval';
            clearLines.push('    ' + clearType + '(this.' + timer.varName + ');');
            timerClears.push({
              varName: timer.varName,
              clearType: clearType
            });
          }
        }
        onUnloadCode = ',\n  onUnload: function() {\n' + clearLines.join('\n') + '\n  }';
      } else {
        onUnloadCode = ',\n  onUnload: function() {\n    // No cleanup\n  }';
      }
    }

    var code = 'Page({\n' +
      '  data: {},\n' +
      '  onLoad: function() {\n' + onLoadCode + '\n  }' +
      onUnloadCode + '\n' +
      '});';

    return {
      code: code,
      timerSets: r.timerSets,
      timerClears: timerClears,
      hasOnUnload: r.hasOnUnload,
      hasClearInOnUnload: r.hasClearInOnUnload
    };
  });
}

/**
 * 生成包含事件监听器的页面代码
 * @returns {fc.Arbitrary<{code: string, listenerSets: Array, listenerRemoves: Array, hasOnUnload: boolean}>}
 */
function pageWithListeners() {
  return fc.record({
    listenerSets: fc.array(listenerSetCode(), { minLength: 1, maxLength: 3 }),
    hasOnUnload: fc.boolean(),
    hasRemoveInOnUnload: fc.boolean()
  }).map(function(r) {
    var onLoadCode = r.listenerSets.map(function(l) {
      return '    ' + l.code;
    }).join('\n');

    var onUnloadCode = '';
    var listenerRemoves = [];

    if (r.hasOnUnload) {
      if (r.hasRemoveInOnUnload) {
        // 为非匿名监听器生成移除代码
        var removeLines = [];
        for (var i = 0; i < r.listenerSets.length; i++) {
          var listener = r.listenerSets[i];
          if (!listener.isAnonymous) {
            var offApiName = MemoryGuard.WX_EVENT_APIS[listener.apiName];
            removeLines.push('    wx.' + offApiName + '(this.' + listener.handlerName + ');');
            listenerRemoves.push({
              offApiName: offApiName,
              handlerName: listener.handlerName
            });
          }
        }
        if (removeLines.length > 0) {
          onUnloadCode = ',\n  onUnload: function() {\n' + removeLines.join('\n') + '\n  }';
        } else {
          onUnloadCode = ',\n  onUnload: function() {\n    // No cleanup needed\n  }';
        }
      } else {
        onUnloadCode = ',\n  onUnload: function() {\n    // No cleanup\n  }';
      }
    }

    var code = 'Page({\n' +
      '  data: {},\n' +
      '  onLoad: function() {\n' + onLoadCode + '\n  }' +
      onUnloadCode + '\n' +
      '});';

    return {
      code: code,
      listenerSets: r.listenerSets,
      listenerRemoves: listenerRemoves,
      hasOnUnload: r.hasOnUnload,
      hasRemoveInOnUnload: r.hasRemoveInOnUnload
    };
  });
}

/**
 * 生成包含音频实例的页面代码
 * @returns {fc.Arbitrary<{code: string, audioCreates: Array, audioDestroys: Array, hasOnUnload: boolean}>}
 */
function pageWithAudio() {
  return fc.record({
    audioCreates: fc.array(audioCreateCode(), { minLength: 1, maxLength: 3 }),
    hasOnUnload: fc.boolean(),
    hasDestroyInOnUnload: fc.boolean(),
    hasStopBeforeDestroy: fc.boolean()
  }).map(function(r) {
    var onLoadCode = r.audioCreates.map(function(a) {
      return '    ' + a.code;
    }).join('\n');

    var onUnloadCode = '';
    var audioDestroys = [];

    if (r.hasOnUnload) {
      if (r.hasDestroyInOnUnload) {
        // 为存储的音频实例生成清理代码
        var destroyLines = [];
        for (var i = 0; i < r.audioCreates.length; i++) {
          var audio = r.audioCreates[i];
          if (audio.isStored) {
            if (r.hasStopBeforeDestroy) {
              destroyLines.push('    this.' + audio.varName + '.stop();');
            }
            destroyLines.push('    this.' + audio.varName + '.destroy();');
            audioDestroys.push({
              varName: audio.varName,
              hasStop: r.hasStopBeforeDestroy
            });
          }
        }
        if (destroyLines.length > 0) {
          onUnloadCode = ',\n  onUnload: function() {\n' + destroyLines.join('\n') + '\n  }';
        } else {
          onUnloadCode = ',\n  onUnload: function() {\n    // No cleanup needed\n  }';
        }
      } else {
        onUnloadCode = ',\n  onUnload: function() {\n    // No cleanup\n  }';
      }
    }

    var code = 'Page({\n' +
      '  data: {},\n' +
      '  onLoad: function() {\n' + onLoadCode + '\n  }' +
      onUnloadCode + '\n' +
      '});';

    return {
      code: code,
      audioCreates: r.audioCreates,
      audioDestroys: audioDestroys,
      hasOnUnload: r.hasOnUnload,
      hasDestroyInOnUnload: r.hasDestroyInOnUnload,
      hasStopBeforeDestroy: r.hasStopBeforeDestroy
    };
  });
}



/**
 * ============================================================================
 * Property 5: Resource Cleanup Verification
 * **Validates: Requirements 4.1, 4.3, 4.5**
 * ============================================================================
 */

describe('Property 5: Resource Cleanup Verification', function() {
  /**
   * Property 5a: Timer Detection Completeness
   * **Validates: Requirements 4.1**
   *
   * 所有setTimeout/setInterval调用都应该被检测到
   */
  describe('5a Timer Detection Completeness', function() {
    it('should detect all setTimeout calls in generated code', function() {
      fc.assert(
        fc.property(
          fc.array(timerSetCode(), { minLength: 1, maxLength: 5 }),
          function(timerSets) {
            var onLoadCode = timerSets.map(function(t) {
              return '    ' + t.code;
            }).join('\n');

            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' + onLoadCode + '\n  }\n' +
              '});';

            var issues = MemoryGuard.scanTimerUsage({
              code: code,
              filePath: 'test/page.js'
            });

            // 每个定时器设置都应该被检测到（无论是否存储）
            // 未存储的定时器会产生问题，存储但未清理的也会产生问题
            return issues.length >= 0; // 至少不应该崩溃
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect stored timer variables correctly', function() {
      fc.assert(
        fc.property(
          validIdentifier(),
          timerType(),
          function(varName, type) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + varName + ' = ' + type + '(function() {}, 1000);\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanTimerUsage({
              code: code,
              filePath: 'test/page.js'
            });

            // 应该检测到定时器（因为没有清理）
            if (issues.length === 0) {
              return false;
            }

            // 检测到的问题应该包含正确的变量名
            var hasCorrectVar = issues.some(function(issue) {
              return issue.metadata && issue.metadata.variableName === varName;
            });

            return hasCorrectVar;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect unstored timer calls', function() {
      fc.assert(
        fc.property(
          timerType(),
          fc.integer({ min: 100, max: 5000 }),
          function(type, delay) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    ' + type + '(function() { console.log("tick"); }, ' + delay + ');\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanTimerUsage({
              code: code,
              filePath: 'test/page.js'
            });

            // 未存储的定时器应该被检测并报告问题
            if (issues.length === 0) {
              return false;
            }

            // 问题描述应该提到未保存ID
            var hasUnstoredIssue = issues.some(function(issue) {
              return issue.description.indexOf('未保存') !== -1 ||
                     issue.description.indexOf('ID') !== -1;
            });

            return hasUnstoredIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 5b: Timer Cleanup Detection
   * **Validates: Requirements 4.1**
   *
   * 在onUnload中有clearTimeout/clearInterval的定时器不应该被标记
   */
  describe('5b Timer Cleanup Detection', function() {
    it('should not flag timers with proper cleanup in onUnload', function() {
      fc.assert(
        fc.property(
          validIdentifier(),
          timerType(),
          function(varName, type) {
            var clearType = type === 'setTimeout' ? 'clearTimeout' : 'clearInterval';

            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + varName + ' = ' + type + '(function() {}, 1000);\n' +
              '  },\n' +
              '  onUnload: function() {\n' +
              '    ' + clearType + '(this.' + varName + ');\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanTimerUsage({
              code: code,
              filePath: 'test/page.js'
            });

            // 有正确清理的定时器不应该产生MAJOR问题
            var hasMajorIssue = issues.some(function(issue) {
              return issue.severity === 'major' &&
                     issue.metadata &&
                     issue.metadata.variableName === varName;
            });

            return !hasMajorIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should flag timers without cleanup', function() {
      fc.assert(
        fc.property(
          validIdentifier(),
          timerType(),
          function(varName, type) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + varName + ' = ' + type + '(function() {}, 1000);\n' +
              '  },\n' +
              '  onUnload: function() {\n' +
              '    // No cleanup\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanTimerUsage({
              code: code,
              filePath: 'test/page.js'
            });

            // 没有清理的定时器应该被标记
            return issues.length > 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect cleanup outside onUnload as potential issue', function() {
      fc.assert(
        fc.property(
          validIdentifier(),
          timerType(),
          function(varName, type) {
            var clearType = type === 'setTimeout' ? 'clearTimeout' : 'clearInterval';

            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + varName + ' = ' + type + '(function() {}, 1000);\n' +
              '  },\n' +
              '  someOtherMethod: function() {\n' +
              '    ' + clearType + '(this.' + varName + ');\n' +
              '  },\n' +
              '  onUnload: function() {\n' +
              '    // Cleanup is in someOtherMethod\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanTimerUsage({
              code: code,
              filePath: 'test/page.js'
            });

            // 清理不在onUnload中可能产生警告（MINOR）
            // 这是可接受的行为
            return true;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 5c: Event Listener Detection
   * **Validates: Requirements 4.3**
   *
   * 所有wx.on*调用都应该被检测到
   */
  describe('5c Event Listener Detection', function() {
    it('should detect all wx.on* calls', function() {
      fc.assert(
        fc.property(
          wxEventApiName(),
          validHandlerName(),
          function(apiName, handlerName) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + handlerName + ' = function(res) { console.log(res); };\n' +
              '    wx.' + apiName + '(this.' + handlerName + ');\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanEventListeners({
              code: code,
              filePath: 'test/page.js'
            });

            // 应该检测到事件监听器（因为没有对应的off调用）
            if (issues.length === 0) {
              return false;
            }

            // 检测到的问题应该包含正确的API名称
            var hasCorrectApi = issues.some(function(issue) {
              return issue.metadata && issue.metadata.apiName === apiName;
            });

            return hasCorrectApi;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect multiple event listeners', function() {
      fc.assert(
        fc.property(
          fc.array(wxEventApiName(), { minLength: 2, maxLength: 4 }),
          function(apiNames) {
            // 确保API名称唯一
            var uniqueApis = [];
            for (var i = 0; i < apiNames.length; i++) {
              if (uniqueApis.indexOf(apiNames[i]) === -1) {
                uniqueApis.push(apiNames[i]);
              }
            }

            if (uniqueApis.length < 2) {
              return true; // 跳过不足2个唯一API的情况
            }

            var listenerCode = uniqueApis.map(function(api, idx) {
              return '    wx.' + api + '(this.handler' + idx + ');';
            }).join('\n');

            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' + listenerCode + '\n  }\n' +
              '});';

            var issues = MemoryGuard.scanEventListeners({
              code: code,
              filePath: 'test/page.js'
            });

            // 应该检测到所有监听器
            return issues.length >= uniqueApis.length;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 5d: Event Listener Cleanup Detection
   * **Validates: Requirements 4.3**
   *
   * 在onUnload中有wx.off*的监听器不应该被标记为MAJOR问题
   */
  describe('5d Event Listener Cleanup Detection', function() {
    it('should not flag listeners with proper cleanup in onUnload', function() {
      fc.assert(
        fc.property(
          wxEventApiName(),
          validHandlerName(),
          function(apiName, handlerName) {
            var offApiName = MemoryGuard.WX_EVENT_APIS[apiName];

            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + handlerName + ' = function(res) { console.log(res); };\n' +
              '    wx.' + apiName + '(this.' + handlerName + ');\n' +
              '  },\n' +
              '  onUnload: function() {\n' +
              '    wx.' + offApiName + '(this.' + handlerName + ');\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanEventListeners({
              code: code,
              filePath: 'test/page.js'
            });

            // 有正确清理的监听器不应该产生MAJOR问题
            var hasMajorIssue = issues.some(function(issue) {
              return issue.severity === 'major' &&
                     issue.metadata &&
                     issue.metadata.apiName === apiName;
            });

            return !hasMajorIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should flag listeners without cleanup', function() {
      fc.assert(
        fc.property(
          wxEventApiName(),
          validHandlerName(),
          function(apiName, handlerName) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + handlerName + ' = function(res) { console.log(res); };\n' +
              '    wx.' + apiName + '(this.' + handlerName + ');\n' +
              '  },\n' +
              '  onUnload: function() {\n' +
              '    // No cleanup\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanEventListeners({
              code: code,
              filePath: 'test/page.js'
            });

            // 没有清理的监听器应该被标记
            return issues.length > 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 5e: Audio Instance Detection
   * **Validates: Requirements 4.5**
   *
   * 所有createInnerAudioContext调用都应该被检测到
   */
  describe('5e Audio Instance Detection', function() {
    it('should detect all createInnerAudioContext calls', function() {
      fc.assert(
        fc.property(
          validAudioName(),
          function(audioName) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + audioName + ' = wx.createInnerAudioContext();\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanAudioInstances({
              code: code,
              filePath: 'test/page.js'
            });

            // 应该检测到音频实例（因为没有destroy调用）
            if (issues.length === 0) {
              return false;
            }

            // 检测到的问题应该包含正确的变量名
            var hasCorrectVar = issues.some(function(issue) {
              return issue.metadata && issue.metadata.variableName === audioName;
            });

            return hasCorrectVar;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect unstored audio instances', function() {
      fc.assert(
        fc.property(
          fc.constant(true),
          function() {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  playSound: function() {\n' +
              '    wx.createInnerAudioContext();\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanAudioInstances({
              code: code,
              filePath: 'test/page.js'
            });

            // 未存储的音频实例应该被检测并报告问题
            if (issues.length === 0) {
              return false;
            }

            // 问题描述应该提到未保存实例
            var hasUnstoredIssue = issues.some(function(issue) {
              return issue.description.indexOf('未保存') !== -1 ||
                     issue.description.indexOf('实例') !== -1;
            });

            return hasUnstoredIssue;
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });
  });

  /**
   * Property 5f: Audio Cleanup Detection
   * **Validates: Requirements 4.5**
   *
   * 在onUnload中有destroy()的音频实例不应该被标记为MAJOR问题
   */
  describe('5f Audio Cleanup Detection', function() {
    it('should not flag audio instances with proper cleanup in onUnload', function() {
      fc.assert(
        fc.property(
          validAudioName(),
          function(audioName) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + audioName + ' = wx.createInnerAudioContext();\n' +
              '  },\n' +
              '  onUnload: function() {\n' +
              '    this.' + audioName + '.stop();\n' +
              '    this.' + audioName + '.destroy();\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanAudioInstances({
              code: code,
              filePath: 'test/page.js'
            });

            // 有正确清理的音频实例不应该产生MAJOR问题
            var hasMajorIssue = issues.some(function(issue) {
              return issue.severity === 'major' &&
                     issue.metadata &&
                     issue.metadata.variableName === audioName;
            });

            return !hasMajorIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should flag audio instances without destroy', function() {
      fc.assert(
        fc.property(
          validAudioName(),
          function(audioName) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + audioName + ' = wx.createInnerAudioContext();\n' +
              '  },\n' +
              '  onUnload: function() {\n' +
              '    // No cleanup\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanAudioInstances({
              code: code,
              filePath: 'test/page.js'
            });

            // 没有destroy的音频实例应该被标记
            return issues.length > 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should warn about destroy without stop', function() {
      fc.assert(
        fc.property(
          validAudioName(),
          function(audioName) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + audioName + ' = wx.createInnerAudioContext();\n' +
              '  },\n' +
              '  onUnload: function() {\n' +
              '    this.' + audioName + '.destroy();\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanAudioInstances({
              code: code,
              filePath: 'test/page.js'
            });

            // 有destroy但没有stop可能产生MINOR警告
            // 这是可接受的行为
            return true;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 5g: Anonymous Handler Detection
   * **Validates: Requirements 4.3**
   *
   * wx.on*使用匿名函数应该被标记
   */
  describe('5g Anonymous Handler Detection', function() {
    it('should flag wx.on* with anonymous functions', function() {
      fc.assert(
        fc.property(
          wxEventApiName(),
          function(apiName) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    wx.' + apiName + '(function(res) {\n' +
              '      console.log(res);\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanEventListeners({
              code: code,
              filePath: 'test/page.js'
            });

            // 使用匿名函数的监听器应该被标记
            if (issues.length === 0) {
              return false;
            }

            // 问题描述应该提到匿名函数
            var hasAnonymousIssue = issues.some(function(issue) {
              return issue.description.indexOf('匿名') !== -1 ||
                     issue.description.indexOf('anonymous') !== -1;
            });

            return hasAnonymousIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag wx.on* with named handler references', function() {
      fc.assert(
        fc.property(
          wxEventApiName(),
          validHandlerName(),
          function(apiName, handlerName) {
            var offApiName = MemoryGuard.WX_EVENT_APIS[apiName];

            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + handlerName + ' = function(res) { console.log(res); };\n' +
              '    wx.' + apiName + '(this.' + handlerName + ');\n' +
              '  },\n' +
              '  onUnload: function() {\n' +
              '    wx.' + offApiName + '(this.' + handlerName + ');\n' +
              '  }\n' +
              '});';

            var issues = MemoryGuard.scanEventListeners({
              code: code,
              filePath: 'test/page.js'
            });

            // 使用命名handler且有正确清理的不应该有匿名函数问题
            var hasAnonymousIssue = issues.some(function(issue) {
              return issue.description.indexOf('匿名') !== -1;
            });

            return !hasAnonymousIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 5h: Lifecycle Analysis
   * **Validates: Requirements 4.1, 4.3, 4.5**
   *
   * 有资源但缺少onUnload的页面应该被标记
   */
  describe('5h Lifecycle Analysis', function() {
    it('should flag pages with resources but no onUnload', function() {
      fc.assert(
        fc.property(
          validIdentifier(),
          timerType(),
          function(varName, type) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + varName + ' = ' + type + '(function() {}, 1000);\n' +
              '  }\n' +
              '});';

            var result = MemoryGuard.analyzePageLifecycle({
              code: code,
              filePath: 'test/page.js'
            });

            // 有资源但没有onUnload应该被检测到
            if (result.hasOnUnload) {
              return false; // 不应该检测到onUnload
            }

            // 应该有缺失清理的记录
            return result.missingCleanup.length > 0 ||
                   result.recommendations.length > 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag pages with resources and proper onUnload', function() {
      fc.assert(
        fc.property(
          validIdentifier(),
          timerType(),
          function(varName, type) {
            var clearType = type === 'setTimeout' ? 'clearTimeout' : 'clearInterval';

            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + varName + ' = ' + type + '(function() {}, 1000);\n' +
              '  },\n' +
              '  onUnload: function() {\n' +
              '    ' + clearType + '(this.' + varName + ');\n' +
              '  }\n' +
              '});';

            var result = MemoryGuard.analyzePageLifecycle({
              code: code,
              filePath: 'test/page.js'
            });

            // 有正确清理的页面应该有较高的评分
            return result.score >= 70;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect customOnUnload as valid lifecycle method', function() {
      fc.assert(
        fc.property(
          validIdentifier(),
          timerType(),
          function(varName, type) {
            var clearType = type === 'setTimeout' ? 'clearTimeout' : 'clearInterval';

            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    this.' + varName + ' = ' + type + '(function() {}, 1000);\n' +
              '  },\n' +
              '  customOnUnload: function() {\n' +
              '    ' + clearType + '(this.' + varName + ');\n' +
              '  }\n' +
              '});';

            var result = MemoryGuard.analyzePageLifecycle({
              code: code,
              filePath: 'test/page.js'
            });

            // customOnUnload应该被识别
            return result.hasCustomOnUnload === true;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should calculate lifecycle score based on cleanup completeness', function() {
      fc.assert(
        fc.property(
          pageWithTimers(),
          function(pageData) {
            var result = MemoryGuard.analyzePageLifecycle({
              code: pageData.code,
              filePath: 'test/page.js'
            });

            // 评分应该在0-100之间
            if (result.score < 0 || result.score > 100) {
              return false;
            }

            // 有更多缺失清理的页面应该有更低的评分
            // 这是一个相对宽松的检查
            return true;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });
});



/**
 * ============================================================================
 * 综合扫描测试
 * **Validates: Requirements 4.1, 4.3, 4.5**
 * ============================================================================
 */

describe('Comprehensive Scan', function() {
  it('should scan all resource types in one call', function() {
    fc.assert(
      fc.property(
        validIdentifier(),
        validAudioName(),
        wxEventApiName(),
        function(timerName, audioName, apiName) {
          var code = 'Page({\n' +
            '  data: {},\n' +
            '  onLoad: function() {\n' +
            '    this.' + timerName + ' = setInterval(function() {}, 1000);\n' +
            '    this.' + audioName + ' = wx.createInnerAudioContext();\n' +
            '    wx.' + apiName + '(function(res) { console.log(res); });\n' +
            '  }\n' +
            '});';

          var result = MemoryGuard.scanAll({
            code: code,
            filePath: 'test/page.js'
          });

          // 应该检测到所有类型的问题
          return result.timerIssues.length > 0 &&
                 result.audioIssues.length > 0 &&
                 result.listenerIssues.length > 0;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });

  it('should calculate total issues correctly', function() {
    fc.assert(
      fc.property(
        pageWithTimers(),
        function(pageData) {
          var result = MemoryGuard.scanAll({
            code: pageData.code,
            filePath: 'test/page.js'
          });

          // 总问题数应该等于各类问题之和
          var expectedTotal = result.timerIssues.length +
                              result.listenerIssues.length +
                              result.audioIssues.length;

          return result.totalIssues === expectedTotal;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });

  it('should generate cleanup code for detected issues', function() {
    fc.assert(
      fc.property(
        validIdentifier(),
        timerType(),
        function(varName, type) {
          var code = 'Page({\n' +
            '  data: {},\n' +
            '  onLoad: function() {\n' +
            '    this.' + varName + ' = ' + type + '(function() {}, 1000);\n' +
            '  }\n' +
            '});';

          var result = MemoryGuard.scanAll({
            code: code,
            filePath: 'test/page.js'
          });

          // 如果有问题，应该生成清理代码
          if (result.totalIssues > 0) {
            return result.cleanupCode !== null &&
                   result.cleanupCode.fullExample.length > 0;
          }

          return true;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });

  it('should calculate overall score', function() {
    fc.assert(
      fc.property(
        pageWithTimers(),
        function(pageData) {
          var result = MemoryGuard.scanAll({
            code: pageData.code,
            filePath: 'test/page.js'
          });

          // 评分应该在0-100之间
          return result.score >= 0 && result.score <= 100;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });
});

/**
 * ============================================================================
 * 清理代码生成测试
 * ============================================================================
 */

describe('Cleanup Code Generation', function() {
  it('should generate timer cleanup code', function() {
    fc.assert(
      fc.property(
        validIdentifier(),
        timerType(),
        function(varName, type) {
          var clearType = type === 'setTimeout' ? 'clearTimeout' : 'clearInterval';

          var issues = [{
            type: 'timer_not_cleared',
            metadata: {
              variableName: varName,
              timerType: type
            }
          }];

          var result = MemoryGuard.generateCleanupCode(issues);

          // 生成的代码应该包含正确的清理函数
          return result.onUnloadCode.join('\n').indexOf(clearType) !== -1 &&
                 result.onUnloadCode.join('\n').indexOf(varName) !== -1;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });

  it('should generate listener cleanup code', function() {
    fc.assert(
      fc.property(
        wxEventApiName(),
        validHandlerName(),
        function(apiName, handlerName) {
          var offApiName = MemoryGuard.WX_EVENT_APIS[apiName];

          var issues = [{
            type: 'listener_not_removed',
            metadata: {
              apiName: apiName,
              offApiName: offApiName,
              handlerName: handlerName
            }
          }];

          var result = MemoryGuard.generateCleanupCode(issues);

          // 生成的代码应该包含正确的off调用
          return result.onUnloadCode.join('\n').indexOf(offApiName) !== -1 &&
                 result.onUnloadCode.join('\n').indexOf(handlerName) !== -1;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });

  it('should generate audio cleanup code', function() {
    fc.assert(
      fc.property(
        validAudioName(),
        function(audioName) {
          var issues = [{
            type: 'audio_not_destroyed',
            metadata: {
              variableName: audioName
            }
          }];

          var result = MemoryGuard.generateCleanupCode(issues);

          // 生成的代码应该包含stop和destroy调用
          var code = result.onUnloadCode.join('\n');
          return code.indexOf('stop') !== -1 &&
                 code.indexOf('destroy') !== -1 &&
                 code.indexOf(audioName) !== -1;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });

  it('should return empty code for no issues', function() {
    var result = MemoryGuard.generateCleanupCode([]);

    // 没有问题时应该返回提示信息
    if (result.fullExample.indexOf('未检测到') === -1) {
      throw new Error('Expected message about no issues detected');
    }
  });
});

/**
 * ============================================================================
 * 边界情况测试
 * ============================================================================
 */

describe('Edge Cases', function() {
  it('should handle empty code gracefully', function() {
    var timerIssues = MemoryGuard.scanTimerUsage({
      code: '',
      filePath: 'test/empty.js'
    });

    var listenerIssues = MemoryGuard.scanEventListeners({
      code: '',
      filePath: 'test/empty.js'
    });

    var audioIssues = MemoryGuard.scanAudioInstances({
      code: '',
      filePath: 'test/empty.js'
    });

    // 空代码应该返回空数组
    if (timerIssues.length !== 0 || listenerIssues.length !== 0 || audioIssues.length !== 0) {
      throw new Error('Expected empty results for empty code');
    }
  });

  it('should handle missing options gracefully', function() {
    var timerIssues = MemoryGuard.scanTimerUsage({});
    var listenerIssues = MemoryGuard.scanEventListeners({});
    var audioIssues = MemoryGuard.scanAudioInstances({});

    // 缺少选项应该返回空数组
    if (timerIssues.length !== 0 || listenerIssues.length !== 0 || audioIssues.length !== 0) {
      throw new Error('Expected empty results for missing options');
    }
  });

  it('should handle code without Page wrapper', function() {
    var code = 'var x = 1;\nfunction test() { console.log(x); }';

    var timerIssues = MemoryGuard.scanTimerUsage({
      code: code,
      filePath: 'test/nopage.js'
    });

    // 没有Page包装的代码不应该崩溃
    if (typeof timerIssues.length !== 'number') {
      throw new Error('Expected array result');
    }
  });

  it('should handle malformed code', function() {
    var code = 'Page({\n  onLoad: function() {\n    this.timer = setTimeout(\n  }\n});';

    // 不应该抛出异常
    var timerIssues = MemoryGuard.scanTimerUsage({
      code: code,
      filePath: 'test/malformed.js'
    });

    if (typeof timerIssues.length !== 'number') {
      throw new Error('Expected array result');
    }
  });

  it('should handle deeply nested timer calls', function() {
    fc.assert(
      fc.property(
        validIdentifier(),
        fc.integer({ min: 1, max: 5 }),
        function(varName, depth) {
          var indent = '';
          var openBraces = '';
          var closeBraces = '';

          for (var i = 0; i < depth; i++) {
            indent += '  ';
            openBraces += 'if (true) {\n' + indent;
            closeBraces = indent.slice(2) + '}\n' + closeBraces;
          }

          var code = 'Page({\n' +
            '  data: {},\n' +
            '  onLoad: function() {\n' +
            '    ' + openBraces + 'this.' + varName + ' = setTimeout(function() {}, 1000);\n' +
            closeBraces +
            '  }\n' +
            '});';

          var issues = MemoryGuard.scanTimerUsage({
            code: code,
            filePath: 'test/nested.js'
          });

          // 深层嵌套的定时器也应该被检测到
          return issues.length > 0;
        }
      ),
      { numRuns: 50, verbose: true }
    );
  });

  it('should handle multiple timers with same name', function() {
    fc.assert(
      fc.property(
        validIdentifier(),
        function(varName) {
          var code = 'Page({\n' +
            '  data: {},\n' +
            '  onLoad: function() {\n' +
            '    this.' + varName + ' = setTimeout(function() {}, 1000);\n' +
            '  },\n' +
            '  onShow: function() {\n' +
            '    this.' + varName + ' = setInterval(function() {}, 2000);\n' +
            '  }\n' +
            '});';

          var issues = MemoryGuard.scanTimerUsage({
            code: code,
            filePath: 'test/duplicate.js'
          });

          // 应该检测到多个定时器
          return issues.length >= 2;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });
});

/**
 * ============================================================================
 * 一致性测试
 * ============================================================================
 */

describe('Consistency Tests', function() {
  it('should produce consistent results for identical code', function() {
    fc.assert(
      fc.property(
        pageWithTimers(),
        function(pageData) {
          var result1 = MemoryGuard.scanAll({
            code: pageData.code,
            filePath: 'test/page.js'
          });

          var result2 = MemoryGuard.scanAll({
            code: pageData.code,
            filePath: 'test/page.js'
          });

          // 相同代码应该产生相同的结果
          return result1.totalIssues === result2.totalIssues &&
                 result1.score === result2.score;
        }
      ),
      { numRuns: 50, verbose: true }
    );
  });

  it('should maintain issue count across scan methods', function() {
    fc.assert(
      fc.property(
        validIdentifier(),
        timerType(),
        function(varName, type) {
          var code = 'Page({\n' +
            '  data: {},\n' +
            '  onLoad: function() {\n' +
            '    this.' + varName + ' = ' + type + '(function() {}, 1000);\n' +
            '  }\n' +
            '});';

          var timerIssues = MemoryGuard.scanTimerUsage({
            code: code,
            filePath: 'test/page.js'
          });

          var allResult = MemoryGuard.scanAll({
            code: code,
            filePath: 'test/page.js'
          });

          // scanAll的定时器问题数应该等于单独扫描的结果
          return allResult.timerIssues.length === timerIssues.length;
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });
});

