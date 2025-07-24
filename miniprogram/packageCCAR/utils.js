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
   * 防抖函数
   * @param {Function} func - 需要防抖的函数
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  debounce: function(func, delay) {
    var timer = null;
    return function() {
      var context = this;
      var args = arguments;
      
      if (timer) {
        clearTimeout(timer);
      }
      
      timer = setTimeout(function() {
        func.apply(context, args);
      }, delay || CCARConfig.SEARCH_DEBOUNCE_DELAY);
    };
  },

  /**
   * 生成有效性筛选统计消息
   * @param {string} filter - 筛选条件
   * @param {number} regulationCount - 规章数量
   * @param {number} normativeCount - 规范性文件数量
   * @returns {string} 统计消息
   */
  generateFilterMessage: function(filter, regulationCount, normativeCount) {
    var filterText = filter === CCARConfig.VALIDITY_FILTERS.ALL ? '全部' : 
                    (filter === CCARConfig.VALIDITY_FILTERS.VALID ? '有效' : '失效');
    
    return '已筛选' + filterText + '文件：规章' + regulationCount + '条，规范性文件' + normativeCount + '条';
  },

  /**
   * 显示筛选结果提示
   * @param {string} filter - 筛选条件
   * @param {number} regulationCount - 规章数量
   * @param {number} normativeCount - 规范性文件数量
   */
  showFilterResult: function(filter, regulationCount, normativeCount) {
    var message = this.generateFilterMessage(filter, regulationCount, normativeCount);
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 清理搜索定时器
   * @param {Object} context - 页面上下文对象
   */
  clearSearchTimer: function(context) {
    if (context.searchTimer) {
      clearTimeout(context.searchTimer);
      context.searchTimer = null;
    }
  },

  /**
   * 验证数组数据
   * @param {*} data - 待验证的数据
   * @param {Array} fallback - 备用数据
   * @returns {Array} 有效的数组数据
   */
  validateArrayData: function(data, fallback) {
    if (!data || !Array.isArray(data)) {
      console.warn('数据验证失败，使用备用数据');
      return fallback || [];
    }
    return data;
  }
};

module.exports = CCARUtils;