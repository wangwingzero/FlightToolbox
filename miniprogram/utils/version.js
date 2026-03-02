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
  version: '3.1.0',

  /** 构建日期（自动生成） */
  buildDate: '2026-03-02',

  /** 更新内容摘要（来自更新说明目录） */
  changelog: '一键更新：首页新增一键更新按钮，点一下就能把绕机图片、航线录音、法规数据、机场数据全部更新到最新（不含PDF原文）\n修复计算工具页面：修复了计算工具页面不显示模块列表的问题，现在可以正常使用所有计算工具了\n移除 VOR 追踪训练：移除了推针尖拉针尾（VOR 追踪）训练模块\n马年祝福：祝各位飞行平安顺利！🐴✈️',

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
