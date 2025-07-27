/**
 * 双发复飞性能查询页面 - 重构为ES5语法
 * 解决WXS错误，确保小程序兼容性
 */

Page({
  data: {
    // 警告弹窗
    showWarningDialog: false,
    
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
    isQuerying: false
  },

  onLoad: function() {
    this.preloadData();
  },

  onShow: function() {
    if (!this.data.isDataLoaded && !this.data.isLoading && this.data.performanceData.length === 0) {
      console.log('检测到数据状态异常');
    }
  },

  // 处理页面返回逻辑
  onBackPress: function() {
    // 如果在结果页面，返回到机型列表
    if (this.data.showResults) {
      if (this.data.selectedSeries) {
        this.setData({
          showModelList: true,
          showResults: false,
          currentModelData: null,
          selectedWeight: '',
          selectedAltitude: '',
          gradient: ''
        });
        return true; // 阻止默认返回行为
      } else {
        this.backToSeriesList();
        return true; // 阻止默认返回行为
      }
    }
    // 如果在机型列表页面，返回到系列列表
    else if (this.data.showModelList) {
      this.backToSeriesList();
      return true; // 阻止默认返回行为
    }
    // 如果在系列列表页面，允许正常返回
    return false;
  },

  preloadData: function() {
    var self = this;
    console.log('开始预加载数据');
    
    this.loadPerformanceData().then(function() {
      console.log('预加载完成，数据长度:', self.data.performanceData.length);
      self.setData({ showWarningDialog: false });
    }).catch(function(error) {
      console.warn('预加载失败:', error);
      self.setData({ showWarningDialog: false });
    });
  },

  closeWarningDialog: function() {
    console.log('关闭警告弹窗，当前数据状态:', {
      isDataLoaded: this.data.isDataLoaded,
      isLoading: this.data.isLoading,
      dataLength: this.data.performanceData.length,
      seriesLength: this.data.aircraftSeries.length
    });
    
    this.setData({ showWarningDialog: false });
    
    if (!this.data.isDataLoaded && !this.data.isLoading) {
      console.log('数据未加载，开始加载...');
      this.loadPerformanceData();
    } else {
      console.log('数据已加载或正在加载中');
    }
  },

  loadPerformanceData: function() {
    var self = this;
    
    if (this.data.isLoading) {
      return Promise.resolve();
    }
    
    var now = Date.now();
    
    return new Promise(function(resolve, reject) {
      try {
        self.setData({ isLoading: true });
        
        var dataManager = require('../../utils/twin-engine-data-manager.js');
        dataManager.loadTwinEngineData().then(function(performanceData) {
          if (performanceData && performanceData.length > 0) {
            var aircraftSeries = self.groupByAircraftSeries(performanceData);
            
            self.setData({
              performanceData: performanceData,
              aircraftSeries: aircraftSeries,
              showAircraftSeries: true,
              showModelList: false,
              showResults: false,
              isDataLoaded: true,
              isLoading: false
            });
            
            console.log('加载成功：' + performanceData.length + '个机型，' + aircraftSeries.length + '个系列');
            resolve(performanceData);
          } else {
            self.setData({ isLoading: false });
            wx.showToast({ title: '数据加载失败', icon: 'none' });
            reject(new Error('数据为空'));
          }
        }).catch(function(error) {
          console.error('加载失败:', error);
          self.setData({ isLoading: false });
          wx.showToast({ title: '数据加载失败', icon: 'none' });
          reject(error);
        });
      } catch (error) {
        console.error('加载失败:', error);
        self.setData({ isLoading: false });
        wx.showToast({ title: '数据加载失败', icon: 'none' });
        reject(error);
      }
    });
  },

  onModelSelect: function(event) {
    var index = event.currentTarget.dataset.index;
    var selectedModel = this.data.currentSeriesModels[index];
    
    if (!selectedModel) {
      wx.showToast({ title: '机型数据异常', icon: 'none' });
      return;
    }

    var availableParams = this.analyzeAvailableParameters(selectedModel);
    var defaultWeight = availableParams.recommendedWeight;
    var defaultAltitude = availableParams.recommendedAltitude;
    var availableAltitudesForDefaultWeight = defaultWeight ? 
      this.getAvailableAltitudesForWeightDirect(defaultWeight, availableParams.matrix) : [];

    var weightColumns = [{ values: availableParams.weights }];
    var altitudeColumns = defaultWeight ? [{ values: availableAltitudesForDefaultWeight }] : [];
    
    var defaultWeightIndex = availableParams.weights.indexOf(defaultWeight);
    var defaultAltitudeIndex = availableAltitudesForDefaultWeight.indexOf(defaultAltitude);

    this.setData({
      currentModelData: selectedModel,
      selectedWeight: defaultWeight,
      selectedAltitude: defaultAltitude,
      availableAltitudesForCurrentWeight: availableAltitudesForDefaultWeight,
      parameterMatrix: availableParams.matrix,
      weightColumns: weightColumns,
      altitudeColumns: altitudeColumns,
      selectedWeightIndex: [Math.max(0, defaultWeightIndex)],
      selectedAltitudeIndex: [Math.max(0, defaultAltitudeIndex)],
      showAircraftSeries: false,
      showModelList: false,
      showResults: true,
      gradient: ''
    });
  },

  getAvailableAltitudesForWeightDirect: function(weight, matrix) {
    if (!matrix || !weight) return [];
    var availableAltitudes = matrix[weight] || [];
    return availableAltitudes.sort(function(a, b) { 
      return parseInt(a) - parseInt(b); 
    });
  },

  getAvailableWeightsForAltitudeDirect: function(altitude, matrix) {
    if (!matrix || !altitude) return [];
    
    var availableWeights = [];
    for (var weight in matrix) {
      if (matrix.hasOwnProperty(weight)) {
        var altitudes = matrix[weight] || [];
        if (altitudes.indexOf(altitude) !== -1) {
          availableWeights.push(weight);
        }
      }
    }
    return availableWeights.sort(function(a, b) { 
      return parseInt(a) - parseInt(b); 
    });
  },

  analyzeAvailableParameters: function(modelData) {
    var weights = [];
    var altitudes = {};
    var matrix = {};
    
    if (modelData.data && modelData.data.length > 0) {
      for (var i = 0; i < modelData.data.length; i++) {
        var weightItem = modelData.data[i];
        var weight = weightItem.weight_kg.toString();
        weights.push(weight);
        
        var availableAltitudesForWeight = [];
        if (weightItem.values) {
          for (var altitude in weightItem.values) {
            altitudes[altitude] = true;
            availableAltitudesForWeight.push(altitude);
          }
        }
        matrix[weight] = availableAltitudesForWeight;
      }
    }
    
    var sortedAltitudes = [];
    for (var altitude in altitudes) {
      sortedAltitudes.push(altitude);
    }
    sortedAltitudes.sort(function(a, b) { 
      return parseInt(a) - parseInt(b); 
    });
    
    var recommendedWeight = weights.length > 0 ? weights[Math.floor(weights.length / 2)] : '';
    var recommendedAltitude = altitudes['0'] ? '0' : sortedAltitudes[0] || '';
    
    return {
      weights: weights,
      altitudes: sortedAltitudes,
      matrix: matrix,
      recommendedWeight: recommendedWeight,
      recommendedAltitude: recommendedAltitude
    };
  },

  queryGradient: function() {
    var selectedWeight = this.data.selectedWeight;
    var selectedAltitude = this.data.selectedAltitude;
    var currentModelData = this.data.currentModelData;
    
    if (!currentModelData) {
      wx.showToast({ title: '请先选择机型', icon: 'none' });
      return;
    }
    
    if (!selectedWeight || !selectedAltitude) {
      wx.showToast({ title: '请选择重量和高度', icon: 'none' });
      return;
    }
    
    // 直接执行查询，不再扣费（进入页面时已扣费）
    this.performGradientQuery();
  },

  performGradientQuery: function() {
    var selectedWeight = this.data.selectedWeight;
    var selectedAltitude = this.data.selectedAltitude;
    var currentModelData = this.data.currentModelData;
    var self = this;

    // 设置查询状态
    this.setData({ isQuerying: true });
    wx.showLoading({ title: '计算中...', mask: true });
    
    var selectedWeightNum = parseInt(selectedWeight);
    var weightData = null;
    
    for (var i = 0; i < currentModelData.data.length; i++) {
      if (currentModelData.data[i].weight_kg === selectedWeightNum) {
        weightData = currentModelData.data[i];
        break;
      }
    }
    
    setTimeout(function() {
      wx.hideLoading();
      self.setData({ isQuerying: false }); // 重置查询状态
      
      if (weightData && weightData.values && weightData.values[selectedAltitude] !== undefined) {
        var gradient = weightData.values[selectedAltitude];
        self.setData({ gradient: gradient.toString() });
        
        wx.showToast({ title: '查询成功！', icon: 'success', duration: 1500 });
        self.scrollToResults();
      } else {
        self.setData({ gradient: '数据异常' });
        wx.showToast({ title: '数据异常，请检查机型数据', icon: 'none', duration: 2000 });
      }
    }, 800); // 增加延迟时间让用户感受到计算过程
  },

  scrollToResults: function() {
    setTimeout(function() {
      var query = wx.createSelectorQuery();
      query.select('#result-card').boundingClientRect();
      query.selectViewport().scrollOffset();
      
      query.exec(function(res) {
        if (res[0] && res[1]) {
          var cardTop = res[0].top + res[1].scrollTop;
          var targetScrollTop = Math.max(0, cardTop - 80);
          
          wx.pageScrollTo({
            scrollTop: targetScrollTop,
            duration: 400
          });
        }
      });
    }, 100);
  },

  // Picker方法
  showWeightPicker: function() {
    this.setData({ showWeightPicker: true });
  },

  closeWeightPicker: function() {
    this.setData({ showWeightPicker: false });
  },

  onWeightConfirm: function(event) {
    var value = event.detail.value;
    var index = event.detail.index;
    var selectedIndex = index !== undefined ? (Array.isArray(index) ? index[0] : index) : 0;
    
    var selectedValue = '';
    if (Array.isArray(value) && value.length > 0) {
      selectedValue = value[0].toString();
    } else if (value) {
      selectedValue = value.toString();
    } else {
      selectedValue = this.data.weightColumns[0].values[selectedIndex];
    }
    
    var availableAltitudesForWeight = this.getAvailableAltitudesForWeightDirect(selectedValue, this.data.parameterMatrix);
    var altitudeColumns = [{ values: availableAltitudesForWeight }];
    
    var newSelectedAltitude = '';
    var newSelectedAltitudeIndex = [0];
    
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
      altitudeColumns: altitudeColumns,
      selectedAltitude: newSelectedAltitude,
      selectedAltitudeIndex: newSelectedAltitudeIndex,
      gradient: '',
      showWeightPicker: false
    });
  },

  onWeightPickerChange: function(event) {
    this.setData({ selectedWeightIndex: [event.detail.index] });
  },

  showAltitudePicker: function() {
    if (!this.data.selectedWeight) {
      wx.showToast({ title: '请先选择重量', icon: 'none' });
      return;
    }
    this.setData({ showAltitudePicker: true });
  },

  closeAltitudePicker: function() {
    this.setData({ showAltitudePicker: false });
  },

  onAltitudeConfirm: function(event) {
    var value = event.detail.value;
    var index = event.detail.index;
    var selectedIndex = index !== undefined ? (Array.isArray(index) ? index[0] : index) : 0;
    
    var selectedValue = '';
    if (Array.isArray(value) && value.length > 0) {
      selectedValue = value[0].toString();
    } else if (value) {
      selectedValue = value.toString();
    } else {
      selectedValue = this.data.altitudeColumns[0].values[selectedIndex];
    }
    
    var availableWeightsForAltitude = this.getAvailableWeightsForAltitudeDirect(selectedValue, this.data.parameterMatrix);
    var weightColumns = [{ values: availableWeightsForAltitude }];
    
    var newSelectedWeight = '';
    var newSelectedWeightIndex = [0];
    
    if (this.data.selectedWeight && availableWeightsForAltitude.indexOf(this.data.selectedWeight) !== -1) {
      newSelectedWeight = this.data.selectedWeight;
      newSelectedWeightIndex = [availableWeightsForAltitude.indexOf(this.data.selectedWeight)];
    } else {
      if (availableWeightsForAltitude.length > 0) {
        var middleIndex = Math.floor(availableWeightsForAltitude.length / 2);
        newSelectedWeight = availableWeightsForAltitude[middleIndex];
        newSelectedWeightIndex = [middleIndex];
      }
    }
    
    this.setData({
      selectedAltitude: selectedValue,
      selectedAltitudeIndex: [selectedIndex],
      selectedWeight: newSelectedWeight,
      selectedWeightIndex: newSelectedWeightIndex,
      weightColumns: weightColumns,
      gradient: '',
      showAltitudePicker: false
    });
  },

  onAltitudePickerChange: function(event) {
    this.setData({ selectedAltitudeIndex: [event.detail.index] });
  },

  groupByAircraftSeries: function(data) {
    var seriesMap = {};
    var self = this;
    
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var series = self.getAircraftSeries(item.model);
      if (!seriesMap[series]) {
        seriesMap[series] = [];
      }
      seriesMap[series].push(item);
    }
    
    var aircraftSeries = [];
    for (var series in seriesMap) {
      if (seriesMap.hasOwnProperty(series)) {
        aircraftSeries.push({
          series: series,
          models: seriesMap[series],
          count: seriesMap[series].length
        });
      }
    }
    
    aircraftSeries.sort(function(a, b) { 
      return a.series.localeCompare(b.series); 
    });
    return aircraftSeries;
  },

  getAircraftSeries: function(model) {
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

  onSeriesSelect: function(event) {
    var seriesIndex = event.currentTarget.dataset.index;
    var selectedSeries = this.data.aircraftSeries[seriesIndex];
    
    this.setData({
      selectedSeries: selectedSeries,
      currentSeriesModels: selectedSeries.models,
      showAircraftSeries: false,
      showModelList: true,
      showResults: false
    });
  },

  backToSeriesList: function() {
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

  // 广告事件处理
  adLoad: function() {
    console.log('横幅广告加载成功');
  },

  adError: function(err) {
    console.error('横幅广告加载失败', err);
  },

  adClose: function() {
    console.log('横幅广告关闭');
  }
});