/**
 * ACR数据管理器
 * 负责加载、缓存和查询ACR数据
 */

class ACRManager {
  constructor() {
    this.acrData = null
    this.cache = new Map()
    this.cacheExpiry = 24 * 60 * 60 * 1000 // 24小时缓存
  }

  /**
   * 加载ACR数据
   */
  async loadACRData() {
    const cacheKey = 'acr_data'
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      console.log('✅ 使用缓存的ACR数据')
      this.acrData = cached
      return cached
    }

    try {
      console.log('📦 开始加载ACR数据...')
      
      // 尝试从packageF分包加载
      const data = await this.loadFromPackage()
      
      if (data && data.aircraftData) {
        console.log(`✅ 成功加载ACR数据，包含 ${data.aircraftData.length} 个机型`)
        this.acrData = data
        this.setCache(cacheKey, data)
        return data
      } else {
        throw new Error('ACR数据格式错误')
      }
    } catch (error) {
      console.error('❌ 加载ACR数据失败:', error)
      // 返回默认数据
      const defaultData = this.getDefaultData()
      this.acrData = defaultData
      return defaultData
    }
  }

  /**
   * 从packageF分包加载数据
   */
  loadFromPackage() {
    return new Promise((resolve, reject) => {
      try {
        require('../packageF/ACR.js', (data) => {
          console.log('✅ 成功从packageF加载ACR数据')
          resolve(data)
        }, (error) => {
          console.error('❌ 从packageF加载ACR数据失败:', error)
          reject(error)
        })
      } catch (error) {
        console.error('❌ require packageF ACR数据失败:', error)
        reject(error)
      }
    })
  }

  /**
   * 获取所有飞机制造商
   */
  getManufacturers() {
    if (!this.acrData || !this.acrData.aircraftData) {
      return []
    }

    const manufacturers = new Set()
    this.acrData.aircraftData.forEach(aircraft => {
      const model = aircraft.model
      if (model.startsWith('A3') || model.startsWith('A2')) {
        manufacturers.add('Airbus')
      } else if (model.startsWith('B7') || model.startsWith('B8')) {
        manufacturers.add('Boeing')
      } else if (model.startsWith('C9') || model.startsWith('ARJ')) {
        manufacturers.add('COMAC')
      } else if (model.startsWith('E1')) {
        manufacturers.add('Embraer')
      } else if (model.startsWith('CRJ')) {
        manufacturers.add('Bombardier')
      } else if (model.startsWith('ATR')) {
        manufacturers.add('ATR')
      } else if (model.startsWith('MA') || model.startsWith('Y12')) {
        manufacturers.add('AVIC')
      } else {
        manufacturers.add('Others')
      }
    })

    return Array.from(manufacturers).sort()
  }

  /**
   * 根据制造商获取飞机型号
   */
  getModelsByManufacturer(manufacturer) {
    if (!this.acrData || !this.acrData.aircraftData) {
      return []
    }

    return this.acrData.aircraftData.filter(aircraft => {
      const model = aircraft.model
      switch (manufacturer) {
        case 'Airbus':
          return model.startsWith('A3') || model.startsWith('A2')
        case 'Boeing':
          return model.startsWith('B7') || model.startsWith('B8')
        case 'COMAC':
          return model.startsWith('C9') || model.startsWith('ARJ')
        case 'Embraer':
          return model.startsWith('E1')
        case 'Bombardier':
          return model.startsWith('CRJ')
        case 'ATR':
          return model.startsWith('ATR')
        case 'AVIC':
          return model.startsWith('MA') || model.startsWith('Y12')
        case 'Others':
          return !model.match(/^(A[23]|B[78]|C9|ARJ|E1|CRJ|ATR|MA|Y12)/)
        default:
          return false
      }
    }).map(aircraft => ({
      model: aircraft.model,
      variantCount: aircraft.variants.length
    }))
  }

  /**
   * 根据型号获取变型
   */
  getVariantsByModel(model) {
    if (!this.acrData || !this.acrData.aircraftData) {
      return []
    }

    const aircraft = this.acrData.aircraftData.find(a => a.model === model)
    if (!aircraft) {
      return []
    }

    return aircraft.variants.map(variant => {
      // 创建带重量信息的显示名称
      const displayName = this.formatVariantDisplayName(variant)
      
      return {
      variantName: variant.variantName,
        displayName: displayName,
      mass_kg: variant.mass_kg,
      tirePressure_mpa: variant.tirePressure_mpa,
      loadPercentageMLG: variant.loadPercentageMLG
      }
    })
  }

  /**
   * 格式化改型显示名称，包含重量信息
   */
  formatVariantDisplayName(variant) {
    const baseVariantName = variant.variantName
    
    // 检查是否为波音机型格式（有最大最小重量）
    if (typeof variant.mass_kg === 'object' && variant.mass_kg.min && variant.mass_kg.max) {
      // 波音机型：显示精确重量范围（kg）
      const minMass = variant.mass_kg.min
      const maxMass = variant.mass_kg.max
      return `${baseVariantName} (${minMass}-${maxMass}kg)`
    } else if (typeof variant.mass_kg === 'number') {
      // 空客机型：显示精确重量（kg）
      const massInKg = variant.mass_kg
      return `${baseVariantName} (${massInKg}kg)`
    } else {
      // 兜底：只显示基础名称
      return baseVariantName
    }
  }

  /**
   * 查询ACR值 - 根据飞机参数和道面条件查询对应的ACR值
   * 支持Boeing机型的线性插值计算和Airbus机型的固定参数
   * @param {string} model 飞机型号
   * @param {string} variantName 变型名称 
   * @param {number} inputMass_kg 输入的飞机重量
   * @param {string} pavementType 道面类型 (F=柔性, R=刚性)
   * @param {string} subgradeCategory 道基强度 (A=高, B=中, C=低, D=超低)
   * @returns {object|null} ACR查询结果
   */
  queryACR(model, variantName, inputMass_kg, pavementType, subgradeCategory) {
    if (!this.acrData || !this.acrData.aircraftData) {
      console.error('❌ ACR数据未加载')
      return null
    }

    // 查找对应的飞机型号
    const aircraft = this.acrData.aircraftData.find(a => a.model === model)
    if (!aircraft) {
      console.error(`❌ 未找到飞机型号: ${model}`)
      return null
    }

    console.log(`🔍 查找飞机: ${model}, 输入质量: ${inputMass_kg}kg`)
    console.log(`📊 该型号共有 ${aircraft.variants.length} 个变型`)

    // 如果指定了变型名称，优先使用指定的变型
    let selectedVariant = null
    if (variantName) {
      selectedVariant = aircraft.variants.find(v => v.variantName === variantName)
      if (selectedVariant) {
        console.log(`✅ 使用指定变型: ${variantName}`)
      } else {
        console.warn(`⚠️ 未找到指定变型: ${variantName}`)
      }
    }

    // 如果没有指定变型或指定的变型不存在，选择第一个可用变型
    if (!selectedVariant) {
      selectedVariant = aircraft.variants[0]
      console.log(`✅ 自动选择变型: ${selectedVariant.variantName}`)
    }

    // 确定道面类型键名
    const pavementKey = pavementType === 'R' ? 'rigidPavement' : 'flexiblePavement'
    const pavementTypeName = pavementType === 'R' ? '刚性道面' : '柔性道面'
    
    // 确定道基强度键名
    const subgradeKey = this.getSubgradeKey(subgradeCategory)
    const subgradeNames = {
      'A': '高',
      'B': '中', 
      'C': '低',
      'D': '特低'
    }
    const subgradeName = subgradeNames[subgradeCategory] || '未知道基强度'
    
    console.log(`🛣️ 道面条件: ${pavementTypeName}, ${subgradeName}`)

    // 判断是否为插值型数据格式 (Boeing) 还是固定型数据格式 (Airbus)
    const isInterpolationFormat = selectedVariant.mass_kg && 
                                  typeof selectedVariant.mass_kg === 'object' && 
                                  selectedVariant.mass_kg.max !== undefined && 
                                  selectedVariant.mass_kg.min !== undefined

    let acrValue, actualMass, tirePressure, loadPercentageMLG

    if (isInterpolationFormat) {
      // Boeing机型：使用线性插值计算
      console.log(`🔧 Boeing机型 - 使用插值计算`)
      
      const massRange = selectedVariant.mass_kg
      const minMass = massRange.min
      const maxMass = massRange.max
      
      console.log(`📏 质量范围: ${minMass}kg - ${maxMass}kg`)
      
      // 检查输入质量是否在有效范围内
      if (inputMass_kg < minMass) {
        console.warn(`⚠️ 输入质量 ${inputMass_kg}kg 低于最小质量 ${minMass}kg，使用最小质量数据`)
        inputMass_kg = minMass
      } else if (inputMass_kg > maxMass) {
        console.warn(`⚠️ 输入质量 ${inputMass_kg}kg 超过最大质量 ${maxMass}kg，使用最大质量数据`)
        inputMass_kg = maxMass
      }
      
      // 检查ACR数据结构
      if (!selectedVariant.acr || !selectedVariant.acr.max || !selectedVariant.acr.min ||
          !selectedVariant.acr.max[pavementKey] || !selectedVariant.acr.min[pavementKey] ||
          !selectedVariant.acr.max[pavementKey][subgradeKey] || !selectedVariant.acr.min[pavementKey][subgradeKey]) {
        console.error(`❌ 未找到对应条件的插值ACR数据`)
        return null
      }
      
      // 获取最大最小ACR值
      const maxACR = selectedVariant.acr.max[pavementKey][subgradeKey]
      const minACR = selectedVariant.acr.min[pavementKey][subgradeKey]
      
      // 线性插值计算ACR值
      const massRatio = (inputMass_kg - minMass) / (maxMass - minMass)
      acrValue = Math.round(minACR + (maxACR - minACR) * massRatio)
      actualMass = inputMass_kg
      
      console.log(`🧮 插值计算: 最小ACR=${minACR}, 最大ACR=${maxACR}, 质量比例=${massRatio.toFixed(3)}, 插值ACR=${acrValue}`)
      
      // 处理其他参数 (可能也需要插值，或使用平均值)
      tirePressure = selectedVariant.tirePressure_mpa
      loadPercentageMLG = (selectedVariant.loadPercentageMLG && selectedVariant.loadPercentageMLG.main) || selectedVariant.loadPercentageMLG
      
    } else {
      // Airbus机型：使用固定参数
      console.log(`🔧 Airbus机型 - 使用固定参数`)
      
      // 检查ACR数据是否存在
      if (!selectedVariant.acr || !selectedVariant.acr[pavementKey] || !selectedVariant.acr[pavementKey][subgradeKey]) {
        console.error(`❌ 未找到对应条件的ACR数据`)
        console.log('📋 可用道面类型:', Object.keys(selectedVariant.acr || {}))
        if (selectedVariant.acr && selectedVariant.acr[pavementKey]) {
          console.log('📋 可用道基强度:', Object.keys(selectedVariant.acr[pavementKey]))
        }
        return null
      }

      // 获取固定ACR值
      acrValue = selectedVariant.acr[pavementKey][subgradeKey]
      actualMass = selectedVariant.mass_kg
      tirePressure = selectedVariant.tirePressure_mpa
      loadPercentageMLG = selectedVariant.loadPercentageMLG
      
      console.log(`📋 固定参数: 标准质量=${actualMass}kg, ACR=${acrValue}`)
    }
    
    console.log(`✅ 最终ACR值: ${acrValue}`)

    return {
      acr: acrValue,
      variant: selectedVariant,
      actualMass: actualMass,
      inputMass: inputMass_kg,
      pavementType: pavementType,
      pavementTypeName: pavementTypeName,
      subgradeCategory: subgradeCategory,
      subgradeName: subgradeName,
      tirePressure: tirePressure,
      loadPercentageMLG: loadPercentageMLG,
      isInterpolated: isInterpolationFormat
    }
  }

  /**
   * 解析PCR代码
   */
  parsePCR(pcrString) {
    // 格式: 1090/R/B/W/T 或 PCR 1090/R/B/W/T (完整的5段式)
    const match = pcrString.match(/(?:PCR\s*)?(\d+)\/([RF])\/([ABCD])\/([WXYZ])\/([TU])/)
    if (!match) {
      return null
    }

    return {
      pcr: parseInt(match[1]),
      pavementType: match[2], // R=Rigid, F=Flexible
      subgradeCategory: match[3], // A=High, B=Medium, C=Low, D=Ultra-low
      tirePressureLimit: match[4], // W=Unlimited, X=High, Y=Medium, Z=Low
      evaluationMethod: match[5] // T=Technical, U=Using aircraft experience
    }
  }

  /**
   * 获取道基强度键名
   */
  getSubgradeKey(category) {
    const keyMap = {
      'A': 'high_A_200',
      'B': 'medium_B_120', 
      'C': 'low_C_80',
      'D': 'ultraLow_D_50'
    }
    return keyMap[category] || 'medium_B_120'
  }

  /**
   * 缓存管理
   */
  setCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    })
  }

  getFromCache(key) {
    const cached = this.cache.get(key)
    if (!cached) {
      return null
    }

    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  clearCache() {
    this.cache.clear()
    console.log('🗑️ ACR缓存已清除')
  }

  /**
   * 获取默认数据
   */
  getDefaultData() {
    return {
      documentInfo: {
        title: "ACR数据加载失败",
        lastUpdated: new Date().toISOString().split('T')[0],
        source: "Default fallback data"
      },
      aircraftData: []
    }
  }

  /**
   * 获取PCR组件选项
   */
  getPCRComponents() {
    return {
      // PCR数值选项
      pcrValues: [
        { name: '20', value: '20' },
        { name: '25', value: '25' },
        { name: '30', value: '30' },
        { name: '35', value: '35' },
        { name: '40', value: '40' },
        { name: '45', value: '45' },
        { name: '50', value: '50' },
        { name: '55', value: '55' },
        { name: '57', value: '57' },
        { name: '60', value: '60' },
        { name: '65', value: '65' },
        { name: '70', value: '70' },
        { name: '75', value: '75' },
        { name: '80', value: '80' }
      ],
      
      // 道面类型选项
      pavementTypes: [
        { name: 'F - 柔性道面', value: 'F' },
        { name: 'R - 刚性道面', value: 'R' }
      ],
      
      // 道基强度选项
      subgradeCategories: [
        { name: 'A - 高', value: 'A' },
        { name: 'B - 中', value: 'B' },
        { name: 'C - 低', value: 'C' },
        { name: 'D - 特低', value: 'D' }
      ],
      
      // 胎压限制选项
      tirePressureLimits: [
        { name: 'W - 无限制', value: 'W' },
        { name: 'X - 高压限制', value: 'X' },
        { name: 'Y - 中压限制', value: 'Y' },
        { name: 'Z - 低压限制', value: 'Z' }
      ]
    }
  }

  /**
   * 根据组件组装PCR代码
   */
  assemblePCRCode(pcrValue, pavementType, subgradeCategory, tirePressureLimit) {
    return `${pcrValue}/${pavementType}/${subgradeCategory}/${tirePressureLimit}`
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    if (!this.acrData || !this.acrData.aircraftData) {
      return {
        totalAircraft: 0,
        totalVariants: 0,
        manufacturers: 0
      }
    }

    const totalVariants = this.acrData.aircraftData.reduce((sum, aircraft) => 
      sum + aircraft.variants.length, 0
    )

    return {
      totalAircraft: this.acrData.aircraftData.length,
      totalVariants: totalVariants,
      manufacturers: this.getManufacturers().length
    }
  }
}

// 创建单例实例
const acrManager = new ACRManager()

module.exports = acrManager 