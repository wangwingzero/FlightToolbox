/**
 * 环境诊断工具
 * 用于精确判断当前运行环境和API可用性
 */

var EnvDiagnostic = {
  /**
   * 获取完整的环境诊断报告
   */
  getFullReport: function() {
    var report = {
      timestamp: new Date().toISOString(),

      // 1. 基础环境信息
      platform: (wx.getDeviceInfo && wx.getDeviceInfo().platform) || (wx.getSystemInfoSync && wx.getSystemInfoSync().platform),
      system: (wx.getDeviceInfo && wx.getDeviceInfo().system) || (wx.getSystemInfoSync && wx.getSystemInfoSync().system),
      version: (wx.getAppBaseInfo && wx.getAppBaseInfo().version) || (wx.getSystemInfoSync && wx.getSystemInfoSync().version), // 微信版本
      SDKVersion: (wx.getAppBaseInfo && (wx.getAppBaseInfo().SDKVersion || wx.getAppBaseInfo().hostVersion)) || (wx.getSystemInfoSync && wx.getSystemInfoSync().SDKVersion), // 基础库版本

      // 2. API可用性检测
      apis: {
        loadSubpackage: {
          exists: typeof wx.loadSubpackage === 'function',
          type: typeof wx.loadSubpackage
        },
        getFileSystemManager: {
          exists: typeof wx.getFileSystemManager === 'function',
          type: typeof wx.getFileSystemManager
        },
        getImageInfo: {
          exists: typeof wx.getImageInfo === 'function',
          type: typeof wx.getImageInfo
        }
      },

      // 3. 环境类型判断
      environment: this.detectEnvironment(),

      // 4. 账号信息
      accountInfo: this.getAccountInfo(),

      // 5. 调试信息
      debug: {
        isDebug: (wx.getAppBaseInfo && wx.getAppBaseInfo().enableDebug) || (wx.getSystemInfoSync && wx.getSystemInfoSync().enableDebug) || false
      }
    };

    return report;
  },

  /**
   * 检测当前环境类型
   * 改进版：优先使用envVersion判断，而不是仅依赖API是否存在
   */
  detectEnvironment: function() {
    var env = {
      type: 'unknown',
      description: '',
      canUseLoadSubpackage: false,
      isRealDevice: false,
      envVersion: ''
    };

    var platform = (wx.getDeviceInfo && wx.getDeviceInfo().platform) ||
                   (wx.getAppBaseInfo && wx.getAppBaseInfo().platform) ||
                   (wx.getSystemInfoSync && wx.getSystemInfoSync().platform) ||
                   'unknown';
    var accountInfo = this.getAccountInfo();

    // 1. 优先判断是否为开发者工具
    if (platform === 'devtools') {
      env.type = 'devtools';
      env.description = '开发者工具环境';
      env.canUseLoadSubpackage = false;
      env.isRealDevice = false;
      return env;
    }

    // 2. 真机环境，获取envVersion
    env.isRealDevice = true;
    if (accountInfo && accountInfo.miniProgram) {
      env.envVersion = accountInfo.miniProgram.envVersion;
    }

    // 3. 检测wx.loadSubpackage是否可用
    var loadSubpackageExists = typeof wx.loadSubpackage === 'function';
    env.canUseLoadSubpackage = loadSubpackageExists;

    // 4. 根据envVersion和API可用性综合判断
    if (env.envVersion === 'develop') {
      // 开发版（预览或真机调试）
      if (loadSubpackageExists) {
        env.type = 'preview';
        env.description = '预览模式（开发版，API可用）';
      } else {
        env.type = 'debug';
        env.description = '真机调试模式（开发版，API不可用）';
      }
    } else if (env.envVersion === 'trial') {
      // 体验版
      env.type = 'trial';
      env.description = '体验版';
      env.canUseLoadSubpackage = loadSubpackageExists;
    } else if (env.envVersion === 'release') {
      // 正式版
      env.type = 'release';
      env.description = '正式版';
      env.canUseLoadSubpackage = loadSubpackageExists;
    } else {
      // 无法获取envVersion
      if (loadSubpackageExists) {
        env.type = 'unknown_with_api';
        env.description = '未知环境（API可用）';
      } else {
        env.type = 'unknown_no_api';
        env.description = '未知环境（API不可用）';
      }
    }

    return env;
  },

  /**
   * 获取账号信息
   */
  getAccountInfo: function() {
    try {
      if (typeof wx.getAccountInfoSync === 'function') {
        return wx.getAccountInfoSync();
      }
    } catch (err) {
      console.warn('无法获取账号信息:', err);
    }
    return null;
  },

  /**
   * 测试wx.loadSubpackage实际可用性
   * @param {string} packageName - 分包名称
   * @returns {Promise<object>} 测试结果
   */
  testLoadSubpackage: function(packageName) {
    var self = this;
    return new Promise(function(resolve) {
      var result = {
        apiExists: typeof wx.loadSubpackage === 'function',
        canCall: false,
        error: null,
        duration: 0
      };

      if (!result.apiExists) {
        result.error = 'API不存在';
        resolve(result);
        return;
      }

      var startTime = Date.now();

      try {
        var task = wx.loadSubpackage({
          name: packageName,
          success: function() {
            result.canCall = true;
            result.duration = Date.now() - startTime;
            console.log('✅ wx.loadSubpackage调用成功，耗时:', result.duration + 'ms');
            resolve(result);
          },
          fail: function(err) {
            result.canCall = false;
            result.error = err.errMsg || JSON.stringify(err);
            result.duration = Date.now() - startTime;
            console.error('❌ wx.loadSubpackage调用失败:', err);
            resolve(result);
          }
        });

        // 检查返回的task对象
        if (task && typeof task.onProgressUpdate === 'function') {
          task.onProgressUpdate(function(res) {
            console.log('分包下载进度:', res.progress + '%');
          });
        }
      } catch (err) {
        result.canCall = false;
        result.error = '调用异常: ' + (err.message || JSON.stringify(err));
        result.duration = Date.now() - startTime;
        console.error('❌ wx.loadSubpackage调用异常:', err);
        resolve(result);
      }
    });
  },

  /**
   * 格式化报告为可读文本
   */
  formatReport: function(report) {
    var lines = [
      '=== 环境诊断报告 ===',
      '',
      '🕐 时间: ' + new Date(report.timestamp).toLocaleString('zh-CN'),
      '',
      '📱 设备信息',
      '  平台: ' + report.platform,
      '  系统: ' + report.system,
      '  微信版本: ' + report.version,
      '  基础库版本: ' + report.SDKVersion,
      '',
      '🔧 环境类型',
      '  类型: ' + report.environment.type,
      '  描述: ' + report.environment.description,
      '  wx.loadSubpackage可用: ' + (report.environment.canUseLoadSubpackage ? '✅ 是' : '❌ 否'),
      '',
      '🛠️ API可用性',
      '  wx.loadSubpackage: ' + (report.apis.loadSubpackage.exists ? '✅ 存在' : '❌ 不存在'),
      '  wx.getFileSystemManager: ' + (report.apis.getFileSystemManager.exists ? '✅ 存在' : '❌ 不存在'),
      '  wx.getImageInfo: ' + (report.apis.getImageInfo.exists ? '✅ 存在' : '❌ 不存在'),
      ''
    ];

    if (report.accountInfo) {
      lines.push('📦 小程序信息');
      lines.push('  AppID: ' + (report.accountInfo.miniProgram.appId || '未知'));
      lines.push('  版本类型: ' + (report.accountInfo.miniProgram.envVersion || '未知'));
      lines.push('');
    }

    if (report.loadSubpackageTest) {
      lines.push('🧪 wx.loadSubpackage实测');
      lines.push('  API存在: ' + (report.loadSubpackageTest.apiExists ? '✅ 是' : '❌ 否'));
      lines.push('  可调用: ' + (report.loadSubpackageTest.canCall ? '✅ 是' : '❌ 否'));
      if (report.loadSubpackageTest.error) {
        lines.push('  错误信息: ' + report.loadSubpackageTest.error);
      }
      if (report.loadSubpackageTest.duration > 0) {
        lines.push('  耗时: ' + report.loadSubpackageTest.duration + 'ms');
      }
      lines.push('');
    }

    return lines.join('\n');
  }
};

module.exports = EnvDiagnostic;
