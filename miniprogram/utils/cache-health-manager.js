/**
 * 缓存健康检查管理器
 *
 * 功能：统一管理所有缓存系统的健康检查、自动修复和空间监控
 * 设计参考：绕机检查图片缓存 + 音频缓存 + 数据索引缓存
 *
 * 核心功能：
 * 1. 缓存完整性验证：检查缓存文件是否存在、索引是否一致
 * 2. 自动修复：清理损坏的缓存、重建丢失的索引
 * 3. 空间监控：实时监控存储空间使用情况
 * 4. 健康报告：生成详细的健康检查报告
 *
 * @author Claude Code
 * @date 2025-01-04
 */

var AudioCacheManager = require('./audio-cache-manager.js');
var DataIndexCacheManager = require('./data-index-cache-manager.js');

// ==================== 常量配置 ====================

// 健康检查结果存储key
var HEALTH_CHECK_RESULT_KEY = 'flight_cache_health_check';

// 健康检查间隔（7天）
var HEALTH_CHECK_INTERVAL = 7 * 24 * 60 * 60 * 1000;

// 存储空间预警阈值（80%）
var STORAGE_WARNING_THRESHOLD = 0.8;

// ==================== CacheHealthManager 类 ====================

/**
 * 缓存健康检查管理器
 */
function CacheHealthManager() {
  this.lastCheckTime = 0;
  this.lastCheckResult = null;
  this._checking = false;
}

/**
 * 执行完整的健康检查
 *
 * @param {boolean} force - 是否强制检查（忽略时间间隔）
 * @returns {Promise<Object>} 健康检查结果
 */
CacheHealthManager.prototype.performHealthCheck = function(force) {
  var self = this;
  force = force || false;

  return new Promise(function(resolve, reject) {
    try {
      // 1. 检查是否正在执行
      if (self._checking) {
        console.log('⚠️ 健康检查已在进行中');
        resolve(self.lastCheckResult);
        return;
      }

      // 2. 检查是否需要执行（时间间隔）
      var lastResult = wx.getStorageSync(HEALTH_CHECK_RESULT_KEY);
      if (lastResult && !force) {
        var timeSinceLastCheck = Date.now() - (lastResult.timestamp || 0);
        if (timeSinceLastCheck < HEALTH_CHECK_INTERVAL) {
          console.log('✅ 距离上次检查不足7天，使用缓存结果');
          self.lastCheckResult = lastResult;
          resolve(lastResult);
          return;
        }
      }

      // 3. 开始执行健康检查
      console.log('🔍 开始执行缓存健康检查...');
      self._checking = true;

      var healthResult = {
        timestamp: Date.now(),
        checks: {},
        issues: [],
        summary: {}
      };

      // 4. 检查存储空间
      self.checkStorageSpace(healthResult);

      // 5. 检查音频缓存
      self.checkAudioCache(healthResult);

      // 6. 检查数据索引缓存
      self.checkDataIndexCache(healthResult);

      // 7. 检查图片缓存（绕机检查）
      self.checkImageCache(healthResult);

      // 8. 生成摘要
      self.generateSummary(healthResult);

      // 9. 持久化结果
      wx.setStorageSync(HEALTH_CHECK_RESULT_KEY, healthResult);

      self.lastCheckResult = healthResult;
      self._checking = false;

      console.log('✅ 缓存健康检查完成');
      console.log('📊 健康摘要:', healthResult.summary);

      resolve(healthResult);

    } catch (error) {
      self._checking = false;
      console.error('❌ 健康检查失败:', error);
      reject(error);
    }
  });
};

/**
 * 检查存储空间
 *
 * @param {Object} healthResult - 健康检查结果对象
 */
CacheHealthManager.prototype.checkStorageSpace = function(healthResult) {
  try {
    var storageInfo = wx.getStorageInfoSync();

    var currentSize = storageInfo.currentSize; // KB
    var limitSize = storageInfo.limitSize;     // KB
    var usagePercent = (currentSize / limitSize * 100).toFixed(1);

    healthResult.checks.storage = {
      status: 'healthy',
      currentSizeMB: (currentSize / 1024).toFixed(2),
      limitSizeMB: (limitSize / 1024).toFixed(2),
      usagePercent: usagePercent,
      keys: storageInfo.keys.length
    };

    // 检查是否超过预警阈值
    if (currentSize / limitSize > STORAGE_WARNING_THRESHOLD) {
      healthResult.checks.storage.status = 'warning';
      healthResult.issues.push({
        type: 'storage',
        severity: 'warning',
        message: '存储空间使用率超过' + (STORAGE_WARNING_THRESHOLD * 100) + '%',
        recommendation: '建议清理旧缓存或增加存储限额'
      });
    }

    console.log('✅ 存储空间检查完成:', usagePercent + '%');

  } catch (error) {
    healthResult.checks.storage = {
      status: 'error',
      error: error.message
    };
    console.error('❌ 存储空间检查失败:', error);
  }
};

