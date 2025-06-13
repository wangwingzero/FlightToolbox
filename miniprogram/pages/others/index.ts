// 实用工具页面

const performanceMonitor = require('../../utils/performance-monitor.js')
const dataManagerUtil = require('../../utils/data-manager.js')
const acrManager = require('../../utils/acr-manager.js')

Page({
  data: {
    // 性能监控相关
    performanceData: null as any,
    
    // 数据管理相关
    dataStatus: {
      icao: '未加载',
      abbreviations: '未加载', 
      airport: '未加载',
      definitions: '未加载',
      normative: '未加载',
      acr: '未加载'
    },
    
    // 预加载状态
    preloadStatus: {
      isPreloading: false,
      progress: 0,
      currentTask: ''
    }
  },

  onLoad() {
    this.checkDataStatus()
  },

  // 检查数据状态
  async checkDataStatus() {
    const status = { ...this.data.dataStatus }
    
    // 检查各种数据的加载状态
    try {
      // 检查ICAO数据
      const icaoData = await dataManagerUtil.loadIcaoData()
      status.icao = icaoData && icaoData.length > 0 ? `已加载 (${icaoData.length}条)` : '加载失败'
    } catch (e) {
      status.icao = '加载失败'
    }

    try {
      // 检查缩写数据
      const abbData = await dataManagerUtil.loadAbbreviationsData()
      status.abbreviations = abbData && abbData.length > 0 ? `已加载 (${abbData.length}条)` : '加载失败'
    } catch (e) {
      status.abbreviations = '加载失败'
    }

    try {
      // 检查机场数据
      const airportData = await dataManagerUtil.loadAirportData()
      status.airport = airportData && airportData.length > 0 ? `已加载 (${airportData.length}条)` : '加载失败'
    } catch (e) {
      status.airport = '加载失败'
    }

    try {
      // 检查定义数据
      const defData = await dataManagerUtil.loadDefinitionsData()
      status.definitions = defData && defData.length > 0 ? `已加载 (${defData.length}条)` : '加载失败'
    } catch (e) {
      status.definitions = '加载失败'
    }

    try {
      // 检查规范性文件数据
      const normativeData = await dataManagerUtil.loadNormativeData()
      status.normative = normativeData && normativeData.categories ? `已加载 (${normativeData.categories.length}个类别)` : '加载失败'
    } catch (e) {
      status.normative = '加载失败'
    }

    try {
      // 检查ACR数据
      const acrData = await acrManager.loadACRData()
      status.acr = acrData && acrData.aircraftData ? `已加载 (${acrData.aircraftData.length}个机型)` : '加载失败'
    } catch (e) {
      status.acr = '加载失败'
    }

    this.setData({ dataStatus: status })
  },

  // 查看性能数据
  viewPerformanceData() {
    const stats = performanceMonitor.getStats()
    this.setData({ performanceData: stats })
    
    const pageLoadCount = Object.values(stats.pageLoad).reduce((sum: number, page: any) => sum + page.count, 0)
    const searchCount = Object.values(stats.search).reduce((sum: number, search: any) => sum + search.count, 0)
    const setDataCount = Object.values(stats.setData).reduce((sum: number, page: any) => sum + page.count, 0)
    
    wx.showModal({
      title: '性能数据',
      content: `页面启动: ${pageLoadCount}次\n搜索操作: ${searchCount}次\nsetData调用: ${setDataCount}次`,
      showCancel: false
    })
  },

  // 导出性能数据
  exportPerformanceData() {
    const data = performanceMonitor.exportData()
    const jsonString = JSON.stringify(data, null, 2)
    
    wx.setClipboardData({
      data: jsonString,
      success: () => {
        wx.showToast({
          title: '性能数据已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  },

  // 清除性能数据
  clearPerformanceData() {
    performanceMonitor.clear()
    this.setData({ performanceData: null })
    
    wx.showToast({
      title: '性能数据已清除',
      icon: 'success'
    })
  },

  // 清除所有缓存
  clearAllCache() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有数据缓存吗？这将需要重新加载所有数据。',
      success: (res) => {
        if (res.confirm) {
          dataManagerUtil.clearCache()
          acrManager.clearCache()
          
          // 重置状态
          this.setData({
            dataStatus: {
              icao: '未加载',
              abbreviations: '未加载',
              airport: '未加载', 
              definitions: '未加载',
              normative: '未加载',
              acr: '未加载'
            }
          })
          
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        }
      }
    })
  },

  // 手动预加载数据
  async manualPreload() {
    this.setData({
      'preloadStatus.isPreloading': true,
      'preloadStatus.progress': 0,
      'preloadStatus.currentTask': '开始预加载...'
    })

    const tasks = [
      { name: 'ICAO通信数据', fn: () => dataManagerUtil.loadIcaoData() },
      { name: '缩写数据', fn: () => dataManagerUtil.loadAbbreviationsData() },
      { name: '机场数据', fn: () => dataManagerUtil.loadAirportData() },
      { name: '定义数据', fn: () => dataManagerUtil.loadDefinitionsData() },
      { name: '规范性文件数据', fn: () => dataManagerUtil.loadNormativeData() },
      { name: 'ACR数据', fn: () => acrManager.loadACRData() }
    ]

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      this.setData({
        'preloadStatus.currentTask': `正在加载${task.name}...`,
        'preloadStatus.progress': Math.round((i / tasks.length) * 100)
      })

      try {
        await task.fn()
        console.log(`✅ ${task.name}加载完成`)
      } catch (error) {
        console.error(`❌ ${task.name}加载失败:`, error)
      }

      // 添加小延迟让用户看到进度
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    this.setData({
      'preloadStatus.isPreloading': false,
      'preloadStatus.progress': 100,
      'preloadStatus.currentTask': '预加载完成'
    })

    // 重新检查数据状态
    await this.checkDataStatus()

    wx.showToast({
      title: '预加载完成',
      icon: 'success'
    })
  },

  // 测试ACR功能
  testACRFunction() {
    wx.showModal({
      title: 'ACR功能测试',
      content: '这将测试ACR数据加载和查询功能，确认继续？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 加载ACR数据
            const acrData = await acrManager.loadACRData()
            
            // 获取统计信息
            const stats = acrManager.getStatistics()
            
            // 测试制造商列表
            const manufacturers = acrManager.getManufacturers()
            
            // 测试型号查询
            const airbusModels = acrManager.getModelsByManufacturer('Airbus')
            
            // 测试变型查询
            let variants = []
            if (airbusModels.length > 0) {
              variants = acrManager.getVariantsByModel(airbusModels[0].model)
            }
            
            // 测试PCR解析
            const pcrTest = acrManager.parsePCR('57/F/B/W/T')
            
            const result = `ACR功能测试结果：
📊 统计信息：
- 飞机型号：${stats.totalAircraft}个
- 变型总数：${stats.totalVariants}个  
- 制造商：${stats.manufacturers}个

🏭 制造商列表：${manufacturers.join(', ')}

✈️ 空客型号：${airbusModels.length}个
${airbusModels.slice(0, 3).map((m: any) => `- ${m.model} (${m.variantCount}个改型)`).join('\n')}

🔧 变型示例：${variants.length}个
${variants.slice(0, 2).map((v: any) => `- ${v.variantName} (${v.mass_kg}kg)`).join('\n')}

📋 PCR解析测试：
- 输入：57/F/B/W/T
- PCR值：${pcrTest ? pcrTest.pcr : 'N/A'}
- 道面类型：${pcrTest ? pcrTest.pavementType : 'N/A'}
- 道基强度：${pcrTest ? pcrTest.subgradeCategory : 'N/A'}`

            wx.showModal({
              title: 'ACR测试结果',
              content: result,
              showCancel: false
            })
            
          } catch (error: any) {
            wx.showModal({
              title: 'ACR测试失败',
              content: `错误信息：${error.message || error}`,
              showCancel: false
            })
          }
        }
      }
    })
  },

  // 快捷工具方法
  openEventReport() {
    wx.navigateTo({
      url: '/pages/event-report/index'
    })
  },

  openPersonalChecklist() {
    wx.navigateTo({
      url: '/pages/personal-checklist/index'
    })
  },

  openFlightTimeShare() {
    wx.navigateTo({
      url: '/pages/flight-time-share/index'
    })
  },

  // 应用信息方法
  feedback() {
    wx.showModal({
      title: '用户反馈',
      content: '关注公众号：飞行播客\n进行反馈',
      confirmText: '知道了',
      showCancel: false
    })
  },

  aboutUs() {
    wx.showModal({
      title: '关于我',
      content: '飞行小工具 v1.0.0\n开发者：虎大王\n\n一个专为飞行员设计的实用工具集合',
      confirmText: '知道了',
      showCancel: false
    })
  },

  onShareAppMessage() {
    return {
      title: '飞行小工具 - 实用工具',
      path: '/pages/others/index'
    }
  },

  onShareTimeline() {
    return {
      title: '飞行小工具 - 实用工具'
    }
  }
}) 