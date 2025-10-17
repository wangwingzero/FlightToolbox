// packageRadiation/pages/index/index.js
// 航空辐射计算页面

var BasePage = require('../../../utils/base-page.js');
var radiationModel = require('../../utils/radiationModel.js');

var SOLAR_REFERENCE_POINTS = [
  { year: 2009, label: '太阳极小期' },
  { year: 2000, label: '太阳极大期' }
];

var pageConfig = {
  data: {
    // Tab状态
    activeTab: 'single',

    // 输入模式：manual手动输入, airport机场选择
    inputMode: 'manual',

    // 单点计算数据
    singlePoint: {
      latitude: '',
      longitude: '',
      altitude: '',
      date: '',
      result: null
    },

    // 航线计算数据
    route: {
      departure: null,
      arrival: null,
      cruiseAltitude: '',
      date: '',
      result: null
    },

    // 机场选择相关
    selectedAirport: null,
    showAirportPopup: false,
    airportSearchKeyword: '',
    filteredAirports: [],
    allAirports: [],
    currentPickerType: '', // 'single', 'departure', 'arrival'

    // 日期选择相关
    showDatePopup: false,
    currentDate: new Date().getTime(),
    minDate: new Date(2000, 0, 1).getTime(),
    maxDate: new Date(2030, 11, 31).getTime(),
    datePickerType: '' // 'single', 'route'
  },

  customOnLoad: function(options) {
    var self = this;

    // 设置默认日期为今天
    var today = this.formatDate(new Date());
    this.setData({
      'singlePoint.date': today,
      'route.date': today
    });

    // 加载机场数据
    this.loadAirportData();

    console.log('✔️ 辐射计算页面已加载');
  },

  // ========== Tab切换 ==========
  onTabChange: function(e) {
    this.setData({
      activeTab: e.detail.name
    });
  },

  // ========== 输入模式切换 ==========
  switchInputMode: function(e) {
    var mode = e.currentTarget.dataset.mode;
    this.setData({
      inputMode: mode
    });

    // 切换到机场模式时，如果有选中的机场，更新坐标
    if (mode === 'airport' && this.data.selectedAirport) {
      this.setData({
        'singlePoint.latitude': this.data.selectedAirport.Latitude.toString(),
        'singlePoint.longitude': this.data.selectedAirport.Longitude.toString()
      });
    }
  },

  // ========== 输入事件处理 ==========
  onLatitudeChange: function(e) {
    this.setData({
      'singlePoint.latitude': e.detail
    });
  },

  onLongitudeChange: function(e) {
    this.setData({
      'singlePoint.longitude': e.detail
    });
  },

  onAltitudeChange: function(e) {
    this.setData({
      'singlePoint.altitude': e.detail
    });
  },

  onCruiseAltitudeChange: function(e) {
    this.setData({
      'route.cruiseAltitude': e.detail
    });
  },

  // ========== 机场数据加载 ==========
  loadAirportData: function() {
    var self = this;

    // 使用data-manager加载机场数据（与sunrise-sunset页面一致）
    try {
      var dataManager = require('../../../utils/data-manager.js');
      dataManager.loadAirportData().then(function() {
        var airportData = dataManager.getCachedAirportData();
        if (airportData && airportData.length > 0) {
          console.log('✅ 机场数据加载成功，共', airportData.length, '个机场');
          self.setData({
            allAirports: airportData,
            filteredAirports: airportData.slice(0, 50) // 初始显示前50个
          });
        } else {
          console.error('❌ 机场数据为空');
          wx.showToast({
            title: '机场数据加载失败',
            icon: 'none'
          });
        }
      }).catch(function(error) {
        console.error('❌ 辐射页面机场数据加载失败:', error);
        wx.showToast({
          title: '机场数据加载失败',
          icon: 'none'
        });
      });
    } catch (error) {
      console.error('❌ 辐射页面机场数据加载失败:', error);
      wx.showToast({
        title: '机场数据加载失败',
        icon: 'none'
      });
    }
  },

  // ========== 机场选择 ==========
  showAirportPicker: function() {
    this.setData({
      showAirportPopup: true,
      currentPickerType: 'single',
      airportSearchKeyword: '',
      filteredAirports: this.data.allAirports.slice(0, 50)
    });
  },

  showDepartureAirportPicker: function() {
    this.setData({
      showAirportPopup: true,
      currentPickerType: 'departure',
      airportSearchKeyword: '',
      filteredAirports: this.data.allAirports.slice(0, 50)
    });
  },

  showArrivalAirportPicker: function() {
    this.setData({
      showAirportPopup: true,
      currentPickerType: 'arrival',
      airportSearchKeyword: '',
      filteredAirports: this.data.allAirports.slice(0, 50)
    });
  },

  closeAirportPicker: function() {
    this.setData({
      showAirportPopup: false
    });
  },

  onAirportSearch: function(e) {
    var keyword = e.detail.toLowerCase();
    var self = this;

    // 清除之前的定时器
    if (this._searchTimer) {
      clearTimeout(this._searchTimer);
    }

    this.setData({
      airportSearchKeyword: keyword
    });

    // 300ms防抖
    this._searchTimer = setTimeout(function() {
      self.performAirportSearch(keyword);
    }, 300);
  },

  performAirportSearch: function(keyword) {
    if (!keyword) {
      this.setData({
        filteredAirports: this.data.allAirports.slice(0, 50)
      });
      return;
    }

    var filtered = this.data.allAirports.filter(function(airport) {
      return (
        (airport.ShortName && airport.ShortName.toLowerCase().indexOf(keyword) !== -1) ||
        (airport.EnglishName && airport.EnglishName.toLowerCase().indexOf(keyword) !== -1) ||
        (airport.ICAOCode && airport.ICAOCode.toLowerCase().indexOf(keyword) !== -1) ||
        (airport.IATACode && airport.IATACode.toLowerCase().indexOf(keyword) !== -1)
      );
    });

    this.setData({
      filteredAirports: filtered.slice(0, 100) // 最多显示100个结果
    });
  },

  selectAirport: function(e) {
    var airport = e.currentTarget.dataset.airport;
    var pickerType = this.data.currentPickerType;

    // 边界检查
    if (!airport || typeof airport.Latitude !== 'number' || typeof airport.Longitude !== 'number') {
      wx.showToast({
        title: '机场数据异常',
        icon: 'none'
      });
      return;
    }

    if (pickerType === 'single') {
      this.setData({
        selectedAirport: airport,
        'singlePoint.latitude': airport.Latitude.toString(),
        'singlePoint.longitude': airport.Longitude.toString()
      });
    } else if (pickerType === 'departure') {
      this.setData({
        'route.departure': airport
      });
    } else if (pickerType === 'arrival') {
      this.setData({
        'route.arrival': airport
      });
    }

    this.closeAirportPicker();
    wx.showToast({
      title: '已选择机场',
      icon: 'success'
    });
  },

  // ========== 日期选择 ==========
  showDatePicker: function() {
    this.setData({
      showDatePopup: true,
      datePickerType: 'single'
    });
  },

  showRouteDatePicker: function() {
    this.setData({
      showDatePopup: true,
      datePickerType: 'route'
    });
  },

  closeDatePicker: function() {
    this.setData({
      showDatePopup: false
    });
  },

  onDateConfirm: function(e) {
    var timestamp = e.detail;
    var dateStr = this.formatDate(new Date(timestamp));

    if (this.data.datePickerType === 'single') {
      this.setData({
        'singlePoint.date': dateStr
      });
    } else {
      this.setData({
        'route.date': dateStr
      });
    }

    this.closeDatePicker();
  },

  // ========== 单点辐射计算 ==========
  calculateSinglePoint: function() {
    var data = this.data.singlePoint;

    // 验证输入
    if (!data.latitude || !data.longitude || !data.altitude || !data.date) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    var latitude = parseFloat(data.latitude);
    var longitude = parseFloat(data.longitude);
    var altitudeFeet = parseFloat(data.altitude); // 用户输入的是英尺

    // 验证纬度范围
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      wx.showToast({
        title: '纬度范围：-90 到 90',
        icon: 'none'
      });
      return;
    }

    // 验证经度范围
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      wx.showToast({
        title: '经度范围：-180 到 180',
        icon: 'none'
      });
      return;
    }

    // 验证高度（英尺）
    if (isNaN(altitudeFeet) || altitudeFeet < 0) {
      wx.showToast({
        title: '高度不能为负数',
        icon: 'none'
      });
      return;
    }

    // 解析日期
    var date = this.parseDate(data.date);
    if (!date) {
      wx.showToast({
        title: '日期格式错误',
        icon: 'none'
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '计算中...',
      mask: true
    });

    try {
      var altitudeMeters = altitudeFeet * 0.3048; // 英尺转米

      var doseRate = radiationModel.getDoseRate({
        latitude: latitude,
        longitude: longitude,
        altitude: altitudeMeters, // 传入米制高度
        date: date
      });

      // 获取太阳调制值
      var year = date.getFullYear();
      var solarModulation = this.getSolarModulation(year);

      var solarComparisons = this.buildSolarComparisons({
        latitude: latitude,
        longitude: longitude,
        altitudeMeters: altitudeMeters,
        baseDoseRate: doseRate
      });

      var comparisonSummary = solarComparisons.map(function(item) {
        return item.label + '（' + item.year + '年，Φ≈' + item.modulation + ' MV）';
      }).join(' / ');

      // 计算结果（显示英尺）
      var result = {
        doseRate: doseRate.toFixed(3),
        latitude: latitude.toFixed(4),
        longitude: longitude.toFixed(4),
        altitudeFeet: Math.round(altitudeFeet), // 显示用户输入的英尺值
        date: data.date,
        solarModulation: solarModulation,
        solarComparisons: solarComparisons,
        solarCycleNote: comparisonSummary ? ('自动对比基于 ' + comparisonSummary + ' 的太阳调制势，仅供参考。') : ''
      };

      this.setData({
        'singlePoint.result': result
      });

      wx.hideLoading();
      wx.showToast({
        title: '计算完成',
        icon: 'success'
      });

      console.log('✅ 单点辐射计算结果:', result);
    } catch (error) {
      console.error('❌ 计算失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '计算失败：' + error.message,
        icon: 'none'
      });
    }
  },

  // ========== 航线辐射计算 ==========
  calculateRoute: function() {
    var data = this.data.route;

    // 验证输入
    if (!data.departure || !data.arrival || !data.cruiseAltitude || !data.date) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    var cruiseAltitudeFeet = parseFloat(data.cruiseAltitude); // 用户输入的是英尺
    if (isNaN(cruiseAltitudeFeet) || cruiseAltitudeFeet < 0) {
      wx.showToast({
        title: '巡航高度不能为负数',
        icon: 'none'
      });
      return;
    }

    // 解析日期
    var date = this.parseDate(data.date);
    if (!date) {
      wx.showToast({
        title: '日期格式错误',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '计算中...',
      mask: true
    });

    try {
      // 转换英尺为米
      var cruiseAltitudeMeters = cruiseAltitudeFeet * 0.3048;

      // 计算航线中点坐标
      var midLat = (data.departure.Latitude + data.arrival.Latitude) / 2;
      var midLon = (data.departure.Longitude + data.arrival.Longitude) / 2;

      // 计算平均剂量率（使用中点坐标和米制高度）
      var avgDoseRate = radiationModel.getDoseRate({
        latitude: midLat,
        longitude: midLon,
        altitude: cruiseAltitudeMeters, // 传入米制高度
        date: date
      });

      // 计算航线距离（使用Haversine公式）
      var distance = this.calculateDistance(
        data.departure.Latitude,
        data.departure.Longitude,
        data.arrival.Latitude,
        data.arrival.Longitude
      );

      // 估算飞行时间（假设平均速度800km/h）
      var avgSpeed = 800;
      var flightTime = distance / avgSpeed;

      // 计算总剂量
      var totalDose = avgDoseRate * flightTime;

      var solarComparisons = this.buildSolarComparisons({
        latitude: midLat,
        longitude: midLon,
        altitudeMeters: cruiseAltitudeMeters,
        baseDoseRate: avgDoseRate,
        flightTimeHours: flightTime
      });

      var comparisonSummary = solarComparisons.map(function(item) {
        return item.label + '（' + item.year + '年，Φ≈' + item.modulation + ' MV）';
      }).join(' / ');

      var result = {
        avgDoseRate: avgDoseRate.toFixed(3),
        totalDose: totalDose.toFixed(3),
        distance: distance.toFixed(1),
        flightTime: flightTime.toFixed(2),
        cruiseAltitudeFeet: Math.round(cruiseAltitudeFeet), // 显示英尺
        speedAssumption: '基于800km/h平均速度估算，实际可能偏差±10%',
        solarComparisons: solarComparisons,
        solarCycleNote: comparisonSummary ? ('自动对比基于 ' + comparisonSummary + ' 的太阳调制势，仅供参考。') : ''
      };

      this.setData({
        'route.result': result
      });

      wx.hideLoading();
      wx.showToast({
        title: '计算完成',
        icon: 'success'
      });

      console.log('✅ 航线辐射计算结果:', result);
    } catch (error) {
      console.error('❌ 航线计算失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '计算失败：' + error.message,
        icon: 'none'
      });
    }
  },

  // ========== 工具函数 ==========
  buildSolarComparisons: function(options) {
    options = options || {};
    if (typeof options.latitude !== 'number' || typeof options.longitude !== 'number' || typeof options.altitudeMeters !== 'number') {
      return [];
    }

    var baseDoseRate = typeof options.baseDoseRate === 'number' ? options.baseDoseRate : 0;
    var flightTimeHours = typeof options.flightTimeHours === 'number' ? options.flightTimeHours : null;
    var self = this;

    return SOLAR_REFERENCE_POINTS.map(function(ref) {
      var refDate = new Date(ref.year, 0, 1);
      var refDoseRate = radiationModel.getDoseRate({
        latitude: options.latitude,
        longitude: options.longitude,
        altitude: options.altitudeMeters,
        date: refDate
      });
      var modulation = self.getSolarModulation(ref.year);
      var deltaPercentValue = baseDoseRate > 0 ? ((refDoseRate - baseDoseRate) / baseDoseRate * 100) : 0;
      var deltaPercentRounded = Math.round(deltaPercentValue);

      var comparison = {
        year: ref.year,
        label: ref.label,
        modulation: modulation,
        doseRate: refDoseRate.toFixed(3),
        deltaPercent: deltaPercentRounded,
        deltaDirection: deltaPercentRounded >= 0 ? '↑' : '↓',
        deltaAbsPercent: Math.abs(deltaPercentRounded)
      };

      if (flightTimeHours !== null) {
        var refTotalDose = refDoseRate * flightTimeHours;
        comparison.totalDose = refTotalDose.toFixed(3);
      }

      return comparison;
    });
  },

  // 格式化日期：YYYY-MM-DD
  formatDate: function(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    return year + '-' + month + '-' + day;
  },

  // 解析日期字符串（增强验证）
  parseDate: function(dateStr) {
    try {
      var parts = dateStr.split('-');
      if (parts.length !== 3) return null;

      var year = parseInt(parts[0]);
      var month = parseInt(parts[1]);
      var day = parseInt(parts[2]);

      // 验证合法性
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
      if (month < 1 || month > 12) return null;
      if (day < 1 || day > 31) return null;
      if (year < 2000 || year > 2030) return null; // 限制在太阳调制数据范围内

      // 创建日期对象（兼容iOS）
      var date = new Date(year, month - 1, day);

      // 验证日期是否有效（防止2月30日等情况）
      if (date.getMonth() !== month - 1) return null;

      return date;
    } catch (e) {
      return null;
    }
  },

  // 获取太阳调制值
  getSolarModulation: function(year) {
    var modulation = {
      2000: 1100, 2001: 1050, 2002: 1000, 2003: 850, 2004: 700,
      2005: 550, 2006: 500, 2007: 480, 2008: 470, 2009: 460,
      2010: 500, 2011: 650, 2012: 850, 2013: 950, 2014: 1000,
      2015: 800, 2016: 650, 2017: 550, 2018: 500, 2019: 480,
      2020: 470, 2021: 520, 2022: 680, 2023: 850, 2024: 980,
      2025: 1050, 2026: 950, 2027: 800, 2028: 700, 2029: 600,
      2030: 550
    };
    return modulation[year] || 700;
  },

  // 计算两点距离（Haversine公式）
  calculateDistance: function(lat1, lon1, lat2, lon2) {
    var R = 6371; // 地球半径（公里）
    var dLat = this.toRad(lat2 - lat1);
    var dLon = this.toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRad: function(deg) {
    return deg * Math.PI / 180;
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));
