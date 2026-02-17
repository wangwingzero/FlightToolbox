// 🎯 基于Context7最佳实践：系统信息兼容性工具
// 解决wx.getSystemInfoSync已废弃的问题

/**
 * 系统信息获取兼容性工具
 * 替换已废弃的 wx.getSystemInfoSync API
 */
function SystemInfoHelper() {
  this.cachedInfo = null;
  this.cacheTime = 0;
  this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
}

/**
 * 获取设备信息（推荐用于环境检测）
 */
SystemInfoHelper.prototype.getDeviceInfo = function() {
  try {
    if (wx.getDeviceInfo) {
      return wx.getDeviceInfo();
    } else {
      // 兜底方案：使用旧API
      var systemInfo = wx.getSystemInfoSync();
      return {
        brand: systemInfo.brand,
        model: systemInfo.model,
        system: systemInfo.system,
        platform: systemInfo.platform,
        deviceType: systemInfo.deviceType,
        benchmarkLevel: systemInfo.benchmarkLevel
      };
    }
  } catch (error) {
    console.warn('获取设备信息失败:', error);
    return {
      brand: 'unknown',
      model: 'unknown',
      system: 'unknown',
      platform: 'miniprogram',
      deviceType: 'phone',
      benchmarkLevel: -1
    };
  }
};

/**
 * 获取窗口信息（屏幕尺寸等）
 */
SystemInfoHelper.prototype.getWindowInfo = function() {
  try {
    if (wx.getWindowInfo) {
      return wx.getWindowInfo();
    } else {
      // 兜底方案：使用旧API
      var systemInfo = wx.getSystemInfoSync();
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
};

/**
 * 获取应用基础信息
 */
SystemInfoHelper.prototype.getAppBaseInfo = function() {
  try {
    if (wx.getAppBaseInfo) {
      return wx.getAppBaseInfo();
    } else {
      // 兜底方案
      var systemInfo = wx.getSystemInfoSync();
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
    console.warn('获取应用基础信息失败:', error);
    return {
      SDKVersion: '2.0.0',
      enableDebug: false,
      host: { appId: '' },
      language: 'zh_CN',
      version: '1.0.0',
      theme: 'light'
    };
  }
};

/**
 * 获取完整系统信息（兼容旧版本调用）
 * 主要用于替换 wx.getSystemInfoSync()
 */
SystemInfoHelper.prototype.getSystemInfo = function() {
  var now = Date.now();
  
  // 检查缓存
  if (this.cachedInfo && now - this.cacheTime < this.cacheTimeout) {
    return this.cachedInfo;
  }
  
  try {
    // 尝试使用新版API组合
    var deviceInfo = this.getDeviceInfo();
    var windowInfo = this.getWindowInfo();
    var appBaseInfo = this.getAppBaseInfo();
    
    // 组合所有信息
    var combinedInfo = Object.assign({}, deviceInfo, windowInfo, appBaseInfo);
    
    this.cachedInfo = combinedInfo;
    this.cacheTime = now;
    return combinedInfo;
    
  } catch (error) {
    console.warn('新版API组合失败，使用兜底方案:', error);
    
    // 最终兜底：使用旧API
    try {
      var fallbackInfo = wx.getSystemInfoSync();
      this.cachedInfo = fallbackInfo;
      this.cacheTime = now;
      return fallbackInfo;
    } catch (fallbackError) {
      console.error('兜底方案也失败:', fallbackError);
      return this._getDefaultSystemInfo();
    }
  }
};

/**
 * 获取默认系统信息
 */
SystemInfoHelper.prototype._getDefaultSystemInfo = function() {
  return {
    brand: 'unknown',
    model: 'unknown',
    pixelRatio: 2,
    screenWidth: 375,
    screenHeight: 667,
    windowWidth: 375,
    windowHeight: 667,
    statusBarHeight: 20,
    language: 'zh_CN',
    system: 'unknown',
    platform: 'miniprogram',
    SDKVersion: '2.0.0'
  };
};

/**
 * 清理缓存
 */
SystemInfoHelper.prototype.clearCache = function() {
  this.cachedInfo = null;
  this.cacheTime = 0;
};

// 创建全局实例
var systemInfoHelper = new SystemInfoHelper();

module.exports = systemInfoHelper;