/**
 * 绕机检查图片库版本配置
 *
 * 说明：
 * - 此版本号用于参与生成绕机图片缓存 key（WALKAROUND_IMAGE_LIBRARY_VERSION）
 * - 构建脚本可以在发布前自动更新此值（例如使用图片数据的哈希或日期）
 * - 运行时不会自动变化，除非你在代码或构建脚本中手动修改
 */

// 默认绕机图片库版本（可由构建脚本在打包阶段覆盖）
var WALKAROUND_IMAGE_LIBRARY_VERSION = '2025-11-28-001';

module.exports = {
  WALKAROUND_IMAGE_LIBRARY_VERSION: WALKAROUND_IMAGE_LIBRARY_VERSION
};
