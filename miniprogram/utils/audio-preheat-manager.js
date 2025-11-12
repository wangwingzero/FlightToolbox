/**
 * 音频预热管理器
 *
 * 功能：WiFi环境下自动预加载用户常用航线音频，提升离线体验
 * 设计参考：audio-cache-manager.js（2025-01-04）
 *
 * 核心优势：
 * 1. 智能预测：基于用户历史播放记录
 * 2. 后台任务：不阻塞用户操作
 * 3. 优先级管理：收藏航线 > 热门航线 > 普通航线
 *
 * @author Claude Code
 * @date 2025-01-04
 */

var AudioCacheManager = require('./audio-cache-manager.js');

// ==================== 常量配置 ====================

// 用户播放历史存储key
var PLAY_HISTORY_KEY = 'flight_audio_play_history';

// 用户收藏航线存储key
var FAVORITE_ROUTES_KEY = 'flight_audio_favorites';

// 预热任务存储key
var PREHEAT_TASK_KEY = 'flight_audio_preheat_task';

// 最大播放历史记录数
var MAX_HISTORY_COUNT = 100;

// 预热任务间隔（毫秒）
var PREHEAT_INTERVAL = 500;

// 单次预热最大数量
var MAX_PREHEAT_COUNT = 20;

// ==================== AudioPreheatManager 类 ====================

/**
 * 音频预热管理器
 */
function AudioPreheatManager() {
  this.playHistory = [];          // 播放历史记录
  this.favoriteRoutes = [];       // 收藏的航线
  this.preheatTask = null;        // 当前预热任务
  this.isPrehating = false;       // 是否正在预热
  this._initialized = false;      // 初始化标记
}

/**
 * 初始化音频预热管理器
 */
AudioPreheatManager.prototype.init = function() {
  if (this._initialized) {
    return;
  }

  try {
    // 1. 加载播放历史
    this.playHistory = wx.getStorageSync(PLAY_HISTORY_KEY) || [];
    console.log('✅ 加载播放��史:', this.playHistory.length, '条');

    // 2. 加载收藏航线
    this.favoriteRoutes = wx.getStorageSync(FAVORITE_ROUTES_KEY) || [];
    console.log('✅ 加载收藏航线:', this.favoriteRoutes.length, '条');

    // 3. 加载预热任务状态
    this.preheatTask = wx.getStorageSync(PREHEAT_TASK_KEY) || null;

    // 4. 标记已初始化
    this._initialized = true;

    console.log('✅ 音频预热管理器初始化成功');

  } catch (error) {
    console.error('❌ 音频预热管理器初始化失败:', error);
    this._initialized = true; // 避免重复尝试
  }
};

/**
 * 记录播放历史
 *
 * @param {string} regionId - 地区ID
 * @param {string} airportCode - 机场代码
 * @param {number} clipIndex - 音频索引
 * @param {string} clipTitle - 音频标题
 */
AudioPreheatManager.prototype.recordPlayHistory = function(regionId, airportCode, clipIndex, clipTitle) {
  this.init();

  try {
    // 构建播放记录
    var record = {
      regionId: regionId,
      airportCode: airportCode,
      clipIndex: clipIndex,
      clipTitle: clipTitle,
      timestamp: Date.now()
    };

    // 去重：如果已存在相同记录，移除旧记录
    this.playHistory = this.playHistory.filter(function(item) {
      return !(item.regionId === regionId &&
               item.airportCode === airportCode &&
               item.clipIndex === clipIndex);
    });

    // 添加到历史记录（最新的在前面）
    this.playHistory.unshift(record);

    // 限制历史记录数量
    if (this.playHistory.length > MAX_HISTORY_COUNT) {
      this.playHistory = this.playHistory.slice(0, MAX_HISTORY_COUNT);
    }

    // 持久化
    wx.setStorageSync(PLAY_HISTORY_KEY, this.playHistory);

    console.log('✅ 播放历史已记录:', regionId, airportCode, clipTitle);

  } catch (error) {
    console.error('❌ 记录播放历史失败:', error);
  }
};

