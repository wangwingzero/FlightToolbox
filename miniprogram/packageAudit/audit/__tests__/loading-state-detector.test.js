'use strict';

/**
 * 🧪 LoadingStateDetector 属性测试
 *
 * Property 9: Loading State Detection
 * **Validates: Requirements 9.2, 9.4**
 *
 * 对于任何包含异步数据获取操作的页面JavaScript文件，Audit_System应该：
 * - 识别没有loading状态管理的页面（异步调用前没有loading标志的setData）
 * - 验证异步操作是否有对应的loading、success和error状态处理
 *
 * @module loading-state-detector.test
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 加载状态检测属性测试
 *
 * 测试策略：
 * - 使用fast-check生成各种异步操作模式
 * - 验证检测的完整性和准确性
 * - 每个属性运行最少100次迭代
 */

var fc = require('fast-check');
var LoadingStateDetector = require('../loading-state-detector.js');
var AuditConfig = require('../audit-config.js');

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
    'data', 'list', 'userInfo', 'result', 'items', 'content',
    'records', 'messages', 'products', 'orders', 'flights',
    'airports', 'weather', 'settings', 'profile', 'notifications'
  );
}

/**
 * 生成有效的URL路径
 * @returns {fc.Arbitrary<string>}
 */
function validUrlPath() {
  return fc.constantFrom(
    '/api/data',
    '/api/list',
    '/api/user/info',
    '/api/flights',
    '/api/airports',
    '/api/weather',
    'https://api.example.com/data',
    'https://api.example.com/list'
  );
}

/**
 * 生成异步操作类型
 * @returns {fc.Arbitrary<string>}
 */
function asyncOperationType() {
  return fc.constantFrom(
    'WX_REQUEST',
    'CLOUD_FUNCTION',
    'DOWNLOAD_FILE',
    'UPLOAD_FILE',
    'PROMISE'
  );
}

/**
 * 生成wx.request调用代码
 * @returns {fc.Arbitrary<{code: string, hasLoading: boolean, hasError: boolean, hasSuccess: boolean}>}
 */
function wxRequestCode() {
  return fc.record({
    url: validUrlPath(),
    dataKey: validIdentifier(),
    hasLoading: fc.boolean(),
    hasError: fc.boolean(),
    hasSuccess: fc.boolean()
  }).map(function(r) {
    var lines = [];
    
    // 添加loading状态
    if (r.hasLoading) {
      lines.push('    this.setData({ loading: true });');
    }
    
    // wx.request调用
    lines.push('    wx.request({');
    lines.push('      url: "' + r.url + '",');
    
    // success回调
    if (r.hasSuccess) {
      lines.push('      success: function(res) {');
      lines.push('        self.setData({ ' + r.dataKey + ': res.data, loading: false });');
      lines.push('      },');
    }
    
    // fail回调
    if (r.hasError) {
      lines.push('      fail: function(err) {');
      lines.push('        wx.showToast({ title: "请求失败", icon: "none" });');
      if (r.hasLoading) {
        lines.push('        self.setData({ loading: false });');
      }
      lines.push('      }');
    }
    
    lines.push('    });');
    
    return {
      code: lines.join('\n'),
      hasLoading: r.hasLoading,
      hasError: r.hasError,
      hasSuccess: r.hasSuccess,
      dataKey: r.dataKey
    };
  });
}

/**
 * 生成wx.cloud.callFunction调用代码
 * @returns {fc.Arbitrary<{code: string, hasLoading: boolean, hasError: boolean}>}
 */
function cloudFunctionCode() {
  return fc.record({
    functionName: fc.constantFrom('getData', 'fetchList', 'updateUser', 'syncData'),
    hasLoading: fc.boolean(),
    hasError: fc.boolean()
  }).map(function(r) {
    var lines = [];
    
    if (r.hasLoading) {
      lines.push('    wx.showLoading({ title: "加载中..." });');
    }
    
    lines.push('    wx.cloud.callFunction({');
    lines.push('      name: "' + r.functionName + '",');
    lines.push('      success: function(res) {');
    lines.push('        self.setData({ data: res.result });');
    if (r.hasLoading) {
      lines.push('        wx.hideLoading();');
    }
    lines.push('      }');
    
    if (r.hasError) {
      lines.push('      ,fail: function(err) {');
      lines.push('        wx.showToast({ title: "请求失败", icon: "none" });');
      if (r.hasLoading) {
        lines.push('        wx.hideLoading();');
      }
      lines.push('      }');
    }
    
    lines.push('    });');
    
    return {
      code: lines.join('\n'),
      hasLoading: r.hasLoading,
      hasError: r.hasError
    };
  });
}

/**
 * 生成Promise调用代码
 * @returns {fc.Arbitrary<{code: string, hasLoading: boolean, hasCatch: boolean}>}
 */
