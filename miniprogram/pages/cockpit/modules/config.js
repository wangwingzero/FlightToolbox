/**
 * 驾驶舱配置管理模块
 * 集中管理所有配置参数，便于维护和调整
 */

module.exports = {
  // GPS相关配置
  gps: {
    // GPS过滤参数
    maxReasonableSpeed: 600,    // 最大合理速度(kt)
    maxAcceleration: 50,        // 最大加速度(kt/s)
    speedBufferSize: 5,         // 速度缓冲区大小
    maxAnomalyCount: 3,         // 最大连续异常次数
    
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
    interferenceRecoveryTime: 30 * 60 * 1000,  // 30分钟自动恢复时间（毫秒）
    
    // 位置合理性检查
    minLocationInterval: 0.5,       // 最小位置更新间隔（秒）
    speedReasonableFactor: 1.5,     // 速度合理性检查倍数
    
    // 更新间隔
    locationUpdateInterval: 5000,   // 位置更新备用间隔（毫秒）
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
    // 航向平滑处理
    headingBufferSize: 15,          // 缓冲区大小
    headingBaseThreshold: 8,        // 基础变化阈值（度）
    headingLowSpeedThreshold: 20,   // 低速时的变化阈值（度）
    minHeadingUpdateInterval: 2000, // 最小更新间隔（毫秒）
    requiredStabilityCount: 5,      // 需要连续确认的次数
    
    // 航迹配置
    minSpeedForTrack: 3,            // 最小速度阈值（kt）
    
    // 指南针更新频率
    compassInterval: 'game',        // 使用游戏级更新频率
    
    // 稳定性检查参数
    fastStartupThreshold: 3,        // 快速启动数据量阈值
    stdDevThreshold: {
      lowSpeed: 15,                 // 低速时标准差阈值
      normalSpeed: 10               // 正常速度时标准差阈值
    },
    microAdjustInterval: 8000,      // 微调间隔（毫秒）
    lowSpeedDefinition: 3           // 低速定义（kt）
  },
  
  // 导航地图配置
  map: {
    // 缩放级别（海里）
    zoomLevels: [5, 10, 20, 40, 80, 160, 320, 640],
    defaultZoomIndex: 3,            // 默认缩放级别索引（40NM）
    
    // 地图更新
    updateInterval: 2000,           // 地图更新间隔（毫秒）
    blinkInterval: 400,             // 机场闪烁间隔（毫秒）
    
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
    pinchThreshold: 10              // 缩放手势阈值（像素）
  },
  
  // 机场相关配置
  airport: {
    searchLimit: 20,                // 搜索结果最大数量
    selectionLimit: 6,              // 选择弹窗最大显示数量
    rangeMultiplier: 1.2            // 显示范围倍数（留余量）
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
  
  // 性能优化配置
  performance: {
    // Canvas延迟初始化
    canvasInitDelay: 500,         // Canvas初始化延迟（毫秒）
    
    // 数据更新节流
    throttleInterval: 100         // 数据更新节流间隔（毫秒）
  }
};