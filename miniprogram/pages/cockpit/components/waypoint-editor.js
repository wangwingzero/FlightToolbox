/**
 * 航点编辑器组件
 * 
 * 提供完整的航点创建和编辑界面，包括：
 * - 坐标输入（度分秒格式和小数格式）
 * - 航点属性设置（名称、类型、颜色、提醒半径）
 * - 数据验证和错误提示
 * - 与航点管理器的集成
 * - 地形信息显示
 */

Component({
  /**
   * 组件属性定义
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    editMode: {
      type: Boolean,
      value: false
    },
    waypointId: {
      type: String,
      value: ''
    },
    initialData: {
      type: Object,
      value: null
    },
    terrainInfo: {
      type: Object,
      value: null
    }
  },

  /**
   * 组件数据
   */
  data: {
    // 航点数据
    waypointData: {
      name: '',
      lat: 0,
      lng: 0,
      enabled: true,
      alertRadius: 2,
      type: 'waypoint',
      color: '#FF6600',
      notes: ''
    },
    
    // 坐标显示格式（度分秒）
    coordinateDisplay: {
      latDeg: '',
      latMin: '',
      latSec: '',
      latHem: 0, // 0=N, 1=S
      lngDeg: '',
      lngMin: '',
      lngSec: '',
      lngHem: 0  // 0=E, 1=W
    },
    
    // 航点类型选项
    waypointTypes: [
      { value: 'waypoint', name: '普通航点' },
      { value: 'checkpoint', name: '检查点' },
      { value: 'destination', name: '目的地' },
      { value: 'alternate', name: '备用点' },
      { value: 'holding', name: '等待点' }
    ],
    waypointTypeIndex: 0,
    
    // 颜色选项
    colorOptions: [
      '#FF6600', '#FF0000', '#00FF00', '#0066FF', 
      '#FFFF00', '#FF00FF', '#00FFFF', '#800080'
    ],
    
    // 验证状态
    isValid: false,
    errors: []
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 组件显示时初始化数据
     */
    onShow: function() {
      if (this.data.visible) {
        this.initializeData();
      }
    },
    
    /**
     * 初始化数据
     */
    initializeData: function() {
      if (this.data.editMode && this.data.initialData) {
        // 编辑模式，加载现有数据
        this.loadWaypointData(this.data.initialData);
      } else if (this.data.initialData) {
        // 创建模式，使用初始数据（如地图点击位置）
        this.setData({
          waypointData: Object.assign({}, this.data.waypointData, this.data.initialData)
        });
        this.updateCoordinateDisplay();
      } else {
        // 创建模式，使用默认数据
        this.resetToDefaults();
      }
      
      this.validateData();
    },
    
    /**
     * 加载航点数据
     * @param {Object} waypointData 航点数据
     */
    loadWaypointData: function(waypointData) {
      // 查找航点类型索引
      var typeIndex = this.data.waypointTypes.findIndex(function(type) {
        return type.value === waypointData.type;
      });
      
      this.setData({
        waypointData: Object.assign({}, waypointData),
        waypointTypeIndex: typeIndex >= 0 ? typeIndex : 0
      });
      
      this.updateCoordinateDisplay();
    },
    
    /**
     * 重置为默认值
     */
    resetToDefaults: function() {
      this.setData({
        waypointData: {
          name: '',
          lat: 0,
          lng: 0,
          enabled: true,
          alertRadius: 2,
          type: 'waypoint',
          color: '#FF6600',
          notes: ''
        },
        waypointTypeIndex: 0
      });
      
      this.updateCoordinateDisplay();
    },
    
    /**
     * 更新坐标显示（转换为度分秒格式）
     */
    updateCoordinateDisplay: function() {
      var lat = this.data.waypointData.lat;
      var lng = this.data.waypointData.lng;
      
      // 转换纬度
      var latDisplay = this.decimalToDMS(Math.abs(lat));
      var latHem = lat >= 0 ? 0 : 1; // 0=N, 1=S
      
      // 转换经度
      var lngDisplay = this.decimalToDMS(Math.abs(lng));
      var lngHem = lng >= 0 ? 0 : 1; // 0=E, 1=W
      
      this.setData({
        coordinateDisplay: {
          latDeg: latDisplay.degrees.toString(),
          latMin: latDisplay.minutes.toString(),
          latSec: latDisplay.seconds.toFixed(2),
          latHem: latHem,
          lngDeg: lngDisplay.degrees.toString(),
          lngMin: lngDisplay.minutes.toString(),
          lngSec: lngDisplay.seconds.toFixed(2),
          lngHem: lngHem
        }
      });
    },
    
    /**
     * 更新小数坐标（从度分秒格式转换）
     */
    updateDecimalCoordinates: function() {
      var coord = this.data.coordinateDisplay;
      
      // 计算纬度
      var lat = this.dmsToDcimal(
        parseInt(coord.latDeg) || 0,
        parseInt(coord.latMin) || 0,
        parseFloat(coord.latSec) || 0
      );
      if (coord.latHem === 1) lat = -lat; // 南纬为负
      
      // 计算经度
      var lng = this.dmsToDcimal(
        parseInt(coord.lngDeg) || 0,
        parseInt(coord.lngMin) || 0,
        parseFloat(coord.lngSec) || 0
      );
      if (coord.lngHem === 1) lng = -lng; // 西经为负
      
      this.setData({
        'waypointData.lat': lat,
        'waypointData.lng': lng
      });
      
      this.validateData();
    },
    
    /**
     * 小数转度分秒
     * @param {Number} decimal 小数度
     * @returns {Object} {degrees, minutes, seconds}
     */
    decimalToDMS: function(decimal) {
      var degrees = Math.floor(decimal);
      var minutesFloat = (decimal - degrees) * 60;
      var minutes = Math.floor(minutesFloat);
      var seconds = (minutesFloat - minutes) * 60;
      
      return {
        degrees: degrees,
        minutes: minutes,
        seconds: seconds
      };
    },
    
    /**
     * 度分秒转小数
     * @param {Number} degrees 度
     * @param {Number} minutes 分
     * @param {Number} seconds 秒
     * @returns {Number} 小数度
     */
    dmsToDcimal: function(degrees, minutes, seconds) {
      return degrees + minutes / 60 + seconds / 3600;
    },
    
    /**
     * 格式化小数坐标显示
     * @param {Number} lat 纬度
     * @param {Number} lng 经度
     * @returns {String} 格式化的坐标字符串
     */
    formatDecimalCoords: function(lat, lng) {
      if (!lat && !lng) return '0.000000, 0.000000';
      return lat.toFixed(6) + ', ' + lng.toFixed(6);
    },
    
    /**
     * 数据验证
     */
    validateData: function() {
      var errors = [];
      var data = this.data.waypointData;
      
      // 检查航点名称
      if (!data.name || data.name.trim().length === 0) {
        errors.push('航点名称不能为空');
      }
      
      // 检查坐标范围
      if (data.lat < -90 || data.lat > 90) {
        errors.push('纬度必须在-90到90度之间');
      }
      
      if (data.lng < -180 || data.lng > 180) {
        errors.push('经度必须在-180到180度之间');
      }
      
      // 检查提醒半径
      if (data.enabled && (data.alertRadius < 0.5 || data.alertRadius > 100)) {
        errors.push('提醒距离必须在0.5到100海里之间');
      }
      
      var isValid = errors.length === 0;
      
      this.setData({
        isValid: isValid,
        errors: errors
      });
      
      return isValid;
    },
    
    /**
     * 航点名称输入
     */
    onNameInput: function(e) {
      this.setData({
        'waypointData.name': e.detail.value
      });
      this.validateData();
    },
    
    /**
     * 纬度度数输入
     */
    onLatDegInput: function(e) {
      this.setData({
        'coordinateDisplay.latDeg': e.detail.value
      });
      this.updateDecimalCoordinates();
    },
    
    /**
     * 纬度分数输入
     */
    onLatMinInput: function(e) {
      this.setData({
        'coordinateDisplay.latMin': e.detail.value
      });
      this.updateDecimalCoordinates();
    },
    
    /**
     * 纬度秒数输入
     */
    onLatSecInput: function(e) {
      this.setData({
        'coordinateDisplay.latSec': e.detail.value
      });
      this.updateDecimalCoordinates();
    },
    
    /**
     * 纬度半球选择
     */
    onLatHemChange: function(e) {
      this.setData({
        'coordinateDisplay.latHem': parseInt(e.detail.value)
      });
      this.updateDecimalCoordinates();
    },
    
    /**
     * 经度度数输入
     */
    onLngDegInput: function(e) {
      this.setData({
        'coordinateDisplay.lngDeg': e.detail.value
      });
      this.updateDecimalCoordinates();
    },
    
    /**
     * 经度分数输入
     */
    onLngMinInput: function(e) {
      this.setData({
        'coordinateDisplay.lngMin': e.detail.value
      });
      this.updateDecimalCoordinates();
    },
    
    /**
     * 经度秒数输入
     */
    onLngSecInput: function(e) {
      this.setData({
        'coordinateDisplay.lngSec': e.detail.value
      });
      this.updateDecimalCoordinates();
    },
    
    /**
     * 经度半球选择
     */
    onLngHemChange: function(e) {
      this.setData({
        'coordinateDisplay.lngHem': parseInt(e.detail.value)
      });
      this.updateDecimalCoordinates();
    },
    
    /**
     * 启用提醒开关
     */
    onEnabledChange: function(e) {
      this.setData({
        'waypointData.enabled': e.detail.value
      });
      this.validateData();
    },
    
    /**
     * 提醒半径滑块
     */
    onAlertRadiusChange: function(e) {
      this.setData({
        'waypointData.alertRadius': e.detail.value
      });
      this.validateData();
    },
    
    /**
     * 航点类型选择
     */
    onTypeChange: function(e) {
      var index = parseInt(e.detail.value);
      var type = this.data.waypointTypes[index];
      
      this.setData({
        waypointTypeIndex: index,
        'waypointData.type': type.value
      });
    },
    
    /**
     * 颜色选择
     */
    onColorSelect: function(e) {
      var color = e.currentTarget.dataset.color;
      this.setData({
        'waypointData.color': color
      });
    },
    
    /**
     * 备注输入
     */
    onNotesInput: function(e) {
      this.setData({
        'waypointData.notes': e.detail.value
      });
    },
    
    /**
     * 使用当前位置
     */
    onCurrentLocation: function() {
      var self = this;
      
      wx.getLocation({
        type: 'gcj02',
        success: function(res) {
          self.setData({
            'waypointData.lat': res.latitude,
            'waypointData.lng': res.longitude
          });
          self.updateCoordinateDisplay();
          self.validateData();
          
          wx.showToast({
            title: '已获取当前位置',
            icon: 'success',
            duration: 1500
          });
        },
        fail: function(error) {
          console.error('获取位置失败:', error);
          wx.showToast({
            title: '获取位置失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    },
    
    /**
     * 地图选择坐标
     */
    onMapSelect: function() {
      // 通知父组件切换到地图选择模式
      this.triggerEvent('mapselect', {
        currentCoordinate: {
          lat: this.data.waypointData.lat,
          lng: this.data.waypointData.lng
        }
      });
    },
    
    /**
     * 外部设置坐标（来自地图选择）
     * @param {Object} coordinate 坐标对象 {lat, lng}
     */
    setCoordinate: function(coordinate) {
      this.setData({
        'waypointData.lat': coordinate.lat,
        'waypointData.lng': coordinate.lng
      });
      this.updateCoordinateDisplay();
      this.validateData();
    },
    
    /**
     * 覆盖层点击（关闭弹窗）
     */
    onOverlayTap: function() {
      this.onClose();
    },
    
    /**
     * 模态框点击（阻止冒泡）
     */
    onModalTap: function() {
      // 阻止事件冒泡到覆盖层
    },
    
    /**
     * 关闭编辑器
     */
    onClose: function() {
      this.triggerEvent('close');
    },
    
    /**
     * 取消操作
     */
    onCancel: function() {
      this.triggerEvent('cancel');
    },
    
    /**
     * 删除航点
     */
    onDelete: function() {
      var self = this;
      
      wx.showModal({
        title: '确认删除',
        content: '确定要删除航点"' + this.data.waypointData.name + '"吗？',
        confirmText: '删除',
        confirmColor: '#ff4444',
        success: function(res) {
          if (res.confirm) {
            self.triggerEvent('delete', {
              waypointId: self.data.waypointId
            });
          }
        }
      });
    },
    
    /**
     * 确认操作（创建或保存）
     */
    onConfirm: function() {
      if (!this.validateData()) {
        // 显示验证错误
        wx.showModal({
          title: '数据验证失败',
          content: this.data.errors.join('\n'),
          showCancel: false,
          confirmText: '知道了'
        });
        return;
      }
      
      var eventType = this.data.editMode ? 'save' : 'create';
      var eventData = {
        waypointData: Object.assign({}, this.data.waypointData)
      };
      
      if (this.data.editMode) {
        eventData.waypointId = this.data.waypointId;
      }
      
      this.triggerEvent(eventType, eventData);
    }
  },

  /**
   * 组件生命周期
   */
  observers: {
    'visible': function(visible) {
      if (visible) {
        this.onShow();
      }
    },
    
    'initialData': function(initialData) {
      if (initialData && this.data.visible) {
        this.initializeData();
      }
    }
  }
});