/**
 * CCAR规章数据管理器
 * 专为packageCCAR分包设计的数据管理工具
 * 严格遵循ES5语法，确保小程序兼容性
 */

/**
 * CCAR数据管理器
 */
var CCARDataManager = {
  // 缓存数据
  _regulationData: null,
  _normativeData: null,
  _classificationData: null,

  /**
   * 获取分类名称列表
   */
  getCategoryNames: function() {
    return [
      '行政管理',
      '航空人员', 
      '航空器制造与适航',
      '维修',
      '运行',
      '机场',
      '空中交通管理',
      '安全、安保与事故调查'
    ];
  },

  /**
   * 生成分类数据（供categories页面使用）
   * @param {Array} regulationData - 规章数据
   * @param {Array} normativeData - 规范性文件数据
   * @returns {Array} - 分类列表
   */
  generateCategories: function(regulationData, normativeData) {
    try {
      this._regulationData = regulationData || [];
      this._normativeData = normativeData || [];

      var categoryNames = this.getCategoryNames();
      var categories = [];

      // 为每个分类生成统计信息
      for (var i = 0; i < categoryNames.length; i++) {
        var categoryName = categoryNames[i];
        var categoryData = this._getRegulationsByCategory(categoryName);
        var normativeCount = this._getNormativesByCategory(categoryName);

        categories.push({
          name: categoryName,
          category: categoryName,
          regulationCount: categoryData.length,
          normativeCount: normativeCount.length,
          description: this._getCategoryDescription(categoryName)
        });
      }

      this._classificationData = categories;
      return categories;
    } catch (error) {
      console.error('❌ 生成分类失败:', error);
      return [];
    }
  },

  /**
   * 根据分类过滤规章
   * @param {Array} regulationData - 规章数据
   * @param {string} category - 分类名称
   * @param {string} subcategory - 子分类名称
   * @returns {Array} - 过滤后的规章列表
   */
  filterRegulationsByCategory: function(regulationData, category, subcategory) {
    try {
      if (!regulationData || regulationData.length === 0) {
        console.log('❌ 规章数据为空');
        return [];
      }

      console.log('开始过滤规章:', {
        category: category,
        subcategory: subcategory,
        totalRegulations: regulationData.length
      });

      // 如果没有指定分类，返回所有数据
      if (!category) {
        console.log('✅ 无分类限制，返回所有规章');
        return regulationData;
      }

      var filtered = this._getRegulationsByCategory(category, regulationData);
      console.log('✅ 过滤完成，匹配规章数量:', filtered.length);
      
      return filtered;
    } catch (error) {
      console.error('❌ 按分类过滤规章失败:', error);
      return [];
    }
  },

  /**
   * 根据规章编号获取相关规范性文件
   * @param {string} docNumber - 规章编号
   * @param {Array} normativeData - 规范性文件数据
   * @returns {Array} - 相关的规范性文件
   */
  getNormativesByRegulation: function(docNumber, normativeData) {
    try {
      if (!docNumber || !normativeData) {
        return [];
      }

      // 提取CCAR编号用于匹配
      var ccarNumber = this._extractCCARNumber(docNumber);
      
      var matchedFiles = normativeData.filter(function(item) {
        if (!item.doc_number) return false;
        
        // 尝试多种匹配方式
        var itemCcarNumber = this._extractCCARNumber(item.doc_number);
        
        // 1. CCAR编号精确匹配
        if (ccarNumber && itemCcarNumber && ccarNumber === itemCcarNumber) {
          return true;
        }
        
        // 2. 文档编号包含匹配（忽略大小写）
        if (item.doc_number.toLowerCase().includes(docNumber.toLowerCase())) {
          return true;
        }
        
        // 3. 如果是CCAR开头的规章，尝试匹配相关的AC、AP等文档
        if (ccarNumber && docNumber.match(/^CCAR/i)) {
          // 匹配AC-XX、AP-XX等格式，其中XX是CCAR编号
          var relatedPattern = new RegExp('(AC|AP|IB|MD)[_\\-]?' + ccarNumber + '[_\\-]', 'i');
          if (item.doc_number.match(relatedPattern)) {
            return true;
          }
        }
        
        // 4. 特殊处理：如果规章编号包含部分匹配
        // 例如：CCAR-21-R4 应该能匹配到 AC-21-xxx、AP-21-xxx等
        if (ccarNumber) {
          var ccarPart = '-' + ccarNumber + '-';
          var itemPart = item.doc_number.replace(/[_]/g, '-');
          if (itemPart.includes(ccarPart)) {
            return true;
          }
        }
        
        return false;
      }.bind(this));
      
      return matchedFiles;
    } catch (error) {
      console.error('❌ 获取规范性文件失败:', error);
      return [];
    }
  },

  /**
   * 获取指定分类的规章
   * @private
   * @param {string} category - 分类名称
   * @param {Array} regulationData - 规章数据（可选）
   * @returns {Array} - 该分类的规章列表
   */
  _getRegulationsByCategory: function(category, regulationData) {
    var data = regulationData || this._regulationData || [];
    
    var categoryMapping = this._getCCARCategoryMapping();
    var matchedRegulations = [];
    
    for (var i = 0; i < data.length; i++) {
      var regulation = data[i];
      if (!regulation.doc_number) {
        continue;
      }
      
      var ccarNumber = this._extractCCARNumber(regulation.doc_number);
      if (!ccarNumber) {
        continue;
      }
      
      var mapping = categoryMapping[ccarNumber];
      if (!mapping) {
        continue;
      }
      
      if (mapping.category === category) {
        matchedRegulations.push(regulation);
      }
    }
    
    return matchedRegulations;
  },
          doc_number: regulation.doc_number
        });
        continue;
      }
      
      if (mapping.category === category) {
        matchedRegulations.push(regulation);
        console.log('✅ 匹配到规章:', {
          title: regulation.title,
          docNumber: regulation.doc_number,
          ccarNumber: ccarNumber,
          category: mapping.category
        });
      } else {
        console.log('❌ 分类不匹配:', {
          title: regulation.title,
          ccarNumber: ccarNumber,
          expectedCategory: category,
          actualCategory: mapping.category
        });
      }
    }
    
    console.log('🎯 _getRegulationsByCategory - 过滤结果:', {
      category: category,
      totalProcessed: data.length,
      matchedCount: matchedRegulations.length,
      matchedTitles: matchedRegulations.slice(0, 5).map(function(item) {
        return item.title;
      })
    });
    
    return matchedRegulations;
  },

  /**
   * 获取指定分类的规范性文件
   * @private
   * @param {string} category - 分类名称
   * @returns {Array} - 该分类的规范性文件列表
   */
  _getNormativesByCategory: function(category) {
    var data = this._normativeData || [];
    var count = 0;
    
    // 获取该分类下的所有CCAR编号
    var categoryMapping = this._getCCARCategoryMapping();
    var ccarNumbers = [];
    
    for (var key in categoryMapping) {
      if (categoryMapping[key].category === category) {
        ccarNumbers.push(key);
      }
    }
    
    // 统计该分类下的规范性文件
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      if (!item.doc_number) continue;
      
      var ccarNumber = this._extractCCARNumber(item.doc_number);
      if (ccarNumber && ccarNumbers.indexOf(ccarNumber) !== -1) {
        count++;
      }
    }
    
    // 返回一个表示数量的数组
    return new Array(count);
  },

  /**
   * 提取CCAR编号
   * @private
   * @param {string} docNumber - 文档编号
   * @returns {string|null} - 提取的CCAR编号
   */
  _extractCCARNumber: function(docNumber) {
    if (!docNumber || typeof docNumber !== 'string') {
      return null;
    }
    
    // 先处理特殊字符问题，将中文破折号替换为英文连字符
    var normalizedDocNumber = docNumber.replace(/–/g, '-');
    
    // 匹配CCAR-数字格式，支持多种变体
    var ccarMatch = normalizedDocNumber.match(/CCAR[_\-]?(\d+)/i);
    if (ccarMatch && ccarMatch[1]) {
      return ccarMatch[1];
    }
    
    // 匹配AC-数字格式（咨询通告）
    var acMatch = normalizedDocNumber.match(/AC[_\-]?(\d+)/i);
    if (acMatch && acMatch[1]) {
      return acMatch[1];
    }
    
    // 匹配AP-数字格式（审定程序）
    var apMatch = normalizedDocNumber.match(/AP[_\-]?(\d+)/i);
    if (apMatch && apMatch[1]) {
      return apMatch[1];
    }
    
    // 匹配IB-数字格式（信息通告）
    var ibMatch = normalizedDocNumber.match(/IB[_\-]?[A-Z]*[_\-]?(\d+)/i);
    if (ibMatch && ibMatch[1]) {
      // 对于IB类型，尝试从后续部分提取CCAR编号
      var ccarPart = normalizedDocNumber.match(/(\d+)[_\-]/);
      if (ccarPart && ccarPart[1]) {
        return ccarPart[1];
      }
    }
    
    // 匹配MD-数字格式（管理文件）
    var mdMatch = normalizedDocNumber.match(/MD[_\-]?[A-Z]*[_\-]?(\d+)/i);
    if (mdMatch && mdMatch[1]) {
      // 对于MD类型，尝试从文档编号推断CCAR编号
      var ccarPart = normalizedDocNumber.match(/(\d{2,3})[_\-]/);
      if (ccarPart && ccarPart[1]) {
        return ccarPart[1];
      }
    }
    
    // 匹配MH/T格式（民航行业标准）
    var mhMatch = normalizedDocNumber.match(/MH\/T\s*(\d+)/i);
    if (mhMatch && mhMatch[1]) {
      // MH/T标准通常与机场相关，返回机场类的CCAR编号
      return '139'; // 默认归类到机场相关
    }
    
    return null;
  },

  /**
   * 获取CCAR分类映射表
   * @private
   * @returns {Object} - CCAR分类映射
   */
  _getCCARCategoryMapping: function() {
    return {
      // 行政管理类
      '12': { category: '行政管理' },     // 中国民用航空总局规章制定程序规定
      '13': { category: '行政管理' },     // 民用航空行政检查工作规则
      '14': { category: '行政管理' },     // 民用航空行政处罚实施办法
      '15': { category: '行政管理' },     // 民用航空行政许可工作规则
      '17': { category: '行政管理' },     // 民航行政机关行政赔偿办法
      '18': { category: '行政管理' },     // 中国民用航空监察员管理规定
      '19': { category: '行政管理' },     // 民航总局行政复议办法
      '201': { category: '行政管理' },    // 公共航空运输企业经营许可规定
      '209': { category: '行政管理' },    // 国内投资民用航空业规定
      '212': { category: '行政管理' },    // 外国航空运输企业常驻代表机构审批管理办法
      '221': { category: '行政管理' },    // 国际航空运输价格管理规定
      '241': { category: '行政管理' },    // 民用航空统计管理规定
      '243': { category: '行政管理' },    // 民用航空财经信息管理办法
      '246': { category: '行政管理' },    // 民航企业安全保障财务考核办法
      '273': { category: '行政管理' },    // 公共航空运输旅客服务管理规定
      '274': { category: '行政管理' },    // 中国民用航空货物国际运输规则
      '275': { category: '行政管理' },    // 民用航空货物运输管理规定
      '277': { category: '行政管理' },    // 定期国际航空运输管理规定
      '287': { category: '行政管理' },    // 外国航空运输企业航线经营许可规定
      '289': { category: '行政管理' },    // 中国民用航空国内航线经营许可规定
      '290': { category: '行政管理' },    // 通用航空经营许可管理规定
      '300': { category: '行政管理' },    // 航班正常管理规定
      '315': { category: '行政管理' },    // 外国航空运输企业在中国境内指定的销售代理直接进入和使用外国计算机订座系统许可管理暂行规定
      '375': { category: '行政管理' },    // 民用航空标准化管理规定
      '379': { category: '行政管理' },    // 民用航空计量管理规定
      '381': { category: '行政管理' },    // 中国民用航空部门计量检定规程管理办法

      // 航空人员类
      '60': { category: '航空人员' },     // 飞行模拟训练设备管理和运行规则
      '61': { category: '航空人员' },     // 民用航空器驾驶员合格审定规则
      '63': { category: '航空人员' },     // 民用航空器飞行机械员合格审定规则
      '65': { category: '航空人员' },     // 飞行签派员/气象员/电信员/情报员执照管理规则
      '66': { category: '航空人员' },     // 民用航空器维修人员执照管理规则/空中交通管制员执照管理规则
      '67': { category: '航空人员' },     // 民用航空人员体检合格证管理规则
      '69': { category: '航空人员' },     // 航空安全员合格审定规则
      '70': { category: '航空人员' },     // 民用航空空中交通管制培训管理规则
      '141': { category: '航空人员' },    // 民用航空器驾驶员学校合格审定规则
      '142': { category: '航空人员' },    // 飞行训练中心合格审定规则
      '147': { category: '航空人员' },    // 民用航空器维修培训机构合格审定规则
      '183': { category: '航空人员' },    // 各类委任代表和委任单位代表管理规定

      // 航空器制造与适航类
      '21': { category: '航空器制造与适航' },  // 民用航空产品和零部件合格审定规定
      '23': { category: '航空器制造与适航' },  // 正常类飞机适航规定
      '25': { category: '航空器制造与适航' },  // 运输类飞机适航标准
      '26': { category: '航空器制造与适航' },  // 运输类飞机的持续适航和安全改进规定
      '27': { category: '航空器制造与适航' },  // 正常类旋翼航空器适航规定
      '29': { category: '航空器制造与适航' },  // 运输类旋翼航空器适航规定
      '31': { category: '航空器制造与适航' },  // 载人自由气球适航规定
      '33': { category: '航空器制造与适航' },  // 航空发动机适航规定
      '34': { category: '航空器制造与适航' },  // 涡轮发动机飞机燃油排泄和排气排出物规定
      '35': { category: '航空器制造与适航' },  // 螺旋桨适航标准
      '36': { category: '航空器制造与适航' },  // 航空器型号和适航合格审定噪声规定
      '37': { category: '航空器制造与适航' },  // 民用航空材料、零部件和机载设备技术标准规定
      '39': { category: '航空器制造与适航' },  // 民用航空器适航指令规定
      '45': { category: '航空器制造与适航' },  // 民用航空器国籍登记规定
      '49': { category: '航空器制造与适航' },  // 中华人民共和国民用航空器权利登记条例实施办法
      '53': { category: '航空器制造与适航' },  // 民用航空用化学产品适航规定
      '55': { category: '航空器制造与适航' },  // 民用航空油料适航规定

      // 维修类
      '43': { category: '维修' },         // 民用航空器国籍标志和登记标志管理规定
      '145': { category: '维修' },       // 民用航空器维修单位合格审定规则

      // 运行类
      '71': { category: '运行' },         // 民用航空使用空域办法
      '73': { category: '运行' },         // 民用航空预先飞行计划管理办法
      '83': { category: '运行' },         // 民用航空空中交通管理运行单位安全管理规则
      '91': { category: '运行' },         // 一般运行和飞行规则
      '92': { category: '运行' },         // 民用无人驾驶航空器运行安全管理规则
      '97': { category: '运行' },         // 民用机场飞行程序和运行最低标准管理规定
      '119': { category: '运行' },       // 外国航空运输企业不定期飞行经营许可细则
      '121': { category: '运行' },       // 大型飞机公共航空运输承运人运行合格审定规则
      '129': { category: '运行' },       // 外国公共航空运输承运人运行合格审定规则
      '135': { category: '运行' },       // 小型商业运输和空中游览运营人运行合格审定规则
      '136': { category: '运行' },       // 特殊商业和私用大型航空器运营人运行合格审定规则
      '252': { category: '运行' },       // 民用机场和民用航空器内禁止吸烟的规定

      // 机场类
      '137': { category: '机场' },       // 民用机场专用设备管理规定
      '138': { category: '机场' },       // 通用机场管理规定
      '139': { category: '机场' },       // 运输机场使用许可规定/民用运输机场突发事件应急救援管理规则
      '140': { category: '机场' },       // 运输机场运行安全管理规定
      '158': { category: '机场' },       // 民用机场建设管理规定
      '165': { category: '机场' },       // 运输机场专业工程建设质量和安全生产监督管理规定
      '331': { category: '机场' },       // 民用机场航空器活动区道路交通安全管理规则

      // 空中交通管理类
      '85': { category: '空中交通管理' },   // 民用航空导航设备开放与运行管理规定
      '86': { category: '空中交通管理' },   // 民用航空通信导航监视设备飞行校验管理规则
      '87': { category: '空中交通管理' },   // 民用航空空中交通通信导航监视设备使用许可管理办法
      '93': { category: '空中交通管理' },   // 民用航空空中交通管理规则
      '98': { category: '空中交通管理' },   // 平行跑道同时仪表运行管理规定
      '115': { category: '空中交通管理' },  // 民用航空通信导航监视工作规则
      '116': { category: '空中交通管理' },  // 民用航空气象探测设施及探测环境管理办法
      '117': { category: '空中交通管理' },  // 中国民用航空气象工作规则
      '118': { category: '空中交通管理' },  // 中国民用航空无线电管理规定
      '175': { category: '空中交通管理' },  // 民用航空情报工作规则

      // 安全、安保与事故调查类
      '276': { category: '安全、安保与事故调查' },  // 民用航空危险品运输管理规定
      '329': { category: '安全、安保与事故调查' },  // 民用航空运输机场航空安全保卫规则
      '332': { category: '安全、安保与事故调查' },  // 公共航空旅客运输飞行中安全保卫工作规则
      '333': { category: '安全、安保与事故调查' },  // 通用航空安全保卫规则
      '339': { category: '安全、安保与事故调查' },  // 民用航空安全检查规则
      '343': { category: '安全、安保与事故调查' },  // 公共航空运输企业航空安全保卫规则
      '395': { category: '安全、安保与事故调查' },  // 民用航空器事件调查规定
      '396': { category: '安全、安保与事故调查' },  // 民用航空安全信息管理规定
      '397': { category: '安全、安保与事故调查' },  // 中国民用航空应急管理规定
      '398': { category: '安全、安保与事故调查' },  // 民用航空安全管理规定
      '399': { category: '安全、安保与事故调查' }   // 民用航空器飞行事故应急反应和家属援助规定
    };
  },

  /**
   * 获取分类描述
   * @private
   * @param {string} category - 分类名称
   * @returns {string} - 分类描述
   */
  _getCategoryDescription: function(category) {
    var descriptions = {
      '行政管理': '民航行政管理相关规章制度',
      '航空人员': '驾驶员、维修人员等航空人员资质管理',
      '航空器制造与适航': '航空器设计、制造、适航审定',
      '维修': '航空器维修、维修单位管理',
      '运行': '航空运营、飞行运行管理',
      '机场': '机场建设、管理、运行',
      '空中交通管理': '空管、导航、通信管理',
      '安全、安保与事故调查': '安全管理、事故调查、应急救援'
    };
    
    return descriptions[category] || '相关规章制度';
  }
};

module.exports = CCARDataManager;