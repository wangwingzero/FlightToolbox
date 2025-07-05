// 音频配置管理器 - 统一管理所有音频相关配置
const japanData = require('../data/regions/japan.js');
const philippinesData = require('../data/regions/philippines.js');
const koreanData = require('../data/regions/korean.js');
const germanyData = require('../data/regions/germany.js');
const usaData = require('../data/regions/usa.js');
const australiaData = require('../data/regions/australia.js');
const southAfricaData = require('../data/regions/south-africa.js');

// 音频配置管理器
class AudioConfigManager {
  constructor() {
    // 大洲板块定义
    this.continents = [
      {
        id: 'asia',
        name: '亚洲',
        icon: '🌏',
        color: '#3B82F6',
        description: '亚洲地区机场陆空通话录音'
      },
      {
        id: 'europe',
        name: '欧洲', 
        icon: '🌍',
        color: '#10B981',
        description: '欧洲地区机场陆空通话录音'
      },
      {
        id: 'america',
        name: '美洲',
        icon: '🌎', 
        color: '#F59E0B',
        description: '美洲地区机场陆空通话录音'
      },
      {
        id: 'oceania',
        name: '大洋洲',
        icon: '🏝️',
        color: '#8B5CF6', 
        description: '大洋洲地区机场陆空通话录音'
      },
      {
        id: 'africa',
        name: '非洲',
        icon: '🌍',
        color: '#F97316',
        description: '非洲地区机场陆空通话录音'
      }
    ];

    // 国家/地区定义
    this.regions = [
      {
        id: 'japan',
        continentId: 'asia',
        name: '日本',
        flag: '🇯🇵',
        description: '成田机场真实陆空通话录音',
        count: 10,
        hasRealRecordings: true
      },
      {
        id: 'philippines',
        continentId: 'asia',
        name: '菲律宾',
        flag: '🇵🇭', 
        description: '马尼拉机场真实陆空通话录音',
        count: 17,
        hasRealRecordings: true
      },
      {
        id: 'korea',
        continentId: 'asia',
        name: '韩国',
        flag: '🇰🇷',
        description: '仁川机场真实陆空通话录音',
        count: 20,
        hasRealRecordings: true
      },
      {
        id: 'germany',
        continentId: 'europe',
        name: '德国',
        flag: '🇩🇪',
        description: '法兰克福机场陆空通话录音',
        count: 3,
        hasRealRecordings: false
      },
      {
        id: 'usa',
        continentId: 'america',
        name: '美国',
        flag: '🇺🇸',
        description: '纽约肯尼迪机场陆空通话录音',
        count: 4,
        hasRealRecordings: false
      },
      {
        id: 'australia',
        continentId: 'oceania',
        name: '澳大利亚',
        flag: '🇦🇺',
        description: '悉尼机场陆空通话录音',
        count: 2,
        hasRealRecordings: false
      },
      {
        id: 'south-africa',
        continentId: 'africa',
        name: '南非',
        flag: '🇿🇦',
        description: '开普敦机场陆空通话录音',
        count: 2,
        hasRealRecordings: false
      }
    ];

    this.airports = [
      {
        id: 'japan',
        regionId: 'japan',
        name: '日本成田机场',
        city: '东京',
        icao: 'RJAA',
        packageName: 'packageJ',
        audioPath: '/packageJ/',
        icon: '🏯',
        description: '成田国际机场陆空通话录音',
        clips: japanData.clips || []
      },
      {
        id: 'philippines', 
        regionId: 'philippines',
        name: '菲律宾马尼拉机场',
        city: '马尼拉',
        icao: 'RPLL',
        packageName: 'packageK',
        audioPath: '/packageK/',
        icon: '🏖️',
        description: '尼诺·阿基诺国际机场陆空通话录音',
        clips: philippinesData.clips || []
      },
      {
        id: 'korea',
        regionId: 'korea',
        name: '韩国仁川机场',
        city: '首尔',
        icao: 'RKSI',
        packageName: 'packageL',
        audioPath: '/packageL/',
        icon: '🏛️',
        description: '仁川国际机场陆空通话录音',
        clips: koreanData.clips || []
      },
      {
        id: 'germany',
        regionId: 'germany',
        name: '德国法兰克福机场',
        city: '法兰克福',
        icao: 'EDDF',
        packageName: 'packageP',
        audioPath: '/packageP/',
        icon: '🏰',
        description: '法兰克福国际机场陆空通话录音',
        clips: germanyData.clips || []
      },
      {
        id: 'usa',
        regionId: 'usa',
        name: '美国肯尼迪机场',
        city: '纽约',
        icao: 'KJFK',
        packageName: 'packageM',
        audioPath: '/packageM/',
        icon: '🗽',
        description: '约翰·肯尼迪国际机场陆空通话录音',
        clips: usaData.clips || []
      },
      {
        id: 'australia',
        regionId: 'australia',
        name: '澳大利亚悉尼机场',
        city: '悉尼',
        icao: 'YSSY',
        packageName: 'packageN',
        audioPath: '/packageN/',
        icon: '🦘',
        description: '悉尼金斯福德·史密斯机场陆空通话录音',
        clips: australiaData.clips || []
      },
      {
        id: 'south-africa',
        regionId: 'south-africa',
        name: '南非开普敦机场',
        city: '开普敦',
        icao: 'FACT',
        packageName: 'packageO',
        audioPath: '/packageO/',
        icon: '🦁',
        description: '开普敦国际机场陆空通话录音',
        clips: southAfricaData.clips || []
      }
    ];
  }

  // 获取所有大洲
  getContinents() {
    return this.continents;
  }

  // 获取所有地区
  getRegions() {
    return this.regions;
  }

  // 根据大洲获取地区
  getRegionsByContinent(continentId) {
    return this.regions.filter(region => region.continentId === continentId);
  }

  // 获取分组后的地区数据（按大洲分组）
  getGroupedRegions() {
    const grouped = this.continents.map(continent => {
      const regions = this.getRegionsByContinent(continent.id);
      const totalCount = regions.reduce((sum, region) => sum + (region.count || 0), 0);
      
      return {
        ...continent,
        regions: regions,
        totalCount: totalCount,
        regionCount: regions.length
      };
    }).filter(group => group.regions.length > 0); // 只返回有数据的大洲
    
    return grouped;
  }

  // 获取所有机场
  getAirports() {
    return this.airports;
  }

  // 根据地区ID获取机场
  getAirportsByRegion(regionId) {
    return this.airports.filter(airport => airport.regionId === regionId);
  }

  // 根据机场ID获取机场
  getAirportById(airportId) {
    return this.airports.find(airport => airport.id === airportId);
  }

  // 获取音频路径
  getAudioPath(airportId, filename) {
    const airport = this.getAirportById(airportId);
    if (airport && filename) {
      return `${airport.audioPath}${filename}`;
    }
    return null;
  }

  // 获取完整配置
  getFullConfig() {
    return {
      regions: this.regions,
      airports: this.airports,
      totalClips: this.airports.reduce((total, airport) => total + (airport.clips?.length || 0), 0)
    };
  }
}

// 导出配置管理器实例
const audioConfigManager = new AudioConfigManager();

module.exports = {
  airlineRecordingsData: audioConfigManager.getFullConfig(),
  audioConfigManager
};