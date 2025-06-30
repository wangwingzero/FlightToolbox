/**
 * FlightToolbox 错误处理工具
 * 处理分包预下载、页面路径、日志等常见错误
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 50;
    this.init();
  }

  init() {
    // 监听全局错误
    wx.onError((error) => {
      this.handleGlobalError(error);
    });

    // 监听未处理的Promise拒绝
    wx.onUnhandledRejection((rejection) => {
      this.handleUnhandledRejection(rejection);
    });

    console.log('🛡️ ErrorHandler初始化完成');
  }

  /**
   * 处理全局错误
   */
  handleGlobalError(error) {
    console.error('🚨 全局错误:', error);
    
    // 分类处理不同类型的错误
    if (error.includes('predownload timeout')) {
      this.handlePredownloadTimeout(error);
    } else if (error.includes('unexpected page benchmark path')) {
      this.handlePagePathError(error);
    } else if (error.includes('wxfile://usr/miniprogramLog')) {
      this.handleLogFileError(error);
    } else {
      this.handleOtherError(error);
    }
    
    this.logError('global', error);
  }

  /**
   * 处理未处理的Promise拒绝
   */
  handleUnhandledRejection(rejection) {
    console.error('🚨 未处理的Promise拒绝:', rejection);
    
    if (rejection.reason && rejection.reason.includes('predownload timeout')) {
      this.handlePredownloadTimeout(rejection.reason);
    }
    
    this.logError('promise', rejection.reason);
  }

  /**
   * 处理分包预下载超时
   */
  handlePredownloadTimeout(error) {
    console.warn('⏰ 分包预下载超时，启用兜底策略');
    
    // 记录超时事件
    const timeoutInfo = {
      type: 'predownload_timeout',
      timestamp: Date.now(),
      error: error,
      networkType: 'unknown'
    };
    
    // 获取网络状态
    wx.getNetworkType({
      success: (res) => {
        timeoutInfo.networkType = res.networkType;
        console.log('📶 当前网络状态:', res.networkType);
        
        // 针对飞行员使用场景的网络策略
        if (res.networkType === 'none') {
          this.showNetworkError();
        } else if (res.networkType === '2g') {
          this.showSlowNetworkTip('2G网络较慢，正在后台加载数据');
        } else if (res.networkType === '3g') {
          this.showSlowNetworkTip('3G网络加载中，请稍候');
        } else if (res.networkType === '4g' || res.networkType === '5g') {
          // 4G/5G网络超时可能是服务器问题，静默处理
          console.log('📱 4G/5G网络超时，可能是临时网络波动');
        } else {
          console.log('📶 网络类型:', res.networkType);
        }
      },
      fail: (err) => {
        console.error('❌ 获取网络状态失败:', err);
      }
    });
    
    this.logError('predownload_timeout', timeoutInfo);
  }

  /**
   * 处理页面路径错误
   */
  handlePagePathError(error) {
    console.warn('📄 页面路径错误，可能是系统内部问题');
    
    // 这类错误通常是微信开发者工具或系统内部问题
    // 不需要特殊处理，只记录日志
    this.logError('page_path', {
      type: 'page_path_error',
      timestamp: Date.now(),
      error: error,
      note: '系统内部错误，可忽略'
    });
  }

  /**
   * 处理日志文件错误
   */
  handleLogFileError(error) {
    console.warn('📝 日志文件访问错误，可能是权限问题');
    
    // 日志文件错误通常不影响应用功能
    this.logError('log_file', {
      type: 'log_file_error',
      timestamp: Date.now(),
      error: error,
      note: '日志系统错误，不影响应用功能'
    });
  }

  /**
   * 处理其他错误
   */
  handleOtherError(error) {
    console.error('❓ 其他类型错误:', error);
    
    this.logError('other', {
      type: 'other_error',
      timestamp: Date.now(),
      error: error
    });
  }

  /**
   * 显示网络错误提示
   */
  showNetworkError() {
    wx.showToast({
      title: '网络连接异常',
      icon: 'none',
      duration: 2000
    });
  }

  /**
   * 显示慢网络提示
   */
  showSlowNetworkTip(message) {
    const tipMessage = message || '网络较慢，正在后台加载数据';
    console.log('🐌', tipMessage);
    
    // 对于飞行员用户，显示简短的友好提示
    wx.showToast({
      title: tipMessage,
      icon: 'loading',
      duration: 2000
    });
  }

  /**
   * 记录错误日志
   */
  logError(type, error) {
    const errorEntry = {
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
  }

  /**
   * 获取错误统计
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      recent: this.errorLog.slice(-10)
    };
    
    this.errorLog.forEach(entry => {
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * 清除错误日志
   */
  clearErrorLog() {
    this.errorLog = [];
    try {
      wx.removeStorageSync('error_log');
      console.log('🧹 错误日志已清除');
    } catch (e) {
      console.warn('⚠️ 清除错误日志失败:', e);
    }
  }

  /**
   * 手动触发分包预加载（兜底方案）
   * 离线优先策略：积极预加载所有数据包
   */
  manualPreloadPackages(packages) {
    console.log('🔄 离线优先：手动触发分包预加载:', packages);
    
    // 检查是否在支持的环境中
    if (typeof wx.loadSubpackage !== 'function') {
      console.warn('⚠️ 当前环境不支持wx.loadSubpackage，跳过分包预加载');
      return;
    }
    
    packages.forEach((packageName, index) => {
      // 错开加载时间，避免并发冲突
      setTimeout(() => {
        wx.loadSubpackage({
          name: packageName,
          success: (res) => {
            console.log(`✅ 分包${packageName}加载成功 - 离线数据已就绪`);
            
            // 记录成功加载的分包
            const loadedPackages = wx.getStorageSync('loaded_packages') || [];
            if (loadedPackages.indexOf(packageName) === -1) {
              loadedPackages.push(packageName);
              wx.setStorageSync('loaded_packages', loadedPackages);
            }
          },
          fail: (err) => {
            console.warn(`❌ 分包${packageName}加载失败，将重试:`, err);
            
            // 重试机制：3秒后重试一次
            setTimeout(() => {
              this.retryPackageLoad(packageName);
            }, 3000);
            
            this.logError('manual_preload', {
              package: packageName,
              error: err
            });
          }
        });
      }, index * 500); // 每个包间隔500ms加载
    });
  }

  /**
   * 重试分包加载
   */
  retryPackageLoad(packageName) {
    console.log(`🔄 重试加载分包: ${packageName}`);
    
    // 检查是否在支持的环境中
    if (typeof wx.loadSubpackage !== 'function') {
      console.warn('⚠️ 当前环境不支持wx.loadSubpackage，跳过重试');
      return;
    }
    
    wx.loadSubpackage({
      name: packageName,
      success: (res) => {
        console.log(`✅ 重试成功 - 分包${packageName}已加载`);
        
        const loadedPackages = wx.getStorageSync('loaded_packages') || [];
        if (loadedPackages.indexOf(packageName) === -1) {
          loadedPackages.push(packageName);
          wx.setStorageSync('loaded_packages', loadedPackages);
        }
      },
      fail: (err) => {
        console.warn(`❌ 分包${packageName}重试失败:`, err);
        // 标记为需要在下次有网络时重试
        const failedPackages = wx.getStorageSync('failed_packages') || [];
        if (failedPackages.indexOf(packageName) === -1) {
          failedPackages.push(packageName);
          wx.setStorageSync('failed_packages', failedPackages);
        }
      }
    });
  }

  /**
   * 积极预加载所有分包（离线优先策略）
   */
  aggressivePreloadAll() {
    console.log('🚀 离线优先：启动积极预加载策略');
    
    // 检查是否在支持的环境中
    if (typeof wx.loadSubpackage !== 'function') {
      console.warn('⚠️ 当前环境不支持wx.loadSubpackage（可能是开发者工具），在真机上会正常工作');
      return;
    }
    
    // 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType !== 'none') {
          console.log(`📶 检测到${res.networkType}网络，开始预加载所有数据`);
          
          // 预加载所有分包
          const allPackages = ['packageA', 'packageB', 'packageC', 'packageD', 'packageE', 'packageF', 'packageG', 'packageH'];
          this.manualPreloadPackages(allPackages);
          
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
      fail: (err) => {
        console.warn('❌ 无法检测网络状态:', err);
      }
    });
  }

  /**
   * 检查并补充缺失的分包
   */
  checkAndFillMissingPackages() {
    // 检查是否在支持的环境中
    if (typeof wx.loadSubpackage !== 'function') {
      console.warn('⚠️ 当前环境不支持wx.loadSubpackage，跳过分包检查');
      return;
    }
    
    const allPackages = ['packageA', 'packageB', 'packageC', 'packageD', 'packageE', 'packageF', 'packageG', 'packageH'];
    const loadedPackages = wx.getStorageSync('loaded_packages') || [];
    const failedPackages = wx.getStorageSync('failed_packages') || [];
    
    const missingPackages = allPackages.filter(pkg => 
      loadedPackages.indexOf(pkg) === -1 && failedPackages.indexOf(pkg) === -1
    );
    
    if (missingPackages.length > 0) {
      console.log('🔄 发现缺失分包，补充加载:', missingPackages);
      this.manualPreloadPackages(missingPackages);
    } else {
      console.log('✅ 所有分包已加载完成，离线功能就绪');
    }
  }

  /**
   * 获取系统平台信息（使用新API）
   */
  getSystemPlatform() {
    try {
      // 使用新的API获取设备信息
      if (typeof wx.getDeviceInfo === 'function') {
        const deviceInfo = wx.getDeviceInfo();
        return deviceInfo.platform || 'unknown';
      } else if (typeof wx.getSystemInfoSync === 'function') {
        // 兜底使用旧API
        const systemInfo = wx.getSystemInfoSync();
        return systemInfo.platform || 'unknown';
      } else {
        return 'unknown';
      }
    } catch (error) {
      console.warn('⚠️ 获取系统平台信息失败:', error);
      return 'unknown';
    }
  }

  /**
   * 检查分包状态
   */
  checkSubpackageStatus() {
    // 这是一个辅助方法，帮助诊断分包问题
    console.log('🔍 检查分包状态...');
    
    const packages = ['packageA', 'packageB', 'packageC', 'packageD', 'packageE', 'packageF', 'packageG', 'packageH'];
    
    packages.forEach(packageName => {
      try {
        // 尝试require分包中的文件来检查是否已加载
        const testPath = `../${packageName}/index.js`;
        require(testPath);
        console.log(`✅ 分包${packageName}可用`);
      } catch (e) {
        console.warn(`⚠️ 分包${packageName}不可用:`, e.message);
      }
    });
  }
}

// 创建全局实例
const errorHandler = new ErrorHandler();

// 导出方法
module.exports = {
  handlePredownloadTimeout: errorHandler.handlePredownloadTimeout.bind(errorHandler),
  handlePagePathError: errorHandler.handlePagePathError.bind(errorHandler),
  handleLogFileError: errorHandler.handleLogFileError.bind(errorHandler),
  getErrorStats: errorHandler.getErrorStats.bind(errorHandler),
  clearErrorLog: errorHandler.clearErrorLog.bind(errorHandler),
  manualPreloadPackages: errorHandler.manualPreloadPackages.bind(errorHandler),
  checkSubpackageStatus: errorHandler.checkSubpackageStatus.bind(errorHandler),
  logError: errorHandler.logError.bind(errorHandler),
  aggressivePreloadAll: errorHandler.aggressivePreloadAll.bind(errorHandler),
  checkAndFillMissingPackages: errorHandler.checkAndFillMissingPackages.bind(errorHandler),
  retryPackageLoad: errorHandler.retryPackageLoad.bind(errorHandler)
}; 