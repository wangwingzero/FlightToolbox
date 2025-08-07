/**
 * 传感器启动冲突修复方案
 * 解决：startCompass:fail, has enable, should stop pre operation
 */

// 1. 增强的传感器启动方法（添加到compass-manager.js）
startCompassSensor: function(callback) {
  var self = this;
  
  // 🔧 关键修复：添加启动状态检查
  if (self.sensorStates.compass.running) {
    console.log('🔄 指南针已运行，先停止再启动');
    self.stopCompassSensor(function() {
      self.startCompassSensor(callback);
    });
    return;
  }
  
  // 🔧 修复：确保完全清理旧监听器
  try {
    wx.offCompassChange();
    wx.stopCompass({
      success: function() {
        console.log('🛑 预防性停止指南针成功');
        self.doStartCompass(callback);
      },
      fail: function(err) {
        // 如果停止失败（可能未启动），直接启动
        console.log('🔄 预防性停止失败，直接启动:', err.errMsg);
        self.doStartCompass(callback);
      }
    });
  } catch (error) {
    console.warn('⚠️ 清理指南针时发生错误:', error);
    self.doStartCompass(callback);
  }
},

// 2. 实际启动指南针的方法
doStartCompass: function(callback) {
  var self = this;
  
  // 🔧 添加延迟确保传感器完全停止
  setTimeout(function() {
    wx.startCompass({
      success: function() {
        console.log('✅ 指南针启动成功');
        self.sensorStates.compass.running = true;
        self.sensorStates.compass.supported = true;
        
        // 🔧 延迟注册监听器，确保传感器完全启动
        setTimeout(function() {
          wx.onCompassChange(self.compassChangeListener);
          console.log('📡 指南针监听器注册成功');
          callback && callback();
        }, 100);
      },
      fail: function(err) {
        console.error('❌ 指南针启动失败:', err.errMsg);
        
        // 🔧 详细错误处理
        if (err.errMsg.includes('has enable')) {
          // 传感器已启动，需要强制重启
          console.log('🔄 检测到重复启动，执行强制重启');
          self.forceRestartCompass(callback);
        } else {
          // 其他错误，标记为不支持
          self.sensorStates.compass.supported = false;
          callback && callback();
        }
      }
    });
  }, 200); // 200ms延迟确保完全停止
},

// 3. 强制重启指南针方法
forceRestartCompass: function(callback) {
  var self = this;
  var retryCount = 0;
  var maxRetries = 3;
  
  var tryRestart = function() {
    retryCount++;
    console.log('🔄 强制重启指南针，尝试' + retryCount + '/' + maxRetries);
    
    // 强制停止
    wx.stopCompass({
      complete: function() {
        // 等待更长时间
        setTimeout(function() {
          wx.startCompass({
            success: function() {
              console.log('✅ 强制重启成功');
              self.sensorStates.compass.running = true;
              wx.onCompassChange(self.compassChangeListener);
              callback && callback();
            },
            fail: function(err) {
              if (retryCount < maxRetries) {
                console.log('🔄 重启失败，继续重试:', err.errMsg);
                setTimeout(tryRestart, 500);
              } else {
                console.error('❌ 强制重启失败，放弃指南针功能');
                self.sensorStates.compass.supported = false;
                callback && callback();
              }
            }
          });
        }, 500); // 更长的延迟
      }
    });
  };
  
  tryRestart();
},

// 4. 安全停止指南针方法
stopCompassSensor: function(callback) {
  var self = this;
  
  if (!self.sensorStates.compass.running) {
    callback && callback();
    return;
  }
  
  console.log('🛑 停止指南针传感器');
  
  try {
    // 先清除监听器
    wx.offCompassChange();
    
    // 再停止传感器
    wx.stopCompass({
      success: function() {
        console.log('✅ 指南针停止成功');
        self.sensorStates.compass.running = false;
        callback && callback();
      },
      fail: function(err) {
        console.warn('⚠️ 指南针停止失败:', err.errMsg);
        // 即使停止失败，也标记为未运行
        self.sensorStates.compass.running = false;
        callback && callback();
      }
    });
  } catch (error) {
    console.error('❌ 停止指南针时发生错误:', error);
    self.sensorStates.compass.running = false;
    callback && callback();
  }
}