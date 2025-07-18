/**
 * 分包E入口页面 - 规范性文件分类展示
 */

const classifiedData = require('./classified-data.js');

Page({
  data: {
    categories: [],
    statistics: {},
    recentDocuments: [],
    showCategoryDetail: false,
    selectedCategory: null,
    subcategories: [],
    showDocumentList: false,
    selectedSubcategory: null,
    documents: [],
    searchKeyword: '',
    searchResults: [],
    showSearch: false,
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  /**
   * 加载分类数据
   */
  loadData() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      // 获取分类统计
      const stats = classifiedData.getStatistics();
      
      // 获取所有类别
      const categories = classifiedData.getCategories();
      
      // 获取最近文档
      const recent = classifiedData.getRecentDocuments(5);
      
      this.setData({
        statistics: stats,
        categories: categories,
        recentDocuments: recent,
        loading: false
      });
      
      console.log('📊 分类统计:', stats);
      
    } catch (error) {
      console.error('❌ 加载数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 点击类别
   */
  onCategoryTap(e) {
    const categoryName = e.currentTarget.dataset.category;
    const subcategories = classifiedData.getSubcategories(categoryName);
    
    this.setData({
      selectedCategory: categoryName,
      subcategories: subcategories,
      showCategoryDetail: true,
      showDocumentList: false
    });
  },

  /**
   * 点击子类别
   */
  onSubcategoryTap(e) {
    const subcategoryName = e.currentTarget.dataset.subcategory;
    const documents = classifiedData.getDocuments(this.data.selectedCategory, subcategoryName);
    
    this.setData({
      selectedSubcategory: subcategoryName,
      documents: documents,
      showDocumentList: true
    });
  },

  /**
   * 返回类别列表
   */
  onBackToCategories() {
    this.setData({
      showCategoryDetail: false,
      showDocumentList: false,
      selectedCategory: null,
      selectedSubcategory: null
    });
  },

  /**
   * 返回子类别列表
   */
  onBackToSubcategories() {
    this.setData({
      showDocumentList: false,
      selectedSubcategory: null
    });
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    
    if (keyword.trim()) {
      const results = classifiedData.searchDocuments(keyword);
      this.setData({
        searchResults: results,
        showSearch: true
      });
    } else {
      this.setData({
        searchResults: [],
        showSearch: false
      });
    }
  },

  /**
   * 清除搜索
   */
  onClearSearch() {
    this.setData({
      searchKeyword: '',
      searchResults: [],
      showSearch: false
    });
  },

  /**
   * 点击文档
   */
  onDocumentTap(e) {
    const url = e.currentTarget.dataset.url;
    const docIndex = e.currentTarget.dataset.index;
    const docType = e.currentTarget.dataset.type;
    
    // 根据类型和索引获取完整的文档对象
    let docItem = {};
    if (docType === 'search' && this.data.searchResults[docIndex]) {
      docItem = this.data.searchResults[docIndex];
    } else if (docType === 'document' && this.data.documents[docIndex]) {
      docItem = this.data.documents[docIndex];
    } else if (docType === 'recent' && this.data.recentDocuments[docIndex]) {
      docItem = this.data.recentDocuments[docIndex];
    }
    
    // 构建详情信息
    let detailContent = '';
    detailContent += `【标题】${docItem.title || '未知'}\n\n`;
    detailContent += `【文号】${docItem.doc_number || '无'}\n\n`;
    detailContent += `【发布日期】${docItem.publish_date || '未知'}\n\n`;
    detailContent += `【分类】${docItem.category || ''} → ${docItem.subcategory || ''}\n\n`;
    
    // 突出显示有效性状态
    const validityStatus = docItem.validity || '未知状态';
    detailContent += `【有效性】${validityStatus}\n\n`;
    
    if (docItem.office_unit) {
      detailContent += `【办文单位】${docItem.office_unit}\n\n`;
    }
    
    // 添加额外信息（如果有）
    if (docItem.sign_date) {
      detailContent += `【签发日期】${docItem.sign_date}\n\n`;
    }
    
    if (docItem.implement_date) {
      detailContent += `【实施日期】${docItem.implement_date}\n\n`;
    }
    
    // 显示详情弹窗
    wx.showModal({
      title: '文档详情',
      content: detailContent,
      confirmText: '复制链接',
      cancelText: '关闭',
      confirmColor: '#07c160', // 绿色确认按钮
      success: (res) => {
        if (res.confirm && url) {
          // 复制链接到剪贴板
          wx.setClipboardData({
            data: url,
            success: () => {
              wx.showToast({
                title: '链接已复制',
                icon: 'success',
                duration: 1500
              });
              
              // 显示额外的提示，告知用户如何使用链接
              setTimeout(() => {
                wx.showToast({
                  title: '请在浏览器中打开链接查看完整文档',
                  icon: 'none',
                  duration: 2000
                });
              }, 1600);
            }
          });
        }
      }
    });
  },

  /**
   * 查看统计详情
   */
  onViewStatistics() {
    const stats = this.data.statistics;
    const methodInfo = classifiedData.getClassificationMethodInfo();
    
    let message = `总文档数: ${stats.total_documents}\n`;
    message += `分类数: ${stats.total_categories}\n\n`;
    message += `分类方法统计:\n`;
    message += `• 精确匹配: ${stats.classification_methods.exact_match}\n`;
    message += `• 模糊匹配: ${stats.classification_methods.fuzzy_match}\n`;
    message += `• 需要手动: ${stats.classification_methods.manual_required}`;
    
    wx.showModal({
      title: '分类统计',
      content: message,
      showCancel: false
    });
  },

  /**
   * 导出数据
   */
  onExportData() {
    try {
      const exportData = classifiedData.exportClassifiedData(false);
      const dataStr = JSON.stringify(exportData, null, 2);
      
      // 复制到剪贴板
      wx.setClipboardData({
        data: dataStr,
        success: () => {
          wx.showToast({
            title: '数据已复制',
            icon: 'success'
          });
        }
      });
    } catch (error) {
      console.error('导出失败:', error);
      wx.showToast({
        title: '导出失败',
        icon: 'error'
      });
    }
  },

  /**
   * 按CCAR查询
   */
  onSearchByCCAR() {
    wx.showModal({
      title: '按CCAR部号查询',
      content: '请输入CCAR部号（如：121, 91, 61）',
      editable: true,
      placeholderText: '输入部号',
      success: (res) => {
        if (res.confirm && res.content) {
          const ccarNumber = res.content.trim();
          const results = classifiedData.getDocumentsByCCAR(ccarNumber);
          
          if (results.normative_documents.length > 0) {
            this.setData({
              searchResults: results.normative_documents,
              searchKeyword: `CCAR-${ccarNumber}`,
              showSearch: true
            });
          } else {
            wx.showToast({
              title: '未找到相关文档',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 刷新数据
   */
  onRefresh() {
    this.setData({ loading: true });
    // 清除缓存，强制重新分类
    classifiedData.getClassifiedData.__cache = null;
    this.loadData();
  },

  /**
   * 分享页面
   */
  onShareAppMessage() {
    return {
      title: '民航规范性文件分类查询',
      path: '/packageE/index'
    };
  }
}); 