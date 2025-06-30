// 双发复飞梯度页面
// 工具管理器将在需要时动态引入

Page({
  data: {
    // 警告弹窗状态
    showWarningDialog: true,
    
    // 数据加载相关 - Context7性能优化
    performanceData: [],
    isDataLoaded: false, // 数据加载状态标记
    dataLoadTime: 0,     // 数据加载时间戳
    isLoading: false,    // 新增：加载锁，防止并发加载
    loadingSource: '',   // 新增：加载来源标记，便于调试
    
    // 界面状态 - Context7分级导航
    showAircraftSeries: true,    // 显示飞机系列列表
    showModelList: false,        // 显示机型列表
    showResults: false,          // 显示查询结果
    
    // 分级导航数据
    aircraftSeries: [],       // 飞机系列列表
    selectedSeries: null,       // 选中的系列
    currentSeriesModels: [],  // 当前系列下的机型列表
    
    // Context7简化：移除搜索功能，使用分级导航
    
    // 选择参数
    currentModelData: null,
    selectedWeight: '',
    selectedAltitude: '',
    
    // Context7智能参数管理
    availableWeights: [],
    availableAltitudes: [],
    availableAltitudesForCurrentWeight: [], // 当前重量下可用的高度
    parameterMatrix: {}, // 重量-高度可用性矩阵
    
    // Context7移动端UX：Picker组件状态
    showWeightPicker: false,
    showAltitudePicker: false,
    weightColumns: [],
    altitudeColumns: [],
    selectedWeightIndex: [0], // Picker选中的索引
    selectedAltitudeIndex: [0], // Picker选中的索引
    
    // 结果显示
    gradient: '',
    
    // 防抖优化
    selectionDebounceTimer: null,

    // 🎯 基于Context7最佳实践：广告相关数据
    showAd: false,
    adUnitId: '',
    // 新增：A350和B737系列间的广告位
    showA350B737MiddleAd: false,
    a350B737MiddleAdUnitId: '',
    // 新增：第一层页面顶部广告 - 飞机系列选择页面
    showSeriesTopAd: false,
    seriesTopAdUnitId: '',
    // 新增：第二层页面顶部广告 - 机型选择页面
    showModelTopAd: false,
    modelTopAdUnitId: ''
  },

  onLoad() {
    console.log('📄 页面加载开始');
    
    // 🎯 基于Context7最佳实践：初始化广告
    this.initAd();
    
    // ⚡ Context7预加载策略：在页面加载时立即开始数据预加载
    this.preloadData();
  },

  // Context7分级导航：自定义返回逻辑（已在下方有onUnload方法，这里删除重复）

  // Context7原生导航：使用微信原生导航栏，提供系统返回按钮

  // ⚡ Context7预加载策略：提前加载数据，确保用户交互时响应迅速
  async preloadData() {
    console.log('🚀 开始预加载双发复飞梯度数据...');
    try {
      await this.loadPerformanceData('preload');
      console.log('✅ 预加载完成，数据已准备就绪');
      
      // 预加载完成后显示警告弹窗
      this.setData({
        showWarningDialog: true
      });
    } catch (error) {
      console.warn('⚠️ 预加载失败，将在用户操作时加载:', error);
      // 即使预加载失败也要显示警告弹窗
      this.setData({
        showWarningDialog: true
      });
    }
  },

  onShow() {
    // Context7页面生命周期最佳实践：检查数据状态
    console.log('📄 页面显示，当前数据状态:', {
      isDataLoaded: this.data.isDataLoaded,
      isLoading: this.data.isLoading,
      dataCount: this.data.performanceData.length,
      loadingSource: this.data.loadingSource,
      dataAge: this.data.dataLoadTime > 0 ? Math.round((Date.now() - this.data.dataLoadTime) / 1000) : 0
    });
    
    // 如果数据加载状态异常（比如热重载导致的状态丢失），尝试恢复
    if (!this.data.isDataLoaded && !this.data.isLoading && this.data.performanceData.length === 0) {
      console.log('⚠️ 检测到数据状态异常，可能由热重载引起');
      // 不自动加载，等待用户操作或警告弹窗触发
    }
  },

  // 关闭警告弹窗并加载数据 - Context7优化
  closeWarningDialog() {
    this.setData({
      showWarningDialog: false
    });
    // 只在未加载数据时才加载
    if (!this.data.isDataLoaded && !this.data.isLoading) {
      this.loadPerformanceData('closeWarningDialog');
    } else {
      console.log('🚫 跳过数据加载：数据已存在或正在加载中');
    }
  },

  // 加载性能数据 - 基于Context7性能优化和加载锁机制
  async loadPerformanceData(source: string = 'unknown') {
    try {
      console.log(`🔍 加载请求来源: ${source}`);
      
      // 强制检查：如果正在加载中，直接返回
      if (this.data.isLoading) {
        console.log('🚫 已有加载进程在运行，跳过重复加载');
        return;
      }
      
      // 检查数据缓存有效性
      const now = Date.now();
      const dataAge = now - this.data.dataLoadTime;
      const CACHE_VALID_TIME = 5 * 60 * 1000; // 5分钟内数据有效
      
      if (this.data.isDataLoaded && this.data.performanceData.length > 0 && dataAge < CACHE_VALID_TIME) {
        console.log(`📚 使用已加载的性能数据，跳过重复加载 (数据年龄: ${Math.round(dataAge/1000)}秒)`);
        return;
      }
      
      // 设置加载锁
      this.setData({
        isLoading: true,
        loadingSource: source
      });
      
      console.log(`📦 开始加载双发复飞梯度数据... (来源: ${source})`);
      
      // 使用数据管理器加载数据
      const dataManager = require('../../utils/twin-engine-data-manager.js');
      const performanceData = await dataManager.loadTwinEngineData();
      
      if (performanceData && performanceData.length > 0) {
        // Context7分级导航：按飞机系列分组
        const aircraftSeries = this.groupByAircraftSeries(performanceData);
        
        this.setData({
          performanceData: performanceData,
          aircraftSeries: aircraftSeries,
          showAircraftSeries: true,  // 显示系列列表
          showModelList: false,
          showResults: false,
          isDataLoaded: true,
          dataLoadTime: now,
          isLoading: false, // 释放加载锁
          loadingSource: ''
        });
        
        // Context7原生导航：使用系统导航栏，无需手动更新状态
        
        console.log(`✅ 成功加载双发复飞梯度数据，共${performanceData.length}个机型，分为${aircraftSeries.length}个系列 (来源: ${source})`);
      } else {
        console.error('未能加载到性能数据');
        this.setData({
          isLoading: false, // 释放加载锁
          loadingSource: ''
        });
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error(`加载性能数据失败 (来源: ${source}):`, error);
      this.setData({
        isLoading: false, // 释放加载锁
        loadingSource: ''
      });
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },

  // Context7分级导航：移除搜索功能，简化为纯分级导航模式

  // 选择具体机型 - Context7智能参数过滤优化
  onModelSelect(event: any) {
    const index = event.currentTarget.dataset.index;
    const selectedModel = this.data.currentSeriesModels[index];
    
    console.log('选择机型:', index, selectedModel);
    
    if (!selectedModel) {
      console.error('未找到选中的机型数据');
      wx.showToast({
        title: '机型数据异常',
        icon: 'none'
      });
      return;
    }

    // Context7智能参数分析：分析所有可用的重量和高度组合
    const availableParams = this.analyzeAvailableParameters(selectedModel);
    
    // 根据可用参数智能设置默认值
    const defaultWeight = availableParams.recommendedWeight;
    const defaultAltitude = availableParams.recommendedAltitude;
    
    // 获取默认重量下的可用高度
    const availableAltitudesForDefaultWeight = defaultWeight ? 
      this.getAvailableAltitudesForWeightDirect(defaultWeight, availableParams.matrix) : [];

    // Context7移动端UX：构建Picker组件所需的数据格式
    const weightValues = availableParams.weights; // 直接使用分析出的重量数组
    const weightColumns = [{
      values: weightValues
    }];
    
    const altitudeColumns = defaultWeight ? [{
      values: availableAltitudesForDefaultWeight
    }] : [];
    
    // 找到默认重量的索引
    const defaultWeightIndex = weightValues.indexOf(defaultWeight);
    const defaultAltitudeIndex = availableAltitudesForDefaultWeight.indexOf(defaultAltitude);

    this.setData({
      currentModelData: selectedModel,
      selectedWeight: defaultWeight,
      selectedAltitude: defaultAltitude,
      availableAltitudesForCurrentWeight: availableAltitudesForDefaultWeight,
      parameterMatrix: availableParams.matrix,
      availableWeights: availableParams.weights, // 确保重量选项数据正确
      
      // Context7移动端UX：Picker数据
      weightColumns: weightColumns,
      altitudeColumns: altitudeColumns,
      selectedWeightIndex: [Math.max(0, defaultWeightIndex)],
      selectedAltitudeIndex: [Math.max(0, defaultAltitudeIndex)],
      
      // Context7界面状态管理：确保正确的页面切换
      showAircraftSeries: false,  // 隐藏系列列表
      showModelList: false,       // 隐藏机型列表
      showResults: true,          // 显示参数设置和结果区域
      gradient: '' // 清除之前的结果
    });
    
    console.log('✅ 智能参数分析完成:', {
      currentModelData: selectedModel.model,
      defaultWeight: defaultWeight,
      defaultAltitude: defaultAltitude,
      availableWeights: availableParams.weights.length,
      totalAltitudes: availableParams.altitudes.length,
      availableForDefaultWeight: availableAltitudesForDefaultWeight.length
    });
    
    console.log('🎯 Picker数据构建:', {
      weightValues: weightValues,
      weightColumns: weightColumns,
      altitudeColumns: altitudeColumns,
      selectedWeightIndex: [Math.max(0, defaultWeightIndex)],
      selectedAltitudeIndex: [Math.max(0, defaultAltitudeIndex)]
    });
    
    console.log('🔄 界面状态切换:', {
      showAircraftSeries: false,
      showModelList: false,
      showResults: true,
      hasCurrentModel: !!selectedModel
    });
    
    // Context7原生导航：使用系统导航栏
    
    // 延迟检查页面状态，确保setData完成
    setTimeout(() => {
      this.checkPageState();
    }, 100);
  },

  // Context7智能高度过滤：直接从矩阵获取可用高度（不依赖this.data）
  getAvailableAltitudesForWeightDirect(weight: string, matrix: any): string[] {
    if (!matrix || !weight) return [];
    
    const availableAltitudes = matrix[weight] || [];
    // 按数字大小排序
    return availableAltitudes.sort((a: any, b: any) => parseInt(a) - parseInt(b));
  },

  // Context7智能重量过滤：根据高度获取可用重量（反向查询）
  getAvailableWeightsForAltitudeDirect(altitude: string, matrix: any): string[] {
    if (!matrix || !altitude) return [];
    
    const availableWeights = [];
    
    // 遍历矩阵找出包含指定高度的所有重量
    for (const weight in matrix) {
      if (matrix.hasOwnProperty(weight)) {
        const altitudes = matrix[weight] || [];
        if (altitudes.indexOf(altitude) !== -1) {
          availableWeights.push(weight);
        }
      }
    }
    
    // 按数字大小排序
    return availableWeights.sort((a: any, b: any) => parseInt(a) - parseInt(b));
  },

  // Context7智能建议方法已移除：动态过滤系统使智能建议变得多余

  // Context7智能参数分析：分析机型的所有可用重量和高度组合
  analyzeAvailableParameters(modelData: any) {
    const weights = [];
    const altitudes: any = {}; // 使用对象替代Set
    const matrix: any = {}; // 使用对象替代Map
    
    console.log('🔍 开始分析机型参数:', modelData.model, '数据条目数:', modelData.data ? modelData.data.length : 0);
    
    // 分析所有重量数据
    if (modelData.data && modelData.data.length > 0) {
      for (let i = 0; i < modelData.data.length; i++) {
        const weightItem = modelData.data[i];
        const weight = weightItem.weight_kg.toString();
        weights.push(weight);
        
        console.log(`📊 处理重量: ${weight}kg, 高度选项:`, Object.keys(weightItem.values || {}));
        
        // 分析该重量下所有可用的高度
        const availableAltitudesForWeight = [];
        if (weightItem.values) {
          for (const altitude in weightItem.values) {
            altitudes[altitude] = true; // 使用对象键记录高度
            availableAltitudesForWeight.push(altitude);
          }
        }
        
        matrix[weight] = availableAltitudesForWeight;
      }
    }
    
    // 手动转换对象键为数组并排序，替代Array.from
    const sortedAltitudes = [];
    for (const altitude in altitudes) {
      sortedAltitudes.push(altitude);
    }
    sortedAltitudes.sort((a: any, b: any) => parseInt(a) - parseInt(b));
    
    // 智能推荐默认值
    const recommendedWeight = weights.length > 0 ? weights[Math.floor(weights.length / 2)] : '';
    const recommendedAltitude = altitudes['0'] ? '0' : sortedAltitudes[0] || '';
    
    console.log('📊 参数分析结果:', {
      总重量选项: weights.length,
      总高度选项: sortedAltitudes.length,
      推荐重量: recommendedWeight,
      推荐高度: recommendedAltitude,
      重量数组: weights,
      高度数组: sortedAltitudes.slice(0, 5), // 只显示前5个避免日志过长
      矩阵示例: Object.keys(matrix).slice(0, 3)
    });
    
    return {
      weights: weights,
      altitudes: sortedAltitudes,
      matrix: matrix,
      recommendedWeight: recommendedWeight,
      recommendedAltitude: recommendedAltitude
    };
  },

  // Context7参数验证方法已移除：动态过滤系统确保参数组合100%有效

  // 查询梯度 - Context7动态过滤优化
  queryGradient() {
    const { selectedWeight, selectedAltitude, currentModelData } = this.data;
    
    if (!currentModelData) {
      wx.showToast({
        title: '请先选择机型',
        icon: 'none'
      });
      return;
    }
    
    if (!selectedWeight || !selectedAltitude) {
      wx.showToast({
        title: '请选择重量和高度',
        icon: 'none'
      });
      return;
    }
    
    // Context7动态过滤优化：由于双向动态过滤系统确保参数组合100%有效，移除冗余验证

    // 参数验证函数
    const validateParams = () => {
      if (!currentModelData) {
        return { valid: false, message: '请先选择机型' };
      }
      
      if (!selectedWeight || !selectedAltitude) {
        return { valid: false, message: '请选择重量和高度' };
      }
      
      return { valid: true };
    };

    // 实际查询逻辑
    const performQuery = () => {
      this.performGradientQuery();
    };

    // 使用扣费管理器执行查询
    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'twin-engine-query',
      validateParams,
      `查询${currentModelData.model}梯度`,
      performQuery
    );
  },

  // 分离出来的实际查询逻辑
  performGradientQuery() {
    const { selectedWeight, selectedAltitude, currentModelData } = this.data;

    // 显示加载动画
    wx.showLoading({
      title: '计算中...',
      mask: true
    });
    
    // 查找对应的梯度值
    console.log('🔍 开始查询梯度:', { selectedWeight, selectedAltitude });
    
    const selectedWeightNum = parseInt(selectedWeight);
    const weightData = currentModelData.data.find((item: any) => 
      item.weight_kg === selectedWeightNum
    );
    
    console.log('重量匹配结果:', weightData);
    
    // 模拟查询延迟，提供更好的用户体验
    setTimeout(() => {
      wx.hideLoading();
      
      if (weightData && weightData.values && weightData.values[selectedAltitude] !== undefined) {
        const gradient = weightData.values[selectedAltitude];
        this.batchUpdateData({ gradient: gradient.toString() });
        
        // 成功查询日志和反馈
        console.log(`✅ 查询成功: ${currentModelData.model}, 重量${selectedWeight}kg, 高度${selectedAltitude}ft, 梯度${gradient}%`);
        
        // 成功提示音效
        wx.showToast({
          title: '查询成功！',
          icon: 'success',
          duration: 1500
        });
        
        // 动态计算并滚动到结果区域
        this.scrollToResults();
        
      } else {
        // Context7动态过滤保障：理论上不应该发生，但保留兜底处理
        console.error(`❌ 数据异常: 动态过滤后仍然查询失败 机型=${currentModelData.model}, 重量=${selectedWeight}, 高度=${selectedAltitude}`);
        this.batchUpdateData({ gradient: '数据异常' });
        
        wx.showToast({
          title: '数据异常，请检查机型数据',
          icon: 'none',
          duration: 2000
        });
      }
    }, 300); // 减少延迟到300ms，提升响应速度
  },

  // 注释：已移除onWeightChange和onAltitudeChange方法，现在使用Picker组件替代Radio按钮

  // 智能滚动到结果区域 - 基于Context7最佳实践
  scrollToResults() {
    // 延迟执行，确保DOM更新完成
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      
      // 优先使用ID选择器定位结果卡片
      query.select('#result-card').boundingClientRect();
      query.selectViewport().scrollOffset();
      
      query.exec((res) => {
        if (res[0] && res[1]) {
          // 计算结果卡片相对于页面顶部的位置
          const cardTop = res[0].top + res[1].scrollTop;
          // 留出导航栏空间和一些缓冲区域（80px约等于160rpx）
          const targetScrollTop = Math.max(0, cardTop - 80);
          
          console.log('📍 精确滚动定位:', {
            cardInfo: res[0],
            cardTop,
            targetScrollTop,
            viewport: res[1]
          });
          
          wx.pageScrollTo({
            scrollTop: targetScrollTop,
            duration: 600,
            success: () => {
              console.log('✅ 滚动到结果区域成功');
            },
            fail: (err) => {
              console.error('❌ 滚动失败:', err);
            }
          });
        } else {
          // 兜底方案：如果查询失败，尝试其他选择器
          console.warn('⚠️ 主选择器失败，尝试兜底方案');
          this.fallbackScroll();
        }
      });
    }, 200); // 等待DOM渲染完成
  },

     // 兜底滚动方案
   fallbackScroll() {
     // 尝试多个选择器
     const query = wx.createSelectorQuery();
     query.select('.gradient-result-card').boundingClientRect();
     query.select('#result-section').boundingClientRect();
     query.selectViewport().scrollOffset();
     
     query.exec((res) => {
       let targetScrollTop = 1000; // 默认位置
       
       if (res[0] && res[2]) {
         // 找到了结果卡片
         const cardTop = res[0].top + res[2].scrollTop;
         targetScrollTop = Math.max(0, cardTop - 80);
         console.log('🎯 使用结果卡片位置:', targetScrollTop);
       } else if (res[1] && res[2]) {
         // 找到了结果区域
         const sectionTop = res[1].top + res[2].scrollTop;
         targetScrollTop = Math.max(0, sectionTop - 60);
         console.log('🎯 使用结果区域位置:', targetScrollTop);
       } else {
         console.warn('⚠️ 所有选择器失败，使用预估位置');
       }
       
       wx.pageScrollTo({
         scrollTop: targetScrollTop,
         duration: 600,
         success: () => {
           console.log('✅ 兜底滚动成功');
         }
       });
     });
   },

  // 页面卸载时清理定时器 - Context7内存优化最佳实践
  onUnload() {
    this.clearAllTimers();
  },

  // 页面隐藏时清理定时器 - Context7内存优化最佳实践
  onHide() {
    this.clearAllTimers();
  },
  
  // 清理所有定时器的统一方法
  clearAllTimers() {
    if (this.data.selectionDebounceTimer) {
      clearTimeout(this.data.selectionDebounceTimer);
    }
    console.log('🧹 已清理所有定时器');
  },
  
  // Context7调试工具：手动重置数据状态（开发时使用）
  resetDataState() {
    console.log('🔄 手动重置数据状态');
    this.setData({
      isDataLoaded: false,
      dataLoadTime: 0,
      isLoading: false,
      loadingSource: '',
      performanceData: [],
      showAircraftSeries: true,
      showModelList: false,
      showResults: false,
      currentModelData: null,
      selectedWeight: '',
      selectedAltitude: '',
      gradient: ''
    });
  },

  // Context7调试工具：检查页面状态
  checkPageState() {
    console.log('📊 当前页面状态:', {
      showAircraftSeries: this.data.showAircraftSeries,
      showModelList: this.data.showModelList,
      showResults: this.data.showResults,
      showWarningDialog: this.data.showWarningDialog,
      hasCurrentModel: !!this.data.currentModelData,
      hasSelectedSeries: !!this.data.selectedSeries,
      dataLoaded: this.data.isDataLoaded,
      performanceDataCount: this.data.performanceData.length
    });
  },

  // ⚡ Context7批量更新策略：减少setData调用频率，提升性能
  batchUpdateData(updates: any, callback?: () => void) {
    // 合并所有更新到一次setData调用中
    this.setData(updates, callback);
  },

  // ⚡ Context7即时更新策略：对于UI反馈，提供即时响应
  immediateUpdateData(updates: any) {
    this.setData(updates);
  },

  // 返回机型列表
  backToModelList() {
    if (this.data.selectedSeries) {
      // 如果在系列中，返回到当前系列的机型列表
      this.setData({
        showModelList: true,
        showResults: false,
        currentModelData: null,
        selectedWeight: '',
        selectedAltitude: '',
        gradient: ''
      });
      
      // Context7原生导航：使用系统导航栏，无需手动更新状态
    } else {
      // 如果没有选择系列，返回到系列列表
      this.backToSeriesList();
    }
  },

  // Context7移动端UX：Picker组件方法
  
  // 显示重量选择器
  showWeightPicker() {
    this.setData({
      showWeightPicker: true
    });
  },

  // 关闭重量选择器
  closeWeightPicker() {
    this.setData({
      showWeightPicker: false
    });
  },

  // 重量选择器确认 - 基于Vant官方文档优化
  onWeightConfirm(event: any) {
    console.log('🎯 重量Picker确认事件详情:', event.detail);
    
    // 根据官方文档：单列选择器返回 { picker, value, index }
    const { value, index } = event.detail;
    const selectedIndex = index !== undefined ? (Array.isArray(index) ? index[0] : index) : 0;
    
    // Context7数据类型统一处理：确保返回字符串格式
    let selectedValue = '';
    if (Array.isArray(value) && value.length > 0) {
      selectedValue = value[0].toString();
    } else if (value) {
      selectedValue = value.toString();
    } else {
      selectedValue = this.data.weightColumns[0].values[selectedIndex];
    }
    
    console.log('🎯 重量Picker确认选择:', selectedValue, '索引:', selectedIndex, '原始value类型:', typeof value, Array.isArray(value) ? '(数组)' : '(非数组)');
    
    // Context7动态过滤：更新选中的重量和对应的可用高度
    const availableAltitudesForWeight = this.getAvailableAltitudesForWeightDirect(selectedValue, this.data.parameterMatrix);
    
    // 构建高度选择器数据
    const altitudeColumns = [{
      values: availableAltitudesForWeight
    }];
    
    // Context7智能默认值：如果之前选择的高度仍然有效，保持选择；否则重置
    let newSelectedAltitude = '';
    let newSelectedAltitudeIndex = [0];
    
    if (this.data.selectedAltitude && availableAltitudesForWeight.indexOf(this.data.selectedAltitude) !== -1) {
      // 之前选择的高度仍然有效，保持选择
      newSelectedAltitude = this.data.selectedAltitude;
      newSelectedAltitudeIndex = [availableAltitudesForWeight.indexOf(this.data.selectedAltitude)];
      console.log('🎯 Context7智能保持：高度选择', newSelectedAltitude, '仍然有效，保持不变');
    } else {
      // 之前选择的高度无效，使用智能推荐
      if (availableAltitudesForWeight.length > 0) {
        // 优先选择0ft（如果有），否则选择最小的高度
        if (availableAltitudesForWeight.indexOf('0') !== -1) {
          newSelectedAltitude = '0';
          newSelectedAltitudeIndex = [availableAltitudesForWeight.indexOf('0')];
        } else {
          newSelectedAltitude = availableAltitudesForWeight[0];
          newSelectedAltitudeIndex = [0];
        }
        console.log('🎯 Context7智能推荐：高度自动选择', newSelectedAltitude);
      }
    }
    
    this.setData({
      selectedWeight: selectedValue,
      selectedWeightIndex: [selectedIndex],
      availableAltitudesForCurrentWeight: availableAltitudesForWeight,
      altitudeColumns: altitudeColumns,
      selectedAltitude: newSelectedAltitude,
      selectedAltitudeIndex: newSelectedAltitudeIndex,
      gradient: '', // 清除之前的结果
      showWeightPicker: false
    });
    
    // Context7用户体验优化：显示动态过滤的反馈信息
    if (availableAltitudesForWeight.length > 0) {
      console.log(`🔄 Context7动态过滤：重量${selectedValue}kg下有${availableAltitudesForWeight.length}个可用高度选项`);
      
      // Context7自动查询优化：参数完整时自动触发查询，提升用户体验
      if (selectedValue && newSelectedAltitude) {
        console.log('🚀 Context7自动查询：参数已完整，触发自动查询');
        setTimeout(() => {
          this.queryGradient();
        }, 100); // 短暂延迟确保setData完成
      }
    } else {
      console.warn(`⚠️ Context7数据警告：重量${selectedValue}kg下无可用高度选项`);
    }
  },

  // 重量选择器变化
  onWeightPickerChange(event: any) {
    const selectedIndex = event.detail.index;
    this.setData({
      selectedWeightIndex: [selectedIndex]
    });
  },

  // 显示高度选择器
  showAltitudePicker() {
    if (!this.data.selectedWeight) {
      wx.showToast({
        title: '请先选择重量',
        icon: 'none'
      });
      return;
    }
    this.setData({
      showAltitudePicker: true
    });
  },

  // 关闭高度选择器
  closeAltitudePicker() {
    this.setData({
      showAltitudePicker: false
    });
  },

  // 高度选择器确认 - 基于Vant官方文档优化
  onAltitudeConfirm(event: any) {
    console.log('🎯 高度Picker确认事件详情:', event.detail);
    
    // 根据官方文档：单列选择器返回 { picker, value, index }
    const { value, index } = event.detail;
    const selectedIndex = index !== undefined ? (Array.isArray(index) ? index[0] : index) : 0;
    
    // Context7数据类型统一处理：确保返回字符串格式
    let selectedValue = '';
    if (Array.isArray(value) && value.length > 0) {
      selectedValue = value[0].toString();
    } else if (value) {
      selectedValue = value.toString();
    } else {
      selectedValue = this.data.altitudeColumns[0].values[selectedIndex];
    }
    
    console.log('🎯 高度Picker确认选择:', selectedValue, '索引:', selectedIndex, '原始value类型:', typeof value, Array.isArray(value) ? '(数组)' : '(非数组)');
    
    // Context7动态过滤：更新选中的高度和对应的可用重量
    const availableWeightsForAltitude = this.getAvailableWeightsForAltitudeDirect(selectedValue, this.data.parameterMatrix);
    
    // 构建重量选择器数据
    const weightColumns = [{
      values: availableWeightsForAltitude
    }];
    
    // Context7智能默认值：如果之前选择的重量仍然有效，保持选择；否则重置
    let newSelectedWeight = '';
    let newSelectedWeightIndex = [0];
    
    if (this.data.selectedWeight && availableWeightsForAltitude.indexOf(this.data.selectedWeight) !== -1) {
      // 之前选择的重量仍然有效，保持选择
      newSelectedWeight = this.data.selectedWeight;
      newSelectedWeightIndex = [availableWeightsForAltitude.indexOf(this.data.selectedWeight)];
      console.log('🎯 Context7智能保持：重量选择', newSelectedWeight, '仍然有效，保持不变');
    } else {
      // 之前选择的重量无效，使用智能推荐
      if (availableWeightsForAltitude.length > 0) {
        // 选择中间重量作为默认值（更符合实际使用场景）
        const middleIndex = Math.floor(availableWeightsForAltitude.length / 2);
        newSelectedWeight = availableWeightsForAltitude[middleIndex];
        newSelectedWeightIndex = [middleIndex];
        console.log('🎯 Context7智能推荐：重量自动选择', newSelectedWeight);
      }
    }
    
    this.setData({
      selectedAltitude: selectedValue,
      selectedAltitudeIndex: [selectedIndex],
      selectedWeight: newSelectedWeight,
      selectedWeightIndex: newSelectedWeightIndex,
      weightColumns: weightColumns,
      gradient: '', // 清除之前的结果
      showAltitudePicker: false
    });
    
    // Context7用户体验优化：显示动态过滤的反馈信息
    if (availableWeightsForAltitude.length > 0) {
      console.log(`🔄 Context7动态过滤：高度${selectedValue}ft下有${availableWeightsForAltitude.length}个可用重量选项`);
      
      // Context7自动查询优化：参数完整时自动触发查询，提升用户体验
      if (newSelectedWeight && selectedValue) {
        console.log('🚀 Context7自动查询：参数已完整，触发自动查询');
        setTimeout(() => {
          this.queryGradient();
        }, 100); // 短暂延迟确保setData完成
      }
    } else {
      console.warn(`⚠️ Context7数据警告：高度${selectedValue}ft下无可用重量选项`);
    }
  },

  // 高度选择器变化
  onAltitudePickerChange(event: any) {
    const selectedIndex = event.detail.index;
    this.setData({
      selectedAltitudeIndex: [selectedIndex]
    });
  },

  // Context7分级导航：按飞机系列分组
  groupByAircraftSeries(data: any[]): any[] {
    const seriesMap: any = {};
    
    data.forEach((item) => {
      const series = this.getAircraftSeries(item.model);
      if (!seriesMap[series]) {
        seriesMap[series] = [];
      }
      seriesMap[series].push(item);
    });
    
    const aircraftSeries: any[] = [];
    for (const series in seriesMap) {
      if (seriesMap.hasOwnProperty(series)) {
        aircraftSeries.push({
          series: series,
          models: seriesMap[series],
          count: seriesMap[series].length
        });
      }
    }
    
    // 按系列名称排序
    aircraftSeries.sort((a, b) => a.series.localeCompare(b.series));
    
    return aircraftSeries;
  },

  // Context7智能识别：根据机型名称确定飞机系列
  getAircraftSeries(model: string): string {
    if (model.indexOf('A319') !== -1 || model.indexOf('A320') !== -1 || model.indexOf('A321') !== -1) {
      return 'A320系列';
    }
    if (model.indexOf('A330') !== -1 || model.indexOf('A332') !== -1 || model.indexOf('A333') !== -1) {
      return 'A330系列';
    }
    if (model.indexOf('A340') !== -1) {
      return 'A340系列';
    }
    if (model.indexOf('A350') !== -1) {
      return 'A350系列';
    }
    if (model.indexOf('A380') !== -1) {
      return 'A380系列';
    }
    if (model.indexOf('B737') !== -1 || model.indexOf('737') !== -1) {
      return 'B737系列';
    }
    if (model.indexOf('B747') !== -1 || model.indexOf('747') !== -1) {
      return 'B747系列';
    }
    if (model.indexOf('B767') !== -1 || model.indexOf('767') !== -1) {
      return 'B767系列';
    }
    if (model.indexOf('B777') !== -1 || model.indexOf('777') !== -1) {
      return 'B777系列';
    }
    if (model.indexOf('B787') !== -1 || model.indexOf('787') !== -1) {
      return 'B787系列';
    }
    // 默认分类
    return '其他机型';
  },

  // Context7分级导航：选择飞机系列
  onSeriesSelect(event: any) {
    const seriesIndex = event.currentTarget.dataset.index;
    const selectedSeries = this.data.aircraftSeries[seriesIndex];
    
    console.log('🏷️ 选择飞机系列:', selectedSeries.series, '包含机型数:', selectedSeries.count);
    
    this.setData({
      selectedSeries: selectedSeries,
      currentSeriesModels: selectedSeries.models,
      filteredList: selectedSeries.models, // 显示该系列的机型
      showAircraftSeries: false,  // 隐藏系列列表
      showModelList: true,        // 显示机型列表
      showResults: false,
      searchValue: '',           // 清除搜索
    });
    
    // Context7原生导航：使用系统导航栏
  },

  // Context7分级导航：返回飞机系列列表
  backToSeriesList() {
    this.setData({
      showAircraftSeries: true,   // 显示系列列表
      showModelList: false,       // 隐藏机型列表
      showResults: false,
      selectedSeries: null,
      currentSeriesModels: [],
      filteredList: this.data.performanceData, // 恢复完整列表
      searchValue: '',           // 清除搜索
      currentModelData: null,
      selectedWeight: '',
      selectedAltitude: '',
      gradient: ''
    });
    
    // Context7原生导航：使用系统导航栏
  },

  // 🎯 基于Context7最佳实践：广告相关方法
  initAd() {
    try {
      const adManagerUtil = require('../../utils/ad-manager.js');
      const AdManager = adManagerUtil;
      const adManager = new AdManager();
      const adUnit = adManager.getBestAdUnit('calculation');
      
      if (adUnit) {
        this.setData({
          showAd: true,
          adUnitId: adUnit.id
        });
      }
      
      // 新增：初始化A350和B737系列间的广告
      this.initA350B737MiddleAd(adManager);
      
      // 新增：初始化第一层页面顶部广告 - 飞机系列选择页面
      this.initSeriesTopAd(adManager);
      
      // 新增：初始化第二层页面顶部广告 - 机型选择页面
      this.initModelTopAd(adManager);
    } catch (error) {
      console.log('广告初始化失败:', error);
    }
  },

  // A350和B737系列间的广告（横幅类）
  initA350B737MiddleAd(adManager: any) {
    const adUnit = adManager.getBestAdUnit('a350-b737-middle', 'secondary');
    if (adUnit) {
      this.setData({
        showA350B737MiddleAd: true,
        a350B737MiddleAdUnitId: adUnit.id
      });
      console.log('🎯 A350和B737系列间广告初始化:', adUnit.format);
    }
  },

  // 第一层页面顶部广告 - 飞机系列选择页面
  initSeriesTopAd(adManager: any) {
    const adUnit = adManager.getBestAdUnit('list', 'primary');
    if (adUnit) {
      this.setData({
        showSeriesTopAd: true,
        seriesTopAdUnitId: adUnit.id
      });
      console.log('🎯 飞机系列页面顶部广告初始化:', adUnit.format);
    }
  },

  // 第二层页面顶部广告 - 机型选择页面
  initModelTopAd(adManager: any) {
    const adUnit = adManager.getBestAdUnit('secondary-page', 'primary');
    if (adUnit) {
      this.setData({
        showModelTopAd: true,
        modelTopAdUnitId: adUnit.id
      });
      console.log('🎯 机型选择页面顶部广告初始化:', adUnit.format);
    }
  },

  onAdLoad() {
    try {
      const AdManager = adManagerUtil;
      const adManager = new AdManager();
      adManager.recordAdShown(this.data.adUnitId);
    } catch (error) {
      console.log('广告记录失败:', error);
    }
  },

  onAdError() {
    this.setData({ 
      showAd: false,
      showA350B737MiddleAd: false,
      showSeriesTopAd: false,
      showModelTopAd: false
    });
  }
}) 