/**
 * 地形数据存储格式和分包结构设计
 * 
 * 设计目标：
 * - 离线优先：所有地形数据本地存储
 * - 小程序限制：单分包不超过2MB，总包不超过20MB
 * - 快速访问：按地理网格分块，支持快速查询
 * - 内存优化：按需加载，LRU缓存管理
 * - 精度平衡：满足航空需求而不占用过多空间
 */

/**
 * 地形数据分包结构设计
 * 
 * 分包策略：
 * - 按经纬度网格划分，每个分包覆盖4°x4°区域
 * - 中国境内重点覆盖：18个分包覆盖主要航空区域
 * - 数据精度：30弧秒（约900米）网格分辨率
 * - 每分包大小：约1.5MB，包含高度数据和索引
 */

var TerrainDataStructure = {
  /**
   * 地形分包配置
   */
  terrainPackages: {
    'terrain_north_china': {
      id: 'terrain_north_china',
      name: '华北地区地形数据',
      bounds: {
        minLat: 36, maxLat: 42,
        minLng: 114, maxLng: 120
      },
      priority: 1, // 最高优先级（首都机场、天津滨海等）
      size: '1.4MB'
    },
    'terrain_east_china': {
      id: 'terrain_east_china',
      name: '华东地区地形数据',
      bounds: {
        minLat: 28, maxLat: 35,
        minLng: 118, maxLng: 124
      },
      priority: 1, // 最高优先级（上海浦东、虹桥等）
      size: '1.6MB'
    },
    'terrain_south_china': {
      id: 'terrain_south_china',
      name: '华南地区地形数据', 
      bounds: {
        minLat: 20, maxLat: 26,
        minLng: 110, maxLng: 116
      },
      priority: 1, // 最高优先级（广州白云、深圳宝安等）
      size: '1.3MB'
    },
    'terrain_southwest_china': {
      id: 'terrain_southwest_china',
      name: '西南地区地形数据',
      bounds: {
        minLat: 26, maxLat: 32,
        minLng: 102, maxLng: 108
      },
      priority: 2, // 高优先级（成都双流、重庆江北等）
      size: '1.8MB' // 山区数据较复杂
    },
    'terrain_northwest_china': {
      id: 'terrain_northwest_china', 
      name: '西北地区地形数据',
      bounds: {
        minLat: 32, maxLat: 40,
        minLng: 104, maxLng: 112
      },
      priority: 3, // 中等优先级
      size: '1.5MB'
    }
    // 可根据需要添加更多区域...
  },

  /**
   * 地形数据文件格式
   * 每个地形块的数据结构
   */
  terrainTileFormat: {
    // 文件头信息
    header: {
      version: '1.0',
      tileId: 'string', // 格式：'lat_lng' (如: '39_116')
      bounds: {
        minLat: 'number',
        maxLat: 'number', 
        minLng: 'number',
        maxLng: 'number'
      },
      resolution: 'number', // 弧秒精度 (30)
      gridSize: 'number',   // 网格大小 (480 = 4度/30弧秒)
      dataPoints: 'number', // 数据点总数
      compressionType: 'string', // 压缩类型 'delta' | 'rle'
      checksum: 'string'    // 数据校验和
    },
    
    // 高度数据数组 (压缩存储)
    elevations: {
      type: 'compressed_array',
      format: 'delta_encoded', // 差分编码减少存储空间
      baseElevation: 'number', // 基准高度
      deltaValues: 'array',    // 差分值数组 (16位整数)
      description: '按行优先顺序存储，每个值表示相对于基准高度的差值'
    },

    // 快速查询索引
    index: {
      type: 'quadtree_index',
      description: '四叉树索引加速区域查询',
      nodes: 'array' // 索引节点数组
    },

    // 关键地标信息（可选）
    landmarks: {
      type: 'array',
      items: {
        name: 'string',
        lat: 'number',
        lng: 'number', 
        elevation: 'number',
        type: 'string' // 'peak' | 'valley' | 'airport' | 'city'
      }
    }
  },

  /**
   * 数据压缩算法示例
   */
  compressionExample: {
    // 原始高度数据 (4字节/点)
    rawData: [1250, 1255, 1260, 1245, 1240, 1238, 1242, 1250],
    
    // 差分编码后 (2字节/点)
    compressedData: {
      baseElevation: 1250,
      deltaValues: [0, 5, 10, -5, -10, -2, 4, 8]
    },
    
    compressionRatio: '50%', // 节省50%存储空间
    description: '适用于地形高度变化相对平缓的区域'
  },

  /**
   * 分包预加载策略
   */
  preloadStrategy: {
    // 启动时预加载
    onAppStart: [
      'terrain_north_china',  // 华北（北京周边）
      'terrain_east_china',   // 华东（上海周边）
      'terrain_south_china'   // 华南（广州深圳周边）
    ],
    
    // 按需加载
    onDemand: [
      'terrain_southwest_china',
      'terrain_northwest_china'
      // 其他区域...
    ],
    
    // 缓存管理
    cachePolicy: {
      maxCachedTiles: 20,     // 最多缓存20个地形块
      evictionPolicy: 'LRU',  // 最近最少使用
      persistDuration: '1h'   // 1小时后可被回收
    }
  },

  /**
   * 地形数据生成工具配置
   */
  dataGenerationConfig: {
    sourceData: {
      type: 'SRTM', // Shuttle Radar Topography Mission
      resolution: '30arc-second',
      coverage: 'China_mainland',
      dataSource: 'https://www2.jpl.nasa.gov/srtm/'
    },
    
    processingSteps: [
      '1. 下载SRTM原始数据',
      '2. 按经纬度网格切分',
      '3. 重采样到30弧秒精度',
      '4. 差分编码压缩',
      '5. 生成四叉树索引',
      '6. 打包为小程序分包格式'
    ],
    
    qualityControl: {
      elevationRange: {
        min: -100,  // 最低海拔（米）
        max: 8850   // 最高海拔（珠峰）
      },
      dataValidation: [
        '异常值检测和平滑',
        '边界连续性检查',
        '压缩前后精度验证'
      ]
    }
  },

  /**
   * API接口设计
   */
  apiInterface: {
    // 加载地形数据
    loadTerrainData: {
      method: 'loadTerrainPackage',
      params: {
        packageId: 'string',
        priority: 'number'
      },
      returns: 'Promise<TerrainPackage>'
    },
    
    // 查询高度
    queryElevation: {
      method: 'getElevation',
      params: {
        lat: 'number',
        lng: 'number'
      },
      returns: 'number', // 高度（米）
      performance: '< 1ms' // 查询性能目标
    },
    
    // 批量查询
    batchQuery: {
      method: 'getElevationBatch',
      params: {
        coordinates: 'Array<{lat, lng}>',
        maxBatchSize: 1000
      },
      returns: 'Array<number>',
      performance: '< 10ms' // 批量查询性能目标
    }
  }
};

