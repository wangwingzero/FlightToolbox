var BasePage = require('../../../utils/base-page.js');
var Hotspot = require('../../utils/hotspot.js');
var Areas = require('../../data/a330/areas.js');
var Components = require('../../data/a330/components.js');
var CheckItems = require('../../data/a330/checkitems.js');
var DataHelpers = require('../../utils/data-helpers.js');
var AppConfig = require('../../../utils/app-config.js');
var VersionManager = require('../../../utils/version-manager.js');
var CacheSelfHealing = require('./cache-self-healing.js');
var systemInfoHelper = require('../../../utils/system-info-helper.js');
var WalkaroundImageLibraryVersion = require('../../../utils/walkaround-image-library-version.js');
var R2Config = require('../../../utils/r2-config.js');

// 配置常量
var CONFIG = {
  CANVAS_IMAGE_RATIO: 1840 / 1380,  // 图片宽高比 = 1.333
  CANVAS_IMAGE_RATIO_TOLERANCE: 0.08,  // 主图宽高比容差（用于识别异常缓存）
  CANVAS_IMAGE_MIN_BYTES: 80 * 1024,  // 主图最小文件大小（用于识别半截/异常文件）

  // 🔥 区域卡片布局参数（与 WXSS 中 .area-card 保持一致）
  AREA_CARD_WIDTH_RPX: 280,          // 卡片宽度（rpx）
  AREA_CARD_MARGIN_RPX: 20           // 卡片右边距（rpx）
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
    flowImagePath: '/packageWalkaround/images/a330/flow.png',  // 主图路径（<image>标签直接渲染）
    selectedAreaId: null,
    areaList: [],
    scrollIntoViewId: '',
    scrollLeft: 0,  // 横向滚动位置（用于居中对齐）

    // 弹窗相关
    showDetailPopup: false,
    detailArea: null,
    detailCheckItems: [],
    detailComponents: [],
    scrollTop: 0,  // 检查项列表滚动位置（切换区域时重置为0）

    _isPageDestroyed: false,   // 页面销毁标记

    // 广告相关
    isAdFree: false,  // 是否已获得今日无广告（观看激励视频后1小时内隐藏广告）
    nativeAdEnabled: false,  // 原生模板广告开关（从app-config读取）
    bannerAdUnitId: AppConfig.ad.bannerAdUnitIds.bannerCard2  // 使用授权的横幅卡片2广告位
  },

  customOnLoad: function() {
    var self = this;

    // 读取分包页面广告开关状态（分包页面使用subPackageAdEnabled）
    this.setData({
      nativeAdEnabled: AppConfig.ad.subPackageAdEnabled || false
    });

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
    this.preloadFlowImage();  // R2 模式：异步预加载主图
    this.loadAreaList();
    this.checkAdFreeStatus();    // 检查无广告状态

    // 🔥 缓存系统信息和布局参数（避免重复计算）
    this.cacheSystemInfo();
  },

  customOnShow: function() {
    this.checkAdFreeStatus();    // 每次显示页面时检查无广告状态
    // 重置页面销毁标记
    this.setData({ _isPageDestroyed: false });

    // 🔥 检查窗口大小是否变化（iPad/平板设备可能旋转屏幕）
    this.refreshSystemInfoIfNeeded();
  },

  /**
   * 🔥 缓存系统信息和布局参数（避免重复计算）
   * 性能优化：将 rpx 到 px 的转换结果缓存，避免每次滚动都重新计算
   */
  cacheSystemInfo: function() {
    try {
      var __wi = systemInfoHelper.getWindowInfo() || {};
      this._lastWindowWidth = __wi.windowWidth;
      this._rpxToPx = (__wi.windowWidth || 750) / 750;
      this._cardWidthPx = (CONFIG.AREA_CARD_WIDTH_RPX + CONFIG.AREA_CARD_MARGIN_RPX) * this._rpxToPx;
      console.log('✅ 系统信息已缓存 - 屏幕宽度:', __wi.windowWidth, 'px, 卡片宽度:', Math.round(this._cardWidthPx), 'px');
    } catch (error) {
      console.error('❌ 缓存系统信息失败:', error);
      // 降级方案：使用默认值（iPhone 6/7/8标准）
      this._lastWindowWidth = 375;
      this._rpxToPx = 0.5;
      this._cardWidthPx = 150;
    }
  },

  /**
   * 🔥 检查窗口大小是否变化并更新缓存（处理屏幕旋转等场景）
   * 适用于iPad或平板设备横竖屏切换
   */
  refreshSystemInfoIfNeeded: function() {
    if (!this._lastWindowWidth) {
      this.cacheSystemInfo();
      return;
    }

    try {
      var __wi = systemInfoHelper.getWindowInfo() || {};
      if (__wi.windowWidth !== this._lastWindowWidth) {
        console.log('🔄 检测到窗口宽度变化:', this._lastWindowWidth, '->', __wi.windowWidth);
        this.cacheSystemInfo();
      }
    } catch (error) {
      console.error('❌ 检测窗口变化失败:', error);
    }
  },

  customOnUnload: function() {
    console.log('📄 绕机检查页面销毁');

    // 标记页面已销毁，防止异步回调访问已销毁的页面
    this.setData({ _isPageDestroyed: true });
  },

  /**
   * 预加载主图（R2 模式）
   * R2 启用时异步加载远端主图，通过 setData 更新 <image> src
   */
  preloadFlowImage: function() {
    var self = this;
    // 主图默认使用本地分包
    if (!R2Config.useR2ForImages || !R2Config.useR2ForFlowImage) {
      return;
    }

    var flowCachePath = IMAGE_CACHE_DIR + '/flow_a330.png';
    var fs = wx.getFileSystemManager();

    // 1. 优先尝试缓存主图（增加完整性校验，避免半截图）
    var useCachedFlowImage = function() {
      return new Promise(function(resolve) {
        try {
          fs.accessSync(flowCachePath);
        } catch (error) {
          resolve(false);
          return;
        }

        self.validateFlowImage(flowCachePath, '持久化缓存').then(function(isValid) {
          if (isValid) {
            self.setData({ flowImagePath: flowCachePath });
            console.log('📦 主图从持久化缓存加载');
            resolve(true);
            return;
          }

          console.warn('⚠️ 主图缓存已损坏或异常，删除后重新下载:', flowCachePath);
          fs.unlink({
            filePath: flowCachePath,
            complete: function() {
              resolve(false);
            }
          });
        }).catch(function(error) {
          console.warn('⚠️ 校验主图缓存失败，改为重新下载:', error);
          resolve(false);
        });
      });
    };

    // 2. 缓存不可用时下载主图（下载后也校验）
    var downloadFlowImage = function() {
      var r2Url = R2Config.getImageUrl('a330/flow.png');
      console.log('🔄 从R2下载主图:', r2Url);
      wx.downloadFile({
        url: r2Url,
        success: function(res) {
          if (res.statusCode !== 200 || !res.tempFilePath) {
            console.warn('⚠️ R2主图下载返回异常状态:', res && res.statusCode);
            return;
          }

          self.validateFlowImage(res.tempFilePath, 'R2下载临时文件').then(function(isValid) {
            if (!isValid) {
              console.warn('⚠️ R2主图文件异常，回退本地主图');
              return;
            }

            console.log('✅ R2主图下载并校验成功');
            self.setData({ flowImagePath: res.tempFilePath });

            // 异步持久化
            fs.copyFile({
              srcPath: res.tempFilePath,
              destPath: flowCachePath,
              success: function() {
                console.log('✅ 主图已持久化缓存:', flowCachePath);
                self.setData({ flowImagePath: flowCachePath });
              },
              fail: function(err) {
                console.warn('⚠️ 主图持久化失败:', err);
              }
            });
          }).catch(function(error) {
            console.warn('⚠️ R2主图校验失败，回退本地图:', error);
          });
        },
        fail: function(err) {
          console.warn('R2主图下载失败，使用本地:', err);
        }
      });
    };

    useCachedFlowImage().then(function(cacheHit) {
      if (!cacheHit) {
        downloadFlowImage();
      }
    }).catch(function(error) {
      console.warn('⚠️ 主图缓存流程异常，直接下载:', error);
      downloadFlowImage();
    });
  },

  /**
   * 校验主图文件有效性（防止半截图/错误响应文件进入缓存）
   * 规则：
   * 1) 必须可解码为图片；
   * 2) 宽高比必须接近预期；
   * 3) 文件大小不能过小（排除明显损坏/截断）。
   */
  validateFlowImage: function(imagePath, sourceLabel) {
    var self = this;
    var fs = wx.getFileSystemManager();
    var label = sourceLabel || '未知来源';

    return new Promise(function(resolve) {
      wx.getImageInfo({
        src: imagePath,
        success: function(info) {
          var width = (info && info.width) || 0;
          var height = (info && info.height) || 0;
          if (!self.isValidFlowImageRatio(width, height)) {
            console.warn('⚠️ 主图比例异常(' + label + '):', width + 'x' + height);
            resolve(false);
            return;
          }

          fs.stat({
            path: imagePath,
            success: function(statRes) {
              var fileSize = statRes && statRes.stats ? statRes.stats.size : 0;
              if (fileSize && fileSize < CONFIG.CANVAS_IMAGE_MIN_BYTES) {
                console.warn('⚠️ 主图文件过小(' + label + '):', fileSize, 'bytes');
                resolve(false);
                return;
              }
              resolve(true);
            },
            fail: function() {
              // 无法读取文件大小时，仅依赖图片解码和比例校验结果
              resolve(true);
            }
          });
        },
        fail: function(err) {
          console.warn('⚠️ 主图解码失败(' + label + '):', err);
          resolve(false);
        }
      });
    });
  },

  isValidFlowImageRatio: function(width, height) {
    if (!width || !height) {
      return false;
    }
    var ratio = height / width;
    return Math.abs(ratio - CONFIG.CANVAS_IMAGE_RATIO) <= CONFIG.CANVAS_IMAGE_RATIO_TOLERANCE;
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
      this.setData({ areaList: processedAreas });
    } catch (error) {
      this.handleError(error, '加载区域数据失败');
    }
  },

  /**
   * 主图点击处理（<image> 标签版本）
   * 通过 boundingClientRect 获取图片位置，计算归一化坐标后检测热点
   */
  handleImageTap: function(event) {
    if (!this.hotspotManager) {
      return;
    }

    var self = this;
    var detail = event.detail || (event.touches && event.touches[0]);
    if (!detail || typeof detail.x !== 'number' || typeof detail.y !== 'number') {
      return;
    }

    wx.createSelectorQuery().in(this)
      .select('.flow-image')
      .boundingClientRect(function(rect) {
        if (!rect || !rect.width || !rect.height) {
          return;
        }

        // detail.x/y 是视口坐标，rect.left/top 也是视口坐标，相减得到图片内相对坐标
        var normalized = Hotspot.normalizePoint(
          { x: detail.x - rect.left, y: detail.y - rect.top },
          rect.width,
          rect.height
        );

        if (!normalized) {
          return;
        }

        var hit = self.hotspotManager.hitTest(normalized);
        if (hit && hit.areaId) {
          self.selectAreaAndShowPopup(hit.areaId);
        }
      })
      .exec();
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

    // 立即弹出详情（不再等待分包加载）
    this.showAreaDetails(area, areaId);

    // 底部区域列表在后台滚动并高亮目标卡片（居中对齐）
    setTimeout(function() {
      self.scrollToAreaCenter(areaId);
    }, 0);
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
      // 🔥 关键技巧：先设置为非零值，再设置为0，强制scroll-view重新滚动到顶部
      self.setData({
        selectedAreaId: area.id,
        showDetailPopup: true,
        detailArea: area,
        detailCheckItems: checkItems,
        detailComponents: components,
        scrollTop: 1  // 先设置为非零值
      }, function() {
        // setData回调中立即重置为0，强制触发滚动
        self.setData({ scrollTop: 0 });
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
        scrollTop: 1
      }, function() {
        self.setData({ scrollTop: 0 });
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
      selectedAreaId: null
    });
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

    // R2 模式下图片从远程加载，失败时提示检查网络
    console.warn('图片加载失败，路径:', src);

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

  /**
   * 🔥 计算并设置横向滚动位置，让目标卡片居中显示
   * 性能优化：使用缓存的系统信息，避免重复计算
   * @param {Number} areaId - 区域ID
   */
  scrollToAreaCenter: function(areaId) {
    var self = this;

    // 🔥 确保系统信息已缓存
    if (!this._rpxToPx || !this._cardWidthPx) {
      console.warn('⚠️ 系统信息未缓存，立即初始化');
      this.cacheSystemInfo();
    }

    var query = wx.createSelectorQuery().in(this);

    // 只需要获取滚动容器的宽度（卡片位置通过索引计算，无需DOM查询）
    query.select('.areas-scroll').boundingClientRect();

    query.exec(function(res) {
      if (!res || !res[0]) {
        console.warn('❌ 无法获取滚动容器信息');
        return;
      }

      var containerInfo = res[0];

      // 计算当前卡片在列表中的索引
      var cardIndex = self.data.areaList.findIndex(function(item) {
        return item.id === areaId;
      });

      if (cardIndex === -1) {
        console.warn('❌ 未找到区域ID:', areaId);
        return;
      }

      // 🔥 使用缓存的卡片宽度（已包含margin）
      var cardWidth = self._cardWidthPx;

      // 计算目标滚动位置：让卡片居中
      // scrollLeft = 卡片索引 × 卡片宽度 - (容器宽度 - 卡片宽度 + margin) / 2
      var marginRightPx = CONFIG.AREA_CARD_MARGIN_RPX * self._rpxToPx;
      var scrollLeft = cardIndex * cardWidth - (containerInfo.width - cardWidth + marginRightPx) / 2;

      // 确保scrollLeft不会小于0
      scrollLeft = Math.max(0, scrollLeft);

      console.log('🎯 滚动到区域', areaId, '居中位置, scrollLeft:', Math.round(scrollLeft), 'px');

      self.setData({
        scrollLeft: scrollLeft,
        selectedAreaId: areaId  // 同时设置选中状态，用于高亮
      });
    });
  },

  handleAreaCardTap: function(event) {
    var areaId = Number(event.currentTarget.dataset.areaid);
    // 点击卡片时滚动居中并高亮
    this.scrollToAreaCenter(areaId);
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
  var libraryVersion = (WalkaroundImageLibraryVersion && WalkaroundImageLibraryVersion.WALKAROUND_IMAGE_LIBRARY_VERSION) || 'v1';
  var baseKey = (areaId ? ('area' + areaId + '_') : '') + originalSrc;
  var safeBaseKey = baseKey.replace(/[^a-zA-Z0-9]/g, '_');
  return libraryVersion + '_' + safeBaseKey;
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

Page(BasePage.createPage(pageConfig));