/**
 * 添加收藏航线
 *
 * @param {string} regionId - 地区ID
 * @param {string} airportCode - 机场代码
 * @param {string} airportName - 机场名称
 */
AudioPreheatManager.prototype.addFavoriteRoute = function(regionId, airportCode, airportName) {
  this.init();

  try {
    // 检查是否已收藏
    var exists = this.favoriteRoutes.some(function(item) {
      return item.regionId === regionId && item.airportCode === airportCode;
    });

    if (exists) {
      console.log('⚠️ 航线已收藏:', airportCode);
      return false;
    }

    // 添加收藏
    this.favoriteRoutes.push({
      regionId: regionId,
      airportCode: airportCode,
      airportName: airportName,
      timestamp: Date.now()
    });

    // 持久化
    wx.setStorageSync(FAVORITE_ROUTES_KEY, this.favoriteRoutes);

    console.log('✅ 航线已添加到收藏:', airportCode, airportName);
    return true;

  } catch (error) {
    console.error('❌ 添加收藏航线失败:', error);
    return false;
  }
};

/**
 * 移除收藏航线
 *
 * @param {string} regionId - 地区ID
 * @param {string} airportCode - 机场代码
 */
AudioPreheatManager.prototype.removeFavoriteRoute = function(regionId, airportCode) {
  this.init();

  try {
    this.favoriteRoutes = this.favoriteRoutes.filter(function(item) {
      return !(item.regionId === regionId && item.airportCode === airportCode);
    });

    // 持久化
    wx.setStorageSync(FAVORITE_ROUTES_KEY, this.favoriteRoutes);

    console.log('✅ 航线已从收藏移除:', airportCode);
    return true;

  } catch (error) {
    console.error('❌ 移除收藏航线失败:', error);
    return false;
  }
};

/**
 * 检查航线是否已收藏
 *
 * @param {string} regionId - 地区ID
 * @param {string} airportCode - 机场代码
 * @returns {boolean} 是否已收藏
 */
AudioPreheatManager.prototype.isFavoriteRoute = function(regionId, airportCode) {
  this.init();

  return this.favoriteRoutes.some(function(item) {
    return item.regionId === regionId && item.airportCode === airportCode;
  });
};

/**
 * 获取推荐预热的音频列表
 *
 * @returns {Array} 推荐预热的音频数组
 *
 * 推荐策略：
 * 1. 收藏的航线（优先级最高）
 * 2. 播放频率最高的航线（Top 10）
 * 3. 最近播放的航线（最近7天）
 */
AudioPreheatManager.prototype.getRecommendedPreheatList = function() {
  this.init();

  var recommendList = [];
  var addedKeys = new Set();

  // 辅助函数：生成唯一key
  function makeKey(regionId, airportCode, clipIndex) {
    return regionId + '_' + airportCode + '_' + clipIndex;
  }

  // 辅助函数：添加到推荐列表（去重）
  function addToList(item) {
    var key = makeKey(item.regionId, item.airportCode, item.clipIndex);
    if (!addedKeys.has(key)) {
      recommendList.push(item);
      addedKeys.add(key);
    }
  }

  // 1. 收藏的航线（优先级：high）
  this.favoriteRoutes.forEach(function(favorite) {
    addToList({
      regionId: favorite.regionId,
      airportCode: favorite.airportCode,
      clipIndex: 0, // 收藏航线预热第一个音频
      priority: 'high',
      reason: 'favorite'
    });
  });

  // 2. 播放频率最高的航线（优先级：normal）
  var frequencyMap = {};
  this.playHistory.forEach(function(record) {
    var key = makeKey(record.regionId, record.airportCode, record.clipIndex);
    frequencyMap[key] = (frequencyMap[key] || 0) + 1;
  });

  var topFrequent = Object.keys(frequencyMap)
    .sort(function(a, b) { return frequencyMap[b] - frequencyMap[a]; })
    .slice(0, 10);

  topFrequent.forEach(function(key) {
    var parts = key.split('_');
    if (parts.length === 3) {
      addToList({
        regionId: parts[0],
        airportCode: parts[1],
        clipIndex: parseInt(parts[2]),
        priority: 'normal',
        reason: 'frequent',
        playCount: frequencyMap[key]
      });
    }
  });

  // 3. 最近7天播放的航线（优先级：normal）
  var sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  this.playHistory
    .filter(function(record) { return record.timestamp > sevenDaysAgo; })
    .slice(0, 10)
    .forEach(function(record) {
      addToList({
        regionId: record.regionId,
        airportCode: record.airportCode,
        clipIndex: record.clipIndex,
        priority: 'normal',
        reason: 'recent'
      });
    });

  // 限制总数量
  recommendList = recommendList.slice(0, MAX_PREHEAT_COUNT);

  console.log('📋 推荐预热列表:', recommendList.length, '项');
  return recommendList;
};

