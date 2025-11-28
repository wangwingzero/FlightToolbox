var BasePage = require('../../utils/base-page.js');
var VersionManager = require('../../utils/version-manager.js');

var pageConfig = {
  data: {
    footprintList: [],
    footprintStats: null
  },

  customOnLoad: function () {
    wx.setNavigationBarTitle({
      title: '机场足迹'
    });
    this.loadFootprints();
  },

  customOnShow: function () {
    this.loadFootprints();
  },

  loadFootprints: function () {
    var self = this;

    try {
      var checkins = [];
      var cacheKey = VersionManager.getVersionedKey('airport_checkins');
      var stored = wx.getStorageSync(cacheKey);

      if (Array.isArray(stored) && stored.length > 0) {
        checkins = stored;
      } else {
        var legacyStored = wx.getStorageSync('airport_checkins_v1') || [];
        if (Array.isArray(legacyStored) && legacyStored.length > 0) {
          checkins = legacyStored;
          try {
            wx.setStorageSync(cacheKey, legacyStored);
          } catch (migrateError) {
            console.warn('迁移旧机场打卡记录到新版本缓存失败(airport-footprint):', migrateError);
          }
        }
      }

      var count = Array.isArray(checkins) ? checkins.length : 0;
      var footprintList = [];
      var footprintStats = null;

      if (Array.isArray(checkins) && checkins.length > 0) {
        var getLastVisitTs = function (item) {
          if (item && item.lastVisitDate) {
            try {
              var parts = item.lastVisitDate.split('-');
              if (parts.length === 3) {
                var y = parseInt(parts[0], 10) || 0;
                var m = parseInt(parts[1], 10) || 1;
                var d = parseInt(parts[2], 10) || 1;
                return new Date(y, m - 1, d).getTime();
              }
            } catch (e) {}
          }
          return item && item.firstVisitTimestamp ? item.firstVisitTimestamp : 0;
        };

        footprintList = checkins
          .slice()
          .sort(function (a, b) {
            var ta = getLastVisitTs(a);
            var tb = getLastVisitTs(b);
            return tb - ta;
          })
          .map(function (item) {
            var icao = item && item.icao ? item.icao : '';
            var iata = item && item.iata ? item.iata : '';
            var name = item && item.shortName ? item.shortName : icao || iata || '';
            var country = item && item.country ? item.country : '';
            var ts = item && item.firstVisitTimestamp ? item.firstVisitTimestamp : 0;
            var dateText = '';
            if (ts && ts > 0) {
              var d = new Date(ts);
              var year = d.getFullYear();
              var month = d.getMonth() + 1;
              var day = d.getDate();
              var mm = month < 10 ? '0' + month : '' + month;
              var dd = day < 10 ? '0' + day : '' + day;
              dateText = year + '-' + mm + '-' + dd;
            }
            return {
              icao: icao,
              iata: iata,
              name: name,
              country: country,
              dateText: dateText,
              visitCount:
                item && typeof item.visitCount === 'number' && item.visitCount > 0
                  ? item.visitCount
                  : 1
            };
          });

        var timestamps = checkins
          .map(function (item) {
            return item && item.firstVisitTimestamp ? item.firstVisitTimestamp : 0;
          })
          .filter(function (v) {
            return v > 0;
          });

        var firstDateText = '';
        var lastDateText = '';
        if (timestamps.length > 0) {
          var minTs = Math.min.apply(null, timestamps);
          var maxTs = Math.max.apply(null, timestamps);
          var formatDate = function (ts) {
            var d = new Date(ts);
            var year = d.getFullYear();
            var month = d.getMonth() + 1;
            var day = d.getDate();
            var mm = month < 10 ? '0' + month : '' + month;
            var dd = day < 10 ? '0' + day : '' + day;
            return year + '-' + mm + '-' + dd;
          };
          firstDateText = formatDate(minTs);
          lastDateText = formatDate(maxTs);
        }

        footprintStats = {
          totalCount: count,
          firstDateText: firstDateText,
          lastDateText: lastDateText
        };
      }

      var updateData = {
        footprintList: footprintList,
        footprintStats: footprintStats
      };

      if (typeof self.safeSetData === 'function') {
        self.safeSetData(updateData);
      } else {
        self.setData(updateData);
      }

      if (!count) {
        wx.showToast({
          title: '还没有机场打卡记录',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.warn('读取机场打卡记录失败(airport-footprint):', error);
      var resetData = {
        footprintList: [],
        footprintStats: null
      };
      if (typeof self.safeSetData === 'function') {
        self.safeSetData(resetData);
      } else {
        self.setData(resetData);
      }
      wx.showToast({
        title: '读取打卡记录失败',
        icon: 'none'
      });
    }
  }
};

Page(BasePage.createPage(pageConfig));
