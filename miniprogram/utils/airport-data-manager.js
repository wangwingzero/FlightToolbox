/**
 * 高性能机场数据管理器
 * 实现缓存、分级显示、视野加载等性能优化
 */

var coordinateConverter = require('./coordinate-converter.js');

// 缓存配置
var CACHE_CONFIG = {
  AIRPORT_DATA_KEY: 'optimized_airports_v2',
  CACHE_EXPIRY_KEY: 'airports_cache_expiry_v2',
  CACHE_DURATION: 7 * 24 * 60 * 60 * 1000, // 7天
  SPATIAL_INDEX_KEY: 'airports_spatial_index_v2'
};

// 性能配置
var PERFORMANCE_CONFIG = {
  MAX_MARKERS_PER_LEVEL: {
    1: 50,   // 全球视图：只显示最重要的机场
    2: 100,  // 大洲视图：显示重要机场
    3: 200,  // 国家视图：显示主要机场
    4: 500,  // 省份视图：显示所有重要机场
    5: 1000  // 城市视图：显示所有机场
  },
  GRID_SIZE: 2, // 2度网格
  UPDATE_DEBOUNCE: 500, // 500ms防抖
  BATCH_SIZE: 100 // 批处理大小
};

/**
 * 机场重要性分类
 */
function classifyAirportImportance(airport) {
  // 国际枢纽机场（基于ICAO代码和规模）
  var hubPatterns = [
    /^Z[A-Z]{3}/, // 中国主要机场
    /^K[A-Z]{3}/, // 美国主要机场
    /^E[A-Z]{3}/, // 欧洲主要机场
    /^R[A-Z]{3}/, // 俄罗斯主要机场
    /^V[A-Z]{3}/, // 印度主要机场
  ];
  
  var internationalCodes = [
    'ZBAA', 'ZSPD', 'ZGGG', 'ZPPP', 'ZUUU', // 中国枢纽
    'KJFK', 'KLAX', 'KORD', 'KATL', 'KDFW', // 美国枢纽
    'EGLL', 'LFPG', 'EDDF', 'EHAM', 'LIRF', // 欧洲枢纽
    'RJTT', 'RJAA', // 日本枢纽
    'RKSI', // 韩国枢纽
    'WSSS', 'WMKK', // 东南亚枢纽
    'OMDB', 'OTHH', // 中东枢纽
  ];
  
  if (internationalCodes.includes(airport.ICAOCode)) {
    return 1; // 最高重要性
  }
  
  // 检查是否匹配枢纽模式
  for (var i = 0; i < hubPatterns.length; i++) {
    if (hubPatterns[i].test(airport.ICAOCode)) {
      return 2; // 高重要性
    }
  }
  
  // 有IATA代码的通常是商业机场
  if (airport.IATACode && airport.IATACode.length === 3) {
    return 3; // 中等重要性
  }
  
  return 4; // 低重要性
}

/**
 * 创建空间索引
 */
function createSpatialIndex(airports) {
  var index = {};
  var gridSize = PERFORMANCE_CONFIG.GRID_SIZE;
  
  airports.forEach(function(airport, idx) {
    var gridX = Math.floor(airport.Longitude / gridSize);
    var gridY = Math.floor(airport.Latitude / gridSize);
    var key = gridX + ',' + gridY;
    
    if (!index[key]) {
      index[key] = [];
    }
    
    index[key].push({
      ...airport,
      index: idx,
      importance: classifyAirportImportance(airport)
    });
  });
  
  // 对每个网格内的机场按重要性排序
  Object.keys(index).forEach(function(key) {
    index[key].sort(function(a, b) {
      return a.importance - b.importance;
    });
  });
  
  return index;
}

/**
 * 检查缓存是否有效
 */
function checkCacheValidity() {
  try {
    var cachedData = wx.getStorageSync(CACHE_CONFIG.AIRPORT_DATA_KEY);
    var cacheExpiry = wx.getStorageSync(CACHE_CONFIG.CACHE_EXPIRY_KEY);
    
    if (!cachedData || !cacheExpiry) {
      return { valid: false, reason: 'no_cache' };
    }
    
    if (Date.now() > cacheExpiry) {
      return { valid: false, reason: 'expired' };
    }
    
    return { 
      valid: true, 
      data: cachedData,
      spatialIndex: wx.getStorageSync(CACHE_CONFIG.SPATIAL_INDEX_KEY)
    };
  } catch (error) {
    console.error('缓存检查失败:', error);
    return { valid: false, reason: 'error' };
  }
}

/**
 * 缓存处理后的数据
 */
