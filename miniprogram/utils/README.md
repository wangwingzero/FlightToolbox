# FlightToolbox 重构后的工具组件使用指南

本文档介绍了重构后的基类和组件，帮助开发者快速使用统一的代码模式，减少重复代码。

## 🎯 重构成果

通过本次重构，我们解决了以下重复代码问题：
- **主题管理重复**：48个文件的相同主题管理代码
- **数据加载重复**：24个文件的相似数据加载逻辑
- **搜索功能重复**：6个文件的重复搜索代码
- **错误处理重复**：74个文件的相似错误处理
- **Picker组件重复**：14个文件的相同Picker配置

## 📦 核心组件

### 1. BasePage - 页面基类

统一的页面基类，解决主题管理、错误处理、数据加载等重复代码。

#### 使用方法

```javascript
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    // 你的页面数据
    customData: 'value'
  },

  // 自定义生命周期方法
  customOnLoad: function(options) {
    console.log('页面加载');
    // 你的自定义逻辑
  },

  customOnShow: function() {
    console.log('页面显示');
  },

  customOnUnload: function() {
    console.log('页面卸载');
    // 清理自定义资源
  },

  // 你的页面方法
  myMethod: function() {
    // 使用基类提供的方法
    this.showLoading('加载中...');
    this.loadDataWithLoading(loadFunction, options);
    this.handleError(error, '操作失败');
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));
```

#### 基类提供的功能

##### 自动处理的功能
- ✅ **主题管理**：自动初始化和清理主题监听器
- ✅ **错误处理**：统一的错误处理和用户提示
- ✅ **资源清理**：页面卸载时自动清理定时器、音频等资源

##### 数据加载方法
```javascript
// 通用数据加载（带loading状态）
this.loadDataWithLoading(function() {
  return dataLoadFunction();
}, {
  loadingKey: 'myLoading',
  dataKey: 'myData',
  context: '我的数据加载'
});

// 分包异步数据加载
this.loadSubpackageData('packageA', '../../packageA/data.js', {
  context: '分包数据',
  fallbackData: []
});

// 批量预加载分包
this.preloadMultipleSubpackages(['packageA', 'packageB']);
```

##### 用户提示方法
```javascript
this.showLoading('加载中...');
this.hideLoading();
this.showSuccess('操作成功');
this.showError('操作失败');
```

##### 错误处理方法
```javascript
this.handleError(error, '操作上下文', showToast);
this.safeSetData(data, callback);
```

### 2. SearchComponent - 通用搜索组件

解决搜索功能重复代码问题，支持防抖、缓存、多字段搜索。

#### 使用方法

```javascript
var SearchComponent = require('../../utils/search-component.js');

// 创建搜索组件实例
var searchComponent = SearchComponent.createSearchComponent({
  searchDelay: 300,
  enableCache: true,
  minLength: 1,
  maxResults: 100
});

// 在页面中使用
var pageConfig = {
  data: {
    originalData: [],
    filteredData: [],
    searchValue: ''
  },

  // 搜索输入处理
  onSearchInput: function(e) {
    var searchValue = e.detail.value;
    this.setData({ searchValue: searchValue });
    this.performSearch(searchValue);
  },

  // 执行搜索
  performSearch: function(keyword) {
    if (!keyword || !keyword.trim()) {
      this.setData({ filteredData: this.data.originalData });
      return;
    }

    var results = searchComponent.search(keyword, this.data.originalData, {
      searchFields: ['name', 'description', 'category'],
      caseSensitive: false,
      exactMatch: false
    });

    this.setData({ filteredData: results });
  }
};
```

#### 搜索配置选项

```javascript
var searchConfig = {
  searchFields: ['name', 'title', 'description'], // 搜索字段
  caseSensitive: false,                           // 是否区分大小写
  exactMatch: false,                              // 是否精确匹配
  useCache: true,                                 // 是否使用缓存
  maxResults: 100                                 // 最大结果数量
};
```

#### 高级搜索功能

```javascript
// 多关键词搜索
var results = searchComponent.advancedSearch('关键词1 关键词2', data, {
  matchMode: 'all', // 'all' 或 'any'
  searchFields: ['name', 'description']
});

// 获取搜索建议
var suggestions = searchComponent.getSuggestions('关键', data, {
  maxSuggestions: 10,
  suggestionFields: ['name', 'title']
});

// 快速搜索（静态方法）
var results = SearchComponent.quickSearch(keyword, data, ['name', 'description']);
```

### 3. PickerComponent - 通用选择器组件

解决Picker组件重复代码问题，支持单列、多列、联动选择。

#### 使用方法

```javascript
var PickerComponent = require('../../utils/picker-component.js');

// 创建Picker组件实例
var pickerComponent = PickerComponent.createPickerComponent({
  enableStorage: true,
  storageKey: 'my_picker_history'
});

// 创建Picker混入
var pickerMixin = pickerComponent.createPickerMixin({
  title: '请选择',
  onConfirm: function(event) {
    console.log('选择确认:', event);
    // 处理选择结果
  },
  onCancel: function() {
    console.log('取消选择');
  }
});

// 在页面中使用
var pageConfig = {
  data: {
    // Picker混入会自动添加以下数据
    // showPicker: false,
    // pickerColumns: [],
    // selectedValue: ''
  },

  // 显示选择器
  showMyPicker: function() {
    this.showPicker({
      columns: [['选项1', '选项2', '选项3']],
      title: '选择选项',
      defaultValue: [0]
    });
  },

  // 混入Picker功能
  ...pickerMixin
};
```

#### 预设数据创建

