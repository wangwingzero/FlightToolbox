// 统一数据管理器 - 处理所有分包数据的加载
class DataManager {
  constructor() {
    this.cache = {
      icao: null,
      abbreviations: null,
      airports: null,
      definitions: null
    };
    this.loadingPromises = {};
  }

  // 加载ICAO通信数据
  async loadIcaoData() {
    if (this.cache.icao) {
      return this.cache.icao;
    }

    if (this.loadingPromises.icao) {
      return this.loadingPromises.icao;
    }

    this.loadingPromises.icao = new Promise((resolve) => {
      console.log('开始加载ICAO数据...');
      
      // 尝试从packageA分包加载
      require('../packageA/icao900.js', (icaoRawData) => {
        console.log('✅ 成功从packageA加载ICAO原始数据');
        
        // 处理数据格式转换
        let processedData = [];
        
        if (icaoRawData && icaoRawData.chapters) {
          // 新格式：包含chapters的对象
          icaoRawData.chapters.forEach(chapter => {
            if (chapter.sentences && Array.isArray(chapter.sentences)) {
              chapter.sentences.forEach(sentence => {
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
        
        console.log('✅ ICAO数据处理完成，共', processedData.length, '句');
        this.cache.icao = processedData;
        resolve(processedData);
      }, (error) => {
        console.warn('❌ 从packageA加载ICAO数据失败:', error);
        // 使用默认数据
        const defaultData = [
          {
            "chapter": "第1章 一般用语",
            "section": "1.1 基本用语",
            "english": "Roger",
            "chinese": "收到",
            "usage": "确认收到信息"
          }
        ];
        this.cache.icao = defaultData;
        resolve(defaultData);
      });
    });

    return this.loadingPromises.icao;
  }

  // 加载缩写数据
  async loadAbbreviationsData() {
    if (this.cache.abbreviations) {
      return this.cache.abbreviations;
    }

    if (this.loadingPromises.abbreviations) {
      return this.loadingPromises.abbreviations;
    }

    this.loadingPromises.abbreviations = new Promise((resolve) => {
      console.log('开始加载缩写数据...');
      
      // 尝试从packageB分包加载
      require('../packageB/abbreviations.js', (abbreviationsData) => {
        console.log('✅ 成功从packageB加载缩写数据，共', abbreviationsData.length, '条');
        this.cache.abbreviations = abbreviationsData;
        resolve(abbreviationsData);
      }, (error) => {
        console.warn('❌ 从packageB加载缩写数据失败:', error);
        // 尝试从主包加载
        try {
          const mainPackageData = require('../data/abbreviations.js');
          console.log('✅ 从主包加载缩写数据，共', mainPackageData.length, '条');
          this.cache.abbreviations = mainPackageData;
          resolve(mainPackageData);
        } catch (mainError) {
          console.error('❌ 从主包加载缩写数据也失败:', mainError);
          this.cache.abbreviations = [];
          resolve([]);
        }
      });
    });

    return this.loadingPromises.abbreviations;
  }

  // 加载机场数据
  async loadAirportData() {
    if (this.cache.airports) {
      return this.cache.airports;
    }

    if (this.loadingPromises.airports) {
      return this.loadingPromises.airports;
    }

    this.loadingPromises.airports = new Promise((resolve) => {
      console.log('开始加载机场数据...');
      
      // 尝试从packageC分包加载
      require('../packageC/airportdata.js', (airportData) => {
        console.log('✅ 成功从packageC加载机场数据，共', airportData.length, '条');
        this.cache.airports = airportData;
        resolve(airportData);
      }, (error) => {
        console.warn('❌ 从packageC加载机场数据失败:', error);
        // 尝试从主包加载
        try {
          const mainPackageData = require('../data/airportdata.js');
          console.log('✅ 从主包加载机场数据，共', mainPackageData.length, '条');
          this.cache.airports = mainPackageData;
          resolve(mainPackageData);
        } catch (mainError) {
          console.error('❌ 从主包加载机场数据也失败:', mainError);
          this.cache.airports = [];
          resolve([]);
        }
      });
    });

    return this.loadingPromises.airports;
  }

  // 加载定义数据
  async loadDefinitionsData() {
    if (this.cache.definitions) {
      return this.cache.definitions;
    }

    if (this.loadingPromises.definitions) {
      return this.loadingPromises.definitions;
    }

    this.loadingPromises.definitions = new Promise((resolve) => {
      console.log('开始加载定义数据...');
      
      // 尝试从packageD分包加载
      require('../packageD/definitions.js', (definitionsData) => {
        console.log('✅ 成功从packageD加载定义数据，共', definitionsData.length, '条');
        this.cache.definitions = definitionsData;
        resolve(definitionsData);
      }, (error) => {
        console.warn('❌ 从packageD加载定义数据失败:', error);
        // 尝试从主包加载
        try {
          const mainPackageData = require('../data/definitions.js');
          console.log('✅ 从主包加载定义数据，共', mainPackageData.length, '条');
          this.cache.definitions = mainPackageData;
          resolve(mainPackageData);
        } catch (mainError) {
          console.error('❌ 从主包加载定义数据也失败:', mainError);
          this.cache.definitions = [];
          resolve([]);
        }
      });
    });

    return this.loadingPromises.definitions;
  }

  // 清除缓存
  clearCache() {
    this.cache = {
      icao: null,
      abbreviations: null,
      airports: null,
      definitions: null
    };
    this.loadingPromises = {};
  }

  // 获取缓存状态
  getCacheStatus() {
    return {
      icao: !!this.cache.icao,
      abbreviations: !!this.cache.abbreviations,
      airports: !!this.cache.airports,
      definitions: !!this.cache.definitions
    };
  }
}

// 创建全局实例
const dataManager = new DataManager();

module.exports = dataManager; 