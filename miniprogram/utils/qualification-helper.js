/**
 * 资质管理辅助工具 - ES5版本
 * 处理资质数据的加载、状态更新和提醒逻辑
 */

function QualificationHelper() {
  this.storageKey = 'pilot_qualifications_v2';
  this.reminderKey = 'lastReminderDate';
}

/**
 * 加载用户的资质数据
 * @returns {Array} 资质数组
 */
QualificationHelper.prototype.loadQualifications = function() {
  try {
    var qualifications = wx.getStorageSync(this.storageKey) || [];
    console.log('📜 加载资质数据:', qualifications.length, '个资质');
    return qualifications;
  } catch (error) {
    console.error('❌ 加载资质数据失败:', error);
    return [];
  }
};

/**
 * 获取所有资质数据（别名方法，用于兼容现有代码）
 * @returns {Array} 资质数组
 */
QualificationHelper.prototype.getAllQualifications = function() {
  return this.loadQualifications();
};

/**
 * 保存资质数据
 * @param {Array} qualifications 资质数组
 */
QualificationHelper.prototype.saveQualifications = function(qualifications) {
  try {
    wx.setStorageSync(this.storageKey, qualifications);
    console.log('✅ 资质数据已保存');
  } catch (error) {
    console.error('❌ 保存资质数据失败:', error);
  }
};

/**
 * 更新资质状态
 * @param {Array} qualifications 资质数组
 * @returns {Array} 更新后的资质数组
 */
QualificationHelper.prototype.updateQualificationStatus = function(qualifications) {
  var self = this;
  var today = new Date();
  
  return qualifications.map(function(qual) {
    var status = 'valid';
    var daysRemaining = 0;
    var currentCount = 0;
    var calculatedExpiryDate = '';
    
    if (qual.mode === 'daily') {
      // X天Y次模式
      var result = self._calculateDailyModeStatus(qual, today);
      status = result.status;
      daysRemaining = result.daysRemaining;
      currentCount = result.currentCount;
      calculatedExpiryDate = result.calculatedExpiryDate;
      
    } else if (qual.mode === 'monthly') {
      // X月Y次模式
      var result = self._calculateMonthlyModeStatus(qual, today);
      status = result.status;
      daysRemaining = result.daysRemaining;
      currentCount = result.currentCount;
      calculatedExpiryDate = result.calculatedExpiryDate;
      
    } else if (qual.mode === 'expiry') {
      // 到期日期模式
      var result = self._calculateExpiryModeStatus(qual, today);
      status = result.status;
      daysRemaining = result.daysRemaining;
      calculatedExpiryDate = result.calculatedExpiryDate;
    }
    
    return Object.assign({}, qual, {
      status: status,
      daysRemaining: daysRemaining,
      currentCount: currentCount,
      calculatedExpiryDate: calculatedExpiryDate
    });
  });
};

/**
 * 计算日周期模式的状态
 * @private
 */
