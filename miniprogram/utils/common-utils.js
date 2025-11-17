/**
 * 统一工具函数库
 * 
 * 提供项目中常用的工具函数，避免代码重复
 * 包含版本比较、设备检测、格式化等功能
 * 
 * @author FlightToolbox Team
 * @version 1.0.0
 */

var systemInfoHelper = require('./system-info-helper.js');

const Utils = {
  
  /**
   * 版本比较工具
   * @param {string} v1 版本1
   * @param {string} v2 版本2
   * @returns {number} 1: v1 > v2, 0: v1 == v2, -1: v1 < v2
   */
  compareVersion: function(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);
    
    while (v1.length < len) {
      v1.push('0');
    }
    while (v2.length < len) {
      v2.push('0');
    }
    
    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i]);
      const num2 = parseInt(v2[i]);
      
      if (num1 > num2) {
        return 1;
      }
      if (num1 < num2) {
        return -1;
      }
    }
    return 0;
  },
  
  /**
   * 检查版本是否满足最低要求
   * @param {string} currentVersion 当前版本
   * @param {string} minVersion 最低版本
   * @returns {boolean} 是否满足要求
   */
  isVersionAtLeast: function(currentVersion, minVersion) {
    return this.compareVersion(currentVersion, minVersion) >= 0;
  },
  
  /**
   * 设备信息检测
   */
  deviceDetection: {
    // 缓存设备信息
    cachedInfo: null,
    
    /**
     * 获取设备信息（带缓存）
     */
    getDeviceInfo: function() {
      if (!this.cachedInfo) {
        try {
          var info = systemInfoHelper.getSystemInfo() || {};
          this.cachedInfo = info;
        } catch (error) {
          console.error('❌ 获取设备信息失败:', error);
          this.cachedInfo = {
            platform: 'unknown',
            SDKVersion: '0.0.0',
            system: 'unknown'
          };
        }
      }
      return this.cachedInfo;
    },
    
    /**
     * 检查是否为iOS设备
     */
    isIOS: function() {
      const info = this.getDeviceInfo();
      return info.platform === 'ios';
    },
    
    /**
     * 检查是否为Android设备
     */
    isAndroid: function() {
      const info = this.getDeviceInfo();
      return info.platform === 'android';
    },
    
    /**
     * 检查是否为开发者工具
     */
    isDevTools: function() {
      const info = this.getDeviceInfo();
      return info.platform === 'devtools';
    },
    
    /**
     * 检查微信版本是否支持指定功能
     */
    supportsFeature: function(minSDKVersion) {
      const info = this.getDeviceInfo();
      return Utils.isVersionAtLeast(info.SDKVersion, minSDKVersion);
    }
  },
  
  /**
   * 时间格式化工具
   */
  timeFormatter: {
    /**
     * 格式化时间（秒 -> MM:SS）
     */
    formatTime: function(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
    },
    
    /**
     * 格式化时间（秒 -> HH:MM:SS）
     */
    formatTimeWithHours: function(seconds) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return this.formatTime(seconds);
    },
    
    /**
     * 获取当前时间戳
     */
    getTimestamp: function() {
      return Date.now();
    }
  },
  
  /**
   * 存储工具
   */
  storage: {
    /**
     * 安全设置存储
     */
    setItem: function(key, value) {
      try {
        wx.setStorageSync(key, value);
        return true;
      } catch (error) {
        console.error(`❌ 存储设置失败 (${key}):`, error);
        return false;
      }
    },
    
    /**
     * 安全获取存储
     */
    getItem: function(key, defaultValue = null) {
      try {
        const value = wx.getStorageSync(key);
        return value !== '' ? value : defaultValue;
      } catch (error) {
        console.error(`❌ 存储获取失败 (${key}):`, error);
        return defaultValue;
      }
    },
    
    /**
     * 安全删除存储
     */
    removeItem: function(key) {
      try {
        wx.removeStorageSync(key);
        return true;
      } catch (error) {
        console.error(`❌ 存储删除失败 (${key}):`, error);
        return false;
      }
    },
    
    /**
     * 清理过期存储
     */
    cleanExpired: function() {
      // 这里可以根据需要实现清理逻辑
      console.log('🧹 存储清理完成');
    }
  },
  
  /**
   * 字符串工具
   */
  stringUtils: {
    /**
     * 生成唯一ID
     */
    generateId: function(prefix = '') {
      return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    /**
     * 截断字符串
     */
    truncate: function(str, maxLength, suffix = '...') {
      if (str.length <= maxLength) {
        return str;
      }
      return str.substr(0, maxLength - suffix.length) + suffix;
    },
    
    /**
     * 首字母大写
     */
    capitalize: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    /**
     * 驼峰命名转换
     */
    toCamelCase: function(str) {
      return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }
  },
  
  /**
   * 数组工具
   */
  arrayUtils: {
    /**
     * 数组去重
     */
    unique: function(arr) {
      return [...new Set(arr)];
    },
    
    /**
     * 数组分组
     */
    groupBy: function(arr, key) {
      return arr.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      }, {});
    },
    
    /**
     * 数组排序
     */
    sortBy: function(arr, key, order = 'asc') {
      return arr.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (order === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }
  },
  
  /**
   * 对象工具
   */
  objectUtils: {
    /**
     * 深拷贝对象
     */
    deepClone: function(obj) {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
      
      if (obj instanceof Date) {
        return new Date(obj.getTime());
      }
      
      if (obj instanceof Array) {
        return obj.map(item => this.deepClone(item));
      }
      
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      
      return cloned;
    },
    
    /**
     * 合并对象
     */
    merge: function(target, ...sources) {
      if (!sources.length) return target;
      const source = sources.shift();
      
      if (this.isObject(target) && this.isObject(source)) {
        for (const key in source) {
          if (this.isObject(source[key])) {
            if (!target[key]) Object.assign(target, { [key]: {} });
            this.merge(target[key], source[key]);
          } else {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }
      
      return this.merge(target, ...sources);
    },
    
    /**
     * 检查是否为对象
     */
    isObject: function(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    }
  },
  
  /**
   * 验证工具
   */
  validator: {
    /**
     * 验证是否为空
     */
    isEmpty: function(value) {
      return value === null || value === undefined || value === '';
    },
    
    /**
     * 验证是否为有效URL
     */
    isValidUrl: function(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    
    /**
     * 验证是否为有效邮箱
     */
    isValidEmail: function(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  }
};

module.exports = Utils;