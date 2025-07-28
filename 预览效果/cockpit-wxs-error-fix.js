/**
 * 微信小程序WXS错误修复方案
 * 解决 String.prototype.indexOf called on null or undefined 错误
 * 
 * 错误分析：
 * 1. 错误发生在 common.app.js:36，涉及 WXS 处理
 * 2. 错误堆栈显示问题出现在 setData 操作中
 * 3. 某个字符串字段被设置为 null 或 undefined，导致 WXS 处理时调用 indexOf 方法失败
 * 4. 错误发生在 checkNetworkStatus 函数的 success 回调中
 */

// 安全的 setData 包装函数
function safeSetData(page, data) {
  // 深度检查并修复数据中的 null/undefined 字符串字段
  const sanitizedData = sanitizeDataForWXS(data);
  
  try {
    page.setData(sanitizedData);
  } catch (error) {
    console.error('setData 操作失败:', error);
    // 尝试逐个字段设置，找出问题字段
    for (const key in sanitizedData) {
      try {
        const singleData = {};
        singleData[key] = sanitizedData[key];
        page.setData(singleData);
      } catch (fieldError) {
        console.error(`字段 ${key} 设置失败:`, fieldError, '值:', sanitizedData[key]);
      }
    }
  }
}

// 数据清理函数，确保所有字符串字段都有有效值
function sanitizeDataForWXS(data) {
  const sanitized = {};
  
  for (const key in data) {
    const value = data[key];
    
    if (typeof value === 'string') {
      // 字符串字段：确保不为 null 或 undefined
      sanitized[key] = value || '';
    } else if (value === null || value === undefined) {
      // null 或 undefined 值：根据字段名称提供合适的默认值
      sanitized[key] = getDefaultValueForField(key);
    } else if (typeof value === 'object' && value !== null) {
      // 对象字段：递归处理
      sanitized[key] = sanitizeDataForWXS(value);
    } else {
      // 其他类型：直接使用
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// 根据字段名称提供默认值
function getDefaultValueForField(fieldName) {
  const stringFields = [
    'gpsStatus', 'locationError', 'lastInterferenceTime',
    'nearestAirport', 'secondNearestAirport', 'heading',
    'speed', 'altitude', 'latitude', 'longitude'
  ];
  
  if (stringFields.includes(fieldName) || fieldName.includes('Status') || fieldName.includes('Error')) {
    return '';
  }
  
  if (fieldName.includes('Time')) {
    return '';
  }
  
  if (fieldName.includes('Count') || fieldName.includes('Number')) {
    return 0;
  }
  
  if (fieldName.includes('show') || fieldName.includes('is') || fieldName.includes('has')) {
    return false;
  }
  
  return null;
}

// 修复 cockpit 页面的 checkNetworkStatus 函数
function fixedCheckNetworkStatus() {
  var self = this;
  
  // 获取网络类型
  wx.getNetworkType({
    success: function(res) {
      var isOffline = res.networkType === 'none';
      
      // 使用安全的 setData
      safeSetData(self, {
        isOffline: isOffline,
        isOfflineMode: isOffline  // 同步离线模式状态
      });
      
      if (isOffline) {
        console.log('当前处于离线状态，使用纯GPS定位');
      }
    },
    fail: function(error) {
      console.error('获取网络状态失败:', error);
      // 设置默认值
      safeSetData(self, {
        isOffline: false,
        isOfflineMode: false
      });
    }
  });
  
  // 监听网络状态变化
  wx.onNetworkStatusChange(function(res) {
    safeSetData(self, {
      isOffline: !res.isConnected,
      isOfflineMode: !res.isConnected
    });
    
    if (!res.isConnected) {
      wx.showToast({
        title: '已进入离线模式',
        icon: 'none',
        duration: 2000
      });
    }
  });
}

// 修复 GPS 状态监控函数
function fixedMonitorGPSStatus() {
  var self = this;
  
  // 每10秒检查一次GPS状态
  setInterval(function() {
    var now = Date.now();
    var timeSinceLastUpdate = self.data.lastUpdateTime ? (now - self.data.lastUpdateTime) / 1000 : 999;
    
    if (timeSinceLastUpdate > 30) {
      // 在离线模式下，不阻塞页面
      if (self.data.isOffline || self.data.isOfflineMode) {
        safeSetData(self, {
          gpsStatus: '离线模式',
          showGPSWarning: true,
          locationError: ''  // 确保为空字符串而不是 null
        });
        
        // 如果还没启动模拟模式，启动它
        if (!self.data.useSimulatedData) {
          self.startSimulatedMode();
        }
      } else {
        safeSetData(self, {
          gpsStatus: 'GPS信号丢失',
          locationError: 'GPS信号长时间未更新，请检查是否在室内或信号遮挡区域'
        });
      }
    } else if (timeSinceLastUpdate > 15) {
      var statusText = 'GPS信号弱';
      if (self.data.isOffline) {
        statusText += ' (离线)';
      }
      safeSetData(self, {
        gpsStatus: statusText
      });
    }
  }, 10000);
}

// 修复 GPS 干扰检测函数中的时间格式化
function fixedFormatInterferenceTime(timestamp) {
  try {
    var interferenceTime = new Date(timestamp);
    var hours = interferenceTime.getHours();
    var minutes = interferenceTime.getMinutes();
    var seconds = interferenceTime.getSeconds();
    
    // 安全的 padStart 实现
    var pad = function(num) {
      var str = String(num);
      return str.length < 2 ? '0' + str : str;
    };
    
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
  } catch (error) {
    console.error('时间格式化失败:', error);
    return ''; // 返回空字符串而不是 null
  }
}

// 通用的错误处理函数
function handleWXSError(error, context) {
  console.error(`WXS错误 [${context}]:`, error);
  
  // 如果是 indexOf 相关错误，记录详细信息
  if (error.message && error.message.includes('indexOf')) {
    console.error('检测到 indexOf 错误，可能的原因：');
    console.error('1. 某个字符串字段为 null 或 undefined');
    console.error('2. setData 中包含了无效的字符串值');
    console.error('3. WXS 模板中对 null 值调用了字符串方法');
  }
  
  // 显示用户友好的错误提示
  wx.showToast({
    title: '页面数据更新异常，正在重试',
    icon: 'none',
    duration: 2000
  });
}

// 导出修复函数
module.exports = {
  safeSetData,
  sanitizeDataForWXS,
  getDefaultValueForField,
  fixedCheckNetworkStatus,
  fixedMonitorGPSStatus,
  fixedFormatInterferenceTime,
  handleWXSError
};

/**
 * 使用说明：
 * 
 * 1. 在 cockpit/index.js 中引入此修复模块：
 *    const wxsFix = require('../../utils/wxs-error-fix.js');
 * 
 * 2. 替换所有 setData 调用：
 *    // 原来：this.setData({ gpsStatus: status });
 *    // 修复后：wxsFix.safeSetData(this, { gpsStatus: status });
 * 
 * 3. 替换 checkNetworkStatus 函数：
 *    checkNetworkStatus: wxsFix.fixedCheckNetworkStatus
 * 
 * 4. 替换 monitorGPSStatus 函数：
 *    monitorGPSStatus: wxsFix.fixedMonitorGPSStatus
 * 
 * 5. 在页面的 onError 中添加错误处理：
 *    onError: function(error) {
 *      wxsFix.handleWXSError(error, 'cockpit-page');
 *    }
 */