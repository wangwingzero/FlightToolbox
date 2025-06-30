// 🎯 基于Context7最佳实践：系统信息兼容性工具
// 解决wx.getSystemInfoSync已废弃的问题

/**
 * 系统信息获取兼容性工具
 * 替换已废弃的 wx.getSystemInfoSync API
 */

class SystemInfoHelper {
  constructor() {
    this.cachedInfo = null;
    this.cacheTime = 0;
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  }

  /**
   * 获取窗口信息（屏幕尺寸等）
   */
  getWindowInfo() {
    try {
      if (wx.getWindowInfo) {
        return wx.getWindowInfo();
      } else {
        // 兜底方案：使用旧API
        const systemInfo = wx.getSystemInfoSync();
        return {
          pixelRatio: systemInfo.pixelRatio,
          screenWidth: systemInfo.screenWidth,
          screenHeight: systemInfo.screenHeight,
          windowWidth: systemInfo.windowWidth,
          windowHeight: systemInfo.windowHeight,
          statusBarHeight: systemInfo.statusBarHeight,
          safeArea: systemInfo.safeArea
        };
      }
    } catch (error) {
      console.warn('获取窗口信息失败:', error);
      return {
        pixelRatio: 2,
        screenWidth: 375,
        screenHeight: 667,
        windowWidth: 375,
        windowHeight: 667,
        statusBarHeight: 20,
        safeArea: { top: 20, bottom: 667, left: 0, right: 375 }
      };
    }
  }

  /**
   * 获取系统设置信息
   */
  getSystemSetting() {
    try {
      if (wx.getSystemSetting) {
        return wx.getSystemSetting();
      } else {
        // 兜底方案
        const systemInfo = wx.getSystemInfoSync();
        return {
          bluetoothEnabled: systemInfo.bluetoothEnabled,
          locationEnabled: systemInfo.locationEnabled,
          wifiEnabled: systemInfo.wifiEnabled,
          deviceOrientation: systemInfo.deviceOrientation
        };
      }
    } catch (error) {
      console.warn('获取系统设置失败:', error);
      return {
        bluetoothEnabled: false,
        locationEnabled: false,
        wifiEnabled: true,
        deviceOrientation: 'portrait'
      };
    }
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    try {
      if (wx.getDeviceInfo) {
        return wx.getDeviceInfo();
      } else {
        // 兜底方案
        const systemInfo = wx.getSystemInfoSync();
        return {
          brand: systemInfo.brand,
          model: systemInfo.model,
          system: systemInfo.system,
          platform: systemInfo.platform,
          cpuType: systemInfo.cpuType,
          memorySize: systemInfo.memorySize,
          benchmarkLevel: systemInfo.benchmarkLevel
        };
      }
    } catch (error) {
      console.warn('获取设备信息失败:', error);
      return {
        brand: 'unknown',
        model: 'unknown',
        system: 'iOS 13.0',
        platform: 'ios',
        cpuType: 'unknown',
        memorySize: 0,
        benchmarkLevel: 0
      };
    }
  }

  /**
   * 获取应用基础信息
   */
  getAppBaseInfo() {
    try {
      if (wx.getAppBaseInfo) {
        return wx.getAppBaseInfo();
      } else {
        // 兜底方案
        const systemInfo = wx.getSystemInfoSync();
        return {
          SDKVersion: systemInfo.SDKVersion,
          enableDebug: systemInfo.enableDebug,
          host: systemInfo.host,
          language: systemInfo.language,
          version: systemInfo.version,
          theme: systemInfo.theme
        };
      }
    } catch (error) {
      console.warn('获取应用信息失败:', error);
      return {
        SDKVersion: '2.0.0',
        enableDebug: false,
        host: { env: 'WeChat' },
        language: 'zh_CN',
        version: '8.0.0',
        theme: 'light'
      };
    }
  }

  /**
   * 获取应用授权设置
   */
  getAppAuthorizeSetting() {
    try {
      if (wx.getAppAuthorizeSetting) {
        return wx.getAppAuthorizeSetting();
      } else {
        // 兜底方案：返回默认值
        return {
          albumAuthorized: 'not determined',
          bluetoothAuthorized: 'not determined',
          cameraAuthorized: 'not determined',
          locationAuthorized: 'not determined',
          locationReducedAccuracy: false,
          microphoneAuthorized: 'not determined',
          notificationAuthorized: 'not determined',
          phoneCalendarAuthorized: 'not determined'
        };
      }
    } catch (error) {
      console.warn('获取授权设置失败:', error);
      return {};
    }
  }

  /**
   * 获取完整的系统信息（兼容旧版本）
   * 推荐使用上面的具体方法而不是这个
   */
  getSystemInfo() {
    const now = Date.now();
    
    // 使用缓存
    if (this.cachedInfo && (now - this.cacheTime) < this.cacheTimeout) {
      return this.cachedInfo;
    }

    try {
      const windowInfo = this.getWindowInfo();
      const systemSetting = this.getSystemSetting();
      const deviceInfo = this.getDeviceInfo();
      const appBaseInfo = this.getAppBaseInfo();
      const appAuthorizeSetting = this.getAppAuthorizeSetting();

      // 合并所有信息
      const combinedInfo = {
        ...windowInfo,
        ...systemSetting,
        ...deviceInfo,
        ...appBaseInfo,
        ...appAuthorizeSetting
      };

      // 缓存结果
      this.cachedInfo = combinedInfo;
      this.cacheTime = now;

      return combinedInfo;
    } catch (error) {
      console.warn('获取系统信息失败，使用兜底方案:', error);
      
      // 最终兜底：使用旧API
      try {
        const fallbackInfo = wx.getSystemInfoSync();
        this.cachedInfo = fallbackInfo;
        this.cacheTime = now;
        return fallbackInfo;
      } catch (fallbackError) {
        console.error('兜底方案也失败了:', fallbackError);
        return {};
      }
    }
  }

  /**
   * 异步获取系统信息
   */
  getSystemInfoAsync() {
    return new Promise((resolve, reject) => {
      try {
        const info = this.getSystemInfo();
        resolve(info);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cachedInfo = null;
    this.cacheTime = 0;
  }

  /**
   * 检查API支持情况
   */
  checkAPISupport() {
    const support = {
      getWindowInfo: !!wx.getWindowInfo,
      getSystemSetting: !!wx.getSystemSetting,
      getDeviceInfo: !!wx.getDeviceInfo,
      getAppBaseInfo: !!wx.getAppBaseInfo,
      getAppAuthorizeSetting: !!wx.getAppAuthorizeSetting,
      getSystemInfoSync: !!wx.getSystemInfoSync
    };

    console.log('系统信息API支持情况:', support);
    return support;
  }
}

// 创建单例实例
const systemInfoHelper = new SystemInfoHelper();

// 导出实例和类
module.exports = {
  systemInfoHelper,
  SystemInfoHelper
};

// 兼容性导出
module.exports.getWindowInfo = () => systemInfoHelper.getWindowInfo();
module.exports.getSystemSetting = () => systemInfoHelper.getSystemSetting();
module.exports.getDeviceInfo = () => systemInfoHelper.getDeviceInfo();
module.exports.getAppBaseInfo = () => systemInfoHelper.getAppBaseInfo();
module.exports.getAppAuthorizeSetting = () => systemInfoHelper.getAppAuthorizeSetting();
module.exports.getSystemInfo = () => systemInfoHelper.getSystemInfo(); 