// 国际通信失效程序页面逻辑
// 使用BasePage基类，符合项目架构规范
const BasePage = require('../../../utils/base-page.js');
const { communicationDataManager } = require('../../../utils/communication-manager.js');

/**
 * TypeScript接口定义
 */
interface ProcedureData {
  communicationFailureProcedure?: any;
}

interface TypeEvent {
  currentTarget: {
    dataset: {
      type?: string;
      region?: string;
      country?: string;
    };
  };
}

/**
 * 页面配置
 */
const pageConfig = {
  data: {
    loading: false,  // BasePage加载状态
    procedureData: {},
    selectedWeather: 'vmc', // 'vmc' or 'imc'
    selectedSeparation: 'procedural', // 'procedural' or 'surveillance'
    regionDifferences: {},
    selectedRegion: '', // 选中的地区
    selectedCountry: '', // 选中的国家
    showRegionDifferences: false, // 是否显示地区差异
    isEnglish: false // 语言切换状态
  },

  /**
   * 页面加载（使用BasePage的customOnLoad）
   */
  customOnLoad: function(options: any): void {
    const self = this;

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '国际通信失效程序'
    });

    // 检查语言设置
    this.checkLanguageSetting();

    // 使用BasePage的loadDataWithLoading方法加载程序数据
    this.loadDataWithLoading(
      function() {
        // 返回Promise进行数据加载
        return communicationDataManager.getInternationalCommFailure();
      },
      {
        context: '加载国际通信失效程序数据',
        dataKey: 'rawData'  // 先加载到临时字段
      }
    ).then(function(data: ProcedureData) {
      // 手动提取communicationFailureProcedure字段
      if (data && data.communicationFailureProcedure) {
        console.log('✅ 国际通信失效程序数据加载成功');
        self.setData({
          procedureData: data.communicationFailureProcedure,
          rawData: null  // 清除临时数据
        });
      } else {
        throw new Error('程序数据格式错误');
      }
    }).catch(function(error) {
      // BasePage已经处理了错误显示，这里只需记录日志
      console.error('❌ 国际通信失效程序数据加载失败:', error);
      self.handleError(error, '加载国际通信失效程序数据');
    });

    // 加载地区差异元数据（同步）
    this.loadRegionDifferences();
  },

  /**
   * 页面显示（使用BasePage的customOnShow）
   */
  customOnShow: function(): void {
    // 每次显示页面时检查语言设置
    this.checkLanguageSetting();
  },

  /**
   * 加载地区差异元数据
   */
  loadRegionDifferences: function(): void {
    try {
      // 从数据管理器获取地区差异元数据（同步，不包含实际数据）
      const regionDifferences = communicationDataManager.getRegionDifferences();

      this.setData({
        regionDifferences
      });

      console.log('✅ 地区差异元数据加载成功');
    } catch (error) {
      console.error('❌ 加载地区差异元数据失败:', error);
      this.handleError(error, '加载地区差异数据');
    }
  },

  /**
   * 检查语言设置
   */
  checkLanguageSetting: function(): void {
    const isEnglish = wx.getStorageSync('isEnglish_comm_failure') || false;
    this.setData({ isEnglish });
  },

  /**
   * 选择中文
   */
  selectChinese: function(): void {
    if (!this.data.isEnglish) return;

    this.setData({ isEnglish: false });
    wx.setStorageSync('isEnglish_comm_failure', false);
  },

  /**
   * 选择英文
   */
  selectEnglish: function(): void {
    if (this.data.isEnglish) return;

    this.setData({ isEnglish: true });
    wx.setStorageSync('isEnglish_comm_failure', true);
  },

  /**
   * 设置应答机
   */
  setTransponder: function(): void {
    wx.showModal({
      title: '应答机设置提醒',
      content: '请立即将应答机设置为：\n\n模式 A，编码 7600\n\n同时利用所有可供使用的手段发送紧急和/或紧迫信号。',
      showCancel: false,
      confirmText: '已设置'
    });
  },

  /**
   * 复制程序
   */
  copyProcedure: function(): void {
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

  /**
   * 生成程序文本
   */
  generateProcedureText: function(): string {
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

  /**
   * 选择气象条件
   */
  selectWeather: function(e: TypeEvent): void {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedWeather: type
    });
  },

  /**
   * 选择间隔类型
   */
  selectSeparation: function(e: TypeEvent): void {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedSeparation: type
    });
  },

  /**
   * 切换地区差异显示
   */
  toggleRegionDifferences: function(): void {
    this.setData({
      showRegionDifferences: !this.data.showRegionDifferences
    });
  },

  /**
   * 选择地区（异步加载地区数据）
   */
  selectRegion: async function(e: TypeEvent): Promise<void> {
    const self = this;
    const region = e.currentTarget.dataset.region;

    if (!region) return;

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
              self.selectRegion(e);
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

  /**
   * 选择国家
   */
  selectCountry: function(e: TypeEvent): void {
    const country = e.currentTarget.dataset.country;
    this.setData({
      selectedCountry: country
    });
  },

  /**
   * 复制地区差异程序
   */
  copyRegionProcedure: function(e: TypeEvent): void {
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

  /**
   * 广告事件处理
   */
  adLoad: function(): void {
    console.log('横幅广告加载成功');
  },

  adError: function(err: any): void {
    console.error('横幅广告加载失败', err);
  },

  adClose: function(): void {
    console.log('横幅广告关闭');
  }
};

// ✅ 使用BasePage.createPage()创建页面，符合项目架构规范
Page(BasePage.createPage(pageConfig));
