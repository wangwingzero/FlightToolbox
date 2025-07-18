// 数据统一导出文件
const japanData = require('./regions/japan.js');
const philippinesData = require('./regions/philippines.js');

module.exports = {
  regions: {
    japan: japanData,
    philippines: philippinesData
    // 未来可以轻松添加：
    // europe: require('./regions/europe.js'),
    usa: require('./regions/america.js'),
    // australia: require('./regions/australia.js')
  }
};