```javascript
// 创建时间选择数据
var timeColumns = pickerComponent.createTimeData({
  startHour: 6,
  endHour: 23,
  minuteStep: 15
});

// 创建日期选择数据
var dateColumns = pickerComponent.createDateData({
  startYear: 2020,
  endYear: 2030
});

// 创建级联数据
var cascadeColumns = pickerComponent.createCascadeData(data, {
  levels: 3,
  textField: 'name',
  valueField: 'id',
  childrenField: 'children'
});
```

### 4. DataLoader - 数据加载管理器

统一的数据加载管理，支持分包异步化、缓存、重试机制。

#### 使用方法

```javascript
var dataLoader = require('../../utils/data-loader.js');

// 基本数据加载
dataLoader.loadWithLoading(pageInstance, function() {
  return loadDataFunction();
}, {
  loadingKey: 'loading',
  dataKey: 'data',
  context: '数据加载',
  enableCache: true,
  cacheKey: 'my_data'
});

// 分包数据加载
dataLoader.loadSubpackageData(pageInstance, 'packageA', '../../packageA/data.js', {
  context: '分包数据',
  fallbackData: []
});

// 带重试的数据加载
dataLoader.loadWithRetry(pageInstance, loadFunction, {
  maxRetries: 3,
  retryDelay: 1000,
  context: '重要数据'
});

// 批量预加载分包
dataLoader.preloadSubpackages(['packageA', 'packageB'], {
  showProgress: true,
  interval: 500
});
```

### 5. 扩展的错误处理系统

统一的错误处理，支持网络错误、异步错误等。

#### 使用方法

```javascript
var errorHandler = require('../../utils/error-handler.js');

// 基本错误处理
try {
  // 业务逻辑
} catch (error) {
  errorHandler.handleError(error, '操作上下文', true);
}

// 网络错误处理
errorHandler.handleNetworkError(error, '网络请求');

// 安全的异步操作
errorHandler.safeAsync(function() {
  return asyncOperation();
}, '异步操作').then(function(result) {
  // 成功处理
}).catch(function(error) {
  // 错误已经被处理
});
```

## 🚀 离线优先设计

所有组件都严格遵循离线优先原则：

### 分包异步化策略
```javascript
// 检查分包是否已预加载
dataLoader.checkSubpackagePreloaded('packageA').then(function(isPreloaded) {
  if (isPreloaded) {
    // 直接加载数据
  } else {
    // 异步加载分包后再加载数据
  }
});

// 兜底数据处理
dataLoader.loadSubpackageData(pageInstance, 'packageA', dataPath, {
  fallbackData: [] // 加载失败时使用的兜底数据
});
```

### 缓存机制
```javascript
// 启用数据缓存
dataLoader.loadWithLoading(pageInstance, loadFunction, {
  enableCache: true,
  cacheKey: 'unique_cache_key'
});

// 清除缓存
dataLoader.clearCache('specific_key'); // 清除特定缓存
dataLoader.clearCache(); // 清除所有缓存
```

## 🎯 ES5语法兼容性

所有组件都严格遵循ES5语法，确保小程序兼容性：

### 避免的现代语法
```javascript
// ❌ 避免使用
obj?.prop                    // 可选链
obj ?? defaultValue         // 空值合并
`template ${string}`        // 模板字符串
() => {}                    // 箭头函数
{...spread}                 // 扩展运算符

// ✅ 使用ES5语法
obj && obj.prop             // 传统条件检查
obj || defaultValue         // 逻辑或
'string' + variable         // 字符串拼接
function() {}               // 普通函数
Object.assign({}, obj)      // 对象合并
```

### 推荐的使用模式
```javascript
// 变量声明
var myVariable = 'value';

// 函数定义
function myFunction() {
  var self = this;
  return function() {
    return self.method();
  };
}

// 对象操作
var newObj = {};
for (var key in oldObj) {
  if (oldObj.hasOwnProperty(key)) {
    newObj[key] = oldObj[key];
  }
}

// 数组操作
var newArray = oldArray.slice();
var filtered = oldArray.filter(function(item) {
  return item.condition;
});
```

## 📊 性能优化

### 内存管理
- 自动清理定时器、事件监听器
- 缓存管理，避免内存泄漏
- 分包按需加载，减少内存占用

### 数据加载优化
- 防抖机制，减少无效请求
- 缓存机制，避免重复加载
- 分包预加载，提升用户体验

## 🔧 迁移指南

### 从旧页面迁移到新基类

1. **创建新的页面文件（.js后缀）**
2. **引入BasePage和所需组件**
3. **重构页面配置**
4. **测试功能完整性**

```javascript
// 旧的页面代码
Page({
  data: { isDarkMode: false },
  onLoad() {
    this.initializeTheme();
  },
  onUnload() {
    this.themeCleanup();
  }
});

// 新的页面代码
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {},
  customOnLoad: function(options) {
    // 自定义逻辑，主题管理由基类处理
  }
};

Page(BasePage.createPage(pageConfig));
```

## 🚨 注意事项

1. **文件扩展名**：重构后的页面使用`.js`扩展名，确保ES5兼容性
2. **引用路径**：检查require路径，确保正确引用组件
3. **生命周期**：使用`customOnLoad`等自定义生命周期方法
4. **数据合并**：基类会自动合并data对象，注意命名冲突
5. **错误处理**：优先使用基类提供的错误处理方法

## 📝 开发建议

1. **优先使用基类**：新页面都应该使用BasePage基类
2. **复用组件**：搜索、选择器等功能使用通用组件
3. **遵循ES5**：严格避免使用ES6+语法
4. **测试验证**：使用`node -c`验证语法，真机测试功能
5. **离线优先**：确保所有功能都能在离线环境下正常运行

通过使用这些重构后的组件，可以显著减少代码重复，提高开发效率，确保代码一致性和维护性。