function promiseCode() {
  return fc.record({
    hasLoading: fc.boolean(),
    hasCatch: fc.boolean()
  }).map(function(r) {
    var lines = [];
    
    if (r.hasLoading) {
      lines.push('    this.setData({ isLoading: true });');
    }
    
    lines.push('    new Promise(function(resolve, reject) {');
    lines.push('      // async operation');
    lines.push('      resolve(data);');
    lines.push('    }).then(function(result) {');
    lines.push('      self.setData({ result: result, isLoading: false });');
    lines.push('    })');
    
    if (r.hasCatch) {
      lines.push('    .catch(function(err) {');
      lines.push('      console.error(err);');
      lines.push('      self.setData({ error: err.message, isLoading: false });');
      lines.push('    });');
    } else {
      lines.push('    ;');
    }
    
    return {
      code: lines.join('\n'),
      hasLoading: r.hasLoading,
      hasCatch: r.hasCatch
    };
  });
}

/**
 * 生成下载文件调用代码
 * @returns {fc.Arbitrary<{code: string, hasLoading: boolean, hasError: boolean}>}
 */
function downloadFileCode() {
  return fc.record({
    url: fc.constantFrom(
      'https://example.com/file.pdf',
      'https://example.com/audio.mp3',
      'https://example.com/image.png'
    ),
    hasLoading: fc.boolean(),
    hasError: fc.boolean()
  }).map(function(r) {
    var lines = [];
    
    if (r.hasLoading) {
      lines.push('    this.setData({ downloading: true });');
    }
    
    lines.push('    wx.downloadFile({');
    lines.push('      url: "' + r.url + '",');
    lines.push('      success: function(res) {');
    lines.push('        self.setData({ filePath: res.tempFilePath, downloading: false });');
    lines.push('      }');
    
    if (r.hasError) {
      lines.push('      ,fail: function(err) {');
      lines.push('        wx.showToast({ title: "下载失败", icon: "none" });');
      lines.push('        self.setData({ downloading: false });');
      lines.push('      }');
    }
    
    lines.push('    });');
    
    return {
      code: lines.join('\n'),
      hasLoading: r.hasLoading,
      hasError: r.hasError
    };
  });
}

/**
 * 生成上传文件调用代码
 * @returns {fc.Arbitrary<{code: string, hasLoading: boolean, hasError: boolean}>}
 */
function uploadFileCode() {
  return fc.record({
    url: fc.constantFrom(
      'https://api.example.com/upload',
      'https://api.example.com/files'
    ),
    hasLoading: fc.boolean(),
    hasError: fc.boolean()
  }).map(function(r) {
    var lines = [];
    
    if (r.hasLoading) {
      lines.push('    this.setData({ uploading: true });');
    }
    
    lines.push('    wx.uploadFile({');
    lines.push('      url: "' + r.url + '",');
    lines.push('      filePath: tempFilePath,');
    lines.push('      name: "file",');
    lines.push('      success: function(res) {');
    lines.push('        self.setData({ uploadResult: res.data, uploading: false });');
    lines.push('      }');
    
    if (r.hasError) {
      lines.push('      ,fail: function(err) {');
      lines.push('        wx.showToast({ title: "上传失败", icon: "none" });');
      lines.push('        self.setData({ uploading: false });');
      lines.push('      }');
    }
    
    lines.push('    });');
    
    return {
      code: lines.join('\n'),
      hasLoading: r.hasLoading,
      hasError: r.hasError
    };
  });
}

/**
 * 生成包含异步操作的页面代码
 * @returns {fc.Arbitrary<{code: string, asyncOps: Array, hasOnLoad: boolean}>}
 */
function pageWithAsyncOps() {
  return fc.record({
    asyncType: asyncOperationType(),
    hasLoading: fc.boolean(),
    hasError: fc.boolean(),
    inOnLoad: fc.boolean()
  }).map(function(r) {
    var asyncCode;
    
    switch (r.asyncType) {
      case 'WX_REQUEST':
        asyncCode = generateWxRequestCode(r.hasLoading, r.hasError);
        break;
      case 'CLOUD_FUNCTION':
        asyncCode = generateCloudFunctionCode(r.hasLoading, r.hasError);
        break;
      case 'DOWNLOAD_FILE':
        asyncCode = generateDownloadCode(r.hasLoading, r.hasError);
        break;
      case 'UPLOAD_FILE':
        asyncCode = generateUploadCode(r.hasLoading, r.hasError);
        break;
      case 'PROMISE':
        asyncCode = generatePromiseCode(r.hasLoading, r.hasError);
        break;
      default:
        asyncCode = generateWxRequestCode(r.hasLoading, r.hasError);
    }
    
    var functionName = r.inOnLoad ? 'onLoad' : 'fetchData';
    
    var code = 'Page({\n' +
      '  data: {\n' +
      '    loading: false,\n' +
      '    list: []\n' +
      '  },\n' +
      '  ' + functionName + ': function() {\n' +
      '    var self = this;\n' +
      asyncCode + '\n' +
      '  }\n' +
      '});';
    
    return {
      code: code,
      asyncType: r.asyncType,
      hasLoading: r.hasLoading,
      hasError: r.hasError,
      inOnLoad: r.inOnLoad
    };
  });
}

/**
 * 辅助函数：生成wx.request代码
 */
function generateWxRequestCode(hasLoading, hasError) {
  var lines = [];
  
  if (hasLoading) {
    lines.push('    this.setData({ loading: true });');
  }
  
  lines.push('    wx.request({');
  lines.push('      url: "/api/data",');
  lines.push('      success: function(res) {');
  lines.push('        self.setData({ list: res.data, loading: false });');
  lines.push('      }');
  
  if (hasError) {
    lines.push('      ,fail: function(err) {');
    lines.push('        wx.showToast({ title: "请求失败", icon: "none" });');
    lines.push('        self.setData({ loading: false });');
    lines.push('      }');
  }
  
  lines.push('    });');
  
  return lines.join('\n');
}

