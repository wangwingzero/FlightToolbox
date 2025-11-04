var BasePage = require('../../../utils/base-page.js');
var Hotspot = require('../../utils/hotspot.js');
var Areas = require('../../data/a330/areas.js');
var Components = require('../../data/a330/components.js');
var CheckItems = require('../../data/a330/checkitems.js');
var DataHelpers = require('../../utils/data-helpers.js');
var WalkaroundPreloadGuide = require('../../../utils/walkaround-preload-guide.js');

// 配置常量
var CONFIG = {
  CANVAS_IMAGE_PATH: '/packageWalkaround/images/a330/flow.png',
  CANVAS_IMAGE_RATIO: 1840 / 1380,  // 图片宽高比 = 1.333
  CANVAS_WIDTH_PERCENT: 0.95,        // Canvas宽度占屏幕宽度的95%
  CANVAS_DRAW_DELAY: 100,            // Canvas绘制延迟（ms）
  SEARCH_MAX_RESULTS: 8              // 搜索结果最大数量
};

function markPackageReady() {
  try {
    wx.setStorageSync('walkaroundPackageReady', true);
  } catch (error) {
    console.error('缓存绕机分包状态失败:', error);
  }
}

// 使用公共componentMap，避免重复创建（已在components.js中预建）
var ComponentCache = Components.componentMap;