/**
 * 实际地形数据包示例
 * 以北京地区为例的数据结构
 */
var BeijingTerrainExample = {
  header: {
    version: '1.0',
    tileId: '39_116',
    bounds: {
      minLat: 39.0,
      maxLat: 40.0,
      minLng: 116.0, 
      maxLng: 117.0
    },
    resolution: 30, // 30弧秒
    gridSize: 120,  // 1度/30弧秒 = 120格
    dataPoints: 14400, // 120 * 120
    compressionType: 'delta',
    checksum: 'sha256:a1b2c3d4...'
  },
  
  elevations: {
    baseElevation: 50, // 北京平均海拔约50米
    deltaValues: new Int16Array([
      // 差分编码的高度数据
      0, 2, 1, -1, 3, 5, 8, 12, 15, 18, // 第一行10个点
      -2, 0, 1, 2, 4, 7, 11, 14, 17, 20, // 第二行
      // ... 继续14390个数据点
    ])
  },
  
  landmarks: [
    {
      name: '首都机场',
      lat: 40.0801,
      lng: 116.5846,
      elevation: 35,
      type: 'airport'
    },
    {
      name: '香山',
      lat: 39.9925,
      lng: 116.1873, 
      elevation: 575,
      type: 'peak'
    }
  ]
};

module.exports = {
  TerrainDataStructure: TerrainDataStructure,
  BeijingTerrainExample: BeijingTerrainExample
};