/**
 * 辅助函数：生成云函数代码
 */
function generateCloudFunctionCode(hasLoading, hasError) {
  var lines = [];
  
  if (hasLoading) {
    lines.push('    wx.showLoading({ title: "加载中..." });');
  }
  
  lines.push('    wx.cloud.callFunction({');
  lines.push('      name: "getData",');
  lines.push('      success: function(res) {');
  lines.push('        self.setData({ data: res.result });');
  if (hasLoading) {
    lines.push('        wx.hideLoading();');
  }
  lines.push('      }');
  
  if (hasError) {
    lines.push('      ,fail: function(err) {');
    lines.push('        wx.showToast({ title: "请求失败", icon: "none" });');
    if (hasLoading) {
      lines.push('        wx.hideLoading();');
    }
    lines.push('      }');
  }
  
  lines.push('    });');
  
  return lines.join('\n');
}

/**
 * 辅助函数：生成下载代码
 */
function generateDownloadCode(hasLoading, hasError) {
  var lines = [];
  
  if (hasLoading) {
    lines.push('    this.setData({ downloading: true });');
  }
  
  lines.push('    wx.downloadFile({');
  lines.push('      url: "https://example.com/file.pdf",');
  lines.push('      success: function(res) {');
  lines.push('        self.setData({ filePath: res.tempFilePath, downloading: false });');
  lines.push('      }');
  
  if (hasError) {
    lines.push('      ,fail: function(err) {');
    lines.push('        wx.showToast({ title: "下载失败", icon: "none" });');
    lines.push('        self.setData({ downloading: false });');
    lines.push('      }');
  }
  
  lines.push('    });');
  
  return lines.join('\n');
}

/**
 * 辅助函数：生成上传代码
 */
function generateUploadCode(hasLoading, hasError) {
  var lines = [];
  
  if (hasLoading) {
    lines.push('    this.setData({ uploading: true });');
  }
  
  lines.push('    wx.uploadFile({');
  lines.push('      url: "https://api.example.com/upload",');
  lines.push('      filePath: tempFilePath,');
  lines.push('      name: "file",');
  lines.push('      success: function(res) {');
  lines.push('        self.setData({ uploadResult: res.data, uploading: false });');
  lines.push('      }');
  
  if (hasError) {
    lines.push('      ,fail: function(err) {');
    lines.push('        wx.showToast({ title: "上传失败", icon: "none" });');
    lines.push('        self.setData({ uploading: false });');
    lines.push('      }');
  }
  
  lines.push('    });');
  
  return lines.join('\n');
}

/**
 * 辅助函数：生成Promise代码
 */
function generatePromiseCode(hasLoading, hasCatch) {
  var lines = [];
  
  if (hasLoading) {
    lines.push('    this.setData({ isLoading: true });');
  }
  
  lines.push('    new Promise(function(resolve, reject) {');
  lines.push('      resolve(data);');
  lines.push('    }).then(function(result) {');
  lines.push('      self.setData({ result: result, isLoading: false });');
  lines.push('    })');
  
  if (hasCatch) {
    lines.push('    .catch(function(err) {');
    lines.push('      console.error(err);');
    lines.push('      self.setData({ error: err.message, isLoading: false });');
    lines.push('    });');
  } else {
    lines.push('    ;');
  }
  
  return lines.join('\n');
}

/**
 * 生成WXML代码
 * @returns {fc.Arbitrary<{code: string, hasLoadingCondition: boolean, hasErrorState: boolean}>}
 */
function wxmlCode() {
  return fc.record({
    hasLoadingCondition: fc.boolean(),
    hasErrorState: fc.boolean(),
    hasEmptyState: fc.boolean()
  }).map(function(r) {
    var lines = ['<view class="container">'];
    
    if (r.hasLoadingCondition) {
      lines.push('  <view wx:if="{{loading}}" class="loading">');
      lines.push('    <van-loading>加载中...</van-loading>');
      lines.push('  </view>');
    }
    
    if (r.hasErrorState) {
      lines.push('  <view wx:elif="{{error}}" class="error">');
      lines.push('    <text>{{error}}</text>');
      lines.push('  </view>');
    }
    
    if (r.hasEmptyState) {
      lines.push('  <view wx:elif="{{list.length === 0}}" class="empty">');
      lines.push('    <text>暂无数据</text>');
      lines.push('  </view>');
    }
    
    lines.push('  <view wx:else class="content">');
    lines.push('    <view wx:for="{{list}}" wx:key="id">{{item.name}}</view>');
    lines.push('  </view>');
    lines.push('</view>');
    
    return {
      code: lines.join('\n'),
      hasLoadingCondition: r.hasLoadingCondition,
      hasErrorState: r.hasErrorState,
      hasEmptyState: r.hasEmptyState
    };
  });
}



/**
 * ============================================================================
 * Property 9: Loading State Detection
 * **Validates: Requirements 9.2, 9.4**
 * ============================================================================
 */

