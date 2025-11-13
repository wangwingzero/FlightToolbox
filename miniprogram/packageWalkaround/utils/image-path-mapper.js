/**
 * 图片路径映射器
 * 用于绕机检查分包的图片路径统一管理
 *
 * 核心功能：
 * 1. 判断图片是否是共享图片（已迁移到packageWalkaroundImagesShared）
 * 2. 返回正确的图片路径（共享库或原分包）
 * 3. 支持渐进式迁移（可以逐步迁移图片）
 *
 * 使用示例：
 * var ImagePathMapper = require('../../utils/image-path-mapper.js');
 * var path = ImagePathMapper.getImagePath('slat', 5); // 返回共享库路径或原分包路径
 */

/**
 * 共享图片映射表
 * 键：图片文件名（不含.png后缀）
 * 值：共享库中的分类目录（engines/、gears/、wings/、common/）
 *
 * 🔥 迁移进度跟踪：
 * - ✅ 第一批（3个）：fuel_water_drain_valve, magnetic_fuel_level, slat
 * - ✅ 第二批（3个）：antennas, fuel_vent_overpressure_disc, static_dischargers
 * - ✅ 第三批（11个）：发动机相关
 * - ✅ 第四批（15个）：起落架相关
 * - ✅ 第五批（6个）：机翼和机身
 * - ✅ 总计：38个重复图片全部迁移完成
 */
var SHARED_IMAGES_MAP = {
  // ========== 第一批：高频重复图片（已迁移 ✅）==========

  // 🔥 重复4次 - 通用组件
  'fuel_water_drain_valve': 'common/',
  'magnetic_fuel_level': 'common/',

  // 🔥 重复4次 - 机翼相关
  'slat': 'wings/',

  // ========== 第二批：中频重复图片（已迁移 ✅）==========
  'antennas': 'common/',  // 重复3次
  'fuel_vent_overpressure_disc': 'common/',  // 重复3次
  'static_dischargers': 'common/',  // 重复3次

  // ========== 第三批：发动机相关（已迁移 ✅）==========
  'drain_mast_eng': 'engines/',
  'engine_inlet_eng': 'engines/',
  'engine_oil_filler_access_eng': 'engines/',
  'fan_cowl_door_eng': 'engines/',
  'idg_oil_fill_access': 'engines/',
  'master_chip_detector': 'engines/',
  'pressure_relief_access': 'engines/',
  'thrust_reverser_cowl_door_eng': 'engines/',
  'thrust_reverser_pivot_door': 'engines/',
  'turbine_exhaust_eng': 'engines/',
  'door_pivot_position_sensor_access': 'engines/',

  // ========== 第四批：起落架相关（已迁移 ✅）==========
  'brakes': 'gears/',
  'chocks': 'gears/',
  'control_surfaces': 'gears/',
  'downlock_springs': 'gears/',
  'hydraulic_lines': 'gears/',
  'landing_gear_structure': 'gears/',
  'main_wheels': 'gears/',
  'safety_pin': 'gears/',
  'ground_hydraulic_connection': 'gears/',
  'door_position_sensor_access': 'gears/',
  'jettison_outlet': 'gears/',
  'landing_light': 'gears/',
  'navigation_light': 'gears/',
  'strobe_light': 'gears/',
  'wing_fence': 'gears/',

  // ========== 第五批：机翼和机身（已迁移 ✅）==========
  'flaps': 'wings/',
  'outflow_valve': 'wings/',
  'refuel_coupling_door': 'wings/',
  'stabilizer': 'wings/',
  'surge_tank_air_inlet': 'common/',
  'drain_mast': 'common/'
};

/**
 * 共享库分包路径前缀
 */
var SHARED_PACKAGE_BASE_PATH = '/packageWalkaroundImagesShared/images/';

/**
 * 原分包路径配置（兼容旧版本）
 * 定义各区域范围对应的图片分包路径
 */
var ORIGINAL_IMAGE_PATH_CONFIG = {
  ranges: [
    { max: 4, path: '/packageWalkaroundImages1/images1/' },
    { max: 8, path: '/packageWalkaroundImages2/images2/' },
    { max: 12, path: '/packageWalkaroundImages3/images3/' },
    { max: 16, path: '/packageWalkaroundImages4/images4/' },
    { max: 20, path: '/packageWalkaroundImages5/images5/' },
    { max: 24, path: '/packageWalkaroundImages6/images6/' }
  ]
};

/**
 * 🔒 安全输入验证（2025-01-13新增）
 * 清理并验证componentId，防止路径遍历攻击
 *
 * @param {string} componentId - 组件ID（例如: 'slat'）
 * @returns {string} - 清理后的安全ID
 * @throws {Error} - 如果包含非法字符或为空
 */
function sanitizeComponentId(componentId) {
  // 1. 类型检查
  if (!componentId || typeof componentId !== 'string') {
    console.error('[Security] componentId必须是非空字符串:', componentId);
    throw new Error('Invalid componentId: must be a non-empty string');
  }

  // 2. 移除.png后缀
  var cleanId = componentId.replace(/\.png$/i, '');

  // 3. 白名单验证（只允许：字母、数字、下划线、连字符）
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanId)) {
    console.error('[Security] 非法componentId（包含非法字符）:', componentId);
    throw new Error('Invalid componentId: contains illegal characters');
  }

  // 4. 防止路径穿越
  if (cleanId.includes('..') || cleanId.includes('/') || cleanId.includes('\\')) {
    console.error('[Security] 检测到路径穿越尝试:', componentId);
    throw new Error('Path traversal detected');
  }

  // 5. 长度限制（防止DoS攻击）
  if (cleanId.length > 100) {
    console.error('[Security] componentId过长（最多100字符）:', componentId);
    throw new Error('componentId too long (max 100 chars)');
  }

  return cleanId;
}

