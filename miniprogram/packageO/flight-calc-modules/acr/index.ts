// ACR-PCR计算页面
Page({
  data: {
    // 步骤控制
    currentStep: 1, // 1:选择制造商 2:选择机型 3:选择改型 4:输入重量 5:输入PCR参数 6:显示结果
    
    // ACR-PCR计算相关
    acr: {
      selectedManufacturer: '',
      selectedModel: '',
      selectedVariant: '',
      selectedVariantDisplay: '',
      aircraftMass: '',
      massInputEnabled: false, // 是否允许用户输入重量
      massDisplayLabel: '飞机重量', // 重量字段显示标签
      
      // PCR参数
      pcrNumber: '',
      pavementType: '',
      pavementTypeDisplay: '',
      subgradeStrength: '',
      subgradeStrengthDisplay: '',
      tirePressure: 'W',
      tirePressureDisplay: 'W - 无限制 (Unlimited)',
      evaluationMethod: 'T',
      evaluationMethodDisplay: 'T - 技术评估 (Technical evaluation)',
      
      result: null,
      error: '',
      dataLoaded: false
    },

    // ACR选择器相关
    showAcrManufacturerPicker: false,
    showAcrModelPicker: false,
    showAcrVariantPicker: false,
    acrManufacturerActions: [],
    acrModelActions: [],
    acrVariantActions: [],

    // PCR参数选择器
    showPavementTypePicker: false,
    showSubgradeStrengthPicker: false,
    showTirePressurePicker: false,
    showEvaluationMethodPicker: false,
    pavementTypeActions: [],
    subgradeStrengthActions: [],
    tirePressureActions: [],
    evaluationMethodActions: []
  },

  onLoad() {
    // 直接初始化页面，无需积分验证
    this.initACRData();
  },

  onShow() {
    // 页面显示时的处理逻辑
  },

  onUnload() {
    // 页面卸载清理
  },


  // 初始化ACR数据
  async initACRData() {
    try {
      console.log('🔄 开始初始化ACR数据...');
      
      // 显示加载状态
      this.setData({
        'acr.error': '正在加载ACR数据...'
      });
      
      // 动态导入ACR管理器
      const acrManager = require('../../../utils/acr-manager.js');
      const acrData = await acrManager.loadACRData();
      console.log('📊 ACR数据加载结果:', acrData ? '成功' : '失败');
      
      // 加载制造商列表
      const manufacturers = acrManager.getManufacturers();
      console.log('🏭 制造商列表:', manufacturers);
      
      if (manufacturers.length === 0) {
        throw new Error('制造商列表为空');
      }
      
      const manufacturerActions = manufacturers.map((manufacturer) => ({
        name: manufacturer,
        value: manufacturer
      }));
      
      // 初始化PCR参数选项
      const pavementTypeActions = [
        { name: 'F - 柔性道面 (Flexible)', value: 'F' },
        { name: 'R - 刚性道面 (Rigid)', value: 'R' }
      ];
      
      const subgradeStrengthActions = [
        { name: 'A - 高强度 (High)', value: 'A' },
        { name: 'B - 中强度 (Medium)', value: 'B' },
        { name: 'C - 低强度 (Low)', value: 'C' },
        { name: 'D - 超低强度 (Ultra Low)', value: 'D' }
      ];
      
      const tirePressureActions = [
        { name: 'W - 无限制 (Unlimited)', value: 'W' },
        { name: 'X - 高压轮胎 (High pressure)', value: 'X' },
        { name: 'Y - 中压轮胎 (Medium pressure)', value: 'Y' },
        { name: 'Z - 低压轮胎 (Low pressure)', value: 'Z' }
      ];
      
      const evaluationMethodActions = [
        { name: 'T - 技术评估 (Technical evaluation)', value: 'T' },
        { name: 'U - 使用经验 (Using experience)', value: 'U' }
      ];
      
      this.setData({
        acrManufacturerActions: manufacturerActions,
        pavementTypeActions: pavementTypeActions,
        subgradeStrengthActions: subgradeStrengthActions,
        tirePressureActions: tirePressureActions,
        evaluationMethodActions: evaluationMethodActions,
        'acr.dataLoaded': true,
        'acr.error': ''
      });
      
      console.log('✅ ACR数据初始化完成');
      
    } catch (error) {
      console.error('❌ ACR数据初始化失败:', error);
      this.setData({
        'acr.error': `数据加载失败: ${error.message || '未知错误'}`,
        'acr.dataLoaded': false
      });
    }
  },

  // ACR-PCR计算方法
  calculateACR() {
    const validateParams = () => {
      const acrData = this.data.acr;
      if (!acrData.selectedVariant) {
        return { valid: false, message: '请选择飞机型号和改型' };
      }

      if (!acrData.aircraftMass) {
        return { valid: false, message: '请输入飞机重量' };
      }

      if (!acrData.pcrNumber) {
        return { valid: false, message: '请输入PCR数值' };
      }

      if (!acrData.pavementType) {
        return { valid: false, message: '请选择道面类型' };
      }

      if (!acrData.subgradeStrength) {
        return { valid: false, message: '请选择道基强度类别' };
      }

      const mass = parseFloat(acrData.aircraftMass);
      const pcr = parseFloat(acrData.pcrNumber);

      if (isNaN(mass) || isNaN(pcr)) {
        return { valid: false, message: '请输入有效的数值' };
      }
      
      return { valid: true };
    };

    const performCalculation = () => {
      this.performACRCalculation();
    };

    const buttonChargeManager = require('../../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'aviation-calc-acr',
      validateParams,
      'ACR-PCR分析',
      performCalculation
    );
  },

  // 分离出来的实际ACR计算逻辑
  performACRCalculation() {
    const acrData = this.data.acr;
    
    // 验证输入
    const showError = (errorMsg: string) => {
      this.setData({ 'acr.error': errorMsg });
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '.acr-error-section',
          duration: 500
        });
      }, 300);
    };

    try {
      const mass = parseFloat(acrData.aircraftMass);
      const pcr = parseFloat(acrData.pcrNumber);

      // 调用ACR管理器进行计算
      const acrManager = require('../../../utils/acr-manager.js');
      const acrQueryResult = acrManager.queryACR(
        acrData.selectedModel,
        acrData.selectedVariant,
        mass,
        acrData.pavementType,
        acrData.subgradeStrength
      );

      if (!acrQueryResult) {
        showError('ACR计算失败，请检查输入参数');
        return;
      }

      // 构建完整的结果对象
      const safetyMargin = pcr - acrQueryResult.acr;
      const canOperate = safetyMargin >= 0;
      
      // 胎压检查逻辑
      const tirePressureCheckPassed = this.checkTirePressure(acrQueryResult.tirePressure, acrData.tirePressure);
      
      // 组装PCR代码
      const pcrCode = acrManager.assemblePCRCode(
        pcr,
        acrData.pavementType,
        acrData.subgradeStrength,
        acrData.tirePressure || 'W'
      );

      const result = {
        // 飞机信息
        aircraftInfo: `${acrData.selectedManufacturer} ${acrData.selectedModel}`,
        variantName: acrData.selectedVariant,
        inputMass: mass,
        actualMass: acrQueryResult.actualMass,
        isInterpolated: acrQueryResult.isInterpolated,
        calculationMethod: acrQueryResult.isInterpolated ? '线性插值计算' : '固定参数',
        
        // 飞机参数
        loadPercentageMLG: acrQueryResult.loadPercentageMLG,
        
        // 道面条件
        pcrCode: pcrCode,
        pavementTypeName: acrQueryResult.pavementTypeName,
        subgradeName: acrQueryResult.subgradeName,
        tirePressureCheck: tirePressureCheckPassed ? '通过' : '不通过',
        tirePressureCheckPassed: tirePressureCheckPassed,
        evaluationMethod: acrData.evaluationMethodDisplay || '技术评估',
        
        // ACR-PCR对比结果
        acr: acrQueryResult.acr,
        pcr: pcr,
        safetyMargin: safetyMargin,
        
        // 运行结论
        canOperate: canOperate && tirePressureCheckPassed,
        operationStatus: (canOperate && tirePressureCheckPassed) ? '可以运行' : '不建议运行',
        operationReason: this.getOperationReason(canOperate, tirePressureCheckPassed, safetyMargin)
      };

      this.setData({
        'acr.result': result,
        'acr.error': ''
      });

    } catch (error) {
      showError(`计算错误: ${(error as Error).message || '未知错误'}`);
    }
  },

  /**
   * 检查胎压是否符合要求
   */
  checkTirePressure(aircraftTirePressure: number, airportTirePressureLimit: string): boolean {
    if (!aircraftTirePressure || !airportTirePressureLimit) {
      return true; // 如果没有数据，默认通过
    }

    // 胎压限制映射 (MPa)
    const pressureLimits: { [key: string]: number } = {
      'W': Infinity,  // 无限制
      'X': 1.75,      // 高压限制
      'Y': 1.25,      // 中压限制  
      'Z': 0.50       // 低压限制
    };

    const limit = pressureLimits[airportTirePressureLimit];
    return limit === undefined || aircraftTirePressure <= limit;
  },

  /**
   * 获取运行结论原因
   */
  getOperationReason(canOperate: boolean, tirePressureCheckPassed: boolean, safetyMargin: number): string {
    if (!tirePressureCheckPassed) {
      return '飞机轮胎压力超过道面限制';
    }
    
    if (!canOperate) {
      return `ACR值超过PCR值 ${Math.abs(safetyMargin)} 点`;
    }
    
    if (safetyMargin === 0) {
      return 'ACR值等于PCR值，刚好满足要求';
    }
    
    return `安全余量 ${safetyMargin} 点，符合运行要求`;
  },

  // ========== ACR选择器方法 ==========

  // 制造商选择器
  showAcrManufacturerPicker() {
    if (!this.data.acr.dataLoaded) {
      this.initACRData();
      return;
    }
    this.setData({ showAcrManufacturerPicker: true });
  },

  onAcrManufacturerPickerClose() {
    this.setData({ showAcrManufacturerPicker: false });
  },

  onAcrManufacturerSelect(event: any) {
    const selectedValue = event.detail.value;
    
    // 加载该制造商的型号列表
    const acrManager = require('../../../utils/acr-manager.js');
    const models = acrManager.getModelsByManufacturer(selectedValue);
    const modelActions = models.map((model: any) => ({
      name: model.model,
      value: model.model
    }));
    
    this.setData({
      'acr.selectedManufacturer': selectedValue,
      'acr.selectedModel': '',
      'acr.selectedVariant': '',
      'acr.selectedVariantDisplay': '',
      acrModelActions: modelActions,
      acrVariantActions: [],
      showAcrManufacturerPicker: false,
      'acr.result': null,
      'acr.error': ''
    });
  },

  // 型号选择器
  showAcrModelPicker() {
    if (!this.data.acr.selectedManufacturer) {
      wx.showToast({
        title: '请先选择制造商',
        icon: 'none'
      });
      return;
    }
    this.setData({ showAcrModelPicker: true });
  },

  onAcrModelPickerClose() {
    this.setData({ showAcrModelPicker: false });
  },

  onAcrModelSelect(event: any) {
    const selectedValue = event.detail.value;
    
    // 加载该型号的变型列表
    const acrManager = require('../../../utils/acr-manager.js');
    const variants = acrManager.getVariantsByModel(selectedValue);
    const variantActions = variants.map((variant: any) => ({
      name: variant.displayName, // 使用包含重量信息的显示名称
      value: variant.variantName // 实际值仍使用原始变型名称
    }));
    
    this.setData({
      'acr.selectedModel': selectedValue,
      'acr.selectedVariant': '',
      'acr.selectedVariantDisplay': '',
      acrVariantActions: variantActions,
      showAcrModelPicker: false,
      'acr.result': null,
      'acr.error': ''
    });
  },

  // 改型选择器
  showAcrVariantPicker() {
    if (!this.data.acr.selectedModel) {
      wx.showToast({
        title: '请先选择飞机型号',
        icon: 'none'
      });
      return;
    }
    this.setData({ showAcrVariantPicker: true });
  },

  onAcrVariantPickerClose() {
    this.setData({ showAcrVariantPicker: false });
  },

  onAcrVariantSelect(event: any) {
    const selectedValue = event.detail.value;
    const selectedAction = this.data.acrVariantActions.find(action => action.value === selectedValue);
    
    // 获取变型详细信息
    const acrManager = require('../../../utils/acr-manager.js');
    const variants = acrManager.getVariantsByModel(this.data.acr.selectedModel);
    const variantInfo = variants.find((v: any) => v.variantName === selectedValue);
    
    if (variantInfo) {
      // 检查是否为波音机型（需要输入重量范围）
      const isBoeing = this.data.acr.selectedManufacturer === 'Boeing';
      
      // 处理质量数据 - 可能是对象（Boeing）或数字（Airbus）
      let massDisplay = '';
      if (typeof variantInfo.mass_kg === 'object' && variantInfo.mass_kg.min && variantInfo.mass_kg.max) {
        // Boeing机型显示重量范围
        massDisplay = `${variantInfo.mass_kg.min}-${variantInfo.mass_kg.max}`;
      } else if (typeof variantInfo.mass_kg === 'number') {
        // Airbus机型显示固定重量
        massDisplay = variantInfo.mass_kg.toString();
      }
      
      this.setData({
        'acr.selectedVariant': selectedValue,
        'acr.selectedVariantDisplay': selectedAction && selectedAction.name || variantInfo.displayName || selectedValue, // 优先显示带重量信息的名称
        'acr.massInputEnabled': isBoeing,
        'acr.massDisplayLabel': isBoeing ? '飞机重量 (范围内)' : '标准重量',
        'acr.aircraftMass': isBoeing ? '' : massDisplay,
        showAcrVariantPicker: false,
        'acr.result': null,
        'acr.error': ''
      });
    }
  },

  // ========== PCR参数选择器方法 ==========

  // 道面类型选择器
  showAcrPavementTypePicker() {
    this.setData({ showPavementTypePicker: true });
  },

  onAcrPavementTypePickerClose() {
    this.setData({ showPavementTypePicker: false });
  },

  onAcrPavementTypeSelect(event: any) {
    const selectedValue = event.currentTarget.dataset.value;
    const selectedAction = this.data.pavementTypeActions.find(action => action.value === selectedValue);
    
    this.setData({
      'acr.pavementType': selectedValue,
      'acr.pavementTypeDisplay': selectedAction && selectedAction.name || selectedValue,
      showPavementTypePicker: false
    });
  },

  // 道基强度选择器
  showAcrSubgradeStrengthPicker() {
    this.setData({ showSubgradeStrengthPicker: true });
  },

  onAcrSubgradeStrengthPickerClose() {
    this.setData({ showSubgradeStrengthPicker: false });
  },

  onAcrSubgradeStrengthSelect(event: any) {
    const selectedValue = event.currentTarget.dataset.value;
    const selectedAction = this.data.subgradeStrengthActions.find(action => action.value === selectedValue);
    
    this.setData({
      'acr.subgradeStrength': selectedValue,
      'acr.subgradeStrengthDisplay': selectedAction && selectedAction.name || selectedValue,
      showSubgradeStrengthPicker: false
    });
  },

  // 胎压选择器
  showAcrTirePressurePicker() {
    this.setData({ showTirePressurePicker: true });
  },

  onAcrTirePressurePickerClose() {
    this.setData({ showTirePressurePicker: false });
  },

  onAcrTirePressureSelect(event: any) {
    const selectedValue = event.currentTarget.dataset.value;
    const selectedAction = this.data.tirePressureActions.find(action => action.value === selectedValue);
    
    this.setData({
      'acr.tirePressure': selectedValue,
      'acr.tirePressureDisplay': selectedAction && selectedAction.name || selectedValue,
      showTirePressurePicker: false
    });
  },

  // 评估方法选择器
  showAcrEvaluationMethodPicker() {
    this.setData({ showEvaluationMethodPicker: true });
  },

  onAcrEvaluationMethodPickerClose() {
    this.setData({ showEvaluationMethodPicker: false });
  },

  onAcrEvaluationMethodSelect(event: any) {
    const selectedValue = event.currentTarget.dataset.value;
    const selectedAction = this.data.evaluationMethodActions.find(action => action.value === selectedValue);
    
    this.setData({
      'acr.evaluationMethod': selectedValue,
      'acr.evaluationMethodDisplay': selectedAction && selectedAction.name || selectedValue,
      showEvaluationMethodPicker: false
    });
  },

  // ========== ACR输入事件 ==========

  onAcrAircraftMassChange(event: any) {
    this.setData({ 
      'acr.aircraftMass': event.detail,
      'acr.result': null,
      'acr.error': ''
    });
  },

  onAcrPcrNumberChange(event: any) {
    this.setData({ 
      'acr.pcrNumber': event.detail,
      'acr.result': null,
      'acr.error': ''
    });
  },

  // 步骤控制方法
  nextStep() {
    const currentStep = this.data.currentStep;
    
    // 校验当前步骤的输入
    if (currentStep === 1) {
      if (!this.data.acr.selectedManufacturer) {
        wx.showToast({
          title: '请先选择制造商',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!this.data.acr.selectedModel) {
        wx.showToast({
          title: '请选择机型',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 3) {
      if (!this.data.acr.selectedVariant) {
        wx.showToast({
          title: '请选择改型',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 4) {
      if (!this.data.acr.aircraftMass) {
        wx.showToast({
          title: '请输入飞机重量',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 5) {
      if (!this.data.acr.pcrNumber || !this.data.acr.pavementType || !this.data.acr.subgradeStrength) {
        wx.showToast({
          title: '请完成PCR参数输入',
          icon: 'none'
        });
        return;
      }
    }
    
    // 进入下一步
    this.setData({
      currentStep: currentStep + 1
    });
    
    // 如果到了最后一步，执行计算
    if (currentStep + 1 === 6) {
      this.calculateACR();
    }
  },

  // 返回上一步
  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1,
        'acr.result': null // 清除结果
      });
    }
  },

  // 重新开始
  restart() {
    this.setData({
      currentStep: 1,
      'acr.selectedManufacturer': '',
      'acr.selectedModel': '',
      'acr.selectedVariant': '',
      'acr.selectedVariantDisplay': '',
      'acr.aircraftMass': '',
      'acr.massInputEnabled': false,
      'acr.massDisplayLabel': '飞机重量',
      'acr.pcrNumber': '',
      'acr.pavementType': '',
      'acr.pavementTypeDisplay': '',
      'acr.subgradeStrength': '',
      'acr.subgradeStrengthDisplay': '',
      'acr.tirePressure': 'W',
      'acr.tirePressureDisplay': 'W - 无限制 (Unlimited)',
      'acr.evaluationMethod': 'T',
      'acr.evaluationMethodDisplay': 'T - 技术评估 (Technical evaluation)',
      'acr.result': null,
      'acr.error': '',
      acrModelActions: [],
      acrVariantActions: []
    });
  },

  // 新增：直接选择方法
  selectManufacturer(event: any) {
    const manufacturer = event.currentTarget.dataset.manufacturer;
    
    // 根据制造商分类获取机型列表
    const acrManager = require('../../../utils/acr-manager.js');
    let filteredModels = [];
    
    // 获取所有机型
    const allManufacturers = acrManager.getManufacturers();
    const allModels = [];
    allManufacturers.forEach((mfg: string) => {
      const models = acrManager.getModelsByManufacturer(mfg);
      allModels.push(...models);
    });
    
    // 按新的分类逻辑筛选机型
    if (manufacturer === 'Airbus') {
      filteredModels = allModels.filter((model: any) => 
        model.model.startsWith('A') && !model.model.startsWith('ARJ')
      );
    } else if (manufacturer === 'Boeing') {
      filteredModels = allModels.filter((model: any) => 
        model.model.startsWith('B')
      );
    } else if (manufacturer === 'COMAC') {
      filteredModels = allModels.filter((model: any) => 
        model.model.startsWith('C919') || 
        model.model.startsWith('ARJ') || 
        model.model.startsWith('MA') || 
        model.model.startsWith('Y12')
      );
    } else if (manufacturer === 'Others') {
      filteredModels = allModels.filter((model: any) => 
        !model.model.startsWith('A') && 
        !model.model.startsWith('B') && 
        !model.model.startsWith('C919') && 
        !model.model.startsWith('ARJ') && 
        !model.model.startsWith('MA') && 
        !model.model.startsWith('Y12')
      );
    }
    
    const modelActions = filteredModels.map((model: any) => ({
      name: model.model,
      value: model.model
    }));
    
    this.setData({
      'acr.selectedManufacturer': manufacturer,
      'acr.selectedModel': '',
      'acr.selectedVariant': '',
      'acr.selectedVariantDisplay': '',
      acrModelActions: modelActions,
      acrVariantActions: [],
      'acr.result': null,
      'acr.error': ''
    });
  },

  selectModel(event: any) {
    const model = event.currentTarget.dataset.model;
    
    // 加载该型号的变型列表
    const acrManager = require('../../../utils/acr-manager.js');
    const variants = acrManager.getVariantsByModel(model);
    const variantActions = variants.map((variant: any) => ({
      name: variant.displayName,
      value: variant.variantName
    }));
    
    this.setData({
      'acr.selectedModel': model,
      'acr.selectedVariant': '',
      'acr.selectedVariantDisplay': '',
      acrVariantActions: variantActions,
      'acr.result': null,
      'acr.error': ''
    });
  },

  selectVariant(event: any) {
    const { variant, display } = event.currentTarget.dataset;
    
    // 获取变型详细信息
    const acrManager = require('../../../utils/acr-manager.js');
    const variants = acrManager.getVariantsByModel(this.data.acr.selectedModel);
    const variantInfo = variants.find((v: any) => v.variantName === variant);
    
    if (variantInfo) {
      // 检查是否为波音机型（需要输入重量范围）
      const isBoeing = this.data.acr.selectedManufacturer === 'Boeing';
      
      // 处理质量数据
      let massDisplay = '';
      if (typeof variantInfo.mass_kg === 'object' && variantInfo.mass_kg.min && variantInfo.mass_kg.max) {
        massDisplay = `${variantInfo.mass_kg.min}-${variantInfo.mass_kg.max}`;
      } else if (typeof variantInfo.mass_kg === 'number') {
        massDisplay = variantInfo.mass_kg.toString();
      }
      
      this.setData({
        'acr.selectedVariant': variant,
        'acr.selectedVariantDisplay': display,
        'acr.massInputEnabled': isBoeing,
        'acr.massDisplayLabel': isBoeing ? '飞机重量 (范围内)' : '标准重量',
        'acr.aircraftMass': isBoeing ? '' : massDisplay,
        'acr.result': null,
        'acr.error': ''
      });
    }
  },

  // 清空数据
  clearData() {
    this.restart();
  }
});