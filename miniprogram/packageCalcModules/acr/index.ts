// ACR计算器 - 纯ACR分析工具（不涉及PCR）
// 5步向导流程：制造商 → 系列/机型 → 改型 → 重量 → 参数&结果

interface VariantInfo {
  variantName: string;
  displayName?: string;
  mass_kg: number | { max: number; min: number };
  loadPercentageMLG?: number;
  tirePressure_mpa?: number;
  acr: {
    max?: {
      flexiblePavement: { high_A_200: number; medium_B_120: number; low_C_80: number; ultraLow_D_50: number };
      rigidPavement: { high_A_200: number; medium_B_120: number; low_C_80: number; ultraLow_D_50: number };
    };
    min?: {
      flexiblePavement: { high_A_200: number; medium_B_120: number; low_C_80: number; ultraLow_D_50: number };
      rigidPavement: { high_A_200: number; medium_B_120: number; low_C_80: number; ultraLow_D_50: number };
    };
    flexiblePavement?: { high_A_200: number; medium_B_120: number; low_C_80: number; ultraLow_D_50: number };
    rigidPavement?: { high_A_200: number; medium_B_120: number; low_C_80: number; ultraLow_D_50: number };
  };
}

interface ModelData {
  model: string;
  variants: VariantInfo[];
}

interface AircraftDataModule {
  aircraftData: ModelData[];
}