/**
 * 检查音频缓存
 *
 * @param {Object} healthResult - 健康检查结果对象
 */
CacheHealthManager.prototype.checkAudioCache = function(healthResult) {
  try {
    var stats = AudioCacheManager.getCacheStats();

    healthResult.checks.audioCache = {
      status: 'healthy',
      cachedCount: stats.totalCount,
      totalSizeMB: stats.totalSizeMB,
      maxSizeMB: stats.maxSizeMB,
      usagePercent: ((stats.totalSize / (300 * 1024 * 1024)) * 100).toFixed(1)
    };

    // 验证缓存索引完整性
    var cacheIndex = wx.getStorageSync('flight_audio_cache_index') || {};
    var validCount = 0;
    var invalidCount = 0;

    Object.keys(cacheIndex).forEach(function(key) {
      var cacheInfo = cacheIndex[key];
      if (cacheInfo && cacheInfo.path) {
        try {
          wx.getFileSystemManager().accessSync(cacheInfo.path);
          validCount++;
        } catch (error) {
          invalidCount++;
        }
      }
    });

    if (invalidCount > 0) {
      healthResult.checks.audioCache.status = 'warning';
      healthResult.checks.audioCache.invalidCount = invalidCount;
      healthResult.issues.push({
        type: 'audioCache',
        severity: 'warning',
        message: '发现' + invalidCount + '个无效音频缓存',
        recommendation: '建议执行缓存修复'
      });
    }

    console.log('✅ 音频缓存检查完成:', validCount, '个有效，', invalidCount, '个无效');

  } catch (error) {
    healthResult.checks.audioCache = {
      status: 'error',
      error: error.message
    };
    console.error('❌ 音频缓存检查失败:', error);
  }
};

/**
 * 检查数据索引缓存
 *
 * @param {Object} healthResult - 健康检查结果对象
 */
CacheHealthManager.prototype.checkDataIndexCache = function(healthResult) {
  try {
    var stats = DataIndexCacheManager.getIndexStats();

    healthResult.checks.dataIndexCache = {
      status: 'healthy',
      datasets: stats.datasets.length,
      totalIndexes: stats.totalIndexes,
      totalSizekb: stats.totalSizekb
    };

    // 检查索引是否过期
    var now = Date.now();
    var expiredCount = 0;

    stats.datasets.forEach(function(dataset) {
      var age = now - (dataset.timestamp || 0);
      var maxAge = 30 * 24 * 60 * 60 * 1000; // 30天

      if (age > maxAge) {
        expiredCount++;
      }
    });

    if (expiredCount > 0) {
      healthResult.checks.dataIndexCache.status = 'warning';
      healthResult.checks.dataIndexCache.expiredCount = expiredCount;
      healthResult.issues.push({
        type: 'dataIndexCache',
        severity: 'info',
        message: '发现' + expiredCount + '个过期索引',
        recommendation: '索引会在下次使用时自动重建'
      });
    }

    console.log('✅ 数据索引缓存检查完成:', stats.datasets.length, '个数据集');

  } catch (error) {
    healthResult.checks.dataIndexCache = {
      status: 'error',
      error: error.message
    };
    console.error('❌ 数据索引缓存检查失败:', error);
  }
};

/**
 * 检查图片缓存（绕机检查）
 *
 * @param {Object} healthResult - 健康检查结果对象
 */
