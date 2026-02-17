// 通信规范详情页面
const AppConfig = require('../../utils/app-config.js');

Page({
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 无广告状态
    isAdFree: false,

    categoryType: '',
    categoryTitle: '',
    categoryData: null,

    // 页面状态
    loading: true,

    // 数据展示相关
    sections: [],
    filteredData: [],

  },

  onLoad(options: any) {
    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    // 获取传递的参数
    const { type, title, data } = options;
    
    if (!type || !title) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: decodeURIComponent(title)
    });

    this.setData({
      categoryType: type,
      categoryTitle: decodeURIComponent(title)
    });

    // 加载数据
    this.loadCategoryData(type, data);
  },

  onShow() {
    // 检查无广告状态
    this.checkAdFreeStatus();

    // 页面显示时的操作
  },

  // 加载分类数据
  loadCategoryData(type: string, encodedData?: string) {
    wx.showLoading({
      title: '加载中...'
    });

    try {
      let categoryData;
      
      if (encodedData) {
        // 如果有传递的数据，直接使用
        categoryData = JSON.parse(decodeURIComponent(encodedData));
      } else {
        // 否则从数据文件重新加载
        const communicationRulesModule = require('../data/CommunicationRules.js');
        if (communicationRulesModule && communicationRulesModule.aviationPhraseology) {
          categoryData = communicationRulesModule.aviationPhraseology[type];
        }
      }

      if (!categoryData) {
        throw new Error('数据不存在');
      }

      // 根据不同类型处理数据
      this.processCategoryData(type, categoryData);
      
      wx.hideLoading();
      this.setData({ loading: false });
      
    } catch (error) {
      wx.hideLoading();
      console.error('❌ 加载分类数据失败:', error);
      wx.showModal({
        title: '加载失败',
        content: '数据加载失败，请重试',
        showCancel: true,
        cancelText: '返回',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) {
            this.loadCategoryData(type, encodedData);
          } else {
            wx.navigateBack();
          }
        }
      });
    }
  },

  // 处理不同类型的数据
  processCategoryData(type: string, data: any) {
    switch (type) {
      case 'phraseologyRequirements':
        this.processPhraseologyRequirements(data);
        break;
      case 'pronunciation':
        this.processPronunciation(data);
        break;
      case 'standardPhrases':
        this.processStandardPhrases(data);
        break;
      case 'callSignPhraseology':
        this.processCallSignPhraseology(data);
        break;
      case 'weatherPhraseology':
        this.processWeatherPhraseology(data);
        break;
      default:
        this.processGenericData(data);
    }
  },

  // 处理通话要求数据
  processPhraseologyRequirements(data: any) {
    const sections = [];
    
    if (data.overview) {
      sections.push({
        id: 'overview',
        title: '通话概述',
        icon: '📋',
        type: 'text',
        content: [
          data.overview.description,
          data.overview.languageAndTime
        ].filter(Boolean)
      });
    }
    
    if (data.communicationStructure) {
      sections.push({
        id: 'structure',
        title: '通话结构',
        icon: '🏗️',
        type: 'structure',
        content: data.communicationStructure
      });
    }
    
    if (data.communicationTechniques) {
      sections.push({
        id: 'techniques',
        title: '通话技巧',
        icon: '💡',
        type: 'list',
        content: data.communicationTechniques
      });
    }

    this.setData({
      categoryData: data,
      sections: sections,
      filteredData: sections
    });
  },

  // 处理发音规则数据
  processPronunciation(data: any) {
    const sections = [];
    
    if (data.numbers) {
      sections.push({
        id: 'numbers',
        title: '数字发音',
        icon: '🔢',
        type: 'numbers',
        content: data.numbers
      });
    }
    
    if (data.phoneticAlphabet) {
      sections.push({
        id: 'alphabet',
        title: 'ICAO字母表',
        icon: '🔤',
        type: 'alphabet',
        content: data.phoneticAlphabet
      });
    }
    
    if (data.specialReadings) {
      sections.push({
        id: 'special',
        title: '特殊读法',
        icon: '⭐',
        type: 'special',
        content: data.specialReadings
      });
    }

    this.setData({
      categoryData: data,
      sections: sections,
      filteredData: sections
    });
  },

  // 处理标准用语数据
  processStandardPhrases(data: any) {
    if (Array.isArray(data)) {
      const sections = [{
        id: 'phrases',
        title: `标准用语 (${data.length}个)`,
        icon: '💬',
        type: 'phrases',
        content: data
      }];

      this.setData({
        categoryData: data,
        sections: sections,
        filteredData: sections
      });
    }
  },

  // 处理呼号用法数据
  processCallSignPhraseology(data: any) {
    const sections = [];
    
    if (data.controllerUnits) {
      sections.push({
        id: 'controller',
        title: '管制单位呼号',
        icon: '🏢',
        type: 'controller',
        content: data.controllerUnits
      });
    }
    
    if (data.aircraft) {
      sections.push({
        id: 'aircraft',
        title: '航空器呼号',
        icon: '✈️',
        type: 'aircraft',
        content: data.aircraft
      });
    }

    this.setData({
      categoryData: data,
      sections: sections,
      filteredData: sections
    });
  },

  // 处理天气报文数据
  processWeatherPhraseology(data: any) {
    const sections = [];

    if (data.wind) {
      sections.push(this.buildWeatherSection('wind', '风向风速', '💨', data.wind, 'wind'));
    }

    if (data.visibilityAndRvr) {
      sections.push(this.buildWeatherSection('visibility', '能见度与RVR', '👁️', data.visibilityAndRvr, 'visibilityAndRvr'));
    }

    if (data.weatherAndClouds) {
      sections.push(this.buildWeatherSection('clouds', '天气与云况', '☁️', data.weatherAndClouds, 'weatherAndClouds'));
    }

    if (data.tempAndAltimeter) {
      sections.push(this.buildWeatherSection('temp', '温度与气压', '🌡️', data.tempAndAltimeter, 'tempAndAltimeter'));
    }

    this.setData({
      categoryData: data,
      sections: sections,
      filteredData: sections
    });
  },

  // 构建单个天气报文 section，将示例按格式归类
  buildWeatherSection(id: string, title: string, icon: string, sectionData: any, sectionKey: string) {
    const formats = (sectionData && sectionData.formats) || [];
    const examples = (sectionData && sectionData.examples) || [];
    const formatCards = this.mapWeatherExamples(sectionKey, formats, examples);

    return {
      id,
      title,
      icon,
      type: 'weather',
      content: Object.assign({}, sectionData, {
        formatCards
      })
    };
  },

  // 按不同 section 类型把示例挂到对应格式上
  mapWeatherExamples(sectionKey: string, formats: any[], examples: any[]) {
    const cards = (formats || []).map((fmt: any) => ({
      type: fmt.type,
      format_zh: fmt.format_zh,
      format_en: fmt.format_en,
      examples: [] as any[]
    }));

    if (!examples || !examples.length) {
      return cards;
    }

    const findCard = (type: string) => cards.find(card => card.type === type);

    (examples || []).forEach((ex: any) => {
      const scenario = ex && ex.scenario;

      switch (sectionKey) {
        case 'wind':
          if (scenario === 'Standard Surface Wind') {
            const card = findCard('Surface Wind');
            card && card.examples.push(ex);
          } else if (scenario === 'Gusting Wind') {
            const card = findCard('Gusting');
            card && card.examples.push(ex);
          } else if (scenario === 'Variable Wind' || scenario === 'Wind with variation range') {
            const card = findCard('Variable');
            card && card.examples.push(ex);
          }
          break;

        case 'visibilityAndRvr':
          if (scenario && scenario.indexOf('Visibility') >= 0) {
            const visCard = findCard('Visibility');
            visCard && visCard.examples.push(ex);
          } else if (scenario === 'Single RVR' || scenario === 'RVR Below Minimum') {
            const rvrCard = findCard('RVR');
            rvrCard && rvrCard.examples.push(ex);
          } else if (scenario === 'RVR with Trend') {
            const trendCard = findCard('RVR Trend');
            trendCard && trendCard.examples.push(ex);
          }
          break;

        case 'weatherAndClouds':
          if (scenario === 'Clouds') {
            const layerCard = findCard('Cloud Layer');
            layerCard && layerCard.examples.push(ex);
          } else {
            const weatherCard = findCard('Current Weather');
            weatherCard && weatherCard.examples.push(ex);
          }
          break;

        case 'tempAndAltimeter':
          if (scenario === 'Standard Temp/Pres' || scenario === 'Negative Temp') {
            const tempCard = findCard('Temperature');
            tempCard && tempCard.examples.push(ex);
          } else if (scenario === 'Low Pressure') {
            const qnhCard = findCard('QNH');
            qnhCard && qnhCard.examples.push(ex);
          }
          break;

        default:
          break;
      }
    });

    return cards;
  },

  // 处理通用数据
  processGenericData(data: any) {
    const sections = [{
      id: 'generic',
      title: '详细内容',
      icon: '📄',
      type: 'generic',
      content: data
    }];

    this.setData({
      categoryData: data,
      sections: sections,
      filteredData: sections
    });
  },

  // 复制内容
  copyContent(e: any) {
    const content = e.currentTarget.dataset.content;
    if (content) {
      wx.setClipboardData({
        data: content,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          });
        }
      });
    }
  },

  // 打开 ICAO 标准对话完整句库页面
  openStandardPhraseology() {
    wx.navigateTo({
      url: '/packageNav/standard-phraseology/index',
      fail: (err: any) => {
        console.error('❌ 跳转ICAO标准对话页面失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `陆空通话规范 - ${this.data.categoryTitle}`,
      path: `/packageNav/communication-rules-detail/index?type=${this.data.categoryType}&title=${encodeURIComponent(this.data.categoryTitle)}`
    };
  },

  // 广告事件处理
  adLoad() {
    console.log('原生模板广告加载成功');
  },

  adError(err: any) {
    console.error('原生模板广告加载失败', err);
  },

  adClose() {
    console.log('原生模板广告关闭');
  },

  // 检查无广告状态
  checkAdFreeStatus: function() {
    const adFreeManager = require('../../utils/ad-free-manager.js');
    try {
      const isAdFree = adFreeManager.isAdFreeToday();
      this.setData({ isAdFree });
      console.log('📅 无广告状态:', isAdFree ? '今日无广告' : '显示广告');
    } catch (error) {
      console.error('❌ 检查无广告状态失败:', error);
    }
  }
});