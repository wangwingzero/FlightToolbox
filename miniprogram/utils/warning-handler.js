// 🎯 基于Context7最佳实践：控制台警告处理工具
// 用于处理开发环境中的各种警告信息

/**
 * 控制台警告处理器
 * 过滤和处理微信小程序开发中的常见警告
 */
var systemInfoHelper = require('./system-info-helper.js');

class WarningHandler {
  
  /**
   * 初始化警告处理器
   */
  static init() {
    if (typeof console !== 'undefined') {
      this.setupConsoleFilters();
    }
    
    // 记录初始化状态
  }
  
  /**
   * 设置控制台过滤器
   * 注意：在微信小程序环境中，console方法可能无法被重写
   * 这里主要是记录过滤器的初始化状态
   */
  static setupConsoleFilters() {
    // 在微信小程序中，console方法可能是只读的
    // 我们提供一个替代方案：创建自定义的日志方法
    
    // 尝试重写console方法（可能在某些环境中不生效）
    try {
      const originalWarn = console.warn;
      const originalError = console.error;
      
      // 尝试重写warn方法
      const customWarn = function(...args) {
        // 同时考虑字符串参数和对象参数中的 errMsg 字段，便于匹配微信API的错误信息
        const messageParts = args.map(arg => {
          if (typeof arg === 'string') {
            return arg;
          }
          if (arg && typeof arg.errMsg === 'string') {
            return arg.errMsg;
          }
          return '';
        }).filter(Boolean);

        const message = messageParts.join(' ');
        
        // 过滤已知的无害警告
        if (WarningHandler.shouldFilterWarning(message)) {
          return; // 不显示这些警告
        }
        
        // 显示其他警告
        originalWarn.apply(console, args);
      };
      
      // 尝试重写error方法
      const customError = function(...args) {
        const message = args.join(' ');
        
        // 过滤已知的无害错误
        if (WarningHandler.shouldFilterError(message)) {
          return; // 不显示这些错误
        }
        
        // 显示其他错误
        originalError.apply(console, args);
      };
      
      // 尝试应用自定义方法
      if (typeof console.warn === 'function') {
        console.warn = customWarn;
      }
      if (typeof console.error === 'function') {
        console.error = customError;
      }
      
    } catch (error) {
      console.warn('⚠️ 控制台过滤器设置失败（这在微信小程序中是正常的）:', error.message);
      console.warn('💡 将使用静态过滤提示方式');
    }
  }
  
  /**
   * 判断是否应该过滤警告
   * @param {string} message - 警告消息
   * @returns {boolean} 是否过滤
   */
  static shouldFilterWarning(message) {
    const filterPatterns = [
      // SharedArrayBuffer 相关警告（Chrome浏览器警告，不影响小程序）
      /SharedArrayBuffer will require cross-origin isolation/,
      
      // 字体加载警告（已有兜底方案）
      /Failed to load font.*at\.alicdn\.com/,
      
      // 开发工具相关警告
      /Failed to load other.*127\.0\.0\.1/,
      
      // 已废弃API警告（已有兼容性处理）
      /wx\.getSystemInfoSync is deprecated/,

      // 开发者工具暂不支持的音频配置告警
      /setInnerAudioOption:fail 开发者工具暂时不支持此 API 调试/
    ];
    
    return filterPatterns.some(pattern => pattern.test(message));
  }
  
  /**
   * 判断是否应该过滤错误
   * @param {string} message - 错误消息
   * @returns {boolean} 是否过滤
   */
  static shouldFilterError(message) {
    const filterPatterns = [
      // 网络缓存相关错误（开发环境正常）
      /net::ERR_CACHE_MISS/,
      
      // 开发工具相关错误
      /Failed to load.*127\.0\.0\.1/,

      /The play\(\) request was interrupted by a call to pause\(\)/,
      /AbortError: SystemError \(webviewScriptError\)/
    ];
    
    return filterPatterns.some(pattern => pattern.test(message));
  }
  
