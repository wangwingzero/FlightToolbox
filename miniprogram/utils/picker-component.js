/**
 * 通用Picker组件 - 解决Picker重复代码问题
 * 严格遵循ES5语法，确保小程序兼容性
 * 支持单列、多列、联动选择等功能
 */

/**
 * Picker组件构造函数
 */
function PickerComponent(options) {
  this.options = options || {};
  this.defaultTitle = this.options.defaultTitle || '请选择';
  this.enableStorage = this.options.enableStorage !== false;
  this.storageKey = this.options.storageKey || 'picker_selections';
}

/**
 * 创建Picker混入对象
 */
PickerComponent.prototype.createPickerMixin = function(config) {
  var self = this;
  var pickerConfig = config || {};
  
  return {
    data: {
      showPicker: false,
      pickerTitle: pickerConfig.title || self.defaultTitle,
      pickerColumns: [],
      pickerValue: [],
      selectedValue: '',
      selectedIndex: -1,
      pickerLoading: false
    },
    
    /**
     * 显示选择器
     */
    showPicker: function(options) {
      var showOptions = options || {};
      
      // 设置选择器数据
      var columns = showOptions.columns || this.data.pickerColumns;
      var title = showOptions.title || this.data.pickerTitle;
      var defaultValue = showOptions.defaultValue || [];
      
      this.setData({
        showPicker: true,
        pickerColumns: columns,
        pickerTitle: title,
        pickerValue: defaultValue,
        pickerLoading: false
      });
      
      // 触发显示事件
      if (pickerConfig.onShow && typeof pickerConfig.onShow === 'function') {
        pickerConfig.onShow.call(this, showOptions);
      }
    },
    
    /**
     * 隐藏选择器
     */
    hidePicker: function() {
      this.setData({
        showPicker: false,
        pickerLoading: false
      });
      
      // 触发隐藏事件
      if (pickerConfig.onHide && typeof pickerConfig.onHide === 'function') {
        pickerConfig.onHide.call(this);
      }
    },
    
    /**
     * 选择器确认
     */
    onPickerConfirm: function(e) {
      var detail = e.detail;
      var value = detail.value;
      var index = detail.index;
      
      // 获取选中的文本
      var selectedText = self.getSelectedText(value, this.data.pickerColumns);
      
      this.setData({
        selectedValue: selectedText,
        selectedIndex: index,
        showPicker: false,
        pickerLoading: false
      });
      
      // 保存选择历史
      if (self.enableStorage) {
        self.saveSelection(selectedText, value, index);
      }
      
      // 触发确认事件
      if (pickerConfig.onConfirm && typeof pickerConfig.onConfirm === 'function') {
        pickerConfig.onConfirm.call(this, {
          value: value,
          index: index,
          text: selectedText,
          detail: detail
        });
      }
    },
    
    /**
     * 选择器取消
     */
    onPickerCancel: function() {
      this.hidePicker();
      
      // 触发取消事件
      if (pickerConfig.onCancel && typeof pickerConfig.onCancel === 'function') {
        pickerConfig.onCancel.call(this);
      }
    },
    
    /**
     * 选择器值变化（用于联动）
     */
    onPickerChange: function(e) {
      var detail = e.detail;
      var value = detail.value;
      var column = detail.column;
      
      // 处理联动逻辑
      if (pickerConfig.cascade && typeof pickerConfig.onCascadeChange === 'function') {
        var newColumns = pickerConfig.onCascadeChange.call(this, value, column, this.data.pickerColumns);
        if (newColumns) {
          this.setData({
            pickerColumns: newColumns,
            pickerValue: value
          });
        }
      }
      
      // 触发变化事件
      if (pickerConfig.onChange && typeof pickerConfig.onChange === 'function') {
        pickerConfig.onChange.call(this, {
          value: value,
          column: column,
          detail: detail
        });
      }
    },
    
    /**
     * 重置选择器
     */
    resetPicker: function() {
      this.setData({
        selectedValue: '',
        selectedIndex: -1,
        pickerValue: []
      });
    },
    
    /**
     * 获取选择历史
     */
    getSelectionHistory: function() {
      if (self.enableStorage) {
        return self.getStoredSelections();
      }
      return [];
    }
  };
};

