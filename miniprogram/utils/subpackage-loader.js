/**
 * 分包智能加载器 - 解决开发环境和真机环境的分包加载差异
 *
 * 核心策略：
 * 1. 开发环境：直接require，依赖开发工具的模块解析
 * 2. 真机环境：wx.loadSubpackage预加载 + require
 * 3. 分级降级：分包失败时自动降级到主包兜底数据
 * 4. 缓存机制：避免重复加载
 */

// ==================== 依赖引入 ====================
var EnvDetector = require('./env-detector.js');

// 调试模式开关：仅在本模块内部控制分包加载的详细日志
var DEBUG_MODE = false;

function SubpackageLoader() {
  this.cache = new Map();
  this.isDevTools = EnvDetector.isDevTools(); // 使用统一的环境检测工具
  this.packageMapping = {
    'packageA': { name: 'icaoPackage', dataFile: 'icao900.js' },
    'packageB': { name: 'abbreviationsPackage', dataFile: 'abbreviationAIP.js' },
    'packageC': { name: 'airportPackage', dataFile: 'airportdata.js' },
    'packageD': { name: 'definitionsPackage', dataFile: 'definitions.js' },
    'packageF': { name: 'acrPackage', dataFile: 'ACR.js' },
    'packageG': { name: 'dangerousGoodsPackage', dataFile: 'dangerousGoodsRegulations.js' },
    'packageH': { name: 'twinEnginePackage', dataFile: 'TwinEngineGoAroundGradient.js' },
    'packageCCAR': { name: 'caacPackage', dataFile: 'regulation.js' }
  };
}

// 智能加载分包数据
SubpackageLoader.prototype.loadSubpackageData = function(packageFolder, fallbackData) {
  var self = this;
  var cacheKey = packageFolder;
  
  if (DEBUG_MODE) {
    console.log('🔍 开始加载分包数据:', packageFolder, '开发环境:', self.isDevTools);
  }
  
  // 返回缓存数据
  if (self.cache.has(cacheKey)) {
    if (DEBUG_MODE) {
      console.log('💾 从缓存返回数据:', packageFolder);
    }
    return Promise.resolve(self.cache.get(cacheKey));
  }
  
  return new Promise(function(resolve) {
    var packageInfo = self.packageMapping[packageFolder];
    
    if (!packageInfo) {
      console.error('❌ 未知的分包文件夹:', packageFolder);
      resolve(fallbackData || []);
      return;
    }
    
    var dataPath = '../' + packageFolder + '/' + packageInfo.dataFile;
    if (DEBUG_MODE) {
      console.log('📂 数据路径:', dataPath, '分包信息:', packageInfo);
    }
    
    if (self.isDevTools) {
      // 开发环境：直接使用兜底数据
      self._loadInDevEnvironment(dataPath, packageFolder, fallbackData, resolve);
    } else {
      // 真机环境：分包预加载 + require
      self._loadInProductionEnvironment(packageInfo, dataPath, packageFolder, fallbackData, resolve);
    }
  });
};

// 开发环境加载策略
SubpackageLoader.prototype._loadInDevEnvironment = function(dataPath, packageFolder, fallbackData, resolve) {
  var self = this;
  
  if (DEBUG_MODE) {
    console.log('🔧 开发环境模式：使用兜底数据', packageFolder, '(真机上会正常加载完整数据)');
  }
  
  // 开发者工具不支持跨分包require，直接使用兜底数据
  // 这是正常行为，真机环境会正常工作
  var fallback = self._getFallbackData(packageFolder, fallbackData);
  self.cache.set(packageFolder, fallback);
  
  if (DEBUG_MODE) {
    console.log('✅ 兜底数据加载完成:', packageFolder, '数据量:', fallback.length);
  }
  resolve(fallback);
};

// 真机环境加载策略
SubpackageLoader.prototype._loadInProductionEnvironment = function(packageInfo, dataPath, packageFolder, fallbackData, resolve) {
  var self = this;

  if (DEBUG_MODE) {
    console.log('📱 真机环境加载:', packageFolder, '->', packageInfo.name);
  }
  
  // 先尝试直接require，如果失败再预加载
  try {
    var data = require(dataPath);
    var processedData = self._processModuleExports(data);

    if (Array.isArray(processedData) && processedData.length > 0) {
      if (DEBUG_MODE) {
        console.log('✅ 直接require成功:', packageFolder, '数据量:', processedData.length);
      }
      self.cache.set(packageFolder, processedData);
      resolve(processedData);
      return;
    }
  } catch (directError) {
    if (DEBUG_MODE) {
      console.log('ℹ️ 直接require失败，尝试预加载分包:', packageFolder);
    }
  }

  // 🔥 关键修复（2025-01-08）：检查 wx.loadSubpackage API 可用性
  // 真机调试模式下 wx.loadSubpackage 也不可用！
  // 不能假设"真机环境 = wx.loadSubpackage 必然可用"
  if (typeof wx.loadSubpackage !== 'function') {
    console.warn('⚠️ wx.loadSubpackage API 不可用（可能是真机调试模式），使用兜底数据');
    console.warn('💡 这是正常现象：真机调试模式不支持部分API，真机运行模式会自动加载分包');
    var fallback = self._getFallbackData(packageFolder, fallbackData);
    self.cache.set(packageFolder, fallback);
    resolve(fallback);
    return;
  }

  // 预加载分包
  wx.loadSubpackage({
    name: packageInfo.name,
    success: function() {
      if (DEBUG_MODE) {
        console.log('✅ 分包预加载成功:', packageInfo.name);
      }
      // 预加载成功后尝试require
      setTimeout(function() {
        self._tryDirectRequire(dataPath, packageFolder, fallbackData, resolve);
      }, 200); // 给分包加载更多时间
    },
    fail: function(error) {
      console.warn('⚠️ 分包预加载失败:', packageInfo.name, error);
      // 预加载失败时使用兜底数据
      var fallback = self._getFallbackData(packageFolder, fallbackData);
      self.cache.set(packageFolder, fallback);
      resolve(fallback);
    }
  });
};

