/**
 * 航空数学工具函数
 * 供训练小游戏分包共享使用
 * ES5 语法
 */

/**
 * 航向归一化到 0-360
 * @param {number} hdg - 航向角度
 * @returns {number} 归一化后的航向 [0, 360)
 */
function normalizeHeading(hdg) {
  var h = hdg % 360;
  if (h < 0) h += 360;
  return h;
}

/**
 * 计算两个航向的最短角度差（带符号）
 * 正值 = 顺时针方向，负值 = 逆时针方向
 * @param {number} from - 起始航向
 * @param {number} to - 目标航向
 * @returns {number} 角度差 (-180, 180]
 */
function headingDiff(from, to) {
  var diff = normalizeHeading(to) - normalizeHeading(from);
  if (diff > 180) diff -= 360;
  if (diff <= -180) diff += 360;
  return diff;
}

/**
 * 风分量计算
 * @param {number} windDir - 风向（度，风从哪来）
 * @param {number} windSpd - 风速（节）
 * @param {number} heading - 飞机航向（度）
 * @returns {{ headwind: number, crosswind: number, driftAngle: number }}
 *   headwind > 0 为顶风，< 0 为顺风
 *   crosswind > 0 为右侧风，< 0 为左侧风
 *   driftAngle 偏流角（度）
 */
function windComponents(windDir, windSpd, heading) {
  var relAngle = (windDir - heading) * Math.PI / 180;
  var headwind = windSpd * Math.cos(relAngle);
  var crosswind = windSpd * Math.sin(relAngle);
  // 偏流角近似：arcsin(crosswind / groundspeed)
  // 简化：假设地速 ≈ 真空速（训练场景足够）
  var driftAngle = 0;
  if (windSpd > 0) {
    var sinDrift = crosswind / Math.max(windSpd * 3, 100); // 假设TAS约为风速3倍或至少100kt
    driftAngle = Math.asin(Math.max(-1, Math.min(1, sinDrift))) * 180 / Math.PI;
  }
  return {
    headwind: headwind,
    crosswind: crosswind,
    driftAngle: driftAngle
  };
}

/**
 * 判断等待航线进入类型
 *
 * 右等待（标准）：
 *   相对角度 0-110° → Direct（入航侧，非等待侧）
 *   相对角度 110-180° → Teardrop（出航侧，等待侧 70°）
 *   相对角度 180-290° → Parallel（出航侧，非等待侧 110°）
 *   相对角度 290-360° → Direct（入航侧，等待侧）
 *
 * 左等待：镜像翻转
 *
 * @param {number} heading - 飞机当前航向
 * @param {number} inboundCourse - 等待航线入航航迹
 * @param {boolean} isRightTurn - 是否右等待（默认 true）
 * @returns {{ type: string, relativeAngle: number, isBoundary: boolean }}
 */
function holdingEntryType(heading, inboundCourse, isRightTurn) {
  if (typeof isRightTurn === 'undefined') isRightTurn = true;

  // 相对角度 = (飞机航向 - inbound course + 360) % 360
  var rel = normalizeHeading(heading - inboundCourse);

  // 左等待时镜像：用 360 - rel 映射到右等待的扇区
  var effectiveRel = isRightTurn ? rel : normalizeHeading(360 - rel);

  var type;
  var isBoundary = false;
  var BOUNDARY_TOLERANCE = 5; // 边界容差 ±5°

  // 检查边界（110°: Direct/Teardrop, 180°: Teardrop/Parallel, 290°: Parallel/Direct）
  if (Math.abs(effectiveRel - 110) <= BOUNDARY_TOLERANCE) {
    isBoundary = true;
  }
  if (Math.abs(effectiveRel - 180) <= BOUNDARY_TOLERANCE) {
    isBoundary = true;
  }
  if (Math.abs(effectiveRel - 290) <= BOUNDARY_TOLERANCE) {
    isBoundary = true;
  }

  if (effectiveRel >= 110 && effectiveRel < 180) {
    type = 'teardrop';
  } else if (effectiveRel >= 180 && effectiveRel < 290) {
    type = 'parallel';
  } else {
    type = 'direct';
  }

  return {
    type: type,
    relativeAngle: rel,
    effectiveAngle: effectiveRel,
    isBoundary: isBoundary
  };
}

/**
 * 获取边界处可接受的答案列表
 * @param {number} heading
 * @param {number} inboundCourse
 * @param {boolean} isRightTurn
 * @returns {string[]} 可接受的进入类型数组
 */
function acceptableEntryTypes(heading, inboundCourse, isRightTurn) {
  var result = holdingEntryType(heading, inboundCourse, isRightTurn);
  var types = [result.type];

  if (result.isBoundary) {
    var eff = result.effectiveAngle;
    var TOL = 5;
    if (Math.abs(eff - 110) <= TOL) {
      if (types.indexOf('direct') === -1) types.push('direct');
      if (types.indexOf('teardrop') === -1) types.push('teardrop');
    }
    if (Math.abs(eff - 180) <= TOL) {
      if (types.indexOf('teardrop') === -1) types.push('teardrop');
      if (types.indexOf('parallel') === -1) types.push('parallel');
    }
    if (Math.abs(eff - 290) <= TOL) {
      if (types.indexOf('parallel') === -1) types.push('parallel');
      if (types.indexOf('direct') === -1) types.push('direct');
    }
  }

  return types;
}

module.exports = {
  normalizeHeading: normalizeHeading,
  headingDiff: headingDiff,
  windComponents: windComponents,
  holdingEntryType: holdingEntryType,
  acceptableEntryTypes: acceptableEntryTypes
};
