var BasePage = require('../../utils/base-page.js');
var simpleAirportManager = require('../../utils/simple-airport-manager.js');

var pageConfig = {
  data: {
    loading: true,
    loadingProgress: 0,
    loadingStatus: '初始化中...',
    visibleAirportCount: 0,
    totalAirportCount: 0,
    showCurrentLocation: false,
    mapCenter: {
      lng: 116.397428, // 北京坐标
      lat: 39.90923
    },
    mapScale: 8, // 城市级别
    markers: [],
    selectedAirport: null,
    mapCtx: null,
    allAirports: null, // 存储所有机场数据
    // 性能监控
    performanceStats: {
      cacheHit: false,
      loadTime: 0
    }
  },

  customOnLoad: function(options) {
    this.mapCtx = wx.createMapContext('airportMap');
    this.loadAirportDataSimple();
    this.getCurrentLocation();
  },

  /**
   * 简化的机场数据加载
   */
  loadAirportDataSimple: function() {
    var self = this;
    var startTime = Date.now();
    
    console.log('🚀 开始加载机场数据（简化版）');
    
    // 检查缓存
    var cacheResult = simpleAirportManager.checkCacheValidity();
    
    if (cacheResult.valid) {
      console.log('✅ 使用缓存数据');
      self.setData({
        'performanceStats.cacheHit': true
      });
      
      self.onAirportDataReady(cacheResult.data, startTime);
    } else {
      console.log('🔄 缓存无效，重新加载数据，原因:', cacheResult.reason);
      self.loadAndProcessAirportData(startTime);
    }
  },

  /**
   * 加载和处理原始机场数据
   */
  loadAndProcessAirportData: function(startTime) {
    var self = this;
    
    self.setData({
      loadingStatus: '加载机场数据...'
    });
    
    // 异步加载机场数据包
    require('../../packageC/airportdata.js', function(airportModule) {
      var rawAirports = airportModule.airports || airportModule;
      console.log(`📊 原始机场数据: ${rawAirports.length} 个`);
      
      self.setData({
        totalAirportCount: rawAirports.length,
        loadingStatus: '处理坐标转换...'
      });
      
      // 批量处理数据
      simpleAirportManager.processAirportsInBatches(
        rawAirports,
        function(progress, currentBatch, totalBatches) {
          // 进度回调
          self.setData({
            loadingProgress: progress,
            loadingStatus: `处理中... ${currentBatch}/${totalBatches} (${progress}%)`
          });
        },
        function(processedAirports) {
          // 完成回调
          self.onAirportDataReady(processedAirports, startTime);
        }
      );
      
    }, function(error) {
      console.error('❌ 机场数据加载失败:', error);
      self.handleError(error, '加载机场数据');
      self.setData({ 
        loading: false,
        loadingStatus: '加载失败'
      });
    });
  },

  /**
   * 机场数据准备完成
   */
  onAirportDataReady: function(processedAirports, startTime) {
    var self = this;
    var loadTime = Date.now() - startTime;
    
    console.log(`✅ 机场数据处理完成，耗时: ${loadTime}ms`);
    
    // 存储数据
    self.setData({
      allAirports: processedAirports,
      totalAirportCount: processedAirports.length,
      'performanceStats.loadTime': loadTime,
      loadingStatus: '渲染地图...'
    });
    
    // 显示附近的机场
    self.showNearbyAirports();
  },

  /**
   * 显示附近的机场（优化版 - 减少闪烁）
   */
  showNearbyAirports: function() {
    var self = this;
    
    if (!self.data.allAirports) {
      console.log('❌ 没有机场数据');
      return;
    }
    
    var center = self.data.mapCenter;
    console.log('🔍 显示附近机场，地图中心:', center);
    
    // 获取附近机场
    var nearbyAirports = simpleAirportManager.getNearbyAirports(
      self.data.allAirports,
      center.lat,
      center.lng,
      200 // 最多200个
    );
    
    // 转换为地图标记
    var markers = self.convertAirportsToMarkers(nearbyAirports);
    
    // 检查是否有实际变化（避免无意义的重新渲染）
    var currentMarkersCount = self.data.markers.length;
    if (currentMarkersCount === markers.length && currentMarkersCount > 0) {
      // 简单比较：如果数量相同且都有数据，可能不需要更新
      console.log('🔄 机场数量未变化，跳过更新以减少闪烁');
      
      // 只更新统计数据，不更新markers
      self.setData({
        loading: false,
        visibleAirportCount: markers.length,
        loadingStatus: '',
        loadingProgress: 100
      });
      return;
    }
    
    self.setData({
      loading: false,
      markers: markers,
      visibleAirportCount: markers.length,
      loadingStatus: '',
      loadingProgress: 100
    });
    
    console.log(`🗺️ 显示机场标记: ${markers.length} 个`);
  },

  /**
   * 将机场数据转换为地图标记点（简化版）
   */
  convertAirportsToMarkers: function(airports) {
    return airports.map(function(airport, index) {
      return {
        id: index,
        latitude: airport.Latitude,
        longitude: airport.Longitude,
        title: airport.ShortName,
        iconPath: '/images/airport-icon.png',
        width: 30,
        height: 30,
        callout: {
          content: `${airport.ICAOCode} - ${airport.ShortName}`,
          color: '#000000',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#ffffff',
          padding: 8,
          display: 'BYCLICK',
          textAlign: 'center'
        },
        // 存储完整的机场信息
        airportData: airport
      };
    });
  },

  /**
   * 获取用户当前位置
   */
  getCurrentLocation: function() {
    var self = this;
    
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: function(res) {
        console.log('📍 获取当前位置成功:', res);
        self.setData({
          'mapCenter.lng': res.longitude,
          'mapCenter.lat': res.latitude,
          mapScale: 10 // 调整到城市级别
        });
        
        // 重新显示附近机场
        if (self.data.allAirports) {
          self.showNearbyAirports();
        }
      },
      fail: function(error) {
        console.log('📍 获取位置失败，使用默认位置:', error);
        // 使用默认位置也要显示机场
        if (self.data.allAirports) {
          self.showNearbyAirports();
        }
      }
    });
  },

  /**
   * 地图区域变化事件（优化版 - 修复缩放移动问题）
   */
  onRegionChange: function(e) {
    if (e.detail.type === 'end') {
      console.log('🗺️ 地图区域变化:', e.detail);
      
      var self = this;
      
      // 只更新缩放级别，不更新中心点（避免缩放时地图移动）
      if (e.detail.scale && e.detail.scale !== self.data.mapScale) {
        self.setData({
          mapScale: e.detail.scale
        });
        console.log('🔍 地图缩放级别更新:', e.detail.scale);
      }
      
      // 只有当中心点确实发生变化时才更新（避免缩放时的误更新）
      if (e.detail.centerLocation) {
        var newLng = e.detail.centerLocation.longitude;
        var newLat = e.detail.centerLocation.latitude;
        var currentLng = self.data.mapCenter.lng;
        var currentLat = self.data.mapCenter.lat;
        
        // 只有位置变化超过阈值时才认为是真正的移动（避免缩放时的微小变化）
        var lngDiff = Math.abs(newLng - currentLng);
        var latDiff = Math.abs(newLat - currentLat);
        var threshold = 0.001; // 设置阈值，约100米
        
        if (lngDiff > threshold || latDiff > threshold) {
          console.log('📍 地图中心点实际移动:', { lng: lngDiff, lat: latDiff });
          self.setData({
            'mapCenter.lng': newLng,
            'mapCenter.lat': newLat
          });
          
          // 延迟更新机场显示（减少闪烁）
          setTimeout(function() {
            if (self.data.allAirports) {
              self.showNearbyAirports();
            }
          }, 200); // 减少防抖时间从500ms到200ms
        }
      }
    }
  },

  /**
   * 标记点击事件
   */
  onMarkerTap: function(e) {
    var markerId = e.detail.markerId;
    var marker = this.data.markers[markerId];
    
    if (marker && marker.airportData) {
      console.log('🛩️ 选择机场:', marker.airportData);
      this.setData({
        selectedAirport: marker.airportData
      });
    }
  },

  /**
   * 地图更新完成事件
   */
  onMapUpdated: function(e) {
    console.log('🗺️ 地图渲染完成');
  },

  /**
   * 切换显示当前位置
   */
  toggleCurrentLocation: function() {
    this.setData({
      showCurrentLocation: !this.data.showCurrentLocation
    });
  },

  /**
   * 关闭机场信息弹窗
   */
  closeAirportInfo: function() {
    this.setData({
      selectedAirport: null
    });
  },

  /**
   * 阻止弹窗冒泡
   */
  stopPropagation: function() {
    // 阻止事件冒泊
  },

  /**
   * 导航到选中的机场
   */
  navigateToAirport: function() {
    var airport = this.data.selectedAirport;
    if (!airport) return;

    var self = this;
    
    // 将地图中心移到选中的机场
    this.setData({
      'mapCenter.lng': airport.Longitude,
      'mapCenter.lat': airport.Latitude,
      mapScale: 15,
      selectedAirport: null
    });
    
    // 重新显示附近机场
    if (this.data.allAirports) {
      this.showNearbyAirports();
    }

    wx.showToast({
      title: `已定位到${airport.ShortName}`,
      icon: 'success'
    });
  },

  /**
   * 清除缓存并重新加载
   */
  clearCacheAndReload: function() {
    var self = this;
    
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除机场数据缓存并重新加载吗？',
      success: function(res) {
        if (res.confirm) {
          simpleAirportManager.clearCache();
          self.setData({
            loading: true,
            loadingProgress: 0,
            allAirports: null,
            markers: []
          });
          self.loadAirportDataSimple();
        }
      }
    });
  },

  /**
   * 页面卸载时的清理
   */
  onUnload: function() {
    // 清理地图上下文
    this.mapCtx = null;
  }
};

Page(BasePage.createPage(pageConfig));