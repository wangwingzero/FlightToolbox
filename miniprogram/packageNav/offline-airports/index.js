var BasePage = require('../../utils/base-page.js');
var AudioDataProvider = require('../../utils/audio-data-provider.js');
var OfflineAudioManager = require('../offline-audio-manager.js');

var pageConfig = {
  data: {
    airports: [],
    selectedAirportIds: [],
    selectedAirportMap: {},
    offlineStatusMap: {},
    audioStats: {
      totalCount: 0,
      totalSize: 0,
      totalSizeMB: '0.00',
      maxSizeMB: '0.00'
    },
    downloadProgress: {
      done: 0,
      total: 0,
      percent: 0
    },
    downloading: false,
    selectAll: false
  },

  customOnLoad: function() {
    this.initAirports();
  },

  customOnShow: function() {
    this.refreshAudioStats();
    this.refreshOfflineStatus();
  },

  initAirports: function() {
    try {
      var airports = AudioDataProvider.getAllAirports() || [];
      if (this.safeSetData) {
        this.safeSetData({ airports: airports });
      } else {
        this.setData({ airports: airports });
      }
      this.refreshOfflineStatus();
      this.refreshAudioStats();
    } catch (e) {
      console.error('加载机场列表失败', e);
    }
  },

  refreshAudioStats: function() {
    try {
      var stats = OfflineAudioManager.getStats();
      if (this.safeSetData) {
        this.safeSetData({ audioStats: stats });
      } else {
        this.setData({ audioStats: stats });
      }
    } catch (e) {
      console.error('获取音频缓存统计失败', e);
    }
  },

  refreshOfflineStatus: function() {
    try {
      var map = OfflineAudioManager.getAllAirportStatusMap() || {};
      if (this.safeSetData) {
        this.safeSetData({ offlineStatusMap: map });
      } else {
        this.setData({ offlineStatusMap: map });
      }
    } catch (e) {
      console.error('获取机场离线状态失败', e);
    }
  },

  onToggleAirport: function(e) {
    var airportId = e.currentTarget.dataset.airportId;
    if (!airportId) {
      return;
    }
    var selected = this.data.selectedAirportIds ? this.data.selectedAirportIds.slice() : [];
    var index = selected.indexOf(airportId);
    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(airportId);
    }
    this.updateSelection(selected);
  },

  onToggleSelectAll: function() {
    var selectAll = !this.data.selectAll;
    var selected = [];
    if (selectAll) {
      var list = this.data.airports || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].id) {
          selected.push(list[i].id);
        }
      }
    }
    this.updateSelection(selected);
  },

  updateSelection: function(selected) {
    var map = {};
    for (var i = 0; i < selected.length; i++) {
      map[selected[i]] = true;
    }
    var all = this.data.airports || [];
    var selectAll = selected.length > 0 && selected.length === all.length;
    var data = {
      selectedAirportIds: selected,
      selectedAirportMap: map,
      selectAll: selectAll
    };
    if (this.safeSetData) {
      this.safeSetData(data);
    } else {
      this.setData(data);
    }
  },

  onStartDownloadTap: function() {
    if (this.data.downloading) {
      return;
    }
    var self = this;
    var selected = this.data.selectedAirportIds || [];
    if (!selected.length) {
      wx.showToast({
        title: '请先选择机场',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '离线机场录音',
      content: '将下载所选机场的陆空通话录音并缓存在本地，建议在网络良好时执行。',
      success: function(res) {
        if (!res.confirm) {
          return;
        }

        var initData = {
          downloading: true,
          downloadProgress: {
            done: 0,
            total: 0,
            percent: 0
          }
        };

        if (self.safeSetData) {
          self.safeSetData(initData);
        } else {
          self.setData(initData);
        }

        OfflineAudioManager.downloadAirportsOffline({
          airportIds: selected,
          onProgress: function(info) {
            var progress = {
              done: info.done,
              total: info.total,
              percent: info.percent
            };
            if (self.safeSetData) {
              self.safeSetData({ downloadProgress: progress });
            } else {
              self.setData({ downloadProgress: progress });
            }
          },
          onMessage: function(msg) {
            console.log('[offline-airports]', msg);
          }
        })
          .then(function(result) {
            if (result && result.total > 0 && result.failed === 0) {
              wx.showToast({
                title: '所有选中机场已离线',
                icon: 'success'
              });
            } else if (result && result.success > 0) {
              wx.showToast({
                title: '部分录音离线完成',
                icon: 'none'
              });
            } else {
              wx.showToast({
                title: '离线失败，请稍后重试',
                icon: 'none'
              });
            }
            self.refreshAudioStats();
            self.refreshOfflineStatus();
          })
          .catch(function(err) {
            console.error('机场录音离线失败', err);
            wx.showToast({
              title: '离线失败，请稍后重试',
              icon: 'none'
            });
          })
          .finally(function() {
            if (self.safeSetData) {
              self.safeSetData({ downloading: false });
            } else {
              self.setData({ downloading: false });
            }
          });
      }
    });
  },

  onClearAudioCacheTap: function() {
    var self = this;
    wx.showModal({
      title: '清空录音缓存',
      content: '将删除所有机场录音的本地缓存，不影响在线使用。',
      success: function(res) {
        if (!res.confirm) {
          return;
        }

        OfflineAudioManager.clearAll()
          .then(function() {
            wx.showToast({
              title: '已清空录音缓存',
              icon: 'success'
            });
            self.refreshAudioStats();
            self.refreshOfflineStatus();
          })
          .catch(function(err) {
            console.error('清空录音缓存失败', err);
            wx.showToast({
              title: '清理失败，请稍后重试',
              icon: 'none'
            });
          });
      }
    });
  }
};

Page(BasePage.createPage(pageConfig));
