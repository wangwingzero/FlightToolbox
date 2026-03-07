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
  version: '3.1.1',

  /** 构建日期（自动生成） */
  buildDate: '2026-03-07',

  /** 更新内容摘要（来自更新说明目录） */
  changelog: '修复绕机检查点击：修复了绕机检查页面点击飞机图上数字位置无法弹出对应区域的问题，现在24个位置全部可以正常点击了\n补全部件信息：补充了28个天线、排水桅杆等部件的中英文名称和功能说明，原来部分区域显示的部件数和实际不一致，现在对上了',

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
