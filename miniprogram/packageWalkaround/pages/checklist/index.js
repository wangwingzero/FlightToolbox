var BasePage = require('../../../utils/base-page.js');
var Hotspot = require('../../utils/hotspot.js');
var AreasData = require('../../data/a330/areas.js');
var Components = require('../../data/a330/components.js');
var CheckItems = require('../../data/a330/checkitems.js');
var DataHelpers = require('../../utils/data-helpers.js');
var systemInfoHelper = require('../../../utils/system-info-helper.js');
var R2Config = require('../../../utils/r2-config.js');

// 配置常量
var CONFIG = {
  CANVAS_IMAGE_PATH: '/packageWalkaround/images/a330/flow.png',
  CANVAS_PADDING: 48,              // 左右padding（24rpx * 2）
  CANVAS_ASPECT_RATIO: 1.33,       // flow.png的宽高比
  CANVAS_DEVICE_PIXEL_RATIO: 2,    // 设备像素比
  CANVAS_DRAW_DELAY: 100,          // Canvas绘制延迟（ms）
  HOTSPOT_MIN_RADIUS: 24,          // 热点最小半径（px）
  HOTSPOT_DEFAULT_RADIUS: 0.04,    // 热点默认半径（归一化）
  HOTSPOT_INNER_RADIUS_RATIO: 0.55 // 内圈半径比例
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
    canvasStyleWidth: 0,
    canvasStyleHeight: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    selectedAreaId: null,
    currentArea: null,
    areaList: [],
    scrollTargetId: '',

    // 弹窗相关
    showDetailPopup: false,
    detailArea: null,
    detailCheckItems: []
  },

  customOnLoad: function(options) {
    if (options && options.modelId) {
      this.setData({ modelId: options.modelId });
    }

    markPackageReady();
    this.canvasContext = null;  // 缓存Canvas上下文，避免重复创建
    this._flowImagePath = CONFIG.CANVAS_IMAGE_PATH;  // 默认使用本地图片
    this.preloadFlowImage();  // R2 模式：异步预加载主图
    this.calculateCanvasSize();
    this.loadAreaList();
  },

  calculateCanvasSize: function() {
    var self = this;
    var __wi = systemInfoHelper.getWindowInfo() || {};
    var screenWidth = __wi.windowWidth;
    var canvasWidth = screenWidth - CONFIG.CANVAS_PADDING;
    var canvasHeight = canvasWidth * CONFIG.CANVAS_ASPECT_RATIO;

    self.setData({
      canvasStyleWidth: canvasWidth,
      canvasStyleHeight: canvasHeight,
      canvasWidth: canvasWidth * CONFIG.CANVAS_DEVICE_PIXEL_RATIO,
      canvasHeight: canvasHeight * CONFIG.CANVAS_DEVICE_PIXEL_RATIO
    });

    setTimeout(function() {
      self.drawCanvas(self.data.selectedAreaId);
    }, CONFIG.CANVAS_DRAW_DELAY);
  },

  /**
   * 预加载主图（R2 模式）
   * 与 drawCanvas 分离，避免多次调用 drawCanvas 时产生竞争条件
   */
  preloadFlowImage: function() {
    var self = this;
    if (!R2Config.useR2ForImages) {
      return;
    }

    var flowCachePath = wx.env.USER_DATA_PATH + '/walkaround-images/flow_a330.png';
    var fs = wx.getFileSystemManager();

    // 1. 同步检查持久化缓存
    try {
      fs.accessSync(flowCachePath);
      self._flowImagePath = flowCachePath;
      console.log('📦 主图从持久化缓存加载');
      return;
    } catch (e) {
      // 文件不存在，继续下载
    }

    // 2. 异步下载，完成后更新路径并重绘
    var r2Url = R2Config.getImageUrl('a330/flow.png');
    console.log('🔄 从R2下载主图:', r2Url);
    wx.downloadFile({
      url: r2Url,
      success: function(res) {
        if (res.statusCode === 200 && res.tempFilePath) {
          console.log('✅ R2主图下载成功');
          self._flowImagePath = res.tempFilePath;
          // 下载完成后重绘
          self.drawCanvas(self.data.selectedAreaId);
          // 异步持久化（确保目录存在）
          fs.mkdir({
            dirPath: wx.env.USER_DATA_PATH + '/walkaround-images',
            recursive: true,
            complete: function() {
              fs.copyFile({
                srcPath: res.tempFilePath,
                destPath: flowCachePath,
                success: function() {
                  console.log('✅ 主图已持久化缓存:', flowCachePath);
                  self._flowImagePath = flowCachePath;
                },
                fail: function(err) { console.warn('⚠️ 主图持久化失败:', err); }
              });
            }
          });
        }
      },
      fail: function(err) {
        console.warn('R2主图下载失败，使用本地:', err);
      }
    });
  },

  drawCanvas: function(highlightAreaId) {
    var self = this;
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

    // 纯同步绘制：使用当前可用的图片路径
    var imagePath = self._flowImagePath || CONFIG.CANVAS_IMAGE_PATH;
    ctx.drawImage(imagePath, 0, 0, width, height);

    // 高亮选中的区域
    if (highlightAreaId) {
      var area = self.data.areaList.find(function(item) { return item.id === highlightAreaId; });
      if (area && area.hotspot) {
        var hotspot = area.hotspot;
        var radiusBase = hotspot.r || CONFIG.HOTSPOT_DEFAULT_RADIUS;
        var radius = Math.max(CONFIG.HOTSPOT_MIN_RADIUS, radiusBase * width);
        var x = hotspot.cx * width;
        var y = hotspot.cy * height;

        ctx.setFillStyle('rgba(33, 150, 243, 0.22)');
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.setLineWidth(3);
        ctx.setStrokeStyle('rgba(102, 187, 255, 0.95)');
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setFillStyle('#1f62a0');
        ctx.beginPath();
        ctx.arc(x, y, Math.max(18, radius * CONFIG.HOTSPOT_INNER_RADIUS_RATIO), 0, Math.PI * 2);
        ctx.fill();

        ctx.setFillStyle('#ffffff');
        ctx.setFontSize(16);
        ctx.setTextAlign('center');
        ctx.setTextBaseline('middle');
        ctx.fillText(String(area.sequence), x, y);
      }
    }

    ctx.draw();
  },

  loadAreaList: function() {
    try {
      var areas = AreasData.areas;
      this.hotspotManager = Hotspot.create(areas);
      var self = this;
      this.setData({ areaList: areas }, function() {
        if (!self.data.selectedAreaId && areas.length) {
          self.selectArea(areas[0].id, { silent: true });
        } else {
          self.drawCanvas(self.data.selectedAreaId);
        }
      });
    } catch (error) {
      this.handleError(error, '加载区域数据失败');
    }
  },

  handleCanvasTap: function(event) {
    if (!this.hotspotManager) {
      return;
    }

    var detail = (event && event.detail) || (event && event.touches && event.touches[0]) || (event && event.changedTouches && event.changedTouches[0]);
    var normalized = Hotspot.normalizePoint(detail, this.data.canvasStyleWidth, this.data.canvasStyleHeight);
    var hit = this.hotspotManager.hitTest(normalized);
    if (hit && hit.areaId) {
      this.selectArea(hit.areaId, { fromCanvas: true, showPopup: true });
    }
  },

  handleAreaTap: function(event) {
    var areaId = Number(event.currentTarget.dataset.id);
    this.selectArea(areaId, { showPopup: true });
  },

  selectArea: function(areaId, options) {
    options = options || {};
    var numericId = Number(areaId);
    var area = this.data.areaList.find(function(item) { return item.id === numericId; });
    if (!area) {
      return;
    }

    var self = this;
    var scrollTargetId = 'area-' + area.id;
    if (options.silent === true) {
      scrollTargetId = this.data.scrollTargetId;
    }

    this.setData({
      selectedAreaId: area.id,
      currentArea: area,
      scrollTargetId: scrollTargetId
    }, function() {
      self.drawCanvas(area.id);
    });

    // 如果需要显示弹窗，加载检查项并显示
    if (options.showPopup === true) {
      this.loadCheckItemsAndShowPopup(area.id);
    }
  },

  loadCheckItemsAndShowPopup: function(areaId) {
    var area = this.data.areaList.find(function(item) { return item.id === areaId; });
    if (!area) {
      return;
    }

    var filteredItems = CheckItems.checkItems.filter(function(item) {
      return item.areaId === areaId;
    });
    var checkItems = DataHelpers.mapCheckItemsWithComponents(filteredItems, ComponentCache);

    this.setData({
      showDetailPopup: true,
      detailArea: area,
      detailCheckItems: checkItems
    });
  },

  handleClosePopup: function() {
    this.setData({
      showDetailPopup: false
    });
  },

  handleOpenDetail: function() {
    // 已选中区域时，显示弹窗
    if (this.data.selectedAreaId) {
      this.loadCheckItemsAndShowPopup(this.data.selectedAreaId);
    }
  }
};

Page(BasePage.createPage(pageConfig));

