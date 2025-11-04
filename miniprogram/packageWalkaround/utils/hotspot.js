/**
 * 绕机检查热点检测工具
 * 功能：在Canvas上识别用户点击的区域
 * 算法：圆形热点检测，计算点击位置到圆心的距离
 *
 * 使用方法：
 * var manager = Hotspot.create(areas);
 * var normalized = Hotspot.normalizePoint(detail, width, height);
 * var hit = manager.hitTest(normalized);
 */

// 配置常量
var CONFIG = {
  DEFAULT_HOTSPOT_RADIUS: 0.04,  // 默认热点半径（归一化坐标）
  MIN_CANVAS_SIZE: 10            // 最小有效Canvas尺寸（像素）
};

function create(areas) {
  return {
    areas: areas || [],

    /**
     * 热点碰撞检测
     * @param {Object} point - 归一化坐标点 {x: 0-1, y: 0-1}
     * @return {Object|null} - 碰撞结果 {areaId, hotspot} 或 null
     */
    hitTest: function(point) {
      if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
        return null;
      }

      // 遍历所有区域的热点
      for (var i = 0; i < this.areas.length; i++) {
        var hotspot = this.areas[i].hotspot;
        if (!hotspot || typeof hotspot.cx !== 'number' || typeof hotspot.cy !== 'number') {
          continue;
        }

        // 计算点击位置到热点圆心的距离
        var dx = point.x - hotspot.cx;
        var dy = point.y - hotspot.cy;
        var distance = Math.sqrt(dx * dx + dy * dy);

        // 检查是否在热点半径内
        var radius = hotspot.r || CONFIG.DEFAULT_HOTSPOT_RADIUS;
        if (distance <= radius) {
          return {
            areaId: this.areas[i].id,
            hotspot: hotspot
          };
        }
      }

      return null;
    }
  };
}

/**
 * 归一化点击坐标
 * 将像素坐标转换为0-1范围的归一化坐标
 *
 * @param {Object} detail - 触摸事件detail对象
 * @param {number} width - Canvas宽度（像素）
 * @param {number} height - Canvas高度（像素）
 * @return {Object|null} - 归一化坐标 {x, y} 或 null（无效输入）
 */
function normalizePoint(detail, width, height) {
  // 验证输入参数
  if (!detail || typeof detail.x !== 'number' || typeof detail.y !== 'number') {
    console.warn('[Hotspot] 无效的触摸事件detail:', detail);
    return null;
  }

  // 验证Canvas尺寸
  if (!width || !height || width < CONFIG.MIN_CANVAS_SIZE || height < CONFIG.MIN_CANVAS_SIZE) {
    console.warn('[Hotspot] 无效的Canvas尺寸:', { width: width, height: height });
    return null;
  }

  // 归一化坐标
  var normalizedX = detail.x / width;
  var normalizedY = detail.y / height;

  // 验证归一化结果
  if (isNaN(normalizedX) || isNaN(normalizedY)) {
    console.warn('[Hotspot] 归一化坐标计算失败:', {
      detail: detail,
      width: width,
      height: height
    });
    return null;
  }

  return {
    x: normalizedX,
    y: normalizedY
  };
}

module.exports = {
  create: create,
  normalizePoint: normalizePoint,
  CONFIG: CONFIG
};


