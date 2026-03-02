var BasePage = require('../../../utils/base-page.js');
var Areas = require('../../data/a330/areas.js');
var Components = require('../../data/a330/components.js');
var CheckItems = require('../../data/a330/checkitems.js');
var ManualIndex = require('../../data/a330/manual-index.js');
var DataHelpers = require('../../utils/data-helpers.js');

function navigateTo(path, params, handleError) {
  var url = path;
  if (params) {
    var query = [];
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.push(key + '=' + encodeURIComponent(params[key]));
      }
    }
    if (query.length) {
      url += '?' + query.join('&');
    }
  }

  wx.navigateTo({
    url: url,
    fail: function(error) {
      if (typeof handleError === 'function') {
        handleError(error, '页面跳转失败');
      }
    }
  });
}

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
    area: null,
    componentList: [],
    checkItems: [],
    manualInfo: null,
    generalNotes: [],
    modelId: 'a330',
    areaId: ''  // 保存区域ID，用于分享
  },

  customOnLoad: function(options) {
    var areaId = (options && options.areaId) || '';
    if (options && options.modelId) {
      this.setData({ modelId: options.modelId });
    }
    this.setData({ areaId: areaId });  // 保存areaId用于分享
    markPackageReady();
    this.setData({
      generalNotes: (ManualIndex.general && ManualIndex.general.notes_zh) || []
    });
    this.loadAreaData(areaId);
  },

  loadAreaData: function(areaId) {
    var id = Number(areaId || 0);
    var self = this;

    this.loadDataWithLoading(function() {
      return new Promise(function(resolve, reject) {
        try {
          var area = Areas.areas.find(function(item) { return item.id === id; });
          if (!area) {
            return reject(new Error('无效的区域编号'));
          }

          var componentList = Components.components.filter(function(component) {
            return area.components.indexOf(component.id) !== -1;
          });

          var filteredItems = CheckItems.checkItems.filter(function(item) {
            return item.areaId === id;
          });
          var checkItems = DataHelpers.mapCheckItemsWithComponents(filteredItems, ComponentCache);

          var manualInfo = null;
          if (ManualIndex.areaManuals && area.code && ManualIndex.areaManuals[area.code]) {
            manualInfo = ManualIndex.areaManuals[area.code];
          }

          resolve({
            area: area,
            componentList: componentList,
            checkItems: checkItems,
            manualInfo: manualInfo
          });
        } catch (error) {
          reject(error);
        }
      });
    }, {
      context: '加载区域数据'
    }).then(function(result) {
      self.setData({
        area: result.area,
        componentList: result.componentList,
        checkItems: result.checkItems,
        manualInfo: result.manualInfo || null
      });
    }).catch(function(error) {
      self.handleError(error, '加载区域数据失败');
    });
  },

  handleOpenEquipment: function(event) {
    var componentId = event.currentTarget.dataset.id;
    if (!componentId) {
      return;
    }

    var params = {
      componentId: componentId
    };

    if (this.data.area && this.data.area.id) {
      params.areaId = this.data.area.id;
    }

    var component = ComponentCache[componentId];
    if (component && component.equipmentLocation) {
      if (component.equipmentLocation.top) {
        params.view = 'top';
      } else if (component.equipmentLocation.side) {
        params.view = 'side';
      }
    }

    if (!params.view) {
      params.view = 'top';
    }

    navigateTo('/packageWalkaround/pages/equipment/index', params, this.handleError);
  },

  handleAddToList: function() {
    var areaId = this.data.area ? this.data.area.id : null;
    if (!areaId) {
      return;
    }
    var recent = wx.getStorageSync('walkaround_recent_areas') || [];
    recent = [areaId].concat(recent.filter(function(id) { return id !== areaId; }));
    wx.setStorageSync('walkaround_recent_areas', recent.slice(0, 10));
    wx.showToast({ title: '已加入临时清单', icon: 'success' });
  },

  // 自定义分享到朋友（确保包含areaId参数）
  onShareAppMessage: function() {
    var area = this.data.area;
    var areaId = this.data.areaId;
    var modelId = this.data.modelId;
    var title = area && area.name_zh ? area.name_zh : '绕机检查区域';
    
    var path = '/packageWalkaround/pages/area-detail/index?areaId=' + encodeURIComponent(areaId);
    if (modelId && modelId !== 'a330') {
      path += '&modelId=' + encodeURIComponent(modelId);
    }
    
    return {
      title: '飞行工具箱 - A330绕机检查·' + title,
      path: path
    };
  },

  // 自定义分享到朋友圈
  onShareTimeline: function() {
    var area = this.data.area;
    var title = area && area.name_zh ? area.name_zh : '绕机检查区域';
    
    return {
      title: '飞行工具箱 - A330绕机检查·' + title,
      query: 'areaId=' + this.data.areaId + '&modelId=' + this.data.modelId
    };
  },

  // 图片预览
  handlePreviewImage: function(event) {
    var src = event.currentTarget.dataset.src;
    if (!src) {
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 使用 getImageInfo 获取图片信息（会触发分包加载并返回可用路径）
    wx.getImageInfo({
      src: src,
      success: function(res) {
        wx.hideLoading();
        // 使用返回的路径进行预览（可能是临时路径）
        wx.previewImage({
          current: res.path,
          urls: [res.path]
        });
      },
      fail: function(err) {
        wx.hideLoading();
        console.error('❌ 获取图片信息失败:', err);
        console.error('图片路径:', src);
        wx.showToast({
          title: '图片加载失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
};

Page(BasePage.createPage(pageConfig));