/**
 * 判断组件ID对应的图片是否是共享图片
 * @param {string} componentId - 组件ID（例如: 'slat'）
 * @returns {boolean} - 如果是共享图片返回true，否则返回false
 */
function isSharedImage(componentId) {
  try {
    var cleanId = sanitizeComponentId(componentId);
    return SHARED_IMAGES_MAP.hasOwnProperty(cleanId);
  } catch (error) {
    console.error('[image-path-mapper] isSharedImage失败:', error.message);
    return false;  // 验证失败，返回false（降级到原分包）
  }
}

/**
 * 获取共享图片的完整路径
 * @param {string} componentId - 组件ID（例如: 'slat'）
 * @returns {string|null} - 共享库中的完整路径，如果不是共享图片返回null
 */
function getSharedImagePath(componentId) {
  try {
    var cleanId = sanitizeComponentId(componentId);
    var category = SHARED_IMAGES_MAP[cleanId];

    if (!category) {
      return null;
    }

    return SHARED_PACKAGE_BASE_PATH + category + cleanId + '.png';
  } catch (error) {
    console.error('[image-path-mapper] getSharedImagePath失败:', error.message);
    return null;  // 验证失败，返回null（降级到原分包）
  }
}

/**
 * 根据区域ID获取原分包的图片路径前缀（兼容旧版本）
 * @param {number} areaId - 区域ID
 * @returns {string} - 原分包图片路径前缀
 */
function getOriginalImagePathByArea(areaId) {
  for (var i = 0; i < ORIGINAL_IMAGE_PATH_CONFIG.ranges.length; i++) {
    if (areaId <= ORIGINAL_IMAGE_PATH_CONFIG.ranges[i].max) {
      return ORIGINAL_IMAGE_PATH_CONFIG.ranges[i].path;
    }
  }
  // 容错处理：如果区域ID超出配置范围，使用最后一个配置
  console.warn('[image-path-mapper] 区域ID超出配置范围:', areaId, '使用默认路径');
  return ORIGINAL_IMAGE_PATH_CONFIG.ranges[ORIGINAL_IMAGE_PATH_CONFIG.ranges.length - 1].path;
}

/**
 * 🔥 核心函数：获取图片完整路径（智能判断是否使用共享库）
 * 这是对外暴露的主要接口，替代原来的getImagePathByArea
 *
 * @param {string} componentId - 组件ID（例如: 'slat'）
 * @param {number} areaId - 区域ID（1-24）
 * @returns {string} - 图片完整路径
 *
 * @example
 * getImagePath('slat', 5)
 * // 如果slat是共享图片，返回: '/packageWalkaroundImagesShared/images/wings/slat.png'
 * // 如果slat不是共享图片，返回: '/packageWalkaroundImages2/images2/slat.png'
 */
function getImagePath(componentId, areaId) {
  try {
    // 步骤1：检查是否是共享图片
    var sharedPath = getSharedImagePath(componentId);
    if (sharedPath) {
      console.log('[image-path-mapper] ✅ 使用共享库图片:', componentId, '->', sharedPath);
      return sharedPath;
    }

    // 步骤2：如果不是共享图片，使用原分包路径
    var cleanId = sanitizeComponentId(componentId);
    var originalPathPrefix = getOriginalImagePathByArea(areaId);
    var fullPath = originalPathPrefix + cleanId + '.png';
    console.log('[image-path-mapper] 📦 使用分包图片:', componentId, '->', fullPath);
    return fullPath;
  } catch (error) {
    // 输入验证失败，返回默认占位图片
    console.error('[image-path-mapper] getImagePath失败:', error.message);
    console.error('[image-path-mapper] 降级使用默认图片，componentId:', componentId, 'areaId:', areaId);
    // 使用一个默认的占位路径
    return '/images/placeholder.png';
  }
}

/**
 * 获取图片路径前缀（兼容data-helpers.js的getImagePathByArea接口）
 * 这个函数保持原有接口不变，但内部已不推荐使用
 *
 * 🔧 迁移提示：
 * 建议使用 getImagePath(componentId, areaId) 替代 getImagePathByArea(areaId) + componentId + '.png'
 *
 * @param {number} areaId - 区域ID
 * @returns {string} - 图片路径前缀（保留兼容性，但不推荐继续使用）
 * @deprecated 建议使用getImagePath替代
 */
function getImagePathByArea(areaId) {
  console.warn('[image-path-mapper] ⚠️ getImagePathByArea已过时，建议使用getImagePath(componentId, areaId)');
  return getOriginalImagePathByArea(areaId);
}

/**
 * 获取共享图片统计信息（用于调试和监控）
 * @returns {Object} - 包含共享图片数量和分类统计
 */
function getSharedImagesStats() {
  var categories = {
    'engines/': 0,
    'gears/': 0,
    'wings/': 0,
    'common/': 0
  };

  var totalCount = 0;
  for (var key in SHARED_IMAGES_MAP) {
    if (SHARED_IMAGES_MAP.hasOwnProperty(key)) {
      totalCount++;
      var category = SHARED_IMAGES_MAP[key];
      if (categories.hasOwnProperty(category)) {
        categories[category]++;
      }
    }
  }

  return {
    totalCount: totalCount,
    categories: categories
  };
}

// 导出接口
module.exports = {
  // 核心接口（推荐使用）
  getImagePath: getImagePath,
  isSharedImage: isSharedImage,

  // 兼容接口（保留旧版本兼容性）
  getImagePathByArea: getImagePathByArea,
  getOriginalImagePathByArea: getOriginalImagePathByArea,

  // 调试接口
  getSharedImagePath: getSharedImagePath,
  getSharedImagesStats: getSharedImagesStats
};
