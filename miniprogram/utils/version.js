/**
 * 自动生成的版本信息文件
 * 请勿手动修改此文件！
 * 由 scripts/generate-version.js 自动生成
 *
 * 更新方式：
 * 1. 修改 package.json 中的 version 字段
 * 2. 运行 npm run generate-version
 */

module.exports = {
  /** 应用版本号（来自package.json） */
  version: '1.0.0',

  /** 构建日期（自动生成） */
  buildDate: '2025-10-19',

  /** 获取完整版本信息 */
  getVersionInfo: function() {
    return {
      version: this.version,
      buildDate: this.buildDate,
      fullVersion: this.version + ' (' + this.buildDate + ')'
    };
  }
};
