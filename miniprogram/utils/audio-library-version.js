/**
 * 音频库版本配置
 *
 * 说明：
 * - 此版本号用于参与生成音频缓存 key（AUDIO_LIBRARY_VERSION）
 * - 构建脚本可以在发布前自动更新此值（例如使用音频数据的哈希或日期）
 * - 运行时不会自动变化，除非你在代码或构建脚本中手动修改
 */

// 默认音频库版本（可由构建脚本在打包阶段覆盖）
var AUDIO_LIBRARY_VERSION = '2025-11-28-001';

module.exports = {
  AUDIO_LIBRARY_VERSION: AUDIO_LIBRARY_VERSION
};
