var BasePage = require('../../utils/base-page.js');
var AppConfig = require('../../utils/app-config.js');
var OfflineWalkaroundManager = require('../../utils/offline-walkaround-manager.js');
var OfflineAudioManager = require('../../utils/offline-audio-manager.js');
var AudioDataProvider = require('../../utils/audio-data-provider.js');
var VersionManager = require('../../utils/version-manager.js');

var pageConfig = {
  data: {
    // 原生模板广告开关（从app-config读取）
    nativeAdEnabled: false,

    // 无广告状态
    isAdFree: false,

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
    // 读取原生模板广告开关状态
    this.setData({
      nativeAdEnabled: AppConfig.ad.nativeTemplateAdEnabled || false
    });

    // 检查无广告状态
    this.checkAdFreeStatus();

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
          .then(function(result) {
            wx.showToast({
              title: '绕机离线完成',
              icon: 'success'
            });
            self.refreshWalkaroundStats();

            // 如果航线录音也已经全部离线完成，则标记当前版本的离线预加载完成
            try {
              var versionedDoneKey = VersionManager && typeof VersionManager.getVersionedKey === 'function'
                ? VersionManager.getVersionedKey('offlineAssetsPreloaded_v2')
                : '';

              if (versionedDoneKey) {
                var audioStats = OfflineAudioManager.getStats && OfflineAudioManager.getStats();
                if (audioStats && audioStats.totalCount > 0 && audioStats.totalSize > 0) {
                  wx.setStorageSync(versionedDoneKey, true);
                }
              }
            } catch (e) {
              console.warn('写入离线预加载完成标记失败(绕机离线完成后)', e);
            }
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

              // 航线录音全部离线成功后，再检查绕机图片是否也已经离线完成
              try {
                var versionedDoneKey = VersionManager && typeof VersionManager.getVersionedKey === 'function'
                  ? VersionManager.getVersionedKey('offlineAssetsPreloaded_v2')
                  : '';

                if (versionedDoneKey) {
                  var walkStats = OfflineWalkaroundManager.getStats && OfflineWalkaroundManager.getStats();
                  if (walkStats && walkStats.totalCount > 0 && walkStats.totalSize > 0) {
                    wx.setStorageSync(versionedDoneKey, true);
                  }
                }
              } catch (e) {
                console.warn('写入离线预加载完成标记失败(航线录音离线完成后)', e);
              }
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

  // 检查无广告状态
  checkAdFreeStatus: function() {
    var adFreeManager = require('../../utils/ad-free-manager.js');
    try {
      var isAdFree = adFreeManager.isAdFreeActive();
      if (this.safeSetData) {
        this.safeSetData({ isAdFree: isAdFree });
      } else {
        this.setData({ isAdFree: isAdFree });
      }
      console.log('📅 无广告状态:', isAdFree ? '有效期内' : '显示广告');
    } catch (error) {
      console.error('❌ 检查无广告状态失败:', error);
    }
  }

};

Page(BasePage.createPage(pageConfig));
