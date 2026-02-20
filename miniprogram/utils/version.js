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
  version: '2.17.0',

  /** 构建日期（自动生成） */
  buildDate: '2026-02-20',

  /** 更新内容摘要（来自更新说明目录） */
  changelog: '录音播放页全新设计：唱片封面风格，播放时旋转动画，看着更带感\n录音转发功能：新增「下载转发」按钮，可以把录音文件发给同事一起学习\n页面更清爽：移除录音列表页的下载横幅，界面更简洁\n清理开发工具：移除审计报告入口，减少无关功能干扰',

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
