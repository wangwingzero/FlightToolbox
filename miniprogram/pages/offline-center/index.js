var BasePage = require('../../utils/base-page.js');
var OfflineWalkaroundManager = require('../../utils/offline-walkaround-manager.js');
var OfflineAudioManager = require('../../utils/offline-audio-manager.js');
var AudioDataProvider = require('../../utils/audio-data-provider.js');

var pageConfig = {
  data: {
    walkaroundStats: {
      totalCount: 0,
      totalSizeMB: '0.00',
      maxSizeMB: '0',
      totalSize: 0
    },
    walkaroundProgress: {
      done: 0,
      total: 0,
      percent: 0
    },
    walkaroundLoading: false,
    audioStats: {
      totalCount: 0,
      totalSizeMB: '0.00',
      maxSizeMB: '0.00',
      totalSize: 0
    },
    audioProgress: {
      done: 0,
      total: 0,
      percent: 0
    },
    audioLoading: false
  },

  customOnShow: function() {
    this.refreshWalkaroundStats();
    this.refreshAudioStats();
  },

  refreshWalkaroundStats: function() {
    try {
      var stats = OfflineWalkaroundManager.getStats();
      if (!stats) {
        stats = {
          totalCount: 0,
          totalSizeMB: '0.00',
          maxSizeMB: '0',
          totalSize: 0
        };
      }
      if (this.safeSetData) {
        this.safeSetData({ walkaroundStats: stats });
      } else {
        this.setData({ walkaroundStats: stats });
      }
    } catch (e) {
      console.error('获取绕机缓存统计失败', e);
    }
  },

  refreshAudioStats: function() {
    try {
      var stats = OfflineAudioManager.getStats();
      if (!stats) {
        stats = {
          totalCount: 0,
          totalSizeMB: '0.00',
          maxSizeMB: '0.00',
          totalSize: 0
        };
      }
      if (this.safeSetData) {
        this.safeSetData({ audioStats: stats });
      } else {
        this.setData({ audioStats: stats });
      }
    } catch (e) {
      console.error('获取航线录音缓存统计失败', e);
    }
  },

  onWalkaroundOfflineTap: function() {
    if (this.data.walkaroundLoading) {
      return;
    }

    var self = this;
    wx.showModal({
      title: '一键离线绕机检查',
      content: '将下载绕机检查相关图片并缓存到本地，建议在网络良好时执行，注意流量消耗。',
      success: function(res) {
        if (!res.confirm) {
          return;
        }

        var initData = {
          walkaroundLoading: true,
          walkaroundProgress: {
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

        OfflineWalkaroundManager.startFullOffline({
          onProgress: function(info) {
            var percent = info.total ? Math.round((info.done * 100) / info.total) : 0;
            var progress = {
              done: info.done,
              total: info.total,
              percent: percent
            };
            if (self.safeSetData) {
              self.safeSetData({ walkaroundProgress: progress });
            } else {
              self.setData({ walkaroundProgress: progress });
            }
          }
        })
          .then(function() {
            wx.showToast({
              title: '绕机离线完成',
              icon: 'success'
            });
            self.refreshWalkaroundStats();
          })
          .catch(function(err) {
            console.error('绕机离线失败', err);
            wx.showToast({
              title: '离线失败，请稍后重试',
              icon: 'none'
            });
          })
          .finally(function() {
            if (self.safeSetData) {
              self.safeSetData({ walkaroundLoading: false });
            } else {
              self.setData({ walkaroundLoading: false });
            }
          });
      }
    });
  },

  onAudioOfflineTap: function() {
    if (this.data.audioLoading) {
      return;
    }

    var allAirports = [];
    try {
      allAirports = AudioDataProvider.getAllAirports() || [];
    } catch (e) {
      console.error('获取机场列表失败', e);
    }

    if (!allAirports.length) {
      wx.showToast({
        title: '暂无可离线的机场录音',
        icon: 'none'
      });
      return;
    }

    var airportIds = allAirports
      .filter(function(item) { return item && item.id; })
      .map(function(item) { return item.id; });

    if (!airportIds.length) {
      wx.showToast({
        title: '暂无可离线的机场录音',
        icon: 'none'
      });
      return;
    }

    var self = this;
    wx.showModal({
      title: '一键离线航线录音',
      content: '将下载所有支持的机场陆空通话录音并缓存在本地，建议在网络良好时执行，注意流量消耗。',
      success: function(res) {
        if (!res.confirm) {
          return;
        }

        var initData = {
          audioLoading: true,
          audioProgress: {
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
          airportIds: airportIds,
          onProgress: function(info) {
            var progress = {
              done: info.done,
              total: info.total,
              percent: info.percent
            };
            if (self.safeSetData) {
              self.safeSetData({ audioProgress: progress });
            } else {
              self.setData({ audioProgress: progress });
            }
          },
          onMessage: function(msg) {
            console.log('[offline-center audio]', msg);
          }
        })
          .then(function(result) {
            if (result && result.total > 0 && result.failed === 0) {
              wx.showToast({
                title: '航线录音离线完成',
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
          })
          .catch(function(err) {
            console.error('航线录音离线失败', err);
            wx.showToast({
              title: '离线失败，请稍后重试',
              icon: 'none'
            });
          })
          .finally(function() {
            if (self.safeSetData) {
              self.safeSetData({ audioLoading: false });
            } else {
              self.setData({ audioLoading: false });
            }
          });
      }
    });
  },

};

Page(BasePage.createPage(pageConfig));
