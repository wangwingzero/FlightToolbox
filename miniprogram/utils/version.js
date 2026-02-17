/**
 * 自动生成的版本信息文件
 * 请勿手动修改此文件！
 * 由 scripts/generate-version.js 自动生成
 *
 * 更新方式：
 * 1. 修改 package.json 中的 version 字段
 * 2. 在 更新说明/ 目录添加对应版本的md文件
 * 3. 运行 npm run generate-version（或由CI自动执行）
 */

module.exports = {
  /** 应用版本号（来自package.json） */
  version: '2.16.0',

  /** 构建日期（自动生成） */
  buildDate: '2026-02-17',

  /** 更新内容摘要（来自更新说明目录） */
  changelog: '广告样式修复：移除广告容器的边框和圆角限制，解决腾讯审核导致的广告失效问题\n机场搜索优化：删除遮挡搜索结果的预览卡片，点击更顺畅\n界面更清爽：移除搜索时的加载提示文字，减少视觉干扰',

  /** 获取完整版本信息 */
  getVersionInfo: function() {
    return {
      version: this.version,
      buildDate: this.buildDate,
      changelog: this.changelog,
      fullVersion: this.version + ' (' + this.buildDate + ')'
    };
  }
};