Page({
  data: {
    isAdFree: false, // 无广告状态

    // 当前步骤：1=制造商 2=系列/机型 3=改型 4=重量 5=参数&结果
    currentStep: 1,

    // 系列模式标志（是否显示系列选择）
    showSeriesStep: false,

    // 用户选择的数据
    selectedManufacturer: '',
    selectedSeries: '',
    selectedModel: '',
    selectedVariant: '',
    aircraftMass: '',

    // 参数选择
    pavementType: '', // F=柔性 R=刚性
    subgradeStrength: '', // A=高 B=中 C=低 D=超低
    tirePressure: 'W', // W=无限制 X=高压 Y=中压 Z=低压
    evaluationMethod: 'T', // T=技术评估 U=使用经验

    // ACR结果
    acrValue: null,

    // 选项列表
    seriesList: [],
    modelList: [],
    variantList: [],

    // 控制标志
    needWeightInput: false, // 是否需要输入重量
    dataLoaded: false,

    // 重量范围（用于显示提示）
    massRange: { min: 0, max: 0 }
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 检查无广告状态
    this.checkAdFreeStatus();
  },

  // 加载ACR数据
  loadData() {
    const self = this;
    wx.showLoading({ title: '加载数据...' });

    // 使用微信小程序的异步require语法加载分包数据
    let loadedCount = 0;
    const totalCount = 4;
    const database: any = {};

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalCount) {
        // 所有数据加载完成
        (self as any).aircraftDatabase = database;
        self.setData({ dataLoaded: true });
        wx.hideLoading();
        console.log('✅ ACR数据加载完成');
      }
    };

    const handleError = (moduleName: string) => {
      return (error: any) => {
        console.error(`❌ ${moduleName} 加载失败:`, error);
        wx.hideLoading();
        wx.showToast({
          title: `${moduleName}数据加载失败`,
          icon: 'error'
        });
      };
    };

    // 加载Airbus数据
    require('../../packageF/Airbus.js', (module: AircraftDataModule) => {
      database.Airbus = module.aircraftData;
      checkComplete();
    }, handleError('Airbus'));

    // 加载Boeing数据
    require('../../packageF/Boeing.js', (module: AircraftDataModule) => {
      database.Boeing = module.aircraftData;
      checkComplete();
    }, handleError('Boeing'));

    // 加载COMAC数据
    require('../../packageF/COMAC.js', (module: AircraftDataModule) => {
      database.COMAC = module.aircraftData;
      checkComplete();
    }, handleError('COMAC'));

    // 加载Others数据
    require('../../packageF/other.js', (module: AircraftDataModule) => {
      database.Others = module.aircraftData;
      checkComplete();
    }, handleError('Others'));
  },

  // ========== 步骤1：选择制造商 ==========
  selectManufacturer(event: any) {
    // 检查数据是否加载完成
    if (!this.data.dataLoaded) {
      wx.showToast({
        title: '数据加载中，请稍候...',
        icon: 'none'
      });
      return;
    }

    const manufacturer = event.currentTarget.dataset.manufacturer;

    // 判断是否需要显示系列步骤
    const showSeries = manufacturer === 'Airbus' || manufacturer === 'Boeing';

    this.setData({
      selectedManufacturer: manufacturer,
      showSeriesStep: showSeries,
      selectedSeries: '',
      selectedModel: '',
      selectedVariant: '',
      aircraftMass: '',
      acrValue: null,
      currentStep: 2
    });

    // 如果有系列，加载系列列表；否则直接加载机型列表
    if (showSeries) {
      this.loadSeriesList(manufacturer);
    } else {
      this.loadModelList(manufacturer);
      // 无系列时，直接滚动到机型选择区域
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '#model-card',
          duration: 300
        });
      }, 100);
    }
  },

  // ========== 步骤2：选择系列或机型 ==========

  // 加载系列列表（仅Airbus和Boeing）
  loadSeriesList(manufacturer: string) {
    const database = (this as any).aircraftDatabase;
    const models: ModelData[] = database[manufacturer] || [];

    let seriesSet = new Set<string>();

    if (manufacturer === 'Airbus') {
      models.forEach((model) => {
        const modelName = model.model;
        if (modelName.startsWith('A318') || modelName.startsWith('A319') ||
            modelName.startsWith('A320') || modelName.startsWith('A321') ||
            modelName.startsWith('ACJ319') || modelName.startsWith('ACJ320')) {
          seriesSet.add('A320系列');
        } else if (modelName.startsWith('A330')) {
          seriesSet.add('A330系列');
        } else if (modelName.startsWith('A340')) {
          seriesSet.add('A340系列');
        } else if (modelName.startsWith('A350')) {
          seriesSet.add('A350系列');
        } else if (modelName.startsWith('A380')) {
          seriesSet.add('A380系列');
        }
      });
    } else if (manufacturer === 'Boeing') {
      models.forEach((model) => {
        const modelName = model.model;
        if (modelName.startsWith('B737')) {
          seriesSet.add('B737系列');
        } else if (modelName.startsWith('B747')) {
          seriesSet.add('B747系列');
        } else if (modelName.startsWith('B757')) {
          seriesSet.add('B757系列');
        } else if (modelName.startsWith('B767')) {
          seriesSet.add('B767系列');
        } else if (modelName.startsWith('B777')) {
          seriesSet.add('B777系列');
        } else if (modelName.startsWith('B787')) {
          seriesSet.add('B787系列');
        }
      });
    }

    this.setData({
      seriesList: Array.from(seriesSet)
    });
  },

  // 选择系列
  selectSeries(event: any) {
    const series = event.currentTarget.dataset.series;

    this.setData({
      selectedSeries: series,
      selectedModel: '',
      selectedVariant: '',
      aircraftMass: '',
      acrValue: null
    });

    // 加载该系列下的机型
    this.loadModelListBySeries(this.data.selectedManufacturer, series);

    // 滚动到机型选择区域
    setTimeout(() => {
      wx.pageScrollTo({
        selector: '#model-card',
        duration: 300
      });
    }, 100);
  },

  // 根据系列加载机型列表
  loadModelListBySeries(manufacturer: string, series: string) {
    const database = (this as any).aircraftDatabase;
    const models: ModelData[] = database[manufacturer] || [];

    let filteredModels: ModelData[] = [];

    if (manufacturer === 'Airbus') {
      if (series === 'A320系列') {
        filteredModels = models.filter((m) =>
          m.model.startsWith('A318') || m.model.startsWith('A319') ||
          m.model.startsWith('A320') || m.model.startsWith('A321') ||
          m.model.startsWith('ACJ319') || m.model.startsWith('ACJ320')
        );
      } else if (series === 'A330系列') {
        filteredModels = models.filter((m) => m.model.startsWith('A330'));
      } else if (series === 'A340系列') {
        filteredModels = models.filter((m) => m.model.startsWith('A340'));
      } else if (series === 'A350系列') {
        filteredModels = models.filter((m) => m.model.startsWith('A350'));
      } else if (series === 'A380系列') {
        filteredModels = models.filter((m) => m.model.startsWith('A380'));
      }
    } else if (manufacturer === 'Boeing') {
      const seriesPrefix = series.substring(0, 4); // 例如 "B737"
      filteredModels = models.filter((m) => m.model.startsWith(seriesPrefix));
    }

    this.setData({
      modelList: filteredModels.map((m) => m.model)
    });
  },

  // 直接加载机型列表（无系列）
  loadModelList(manufacturer: string) {
    const database = (this as any).aircraftDatabase;
    const models: ModelData[] = database[manufacturer] || [];

    this.setData({
      modelList: models.map((m) => m.model)
    });
  },

  // 选择机型
  selectModel(event: any) {
    const model = event.currentTarget.dataset.model;

    this.setData({
      selectedModel: model,
      selectedVariant: '',
      aircraftMass: '',
      acrValue: null
    });

    // 加载改型列表
    this.loadVariantList(model);
  },

  // ========== 步骤3：选择改型 ==========

  loadVariantList(model: string) {
    const database = (this as any).aircraftDatabase;
    const manufacturer = this.data.selectedManufacturer;
    const models: ModelData[] = database[manufacturer] || [];

    const modelData = models.find((m) => m.model === model);
    if (!modelData) return;

    const variants = modelData.variants;

    // 如果只有一个改型，自动选择并跳到下一步
    if (variants.length === 1) {
      this.autoSelectVariant(variants[0]);
    } else {
      // 为每个改型生成显示名称（包含重量信息）
      const variantList = variants.map((v) => {
        let displayName = v.variantName;

        // 添加重量信息
        if (typeof v.mass_kg === 'object' && 'max' in v.mass_kg && 'min' in v.mass_kg) {
          // 有重量范围
          displayName = `${v.variantName} (${v.mass_kg.min}-${v.mass_kg.max} kg)`;
        } else if (typeof v.mass_kg === 'number') {
          // 固定重量
          displayName = `${v.variantName} (${v.mass_kg} kg)`;
        }

        return {
          name: v.variantName,
          display: displayName
        };
      });

      this.setData({
        variantList: variantList,
        currentStep: 3
      });

      // 滚动到改型选择区域
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '#variant-card',
          duration: 300
        });
      }, 100);
    }
  },

  // 自动选择改型（如果只有一个）
  autoSelectVariant(variant: VariantInfo) {
    this.selectVariantData(variant);
  },

  // 选择改型
  selectVariant(event: any) {
    const variantName = event.currentTarget.dataset.variant;

    // 查找改型数据
    const database = (this as any).aircraftDatabase;
    const manufacturer = this.data.selectedManufacturer;
    const models: ModelData[] = database[manufacturer] || [];
    const modelData = models.find((m) => m.model === this.data.selectedModel);

    if (modelData) {
      const variant = modelData.variants.find((v) => v.variantName === variantName);
      if (variant) {
        this.selectVariantData(variant);
      }
    }
  },

  // 处理改型选择逻辑
  selectVariantData(variant: VariantInfo) {
    const massData = variant.mass_kg;
    let needInput = false;
    let massValue = '';
    let massRange = { min: 0, max: 0 };

    // 判断是否需要输入重量
    if (typeof massData === 'object' && 'max' in massData && 'min' in massData) {
      // 有重量范围，需要用户输入
      needInput = true;
      massValue = '';
      massRange = { min: massData.min, max: massData.max };
    } else if (typeof massData === 'number') {
      // 固定重量，自动填充
      needInput = false;
      massValue = massData.toString();
    }

    this.setData({
      selectedVariant: variant.variantName,
      aircraftMass: massValue,
      needWeightInput: needInput,
      massRange: massRange,
      currentStep: needInput ? 4 : 5
    });

    // 存储当前改型数据，用于后续ACR计算
    (this as any).currentVariantData = variant;
  },

  // ========== 步骤4：输入重量 ==========

  onMassInput(event: any) {
    // 防止在步骤切换时被意外触发，导致数据被设置为undefined
    const value = event.detail.value;

    // 只有当值存在且有效时才更新
    if (value !== undefined && value !== null) {
      this.setData({
        aircraftMass: value
      });
      console.log('✍️ 重量输入更新:', value);
    }
  },

  // ========== 步骤5：参数选择和ACR计算 ==========

  onPavementTypeSelect(event: any) {
    const value = event.currentTarget.dataset.value;
    this.setData({ pavementType: value }, () => {
      // 在setData完成后再计算ACR
      this.calculateACR();
    });
  },

  onSubgradeStrengthSelect(event: any) {
    const value = event.currentTarget.dataset.value;
    this.setData({ subgradeStrength: value }, () => {
      // 在setData完成后再计算ACR
      this.calculateACR();
    });
  },

  onTirePressureSelect(event: any) {
    const value = event.currentTarget.dataset.value;
    this.setData({ tirePressure: value });
  },

  onEvaluationMethodSelect(event: any) {
    const value = event.currentTarget.dataset.value;
    this.setData({ evaluationMethod: value });
  },

  // 计算ACR值
  calculateACR() {
    const { pavementType, subgradeStrength, aircraftMass } = this.data;

    if (!pavementType || !subgradeStrength || !aircraftMass) {
      console.log('⚠️ ACR计算参数不完整:', { pavementType, subgradeStrength, aircraftMass });
      return; // 参数不完整，不计算
    }

    const variant: VariantInfo = (this as any).currentVariantData;
    if (!variant) {
      console.log('⚠️ 未找到改型数据');
      return;
    }

    const mass = parseFloat(aircraftMass);
    if (isNaN(mass)) {
      console.log('⚠️ 重量格式错误:', aircraftMass);
      return;
    }

    let acrValue: number | null = null;

    // 根据道面类型和强度获取ACR值
    const strengthMap: { [key: string]: string } = {
      'A': 'high_A_200',
      'B': 'medium_B_120',
      'C': 'low_C_80',
      'D': 'ultraLow_D_50'
    };
    const strengthKey = strengthMap[subgradeStrength] as 'high_A_200' | 'medium_B_120' | 'low_C_80' | 'ultraLow_D_50';

    console.log('🔍 ACR计算参数:', {
      model: this.data.selectedModel,
      variant: this.data.selectedVariant,
      mass: mass,
      pavementType: pavementType,
      subgradeStrength: subgradeStrength,
      strengthKey: strengthKey
    });

    // 判断是固定ACR还是需要插值
    if (variant.acr.flexiblePavement && variant.acr.rigidPavement) {
      // 固定ACR（单一重量）
      if (pavementType === 'F') {
        acrValue = variant.acr.flexiblePavement[strengthKey];
      } else if (pavementType === 'R') {
        acrValue = variant.acr.rigidPavement[strengthKey];
      }
      console.log('✅ 固定ACR值:', acrValue);
    } else if (variant.acr.max && variant.acr.min) {
      // 需要插值（重量范围）
      const massData = variant.mass_kg as { max: number; min: number };
      const maxMass = massData.max;
      const minMass = massData.min;

      let maxACR: number;
      let minACR: number;

      if (pavementType === 'F') {
        maxACR = variant.acr.max.flexiblePavement[strengthKey];
        minACR = variant.acr.min.flexiblePavement[strengthKey];
      } else {
        maxACR = variant.acr.max.rigidPavement[strengthKey];
        minACR = variant.acr.min.rigidPavement[strengthKey];
      }

      // 线性插值
      if (mass >= maxMass) {
        acrValue = maxACR;
      } else if (mass <= minMass) {
        acrValue = minACR;
      } else {
        const ratio = (mass - minMass) / (maxMass - minMass);
        acrValue = Math.round(minACR + ratio * (maxACR - minACR));
      }
      console.log('✅ 插值ACR值:', { minACR, maxACR, ratio: (mass - minMass) / (maxMass - minMass), acrValue });
    }

    console.log('📊 最终ACR值:', acrValue);

    this.setData({
      acrValue: acrValue
    });
  },

  // ========== 导航控制 ==========

  // 点击步骤指示器跳转
  jumpToStep(event: any) {
    const targetStep = parseInt(event.currentTarget.dataset.step);
    const { selectedManufacturer, selectedModel, selectedVariant, needWeightInput, aircraftMass, showSeriesStep } = this.data;

    console.log(`🎯 跳转到步骤${targetStep}`, { selectedManufacturer, selectedModel, selectedVariant, needWeightInput });

    // 验证是否可以跳转到目标步骤
    if (targetStep === 1) {
      // 始终可以返回步骤1
      this.setData({
        currentStep: 1,
        acrValue: null
      }, () => {
        this.scrollToTop();
      });
      return;
    }

    if (targetStep === 2) {
      // 跳转到步骤2需要已选择制造商
      if (!selectedManufacturer) {
        wx.showToast({ title: '请先选择制造商', icon: 'none' });
        return;
      }

      // 重新加载系列列表或机型列表
      if (showSeriesStep) {
        this.loadSeriesList(selectedManufacturer);
      } else {
        this.loadModelList(selectedManufacturer);
      }

      this.setData({
        currentStep: 2,
        acrValue: null
      }, () => {
        // 滚动到系列或机型选择区域
        setTimeout(() => {
          const selector = showSeriesStep ? '#series-card' : '#model-card';
          wx.pageScrollTo({
            selector: selector,
            duration: 300
          });
        }, 100);
      });
      return;
    }

    if (targetStep === 3) {
      // 跳转到步骤3需要已选择机型
      if (!selectedManufacturer) {
        wx.showToast({ title: '请先选择制造商', icon: 'none' });
        return;
      }
      if (!selectedModel) {
        wx.showToast({ title: '请先选择机型', icon: 'none' });
        return;
      }

      // 重新加载改型列表
      this.loadVariantList(selectedModel);

      this.setData({
        currentStep: 3,
        acrValue: null
      }, () => {
        // 滚动到改型选择区域
        setTimeout(() => {
          wx.pageScrollTo({
            selector: '#variant-card',
            duration: 300
          });
        }, 100);
      });
      return;
    }

    if (targetStep === 4) {
      // 跳转到步骤4需要已选择改型
      if (!selectedManufacturer || !selectedModel || !selectedVariant) {
        wx.showToast({ title: '请先完成前面的选择', icon: 'none' });
        return;
      }

      // 如果不需要输入重量，自动跳到步骤5
      if (!needWeightInput) {
        console.log('⚠️ 此机型无需输入重量，自动跳转到步骤5');
        this.setData({
          currentStep: 5,
          acrValue: null
        }, () => {
          setTimeout(() => {
            wx.pageScrollTo({
              selector: '#params-card',
              duration: 300
            });
          }, 100);
          this.calculateACR();
        });
        return;
      }

      this.setData({
        currentStep: 4,
        acrValue: null
      }, () => {
        // 滚动到重量输入区域
        setTimeout(() => {
          wx.pageScrollTo({
            selector: '#weight-card',
            duration: 300
          });
        }, 100);
      });
      return;
    }

    if (targetStep === 5) {
      // 跳转到步骤5需要完成所有必要步骤
      if (!selectedManufacturer || !selectedModel || !selectedVariant) {
        wx.showToast({ title: '请先完成前面的选择', icon: 'none' });
        return;
      }
      if (needWeightInput && !aircraftMass) {
        wx.showToast({ title: '请先输入飞机重量', icon: 'none' });
        return;
      }

      this.setData({
        currentStep: 5,
        acrValue: null
      }, () => {
        // 滚动到参数选择区域
        setTimeout(() => {
          wx.pageScrollTo({
            selector: '#params-card',
            duration: 300
          });
        }, 100);
        // 进入步骤5时自动计算ACR
        this.calculateACR();
      });
      return;
    }
  },

  // 滚动到页面顶部
  scrollToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  nextStep() {
    const { currentStep, selectedManufacturer, showSeriesStep, selectedSeries,
            selectedModel, selectedVariant, aircraftMass, needWeightInput } = this.data;

    console.log('🚀 nextStep 被调用', {
      currentStep,
      aircraftMass,
      needWeightInput,
      aircraftMassType: typeof aircraftMass,
      aircraftMassLength: aircraftMass ? aircraftMass.length : 0,
      isEmpty: !aircraftMass
    });

    // 步骤验证
    if (currentStep === 1 && !selectedManufacturer) {
      wx.showToast({ title: '请选择制造商', icon: 'none' });
      return;
    }

    if (currentStep === 2 && showSeriesStep && !selectedSeries && !selectedModel) {
      wx.showToast({ title: '请选择系列或机型', icon: 'none' });
      return;
    }

    if (currentStep === 2 && !showSeriesStep && !selectedModel) {
      wx.showToast({ title: '请选择机型', icon: 'none' });
      return;
    }

    if (currentStep === 3 && !selectedVariant) {
      wx.showToast({ title: '请选择改型', icon: 'none' });
      return;
    }

    if (currentStep === 4 && needWeightInput) {
      // 验证重量是否已输入且有效
      const mass = aircraftMass ? aircraftMass.trim() : '';
      if (!mass || mass.length === 0) {
        console.log('❌ 重量验证失败:', { aircraftMass, mass, trimmed: mass });
        wx.showToast({ title: '请输入飞机重量', icon: 'none' });
        return;
      }
      console.log('✅ 重量验证通过:', mass);
    }

    const nextStepNumber = currentStep + 1;

    this.setData({
      currentStep: nextStepNumber
    }, () => {
      // 如果进入步骤5，尝试自动计算ACR
      if (nextStepNumber === 5) {
        this.calculateACR();
      }
    });
  },

  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1,
        acrValue: null
      });
    }
  },

  // 重新开始
  restart() {
    this.setData({
      currentStep: 1,
      showSeriesStep: false,
      selectedManufacturer: '',
      selectedSeries: '',
      selectedModel: '',
      selectedVariant: '',
      aircraftMass: '',
      pavementType: '',
      subgradeStrength: '',
      tirePressure: 'W',
      evaluationMethod: 'T',
      acrValue: null,
      seriesList: [],
      modelList: [],
      variantList: [],
      needWeightInput: false,
      massRange: { min: 0, max: 0 }
    });

    (this as any).currentVariantData = null;
  },

  // 检查无广告状态
  checkAdFreeStatus() {
    const adFreeManager = require('../../utils/ad-free-manager.js');
    try {
      const isAdFree = adFreeManager.isAdFreeToday();
      this.setData({ isAdFree });
      console.log('📅 无广告状态:', isAdFree ? '今日无广告' : '显示广告');
    } catch (error) {
      console.error('❌ 检查无广告状态失败:', error);
    }
  }
});
