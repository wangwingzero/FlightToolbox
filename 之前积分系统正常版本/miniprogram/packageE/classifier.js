/**
 * 规范性文件自动分类器
 * 实现三级文件夹结构：规章类别 -> CCAR规章部号 -> 规范性文件
 * 
 * 分类优先级：
 * 1. 按"部号"精确匹配（最高优先级）
 * 2. 按"负责司局"和"标题关键词"模糊匹配
 * 3. 手动归类（兜底方案）
 */

// CCAR规章部号与类别映射表
const CCAR_CATEGORY_MAP = {
  // 1. 行政管理类 (Administration)
  '14': { category: '行政管理', subcategory: 'CCAR-14', name: '行政处罚' },
  '201': { category: '行政管理', subcategory: 'CCAR-201', name: '企业设立' },
  '209': { category: '行政管理', subcategory: 'CCAR-209', name: '经营许可' },
  '229': { category: '行政管理', subcategory: 'CCAR-229', name: '企业管理' },
  '241': { category: '行政管理', subcategory: 'CCAR-241', name: '统计管理' },
  '271': { category: '行政管理', subcategory: 'CCAR-271', name: '旅客服务' },
  '272': { category: '行政管理', subcategory: 'CCAR-272', name: '服务质量' },
  '273': { category: '行政管理', subcategory: 'CCAR-273', name: '投诉处理' },
  '275': { category: '行政管理', subcategory: 'CCAR-275', name: '货物运输' },
  '277': { category: '行政管理', subcategory: 'CCAR-277', name: '航线管理' },
  '289': { category: '行政管理', subcategory: 'CCAR-289', name: '航权配置' },
  '290': { category: '行政管理', subcategory: 'CCAR-290', name: '通用航空经营' },
  '300': { category: '行政管理', subcategory: 'CCAR-300', name: '航班正常' },
  '315': { category: '行政管理', subcategory: 'CCAR-315', name: '销售代理' },
  '375': { category: '行政管理', subcategory: 'CCAR-375', name: '标准化管理' },
  '379': { category: '行政管理', subcategory: 'CCAR-379', name: '计量管理' },

  // 2. 航空人员类 (Personnel)
  '61': { category: '航空人员', subcategory: 'CCAR-61', name: '民用航空器驾驶员合格审定规则' },
  '63': { category: '航空人员', subcategory: 'CCAR-63', name: '飞行机械员' },
  '65': { category: '航空人员', subcategory: 'CCAR-65', name: '飞行签派员' },
  '66': { category: '航空人员', subcategory: 'CCAR-66', name: '维修人员执照' },
  '67': { category: '航空人员', subcategory: 'CCAR-67', name: '体检合格证' },
  '69': { category: '航空人员', subcategory: 'CCAR-69', name: '航空安全员' },
  '70': { category: '航空人员', subcategory: 'CCAR-70', name: '空管培训' },
  '141': { category: '航空人员', subcategory: 'CCAR-141', name: '驾驶员学校' },
  '142': { category: '航空人员', subcategory: 'CCAR-142', name: '飞行训练中心' },
  '183': { category: '航空人员', subcategory: 'CCAR-183', name: '委任代表' },

  // 3. 航空器制造与适航类 (Manufacturing & Airworthiness)
  '21': { category: '航空器制造与适航', subcategory: 'CCAR-21', name: '产品和零部件审定' },
  '23': { category: '航空器制造与适航', subcategory: 'CCAR-23', name: '正常类飞机适航标准' },
  '25': { category: '航空器制造与适航', subcategory: 'CCAR-25', name: '运输类飞机适航标准' },
  '27': { category: '航空器制造与适航', subcategory: 'CCAR-27', name: '正常类旋翼航空器适航标准' },
  '29': { category: '航空器制造与适航', subcategory: 'CCAR-29', name: '运输类旋翼航空器适航标准' },
  '31': { category: '航空器制造与适航', subcategory: 'CCAR-31', name: '载人自由气球适航规定' },
  '33': { category: '航空器制造与适航', subcategory: 'CCAR-33', name: '航空发动机适航规定' },
  '34': { category: '航空器制造与适航', subcategory: 'CCAR-34', name: '燃油排泄和排气排出物规定' },
  '35': { category: '航空器制造与适航', subcategory: 'CCAR-35', name: '螺旋桨适航规定' },
  '36': { category: '航空器制造与适航', subcategory: 'CCAR-36', name: '航空器型号和适航合格审定噪声规定' },
  '39': { category: '航空器制造与适航', subcategory: 'CCAR-39', name: '适航指令' },
  '45': { category: '航空器制造与适航', subcategory: 'CCAR-45', name: '航空器国籍登记' },
  '49': { category: '航空器制造与适航', subcategory: 'CCAR-49', name: '航空器权利登记' },
  '53': { category: '航空器制造与适航', subcategory: 'CCAR-53', name: '民用航空化学产品' },
  '55': { category: '航空器制造与适航', subcategory: 'CCAR-55', name: '民用航空油料' },

  // 4. 维修类 (Maintenance)
  '43': { category: '维修', subcategory: 'CCAR-43', name: '民用航空器维修' },
  '145': { category: '维修', subcategory: 'CCAR-145', name: '维修单位合格审定' },
  '147': { category: '维修', subcategory: 'CCAR-147', name: '维修培训机构' },

  // 5. 运行类 (Operations)
  '91': { category: '运行', subcategory: 'CCAR-91', name: '一般运行和飞行规则' },
  '92': { category: '运行', subcategory: 'CCAR-92', name: '民用无人驾驶航空器运行安全管理' },
  '97': { category: '运行', subcategory: 'CCAR-97', name: '标准仪表进近程序和相关运行标准' },
  '121': { category: '运行', subcategory: 'CCAR-121', name: '大型飞机公共航空运输承运人运行合格审定' },
  '129': { category: '运行', subcategory: 'CCAR-129', name: '外国公共航空运输承运人运行合格审定' },
  '135': { category: '运行', subcategory: 'CCAR-135', name: '小型航空器商业运输运营人运行合格审定' },
  '136': { category: '运行', subcategory: 'CCAR-136', name: '商业非运输运营人运行合格审定' },

  // 6. 机场类 (Airport)
  '137': { category: '机场', subcategory: 'CCAR-137', name: '民用机场专用设备管理' },
  '138': { category: '机场', subcategory: 'CCAR-138', name: '通用机场管理' },
  '139': { category: '机场', subcategory: 'CCAR-139', name: '运输机场使用许可' },
  '140': { category: '机场', subcategory: 'CCAR-140', name: '运输机场运行安全管理' },
  '158': { category: '机场', subcategory: 'CCAR-158', name: '民用机场建设管理' },
  '165': { category: '机场', subcategory: 'CCAR-165', name: '民用机场工程质量监督管理' },

  // 7. 空中交通管理类 (Air Traffic Management)
  '93': { category: '空中交通管理', subcategory: 'CCAR-93', name: '民用航空空中交通管理规则' },
  '98': { category: '空中交通管理', subcategory: 'CCAR-98', name: '平行跑道同时仪表运行管理' },
  '115': { category: '空中交通管理', subcategory: 'CCAR-115', name: '民用航空通信导航监视设备飞行校验管理规则' },
  '117': { category: '空中交通管理', subcategory: 'CCAR-117', name: '民用航空气象工作规则' },
  '118': { category: '空中交通管理', subcategory: 'CCAR-118', name: '民用航空无线电管理规定' },
  '175': { category: '空中交通管理', subcategory: 'CCAR-175', name: '民用航空情报工作规则' },

  // 8. 安全、安保与事故调查类 (Safety, Security & Investigation)
  '276': { category: '安全、安保与事故调查', subcategory: 'CCAR-276', name: '民用航空危险品运输管理规定' },
  '333': { category: '安全、安保与事故调查', subcategory: 'CCAR-333', name: '通用航空安全保卫规则' },
  '395': { category: '安全、安保与事故调查', subcategory: 'CCAR-395', name: '民用航空器事件调查' },
  '396': { category: '安全、安保与事故调查', subcategory: 'CCAR-396', name: '民用航空安全信息管理' },
  '398': { category: '安全、安保与事故调查', subcategory: 'CCAR-398', name: '民用航空安全管理' },
  '399': { category: '安全、安保与事故调查', subcategory: 'CCAR-399', name: '民用航空应急救援管理' }
};

