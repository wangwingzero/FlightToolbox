var BasePage = require('../../utils/base-page.js');
var simpleAirportManager = require('../../utils/simple-airport-manager.js');
var FlightCalculator = require('../cockpit/modules/flight-calculator.js');
var VersionManager = require('../../utils/version-manager.js');

var pageConfig = {
  data: {
    loading: true,
    loadingProgress: 0,
    loadingStatus: '初始化中...',
    visibleAirportCount: 0,
    totalAirportCount: 0,
    showCurrentLocation: true,
    mapCenter: {
      lng: 116.397428, // 北京坐标
      lat: 39.90923
    },
    mapScale: 10, // 城市级别
    markers: [],
    selectedAirport: null,
    mapCtx: null,
    allAirports: null, // 存储所有机场数据
    // 性能监控
    performanceStats: {
      cacheHit: false,
      loadTime: 0
    },
    // 新增数据
    selectedLocation: null, // 用户选择的位置
    nearbyAirports: [], // 附近机场列表
    viewMode: 'all', // all: 显示所有机场, nearby: 只显示附近机场
    currentUserLocation: null, // 当前用户位置
    enableSatellite: false, // 是否开启卫星图
    enable3D: true, // 是否开启3D模式
    showAirportLabels: true, // 是否显示机场标签
    // 地图状态跟踪
    lastMapScale: 10, // 上次的缩放级别
    isZooming: false, // 是否正在缩放
    lastUpdateTime: 0, // 上次更新时间
    regionChangeTimer: null, // 区域变化的定时器
    footprintMode: false, // 是否从“机场足迹”入口进入
    checkedAirports: {}, // 已打卡机场集合，key 为 ICAOCode
    footprintStats: null,
    footprintList: [],
    latestFootprint: null
  },

  // 跳转到独立的机场足迹子页面
  openFootprintPage: function() {
    try {
      wx.navigateTo({
        url: '/packageNav/airport-footprint/index'
      });
    } catch (error) {
      console.error('打开机场足迹页面失败(airport-map):', error);
      wx.showToast({
        title: '无法打开机场足迹',
        icon: 'none'
      });
    }
  },

  customOnLoad: function(options) {
    this.mapCtx = wx.createMapContext('airportMap');

    // 检查是否为“机场足迹”模式
    var footprintMode = options && options.mode === 'footprint';
    if (footprintMode) {
      this.setData({ footprintMode: true });

      // 读取本地打卡记录
      try {
        var checkins = [];
        var cacheKey = VersionManager.getEnvScopedKey('airport_checkins');
        var stored = wx.getStorageSync(cacheKey);
        if (Array.isArray(stored) && stored.length > 0) {
          checkins = stored;
        } else {
          // 兼容旧版本：读取老 key 'airport_checkins_v1' 并迁移到新 key
          var legacyStored = wx.getStorageSync('airport_checkins_v1') || [];
          if (Array.isArray(legacyStored) && legacyStored.length > 0) {
            checkins = legacyStored;
            try {
              wx.setStorageSync(cacheKey, legacyStored);
            } catch (migrateError) {
              console.warn('迁移旧机场打卡记录到新版本缓存失败(airport-map):', migrateError);
            }
          }
        }
        if (!Array.isArray(checkins) || checkins.length === 0) {
          try {
            var info = VersionManager && typeof VersionManager.getAppVersionInfo === 'function'
              ? VersionManager.getAppVersionInfo()
              : null;
            var prefix = info && info.prefix ? info.prefix : '';
            if (prefix && wx.getStorageInfoSync) {
              var storageInfo = wx.getStorageInfoSync();
              var keys = (storageInfo && storageInfo.keys) || [];
              for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                if (k.indexOf(prefix) === 0 && k.indexOf('airport_checkins') !== -1) {
                  try {
                    var legacyList = wx.getStorageSync(k);
                    if (Array.isArray(legacyList) && legacyList.length > 0) {
                      checkins = legacyList;
                      try {
                        wx.setStorageSync(cacheKey, legacyList);
                      } catch (migrateError2) {
                        console.warn('迁移旧版本化机场打卡记录到环境级缓存失败(airport-map):', migrateError2);
                      }
                      break;
                    }
                  } catch (readOldError) {
                    console.warn('读取旧版本化机场打卡记录失败(airport-map):', readOldError);
                  }
                }
              }
            }
          } catch (scanError) {
            console.warn('扫描旧版本机场打卡记录失败(airport-map):', scanError);
          }
        }
        var checkedAirportsMap = {};
        if (Array.isArray(checkins)) {
          checkins.forEach(function(item) {
            if (item && item.icao) {
              checkedAirportsMap[item.icao] = true;
            }
          });
        }
        var count = Array.isArray(checkins) ? checkins.length : 0;
        var footprintList = [];
        var footprintStats = null;

        if (Array.isArray(checkins) && checkins.length > 0) {
          var getLastVisitTs = function(item) {
            // 优先按 lastVisitDate 排序（格式：YYYY-MM-DD），否则回退到 firstVisitTimestamp
            if (item && item.lastVisitDate) {
              try {
                var parts = item.lastVisitDate.split('-');
                if (parts.length === 3) {
                  var y = parseInt(parts[0], 10) || 0;
                  var m = parseInt(parts[1], 10) || 1;
                  var d = parseInt(parts[2], 10) || 1;
                  return new Date(y, m - 1, d).getTime();
                }
              } catch (e) {}
            }
            return item && item.firstVisitTimestamp ? item.firstVisitTimestamp : 0;
          };

          footprintList = checkins.slice().sort(function(a, b) {
            var ta = getLastVisitTs(a);
            var tb = getLastVisitTs(b);
            return tb - ta;
          }).map(function(item) {
            var icao = item && item.icao ? item.icao : '';
            var iata = item && item.iata ? item.iata : '';
            var name = item && item.shortName ? item.shortName : (icao || iata || '');
            var country = item && item.country ? item.country : '';
            var ts = item && item.firstVisitTimestamp ? item.firstVisitTimestamp : 0;
            var dateText = '';
            if (ts && ts > 0) {
              var d = new Date(ts);
              var year = d.getFullYear();
              var month = d.getMonth() + 1;
              var day = d.getDate();
              var mm = month < 10 ? '0' + month : '' + month;
              var dd = day < 10 ? '0' + day : '' + day;
              dateText = year + '-' + mm + '-' + dd;
            }
            return {
              icao: icao,
              iata: iata,
              name: name,
              country: country,
              dateText: dateText,
              visitCount: item && typeof item.visitCount === 'number' && item.visitCount > 0 ? item.visitCount : 1
            };
          });

          var timestamps = checkins.map(function(item) {
            return item && item.firstVisitTimestamp ? item.firstVisitTimestamp : 0;
          }).filter(function(v) {
            return v > 0;
          });

          var firstDateText = '';
          var lastDateText = '';
          if (timestamps.length > 0) {
            var minTs = Math.min.apply(null, timestamps);
            var maxTs = Math.max.apply(null, timestamps);
            var formatDate = function(ts) {
              var d = new Date(ts);
              var year = d.getFullYear();
              var month = d.getMonth() + 1;
              var day = d.getDate();
              var mm = month < 10 ? '0' + month : '' + month;
              var dd = day < 10 ? '0' + day : '' + day;
              return year + '-' + mm + '-' + dd;
            };
            firstDateText = formatDate(minTs);
            lastDateText = formatDate(maxTs);
          }

          footprintStats = {
            totalCount: count,
            firstDateText: firstDateText,
            lastDateText: lastDateText
          };
        }

        this.setData({
          checkedAirports: checkedAirportsMap,
          footprintStats: footprintStats,
          footprintList: footprintList,
          latestFootprint: footprintList && footprintList.length > 0 ? footprintList[0] : null
        });

        if (count > 0) {
          wx.showToast({
            title: '你已经打卡了 ' + count + ' 个机场',
            icon: 'none',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: '还没有机场打卡记录',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.warn('读取机场打卡记录失败:', error);
      }
    }

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
    var self = this;
    var mapScale = self.data.mapScale || 10;
    
    return airports.map(function(airport, index) {
      // 每个marker都读取当前的showAirportLabels状态
      var displayLabel = self.data.showAirportLabels;

      var icao = airport.ICAOCode || airport.icao || '';
      var isChecked = !!(self.data.footprintMode && icao && self.data.checkedAirports[icao]);

      var iconPath = isChecked ? '/images/airport-marker.png' : '/images/airport-icon.png';
      var bgColor = isChecked ? '#ffe082' : '#ffffff';

      var content = `${airport.ICAOCode} - ${airport.ShortName}`;
      if (isChecked) {
        content += '\n已打卡';
      }

      return {
        id: index,
        latitude: airport.Latitude,
        longitude: airport.Longitude,
        title: airport.ShortName,
        iconPath: iconPath,
        width: mapScale >= 12 ? 32 : 28, // 根据缩放级别调整图标大小
        height: mapScale >= 12 ? 32 : 28,
        callout: {
          content: content,
          color: '#000000',
          fontSize: mapScale >= 14 ? 14 : 12, // 根据缩放级别调整字体大小
          borderRadius: 4,
          bgColor: bgColor,
          padding: 8,
          display: displayLabel ? 'ALWAYS' : 'BYCLICK', // 每次都使用最新的状态
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
          mapScale: 10, // 调整到城市级别
          currentUserLocation: {
            longitude: res.longitude,
            latitude: res.latitude
          }
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
    var self = this;
    
    if (e.detail.type === 'begin') {
      // 开始变化时记录状态
      self.setData({
        isZooming: false
      });
    } else if (e.detail.type === 'end') {
      console.log('🗺️ 地图区域变化:', e.detail);
      
      var currentTime = Date.now();
      var timeDiff = currentTime - self.data.lastUpdateTime;
      
      // 检测是否为缩放操作
      var scaleChanged = false;
      var positionChanged = false;
      
      // 强制整数缩放 - 解决小数缩放自动调整问题
      var originalScale = e.detail.scale || self.data.mapScale;
      var roundedScale = Math.round(originalScale);
      
      // 检查缩放级别变化（使用圆整后的值）
      if (roundedScale !== self.data.mapScale) {
        scaleChanged = true;
        var scaleDiff = Math.abs(roundedScale - self.data.mapScale);
        
        // 判断是否为主要的缩放操作
        if (scaleDiff >= 1) {
          self.setData({
            isZooming: true
          });
        }
        
        console.log(`🔍 缩放级别: ${originalScale} → ${roundedScale} (强制整数)`);
      }
      
      // 检查位置变化
      if (e.detail.centerLocation) {
        var newLng = e.detail.centerLocation.longitude;
        var newLat = e.detail.centerLocation.latitude;
        var currentLng = self.data.mapCenter.lng;
        var currentLat = self.data.mapCenter.lat;
        
        var lngDiff = Math.abs(newLng - currentLng);
        var latDiff = Math.abs(newLat - currentLat);
        
        // 根据缩放级别动态调整阈值
        var baseThreshold = 0.001; // 基础阈值
        var zoomFactor = Math.max(1, 18 - roundedScale); // 使用圆整后的缩放级别
        var threshold = baseThreshold * zoomFactor;
        
        if (lngDiff > threshold || latDiff > threshold) {
          positionChanged = true;
        }
      }
      
      // 如果主要是缩放操作，不更新中心点
      if (scaleChanged && !positionChanged) {
        console.log('🔍 纯缩放操作，保持中心点不变');
        self.setData({
          mapScale: roundedScale, // 使用圆整后的缩放级别
          lastMapScale: roundedScale,
          lastUpdateTime: currentTime
        });
        
        // 移除强制moveToLocation调用，避免动画效果
        // 地图组件会通过数据绑定自动响应mapScale的变化
        
        // 缩放后需要更新机场标记（因为标签显示策略改变了）
        if (self.data.regionChangeTimer) {
          clearTimeout(self.data.regionChangeTimer);
        }
        
        self.data.regionChangeTimer = setTimeout(function() {
          if (self.data.allAirports) {
            // 重新生成标记以更新标签显示
            var center = self.data.mapCenter;
            var nearbyAirports = simpleAirportManager.getNearbyAirports(
              self.data.allAirports,
              center.lat,
              center.lng,
              200
            );
            var markers = self.convertAirportsToMarkers(nearbyAirports);
            
            self.setData({
              markers: markers,
              visibleAirportCount: markers.length
            });
            
            console.log('🏷️ 根据整数缩放级别更新机场标签显示');
          }
        }, 300); // 延迟更新，避免频繁操作
        
      } else if (positionChanged) {
        // 只有在真正移动时才更新中心点
        console.log('📍 地图平移操作');
        self.setData({
          'mapCenter.lng': e.detail.centerLocation.longitude,
          'mapCenter.lat': e.detail.centerLocation.latitude,
          mapScale: roundedScale, // 使用圆整后的缩放级别
          lastMapScale: roundedScale,
          lastUpdateTime: currentTime
        });
        
        // 延迟更新机场显示（减少闪烁）
        if (self.data.regionChangeTimer) {
          clearTimeout(self.data.regionChangeTimer);
        }
        
        self.data.regionChangeTimer = setTimeout(function() {
          if (self.data.allAirports) {
            self.showNearbyAirports();
          }
        }, 200);
      }
      
      // 重置缩放状态
      self.setData({
        isZooming: false
      });
    }
  },
  
  /**
   * 选择位置
   */
  chooseLocation: function() {
    var self = this;
    
    wx.chooseLocation({
      latitude: self.data.mapCenter.lat,
      longitude: self.data.mapCenter.lng,
      scale: self.data.mapScale, // 保持与当前地图相同的缩放级别
      success: function(res) {
        console.log('✅ 用户选择位置成功:', res);
        
        // 更新选中位置
        self.setData({
          selectedLocation: {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          },
          'mapCenter.lng': res.longitude,
          'mapCenter.lat': res.latitude,
          mapScale: 12, // 放大地图以更好地显示选中位置（整数缩放）
          viewMode: 'nearby' // 自动切换到附近机场模式
        });
        
        // 计算附近机场
        self.calculateNearbyAirports(res.latitude, res.longitude);
        
        // 显示提示
        wx.showToast({
          title: '已选择位置',
          icon: 'success',
          duration: 1500
        });
      },
      fail: function(error) {
        if (error.errMsg === 'chooseLocation:fail cancel') {
          console.log('用户取消选择位置');
        } else {
          console.error('❌ 选择位置失败:', error);
          wx.showToast({
            title: '选择位置失败',
            icon: 'error'
          });
        }
      }
    });
  },
  
  /**
   * 计算附近机场
   */
  calculateNearbyAirports: function(lat, lng) {
    var self = this;
    
    if (!self.data.allAirports) {
      console.warn('⚠️ 机场数据尚未加载');
      return;
    }
    
    console.log('📍 计算附近机场, 中心点:', lat, lng);
    
    // 计算所有机场与选中位置的距离
    var airportsWithDistance = self.data.allAirports.map(function(airport) {
      var distance = self.calculateDistance(lat, lng, airport.gcj02Lat, airport.gcj02Lng);
      return {
        ...airport,
        distance: distance,
        bearing: self.calculateBearing(lat, lng, airport.gcj02Lat, airport.gcj02Lng)
      };
    });
    
    // 按距离排序，取前10个
    airportsWithDistance.sort(function(a, b) {
      return a.distance - b.distance;
    });
    
    var nearbyAirports = airportsWithDistance.slice(0, 10).map(function(airport) {
      return {
        ...airport,
        distance: airport.distance.toFixed(1) // 保留一位小数
      };
    });
    
    console.log(`🏫 找到 ${nearbyAirports.length} 个附近机场`);
    
    self.setData({
      nearbyAirports: nearbyAirports
    });
    
    // 如果在附近机场模式，更新地图标记
    if (self.data.viewMode === 'nearby') {
      self.updateMapMarkers();
    }
  },
  
  /**
   * 计算两点间距离（公里）
   */
  calculateDistance: function(lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // 地球半径（公里）
    return Math.round(s * 10) / 10; // 保留一位小数
  },
  
  /**
   * 计算方位角
   */
  calculateBearing: function(lat1, lng1, lat2, lng2) {
    var dLng = (lng2 - lng1) * Math.PI / 180.0;
    var lat1Rad = lat1 * Math.PI / 180.0;
    var lat2Rad = lat2 * Math.PI / 180.0;
    
    var y = Math.sin(dLng) * Math.cos(lat2Rad);
    var x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    var bearing = Math.atan2(y, x) * 180 / Math.PI;
    return Math.round((bearing + 360) % 360);
  },
  
  /**
   * 切换显示模式
   */
  toggleViewMode: function() {
    var self = this;
    var newMode = self.data.viewMode === 'all' ? 'nearby' : 'all';
    
    self.setData({
      viewMode: newMode
    });
    
    self.updateMapMarkers();
    
    wx.showToast({
      title: newMode === 'all' ? '显示所有机场' : '显示附近机场',
      icon: 'none',
      duration: 1500
    });
  },
  
  /**
   * 更新地图标记
   */
  updateMapMarkers: function() {
    var self = this;
    
    if (self.data.viewMode === 'nearby' && self.data.selectedLocation) {
      // 附近机场模式：显示选中位置和附近机场
      var markers = [];
      var mapScale = self.data.mapScale || 10;
      
      // 添加选中位置标记
      markers.push({
        id: -1,
        latitude: self.data.selectedLocation.latitude,
        longitude: self.data.selectedLocation.longitude,
        iconPath: '/images/selected-location.png',
        width: 36,
        height: 36,
        callout: {
          content: self.data.selectedLocation.name || '选中位置',
          display: 'ALWAYS',
          fontSize: 14,
          padding: 8,
          borderRadius: 4,
          bgColor: '#ffeb3b',
          color: '#000000'
        }
      });
      
      // 添加附近机场标记
      self.data.nearbyAirports.forEach(function(airport, index) {
        // 每个marker都读取当前的showAirportLabels状态
        var displayLabel = self.data.showAirportLabels;
        
        markers.push({
          id: index,
          latitude: airport.gcj02Lat,
          longitude: airport.gcj02Lng,
          iconPath: '/images/airport-marker.png',
          width: mapScale >= 12 ? 28 : 24,
          height: mapScale >= 12 ? 28 : 24,
          callout: {
            content: `${airport.ICAOCode} - ${airport.ShortName}\n${airport.distance}km`,
            display: displayLabel ? 'ALWAYS' : 'BYCLICK',
            fontSize: mapScale >= 14 ? 14 : 12,
            padding: 8,
            borderRadius: 4,
            bgColor: '#ffffff',
            textAlign: 'center'
          },
          airportData: airport
        });
      });
      
      self.setData({
        markers: markers,
        visibleAirportCount: self.data.nearbyAirports.length
      });
    } else {
      // 所有机场模式：显示范围内所有机场
      self.showNearbyAirports();
    }
  },
  
  /**
   * 移动到当前位置
   */
  moveToCurrentLocation: function() {
    var self = this;
    
    if (self.data.currentUserLocation) {
      self.mapCtx.moveToLocation({
        latitude: self.data.currentUserLocation.latitude,
        longitude: self.data.currentUserLocation.longitude,
        success: function() {
          console.log('📍 已移动到当前位置');
        }
      });
    } else {
      self.getCurrentLocation();
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
      
      // 创建机场数据副本并格式化坐标
      var airportData = Object.assign({}, marker.airportData);
      
      // 将十进制坐标转换为航空格式
      if (airportData.Latitude && airportData.Longitude) {
        var latAviation = FlightCalculator.formatCoordinateForAviation(parseFloat(airportData.Latitude), 'lat');
        var lngAviation = FlightCalculator.formatCoordinateForAviation(parseFloat(airportData.Longitude), 'lng');
        
        // 保存原始坐标并添加航空格式坐标
        airportData.LatitudeOriginal = airportData.Latitude;
        airportData.LongitudeOriginal = airportData.Longitude;
        airportData.Latitude = latAviation;
        airportData.Longitude = lngAviation;
      }
      
      this.setData({
        selectedAirport: airportData
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
      'mapCenter.lng': airport.LongitudeOriginal || airport.Longitude,
      'mapCenter.lat': airport.LatitudeOriginal || airport.Latitude,
      mapScale: 15,
      selectedAirport: null
    });
    
    // 重新显示附近机场
    if (this.data.allAirports) {
      this.showNearbyAirports();
    }

    // 询问是否要在驾驶舱中设置为目标机场
    wx.showModal({
      title: '机场导航',
      content: `已定位到${airport.ShortName} (${airport.ICAOCode})，是否要在驾驶舱中设置为导航目标？`,
      confirmText: '前往驾驶舱',
      cancelText: '留在地图',
      success: function(res) {
        if (res.confirm) {
          // 跳转到驾驶舱页面并传递机场信息
          var targetAirport = {
            icao: airport.ICAOCode,
            iata: airport.IATACode,
            name: airport.ShortName,
            lat: airport.LatitudeOriginal || airport.Latitude,
            lng: airport.LongitudeOriginal || airport.Longitude,
            elevation: airport.Elevation
          };
          
          wx.navigateTo({
            url: '/pages/cockpit/index?targetAirport=' + encodeURIComponent(JSON.stringify(targetAirport)),
            success: function() {
              console.log('✅ 成功跳转到驾驶舱页面，目标机场:', targetAirport);
            },
            fail: function(error) {
              console.error('❌ 跳转到驾驶舱失败:', error);
              wx.showToast({
                title: '跳转失败',
                icon: 'error'
              });
            }
          });
        } else {
          wx.showToast({
            title: `已定位到${airport.ShortName}`,
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 返回上一页
   */
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 切换卫星图
   */
  toggleSatellite: function() {
    var self = this;
    var newSatelliteMode = !self.data.enableSatellite;
    
    self.setData({
      enableSatellite: newSatelliteMode
    });
    
    wx.showToast({
      title: newSatelliteMode ? '已切换到卫星图' : '已切换到普通地图',
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 切换机场标签显示
   */
  toggleAirportLabels: function() {
    var self = this;
    var newLabelMode = !self.data.showAirportLabels;
    
    self.setData({
      showAirportLabels: newLabelMode
    });
    
    // 立即重新渲染地图标记
    if (self.data.viewMode === 'nearby' && self.data.selectedLocation) {
      self.updateMapMarkers();
    } else if (self.data.allAirports) {
      self.showNearbyAirports();
    }
    
    wx.showToast({
      title: newLabelMode ? '已显示机场名称' : '已隐藏机场名称',
      icon: 'none',
      duration: 1500
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
   * 
   * 🔧 2025内存泄漏修复：
   * - 清理regionChangeTimer定时器
   * - 清理地图上下文
   */
  customOnUnload: function() {
    // 🔧 修复：清理regionChangeTimer定时器，防止内存泄漏
    if (this.data.regionChangeTimer) {
      clearTimeout(this.data.regionChangeTimer);
      this.setData({ regionChangeTimer: null });
      console.log('🧹 清理机场地图regionChangeTimer定时器');
    }
    
    // 清理地图上下文
    this.mapCtx = null;
    console.log('🧹 机场地图页面资源清理完成');
  }
};

Page(BasePage.createPage(pageConfig));