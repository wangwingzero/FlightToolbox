/**
 * 统一数据管理器 - 严格ES5语法
 * 提供数据分组和处理功能
 */

var dataManagerUtil = {
  /**
   * 按首字母对数据进行分组
   * @param {Array} data - 要分组的数据数组
   * @param {string} keyField - 用于分组的字段名
   * @returns {Array} 分组后的数据
   */
  groupDataByLetter: function(data, keyField) {
    if (!data || !Array.isArray(data) || !keyField) {
      return [];
    }

    var groups = {};
    
    // 遍历数据进行分组
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      if (!item || !item[keyField]) {
        continue;
      }
      
      var firstChar = item[keyField].charAt(0).toUpperCase();
      
      // 确保是字母或数字
      if (/[A-Z0-9]/.test(firstChar)) {
        if (!groups[firstChar]) {
          groups[firstChar] = {
            letter: firstChar,
            items: [],
            count: 0
          };
        }
        
        groups[firstChar].items.push(item);
        groups[firstChar].count++;
      }
    }
    
    // 转换为数组并排序
    var groupArray = [];
    for (var letter in groups) {
      groupArray.push(groups[letter]);
    }
    
    groupArray.sort(function(a, b) {
      return a.letter.localeCompare(b.letter);
    });
    
    return groupArray;
  },

  /**
   * 按章节对通信数据进行分组
   * @param {Array} data - 要分组的数据数组
   * @returns {Array} 分组后的数据
   */
  groupDataByChapter: function(data) {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    var groups = {};
    
    // 遍历数据进行分组
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      if (!item) {
        continue;
      }
      
      var chapter = item.chapter || item.section || item.title || 'Other';
      
      if (!groups[chapter]) {
        groups[chapter] = {
          letter: chapter,
          chapter: chapter,
          items: [],
          count: 0
        };
      }
      
      groups[chapter].items.push(item);
      groups[chapter].count++;
    }
    
    // 转换为数组
    var groupArray = [];
    for (var chapter in groups) {
      groupArray.push(groups[chapter]);
    }
    
    return groupArray;
  },

  /**
   * 处理和清理数据
   * @param {Array} data - 原始数据
   * @returns {Array} 处理后的数据
   */
  processData: function(data) {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    // 基本数据清理
    return data.filter(function(item) {
      return item && typeof item === 'object';
    });
  },

  /**
   * 按类别分组数据
   * @param {Array} data - 要分组的数据数组
   * @param {string} categoryField - 分类字段名
   * @returns {Array} 分组后的数据
   */
  groupDataByCategory: function(data, categoryField) {
    if (!data || !Array.isArray(data) || !categoryField) {
      return [];
    }

    var groups = {};
    
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      if (!item || !item[categoryField]) {
        continue;
      }
      
      var category = item[categoryField];
      
      if (!groups[category]) {
        groups[category] = {
          name: category,
          items: [],
          count: 0
        };
      }
      
      groups[category].items.push(item);
      groups[category].count++;
    }
    
    var groupArray = [];
    for (var category in groups) {
      groupArray.push(groups[category]);
    }
    
    return groupArray;
  }
};

module.exports = dataManagerUtil;