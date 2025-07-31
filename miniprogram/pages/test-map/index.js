/**
 * 测试地图页面 - 用于调试机场标记显示问题
 * 简化版本，不使用BasePage，直接测试核心功能
 */

// 导入机场数据
var airports = require('../../packageC/airportdata.js');

Page({
  data: {
    // 地图配置
    latitude: 39.90923,
    longitude: 116.397428,
    scale: 10,
    
    // 标记数据
    markers: [],
    
    // 调试信息
    debugInfo: '',
    showDebug: true
  },

  onLoad: function() {
    console.log('🧪 测试地图页面加载');
    this.testAirportData();
    this.loadTestMarkers();
  },

  /**
   * 测试机场数据
   */
  testAirportData: function() {
    console.log('🔍 测试机场数据导入');
    
    var debugInfo = '';
    debugInfo += '机场数据类型: ' + typeof airports + '\n';
    debugInfo += '是否为数组: ' + Array.isArray(airports) + '\n';
    debugInfo += '数据长度: ' + (airports ? airports.length : 0) + '\n';
    
    if (airports && airports.length > 0) {
      debugInfo += '第一个机场: ' + JSON.stringify(airports[0], null, 2) + '\n';
      
      // 统计有效数据
      var validCount = 0;
      for (var i = 0; i < Math.min(airports.length, 100); i++) {
        var airport = airports[i];
        if (airport && airport.Latitude && airport.Longitude && airport.ICAOCode) {
          validCount++;
        }
      }
      debugInfo += '前100个中有效数据: ' + validCount + '\n';
    }
    
    this.setData({ debugInfo: debugInfo });
    console.log('📊 调试信息:', debugInfo);
  },

  /**
   * 加载测试标记
   */
  loadTestMarkers: function() {
    console.log('🏷️ 开始加载测试标记');
    
    if (!airports || !Array.isArray(airports)) {
      console.error('❌ 机场数据无效');
      return;
    }
    
    // 筛选有效机场数据
    var validAirports = [];
    for (var i = 0; i < airports.length && validAirports.length < 20; i++) {
      var airport = airports[i];
      if (airport && airport.Latitude && airport.Longitude && 
          airport.ICAOCode && (airport.ShortName || airport.EnglishName)) {
        validAirports.push(airport);
      }
    }
    
    console.log('✅ 筛选出有效机场:', validAirports.length, '个');
    
    // 生成标记
    var markers = [];
    for (var i = 0; i < validAirports.length; i++) {
      var airport = validAirports[i];
      var marker = {
        id: i,
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
      markers.push(marker);
    }
    
    console.log('🎯 生成标记完成:', markers.length, '个');
    console.log('📍 第一个标记:', markers[0]);
    
    // 更新页面数据
    this.setData({ 
      markers: markers 
    }, function() {
      console.log('✅ 页面标记数据更新完成');
    });
    
    // 更新调试信息
    var debugInfo = this.data.debugInfo;
    debugInfo += '\n生成标记数量: ' + markers.length;
    debugInfo += '\n第一个标记坐标: ' + (markers[0] ? markers[0].latitude + ',' + markers[0].longitude : '无');
    this.setData({ debugInfo: debugInfo });
  },

  /**
   * 地图点击事件
   */
  onMapTap: function(e) {
    console.log('🗺️ 地图点击:', e.detail);
  },

  /**
   * 标记点击事件
   */
  onMarkerTap: function(e) {
    console.log('📍 标记点击:', e.detail);
    wx.showToast({
      title: '点击了标记 #' + e.detail.markerId,
      icon: 'success'
    });
  },

  /**
   * 切换调试信息
   */
  toggleDebug: function() {
    this.setData({
      showDebug: !this.data.showDebug
    });
  },

  /**
   * 重新加载
   */
  reload: function() {
    this.setData({ markers: [] });
    this.testAirportData();
    this.loadTestMarkers();
  }
});