// 负责司局与类别映射表
const OFFICE_CATEGORY_MAP = {
  '飞行标准司': ['航空人员', '运行', '维修'],
  '机场司': ['机场'],
  '空管行业管理办公室': ['空中交通管理'],
  '航空安全办公室': ['安全、安保与事故调查'],
  '运输司': ['行政管理', '安全、安保与事故调查'],
  '航空器适航审定司': ['航空器制造与适航'],
  '政策法规司': ['行政管理'],
  '综合司': ['行政管理']
};

// 标题关键词映射表
const TITLE_KEYWORD_MAP = {
  '航空人员': [
    '飞行员', '驾驶员', '教员', '执照', '体检', '签派员', '维修人员',
    '机械员', '安全员', '培训机构', '考试', '资格', '心理健康', '体检鉴定',
    '医学标准', '驾驶员学校', '飞行训练中心', '委任代表', '操控员培训',
    '体检合格证', '医学标准实施细则', '体检鉴定档案'
  ],
  '运行': [
    '运行', '飞行', '航线', '机组', '疲劳', 'EFB', 'HUD', '操作程序',
    '导航', 'PBN', '供氧', '客舱', '无人机', '无人驾驶航空器', 'QAR',
    '训练指南', '训练大纲', '运行规则', '飞行运行', '全天候运行',
    '基于性能导航', '绿色QAR', '航空器运行', '无管制机场', '训练模块提要',
    '涡轮发动机', '旅客供氧', '病媒生物防制', '蚊虫', '鼠类',
    '飞行校验', '飞行程序', '进近程序', '协同运行', '运行安全',
    '低空飞行服务', '通用机场运行', '运行限制', '运行管理',
    '通用航空经营许可', '运行许可', '联合审定'
  ],
  '机场': [
    '机场', '航站楼', '飞行区', '净空', '助航灯光', '机坪', '消防',
    '跑道', '滑行道', '停机位', '地面服务', '行李处理', '无障碍',
    '旅客航站区', '环境规划建设', '跑道侵入', '跑道安全', '跑道视程',
    '停机位置图', '机场图', '障碍物图', '精密进近地形图',
    '机场容量', '机场运行', '通用机场', '运输机场'
  ],
  '空中交通管理': [
    '空管', '管制', '导航', '通信', '监视', '情报', '气象', '流量', '航路',
    '进近', '雷达', '仪表', '平行跑道', '协同运行', '搜寻援救',
    '空域', '管制员', '塔台', '进近管制', '区域管制', '机场管制',
    '航行情报', '气象人员', '情报员', '空域容量', '最低引导高度',
    '空中交通管理监察员', '空域管理', '飞行程序设计', '民用航空情报员'
  ],
  '航空器制造与适航': [
    '适航', '审定', '航空器', '发动机', '零部件', '设计批准', 'PMA',
    '型号合格证', '生产许可证', '螺旋桨', '化学产品', '油料', '噪声',
    '制造', '生产', '型号合格', '生产许可', '设计批准', '持续适航',
    '适航指令', '适航审定', '型号审定', '生产审定'
  ],
  '维修': [
    '维修', '航材', '修理', '改装', '维修单位', '维修培训', '孔探检查',
    '存储管理', '飞行记录器', '分销商', '合格的航材', '维修人员执照',
    '维修单位合格审定', '维修培训机构', '维修监察员', '维修要求'
  ],
  '安全、安保与事故调查': [
    '安全', '安保', '事件', '危险品', '应急', '事故', '调查', '报告',
    '安全管理体系', 'SMS', '锂电池', '禁限带物品', '通行证', '安全信息',
    '主动报告', '机上应急处置', '危险品运输培训', '安全培训', '安全检查',
    '事件调查', '事故调查', '安全评估', '安全监察', '应急救援',
    '安全管理', '安全保卫', '安全生产', '示位发射机', '安全绩效',
    '安全信息报送', '安全改进', '点火源防护', '公共航空危险品运输'
  ],
  '行政管理': [
    '管理办法', '规定', '许可', '收费', '服务', '投诉', '价格', '统计',
    '数据', '档案', '政务服务', '企业', '经营', '航权', '销售代理',
    '数据共享', '数据管理', '招投标', '评标专家', '专家库', '质量检测',
    '名称管理', '收费行为', '新技术推广', '总承包', '有偿转让',
    '失信行为', '培训管理', '资质管理', '专用计量器具', '备案管理',
    '计量管理', '使用许可程序', '意见箱', '工作程序', '联合审定'
  ]
};

