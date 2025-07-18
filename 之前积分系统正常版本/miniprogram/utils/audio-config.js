// 音频配置管理器 - 统一管理所有音频相关配置
let japanData, philippinesData, koreanData, singaporeData, thailandData, germanyData, usaData, australiaData, southAfricaData, russiaData, srilankaData, turkeyData, franceData, italyData;

try {
  japanData = require('../data/regions/japan.js');
  philippinesData = require('../data/regions/philippines.js');
  koreanData = require('../data/regions/korean.js');
  singaporeData = require('../data/regions/singapore.js');
  thailandData = require('../data/regions/thailand.js');
  germanyData = require('../data/regions/germany.js');
  usaData = require('../data/regions/america.js');
  australiaData = require('../data/regions/australia.js');
  southAfricaData = require('../data/regions/south-africa.js');
  russiaData = require('../data/regions/russia.js');
  srilankaData = require('../data/regions/srilanka.js');
  turkeyData = require('../data/regions/turkey.js');
  franceData = require('../data/regions/france.js');
  italyData = require('../data/regions/italy.js');
} catch (error) {
  console.error('❌ 加载音频数据文件失败:', error);
  // 使用空数据作为后备
  japanData = { clips: [] };
  philippinesData = { clips: [] };
  koreanData = { clips: [] };
  singaporeData = { clips: [] };
  thailandData = { clips: [] };
  germanyData = { clips: [] };
  usaData = { clips: [] };
  australiaData = { clips: [] };
  southAfricaData = { clips: [] };
  russiaData = { clips: [] };
  srilankaData = { clips: [] };
  turkeyData = { clips: [] };
  franceData = { clips: [] };
  italyData = { clips: [] };
}

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
        count: 24,
        hasRealRecordings: true,
        subPackageName: 'japanAudioPackage'
      },
      {
        id: 'philippines',
        continentId: 'asia',
        name: '菲律宾',
        flag: '🇵🇭', 
        description: '马尼拉机场真实陆空通话录音',
        count: 27,
        hasRealRecordings: true,
        subPackageName: 'philippineAudioPackage'
      },
      {
        id: 'korea',
        continentId: 'asia',
        name: '韩国',
        flag: '🇰🇷',
        description: '仁川机场真实陆空通话录音',
        count: 19,
        hasRealRecordings: true,
        subPackageName: 'koreaAudioPackage'
      },
      {
        id: 'singapore',
        continentId: 'asia',
        name: '新加坡',
        flag: '🇸🇬',
        description: '樟宜机场真实陆空通话录音',
        count: 8,
        hasRealRecordings: true,
        subPackageName: 'singaporeAudioPackage'
      },
      {
        id: 'thailand',
        continentId: 'asia',
        name: '泰国',
        flag: '🇹🇭',
        description: '曼谷机场真实陆空通话录音',
        count: 22,
        hasRealRecordings: true,
        subPackageName: 'thailandAudioPackage'
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
        id: 'france',
        continentId: 'europe',
        name: '法国',
        flag: '🇫🇷',
        description: '戴高乐机场真实陆空通话录音',
        count: 19,
        hasRealRecordings: true,
        subPackageName: 'franceAudioPackage'
      },
      {
        id: 'russia',
        continentId: 'europe',
        name: '俄罗斯',
        flag: '🇷🇺',
        description: '莫斯科机场真实陆空通话录音',
        count: 23,
        hasRealRecordings: true,
        subPackageName: 'russiaAudioPackage'
      },
      {
        id: 'turkey',
        continentId: 'europe',
        name: '土耳其',
        flag: '🇹🇷',
        description: '伊斯坦布尔机场真实陆空通话录音',
        count: 28,
        hasRealRecordings: true,
        subPackageName: 'turkeyAudioPackage'
      },
      {
        id: 'italy',
        continentId: 'europe',
        name: '意大利',
        flag: '🇮🇹',
        description: '罗马菲乌米奇诺机场真实陆空通话录音',
        count: 29,
        hasRealRecordings: true,
        subPackageName: 'italyAudioPackage'
      },
      {
        id: 'srilanka',
        continentId: 'asia',
        name: '斯里兰卡',
        flag: '🇱🇰',
        description: '科伦坡机场真实陆空通话录音',
        count: 22,
        hasRealRecordings: true,
        subPackageName: 'srilankaAudioPackage'
      },
      {
        id: 'usa',
        continentId: 'america',
        name: '美国',
        flag: '🇺🇸',
        description: '旧金山机场真实陆空通话录音',
        count: 52,
        hasRealRecordings: true,
        subPackageName: 'americaAudioPackage'
      },
      {
        id: 'australia',
        continentId: 'oceania',
        name: '澳大利亚',
        flag: '🇦🇺',
        description: '悉尼机场真实陆空通话录音',
        count: 20,
        hasRealRecordings: true,
        subPackageName: 'australiaAudioPackage'
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
        packageName: 'packageJapan',
        audioPath: '/packageJapan/',
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
        packageName: 'packagePhilippines',
        audioPath: '/packagePhilippines/',
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
        packageName: 'packageKorean',
        audioPath: '/packageKorean/',
        icon: '🏛️',
        description: '仁川国际机场陆空通话录音',
        clips: koreanData.clips || []
      },
      {
        id: 'singapore',
        regionId: 'singapore',
        name: '新加坡樟宜机场',
        city: '新加坡',
        icao: 'WSSS',
        packageName: 'packageSingapore',
        audioPath: '/packageSingapore/',
        icon: '🌟',
        description: '樟宜国际机场陆空通话录音',
        clips: singaporeData.clips || []
      },
      {
        id: 'thailand',
        regionId: 'thailand',
        name: '泰国曼谷机场',
        city: '曼谷',
        icao: 'VTBS',
        packageName: 'packageThailand',
        audioPath: '/packageThailand/',
        icon: '🛕',
        description: '素万那普国际机场陆空通话录音',
        clips: thailandData.clips || []
      },
      {
        id: 'germany',
        regionId: 'germany',
        name: '德国法兰克福机场',
        city: '法兰克福',
        icao: 'EDDF',
        packageName: 'packageGermany',
        audioPath: '/packageGermany/',
        icon: '🏰',
        description: '法兰克福国际机场陆空通话录音',
        clips: germanyData.clips || []
      },
      {
        id: 'france',
        regionId: 'france',
        name: '法国戴高乐机场',
        city: '巴黎',
        icao: 'LFPG',
        packageName: 'packageFrance',
        audioPath: '/packageFrance/',
        icon: '🗼',
        description: '戴高乐国际机场真实陆空通话录音',
        clips: franceData.clips || []
      },
      {
        id: 'italy',
        regionId: 'italy',
        name: '意大利罗马机场',
        city: '罗马',
        icao: 'LIRF',
        packageName: 'packageItaly',
        audioPath: '/packageItaly/',
        icon: '🏛️',
        description: '罗马菲乌米奇诺国际机场真实陆空通话录音',
        clips: italyData.clips || []
      },
      {
        id: 'usa',
        regionId: 'usa',
        name: '美国旧金山机场',
        city: '旧金山',
        icao: 'KSFO',
        packageName: 'packageAmerica',
        audioPath: '/packageAmerica/',
        icon: '🗽',
        description: '旧金山国际机场真实陆空通话录音',
        clips: usaData.clips || []
      },
      {
        id: 'australia',
        regionId: 'australia',
        name: '澳大利亚悉尼机场',
        city: '悉尼',
        icao: 'YSSY',
        packageName: 'packageAustralia',
        audioPath: '/packageAustralia/',
        icon: '🦘',
        description: '悉尼金斯福德·史密斯机场真实陆空通话录音',
        clips: australiaData.clips || []
      },
      {
        id: 'south-africa',
        regionId: 'south-africa',
        name: '南非开普敦机场',
        city: '开普敦',
        icao: 'FACT',
        packageName: 'packageSouthAfrica',
        audioPath: '/packageSouthAfrica/',
        icon: '🦁',
        description: '开普敦国际机场陆空通话录音',
        clips: southAfricaData.clips || []
      },
      {
        id: 'russia',
        regionId: 'russia',
        name: '俄罗斯莫斯科机场',
        city: '莫斯科',
        icao: 'UUDD',
        packageName: 'packageRussia',
        audioPath: '/packageRussia/',
        icon: '🏛️',
        description: '谢列梅捷沃国际机场陆空通话录音',
        clips: russiaData.clips || []
      },
      {
        id: 'turkey',
        regionId: 'turkey',
        name: '土耳其伊斯坦布尔机场',
        city: '伊斯坦布尔',
        icao: 'LTFM',
        packageName: 'packageTurkey',
        audioPath: '/packageTurkey/',
        icon: '🏛️',
        description: '伊斯坦布尔国际机场陆空通话录音',
        clips: turkeyData.clips || []
      },
      {
        id: 'srilanka',
        regionId: 'srilanka',
        name: '斯里兰卡科伦坡机场',
        city: '科伦坡',
        icao: 'VCBI',
        packageName: 'packageSrilanka',
        audioPath: '/packageSrilanka/',
        icon: '🏝️',
        description: '班达拉奈克国际机场陆空通话录音',
        clips: srilankaData.clips || []
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
      totalClips: this.airports.reduce((total, airport) => total + ((airport.clips && airport.clips.length) || 0), 0)
    };
  }
}

// 导出配置管理器实例
let audioConfigManager;
let airlineRecordingsData;

try {
  audioConfigManager = new AudioConfigManager();
  airlineRecordingsData = audioConfigManager.getFullConfig();
} catch (error) {
  console.error('❌ 创建音频配置管理器失败:', error);
  // 创建后备配置管理器
  audioConfigManager = {
    getRegions: () => [],
    getAirports: () => [],
    getAirportsByRegion: () => [],
    getAirportById: () => null,
    getAudioPath: () => null,
    getFullConfig: () => ({ regions: [], airports: [], totalClips: 0 })
  };
  airlineRecordingsData = { regions: [], airports: [], totalClips: 0 };
}

module.exports = {
  airlineRecordingsData,
  audioConfigManager
};