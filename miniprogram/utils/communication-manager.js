// 通信数据管理器 - 统一管理所有通信相关数据（主包版本）
let communicationRulesData, communicationFailureData, chinaCommFailureData;

// 预加载地区数据
let pacificData, africaData, europeData, easternEuropeData, middleEastData, northAmericaData, southAmericaData;

try {
  // 加载通信规则数据
  communicationRulesData = require('../data/CommunicationRules.js');
  
  // 加载通信失效程序数据
  communicationFailureData = require('../pages/communication-failure/data/communication_failure_procedure.js');
  chinaCommFailureData = require('../pages/communication-failure/data/china_comm_failure_procedure.js');
  
  // 预加载所有地区数据
  pacificData = require('../pages/communication-failure/data/pacific.js');
  africaData = require('../pages/communication-failure/data/africa.js');
  europeData = require('../pages/communication-failure/data/europe.js');
  easternEuropeData = require('../pages/communication-failure/data/eastern_europe.js');
  middleEastData = require('../pages/communication-failure/data/middle_east.js');
  // 中东地区模块预加载检查
  northAmericaData = require('../pages/communication-failure/data/north_america.js');
  southAmericaData = require('../pages/communication-failure/data/south_america.js');
  
  // 所有通信数据文件预加载成功
} catch (error) {
  console.error('❌ 加载通信数据文件失败:', error);
  // 使用空数据作为后备
  communicationRulesData = {};
  communicationFailureData = {};
  chinaCommFailureData = {};
  pacificData = {};
  africaData = {};
  europeData = {};
  easternEuropeData = {};
  middleEastData = {};
  northAmericaData = {};
  southAmericaData = {};
}

// 通信数据管理器
class CommunicationDataManager {
  constructor() {
    this.communicationRules = communicationRulesData;
    this.communicationFailure = communicationFailureData;
    this.chinaCommFailure = chinaCommFailureData;
    
    // 已加载的地区数据缓存
    this.loadedRegionData = new Map();
    
    // 地区差异数据
    this.regionDifferences = {
      'AFRICA': {
        name: '非洲',
        icon: '🌍',
        data: {}
      },
      'EASTERN_EUROPE': {
        name: '东欧',
        icon: '🌐',
        data: {}
      },
      'EUROPE': {
        name: '欧洲',
        icon: '🇪🇺',
        data: {}
      },
      'MIDDLE_EAST': {
        name: '中东',
        icon: '🕌',
        data: {}
      },
      'NORTH_AMERICA': {
        name: '北美',
        icon: '🇺🇸',
        data: {}
      },
      'PACIFIC': {
        name: '太平洋',
        icon: '🌊',
        data: {}
      },
      'SOUTH_AMERICA': {
        name: '南美',
        icon: '🌎',
        data: {}
      }
    };
  }

  // 获取通信规则数据
  getCommunicationRules() {
    return this.communicationRules || {};
  }

  // 获取通信失效程序数据
  getCommunicationFailure() {
    return this.communicationFailure || {};
  }

  // 获取中国通信失效程序数据
  getChinaCommFailure() {
    return this.chinaCommFailure || {};
  }

  // 获取国际通信失效程序数据（与基础程序相同）
  getInternationalCommFailure() {
    return this.communicationFailure || {};
  }

  // 获取所有地区差异数据
  getAllRegionDifferences() {
    return this.regionDifferences;
  }

  // 兼容旧方法名
  getRegionDifferences() {
    return this.regionDifferences;
  }

  // 获取特定地区数据
  getRegionData(regionKey) {
    return this.regionDifferences[regionKey] || null;
  }

  // 获取特定国家数据
  getCountryData(regionKey, countryKey) {
    const regionData = this.getRegionData(regionKey);
    if (regionData && regionData.data && regionData.data[countryKey]) {
      return regionData.data[countryKey];
    }
    return null;
  }

