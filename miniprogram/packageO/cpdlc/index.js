// CPDLC电文查询页面
var BasePage = require('../../utils/base-page.js');
var AdManager = require('../../utils/ad-manager.js');

// 配置常量
var CONFIG = {
  PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_DELAY: 300
};

var pageConfig = {
  data: {
    // 电文数据
    allMessages: [],        // 所有电文数据
    displayedMessages: [],  // 当前显示的电文数据

    // 搜索相关
    searchValue: '',

    // 分类筛选
    activeDirection: 'all', // 'all', 'uplink', 'downlink'
    activeCategory: 'all',  // 二级分类
    directionTabs: [
      { id: 'all', name: '全部', count: 0 },
      { id: 'uplink', name: '上行电文', count: 0 },
      { id: 'downlink', name: '下行电文', count: 0 }
    ],
    categoryList: [],       // 二级分类列表(动态更新)

    // 分页相关
    currentPage: 1,
    pageSize: CONFIG.PAGE_SIZE,
    hasMore: true,

    // 统计信息
    totalCount: 0,
    filteredCount: 0,

    // 浮窗相关
    showModal: false,
    selectedMessage: {},

    // 广告相关
    adClicksRemaining: 100,

    // 空状态类型
    emptyType: 'loading' // 'loading', 'error', 'no_result'
  },

  // 实例属性（不触发渲染）
  searchTimer: null,
  categories: null,

  customOnLoad: function(options) {
    this.loadCPDLCData();
    this.updateAdClicksRemaining();
  },

  customOnShow: function() {
    this.updateAdClicksRemaining();
  },

  // 加载CPDLC电文数据
  loadCPDLCData: function() {
    var self = this;
    try {
      // 异步加载数据文件
      require('./cpdlc-data.js', function(cpdlcData) {
        if (!cpdlcData || !cpdlcData.uplink || !cpdlcData.downlink) {
          throw new Error('CPDLC电文数据格式错误');
        }

        console.log('✅ 成功加载CPDLC数据:',
          '上行' + cpdlcData.uplink.length + '条,',
          '下行' + cpdlcData.downlink.length + '条'
        );

        // 合并上行和下行电文,添加direction字段
        var uplinkMessages = cpdlcData.uplink.map(function(item) {
          return Object.assign({}, item, { direction: 'uplink' });
        });

        var downlinkMessages = cpdlcData.downlink.map(function(item) {
          return Object.assign({}, item, { direction: 'downlink' });
        });

        var allMessages = uplinkMessages.concat(downlinkMessages);

        // 更新方向标签计数
        var directionTabs = self.data.directionTabs;
        directionTabs[0].count = allMessages.length;
        directionTabs[1].count = uplinkMessages.length;
        directionTabs[2].count = downlinkMessages.length;

        // 存储分类数据
        self.categories = cpdlcData.categories;

        self.setData({
          allMessages: allMessages,
          totalCount: allMessages.length,
          filteredCount: allMessages.length,
          directionTabs: directionTabs
        });

        // 初始化分类列表
        self.updateCategoryList();

        // 初始化第一页数据
        self.loadPageData();

      }, function(error) {
        console.error('❌ CPDLC数据加载失败:', error);
        self.handleError(error, 'CPDLC数据加载失败,请重试');
        self.setData({
          allMessages: [],
          totalCount: 0,
          filteredCount: 0,
          displayedMessages: [],
          hasMore: false,
          emptyType: 'error'
        });
      });

    } catch (error) {
      console.error('❌ CPDLC数据加载失败:', error);
      self.handleError(error, 'CPDLC数据加载失败');
      self.setData({
        allMessages: [],
        totalCount: 0,
        filteredCount: 0,
        displayedMessages: [],
        hasMore: false,
        emptyType: 'error'
      });
    }
  },

  // 更新二级分类列表
  updateCategoryList: function() {
    if (!this.categories) {
      this.setData({ categoryList: [] });
      return;
    }

    var activeDirection = this.data.activeDirection;
    var categories = [];

    if (activeDirection === 'all') {
      // 全部: 不显示二级分类
      categories = [];
    } else if (activeDirection === 'uplink') {
      categories = this.categories.uplink || [];
    } else if (activeDirection === 'downlink') {
      categories = this.categories.downlink || [];
    }

    // 统计各分类数量
    var currentData = this.getCurrentDataByDirection();
    var categoryList = [{ name: '全部', count: currentData.length }];

    categories.forEach(function(cat) {
      var count = currentData.filter(function(item) {
        return item.category === cat;
      }).length;

      if (count > 0) {
        categoryList.push({ name: cat, count: count });
      }
    });

    this.setData({ categoryList: categoryList });
  },

  // 根据方向筛选获取数据
  getCurrentDataByDirection: function() {
    var allMessages = this.data.allMessages;
    var activeDirection = this.data.activeDirection;

    if (activeDirection === 'all') {
      return allMessages;
    } else {
      return allMessages.filter(function(item) {
        return item.direction === activeDirection;
      });
    }
  },

  // 获取当前应该显示的数据(考虑搜索和分类筛选)
  getCurrentData: function() {
    var currentData = this.getCurrentDataByDirection();
    var activeCategory = this.data.activeCategory;
    var searchValue = this.data.searchValue.trim();

    // 按二级分类筛选
    if (activeCategory !== 'all') {
      currentData = currentData.filter(function(item) {
        return item.category === activeCategory;
      });
    }

    // 按搜索词过滤
    if (searchValue) {
      var lowerSearchValue = searchValue.toLowerCase();
      currentData = currentData.filter(function(item) {
        // 搜索编号、分类、用途、英文格式、中文格式
        var matchId = (item.id && item.id.toLowerCase().indexOf(lowerSearchValue) !== -1);
        var matchCategory = (item.category && item.category.toLowerCase().indexOf(lowerSearchValue) !== -1);
        var matchPurpose = (item.purpose && item.purpose.toLowerCase().indexOf(lowerSearchValue) !== -1);
        var matchFormatEn = (item.format_en && item.format_en.toLowerCase().indexOf(lowerSearchValue) !== -1);
        var matchFormatZh = (item.format_zh && item.format_zh.toLowerCase().indexOf(lowerSearchValue) !== -1);

        return matchId || matchCategory || matchPurpose || matchFormatEn || matchFormatZh;
      });
    }

    return currentData;
  },

  // 加载分页数据
  loadPageData: function() {
    var currentPage = this.data.currentPage;
    var pageSize = this.data.pageSize;
    var currentData = this.getCurrentData();
    var displayedMessages = this.data.displayedMessages;

    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, currentData.length);

    var newData = currentData.slice(startIndex, endIndex);
    var updatedDisplayed = currentPage === 1 ? newData : displayedMessages.concat(newData);

    var hasMore = endIndex < currentData.length;

    this.setData({
      displayedMessages: updatedDisplayed,
      hasMore: hasMore,
      filteredCount: currentData.length
    });
  },

  // 方向标签点击处理
  onDirectionTabTap: function(e) {
    var direction = e.currentTarget.dataset.id;

    this.setData({
      activeDirection: direction,
      activeCategory: 'all', // 重置二级分类
      currentPage: 1,
      displayedMessages: []
    });

    this.updateCategoryList();
    this.performSearch();
  },

  // 方向切换(上行/下行/全部) - 兼容保留
  onDirectionChange: function(e) {
    var direction = e.detail.name || e.currentTarget.dataset.direction;

    this.setData({
      activeDirection: direction,
      activeCategory: 'all', // 重置二级分类
      currentPage: 1,
      displayedMessages: []
    });

    this.updateCategoryList();
    this.performSearch();
  },

  // 二级分类切换
  onCategoryChange: function(e) {
    var category = e.currentTarget.dataset.category;

    this.setData({
      activeCategory: category,
      currentPage: 1,
      displayedMessages: []
    });

    this.performSearch();
  },

  // 搜索变化处理 - 适配van-search组件
  onSearchChange: function(e) {
    var self = this;
    var searchValue = e.detail;  // van-search的change事件直接返回字符串

    // 清除之前的定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    // 立即更新searchValue以显示输入
    this.setData({
      searchValue: searchValue
    });

    // 设置新的防抖定时器
    this.searchTimer = setTimeout(function() {
      self.setData({
        currentPage: 1,
        displayedMessages: [],
        emptyType: 'loading'
      });
      self.performSearch();
    }, CONFIG.SEARCH_DEBOUNCE_DELAY);
  },

  // 执行搜索
  performSearch: function() {
    var currentData = this.getCurrentData();

    this.setData({
      filteredCount: currentData.length,
      currentPage: 1,
      displayedMessages: [],
      emptyType: currentData.length === 0 ? 'no_result' : 'loading'
    });

    this.loadPageData();
  },

  // 清空搜索
  onSearchClear: function() {
    this.setData({
      searchValue: '',
      currentPage: 1,
      displayedMessages: []
    });

    this.performSearch();
  },

  // 点击电文项 - 显示浮窗
  onMessageTap: function(e) {
    var message = e.currentTarget.dataset.message;
    if (!message) {
      return;
    }

    this.setData({
      showModal: true,
      selectedMessage: message
    });
  },

  // 关闭浮窗
  onModalClose: function() {
    this.setData({
      showModal: false,
      selectedMessage: {}
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

  // 更新广告剩余点击次数
  updateAdClicksRemaining: function() {
    var stats = AdManager.getStatistics();
    this.setData({
      adClicksRemaining: stats.clicksUntilNext
    });
  },

  // 页面卸载时清理资源
  customOnUnload: function() {
    // 清理搜索防抖定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
    // 清理分类数据引用
    this.categories = null;
    console.log('✅ 已清理CPDLC页面资源');
  }
};

Page(BasePage.createPage(pageConfig));