/**
 * 从文档编号中提取CCAR部号
 * @param {string} docNumber - 文档编号，如 "AC-121-FS-139", "AP-91-FS-2025-02R1"
 * @returns {string|null} - 提取的部号，如 "121", "91"
 */
function extractCCARNumber(docNumber) {
  if (!docNumber || typeof docNumber !== 'string') {
    return null;
  }

  // 匹配模式：AC-数字-、AP-数字-、IB-数字-、MD-数字- 等
  const patterns = [
    /^(?:AC|AP|IB|MD)-(\d+)-/i,  // AC-121-FS-139
    /^(?:AC|AP|IB|MD)-(\d+)(?:[A-Z]*)-/i,  // AC-67FS-001R2
    /^(?:AC|AP|IB|MD)-(\d+)$/i,  // AC-396-10R1 中的 396
    /CCAR-(\d+)/i  // 直接包含CCAR-数字的情况
  ];

  for (const pattern of patterns) {
    const match = docNumber.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * 根据负责司局和标题关键词进行模糊匹配
 * @param {string} officeUnit - 负责司局
 * @param {string} title - 文档标题
 * @param {string} docNumber - 文档编号
 * @returns {string|null} - 匹配的类别
 */
function fuzzyMatchByOfficeAndTitle(officeUnit, title, docNumber = '') {
  const titleLower = (title || '').toLowerCase();
  const docNumberLower = (docNumber || '').toLowerCase();
  
  // 首先根据负责司局匹配
  const officeKey = Object.keys(OFFICE_CATEGORY_MAP).find(key => 
    officeUnit && officeUnit.includes(key)
  );
  
  if (officeKey) {
    const possibleCategories = OFFICE_CATEGORY_MAP[officeKey];
    
    // 如果只有一个可能的类别，直接返回
    if (possibleCategories.length === 1) {
      return possibleCategories[0];
    }
    
    // 对于飞行标准司等多类别的情况，使用特殊逻辑
    if (officeKey === '飞行标准司') {
      // 首先检查文档编号模式（最高优先级）
      // IB-FS-OPS类文档明确是运行类
      if (docNumberLower.includes('ib-fs-ops') || docNumberLower.includes('ac-91-fs')) {
        return '运行';
      }
      
      // IB-FS-MED类文档需要特殊判断
      if (docNumberLower.includes('ib-fs-med')) {
        // 某些MED编号的文档实际上是运行操作指南，而非人员医学标准
        if (titleLower.includes('病媒生物') || titleLower.includes('防制') || 
            titleLower.includes('蚊虫') || titleLower.includes('鼠类') ||
            titleLower.includes('航空器') && (titleLower.includes('防制') || titleLower.includes('消毒'))) {
          return '运行';
        }
        return '航空人员';
      }
      
      // AC-67FS类文档明确是航空人员医学类
      if (docNumberLower.includes('ac-67fs')) {
        return '航空人员';
      }
      
      // AC-43、AC-145等维修相关文号
      if (docNumberLower.includes('ac-43') || docNumberLower.includes('ac-145') || 
          docNumberLower.includes('ac-147')) {
        return '维修';
      }
      
      // 根据标题内容进一步判断
      // 航空人员相关关键词（优先检查，避免误分类）
      if (titleLower.includes('体检') || titleLower.includes('医学') || 
          titleLower.includes('心理健康') || titleLower.includes('执照') ||
          titleLower.includes('鉴定') || titleLower.includes('标准实施细则') ||
          titleLower.includes('体检合格证') || titleLower.includes('体检鉴定档案')) {
        return '航空人员';
      }
      
      // 维修相关关键词
      if (titleLower.includes('维修') || titleLower.includes('航材') ||
          titleLower.includes('修理') || titleLower.includes('改装') ||
          titleLower.includes('维修监察员') || titleLower.includes('维修要求')) {
        return '维修';
      }
      
      // 运行相关关键词
      if (titleLower.includes('运行') || titleLower.includes('飞行') || 
          titleLower.includes('操作') || titleLower.includes('程序') ||
          titleLower.includes('导航') || titleLower.includes('qar') ||
          titleLower.includes('训练指南') || titleLower.includes('训练大纲') ||
          titleLower.includes('运行规则') || titleLower.includes('pbn') ||
          titleLower.includes('协同运行') || titleLower.includes('运行安全')) {
        return '运行';
      }
      
      // 默认情况下，偏向于运行类（因为运行类文档更多）
      return '运行';
    }
    
    // 对于其他司局，返回第一个可能的类别
    return possibleCategories[0];
  }
  
  // 全局文档编号模式匹配（优先于关键词匹配）
  // 危险品相关编号 - 只有明确的AC-276系列才归到安全类
  if (docNumberLower.includes('ac-276') || docNumberLower.includes('ap-276') ||
      docNumberLower.includes('ac-395') || docNumberLower.includes('ac-396') ||
      docNumberLower.includes('ac-398') || docNumberLower.includes('ac-399')) {
    return '安全、安保与事故调查';
  }
  
  // 危险品、应急、安全相关但不限于特定文号的通用判断
  if ((titleLower.includes('危险品') && !titleLower.includes('管理办法')) ||
      titleLower.includes('锂电池') || 
      (titleLower.includes('应急') && !titleLower.includes('管理办法')) ||
      (titleLower.includes('事故') && !titleLower.includes('管理办法'))) {
    return '安全、安保与事故调查';
  }
  
  // 机场相关编号
  if (docNumberLower.includes('ac-139') || docNumberLower.includes('ac-158') ||
      docNumberLower.includes('ac-137') || docNumberLower.includes('ac-138') ||
      docNumberLower.includes('ac-140') || docNumberLower.includes('ac-165')) {
    return '机场';
  }
  
  // 空管相关编号
  if (docNumberLower.includes('ac-93') || docNumberLower.includes('ac-98') ||
      docNumberLower.includes('ac-115') || docNumberLower.includes('ac-117') ||
      docNumberLower.includes('ac-118') || docNumberLower.includes('ac-175') ||
      docNumberLower.includes('ac-85') || docNumberLower.includes('ac-86')) {
    return '空中交通管理';
  }
  
  // 适航相关编号
  if (docNumberLower.includes('ac-21') || docNumberLower.includes('ac-23') ||
      docNumberLower.includes('ac-25') || docNumberLower.includes('ac-27') ||
      docNumberLower.includes('ac-29') || docNumberLower.includes('ac-33') ||
      docNumberLower.includes('ac-35') || docNumberLower.includes('ac-39') ||
      docNumberLower.includes('ac-26')) {
    return '航空器制造与适航';
  }
  
  // 航空人员相关编号
  if (docNumberLower.includes('ac-60') || docNumberLower.includes('ac-67') ||
      docNumberLower.includes('ac-61') || docNumberLower.includes('ac-65') ||
      docNumberLower.includes('ac-66') || docNumberLower.includes('ac-69')) {
    return '航空人员';
  }
  
  // 运行相关编号
  if (docNumberLower.includes('ac-91') || docNumberLower.includes('ac-121') ||
      docNumberLower.includes('ac-135') || docNumberLower.includes('ac-120')) {
    return '运行';
  }
  
  // 维修相关编号
  if (docNumberLower.includes('ac-43') || docNumberLower.includes('ac-145') ||
      docNumberLower.includes('ac-147')) {
    return '维修';
  }
  
  // 行政管理相关特殊判断（更精确的匹配）
  if ((titleLower.includes('管理办法') && !titleLower.includes('运行') && !titleLower.includes('安全') && !titleLower.includes('培训')) ||
      titleLower.includes('招投标') || titleLower.includes('评标专家') ||
      (titleLower.includes('收费') && !titleLower.includes('运行')) ||
      titleLower.includes('名称管理') || titleLower.includes('使用许可程序') ||
      titleLower.includes('联合审定工作程序') || titleLower.includes('备案管理') ||
      titleLower.includes('失信行为') || titleLower.includes('专用计量器具')) {
    return '行政管理';
  }
  
  // 如果司局匹配失败，使用全局关键词匹配
  for (const [category, keywords] of Object.entries(TITLE_KEYWORD_MAP)) {
    if (keywords.some(keyword => titleLower.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  return null;
}

/**
 * 对单个规范性文件进行分类
 * @param {Object} document - 规范性文件对象
 * @returns {Object} - 分类结果
 */
function classifyDocument(document) {
  const { doc_number, office_unit, title } = document;
  
  // 第一步：按部号精确匹配
  const ccarNumber = extractCCARNumber(doc_number);
  if (ccarNumber && CCAR_CATEGORY_MAP[ccarNumber]) {
    const mapping = CCAR_CATEGORY_MAP[ccarNumber];
    return {
      category: mapping.category,
      subcategory: mapping.subcategory,
      subcategoryName: mapping.name,
      method: 'exact_match',
      confidence: 'high',
      ccarNumber: ccarNumber
    };
  }
  
  // 第二步：按负责司局和标题关键词模糊匹配
  const fuzzyCategory = fuzzyMatchByOfficeAndTitle(office_unit, title, doc_number);
  if (fuzzyCategory) {
    return {
      category: fuzzyCategory,
      subcategory: '综合文件',
      subcategoryName: '综合文件',
      method: 'fuzzy_match',
      confidence: 'medium',
      ccarNumber: null
    };
  }
  
  // 第三步：手动归类（兜底）
  return {
    category: '待分类',
    subcategory: '待分类',
    subcategoryName: '待分类',
    method: 'manual_required',
    confidence: 'low',
    ccarNumber: null
  };
}

/**
 * 对规范性文件数据进行批量分类
 * @param {Object} normativeData - 规范性文件数据对象
 * @returns {Object} - 分类结果
 */
function classifyNormativeDocuments(normativeData) {
  const { documents } = normativeData;
  const classificationResults = {
    timestamp: new Date().toISOString(),
    total_documents: documents.length,
    classification_summary: {},
    classified_documents: {},
    statistics: {
      exact_match: 0,
      fuzzy_match: 0,
      manual_required: 0
    }
  };
  
  // 对每个文档进行分类
  documents.forEach(doc => {
    const classification = classifyDocument(doc);
    const { category, subcategory, method } = classification;
    
    // 统计分类方法
    classificationResults.statistics[method]++;
    
    // 初始化分类结构
    if (!classificationResults.classified_documents[category]) {
      classificationResults.classified_documents[category] = {};
    }
    if (!classificationResults.classified_documents[category][subcategory]) {
      classificationResults.classified_documents[category][subcategory] = [];
    }
    
    // 添加文档到对应分类
    classificationResults.classified_documents[category][subcategory].push({
      ...doc,
      classification: classification
    });
  });
  
  // 生成分类摘要
  Object.keys(classificationResults.classified_documents).forEach(category => {
    const subcategories = classificationResults.classified_documents[category];
    const totalInCategory = Object.values(subcategories).reduce((sum, docs) => sum + docs.length, 0);
    
    classificationResults.classification_summary[category] = {
      total_documents: totalInCategory,
      subcategories: Object.keys(subcategories).map(sub => ({
        name: sub,
        count: subcategories[sub].length
      }))
    };
  });
  
  return classificationResults;
}

/**
 * 生成分类报告
 * @param {Object} classificationResults - 分类结果
 * @returns {string} - 格式化的分类报告
 */
function generateClassificationReport(classificationResults) {
  const { classification_summary, statistics, total_documents } = classificationResults;
  
  let report = `# 规范性文件分类报告\n\n`;
  report += `**分类时间**: ${classificationResults.timestamp}\n`;
  report += `**文档总数**: ${total_documents}\n\n`;
  
  report += `## 分类方法统计\n`;
  report += `- 精确匹配（按部号）: ${statistics.exact_match} (${(statistics.exact_match/total_documents*100).toFixed(1)}%)\n`;
  report += `- 模糊匹配（按司局+关键词）: ${statistics.fuzzy_match} (${(statistics.fuzzy_match/total_documents*100).toFixed(1)}%)\n`;
  report += `- 需要手动分类: ${statistics.manual_required} (${(statistics.manual_required/total_documents*100).toFixed(1)}%)\n\n`;
  
  report += `## 分类结果概览\n\n`;
  
  Object.entries(classification_summary).forEach(([category, info]) => {
    report += `### ${category} (${info.total_documents}个文件)\n`;
    info.subcategories.forEach(sub => {
      report += `- ${sub.name}: ${sub.count}个文件\n`;
    });
    report += `\n`;
  });
  
  return report;
}

module.exports = {
  classifyDocument,
  classifyNormativeDocuments,
  generateClassificationReport,
  extractCCARNumber,
  fuzzyMatchByOfficeAndTitle,
  CCAR_CATEGORY_MAP,
  OFFICE_CATEGORY_MAP,
  TITLE_KEYWORD_MAP
};