/**
 * 开始预热任务（WiFi环境检测）
 *
 * @returns {Promise} 预热任务Promise
 */
AudioPreheatManager.prototype.startPreheat = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    // 1. 检查是否正在预热
    if (self.isPrehating) {
      console.log('⚠️ 预热任务已在进行中');
      resolve({ status: 'running' });
      return;
    }

    // 2. 检查网络状态（仅WiFi环境下预热）
    wx.getNetworkType({
      success: function(res) {
        var networkType = res.networkType;

        if (networkType !== 'wifi') {
          console.log('⚠️ 非WiFi环境，跳过预热');
          resolve({ status: 'skipped', reason: 'no_wifi' });
          return;
        }

        // 3. 获取推荐预热列表
        var preheatList = self.getRecommendedPreheatList();

        if (preheatList.length === 0) {
          console.log('⚠️ 没有需要预热的音频');
          resolve({ status: 'empty' });
          return;
        }

        // 4. 开始预热任务
        console.log('🔥 开始预热任务，共', preheatList.length, '项');
        self.isPrehating = true;

        self.executePreheatTask(preheatList)
          .then(function(result) {
            self.isPrehating = false;
            console.log('✅ 预热任务完成:', result);
            resolve(result);
          })
          .catch(function(error) {
            self.isPrehating = false;
            console.error('❌ 预热任务失败:', error);
            reject(error);
          });
      },
      fail: function(error) {
        console.error('❌ 获取网络状态失败:', error);
        reject(error);
      }
    });
  });
};

/**
 * 验证缓存键参数（防止路径穿越攻击）
 *
 * @param {string} regionId - 地区ID
 * @param {string} airportCode - 机场代码
 * @param {number} clipIndex - 音频索引
 * @returns {boolean} 是否有效
 */
function validateCacheKey(regionId, airportCode, clipIndex) {
  // regionId: 仅允许小写字母和连字符
  var validRegion = /^[a-z-]+$/.test(regionId);

  // airportCode: 仅允许3-4个大写字母
  var validAirport = /^[A-Z]{3,4}$/.test(airportCode);

  // clipIndex: 必须是非负整数，且小于1000
  var validIndex = Number.isInteger(clipIndex) && clipIndex >= 0 && clipIndex < 1000;

  return validRegion && validAirport && validIndex;
}

/**
 * 执行预热任务（后台任务）
 *
 * @param {Array} preheatList - 预热列表
 * @returns {Promise} 任务结果
 */
