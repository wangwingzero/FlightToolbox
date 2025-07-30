/**
 * 航点管理器模块
 * 
 * 提供完整的航点管理功能，包括：
 * - 航点数据的创建、编辑、删除、存储
 * - 距离计算和实时监控
 * - 航点到达提醒和增强位置监控（前台持续定位）
 * - 航点数据的导入导出
 * - 航点路径规划和优化
 * 
 * 设计原则：
 * - 离线优先：本地存储航点数据
 * - 实时监控：高效的距离计算算法
 * - 电量优化：智能的前台位置监控策略
 * - 用户友好：直观的航点管理界面
 * - 数据安全：航点数据备份和恢复
 */

var WaypointManager = {
  /**
   * 创建航点管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 内部状态
      config: config,
      waypoints: new Map(),        // 航点数据存储
      activeWaypoints: new Set(),  // 激活的航点ID集合
      monitoringEnabled: false,    // 监控状态
      backgroundLocationEnabled: false,
      
      // 位置监控相关
      currentPosition: null,
      lastAlertTime: new Map(),    // 防止重复提醒
      locationUpdateTimer: null,
      backgroundLocationUpdateId: null,
      
      // 距离计算缓存
      distanceCache: new Map(),
      lastDistanceUpdate: 0,
      
      // 存储键名
      storageKeys: {
        waypoints: 'cockpit_waypoints',
        activeWaypoints: 'cockpit_active_waypoints',
        settings: 'cockpit_waypoint_settings'
      },
      
      // 默认设置
      settings: {
        defaultAlertRadius: 2,      // 默认提醒半径（海里）
        minAlertInterval: 60000,    // 最小提醒间隔（毫秒）
        locationUpdateInterval: 10000, // 位置更新间隔（毫秒）
        backgroundUpdateInterval: 30000, // 后台更新间隔（毫秒）
        maxWaypoints: 50,           // 最大航点数量
        autoSave: true              // 自动保存
      },
      
      /**
       * 初始化航点管理器
       * @param {Object} options 初始化选项
       */
      init: function(options) {
        manager.pageRef = options.page;
        manager.callbacks = options.callbacks || {};
        
        // 加载存储的设置
        manager.loadSettings();
        
        // 加载航点数据
        manager.loadWaypoints();
        
        // 加载激活的航点
        manager.loadActiveWaypoints();
        
        // 初始化位置监控
        manager.initLocationMonitoring();
        
        console.log('航点管理器初始化完成');
        console.log('已加载航点数量:', manager.waypoints.size);
        console.log('激活航点数量:', manager.activeWaypoints.size);
      },
      
      /**
       * 创建新航点
       * @param {Object} waypointData 航点数据
       * @returns {String} 航点ID
       */
      createWaypoint: function(waypointData) {
        // 验证输入数据
        if (!manager.validateWaypointData(waypointData)) {
          throw new Error('航点数据格式不正确');
        }
        
        // 检查航点数量限制
        if (manager.waypoints.size >= manager.settings.maxWaypoints) {
          throw new Error('航点数量已达上限 (' + manager.settings.maxWaypoints + ')');
        }
        
        // 生成唯一ID
        var waypointId = manager.generateWaypointId();
        
        // 创建完整的航点对象
        var waypoint = {
          id: waypointId,
          name: waypointData.name || '航点' + (manager.waypoints.size + 1),
          lat: parseFloat(waypointData.lat),
          lng: parseFloat(waypointData.lng),
          altitude: waypointData.altitude || null, // 地形高度（米）
          alertRadius: waypointData.alertRadius || manager.settings.defaultAlertRadius,
          enabled: waypointData.enabled !== false, // 默认启用
          createTime: Date.now(),
          updateTime: Date.now(),
          notes: waypointData.notes || '',
          color: waypointData.color || '#FF6600', // 默认橙色
          type: waypointData.type || 'waypoint'    // waypoint | checkpoint | destination
        };
        
        // 存储航点
        manager.waypoints.set(waypointId, waypoint);
        
        // 如果启用，添加到激活列表
        if (waypoint.enabled) {
          manager.activeWaypoints.add(waypointId);
        }
        
        // 自动保存
        if (manager.settings.autoSave) {
          manager.saveWaypoints();
          manager.saveActiveWaypoints();
        }
        
        // 通知回调
        if (manager.callbacks.onWaypointCreated) {
          manager.callbacks.onWaypointCreated(waypoint);
        }
        
        console.log('创建航点:', waypoint.name, '坐标:', waypoint.lat, waypoint.lng);
        return waypointId;
      },
      
      /**
       * 更新航点数据
       * @param {String} waypointId 航点ID
       * @param {Object} updateData 更新数据
       */
      updateWaypoint: function(waypointId, updateData) {
        var waypoint = manager.waypoints.get(waypointId);
        if (!waypoint) {
          throw new Error('航点不存在: ' + waypointId);
        }
        
        // 备份原始数据（用于回滚）
        var originalWaypoint = JSON.parse(JSON.stringify(waypoint));
        
        try {
          // 更新数据
          Object.keys(updateData).forEach(function(key) {
            if (key !== 'id' && key !== 'createTime') { // 保护关键字段
              waypoint[key] = updateData[key];
            }
          });
          
          waypoint.updateTime = Date.now();
          
          // 验证更新后的数据
          if (!manager.validateWaypointData(waypoint)) {
            throw new Error('更新后的航点数据格式不正确');
          }
          
          // 更新激活状态
          if (waypoint.enabled) {
            manager.activeWaypoints.add(waypointId);
          } else {
            manager.activeWaypoints.delete(waypointId);
          }
          
          // 自动保存
          if (manager.settings.autoSave) {
            manager.saveWaypoints();
            manager.saveActiveWaypoints();
          }
          
          // 清除距离缓存
          manager.clearDistanceCache(waypointId);
          
          // 通知回调
          if (manager.callbacks.onWaypointUpdated) {
            manager.callbacks.onWaypointUpdated(waypoint, originalWaypoint);
          }
          
          console.log('更新航点:', waypoint.name);
          
        } catch (error) {
          // 回滚数据
          manager.waypoints.set(waypointId, originalWaypoint);
          throw error;
        }
      },
      
      /**
       * 删除航点
       * @param {String} waypointId 航点ID
       */
      deleteWaypoint: function(waypointId) {
        var waypoint = manager.waypoints.get(waypointId);
        if (!waypoint) {
          throw new Error('航点不存在: ' + waypointId);
        }
        
        // 从存储中删除
        manager.waypoints.delete(waypointId);
        manager.activeWaypoints.delete(waypointId);
        
        // 清除相关缓存
        manager.clearDistanceCache(waypointId);
        manager.lastAlertTime.delete(waypointId);
        
        // 自动保存
        if (manager.settings.autoSave) {
          manager.saveWaypoints();
          manager.saveActiveWaypoints();
        }
        
        // 通知回调
        if (manager.callbacks.onWaypointDeleted) {
          manager.callbacks.onWaypointDeleted(waypoint);
        }
        
        console.log('删除航点:', waypoint.name);
      },
      
      /**
       * 获取航点列表
       * @param {Object} filter 过滤条件
       * @returns {Array} 航点数组
       */
      getWaypoints: function(filter) {
        var waypoints = Array.from(manager.waypoints.values());
        
        if (!filter) {
          return waypoints;
        }
        
        return waypoints.filter(function(waypoint) {
          // 按启用状态过滤
          if (filter.enabled !== undefined && waypoint.enabled !== filter.enabled) {
            return false;
          }
          
          // 按类型过滤
          if (filter.type && waypoint.type !== filter.type) {
            return false;
          }
          
          // 按距离过滤
          if (filter.maxDistance && manager.currentPosition) {
            var distance = manager.calculateDistance(
              manager.currentPosition.latitude,
              manager.currentPosition.longitude,
              waypoint.lat,
              waypoint.lng
            );
            if (distance > filter.maxDistance) {
              return false;
            }
          }
          
          return true;
        });
      },
      
      /**
       * 获取激活的航点列表
       * @returns {Array} 激活的航点数组
       */
      getActiveWaypoints: function() {
        var activeWaypoints = [];
        
        manager.activeWaypoints.forEach(function(waypointId) {
          var waypoint = manager.waypoints.get(waypointId);
          if (waypoint && waypoint.enabled) {
            // 添加实时距离信息
            if (manager.currentPosition) {
              waypoint.distance = manager.calculateDistance(
                manager.currentPosition.latitude,
                manager.currentPosition.longitude,
                waypoint.lat,
                waypoint.lng
              );
            }
            activeWaypoints.push(waypoint);
          }
        });
        
        // 按距离排序（近的在前）
        activeWaypoints.sort(function(a, b) {
          return (a.distance || Infinity) - (b.distance || Infinity);
        });
        
        return activeWaypoints;
      },
      
      /**
       * 计算两点间距离（海里）
       * @param {Number} lat1 起点纬度
       * @param {Number} lng1 起点经度
       * @param {Number} lat2 终点纬度
       * @param {Number} lng2 终点经度
       * @returns {Number} 距离（海里）
       */
      calculateDistance: function(lat1, lng1, lat2, lng2) {
        // 使用Haversine公式计算球面距离
        var R = 3440.065; // 地球半径（海里）
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      },
      
      /**
       * 启动位置监控
       */
      startLocationMonitoring: function() {
        if (manager.monitoringEnabled) {
          return;
        }
        
        manager.monitoringEnabled = true;
        
        // 启动前台位置监控
        manager.locationUpdateTimer = setInterval(function() {
          manager.updateCurrentLocation();
        }, manager.settings.locationUpdateInterval);
        
        // 启动后台位置监控（如果有激活的航点）
        if (manager.activeWaypoints.size > 0) {
          manager.startBackgroundLocationMonitoring();
        }
        
        console.log('位置监控已启动');
        
        // 通知回调
        if (manager.callbacks.onMonitoringStarted) {
          manager.callbacks.onMonitoringStarted();
        }
      },
      
      /**
       * 停止位置监控
       */
      stopLocationMonitoring: function() {
        manager.monitoringEnabled = false;
        
        // 停止前台定时器
        if (manager.locationUpdateTimer) {
          clearInterval(manager.locationUpdateTimer);
          manager.locationUpdateTimer = null;
        }
        
        // 停止后台位置监控
        manager.stopBackgroundLocationMonitoring();
        
        console.log('位置监控已停止');
        
        // 通知回调
        if (manager.callbacks.onMonitoringStopped) {
          manager.callbacks.onMonitoringStopped();
        }
      },
      
      /**
       * 启动增强位置监控（使用前台持续定位API）
       */
      startBackgroundLocationMonitoring: function() {
        if (manager.backgroundLocationEnabled) {
          return;
        }
        
        try {
          // 使用前台持续定位API（wx.startLocationUpdate）
          wx.startLocationUpdate({
            type: 'gcj02',
            success: function() {
              manager.backgroundLocationEnabled = true;
              
              // 监听位置更新
              wx.onLocationChange(function(res) {
                manager.handleLocationUpdate(res, false); // 注意：这是前台定位，不是后台
              });
              
              console.log('增强位置监控已启动（前台持续定位）');
            },
            fail: function(error) {
              console.error('启动增强位置监控失败:', error);
              // 降级为定时获取位置
              manager.increaseForegroundMonitoringFrequency();
            }
          });
        } catch (error) {
          console.error('增强位置监控启动异常:', error);
        }
      },
      
      /**
       * 停止增强位置监控
       */
      stopBackgroundLocationMonitoring: function() {
        if (!manager.backgroundLocationEnabled) {
          return;
        }
        
        try {
          wx.stopLocationUpdate({
            success: function() {
              manager.backgroundLocationEnabled = false;
              // 取消位置变化监听
              wx.offLocationChange();
              console.log('增强位置监控已停止');
            }
          });
        } catch (error) {
          console.error('停止增强位置监控失败:', error);
        }
      },
      
      /**
       * 更新当前位置
       */
      updateCurrentLocation: function() {
        wx.getLocation({
          type: 'gcj02',
          altitude: true,
          success: function(res) {
            manager.handleLocationUpdate(res, false);
          },
          fail: function(error) {
            console.error('位置更新失败:', error);
            
            // 通知回调
            if (manager.callbacks.onLocationError) {
              manager.callbacks.onLocationError(error);
            }
          }
        });
      },
      
      /**
       * 处理位置更新
       * @param {Object} locationData 位置数据
       * @param {Boolean} isBackground 是否来自后台
       */
      handleLocationUpdate: function(locationData, isBackground) {
        manager.currentPosition = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          altitude: locationData.altitude,
          accuracy: locationData.accuracy,
          timestamp: Date.now(),
          isBackground: isBackground
        };
        
        // 检查航点到达提醒
        manager.checkWaypointAlerts();
        
        // 更新距离缓存
        manager.updateDistanceCache();
        
        // 通知回调
        if (manager.callbacks.onLocationUpdate) {
          manager.callbacks.onLocationUpdate(manager.currentPosition);
        }
      },
      
      /**
       * 检查航点到达提醒
       */
      checkWaypointAlerts: function() {
        if (!manager.currentPosition || manager.activeWaypoints.size === 0) {
          return;
        }
        
        var currentTime = Date.now();
        
        manager.activeWaypoints.forEach(function(waypointId) {
          var waypoint = manager.waypoints.get(waypointId);
          if (!waypoint || !waypoint.enabled) {
            return;
          }
          
          // 检查是否需要跳过提醒（防止重复）
          var lastAlert = manager.lastAlertTime.get(waypointId);
          if (lastAlert && (currentTime - lastAlert) < manager.settings.minAlertInterval) {
            return;
          }
          
          // 计算距离
          var distance = manager.calculateDistance(
            manager.currentPosition.latitude,
            manager.currentPosition.longitude,
            waypoint.lat,
            waypoint.lng
          );
          
          // 检查是否进入提醒范围
          if (distance <= waypoint.alertRadius) {
            manager.triggerWaypointAlert(waypoint, distance);
            manager.lastAlertTime.set(waypointId, currentTime);
          }
        });
      },
      
      /**
       * 触发航点到达提醒
       * @param {Object} waypoint 航点对象
       * @param {Number} distance 当前距离
       */
      triggerWaypointAlert: function(waypoint, distance) {
        var alertMessage = '接近航点: ' + waypoint.name + 
                          '\n距离: ' + distance.toFixed(1) + '海里';
        
        // 显示模态提醒
        wx.showModal({
          title: '航点到达提醒',
          content: alertMessage,
          showCancel: false,
          confirmText: '知道了',
          success: function(res) {
            console.log('航点提醒已确认:', waypoint.name);
          }
        });
        
        // 触发振动提醒
        wx.vibrateShort({
          type: 'medium'
        });
        
        // 通知回调
        if (manager.callbacks.onWaypointAlert) {
          manager.callbacks.onWaypointAlert(waypoint, distance);
        }
        
        console.log('触发航点提醒:', waypoint.name, '距离:', distance.toFixed(1) + 'NM');
      },
      
      /**
       * 验证航点数据
       * @param {Object} waypointData 航点数据
       * @returns {Boolean} 验证结果
       */
      validateWaypointData: function(waypointData) {
        if (!waypointData) return false;
        
        // 检查必需字段
        if (typeof waypointData.lat !== 'number' || 
            typeof waypointData.lng !== 'number') {
          return false;
        }
        
        // 检查坐标范围
        if (waypointData.lat < -90 || waypointData.lat > 90 ||
            waypointData.lng < -180 || waypointData.lng > 180) {
          return false;
        }
        
        // 检查提醒半径
        if (waypointData.alertRadius !== undefined &&
            (waypointData.alertRadius < 0 || waypointData.alertRadius > 100)) {
          return false;
        }
        
        return true;
      },
      
      /**
       * 生成航点ID
       * @returns {String} 唯一ID
       */
      generateWaypointId: function() {
        return 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      },
      
      /**
       * 清除距离缓存
       * @param {String} waypointId 航点ID（可选）
       */
      clearDistanceCache: function(waypointId) {
        if (waypointId) {
          manager.distanceCache.delete(waypointId);
        } else {
          manager.distanceCache.clear();
        }
      },
      
      /**
       * 更新距离缓存
       */
      updateDistanceCache: function() {
        if (!manager.currentPosition) {
          return;
        }
        
        manager.activeWaypoints.forEach(function(waypointId) {
          var waypoint = manager.waypoints.get(waypointId);
          if (waypoint) {
            var distance = manager.calculateDistance(
              manager.currentPosition.latitude,
              manager.currentPosition.longitude,
              waypoint.lat,
              waypoint.lng
            );
            manager.distanceCache.set(waypointId, distance);
          }
        });
        
        manager.lastDistanceUpdate = Date.now();
      },
      
      /**
       * 增加前台监控频率（后台监控失败时的降级方案）
       */
      increaseForegroundMonitoringFrequency: function() {
        if (manager.locationUpdateTimer) {
          clearInterval(manager.locationUpdateTimer);
        }
        
        // 提高前台监控频率到15秒
        manager.locationUpdateTimer = setInterval(function() {
          manager.updateCurrentLocation();
        }, 15000);
        
        console.log('已切换到高频前台位置监控');
      },
      
      /**
       * 初始化位置监控
       */
      initLocationMonitoring: function() {
        // 检查位置权限
        wx.getSetting({
          success: function(res) {
            if (res.authSetting['scope.userLocation']) {
              console.log('位置权限已授权');
            } else {
              console.log('位置权限未授权，需要用户手动授权');
            }
          }
        });
      },
      
      /**
       * 保存航点数据到本地存储
       */
      saveWaypoints: function() {
        try {
          var waypointArray = Array.from(manager.waypoints.values());
          wx.setStorageSync(manager.storageKeys.waypoints, waypointArray);
          console.log('航点数据已保存，共', waypointArray.length, '个');
        } catch (error) {
          console.error('保存航点数据失败:', error);
        }
      },
      
      /**
       * 从本地存储加载航点数据
       */
      loadWaypoints: function() {
        try {
          var waypointArray = wx.getStorageSync(manager.storageKeys.waypoints) || [];
          
          manager.waypoints.clear();
          waypointArray.forEach(function(waypoint) {
            manager.waypoints.set(waypoint.id, waypoint);
          });
          
          console.log('已加载航点数据，共', waypointArray.length, '个');
        } catch (error) {
          console.error('加载航点数据失败:', error);
          manager.waypoints.clear();
        }
      },
      
      /**
       * 保存激活航点列表
       */
      saveActiveWaypoints: function() {
        try {
          var activeArray = Array.from(manager.activeWaypoints);
          wx.setStorageSync(manager.storageKeys.activeWaypoints, activeArray);
        } catch (error) {
          console.error('保存激活航点列表失败:', error);
        }
      },
      
      /**
       * 加载激活航点列表
       */
      loadActiveWaypoints: function() {
        try {
          var activeArray = wx.getStorageSync(manager.storageKeys.activeWaypoints) || [];
          
          manager.activeWaypoints.clear();
          activeArray.forEach(function(waypointId) {
            // 验证航点是否存在且启用
            var waypoint = manager.waypoints.get(waypointId);
            if (waypoint && waypoint.enabled) {
              manager.activeWaypoints.add(waypointId);
            }
          });
          
          console.log('已加载激活航点，共', manager.activeWaypoints.size, '个');
        } catch (error) {
          console.error('加载激活航点列表失败:', error);
          manager.activeWaypoints.clear();
        }
      },
      
      /**
       * 保存设置
       */
      saveSettings: function() {
        try {
          wx.setStorageSync(manager.storageKeys.settings, manager.settings);
        } catch (error) {
          console.error('保存设置失败:', error);
        }
      },
      
      /**
       * 加载设置
       */
      loadSettings: function() {
        try {
          var savedSettings = wx.getStorageSync(manager.storageKeys.settings) || {};
          
          // 合并默认设置和保存的设置
          Object.keys(savedSettings).forEach(function(key) {
            if (manager.settings.hasOwnProperty(key)) {
              manager.settings[key] = savedSettings[key];
            }
          });
          
          console.log('设置已加载');
        } catch (error) {
          console.error('加载设置失败:', error);
        }
      },
      
      /**
       * 导出航点数据
       * @returns {String} JSON格式的航点数据
       */
      exportWaypoints: function() {
        var exportData = {
          version: '1.0',
          exportTime: new Date().toISOString(),
          waypoints: Array.from(manager.waypoints.values()),
          activeWaypoints: Array.from(manager.activeWaypoints),
          settings: manager.settings
        };
        
        return JSON.stringify(exportData, null, 2);
      },
      
      /**
       * 导入航点数据
       * @param {String} jsonData JSON格式的航点数据
       */
      importWaypoints: function(jsonData) {
        try {
          var importData = JSON.parse(jsonData);
          
          if (!importData.waypoints || !Array.isArray(importData.waypoints)) {
            throw new Error('导入数据格式不正确');
          }
          
          // 备份当前数据
          var backupWaypoints = new Map(manager.waypoints);
          var backupActiveWaypoints = new Set(manager.activeWaypoints);
          
          try {
            // 清空当前数据
            manager.waypoints.clear();
            manager.activeWaypoints.clear();
            
            // 导入新数据
            importData.waypoints.forEach(function(waypoint) {
              if (manager.validateWaypointData(waypoint)) {
                manager.waypoints.set(waypoint.id, waypoint);
              }
            });
            
            // 导入激活航点
            if (importData.activeWaypoints) {
              importData.activeWaypoints.forEach(function(waypointId) {
                if (manager.waypoints.has(waypointId)) {
                  manager.activeWaypoints.add(waypointId);
                }
              });
            }
            
            // 导入设置
            if (importData.settings) {
              Object.keys(importData.settings).forEach(function(key) {
                if (manager.settings.hasOwnProperty(key)) {
                  manager.settings[key] = importData.settings[key];
                }
              });
            }
            
            // 保存数据
            manager.saveWaypoints();
            manager.saveActiveWaypoints();
            manager.saveSettings();
            
            console.log('航点数据导入成功，共', manager.waypoints.size, '个');
            
            // 通知回调
            if (manager.callbacks.onWaypointsImported) {
              manager.callbacks.onWaypointsImported(manager.waypoints.size);
            }
            
          } catch (error) {
            // 恢复备份数据
            manager.waypoints = backupWaypoints;
            manager.activeWaypoints = backupActiveWaypoints;
            throw error;
          }
          
        } catch (error) {
          console.error('导入航点数据失败:', error);
          throw new Error('导入失败: ' + error.message);
        }
      },
      
      /**
       * 获取管理器状态信息
       * @returns {Object} 状态信息
       */
      getStatus: function() {
        return {
          waypointCount: manager.waypoints.size,
          activeWaypointCount: manager.activeWaypoints.size,
          monitoringEnabled: manager.monitoringEnabled,
          backgroundLocationEnabled: manager.backgroundLocationEnabled,
          currentPosition: manager.currentPosition,
          lastDistanceUpdate: manager.lastDistanceUpdate,
          cacheSize: manager.distanceCache.size
        };
      },
      
      /**
       * 销毁管理器
       */
      destroy: function() {
        // 停止位置监控
        manager.stopLocationMonitoring();
        
        // 清理数据
        manager.waypoints.clear();
        manager.activeWaypoints.clear();
        manager.distanceCache.clear();
        manager.lastAlertTime.clear();
        
        // 清理引用
        manager.callbacks = null;
        manager.pageRef = null;
        
        console.log('航点管理器已销毁');
      }
    };
    
    return manager;
  }
};

module.exports = WaypointManager;