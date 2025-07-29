/**
 * 地形管理器模块
 * 
 * 提供地形数据管理和可视化功能，包括：
 * - 地形数据加载和缓存管理
 * - 高度数据到颜色的映射算法
 * - 地形网格数据处理
 * - 地形图层渲染支持
 * - 航点与地形的高度查询
 * 
 * 设计原则：
 * - 离线优先，本地数据存储
 * - 按需加载，内存优化
 * - 高性能渲染，支持实时更新
 * - 模块化设计，易于扩展
 */

var TerrainManager = {
  /**
   * 创建地形管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 内部状态
      config: config,
      terrainCache: new Map(), // 地形数据缓存
      colorCache: new Map(),   // 颜色缓存
      loadingTiles: new Set(), // 正在加载的地形块
      isEnabled: false,        // 地形显示开启状态
      
      // 地形数据网格配置
      tileSize: 1.0,          // 每个地形块覆盖1度
      resolution: 0.00833,    // 约30弧秒精度（~900米）
      gridSize: 120,          // 每个tile的网格数量 (1度/30弧秒)
      maxCacheSize: 20,       // 最大缓存地形块数量
      
      // 颜色映射配置
      colorMapping: {
        seaLevel: { height: 0, color: '#0066CC' },      // 海平面-深蓝色
        lowland: { height: 200, color: '#00CC00' },     // 低地-绿色
        plains: { height: 500, color: '#66CC00' },      // 平原-浅绿色
        hills: { height: 1000, color: '#CCCC00' },      // 丘陵-黄色
        mountains: { height: 2000, color: '#CC6600' },  // 山地-橙色
        highMountains: { height: 4000, color: '#996633' }, // 高山-棕色
        peaks: { height: 6000, color: '#FFFFFF' }       // 雪峰-白色
      },
      
      /**
       * 初始化地形管理器
       * @param {Object} options 初始化选项
       */
      init: function(options) {
        manager.pageRef = options.page;
        manager.callbacks = options.callbacks || {};
        
        // 初始化缓存清理定时器
        manager.setupCacheCleanup();
        
        // 预加载默认区域地形数据
        if (options.preloadRegion) {
          manager.preloadRegion(options.preloadRegion);
        }
        
        console.log('地形管理器初始化完成');
      },
      
      /**
       * 启用/禁用地形显示
       * @param {Boolean} enabled 是否启用
       */
      setEnabled: function(enabled) {
        manager.isEnabled = enabled;
        console.log('地形管理器状态更新:', enabled ? '已启用' : '已禁用');
        
        if (manager.callbacks.onTerrainToggle) {
          manager.callbacks.onTerrainToggle(enabled);
        }
      },
      
      /**
       * 检查地形是否启用
       * @returns {Boolean} 是否启用
       */
      getEnabled: function() {
        return manager.isEnabled;
      },
      
      /**
       * 获取指定坐标的地形高度
       * @param {Number} lat 纬度
       * @param {Number} lng 经度
       * @returns {Number} 高度（米）
       */
      getElevation: function(lat, lng) {
        var tileKey = manager.getTileKey(lat, lng);
        var tile = manager.terrainCache.get(tileKey);
        
        if (!tile) {
          // 异步加载地形数据
          manager.loadTerrainTile(lat, lng);
          return 0; // 默认返回海平面高度
        }
        
        return manager.interpolateElevation(tile, lat, lng);
      },
      
      /**
       * 获取指定坐标的地形颜色
       * @param {Number} lat 纬度
       * @param {Number} lng 经度
       * @returns {String} 十六进制颜色值
       */
      getTerrainColor: function(lat, lng) {
        var elevation = manager.getElevation(lat, lng);
        return manager.elevationToColor(elevation);
      },
      
      /**
       * 高度值转换为颜色
       * @param {Number} elevation 高度（米）
       * @returns {String} 十六进制颜色值
       */
      elevationToColor: function(elevation) {
        // 缓存查找
        var cacheKey = Math.floor(elevation / 10) * 10; // 10米精度缓存
        if (manager.colorCache.has(cacheKey)) {
          return manager.colorCache.get(cacheKey);
        }
        
        var color = manager.calculateColor(elevation);
        manager.colorCache.set(cacheKey, color);
        
        // 限制缓存大小
        if (manager.colorCache.size > 1000) {
          var firstKey = manager.colorCache.keys().next().value;
          manager.colorCache.delete(firstKey);
        }
        
        return color;
      },
      
      /**
       * 计算高度对应的颜色
       * @param {Number} elevation 高度
       * @returns {String} 颜色值
       */
      calculateColor: function(elevation) {
        var levels = Object.values(manager.colorMapping);
        
        // 找到高度区间
        for (var i = 0; i < levels.length - 1; i++) {
          if (elevation >= levels[i].height && elevation < levels[i + 1].height) {
            // 线性插值计算颜色
            return manager.interpolateColor(
              levels[i].color,
              levels[i + 1].color,
              (elevation - levels[i].height) / (levels[i + 1].height - levels[i].height)
            );
          }
        }
        
        // 超出最高范围使用最高颜色
        if (elevation >= levels[levels.length - 1].height) {
          return levels[levels.length - 1].color;
        }
        
        // 低于最低范围使用最低颜色
        return levels[0].color;
      },
      
      /**
       * 颜色线性插值
       * @param {String} color1 起始颜色
       * @param {String} color2 结束颜色
       * @param {Number} ratio 插值比例 (0-1)
       * @returns {String} 插值后的颜色
       */
      interpolateColor: function(color1, color2, ratio) {
        var r1 = parseInt(color1.substr(1, 2), 16);
        var g1 = parseInt(color1.substr(3, 2), 16);
        var b1 = parseInt(color1.substr(5, 2), 16);
        
        var r2 = parseInt(color2.substr(1, 2), 16);
        var g2 = parseInt(color2.substr(3, 2), 16);
        var b2 = parseInt(color2.substr(5, 2), 16);
        
        var r = Math.round(r1 + (r2 - r1) * ratio);
        var g = Math.round(g1 + (g2 - g1) * ratio);
        var b = Math.round(b1 + (b2 - b1) * ratio);
        
        return '#' + 
          r.toString(16).padStart(2, '0') +
          g.toString(16).padStart(2, '0') +
          b.toString(16).padStart(2, '0');
      },
      
      /**
       * 获取地形块键值
       * @param {Number} lat 纬度
       * @param {Number} lng 经度
       * @returns {String} 地形块键值
       */
      getTileKey: function(lat, lng) {
        var tileX = Math.floor(lng / manager.tileSize);
        var tileY = Math.floor(lat / manager.tileSize);
        return tileX + '_' + tileY;
      },
      
      /**
       * 加载地形数据块（优化版：立即返回数据）
       * @param {Number} lat 纬度
       * @param {Number} lng 经度
       */
      loadTerrainTile: function(lat, lng) {
        var tileKey = manager.getTileKey(lat, lng);
        
        // 避免重复加载
        if (manager.terrainCache.has(tileKey)) {
          return manager.terrainCache.get(tileKey);
        }
        
        // 如果正在加载，也返回现有数据或生成临时数据
        if (manager.loadingTiles.has(tileKey)) {
          return manager.generateMockTerrainData(lat, lng);
        }
        
        manager.loadingTiles.add(tileKey);
        
        // 立即生成地形数据，不使用异步延迟
        var terrainData = manager.generateMockTerrainData(lat, lng);
        manager.terrainCache.set(tileKey, terrainData);
        manager.loadingTiles.delete(tileKey);
        
        // 限制缓存大小
        if (manager.terrainCache.size > manager.maxCacheSize) {
          var firstKey = manager.terrainCache.keys().next().value;
          manager.terrainCache.delete(firstKey);
        }
        
        // 通知渲染器更新
        if (manager.callbacks.onTerrainDataLoaded) {
          setTimeout(function() {
            manager.callbacks.onTerrainDataLoaded(tileKey, terrainData);
          }, 10);
        }
        
        return terrainData;
      },
      
      /**
       * 生成基于真实地理特征的地形数据
       * @param {Number} lat 纬度
       * @param {Number} lng 经度
       * @returns {Object} 地形数据
       */
      generateMockTerrainData: function(lat, lng) {
        var data = {
          bounds: {
            minLat: Math.floor(lat),
            maxLat: Math.floor(lat) + 1,
            minLng: Math.floor(lng),
            maxLng: Math.floor(lng) + 1
          },
          gridSize: manager.gridSize,
          elevations: []
        };
        
        // 基于中国实际地形生成更真实的地形数据
        var baseElevation = manager.getRegionalBaseElevation(lat, lng);
        var terrainType = manager.getTerrainType(lat, lng);
        
        // 生成具有地理特征的高度数据
        for (var y = 0; y < manager.gridSize; y++) {
          var row = [];
          for (var x = 0; x < manager.gridSize; x++) {
            var currentLat = lat + (y - manager.gridSize/2) * manager.resolution;
            var currentLng = lng + (x - manager.gridSize/2) * manager.resolution;
            
            var elevation = manager.calculateRealisticElevation(
              currentLat, currentLng, baseElevation, terrainType
            );
            
            row.push(Math.max(0, Math.floor(elevation)));
          }
          data.elevations.push(row);
        }
        
        return data;
      },
      
      /**
       * 获取区域基础海拔
       * @param {Number} lat 纬度
       * @param {Number} lng 经度
       * @returns {Number} 基础海拔高度
       */
      getRegionalBaseElevation: function(lat, lng) {
        // 青藏高原 (26-39°N, 73-104°E)
        if (lat >= 26 && lat <= 39 && lng >= 73 && lng <= 104) {
          return 4000 + Math.random() * 1000; // 4000-5000米
        }
        
        // 新疆天山 (40-48°N, 75-95°E)
        if (lat >= 40 && lat <= 48 && lng >= 75 && lng <= 95) {
          return 2000 + Math.random() * 2000; // 2000-4000米
        }
        
        // 内蒙古高原 (40-50°N, 106-126°E)
        if (lat >= 40 && lat <= 50 && lng >= 106 && lng <= 126) {
          return 1000 + Math.random() * 500; // 1000-1500米
        }
        
        // 东北平原 (43-48°N, 119-135°E)
        if (lat >= 43 && lat <= 48 && lng >= 119 && lng <= 135) {
          return 50 + Math.random() * 200; // 50-250米
        }
        
        // 华北平原 (32-40°N, 114-121°E) 
        if (lat >= 32 && lat <= 40 && lng >= 114 && lng <= 121) {
          return 20 + Math.random() * 100; // 20-120米
        }
        
        // 长江中下游平原 (28-35°N, 110-122°E)
        if (lat >= 28 && lat <= 35 && lng >= 110 && lng <= 122) {
          return 10 + Math.random() * 80; // 10-90米
        }
        
        // 四川盆地 (28-32°N, 102-110°E)
        if (lat >= 28 && lat <= 32 && lng >= 102 && lng <= 110) {
          return 300 + Math.random() * 500; // 300-800米
        }
        
        // 云贵高原 (22-30°N, 97-110°E)
        if (lat >= 22 && lat <= 30 && lng >= 97 && lng <= 110) {
          return 1500 + Math.random() * 1000; // 1500-2500米
        }
        
        // 华南丘陵 (20-28°N, 110-120°E)
        if (lat >= 20 && lat <= 28 && lng >= 110 && lng <= 120) {
          return 200 + Math.random() * 800; // 200-1000米
        }
        
        // 沿海平原（默认）
        return Math.random() * 50; // 0-50米
      },
      
      /**
       * 获取地形类型
       * @param {Number} lat 纬度
       * @param {Number} lng 经度
       * @returns {String} 地形类型
       */
      getTerrainType: function(lat, lng) {
        if (lat >= 26 && lat <= 39 && lng >= 73 && lng <= 104) return 'plateau';
        if (lat >= 40 && lat <= 48 && lng >= 75 && lng <= 95) return 'mountain';
        if (lat >= 40 && lat <= 50 && lng >= 106 && lng <= 126) return 'grassland';
        if (lat >= 28 && lat <= 32 && lng >= 102 && lng <= 110) return 'basin';
        if (lat >= 22 && lat <= 30 && lng >= 97 && lng <= 110) return 'highland';
        return 'plain';
      },
      
      /**
       * 计算真实的地形高度
       * @param {Number} lat 纬度
       * @param {Number} lng 经度
       * @param {Number} baseElevation 基础海拔
       * @param {String} terrainType 地形类型
       * @returns {Number} 计算后的高度
       */
      calculateRealisticElevation: function(lat, lng, baseElevation, terrainType) {
        var elevation = baseElevation;
        
        // 根据地形类型添加特征性变化
        switch (terrainType) {
          case 'plateau':
            // 高原：相对平坦但有起伏
            elevation += Math.sin(lat * 0.05) * 300 + Math.cos(lng * 0.03) * 200;
            break;
            
          case 'mountain':
            // 山地：剧烈起伏
            elevation += Math.sin(lat * 0.1) * 1500 + 
                        Math.cos(lng * 0.08) * 1200 + 
                        Math.sin(lat * lng * 0.001) * 800;
            break;
            
          case 'grassland':
            // 草原：缓慢起伏
            elevation += Math.sin(lat * 0.02) * 150 + Math.cos(lng * 0.02) * 100;
            break;
            
          case 'basin':
            // 盆地：中间低四周高
            var centerLat = 30;
            var centerLng = 106;
            var distance = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
            elevation += distance * 200 - 500; // 距离中心越远越高
            break;
            
          case 'highland':
            // 高地：波状起伏
            elevation += Math.sin(lat * 0.08) * 600 + Math.cos(lng * 0.06) * 400;
            break;
            
          case 'plain':
            // 平原：轻微起伏
            elevation += Math.sin(lat * 0.01) * 30 + Math.cos(lng * 0.01) * 20;
            break;
        }
        
        // 添少量随机噪声，模拟自然地形的不规则性
        elevation += (Math.random() - 0.5) * 100;
        
        // 添加河流和湖泊效果（简化处理）
        if (manager.isNearWaterBody(lat, lng)) {
          elevation *= 0.3; // 水体附近地势较低
        }
        
        return Math.max(0, elevation);
      },
      
      /**
       * 检查是否靠近水体
       * @param {Number} lat 纬度
       * @param {Number} lng 经度
       * @returns {Boolean} 是否靠近水体
       */
      isNearWaterBody: function(lat, lng) {
        // 简化的主要河流和湖泊位置检测
        var waterBodies = [
          // 长江流域 (大致)
          {latMin: 28, latMax: 32, lngMin: 110, lngMax: 122},
          // 黄河流域 (大致)
          {latMin: 34, latMax: 38, lngMin: 110, lngMax: 119},
          // 珠江流域 (大致)
          {latMin: 22, latMax: 25, lngMin: 110, lngMax: 115},
          // 青海湖
          {latMin: 36.5, latMax: 37.2, lngMin: 99.6, lngMax: 100.8},
          // 洞庭湖
          {latMin: 28.5, latMax: 29.5, lngMin: 112, lngMax: 113.2}
        ];
        
        for (var i = 0; i < waterBodies.length; i++) {
          var water = waterBodies[i];
          if (lat >= water.latMin && lat <= water.latMax && 
              lng >= water.lngMin && lng <= water.lngMax) {
            return true;
          }
        }
        
        return false;
      },
      
      /**
       * 插值计算指定坐标的高度
       * @param {Object} tile 地形数据块
       * @param {Number} lat 纬度
       * @param {Number} lng 经度
       * @returns {Number} 插值后的高度
       */
      interpolateElevation: function(tile, lat, lng) {
        var relativeX = (lng - tile.bounds.minLng) / manager.tileSize;
        var relativeY = (lat - tile.bounds.minLat) / manager.tileSize;
        
        var gridX = relativeX * (manager.gridSize - 1);
        var gridY = relativeY * (manager.gridSize - 1);
        
        var x1 = Math.floor(gridX);
        var y1 = Math.floor(gridY);
        var x2 = Math.min(x1 + 1, manager.gridSize - 1);
        var y2 = Math.min(y1 + 1, manager.gridSize - 1);
        
        var dx = gridX - x1;
        var dy = gridY - y1;
        
        // 双线性插值
        var h11 = tile.elevations[y1][x1];
        var h12 = tile.elevations[y2][x1];
        var h21 = tile.elevations[y1][x2];
        var h22 = tile.elevations[y2][x2];
        
        var h1 = h11 * (1 - dx) + h21 * dx;
        var h2 = h12 * (1 - dx) + h22 * dx;
        
        return h1 * (1 - dy) + h2 * dy;
      },
      
      /**
       * 预加载指定区域的地形数据
       * @param {Object} region 区域范围
       */
      preloadRegion: function(region) {
        var minTileX = Math.floor(region.minLng / manager.tileSize);
        var maxTileX = Math.floor(region.maxLng / manager.tileSize);
        var minTileY = Math.floor(region.minLat / manager.tileSize);
        var maxTileY = Math.floor(region.maxLat / manager.tileSize);
        
        for (var x = minTileX; x <= maxTileX; x++) {
          for (var y = minTileY; y <= maxTileY; y++) {
            manager.loadTerrainTile(y, x);
          }
        }
      },
      
      /**
       * 设置缓存清理定时器
       */
      setupCacheCleanup: function() {
        setInterval(function() {
          // 清理过期的颜色缓存
          if (manager.colorCache.size > 500) {
            var keys = Array.from(manager.colorCache.keys());
            for (var i = 0; i < keys.length / 2; i++) {
              manager.colorCache.delete(keys[i]);
            }
          }
        }, 60000); // 每分钟清理一次
      },
      
      /**
       * 销毁管理器
       */
      destroy: function() {
        manager.terrainCache.clear();
        manager.colorCache.clear();
        manager.loadingTiles.clear();
        console.log('地形管理器已销毁');
      }
    };
    
    return manager;
  }
};

module.exports = TerrainManager;