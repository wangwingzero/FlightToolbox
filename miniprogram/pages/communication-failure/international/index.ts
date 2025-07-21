// 国际通信失效程序页面逻辑
const { communicationDataManager } = require('../../../utils/communication-manager.js');

Page({
  data: {
    procedureData: {},
    selectedWeather: 'vmc', // 'vmc' or 'imc'
    selectedSeparation: 'procedural', // 'procedural' or 'surveillance'
    regionDifferences: {},
    selectedRegion: '', // 选中的地区
    selectedCountry: '', // 选中的国家
    showRegionDifferences: false, // 是否显示地区差异
    isEnglish: false // 语言切换状态
  },

  onLoad() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '国际通信失效程序'
    });
    
    // 检查语言设置
    this.checkLanguageSetting();
    
    // 加载程序数据
    this.loadProcedureData();
    
    // 加载地区差异数据
    this.loadRegionDifferences();
    
    // 初始化完成
  },

  onShow() {
    // 每次显示页面时检查语言设置
    this.checkLanguageSetting();
  },

  // 加载程序数据
  loadProcedureData() {
    const self = this;
    
    try {
      // 从主包数据管理器获取数据
      const communicationFailureData = communicationDataManager.getInternationalCommFailure();
      
      if (communicationFailureData && communicationFailureData.communicationFailureProcedure) {
        self.setData({
          procedureData: communicationFailureData.communicationFailureProcedure
        });
        console.log('✅ 国际通信失效程序数据加载成功');
      } else {
        console.error('❌ 国际通信失效程序数据格式错误');
        wx.showToast({
          title: '程序数据加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('❌ 加载国际通信失效程序数据失败:', error);
      wx.showToast({
        title: '程序数据加载失败',
        icon: 'none'
      });
    }
  },

  // 加载地区差异数据
  loadRegionDifferences() {
    const self = this;
    
    try {
      // 从主包数据管理器获取地区差异数据
      const regionDifferences = communicationDataManager.getRegionDifferences();
      
      self.setData({
        regionDifferences
      });
      
      console.log('✅ 地区差异数据加载成功');
    } catch (error) {
      console.error('❌ 加载地区差异数据失败:', error);
      wx.showToast({
        title: '地区数据加载失败',
        icon: 'none'
      });
    }
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
  },

  // 选择英文
  selectEnglish() {
    if (this.data.isEnglish) return;
    
    this.setData({ isEnglish: true });
    wx.setStorageSync('isEnglish_comm_failure', true);
  },

  // 设置应答机
  setTransponder() {
    wx.showModal({
      title: '应答机设置提醒',
      content: '请立即将应答机设置为：\n\n模式 A，编码 7600\n\n同时利用所有可供使用的手段发送紧急和/或紧迫信号。',
      showCancel: false,
      confirmText: '已设置'
    });
  },


  // 复制程序
  copyProcedure() {
    const procedureText = this.generateProcedureText();
    wx.setClipboardData({
      data: procedureText,
      success: () => {
        wx.showToast({
          title: '程序已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  // 生成程序文本
  generateProcedureText() {
    const data = this.data.procedureData;
    const isEnglish = this.data.isEnglish;
    
    let text = `${isEnglish ? data.title.en : data.title.cn}\n${isEnglish ? data.document.en : data.document.cn}\n\n`;
    
    text += `${isEnglish ? 'General Procedures:' : '一般程序：'}\n`;
    text += `• ${isEnglish ? 'Transponder Code:' : '应答机编码：'} ${isEnglish ? data.general_procedures.transponder_code.en : data.general_procedures.transponder_code.cn}\n`;
    text += `• ADS-B/ADS-C：${isEnglish ? data.general_procedures.ads_b_ads_c.en : data.general_procedures.ads_b_ads_c.cn}\n\n`;
    
    if (this.data.selectedWeather === 'vmc') {
      text += `${isEnglish ? 'VMC Conditions:' : 'VMC条件下：'}\n`;
      data.action_by_aircraft.vfr_conditions.steps.forEach((step: any, index: number) => {
        text += `${index + 1}. ${isEnglish ? step.en : step.cn}\n`;
      });
    } else {
      text += `${isEnglish ? 'IMC Conditions:' : 'IMC条件下：'}\n`;
      if (this.data.selectedSeparation === 'procedural') {
        text += `${isEnglish ? 'Procedural Separation:' : '程序间隔：'} ${isEnglish ? data.action_by_aircraft.imc_conditions.steps.speed_and_level.procedural_separation.en : data.action_by_aircraft.imc_conditions.steps.speed_and_level.procedural_separation.cn}\n`;
      } else {
        text += `${isEnglish ? 'ATS Surveillance:' : 'ATS监视：'} ${isEnglish ? data.action_by_aircraft.imc_conditions.steps.speed_and_level.ats_surveillance.en : data.action_by_aircraft.imc_conditions.steps.speed_and_level.ats_surveillance.cn}\n`;
      }
      text += `${isEnglish ? 'Route:' : '航路：'} ${isEnglish ? data.action_by_aircraft.imc_conditions.steps.route.en : data.action_by_aircraft.imc_conditions.steps.route.cn}\n`;
      text += `${isEnglish ? 'Descent and Approach:' : '下降和进近：'} ${isEnglish ? data.action_by_aircraft.imc_conditions.steps.descent_and_approach.en : data.action_by_aircraft.imc_conditions.steps.descent_and_approach.cn}\n`;
      text += `${isEnglish ? 'Landing:' : '着陆：'} ${isEnglish ? data.action_by_aircraft.imc_conditions.steps.landing.en : data.action_by_aircraft.imc_conditions.steps.landing.cn}\n`;
    }
    
    return text;
  },

  // 选择气象条件
  selectWeather(e: any) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedWeather: type
    });
  },

  // 选择间隔类型
  selectSeparation(e: any) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedSeparation: type
    });
  },

  // 切换地区差异显示
  toggleRegionDifferences() {
    this.setData({
      showRegionDifferences: !this.data.showRegionDifferences
    });
  },

  // 选择地区
  async selectRegion(e: any) {
    const region = e.currentTarget.dataset.region;
    
    // 检查地区数据是否已加载
    const regionData = this.data.regionDifferences[region];
    if (!regionData || Object.keys(regionData.data).length === 0) {
      // 显示加载提示
      wx.showLoading({
        title: '正在加载地区数据...',
        mask: true
      });
      
      try {
        // 异步加载地区数据
        await communicationDataManager.loadRegionData(region);
        
        // 重新获取更新后的地区差异数据
        const updatedRegionDifferences = communicationDataManager.getRegionDifferences();
        this.setData({
          regionDifferences: updatedRegionDifferences,
          selectedRegion: region,
          selectedCountry: '' // 重置选中的国家
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '地区数据加载完成',
          icon: 'success',
          duration: 1000
        });
      } catch (error) {
        wx.hideLoading();
        console.error('加载地区数据失败:', error);
        wx.showModal({
          title: '加载失败',
          content: '地区数据加载失败，请检查网络连接后重试。',
          showCancel: true,
          cancelText: '取消',
          confirmText: '重试',
          success: (modalRes) => {
            if (modalRes.confirm) {
              // 重试加载
              this.selectRegion(e);
            }
          }
        });
        return;
      }
    } else {
      // 数据已存在，直接设置
      this.setData({
        selectedRegion: region,
        selectedCountry: '' // 重置选中的国家
      });
    }
  },

  // 选择国家
  selectCountry(e: any) {
    const country = e.currentTarget.dataset.country;
    this.setData({
      selectedCountry: country
    });
  },

  // 复制地区差异程序
  copyRegionProcedure(e: any) {
    const country = e.currentTarget.dataset.country;
    const region = this.data.selectedRegion;
    const isEnglish = this.data.isEnglish;
    
    if (!region || !country) {
      wx.showToast({
        title: isEnglish ? 'Please select region and country first' : '请先选择地区和国家',
        icon: 'none'
      });
      return;
    }

    const regionData = this.data.regionDifferences[region];
    const countryData = regionData.data[country];
    
    if (!countryData) {
      wx.showToast({
        title: isEnglish ? 'Unable to find relevant data' : '无法找到相关数据',
        icon: 'none'
      });
      return;
    }

    let text = `${isEnglish ? countryData.region_name_en : countryData.region_name_cn} - ${isEnglish ? 'Communication Failure Procedure Differences' : '通信失效程序差异'}\n\n`;
    text += `${isEnglish ? 'ICAO Differences:' : '与ICAO差异：'}\n${isEnglish ? countryData.icao_differences.en : countryData.icao_differences.cn}\n\n`;
    text += `${isEnglish ? 'Specific Procedures:' : '具体程序：'}\n`;
    
    countryData.procedures.forEach((proc: any, index: number) => {
      text += `${index + 1}. ${isEnglish ? proc.en : proc.cn}\n\n`;
    });

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: isEnglish ? 'Procedure copied to clipboard' : '程序已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({
          title: isEnglish ? 'Copy failed' : '复制失败',
          icon: 'none'
        });
      }
    });
  },

});