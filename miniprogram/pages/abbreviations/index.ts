// 万能查询页面 - 包含缩写、定义、机场和通信
const dataManagerUtil = require('../../utils/data-manager.js')
const searchManagerModule = require('../../utils/search-manager.js')
const searchManager = searchManagerModule.searchManager
// 工具管理器将在需要时动态引入

Page({
  data: {
    // 🎯 基于Context7最佳实践：全局主题状态
    isDarkMode: false,
    
    // 当前选中的标签页
    activeTab: 'abbreviations',
    
    // 缩写数据相关
    abbreviations: [],
    abbreviationGroups: [],
    filteredAbbreviations: [],
    currentLetterAbbreviations: [],
    selectedLetter: '',
    selectedCategoryName: '',
    showAbbreviationGroups: true,
    abbreviationSearchValue: '',
    
    // 定义数据相关
    definitions: [],
    definitionGroups: [],
    filteredDefinitions: [],
    currentLetterDefinitions: [],
    selectedDefinitionLetter: '',
    selectedDefinitionCategoryName: '',
    showDefinitionGroups: true,
    definitionSearchValue: '',
    
    // 机场数据相关
    airports: [],
    airportGroups: [],
    filteredAirports: [],
    currentLetterAirports: [],
    selectedAirportLetter: '',
    selectedAirportCategoryName: '',
    showAirportGroups: true,
    airportSearchValue: '',
    
    // 通信数据相关
    communications: [],
    communicationGroups: [],
    filteredCommunications: [],
    currentChapterCommunications: [],
    selectedChapter: '',
    selectedChapterName: '',
    showCommunicationGroups: true,
    communicationSearchValue: '',
    communicationsLoading: false,
    
    // 规章数据相关
    normativeDocuments: [],
    validityFilter: 'all', // 新增：有效性筛选，默认显示全部
    
    // 搜索防抖相关
    searchTimer: null,
    searchDelay: 300, // 300ms防抖延迟
    
    // 搜索相关
    searchValue: '',
    filteredList: [],
    
    
    // 规范性文件相关数据
    normativeSearchValue: '',
    filteredNormativeDocuments: [],
    normativeCategories: [],
    normativeSubcategories: [],
    normativeStatistics: {},
    ccarRegulation: null,
    showNormativeSearch: false,
    showNormativeCategoryDetail: false,
    showNormativeDocumentList: false,
    selectedNormativeCategory: '',
    selectedNormativeSubcategory: '',
    normativeLoading: false,
    
    // 规章字母分组相关
    showNormativeGroups: true,
    selectedNormativeLetter: '',
    normativeGroups: [],
    currentLetterNormatives: [],

    // 🎯 基于Context7最佳实践：广告相关数据
    showAd: false,
    adUnitId: '',
    userPreferences: { reduceAds: false },
    
    // 多层级广告支持
    showTopAd: false,
    topAdUnitId: '',
    showSearchResultsAd: false,
    searchResultsAdUnitId: '',
    showLetterGroupsAd: false,
    letterGroupsAdUnitId: '',

    showMiddleAd: false,
    middleAdUnitId: '',
    showDetailViewAd: false,
    detailViewAdUnitId: '',
    // 新增：字母分组中间广告
    showGroupMiddleAd: false,
    groupMiddleAdUnitId: '',
    // 新增：缩写条目页面顶部广告

    // 新增：R和S字母之间的广告位
    showRSMiddleAd: false,
    rsMiddleAdUnitId: '',
    // 新增：S和T字母之间的广告位
    showSTMiddleAd: false,
    stMiddleAdUnitId: '',
    // 新增：定义页面I和J字母之间的广告位
    showDefinitionIJMiddleAd: false,
    definitionIJMiddleAdUnitId: '',
    // 新增：定义页面底部广告位
    showDefinitionBottomAd: false,
    definitionBottomAdUnitId: '',
    // 新增：机场页面M和N字母之间的广告位
    showAirportMNMiddleAd: false,
    airportMNMiddleAdUnitId: '',
    // 新增：机场页面底部广告位
    showAirportBottomAd: false,
    airportBottomAdUnitId: '',
    // 新增：通信页面"其他术语"和"爆炸物威胁"之间的广告位
    showCommunicationMiddleAd: false,
    communicationMiddleAdUnitId: '',
    // 新增：通信页面底部广告位
    showCommunicationBottomAd: false,
    communicationBottomAdUnitId: '',
    // 新增：规章页面底部广告位
    showNormativeBottomAd: false,
    normativeBottomAdUnitId: ''
  },

  onLoad() {
    // Context7调试：检查运行环境和警告处理
    console.log('🔍 万能查询页面开始加载...')
          // 🎯 基于Context7最佳实践：使用兼容的方式获取系统信息
      try {
        console.log('📱 运行环境: WeChat MiniProgram')
      } catch (error) {
        console.log('📱 运行环境: WeChat MiniProgram (获取详细信息失败)')
      }
    
    // 🎯 新增：初始化全局主题管理器
    try {
      const themeManager = require('../../utils/theme-manager.js');
      this.themeCleanup = themeManager.initPageTheme(this);
      console.log('🌙 万能查询页面主题初始化完成');
    } catch (error) {
      console.warn('⚠️ 主题管理器初始化失败:', error);
    }
    
    // 处理SharedArrayBuffer警告（不影响功能）
    if (typeof globalThis !== 'undefined' && globalThis.SharedArrayBuffer) {
      console.log('⚠️ SharedArrayBuffer可用，但Chrome可能显示安全警告（不影响功能）')
    }
    
    // Context7性能监控 - 开始监控
    console.log('📊 启动字母分组性能监控...')
    const loadStartTime = Date.now()
    
    // 内存使用情况监控
    const app = getApp()
    try {
      if (wx.getPerformance) {
        console.log('💾 性能监控可用')
      }
    } catch (error) {
      console.log('💾 内存信息获取失败，继续执行')
    }
    
    // 检查是否有预加载的数据
    const isPreloaded = app.isDataPreloaded()
    
    if (isPreloaded) {
      console.log('🚀 检测到预加载数据，快速加载中...')
    } else {
      console.log('📥 开始正常加载数据...')
    }
    
    // 调试：检查积分系统和扣费规则
    const pointsManager = require('../../utils/points-manager.js')
    const buttonChargeManagerUtil = require('../../utils/button-charge-manager.js')
    console.log('💰 当前积分:', pointsManager.getCurrentPoints())
    console.log('🔍 搜索按钮扣费规则:', {
      'abbreviations-search': buttonChargeManagerUtil.getButtonCost('abbreviations-search'),
      'definitions-search': buttonChargeManagerUtil.getButtonCost('definitions-search'),
      'airports-search': buttonChargeManagerUtil.getButtonCost('airports-search'),
      'communications-search': buttonChargeManagerUtil.getButtonCost('communications-search'),
      'normative-search': buttonChargeManagerUtil.getButtonCost('normative-search')
    })
    
    // 开始数据加载
    const dataLoadPromises = [
      this.loadAbbreviations(),
      this.loadDefinitions(), 
      this.loadAirports(),
      this.loadCommunications(),
      this.loadNormativeDocuments()
    ]

    // 🎯 基于Context7最佳实践：初始化广告
    this.loadUserPreferences()
    this.initAd()
    
    // 性能统计
    Promise.all(dataLoadPromises).then(() => {
      const loadEndTime = Date.now()
      const loadDuration = loadEndTime - loadStartTime
      
      console.log('🎯 字母分组加载完成:', {
        duration: loadDuration + 'ms',
        abbreviationGroups: this.data.abbreviationGroups.length,
        memoryOptimized: true
      })
      
      // Context7推荐：检查分组效果
      const largeGroups = this.data.abbreviationGroups.filter(g => g.count > 50)
      console.log('📈 性能分析: ' + largeGroups.length + '个大组(>50条)已智能分割，内存使用优化')
    }).catch(error => {
      console.error('🚫 数据加载失败:', error)
    })
  },

  // Context7页面显示监控
  onShow() {
    console.log('🔄 万能查询页面显示')
    
    // 🎯 新增：重新应用主题，确保导航栏颜色正确
    try {
      const themeManager = require('../../utils/theme-manager.js');
      themeManager.applyThemeToPage(this);
      console.log('🌙 万能查询页面主题已重新应用');
    } catch (error) {
      console.warn('⚠️ 重新应用主题失败:', error);
    }
    
    // Context7页面状态监控
    const pageStatus = {
      activeTab: this.data.activeTab,
      abbreviationsReady: this.data.abbreviationsIndexReady,
      searchValue: this.data.searchValue,
      hasData: (this.data.abbreviations && this.data.abbreviations.length > 0) || false
    }
    console.log('📊 页面状态:', pageStatus)
    
    // 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        console.log('🌐 网络状态:', res.networkType)
        if (res.networkType === 'none') {
          console.log('⚠️ 离线模式：使用本地缓存数据')
        }
      }
    })
  },

  // Context7页面隐藏监控
  onHide() {
    console.log('🔄 万能查询页面隐藏')
    
    // 清理搜索状态
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }
  },

  onUnload() {
    // 🎯 新增：清理主题监听器
    if (this.themeCleanup && typeof this.themeCleanup === 'function') {
      try {
        this.themeCleanup();
        console.log('🌙 万能查询页面主题监听器已清理');
      } catch (error) {
        console.warn('⚠️ 清理主题监听器时出错:', error);
      }
    }
    
    // 清理定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }
    
    // 清理搜索缓存
    searchManager.clearCache()
    console.log('🧹 页面卸载，已清理搜索相关资源')
  },

  // 加载缩写数据
  async loadAbbreviations() {
    try {
      console.log('开始加载缩写数据...')
      
      // Context7错误处理：检查数据管理器是否可用
      if (!dataManagerUtil || typeof dataManagerUtil.loadAbbreviationsData !== 'function') {
        console.error('❌ 数据管理器不可用')
        wx.showToast({
          title: '数据加载模块异常',
          icon: 'none'
        })
        return
      }
      
      const abbreviationsData = await dataManagerUtil.loadAbbreviationsData()
      
      if (!abbreviationsData || !Array.isArray(abbreviationsData)) {
        console.error('❌ 缩写数据格式异常:', abbreviationsData)
        wx.showToast({
          title: '数据格式异常，请重试',
          icon: 'none'
        })
        return
      }
      
      // 创建字母分组
      const groups = this.createAbbreviationGroups(abbreviationsData)
      
      this.setData({
        abbreviationsList: abbreviationsData,
        abbreviationGroups: groups,
        showAbbreviationGroups: true,
        filteredList: [] // 初始不显示所有数据
      })
      console.log('缩写数据加载成功，共' + abbreviationsData.length + '条，分为' + groups.length + '个字母组')
      
      // 创建搜索索引
      searchManager.createAbbreviationIndex(abbreviationsData)
      this.setData({ abbreviationsIndexReady: true })
      
    } catch (error) {
      console.error('❌ 缩写数据加载失败:', error)
      
      // Context7用户体验：提供友好的错误提示
      wx.showModal({
        title: '数据加载失败',
        content: '网络连接异常或数据损坏，请检查网络后重试',
        showCancel: true,
        cancelText: '稍后重试',
        confirmText: '立即重试',
        success: (res) => {
          if (res.confirm) {
            this.loadAbbreviations() // 重新加载
          }
        }
      })
    }
  },

  // 创建缩写字母分组 - ES5兼容版本
  createAbbreviationGroups(abbreviationsData) {
    const groups = {}
    
    // 按首字母分组
    abbreviationsData.forEach(item => {
      if (item.abbreviation) {
        const firstLetter = item.abbreviation.charAt(0).toUpperCase()
        if (!groups[firstLetter]) {
          groups[firstLetter] = {
            letter: firstLetter,
            count: 0,
            items: []
          }
        }
        groups[firstLetter].items.push(item)
        groups[firstLetter].count++
      }
    })
    
    // 转换为数组并排序 - ES5兼容版本
    const groupArray = []
    for (const key in groups) {
      if (groups.hasOwnProperty(key)) {
        groupArray.push(groups[key])
      }
    }
    groupArray.sort((a, b) => {
      return a.letter.localeCompare(b.letter)
    })
    
    console.log('缩写字母分组统计:', groupArray.map((g) => 
      g.letter + ': ' + g.count + '条'
    ).join(', '))
    
    return groupArray
  },



  // 加载定义数据
  async loadDefinitions() {
    try {
      console.log('开始加载定义数据...')
      const definitionsData = await dataManagerUtil.loadDefinitionsData()
      
      // 创建字母分组
      const groups = this.createDefinitionGroups(definitionsData)
      
      this.setData({
        definitionsList: definitionsData,
        definitionGroups: groups,
        showDefinitionGroups: true,
        filteredDefinitions: [] // 初始不显示所有数据
      })
      console.log('定义数据加载成功，共' + definitionsData.length + '条，分为' + groups.length + '个字母组')
      
      // 创建搜索索引
      searchManager.createDefinitionIndex(definitionsData)
      this.setData({ definitionsIndexReady: true })
    } catch (error) {
      console.error('加载定义数据失败:', error)
      this.setData({
        definitionsList: [],
        definitionGroups: [],
        filteredDefinitions: [],
        definitionsIndexReady: false
      })
    }
  },

  // 创建定义字母分组（按拼音首字母）- ES5兼容版本
  createDefinitionGroups(definitionsData) {
    const groups = {}
    
    // 按拼音首字母分组
    definitionsData.forEach(item => {
      if (item.chinese_name) {
        const firstLetter = this.getPinyinFirstLetter(item.chinese_name)
        if (!groups[firstLetter]) {
          groups[firstLetter] = {
            letter: firstLetter,
            count: 0,
            items: []
          }
        }
        groups[firstLetter].items.push(item)
        groups[firstLetter].count++
      }
    })
    
    // 转换为数组并排序 - ES5兼容版本
    const groupArray = []
    for (const key in groups) {
      if (groups.hasOwnProperty(key)) {
        groupArray.push(groups[key])
      }
    }
    groupArray.sort((a, b) => {
      return a.letter.localeCompare(b.letter)
    })
    
    console.log('定义字母分组统计:', groupArray.map((g) => g.letter + ': ' + g.count + '条').join(', '))
    
    return groupArray
  },

  // 获取中文拼音首字母
  getPinyinFirstLetter(chinese) {
    if (!chinese) return 'Z'
    
    const firstChar = chinese.charAt(0)
    const code = firstChar.charCodeAt(0)
    
    // 数字开头的归到 # 组
    if (code >= 48 && code <= 57) {
      return '#'
    }
    
    // 英文字母直接返回
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      return firstChar.toUpperCase()
    }
    
    // 中文字符的拼音首字母映射（简化版）
    const pinyinMap = {
      '安': 'A', '按': 'A', '案': 'A', '暗': 'A', '岸': 'A',
      '白': 'B', '百': 'B', '班': 'B', '板': 'B', '半': 'B', '办': 'B', '帮': 'B', '包': 'B', '保': 'B', '报': 'B', '备': 'B', '背': 'B', '本': 'B', '比': 'B', '标': 'B', '表': 'B', '别': 'B', '并': 'B', '病': 'B', '播': 'B', '不': 'B', '部': 'B', '步': 'B',
      '测': 'C', '层': 'C', '查': 'C', '差': 'C', '常': 'C', '场': 'C', '车': 'C', '成': 'C', '程': 'C', '持': 'C', '出': 'C', '处': 'C', '传': 'C', '船': 'C', '创': 'C', '次': 'C', '从': 'C', '存': 'C', '错': 'C',
      '大': 'D', '带': 'D', '单': 'D', '当': 'D', '导': 'D', '到': 'D', '得': 'D', '的': 'D', '地': 'D', '第': 'D', '点': 'D', '电': 'D', '调': 'D', '定': 'D', '动': 'D', '度': 'D', '对': 'D', '多': 'D',
      '而': 'E', '二': 'E',
      '发': 'F', '法': 'F', '反': 'F', '范': 'F', '方': 'F', '防': 'F', '房': 'F', '放': 'F', '非': 'F', '费': 'F', '分': 'F', '风': 'F', '服': 'F', '符': 'F', '负': 'F', '复': 'F', '副': 'F',
      '改': 'G', '概': 'G', '干': 'G', '感': 'G', '高': 'G', '告': 'G', '个': 'G', '给': 'G', '根': 'G', '更': 'G', '工': 'G', '公': 'G', '功': 'G', '供': 'G', '共': 'G', '关': 'G', '管': 'G', '规': 'G', '国': 'G', '过': 'G',
      '还': 'H', '海': 'H', '含': 'H', '好': 'H', '号': 'H', '合': 'H', '和': 'H', '黑': 'H', '很': 'H', '红': 'H', '后': 'H', '候': 'H', '护': 'H', '化': 'H', '话': 'H', '坏': 'H', '环': 'H', '换': 'H', '回': 'H', '会': 'H', '活': 'H', '火': 'H', '或': 'H', '获': 'H',
      '机': 'J', '基': 'J', '及': 'J', '级': 'J', '即': 'J', '极': 'J', '集': 'J', '几': 'J', '计': 'J', '记': 'J', '技': 'J', '际': 'J', '继': 'J', '加': 'J', '家': 'J', '价': 'J', '架': 'J', '间': 'J', '监': 'J', '检': 'J', '见': 'J', '建': 'J', '健': 'J', '将': 'J', '交': 'J', '教': 'J', '接': 'J', '结': 'J', '解': 'J', '界': 'J', '金': 'J', '进': 'J', '近': 'J', '经': 'J', '精': 'J', '九': 'J', '就': 'J', '局': 'J', '具': 'J', '决': 'J', '军': 'J',
      '开': 'K', '看': 'K', '考': 'K', '可': 'K', '客': 'K', '空': 'K', '口': 'K', '快': 'K', '宽': 'K', '况': 'K',
      '来': 'L', '蓝': 'L', '类': 'L', '老': 'L', '了': 'L', '理': 'L', '里': 'L', '力': 'L', '立': 'L', '利': 'L', '连': 'L', '联': 'L', '量': 'L', '两': 'L', '亮': 'L', '列': 'L', '临': 'L', '零': 'L', '领': 'L', '另': 'L', '流': 'L', '六': 'L', '路': 'L', '率': 'L', '绿': 'L', '论': 'L', '落': 'L',
      '马': 'M', '满': 'M', '慢': 'M', '忙': 'M', '没': 'M', '每': 'M', '美': 'M', '门': 'M', '们': 'M', '米': 'M', '面': 'M', '民': 'M', '明': 'M', '名': 'M', '模': 'M', '目': 'M',
      '那': 'N', '哪': 'N', '内': 'N', '能': 'N', '你': 'N', '年': 'N', '鸟': 'N', '您': 'N', '农': 'N', '努': 'N',
      '欧': 'O',
      '排': 'P', '判': 'P', '跑': 'P', '配': 'P', '批': 'P', '片': 'P', '平': 'P', '评': 'P', '破': 'P', '普': 'P',
      '其': 'Q', '期': 'Q', '气': 'Q', '汽': 'Q', '前': 'Q', '强': 'Q', '情': 'Q', '请': 'Q', '清': 'Q', '区': 'Q', '取': 'Q', '去': 'Q', '全': 'Q', '确': 'Q', '群': 'Q',
      '然': 'R', '让': 'R', '人': 'R', '认': 'R', '任': 'R', '日': 'R', '如': 'R', '入': 'R', '软': 'R',
      '三': 'S', '色': 'S', '杀': 'S', '山': 'S', '商': 'S', '上': 'S', '少': 'S', '设': 'S', '社': 'S', '身': 'S', '深': 'S', '什': 'S', '生': 'S', '声': 'S', '省': 'S', '时': 'S', '十': 'S', '实': 'S', '使': 'S', '始': 'S', '是': 'S', '事': 'S', '市': 'S', '试': 'S', '收': 'S', '手': 'S', '首': 'S', '受': 'S', '书': 'S', '数': 'S', '水': 'S', '说': 'S', '思': 'S', '死': 'S', '四': 'S', '送': 'S', '搜': 'S', '速': 'S', '算': 'S', '随': 'S', '所': 'S',
      '他': 'T', '她': 'T', '它': 'T', '台': 'T', '太': 'T', '谈': 'T', '特': 'T', '提': 'T', '题': 'T', '体': 'T', '天': 'T', '条': 'T', '听': 'T', '停': 'T', '通': 'T', '同': 'T', '统': 'T', '头': 'T', '图': 'T', '土': 'T', '团': 'T', '推': 'T', '退': 'T', '脱': 'T', '拖': 'T',
      '外': 'W', '完': 'W', '万': 'W', '王': 'W', '网': 'W', '往': 'W', '忘': 'W', '危': 'W', '为': 'W', '位': 'W', '未': 'W', '文': 'W', '问': 'W', '我': 'W', '无': 'W', '五': 'W', '物': 'W', '务': 'W',
      '西': 'X', '希': 'X', '系': 'X', '细': 'X', '下': 'X', '先': 'X', '现': 'X', '线': 'X', '限': 'X', '相': 'X', '想': 'X', '向': 'X', '项': 'X', '小': 'X', '效': 'X', '些': 'X', '新': 'X', '信': 'X', '形': 'X', '性': 'X', '修': 'X', '需': 'X', '许': 'X', '选': 'X', '学': 'X', '训': 'X', '寻': 'X',
      '压': 'Y', '亚': 'Y', '严': 'Y', '研': 'Y', '眼': 'Y', '演': 'Y', '验': 'Y', '样': 'Y', '要': 'Y', '也': 'Y', '业': 'Y', '页': 'Y', '夜': 'Y', '一': 'Y', '医': 'Y', '以': 'Y', '已': 'Y', '意': 'Y', '因': 'Y', '音': 'Y', '银': 'Y', '应': 'Y', '用': 'Y', '由': 'Y', '有': 'Y', '又': 'Y', '右': 'Y', '于': 'Y', '与': 'Y', '语': 'Y', '预': 'Y', '员': 'Y', '原': 'Y', '远': 'Y', '约': 'Y', '月': 'Y', '越': 'Y', '云': 'Y', '运': 'Y',
      '在': 'Z', '早': 'Z', '增': 'Z', '怎': 'Z', '展': 'Z', '站': 'Z', '战': 'Z', '张': 'Z', '找': 'Z', '照': 'Z', '者': 'Z', '这': 'Z', '真': 'Z', '正': 'Z', '政': 'Z', '之': 'Z', '知': 'Z', '直': 'Z', '只': 'Z', '指': 'Z', '制': 'Z', '质': 'Z', '中': 'Z', '种': 'Z', '重': 'Z', '周': 'Z', '主': 'Z', '住': 'Z', '注': 'Z', '专': 'Z', '转': 'Z', '装': 'Z', '状': 'Z', '准': 'Z', '资': 'Z', '自': 'Z', '字': 'Z', '总': 'Z', '走': 'Z', '组': 'Z', '作': 'Z', '做': 'Z', '座': 'Z'
    }
    
    // 查找映射表
    if (pinyinMap[firstChar]) {
      return pinyinMap[firstChar]
    }
    
    // 如果没有找到映射，使用Unicode范围判断
    if (code >= 0x4e00 && code <= 0x9fff) {
      // 中文字符，根据Unicode范围粗略判断
      if (code >= 0x4e00 && code <= 0x4fff) return 'A'
      if (code >= 0x5000 && code <= 0x5fff) return 'B'
      if (code >= 0x6000 && code <= 0x6fff) return 'C'
      if (code >= 0x7000 && code <= 0x7fff) return 'D'
      if (code >= 0x8000 && code <= 0x8fff) return 'E'
      if (code >= 0x9000 && code <= 0x9fff) return 'F'
    }
    
    return 'Z' // 默认归到Z组
  },

  // 加载机场数据
  async loadAirports() {
    try {
      console.log('开始加载机场数据...')
      const airportsData = await dataManagerUtil.loadAirportData()
      
      // 创建字母分组
      const groups = this.createAirportGroups(airportsData)
      
      this.setData({
        airportsList: airportsData,
        airportGroups: groups,
        showAirportGroups: true,
        filteredAirports: [] // 初始不显示所有数据
      })
      console.log('机场数据加载成功，共' + airportsData.length + '条，分为' + groups.length + '个字母组')
      
      // 创建搜索索引
      searchManager.createAirportIndex(airportsData)
      this.setData({ airportsIndexReady: true })
    } catch (error) {
      console.error('加载机场数据失败:', error)
      this.setData({
        airportsList: [],
        airportGroups: [],
        filteredAirports: [],
        airportsIndexReady: false
      })
    }
  },

  // 创建机场字母分组 - ES5兼容版本
  createAirportGroups(airportsData) {
    const groups = {}
    
    // 按ICAO代码首字母分组
    airportsData.forEach(item => {
      if (item.ICAOCode) {
        const firstLetter = item.ICAOCode.charAt(0).toUpperCase()
        if (!groups[firstLetter]) {
          groups[firstLetter] = {
            letter: firstLetter,
            count: 0,
            items: []
          }
        }
        groups[firstLetter].items.push(item)
        groups[firstLetter].count++
      }
    })
    
    // 转换为数组并排序 - ES5兼容版本
    const groupArray = []
    for (const key in groups) {
      if (groups.hasOwnProperty(key)) {
        groupArray.push(groups[key])
      }
    }
    groupArray.sort((a, b) => {
      return a.letter.localeCompare(b.letter)
    })
    
    console.log('机场字母分组统计:', groupArray.map((g) => g.letter + ': ' + g.count + '条').join(', '))
    
    return groupArray
  },

  // 加载通信数据
  async loadCommunications() {
    this.setData({ communicationsLoading: true })
    
    try {
      console.log('开始加载ICAO通信数据...')
      const icaoData = await dataManagerUtil.loadIcaoData()
      
      // 处理ICAO数据，按章节分组 - ES5兼容版本
      const chapters = []
      const allSentences = []
      const chapterMap = {}
      
      icaoData.forEach((item) => {
        // 添加到所有句子列表
        allSentences.push(item)
        
        // 按章节分组
        if (!chapterMap[item.chapter]) {
          const chapterData = {
            name: item.chapter,
            sentences: []
          }
          chapterMap[item.chapter] = chapterData
          chapters.push(chapterData)
        }
        chapterMap[item.chapter].sentences.push(item)
      })
      
      // 创建字母分组（按章节分组）
      const groups = this.createCommunicationGroups(chapters)
      
      this.setData({
        communicationsList: allSentences,
        communicationGroups: groups,
        icaoChapters: chapters,
        showCommunicationGroups: true,
        filteredCommunications: [], // 初始不显示所有数据
        communicationsLoading: false
      })
      
      console.log('ICAO数据加载成功，共' + allSentences.length + '句，' + chapters.length + '个章节，分为' + groups.length + '个分组')
      
      // 创建搜索索引
      searchManager.createCommunicationIndex(allSentences)
      this.setData({ communicationsIndexReady: true })
    } catch (error) {
      console.error('加载通信数据失败:', error)
      this.setData({
        communicationsList: [],
        communicationGroups: [],
        filteredCommunications: [],
        icaoChapters: [],
        communicationsLoading: false,
        communicationsIndexReady: false
      })
    }
  },

  // 创建通信字母分组（按章节分组）
  createCommunicationGroups(chapters) {
    const groups = []
    
    // 按章节创建分组
    chapters.forEach(chapter => {
      // 检查是否是特情词汇章节
      const isEmergencyChapter = chapter.name.includes('爆炸物威胁') || 
                                 chapter.name.includes('操纵系统故障') || 
                                 chapter.name.includes('电力系统故障') ||
                                 chapter.name.includes('发动机故障') ||
                                 chapter.name.includes('除/防冰系统故障') ||
                                 chapter.name.includes('风挡问题') ||
                                 chapter.name.includes('空中失火') ||
                                 chapter.name.includes('劫机') ||
                                 chapter.name.includes('雷达失效') ||
                                 chapter.name.includes('起落架问题') ||
                                 chapter.name.includes('燃油问题') ||
                                 chapter.name.includes('防疫') ||
                                 chapter.name.includes('鸟击') ||
                                 chapter.name.includes('烟雾') ||
                                 chapter.name.includes('中断起飞') ||
                                 chapter.name.includes('应急撤离')
      
      if (isEmergencyChapter) {
        // 特情词汇章节
        const emergencyNumber = chapter.name.split('.')[0] // 提取数字编号
        groups.push({
          letter: emergencyNumber, // 显示数字编号
          displayName: chapter.name, // 完整章节名称
          chapterTitle: chapter.name, // 章节主题
          count: chapter.sentences.length,
          items: chapter.sentences,
          chapterData: chapter,
          isEmergency: true // 标记为特情词汇
        })
      } else {
        // 常规ICAO章节
        const chapterMatch = chapter.name.match(/第([一二三四五六七八九十]+)章/)
        const chapterNumber = chapterMatch ? chapterMatch[1] : chapter.name.charAt(0)
        
        // 提取章节主题（去掉"第X章"部分）
        const chapterTitle = chapter.name.replace(/^第[一二三四五六七八九十]+章\s*/, '')
        
        groups.push({
          letter: chapterNumber, // 显示章节编号（一、二、三等）
          displayName: chapter.name, // 完整章节名称
          chapterTitle: chapterTitle, // 章节主题
          count: chapter.sentences.length,
          items: chapter.sentences,
          chapterData: chapter,
          isEmergency: false // 标记为普通ICAO
        })
      }
    })
    
    // 按章节顺序排序（保持原有顺序）
    console.log('通信章节分组统计:', groups.map(g => g.displayName + ': ' + g.count + '句').join(', '))
    
    return groups
  },

  // 选项卡切换
  onTabChange(event) {
    this.setData({
      activeTab: event.detail.name
    })
  },

  // 缩写搜索相关方法
  onSearch(event) {
    const searchValue = this.data.searchValue || ''
    
    console.log('🔍 缩写搜索按钮点击，搜索内容:', searchValue)
    console.log('💰 搜索前积分:', require('../../utils/points-manager.js').getCurrentPoints())
    
    // 使用扣费管理器执行搜索，需要2积分
    const buttonChargeManagerUtil = require('../../utils/button-charge-manager.js');
    buttonChargeManagerUtil.executeSearchWithCharge(
      'abbreviations-search',
      searchValue,
      '缩写搜索',
      () => {
        console.log('✅ 扣费成功，执行搜索')
        console.log('💰 搜索后积分:', require('../../utils/points-manager.js').getCurrentPoints())
        this.performAbbreviationSearch(searchValue)
      }
    )
  },

  onSearchChange(event) {
    const searchValue = event.detail
    this.setData({ searchValue })
    
    // 如果搜索值为空，返回字母分组视图
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredList: [],
        showAbbreviationGroups: true,
        selectedAbbreviationLetter: '',
        currentLetterAbbreviations: []
      })
    }
  },

  onSearchClear() {
    // 清除定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }
    
    // 如果在搜索状态，返回到字母分组视图
    this.setData({
      searchValue: '',
      filteredList: [],
      showAbbreviationGroups: true,
      selectedAbbreviationLetter: '',
      currentLetterAbbreviations: [],
      searchTimer: null
    })
  },

  // 选择字母分组 - 支持三级导航
  onAbbreviationLetterTap(event) {
    const letter = event.currentTarget.dataset.letter
    let group = null;
    for (let i = 0; i < this.data.abbreviationGroups.length; i++) {
      if (this.data.abbreviationGroups[i].letter === letter) {
        group = this.data.abbreviationGroups[i];
        break;
      }
    }
    
    if (group) {
      console.log('🔤 选择字母组 ' + letter + '，包含 ' + group.count + ' 条缩写')
      
      this.setData({
        selectedAbbreviationLetter: letter,
        showAbbreviationGroups: false,
        showAbbreviationItems: true,
        currentLetterAbbreviations: group.items,
        filteredList: group.items
      })
    }
  },

  // 注意：onAbbreviationSubGroupTap 和 backToAbbreviationSubGroups 方法已移除
  // 因为现在使用简化的二级结构，不再需要子分组功能

  // 返回字母分组列表
  backToAbbreviationGroups() {
    console.log('🔙 点击返回字母列表按钮')
    this.setData({
      showAbbreviationGroups: true,
      showAbbreviationItems: false,
      selectedAbbreviationLetter: '',
      currentLetterAbbreviations: [],
      filteredList: [],
      searchValue: ''
    }, () => {
      console.log('✅ 已返回到字母分组列表')
    })
  },

  // 执行缩写搜索（高性能版本）
  performAbbreviationSearch(searchValue) {
    if (!searchValue || !searchValue.trim()) {
      // 搜索为空时，返回字母分组视图
      this.setData({
        filteredList: [],
        showAbbreviationGroups: true,
        showAbbreviationItems: false,
        selectedAbbreviationLetter: '',
        currentLetterAbbreviations: []
      })
      return
    }

    // 搜索时隐藏所有分组界面，显示搜索结果
    this.setData({
      showAbbreviationGroups: false,
      showAbbreviationItems: false,
      selectedAbbreviationLetter: '',
      currentLetterAbbreviations: []
    })

    // 如果索引还未准备好，使用传统搜索
    if (!this.data.abbreviationsIndexReady) {
      this.fallbackAbbreviationSearch(searchValue)
      return
    }

    try {
      const startTime = Date.now()
      const results = searchManager.searchAbbreviations(searchValue, 100)
      const endTime = Date.now()
      
      console.log('🚀 缩写高性能搜索完成: "' + searchValue + '" -> ' + results.length + '条结果, 耗时' + (endTime - startTime) + 'ms')
      
      this.setData({
        filteredList: results
      })
    } catch (error) {
      console.error('高性能搜索失败，使用传统搜索:', error)
      this.fallbackAbbreviationSearch(searchValue)
    }
  },

  // 传统搜索作为兜底
  fallbackAbbreviationSearch(searchValue) {
    const filtered = this.data.abbreviationsList.filter(item => {
      const searchLower = searchValue.toLowerCase()
      return (item.abbreviation && item.abbreviation.toLowerCase().indexOf(searchLower) !== -1) ||
             (item.english_full && item.english_full.toLowerCase().indexOf(searchLower) !== -1) ||
             (item.chinese_translation && item.chinese_translation.toLowerCase().indexOf(searchLower) !== -1)
    })

    this.setData({
      filteredList: filtered,
      showAbbreviationGroups: false,
      showAbbreviationItems: false,
      selectedAbbreviationLetter: '',
      currentLetterAbbreviations: []
    })
  },

  // 定义搜索相关方法
  onDefinitionSearch(event) {
    const searchValue = this.data.definitionSearchValue || ''
    
    // 使用扣费管理器执行搜索，需要2积分
    const buttonChargeManagerUtil = require('../../utils/button-charge-manager.js');
    buttonChargeManagerUtil.executeSearchWithCharge(
      'definitions-search',
      searchValue,
      '定义搜索',
      () => {
        this.performDefinitionSearch(searchValue)
      }
    )
  },

  onDefinitionSearchChange(event) {
    const searchValue = event.detail
    this.setData({ definitionSearchValue: searchValue })
    
    // 如果搜索值为空，返回字母分组视图
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredDefinitions: [],
        showDefinitionGroups: true,
        selectedDefinitionLetter: '',
        currentLetterDefinitions: []
      })
    }
  },

  onDefinitionSearchClear() {
    // 清除定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }
    
    // 如果在搜索状态，返回到字母分组视图
    this.setData({
      definitionSearchValue: '',
      filteredDefinitions: [],
      showDefinitionGroups: true,
      selectedDefinitionLetter: '',
      currentLetterDefinitions: [],
      searchTimer: null
    })
  },

  // 选择定义字母分组
  onDefinitionLetterTap(event) {
    const letter = event.currentTarget.dataset.letter
    let group = null;
    for (let i = 0; i < this.data.definitionGroups.length; i++) {
      if (this.data.definitionGroups[i].letter === letter) {
        group = this.data.definitionGroups[i];
        break;
      }
    }
    
    if (group) {
      console.log('选择定义字母组 ' + letter + '，包含 ' + group.count + ' 个定义')
      this.setData({
        selectedDefinitionLetter: letter,
        currentLetterDefinitions: group.items,
        showDefinitionGroups: false,
        filteredDefinitions: group.items
      })
    }
  },

  // 返回定义字母分组列表
  backToDefinitionGroups() {
    console.log('🔙 点击返回定义字母列表按钮')
    this.setData({
      showDefinitionGroups: true,
      selectedDefinitionLetter: '',
      currentLetterDefinitions: [],
      filteredDefinitions: [],
      definitionSearchValue: ''
    }, () => {
      console.log('✅ 已返回到定义字母分组列表')
    })
  },

  // 执行定义搜索（高性能版本）
  performDefinitionSearch(searchValue) {
    if (!searchValue || !searchValue.trim()) {
      // 搜索为空时，返回字母分组视图
      this.setData({
        filteredDefinitions: [],
        showDefinitionGroups: true,
        selectedDefinitionLetter: '',
        currentLetterDefinitions: []
      })
      return
    }

    // 搜索时隐藏字母分组和字母详情，显示搜索结果
    this.setData({
      showDefinitionGroups: false,
      selectedDefinitionLetter: '',
      currentLetterDefinitions: []
    })

    // 如果索引还未准备好，使用传统搜索
    if (!this.data.definitionsIndexReady) {
      this.fallbackDefinitionSearch(searchValue)
      return
    }

    try {
      const startTime = Date.now()
      const results = searchManager.searchDefinitions(searchValue, 100)
      const endTime = Date.now()
      
      console.log('🚀 定义高性能搜索完成: "' + searchValue + '" -> ' + results.length + '条结果, 耗时' + (endTime - startTime) + 'ms')
      
      this.setData({
        filteredDefinitions: results
      })
    } catch (error) {
      console.error('高性能搜索失败，使用传统搜索:', error)
      this.fallbackDefinitionSearch(searchValue)
    }
  },

  // 传统定义搜索作为兜底
  fallbackDefinitionSearch(searchValue) {
    const filtered = this.data.definitionsList.filter(item => {
      const searchLower = searchValue.toLowerCase()
      return (item.chinese_name && item.chinese_name.toLowerCase().indexOf(searchLower) !== -1) ||
             (item.english_name && item.english_name.toLowerCase().indexOf(searchLower) !== -1) ||
             (item.definition && item.definition.toLowerCase().indexOf(searchLower) !== -1) ||
             (item.source && item.source.toLowerCase().indexOf(searchLower) !== -1)
    })

    this.setData({
      filteredDefinitions: filtered,
      selectedDefinitionLetter: '',
      currentLetterDefinitions: []
    })
  },

  // 机场搜索相关方法
  onAirportSearch(event) {
    const searchValue = this.data.airportSearchValue || ''
    
    // 使用扣费管理器执行搜索，需要2积分
    const buttonChargeManagerUtil = require('../../utils/button-charge-manager.js');
    buttonChargeManagerUtil.executeSearchWithCharge(
      'airports-search',
      searchValue,
      '机场搜索',
      () => {
        this.performAirportSearch(searchValue)
      }
    )
  },

  onAirportSearchChange(event) {
    const searchValue = event.detail
    this.setData({ airportSearchValue: searchValue })
    
    // 如果搜索值为空，返回字母分组视图
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredAirports: [],
        showAirportGroups: true,
        selectedAirportLetter: '',
        currentLetterAirports: []
      })
    }
  },

  onAirportSearchClear() {
    // 清除定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }
    
    // 如果在搜索状态，返回到字母分组视图
    this.setData({
      airportSearchValue: '',
      filteredAirports: [],
      showAirportGroups: true,
      selectedAirportLetter: '',
      currentLetterAirports: [],
      searchTimer: null
    })
  },

  // 选择机场字母分组
  onAirportLetterTap(event) {
    const letter = event.currentTarget.dataset.letter
    let group = null;
    for (let i = 0; i < this.data.airportGroups.length; i++) {
      if (this.data.airportGroups[i].letter === letter) {
        group = this.data.airportGroups[i];
        break;
      }
    }
    
    if (group) {
      console.log('选择机场字母组 ' + letter + '，包含 ' + group.count + ' 个机场')
      this.setData({
        selectedAirportLetter: letter,
        currentLetterAirports: group.items,
        showAirportGroups: false,
        filteredAirports: group.items
      })
    }
  },

  // 返回机场字母分组列表
  backToAirportGroups() {
    console.log('🔙 点击返回机场字母列表按钮')
    this.setData({
      showAirportGroups: true,
      selectedAirportLetter: '',
      currentLetterAirports: [],
      filteredAirports: [],
      airportSearchValue: ''
    }, () => {
      console.log('✅ 已返回到机场字母分组列表')
    })
  },

  // 执行机场搜索（高性能版本）
  performAirportSearch(searchValue) {
    if (!searchValue || !searchValue.trim()) {
      // 搜索为空时，返回字母分组视图
      this.setData({
        filteredAirports: [],
        showAirportGroups: true,
        selectedAirportLetter: '',
        currentLetterAirports: []
      })
      return
    }

    // 搜索时隐藏字母分组和字母详情，显示搜索结果
    this.setData({
      showAirportGroups: false,
      selectedAirportLetter: '',
      currentLetterAirports: []
    })

    // 如果索引还未准备好，使用传统搜索
    if (!this.data.airportsIndexReady) {
      this.fallbackAirportSearch(searchValue)
      return
    }

    try {
      const startTime = Date.now()
      const results = searchManager.searchAirports(searchValue, 100)
      const endTime = Date.now()
      
      console.log('🚀 机场高性能搜索完成: "' + searchValue + '" -> ' + results.length + '条结果, 耗时' + (endTime - startTime) + 'ms')
      
      this.setData({
        filteredAirports: results
      })
    } catch (error) {
      console.error('高性能搜索失败，使用传统搜索:', error)
      this.fallbackAirportSearch(searchValue)
    }
  },

  // 传统机场搜索作为兜底
  fallbackAirportSearch(searchValue) {
    const filtered = this.data.airportsList.filter(item => {
      const searchLower = searchValue.toLowerCase()
      return (item.ICAOCode && item.ICAOCode.toLowerCase().includes(searchLower)) ||
             (item.IATACode && item.IATACode.toLowerCase().includes(searchLower)) ||
             (item.ShortName && item.ShortName.toLowerCase().includes(searchLower)) ||
             (item.CountryName && item.CountryName.toLowerCase().includes(searchLower)) ||
             (item.EnglishName && item.EnglishName.toLowerCase().includes(searchLower))
    })

    this.setData({
      filteredAirports: filtered,
      selectedAirportLetter: '',
      currentLetterAirports: []
    })
  },

  // 显示缩写详情 - 重构为页面导航
  showAbbreviationDetail(event) {
    console.log('🔍 点击显示缩写详情，导航到详情页面')
    
    const item = event.currentTarget.dataset.item
    console.log('📝 选中的缩写项目:', item ? item.abbreviation : '无数据')
    
    if (!item) {
      wx.showToast({
        title: '数据异常',
        icon: 'error'
      })
      return
    }
    
    // 存储到全局数据，方便详情页面获取
    const app = getApp()
    app.globalData.selectedAbbreviation = item
    
    // 导航到通用详情页面
    wx.navigateTo({
      url: './detail?type=abbreviation&id=' + (item.id || '')
    })
  },


  // 显示定义详情 - 重构为页面导航
  showDefinitionDetail(event) {
    console.log('🔍 点击显示定义详情，导航到详情页面')
    
    const item = event.currentTarget.dataset.item
    console.log('📝 选中的定义项目:', item ? item.chinese_name : '无数据')
    
    if (!item) {
      wx.showToast({
        title: '数据异常',
        icon: 'error'
      })
      return
    }
    
    // 存储到全局数据，方便详情页面获取
    const app = getApp()
    app.globalData.selectedDefinition = item
    
    // 导航到通用详情页面
    wx.navigateTo({
      url: './detail?type=definition&id=' + (item.id || '')
    })
  },


  // 显示机场详情 - 重构为页面导航
  showAirportDetail(event) {
    console.log('🔍 点击显示机场详情，导航到详情页面')
    
    const item = event.currentTarget.dataset.item
    console.log('📝 选中的机场项目:', item ? item.ShortName : '无数据')
    
    if (!item) {
      wx.showToast({
        title: '数据异常',
        icon: 'error'
      })
      return
    }
    
    // 存储到全局数据，方便详情页面获取
    const app = getApp()
    app.globalData.selectedAirport = item
    
    // 导航到通用详情页面
    wx.navigateTo({
      url: './detail?type=airport&id=' + (item.ICAOCode || '')
    })
  },


  // 通信搜索相关方法
  onCommunicationSearch(event) {
    const searchValue = this.data.communicationSearchValue || ''
    
    // 使用扣费管理器执行搜索，需要2积分
    const buttonChargeManagerUtil = require('../../utils/button-charge-manager.js');
    buttonChargeManagerUtil.executeSearchWithCharge(
      'communications-search',
      searchValue,
      '通信搜索',
      () => {
        this.performCommunicationSearch(searchValue)
      }
    )
  },

  onCommunicationSearchChange(event) {
    const searchValue = event.detail
    this.setData({ communicationSearchValue: searchValue })
    
    // 如果搜索值为空，返回字母分组视图
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredCommunications: [],
        showCommunicationGroups: true,
        selectedCommunicationLetter: '',
        currentLetterCommunications: []
      })
    }
  },

  onCommunicationSearchClear() {
    // 清除定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }
    
    // 返回字母分组视图
    this.setData({
      communicationSearchValue: '',
      filteredCommunications: [],
      showCommunicationGroups: true,
      selectedCommunicationLetter: '',
      currentLetterCommunications: [],
      showChapterView: false,
      selectedChapterName: '',
      searchTimer: null
    })
  },

  // 执行通信搜索（高性能版本）
  performCommunicationSearch(searchValue) {
    if (!searchValue || !searchValue.trim()) {
      // 搜索为空时，返回字母分组视图
      this.setData({
        filteredCommunications: [],
        showCommunicationGroups: true,
        selectedCommunicationLetter: '',
        currentLetterCommunications: [],
        showChapterView: false
      })
      return
    }

    // 搜索时隐藏字母分组和字母详情，显示搜索结果
    this.setData({
      showCommunicationGroups: false,
      showChapterView: true,
      selectedCommunicationLetter: '',
      currentLetterCommunications: [],
      selectedChapterName: ''
    })

    // 如果索引还未准备好，使用传统搜索
    if (!this.data.communicationsIndexReady) {
      this.fallbackCommunicationSearch(searchValue)
      return
    }

    try {
      const startTime = Date.now()
      const results = searchManager.searchCommunications(searchValue, 100)
      const endTime = Date.now()
      
      console.log('🚀 通信高性能搜索完成: "' + searchValue + '" -> ' + results.length + '条结果, 耗时' + (endTime - startTime) + 'ms')
      
      this.setData({
        filteredCommunications: results
      })
    } catch (error) {
      console.error('高性能搜索失败，使用传统搜索:', error)
      this.fallbackCommunicationSearch(searchValue)
    }
  },

  // 传统通信搜索作为兜底
  fallbackCommunicationSearch(searchValue) {
    const filtered = this.data.communicationsList.filter(item => {
      const searchLower = searchValue.toLowerCase()
      return (item.english && item.english.toLowerCase().includes(searchLower)) ||
             (item.chinese && item.chinese.toLowerCase().includes(searchLower))
    })

    this.setData({
      filteredCommunications: filtered,
      selectedCommunicationLetter: '',
      currentLetterCommunications: [],
      selectedChapterName: ''
    })
  },

  // 选择通信字母分组
  onCommunicationLetterTap(event) {
    const letter = event.currentTarget.dataset.letter
    let group = null;
    for (let i = 0; i < this.data.communicationGroups.length; i++) {
      if (this.data.communicationGroups[i].letter === letter) {
        group = this.data.communicationGroups[i];
        break;
      }
    }
    
    if (group) {
      console.log('选择通信分组 ' + group.displayName + '，包含 ' + group.count + ' 句通信')
      this.setData({
        selectedCommunicationLetter: letter,
        currentLetterCommunications: group.items,
        showCommunicationGroups: false,
        filteredCommunications: group.items,
        showChapterView: true,
        selectedChapterName: group.displayName
      })
    }
  },

  // 返回通信字母分组列表
  backToCommunicationGroups() {
    console.log('🔙 点击返回通信字母列表按钮')
    this.setData({
      showCommunicationGroups: true,
      selectedCommunicationLetter: '',
      currentLetterCommunications: [],
      filteredCommunications: [],
      showChapterView: false,
      selectedChapterName: '',
      communicationSearchValue: ''
    }, () => {
      console.log('✅ 已返回到通信字母分组列表')
    })
  },

  // 显示章节句子（保留原有功能，用于兼容）
  showChapterSentences(event) {
    const chapter = event.currentTarget.dataset.chapter
    this.setData({
      filteredCommunications: chapter.sentences.map((sentence) => ({
        ...sentence,
        chapterName: chapter.name
      })),
      showChapterView: true,
      selectedChapterName: chapter.name,
      showCommunicationGroups: false
    })
    
    // 滚动到例句区域
    setTimeout(() => {
      wx.pageScrollTo({
        selector: '#chapterSentences',
        duration: 500
      })
    }, 100)
  },

  // 返回章节列表
  backToChapterList() {
    // 如果是从字母分组进入的，返回字母分组
    if (this.data.selectedCommunicationLetter) {
      this.backToCommunicationGroups()
    } else {
      // 否则返回原有的章节列表逻辑
      this.setData({
        showChapterView: false,
        selectedChapterName: '',
        filteredCommunications: [],
        showCommunicationGroups: true
      })
    }
    
    // 滚动到顶部
    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 500
      })
    }, 100)
  },

  // 显示通信详情 - 重构为页面导航
  showCommunicationDetail(event) {
    console.log('🔍 点击显示通信详情，导航到详情页面')
    
    const item = event.currentTarget.dataset.item
    console.log('📝 选中的通信项目:', item ? item.english : '无数据')
    
    if (!item) {
      wx.showToast({
        title: '数据异常',
        icon: 'error'
      })
      return
    }
    
    // 存储到全局数据，方便详情页面获取
    const app = getApp()
    app.globalData.selectedCommunication = item
    
    // 导航到通用详情页面
    wx.navigateTo({
      url: './detail?type=communication&id=' + (item.id || '')
    })
  },


  // 转发功能
  onShareAppMessage() {
    return {
      title: '飞行工具箱 - 万能查询',
      desc: '航空缩写、术语、机场和ICAO通信查询工具，包含丰富的航空专业词汇和900句标准通信用语',
      path: '/pages/abbreviations/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行工具箱 - 航空万能查询工具',
      query: 'from=timeline'
    }
  },

  // 加载规范性文件数据
  async loadNormativeDocuments() {
    this.setData({ normativeLoading: true })
    
    try {
      console.log('开始加载规范性文件数据...')
      
            // 使用异步回调方式进行跨分包require
      const classifiedData = await new Promise((resolve, reject) => {
        (require as any)('../../packageE/classified-data.js', resolve, reject)
      })
      
      if (classifiedData && typeof (classifiedData as any).getCategories === 'function') {
        const categories = (classifiedData as any).getCategories()
        const statistics = (classifiedData as any).getStatistics()
        
        // 创建字母分组
        const groups = this.createNormativeGroups(categories)
        
        this.setData({
          normativeCategories: categories,
          normativeGroups: groups,
          normativeStatistics: statistics,
          showNormativeGroups: true,
          normativeLoading: false
        })
        
        console.log('规范性文件数据加载成功，共' + statistics.total_documents + '个文档，' + categories.length + '个类别，分为' + groups.length + '个分组')
        console.log('分类数据:', categories)
      } else {
        throw new Error('分类数据格式错误')
      }
    } catch (error) {
      console.error('加载规范性文件数据失败:', error)
      this.setData({
        normativeCategories: [],
        normativeGroups: [],
        normativeStatistics: { total_documents: 0, total_categories: 0 },
        normativeLoading: false
      })
    }
  },

  // 创建规章字母分组
  createNormativeGroups(categories) {
    const groups = []
    
    // 按类别名称的首字母分组
    categories.forEach(category => {
      const firstChar = category.name.charAt(0)
      // 提取类别的关键词作为显示标题
      let displayTitle = category.name
      
      // 简化一些长类别名称，确保显示美观
      if (category.name.includes('安全、安保与事故调查')) {
        displayTitle = '安全安保与事故调查'  // 移除中间的顿号，避免换行
      } else if (category.name.includes('航空器制造与运航')) {
        displayTitle = '航空器制造运航'
      } else if (category.name.includes('空中交通管理')) {
        displayTitle = '空中交通管理'
      }
      
            groups.push({
        letter: firstChar, // 显示首字母
        normative_unique_key: 'normative_' + firstChar + '_' + category.name, // 唯一标识符，避免与缩写分组冲突
        groupName: displayTitle, // 显示用的简化标题 
        fullCategoryName: category.name, // 完整类别名称（用于API调用）
        displayName: category.name, // 完整类别名称
        displayTitle: displayTitle, // 简化显示标题
        description: category.count + '个规范性文件', // 添加描述
        count: category.count,
        items: [], // 这里暂时为空，点击时再加载具体文档
        categoryData: category
      })
    })
    
    // 按首字母排序
    groups.sort((a, b) => a.letter.localeCompare(b.letter, 'zh-CN'))
    
    console.log('规章字母分组统计:', groups.map(g => g.displayTitle + ': ' + g.count + '个文档').join(', '))
    
    return groups
  },

  // 规范性文件搜索相关方法
  onNormativeSearch(event) {
    const searchValue = this.data.normativeSearchValue || ''
    
    // 使用扣费管理器执行搜索，需要2积分
    const buttonChargeManagerUtil = require('../../utils/button-charge-manager.js');
    buttonChargeManagerUtil.executeSearchWithCharge(
      'normative-search',
      searchValue,
      '规范搜索',
      () => {
        this.filterNormativeDocuments(searchValue)
      }
    )
  },

  onNormativeSearchChange(event) {
    const searchValue = event.detail
    this.setData({
      normativeSearchValue: searchValue
    })
    
    // 如果搜索值为空，返回字母分组视图
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredNormativeDocuments: [],
        showNormativeSearch: false,
        showNormativeGroups: true,
        selectedNormativeLetter: '',
        currentLetterNormatives: []
      })
    }
  },

  onNormativeSearchClear() {
    // 返回字母分组视图
    this.setData({
      normativeSearchValue: '',
      filteredNormativeDocuments: [],
      showNormativeSearch: false,
      showNormativeGroups: true,
      selectedNormativeLetter: '',
      currentLetterNormatives: [],
      showNormativeCategoryDetail: false,
      showNormativeDocumentList: false
    })
  },

  // 选择规章字母分组
  onNormativeLetterTap(event) {
    const letter = event.currentTarget.dataset.letter
    let group = null;
    for (let i = 0; i < this.data.normativeGroups.length; i++) {
      if (this.data.normativeGroups[i].letter === letter) {
        group = this.data.normativeGroups[i];
        break;
      }
    }
    
    if (group) {
      console.log('选择规章分组 ' + group.groupName + '，包含 ' + group.count + ' 个文档')
      console.log('使用完整类别名称: ' + group.fullCategoryName)
      
      // 直接调用分类处理，使用完整的类别名称
      this.onNormativeCategoryTap({ 
        currentTarget: { 
          dataset: { 
            category: group.fullCategoryName // 使用完整类别名称
          } 
        } 
      })
    }
  },

  // 返回规章字母分组列表
  backToNormativeGroups() {
    console.log('🔙 点击返回规章字母列表按钮')
    this.setData({
      showNormativeGroups: true,
      selectedNormativeLetter: '',
      currentLetterNormatives: [],
      showNormativeCategoryDetail: false,
      showNormativeDocumentList: false,
      showNormativeSearch: false,
      normativeSearchValue: '',
      filteredNormativeDocuments: []
    }, () => {
      console.log('✅ 已返回到规章字母分组列表')
    })
  },

  async filterNormativeDocuments(searchValue) {
    if (!searchValue || !searchValue.trim()) {
      this.setData({
        filteredNormativeDocuments: [],
        showNormativeSearch: false,
        showNormativeGroups: true // 返回字母分组视图
      })
      return
    }

    // 搜索时隐藏字母分组
    this.setData({
      showNormativeGroups: false
    })

    try {
      const classifiedData = await new Promise((resolve, reject) => {
        (require as any)('../../packageE/classified-data.js', resolve, reject)
      })
      
      if (classifiedData && typeof (classifiedData as any).searchAll === 'function') {
        const results = (classifiedData as any).searchAll(searchValue)
        // 清理搜索结果中的办文单位字段并添加分组信息
        let cleanedResults = results.map((item, index) => {
          let processedItem
          if (item.type === 'ccar') {
            // CCAR规章不需要清理office_unit，但需要设置有效性和清理doc_number
            processedItem = {
              ...item,
              is_effective: true, // CCAR规章默认为有效
              // 清理doc_number中可能的多余连字符
              doc_number: item.doc_number ? item.doc_number.replace(/^-+/, '') : item.doc_number
            }
          } else {
            // 规范性文件需要清理office_unit并转换有效性字段
            processedItem = {
              ...item,
              clean_office_unit: this.extractCleanOfficeUnit(item.office_unit),
              // 🔧 关键修复：将validity字段转换为is_effective布尔值
              is_effective: item.validity === '有效'
            }
            
            // 🔍 调试日志：验证有效性转换
            if (index < 3) { // 只显示前3个结果的转换情况
                          console.log('📋 规范性文件有效性转换:', {
              title: item.title ? (item.title.substring(0, 30) + '...') : '',
              validity: item.validity,
              is_effective: processedItem.is_effective
            })
            }
          }
          
          // 添加分组显示标志
          if (item.type === 'document') {
            const currentPrefix = this.getDocPrefix(item.doc_number)
            const prevItem = results[index - 1]
            const prevPrefix = prevItem && prevItem.type === 'document' ? 
              this.getDocPrefix(prevItem.doc_number) : null
            
            processedItem.showGroupHeader = currentPrefix !== prevPrefix
            processedItem.groupName = this.getGroupName(currentPrefix)
          }
          
          return processedItem
        })

        // 🔧 应用有效性筛选
        const validityFilter = this.data.validityFilter || 'all'
        if (validityFilter === 'valid') {
          // 只显示有效的规章
          cleanedResults = cleanedResults.filter(item => {
            if (item.type === 'ccar') {
              return item.is_effective !== false // CCAR规章默认为有效
            } else {
              return item.validity === '有效' || item.is_effective === true
            }
          })
        } else if (validityFilter === 'invalid') {
          // 只显示失效的规章（包括"废止"、"失效"等所有非"有效"状态）
          cleanedResults = cleanedResults.filter(item => {
            if (item.type === 'ccar') {
              return item.is_effective === false
            } else {
              // validity字段为"废止"、"失效"或其他非"有效"值都归类为失效
              return item.validity !== '有效' && item.is_effective !== true
            }
          })
        }
        
        // 🔍 统计有效性分布
        const effectiveCount = cleanedResults.filter((item) => item.is_effective).length
        const totalCount = cleanedResults.length
        console.log('📊 搜索结果有效性统计: ' + effectiveCount + '/' + totalCount + ' 有效 (' + ((effectiveCount/totalCount)*100).toFixed(1) + '%)')
        
        this.setData({
          filteredNormativeDocuments: cleanedResults,
          showNormativeSearch: true,
          // 🔧 修复：确保在任何层级都能显示搜索结果
          showNormativeCategoryDetail: false,
          showNormativeDocumentList: false,
          showNormativeGroups: false
        })
      }
    } catch (error) {
      console.error('搜索规范性文件失败:', error)
      this.setData({
        filteredNormativeDocuments: [],
        showNormativeSearch: true
      })
    }
  },

  // 有效性筛选方法 - 基于Context7最佳实践
  onValidityFilterChange(event) {
    console.log('🚨 筛选按钮被点击了！！！')
    console.log('事件对象:', event)
    console.log('currentTarget:', event.currentTarget)
    console.log('dataset:', event.currentTarget.dataset)
    
    const filter = event.currentTarget.dataset.filter
    console.log('🔧 有效性筛选切换:', filter)
    
    // 显示toast确认点击
    wx.showToast({
      title: '筛选: ' + (filter === 'all' ? '全部' : (filter === 'valid' ? '有效' : '失效')),
      icon: 'none',
      duration: 1000
    })
    
    this.setData({
      validityFilter: filter
    }, () => {
      console.log('✅ 筛选状态已更新:', this.data.validityFilter)
      // 如果当前有搜索结果，重新执行搜索以应用筛选
      if (this.data.normativeSearchValue && this.data.normativeSearchValue.trim()) {
        this.filterNormativeDocuments(this.data.normativeSearchValue)
      }
    })
  },

  // 类别点击
  async onNormativeCategoryTap(event) {
    const category = event.currentTarget.dataset.category
    console.log('🔍 点击规章类别:', category)
    
    try {
      const classifiedData = await new Promise((resolve, reject) => {
        (require as any)('../../packageE/classified-data.js', resolve, reject)
      })
      
      if (classifiedData && typeof (classifiedData as any).getSubcategories === 'function') {
        const subcategories = (classifiedData as any).getSubcategories(category)
        console.log('📂 获取子类别数量:', subcategories.length)
        
        // 为每个子类别添加唯一key，解决wx:key冲突问题并确保数据完整性
        const subcategoriesWithUniqueKey = subcategories.map((item, index) => ({
          ...item,
          name: item.name || ('未知子类别_' + index), // 确保name字段不为空
          displayName: item.displayName || item.name || ('未知子类别_' + index), // 确保displayName字段不为空
          unique_key: category + '_' + (item.name || 'unknown') + '_' + index // 创建唯一标识符
        }))
        
        console.log('🔑 子类别数据结构(前3个):', subcategoriesWithUniqueKey.slice(0, 3))
        
        this.setData({
          selectedNormativeCategory: category,
          normativeSubcategories: subcategoriesWithUniqueKey,
          showNormativeCategoryDetail: true,
          showNormativeGroups: false, // 隐藏字母分组
          showNormativeDocumentList: false, // 确保文档列表不显示
          showNormativeSearch: false // 确保搜索结果不显示
        }, () => {
          console.log('✅ 已切换到子类别显示模式')
          console.log('当前状态:', {
            showNormativeCategoryDetail: this.data.showNormativeCategoryDetail,
            showNormativeGroups: this.data.showNormativeGroups,
            showNormativeDocumentList: this.data.showNormativeDocumentList
          })
        })
      }
    } catch (error) {
      console.error('获取子类别失败:', error)
    }
  },

  // 子类别点击
  async onNormativeSubcategoryTap(event) {
    console.log('🚨🚨🚨 onNormativeSubcategoryTap 方法被触发！！！')
    console.log('事件对象完整信息:', JSON.stringify(event, null, 2))
    console.log('currentTarget:', event.currentTarget)
    console.log('dataset:', event.currentTarget && event.currentTarget.dataset)
    
    const subcategory = event.currentTarget.dataset.subcategory
    console.log('📁 点击子类别:', subcategory, '当前主类别:', this.data.selectedNormativeCategory)
    
    try {
      const classifiedData = await new Promise((resolve, reject) => {
        (require as any)('../../packageE/classified-data.js', resolve, reject)
      })
      
      if (classifiedData && typeof (classifiedData as any).getDocuments === 'function') {
        const documents = (classifiedData as any).getDocuments(this.data.selectedNormativeCategory, subcategory)
        console.log('📄 获取到文档数量:', documents.length)
        
        // 清理办文单位字段，提取纯净的单位名称，并添加字号信息
        const cleanedDocuments = documents.map((doc) => ({
          ...doc,
          clean_office_unit: this.extractCleanOfficeUnit(doc.office_unit),
          // 🔧 关键修复：将validity字段转换为is_effective布尔值
          is_effective: doc.validity === '有效',
          // 生成字号信息
          document_number: this.generateDocumentNumber(doc),
          // 格式化日期 - 修复字段映射
          sign_date: this.formatDate(doc.sign_date),
          publish_date: this.formatDate(doc.publish_date)
        }))
        
        // 📅 按发布日期排序：最新的在最上面
        cleanedDocuments.sort((a, b) => {
          // 获取发布日期，优先使用publish_date，其次sign_date
          const getDate = (doc) => {
            const dateStr = doc.publish_date || doc.sign_date || '1900-01-01'
            return new Date(dateStr)
          }
          
          const dateA = getDate(a)
          const dateB = getDate(b)
          
          // 倒序排列：最新的在前面
          return dateB.getTime() - dateA.getTime()
        })
        
        console.log('📅 文档已按发布日期排序，最新的在前面。前3个文档的发布日期:', 
          cleanedDocuments.slice(0, 3).map((doc) => ({
            title: doc.title.substring(0, 30) + '...',
            publish_date: doc.publish_date || doc.sign_date
          }))
        )
        
        // 获取对应的CCAR规章信息
        let ccarRegulation = null
        if (subcategory.startsWith('CCAR-')) {
          const ccarNumber = subcategory.replace('CCAR-', '')
          try {
            const ccarResults = (classifiedData as any).getDocumentsByCCAR(ccarNumber)
            
            // 从regulation.js数据源中查找正确的URL
            const regulationData = await new Promise((resolve, reject) => {
              (require as any)('../../packageE/regulation.js', resolve, reject)
            })
            
            let correctUrl = 'https://www.caac.gov.cn/XXGK/XXGK/MHGZ/CCAR' + ccarNumber + '/' // 默认URL
            
            // 获取文档数组（适配新格式）
            let documentsArray = null
            const regData = regulationData as any
            if (regData && regData.regulationData) {
              documentsArray = regData.regulationData
            } else if (regData && Array.isArray(regData.regulationData)) {
              documentsArray = regData.regulationData
            } else if (regData && regData.documents) {
              // 兼容旧格式
              documentsArray = regData.documents
            } else if (regData && Array.isArray(regData)) {
              documentsArray = regData
            }
            
            let matchingDoc = null
            if (documentsArray && Array.isArray(documentsArray)) {
              // 在regulation.js中查找对应的CCAR文档 - ES5兼容版本
              for (let i = 0; i < documentsArray.length; i++) {
                const doc = documentsArray[i]
                if (doc.doc_number && doc.doc_number.includes('CCAR-' + ccarNumber)) {
                  matchingDoc = doc
                  break
                }
              }
              
              if (matchingDoc && matchingDoc.url) {
                correctUrl = matchingDoc.url
                console.log('✅ 找到CCAR-' + ccarNumber + '的正确URL:', correctUrl)
              } else {
                console.log('⚠️ 未在regulation.js中找到CCAR-' + ccarNumber + '的URL，使用默认URL')
              }
            }
            
            // 使用匹配到的完整文档编号或原始subcategory
            const fullDocNumber = matchingDoc && matchingDoc.doc_number ? matchingDoc.doc_number : subcategory
            
            if (ccarResults && ccarResults.ccar_info) {
              ccarRegulation = {
                title: fullDocNumber + ' - ' + ccarResults.ccar_info.name,
                description: '中国民用航空规章第' + ccarNumber + '部',
                category: ccarResults.ccar_info.category,
                subcategory: ccarResults.ccar_info.subcategory,
                url: correctUrl
              }
            } else {
              // 如果没有找到详细信息，使用基本信息，但尝试使用完整文档编号
              ccarRegulation = {
                title: fullDocNumber + ' - 民用航空规章',
                description: '中国民用航空规章第' + ccarNumber + '部',
                category: this.data.selectedNormativeCategory,
                subcategory: subcategory,
                url: correctUrl
              }
            }
          } catch (error) {
            console.log('获取CCAR规章信息失败:', error)
            // 提供默认的CCAR信息
            ccarRegulation = {
              title: subcategory + ' - 民用航空规章',
              description: '中国民用航空规章第' + ccarNumber + '部',
              category: this.data.selectedNormativeCategory,
              subcategory: subcategory,
              url: 'https://www.caac.gov.cn/XXGK/XXGK/MHGZ/CCAR' + ccarNumber + '/' // 兜底使用默认URL
            }
          }
        }
        
        this.setData({
          selectedNormativeSubcategory: subcategory,
          normativeDocuments: cleanedDocuments,
          ccarRegulation: ccarRegulation,
          showNormativeDocumentList: true
        }, () => {
          console.log('✅ 已切换到文档列表显示模式')
          console.log('当前状态:', {
            showNormativeCategoryDetail: this.data.showNormativeCategoryDetail,
            showNormativeDocumentList: this.data.showNormativeDocumentList,
            normativeDocuments: this.data.normativeDocuments.length
          })
        })
      }
    } catch (error) {
      console.error('获取文档列表失败:', error)
    }
  },

  // 返回类别列表
  onBackToNormativeCategories() {
    this.setData({
      showNormativeCategoryDetail: false,
      showNormativeDocumentList: false,
      selectedNormativeCategory: '',
      selectedNormativeSubcategory: '',
      ccarRegulation: null,
      showNormativeGroups: true, // 显示字母分组
      showNormativeSearch: false,
      filteredNormativeDocuments: []
    })
  },

  // 返回子类别列表
  onBackToNormativeSubcategories() {
    this.setData({
      showNormativeDocumentList: false,
      selectedNormativeSubcategory: '',
      ccarRegulation: null
    })
  },

  // 文档点击 - 查看原文
  onNormativeDocumentTap(event) {
    const url = event.currentTarget.dataset.url
    if (url) {
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showToast({
            title: '链接已复制到剪贴板',
            icon: 'success',
            duration: 2000
          })
          // 同时尝试打开链接
          setTimeout(() => {
            wx.showModal({
              title: '打开链接',
              content: '链接已复制到剪贴板，是否在浏览器中打开？',
              confirmText: '打开',
              cancelText: '取消',
              success: (res) => {
                if (res.confirm) {
                  // 在小程序中无法直接打开外部链接，只能提示用户手动打开
                  wx.showToast({
                    title: '请在浏览器中粘贴链接',
                    icon: 'none',
                    duration: 3000
                  })
                }
              }
            })
          }, 500)
        },
        fail: () => {
          wx.showToast({
            title: '复制失败',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '暂无可用链接',
        icon: 'none'
      })
    }
  },

  // 显示规章详情 - 重构为页面导航
  showRegulationDetail(item) {
    console.log('🔍 点击显示规章详情，导航到详情页面')
    console.log('📝 选中的规章项目:', item ? item.doc_number : '无数据')
    
    if (!item) {
      wx.showToast({
        title: '数据异常',
        icon: 'error'
      })
      return
    }
    
    // 存储到全局数据，方便详情页面获取
    const app = getApp()
    app.globalData.selectedRegulation = item
    
    // 导航到通用详情页面
    wx.navigateTo({
      url: './detail?type=regulation&id=' + (item.doc_number || '')
    })
  },

  // 复制规章链接
  onCopyRegulationLink(event) {
    const url = event.currentTarget.dataset.url
    const title = event.currentTarget.dataset.title
    const docNumber = event.currentTarget.dataset.docNumber
    
    if (url) {
      // 只复制URL链接
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showToast({
            title: '链接已复制',
            icon: 'success',
            duration: 2000
          })
          
          // 显示复制成功的详细信息
          setTimeout(() => {
            // 🔧 修复重复显示问题：title已经包含完整信息，只需要显示title即可
            let displayTitle = title
            
            // 如果title不包含文档编号，则添加docNumber前缀
            if (title && docNumber && !title.includes(docNumber)) {
              displayTitle = docNumber + ' - ' + title
            }
            
            wx.showModal({
              title: '📋 复制成功',
              content: '已复制规章文档信息：' + displayTitle + '\n\n请去浏览器中粘贴链接进入官网查看。',
              showCancel: false,
              confirmText: '知道了'
            })
          }, 500)
        },
        fail: () => {
          wx.showToast({
            title: '复制失败',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '暂无可用链接',
        icon: 'none'
      })
    }
  },

  // CCAR规章点击
  onCCARRegulationTap(event) {
    const url = event.currentTarget.dataset.url
    if (url) {
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showToast({
            title: 'CCAR规章链接已复制',
            icon: 'success'
          })
        }
      })
    }
  },

  // 提取纯净的办文单位名称
  extractCleanOfficeUnit(officeUnit) {
    if (!officeUnit || typeof officeUnit !== 'string') {
      return '无'
    }
    
    // 从office_unit字段中提取第一行的单位名称
    // 格式通常是："机场司\n成文日期：..."或者包含其他信息
    const lines = officeUnit.split('\n')
    if (lines.length > 0) {
      let firstLine = lines[0].trim()
      
      // 移除可能的HTML标签
      firstLine = firstLine.replace(/<[^>]*>/g, '').trim()
      
      // 移除可能的冒号后面的内容（如"办文单位：航空安全办公室"中的"办文单位："）
      firstLine = firstLine.replace(/^[^：]*：/, '').trim()
      
      // 移除可能的其他格式标记
      firstLine = firstLine.replace(/^\s*[-*•]\s*/, '').trim()
      
      return firstLine || '无'
    }
    
    return '无'
  },

  // 查看统计信息
  async onViewNormativeStatistics() {
    try {
      const classifiedData = await new Promise((resolve, reject) => {
        (require as any)('../../packageE/classified-data.js', resolve, reject)
      })
      
      if (classifiedData && typeof (classifiedData as any).getStatistics === 'function') {
        const stats = (classifiedData as any).getStatistics()
        
        let message = '📊 数据统计\n'
        message += '• 总文档数: ' + stats.total_documents + '个\n'
        message += '• 分类数: ' + stats.total_categories + '大类\n\n'
        message += '🤖 智能分类效果\n'
        message += '• 精确匹配: ' + stats.classification_methods.exact_match + '个\n'
        message += '  (通过文号中的CCAR部号自动分类)\n'
        message += '• 模糊匹配: ' + stats.classification_methods.fuzzy_match + '个\n'
        message += '  (通过关键词和司局信息智能分类)\n'
        
        if (stats.classification_methods.manual) {
          message += '• 手动分类: ' + stats.classification_methods.manual + '个\n'
        }
        
        message += '\n✅ 自动化分类成功率: ' + Math.round((stats.classification_methods.exact_match + stats.classification_methods.fuzzy_match) / stats.total_documents * 100) + '%'
        
        wx.showModal({
          title: '📈 数据统计详情',
          content: message,
          showCancel: false,
          confirmText: '知道了'
        })
      }
    } catch (error) {
      console.error('获取统计信息失败:', error)
      wx.showToast({
        title: '获取统计信息失败',
        icon: 'none'
      })
    }
  },

  // 提取文号前缀
  getDocPrefix(docNumber) {
    if (!docNumber) return 'OTHER'
    const match = docNumber.match(/^([A-Z]+)/)
    return match ? match[1] : 'OTHER'
  },

  // 获取分组名称
  getGroupName(prefix) {
    const groupNames = {
      'AC': '咨询通告 (AC)',
      'IB': '信息通告 (IB)', 
      'MD': '管理文件 (MD)',
      'AP': '审定程序 (AP)',
      'WM': '工作手册 (WM)',
      'OTHER': '其他文件'
    }
    return groupNames[prefix] || (prefix + '类文件')
  },

  // 生成文档字号
  generateDocumentNumber(doc) {
    if (!doc.doc_number) return ''
    
    // 从文号中提取年份和序号
    const match = doc.doc_number.match(/([A-Z-]+)(\d+)?/)
    if (match) {
      const prefix = match[1]
      const number = match[2] || ''
      
      // 从日期中提取年份
      const year = this.extractYearFromDate(doc.publish_date || doc.sign_date)
      
      // 根据文号类型生成字号
      if (prefix.startsWith('AC-')) {
        return '民航规〔' + year + '〕' + number + ' 号'
      } else if (prefix.startsWith('CCAR-')) {
        return '民航规〔' + year + '〕' + number + ' 号'
      } else {
        return '民航规〔' + year + '〕' + number + ' 号'
      }
    }
    
    return ''
  },

  // 从日期中提取年份
  extractYearFromDate(dateStr) {
    if (!dateStr) return '2023'
    
    // 尝试各种日期格式
    const patterns = [
      /(\d{4})/,  // 直接匹配四位数字
      /(\d{4})-\d{2}-\d{2}/,  // YYYY-MM-DD
      /(\d{4})年/,  // YYYY年
    ]
    
    for (const pattern of patterns) {
      const match = dateStr.match(pattern)
      if (match) {
        return match[1]
      }
    }
    
    return '2023'  // 默认年份
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return '未知'
    
    // 如果已经是YYYY-MM-DD格式，直接返回
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr
    }
    
    // 如果是"YYYY年MM月DD日"格式，转换为YYYY-MM-DD
    const chineseDateMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
    if (chineseDateMatch) {
      const year = chineseDateMatch[1]
      // 使用ES5兼容的字符串填充方法
      const month = chineseDateMatch[2].length < 2 ? '0' + chineseDateMatch[2] : chineseDateMatch[2]
      const day = chineseDateMatch[3].length < 2 ? '0' + chineseDateMatch[3] : chineseDateMatch[3]
      return `${year}-${month}-${day}`
    }
    
    // 尝试解析其他格式
    try {
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        // 使用ES5兼容的字符串填充方法
        const monthStr = month < 10 ? '0' + month : month.toString()
        const dayStr = day < 10 ? '0' + day : day.toString()
        return `${year}-${monthStr}-${dayStr}`
      }
    } catch (e) {
      // 解析失败，返回原始值
      console.log('日期解析失败:', dateStr)
    }
    
    // 返回原始日期字符串而不是硬编码默认值
    return dateStr || '未知'
  },

  // 🎯 基于Context7最佳实践：多层级广告相关方法
  
  // 加载用户广告偏好
  loadUserPreferences() {
    try {
      const adManagerUtil = require('../../utils/ad-manager.js');
      const AdManager = adManagerUtil;
      const adManager = new AdManager();
      const preferences = adManager.getUserPreferences();
      this.setData({ userPreferences: preferences });
      console.log('🎯 万能查询页面：加载用户广告偏好', preferences);
    } catch (error) {
      console.log('加载广告偏好失败:', error);
    }
  },

  // 初始化广告
  initAd() {
    try {
      const adManagerUtil = require('../../utils/ad-manager.js');
      const adManager = new adManagerUtil();
      
      // 为不同层级初始化不同的广告
      this.initTopAd(adManager);
      this.initSearchResultsAd(adManager);
      this.initLetterGroupsAd(adManager);

      this.initMiddleAd(adManager);
      this.initDetailViewAd(adManager);
      // 新增：字母分组中间广告
      this.initGroupMiddleAd(adManager);

      // 新增：S和T字母之间的广告
      this.initSTMiddleAd(adManager);
      // 新增：定义页面I和J字母之间的广告
      this.initDefinitionIJMiddleAd(adManager);
      // 新增：定义页面底部广告
      this.initDefinitionBottomAd(adManager);
      // 新增：机场页面M和N字母之间的广告
      this.initAirportMNMiddleAd(adManager);
      // 新增：机场页面底部广告
      this.initAirportBottomAd(adManager);
      // 新增：通信页面"其他术语"和"爆炸物威胁"之间的广告
      this.initCommunicationMiddleAd(adManager);
      // 新增：通信页面底部广告
      this.initCommunicationBottomAd(adManager);
      // 新增：规章页面底部广告
      this.initNormativeBottomAd(adManager);
      
      console.log('🎯 万能查询页面：多层级广告初始化成功');
    } catch (error) {
      console.error('万能查询页面广告初始化失败:', error);
    }
  },
  
  // 顶部广告（横幅卡片类）
  initTopAd(adManager) {
    const adUnit = adManager.getBestAdUnit('search-results', 'primary');
    if (adUnit) {
      this.setData({
        showTopAd: true,
        topAdUnitId: adUnit.id
      });
      console.log('🎯 顶部广告初始化:', adUnit.format);
    }
  },
  
  // 搜索结果页面广告（横幅卡片类）
  initSearchResultsAd(adManager) {
    const adUnit = adManager.getBestAdUnit('search-results', 'primary');
    if (adUnit) {
      this.setData({
        showSearchResultsAd: true,
        searchResultsAdUnitId: adUnit.id
      });
      console.log('🎯 搜索结果广告初始化:', adUnit.format);
    }
  },
  
  // 字母分组页面广告（横幅卡片类）
  initLetterGroupsAd(adManager) {
    const adUnit = adManager.getBestAdUnit('letter-groups', 'primary');
    if (adUnit) {
      this.setData({
        showLetterGroupsAd: true,
        letterGroupsAdUnitId: adUnit.id
      });
      console.log('🎯 字母分组广告初始化:', adUnit.format);
    }
  },
  

  
  // 中间广告（格子类）
  initMiddleAd(adManager) {
    const adUnit = adManager.getBestAdUnit('grid', 'secondary');
    if (adUnit) {
      this.setData({
        showMiddleAd: true,
        middleAdUnitId: adUnit.id
      });
      console.log('🎯 中间广告初始化:', adUnit.format);
    }
  },
  
  // 详情页面广告（横幅类）
  initDetailViewAd(adManager) {
    const adUnit = adManager.getBestAdUnit('detail-view', 'tertiary');
    if (adUnit) {
      this.setData({
        showDetailViewAd: true,
        detailViewAdUnitId: adUnit.id
      });
      console.log('🎯 详情页面广告初始化:', adUnit.format);
    }
  },

  // 字母分组中间广告（薄荷绿主题）
  initGroupMiddleAd(adManager) {
    const adUnit = adManager.getBestAdUnit('group-middle', 'secondary');
    if (adUnit) {
      this.setData({
        showGroupMiddleAd: true,
        groupMiddleAdUnitId: adUnit.id
      });
      console.log('🎯 字母分组中间广告初始化:', adUnit.format);
    }
  },



  // S和T字母之间的广告（横幅类）
  initSTMiddleAd(adManager) {
    const adUnit = adManager.getBestAdUnit('letter-groups', 'secondary');
    if (adUnit) {
      this.setData({
        showSTMiddleAd: true,
        stMiddleAdUnitId: adUnit.id
      });
      console.log('🎯 S和T字母间广告初始化:', adUnit.format);
    }
  },

  // 定义页面I和J字母之间的广告（横幅类）
  initDefinitionIJMiddleAd(adManager) {
    const adUnit = adManager.getBestAdUnit('letter-groups', 'secondary');
    if (adUnit) {
      this.setData({
        showDefinitionIJMiddleAd: true,
        definitionIJMiddleAdUnitId: adUnit.id
      });
      console.log('🎯 定义页面I和J字母间广告初始化:', adUnit.format);
    }
  },

  // 定义页面底部广告（横幅类）
  initDefinitionBottomAd(adManager) {
    const adUnit = adManager.getBestAdUnit('detail-view', 'tertiary');
    if (adUnit) {
      this.setData({
        showDefinitionBottomAd: true,
        definitionBottomAdUnitId: adUnit.id
      });
      console.log('🎯 定义页面底部广告初始化:', adUnit.format);
    }
  },

  // 机场页面M和N字母之间的广告（横幅类）
  initAirportMNMiddleAd(adManager) {
    const adUnit = adManager.getBestAdUnit('letter-groups', 'secondary');
    if (adUnit) {
      this.setData({
        showAirportMNMiddleAd: true,
        airportMNMiddleAdUnitId: adUnit.id
      });
      console.log('🎯 机场页面M和N字母间广告初始化:', adUnit.format);
    }
  },

  // 机场页面底部广告（横幅类）
  initAirportBottomAd(adManager) {
    const adUnit = adManager.getBestAdUnit('detail-view', 'tertiary');
    if (adUnit) {
      this.setData({
        showAirportBottomAd: true,
        airportBottomAdUnitId: adUnit.id
      });
      console.log('🎯 机场页面底部广告初始化:', adUnit.format);
    }
  },

  // 通信页面"其他术语"和"爆炸物威胁"之间的广告（横幅类）
  initCommunicationMiddleAd(adManager) {
    const adUnit = adManager.getBestAdUnit('letter-groups', 'secondary');
    if (adUnit) {
      this.setData({
        showCommunicationMiddleAd: true,
        communicationMiddleAdUnitId: adUnit.id
      });
      console.log('🎯 通信页面"其他术语"和"爆炸物威胁"间广告初始化:', adUnit.format);
    }
  },

  // 通信页面底部广告（横幅类）
  initCommunicationBottomAd(adManager) {
    const adUnit = adManager.getBestAdUnit('detail-view', 'tertiary');
    if (adUnit) {
      this.setData({
        showCommunicationBottomAd: true,
        communicationBottomAdUnitId: adUnit.id
      });
      console.log('🎯 通信页面底部广告初始化:', adUnit.format);
    }
  },

  // 规章页面底部广告（横幅类）
  initNormativeBottomAd(adManager) {
    const adUnit = adManager.getBestAdUnit('detail-view', 'tertiary');
    if (adUnit) {
      this.setData({
        showNormativeBottomAd: true,
        normativeBottomAdUnitId: adUnit.id
      });
      console.log('🎯 规章页面底部广告初始化:', adUnit.format);
    }
  },

  // 广告加载成功回调
  onAdLoad(event) {
    try {
      const adManagerUtil = require('../../utils/ad-manager.js');
      const adManager = new adManagerUtil();
      
      // 根据事件来源记录不同的广告
      const target = event.currentTarget;
      const adUnitId = target.dataset.adUnitId || this.data.searchResultsAdUnitId;
      
      if (adUnitId) {
        adManager.recordAdShown(adUnitId);
        console.log('🎯 万能查询页面：广告加载成功', adUnitId);
      }
    } catch (error) {
      console.error('广告加载回调处理失败:', error);
    }
  },

  // 广告加载失败回调
  onAdError(err) {
    console.log('🎯 万能查询页面：广告加载失败，优雅降级', err);
    
    // 根据错误类型隐藏对应的广告
    const target = err.currentTarget;
    if (target && target.dataset.adType) {
      const adType = target.dataset.adType;
      const updateData = {};
      updateData[`show${adType}Ad`] = false;
      this.setData(updateData);
    } else {
      // 兜底：隐藏所有广告
      this.setData({ 
        showSearchResultsAd: false,
        showLetterGroupsAd: false,

        showDetailViewAd: false,
        showSTMiddleAd: false,
        showDefinitionIJMiddleAd: false,
        showDefinitionBottomAd: false,
        showAirportMNMiddleAd: false,
        showAirportBottomAd: false,
        showCommunicationMiddleAd: false,
        showCommunicationBottomAd: false,
        showNormativeBottomAd: false
      });
    }
  }
})
