/**
 * 双发复飞梯度数据管理器
 * 负责加载和管理packageH中的双发复飞梯度数据
 */

// 缓存变量
let twinEngineDataCache = null;
let twinEngineDataCacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时缓存

/**
 * 加载双发复飞梯度数据
 * @returns {Promise<Array>} 返回双发复飞梯度数据数组
 */
function loadTwinEngineData() {
  return new Promise((resolve, reject) => {
    try {
      // 检查缓存
      const now = Date.now();
      if (twinEngineDataCache && (now - twinEngineDataCacheTime) < CACHE_DURATION) {
        resolve(twinEngineDataCache);
        return;
      }

      // 第一层：尝试从packageH分包加载
      require('../packageH/TwinEngineGoAroundGradient.js', (module) => {
        // 处理CommonJS模块导出
        const data = module.exports || module;
        
        if (data && Array.isArray(data) && data.length > 0) {
          
          // 更新缓存
          twinEngineDataCache = data;
          twinEngineDataCacheTime = now;
          
          resolve(data);
        } else {
          loadFallbackData().then(resolve).catch(reject);
        }
      }, (error) => {
        loadFallbackData().then(resolve).catch(reject);
      });

    } catch (error) {
      console.error('💥 加载双发复飞梯度数据时发生异常:', error);
      loadFallbackData().then(resolve).catch(reject);
    }
  });
}

/**
 * 兜底数据加载
 * @returns {Promise<Array>} 返回兜底数据
 */
function loadFallbackData() {
  return new Promise((resolve, reject) => {
    try {
      // 第二层：直接require（同步方式）
      const directModule = require('../packageH/TwinEngineGoAroundGradient.js');
      const directData = directModule.exports || directModule;
      
      if (directData && Array.isArray(directData) && directData.length > 0) {
        
        // 更新缓存
        twinEngineDataCache = directData;
        twinEngineDataCacheTime = Date.now();
        
        resolve(directData);
      } else {
        resolve(getDefaultData());
      }
    } catch (error) {
      console.error('💥 直接加载数据也失败:', error);
      resolve(getDefaultData());
    }
  });
}

/**
 * 获取默认数据（最后的兜底）
 * @returns {Array} 返回默认数据
 */
function getDefaultData() {
  return [
    {
      "model": "示例机型",
      "conditions": {
        "air_con": "ON",
        "anti_ice": "OFF",
        "config": "FULL",
        "temperature": "DISA+25°C"
      },
      "data": [
        {
          "weight_kg": 50000,
          "values": { "0": 20.0, "2000": 18.0, "4000": 16.0, "6000": 14.0 }
        }
      ]
    }
  ];
}

/**
 * 清除缓存
 */
function clearCache() {
  twinEngineDataCache = null;
  twinEngineDataCacheTime = 0;
}

/**
 * 获取缓存状态
 * @returns {Object} 缓存状态信息
 */
function getCacheStatus() {
  const now = Date.now();
  const isValid = twinEngineDataCache && (now - twinEngineDataCacheTime) < CACHE_DURATION;
  
  return {
    hasCache: !!twinEngineDataCache,
    isValid: isValid,
    cacheTime: twinEngineDataCacheTime,
    dataCount: twinEngineDataCache ? twinEngineDataCache.length : 0,
    remainingTime: isValid ? CACHE_DURATION - (now - twinEngineDataCacheTime) : 0
  };
}

module.exports = {
  loadTwinEngineData,
  clearCache,
  getCacheStatus
}; 