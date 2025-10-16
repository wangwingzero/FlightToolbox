/**
 * FlightToolbox 错误处理工具
 * 处理分包预下载、页面路径、日志等常见错误
 * 严格遵循ES5语法，确保小程序兼容性
 */

function ErrorHandler() {
  this.errorLog = [];
  this.maxLogSize = 50;
  this.init();
}

ErrorHandler.prototype.init = function() {
  var self = this;
  
  // 监听全局错误
  wx.onError(function(error) {
    self.handleGlobalError(error);
  });

  // 监听未处理的Promise拒绝
  wx.onUnhandledRejection(function(rejection) {
    self.handleUnhandledRejection(rejection);
  });

  console.log('🛡️ ErrorHandler初始化完成');
};

/**
 * 处理全局错误
 */
ErrorHandler.prototype.handleGlobalError = function(error) {
  // 过滤系统级视图管理错误，避免控制台噪音
  var errorString = (typeof error === 'string') ? error : (error && error.message) || error.toString();
  
  // 🔇 过滤掉系统内部的视图管理错误，这些错误不影响应用功能
  if (errorString && (
    errorString.indexOf('removeImageView:fail') !== -1 ||
    errorString.indexOf('removeTextView:fail') !== -1 ||
    errorString.indexOf('not found') !== -1 && errorString.indexOf('View:fail') !== -1
  )) {
    // 静默处理，不输出到控制台，只记录到内部日志
    this.logError('system_view', {
      type: 'system_view_error',
      timestamp: Date.now(),
      error: errorString,
      note: '系统视图管理错误，已静默处理'
    });
    return; // 直接返回，不输出错误信息
  }
  
  console.error('🚨 全局错误:', error);
  
  // 分类处理不同类型的错误
  if (errorString && errorString.indexOf('predownload timeout') !== -1) {
    this.handlePredownloadTimeout(errorString);
  } else if (errorString && errorString.indexOf('unexpected page benchmark path') !== -1) {
    this.handlePagePathError(errorString);
  } else if (errorString && errorString.indexOf('wxfile://usr/miniprogramLog') !== -1) {
    this.handleLogFileError(errorString);
  } else {
    this.handleOtherError(error);
  }
  
  this.logError('global', error);
};

/**
 * 处理未处理的Promise拒绝
 */
ErrorHandler.prototype.handleUnhandledRejection = function(rejection) {
  console.error('🚨 未处理的Promise拒绝:', rejection);
  
  // 安全检查rejection.reason类型
  var reasonString = '';
  if (rejection.reason) {
    if (typeof rejection.reason === 'string') {
      reasonString = rejection.reason;
    } else if (rejection.reason.message) {
      reasonString = rejection.reason.message;
    } else if (rejection.reason.toString) {
      reasonString = rejection.reason.toString();
    } else {
      reasonString = JSON.stringify(rejection.reason);
    }
  }
  
  if (reasonString && reasonString.indexOf('predownload timeout') !== -1) {
    this.handlePredownloadTimeout(reasonString);
  }
  
  this.logError('promise', rejection.reason);
};

/**
 * 处理分包预下载超时
 */
ErrorHandler.prototype.handlePredownloadTimeout = function(error) {
  var self = this;
  console.warn('⏰ 分包预下载超时，启用兜底策略');
  
  // 记录超时事件
  var timeoutInfo = {
    type: 'predownload_timeout',
    timestamp: Date.now(),
    error: error,
    networkType: 'unknown'
  };
  
  // 获取网络状态
  wx.getNetworkType({
    success: function(res) {
      timeoutInfo.networkType = res.networkType;
      console.log('📶 当前网络状态:', res.networkType);
      
      // 针对飞行员使用场景的网络策略
      if (res.networkType === 'none') {
        self.showNetworkError();
      } else if (res.networkType === '2g') {
        self.showSlowNetworkTip('2G网络较慢，正在后台加载数据');
      } else if (res.networkType === '3g') {
        self.showSlowNetworkTip('3G网络加载中，请稍候');
      } else if (res.networkType === '4g' || res.networkType === '5g') {
        // 4G/5G网络超时可能是服务器问题，静默处理
        console.log('📱 4G/5G网络超时，可能是临时网络波动');
      } else {
        console.log('📶 网络类型:', res.networkType);
      }
    },
    fail: function(err) {
      console.error('❌ 获取网络状态失败:', err);
    }
  });
  
  this.logError('predownload_timeout', timeoutInfo);
};

