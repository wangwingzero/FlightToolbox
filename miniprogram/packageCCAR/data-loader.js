/**
 * PackageCCAR 统一数据加载器
 *
 * 三级数据源（优先级从高到低）：
 * 1. R2 远程 JSON 缓存（上次后台拉取的最新数据）
 * 2. 打包的本地 JS 数据（跟随小程序版本发布）
 * 3. 空数组兜底
 *
 * 每次加载后会在后台静默刷新 R2 数据，下次打开生效（stale-while-revalidate）。
 *
 * ES5 only
 */

var CCARConfig = require('./config.js');

var CACHE_KEY_PREFIX = 'ccar_r2_data_';
// 缓存有效期 7 天（毫秒）
var CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

var CCARDataLoader = {

  // ========== 内部工具 ==========

  /**
   * 获取带版本前缀的缓存 key
   * @param {string} type - 数据类型
   * @returns {string}
   */
  _cacheKey: function(type) {
    try {
      var VersionManager = require('../utils/version-manager.js');
      return VersionManager.getCacheKey(CACHE_KEY_PREFIX + type);
    } catch (e) {
      return CACHE_KEY_PREFIX + type;
    }
  },

  /**
   * 从本地 Storage 读取 R2 缓存
   * @param {string} type - 数据类型
   * @returns {Array|null}
   */
  _readCache: function(type) {
    try {
      var cached = wx.getStorageSync(this._cacheKey(type));
      if (!cached || !cached.records || !Array.isArray(cached.records)) return null;
      // 如果缓存数组为空，视为无效缓存
      if (cached.records.length === 0) return null;
      // 超过 TTL 视为过期，仍然返回数据但标记需要刷新
      return cached.records;
    } catch (e) {
      return null;
    }
  },

  /**
   * 写入 R2 缓存到本地 Storage
   * @param {string} type - 数据类型
   * @param {Array} records - 数据数组
   */
  _writeCache: function(type, records) {
    try {
      wx.setStorage({
        key: this._cacheKey(type),
        data: {
          records: records,
          timestamp: Date.now()
        }
      });
    } catch (e) {
      // 写入失败不影响主流程
    }
  },

  /**
   * 后台静默从 R2 拉取最新数据并更新缓存
   * @param {string} type - 数据类型：'regulation' | 'normative' | 'specification'
   * @param {Function} callback - 可选的回调函数，用于立即使用刷新的数据
   */
  _refreshFromR2: function(type, callback) {
    var self = this;
    try {
      var R2Config = require('../utils/r2-config.js');
      if (!R2Config.useR2ForData) return;

      var url = R2Config.getDataUrl(type);
      wx.request({
        url: url,
        timeout: R2Config.downloadTimeout || 15000,
        success: function(res) {
          if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
            self._writeCache(type, res.data);
            console.log('[CCAR] R2 data refreshed:', type, res.data.length);
            // 如果提供了回调，立即使用刷新的数据
            if (callback && typeof callback === 'function') {
              callback(res.data);
            }
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

  /**
   * 加载打包的本地 JS 数据
   * @param {string} path - require 路径
   * @param {string} exportName - 导出名
   * @returns {Array}
   */
  _loadBundled: function(path, exportName) {
    try {
      var m = require(path);
      return (m && m[exportName]) ? m[exportName] : [];
    } catch (e) {
      console.error('[CCAR] _loadBundled failed:', path, exportName, e.message || e);
      return [];
    }
  },

  /**
   * 通用加载逻辑：R2缓存 > 打包数据 > 空数组，后台刷新
   * @param {string} type - 数据类型标识
   * @param {string} bundledPath - 打包文件 require 路径
   * @param {string} exportName - 打包文件导出名
   * @param {string} label - 日志标签
   * @returns {Promise}
   */
  _loadWithFallback: function(type, bundledPath, exportName, label) {
    var self = this;
    return new Promise(function(resolve) {
      // 1. 尝试 R2 缓存
      var cached = self._readCache(type);
      if (cached && cached.length > 0) {
        console.log('[CCAR]', label, 'from R2 cache:', cached.length);
        resolve(cached);
        // 后台刷新
        self._refreshFromR2(type);
        return;
      }

      // 2. 打包的本地数据
      var bundled = self._loadBundled(bundledPath, exportName);
      if (bundled && bundled.length > 0) {
        console.log('[CCAR]', label, 'from bundled:', bundled.length);
        resolve(bundled);
        // 后台刷新 R2，下次打开生效
        self._refreshFromR2(type);
        return;
      }

      // 3. 本地数据也为空，尝试立即从 R2 加载
      console.log('[CCAR]', label, 'bundled is empty, trying R2 immediately...');
      self._refreshFromR2(type, function(data) {
        console.log('[CCAR]', label, 'loaded from R2 immediately:', data.length);
        resolve(data);
      });

      // 如果 R2 请求失败或超时，15秒后返回空数组
      setTimeout(function() {
        resolve([]);
      }, 15000);
    });
  },

  // ========== 公开接口 ==========

  /**
   * 加载规章数据
   * @returns {Promise}
   */
  loadRegulationData: function() {
    return this._loadWithFallback(
      'regulation', './regulation.js', 'regulationData', 'regulation'
    );
  },

  /**
   * 加载规范性文件数据
   * @returns {Promise}
   */
  loadNormativeData: function() {
    return this._loadWithFallback(
      'normative', './normative.js', 'normativeData', 'normative'
    );
  },

  /**
   * 加载标准规范数据
   * @returns {Promise}
   */
  loadStandardData: function() {
    console.log('[CCAR] 开始加载标准规范数据...');
    return this._loadWithFallback(
      'specification', './specification.js', 'standardData', 'specification'
    ).then(function(data) {
      console.log('[CCAR] 标准规范数据加载完成，数量:', data ? data.length : 0);
      return data;
    });
  },

  /**
   * 同时加载全部三类数据
   * @returns {Promise}
   */
  loadAllData: function() {
    var self = this;
    return Promise.all([
      self.loadRegulationData(),
      self.loadNormativeData(),
      self.loadStandardData()
    ]).then(function(results) {
      return {
        regulationData: results[0],
        normativeData: results[1],
        standardData: results[2]
      };
    });
  },

  /**
   * 根据有效性筛选数据
   * @param {Array} data - 待筛选的数据数组
   * @param {string} validityFilter - 筛选条件
   * @returns {Array}
   */
  filterByValidity: function(data, validityFilter) {
    var CCARUtils = require('./utils.js');
    return CCARUtils.filterByValidity(data, validityFilter);
  }
};

module.exports = CCARDataLoader;
