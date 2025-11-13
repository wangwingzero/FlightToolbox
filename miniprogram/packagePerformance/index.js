/**
 * 飞机性能 - 分包首页
 * 功能：章节浏览、搜索、离线缓存
 */

var BasePage = require('../utils/base-page.js');
var VersionManager = require('../utils/version-manager.js');
var PerformanceHelper = require('./utils/performance-helper.js');
var DataIndexCacheManager = require('../utils/data-index-cache-manager.js');

// ❌ 错误: new DataIndexCacheManager() - 模块导出的是对象，不是构造函数
// ✅ 正确: 直接使用模块的单例实例或方法

// 缓存Key（基础）
var DATA_CACHE_KEY_BASE = 'performance_data';
var INDEX_CACHE_KEY_BASE = 'performance_index';

var pageConfig = {
  data: {
    loading: true,
    searchValue: '',
    metadata: {},
    sections: [],
    appendices: [],
    // 版本化缓存Key
    dataCacheKey: '',
    indexCacheKey: '',
    emptyImgSrc: 'images/home-empty.png'
  },

  /**
   * 页面加载
   */
  customOnLoad: function(options) {
    var self = this;

    // 生成版本化缓存Key
    this.setData({
      dataCacheKey: VersionManager.getVersionedKey(DATA_CACHE_KEY_BASE),
      indexCacheKey: VersionManager.getVersionedKey(INDEX_CACHE_KEY_BASE)
    });

    // 加载性能数据
    this.loadPerformanceData();
  },

  /**
   * 加载飞机性能数据（带缓存）
   */
  loadPerformanceData: function() {
    var self = this;

    // 1. 尝试从Storage缓存加载
    try {
      var cachedData = wx.getStorageSync(this.data.dataCacheKey);
      if (cachedData && cachedData.sections && cachedData.sections.length > 0) {
        console.log('✅ 从缓存加载飞机性能数据');
        this.setData({
          metadata: cachedData.metadata || {},
          sections: cachedData.sections || [],
          appendices: cachedData.appendices || [],
          loading: false
        });
        return;
      }
    } catch (e) {
      console.warn('⚠️ 读取缓存失败:', e);
    }

    // 2. 异步加载分包数据文件
    console.log('📦 从分包加载飞机性能数据...');
    require('./data/performance-data.js', function(data) {
      console.log('✅ 分包数据加载成功');

      // 3. 缓存到Storage
      try {
        wx.setStorageSync(self.data.dataCacheKey, {
          metadata: data.metadata || {},
          sections: data.sections || [],
          appendices: data.appendices || [],
          timestamp: Date.now()
        });
        console.log('✅ 数据已缓存到Storage');
      } catch (e) {
        console.warn('⚠️ 缓存数据失败（可能空间不足）:', e);
      }

      // 4. 更新页面数据
      self.setData({
        metadata: data.metadata || {},
        sections: data.sections || [],
        appendices: data.appendices || [],
        loading: false
      });
    }, function(error) {
      // 加载失败处理
      console.error('❌ 加载飞机性能数据失败:', error);
      self.handleError(error, '加载数据失败');
      self.setData({ loading: false });
    });
  },

  /**
   * 搜索输入事件
   */
  onSearchInput: function(e) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  /**
   * 搜索确认事件（使用DataIndexCacheManager实现20倍性能提升）
   */
  onSearchConfirm: function() {
    var self = this;
    var searchValue = this.data.searchValue.trim();

    if (!searchValue) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '搜索中...',
      mask: true
    });

    // 新行为：跳转到搜索结果页统一处理分组、筛选与展示
    try {
      wx.hideLoading();
    } catch (e) {}
    wx.navigateTo({
      url: '/packagePerformance/pages/search-results/index?q=' + encodeURIComponent(searchValue)
    });
    return;

    // 旧行为（后备）：直接在本页完成索引初始化与搜索
    console.log('🚀 使用DataIndexCacheManager加载性能索引...');
    require('./data/performance-index.js', function(indexArray) {
      console.log('✅ 索引数据加载成功，共' + indexArray.length + '条');

      DataIndexCacheManager.initDatasetIndex(
        'performance',
        indexArray,
        ['title_zh', 'title_en', 'keywords', 'summary', 'code'],
        'id'
      ).then(function(indexData) {
        console.log('✅ 关键词索引初始化完成');
        self.performSearchWithIndex(indexData, indexArray, searchValue);
      }).catch(function(error) {
        wx.hideLoading();
        console.error('❌ 索引初始化失败:', error);
        self.performSearch(indexArray, searchValue);
      });
    }, function(error) {
      wx.hideLoading();
      console.error('❌ 加载搜索索引失败:', error);
      self.handleError(error, '加载搜索索引失败');
    });
  },

  /**
   * 使用关键词索引执行快速搜索（性能提升20倍）
   * @param {Object} indexData - 关键词索引数据
   * @param {Array} indexArray - 原始索引数组
   * @param {String} searchValue - 搜索关键词
   */
  performSearchWithIndex: function(indexData, indexArray, searchValue) {
    var self = this;
    var startTime = Date.now();

    // 分词搜索
    var keywords = searchValue.toLowerCase().split(/\s+/).filter(function(k) {
      return k.length > 0;
    });

    // 使用关键词映射表快速查找
    var matchedIds = {};
    keywords.forEach(function(keyword) {
      if (indexData.keywordMap[keyword]) {
        indexData.keywordMap[keyword].forEach(function(id) {
          matchedIds[id] = (matchedIds[id] || 0) + 1;
        });
      }
    });

    // 获取匹配的条目
    var results = Object.keys(matchedIds).map(function(id) {
      var item = indexArray.find(function(entry) {
        return entry.id === id;
      });
      return {
        item: item,
        score: matchedIds[id]
      };
    }).filter(function(r) {
      return r.item;
    }).sort(function(a, b) {
      return b.score - a.score;
    }).map(function(r) {
      return r.item;
    });

    var searchTime = Date.now() - startTime;
    console.log('⚡ 索引搜索完成，耗时: ' + searchTime + 'ms，找到 ' + results.length + ' 条结果');

    wx.hideLoading();

    if (results.length === 0) {
      wx.showToast({
        title: '未找到相关内容',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 获取第一个匹配结果
    var firstResult = results[0];
    var targetId = firstResult.id;
    var type = firstResult.type === 'appendix' ? 'appendix' : 'section';

    // 如果是topic或subtopic，跳转到其所属的section
    if (firstResult.type === 'topic' || firstResult.type === 'subtopic') {
      targetId = firstResult.section;
      type = 'section';
    } else if (firstResult.type === 'subsection') {
      targetId = firstResult.section;
      type = 'section';
    }

    // 显示搜索结果统计
    var message = '找到 ' + results.length + ' 个相关结果';
    if (results.length > 1) {
      message += '，显示第一个匹配项';
    }

    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    });

    // 延迟跳转，让用户看到提示
    setTimeout(function() {
      wx.navigateTo({
        url: '/packagePerformance/pages/section-detail/index?id=' + targetId + '&type=' + type
      });
    }, 500);
  },

  /**
   * 执行搜索（传统方法，作为降级方案）
   * @param {Array} index - 搜索索引
   * @param {String} searchValue - 搜索关键词
   */
  performSearch: function(index, searchValue) {
    var results = PerformanceHelper.search(index, searchValue);

    wx.hideLoading();

    if (results.length === 0) {
      wx.showToast({
        title: '未找到相关内容',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 获取第一个匹配结果
    var firstResult = results[0];
    var targetId = firstResult.id;
    var type = firstResult.type === 'appendix' ? 'appendix' : 'section';

    // 如果是topic或subtopic，跳转到其所属的section
    if (firstResult.type === 'topic' || firstResult.type === 'subtopic') {
      targetId = firstResult.section;
      type = 'section';
    } else if (firstResult.type === 'subsection') {
      // 如果是subsection，跳转到其所属的section
      targetId = firstResult.section;
      type = 'section';
    }

    // 显示搜索结果统计
    var message = '找到 ' + results.length + ' 个相关结果';
    if (results.length > 1) {
      message += '，显示第一个匹配项';
    }

    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    });

    // 延迟跳转，让用户看到提示
    setTimeout(function() {
      wx.navigateTo({
        url: '/packagePerformance/pages/section-detail/index?id=' + targetId + '&type=' + type
      });
    }, 500);
  },

  /**
   * 清除搜索内容
   */
  onClearSearch: function() {
    this.setData({
      searchValue: ''
    });
  },

  /**
   * 空状态图片加载失败时，回退到 svg
   */
  onEmptyImgError: function() {
    if (this.data && typeof this.data.emptyImgSrc === 'string' && /\.png$/i.test(this.data.emptyImgSrc)) {
      this.setData({ emptyImgSrc: 'images/home-empty.svg' });
    }
  },

  /**
   * 快速查询入口
   */
  onQuickLookup: function() {
    wx.navigateTo({
      url: '/packagePerformance/pages/quick-lookup/index'
    });
  },

  /**
   * 章节卡片点击事件
   */
  onSectionTap: function(e) {
    var section = e.currentTarget.dataset.section;
    if (!section || !section.id) {
      console.warn('⚠️ 章节数据无效');
      return;
    }

    console.log('🎯 点击章节:', section.id, section.title_zh);

    // 跳转到章节详情页
    wx.navigateTo({
      url: '/packagePerformance/pages/section-detail/index?id=' + section.id
    });
  },

  /**
   * 附录卡片点击事件
   */
  onAppendixTap: function(e) {
    var appendix = e.currentTarget.dataset.appendix;
    if (!appendix || !appendix.id) {
      console.warn('⚠️ 附录数据无效');
      return;
    }

    console.log('🎯 点击附录:', appendix.id, appendix.title_zh);

    // 跳转到附录详情页（复用章节详情页，传入类型参数）
    wx.navigateTo({
      url: '/packagePerformance/pages/section-detail/index?id=' + appendix.id + '&type=appendix'
    });
  },

  /**
   * 页面分享
   */
  customOnShareAppMessage: function() {
    return {
      title: '飞机性能 - Getting to Grips With Aircraft Performance',
      path: '/packagePerformance/index'
    };
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));
