/**
 * PackageCCAR 通用工具函数
 * 消除重复的工具代码
 */

var CCARConfig = require('./config.js');

var CCARUtils = {
  
  /**
   * 复制链接到剪贴板
   * @param {Object} item - 包含url字段的对象
   * @param {Function} successCallback - 成功回调
   * @param {Function} failCallback - 失败回调
   */
  copyLink: function(item, successCallback, failCallback) {
    if (item && item.url) {
      wx.setClipboardData({
        data: item.url,
        success: function() {
          wx.showToast({
            title: CCARConfig.MESSAGES.COPY_SUCCESS,
            icon: 'success',
            duration: 1500
          });
          if (successCallback) successCallback();
        },
        fail: function() {
          wx.showToast({
            title: CCARConfig.MESSAGES.COPY_FAIL,
            icon: 'none',
            duration: 1500
          });
          if (failCallback) failCallback();
        }
      });
    } else {
      wx.showToast({
        title: CCARConfig.MESSAGES.LINK_UNAVAILABLE,
        icon: 'none',
        duration: 1500
      });
    }
  },

  /**
   * 显示文件详情弹窗
   * @param {Object} item - 文件对象
   * @param {Object} options - 可选配置
   */
  showFileDetail: function(item, options) {
    if (!item) return;
    
    var config = Object.assign({
      showCancel: true,
      cancelText: '关闭',
      confirmText: '复制链接'
    }, options || {});

    var content = '文件名：' + item.title + '\n' +
                 '发布日期：' + (item.publish_date || '未知') + '\n' +
                 '负责司局：' + (item.office_unit || '未知') + '\n' +
                 '文件状态：' + (item.validity || '未知');

    wx.showModal({
      title: '文件详情',
      content: content,
      showCancel: config.showCancel,
      cancelText: config.cancelText,
      confirmText: config.confirmText,
      success: function(res) {
        if (res.confirm && item.url) {
          CCARUtils.copyLink(item);
        }
      }
    });
  },

  /**
   * 创建统一的有效性筛选器
   * @returns {Object} 筛选器对象，包含各种筛选方法
   */
  createValidityFilter: function() {
    return {
      // 显示全部数据
      all: function(data) {
        return data || [];
      },
      
      // 筛选有效数据
      valid: function(data) {
        if (!data || !Array.isArray(data)) return [];
        return data.filter(function(item) {
          return item.validity === CCARConfig.VALIDITY_STATUS.VALID;
        });
      },
      
      // 筛选失效数据
      invalid: function(data) {
        if (!data || !Array.isArray(data)) return [];
        return data.filter(function(item) {
          return item.validity === CCARConfig.VALIDITY_STATUS.INVALID_EXPIRED ||
                 item.validity === CCARConfig.VALIDITY_STATUS.INVALID_ABOLISHED;
        });
      }
    };
  },

  /**
   * 统一的有效性筛选方法（推荐使用）
   * @param {Array} data - 待筛选的数据
   * @param {string} filter - 筛选条件: 'all', 'valid', 'invalid'
   * @returns {Array} 筛选后的数据
   */
  filterByValidity: function(data, filter) {
    var filters = this.createValidityFilter();
    var filterMethod = filters[filter];
    
    if (!filterMethod) {
      console.warn('无效的筛选条件:', filter, '使用默认筛选');
      return filters.all(data);
    }
    
    return filterMethod(data);
  },

};

module.exports = CCARUtils;