QualificationHelper.prototype._calculateDailyModeStatus = function(qual, today) {
  var records = qual.records || [];
  var period = qual.dailyPeriod || 90;
  var required = qual.dailyRequired || 3;
  
  // 按日期排序，最新的在前面
  var sortedRecords = records.sort(function(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // 累计最新的Y次活动
  var accumulatedCount = 0;
  var recentRecordsForRequired = [];
  
  for (var i = 0; i < sortedRecords.length; i++) {
    var record = sortedRecords[i];
    var recordCount = Number(record.count) || 0;
    if (accumulatedCount + recordCount <= required) {
      recentRecordsForRequired.push(record);
      accumulatedCount += recordCount;
    } else if (accumulatedCount < required) {
      recentRecordsForRequired.push(record);
      accumulatedCount = required;
      break;
    } else {
      break;
    }
  }
  
  var currentCount = accumulatedCount;
  
  if (currentCount < required) {
    return {
      status: 'expired',
      daysRemaining: -1,
      currentCount: currentCount,
      calculatedExpiryDate: '不达标'
    };
  }
  
  if (recentRecordsForRequired.length > 0) {
    var oldestRecord = recentRecordsForRequired.sort(function(a, b) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })[0];
    
    if (oldestRecord) {
      var oldestDate = new Date(oldestRecord.date);
      var expiryDate = new Date(oldestDate.getTime() + period * 24 * 60 * 60 * 1000);
      var daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      var status = 'valid';
      if (daysRemaining <= 0) {
        status = 'expired';
      } else if (daysRemaining <= (qual.warningDays || 30)) {
        status = 'warning';
      }
      
      return {
        status: status,
        daysRemaining: daysRemaining,
        currentCount: currentCount,
        calculatedExpiryDate: this.formatDate(expiryDate)
      };
    }
  }
  
  return {
    status: 'valid',
    daysRemaining: 0,
    currentCount: currentCount,
    calculatedExpiryDate: ''
  };
};

/**
 * 计算月周期模式的状态
 * @private
 */
QualificationHelper.prototype._calculateMonthlyModeStatus = function(qual, today) {
  var records = qual.records || [];
  var period = (qual.monthlyPeriod || 12) * 30;
  var required = qual.monthlyRequired || 2;
  
  // 使用与日周期相同的逻辑
  var sortedRecords = records.sort(function(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  var accumulatedCount = 0;
  var recentRecordsForRequired = [];
  
  for (var i = 0; i < sortedRecords.length; i++) {
    var record = sortedRecords[i];
    var recordCount = Number(record.count) || 0;
    if (accumulatedCount + recordCount <= required) {
      recentRecordsForRequired.push(record);
      accumulatedCount += recordCount;
    } else if (accumulatedCount < required) {
      recentRecordsForRequired.push(record);
      accumulatedCount = required;
      break;
    } else {
      break;
    }
  }
  
  var currentCount = accumulatedCount;
  
  if (currentCount < required) {
    return {
      status: 'expired',
      daysRemaining: -1,
      currentCount: currentCount,
      calculatedExpiryDate: '不达标'
    };
  }
  
  if (recentRecordsForRequired.length > 0) {
    var oldestRecord = recentRecordsForRequired.sort(function(a, b) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })[0];
    
    if (oldestRecord) {
      var oldestDate = new Date(oldestRecord.date);
      var expiryDate = new Date(oldestDate.getTime() + period * 24 * 60 * 60 * 1000);
      var daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      var status = 'valid';
      if (daysRemaining <= 0) {
        status = 'expired';
      } else if (daysRemaining <= (qual.warningDays || 30)) {
        status = 'warning';
      }
      
      return {
        status: status,
        daysRemaining: daysRemaining,
        currentCount: currentCount,
        calculatedExpiryDate: this.formatDate(expiryDate)
      };
    }
  }
  
  return {
    status: 'valid',
    daysRemaining: 0,
    currentCount: currentCount,
    calculatedExpiryDate: ''
  };
};

/**
 * 计算到期日期模式的状态
 * @private
 */
QualificationHelper.prototype._calculateExpiryModeStatus = function(qual, today) {
  if (qual.expiryDate) {
    var expiryDate = new Date(qual.expiryDate);
    var daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    var status = 'valid';
    if (daysRemaining <= 0) {
      status = 'expired';
    } else if (daysRemaining <= (qual.warningDays || 30)) {
      status = 'warning';
    }
    
    return {
      status: status,
      daysRemaining: daysRemaining,
      currentCount: 0,
      calculatedExpiryDate: qual.expiryDate
    };
  }
  
  return {
    status: 'valid',
    daysRemaining: 0,
    currentCount: 0,
    calculatedExpiryDate: ''
  };
};

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串
 */
QualificationHelper.prototype.formatDate = function(date) {
  var year = date.getFullYear();
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var day = ('0' + date.getDate()).slice(-2);
  return year + '-' + month + '-' + day;
};

/**
 * 检查并显示即将到期的资质提醒
 * @param {Array} qualifications 资质数组
 * @param {Function} onShowReminder 显示提醒的回调函数
 */
QualificationHelper.prototype.checkExpiringQualifications = function(qualifications, onShowReminder) {
  var expiringQuals = qualifications.filter(function(q) {
    return (q.status === 'warning' || q.status === 'expired') && 
           q.reminderEnabled !== false; // 只显示启用提醒的资质
  });
  
  if (expiringQuals.length > 0) {
    // 检查是否今天已经提醒过
    var lastReminderDate = wx.getStorageSync(this.reminderKey) || '';
    var today = new Date().toDateString();
    
    if (lastReminderDate !== today) {
      var message = expiringQuals.map(function(q) {
        if (q.daysRemaining > 0) {
          return q.name + ': 还剩' + q.daysRemaining + '天';
        } else if (q.daysRemaining === 0) {
          return q.name + ': 今天到期';
        } else {
          return q.name + ': 已过期';
        }
      }).join('\n');
      
      if (onShowReminder) {
        onShowReminder(expiringQuals.length, message);
      }
      
      // 记录今天已经提醒过
      wx.setStorageSync(this.reminderKey, today);
    }
  }
};

/**
 * 获取启用提醒的资质
 * @param {Array} qualifications 资质数组
 * @returns {Array} 启用提醒的资质数组
 */
QualificationHelper.prototype.getEnabledQualifications = function(qualifications) {
  return qualifications.filter(function(q) {
    return q.reminderEnabled !== false;
  });
};

/**
 * 计算即将到期的资质数量
 * @param {Array} qualifications 资质数组
 * @returns {number} 即将到期的资质数量
 */
QualificationHelper.prototype.getExpiringSoonCount = function(qualifications) {
  var enabledQualifications = this.getEnabledQualifications(qualifications || []);
  return enabledQualifications.filter(function(q) {
    return q.status === 'warning' || q.status === 'expired';
  }).length;
};

/**
 * 处理资质数据的完整流程
 * @param {Function} onDataUpdate 数据更新回调
 * @param {Function} onShowReminder 显示提醒回调
 * @returns {Object} 处理结果
 */
QualificationHelper.prototype.processQualifications = function(onDataUpdate, onShowReminder) {
  try {
    var qualifications = this.loadQualifications();
    
    if (qualifications.length > 0) {
      // 更新资质状态
      var updatedQualifications = this.updateQualificationStatus(qualifications);
      
      // 只显示启用了提醒的资质
      var enabledQualifications = this.getEnabledQualifications(updatedQualifications);
      
      // 计算即将到期的资质数量
      var expiringSoonCount = this.getExpiringSoonCount(updatedQualifications);
      
      // 回调更新数据
      if (onDataUpdate) {
        onDataUpdate({
          qualifications: enabledQualifications,
          expiringSoonCount: expiringSoonCount
        });
      }
      
      // 检查并显示提醒
      this.checkExpiringQualifications(updatedQualifications, onShowReminder);
      
      return {
        success: true,
        qualifications: enabledQualifications,
        expiringSoonCount: expiringSoonCount
      };
    } else {
      // 没有资质数据
      if (onDataUpdate) {
        onDataUpdate({
          qualifications: [],
          expiringSoonCount: 0
        });
      }
      
      return {
        success: true,
        qualifications: [],
        expiringSoonCount: 0
      };
    }
  } catch (error) {
    console.error('❌ 处理资质数据失败:', error);
    
    if (onDataUpdate) {
      onDataUpdate({
        qualifications: [],
        expiringSoonCount: 0
      });
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

// 创建单例实例
var qualificationHelper = new QualificationHelper();

module.exports = qualificationHelper;