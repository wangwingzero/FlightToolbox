// 健康管理页面
var BasePage = require('../../utils/base-page.js');

// 导入健康数据
var fitForFlightData = require('./fitForFlight.js');
var hearingData = require('./hearing.js');
var sunglassesData = require('./sunglasses.js');
var medicalData = require('../../data/medicalStandards.js');

// 导入新增的健康数据文件
var toxicityData = require('./Toxicity.js');
var alcoholData = require('./alcohol.js');
var carbonMonoxideData = require('./carbonMonoxide.js');
var circadianRhythmData = require('./circadianRhythm.js');
var decompressionSicknessData = require('./decompressionSickness.js');
var dvtData = require('./dvt.js');
var fatigueData = require('./fatigue.js');
var gForceData = require('./gForce.js');
var hypoxiaData = require('./hypoxia.js');
var laserEyeSurgeryData = require('./laserEyeSurgery.js');
var laserHazardsData = require('./laserHazards.js');
var lepData = require('./lep.js');
var medicationsData = require('./medications.js');
var osaData = require('./osa.js');
var pilotVisionData = require('./pilotVision.js');
var spatialDisorientationData = require('./spatialDisorientation.js');

var pageConfig = {
  data: {
    // 当前激活的标签
    activeTab: 'all',
    
    // 搜索相关
    searchValue: '',
    searchPlaceholder: '搜索健康管理中英文名称或内容...',
    
    // 所有健康数据
    allData: [],
    
    // 当前显示的数据
    displayData: [],
    
    // 总数统计
    totalCount: 0,
    
    // 详情弹窗
    showDetailPopup: false,
    selectedParameter: {},
    
    // 分类映射
    categoryMap: {
      'fitness': { name: '飞行体能', color: 'green' },
      'hearing': { name: '听力防护', color: 'blue' },
      'vision': { name: '视力保护', color: 'purple' },
      'medical': { name: '体检标准', color: 'orange' },
      'physiology': { name: '航空生理', color: 'red' },
      'safety': { name: '飞行安全', color: 'yellow' },
      'environment': { name: '环境因素', color: 'cyan' },
      'health': { name: '健康管理', color: 'pink' }
    }
  },

  customOnLoad: function(options) {
    console.log('健康管理页面加载');
    this.loadHealthData();
    
    // 测试数据
    setTimeout(function() {
      console.log('当前显示数据数量:', this.data.displayData.length);
      console.log('当前总数据数量:', this.data.allData.length);
    }.bind(this), 1000);
  },

  // 获取医学标准概要
  getStandardSummary: function(standard) {
    var summary = '';
    if (standard.category) {
      summary += '[' + standard.category + '] ';
    }
    if (standard.subCategory) {
      summary += standard.subCategory + ' - ';
    }
    
    if (standard.standard) {
      if (Array.isArray(standard.standard)) {
        var assessments = [];
        for (var i = 0; i < standard.standard.length; i++) {
          assessments.push(standard.standard[i].assessment);
        }
        summary += '评估结果：' + assessments.join('、');
      } else {
        summary += '评估结果：' + standard.standard.assessment;
      }
    }
    
    return summary || '查看详细的体检鉴定标准和条件';
  },

  // 加载健康数据
  loadHealthData: function() {
    var allData = [];
    
    // 处理飞行体能数据
    if (fitForFlightData.fitForFlightData_zh) {
      var fitData = fitForFlightData.fitForFlightData_zh;
      allData.push({
        nameZh: fitData.title,
        nameEn: 'Fit for Flight',
        definition: fitData.introduction,
        category: 'fitness',
        categoryName: '飞行体能',
        fullData: fitData,
        type: 'comprehensive'
      });
      
      // 添加各个章节作为独立条目
      if (fitData.sections) {
        fitData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'fitness',
            categoryName: '飞行体能',
            fullData: section,
            type: 'section'
          });
        });
      }
    }
    
    // 处理听力数据
    if (hearingData.hearingData_zh) {
      var hearData = hearingData.hearingData_zh;
      allData.push({
        nameZh: hearData.title,
        nameEn: 'Hearing and Noise in Flight',
        definition: '本文档详细介绍了飞行中的听力保护和噪音管理知识',
        category: 'hearing',
        categoryName: '听力防护',
        fullData: hearData,
        type: 'comprehensive'
      });
      
      // 添加各个章节
      if (hearData.sections) {
        hearData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'hearing',
            categoryName: '听力防护',
            fullData: section,
            type: 'section'
          });
        });
      }
    }
    
    // 处理太阳镜数据
    if (sunglassesData.sunglassesData_zh) {
      var sunData = sunglassesData.sunglassesData_zh;
      allData.push({
        nameZh: sunData.title,
        nameEn: 'Pilot Sunglasses: Beyond Image',
        definition: sunData.introduction,
        category: 'vision',
        categoryName: '视力保护',
        fullData: sunData,
        type: 'comprehensive'
      });
      
      // 添加各个章节
      if (sunData.sections) {
        sunData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'vision',
            categoryName: '视力保护',
            fullData: section,
            type: 'section'
          });
        });
      }
    }
    
    // 处理体检标准数据
    if (medicalData.medicalStandards) {
      var standards = medicalData.medicalStandards;
      for (var i = 0; i < standards.length; i++) {
        var standard = standards[i];
        allData.push({
          nameZh: standard.name_zh,
          nameEn: standard.name_en,
          definition: this.getStandardSummary(standard),
          category: 'medical',
          categoryName: '体检标准',
          fullData: standard,
          type: 'standard'
        });
      }
    }

    // 处理烟雾毒性数据
    if (toxicityData.smokeToxicityData_zh) {
      var smokeData = toxicityData.smokeToxicityData_zh;
      allData.push({
        nameZh: smokeData.title,
        nameEn: 'Smoke Toxicity',
        definition: '了解烟雾毒性对飞行安全的影响和防护措施',
        category: 'safety',
        categoryName: '飞行安全',
        fullData: smokeData,
        type: 'comprehensive'
      });

      if (smokeData.sections) {
        smokeData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'safety',
            categoryName: '飞行安全',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理酒精数据
    if (alcoholData.alcoholData_zh) {
      var alcData = alcoholData.alcoholData_zh;
      allData.push({
        nameZh: alcData.title,
        nameEn: 'Alcohol and Flying',
        definition: '酒精对飞行能力的影响和相关法规要求',
        category: 'health',
        categoryName: '健康管理',
        fullData: alcData,
        type: 'comprehensive'
      });

      if (alcData.sections) {
        alcData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'health',
            categoryName: '健康管理',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理缺氧数据
    if (hypoxiaData.hypoxiaData_zh) {
      var hypData = hypoxiaData.hypoxiaData_zh;
      allData.push({
        nameZh: hypData.title,
        nameEn: 'Hypoxia',
        definition: hypData.subtitle || '高空飞行中缺氧的危险和预防措施',
        category: 'physiology',
        categoryName: '航空生理',
        fullData: hypData,
        type: 'comprehensive'
      });

      if (hypData.sections) {
        hypData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'physiology',
            categoryName: '航空生理',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理疲劳数据
    if (fatigueData.fatigueData_zh) {
      var fatData = fatigueData.fatigueData_zh;
      allData.push({
        nameZh: fatData.title,
        nameEn: 'Fatigue in Aviation',
        definition: '航空疲劳的成因、影响和管理策略',
        category: 'physiology',
        categoryName: '航空生理',
        fullData: fatData,
        type: 'comprehensive'
      });

      if (fatData.sections) {
        fatData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'physiology',
            categoryName: '航空生理',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理G力数据
    if (gForceData.gForceData_zh) {
      var gData = gForceData.gForceData_zh;
      allData.push({
        nameZh: gData.title,
        nameEn: 'G-Force Effects',
        definition: 'G力对人体的影响和防护措施',
        category: 'physiology',
        categoryName: '航空生理',
        fullData: gData,
        type: 'comprehensive'
      });

      if (gData.sections) {
        gData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'physiology',
            categoryName: '航空生理',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理一氧化碳数据
    if (carbonMonoxideData.carbonMonoxideData_zh) {
      var coData = carbonMonoxideData.carbonMonoxideData_zh;
      allData.push({
        nameZh: coData.title,
        nameEn: 'Carbon Monoxide',
        definition: '一氧化碳中毒的危险和预防措施',
        category: 'safety',
        categoryName: '飞行安全',
        fullData: coData,
        type: 'comprehensive'
      });

      if (coData.sections) {
        coData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'safety',
            categoryName: '飞行安全',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理昼夜节律数据
    if (circadianRhythmData.circadianRhythmData_zh) {
      var crData = circadianRhythmData.circadianRhythmData_zh;
      allData.push({
        nameZh: crData.title,
        nameEn: 'Circadian Rhythm',
        definition: '昼夜节律对飞行表现的影响',
        category: 'physiology',
        categoryName: '航空生理',
        fullData: crData,
        type: 'comprehensive'
      });

      if (crData.sections) {
        crData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'physiology',
            categoryName: '航空生理',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理减压病数据
    if (decompressionSicknessData.decompressionSicknessData_zh) {
      var dsData = decompressionSicknessData.decompressionSicknessData_zh;
      allData.push({
        nameZh: dsData.title,
        nameEn: 'Decompression Sickness',
        definition: '减压病的成因、症状和预防',
        category: 'physiology',
        categoryName: '航空生理',
        fullData: dsData,
        type: 'comprehensive'
      });

      if (dsData.sections) {
        dsData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'physiology',
            categoryName: '航空生理',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理深静脉血栓数据
    if (dvtData.dvtData_zh) {
      var dvtInfo = dvtData.dvtData_zh;
      allData.push({
        nameZh: dvtInfo.title,
        nameEn: 'Deep Vein Thrombosis',
        definition: '长时间飞行中深静脉血栓的风险和预防',
        category: 'health',
        categoryName: '健康管理',
        fullData: dvtInfo,
        type: 'comprehensive'
      });

      if (dvtInfo.sections) {
        dvtInfo.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'health',
            categoryName: '健康管理',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理飞行员视力数据
    if (pilotVisionData.pilotVisionData_zh) {
      var visionData = pilotVisionData.pilotVisionData_zh;
      allData.push({
        nameZh: visionData.title,
        nameEn: 'Pilot Vision',
        definition: '飞行员视力要求和保护措施',
        category: 'vision',
        categoryName: '视力保护',
        fullData: visionData,
        type: 'comprehensive'
      });

      if (visionData.sections) {
        visionData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'vision',
            categoryName: '视力保护',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理激光眼科手术数据
    if (laserEyeSurgeryData.laserEyeSurgeryData_zh) {
      var lesData = laserEyeSurgeryData.laserEyeSurgeryData_zh;
      allData.push({
        nameZh: lesData.title,
        nameEn: 'Laser Eye Surgery',
        definition: '激光眼科手术对飞行员的影响和要求',
        category: 'vision',
        categoryName: '视力保护',
        fullData: lesData,
        type: 'comprehensive'
      });

      if (lesData.sections) {
        lesData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'vision',
            categoryName: '视力保护',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理激光危险数据
    if (laserHazardsData.laserHazardsData_zh) {
      var lhData = laserHazardsData.laserHazardsData_zh;
      allData.push({
        nameZh: lhData.title,
        nameEn: 'Laser Hazards',
        definition: '激光对飞行安全的危险和防护',
        category: 'safety',
        categoryName: '飞行安全',
        fullData: lhData,
        type: 'comprehensive'
      });

      if (lhData.sections) {
        lhData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'safety',
            categoryName: '飞行安全',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理药物数据
    if (medicationsData.medicationsData_zh) {
      var medData = medicationsData.medicationsData_zh;
      allData.push({
        nameZh: medData.title,
        nameEn: 'Medications and Flying',
        definition: '药物对飞行能力的影响和用药指导',
        category: 'health',
        categoryName: '健康管理',
        fullData: medData,
        type: 'comprehensive'
      });

      if (medData.sections) {
        medData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'health',
            categoryName: '健康管理',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理空间定向障碍数据
    if (spatialDisorientationData.spatialDisorientationData_zh) {
      var sdData = spatialDisorientationData.spatialDisorientationData_zh;
      allData.push({
        nameZh: sdData.title,
        nameEn: 'Spatial Disorientation',
        definition: '空间定向障碍的成因和预防措施',
        category: 'physiology',
        categoryName: '航空生理',
        fullData: sdData,
        type: 'comprehensive'
      });

      if (sdData.sections) {
        sdData.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'physiology',
            categoryName: '航空生理',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理睡眠呼吸暂停数据
    if (osaData.osaData_zh) {
      var osaInfo = osaData.osaData_zh;
      allData.push({
        nameZh: osaInfo.title,
        nameEn: 'Obstructive Sleep Apnea',
        definition: '阻塞性睡眠呼吸暂停对飞行安全的影响',
        category: 'health',
        categoryName: '健康管理',
        fullData: osaInfo,
        type: 'comprehensive'
      });

      if (osaInfo.sections) {
        osaInfo.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'health',
            categoryName: '健康管理',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    // 处理LEP数据
    if (lepData.lepData_zh) {
      var lepInfo = lepData.lepData_zh;
      allData.push({
        nameZh: lepInfo.title,
        nameEn: 'Laser Eye Protection',
        definition: '激光眼部防护的重要性和措施',
        category: 'vision',
        categoryName: '视力保护',
        fullData: lepInfo,
        type: 'comprehensive'
      });

      if (lepInfo.sections) {
        lepInfo.sections.forEach(function(section) {
          allData.push({
            nameZh: section.title,
            nameEn: section.title,
            definition: section.content || '详细内容请查看完整文档',
            category: 'vision',
            categoryName: '视力保护',
            fullData: section,
            type: 'section'
          });
        });
      }
    }

    this.setData({
      allData: allData,
      totalCount: allData.length,
      displayData: allData
    });
    
    console.log('健康数据加载完成，总数:', allData.length);
    console.log('前3个数据示例:', allData.slice(0, 3));
  },

  // 标签切换
  onTabChange: function(e) {
    var activeTab = e.detail.name;
    this.setData({
      activeTab: activeTab,
      searchValue: ''
    });
    this.filterDataByTab(activeTab);
  },

  // 根据标签过滤数据
  filterDataByTab: function(tab) {
    var filteredData = this.data.allData;
    
    if (tab !== 'all') {
      filteredData = this.data.allData.filter(function(item) {
        return item.category === tab;
      });
    }
    
    this.setData({
      displayData: filteredData
    });
  },

  // 实时搜索功能
  onSearchChange: function(e) {
    var searchValue = e.detail;
    this.setData({
      searchValue: searchValue
    });
    
    // 实时搜索
    if (searchValue.trim() === '') {
      this.filterDataByTab(this.data.activeTab);
    } else {
      this.performSearch();
    }
  },

  onSearchClear: function() {
    this.setData({
      searchValue: ''
    });
    this.filterDataByTab(this.data.activeTab);
  },

  // 执行搜索
  performSearch: function() {
    var searchValue = this.data.searchValue.toLowerCase().trim();
    var activeTab = this.data.activeTab;
    
    var baseData = this.data.allData;
    
    // 先按标签过滤
    if (activeTab !== 'all') {
      baseData = this.data.allData.filter(function(item) {
        return item.category === activeTab;
      });
    }
    
    // 再按搜索关键词过滤
    var filteredData = baseData;
    if (searchValue) {
      filteredData = baseData.filter(function(item) {
        return item.nameEn.toLowerCase().includes(searchValue) ||
               item.nameZh.includes(searchValue) ||
               item.definition.includes(searchValue);
      });
    }
    
    this.setData({
      displayData: filteredData
    });
  },

  // 显示参数详情
  showParameterDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayData[index];
    
    console.log('点击索引:', index);
    console.log('点击的参数:', item);
    
    if (!item) {
      console.error('未获取到参数数据，索引:', index);
      wx.showToast({
        title: '参数数据获取失败',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedParameter: item,
      showDetailPopup: true
    }, function() {
      console.log('弹窗状态已更新:', this.data.showDetailPopup);
      console.log('选中的参数:', this.data.selectedParameter);
    }.bind(this));
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedParameter: {}
    });
  }
};

Page(BasePage.createPage(pageConfig));