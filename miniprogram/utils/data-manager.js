// 统一数据管理器 - 处理双发复飞梯度分包数据的加载
// ES5兼容版本
function DataManager() {
  this.cache = {
    twinEngine: null // 双发复飞梯度数据缓存
  };
  this.loadingPromises = {};
}

// 清除缓存
DataManager.prototype.clearCache = function() {
  this.cache = {
    twinEngine: null
  };
  this.loadingPromises = {};
  console.log('🗑️ 数据缓存已清空');
};

// 获取缓存状态
DataManager.prototype.getCacheStatus = function() {
  return {
    twinEngine: !!this.cache.twinEngine
  };
};

// 加载双发复飞梯度数据
DataManager.prototype.loadTwinEngineData = function() {
  if (this.cache.twinEngine) {
    return Promise.resolve(this.cache.twinEngine);
  }

  if (this.loadingPromises.twinEngine) {
    return this.loadingPromises.twinEngine;
  }

  var self = this;
  this.loadingPromises.twinEngine = new Promise(function(resolve) {
    console.log('开始加载双发复飞梯度数据...');
    
    // 使用异步require加载分包数据
    require('../packageH/index.js', function(twinEngineData) {
      console.log('✅ 成功从packageH加载双发复飞梯度数据');
      if (twinEngineData && twinEngineData.gradientData) {
        self.cache.twinEngine = twinEngineData.gradientData;
        resolve(twinEngineData.gradientData);
      } else {
        console.warn('⚠️ 双发复飞梯度数据格式不正确，使用默认数据');
        var defaultData = self.getDefaultTwinEngineData();
        self.cache.twinEngine = defaultData;
        resolve(defaultData);
      }
    }, function(error) {
      console.warn('❌ 从packageH加载双发复飞梯度数据失败:', error);
      // 使用默认数据
      var defaultData = self.getDefaultTwinEngineData();
      self.cache.twinEngine = defaultData;
      resolve(defaultData);
    });
  });

  return this.loadingPromises.twinEngine;
};

// 获取默认双发复飞梯度数据
DataManager.prototype.getDefaultTwinEngineData = function() {
  return {
    // B737默认数据示例
    'B737': {
      'QAR10': { gradient: 2.8, limits: { min: 2.4, max: 3.2 } },
      'QAR15': { gradient: 2.5, limits: { min: 2.1, max: 2.9 } },
      'QAR20': { gradient: 2.2, limits: { min: 1.8, max: 2.6 } }
    }
  };
};

// 创建单例实例
var dataManager = new DataManager();

// 导出
module.exports = dataManager;