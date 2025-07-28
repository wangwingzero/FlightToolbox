/**
 * 直接应用到 cockpit/index.js 的修复补丁
 * 解决 WXS String.prototype.indexOf called on null or undefined 错误
 * 
 * 使用方法：
 * 1. 备份原始 cockpit/index.js
 * 2. 将此文件中的修复代码复制到对应位置
 * 3. 测试验证修复效果
 */

// ==================== 第一步：在文件顶部添加安全函数 ====================

/**
 * 安全的 setData 函数，防止 null/undefined 字符串导致 WXS 错误
 */
function safeSetData(page, data) {
  const sanitized = {};
  
  for (const key in data) {
    const value = data[key];
    
    if (value === null || value === undefined) {
      // 根据字段名称提供合适的默认值
      if (key.includes('Status') || key.includes('Error') || key.includes('Time')) {
        sanitized[key] = ''; // 状态、错误、时间字段默认为空字符串
      } else if (key.includes('show') || key.includes('is') || key.includes('has')) {
        sanitized[key] = false; // 布尔字段默认为 false
      } else if (typeof value === 'string') {
        sanitized[key] = ''; // 字符串字段默认为空字符串
      } else {
        sanitized[key] = value; // 其他类型保持原值
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  try {
    page.setData(sanitized);
  } catch (error) {
    console.error('setData 操作失败:', error);
    // 尝试逐个字段设置，定位问题字段
    for (const key in sanitized) {
      try {
        const singleData = {};
        singleData[key] = sanitized[key];
        page.setData(singleData);
      } catch (fieldError) {
        console.error(`字段 ${key} 设置失败:`, fieldError, '值:', sanitized[key]);
      }
    }
  }
}

// ==================== 第二步：替换 checkNetworkStatus 函数 ====================

// 原函数位置：约第804行
// 将原来的 checkNetworkStatus 函数替换为以下内容：

checkNetworkStatus: function() {
  var self = this;
  
  // 获取网络类型
  wx.getNetworkType({
    success: function(res) {
      var isOffline = res.networkType === 'none';
      
      // 使用安全的 setData，确保字段不为 null
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
      // 设置默认值，避免 undefined
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
},

// ==================== 第三步：替换 monitorGPSStatus 函数 ====================

// 原函数位置：约第834行
// 将原来的 monitorGPSStatus 函数替换为以下内容：

monitorGPSStatus: function() {
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
},

// ==================== 第四步：修复 GPS 干扰检测中的时间格式化 ====================

// 在 checkGPSInterference 函数中，找到时间格式化部分（约第970行）
// 将以下代码：

/*
var interferenceTime = new Date(now);
var hours = interferenceTime.getHours();
var minutes = interferenceTime.getMinutes();
var seconds = interferenceTime.getSeconds();

// 兼容padStart的实现
var pad = function(num) {
  return num < 10 ? '0' + num : num.toString();
};

var timeString = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);

this.setData({
  lastInterferenceTime: timeString
});
*/

// 替换为：

var timeString = '';
try {
  var interferenceTime = new Date(now);
  var hours = interferenceTime.getHours();
  var minutes = interferenceTime.getMinutes();
  var seconds = interferenceTime.getSeconds();
  
  // 安全的 pad 函数
  var pad = function(num) {
    return (num < 10 ? '0' : '') + String(num);
  };
  
  timeString = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
} catch (error) {
  console.error('时间格式化失败:', error);
  timeString = ''; // 确保不为 null
}

safeSetData(this, {
  gpsInterference: true,
  lastInterferenceTime: timeString
});

// ==================== 第五步：修复其他 setData 调用 ====================

// 在整个文件中，将所有的 this.setData() 调用替换为 safeSetData(this, ...)
// 主要位置包括：

// 1. updateNearbyAirports 函数中的机场信息设置
// 2. GPS位置更新相关的 setData
// 3. 状态更新相关的 setData

// 示例替换：
// 原来：this.setData({ gpsStatus: '正常' });
// 修改为：safeSetData(this, { gpsStatus: '正常' });

// ==================== 第六步：添加页面错误处理 ====================

// 在 Page({}) 对象中添加错误处理函数：

onError: function(error) {
  console.error('Cockpit页面错误:', error);
  
  // 如果是 WXS 相关错误，尝试重置关键状态
  if (error.message && error.message.includes('indexOf')) {
    console.warn('检测到 WXS indexOf 错误，尝试重置状态');
    
    safeSetData(this, {
      gpsStatus: '重新初始化',
      locationError: '',
      lastInterferenceTime: ''
    });
  }
  
  // 显示用户友好的提示
  wx.showToast({
    title: '页面异常，正在恢复',
    icon: 'none',
    duration: 2000
  });
},

// ==================== 验证修复效果 ====================

/**
 * 修复完成后的验证步骤：
 * 
 * 1. 重新编译小程序
 * 2. 清除缓存和数据
 * 3. 测试以下场景：
 *    - 网络状态切换（WiFi <-> 移动网络 <-> 离线）
 *    - GPS信号变化（室内外切换）
 *    - 长时间使用页面
 *    - 快速切换其他页面后返回
 * 
 * 4. 检查控制台是否还有 WXS 错误
 * 5. 确认页面功能正常
 * 
 * 预期结果：
 * ✅ 无 WXS indexOf 错误
 * ✅ 页面状态更新正常
 * ✅ 网络状态显示准确
 * ✅ GPS状态显示正常
 */

// ==================== 注意事项 ====================

/**
 * 1. 备份原文件：修改前务必备份原始的 cockpit/index.js
 * 2. 逐步应用：建议先应用 safeSetData 函数，然后逐个替换其他函数
 * 3. 测试验证：每次修改后都要测试相关功能
 * 4. 监控日志：关注控制台输出，确保无新的错误产生
 * 5. 性能影响：safeSetData 会增加少量性能开销，但可以忽略不计
 */