/**
 * 处理页面路径错误
 */
ErrorHandler.prototype.handlePagePathError = function(error) {
  console.warn('📄 页面路径错误，可能是系统内部问题');
  
  // 这类错误通常是微信开发者工具或系统内部问题
  // 不需要特殊处理，只记录日志
  this.logError('page_path', {
    type: 'page_path_error',
    timestamp: Date.now(),
    error: error,
    note: '系统内部错误，可忽略'
  });
};

/**
 * 处理日志文件错误
 */
ErrorHandler.prototype.handleLogFileError = function(error) {
  console.warn('📝 日志文件访问错误，可能是权限问题');
  
  // 增强文件日志写入的容错处理
  if (error && error.indexOf && error.indexOf('wxfile://usr/miniprogramLog') !== -1) {
    this.handleMiniprogramLogError(error);
  }
  
  // 日志文件错误通常不影响应用功能
  this.logError('log_file', {
    type: 'log_file_error',
    timestamp: Date.now(),
    error: error,
    note: '日志系统错误，不影响应用功能'
  });
};

/**
 * 处理小程序日志文件特殊错误
 */
ErrorHandler.prototype.handleMiniprogramLogError = function(error) {
  var self = this;
  console.warn('📁 小程序日志路径错误，尝试替代方案');
  
  // 尝试使用本地存储作为日志备份
  try {
    var logBackup = wx.getStorageSync('miniprogram_log_backup');
    if (!logBackup) {
      logBackup = [];
    }
    
    // 记录日志写入失败事件
    logBackup.push({
      timestamp: Date.now(),
      type: 'log_write_failure',
      error: error,
      fallback: 'using_local_storage'
    });
    
    // 限制备份日志大小（最多100条）
    if (logBackup.length > 100) {
      logBackup = logBackup.slice(-100);
    }
    
    wx.setStorageSync('miniprogram_log_backup', logBackup);
    console.log('✅ 日志已保存到本地存储备份');
    
  } catch (storageError) {
    console.error('❌ 连本地存储也失败了:', storageError);
    
    // 最后的兜底：仅在控制台记录
    console.warn('📝 日志系统完全失败，仅控制台记录:', {
      originalError: error,
      storageError: storageError,
      timestamp: Date.now()
    });
  }
};

/**
 * 处理其他错误
 */
ErrorHandler.prototype.handleOtherError = function(error) {
  console.error('❓ 其他类型错误:', error);
  
  this.logError('other', {
    type: 'other_error',
    timestamp: Date.now(),
    error: error
  });
};

/**
 * 显示网络错误提示
 */
ErrorHandler.prototype.showNetworkError = function() {
  wx.showToast({
    title: '网络连接异常',
    icon: 'none',
    duration: 2000
  });
};

/**
 * 显示慢网络提示
 */
ErrorHandler.prototype.showSlowNetworkTip = function(message) {
  var tipMessage = message || '网络较慢，正在后台加载数据';
  console.log('🐌', tipMessage);
  
  // 对于飞行员用户，显示简短的友好提示
  wx.showToast({
    title: tipMessage,
    icon: 'loading',
    duration: 2000
  });
};

/**
 * 记录错误日志
 */
ErrorHandler.prototype.logError = function(type, error) {
  var errorEntry = {
    type: type,
    timestamp: Date.now(),
    error: error,
    userAgent: this.getSystemPlatform()
  };
  
  this.errorLog.push(errorEntry);
  
  // 限制日志大小
  if (this.errorLog.length > this.maxLogSize) {
    this.errorLog.shift();
  }
  
  // 同步到本地存储（可选）
  try {
    wx.setStorageSync('error_log', this.errorLog);
  } catch (e) {
    console.warn('⚠️ 保存错误日志失败:', e);
  }
};

/**
 * 获取错误统计
 */
ErrorHandler.prototype.getErrorStats = function() {
  var stats = {
    total: this.errorLog.length,
    byType: {},
    recent: this.errorLog.slice(-10)
  };
  
  for (var i = 0; i < this.errorLog.length; i++) {
    var entry = this.errorLog[i];
    stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
  }
  
  return stats;
};

/**
 * 清除错误日志
 */
ErrorHandler.prototype.clearErrorLog = function() {
  this.errorLog = [];
  try {
    wx.removeStorageSync('error_log');
    console.log('🧹 错误日志已清除');
  } catch (e) {
    console.warn('⚠️ 清除错误日志失败:', e);
  }
};

