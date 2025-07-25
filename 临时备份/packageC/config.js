// 机场数据配置管理器
// 严格ES5语法，确保真机兼容性

var AirportConfig = {
  // 分包基础配置
  packageName: 'airportPackage',
  packageRoot: 'packageAirport',
  
  // 数据文件配置
  dataFiles: {
    airports: '../airportdata.js'
  },
  
  // 搜索配置
  searchConfig: {
    // 搜索字段配置
    searchFields: ['ICAOCode', 'IATACode', 'ShortName', 'EnglishName', 'CountryName'],
    // 高亮字段
    highlightFields: ['ICAOCode', 'IATACode', 'ShortName', 'EnglishName'],
    // 搜索延迟（毫秒）
    searchDelay: 300,
    // 最小搜索字符数
    minSearchLength: 1,
    // 最大搜索结果数
    maxResults: 100
  },
  
  // 分页配置
  pagination: {
    pageSize: 20,
    maxPages: 50
  },
  
  // 错误消息配置
  messages: {
    loadError: '机场数据加载失败',
    searchError: '搜索功能异常',
    noResults: '未找到匹配的机场',
    loadingText: '正在加载机场数据...',
    searchingText: '正在搜索...'
  },
  
  // 机场类型映射
  airportTypes: {
    'Large': '大型机场',
    'Medium': '中型机场', 
    'Small': '小型机场',
    'Heliport': '直升机场',
    'Closed': '已关闭'
  },
  
  // 国家/地区分组配置
  regionGroups: {
    'Asia': ['中国', '日本', '韩国', '新加坡', '泰国', '马来西亚', '印度尼西亚', '菲律宾', '印度', '越南'],
    'Europe': ['英国', '法国', '德国', '意大利', '西班牙', '俄罗斯', '荷兰', '瑞士', '奥地利', '比利时'],
    'America': ['美国', '加拿大', '墨西哥', '巴西', '阿根廷', '智利', '哥伦比亚', '秘鲁'],
    'Oceania': ['澳大利亚', '新西兰', '斐济', '巴布亚新几内亚'],
    'Africa': ['南非', '埃及', '肯尼亚', '尼日利亚', '摩洛哥', '埃塞俄比亚'],
    'MiddleEast': ['阿联酋', '沙特阿拉伯', '卡塔尔', '土耳其', '以色列', '伊朗']
  },
  
  // 验证规则
  validation: {
    icaoCodePattern: /^[A-Z]{4}$/,
    iataCodePattern: /^[A-Z]{3}$/,
    coordinateRange: {
      latitude: { min: -90, max: 90 },
      longitude: { min: -180, max: 180 }
    }
  }
};

module.exports = AirportConfig;