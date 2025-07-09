// 通信规范详情页面
Page({
  data: {
    isDarkMode: false,
    categoryType: '',
    categoryTitle: '',
    categoryData: null,
    
    // 页面状态
    loading: true,
    
    // 数据展示相关
    sections: [],
    currentSection: '',
    
  },

  onLoad(options: any) {
    console.log('📖 通信规范详情页面加载', options);
    
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

    // 检查主题状态
    this.checkThemeStatus();
    
    // 加载数据
    this.loadCategoryData(type, data);
  },

  onShow() {
    // 每次显示页面时检查主题状态
    this.checkThemeStatus();
  },

  // 检查主题状态
  checkThemeStatus() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
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
        const communicationRulesModule = require('../../packageCommunication/CommunicationRules.js');
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
    console.log(`🔄 处理 ${type} 数据:`, data);
    
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
      sections.push({
        id: 'wind',
        title: '风向风速',
        icon: '💨',
        type: 'weather',
        content: data.wind
      });
    }
    
    if (data.visibilityAndRvr) {
      sections.push({
        id: 'visibility',
        title: '能见度与RVR',
        icon: '👁️',
        type: 'weather',
        content: data.visibilityAndRvr
      });
    }
    
    if (data.weatherAndClouds) {
      sections.push({
        id: 'clouds',
        title: '天气与云况',
        icon: '☁️',
        type: 'weather',
        content: data.weatherAndClouds
      });
    }
    
    if (data.tempAndAltimeter) {
      sections.push({
        id: 'temp',
        title: '温度与气压',
        icon: '🌡️',
        type: 'weather',
        content: data.tempAndAltimeter
      });
    }

    this.setData({
      categoryData: data,
      sections: sections,
      filteredData: sections
    });
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

  // 选择章节
  selectSection(e: any) {
    const sectionId = e.currentTarget.dataset.section;
    this.setData({
      currentSection: this.data.currentSection === sectionId ? '' : sectionId
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

  // 分享功能
  onShareAppMessage() {
    return {
      title: `陆空通话规范 - ${this.data.categoryTitle}`,
      path: `/pages/communication-rules-detail/index?type=${this.data.categoryType}&title=${encodeURIComponent(this.data.categoryTitle)}`
    };
  }
});