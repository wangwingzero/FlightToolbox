// 东欧地区通信差异页面逻辑
const { communicationDataManager } = require('../../../../utils/communication-manager.js');

Page({
  data: {
    countryList: [],
    selectedCountry: '',
    selectedCountryData: null,
    isEnglish: false
  },

  onLoad() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '东欧地区通信差异'
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

  // 加载东欧地区数据
  async loadRegionData() {
    try {
      // 使用communication-manager加载东欧地区数据
      await communicationDataManager.loadRegionData('EASTERN_EUROPE');
      
      // 获取地区数据
      const regionDifferences = communicationDataManager.getRegionDifferences();
      const easternEuropeRegion = regionDifferences['EASTERN_EUROPE'];
      
      if (!easternEuropeRegion || !easternEuropeRegion.data) {
        throw new Error('东欧地区数据加载失败');
      }
      
      const easternEuropeData = easternEuropeRegion.data;

      // 处理国家数据
      const processedCountries = {};
      Object.keys(easternEuropeData).forEach(countryKey => {
        const countryRawData = easternEuropeData[countryKey];
        const flag = this.getCountryFlag(countryKey);

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

      this.setData({
        countryList: countriesArray
      });

      console.log('✅ 东欧地区数据加载成功:', countriesArray);
    } catch (error) {
      console.error('❌ 加载东欧地区数据失败:', error);
      this.setData({ 
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
  getCountryFlag(countryKey) {
    const flagMap = {
      'ARMENIA': '🇦🇲',
      'BELARUS': '🇧🇾',
      'BULGARIA': '🇧🇬',
      'CZECHIA': '🇨🇿',
      'ESTONIA': '🇪🇪',
      'GEORGIA': '🇬🇪',
      'KAZAKHSTAN': '🇰🇿',
      'MONGOLIA': '🇲🇳',
      'POLAND': '🇵🇱',
      'RUSSIA': '🇷🇺',
      'SLOVAKIA': '🇸🇰',
      'TAJIKISTAN': '🇹🇯',
      'TURKMENISTAN': '🇹🇲',
      'UKRAINE': '🇺🇦',
      'UZBEKISTAN': '🇺🇿'
    };
    return flagMap[countryKey] || '🏳️';
  },

  // 选择国家
  selectCountry(e) {
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