/**
 * 数据处理辅助函数
 * 用于绕机检查分包的公共数据转换逻辑
 */

/**
 * 图片路径配置
 * 定义各区域范围对应的图片分包路径
 * 未来添加新机型时，只需修改此配置即可
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
 * 根据区域ID获取图片路径前缀
 * @param {number} areaId - 区域ID
 * @return {string} - 图片路径前缀
 */
function getImagePathByArea(areaId) {
  for (var i = 0; i < IMAGE_PATH_CONFIG.ranges.length; i++) {
    if (areaId <= IMAGE_PATH_CONFIG.ranges[i].max) {
      return IMAGE_PATH_CONFIG.ranges[i].path;
    }
  }
  // 容错处理：如果区域ID超出配置范围，使用最后一个配置
  console.warn('[data-helpers] 区域ID超出配置范围:', areaId, '使用默认路径');
  return IMAGE_PATH_CONFIG.ranges[IMAGE_PATH_CONFIG.ranges.length - 1].path;
}

/**
 * 将检查项数据与组件信息合并
 * @param {Array} checkItems - 原始检查项数组
 * @param {Object} ComponentCache - 组件缓存映射
 * @return {Array} - 合并后的检查项数组（包含组件信息）
 */
function mapCheckItemsWithComponents(checkItems, ComponentCache) {
  return checkItems.map(function(item, index) {
    var component = ComponentCache[item.componentId];
    var imagePath = getImagePathByArea(item.areaId);

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
      imagePath: imagePath  // 新增：图片路径前缀
    };
  });
}

module.exports = {
  mapCheckItemsWithComponents: mapCheckItemsWithComponents,
  getImagePathByArea: getImagePathByArea
};