var pageConfig = {
  data: {
    loading: false,
    modelId: 'a330',
    searchKeyword: '',
    canvasStyleWidth: 0,
    canvasStyleHeight: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    selectedAreaId: null,
    areaList: [],

    // 弹窗相关
    showDetailPopup: false,
    detailArea: null,
    detailCheckItems: [],
    detailComponents: [],
    scrollTop: 0,  // 检查项列表滚动位置（切换区域时重置为0）

    // 广告相关
    isAdFree: false,  // 是否已获得今日无广告（观看激励视频后1小时内隐藏广告）

    // 搜索结果
    searchResults: []
  },

  customOnLoad: function() {
    markPackageReady();
    this.canvasContext = null;  // 缓存Canvas上下文，避免重复创建
    this.buildSearchIndex();     // 建立搜索索引，优化搜索性能
    this.calculateCanvasSize();
    this.loadAreaList();
    this.checkAdFreeStatus();    // 检查无广告状态

    // 初始化预加载引导系统
    this.preloadGuide = new WalkaroundPreloadGuide();

    // 标记区域1-4的图片分包为已预加载（本页面自动预加载）
    this.preloadGuide.markPackagePreloaded('1-4');

    // 所有6个图片分包通过preloadRule预加载：
    // - walkaroundImages1Package: 在本页面预加载（areas 1-4）
    // - walkaroundImages2Package: 在packageO/sunrise-sunset预加载（areas 5-8）
    // - walkaroundImages3Package: 在packageO/personal-checklist预加载（areas 9-12）
    // - walkaroundImages4Package: 在packageO/flight-time-share预加载（areas 13-16）
    // - walkaroundImages5Package: 在packageMedical预加载（areas 17-20）
    // - walkaroundImages6Package: 在pages/communication-rules预加载（areas 21-24）
  },

  customOnShow: function() {
    this.checkAdFreeStatus();    // 每次显示页面时检查无广告状态
  },

  /**
   * 建立组件到区域的索引
   * 时间复杂度：O(n×m) → O(1)查找
   */
  buildSearchIndex: function() {
    var index = {};
    Areas.areas.forEach(function(area) {
      area.components.forEach(function(componentId) {
        if (!index[componentId]) {
          index[componentId] = [];
        }
        index[componentId].push({
          areaId: area.id,
          areaSequence: area.sequence,
          areaNameZh: area.name_zh,
          areaNameEn: area.name_en
        });
      });
    });
    this.componentAreaIndex = index;  // 缓存索引
  },

  calculateCanvasSize: function() {
    var self = this;
    wx.getSystemInfo({
      success: function(res) {
        var screenWidth = res.windowWidth;
        var screenHeight = res.windowHeight;

        // Canvas完整显示图片：宽度占95%，高度按宽高比自动计算
        var canvasWidth = Math.round(screenWidth * CONFIG.CANVAS_WIDTH_PERCENT);
        var canvasHeight = Math.round(canvasWidth * CONFIG.CANVAS_IMAGE_RATIO);

        // Canvas的渲染尺寸和显示尺寸使用相同值（1:1）
        self.setData({
          canvasStyleWidth: canvasWidth,
          canvasStyleHeight: canvasHeight,
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight
        });

        setTimeout(function() {
          self.drawCanvas();
        }, CONFIG.CANVAS_DRAW_DELAY);
      }
    });
  },

  drawCanvas: function() {
    var width = this.data.canvasWidth;
    var height = this.data.canvasHeight;
    if (!width || !height) {
      return;
    }

    // 复用缓存的Canvas上下文，避免重复创建
    if (!this.canvasContext) {
      this.canvasContext = wx.createCanvasContext('walkaround-canvas', this);
    }

    var ctx = this.canvasContext;

    // 清除旧内容（可选，绘制图片会覆盖）
    // ctx.clearRect(0, 0, width, height);

    // 绘制飞机图片，填充整个Canvas
    ctx.drawImage(CONFIG.CANVAS_IMAGE_PATH, 0, 0, width, height);
    ctx.draw();
  },

  loadAreaList: function() {
    try {
      var areas = Areas.areas;
      this.hotspotManager = Hotspot.create(areas);
      var self = this;
      this.setData({ areaList: areas }, function() {
        self.drawCanvas();
      });
    } catch (error) {
      this.handleError(error, '加载区域数据失败');
    }
  },

  handleCanvasTap: function(event) {
    if (!this.hotspotManager) {
      return;
    }

    // 简化事件处理：Canvas的tap事件主要使用event.detail
    var detail = event.detail || (event.touches && event.touches[0]);
    var normalized = Hotspot.normalizePoint(detail, this.data.canvasStyleWidth, this.data.canvasStyleHeight);

    // normalizePoint现在返回null表示无效点击，需要检查
    if (!normalized) {
      return;
    }

    var hit = this.hotspotManager.hitTest(normalized);
    if (hit && hit.areaId) {
      this.selectAreaAndShowPopup(hit.areaId);
    }
  },

  selectAreaAndShowPopup: function(areaId) {
    var self = this;
    var area = this.data.areaList.find(function(item) { return item.id === areaId; });
    if (!area) {
      return;
    }

    // 检查该区域对应的图片分包是否已预加载
    this.preloadGuide.checkPackagePreloaded(areaId).then(function(isPreloaded) {
      if (!isPreloaded) {
        // 未预加载，显示引导对话框
        console.log('🚨 区域 ' + areaId + ' 的图片分包未预加载，显示引导对话框');
        self.preloadGuide.showPreloadGuideDialog(areaId).then(function(navigated) {
          if (!navigated) {
            // 用户选择稍后再说，仍然显示详情（但图片可能加载失败）
            console.log('⚠️ 用户选择稍后再说，仍然显示详情页面');
            self.showAreaDetails(area, areaId);
          }
          // 如果用户选择跳转，无需显示详情
        });
      } else {
        // 已预加载，直接显示详情
        console.log('✅ 区域 ' + areaId + ' 的图片分包已预加载，直接显示详情');
        self.showAreaDetails(area, areaId);
      }
    });
  },

  // 显示区域详情的公共方法
  showAreaDetails: function(area, areaId) {
    var components = this.prepareComponents(area);
    var checkItems = this.prepareCheckItems(areaId);

    // 一次性setData，避免频繁调用
    // 💡 重置scrollTop确保切换区域时从顶部开始显示
    this.setData({
      selectedAreaId: area.id,
      showDetailPopup: true,
      detailArea: area,
      detailCheckItems: checkItems,
      detailComponents: components,
      scrollTop: 0  // 重置滚动位置到顶部
    });
  },

  // 准备部件数据
  prepareComponents: function(area) {
    var components = [];
    if (!area.components || area.components.length === 0) {
      return components;
    }

    var categoryNames = Components.categoryNames;  // 使用统一的分类名称映射
    area.components.forEach(function(componentId) {
      var component = ComponentCache[componentId];
      if (component) {
        components.push({
          id: component.id,
          name_zh: component.name_zh,
          name_en: component.name_en,
          function_zh: component.function_zh,
          function_en: component.function_en,
          category: component.category,
          categoryName: categoryNames[component.category] || component.category
        });
      }
    });

    return components;
  },

  // 准备检查项数据
  prepareCheckItems: function(areaId) {
    var filteredItems = CheckItems.checkItems.filter(function(item) {
      return item.areaId === areaId;
    });
    var result = DataHelpers.mapCheckItemsWithComponents(filteredItems, ComponentCache);

    // 调试：检查第一个检查项的imagePath
    if (result.length > 0) {
      console.log('[绕机检查] Area', areaId, '第一个检查项:', result[0]);
      console.log('[绕机检查] imagePath:', result[0].imagePath);
      console.log('[绕机检查] componentId:', result[0].componentId);
    }

    return result;
  },

  handleClosePopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedAreaId: null
    });
    // 移除不必要的Canvas重绘：Canvas图片不受弹窗影响，无需重绘
  },

  // 图片预览 - 在弹窗内展示大图
  handlePreviewImage: function(event) {
    var src = event.currentTarget.dataset.src;
    if (!src) {
      return;
    }

    // 使用微信原生图片预览API，支持双指缩放、拖动等手势
    // 收集当前区域的所有检查项图片，支持左右滑动切换
    var urls = this.data.detailCheckItems.map(function(item) {
      return item.imagePath + item.componentId + '.png';
    });

    wx.previewImage({
      current: src,  // 当前显示图片的链接
      urls: urls     // 需要预览的图片链接列表
    });
  },

  // 关闭大图预览（保留以兼容旧代码，但实际不再使用）
  handleClosePreview: function() {
    this.setData({
      previewImageSrc: ''
    });
  },

  // 图片加载错误处理
  handleImageError: function(event) {
    console.error('❌ 图片加载失败:', event.detail);
    console.error('图片路径:', event.currentTarget.dataset.src);

    // 检测是否是WebP格式问题
    var src = event.currentTarget.dataset.src || '';
    if (src.endsWith('.webp')) {
      console.error('⚠️ WebP格式图片加载失败！可能原因：');
      console.error('1. 微信基础库版本过低（需要2.9.0+）');
      console.error('2. 安卓系统版本过低');
      console.error('3. WebP文件损坏');

      wx.showToast({
        title: 'WebP图片不支持',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 搜索功能
  handleSearchInput: function(event) {
    var keyword = event.detail.value.trim();
    this.setData({ searchKeyword: keyword });

    if (!keyword) {
      this.setData({ searchResults: [] });
      return;
    }

    this.performSearch(keyword);
  },

  /**
   * 执行搜索（使用预建索引，性能优化）
   * 旧算法：172组件 × 24区域 = 4128次遍历
   * 新算法：172组件 × O(1)查找 = 172次遍历
   */
  performSearch: function(keyword) {
    var lowerKeyword = keyword.toLowerCase();
    var results = [];
    var self = this;

    // 遍历所有组件，使用索引快速查找包含该组件的区域
    Components.components.forEach(function(component) {
      var matchZh = component.name_zh && component.name_zh.indexOf(keyword) !== -1;
      var matchEn = component.name_en && component.name_en.toLowerCase().indexOf(lowerKeyword) !== -1;

      if (matchZh || matchEn) {
        // 使用预建索引，O(1)查找
        var areas = self.componentAreaIndex[component.id] || [];
        areas.forEach(function(area) {
          results.push({
            areaId: area.areaId,
            areaSequence: area.areaSequence,
            areaNameZh: area.areaNameZh,
            areaNameEn: area.areaNameEn,
            componentId: component.id,
            componentNameZh: component.name_zh,
            componentNameEn: component.name_en
          });
        });
      }
    });

    this.setData({ searchResults: results.slice(0, CONFIG.SEARCH_MAX_RESULTS) });
  },

  handleSearchResultTap: function(event) {
    var areaId = Number(event.currentTarget.dataset.areaid);
    var self = this;
    this.setData({
      searchKeyword: '',
      searchResults: []
    });
    // Canvas会因为wx:if切换而重新渲染，需要重新绘制
    setTimeout(function() {
      self.drawCanvas();
    }, 100);
    this.selectAreaAndShowPopup(areaId);
  },

  handleClearSearch: function() {
    var self = this;
    this.setData({
      searchKeyword: '',
      searchResults: []
    });
    // Canvas会因为wx:if切换而重新渲染，需要重新绘制
    setTimeout(function() {
      self.drawCanvas();
    }, 100);
  },

  handleSearchConfirm: function(event) {
    var keyword = event.detail.value.trim();
    if (keyword) {
      this.performSearch(keyword);
    }
  },

  handleAreaCardTap: function(event) {
    var areaId = Number(event.currentTarget.dataset.areaid);
    this.selectAreaAndShowPopup(areaId);
  },

  /**
   * 检查无广告状态（1小时有效期）
   * 用户观看激励视频后，1小时内隐藏所有广告
   */
  checkAdFreeStatus: function() {
    try {
      var adFreeManager = require('../../../utils/ad-free-manager.js');
      var isAdFree = adFreeManager.isAdFreeActive();

      this.setData({
        isAdFree: isAdFree
      });

      console.log('[绕机检查] 无广告状态:', isAdFree ? '有效期内' : '显示广告');
    } catch (error) {
      console.error('[绕机检查] 检查无广告状态失败:', error);
      // 降级处理：显示广告
      this.setData({ isAdFree: false });
    }
  }
};

Page(BasePage.createPage(pageConfig));