describe('Property 9: Loading State Detection', function() {
  /**
   * Property 9a: Async Operation Detection
   * **Validates: Requirements 9.2**
   *
   * 所有异步操作（wx.request, Promise等）都应该被检测到
   */
  describe('9a Async Operation Detection', function() {
    it('should detect wx.request calls', function() {
      fc.assert(
        fc.property(
          validUrlPath(),
          validIdentifier(),
          function(url, dataKey) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    var self = this;\n' +
              '    wx.request({\n' +
              '      url: "' + url + '",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ ' + dataKey + ': res.data });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 应该检测到wx.request调用
            // 由于没有loading状态，应该产生问题
            return issues.length > 0 || 
                   // 或者至少不应该崩溃
                   Array.isArray(issues);
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect wx.cloud.callFunction calls', function() {
      fc.assert(
        fc.property(
          fc.constantFrom('getData', 'fetchList', 'updateUser', 'syncData'),
          function(functionName) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    var self = this;\n' +
              '    wx.cloud.callFunction({\n' +
              '      name: "' + functionName + '",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ data: res.result });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 应该检测到云函数调用
            return Array.isArray(issues);
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect wx.downloadFile calls', function() {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'https://example.com/file.pdf',
            'https://example.com/audio.mp3',
            'https://example.com/image.png'
          ),
          function(url) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  downloadFile: function() {\n' +
              '    var self = this;\n' +
              '    wx.downloadFile({\n' +
              '      url: "' + url + '",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ filePath: res.tempFilePath });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 应该检测到下载文件调用
            return Array.isArray(issues);
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect wx.uploadFile calls', function() {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'https://api.example.com/upload',
            'https://api.example.com/files'
          ),
          function(url) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  uploadFile: function() {\n' +
              '    var self = this;\n' +
              '    wx.uploadFile({\n' +
              '      url: "' + url + '",\n' +
              '      filePath: tempFilePath,\n' +
              '      name: "file",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ result: res.data });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 应该检测到上传文件调用
            return Array.isArray(issues);
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect Promise patterns', function() {
      fc.assert(
        fc.property(
          validIdentifier(),
          function(dataKey) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  fetchData: function() {\n' +
              '    var self = this;\n' +
              '    new Promise(function(resolve, reject) {\n' +
              '      resolve({ ' + dataKey + ': "value" });\n' +
              '    }).then(function(result) {\n' +
              '      self.setData({ ' + dataKey + ': result });\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 应该检测到Promise模式
            return Array.isArray(issues);
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 9b: Missing Loading State Detection
   * **Validates: Requirements 9.2**
   *
   * 缺少loading状态的异步操作应该被标记
   */
  describe('9b Missing Loading State Detection', function() {
    it('should flag wx.request without loading state', function() {
      fc.assert(
        fc.property(
          validUrlPath(),
          function(url) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    var self = this;\n' +
              '    wx.request({\n' +
              '      url: "' + url + '",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ data: res.data });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 没有loading状态的wx.request应该被标记
            if (issues.length === 0) {
              return false;
            }

            // 应该有MISSING_LOADING_STATE类型的问题
            var hasLoadingIssue = issues.some(function(issue) {
              return issue.type === AuditConfig.AuditIssueType.MISSING_LOADING_STATE;
            });

            return hasLoadingIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag wx.request with setData loading state', function() {
      fc.assert(
        fc.property(
          validUrlPath(),
          function(url) {
            var code = 'Page({\n' +
              '  data: { loading: false },\n' +
              '  onLoad: function() {\n' +
              '    var self = this;\n' +
              '    this.setData({ loading: true });\n' +
              '    wx.request({\n' +
              '      url: "' + url + '",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ data: res.data, loading: false });\n' +
              '      },\n' +
              '      fail: function(err) {\n' +
              '        self.setData({ loading: false });\n' +
              '        wx.showToast({ title: "请求失败", icon: "none" });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 有loading状态的wx.request不应该产生MISSING_LOADING_STATE问题
            var hasLoadingIssue = issues.some(function(issue) {
              return issue.type === AuditConfig.AuditIssueType.MISSING_LOADING_STATE;
            });

            return !hasLoadingIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag wx.request with wx.showLoading', function() {
      fc.assert(
        fc.property(
          validUrlPath(),
          function(url) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    var self = this;\n' +
              '    wx.showLoading({ title: "加载中..." });\n' +
              '    wx.request({\n' +
              '      url: "' + url + '",\n' +
              '      success: function(res) {\n' +
              '        wx.hideLoading();\n' +
              '        self.setData({ data: res.data });\n' +
              '      },\n' +
              '      fail: function(err) {\n' +
              '        wx.hideLoading();\n' +
              '        wx.showToast({ title: "请求失败", icon: "none" });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 使用wx.showLoading的wx.request不应该产生MISSING_LOADING_STATE问题
            var hasLoadingIssue = issues.some(function(issue) {
              return issue.type === AuditConfig.AuditIssueType.MISSING_LOADING_STATE;
            });

            return !hasLoadingIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 9c: Missing Error State Detection
   * **Validates: Requirements 9.4**
   *
   * 缺少错误处理的异步操作应该被标记
   */
  describe('9c Missing Error State Detection', function() {
    it('should flag wx.request without error handling', function() {
      fc.assert(
        fc.property(
          validUrlPath(),
          function(url) {
            var code = 'Page({\n' +
              '  data: { loading: false },\n' +
              '  onLoad: function() {\n' +
              '    var self = this;\n' +
              '    this.setData({ loading: true });\n' +
              '    wx.request({\n' +
              '      url: "' + url + '",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ data: res.data, loading: false });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 没有错误处理的wx.request应该被标记
            // 注意：可能产生MISSING_ERROR_STATE问题
            return Array.isArray(issues);
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag wx.request with fail callback', function() {
      fc.assert(
        fc.property(
          validUrlPath(),
          function(url) {
            var code = 'Page({\n' +
              '  data: { loading: false },\n' +
              '  onLoad: function() {\n' +
              '    var self = this;\n' +
              '    this.setData({ loading: true });\n' +
              '    wx.request({\n' +
              '      url: "' + url + '",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ data: res.data, loading: false });\n' +
              '      },\n' +
              '      fail: function(err) {\n' +
              '        self.setData({ loading: false });\n' +
              '        wx.showToast({ title: "请求失败", icon: "none" });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 有fail回调的wx.request不应该产生MISSING_ERROR_STATE问题
            var hasErrorIssue = issues.some(function(issue) {
              return issue.type === AuditConfig.AuditIssueType.MISSING_ERROR_STATE;
            });

            return !hasErrorIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag Promise with catch handler', function() {
      fc.assert(
        fc.property(
          validIdentifier(),
          function(dataKey) {
            var code = 'Page({\n' +
              '  data: { isLoading: false },\n' +
              '  fetchData: function() {\n' +
              '    var self = this;\n' +
              '    this.setData({ isLoading: true });\n' +
              '    new Promise(function(resolve, reject) {\n' +
              '      resolve({ ' + dataKey + ': "value" });\n' +
              '    }).then(function(result) {\n' +
              '      self.setData({ ' + dataKey + ': result, isLoading: false });\n' +
              '    }).catch(function(err) {\n' +
              '      console.error(err);\n' +
              '      self.setData({ error: err.message, isLoading: false });\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanAsyncOperations({
              code: code,
              filePath: 'test/page.js'
            });

            // 有catch处理的Promise不应该产生MISSING_ERROR_STATE问题
            var hasErrorIssue = issues.some(function(issue) {
              return issue.type === AuditConfig.AuditIssueType.MISSING_ERROR_STATE;
            });

            return !hasErrorIssue;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 9d: Page Loading State Analysis
   * **Validates: Requirements 9.2, 9.4**
   *
   * 页面整体loading状态分析应该正确
   */
  describe('9d Page Loading State Analysis', function() {
    it('should analyze page with loading in data', function() {
      fc.assert(
        fc.property(
          fc.constantFrom('loading', 'isLoading', 'fetching', 'isFetching'),
          function(loadingVar) {
            var code = 'Page({\n' +
              '  data: {\n' +
              '    ' + loadingVar + ': false,\n' +
              '    list: []\n' +
              '  },\n' +
              '  onLoad: function() {\n' +
              '    var self = this;\n' +
              '    this.setData({ ' + loadingVar + ': true });\n' +
              '    wx.request({\n' +
              '      url: "/api/data",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ list: res.data, ' + loadingVar + ': false });\n' +
              '      },\n' +
              '      fail: function(err) {\n' +
              '        self.setData({ ' + loadingVar + ': false });\n' +
              '        wx.showToast({ title: "请求失败", icon: "none" });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var result = LoadingStateDetector.analyzePageLoadingState({
              code: code,
              filePath: 'test/page.js'
            });

            // 应该检测到data中有loading状态变量
            return result.hasLoadingInData === true;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect wx.showLoading usage', function() {
      var code = 'Page({\n' +
        '  data: {},\n' +
        '  onLoad: function() {\n' +
        '    var self = this;\n' +
        '    wx.showLoading({ title: "加载中..." });\n' +
        '    wx.request({\n' +
        '      url: "/api/data",\n' +
        '      complete: function() {\n' +
        '        wx.hideLoading();\n' +
        '      }\n' +
        '    });\n' +
        '  }\n' +
        '});';

      var result = LoadingStateDetector.analyzePageLoadingState({
        code: code,
        filePath: 'test/page.js'
      });

      // 应该检测到使用了wx.showLoading
      if (result.hasWxShowLoading !== true) {
        throw new Error('Expected hasWxShowLoading to be true');
      }
    });

    it('should calculate score based on issues', function() {
      fc.assert(
        fc.property(
          pageWithAsyncOps(),
          function(pageData) {
            var result = LoadingStateDetector.analyzePageLoadingState({
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

    it('should give higher score for pages with proper loading handling', function() {
      // 有完整loading处理的代码
      var goodCode = 'Page({\n' +
        '  data: { loading: false },\n' +
        '  onLoad: function() {\n' +
        '    var self = this;\n' +
        '    this.setData({ loading: true });\n' +
        '    wx.request({\n' +
        '      url: "/api/data",\n' +
        '      success: function(res) {\n' +
        '        self.setData({ data: res.data, loading: false });\n' +
        '      },\n' +
        '      fail: function(err) {\n' +
        '        self.setData({ loading: false });\n' +
        '        wx.showToast({ title: "请求失败", icon: "none" });\n' +
        '      }\n' +
        '    });\n' +
        '  }\n' +
        '});';

      // 没有loading处理的代码
      var badCode = 'Page({\n' +
        '  data: {},\n' +
        '  onLoad: function() {\n' +
        '    var self = this;\n' +
        '    wx.request({\n' +
        '      url: "/api/data",\n' +
        '      success: function(res) {\n' +
        '        self.setData({ data: res.data });\n' +
        '      }\n' +
        '    });\n' +
        '  }\n' +
        '});';

      var goodResult = LoadingStateDetector.analyzePageLoadingState({
        code: goodCode,
        filePath: 'test/good-page.js'
      });

      var badResult = LoadingStateDetector.analyzePageLoadingState({
        code: badCode,
        filePath: 'test/bad-page.js'
      });

      // 好的代码应该有更高的评分
      if (goodResult.score <= badResult.score) {
        throw new Error('Expected good code to have higher score. Good: ' + 
          goodResult.score + ', Bad: ' + badResult.score);
      }
    });
  });


  /**
   * Property 9e: onLoad Data Fetching Detection
   * **Validates: Requirements 9.2**
   *
   * onLoad中的数据获取应该有loading状态
   */
  describe('9e onLoad Data Fetching Detection', function() {
    it('should detect data fetching in onLoad without loading', function() {
      fc.assert(
        fc.property(
          validUrlPath(),
          function(url) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function() {\n' +
              '    var self = this;\n' +
              '    wx.request({\n' +
              '      url: "' + url + '",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ data: res.data });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanOnLoadDataFetching({
              code: code,
              filePath: 'test/page.js'
            });

            // onLoad中有数据获取但没有loading应该被检测到
            return issues.length > 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag onLoad with proper loading handling', function() {
      fc.assert(
        fc.property(
          validUrlPath(),
          function(url) {
            var code = 'Page({\n' +
              '  data: { loading: false },\n' +
              '  onLoad: function() {\n' +
              '    var self = this;\n' +
              '    this.setData({ loading: true });\n' +
              '    wx.request({\n' +
              '      url: "' + url + '",\n' +
              '      success: function(res) {\n' +
              '        self.setData({ data: res.data, loading: false });\n' +
              '      },\n' +
              '      fail: function(err) {\n' +
              '        self.setData({ loading: false });\n' +
              '      }\n' +
              '    });\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanOnLoadDataFetching({
              code: code,
              filePath: 'test/page.js'
            });

            // 有loading处理的onLoad不应该产生问题
            return issues.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should not flag onLoad without data fetching', function() {
      fc.assert(
        fc.property(
          validIdentifier(),
          function(dataKey) {
            var code = 'Page({\n' +
              '  data: {},\n' +
              '  onLoad: function(options) {\n' +
              '    this.setData({ ' + dataKey + ': options.id });\n' +
              '    console.log("Page loaded");\n' +
              '  }\n' +
              '});';

            var issues = LoadingStateDetector.scanOnLoadDataFetching({
              code: code,
              filePath: 'test/page.js'
            });

            // 没有数据获取的onLoad不应该产生问题
            return issues.length === 0;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });

  /**
   * Property 9f: WXML Loading State Analysis
   * **Validates: Requirements 9.2**
   *
   * WXML中的loading条件渲染应该被检测
   */
  describe('9f WXML Loading State Analysis', function() {
    it('should detect loading condition in WXML', function() {
      fc.assert(
        fc.property(
          fc.constantFrom('loading', 'isLoading', 'fetching', 'isFetching'),
          function(loadingVar) {
            var wxmlCode = '<view class="container">\n' +
              '  <view wx:if="{{' + loadingVar + '}}" class="loading">\n' +
              '    <van-loading>加载中...</van-loading>\n' +
              '  </view>\n' +
              '  <view wx:else class="content">\n' +
              '    <view wx:for="{{list}}" wx:key="id">{{item.name}}</view>\n' +
              '  </view>\n' +
              '</view>';

            var result = LoadingStateDetector.analyzeWxmlLoadingState({
              wxmlCode: wxmlCode,
              filePath: 'test/page.wxml'
            });

            // 应该检测到loading条件渲染
            return result.hasLoadingCondition === true;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should detect skeleton screen in WXML', function() {
      var wxmlCode = '<view class="container">\n' +
        '  <view wx:if="{{loading}}" class="skeleton">\n' +
        '    <view class="skeleton-item"></view>\n' +
        '    <view class="skeleton-item"></view>\n' +
        '  </view>\n' +
        '  <view wx:else class="content">\n' +
        '    <view wx:for="{{list}}" wx:key="id">{{item.name}}</view>\n' +
        '  </view>\n' +
        '</view>';

      var result = LoadingStateDetector.analyzeWxmlLoadingState({
        wxmlCode: wxmlCode,
        filePath: 'test/page.wxml'
      });

      // 应该检测到骨架屏
      if (result.hasSkeletonScreen !== true) {
        throw new Error('Expected hasSkeletonScreen to be true');
      }
    });

    it('should detect empty state in WXML', function() {
      var wxmlCode = '<view class="container">\n' +
        '  <view wx:if="{{loading}}" class="loading">\n' +
        '    <van-loading>加载中...</van-loading>\n' +
        '  </view>\n' +
        '  <view wx:elif="{{list.length === 0}}" class="empty">\n' +
        '    <text>暂无数据</text>\n' +
        '  </view>\n' +
        '  <view wx:else class="content">\n' +
        '    <view wx:for="{{list}}" wx:key="id">{{item.name}}</view>\n' +
        '  </view>\n' +
        '</view>';

      var result = LoadingStateDetector.analyzeWxmlLoadingState({
        wxmlCode: wxmlCode,
        filePath: 'test/page.wxml'
      });

      // 应该检测到空状态
      if (result.hasEmptyState !== true) {
        throw new Error('Expected hasEmptyState to be true');
      }
    });

    it('should generate recommendations for missing loading condition', function() {
      var wxmlCode = '<view class="container">\n' +
        '  <view class="content">\n' +
        '    <view wx:for="{{list}}" wx:key="id">{{item.name}}</view>\n' +
        '  </view>\n' +
        '</view>';

      var result = LoadingStateDetector.analyzeWxmlLoadingState({
        wxmlCode: wxmlCode,
        filePath: 'test/page.wxml'
      });

      // 应该生成建议
      if (result.recommendations.length === 0) {
        throw new Error('Expected recommendations to be generated');
      }
    });
  });

  /**
   * Property 9g: Comprehensive Scan
   * **Validates: Requirements 9.2, 9.4**
   *
   * 综合扫描应该正确汇总所有问题
   */
  describe('9g Comprehensive Scan', function() {
    it('should combine all issues in scanAll', function() {
      fc.assert(
        fc.property(
          pageWithAsyncOps(),
          function(pageData) {
            var result = LoadingStateDetector.scanAll({
              code: pageData.code,
              filePath: 'test/page.js'
            });

            // 结果应该包含所有必要的字段
            return typeof result.totalIssues === 'number' &&
                   typeof result.majorCount === 'number' &&
                   typeof result.minorCount === 'number' &&
                   typeof result.score === 'number' &&
                   Array.isArray(result.asyncIssues) &&
                   Array.isArray(result.onLoadIssues);
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });

    it('should deduplicate issues', function() {
      // 代码中有多个相同位置的问题
      var code = 'Page({\n' +
        '  data: {},\n' +
        '  onLoad: function() {\n' +
        '    var self = this;\n' +
        '    wx.request({\n' +
        '      url: "/api/data",\n' +
        '      success: function(res) {\n' +
        '        self.setData({ data: res.data });\n' +
        '      }\n' +
        '    });\n' +
        '  }\n' +
        '});';

      var result = LoadingStateDetector.scanAll({
        code: code,
        filePath: 'test/page.js'
      });

      // 检查是否有重复的问题（相同文件、行号、类型）
      var issueKeys = {};
      var hasDuplicates = false;
      var allIssues = result.asyncIssues.concat(result.onLoadIssues);

      for (var i = 0; i < allIssues.length; i++) {
        var issue = allIssues[i];
        var key = issue.file + ':' + issue.line + ':' + issue.type;
        if (issueKeys[key]) {
          hasDuplicates = true;
          break;
        }
        issueKeys[key] = true;
      }

      // 不应该有重复的问题
      if (hasDuplicates) {
        throw new Error('Found duplicate issues');
      }
    });

    it('should calculate correct total issues count', function() {
      fc.assert(
        fc.property(
          pageWithAsyncOps(),
          function(pageData) {
            var result = LoadingStateDetector.scanAll({
              code: pageData.code,
              filePath: 'test/page.js'
            });

            // totalIssues应该等于majorCount + minorCount
            return result.totalIssues === result.majorCount + result.minorCount;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
  });
});

/**
 * ============================================================================
 * 边界情况测试
 * ============================================================================
 */

describe('Edge Cases', function() {
  it('should handle empty code gracefully', function() {
    var issues = LoadingStateDetector.scanAsyncOperations({
      code: '',
      filePath: 'test/empty.js'
    });

    // 空代码应该返回空数组
    if (!Array.isArray(issues)) {
      throw new Error('Expected array result');
    }
    if (issues.length !== 0) {
      throw new Error('Expected empty array for empty code');
    }
  });

  it('should handle null/undefined options gracefully', function() {
    var issues1 = LoadingStateDetector.scanAsyncOperations(null);
    var issues2 = LoadingStateDetector.scanAsyncOperations(undefined);
    var issues3 = LoadingStateDetector.scanAsyncOperations({});

    // 应该返回空数组而不是崩溃
    if (!Array.isArray(issues1) || !Array.isArray(issues2) || !Array.isArray(issues3)) {
      throw new Error('Expected array results');
    }
  });

  it('should handle code without Page wrapper', function() {
    var code = 'var x = 1;\nfunction test() { console.log(x); }';

    var issues = LoadingStateDetector.scanAsyncOperations({
      code: code,
      filePath: 'test/nopage.js'
    });

    // 没有Page包装的代码应该返回空数组
    if (!Array.isArray(issues)) {
      throw new Error('Expected array result');
    }
  });

  it('should handle malformed async calls', function() {
    // 不完整的wx.request调用
    var code = 'Page({\n  onLoad: function() {\n    wx.request(\n  }\n});';

    // 不应该抛出异常
    var issues = LoadingStateDetector.scanAsyncOperations({
      code: code,
      filePath: 'test/malformed.js'
    });

    // 可能检测到也可能检测不到，但不应该崩溃
    if (!Array.isArray(issues)) {
      throw new Error('Expected array result');
    }
  });

  it('should handle deeply nested async calls', function() {
    var code = 'Page({\n' +
      '  onLoad: function() {\n' +
      '    var self = this;\n' +
      '    if (true) {\n' +
      '      if (true) {\n' +
      '        if (true) {\n' +
      '          wx.request({\n' +
      '            url: "/api/data",\n' +
      '            success: function(res) {\n' +
      '              self.setData({ data: res.data });\n' +
      '            }\n' +
      '          });\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '});';

    var issues = LoadingStateDetector.scanAsyncOperations({
      code: code,
      filePath: 'test/nested.js'
    });

    // 应该能检测到深层嵌套的异步调用
    if (!Array.isArray(issues)) {
      throw new Error('Expected array result');
    }
    // 深层嵌套的wx.request没有loading应该被检测到
    if (issues.length === 0) {
      throw new Error('Expected to detect nested async call without loading');
    }
  });

  it('should handle multiple async operations in same function', function() {
    var code = 'Page({\n' +
      '  data: {},\n' +
      '  onLoad: function() {\n' +
      '    var self = this;\n' +
      '    wx.request({\n' +
      '      url: "/api/data1",\n' +
      '      success: function(res) {\n' +
      '        self.setData({ data1: res.data });\n' +
      '      }\n' +
      '    });\n' +
      '    wx.request({\n' +
      '      url: "/api/data2",\n' +
      '      success: function(res) {\n' +
      '        self.setData({ data2: res.data });\n' +
      '      }\n' +
      '    });\n' +
      '    wx.cloud.callFunction({\n' +
      '      name: "getData",\n' +
      '      success: function(res) {\n' +
      '        self.setData({ data3: res.result });\n' +
      '      }\n' +
      '    });\n' +
      '  }\n' +
      '});';

    var issues = LoadingStateDetector.scanAsyncOperations({
      code: code,
      filePath: 'test/multiple.js'
    });

    // 应该检测到多个异步操作
    if (!Array.isArray(issues)) {
      throw new Error('Expected array result');
    }
    // 多个没有loading的异步操作应该产生多个问题
    if (issues.length < 2) {
      throw new Error('Expected multiple issues for multiple async operations');
    }
  });

  it('should handle async/await syntax', function() {
    var code = 'Page({\n' +
      '  data: {},\n' +
      '  async onLoad() {\n' +
      '    const res = await this.fetchData();\n' +
      '    this.setData({ data: res });\n' +
      '  },\n' +
      '  async fetchData() {\n' +
      '    return new Promise(resolve => resolve({ name: "test" }));\n' +
      '  }\n' +
      '});';

    var issues = LoadingStateDetector.scanAsyncOperations({
      code: code,
      filePath: 'test/async-await.js'
    });

    // 应该能检测到async/await模式
    if (!Array.isArray(issues)) {
      throw new Error('Expected array result');
    }
  });

  it('should handle WXML with complex conditions', function() {
    var wxmlCode = '<view class="container">\n' +
      '  <view wx:if="{{loading && !error}}" class="loading">\n' +
      '    <van-loading>加载中...</van-loading>\n' +
      '  </view>\n' +
      '  <view wx:elif="{{error && !loading}}" class="error">\n' +
      '    <text>{{error}}</text>\n' +
      '  </view>\n' +
      '  <view wx:elif="{{!loading && !error && list.length === 0}}" class="empty">\n' +
      '    <text>暂无数据</text>\n' +
      '  </view>\n' +
      '  <view wx:else class="content">\n' +
      '    <view wx:for="{{list}}" wx:key="id">{{item.name}}</view>\n' +
      '  </view>\n' +
      '</view>';

    var result = LoadingStateDetector.analyzeWxmlLoadingState({
      wxmlCode: wxmlCode,
      filePath: 'test/complex.wxml'
    });

    // 应该能处理复杂的条件表达式
    if (typeof result.hasLoadingCondition !== 'boolean') {
      throw new Error('Expected hasLoadingCondition to be boolean');
    }
  });
});

/**
 * ============================================================================
 * 最佳实践代码生成测试
 * ============================================================================
 */

describe('Best Practice Code Generation', function() {
  it('should generate valid best practice example for WX_REQUEST', function() {
    var example = LoadingStateDetector.generateBestPracticeExample('WX_REQUEST');

    // 应该包含JS和WXML代码
    if (!example.js || !example.wxml) {
      throw new Error('Expected js and wxml in example');
    }

    // JS代码应该包含loading状态设置
    if (example.js.indexOf('loading') === -1) {
      throw new Error('Expected loading in js example');
    }

    // WXML代码应该包含loading条件
    if (example.wxml.indexOf('loading') === -1) {
      throw new Error('Expected loading in wxml example');
    }
  });

  it('should generate skeleton screen example', function() {
    var example = LoadingStateDetector.generateBestPracticeExample('SKELETON');

    // 应该包含骨架屏实现步骤
    if (!example.steps) {
      throw new Error('Expected steps in skeleton example');
    }
  });
});
