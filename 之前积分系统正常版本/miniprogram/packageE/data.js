/**
 * packageE 数据导出文件
 * 用于统一导出规范性文件数据
 */

// 导入规范性文件数据
var normativeModule = require('./normative.js');

// 导出数据
module.exports = {
  normativeData: normativeModule.normativeData || normativeModule.data || normativeModule.normative || [],
  dataInfo: normativeModule.dataInfo || {}
};