/**
 * 机场搜索管理器模块
 * 
 * 提供机场数据管理和搜索功能，包括：
 * - 机场数据异步加载
 * - 智能机场搜索（ICAO、IATA、中文名称）
 * - 附近机场计算和排序
 * - 追踪机场设置和更新
 * - 三机场显示逻辑
 * 
 * 设计原则：
 * - 异步操作通过回调处理
 * - 状态通过回调更新主页面
 * - 支持多种搜索模式
 * - UI交互封装
 */

var AirportManager = {
  /**
   * 创建机场管理器实例
   * @param {Object} config 配置参数
   * @returns {Object} 管理器实例
   */
  create: function(config) {
    var manager = {
      // 内部状态
      airportsData: null,
      calculatorRef: null, // flight-calculator实例引用
      
      /**
       * 初始化管理器
       * @param {Object} page 页面实例
       * @param {Object} callbacks 回调函数集合
       * @param {Object} calculator flight-calculator实例
       */
      init: function(page, callbacks, calculator) {
        manager.pageRef = page;
        manager.callbacks = callbacks || {};
        manager.calculatorRef = calculator;
      },
      
      /**
       * 加载机场数据（异步）
       */
      loadAirportsData: function() {
        var self = manager;
        
        // 使用异步require加载跨分包数据
        require('../../../packageC/airportdata.js', function(module) {
          self.airportsData = module;
          console.log('机场数据加载成功，共', self.airportsData.length, '个机场');
          
          // 通知主页面数据加载完成
          if (self.callbacks.onAirportsLoaded) {
            self.callbacks.onAirportsLoaded(self.airportsData);
          }
          
        }, function(error) {
          console.error('加载机场数据失败:', error);
          if (self.callbacks.onLoadError) {
            self.callbacks.onLoadError(error);
          }
          
          // 显示错误提示
          wx.showToast({
            title: '机场数据加载失败',
            icon: 'none',
            duration: 2000
          });
        });
      },
      
      /**
       * 更新附近机场列表
       * @param {Number} currentLat 当前纬度
       * @param {Number} currentLon 当前经度
       * @param {Number} maxRange 最大范围（海里）
       * @returns {Array} 附近机场列表
       */
      updateNearbyAirports: function(currentLat, currentLon, maxRange) {
        if (!manager.airportsData || !currentLat || !currentLon) {
          return [];
        }
        
        var nearbyAirports = [];
        
        // 计算所有机场的距离和方位
        for (var i = 0; i < manager.airportsData.length; i++) {
          var airport = manager.airportsData[i];
          var distance = manager.calculatorRef.calculateDistanceNM(
            currentLat, currentLon,
            airport.Latitude, airport.Longitude
          );
          
          // 只保留在显示范围内的机场
          if (distance <= maxRange * 1.2) { // 留20%余量
            var bearing = manager.calculatorRef.calculateBearing(
              currentLat, currentLon,
              airport.Latitude, airport.Longitude
            );
            
            nearbyAirports.push({
              ICAOCode: airport.ICAOCode,
              IATACode: airport.IATACode,
              EnglishName: airport.EnglishName,
              ShortName: airport.ShortName,
              Latitude: airport.Latitude,
              Longitude: airport.Longitude,
              Elevation: airport.Elevation,
              distance: distance,
              bearing: Math.round(bearing)
            });
          }
        }
        
        // 按距离排序
        nearbyAirports.sort(function(a, b) {
          return a.distance - b.distance;
        });
        
        // 限制数量（最多20个）
        var limitedAirports = nearbyAirports.slice(0, 20);
        
        // 通知主页面更新
        if (manager.callbacks.onNearbyAirportsUpdate) {
          manager.callbacks.onNearbyAirportsUpdate(limitedAirports);
        }
        
        return limitedAirports;
      },
      
      /**
       * 智能机场搜索（支持ICAO、IATA代码和中文名称）
       * @param {String} query 搜索查询
       * @returns {Array} 搜索结果
       */
      findAirportsByQuery: function(query) {
        try {
          if (!manager.airportsData || !Array.isArray(manager.airportsData)) {
            console.error('机场数据格式错误或未加载');
            return [];
          }
          
          var results = [];
          var upperQuery = query.toUpperCase();
          
          // 1. 优先匹配ICAO代码（精确匹配）
          for (var i = 0; i < manager.airportsData.length; i++) {
            var item = manager.airportsData[i];
            if (item.ICAOCode && item.ICAOCode.toUpperCase() === upperQuery) {
              results.push(manager.formatAirportData(item));
              return results; // ICAO精确匹配时直接返回
            }
          }
          
          // 2. 匹配IATA代码
          for (var i = 0; i < manager.airportsData.length; i++) {
            var item = manager.airportsData[i];
            if (item.IATACode && item.IATACode.toUpperCase() === upperQuery) {
              results.push(manager.formatAirportData(item));
            }
          }
          
          // 3. 匹配中文名称（模糊匹配）
          for (var i = 0; i < manager.airportsData.length; i++) {
            var item = manager.airportsData[i];
            if (item.ShortName && item.ShortName.indexOf(query) !== -1) {
              var exists = results.some(function(r) { return r.ICAOCode === item.ICAOCode; });
              if (!exists) {
                results.push(manager.formatAirportData(item));
              }
            }
          }
          
          // 4. 匹配英文名称
          if (results.length < 10) {
            for (var i = 0; i < manager.airportsData.length; i++) {
              var item = manager.airportsData[i];
              if (item.EnglishName && item.EnglishName.toUpperCase().indexOf(upperQuery) !== -1) {
                var exists = results.some(function(r) { return r.ICAOCode === item.ICAOCode; });
                if (!exists && results.length < 20) {
                  results.push(manager.formatAirportData(item));
                }
              }
            }
          }
          
          return results;
        } catch (error) {
          console.error('机场搜索失败:', error);
          return [];
        }
      },
      
      /**
       * 搜索并追踪机场
       * @param {String} airportCode 机场代码
       * @param {Number} currentLat 当前纬度
       * @param {Number} currentLon 当前经度
       */
      searchAndTrackAirport: function(airportCode, currentLat, currentLon) {
        if (!manager.airportsData) {
          wx.showToast({
            title: '机场数据未加载',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        
        // 使用智能搜索查找机场
        var airports = manager.findAirportsByQuery(airportCode);
        
        if (airports.length === 0) {
          wx.showToast({
            title: '未找到机场: ' + airportCode,
            icon: 'none',
            duration: 2000
          });
          return;
        } else if (airports.length === 1) {
          // 找到唯一匹配的机场
          var foundAirport = airports[0];
          manager.setTrackedAirport(foundAirport, currentLat, currentLon);
        } else {
          // 多个匹配结果，显示选择弹窗
          manager.showAirportSelectionDialog(airports, airportCode, currentLat, currentLon);
        }
      },
      
      /**
       * 设置追踪机场
       * @param {Object} foundAirport 机场数据
       * @param {Number} currentLat 当前纬度
       * @param {Number} currentLon 当前经度
       */
      setTrackedAirport: function(foundAirport, currentLat, currentLon) {
        // 计算当前位置到目标机场的距离和方位
        if (currentLat && currentLon) {
          var distance = manager.calculatorRef.calculateDistanceNM(
            currentLat, currentLon,
            foundAirport.Latitude, foundAirport.Longitude
          );
          
          var bearing = manager.calculatorRef.calculateBearing(
            currentLat, currentLon,
            foundAirport.Latitude, foundAirport.Longitude
          );
          
          var trackedAirport = {
            ICAOCode: foundAirport.ICAOCode,
            ShortName: foundAirport.ShortName,
            distance: distance.toFixed(1),
            bearing: Math.round(bearing)
          };
          
          // 通知主页面更新追踪机场
          if (manager.callbacks.onTrackedAirportChange) {
            manager.callbacks.onTrackedAirportChange(trackedAirport);
          }
          
          wx.showToast({
            title: '已追踪: ' + foundAirport.ICAOCode,
            icon: 'success',
            duration: 1500
          });
        } else {
          wx.showToast({
            title: '位置信息不可用',
            icon: 'none',
            duration: 2000
          });
        }
      },
      
      /**
       * 更新追踪机场信息（在位置更新时调用）
       * @param {String} airportCode 机场代码
       * @param {Number} currentLat 当前纬度
       * @param {Number} currentLon 当前经度
       */
      updateTrackedAirport: function(airportCode, currentLat, currentLon) {
        if (!airportCode || !currentLat || !currentLon || !manager.airportsData) {
          return;
        }
        
        // 根据机场代码重新搜索机场信息
        var foundAirport = null;
        for (var i = 0; i < manager.airportsData.length; i++) {
          var airport = manager.airportsData[i];
          if (airport.ICAOCode === airportCode) {
            foundAirport = airport;
            break;
          }
        }
        
        if (foundAirport) {
          var distance = manager.calculatorRef.calculateDistanceNM(
            currentLat, currentLon,
            foundAirport.Latitude, foundAirport.Longitude
          );
          
          var bearing = manager.calculatorRef.calculateBearing(
            currentLat, currentLon,
            foundAirport.Latitude, foundAirport.Longitude
          );
          
          var updatedAirport = {
            ICAOCode: foundAirport.ICAOCode,
            ShortName: foundAirport.ShortName || foundAirport.EnglishName,
            distance: distance.toFixed(1),
            bearing: Math.round(bearing)
          };
          
          // 通知主页面更新
          if (manager.callbacks.onTrackedAirportChange) {
            manager.callbacks.onTrackedAirportChange(updatedAirport);
          }
        }
      },
      
      /**
       * 更新三个机场显示逻辑
       * @param {Array} nearbyAirports 附近机场列表
       * @param {Object} trackedAirport 追踪的机场
       * @returns {Object} {leftAirport, centerAirport, rightAirport, leftLabel, rightLabel}
       */
      updateThreeAirportsDisplay: function(nearbyAirports, trackedAirport) {
        var result = {
          leftAirport: null,
          centerAirport: null,
          rightAirport: null,
          leftAirportLabel: '最近机场',
          rightAirportLabel: '次近机场'
        };
        
        if (!nearbyAirports || nearbyAirports.length === 0) {
          result.centerAirport = trackedAirport;
          return result;
        }
        
        var nearest = nearbyAirports[0];
        var secondNearest = nearbyAirports.length > 1 ? nearbyAirports[1] : null;
        var thirdNearest = nearbyAirports.length > 2 ? nearbyAirports[2] : null;
        
        // 检查用户指定的机场是否是最近或次近机场
        var userIsNearest = trackedAirport && nearest && 
                           trackedAirport.ICAOCode === nearest.ICAOCode;
        var userIsSecondNearest = trackedAirport && secondNearest && 
                                 trackedAirport.ICAOCode === secondNearest.ICAOCode;
        
        if (!trackedAirport) {
          // 没有用户指定机场：左侧最近机场、中间空、右侧次近机场
          result.leftAirport = manager.formatAirportData(nearest);
          result.rightAirport = secondNearest ? manager.formatAirportData(secondNearest) : null;
        } else if (userIsNearest) {
          // 用户指定了最近机场：左侧次近机场、中间用户指定机场、右侧次次近机场
          result.leftAirport = secondNearest ? manager.formatAirportData(secondNearest) : null;
          result.centerAirport = trackedAirport;
          result.rightAirport = thirdNearest ? manager.formatAirportData(thirdNearest) : null;
          result.leftAirportLabel = '次近机场';
          result.rightAirportLabel = '第三近机场';
        } else if (userIsSecondNearest) {
          // 用户指定了次近机场：左侧最近机场、中间用户指定机场、右侧次次近机场
          result.leftAirport = manager.formatAirportData(nearest);
          result.centerAirport = trackedAirport;
          result.rightAirport = thirdNearest ? manager.formatAirportData(thirdNearest) : null;
          result.leftAirportLabel = '最近机场';
          result.rightAirportLabel = '第三近机场';
        } else {
          // 用户指定了其他机场：左侧最近机场、中间用户指定机场、右侧次近机场
          result.leftAirport = manager.formatAirportData(nearest);
          result.centerAirport = trackedAirport;
          result.rightAirport = secondNearest ? manager.formatAirportData(secondNearest) : null;
        }
        
        return result;
      },
      
      /**
       * 格式化机场数据
       * @param {Object} airport 原始机场数据
       * @returns {Object} 格式化后的机场数据
       */
      formatAirportData: function(airport) {
        if (!airport) return null;
        
        return {
          ICAOCode: airport.ICAOCode,
          IATACode: airport.IATACode || '',
          ShortName: airport.ShortName || airport.EnglishName || '',
          CountryName: airport.CountryName || '',
          Latitude: airport.Latitude,
          Longitude: airport.Longitude,
          distance: airport.distance ? airport.distance.toFixed(1) : undefined,
          bearing: airport.bearing
        };
      },
      
      /**
       * 显示机场选择弹窗
       * @param {Array} airports 机场列表
       * @param {String} query 搜索查询
       * @param {Number} currentLat 当前纬度
       * @param {Number} currentLon 当前经度
       */
      showAirportSelectionDialog: function(airports, query, currentLat, currentLon) {
        if (!airports || airports.length === 0) return;
        
        console.log('准备显示机场选择弹窗，找到 ' + airports.length + ' 个机场');
        
        // ActionSheet限制：超过6个选项可能无法显示，需要限制数量
        var displayAirports = airports.slice(0, 6);
        
        var actionItems = [];
        for (var i = 0; i < displayAirports.length; i++) {
          var airport = displayAirports[i];
          var displayName = airport.ShortName + ' (' + airport.ICAOCode + ')';
          if (airport.IATACode) {
            displayName += '/' + airport.IATACode;
          }
          actionItems.push(displayName);
        }
        
        var self = manager;
        wx.showActionSheet({
          itemList: actionItems,
          success: function(res) {
            var selectedAirport = displayAirports[res.tapIndex];
            self.setTrackedAirport(selectedAirport, currentLat, currentLon);
            console.log('用户选择机场:', selectedAirport.ShortName, '(' + selectedAirport.ICAOCode + ')');
          },
          fail: function(err) {
            console.log('用户取消选择机场');
            
            // ActionSheet失败时的备用方案：自动选择第一个
            if (displayAirports.length > 0) {
              console.log('ActionSheet失败，自动选择第一个机场作为备用方案');
              var firstAirport = displayAirports[0];
              self.setTrackedAirport(firstAirport, currentLat, currentLon);
              wx.showToast({
                title: '已选择: ' + firstAirport.ShortName,
                icon: 'success',
                duration: 2000
              });
            }
          }
        });
      },
      
      /**
       * 清除追踪机场
       */
      clearTrackedAirport: function() {
        if (manager.callbacks.onTrackedAirportChange) {
          manager.callbacks.onTrackedAirportChange(null);
        }
      },
      
      /**
       * 获取机场数据状态
       * @returns {Object} {loaded: Boolean, count: Number}
       */
      getDataStatus: function() {
        return {
          loaded: !!manager.airportsData,
          count: manager.airportsData ? manager.airportsData.length : 0
        };
      },
      
      /**
       * 销毁管理器
       */
      destroy: function() {
        manager.airportsData = null;
        manager.pageRef = null;
        manager.callbacks = null;
        manager.calculatorRef = null;
      }
    };
    
    return manager;
  }
};

module.exports = AirportManager;