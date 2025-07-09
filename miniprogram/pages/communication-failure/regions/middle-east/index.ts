// 中东地区通信差异页面逻辑
const { ICAO_DIFFERENCES_COMM_FAILURE_MIDDLE_EAST } = require('../../../../data/communication_failure/middle_east.js');

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
      title: '中东地区通信差异'
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

  // 加载中东地区数据
  loadRegionData() {
    this.setData({ loading: true });
    
    try {
      // 直接使用中东地区数据
      const middleEastData = ICAO_DIFFERENCES_COMM_FAILURE_MIDDLE_EAST;
      
      if (!middleEastData || Object.keys(middleEastData).length === 0) {
        throw new Error('中东地区数据为空');
      }

      console.log('✅ 中东地区数据加载成功，包含', Object.keys(middleEastData).length, '个国家');

      // 处理国家数据
      const processedCountries = {};
      const countryKeys = Object.keys(middleEastData);
      
      for (let i = 0; i < countryKeys.length; i++) {
        const countryKey = countryKeys[i];
        const countryRawData = middleEastData[countryKey];
        
        const flag = this.getCountryFlag(countryKey);

        processedCountries[countryKey] = {
          key: countryKey,
          region_name_en: countryRawData.region_name_en || countryKey,
          region_name_cn: countryRawData.region_name_cn || countryKey,
          icao_differences: countryRawData.icao_differences || { en: '', cn: '' },
          procedures: countryRawData.procedures || [],
          flag
        };
      }

      // 转换为数组格式
      const countriesArray = Object.keys(processedCountries).map(key => ({
        key,
        ...processedCountries[key]
      }));

      this.setData({
        countryList: countriesArray,
        loading: false
      });

      console.log('✅ 中东地区数据处理完成:', countriesArray);
    } catch (error) {
      console.error('❌ 加载中东地区数据失败:', error);
      this.setData({ 
        loading: false,
        countryList: [],
        selectedCountry: '',
        selectedCountryData: null
      });
      
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },


  // 获取国旗
  getCountryFlag(countryKey: string): string {
    const flagMap: { [key: string]: string } = {
      'UAE': '🇦🇪',
      'SAUDI_ARABIA': '🇸🇦',
      'QATAR': '🇶🇦',
      'KUWAIT': '🇰🇼',
      'BAHRAIN': '🇧🇭',
      'OMAN': '🇴🇲',
      'YEMEN': '🇾🇪',
      'IRAN': '🇮🇷',
      'IRAQ': '🇮🇶',
      'SYRIA': '🇸🇾',
      'JORDAN': '🇯🇴',
      'LEBANON': '🇱🇧',
      'ISRAEL': '🇮🇱',
      'PALESTINE': '🇵🇸',
      'TURKEY': '🇹🇷',
      'AFGHANISTAN': '🇦🇫',
      'PAKISTAN': '🇵🇰',
      'EGYPT': '🇪🇬',
      'SUDAN': '🇸🇩',
      'LIBYA': '🇱🇾'
    };
    return flagMap[countryKey] || '🏳️';
  },


  // 选择国家
  selectCountry(e: any) {
    const countryKey = e.currentTarget.dataset.country;
    const { countryList } = this.data;
    
    const selectedCountryData = countryList.find(country => country.key === countryKey);
    
    if (!selectedCountryData) {
      wx.showToast({
        title: '国家数据不存在',
        icon: 'none'
      });
      return;
    }

    this.setData({
      selectedCountry: countryKey,
      selectedCountryData: selectedCountryData
    });
  }
});