// 缩写查询页面
var BasePage = require('../utils/base-page.js');

// 导入缩写数据
var abbreviationAIP = require('./abbreviationAIP.js');
var abbreviationsAirbus = require('./abbreviationsAirbus.js');

var pageConfig = {
  data: {
    // 当前激活的标签
    activeTab: 'all',
    
    // 搜索相关
    searchValue: '',
    searchPlaceholder: '搜索缩写、英文全称或中文翻译...',
    
    // 所有缩写数据
    allData: [],
    
    // 当前显示的数据
    displayData: [],
    
    // 分页相关
    pageSize: 20, // 每页显示20条
    currentPage: 0, // 当前页码（从0开始）
    hasMore: true, // 是否还有更多数据
    isLoading: false, // 是否正在加载
    filteredAllData: [], // 过滤后的所有数据（用于分页）
    
    // 总数统计
    totalCount: 0,
    
    // 详情弹窗
    showDetailPopup: false,
    selectedAbbreviation: {},
    
    // 分类映射
    categoryMap: {
      'AIP': { name: 'AIP标准', color: 'blue' },
      'Airbus': { name: '空客术语', color: 'purple' }
    },

    // 标签列表
    tabList: [
      { name: 'all', title: '全部', icon: '📋', count: 0 },
      { name: 'AIP', title: 'AIP', icon: '📖', count: 0 },
      { name: 'Airbus', title: '空客', icon: '✈️', count: 0 }
    ]
  },

  customOnLoad: function(options) {
    console.log('缩写查询页面加载');
    this.loadAbbreviationData();
  },

  // 加载缩写数据
  loadAbbreviationData: function() {
    var self = this;
    var allData = [];
    var uniqueId = 0;
    
    // 加载AIP缩写数据
    if (abbreviationAIP && abbreviationAIP.length > 0) {
      abbreviationAIP.forEach(function(item) {
        allData.push({
          id: 'aip_' + (uniqueId++), // 添加唯一标识符
          abbreviation: item.abbreviation,
          english_full: item.english_full,
          chinese_translation: item.chinese_translation,
          pronunciation: item.pronunciation,
          source: 'AIP',
          categoryName: 'AIP标准',
          // 🎯 新增交互属性
          isFavorite: false,
          isImportant: self.isImportantAbbreviation(item.abbreviation),
          isEmergency: self.isEmergencyAbbreviation(item.abbreviation),
          viewCount: Math.floor(Math.random() * 100) // 模拟浏览次数
        });
      });
    }
    
    // 加载Airbus缩写数据
    if (abbreviationsAirbus && abbreviationsAirbus.length > 0) {
      abbreviationsAirbus.forEach(function(item) {
        allData.push({
          id: 'airbus_' + (uniqueId++), // 添加唯一标识符
          abbreviation: item.abbreviation,
          english_full: item.english_full,
          chinese_translation: item.chinese_translation,
          pronunciation: item.pronunciation,
          source: 'Airbus',
          categoryName: '空客术语',
          // 🎯 新增交互属性
          isFavorite: false,
          isImportant: self.isImportantAbbreviation(item.abbreviation),
          isEmergency: self.isEmergencyAbbreviation(item.abbreviation),
          viewCount: Math.floor(Math.random() * 100) // 模拟浏览次数
        });
      });
    }
    
    // 验证TCAS数据是否正确加载
    var tcasItems = allData.filter(function(item) {
      var abbrev = (item.abbreviation || '').toLowerCase();
      return abbrev.indexOf('tcas') !== -1;
    });
    console.log('📋 TCAS数据验证:', tcasItems.length, '条');
    tcasItems.forEach(function(item) {
      console.log('  -', item.abbreviation, '(' + item.source + ')');
    });
    
    // 按重要性和使用频率排序
    allData.sort(function(a, b) {
      // 紧急优先
      if (a.isEmergency !== b.isEmergency) {
        return b.isEmergency ? 1 : -1;
      }
      // 重要性优先
      if (a.isImportant !== b.isImportant) {
        return b.isImportant ? 1 : -1;
      }
      // 收藏优先
      if (a.isFavorite !== b.isFavorite) {
        return b.isFavorite ? 1 : -1;
      }
      // 按浏览次数排序
      return b.viewCount - a.viewCount;
    });
    
    // 更新数据和计数
    this.setData({
      allData: allData,
      filteredAllData: allData, // 初始时过滤后的数据就是全部数据
      totalCount: allData.length
    });
    
    // 初始显示前2页数据（40条）
    this.loadPageData(true);
    
    // 更新标签计数
    this.updateTabCounts();
    
    console.log('缩写数据加载完成，共', allData.length, '条，初始显示', Math.min(40, allData.length), '条');
  },

  // 🎯 判断是否为重要缩写 (已禁用)
  isImportantAbbreviation: function(abbrev) {
    // 用户要求删除重要标签功能，统一返回false
    return false;
  },

  // 🚨 判断是否为应急缩写
  isEmergencyAbbreviation: function(abbrev) {
    var emergencyAbbrevs = [
      'MAYDAY', 'PAN', 'EMERGENCY', 'SQUAWK', '7700', '7600', '7500',
      'FUEL', 'MEDICAL', 'HIJACK', 'DISTRESS'
    ];
    return emergencyAbbrevs.indexOf(abbrev.toUpperCase()) !== -1;
  },

  // ❤️ 收藏切换功能
  toggleFavorite: function(e) {
    e.stopPropagation(); // 阻止冒泡到卡片点击事件
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayData[index];
    
    if (item) {
      // 更新收藏状态
      var newFavoriteStatus = !item.isFavorite;
      
      // 找到在所有数据中的位置并更新
      var allData = this.data.allData;
      var targetItem = allData.find(function(dataItem) {
        return dataItem.id === item.id;
      });
      
      if (targetItem) {
        targetItem.isFavorite = newFavoriteStatus;
        
        // 更新显示数据
        var displayData = this.data.displayData;
        displayData[index].isFavorite = newFavoriteStatus;
        
        this.setData({
          allData: allData,
          displayData: displayData
        });
        
        // 显示反馈
        wx.showToast({
          title: newFavoriteStatus ? '已收藏' : '已取消收藏',
          icon: 'success',
          duration: 1500
        });
        
        // 触觉反馈
        wx.vibrateShort();
        
        console.log('📌 收藏状态更新:', item.abbreviation, newFavoriteStatus ? '已收藏' : '已取消');
      }
    }
  },

  // 🔊 发音播放功能
  playPronunciation: function(e) {
    e.stopPropagation(); // 阻止冒泡到卡片点击事件
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayData[index];
    
    if (item && item.pronunciation) {
      // 显示发音文本
      wx.showModal({
        title: '发音指导',
        content: item.abbreviation + '\n\n发音：' + item.pronunciation,
        confirmText: '知道了',
        showCancel: false,
        success: function() {
          console.log('🔊 显示发音:', item.abbreviation, '-', item.pronunciation);
        }
      });
      
      // 触觉反馈
      wx.vibrateShort();
    } else {
      wx.showToast({
        title: '暂无发音信息',
        icon: 'none',
        duration: 1500
      });
    }
  },

  // 📱 长按快速操作 (已移除复制功能)
  showQuickActions: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayData[index];
    var self = this;
    
    if (item) {
      // 触觉反馈
      wx.vibrateShort();
      
      var actions = [];
      if (item.isFavorite) {
        actions.push('取消收藏');
      } else {
        actions.push('添加收藏');
      }
      actions.push('查看详情');
      
      wx.showActionSheet({
        itemList: actions,
        success: function(res) {
          var tapIndex = res.tapIndex;
          
          switch (tapIndex) {
            case 0:
              // 切换收藏
              var fakeEvent = {
                stopPropagation: function() {},
                currentTarget: { dataset: { index: index } }
              };
              self.toggleFavorite(fakeEvent);
              break;
            case 1:
              // 查看详情
              self.showAbbreviationDetail(e);
              break;
          }
        }
      });
      
      console.log('📱 显示快速操作菜单:', item.abbreviation);
    }
  },

  // 📋 复制到剪贴板
  copyToClipboard: function(text, successMessage) {
    if (text) {
      wx.setClipboardData({
        data: text,
        success: function() {
          wx.showToast({
            title: successMessage || '已复制',
            icon: 'success',
            duration: 1500
          });
        },
        fail: function() {
          wx.showToast({
            title: '复制失败',
            icon: 'error',
            duration: 1500
          });
        }
      });
    }
  },

  // 加载分页数据
  loadPageData: function(isReset) {
    var self = this;
    var filteredAllData = this.data.filteredAllData;
    var pageSize = this.data.pageSize;
    var currentPage = isReset ? 0 : this.data.currentPage;
    
    // 计算要显示的数据
    var startIndex = 0;
    var endIndex = (currentPage + 1) * pageSize;
    var newDisplayData = filteredAllData.slice(startIndex, endIndex);
    
    // 检查是否还有更多数据
    var hasMore = endIndex < filteredAllData.length;
    
    console.log('📄 分页加载:', {
      当前页: currentPage,
      显示条数: newDisplayData.length,
      总条数: filteredAllData.length,
      还有更多: hasMore
    });
    
    this.setData({
      displayData: newDisplayData,
      currentPage: currentPage,
      hasMore: hasMore,
      isLoading: false
    });
  },

  // 加载更多数据
  loadMore: function() {
    var self = this;
    
    // 防止重复加载
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }
    
    console.log('📖 加载更多数据...');
    
    this.setData({
      isLoading: true
    });
    
    // 模拟加载延时，提升用户体验
    setTimeout(function() {
      var nextPage = self.data.currentPage + 1;
      self.setData({
        currentPage: nextPage
      });
      self.loadPageData(false);
    }, 300);
  },

  // 更新标签计数
  updateTabCounts: function() {
    var self = this;
    var allData = this.data.allData;
    var tabList = this.data.tabList;
    
    var counts = {
      'all': allData.length,
      'AIP': 0,
      'Airbus': 0
    };
    
    allData.forEach(function(item) {
      if (item.source === 'AIP') {
        counts.AIP++;
      } else if (item.source === 'Airbus') {
        counts.Airbus++;
      }
    });
    
    // 更新计数
    tabList.forEach(function(tab) {
      tab.count = counts[tab.name] || 0;
    });
    
    this.setData({
      tabList: tabList
    });
  },

  // 标签切换
  onCustomTabChange: function(e) {
    var tabName = e.currentTarget.dataset.tab;
    console.log('切换标签:', tabName);
    
    this.setData({
      activeTab: tabName
    });
    
    this.filterData();
  },

  // 搜索输入
  onSearchChange: function(e) {
    this.setData({
      searchValue: e.detail
    });
    this.filterData();
  },

  // 清空搜索
  onSearchClear: function() {
    this.setData({
      searchValue: ''
    });
    this.filterData();
  },

  // 过滤数据
  filterData: function() {
    var self = this;
    var allData = this.data.allData;
    var activeTab = this.data.activeTab;
    var searchValue = this.data.searchValue.toLowerCase().trim();
    
    console.log('🔍 开始过滤数据:', {
      总数据量: allData.length,
      当前标签: activeTab,
      搜索词: searchValue
    });
    
    var filteredData = allData;
    
    // 分类过滤
    if (activeTab !== 'all') {
      filteredData = filteredData.filter(function(item) {
        return item.source === activeTab;
      });
      console.log('📋 分类过滤后:', filteredData.length, '条');
    }
    
    // 搜索过滤
    if (searchValue) {
      var beforeSearchCount = filteredData.length;
      filteredData = filteredData.filter(function(item) {
        var abbrev = (item.abbreviation || '').toLowerCase();
        var englishFull = (item.english_full || '').toLowerCase();
        var chineseTranslation = (item.chinese_translation || '').toLowerCase();
        
        var matches = abbrev.indexOf(searchValue) !== -1 ||
                     englishFull.indexOf(searchValue) !== -1 ||
                     chineseTranslation.indexOf(searchValue) !== -1;
        
        // 如果搜索tcas，记录匹配详情
        if (searchValue === 'tcas' && matches) {
          console.log('✅ 找到TCAS匹配:', {
            缩写: item.abbreviation,
            英文: item.english_full,
            中文: item.chinese_translation,
            来源: item.source
          });
        }
        
        return matches;
      });
      console.log('🎯 搜索过滤:', beforeSearchCount, '→', filteredData.length, '条');
    }
    
    console.log('📊 最终结果:', filteredData.length, '条数据');
    
    // 更新过滤后的数据并重置分页
    this.setData({
      filteredAllData: filteredData,
      currentPage: 0,
      hasMore: true
    });
    
    // 重新加载第一页数据
    this.loadPageData(true);
  },

  // 显示详情
  showAbbreviationDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.displayData[index];
    
    if (item) {
      this.setData({
        selectedAbbreviation: item,
        showDetailPopup: true
      });
    }
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedAbbreviation: {}
    });
  },

  // 复制缩写功能已删除

};

Page(BasePage.createPage(pageConfig));