CacheHealthManager.prototype.checkImageCache = function(healthResult) {
  try {
    var cacheIndex = wx.getStorageSync('walkaround_image_cache_index') || {};

    var validCount = 0;
    var invalidCount = 0;
    var totalSize = 0;

    Object.keys(cacheIndex).forEach(function(key) {
      var cacheInfo = cacheIndex[key];
      if (cacheInfo && cacheInfo.path) {
        try {
          wx.getFileSystemManager().accessSync(cacheInfo.path);
          validCount++;
          totalSize += (cacheInfo.size || 0);
        } catch (error) {
          invalidCount++;
        }
      }
    });

    healthResult.checks.imageCache = {
      status: 'healthy',
      cachedCount: validCount,
      invalidCount: invalidCount,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };

    if (invalidCount > 0) {
      healthResult.checks.imageCache.status = 'warning';
      healthResult.issues.push({
        type: 'imageCache',
        severity: 'warning',
        message: '发现' + invalidCount + '个无效图片缓存',
        recommendation: '建议重新访问绕机检查区域以重建缓存'
      });
    }

    console.log('✅ 图片缓存检查完成:', validCount, '个有效，', invalidCount, '个无效');

  } catch (error) {
    healthResult.checks.imageCache = {
      status: 'error',
      error: error.message
    };
    console.error('❌ 图片缓存检查失败:', error);
  }
};

/**
 * 生成健康摘要
 *
 * @param {Object} healthResult - 健康检查结果对象
 */
CacheHealthManager.prototype.generateSummary = function(healthResult) {
  var summary = {
    overallStatus: 'healthy',
    totalIssues: healthResult.issues.length,
    criticalIssues: 0,
    warningIssues: 0,
    infoIssues: 0,
    recommendations: []
  };

  // 统计问题严重程度
  healthResult.issues.forEach(function(issue) {
    if (issue.severity === 'critical') {
      summary.criticalIssues++;
      summary.overallStatus = 'critical';
    } else if (issue.severity === 'warning') {
      summary.warningIssues++;
      if (summary.overallStatus === 'healthy') {
        summary.overallStatus = 'warning';
      }
    } else if (issue.severity === 'info') {
      summary.infoIssues++;
    }

    if (issue.recommendation) {
      summary.recommendations.push(issue.recommendation);
    }
  });

  healthResult.summary = summary;
};

/**
 * 自动修复缓存问题
 *
 * @returns {Promise<Object>} 修复结果
 */
CacheHealthManager.prototype.autoRepair = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    console.log('🔧 开始自动修复缓存问题...');

    var repairResult = {
      timestamp: Date.now(),
      repairs: []
    };

    try {
      // 1. 修复音频缓存索引
      var audioRepair = self.repairAudioCacheIndex();
      repairResult.repairs.push(audioRepair);

      // 2. 修复图片缓存索引
      var imageRepair = self.repairImageCacheIndex();
      repairResult.repairs.push(imageRepair);

      console.log('✅ 自动修复完成');
      resolve(repairResult);

    } catch (error) {
      console.error('❌ 自动修复失败:', error);
      reject(error);
    }
  });
};

/**
 * 修复音频缓存索引
 *
 * @returns {Object} 修复结果
 */
CacheHealthManager.prototype.repairAudioCacheIndex = function() {
  try {
    var cacheIndex = wx.getStorageSync('flight_audio_cache_index') || {};
    var cleanedCount = 0;
    var totalSize = 0;

    var cleanedIndex = {};

    Object.keys(cacheIndex).forEach(function(key) {
      var cacheInfo = cacheIndex[key];
      if (cacheInfo && cacheInfo.path) {
        try {
          // 验证文件是否存在
          wx.getFileSystemManager().accessSync(cacheInfo.path);
          cleanedIndex[key] = cacheInfo;
          totalSize += (cacheInfo.size || 0);
        } catch (error) {
          // 文件不存在，从索引中移除
          cleanedCount++;
          console.log('🗑️ 移除无效音频缓存:', key);
        }
      }
    });

    // 更新索引
    wx.setStorageSync('flight_audio_cache_index', cleanedIndex);

    return {
      type: 'audioCache',
      status: 'success',
      cleanedCount: cleanedCount,
      validCount: Object.keys(cleanedIndex).length,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };

  } catch (error) {
    return {
      type: 'audioCache',
      status: 'error',
      error: error.message
    };
  }
};

/**
 * 修复图片缓存索引
 *
 * @returns {Object} 修复结果
 */