/**
 * 获取选中文本
 */
PickerComponent.prototype.getSelectedText = function(value, columns) {
  if (!value || !columns || !Array.isArray(value) || !Array.isArray(columns)) {
    return '';
  }
  
  var texts = [];
  for (var i = 0; i < value.length && i < columns.length; i++) {
    var column = columns[i];
    var index = value[i];
    if (Array.isArray(column) && index >= 0 && index < column.length) {
      var item = column[index];
      var text = '';
      if (typeof item === 'string') {
        text = item;
      } else if (item && item.text) {
        text = item.text;
      } else if (item && item.name) {
        text = item.name;
      } else if (item && item.label) {
        text = item.label;
      }
      texts.push(text);
    }
  }
  return texts.join(' ');
};

/**
 * 创建简单列表数据
 */
PickerComponent.prototype.createSimpleList = function(items, config) {
  if (!Array.isArray(items)) {
    return [];
  }
  
  var listConfig = config || {};
  var textField = listConfig.textField || 'text';
  var valueField = listConfig.valueField || 'value';
  
  return items.map(function(item) {
    if (typeof item === 'string') {
      return item;
    } else if (item && typeof item === 'object') {
      return {
        text: item[textField] || item.name || item.label || String(item),
        value: item[valueField] || item
      };
    }
    return String(item);
  });
};

/**
 * 创建级联数据
 */
PickerComponent.prototype.createCascadeData = function(data, config) {
  var cascadeConfig = config || {};
  var levels = cascadeConfig.levels || 2;
  var textField = cascadeConfig.textField || 'text';
  var valueField = cascadeConfig.valueField || 'value';
  var childrenField = cascadeConfig.childrenField || 'children';
  
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  var columns = [];
  
  // 第一级
  var firstColumn = data.map(function(item) {
    return {
      text: item[textField] || item.name || String(item),
      value: item[valueField] || item,
      children: item[childrenField] || []
    };
  });
  columns.push(firstColumn);
  
  // 后续级别
  for (var level = 1; level < levels; level++) {
    if (firstColumn.length > 0 && firstColumn[0].children) {
      var nextColumn = firstColumn[0].children.map(function(item) {
        return {
          text: item[textField] || item.name || String(item),
          value: item[valueField] || item
        };
      });
      columns.push(nextColumn);
    } else {
      columns.push([]);
    }
  }
  
  return columns;
};

/**
 * 处理级联变化
 */
PickerComponent.prototype.handleCascadeChange = function(value, column, columns, data) {
  if (!data || !Array.isArray(data) || column !== 0) {
    return null;
  }
  
  var selectedIndex = value[0];
  if (selectedIndex < 0 || selectedIndex >= data.length) {
    return null;
  }
  
  var selectedItem = data[selectedIndex];
  if (!selectedItem || !selectedItem.children || !Array.isArray(selectedItem.children)) {
    return null;
  }
  
  var newColumns = columns.slice();
  newColumns[1] = selectedItem.children.map(function(item) {
    return {
      text: item.text || item.name || String(item),
      value: item.value || item
    };
  });
  
  return newColumns;
};

/**
 * 保存选择记录
 */
PickerComponent.prototype.saveSelection = function(text, value, index) {
  if (!this.enableStorage) {
    return;
  }
  
  try {
    var selections = this.getStoredSelections();
    var newSelection = {
      text: text,
      value: value,
      index: index,
      timestamp: Date.now()
    };
    
    // 避免重复记录
    var existingIndex = -1;
    for (var i = 0; i < selections.length; i++) {
      if (selections[i].text === text) {
        existingIndex = i;
        break;
      }
    }
    
    if (existingIndex >= 0) {
      selections[existingIndex] = newSelection;
    } else {
      selections.unshift(newSelection);
    }
    
    // 限制记录数量
    if (selections.length > 20) {
      selections = selections.slice(0, 20);
    }
    
    wx.setStorageSync(this.storageKey, selections);
  } catch (error) {
    console.warn('保存选择记录失败:', error);
  }
};

