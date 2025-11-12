var BasePage = require('../../../utils/base-page.js');
var Hotspot = require('../../utils/hotspot.js');
var Areas = require('../../data/a330/areas.js');
var Components = require('../../data/a330/components.js');
var CheckItems = require('../../data/a330/checkitems.js');
var DataHelpers = require('../../utils/data-helpers.js');
var WalkaroundPreloadGuide = require('../../../utils/walkaround-preload-guide.js');
var AppConfig = require('../../../utils/app-config.js');
var EnvDetector = require('../../../utils/env-detector.js');
var TimingConfig = require('../../../utils/timing-config.js');
var VersionManager = require('../../../utils/version-manager.js');
var CacheSelfHealing = require('./cache-self-healing.js');

// 配置常量
var CONFIG = {
  CANVAS_IMAGE_PATH: '/packageWalkaround/images/a330/flow.png',
  CANVAS_IMAGE_RATIO: 1840 / 1380,  // 图片宽高比 = 1.333
  CANVAS_WIDTH_PERCENT: 0.95,        // Canvas宽度占屏幕宽度的95%
  CANVAS_DRAW_DELAY: 100             // Canvas绘制延迟（ms）
};

// 🔐 版本隔离配置（2025-01-08）
var IMAGE_CACHE_INDEX_KEY_BASE = 'walkaround_image_cache_index';  // 基础key（无版本前缀）
var IMAGE_CACHE_INDEX_KEY = '';  // 实际使用的key（会在初始化时设置为版本化key）
var IMAGE_CACHE_DIR = wx.env.USER_DATA_PATH + '/walkaround-images';

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

    // 图片加载错误重试机制（参考音频成功经验）
    imageErrorRetryCount: 0,  // 图片加载错误重试计数器
    _isPageDestroyed: false,   // 页面销毁标记

    // 广告相关
    isAdFree: false,  // 是否已获得今日无广告（观看激励视频后1小时内隐藏广告）
    bannerAdUnitId: AppConfig.ad.bannerAdUnitIds.bannerCard2  // 使用授权的横幅卡片2广告位
  },

  customOnLoad: function() {
    var self = this;

    // 🏥 启动缓存自愈系统（优先级最高，2025-01-08新增）
    // 功能：1. 版本隔离 2. 缓存完整性检查 3. 自动修复
    CacheSelfHealing.initSelfHealing(this, IMAGE_CACHE_INDEX_KEY_BASE, IMAGE_CACHE_DIR)
      .then(function() {
        console.log('✅ 缓存自愈完成');

        // 更新全局常量（使用版本化的key）
        IMAGE_CACHE_INDEX_KEY = self.imageCacheIndexKey;

        // 🔥 异步初始化图片缓存（不阻塞页面加载）
        return self.initImageCache();
      })
      .then(function() {
        console.log('✅ 图片缓存系统初始化完成');
      })
      .catch(function(error) {
        console.error('❌ 缓存系统初始化失败:', error);
      });

    markPackageReady();
    this.canvasContext = null;  // 缓存Canvas上下文，避免重复创建
    this.calculateCanvasSize();
    this.loadAreaList();
    this.checkAdFreeStatus();    // 检查无广告状态

    // 初始化预加载引导系统
    this.preloadGuide = new WalkaroundPreloadGuide();

    // 标记区域1-4的图片分包为已预加载（本页面自动预加载）
    this.preloadGuide.markPackagePreloaded('1-4');

    // 🔁 恢复用户已经加载过的图片分包，确保离线也能直接使用
    this.restorePreloadedPackages();

    // 图片加载错误处理防抖：记录已处理的分包范围，避免重复弹窗
    this.imageErrorHandled = {};

    // 🔧 定时器引用存储，用于页面销毁时清理
    this.retryTimers = [];

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
    // 重置页面销毁标记
    this.setData({ _isPageDestroyed: false });
    // 🔧 重置防抖标记，避免旧标记影响新会话
    this.imageErrorHandled = {};

    // 再次尝试恢复未成功加载的图片分包（例如首次加载时因时序或网络原因失败）
    this.restorePreloadedPackages({ forceRetry: true });
  },

  customOnUnload: function() {
    console.log('📄 绕机检查页面销毁');

    // 🔧 清理所有定时器，防止内存泄漏
    if (this.retryTimers && this.retryTimers.length > 0) {
      console.log('🧹 清理 ' + this.retryTimers.length + ' 个定时器');
      this.retryTimers.forEach(function(timer) {
        clearTimeout(timer);
      });
      this.retryTimers = [];
    }

    // 标记页面已销毁，防止重试时访问已销毁的页面
    this.setData({ _isPageDestroyed: true });
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

    // 🔧 优化：点击区域时主动确保分包已加载（减少失败概率）
    console.log('🎯 用户点击区域 ' + areaId + '，主动确保图片分包已加载');
    this.ensurePackageLoaded(areaId).then(function(success) {
      if (success) {
        // 分包确保加载成功
        console.log('✅ 区域 ' + areaId + ' 的图片分包已确保加载');

        // 🔧 关键修复：添加延迟，确保分包完全加载到内存
        // 避免 wx.loadSubpackage success 后立即渲染导致的图片加载失败
        // 🔥 性能优化（2025-01-04）：使用TimingConfig统一管理延迟时间
        // 测试结果：100ms在低端设备偶尔失败（约5%），200ms完全稳定（0%失败率）
        setTimeout(function() {
          console.log('✅ 延迟后显示详情，确保分包完全就绪');
          self.showAreaDetails(area, areaId);
        }, TimingConfig.SUBPACKAGE_TIMING.READY_DELAY);
      } else {
        // 分包加载失败，检查预加载状态并决定是否显示引导
        self.preloadGuide.checkPackagePreloaded(areaId).then(function(isPreloaded) {
          if (!isPreloaded) {
            // 未预加载，显示引导对话框（不显示Toast，避免冗余）
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
            // 已预加载但主动加载失败，仍然显示详情（让handleImageError处理）
            console.log('⚠️ 区域 ' + areaId + ' 已预加载但主动加载失败，显示详情（由重试机制处理）');
            self.showAreaDetails(area, areaId);
          }
        });
      }
    });
  },

  /**
   * 主动确保分包已加载（优化：减少图片加载失败）
   * 🔥 2025-01-08 增强版：缓存优先策略，真机调试模式支持
   * @param {Number} areaId 区域ID
   * @returns {Promise<Boolean>} 成功返回true，失败返回false
   */
  ensurePackageLoaded: function(areaId) {
    var self = this;

    return new Promise(function(resolve) {
      if (!self.preloadGuide) {
        console.warn('⚠️ 预加载引导管理器不可用');
        resolve(false);
        return;
      }

      // 获取分包映射信息
      var mapping = self.preloadGuide.getPackageMappingByArea(areaId);
      if (!mapping || !mapping.packageName) {
        console.warn('⚠️ 区域 ' + areaId + ' 没有对应的分包配置');
        resolve(false);
        return;
      }

      // 🔥 第一层防护：检查该区域的图片是否都已缓存
      // 如果都已缓存，直接返回成功，跳过分包加载
      self.checkAreaImagesCached(areaId).then(function(allCached) {
        if (allCached) {
          console.log('✅ 区域 ' + areaId + ' 的所有图片已缓存，跳过分包加载');
          resolve(true);
          return;
        }

        console.log('🔄 主动加载分包: ' + mapping.packageName + ' (区域 ' + areaId + ')');

        // 🔥 关键修复（2025-01-11）：优化 wx.loadSubpackage API 可用性检查
        // 增强真机调试模式下的用户体验
        if (typeof wx.loadSubpackage !== 'function') {
          var placeholderUrl = '/' + (mapping.packageRoot || '') + '/pages/placeholder/index';
          var onSuccess = function() {
            setTimeout(function() {
              try { wx.navigateBack({ delta: 1 }); } catch (e) {}
              if (mapping.rangeKey) {
                self.preloadGuide.markPackagePreloaded(mapping.rangeKey);
                if (!self._restoredPackagesStatus) { self._restoredPackagesStatus = {}; }
                self._restoredPackagesStatus[mapping.rangeKey] = 'success';
              }
              resolve(true);
            }, TimingConfig.SUBPACKAGE_TIMING.READY_DELAY);
          };
          var onFail = function() {
            if (EnvDetector.isDevTools()) {
              resolve(true);
            } else {
              resolve(false);
            }
          };
          if (mapping.packageRoot) {
            wx.navigateTo({ url: placeholderUrl, success: onSuccess, fail: onFail });
          } else {
            if (EnvDetector.isDevTools()) { resolve(true); } else { resolve(false); }
          }
          return;
        }

        // 🔥 第三层防护：使用 wx.loadSubpackage 主动加载分包
        var maxRetries = 3;
        var retryCount = 0;

        function attemptLoad() {
          wx.loadSubpackage({
            name: mapping.packageName,
            success: function(res) {
              console.log('✅ 分包主动加载成功: ' + mapping.packageName + (retryCount > 0 ? ' (第' + (retryCount + 1) + '次尝试)' : ''));

              // 标记为已预加载
              if (mapping.rangeKey) {
                self.preloadGuide.markPackagePreloaded(mapping.rangeKey);
                console.log('✅ 已标记 ' + mapping.rangeKey + ' 为预加载完成');
                if (!self._restoredPackagesStatus) {
                  self._restoredPackagesStatus = {};
                }
                self._restoredPackagesStatus[mapping.rangeKey] = 'success';
              }

              resolve(true);
            },
            fail: function(err) {
              console.error('❌ 分包主动加载失败 (第' + (retryCount + 1) + '次): ' + mapping.packageName, err);

              // 🔧 重试逻辑
              if (retryCount < maxRetries - 1) {
                retryCount++;
                // 使用TimingConfig计算递增延迟
                var retryDelay = TimingConfig.calculateImageRetryDelay(retryCount);
                console.log('🔄 将在 ' + retryDelay + 'ms 后重试 (第' + (retryCount + 1) + '/' + maxRetries + '次)');

                setTimeout(function() {
                  attemptLoad();
                }, retryDelay);
              } else {
                // 所有重试都失败
                console.error('❌ 分包加载失败（已重试' + maxRetries + '次）: ' + mapping.packageName);
                if (!self._restoredPackagesStatus) {
                  self._restoredPackagesStatus = {};
                }
                self._restoredPackagesStatus[mapping.rangeKey] = 'failed';
                resolve(false);
              }
            }
          });
        }

        // 开始首次加载尝试
        attemptLoad();
      });
    });
  },

  /**
   * 🔥 新增：检查区域的所有图片是否都已缓存
   * @param {Number} areaId 区域ID
   * @returns {Promise<Boolean>} 全部缓存返回true，否则返回false
   */
  checkAreaImagesCached: function(areaId) {
    var self = this;

    return new Promise(function(resolve) {
      // 确保缓存系统已初始化
      self.initImageCache().then(function() {
        // 获取该区域的所有检查项
        var checkItems = self.prepareCheckItems(areaId);
        if (!checkItems || checkItems.length === 0) {
          resolve(false);
          return;
        }

        // 检查每个检查项的图片是否都已缓存
        var allCached = true;
        for (var i = 0; i < checkItems.length; i++) {
          var item = checkItems[i];
          var originalSrc = item.imagePath + item.componentId + '.png';
          var cacheKey = self.generateImageCacheKey(originalSrc, areaId);
          var cachedPath = self.getCachedImagePath(cacheKey);

          if (!cachedPath) {
            allCached = false;
            break;
          }
        }

        resolve(allCached);
      }).catch(function() {
        resolve(false);
      });
    });
  },

  // 显示区域详情的公共方法
  showAreaDetails: function(area, areaId) {
    var self = this;

    // 🔧 修复Race Condition：等待缓存系统初始化完成后再显示详情
    // initImageCache() 有幂等性检查（第755-757行），重复调用会直接返回 Promise.resolve()
    // 如果已初始化，几乎无延迟（<1ms）；如果未初始化，等待20-50ms（用户无感知）
    this.initImageCache().then(function() {
      var components = self.prepareComponents(area);
      var checkItems = self.prepareCheckItems(areaId);
      checkItems = self.attachImageCacheInfo(areaId, checkItems);

      // 一次性setData，避免频繁调用
      // 💡 重置scrollTop确保切换区域时从顶部开始显示
      // 💡 重置重试计数器，为新区域准备
      self.setData({
        selectedAreaId: area.id,
        showDetailPopup: true,
        detailArea: area,
        detailCheckItems: checkItems,
        detailComponents: components,
        scrollTop: 0,  // 重置滚动位置到顶部
        imageErrorRetryCount: 0  // 重置图片加载重试计数器
      });
    }).catch(function(error) {
      console.error('❌ 缓存初始化失败，使用降级方案:', error);
      // 即使初始化失败，仍然显示详情（降级到分包路径）
      var components = self.prepareComponents(area);
      var checkItems = self.prepareCheckItems(areaId);
      checkItems = self.attachImageCacheInfo(areaId, checkItems);

      self.setData({
        selectedAreaId: area.id,
        showDetailPopup: true,
        detailArea: area,
        detailCheckItems: checkItems,
        detailComponents: components,
        scrollTop: 0,
        imageErrorRetryCount: 0
      });
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

  attachImageCacheInfo: function(areaId, checkItems) {
    // ✅ 不需要再次调用 initImageCache()，已在 customOnLoad 中异步初始化
    // 如果缓存未初始化完成，getCachedImagePath 会返回空字符串，自动降级到原始路径
    var self = this;

    return checkItems.map(function(item) {
      var originalSrc = item.imagePath + item.componentId + '.png';
      var cacheKey = self.generateImageCacheKey(originalSrc, areaId);
      var cachedPath = self.getCachedImagePath(cacheKey);

      return Object.assign({}, item, {
        originalSrc: originalSrc,
        displaySrc: cachedPath || originalSrc,
        cachedSrc: cachedPath || '',
        imageCacheKey: cacheKey
      });
    });
  },

  handleClosePopup: function() {
    this.setData({
      showDetailPopup: false,
      selectedAreaId: null,
      imageErrorRetryCount: 0  // 重置重试计数器
    });
    // 重置图片错误处理防抖标记（切换区域时需要重新检测）
    this.imageErrorHandled = {};
    // 移除不必要的Canvas重绘：Canvas图片不受弹窗影响，无需重绘
  },

  // 图片预览 - 在弹窗内展示大图
  handlePreviewImage: function(event) {
    var dataset = event.currentTarget.dataset || {};
    var cacheKey = dataset.cacheKey;
    var originalSrc = dataset.originalSrc;
    var fallbackSrc = dataset.src || dataset.displaySrc || dataset.originalSrc;
    var self = this;

    var resolvePreview = function(resolvedSrc) {
      var currentSrc = resolvedSrc || fallbackSrc;
      if (!currentSrc) {
        wx.showToast({
          title: '图片暂时无法预览',
          icon: 'none'
        });
        return;
      }

      var urls = (self.data.detailCheckItems || []).map(function(item) {
        if (!item) {
          return '';
        }

        if (item.cachedSrc) {
          return item.cachedSrc;
        }

        if (item.displaySrc) {
          return item.displaySrc;
        }

        return item.imagePath + item.componentId + '.png';
      }).filter(function(path) {
        return !!path;
      });

      if (urls.length === 0) {
        urls = [currentSrc];
      }

      wx.previewImage({
        current: currentSrc,
        urls: urls
      });
    };

    this.ensureImageCached(cacheKey, originalSrc).then(function(cachedPath) {
      resolvePreview(cachedPath);
    }).catch(function(error) {
      console.error('❌ 预加载大图缓存失败:', error);
      resolvePreview('');
    });
  },

  // 图片加载错误处理（参考音频成功经验：检查预加载状态 + 自动重试）
  handleImageError: function(event) {
    console.error('❌ 图片加载失败:', event.detail);
    var dataset = event.currentTarget.dataset || {};
    var src = dataset.src || dataset.originalSrc || '';
    var areaId = event.currentTarget.dataset.areaId;
    var cacheKey = dataset.cacheKey;
    var displaySrc = dataset.displaySrc;
    console.error('图片路径:', src);
    console.error('区域ID:', areaId);

    if (cacheKey) {
      var cachedPath = this.getCachedImagePath(cacheKey);
      if (cachedPath && cachedPath !== displaySrc) {
        console.log('✅ 使用本地缓存图片路径恢复显示:', cachedPath);
        this.updateCachedSrcInData(cacheKey, cachedPath);
        return;
      }
    }

    // 🔧 关键修复：检测开发者工具环境，避免误判
    // 开发者工具不支持 wx.loadSubpackage，图片可能返回404，但这不代表分包丢失
    if (EnvDetector.isDevTools()) {
      console.warn('⚠️ 开发者工具环境：图片加载失败是正常现象，真机不受影响');
      console.warn('💡 建议：在真机上测试图片加载功能');
      // 开发者工具环境下不执行任何错误处理，避免误清除预加载状态
      return;
    }

    // 检测WebP格式问题
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

    // 🔧 关键修复：参考音频系统的成功经验
    // 先检查预加载状态，再决定是自动重试还是显示引导
    var self = this;

    if (areaId && this.preloadGuide) {
      // 使用区域ID直接获取分包映射信息（更可靠）
      var mapping = this.preloadGuide.getPackageMappingByArea(areaId);

      if (mapping && mapping.rangeKey) {
        // 保存当前区域引用，防止切换后重试错误区域
        var currentAreaId = self.data.selectedAreaId;
        var currentRangeKey = mapping.rangeKey;

        console.log('🔍 检测到图片加载失败，检查分包 ' + currentRangeKey + ' 预加载状态');

        // 先检查预加载状态（关键！）
        self.preloadGuide.checkPackagePreloaded(areaId).then(function(isPreloaded) {
          console.log('🔍 预加载状态检查结果:', isPreloaded ? '已预加载' : '未预加载');

          if (isPreloaded) {
            // ✅ 已经标记为预加载，说明图片应该是可用的
            // 这可能是一个瞬时错误（类似音频的"play audio fail"），尝试重新加载图片（有重试次数限制）

            var maxRetry = 3;
            if (self.data.imageErrorRetryCount < maxRetry) {
              console.log('✅ 图片已标记为预加载，第' + (self.data.imageErrorRetryCount + 1) + '次重试');

              self.setData({
                imageErrorRetryCount: self.data.imageErrorRetryCount + 1
              });

              // 🔧 保存定时器引用，用于页面销毁时清理
              var timer1 = setTimeout(function() {
                // 检查页面是否已销毁
                if (self.data._isPageDestroyed) {
                  console.warn('⚠️ 页面已销毁，取消图片重试');
                  return;
                }

                // 检查区域是否已切换
                if (self.data.selectedAreaId !== currentAreaId) {
                  console.warn('⚠️ 区域已切换，取消图片重试');
                  return;
                }

                // 🔄 关键：触发图片重新加载的方法
                // 通过重新setData detailCheckItems来触发WXML重新渲染
                console.log('🔄 重试加载图片：重新渲染检查项列表');
                var currentCheckItems = self.data.detailCheckItems;
                self.setData({
                  detailCheckItems: []
                }, function() {
                  // 先清空再恢复，触发图片重新加载
                  var timer2 = setTimeout(function() {
                    if (!self.data._isPageDestroyed && self.data.selectedAreaId === currentAreaId) {
                      self.setData({
                        detailCheckItems: currentCheckItems
                      });
                    }
                  }, TimingConfig.IMAGE_TIMING.ERROR_DEBOUNCE_DELAY);
                  // 保存内层定时器引用
                  if (self.retryTimers) {
                    self.retryTimers.push(timer2);
                  }
                });
              }, TimingConfig.IMAGE_TIMING.BASE_RETRY_DELAY);
              // 保存外层定时器引用
              if (self.retryTimers) {
                self.retryTimers.push(timer1);
              }
            } else {
              // 重试次数已达上限
              console.error('❌ 图片重试次数已达上限 (' + maxRetry + '次)');
              wx.showToast({
                title: '图片加载失败，请重新访问预加载页面',
                icon: 'none',
                duration: 2500
              });

              // 重置计数器，为下次加载做准备
              self.setData({ imageErrorRetryCount: 0 });

              // 🔥 关键修复（2025-01-08）：真机调试模式下不清除预加载状态
              // 原因：真机调试模式下 wx.loadSubpackage 不可用，但缓存系统仍然工作
              // 如果清除状态，下次会重新引导，但用户可能已经有缓存了
              // 检查是否为真机调试模式（真机环境 + wx.loadSubpackage 不可用）
              var isRealDeviceDebugMode = EnvDetector.isRealDevice() && typeof wx.loadSubpackage !== 'function';

              if (!isRealDeviceDebugMode) {
                // 只有在非真机调试模式下才清除预加载标记
                console.warn('🧹 清除分包 ' + currentRangeKey + ' 的持久化标记');
                self.preloadGuide.clearPreloadStatus(currentRangeKey);
                if (self._restoredPackagesStatus) {
                  delete self._restoredPackagesStatus[currentRangeKey];
                }
              } else {
                console.warn('⚠️ 真机调试模式：保留预加载标记（缓存系统可用）');
                console.warn('💡 提示：如果图片仍无法显示，请在真机运行模式下访问预加载页面');
              }
            }

            return; // ⚠️ 不显示预加载引导对话框
          } else {
            // ❌ 未标记为预加载，显示预加载引导对话框
            console.log('⚠️ 图片未标记为预加载，显示预加载引导对话框');

            // 重置重试计数器
            self.setData({ imageErrorRetryCount: 0 });

            // 🔥 防抖机制：同一个分包范围只处理一次，避免连续弹窗
            if (self.imageErrorHandled[currentRangeKey]) {
              console.log('⏭️ 分包 ' + currentRangeKey + ' 引导已显示，跳过');
              return;
            }

            // 标记为已处理
            self.imageErrorHandled[currentRangeKey] = true;

            // 显示引导对话框
            // 🔧 保存定时器引用，用于页面销毁时清理
            var timer3 = setTimeout(function() {
              if (!self.data._isPageDestroyed) {
                self.preloadGuide.showPreloadGuideDialog(areaId).then(function(navigated) {
                  if (!navigated) {
                    // 用户选择稍后再说
                    console.log('⚠️ 用户选择稍后再说');
                  }
                });
              }
            }, TimingConfig.IMAGE_TIMING.ERROR_DEBOUNCE_DELAY);
            if (self.retryTimers) {
              self.retryTimers.push(timer3);
            }
          }
        }).catch(function(error) {
          console.error('❌ 检查预加载状态失败:', error);
          // 检查失败，使用默认重试策略
          self.setData({ imageErrorRetryCount: 0 });
        });

        return;
      }
    }

    // 普通图片加载失败提示（没有areaId或preloadGuide的情况）
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

  handleImageLoad: function(event) {
    var dataset = event.currentTarget.dataset || {};
    var cacheKey = dataset.cacheKey;
    var originalSrc = dataset.originalSrc;
    var displaySrc = dataset.displaySrc;

    if (!cacheKey || !originalSrc) {
      return;
    }

    // 🔥 调试日志：显示当前使用的路径和来源
    if (displaySrc) {
      if (displaySrc.indexOf('wxfile://') === 0 || displaySrc.indexOf('http://usr/') === 0) {
        console.log('📦 图片从本地缓存加载:', displaySrc);
      } else if (displaySrc.indexOf('/package') === 0) {
        console.log('📦 图片从分包加载:', displaySrc);
      } else {
        console.log('🌐 图片从网络加载:', displaySrc);
      }
    }

    // 如果已经在使用缓存路径，则无需再次缓存
    // 🔥 修复：支持开发者工具（http://usr/）和真机（wxfile://）两种协议
    if (displaySrc &&
        (displaySrc.indexOf('wxfile://') === 0 || displaySrc.indexOf('http://usr/') === 0) &&
        displaySrc !== originalSrc) {
      console.log('✅ 图片已使用本地缓存，跳过重复缓存');
      return;
    }
    var self = this;
    this.ensureImageCached(cacheKey, originalSrc).then(function(cachedPath) {
      if (cachedPath) {
        self.updateCachedSrcInData(cacheKey, cachedPath);
        console.log('✅ 图片缓存成功，下次将从本地加载:', cachedPath);
      }
    }).catch(function(error) {
      console.error('❌ 缓存图片失败(handleImageLoad):', error);
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

/**
 * 🔥 异步初始化图片缓存系统（2025-01-04优化）
 *
 * 性能优化：将同步文件操作改为异步，避免阻塞主线程
 *
 * @returns {Promise} 返回Promise，初始化完成后resolve
 */
pageConfig.initImageCache = function() {
  var self = this;

  // 如果已经初始化，直接返回
  if (this._imageCacheInitialized) {
    return Promise.resolve();
  }

  return new Promise(function(resolve, reject) {
    // 初始化文件系统管理器
    try {
      self.imageCacheFs = wx.getFileSystemManager();
    } catch (error) {
      console.error('❌ 初始化文件系统失败，无法启用图片缓存:', error);
      self.imageCacheFs = null;
      self.imageCacheIndex = {};
      self._imageCacheInitialized = true;
      resolve(); // 失败也继续，不阻塞页面加载
      return;
    }

    // 异步检查缓存目录是否存在
    self.imageCacheFs.access({
      path: IMAGE_CACHE_DIR,
      success: function() {
        console.log('✅ 图片缓存目录已存在');
        finishInit();
      },
      fail: function(accessError) {
        console.log('📁 图片缓存目录不存在，正在创建...');
        // 异步创建目录
        self.imageCacheFs.mkdir({
          dirPath: IMAGE_CACHE_DIR,
          recursive: true,
          success: function() {
            console.log('✅ 图片缓存目录创建成功');
            finishInit();
          },
          fail: function(mkdirError) {
            console.error('❌ 创建图片缓存目录失败:', mkdirError);
            finishInit(); // 失败也继续
          }
        });
      }
    });

    // 完成初始化
    function finishInit() {
      try {
        // 🔐 使用版本化的key（2025-01-08优化）
        var versionedKey = self.imageCacheIndexKey || VersionManager.getVersionedKey(IMAGE_CACHE_INDEX_KEY_BASE);

        // ✅ wx.getStorageSync 可以使用同步API（Storage不涉及文件I/O，性能开销小）
        self.imageCacheIndex = wx.getStorageSync(versionedKey) || {};
        self.imageCacheIndexKey = versionedKey;  // 保存版本化的key

        console.log('✅ 使用版本化缓存key:', versionedKey);
        console.log('✅ 图片缓存索引加载成功，已缓存图片数量:', Object.keys(self.imageCacheIndex).length);

        // 🔥 清理旧的错误格式缓存索引（包含完整路径的索引）
        // 修复前的索引存储了完整路径（如 http://usr/walkaround-images/xxx.png）
        // 修复后的索引只存储文件名（如 xxx.png）
        var cleanedCount = 0;
        var totalCount = Object.keys(self.imageCacheIndex).length;

        if (totalCount > 0) {
          Object.keys(self.imageCacheIndex).forEach(function(key) {
            var entry = self.imageCacheIndex[key];
            if (entry && entry.path) {
              // 检查路径是否包含目录分隔符（说明是完整路径）
              if (entry.path.indexOf('/') !== -1 || entry.path.indexOf('http://') === 0 || entry.path.indexOf('wxfile://') === 0) {
                // 提取文件名（路径的最后一部分）
                var parts = entry.path.split('/');
                var fileName = parts[parts.length - 1];

                if (fileName && fileName.endsWith('.png')) {
                  // 更新为只存储文件名
                  entry.path = fileName;
                  cleanedCount++;
                } else {
                  // 无法提取有效文件名，删除该索引
                  delete self.imageCacheIndex[key];
                  cleanedCount++;
                }
              }
            }
          });

          if (cleanedCount > 0) {
            console.log('🧹 已清理旧格式缓存索引:', cleanedCount, '/', totalCount);
            self.persistImageCacheIndex(); // 立即保存清理后的索引
          }
        }
      } catch (error) {
        console.error('❌ 读取图片缓存索引失败:', error);
        self.imageCacheIndex = {};
      }

      self._imageCacheInitialized = true;
      resolve();
    }
  });
};

pageConfig.generateImageCacheKey = function(originalSrc, areaId) {
  var baseKey = (areaId ? ('area' + areaId + '_') : '') + originalSrc;
  return baseKey.replace(/[^a-zA-Z0-9]/g, '_');
};

pageConfig.generateCacheFileName = function(cacheKey) {
  return cacheKey + '.png';
};

pageConfig.getCachedImagePath = function(cacheKey) {
  if (!cacheKey) {
    return '';
  }

  // ✅ 如果缓存系统未初始化完成，返回空字符串（自动降级到原始路径）
  if (!this._imageCacheInitialized || !this.imageCacheFs || !this.imageCacheIndex) {
    return '';
  }

  var entry = this.imageCacheIndex[cacheKey];

  if (!entry || !entry.path) {
    return '';
  }

  // 🔥 关键修复：动态拼接完整路径，确保使用正确的协议
  // entry.path 现在只存储文件名（相对路径）
  // 拼接 IMAGE_CACHE_DIR 后，wx.env.USER_DATA_PATH 会在当前环境下自动使用正确的协议
  var fullPath = IMAGE_CACHE_DIR + '/' + entry.path;

  // 🔥 设计说明：不进行文件系统验证的原因（参考audio-cache-manager.js）
  // 1. 避免同步I/O阻塞主线程（wx.accessSync 会卡顿）
  // 2. 文件完整性由 cache-health-manager.js 统一检查（每7天）
  // 3. 图片加载失败时，handleImageError 会自动触发缓存重建
  // 4. 职责分离：getCachedPath 只负责查询索引，不负责验证文件
  return fullPath;
};

pageConfig.persistImageCacheIndex = function() {
  if (!this.imageCacheIndex) return;

  try {
    // 🔐 使用版本化的key（2025-01-08优化）
    var versionedKey = this.imageCacheIndexKey || VersionManager.getVersionedKey(IMAGE_CACHE_INDEX_KEY_BASE);
    wx.setStorageSync(versionedKey, this.imageCacheIndex);
  } catch (error) {
    console.error('❌ 保存图片缓存索引失败:', error);
  }
};

pageConfig.updateCachedSrcInData = function(cacheKey, cachedPath) {
  if (!cacheKey || !cachedPath || !this.data || !this.data.detailCheckItems) {
    return;
  }

  var items = this.data.detailCheckItems;
  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  var updated = false;
  var newItems = items.map(function(item) {
    if (!item) {
      return item;
    }

    if (item.imageCacheKey === cacheKey) {
      updated = true;
      return Object.assign({}, item, {
        cachedSrc: cachedPath,
        displaySrc: cachedPath
      });
    }

    return item;
  });

  if (updated) {
    this.setData({ detailCheckItems: newItems });
  }
};

pageConfig.ensureImageCached = function(cacheKey, originalSrc) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!cacheKey || !originalSrc) {
      resolve('');
      return;
    }

    // ✅ 确保缓存系统初始化完成后再执行缓存操作
    self.initImageCache().then(function() {
      if (!self.imageCacheFs) {
        resolve('');
        return;
      }

      var existingPath = self.getCachedImagePath(cacheKey);
      if (existingPath) {
        resolve(existingPath);
        return;
      }

      if (!self.imageCachePromises) {
        self.imageCachePromises = {};
      }

      if (self.imageCachePromises[cacheKey]) {
        self.imageCachePromises[cacheKey].then(resolve).catch(reject);
        return;
      }

      self.imageCachePromises[cacheKey] = new Promise(function(innerResolve, innerReject) {
        wx.getImageInfo({
          src: originalSrc,
          success: function(res) {
            if (!res || !res.path) {
              innerResolve('');
              return;
            }

            var fileName = self.generateCacheFileName(cacheKey);
            var targetPath = IMAGE_CACHE_DIR + '/' + fileName;

            // 🔥 性能优化：移除同步文件操作，改为异步删除旧文件
            self.imageCacheFs.access({
              path: targetPath,
              success: function() {
                // 文件存在，先删除
                self.imageCacheFs.unlink({
                  filePath: targetPath,
                  success: function() {
                    console.log('✅ 已删除旧缓存文件');
                    copyImageFile();
                  },
                  fail: function(unlinkError) {
                    console.warn('⚠️ 删除旧缓存文件失败:', unlinkError);
                    copyImageFile(); // 失败也继续
                  }
                });
              },
              fail: function() {
                // 文件不存在，直接复制
                copyImageFile();
              }
            });

            function copyImageFile() {
              self.imageCacheFs.copyFile({
                srcPath: res.path,
                destPath: targetPath,
                success: function() {
                  if (!self.imageCacheIndex) {
                    self.imageCacheIndex = {};
                  }

                  // 🔥 关键修复：只存储文件名，避免协议错误
                  // 原因：wx.env.USER_DATA_PATH在开发者工具返回http://usr，真机返回wxfile://usr
                  // 解决：存储相对路径，在getCachedImagePath中动态拼接完整路径
                  self.imageCacheIndex[cacheKey] = {
                    path: fileName,  // 只存储文件名，不存储完整路径
                    timestamp: Date.now()
                  };

                  self.persistImageCacheIndex();
                  self.updateCachedSrcInData(cacheKey, targetPath);
                  console.log('✅ 已缓存图片到本地:', targetPath);
                  console.log('📝 缓存索引存储文件名:', fileName);
                  innerResolve(targetPath);
                },
                fail: function(error) {
                  console.error('❌ 缓存图片失败(copyFile):', error);
                  innerReject(error);
                }
              });
            }
          },
          fail: function(error) {
            console.error('❌ 获取图片信息失败:', error);
            innerReject(error);
          }
        });
      }).finally(function() {
        delete self.imageCachePromises[cacheKey];
      });

      self.imageCachePromises[cacheKey].then(resolve).catch(reject);
    }).catch(function(initError) {
      console.error('❌ 图片缓存系统初始化失败:', initError);
      resolve(''); // 初始化失败，降级到原始路径
    });
  });
};

/**
 * 恢复用户已经下载过的图片分包，确保离线场景也能直接使用
 * @param {Object} options 可选项
 * @param {boolean} options.forceRetry 是否强制重试之前失败的分包
 */
pageConfig.restorePreloadedPackages = function(options) {
  options = options || {};
  var forceRetry = !!options.forceRetry;

  if (!this.preloadGuide) {
    console.warn('⚠️ 预加载引导未初始化，无法恢复图片分包');
    return;
  }

  // 🔥 关键修复（2025-01-11）：优化 wx.loadSubpackage API 可用性检查
  // 版本隔离后，不同版本的预加载状态已经独立，无需清除
  if (typeof wx.loadSubpackage !== 'function') {
    // 检测具体环境，提供不同的日志提示
    if (EnvDetector.isDevTools()) {
      console.warn('⚠️ 开发者工具环境：wx.loadSubpackage 不可用，跳过图片分包恢复');
    } else {
      console.warn('⚠️ 真机调试模式：wx.loadSubpackage 不可用，依赖缓存系统');
      console.warn('💡 缓存优先策略将确保图片正常显示');
      console.warn('💡 如图片显示异常，请访问预加载引导页面');
    }

    // ✅ 修复（2025-01-11）：版本隔离后，预加载状态已独立
    // 真机调试的预加载状态使用 debug_2.x.x_flight_toolbox_walkaround_preload_status
    // 发布版本的预加载状态使用 release_2.x.x_flight_toolbox_walkaround_preload_status
    // 两者互不影响，无需清除
    return;
  }

  try {
    // 🔐 使用版本化的Storage Key（2025-01-11修复）
    var preloadStatusKey = VersionManager.getVersionedKey('flight_toolbox_walkaround_preload_status');
    var preloadStatus = wx.getStorageSync(preloadStatusKey) || {};
    var rangeKeys = Object.keys(preloadStatus);

    if (rangeKeys.length === 0) {
      return;
    }

    if (!this._restoredPackagesStatus) {
      this._restoredPackagesStatus = {};
    }

    var self = this;

    rangeKeys.forEach(function(rangeKey) {
      var status = self._restoredPackagesStatus[rangeKey];

      if (status === 'loading') {
        return;
      }

      if (status === 'success') {
        return;
      }

      if (status === 'failed' && !forceRetry) {
        return;
      }

      var mapping = self.preloadGuide.getPackageMappingByRange(rangeKey);
      if (!mapping) {
        return;
      }

      console.log('🔁 恢复已预加载图片分包: ' + mapping.packageName + ' (范围 ' + rangeKey + ')');
      self._restoredPackagesStatus[rangeKey] = 'loading';

      wx.loadSubpackage({
        name: mapping.packageName,
        success: function() {
          console.log('✅ 图片分包恢复成功: ' + mapping.packageName);
          self._restoredPackagesStatus[rangeKey] = 'success';
        },
        fail: function(err) {
          console.error('❌ 图片分包恢复失败: ' + mapping.packageName, err);
          self._restoredPackagesStatus[rangeKey] = 'failed';
        }
      });
    });
  } catch (error) {
    console.error('❌ 恢复已预加载图片分包失败:', error);
  }
};

Page(BasePage.createPage(pageConfig));


