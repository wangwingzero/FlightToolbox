// 权威定义页面
var BasePage = require('../utils/base-page.js');

var pageConfig = {
  data: {
    // 定义数据
    allDefinitions: [],
    displayedDefinitions: [],
    
    // 搜索相关
    searchValue: '',
    searchFocused: false,
    
    // 分页相关
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    
    // 统计信息
    totalCount: 0,
    filteredCount: 0,
    
    // 浮窗相关
    showModal: false,
    selectedDefinition: {}
  },
  
  customOnLoad: function(options) {
    console.log('权威定义页面加载');
    this.loadDefinitionsData();
  },
  
  // 加载定义数据
  loadDefinitionsData: function() {
    var self = this;
    try {
      console.log('开始加载权威定义数据...');
      var definitionsModule = require('./definitions.js');
      var definitions = definitionsModule || [];
      
      console.log('✅ 权威定义数据加载成功，数量:', definitions.length);
      
      self.setData({
        allDefinitions: definitions,
        totalCount: definitions.length,
        filteredCount: definitions.length
      });
      
      // 初始化第一页数据
      self.loadPageData();
      
    } catch (error) {
      console.error('❌ 权威定义数据加载失败:', error);
      self.handleError(error, '权威定义数据加载失败');
      
      // 设置默认空数据
      self.setData({
        allDefinitions: [],
        totalCount: 0,
        filteredCount: 0,
        displayedDefinitions: [],
        hasMore: false
      });
    }
  },
  
  // 加载分页数据
  loadPageData: function() {
    var currentPage = this.data.currentPage;
    var pageSize = this.data.pageSize;
    var currentData = this.getCurrentData();
    var displayedDefinitions = this.data.displayedDefinitions;
    
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, currentData.length);
    
    var newData = currentData.slice(startIndex, endIndex);
    var updatedDisplayed = currentPage === 1 ? newData : displayedDefinitions.concat(newData);
    
    var hasMore = endIndex < currentData.length;
    
    this.setData({
      displayedDefinitions: updatedDisplayed,
      hasMore: hasMore
    });
    
    console.log('分页加载完成，当前显示:', updatedDisplayed.length, '总数:', currentData.length);
  },
  
  // 获取当前应该显示的数据（考虑搜索状态）
  getCurrentData: function() {
    var searchValue = this.data.searchValue.trim();
    if (!searchValue) {
      return this.data.allDefinitions;
    }
    
    // 执行搜索过滤
    var lowerSearchValue = searchValue.toLowerCase();
    return this.data.allDefinitions.filter(function(item) {
      return (item.chinese_name && item.chinese_name.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
             (item.english_name && item.english_name.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
             (item.definition && item.definition.toLowerCase().indexOf(lowerSearchValue) !== -1) ||
             (item.source && item.source.toLowerCase().indexOf(lowerSearchValue) !== -1);
    });
  },
  
  // 搜索输入处理（实时搜索）
  onSearchInput: function(e) {
    var searchValue = e.detail.value.trim();
    console.log('搜索输入:', searchValue);
    
    this.setData({
      searchValue: searchValue,
      currentPage: 1,
      displayedDefinitions: []
    });
    
    // 实时搜索
    this.performSearch();
  },
  
  // 执行搜索
  performSearch: function() {
    var currentData = this.getCurrentData();
    
    this.setData({
      filteredCount: currentData.length,
      currentPage: 1,
      displayedDefinitions: []
    });
    
    // 重新加载第一页数据
    this.loadPageData();
    
    console.log('搜索完成，找到', currentData.length, '条结果');
  },
  
  // 清空搜索
  onSearchClear: function() {
    console.log('清空搜索');
    
    this.setData({
      searchValue: '',
      currentPage: 1,
      displayedDefinitions: []
    });
    
    // 立即执行搜索恢复全部数据
    this.performSearch();
  },
  
  // 搜索框聚焦
  onSearchFocus: function() {
    console.log('搜索框获得焦点');
    this.setData({
      searchFocused: true
    });
  },
  
  // 搜索框失焦
  onSearchBlur: function() {
    console.log('搜索框失去焦点');
    this.setData({
      searchFocused: false
    });
  },
  
  // 搜索确认
  onSearchConfirm: function(e) {
    console.log('搜索确认:', e.detail.value);
    this.performSearch();
  },
  

  
  // 菜单按钮点击
  onMenuTap: function() {
    console.log('菜单按钮点击');
    wx.showActionSheet({
      itemList: ['刷新数据', '使用说明', '反馈建议'],
      success: (res) => {
        switch(res.tapIndex) {
          case 0:
            this.onPullDownRefresh();
            break;
          case 1:
            this.showTips();
            break;
          case 2:
            this.showFeedback();
            break;
        }
      }
    });
  },
  
  // 显示使用说明
  showTips: function() {
    wx.showModal({
      title: '使用说明',
      content: '• 提供航空专业术语的权威定义查询\n• 支持中英文术语名称和定义内容搜索\n• 点击任意定义可复制完整内容到剪贴板\n• 支持离线使用，无需网络连接\n• 所有定义均来自官方权威文件',
      showCancel: false,
      confirmText: '知道了'
    });
  },
  
  // 显示反馈
  showFeedback: function() {
    wx.showModal({
      title: '反馈建议',
      content: '如有问题或建议，请通过小程序内的反馈功能联系我们。',
      showCancel: false,
      confirmText: '知道了'
    });
  },
  
  // 加载更多
  onLoadMore: function() {
    if (!this.data.hasMore) {
      return;
    }
    
    this.setData({
      currentPage: this.data.currentPage + 1
    });
    
    this.loadPageData();
  },
  
  // 点击定义项 - 显示浮窗
  onDefinitionTap: function(e) {
    var definition = e.currentTarget.dataset.definition;
    if (!definition) {
      return;
    }
    
    console.log('显示定义详情浮窗:', definition.chinese_name);
    
    this.setData({
      showModal: true,
      selectedDefinition: definition
    });
  },
  
  // 关闭浮窗
  onModalClose: function() {
    console.log('关闭浮窗');
    this.setData({
      showModal: false,
      selectedDefinition: {}
    });
  },
  
  // 阻止事件冒泡
  stopPropagation: function() {
    // 阻止点击浮窗内容时关闭浮窗
  },
  
  // 复制定义内容
  onCopyDefinition: function() {
    var definition = this.data.selectedDefinition;
    if (!definition) {
      return;
    }
    
    // 构建复制文本
    var textToCopy = definition.chinese_name + '\n';
    if (definition.english_name) {
      textToCopy += definition.english_name + '\n\n';
    }
    textToCopy += definition.definition + '\n\n' + '来源：' + definition.source;
    
    var self = this;
    wx.setClipboardData({
      data: textToCopy,
      success: function() {
        self.showSuccess('定义内容已复制到剪贴板');
        // 复制成功后关闭浮窗
        self.onModalClose();
      },
      fail: function() {
        console.error('复制失败');
        self.showError('复制失败，请重试');
      }
    });
  },
  
  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadDefinitionsData();
    wx.stopPullDownRefresh();
    this.showSuccess('数据刷新成功');
  }
};

Page(BasePage.createPage(pageConfig));