/**
 * 获取存储的选择记录
 */
PickerComponent.prototype.getStoredSelections = function() {
  if (!this.enableStorage) {
    return [];
  }
  
  try {
    return wx.getStorageSync(this.storageKey) || [];
  } catch (error) {
    console.warn('获取选择记录失败:', error);
    return [];
  }
};

/**
 * 清除选择记录
 */
PickerComponent.prototype.clearSelectionHistory = function() {
  if (!this.enableStorage) {
    return;
  }
  
  try {
    wx.removeStorageSync(this.storageKey);
    console.log('选择记录已清除');
  } catch (error) {
    console.warn('清除选择记录失败:', error);
  }
};

/**
 * 获取常用选择
 */
PickerComponent.prototype.getFrequentSelections = function(limit) {
  var selections = this.getStoredSelections();
  var maxLimit = limit || 5;
  
  // 按使用频次排序（这里简化为按时间排序）
  selections.sort(function(a, b) {
    return b.timestamp - a.timestamp;
  });
  
  return selections.slice(0, maxLimit);
};

/**
 * 预设数据创建器
 */
PickerComponent.prototype.createPresetData = function(type, options) {
  var presetOptions = options || {};
  
  switch (type) {
    case 'time':
      return this.createTimeData(presetOptions);
    case 'date':
      return this.createDateData(presetOptions);
    case 'region':
      return this.createRegionData(presetOptions);
    default:
      return [];
  }
};

/**
 * 创建时间选择数据
 */
PickerComponent.prototype.createTimeData = function(options) {
  var timeOptions = options || {};
  var startHour = timeOptions.startHour || 0;
  var endHour = timeOptions.endHour || 23;
  var minuteStep = timeOptions.minuteStep || 1;
  
  var hours = [];
  var minutes = [];
  
  for (var h = startHour; h <= endHour; h++) {
    hours.push(String(h).padStart(2, '0') + '时');
  }
  
  for (var m = 0; m < 60; m += minuteStep) {
    minutes.push(String(m).padStart(2, '0') + '分');
  }
  
  return [hours, minutes];
};

/**
 * 创建日期选择数据
 */
PickerComponent.prototype.createDateData = function(options) {
  var dateOptions = options || {};
  var startYear = dateOptions.startYear || new Date().getFullYear() - 10;
  var endYear = dateOptions.endYear || new Date().getFullYear() + 10;
  
  var years = [];
  var months = [];
  var days = [];
  
  for (var y = startYear; y <= endYear; y++) {
    years.push(y + '年');
  }
  
  for (var m = 1; m <= 12; m++) {
    months.push(String(m).padStart(2, '0') + '月');
  }
  
  for (var d = 1; d <= 31; d++) {
    days.push(String(d).padStart(2, '0') + '日');
  }
  
  return [years, months, days];
};

/**
 * 创建地区选择数据（简化版）
 */
PickerComponent.prototype.createRegionData = function(options) {
  // 这里提供简化的地区数据，实际使用时应该加载完整的地区数据
  var provinces = ['北京市', '上海市', '天津市', '重庆市', '广东省', '江苏省', '浙江省'];
  var cities = ['北京市', '上海市', '天津市', '重庆市'];
  var districts = ['朝阳区', '海淀区', '西城区', '东城区'];
  
  return [provinces, cities, districts];
};

/**
 * 工厂方法：创建Picker实例
 */
function createPickerComponent(options) {
  return new PickerComponent(options);
}

// 导出
module.exports = {
  PickerComponent: PickerComponent,
  createPickerComponent: createPickerComponent
};