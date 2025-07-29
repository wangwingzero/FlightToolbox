/**
 * 地形图页面
 * 
 * 提供完整的地形查看和航点管理功能，包括：
 * - 交互式地形图显示
 * - 航点创建、编辑、管理
 * - 后台位置监控和提醒
 * - 地形数据查看和分析
 */

var BasePage = require('../../utils/base-page.js');
var CoordinateUtils = require('../../utils/coordinate-utils.js');

// 导入核心模块
var TerrainManager = require('../cockpit/modules/terrain-manager.js');
var WaypointManager = require('../cockpit/modules/waypoint-manager.js');
var MapRenderer = require('../cockpit/modules/map-renderer.js');
var GestureHandler = require('../cockpit/modules/gesture-handler.js');
var config = require('../cockpit/modules/config.js');

var pageConfig = {
  /**
   * 页面数据
   */
  data: {
    // 地形图状态
    terrainEnabled: true,
    showLegend: true,
    showLongPressHint: true,
    currentRange: 40,
    
    // 地图状态
    mapScale: 13,
    showCustomOverlay: false,
    mapMarkers: [],
    mapPolylines: [],
    mapCircles: [],
    
    // 航点管理
    waypoints: [],
    selectedWaypoint: null,
    showWaypointList: false,
    
    // 航点编辑器
    showWaypointEditor: false,
    waypointEditMode: false,
    editingWaypointId: '',
    waypointInitialData: null,
    selectedTerrainInfo: null,
    
    // GPS定位
    currentLocation: null,
    autoLocation: true,
    
    // 设置
    showSettings: false,
    vibrationEnabled: true,
    
    // 地形图例数据
    terrainLegend: [
      { color: '#0066CC', label: '海平面 0m' },
      { color: '#00CC00', label: '低地 200m' },
      { color: '#66CC00', label: '平原 500m' },
      { color: '#CCCC00', label: '丘陵 1000m' },
      { color: '#CC6600', label: '山地 2000m' },
      { color: '#996633', label: '高山 4000m' },
      { color: '#FFFFFF', label: '雪峰 6000m+' }
    ],
    
    // 航点类型映射
    waypointTypeNames: {
      'waypoint': '普通航点',
      'checkpoint': '检查点', 
      'destination': '目的地',
      'alternate': '备用点',
      'holding': '等待点'
    }
  },

  /**
   * 页面加载
   */
  customOnLoad: function(options) {
    console.log('地形图页面加载');
    
    // 初始化管理器
    this.initializeManagers();
    
    // 加载保存的设置
    this.loadSettings();
    
    // 加载航点数据
    this.loadWaypoints();
    
    // 启动位置监控
    this.startLocationMonitoring();
    
    // 显示长按提示（3秒后隐藏）
    setTimeout(() => {
      this.setData({ showLongPressHint: false });
    }, 3000);
  },

  /**
   * 页面显示
   */
  customOnShow: function() {
    console.log('地形图页面显示');
    
    // 刷新航点数据
    this.refreshWaypoints();
    
    // 如果开启自动定位，获取当前位置
    if (this.data.autoLocation) {
      this.getCurrentLocation();
    }
  },

  /**
   * 页面隐藏
   */
  customOnHide: function() {
    console.log('地形图页面隐藏');
    
    // 保存设置
    this.saveSettings();
  },

  /**
   * 页面卸载
   */
  customOnUnload: function() {
    console.log('地形图页面卸载');
    
    // 销毁管理器
    this.destroyManagers();
  },

  /**
   * 初始化管理器
   */
  initializeManagers: function() {
    var self = this;
    
    try {
      // 创建地形管理器
      this.terrainManager = TerrainManager.create(config);
      this.terrainManager.init({
        page: this,
        callbacks: {
          onTerrainDataLoaded: function(tileKey, terrainData) {
            console.log('地形数据加载完成:', tileKey);
            // 触发地图重新渲染
            if (self.mapRenderer) {
              self.mapRenderer.render();
            }
          },
          onTerrainToggle: function(enabled) {
            self.setData({ terrainEnabled: enabled });
          }
        }
      });

      // 创建航点管理器
      this.waypointManager = WaypointManager.create(config);
      this.waypointManager.init({
        page: this,
        callbacks: {
          onWaypointCreated: function(waypoint) {
            console.log('航点创建成功:', waypoint.name);
            self.refreshWaypoints();
            self.showToast('航点创建成功');
          },
          onWaypointUpdated: function(waypoint) {
            console.log('航点更新成功:', waypoint.name);
            self.refreshWaypoints();
            self.showToast('航点更新成功');
          },
          onWaypointDeleted: function(waypoint) {
            console.log('航点删除成功:', waypoint.name);
            self.refreshWaypoints();
            self.showToast('航点删除成功');
          },
          onLocationUpdate: function(location) {
            self.handleLocationUpdate(location);
          },
          onWaypointAlert: function(waypoint, distance) {
            self.handleWaypointAlert(waypoint, distance);
          },
          onLocationError: function(error) {
            console.error('位置更新失败:', error);
          }
        }
      });

      // 创建地图渲染器
      this.mapRenderer = MapRenderer.create('terrainMapCanvas', config);
      this.mapRenderer.init(this, {
        terrainManager: this.terrainManager,
        waypointManager: this.waypointManager,
        onCanvasReady: function(info) {
          console.log('地形图Canvas初始化完成:', info);
          self.mapRenderer.setTerrainEnabled(self.data.terrainEnabled);
        },
        onCanvasError: function(error) {
          console.error('Canvas初始化失败:', error);
          self.showToast('地图初始化失败');
        }
      });

      // 创建手势处理器
      this.gestureHandler = GestureHandler.create(config);
      this.gestureHandler.init('terrainMapCanvas', {
        onTap: function(event) {
          console.log('地图点击:', event);
          // 处理普通点击
        },
        onLongPress: function(event) {
          console.log('地图长按:', event);
          self.handleMapLongPress(event);
        },
        onWaypointClick: function(waypoint) {
          console.log('航点点击:', waypoint);
          self.handleWaypointClick(waypoint);
        },
        onZoom: function(event) {
          console.log('缩放手势:', event);
          self.handleMapZoom(event);
        }
      }, {
        mapRenderer: this.mapRenderer,
        waypointManager: this.waypointManager,
        terrainManager: this.terrainManager
      });

      console.log('所有管理器初始化完成');
      
    } catch (error) {
      console.error('管理器初始化失败:', error);
      this.handleError(error, '初始化地形图功能');
    }
  },

  /**
   * 销毁管理器
   */
  destroyManagers: function() {
    try {
      if (this.gestureHandler) {
        this.gestureHandler.destroy();
        this.gestureHandler = null;
      }
      
      if (this.mapRenderer) {
        this.mapRenderer.destroy();
        this.mapRenderer = null;
      }
      
      if (this.waypointManager) {
        this.waypointManager.destroy();
        this.waypointManager = null;
      }
      
      if (this.terrainManager) {
        this.terrainManager.destroy();
        this.terrainManager = null;
      }
      
      console.log('所有管理器已销毁');
      
    } catch (error) {
      console.error('管理器销毁失败:', error);
    }
  },

  /**
   * 处理地图长按事件
   */
  handleMapLongPress: function(event) {
    if (this.data.vibrationEnabled) {
      wx.vibrateShort({ type: 'medium' });
    }
    
    // 设置航点初始数据
    this.setData({
      waypointInitialData: {
        lat: event.gpsCoordinate.lat,
        lng: event.gpsCoordinate.lng,
        name: '航点' + (this.data.waypoints.length + 1)
      },
      selectedTerrainInfo: event.terrainInfo,
      showWaypointEditor: true,
      waypointEditMode: false,
      editingWaypointId: ''
    });
  },

  /**
   * 处理航点点击事件
   */
  handleWaypointClick: function(waypoint) {
    if (this.data.selectedWaypoint === waypoint.id) {
      // 取消选择
      this.setData({ selectedWaypoint: null });
    } else {
      // 选择航点
      this.setData({ selectedWaypoint: waypoint.id });
    }
    
    if (this.mapRenderer) {
      this.mapRenderer.setSelectedWaypoint(waypoint.id);
    }
  },

  /**
   * 处理地图缩放
   */
  handleMapZoom: function(event) {
    if (!this.mapRenderer) return;
    
    var zoomResult = this.gestureHandler.handleZoom(
      event.deltaDistance,
      config.map.zoomLevels,
      this.mapRenderer.currentZoomIndex
    );
    
    if (zoomResult.changed) {
      this.mapRenderer.currentZoomIndex = zoomResult.newIndex;
      this.mapRenderer.updateData({ mapRange: zoomResult.newRange });
      this.setData({ currentRange: zoomResult.newRange });
    }
  },

  /**
   * 处理位置更新
   */
  handleLocationUpdate: function(location) {
    this.setData({ currentLocation: location });
    
    // 更新地图渲染器的位置数据
    if (this.mapRenderer) {
      this.mapRenderer.updateData({
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude
      });
    }
    
    // 更新手势处理器的位置信息
    if (this.gestureHandler) {
      this.gestureHandler.updateCurrentPosition(location);
    }
  },

  /**
   * 处理航点到达提醒
   */
  handleWaypointAlert: function(waypoint, distance) {
    // 显示提醒弹窗
    wx.showModal({
      title: '航点到达提醒',
      content: `接近航点: ${waypoint.name}\n当前距离: ${distance.toFixed(1)}海里`,
      showCancel: false,
      confirmText: '知道了',
      success: (res) => {
        console.log('航点提醒已确认');
      }
    });
    
    // 震动提醒
    if (this.data.vibrationEnabled) {
      wx.vibrateShort({ type: 'heavy' });
    }
  },

  /**
   * 启动位置监控
   */
  startLocationMonitoring: function() {
    if (this.waypointManager) {
      this.waypointManager.startLocationMonitoring();
    }
  },

  /**
   * 获取当前位置
   */
  getCurrentLocation: function() {
    var self = this;
    
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: function(res) {
        self.handleLocationUpdate({
          latitude: res.latitude,
          longitude: res.longitude,
          altitude: res.altitude,
          accuracy: res.accuracy,
          timestamp: Date.now()
        });
      },
      fail: function(error) {
        console.error('获取位置失败:', error);
        self.showToast('定位失败，请检查位置权限');
      }
    });
  },

  /**
   * 刷新航点数据
   */
  refreshWaypoints: function() {
    if (!this.waypointManager) return;
    
    var waypoints = this.waypointManager.getActiveWaypoints();
    this.setData({ waypoints: waypoints });
    
    // 更新地图显示
    this.updateMapMarkers();
    this.updateMapPolylines();
    this.updateMapCircles();
    
    // 更新地图渲染器的航点数据（如果启用Canvas覆盖层）
    if (this.mapRenderer && this.data.showCustomOverlay) {
      this.mapRenderer.updateWaypoints(waypoints);
    }
  },

  /**
   * 加载航点数据
   */
  loadWaypoints: function() {
    this.refreshWaypoints();
  },

  /**
   * 加载设置
   */
  loadSettings: function() {
    try {
      var settings = wx.getStorageSync('terrain_map_settings') || {};
      
      this.setData({
        terrainEnabled: settings.terrainEnabled !== false,
        showLegend: settings.showLegend !== false,
        showLongPressHint: settings.showLongPressHint !== false,
        autoLocation: settings.autoLocation !== false,
        vibrationEnabled: settings.vibrationEnabled !== false
      });
      
      console.log('设置加载完成');
      
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  },

  /**
   * 保存设置
   */
  saveSettings: function() {
    try {
      var settings = {
        terrainEnabled: this.data.terrainEnabled,
        showLegend: this.data.showLegend,
        showLongPressHint: this.data.showLongPressHint,
        autoLocation: this.data.autoLocation,
        vibrationEnabled: this.data.vibrationEnabled
      };
      
      wx.setStorageSync('terrain_map_settings', settings);
      console.log('设置保存完成');
      
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  },

  // ========== 地图事件处理 ==========

  /**
   * 地图长按事件
   */
  onMapLongTap: function(e) {
    console.log('地图长按:', e);
    
    if (this.data.vibrationEnabled) {
      wx.vibrateShort({ type: 'medium' });
    }
    
    var lat = e.detail.latitude;
    var lng = e.detail.longitude;
    
    // 设置航点初始数据
    this.setData({
      waypointInitialData: {
        lat: lat,
        lng: lng,
        name: '航点' + (this.data.waypoints.length + 1)
      },
      selectedTerrainInfo: {
        elevation: 0, // 这里可以通过地图API或本地数据获取真实海拔
        terrainType: 'unknown'
      },
      showWaypointEditor: true,
      waypointEditMode: false,
      editingWaypointId: ''
    });
  },

  /**
   * 地图点击事件
   */
  onMapTap: function(e) {
    console.log('地图点击:', e);
    // 可以在这里处理地图点击逻辑
  },

  /**
   * 地图标记点击事件
   */
  onMarkerTap: function(e) {
    console.log('标记点击:', e);
    var markerId = e.detail.markerId;
    
    // 查找对应的航点
    var waypoint = this.data.waypoints.find(wp => wp.id === markerId);
    if (waypoint) {
      this.handleWaypointClick(waypoint);
    }
  },

  /**
   * 地图区域变化事件
   */
  onRegionChange: function(e) {
    console.log('地图区域变化:', e);
    
    if (e.type === 'end') {
      // 更新当前显示的经纬度和缩放级别
      this.setData({
        currentLocation: {
          latitude: e.detail.centerLocation.latitude,
          longitude: e.detail.centerLocation.longitude
        }
      });
    }
  },

  /**
   * 地图缩放变化事件
   */
  onZoomChange: function(e) {
    console.log('地图缩放变化:', e);
    
    var newScale = e.detail.zoom;
    this.setData({
      mapScale: newScale
    });
    
    // 根据缩放级别计算对应的海里范围
    var range = this.scaleToRange(newScale);
    this.setData({
      currentRange: range
    });
  },

  /**
   * 地图模式切换
   */
  onMapModeToggle: function() {
    var enabled = !this.data.terrainEnabled;
    this.setData({ 
      terrainEnabled: enabled,
      mapScale: this.data.mapScale // 触发地图更新
    });
    
    this.showToast(enabled ? '已切换到卫星地图' : '已切换到标准地图');
  },

  /**
   * 自定义覆盖层开关
   */
  onCustomOverlayToggle: function(e) {
    this.setData({ showCustomOverlay: e.detail.value });
    
    if (e.detail.value) {
      // 初始化Canvas覆盖层
      this.initCanvasOverlay();
    }
  },

  /**
   * 缩放级别转换为海里范围
   */
  scaleToRange: function(scale) {
    // 根据微信地图缩放级别计算大概的显示范围（海里）
    // 这是一个近似计算
    var ranges = {
      3: 1000,
      4: 500,
      5: 200,
      6: 100,
      7: 50,
      8: 25,
      9: 15,
      10: 10,
      11: 5,
      12: 3,
      13: 2,
      14: 1.5,
      15: 1,
      16: 0.5,
      17: 0.3,
      18: 0.2
    };
    
    return ranges[scale] || 40;
  },

  /**
   * 初始化Canvas覆盖层
   */
  initCanvasOverlay: function() {
    if (!this.data.showCustomOverlay) return;
    
    // 这里可以初始化Canvas覆盖层用于自定义绘制
    // 比如绘制航迹、距离圈等
    console.log('初始化Canvas覆盖层');
  },

  /**
   * 更新地图标记
   */
  updateMapMarkers: function() {
    var markers = [];
    
    // 添加航点标记
    for (var i = 0; i < this.data.waypoints.length; i++) {
      var waypoint = this.data.waypoints[i];
      
      markers.push({
        id: waypoint.id,
        latitude: waypoint.lat,
        longitude: waypoint.lng,
        title: waypoint.name,
        iconPath: '/images/waypoint-marker.png',
        width: 30,
        height: 30,
        callout: {
          content: waypoint.name,
          fontSize: 12,
          borderRadius: 5,
          bgColor: waypoint.enabled ? '#FF6600' : '#666666'
        }
      });
    }
    
    // 添加当前位置标记
    if (this.data.currentLocation) {
      markers.push({
        id: 'current-location',
        latitude: this.data.currentLocation.latitude,
        longitude: this.data.currentLocation.longitude,
        title: '当前位置',
        iconPath: '/images/aircraft-marker.png',
        width: 25,
        height: 25
      });
    }
    
    this.setData({ mapMarkers: markers });
  },

  /**
   * 更新地图航线
   */
  updateMapPolylines: function() {
    var polylines = [];
    
    // 如果有多个航点，绘制航线
    if (this.data.waypoints.length > 1) {
      var points = [];
      for (var i = 0; i < this.data.waypoints.length; i++) {
        var waypoint = this.data.waypoints[i];
        if (waypoint.enabled) {
          points.push({
            latitude: waypoint.lat,
            longitude: waypoint.lng
          });
        }
      }
      
      if (points.length > 1) {
        polylines.push({
          points: points,
          color: '#FF6600',
          width: 3,
          dottedLine: false
        });
      }
    }
    
    this.setData({ mapPolylines: polylines });
  },

  /**
   * 更新地图圆圈（航点提醒范围）
   */
  updateMapCircles: function() {
    var circles = [];
    
    for (var i = 0; i < this.data.waypoints.length; i++) {
      var waypoint = this.data.waypoints[i];
      
      if (waypoint.enabled && waypoint.alertRadius > 0) {
        circles.push({
          latitude: waypoint.lat,
          longitude: waypoint.lng,
          radius: waypoint.alertRadius * 1852, // 海里转米
          strokeWidth: 2,
          strokeColor: '#FF6600',
          fillColor: 'rgba(255, 102, 0, 0.1)'
        });
      }
    }
    
    this.setData({ mapCircles: circles });
  },

  /**
   * 地形图开关
   */
  onTerrainToggle: function() {
    var enabled = !this.data.terrainEnabled;
    this.setData({ terrainEnabled: enabled });
    
    if (this.mapRenderer) {
      this.mapRenderer.setTerrainEnabled(enabled);
    }
    
    if (this.terrainManager) {
      this.terrainManager.setEnabled(enabled);
    }
    
    this.showToast(enabled ? '地形图已开启' : '地形图已关闭');
  },

  /**
   * 航点列表开关
   */
  onWaypointListToggle: function() {
    this.setData({ showWaypointList: !this.data.showWaypointList });
  },

  /**
   * 当前位置定位
   */
  onCurrentLocation: function() {
    this.getCurrentLocation();
    this.showToast('正在定位...');
  },

  /**
   * 设置面板开关
   */
  onSettings: function() {
    this.setData({ showSettings: true });
  },

  onSettingsClose: function() {
    this.setData({ showSettings: false });
    this.saveSettings();
  },

  onSettingsOverlayTap: function() {
    this.onSettingsClose();
  },

  onSettingsContentTap: function() {
    // 阻止事件冒泡
  },

  /**
   * Canvas触摸事件
   */
  onCanvasTouchStart: function(e) {
    if (this.gestureHandler) {
      this.gestureHandler.onTouchStart(e);
    }
  },

  onCanvasTouchMove: function(e) {
    if (this.gestureHandler) {
      this.gestureHandler.onTouchMove(e);
    }
  },

  onCanvasTouchEnd: function(e) {
    if (this.gestureHandler) {
      this.gestureHandler.onTouchEnd(e);
    }
  },

  /**
   * 航点相关事件
   */
  onWaypointSelect: function(e) {
    var waypointId = e.currentTarget.dataset.waypointId;
    this.setData({ 
      selectedWaypoint: this.data.selectedWaypoint === waypointId ? null : waypointId 
    });
  },

  onWaypointEdit: function(e) {
    var waypointId = e.currentTarget.dataset.waypointId;
    var waypoint = this.data.waypoints.find(wp => wp.id === waypointId);
    
    if (waypoint) {
      this.setData({
        waypointInitialData: waypoint,
        showWaypointEditor: true,
        waypointEditMode: true,
        editingWaypointId: waypointId,
        selectedTerrainInfo: null
      });
    }
  },

  onWaypointToggle: function(e) {
    var waypointId = e.currentTarget.dataset.waypointId;
    var waypoint = this.data.waypoints.find(wp => wp.id === waypointId);
    
    if (waypoint && this.waypointManager) {
      this.waypointManager.updateWaypoint(waypointId, {
        enabled: !waypoint.enabled
      });
    }
  },

  onCreateWaypoint: function() {
    if (this.data.currentLocation) {
      this.setData({
        waypointInitialData: {
          lat: this.data.currentLocation.latitude,
          lng: this.data.currentLocation.longitude,
          name: '航点' + (this.data.waypoints.length + 1)
        },
        selectedTerrainInfo: null,
        showWaypointEditor: true,
        waypointEditMode: false,
        editingWaypointId: ''
      });
    } else {
      this.showToast('请先获取位置信息');
    }
  },

  /**
   * 航点编辑器事件
   */
  onWaypointEditorClose: function() {
    this.setData({ showWaypointEditor: false });
  },

  onWaypointEditorCancel: function() {
    this.setData({ showWaypointEditor: false });
  },

  onWaypointCreate: function(e) {
    if (this.waypointManager) {
      try {
        this.waypointManager.createWaypoint(e.detail.waypointData);
        this.setData({ showWaypointEditor: false });
      } catch (error) {
        this.handleError(error, '创建航点');
      }
    }
  },

  onWaypointSave: function(e) {
    if (this.waypointManager) {
      try {
        this.waypointManager.updateWaypoint(e.detail.waypointId, e.detail.waypointData);
        this.setData({ showWaypointEditor: false });
      } catch (error) {
        this.handleError(error, '保存航点');
      }
    }
  },

  onWaypointDelete: function(e) {
    if (this.waypointManager) {
      try {
        this.waypointManager.deleteWaypoint(e.detail.waypointId);
        this.setData({ showWaypointEditor: false });
      } catch (error) {
        this.handleError(error, '删除航点');
      }
    }
  },

  onMapSelect: function(e) {
    // 处理地图选择坐标模式
    this.showToast('请在地图上选择位置');
  },

  /**
   * 导入导出功能
   */
  onImportWaypoints: function() {
    var self = this;
    
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: function(res) {
        // 处理文件导入
        console.log('选择文件:', res.tempFiles);
        self.showToast('导入功能开发中...');
      }
    });
  },

  onExportWaypoints: function() {
    if (this.waypointManager) {
      try {
        var exportData = this.waypointManager.exportWaypoints();
        console.log('导出数据:', exportData);
        this.showToast('导出功能开发中...');
      } catch (error) {
        this.handleError(error, '导出航点');
      }
    }
  },

  /**
   * 设置相关事件
   */
  onLegendToggle: function(e) {
    this.setData({ showLegend: e.detail.value });
  },

  onHintToggle: function(e) {
    this.setData({ showLongPressHint: e.detail.value });
  },

  onAutoLocationToggle: function(e) {
    this.setData({ autoLocation: e.detail.value });
  },

  onVibrationToggle: function(e) {
    this.setData({ vibrationEnabled: e.detail.value });
  },

  // ========== 辅助函数 ==========

  /**
   * 格式化坐标显示
   */
  formatCoordinate: function(lat, lng) {
    if (!lat || !lng) return '--°--\'--"N, ---°--\'--"E';
    return CoordinateUtils.formatDMS(lat, lng, 1);
  },

  /**
   * 格式化距离显示
   */
  formatDistance: function(distance) {
    return CoordinateUtils.formatDistance(distance);
  },

  /**
   * 格式化方位角显示
   */
  formatBearing: function(bearing) {
    return Math.round(bearing);
  },

  /**
   * 格式化时间显示
   */
  formatTime: function(timestamp) {
    var date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  },

  /**
   * 获取航点类型名称
   */
  getWaypointTypeName: function(type) {
    return this.data.waypointTypeNames[type] || '未知类型';
  },

  /**
   * 显示Toast消息
   */
  showToast: function(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));