// 统一数据管理器 - 处理所有分包数据的加载 (严格ES5语法)
function DataManager() {
  this.cache = {
    icao: null,
    abbreviations: null,
    airports: null,
    definitions: null,
    iosa: null,
    twinEngine: null,
    ccar: null // 新增CCAR规章数据缓存
  };
  this.loadingPromises = {};
}

// 加载ICAO通信数据
DataManager.prototype.loadIcaoData = function() {
  var self = this;
  
  if (self.cache.icao) {
    return Promise.resolve(self.cache.icao);
  }

  if (self.loadingPromises.icao) {
    return self.loadingPromises.icao;
  }

  self.loadingPromises.icao = new Promise(function(resolve) {
    try {
      var icaoRawData = require('../packageA/icao900.js');
      var processedData = [];
      
      if (icaoRawData && icaoRawData.chapters) {
        // 新格式：包含chapters的对象
        icaoRawData.chapters.forEach(function(chapter) {
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
      } else if (Array.isArray(icaoRawData)) {
        // 旧格式：直接是数组
        processedData = icaoRawData;
      } else {
        console.warn('ICAO数据格式不正确:', icaoRawData);
      }
      
      // 尝试加载特情常用词汇
      try {
        var emergencyData = require('../packageA/emergencyGlossary.js');
        if (emergencyData && emergencyData.glossary && Array.isArray(emergencyData.glossary)) {
          
          // 将特情词汇转换为通信格式
          emergencyData.glossary.forEach(function(category) {
            if (category.terms && Array.isArray(category.terms)) {
              category.terms.forEach(function(term, index) {
                processedData.push({
                  chapter: category.name,
                  section: '特情常用词汇',
                  english: term.english,
                  chinese: term.chinese,
                  usage: '特情应急通信词汇',
                  id: 'emergency_' + category.name.split('.')[0] + '_' + (index + 1)
                });
              });
            }
          });
        }
      } catch (emergencyError) {
        // 特情词汇数据文件未找到，仅加载ICAO通信数据
      }
      
      self.cache.icao = processedData;
      resolve(processedData);
      
    } catch (error) {
      console.warn('❌ 从packageA加载ICAO数据失败:', error);
      // 使用默认数据
      var defaultData = [
        {
          "chapter": "第1章 一般用语",
          "section": "1.1 基本用语",
          "english": "Roger",
          "chinese": "收到",
          "usage": "确认收到信息"
        }
      ];
      self.cache.icao = defaultData;
      resolve(defaultData);
    }
  });

  return self.loadingPromises.icao;
};

// 加载缩写数据
DataManager.prototype.loadAbbreviationsData = function() {
  var self = this;
  
  if (self.cache.abbreviations) {
    return Promise.resolve(self.cache.abbreviations);
  }

  if (self.loadingPromises.abbreviations) {
    return self.loadingPromises.abbreviations;
  }

  self.loadingPromises.abbreviations = new Promise(function(resolve) {
    var allAbbreviations = [];
    var modules = [
      { path: '../packageB/abbreviationAIP.js', source: 'AIP' },
      { path: '../packageB/abbreviationsAirbus.js', source: 'Airbus' },
      { path: '../packageB/abbreviationBoeing.js', source: 'Boeing' },
      { path: '../packageB/abbreviationCOMAC.js', source: 'COMAC' },
      { path: '../packageB/abbreviationJeppesen.js', source: 'Jeppesen' }
    ];

    var remaining = modules.length;

    function finish() {
      remaining--;
      if (remaining <= 0) {
        self.cache.abbreviations = allAbbreviations;
        resolve(allAbbreviations);
      }
    }

    function safeMerge(data, source) {
      if (Array.isArray(data)) {
        data.forEach(function(item) {
          allAbbreviations.push(Object.assign({}, item, { source: source }));
        });
      }
    }

    modules.forEach(function(mod) {
      try {
        require(mod.path, function(moduleData) {
          safeMerge(moduleData, mod.source);
          finish();
        }, function(error) {
          console.warn('❌ 从packageB加载缩写数据失败:', mod.path, error);
          finish();
        });
      } catch (e) {
        console.warn('❌ 从packageB加载缩写数据失败:', mod.path, e);
        finish();
      }
    });
  });

  return self.loadingPromises.abbreviations;
};

// 加载机场数据
DataManager.prototype.loadAirportData = function() {
  var self = this;
  
  if (self.cache.airports) {
    return Promise.resolve(self.cache.airports);
  }

  if (self.loadingPromises.airports) {
    return self.loadingPromises.airports;
  }

  self.loadingPromises.airports = new Promise(function(resolve) {
    require('../packageC/airportdata.js', function(airportData) {
      if (Array.isArray(airportData) && airportData.length > 0) {
        self.cache.airports = airportData;
        resolve(airportData);
      } else {
        console.warn('⚠️ packageC机场数据为空');
        self.cache.airports = [];
        resolve([]);
      }
    }, function(error) {
      console.warn('❌ 从packageC加载机场数据失败:', error);
      self.cache.airports = [];
      resolve([]);
    });
  });

  return self.loadingPromises.airports;
};

// 加载定义数据
DataManager.prototype.loadDefinitionsData = function() {
  var self = this;
  
  if (self.cache.definitions) {
    return Promise.resolve(self.cache.definitions);
  }

  if (self.loadingPromises.definitions) {
    return self.loadingPromises.definitions;
  }

  self.loadingPromises.definitions = new Promise(function(resolve) {
    var allDefinitions = [];

    var modules = [
      '../packageD/definitions.js',
      '../packageD/AC-91-FS-2020-016R1.js',
      '../packageD/AC-121-FS-33R1.js',
      '../packageD/AC-121-FS-41R1.js',
      '../packageD/CCAR-121-R8.js',
      '../packageD/AC-91-FS-001R2.js',
      '../packageD/AC-121-50R2.js',
      '../packageD/AC-121FS-2018-008R1.js',
      '../packageD/AC-97-FS-005R1.js'
    ];

    var remaining = modules.length;

    function finish() {
      remaining--;
      if (remaining <= 0) {
        self.cache.definitions = allDefinitions;
        resolve(allDefinitions);
      }
    }

    function safeMerge(data) {
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(function(item) {
          allDefinitions.push(item);
        });
      }
    }

    modules.forEach(function(path) {
      try {
        require(path, function(moduleData) {
          safeMerge(moduleData);
          finish();
        }, function(error) {
          console.warn('❌ 从packageD加载定义数据失败:', path, error);
          finish();
        });
      } catch (e) {
        console.warn('❌ 从packageD加载定义数据失败:', path, e);
        finish();
      }
    });
  });

  return self.loadingPromises.definitions;
};

// 加载IOSA审计术语数据
DataManager.prototype.loadIOSAData = function() {
  var self = this;
  
  if (self.cache.iosa) {
    return Promise.resolve(self.cache.iosa);
  }

  if (self.loadingPromises.iosa) {
    return self.loadingPromises.iosa;
  }

  self.loadingPromises.iosa = new Promise(function(resolve) {
    try {
      require('../packageIOSA/IOSA.js', function(iosaData) {
        if (Array.isArray(iosaData) && iosaData.length > 0) {
          self.cache.iosa = iosaData;
          resolve(iosaData);
        } else {
          console.warn('⚠️ packageIOSA数据为空');
          self.cache.iosa = [];
          resolve([]);
        }
      }, function(error) {
        console.warn('❌ 从packageIOSA加载IOSA数据失败:', error);
        self.cache.iosa = [];
        resolve([]);
      });
    } catch (error) {
      console.warn('❌ 从packageIOSA加载IOSA数据失败:', error);
      self.cache.iosa = [];
      resolve([]);
    }
  });

  return self.loadingPromises.iosa;
};

// 加载CCAR规章数据
DataManager.prototype.loadCCARData = function() {
  var self = this;
  
  if (self.cache.ccar) {
    return Promise.resolve(self.cache.ccar);
  }

  if (self.loadingPromises.ccar) {
    return self.loadingPromises.ccar;
  }

  self.loadingPromises.ccar = new Promise(function(resolve) {
    try {
      var regulationData = require('../packageCCAR/regulation.js');
      var normativeData = require('../packageCCAR/normative.js');
      
      var allCCARData = [];
      
      // 合并规章数据
      if (Array.isArray(regulationData)) {
        regulationData.forEach(function(item) {
          allCCARData.push(Object.assign({}, item, { type: 'regulation' }));
        });
      }
      
      // 合并规范性文件数据
      if (Array.isArray(normativeData)) {
        normativeData.forEach(function(item) {
          allCCARData.push(Object.assign({}, item, { type: 'normative' }));
        });
      }
      
      self.cache.ccar = allCCARData;
      resolve(allCCARData);
      
    } catch (error) {
      console.warn('❌ 从packageCCAR加载规章数据失败:', error);
      self.cache.ccar = [];
      resolve([]);
    }
  });

  return self.loadingPromises.ccar;
};

// 加载双发复飞梯度数据
DataManager.prototype.loadTwinEngineData = function() {
  var self = this;
  
  if (self.cache.twinEngine) {
    return Promise.resolve(self.cache.twinEngine);
  }

  if (self.loadingPromises.twinEngine) {
    return self.loadingPromises.twinEngine;
  }

  self.loadingPromises.twinEngine = new Promise(function(resolve) {
    try {
      var twinEngineData = require('../packageH/TwinEngineGoAroundGradient.js');
      // 处理CommonJS模块导出
      var data = twinEngineData.exports || twinEngineData;
      
      if (data && Array.isArray(data) && data.length > 0) {
        self.cache.twinEngine = data;
        resolve(data);
      } else {
        console.warn('⚠️ packageH数据格式异常，使用默认数据');
        var defaultData = self.getDefaultTwinEngineData();
        self.cache.twinEngine = defaultData;
        resolve(defaultData);
      }
    } catch (error) {
      console.warn('❌ 从packageH加载双发复飞梯度数据失败:', error);
      var defaultData = self.getDefaultTwinEngineData();
      self.cache.twinEngine = defaultData;
      resolve(defaultData);
    }
  });

  return self.loadingPromises.twinEngine;
};

// 获取默认双发复飞梯度数据
DataManager.prototype.getDefaultTwinEngineData = function() {
  return [
    {
      "model": "A320-200",
      "conditions": {
        "air_con": "ON",
        "anti_ice": "OFF", 
        "config": "FULL",
        "temperature": "DISA+25°C"
      },
      "data": [
        {
          "weight_kg": 50000,
          "values": { "0": 20.0, "2000": 18.0, "4000": 16.0, "6000": 14.0 }
        }
      ]
    }
  ];
};

// 清除缓存
DataManager.prototype.clearCache = function() {
  this.cache = {
    icao: null,
    abbreviations: null,
    airports: null,
    definitions: null,
    iosa: null,
    twinEngine: null,
    ccar: null
  };
  this.loadingPromises = {};
  // 数据管理器缓存已清除
};

// 获取缓存的机场数据
DataManager.prototype.getCachedAirportData = function() {
  return this.cache.airports;
};

// 获取缓存状态
DataManager.prototype.getCacheStatus = function() {
  return {
    icao: !!this.cache.icao,
    abbreviations: !!this.cache.abbreviations,
    airports: !!this.cache.airports,
    definitions: !!this.cache.definitions,
    iosa: !!this.cache.iosa,
    twinEngine: !!this.cache.twinEngine,
    ccar: !!this.cache.ccar
  };
};

// 通用分包数据加载方法
DataManager.prototype.loadSubpackageData = function(packageName, dataFile) {
  var self = this;
  
  return new Promise(function(resolve) {
    try {
      var dataPath = '../' + packageName + '/' + dataFile;
      var data = require(dataPath);
      
      // 处理不同的数据格式
      var processedData = [];
      if (Array.isArray(data)) {
        processedData = data;
      } else if (data && typeof data === 'object') {
        // 处理对象格式的数据
        if (data.exports && Array.isArray(data.exports)) {
          processedData = data.exports;
        } else if (data.default && Array.isArray(data.default)) {
          processedData = data.default;
        }
      }
      
      resolve(processedData);
      
    } catch (error) {
      console.warn('❌ 加载分包数据失败:', packageName + '/' + dataFile, error);
      resolve([]);
    }
  });
};

// 创建全局实例
var dataManager = new DataManager();

module.exports = dataManager;