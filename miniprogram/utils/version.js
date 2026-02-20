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
  version: '3.0.0',

  /** 构建日期（自动生成） */
  buildDate: '2026-02-20',

  /** 更新内容摘要（来自更新说明目录） */
  changelog: '机场数据大扩容：从7400多个增加到8000多个，覆盖更多全球商业机场，还补上了时区信息\n机场数据自动更新：联网时自动同步最新机场数据，不用等小程序发版也能拿到新机场\n法规PDF下载更靠谱：优先从局方官网下载，找不到时自动切换备用源，飞行模式也有兜底\n录音播放页全新设计：唱片封面风格，播放时旋转动画，看着更带感\n录音转发功能：新增「下载转发」按钮，可以把录音文件发给同事一起学习',

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
