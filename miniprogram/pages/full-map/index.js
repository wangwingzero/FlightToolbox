/**
 * 完整地图页面
 * 提供完整的腾讯地图功能，支持搜索、导航、距离计算等
 */

var BasePage = require('../../utils/base-page.js');
var ConsoleHelper = require('../../utils/console-helper.js');

var pageConfig = {
  data: {
    // 地图相关
    mapScale: 13,
    currentLocation: {
      latitude: 31.231706,
      longitude: 121.472644
    },
    showMyLocation: true,
    mapStyle: 1, // 1=普通, 2=卫星
    activeMapType: 'normal',
    
    // 搜索相关
    searchValue: '',
    isLoading: false,
    
    // 标记点
    markers: [],
    routes: [],
    
    // 目标位置信息
    targetLocation: null,
    distance: 0,
    bearing: 0
  },

  /**
   * 页面加载完成
   */
  customOnLoad: function(options) {
    this.initMap();
    this.getCurrentLocation();
  },

  /**
   * 初始化地图
   */
  initMap: function() {
    var self = this;
    
    // 创建地图上下文
    this.mapContext = wx.createMapContext('fullMap', this);
    
    // 设置地图默认样式
    this.setMapStyle('normal');
    
    ConsoleHelper.success('🗺️ 完整地图初始化完成');
  },

  /**
   * 获取当前位置
   */
  getCurrentLocation: function() {
    var self = this;
    
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      isHighAccuracy: true,
      success: function(res) {
        ConsoleHelper.gps('📍 获取到当前位置: ' + res.latitude + ', ' + res.longitude);
        
        self.setData({
          currentLocation: {
            latitude: res.latitude,
            longitude: res.longitude,
            altitude: res.altitude || 0,
            accuracy: res.accuracy || 0
          }
        });
        
        // 添加当前位置标记
        self.addLocationMarker(res.latitude, res.longitude);
      },
      fail: function(error) {
        ConsoleHelper.error('❌ 获取位置失败: ' + (error.errMsg || '未知错误'));
        wx.showToast({
          title: '定位失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 添加位置标记
   */
  addLocationMarker: function(latitude, longitude, title, iconPath) {
    var markers = this.data.markers;
    var newMarker = {
      id: markers.length,
      latitude: latitude,
      longitude: longitude,
      title: title || '我的位置',
      iconPath: iconPath || '/images/airport-marker.png',
      width: 30,
      height: 30,
      callout: title ? {
        content: title,
        color: '#fff',
        fontSize: 14,
        borderRadius: 10,
        bgColor: '#1890ff',
        padding: 8,
        display: 'ALWAYS'
      } : null
    };
    
    markers.push(newMarker);
    this.setData({ markers: markers });
  },

  /**
   * 搜索功能
   */
  onSearch: function() {
    var searchValue = this.data.searchValue.trim();
    if (!searchValue) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }
    
    this.searchLocation(searchValue);
  },

  /**
   * 搜索输入
   */
  onSearchInput: function(e) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  /**
   * 清除搜索
   */
  onSearchClear: function() {
    this.setData({
      searchValue: '',
      targetLocation: null,
      distance: 0,
      bearing: 0
    });
    
    // 清除目标标记，保留我的位置
    var markers = this.data.markers.filter(function(marker) {
      return marker.title === '我的位置';
    });
    this.setData({ markers: markers });
  },

  /**
   * 搜索位置
   */
  searchLocation: function(keyword) {
    var self = this;
    
    this.setData({ isLoading: true });
    
    // 优先尝试ICAO代码搜索
    this.searchICAOCode(keyword);
  },

  /**
   * 搜索ICAO代码
   */
  searchICAOCode: function(icao) {
    var self = this;
    
    // 扩展的机场数据库
    var airportData = {
      // 中国主要机场
      'ZSPD': { name: '上海浦东国际机场', lat: 31.143378, lng: 121.805214 },
      'ZSSS': { name: '上海虹桥国际机场', lat: 31.197875, lng: 121.336319 },
      'ZBAA': { name: '北京首都国际机场', lat: 40.080111, lng: 116.584556 },
      'ZBAD': { name: '北京大兴国际机场', lat: 39.509945, lng: 116.410759 },
      'ZGGG': { name: '广州白云国际机场', lat: 23.392436, lng: 113.298786 },
      'ZUUU': { name: '成都双流国际机场', lat: 30.578528, lng: 103.947089 },
      'ZYTX': { name: '沈阳桃仙国际机场', lat: 41.639751, lng: 123.488061 },
      'ZUCK': { name: '重庆江北国际机场', lat: 29.719217, lng: 106.641678 },
      'ZSNJ': { name: '南京禄口国际机场', lat: 31.742042, lng: 118.862025 },
      'ZSQD': { name: '青岛胶东国际机场', lat: 36.396257, lng: 120.374678 },
      'ZSHC': { name: '杭州萧山国际机场', lat: 30.229503, lng: 120.434453 },
      'ZSFZ': { name: '福州长乐国际机场', lat: 25.935064, lng: 119.663322 },
      'ZSAM': { name: '厦门高崎国际机场', lat: 24.544036, lng: 118.127739 },
      
      // 国际主要机场
      'RJTT': { name: '东京羽田机场', lat: 35.552258, lng: 139.779694 },
      'RJAA': { name: '东京成田国际机场', lat: 35.764722, lng: 140.386389 },
      'RKSI': { name: '首尔仁川国际机场', lat: 37.469075, lng: 126.450517 },
      'VHHH': { name: '香港国际机场', lat: 22.308919, lng: 113.914603 },
      'RCTP': { name: '台北桃园国际机场', lat: 25.077731, lng: 121.232822 },
      'WSSS': { name: '新加坡樟宜机场', lat: 1.350189, lng: 103.994433 },
      'WIII': { name: '雅加达苏加诺-哈达国际机场', lat: -6.125567, lng: 106.655897 },
      'VTBS': { name: '曼谷素万那普国际机场', lat: 13.681108, lng: 100.747283 },
      'OMDB': { name: '迪拜国际机场', lat: 25.252778, lng: 55.364444 },
      'EGLL': { name: '伦敦希思罗机场', lat: 51.469603, lng: -0.453989 },
      'EDDF': { name: '法兰克福机场', lat: 50.033333, lng: 8.570556 },
      'LFPG': { name: '巴黎戴高乐机场', lat: 49.012779, lng: 2.55 },
      'KJFK': { name: '纽约肯尼迪国际机场', lat: 40.639751, lng: -73.778925 },
      'KLAX': { name: '洛杉矶国际机场', lat: 40.692000, lng: -74.168667 }
    };
    
    // 搜索ICAO代码或机场名称
    var searchKey = icao.toUpperCase();
    var airport = airportData[searchKey];
    
    // 如果没有找到ICAO代码，尝试名称搜索
    if (!airport) {
      for (var code in airportData) {
        if (airportData[code].name.indexOf(icao) !== -1) {
          airport = airportData[code];
          searchKey = code;
          break;
        }
      }
    }
    
    this.setData({ isLoading: false });
    
    if (airport) {
      this.handleSearchResult({
        title: airport.name,
        location: {
          lat: airport.lat,
          lng: airport.lng
        },
        address: searchKey + ' - ' + airport.name
      });
    } else {
      wx.showToast({
        title: '未找到相关机场',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 处理搜索结果
   */
  handleSearchResult: function(location) {
    var latitude = location.location.lat;
    var longitude = location.location.lng;
    var name = location.title || location.name;
    var address = location.address || '';
    
    // 设置目标位置
    var targetLocation = {
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address
    };
    
    this.setData({ targetLocation: targetLocation });
    
    // 添加标记
    this.addLocationMarker(latitude, longitude, name, '/images/airport-marker.png');
    
    // 计算距离和航向
    if (this.data.currentLocation.latitude) {
      this.calculateNavigationInfo(targetLocation);
    }
    
    // 移动地图中心到目标位置
    this.mapContext.moveToLocation({
      latitude: latitude,
      longitude: longitude
    });
    
    ConsoleHelper.success('🎯 找到目标: ' + name);
  },

  /**
   * 计算导航信息
   */
  calculateNavigationInfo: function(targetLocation) {
    var currentLat = this.data.currentLocation.latitude;
    var currentLng = this.data.currentLocation.longitude;
    var targetLat = targetLocation.latitude;
    var targetLng = targetLocation.longitude;
    
    // 计算距离（使用haversine公式）
    var distance = this.calculateDistance(currentLat, currentLng, targetLat, targetLng);
    
    // 计算航向
    var bearing = this.calculateBearing(currentLat, currentLng, targetLat, targetLng);
    
    this.setData({
      distance: distance.toFixed(1),
      bearing: Math.round(bearing)
    });
  },

  /**
   * 计算两点间距离（海里）
   */
  calculateDistance: function(lat1, lng1, lat2, lng2) {
    var R = 6371; // 地球半径（公里）
    var dLat = this.toRadians(lat2 - lat1);
    var dLng = this.toRadians(lng2 - lng1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var distanceKm = R * c;
    return distanceKm * 0.539957; // 转换为海里
  },

  /**
   * 计算航向
   */
  calculateBearing: function(lat1, lng1, lat2, lng2) {
    var dLng = this.toRadians(lng2 - lng1);
    var lat1Rad = this.toRadians(lat1);
    var lat2Rad = this.toRadians(lat2);
    
    var y = Math.sin(dLng) * Math.cos(lat2Rad);
    var x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    var bearing = Math.atan2(y, x);
    return (this.toDegrees(bearing) + 360) % 360;
  },

  /**
   * 角度转弧度
   */
  toRadians: function(degrees) {
    return degrees * (Math.PI / 180);
  },

  /**
   * 弧度转角度
   */
  toDegrees: function(radians) {
    return radians * (180 / Math.PI);
  },

  /**
   * 地图类型切换
   */
  onMapTypeChange: function(e) {
    var mapType = e.detail.name;
    this.setData({ activeMapType: mapType });
    this.setMapStyle(mapType);
  },

  /**
   * 设置地图样式
   */
  setMapStyle: function(type) {
    var style = type === 'satellite' ? 2 : 1;
    this.setData({ mapStyle: style });
  },

  /**
   * 居中显示目标
   */
  centerOnTarget: function() {
    if (this.data.targetLocation) {
      this.mapContext.moveToLocation({
        latitude: this.data.targetLocation.latitude,
        longitude: this.data.targetLocation.longitude
      });
    }
  },

  /**
   * 居中显示我的位置
   */
  centerOnMyLocation: function() {
    this.mapContext.moveToLocation();
  },

  /**
   * 放大地图
   */
  zoomIn: function() {
    var newScale = Math.min(this.data.mapScale + 2, 20);
    this.setData({ mapScale: newScale });
  },

  /**
   * 缩小地图
   */
  zoomOut: function() {
    var newScale = Math.max(this.data.mapScale - 2, 5);
    this.setData({ mapScale: newScale });
  },

  /**
   * 获取导航路线
   */
  getDirections: function() {
    if (!this.data.targetLocation) return;
    
    var self = this;
    var current = this.data.currentLocation;
    var target = this.data.targetLocation;
    
    // 创建简单的直线路径
    var polyline = [{
      points: [
        { latitude: current.latitude, longitude: current.longitude },
        { latitude: target.latitude, longitude: target.longitude }
      ],
      color: '#1890ff',
      width: 4,
      arrowLine: true
    }];
    
    this.setData({
      routes: polyline
    });
    
    wx.showToast({
      title: '已显示直线航路',
      icon: 'success'
    });
  },

  /**
   * 清除目标
   */
  clearTarget: function() {
    this.setData({
      targetLocation: null,
      distance: 0,
      bearing: 0,
      routes: []
    });
    
    // 清除目标标记
    var markers = this.data.markers.filter(function(marker) {
      return marker.title === '我的位置';
    });
    this.setData({ markers: markers });
  },

  /**
   * 地图区域变化
   */
  onRegionChange: function(e) {
    if (e.type === 'end') {
      ConsoleHelper.verbose('地图区域变化: ' + JSON.stringify(e.detail));
    }
  },

  /**
   * 标记点点击
   */
  onMarkerTap: function(e) {
    ConsoleHelper.verbose('标记点点击: ' + e.markerId);
  },

  /**
   * 标记点气泡点击
   */
  onCalloutTap: function(e) {
    ConsoleHelper.verbose('气泡点击: ' + e.markerId);
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));