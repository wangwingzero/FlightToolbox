// 分包修复测试页面
Page({
  data: {
    testResults: [],
    isLoading: false,
    summary: {
      total: 0,
      success: 0,
      failed: 0
    }
  },

  onLoad() {
    console.log('🧪 分包修复测试页面加载')
    this.runTest()
  },

  // 运行分包测试
  runTest() {
    this.setData({ isLoading: true })
    
    const subpackageDebugger = require('../../utils/subpackage-debug.js')
    
    console.log('🔍 开始测试修复后的分包加载...')
    
    subpackageDebugger.fullDiagnostic((diagnostic) => {
      console.log('📋 测试完成，结果:', diagnostic)
      
      // 转换结果为页面显示格式
      const testResults = []
      Object.keys(diagnostic.packages).forEach(packageName => {
        const pkg = diagnostic.packages[packageName]
        testResults.push({
          packageName: packageName,
          dataFile: pkg.dataFile,
          exists: pkg.exists,
          error: pkg.error,
          dataPreview: pkg.dataPreview
        })
      })
      
      this.setData({
        testResults: testResults,
        summary: diagnostic.summary,
        isLoading: false
      })
      
      // 检查是否还有警告
      if (diagnostic.summary.failedPackages === 0) {
        wx.showToast({
          title: '✅ 所有分包加载正常',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: `⚠️ ${diagnostic.summary.failedPackages}个分包异常`,
          icon: 'none'
        })
      }
    })
  },

  // 重新测试
  onRetryTest() {
    this.runTest()
  },

  // 查看详细信息
  onViewDetail(e) {
    const index = e.currentTarget.dataset.index
    const result = this.data.testResults[index]
    
    let content = `分包: ${result.packageName}\n`
    content += `数据文件: ${result.dataFile}\n`
    content += `状态: ${result.exists ? '✅ 正常' : '❌ 异常'}\n`
    
    if (result.error) {
      content += `错误: ${result.error}\n`
    }
    
    if (result.dataPreview) {
      content += `数据类型: ${result.dataPreview.type}\n`
      if (result.dataPreview.length) {
        content += `数据量: ${result.dataPreview.length}条`
      }
    }
    
    wx.showModal({
      title: '分包详情',
      content: content,
      showCancel: false
    })
  }
})