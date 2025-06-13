// 性能监控工具
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: {},
      search: {},
      setData: {},
      memory: {}
    }
  }

  // 记录页面加载性能
  recordPageLoad(pageName, startTime, endTime) {
    const duration = endTime - startTime
    if (!this.metrics.pageLoad[pageName]) {
      this.metrics.pageLoad[pageName] = []
    }
    this.metrics.pageLoad[pageName].push({
      duration,
      timestamp: Date.now()
    })
    
    console.log(`[性能监控] 页面 ${pageName} 加载耗时: ${duration}ms`)
  }

  // 记录搜索性能
  recordSearch(searchType, keyword, duration, resultCount) {
    if (!this.metrics.search[searchType]) {
      this.metrics.search[searchType] = []
    }
    this.metrics.search[searchType].push({
      keyword,
      duration,
      resultCount,
      timestamp: Date.now()
    })
    
    console.log(`[性能监控] ${searchType}搜索 "${keyword}" 耗时: ${duration}ms, 结果: ${resultCount}条`)
  }

  // 记录setData性能
  recordSetData(pageName, dataSize, duration) {
    if (!this.metrics.setData[pageName]) {
      this.metrics.setData[pageName] = []
    }
    this.metrics.setData[pageName].push({
      dataSize,
      duration,
      timestamp: Date.now()
    })
    
    if (duration > 100) {
      console.warn(`[性能监控] ${pageName} setData耗时过长: ${duration}ms, 数据大小: ${dataSize}`)
    }
  }

  // 记录内存使用
  recordMemory() {
    try {
      const memoryInfo = wx.getSystemInfoSync()
      this.metrics.memory[Date.now()] = {
        platform: memoryInfo.platform,
        system: memoryInfo.system,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('[性能监控] 获取内存信息失败:', error)
    }
  }

  // 获取性能统计
  getStats() {
    const stats = {
      pageLoad: {},
      search: {},
      setData: {},
      summary: {}
    }

    // 页面加载统计
    for (const [pageName, records] of Object.entries(this.metrics.pageLoad)) {
      if (records.length > 0) {
        const durations = records.map(r => r.duration)
        stats.pageLoad[pageName] = {
          count: records.length,
          avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
          maxDuration: Math.max(...durations),
          minDuration: Math.min(...durations)
        }
      }
    }

    // 搜索性能统计
    for (const [searchType, records] of Object.entries(this.metrics.search)) {
      if (records.length > 0) {
        const durations = records.map(r => r.duration)
        stats.search[searchType] = {
          count: records.length,
          avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
          maxDuration: Math.max(...durations),
          minDuration: Math.min(...durations)
        }
      }
    }

    // setData性能统计
    for (const [pageName, records] of Object.entries(this.metrics.setData)) {
      if (records.length > 0) {
        const durations = records.map(r => r.duration)
        stats.setData[pageName] = {
          count: records.length,
          avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
          slowCount: records.filter(r => r.duration > 100).length
        }
      }
    }

    return stats
  }

  // 导出性能数据
  exportData() {
    return {
      metrics: this.metrics,
      stats: this.getStats(),
      exportTime: new Date().toISOString()
    }
  }

  // 清除性能数据
  clear() {
    this.metrics = {
      pageLoad: {},
      search: {},
      setData: {},
      memory: {}
    }
    console.log('[性能监控] 性能数据已清除')
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor()

module.exports = performanceMonitor 