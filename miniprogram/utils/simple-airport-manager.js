/**
 * 简化版机场数据管理器
 * 专注于基本显示功能，解决机场不显示的问题
 */

var coordinateConverter = require('./coordinate-converter.js');

// 缓存配置
var CACHE_CONFIG = {
  AIRPORT_DATA_KEY: 'simple_airports_v1',
  CACHE_EXPIRY_KEY: 'simple_airports_expiry_v1',
  CACHE_DURATION: 7 * 24 * 60 * 60 * 1000 // 7天
};

// 简化配置
var SIMPLE_CONFIG = {
  MAX_DISPLAY_AIRPORTS: 200, // 最多显示200个机场
  NEARBY_RADIUS_KM: 1000,    // 显示1000公里范围内的机场
  BATCH_SIZE: 100            // 批处理大小
};

/**
 * 检查缓存是否有效
 */
function checkCacheValidity() {
  try {
    var cachedData = wx.getStorageSync(CACHE_CONFIG.AIRPORT_DATA_KEY);
    var cacheExpiry = wx.getStorageSync(CACHE_CONFIG.CACHE_EXPIRY_KEY);
    
    if (!cachedData || !cacheExpiry) {
      console.log('📦 无缓存数据');
      return { valid: false, reason: 'no_cache' };
    }
    
    if (Date.now() > cacheExpiry) {
      console.log('📦 缓存已过期');
      return { valid: false, reason: 'expired' };
    }
    
    console.log('📦 缓存有效，数据量:', cachedData.length);
    return { valid: true, data: cachedData };
  } catch (error) {
    console.error('❌ 缓存检查失败:', error);
    return { valid: false, reason: 'error' };
  }
}

/**
 * 缓存处理后的数据
 */
function cacheProcessedData(processedAirports) {
  try {
    // 暂时禁用缓存功能，因为数据量太大超出了微信小程序的缓存限制
    console.log('⚠️ 缓存功能已禁用（数据量过大）');
    return false;
    
    // 以下是原缓存代码，暂时注释
    /*
    var expiryTime = Date.now() + CACHE_CONFIG.CACHE_DURATION;
    
    wx.setStorageSync(CACHE_CONFIG.AIRPORT_DATA_KEY, processedAirports);
    wx.setStorageSync(CACHE_CONFIG.CACHE_EXPIRY_KEY, expiryTime);
    
    console.log('✅ 机场数据已缓存，数量:', processedAirports.length);
    return true;
    */
  } catch (error) {
    console.error('❌ 缓存失败:', error);
    return false;
  }
}

/**
 * 批量处理机场数据（简化版）
 */
function processAirportsInBatches(rawAirports, onProgress, onComplete) {
  console.log('🔄 开始批量处理机场数据，总数:', rawAirports.length);
  
  var batchSize = SIMPLE_CONFIG.BATCH_SIZE;
  var totalBatches = Math.ceil(rawAirports.length / batchSize);
  var processedAirports = [];
  var currentBatch = 0;
  
  function processBatch() {
    var start = currentBatch * batchSize;
    var end = Math.min(start + batchSize, rawAirports.length);
    var batch = rawAirports.slice(start, end);
    
    console.log(`🔄 处理批次 ${currentBatch + 1}/${totalBatches}, 范围: ${start}-${end}`);
    
    // 处理当前批次
    var convertedBatch = coordinateConverter.convertAirportsCoordinates(batch);
    processedAirports = processedAirports.concat(convertedBatch);
    
    currentBatch++;
    var progress = Math.round((currentBatch / totalBatches) * 100);
    
    if (onProgress) {
      onProgress(progress, currentBatch, totalBatches);
    }
    
    if (currentBatch < totalBatches) {
      // 使用setTimeout避免阻塞UI
      setTimeout(processBatch, 10);
    } else {
      console.log('✅ 批量处理完成，总数:', processedAirports.length);
      
      // 缓存结果
      cacheProcessedData(processedAirports);
      
      if (onComplete) {
        onComplete(processedAirports);
      }
    }
  }
  
  processBatch();
}

/**
 * 计算两点间距离（公里）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  var R = 6371; // 地球半径（公里）
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * 获取附近的机场（简化版）
 */
function getNearbyAirports(allAirports, centerLat, centerLng, maxCount) {
  if (!allAirports || allAirports.length === 0) {
    console.log('❌ 没有机场数据');
    return [];
  }
  
  console.log('🔍 搜索附近机场，中心点:', centerLat, centerLng);
  
  // 计算所有机场到中心点的距离
  var airportsWithDistance = allAirports.map(function(airport) {
    var distance = calculateDistance(centerLat, centerLng, airport.Latitude, airport.Longitude);
    return {
      ...airport,
      distance: distance
    };
  });
  
  // 按距离排序
  airportsWithDistance.sort(function(a, b) {
    return a.distance - b.distance;
  });
  
  // 过滤距离过远的机场
  var nearbyAirports = airportsWithDistance.filter(function(airport) {
    return airport.distance <= SIMPLE_CONFIG.NEARBY_RADIUS_KM;
  });
  
  // 限制数量
  var result = nearbyAirports.slice(0, maxCount || SIMPLE_CONFIG.MAX_DISPLAY_AIRPORTS);
  
  console.log(`✅ 找到附近机场 ${result.length} 个（最远距离: ${result.length > 0 ? Math.round(result[result.length-1].distance) : 0}km）`);
  
  return result;
}

/**
 * 获取地图范围内的机场（简化版）
 */
function getAirportsInRegion(allAirports, region, maxCount) {
  if (!allAirports || allAirports.length === 0) {
    console.log('❌ 没有机场数据');
    return [];
  }
  
  if (!region || !region.southwest || !region.northeast) {
    console.log('❌ 地图区域无效');
    return [];
  }
  
  console.log('🔍 搜索区域内机场:', region);
  
  // 过滤在地图范围内的机场
  var airportsInRegion = allAirports.filter(function(airport) {
    return airport.Latitude >= region.southwest.lat &&
           airport.Latitude <= region.northeast.lat &&
           airport.Longitude >= region.southwest.lng &&
           airport.Longitude <= region.northeast.lng;
  });
  
  // 限制数量
  var result = airportsInRegion.slice(0, maxCount || SIMPLE_CONFIG.MAX_DISPLAY_AIRPORTS);
  
  console.log(`✅ 区域内找到机场 ${result.length} 个`);
  
  return result;
}

/**
 * 清除缓存
 */
function clearCache() {
  try {
    wx.removeStorageSync(CACHE_CONFIG.AIRPORT_DATA_KEY);
    wx.removeStorageSync(CACHE_CONFIG.CACHE_EXPIRY_KEY);
    console.log('✅ 简化版机场缓存已清除');
    return true;
  } catch (error) {
    console.error('❌ 清除缓存失败:', error);
    return false;
  }
}

module.exports = {
  checkCacheValidity: checkCacheValidity,
  processAirportsInBatches: processAirportsInBatches,
  getNearbyAirports: getNearbyAirports,
  getAirportsInRegion: getAirportsInRegion,
  clearCache: clearCache,
  SIMPLE_CONFIG: SIMPLE_CONFIG
};