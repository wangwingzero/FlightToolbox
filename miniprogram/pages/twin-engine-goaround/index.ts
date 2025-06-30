Page({
  data: {
    // 警告弹窗
    showWarningDialog: true,
    
    // 数据加载
    performanceData: [],
    isDataLoaded: false,
    isLoading: false,
    
    // 界面状态
    showAircraftSeries: true,
    showModelList: false,
    showResults: false,
    
    // 分级导航数据
    aircraftSeries: [],
    selectedSeries: null,
    currentSeriesModels: [],
    
    // 选择参数
    currentModelData: null,
    selectedWeight: '',
    selectedAltitude: '',
    
    // 参数管理
    availableAltitudesForCurrentWeight: [],
    parameterMatrix: {},
    
    // Picker组件
    showWeightPicker: false,
    showAltitudePicker: false,
    weightColumns: [],
    altitudeColumns: [],
    selectedWeightIndex: [0],
    selectedAltitudeIndex: [0],
    
    // 结果
    gradient: '',
    
    // 广告
    showAd: false,
    adUnitId: '',
    showA350B737MiddleAd: false,
    a350B737MiddleAdUnitId: '',
    showSeriesTopAd: false,
    seriesTopAdUnitId: '',
    showModelTopAd: false,
    modelTopAdUnitId: ''
  },

  onLoad() {
    this.initAd();
    this.preloadData();
  },

  onShow() {
    if (!this.data.isDataLoaded && !this.data.isLoading && this.data.performanceData.length === 0) {
      console.log('检测到数据状态异常');
    }
  },

  async preloadData() {
    try {
      await this.loadPerformanceData();
      this.setData({ showWarningDialog: true });
    } catch (error) {
      console.warn('预加载失败:', error);
      this.setData({ showWarningDialog: true });
    }
  },

  closeWarningDialog() {
    this.setData({ showWarningDialog: false });
    if (!this.data.isDataLoaded && !this.data.isLoading) {
      this.loadPerformanceData();
    }
  },

  async loadPerformanceData() {
    if (this.data.isLoading) return;
    
    const now = Date.now();
    
    try {
      this.setData({ isLoading: true });
      
      const dataManager = require('../../utils/twin-engine-data-manager.js');
      const performanceData = await dataManager.loadTwinEngineData();
      
      if (performanceData && performanceData.length > 0) {
        const aircraftSeries = this.groupByAircraftSeries(performanceData);
        
        this.setData({
          performanceData,
          aircraftSeries,
          showAircraftSeries: true,
          showModelList: false,
          showResults: false,
          isDataLoaded: true,
          isLoading: false
        });
        
        console.log(`加载成功：${performanceData.length}个机型，${aircraftSeries.length}个系列`);
      } else {
        this.setData({ isLoading: false });
        wx.showToast({ title: '数据加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('加载失败:', error);
      this.setData({ isLoading: false });
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    }
  },

  onModelSelect(event: any) {
    const index = event.currentTarget.dataset.index;
    const selectedModel = this.data.currentSeriesModels[index];
    
    if (!selectedModel) {
      wx.showToast({ title: '机型数据异常', icon: 'none' });
      return;
    }

    const availableParams = this.analyzeAvailableParameters(selectedModel);
    const defaultWeight = availableParams.recommendedWeight;
    const defaultAltitude = availableParams.recommendedAltitude;
    const availableAltitudesForDefaultWeight = defaultWeight ? 
      this.getAvailableAltitudesForWeightDirect(defaultWeight, availableParams.matrix) : [];

    const weightColumns = [{ values: availableParams.weights }];
    const altitudeColumns = defaultWeight ? [{ values: availableAltitudesForDefaultWeight }] : [];
    
    const defaultWeightIndex = availableParams.weights.indexOf(defaultWeight);
    const defaultAltitudeIndex = availableAltitudesForDefaultWeight.indexOf(defaultAltitude);

    this.setData({
      currentModelData: selectedModel,
      selectedWeight: defaultWeight,
      selectedAltitude: defaultAltitude,
      availableAltitudesForCurrentWeight: availableAltitudesForDefaultWeight,
      parameterMatrix: availableParams.matrix,
      weightColumns,
      altitudeColumns,
      selectedWeightIndex: [Math.max(0, defaultWeightIndex)],
      selectedAltitudeIndex: [Math.max(0, defaultAltitudeIndex)],
      showAircraftSeries: false,
      showModelList: false,
      showResults: true,
      gradient: ''
    });
  },

  getAvailableAltitudesForWeightDirect(weight: string, matrix: any): string[] {
    if (!matrix || !weight) return [];
    const availableAltitudes = matrix[weight] || [];
    return availableAltitudes.sort((a: any, b: any) => parseInt(a) - parseInt(b));
  },

  getAvailableWeightsForAltitudeDirect(altitude: string, matrix: any): string[] {
    if (!matrix || !altitude) return [];
    
    const availableWeights = [];
    for (const weight in matrix) {
      if (matrix.hasOwnProperty(weight)) {
        const altitudes = matrix[weight] || [];
        if (altitudes.indexOf(altitude) !== -1) {
          availableWeights.push(weight);
        }
      }
    }
    return availableWeights.sort((a: any, b: any) => parseInt(a) - parseInt(b));
  },

  analyzeAvailableParameters(modelData: any) {
    const weights = [];
    const altitudes: any = {};
    const matrix: any = {};
    
    if (modelData.data && modelData.data.length > 0) {
      for (let i = 0; i < modelData.data.length; i++) {
        const weightItem = modelData.data[i];
        const weight = weightItem.weight_kg.toString();
        weights.push(weight);
        
        const availableAltitudesForWeight = [];
        if (weightItem.values) {
          for (const altitude in weightItem.values) {
            altitudes[altitude] = true;
            availableAltitudesForWeight.push(altitude);
          }
        }
        matrix[weight] = availableAltitudesForWeight;
      }
    }
    
    const sortedAltitudes = [];
    for (const altitude in altitudes) {
      sortedAltitudes.push(altitude);
    }
    sortedAltitudes.sort((a: any, b: any) => parseInt(a) - parseInt(b));
    
    const recommendedWeight = weights.length > 0 ? weights[Math.floor(weights.length / 2)] : '';
    const recommendedAltitude = altitudes['0'] ? '0' : sortedAltitudes[0] || '';
    
    return {
      weights,
      altitudes: sortedAltitudes,
      matrix,
      recommendedWeight,
      recommendedAltitude
    };
  },

  queryGradient() {
    const { selectedWeight, selectedAltitude, currentModelData } = this.data;
    
    if (!currentModelData) {
      wx.showToast({ title: '请先选择机型', icon: 'none' });
      return;
    }
    
    if (!selectedWeight || !selectedAltitude) {
      wx.showToast({ title: '请选择重量和高度', icon: 'none' });
      return;
    }
    
    const validateParams = () => {
      if (!currentModelData) return { valid: false, message: '请先选择机型' };
      if (!selectedWeight || !selectedAltitude) return { valid: false, message: '请选择重量和高度' };
      return { valid: true };
    };

    const performQuery = () => {
      this.performGradientQuery();
    };

    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'twin-engine-query',
      validateParams,
      `查询${currentModelData.model}梯度`,
      performQuery
    );
  },

  performGradientQuery() {
    const { selectedWeight, selectedAltitude, currentModelData } = this.data;

    wx.showLoading({ title: '计算中...', mask: true });
    
    const selectedWeightNum = parseInt(selectedWeight);
    const weightData = currentModelData.data.find((item: any) => 
      item.weight_kg === selectedWeightNum
    );
    
    setTimeout(() => {
      wx.hideLoading();
      
      if (weightData && weightData.values && weightData.values[selectedAltitude] !== undefined) {
        const gradient = weightData.values[selectedAltitude];
        this.setData({ gradient: gradient.toString() });
        
        wx.showToast({ title: '查询成功！', icon: 'success', duration: 1500 });
        this.scrollToResults();
      } else {
        this.setData({ gradient: '数据异常' });
        wx.showToast({ title: '数据异常，请检查机型数据', icon: 'none', duration: 2000 });
      }
    }, 200);
  },

  scrollToResults() {
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('#result-card').boundingClientRect();
      query.selectViewport().scrollOffset();
      
      query.exec((res) => {
        if (res[0] && res[1]) {
          const cardTop = res[0].top + res[1].scrollTop;
          const targetScrollTop = Math.max(0, cardTop - 80);
          
          wx.pageScrollTo({
            scrollTop: targetScrollTop,
            duration: 400
          });
        }
      });
    }, 100);
  },

  backToModelList() {
    if (this.data.selectedSeries) {
      this.setData({
        showModelList: true,
        showResults: false,
        currentModelData: null,
        selectedWeight: '',
        selectedAltitude: '',
        gradient: ''
      });
    } else {
      this.backToSeriesList();
    }
  },

  // Picker方法
  showWeightPicker() {
    this.setData({ showWeightPicker: true });
  },

  closeWeightPicker() {
    this.setData({ showWeightPicker: false });
  },

  onWeightConfirm(event: any) {
    const { value, index } = event.detail;
    const selectedIndex = index !== undefined ? (Array.isArray(index) ? index[0] : index) : 0;
    
    let selectedValue = '';
    if (Array.isArray(value) && value.length > 0) {
      selectedValue = value[0].toString();
    } else if (value) {
      selectedValue = value.toString();
    } else {
      selectedValue = this.data.weightColumns[0].values[selectedIndex];
    }
    
    const availableAltitudesForWeight = this.getAvailableAltitudesForWeightDirect(selectedValue, this.data.parameterMatrix);
    const altitudeColumns = [{ values: availableAltitudesForWeight }];
    
    let newSelectedAltitude = '';
    let newSelectedAltitudeIndex = [0];
    
    if (this.data.selectedAltitude && availableAltitudesForWeight.indexOf(this.data.selectedAltitude) !== -1) {
      newSelectedAltitude = this.data.selectedAltitude;
      newSelectedAltitudeIndex = [availableAltitudesForWeight.indexOf(this.data.selectedAltitude)];
    } else {
      if (availableAltitudesForWeight.length > 0) {
        if (availableAltitudesForWeight.indexOf('0') !== -1) {
          newSelectedAltitude = '0';
          newSelectedAltitudeIndex = [availableAltitudesForWeight.indexOf('0')];
        } else {
          newSelectedAltitude = availableAltitudesForWeight[0];
          newSelectedAltitudeIndex = [0];
        }
      }
    }
    
    this.setData({
      selectedWeight: selectedValue,
      selectedWeightIndex: [selectedIndex],
      availableAltitudesForCurrentWeight: availableAltitudesForWeight,
      altitudeColumns,
      selectedAltitude: newSelectedAltitude,
      selectedAltitudeIndex: newSelectedAltitudeIndex,
      gradient: '',
      showWeightPicker: false
    });
    
    if (selectedValue && newSelectedAltitude) {
      setTimeout(() => this.queryGradient(), 50);
    }
  },

  onWeightPickerChange(event: any) {
    this.setData({ selectedWeightIndex: [event.detail.index] });
  },

  showAltitudePicker() {
    if (!this.data.selectedWeight) {
      wx.showToast({ title: '请先选择重量', icon: 'none' });
      return;
    }
    this.setData({ showAltitudePicker: true });
  },

  closeAltitudePicker() {
    this.setData({ showAltitudePicker: false });
  },

  onAltitudeConfirm(event: any) {
    const { value, index } = event.detail;
    const selectedIndex = index !== undefined ? (Array.isArray(index) ? index[0] : index) : 0;
    
    let selectedValue = '';
    if (Array.isArray(value) && value.length > 0) {
      selectedValue = value[0].toString();
    } else if (value) {
      selectedValue = value.toString();
    } else {
      selectedValue = this.data.altitudeColumns[0].values[selectedIndex];
    }
    
    const availableWeightsForAltitude = this.getAvailableWeightsForAltitudeDirect(selectedValue, this.data.parameterMatrix);
    const weightColumns = [{ values: availableWeightsForAltitude }];
    
    let newSelectedWeight = '';
    let newSelectedWeightIndex = [0];
    
    if (this.data.selectedWeight && availableWeightsForAltitude.indexOf(this.data.selectedWeight) !== -1) {
      newSelectedWeight = this.data.selectedWeight;
      newSelectedWeightIndex = [availableWeightsForAltitude.indexOf(this.data.selectedWeight)];
    } else {
      if (availableWeightsForAltitude.length > 0) {
        const middleIndex = Math.floor(availableWeightsForAltitude.length / 2);
        newSelectedWeight = availableWeightsForAltitude[middleIndex];
        newSelectedWeightIndex = [middleIndex];
      }
    }
    
    this.setData({
      selectedAltitude: selectedValue,
      selectedAltitudeIndex: [selectedIndex],
      selectedWeight: newSelectedWeight,
      selectedWeightIndex: newSelectedWeightIndex,
      weightColumns,
      gradient: '',
      showAltitudePicker: false
    });
    
    if (newSelectedWeight && selectedValue) {
      setTimeout(() => this.queryGradient(), 50);
    }
  },

  onAltitudePickerChange(event: any) {
    this.setData({ selectedAltitudeIndex: [event.detail.index] });
  },

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
          series,
          models: seriesMap[series],
          count: seriesMap[series].length
        });
      }
    }
    
    aircraftSeries.sort((a, b) => a.series.localeCompare(b.series));
    return aircraftSeries;
  },

  getAircraftSeries(model: string): string {
    if (model.indexOf('A319') !== -1 || model.indexOf('A320') !== -1 || model.indexOf('A321') !== -1) {
      return 'A320系列';
    }
    if (model.indexOf('A330') !== -1 || model.indexOf('A332') !== -1 || model.indexOf('A333') !== -1) {
      return 'A330系列';
    }
    if (model.indexOf('A340') !== -1) return 'A340系列';
    if (model.indexOf('A350') !== -1) return 'A350系列';
    if (model.indexOf('A380') !== -1) return 'A380系列';
    if (model.indexOf('B737') !== -1 || model.indexOf('737') !== -1) return 'B737系列';
    if (model.indexOf('B747') !== -1 || model.indexOf('747') !== -1) return 'B747系列';
    if (model.indexOf('B767') !== -1 || model.indexOf('767') !== -1) return 'B767系列';
    if (model.indexOf('B777') !== -1 || model.indexOf('777') !== -1) return 'B777系列';
    if (model.indexOf('B787') !== -1 || model.indexOf('787') !== -1) return 'B787系列';
    return '其他机型';
  },

  onSeriesSelect(event: any) {
    const seriesIndex = event.currentTarget.dataset.index;
    const selectedSeries = this.data.aircraftSeries[seriesIndex];
    
    this.setData({
      selectedSeries,
      currentSeriesModels: selectedSeries.models,
      showAircraftSeries: false,
      showModelList: true,
      showResults: false
    });
  },

  backToSeriesList() {
    this.setData({
      showAircraftSeries: true,
      showModelList: false,
      showResults: false,
      selectedSeries: null,
      currentSeriesModels: [],
      currentModelData: null,
      selectedWeight: '',
      selectedAltitude: '',
      gradient: ''
    });
  },

  // 广告方法
  initAd() {
    try {
      const adManagerUtil = require('../../utils/ad-manager.js');
      const AdManager = adManagerUtil;
      const adManager = new AdManager();
      const adUnit = adManager.getBestAdUnit('calculation');
      
      if (adUnit) {
        this.setData({ showAd: true, adUnitId: adUnit.id });
      }
      
      this.initA350B737MiddleAd(adManager);
      this.initSeriesTopAd(adManager);
      this.initModelTopAd(adManager);
    } catch (error) {
      console.log('广告初始化失败:', error);
    }
  },

  initA350B737MiddleAd(adManager: any) {
    const adUnit = adManager.getBestAdUnit('a350-b737-middle', 'secondary');
    if (adUnit) {
      this.setData({
        showA350B737MiddleAd: true,
        a350B737MiddleAdUnitId: adUnit.id
      });
    }
  },

  initSeriesTopAd(adManager: any) {
    const adUnit = adManager.getBestAdUnit('list', 'primary');
    if (adUnit) {
      this.setData({
        showSeriesTopAd: true,
        seriesTopAdUnitId: adUnit.id
      });
    }
  },

  initModelTopAd(adManager: any) {
    const adUnit = adManager.getBestAdUnit('secondary-page', 'primary');
    if (adUnit) {
      this.setData({
        showModelTopAd: true,
        modelTopAdUnitId: adUnit.id
      });
    }
  },

  onAdLoad() {
    try {
      const AdManager = require('../../utils/ad-manager.js');
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