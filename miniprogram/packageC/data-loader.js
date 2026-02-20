/**
 * 机场数据加载器
 *
 * 三级数据源（优先级从高到低）：
 * 1. R2 远程 JSON 缓存（上次后台拉取的最新数据，8037 个机场）
 * 2. 打包的本地 JS 数据（跟随小程序版本发布，7405 个机场）
 * 3. 空数组兜底
 *
 * 每次加载后会在后台静默刷新 R2 数据，下次打开生效（stale-while-revalidate）。
 *
 * 严格 ES5 语法，确保真机兼容性
 */

var R2_CACHE_KEY = 'airport_r2_data';
// 缓存有效期 30 天（机场数据变化频率低）
var CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

var DataLoader = {
  // 内存缓存
  cachedAirports: null,
  isLoading: false,
  loadingPromise: null,

  // ========== R2 缓存读写 ==========

  /**
   * 获取带版本前缀的缓存 key
   */
  _cacheKey: function() {
    try {
      var VersionManager = require('../utils/version-manager.js');
      return VersionManager.getCacheKey(R2_CACHE_KEY);
    } catch (e) {
      return R2_CACHE_KEY;
    }
  },

  /**
   * 从本地 Storage 读取 R2 缓存的机场数据
   * @returns {Array|null}
   */
  _readR2Cache: function() {
    try {
      var cached = wx.getStorageSync(this._cacheKey());
      if (!cached || !cached.records || !Array.isArray(cached.records)) return null;
      if (cached.records.length === 0) return null;
      return cached.records;
    } catch (e) {
      return null;
    }
  },

  /**
   * 将 R2 数据写入本地 Storage
   * @param {Array} records - 机场数据数组
   */
  _writeR2Cache: function(records) {
    try {
      wx.setStorage({
        key: this._cacheKey(),
        data: {
          records: records,
          timestamp: Date.now()
        }
      });
    } catch (e) {
      // 写入失败不影响主流程（可能超出存储限制）
      console.warn('[Airport] R2 cache write failed:', e.message || e);
    }
  },

  /**
   * 后台静默从 R2 拉取最新机场数据并更新缓存
   */
  _refreshFromR2: function() {
    var self = this;
    try {
      var R2Config = require('../utils/r2-config.js');
      if (!R2Config.useR2ForData) return;

      var url = R2Config.getAirportDataUrl();
      wx.request({
        url: url,
        timeout: R2Config.downloadTimeout || 30000,
        success: function(res) {
          if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
            self._writeR2Cache(res.data);
            console.log('[Airport] R2 refreshed:', res.data.length, 'airports');
          }
        },
        fail: function() {
          // 网络不可用是正常情况（飞行模式），静默忽略
        }
      });
    } catch (e) {
      // R2 配置不可用，静默忽略
    }
  },

  // ========== 数据加载主逻辑 ==========

  /**
   * 加载机场数据（对外主接口）
   *
   * 优先级：R2 缓存 > 本地打包 JS > 空数组
   * 返回 Promise<Array>，数组元素为预处理后的机场对象
   */
  loadAirportData: function() {
    var self = this;

    // 内存缓存命中
    if (this.cachedAirports) {
      return Promise.resolve(this.cachedAirports);
    }

    // 防止重复加载
    if (this.isLoading && this.loadingPromise) {
      return this.loadingPromise;
    }

    this.isLoading = true;
    this.loadingPromise = new Promise(function(resolve) {
      var rawData = null;
      var source = '';

      // 1. 尝试 R2 缓存
      var cached = self._readR2Cache();
      if (cached && cached.length > 0) {
        rawData = cached;
        source = 'R2 cache';
      }

      // 2. 回退到打包的本地数据
      if (!rawData) {
        try {
          var airportsModule = require('./airportdata.js');
          if (Array.isArray(airportsModule)) {
            rawData = airportsModule;
          } else if (airportsModule && airportsModule.airports && Array.isArray(airportsModule.airports)) {
            rawData = airportsModule.airports;
          } else if (airportsModule && Array.isArray(airportsModule.default)) {
            rawData = airportsModule.default;
          }
          source = 'bundled JS';
        } catch (e) {
          console.error('[Airport] bundled load failed:', e.message || e);
        }
      }

      // 3. 兜底空数组
      if (!rawData || !Array.isArray(rawData)) {
        rawData = [];
        source = 'fallback empty';
      }

      // 预处理
      var processed = self.preprocessAirportData(rawData);
      self.cachedAirports = processed;
      self.isLoading = false;
      self.loadingPromise = null;

      console.log('[Airport] loaded from ' + source + ': ' + processed.length + ' airports');
      resolve(processed);

      // 后台刷新 R2，下次打开生效
      self._refreshFromR2();
    });

    return this.loadingPromise;
  },

  // ========== 数据预处理 ==========

  /**
   * 预处理原始机场数据：校验、标准化、生成搜索关键字
   * @param {Array} rawData
   * @returns {Array}
   */
  preprocessAirportData: function(rawData) {
    var processedData = [];

    for (var i = 0; i < rawData.length; i++) {
      var airport = rawData[i];

      try {
        // ICAOCode 是必填字段
        if (!airport.ICAOCode) continue;

        var lat = this.parseCoordinate(airport.Latitude);
        var lon = this.parseCoordinate(airport.Longitude);

        var processedAirport = {
          ICAOCode: (airport.ICAOCode || '').toString().toUpperCase().trim(),
          IATACode: (airport.IATACode || '').toString().toUpperCase().trim(),
          ShortName: (airport.ShortName || '').toString().trim(),
          EnglishName: (airport.EnglishName || '').toString().trim(),
          CountryName: (airport.CountryName || '').toString().trim(),
          Latitude: lat,
          Longitude: lon,
          Elevation: airport.Elevation !== undefined ? this.parseCoordinate(airport.Elevation) : null,
          LatitudeDisplay: this.formatCoordinate(lat),
          LongitudeDisplay: this.formatCoordinate(lon),
          searchKeywords: this.generateSearchKeywords(airport),
          originalData: airport
        };

        processedData.push(processedAirport);
      } catch (error) {
        continue;
      }
    }

    return processedData;
  },

  parseCoordinate: function(coord) {
    if (coord === null || coord === undefined || coord === '') return 0;
    var parsed = parseFloat(coord);
    return isNaN(parsed) ? 0 : parsed;
  },

  formatCoordinate: function(coord) {
    if (typeof coord !== 'number' || isNaN(coord)) return '0.000';
    return coord.toFixed(3);
  },

  generateSearchKeywords: function(airport) {
    var keywords = [];
    var fields = ['ICAOCode', 'IATACode', 'ShortName', 'EnglishName', 'CountryName'];

    for (var i = 0; i < fields.length; i++) {
      var value = airport[fields[i]];
      if (value && typeof value === 'string' && value.trim()) {
        keywords.push(value.toString().toLowerCase().trim());
      }
    }

    return keywords.join(' ');
  },

  // ========== 公共方法 ==========

  /**
   * 清除所有缓存（内存 + R2 Storage）
   */
  clearCache: function() {
    this.cachedAirports = null;
    this.isLoading = false;
    this.loadingPromise = null;
    try {
      wx.removeStorage({ key: this._cacheKey() });
    } catch (e) {
      // ignore
    }
    console.log('[Airport] cache cleared');
  },

  getCacheStatus: function() {
    return {
      hasCachedData: !!this.cachedAirports,
      isLoading: this.isLoading,
      cacheSize: this.cachedAirports ? this.cachedAirports.length : 0
    };
  }
};

module.exports = DataLoader;
