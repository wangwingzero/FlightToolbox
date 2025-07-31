/**
 * 测试机场数据加载
 * 用于调试机场标记显示问题
 */

// 导入机场数据
var airports = require('./packageC/airportdata.js');

console.log('=== 机场数据测试开始 ===');
console.log('🔍 机场数据导入检查:', {
  'airports类型': typeof airports,
  '是否为数组': Array.isArray(airports),
  '数据长度': airports ? airports.length : 0
});

if (airports && Array.isArray(airports) && airports.length > 0) {
  console.log('✅ 机场数据导入成功');
  console.log('📊 数据统计:', {
    '总机场数': airports.length,
    '前3个机场': airports.slice(0, 3).map(function(airport) {
      return {
        'ICAO': airport.ICAOCode,
        '名称': airport.ShortName || airport.EnglishName,
        '坐标': airport.Latitude + ',' + airport.Longitude
      };
    })
  });
  
  // 检查有效机场数据
  var validAirports = airports.filter(function(airport) {
    return airport && airport.Latitude && airport.Longitude && 
           airport.ICAOCode && (airport.ShortName || airport.EnglishName);
  });
  
  console.log('📋 数据质量检查:', {
    '原始数据': airports.length,
    '有效数据': validAirports.length,
    '数据完整率': ((validAirports.length / airports.length) * 100).toFixed(2) + '%'
  });
  
  // 测试标记生成
  var testMarkers = validAirports.slice(0, 5).map(function(airport, index) {
    return {
      id: index,
      latitude: parseFloat(airport.Latitude),
      longitude: parseFloat(airport.Longitude),
      title: airport.ShortName || airport.EnglishName,
      iconPath: '/images/airport-icon.png',
      width: 20,
      height: 20,
      callout: {
        content: airport.ICAOCode + ' - ' + (airport.ShortName || airport.EnglishName),
        fontSize: 12,
        borderRadius: 4,
        bgColor: '#ffffff',
        padding: 8,
        display: 'BYCLICK'
      }
    };
  });
  
  console.log('🏷️ 测试标记生成:', {
    '生成标记数': testMarkers.length,
    '标记示例': testMarkers[0]
  });
  
} else {
  console.error('❌ 机场数据导入失败或数据为空');
}

console.log('=== 机场数据测试结束 ===');

module.exports = {
  testAirportData: function() {
    return airports;
  },
  getValidAirports: function() {
    return airports.filter(function(airport) {
      return airport && airport.Latitude && airport.Longitude && 
             airport.ICAOCode && (airport.ShortName || airport.EnglishName);
    });
  }
};