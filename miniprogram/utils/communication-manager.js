// 通信数据管理器 - 统一管理所有通信相关数据（分包版本）
// 重构说明：CommunicationRules 已移至 packageNav/data/，由分包消费方注入

// 通信数据管理器
class CommunicationDataManager {
  constructor() {
    this.communicationRules = null;

    // 分包数据缓存
    this.communicationFailure = null;
    this.chinaCommFailure = null;

    // 已加载的地区数据缓存
    this.loadedRegionData = new Map();

    // 数据加载状态
    this.isLoadingCommFailure = false;
    this.isLoadingChinaCommFailure = false;
    this.regionLoadingStatus = new Map();

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

  // 注入通信规则数据（由分包消费方调用）
  setCommunicationRulesData(data) {
    this.communicationRules = data;
  }

  // 获取通信规则数据（同步）
  getCommunicationRules() {
    return this.communicationRules || {};
  }

  // 异步加载通信失效程序数据
  loadCommunicationFailure() {
    const self = this;

    // 如果已经加载过，直接返回缓存
    if (this.communicationFailure) {
      return Promise.resolve(this.communicationFailure);
    }

    // 如果正在加载，等待加载完成
    if (this.isLoadingCommFailure) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!self.isLoadingCommFailure && self.communicationFailure) {
            clearInterval(checkInterval);
            resolve(self.communicationFailure);
          }
        }, 100);
      });
    }

    // 开始异步加载
    this.isLoadingCommFailure = true;

    return new Promise((resolve, reject) => {
      require('../packageCommFailure/data/communication_failure_procedure.js',
        function(data) {
          self.communicationFailure = data;
          self.isLoadingCommFailure = false;
          console.log('✅ 通信失效程序数据加载成功');
          resolve(data);
        },
        function(error) {
          self.isLoadingCommFailure = false;
          console.error('❌ 加载通信失效程序数据失败:', error);
          self.communicationFailure = {};
          resolve({});
        }
      );
    });
  }

  // 异步加载中国通信失效程序数据
  loadChinaCommFailure() {
    const self = this;

    // 如果已经加载过，直接返回缓存
    if (this.chinaCommFailure) {
      return Promise.resolve(this.chinaCommFailure);
    }

    // 如果正在加载，等待加载完成
    if (this.isLoadingChinaCommFailure) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!self.isLoadingChinaCommFailure && self.chinaCommFailure) {
            clearInterval(checkInterval);
            resolve(self.chinaCommFailure);
          }
        }, 100);
      });
    }

    // 开始异步加载
    this.isLoadingChinaCommFailure = true;

    return new Promise((resolve, reject) => {
      require('../packageCommFailure/data/china_comm_failure_procedure.js',
        function(data) {
          self.chinaCommFailure = data;
          self.isLoadingChinaCommFailure = false;
          console.log('✅ 中国通信失效程序数据加载成功');
          resolve(data);
        },
        function(error) {
          self.isLoadingChinaCommFailure = false;
          console.error('❌ 加载中国通信失效程序数据失败:', error);
          self.chinaCommFailure = {};
          resolve({});
        }
      );
    });
  }

  // 获取通信失效程序数据（兼容旧API，返回Promise）
  getCommunicationFailure() {
    return this.loadCommunicationFailure();
  }

  // 获取中国通信失效程序数据（兼容旧API，返回Promise）
  getChinaCommFailure() {
    return this.loadChinaCommFailure();
  }

  // 获取国际通信失效程序数据（与基础程序相同）
  getInternationalCommFailure() {
    return this.loadCommunicationFailure();
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

  // 异步加载地区数据（分包方式）
  loadRegionData(regionKey, force = false) {
    const self = this;

    // 检查是否已经加载过
    if (!force && this.loadedRegionData.has(regionKey)) {
      return Promise.resolve(this.loadedRegionData.get(regionKey));
    }

    // 如果正在加载，等待加载完成
    if (this.regionLoadingStatus.get(regionKey)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!self.regionLoadingStatus.get(regionKey) && self.loadedRegionData.has(regionKey)) {
            clearInterval(checkInterval);
            resolve(self.loadedRegionData.get(regionKey));
          }
        }, 100);
      });
    }

    // 地区数据文件映射
    const regionFileMapping = {
      'AFRICA': 'africa.js',
      'EASTERN_EUROPE': 'eastern_europe.js',
      'EUROPE': 'europe.js',
      'MIDDLE_EAST': 'middle_east.js',
      'NORTH_AMERICA': 'north_america.js',
      'PACIFIC': 'pacific.js',
      'SOUTH_AMERICA': 'south_america.js'
    };

    const fileName = regionFileMapping[regionKey];
    if (!fileName) {
      console.error(`不支持的地区: ${regionKey}`);
      const fallbackData = this.getFallbackData(regionKey);
      this.loadedRegionData.set(regionKey, fallbackData);
      return Promise.resolve(fallbackData);
    }

    // 标记正在加载
    this.regionLoadingStatus.set(regionKey, true);

    return new Promise((resolve) => {
      const filePath = `../packageCommFailure/data/${fileName}`;

      require(filePath,
        function(dataModule) {
          self.regionLoadingStatus.set(regionKey, false);

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
              if (self.regionDifferences[regionKey]) {
                self.regionDifferences[regionKey].data = regionData;
              }

              // 缓存数据
              self.loadedRegionData.set(regionKey, regionData);
              console.log(`✅ ${regionKey}地区数据加载成功`);
              resolve(regionData);
            } else {
              throw new Error('数据为空或数据键不匹配');
            }
          } catch (error) {
            console.error(`❌ 解析${regionKey}数据失败:`, error);
            const fallbackData = self.getFallbackData(regionKey);
            if (self.regionDifferences[regionKey]) {
              self.regionDifferences[regionKey].data = fallbackData;
            }
            self.loadedRegionData.set(regionKey, fallbackData);
            resolve(fallbackData);
          }
        },
        function(error) {
          self.regionLoadingStatus.set(regionKey, false);
          console.error(`❌ 加载${regionKey}数据文件失败:`, error);

          // 使用兜底数据
          const fallbackData = self.getFallbackData(regionKey);
          if (self.regionDifferences[regionKey]) {
            self.regionDifferences[regionKey].data = fallbackData;
          }
          self.loadedRegionData.set(regionKey, fallbackData);
          resolve(fallbackData);
        }
      );
    });
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
    this.communicationFailure = null;
    this.chinaCommFailure = null;
    this.loadedRegionData.clear();
    console.log('✅ 通信数据缓存已清理');
  }

  // 获取缓存状态
  getCacheStatus() {
    return {
      communicationFailureLoaded: !!this.communicationFailure,
      chinaCommFailureLoaded: !!this.chinaCommFailure,
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