// 直接require尝试
SubpackageLoader.prototype._tryDirectRequire = function(dataPath, packageFolder, fallbackData, resolve) {
  var self = this;
  
  try {
    var data = require(dataPath);
    var processedData = self._processModuleExports(data);
    
    if (Array.isArray(processedData) && processedData.length > 0) {
      if (DEBUG_MODE) {
        console.log('✅ require成功:', packageFolder, '数据量:', processedData.length);
      }
      self.cache.set(packageFolder, processedData);
      resolve(processedData);
    } else {
      console.warn('⚠️ require数据为空，使用兜底数据:', packageFolder);
      var fallback = self._getFallbackData(packageFolder, fallbackData);
      self.cache.set(packageFolder, fallback);
      resolve(fallback);
    }
  } catch (error) {
    if (DEBUG_MODE) {
      console.log('ℹ️ 开发环境分包加载限制，使用兜底数据:', packageFolder, '(这是正常现象)');
    }
    var fallback = self._getFallbackData(packageFolder, fallbackData);
    self.cache.set(packageFolder, fallback);
    resolve(fallback);
  }
};

// 处理不同的模块导出格式
SubpackageLoader.prototype._processModuleExports = function(data) {
  if (!data) return [];
  
  // 处理直接数组导出: module.exports = [...]
  if (Array.isArray(data)) {
    return data;
  }
  
  // 处理对象导出，查找数组属性
  if (typeof data === 'object') {
    // 特殊处理ICAO数据格式（包含chapters的对象结构）
    if (data.chapters && Array.isArray(data.chapters)) {
      var processedData = [];
      data.chapters.forEach(function(chapter) {
        if (chapter.sentences && Array.isArray(chapter.sentences)) {
          chapter.sentences.forEach(function(sentence) {
            processedData.push({
              chapter: chapter.name,
              section: chapter.section || '',
              english: sentence.english,
              chinese: sentence.chinese,
              usage: sentence.usage || '',
              id: sentence.id
            });
          });
        }
      });
      return processedData;
    }
    
    // 处理CommonJS导出: exports = { data: [...] }
    if (data.exports && Array.isArray(data.exports)) {
      return data.exports;
    }
    
    // 处理default导出格式
    if (data.default && Array.isArray(data.default)) {
      return data.default;
    }
    
    // 通用对象导出处理，查找数组属性
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (Array.isArray(data[key]) && data[key].length > 0) {
        return data[key];
      }
    }
  }
  
  return [];
};

// 获取兜底数据
SubpackageLoader.prototype._getFallbackData = function(packageFolder, fallbackData) {
  // 如果提供了自定义兜底数据，优先使用
  if (fallbackData && Array.isArray(fallbackData) && fallbackData.length > 0) {
    return fallbackData;
  }
  
  // 从兜底数据文件中获取对应分类的数据
  try {
    var fallbackDataModule = require('../data/fallback-data.js');
    var categoryMap = {
      'packageA': 'communications', // ICAO通信数据
      'packageB': 'abbreviations', // 缩写数据
      'packageC': 'airports',      // 机场数据
      'packageD': 'definitions',   // 定义数据
      'packageF': 'communications', // 通信数据
      'packageG': 'normatives',    // 危险品规章
      'packageH': 'normatives',    // 双发复飞规章
      'packageCCAR': 'normatives'  // CCAR规章数据
    };
    
    var category = categoryMap[packageFolder];
    if (category && fallbackDataModule[category]) {
      if (DEBUG_MODE) {
        console.log('📋 使用分类兜底数据:', packageFolder, '->', category);
      }
      return fallbackDataModule[category];
    }
  } catch (error) {
    console.warn('⚠️ 加载兜底数据文件失败:', error);
  }
  
  // 最后降级到空数组
  return [];
};

// 清除缓存
SubpackageLoader.prototype.clearCache = function() {
  this.cache.clear();
  if (DEBUG_MODE) {
    console.log('🗑️ 分包加载器缓存已清除');
  }
};

// 获取缓存状态
SubpackageLoader.prototype.getCacheStatus = function() {
  var status = {};
  var packages = Object.keys(this.packageMapping);
  
  for (var i = 0; i < packages.length; i++) {
    var pkg = packages[i];
    status[pkg] = this.cache.has(pkg);
  }
  
  return status;
};

// 创建全局实例
var subpackageLoader = new SubpackageLoader();

module.exports = subpackageLoader;