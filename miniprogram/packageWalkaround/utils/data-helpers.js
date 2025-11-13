/**
 * 数据处理辅助函数
 * 用于绕机检查分包的公共数据转换逻辑
 *
 * 🔥 2025-01-13 重大更新：引入图片路径映射器
 * - 支持共享图片库（packageWalkaroundImagesShared）
 * - 自动判断使用共享库或原分包路径
 * - 节省1.5-2MB存储空间（38个重复图片去重）
 */

// 🔥 引入图片路径映射器（2025-01-13新增）
var ImagePathMapper = require('./image-path-mapper.js');

/**
 * 🔧 已废弃：旧版图片路径配置（保留用于回滚）
 * 新版本使用ImagePathMapper.getImagePath()替代
 * @deprecated 已由ImagePathMapper替代
 */
var IMAGE_PATH_CONFIG = {
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
 * 🔧 已废弃：根据区域ID获取图片路径前缀
 * 新版本使用ImagePathMapper.getImagePath()替代getImagePathByArea() + componentId + '.png'
 *
 * @param {number} areaId - 区域ID
 * @return {string} - 图片路径前缀
 * @deprecated 建议使用ImagePathMapper.getImagePath(componentId, areaId)
 */
function getImagePathByArea(areaId) {
  // ⚠️ 保留旧版本接口兼容性，但建议迁移到ImagePathMapper
  console.warn('[data-helpers] getImagePathByArea已废弃，建议使用ImagePathMapper.getImagePath()');
  return ImagePathMapper.getOriginalImagePathByArea(areaId);
}

/**
 * 将检查项数据与组件信息合并
 * 🔥 2025-01-13 更新：使用ImagePathMapper智能判断图片路径
 *
 * @param {Array} checkItems - 原始检查项数组
 * @param {Object} ComponentCache - 组件缓存映射
 * @return {Array} - 合并后的检查项数组（包含组件信息和完整图片路径）
 */
function mapCheckItemsWithComponents(checkItems, ComponentCache) {
  return checkItems.map(function(item, index) {
    var component = ComponentCache[item.componentId];

    // 🔥 使用ImagePathMapper获取完整图片路径（自动判断共享库或原分包）
    var fullImagePath = ImagePathMapper.getImagePath(item.componentId, item.areaId);

    // 🔧 兼容性处理：拆分完整路径为路径前缀和文件名
    // 这样原有代码中的 item.imagePath + item.componentId + '.png' 仍然有效
    var lastSlashIndex = fullImagePath.lastIndexOf('/');
    var imagePath = fullImagePath.substring(0, lastSlashIndex + 1);

    return {
      id: item.id,
      areaId: item.areaId,
      sequence: index + 1,
      componentId: item.componentId,
      requirement_zh: item.requirement_zh,
      requirement_en: item.requirement_en || '',
      componentNameZh: component ? component.name_zh : '',
      componentNameEn: component ? component.name_en : '',
      componentFunctionZh: component ? component.function_zh : '',
      imagePath: imagePath,  // 🔥 图片路径前缀（已支持共享库）
      fullImagePath: fullImagePath  // 🔥 新增：完整图片路径（用于调试）
    };
  });
}

module.exports = {
  mapCheckItemsWithComponents: mapCheckItemsWithComponents,
  getImagePathByArea: getImagePathByArea
};