  // 加载地区数据（主包方式）
  loadRegionData(regionKey, force = false) {
    // 检查是否已经加载过
    if (!force && this.loadedRegionData.has(regionKey)) {
      return Promise.resolve(this.loadedRegionData.get(regionKey));
    }

    // 开始加载地区数据

    // 预加载的数据映射
    const regionDataMapping = {
      'AFRICA': africaData,
      'EASTERN_EUROPE': easternEuropeData,
      'EUROPE': europeData,
      'MIDDLE_EAST': middleEastData,
      'NORTH_AMERICA': northAmericaData,
      'PACIFIC': pacificData,
      'SOUTH_AMERICA': southAmericaData
    };

    const dataModule = regionDataMapping[regionKey];
    if (!dataModule) {
      console.error(`不支持的地区: ${regionKey}`);
      const fallbackData = this.getFallbackData(regionKey);
      this.loadedRegionData.set(regionKey, fallbackData);
      return Promise.resolve(fallbackData);
    }

    try {
      const dataKey = `ICAO_DIFFERENCES_COMM_FAILURE_${regionKey}`;
      
      // 尝试获取数据
      let regionData = {};
      if (dataModule[dataKey]) {
        regionData = dataModule[dataKey];
      } else {
        // 如果只有一个导出键，可能是直接导出了数据对象
        const keys = Object.keys(dataModule);
        if (keys.length === 1) {
          regionData = dataModule[keys[0]];
        }
      }
      
      if (Object.keys(regionData).length > 0) {
        // 更新地区差异数据
        if (this.regionDifferences[regionKey]) {
          this.regionDifferences[regionKey].data = regionData;
        }
        
        // 缓存数据
        this.loadedRegionData.set(regionKey, regionData);
        return Promise.resolve(regionData);
      } else {
        throw new Error('数据为空或数据键不匹配');
      }
    } catch (error) {
      console.error(`❌ 加载${regionKey}数据失败:`, error);
      // 使用兜底数据
      const fallbackData = this.getFallbackData(regionKey);
      if (this.regionDifferences[regionKey]) {
        this.regionDifferences[regionKey].data = fallbackData;
      }
      this.loadedRegionData.set(regionKey, fallbackData);
      return Promise.resolve(fallbackData);
    }
  }

  // 获取兜底数据
  getFallbackData(regionKey) {
    const fallbackData = {
      'AFRICA': {
        'SOUTH_AFRICA': {
          name: '南非',
          differences: ['频率范围差异', '程序差异']
        },
        'KENYA': {
          name: '肯尼亚',
          differences: ['备用频率差异']
        }
      },
      'EASTERN_EUROPE': {
        'POLAND': {
          name: '波兰',
          differences: ['通信协议差异']
        },
        'CZECH_REPUBLIC': {
          name: '捷克',
          differences: ['频率分配差异']
        }
      },
      'EUROPE': {
        'GERMANY': {
          name: '德国',
          differences: ['紧急频率差异']
        },
        'FRANCE': {
          name: '法国',
          differences: ['管制程序差异']
        }
      },
      'MIDDLE_EAST': {
        'UAE': {
          name: '阿联酋',
          differences: ['时区协调差异']
        },
        'SAUDI_ARABIA': {
          name: '沙特阿拉伯',
          differences: ['通信程序差异']
        }
      },
      'NORTH_AMERICA': {
        'USA': {
          name: '美国',
          differences: ['FAA程序差异']
        },
        'CANADA': {
          name: '加拿大',
          differences: ['NAV CANADA程序差异']
        }
      },
      'PACIFIC': {
        'JAPAN': {
          name: '日本',
          differences: ['JCAB程序差异', '语言要求差异']
        },
        'KOREA_REPUBLIC_OF': {
          name: '韩国',
          differences: ['频率管理差异', '管制移交程序差异']
        }
      },
      'SOUTH_AMERICA': {
        'BRAZIL': {
          name: '巴西',
          differences: ['ANAC程序差异']
        },
        'ARGENTINA': {
          name: '阿根廷',
          differences: ['通信协议差异']
        }
      }
    };

    const data = fallbackData[regionKey] || {};
    return data;
  }

  // 清理缓存
  clearCache() {
    this.loadedRegionData.clear();
    // 通信数据缓存已清理
  }

  // 获取缓存状态
  getCacheStatus() {
    return {
      loadedRegions: Array.from(this.loadedRegionData.keys()),
      cacheSize: this.loadedRegionData.size
    };
  }
}

// 创建全局实例
const communicationDataManager = new CommunicationDataManager();

// 导出
module.exports = {
  communicationDataManager,
  CommunicationDataManager
};