/**
 * 智能GPS滤波器 - 已禁用版本
 *
 * ⚠️ 重要说明：
 * 根据项目核心安全约束，GPS地速和GPS高度必须使用原始数据，禁止任何滤波处理。
 * 此文件保留仅为保持代码兼容性，实际功能已完全禁用。
 * gps-manager.js中设置 activeFilterType = 'none' 强制使用原始数据。
 *
 * 如需修改GPS数据处理逻辑，请参考CLAUDE.md文档中的GPS数据处理规范。
 */

var Logger = require('./logger.js');

var SmartFilter = {
  /**
   * 创建智能滤波器实例（已禁用）
   * @param {Object} config 配置参数
   * @returns {Object} 滤波器实例（仅提供空实现）
   */
  create: function(config) {
    var filter = {
      // 保存配置引用
      config: config,

      // 状态标记
      isInitialized: false,

      /**
       * 初始化滤波器（空实现）
       */
      init: function(initialData, spoofingDetector) {
        if (filter.config && filter.config.debug && filter.config.debug.enableVerboseLogging) {
          Logger.debug('⚠️ GPS滤波器已禁用，不进行任何初始化');
        }
        filter.isInitialized = true;
      },

      /**
       * 处理GPS数据更新（直接返回原始数据）
       * @param {Object} gpsData 原始GPS数据
       * @returns {Object} 原始数据（不做任何处理）
       */
      update: function(gpsData) {
        // ⚠️ GPS原始数据直通 - 禁止任何滤波处理（项目核心安全约束）
        return gpsData;
      },

      /**
       * 获取状态（返回null）
       */
      getState: function() {
        return null;
      },

      /**
       * 重置滤波器（空实现）
       */
      reset: function() {
        if (filter.config && filter.config.debug && filter.config.debug.enableVerboseLogging) {
          Logger.debug('⚠️ GPS滤波器已禁用，无需重置');
        }
        filter.isInitialized = false;
      },

      /**
       * 销毁滤波器（空实现）
       */
      destroy: function() {
        if (filter.config && filter.config.debug && filter.config.debug.enableVerboseLogging) {
          Logger.debug('⚠️ GPS滤波器已禁用，无需销毁');
        }
        filter.reset();
      }
    };

    return filter;
  }
};

module.exports = SmartFilter;