AudioPreheatManager.prototype.executePreheatTask = function(preheatList) {
  var self = this;

  return new Promise(function(resolve, reject) {
    var successCount = 0;
    var failCount = 0;
    var skippedCount = 0;
    var startTime = Date.now();

    // 使用递归+延迟，避免阻塞主线程
    function processNext(index) {
      if (index >= preheatList.length) {
        // 任务完成
        var duration = Date.now() - startTime;
        resolve({
          status: 'completed',
          total: preheatList.length,
          success: successCount,
          failed: failCount,
          skipped: skippedCount,
          duration: duration
        });
        return;
      }

      var item = preheatList[index];

      // 🔥 关键：验证输入参数（防止路径穿越攻击）
      if (!validateCacheKey(item.regionId, item.airportCode, item.clipIndex)) {
        console.error('❌ 无效的缓存键参数:', item);
        failCount++;
        setTimeout(function() { processNext(index + 1); }, 10);
        return;
      }

      var cacheKey = item.regionId + '_' + item.airportCode + '_' + item.clipIndex;
      var originalSrc = '/' + self.getPackageRoot(item.regionId) + '/' + self.getAudioFileName(item);

      // 检查是否已缓存
      var cachedPath = AudioCacheManager.getCachedAudioPath(cacheKey);
      if (cachedPath) {
        console.log('⏭️ 音频已缓存，跳过:', cacheKey);
        skippedCount++;
        // 延迟后处理下一个
        setTimeout(function() { processNext(index + 1); }, 10);
        return;
      }

      // 开始缓存
      console.log('🔄 预热中 (' + (index + 1) + '/' + preheatList.length + '):', cacheKey);

      AudioCacheManager.ensureAudioCached(cacheKey, originalSrc)
        .then(function() {
          successCount++;
          console.log('✅ 预热成功:', cacheKey);
        })
        .catch(function(error) {
          failCount++;
          console.error('❌ 预热失败:', cacheKey, error);
        })
        .finally(function() {
          // 延迟后处理下一个（避免过快）
          setTimeout(function() { processNext(index + 1); }, PREHEAT_INTERVAL);
        });
    }

    // 开始处理第一个
    processNext(0);
  });
};

/**
 * 获取分包根目录
 *
 * @param {string} regionId - 地区ID
 * @returns {string} 分包根目录
 */
AudioPreheatManager.prototype.getPackageRoot = function(regionId) {
  // 简化映射（实际应从audio-config.js获取）
  var packageMap = {
    'japan': 'packageJapan',
    'korea': 'packageKorean',
    'singapore': 'packageSingapore',
    'uk': 'packageUK',
    'france': 'packageFrance'
    // ... 其他地区
  };

  return packageMap[regionId] || 'package' + regionId.charAt(0).toUpperCase() + regionId.slice(1);
};

/**
 * 获取音频文件名
 *
 * @param {Object} item - 音频项
 * @returns {string} 音频文件名
 */
AudioPreheatManager.prototype.getAudioFileName = function(item) {
  // 简化实现（实际应从数据文件获取）
  return item.airportCode + '_' + item.clipIndex + '.mp3';
};

/**
 * 获取预热统计信息
 *
 * @returns {Object} 统计信息
 */
AudioPreheatManager.prototype.getPreheatStats = function() {
  this.init();

  return {
    playHistoryCount: this.playHistory.length,
    favoriteRoutesCount: this.favoriteRoutes.length,
    recommendedCount: this.getRecommendedPreheatList().length,
    isPrehating: this.isPrehating
  };
};

// ==================== 导出单例 ====================

var audioPreheatManagerInstance = new AudioPreheatManager();

module.exports = {
  // 单例实例
  instance: audioPreheatManagerInstance,

  // 快捷方法
  init: function() {
    return audioPreheatManagerInstance.init();
  },

  recordPlayHistory: function(regionId, airportCode, clipIndex, clipTitle) {
    return audioPreheatManagerInstance.recordPlayHistory(regionId, airportCode, clipIndex, clipTitle);
  },

  addFavoriteRoute: function(regionId, airportCode, airportName) {
    return audioPreheatManagerInstance.addFavoriteRoute(regionId, airportCode, airportName);
  },

  removeFavoriteRoute: function(regionId, airportCode) {
    return audioPreheatManagerInstance.removeFavoriteRoute(regionId, airportCode);
  },

  isFavoriteRoute: function(regionId, airportCode) {
    return audioPreheatManagerInstance.isFavoriteRoute(regionId, airportCode);
  },

  startPreheat: function() {
    return audioPreheatManagerInstance.startPreheat();
  },

  getPreheatStats: function() {
    return audioPreheatManagerInstance.getPreheatStats();
  }
};
