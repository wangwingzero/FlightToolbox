// 机场数据加载器
// 严格ES5语法，确保真机兼容性

var DataLoader = {
  // 数据缓存
  cachedAirports: null,
  isLoading: false,
  loadingPromise: null,
  
  // 加载机场数据
  loadAirportData: function() {
    var self = this;
    
    // 如果已经有缓存数据，直接返回
    if (this.cachedAirports) {
      return Promise.resolve(this.cachedAirports);
    }
    
    // 如果正在加载，返回现有的Promise
    if (this.isLoading && this.loadingPromise) {
      return this.loadingPromise;
    }
    
    // 开始加载数据
    this.isLoading = true;
    this.loadingPromise = new Promise(function(resolve, reject) {
      try {
        console.log('📄 开始加载机场数据...');
        
        // 使用相对路径加载数据文件
        var airportsModule = require('./airportdata.js');
        console.log('📄 数据文件加载成功，检查模块格式...');
        
        var airportsData = null;
        
        // 处理不同的模块导出格式
        console.log('📄 模块类型检查:', typeof airportsModule, 'isArray:', Array.isArray(airportsModule));
        
        if (Array.isArray(airportsModule)) {
          // 直接导出数组（当前格式）
          airportsData = airportsModule;
          console.log('📄 使用直接数组格式，数据长度:', airportsData.length);
        } else if (airportsModule && airportsModule.airports && Array.isArray(airportsModule.airports)) {
          // 对象包含airports属性
          airportsData = airportsModule.airports;
          console.log('📄 使用.airports属性格式，数据长度:', airportsData.length);
        } else if (airportsModule && airportsModule.default && Array.isArray(airportsModule.default)) {
          // ES6默认导出
          airportsData = airportsModule.default;
          console.log('📄 使用ES6默认导出格式，数据长度:', airportsData.length);
        } else if (typeof airportsModule === 'object' && airportsModule) {
          // 尝试直接使用exports的内容
          airportsData = airportsModule;
          console.log('📄 尝试直接使用对象内容');
        } else {
          console.error('📄 无法识别数据格式，模块内容:', airportsModule);
          throw new Error('无法识别的数据文件格式');
        }
        
        // 验证数据格式
        if (!Array.isArray(airportsData)) {
          throw new Error('机场数据格式不正确，应为数组格式');
        }
        
        if (airportsData.length === 0) {
          throw new Error('机场数据为空');
        }
        
        // 数据预处理和验证
        var processedData = self.preprocessAirportData(airportsData);
        
        // 缓存处理后的数据
        self.cachedAirports = processedData;
        
        console.log('✅ 机场数据加载成功！');
        console.log('📊 数据统计: 共' + processedData.length + '条机场记录');
        console.log('📊 处理成功率: ' + Math.round((processedData.length / airportsData.length) * 100) + '%');
        
        self.isLoading = false;
        self.loadingPromise = null;
        
        resolve(processedData);
        
      } catch (error) {
        console.error('加载机场数据失败:', error);
        
        self.isLoading = false;
        self.loadingPromise = null;
        
        // 返回空数组作为fallback，确保程序不崩溃
        var fallbackData = [];
        self.cachedAirports = fallbackData;
        
        reject(error);
      }
    });
    
    return this.loadingPromise;
  },
  
  // 数据预处理
  preprocessAirportData: function(rawData) {
    var processedData = [];
    
    for (var i = 0; i < rawData.length; i++) {
      var airport = rawData[i];
      
      try {
        // 数据完整性验证
        if (!airport.ICAOCode || !airport.ShortName) {
          console.warn('跳过不完整的机场数据:', airport);
          continue;
        }
        
        // 创建处理后的机场对象
        var processedAirport = {
          // 基本信息
          ICAOCode: (airport.ICAOCode || '').toString().toUpperCase().trim(),
          IATACode: (airport.IATACode || '').toString().toUpperCase().trim(),
          ShortName: (airport.ShortName || '').toString().trim(),
          EnglishName: (airport.EnglishName || '').toString().trim(),
          CountryName: (airport.CountryName || '').toString().trim(),
          
          // 地理坐标 (数字格式)
          Latitude: this.parseCoordinate(airport.Latitude),
          Longitude: this.parseCoordinate(airport.Longitude),
          
          // 格式化的坐标字符串 (用于显示)
          LatitudeDisplay: this.formatCoordinate(this.parseCoordinate(airport.Latitude)),
          LongitudeDisplay: this.formatCoordinate(this.parseCoordinate(airport.Longitude)),
          
          // 搜索关键字（用于提高搜索性能）
          searchKeywords: this.generateSearchKeywords(airport),
          
          // 原始数据（保留扩展字段）
          originalData: airport
        };
        
        processedData.push(processedAirport);
        
      } catch (error) {
        console.warn('处理机场数据时出错:', airport, error);
        continue;
      }
    }
    
    return processedData;
  },
  
  // 解析坐标
  parseCoordinate: function(coord) {
    if (coord === null || coord === undefined || coord === '') {
      return 0;
    }
    
    var parsed = parseFloat(coord);
    return isNaN(parsed) ? 0 : parsed;
  },
  
  // 格式化坐标显示
  formatCoordinate: function(coord) {
    if (typeof coord !== 'number' || isNaN(coord)) {
      return '0.000';
    }
    return coord.toFixed(3);
  },
  
  // 生成搜索关键字
  generateSearchKeywords: function(airport) {
    var keywords = [];
    
    // 收集所有可搜索的字段
    var fields = ['ICAOCode', 'IATACode', 'ShortName', 'EnglishName', 'CountryName'];
    
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var value = airport[field];
      
      if (value && typeof value === 'string' && value.trim()) {
        keywords.push(value.toString().toLowerCase().trim());
      }
    }
    
    return keywords.join(' ');
  },
  
  // 清除缓存（用于测试或重新加载）
  clearCache: function() {
    this.cachedAirports = null;
    this.isLoading = false;
    this.loadingPromise = null;
    console.log('机场数据缓存已清除');
  },
  
  // 获取缓存状态
  getCacheStatus: function() {
    return {
      hasCachedData: !!this.cachedAirports,
      isLoading: this.isLoading,
      cacheSize: this.cachedAirports ? this.cachedAirports.length : 0
    };
  }
};

module.exports = DataLoader;