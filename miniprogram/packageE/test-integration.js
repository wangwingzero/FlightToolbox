// 规范性文件分类功能集成测试
// 用于验证在万能查询页面中的功能是否正常

const classifiedData = require('./classified-data.js')

// 测试基本功能
function testBasicFunctions() {
  console.log('=== 规范性文件分类功能集成测试 ===')
  
  try {
    // 测试获取类别
    const categories = classifiedData.getCategories()
    console.log(`✅ 获取类别成功: ${categories.length}个类别`)
    
    // 测试获取统计信息
    const statistics = classifiedData.getStatistics()
    console.log(`✅ 获取统计信息成功: 总计${statistics.total_documents}个文档`)
    
    // 测试搜索功能
    const searchResults = classifiedData.searchDocuments('咨询通告')
    console.log(`✅ 搜索功能正常: 找到${searchResults.length}个相关文档`)
    
    // 测试CCAR查询
    const ccarResults = classifiedData.searchByCCAR('CCAR-121')
    console.log(`✅ CCAR查询正常: 找到${ccarResults.length}个CCAR-121相关文档`)
    
    // 测试获取最近文档
    const recentDocs = classifiedData.getRecentDocuments(5)
    console.log(`✅ 获取最近文档正常: ${recentDocs.length}个最新文档`)
    
    console.log('=== 所有测试通过 ===')
    return true
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return false
  }
}

// 测试分类详情功能
function testCategoryDetails() {
  console.log('\n=== 测试分类详情功能 ===')
  
  try {
    const categories = classifiedData.getCategories()
    if (categories.length > 0) {
      const firstCategory = categories[0].name
      
      // 测试获取子类别
      const subcategories = classifiedData.getSubcategories(firstCategory)
      console.log(`✅ 获取子类别成功: ${firstCategory} 有 ${subcategories.length}个子类别`)
      
      if (subcategories.length > 0) {
        const firstSubcategory = subcategories[0].name
        
        // 测试获取文档列表
        const documents = classifiedData.getDocumentsBySubcategory(firstCategory, firstSubcategory)
        console.log(`✅ 获取文档列表成功: ${firstSubcategory} 有 ${documents.length}个文档`)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ 分类详情测试失败:', error)
    return false
  }
}

// 导出测试函数
module.exports = {
  testBasicFunctions,
  testCategoryDetails,
  
  // 运行所有测试
  runAllTests() {
    const test1 = testBasicFunctions()
    const test2 = testCategoryDetails()
    
    if (test1 && test2) {
      console.log('\n🎉 所有集成测试通过！规范性文件功能已成功集成到万能查询页面')
      return true
    } else {
      console.log('\n❌ 部分测试失败，请检查集成配置')
      return false
    }
  }
} 