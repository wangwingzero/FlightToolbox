// 太平洋地区通信差异页面逻辑
const { ICAO_DIFFERENCES_COMM_FAILURE_PACIFIC } = require('../../../../data/communication_failure/pacific.js');

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
    this.updatePageTitle();
  },

  // 更新页面标题
  updatePageTitle() {
    wx.setNavigationBarTitle({
      title: '太平洋地区通信差异'
    });
  },

  // 选择中文
  selectChinese() {
    if (!this.data.isEnglish) return; // 已经是中文，不需要切换
    
    this.setData({ isEnglish: false });
    wx.setStorageSync('isEnglish_comm_failure', false);
    this.updatePageTitle();
    
    // 如果当前有选中的国家，更新显示
    if (this.data.selectedCountry) {
      const selectedCountryData = this.data.countryList.find(country => country.key === this.data.selectedCountry);
      if (selectedCountryData) {
        this.setData({ selectedCountryData });
      }
    }
  },

  // 选择英文
  selectEnglish() {
    if (this.data.isEnglish) return; // 已经是英文，不需要切换
    
    this.setData({ isEnglish: true });
    wx.setStorageSync('isEnglish_comm_failure', true);
    this.updatePageTitle();
    
    // 如果当前有选中的国家，更新显示
    if (this.data.selectedCountry) {
      const selectedCountryData = this.data.countryList.find(country => country.key === this.data.selectedCountry);
      if (selectedCountryData) {
        this.setData({ selectedCountryData });
      }
    }
  },

  // 加载太平洋地区数据
  loadRegionData() {
    this.setData({ loading: true });
    
    try {
      // 直接使用太平洋地区数据
      const pacificData = ICAO_DIFFERENCES_COMM_FAILURE_PACIFIC;
      
      if (!pacificData || Object.keys(pacificData).length === 0) {
        throw new Error('太平洋地区数据为空');
      }

      // 处理国家数据
      const processedCountries: Record<string, CountryData> = {};
      Object.keys(pacificData).forEach(countryKey => {
        const countryRawData = pacificData[countryKey];
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
        countryList: countriesArray,
        loading: false
      });

      console.log('✅ 太平洋地区数据加载成功:', countriesArray);
    } catch (error) {
      console.error('❌ 加载太平洋地区数据失败:', error);
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
      'JAPAN': '🇯🇵',
      'AUSTRALIA': '🇦🇺',
      'NEW_ZEALAND': '🇳🇿',
      'KOREA_REPUBLIC_OF': '🇰🇷',
      'PHILIPPINES': '🇵🇭',
      'THAILAND': '🇹🇭',
      'SINGAPORE': '🇸🇬',
      'MALAYSIA': '🇲🇾',
      'INDONESIA': '🇮🇩',
      'CHINA': '🇨🇳',
      'TAIWAN': '🇹🇼',
      'HONG_KONG': '🇭🇰'
    };
    return flagMap[countryKey] || '🏳️';
  },


  // 设置应答机编码
  setTransponder(e: any) {
    const code = e.currentTarget.dataset.code;
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: `应答机编码 ${code} 已复制`,
          icon: 'success'
        });
      }
    });
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