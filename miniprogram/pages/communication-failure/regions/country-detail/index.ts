// 国家程序详情页面逻辑
const { communicationDataManager } = require('../../../../utils/communication-manager.js');

interface CountryData {
  key: string;
  region_name_en: string;
  region_name_cn: string;
  icao_differences: {
    en: string;
    cn: string;
  };
  procedures: any[];
  flag?: string;
  complexity?: string;
  complexityText?: string;
}

interface RegionInfo {
  name: string;
  englishName: string;
  source: string;
}

Page({
  data: {
    region: '',
    country: '',
    countryData: {} as CountryData,
    regionInfo: {} as RegionInfo,
    language: 'cn', // 'cn' or 'en'
    isFavorite: false,
    showEmergency: false
  },

  onLoad(options: any) {
    const region = options.region || '';
    const country = options.country || '';
    
    console.log('国家详情页面加载，地区:', region, '国家:', country);
    
    this.setData({ 
      region, 
      country 
    });
    
    // 设置地区信息
    this.setRegionInfo(region);
    
    // 加载国家数据
    this.loadCountryData(region, country);
    
    // 检查收藏状态
    this.checkFavoriteStatus(region, country);
    
    // 页面初始化完成
  },

  onShow() {
    // 页面显示时的操作
  },

  // 设置地区信息
  setRegionInfo(region: string) {
    const regionMap: { [key: string]: RegionInfo } = {
      'pacific': {
        name: '太平洋',
        englishName: 'Pacific',
        source: '太平洋航路手册'
      },
      'europe': {
        name: '欧洲',
        englishName: 'Europe',
        source: '欧洲航路手册'
      },
      'eastern_europe': {
        name: '东欧',
        englishName: 'Eastern Europe',
        source: '东欧航路手册'
      },
      'middle_east': {
        name: '中东',
        englishName: 'Middle East',
        source: '中东航路手册'
      },
      'north_america': {
        name: '北美',
        englishName: 'North America',
        source: '北美航路手册'
      },
      'south_america': {
        name: '南美',
        englishName: 'South America',
        source: '南美航路手册'
      },
      'africa': {
        name: '非洲',
        englishName: 'Africa',
        source: '非洲航路手册'
      }
    };

    const regionInfo = regionMap[region] || {
      name: '未知',
      englishName: 'Unknown',
      source: '未知来源'
    };

    this.setData({ regionInfo });
  },

  // 加载国家数据
  async loadCountryData(region: string, countryKey: string) {
    try {
      // 异步加载地区数据
      const regionKeyMap: { [key: string]: string } = {
        'pacific': 'PACIFIC',
        'europe': 'EUROPE',
        'eastern_europe': 'EASTERN_EUROPE',
        'middle_east': 'MIDDLE_EAST',
        'north_america': 'NORTH_AMERICA',
        'south_america': 'SOUTH_AMERICA',
        'africa': 'AFRICA'
      };

      const regionDataKey = regionKeyMap[region];
      if (!regionDataKey) {
        throw new Error('不支持的地区');
      }

      await communicationDataManager.loadRegionData(regionDataKey);
      
      // 获取国家数据
      console.log(`🔍 查询国家数据: regionDataKey=${regionDataKey}, countryKey=${countryKey}`);
      const countryData = communicationDataManager.getCountryData(regionDataKey, countryKey);
      console.log(`🔍 获取到的国家数据:`, countryData);
      
      if (!countryData) {
        console.log(`❌ 未找到国家数据: ${regionDataKey} -> ${countryKey}`);
        wx.showToast({
          title: '未找到国家数据',
          icon: 'none'
        });
        return;
      }

      // 处理国家数据
      const complexity = this.determineComplexity(countryData);
      const complexityText = this.getComplexityText(complexity);
      const flag = this.getCountryFlag(countryKey);

      const processedCountryData: CountryData = {
        key: countryKey,
        region_name_en: countryData.region_name_en || countryKey,
        region_name_cn: countryData.region_name_cn || countryKey,
        icao_differences: countryData.icao_differences || { en: '', cn: '' },
        procedures: countryData.procedures || [],
        flag,
        complexity,
        complexityText
      };

      this.setData({ countryData: processedCountryData });

      // 更新页面标题
      wx.setNavigationBarTitle({
        title: processedCountryData.region_name_cn + ' 通信程序'
      });

      console.log('✅ 国家数据加载成功:', processedCountryData);
    } catch (error) {
      console.error('❌ 加载国家数据失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },

  // 确定程序复杂度
  determineComplexity(country: any): string {
    const proceduresCount = country.procedures ? country.procedures.length : 0;
    const diffText = country.icao_differences ? (country.icao_differences.cn || '') : '';
    
    if (proceduresCount <= 1 && diffText.length < 100) {
      return 'simple';
    } else if (proceduresCount <= 3 && diffText.length < 300) {
      return 'medium';
    } else {
      return 'complex';
    }
  },

  // 获取复杂度文本
  getComplexityText(complexity: string): string {
    const complexityMap: { [key: string]: string } = {
      'simple': '简单',
      'medium': '中等',
      'complex': '复杂'
    };
    return complexityMap[complexity] || '未知';
  },

  // 获取国旗
  getCountryFlag(countryKey: string): string {
    const flagMap: { [key: string]: string } = {
      'CHINA': '🇨🇳',
      'UNITED_STATES': '🇺🇸',
      'UNITED_KINGDOM': '🇬🇧',
      'GERMANY': '🇩🇪',
      'FRANCE': '🇫🇷',
      'JAPAN': '🇯🇵',
      'AUSTRALIA': '🇦🇺',
      'CANADA': '🇨🇦',
      'BRAZIL': '🇧🇷',
      'RUSSIA': '🇷🇺',
      'SPAIN': '🇪🇸',
      'ITALY': '🇮🇹',
      'NETHERLANDS': '🇳🇱',
      'SWEDEN': '🇸🇪',
      'NORWAY': '🇳🇴',
      'DENMARK': '🇩🇰',
      'BELGIUM_AND_LUXEMBOURG': '🇧🇪',
      'SWITZERLAND': '🇨🇭',
      'ISRAEL': '🇮🇱',
      'SAUDI_ARABIA': '🇸🇦',
      'UNITED_ARAB_EMIRATES': '🇦🇪',
      'SOUTH_AFRICAN_REP': '🇿🇦',
      'EGYPT': '🇪🇬',
      'NIGERIA': '🇳🇬',
      'KENYA': '🇰🇪',
      'THAILAND': '🇹🇭',
      'MALAYSIA': '🇲🇾',
      'SINGAPORE': '🇸🇬',
      'INDONESIA': '🇮🇩',
      'KOREA_REPUBLIC_OF': '🇰🇷',
      'NEW_ZEALAND': '🇳🇿',
      'ARMENIA': '🇦🇲',
      'BELARUS': '🇧🇾',
      'BULGARIA': '🇧🇬',
      'CZECHIA': '🇨🇿',
      'ESTONIA': '🇪🇪',
      'GEORGIA': '🇬🇪',
      'KAZAKHSTAN': '🇰🇿',
      'MONGOLIA': '🇲🇳',
      'POLAND': '🇵🇱',
      'SLOVAKIA': '🇸🇰',
      'UKRAINE': '🇺🇦',
      'IRAQ': '🇮🇶',
      'JORDAN': '🇯🇴',
      'KUWAIT': '🇰🇼',
      'LEBANON': '🇱🇧',
      'OMAN': '🇴🇲',
      'QATAR': '🇶🇦',
      'TURKIYE': '🇹🇷',
      'YEMEN': '🇾🇪',
      'GREENLAND': '🇬🇱',
      'ALGERIA': '🇩🇿',
      'MOROCCO': '🇲🇦',
      'TUNISIA': '🇹🇳',
      'PHILIPPINES': '🇵🇭'
    };
    return flagMap[countryKey] || '🏳️';
  },

  // 检查收藏状态
  checkFavoriteStatus(region: string, country: string) {
    try {
      const favorites = wx.getStorageSync('communicationFailureFavorites') || [];
      const favoriteKey = `${region}_${country}`;
      const isFavorite = favorites.includes(favoriteKey);
      this.setData({ isFavorite });
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  },

  // 切换语言
  switchLanguage(e: any) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({ language: lang });
  },

  // 切换收藏状态
  toggleFavorite() {
    const { region, country, isFavorite } = this.data;
    const favoriteKey = `${region}_${country}`;
    
    try {
      let favorites = wx.getStorageSync('communicationFailureFavorites') || [];
      
      if (isFavorite) {
        // 取消收藏
        favorites = favorites.filter((item: string) => item !== favoriteKey);
        wx.showToast({
          title: '已取消收藏',
          icon: 'success'
        });
      } else {
        // 添加收藏
        favorites.push(favoriteKey);
        wx.showToast({
          title: '已添加收藏',
          icon: 'success'
        });
      }
      
      wx.setStorageSync('communicationFailureFavorites', favorites);
      this.setData({ isFavorite: !isFavorite });
    } catch (error) {
      console.error('收藏操作失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 分享国家程序
  shareCountry() {
    const content = this.generateShareContent();
    
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '程序已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 生成分享内容
  generateShareContent(): string {
    const { countryData, language, regionInfo } = this.data;
    
    let content = `${countryData.region_name_cn} (${countryData.region_name_en}) - 通信失效程序\\n`;
    content += `地区：${regionInfo.name}\\n\\n`;
    
    content += `与ICAO差异：\\n`;
    content += `${language === 'cn' ? countryData.icao_differences.cn : countryData.icao_differences.en}\\n\\n`;
    
    content += `详细程序：\\n`;
    countryData.procedures.forEach((proc: any, index: number) => {
      const text = language === 'cn' ? proc.cn : proc.en;
      content += `${index + 1}. ${text}\\n\\n`;
    });
    
    content += `数据来源：${regionInfo.source}\\n`;
    content += `更新时间：2025-07-07`;
    
    return content;
  },

  // 复制单个程序
  copyProcedure(e: any) {
    const index = e.currentTarget.dataset.index;
    const { countryData, language } = this.data;
    const procedure = countryData.procedures[index];
    
    if (!procedure) {
      wx.showToast({
        title: '程序不存在',
        icon: 'none'
      });
      return;
    }
    
    const text = language === 'cn' ? procedure.cn : procedure.en;
    const content = `${countryData.region_name_cn} - 程序 ${index + 1}\\n\\n${text}`;
    
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '程序已复制',
          icon: 'success'
        });
      }
    });
  },

  // 复制全部程序
  copyAllProcedures() {
    const content = this.generateShareContent();
    
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '全部程序已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  // 显示紧急信息
  showEmergencyInfo() {
    this.setData({ showEmergency: true });
  },

  // 隐藏紧急信息
  hideEmergencyInfo() {
    this.setData({ showEmergency: false });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止点击模态框内容时关闭弹窗
  }
});