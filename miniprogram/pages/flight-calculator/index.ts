// 飞行计算页面 - 整合飞行速算、特殊计算、常用换算三个页面

const BasePage = require('../../utils/base-page.js');
const VersionManager = require('../../utils/version-manager.js');
const AdManager = require('../../utils/ad-manager.js');
const AppConfig = require('../../utils/app-config.js');
const tabbarBadgeManager = require('../../utils/tabbar-badge-manager.js');
const adHelper = require('../../utils/ad-helper.js');
const dataManager = require('../../utils/data-manager.js');
const pilotLevelManager = require('../../utils/pilot-level-manager.js');

// 使用缓存Key，实现debug/release数据隔离
const MODULE_USAGE_CACHE_KEY = 'flight_calculator_module_usage';
const AIRPORT_CHECKINS_CACHE_KEY = 'airport_checkins';
// 兼容老版本机场打卡缓存（机场足迹页 / 首页仍在使用）
const AIRPORT_CHECKINS_LEGACY_KEY = 'airport_checkins_v1';

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

interface AirportCheckin {
  icao: string;
  iata: string;
  shortName: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number | null;
  firstVisitTimestamp: number;
  lastVisitDate?: string;
  visitCount?: number;
}

var pageConfig = {
  data: {

    // 插屏广告相关
    interstitialAd: null as WechatMiniprogram.InterstitialAd | null,
    interstitialAdLoaded: false,
    lastInterstitialAdShowTime: 0,

    // 无广告状态
    isAdFree: false,

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

    currentRule: {
      title: '',
      content: '',
      animation: ''
    },

    airportCheckins: [] as AirportCheckin[],
    airportCheckinsInitialized: false,
    highlightCheckinText: '',
    randomCheckins: [] as AirportCheckin[],

    // BUG-02修复：区分完整列表和显示列表
    // allModules: 完整的不可变模块列表（原始数据，不修改）
    // displayModules: 用于显示的模块列表（搜索过滤和排序后的结果）
    allModules: [
      {
        id: 'flight-suite',
        icon: '✈️',
        title: '飞行计算合集',
        description: '侧风 / 距离 / 五边 / 下降率 / 重量 / 半径 / ISA',
        category: '飞行计算'
      },
      {
        id: 'detour',
        icon: '🛣️',
        title: '绕飞耗油',
        description: '绕路要多烧多少油，心里有数',
        category: '飞行计算'
      },
      {
        id: 'gpws',
        icon: '🚨',
        title: 'GPWS警告触发计算',
        description: '别让警告响，提前算一算',
        category: '警告系统'
      },
      {
        id: 'snowtam-encoder',
        icon: '❄️',
        title: '雪情通告',
        description: '冰天雪地也能稳稳落地',
        category: '编码工具'
      },
      {
        id: 'rodex-decoder',
        icon: '🛫',
        title: 'RODEX摩擦系数解码',
        description: '欧洲跑道滑不滑，一查便知',
        category: '解码工具'
      },
      {
        id: 'weather-decoder',
        icon: '☁️',
        title: '天气报文解码',
        description: 'METAR / TAF / VA / TC / SWX 一键解读',
        category: '解码工具'
      },
      {
        id: 'acr',
        icon: '🛬',
        title: 'ACR-PCR',
        description: '跑道能不能扛得住咱家飞机',
        category: '性能计算'
      },
      {
        id: 'pitch',
        icon: '⚠️',
        title: 'PITCH PITCH',
        description: '俯仰警告提前知，心不慌',
        category: '警告系统'
      },
      {
        id: 'coldTemp',
        icon: '🌡️',
        title: '低温修正',
        description: '天寒地冻，高度要修正',
        category: '高度修正'
      },
      {
        id: 'twin-engine-goaround',
        icon: '✈️',
        title: '双发复飞梯度',
        description: '单发也能稳稳复飞',
        category: '性能计算'
      },
      {
        id: 'radiation',
        icon: '☢️',
        title: '辐射计算',
        description: '守护健康，辐射要心中有数',
        category: '健康计算',
        tagType: 'warning'
      }
    ] as CalculatorModule[],

    // BUG-02修复：用于显示的模块列表（初始为空，在onLoad中初始化）
    displayModules: [] as CalculatorModule[],

    // ActionSheet 相关数据初始化（避免类型不兼容警告）
    aircraftModelActions: [],           // 飞机型号选择选项
    gpwsMode4SubModeActions: [],        // GPWS Mode 4 子模式选择选项
    pitchAircraftModelActions: [],      // PITCH 飞机型号选择选项
    showAircraftModelPicker: false,     // 飞机型号选择器显示状态
    showGPWSMode4SubModePicker: false,  // GPWS Mode 4 子模式选择器显示状态
    showPitchAircraftModelPicker: false // PITCH 飞机型号选择器显示状态

  },

  // 广告触发防抖标记
  _adTriggerTimer: false,

  customOnLoad: function(options?: PageLoadOptions) {

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

    this.initializeAirportCheckinsFromStorage();

    console.log('✨ 飞行计算页面已就绪');

  },

  customOnShow: function() {

    // 检查无广告状态（使用BasePage提供的方法或本地方法）
    this.checkAdFreeStatus();

    // 处理TabBar页面进入（标记访问+更新小红点）
    tabbarBadgeManager.handlePageEnter('pages/flight-calculator/index');

    // 🎬 显示插屏广告（频率控制）
    this.showInterstitialAdWithControl();

    // 页面显示时的操作
    this.autoCheckinNearestAirport();
  },

  customOnUnload: function() {
    // 🧹 清理插屏广告资源（定时器由ad-helper自动管理）
    this.destroyInterstitialAd();

    // 页面卸载清理
  },

  // 初始化预加载分包状态
  initializePreloadedPackages() {
    // 🔄 预加载模式：标记预加载的分包为已加载
    const preloadedPackages = ["packageF", "packageO", "packageWeather"]; // 60KB + 1.4MB + 天气工具 = ~1.5MB ✅

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
    const preloadedPackages = ["packageF", "packageO", "packageWeather"]; // 根据app.json预加载规则配置
    return preloadedPackages.includes(packageName) || this.data.loadedPackages.includes(packageName);
  },

  // 初始化数据
  initializeData() {
    // 初始化数据
  },

  // 记录模块使用频率
  recordModuleUsage(moduleId: string) {
    try {
      if (!moduleId) {
        return;
      }

      let usageMap: { [key: string]: number } = {};
      // 使用版本化缓存Key
      const cacheKey = VersionManager.getVersionedKey(MODULE_USAGE_CACHE_KEY);

      try {
        const stored = wx.getStorageSync(cacheKey);
        if (stored && typeof stored === 'object') {
          usageMap = stored as { [key: string]: number };
        }
      } catch (error) {
        console.warn('读取模块使用频率失败:', error);
      }

      const current = Number(usageMap[moduleId] || 0);
      usageMap[moduleId] = isFinite(current) && current >= 0 ? current + 1 : 1;

      try {
        wx.setStorageSync(cacheKey, usageMap);
      } catch (error) {
        console.warn('保存模块使用频率失败:', error);
      }

      // 使用频率更新后，尝试重新排序展示列表
      this.sortModulesByUsage();
    } catch (error) {
      console.warn('记录模块使用频率失败:', error);
    }
  },

  // 按使用频率排序模块
  sortModulesByUsage() {
    try {
      let usageMap: { [key: string]: number } = {};
      // 使用版本化缓存Key
      const cacheKey = VersionManager.getVersionedKey(MODULE_USAGE_CACHE_KEY);

      try {
        const stored = wx.getStorageSync(cacheKey);
        if (stored && typeof stored === 'object') {
          usageMap = stored as { [key: string]: number };
        }
      } catch (error) {
        console.warn('读取模块使用频率失败:', error);
      }

      const allModules = ((this.data as any).allModules || []) as CalculatorModule[];
      if (!Array.isArray(allModules) || allModules.length === 0) {
        return;
      }

      const sorted = allModules.slice().sort((a, b) => {
        const usageA = usageMap[a.id] || 0;
        const usageB = usageMap[b.id] || 0;
        if (usageA !== usageB) {
          return usageB - usageA;
        }
        return (a.title || '').localeCompare(b.title || '');
      });

      this.setData({
        displayModules: sorted
      });
    } catch (error) {
      console.error('按使用频率排序模块失败:', error);
      // 兜底：如果排序失败，维持原始顺序
      this.setData({
        displayModules: ((this.data as any).allModules || []).slice()
      });
    }
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
   * 通用卡片点击处理（优化版：防抖+异常处理）
   */
  handleCardClick: function(navigateCallback: () => void) {
    const self = this;

    // 🎬 触发广告：记录卡片点击操作并尝试展示广告（带防抖和异常处理）
    try {
      // 防抖机制：避免短时间内重复触发
      if (this._adTriggerTimer) {
        console.log('🎬 广告触发防抖中，跳过本次');
      } else {
        this._adTriggerTimer = true;

        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const route = currentPage.route || '';
        adHelper.adStrategy.recordAction(route);
        this.showInterstitialAdWithControl();

        // 500ms后重置防抖标志
        this.createSafeTimeout(function() {
          self._adTriggerTimer = false;
        }, 500, '广告触发防抖');
      }
    } catch (error) {
      console.error('🎬 广告触发失败:', error);
      // 不影响导航，继续执行
    }

    // 执行导航
    if (navigateCallback && typeof navigateCallback === 'function') {
      try {
        navigateCallback();
      } catch (error) {
        console.error('[handleCardClick] 导航失败:', error);
      }
    }
  },

  // 导航到具体模块
  navigateToModule(module: string) {
    if (module === 'flight-suite') {
      try {
        wx.navigateTo({
          url: '/pages/flight-calc-suite/index'
        });
      } catch (error) {
        console.error('导航到飞行计算合集页面失败:', error);
      }
      return;
    }

    // 跳转到独立子页面的模块
    const independentModules = ['descent', 'crosswind', 'turn', 'glideslope', 'detour', 'gradient', 'distance', 'speed', 'temperature', 'weight', 'pressure', 'isa', 'coldTemp', 'gpws', 'pitch', 'snowtam-encoder', 'rodex-decoder', 'weather-decoder', 'acr', 'twin-engine-goaround', 'radiation'];
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
      } else if (module === 'weather-decoder') {
        wx.navigateTo({
          url: '/packageWeather/index'
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

  formatCheckinDate(timestamp: number): string {
    try {
      if (!timestamp || !(timestamp >= 0)) {
        return '';
      }
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('格式化机场打卡日期失败:', error);
      return '';
    }
  },

  initializeAirportCheckinsFromStorage() {
    if ((this.data as any).airportCheckinsInitialized) {
      return;
    }

    let list: AirportCheckin[] = [];
    // 使用环境级缓存Key（稳定，不随版本号变化），如果为空则回退到旧 key 并进行一次性迁移
    const cacheKey = VersionManager.getEnvScopedKey(AIRPORT_CHECKINS_CACHE_KEY);
    try {
      const stored = wx.getStorageSync(cacheKey);
      if (Array.isArray(stored) && stored.length > 0) {
        list = stored;
      } else {
        // 兼容旧版本：读取老 key 'airport_checkins_v1'
        try {
          const legacyStored = wx.getStorageSync(AIRPORT_CHECKINS_LEGACY_KEY);
          if (Array.isArray(legacyStored) && legacyStored.length > 0) {
            list = legacyStored;
            // 尝试迁移到新版本 key，后续读写统一走版本化 key
            try {
              wx.setStorageSync(cacheKey, legacyStored);
            } catch (migrateError) {
              console.warn('迁移旧机场打卡记录到新版本缓存失败:', migrateError);
            }
          }
        } catch (legacyError) {
          console.warn('读取旧版机场打卡记录失败:', legacyError);
        }
      }

      // 如果新 env 级 key 与 legacy key 都没有数据，再尝试从旧版本化 key 中扫描一次性迁移
      if (!Array.isArray(list) || list.length === 0) {
        try {
          var info = (VersionManager as any).getAppVersionInfo && (VersionManager as any).getAppVersionInfo();
          var prefix = info && info.prefix ? info.prefix : '';
          if (prefix && wx.getStorageInfoSync) {
            var storageInfo = wx.getStorageInfoSync();
            var keys = (storageInfo && storageInfo.keys) || [];
            for (var i = 0; i < keys.length; i++) {
              var k = keys[i];
              if (k.indexOf(prefix) === 0 && k.indexOf(AIRPORT_CHECKINS_CACHE_KEY) !== -1) {
                try {
                  var legacyList = wx.getStorageSync(k);
                  if (Array.isArray(legacyList) && legacyList.length > 0) {
                    list = legacyList;
                    try {
                      wx.setStorageSync(cacheKey, legacyList);
                    } catch (migrateError2) {
                      console.warn('迁移旧版本化机场打卡记录到环境级缓存失败:', migrateError2);
                    }
                    break;
                  }
                } catch (readOldError) {
                  console.warn('读取旧版本化机场打卡记录失败:', readOldError);
                }
              }
            }
          }
        } catch (scanError) {
          console.warn('扫描旧版本机场打卡记录失败:', scanError);
        }
      }
    } catch (error) {
      console.warn('读取机场打卡记录失败:', error);
    }

    this.setData({
      airportCheckins: list,
      airportCheckinsInitialized: true
    });

    this.updateRandomCheckins(list);
    this.refreshRule();
  },

  // 更新随机展示的3个机场
  updateRandomCheckins(checkins?: AirportCheckin[]) {
    const list = checkins || ((this.data as any).airportCheckins || []) as AirportCheckin[];
    
    if (list.length === 0) {
      this.setData({ randomCheckins: [] });
      return;
    }
    
    // 随机选择最多3个机场
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(3, list.length));
    
    // 添加格式化的日期文本
    const withDateText = selected.map(item => ({
      ...item,
      firstVisitDateText: this.formatCheckinDateShort(item.firstVisitTimestamp)
    }));
    
    this.setData({ randomCheckins: withDateText });
  },

  // 格式化打卡日期（带年份）
  formatCheckinDateShort(timestamp: number): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return year + '年' + month + '月' + day + '日首访';
  },

  saveAirportCheckinsToStorage(checkins: AirportCheckin[]) {
    // 使用环境级缓存Key（稳定，不随版本号变化）
    const cacheKey = VersionManager.getEnvScopedKey(AIRPORT_CHECKINS_CACHE_KEY);
    try {
      wx.setStorageSync(cacheKey, checkins || []);
    } catch (error) {
      console.error('保存机场打卡记录失败:', error);
    }
  },

  refreshRule(preferredAirport?: AirportCheckin) {
    try {
      const checkins = ((this.data as any).airportCheckins || []) as AirportCheckin[];
      let target = preferredAirport || null;

      if (!target && checkins.length > 0) {
        const randomIndex = Math.floor(Math.random() * checkins.length);
        target = checkins[randomIndex];
      }

      let title = '';
      let content = '';
      let highlightCheckinText = '';

      if (target) {
        const dateText = this.formatCheckinDate(target.firstVisitTimestamp);
        const name = target.shortName || target.icao || target.iata || '某机场';
        const codeText = target.icao || target.iata ? ` (${target.icao || target.iata})` : '';
        title = `第一次来到${name}${codeText}`;
        content = `你第一次来到这里是 ${dateText}。\n已经为你自动完成机场打卡。`;
        const simpleCodeText = target.icao || target.iata ? ` · ${target.icao || target.iata}` : '';
        highlightCheckinText = `${name}${simpleCodeText} · ${dateText} 首访`;
      } else if (checkins.length === 0) {
        title = '还没有机场打卡记录';
        content = '在机场打开「计算工具」页，我会根据GPS自动为你记录第一次到访每个机场的日期。';
        highlightCheckinText = '';
      } else {
        title = '机场打卡';
        content = '暂时无法获取打卡信息，请稍后再试。';
        highlightCheckinText = '';
      }

      const self = this;
      this.setData({
        highlightCheckinText,
        'currentRule.animation': 'fade-out'
      }, function() {
        setTimeout(function() {
          self.setData({
            currentRule: {
              title,
              content,
              animation: 'fade-in'
            }
          });
        }, 200);
      });
    } catch (error) {
      console.error('刷新机场打卡卡片失败:', error);
    }
  },

  onRuleRefreshTap() {
    this.refreshRule();
  },

  openAirportFootprint() {
    try {
      wx.navigateTo({
        url: '/pages/airport-map/index?mode=footprint'
      });
    } catch (error) {
      console.error('打开机场足迹页面失败:', error);
    }
  },

  findNearestAirport(latitude: number, longitude: number, airports: any[]) {
    try {
      if (!airports || !Array.isArray(airports) || airports.length === 0) {
        return null;
      }

      let nearest: any = null;
      let minDistanceKm = Number.POSITIVE_INFINITY;

      const toRad = (deg: number) => deg * Math.PI / 180;

      airports.forEach(function(airport: any) {
        const lat = Number(airport.Latitude);
        const lng = Number(airport.Longitude);
        if (!isFinite(lat) || !isFinite(lng)) {
          return;
        }

        const radLat1 = toRad(latitude);
        const radLat2 = toRad(lat);
        const dLat = radLat2 - radLat1;
        const dLng = toRad(lng - longitude);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(radLat1) * Math.cos(radLat2) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = 6371 * c;

        if (distanceKm < minDistanceKm) {
          minDistanceKm = distanceKm;
          nearest = airport;
        }
      });

      if (!nearest || !isFinite(minDistanceKm)) {
        return null;
      }

      return {
        airport: nearest,
        distanceKm: minDistanceKm
      };
    } catch (error) {
      console.error('查找最近机场失败:', error);
      return null;
    }
  },

  handleAutoCheckinWithLocation(latitude: number, longitude: number, airports: any[]) {
    try {
      const maxDistanceKm = 10;
      const checkins = ((this.data as any).airportCheckins || []) as AirportCheckin[];
      const result = this.findNearestAirport(latitude, longitude, airports);
      if (!result || result.distanceKm > maxDistanceKm) {
        this.refreshRule();
        return;
      }

      const nearest = result.airport;
      const updated = checkins.slice();
      const existingIndex = updated.findIndex(function(item) {
        return item.icao === (nearest.ICAOCode || '').toString();
      });
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const today = year + '-' + month + '-' + day;

      if (existingIndex >= 0) {
        const existing: any = updated[existingIndex] || {};
        const lastVisitDate = existing.lastVisitDate;
        if (lastVisitDate !== today) {
          existing.lastVisitDate = today;
          // 维护每个机场的访问次数，老数据默认从 1 次开始累计
          const currentCount = typeof existing.visitCount === 'number' && existing.visitCount > 0 ? existing.visitCount : 1;
          existing.visitCount = currentCount + 1;
          updated[existingIndex] = existing as AirportCheckin;
          try {
            pilotLevelManager.recordRepeatAirportVisit();
          } catch (error) {
            console.warn('记录重复机场经验失败:', error);
          }
          this.saveAirportCheckinsToStorage(updated);
        }
        this.setData({
          airportCheckins: updated
        });
        this.updateRandomCheckins(updated);
        this.refreshRule(updated[existingIndex]);
        return;
      }

      const timestamp = Date.now();
      const target: AirportCheckin = {
        icao: (nearest.ICAOCode || '').toString(),
        iata: (nearest.IATACode || '').toString(),
        shortName: (nearest.ShortName || '').toString(),
        country: (nearest.CountryName || '').toString(),
        latitude: Number(nearest.Latitude) || 0,
        longitude: Number(nearest.Longitude) || 0,
        elevation: nearest.Elevation !== undefined && nearest.Elevation !== null ? Number(nearest.Elevation) : null,
        firstVisitTimestamp: timestamp,
        lastVisitDate: today,
        visitCount: 1
      };
      updated.push(target);
      this.saveAirportCheckinsToStorage(updated);
      this.setData({
        airportCheckins: updated
      });
      this.updateRandomCheckins(updated);

      try {
        const toastName = target.shortName || target.icao || target.iata || '该机场';
        wx.showToast({
          title: '已为你打卡 ' + toastName,
          icon: 'none',
          duration: 2000
        });
      } catch (error) {
        console.warn('显示机场打卡提示失败:', error);
      }

      try {
        pilotLevelManager.recordNewAirportCheckin(updated.length);
      } catch (error) {
        console.warn('记录新机场经验失败:', error);
      }

      this.refreshRule(target);
    } catch (error) {
      console.error('自动机场打卡失败:', error);
      this.refreshRule();
    }
  },

  autoCheckinNearestAirport() {
    const self = this;

    if (!(this.data as any).airportCheckinsInitialized) {
      this.initializeAirportCheckinsFromStorage();
    }

    try {
      dataManager.loadAirportData().then(function(airports: any[]) {
        if (!airports || !airports.length) {
          console.warn('机场数据为空，无法自动打卡');
          self.refreshRule();
          return;
        }

        wx.getLocation({
          type: 'wgs84',
          altitude: true,
          // @ts-ignore: 小程序环境支持该字段
          isHighAccuracy: true,
          success(res) {
            try {
              const latitude = (res as any).latitude;
              const longitude = (res as any).longitude;
              if (!isFinite(latitude) || !isFinite(longitude)) {
                console.warn('获取到的位置信息无效:', res);
                self.refreshRule();
                return;
              }
              self.handleAutoCheckinWithLocation(latitude, longitude, airports);
            } catch (error) {
              console.error('处理自动机场打卡位置失败:', error);
              self.refreshRule();
            }
          },
          fail(error) {
            console.warn('获取当前位置失败，无法自动打卡:', error);
            self.refreshRule();
          }
        });
      }).catch(function(error: any) {
        console.error('加载机场数据失败，无法自动打卡:', error);
        self.refreshRule();
      });
    } catch (error) {
      console.error('自动机场打卡入口调用失败:', error);
      this.refreshRule();
    }
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
  },

  createSafeTimeout(callback: () => void, delay: number, context?: string) {
    try {
      const timer = setTimeout(() => {
        try {
          if (callback && typeof callback === 'function') {
            callback();
          }
        } catch (error) {
          console.error('❌ 定时器回调执行错误 (' + (context || '未知') + '):', error);
        }
      }, delay);
      return timer;
    } catch (error) {
      console.error('❌ 创建定时器失败 (' + (context || '未知') + '):', error);
      return 0;
    }
  },

  // === 无广告状态检查 ===

  /**
   * 检查无广告状态
   */
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

};

// 使用BasePage基类创建页面（符合CLAUDE.md强制规范）
Page(BasePage.createPage(pageConfig));