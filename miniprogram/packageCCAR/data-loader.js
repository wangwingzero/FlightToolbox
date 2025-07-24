/**
 * PackageCCAR 统一数据加载器
 * 消除重复的数据加载逻辑
 */

var CCARConfig = require('./config.js');

var CCARDataLoader = {
  
  /**
   * 加载规章数据
   * @returns {Promise} 返回规章数据数组
   */
  loadRegulationData: function() {
    return new Promise(function(resolve) {
      try {
        var regulationModule = require('./regulation.js');
        var regulations = regulationModule && regulationModule.regulationData 
                        ? regulationModule.regulationData : [];
        
        console.log('✅ 规章数据加载成功，数量:', regulations.length);
        resolve(regulations);
      } catch (error) {
        console.error('❌ 规章数据加载失败:', error);
        resolve([]);
      }
    });
  },

  /**
   * 加载规范性文件数据
   * @returns {Promise} 返回规范性文件数据数组
   */
  loadNormativeData: function() {
    return new Promise(function(resolve) {
      try {
        var normativeModule = require('./normative.js');
        var normatives = normativeModule && normativeModule.normativeData 
                       ? normativeModule.normativeData : [];
        
        console.log('✅ 规范性文件数据加载成功，数量:', normatives.length);
        resolve(normatives);
      } catch (error) {
        console.error('❌ 规范性文件数据加载失败:', error);
        resolve([]);
      }
    });
  },

  /**
   * 同时加载规章和规范性文件数据
   * @returns {Promise} 返回包含两种数据的对象
   */
  loadAllData: function() {
    var self = this;
    return Promise.all([
      self.loadRegulationData(),
      self.loadNormativeData()
    ]).then(function(results) {
      return {
        regulationData: results[0],
        normativeData: results[1]
      };
    });
  },

  /**
   * 根据有效性筛选数据
   * @param {Array} data - 待筛选的数据数组
   * @param {string} validityFilter - 筛选条件
   * @returns {Array} 筛选后的数据
   */
  filterByValidity: function(data, validityFilter) {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    if (validityFilter === CCARConfig.VALIDITY_FILTERS.ALL) {
      return data;
    } else if (validityFilter === CCARConfig.VALIDITY_FILTERS.VALID) {
      return data.filter(function(item) {
        return item.validity === CCARConfig.VALIDITY_STATUS.VALID;
      });
    } else if (validityFilter === CCARConfig.VALIDITY_FILTERS.INVALID) {
      return data.filter(function(item) {
        return item.validity === CCARConfig.VALIDITY_STATUS.INVALID_EXPIRED ||
               item.validity === CCARConfig.VALIDITY_STATUS.INVALID_ABOLISHED;
      });
    }
    
    return data;
  }
};

module.exports = CCARDataLoader;