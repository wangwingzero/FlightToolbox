// 南美地区通信差异页面逻辑
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
  flag: string;
}

Page({
  data: {
    isDarkMode: false,
    loading: true,
    countryList: [] as CountryData[],
    selectedCountry: '',
    selectedCountryData: null as CountryData | null,
    isEnglish: false
  },

  onLoad() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '南美地区通信差异'
    });
    
    // 检查主题状态
    this.checkThemeStatus();
    
    // 检查语言设置
    this.checkLanguageSetting();
    
    // 加载地区数据
    this.loadRegionData();
  },

  onShow() {
    // 每次显示页面时检查主题状态
    this.checkThemeStatus();
    // 检查语言设置
    this.checkLanguageSetting();
  },

  // 检查主题状态
  checkThemeStatus() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
  },

  // 检查语言设置
  checkLanguageSetting() {
    const isEnglish = wx.getStorageSync('isEnglish_comm_failure') || false;
    this.setData({ isEnglish });
  },

  // 选择中文
  selectChinese() {
    if (!this.data.isEnglish) return;
    
    this.setData({ isEnglish: false });
    wx.setStorageSync('isEnglish_comm_failure', false);
    
    if (this.data.selectedCountry) {
      const selectedCountryData = this.data.countryList.find(country => country.key === this.data.selectedCountry);
      if (selectedCountryData) {
        this.setData({ selectedCountryData });
      }
    }
  },

  // 选择英文
  selectEnglish() {
    if (this.data.isEnglish) return;
    
    this.setData({ isEnglish: true });
    wx.setStorageSync('isEnglish_comm_failure', true);
    
    if (this.data.selectedCountry) {
      const selectedCountryData = this.data.countryList.find(country => country.key === this.data.selectedCountry);
      if (selectedCountryData) {
        this.setData({ selectedCountryData });
      }
    }
  },

  // 加载南美地区数据
  async loadRegionData() {
    const self = this;
    
    try {
      self.setData({ loading: true });

      // 异步加载南美地区数据
      await communicationDataManager.loadRegionData('SOUTH_AMERICA');
      
      // 获取地区数据
      const regionDifferences = communicationDataManager.getRegionDifferences();
      const southAmericaRegion = regionDifferences['SOUTH_AMERICA'];
      
      if (!southAmericaRegion || !southAmericaRegion.data) {
        throw new Error('南美地区数据加载失败');
      }

      // 处理国家数据
      const processedCountries: CountryData[] = [];
      Object.keys(southAmericaRegion.data).forEach(countryKey => {
        const countryRawData = southAmericaRegion.data[countryKey];
        const flag = self.getCountryFlag(countryKey);

        processedCountries.push({
          key: countryKey,
          region_name_en: countryRawData.region_name_en || countryKey,
          region_name_cn: countryRawData.region_name_cn || countryKey,
          icao_differences: countryRawData.icao_differences || { en: '', cn: '' },
          procedures: countryRawData.procedures || [],
          flag
        });
      });

      self.setData({
        countryList: processedCountries,
        loading: false
      });

      console.log('✅ 南美地区数据加载成功，共加载', processedCountries.length, '个国家');
    } catch (error) {
      console.error('❌ 加载南美地区数据失败:', error);
      self.setData({ 
        loading: false,
        countryList: []
      });
      
      wx.showModal({
        title: '加载失败',
        content: '南美地区数据加载失败，请检查网络连接后重试。',
        showCancel: true,
        cancelText: '取消',
        confirmText: '重试',
        success: (modalRes) => {
          if (modalRes.confirm) {
            self.loadRegionData();
          }
        }
      });
    }
  },


  // 获取国旗
  getCountryFlag(countryKey: string): string {
    const flagMap: { [key: string]: string } = {
      'BRAZIL': '🇧🇷',
      'ARGENTINA': '🇦🇷',
      'CHILE': '🇨🇱',
      'COLOMBIA': '🇨🇴',
      'PERU': '🇵🇪',
      'VENEZUELA': '🇻🇪',
      'ECUADOR': '🇪🇨',
      'BOLIVIA': '🇧🇴',
      'PARAGUAY': '🇵🇾',
      'URUGUAY': '🇺🇾',
      'GUYANA': '🇬🇾',
      'SURINAME': '🇸🇷',
      'FRENCH_GUIANA': '🇬🇫',
      'FALKLAND_ISLANDS': '🇫🇰',
      'TRINIDAD_AND_TOBAGO': '🇹🇹',
      'BARBADOS': '🇧🇧',
      'GRENADA': '🇬🇩',
      'SAINT_LUCIA': '🇱🇨',
      'SAINT_VINCENT_AND_THE_GRENADINES': '🇻🇨',
      'DOMINICA': '🇩🇲'
    };
    return flagMap[countryKey] || '🏳️';
  },


  // 选择国家
  selectCountry(e: any) {
    const countryKey = e.currentTarget.dataset.country;
    const country = this.data.countryList.find(c => c.key === countryKey);
    
    if (!country) {
      wx.showToast({
        title: '国家数据不存在',
        icon: 'none'
      });
      return;
    }

    // 内联显示国家详情
    this.setData({
      selectedCountry: countryKey,
      selectedCountryData: country
    });
  }
});