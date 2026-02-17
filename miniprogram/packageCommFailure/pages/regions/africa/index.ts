// 非洲地区通信差异页面逻辑
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
    loading: true,
    countryList: [] as CountryData[],
    selectedCountry: '',
    selectedCountryData: null as CountryData | null,
    isEnglish: false
  },

  onLoad() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '非洲地区通信差异'
    });
    
    // 检查语言设置
    this.checkLanguageSetting();
    
    // 加载地区数据
    this.loadRegionData();
  },

  onShow() {
    // 检查语言设置
    this.checkLanguageSetting();
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

  // 加载非洲地区数据
  async loadRegionData() {
    const self = this;
    
    try {
      self.setData({ loading: true });

      // 异步加载非洲地区数据
      await communicationDataManager.loadRegionData('AFRICA');
      
      // 获取地区数据
      const regionDifferences = communicationDataManager.getRegionDifferences();
      const africaRegion = regionDifferences['AFRICA'];
      
      if (!africaRegion || !africaRegion.data) {
        throw new Error('非洲地区数据加载失败');
      }

      // 处理国家数据
      const processedCountries: Record<string, CountryData> = {};
      Object.keys(africaRegion.data).forEach(countryKey => {
        const countryRawData = africaRegion.data[countryKey];
        const flag = self.getCountryFlag(countryKey);

        processedCountries[countryKey] = {
          key: countryKey,
          region_name_en: countryRawData.region_name_en || countryKey,
          region_name_cn: countryRawData.region_name_cn || countryKey,
          icao_differences: countryRawData.icao_differences || { en: '', cn: '' },
          procedures: countryRawData.procedures || [],
          flag
        };
      });

      // 转换为数组格式
      const countriesArray = Object.keys(processedCountries).map(key => ({
        key,
        ...processedCountries[key]
      }));

      self.setData({
        countryList: countriesArray,
        loading: false
      });

      console.log('✅ 非洲地区数据加载成功:', countriesArray);
    } catch (error) {
      console.error('❌ 加载非洲地区数据失败:', error);
      self.setData({ 
        loading: false,
        countryList: [],
        selectedCountry: '',
        selectedCountryData: null
      });
      
      wx.showModal({
        title: '加载失败',
        content: '非洲地区数据加载失败，请检查网络连接后重试。',
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
      'SOUTH_AFRICA': '🇿🇦',
      'NIGERIA': '🇳🇬',
      'KENYA': '🇰🇪',
      'ETHIOPIA': '🇪🇹',
      'EGYPT': '🇪🇬',
      'MOROCCO': '🇲🇦',
      'ALGERIA': '🇩🇿',
      'TUNISIA': '🇹🇳',
      'LIBYA': '🇱🇾',
      'GHANA': '🇬🇭',
      'IVORY_COAST': '🇨🇮',
      'SENEGAL': '🇸🇳',
      'CAMEROON': '🇨🇲',
      'ANGOLA': '🇦🇴',
      'DEMOCRATIC_REPUBLIC_OF_THE_CONGO': '🇨🇩',
      'TANZANIA': '🇹🇿',
      'UGANDA': '🇺🇬',
      'MOZAMBIQUE': '🇲🇿',
      'MADAGASCAR': '🇲🇬',
      'BOTSWANA': '🇧🇼',
      'NAMIBIA': '🇳🇦',
      'ZAMBIA': '🇿🇲',
      'ZIMBABWE': '🇿🇼',
      'MALAWI': '🇲🇼',
      'RWANDA': '🇷🇼',
      'BURUNDI': '🇧🇮',
      'SOMALIA': '🇸🇴',
      'DJIBOUTI': '🇩🇯',
      'ERITREA': '🇪🇷',
      'SUDAN': '🇸🇩',
      'SOUTH_SUDAN': '🇸🇸',
      'CHAD': '🇹🇩',
      'CENTRAL_AFRICAN_REPUBLIC': '🇨🇫',
      'GABON': '🇬🇦',
      'EQUATORIAL_GUINEA': '🇬🇶',
      'REPUBLIC_OF_THE_CONGO': '🇨🇬',
      'SAO_TOME_AND_PRINCIPE': '🇸🇹',
      'CAPE_VERDE': '🇨🇻',
      'GUINEA_BISSAU': '🇬🇼',
      'GUINEA': '🇬🇳',
      'SIERRA_LEONE': '🇸🇱',
      'LIBERIA': '🇱🇷',
      'BURKINA_FASO': '🇧🇫',
      'MALI': '🇲🇱',
      'NIGER': '🇳🇪',
      'MAURITANIA': '🇲🇷',
      'GAMBIA': '🇬🇲',
      'BENIN': '🇧🇯',
      'TOGO': '🇹🇬',
      'LESOTHO': '🇱🇸',
      'ESWATINI': '🇸🇿',
      'COMOROS': '🇰🇲',
      'MAURITIUS': '🇲🇺',
      'SEYCHELLES': '🇸🇨'
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
  },

  // 广告事件处理
  adLoad() {
    console.log('横幅广告加载成功');
  },
  
  adError(err: any) {
    console.error('横幅广告加载失败', err);
  },
  
  adClose() {
    console.log('横幅广告关闭');
  }
});