// 机场详情页面
// 严格ES5语法，确保真机兼容性

var BasePage = require('../../utils/base-page.js');
var AirportDataLoader = require('../data-loader.js');
var AirportUtils = require('../utils.js');
var AirportConfig = require('../config.js');

var pageConfig = {
  data: {
    // 机场信息
    airport: null,
    loading: true,
    icaoCode: '',
    
    // 坐标和地理信息
    coordinates: {
      latitude: 0,
      longitude: 0,
      formatted: {
        latitude: '',
        longitude: ''
      }
    },
    
    // 相关机场
    nearbyAirports: [],
    sameCountryAirports: [],
    
    // 地图相关
    showMap: false,
    mapCenter: { latitude: 39.908, longitude: 116.397 },
    markers: [],
    
    // 分享信息
    shareInfo: {}
  },
  
  customOnLoad: function(options) {
    var self = this;
    var icaoCode = options.icao || '';
    
    if (!icaoCode) {
      this.handleError(new Error('缺少机场代码'), '参数错误');
      return;
    }
    
    this.setData({
      icaoCode: icaoCode.toUpperCase()
    });
    
    // 使用BasePage的数据加载方法
    this.loadDataWithLoading(function() {
      return self.loadAirportDetail(icaoCode);
    }, {
      loadingText: '正在加载机场详情...'
    });
  },
  
  // 加载机场详情
  loadAirportDetail: function(icaoCode) {
    var self = this;
    
    return AirportDataLoader.loadAirportData().then(function(airports) {
      // 查找指定机场
      var targetAirport = null;
      
      for (var i = 0; i < airports.length; i++) {
        if (airports[i].ICAOCode === icaoCode.toUpperCase()) {
          targetAirport = airports[i];
          break;
        }
      }
      
      if (!targetAirport) {
        throw new Error('未找到机场信息: ' + icaoCode);
      }
      
      // 设置机场信息
      
      self.setData({
        airport: targetAirport
      });
      
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: targetAirport.ICAOCode + ' - ' + targetAirport.ShortName
      });
      
      // 处理坐标信息
      self.processCoordinates(targetAirport);
      
      // 查找相关机场
      self.findRelatedAirports(airports, targetAirport);
      
      // 准备分享信息
      self.prepareShareInfo(targetAirport);
      
      return targetAirport;
      
    }).catch(function(error) {
      console.error('加载机场详情失败:', error);
      self.handleError(error, '机场信息加载失败');
      throw error;
    });
  },
  
  // 处理坐标信息
  processCoordinates: function(airport) {
    var lat = airport.Latitude || 0;
    var lng = airport.Longitude || 0;
    
    var coordinates = {
      latitude: lat,
      longitude: lng,
      formatted: {
        latitude: AirportUtils.formatCoordinate(lat, 'latitude'),
        longitude: AirportUtils.formatCoordinate(lng, 'longitude')
      }
    };
    
    this.setData({
      coordinates: coordinates
    });
    
    // 如果有有效坐标，准备地图数据
    if (lat !== 0 && lng !== 0) {
      this.prepareMapData(lat, lng, airport);
    }
  },
  
  // 准备地图数据
  prepareMapData: function(lat, lng, airport) {
    var mapCenter = { latitude: lat, longitude: lng };
    var markers = [{
      id: 1,
      latitude: lat,
      longitude: lng,
      title: airport.ICAOCode,
      callout: {
        content: airport.ShortName,
        display: 'ALWAYS',
        textAlign: 'center'
      },
      iconPath: '/images/airport-marker.png',
      width: 40,
      height: 40
    }];
    
    this.setData({
      mapCenter: mapCenter,
      markers: markers,
      showMap: true
    });
  },
  
  // 查找相关机场
  findRelatedAirports: function(allAirports, currentAirport) {
    var self = this;
    var sameCountry = [];
    var nearby = [];
    
    var currentLat = currentAirport.Latitude || 0;
    var currentLng = currentAirport.Longitude || 0;
    
    for (var i = 0; i < allAirports.length; i++) {
      var airport = allAirports[i];
      
      // 跳过当前机场
      if (airport.ICAOCode === currentAirport.ICAOCode) {
        continue;
      }
      
      // 同国家/地区机场
      if (airport.CountryName === currentAirport.CountryName) {
        sameCountry.push(airport);
      }
      
      // 附近机场（如果有坐标信息）
      if (currentLat !== 0 && currentLng !== 0 && 
          airport.Latitude !== 0 && airport.Longitude !== 0) {
        
        var distance = AirportUtils.calculateDistance(
          currentLat, currentLng,
          airport.Latitude, airport.Longitude
        );
        
        if (distance <= 500 && distance > 0) { // 500公里内
          airport.distance = distance;
          nearby.push(airport);
        }
      }
    }
    
    // 排序并限制数量
    sameCountry.sort(function(a, b) {
      return (a.ShortName || '').localeCompare(b.ShortName || '');
    });
    
    nearby.sort(function(a, b) {
      return a.distance - b.distance;
    });
    
    this.setData({
      sameCountryAirports: sameCountry.slice(0, 10),
      nearbyAirports: nearby.slice(0, 8)
    });
  },
  
  // 准备分享信息
  prepareShareInfo: function(airport) {
    var shareTitle = airport.ICAOCode + ' - ' + airport.ShortName;
    var shareDesc = '查看' + airport.CountryName + airport.ShortName + '机场的详细信息';
    
    this.setData({
      shareInfo: {
        title: shareTitle,
        desc: shareDesc,
        path: '/packageAirport/detail/index?icao=' + airport.ICAOCode
      }
    });
  },
  
  // 移除复制功能，只保留地图功能
  
  // 在地图中显示
  onShowInMap: function() {
    var self = this;
    var airport = this.data.airport;
    if (!airport || !airport.Latitude || !airport.Longitude) {
      this.showToast('无坐标信息', 'none');
      return;
    }
    
    // 打开地图查看位置
    wx.openLocation({
      latitude: airport.Latitude,
      longitude: airport.Longitude,
      name: airport.ShortName,
      address: airport.CountryName + ' ' + airport.EnglishName,
      fail: function(error) {
        console.error('打开地图失败:', error);
        self.handleError(error, '打开地图失败');
      }
    });
  },
  
  // 点击相关机场
  onRelatedAirportTap: function(e) {
    var self = this;
    var airport = e.currentTarget.dataset.airport;
    
    if (!airport || !airport.ICAOCode) {
      return;
    }
    
    // 导航到该机场详情
    wx.redirectTo({
      url: './index?icao=' + encodeURIComponent(airport.ICAOCode),
      fail: function(error) {
        console.error('导航失败:', error);
        self.handleError(error, '页面跳转失败');
      }
    });
  },
  
  // 返回搜索页面
  onBackToSearch: function() {
    wx.navigateBack({
      delta: 1,
      fail: function() {
        wx.navigateTo({
          url: '../index',
          fail: function(error) {
            console.error('返回失败:', error);
          }
        });
      }
    });
  },
  
  // 页面分享
  onShareAppMessage: function() {
    var shareInfo = this.data.shareInfo;
    
    return {
      title: shareInfo.title || '机场信息',
      path: shareInfo.path || '/packageAirport/index',
      imageUrl: '/images/share-airport-detail.png'
    };
  },
  
  // 分享到朋友圈
  onShareTimeline: function() {
    var shareInfo = this.data.shareInfo;
    
    return {
      title: shareInfo.title || '机场信息',
      query: 'icao=' + this.data.icaoCode,
      imageUrl: '/images/share-airport-detail.png'
    };
  }
};

Page(BasePage.createPage(pageConfig));