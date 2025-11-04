var BasePage = require('../../../utils/base-page.js');
var Hotspot = require('../../utils/hotspot.js');
var Areas = require('../../data/a330/areas.js');
var Components = require('../../data/a330/components.js');
var CheckItems = require('../../data/a330/checkitems.js');
var DataHelpers = require('../../utils/data-helpers.js');
var WalkaroundPreloadGuide = require('../../../utils/walkaround-preload-guide.js');
var AppConfig = require('../../../utils/app-config.js');

// 配置常量
var CONFIG = {
  CANVAS_IMAGE_PATH: '/packageWalkaround/images/a330/flow.png',
  CANVAS_IMAGE_RATIO: 1840 / 1380,  // 图片宽高比 = 1.333
  CANVAS_WIDTH_PERCENT: 0.95,        // Canvas宽度占屏幕宽度的95%
  CANVAS_DRAW_DELAY: 100             // Canvas绘制延迟（ms）
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
    canvasStyleWidthRpx: 0,  // rpx单位，用于Canvas的style
    canvasStyleHeightRpx: 0,  // rpx单位，用于Canvas的style
    canvasWidth: 0,  // px单位，用于Canvas渲染
    canvasHeight: 0,  // px单位，用于Canvas渲染
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
    bannerAdUnitId: AppConfig.ad.bannerAdUnitIds.bannerCard2  // 使用授权的横幅卡片2广告位
  },

  customOnLoad: function() {
    markPackageReady();
    this.canvasContext = null;  // 缓存Canvas上下文，避免重复创建
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

  calculateCanvasSize: function() {
    var self = this;
    wx.getSystemInfo({
      success: function(res) {
        var screenWidth = res.windowWidth;
        var screenHeight = res.windowHeight;

        // rpx单位换算：750rpx = 屏幕宽度px
        var rpxRatio = 750 / screenWidth;

        // Canvas完整显示图片：宽度占95%
        // 使用rpx单位计算（符合项目规范）
        var canvasWidthRpx = Math.round(750 * CONFIG.CANVAS_WIDTH_PERCENT);  // 约712rpx
        var canvasHeightRpx = Math.round(canvasWidthRpx * CONFIG.CANVAS_IMAGE_RATIO);  // 约949rpx

        // 转换为px用于Canvas渲染（确保清晰度）
        var canvasWidth = Math.round(canvasWidthRpx / rpxRatio);
        var canvasHeight = Math.round(canvasHeightRpx / rpxRatio);

        // Canvas的渲染尺寸（width/height属性）使用px确保清晰度
        // Canvas的显示尺寸（style）使用rpx实现响应式布局
        self.setData({
          canvasStyleWidthRpx: canvasWidthRpx,  // rpx单位，用于style
          canvasStyleHeightRpx: canvasHeightRpx,  // rpx单位，用于style
          canvasWidth: canvasWidth,  // px单位，用于Canvas渲染
          canvasHeight: canvasHeight  // px单位，用于Canvas渲染
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

    // 绘制飞机图片，填充整个Canvas
    ctx.drawImage(CONFIG.CANVAS_IMAGE_PATH, 0, 0, width, height);
    ctx.draw();
  },

  loadAreaList: function() {
    try {
      var areas = Areas.areas;
      var categoryNames = Areas.AREA_CATEGORY_NAMES;

      // 预处理areas数据，添加categoryName字段
      var processedAreas = areas.map(function(area) {
        return Object.assign({}, area, {
          categoryName: categoryNames[area.category] || area.category
        });
      });

      this.hotspotManager = Hotspot.create(processedAreas);
      var self = this;
      this.setData({ areaList: processedAreas }, function() {
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
    // 使用px单位的Canvas尺寸进行坐标归一化
    var normalized = Hotspot.normalizePoint(detail, this.data.canvasWidth, this.data.canvasHeight);

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
      console.error('[绕机检查] 区域ID不存在:', areaId);
      wx.showToast({
        title: '区域数据未找到',
        icon: 'none',
        duration: 1500
      });
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

  // 图片加载错误处理
  handleImageError: function(event) {
    console.error('❌ 图片加载失败:', event.detail);
    var src = event.currentTarget.dataset.src || '';
    console.error('图片路径:', src);

    // 检测是否是WebP格式问题
    if (src.endsWith('.webp')) {
      console.error('⚠️ WebP格式图片加载失败！可能原因：');
      console.error('1. 微信基础库版本过低（需要2.9.0+）');
      console.error('2. 安卓系统版本过低');
      console.error('3. WebP文件损坏');

      wx.showToast({
        title: 'WebP图片格式不支持',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 普通图片加载失败提示
    // 可能是分包未预加载或网络问题
    console.warn('💡 图片加载失败提示：');
    console.warn('1. 检查图片分包是否已预加载');
    console.warn('2. 检查网络连接');
    console.warn('3. 尝试访问预加载引导页面');

    wx.showToast({
      title: '图片暂时无法显示',
      icon: 'none',
      duration: 1500
    });
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


