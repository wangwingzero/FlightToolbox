// 音频配置管理器 - 统一管理所有音频相关配置
let japanData, philippinesData, koreanData, singaporeData, thailandData, usaData, australiaData, southAfricaData, russiaData, srilankaData, turkeyData, franceData, italyData, uaeData, ukData, chineseTaipeiData, macauData, hongkongData, canadaData, egyptData, newzealandData, malaysiaData, indonesiaData, vietnamData, indiaData, cambodiaData, myanmarData, uzbekistanData, maldiveData, spainData, germanyData, hollandData;

try {
  japanData = require('../data/regions/japan.js');
  philippinesData = require('../data/regions/philippines.js');
  koreanData = require('../data/regions/korean.js');
  singaporeData = require('../data/regions/singapore.js');
  thailandData = require('../data/regions/thailand.js');
  germanyData = require('../data/regions/germany.js');
  hollandData = require('../data/regions/Holland.js');
  usaData = require('../data/regions/america.js');
  australiaData = require('../data/regions/australia.js');
  southAfricaData = require('../data/regions/south-africa.js');
  russiaData = require('../data/regions/russia.js');
  srilankaData = require('../data/regions/srilanka.js');
  turkeyData = require('../data/regions/turkey.js');
  franceData = require('../data/regions/france.js');
  italyData = require('../data/regions/italy.js');
  uaeData = require('../data/regions/uae.js');
  ukData = require('../data/regions/uk.js');
  chineseTaipeiData = require('../data/regions/chinese-taipei.js');
  macauData = require('../data/regions/macau.js');
  hongkongData = require('../data/regions/hongkong.js');
  canadaData = require('../data/regions/canada.js');
  egyptData = require('../data/regions/egypt.js');
  newzealandData = require('../data/regions/newzealand.js');
  malaysiaData = require('../data/regions/malaysia.js');
  indonesiaData = require('../data/regions/indonesia.js');
  vietnamData = require('../data/regions/vietnam.js');
  indiaData = require('../data/regions/india.js');
  cambodiaData = require('../data/regions/cambodia.js');
  myanmarData = require('../data/regions/myanmar.js');
  uzbekistanData = require('../data/regions/uzbekistan.js');
  maldiveData = require('../data/regions/maldive.js');
  spainData = require('../data/regions/spain.js');
} catch (error) {
  console.error('❌ 加载音频数据文件失败:', error);
  // 使用空数据作为后备
  japanData = { clips: [] };
  philippinesData = { clips: [] };
  koreanData = { clips: [] };
  singaporeData = { clips: [] };
  thailandData = { clips: [] };
  germanyData = { clips: [] };
  hollandData = { clips: [] };
  usaData = { clips: [] };
  australiaData = { clips: [] };
  southAfricaData = { clips: [] };
  russiaData = { clips: [] };
  srilankaData = { clips: [] };
  turkeyData = { clips: [] };
  franceData = { clips: [] };
  italyData = { clips: [] };
  uaeData = { clips: [] };
  ukData = { clips: [] };
  chineseTaipeiData = { clips: [] };
  macauData = { clips: [] };
  hongkongData = { clips: [] };
  canadaData = { clips: [] };
  egyptData = { clips: [] };
  newzealandData = { clips: [] };
  malaysiaData = { clips: [] };
  indonesiaData = { clips: [] };
  vietnamData = { clips: [] };
  indiaData = { clips: [] };
  cambodiaData = { clips: [] };
  myanmarData = { clips: [] };
  uzbekistanData = { clips: [] };
  maldiveData = { clips: [] };
  spainData = { clips: [] };
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
        id: 'korea',
        continentId: 'asia',
        name: '韩国',
        flag: '🇰🇷',
        airport: '仁川机场',
        description: '仁川机场真实陆空通话录音',
        count: 85,
        hasRealRecordings: true,
        subPackageName: 'koreaAudioPackage'
      },
      {
        id: 'thailand',
        continentId: 'asia',
        name: '泰国',
        flag: '🇹🇭',
        airport: '曼谷机场',
        description: '曼谷机场真实陆空通话录音',
        count: 22,
        hasRealRecordings: true,
        subPackageName: 'thailandAudioPackage'
      },
      {
        id: 'japan',
        continentId: 'asia',
        name: '日本',
        flag: '🇯🇵',
        airport: '成田机场',
        description: '成田机场真实陆空通话录音',
        count: 24,
        hasRealRecordings: true,
        subPackageName: 'japanAudioPackage'
      },
      {
        id: 'singapore',
        continentId: 'asia',
        name: '新加坡',
        flag: '🇸🇬',
        airport: '樟宜机场',
        description: '樟宜机场真实陆空通话录音',
        count: 42,
        hasRealRecordings: true,
        subPackageName: 'singaporeAudioPackage'
      },
      {
        id: 'malaysia',
        continentId: 'asia',
        name: '马来西亚',
        flag: '🇲🇾',
        airport: '吉隆坡国际机场',
        description: '吉隆坡国际机场真实陆空通话录音',
        count: 83,
        hasRealRecordings: true,
        subPackageName: 'malaysiaAudioPackage'
      },
      {
        id: 'indonesia',
        continentId: 'asia',
        name: '印度尼西亚',
        flag: '🇮🇩',
        airport: '雅加达国际机场',
        description: '雅加达国际机场真实陆空通话录音',
        count: 53,
        hasRealRecordings: true,
        subPackageName: 'indonesiaAudioPackage'
      },
      {
        id: 'vietnam',
        continentId: 'asia',
        name: '越南',
        flag: '🇻🇳',
        airport: '胡志明/河内机场',
        description: '胡志明/河内机场真实陆空通话录音',
        count: 115,
        hasRealRecordings: true,
        subPackageName: 'vietnamAudioPackage'
      },
      {
        id: 'india',
        continentId: 'asia',
        name: '印度',
        flag: '🇮🇳',
        airport: '德里机场',
        description: '德里机场真实陆空通话录音',
        count: 29,
        hasRealRecordings: true,
        subPackageName: 'indiaAudioPackage'
      },
      {
        id: 'cambodia',
        continentId: 'asia',
        name: '柬埔寨',
        flag: '🇰🇭',
        airport: '金边机场',
        description: '金边机场真实陆空通话录音',
        count: 45,
        hasRealRecordings: true,
        subPackageName: 'cambodiaAudioPackage'
      },
      {
        id: 'myanmar',
        continentId: 'asia',
        name: '缅甸',
        flag: '🇲🇲',
        airport: '仰光机场',
        description: '仰光机场真实陆空通话录音',
        count: 38,
        hasRealRecordings: true,
        subPackageName: 'myanmarAudioPackage'
      },
      {
        id: 'uzbekistan',
        continentId: 'asia',
        name: '乌兹别克斯坦',
        flag: '🇺🇿',
        airport: '塔什干机场',
        description: '塔什干机场真实陆空通话录音',
        count: 30,
        hasRealRecordings: true,
        subPackageName: 'uzbekistanAudioPackage'
      },
      {
        id: 'maldive',
        continentId: 'asia',
        name: '马尔代夫',
        flag: '🇲🇻',
        airport: '马累机场',
        description: '马累机场真实陆空通话录音',
        count: 43,
        hasRealRecordings: true,
        subPackageName: 'maldiveAudioPackage'
      },
      {
        id: 'chinese-taipei',
        continentId: 'asia',
        name: '中国台北',
        flag: '🇨🇳',
        airport: '松山机场',
        description: '松山机场真实陆空通话录音',
        count: 17,
        hasRealRecordings: true,
        subPackageName: 'chineseTaipeiAudioPackage'
      },
      {
        id: 'macau',
        continentId: 'asia',
        name: '中国澳门',
        flag: '🇲🇴',
        airport: '澳门国际机场',
        description: '澳门国际机场真实陆空通话录音',
        count: 29,
        hasRealRecordings: true,
        subPackageName: 'chineseMacauAudioPackage'
      },
      {
        id: 'hongkong',
        continentId: 'asia',
        name: '中国香港',
        flag: '🇭🇰',
        airport: '香港国际机场',
        description: '香港国际机场真实陆空通话录音',
        count: 83,
        hasRealRecordings: true,
        subPackageName: 'chineseHongKongAudioPackage'
      },
      {
        id: 'philippines',
        continentId: 'asia',
        name: '菲律宾',
        flag: '🇵🇭',
        airport: '马尼拉机场',
        description: '马尼拉机场真实陆空通话录音',
        count: 27,
        hasRealRecordings: true,
        subPackageName: 'philippineAudioPackage'
      },
      {
        id: 'germany',
        continentId: 'europe',
        name: '德国',
        flag: '🇩🇪',
        airport: '法兰克福机场',
        description: '法兰克福机场真实陆空通话录音',
        count: 23,
        hasRealRecordings: true,
        subPackageName: 'germanyAudioPackage'
      },
      {
        id: 'france',
        continentId: 'europe',
        name: '法国',
        flag: '🇫🇷',
        airport: '戴高乐机场',
        description: '戴高乐机场真实陆空通话录音',
        count: 30,
        hasRealRecordings: true,
        subPackageName: 'franceAudioPackage'
      },
      {
        id: 'russia',
        continentId: 'europe',
        name: '俄罗斯',
        flag: '🇷🇺',
        airport: '莫斯科机场',
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
        airport: '伊斯坦布尔机场',
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
        airport: '罗马菲乌米奇诺机场',
        description: '罗马菲乌米奇诺机场真实陆空通话录音',
        count: 29,
        hasRealRecordings: true,
        subPackageName: 'italyAudioPackage'
      },
      {
        id: 'uk',
        continentId: 'europe',
        name: '英国',
        flag: '🇬🇧',
        airport: '伦敦希斯罗机场',
        description: '伦敦希斯罗机场真实陆空通话录音',
        count: 36,
        hasRealRecordings: true,
        subPackageName: 'ukAudioPackage'
      },
      {
        id: 'spain',
        continentId: 'europe',
        name: '西班牙',
        flag: '🇪🇸',
        airport: '马德里机场',
        description: '马德里机场真实陆空通话录音',
        count: 33,
        hasRealRecordings: true,
        subPackageName: 'spainAudioPackage'
      },
      {
        id: 'holland',
        continentId: 'europe',
        name: '荷兰',
        flag: '🇳🇱',
        airport: '阿姆斯特丹史基浦机场',
        description: '阿姆斯特丹史基浦机场真实陆空通话录音',
        count: 65,
        hasRealRecordings: true,
        subPackageName: 'hollandAudioPackage'
      },
      {
        id: 'srilanka',
        continentId: 'asia',
        name: '斯里兰卡',
        flag: '🇱🇰',
        airport: '科伦坡机场',
        description: '科伦坡机场真实陆空通话录音',
        count: 22,
        hasRealRecordings: true,
        subPackageName: 'srilankaAudioPackage'
      },
      {
        id: 'uae',
        continentId: 'asia',
        name: '阿联酋',
        flag: '🇦🇪',
        airport: '迪拜机场',
        description: '迪拜机场真实陆空通话录音',
        count: 38,
        hasRealRecordings: true,
        subPackageName: 'uaeAudioPackage'
      },
      {
        id: 'usa',
        continentId: 'america',
        name: '美国',
        flag: '🇺🇸',
        airport: '旧金山机场',
        description: '旧金山机场真实陆空通话录音',
        count: 52,
        hasRealRecordings: true,
        subPackageName: 'americaAudioPackage'
      },
      {
        id: 'canada',
        continentId: 'america',
        name: '加拿大',
        flag: '🇨🇦',
        airport: '温哥华国际机场',
        description: '温哥华国际机场真实陆空通话录音',
        count: 58,
        hasRealRecordings: true,
        subPackageName: 'canadaAudioPackage'
      },
      {
        id: 'australia',
        continentId: 'oceania',
        name: '澳大利亚',
        flag: '🇦🇺',
        airport: '悉尼机场',
        description: '悉尼机场真实陆空通话录音',
        count: 20,
        hasRealRecordings: true,
        subPackageName: 'australiaAudioPackage'
      },
      {
        id: 'new-zealand',
        continentId: 'oceania',
        name: '新西兰',
        flag: '🇳🇿',
        airport: '奥克兰机场',
        description: '奥克兰机场真实陆空通话录音',
        count: 41,
        hasRealRecordings: true,
        subPackageName: 'newZealandAudioPackage'
      },
      {
        id: 'egypt',
        continentId: 'africa',
        name: '埃及',
        flag: '🇪🇬',
        airport: '开罗国际机场',
        description: '开罗国际机场真实陆空通话录音',
        count: 34,
        hasRealRecordings: true,
        subPackageName: 'egyptAudioPackage'
      },
      {
        id: 'south-africa',
        continentId: 'africa',
        name: '南非',
        flag: '🇿🇦',
        airport: '开普敦机场',
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
        id: 'malaysia',
        regionId: 'malaysia',
        name: '马来西亚吉隆坡国际机场',
        city: '吉隆坡',
        icao: 'WMKK',
        packageName: 'packageMalaysia',
        audioPath: '/packageMalaysia/',
        icon: '🕌',
        description: '吉隆坡国际机场真实陆空通话录音',
        clips: malaysiaData.clips || []
      },
      {
        id: 'indonesia',
        regionId: 'indonesia',
        name: '印度尼西亚雅加达国际机场',
        city: '雅加达',
        icao: 'WIII',
        packageName: 'packageIndonesia',
        audioPath: '/packageIndonesia/',
        icon: '🗽',
        description: '雅加达苏加诺-哈达国际机场真实陆空通话录音',
        clips: indonesiaData.clips || []
      },
      {
        id: 'vietnam',
        regionId: 'vietnam',
        name: '越南胡志明/河内机场',
        city: '胡志明市/河内',
        icao: 'VVTS/VVNB',
        packageName: 'packageVietnam',
        audioPath: '/packageVietnam/',
        icon: '🌾',
        description: '胡志明新山一/河内内排国际机场真实陆空通话录音',
        clips: vietnamData.clips || []
      },
      {
        id: 'india',
        regionId: 'india',
        name: '印度德里机场',
        city: '德里',
        icao: 'VIDP',
        packageName: 'packageIndia',
        audioPath: '/packageIndia/',
        icon: '🕌',
        description: '德里英迪拉·甘地国际机场真实陆空通话录音',
        clips: indiaData.clips || []
      },
      {
        id: 'cambodia',
        regionId: 'cambodia',
        name: '柬埔寨金边机场',
        city: '金边',
        icao: 'VDPP',
        packageName: 'packageCambodia',
        audioPath: '/packageCambodia/',
        icon: '🏛️',
        description: '金边国际机场真实陆空通话录音',
        clips: cambodiaData.clips || []
      },
      {
        id: 'myanmar',
        regionId: 'myanmar',
        name: '缅甸仰光机场',
        city: '仰光',
        icao: 'VYYY',
        packageName: 'packageMyanmar',
        audioPath: '/packageMyanmar/',
        icon: '🛕',
        description: '仰光国际机场真实陆空通话录音',
        clips: myanmarData.clips || []
      },
      {
        id: 'uzbekistan',
        regionId: 'uzbekistan',
        name: '乌兹别克斯坦塔什干机场',
        city: '塔什干',
        icao: 'UTTT',
        packageName: 'packageUzbekistan',
        audioPath: '/packageUzbekistan/',
        icon: '🕌',
        description: '塔什干国际机场真实陆空通话录音',
        clips: uzbekistanData.clips || []
      },
      {
        id: 'maldive',
        regionId: 'maldive',
        name: '马尔代夫马累机场',
        city: '马累',
        icao: 'VRMM',
        packageName: 'packageMaldive',
        audioPath: '/packageMaldive/',
        icon: '🏝️',
        description: '马累国际机场真实陆空通话录音',
        clips: maldiveData.clips || []
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
        id: 'new-zealand',
        regionId: 'new-zealand',
        name: '新西兰奥克兰机场',
        city: '奥克兰',
        icao: 'NZAA',
        packageName: 'packageNewZealand',
        audioPath: '/packageNewZealand/',
        icon: '🥝',
        description: '奥克兰机场真实陆空通话录音',
        clips: newzealandData.clips || []
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
      },
      {
        id: 'uae',
        regionId: 'uae',
        name: '阿联酋迪拜机场',
        city: '迪拜',
        icao: 'OMDB',
        packageName: 'packageUAE',
        audioPath: '/packageUAE/',
        icon: '🏙️',
        description: '迪拜国际机场真实陆空通话录音',
        clips: uaeData.clips || []
      },
      {
        id: 'uk',
        regionId: 'uk',
        name: '英国伦敦希斯罗机场',
        city: '伦敦',
        icao: 'EGLL',
        packageName: 'packageUK',
        audioPath: '/packageUK/',
        icon: '🏰',
        description: '伦敦希斯罗机场真实陆空通话录音',
        clips: ukData.clips || []
      },
      {
        id: 'spain',
        regionId: 'spain',
        name: '西班牙马德里机场',
        city: '马德里',
        icao: 'LEMD',
        packageName: 'packageSpain',
        audioPath: '/packageSpain/',
        icon: '🏛️',
        description: '马德里机场真实陆空通话录音',
        clips: spainData.clips || []
      },
      {
        id: 'holland',
        regionId: 'holland',
        name: '荷兰阿姆斯特丹史基浦机场',
        city: '阿姆斯特丹',
        icao: 'EHAM',
        packageName: 'packageHolland',
        audioPath: '/packageHolland/',
        icon: '🌷',
        description: '阿姆斯特丹史基浦机场真实陆空通话录音',
        clips: hollandData.clips || []
      },
      {
        id: 'chinese-taipei',
        regionId: 'chinese-taipei',
        name: '中国台北松山机场',
        city: '台北',
        icao: 'RCSS',
        packageName: 'packageTaipei',
        audioPath: '/packageTaipei/',
        icon: '🏙️',
        description: '中国台北松山机场真实陆空通话录音',
        clips: chineseTaipeiData.clips || []
      },
      {
        id: 'macau',
        regionId: 'macau',
        name: '中国澳门国际机场',
        city: '澳门',
        icao: 'VMMC',
        packageName: 'packageMacau',
        audioPath: '/packageMacau/',
        icon: '🎰',
        description: '中国澳门国际机场真实陆空通话录音',
        clips: macauData.clips || []
      },
      {
        id: 'hongkong',
        regionId: 'hongkong',
        name: '中国香港国际机场',
        city: '香港',
        icao: 'VHHH',
        packageName: 'packageHongKong',
        audioPath: '/packageHongKong/',
        icon: '🏙️',
        description: '中国香港国际机场真实陆空通话录音',
        clips: hongkongData.clips || []
      },
      {
        id: 'canada',
        regionId: 'canada',
        name: '加拿大温哥华国际机场',
        city: '温哥华',
        icao: 'CYVR',
        packageName: 'packageCanada',
        audioPath: '/packageCanada/',
        icon: '🍁',
        description: '加拿大温哥华国际机场真实陆空通话录音',
        clips: canadaData.clips || []
      },
      {
        id: 'egypt',
        regionId: 'egypt',
        name: '埃及开罗国际机场',
        city: '开罗',
        icao: 'HECA',
        packageName: 'packageEgypt',
        audioPath: '/packageEgypt/',
        icon: '🏛️',
        description: '埃及开罗国际机场真实陆空通话录音',
        clips: egyptData.clips || []
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