/**
 * 手动触发分包预加载（兜底方案）
 * 离线优先策略：积极预加载所有数据包
 */
ErrorHandler.prototype.manualPreloadPackages = function(packages) {
  var self = this;
  console.log('🔄 离线优先：手动触发分包预加载:', packages);
  
  // 检查是否在支持的环境中
  if (typeof wx.loadSubpackage !== 'function') {
    console.warn('⚠️ 当前环境不支持wx.loadSubpackage，跳过分包预加载');
    return;
  }
  
  for (var i = 0; i < packages.length; i++) {
    var packageName = packages[i];
    var index = i;
    
    // 错开加载时间，避免并发冲突
    setTimeout(function(pkg, idx) {
      return function() {
        wx.loadSubpackage({
          name: pkg,
          success: function(res) {
            console.log('✅ 分包' + pkg + '加载成功 - 离线数据已就绪');
            
            // 记录成功加载的分包
            var loadedPackages = wx.getStorageSync('loaded_packages') || [];
            if (loadedPackages.indexOf(pkg) === -1) {
              loadedPackages.push(pkg);
              wx.setStorageSync('loaded_packages', loadedPackages);
            }
          },
          fail: function(err) {
            console.warn('❌ 分包' + pkg + '加载失败，将重试:', err);
            
            // 重试机制：3秒后重试一次
            setTimeout(function() {
              self.retryPackageLoad(pkg);
            }, 3000);
            
            self.logError('manual_preload', {
              package: pkg,
              error: err
            });
          }
        });
      };
    }(packageName, index), index * 500); // 每个包间隔500ms加载
  }
};

/**
 * 重试分包加载
 */
ErrorHandler.prototype.retryPackageLoad = function(packageName) {
  var self = this;
  console.log('🔄 重试加载分包: ' + packageName);
  
  // 检查是否在支持的环境中
  if (typeof wx.loadSubpackage !== 'function') {
    console.warn('⚠️ 当前环境不支持wx.loadSubpackage，跳过重试');
    return;
  }
  
  wx.loadSubpackage({
    name: packageName,
    success: function(res) {
      console.log('✅ 重试成功 - 分包' + packageName + '已加载');
      
      var loadedPackages = wx.getStorageSync('loaded_packages') || [];
      if (loadedPackages.indexOf(packageName) === -1) {
        loadedPackages.push(packageName);
        wx.setStorageSync('loaded_packages', loadedPackages);
      }
    },
    fail: function(err) {
      console.warn('❌ 分包' + packageName + '重试失败:', err);
      // 标记为需要在下次有网络时重试
      var failedPackages = wx.getStorageSync('failed_packages') || [];
      if (failedPackages.indexOf(packageName) === -1) {
        failedPackages.push(packageName);
        wx.setStorageSync('failed_packages', failedPackages);
      }
    }
  });
};

/**
 * 积极预加载所有分包（离线优先策略）
 */
ErrorHandler.prototype.aggressivePreloadAll = function() {
  var self = this;
  console.log('🚀 离线优先：启动积极预加载策略');
  
  // 检查是否在支持的环境中
  if (typeof wx.loadSubpackage !== 'function') {
    console.log('ℹ️ 开发工具环境：跳过预加载（真机上会自动预加载分包数据）');
    return;
  }
  
  // 检查网络状态
  wx.getNetworkType({
    success: function(res) {
      if (res.networkType !== 'none') {
        console.log('📶 检测到' + res.networkType + '网络，开始预加载所有数据');

        // 🔧 修复：完整的26个分包列表（13功能+13音频）
        var allPackages = [
          // 功能分包（13个）
          'packageA',           // icaoPackage - ICAO标准航空英语
          'packageB',           // abbreviationsPackage - AIP标准及空客缩写
          'packageC',           // airportPackage - 全球机场数据
          'packageD',           // definitionsPackage - 航空专业术语
          'packageF',           // acrPackage - ACR计算工具
          'packageG',           // dangerousGoodsPackage - 危险品规定
          'packageH',           // twinEnginePackage - 双发飞机性能
          'packagePerformance', // 飞机性能参数
          'packageCCAR',        // caacPackage - CCAR民航规章
          'packageIOSA',        // iosaPackage - IATA运行安全审计术语
          'packageO',           // pagesPackage - 工具集合
          'packageCompetence',  // competencePackage - PLM胜任力框架
          'packageMedical',     // medicalPackage - 民航体检标准
          // 音频分包（13个国家/地区）
          'packageJapan',       // 日本成田机场
          'packagePhilippines', // 菲律宾马尼拉机场
          'packageKorean',      // 韩国仁川机场
          'packageSingapore',   // 新加坡樟宜机场
          'packageThailand',    // 泰国曼谷机场
          'packageRussia',      // 俄罗斯莫斯科机场
          'packageSrilanka',    // 斯里兰卡科伦坡机场
          'packageAustralia',   // 澳大利亚悉尼机场
          'packageTurkey',      // 土耳其伊斯坦布尔机场
          'packageFrance',      // 法国戴高乐机场
          'packageAmerica',     // 美国旧金山机场
          'packageItaly',       // 意大利罗马机场
          'packageUAE'          // 阿联酋迪拜机场
        ];
        self.manualPreloadPackages(allPackages);
        
        // 显示友好提示
        wx.showToast({
          title: '正在后台加载离线数据',
          icon: 'loading',
          duration: 3000
        });
        
      } else {
        console.log('📵 无网络连接，跳过预加载');
      }
    },
    fail: function(err) {
      console.warn('❌ 无法检测网络状态:', err);
    }
  });
};