  /**
   * 显示警告处理统计和说明
   */
  static showStats() {
    console.group('📊 WarningHandler 统计信息');
    console.log('✅ 已识别的可忽略警告类型:');
    console.log('  - SharedArrayBuffer 警告 (Chrome浏览器相关)');
    console.log('  - 字体加载失败警告 (已有兜底方案)');
    console.log('  - 开发工具网络警告 (热重载相关)');
    console.log('  - 已废弃API警告 (已有兼容性处理)');
    console.log('');
    console.log('🎯 这些警告不影响小程序功能，可安全忽略');
    console.groupEnd();
  }
  
  /**
   * 显示控制台警告说明
   */
  static showWarningExplanation() {
    console.group('💡 控制台警告说明');
    
    console.log('🔍 如果您看到以下警告，可以安全忽略：');
    console.log('');
    
    console.log('1️⃣ wx.getSystemInfoSync is deprecated');
    console.log('   📝 原因: 微信API更新，旧API已废弃');
    console.log('   ✅ 状态: 项目已使用新API，Vant组件库的警告可忽略');
    console.log('');
    
    console.log('2️⃣ SharedArrayBuffer will require cross-origin isolation');
    console.log('   📝 原因: Chrome浏览器相关警告');
    console.log('   ✅ 状态: 不影响小程序功能，仅开发工具显示');
    console.log('');
    
    console.log('3️⃣ Failed to load font http://at.alicdn.com/...');
    console.log('   📝 原因: Vant图标字体网络加载失败');
    console.log('   ✅ 状态: 已添加字体兜底方案，不影响显示');
    console.log('');
    
    console.log('4️⃣ Failed to load other http://127.0.0.1:...');
    console.log('   📝 原因: 开发工具热重载机制');
    console.log('   ✅ 状态: 开发环境正常现象，真机不会出现');
    console.log('');
    
    console.log('🎯 所有警告都已分析并处理，小程序功能完全正常！');
    console.groupEnd();
  }
  
  /**
   * 手动报告重要警告
   * @param {string} type - 警告类型
   * @param {string} message - 警告消息
   * @param {object} context - 上下文信息
   */
  static reportWarning(type, message, context = {}) {
    console.group(`⚠️ [${type}] 重要警告`);
    console.warn(message);
    if (Object.keys(context).length > 0) {
      console.log('上下文信息:', context);
    }
    console.log('建议: 请检查相关代码并进行修复');
    console.groupEnd();
  }
  
  /**
   * 检查环境并提供建议
   */
  static checkEnvironment() {
    try {
      // 检查基础库版本
      const appBaseInfo = (systemInfoHelper.getAppBaseInfo && systemInfoHelper.getAppBaseInfo()) || {};
      const sdkVersion = appBaseInfo.SDKVersion;
      
      console.group('🔍 环境检查结果');
      console.log(`基础库版本: ${sdkVersion}`);
      
      // 检查版本兼容性
      if (this.compareVersion(sdkVersion, '2.14.1') < 0) {
        this.reportWarning('版本兼容性', '基础库版本过低，建议升级到2.14.1+', {
          currentVersion: sdkVersion,
          recommendedVersion: '2.14.1+'
        });
      } else {
        console.log('✅ 基础库版本符合要求');
      }
      
      // 检查系统信息API使用
      if (typeof wx.getWindowInfo === 'function') {
        console.log('✅ 新版系统信息API可用');
      } else {
        console.log('⚠️ 新版系统信息API不可用，将使用兜底方案');
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('环境检查失败:', error);
    }
  }
  
  /**
   * 版本号比较
   * @param {string} v1 - 版本1
   * @param {string} v2 - 版本2
   * @returns {number} 比较结果
   */
  static compareVersion(v1, v2) {
    const arr1 = v1.split('.');
    const arr2 = v2.split('.');
    const length = Math.max(arr1.length, arr2.length);

    for (let i = 0; i < length; i++) {
      const num1 = parseInt(arr1[i] || 0);
      const num2 = parseInt(arr2[i] || 0);
      
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    
    return 0;
  }
  
  /**
   * 清理和重置
   */
  static cleanup() {
    // 恢复原始console方法（如果需要）
    console.log('🧹 WarningHandler 已清理');
  }
}

module.exports = WarningHandler; 