// 飞行计算页面 - 整合飞行速算、特殊计算、常用换算三个页面

const AdManager = require('../../utils/ad-manager.js');
const AppConfig = require('../../utils/app-config.js');
const tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');
const adHelper = require('../../utils/ad-helper.js');

// 🎯 TypeScript类型定义

/** 计算模块数据 */
interface CalculatorModule {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: string;
}

/** 页面配置选项（从URL参数传入） */
interface PageLoadOptions {
  module?: string;
  [key: string]: string | undefined;
}

/** 温度值数据 */
interface TemperatureValues {
  celsius: string;
  fahrenheit: string;
}

/** 单位换算器数据 */
interface UnitConverterData {
  temperatureValues: TemperatureValues;
}

Page({
  data: {
    // 插屏广告相关
    interstitialAd: null as WechatMiniprogram.InterstitialAd | null,
    interstitialAdLoaded: false,
    lastInterstitialAdShowTime: 0,

    // 页面导航状态
    selectedModule: '', // 当前选中的模块

    // 模块标题
    moduleTitle: '',

    // 音频分包加载状态
    loadedPackages: [] as string[],

    // 单位换算数据
    unitConverterData: {
      temperatureValues: {
        celsius: '',
        fahrenheit: ''
      }
    } as UnitConverterData,

    // 🔧 BUG-02修复：区分完整列表和显示列表
    // allModules: 完整的不可变模块列表（原始数据，不修改）
    // displayModules: 用于显示的模块列表（搜索过滤和排序后的结果）
    allModules: [
      {
        id: 'detour',
        icon: '🛣️',
        title: '绕飞耗油',
        description: '计算绕飞额外燃油消耗',
        category: '飞行计算'
      },
      {
        id: 'gpws',
        icon: '🚨',
        title: 'GPWS警告触发计算',
        description: '地面接近警告系统触发计算',
        category: '警告系统'
      },
      {
        id: 'snowtam-encoder',
        icon: '❄️',
        title: '雪情通告',
        description: 'SNOWTAM编码器',
        category: '编码工具'
      },
      {
        id: 'rodex-decoder',
        icon: '🛫',
        title: 'RODEX摩擦系数解码',
        description: '欧洲跑道摩擦系数报告解码',
        category: '解码工具'
      },
      {
        id: 'acr',
        icon: '🛬',
        title: 'ACR-PCR',
        description: '飞机道面承载能力对比',
        category: '性能计算'
      },
      {
        id: 'pitch',
        icon: '⚠️',
        title: 'PITCH PITCH',
        description: 'PITCH PITCH警告计算',
        category: '警告系统'
      },
      {
        id: 'coldTemp',
        icon: '🌡️',
        title: '低温修正',
        description: 'ICAO标准低温修正计算',
        category: '高度修正'
      },
      {
        id: 'descent',
        icon: '📉',
        title: '下降率计算',
        description: '计算下降率、下降角度和时间',
        category: '飞行计算'
      },
      {
        id: 'crosswind',
        icon: '🌪️',
        title: '侧风分量',
        description: '计算侧风、顶风分量和偏流角',
        category: '风速计算'
      },
      {
        id: 'turn',
        icon: '🔄',
        title: '转弯半径',
        description: '计算转弯半径和转弯率',
        category: '飞行计算'
      },
      {
        id: 'glideslope',
        icon: '📐',
        title: '五边高度',
        description: '计算进近五边的高度',
        category: '高度计算'
      },
      {
        id: 'gradient',
        icon: '📐',
        title: '梯度计算',
        description: '飞行梯度、升降率换算',
        category: '性能计算'
      },
      {
        id: 'distance',
        icon: '📏',
        title: '距离换算',
        description: '米、千米、海里、英里等换算',
        category: '单位换算'
      },
      {
        id: 'speed',
        icon: '⚡',
        title: '速度换算',
        description: '米/秒、千米/时、节换算',
        category: '单位换算'
      },
      {
        id: 'temperature',
        icon: '🌡️',
        title: '温度换算',
        description: '摄氏度、华氏度、开尔文换算',
        category: '单位换算'
      },
      {
        id: 'weight',
        icon: '⚖️',
        title: '重量换算',
        description: '克、千克、磅换算',
        category: '单位换算'
      },
      {
        id: 'pressure',
        icon: '🌪️',
        title: '气压换算',
        description: 'QNH、QFE、机场标高换算',
        category: '气压计算'
      },
      {
        id: 'isa',
        icon: '🌡️',
        title: 'ISA温度',
        description: '国际标准大气温度计算',
        category: '气象计算'
      },
      {
        id: 'twin-engine-goaround',
        icon: '✈️',
        title: '双发复飞梯度',
        description: '计算双发飞机复飞性能',
        category: '性能计算'
      },
      {
        id: 'radiation',
        icon: '☢️',
        title: '辐射计算',
        description: '航空电离辐射剂量估算',
        category: '健康计算',
        tagType: 'warning'
      }
    ] as CalculatorModule[],

    // 🔧 BUG-02修复：用于显示的模块列表（初始为空，在onLoad中初始化）
    displayModules: [] as CalculatorModule[]

  },

  onLoad(options?: PageLoadOptions) {
    // 🔧 修复：不重复初始化AdManager，使用App中统一初始化的实例
    if (!AdManager.isInitialized) {
      AdManager.init({
        debug: true
      });
    }

    // 初始化预加载分包状态
    this.initializePreloadedPackages();

    // 页面加载时初始化
    this.initializeData();

    // 🔧 BUG-02修复：初始化displayModules为allModules的副本
    // 保持allModules不变，只修改displayModules
    this.setData({
      displayModules: (this.data.allModules as any[]).slice()
    });

    // 🚀 新增：按使用频率排序模块
    this.sortModulesByUsage();

    // 🎬 创建插屏广告实例
    this.createInterstitialAd();

    console.log('✨ 飞行计算页面已就绪');

  },

  onShow() {
    // 处理TabBar页面进入（标记访问+更新小红点）
    tabbarBadgeManager.handlePageEnter('pages/flight-calculator/index');

    // 🎬 显示插屏广告（频率控制）
    this.showInterstitialAdWithControl();

    // 页面显示时的操作
  },

  onUnload() {
    // 🧹 清理插屏广告资源（定时器由ad-helper自动管理）
    this.destroyInterstitialAd();

    // 页面卸载清理
  },

  // 初始化预加载分包状态
  initializePreloadedPackages() {
    // 🔄 预加载模式：标记预加载的分包为已加载
    const preloadedPackages = ["packageF", "packageO"]; // 60KB + 1.4MB = 1.46MB ✅
    
    preloadedPackages.forEach(packageName => {
      if (!this.data.loadedPackages.includes(packageName)) {
        this.data.loadedPackages.push(packageName);
      }
    });
    
    this.setData({ loadedPackages: this.data.loadedPackages });
    console.log('✅ flight-calculator 已标记预加载分包:', this.data.loadedPackages);
  },

  // 检查分包是否已加载（预加载模式）
  isPackageLoaded(packageName: string): boolean {
    // 🔄 预加载模式：检查预加载分包列表和实际加载状态
    const preloadedPackages = ["packageF", "packageO"]; // 根据app.json预加载规则配置
    return preloadedPackages.includes(packageName) || this.data.loadedPackages.includes(packageName);
  },

  // 初始化数据
  initializeData() {
    // 初始化数据
  },

  // 选择模块
  selectModule(e: any) {
    const module = e.currentTarget.dataset.module;

    // 🚀 新增：记录使用频率
    this.recordModuleUsage(module);

    // 使用通用卡片点击处理逻辑
    this.handleCardClick(() => {
      // 直接跳转到模块，积分扣费在子页面处理
      this.navigateToModule(module);
    });
  },

  /**
   * 通用卡片点击处理
   */
  handleCardClick: function(navigateCallback: () => void) {
    // 直接执行导航
    if (navigateCallback && typeof navigateCallback === 'function') {
      navigateCallback();
    }
  },
  
  // 导航到具体模块
  navigateToModule(module: string) {
    // 跳转到独立子页面的模块
    const independentModules = ['descent', 'crosswind', 'turn', 'glideslope', 'detour', 'gradient', 'distance', 'speed', 'temperature', 'weight', 'pressure', 'isa', 'coldTemp', 'gpws', 'pitch', 'snowtam-encoder', 'rodex-decoder', 'acr', 'twin-engine-goaround', 'radiation'];
    if (independentModules.includes(module)) {
      // 处理目录名与模块名不一致的情况
      const modulePathMap: { [key: string]: string } = {
        'coldTemp': 'cold-temp'
      };
      const modulePath = modulePathMap[module] || module;

      // 特殊处理新迁移的功能
      if (module === 'snowtam-encoder') {
        wx.navigateTo({
          url: '/packageO/snowtam-encoder/index'
        });
      } else if (module === 'rodex-decoder') {
        wx.navigateTo({
          url: '/packageO/rodex-decoder/index'
        });
      } else if (module === 'acr') {
        wx.navigateTo({
          url: '/packageO/flight-calc-modules/acr/index'
        });
      } else if (module === 'twin-engine-goaround') {
        wx.navigateTo({
          url: '/packageO/twin-engine-goaround/index'
        });
      } else if (module === 'radiation') {
        wx.navigateTo({
          url: '/packageRadiation/pages/index/index'
        });
      } else {
        wx.navigateTo({
          url: `/packageO/flight-calc-modules/${modulePath}/index`
        });
      }
      return;
    }

    // 其他模块保持原有浮窗逻辑
    const moduleTitle = this.getModuleTitle(module);
    this.setData({
      selectedModule: module,
      moduleTitle
    });
  },

  // 返回到主页面
  backToModules() {
    this.setData({
      selectedModule: '',
      moduleTitle: ''
    });
  },


  // 获取模块标题
  getModuleTitle(module: string): string {
    const titles: { [key: string]: string } = {
      // 飞行速算
      'descent': '📉 下降率计算',
      'crosswind': '🌪️ 侧风分量',
      'turn': '🔄 转弯半径',
      'glideslope': '📐 下滑线高度',
      'detour': '🛣️ 绕飞耗油',
      
      // 特殊计算
      'coldTemp': '🌡️ 低温修正',
      'gradient': '📐 梯度计算',
      'pitch': '⚠️ PITCH PITCH',
      'gpws': '🚨 GPWS警告触发计算',
      
      // 常用换算
      'isa': '🌡️ ISA温度'
    };
    
    return titles[module] || module;
  },
















  // 数字格式化
  formatNumber(num: number): string {
    if (num >= 100) {
      return num.toFixed(0);
    } else if (num >= 10) {
      return num.toFixed(1);
    } else {
      return num.toFixed(2);
    }
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '飞行工具箱 - 飞行经历',
      desc: '专业飞行经历记录工具，支持飞行速算、特殊计算、常用换算',
      path: '/pages/flight-calculator/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行经历工具',
      path: '/pages/flight-calculator/index'
    };
  },

  // ========== 工具方法 ==========

  // 通用清空数据方法
  clearData(category: string, module: string) {
    const dataPath = `${category}Data.${module}`;
    const currentData = this.data[`${category}Data` as keyof typeof this.data] as any;
    
    if (currentData && currentData[module]) {
      const clearedData = { ...currentData[module] };
      Object.keys(clearedData).forEach(key => {
        if (key !== 'result') {
          clearedData[key] = '';
        } else {
          clearedData[key] = null;
        }
      });
      
      this.setData({
        [dataPath]: clearedData
      });
    }
  },

  // ===== 常用换算功能 =====





  // 温度数字输入实时处理（支持负数）













  // 格式化数字，保留合适的小数位数
  formatNumber(num: number): string {
    if (num === 0) return '0';
    
    // 对于很大或很小的数字，使用科学计数法
    if (Math.abs(num) >= 1000000 || (Math.abs(num) < 0.001 && Math.abs(num) > 0)) {
      return num.toExponential(6);
    }
    
    // 对于普通数字，保留适当的小数位数
    if (Math.abs(num) >= 100) {
      return num.toFixed(2);
    } else if (Math.abs(num) >= 1) {
      return num.toFixed(4);
    } else {
      return num.toFixed(6);
    }
  },

  // 温度输入数字验证
  onTemperatureNumberInput(e: any) {
    let value = e.detail.value;
    // 只允许数字、负号、小数点
    value = value.replace(/[^-0-9.]/g, '');
    // 确保负号只能在开头
    if (value.indexOf('-') > 0) {
      value = value.replace(/-/g, '');
    }
    // 确保只有一个小数点
    const dotIndex = value.indexOf('.');
    if (dotIndex !== -1) {
      value = value.substring(0, dotIndex + 1) + value.substring(dotIndex + 1).replace(/\./g, '');
    }
    // 更新输入框的值
    const unit = e.currentTarget.dataset.unit;
    if (unit) {
      this.setData({
        [`unitConverterData.temperatureValues.${unit}`]: value
      });
    }
  },

  // 温度输入事件处理
  onTemperatureInput(e: any) {
    const unit = e.currentTarget.dataset.unit;
    const value = e.detail || '';

    if (unit) {
      this.setData({
        [`unitConverterData.temperatureValues.${unit}`]: value
      });
    }
  },

  // ES5兼容的Object.entries实现
  getObjectEntries(obj: any): [string, any][] {
    const entries: [string, any][] = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        entries.push([key, obj[key]]);
      }
    }
    return entries;
  },

  // === 🚀 使用频率追踪 ===

  /**
   * 记录模块使用频率
   */
  recordModuleUsage: function(moduleId: string) {
    try {
      const usageStats = wx.getStorageSync('module_usage_stats') || {};
      usageStats[moduleId] = (usageStats[moduleId] || 0) + 1;
      wx.setStorageSync('module_usage_stats', usageStats);
      console.log('📊 记录使用:', moduleId, '次数:', usageStats[moduleId]);
    } catch (error) {
      console.error('记录使用频率失败:', error);
    }
  },

  /**
   * 🔧 BUG-02修复：按使用频率排序模块（更新displayModules）
   */
  sortModulesByUsage: function() {
    // 🔧 BUG-02修复：从完整的allModules排序，更新displayModules
    const sorted = this.sortByUsageFrequency(this.data.allModules as any[]);
    this.setData({ displayModules: sorted });
    console.log('🔢 模块已按使用频率排序（完整列表:', (this.data.allModules as any[]).length, '个）');
  },

  /**
   * 排序算法：按使用频率降序
   */
  sortByUsageFrequency: function(modules: any[]): any[] {
    let usageStats: { [key: string]: number } = {};
    try {
      usageStats = wx.getStorageSync('module_usage_stats') || {};
    } catch (error) {
      console.error('读取使用统计失败:', error);
    }

    // 复制数组避免修改原数据
    const sorted = modules.slice();

    sorted.sort(function(a, b) {
      const usageA = usageStats[a.id] || 0;
      const usageB = usageStats[b.id] || 0;
      return usageB - usageA;  // 降序：使用多的排前面
    });

    return sorted;
  },

  // === 🎬 插屏广告相关方法 ===

  /**
   * 创建插屏广告实例（使用ad-helper统一管理）
   */
  createInterstitialAd: function() {
    this.data.interstitialAd = adHelper.setupInterstitialAd(this, '飞行计算器');
  },

  /**
   * 显示插屏广告（使用智能策略）
   * TabBar切换优化：2分钟间隔，每日最多20次
   */
  showInterstitialAdWithControl: function() {
    // 获取当前页面路径
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const route = currentPage.route || '';

    // 使用智能策略展示广告
    adHelper.showInterstitialAdWithStrategy(
      this.data.interstitialAd,
      route,  // 当前页面路径
      this,   // 页面上下文
      '飞行计算器'
    );
  },

  /**
   * 销毁插屏广告实例（使用ad-helper统一管理）
   */
  destroyInterstitialAd: function() {
    adHelper.cleanupInterstitialAd(this, '飞行计算器');
  }

});