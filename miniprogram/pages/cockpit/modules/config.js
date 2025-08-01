/**
 * 驾驶舱配置管理模块
 * 集中管理所有配置参数，便于维护和调整
 */

module.exports = {
  // 🔧 调试和开发配置
  debug: {
    enableVerboseLogging: false,    // 详细日志开关 - 设为false减少控制台输出
    enablePerformanceLogging: false, // 性能日志开关
    enableFrequentUpdates: false,    // 频繁更新日志开关
    logInterval: 5000               // 日志输出间隔（毫秒）
  },
  
  // GPS相关配置
  gps: {
    // 坐标系配置
    coordinateSystem: 'wgs84',  // 坐标系: 'gcj02'(火星坐标) | 'wgs84'(GPS坐标)
    showCoordinateSystem: false, // 关闭坐标系显示，WGS84为默认标准
    
    // GPS过滤参数
    maxReasonableSpeed: 600,    // 最大合理速度(kt)
    maxAcceleration: 30,        // 最大加速度(kt/s) - 降低以减少跳变
    speedBufferSize: 8,         // 速度缓冲区大小 - 增加以提高平滑度
    maxAnomalyCount: 2,         // 最大连续异常次数 - 降低以提高敏感度
    staticSpeedThreshold: 2,    // 静止检测速度阈值(kt) - 新增
    staticDistanceThreshold: 8, // 静止检测距离阈值(m) - 新增
    
    // 位置历史记录
    maxHistorySize: 10,         // 位置历史最大保存数量
    
    // 高度异常检测参数
    altitudeChangeThreshold: 200,  // 绝对变化阈值（米/秒）
    altitudeRateThreshold: 100,    // 垂直速度阈值（米/秒）
    minValidAltitude: -500,         // 最低有效高度（米）
    maxValidAltitude: 15000,        // 最高有效高度（米）
    altitudeStdDevMultiplier: 3,   // 标准差倍数
    minDataForStats: 10,            // 计算统计数据所需的最小数据量
    maxAltitudeHistory: 20,         // 最大历史记录数
    maxAltitudeAnomaly: 5,          // 触发干扰所需的连续异常次数
    requiredNormalCount: 10,        // 解除干扰所需的连续正常次数
    
    // GPS干扰处理
    interferenceRecoveryTime: 10 * 60 * 1000,  // 10分钟自动恢复时间（毫秒）
    
    // 位置合理性检查
    minLocationInterval: 1.0,       // 最小位置更新间隔（秒）- 增加以减少噪声
    speedReasonableFactor: 1.2,     // 速度合理性检查倍数 - 降低以更严格
    
    // 更新间隔
    locationUpdateInterval: 3000,   // 位置更新备用间隔（毫秒）- 降低更新频率
    locationFallbackInterval: 3000, // 失败时的降级间隔（毫秒）
    statusCheckInterval: 10000,     // GPS状态检查间隔（毫秒）
    highAccuracyExpireTime: 4000,   // 高精度GPS超时时间（毫秒）
    
    // GPS状态阈值
    signalLossThreshold: 30,        // GPS信号丢失阈值（秒）
    weakSignalThreshold: 15,        // GPS信号弱阈值（秒）
    accuracyThreshold: 50,          // GPS精度阈值（米）
    maxVerticalSpeed: 6000          // 最大垂直速度（英尺/分钟）
  },
  
  // 航向/指南针配置
  compass: {
    // 🔧 航向偏移修正（删除90度偏差）
    headingOffset: 0,               // 航向偏移角度（度）- 删除额外的90度偏移
    
    // 航向平滑处理
    headingBufferSize: 25,          // 缓冲区大小 - 增加以提高稳定性
    headingBaseThreshold: 12,       // 基础变化阈值（度）- 增加以降低敏感性
    headingLowSpeedThreshold: 25,   // 低速时的变化阈值（度）- 增加
    minHeadingUpdateInterval: 3000, // 最小更新间隔（毫秒）- 增加
    requiredStabilityCount: 8,      // 需要连续确认的次数 - 增加
    
    // 航迹配置
    minSpeedForTrack: 5,            // 最小速度阈值（kt）- 增加以避免低速时的噪声
    
    // 指南针更新频率
    compassInterval: 'ui',          // 使用UI级更新频率 - 从'game'改为'ui'降低频率
    
    // 稳定性检查参数
    fastStartupThreshold: 5,        // 快速启动数据量阈值 - 增加
    stdDevThreshold: {
      lowSpeed: 20,                 // 低速时标准差阈值 - 增加以降低敏感性
      normalSpeed: 12               // 正常速度时标准差阈值 - 增加
    },
    microAdjustInterval: 15000,     // 微调间隔（毫秒）- 增加以减少频繁更新
    lowSpeedDefinition: 5           // 低速定义（kt）- 增加以匹配minSpeedForTrack
  },
  
  // 导航地图配置
  map: {
    // 缩放级别（海里）
    zoomLevels: [5, 10, 20, 40, 80, 160, 320, 640],
    defaultZoomIndex: 3,            // 默认缩放级别索引（40NM）
    
    // 地图更新（优化后：提高流畅度）
    updateInterval: 100,            // 地图更新间隔（毫秒）- 从500ms优化为100ms，大幅提升实时性
    blinkInterval: 300,             // 机场闪烁间隔（毫秒）- 从400ms优化为300ms
    
    // 地图定向
    headingUpdateThreshold: 15,     // 地图航向更新阈值（度）
    lowSpeedThreshold: 5,           // 低速阈值（kt）
    headingUpdateMinInterval: 3000, // 地图航向更新最小间隔（毫秒）
    
    // 显示设置
    maxNearbyAirports: 20,          // 最多显示的附近机场数
    rangeRings: 4,                  // 距离圈数量
    airportBlinkCycle: 800,         // 机场闪烁周期（毫秒）
    
    // Canvas绘制参数
    radiusRatio: 0.4,               // 地图半径与Canvas尺寸的比例
    
    // 手势缩放
    pinchThreshold: 10,             // 缩放手势阈值（像素）
    
    // 手势控制配置
    tapThreshold: 10,               // 点击识别阈值（像素）
    enableMapDrag: false,           // 禁用地图拖拽功能
    simplifiedGesture: true         // 启用简化手势处理（只保留缩放和点击）
  },
  
  // 机场相关配置
  airport: {
    searchLimit: 20,                // 搜索结果最大数量
    selectionLimit: 6,              // 选择弹窗最大显示数量
    rangeMultiplier: 1.2,           // 显示范围倍数（留余量）
    
    // 机场追踪指示符配置
    trackingIndicator: {
      enabled: true,                // 启用追踪指示符
      showOnRangeRing: true,        // 在距离圈边缘显示
      triangleSize: 8,              // 三角形大小（像素）
      color: '#ff9500',             // 指示符颜色（橙色）
      textColor: '#ff9500',         // 方位角文字颜色
      fontSize: 12,                 // 方位角文字大小
      textOffset: 15,               // 文字距离三角形的偏移
      blinkInterval: 800,           // 闪烁间隔（毫秒）
      showBearing: true,            // 显示方位角数值
      bearingFormat: '000°'         // 方位角格式（3位数+度符号）
    }
  },
  
  // 离线模式配置
  offline: {
    // 模拟数据（北京坐标）
    simulatedData: {
      latitude: 39.9042,
      longitude: 116.4074,
      altitude: 118,  // 约400英尺
      speed: 0,
      heading: 360,
      verticalSpeed: 0
    }
  },
  
  // UI配置
  ui: {
    // Toast显示时长
    toastDuration: {
      short: 1500,
      normal: 2000,
      long: 3000
    },
    
    // 颜色主题
    colors: {
      primary: '#00ff88',        // 主色调（绿色）
      secondary: '#00b4ff',      // 次要色调（蓝色）
      warning: '#ffff00',        // 警告色（黄色）
      heading: '#9966ff',        // 航向色（紫色）
      danger: '#ff0000',         // 危险色（红色）
      background: '#000000',     // 背景色（黑色）
      text: '#ffffff',           // 文字色（白色）
      textSecondary: 'rgba(255, 255, 255, 0.5)'  // 次要文字色
    },
    
    // 字体大小
    fontSize: {
      small: 8,
      normal: 11,
      medium: 12,
      large: 14
    }
  },
  
  // 性能优化配置（更新：提升响应性能）
  performance: {
    // Canvas延迟初始化
    canvasInitDelay: 300,         // Canvas初始化延迟（毫秒）- 从500ms优化为300ms
    
    // 数据更新节流
    throttleInterval: 50,         // 数据更新节流间隔（毫秒）- 从100ms优化为50ms
    
    // 新增：渲染优化参数
    renderOptimization: {
      enableSmartRender: true,    // 启用智能渲染（仅在数据变化时渲染）
      maxRenderFPS: 30,           // 最大渲染帧率
      trackingThreshold: 0.5      // 航迹变化检测阈值（度）- 从2度降低到0.5度，提高灵敏度
    }
  },
  
  // 数据滤波配置
  kalman: {
    // 滤波策略配置
    enabled: false,               // 🔧 临时禁用复杂卡尔曼滤波
    fallbackToSimple: true,       // 🔧 启用简化滤波降级模式
    autoDisableOnError: true,     // 🔧 错误时自动禁用复杂滤波器
    maxFailureCount: 3,           // 🔧 最大失败次数阈值
    
    // 滤波器选择说明：
    // - 复杂卡尔曼滤波：理论先进但可能不稳定
    // - 简化滤波：稳定可靠，足够满足大多数需求
    
    // 初始状态配置
    initialState: {
      // 第二阶段：6状态模型 [lat, lon, vn, ve, heading, heading_bias]
      position: [39.9042, 116.4074], // 默认北京坐标
      velocity: [0, 0],               // 初始北向、东向速度 (m/s)
      heading: 0,                     // 初始航向角 (度)
      headingBias: 0                  // 初始航向偏差 (度)
    },
    
    // 初始协方差配置 (状态不确定度) - 修复为10维状态向量
    initialCovariance: [
      25,     // 纬度方差 (约5m标准差)
      25,     // 经度方差 (约5m标准差)  
      100,    // 高度方差 (10m标准差)
      1,      // 北向速度方差 (1m/s标准差)
      1,      // 东向速度方差 (1m/s标准差)
      1,      // 垂直速度方差 (1m/s标准差)
      9,      // 航向方差 (3°标准差)
      9,      // 航迹方差 (3°标准差)
      0.01,   // 航向偏差方差 (0.1°标准差)
      4       // GPS位置偏差方差 (2m标准差)
    ],
    
    // 过程噪声配置 (系统动态不确定性) - 进一步优化为更保守的值
    processNoise: {
      positionVariance: 0.01,      // 位置过程噪声进一步减小，避免过度波动
      velocityVariance: 0.1,       // 速度过程噪声进一步减小，提高稳定性
      altitudeVariance: 0.5,       // 高度过程噪声进一步减小
      headingVariance: 0.001,      // 航向过程噪声进一步减小，大大提高航向稳定性
      headingBiasVariance: 0.00001 // 航向偏差过程噪声进一步减小
    },
    
    // 测量噪声配置 (传感器精度) - 调整为更现实的值
    measurementNoise: {
      gpsPosition: 100,            // GPS位置噪声方差增大 (10m标准差)
      gpsVelocity: 4,              // GPS速度噪声方差增大 (2m/s标准差)
      gpsAltitude: 400,            // GPS高度噪声方差增大 (20m标准差)
      compassHeading: 100          // 指南针噪声方差增大 (10°标准差)
    },
    
    // 自适应调整参数
    adaptiveThresholds: {
      innovationGate: 50.0,        // 新息门限调整为50，进一步避免频繁异常检测
      convergenceThreshold: 0.01,  // 滤波器收敛判据
      divergenceThreshold: 100,    // 发散检测阈值
      minUpdateInterval: 200       // 最小更新间隔 (毫秒) - 降低更新频率
    },
    
    // 更新频率控制 (基于飞行速度自适应)
    updateRates: {
      stationary: 1000,    // 静止时更新间隔 (1Hz)
      lowSpeed: 500,       // 低速时更新间隔 (2Hz)
      normalSpeed: 200,    // 正常速度更新间隔 (5Hz)
      highSpeed: 100       // 高速时更新间隔 (10Hz)
    },
    
    // 速度阈值定义 (节)
    speedThresholds: {
      stationary: 3,       // 静止阈值
      lowSpeed: 50,        // 低速阈值
      normalSpeed: 150     // 正常速度阈值
    },
    
    // 性能优化配置
    performance: {
      maxComputeTime: 50,          // 最大允许计算时间 (毫秒)
      batchUpdateSize: 3,          // 批处理更新大小
      matrixCacheSize: 10,         // 矩阵缓存大小
      enableOptimization: true     // 启用性能优化
    },
    
    // 故障处理配置
    fault: {
      maxConsecutiveFailures: 5,   // 最大连续失败次数
      resetOnFailure: true,        // 失败时自动重置
      fallbackToClassic: true,     // 降级到经典滤波
      recoveryTimeout: 30000       // 故障恢复超时 (毫秒)
    },
    
    // 调试和诊断配置
    debug: {
      enableLogging: true,         // 启用详细日志
      logInnovation: false,        // 记录新息信息
      logPerformance: true,        // 记录性能指标
      saveHistory: false           // 保存历史数据 (调试用)
    }
  },


  toast: {
    // Toast类型和频率控制
    types: {
      GPS_INTERFERENCE: {
        priority: 'high',           // 高优先级
        minInterval: 30000,         // 30秒最小间隔
        showOnChange: true,         // 状态变化时显示
        maxRetries: 3               // 最大重试提示次数
      },
      GPS_OFFLINE: {
        priority: 'medium',
        minInterval: 0,             // 无时间限制，仅状态变化显示
        showOnChange: true,         // 只在在线/离线切换时显示
        persistentState: true       // 持续状态，不重复提示
      },
      GPS_SIGNAL_WEAK: {
        priority: 'low',
        minInterval: 60000,         // 60秒间隔
        showOnChange: true,
        maxRetries: 2
      },
      COMPASS_RETRY: {
        priority: 'low',
        minInterval: 120000,        // 2分钟间隔，避免频繁重试提示
        showOnChange: false,        // 不基于状态变化
        maxRetries: 1               // 最多提示1次重试
      },
      COMPASS_ERROR: {
        priority: 'medium',
        minInterval: 60000,         // 60秒间隔
        showOnChange: true,
        maxRetries: 2
      },
      COMPASS_FALLBACK: {
        priority: 'medium',
        minInterval: 0,             // 立即显示降级提示
        showOnChange: true,
        persistentState: true       // 降级状态不重复提示
      },
      NETWORK_STATUS: {
        priority: 'low',
        minInterval: 0,             // 无时间限制
        showOnChange: true,         // 仅网络状态变化时显示
        persistentState: true       // 网络状态持续期间不重复
      },
      GPS_PERMISSION: {
        priority: 'high',
        minInterval: 30000,         // 30秒间隔
        showOnChange: true,
        maxRetries: 5
      },
      GPS_SPEED_ANOMALY: {
        priority: 'medium',
        minInterval: 45000,         // 45秒间隔，避免频繁速度异常提示
        showOnChange: false,
        maxRetries: 3
      },
      ATTITUDE_SENSOR_ERROR: {
        priority: 'medium',
        minInterval: 30000,         // 30秒间隔
        showOnChange: true,
        maxRetries: 3
      }
    },

    // 全局Toast行为设置
    global: {
      enableIntelligent: true,      // 启用智能Toast管理
      suppressDuplicates: true,     // 抑制重复内容
      maxConcurrent: 1,             // 最大同时显示数量
      defaultDuration: 2000,        // 默认显示时长
      debugMode: false              // 调试模式（显示toast统计）
    },

    // 状态恢复提示
    recovery: {
      GPS_NORMAL: 'GPS信号已恢复',
      COMPASS_NORMAL: '指南针已正常工作',
      NETWORK_ONLINE: '网络已连接',
      GPS_ACCURACY_GOOD: 'GPS精度已改善',
      ATTITUDE_SENSOR_NORMAL: '姿态传感器已恢复正常'
    }
  }
};