CacheHealthManager.prototype.repairImageCacheIndex = function() {
  try {
    var cacheIndex = wx.getStorageSync('walkaround_image_cache_index') || {};
    var cleanedCount = 0;
    var totalSize = 0;

    var cleanedIndex = {};

    Object.keys(cacheIndex).forEach(function(key) {
      var cacheInfo = cacheIndex[key];
      if (cacheInfo && cacheInfo.path) {
        try {
          // 验证文件是否存在
          wx.getFileSystemManager().accessSync(cacheInfo.path);
          cleanedIndex[key] = cacheInfo;
          totalSize += (cacheInfo.size || 0);
        } catch (error) {
          // 文件不存在，从索引中移除
          cleanedCount++;
          console.log('🗑️ 移除无效图片缓存:', key);
        }
      }
    });

    // 更新索引
    wx.setStorageSync('walkaround_image_cache_index', cleanedIndex);

    return {
      type: 'imageCache',
      status: 'success',
      cleanedCount: cleanedCount,
      validCount: Object.keys(cleanedIndex).length,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };

  } catch (error) {
    return {
      type: 'imageCache',
      status: 'error',
      error: error.message
    };
  }
};

/**
 * 获取缓存健康报告（格式化字符串）
 *
 * @returns {Promise<string>} 健康报告文本
 */
CacheHealthManager.prototype.getHealthReport = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    self.performHealthCheck(false)
      .then(function(result) {
        var report = '📊 缓存健康报告\n\n';

        // 总体状态
        var statusEmoji = {
          'healthy': '✅',
          'warning': '⚠️',
          'critical': '❌'
        };

        report += statusEmoji[result.summary.overallStatus] + ' 总体状态：';
        report += result.summary.overallStatus === 'healthy' ? '健康' :
                  result.summary.overallStatus === 'warning' ? '需注意' : '严重';
        report += '\n\n';

        // 存储空间
        if (result.checks.storage) {
          report += '💾 存储空间\n';
          report += '  使用：' + result.checks.storage.currentSizeMB + ' MB / ' +
                    result.checks.storage.limitSizeMB + ' MB (' +
                    result.checks.storage.usagePercent + '%)\n';
          report += '  存储项：' + result.checks.storage.keys + ' 个\n\n';
        }

        // 音频缓存
        if (result.checks.audioCache) {
          report += '🎵 音频缓存\n';
          report += '  已缓存：' + result.checks.audioCache.cachedCount + ' 个\n';
          report += '  占用：' + result.checks.audioCache.totalSizeMB + ' MB / ' +
                    result.checks.audioCache.maxSizeMB + ' MB\n';
          if (result.checks.audioCache.invalidCount) {
            report += '  ⚠️ 无效缓存：' + result.checks.audioCache.invalidCount + ' 个\n';
          }
          report += '\n';
        }

        // 数据索引
        if (result.checks.dataIndexCache) {
          report += '📇 数据索引\n';
          report += '  数据集：' + result.checks.dataIndexCache.datasets + ' 个\n';
          report += '  索引条目：' + result.checks.dataIndexCache.totalIndexes + ' 条\n';
          report += '  占用：' + result.checks.dataIndexCache.totalSizekb + ' KB\n\n';
        }

        // 图片缓存
        if (result.checks.imageCache) {
          report += '🖼️ 图片缓存\n';
          report += '  已缓存：' + result.checks.imageCache.cachedCount + ' 张\n';
          report += '  占用：' + result.checks.imageCache.totalSizeMB + ' MB\n';
          if (result.checks.imageCache.invalidCount > 0) {
            report += '  ⚠️ 无效缓存：' + result.checks.imageCache.invalidCount + ' 张\n';
          }
          report += '\n';
        }

        // 问题建议
        if (result.issues.length > 0) {
          report += '💡 建议\n';
          result.summary.recommendations.forEach(function(rec, index) {
            report += '  ' + (index + 1) + '. ' + rec + '\n';
          });
        }

        resolve(report);
      })
      .catch(function(error) {
        reject(error);
      });
  });
};

// ==================== 导出单例 ====================

var cacheHealthManagerInstance = new CacheHealthManager();

module.exports = {
  // 单例实例
  instance: cacheHealthManagerInstance,

  // 快捷方法
  performHealthCheck: function(force) {
    return cacheHealthManagerInstance.performHealthCheck(force);
  },

  autoRepair: function() {
    return cacheHealthManagerInstance.autoRepair();
  },

  getHealthReport: function() {
    return cacheHealthManagerInstance.getHealthReport();
  }
};