/**
 * 检查并补充缺失的分包
 */
ErrorHandler.prototype.checkAndFillMissingPackages = function() {
  var self = this;
  
  // 检查是否在支持的环境中
  if (typeof wx.loadSubpackage !== 'function') {
    console.warn('⚠️ 当前环境不支持wx.loadSubpackage，跳过分包检查');
    return;
  }

  // 🔧 修复：完整的26个分包列表
  var allPackages = [
    // 功能分包
    'packageA', 'packageB', 'packageC', 'packageD', 'packageF', 'packageG',
    'packageH', 'packagePerformance', 'packageCCAR', 'packageIOSA', 'packageO',
    'packageCompetence', 'packageMedical',
    // 音频分包
    'packageJapan', 'packagePhilippines', 'packageKorean', 'packageSingapore',
    'packageThailand', 'packageRussia', 'packageSrilanka', 'packageAustralia',
    'packageTurkey', 'packageFrance', 'packageAmerica', 'packageItaly', 'packageUAE'
  ];
  var loadedPackages = wx.getStorageSync('loaded_packages') || [];
  var failedPackages = wx.getStorageSync('failed_packages') || [];
  
  var missingPackages = [];
  for (var i = 0; i < allPackages.length; i++) {
    var pkg = allPackages[i];
    if (loadedPackages.indexOf(pkg) === -1 && failedPackages.indexOf(pkg) === -1) {
      missingPackages.push(pkg);
    }
  }
  
  if (missingPackages.length > 0) {
    console.log('🔄 发现缺失分包，补充加载:', missingPackages);
    this.manualPreloadPackages(missingPackages);
  } else {
    console.log('✅ 所有分包已加载完成，离线功能就绪');
  }
};

/**
 * 获取系统平台信息（使用新API）
 */
ErrorHandler.prototype.getSystemPlatform = function() {
  try {
    // 使用新的API获取设备信息
    if (typeof wx.getDeviceInfo === 'function') {
      var deviceInfo = wx.getDeviceInfo();
      return deviceInfo.platform || 'unknown';
    // 移除已废弃的getSystemInfoSync兜底
    } else {
      return 'unknown';
    }
  } catch (error) {
    console.warn('⚠️ 获取系统平台信息失败:', error);
    return 'unknown';
  }
};

/**
 * 检查分包状态
 */
ErrorHandler.prototype.checkSubpackageStatus = function() {
  // 这是一个辅助方法，帮助诊断分包问题
  console.log('🔍 检查分包状态...');

  // 🔧 修复：完整的26个分包列表
  var packages = [
    'packageA', 'packageB', 'packageC', 'packageD', 'packageF', 'packageG',
    'packageH', 'packagePerformance', 'packageCCAR', 'packageIOSA', 'packageO',
    'packageCompetence', 'packageMedical',
    'packageJapan', 'packagePhilippines', 'packageKorean', 'packageSingapore',
    'packageThailand', 'packageRussia', 'packageSrilanka', 'packageAustralia',
    'packageTurkey', 'packageFrance', 'packageAmerica', 'packageItaly', 'packageUAE'
  ];

  for (var i = 0; i < packages.length; i++) {
    var packageName = packages[i];
    try {
      // 尝试require分包中的文件来检查是否已加载
      var testPath = '../' + packageName + '/index.js';
      require(testPath);
      console.log('✅ 分包' + packageName + '可用');
    } catch (e) {
      console.warn('⚠️ 分包' + packageName + '不可用:', e.message);
    }
  }
};

