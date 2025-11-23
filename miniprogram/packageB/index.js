// 缩写查询页面
var BasePage = require('../utils/base-page.js');

// 导入缩写数据
var abbreviationAIP = require('./abbreviationAIP.js');
var abbreviationsAirbus = require('./abbreviationsAirbus.js');
var abbreviationBoeing = require('./abbreviationBoeing.js');
var abbreviationCOMAC = require('./abbreviationCOMAC.js');
var abbreviationJeppesen = require('./abbreviationJeppesen.js');

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
    remainingCount: 0,
    
    // 详情弹窗
    showDetailPopup: false,
    selectedAbbreviation: {},
    
    // 分类映射
    categoryMap: {
      'AIP': { name: 'AIP', color: 'blue' },
      'Airbus': { name: '空客', color: 'purple' },
      'Boeing': { name: '波音', color: 'green' },
      'COMAC': { name: '商飞', color: 'orange' },
      'Jeppesen': { name: 'Jeppesen', color: 'red' }
    },

    // 标签列表
    tabList: [
      { name: 'all', title: '全部', icon: '📋', count: 0 },
      { name: 'AIP', title: 'AIP', icon: '📖', count: 0 },
      { name: 'Airbus', title: '空客', icon: '✈️', count: 0 },
      { name: 'Boeing', title: '波音', icon: '🛫', count: 0 },
      { name: 'COMAC', title: '商飞', icon: '🛩️', count: 0 },
      { name: 'Jeppesen', title: 'Jeppesen', icon: '📚', count: 0 }
    ]
  },

  customOnLoad: function(options) {
    this._allData = [];
    this._filteredAllData = [];
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
          categoryName: 'AIP',
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
          categoryName: '空客',
          // 🎯 新增交互属性
          isFavorite: false,
          isImportant: self.isImportantAbbreviation(item.abbreviation),
          isEmergency: self.isEmergencyAbbreviation(item.abbreviation),
          viewCount: Math.floor(Math.random() * 100) // 模拟浏览次数
        });
      });
    }

    // 加载Boeing缩写数据
    if (abbreviationBoeing && abbreviationBoeing.length > 0) {
      abbreviationBoeing.forEach(function(item) {
        allData.push({
          id: 'boeing_' + (uniqueId++), // 添加唯一标识符
          abbreviation: item.abbreviation,
          english_full: item.english_full,
          chinese_translation: item.chinese_translation,
          pronunciation: item.pronunciation,
          source: 'Boeing',
          categoryName: '波音',
          // 🎯 新增交互属性
          isFavorite: false,
          isImportant: self.isImportantAbbreviation(item.abbreviation),
          isEmergency: self.isEmergencyAbbreviation(item.abbreviation),
          viewCount: Math.floor(Math.random() * 100) // 模拟浏览次数
        });
      });
    }

    // 加载COMAC缩写数据
    if (abbreviationCOMAC && abbreviationCOMAC.length > 0) {
      abbreviationCOMAC.forEach(function(item) {
        allData.push({
          id: 'comac_' + (uniqueId++), // 添加唯一标识符
          abbreviation: item.abbreviation,
          english_full: item.english_full,
          chinese_translation: item.chinese_translation,
          pronunciation: item.pronunciation,
          source: 'COMAC',
          categoryName: '商飞',
          // 🎯 新增交互属性
          isFavorite: false,
          isImportant: self.isImportantAbbreviation(item.abbreviation),
          isEmergency: self.isEmergencyAbbreviation(item.abbreviation),
          viewCount: Math.floor(Math.random() * 100) // 模拟浏览次数
        });
      });
    }

    // 加载Jeppesen缩写数据
    if (abbreviationJeppesen && abbreviationJeppesen.length > 0) {
      abbreviationJeppesen.forEach(function(item) {
        allData.push({
          id: 'jeppesen_' + (uniqueId++), // 添加唯一标识符
          abbreviation: item.abbreviation,
          english_full: item.english_full,
          chinese_translation: item.chinese_translation,
          pronunciation: item.pronunciation,
          source: 'Jeppesen',
          categoryName: 'Jeppesen',
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
    
    // 按字母顺序初始排序（保留紧急和收藏状态的优先级）
    allData.sort(function(a, b) {
      // 紧急优先
      if (a.isEmergency !== b.isEmergency) {
        return b.isEmergency ? 1 : -1;
      }
      // 收藏优先
      if (a.isFavorite !== b.isFavorite) {
        return b.isFavorite ? 1 : -1;
      }
      // 按abbreviation字母顺序排序
      var abbrevA = (a.abbreviation || '').toLowerCase();
      var abbrevB = (b.abbreviation || '').toLowerCase();
      return abbrevA.localeCompare(abbrevB);
    });
    
    // 更新数据和计数
    this._allData = allData;
    this._filteredAllData = allData;
    this.setData({
      totalCount: allData.length
    });
    
    // 初始显示前2页数据（40条）
    this.loadPageData(true);
    
    // 更新标签计数
    this.updateTabCounts();
    
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
      var allData = this._allData || [];
      var targetItem = allData.find(function(dataItem) {
        return dataItem.id === item.id;
      });
      
      if (targetItem) {
        targetItem.isFavorite = newFavoriteStatus;
        
        // 更新显示数据
        var displayData = this.data.displayData;
        displayData[index].isFavorite = newFavoriteStatus;
        
        this.setData({
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
    var filteredAllData = this._filteredAllData || [];
    var pageSize = this.data.pageSize;
    var currentPage = isReset ? 0 : this.data.currentPage;
    
    // 计算要显示的数据
    var startIndex = 0;
    var endIndex = (currentPage + 1) * pageSize;
    var newDisplayData = filteredAllData.slice(startIndex, endIndex);
    
    // 检查是否还有更多数据
    var hasMore = endIndex < filteredAllData.length;
    
    var remainingCount = filteredAllData.length - newDisplayData.length;
    if (remainingCount < 0) {
      remainingCount = 0;
    }
    
    this.setData({
      displayData: newDisplayData,
      currentPage: currentPage,
      hasMore: hasMore,
      isLoading: false,
      remainingCount: remainingCount
    });
  },

  // 加载更多数据
  loadMore: function() {
    var self = this;
    
    // 防止重复加载
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }
    
    
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
    var allData = this._allData || [];
    var tabList = this.data.tabList;

    var counts = {
      'all': allData.length,
      'AIP': 0,
      'Airbus': 0,
      'Boeing': 0,
      'COMAC': 0,
      'Jeppesen': 0
    };

    allData.forEach(function(item) {
      if (item.source === 'AIP') {
        counts.AIP++;
      } else if (item.source === 'Airbus') {
        counts.Airbus++;
      } else if (item.source === 'Boeing') {
        counts.Boeing++;
      } else if (item.source === 'COMAC') {
        counts.COMAC++;
      } else if (item.source === 'Jeppesen') {
        counts.Jeppesen++;
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
    var allData = this._allData || [];
    var activeTab = this.data.activeTab;
    var searchValue = (this.data.searchValue || '').toLowerCase().trim();
    
    var filteredData = allData;
    
    // 分类过滤
    if (activeTab !== 'all') {
      filteredData = filteredData.filter(function(item) {
        return item.source === activeTab;
      });
    }
    
    // 搜索过滤和排序
    if (searchValue) {
      var beforeSearchCount = filteredData.length;
      
      // 分离匹配的数据：优先匹配abbreviation字段的结果
      var abbreviationMatches = []; // abbreviation字段匹配的结果
      var otherMatches = []; // 其他字段匹配的结果
      
      filteredData.forEach(function(item) {
        var abbrev = (item.abbreviation || '').toLowerCase();
        var englishFull = (item.english_full || '').toLowerCase();
        var chineseTranslation = (item.chinese_translation || '').toLowerCase();
        
        var abbreviationMatch = abbrev.indexOf(searchValue) !== -1;
        var englishMatch = englishFull.indexOf(searchValue) !== -1;
        var chineseMatch = chineseTranslation.indexOf(searchValue) !== -1;
        
        if (abbreviationMatch) {
          // abbreviation字段匹配，添加到优先组
          abbreviationMatches.push(item);
        } else if (englishMatch || chineseMatch) {
          // 其他字段匹配，添加到次要组
          otherMatches.push(item);
        }
        
        // 如果搜索tcas，记录匹配详情
        if (searchValue === 'tcas' && (abbreviationMatch || englishMatch || chineseMatch)) {
        }
      });
      
      // 对两组结果分别按字母顺序排序
      abbreviationMatches.sort(function(a, b) {
        var abbrevA = (a.abbreviation || '').toLowerCase();
        var abbrevB = (b.abbreviation || '').toLowerCase();
        return abbrevA.localeCompare(abbrevB);
      });
      
      otherMatches.sort(function(a, b) {
        var abbrevA = (a.abbreviation || '').toLowerCase();
        var abbrevB = (b.abbreviation || '').toLowerCase();
        return abbrevA.localeCompare(abbrevB);
      });
      
      // 合并结果：abbreviation匹配的在前，其他匹配的在后
      filteredData = abbreviationMatches.concat(otherMatches);
      
    } else {
      // 没有搜索词时，按abbreviation字母顺序排序
      filteredData.sort(function(a, b) {
        var abbrevA = (a.abbreviation || '').toLowerCase();
        var abbrevB = (b.abbreviation || '').toLowerCase();
        return abbrevA.localeCompare(abbrevB);
      });
    }
    
    // 更新过滤后的数据并重置分页
    this._filteredAllData = filteredData;
    this.setData({
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



};

Page(BasePage.createPage(pageConfig));