function cacheProcessedData(processedAirports, spatialIndex) {
  try {
    var expiryTime = Date.now() + CACHE_CONFIG.CACHE_DURATION;
    
    wx.setStorageSync(CACHE_CONFIG.AIRPORT_DATA_KEY, processedAirports);
    wx.setStorageSync(CACHE_CONFIG.CACHE_EXPIRY_KEY, expiryTime);
    wx.setStorageSync(CACHE_CONFIG.SPATIAL_INDEX_KEY, spatialIndex);
    
    console.log('✅ 机场数据已缓存，有效期至:', new Date(expiryTime));
    return true;
  } catch (error) {
    console.error('❌ 缓存失败:', error);
    return false;
  }
}

/**
 * 批量处理机场数据（避免阻塞UI）
 */
function processAirportsInBatches(rawAirports, onProgress, onComplete) {
  var batchSize = PERFORMANCE_CONFIG.BATCH_SIZE;
  var totalBatches = Math.ceil(rawAirports.length / batchSize);
  var processedAirports = [];
  var currentBatch = 0;
  
  function processBatch() {
    var start = currentBatch * batchSize;
    var end = Math.min(start + batchSize, rawAirports.length);
    var batch = rawAirports.slice(start, end);
    
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
      // 处理完成，创建空间索引
      console.log('🔄 创建空间索引...');
      var spatialIndex = createSpatialIndex(processedAirports);
      
      // 缓存结果
      cacheProcessedData(processedAirports, spatialIndex);
      
      if (onComplete) {
        onComplete(processedAirports, spatialIndex);
      }
    }
  }
  
  processBatch();
}

/**
 * 根据地图级别获取合适的机场
 */
function getAirportsByMapLevel(spatialIndex, region, mapScale) {
  var level = Math.min(Math.floor(mapScale / 3), 4) + 1; // 1-5级
  var maxMarkers = PERFORMANCE_CONFIG.MAX_MARKERS_PER_LEVEL[level];
  
  // 获取可见网格
  var visibleGrids = getVisibleGrids(region);
  var visibleAirports = [];
  
  visibleGrids.forEach(function(gridKey) {
    var gridAirports = spatialIndex[gridKey] || [];
    visibleAirports = visibleAirports.concat(gridAirports);
  });
  
  // 按重要性过滤和排序
  var importanceThreshold = getImportanceThreshold(level);
  var filteredAirports = visibleAirports
    .filter(function(airport) {
      return airport.importance <= importanceThreshold;
    })
    .sort(function(a, b) {
      return a.importance - b.importance;
    });
  
  // 限制数量
  return filteredAirports.slice(0, maxMarkers);
}

/**
 * 获取可见网格
 */
function getVisibleGrids(region) {
  if (!region || !region.southwest || !region.northeast) {
    return [];
  }
  
  var gridSize = PERFORMANCE_CONFIG.GRID_SIZE;
  var grids = [];
  
  var minX = Math.floor(region.southwest.lng / gridSize);
  var maxX = Math.ceil(region.northeast.lng / gridSize);
  var minY = Math.floor(region.southwest.lat / gridSize);
  var maxY = Math.ceil(region.northeast.lat / gridSize);
  
  for (var x = minX; x <= maxX; x++) {
    for (var y = minY; y <= maxY; y++) {
      grids.push(x + ',' + y);
    }
  }
  
  return grids;
}

/**
 * 根据级别获取重要性阈值
 */
function getImportanceThreshold(level) {
  var thresholds = {
    1: 1, // 只显示最重要的机场
    2: 2, // 显示重要机场
    3: 3, // 显示中等重要性机场
    4: 4, // 显示所有机场
    5: 4  // 显示所有机场
  };
  return thresholds[level] || 4;
}

/**
 * 清除缓存
 */
function clearCache() {
  try {
    wx.removeStorageSync(CACHE_CONFIG.AIRPORT_DATA_KEY);
    wx.removeStorageSync(CACHE_CONFIG.CACHE_EXPIRY_KEY);
    wx.removeStorageSync(CACHE_CONFIG.SPATIAL_INDEX_KEY);
    console.log('✅ 机场数据缓存已清除');
    return true;
  } catch (error) {
    console.error('❌ 清除缓存失败:', error);
    return false;
  }
}

module.exports = {
  checkCacheValidity: checkCacheValidity,
  processAirportsInBatches: processAirportsInBatches,
  getAirportsByMapLevel: getAirportsByMapLevel,
  createSpatialIndex: createSpatialIndex,
  clearCache: clearCache,
  PERFORMANCE_CONFIG: PERFORMANCE_CONFIG
};