/**
 * 通用错误处理方法 - 扩展功能
 */
ErrorHandler.prototype.handleError = function(error, context, showToast) {
  context = context || '操作';
  showToast = showToast !== false; // 默认显示toast
  
  console.error(context + '失败:', error);
  
  // 记录错误日志
  this.logError('handled', {
    context: context,
    error: error.message || error,
    timestamp: Date.now()
  });
  
  // 显示用户友好的错误提示
  if (showToast) {
    var errorMessage = this.getErrorMessage(error, context);
    wx.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 2000
    });
  }
  
  return { success: false, error: error };
};

/**
 * 获取用户友好的错误消息
 */
ErrorHandler.prototype.getErrorMessage = function(error, context) {
  context = context || '操作';
  
  if (error && error.message) {
    if (error.message.indexOf('timeout') !== -1) {
      return '操作超时，请检查网络后重试';
    } else if (error.message.indexOf('network') !== -1) {
      return '网络连接异常，请稍后重试';
    } else if (error.message.indexOf('permission') !== -1) {
      return '权限不足，请检查应用设置';
    }
  }
  
  return context + '失败，请重试';
};

/**
 * 安全的异步操作包装器
 */
ErrorHandler.prototype.safeAsync = function(asyncFunction, context) {
  var self = this;
  return new Promise(function(resolve, reject) {
    try {
      var result = asyncFunction();
      if (result && typeof result.then === 'function') {
        result.then(resolve).catch(function(error) {
          var handledError = self.handleError(error, context, false);
          reject(handledError);
        });
      } else {
        resolve(result);
      }
    } catch (error) {
      var handledError = self.handleError(error, context, false);
      reject(handledError);
    }
  });
};

/**
 * 网络请求错误处理
 */
ErrorHandler.prototype.handleNetworkError = function(error, context) {
  context = context || '网络请求';
  
  console.error(context + '失败:', error);
  
  var errorMessage = '网络异常';
  if (error.statusCode) {
    switch (error.statusCode) {
      case 404:
        errorMessage = '请求的资源不存在';
        break;
      case 500:
        errorMessage = '服务器内部错误';
        break;
      case 502:
        errorMessage = '网关错误';
        break;
      case 503:
        errorMessage = '服务暂不可用';
        break;
      default:
        errorMessage = '网络请求失败';
    }
  }
  
  wx.showToast({
    title: errorMessage,
    icon: 'none',
    duration: 2000
  });
  
  return { success: false, error: error };
};

// 创建全局实例
var errorHandler = new ErrorHandler();

// 导出方法
module.exports = {
  handleError: function(error, context, showToast) {
    return errorHandler.handleError(error, context, showToast);
  },
  handleNetworkError: function(error, context) {
    return errorHandler.handleNetworkError(error, context);
  },
  safeAsync: function(asyncFunction, context) {
    return errorHandler.safeAsync(asyncFunction, context);
  },
  getErrorMessage: function(error, context) {
    return errorHandler.getErrorMessage(error, context);
  },
  handlePredownloadTimeout: function(error) {
    return errorHandler.handlePredownloadTimeout(error);
  },
  handlePagePathError: function(error) {
    return errorHandler.handlePagePathError(error);
  },
  handleLogFileError: function(error) {
    return errorHandler.handleLogFileError(error);
  },
  getErrorStats: function() {
    return errorHandler.getErrorStats();
  },
  clearErrorLog: function() {
    return errorHandler.clearErrorLog();
  },
  manualPreloadPackages: function(packages) {
    return errorHandler.manualPreloadPackages(packages);
  },
  checkSubpackageStatus: function() {
    return errorHandler.checkSubpackageStatus();
  },
  logError: function(type, error) {
    return errorHandler.logError(type, error);
  },
  aggressivePreloadAll: function() {
    return errorHandler.aggressivePreloadAll();
  },
  checkAndFillMissingPackages: function() {
    return errorHandler.checkAndFillMissingPackages();
  },
  retryPackageLoad: function(packageName) {
    return errorHandler.retryPackageLoad(packageName);
  }
};