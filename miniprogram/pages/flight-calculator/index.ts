// 飞行计算页面 - 整合飞行速算、特殊计算、常用换算三个页面

// 导入积分管理器
const pointsManager = require('../../utils/points-manager.js');

Page({
  data: {
    // 页面导航状态
    selectedModule: '', // 当前选中的模块
    
    // 模块标题
    moduleTitle: '',
    
    // 音频分包加载状态
    loadedPackages: [],

    // 单位换算数据
    unitConverterData: {
      temperatureValues: {
        celsius: '',
        fahrenheit: ''
      }
    }

  },

  onLoad() {
    // 初始化预加载分包状态
    this.initializePreloadedPackages();
    
    // 页面加载时初始化
    this.initializeData();
    
    console.log('✨ 飞行计算页面已就绪');

  },

  onShow() {
    // 页面显示时的操作
  },

  onUnload() {
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
    
    // 直接跳转到模块，积分扣费在子页面处理
    this.navigateToModule(module);
  },
  
  // 导航到具体模块
  navigateToModule(module: string) {
    // 跳转到独立子页面的模块
    const independentModules = ['descent', 'crosswind', 'turn', 'glideslope', 'detour', 'gradient', 'distance', 'speed', 'temperature', 'weight', 'pressure', 'isa', 'coldTemp', 'gpws', 'pitch'];
    if (independentModules.includes(module)) {
      // 处理目录名与模块名不一致的情况
      const modulePathMap: { [key: string]: string } = {
        'coldTemp': 'cold-temp'
      };
      const modulePath = modulePathMap[module] || module;
      
      wx.navigateTo({
        url: `/packageO/flight-calc-modules/${modulePath}/index`
      });
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
      'pitch': '⚠️ PITCH警告',
      'gpws': '🚨 GPWS模拟',
      
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
      title: '飞行工具箱 - 飞行计算',
      desc: '专业飞行计算工具，支持飞行速算、特殊计算、常用换算',
      path: '/pages/flight-calculator/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行计算工具',
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

  // 广告事件处理
  adLoad() {
    console.log('横幅广告加载成功');
  },

  adError(err: any) {
    console.error('横幅广告加载失败', err);
  },

  adClose() {
    console.log('横幅广告关闭');
  }
});